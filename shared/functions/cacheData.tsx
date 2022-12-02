import * as Linking from "expo-linking";
import { writeToStorage } from "./ManageLocStorage";
import { APIApplicationsResponse, APIDeviceResponse } from "../types/APIResponseTypes";
import { cacheCommData } from "./cacheCommData";

export const cacheData = async (ttn_auth_token: string, device_server: string, comms_server:string, cacheComm: boolean): Promise<void> => {
    /*
		Cache device data for offline use

	*/
    console.log("Caching device data");
    try {
        const url: string = `${device_server}/api/v3/applications?field_mask=description`;
        const response: Response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: ttn_auth_token,
                "Content-Type": "application/json"
            },
        });
        if (response.status != 200) {
            throw Error(`Applications - ${response.status}`);
        }

        const path = Linking.parse(url).path;
        const applications: APIApplicationsResponse[] = (await response.json()).applications;

        if (!applications) return;

        await writeToStorage(path, JSON.stringify(applications));

        await Promise.all(
            applications.map(async (app) => {
                const dev_url: string = `${device_server}/api/v3/applications/${app.ids.application_id}/devices?field_mask=attributes,locations,description,name`;
                const response: Response = await fetch(dev_url, {
                    method: "GET",
                    headers: {
                        Authorization: ttn_auth_token,
                        "Content-Type": "application/json"
                    },
                });

                if (response.status != 200) {
                    throw Error(`Devices - ${response.status}`);
                }

                const dev_path: string = Linking.parse(dev_url).path;
                const devices: APIDeviceResponse[] = (await response.json()).end_devices;

                if (devices){
					await writeToStorage(dev_path, JSON.stringify(devices));
					
					if (cacheComm) {
						await cacheCommData(ttn_auth_token, comms_server, devices);
					}
				}
            })
        );
        console.log("finished caching", applications.length, "applications");
    } catch (err) {
        console.log("An error occurred while caching in - ", err.message);
    }
};
