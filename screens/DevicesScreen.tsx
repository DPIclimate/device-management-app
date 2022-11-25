import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import globalStyles from "../styles";
import { RowMap, SwipeListView } from "react-native-swipe-list-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFavs } from "../shared/functions/ManageLocStorage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalContext } from "../shared/context/GlobalContext";
import { Device, Store_Tokens } from "../shared/types/CustomTypes";
import { useFetch } from "../shared/hooks/useFetch";
import { renderHiddenItem, renderItem } from "../shared/components/ListComponents";
import { APIDeviceResponse } from "../shared/types/APIResponseTypes";
import { ConvertToDevice } from "../shared/functions/ConvertFromAPI";
import SearchBox from "../shared/components/SearchBox";
import SearchIcon from "../shared/components/SearchIcon";

export default function DevicesScreen({ route, navigation }) {

    const [state, dispatch] = useContext(GlobalContext);
    const insets = useSafeAreaInsets();

    const [listData, changeData] = useState<Device[]>([]);
    const { response, isLoading, error, retry } = useFetch(
        `${state.application_server}/api/v3/applications/${route.params.application.id}/devices?field_mask=attributes,locations,description,name,attributes`
    );

    const [searchText, setSearchText] = useState<string>("");
    const [showSearch, setShow] = useState<boolean>(false);
    
    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            title:route.params.application.id
        });
    }, [navigation]);
    
    useEffect(() => {
        async function loaded() {
            if (isLoading) return;
            if (error) return;

            //Response is guaranteed to be of type APIDeviceResponse as we requested /devices endpoint in useFetch hook
            const data: APIDeviceResponse[] = response as APIDeviceResponse[];
            setListData(data);
        }
        loaded();
    }, [isLoading]);

    const setListData = async (data: APIDeviceResponse[]) => {
        /*
            Create list data, need to find users favourite devices

        */

        const favs = await getFavs(Store_Tokens.FAV_DEVICES);
        const devices: Device[] = data.map((dev:APIDeviceResponse) => (ConvertToDevice(dev, favs.includes(dev.ids.device_id))));
        changeData(devices);
    };

    const handlePress = async (item:Device) => {
        navigation.navigate("ManageDeviceScreen", { device: item });
    };

    const toggleFavourite = async (data, rowMap: RowMap<Device>): Promise<void> => {
        //TODO - Share function with applications
        if (rowMap[data.index]) {
            rowMap[data.index].closeRow();
        }

        try {
            const favs = await getFavs(Store_Tokens.FAV_DEVICES);

            if (favs.includes(data.item.id)) {
                favs.splice(favs.indexOf(data.item.id), 1);
            } else {
                favs.push(data.item.id);
            }

            await AsyncStorage.setItem(Store_Tokens.FAV_DEVICES, JSON.stringify(favs));
        } catch (error) {
            console.log(error);
        }

        changeData(listData.map((item) => (item.id == data.item.id ? { ...item, isFav: !item.isFav } : item)));
    };

    const filteredData = (): Device[] => {
        let list = listData;
        if (searchText != "") {
            //Regex support
            if (searchText.includes("regex: ")) {
                list = list.filter((app) => {
                    try {
                        //Convert user text to regular expression
                        const pattern = searchText.replace("regex: ", "");
                        const match = pattern.match(new RegExp("^/(.*?)/([gimy]*)$"));
                        const regex = new RegExp(match[1], match[2]);

                        const result = app.id.match(regex);
                        if (result) return true;
                    } catch (e) {
                        return false;
                    }
                });
            } else {
                list = list.filter((app) => {
                    return app.id.includes(searchText);
                });
            }
        }
        list = list.sort((a, b) => {
            return a.isFav === b.isFav ? a.id > b.id : a.isFav ? -1 : 1;
        });
        return list;
    };

    return (
        <View style={globalStyles.screen}>
            {/* <View style={styles.offlineIcon}>
                    <Offline isConnected={false} />
                </View> */}

            {searchText != "" && !showSearch && <Text style={styles.searchText}>Search: {searchText}</Text>}

            <View style={{ paddingTop: 10 }}>
                {!response && !isLoading && !error && <Text>No Devices to display</Text>}

                {error && <Text>An error occurred: {error}</Text>}
            </View>

            <SwipeListView
                data={filteredData()}
                renderItem={(item) => renderItem(item, handlePress, "Devices")}
                keyExtractor={(item, index) => index.toString()}
                renderHiddenItem={(data, rowMap) => renderHiddenItem(data, rowMap, toggleFavourite)}
                leftOpenValue={80}
                stopRightSwipe={1}
                onRefresh={() => retry()}
                refreshing={isLoading}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 10,
                    paddingRight: insets.right,
                    paddingLeft: insets.left,
                    paddingTop: showSearch ? 70 : 0,
                }}
            />

            <SearchBox showSearch={showSearch} searchText={searchText} setSearchText={setSearchText} setShow={setShow}/>
            
            <SearchIcon setShow={setShow}/>
        </View>
    );
}
const styles = StyleSheet.create({
    title: {
        paddingTop: 10,
    },
    offlineIcon: {
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    searchIcon: {
        position: "absolute",
        backgroundColor: "white",
        borderRadius: 50,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e6e6e6",
    },
    searchBoxView: {
        position: "absolute",
        top: 10,
        width: "100%",
        backgroundColor: "white",
        borderRadius: 50,
    },
    searchBox: {
        backgroundColor: "white",
        margin: 10,
        borderRadius: 25,
        borderWidth: 1,
        height: 50,
        width: "95%",
        padding: 10,
        alignSelf: "center",
    },
    searchText: {
        fontWeight: "bold",
        alignSelf: "center",
        marginTop: 10,
        fontSize: 15,
    },
});
