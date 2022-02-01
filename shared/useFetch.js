import { useEffect, useState } from 'react';
import { cacheTTNdata, checkNetworkStatus, getFromStore, setTTNToken } from '.';
import config from '../config.json'

const useFetch = (url, options) =>{
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refetch, setRefetch] = useState(false)
	const [netStatus, setNetStatus] = useState(false)

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

			let isConnected = await checkNetworkStatus()
			setNetStatus(isConnected)

			if (isConnected){
				
				if (global.TTN_TOKEN == undefined) await setTTNToken()

				try{
					console.log(url)
					if (global.TTN_TOKEN == null) throw Error("User not logged in")
					if (url.includes(undefined)) throw Error("Invalid URL")

					console.log('fetching')
					const resp = await fetch(url, { 
						signal: abortCont.signal,
						headers:global.headers,
						method:options.method
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
				// console.log(fromStore, 'fromStore')
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

export default useFetch