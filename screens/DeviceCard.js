import React from 'react';
import Card from '../shared/Card';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, Linking, View, Image, StyleSheet, Alert } from 'react-native';
import globalStyles from '../styles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { AsyncAlertPrompt } from '../shared/AsyncAlertPrompt';
import { updateDevice } from '../shared';

function DeviceCard({devData, autoSearch}) {

    const RowTemplate = ({title, item}) =>{
        return(
            <>
                <Col>
                    <Text>{title}</Text>
                </Col>
                <Col>
                    {item}
                </Col>
            </>
        )
    }
    const handlePress = async()=>{

        const newUID = (await AsyncAlertPrompt("Enter new UID")).toLowerCase()

        if(newUID.length != 6){
            Alert.alert("Invalid UID", `The UID ${newUID} is of invalid length. Please make sure the UID you have entered is 6 characters long`)
            return
        }
        else if (!global.ALLOWED_CHARS.test(newUID)){
            Alert.alert("Invalid UID",`The UID ${newUID} contains one or more illegal character. Please try a different UID`)
            return
        }

        const data = {
            "end_device":{
                "ids":{
                    "device_id": devData.devID,
                    "application_ids": {
                        "application_id": devData.appID
                    }
                },
                "attributes":{
                    "uid":newUID.toUpperCase()
                }
            },
            "field_mask": {
                  "paths": [
                    "attributes"
                  ]
            }
        }
        const {success, error} = await updateDevice(data)
        if (success){
            Alert.alert("Update Successful!")
            autoSearch(true)
        }
        else{
            Alert.alert("An error occurred", `${error}`)
        }
    }
    const UID_FIELD=() =>{
        if (!devData.uid){ 
            return(
                <TouchableOpacity onPress={handlePress}>
                    <Image source={require('../assets/plus.png')} style={styles.image}/>
                </TouchableOpacity>
            )
        }
        else{
            return(
                <Text>{devData.uid}</Text>
            )
        }
    }
    let rows = []
    rows.push(<Row key={0} style={styles.cardRow}><RowTemplate title='Device Name' item={<Text style={{fontWeight:'bold'}}>{devData.name? devData.name: '-'}</Text>}/></Row>)
    rows.push(<Row key={3} style={styles.cardRow}><RowTemplate title='Device ID' item={<Text>{devData.devID}</Text>}/></Row>)
    rows.push(<Row key={2} style={styles.cardRow}><RowTemplate title='Device UID' item={<UID_FIELD/>}/></Row>)
    rows.push(<Row key={1} style={styles.cardRow}><RowTemplate title='Application ID' item={<Text >{devData.appID}</Text>}/></Row>)
    rows.push(<Row key={4} style={styles.cardRow}><RowTemplate title='Device EUI' item={<Text>{devData.eui != null? devData.eui:'-'}</Text>}/></Row>)
    rows.push(<Row key={5} style={styles.cardRow}><RowTemplate title='Date Created' item={<Text>{devData.creationDate}</Text>}/></Row>)
    rows.push(<Row key={6} style={styles.cardRow}><RowTemplate title='TTN link' item={<Text style={{color: 'blue'}} numberOfLines={1} ellipsizeMode='tail' onPress={() => Linking.openURL(devData.ttn_link)}>au1.cloud.thethings.network/api/v3/ns/applications/</Text>}/></Row>)

    return (
        <Card>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Device Details</Text>
                </View>
            <Grid>
                {rows}
            </Grid>
        </Card>
    );
}

let styles = StyleSheet.create({
    image:{
        width:20,
        height:20,
    },
    cardRow:{
        paddingTop:11,
        alignItems:'center'
    }
})
export default DeviceCard;