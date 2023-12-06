export interface APIApplicationsResponse {
    created_at: string;
    ids: {
        application_id: string;
    };
    updated_at: string;
    name: string | undefined;
    description: string | undefined;
}

export interface APIDeviceResponse {
    ids: {
        device_id: string;
        application_ids: {
            application_id: string;
        };
        dev_eui: string;
        join_eui: string;
    };
    created_at: string;
    updated_at: string;
    name: string | undefined;
    description: string | undefined;
    locations: {
        user: {
            latitude: number;
            longitude: number;
            altitude: number;
            accuracy: number;
            source: string;
        };
    } | undefined;
    attributes: {
        uid: string;
    } | undefined;
}

export interface APIGatewayResponse {
    ids: {
        gateway_id: string;
        eui: string;
    };
    created_at: string;
    updated_at: string;
    name: string | undefined;
    description: string | undefined;
}

export interface APICommResponse {
    result: {
        end_device_ids: {
            device_id: string
            application_ids: {
                application_id: string
            },
            dev_eui: string
            dev_addr: string
        },
        received_at: string
        uplink_message: {
            f_port: number
            f_cnt: number
            frm_payload: string
            decoded_payload: any;
            rx_metadata: [
                {
                    gateway_ids: {
                        gateway_id: string
                        eui: string
                    },
                    time: string
                    timestamp: number
                    rssi: number
                    channel_rssi: number
                    snr: number
                    gps_time: string
                    received_at: string
                }
            ],
            settings: {
                data_rate: {
                    lora: {
                        bandwidth: number
                        spreading_factor: number
                        coding_rate: string
                    }
                },
                frequency: number
                timestamp: number
                time: string
            },
            received_at: string
            consumed_airtime: string
            network_ids: {
                net_id: number
                ns_id: string
                tenant_id: string
                cluster_id: string
                cluster_address: string
            }
        }
    }
}
