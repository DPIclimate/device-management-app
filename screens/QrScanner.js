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

    navigation.navigate(devData.format == 'lora' ? 'RegisterDevice' : route.params.screen,{autofill:devData})
  };
  const passData = (data) =>{
  //called once qr code has been scanned
    try{
        let result = JSON.parse(data)
        let devData = {
          'format':'custom'
        }
        
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
              default:
                break;
          }
        }
      return devData
    }
    catch(error){
      //check if qr is in LoRa Aliacnce format
      try{
        console.log(data)
        let devData = {
          "app_eui":data.split(':')[2],
          "dev_eui":data.split(':')[3],
          "format":'lora'
        }
        return devData

      }catch(error){
        console.log(error)
        Alert.alert("Invalid QR code")
        return null
      }
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

      <View style={styles.overlay}>
        <Image source={require('../assets/corners.png')} style={{width:300, height:300}}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  overlay: {
    justifyContent:'center', 
    alignItems:'center',
    paddingBottom:50
  }
});