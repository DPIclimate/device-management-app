import React from "react"
import { View, Text, Image } from "react-native"

export const DPI_TAG = ():JSX.Element =>{
    return(
        <View style={{alignItems:'center'}}>
            <Image style={{height:60}} resizeMode="contain" source={require('../../../assets/dpiLogo.png')}/>
            <Text style={{fontSize:10, textAlign:'center', paddingTop:10}}>This app was produced by the NSW Department of Primary Industries Climate Change Research Project, funded by the NSW Climate Change Fund.</Text>
        </View>
    )
}