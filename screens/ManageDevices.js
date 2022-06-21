import React, {useEffect, useState, useRef} from 'react';
import{View,
	StyleSheet,
	ScrollView,
	Text,
	TextInput,
	Image,
	Alert,
    Keyboard,
	TouchableOpacity,
	} from 'react-native'
import globalStyles from '../styles';
import DeviceCard from './DeviceCard';
import CommCard from './CommCard';
import LocationCard from './LocationCard';
import NotesCard from './NotesCard';
import { LoadingComponent} from '../shared';
import {useFetch} from '../shared/useFetch';
import { formatTime } from '../shared/FormatTime';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Button} from '../shared/Button'
import { useGetNetStatus } from '../shared/useGetNetStatus';

const ManageDevices = ({route, navigation}) => {

    const {loading: netLoading, netStatus, error} = useGetNetStatus()

    const [appID, setAppID] = useState()
    const [devUID, setDevUID] = useState()
    const [devID, setDevID] = useState()

    const [devData, setDevData] = useState()

    const [lastSeen, setLastSeen] = useState('Loading...')
    const [isLoading, setLoading] = useState(false)

    const [autoSearch, setAutoSearch] = useState(false)

    //for last seen circle
    const greenCircle = require('../assets/greenCircle.png')
    const redCircle  = require('../assets/redCircle.png')
    const orangeCircle = require('../assets/orangeCircle.png')
    const greenHollow = require('../assets/greenCircle-hollow.png')
    const redHollow = require('../assets/redCircle-hollow.png')
    const orangeHollow = require('../assets/orangeCircle-hollow.png')
    const [circleImg, changeCirlce] = useState()

    const keyboardHight = useKeyboard()
    const scrollViewRef = useRef();

    useEffect(()=>{
        if (route?.params?.autofill){ 
            //Data comes from either QR code or another page
            setAppID(route?.params?.autofill.appID)
            setDevUID(route?.params?.autofill?.uid)
            setDevID(route?.params?.autofill?.devID)
            setAutoSearch(true) //Will hit search button automatically
        }
    },[route])

    useEffect(() =>{
        //Handle autosearch
        if (autoSearch){
            handleSearch()  
            setAutoSearch(false)
        }
    },[autoSearch])

    const handleSearch = async() =>{
        setLoading(true)
        const data = await useFetch(`${global.BASE_URL}/applications/${appID}/devices?field_mask=attributes,locations,description,name`,{type:"DeviceList", storKey:global.APP_CACHE, appID:appID}, netStatus)
        
        if ('code' in data){
            Alert.alert("Invalid details", "Invalid details entered")
            setLoading(false)
            return
        }

        let device;

        for (const dev of data.end_devices){
            
            if (devUID != null && dev.attributes?.uid == devUID || dev.ids.device_id == devID){
                //If uid present search based on uid, if not search on device id
                device = dev
            }
        }
        if (device == undefined) Alert.alert("No device found")

        const devObj = createDeviceObj(device)
        setDevData(devObj)

        setLoading(false)
    }

    const createDeviceObj = (device) =>{
        //Create device object for device cards to use

        if (device == undefined) return
        const applicationID = device.ids.application_ids.application_id
        let devUID = null

        devUID = device.attributes?.uid

        const devID = device.ids.device_id
        const devEui = device.ids.dev_eui
        const devName = device.name
        const dates = formatTime(device.created_at)
        const location = device.locations?.user
        const notes = device.description
        const created = `${dates[2]} ${dates[1]}` 
        const ttn_link = `https://au1.cloud.thethings.network/console/applications/${applicationID}/devices/${devID}`

        const data = {
            "appID":applicationID,
            'uid':devUID,
            'devID':devID,
            'name':devName,
            'eui':devEui,
            'creationDate':created,
            'location':location,
            'ttn_link':ttn_link,
            'notes':notes
        }
        return data
    }
    const setCircle = (val) =>{
        switch (val) {
            case 'red':
                changeCirlce(redCircle)
                break;
            case 'orange':
                changeCirlce(orangeCircle)
                break;
            case 'green':
                changeCirlce(greenCircle)
                break;
            case 'red-hollow':
                changeCirlce(redHollow)
                break;
            case 'orange-hollow':
                changeCirlce(orangeHollow)
                break;
            case 'green-hollow':
                changeCirlce(greenHollow)
                break;
            default:
                break;
        }
    }

    const LastSeen = () =>{
        //Component for last seen text
        return (
            <View style={{paddingTop:20}}>
                <Text>
                    <Image style={{width:15, height:15}} source={circleImg} />
                    <Text style={{fontSize:17}} numberOfLines={1} adjustsFontSizeToFit>{` Last seen: ${lastSeen}`}</Text> 
                </Text>
            </View>
        )
    }

    return (
        <ScrollView 
        style={[globalStyles.scrollView, globalStyles.contentView]}
        keyboardDismissMode="interactive" 
        ref={scrollViewRef}
        >
            <SafeAreaView>
                <View style={globalStyles.headingView}>
                    <Text style={globalStyles.title}>Device Lookup</Text>

                    <TouchableOpacity style={globalStyles.qrButton} onPress={() => navigation.navigate('QrScanner',{screen:'ManageDevices'})}>
                        <Image style={globalStyles.qrCode} source={require('../assets/QR-code-icon.png')}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.subtitleView}>
                        <Text style={styles.subHeading}>Application ID</Text>
                </View>
                <TextInput value={appID} placeholder='e.g example-app-id' style={globalStyles.inputWborder} onChangeText={setAppID} autoCorrect={false} autoCapitalize='none'/>
                

                <View style={styles.subtitleView}>
                    <Text style={styles.subHeading}>Device UID</Text>
                </View>
                <TextInput value={devUID} placeholder='e.g example-app-id' style={globalStyles.inputWborder} onChangeText={setDevUID} autoCorrect={false} autoCapitalize='none'/>

                <View style={{width:'90%', height:2, backgroundColor:'#128cde', alignSelf:'center', marginTop:30}}/>

                <View style={{paddingBottom:5, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <View style={{flex:1}}>
                        {devData&& <LastSeen/>}
                    </View>
                    <View>
                        <Button disabled={appID == null} onSubmit={()=>handleSearch()}>
                            {devData? <Text>Refresh</Text> : <Text>Search</Text>}
                        </Button>
                    </View>
                </View>
                

                {devData && //If device data exists, display cards
                    <>
                        <DeviceCard devData={devData} autoSearch={setAutoSearch}/>
                        <CommCard devData={devData} setLastSeen={setLastSeen} setCircle={setCircle}/>
                        <LocationCard devData={devData} autoSearch={setAutoSearch}/> 
                        <NotesCard devData={devData}/>
                    </>
                }
                <LoadingComponent loading={isLoading}/>
                <View style={{width:'100%', height:keyboardHight}}/>
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
export default ManageDevices;