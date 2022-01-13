import config from './config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';

global.APP_CACHE = 'applicationCache'
global.DEV_STORE = 'devices'
global.LOC_UPDATES = 'locationUpdates'
global.AUTH_TOKEN = 'authToken'

async function getHeader () {

    if (config.headers==undefined){

        try{
            let authToken = await AsyncStorage.getItem(AUTH_TOKEN)
            let header = {"Authorization":authToken}
            global.headers = header
            console.log('Header retrieved from storage', header)

        }
        catch (error){
            console.log(error)
        }
    }
    else{
        global.headers = config.headers
        console.log('Header retrieved from config file', config.headers)

    }
}
getHeader()
