import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../styles';

export default function Scanner({ route, navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    //Requests camera permission from user
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    const devData = passData(data)
    console.log("In qrcode", devData)
    navigation.navigate(route.params.screen,{autofill:devData})
  };
  const passData = (data) =>{
    //Only occurs once qr code has been scanned
    try{
      let result = JSON.parse(data)
      
      let devData = {}
      //Try and retrieve information from qr code
        for (let key in result){

            switch (key) {
                case 'application_id':
                  devData['appID'] = result[key]
                  break;
                case 'dev_uid':
                  devData['uid'] = result[key]
                  devData['uidPresent'] = true
                  break;
                case 'dev_name':
                  devData['name'] = result[key]
                  break;
                case 'dev_eui':
                  devData['eui'] = result[key]
                  break;
                default:
                  break;
            }
        }
        return devData
    }
    catch(error){
        Alert.alert("Invalid QR code")
        return null
    }
  }
  if (hasPermission === null) {
    return(
        <SafeAreaView style={globalStyles.screen}>
            <Text style={{fontWeight:"bold", fontSize:20}}>Please enable camera access</Text>
        </SafeAreaView> 
    );
  }
  if (hasPermission === false) {
    return(
        <SafeAreaView style={globalStyles.screen}>
            <Image style={{width:'10%', height:'20%'}} source={require('../assets/exclamation-mark.png')}/>
            <Text style={{fontWeight:"bold", fontSize:20, padding:20, textAlign:'center'}}>No camera access granted. To use this function please grant this app access to your camera in your phone settings</Text>
        </SafeAreaView> 
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});