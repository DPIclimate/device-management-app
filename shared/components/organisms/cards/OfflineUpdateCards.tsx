import React from "react";
import Card from "../../atoms/Card";
import { Text, StyleSheet, View, Image } from "react-native";
import { DeviceUpdateRequest } from "../../../types/CustomTypes";
import { TouchableOpacity } from "react-native-gesture-handler";

export const LocationUpdateCard = (props): JSX.Element => {
    const item: DeviceUpdateRequest = props.item;

    return (
        <Card>
            <Text style={styles.cardTitle}>Location Update</Text>
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.subtitle}>Device ID:</Text>
                    <Text>{item.device.id}</Text>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>New Location:</Text>
                <View style={styles.row}>
                    <Text style={{marginRight:5}}>Latitude:</Text>
                    <Text>{item.device.location.latitude}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={{marginRight:5}}>Longitude:</Text>
                    <Text>{item.device.location.longitude}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={{marginRight:5}}>Altitude:</Text>
                    <Text>{item.device.location.altitude}m</Text>
                </View>
                <View style={styles.row}>
                    <Text style={{marginRight:5}}>Accuracy:</Text>
                    <Text>{item.device.location.accuracy}m</Text>
                </View>
            </View>
        </Card>
    );
};

export const DescriptionUpdate = (props): JSX.Element => {
    const item: DeviceUpdateRequest = props.item;

    return (
        <Card>
            <Text style={styles.cardTitle}>Notes Update</Text>
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.subtitle}>Device ID:</Text>
                    <Text>{item.device.id}</Text>
                </View>
            </View>
            <View style={styles.section}>
                    <Text style={styles.subtitle}>Notes:</Text>
                    <Text>{item.device.description}</Text>
            </View>
        </Card>
    );
};
const styles = StyleSheet.create({
    cardText: {
        paddingTop: 4,
        fontSize: 14,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 15,
        fontWeight: "bold",
        marginRight: 5,
    },
    row: {
        flexDirection: "row",
    },
    section: {
        marginTop: 10,
    },
    image: {
        height: 35,
        width: 35,
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
    },
});
