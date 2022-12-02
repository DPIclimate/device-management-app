import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import Card from "../../shared/components/Card";
import { GlobalContext } from "../../shared/context/GlobalContext";
import { write_comm_server_to_storage } from "../../shared/functions/ManageLocStorage";
import { GlobalState_Actions, Regions } from "../../shared/types/CustomTypes";

export default function CommServerCard() {
    const [state, dispatch] = useContext(GlobalContext);

    console.log(state)
    const handleServerChange = async(server: string):Promise<void> => {

        dispatch({type:GlobalState_Actions.SET_COMMUNICATION_SERVER, payload:server})
        await write_comm_server_to_storage(server)
    };
    
    return (
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

    commsOptions:{
        flexDirection:'row',
        marginTop:15
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
});
