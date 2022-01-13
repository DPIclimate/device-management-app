import React,  {useState} from 'react';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, StyleSheet, Switch, View, Image, TouchableHighlight, Alert, ActivityIndicator } from 'react-native';
import globalStyles from '../styles';
import MapView, {Marker, PROVIDER_DEFAULT, Circle} from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateDevice, checkNetworkStatus, Card} from '../shared/index'


function LocationCard({data}) {
    const [isEnabled, setIsEnabled] = useState(true);
    const [mapType, setMapType] = useState('satellite')
    const [isLoading, setLoadingState] = useState(false)

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
                    'ids':{
                        'device_id': data.name,
                        "application_ids": {
                            "application_id": data.appID
                        }
                    },
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
                },
                'type':'locationUpdate'
            }
            const isConnected = await checkNetworkStatus()

            if (isConnected){
                await updateDevice(body)
                setLoadingState(false)
                
            }else{
                Alert.alert("No internet connection","Would you like to save this updated location for when you are back online?",[
                    {
                        text:'Yes',
                        onPress:async() => await queLocationUpdate(body)
                    },
                    {
                        text:'No',
                        onPress:() => console.log('no')
                    }
            ])
            setLoadingState(false)
            }
        }
        else{
            Alert.alert("Unable to update location","Unable to update location as location services have not been enabled")
            setLoadingState(false)
        }
    }
    const queLocationUpdate = async(body) =>{

        let locationUpdates = []
        try{
            let fromStore = await AsyncStorage.getItem(global.LOC_UPDATES)
            fromStore = JSON.parse(fromStore)
            fromStore != null? locationUpdates = [...locationUpdates, ...fromStore] : locationUpdates = []

        }catch(error){
            console.log(error)
        }

        console.log('creating')
        locationUpdates.push(body)     
        console.log('writing')
        console.log(locationUpdates)
        try{
            await AsyncStorage.setItem(global.LOC_UPDATES, JSON.stringify(locationUpdates))

        }catch(error){
            console.log(error)
            Alert.alert("An error occured", error)
        }

        Alert.alert("Location saved","Location details have been saved successfully")

    }
    const UpdateLocationIcon = () =>{
        return (
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
        );
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
        rows.push(<Row key={3}><RowTemplate title={'Altitude (m)'} data={data.location['altitude'] != undefined? data.location['altitude']: "-"}/></Row>)
        rows.push(<Row key={4}><RowTemplate title={'Accuracy (m)'} data={data.location['accuracy'] != undefined? data.location['accuracy']: "-"}/></Row>)
    }else{
        return (
        <Card>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Location</Text>
                <UpdateLocationIcon/>
            </View>
                <Row>
                    <Text>
                    No location information available
                    </Text>
                </Row>
            </Card>
        )
    }
    const AccuracyCircle = () =>{
        if (data.location['accuracy'] != undefined){
            return <Circle center={{latitude: data.location['latitude'], longitude: data.location['longitude']}} radius={data.location['accuracy']} strokeWidth={1} strokeColor='red'/>
        }
        else{
            return null
        }

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
                        provider={PROVIDER_DEFAULT}
                        showsUserLocation={true}
                        region={{
                            latitude: data.location['latitude'],
                            longitude: data.location['longitude'],
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.003,
                        }}>
                            <Marker coordinate={{latitude: data.location['latitude'], longitude: data.location['longitude']}}/>
                            <AccuracyCircle/>
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
                <UpdateLocationIcon/>
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