import React, { useState, useRef, useContext, useEffect } from "react";
import { View, StyleSheet, Image, Text, SafeAreaView, Dimensions, ImageSourcePropType, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import Card from "../shared/components/atoms/Card";
import { FlatList, ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import { useFetch } from "../shared/hooks/useFetch";
import { GlobalContext } from "../shared/context/GlobalContext";
import { APIApplicationsResponse, APIDeviceResponse } from "../shared/types/APIResponseTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ImageButton from "../shared/components/atoms/ImageButton";
import globalStyles from "../styles";
import Button from "../shared/components/atoms/Button";
import ModalView from "../shared/components/atoms/ModalView";
import DevList from "../shared/components/organisms/DevList";
import { Application, Device, DeviceUpdateRequest } from "../shared/types/CustomTypes";
import { TTN_Actions, update_ttn_device } from "../shared/functions/InterfaceTTN";
import { save_update_to_storage } from "../shared/functions/ManageLocStorage";
import AppList from "../shared/components/organisms/AppList";

const QRScreen = () => {
    const [state, dispatch] = useContext(GlobalContext);

    const [appId, setAppId] = useState<string>(null);
    const [uid, setUid] = useState<string>(
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .toUpperCase()
    );
    const [overlay_vis, set_overlay_vis] = useState<boolean>(false);

    const viewRef = useRef<View>(null);
    const insets = useSafeAreaInsets();

    const ALBUM_TITLE = "Device Management App";

    const generateUID = async () => {
        setUid(
            Math.floor(Math.random() * 16777215)
                .toString(16)
                .toUpperCase()
        );
    };

    const save = async () => {
        //Update uid
        // const updateRequest: DeviceUpdateRequest = {
        //     device: {
        //         ...device,
        //         uid: uid,
        //     },
        //     action: TTN_Actions.UPDATE_UID,
        // };

        // if (state.network_status) {
        //     try {
        //         await update_ttn_device(updateRequest, state.application_server, state.ttn_auth_token);
        //         console.log("Successfully updated");
        //     } catch (error) {
        //         Alert.alert("Error", `An error occurred while updating ${updateRequest.action}. Reason: ${error}`);
        //         return;
        //     }
        // } else {
        //     console.log("Saving to storage");
        //     try {
        //         await save_update_to_storage(updateRequest);
        //     } catch (error) {
        //         Alert.alert("Error", `An error occurred while trying to save update ${updateRequest.action}. Reason: ${error}`);
        //         return;
        //     }
        //     Alert.alert(
        //         "Saved Update",
        //         "There was no internet connection to perform this action, this update has instead been saved to the queue. Try again when you have an internet connection"
        //     );
        // }
        try {
            await viewRef.current.capture().then(async (uri) => {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status == MediaLibrary.PermissionStatus.GRANTED) {
                    const asset = await MediaLibrary.createAssetAsync(uri);
                    const existing_album = await MediaLibrary.getAlbumAsync(ALBUM_TITLE);
                    const album_ref = existing_album ? existing_album : await MediaLibrary.createAlbumAsync(ALBUM_TITLE);
                    await MediaLibrary.addAssetsToAlbumAsync([asset], album_ref, false);
                }
            });

            Alert.alert("Saved", "QR code has been saved to your camera roll");
        } catch (error) {
            console.log(error);
        }

        set_overlay_vis(false);
    };

    const handleAppSelect = (app: Application) => {
        setAppId(app.id);
        set_overlay_vis(false);
    };

    return (
        <>
            <SafeAreaView>
                <ScrollView style={globalStyles.screen}>
                    <Card style={{ marginTop: 20, width: "100%" }}>
                        <TouchableOpacity
                            onPress={() => {
                                set_overlay_vis(true);
                            }}
                            style={{ flexDirection: "row", justifyContent: "space-between", padding: 10 }}
                        >
                            <Text style={styles.appID}>App ID: </Text>
                            <Text>{appId}</Text>
                            <Image source={require("../assets/arrowBlue.png")} style={{ width: 20, height: 20 }} />
                        </TouchableOpacity>
                    </Card>

                    <View style={{ width: "100%" }}>
                        <Card>
                            <View style={styles.uidCard}>
                                <Text style={styles.uidCardText}>{uid}</Text>
                                <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, justifyContent: "center" }}>
                                    <ImageButton source={require("../assets/refresh.png")} onPress={() => generateUID()} />
                                </View>
                            </View>
                        </Card>
                    </View>

                    <Button disabled={appId == null} onPress={save} text={"Save"} style={{ width: 200 }} />

                    <View style={{ alignItems: "center" }}>
                        <ViewShot ref={viewRef} style={{ width: 300, height: 400, justifyContent: "center", backgroundColor: "white" }}>
                            <View style={{ justifyContent: "center", alignItems: "center" }}>
                                <Image source={require("../assets/dpiLogo.png")} resizeMode="contain" style={{ height: 70, width: "100%" }} />
                                <QRCode value={`dma://device/?appid=${appId}&uid=${uid}`} size={200} />
                            </View>
                            <Text style={{ marginTop: 20, fontWeight: "bold", marginLeft: 40 }}>Application ID: {appId}</Text>
                            <Text style={{ fontWeight: "bold", marginLeft: 40 }}>UID: {uid}</Text>
                        </ViewShot>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <ModalView
                isVisible={overlay_vis}
                set_isVisible={set_overlay_vis}
                style={{ backgroundColor: "#f1f1f1", maxHeight: Dimensions.get("window").height - insets.bottom - insets.top - 50 }}
            >
                <AppList
                    onSelect={(app) => {
                        setAppId(app.id);
                        set_overlay_vis(false);
                    }}
                />
            </ModalView>
        </>
    );
};

const styles = StyleSheet.create({
    submit: {
        backgroundColor: "#128cde",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 50,
        margin: 20,
    },
    submitText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
        padding: 20,
    },
    uidCard: {
        width: "100%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    uidCardText: {
        fontWeight: "bold",
        fontSize: 18,
    },
    appID: {
        fontWeight: "bold",
        fontSize: 15,
    },
});

export default QRScreen;
