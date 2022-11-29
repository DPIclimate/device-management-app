export interface APIApplicationsResponse {
    created_at: string;
    ids: {
        application_id: string;
    };
    updated_at: string;
    name: string | null;
    description: string | null;
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
    name: string|null;
    description:string|null;
    locations: {
        user: {
            latitude: number;
            longitude: number;
            altitude: number;
            source: string;
        };
    } | null;
    attributes: {
        uid: string;
    } | null;
}

export interface APIGatewayResponse {
    ids: {
        gateway_id: string;
        eui: string;
    };
    created_at: string;
    updated_at: string;
}

export interface APICommResponse {
    ids: {
        device_id: string;
        application_ids: {
            application_id: string;
        };
        dev_eui: string;
        join_eui: string;
        dev_addr: string;
    };
    created_at: string;
    updated_at: string;
    mac_state: {
        recent_uplinks: [
            {
                payload: {
                    m_hdr: {
                        m_type: string;
                    };
                    mic: string;
                    mac_payload: {
                        f_hdr: {
                            dev_addr: string;
                            f_ctrl: {
                                adr: boolean;
                            };
                            f_cnt: number;
                        };
                        f_port: number;
                        frm_payload: string;
                        full_f_cnt: number;
                    };
                };
                settings: {
                    data_rate: {
                        lora: {
                            bandwidth: number;
                            spreading_factor: number;
                            coding_rate: string;
                        };
                    };
                };
                rx_metadata: [
                    {
                        gateway_ids: {
                            gateway_id: string;
                        };
                        channel_rssi: number;
                        snr: number;
                        uplink_token: string;
                        packet_broker: {};
                    }
                ];
                received_at: string;
                device_channel_index: number;
            }
        ];
    };
    session: {
        started_at: string;
    };
}
