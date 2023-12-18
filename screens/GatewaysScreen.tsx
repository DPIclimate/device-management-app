import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native";
import React, { useContext } from "react";
import Card from "../shared/components/atoms/Card";
import globalStyles from "../styles";
import { GlobalContext } from "../shared/context/GlobalContext";
import { useFetch } from "../shared/hooks/useFetch";
import { APIGatewayResponse } from "../shared/types/APIResponseTypes";
import { useGateways } from "../shared/hooks/useGateways";

export default function GatewaysScreen(): JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);

    const {response, isLoading, error, retry} = useGateways()

    const calcLastSeen = (lastSeen: Date): number => {
        const now = new Date();
        const diffInMilliseconds = now.getTime() - lastSeen.getTime();
        const diffInHours = diffInMilliseconds / (1000 * 60);
        return Math.floor(diffInHours);
    };

    const renderItem = ({ item, index }) => {
        const gateway: APIGatewayResponse = item;
        return (
            <Card>
                <>
                <Text style={{ alignSelf: "flex-end" }}>{calcLastSeen(new Date(gateway.updated_at))} min(s) ago</Text>
                <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>Gateway ID:</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail">
                        {gateway.ids.gateway_id}
                    </Text>
                </View>
                <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>Name:</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail">
                        {gateway.name}
                    </Text>
                </View>
                <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>Description:</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail">
                        {gateway.description}
                    </Text>
                </View>
                </>
            </Card>
        );
    };

    return (
        <SafeAreaView style={globalStyles.screen}>
            <FlatList
                style={globalStyles.list}
                data={(response as APIGatewayResponse[])?.sort((a, b) => {
                    if (calcLastSeen(new Date(a.updated_at)) < calcLastSeen(new Date(b.updated_at))){
                        return -1;
                    }
                })}
                renderItem={(item) => renderItem(item)}
                keyExtractor={(item, index) => index.toString()}
                onRefresh={retry}
                refreshing={isLoading}
                contentContainerStyle={{
                    paddingBottom:20
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    cardRow: {
        flexDirection: "row",
        marginTop:10
    },
    cardTitle:{
        fontWeight:'bold',
        marginRight:10
    }
});
