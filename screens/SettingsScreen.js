import React, {useEffect, useState} from 'react';
import { View,Text, ScrollView,StyleSheet ,TextInput, Pressable, Alert, Linking, Image} from 'react-native';
import globalStyles from '../styles';
import {Card} from '../shared';
import {updateToken} from '../shared/ManageLocStorage'
import { LoadingComponent } from '../shared';
import { validateToken } from '../shared';
import version from '../app.json'
import {what_is_bearer, why_bearer, how_to_part1, how_to_part2, api_link, about} from '../card_text.js'
import { Button } from '../shared/Button';

function SettingsScreen(params) {
    
    console.log(params)
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
                    <TextInput value={token} placeholder='e.g NNSXS.ABCDEF.........' style={[styles.inputWOborder, invalidToken?globalStyles.inputInvalid:null]} onChangeText={changeToken} autoCorrect={false} autoCapitalize='none'/>

                    {!validating?
                        <Button onSubmit={handlePress} disabled={token.length == 0? true: false}>Update</Button>
                        :
                        <LoadingComponent loading={validating}/>
                    }
                    {invalidToken? <Text style={globalStyles.invalidText}>Invalid TTN Bearer Token</Text>:<View></View>  }
                </Card>
                {/* <AboutCard/> */}
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
const AboutCard = () =>{
    return(
        <Card>
            <Text style={globalStyles.title}>About</Text>
            <Text style={[globalStyles.text, styles.text]}>{about}</Text>
        </Card>
    )
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

const styles = StyleSheet.create({

    subTitle:{
        paddingTop:20,
    },
    text:{
        paddingTop:10
    },
    inputWOborder:{
        borderRadius:10,
        marginTop:2,
        height:40,
        width:'100%'
    }
})
export default SettingsScreen;
export {HelpCard, DPI_TAG}