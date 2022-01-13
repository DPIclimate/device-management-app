import React, {useEffect, useState} from 'react';
import { View,Text, ScrollView,StyleSheet ,TextInput, Pressable, Alert} from 'react-native';
import globalStyles from '../styles';
import {Card} from '../shared';
import config from '../config.json'
import helpText from '../HelpText.json'
import AsyncStorage from '@react-native-async-storage/async-storage';

function SettingsScreen({navigation}) {

    const [token, changeToken] = useState('')
    const [currentToken, changeCurrentToken] = useState()

    useEffect(() =>{
        getCurrentToken()
    })

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
        console.log('updating token', privBearer)
        changeCurrentToken(privBearer)
    }

    const handlePress = () =>{

        Alert.alert("Are you sure?","Are you sure you want to change your TTN bearer token, this cannot be undone?",[
            {
                text: "Yes",
                onPress: () => updateToken()
            },
            {
                text:"No",
                onPress: () => console.log('no')
            }
        ])
    }
    const updateToken = async() =>{
        
        let bToken = `Bearer ${token}`
        try{
            await AsyncStorage.setItem(global.AUTH_TOKEN, bToken)
            global.headers = {"Authorization":bToken}
            Alert.alert("Success", "Bearer token successfully updated, please relaunch application to ensure changes take affect")

        }
        catch(error){
            console.log(error)
        }

        getCurrentToken()
        changeToken('')
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
                        <TextInput value={token} placeholder='e.g NNSXS.ABCDEF.........' style={styles.input} onChangeText={changeToken} autoCorrect={false} autoCapitalize='none'/>

                        <Pressable style={[globalStyles.button, styles.buttonLocation]} onPress={handlePress} disabled={token.length == 0? true: false}>
                            <Text style={globalStyles.buttonText}>Update</Text>
                        </Pressable>
                    </Card>

                    <Card>
                        <Text style={styles.title}>Help</Text>
                        <Text style={styles.subTitle}>What is a bearer token?</Text>
                        <Text style={styles.text}>{helpText['whatBearer']}</Text>

                        <Text style={styles.subTitle}>Why do I need this?</Text>
                        <Text style={styles.text}>{helpText['whyBearer']}</Text>

                        <Text style={styles.subTitle}>How do I get one?</Text>
                        <Text style={styles.text}>{helpText['how']}</Text>
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
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
        marginTop:2
    },
    buttonLocation:{
        width:'100%',
        textAlign:'center',
        marginTop:15
    }
})
export default SettingsScreen;