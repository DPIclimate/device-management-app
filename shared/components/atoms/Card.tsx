import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

interface CardParams{
    color?:string
    borderRadius?:number
    children:JSX.Element
    style?:StyleProp<ViewStyle>
}

/**
 * A customizable card component.
 *
 * @param color - The background color of the card. Default is "#fff".
 * @param borderRadius - The border radius of the card. Default is 15.
 * @param style - Additional styles to apply to the card.
 * @param children - The content of the card.
 * @returns The rendered card component.
 */
const Card = ({color="#fff", borderRadius=15, style, children}:CardParams):JSX.Element => {
    
    const styles = StyleSheet.create({
        card: {
            borderRadius: borderRadius,
            elevation: 3,
            backgroundColor: color,
            shadowOffset: { width: 1, height: 1 },
            shadowColor: '#ccc',
            shadowOpacity: 0.3,
            shadowRadius: 2,
            marginVertical: 5,
            marginHorizontal: 5,
        },
        cardInner: {
            paddingLeft:20,
            paddingRight:20,
            paddingTop:10,
            paddingBottom:10
        }
    });
    
    return (
        <View style={[styles.card, style]}>
            <View style={styles.cardInner}>
                { children }
            </View>
        </View>
    )
}


export default Card;