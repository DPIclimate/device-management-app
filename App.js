import React, { useEffect, useState } from 'react';
import ScreenNavigator from './routes/ScreenNavigator';
import * as Linking from 'expo-linking'


const prefix = Linking.makeUrl('/')

export default function App() {

  //Used for deep linking
  //exp://172.20.10.4:19001/--/lookup/?appid=oai-test-devices&uid=A4RF3C&link=true
  const [data, setData] = useState(null)

  const linking ={
    prefixes:[prefix],
    config:{
      screens:{
        SettingsScreen:'settings',
        ManageDevices:'lookup'
      }
    }
  }
  useEffect(()=>{

    async function getInitialURL(){
      const initialURL = await Linking.getInitialURL()
      if (getInitialURL) setData(Linking.parse(initialURL))
    }
    const listener = Linking.addEventListener('url', handleDeepLink)
    if (!data){
      getInitialURL()
    }

    return(()=>{
      listener.remove()
    })
  },[])

  const handleDeepLink = (event) =>{
    let data = Linking.parse(event.url)
    setData(data)
  }

  return (
      
        <ScreenNavigator linking={linking}/>
  );
}