import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function DisplayError(error) {

    if (!error) return <Text/>
    
    const Help = () =>{
        switch (error) {
            case 403:
                return "Invalid TTN Token, please ensure your ttn token is value in settings"
            case 404:
                return "Invalid region selection, please ensure you region is correct in settings"
            default:
                return null
        }
    }

  return (
    <View>
      <Text>Error: HTTP {error}</Text>
      <Text><Help/></Text>
    </View>
  )
}

const styles = StyleSheet.create({})