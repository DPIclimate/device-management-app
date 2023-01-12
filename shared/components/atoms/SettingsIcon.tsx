import React from "react";
import { TouchableOpacity, Image } from "react-native";
import globalStyles from "../../../styles";

export default function SettingsIcon ({navigation}): JSX.Element {
    return (
        <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
            <Image source={require("../../../assets/settingsWhite.png")} style={globalStyles.headerIcon} />
        </TouchableOpacity>
    );
};