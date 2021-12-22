import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';

import {
  AddDeviceScreen,
  QrScanner,
  ManageDevices,
  Applications,
  Devices,
  OfflineDevices
} from '../screens/index';

const { Screen, Navigator } = createStackNavigator();

/**
 * Navigation stack for all main screens
 * @returns 
 */
function ScreenStack() {
  return (
    <Navigator
      initialRouteName="Applications"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#063f5c',
          //063f5c
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        gestureEnabled: true 
      }}
    >
      <Screen
        name='Applications'
        component={Applications}
        options={{ title: 'Browse Devices'}}
      />
      <Screen
        name='Devices'
        component={Devices}
        options={{ title: 'Browse Devices'}}
      />
      <Screen
        name='AddDeviceScreen'
        component={AddDeviceScreen}
        options={{ title: 'Add New Device'}}
      />
      <Screen
        name="QrScanner"
        component={QrScanner}
        options={{title:"Scan QR code"}}
      />
      <Screen
        name="ManageDevices"
        component={ManageDevices}
        options={{title:"Manage Devices"}}
        />
      <Screen
      name="OfflineDevices"
      component={OfflineDevices}
      options={{title:"Saved Devices"}}
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