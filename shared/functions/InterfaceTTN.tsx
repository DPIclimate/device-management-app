import { APIApplicationsResponse, APIDeviceResponse } from "../types/APIResponseTypes";
import { Device, DeviceUpdateRequest, GlobalState, HTTP_Response, Regions } from "../types/CustomTypes";
import { ConvertFromDevice } from "./ConvertToAPI";

export const TTN_Actions = {
    UPDATE_LOCATION: "locations",
    UPDATE_DESCRIPTION: "description",
    UPDATE_NAME:"name",
    UPDATE_UID:"attributes"
};

export const update_ttn_device = async (request: DeviceUpdateRequest, server: string, ttn_auth_token: string): Promise<void> => {
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
    const resp: Response = await fetch(`${server}/api/v3/applications/${request.device.applications_id}/devices/${request.device.id}`, {
        method: "PUT",
        headers: {
            Authorization: ttn_auth_token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });
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