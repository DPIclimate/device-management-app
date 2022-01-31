import { useEffect, useState } from 'react';
import { cacheTTNdata, checkNetworkStatus, getFromStore, setTTNToken } from '.';

const useFetch = (url, options) =>{
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const abortCont = new AbortController();

		const fetchData = async() =>{

			let isConnected = await checkNetworkStatus()
			
			if (isConnected){
				if (global.TTN_TOKEN == undefined) await setTTNToken()
				
				try{
					if (global.TTN_TOKEN == null) throw Error("User not logged in")

					const resp = await fetch(url, { 
						signal: abortCont.signal,
						headers:global.headers,
						method:options.method
					}).then((res)=>res.json())

					setData(resp);
					setIsLoading(false);
					setError(null);

					if (options.key == global.APP_CACHE){cacheTTNdata(resp.applications)}

				}catch(err){
					if (err.name === 'AbortError') {
						console.log('Fetch aborted');
					} else {
						setError(err.message);
						setIsLoading(false);
					}
				}

			}else{
				const {fromStore, error} = await getFromStore(options.key)
				setData(fromStore)
				setIsLoading(false)
				setError(error)
			}
		}
		fetchData()
		return () => abortCont.abort();
	}, [url]);

	return { data, isLoading, error };
};

export default useFetch