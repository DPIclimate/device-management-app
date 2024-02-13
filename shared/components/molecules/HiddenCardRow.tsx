import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import Card from '../atoms/Card';

interface HiddenCardRowParams{
    isFav:boolean
    onPress():void | Promise<void>
}
/**
 * Renders a hidden card row component.
 * 
 * @param {Object} props - The component props.
 * @param {boolean} props.isFav - Indicates whether the card is a favorite.
 * @param {Function} props.onPress - The function to be called when the card is pressed.
 * @returns {JSX.Element} The rendered hidden card row component.
 */
export default function HiddenCardRow({isFav, onPress}:HiddenCardRowParams) {

    return (
        <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
                style={styles.button}
                onPress={onPress}
                activeOpacity={0.6}
            >
                <Card style={styles.card}>
                    
                    <Image
                        style={styles.image}
                        resizeMode="contain"
                        source={isFav ? require("../../../assets/favourite.png") : require("../../../assets/notFavourite.png")}
                    />
                </Card>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    button:{
        height: "100%", 
        width: 80, 
        justifyContent: "center"
    },
    card:{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:'#1396ED'
    },
    image:{
        height: "100%", 
        width: 40
    }
})