import React, { useEffect, useState } from 'react';
import {View,
	Text,
	TouchableOpacity,
	Pressable,
	StyleSheet,
    TextInput,
    Image
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

    const [validToken, changeValid] = useState(true)
    const [searchText, setSearchText] = useState('')
    const [showSearch, setShow] = useState(false)

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
            console.log("Online")
            if (data?.applications == undefined){return}
            const apps = data?.applications
            const appList = apps.map((app) => ({id:app.ids.application_id, isFav:favs.includes(app.ids.application_id), description:app.description}))

            changeData(appList)
            changeValid(true)
        }
        else{
            console.log("Offline")
            if (data.length == 0){return}
            let listOfIds = data.map((app) => ({id:app.application_id, isFav:favs.includes(app.application_id), description:app.description}))
            changeData(listOfIds)
        }
    }

    const DataError = () =>{
        
        if (listData == null){

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

    const filteredData = () =>{

        let list = listData
        if (searchText != ''){

            //Regex support
            if (searchText.includes('regex: ')){

                list = list.filter((app) =>{
                    try{
                        //Convert user text to regular expression
                        const pattern = searchText.replace('regex: ','')
                        const match = pattern.match(new RegExp('^/(.*?)/([gimy]*)$'));
                        const regex = new RegExp(match[1], match[2]);

                        const result = app.id.match(regex)
                        if (result) return true
                    }
                    catch(e){
                        return false
                    }
                })
            }
            else{
                list = list.filter((app) => {
                    return app.id.includes(searchText)
                }
                )}
        }
        list = list.sort((a,b)=>{
            return (a.isFav === b.isFav) ? a.id > b.id : a.isFav ? -1 : 1
        })
        return list
    }
    return (
        <View style={globalStyles.screen}>
            
            {validToken?
            <>  
                
                {showSearch&& 
                <View style={{padding:10, width:'100%'}}>
                    <TextInput clearButtonMode="always" autoFocus={true} onSubmitEditing={() => setShow(false)} value={searchText} placeholder='example-app-id' style={[globalStyles.inputWborder]} onChangeText={(e) => {setSearchText(e)}} autoCorrect={false} autoCapitalize='none'/>
                </View>

            }
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={{paddingRight:50, alignSelf:'flex-end'}}>
                        <Offline isConnected={netStatus}/>
                    </View>
                    <Text style={[globalStyles.title,styles.title]}>Applications</Text>

                    <TouchableOpacity style={{paddingLeft:50, paddingBottom:5, alignSelf:'flex-end'}} onPress={(prev) => setShow(prev => !prev)}>
                        <Image source={require('../assets/search.png')} style={{width:30, height:30, paddingRight:20}}/>
                    </TouchableOpacity>
                    
                </View>
                {searchText != '' && <Text>Search: {searchText}</Text>}
                <LoadingComponent loading={isLoading}/>
                <DataError/>

                <View style={[{flex:1}, globalStyles.list]}>

                    <SwipeListView
                    data={filteredData()}
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