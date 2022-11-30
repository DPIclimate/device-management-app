import React from "react"
import {Linking, Text, StyleSheet, View} from 'react-native'
import Card from "./Card"

export const Bearer_Help_Card = ():JSX.Element =>{

    const api_link:string="https://au1.cloud.thethings.network/console/user/api-keys"
    
    return(
        <Card>
            <Text style={styles.cardTitle}>Help</Text>

            <View style={styles.separatorLine} />
            <Text style={styles.title}>What is a bearer token?</Text>
            <Text>A bearer token is an an alphanumeric string that is issued by a server for the purpose of authentication.</Text>

            <Text style={styles.title}>Why do I need this?</Text>
            <Text>You need a bearer token so that the app can authenticate with The Things Network (TTN) Application Program Interface (API). If a bearer token is not provided then it is not possible to retrieve, store and edit information about applications and devices on your TTN instance. This token is stored locally on your phone and is not sent anywhere other then to TTN for the purpose of authentication.</Text>

            <Text style={styles.title}>How do I get one?</Text>
            <Text>On TTN go to<Text style={{color:'blue'}} onPress={() => Linking.openURL(api_link)}>Personal API Keys </Text>> Add API key. Here you can configure certain permissions for the API key. You can either leave selected "Grant all current and future rights" or you can choose to select individual rights. We recommend selecting "Grant all current and future rights" to ensure the app will work as intended.\n\nYou can name the key whatever you wish. Click "Create API key". Next copy the API key provided to your clipboard and paste it in the field above. Next click Continue/Update. You can now continue your use of the app.</Text>
        </Card>
    )
}
const styles = StyleSheet.create({
    cardTitle: {
        fontWeight: "bold",
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    separatorLine: {
        width: "80%",
        height: 2,
        backgroundColor: "#128cde",
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    title:{
        fontWeight:'bold',
        marginTop:10
    }
});