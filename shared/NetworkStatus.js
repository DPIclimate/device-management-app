import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const checkNetworkStatus = async() =>{

    const isConnected = await NetInfo.fetch().then(state => state.isConnected)    
    return !isConnected
    
}

export default checkNetworkStatus