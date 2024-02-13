import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import Card from "../atoms/Card";
import { GlobalContext } from "../../context/GlobalContext";
import { write_comm_server_to_storage } from "../../functions/ManageLocStorage";
import { GlobalState_Actions, Regions } from "../../types/CustomTypes";
import SegmentedControl from "../atoms/SegmentedControl";
import SeparatorLine from "../atoms/SeparatorLine";

/**
 * Renders a card component for selecting a communication server.
 * 
 * @returns The rendered CommServerCard component.
 */
export default function CommServerCard() {
    const [state, dispatch] = useContext(GlobalContext);

    const handleServerChange = async (server: string): Promise<void> => {
        dispatch({ type: GlobalState_Actions.SET_COMMUNICATION_SERVER, payload: server });
        await write_comm_server_to_storage(server);
    };

    return (
        <Card>
            <>
                <Text style={styles.cardTitle}>Communications Server</Text>
                <SeparatorLine/>
                <SegmentedControl
                    defaultIndex={Object.values(Regions).indexOf(state.communication_server)}
                    options={Object.keys(Regions)}
                    onChange={(index) => handleServerChange(Object.values(Regions)[index])}
                />
            </>
        </Card>
    );
}

const styles = StyleSheet.create({
    cardTitle: {
        fontWeight: "bold",
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
    }
});
