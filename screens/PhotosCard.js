import React, {useState, useEffect} from 'react';
import {Card} from '../shared';
import { Grid } from "react-native-easy-grid";
import { Text, View, TouchableHighlight, Image,StyleSheet, Alert} from 'react-native';
import globalStyles from '../styles';
import * as ImagePicker from 'expo-image-picker';

function PhotosCard({params, navigation}) {
    const [IMAGES, setImages ] = useState([]);

    const handlePress = () =>{
        Alert.alert("Upload Photo", "Attach a photo to this device",[
            {
                text:'Camera Roll',
                onPress: () => uploadPic()
            },
            {
                text:'Take Photo',
                onPress: () => {console.log('before nav', IMAGES);navigation.navigate('Camera', {currentImages: IMAGES})}
            },
            {
                text:'Cancel',
                onPress: () => console.log("Canceled")
            }
        ])
    }

    useEffect(() => {

        if (params == undefined) return
        let img = [...IMAGES]
        for (let i in params?.photoData){
            if (!img.includes(params?.photoData[i])){
                console.log("just pushed", params?.photoData[i])
                img.push(params?.photoData[i])
            }
        }
        setImages(img)

    }, [params])
    const uploadPic = async() =>{
        
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            quality: 1,
        });

        if (result.cancelled) return

        console.log('updating images')
        let img = [...IMAGES] 
        img.push(result)
        setImages(img);
    }
    return (
        <Card>
             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={globalStyles.cardTitle}>Photos <Text style={{color:'red'}}>(Does not save)</Text></Text>
                <TouchableHighlight acitveOpacity={0.6} underlayColor="#DDDDDD" onPress={() => handlePress()}>
                    <Image style={{width:40, height:40, padding:5}} source={require('../assets/camera.png')}/>
                </TouchableHighlight>
                </View>
            <Grid>

                <View style={{alignItems:'center', justifyContent:'center', width:'100%'}}>

                    {IMAGES.map((image, i) => {
                        return (
                        <View key={i}>
                            <Image source={{ uri: image.uri }} style={{width: image.width<image.height?500:300, height:image.width<image.height?500:200}} resizeMode="contain" />
                        </View>
                        );
                    })}
                </View>
            </Grid>
        </Card>
    );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    ImageBackground: {
      flex: 1,
      resizeMode: "cover",
      width: "100%",
      alignItems: "center",
    },
    ImageContainer: {
      marginHorizontal: 16,
      marginTop: 30,
      width: "100%",
    },
  });

export default PhotosCard;