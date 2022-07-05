import React, {useEffect, useState} from 'react'
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native'
import MapView, {Marker, PROVIDER_DEFAULT, Circle, Callout} from 'react-native-maps';
import { getLocation } from '../shared/getLocation';
import { Card, getFromStore, LoadingComponent } from '../shared'
import globalStyles from '../styles';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function NearbyDevicesMap({route}) {

    const navigation = route.navigation

    const {loading: locLoading, location: userLocation, error: locError} = getLocation()
    const [devData, setDevData] = useState([])

    const defaultLat = -33.8559799094
    const defaultLong = 151.20666584
    useEffect(()=>{
        getDevData()
    },[])

    async function getDevData(){
      
        const fromStore = await getFromStore({type:"ApplicationList", storKey:'applicationCache'})
    
        if (fromStore.fromStore == null) {setErrorMsg("We have not cached any device data yet. Please come back later");return}
    
        const applications = fromStore?.fromStore
        let devices = applications.map((app)=>app.end_devices)
        devices = [].concat(...devices)
    
        let dev_with_loc = []
        for (const i in devices){
          const dev = devices[i]
    
          if (dev?.locations){
            dev_with_loc.push(dev)
          }
        }
        
        setDevData(dev_with_loc)
    
      }
    
    const handlePress = (device) =>{

        const uid = device?.attributes?.uid
        const application_id = device.ids.application_ids.application_id
        const ID = device.ids.device_id
        const name = device.name
        
        let devData = {
            'appID':application_id,
            'uid':uid,
            'devID':ID,
            'name':name,
            'uidPresent':uid == undefined?false:true
        }
        navigation.navigate('ManageDevices', {autofill:devData})

    }

    return(
        <View style={{backgroundColor:'blue'}}>
            {/* {userLocation&& */}
                <MapView style={styles.map}
                    mapType={'satellite'}
                    provider={PROVIDER_DEFAULT}
                    showsUserLocation={true}
                    region={{
                        latitude:  userLocation?.coords?.latitude ? userLocation?.coords?.latitude:defaultLat,
                        longitude: userLocation?.coords?.longitude ? userLocation?.coords?.longitude : defaultLong,
                        latitudeDelta: userLocation?.coords?.latitude ? 0.002 : 0.2,
                        longitudeDelta: 0.003,
                    }}>
                        {
                            devData.map((item)=>{
                                return(
                                    <Marker key={item.ids.device_id} onCalloutPress={() => handlePress(item)} coordinate={{latitude: item.locations.user.latitude, longitude: item.locations.user.longitude}}>
                                        <Callout>
                                            <View style={{flexDirection:'row'}}>
                                                <View style={{justifyContent:'center', alignItems:'center'}}>
                                                    <Text  adjustsFontSizeToFit numberOfLines={1} style={{fontWeight:'bold', fontSize:15}}>{item.ids.device_id}</Text>
                                                    {item.name&&<Text style={{fontStyle:'italic', fontSize:12, flex:1}} numberOfLines={1} ellipsizeMode='tail'>{item.name}</Text>}
                                                </View>
                                            </View>
                                        </Callout>
                                    </Marker>
                                )
                            })
                        }
                </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '100%',
    }
})