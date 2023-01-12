import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { ManageDeviceContext } from "../../context/ManageDeviceContext";
import { Device, DeviceUpdateRequest } from "../../types/CustomTypes";
import { TTN_Actions, update_ttn_device } from "../../functions/InterfaceTTN";
import { save_update_to_storage } from "../../functions/ManageLocStorage";
import { GlobalContext } from "../../context/GlobalContext";
import { LoadingComponent } from "../atoms/LoadingComponent";
import Button from "../atoms/Button";

export default function ChangeDetailsComponent({ set_overlay_vis }):JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);
    const { device_state, set_device_state, device_comm_data } = useContext(ManageDeviceContext);

    const [device_name, set_device_name] = useState<string>(device_state.name);
    const [device_uid, set_device_uid] = useState<string>(device_state.uid);
    const [isLoading, set_isloading] = useState<boolean>(false);
    
    const handleSubmit = async () => {

        if (!/^[A-Z0-9]{6}$/.test(device_uid.toUpperCase())){
            Alert.alert("Invalid UID", "UID must be 6 alphanumeric characters")
            return
        }
        set_isloading(true);
        const updateRequests: DeviceUpdateRequest[] = [];

        if (device_name != device_state.name) {
            //Update device name
            const updateRequest: DeviceUpdateRequest = {
                device: {
                    ...device_state,
                    name: device_name,
                },
                action: TTN_Actions.UPDATE_NAME,
            };
            updateRequests.push(updateRequest);
        }

        if (device_uid != device_state.uid) {
            //Update uid
            const updateRequest: DeviceUpdateRequest = {
                device: {
                    ...device_state,
                    uid: device_uid.toUpperCase(),
                },
                action: TTN_Actions.UPDATE_UID,
            };
            updateRequests.push(updateRequest);
        }

        if (state.network_status) {
            for (const request of updateRequests) {
                console.log("updatign")
                try {
                    await update_ttn_device(request, state.application_server, state.ttn_auth_token);
                    console.log("Successfully updated")
                } catch (error) {
                    Alert.alert("Error", `An error occurred while updating ${request.action}. Reason: ${error}`);
                    set_isloading(false)
                    return;
                }
            }
        } else {
            for (const request of updateRequests) {
                console.log("Saving to storage");
                try {
                    await save_update_to_storage(request);
                } catch (error) {
                    Alert.alert("Error", `An error occurred while trying to save update ${request.action}. Reason: ${error}`);
                    set_isloading(false)
                    return;
                }
            }
            Alert.alert(
                "Saved Update",
                "There was no internet connection to perform this action, this update has instead been saved to the queue. Try again when you have an internet connection"
            );
        }

        //Update device state so changes are reflected immediately
        const dev_state:Device={
         ...device_state,
         name:updateRequests[0]?updateRequests[0].device.name:device_state.name,
         uid:updateRequests[1]?updateRequests[1].device.uid:device_state.uid   
        }
        set_device_state(dev_state)
        set_overlay_vis(false);
    };

    return (
        <>
            <Text style={styles.title}>Edit Device Details</Text>
            <View style={styles.row}>
                <Text>Device Name: </Text>
                <TextInput autoCapitalize="none" autoCorrect={false} style={styles.input} value={device_name} onChangeText={set_device_name} />
            </View>
            <View style={styles.row}>
                <Text>Device UID: </Text>
                <TextInput autoCapitalize="none" autoCorrect={false} style={styles.input} value={device_uid} onChangeText={set_device_uid} />
            </View>

            {isLoading ? (
                <LoadingComponent isLoading={isLoading} />
            ) : (
                <Button onPress={handleSubmit} text={"Update"}/>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    title: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 20,
    },
    content: {
        alignItems: "center",
        backgroundColor: "white",
        width: "90%",
        padding: 20,
        borderRadius: 20,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#cccc",
        shadowOpacity: 0.3,
        borderWidth: 1,
        borderColor: "grey",
    },
    row: {
        flexDirection: "row",
        margin: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        borderBottomColor: "#128cde",
        borderBottomWidth: 2,
        width: 200,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        margin: 5,
        padding: 5,
    },
    submit: {
        backgroundColor: "#128cde",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        margin: 5,
        marginTop: 20,
        width: "100%",
        borderRadius: 25,
    },
    submit_text: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
    },
});
