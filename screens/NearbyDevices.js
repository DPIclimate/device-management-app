import React, { useEffect, useState} from 'react'
import { useWindowDimensions, Dimensions, View } from 'react-native'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Feather } from '@expo/vector-icons'; 
import NearbyDevicesList from './NearbyDevicesList';
import NearbyDevicesMap from './NearbyDevicesMap';
import {checkNetworkStatus, getFromStore } from '../shared'
import { useOrientation } from '../shared/useOrientation';
import { useFetch } from '../shared/useFetch';


export default function NearbyDevices({pageRoute, navigation}) {
  
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [devData, setDevData] = useState([])
  const [error, setError] = useState(null)
  const orientation = useOrientation()

  useEffect(() =>{
    setData()
  },[])

  const [routes] = useState([
    { key: 'devList', title: ''},
    { key: 'devMap', title:  ''},
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'devList':
        return (
            <NearbyDevicesList handlePress={handlePress} devData={devData} error={error}/>
        )
      case 'devMap':
        return <NearbyDevicesMap  handlePress={handlePress} devData={devData}/>;
      default:
        return null;
    }
  };

  async function setData(){

    const apps = await getFromStore('/api/v3/applications')
    console.log('apps are ', apps.applications.length)
    //Get all devices in all applications
    try{

      const devs = (await Promise.all(apps.applications.map(async(item) => {
          const fromStore = await getFromStore(`/api/v3/applications/${item.ids.application_id}/devices`)

          //If user has not yet cached this application, try and get it from TTN
          if (!fromStore){
            console.log(`Nothing in storage for ${item.ids.application_id}, requesting from TTN`)
            const req = await useFetch(`${global.BASE_URL}/applications/${item.ids.application_id}/devices`)
            return req.end_devices
          }

          return fromStore.end_devices
        }))).flat()

        const dev_with_loc = devs.filter((item) => item?.locations)    
        setDevData(dev_with_loc)

    }catch(error){
      setError("No data in cache, please try again later")
      setDevData([])
    }
  }

  const handlePress = (device) =>{

    const uid = device?.attributes?.uid
    const application_id = device.ids.application_ids.application_id
    const ID = device.ids.device_id
    const name = device.name
    
    const devData = {
        'appID':application_id,
        'uid':uid,
        'devID':ID,
        'name':name,
        'uidPresent':uid == undefined?false:true
    }
    navigation.navigate('ManageDevices', {autofill:devData})
  }

  const getTabBarIcon = (props) => {

    const {route} = props
      if (route.key === 'devList') {
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