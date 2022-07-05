import React, { useState, useEffect} from 'react'
import { useWindowDimensions, StyleSheet, View } from 'react-native'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Feather } from '@expo/vector-icons'; 
import NearbyDevicesList from './NearbyDevicesList';
import NearbyDevicesMap from './NearbyDevicesMap';
import { getLocation } from '../shared/getLocation';
import { Card, getFromStore, LoadingComponent } from '../shared'


export default function NearbyDevices({route, navigation}) {

  const renderScene = SceneMap({
    first: NearbyDevicesList,
    second: NearbyDevicesMap,
  });

  const getTabBarIcon = (props) => {

    const {route} = props
      if (route.key === 'first') {
       return <Feather name="list" size={28} color="white" />

      } else {
       return <Feather name="map" size={28} color="white" />

      }
  }

  const layout = useWindowDimensions();
  
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: '', navigation:navigation },
    { key: 'second', title:  '', navigation:navigation},
  ]);

  return (
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
  );
}