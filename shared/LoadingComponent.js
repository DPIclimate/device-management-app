import React, { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

function LoadingComponent(props) {

    const Loading = () =>{

        if (props.loading == true){
            return <ActivityIndicator style={{paddingTop:'10%'}} size="large" color={Platform.OS == 'android'? "#0000ff":""}/>
        }
        else{
            return <View/>
        }
    }

    return <Loading/>
}

export default LoadingComponent;