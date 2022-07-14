import React from 'react';
import {StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width:'100%',
        marginTop:15,
        padding:10
    },
    list: {
        padding: 10,
        width: '100%'
    },
    contentView:{
        paddingTop:20,
        padding:10
    },
    headingView:{
        flexDirection:'row', 
        alignItems:'center', 
        justifyContent:'space-between'
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    cardUpdated: {
        color: 'gray',
        fontSize: 12,
        textAlign: 'right'
    },
    scrollView:{
        width:'100%',
        height:'100%'
    },
    title:{
        fontSize:23,
        fontWeight:'bold',
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
    },
    inputWborder:{
        borderColor:'gray',
        borderWidth:1,
        borderRadius:10,
        marginTop:2,
        height:40,
        width:'100%'
    }
  });
  
  export default globalStyles;