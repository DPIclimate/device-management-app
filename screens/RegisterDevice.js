import React, { useEffect, useLayoutEffect, useState, useReducer } from 'react';
import globalStyles from '../styles';
import {
    View, 
    StyleSheet, 
    Text, 
    ScrollView, 
    Image, 
    Alert,
    TextInput,
    Pressable,
    KeyboardAvoidingView, Switch, TouchableOpacity, Dimensions} from 'react-native';
import devDataTemplate from '../repositories/devDataTemplate.json';
import * as Location from 'expo-location';
import {checkNetworkStatus, registerDevice, LoadingComponent, checkUnique, saveDevice} from '../shared'
import { AsyncAlert } from '../shared/AsyncAlert';
import {Button} from '../shared/Button'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Overlay } from 'react-native-elements';


const RegisterDevice = ({ route, navigation }) => {

    const ALLOWED_CHARS = new RegExp('^[a-z0-9](?:[-]?[a-z0-9]){2,}$')

    const [locEnabled, setLocEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    //States of device details
    const [appID, setAppID] = useState('')
    const [devID, setDevID] = useState('')
    const [devUID, setDevUID] = useState('')
    const [devEUI, setDevEUI] = useState('')

    //State of device detail validity
    const [appIDErr, setAppIDErr] = useState(null)
    const [devIDErr, setDevIDErr] = useState(null)
    const [devUIDErr, setDevUIDErr] = useState(null)
    const [devEUIErr, setDevEUIErr] = useState(null)

    const ERROR_ENUM = Object.freeze({
        ILLEGAL_CHARS:'Illegal character(s) present',
        INVALID_LEN:'Invalid length'
    })

    const [showHelpOverlay, setHelpOverlay] = useState(false)

    useEffect(()=>{
        checkValidity()
    },[appID, devID, devUID, devEUI])

    useEffect(()=>{
        
        if (route.params?.autofill == undefined) return
            let data = route.params.autofill
            console.log('in effect', data)
            for (let item in data){
                
                switch (item){
                    case 'appID':
                        setAppID(data.appID)
                        break
                    case 'uid':
                        setDevUID(data.uid)
                        break
                    case 'ID':
                        setDevID(data.ID)
                        break
                    case 'dev_eui':
                        handleEUIChange(data.dev_eui)
                    default:
                        console.log("Unable to detect param", item)
                }
            }
            route.params = undefined
    },[route])

    const handleEUIChange = (e) =>{
        //Special function needed for EUI change to add '-' every two characters
        const eui = e.toLowerCase()

        let chars = [...eui]
        //separate every two characters with a dash
        for (let i =0; i<chars.length; i++){
            if ((i+1)%3==0 && chars[i] != '-'){
                chars.splice(i,0,"-")
            }
        }
        let modifiedEUI=chars.join('')
        setDevEUI(modifiedEUI)
    }
    const checkValidity = () =>{
        if (!ALLOWED_CHARS.test(appID) && appID.length >=3){
            setAppIDErr(ERROR_ENUM.ILLEGAL_CHARS)
        }
        else if (appID.length <3 && appID.length != 0){
            setAppIDErr(ERROR_ENUM.INVALID_LEN)
        }
        else{
            setAppIDErr(null)
        }

        if (!ALLOWED_CHARS.test(devID) && devID.length >=3){
            setDevIDErr(ERROR_ENUM.ILLEGAL_CHARS)
        }
        else if (devID.length <3 && devID.length!=0){
            setDevIDErr(ERROR_ENUM.INVALID_LEN)
        }
        else{
            setDevIDErr(null)
        }
        
        if (!ALLOWED_CHARS.test(devUID) && devUID.length >=3){
            setDevUIDErr(ERROR_ENUM.ILLEGAL_CHARS)
        }
        else if (devUID.length != 6 && devUID.length != 0){
            setDevUIDErr(ERROR_ENUM.INVALID_LEN)
        }
        else{
            setDevUIDErr(null)
        }

        //Check len of 23 because eui + dashes
        if (!ALLOWED_CHARS.test(devEUI) && devEUI.length >=3){
            setDevEUIErr(ERROR_ENUM.ILLEGAL_CHARS)
        }
        else if(devEUI.length != 23 && devEUI.length != 0){
            setDevEUIErr(ERROR_ENUM.INVALID_LEN)
        }
        else{
            setDevEUIErr(null)
        }
    }
    const inputsValid = () =>{
        if (!appIDErr && !devIDErr && !devUIDErr && !devEUIErr && appID.length != 0 && devID.length != 0){
            return true
        }
        return false
    }

    const handleSubmit = async() =>{
        setIsLoading(true)

        let devObject = {...devDataTemplate}

        try{
            if (!inputsValid()){ //Check that no errors are present and required fields are filled
                Alert.alert("Invalid Inputs", "One or more inputs were invalid")
                throw new Error("Invalid inputs")
            }

            //Add location to object if enabled
            if (locEnabled == true){
                let { status } = await Location.requestForegroundPermissionsAsync();
                
                if (status == 'granted'){
                    let loc = await Location.getCurrentPositionAsync();
                    devObject.locations = {
                        "user":{
                            "latitude": loc.coords.latitude,
                            "longitude": loc.coords.longitude,
                            "altitude": Math.round(loc.coords.altitude),
                            "accuracy":  Math.round(loc.coords.accuracy),
                            "source": "SOURCE_REGISTRY"
                        }
                    }
                }else{
                    Alert.alert("Location Error", "You have chosen to record location, however this app does not have permissions to use your location. Please enable location is your settings")
                    throw new Error("Location not enabled")
                }
            } 

            //Add device details to object
            devObject.end_device.ids.dev_eui = devEUI
            devObject.end_device.ids.device_id = devID
            devObject.end_device.ids.application_ids.application_id = appID
            devObject.end_device.attributes.uid = devUID.toUpperCase()
            devObject.type = 'registerDevice'

            const isOnline = await checkNetworkStatus()

            if (isOnline){
                //Check if device is unique or not
                const {isUnique, error: reason} = await checkUnique(devObject) // If isUnique is false a reason will be provided

                if (!isUnique){
                    Alert.alert("Registration error", reason)
                    throw new Error(reason)
                }

                const {success, error} = await registerDevice(devObject)
                console.log('in main', `${error}`)
                
                if (!success){
                    Alert.alert("An error occurred", `${error}`)
                    throw new Error(error)
                }

                Alert.alert("Success!", "Device registered successfully")
                clearFields()
            }
            else{
                //If user not online allow them to save the device for later
                const choice = await AsyncAlert("No internet connection", "Would you like to save the device for when you are back online?")

                if (!choice){
                    setLoadingState(false); 
                    return
                }

                const {success, error} = await saveDevice(devObject)
                if(!success) {
                    Alert.alert("An error occurred", `${error}`)
                    throw new Error(error)
                }
                Alert.alert("Success!", "Device saved successfully")
                clearFields()
            }
        }
        catch(error){
            console.log("Error in submission", `${error}`)
        }

        setIsLoading(false)
    }

    const clearFields = () =>{
        setAppID('')
        setDevID('')
        setDevUID('')
        setDevEUI('')
    }
    
    return (
        <ScrollView style={[globalStyles.scrollView, globalStyles.contentView]}>
            <SafeAreaView>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "position" : "height"}>

                    <View style={styles.headingView}>
                        <Text style={[globalStyles.title, styles.titlePosition]}>Register Device</Text>

                        <TouchableOpacity style={globalStyles.qrButton} onPress={() => navigation.navigate('QrScanner',{screen:'RegisterDevice'})}>
                            <Image style={globalStyles.qrCode} source={require('../assets/QR-code-icon.png')}/>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.subtitleView,{paddingTop:15}]}>
                        <Text style={styles.subHeading}>Application ID</Text>
                        <Text style={{color:'red'}}>{appIDErr}</Text>
                    </View>
                    <TextInput value={appID} placeholder='e.g example-app-id' style={[styles.inputWborder, appIDErr&& styles.inputInvalid]} onChangeText={setAppID} autoCorrect={false} autoCapitalize='none'/>
                    

                    <View style={styles.subtitleView}>
                        <Text style={styles.subHeading}>Device ID</Text>
                        <Text style={{color:'red'}}>{devIDErr}</Text>
                    </View>
                    <TextInput value={devID} placeholder='e.g my-device (Min. 3 Characters)' style={[styles.inputWborder, devIDErr&& styles.inputInvalid]} onChangeText={setDevID} autoCorrect={false} autoCapitalize='none'/>

                    <View style={styles.subtitleView}>
                        <Text style={styles.subHeading}>Device UID (Optional)</Text>
                        <Text style={{color:'red'}}>{devUIDErr}</Text>
                        <TouchableOpacity onPress={() => setHelpOverlay(true)}>
                            <Image source={require('../assets/help.png')} style={{width:20, height:20}}/>
                        </TouchableOpacity>
                    </View>

                    <TextInput value={devUID} placeholder='e.g ABC123 (Max. 6 Characters)' style={[styles.inputWborder, devUIDErr&& styles.inputInvalid]} onChangeText={setDevUID} autoCorrect={false} autoCapitalize='none'/>

                    <View style={styles.subtitleView}>
                        <Text style={styles.subHeading}>Device EUI (Optional)</Text>
                        <Text style={{color:'red'}}>{devEUIErr}</Text>
                    </View>
                    <TextInput value={devEUI} style={[styles.inputWborder, devEUIErr&& styles.inputInvalid]} onChangeText={(e) => handleEUIChange(e)} autoCorrect={false} autoCapitalize='none'/>
                    
                    <View style={{paddingTop:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <Text style={styles.subHeading}>Record Location</Text>
                        <View>
                            <Switch onValueChange={() => setLocEnabled(prev => !prev)} value={locEnabled}/>
                        </View>
                    </View>
                    
                    {!isLoading? 
                        <Button textStyle={styles.submitButtonText} buttonStyle={styles.submitButton} onSubmit={handleSubmit}>Deploy</Button>
                        :
                        <LoadingComponent loading={isLoading}/>
                    }

                    <Overlay isVisible={showHelpOverlay} onBackdropPress={()=>setHelpOverlay(false)} backdropStyle={{backgroundColor:'#00000000'}} overlayStyle={{position:'absolute', left:Dimensions.get('window').width/5, top:Dimensions.get('window').height/2.3, backgroundColor:'#00000000'}}>
                        <Pressable onPress={() => setHelpOverlay(false)}>
                            <HelpOverlay/>
                        </Pressable>
                    </Overlay >

                </KeyboardAvoidingView>
            </SafeAreaView>
        </ScrollView>
    );
}
const HelpOverlay = () =>{

    return(
        <Image source={require('../assets/helpMessage.png')} resizeMode={'contain'} style={{width:300, height:300}}/>
    )
}

const styles = StyleSheet.create({
    contentView:{
        marginLeft:10,
        marginRight:10
    },
    headingView:{
        flexDirection:'row', 
        alignItems:'center', 
        justifyContent:'space-between'
    },
    submitButton:{
        width:'100%',
        textAlign:'center',
        marginTop:25,
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#1396ed',
        borderRadius:25,
        justifyContent:'center'
    },
    submitButtonText:{
        color:'white',
        textAlign:'center',
        fontWeight:'bold',
        fontSize:15
    },
    subHeading:{
        fontSize:15,
        paddingBottom:5
    },
    subtitleView:{
        paddingTop:15,
        flexDirection:'row', 
        justifyContent:'space-between',
    },
    inputWborder:{
        borderColor:'gray',
        borderWidth:1,
        borderRadius:10,
        marginTop:2,
        height:40,
        width:'100%'
    },
    inputInvalid:{
        borderColor:'red'
    }
})
export default RegisterDevice;