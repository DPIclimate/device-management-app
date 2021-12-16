import React from 'react';
import {View, SafeAreaView, Pressable, Text, StyleSheet} from 'react-native'
import globalStyles from '../styles';

function HomeScreen({navigation}) {
    return (
        <View style={globalStyles.screen}>
            <Pressable style={[globalStyles.button, styles.addDeviceLoc]} onPress={() => {navigation.navigate('AddDeviceScreen')}}>
                <Text style={globalStyles.buttonText}>Add Device</Text>
            </Pressable>

            <Pressable style={[globalStyles.button, styles.manDeviceLoc]} onPress={() => {navigation.navigate('ManageDevices')}}>
                <Text style={globalStyles.buttonText}>Manage</Text>
            </Pressable>
        </View>
    );
}
const styles = StyleSheet.create({

    settingsIcon:{
        width:'100%',
        height:'100%',
        position:'relative'

    },
    settingsView:{
        width:50, 
        height:50, 
        position:'absolute',
        right:100, 
        bottom:10
    },
    addDeviceLoc:{
        position:'absolute',
        right:20, 
        bottom:20,
        height:45,
        width:'40%'
    },
    manDeviceLoc:{
        position:'absolute',
        left:20, 
        bottom:20,
        height:45,
        width:'40%'

    }
});
export default HomeScreen;