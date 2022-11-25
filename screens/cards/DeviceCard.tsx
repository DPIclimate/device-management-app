import React, { useContext } from "react";
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, Linking, View, Image, StyleSheet, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Card, updateDevice } from "../../shared";
import { AsyncAlertPrompt } from "../../shared/AsyncAlertPrompt";
import globalStyles from "../../styles";
import { Device } from "../../shared/types/CustomTypes";
import { ManageDeviceContext } from "../../shared/context/ManageDeviceContext";

export function DeviceCard() {
    const {reducer:[device_state, device_dispatch], device_comm_data} = useContext(ManageDeviceContext);

    //Change UID
    // const handlePress = async () => {
    //     const newUID = (await AsyncAlertPrompt("Enter new UID")).toLowerCase();

    //     if (newUID.length != 6) {
    //         Alert.alert("Invalid UID", `The UID ${newUID} is of invalid length. Please make sure the UID you have entered is 6 characters long`);
    //         return;
    //     } else if (!global.ALLOWED_CHARS.test(newUID)) {
    //         Alert.alert("Invalid UID", `The UID ${newUID} contains one or more illegal character. Please try a different UID`);
    //         return;
    //     }

    //     const data = {
    //         end_device: {
    //             ids: {
    //                 device_id: device_state.devID,
    //                 application_ids: {
    //                     application_id: device_state.appID,
    //                 },
    //             },
    //             attributes: {
    //                 uid: newUID.toUpperCase(),
    //             },
    //         },
    //         field_mask: {
    //             paths: ["attributes"],
    //         },
    //     };
    //     const { success, error } = await updateDevice(data);
    //     if (success) {
    //         Alert.alert("Update Successful!");
    //         // autoSearch(true)
    //     } else {
    //         Alert.alert("An error occurred", `${error}`);
    //     }
    // };
    // const UID_FIELD = () => {
    //     if (!device_state.uid) {
    //         return (
    //             <TouchableOpacity onPress={handlePress}>
    //                 <Image source={require("../../assets/plus.png")} style={styles.image} />
    //             </TouchableOpacity>
    //         );
    //     } else {
    //         return <Text>{device_state.uid}</Text>;
    //     }
    // };

    //Mappings from key to display text
    const mappings = {
        id: "Device ID:",
        name: "Device Name:",
        applications_id: "Application ID:",
        dev_eui: "Dev EUI:",
        join_eui: "Join EUI:",
        created_at: "Created:",
        updated_at: "Updated",
        uid: "UID:",
    };

    return (
        <Card>
            <Text style={styles.cardTitle}>Device Details</Text>

            <View style={styles.separatorLine} />

            {Object.keys(device_state).map((key: string): JSX.Element => {
                if (key == "location") {
                    return;
                } else if (key == "description") {
                    return;
                } else if (key == "isFave") {
                    return;
                }
                return (
                        <Row style={styles.cardRow} key={key}>
                            <Col size={1}>
                                <Text>{mappings[key]}</Text>
                            </Col>
                            <Col size={2}>
                                <Text selectable={true}>{device_state[key] == null ? "-" : device_state[key]}</Text>
                            </Col>
                        </Row>
                );
            })}
        </Card>
    );
}

const styles = StyleSheet.create({
    cardTitle: {
        fontWeight: "bold",
        fontSize: 17,
        marginTop:10,
        marginBottom:10
    },
    separatorLine:{ 
        width: "80%", 
        height: 2, 
        backgroundColor: "#128cde", 
        alignSelf: "flex-start", 
    },
    image: {
        width: 20,
        height: 20,
    },
    cardRow: {
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
    },
});
