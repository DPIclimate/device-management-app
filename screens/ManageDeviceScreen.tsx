import React, { useEffect, useState, useRef, useContext, useReducer } from "react";
import { StyleSheet, ScrollView, RefreshControl, SafeAreaView } from "react-native";
import { GlobalContext } from "../shared/context/GlobalContext";
import { CommMessage, Device } from "../shared/types/CustomTypes";
import { DeviceCard } from "./cards/DeviceCard";
import { ManageDeviceContextProvider } from "../shared/context/ManageDeviceContext";
import LastSeenCard from "./cards/LastSeenCard";
import { CommCard } from "./cards/CommCard";
import { useFetch } from "../shared/hooks/useFetch";
import { ConvertToComm, ConvertToDevice } from "../shared/functions/ConvertFromAPI";
import { APICommResponse, APIDeviceResponse } from "../shared/types/APIResponseTypes";
import { LocationCard } from "./cards/LocationCard";
import { NotesCard } from "./cards/NotesCard";
import { useKeyboardHeight } from "../shared/hooks/useKeyboardHeight";
import globalStyles from "../styles";

export const ManageDeviceScreen = ({ route, navigation }): JSX.Element => {
    const [state, dispatch] = useContext(GlobalContext);
    const keyboardHeight = useKeyboardHeight();
    const scrollViewRef = useRef();

    const [device_state, set_device_state] = useState<Device>(route.params.device);
    const [device_comm_data, set_device_comm_data] = useState<CommMessage[]>([]);
    const [scrollToEnd, set_scrollToEnd]=useState<boolean>(false);

    const {
        response: dev_response,
        isLoading: dev_isLoading,
        error: dev_error,
        retry: dev_retry,
    } = useFetch(
        `${state.application_server}/api/v3/applications/${route.params.device.applications_id}/devices/${route.params.device.id}?field_mask=attributes,locations,description,name`
    );

    const {
        response: comm_response,
        isLoading: comm_isLoading,
        error: comm_error,
        retry: comm_retry,
    } = useFetch(
        `${state.communication_server}/api/v3/ns/applications/${route.params.device.applications_id}/devices/${route.params.device.id}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`
    );

    useEffect(() => {
        if (!comm_response || comm_isLoading) return;

        const comm_data = comm_response as APICommResponse;

        const formatted: CommMessage[] = ConvertToComm(comm_data);
        set_device_comm_data(formatted.reverse());
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
