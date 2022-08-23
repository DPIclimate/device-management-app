import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

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
    catch{
        console.log(error)
        return false
    }
}

const getFavs = async(key) => {
    try{
        const result = await AsyncStorage.getItem(key).then(JSON.parse)
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
const updateToken = async(token) =>{
    
    let tmpToken = token.replace('Bearer ','') //Does not matter whether user includes the word Bearer or not
    let bToken = `Bearer ${tmpToken}`

    try{
        await AsyncStorage.setItem(global.AUTH_TOKEN_STOR, bToken)
        global.headers["Authorization"] = bToken
        global.TTN_TOKEN = bToken

    }
    catch(error){
        console.log(error)
    }
    
}

const updateServer = async(server)=>{

    try{
        await AsyncStorage.setItem(global.SERVER_STOR, server)
    }
    catch(error){
        console.log(error)
    }
}

const updateCommServer = async(server)=>{
    try{
        await AsyncStorage.setItem(global.COMM_SERVER_STOR, server)
    }
    catch(error){
        console.log(error)
    }
}

export {
	getFromStore,
	writeToStorage,
	updateToken,
	saveDevice,
    getFavs,
    getOfflineDevs,
    updateServer,
    updateCommServer
}