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
import {registerDevice, getEUI} from '../shared/Register'
import Swipeable from 'react-native-gesture-handler/Swipeable';

function OfflineDevices({ route, navigation }) {
    const [isLoading, setLoading] = useState(true)
    const [savedDevices, changeSavedDevices] = useState([]);
    const [reload, setReload] = useState(true)

    useEffect (() =>{
        getSavedDevices()
        console.log('reload')
    },[reload])

    const getSavedDevices = async() =>{

        let currentDevices = []
        try{
            const fromStore = await AsyncStorage.getItem('devices')
            currentDevices = JSON.parse(fromStore)

        }catch(error){
            console.log(error)
        }

        changeSavedDevices(currentDevices)
        setLoading(false)

    }
    const handlePress = async(index) =>{

        const selectedDevice = savedDevices[index]

        const success = await registerDevice(selectedDevice)

        if (success){
            handleDelete(index)
        }

    }
    const handleDelete = async (index) =>{

        const selectedDevice = savedDevices[index]

        let devices = savedDevices
        devices.splice(index, 1)
        changeSavedDevices(devices)

        try{
            await AsyncStorage.setItem('devices', JSON.stringify(devices))

        }catch(error){
            console.log(error)
        }
        setReload(!reload)

        if (savedDevices.length == 0){
            navigation.goBack()
        }
        
    }

    const renderItem = ({ item, index }) => {
        const rightSwipe = (progress, dragX) => {
            const scale = dragX.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            });
            return (
              <TouchableOpacity onPress={() => handleDelete(index)} activeOpacity={0.6}>
                <Card red={true}>
                    <View style={{height:'100%', width:50, justifyContent:'center', alignItems:'center'}}> 
                        <Image style={{height:60, width:60}} source={require('../assets/bin.png')}/>
                    </View>
                </Card>
              </TouchableOpacity>
            );
          };

        return(
            <Swipeable renderRightActions={rightSwipe}>
                <Card>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1}}>
                            <Text style={styles.cardTitle}>{item.end_device.ids.device_id}</Text>
                            <Text style={[globalStyles.text, styles.cardText]}>App ID: {item.end_device.ids.application_ids.application_id}</Text>
                            <Text style={[globalStyles.text, styles.cardText]}>UID: {item.end_device.attributes.uid}</Text>
                        </View>
                        <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => handlePress(index)}>
                            <Image style={{width:70, height:70}} source={require('../assets/retry.png')}/>
                        </TouchableHighlight>
                    </View>
                </Card>
            </Swipeable>

        )
    }

    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,{padding:10, paddingTop:25}]}>Devices to deploy</Text>

            <LoadingComponent loading={isLoading}/>

            <FlatList
            style={[{flex:1},globalStyles.list]} 
            data={savedDevices}
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
        paddingTop:5
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