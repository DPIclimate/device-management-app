import React, { useContext, useState } from "react";
import { Col, Row } from "react-native-easy-grid";
import { Text, StyleSheet} from "react-native";
import { ManageDeviceContext } from "../../../context/ManageDeviceContext";
import ChangeDetailsComponent from "../ChangeDetailsComponenet";
import ModalView from "../../atoms/ModalView";
import MngDeviceCard from "../../molecules/MngDeviceCard";

export function DeviceCard(): JSX.Element {
    const { device_state, set_device_state, device_comm_data } = useContext(ManageDeviceContext);
    const [overlay_vis, set_overlay_vis] = useState(false);

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
        <>
            <MngDeviceCard title="Device Details" iconImg={require('../../../../assets/edit.png')} onIconPress={() => set_overlay_vis(true)}>
                <>
                    {Object.keys(device_state)?.map((key: string): JSX.Element => {
                        if (key == "location") {
                            return;
                        } else if (key == "description") {
                            return;
                        } else if (key == "isFav") {
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
                </>
            </MngDeviceCard>
            <ModalView isVisible={overlay_vis} set_isVisible={set_overlay_vis}>
                <ChangeDetailsComponent set_overlay_vis={set_overlay_vis} />
            </ModalView>
        </>
    );
}

const styles = StyleSheet.create({
    cardRow: {
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    devTitle: {
        fontWeight: "bold",
        marginRight: 10,
    },
    overlay: {
        position: "absolute",
        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
});
