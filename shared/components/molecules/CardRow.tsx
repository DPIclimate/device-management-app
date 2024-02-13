import { StyleSheet, Text, TouchableOpacity, View, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import Card from '../atoms/Card'

interface CardRowParams{
    title:string,
    text?:string,
    isFav:boolean
    arrowImg:ImageSourcePropType
    onPress():void | Promise<void>
}

/**
 * Card row component for list such as applications and devices
 * 
 * @param title - The title of the card row
 * @param text - The text content of the card row
 * @param isFav - A boolean indicating whether the card row is marked as favorite
 * @param arrowImg - The image source for the arrow icon
 * @param onPress - The function to be called when the card row is pressed
 * 
 * @returns The rendered CardRow component
 */
export default function CardRow({title, text, isFav, arrowImg, onPress}:CardRowParams) {
    
    /*
        Card row component for list such as applications and devices
    */

  return (
    <Card> 
        <TouchableOpacity style={styles.rowItem} onPress={onPress}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
                {title}
            </Text>

            {text && (
                <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
                    {" "}
                    {text}
                </Text>
            )}

            {isFav ? (
                <Image source={require("../../../assets/favBlue.png")} style={styles.favImg} />
            ) : (
                <View style={styles.favImg} />
            )}
            <Image
                source={arrowImg}
                style={{ height: 20, width: 20 }}
            />
        </TouchableOpacity>
        </Card>
  )
}

const styles = StyleSheet.create({
    title:{
        flex: 1
    },
    text:{
        fontStyle: "italic", 
        fontSize: 12, 
        flex: 1
    },
    favImg:{ 
        height: 20, 
        width: 20, 
        marginRight: 20 
    },

    rowItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 30
    }
})