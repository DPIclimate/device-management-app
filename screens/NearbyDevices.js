import React, {useEffect, useState} from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Card, getFromStore, LoadingComponent } from '../shared'
import * as Location from 'expo-location';
import globalStyles from '../styles';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

export default function NearbyDevices({route, navigation}) {

  const [data, setData] = useState([])
  const [devs, setDevs] = useState([])
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5)
  const [isLoading, setLoading] = useState(true)

  useEffect(() =>{

    async function hasLoaded(){
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert("Location Needed", "Please enable location services in order to use this feature")
        navigation.goBack()
        return;
      }
      getData()
    }
    hasLoaded()
  },[])
  
  useEffect(()=>{

    getDistances()

  },[devs])
  async function getData(){
    console.log('in getdata')
  
    const fromStore = await getFromStore({type:"ApplicationList", storKey:'applicationCache'})

    if (fromStore.fromStore == null) {setErrorMsg("We have not cahced any device data yet. Please come back later");return}

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
    setDevs(dev_with_loc)

  }

  const getDistances = async() =>{

    setLoading(true)

    if (devs == undefined) {console.log('returned with no devs');return }
    // if (userLocation == null) {console.log('returned with no location');return}
    const userLocation = await Location.getCurrentPositionAsync({});

    console.log('in get distances')
    let devs_dist = devs.map((dev) => {
      
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
    
    let filtered_devs = []
    devs_dist.forEach((dev)=>{
      if (dev.loc_difference <= searchRadius){
        filtered_devs.push(dev)
      } 
    })

    filtered_devs.sort((a,b)=>{ //Sorts array from closest device to furthest
      return a.loc_difference - b.loc_difference
    })
    console.log(filtered_devs, 'filtered')
    setData(filtered_devs)
    
    if (filtered_devs.length == 0){setErrorMsg('No devices nearby')}
    setLoading(false)
  }
  const handlePress = (device) =>{

    const uid = device?.attributes?.uid
    const application_id = device.ids.application_ids.application_id
    const ID = device.ids.device_id
    const name = device.name
    
    let devData = {
        'appID':application_id,
        'uid':uid,
        'ID':ID,
        'name':name,
        'uidPresent':uid == undefined?false:true
    }
    navigation.navigate('ManageDevices', {autofill:devData})

  }
  const renderItem =({item}) =>{
    return(
          <Card>
              <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => handlePress(item)}>
                  <Text style={globalStyles.text, {flex:1}} numberOfLines={1} ellipsizeMode='tail' >{item.ids.device_id}</Text>
                  <Text style={globalStyles.text, {flex:1, paddingLeft:10}}>Dist: {item.loc_difference.toFixed(2)}km</Text>
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
          max={301}
      />
      </View>
      <View style={{width:'90%', height:2, backgroundColor:'#128cde', alignSelf:'center', margin:20}}/>
      {!isLoading? 
        <View style={{height:'100%', paddingBottom:150}}>
          {console.log(data.length)}
          {data.length==0?
              
              <View style={{alignItems:'center', height:'100%', width:'100%'}}><Text>{errorMsg}{console.log('here', errorMsg)}</Text></View>
              :
              <FlatList
              style={{paddingTop:10}}
              data={data}
              renderItem={(item) => renderItem(item)}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 90 }}
              />
          }
        </View>
        :
        <View style={{justifyContent:'center', alignItems:'center'}}>
          <LoadingComponent loading={isLoading}/>
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({})