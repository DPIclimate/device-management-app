import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Region } from 'react-native-maps';
import { Store_Tokens } from '../types/CustomTypes';

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

const getFromStore = async(url)=>{
    if (!url) return
    //Return data from storage in format as if it came from TTN API
    try{
        const path=Linking.parse(url).path
        
        const fromStore = await AsyncStorage.getItem(path).then(JSON.parse)
        return fromStore
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
const writeToStorage = async(key, value)=>{
    //Async method to write a key value pair to storage
    try{
        await AsyncStorage.setItem(key, value)
        return true
    }
    catch(error){
        console.log(error)
        return false
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
        await AsyncStorage.setItem(global.AUTH_TOKEN_STOR, bToken)

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
	getFromStore,
	writeToStorage,
	// updateToken,
	saveDevice,
    // getFavs,
    getOfflineDevs,
    // updateServer,
    // updateCommServer
}