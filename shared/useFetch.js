import { useEffect, useState } from 'react';
import { cacheTTNdata, checkNetworkStatus, getFromStore, setTTNToken } from '.';
import config from '../config.json'

export const useFetchState = (url, options) =>{
	// Custom use Fetch hook that returns states

	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refetch, setRefetch] = useState(false)
	const netStatus = checkNetworkStatus()

	const retry = () =>{
		console.log('retry hit')
		setIsLoading(true)
		setError(null)
		setData(null)
		setRefetch(prev => !prev)
	}

	useEffect(() => {
		const abortCont = new AbortController();

		const fetchData = async() =>{

			// let netStatus = await checkNetworkStatus()

			// setNetStatus(netStatus)

			if (netStatus){
				
				if (global.TTN_TOKEN == undefined) await setTTNToken()

				try{
					console.log(url)
					if (global.TTN_TOKEN == null) throw Error("User not logged in")
					if (url.includes(undefined)) throw Error("Invalid URL")

					console.log('fetching')
					const resp = await fetch(url, { 
						signal: abortCont.signal,
						headers:global.headers,
						method:'GET'
					}).then((res)=>res.json())

					setData(resp);
					setIsLoading(false);
					setError(null);

					if (url == `${config.ttnBaseURL}?field_mask=description`){cacheTTNdata(resp.applications)}

				}catch(err){
					if (err.name === 'AbortError') {
						console.log('Fetch aborted');
					} else {
						console.log(err.message)
						setError(err.message);
						setIsLoading(false);
					}
				}

			}else{
				//Get offline version of request
				const {fromStore, error} = await getFromStore(options.type)

				setData(fromStore)
				setIsLoading(false)
				setError(error)
			}
		}
		fetchData()
		return () => abortCont.abort();
	}, [url, refetch]);

	return { data, isLoading, error, retry, netStatus };
};
export const useFetch = async(url, options) =>{
	//Use fetch method that returns values

	const netStatus = checkNetworkStatus()

	if (netStatus){
				
		if (global.TTN_TOKEN == undefined) await setTTNToken()

		try{
			console.log(url)
			if (global.TTN_TOKEN == null) throw Error("User not logged in")
			if (url.includes(undefined)) throw Error("Invalid URL")

			console.log('fetching')
			const resp = await fetch(url, { 
				headers:global.headers,
				method:'GET'
			}).then((res)=>res.json())

			return resp
		}catch(err){
			console.log(err)
		}

	}else{
		//Get offline version of request
		const {fromStore, error} = await getFromStore(options.type)
		if (error){console.log(error); return}

		return fromStore
	}
}
export default useFetchState;
