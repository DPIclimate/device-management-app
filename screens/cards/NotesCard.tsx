import React, { useState, useContext } from "react";
import { Grid } from "react-native-easy-grid";
import {
    Text,
    View,
    TouchableHighlight,
    TextInput,
    StyleSheet,
    Alert,
    InputAccessoryView,
    Platform,
} from "react-native";
import { GlobalContext } from "../../shared/context/GlobalContext";
import { ManageDeviceContext } from "../../shared/context/ManageDeviceContext";
import { TouchableOpacity } from "react-native-gesture-handler";
import { DeviceUpdateRequest } from "../../shared/types/CustomTypes";
import { TTN_Actions, update_ttn_device } from "../../shared/functions/InterfaceTTN";
import { save_update_to_storage } from "../../shared/functions/ManageLocStorage";
import { LoadingComponent } from "../../shared/components/LoadingComponent";
import Card from "../../shared/components/Card";

export function NotesCard():JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);
    const { device_state, set_device_state, device_comm_data } = useContext(ManageDeviceContext);

    const [text, setText] = useState<string>(device_state.description);

    const inputAccessoryViewID = "notesKeyboard";
    const [isLoading, setLoadingState] = useState<boolean>(false)

    const saveNotes = async():Promise<void> => {
        console.log("Saving notes")
        setLoadingState(true)

        const updateRequest:DeviceUpdateRequest={
            device:{
                ...device_state,
                description:text
            },
            action:TTN_Actions.UPDATE_DESCRIPTION
        }

        set_device_state(updateRequest.device)

        if(state.network_status){
            const {status, status_text} = await update_ttn_device(updateRequest, state.application_server, state.ttn_auth_token)

                if (status==0){
                    Alert.alert("Update Failed", `An error occurred while trying to update the notes. Error: ${status_text}`)
                }
                else if (status!=200){
                    Alert.alert("Update Failed", `HTTP error occurred, Error: ${status_text}`)
                }
        }
        else{
            console.log("Saving to storage")
            save_update_to_storage(updateRequest)  
        }
        setLoadingState(false)
    };
    return (
        <>
            <Card>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text style={styles.cardTitle}>Notes</Text>
                    <TouchableHighlight
                        disabled={isLoading}
                        underlayColor="#DDDDDD"
                        onPress={() => saveNotes()}
                    >
                        {isLoading ?
                            <LoadingComponent isLoading={isLoading}/>
                            :
                            <Text style={{color:'#007AFF'}}>Save</Text>
                        }
                    </TouchableHighlight>
                </View>

                <View style={styles.separatorLine} />

                <Grid>
                    <TextInput
                        style={styles.input}
                        onSubmitEditing={saveNotes}
                        inputAccessoryViewID={inputAccessoryViewID}
                        multiline={true}
                        value={text}
                        placeholder="Add some text here"
                        onChangeText={setText}
                        autoCorrect={true}
                        autoCapitalize="sentences"
                    />
                </Grid>
            </Card>

            {Platform.OS == "ios" && (
                <InputAccessoryView nativeID={inputAccessoryViewID}>
                    <View style={{ alignItems: "flex-end", justifyContent: "center", paddingRight: 10, height: 35, backgroundColor: "white" }}>
                        <TouchableOpacity onPress={() => saveNotes()}>
                            <Text style={{color:'#007AFF'}}>dismiss</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    separatorLine: {
        width: "80%",
        height: 2,
        backgroundColor: "#128cde",
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    updateLocationImg: {
        width: 35,
        height: 35,
        padding: 10,
    },
    cardTitle: {
        fontWeight: "bold",
        fontSize: 17,
        marginTop: 10,
        marginBottom: 10,
    },
    input:{
        width:'100%'
    }
});
