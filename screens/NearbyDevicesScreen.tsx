import React, { useState } from "react";
import { useWindowDimensions, Platform, StyleSheet } from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { Feather } from "@expo/vector-icons";
import { NearbyDevicesList } from "./components/NearbyDevicesList";
import { NearbyDevicesMap } from "./components/NearbyDevicesMap";
import { Device } from "../shared/types/CustomTypes";
import useGetAllDevices from "../shared/hooks/useGetAllDevices";
import { LocationResponse, useLocation } from "../shared/hooks/useLocation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function NearbyDevicesScreen({ route, navigation }): JSX.Element {
    const layout = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const { devices, isLoading, retry, error } = useGetAllDevices();
    const userLocation: LocationResponse = useLocation();

    const [index, setIndex] = useState(0);

    const [routes] = useState([
        { key: "devList", title: "" },
        { key: "devMap", title: "" },
    ]);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case "devList":
                return (
                    <NearbyDevicesList
                        userLocation={userLocation}
                        handlePress={handlePress}
                        retry={retry}
                        devices={devices.filter((dev: Device) => dev?.location)}
                        isLoading={isLoading}
                        error={error}
                    />
                );
            case "devMap":
                return (
                    <NearbyDevicesMap
                        userLocation={userLocation}
                        handlePress={handlePress}
                        retry={retry}
                        devices={devices.filter((dev: Device) => dev?.location)}
                        isLoading={isLoading}
                        error={error}
                    />
                );
            default:
                return null;
        }
    };

    const handlePress = (device: Device) => {
        navigation.navigate("ManageDeviceScreen", { device: device });
    };

    const getTabBarIcon = (props) => {
        const { route } = props;
        if (route.key === "devList") {
            return <Feather name="list" size={25} color="white" />;
        } else {
            return <Feather name="map" size={25} color="white" />;
        }
    };

    return (
        <>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                tabBarPosition={"bottom"}
                swipeEnabled={Platform.OS == "android" ? false : true}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        indicatorStyle={
                            layout.height > layout.width
                                ? styles.indicator_vertical
                                : [
                                  index==0?
                                  styles.indicator_horizontal_1
                                  :styles.indicator_horizontal_2
                                  ,
                                  {
                                    height:styles.indicator_horizontal_1.height+insets.bottom
                                  }
                                ]
                        }
                        style={
                            layout.height > layout.width ? [styles.vertical, {height:styles.vertical.height+insets.bottom}] : [styles.horizontal, { height: styles.horizontal.height + insets.bottom }]
                        }
                        renderIcon={(props) => (layout.height > layout.width ? getTabBarIcon(props) : null)}
                    />
                )}
            />
        </>
    );
}
const styles = StyleSheet.create({
    vertical: {
        height: 50,
    },
    horizontal: {
        height: 15,
        borderWidth: 1,
        borderColor: "#128cde",
        backgroundColor: "white",
    },
    indicator_vertical: {
        backgroundColor: "white",
    },
    indicator_horizontal_1: {
        backgroundColor: "#128cde",
        height: 14,
        borderTopEndRadius:50,
        borderBottomEndRadius:50
    },
    indicator_horizontal_2: {
        backgroundColor: "#128cde",
        height: 14,
        borderTopLeftRadius:50,
        borderBottomLeftRadius:50
    },
});
