import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { get_req_from_storage } from '../functions/ManageLocStorage';
import { APIApplicationsResponse, APICommResponse, APIDeviceResponse, APIGatewayResponse } from '../types/APIResponseTypes';
// import { checkError } from './checkError';
import { useNetworkStatus } from './useNetworkStatus';
import * as Linking from 'expo-linking';

interface useFetchResponse{
	response:APIApplicationsResponse[]|APIDeviceResponse[]|APIDeviceResponse|APIGatewayResponse[]|APICommResponse|null, //Response type depends on endpoint given to useFetch 
	isLoading:boolean,
	error:number|null,
	retry():void
}

export const useFetch = (url:string):useFetchResponse =>{

	const [response, set_response] = useState<APIApplicationsResponse[]|APIDeviceResponse[]|APIDeviceResponse|APIGatewayResponse[]|APICommResponse|null>(null);
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

					//Determine type of response from endpoint requested
					const path=Linking.parse(url).path
					if (resp.status === 200){
						const json:any = await resp.json();
						if (!json) return

						//Find out what type of response it is
						if (path.search(/api\/v3\/applications$/)===0){
							//Is an applications response
							const data:APIApplicationsResponse[]=json.applications
							set_response(data)
						}
						else if (path.search(/api\/v3\/applications\/[a-zA-Z0-9-]*\/devices$/g)===0){
							//Is a device response
							const data:APIDeviceResponse[]=json.end_devices
							set_response(data)
						}
						else if (path.search(/api\/v3\/applications\/[a-zA-Z0-9-]*\/devices\/[a-zA-Z0-9-]*$/g)==0){
							const data:APIDeviceResponse=json
							set_response(data)
						}
						else if (path.search(/api\/v3\/ns\/applications\/[a-zA-Z0-9-]*\/devices\/[a-zA-Z0-9-]*$/g)==0){
							//Is a device communications response
							if ('mac_state' in json){
								const data:APICommResponse=json
								set_response(data)
							}
						}
						else if (path.search(/api\/v3\/gateways$/g)==0){
							const data:APIGatewayResponse[]=json.gateways
							set_response(data)
						}
						setIsLoading(false);
						setError(null);
						
					}else{
						console.log(resp.status)
						setError(resp.status)
						setIsLoading(false)
						set_response(null)
					}

				}catch(err){
					if (err.name === 'AbortError') {
						console.log('Fetch aborted');
					} else {
						console.log("error in fetch hook", err.message)
						// setError(err.message);
						setIsLoading(false);
					}
				}

			}else{
				console.log('Offline, getting from storage', url)
				//Get offline version of request
				const path:string=Linking.parse(url).path
				const store_response=await get_req_from_storage(path)
				set_response(store_response)
				setIsLoading(false)
				setError(null)
			}
		}
		fetchData()
		return () => abortCont.abort();
	}, [url, refetch, state.network_status]);

	return { response, isLoading, error, retry };
};

