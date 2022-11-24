import React from 'react';
import {View, Text, TouchableOpacity, Image, ListRenderItemInfo} from 'react-native'
import Card from '../Card';
import globalStyles from '../../styles';
import { Application, Device } from '../types/CustomTypes';
import { RowMap } from 'react-native-swipe-list-view';


export const renderItem = ({ item }:ListRenderItemInfo<Application|Device>, handlePress:(item:Application)=>void, screen:string):JSX.Element => {

    const id = item.id
    const name = item?.name

    return(
        <View>
            <Card>
                <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', height:30}} onPress={() => handlePress(item)}>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={[globalStyles.text, {flex:1}]}>{id}</Text>
                    {screen !='Applications'&&<Text style={{fontStyle:'italic', fontSize:12, flex:1}} numberOfLines={1} ellipsizeMode='tail'>     {name}</Text>}

                    {item.isFav? <Image source={require('../../assets/favBlue.png')} style={{height:20, width:20, marginRight:20}}/>:<View style={{height:20, width:20, marginRight:20}}/>}
                    <Image source={screen == "Applications" ? require('../../assets/arrow.png') : require('../../assets/arrowBlue.png')} style={{height:20, width:20}}/>
                </TouchableOpacity>
            </Card>
        </View>
    )
};
export const renderHiddenItem = (data:ListRenderItemInfo<Application>, rowMap:RowMap<Application>, toggleFavorite:(data: any, rowMap: any) => Promise<void>):JSX.Element=>{

    let id = data.item.id
    const isFavourite = data.item.isFav

    return (
        <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={{height:'100%', width:80, justifyContent:'center'}} onPress={() => toggleFavorite(data, rowMap)} activeOpacity={0.6}>
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
