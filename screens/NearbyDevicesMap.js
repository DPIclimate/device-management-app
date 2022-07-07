import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import MapView, {Marker, PROVIDER_DEFAULT, Callout} from 'react-native-maps';

export default function NearbyDevicesMap({route}) {

    const devData = route?.devData._W    

    return(
            <MapView style={styles.map}
                mapType={'satellite'}
                provider={PROVIDER_DEFAULT}
                showsUserLocation={true}
                followsUserLocation={true}
                loadingEnabled={true}
                >
                    {
                        devData?.map((item)=>{
                            return(
                                <Marker key={item.ids.device_id} onCalloutPress={() => route.handlePress(item)} coordinate={{latitude: item.locations.user.latitude, longitude: item.locations.user.longitude}}>
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
    )
}

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '100%',
    }
})