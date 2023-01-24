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
import { GlobalContext } from "../../../context/GlobalContext";
import { ManageDeviceContext } from "../../../context/ManageDeviceContext";
import { TouchableOpacity } from "react-native-gesture-handler";
import { DeviceUpdateRequest } from "../../../types/CustomTypes";
import { TTN_Actions, update_ttn_device } from "../../../functions/InterfaceTTN";
import { save_update_to_storage } from "../../../functions/ManageLocStorage";
import { LoadingComponent } from "../../atoms/LoadingComponent";
import Card from "../../atoms/Card";
import MngDeviceCard from "../../molecules/MngDeviceCard";

export function NotesCard({set_scrollToEnd}):JSX.Element {
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
            try{
                await update_ttn_device(updateRequest, state.application_server, state.ttn_auth_token)
            }
            catch(error){
                Alert.alert("Error", `An error occurred while trying to save update ${updateRequest.action}. Reason: ${error}`)                 
            }
        }
        else{
            console.log("Saving to storage")
            await save_update_to_storage(updateRequest)  
        }
        setLoadingState(false)
    };
    return (
        <>
            <MngDeviceCard title="Notes" onIconPress={saveNotes} isLoading={isLoading} iconImg={require("../../../../assets/save.png")}>

                <Grid>
                    <TextInput
                        onTouchStart={() => set_scrollToEnd(true)}
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
            </MngDeviceCard>

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
    input:{
        width:'100%'
    }
});
