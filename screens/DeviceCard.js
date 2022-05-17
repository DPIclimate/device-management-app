import React from 'react';
import Card from '../shared/Card';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, Linking, View, TouchableHighlight, Image, Alert, StyleSheet, Pressable } from 'react-native';
import globalStyles from '../styles';
import {useDataContext} from '../shared/DataContextManager'
import { TouchableOpacity } from 'react-native-gesture-handler';

function DeviceCard({params, navigation}) {
    const data = useDataContext()

    if (data == undefined) return <View/>

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
    const handlePress = ()=>{
        console.log(data)
        let newData = {...data}
        newData.uid
        navigation.navigate('RegisterDevice',{autofill:data})
    }
    const UID_FIELD=() =>{

        if (data.uid == undefined){ 
            return(
                <TouchableOpacity onPress={handlePress}>
                    <Image source={require('../assets/plus.png')} style={styles.image}/>
                </TouchableOpacity>
            )
        }
        else{
            return(
                <Text>{data.uid}</Text>
            )
        }
    }
    let rows = []
    rows.push(<Row key={0} style={styles.cardRow}><RowTemplate title='Device Name' item={<Text style={{fontWeight:'bold'}}>{data.name? data.name: '-'}</Text>}/></Row>)
    rows.push(<Row key={3} style={styles.cardRow}><RowTemplate title='Device ID' item={<Text>{data.ID}</Text>}/></Row>)
    rows.push(<Row key={2} style={styles.cardRow}><RowTemplate title='Device UID' item={<UID_FIELD/>}/></Row>)
    rows.push(<Row key={1} style={styles.cardRow}><RowTemplate title='Application ID' item={<Text >{data.appID}</Text>}/></Row>)
    rows.push(<Row key={4} style={styles.cardRow}><RowTemplate title='Device EUI' item={<Text>{data.eui != null? data.eui:'-'}</Text>}/></Row>)
    rows.push(<Row key={5} style={styles.cardRow}><RowTemplate title='Date Created' item={<Text>{data.creationDate}</Text>}/></Row>)
    rows.push(<Row key={6} style={styles.cardRow}><RowTemplate title='TTN link' item={<Text style={{color: 'blue'}} numberOfLines={1} ellipsizeMode='tail' onPress={() => Linking.openURL(data.ttn_link)}>au1.cloud.thethings.network/api/v3/ns/applications/</Text>}/></Row>)

    return (
        <Card>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Device Details</Text>
                {/* <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => navigation.navigate('MoveDevice', {data:data})}>
                    <Image style={{width:25, height:25, padding:5}} source={require('../assets/move2.png')}/>
                </TouchableHighlight> */}
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