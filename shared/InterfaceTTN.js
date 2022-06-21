import { Alert } from 'react-native';
import { useFetch } from './useFetch';
import newDeviceData from '../repositories/newDeviceData';

//Functions used to interface with TTN

const registerDevice = async(device) =>{

    console.log('in register')

    const appID = device.end_device.ids.application_ids.application_id

    if (device.end_device?.ids?.dev_eui?.length == 0 && device.type != 'move'){
        //If eui was not providered request one from TTN
        const {eui, error} = await getEUI(appID)
        if (error){
            device.end_device.ids.dev_eui = null
        }
        else{
            device.end_device.ids.dev_eui = eui
        }
    }

    delete device.type

    try{
        console.log('making request to register')

        const url = `${global.BASE_URL}/applications/${appID}/devices`
        let resp = await fetch(url,
            {
                method:'POST',
                headers:global.headers,
                body:JSON.stringify(device)
            }).then((res) => res.json())
        
        if ('code' in resp){
            //If key code exists then an error occured
            throw new Error(resp.details[0].message_format)
        }
        return {
            success:true,
            error:null
        }
    }
    catch (error){
        return {
            success:false,
            error:error
        }
    }

} 
const getEUI = async (appID) =>{

    //Request EUI from ttn
    try{

        let url = `${global.BASE_URL}/applications/${appID}/dev-eui`
        console.log(url)
        let resp = await fetch(url,{
            method:'POST',
            headers: global.headers
        }).then((response) => response.json())

        if ('code' in resp){
            if (resp.code == 3){
                throw Error(`Application issued devEUI limit of ${resp.details[0]?.attributes?.dev_eui_limit} reached`)
            }
            throw Error(resp.message)
        }

        return {
            eui: resp.dev_eui,
            error:null
        }
    }
    catch(error){
        return {
            eui:null,
            error:error
        }
    }
}

const updateDevice = async(data) =>{
    console.log('now updating the device')
    let device = {...data}
    delete device.type
    const appID = device.end_device.ids.application_ids.application_id
    const deviceID = device.end_device.ids.device_id

    console.log(device)
    try{
        const url =  `${global.BASE_URL}/applications/${appID}/devices/${deviceID}`
        console.log(url)
        const response = await fetch(url,{
            method:"PUT",
            headers:global.headers,
            body:JSON.stringify(device)
        }).then((response) => response.json())

        console.log("response", response)
        if ('code' in response){
            //If key code exists then an error occured
            throw new Error(response.message)
        }
        return {
            success:true,
            error:null
        }
    }
    catch(error){
        console.log(`An error occured, in update ${error}`)
        return {
            success:false,
            error:error
        }
    }
}

const checkUnique = async(data) =>{ //Checks that a particular device is unique

    console.log('checking unique')
    const deviceEUI = data.end_device.ids.dev_eui
    const deviceUID = data.end_device.attributes.uid
    const deviceID = data.end_device.ids.device_id
    const appID = data.end_device.ids.application_ids.application_id

    let url =  `${global.BASE_URL}/applications/${appID}/devices?field_mask=attributes`
    let response = await fetch(url,{
        method:"GET",
        headers:global.headers
    }).then((response) => response.json())

    if ('code' in response){
        return{
            isUnique:false,
            error:response.message
        }
    }

    const devices = response.end_devices

    let euiList = devices.map((dev) => dev?.ids?.dev_eui)
    let IDList = devices.map((dev) => dev?.ids?.device_id)
    let uidList = devices.map((dev) => dev?.attributes?.uid)

    try{
        euiList.forEach((eui)=>{
            if (deviceEUI == eui && eui != undefined){
                return{
                    isUnique:false,
                    error:'Device EUI already exists'
                }
            }})
       
        uidList.forEach((uid) =>{
            if (deviceUID == uid && uid != undefined){
                return{
                    isUnique:false,
                    error:'Device UID already exists'
                }
            }})

        IDList.forEach((ID)=>{
            if (deviceID == ID && ID != undefined){
                return{
                    isUnique:false,
                    error:'Device ID already exists'
                }
            }
        })
        
    }catch(error){
        return{
            isUnique:false,
            error:error
        }
    }

    return {
        isUnique:true,
        error:null
    }
}
// const updateDetails = (data) =>{

//     console.log('updating details')
//     data = data.end_device
//     let body = {
//         "end_device":{
//             "ids":{
//                 "device_id":data.ids.device_id,
//                 "application_ids":{
//                     "application_id":data.ids.application_ids.application_id
//                 }
//             },
//             "attributes":{
//                 "uid":data.attributes.uid.toUpperCase()
//             }
//         },
//         "field_mask": {
//           "paths": [
//             "attributes"
//           ]
//         }
//     }

//     if (data.locations != undefined){
        
//         body.end_device.locations = data.locations
//         body.field_mask.paths.push('locations')
//     }
//     return body
// }
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

        global.headers["Authorization"] = token
        global.TTN_TOKEN = token

        return true
    }
}
const getApplications = async() => {//Request applications from ttn

    if (global.valid_token != true) return null

    try{
        const url = `${global.BASE_URL}/applications?field_mask=description`
        let response = await fetch(url, {
            method:"GET",
            headers:global.headers
        }).then((response) => response.json())

        response = response.applications
        return response

    }catch(error){
        console.log(error)
    }

}
const deleteDevice = async(device) =>{

    console.log('deleting device', device.ids.device_id)
    const appID = device.ids.application_ids.application_id
    const devID = device.ids.device_id

    const url = `${global.BASE_URL}/applications/${appID}/devices/${devID}`
    console.log('deleting', url)
    try{
        const response = await fetch(url,{
            method:'DELETE',
            headers:global.headers
        })

        if ('code' in response){
            //If key code exists then an error occured
            throw new Error(json.code, json.message, deviceID)
        }
        return true
    }catch(error){
        console.log("An error occured", error)
        return false
    }
    
}  
const moveDevice = async(device, moveTo) =>{

    //Get current device object
    const app = await useFetch(`${global.BASE_URL}/applications/${device.appID}/devices?field_mask=attributes,locations,description`, {type:'DeviceList', appID:device.appID, storKey:global.APP_CACHE}, true)

    let selectedDevice = null
    for (const i in app?.end_devices){
      const dev = app.end_devices[i]
      if (dev.ids.device_id == device.devID){
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
    let newDevice = Object.assign(newDeviceData().end_device,selectedDevice)
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
    // updateDetails,
    getApplications,
    moveDevice
}