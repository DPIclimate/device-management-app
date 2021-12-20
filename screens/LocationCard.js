import React, {useRef, useState} from 'react';
import Card from '../shared/Card';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, StyleSheet, Switch, View, Image, TouchableHighlight, Alert, ActivityIndicator } from 'react-native';
import globalStyles from '../styles';
import MapView, {Marker, PROVIDER_GOOGLE, Circle} from 'react-native-maps';
import * as Location from 'expo-location';
import config from '../config';
import Error from '../shared/ErrorClass'


function LocationCard({data}) {
    const [isEnabled, setIsEnabled] = useState(true);
    const [mapType, setMapType] = useState('satellite')
    const [isLoading, setLoadingState] = useState(false)
    const circleRef = useRef(null)

    const toggleSwitch = () => {
        isEnabled == false ? setMapType('satellite') : setMapType('terrain')
        setIsEnabled(previousState => !previousState)

    };

    const updateLocation = async() =>{

        setLoadingState(true)
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status == 'granted'){
            let loc = await Location.getCurrentPositionAsync({});

            const body = {
                "end_device":{
                    "locations":{
                        "user":{
                            "latitude": loc['coords']['latitude'],
                            "longitude": loc['coords']['longitude'],
                            "altitude": Math.round(loc['coords']['altitude']),
                            "accuracy":  Math.round(loc['coords']['accuracy']),
                            "source": "SOURCE_REGISTRY"
                        }
                    }
                },
                "field_mask": {
                  "paths": [
                    "locations"
                  ]
                }
            }
            try{
                const url =  `${config.ttnBaseURL}/${data.appID}/devices/${data.name}`
                const response = await fetch(url,{
                    method:"PUT",
                    headers:config.headers,
                    body:JSON.stringify(body)
                }).then((response) => response.json())
    
                console.log(response)
                if ('code' in response){
                    //If key code exists then an error occured
                    throw new Error(json['code'], json['message'], deviceName)
                }
                else{
                    data.location = response['locations']['user']
                    console.log(data.location)
                    setLoadingState(false)
                }
            }
            catch(error){
                console.log("An error occured", error)
                error.alertWithCode()
                setLoadingState(false)

            }
        }
        else{
            Alert.alert("Unable to update location","Unable to update location as location services have not been enabled")
        }
    }
    const RowTemplate = ({title, data}) =>{
        return (
            <>
                <Col>
                    <Text>{title}</Text>
                </Col>
                <Col>
                    <Text>{data}</Text>
                </Col>
            </>
        )
    }
    
    let rows=[]
    if (data.location != undefined){
        rows.push(<Row key={1}><RowTemplate title={'Latitude'} data={data.location['latitude']}/></Row>)
        rows.push(<Row key={2}><RowTemplate title={'Longitude'} data={data.location['longitude']}/></Row>)
        rows.push(<Row key={3}><RowTemplate title={'Altitude (m)'} data={data.location['altitude']}/></Row>)
        rows.push(<Row key={4}><RowTemplate title={'Accuracy (m)'} data={data.location['accuracy'] != undefined? data.location['accuracy']: null}/></Row>)
    }else{
        return (
        <Card>
            <View style={{height:50}}>
                <Text style={globalStyles.cardTitle}>Location</Text>
                <Row>
                    <Text>
                    No location information available
                    </Text>
                </Row>
                </View>
            </Card>
        )
    }
    const Content = () =>{

        if (isLoading == false){
            return(
                <>
                <Grid style={{paddingTop:10, paddingBottom:10}}>
                    {rows}
                </Grid>
                <MapView style={styles.map}
                        mapType={mapType}
                        provider={PROVIDER_GOOGLE}
                        showsUserLocation={true}
                        region={{
                            latitude: data.location['latitude'],
                            longitude: data.location['longitude'],
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.003,
                        }}>
                            <Marker coordinate={{latitude: data.location['latitude'], longitude: data.location['longitude']}}/>
                            <Circle center={{latitude: data.location['latitude'], longitude: data.location['longitude']}} radius={data.location['accuracy']}/>
                    </MapView>
                    <View style={{paddingTop:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <Text style={{fontSize:15, fontWeight:'bold'}}>Satellite</Text>
                        <Switch onValueChange={toggleSwitch} value={isEnabled}/>
                    </View>
                </>)
        }
        else{
            return <ActivityIndicator size="large"/>
        }
    }
    return (
        <Card>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Location</Text>
                <TouchableHighlight disabled={isLoading} acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => 
                    Alert.alert("Update Location?","Update device location to your current location?",[
                        {
                            text:"Yes",
                            onPress:() => updateLocation()
                        },
                        {
                            text:"Cancel",
                            onPress:() => console.log("Cenceled")
                        }
                ])}>
                    <Image style={{width:23, height:23, padding:5}} source={require('../assets/settingsIcon.png')}/>
                    </TouchableHighlight>
            </View>
            <Content/>
        </Card>
    );
}
const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: 300,
    },
})
export default LocationCard;