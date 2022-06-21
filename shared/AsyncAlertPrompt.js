import { Alert } from "react-native"
export const AsyncAlertPrompt = (title, msg) => new Promise((resolve)=>{
    Alert.prompt(title, msg,[
        {
            text:'Cancel',
            onPress:() =>resolve(null)
        },
        {
            text:'OK',
            onPress:(text) =>resolve(text)
        }
    ])
})