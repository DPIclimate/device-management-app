import { useEffect, useState } from 'react';
import { checkError } from './checkError';
import { cacheTTNdata, getFromStore, setTTNToken } from './ManageLocStorage';
import checkNetworkStatus from './NetworkStatus';


export const useFetchState = (url, options) =>{
	// Custom use Fetch hook

	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refetch, setRefetch] = useState(false)

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

			const netStatus = await checkNetworkStatus()

			if (netStatus){
				
				try{
					console.log("Requesting url", url)
					if (global.TTN_TOKEN == null) throw Error("User not logged in")
					if (url.includes(undefined)) throw Error(`Invalid URL`)

					console.log('fetching')
					const resp = await fetch(url, { 
						signal: abortCont.signal,
						headers:global.headers,
						method:'GET'
					}).then((res)=>res.json())

					setData(resp);
					setIsLoading(false);
					setError(null);

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
				console.log('in offline')
				//Get offline version of request
				const fromStore = await getFromStore(url)
				setData(fromStore)
				setIsLoading(false)
				setError(error)
			}
		}
		fetchData()
		return () => abortCont.abort();
	}, [url, refetch]);

	return { data, isLoading, error, retry };
};
export const useFetch = async(url) =>{
	//Use fetch method that returns the results depending on internet connection
	const netStatus = await checkNetworkStatus()

	if (netStatus){
				
		try{
			console.log(url)
			if (global.TTN_TOKEN == null) throw Error("User not logged in")
			if (url.includes(undefined)) throw Error("Invalid URL")

			console.log('fetching', url)
			const resp = await fetch(url, { 
				headers:global.headers,
				method:'GET'
			}).then(checkError)

			return resp
		}catch(err){
			console.log(err)
		}

	}else{
		//Get offline version of request
		const fromStore = await getFromStore(url)
		return fromStore
	}
}
export default useFetchState;
