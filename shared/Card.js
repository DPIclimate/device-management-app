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
            borderRadius: 8,
            elevation: 3,
            backgroundColor: props.colour == undefined ?'#fff': props.colour,
            shadowOffset: { width: 1, height: 1 },
            shadowColor: '#ccc',
            shadowOpacity: 0.3,
            shadowRadius: 2,
            marginVertical: 8,
            marginHorizontal: 4,
        },
        cardInner: {
            marginVertical: 10,
            marginHorizontal: 18,
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