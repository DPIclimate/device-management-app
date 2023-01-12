import React, { useLayoutEffect, useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions, Pressable, Alert } from "react-native";
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
import NavOptionsCard from "../shared/components/atoms/NavOptionsCard";
import IconGrid from "../shared/components/organisms/IconGrid";
import SettingsIcon from "../shared/components/atoms/SettingsIcon";

export default function HomeScreen({ route, navigation }): JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);

    const orientation = useOrientation();
    const insets = useSafeAreaInsets();

    const [welcomeVisible, setWelcVisible] = useState(false);

    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <SettingsIcon navigation={navigation}/>,
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
                if (device.attributes?.uid.toLocaleUpperCase() == route.params.uid.toLocaleUpperCase() || device.ids.device_id == route.params.device_id){
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

    return (
        <>
            <ImageBackground
                source={orientation == "PORTRAIT" ? require("../assets/background.png") : require("../assets/background-horizontal.png")}
                resizeMode="cover"
                style={{ width: "100%" }}
            >
                <ScrollView style={globalStyles.scrollView}>
                    <IconGrid navigation={navigation}/>
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
