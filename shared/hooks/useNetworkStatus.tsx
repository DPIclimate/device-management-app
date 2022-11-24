import React, { useEffect, useState } from "react"
import NetInfo from "@react-native-community/netinfo";

export interface useNetworkStatusResponse{
    network_status:boolean, 
    network_status_loading:boolean, 
    network_error:string|null
}

export const useNetworkStatus = ():useNetworkStatusResponse =>{

    const [network_status_loading, set_net_loading] = useState<boolean>(true)
    const [network_status, set_status] = useState<boolean>(false)
    const [network_error, set_error] = useState<string|null>(null)

    useEffect(()=>{
        const interval:NodeJS.Timer = setInterval(async() =>{
            try{
                const isConnected = await NetInfo.fetch().then(state => state.isConnected)
                set_status(isConnected)
            }
            catch(error){
                console.log("Error occured while trying to get network status")
                set_error(error)
            }

        },1000)
        return () => clearInterval(interval)
    },[])

    return {network_status, network_status_loading, network_error}
}