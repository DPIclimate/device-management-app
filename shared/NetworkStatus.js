import NetInfo from "@react-native-community/netinfo";

const checkNetworkStatus = async() =>{

    const isConnected = await NetInfo.fetch().then(state => state.isConnected)
    return !isConnected
}

export default checkNetworkStatus