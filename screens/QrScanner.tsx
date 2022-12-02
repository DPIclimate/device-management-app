import React, { useState, useEffect, useContext } from "react";
import { Text, View, StyleSheet, Image, Alert } from "react-native";
import { BarCodeScanner, PermissionStatus } from "expo-barcode-scanner";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "../styles";
import * as Linking from "expo-linking";
import { Device, QRCode } from "../shared/types/CustomTypes";
import { GlobalContext } from "../shared/context/GlobalContext";
import { APIDeviceResponse } from "../shared/types/APIResponseTypes";
import { ConvertToDevice } from "../shared/functions/ConvertFromAPI";

export default function Scanner({ route, navigation }) {
  
  const [state, dispatch] = useContext(GlobalContext);

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        //Requests camera permission from user
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === PermissionStatus.GRANTED);
        })();
    }, []);

    const handleBarCodeScanned = async ({ type, data }): Promise<void> => {
        setScanned(true);

        const qr_code: QRCode = parseData(data);
        const device: Device = await make_device(qr_code);

        if (device){
          navigation.navigate('ManageDeviceScreen', {device:device})
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setScanned(false);
    };
    const parseData = (data: string): QRCode => {
        //If data is a link that can be opened, it is a version 2 qr code

        const url_parsed: Linking.ParsedURL = Linking.parse(data);
        if (url_parsed?.queryParams.link) {
            /*
            Is version 2 qr code
            */

            const qr_code: QRCode = {
                application_id: url_parsed.queryParams.appid,
                device_uid: url_parsed.queryParams.uid,
            };
            return qr_code;
        } else {
            try {
                const device_data = JSON.parse(data);
                const qr_code: QRCode = {
                    application_id: device_data.application_id,
                    device_uid: device_data.dev_uid,
                };
                return qr_code;
            } catch (error) {
                console.log(error);
            }
        }
        Alert.alert("Invalid QR Code");
    };

    const make_device = async(qr_code: QRCode):Promise<Device> => {

      const response=await fetch(`${state.application_server}/api/v3/applications/${qr_code.application_id}/devices?field_mask=attributes,locations,description,name`,{
        method:"GET",
        headers:{
          Authorization:state.ttn_auth_token,
          "Content-Type": "application/json"
        }
      })

      if (response.status != 200){
        console.log("Applications request failed in qr code scanner", response.status)
      }
      const devices:APIDeviceResponse[]=(await response.json()).end_devices

      for (const device of devices){
        if (device.attributes?.uid == qr_code.device_uid){
          const to_return=ConvertToDevice(device, false)
          return to_return
        }
      }
      Alert.alert("Not found", `Could not find a device in ${qr_code.application_id} with uid ${qr_code.device_uid}`)
    };

    if (hasPermission === null) {
        return (
            <SafeAreaView style={globalStyles.screen}>
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>Please enable camera access</Text>
            </SafeAreaView>
        );
    }
    if (hasPermission === false) {
        return (
            <SafeAreaView style={globalStyles.screen}>
                <Image style={{ width: "10%", height: "20%" }} source={require("../assets/exclamation-mark.png")} />
                <Text style={{ fontWeight: "bold", fontSize: 20, padding: 20, textAlign: "center" }}>
                    No camera access granted. To use this function please grant this app access to your camera in your phone's settings
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />

            <View style={styles.overlay}>
                <Image source={require("../assets/corners.png")} style={{ width: 300, height: 300 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
    },
    overlay: {
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 50,
    },
});
