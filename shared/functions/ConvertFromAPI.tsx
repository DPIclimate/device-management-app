import { APIApplicationsResponse, APICommResponse, APIDeviceResponse } from "../types/APIResponseTypes";
import { Application, CommMessage, Device } from "../types/CustomTypes";

/*
    Functions to convert from API response type to custom type
*/

export function ConvertToDevice(APIDevice: APIDeviceResponse, isFav: boolean): Device {
    return {
        id: APIDevice.ids.device_id,
        name: APIDevice.name,
        applications_id: APIDevice.ids.application_ids.application_id,
        dev_eui: APIDevice.ids.dev_eui,
        join_eui: APIDevice.ids.join_eui,
        created_at: APIDevice.created_at,
        updated_at: APIDevice.updated_at,
        uid: APIDevice.attributes?.uid,
        description:APIDevice.description,
        location: APIDevice.locations? {
            latitude: APIDevice.locations?.user.latitude,
            longitude: APIDevice.locations?.user.longitude,
            altitude: APIDevice.locations?.user.altitude,
            source: APIDevice.locations?.user.source,
        }:null,
        isFav: isFav,
    };
}

export function ConvertToApp(APIApp: APIApplicationsResponse, isFav: boolean): Application {
    return {
        id: APIApp.ids.application_id,
        created_at: APIApp.created_at,
        updated_at: APIApp.updated_at,
        name: APIApp.name,
        description: APIApp.description,
        isFav: isFav,
    };
}

export function ConvertToComm(APIComm: APICommResponse): CommMessage[] {
    return APIComm.mac_state.recent_uplinks.map((msg) =>{  
        return {
            m_type:msg.payload?.m_hdr?.m_type,
            rssi:msg.rx_metadata[0]?.channel_rssi,
            snr:msg.rx_metadata[0]?.snr,
            time:msg.received_at
        }      
    })
}
