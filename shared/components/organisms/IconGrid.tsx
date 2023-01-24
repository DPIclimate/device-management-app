import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Col, Row } from "react-native-easy-grid";
import NavOptionsCard from "../atoms/NavOptionsCard";

interface IconGridProps {
    navigation: any;
}

export default function IconGrid({ navigation }: IconGridProps) {
    /*
        Grid of icons on home screen
    */

    return (
        <View style={styles.content}>
            <Row style={styles.row}>
                <Col style={[styles.col, {alignItems:'flex-end'}]}>
                    <NavOptionsCard
                        text={"Applications"}
                        image={require("../../../assets/appList.png")}
                        onPress={() => navigation.navigate("ApplicationsScreen")}
                    />
                </Col>
                <Col style={[styles.col, {alignItems:'flex-start'}]}>
                    <NavOptionsCard
                        text={"Nearby Devices"}
                        image={require("../../../assets/nearbyBlue.png")}
                        onPress={() => navigation.navigate("NearbyDevices")}
                    />
                </Col>
            </Row>
            <Row style={styles.row}>
                <Col style={[styles.col, {alignItems:'flex-end'}]}>
                    <NavOptionsCard
                        text={"Scan QR Code"}
                        image={require("../../../assets/qrCodeBlue.png")}
                        onPress={() => navigation.navigate("QrScanner", { screen: "ManageDeviceScreen" })}
                    />
                </Col>
                <Col style={[styles.col, {alignItems:'flex-start'}]}>
                    <NavOptionsCard
                        text={"Queue"}
                        image={require("../../../assets/uploadFailedBlue.png")}
                        onPress={() => navigation.navigate("SavedUpdatesScreen")}
                    />
                </Col>
            </Row>
            <Row style={styles.row}>
                <Col style={[styles.col, {alignItems:'flex-end'}]}>
                    <NavOptionsCard text={"Gateways"} image={require("../../../assets/gateway.png")} onPress={() => navigation.navigate("Gateways")} />
                </Col>
                <Col style={[styles.col, {alignItems:'flex-start'}]}>
                    <NavOptionsCard
                        text={"Create QR Code"}
                        image={require("../../../assets/add.png")}
                        onPress={() => navigation.navigate("CreateQRScreen")}
                    />
                </Col>
            </Row>
        </View>
    );
}

const styles = StyleSheet.create({
    content:{ 
        paddingTop: 20, 
        paddingRight: 10, 
        paddingLeft: 10 
    },
    row:{
        justifyContent:'center',
    },
    col:{
        alignItems:'center',
        margin:10
    }
});
