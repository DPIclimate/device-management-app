import NetInfo from "@react-native-community/netinfo";

export default async function checkNetworkStatus(){

    const isConnected = await NetInfo.fetch().then(state => state.isConnected)
    return  isConnected
    
}
