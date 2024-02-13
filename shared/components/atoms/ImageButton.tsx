import { StyleSheet, TouchableOpacity, Image, ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
import React from "react";

interface ImageButton {
    source: ImageSourcePropType;
    onPress(): void | Promise<void>;
    disabled?: boolean;
    style?:StyleProp<ImageStyle>
}

/**
 * Renders an image button component.
 *
 * @param {object} props - The component props.
 * @param {string} props.source - The image source.
 * @param {function} props.onPress - The function to be called when the button is pressed.
 * @param {boolean} [props.disabled=false] - Specifies whether the button is disabled.
 * @param {object} [props.style] - The custom styles to be applied to the button.
 * @returns {JSX.Element} The rendered ImageButton component.
 */
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
