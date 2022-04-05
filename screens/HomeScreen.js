import React, {useLayoutEffect, useState, useEffect} from 'react'
import '../global.js'
import { StyleSheet,
	 Text,
	 View,
	 Image,
	 ScrollView,
	 ImageBackground,
     TouchableOpacity,
    Dimensions,
    Pressable} from 'react-native'
import Card from '../shared/Card'
import globalStyles from '../styles'
import WelcomScreen from './WelcomScreen';
import useFetchState from '../shared/useFetch.js';
import config from '../config.json'
import { Overlay } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Images for Icons
const appList = require('../assets/appList.png')
const nearbyDevs = require('../assets/nearbyBlue.png')
const scanQR = require('../assets/qrCodeBlue.png')
const regDev = require('../assets/add.png')
const manageDev = require('../assets/manage.png')
const failedUpload = require('../assets/uploadFailedBlue.png')

export default function HomeScreen({navigation}) {

    const [welcomeVisable, setWelcVisable] = useState(false);

    //TODO - Check if first logon instead of checking for valid token
    const {data, isLoading, error, retry} = useFetchState(`${config.ttnBaseURL}?field_mask=description`,{type:"ApplicationList", storKey:global.APP_CACHE})

    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <SettingsIcon/>,
        });
    }, [navigation]);

    const handleTmp = async() =>{
        //Temporty button to clear app storage
        AsyncStorage.clear()
    }
    useEffect(()=>{

        async function loaded(){

            if (isLoading) return

            if (error == 'User not logged in'){
                console.log('use not logged in')
                setWelcVisable(true)
            }
        }
        loaded()
    },[isLoading])

    const SettingsIcon = () =>{

        return (
            // <TouchableOpacity onPress={() => handleTmp()}>
            <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
                <Image source={require('../assets/settingsWhite.png')} style={{width:25, height:25, marginRight:20}}/>
            </TouchableOpacity>
        )
    }
  return (
      <>
      <ImageBackground source={require("../assets/background.png")} resizeMode="cover" style={{width:'100%'}}>
        <ScrollView style={globalStyles.scrollView}>
            <View style={{alignItems:'center'}}>

            <View style={{flexDirection:'row', paddingTop:20}}>
                    <View style={{paddingRight:10}}>
                        <Icon title={"Browse"} image={appList} onPress={() => navigation.navigate("Applications")}/>
                        </View>
                    <Icon title={"Nearby Devices"} image={nearbyDevs} onPress={() => navigation.navigate("NearbyDevices")}/>
            </View>
            <View style={{flexDirection:'row'}}>
                    <View style={{paddingRight:10}}><Icon title={"Scan QR Code"} image={scanQR} onPress={() => navigation.navigate("QrScanner", {screen:'ManageDevices'})}/></View>
                    <Icon title={"Register Device"} image={regDev} onPress={() => navigation.navigate("RegisterDevice")}/>
            </View>
            <View style={{flexDirection:'row'}}>
                    <View style={{paddingRight:10}}><Icon title={"Manage Devices"} image={manageDev} onPress={() => navigation.navigate("ManageDevices")}/></View>
                    <Icon title={"Qued"} image={failedUpload} onPress={() => navigation.navigate("OfflineDevices")}/>
            </View>
            </View>
            </ScrollView>
        </ImageBackground>
        <Overlay isVisible={welcomeVisable} overlayStyle={{borderRadius:10, width:Dimensions.get('window').width - 50, height:Dimensions.get('window').height -100, backgroundColor:'#f3f2f3'}}>
                <WelcomScreen retry={retry} visible={setWelcVisable} validT/>
        </Overlay >
        </>
        
  )
}

const Icon = (props) =>{
    return(
        <View style={{width:170}}>
            <Pressable onPress={props.onPress}>
                <Card borderRadius={20}>
                    <View style={{justifyContent:'center', alignItems:'center', height:130}}>
                        <Image source={props.image} style={{width:60, height:60}}/>
                        <Text style={{paddingTop:10, fontSize:15, fontWeight:'bold'}}>{props.title}</Text>
                    </View>
                </Card>
            </Pressable>
        </View>
    )
}
const styles = StyleSheet.create({})