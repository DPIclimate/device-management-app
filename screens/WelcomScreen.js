import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { validateToken } from '../shared';
import { updateToken } from '../shared/ManageLocStorage';
import globalStyles from '../styles';
import { HelpCard } from './SettingsScreen';
import { LoadingComponent } from '../shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomScreen = (props) => {
    
    const [token, changeToken] = useState('')
    const [invalidToken, setInvalid] = useState(false)
    const [validating, setValidating] = useState(false)

    const handlePress = async() =>{

        setValidating(true)

        const validToken = await validateToken(token)

        if (validToken){

            global.valid_token = true
            await updateToken(token)
            await AsyncStorage.setItem('isFirstLogon', 'false')
            props.visible(false)
        }
        else{
            setInvalid(true)
            setValidating(false)
        }
    }
    return (
    <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[globalStyles.screen, {justifyContent:'flex-start', padding:5}]}>
        <Text style={[styles.title, {paddingBottom:30, paddingTop:10}]}>Welcome! </Text>
        
        <Text style={[styles.text,{paddingBottom:20, textAlign:'center'}]}>To get started please enter your TTN Bearer Token in the space below</Text>

        <TextInput value={token} placeholder='e.g NNSXS.ABCDEF.........' style={[styles.input, invalidToken?{borderColor:'red'}:null]} onChangeText={changeToken} autoCorrect={false} autoCapitalize='none'/>

        {!validating?
            <TouchableOpacity style={[globalStyles.button, styles.buttonLocation]} onPress={handlePress}>
                <Text style={globalStyles.buttonText}>Continue</Text>
            </TouchableOpacity>
            :
            <LoadingComponent loading={validating}/>
        }

        {invalidToken?
        <Text style={{paddingTop:10, color:'red'}}>Invalid TTN Bearer Token</Text>:<View></View>  }

        <View style={{paddingTop:20}}>
            <HelpCard/>
        </View>
    </View>
    </ScrollView>
    );
};
const styles = StyleSheet.create({

    title:{
        fontSize:25,
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
        borderWidth:1
    },
    buttonLocation:{
        width:'100%',
        textAlign:'center',
        marginTop:15
    }
})
export default WelcomScreen;