import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json'

//Functions to manage local storage
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
const getFromStore = async(options)=>{
    //Method from retrieving from phones local storage

    console.log("retrieving from storage")
    let fromStore = undefined
    let error = undefined

    try{
        fromStore = await AsyncStorage.getItem(options.storKey)
        fromStore = JSON.parse(fromStore)
    }
    catch(error){
        error = error
    }

    //Makes sure data is in an expected format
    switch (options.type) {

        case 'ApplicationList':
            //Returns list of applications
            console.log('getting application list')
            return {fromStore, error}
            break;
        case 'DeviceList':
            //Returns list of devices in a specific application
            console.log('Getting dev list')
            fromStore.forEach((app)=>{

                if (app.application_id == options.appID){
                    fromStore = {...app}
                }
            })
            return {fromStore, error}
        case 'FavList':
            console.log('getting favs')
            if (error || fromStore == null){
                fromStore = []
            }
            return {fromStore,error}
            break;
        case 'QueDeviceList':
            if (error || fromStore == null){
                fromStore = []
            }
            return {fromStore, error}
            break;
        case 'CommsList':
            console.log("checking comm list")
            for (const i in fromStore){
                const dev = fromStore[i]
                if (dev.application_id == options.appID && dev.device_id == options.devID){
                    fromStore = dev.commData
                    return{fromStore, error}
                }
            }
            return {fromStore, error}
            break;
        default:
            console.log('in default')
            return {fromStore, error}
            break;
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
            
            const url = `${config.ttnBaseURL}/${id}/devices?field_mask=attributes,locations,description,name`
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
        await cacheCommData(applications)
        console.log("finished caching",applications.length, "application")
        
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
const cacheCommData = async(applications) =>{
    console.log('caching commdata')

    let devices = applications.map((app)=>{
        if (app.end_devices != undefined){
            return app.end_devices
        }
    })
    devices = [].concat(...devices) //Converts 2D array to 1D array

    let devComms = []
    for (const i in devices){

        const dev = devices[i]
        if (dev?.ids ==undefined){continue}

        try{
            const url = `https://au1.cloud.thethings.network/api/v3/ns/applications/${dev.ids.application_ids.application_id}/devices/${dev.ids.device_id}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`

            let response = await fetch(url,
                {
                    method:'GET',
                    headers:global.headers
                }).then((response) => response.json())
            
            devComms.push(
                {
                    'application_id':dev.ids.application_ids.application_id,
                    'device_id':dev.ids.device_id,
                    'commData':response
                }
            )
        }catch(error){
            console.log('comm cache failed for',dev.ids.device_id, error)
        }
    }
    try{
        // console.log(devComms)
        await AsyncStorage.setItem(global.COMM_CACHE,
	JSON.stringify(devComms))
        console.log('caching comms succeeded')

    }catch(error){
        console.log(error)
        console.log("Caching comms data failed")
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
export {
	getFromStore,
	cacheTTNdata,
	updateToken,
	setTTNToken,
	saveDevice,
}