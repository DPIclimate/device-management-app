import React, { useEffect, useState } from "react"
import * as Location from 'expo-location';
import { AsyncAlert } from "./AsyncAlert";

export const getLocation = () =>{
    //Custom hook to get the users location

    const [loading, setLoading] = useState(true)
    const [location, setLocation] = useState(null)
    const [error, setError] = useState(null)

    useEffect(()=>{
        
        let isMounted = true
        
        const getLoc = async() =>{
            
            const status = await getPerms()
            if (!status){
                if (isMounted){
                    setError('Permission denied')
                    setLoading(false)
                }
            }
            else{
                try{
                    const loc = await Location.getCurrentPositionAsync({});

                    if(isMounted){
                        setLocation(loc)
                        setLoading(false)
                    }
                
                }catch(error){

                    if(isMounted){
                        setError(error)
                        setLoading(false)
                    }
                }
            }
        }
        getLoc()

        return () => {isMounted = false}
    },[])

    const getPerms = async() =>{
        const currentPermissions = await Location.getForegroundPermissionsAsync()

        if (!currentPermissions.granted && currentPermissions.canAskAgain){
            //Custom permissions alert, cannot access default ios permissions alert as they are controlled by the os.
            const choice = await AsyncAlert("Device Management App would like to use your location","Allow Device Management App to use your location to see devices nearby?")
            if (!choice) return false
        }
        let { granted } = await Location.requestForegroundPermissionsAsync();
        return granted

    }
    return {loading, location, error}
}