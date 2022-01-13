import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native'
import Card from './Card';
import globalStyles from '../styles';


const renderItem = ({ item }, handlePress, screen) => {
    return(
    <Card>
        <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => handlePress(item)}>
            <Text style={globalStyles.text}>{item}</Text>

            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:30}}>
                <Image source={screen == "Applications" ? require('../assets/arrow.png') : require('../assets/arrowBlue.png')} style={{height:20, width:20}}/>
            </View>
        </TouchableOpacity>
    </Card>
    )
};

export default renderItem;