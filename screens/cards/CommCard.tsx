import React, { useContext, useEffect, useState } from "react";
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, View, ScrollView, StyleSheet, Image } from "react-native";
import { formatTime } from "../../shared/functions/FormatTime";
import { ManageDeviceContext } from "../../shared/context/ManageDeviceContext";
import Card from "../../shared/components/Card";
import { LoadingComponent } from "../../shared/components/LoadingComponent";

export function CommCard():JSX.Element {

    const {device_state, set_device_state, device_comm_data} = useContext(ManageDeviceContext);

    return (
        <Card>
            <Text style={styles.cardTitle}>Communications</Text>

            <View style={styles.separatorLine} />

            <ScrollView style={{height:device_comm_data.data==0?70:200}} showsVerticalScrollIndicator={false}>
                <Grid>
                    <Row style={styles.cardRow}>
                        <Col size={1}>
                            <Text style={styles.title}>Time</Text>
                        </Col>
                        <Col size={1}>
                            <Text style={styles.title}>RSSI</Text>
                        </Col>
                        <Col size={1}>
                            <Text style={styles.title}>SNR</Text>
                        </Col>
                        <Col>
                            <Text style={styles.title}>M_Type</Text>
                        </Col>
                    </Row>
                    <LoadingComponent isLoading={device_comm_data.isLoading} />
                    {device_comm_data.data.length==0&&
                        <Text style={styles.noComms}>No communication data to display</Text>
                    }
                    {device_comm_data.data?.map((msg) => {
                        return (
                            <Row style={styles.cardRow} key={msg.time}>
                                <Col>
                                    <Text>{formatTime(msg.time).time}</Text>
                                </Col>
                                <Col>
                                    <Text>{msg.rssi}</Text>
                                </Col>
                                <Col>
                                    <Text>{msg.snr}</Text>
                                </Col>
                                <Col>
                                    <Text numberOfLines={1} adjustsFontSizeToFit>
                                        {msg.m_type}
                                    </Text>
                                </Col>
                            </Row>
                        );
                    })}
                </Grid>
            </ScrollView>
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
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    noComms: {
        alignSelf: "center",
        fontWeight: "bold",
        fontSize: 15,
        marginTop:10
    },
});
