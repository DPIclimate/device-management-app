import * as Linking from "expo-linking";
import { writeToStorage } from "./ManageLocStorage";
import { APICommResponse, APIDeviceResponse } from "../types/APIResponseTypes";

export const cacheCommData = async (ttn_auth_token: string, server: string, devices: APIDeviceResponse[]): Promise<void> => {
    /*
        Cache communications data from devices
    */

    await Promise.all(
        devices.map(async (dev) => {
            try {
                const url: string = `${server}/api/v3/ns/applications/${dev.ids.application_ids.application_id}/devices/${dev.ids.device_id}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`;
                const response: Response = await fetch(url, {
                    method: "GET",
                    headers:{
                        Authorization:ttn_auth_token,
                        "Content-Type": "application/json"
                    },
                });
                
                if (response.status == 200) {
                    const key = Linking.parse(url).path;
                    const communications: APICommResponse = await response.json();

                    await writeToStorage(key, JSON.stringify(communications));
                }
            } catch (error) {
                console.log(error);
            }
        })
    );
};
