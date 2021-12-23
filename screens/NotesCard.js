import Card from '../shared/Card';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Text, View, TouchableHighlight, Image } from 'react-native';
import globalStyles from '../styles';

function NotesCard(props) {
    return (
        <Card>
             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Notes</Text>
                <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => console.log('pressed')}>
                    <Image style={{width:40, height:40, padding:5}} source={require('../assets/paperclip.png')}/>
                </TouchableHighlight>
                </View>
            <Grid>
                
            </Grid>
        </Card>
    );
}

export default NotesCard;