import React, { useEffect, useLayoutEffect, useState, useReducer } from 'react';
import globalStyles from '../styles';
import {
    View, 
    StyleSheet, 
    Text, 
    SafeAreaView, 
    ScrollView, 
    Image, 
    TouchableHighlight, 
    Alert,
    TextInput,
    Pressable} from 'react-native';
import newDeviceData from '../repositories/newDeviceData';
import * as Location from 'expo-location';
import { Switch, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkNetworkStatus, registerDevice, LoadingComponent} from '../shared'

const AddDeviceScreen = ({ route, navigation }) => {

    const [appID,setAppID] = useState("")
    const [deviceUID,setUID] = useState("")
    const [deviceName,setDevName] = useState("")
    const [deviceEUI,setEUI] = useState("")

    const [isLoading, setLoadingState] = useState(false)

    const [location, setLocation] = useState();
    const [locGranted, setGranted] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    const [appIdValid, setAppIdValid] = useState(true)
    const [uidValid, setUIDValid] = useState(true)
    const [nameValid, setNameValid] = useState(true)
    const [euiValid, setEUIValid] = useState(true)

    const [isRegister, setRegister] = useState(true)

    const initialState = {
        appID:'',
        devName:'',
        devUID:'',
        devEUI:''
    }

    function reducer(state, action){
        
        switch(action.type){
            
            case 'upApp':
                return {...state, appID:action.payload}
            case 'upUID':
                return {...state, devUID:action.payload}
        }
    }
    const [state, dispatch] = useReducer(reducer, initialState)

    useLayoutEffect(()=>{
        navigation.setOptions({
            title: isRegister? 'Register':'Update',
            headerBackTitle: "Back"
        });
    })
    useEffect(() =>{
        if (route.params != undefined){
            console.log(route.params)

            let data = route.params.autofill
            if (data != null){
                console.log(route)
                for (let item in data){
                    
                    switch (item){
                        case 'appID':
                            setAppID(data['appID'])
                            break
                        case 'uid':
                            setUID(data['uid'])
                            break
                        case 'name':
                            setDevName(data['name'])
                            setRegister(false)
                            break
                        case 'eui':
                            data['eui'] != undefined ? onEUIChangeHandler(data['eui']) : undefined
                        default:
                            console.log("Undable to detect param", item)
                    }
                }
                route.params = undefined
            }
        }
    },[route])

    useEffect(() =>{
        console.log('effect', state)
        checkInputs()
    })

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
    const onEUIChangeHandler= (text)=>{
        let chars = [...text]

        //Separete every two characters with a dash
        for (let i =0; i<chars.length; i++){
            if ((i+1)%3==0 && chars[i] != '-'){
                chars.splice(i,0,"-")
            }
        }
        text= chars.join('')
        setEUI(text)
    }

    const allowedChars = new RegExp('^[a-z0-9](?:[-]?[a-z0-9]){2,}$')

    let validInputDict = {
        'appID':false,
        'devUID':false,
        'devName':false,
        'devEUI':false
    }

    const checkInputs = () =>{
        //Checks inputed values to determine validity
        if (!allowedChars.test(appID) && appID.length >=3 || appID.length <3 && appID.length != 0){
            setAppIdValid(false)
            validInputDict['appID'] = false
        }
        else if (appID.length == 0){
            validInputDict['appID'] = false
        }
        else{
            setAppIdValid(true)
            validInputDict['appID'] = true
        }

        const devName = deviceName.toLowerCase()
        if (!allowedChars.test(devName) && devName.length >=3 || devName.length <3 && devName.length!=0){
            setNameValid(false)
            validInputDict['devName'] = false
        }
        else if(devName.length == 0){
            validInputDict['devName'] = false
        }
        else{
            setNameValid(true)
            validInputDict['devName'] = true
        }

        const eui = deviceEUI.toLowerCase()
        if(!allowedChars.test(eui) && eui.length >=3 || eui.length != 23 && eui.length != 0){
            setEUIValid(false)
            validInputDict['devEUI'] = false
        } 
        else{
            setEUIValid(true)
            validInputDict['devEUI'] = true
        }

        const uid = deviceUID.toLowerCase()
        if (!allowedChars.test(uid) && uid.length >=3 || uid.length != 6 && uid.length != 0){
            setUIDValid(false)
            validInputDict['devUID'] = false
        }
        else if(uid.length == 0){
            validInputDict['devUID'] = false
        }
        else{
            setUIDValid(true)
            validInputDict['devUID'] = true
        }
    }
    const AppIDErr = () =>{
        //TODO check ttn for valid app id
        if (!allowedChars.test(appID) && appID.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if (appID.length <3 && appID.length != 0){
            return <Text style={{color:'red'}}>Invalid length</Text>
        }
        return null
    }

    const DevNameErr = () =>{

        const devName = deviceName.toLowerCase() // To ignore uppercase, dev ID will be converted to all lowercase before registration

        if (!allowedChars.test(devName) && devName.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if (devName.length <3 && devName.length!=0){
            return <Text style={{color:'red'}}>Invalid Device Name length</Text>
        }
        return null
    }

    const DevEUIErr = () =>{
        
        const eui = deviceEUI.toLowerCase()
        //Check len of 23 because eui + dashes
        if (!allowedChars.test(eui) && eui.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if(eui.length != 23 && eui.length != 0){
            return <Text style={{color:'red'}}>Invalid EUI length</Text>
        }
        return null
    }
    const DevUIDErr = () =>{

        const uid = deviceUID.toLowerCase()
        if (!allowedChars.test(uid) && uid.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if (uid.length != 6 && uid.length != 0){
            return <Text style={{color:'red'}}>Invalid UID length</Text>
        }
        return null
    }
    const handleButtonPress = async () =>{
        console.log("pressed")
        setLoadingState(true)

        for (const item in validInputDict){
            if (validInputDict[item] == false){
                Alert.alert("Invalid inputs", "Could not register device because one or more inputs were invalid.")
                setLoadingState(false)
                return null
            }
        }

        const isConnected = await checkNetworkStatus()
        if (isConnected){
            console.log('passed input validation')

            let device = await createDevice()
            const success = await registerDevice(device)
            if (success){
                clearFields()
            }
         }
        else{
            Alert.alert("No internet connection", "Would you like to save the device for when you are back online?",[
                {
                    text:'Yes',
                    onPress:async() => await saveDevice()
                },
                {
                    text:'No',
                    onPress:() => console.log('No')
                }
            ])
        }
        setLoadingState(false)
    }
    const saveDevice = async() =>{

        let currentDevices = []
        console.log('reading')
        try{
            let fromStore = await AsyncStorage.getItem(global.DEV_STORE)
            fromStore = JSON.parse(fromStore)
            fromStore != null? currentDevices = [...currentDevices, ...fromStore] : currentDevices = []

        }catch(error){
            console.log(error)
        }

        console.log('creating')
        const data = await createDevice()
        currentDevices.push(data)
        
        console.log('writing')
        try{
            await AsyncStorage.setItem(global.DEV_STORE, JSON.stringify(currentDevices))

        }catch(error){
            console.log(error)
        }

        clearFields()
        Alert.alert("Device Saved","Device details have been saved for registration when back online")
    }

    const createDevice = async() =>{

        let eui = deviceEUI 

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
        data["end_device"]["ids"]["device_id"] = deviceName
        data["end_device"]['ids']["application_ids"]["application_id"] = appID
        data['end_device']['attributes']['uid'] = deviceUID.toUpperCase()

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
        setAppID("")
        setUID("")
        setDevName("")
        setEUI("")
        setLoadingState(false)
        route.params = undefined
    }
    
    return (
        <ScrollView style={[globalStyles.scrollView,styles.contentView]}>
                {/* Enter details */}
                <View style={{paddingTop:15, flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={[globalStyles.title, styles.title]}>{isRegister? <Text>Register Device</Text>:<Text>Update Device</Text>}</Text>

                    <TouchableOpacity style={globalStyles.qrButton} onPress={() => navigation.navigate('QrScanner',{screen:'AddDeviceScreen'})}>
                        <Image style={globalStyles.qrCode} source={require('../assets/QR-code-icon.png')}/>
                    </TouchableOpacity>
                </View>
                
                <View style={[globalStyles.subtitleView,{paddingTop:15}]}>
                    <Text style={globalStyles.text2}>Application ID</Text>
                    <AppIDErr/>
                </View>
                <TextInput value={state.appID} placeholder='e.g example-app-id' style={[globalStyles.inputWborder, !appIdValid? globalStyles.inputInvalid:null]} onChangeText={(e) => dispatch({type:'upApp', payload:e})} autoCorrect={false} autoCapitalize='none'/>
                
                <View style={globalStyles.subtitleView}>
                    <Text style={globalStyles.text2}>Device UID</Text>
                    <DevUIDErr/>
                </View>
                <TextInput value={state.devUID} placeholder='e.g ABC123 (Max. 6 Characters)' style={[globalStyles.inputWborder, !uidValid? globalStyles.inputInvalid:null]} onChangeText={(e) => dispatch({type:'upUID', payload:e})} autoCorrect={false} autoCapitalize='none'/>

                <View style={globalStyles.subtitleView}>
                    <Text style={globalStyles.text2}>Device Name</Text>
                    <DevNameErr/>
                </View>
                <TextInput value={deviceName} placeholder='e.g my-device (Min. 3 Characters)' style={[globalStyles.inputWborder, !nameValid? globalStyles.inputInvalid:null]} onChangeText={setDevName} autoCorrect={false} autoCapitalize='none'/>

                <View style={globalStyles.subtitleView}>
                    <Text style={globalStyles.text2}>Device EUI (Optional)</Text>
                    <DevEUIErr/>
                </View>
                <TextInput value={deviceEUI} style={[globalStyles.inputWborder, !euiValid? globalStyles.inputInvalid:null]} onChangeText={(text) => onEUIChangeHandler(text)} autoCorrect={false} autoCapitalize='none'/>

                <View style={{paddingTop:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <Text style={globalStyles.text2}>Record Location</Text>
                    <View>
                        <Switch onValueChange={toggleSwitch} value={isEnabled}/>
                    </View>
                </View>
                
                <Pressable style={[globalStyles.blueButton, styles.buttonLocation]} onPress={handleButtonPress} disabled={isLoading}>
                    <Text style={globalStyles.blueButtonText}>{isRegister?<Text>Deploy</Text>:<Text>Update</Text>}</Text>
                </Pressable>
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
export default AddDeviceScreen;