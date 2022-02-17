import { Alert } from "react-native"

class ErrorClass{
    //Class to handle device registration errors
    constructor(code, message, deviceID){
        this.message = message
        this.code = code
        this.deviceID = deviceID
    }
    getReason(){
        return this.message
    }
    getErrorCode(){
        return this.code
    }
    getDeviceID(){
        return this.deviceID
    }
    alert(){
        Alert.alert("An error occured", `An error occured while trying to register device ${this.getDeviceID()}\nReason: ${this.getReason()}`);
    }
    alertWithCode(){
        Alert.alert("An error occured", `An error occured while trying to register device ${this.getDeviceID()}\nTTN error code: ${this.getErrorCode()} \nReason: ${this.getReason()}`);
    }
}
export default ErrorClass;