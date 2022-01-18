import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json'

const getDevice = async(appID, devName, uid) =>{

    let devices = await getApplication(appID)
    for (const i in devices['end_devices']){
        const dev = devices['end_devices'][i]
        let name = dev['ids']['device_id']

        if (uid != undefined){
            console.log('uid comparison')
            let devUID = dev['attributes']['uid']

            if (uid == devUID){
                return dev
            }
        }else{    

            if (name == devName){
                return dev

            }
        }
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
const cacheTTNdata = async() =>{ // Cache TTN data for offline use
    
    if (global.valid_token){

        let applications = []

        try{
            console.log('Caching ttn data')
            const url = `${config.ttnBaseURL}`
            let response = await fetch(url, {
                method:"GET",
                headers:global.headers
            }).then((response) => response.json())

            response = response['applications']
            const apps = response.map((app) => app['ids']['application_id'])

            for (let app in apps){
                app = apps[app]

                const url = `${config.ttnBaseURL}/${app}/devices?field_mask=attributes,locations,description`
                let response = await fetch(url, {
                    method:"GET",
                    headers:global.headers
                }).then((response) => response.json())

                applications.push(
                    {
                        'application_id':app,
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
            // console.log('TTN data saved successfully')

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
        console.log('written token', bToken)

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
        console.log('read token', authToken)
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

export {getDevice, getApplication, cacheTTNdata, updateToken, getTTNToken, isFirstLogon, getApplicationList}