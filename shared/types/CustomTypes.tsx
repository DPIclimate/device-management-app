export interface Device {
    id: string;
    name: string;
    description:string|null;
    applications_id: string;
    dev_eui: string;
    join_eui: string;
    created_at: string;
    updated_at: string;
    uid: string | undefined;
    isFav: boolean;
    location:{
        latitude: number|undefined;
        longitude: number|undefined;
        altitude: number|undefined;
        source: string|undefined;
    };
}

export interface Application {
    id: string;
    created_at: string;
    name:string
    updated_at: string;
    isFav: boolean;
    description: string;
    // devices:Device[]
}

export interface CommMessage {
    m_type: string|undefined;
    rssi: number|undefined;
    snr: number|undefined;
    time: string;
}

export interface GlobalState {
    ttn_auth_token: string;
    ttn_allowed_chars: RegExp;
    application_server: Regions;
    communication_server: Regions;
    network_status: boolean;
}

export interface HTTP_Response{
    status:number,
    status_text:string
}

export interface DeviceUpdateRequest{
    /*
        Used to request an update for a device, this can be executed immediately or stored for later execution
        */

    device:Device,
    action:string
}

//TTN server regions
export enum Regions {
    AU1 = "https://au1.cloud.thethings.network",
    EU1 = "https://eu1.cloud.thethings.network",
    NAM1 = "https://nam1.cloud.thethings.network",
}

export enum Store_Tokens {
    DEVICE_UPDATES="devUpdates",
    DEVICES = "devices",
    AUTH_TOKEN = "authToken",
    FAV_APPLICATIONS = "appFavs",
    FAV_DEVICES = "devFavs",
    APPLICATION_SERVER = "server",
    COMMUNICATION_SERVER = "commServer",
}

export enum GlobalState_Actions {
    SET_AUTH_TOKEN = "setAuthToken",
    SET_TOKEN_VALID = "setTokenValid",
    SET_APPLICATION_SERVER = "setAppServer",
    SET_COMMUNICATION_SERVER = "setCommServer",
    SET_BASE_URL = "setBaseUrl",
    SET_NETWORK_STATUS = "setNetStatus",
}
