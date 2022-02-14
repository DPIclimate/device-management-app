import React, { useEffect, useState } from 'react';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, View, ScrollView } from 'react-native';
import globalStyles from '../styles';
import {Card} from '../shared/index'
import {useDataContext} from '../shared/DataContextManager'
import useFetchState from '../shared/useFetch';
import moment from 'moment';
import LoadingComponent from '../shared/LoadingComponent';
import checkNetworkStatus from '../shared/NetworkStatus';

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
export const formatTime = (toFormat) =>{
    const dateUnix = new Date(toFormat);

    const dayMonth = moment(dateUnix).format('DD/MM')
    const time = moment(dateUnix).format('hh:mm')
    const dayMonthYear = moment(dateUnix).format('DD/MM/YYYY')

    return [dayMonth, time, dayMonthYear, dateUnix]
    
}

function CommCard({changeLastSeen, setCircle}) {

    const devData = useDataContext()
    
    const {data: commRawData, isLoading: commLoading, error: commError, retry: commRetry} = useFetchState(`https://au1.cloud.thethings.network/api/v3/ns/applications/${devData?.appID}/devices/${devData?.name}?field_mask=mac_state.recent_uplinks,pending_mac_state.recent_uplinks,session.started_at,pending_session`, {storKey:global.COMM_CACHE, type:'CommsList', devID:devData?.name, appID:devData?.appID})

    const [commData, changeCommData] = useState()
    const [netStatus, setNetStatus] = useState(false)

    useEffect(()=>{//When comm data is returned
        async function loaded(){

            const status = await checkNetworkStatus()
            setNetStatus(status)
            
            if (commLoading) return
            if (commError) {return}

            console.log("here in loaded")
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
            changeCommData(cData)
            calcLastSeen(cData)
        }
        loaded()

    },[commRawData, commError])

    const calcLastSeen = (cData) =>{

        if (cData?.times != undefined){
            const recent = new Date(cData['times'][0][3])
            const now = new Date()
            const diff = (now - recent)/1000/60

            if (diff < 1){
                changeLastSeen(`<1 min ago`)
            }else if (diff < 2){
                changeLastSeen(`${Math.floor(diff)} min ago`)
            }else if (diff < 60){
                changeLastSeen(`${Math.floor(diff)} mins ago`)
            }else if (diff < 1440){
                changeLastSeen(`${Math.floor(diff/60)} hour(s) ago`)
            }else{
                changeLastSeen(`${Math.floor(diff/60/24)} day(s) ago`)
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
                changeLastSeen(`Never`)
            }
            else{
                changeLastSeen('Unknown')
            }
            netStatus? setCircle('red') : setCircle('red-hollow')
        }
    }
    const Content = () =>{

        
        let rows = []
        if (commData?.times == undefined) return <Row style={{justifyContent:'center'}}><Text style={{fontWeight:'bold', fontSize:15, paddingTop:20}}>No data to display</Text></Row>
        
        for (let i=0;i<commData?.times?.length;i++){
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
        return (
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
        )
    }
    if (devData == undefined) return <View/>
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

export default CommCard;