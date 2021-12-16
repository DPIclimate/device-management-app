import React, { useEffect, useState } from 'react';
import Card from '../shared/Card';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, StyleSheet } from 'react-native';
import globalStyles from '../styles';


function DeviceCard({data}) {

    const RowTemplate = ({title, item}) =>{
        return(
            <>
                <Col>
                    <Text>{title}</Text>
                </Col>
                <Col>
                    <Text>{item}</Text>
                </Col>
            </>
        )
    }
    let rows = []
    rows.push(<Row key={1} style={globalStyles.cardRow}><RowTemplate title='Application ID' item={data.appID}/></Row>)
    rows.push(<Row key={2} style={globalStyles.cardRow}><RowTemplate title='Device UID' item={data.uid}/></Row>)
    rows.push(<Row key={3} style={globalStyles.cardRow}><RowTemplate title='Device Name' item={data.name}/></Row>)
    rows.push(<Row key={4} style={globalStyles.cardRow}><RowTemplate title='Device EUI' item={data.eui}/></Row>)
    rows.push(<Row key={5} style={globalStyles.cardRow}><RowTemplate title='Date Created' item={data.creationDate}/></Row>)

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