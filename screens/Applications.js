import React, { useEffect, useState, useLayoutEffect } from 'react';
import '../global.js'
import {View, Text, Image, TouchableHighlight,TouchableOpacity, Alert, Pressable, StyleSheet} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import {NavButtons, renderItem, checkNetworkStatus, LoadingComponent, validateToken, cacheTTNdata, getTTNToken, isFirstLogon} from '../shared'
import getApplicationList from '../shared/ManageLocStorage'
import { Overlay } from 'react-native-elements';
import WelcomScreen from './WelcomScreen';


function Applications({navigation}) {

    const [data, changeData] = useState([]);
    const [isLoading, setLoading] = useState(true)
    const [savedDevices, setSavedDevices] = useState(false)
    const isFocused = useIsFocused()
    const [isConnected, changeIsConnected] = useState(false)
    const [validToken, changeValid] = useState(true)
    const [firstLoad, changeFirstLoad] = useState(true)

    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <Icon/>,
        });
      }, [navigation]);

    const [welcomeVisable, setWelcVisable] = useState(false);

    const toggleOverlay = () => {
        setWelcVisable(!welcomeVisable);
    };

    useEffect(()=>{
        async function onLoad(){

            console.log("Running on Load")

            if (firstLoad){
                console.log("Running on first Load")
                await AsyncStorage.clear()

                let fLogon = await isFirstLogon()

                if (fLogon){
                    setWelcVisable(true)
                }
                changeFirstLoad(false)
            }

            console.log('welcom screen status', welcomeVisable)
            if(welcomeVisable == false){
                let connected = await checkNetworkStatus()
                if (connected){

                    console.log("Updating tokens")
                    let token = await getTTNToken()

                    global.valid_token = await validateToken(token)

                    changeValid(global.valid_token)
                    cacheTTNdata()
                    await getApplications()

                }else{
                    await getAppIds()
                }
                changeIsConnected(connected)
                checkSavedReg()

            }
        }
        onLoad()
    },[isFocused, welcomeVisable])


    const Icon = () =>{
  
        return (
          <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
            <Image source={require('../assets/settingsWhite.png')} style={{width:25, height:25, marginRight:15}}/>
          </TouchableOpacity>
        )
      }

    const checkSavedReg = async() =>{ //Check for saved devices or updates
        let saved = []

        try{
            let fromStore = await AsyncStorage.getItem(global.DEV_STORE)
            fromStore = JSON.parse(fromStore)
            fromStore != null? saved = [...saved, ...fromStore] : saved = []

        }catch(error){
            console.log(error)
        }

        try{
            let fromStore = await AsyncStorage.getItem(global.LOC_UPDATES)
            fromStore = JSON.parse(fromStore)
            fromStore != null? saved = [...saved, ...fromStore] : saved = saved

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

        console.log(global.valid_token)
        if (global.valid_token){
            try{
                const url = `${config.ttnBaseURL}`
                let response = await fetch(url, {
                    method:"GET",
                    headers:global.headers
                }).then((response) => response.json())

                response = response['applications']
                const apps = response.map((app) => app['ids']['application_id'])
                changeData(apps)

            }catch(error){
                console.log(error)
            }
        }
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
    const ValidContent = () =>{

        if (validToken){
            return(
                <>
                <Text style={[globalStyles.title,{padding:10, paddingTop:25}]}>Applications</Text>
                <Icons/>
                <LoadingComponent loading={isLoading}/>
                <DataError/>
    
                <FlatList
                style={[{flex:1},globalStyles.list]} 
                data={data}
                renderItem={(item) => renderItem(item, handlePress, 'Applications')}
                keyExtractor={(item, index) => index.toString()}
                />
                
                <View style={{flex:0.15}}>
                    <NavButtons navigation={navigation}/>
                </View>
                
                </>
            )
        }
        else{

            return(
                <>
                    <View style={{position:'absolute'}}>

                        <Pressable style={[globalStyles.button, {backgroundColor:'red', width:300, height:50}]} onPress={toggleOverlay}>
                            <Text style={globalStyles.buttonText}>Fix Token</Text>
                        </Pressable>
                    </View>
                </>
            )
        }
    }
    return (
        <View style={globalStyles.screen}>

            <ValidContent/>
            <Overlay isVisible={welcomeVisable} overlayStyle={{borderRadius:10, width:350, height:650, backgroundColor:'#f3f2f3'}}>
                <WelcomScreen visible={setWelcVisable}/>
            </Overlay >
        </View>
    );
}
export default Applications;