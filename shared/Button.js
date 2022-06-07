import { Text, TouchableOpacity } from "react-native"
//Syllable button since react native does not have one
export const Button = (props) =>{
    return (
        <TouchableOpacity style={props.buttonStyle} onPress={props.onSubmit}>
            <Text style={props.textStyle}>{props.children}</Text>
        </TouchableOpacity>
    )
}