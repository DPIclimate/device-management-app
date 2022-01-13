import React, { useEffect, useState } from 'react';
import {View, Text, Alert, TouchableHighlight, Image} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import config from '../config.json'
import {NavButtons, renderItem, checkNetworkStatus, LoadingComponent} from '../shared/index.js'
import {getDevice, getApplication} from '../shared/ManageLocStorage'

function Devices({route, navigation}) {

    const [data, changeData] = useState({});
    const [isLoading, setLoading] = useState(true)
    const [isConnected, changeIsConnected] = useState(false)

    useEffect(() =>{
        async function retrieveData(){
            let connected = await checkNetworkStatus()
            if (connected){
                getDevices()
            }
            else{
                getDevIds()
            }
            changeIsConnected(connected)
        }
        retrieveData()
    },[])

    const getDevices = async () =>{
        const url = `${config.ttnBaseURL}/${route.params.application_id}/devices`
        let response = await fetch(url, {
            method:"GET",
            headers:global.headers
        }).then((response) => response.json())

        response = response['end_devices']
        const devices = response.map((device) => device['ids']['device_id'])
        changeData(devices)
        setLoading(false)
    }

    const getDevIds = async() =>{

        const app = await getApplication(route.params.application_id)
        const devices = app['end_devices']

        let listOfIds = devices.map((dev) => dev['ids']['device_id'])
        changeData(listOfIds)
        setLoading(false)

    }

    const handlePress = async(devName) =>{

        let response = null

        if (isConnected){
            const url = `${config.ttnBaseURL}/${route.params.application_id}/devices/${devName}?field_mask=attributes`

            let res = await fetch(url, {
                method:"GET",
                headers:global.headers
            }).then((response) => response.json())

            response = res
        }
        else{
            response = await getDevice(route.params.application_id, devName)
        }
        try{
            const uid = response['attributes']['uid']
            const application_id = response['ids']['application_ids']['application_id']
            const name = response['ids']['device_id']
            
            let devData = {
                'appID':application_id,
                'uid':uid,
                'name':name,
                'uidPresent':true
            }
            navigation.navigate('ManageDevices', {autofill:devData})


        }catch(error){
            console.log(error)
            Alert.alert("No UID exists", "Would you like to assign a UID to this device?",[
                {
                    text:"Yes",
                    onPress:() => navigate(response, "AddDeviceScreen")
                },
                {
                    text:"No",
                    onPress:() => console.log("No")
                },
                {
                    text: "View details",
                    onPress:() => isConnected ? navigate(response, 'ManageDevices'): Alert.alert('Cannot show details', 'Cannot show device with no UID while you are offline')
                }
            ])
        }
    }
    const Offline = () =>{

        if (!isConnected){
            return(
                <TouchableHighlight style={{width:45, height:45, borderRadius:50, position:'absolute', right:0, top:0, margin:10}} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => Alert.alert("No Connection Detected", "The data you see below is a local copy of TTN data and is not a live data from TTN")}>
                    <Image style={{width:'100%', height:'100%', borderRadius:50}} source={require('../assets/noConnection.png')}/>
                </TouchableHighlight>
            );
        }
        else{
            return null
        }
    }

    const navigate = (response, screen) =>{
        //Navigate to withough a UID
        let devData ={
            'appID':response['ids']['application_ids']['application_id'],
            'name':response['ids']['device_id'],
            'eui':response['ids']['dev_eui'],
            'uidPresent':false
        }
        navigation.navigate(screen,{autofill:devData})
    }

    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,{padding:10, paddingTop:25}]}>{route.params.application_id} - Devices</Text>
            <Offline/>
            <LoadingComponent loading={isLoading}/>
                <FlatList
                style={[{flex:1},globalStyles.list]} 
                data={data}
                renderItem={(item) => renderItem(item, handlePress, 'Devices')}
                keyExtractor={(item, index) => index.toString()}
                />
            <View style={{flex:0.15}}>
                <NavButtons navigation={navigation}/>
            </View>
        </View>
    );
}

export default Devices;