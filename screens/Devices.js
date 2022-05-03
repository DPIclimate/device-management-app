import React, { useEffect, useState } from 'react';
import {View,
	Text,
	StyleSheet
} from 'react-native'
import globalStyles from '../styles';

import {
	renderItem,
    renderHiddenItem,
	LoadingComponent,
    Offline,
    getFromStore
} from '../shared/index.js'
import { SwipeListView } from 'react-native-swipe-list-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetchState from '../shared/useFetch';
import { useGetNetStatus } from '../shared/useGetNetStatus';


function Devices({route, navigation}) {

    const [listData, changeData] = useState([])
    const [noData, setNoData] = useState(false)
    const {loading:netLoading, netStatus, netError} = useGetNetStatus()
    const {data, isLoading, error, retry} = useFetchState(`${global.BASE_URL}/applications/${route.params.application_id}/devices?field_mask=attributes,locations,description,name`, {type:'DeviceList', appID:route.params?.application_id, storKey:global.APP_CACHE})

    useEffect(()=>{

        async function loaded(){

            if (isLoading) return
            if(netLoading) return
            setListData(data)
        }
        loaded()
    },[isLoading, netLoading])
    
    const setListData = async(data) =>{
        if (isLoading) return
        if (error) return

        const {fromStore: favs, error} = await getFromStore({type:'FavList', storKey:global.DEV_FAV})
        try{
            const devices = data.end_devices.map((dev) =>({id:dev['ids']['device_id'], isFav:favs.includes(dev['ids']['device_id']), name:dev['name']}))
            changeData(devices)

        }catch(error){
            setNoData(true)
        }
    }

    const handlePress = async(item) =>{

        let device = null

        data.end_devices.forEach((dev)=>{
            if (dev.ids.device_id == item.id){
                device = dev
            }
        })

        const uid = device.attributes?.uid
        const application_id = device.ids.application_ids.application_id
        const ID = device.ids.device_id
        const name = device.name
        
        let devData = {
            'appID':application_id,
            'uid':uid,
            'ID':ID,
            'name':name,
            'uidPresent':uid ? true:false
        }
        navigation.navigate('ManageDevices', {autofill:devData})
    }

    const toggleFavourite = async(data, rowMap) =>{
        if (rowMap[data.index]) {
            rowMap[data.index].closeRow();
          }

        try{
            let {fromStore: favs, error} = await getFromStore({type:'FavList', storKey:global.DEV_FAV})

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

        changeData(listData.map(item => item.id == data.item.id? {...item, isFav:!item.isFav}:item))

    }
    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,styles.title]}>{route.params.application_id}</Text>
            <Text style={[globalStyles.text, styles.text]}>{route.params.app_description}</Text>

            <View style={{position:'absolute', right:0, top:5, margin:10}}>
                <Offline isConnected={netStatus}/>
            </View>

            {!noData ?<LoadingComponent loading={isLoading}/> :<Text style={{textAlign:'center', fontWeight:'bold', paddingTop:20}}>No devices in application</Text>}

            <SwipeListView
                style={[{flex:1},globalStyles.list]} 
                data={listData.sort((a,b)=>{
                    return (a.isFav === b.isFav) ? a.id > b.id : a.isFav ? -1 : 1

                })}
                renderItem={(item) => renderItem(item, handlePress, 'Devices')}
                keyExtractor={(item, index) => index.toString()}
                renderHiddenItem={(data, rowMap) => renderHiddenItem(data, rowMap, toggleFavourite)}
                leftOpenValue={80}
                stopRightSwipe={1}
                contentContainerStyle={{ paddingBottom: 90 }}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    title:{
        paddingTop:25,
        paddingLeft:5,
        paddingRight:5,
        textAlign:'center',
        width:'75%'
    },
    text:{
        textAlign:'center',
        padding:5,
        paddingBottom:10
    }
})
export default Devices;