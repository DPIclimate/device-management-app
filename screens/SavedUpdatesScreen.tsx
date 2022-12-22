import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RowMap, SwipeListView } from "react-native-swipe-list-view";
import Card from "../shared/components/Card";
import { GlobalContext } from "../shared/context/GlobalContext";
import { update_ttn_device } from "../shared/functions/InterfaceTTN";
import { delete_update_from_storage, } from "../shared/functions/ManageLocStorage";
import {useStoredDevices} from "../shared/hooks/useStoredDevices";
import { DeviceUpdateRequest } from "../shared/types/CustomTypes";
import globalStyles from "../styles";
import { DescriptionUpdate, LocationUpdateCard } from "./cards/OfflineUpdateCards";

export function SavedUpdatesScreen({ route, navigation }):JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);

    const { response, isLoading, error, retry } = useStoredDevices();

    const handleRetry = async(data, rowMap:RowMap<any>) =>{
        if (!state.network_status){
            Alert.alert("Failed", "Could not perform this action as there is no internet connection, please try again later.")
            rowMap[data.index].closeRow();
            return
        }
        
        try{
            await update_ttn_device(data.item, state.application_server, state.ttn_auth_token);
            await handleDelete(data, rowMap)
            Alert.alert("Success", "Successfully pushed this update to TTN.")
        }
        catch(error){
            Alert.alert("Update Failed", `Failed to push update to TTN. Error:${error}`)
        }
    }

    const handleDelete = async (data, rowMap) => {

        await delete_update_from_storage(data.index);
        retry();
    };

    const renderHiddenItem = (data, rowMap:RowMap<any>):JSX.Element => {
        //Renders the bin icon when user swipes left
        return (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Card colour={"#128cde"}>
                    <TouchableOpacity
                        style={{ height: "100%", width: 50, justifyContent: "center" }}
                        onPress={() => handleRetry(data, rowMap)}
                        activeOpacity={0.6}
                    >
                        <Image style={{ height: 60, width: 50 }} resizeMode="contain" source={require("../assets/retry.png")} />
                    </TouchableOpacity>
                </Card>
                <Card colour={"red"}>
                    <TouchableOpacity
                        style={{ height: "100%", width: 50, justifyContent: "center" }}
                        onPress={() => handleDelete(data, rowMap)}
                        activeOpacity={0.6}
                    >
                        <Image style={{ height: 60, width: 50 }} resizeMode="contain" source={require("../assets/bin.png")} />
                    </TouchableOpacity>
                </Card>
            </View>
        );
    };

    const renderItem = (data, rowMap: RowMap<any>): JSX.Element => {
        const item: DeviceUpdateRequest = data.item;

        switch (item.action) {
            case "locations":
                return <LocationUpdateCard item={item} />;
            case "description":
                return <DescriptionUpdate item={item} />;
            default:
                return <View />;
        }
    };
    return (
        <SafeAreaView style={globalStyles.screen}>
            {response.length==0 && 
                <Text style={styles.noUpdates}>No saved updates</Text>
                }

            <SwipeListView
                data={response}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-100}
                leftOpenValue={100}
                refreshing={isLoading}
                onRefresh={() => retry()}
            />

        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    cardText: {
        paddingTop: 4,
        fontSize: 14,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    button: {
        width: 140,
        height: 40,
    },
    deleteBox: {
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        height: 80,
    },
    noUpdates:{ 
        fontWeight: "bold", 
        fontSize: 15, 
        alignSelf:'center' 
    }
});
