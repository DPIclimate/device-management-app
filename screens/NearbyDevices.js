import React, { useState} from 'react'
import { useWindowDimensions } from 'react-native'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Feather } from '@expo/vector-icons'; 
import NearbyDevicesList from './NearbyDevicesList';
import NearbyDevicesMap from './NearbyDevicesMap';
import {getFromStore } from '../shared'


export default function NearbyDevices({route, navigation}) {
  
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

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

  const [routes] = useState([
    { key: 'first', title: '', handlePress:handlePress, devData:getData() },
    { key: 'second', title:  '', handlePress:handlePress,  devData:getData()},
  ]);

  const renderScene = SceneMap({
    first: NearbyDevicesList,
    second: NearbyDevicesMap,
  });

  async function getData(){

    console.log('getting data')
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
    
    return dev_with_loc
  }

  const getTabBarIcon = (props) => {

    const {route} = props
      if (route.key === 'first') {
       return <Feather name="list" size={28} color="white" />

      } else {
       return <Feather name="map" size={28} color="white" />

      }
  }


  return (
    <>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        tabBarPosition={'bottom'}
        renderTabBar={props =>
          <TabBar
          {...props}
          indicatorStyle={{backgroundColor: 'white'}}
          renderIcon={
            props => getTabBarIcon(props)
          }
          />
        }
        />
      </>
  );
}