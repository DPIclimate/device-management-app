import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight, TouchableOpacity, Alert} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {registerDevice, updateDevice, Card, LoadingComponent, checkNetworkStatus, getSavedDevices, getSavedLocations, checkUnique, updateDetails} from '../shared'
import { AsyncAlert } from '../shared/AsyncAlert';
import { SwipeListView } from 'react-native-swipe-list-view';

function OfflineDevices({ route, navigation }) {

    const [isLoading, setLoading] = useState(true)

    const [savedDevices, changeSavedDevices] = useState([]);
    const [savedLocations, changeSavedLocations] = useState([])

    const [reload, setReload] = useState(true)
    const [isConnected, changeConnectionStatus] = useState(false)

    useEffect (() =>{
        getSaved()
        async function net(){
            let connected = await checkNetworkStatus()
            changeConnectionStatus(connected)
        }
        net()
    },[reload])

    const getSaved = async() =>{

        let savedDev = await getSavedDevices()
        let savedLoc = await getSavedLocations()

        changeSavedDevices(savedDev)
        changeSavedLocations(savedLoc)

        const allSaved = [...savedDev, ...savedLoc]

        if (allSaved == 0){
            navigation.goBack()
        }

        setLoading(false)

    }
    const handlePress = async(data, rowMap) =>{

        const {item, index} = data

        if (isConnected){
            const isRegister = item.type == 'registerDevice'? true: false
            let success = false

            if (isRegister){
                const selectedDevice = savedDevices[index]

                const isUnique = await checkUnique(selectedDevice)
                if (isUnique == null) return

                if (isUnique){
                    success = await registerDevice(selectedDevice)
                }
                else{
                    let update = await AsyncAlert("Device already exists",`Device with this name already exists in this application, would you like to add these updated details to the device?`)

                    if (update == 'NO')return

                    const updatedDevice = updateDetails(selectedDevice)
                    success = await updateDevice(updatedDevice)
                }

            }else{

                const selected = savedLocations[index - savedDevices.length]
                success = await updateDevice(selected)

            }
        
            if (success){
                handleDelete(data, rowMap)
            }
        }
        else{
            Alert.alert("No Connection","Please connect to the internet to deploy/update this device")
        }
    }
    
    const handleDelete = async ({item, index}, rowMap) =>{

        closeItem(rowMap, index)
        const isRegister = item.type == 'registerDevice'? true: false

        if (isRegister){
            let devices = savedDevices
            devices.splice(index, 1)
            changeSavedDevices(devices)

            try{
                await AsyncStorage.setItem(global.DEV_STORE, JSON.stringify(devices))

            }catch(error){
                console.log(error)
            }
        }
        else{

            setReload(!reload)

            let devices = savedLocations
            devices.splice(index - savedDevices.length, 1)
            changeSavedLocations(devices)

            try{
                await AsyncStorage.setItem(global.LOC_UPDATES, JSON.stringify(devices))
                console.log('here')

            }catch(error){
                console.log(error)
            }
        }

        setReload(!reload)

    }
    const closeItem = (rowMap, rowKey) => {

        if (rowMap[rowKey]) {
          rowMap[rowKey].closeRow();
        }
      };    

    const renderHiddenItem = (data, rowMap)=>{

        return (
            <View style={{flexDirection:'row'}}>

                <View style={{flex:1}}/>

                <TouchableOpacity style={{height:'100%', width:100}} onPress={() => handleDelete(data, rowMap)} activeOpacity={0.6}>
                    <Card red={true}>
                        <View style={{height:'100%', width:60, justifyContent:'center', alignItems:'center'}}> 
                            <Image style={{height:60, width:50}} source={require('../assets/bin.png')}/>
                        </View>
                    </Card>
                </TouchableOpacity>
        </View>        
    )
    }
    const renderItem = (data, rowMap) => {

        const {index, item} = data
        
        const Content = () =>{
            const locUpdate = item.type == 'locationUpdate'? true: false

            if (locUpdate == false){
                return(
                    <> 
                        <Text style={styles.cardTitle}>Register New Device</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>Device Name: {item.end_device.ids.device_id}</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>App ID: {item.end_device.ids.application_ids.application_id}</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>UID: {item.end_device.attributes.uid}</Text>
                    </>
                )
            }
            else if (locUpdate == true){
                return(
                    <>
                        <Text style={styles.cardTitle}>Update Location</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>Device Name: {item.end_device.ids.device_id}</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>Longitude: {item.end_device.locations.user.latitude}</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>Latitude: {item.end_device.locations.user.longitude}</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>Altitude: {item.end_device.locations.user.altitude}</Text>
    
                    </>
                )
            }
        }
    
        return(
            <View>
                <Card>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1}}>
                            <Content/>
                        </View>
                        <View style={{flex:0.25, alignItems:'center', justifyContent:'center'}}>
                            <TouchableOpacity acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => handlePress(data, rowMap)}>
                                <Image style={{width:80, height:80}} source={require('../assets/retry.png')}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card>
            </View>

            )
    }
    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,{padding:10, paddingTop:25}]}>Deploy / Update</Text>

            <LoadingComponent loading={isLoading}/>

            <SwipeListView
            style={[globalStyles.list]} 
            data={[...savedDevices, ...savedLocations]}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-100}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    cardText:{
        paddingTop:4,
        fontSize:14
    },
    cardTitle:{
        fontSize: 18,
        fontWeight:'bold'
    },
    button:{
        width:140,
        height:40
    },
    deleteBox: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 80,
      },
});

export default OfflineDevices;