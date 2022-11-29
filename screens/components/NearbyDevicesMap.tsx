import React, { useRef, useState } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_DEFAULT, Callout, MAP_TYPES, Region, LatLng, Camera } from "react-native-maps";
import { useLocation } from "../../shared/hooks/useLocation";
import { Device } from "../../shared/types/CustomTypes";

export function NearbyDevicesMap({ handlePress, devices, retry, isLoading, error }): JSX.Element {
    const { location_status, location, isLoading: location_loading, error: location_error, retry: location_retry } = useLocation();

    const mapRef = useRef();
    const locationUpdate = () => {
        const camera: Camera = {
            center: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            },
            heading: 0,
            pitch: 0,
            zoom: 500,
            altitude: 700,
        };
        mapRef.current?.animateCamera(camera);
    };
    return (
        <>
            <MapView
                userLocationPriority="high"
                showsCompass={false}
                ref={mapRef}
                style={styles.map}
                mapType={MAP_TYPES.SATELLITE}
                provider={PROVIDER_DEFAULT}
                showsUserLocation={true}
                loadingEnabled={true}
            >
                {devices?.map((device: Device): JSX.Element => {
                    return (
                        <Marker
                            key={device.id}
                            onCalloutPress={() => handlePress(device)}
                            coordinate={{ latitude: device.location.latitude, longitude: device.location.longitude }}
                        >
                            <Callout>
                                <View style={{ flexDirection: "row" }}>
                                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                                        <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontWeight: "bold", fontSize: 15 }}>
                                            {device.id}
                                        </Text>
                                        {device.name && (
                                            <Text style={{ fontStyle: "italic", fontSize: 12, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
                                                {device.name}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>
            <View style={styles.imageView}>
                <TouchableOpacity style={styles.locationButton} onPress={() => locationUpdate()}>
                    <Image source={require("../../assets/location.png")} style={styles.locationImg} />
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF",
    },
    container: {
        height: 300,
        width: 300,
        backgroundColor: "tomato",
    },
    map: {
        flex: 1,
    },
    locationImg: {
        width: 20,
        height: 20,
    },
    imageView: {
        position: "absolute",
        top: 5,
        right: 5,
    },
    locationButton:{
        borderRadius: 50,
        width: 60,
        height: 60,
        backgroundColor: "#128cde",
        alignItems: "center",
        justifyContent: "center",
    }
});
