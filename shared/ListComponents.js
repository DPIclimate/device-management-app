import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native'
import Card from './Card';
import globalStyles from '../styles';


const renderItem = ({ item }, handlePress, screen) => {

    const id = item.id
    return(
        <View>
            <Card>
                <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => handlePress(item)}>
                    <Text style={globalStyles.text}>{id}</Text>

                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:30}}>
                        {item.isFav? <Image source={require('../assets/favBlue.png')} style={{height:20, width:20, marginRight:20}}/>:<View/>}
                        <Image source={screen == "Applications" ? require('../assets/arrow.png') : require('../assets/arrowBlue.png')} style={{height:20, width:20}}/>
                    </View>
                </TouchableOpacity>
            </Card>
        </View>
    )
};
const renderHiddenItem = (data, rowMap, toggleFavourite)=>{

    let id = data.item.id
    const isFavourite = data.item.isFav

    return (
        <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={{height:'100%', width:80, justifyContent:'center'}} onPress={() => toggleFavourite(data, rowMap)} activeOpacity={0.6}>
                <Card colour={'#1396ED'}>
                    <View style={{height:'100%', width:'100%', justifyContent:'center', alignItems:'center'}}> 
                        <Image style={{height:'130%', width:40}} resizeMode='contain' source={isFavourite == true? require('../assets/favourite.png'):require('../assets/notFavourite.png')}/>
                    </View>
                </Card>
            </TouchableOpacity>

            <View style={{flex:1}}/>
        </View>        
    )

}


export default renderItem;
export {renderHiddenItem};