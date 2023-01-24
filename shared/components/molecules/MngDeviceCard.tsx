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
