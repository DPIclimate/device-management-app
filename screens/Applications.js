import React, { useEffect, useState } from 'react';
import {View, Text, Image, TouchableHighlight, Alert} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import {NavButtons, renderItem, checkNetworkStatus, LoadingComponent} from '../shared/index.js'
import getApplicationList, {cacheTTNdata} from '../shared/ManageLocStorage'

function Applications({navigation}) {

    const [data, changeData] = useState([]);
    const [isLoading, setLoading] = useState(true)
    const [savedDevices, setSavedDevices] = useState(false)
    const isFocused = useIsFocused()
    const [isConnected, changeIsConnected] = useState(false)
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
                getAppIds()
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
    const getAppIds = async() =>{ //Read application data from cache

        const apps = await getApplicationList()

        if (apps != null){

            let listOfIds = apps.map((app) => app['application_id'])
            changeData(listOfIds)

        }
        else{
            changeData(null)
        }
        setLoading(false)
    }

    const getApplications = async() => {//Request applications from ttn

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
    const handlePress = (item) =>{
        navigation.navigate('Devices',{application_id: item})
    }

    const Icons = () =>{
        
        const SavedDevices = () =>{
            if (savedDevices == true){
                return (
                    <View style={{paddingLeft:10}}>
                        <TouchableHighlight style={{width:45, height:45, borderRadius:50}} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => navigation.navigate('OfflineDevices')}>
                            <Image style={{width:'100%', height:'100%', borderRadius:50}} source={require('../assets/uploadFailed.png')}/>
                        </TouchableHighlight>
                    </View>
                )
            }
            else{
                return <View/>
            }
        }

        const Offline = () =>{

            if (!isConnected){
                return(
                    <TouchableHighlight style={{width:45, height:45, borderRadius:50}} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => Alert.alert("No Connection Detected", "The data you see below is a local copy of TTN data and is not a live data from TTN")}>
                        <Image style={{width:'100%', height:'100%', borderRadius:50}} source={require('../assets/noConnection.png')}/>
                    </TouchableHighlight>
                );
            }
            else{
                return null
            }
        }

        return(
            <View style={{width:200, height:45, position:'absolute', justifyContent:'flex-end', flexDirection:'row', right:0, top:0, margin:10}} >
                <Offline/>
                <SavedDevices/>
            </View>
        )
    }
    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,{padding:10, paddingTop:25}]}>Applications</Text>
            <Icons/>

            <LoadingComponent loading={isLoading}/>
            <DataError/>

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
export default Applications;