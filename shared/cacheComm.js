import checkNetworkStatus from './NetworkStatus';
import * as Linking from 'expo-linking';
import { writeToStorage } from './functions/ManageLocStorage';
import { checkError } from './checkError';
import { getFromStore } from './functions/ManageLocStorage';

export const cacheComm = async() =>{
    console.log('caching commdata')

    const netStatus = await checkNetworkStatus()
	if (netStatus){

        if (global.TTN_TOKEN == null) {return}

        const apps = await getFromStore('/api/v3/applications')        
        if (apps==null) throw Error("No applications in storage")
        
        const devs = (await Promise.all(apps?.applications.map(async(item) => {
            const fromStore = await getFromStore(`/api/v3/applications/${item.ids.application_id}/devices`)
            return fromStore.end_devices
            }))).flat()
        
        for (const dev of devs){
            try{
                
                const url = `${global.COMM_URL}/applications/${dev.ids.application_ids.application_id}/devices/${dev.ids.device_id}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`
                const res = await fetch(url, {
                    method:"GET",
                    headers:global.headers
                }).then(checkError)
                const key =Linking.parse(url).path
                await writeToStorage(key, JSON.stringify(res))
            }
            catch(error){
                // console.log(error)
            }
        }
        console.log('finished caching comm data')
    }else{
        console.log("Unable to cache data. Not online")
    }
}