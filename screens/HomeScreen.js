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
    Pressable,
    Platform,
    Alert} from 'react-native'
import Card from '../shared/Card'
import globalStyles from '../styles'
import WelcomScreen from './WelcomScreen';
import useFetchState from '../shared/useFetch.js';
import { Overlay } from 'react-native-elements';
import { Col, Row } from "react-native-easy-grid";
import {useFetch} from '../shared/useFetch';


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
    const {data, isLoading, error, retry} = useFetchState(`${global.BASE_URL}/applications?field_mask=description`,{type:"ApplicationList", storKey:global.APP_CACHE})

    const [orientation, setOrientation] = useState('LANDSCAPE');

    
    useLayoutEffect(() => {
        //Settings icon
        navigation.setOptions({
            headerRight: () => <SettingsIcon/>,
        });

    }, [navigation]);

    useEffect(() => {

        determineAndSetOrientation();
        const listener = Dimensions.addEventListener('change', determineAndSetOrientation);
    
        return () => {
            listener.remove()
        }
      }, []);

    useEffect(()=>{
        //If params passed to this screen, app was entered via a deep link, therefore search for device

        if (route.params?.appid && route.params?.uid){
            handleSearch()
        }
    },[])

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

    const handleSearch = async() =>{
        //If device exists take to manage screen, else take to registration screen
        
        const data = await useFetch(`${global.BASE_URL}/applications/${route.params.appid}/devices?field_mask=attributes,locations,description,name`,{type:"DeviceList", storKey:global.APP_CACHE, appID:route.params.appid}, true)
        
        if ('code' in data){
            console.log('error')
           navigation.navigate('RegisterDevice', {autofill:{appID: route.params.appid, uid:route.params.uid}})
           route.params=null
           return
        }

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

    const determineAndSetOrientation = () =>{
        let width = Dimensions.get('window').width;
        let height = Dimensions.get('window').height;
    
        if (width < height) {
            setOrientation('PORTRAIT');
          } else {
            setOrientation('LANDSCAPE');
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