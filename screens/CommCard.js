import React from 'react';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, View, ScrollView } from 'react-native';
import globalStyles from '../styles';
import {Card} from '../shared/index'

const RowContent = ({data}) =>{
    return(
        <Row style={globalStyles.cardRow}>
            <Col size={1}>
                <Text>{data.date}</Text>
                <Text>{data.time}</Text>
            </Col> 
            <Col size={1}>
                <Text>{data.rssi}</Text>
            </Col>
            <Col size={1}>
                <Text>{data.snr}</Text>
            </Col>
            <Col size={2}>
                <Text numberOfLines={1} adjustsFontSizeToFit>{data.m_type}</Text>
            </Col>
        </Row>
    )
}
function CommCard({commData}) {
    
    const Content = () =>{

        let rows = []
        if (commData != undefined){
            for (let i=0;i<commData['times'].length;i++){
                const dateTime = commData['times'][i]
                const data = {
                    'date':dateTime[0], 
                    'time':dateTime[1],
                    'rssi':commData['rssis'][i],
                    'snr':commData['snrs'][i],
                    'm_type':commData['m_types'][i]
                }
                rows.push(<Row key={i}><RowContent data={data}/></Row>)
            }
        }else{
            return (
                <Card>
                    <Text style={globalStyles.cardTitle}>Last Communications</Text>
                    <Row style={{justifyContent:'center'}}><Text style={{fontWeight:'bold', fontSize:15, paddingTop:20}}>No data to display</Text></Row>
                </Card>
            )
        }       
        return(
            // Headers
            <Card>
            <View style={{height:250}}>
                    <Text style={globalStyles.cardTitle}>Last Communications</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Grid>
                            <Row style={globalStyles.cardRow}>
                                <Col size={1}>
                                    <Text>Time</Text>
                                </Col>
                                <Col size={1}>
                                    <Text>RSSI</Text>
                                </Col>
                                <Col size={1}>
                                    <Text>SNR</Text>
                                </Col>
                                <Col size={2}>
                                    <Text>M_Type</Text>
                                </Col>
                            </Row>
                            {rows}
                        </Grid>
                </ScrollView>
            </View>
        </Card>
        )
    }
    return <Content/>
}

export default CommCard;