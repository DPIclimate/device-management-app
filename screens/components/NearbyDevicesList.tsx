import React from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, RefreshControl } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import globalStyles from "../../styles";
import { LocationResponse, useLocation } from "../../shared/hooks/useLocation";
import { Device } from "../../shared/types/CustomTypes";
import Card from "../../shared/components/Card";

export function NearbyDevicesList({ handlePress, devices, retry, isLoading, error, userLocation }): JSX.Element {

    const { location_status, location, isLoading: location_loading, error: location_error, retry: location_retry } = userLocation as LocationResponse

    const distance_to_user = (device: Device): number => {
        if (!location || !device.location) return;
        const user_latitude = location.coords.latitude;
        const device_latitude = device.location.latitude;

        const user_longitude = location.coords.longitude;
        const device_longitude = device.location.longitude;

        // haversine formula used to calculate the distance between 2 points on the earth
        // http://www.movable-type.co.uk/scripts/latlong.html

        var R = 6371; // km - radius of the earth
        var dLat = ((device_latitude - user_latitude) * Math.PI) / 180;
        var dLon = ((device_longitude - user_longitude) * Math.PI) / 180;
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((user_latitude * Math.PI) / 180) * Math.cos((device_latitude * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Returns difference in km

        return d;
    };
    const listData = (): Device[] => {
        if (!devices) return;

        //Possibly inefficient as we may be calculating distance multiple times
        const list: Device[] = devices.sort((a, b) => distance_to_user(a) - distance_to_user(b));
        return list;
    };

    const renderItem = ({ item, index }): JSX.Element => {
        return (
            <TouchableOpacity onPress={() => handlePress(item)}>
                <Card>
                    <View style={styles.clickable}>

                    <Text style={styles.device_id} numberOfLines={1} ellipsizeMode="tail">
                        {item.name ? item.name : item.id}
                    </Text>
                    <Text style={styles.distance}>Dist: {distance_to_user(item)?.toFixed(2)}km</Text>
                    <Image source={require("../../assets/arrowBlue.png")} style={{ height: 20, width: 20 }} />
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={globalStyles.screen}>
            <FlatList
                data={listData()}
                renderItem={(item) => renderItem(item)}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading || location_loading}
                        onRefresh={() => {
                            retry();
                            location_retry();
                        }}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    clickable: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 30,
    },
    device_id: {
        flex: 1,
    },
    distance: {
        paddingRight: 10,
    },
});
