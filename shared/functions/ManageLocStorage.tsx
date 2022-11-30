import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Region } from 'react-native-maps';
import { APIApplicationsResponse, APICommResponse, APIDeviceResponse, APIGatewayResponse } from '../types/APIResponseTypes';
import { Device, DeviceUpdateRequest, Store_Tokens } from '../types/CustomTypes';

//Functions to manage local storage
const saveDevice = async(device) =>{

    let currentDevices = []
    console.log('reading')
    try{
        const fromStore = await AsyncStorage.getItem(global.DEV_STORE).then(JSON.parse)
        fromStore != null? currentDevices = [...currentDevices,
	...fromStore] : currentDevices = []

    }catch(error){
        console.log(error)
    }

    console.log('creating')
    currentDevices.push(device)
    
    console.log('writing')
    try{
        await AsyncStorage.setItem(global.DEV_STORE,
	JSON.stringify(currentDevices))
        return {
            success:true, 
            error:null
        }

    }catch(error){
        console.log(error)
        return {
            success:false, 
            error:error
        }
    }
}
export const save_update_to_storage=async(updateRequest:DeviceUpdateRequest):Promise<void>=>{

    /*
        Store a device update request, this device will now appear in the queue menu of the app
    */

    try{
        const in_storage=await AsyncStorage.getItem(Store_Tokens.DEVICE_UPDATES).then(JSON.parse)
        
        let devices:DeviceUpdateRequest[]=[]
        if (in_storage){
            devices=[...in_storage]
        }

        devices.push(updateRequest)

        await AsyncStorage.setItem(Store_Tokens.DEVICE_UPDATES, JSON.stringify(devices))
    }
    catch(error){
        console.log(error)
    }

    console.log("Save successful")
}

export const get_req_from_storage = async(key:string):Promise<APIApplicationsResponse[]|APIDeviceResponse[]|APIDeviceResponse|APIGatewayResponse[]|APICommResponse|null>=>{

    /*
        return a stored request from storage. key=url path
    */
   
    if (!key) return
    try{
        const response = await AsyncStorage.getItem(key).then(JSON.parse)
        return response
    }
    catch(error){
        console.log(error)
    }
}
const getOfflineDevs = async()=>{
    //Returns devices saved offline for online registration

    try{
        const store = await AsyncStorage.getItem(global.DEV_STORE).then(JSON.parse)
        return store
    }
    catch(error){
        console.log(error)
    }
}
export const writeToStorage = async(key:string, value:string):Promise<void>=>{
    /*
        Write a key value pair to storage
    */

    try{
        await AsyncStorage.setItem(key, value)
    }
    catch(error){
        console.log(error)
    }
}

export const getFavs = async(key:string):Promise<any> => {
    /*
        Get users' favourites under specified key

    */
   
    try{
        const result:JSON[] = await AsyncStorage.getItem(key).then(JSON.parse)
        if (result){
            return result
        }
        else{
            return []
        }
    }
    catch(error){
        console.log(error)
    }
}
export const write_token_to_storage = async(token:string):Promise<void> =>{
    
    /*
        Write users ttn token to storage

    */

    const tmpToken = token.replace('Bearer ','') //Does not matter whether user includes the word Bearer or not
    const bToken = `Bearer ${tmpToken}`

    try{
        await AsyncStorage.setItem(Store_Tokens.AUTH_TOKEN, bToken)

    }
    catch(error){
        console.log("Error in writing token to storage", error)
    }
    
}

export const write_app_server_to_storage = async(server:string):Promise<void>=>{
    /*
        Write a server selection to phone storage
    */
    try{
        await AsyncStorage.setItem(Store_Tokens.APPLICATION_SERVER, server)
    }
    catch(error){
        console.log("Error in writing app server to storage", error)
    }
}
export const write_comm_server_to_storage = async(server:string):Promise<void>=>{
    /*
        Write a server selection to phone storage
    */

    try{
        await AsyncStorage.setItem(Store_Tokens.COMMUNICATION_SERVER, server)
    }
    catch(error){
        console.log("Error in writing comm server to storage error")
    }
}

export {
	// updateToken,
	saveDevice,
    // getFavs,
    getOfflineDevs,
    // updateServer,
    // updateCommServer
}