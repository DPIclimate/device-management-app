import React, { useEffect, useState } from 'react';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import globalStyles from '../styles';
import {Card} from '../shared/index'
import useFetchState from '../shared/useFetch';
import LoadingComponent from '../shared/LoadingComponent';
import { useGetNetStatus } from '../shared/useGetNetStatus';
import { formatTime } from '../shared/FormatTime';

const RowContent = ({data}) =>{
    return(
        <Row style={styles.cardRow}>
            <Col>
                <Text>{data.date} - {data.time}</Text>
            </Col> 
            <Col>
                <Text>{data.rssi}</Text>
            </Col>
            <Col>
                <Text>{data.snr}</Text>
            </Col>
            <Col>
                <Text numberOfLines={1} adjustsFontSizeToFit>{data.m_type}</Text>
            </Col>
        </Row>
    )
}

function CommCard({devData, setLastSeen, setCircle}) {

    const {data: commRawData, isLoading: commLoading, error: commError, retry: commRetry} = useFetchState(`${global.COMM_URL}/applications/${devData?.appID}/devices/${devData?.devID}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`)

    const [commData, setCommData] = useState()
    const {loading: netLoading, netStatus, error} = useGetNetStatus()


    useEffect(()=>{//When comm data is returned
        async function loaded(){

            if (commLoading) return
            if (commError) return

            const recent_uplinks = commRawData?.mac_state?.recent_uplinks

            const m_types = recent_uplinks?.map((data) => data.payload?.m_hdr?.m_type).reverse()
            const r_uplinks = recent_uplinks?.map((data) => data.rx_metadata[0]?.rssi).reverse()
            const snrs = recent_uplinks?.map((data) => data.rx_metadata[0]?.snr).reverse()

            const utcTimes = recent_uplinks?.map((data) => data?.received_at).reverse()
            const times = utcTimes?.map((time) => formatTime(time))

            const cData = {
                'm_types':m_types,
                'rssis':r_uplinks,
                'snrs':snrs,
                'times':times
            }
            setCommData(cData)
            calcLastSeen(cData)
        }
        loaded()

    },[commRawData, commError, commLoading])

    const calcLastSeen = (cData) =>{

        if (cData?.times != undefined){
            const recent = new Date(cData.times[0][3])
            const now = new Date()
            const diff = (now - recent)/1000/60

            if (diff < 1){
                setLastSeen(`<1 min ago`)
            }else if (diff < 2){
                setLastSeen(`${Math.floor(diff)} min ago`)
            }else if (diff < 60){
                setLastSeen(`${Math.floor(diff)} mins ago`)
            }else if (diff < 1440){
                setLastSeen(`${Math.floor(diff/60)} hour(s) ago`)
            }else{
                setLastSeen(`${Math.floor(diff/60/24)} day(s) ago`)
            }

            if (diff/60 > 12){
                netStatus? setCircle('red') : setCircle('red-hollow')
            }
            else if (diff/60 > 2){
                netStatus? setCircle('orange') : setCircle('orange-hollow')
            }
            else{
                netStatus? setCircle('green') : setCircle('green-hollow')
            }
        }
        else {
            
            if (netStatus){
                setLastSeen(`Never`)
            }
            else{
                setLastSeen('Unknown')
            }
            netStatus? setCircle('red') : setCircle('red-hollow')
        }
    }
    const Content = () =>{

        let rows = []
        if (!commData?.times) {
            return (
                <Row style={{justifyContent:'center'}}>
                    <Text style={{fontWeight:'bold', fontSize:15, paddingTop:20}}>No data to display</Text>
                </Row>
            )
        }
        
        for (let i=0;i<commData?.times?.length;i++){
            const dateTime = commData.times[i]
            const data = {
                'date':dateTime[0], 
                'time':dateTime[1],
                'rssi':commData.rssis[i],
                'snr':commData.snrs[i],
                'm_type':commData.m_types[i]
            }
            rows.push(<Row key={i}><RowContent data={data}/></Row>)
        }
        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                <Grid>
                    <Row style={globalStyles.cardRow}>
                        <Col size={1}>
                            <Text style={styles.title}>Time</Text>
                        </Col>
                        <Col size={1}>
                            <Text style={styles.title}>RSSI</Text>
                        </Col>
                        <Col size={1}>
                            <Text style={styles.title}>SNR</Text>
                        </Col>
                        <Col>
                            <Text style={styles.title}>M_Type</Text>
                        </Col>
                    </Row>
                    {rows}
                </Grid>
            </ScrollView>
        )
    }
    if (!devData) return <View/>
    return(
        // Headers
        <Card>
        <View style={{maxHeight:250, minHeight:60}}>
                <Text style={globalStyles.cardTitle}>Last Communications</Text>
                
                {!commLoading? 
                    <Content/>: <LoadingComponent loadinng={commLoading}/>}
        </View>
    </Card>
    )
}
const styles = StyleSheet.create({
    title:{
        fontWeight:'bold',
        paddingTop:10,
        paddingBottom:10
    },
    cardRow:{
        paddingBottom:10
    }
})
export default CommCard;