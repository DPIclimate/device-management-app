import React from 'react';
import { StyleSheet, View} from 'react-native';

/**
 * Creates a card with rounded corners and slight shadow
 * @param {*} props 
 * @returns 
 */
const Card = (props) => {
    
    const styles = StyleSheet.create({
        card: {
            borderRadius: props.borderRadius ? props.borderRadius : 15,
            elevation: 3,
            backgroundColor: props.colour == undefined ?'#fff': props.colour,
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
        <View style={styles.card}>
            <View style={styles.cardInner}>
                { props.children }
            </View>
        </View>
    )
}


export default Card;