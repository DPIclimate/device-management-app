import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { validateToken } from '../shared';
import { updateToken } from '../shared/ManageLocStorage';
import globalStyles from '../styles';
import { HelpCard, DPI_TAG, TTN_SERVER } from './SettingsScreen';
import { LoadingComponent } from '../shared';
import { Button } from '../shared/Button';

const WelcomScreen = (props) => {

    const [token, changeToken] = useState('')
    const [invalidToken, setInvalid] = useState(false)
    const [validating, setValidating] = useState(false)

    const handlePress = async() =>{
        console.log('pressed')
        setValidating(true)

        const validToken = await validateToken(token)

        if (validToken){
            console.log('token is valid')
            global.valid_token = true
            await updateToken(token)

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
                <Button buttonStyle={styles.submitButton} textStyle={styles.submitButtonText} onSubmit={() =>handlePress()}>Continue</Button>
                :
                <LoadingComponent loading={validating}/>
            }

            {invalidToken?
            <Text style={globalStyles.invalidText}>Invalid TTN Bearer Token</Text>:<View/> }

            <View style={{width:'100%', paddingTop:10}}>
                <TTN_SERVER/>
            </View>
            <View style={{paddingTop:10}}>
                <HelpCard/>
            </View>
            <DPI_TAG/>
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
    },
    submitButton:{
        width:'100%',
        textAlign:'center',
        marginTop:25,
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#1396ed',
        borderRadius:25,
        justifyContent:'center'
    },
    submitButtonText:{
        color:'white',
        textAlign:'center',
        fontWeight:'bold',
        fontSize:15
    }
})
export default WelcomScreen;