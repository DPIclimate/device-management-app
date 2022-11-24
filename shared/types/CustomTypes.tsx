export interface Device{
    id:string,
    applications_id:string,
    dev_eui:string,
    join_eui:string,
    created_at:string,
    updated_at:string,
    uid:string
}

export interface Application{
    id:string,
    created_at:string,
    updated_at:string,
    // devices:Device[]
    isFav:boolean,
    description:string
}

export interface CommMessage{
    m_type:string,
    rssi:string,
    snrs:string,
    time:string
}

export interface DeviceCommData{
    device:Device,
    communications:CommMessage[]
}

export interface Gateway{
    id:string,
    eui:string,
    updated_at:string,
    created_at:string
}


export interface GlobalState{
    ttn_auth_token:string,
    ttn_isValid_token:boolean,
    ttn_allowed_chars:RegExp,
    application_server:Regions,
    communication_server:Regions,
    network_status:boolean
}

//TTN server regions
export enum Regions{
    AU1="https://au1.cloud.thethings.network",
    EU1="https://eu1.cloud.thethings.network",
    NAM1="https://nam1.cloud.thethings.network"
}

export enum Store_Tokens{
    DEVICES="devices",
    AUTH_TOKEN="authToken",
    FAV_APPLICATIONS="appFavs",
    FAV_DEVICES="devFavs",
    APPLICATION_SERVER="server",
    COMMUNICATION_SERVER="commServer"
}

export enum Reducer_Actions{
    SET_AUTH_TOKEN="setAuthToken",
    SET_TOKEN_VALID="setTokenValid",
    SET_APPLICATION_SERVER="setAppServer",
    SET_COMMUNICATION_SERVER="setCommServer",
    SET_BASE_URL="setBaseUrl",
    SET_NETWORK_STATUS="setNetStatus"
}