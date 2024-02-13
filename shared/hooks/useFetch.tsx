import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { get_req_from_storage } from '../functions/ManageLocStorage';
import { APIApplicationsResponse, APICommResponse, APIDeviceResponse, APIGatewayResponse } from '../types/APIResponseTypes';
import * as Linking from 'expo-linking';

export interface useFetchResponse{
	response:APIApplicationsResponse[]|APIDeviceResponse[]|APIDeviceResponse|APIGatewayResponse[]|APICommResponse|undefined, //Response type depends on endpoint given to useFetch 
	isLoading:boolean,
	error:number|null,
	retry():void
}

/**
 * Custom hook for fetching data from a specified URL.
 * @param url - The URL to fetch data from.
 * @returns An object containing the response, loading state, error, and retry function.
 */
export const useFetch = (url:string):useFetchResponse =>{
	const [response, set_response] = useState<[]>();
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
							Authorization:state.ttn_auth_token,
							"Content-Type": "application/json"
						},
						method:'GET'
					})

					//Determine type of response from endpoint requested
					const path=Linking.parse(url).path
					if (resp.status === 200){
						const json:any = await resp.json();
						if (!json) return
						set_response(json)
						
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

