import React, {useEffect, useState} from 'react';
import { View,Text, ScrollView,StyleSheet ,TextInput, Pressable, Alert, Linking} from 'react-native';
import globalStyles from '../styles';
import {Card} from '../shared';
import helpText from '../HelpText.json'
import {updateToken} from '../shared/ManageLocStorage'
import { LoadingComponent } from '../shared';
import { validateToken } from '../shared';
import version from '../app.json'

function SettingsScreen() {
    
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
                onPress: () => writeToken(token)
            },
            {
                text:"No",
                onPress: () => console.log('no')
            }
        ])

    }
    const writeToken = async(token) =>{

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
        <View style={[globalStyles.screen,{justifyContent:'flex-start'}]}>
            <ScrollView style={globalStyles.scrollView}>
                <View style={globalStyles.contentView}> 

                    <Card>
                        <Text style={styles.title}>Authentication</Text>
                        <Text style={styles.subTitle}>Current TTN Bearer Token:</Text>
                        <Text style={[globalStyles.text,styles.text]}>{currentToken}</Text>

                        <Text  style={[globalStyles.text,styles.subTitle]}>New TTN Bearer Token</Text>
                        <TextInput value={token} placeholder='e.g NNSXS.ABCDEF.........' style={[styles.input, invalidToken?{borderColor:'red', borderWidth:1}:null]} onChangeText={changeToken} autoCorrect={false} autoCapitalize='none'/>

                        {!validating?
                            <Pressable style={[globalStyles.button, styles.buttonLocation]} onPress={handlePress} disabled={token.length == 0? true: false}>
                                <Text style={globalStyles.buttonText}>Update</Text>
                            </Pressable>
                            :
                            <LoadingComponent loading={validating}/>
                        }
                        {invalidToken? <Text style={{paddingTop:10, color:'red'}}>Invalid TTN Bearer Token</Text>:<View></View>  }
                    </Card>
                    <HelpCard/>
                </View>
                <View style={{height:50, alignItems:'center'}}>
                    <Text>v{version['expo']['version']}</Text>
                </View>
            </ScrollView>
        </View>
    );
}
const HelpCard = () =>{
    return(
        <Card>
            <Text style={styles.title}>Help</Text>
            <Text style={styles.subTitle}>What is a bearer token?</Text>
            <Text style={styles.text}>{helpText['whatBearer']}</Text>

            <Text style={styles.subTitle}>Why do I need this?</Text>
            <Text style={styles.text}>{helpText['whyBearer']}</Text>

            <Text style={styles.subTitle}>How do I get one?</Text>
            <Text style={styles.text}>{helpText['how1']}<Text style={{color:'blue'}} onPress={() => Linking.openURL(helpText['apiLink'])}>Personal API Keys </Text>{helpText['how2']}</Text>
        </Card>
    )
}
const styles = StyleSheet.create({

    title:{
        fontSize:23,
        fontWeight:'bold',
        paddingBottom:5
    },
    subTitle:{
        fontWeight:'bold',
        paddingTop:20,
        fontSize:17
    },
    text:{
        paddingTop:10
    },
    input:{
        height:40,
        marginTop:2,
        width:'100%',
        borderRadius:10,
    },
    buttonLocation:{
        width:'100%',
        textAlign:'center',
        marginTop:15
    }
})
export default SettingsScreen;
export {HelpCard}