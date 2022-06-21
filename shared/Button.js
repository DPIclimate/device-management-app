import { Text, TouchableOpacity, StyleSheet } from "react-native"
//Syllable button since react native does not have one
export const Button = (props) =>{
    return (
        <TouchableOpacity disabled={props.disabled} style={props.buttonStyle? props.buttonStyle : styles.submitButton} onPress={props.onSubmit}>
            <Text style={props.textStyle? props.textStyle:styles.submitButtonText}>{props.children}</Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    submitButton:{
        width:'100%',
        textAlign:'center',
        marginTop:25,
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#1396ed',
        borderRadius:25,
        justifyContent:'center',
    },
    submitButtonText:{
        color:'white',
        textAlign:'center',
        fontWeight:'bold',
        fontSize:15
    }
});