import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { getFromStore } from '../functions/ManageLocStorage';
import { APIApplicationsResponse, APICommResponse, APIDeviceResponse, APIGatewayResponse } from '../types/APIResponseTypes';
// import { checkError } from './checkError';
import { useNetworkStatus } from './useNetworkStatus';

interface useFetchResponse{
	response:APIApplicationsResponse[]|APIDeviceResponse[]|APIGatewayResponse[]|APICommResponse, //Response type depends on endpoint given to useFetch 
	isLoading:boolean,
	error:number|null,
	retry():void
}

export const useFetch = (url:string):useFetchResponse =>{

	const [response, set_response] = useState<APIApplicationsResponse[]|APIDeviceResponse[]|APIGatewayResponse[]|APICommResponse>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<number|null>(null);
	const [refetch, setRefetch] = useState<boolean>(false)

	const [state, dispatch] = useContext(GlobalContext)

	const retry = ():void =>{
		console.log('retry hit')
		setIsLoading(true)
		setError(null)
		set_response(null)
		setRefetch(prev => !prev)
	}

	useEffect(() => {

		const abortCont:AbortController = new AbortController();

		const fetchData = async():Promise<void> =>{
			
			if (state.network_status){
				try{

					console.log('fetching', url)
					const resp:Response = await fetch(url, { 
						signal: abortCont.signal,
						headers:{
							"Authorization":state.ttn_auth_token,
							"Content-Type": "application/json"
						},
						method:'GET'
					})

					if (resp.status === 200){
						const json:any = await resp.json();
						if (!json) return

						//Find out what type of response it is
						if ('end_devices' in json){
							//Is a device response
							const data:APIDeviceResponse[]=json.end_devices
							set_response(data)
						}
						else if ('applications' in json){
							//Is an applications response
							const data:APIApplicationsResponse[]=json.applications
							set_response(data)
						}
						else if ('mac_state' in json){
							//Is a device communications response
							const data:APICommResponse=json
							set_response(data)
						}

						setIsLoading(false);
						setError(null);
						
					}else{
						setError(resp.status)
						setIsLoading(false)
						set_response(null)
					}

				}catch(err){
					if (err.name === 'AbortError') {
						console.log('Fetch aborted');
					} else {
						console.log(err.message)
						// setError(err.message);
						setIsLoading(false);
					}
				}

			}else{
				//TODO
				console.log('in offline')
				//Get offline version of request
				const fromStore = await getFromStore(url)
				set_response(fromStore)
				setIsLoading(false)
				setError(null)
			}
		}
		fetchData()
		return () => abortCont.abort();
	}, [url, refetch]);

	return { response, isLoading, error, retry };
};
// export const useFetch = async(url) =>{
// 	//Use fetch method that returns the results depending on internet connection
// 	const netStatus = await checkNetworkStatus()

// 	if (netStatus){
				
// 		try{
// 			console.log(url)
// 			if (global.TTN_TOKEN == null) throw Error("User not logged in")
// 			if (url.includes(undefined)) throw Error("Invalid URL")

// 			console.log('fetching', url)
// 			const resp = await fetch(url, { 
// 				headers:global.headers,
// 				method:'GET'
// 			}).then(checkError)

// 			return resp
// 		}catch(err){
// 			console.log(err)
// 		}

// 	}else{
// 		//Get offline version of request
// 		const fromStore = await getFromStore(url)
// 		return fromStore
// 	}
// }
// export default useFetchState;
