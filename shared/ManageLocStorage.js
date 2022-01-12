import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config.json'

const APP_CACHE = 'applicationCache'

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
const getApplicationList = async(arg) =>{

    console.log('reading cache')
    let apps = []

    try{
        let fromStore = await AsyncStorage.getItem(APP_CACHE)
        fromStore = JSON.parse(fromStore)
        apps = fromStore

    }catch(error){
        console.log(error)
    }

    return apps
}
const cacheTTNdata = async() =>{ // Cache TTN data for offline use
        
    console.log('Caching ttn data')
    const url = `${config.ttnBaseURL}`
    let response = await fetch(url, {
        method:"GET",
        headers:config.headers
    }).then((response) => response.json())

    response = response['applications']
    const apps = response.map((app) => app['ids']['application_id'])
    let applications = []

    for (let app in apps){
        app = apps[app]

        const url = `${config.ttnBaseURL}/${app}/devices?field_mask=attributes,locations,description`
        let response = await fetch(url, {
            method:"GET",
            headers:config.headers
        }).then((response) => response.json())

        applications.push(
            {
                'application_id':app,
                'end_devices': response['end_devices']
            }
        )
    }
    try{
        await AsyncStorage.setItem(APP_CACHE, JSON.stringify(applications))

    }catch(error){
        console.log(error)
    }
    console.log('Cached ttn data successfully')

}

export {getDevice, getApplication, cacheTTNdata}
export default getApplicationList