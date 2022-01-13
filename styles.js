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
    button:{
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#1396ed',
        borderRadius:25,
        justifyContent:'center'
    },
    buttonText:{
        color:'white',
        textAlign:'center',
        fontWeight:'bold',
        fontSize:15
    },
    scrollView:{
        width:'100%',
        height:'100%'
    },
    cardRow:{
        paddingTop:10

    },
    text:{
        fontSize:14
    },
    title:{
        fontSize:23,
        paddingTop:20,
        width:'100%',
        alignItems:'flex-end',
        fontWeight:'bold',
    },
    contentView:{
        padding:10 
    },
  });
  
  export default globalStyles;