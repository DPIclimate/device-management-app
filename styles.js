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
    cardUpdated: {
        color: 'gray',
        fontSize: 12,
        textAlign: 'right'
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
    invalidText:{
        color:'red',
        fontSize:14,
        paddingTop:10
    },
    title:{
        fontSize:23,
        fontWeight:'bold',
    },
    contentView:{
        padding:10 
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