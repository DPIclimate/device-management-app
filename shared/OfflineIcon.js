import React from 'react';
import { View, TouchableHighlight, Image, Alert } from 'react-native';

export const Offline = ({isConnected}) =>{

    if (isConnected)return null

    return(
        <TouchableHighlight style={{width:45, height:45, borderRadius:50}} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => Alert.alert("No Connection Detected", "The data you see below is a local copy of TTN data and is not a live data from TTN")}>
            <Image style={{width:'100%', height:'100%', borderRadius:50}} source={require('../assets/noConnection.png')}/>
        </TouchableHighlight>
    );
}