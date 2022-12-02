import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Device, Store_Tokens } from '../types/CustomTypes'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface StoredDeviceResponse{
    response:Device[]
    isLoading:boolean
    error:string;
    retry():void
}

export function useStoredDevices():StoredDeviceResponse {
 
    const [response, set_response] = useState<Device[]>([])
    const [isLoading, set_isLoading]=useState<boolean>(true)
    const [error, set_error]=useState<string>(null)
    const [refetch, set_refetch]=useState<boolean>(false)

    const retry = () =>{
        set_refetch((prev) => !prev)
        set_error(null)
        set_isLoading(true)
        set_response([])
    }

    useEffect(() =>{

        let isMounted=true

        const fetchData = async():Promise<void> =>{
            try{
                const inStore=await AsyncStorage.getItem(Store_Tokens.DEVICE_UPDATES).then(JSON.parse)

                if (inStore){   
                    if(isMounted){
                        set_response(inStore as Device[])
                    }
                }

                if(isMounted){
                    set_isLoading(false)
                }
            }
            catch(error){
                if(isMounted){
                    set_error(error)
                }
                console.log(error)
            }
        }
        fetchData()
        
        return () =>{
            isMounted=false
        }
    },[refetch])

    return {
        response,
        isLoading,
        error,
        retry
    }
}

const styles = StyleSheet.create({})