import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, Dimensions, Pressable } from "react-native";
import globalStyles from "../styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { renderItem, renderHiddenItem, Offline } from "../shared";
import { SwipeListView } from "react-native-swipe-list-view";
import { getFavs } from "../shared/functions/ManageLocStorage";
import { useFetch } from "../shared/hooks/useFetch";
import { GlobalContext } from "../shared/context/GlobalContext";
import { Application, Store_Tokens } from "../shared/types/CustomTypes";
import { APIApplicationsResponse } from "../shared/types/APIResponseTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApplicationsScreen({ navigation }): JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);
    const insets = useSafeAreaInsets();

    const [listData, changeData] = useState<Application[]>([]);
    const { data, isLoading, error, retry } = useFetch(`${state.application_server}/api/v3/applications?field=description`);

    const [searchText, setSearchText] = useState<string>("");
    const [showSearch, setShow] = useState<boolean>(false);

    useEffect(() => {
        async function loaded() {
            if (isLoading) return;
            setListData(data);
        }
        loaded();
    }, [isLoading]);

    const setListData = async (data: APIApplicationsResponse): Promise<void> => {
        /*
            Formats data to display in flatlist

        */

        if (isLoading) return;
        if (error) return;

        const favs: JSON[] = await getFavs(Store_Tokens.FAV_APPLICATIONS);
        //TODO - fix ts error
        const appList: Application[] = data.applications.map((app) => ({
            id: app.ids.application_id,
            isFav: favs.includes(app.ids.application_id),
        }));

        changeData(appList);
    };

    const handlePress = (item: Application): void => {
        navigation.navigate("DevicesScreen", { application_id: item.id, app_description: item.description });
    };
    const x =handlePress
    const toggleFavourite = async (data, rowMap): Promise<void> => {
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
                {!data && !isLoading && !error && <Text>No Applications to display</Text>}

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
                    paddingBottom: insets.bottom,
                    paddingRight: insets.right,
                    paddingLeft: insets.left,
                    paddingTop: showSearch ? 70 : 0,
                }}
            />

            <View style={styles.searchBoxView}>
                {showSearch && (
                    <TextInput
                        clearButtonMode="always"
                        autoFocus={true}
                        onSubmitEditing={() => setShow(false)}
                        value={searchText}
                        placeholder="example-app-id"
                        style={styles.searchBox}
                        onChangeText={(e) => {
                            setSearchText(e);
                        }}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                )}
            </View>

            <Pressable style={[styles.searchIcon, { bottom: insets.bottom, right: 10 }]} onPress={(prev) => setShow((prev) => !prev)}>
                <Image source={require("../assets/search.png")} style={{ width: 40, height: 40 }} />
            </Pressable>
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
