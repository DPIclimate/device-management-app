import React, { useEffect, useState } from 'react';
import {
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableHighlight,
    TouchableOpacity,
    Animated
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import Card from '../shared/Card';
import LoadingComponent from '../shared/LoadingComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {registerDevice, updateDevice} from '../shared/Register'
import Swipeable from 'react-native-gesture-handler/Swipeable';

function OfflineDevices({ route, navigation }) {
    const [isLoading, setLoading] = useState(true)
    const [savedDevices, changeSavedDevices] = useState([]);
    const [savedLocations, changeSavedLocations] = useState([])
    const [reload, setReload] = useState(true)
    const [saved, changeSaved] = useState([])

    useEffect (() =>{
        getSaved()
    },[reload])

    const getSaved = async() =>{

        let locSaved = []
        try{
            let fromStore = await AsyncStorage.getItem('devices')
            fromStore = JSON.parse(fromStore)
            fromStore != null? locSaved = [...locSaved, ...fromStore] : locSaved = []
            changeSavedDevices(fromStore != null? fromStore : [])

        }catch(error){
            console.log(error)
        }

        try{
            let fromStore = await AsyncStorage.getItem('locationUpdates')
            fromStore = JSON.parse(fromStore)
            fromStore != null? locSaved = [...locSaved, ...fromStore] : locSaved = []

            changeSavedLocations(fromStore != null? fromStore : [])

        }catch(error){
            console.log(error)
        }

        changeSaved([...locSaved])

        if (locSaved.length == 0){
            navigation.goBack()
        }

        setLoading(false)

    }
    const handlePress = async(item, index) =>{

        const renderLocaition = item.type == 'locationUpdate'? true: false
        let success = false

        if (renderLocaition){
            const selected = saved[index - savedDevices.length]
            console.log("This is an item", item)
            success = await updateDevice(selected)
            console.log("This is an item2", item)

        
        }else{
            const selectedDevice = savedDevices[index]

            success = await registerDevice(selectedDevice)
        }
    
        if (success){
            handleDelete(item, index)
        }

    }
    
    const handleDelete = async (item, index) =>{
        const renderLocaition = item.type == 'locationUpdate'? true: false

        if (renderLocaition){

            console.log(index - savedDevices.length)
            let devices = savedLocations
            devices.splice(index - savedDevices.length, 1)
            changeSavedLocations(devices)

            try{
                await AsyncStorage.setItem('locationUpdates', JSON.stringify(devices))
                console.log('here')

            }catch(error){
                console.log(error)
            }
        }
        else{
            let devices = savedDevices
            devices.splice(index, 1)
            changeSavedDevices(devices)

            try{
                await AsyncStorage.setItem('devices', JSON.stringify(devices))

            }catch(error){
                console.log(error)
            }
            setReload(!reload)
        }

        setReload(!reload)

    }

    const renderItem = ({ item, index }) => {
        const rightSwipe = (progress, dragX) => {
            const scale = dragX.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            });
            return (
              <TouchableOpacity onPress={() => handleDelete(item, index)} activeOpacity={0.6}>
                <Card red={true}>
                    <View style={{height:'100%', width:50, justifyContent:'center', alignItems:'center'}}> 
                        <Image style={{height:60, width:60}} source={require('../assets/bin.png')}/>
                    </View>
                </Card>
              </TouchableOpacity>
            );
          };
        
        const Content = () =>{
            const renderLocaition = item.type == 'locationUpdate'? true: false

            if (renderLocaition == false){
                return(
                    <> 
                        <Text style={styles.cardTitle}>Register New Device</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>Device Name: {item.end_device.ids.device_id}</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>App ID: {item.end_device.ids.application_ids.application_id}</Text>
                        <Text style={[globalStyles.text, styles.cardText]}>UID: {item.end_device.attributes.uid}</Text>
                    </>
                )
            }
            else if (renderLocaition == true){
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
            <Swipeable renderRightActions={rightSwipe}>
                <Card>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1}}>
                            <Content/>
                        </View>
                        <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => handlePress(item, index)}>
                            <Image style={{width:70, height:70}} source={require('../assets/retry.png')}/>
                        </TouchableHighlight>
                    </View>
                </Card>
            </Swipeable>

            )
    }
    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,{padding:10, paddingTop:25}]}>Deploy / Update</Text>

            <LoadingComponent loading={isLoading}/>

            <FlatList
            style={[globalStyles.list]} 
            data={saved}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            />
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

    },
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