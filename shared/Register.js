import config from '../config';
import Error from '../shared/ErrorClass'
import { Alert } from 'react-native';

const registerDevice = async(device) =>{

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
                headers:config.headers,
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
const getEUI = async (appID) =>{

    //Request EUI from ttn
    let url = `${config.ttnBaseURL}/${appID}/dev-eui`
    console.log(url)
    let json = await fetch(url,{
        method:'POST',
        headers: config.headers
    }).then((response) => response.json())
    return json['dev_eui'];
}
const updateDevice = async(data) =>{
    let device = {...data}
    delete device['type']
    const appID = device['end_device']['ids']['application_ids']['application_id']
    const deviceName = device['end_device']['ids']['device_id']

    try{
        const url =  `${config.ttnBaseURL}/${appID}/devices/${deviceName}`
        const response = await fetch(url,{
            method:"PUT",
            headers:config.headers,
            body:JSON.stringify(device)
        }).then((response) => response.json())

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
export {registerDevice, getEUI, updateDevice}