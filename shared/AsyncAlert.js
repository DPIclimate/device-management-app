import { Alert } from "react-native"
export const AsyncAlert = (title, msg, buttons) => new Promise((resolve)=>{
    Alert.alert(title, msg,[
        {
            text:'Yes',
            onPress:() =>resolve('YES')
        },
        {
            text:'No',
            onPress:() =>resolve(null)
        }
    ])
})