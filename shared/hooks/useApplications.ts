import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { get_req_from_storage } from '../functions/ManageLocStorage';
import { APIApplicationsResponse } from '../types/APIResponseTypes';
import * as Linking from 'expo-linking';

interface useApplicationResponse{
	response:APIApplicationsResponse[]|undefined, //Response type depends on endpoint given to useFetch 
	isLoading:boolean,
	error:string|null,
	retry():void
}

export const useApplications = ():useApplicationResponse =>{
	const [response, set_response] = useState<APIApplicationsResponse[]>();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string|null>(null);
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

        const url = `${state.application_server}/api/v3/applications?field_mask=description`

		const abortCont:AbortController = new AbortController();

		const fetchData = async():Promise<void> =>{
			
			if (state.network_status){
				try{

					const resp:Response = await fetch(url, { 
						signal: abortCont.signal,
						headers:{
							Authorization:state.ttn_auth_token,
							"Content-Type": "application/json"
						},
						method:'GET'
					})

					if (resp.status === 200){
						const json:any = await resp.json();
						if (!json) return
						set_response(json.applications)

                        setIsLoading(false);
						setError(null);
						
					}else{
						console.log(resp.status)
						setError(resp.statusText)
						setIsLoading(false)
						set_response(null)
					}

				}catch(err){
					if (err.name === 'AbortError') {
						console.log('Fetch aborted');
					} else {
						console.log("error in fetch hook", err.message)
						setError(err.message);
						setIsLoading(false);
					}
				}

			}else{
				//Get offline version of request
				const path:string=Linking.parse(url).path
				const store_response=await get_req_from_storage(path) as APIApplicationsResponse[]
                
                if (store_response == null){
                    setError("Not online and no data cached")
                    setIsLoading(false)
                    return
                }

				set_response(store_response)
				setIsLoading(false)
				setError(null)
			}
		}
		fetchData()
		return () => abortCont.abort();
	}, [refetch, state.network_status]);

	return { response, isLoading, error, retry };
};

