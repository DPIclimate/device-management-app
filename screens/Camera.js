import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';

export default function CameraScreen({route, navigation}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  let camera = Camera

  useEffect(() => {
    (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync(); // Used barcode scanner permissions as Camera.requestPermissionsAsync() does not work
        setHasPermission(status === 'granted');
    setHasPermission(true)
    })();
  }, []);

  if (hasPermission === null) {
      console.log('permission granted')
    return <View />;
  }
  if (hasPermission === false) {
    console.log('permission not granted')

    return <Text>No access to camera</Text>;
  }
  const takePic = async () =>{
    const photo = await camera.takePictureAsync()
    let img = [...route.params.currentImages]
    img.push(photo.uri )
    console.log('in camera', route.params.currentImages)
    navigation.navigate('ManageDevices', {photoData:img})
   
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={(r) =>{
          camera=r
      }}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => {setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Image source={require('../assets/switch.png')} style={{width:80, height:80}}/>
          </TouchableOpacity>
          <View style={{position: 'absolute', left: (Dimensions.get('window').width / 2) - 40, bottom: 10}}>
                <TouchableOpacity onPress={takePic} style={{ width: 70, height: 70, bottom: 0, borderRadius: 50, backgroundColor: '#fff'}}/>
            </View>
        </View>
      </Camera>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      margin: 20,
    },
    button: {
      flex: 0.1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: 'white',
    },
  });