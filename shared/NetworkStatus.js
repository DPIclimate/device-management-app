import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const checkNetworkStatus = async() =>{

    const [netStaus, changeNetStatus] = useState(false)

    const isConnected = await NetInfo.fetch().then(state => state.isConnected)
    changeNetStatus(isConnected)
    
    return netStaus
    
}

export default checkNetworkStatus