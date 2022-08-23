import React, {useLayoutEffect, useState, useEffect} from 'react'
import { StyleSheet,
	 Text,
	 View,
	 Image,
	 ScrollView,
	 ImageBackground,
     TouchableOpacity,
    Dimensions,
    Pressable,
} from 'react-native'
import Card from '../shared/Card'
import globalStyles from '../styles'
import WelcomScreen from './WelcomScreen';
import { Overlay } from 'react-native-elements';
import { Col, Row } from "react-native-easy-grid";
import {useFetch} from '../shared/useFetch';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useOrientation } from '../shared/useOrientation.tsx'
import { cacheData } from '../shared/cacheData.js'
import { cacheComm } from '../shared/cacheComm.js'

//Images for Icons
const appList = require('../assets/appList.png')
const nearbyDevs = require('../assets/nearbyBlue.png')
const scanQR = require('../assets/qrCodeBlue.png')
const regDev = require('../assets/add.png')
const manageDev = require('../assets/manage.png')
const failedUpload = require('../assets/uploadFailedBlue.png')
const gateway = require('../assets/gateway.png')

export default function HomeScreen( {route, navigation}) {

    const [welcomeVisable, setWelcVisable] = useState(false);
    const orientation = useOrientation()

    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <SettingsIcon/>,
        });

    }, [navigation]);

    useEffect(()=>{
        //If params passed to this screen, app was entered via a deep link, therefore search for device
        if (route.params?.appid && route.params?.uid){
            handleSearch()
        }
        
    },[route])

    useEffect(()=>{

        async function loaded(){
            try{
                const authToken = await AsyncStorage.getItem(global.AUTH_TOKEN_STOR)
                if (!global.TTN_TOKEN) throw Error("User not logged in")

                global.headers.Authorization = authToken
                global.TTN_TOKEN = authToken
        
            }
            catch (error){
                console.log('in error', error)
                setWelcVisable(true)
            }
        }
        loaded()

    },[])

    useEffect(()=>{
        async function startCache(){

            try{

                await cacheData() //Cache ttn data on app load
                await cacheComm()
            }
            catch(error){
                console.log(`Caching error - ${error}`)
            }
        }
        startCache()

    },[welcomeVisable])

    const handleSearch = async() =>{
        //If device exists take to manage screen, else take to registration screen
        
        try{
            
            const data = await useFetch(`${global.BASE_URL}/applications/${route.params.appid}/devices?field_mask=attributes,locations,description,name`)
            
            let device;
            for (const dev of data.end_devices){
                
                if (route.params.uid != null && dev.attributes?.uid == route.params.uid){
                    device = dev
                    console.log('device found')
                }
            }
            if (!device){
                console.log('no device')
                navigation.navigate('RegisterDevice',{autofill:{appID: route.params.appid, uid:route.params.uid}})
                route.params=null
                return
            }
            navigation.navigate('ManageDevices',{autofill:{appID: route.params.appid, uid:route.params.uid}})
            route.params=null
        }
        catch(error){
            console.log(error)
            navigation.navigate('RegisterDevice', {autofill:{appID: route.params.appid, uid:route.params.uid}})
            route.params=null
            return
        }
    }

    const SettingsIcon = () =>{

        return (
            <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}> 
                <Image source={require('../assets/settingsWhite.png')} style={{width:25, height:25, marginRight:20}}/>
            </TouchableOpacity>
        )
    }
  return (
      <>
      <ImageBackground source={orientation=="PORTRAIT"? require("../assets/background.png"):require("../assets/background-horizontal.png")} resizeMode='cover' style={{width:'100%'}}>
        <ScrollView style={globalStyles.scrollView}>
                <View style={{paddingTop:20, paddingRight:10, paddingLeft:10}}>
                <Row>
                    <Col style={{alignItems:'center'}}>
                        <Icon title={"Applications"} image={appList} onPress={() => navigation.navigate("Applications")}/>
                     </Col>
                     <Col style={{alignItems:'center'}}>
                        <Icon title={"Nearby Devices"} image={nearbyDevs} onPress={() => navigation.navigate("NearbyDevices")}/>
                     </Col>
                </Row>
                <Row>
                    <Col style={{alignItems:'center'}}>
                        <Icon title={"Scan QR Code"} image={scanQR} onPress={() => navigation.navigate("QrScanner", {screen:'ManageDevices'})}/>
                    </Col>
                    <Col style={{alignItems:'center'}}>
                        <Icon title={"Register Device"} image={regDev} onPress={() => navigation.navigate("RegisterDevice")}/>
                    </Col>
                </Row>
                <Row>
                    <Col style={{alignItems:'center'}}>
                        <Icon title={"Manage Devices"} image={manageDev} onPress={() => navigation.navigate("ManageDevices")}/>
                    </Col>
                    <Col style={{alignItems:'center'}}>
                        <Icon title={"Queue"} image={failedUpload} onPress={() => navigation.navigate("OfflineDevices")}/>
                    </Col>
                </Row>
                <Row>
                    <Col style={{alignItems:'center'}}>
                        <Icon title={"Gateways"} image={gateway} onPress={() => navigation.navigate("Gateways")}/>
                    </Col>
                    <Col></Col>
                </Row>
            </View>
            </ScrollView>
        </ImageBackground>
        <Overlay isVisible={welcomeVisable} overlayStyle={{borderRadius:10, width:Dimensions.get('window').width - 50, height:Dimensions.get('window').height -100, backgroundColor:'#f3f2f3'}}>
                <WelcomScreen visible={setWelcVisable} validT/>
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