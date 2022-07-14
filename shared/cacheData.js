import checkNetworkStatus from './NetworkStatus';
import * as Linking from 'expo-linking';
import { writeToStorage } from './ManageLocStorage';
import { checkError } from './checkError';

export const cacheData = async() =>{
    //Cache TTN data
	const netStatus = await checkNetworkStatus()
	if (netStatus){
		
		try{
			if (global.TTN_TOKEN == null) throw Error("User not logged in")
			
			console.log("Caching ttn data")
			const app_url = `${global.BASE_URL}/applications?field_mask=description`
			const applications = await fetch(app_url,
			{
					method:"GET",
					headers:global.headers
			}).then(checkError)

			const key =Linking.parse(app_url).path
			await writeToStorage(key, JSON.stringify(applications))
			
			for (const app of applications.applications){
				const id = app.ids.application_id

				const dev_url=`${global.BASE_URL}/applications/${id}/devices?field_mask=attributes,locations,description,name`
				const devices = await fetch(dev_url,
				{
					method:"GET",
					headers:global.headers
				}).then(checkError)

				const key=Linking.parse(dev_url).path
				await writeToStorage(key, JSON.stringify(devices))
			}

			// TODO - separate hook --->>>> await cacheCommData(applications)
			console.log("finished caching",applications.applications.length, "applications")

		}catch(err){
			if (err.name === 'AbortError') {
				console.log('Fetch aborted');
			} else {
				console.log("An error occurred while caching", err.message)
			}
		}

	}else{
		console.log("Unable to cache data. Not online")
	};
};