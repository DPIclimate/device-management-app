import React, { useEffect, useState, useCallback } from 'react';
import ScreenNavigator from './routes/ScreenNavigator';
import * as Linking from 'expo-linking'
import * as SplashScreen from 'expo-splash-screen';
import './global.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

SplashScreen.preventAutoHideAsync();

export default function App() {
  
  //Used for deep linking
  // exp://10.221.26.87:19000/--/device/?appid=oai-test-devices&uid=2SBBWH&link=true
  // dma://device/?appid=oai-test-devices&uid=A4RF3C&link=true
  
  const prefix = Linking.createURL('/')
  const [data, setData] = useState(null)
  const [appIsReady, setAppIsReady] = useState(false);

  const linking ={
    prefixes:[prefix],
    config:{
      screens:{
        HomeScreen:'device'
      }
    }
  }
  useEffect(()=>{
    async function getInitialURL(){
      const initialURL = await Linking.getInitialURL()
      console.log('init', initialURL)
      if (initialURL) setData(Linking.parse(initialURL))
    }
    
    async function prepare() {
      //Prepare user settings
      try {
        await loadUserSettings()
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    const listener = Linking.addEventListener('url', handleDeepLink)
    
    if (!data){
      getInitialURL()
    }
    
    prepare();

    return(()=>{
      listener.remove()
    })

  },[])


  useEffect(() => {
    async function checkAppReady(){
      if (appIsReady) {
        console.log("app is ready")
        await SplashScreen.hideAsync();
      }
    }
    checkAppReady()
  }, [appIsReady]);
  
  const handleDeepLink = (event) =>{
    let data = Linking.parse(event.url)
    setData(data)
  }

  const loadUserSettings = async()=>{
      
    const authToken = await AsyncStorage.getItem(global.AUTH_TOKEN_STOR)
    global.headers.Authorization = authToken
    global.TTN_TOKEN = authToken
  
  }

  if (!appIsReady) {
    return null;
  }

  return (
      <ScreenNavigator linking={linking}/>
  );
}