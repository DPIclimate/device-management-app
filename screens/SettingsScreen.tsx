import React, { useContext, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Card from "../shared/components/atoms/Card";
import { LoadingComponent } from "../shared/components/atoms/LoadingComponent";
import { GlobalContext } from "../shared/context/GlobalContext";
import { validateToken } from "../shared/functions/InterfaceTTN";
import { write_app_server_to_storage, write_comm_server_to_storage, write_token_to_storage } from "../shared/functions/ManageLocStorage";
import { GlobalState_Actions, Regions } from "../shared/types/CustomTypes";
import globalStyles from "../styles";
import app_json from "../app.json";
import { Bearer_Help_Card } from "../shared/components/organisms/cards/Bearer_Help_Card";
import { DPI_TAG } from "../shared/components/atoms/DPI_Tag";
import CommServerCard from "../shared/components/molecules/CommServerCard";
import Button from "../shared/components/atoms/Button";

export function SettingsScreen({ route, navigation }): JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);

    const [token, changeToken] = useState<string>();
    const [validating, setValidating] = useState<boolean>(false);
    const [invalidToken, setInvalid] = useState<boolean>(false);

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
                <>
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
                    {validating ? <LoadingComponent isLoading={validating} /> : <Button onPress={handlePress} text={"Continue"} />}
                    {invalidToken && (
                        <Text style={[styles.text, styles.invalidText]}>Invalid TTN Bearer Token, please check that your token is correct.</Text>
                    )}
                </>
            </Card>
            <CommServerCard />
            <Bearer_Help_Card />
            <DPI_TAG />
            <View style={{ height: 50, alignItems: "center" }}>
                <Text>v{app_json["expo"]["version"]}</Text>
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
    text: {
        paddingBottom: 20,
        textAlign: "center",
    },
    invalidText: {
        color: "red",
    },
});
