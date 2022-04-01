import React, { useEffect, useState } from 'react';
import {View,
	Text,
	TouchableOpacity,
	Pressable,
	StyleSheet,
} from 'react-native'
import globalStyles from '../styles';
import config from '../config.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	renderItem,
    renderHiddenItem,
	LoadingComponent,
    Offline,
    getFromStore} from '../shared'
import { SwipeListView } from 'react-native-swipe-list-view';
import useFetchState from '../shared/useFetch.js';
import { useGetNetStatus } from '../shared/useGetNetStatus';

function Applications({navigation}) {

    const [listData, changeData] = useState([]);
    const {data, isLoading, error, retry} = useFetchState(`${config.ttnBaseURL}?field_mask=description`,{type:"ApplicationList", storKey:global.APP_CACHE})
    const {loading:netLoading, netStatus, error: netError} = useGetNetStatus()
    const [noData, setNoData] = useState(false)

    const [validToken, changeValid] = useState(true)

    useEffect(()=>{

        async function loaded(){

            if (isLoading) return
            if(netLoading) return
            setListData(data)
        }
        loaded()
    },[isLoading, netLoading])
    
    const setListData = async(data) => {
        //Format data for display
        
        if (isLoading) return
        if (error != null && error != undefined) {changeValid(false);return}

        const {fromStore: favs, error} = await getFromStore({type:'FavList', storKey:global.APP_FAV})

        if (netStatus){
            if (data?.applications == undefined){setNoData(true); return}
            const apps = data?.applications
            console.log(apps)
            const appList = apps.map((app) => ({id:app.ids.application_id, isFav:favs.includes(app.ids.application_id), description:app.description}))

            changeData(appList)
            changeValid(true)
        }
        else{
            if (data.length == 0){setNoData(true); return}
            let listOfIds = data.applications.map((app) => ({id:app.ids.application_id, isFav:favs.includes(app.ids.application_id), description:app.description}))
            console.log(listOfIds)
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
    if (noData) return <View style={globalStyles.screen}><Text>No data to display</Text></View>
    return (
        <View style={globalStyles.screen}>
            
            {validToken?
            <>
                <Text style={[globalStyles.title,styles.title]}>Applications</Text>
                <View style={{width:200, height:45, position:'absolute', justifyContent:'flex-end', flexDirection:'row', right:0, top:5, margin:10}} >
                    <Offline isConnected={netStatus}/>
                </View>
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
                    />
                </View>
                
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