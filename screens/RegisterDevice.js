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
    KeyboardAvoidingView, Switch, TouchableOpacity} from 'react-native';
import newDeviceData from '../repositories/newDeviceData';
import * as Location from 'expo-location';
import {checkNetworkStatus, registerDevice, LoadingComponent, updateDevice, checkUnique, updateDetails, saveDevice} from '../shared'
import { AsyncAlert } from '../shared/AsyncAlert';


const initialState = {
    appID:'',
    devID:'',
    devUID:'',
    devEUI:'',
    valApp:true,
    valID:true,
    valUID:true,
    valEUI:true
}

const ACTIONS = {
    UPDATE_APP_ID: 'upApp',
    UPDATE_UID:'upUID',
    UPDATE_ID:'upID',
    UPDATE_EUI:'upEUI',
    CLEAR_ALL:'clearAll'
}
const allowedChars = new RegExp('^[a-z0-9](?:[-]?[a-z0-9]){2,}$')

function reducer(state, action){
    
    switch(action.type){
        
        case ACTIONS.UPDATE_APP_ID:
            let isVal = state.valApp
            if (!allowedChars.test(action.payload) && action.payload.length >=3 || action.payload.length <3 && action.payload.length != 0){
                isVal = false
            }
            else{
                isVal=true
            }
            return {...state, appID:action.payload, valApp:isVal}

        case ACTIONS.UPDATE_UID:
            isVal = state.valUID
            if (action.payload == undefined) {return state}
            const uid = action.payload.toLowerCase()
            if (!allowedChars.test(uid) && uid.length >=3 || uid.length != 6 && uid.length != 0){
                isVal= false
            }
            else{
                isVal = true
            }
            return {...state, devUID:action.payload, valUID:isVal}

        case ACTIONS.UPDATE_ID:
            isVal = state.valID
            const ID = action.payload.toLowerCase()

            if (!allowedChars.test(ID) && ID.length >=3 || ID.length <3 && ID.length!=0){
                isVal=false
            }
            else{
                isVal = true
            }
            return {...state, devID:action.payload, valID:isVal}

        case ACTIONS.UPDATE_EUI:
            isVal = state.valEUI

            const eui = action?.payload?.toLowerCase()
            console.log(eui)
            if (eui == undefined){return state}

            if (!eui.includes('-') && eui.length==16){
                isVal = true
            }
            else if(!allowedChars.test(eui) && eui.length >=3 || eui.length != 23 && eui.length != 0){
                isVal = false
            } 
            else{
                isVal = true
            }

            let chars = [...eui]
            //Separete every two characters with a dash
            for (let i =0; i<chars.length; i++){
                if ((i+1)%3==0 && chars[i] != '-'){
                    chars.splice(i,0,"-")
                }
            }
            let modifiedEUI= chars.join('')
            return {...state, devEUI:modifiedEUI, valEUI:isVal}

        case ACTIONS.CLEAR_ALL:
            return initialState

        default:
            console.log("in default")
            return state
    }
}

