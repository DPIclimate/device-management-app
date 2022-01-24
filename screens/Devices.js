import React, { useEffect, useState } from 'react';
import {View, Text, Alert, TouchableHighlight, Image, InteractionManager, TouchableOpacity, StyleSheet} from 'react-native'
import globalStyles from '../styles';
import config from '../config.json'
import {NavButtons, renderItem,renderHiddenItem, checkNetworkStatus, LoadingComponent, getFavourites} from '../shared/index.js'
import {getDevice, getApplication} from '../shared/ManageLocStorage'
import { SwipeListView } from 'react-native-swipe-list-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Devices({route, navigation}) {

    const [devData, changeData] = useState([]);
    const [isLoading, setLoading] = useState(true)
    const [isConnected, changeIsConnected] = useState(false)
    const [isRendered, changeRenderState] = useState(false)

    useEffect(() =>{
        console.log(route.params)
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

        InteractionManager.runAfterInteractions(() =>{
            //Testing if this improves performance
            changeRenderState(true)
            retrieveData()
        })
    },[])

    const getDevices = async () =>{
        
        const favs = await getFavourites(global.DEV_FAV)

        const url = `${config.ttnBaseURL}/${route.params.application_id}/devices`
        let response = await fetch(url, {
            method:"GET",
            headers:global.headers
        }).then((response) => response.json())

        response = response['end_devices']
        const devices = response.map((dev) => ({id:dev['ids']['device_id'], isFav:favs.includes(dev['ids']['device_id'])}))
        changeData(devices)
        setLoading(false)
    }

    const getDevIds = async() =>{
        
        const favs = await getFavourites(global.DEV_FAV)
        const app = await getApplication(route.params.application_id)
        const devices = app['end_devices']

        let listOfIds = devices.map((dev) => ({id:dev['ids']['device_id'], isFav:favs.includes(dev['ids']['device_id'])}))
        changeData(listOfIds)
        setLoading(false)

    }

    const handlePress = async(item) =>{

        const devName = item.id
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

    const toggleFavourite = async(data, rowMap) =>{
        if (rowMap[data.index]) {
            rowMap[data.index].closeRow();
          }

        try{
            let favs = await getFavourites(global.DEV_FAV)

            if (favs.includes(data.item.id)){
                favs.splice(favs.indexOf(data.item.id),1)
            }
            else{
                favs.push(data.item.id)
            }

            await AsyncStorage.setItem(global.DEV_FAV, JSON.stringify(favs))
        }
        catch(error){
            console.log(error)
        }

        changeData(devData.map(item => item.id == data.item.id? {...item, isFav:!item.isFav}:item))

    }
    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,styles.title]}>{route.params.application_id}</Text>
            <Text style={[globalStyles.text, styles.text]}>{route.params.app_description}</Text>

            {isRendered?<Offline/>:<View/>}

            <LoadingComponent loading={isLoading}/>

                {isRendered? <SwipeListView
                style={[{flex:1},globalStyles.list]} 
                data={devData.sort((a,b)=>{
                    return (a.isFav === b.isFav) ? a.id > b.id : a.isFav ? -1 : 1

                })}
                renderItem={(item) => renderItem(item, handlePress, 'Devices')}
                keyExtractor={(item, index) => index.toString()}
                renderHiddenItem={(data, rowMap) => renderHiddenItem(data, rowMap, toggleFavourite)}
                leftOpenValue={80}
                stopRightSwipe={1}
                contentContainerStyle={{ paddingBottom: 80 }}
                />: <View style={{flex:1}}/>}

            <NavButtons navigation={navigation}/>
        </View>
    );
}
const styles = StyleSheet.create({
    title:{
        paddingTop:25
    },
    text:{
        textAlign:'center',
        padding:5,
        paddingBottom:10
    }
})
export default Devices;