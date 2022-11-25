import React, {useEffect, useState, useRef, useContext, useReducer} from 'react';
import{View,
	StyleSheet,
	ScrollView,
	Text,
	TextInput,
	Image,
	Alert,
    Keyboard,
	TouchableOpacity,
    SafeAreaView
	} from 'react-native'
import globalStyles from '../styles';
import { GlobalContext } from '../shared/context/GlobalContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommMessage } from '../shared/types/CustomTypes';
import {DeviceCard} from './cards/DeviceCard';
import { ManageDeviceContextProvider } from '../shared/context/ManageDeviceContext';
import LastSeenCard from './cards/LastSeenCard';
import {CommCard} from './cards/CommCard';
import { useFetch } from '../shared/hooks/useFetch';
import { ConvertToComm } from '../shared/functions/ConvertFromAPI';
import { APICommResponse } from '../shared/types/APIResponseTypes';

const reducer = () =>{

}

export const ManageDeviceScreen = ({route, navigation}) => {

    const [state, dispatch] = useContext(GlobalContext);
    const insets = useSafeAreaInsets();
    
    const [device_state, device_dispatch] = useReducer(reducer, route.params.device)
    const [device_comm_data, set_device_comm_data] = useState<DeviceCommData>([])

    const {response, isLoading, error, retry} = useFetch(`${state.communication_server}/api/v3/ns/applications/${route.params.device.applications_id}/devices/${route.params.device.id}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`)

    useEffect(() => {
        
        if (isLoading) return

        const data = response as APICommResponse
        const formatted: CommMessage[] = ConvertToComm(data);
        set_device_comm_data(formatted);

    }, [isLoading]);
        
    // const [lastSeen, setLastSeen] = useState('Loading...')

    // //for last seen circle
    // const greenCircle = require('../assets/greenCircle.png')
    // const redCircle  = require('../assets/redCircle.png')
    // const orangeCircle = require('../assets/orangeCircle.png')
    // const greenHollow = require('../assets/greenCircle-hollow.png')
    // const redHollow = require('../assets/redCircle-hollow.png')
    // const orangeHollow = require('../assets/orangeCircle-hollow.png')
    // const [circleImg, changeCirlce] = useState()

    // const keyboardHight = useKeyboard()
    // const scrollViewRef = useRef();



    // const handleSearch = async() =>{

    //     setLoading(true)
    //     try{
    //         const data = await useFetch(`${global.BASE_URL}/applications/${appID}/devices?field_mask=attributes,locations,description,name`)

    //         let device;    
    //         for (const dev of data.end_devices){
                
    //             if (devUID != null && dev.attributes?.uid == devUID || dev.ids.device_id == devID){
    //                 //If uid present search based on uid, if not search on device id
    //                 device = dev
    //             }
    //         }
    //         if (!device) Alert.alert("No device found")
    
    //         const devObj = createDeviceObj(device)
    //         setDevData(devObj)
    
    //     }

    //     catch(error){
    //         console.log(error)
    //         Alert.alert("Invalid details", "Invalid details entered")
    //     }
    //     setLoading(false)
    // }

    // const createDeviceObj = (device) =>{
    //     //Create device object for device cards to use

    //     if (device == undefined) return
    //     const applicationID = device.ids.application_ids.application_id
    //     let devUID = null

    //     devUID = device.attributes?.uid

    //     const devID = device.ids.device_id
    //     const devEui = device.ids.dev_eui
    //     const devName = device.name
    //     const dates = formatTime(device.created_at)
    //     const location = device.locations?.user
    //     const notes = device.description
    //     const created = `${dates[2]} ${dates[1]}` 
    //     const ttn_link = `https://${global.COMM_SERVER}.cloud.thethings.network/console/applications/${applicationID}/devices/${devID}`

    //     const data = {
    //         "appID":applicationID,
    //         'uid':devUID,
    //         'devID':devID,
    //         'name':devName,
    //         'eui':devEui,
    //         'creationDate':created,
    //         'location':location,
    //         'ttn_link':ttn_link,
    //         'notes':notes
    //     }
    //     return data
    // }
    // const setCircle = (val) =>{
    //     switch (val) {
    //         case 'red':
    //             changeCirlce(redCircle)
    //             break;
    //         case 'orange':
    //             changeCirlce(orangeCircle)
    //             break;
    //         case 'green':
    //             changeCirlce(greenCircle)
    //             break;
    //         case 'red-hollow':
    //             changeCirlce(redHollow)
    //             break;
    //         case 'orange-hollow':
    //             changeCirlce(orangeHollow)
    //             break;
    //         case 'green-hollow':
    //             changeCirlce(greenHollow)
    //             break;
    //         default:
    //             break;
    //     }
    // }

    // const LastSeen = () =>{
    //     //Component for last seen text
    //     return (
    //         <View style={{paddingTop:20}}>
    //             <Text>
    //                 {circleImg&&<Image style={{width:15, height:15}} source={circleImg} />}
    //                 <Text style={{fontSize:17}} numberOfLines={1} adjustsFontSizeToFit>{` Last seen: ${lastSeen}`}</Text> 
    //             </Text>
    //         </View>
    //     )
    // }

    return (
        <ScrollView 
        style={globalStyles.contentView}
        keyboardDismissMode="interactive" 
        // ref={scrollViewRef}
        >
            <SafeAreaView>
                {/* <View style={globalStyles.headingView}>
                    <Text style={globalStyles.title}>Device Lookup</Text>

                    <TouchableOpacity style={globalStyles.qrButton} onPress={() => navigation.navigate('QrScanner',{screen:'ManageDevices'})}>
                        <Image style={globalStyles.qrCode} source={require('../assets/QR-code-icon.png')}/>
                    </TouchableOpacity>
                </View> */}

                {/* <View style={styles.subtitleView}>
                        <Text style={styles.subHeading}>Application ID</Text>
                </View>
                <TextInput placeholder='e.g example-app-id' style={globalStyles.inputWborder} onChangeText={(e) => search_dispatch({type:'application_id', payload:e})} autoCorrect={false} autoCapitalize='none'/> */}
                

                {/* <View style={styles.subtitleView}>
                    <Text style={styles.subHeading}>Device UID</Text>
                </View>
                <TextInput value={device?.uid} placeholder='e.g example-app-id' style={globalStyles.inputWborder}  autoCorrect={false} autoCapitalize='none'/> */}

                {/* <View style={{width:'90%', height:2, backgroundColor:'#128cde', alignSelf:'center', marginTop:30}}/> */}

                {/* <View style={{paddingBottom:5, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <View style={{flex:1}}>
                        {devData&& <LastSeen/>}
                    </View> */}
                    {/* <View>
                        <Button disabled={device?.applications_id == null} onSubmit={()=>handleSearch()}>
                            {devData? <Text>Refresh</Text> : <Text>Search</Text>}
                        </Button>
                    </View> */}
                {/* </View> */}
                

                {/* {devData && //If device data exists, display cards
                    <> */}
                    <ManageDeviceContextProvider device_comm_data={device_comm_data} reducer={[device_state, device_dispatch]}>
                        <LastSeenCard/>
                        <DeviceCard/>
                        <CommCard/>
                        {/* <LocationCard device={device}/>  */}
                        {/* <NotesCard device={device}/> */}
                    </ManageDeviceContextProvider>
                    {/* </> */}
                {/* } */}
                {/* <LoadingComponent loading={isLoading}/> */}
                {/* <View style={{width:'100%', height:keyboardHight}}/> */}
            </SafeAreaView>
        </ScrollView>
    );
};
export const useKeyboard = () => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
  
    function onKeyboardDidShow(e) { // Remove type here if not using TypeScript
      setKeyboardHeight(e.endCoordinates.height);
    }
  
    function onKeyboardDidHide() {
      setKeyboardHeight(0);
    }
  
    useEffect(() => {
      const showSubscription = Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
      const hideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);
      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);
  
    return keyboardHeight;
  };
const styles = StyleSheet.create({
    contentView:{
        padding:10,
        paddingBottom:15
    },
    title:{
        paddingTop:20,
        alignItems:'flex-end',     
    },
    subHeading:{
        fontSize:15,
        paddingBottom:5
    },
    subtitleView:{
        paddingTop:15
    }
})