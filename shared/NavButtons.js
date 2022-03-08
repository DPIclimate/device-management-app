import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native'
import globalStyles from '../styles';

const NavButtons = ({navigation}) => {

    return(
        <>
        <Pressable style={[globalStyles.blueButton, styles.addDeviceLoc]} onPress={() => {navigation.navigate('AddDeviceScreen')}}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={globalStyles.blueButtonText}>Add Device</Text>
            </Pressable>

            <Pressable style={[globalStyles.blueButton, styles.manDeviceLoc]} onPress={() => {navigation.navigate('ManageDevices')}}>
                <Text  adjustsFontSizeToFit numberOfLines={1} style={globalStyles.blueButtonText}>Manage</Text>
            </Pressable>
        </>
    )
}
const styles = StyleSheet.create({
    
    title:{
        fontSize:20,
        paddingTop:20,
        width:'100%',
        alignItems:'flex-end',
        fontWeight:'bold',
    },
    addDeviceLoc:{
        position:'absolute',
        left:20, 
        bottom:20,
        height:45,
        width:'40%',
        height:50
    },
    manDeviceLoc:{
        position:'absolute',
        right:20, 
        bottom:20,
        height:45,
        width:'40%',
        height:50

    }
});
export default NavButtons