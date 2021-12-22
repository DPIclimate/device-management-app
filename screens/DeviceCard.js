import React, { useEffect, useState } from 'react';
import Card from '../shared/Card';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, StyleSheet, Linking } from 'react-native';
import globalStyles from '../styles';


function DeviceCard({data}) {

    const RowTemplate = ({title, item}) =>{
        return(
            <>
                <Col>
                    <Text>{title}</Text>
                </Col>
                <Col>
                    {item}
                </Col>
            </>
        )
    }
    let rows = []
    rows.push(<Row key={1} style={globalStyles.cardRow}><RowTemplate title='Application ID' item={<Text style={{fontWeight:'bold'}}>{data.appID}</Text>}/></Row>)
    rows.push(<Row key={2} style={globalStyles.cardRow}><RowTemplate title='Device UID' item={<Text>{data.uid != null? data.uid:'-'}</Text>}/></Row>)
    rows.push(<Row key={3} style={globalStyles.cardRow}><RowTemplate title='Device Name' item={<Text>{data.name}</Text>}/></Row>)
    rows.push(<Row key={4} style={globalStyles.cardRow}><RowTemplate title='Device EUI' item={<Text>{data.eui}</Text>}/></Row>)
    rows.push(<Row key={5} style={globalStyles.cardRow}><RowTemplate title='Date Created' item={<Text>{data.creationDate}</Text>}/></Row>)
    rows.push(<Row key={6} style={globalStyles.cardRow}><RowTemplate title='TTN link' item={<Text style={{color: 'blue'}} numberOfLines={1} ellipsizeMode='tail' onPress={() => Linking.openURL(data.ttn_link)}>au1.cloud.thethings.network/api/v3/ns/applications/</Text>}/></Row>)

    return (
        <Card>
            <Text style={globalStyles.cardTitle}>Device Details</Text>
            <Grid>
                {rows}
            </Grid>
        </Card>
    );
}

export default DeviceCard;