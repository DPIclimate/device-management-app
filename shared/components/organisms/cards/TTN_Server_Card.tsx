import React, { useContext, useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import globalStyles from "../../../../styles";
import Card from "../../atoms/Card";
import { GlobalContext } from "../../../context/GlobalContext";
import { write_app_server_to_storage, write_comm_server_to_storage } from "../../../functions/ManageLocStorage";
import { GlobalState_Actions, Regions } from "../../../types/CustomTypes";

export const TTN_Server_Card = (): JSX.Element => {
    const [state, dispatch] = useContext(GlobalContext);

    const [selected_app_server, set_selected_app_server] = useState<string>(state.application_server);
    const [selected_comm_server, set_selected_comm_server] = useState<string>(state.communication_server);

    const onAppServerChange = (serv: string): void => {
        set_selected_app_server(serv);
        dispatch({ type: GlobalState_Actions.SET_APPLICATION_SERVER, payload: serv });
        write_app_server_to_storage(serv);
    };

    const onCommServerChange = (serv: string): void => {
        dispatch({ type: GlobalState_Actions.SET_COMMUNICATION_SERVER, payload: serv });
        write_comm_server_to_storage(serv);
        set_selected_comm_server(serv);
    };
    return (
        <Card>
            <>
                <Text style={globalStyles.title}>TTN Server</Text>

                <Text style={styles.subTitle}>Applications/Devices</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <TouchableOpacity
                        style={[styles.serverButton, { backgroundColor: selected_app_server == Regions.EU1 ? "#c2c2c2" : "#f2f2f2" }]}
                        onPress={() => onAppServerChange(Regions.EU1)}
                    >
                        <Text style={styles.buttonText}>EU</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.serverButton, { backgroundColor: selected_app_server == Regions.AU1 ? "#c2c2c2" : "#f2f2f2" }]}
                        onPress={() => onAppServerChange(Regions.AU1)}
                    >
                        <Text style={styles.buttonText}>AU</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.serverButton, { backgroundColor: selected_app_server == Regions.NAM1 ? "#c2c2c2" : "#f2f2f2" }]}
                        onPress={() => onAppServerChange(Regions.NAM1)}
                    >
                        <Text style={styles.buttonText}>NAM</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subTitle}>Device communications</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <TouchableOpacity
                        style={[styles.serverButton, { backgroundColor: selected_comm_server == Regions.EU1 ? "#c2c2c2" : "#f2f2f2" }]}
                        onPress={() => onCommServerChange(Regions.EU1)}
                    >
                        <Text style={styles.buttonText}>EU</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.serverButton, { backgroundColor: selected_comm_server == Regions.AU1 ? "#c2c2c2" : "#f2f2f2" }]}
                        onPress={() => onCommServerChange(Regions.AU1)}
                    >
                        <Text style={styles.buttonText}>AU</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.serverButton, { backgroundColor: selected_comm_server == Regions.NAM1 ? "#c2c2c2" : "#f2f2f2" }]}
                        onPress={() => onCommServerChange(Regions.NAM1)}
                    >
                        <Text style={styles.buttonText}>NAM</Text>
                    </TouchableOpacity>
                </View>
            </>
        </Card>
    );
};

const styles = StyleSheet.create({
    subTitle: {
        paddingTop: 20,
        fontWeight: "bold",
    },
    text: {
        paddingTop: 10,
    },
    inputWborder: {
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 2,
        height: 40,
        padding: 5,
        width: "100%",
    },
    serverButton: {
        padding: 10,
        flex: 1,
        borderColor: "#dadada",
        borderWidth: 1,
        alignItems: "center",
        margin: 5,
        borderRadius: 5,
    },
    buttonText: {
        width: "100%",
        height: 20,
        textAlign: "center",
    },
});
