import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet} from "react-native";
import globalStyles from "../styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { renderHiddenItem, renderItem } from "../shared/components/ListComponents";
import { RowMap, SwipeListView } from "react-native-swipe-list-view";
import { getFavs } from "../shared/functions/ManageLocStorage";
import { useFetch } from "../shared/hooks/useFetch";
import { GlobalContext } from "../shared/context/GlobalContext";
import { Application, Store_Tokens } from "../shared/types/CustomTypes";
import { APIApplicationsResponse } from "../shared/types/APIResponseTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConvertToApp } from "../shared/functions/ConvertFromAPI";
import SearchIcon from "../shared/components/SearchIcon";
import SearchBox from "../shared/components/SearchBox";

export default function ApplicationsScreen({ navigation }): JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);
    const insets = useSafeAreaInsets();

    const [listData, changeData] = useState<Application[]>([]);
    const { response, isLoading, error, retry } = useFetch(`${state.application_server}/api/v3/applications?field=description`);

    const [searchText, setSearchText] = useState<string>("");
    const [showSearch, setShow] = useState<boolean>(false);

    //TODO - Fix loading bug when app hasnt check network status yet

    //TODO - Change the way favourites are done, instead of isFav being device attirbute, have list of favourites and compare with devices
    //TODO - add content type header to all requests
    
    useEffect(() => {
        async function loaded() {

            if (isLoading) return;
            if (error) return;

            //Data is guaranteed to be of type APIApplicationsResponse as we requested /applications in the useFetch hook
            const data = response as APIApplicationsResponse[]
            setListData(data)
        }
        loaded();
    }, [isLoading]);

    const setListData = async (data: APIApplicationsResponse[]): Promise<void> => {
        /*
            Formats data to display in flatlist

        */

        const favs = await getFavs(Store_Tokens.FAV_APPLICATIONS);
        const appList: Application[] = data.map((app) => (ConvertToApp(app, favs.includes(app.ids.application_id))));
        changeData(appList);
    };

    const handlePress = (item: Application): void => {
        navigation.navigate("DevicesScreen", { application:item });
    };

    const toggleFavourite = async (data, rowMap:RowMap<Application>): Promise<void> => {

        //TODO - enforce types on data variable
        if (rowMap[data.index]) {
            rowMap[data.index].closeRow();
        }

        try {
            const favs = await getFavs(Store_Tokens.FAV_APPLICATIONS);

            if (favs.includes(data.item.id)) {
                favs.splice(favs.indexOf(data.item.id), 1);
            } else {
                favs.push(data.item.id);
            }

            await AsyncStorage.setItem(Store_Tokens.FAV_APPLICATIONS, JSON.stringify(favs));
        } catch (error) {
            console.log(error);
        }

        changeData(listData.map((item) => (item.id == data.item.id ? { ...item, isFav: !item.isFav } : item)));
    };

    const filteredData = (): Application[] => {
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
                {!response && !isLoading && !error && <Text>No Applications to display</Text>}

                {error && <Text>An error occurred: {error}</Text>}
            </View>

            <SwipeListView
                data={filteredData()}
                renderItem={(item) => renderItem(item, handlePress, "Applications")}
                keyExtractor={(item, index) => index.toString()}
                renderHiddenItem={(data, rowMap) => renderHiddenItem(data, rowMap, toggleFavourite)}
                leftOpenValue={80}
                stopRightSwipe={1}
                onRefresh={() => retry()}
                refreshing={isLoading}
                contentContainerStyle={{
                    paddingBottom: insets.bottom+10,
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
    searchText: {
        fontWeight: "bold",
        alignSelf: "center",
        marginTop: 10,
        fontSize: 15,
    },
});
