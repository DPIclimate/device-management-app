import React, { useLayoutEffect, useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions, Pressable, Alert } from "react-native";
import Card from "../shared/components/Card";
import globalStyles from "../styles";
import { WelcomeScreen } from "./WelcomeScreen";
import { Overlay } from "react-native-elements";
import { Col, Row } from "react-native-easy-grid";
import { useOrientation } from "../shared/hooks/useOrientation";
import { cacheData } from "../shared/functions/cacheData";
import { GlobalContext } from "../shared/context/GlobalContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APIDeviceResponse } from "../shared/types/APIResponseTypes";
import { ConvertToDevice } from "../shared/functions/ConvertFromAPI";

//Images for Icons
const appList = require("../assets/appList.png");
const nearbyDevs = require("../assets/nearbyBlue.png");
const scanQR = require("../assets/qrCodeBlue.png");
const failedUpload = require("../assets/uploadFailedBlue.png");
const gateway = require("../assets/gateway.png");

export default function HomeScreen({ route, navigation }): JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);

    const orientation = useOrientation();
    const insets = useSafeAreaInsets();

    const [welcomeVisible, setWelcVisible] = useState(false);

    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <SettingsIcon />,
        });
    }, [navigation]);

    useEffect(() => {
        if (!state.ttn_auth_token) {
            setWelcVisible(true);
        }
    }, []);

    useEffect(() => {
        /*
            If welcome visible changes, user has logged in, attempt to start cache
        */

        async function startCache(): Promise<void> {
            if (!state.ttn_auth_token) return;

            try {
                //Cache ttn data on app load
                await cacheData(state.ttn_auth_token, state.application_server, state.communication_server, true);
            } catch (error) {
                console.log(`Caching error - ${error}`);
            }
        }
        startCache();
    }, [welcomeVisible]);

    useEffect(() => {
        /*
            If params passed to this screen, app was entered via a deep link, therefore search for device
        */

        if (route.params?.appid && route.params?.uid) {
            handleSearch();
        }
    }, [route]);

    const handleSearch = async (): Promise<void> => {
        /*
            Handle search for deep link
            If device exists take to manage screen, else take to registration screen
        */

        try {
            const response: Response = await fetch(`${state.application_server}/api/v3/applications/${route.params.appid}/devices?field_mask=attributes,locations,description,name`,{
                    method: "GET",
                    headers: {
                        Authorization: state.ttn_auth_token,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status != 200) {
                console.log("search failed in home screen", response.status);
                return
            }

            const devices:APIDeviceResponse[]=(await response.json()).end_devices
            
            for (const device of devices){
                if (device.attributes?.uid.toLocaleUpperCase() == route.params.uid.toLocaleUpperCase()){
                  const to_return=ConvertToDevice(device, false)
                  navigation.navigate("ManageDeviceScreen", {device:to_return})
                  return
                }
              }
              Alert.alert("Not found", `Could not find a device in ${route.params.appid} with uid ${route.params.uid}`)

        } catch (error) {
            console.log("Search failed in home screen", error)
        }
    };

    const SettingsIcon = (): JSX.Element => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
                <Image source={require("../assets/settingsWhite.png")} style={{ width: 25, height: 25, marginRight: 20 }} />
            </TouchableOpacity>
        );
    };

    const Icon = (props): JSX.Element => {
        return (
            <View style={{ width: 170 }}>
                <Pressable onPress={props.onPress}>
                    <Card borderRadius={20}>
                        <View style={{ justifyContent: "center", alignItems: "center", height: 130 }}>
                            <Image source={props.image} style={{ width: 60, height: 60 }} />
                            <Text style={{ paddingTop: 10, fontSize: 15, fontWeight: "bold" }}>{props.title}</Text>
                        </View>
                    </Card>
                </Pressable>
            </View>
        );
    };

    return (
        <>
            <ImageBackground
                source={orientation == "PORTRAIT" ? require("../assets/background.png") : require("../assets/background-horizontal.png")}
                resizeMode="cover"
                style={{ width: "100%" }}
            >
                <ScrollView style={globalStyles.scrollView}>
                    <View style={{ paddingTop: 20, paddingRight: 10, paddingLeft: 10 }}>
                        <Row>
                            <Col style={{ alignItems: "center" }}>
                                <Icon title={"Applications"} image={appList} onPress={() => navigation.navigate("ApplicationsScreen")} />
                            </Col>
                            <Col style={{ alignItems: "center" }}>
                                <Icon title={"Nearby Devices"} image={nearbyDevs} onPress={() => navigation.navigate("NearbyDevices")} />
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ alignItems: "center" }}>
                                <Icon
                                    title={"Scan QR Code"}
                                    image={scanQR}
                                    onPress={() => navigation.navigate("QrScanner", { screen: "ManageDeviceScreen" })}
                                />
                            </Col>
                            <Col style={{ alignItems: "center" }}>
                                <Icon title={"Queue"} image={failedUpload} onPress={() => navigation.navigate("SavedUpdatesScreen")} />
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ alignItems: "center" }}>
                                <Icon title={"Gateways"} image={gateway} onPress={() => navigation.navigate("Gateways")} />
                            </Col>
                            <Col />
                        </Row>
                    </View>
                </ScrollView>
            </ImageBackground>
            <Overlay
                isVisible={welcomeVisible}
                overlayStyle={{
                    borderRadius: 10,
                    width: Dimensions.get("window").width - insets.left - insets.right - 20,
                    height: Dimensions.get("window").height - insets.bottom - insets.top - 20,
                    backgroundColor: "#f3f2f3",
                }}
            >
                <WelcomeScreen visible={setWelcVisible} />
            </Overlay>
        </>
    );
}

const styles = StyleSheet.create({});
