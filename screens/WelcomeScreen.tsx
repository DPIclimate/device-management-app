import React, { useContext, useState } from "react";
import { Text, StyleSheet, TextInput, ScrollView, View } from "react-native";
import { write_app_server_to_storage, write_token_to_storage } from "../shared/functions/ManageLocStorage";
import globalStyles from "../styles";
import { GlobalContext } from "../shared/context/GlobalContext";
import { GlobalState_Actions } from "../shared/types/CustomTypes";
import { LoadingComponent } from "../shared/components/LoadingComponent";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Bearer_Help_Card } from "../shared/components/Bearer_Help_Card";
import { DPI_TAG } from "../shared/components/DPI_Tag";
import { validateToken } from "../shared/functions/InterfaceTTN";

export const WelcomeScreen = ({visible}): JSX.Element => {
    const [state, dispatch] = useContext(GlobalContext);

    const [token, changeToken] = useState<string>("");
    const [invalidToken, setInvalid] = useState<boolean>(false);
    const [validating, setValidating] = useState<boolean>(false);

    const handlePress = async ():Promise<void> => {
        
        if (!token) return
        setValidating(true)
        const validation = await validateToken(token);
        
        if (validation.success) {
            console.log("token is valid");

            const tmpToken = token.replace("Bearer ", ""); //Does not matter whether user includes the word Bearer or not
            const bToken = `Bearer ${tmpToken}`;
            
            dispatch({ type: GlobalState_Actions.SET_AUTH_TOKEN, payload: bToken });
            dispatch({ type: GlobalState_Actions.SET_TOKEN_VALID, payload: true });
            await write_token_to_storage(token);

            dispatch({ type: GlobalState_Actions.SET_APPLICATION_SERVER, payload: validation.server });
            dispatch({ type: GlobalState_Actions.SET_COMMUNICATION_SERVER, payload: validation.server });
            
            await write_app_server_to_storage(validation.server);

            setValidating(false)
            visible(false);
        } else {
            setInvalid(true);
            setValidating(false);
            dispatch({ type: GlobalState_Actions.SET_TOKEN_VALID, payload: false });
            setValidating(false)
        }
        
    };

    return (
        <ScrollView style={globalStyles.screen} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.text}>To get started please enter your TTN Bearer Token in the space below</Text>

            <TextInput
                value={token}
                placeholder="e.g NNSXS.ABCDEF........."
                style={styles.input}
                onChangeText={changeToken}
                autoCorrect={false}
                autoCapitalize="none"
            />
            {validating ? (
                <LoadingComponent isLoading={validating} />
            ) : (
                <TouchableOpacity style={styles.submit} onPress={() => handlePress()}>
                    <Text style={styles.submitText}>Continue</Text>
                </TouchableOpacity>
            )} 

            {invalidToken&&
                <Text style={[styles.text, styles.invalidText]}>Invalid TTN Bearer Token, please check that your token is correct.</Text>
                }
                
            <Bearer_Help_Card/>
            <DPI_TAG/>
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    title: {
        paddingBottom: 30,
        paddingTop: 10,
        alignSelf: "center",
        fontWeight: "bold",
        fontSize: 25,
    },
    text: {
        paddingBottom: 20,
        textAlign: "center",
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "black",
        padding: 10,
    },
    submit: {
        backgroundColor: "#128cde",
        width: "80%",
        justifyContent: "center",
        alignItems:'center',
        alignSelf:'center',
        borderRadius:50,
        margin:20
    },
    submitText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
        padding: 10,
    },
    invalidText:{
        color:'red'
    }
});
