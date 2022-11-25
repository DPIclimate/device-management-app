import React,  {useState} from 'react';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, StyleSheet, Switch, View, Image, TouchableHighlight, Alert, ActivityIndicator, Dimensions } from 'react-native';
import globalStyles from '../styles';
import MapView, {Marker, PROVIDER_DEFAULT, Circle, Callout} from 'react-native-maps';
import * as Location from 'expo-location';
import {updateDevice, checkNetworkStatus, Card, LoadingComponent, saveDevice} from '../shared'
import {AsyncAlert} from '../shared/AsyncAlert'
import { Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 

function LocationCard({device}) {
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
                        'device_id': device.devID,
                        "application_ids": {
                            "application_id": device.appID
                        }
                    },
                    "locations":{
                        "user":{
                            "latitude": loc.coords.latitude,
                            "longitude": loc.coords.longitude,
                            "altitude": Math.round(loc.coords.altitude),
                            "accuracy":  Math.round(loc.coords.accuracy),
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
                autoSearch(true)
                
            }else{
                const choice = await AsyncAlert("No Internet Connection", "Would you like to save this updated location for when you are back online?")
                if (!choice) {setLoadingState(false);return}

                const success = await saveDevice(body)
                if (success){
                    Alert.alert("Location saved","Location details have been saved successfully")
                }
                else{
                    Alert.alert("Failed","Saving location failed")
                }

                setLoadingState(false)
            }
        }
        else{
            Alert.alert("Unable to update location","Unable to update location as location services have not been enabled")
            setLoadingState(false)
        }
    }

    const getDirections = async() =>{
        
        // Redirect user to apple or google maps for directions
        const lat = device.location.latitude
        const lng = device.location.longitude
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = device.name? device.name : device.devID;
        const url = Platform.select({
          ios: `${scheme}${label}@${latLng}`,
          android: `${scheme}${latLng}(${label})`
        });
        
        Linking.openURL(url);
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
                        onPress:() => console.log("canceled")
                    }
            ])}>
                <Image style={{width:25, height:25, padding:5}} source={require('../assets/locationIcon.png')}/>
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
                    <Text numberOfLines={1} ellipsizeMode='tail'>{data}</Text>
                </Col>
            </>
        )
    }
    
    const AccuracyCircle = () =>{
        if (device.location.accuracy != undefined){
            return <Circle center={{latitude: device.location.latitude, longitude: device.location.longitude}} radius={device.location.accuracy} strokeWidth={1} strokeColor='red'/>
        }
        else{
            return null
        }

    }
    const Content = ({rows}) =>{

        if (isLoading == false){
            return(
                <>
                <View>
                <Grid style={{paddingTop:10, paddingBottom:10}}>
                    {rows}
                </Grid>
                <MapView style={styles.map}
                        mapType={mapType}
                        provider={PROVIDER_DEFAULT}
                        showsUserLocation={true}
                        region={{
                            latitude: device.location.latitude,
                            longitude: device.location.longitude,
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.003,
                        }}>
                            <Marker onCalloutPress={() => getDirections()} coordinate={{latitude: device.location.latitude, longitude: device.location.longitude}}>
                                <Callout>
                                    <View style={{backgroundColor:'#128cde', padding:10, borderRadius:50}}>
                                        <MaterialIcons name="directions-car" size={30} color="white" />
                                    </View>
                                </Callout>    
                            </Marker>
                            <AccuracyCircle/>
                    </MapView>
                    <View style={{paddingTop:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <Text style={{fontSize:15, fontWeight:'bold'}}>Satellite</Text>
                        <Switch onValueChange={toggleSwitch} value={isEnabled}/>
                    </View>
                    </View>
                </>)
        }
        else{
            return <ActivityIndicator size="large"/>
        }
    }

    let rows=[]
    if (device.location != undefined){
        rows.push(<Row key={1} style={styles.cardRow}><RowTemplate title={'Latitude'} data={device.location?.latitude}/></Row>)
        rows.push(<Row key={2} style={styles.cardRow}><RowTemplate title={'Longitude'} data={device.location?.longitude}/></Row>)
        rows.push(<Row key={3} style={styles.cardRow}><RowTemplate title={'Altitude (m)'} data={device.location?.altitude != undefined? device.location?.altitude: "-"}/></Row>)
        rows.push(<Row key={4} style={styles.cardRow}><RowTemplate title={'Accuracy (m)'} data={device.location?.accuracy != undefined? device.location?.accuracy: "-"}/></Row>)
    }else{
        return (
        <Card>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Location</Text>
                <UpdateLocationIcon/>
            </View>
                <Row>
                {!isLoading ? <Text>No location information available</Text>:<View style={{justifyContent:'center', alignItems:'center', width:'100%'}}><LoadingComponent loading={isLoading}/></View>}
                </Row>
            </Card>
        )
    }

    return (
        <Card>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Location</Text>
                <UpdateLocationIcon/>
            </View>
            <Content rows={rows}/>
        </Card>
    );
}
const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: Dimensions.get("window").height/2,
        borderRadius:15,
        marginTop:7
    },
    cardRow:{
        paddingTop:7
    }
})
export default LocationCard;