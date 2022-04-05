import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import {
  RegisterDevice,
  QrScanner,
  ManageDevices,
  Applications,
  Devices,
  OfflineDevices
} from '../screens/index';
import Camera from '../screens/Camera'
import SettingsScreen from '../screens/SettingsScreen';
import MoveDevice from '../screens/MoveDevice';
import AppList from '../screens/AppList';
import NearbyDevices from '../screens/NearbyDevices'
import HomeScreen from '../screens/HomeScreen';

const { Screen, Navigator } = createStackNavigator();

/**
 * Navigation stack for all main screens
 * @returns 
 */
function ScreenStack() {
  return (
    <Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#128cde',
          //063f5c
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        gestureEnabled: true,
      }}
    >
      <Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{title: "Home"}}
        />
      <Screen
        name='Applications'
        component={Applications}
        options={{ title: 'Browse Applications'}}
      />
      <Screen
        name='Devices'
        component={Devices}
        options={{ title: 'Browse Devices'}}
      />
      <Screen
        name='RegisterDevice'
        component={RegisterDevice}
        options={{ title: 'Register/Update Device'}}
      />
      <Screen
        name="QrScanner"
        component={QrScanner}
        options={{title:"Scan QR code"}}
      />
      <Screen
        name="ManageDevices"
        component={ManageDevices}
        options={{title:"Lookup Devices"}}
        />
      <Screen
      name="OfflineDevices"
      component={OfflineDevices}
      options={{title:"Saved Devices"}}
      />
      <Screen
      name="Camera"
      component={Camera}
      options={{title:"Camera"}}
      />
      <Screen
      name="SettingsScreen"
      component={SettingsScreen}
      options={{title:"Settings"}}
      />
      <Screen
      name="MoveDevice"
      component={MoveDevice}
      options={{title:"Move Device"}}
      />
      <Screen
      name="AppList"
      component={AppList}
      options={{title:"App List"}}
      />
      <Screen
        name="NearbyDevices"
        component={NearbyDevices}
        options={{ title: 'Nearby Devices' }}
      />
    </Navigator>
  );
}
function ScreenNavigator() {
    return (
        <NavigationContainer>
            {ScreenStack()}
        </NavigationContainer>
    );
}

export default ScreenNavigator;