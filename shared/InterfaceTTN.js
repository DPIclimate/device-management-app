import config from '../config';
import Error from './ErrorClass'
import { Alert } from 'react-native';
import { useFetch } from './useFetch';
import newDeviceData from '../repositories/newDeviceData';

const registerDevice = async(device) =>{

    console.log('in register')
    console.log(device)
    // return true
    const appID = device.end_device.ids.application_ids.application_id
    const deviceID = device.end_device.ids.device_id

    if (device.end_device?.ids?.dev_eui?.length == 0 && device.type != 'move'){
        //If eui was not providered request one from TTN
        device.end_device.ids.dev_eui = await getEUI(appID)
    }
    delete device.end_device.type

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
            throw new Error(json['code'], json['message'], deviceID)
        }
        return true
    }
    catch (error){
        console.log("An error occured", error)
        console.log("in register error")
        error.alertWithCode()
        return false
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
    const deviceID = device['end_device']['ids']['device_id']

    try{
        const url =  `${config.ttnBaseURL}/${appID}/devices/${deviceID}`
        const response = await fetch(url,{
            method:"PUT",
            headers:global.headers,
            body:JSON.stringify(device)
        }).then((response) => response.json())

        if ('code' in response){
            //If key code exists then an error occured
            throw new Error(response['code'], response['message'], deviceID)
        }
        else{
            Alert.alert('Device Successfully updated')
        }
        return true
    }
    catch(error){
        console.log("An error occured, in update", error)
        return false
    }
}

const checkUnique = async(data) =>{ //Checks that a particular device is unique

    console.log('checking unique')
    const deviceEUI = data['end_device']['ids']['dev_eui']
    const deviceUID = data['end_device']['attributes']['uid']
    const deviceID = data['end_device']['ids']['device_id']
    const appID = data['end_device']['ids']['application_ids']['application_id']

    let url =  `${config.ttnBaseURL}/${appID}/devices?field_mask=attributes`
    let response = await fetch(url,{
        method:"GET",
        headers:global.headers
    }).then((response) => response.json())
    .then((response) =>{
        if ('code' in response) throw new Error(response['code'], response['message'], deviceID)
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
    let IDList = []

    devices.map((dev) =>{
        try{
            euiList.push(dev['ids']['dev_eui'])
            IDList.push(dev['ids']['device_id'])
            uidList.push(dev['attributes']['uid'])

        }catch(error){//Error may occur if device does not have uid
            // console.log(error, "moving on")
        }
    })

    try{
        euiList.map((eui)=>{
            if (deviceEUI == eui && eui != undefined){
                throw new Error(null, 'Device EUI already exists')
            }})
       
        uidList.map((uid) =>{
            if (deviceUID == uid && uid != undefined){
                // console.log(deviceID, IDList[item], deviceUID, uid)
                console.log("uid already exists")
                throw new Error(null, 'Device UID already exists', deviceID)
            }})
        
    }catch(error){
        error.alert()
        return null
    }
    try{
        IDList.map((ID)=>{
            if (deviceID == ID && ID != undefined){
                console.log("ID already exists")
                throw new Error(null, null, ID)
            }
        })
    }
    catch(error){
        return false
    }

    return true
}
const updateDetails = (data) =>{

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
    return body
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
const getApplications = async() => {//Request applications from ttn

    if (global.valid_token != true) return null

    try{
        const url = `${config.ttnBaseURL}?field_mask=description`
        let response = await fetch(url, {
            method:"GET",
            headers:global.headers
        }).then((response) => response.json())

        response = response['applications']
        return response

    }catch(error){
        console.log(error)
    }

}
const deleteDevice = async(device) =>{

    console.log('deleting device', device.ids.device_id)
    const appID = device.ids.application_ids.application_id
    const devID = device.ids.device_id

    const url = `${config.ttnBaseURL}/${appID}/devices/${devID}`
    console.log('deleting', url)
    try{
        const response = await fetch(url,{
            method:'DELETE',
            headers:global.headers
        })

        if ('code' in response){
            //If key code exists then an error occured
            throw new Error(json['code'], json['message'], deviceID)
        }
        return true
    }catch(error){
        console.log("An error occured", error)
        error.alertWithCode()
        return false
    }
    
}  
const moveDevice = async(device, moveTo) =>{

    //Get current device object
    const app = await useFetch(`${config.ttnBaseURL}/${device.appID}/devices?field_mask=attributes,locations,description`, {type:'DeviceList', appID:device.appID, storKey:global.APP_CACHE}, true)

    let selectedDevice = null
    for (const i in app?.end_devices){
      const dev = app.end_devices[i]
      if (dev.ids.device_id == device.ID){
        selectedDevice = dev
      }
    }

    if (selectedDevice == null) {Alert.alert("Failed to move", "An error occured trying to find device, move aborted"); return}

    //Delete old device
    console.log("deleting")
    success = await deleteDevice(selectedDevice)
    if (!success){
      Alert.alert("Failed to remove", "Was able to register device with new application, but failed to remove the existing device")
      return false
    }
    

    //Register new device
    let newDevice = Object.assign(newDeviceData()['end_device'],selectedDevice)
    newDevice.ids.application_ids.application_id = moveTo
    newDevice.type = 'move'

    // Required for register device function to work
    newDevice = {
      'end_device':newDevice
    }
    
    let success = await registerDevice(newDevice)
    if (!success) {
      Alert.alert("Move failed", "Moving device failed for an unkown reason")
      return false
    }
}
export {
    registerDevice,
    getEUI,
    updateDevice,
    validateToken,
    checkUnique,
    updateDetails,
    getApplications,
    moveDevice
}