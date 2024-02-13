import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Card from "../atoms/Card";
import { APIApplicationsResponse } from "../../types/APIResponseTypes";
import { Picker } from "@react-native-picker/picker";

/**
 * A picker component inside a card component.
 *
 * @param selectedValue - The currently selected value of the picker.
 * @param onValueChange - A callback function to handle value changes in the picker.
 * @param items - An array of items to be displayed in the picker.
 * @returns The rendered PickerCard component.
 */
export default function PickerCard({ selectedValue, onValueChange, items }) {
    /*
        A picker component inside a card component

    */

    return (
        <View style={{ width: "100%", padding: 20 }}>
            <Card>
                <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
                    {items?.map((item) => {
                        return <Picker.Item key={item} label={item} value={item} />;
                    })}
                </Picker>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({});
