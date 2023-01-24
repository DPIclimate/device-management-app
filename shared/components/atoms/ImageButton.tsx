import { StyleSheet, TouchableOpacity, Image, ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
import React from "react";

interface ImageButton {
    source: ImageSourcePropType;
    onPress(): void | Promise<void>;
    disabled?: boolean;
    style?:StyleProp<ImageStyle>
}

export default function ImageButton({ source, onPress, disabled = false, style }: ImageButton): JSX.Element {
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled}>
            <Image resizeMode="contain" style={[styles.image, style]} source={source} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 40,
        height: 40,
        padding: 10,
    },
});
