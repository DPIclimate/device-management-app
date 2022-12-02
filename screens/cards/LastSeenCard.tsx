import { StyleSheet, Text, View, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Card from "../../shared/components/Card";
import { ManageDeviceContext } from "../../shared/context/ManageDeviceContext";
import { GlobalContext } from "../../shared/context/GlobalContext";

const circles = {
    RED_HOLLOW: require("../../assets/redCircle-hollow.png"),
    ORANGE_HOLLOW: require("../../assets/orangeCircle-hollow.png"),
    GREEN_HOLLOW: require("../../assets/greenCircle-hollow.png"),
    RED_FILLED: require("../../assets/redCircle.png"),
    ORANGE_FILLED: require("../../assets/orangeCircle.png"),
    GREEN_FILLED: require("../../assets/greenCircle.png"),
    BLUE_HOLLOW: require("../../assets/blueCircle-hollow.png"),
};

export default function LastSeenCard() {

    
    const {device_state, set_device_state, device_comm_data} = useContext(ManageDeviceContext);

    const [state, dispatch] = useContext(GlobalContext);

    const [lastSeenText, setLastSeenText] = useState("loading..."); //Last seen text
    const [circleImg, setCircle] = useState(circles.BLUE_HOLLOW);

    useEffect(() => {
        if (device_comm_data.isLoading) return;
        calcLastSeen();
    }, [device_comm_data]);

    const calcLastSeen = () => {
        /*
        Calculates how long ago device was last seen, and sets the appropriate states for 'lastSeen' and 'circleImg'
        
        */

        if (device_comm_data.data.length != 0) {
            const recent = new Date(device_comm_data.data[0].time);
            const now = new Date();
            const diff = (now.getTime() - recent.getTime()) / 1000 / 60;

            if (diff < 1) {
                setLastSeenText(`<1 min ago`);
            } else if (diff < 2) {
                setLastSeenText(`${Math.floor(diff)} min ago`);
            } else if (diff < 60) {
                setLastSeenText(`${Math.floor(diff)} mins ago`);
            } else if (diff < 1440) {
                setLastSeenText(`${Math.floor(diff / 60)} hour(s) ago`);
            } else {
                setLastSeenText(`${Math.floor(diff / 60 / 24)} day(s) ago`);
            }

            if (diff / 60 > 12) {
                state.network_status ? setCircle(circles.RED_FILLED) : setCircle(circles.RED_HOLLOW);
            } else if (diff / 60 > 2) {
                state.network_status ? setCircle(circles.ORANGE_FILLED) : setCircle(circles.ORANGE_HOLLOW);
            } else {
                state.network_status ? setCircle(circles.GREEN_FILLED) : setCircle(circles.GREEN_HOLLOW);
            }

            return;
        }

        if (state.network_status) {
            setLastSeenText(`Never`);
        } else {
            setLastSeenText("Unknown");
        }
        state.network_status ? setCircle(circles.RED_FILLED) : setCircle(circles.RED_HOLLOW);
    };

    return (
        <Card>
            <View style={styles.card}>
                <Image style={styles.lastSeenImg} source={circleImg} />
                <Text style={styles.text}>Last seen:</Text>
                {device_comm_data.isLoading ? (
                    <Image style={styles.lastSeenLoading} source={require("../../assets/loading.gif")} />
                ) : (
                    <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
                        {lastSeenText}
                    </Text>
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    lastSeenImg: {
        width: 15,
        height: 15,
        marginRight: 10,
    },
    lastSeenLoading: {
        width: 30,
        height: 30,
    },
    card: {
        alignItems: "center",
        flexDirection: "row",
    },
    text: {
        fontSize: 17,
        marginRight: 10,
    },
});
