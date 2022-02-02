import React, {useEffect, useState} from 'react';
import{View, StyleSheet,ScrollView, Text, TextInput, Image, TouchableHighlight, Alert, KeyboardAvoidingView, TouchableOpacity} from 'react-native'
import globalStyles from '../styles';
import config from '../config';
import DeviceCard from './DeviceCard';
import CommCard from './CommCard';
import LocationCard from './LocationCard';
import NotesCard from './NotesCard';
import PhotosCard from './PhotosCard'
import { LoadingComponent} from '../shared';
import { DataContextProvider } from '../shared/DataContextManager';
import useFetch from '../shared/useFetch';
import { formatTime } from './CommCard';

const ManageDevices = ({route, navigation}) => {

    console.log("in manage devices")
    const [appID, appIDChange] = useState()
    const [deviceUID, uidChange] = useState()
    const [lastSeen, changeLastSeen] = useState()
    const [uidPresent, setUIDpresent] = useState(true)

    const [devData, changeDevData] = useState()
    const [dataCollected, collectedChange] = useState(false)

    const greenCircle = require('../assets/greenCircle.png')
    const redCirle  = require('../assets/redCircle.png')
    const orangeCirle = require('../assets/orangeCircle.png')
    const [circleImg, changeCirlce] = useState(greenCircle)

    // console.log("State of app id",appID, appID? 'yes': 'no')
    const appReq = appID?appID:route.params?.autofill?.appID
    const {data, isLoading, error, retry, netStatus} = useFetch(`${config.ttnBaseURL}/${appReq}/devices?field_mask=attributes,locations,description`, {
            method:'GET', 
            type:{type:"DeviceList", key:appReq}
        })

    useEffect(() =>{
        function autoLookup(){

            if (isLoading) return
            if (route.params?.autofill == undefined) return
            
            let autoFillData = route.params.autofill
            if (autoFillData != null){
                appIDChange(autoFillData.appID)
                uidChange(autoFillData.uid)
                getData(data)
            }
        }
        autoLookup()
    },[isLoading, route])

    // useEffect(()=>{//When comm data is returned
    //     async function loaded(){
            
    //         if (commLoading) return
    //         if (commError) {return}

    //         const recent_uplinks = commRawData?.mac_state?.recent_uplinks

    //         const m_types = recent_uplinks?.map((data) => data.payload?.m_hdr?.m_type).reverse()
    //         const r_uplinks = recent_uplinks?.map((data) => data.rx_metadata[0]?.rssi).reverse()
    //         const snrs = recent_uplinks?.map((data) => data.rx_metadata[0]?.snr).reverse()

    //         const utcTimes = recent_uplinks?.map((data) => data?.received_at).reverse()
    //         const times = utcTimes?.map((time) => formatTime(time))

    //         const cData = {
    //             'm_types':m_types,
    //             'rssis':r_uplinks,
    //             'snrs':snrs,
    //             'times':times
    //         }
    //         // return cData
    //         changeCommData(cData)
    //         calcLastSeen(cData)
    //     }
    //     loaded()

    // },[commLoading, commError, route])

    const getData = (data) =>{
        if (isLoading) return
        if (error == "Invalid URL")return

        let device = undefined
        data.end_devices.forEach((dev)=>{
            
            if (dev.attributes?.uid == route.params?.autofill?.uid && route.params?.uidPresent == true){
                device = dev
                return
            }else if (dev.ids.device_id == route.params.autofill.name){
                device = dev
                return
            }
        })
        device = createDeviceObj(device)
        changeDevData(device)
    }
    const createDeviceObj = (device) =>{

        const applicationID = device['ids']['application_ids']['application_id']
        let devUID = null

        devUID = device.attributes?.uid

        const devName = device['ids']['device_id']
        const devEui = device['ids']['dev_eui']
        const dates = formatTime(device['created_at'])

        const created = `${dates[2]} ${dates[1]}` 

        const ttn_link = `https://au1.cloud.thethings.network/console/applications/${applicationID}/devices/${devName}`

        let location = undefined 
        device['locations'] != undefined ? location = device['locations']['user'] : location = undefined
        
        const notes = device['description']
        const data = {
            "appID":applicationID,
            'uid':devUID,
            'name':devName,
            'eui':devEui,
            'creationDate':created,
            'location':location,
            'ttn_link':ttn_link,
            'notes':notes
        }
        console.log('finished')
        return data
    }
    const setCircle = (val) =>{
        console.log('in set cirlce', val)
        switch (val) {
            case 'red':
                changeCirlce(redCirle)
                break;
            case 'organge':
                changeCirlce(orangeCirle)
                break;
            case 'green':
                changeCirlce(greenCircle)
                break;
            default:
                break;
        }
    }

    const handlePress = async(autoSearch) =>{
        
        retry()
        // if (appID.length != 0 && deviceUID.length != 0 || uidPresent == false){

        //     if (isConnected){

                // const dData = await getDeviceData()
        //         if (dData != null){
        //             const cData = await getCommData(dData)
        //             changeDevData(dData)
        //             changeCommData(cData)

        //             collectedChange(true)
        //             calcLastSeen(cData)
        //         }
        //     }
        //     else if (route.params.autofill != undefined){

        //         const data = await getOffline()
        //         changeDevData(data)
        //         changeCommData(undefined)
        //         collectedChange(true)
        //         calcLastSeen(undefined)
        //     }
        // }
        
    }
    const LastSeen = () =>{
        
            return (
                <View style={{paddingTop:20}}>
                    <Text>
                        <Image style={{width:15, height:15}} source={circleImg} />
                        <Text style={{fontSize:17}}>{` Last seen: ${lastSeen}`}</Text> 
                    </Text>
                </View>
            )
    }
    const ShowData = () =>{        
        return (
            <>
                <DataContextProvider value={devData}>
                    {/* Card View of device details */}
                    <DeviceCard/>
                    {/* Card view of Communication details */}
                    <CommCard changeLastSeen={changeLastSeen} setCircle={setCircle}/>
                    {/* Card view of device location if available */}
                    <LocationCard/>  

                    <NotesCard/>

                    <PhotosCard params={route.params} navigation={navigation}/>
                </DataContextProvider>
            </>
        )
    }
    const SearchButton = () =>{

        if (!dataCollected){
            return(
            <TouchableOpacity style={[{width:120},globalStyles.blueButton]} onPress={handlePress}>
                <Text style={globalStyles.blueButtonText}>Search</Text>
            </TouchableOpacity>
            )
        
        }else if (dataCollected && isConnected){
            return(
                <TouchableOpacity style={[{width:140},globalStyles.blueButton]} onPress={handlePress}>
                    <Text style={globalStyles.blueButtonText}>Refresh</Text>
                </TouchableOpacity>
            )
        }
        else if (dataCollected && !isConnected){
            return(
                <TouchableHighlight style={{borderRadius:50}} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => Alert.alert("No Connection", "This is the last known state of this device")}>
                    <Image style={{width:50, height:50, borderRadius:50}} source={require('../assets/noConnection.png')}/>
                </TouchableHighlight>
            )
        }
    }
    
    return (
        <KeyboardAvoidingView style={{ flex: 1 }}
        keyboardVerticalOffset={50}
        behavior={Platform.OS === "ios" ? "position" : "height"}>
            <ScrollView style={globalStyles.scrollView}>
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
                    <TextInput value={deviceUID} placeholder='e.g ABC123 (Max. 6 Characters)' style={globalStyles.inputWborder} onChangeText={uidChange} autoCorrect={false} autoCapitalize='none'/>
                    <View style={{paddingTop:15, flexDirection:'row', justifyContent:'space-between'}}>
                        <LastSeen/>
                        <SearchButton/>        
                    </View>
                    <ShowData/>  
                    <LoadingComponent loading={isLoading}/>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
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