import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native'
import globalStyles from '../styles';

const NavButtons = ({navigation}) => {

    return(
        <>
        <Pressable style={[globalStyles.button, styles.addDeviceLoc]} onPress={() => {navigation.navigate('AddDeviceScreen')}}>
                <Text style={globalStyles.buttonText}>Add Device</Text>
            </Pressable>

            <Pressable style={[globalStyles.button, styles.manDeviceLoc]} onPress={() => {navigation.navigate('ManageDevices')}}>
                <Text style={globalStyles.buttonText}>Manage</Text>
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
        width:'40%'
    },
    manDeviceLoc:{
        position:'absolute',
        right:20, 
        bottom:20,
        height:45,
        width:'40%'

    }
});
export default NavButtons