import React, { useEffect, useState } from 'react';
import {View, Text, Alert} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavButtons, renderItem, checkNetworkStatus, LoadingComponent} from '../shared/index.js'


function Devices({route, navigation}) {

    const [data, changeData] = useState({});
    const [isLoading, setLoading] = useState(true)
    const [isConnected, changeIsConnected] = useState(false)
    const [appObj, changeAppObj] = useState({})

    const APP_CACHE = 'applicationCache'

    useEffect(() =>{
        async function retrieveData(){
            let connected = await checkNetworkStatus()
            if (connected){
                getDevices()
            }
            else{
                readFromCache()
            }
            changeIsConnected(connected)
        }
        retrieveData()
    },[])

    const getDevices = async () =>{
        const url = `${config.ttnBaseURL}/${route.params.application_id}/devices`
        let response = await fetch(url, {
            method:"GET",
            headers:config.headers
        }).then((response) => response.json())

        response = response['end_devices']
        const devices = response.map((device) => device['ids']['device_id'])
        changeData(devices)
        setLoading(false)
    }

    const readFromCache = async() =>{

        console.log('reading chache')
        let apps = []

        try{
            let fromStore = await AsyncStorage.getItem(APP_CACHE)
            fromStore = JSON.parse(fromStore)
            apps = fromStore

        }catch(error){
            console.log(error)
        }

        if (apps != null){
            //Get respective app object and devices within app

            let devices = []
            for (let app in apps){

                let app_obj = apps[app]
                const id = app_obj['application_id']

                if (id == route.params.application_id){
                    changeAppObj(app_obj)
                    devices = app_obj['end_devices']
                }
            }

            let listOfIds = devices.map((dev) => dev['ids']['device_id'])
            changeData(listOfIds)
            setLoading(false)

        }
        console.log('finished reading chache')
    }

    const handlePress = async(devName) =>{

        let response = null

        if (isConnected){
            const url = `${config.ttnBaseURL}/${route.params.application_id}/devices/${devName}?field_mask=attributes`

            let res = await fetch(url, {
                method:"GET",
                headers:config.headers
            }).then((response) => response.json())

            response = res
        }
        else{
            console.log('getting details from cache')

            for (let i in appObj['end_devices']){

                let deviceName = appObj['end_devices'][i]['ids']['device_id']

                if (deviceName == devName){
                    response = appObj['end_devices'][i]
                }
            }
        }
        try{
            let uid = response['attributes']['uid']
            let application_id = response['ids']['application_ids']['application_id']

            let devData = {
                'appID':application_id,
                'uid':uid,
                'uidPresent':true
            }
            if (isConnected){
                navigation.navigate('ManageDevices', {autofill:devData})

            }else{
                navigation.navigate('ManageDevices', {devObj:response, autofill:devData})
            }

        }catch(error){
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
            <LoadingComponent loading={isLoading}/>
                <FlatList
                style={[{flex:1},globalStyles.list]} 
                data={data}
                renderItem={(item) => renderItem(item, handlePress, isConnected)}
                keyExtractor={(item, index) => index.toString()}
                />
            <View style={{flex:0.15}}>
                <NavButtons navigation={navigation}/>
            </View>
        </View>
    );
}

export default Devices;