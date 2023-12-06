import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { get_req_from_storage } from '../functions/ManageLocStorage';
import { APICommResponse } from '../types/APIResponseTypes';
import * as Linking from 'expo-linking';

interface useCommsResponse{
	response:APICommResponse[]|undefined, //Response type depends on endpoint given to useFetch 
	isLoading:boolean,
	error:string|null,
	retry():void
}

export const useCommunications = (application_id:string, device_id:string):useCommsResponse =>{
	const [response, set_response] = useState<APICommResponse[]>();
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

        const url = `${state.communication_server}/api/v3/as/applications/${application_id}/devices/${device_id}/packages/storage/`

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
						//API returns multiple objects not in array, this turns it into text and manually constructs an array from it
						const text = (await resp.text()).trim().split("\n")
						const json:any = text.map(str => JSON.parse(str))

						if (!json) return
						set_response(json)

                        setIsLoading(false);
						setError(null);
						
					}else{
						setError(resp.statusText)
						setIsLoading(false)
						set_response(null)
					}

				}catch(err){
					if (err.name === 'AbortError') {
						console.log('Fetch aborted');
					} else {
						console.log("error in fetch hook", err.message, url)
						setError(err.message);
						setIsLoading(false);
					}
				}

			}else{
				//Get offline version of request
				const path:string=Linking.parse(url).path
				const store_response=await get_req_from_storage(path) as APICommResponse[]
                
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

