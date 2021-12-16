import React, {useCallback, useEffect, useState} from 'react';
import{
    View,
    StyleSheet,
    Text,
    TextInput,
    Image,
    Pressable,
    TouchableHighlight,
    Alert,
    ActivityIndicator
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import DeviceCard from './DeviceCard';
import CommCard from './CommCard';
import LocationCard from './LocationCard';
import config from '../config';

const ManageDevices = ({route, navigation}) => {

    const [appID, appIDChange] = useState("")
    const [deviceUID, uidChange] = useState("")
    const [lastSeen, changeLastSeen] = useState("")

    const [devData, changeDevData] = useState({})
    const [commData, changeCommData] = useState({})
    const [dataCollected, collectedChange] = useState(false)
    const greenCircle = require('../assets/greenCircle.png')
    const redCirle = require('../assets/redCircle.png')
    const orangeCirle = require('../assets/orangeCircle.png')
    const [circleImg, changeCirlce] = useState(greenCircle)
    const [isLoading, setLoadingState] = useState(false)


    useEffect(() =>{
        collectedChange(false)
    },[appID, deviceUID])

    useEffect(() =>{
        if (route.params != undefined){
            let data = route.params.qr_value
            if (data != null){
                appIDChange(data['appID'])
                uidChange(data['uid'])
                route.params = undefined
            }
        }
    })

    const getDataDevice = async() => {

        // Problem of cant lookup current devices as they dont have a uid set
        try{
            console.log('requesting devices')
            let url =  `${config.ttnBaseURL}/${appID}/devices?field_mask=attributes,locations`
            let response = await fetch(url,{
                method:"GET",
                headers:config.headers
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

            const applicationID = requestedDevice['ids']['application_ids']['application_id']
            const devUID = requestedDevice['attributes']['uid']
            const devName = requestedDevice['ids']['device_id']
            const devEui = requestedDevice['ids']['dev_eui']
            const dateCreate = new Date(requestedDevice['created_at'])

            const created = dateCreate.toLocaleString('en-GB')

            let location = undefined 
            requestedDevice['locations'] != undefined ? location = requestedDevice['locations']['user'] : location = undefined
            
            const data = {
                "appID":applicationID,
                'uid':devUID,
                'name':devName,
                'eui':devEui,
                'creationDate':created,
                'location':location
            }
            console.log('finished')
            return data

        }catch(error){
            Alert.alert(`Device UID or Applicaiton ID is incorrect`)
            return null
        }
    }

    const getCommData = async(devData) =>{
        let temp = ['aws-ict-atmos41', 'blayney-aws']

        console.log('requesting communication info')
        let url =  `https://au1.cloud.thethings.network/api/v3/ns/applications/${appID}/devices/${devData['name']}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`

        const response = await fetch(url,{
            method:"GET",
            headers:config.headers
        }).then((response) => response.json())

        let recent_uplinks = ""
        try{
            recent_uplinks = response['mac_state']['recent_uplinks']

        }catch(error){
            return undefined
        }
        // console.log(response)
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
    }
    const calcLastSeen = (cData) =>{
        if (cData != undefined){
            const recent = new Date(cData['times'][0][2])
            const now = new Date()
            const diff = (now - recent)/1000/60

            if (diff < 2){
                changeLastSeen(`${Math.floor(diff)} min ago`)
            }else if (diff < 60){
                changeLastSeen(`${Math.floor(diff)} mins ago`)
            }else{
                changeLastSeen(`${Math.floor(diff/60)} hour(s) ago`)
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
            console.log(diff)
        }
        else {
            changeLastSeen(`Never`)
            changeCirlce(redCirle)
        }
    }
    const formatTime = (toFormat) =>{
        const date = new Date(toFormat);
        const localDate = date.toLocaleString('en-GB', {month: "numeric", day: "numeric"})
        const localTime = date.toLocaleTimeString('en-GB',{hour:"numeric", minute:'numeric'})
        return [localDate, localTime, date]
    }

    const handlePress = async() =>{
        setLoadingState(true)
        if (appID.length != 0 && deviceUID.length != 0){
            const dData = await getDataDevice()
            if (dData != null){
                const cData = await getCommData(dData)

                changeDevData(dData)
                changeCommData(cData)
                collectedChange(true)
                calcLastSeen(cData)
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
    const Loading = () =>{

        if (isLoading == true){
            return <ActivityIndicator style={{paddingTop:'10%'}} size="large"/>
        }
        else{
            return <View/>
        }
    }
    const ShowData = () =>{

        if (dataCollected == true){
            return (
                <>
                    {/* Card View of device details */}
                    <DeviceCard data={devData}/>
                    {/* Card view of Communication details */}
                    <CommCard commData={commData}/>
                    {/* Card view of device location if available */}
                    <LocationCard data={devData}/>  
                </>
            )
        }
        else{
            return <View/>
        }
    }
    return (
        <View style={globalStyles.screen}>
            <ScrollView style={globalStyles.scrollView}>
                <View style={styles.contentView}>
                    <Text style={styles.title}>Device lookup</Text>
                    <View style={{width:60, height:60, position:'absolute', right:0, top:0, margin:10}} >
                        <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => navigation.navigate('QrScanner',{screen:'ManageDevices'})}>
                            <Image style={{width:'100%', height:'100%', borderRadius:20}} source={require('../assets/QR-code-icon.png')}/>
                        </TouchableHighlight>
                    </View>
                    <Text style={styles.text}>Application ID</Text>
                    <TextInput value={appID} placeholder='e.g example-app-id' style={styles.input} onChangeText={appIDChange} autoCorrect={false} autoCapitalize='none'/>
                    

                    <Text style={styles.text}>Device UID</Text>
                    <TextInput value={deviceUID} placeholder='e.g ABC123 (Max. 6 Characters)' style={styles.input} onChangeText={uidChange} autoCorrect={false} autoCapitalize='none'/>
                    <View style={{paddingTop:15, flexDirection:'row', justifyContent:'space-between'}}>

                        <LastSeen/>
                        <Pressable style={[{width:120},globalStyles.button]} onPress={handlePress}>
                            <Text style={globalStyles.buttonText}>Search</Text>
                        </Pressable>
                    </View>
                    <ShowData/>  
                </View>
                    <Loading/>
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    contentView:{
        padding:10
    },
    title:{
        fontSize:20,
        paddingTop:20,
        width:'100%',
        alignItems:'flex-end',
        fontWeight:'bold',
    },
    text:{
        paddingTop:10,
        fontSize:15
    },
    input:{
        height:40,
        borderColor:'gray',
        borderWidth:1,
        marginTop:2
    },
    row:{
       padding:5 
    },
})
export default ManageDevices;