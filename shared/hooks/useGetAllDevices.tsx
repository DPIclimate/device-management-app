/*
    A hook to get all devices in all application 
*/

import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Device } from "../types/CustomTypes";
import { GlobalContext } from "../context/GlobalContext";
import { APIApplicationsResponse, APIDeviceResponse } from "../types/APIResponseTypes";
import { ConvertToDevice } from "../functions/ConvertFromAPI";

export default function useGetAllDevices() {
    const [isLoading, set_isLoading] = useState<boolean>(true);
    const [devices, set_devices] = useState<Device[]>([]);
    const [refetch, set_refetch] = useState<boolean>(false);
    const [error, set_error] = useState<string>();

    const [state, dispatch] = useContext(GlobalContext);

    const retry = (): void => {
        set_isLoading(true);
        set_devices([]);
        set_refetch((prev) => !prev);
    };

    useEffect(() => {
        const abortCont: AbortController = new AbortController();

        const fetch_all = async (): Promise<void> => {
            console.log("Fetching all devices");
            try {
                const app_response = await fetch(`${state.application_server}/api/v3/applications?field=description`, {
                    signal: abortCont.signal,
                    method: "GET",
                    headers: {
                        Authorization: state.ttn_auth_token,
                    },
                });

                if (app_response.status != 200) {
                    set_error(app_response.statusText);
                    console.log("Error occured", app_response.status, app_response.statusText);
                    return;
                }
                const all_apps: APIApplicationsResponse[] = (await app_response.json()).applications;
                const all_devices: Device[] = (
                    await Promise.all(
                        all_apps.map(async (app): Promise<Device[]> => {
                            const dev_response = await fetch(
                                `${state.application_server}/api/v3/applications/${app.ids.application_id}/devices?field_mask=attributes,locations,description,name`,
                                {
                                    signal: abortCont.signal,
                                    method: "GET",
                                    headers: {
                                        Authorization: state.ttn_auth_token,
                                    },
                                }
                            );
                            if (dev_response.status != 200) {
                                console.log("Error in dev response", dev_response.status);
                                return;
                            }
                            const devices: APIDeviceResponse[] = (await dev_response.json()).end_devices;
                            const formatted: Device[] = devices?.map((device) => ConvertToDevice(device, false));
                            return formatted;
                        })
                    )
                ).flat();
                
                set_devices(all_devices);
                set_isLoading(false)
                set_error(null)
                return;

            } catch (error) {
                set_error(error);
                set_isLoading(false)
                console.log("Error", error)
                return;
            }
        };
        fetch_all();
    }, [refetch]);

    return {
        devices,
        isLoading,
        retry,
        error
    };
}

const styles = StyleSheet.create({});
