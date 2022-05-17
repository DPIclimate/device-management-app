import { StyleSheet, Text, View , Image, TouchableOpacity} from 'react-native';
import React, { useEffect, useState } from 'react';
import useFetchState from '../shared/useFetch';

import { FlatList } from 'react-native-gesture-handler';
import { Card, checkNetworkStatus, LoadingComponent } from '../shared';
import globalStyles from '../styles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppList({route, navigation}) {

    const {data: rawData, isLoading, error, retry} = useFetchState(`${global.BASE_URL}/applications?field_mask=description`,{type:"ApplicationList", storKey:global.APP_CACHE})
    const [data, setData] = useState()

    useEffect(()=>{

        async function isLoaded(){

            if (isLoading) return
            if (error) return
            if(!rawData) return

            const connected = await checkNetworkStatus()
            console.log(connected)
            if (connected){
                const appList = rawData.applications.map((app)=>({id:app.ids.application_id}))
                setData(appList)
            }
            else{
                console.log(rawData)
                const appList = rawData.map((app)=>({id:app.application_id}))
                setData(appList)
            }
        }
        isLoaded()
    },[isLoading, rawData])

    if (isLoading) return <LoadingComponent loading={isLoading}/>
    if (error) return <SafeAreaView><Text>An error occured: {error}</Text></SafeAreaView>

    const renderItem = ({item})=>{
        return (
            <Card>
                <TouchableOpacity onPress={() => navigation.navigate('MoveDevice', {appSelected:item.id})}>
                    <View style={{height:25, alignItems:'center', flexDirection:'row', justifyContent:'space-between'}}>
                        <Text>{item.id}</Text>
                        <Image source={route.params?.appSelected == item.id? require('../assets/blueCircle.png'): require('../assets/blueCircle-hollow.png')} style={{height:20, width:20}}/>
                    </View>
                </TouchableOpacity>
            </Card>
        )
    }
    return (
        <View style={globalStyles.contentView}>
            <FlatList
            data={data}
            renderItem={(item) => renderItem(item)}
            keyExtractor={(item, index) => index.toString()}
            />
        </View>
  );
}

const styles = StyleSheet.create({});
