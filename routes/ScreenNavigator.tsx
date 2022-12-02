import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import GatewaysScreen from '../screens/GatewaysScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import DevicesScreen from '../screens/DevicesScreen';
import QrScanner from '../screens/QrScanner';
import { ManageDeviceScreen } from '../screens/ManageDeviceScreen';
import { NearbyDevicesScreen } from '../screens/NearbyDevicesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SavedUpdatesScreen } from '../screens/SavedUpdatesScreen';

const { Screen, Navigator } = createStackNavigator();

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
        name='ApplicationsScreen'
        component={ApplicationsScreen}
        options={{ title: 'Browse Applications'}}
      />
      <Screen
        name='DevicesScreen'
        component={DevicesScreen}
        options={{ title: 'Browse Devices'}}
      />
      <Screen
        name="QrScanner"
        component={QrScanner}
        options={{title:"Scan QR code"}}
      />
      <Screen
        name="ManageDeviceScreen"
        component={ManageDeviceScreen}
        options={{title:"Manage Device"}}
        />
      <Screen
      name="SavedUpdatesScreen"
      component={SavedUpdatesScreen}
      options={{title:"Saved Updates"}}
      />
      <Screen
      name="SettingsScreen"
      component={SettingsScreen}
      options={{title:"Settings"}}
      />
      <Screen
        name="NearbyDevices"
        component={NearbyDevicesScreen}
        options={{ title: 'Nearby Devices' }}
      />
      <Screen
        name="Gateways"
        component={GatewaysScreen}
        options={{title: 'Gateways'}}
        />
    </Navigator>
  );
}
function ScreenNavigator({linking}) {

  return (
        <NavigationContainer linking={linking}>
            {ScreenStack()}
        </NavigationContainer>
    );
}

export default ScreenNavigator;