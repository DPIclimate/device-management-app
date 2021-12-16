function newDeviceData(props) {
    let data = {
        "end_device":{
            "ids": {
                "device_id": "",
                "application_ids": {
                    "application_id": ""
                },
                "dev_eui": "",
                "join_eui": "0000000000000000"
            },
            "network_server_address": "au1.cloud.thethings.network",
            "application_server_address": "au1.cloud.thethings.network",
            "join_server_address": "au1.cloud.thethings.network",
            "field_mask":{
                "paths":["network_server_address","application_server_address","join_server_address","locations"]
            },
            "attributes":{
                "uid":""
            }
        }
    }
    return (data);
}

export default newDeviceData;