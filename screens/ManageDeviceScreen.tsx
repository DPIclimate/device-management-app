import React, { useEffect, useState, useRef, useContext, useReducer, useLayoutEffect } from "react";
import { StyleSheet, ScrollView, RefreshControl, SafeAreaView, Image, TouchableOpacity, Share } from "react-native";
import { GlobalContext } from "../shared/context/GlobalContext";
import { CommMessage, Device } from "../shared/types/CustomTypes";
import { DeviceCard } from "../shared/components/organisms/cards/DeviceCard";
import { ManageDeviceContextProvider } from "../shared/context/ManageDeviceContext";
import LastSeenCard from "../shared/components/organisms/cards/LastSeenCard";
import { CommCard } from "../shared/components/organisms/cards/CommCard";
import { useFetch, useFetchResponse } from "../shared/hooks/useFetch";
import { ConvertToDevice } from "../shared/functions/ConvertFromAPI";
import { APICommResponse, APIDeviceResponse } from "../shared/types/APIResponseTypes";
import { LocationCard } from "../shared/components/organisms/cards/LocationCard";
import { NotesCard } from "../shared/components/organisms/cards/NotesCard";
import { useKeyboardHeight } from "../shared/hooks/useKeyboardHeight";
import globalStyles from "../styles";
import { useDevice } from "../shared/hooks/useDevice";
import { useCommunications } from "../shared/hooks/useCommunications";

/**
 * Represents the screen component for managing a device.
 * 
 * @param route - The route object containing the device information.
 * @param navigation - The navigation object for navigating between screens.
 * @returns The JSX element representing the ManageDeviceScreen.
 */

export const ManageDeviceScreen = ({ route, navigation }): JSX.Element => {
    const [state, dispatch] = useContext(GlobalContext);
    const keyboardHeight = useKeyboardHeight();
    const scrollViewRef = useRef();

    const [device_state, set_device_state] = useState<Device>(route.params.device);
    const [device_comm_data, set_device_comm_data] = useState<APICommResponse[]>([]);
    const [scrollToEnd, set_scrollToEnd]=useState<boolean>(false);

    const {
        response: dev_response,
        isLoading: dev_isLoading,
        error: dev_error,
        retry: dev_retry,
    } = useDevice(route.params.device.applications_id, route.params.device.id)
    
    //Data on communication data
    const {
        response: comm_response,
        isLoading: comm_isLoading,
        error: comm_error,
        retry: comm_retry,
    } = useCommunications(route.params.device.applications_id, route.params.device.id)

    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <ShareIcon />,
        });
    }, [navigation]);

    useEffect(() => {
        if (!comm_response || comm_isLoading) return;

        set_device_comm_data(comm_response.sort((a, b) => {
            // Sort most recent at top of list
            if (new Date(a.result.received_at) < new Date(b.result.received_at)) {
                return 1;
            }
            return -1;
        }).slice(0,10));
    }, [comm_isLoading]);

    useEffect(() => {
        if (dev_isLoading) return;
        if (!dev_response) return;

        const dev_data = dev_response as APIDeviceResponse;
        const formatted: Device = ConvertToDevice(dev_data, route.params.device.isFav);
        set_device_state(formatted);
    }, [dev_isLoading]);

    useEffect(() => {
        if (keyboardHeight == 0 || !scrollToEnd) return;

        scrollViewRef.current?.scrollToEnd({ animated: true });
        set_scrollToEnd(false)

    }, [keyboardHeight]);

    const handleShare = async() =>{
        const url:string = `dma://device/?appid=${device_state.applications_id}&device_id=${device_state.id}&link=true`
        try {
            await Share.share({
            title:"Share a device",
              url,
            });
          } catch (error) {
            console.error(error);
          }
    }
    const ShareIcon = ():JSX.Element =>{

        return(
            <TouchableOpacity onPress={() => handleShare()}>
                <Image source={require("../assets/share.png")} style={globalStyles.headerIcon}/>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={globalStyles.screen}>
            <ScrollView
                keyboardDismissMode="interactive"
                ref={scrollViewRef}
                contentContainerStyle={{
                    paddingBottom: keyboardHeight + 20,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={dev_isLoading || comm_isLoading}
                        onRefresh={() => {
                            dev_retry();
                            comm_retry();
                        }}
                    />
                }
            >
                <ManageDeviceContextProvider
                    device_comm_data={{ data: device_comm_data, isLoading: comm_isLoading }}
                    device_state={device_state}
                    set_device_state={set_device_state}
                >
                    <LastSeenCard />
                    <DeviceCard />
                    <CommCard />
                    <LocationCard />
                    <NotesCard set_scrollToEnd={set_scrollToEnd}/>
                </ManageDeviceContextProvider>
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    contentView: {
        padding: 10,
    },
    title: {
        paddingTop: 20,
        alignItems: "flex-end",
    },
    subHeading: {
        fontSize: 15,
        paddingBottom: 5,
    },
    subtitleView: {
        paddingTop: 15,
    },
});
