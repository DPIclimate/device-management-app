import { StyleSheet, Text, View, FlatList,TouchableOpacity, SafeAreaView } from 'react-native'
import React from 'react'
import Card from '../shared/Card';
import useFetchState from '../shared/useFetch.js';
import globalStyles from '../styles';
import moment from 'moment';

export default function Gateways() {

    const {data, isLoading, error, retry} = useFetchState(`${global.BASE_URL}/gateways`)

    const Last_seen = ({item}) =>{
        return(
            <View>
                <Text>{moment(new Date(item.updated_at)).format("DD/MM/YY hh:mm")}</Text>
            </View>
        )
    }
    const renderItem = ({item}) =>{
        return (
            <View>
                <Card>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => console.log("pressed")}>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={[globalStyles.text, {flex:1}]}>{item.ids.gateway_id}</Text>
                        <Last_seen item={item}/>
                    </TouchableOpacity>

                </Card>
            </View>
        )
    }

    return (
    <SafeAreaView style={globalStyles.screen}>

            <FlatList
            style={globalStyles.list}
            data={data?.gateways}
            renderItem={(item) => renderItem(item)}
            keyExtractor={(item, index) => index.toString()}
            onRefresh={() => {retry()}}
            refreshing={isLoading}

            />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})