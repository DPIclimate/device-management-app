import React, { useEffect, useState, useLayoutEffect } from 'react';
import '../global.js'
import {View,
	Text,
	Image,
	TouchableHighlight,TouchableOpacity,
	Pressable,
	StyleSheet,
} from 'react-native'
import globalStyles from '../styles';
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import {NavButtons,
	renderItem,
	checkNetworkStatus,
    renderHiddenItem,
	LoadingComponent,
    Offline,
    getFromStore} from '../shared'
import { Overlay } from 'react-native-elements';
import WelcomScreen from './WelcomScreen';
import { SwipeListView } from 'react-native-swipe-list-view';
import useFetchState from '../shared/useFetch.js';
import * as Progress from 'react-native-progress';

function Applications({navigation}) {

    const [listData, changeData] = useState([]);
    const {data, isLoading, error, retry} = useFetchState(`${config.ttnBaseURL}?field_mask=description`,{type:"ApplicationList", storKey:global.APP_CACHE})
    const [netStatus, setNetStaus] = useState(false)
    const [noData, setNoData] = useState(false)

    const [savedDevices, setSavedDevices] = useState(false)
    const isFocused = useIsFocused()

    const [validToken, changeValid] = useState(true)
    const [welcomeVisable, setWelcVisable] = useState(false);

    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <Icon/>,
        });
      }, [navigation]);

    useEffect(()=>{

        async function loaded(){

            if (isLoading) return

            if (error == 'User not logged in'){
                console.log('use not logged in')
                setWelcVisable(true)
            }
            else{
                setListData(data)
            }
        }
        loaded()
    },[isLoading])

    useEffect(() =>{

        async function onFocus(){
            const status = await checkNetworkStatus()
            setNetStaus(status)
            checkSavedReg()
        }
        onFocus()
        
    }, [isFocused])

    const handleTmp = async() =>{
        //Temporty button to clear app storage
        AsyncStorage.clear()
    }
    const Icon = () =>{
  
        return (
            // <TouchableOpacity onPress={() => handleTmp()}>
          <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
            <Image source={require('../assets/settingsWhite.png')} style={{width:25, height:25, marginRight:15}}/>
          </TouchableOpacity>
        )
      }

    const checkSavedReg = async() =>{ //Check for saved devices or updates

        const {fromStore: saved, error} = await getFromStore({storKey:global.DEV_STORE, type:'QueDeviceList'})

        if (saved.length != 0){
            setSavedDevices(true)
        }
        else{
            setSavedDevices(false)
        }
    }
    const setListData = async(data) => {//Request applications from ttn
        if (isLoading) return
        if (error != null && error != undefined) {changeValid(false);return}

        const {fromStore: favs, error} = await getFromStore({type:'FavList', storKey:global.APP_FAV})

        if (netStatus){
            if (data?.applications == undefined){setNoData(true); return}
            const apps = data?.applications

            const appList = apps.map((app) => ({id:app['ids']['application_id'], isFav:favs.includes(app['ids']['application_id']), description:app['description']}))

            changeData(appList)
            changeValid(true)
        }
        else{
            if (data.length == 0){setNoData(true); return}
            let listOfIds = data.map((app) => ({id:app['application_id'], isFav:favs.includes(app['application_id']), description:app['description']}))
            changeData(listOfIds)
        }
    }

    const DataError = () =>{
        
        if (!netStatus && listData == null){

            return(
                <Text style={[globalStyles.text, {justifyContent:'center'}]}>No applications to display</Text>
            )  
        }
        else{
            return(<View/>)
        }
    }
    const handlePress = (item) =>{

        navigation.navigate('Devices',{application_id: item.id, app_description: item.description})
    }

    const Icons = () =>{
        
        const SavedDevices = () =>{
            if (!savedDevices) return <View/>
            return (
                <View style={{paddingLeft:10}}>
                    <TouchableHighlight style={{width:45, height:45, borderRadius:50}} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => navigation.navigate('OfflineDevices')}>
                        <Image style={{width:'100%', height:'100%', borderRadius:50}} source={require('../assets/uploadFailed.png')}/>
                    </TouchableHighlight>
                </View>
            )
        }
        return(
            <View style={{width:200, height:45, position:'absolute', justifyContent:'flex-end', flexDirection:'row', right:0, top:5, margin:10}} >
                <Offline isConnected={netStatus}/>
                <SavedDevices/>
            </View>
        )
    }
    const toggleFavourite = async(data, rowMap) =>{

        if (rowMap[data.index]) {
            rowMap[data.index].closeRow();
          }

        try{
            let {fromStore: favs, error} = await getFromStore({type:'FavList', storKey:global.APP_FAV})

            if (favs.includes(data.item.id)){
                favs.splice(favs.indexOf(data.item.id),1)
            }
            else{
                favs.push(data.item.id)
            }

            await AsyncStorage.setItem(global.APP_FAV, JSON.stringify(favs))
        }
        catch(error){
            console.log(error)
        }

        changeData(listData.map(item => item.id == data.item.id? {...item, isFav:!item.isFav}:item))

    }

    return (
        <View style={globalStyles.screen}>
            
            {validToken?
            <>
                <Text style={[globalStyles.title,styles.title]}>Applications</Text>
                <Icons/>
                <LoadingComponent loading={isLoading}/>
                <DataError/>

                <View style={[{flex:1}, globalStyles.list]}>

                    <SwipeListView
                    data={listData.sort((a,b)=>{
                        return (a.isFav === b.isFav) ? a.id > b.id : a.isFav ? -1 : 1

                    })}
                    renderItem={(item) => renderItem(item, handlePress, 'Applications')}
                    keyExtractor={(item, index) => index.toString()}
                    renderHiddenItem={(data, rowMap) => renderHiddenItem(data, rowMap, toggleFavourite)}
                    leftOpenValue={80}
                    stopRightSwipe={1}
                    contentContainerStyle={{ paddingBottom: 70 }}
                    />
                </View>
                
                <NavButtons navigation={navigation}/>
            </>
            :
            <>
                <View style={{position:'absolute'}}>

                    <Pressable style={[globalStyles.redButton, styles.redButtonLoc]} onPress={()=> navigation.navigate('SettingsScreen')}>
                        <Text style={{color:'white'}}>Fix Token</Text>
                    </Pressable>

                    <TouchableOpacity style={{width:300, height:50, paddingTop:10}} onPress={()=> toggleReload()}>
                        <Text style={globalStyles.redText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            </>
            }

            <Overlay isVisible={welcomeVisable} overlayStyle={{borderRadius:10, width:350, height:650, backgroundColor:'#f3f2f3'}}>
                <WelcomScreen retry={retry} visible={setWelcVisable} validT/>
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