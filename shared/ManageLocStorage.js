import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import config from '../config.json'
import { getApplications } from './InterfaceTTN';

//Functions to manage local storage

const getDevice = async(appID,
	devName,
	uid) =>{

    let devices = await getApplication(appID)

    for (const i in devices['end_devices']){
        const dev = devices['end_devices'][i]
        let name = dev['ids']['device_id']

        if (uid != undefined){

            try{
                let devUID = dev['attributes']['uid']

                if (uid == devUID){
                    return dev
                }
            }catch(error){
            }
            
        }else{    

            if (name == devName){
                console.log(name,
	devName)
                return dev

            }
        }
    }
}
const saveDevice = async(device) =>{

    let currentDevices = []
    console.log('reading')
    try{
        let fromStore = await AsyncStorage.getItem(global.DEV_STORE)
        fromStore = JSON.parse(fromStore)
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
        return true

    }catch(error){
        console.log(error)
        return false
    }
}
const getSavedDevices = async() =>{

    try{
        let fromStore = await AsyncStorage.getItem(global.DEV_STORE)
        fromStore = JSON.parse(fromStore)

        if (fromStore == null) return []
        return fromStore
        
    }catch(error){
        console.log(error)
    }
}
const getSavedLocations = async() =>{
    
    try{
        let fromStore = await AsyncStorage.getItem(global.LOC_UPDATES)
        fromStore = JSON.parse(fromStore)

        if (fromStore == null) return []
        return fromStore

    }catch(error){
        console.log(error)
    }
}
const getFromStore = async(type)=>{

    let fromStore = undefined
    let error = undefined

    try{
        fromStore = await AsyncStorage.getItem(global.APP_CACHE)
        fromStore = JSON.parse(fromStore)
    }
    catch(error){
        error = error
    }
    console.log(type)
    switch (type?.type) {

        case 'ApplicationList':
            //Returns list of applications
            console.log('getting application list')
            return {fromStore, error}

        case 'DeviceList':
            //Returns list of devices in a specific application
            console.log('Getting dev list')
            let DevList = []
            fromStore.forEach((app)=>{

                if (app.application_id == type.key){
                    fromStore = {...app}
                    return
                }
            })
            return {fromStore, error}

        case 'Device':
            //Returns specific device in specific application
            //TODO
            break;
        default:
            console.log('in default')
            return {fromStore, error}
    }
}
const cacheTTNdata = async(app_response) =>{ // Cache TTN data for offline use

    console.log('chaching data')

    let applications = []

    try{
        const apps = app_response.map((app) => ({id:app['ids']['application_id'],
	    description:app['description']}))

        for (let app in apps){
            const id = apps[app].id
            
            const url = `${config.ttnBaseURL}/${id}/devices?field_mask=attributes,locations,description`
            let response = await fetch(url,
            {
                method:"GET",
                headers:global.headers
            }).then((response) => response.json())

            applications.push(
                {
                    'application_id':id,
                    'description':apps[app].description,
                    'end_devices': response['end_devices']
                }
            )
        }
    }catch(error){
        console.log(error)
        console.log("Caching TTN data failed")
    }
    try{
        await AsyncStorage.setItem(global.APP_CACHE,
	JSON.stringify(applications))
        console.log('TTN data saved successfully')

    }catch(error){
        console.log(error)
        console.log("Caching TTN data failed")
    }
}
const updateToken = async(token) =>{
    
    let tmpToken = token.replace('Bearer ','') //Does not matter whether user includes the word Bearer or not
    let bToken = `Bearer ${tmpToken}`

    try{
        await AsyncStorage.setItem(global.AUTH_TOKEN_STOR, bToken)
        global.headers = {"Authorization":bToken}
        global.TTN_TOKEN = bToken

    }
    catch(error){
        console.log(error)
    }
    
}

const setTTNToken = async() =>{
    
// Gets bearer token from memory and sets it globaly
    try{
        let authToken = await AsyncStorage.getItem(global.AUTH_TOKEN_STOR)
        global.headers = {"Authorization":authToken}
        global.TTN_TOKEN = authToken

        return authToken

    }
    catch (error){
        console.log(error)
    }
}

const isFirstLogon = async() =>{

    try{
        let first = await AsyncStorage.getItem('isFirstLogon')

        if (first == null){

            console.log("Users first logon")
            return true
        }
        else{
            console.log("Is not first logon")
            return false
        }
    }
    catch(error){
        console.log(error)
    }
}
const getFavourites = async(key)=>{
    console.log(key)
    try{
        let fromStore = JSON.parse(await AsyncStorage.getItem(key))
        if (fromStore == null) fromStore = []

        return fromStore
    }
    catch(error){
        console.log(error)
        return []
    }
}
export {getFavourites,
	getFromStore,
	// getDevice,
	// getApplication,
	cacheTTNdata,
	updateToken,
	setTTNToken,
	isFirstLogon,
	// getApplicationList,
	saveDevice,
	getSavedDevices,
	getSavedLocations}