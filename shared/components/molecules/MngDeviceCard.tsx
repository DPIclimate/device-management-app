import { StyleSheet, Text, TouchableOpacity, View, Image, ImageSourcePropType } from "react-native";
import React from "react";
import Card from "../atoms/Card";
import SeparatorLine from "../atoms/SeparatorLine";
import ImageButton from "../atoms/ImageButton";

interface MngDeviceCardProps {
    title: string;
    iconImg?: ImageSourcePropType;
    onIconPress?(): void | Promise<void>;
    isLoading?: boolean;
    children: JSX.Element;
}

/**
 * Renders a management device card component.
 *
 * @param {MngDeviceCardProps} props - The component props.
 * @param {string} props.title - The title of the card.
 * @param {ReactNode} props.children - The content of the card.
 * @param {string | null} [props.iconImg=null] - The image source for the icon.
 * @param {() => void | null} [props.onIconPress=null] - The callback function when the icon is pressed.
 * @param {boolean} [props.isLoading=false] - Indicates if the card is in a loading state.
 * @returns {JSX.Element} The rendered management device card component.
 */
export default function MngDeviceCard({ title, children, iconImg = null, onIconPress = null, isLoading = false }: MngDeviceCardProps) {
    return (
        <Card>
            <View style={styles.content}>
                <View style={styles.heading}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    {iconImg && onIconPress && <ImageButton source={iconImg} onPress={onIconPress} disabled={isLoading} />}
                </View>

                <SeparatorLine />

                {children}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    heading: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardTitle: {
        fontWeight: "bold",
        fontSize: 20,
    },
    content: {
        marginTop: 10,
        marginBottom:10,
    },
});
