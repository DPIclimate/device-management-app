import React, { useEffect, useState } from 'react';
import {View, SafeAreaView, Pressable, Text, StyleSheet, TouchableOpacity, Image, TouchableHighlight} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import config from '../config.json'
import Card from '../shared/Card';
import LoadingComponent from '../shared/LoadingComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import checkNetworkStatus from '../shared/NetworkStatus';

function Applications({navigation}) {

    //TODO - Consolidate with devices screen, Lots of unnecessary duplicate code

    const [data, changeData] = useState([]);
    const [isLoading, setLoading] = useState(true)
    const [savedDevices, setSavedDevices] = useState(false)
    const isFocused = useIsFocused()
    const [isConnected, changeIsConnected] = useState(false)
    const APP_CACHE = 'applicationCache'
    const DEV_STORE = 'devices'
    const LOC_UPDATES = 'locationUpdates'

    useEffect(()=>{
        async function retrieveData(){
            let connected = await checkNetworkStatus()
            console.log(connected)
            if (connected){
                getApplications()
                cacheTTNdata()
            }else{
                readFromCache()
            }
            changeIsConnected(connected)
        }
        retrieveData()
    },[])

    useEffect(() =>{
        checkSavedReg()
    }, [isFocused])
 
    const checkSavedReg = async() =>{ //Check for saved devices or updates
        let saved = []

        try{
            let fromStore = await AsyncStorage.getItem(DEV_STORE)
            fromStore = JSON.parse(fromStore)
            fromStore != null? saved = [...saved, ...fromStore] : saved = []

        }catch(error){
            console.log(error)
        }

        try{
            let fromStore = await AsyncStorage.getItem(LOC_UPDATES)
            fromStore = JSON.parse(fromStore)
            fromStore != null? saved = [...saved, ...fromStore] : saved = []

        }catch(error){
            console.log(error)
        }

        if (saved.length != 0){
            setSavedDevices(true)
        }
        else{
            setSavedDevices(false)
        }
    }
    const readFromCache = async() =>{ //Read application data from cache

        console.log('No internet connection, reading applications from chache')
        let apps = []

        try{
            let fromStore = await AsyncStorage.getItem(APP_CACHE)
            fromStore = JSON.parse(fromStore)
            apps = fromStore

        }catch(error){
            console.log(error)
        }

        if (apps != null){

            let listOfIds = apps.map((app) => app['application_id'])
            changeData(listOfIds)

        }
        else{
            changeData(null)
        }
        setLoading(false)
    }

    const cacheTTNdata = async() =>{ // Cache TTN data for ofline use
        
        console.log('Caching ttn data')
        const url = `${config.ttnBaseURL}`
        let response = await fetch(url, {
            method:"GET",
            headers:config.headers
        }).then((response) => response.json())

        response = response['applications']
        const apps = response.map((app) => app['ids']['application_id'])
        let applications = []

        for (let app in apps){
            app = apps[app]

            const url = `${config.ttnBaseURL}/${app}/devices?field_mask=attributes,locations`
            let response = await fetch(url, {
                method:"GET",
                headers:config.headers
            }).then((response) => response.json())

            applications.push(
                {
                    'application_id':app,
                    'end_devices': response['end_devices']
                }
            )
        }
        try{
            await AsyncStorage.setItem(APP_CACHE, JSON.stringify(applications))

        }catch(error){
            console.log(error)
        }
        console.log('Cached ttn data successfully')

    }

    const getApplications = async() => {

        const url = `${config.ttnBaseURL}`
        let response = await fetch(url, {
            method:"GET",
            headers:config.headers
        }).then((response) => response.json())

        response = response['applications']
        const apps = response.map((app) => app['ids']['application_id'])
        changeData(apps)
        setLoading(false)
    }
    
    
    const renderItem = ({ item }) => (
        <Card>
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => navigation.navigate('Devices',{application_id: item})}>
                <Text style={globalStyles.text}>{item}</Text>

                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:30}}>
                    <Connection/>
                    <Image source={require('../assets/arrow.png')} style={{height:20, width:20}}/>
                </View>
            </TouchableOpacity>
        </Card>
      );
    
    const SavedDevices = () =>{
        if (savedDevices == true){
            return (
                <View style={{width:45, height:45, position:'absolute', right:0, top:0, margin:10}} >
                    <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => navigation.navigate('OfflineDevices')}>
                        <Image style={{width:'100%', height:'100%', borderRadius:50}} source={require('../assets/uploadFailed.png')}/>
                    </TouchableHighlight>
                </View>
            )
        }
        else{
            return null
        }
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
    const DataError = () =>{
        
        if (!isConnected && data == null){

            return(
                <Text style={[globalStyles.text, {justifyContent:'center'}]}>No applications to display</Text>
            )  
        }
        else{
            return(<View/>)
        }
    }
    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,{padding:10, paddingTop:25}]}>Applications</Text>
            <SavedDevices/>

                <LoadingComponent loading={isLoading}/>
                <DataError/>

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
export default Applications;