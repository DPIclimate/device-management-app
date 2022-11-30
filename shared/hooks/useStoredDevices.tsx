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

export default function useStoredDevices():StoredDeviceResponse {
 
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

        const fetchData = async():Promise<void> =>{
            try{
                const inStore:string=await AsyncStorage.getItem(Store_Tokens.DEVICE_UPDATES).then(JSON.parse)
                console.log(inStore)
            }
            catch(error){
                set_error(error)
            }
            set_isLoading(false)
        }
        fetchData()
    },[refetch])

    return {
        response,
        isLoading,
        error,
        retry
    }
}

const styles = StyleSheet.create({})