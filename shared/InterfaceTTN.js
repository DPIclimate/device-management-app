import config from '../config';
import Error from './ErrorClass'
import { Alert } from 'react-native';

const registerDevice = async(device) =>{

    console.log('in register')
    const isUnique = await checkUnique(device)

    if (isUnique){
        console.log('device is unique')
        const appID = device['end_device']['ids']['application_ids']['application_id']
        const deviceName = device['end_device']['ids']['device_id']

        if (device['end_device']['ids']['dev_eui'].length == 0){
            //If eui was not providered request one from TTN
            device['end_device']['ids']['dev_eui'] = await getEUI(appID)
        }
        
        try{
            console.log('making request')

            const url = `${config.ttnBaseURL}/${appID}/devices`
            let json = await fetch(url,
                {
                    method:'POST',
                    headers:global.headers,
                    body:JSON.stringify(device)
                },

                ).then((response) => response.json())

            if ('code' in json){
                //If key code exists then an error occured
                throw new Error(json['code'], json['message'], deviceName)
            }
            else{
                Alert.alert("Success!", "Device was successfully registered.")
                return true
            }
        }
        catch (error){
            console.log("An error occured", error)
            error.alertWithCode()
            return false
        }
    }
    else{
        return true
    }
}
const getEUI = async (appID) =>{

    //Request EUI from ttn
    let url = `${config.ttnBaseURL}/${appID}/dev-eui`
    console.log(url)
    let json = await fetch(url,{
        method:'POST',
        headers: global.headers
    }).then((response) => response.json())
    return json['dev_eui'];
}

const updateDevice = async(data) =>{
    console.log('now updating the device')
    let device = {...data}
    delete device['type']
    const appID = device['end_device']['ids']['application_ids']['application_id']
    const deviceName = device['end_device']['ids']['device_id']

    try{
        const url =  `${config.ttnBaseURL}/${appID}/devices/${deviceName}`
        const response = await fetch(url,{
            method:"PUT",
            headers:global.headers,
            body:JSON.stringify(device)
        }).then((response) => response.json())
        console.log(response)
        if ('code' in response){
            //If key code exists then an error occured
            throw new Error(json['code'], json['message'], deviceName)
        }
        else{
            Alert.alert('Device Successfully updated')
        }
        return true
    }
    catch(error){
        console.log("An error occured", error)
        error.alertWithCode()
        return false
    }
}

const checkUnique = async(data) =>{

    console.log('checking unique')
    const deviceEUI = data['end_device']['ids']['dev_eui']
    const deviceUID = data['end_device']['attributes']['uid']
    const deviceName = data['end_device']['ids']['device_id']
    const appID = data['end_device']['ids']['application_ids']['application_id']

    let url =  `${config.ttnBaseURL}/${appID}/devices?field_mask=attributes`
    let response = await fetch(url,{
        method:"GET",
        headers:global.headers
    }).then((response) => response.json())
    .then((response) =>{
        if ('code' in response) throw new Error(response['code'], response['message'], deviceName)
        return response

    }).catch((error) =>{ 
        error.alertWithCode()
        console.log('this error')
        setLoadingState(false)
        return null
    })

    if (response == null) return null

    const devices = response['end_devices']
    let euiList = []
    let uidList = []
    let nameList = []
    for (const object in devices){
        const device = devices[object]

        try{
            euiList.push(device['ids']['dev_eui'])
            nameList.push(device['ids']['device_id'])
            uidList.push(device['attributes']['uid'])

        }catch(error){//Error may occur if device does not have uid
            // console.log(error, "moving on")
        }
    }

    try{

        for (const item in euiList){
            let eui = euiList[item]
            if (deviceEUI == eui && eui != undefined){
                throw new Error(null, 'Device EUI already exists')
            }
        }
        for (const item in uidList){
            let uid = uidList[item]
            if (deviceUID == uid && uid != undefined){
                // console.log(deviceName, nameList[item], deviceUID, uid)
                throw new Error(null, 'Device UID already exists', deviceName)
            }
        }
        
    }catch(error){
        error.alert()
        return false
    }

    for (const item in nameList){
        let name = nameList[item]
        if (deviceName == name && name != undefined){
            Alert.alert("Device already exists",`Device ${deviceName} already exists in application ${appID}, would you like to add these updated details to the device?`,[
                {
                    text:'Yes', 
                    onPress:() => updateDetails(data)
                },
                {
                    text:'No',
                    onPress:() => console.log("No")
                }
            ])
            return false
        }
    }

    return true
}
const updateDetails = async(data) =>{

    console.log('updating details')
    data = data['end_device']
    let body = {
        "end_device":{
            "ids":{
                "device_id":data['ids']['device_id'],
                "application_ids":{
                    "application_id":data['ids']['application_ids']['application_id']
                }
            },
            "attributes":{
                "uid":data['attributes']['uid'].toUpperCase()
            }
        },
        "field_mask": {
          "paths": [
            "attributes"
          ]
        }
    }

    if (data['locations'] != undefined){
        
        body['end_device']['locations'] = data['locations']
        body['field_mask']['paths'].push('locations')
    }
    console.log(body)

    await updateDevice(body)
}
const validateToken = async(token) =>{

    if (token != undefined){
        token = token.replace('Bearer ','')
        token = `Bearer ${token}`
    }

    headers = token == undefined? global.headers : {"Authorization":token}

    let req = await fetch(`https://eu1.cloud.thethings.network/api/v3/applications`, {
        method:"GET",
        headers:headers
    }).then((response) => response.json())
    
    if (req == undefined || 'code' in req){
        console.log("TTN Token is invalid")
        return false
    }
    else{
        console.log("TTN Token is valid")

        global.headers = {"Authorization":token}
        global.TTN_TOKEN = token

        return true
    }
}
export {registerDevice, getEUI, updateDevice, validateToken}