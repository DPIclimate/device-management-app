import { Alert } from "react-native"

class ErrorClass{
    //Class to handle device registration errors
    constructor(code, message, deviceName){
        this.message = message
        this.code = code
        this.deviceName = deviceName
    }
    getReason(){
        return this.message
    }
    getErrorCode(){
        return this.code
    }
    getDeviceName(){
        return this.deviceName
    }
    alert(){
        Alert.alert("An error occured", `An error occured while trying to register device ${this.getDeviceName()}\nReason: ${this.getReason()}`);
    }
    alertWithCode(){
        Alert.alert("An error occured", `An error occured while trying to register device ${this.getDeviceName()}\nTTN error code: ${this.getErrorCode()} \nReason: ${this.getReason()}`);
    }
}
export default ErrorClass;