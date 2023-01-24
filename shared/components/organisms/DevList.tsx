import { StyleSheet, Text, TouchableOpacity, View, Image, RefreshControl } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { GlobalContext } from "../../context/GlobalContext";
import { FlatList } from "react-native-gesture-handler";
import { APIDeviceResponse } from "../../types/APIResponseTypes";
import { Device, Store_Tokens } from "../../types/CustomTypes";
import { ConvertToDevice } from "../../functions/ConvertFromAPI";
import { getFavs } from "../../functions/ManageLocStorage";
import CardRow from "../molecules/CardRow";
import { LoadingComponent } from "../atoms/LoadingComponent";

interface DevListParams {
    onSelect(device: Device): void | Promise<void>;
    application_id: string;
}

export default function DevList({ application_id, onSelect }: DevListParams) {
    const [state, dispatch] = useContext(GlobalContext);
    const { response, isLoading, error, retry } = useFetch(
        `${state.application_server}/api/v3/applications/${application_id}/devices?field_mask=attributes,locations,description,name`
    );

    const [data, set_data] = useState<Device[]>();

    useEffect(() => {
        if (!response || isLoading) return;
        setListData();
    }, [response, isLoading]);

    const setListData = async (): Promise<void> => {
        /*
            Create list data, need to find users favourite devices

        */

        const favs = await getFavs(Store_Tokens.FAV_DEVICES);
        const devices: Device[] = (response as APIDeviceResponse[])?.map((dev: APIDeviceResponse) =>
            ConvertToDevice(dev, favs.includes(dev.ids.device_id))
        );
        set_data(
            devices.sort((a, b) => {
                return a.isFav === b.isFav ? a.id > b.id : a.isFav ? -1 : 1;
            })
        );
    };

    const renderItem = ({ item, index }): JSX.Element => {
        const device: Device = item;
        console.log(device);
        return (
            <CardRow
                title={item.id}
                text={item.name}
                isFav={item.isFav}
                arrowImg={require("../../../assets/arrowBlue.png")}
                onPress={() => onSelect(item)}
            />
        );
    };

    return (
        <>
        {isLoading ?
        (
            <LoadingComponent isLoading={true}/>
        ):(

            <FlatList
            data={data}
            renderItem={renderItem}
            refreshing={isLoading}
            onRefresh={retry}
            style={{ width: "100%"}}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={() => retry()} />}
                />
                )
            }
        </>
    );
}

const styles = StyleSheet.create({
    rowItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 30,
    },
});
