import React, {useEffect, useRef, useState} from 'react'
import {Text, View, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Card, getFromStore, LoadingComponent } from '../shared'
import globalStyles from '../styles';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { getLocation } from '../shared/getLocation';
import { useOrientation } from '../shared/useOrientation';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NearbyDevicesList({devData, handlePress}) {
    
    const [listData, setListData] = useState([])
    const [errorMsg, setErrorMsg] = useState(null);
    const [searchRadius, setSearchRadius] = useState(1)
    const [isLoading, setLoading] = useState(true)

    const {loading: locLoading, location: userLocation, error: locError} = getLocation()//Get user location
    
    
    useEffect(() =>{
      
      if (locLoading) return

      if (locError == 'Permission denied'){
        console.log('permission was denied error', locLoading)
        setErrorMsg('Permission to access location was denied')
        setLoading(false)
      }
      
    },[locLoading, locError])
    
    useEffect(()=>{
      getDistances()

    },[userLocation, searchRadius])
    
    
    const getDistances = async() =>{
      
      setLoading(true)
  
      if (!devData) {console.log('returned with no devs');return }
      if (!userLocation) {console.log('returned with no location');return}

      const devs_dist = devData.map((dev) => {
  
        const lat1 = userLocation?.coords.latitude
        const lat2 = dev.locations.user.latitude
        
        const lon1 = userLocation?.coords.longitude
        const lon2 = dev.locations.user.longitude
        
        // haversine formula used to calculate the distance between 2 points on the earth
        // http://www.movable-type.co.uk/scripts/latlong.html
        
        var R = 6371; // km - radius of the earth
        var dLat = (lat2-lat1) * Math.PI / 180;
        var dLon = (lon2-lon1) * Math.PI / 180; 
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Returns difference in km
        
        dev['loc_difference'] = d
        return dev
      })

      //Why you can modify a const variable, I have no idea
      devs_dist.sort((a,b)=>{ 
        //Sorts array from closest device to furthest
        return a.loc_difference - b.loc_difference
      })

      const filtered_devs = devs_dist.filter((item) =>{
        return item.loc_difference <= searchRadius
      })

      setListData(filtered_devs)
      if (filtered_devs.length == 0){
        setErrorMsg('No devices nearby')
      }
      else{
        setErrorMsg(null)
      }

      setLoading(false)
    }
    
    const renderItem =({item}) =>{
      return(
            <Card>
                <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => handlePress(item)}>
                    <Text style={[globalStyles.text, {flex:1}]} numberOfLines={1} ellipsizeMode='tail' >{item.ids.device_id}</Text>
                    <Text style={[globalStyles.text, {flex:1, paddingLeft:10}]}>Dist: {item.loc_difference.toFixed(2)}km</Text>
                    <Image source={require('../assets/arrowBlue.png')} style={{height:20, width:20}}/>
                </TouchableOpacity>
            </Card>
      )
    }
  
    return (
      <View style={globalStyles.contentView}>
  
        <View style={{height:20, margin:20, marginTop:30, justifyContent:'center', alignItems:'center'}}>
          <Text style={{fontWeight:'bold', fontSize:15}}>Search Radius: {searchRadius}km</Text>
          <MultiSlider
            value={searchRadius}
            onValuesChange={(e) => setSearchRadius(e[0])}
            onValuesChangeFinish={getDistances}
            max={10}
        />
        </View>
        <View style={{width:'90%', height:2, backgroundColor:'#128cde', alignSelf:'center', margin:20}}/>
  
        {errorMsg?
            <Text style={{fontWeight:'bold', paddingTop:20, fontSize:15, alignSelf:'center'}}>{errorMsg}</Text>
          :
          <View>
            {!isLoading && !locLoading? 
              <View style={{height:'100%', paddingBottom:200}}>
                
                    <FlatList
                    style={{paddingTop:10}}
                    data={listData}
                    renderItem={(item) => renderItem(item)}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    />
              </View>
              :
              <View style={{justifyContent:'center', alignItems:'center'}}>
                <LoadingComponent loading={isLoading || locLoading}/>
              </View>
            }
        </View>
        }
      </View>
    )
}

const styles = StyleSheet.create({})