const RegisterDevice = ({ route, navigation }) => {

    const [isLoading, setLoadingState] = useState(false)

    const [location, setLocation] = useState();
    const [locGranted, setGranted] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    const [isRegister, setRegister] = useState(true)

    const [state, dispatch] = useReducer(reducer, initialState)

    useLayoutEffect(()=>{
        navigation.setOptions({
            title: isRegister? 'Register':'Update',
            headerBackTitle: "Back"
        });
    })
    useEffect(() =>{
        function onChange() {
            if (route.params == undefined) return
            if (route.params.autofill == null) return

            let data = route.params.autofill

            for (let item in data){
                
                switch (item){
                    case 'appID':
                        dispatch({type:ACTIONS.UPDATE_APP_ID, payload:data['appID']})
                        break
                    case 'uid':
                        dispatch({type:ACTIONS.UPDATE_UID, payload:data['uid']})
                        break
                    case 'ID':
                        dispatch({type:ACTIONS.UPDATE_ID, payload:data['ID']})
                        setRegister(false)
                        break
                    case 'eui':
                        dispatch({type:ACTIONS.UPDATE_EUI, payload:data['eui']})
                    default:
                        console.log("Undable to detect param", item)
                }
            }
            route.params = undefined
        }
        onChange()
    },[route])

    const toggleSwitch = async() => {
        setIsEnabled(previousState => !previousState)

        if (isEnabled == false){
            setLoadingState(true)
            await getLocation()
            setLoadingState(false)
        }
    }
    
    const getLocation = async() =>{
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status == 'granted'){
            setGranted(true)
            console.log("Getting location")
            let loc = await Location.getCurrentPositionAsync({});
            console.log("location received", loc)
            setLocation(loc);
            
        }else{
            setGranted(false)
        }
    }

    const AppIDErr = () =>{

        if (!allowedChars.test(state.appID) && state.appID.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if (state.appID.length <3 && state.appID.length != 0){
            return <Text style={{color:'red'}}>Invalid length</Text>
        }
        return null
    }
    const DevUIDErr = () =>{

        const uid = state.devUID.toLowerCase()
        if (!allowedChars.test(uid) && uid.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if (uid.length != 6 && uid.length != 0){
            return <Text style={{color:'red'}}>Invalid UID length</Text>
        }
        return null
    }

    const DevIDErr = () =>{

        const devID = state.devID.toLowerCase() // To ignore uppercase, dev ID will be converted to all lowercase before registration

        if (!allowedChars.test(devID) && devID.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if (devID.length <3 && devID.length!=0){
            return <Text style={{color:'red'}}>Invalid Device ID length</Text>
        }
        return null
    }

    const DevEUIErr = () =>{
        
        const eui = state.devEUI.toLowerCase()
        //Check len of 23 because eui + dashes
        if (!allowedChars.test(eui) && eui.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if(eui.length != 23 && eui.length != 0){
            return <Text style={{color:'red'}}>Invalid EUI length</Text>
        }
        return null
    }
    const handleButtonPress = async () =>{
        
        console.log("pressed")
        setLoadingState(true)

        if (state.valApp == false || state.valUID == false || state.valID == false || state.valEUI == false || state.appID.length == 0 || state.devUID.length == 0 || state.devID.length == 0){
            Alert.alert("Invalid inputs", "Could not register device because one or more inputs were invalid.")
            setLoadingState(false)
            return null
        }

        const isConnected = await checkNetworkStatus()
        const device = await createDevice()
        let success = false

        if (isConnected){

            const isUnique = await checkUnique(device)
            if (isUnique == null) {setLoadingState(false); return}

            if (isUnique){
                success = await registerDevice(device)
                if (success) Alert.alert("Success!", "Device successfully registered")
            }
            else{
                let update = await AsyncAlert("Device already exists",`Device with this ID already exists in this application, would you like to add these updated details to the device?`)

                if (update == 'NO'){setLoadingState(false); return}

                const updatedDevice = updateDetails(device)
                success = await updateDevice(updatedDevice)
            }
         }
        else{
            const resolution = await AsyncAlert("No internet connection", "Would you like to save the device for when you are back online?")

            if (resolution == "NO"){setLoadingState(false); return}
            success = await saveDevice(device)
            if(success) Alert.alert("Success!", "Device saved successfully")
        }

        if (success){
            clearFields()
        }

        setLoadingState(false)
    }

    const createDevice = async() =>{

        let eui = state.devEUI 

        if (eui.length != 0){
            eui = eui.replace(/-/g,'')
        }

        let loc = null
        if (location == undefined && locGranted==true){
            loc = await getLocation()
        }
        else if(locGranted == true){ 
            loc = location
        }

        let data = newDeviceData()

        data["end_device"]["ids"]["dev_eui"] = eui
        data["end_device"]["ids"]["device_id"] = state.devID
        data["end_device"]['ids']["application_ids"]["application_id"] = state.appID
        data['end_device']['attributes']['uid'] = state.devUID.toUpperCase()

        if (isEnabled == true){
            data['end_device']['locations'] = {
                "user":{
                "latitude": loc['coords']['latitude'],
                "longitude": loc['coords']['longitude'],
                "altitude": Math.round(loc['coords']['altitude']),
                "accuracy":  Math.round(loc['coords']['accuracy']),
                "source": "SOURCE_REGISTRY"
                }
            }
        }
        data['type'] = 'registerDevice'
        return data
    }
    const clearFields = () =>{
        dispatch({type:ACTIONS.CLEAR_ALL})
        setLoadingState(false)
        route.params = undefined
    }
    
    return (
            <ScrollView style={[globalStyles.scrollView,styles.contentView]}>
                    {/* Enter details */}
                <KeyboardAvoidingView style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "position" : "height"}>
                    <View style={{paddingTop:15, flexDirection:'row', justifyContent:'space-between'}}>
                        <Text style={[globalStyles.title, styles.title]}>{isRegister? <Text>Register Device</Text>:<Text>Update Device</Text>}</Text>

                        <TouchableOpacity style={globalStyles.qrButton} onPress={() => navigation.navigate('QrScanner',{screen:'RegisterDevice'})}>
                            <Image style={globalStyles.qrCode} source={require('../assets/QR-code-icon.png')}/>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[globalStyles.subtitleView,{paddingTop:15}]}>
                        <Text style={globalStyles.text2}>Application ID</Text>
                        <AppIDErr/>
                    </View>
                    <TextInput value={state.appID} placeholder='e.g example-app-id' style={[globalStyles.inputWborder, !state.valApp? globalStyles.inputInvalid:null]} onChangeText={(e) => dispatch({type:ACTIONS.UPDATE_APP_ID, payload:e})} autoCorrect={false} autoCapitalize='none'/>
                    
                    <View style={globalStyles.subtitleView}>
                        <Text style={globalStyles.text2}>Device UID</Text>
                        <DevUIDErr/>
                    </View>
                    <TextInput value={state.devUID} placeholder='e.g ABC123 (Max. 6 Characters)' style={[globalStyles.inputWborder, !state.valUID? globalStyles.inputInvalid:null]} onChangeText={(e) => dispatch({type:ACTIONS.UPDATE_UID, payload:e})} autoCorrect={false} autoCapitalize='none'/>

                    <View style={globalStyles.subtitleView}>
                        <Text style={globalStyles.text2}>Device ID</Text>
                        <DevIDErr/>
                    </View>
                    <TextInput value={state.devID} placeholder='e.g my-device (Min. 3 Characters)' style={[globalStyles.inputWborder, !state.valID? globalStyles.inputInvalid:null]} onChangeText={(e) => dispatch({type:ACTIONS.UPDATE_ID, payload:e})} autoCorrect={false} autoCapitalize='none'/>

                    <View style={globalStyles.subtitleView}>
                        <Text style={globalStyles.text2}>Device EUI (Optional)</Text>
                        <DevEUIErr/>
                    </View>
                    <TextInput value={state.devEUI} style={[globalStyles.inputWborder, !state.valEUI? globalStyles.inputInvalid:null]} onChangeText={(e) => dispatch({type:ACTIONS.UPDATE_EUI, payload:e})} autoCorrect={false} autoCapitalize='none'/>
                    <View style={{paddingTop:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <Text style={globalStyles.text2}>Record Location</Text>
                        <View>
                            <Switch onValueChange={toggleSwitch} value={isEnabled}/>
                        </View>
                    </View>
                    
                    <Pressable style={[globalStyles.blueButton, styles.buttonLocation]} onPress={handleButtonPress} disabled={isLoading}>
                        <Text style={globalStyles.blueButtonText}>{isRegister?<Text>Deploy</Text>:<Text>Update</Text>}</Text>
                    </Pressable>
                </KeyboardAvoidingView>
                <LoadingComponent loading={isLoading}/>
            </ScrollView>
    );
}
const styles = StyleSheet.create({
    contentView:{
        padding:10 
    },
    subtitleView:{
        paddingTop:15,
        flexDirection:'row', 
        justifyContent:'space-between',
    },
    title:{
        paddingTop:20,
        alignItems:'flex-end',
    },
    buttonLocation:{
        width:'100%',
        textAlign:'center',
        marginTop:25
    }
})
export default RegisterDevice;