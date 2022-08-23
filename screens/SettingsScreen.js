import React, {useEffect, useState} from 'react';
import { View,Text, ScrollView,StyleSheet ,TextInput, Alert, Linking, Image, TouchableOpacity} from 'react-native';
import globalStyles from '../styles';
import {Card} from '../shared';
import {updateCommServer, updateServer, updateToken} from '../shared/ManageLocStorage'
import { LoadingComponent } from '../shared';
import { validateToken } from '../shared';
import version from '../app.json'
import {what_is_bearer, why_bearer, how_to_part1, how_to_part2, api_link, about} from '../card_text.js'
import { Button } from '../shared/Button';

function SettingsScreen(params) {
    
    const [token, changeToken] = useState('')
    const [currentToken, changeCurrentToken] = useState()
    const [validating, setValidating] = useState(false)
    const [invalidToken, setInvalid] = useState(false)

    useEffect(() =>{
        getCurrentToken()
    },[])


    const getCurrentToken = () =>{
        
        let privBearer = ''
        headers = global.headers
        if (headers['Authorization'] != null){
            let bearer = headers['Authorization'].split(' ')[1]
                    
            let first = ""
            let last = ""
            for( let i in bearer){
                
                if(i < 5){
                    first += bearer[i]
                }
                else if (i > 93){
                    last += bearer[i]
                }
            }
            privBearer = `${first}................................${last}`
        }else{
            privBearer = '-'
        }
        changeCurrentToken(privBearer)
        
    }

    const handlePress = () =>{

        Alert.alert("Are you sure?","Are you sure you want to change your TTN bearer token, this cannot be undone?",[
            {
                text: "Yes",
                onPress: () => handleYes(token)
            },
            {
                text:"No",
                onPress: () => console.log('no')
            }
        ])

    }
    const handleYes = async(token) =>{

        setValidating(true)

        const validToken = await validateToken(token)
        console.log('in settings', validToken)

        if (validToken){
            setInvalid(false)
            await updateToken(token)
            getCurrentToken()
            changeToken('')  
            Alert.alert("Success", "Bearer token successfully updated, please relaunch application to ensure changes take affect")  
                
        }
        else{
            console.log('token was invalid')
            setInvalid(true)
        }

        setValidating(false)
    }
    
    return (
        <ScrollView>
            <View style={globalStyles.contentView}> 
                <Card>
                    <Text style={globalStyles.title}>Authentication</Text>
                    <Text style={[globalStyles.subTitle, styles.subTitle]}>Current TTN Bearer Token:</Text>
                    <Text style={[globalStyles.text,styles.text]}>{currentToken}</Text>

                    <Text  style={[globalStyles.subTitle, styles.subTitle]}>New TTN Bearer Token</Text>
                    <TextInput value={token} placeholder='e.g NNSXS.ABCDEF.........' style={[styles.inputWborder, invalidToken?globalStyles.inputInvalid:null]} onChangeText={changeToken} autoCorrect={false} autoCapitalize='none'/>

                    {!validating?
                        <Button onSubmit={handlePress} disabled={token.length == 0? true: false}>Update</Button>
                        :
                        <LoadingComponent loading={validating}/>
                    }
                    {invalidToken? <Text style={globalStyles.invalidText}>Invalid TTN Bearer Token</Text>:<View></View>  }
                </Card>

                <TTN_SERVER/>
                <HelpCard/>
                <Card>
                    <Text style={globalStyles.title}>Found a bug?</Text>
                    <Text style={[globalStyles.text,styles.text]}>Please report it <Text style={{color:'blue'}} onPress={() => Linking.openURL('https://github.com/DPIclimate/device-management-app/issues/new')}>here</Text></Text>
                </Card>
                <DPI_TAG/>
            </View>
            <View style={{height:50, alignItems:'center'}}>
                <Text>v{version['expo']['version']}</Text>
            </View>
        </ScrollView>
    );
}
const HelpCard = () =>{
    return(
        <Card>
            <Text style={globalStyles.title}>Help</Text>
            <Text style={[globalStyles.subTitle, styles.subTitle]}>What is a bearer token?</Text>
            <Text style={[globalStyles.text, styles.text]}>{what_is_bearer}</Text>

            <Text style={[globalStyles.subTitle, styles.subTitle]}>Why do I need this?</Text>
            <Text style={[globalStyles.text, styles.text]}>{why_bearer}</Text>

            <Text style={[globalStyles.subTitle, styles.subTitle]}>How do I get one?</Text>
            <Text style={[globalStyles.text, styles.text]}>{how_to_part1}<Text style={{color:'blue'}} onPress={() => Linking.openURL(api_link)}>Personal API Keys </Text>{how_to_part2}</Text>
        </Card>
    )
}
const DPI_TAG = () =>{
    return(
        <View style={{alignItems:'center'}}>
            <Image style={{height:60}} resizeMode="contain" source={require('../assets/dpiLogo.png')}/>
            <Text style={{fontSize:10, textAlign:'center', paddingTop:10}}>This app was produced by the NSW Department of Primary Industries Climate Change Research Project, funded by the NSW Climate Change Fund.</Text>
        </View>
    )
}
const TTN_SERVER = ()=>{
    const [server, setServer] = useState(global.TTN_SERVER)
    const [commServer, setCommServer] = useState(global.COMM_SERVER)

    const servers ={
        EU_1:'eu1',
        AU_1:'au1',
        NAM_1:'nam1'
    }
    const onServerChange = (serv)=>{
        global.TTN_SERVER=serv
        global.BASE_URL=`https://${serv}.cloud.thethings.network/api/v3`
        updateServer(serv)
        setServer(serv)
    }

    const onCommServerChange=(serv)=>{
        global.COMM_SERVER=serv
        global.COMM_URL=`https://${serv}.cloud.thethings.network/api/v3/ns`
        updateCommServer(serv)
        setCommServer(serv)
    }
    return (
        <Card>
            <Text style={globalStyles.title}>TTN Server</Text>

            <Text style={styles.subTitle}>Applications/Devices</Text>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                <TouchableOpacity style={[styles.serverButton, {backgroundColor: server == servers.EU_1 ? '#c2c2c2': '#f2f2f2'}]} onPress={() => onServerChange(servers.EU_1)}>
                    <Text style={styles.buttonText}>EU</Text>
                </TouchableOpacity>
                    
                <TouchableOpacity style={[styles.serverButton, {backgroundColor: server == servers.AU_1 ? '#c2c2c2': '#f2f2f2'}]} onPress={() => onServerChange(servers.AU_1)}>
                    <Text style={styles.buttonText}>AU</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serverButton, {backgroundColor: server == servers.NAM_1 ? '#c2c2c2': '#f2f2f2'}]} onPress={() => onServerChange(servers.NAM_1)}>
                    <Text style={styles.buttonText}>NAM</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.subTitle}>Device communications</Text>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                <TouchableOpacity style={[styles.serverButton, {backgroundColor: commServer == servers.EU_1 ? '#c2c2c2': '#f2f2f2'}]} onPress={() => onCommServerChange(servers.EU_1)}>
                    <Text style={styles.buttonText}>EU</Text>
                </TouchableOpacity>
                    
                <TouchableOpacity style={[styles.serverButton, {backgroundColor: commServer== servers.AU_1 ? '#c2c2c2': '#f2f2f2'}]} onPress={() => onCommServerChange(servers.AU_1)}>
                    <Text style={styles.buttonText}>AU</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serverButton, {backgroundColor: commServer== servers.NAM_1 ? '#c2c2c2': '#f2f2f2'}]} onPress={() => onCommServerChange(servers.NAM_1)}>
                    <Text style={styles.buttonText}>NAM</Text>
                </TouchableOpacity>
            </View>
        </Card>
    )
}

const styles = StyleSheet.create({

    subTitle:{
        paddingTop:20,
        fontWeight:'bold'
    },
    text:{
        paddingTop:10
    },
    inputWborder:{
        borderRadius:10,
        borderWidth:1,
        marginTop:2,
        height:40,
        padding:5,
        width:'100%'
    },
    serverButton:{
        padding:10,
        flex:1,
        borderColor:'#dadada',
        borderWidth:1,
        alignItems:'center',
        margin:5,
        borderRadius:5
    },
    buttonText:{
        width:'100%',
        height:20,
        textAlign:'center'
    }
})
export default SettingsScreen;
export {HelpCard, DPI_TAG, TTN_SERVER}