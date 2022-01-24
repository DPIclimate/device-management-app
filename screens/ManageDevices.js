import React, {useEffect, useState} from 'react';
import{View, StyleSheet,ScrollView, Text, TextInput, Image, TouchableHighlight, Alert, KeyboardAvoidingView, TouchableOpacity} from 'react-native'
import globalStyles from '../styles';
import config from '../config';
import moment from 'moment';
import DeviceCard from './DeviceCard';
import CommCard from './CommCard';
import LocationCard from './LocationCard';
import NotesCard from './NotesCard';
import PhotosCard from './PhotosCard'
import { checkNetworkStatus, LoadingComponent, getDevice} from '../shared';
import { DataContextProvider } from '../shared/DataContextManager';

const ManageDevices = ({route, navigation}) => {

    const [appID, appIDChange] = useState("")
    const [deviceUID, uidChange] = useState("")
    const [lastSeen, changeLastSeen] = useState("")
    const [uidPresent, setUIDpresent] = useState(true)

    const [devData, changeDevData] = useState({})
    const [commData, changeCommData] = useState({})
    const [requestData, changeRequestData] = useState({})
    const [dataCollected, collectedChange] = useState(false)

    const greenCircle = require('../assets/greenCircle.png')
    const redCirle  = require('../assets/redCircle.png')
    const orangeCirle = require('../assets/orangeCircle.png')
    const [circleImg, changeCirlce] = useState(greenCircle)

    const [isLoading, setLoadingState] = useState(false)
    const [autoSearch, setAutoSearch] = useState(false)
    const [isConnected, changeIsConnected] = useState(true)

    useEffect(() =>{
        collectedChange(false)
    },[appID, deviceUID])

    useEffect(() =>{
        handlePress()
    },[autoSearch])

    useEffect(() =>{
        async function autoLookup(){

            if (route.params == undefined) return
            if (route.params.autofill == undefined) return

            let connected = await checkNetworkStatus()
            changeIsConnected(connected)
            
            let data = route.params.autofill
            if (data != null){
                appIDChange(data['appID'])

                if (data['uidPresent'] == true){
                    uidChange(data['uid'])
                    changeRequestData(data)
                    setUIDpresent(true)
                }
                else{
                    setUIDpresent(false)
                    changeRequestData(data)
                }
                setAutoSearch(prev => !prev)
            }
        }
        autoLookup()
    },[route])

    const getDeviceData = async() => {

            let requestedDevice = null

            if (uidPresent == true){
                requestedDevice = await getDeviceWithUID()
            }
            else{
                requestedDevice = await getDeviceNoUID()
            }
            if (requestedDevice != null){

                return createDeviceObj(requestedDevice)

            }
        
    }
    const createDeviceObj = (device) =>{

        const applicationID = device['ids']['application_ids']['application_id']
        let devUID = null
        if(requestData['uidPresent'] ==true) devUID = device['attributes']['uid'] 
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
    const getDeviceWithUID = async() =>{
        console.log('requesting device with a uid')
        try{
            let url =  `${config.ttnBaseURL}/${appID}/devices?field_mask=attributes,locations,description`
            let response = await fetch(url,{
                method:"GET",
                headers:global.headers
            })
            response = await response.json()

            if ('code' in response){
                throw new Error()
            }
            const devices = response['end_devices']
            let requestedDevice = undefined

            for (const object in devices){
                const device = devices[object]
                try{
                    let uid = device['attributes']['uid']
                    if (uid == deviceUID){
                        requestedDevice = devices[object]
                    }

                }catch(error){//Error may occur if device does not have uid
                }
            }
            if (requestedDevice == undefined){
                throw new Error()
            }
            return requestedDevice

        }catch(error){
            console.log(error)
            Alert.alert(`Device UID or Applicaiton ID is incorrect`)
            return null
        }
    }
    const getDeviceNoUID = async() =>{

        try{
            console.log('requesting device without uid')

            let url =  `${config.ttnBaseURL}/${appID}/devices/${requestData.name}?field_mask=attributes,locations,description`
            console.log(url)
            let response = await fetch(url,{
                method:"GET",
                headers:global.headers
            })
            response = await response.json()

            if ('code' in response){
                throw new Error()
            }
            return response
        }
        catch(error){
            console.log(error)
            Alert.alert("Invalid Device")
            return null
        }
    }
    const getCommData = async(devData) =>{

        console.log('requesting communication info')
        let url =  `https://au1.cloud.thethings.network/api/v3/ns/applications/${appID}/devices/${devData['name']}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`

        const response = await fetch(url,{
            method:"GET",
            headers:global.headers
        }).then((response) => response.json())

        let recent_uplinks = ""

        try{
            recent_uplinks = response['mac_state']['recent_uplinks']

            const m_types = recent_uplinks.map((data) => data['payload']['m_hdr']['m_type']).reverse()
            const r_uplinks = recent_uplinks.map((data) => data['rx_metadata'][0]['rssi']).reverse()
            const snrs = recent_uplinks.map((data) => data['rx_metadata'][0]['snr']).reverse()

            const utcTimes = recent_uplinks.map((data) => data['received_at']).reverse()
            const times = utcTimes.map((time) => formatTime(time))

            const data = {
                'm_types':m_types,
                'rssis':r_uplinks,
                'snrs':snrs,
                'times':times
            }
            return data

        }catch(error){
            return undefined
        }
        
    }
    const calcLastSeen = (cData) =>{

        if (cData != undefined){
            const recent = new Date(cData['times'][0][3])
            const now = new Date()
            const diff = (now - recent)/1000/60

            if (diff < 1){
                changeLastSeen(`<1 min ago`)
            }else if (diff < 2){
                changeLastSeen(`${Math.floor(diff)} min ago`)
            }else if (diff < 60){
                changeLastSeen(`${Math.floor(diff)} mins ago`)
            }else if (diff < 1440){
                changeLastSeen(`${Math.floor(diff/60)} hour(s) ago`)
            }else{
                changeLastSeen(`${Math.floor(diff/60/24)} day(s) ago`)
            }

            if (diff/60 > 12){
                changeCirlce(redCirle)
            }
            else if (diff/60 > 2){
                changeCirlce(orangeCirle)
            }
            else{
                changeCirlce(greenCircle)
            }
        }
        else {
            
            if (isConnected){
                changeLastSeen(`Never`)
            }
            else{
                changeLastSeen('Unknown')
            }
            changeCirlce(redCirle)
        }
    }
    const formatTime = (toFormat) =>{
        const dateUnix = new Date(toFormat);

        const dayMonth = moment(dateUnix).format('DD/MM')
        const time = moment(dateUnix).format('hh:mm')
        const dayMonthYear = moment(dateUnix).format('DD/MM/YYYY')

        return [dayMonth, time, dayMonthYear, dateUnix]
        
    }
    const getOffline = async() =>{

        let device = await getDevice(route.params.autofill['appID'], route.params.autofill['name'], route.params.autofill['uid'])
        return createDeviceObj(device)
    }
    const handlePress = async(autoSearch) =>{

        setLoadingState(true)

        if (appID.length != 0 && deviceUID.length != 0 || uidPresent == false){

            if (isConnected){

                const dData = await getDeviceData()
                if (dData != null){
                    const cData = await getCommData(dData)
                    changeDevData(dData)
                    changeCommData(cData)

                    collectedChange(true)
                    calcLastSeen(cData)
                }
            }
            else if (route.params.autofill != undefined){

                const data = await getOffline()
                changeDevData(data)
                changeCommData(undefined)
                collectedChange(true)
                calcLastSeen(undefined)
            }
        }
        setLoadingState(false)
    }
    const LastSeen = () =>{
        
        if (dataCollected == true){

            return (
                <View style={{paddingTop:20}}>
                    <Text>
                        <Image style={{width:15, height:15}} source={circleImg} />
                        <Text style={{fontSize:17}}>{` Last seen: ${lastSeen}`}</Text> 
                    </Text>
                </View>
            )
        }
        else{
            return <View/>
        }
    }
    const ShowData = () =>{
        if (!dataCollected) return <View/>
        
        return (
            <>
                <DataContextProvider value={devData}>
                    {/* Card View of device details */}
                    <DeviceCard/>
                    {/* Card view of Communication details */}
                    <CommCard commData={commData}/>
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