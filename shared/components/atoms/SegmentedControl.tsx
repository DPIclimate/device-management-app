import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface SegmentedControlProps {
    options: string[];
    defaultIndex?: number;
    onChange: (index: number) => void;
}

export default function SegmentedControl({ options, defaultIndex=0, onChange }: SegmentedControlProps): JSX.Element {
    /*
        Segmented control component
    */

    const [activeIndex, setActiveIndex] = useState(defaultIndex);

    return (
        <View style={styles.container}>
            {options.map((option, index) => {
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.button, activeIndex === index && styles.activeButton]}
                        onPress={() => {
                            setActiveIndex(index);
                            onChange(index);
                        }}
                    >
                        <Text style={[styles.buttonText, activeIndex === index && styles.activeButtonText]}>{option}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = {
    container: {
        flexDirection: "row",
        marginTop: 15,
    },
    button: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: "#128cde",
        alignItems: "center",
        backgroundColor: "white",
        margin: 1,
    },
    activeButton: {
        backgroundColor: "#128cde",
    },
    buttonText: {
        color: "#007aff",
    },
    activeButtonText: {
        color: "white",
    },
};
