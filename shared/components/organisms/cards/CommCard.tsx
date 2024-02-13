import React, { useContext, useEffect, useState } from "react";
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, View, ScrollView, StyleSheet, Image, TouchableOpacity } from "react-native";
import { formatTime } from "../../../functions/FormatTime";
import { ManageDeviceContext } from "../../../context/ManageDeviceContext";
import Card from "../../atoms/Card";
import { LoadingComponent } from "../../atoms/LoadingComponent";
import MngDeviceCard from "../../molecules/MngDeviceCard";
import { CommMessage } from "../../../types/CustomTypes";
import { APICommResponse } from "../../../types/APIResponseTypes";

/**
 * Renders a communication card component.
 * @returns JSX.Element representing the communication card.
 */
export function CommCard(): JSX.Element {

    const { device_state, set_device_state, device_comm_data } = useContext(ManageDeviceContext);
    const [expanded_id, setExpanded_id] = useState<number>()

    return (
        <MngDeviceCard title="Communications">

            <ScrollView style={{ height: device_comm_data.data == 0 ? 70 : 300 }} showsVerticalScrollIndicator={false}>
                <Grid>
                    <Row style={[styles.cardRow, { paddingLeft: 10, paddingRight: 10 }]}>
                        <Col size={1}>
                            <Text style={styles.title}>Date</Text>
                        </Col>
                        <Col size={1}>
                            <Text style={styles.title}>Time</Text>
                        </Col>
                        <Col size={1}>
                            <Text style={styles.title}>RSSI</Text>
                        </Col>
                        <Col size={2}>
                            <Text style={styles.title}>Fields</Text>
                        </Col>
                        <Col size={0.5}>
                        </Col>
                    </Row>

                    <LoadingComponent isLoading={device_comm_data.isLoading} />

                    {device_comm_data.data.length == 0 &&
                        <Text style={styles.noComms}>No communication data to display</Text>
                    }
                    {device_comm_data.data.map((msg: APICommResponse, index: number) => {
                            return (
                                <TouchableOpacity key={msg.result.received_at} onPress={() => setExpanded_id(prev => prev === index ? undefined : index)}>
                                    <Card color="#f2f3f3" style={styles.card}>
                                        <>
                                            <Row style={styles.cardRow}>
                                                <Col>
                                                    <Text>{formatTime(msg.result.received_at).dayMonth}</Text>
                                                </Col>
                                                <Col>
                                                    <Text>{formatTime(msg.result.received_at).time}</Text>
                                                </Col>
                                                <Col>
                                                    <Text>{msg.result.uplink_message.rx_metadata[0].rssi}</Text>
                                                </Col>
                                                <Col size={0.5}>
                                                    {msg.result.uplink_message.decoded_payload ? (
                                                        <Text>{Object.keys(msg.result.uplink_message.decoded_payload).length}</Text>
                                                    )
                                                    :
                                                    (
                                                        <Text>0</Text>
                                                    )
                                                }
                                                </Col>
                                                <Col>
                                                    <Image source={expanded_id === index ? require("../../../../assets/arrowBlueUp.png") : require("../../../../assets/arrowBlueDown.png")} resizeMode="contain" style={styles.arrowDown} />
                                                </Col>
                                            </Row>
                                            {(expanded_id == index && msg.result.uplink_message.decoded_payload ) &&
                                                <>
                                                    {Object.keys(msg.result.uplink_message.decoded_payload).map((item, index) => {
                                                        return (
                                                            <Row key={item} style={{ marginTop: 5 }}>
                                                                <Col size={2}>
                                                                    <Text>{item}:</Text>
                                                                </Col>
                                                                <Col size={1}>
                                                                    <Text>{msg.result.uplink_message.decoded_payload[item]}</Text>
                                                                </Col>
                                                            </Row>
                                                        )
                                                    })
                                                    }
                                                </>
                                            }
                                        </>
                                    </Card>
                                </TouchableOpacity>
                            );
                    }

                    )}
                </Grid>
            </ScrollView>
        </MngDeviceCard>
    );
}
const styles = StyleSheet.create({
    cardTitle: {
        fontWeight: "bold",
        fontSize: 17,
        marginTop: 10,
        marginBottom: 10,
    },
    title: {
        fontWeight: "bold",
    },
    separatorLine: {
        width: "80%",
        height: 2,
        backgroundColor: "#128cde",
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    image: {
        width: 20,
        height: 20,
    },
    cardRow: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    noComms: {
        alignSelf: "center",
        fontWeight: "bold",
        fontSize: 15,
        marginTop: 10
    },
    card: {
        marginTop: 10
    },
    arrowDown: {
        width: 20,
        height: 20,
        alignSelf: 'flex-end',
    }
});
