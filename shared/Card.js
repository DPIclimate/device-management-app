import React from 'react';
import { StyleSheet, View} from 'react-native';

/**
 * Creates a card with rounded corners and slight shadow
 * @param {*} props 
 * @returns 
 */
const Card = (props) => {
    return (
        <View style={props.red == undefined? styles.card: styles.cardRed}>
            <View style={styles.cardInner}>
                { props.children }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        elevation: 3,
        backgroundColor: '#fff',
        shadowOffset: { width: 1, height: 1 },
        shadowColor: '#ccc',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        marginVertical: 8,
        marginHorizontal: 4,
    },
    cardRed:{
        borderRadius: 8,
        elevation: 3,
        backgroundColor: 'red',
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

export default Card;