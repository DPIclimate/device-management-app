import React, { useState,useEffect } from 'react';
import {Card} from '../shared';
import { Grid } from "react-native-easy-grid";
import { Text, View, TouchableHighlight, Image,Button, ActivityIndicator, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import globalStyles from '../styles';
import {updateDevice, checkNetworkStatus} from '../shared/index'

function NotesCard({data}) {

    const [text, setText] = useState("")
    const [isLoading, setLoadingState] = useState(false)

    useEffect(()=>{
        
        let history = data.notes
        setText(history)
    },[])

    const saveDetails = async() =>{
        setLoadingState(true)
        const body = {
            "end_device":{
                'ids':{
                    'device_id': data.name,
                    "application_ids": {
                        "application_id": data.appID
                    }
                },
                'description':text
            },
            "field_mask": {
              "paths": [
                "description"
              ]
            },
            'type':'descriptionUpdate'
        }

        const isConnected = await checkNetworkStatus()
        if (isConnected){
            await updateDevice(body)
            
        }
        else{
            Alert.alert("Unable to update","Unable to update the device because you are offline")
        }
        setLoadingState(false)

    }
    return (
        <>
        <Card>
             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Notes</Text>

                {isLoading ? 
                    <ActivityIndicator size="small"/> :
                    <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => saveDetails()}>
                        <Image style={{width:40, height:40, padding:5}} source={require('../assets/paperclip.png')}/>
                    </TouchableHighlight>
                }
                </View>
            <Grid>
                <TextInput multiline blurOnSubmit={true} value={text} placeholder='Add some text here' style={styles.input} onChangeText={setText} autoCorrect={true} autoCapitalize='sentences'/>
            </Grid>
        </Card>
        </>

    );
}
const styles = StyleSheet.create({
    input:{
        borderColor:'white',
        borderWidth:1,
        marginTop:2,
        width:'100%'
    },
})

export default NotesCard;