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
    <ScrollView showsVerticalScrollIndicator={false} >
        <View style={[globalStyles.screen, {padding:5}]}>
            <Text style={[globalStyles.title, styles.title]}>Welcome! </Text>
            
            <Text style={[globalStyles.text,styles.text]}>To get started please enter your TTN Bearer Token in the space below</Text>

            <TextInput value={token} placeholder='e.g NNSXS.ABCDEF.........' style={[globalStyles.inputWborder, invalidToken?globalStyles.inputInvalid:null]} onChangeText={changeToken} autoCorrect={false} autoCapitalize='none'/>

            {!validating?
                <TouchableOpacity style={[globalStyles.blueButton, styles.buttonLocation]} onPress={handlePress}>
                    <Text style={globalStyles.blueButtonText}>Continue</Text>
                </TouchableOpacity>
                :
                <LoadingComponent loading={validating}/>
            }

            {invalidToken?
            <Text style={globalStyles.invalidText}>Invalid TTN Bearer Token</Text>:<View/> }

            <View style={{paddingTop:10}}>
                <HelpCard/>
            </View>
        </View>
    </ScrollView>
    );
};
const styles = StyleSheet.create({

    title:{
        paddingBottom:30, 
        paddingTop:10
    },
    text:{
        paddingBottom:20, 
        textAlign:'center'
    },
    buttonLocation:{
        width:'100%',
        marginTop:15
    }
})
export default WelcomScreen;