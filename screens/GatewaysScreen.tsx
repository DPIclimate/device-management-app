import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native";
import React, { useContext } from "react";
import Card from "../shared/components/atoms/Card";
import globalStyles from "../styles";
import { GlobalContext } from "../shared/context/GlobalContext";
import { useFetch } from "../shared/hooks/useFetch";
import { APIGatewayResponse } from "../shared/types/APIResponseTypes";

export default function GatewaysScreen(): JSX.Element {
    const [state, dispatch] = useContext(GlobalContext);

    const { response, isLoading, error, retry } = useFetch(`${state.application_server}/api/v3/gateways?field_mask=name,description`);

    const calcLastSeen = (lastSeen: Date): number => {
        /* 
        return difference in time between lastSeen time and current time
        */
       
       const now = new Date();
       const diff = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
       return Math.round(diff);
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
                data={(response as APIGatewayResponse[])?.sort((a, b) => a.updated_at < b.updated_at)}
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
