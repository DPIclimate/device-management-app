import React from 'react';
import {StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
    screen: {
        marginLeft:10,
        marginRight:10,
        height:'100%'
    },
    list: {
        padding: 10,
        width: '100%'
    },
    contentView:{
        paddingLeft:10,
        paddingRight:10
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
    },
<<<<<<< HEAD:styles.tsx
    inputInvalid:{
        borderColor:'red',
        borderWidth:1,
        borderRadius:10,
        marginTop:2,
        height:40,
        width:'100%'
    },
=======
>>>>>>> main:styles.js
    invalidText:{
        color:'red',
        paddingTop:10
    }
  });
  
  export default globalStyles;