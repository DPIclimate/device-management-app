import React, { useContext, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Card from "../shared/components/Card";
import { LoadingComponent } from "../shared/components/LoadingComponent";
import { GlobalContext } from "../shared/context/GlobalContext";
import { validateToken } from "../shared/functions/InterfaceTTN";
import { write_app_server_to_storage, write_comm_server_to_storage, write_token_to_storage } from "../shared/functions/ManageLocStorage";
import { GlobalState_Actions, Regions } from "../shared/types/CustomTypes";
import globalStyles from "../styles";
import version from "../app.json";
import { Bearer_Help_Card } from "../shared/components/Bearer_Help_Card";
import { DPI_TAG } from "../shared/components/DPI_Tag";

export function SettingsScreen({ route, navigation }): JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);

    const [token, changeToken] = useState<string>();
    const [validating, setValidating] = useState<boolean>(false);
    const [invalidToken, setInvalid] = useState<boolean>(false);

    const handleServerChange = async(server: string):Promise<void> => {

        dispatch({type:GlobalState_Actions.SET_COMMUNICATION_SERVER, payload:server})
        await write_comm_server_to_storage(server)
    };

    const redacted = (token: string): string => {
        const noBearer = token.replace("Bearer ", "");
        const token_redacted = noBearer.replace(/\.[a-zA-Z0-9]*\.[a-zA-Z0-9]{47}/, "..................");
        return token_redacted;
    };

    const handlePress = () => {
        if (!token) return;
        Alert.alert("Are you sure?", "Are you sure you want to change your TTN bearer token?", [
            {
                text: "Yes",
                onPress: () => handleYes(token),
            },
            {
                text: "No",
                onPress: () => console.log("no"),
            },
        ]);
    };
    const handleYes = async (token) => {
        setValidating(true);
        setInvalid(false);

        const validation = await validateToken(token);

        if (validation.success) {
            console.log("token is valid");

            const tmpToken = token.replace("Bearer ", ""); //Does not matter whether user includes the word Bearer or not
            const bToken = `Bearer ${tmpToken}`;

            dispatch({ type: GlobalState_Actions.SET_AUTH_TOKEN, payload: bToken });
            dispatch({ type: GlobalState_Actions.SET_TOKEN_VALID, payload: true });
            await write_token_to_storage(token);

            dispatch({ type: GlobalState_Actions.SET_APPLICATION_SERVER, payload: validation.server });
            await write_app_server_to_storage(validation.server);

            setValidating(false);
            changeToken(null);

            Alert.alert("Success", "Token successfully updated");
        } else {
            setInvalid(true);
            setValidating(false);
        }
    };

    return (
        <ScrollView style={globalStyles.screen}>
            <Card>
                <Text style={styles.cardTitle}>TTN Token</Text>

                <View style={styles.separatorLine} />

                <Text style={styles.title}>Current Token:</Text>
                <Text>{redacted(state.ttn_auth_token)}</Text>
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
                {invalidToken && (
                    <Text style={[styles.text, styles.invalidText]}>Invalid TTN Bearer Token, please check that your token is correct.</Text>
                )}
            </Card>
            <Card>
                <Text style={styles.cardTitle}>Communications Server</Text>

                <View style={styles.separatorLine} />

                <View style={styles.commsOptions}>
                    <Pressable
                        onPress={() => handleServerChange(Regions.EU1)}
                        style={state.communication_server == Regions.EU1 ? styles.exclusiveOptsSelected : styles.exclusiveOpts}
                    >
                        <Text style={state.communication_server == Regions.EU1 ? styles.exclusiveOptsSelectedTxt : styles.exclusiveOptsText}>EU1</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => handleServerChange(Regions.AU1)}
                        style={state.communication_server == Regions.AU1 ? styles.exclusiveOptsSelected : styles.exclusiveOpts}
                    >
                        <Text style={state.communication_server == Regions.AU1 ? styles.exclusiveOptsSelectedTxt : styles.exclusiveOptsText}>AU1</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => handleServerChange(Regions.NAM1)}
                        style={state.communication_server == Regions.NAM1 ? styles.exclusiveOptsSelected : styles.exclusiveOpts}
                    >
                        <Text style={state.communication_server == Regions.NAM1 ? styles.exclusiveOptsSelectedTxt : styles.exclusiveOptsText}>NAM1</Text>
                    </Pressable>
                </View>
            </Card>
            <Bearer_Help_Card />
            <DPI_TAG />
            <View style={{ height: 50, alignItems: "center" }}>
                <Text>v{version["expo"]["version"]}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    cardTitle: {
        fontWeight: "bold",
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    separatorLine: {
        width: "80%",
        height: 2,
        backgroundColor: "#128cde",
        alignSelf: "flex-start",
    },
    title: {
        fontWeight: "bold",
        fontSize: 15,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "black",
        padding: 10,
        marginTop: 20,
        borderRadius: 25,
    },
    submit: {
        backgroundColor: "#128cde",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 50,
        margin: 20,
    },
    submitText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
        padding: 10,
    },
    text: {
        paddingBottom: 20,
        textAlign: "center",
    },
    invalidText: {
        color: "red",
    },
    exclusiveOpts: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#128cde",
        flex: 1,
        alignItems: "center",
        backgroundColor: "white",
        margin: 1,
    },
    exclusiveOptsSelected: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#128cde",
        flex: 1,
        alignItems: "center",
        backgroundColor: "#128cde",
        margin: 1,
    },
    exclusiveOptsText: {
        color: "#128cde",
    },
    exclusiveOptsSelectedTxt: {
        color: "white",
    },
    commsOptions:{
        flexDirection:'row',
        marginTop:15
    }
});
