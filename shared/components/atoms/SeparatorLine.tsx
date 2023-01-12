import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function SeparatorLine() {
  return (
    <View style={styles.separatorLine}/>
  )
}

const styles = StyleSheet.create({
    separatorLine: {
        width: "80%",
        height: 2,
        backgroundColor: "#128cde",
        alignSelf: "flex-start",
        marginTop:10,
        marginBottom: 10,
    }
})