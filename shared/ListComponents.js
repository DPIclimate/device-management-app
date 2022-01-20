import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native'
import Card from './Card';
import globalStyles from '../styles';


const renderItem = ({ item }, handlePress, screen) => {
    // console.log('in render item', item)
    const id = item.id
    return(
        <View>
            <Card>
                <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => handlePress(item)}>
                    <Text style={globalStyles.text}>{id}</Text>

                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:30}}>
                        {item.isFav? <Image source={require('../assets/favBlue.png')} style={{height:20, width:20}}/>:<View/>}
                        <Image source={screen == "Applications" ? require('../assets/arrow.png') : require('../assets/arrowBlue.png')} style={{height:20, width:20}}/>
                    </View>
                </TouchableOpacity>
            </Card>
        </View>
    )
};

export default renderItem;