import React, { useEffect, useState } from "react"
import * as Location from 'expo-location';

export const getLocation = () =>{
    //Custom hook to get the users location

    const [loading, setLoading] = useState(true)
    const [location, setLocation] = useState(null)
    const [error, setError] = useState(null)

    useEffect(()=>{

        let isMounted = true

        const getLoc = async() =>{

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (!status){
                if (isMounted){
                    setError('Prermission denied')
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

    return {loading, location, error}
}