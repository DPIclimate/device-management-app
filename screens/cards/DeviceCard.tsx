import React, { useContext } from "react";
import { Col, Row} from "react-native-easy-grid";
import { Text, View, StyleSheet } from "react-native";
import { ManageDeviceContext } from "../../shared/context/ManageDeviceContext";
import Card from "../../shared/components/Card";

export function DeviceCard():JSX.Element {

    const {device_state, set_device_state, device_comm_data} = useContext(ManageDeviceContext);
    //TODO enable ability to change device attributes

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

            {Object.keys(device_state)?.map((key: string): JSX.Element => {
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
                            <Text style={styles.devTitle}>{mappings[key]}</Text>
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
        marginTop: 10,
        marginBottom: 10,
    },
    separatorLine: {
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
    devTitle:{
        fontWeight:'bold',
        marginRight:10
    }
});
