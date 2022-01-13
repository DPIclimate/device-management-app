import React, { useEffect, useState } from 'react';
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
import { Switch } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkNetworkStatus, registerDevice, LoadingComponent} from '../shared'

const AddDeviceScreen = ({ route, navigation }) => {

    const [appID,onAppIDChange] = useState("")
    const [deviceUID,onDeviceUIDChange] = useState("")
    const [deviceName,onDeviceNameChange] = useState("")
    const [deviceEUI,onDeviceEUIChange] = useState("")

    const [isLoading, setLoadingState] = useState(false)

    const [location, setLocation] = useState();
    const [locGranted, setGranted] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    const [deployDisabled, setDisabled] = useState(false)
    
    const [appIdValid, setAppIdValid] = useState(true)
    const [uidValid, setUIDValid] = useState(true)
    const [nameValid, setNameValid] = useState(true)
    const [euiValid, setEUIValid] = useState(true)

    const [title, setTitle] = useState('Register Device')

    useEffect(() =>{
        if (route.params != undefined){
            console.log(route.params)

            let data = route.params.autofill
            if (data != null){
                console.log(route)
                for (let item in data){
                    console.log(item)
                    if (item == 'appID'){
                        onAppIDChange(data['appID'])
                    }else if (item == 'uid'){
                        onDeviceUIDChange(data['uid'])
                    }else if (item == 'name'){
                        onDeviceNameChange(data['name'])
                        setTitle('Update Device')
                        
                    }else if (item == 'eui'){
                        data['eui'] != undefined ? onEUIChangeHandler(data['eui']) : undefined
                    }
                }
                route.params = undefined
            }
        }
    })

    useEffect(() =>{
        checkInputs()
    })

    const toggleSwitch = async() => {
        setIsEnabled(previousState => !previousState)

        if (isEnabled == false){
            setLoadingState(true)
            setDisabled(true)
            await getLocation()
            setLoadingState(false)
            setDisabled(false)
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
        onDeviceEUIChange(text)
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
    const AppID = () =>{
        //TODO check ttn for valid app id
        if (!allowedChars.test(appID) && appID.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if (appID.length <3 && appID.length != 0){
            return <Text style={{color:'red'}}>Invalid length</Text>
        }
        return null
    }

    const DevName = () =>{

        const devName = deviceName.toLowerCase() // To ignore uppercase, dev ID will be converted to all lowercase before registration

        if (!allowedChars.test(devName) && devName.length >=3){
            return <Text style={{color:'red'}}>Illegal character(s) present</Text>
        }
        else if (devName.length <3 && devName.length!=0){
            return <Text style={{color:'red'}}>Invalid Device Name length</Text>
        }
        return null
    }

    const DevEUI = () =>{
        
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
    const DevUID = () =>{

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
            setLoadingState(false)
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
        onAppIDChange("")
        onDeviceUIDChange("")
        onDeviceNameChange("")
        onDeviceEUIChange("")
        setLoadingState(false)
        route.params = undefined
    }
    
    return (
        <SafeAreaView style={globalStyles.screen}>
            <ScrollView style={globalStyles.scrollView}>

                <View style={styles.contentView}>                    
                    {/* Enter details */}
                    <Text style={styles.title}>{title}</Text>

                    <View style={{width:60, height:60, position:'absolute', right:0, top:0, margin:10}} >
                        <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => navigation.navigate('QrScanner',{screen:'AddDeviceScreen'})}>
                            <Image style={{width:'100%', height:'100%', borderRadius:20}} source={require('../assets/QR-code-icon.png')}/>
                        </TouchableHighlight>
                    </View>
                    
                    <View style={[styles.subtitleView,{paddingTop:15}]}>
                        <Text style={styles.text}>Application ID</Text>
                        <AppID/>
                    </View>
                    <TextInput value={appID} placeholder='e.g example-app-id' style={[styles.input, appIdValid? styles.input: styles.inputInvalid]} onChangeText={onAppIDChange} autoCorrect={false} autoCapitalize='none'/>
                    
                    <View style={styles.subtitleView}>
                        <Text style={styles.text}>Device UID</Text>
                        <DevUID/>
                    </View>
                    <TextInput value={deviceUID} placeholder='e.g ABC123 (Max. 6 Characters)' style={[styles.input, uidValid? styles.input: styles.inputInvalid]} onChangeText={onDeviceUIDChange} autoCorrect={false} autoCapitalize='none'/>

                    <View style={styles.subtitleView}>
                        <Text style={styles.text}>Device Name</Text>
                        <DevName/>
                    </View>
                    <TextInput value={deviceName} placeholder='e.g my-device (Min. 3 Characters)' style={[styles.input, nameValid? styles.input: styles.inputInvalid]} onChangeText={onDeviceNameChange} autoCorrect={false} autoCapitalize='none'/>

                    <View style={styles.subtitleView}>
                        <Text style={styles.text}>Device EUI (Optional)</Text>
                        <DevEUI/>
                    </View>
                    <TextInput value={deviceEUI} style={[styles.input, euiValid? styles.input: styles.inputInvalid]} onChangeText={(text) => onEUIChangeHandler(text)} autoCorrect={false} autoCapitalize='none'/>

                    <View style={{paddingTop:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <Text style={{fontSize:15}}>Record Location</Text>
                        <View>
                            <Switch onValueChange={toggleSwitch} value={isEnabled}/>
                        </View>
                    </View>
                    
                    <Pressable style={[globalStyles.button, styles.buttonLocation]} onPress={handleButtonPress} disabled={deployDisabled}>
                        <Text style={globalStyles.buttonText}>Deploy</Text>
                    </Pressable>
                </View>
                <LoadingComponent loading={isLoading}/>
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    
    subtitleView:{
        padding:3,
        flexDirection:'row', 
        justifyContent:'space-between', 
        alignItems:'center',
    },
    title:{
        fontSize:20,
        paddingTop:20,
        width:'100%',
        alignItems:'flex-end',
        fontWeight:'bold',
    },
    text:{
        paddingTop:7,
        fontSize:15
    },
    input:{
        height:40,
        borderColor:'gray',
        borderWidth:1,
        marginTop:2,
    },
    inputInvalid:{
        borderColor:'red'
    },
    buttonLocation:{
        width:'100%',
        textAlign:'center',
        marginTop:25
    }
})
export default AddDeviceScreen;