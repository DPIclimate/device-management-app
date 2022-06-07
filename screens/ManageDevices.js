import React, {useEffect, useState, useRef} from 'react';
import{View,
	StyleSheet,
	ScrollView,
	Text,
	TextInput,
	Image,
	TouchableHighlight,
	Alert,
    Keyboard,
	TouchableOpacity,
	} from 'react-native'
import globalStyles from '../styles';
import DeviceCard from './DeviceCard';
import CommCard from './CommCard';
import LocationCard from './LocationCard';
import NotesCard from './NotesCard';
import { checkNetworkStatus, LoadingComponent} from '../shared';
import { DataContextProvider } from '../shared/DataContextManager';
import {useFetch} from '../shared/useFetch';
import { formatTime } from './CommCard';


const ManageDevices = ({route, navigation}) => {

    const [appID, appIDChange] = useState()
    const [deviceUID, uidChange] = useState()
    const [uidPresent, setUIDPresent] = useState()

    const [lastSeen, changeLastSeen] = useState('Loading...')
    const [isLoading, setLoadingState] = useState(false)
    const [autoSearch, setAutoSearch] = useState(false)

    const [netStatus, setNetStatus] = useState(false)

    const [devData, changeDevData] = useState()

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
        async function loaded(){
            
            const status = await checkNetworkStatus()
            setNetStatus(status)
            
            console.log(route.params)
            if (route.params?.autofill){
                appIDChange(route.params?.autofill?.appID)
                uidChange(route.params?.autofill?.uid)
                setUIDPresent(route.params?.autofill?.uidPresent)
                setAutoSearch(true)
            }
            else if (route.params?.link){
                appIDChange(route.params?.appid)
                uidChange(route.params?.uid)
                setUIDPresent(true)
                setAutoSearch(true)
            }
        }
        loaded()
    },[route])
    
    useEffect(() =>{
        if (autoSearch){
            handlePress()  
            setAutoSearch(false)
        }
    },[autoSearch])

    const handlePress = async() =>{

        setLoadingState(true)
        let data = await useFetch(`${global.BASE_URL}/applications/${appID}/devices?field_mask=attributes,locations,description,name`,{type:"DeviceList", storKey:global.APP_CACHE, appID:appID}, netStatus)

        getData(data)
        setLoadingState(false)
    }

    const getData = (data) =>{
        if (isLoading) return

        let device = undefined

        for (let i in data.end_devices){
            let dev = data.end_devices[i]
                       
            if (dev.attributes?.uid == deviceUID && uidPresent == true){
                device = dev
                break;
            }else if (dev.ids.device_id == route.params?.autofill?.ID){
                device = dev
                break;
            }
        }

        if (device == undefined) Alert.alert("No device found")
        device = createDeviceObj(device)
        changeDevData(device)
    }
    const createDeviceObj = (device) =>{

        if (device == undefined) return
        const applicationID = device['ids']['application_ids']['application_id']
        let devUID = null

        devUID = device.attributes?.uid

        const devID = device['ids']['device_id']
        const devEui = device['ids']['dev_eui']
        const devName = device['name']
        const dates = formatTime(device['created_at'])

        const created = `${dates[2]} ${dates[1]}` 

        const ttn_link = `https://au1.cloud.thethings.network/console/applications/${applicationID}/devices/${devID}`

        let location = undefined 
        device['locations'] != undefined ? location = device['locations']['user'] : location = undefined
        
        const notes = device['description']
        const data = {
            "appID":applicationID,
            'uid':devUID,
            'ID':devID,
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
        
            return (
                <View style={{paddingTop:20}}>
                    <Text>
                        <Image style={{width:15, height:15}} source={circleImg} />
                        <Text style={{fontSize:17}} numberOfLines={1} adjustsFontSizeToFit>{` Last seen: ${lastSeen}`}</Text> 
                    </Text>
                </View>
            )
    }
    const SearchButton = () =>{

        
        if (!devData){
            return(
            <TouchableOpacity style={[{width:120},globalStyles.blueButton]} onPress={handlePress}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={globalStyles.blueButtonText}>Search</Text>
            </TouchableOpacity>
            )
        
        }else if (devData && netStatus){

            return(
                <TouchableOpacity style={[{width:140},globalStyles.blueButton]} onPress={handlePress}>
                    <Text adjustsFontSizeToFit numberOfLines={1} style={globalStyles.blueButtonText}>Refresh</Text>
                </TouchableOpacity>
            )
        }
        else if (devData && !netStatus){
            return(
                <TouchableHighlight style={{borderRadius:50}} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => Alert.alert("No Connection", "This is the last known state of this device")}>
                    <Image style={{width:50, height:50, borderRadius:50}} source={require('../assets/noConnection.png')}/>
                </TouchableHighlight>
            )
        }
    }

    return (
        <ScrollView 
            style={globalStyles.scrollView} 
            keyboardDismissMode="interactive" 
            ref={scrollViewRef}
            >
            <View style={styles.contentView}>
                <View style={{paddingTop:15, flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={[globalStyles.title, styles.title]}>Device Lookup</Text>

                    <TouchableOpacity style={globalStyles.qrButton} onPress={() => navigation.navigate('QrScanner',{screen:'ManageDevices'})}>
                        <Image style={globalStyles.qrCode} source={require('../assets/QR-code-icon.png')}/>
                    </TouchableOpacity>
                </View>
                <Text style={[globalStyles.text2, globalStyles.subtitleView]}>Application ID</Text>
                <TextInput value={appID} placeholder='e.g example-app-id' style={globalStyles.inputWborder} onChangeText={appIDChange} autoCorrect={false} autoCapitalize='none'/>
                

                <Text style={[globalStyles.text2, globalStyles.subtitleView]}>Device UID</Text>
                <TextInput value={deviceUID} placeholder='e.g ABC123 (Max. 6 Characters)' style={globalStyles.inputWborder} onChangeText={(e) => {uidChange(e.toUpperCase()); e.length> 0 ? setUIDPresent(true):setUIDPresent(false)}} autoCorrect={false} autoCapitalize='none'/>
                <View style={{paddingTop:15, flexDirection:'row', justifyContent:'space-between'}}>
                    <View style={{flex:1}}>
                        {devData&& <LastSeen/>}
                    </View>
                    <View>
                        <SearchButton/>        
                    </View>
                </View>
                
                <DataContextProvider value={devData}>

                    <DeviceCard navigation={navigation}/>
                    <CommCard changeLastSeen={changeLastSeen} setCircle={setCircle}/>
                    <LocationCard autoSearch={setAutoSearch}/>  
                    <NotesCard scrollViewRef={scrollViewRef}/>
                    
                </DataContextProvider>

                <LoadingComponent loading={isLoading}/>
                <View style={{width:'100%', height:keyboardHight}}/>
            </View>
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
    }
})
export default ManageDevices;