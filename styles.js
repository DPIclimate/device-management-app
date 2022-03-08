import React from 'react';
import {StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width:'100%',
    },
    list: {
        padding: 10,
        width: '100%',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    inputWborder:{
        borderColor:'gray',
        borderWidth:1,
        borderRadius:10,
        marginTop:2,
        height:40,
        width:'100%'
    },
    inputWborderSmall:{
        borderColor:'gray',
        borderWidth:1,
        borderRadius:10,
        marginTop:2,
        height:20,
        width:'100%'
    },
    inputInvalid:{
        borderColor:'red'
    },
    inputWOborder:{
        marginTop:2,
        borderRadius:10,
        height:35
    },
    cardUpdated: {
        color: 'gray',
        fontSize: 12,
        textAlign: 'right'
    },
    blueButton:{
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#1396ed',
        borderRadius:25,
        justifyContent:'center'
    },
    blueButtonText:{
        color:'white',
        textAlign:'center',
        fontWeight:'bold',
        fontSize:15
    },
    redButton:{
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#1396ed',
        borderRadius:25,
        justifyContent:'center'
    },
    redText:{
        color:'red',
        textAlign:'center',
        fontWeight:'bold',
        fontSize:15
    },
    scrollView:{
        width:'100%',
        height:'100%'
    },
    text:{
        fontSize:14
    },
    text2:{
        fontSize:15,
        paddingBottom:5
    },
    invalidText:{
        color:'red',
        fontSize:14,
        paddingTop:10
    },
    title:{
        fontSize:23,
        fontWeight:'bold',
    },
    subTitle:{
        fontWeight:'bold',
        fontSize:17
    },
    contentView:{
        padding:10 
    },
    subtitleView:{
        paddingTop:15,
        flexDirection:'row', 
        justifyContent:'space-between',
    },
    qrCode:{
        width:'100%', 
        height:'100%', 
        borderRadius:15
    },
    qrButton:{
        borderRadius:20,
        width:60, 
        height:60
    }
    
  });
  
  export default globalStyles;