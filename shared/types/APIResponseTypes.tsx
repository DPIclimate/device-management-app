export interface APIApplicationsResponse {
    applications:[
        {
            created_at: string
            ids: {
                application_id: JSON;
            };
            updated_at: string;
        }
    ]
}

export interface APIDeviceResponse {
    ids: {
        device_id: string;
        application_ids: {
            application_id: string;
        };
    };
    dev_eui: string;
    join_eui: string;
    created_at: string;
    updated_at: string;
    attributes: {
        uid: string;
    };
}

export interface APIGatewayResponse {
    ids: {
        gateway_id: string;
        eui: string;
    };
    created_at:string,
    updated_at:string
}
