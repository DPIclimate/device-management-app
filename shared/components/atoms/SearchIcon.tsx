import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/*
    Search icon that appears in applications and devices screen

*/

/**
 * Renders a search icon component.
 * @param {Object} setShow - A function to toggle the visibility of the search component.
 * @returns {JSX.Element} The rendered search icon component.
 */
export default function SearchIcon({setShow}) {
    const insets = useSafeAreaInsets();

    return (
        <Pressable style={[styles.searchIcon, { bottom: insets.bottom + 20, right: 10 }]} onPress={() => setShow((prev) => !prev)}>
            <Image source={require("../../../assets/search.png")} style={{ width: 40, height: 40 }} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    searchIcon: {
        position: "absolute",
        backgroundColor: "white",
        borderRadius: 50,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e6e6e6",
    },
});
