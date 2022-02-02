import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const checkNetworkStatus = async() =>{

    const [isLoading, setLoading] = useState(true)
    const [isConnected, setConnected] = useState(false)

    useEffect(() =>{

        async function checkStatus(){
            const connectStatus = await NetInfo.fetch().then(state => state.isConnected)

            setLoading(false)
            setConnected(connectStatus)  
        }
        checkStatus()
    })
    console.log('returning', isConnected, isLoading)
    return {isConnected, isLoading}
    
}

export default checkNetworkStatus