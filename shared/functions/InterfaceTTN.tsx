import { APIApplicationsResponse, APIDeviceResponse } from "../types/APIResponseTypes";
import { Device, DeviceUpdateRequest, GlobalState, HTTP_Response, Regions } from "../types/CustomTypes";
import { ConvertFromDevice } from "./ConvertToAPI";

export const TTN_Actions = {
    UPDATE_LOCATION: "locations",
    UPDATE_DESCRIPTION: "description",
};
//Functions used to interface with TTN

const registerDevice = async (device) => {
    console.log("in register");

    const appID = device.end_device.ids.application_ids.application_id;

    if (device.end_device?.ids?.dev_eui?.length == 0 && device.type != "move") {
        //If eui was not providered request one from TTN
        const { eui, error } = await getEUI(appID);
        if (error) {
            device.end_device.ids.dev_eui = null;
        } else {
            device.end_device.ids.dev_eui = eui;
        }
    }

    delete device.type;

    try {
        console.log("making request to register");

        const url = `${global.BASE_URL}/applications/${appID}/devices`;
        let resp = await fetch(url, {
            method: "POST",
            headers: global.headers,
            body: JSON.stringify(device),
        }).then((res) => res.json());

        if ("code" in resp) {
            //If key code exists then an error occured
            console.log(resp);
            throw new Error(resp.details[0].message_format);
        }
        return {
            success: true,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            error: error,
        };
    }
};
const getEUI = async (appID) => {
    //Request EUI from ttn
    try {
        let url = `${global.BASE_URL}/applications/${appID}/dev-eui`;
        console.log(url);
        let resp = await fetch(url, {
            method: "POST",
            headers: global.headers,
        }).then((response) => response.json());

        if ("code" in resp) {
            if (resp.code == 3) {
                throw Error(`Application issued devEUI limit of ${resp.details[0]?.attributes?.dev_eui_limit} reached`);
            }
            throw Error(resp.message);
        }

        return {
            eui: resp.dev_eui,
            error: null,
        };
    } catch (error) {
        return {
            eui: null,
            error: error,
        };
    }
};

const updateDevice = async (data) => {
    console.log("now updating the device");
    let device = { ...data };
    delete device.type;
    const appID = device.end_device.ids.application_ids.application_id;
    const deviceID = device.end_device.ids.device_id;

    console.log(device);
    try {
        const url = `${global.BASE_URL}/applications/${appID}/devices/${deviceID}`;
        console.log(url);
        const response = await fetch(url, {
            method: "PUT",
            headers: global.headers,
            body: JSON.stringify(device),
        }).then((response) => response.json());

        console.log("response", response);
        if ("code" in response) {
            //If key code exists then an error occured
            throw new Error(response.message);
        }
        return {
            success: true,
            error: null,
        };
    } catch (error) {
        console.log(`An error occured, in update ${error}`);
        return {
            success: false,
            error: error,
        };
    }
};

export const update_ttn_device = async (request: DeviceUpdateRequest, server: string, ttn_auth_token: string): Promise<HTTP_Response> => {
    /*
        Updating device on TTN according to the TTN_Action passed to this function
    */

    const api_device: APIDeviceResponse = ConvertFromDevice(request.device);
    const body = {
        end_device: {
            ...api_device,
        },
        field_mask: {
            paths: [request.action],
        },
    };
    try {
        const resp: Response = await fetch(`${server}/api/v3/applications/${request.device.applications_id}/devices/${request.device.id}`, {
            method: "PUT",
            headers: {
                Authorization: ttn_auth_token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
        });

        const json = await resp.json();
        console.log(json);
        return {
            status: resp.status,
            status_text: resp.statusText,
        };
    } catch (error) {
        console.log("Error updating device", error);

        //Return status 0 to let parent function know error is not an http error
        return {
            status: 0,
            status_text: error,
        };
    }
};

const checkUnique = async (data) => {
    //Checks that a particular device is unique

    console.log("checking unique");
    const deviceEUI = data.end_device.ids.dev_eui;
    const deviceUID = data.end_device.attributes.uid;
    const deviceID = data.end_device.ids.device_id;
    const appID = data.end_device.ids.application_ids.application_id;

    let url = `${global.BASE_URL}/applications/${appID}/devices?field_mask=attributes`;
    let response = await fetch(url, {
        method: "GET",
        headers: global.headers,
    }).then((response) => response.json());

    if ("code" in response) {
        return {
            isUnique: false,
            error: response.message,
        };
    }

    const devices = response.end_devices;

    let euiList = devices.map((dev) => dev?.ids?.dev_eui);
    let IDList = devices.map((dev) => dev?.ids?.device_id);
    let uidList = devices.map((dev) => dev?.attributes?.uid);

    try {
        euiList.forEach((eui) => {
            if (deviceEUI == eui && eui != undefined) {
                return {
                    isUnique: false,
                    error: "Device EUI already exists",
                };
            }
        });

        uidList.forEach((uid) => {
            if (deviceUID == uid && uid != undefined) {
                return {
                    isUnique: false,
                    error: "Device UID already exists",
                };
            }
        });

        IDList.forEach((ID) => {
            if (deviceID == ID && ID != undefined) {
                return {
                    isUnique: false,
                    error: "Device ID already exists",
                };
            }
        });
    } catch (error) {
        return {
            isUnique: false,
            error: error,
        };
    }

    return {
        isUnique: true,
        error: null,
    };
};
export const validateToken = async (token: string) => {
    /*
        Validate ttn token against all ttn servers e.g (eu1, au1, nam1)
    */

    if (token) {
        token = token.replace("Bearer ", "");
        token = `Bearer ${token}`;
        
        if (!token.match(/^Bearer NNSXS\.[A-Z0-9]{39}\.[A-Z0-9]{52}$/)){
            //Token must match regex
            return {
                success:false,
                server:null
            }
        }

        for (const region in Regions) {
            try {
                const req: Response = await fetch(`${Regions[region]}/api/v3/applications`, {
                    method: "GET",
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json"
                    },
                });

                console.log(req.status);

                if (req.status == 200) {
                    return {
                        success: true,
                        server: Regions[region],
                    };
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    return {
        success: false,
        server: null,
    };
};

const getApplications = async () => {
    //Request applications from ttn

    if (global.valid_token != true) return null;

    try {
        const url = `${global.BASE_URL}/applications?field_mask=description`;
        let response = await fetch(url, {
            method: "GET",
            headers: global.headers,
        }).then((response) => response.json());

        response = response.applications;
        return response;
    } catch (error) {
        console.log(error);
    }
};
// const deleteDevice = async (device) => {
//     console.log("deleting device", device.ids.device_id);
//     const appID = device.ids.application_ids.application_id;
//     const devID = device.ids.device_id;

//     const url = `${global.BASE_URL}/applications/${appID}/devices/${devID}`;
//     console.log("deleting", url);
//     try {
//         const response = await fetch(url, {
//             method: "DELETE",
//             headers: global.headers,
//         });

//         if ("code" in response) {
//             //If key code exists then an error occured
//             throw new Error(json.code, json.message, deviceID);
//         }
//         return true;
//     } catch (error) {
//         console.log("An error occured", error);
//         return false;
//     }
// };
export { registerDevice, getEUI, updateDevice, checkUnique, getApplications };
