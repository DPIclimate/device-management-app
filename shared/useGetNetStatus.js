import React, { useEffect, useState } from "react"
import NetInfo from "@react-native-community/netinfo";

export const useGetNetStatus = () =>{

    const [loading, setLoading] = useState(true)
    const [netStatus, setStatus] = useState(null)
    const [error, setError] = useState(null)

    useEffect(()=>{
        let isMounted = true

        const getStatus = async()=>{
            try{

                const isConnected = await NetInfo.fetch().then(state => state.isConnected)
                if(isMounted){
                    setStatus(isConnected)
                    setLoading(false)
                }
            }catch(error){
                if(isMounted){
                    setError(error)
                    setLoading(false)
                }
            }
        }
        getStatus()
        return () =>{isMounted = false}
    },[])
    return {loading, netStatus, error}
}