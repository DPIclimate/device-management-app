import React, { useEffect, useState } from 'react';
import { View, Text,
	StyleSheet,
	Image,
	TouchableHighlight,
	TouchableOpacity,
	Alert} from 'react-native'
import globalStyles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {registerDevice,
	updateDevice,
	Card,
	LoadingComponent,
	checkNetworkStatus,
	checkUnique,
	updateDetails,
    getFromStore,
    moveDevice
} from '../shared'
import { AsyncAlert } from '../shared/AsyncAlert';
import { SwipeListView } from 'react-native-swipe-list-view';

function OfflineDevices({ route, navigation }) {

    const [isLoading, setLoading] = useState(true)

    const [savedDevices, changeSavedDevices] = useState([]);

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

        const {fromStore: savedDev, error} = await getFromStore({storKey:global.DEV_STORE, type:'QueDeviceList'})

        changeSavedDevices(savedDev)

        if (savedDev == 0){
            navigation.goBack()
        }

        setLoading(false)

    }
    const handleRegister = async(index) =>{

        let success = false

        const selectedDevice = savedDevices[index]

        const isUnique = await checkUnique(selectedDevice) //Must check that device is a unique device
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

        return success
    }

    const handlePress = async(data, rowMap) =>{

        if (!isConnected) {Alert.alert("No Connection","Please connect to the internet to deploy/update this device");return}
        
        const {item, index} = data

        let success = false

        switch (item.type) {
            case 'registerDevice':{
                success = await handleRegister(index)
                break;
            }
            case 'locationUpdate':{
                const selected = savedDevices[index]
                success = await updateDevice(selected)
                break;
            }
            case 'descriptionUpdate':{
                const selected = savedDevices[index]
                success = await updateDevice(selected)
                break;
            }
            case 'move':{
                const selected = savedDevices[index]
                success = await moveDevice(selected, selected.moveTo)
                break;
            }
            default:
                break;
        }
        
        console.log("success status", success)
        if (success){
            handleDelete(data, rowMap)
        }
    }
    
    const handleDelete = async (data, rowMap) =>{

        const {item, index} = data

        closeItem(rowMap, index)

        let devices = savedDevices
        devices.splice(index, 1)
        changeSavedDevices(devices)

        try{
            await AsyncStorage.setItem(global.DEV_STORE, JSON.stringify(devices))

        }catch(error){
            console.log(error)
        }

        setReload(!reload)

    }
    const closeItem = (rowMap, rowKey) => {

        //Does row close animation
        if (rowMap[rowKey]) {
          rowMap[rowKey].closeRow();
        }
      };    

    const renderHiddenItem = (data, rowMap)=>{

        //Renders the bin icon when user swipes left
        return (
            <View style={{flexDirection:'row'}}>

                <View style={{flex:1}}/>

                <TouchableOpacity style={{height:'100%', width:100}} onPress={() => handleDelete(data, rowMap)} activeOpacity={0.6}>
                    <Card colour={'red'}>
                        <View style={{height:'100%', width:60, justifyContent:'center', alignItems:'center'}}> 
                            <Image style={{height:60, width:50}} source={require('../assets/bin.png')}/>
                        </View>
                    </Card>
                </TouchableOpacity>
        </View>        
    )
    }
    const renderItem = (data, rowMap) => {

        const {item, index} = data
        console.log(item)
        const Content = () =>{ //Returns the content of a card to display

            switch (item.type){
                case 'registerDevice':
                    return(
                        <> 
                            <Text style={[globalStyles.text, styles.cardText]}>Device Name: {item.end_device.ids.device_id}</Text>
                            <Text style={[globalStyles.text, styles.cardText]}>App ID: {item.end_device.ids.application_ids.application_id}</Text>
                            <Text style={[globalStyles.text, styles.cardText]}>UID: {item.end_device.attributes.uid}</Text>
                        </>
                        )
                case 'locationUpdate':
                    return(
                            <>
                                <Text style={[globalStyles.text, styles.cardText]}>Device Name: {item.end_device.ids.device_id}</Text>
                                <Text style={[globalStyles.text, styles.cardText]}>Longitude: {item.end_device.locations.user.latitude}</Text>
                                <Text style={[globalStyles.text, styles.cardText]}>Latitude: {item.end_device.locations.user.longitude}</Text>
                            </>
                    )
                case 'descriptionUpdate':
                    return (
                        <> 
                            <Text style={[globalStyles.text, styles.cardText]}>Device Name: {item.end_device.ids.device_id}</Text>
                            <Text style={[globalStyles.text, styles.cardText]}>App ID: {item.end_device.ids.application_ids.application_id}</Text>
                            <Text style={[globalStyles.text, styles.cardText]}>Note: {item.end_device.description}</Text>
                        </>
                    )
                case 'move':
                    return (
                        <> 
                            <Text style={[globalStyles.text, styles.cardText]}>Device Name: {item.name}</Text>
                            <Text style={[globalStyles.text, styles.cardText]}>Move From: {item.appID}</Text>
                            <Text style={[globalStyles.text, styles.cardText]}>Move To: {item.moveTo}</Text>
                        </>
                    )
                }
            } 
        const Title = () =>{

            if (item.type == 'registerDevice') return 'Deploy'
            if(item.type == 'locationUpdate') return 'Location Update'
            if(item.type == 'descriptionUpdate') return 'Notes Update'
            if(item.type == 'move') return 'Move Device'
        }
        return(
            <View>
                <Card>
                    <View style={{height:100}}>
                        <Text style={[styles.cardTitle, {textAlign:'center', paddingBottom:5}]}><Title/></Text>

                            <Content/>

                            <TouchableOpacity style ={{position: 'absolute', top: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => handlePress(data, rowMap)}>
                                <Image style={{width:50, height:50}} resizeMode='contain' source={require('../assets/retry.png')}/>
                            </TouchableOpacity>
                    </View>
                </Card>
            </View>

            )
    }
    return (
        <View style={globalStyles.screen}>

            <LoadingComponent loading={isLoading}/>

            <SwipeListView
            style={[globalStyles.list]} 
            data={savedDevices}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue= {-100}
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