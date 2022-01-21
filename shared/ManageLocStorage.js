import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import config from '../config.json'
import { getApplications } from './InterfaceTTN';

//Functions to manage local storage

const getDevice = async(appID, devName, uid) =>{

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
                console.log(name, devName)
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
        fromStore != null? currentDevices = [...currentDevices, ...fromStore] : currentDevices = []

    }catch(error){
        console.log(error)
    }

    console.log('creating')
    currentDevices.push(device)
    
    console.log('writing')
    try{
        await AsyncStorage.setItem(global.DEV_STORE, JSON.stringify(currentDevices))
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

const getApplication = async(appID) =>{

    const apps = await getApplicationList()

    if (apps != null){

        for (let app in apps){
            let app_obj = apps[app]
            const id = app_obj['application_id']

            if (appID == id){
                console.log('finished reading cache')
                return app_obj
            }
        }
    }
    console.log('finished reading cache')
    return null
}
const getApplicationList = async() =>{

    console.log('reading cache')
    let apps = []

    try{
        let fromStore = await AsyncStorage.getItem(global.APP_CACHE)
        fromStore = JSON.parse(fromStore)
        apps = fromStore

    }catch(error){
        console.log(error)
    }

    return apps
}
const cacheTTNdata = async(app_response) =>{ // Cache TTN data for offline use
    
    if (global.valid_token){

        let applications = []

        try{
            // console.log('Caching ttn data')
            // const url = `${config.ttnBaseURL}?field_mask=description`
            // let app_response = await fetch(url, {
            //     method:"GET",
            //     headers:global.headers
            // }).then((response) => response.json())

            // app_response = app_response['applications']
            // const app_response = await getApplications()
            const apps = app_response.map((app) => ({id:app['ids']['application_id'], description:app['description']}))

            for (let app in apps){
                const id = apps[app].id
                
                const url = `${config.ttnBaseURL}/${id}/devices?field_mask=attributes,locations,description`
                let response = await fetch(url, {
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
            await AsyncStorage.setItem(global.APP_CACHE, JSON.stringify(applications))
            console.log('TTN data saved successfully')

        }catch(error){
            console.log(error)
            console.log("Caching TTN data failed")
        }
    }
}
const updateToken = async(token) =>{
    
    console.log('here')

    let tmpToken = token.replace('Bearer ','') //Does not matter whether user includes the word Bearer or not
    let bToken = `Bearer ${tmpToken}`

    try{
        await AsyncStorage.setItem(global.AUTH_TOKEN_STOR, bToken)
        global.headers = {"Authorization":bToken}

    }
    catch(error){
        console.log(error)
    }
    
}

const getTTNToken = async() =>{
// Gets bearer token from memory and updates the global req header and returns the auth token
    try{
        let authToken = await AsyncStorage.getItem(global.AUTH_TOKEN_STOR)
        global.headers = {"Authorization":authToken}

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
export {getFavourites, getDevice, getApplication, cacheTTNdata, updateToken, getTTNToken, isFirstLogon, getApplicationList, saveDevice, getSavedDevices, getSavedLocations}