import React, { useEffect, useLayoutEffect, useState, useReducer, useContext } from "react";
import globalStyles from "../styles";
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    Image,
    Alert,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Switch,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    Platform,
} from "react-native";
import devDataTemplate from "../repositories/devDataTemplate.json";
import * as Location from "expo-location";
import { checkNetworkStatus, registerDevice, LoadingComponent, checkUnique, saveDevice, Card } from "../shared";
import { AsyncAlert } from "../shared/AsyncAlert";
import { Overlay } from "react-native-elements";
import { GlobalContext } from "../shared/context/GlobalContext";


const reducer = (state, action) =>{

    switch (action.type){

        default:
            return state
    }
}

const initialState={
    application_id:''
}

export const RegisterDeviceScreen = ({ route, navigation }) => {
    //TODO
    const [state, dispatch] = useContext(GlobalContext);
    const [device_sate, device_dispatch]=useReducer(reducer, initialState)

    const [application_id, set_application_id] = useState("");
    // const [locEnabled, setLocEnabled] = useState(false);
    // const [isLoading, setIsLoading] = useState(false);

    // //States of device details
    // const [appID, setAppID] = useState('')
    // const [devID, setDevID] = useState('')
    // const [devUID, setDevUID] = useState('')
    // const [devEUI, setDevEUI] = useState('')

    // //State of device detail validity
    // const [appIDErr, setAppIDErr] = useState(null)
    // const [devIDErr, setDevIDErr] = useState(null)
    // const [devUIDErr, setDevUIDErr] = useState(null)
    // const [devEUIErr, setDevEUIErr] = useState(null)

    // const ERROR_ENUM = Object.freeze({
    //     ILLEGAL_CHARS:'Illegal character(s) present',
    //     INVALID_LEN:'Invalid length'
    // })

    // const [showHelpOverlay, setHelpOverlay] = useState(false)

    // useEffect(()=>{
    //     checkValidity()
    // },[appID, devID, devUID, devEUI])

    // useEffect(()=>{

    //     //Handles data from qr code scan
    //     if (route.params?.autofill == undefined) return
    //         let data = route.params.autofill
    //         for (let item in data){

    //             switch (item){
    //                 case 'appID':
    //                     setAppID(data.appID)
    //                     break
    //                 case 'uid':
    //                     setDevUID(data.uid)
    //                     break
    //                 case 'ID':
    //                     setDevID(data.devID)
    //                     break
    //                 case 'dev_eui':
    //                     handleEUIChange(data.dev_eui)
    //                 default:
    //                     console.log("Unable to detect param", item)
    //             }
    //         }
    //         route.params = undefined
    // },[route])

    // const handleEUIChange = (e) =>{
    //     //Special function needed for EUI change to add '-' every two characters
    //     const eui = e.toLowerCase()

    //     let chars = [...eui]
    //     //separate every two characters with a dash
    //     for (let i =0; i<chars.length; i++){
    //         if ((i+1)%3==0 && chars[i] != '-'){
    //             chars.splice(i,0,"-")
    //         }
    //     }
    //     let modifiedEUI=chars.join('')
    //     setDevEUI(modifiedEUI)
    // }
    // const checkValidity = () =>{
    //     //Check validity of user inputs and set errors appropriately

    //     if (!global.ALLOWED_CHARS.test(appID) && appID.length >=3){
    //         setAppIDErr(ERROR_ENUM.ILLEGAL_CHARS)
    //     }
    //     else if (appID.length <3 && appID.length != 0){
    //         setAppIDErr(ERROR_ENUM.INVALID_LEN)
    //     }
    //     else{
    //         setAppIDErr(null)
    //     }

    //     if (!global.ALLOWED_CHARS.test(devID) && devID.length >=3){
    //         setDevIDErr(ERROR_ENUM.ILLEGAL_CHARS)
    //     }
    //     else if (devID.length <3 && devID.length!=0){
    //         setDevIDErr(ERROR_ENUM.INVALID_LEN)
    //     }
    //     else{
    //         setDevIDErr(null)
    //     }

    //     if (!global.ALLOWED_CHARS.test(devUID.toLowerCase()) && devUID.length >=3){
    //         setDevUIDErr(ERROR_ENUM.ILLEGAL_CHARS)
    //     }
    //     else if (devUID.length != 6 && devUID.length != 0){
    //         setDevUIDErr(ERROR_ENUM.INVALID_LEN)
    //     }
    //     else{
    //         setDevUIDErr(null)
    //     }

    //     //Check len of 23 because eui + dashes
    //     if (!global.ALLOWED_CHARS.test(devEUI) && devEUI.length >=3){
    //         setDevEUIErr(ERROR_ENUM.ILLEGAL_CHARS)
    //     }
    //     else if(devEUI.length != 23 && devEUI.length != 0){
    //         setDevEUIErr(ERROR_ENUM.INVALID_LEN)
    //     }
    //     else{
    //         setDevEUIErr(null)
    //     }
    // }
    // const inputsValid = () =>{
    //     if (!appIDErr && !devIDErr && !devUIDErr && !devEUIErr && appID.length != 0 && devID.length != 0){
    //         return true
    //     }
    //     return false
    // }

    // const handleSubmit = async() =>{
    //     setIsLoading(true)

    //     let devObject = {...devDataTemplate}

    //     try{
    //         if (!inputsValid()){ //Check that no errors are present and required fields are filled
    //             Alert.alert("Invalid Inputs", "One or more inputs were invalid")
    //             throw new Error("Invalid inputs")
    //         }

    //         //Add location to object if enabled
    //         if (locEnabled == true){
    //             let { status } = await Location.requestForegroundPermissionsAsync();

    //             if (status == 'granted'){
    //                 let loc = await Location.getCurrentPositionAsync();
    //                 devObject.locations = {
    //                     "user":{
    //                         "latitude": loc.coords.latitude,
    //                         "longitude": loc.coords.longitude,
    //                         "altitude": Math.round(loc.coords.altitude),
    //                         "accuracy":  Math.round(loc.coords.accuracy),
    //                         "source": "SOURCE_REGISTRY"
    //                     }
    //                 }
    //             }else{
    //                 Alert.alert("Location Error", "You have chosen to record location, however this app does not have permissions to use your location. Please enable location is your settings")
    //                 throw new Error("Location not enabled")
    //             }
    //         }

    //         //Add device details to object
    //         devObject.end_device.join_server_address=`${global.COMM_SERVER}.cloud.thethings.network`
    //         devObject.end_device.network_server_address=`${global.COMM_SERVER}.cloud.thethings.network`
    //         devObject.end_device.application_server_address=`${global.COMM_SERVER}.cloud.thethings.network`
    //         devObject.end_device.ids.dev_eui = devEUI.replaceAll('-','')
    //         devObject.end_device.ids.device_id = devID
    //         devObject.end_device.ids.application_ids.application_id = appID
    //         devObject.end_device.attributes.uid = devUID.toUpperCase()
    //         devObject.type = 'registerDevice' //Type flag for offline device screen

    //         const isOnline = await checkNetworkStatus()

    //         if (isOnline){
    //             //Check if device is unique or not
    //             const {isUnique, error: reason} = await checkUnique(devObject) // If isUnique is false a reason will be provided

    //             if (!isUnique){
    //                 Alert.alert("Registration error", reason)
    //                 throw new Error(reason)
    //             }

    //             const {success, error} = await registerDevice(devObject)

    //             if (!success){
    //                 Alert.alert("An error occurred", `${error}`)
    //                 throw new Error(error)
    //             }

    //             Alert.alert("Success!", "Device registered successfully")
    //             clearFields()
    //         }
    //         else{
    //             //If user not online allow them to save the device for later
    //             const choice = await AsyncAlert("No internet connection", "Would you like to save the device for when you are back online?")

    //             if (!choice){
    //                 setLoadingState(false);
    //                 return
    //             }

    //             const {success, error} = await saveDevice(devObject)
    //             if(!success) {
    //                 Alert.alert("An error occurred", `${error}`)
    //                 throw new Error(error)
    //             }
    //             Alert.alert("Success!", "Device saved successfully")
    //             clearFields()
    //         }
    //     }
    //     catch(error){
    //         console.log("Error in submission", `${error}`)
    //     }

    //     setIsLoading(false)
    // }

    // const clearFields = () =>{
    //     setAppID('')
    //     setDevID('')
    //     setDevUID('')
    //     setDevEUI('')
    // }

    const generateEUI = () => {};

    const InputComponent = ({ title, value, onChange, placeholder }): JSX.Element => {
        return (
            <View style={styles.inputComponentView}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.inputComponentTitle}>{title} </Text>
                    {title == "Device EUI:" && (
                        <TouchableOpacity onPress={() => generateEUI()}>
                            <Image style={{ width: 20, height: 20 }} source={require("../assets/autofill.png")} />
                        </TouchableOpacity>
                    )}
                </View>
                <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={placeholder} />
            </View>
        );
    };

    return (
        <ScrollView style={globalStyles.contentView}>
            <SafeAreaView>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : "height"}>
                    <Card>
                        <Text style={styles.cardTitle}>Details</Text>
                        <View style={styles.separatorLine} />

                        <InputComponent
                            title={"Application ID:"}
                            placeholder={"example-app-id"}
                            value={application_id}
                            onChange={set_application_id}
                        />
                        <InputComponent title={"Device ID:"} placeholder={"example-device-id"} value={application_id} onChange={set_application_id} />
                        <InputComponent title={"Device EUI:"} placeholder={"example-eui"} value={application_id} onChange={set_application_id} />
                    </Card>
                    <Card>
                        <Text style={styles.cardTitle}>Optional</Text>
                        <View style={styles.separatorLine} />

                        <InputComponent title={"Join EUI"} placeholder={"example-join-eui"} value={application_id} onChange={set_application_id} />
                        <InputComponent
                            title={"Device Name"}
                            placeholder={"example-device-name"}
                            value={application_id}
                            onChange={set_application_id}
                        />
                        <InputComponent
                            title={"Device UID"}
                            placeholder={"example-device-uid"}
                            value={application_id}
                            onChange={set_application_id}
                        />
                        <View style={styles.inputComponentView}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={styles.inputComponentTitle}>Notes: </Text>
                            </View>
                            <TextInput style={[styles.input, styles.textArea]} multiline={true} autoCapitalize="sentences" autoCorrect={true}/>
                        </View>
                    </Card>
                    {/* <View style={globalStyles.headingView}>
                        <Text style={globalStyles.title}>Register Device</Text>

                        <TouchableOpacity style={globalStyles.qrButton} onPress={() => navigation.navigate('QrScanner',{screen:'RegisterDevice'})}>
                            <Image style={globalStyles.qrCode} source={require('../assets/QR-code-icon.png')}/>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.subtitleView,{paddingTop:15}]}>
                        <Text style={styles.subHeading}>Application ID</Text>
                        <Text style={{color:'red'}}>{appIDErr}</Text>
                    </View>
                    <TextInput value={appID} placeholder='e.g example-app-id' style={[globalStyles.inputWborder, appIDErr&& styles.inputInvalid]} onChangeText={setAppID} autoCorrect={false} autoCapitalize='none'/>
                    

                    <View style={styles.subtitleView}>
                        <Text style={styles.subHeading}>Device ID</Text>
                        <Text style={{color:'red'}}>{devIDErr}</Text>
                    </View>
                    <TextInput value={devID} placeholder='e.g my-device (Min. 3 Characters)' style={[globalStyles.inputWborder, devIDErr&& styles.inputInvalid]} onChangeText={setDevID} autoCorrect={false} autoCapitalize='none'/>

                    <View style={styles.subtitleView}>
                        <Text style={styles.subHeading}>Device UID (Optional)</Text>
                        <Text style={{color:'red'}}>{devUIDErr}</Text>
                        <TouchableOpacity onPress={() => setHelpOverlay(true)}>
                            <Image source={require('../assets/help.png')} style={{width:20, height:20}}/>
                        </TouchableOpacity>
                    </View>

                    <TextInput value={devUID} placeholder='e.g ABC123 (Max. 6 Characters)' style={[globalStyles.inputWborder, devUIDErr&& styles.inputInvalid]} onChangeText={setDevUID} autoCorrect={false} autoCapitalize='none'/>

                    <View style={styles.subtitleView}>
                        <Text style={styles.subHeading}>Device EUI (Optional)</Text>
                        <Text style={{color:'red'}}>{devEUIErr}</Text>
                    </View>
                    <TextInput value={devEUI} style={[globalStyles.inputWborder, devEUIErr&& styles.inputInvalid]} onChangeText={(e) => handleEUIChange(e)} autoCorrect={false} autoCapitalize='none'/>
                    
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
                    </Overlay > */}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ScrollView>
    );
};
const HelpOverlay = () => {
    return <Image source={require("../assets/helpMessage.png")} resizeMode={"contain"} style={{ width: 300, height: 300 }} />;
};

const styles = StyleSheet.create({
    cardTitle: {
        fontWeight: "bold",
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    separatorLine: {
        width: "80%",
        height: 2,
        backgroundColor: "#128cde",
        alignSelf: "flex-start",
    },
    inputComponentView: {
        marginTop: 10,
    },
    inputComponentTitle: {
        fontSize: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 10,
        width: "100%",
        padding: 10,
        marginTop: 5,
    },
    textArea:{
        height:100
    }
});
