import React, { useState} from 'react'
import { useWindowDimensions, Platform, StyleSheet } from 'react-native'
import { TabView, TabBar } from 'react-native-tab-view';
import { Feather } from '@expo/vector-icons'; 
import {NearbyDevicesList} from './components/NearbyDevicesList';
import {NearbyDevicesMap} from './components/NearbyDevicesMap';
import { Device } from '../shared/types/CustomTypes';
import useGetAllDevices from '../shared/hooks/useGetAllDevices';

export function NearbyDevicesScreen({route, navigation}):JSX.Element {
  
  const layout = useWindowDimensions();

  const {devices, isLoading, retry, error}=useGetAllDevices()
  const [index, setIndex] = useState(0);

  const [routes] = useState([
    { key: 'devList', title: ''},
    { key: 'devMap', title:  ''},
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'devList':
        return (
            <NearbyDevicesList handlePress={handlePress} retry={retry} devices={devices.filter((dev: Device) => dev?.location)} isLoading={isLoading} error={error}/>
        )
      case 'devMap':
        return (
            <NearbyDevicesMap  handlePress={handlePress} retry={retry} devices={devices.filter((dev: Device) => dev?.location)} isLoading={isLoading} error={error}/>
        )
      default:
        return null;
    }
  };

  const handlePress = (device:Device) =>{
    navigation.navigate('ManageDeviceScreen', {device:device})
  }

  const getTabBarIcon = (props) => {

    const {route} = props
      if (route.key === 'devList') {
       return <Feather name="list" size={25} color="white" />

      } else {
       return <Feather name="map" size={25} color="white" />

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
        swipeEnabled={Platform.OS == "android"? false: true}
        renderTabBar={props =>
          <TabBar
          {...props}
          indicatorStyle={layout.height >layout.width? styles.indicator_vertical:styles.indicator_horizontal}
          style={ layout.height >layout.width? styles.vertical:styles.horizontal}
          renderIcon={
            props => layout.height >layout.width? getTabBarIcon(props):null
          }
          />
        }
        />
      </>
  );
}
const styles = StyleSheet.create({
  vertical:{
    height:50
  },
  horizontal:{
    height:15,
    borderWidth:1,
    borderColor:'#128cde',
    backgroundColor:'white'
  },
  indicator_vertical:{
    backgroundColor:'white'
  },
  indicator_horizontal:{
    backgroundColor:'#128cde',
    height:14
  }
})

