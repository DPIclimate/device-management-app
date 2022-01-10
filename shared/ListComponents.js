import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native'
import Card from './Card';
import globalStyles from '../styles';


const renderItem = ({ item }, handlePress, isConnected) => {
    return(
    <Card>
        <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => handlePress(item)}>
            <Text style={globalStyles.text}>{item}</Text>

            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:30}}>
                <View style={{width:40, height:30, paddingRight:10}}>
                    <Connection status={isConnected}/>
                </View>
                <Image source={require('../assets/arrow.png')} style={{height:20, width:20}}/>
            </View>
        </TouchableOpacity>
    </Card>
    )
};
const Connection = (props) =>{
    if (props.status){
        return null

    }else{
        return(
                <Image style={{width:'100%', height:'100%'}} source={require('../assets/storage.png')}/>
        );
    }
}
export default renderItem;