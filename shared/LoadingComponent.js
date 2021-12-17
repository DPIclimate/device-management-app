import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

function LoadingComponent(props) {

    const Loading = () =>{

        if (props.loading == true){
            return <ActivityIndicator style={{paddingTop:'10%'}} size="large"/>
        }
        else{
            return <View/>
        }
    }

    return <Loading/>
}

export default LoadingComponent;