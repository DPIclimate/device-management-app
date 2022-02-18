import { StyleSheet, Text, View, TouchableOpacity, Image, Pressable, Alert } from 'react-native';
import React, {useEffect, useState} from 'react';
import globalStyles from '../styles';
import { Card, checkNetworkStatus, registerDevice, moveDevice, saveDevice } from '../shared';
import { AsyncAlert } from '../shared/AsyncAlert';

export default function MoveDevice({route, navigation}) {

  const data = route.params.data

  const [appMove, setAppMove] = useState()
  const [netStatus, setNetStatus] = useState(false)

  useEffect(() =>{

    async function isLoaded(){
      const connected = await checkNetworkStatus()
      setNetStatus(connected)

      if (route.params?.appSelected){
        setAppMove(route.params.appSelected)
      }
    }
    isLoaded()
  })

  const handlePress = async() =>{

    if (appMove == undefined) {Alert.alert("No app selected", "Must select an application to move device to"); return}
    const confirm = await AsyncAlert("Are you sure?",`Are you sure you want to move device ${data.ID} from application ${data.appID} to application ${appMove}, this action CAN NOT be undone?`)
    if (confirm == 'NO') return

    let device = data
    device.type = 'move'
    
    if (netStatus){
      const success = moveDevice(device, appMove)
      if (!success) {return}
    }
   else{
     device.moveTo = appMove
     const success = saveDevice(device)
     if (!success) {
       Alert.alert("Failed", "Failed to save device")
       return
      }
   }

    Alert.alert("Success", `Successfully moved device to application ${appMove}`)
    navigation.navigate("Applications")

  }

  return (
    <View style={styles.contentView}>
      <Text style={[globalStyles.title, styles.title]}>Move Device "{data.ID}"</Text>
      <Text style={styles.sub}>From:</Text>
        <Card>
          <View style={{height:25, justifyContent:'center'}}>
            <Text>{data.appID}</Text>
          </View>
        </Card>
      
      <Text style={styles.sub}>To:</Text>
      <Card>
        <View style={{height:25, justifyContent:'center'}}>
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%'}} onPress={() => navigation.navigate("AppList",{appSelected:appMove})}>
                <Text style={globalStyles.text}>{appMove}</Text>
                  <Image source={require('../assets/arrowBlue.png')} style={{height:20, width:20}}/>
            </TouchableOpacity>
          </View>
        </Card>

      <Pressable style={[globalStyles.blueButton, styles.buttonLocation]} onPress={handlePress}>
          <Text style={globalStyles.blueButtonText}>Move</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({

  contentView:{
    padding:10,
    paddingBottom:15
  },
  title:{
      paddingTop:20,
      alignItems:'flex-end',
  },
  sub:{
    paddingTop:25,
    fontWeight:'bold',
    fontSize:15
  },
  buttonLocation:{
    width:'100%',
    textAlign:'center',
    marginTop:25
  }

});
