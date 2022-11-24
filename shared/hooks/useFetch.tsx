import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { getFromStore } from '../functions/ManageLocStorage';
import { APIApplicationsResponse, APIDeviceResponse, APIGatewayResponse } from '../types/APIResponseTypes';
// import { checkError } from './checkError';
import { useNetworkStatus } from './useNetworkStatus';

export interface useFetchResponse{
	data:APIApplicationsResponse|APIDeviceResponse|APIGatewayResponse,
	isLoading:boolean,
	error:number|null,
	retry():void
}

export const useFetch = (url:string):useFetchResponse =>{

	const [data, setData] = useState<APIApplicationsResponse|APIDeviceResponse|APIGatewayResponse>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<number|null>(null);
	const [refetch, setRefetch] = useState<boolean>(false)

	const [state, dispatch] = useContext(GlobalContext)

	const retry = ():void =>{
		console.log('retry hit')
		setIsLoading(true)
		setError(null)
		setData(null)
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

					if (resp.status != 200){
						setError(resp.status)
						setIsLoading(false)
						setData(null)
					}
					else{	
						const content:JSON = await resp.json()
						setData(content);
						setIsLoading(false);
						setError(null);
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
				setData(fromStore)
				setIsLoading(false)
				setError(null)
			}
		}
		fetchData()
		return () => abortCont.abort();
	}, [url, refetch]);

	return { data, isLoading, error, retry };
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
