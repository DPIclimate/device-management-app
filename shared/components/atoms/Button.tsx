import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'

interface ButtonParams{
    text:string,
    disabled?:boolean
    onPress():void | Promise<void>
    style?:StyleProp<ViewStyle>
}

export default function Button({text, onPress, disabled=false, style}:ButtonParams):JSX.Element {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} disabled={disabled}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#128cde",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 50,
        margin: 20,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
        padding: 15,
    }
})