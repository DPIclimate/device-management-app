import { APIDeviceResponse } from "../types/APIResponseTypes"
import { Device } from "../types/CustomTypes"

/*

Functions to convert to API response

*/


export const ConvertFromDevice = (device:Device):APIDeviceResponse=>{

    return{
            ids: {
                device_id: device.id,
                application_ids: {
                    application_id: device.applications_id,
                },
                dev_eui: device.dev_eui,
                join_eui: device.join_eui,
            },
            created_at: device.created_at,
            updated_at: device.updated_at,
            name: device.name,
            description:device.description,
            locations: {
                user: {
                    latitude: device.location.latitude,
                    longitude: device.location.longitude,
                    altitude: device.location.altitude,
                    source: device.location.source
                }
            },
            attributes: {
                uid: device.uid
            }
        }
}