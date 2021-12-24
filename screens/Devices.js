import React, { useEffect, useState } from 'react';
import {View, SafeAreaView, Pressable, Text, StyleSheet, TouchableOpacity, Image, Alert} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import config from '../config.json'
import Card from '../shared/Card';
import LoadingComponent from '../shared/LoadingComponent';
import checkNetworkStatus from '../shared/NetworkStatus';


function Devices({route, navigation}) {

    const [data, changeData] = useState({});
    const [isLoading, setLoading] = useState(true)
    const [isConnected, changeIsConnected] = useState(false)

    useEffect(() =>{
        getDevices()
        changeIsConnected(true)
        // let connected = checkNetworkStatus()
        // if (connected){
        //     getDevices()
        // }
        // else{
        //     readFromCache()
        // }
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
            let devices = apps.map((app) => app['end_devices'])
            let listOfIds = devices.map((dev) => dev[['ids']['device_id']])
            changeData(listOfIds)
            setLoading(false)

        }
        console.log('finished reading chache')
    }

    const handlePress = async(device) =>{

        const url = `${config.ttnBaseURL}/${route.params.application_id}/devices/${device}?field_mask=attributes`

        let response = await fetch(url, {
            method:"GET",
            headers:config.headers
        }).then((response) => response.json())

        try{
            let uid = response['attributes']['uid']
            let application_id = response['ids']['application_ids']['application_id']

            let devData = {
                'appID':application_id,
                'uid':uid,
                'uidPresent':true
            }
            navigation.navigate('ManageDevices', {autofill:devData})

        }catch(error){
            Alert.alert("No UID exists", "Would you like to assign a UID to this device?",[
                {
                    text:"Yes",
                    onPress:() =>navigate(response, "AddDeviceScreen")
                },
                {
                    text:"No",
                    onPress:() => console.log("No")
                },
                {
                    text: "View details",
                    onPress:() => navigate(response, 'ManageDevices')
                }
            ])
        }
    }
    
    const navigate = (response, screen) =>{

        let devData ={
            'appID':response['ids']['application_ids']['application_id'],
            'name':response['ids']['device_id'],
            'eui':response['ids']['dev_eui'],
            'uidPresent':false
        }
        navigation.navigate(screen,{autofill:devData})
    }
    const Connection = () =>{
        if (isConnected){

            return null
        }else{
            return(
                <View style={{justifyContent:'flex-end', alignContent:'flex-end'}}>
                    {/* <Image style={{width:'100%', height:'100%', borderRadius:50}} source={require('../assets/noConnection.png')}/> */}
                    <Text style={[globalStyles.text, {color:'red'}]}>(Cached)</Text>
                </View>
            );
        }
    }

    const renderItem = ({ item }) => (
        <Card>
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => handlePress(item)}>
            <Text style={globalStyles.text}>{item}</Text>

            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:30}}>
                    <Connection/>
                    <Image source={require('../assets/arrow.png')} style={{height:20, width:20}}/>
                </View>
            </TouchableOpacity>
        </Card>
      );

    return (
        <View style={globalStyles.screen}>
            <Text style={[styles.title,{padding:10, paddingTop:25}]}>{route.params.application_id} - Devices</Text>
            <LoadingComponent loading={isLoading}/>
                <FlatList
                style={[{flex:1},globalStyles.list]} 
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                />
            <View style={{flex:0.15}}>
                <Pressable style={[globalStyles.button, styles.addDeviceLoc]} onPress={() => {navigation.navigate('AddDeviceScreen')}}>
                    <Text style={globalStyles.buttonText}>Add Device</Text>
                </Pressable>

                <Pressable style={[globalStyles.button, styles.manDeviceLoc]} onPress={() => {navigation.navigate('ManageDevices')}}>
                    <Text style={globalStyles.buttonText}>Manage</Text>
                </Pressable>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    
    title:{
        fontSize:20,
        paddingTop:20,
        width:'100%',
        alignItems:'flex-end',
        fontWeight:'bold',
    },
    addDeviceLoc:{
        position:'absolute',
        left:20, 
        bottom:20,
        height:45,
        width:'40%'
    },
    manDeviceLoc:{
        position:'absolute',
        right:20, 
        bottom:20,
        height:45,
        width:'40%'

    }
});

export default Devices;