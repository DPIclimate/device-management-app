import { StyleSheet, Text, TouchableOpacity, View, Image, RefreshControl } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { GlobalContext } from "../../context/GlobalContext";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { Application, Store_Tokens } from "../../types/CustomTypes";
import { getFavs } from "../../functions/ManageLocStorage";
import CardRow from "../molecules/CardRow";
import { ConvertToApp } from "../../functions/ConvertFromAPI";
import { APIApplicationsResponse } from "../../types/APIResponseTypes";
import { LoadingComponent } from "../atoms/LoadingComponent";

interface AppListParams {
    onSelect(application: Application): void | Promise<void>;
}

export default function AppList({ onSelect }: AppListParams) {
    const [state, dispatch] = useContext(GlobalContext);
    const { response, isLoading, error, retry } = useFetch(`${state.application_server}/api/v3/applications?field_mask=attributes,description,name`);

    const [data, set_data] = useState<Application[]>();

    useEffect(() => {
        if (!response || isLoading) return;
        setListData();
    }, [response, isLoading]);

    const setListData = async (): Promise<void> => {
        /*
            Create list data, need to find users favourite devices

        */

        const favs = await getFavs(Store_Tokens.FAV_APPLICATIONS);
        console.log(favs);
        const applications: Application[] = (response as APIApplicationsResponse[])?.map((app: APIApplicationsResponse) =>
            ConvertToApp(app, favs.includes(app.ids.application_id))
        );

        set_data(
            applications.sort((a, b) => {
                return a.isFav === b.isFav ? a.id > b.id : a.isFav ? -1 : 1;
            })
        );
        console.log(applications.filter((app) => app.id == "oai-test-devices"));
    };

    const renderItem = ({ item, index }): JSX.Element => {
        const application: Application = item;

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
