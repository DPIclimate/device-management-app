import React, { useState } from 'react';
import { ActivityIndicator, Platform, View, Image, StyleSheet} from 'react-native';

export function LoadingComponent({isLoading}) {

    const Loading = () =>{

        if (isLoading){
            // return <ActivityIndicator style={{paddingTop:'10%'}} size="large" color={Platform.OS == 'android'? "#0000ff":""}/>
            return <Image style={styles.lastSeenLoading} source={require("../../../assets/loading.gif")} />
        }
        else{
            return <View/>
        }
    }

    return <Loading/>
}

const styles = StyleSheet.create({
    lastSeenLoading: {
        width: 50,
        height: 50,
        alignSelf:'center',
    }
});