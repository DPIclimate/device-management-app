import React, { useEffect, useState } from 'react';
import {View, SafeAreaView, Pressable, Text, StyleSheet, TouchableOpacity, Image, TouchableHighlight} from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import globalStyles from '../styles';
import config from '../config.json'
import Card from '../shared/Card';
import LoadingComponent from '../shared/LoadingComponent';

function Applications({navigation}) {

    const [data, changeData] = useState({});
    const [isLoading, setLoading] = useState(true)
    
    useEffect(()=>{
        getApplications()
    },[])

    const getApplications = async() => {

        const url = `${config.ttnBaseURL}`
        let response = await fetch(url, {
            method:"GET",
            headers:config.headers
        }).then((response) => response.json())

        response = response['applications']
        const apps = response.map((app) => app['ids']['application_id'])
        changeData(apps)
        setLoading(false)
    }
    
    
    const renderItem = ({ item }) => (
        <Card>
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => navigation.navigate('Devices',{application_id: item})}>
                <Text style={globalStyles.text}>{item}</Text>
                <Image source={require('../assets/arrow.png')} style={{height:20, width:20}}/>
            </TouchableOpacity>
        </Card>
      );

    return (
        <View style={globalStyles.screen}>
            <Text style={[globalStyles.title,{padding:10, paddingTop:25}]}>Applications</Text>
            <View style={{width:45, height:45, position:'absolute', right:0, top:0, margin:10}} >
                <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => console.log("offline pressed")}>
                    <Image style={{width:'100%', height:'100%', borderRadius:50}} source={require('../assets/uploadFailed.png')}/>
                </TouchableHighlight>
            </View>

                <LoadingComponent loading={isLoading}/>

                <FlatList
                style={[{flex:1},globalStyles.list]} 
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                />
            <View style={{flex:0.15}}>
                <Pressable style={[globalStyles.button, styles.addDeviceLoc]} onPress={() => {navigation.navigate('AddDeviceScreen')}}>
                    <Text style={globalStyles.buttonText}>Add Device</Text>
                </Pressable>

                <Pressable style={[globalStyles.button, styles.manDeviceLoc]} onPress={() => {navigation.navigate('ManageDevices')}}>
                    <Text style={globalStyles.buttonText}>Manage</Text>
                </Pressable>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    
    title:{
        fontSize:20,
        paddingTop:20,
        width:'100%',
        alignItems:'flex-end',
        fontWeight:'bold',
    },
    addDeviceLoc:{
        position:'absolute',
        left:20, 
        bottom:20,
        height:45,
        width:'40%'
    },
    manDeviceLoc:{
        position:'absolute',
        right:20, 
        bottom:20,
        height:45,
        width:'40%'

    }
});
export default Applications;