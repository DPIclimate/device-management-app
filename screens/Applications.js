import React, { useEffect, useState, useLayoutEffect } from 'react';
import '../global.js'
import {View, Text, Image, TouchableHighlight,TouchableOpacity, Alert, Pressable, InteractionManager, StyleSheet} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import {NavButtons, renderItem, checkNetworkStatus, LoadingComponent, cacheTTNdata, getTTNToken, isFirstLogon, getApplicationList, validateToken, Card} from '../shared'
import { Overlay } from 'react-native-elements';
import WelcomScreen from './WelcomScreen';
import { SwipeListView } from 'react-native-swipe-list-view';

export  const DataContext = React.createContext()

function Applications({navigation}) {

    const [appData, changeData] = useState([]);

    const [isLoading, setLoading] = useState(true)
    const [savedDevices, setSavedDevices] = useState(false)
    const isFocused = useIsFocused()
    const [isConnected, changeIsConnected] = useState(false)

    const [validToken, changeValid] = useState(true)
    const [firstLoad, changeFirstLoad] = useState(true)
    const [welcomeVisable, setWelcVisable] = useState(false);
    const [isRendered, changeRenderState] = useState(false)
    const [reload, setReload] = useState(false)

    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <Icon/>,
        });
      }, [navigation]);

    const toggleReload = () =>{
        setReload(!reload)
    }

    useEffect(()=>{
        async function retrieveData(){

            let fLogon = await isFirstLogon()
        
            if (fLogon && firstLoad && welcomeVisable == false){
                setWelcVisable(true)
                changeFirstLoad(false)
            }
            else if(welcomeVisable == false){
                global.TTN_TOKEN = await getTTNToken()
                global.valid_token = await validateToken(global.TTN_TOKEN)

                let connected = await checkNetworkStatus()

                if (connected){
                    getApplications()
                    cacheTTNdata()
                }else{
                    getAppIds()
                }
                changeIsConnected(connected)
            }
        }
        InteractionManager.runAfterInteractions(() =>{
            //Testing if this improves performance
            changeRenderState(true)
            retrieveData()
        })

    },[,welcomeVisable, reload])

    useEffect(() =>{
        checkSavedReg()
        
    }, [isFocused])

    const Icon = () =>{
  
        return (
            // <TouchableOpacity onPress={() => setWelcVisable(true)}>
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
        const favs = await getFavourites()

        if (apps != null){

            let listOfIds = apps.map((app) => ({id:app['application_id'], isFav:favs.includes(app['application_id'])}))
            changeData(listOfIds)

        }
        else{
            changeData(null)
        }
        setLoading(false)
    }
    const getApplications = async() => {//Request applications from ttn

        console.log("in get applications", global.valid_token)
        const favs = await getFavourites()

        if (global.valid_token){
            changeValid(true)
            try{
                const url = `${config.ttnBaseURL}`
                let response = await fetch(url, {
                    method:"GET",
                    headers:global.headers
                }).then((response) => response.json())

                response = response['applications']
                const apps = response.map((app) => ({id:app['ids']['application_id'], isFav:favs.includes(app['ids']['application_id'])}))
                changeData(apps)

            }catch(error){
                console.log(error)
            }
        }
        else{
            changeValid(false)

        }
        setLoading(false)

    }
    const getFavourites = async()=>{

        try{
            let fromStore = JSON.parse(await AsyncStorage.getItem(global.FAV_STORE))
            if (fromStore == null) fromStore = []

            return fromStore
        }
        catch(error){
            console.log(error)
            return []
        }
    }

    const DataError = () =>{
        
        if (!isConnected && appData == null){

            return(
                <Text style={[globalStyles.text, {justifyContent:'center'}]}>No applications to display</Text>
            )  
        }
        else{
            return(<View/>)
        }
    }
    const handlePress = (item) =>{

        navigation.navigate('Devices',{application_id: item.id})
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
    const toggleFavourite = async(data, rowMap) =>{
        if (rowMap[data.index]) {
            rowMap[data.index].closeRow();
          }

        try{
            let favs = await getFavourites()

            if (favs.includes(data.item.id)){
                favs.splice(favs.indexOf(data.item.id),1)
            }
            else{
                favs.push(data.item.id)
            }

            await AsyncStorage.setItem(global.FAV_STORE, JSON.stringify(favs))
        }
        catch(error){
            console.log(error)
        }

        changeData(appData.map(item => item.id == data.item.id? {...item, isFav:!item.isFav}:item))

    }

    const renderHiddenItem = (data, rowMap)=>{

        let id = data.item.id
        const isFavourite = data.item.isFav

        return (
            <View style={{flexDirection:'row'}}>
                <TouchableOpacity style={{height:'100%', width:80, justifyContent:'center'}} onPress={() => toggleFavourite(data, rowMap)} activeOpacity={0.6}>
                    <Card colour={'#1396ED'}>
                        <View style={{height:'100%', width:'100%', justifyContent:'center', alignItems:'center'}}> 
                            <Image style={{height:'130%', width:40}} resizeMode='contain' source={isFavourite == true? require('../assets/favourite.png'):require('../assets/notFavourite.png')}/>
                        </View>
                    </Card>
                </TouchableOpacity>

                <View style={{flex:1}}/>
            </View>        
        )
    }

    const ValidContent = () =>{

        if (validToken){
            return(
                <>
                    <Text style={[globalStyles.title,styles.title]}>Applications</Text>
                    <Icons/>
                    <LoadingComponent loading={isLoading}/>
                    <DataError/>

                    <View style={[{flex:1}, globalStyles.list]}>
                        <SwipeListView
                        data={appData.sort((a,b)=>{
                            (a.isFavourite === b.isFavourite) ? a.id > b.id : a.isFavourite ? -1 : 1
                        })}
                        renderItem={(item) => renderItem(item, handlePress, 'Applications')}
                        keyExtractor={(item, index) => index.toString()}
                        renderHiddenItem={renderHiddenItem}
                        leftOpenValue={80}
                        stopRightSwipe={1}
                        />
                    </View>
                    
                    <View style={{flex:0.15}}>
                        <NavButtons navigation={navigation}/>
                    </View>
                </>
            )
        }
        else{
            console.log("in validContent, not valid")
            return(
                <>
                    <View style={{position:'absolute'}}>

                        <Pressable style={[globalStyles.redButton, styles.redButtonLoc]} onPress={()=> navigation.navigate('SettingsScreen')}>
                            <Text style={globalStyles.redText}>Fix Token</Text>
                        </Pressable>

                        <TouchableOpacity style={{width:300, height:50, paddingTop:10}} onPress={()=> toggleReload()}>
                            <Text style={globalStyles.redText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )
        }
    }
    return (
        <View style={globalStyles.screen}>
            {isRendered? <ValidContent/>:<View/>}
            <Overlay isVisible={welcomeVisable} overlayStyle={{borderRadius:10, width:350, height:650, backgroundColor:'#f3f2f3'}}>
                <WelcomScreen visible={setWelcVisable} firstLoad={changeFirstLoad} validT/>
            </Overlay >
        </View>
    );
}
const styles = StyleSheet.create({
    title:{
        padding:10, 
        paddingTop:25
    },
    redButtonLoc:{
        backgroundColor:'red', 
        width:300, 
        height:50
    }
})
export default Applications;