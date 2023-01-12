import { Pressable, StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import Card from './Card';

interface NavOptionsCardProps{
    onPress():void,
    image:ImageSourcePropType,
    text:string
}

export default function NavOptionsCard({onPress, image, text}:NavOptionsCardProps) {
    return (
        <View style={{ width: 170 }}>
            <Pressable onPress={onPress}>
                <Card borderRadius={20}>
                    <View style={styles.content}>
                        <Image source={image} style={{ width: 60, height: 60 }} />
                        <Text style={styles.text}>{text}</Text>
                    </View>
                </Card>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    text:{
        paddingTop: 10, 
        fontSize: 15, 
        fontWeight: "bold"
    },
    content:{
        justifyContent: "center", 
        alignItems: "center", 
        height: 130
    }
})