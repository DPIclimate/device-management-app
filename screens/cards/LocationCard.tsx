import React, { useContext, useRef, useState } from 'react'
import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  Alert,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native'
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  Circle,
  Callout,
  MAP_TYPES,
  MapTypes,
  Region,
} from 'react-native-maps'
import * as Location from 'expo-location'
import { Linking } from 'react-native'
import { ManageDeviceContext } from '../../shared/context/ManageDeviceContext'
import Card from '../../shared/components/Card'
import { LoadingComponent } from '../../shared/components/LoadingComponent'
import { GlobalContext } from '../../shared/context/GlobalContext'
import {
  TTN_Actions,
  update_ttn_device,
} from '../../shared/functions/InterfaceTTN'
import { save_update_to_storage } from '../../shared/functions/ManageLocStorage'
import { DeviceUpdateRequest } from '../../shared/types/CustomTypes'
import { TouchableOpacity } from 'react-native-gesture-handler'

export function LocationCard(): JSX.Element {
  const [state, dispatch] = useContext(GlobalContext)
  const { device_state, set_device_state, device_comm_data } = useContext(
    ManageDeviceContext,
  )

  const mapRef = useRef()
  const [mapType, setMapType] = useState<MapTypes>(MAP_TYPES.HYBRID)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [region, setRegion] = useState<Region>({
    latitude: device_state.location?.latitude,
    longitude: device_state.location?.longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.003,
  })

  const updateLocation = async (): Promise<void> => {
    console.log('updating location')
    setLoading(true)
    const response: Location.LocationPermissionResponse = await Location.requestForegroundPermissionsAsync()
    if (response.status == Location.PermissionStatus.GRANTED) {
      const userLocation: Location.LocationObject = await Location.getCurrentPositionAsync(
        {},
      )

      //Formulate device update request, then pass to appropriate function depending on network status
      const updateRequest: DeviceUpdateRequest = {
          device: {
              ...device_state,
              location: {
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                  altitude: userLocation.coords.altitude,
                  accuracy: userLocation.coords.accuracy,
              },
          },
          action: TTN_Actions.UPDATE_LOCATION,
      };

      set_device_state(updateRequest.device)

      if (state.network_status) {
        try {
          await update_ttn_device(
            updateRequest,
            state.application_server,
            state.ttn_auth_token,
          )
          Alert.alert(
            'Location saved',
            'Location details have been saved successfully',
          )
          setRegion({
            latitude: updateRequest.device.location.latitude,
            longitude: updateRequest.device.location.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.003,
          })
        } catch (error) {
          Alert.alert(
            'Error',
            `An error occurred while trying to save update ${updateRequest.action}. Reason: ${error}`,
          )
        }
      } else {
        console.log('Saving to storage')
        await save_update_to_storage(updateRequest)
        Alert.alert(
          'Saved Update',
          'There was no internet connection to perform this action, this update has instead been saved to the queue. Try again when you have an internet connection',
        )
      }
    } else {
      Alert.alert(
        'Permission Error',
        'Unable to update location because location services are not enabled',
      )
    }

    console.log('Location updated')
    setLoading(false)
  }

  const getDirections = (): void => {
    /*
            Builds a deeplink to take user to maps app with destination of the device

        */

    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    })
    const location = `${device_state.location.latitude},${device_state.location.longitude}`
    const label = device_state.name ? device_state.name : device_state.device_id
    const url = Platform.select({
      ios: `${scheme}${label}@${location}`,
      android: `${scheme}${location}(${label})`,
    })

    Linking.openURL(url)
  }

  const handleMapChange = (type: MapTypes): void => {
    if (mapRef?.current?.__lastRegion) {
      setRegion(mapRef.current.__lastRegion)
    }
    setMapType(type)
  }

  const MapTypeButton = ({ type, text }): JSX.Element => {
    return (
      <Pressable
        onPress={() => handleMapChange(type)}
        style={[
          styles.mapTypeButton,
          { backgroundColor: mapType == type ? '#128cde' : 'white' },
        ]}
      >
        <Text
          style={[
            styles.mapTypeText,
            { color: mapType == type ? 'white' : '#128cde' },
          ]}
        >
          {text}
        </Text>
      </Pressable>
    )
  }

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={styles.cardTitle}>Location</Text>
        <TouchableOpacity
          disabled={isLoading}
          onPress={() =>
            Alert.alert(
              'Update Location?',
              'Update device location to your current location?',
              [
                {
                  text: 'Yes',
                  onPress: () => updateLocation(),
                },
                {
                  text: 'Cancel',
                  onPress: () => console.log('canceled'),
                },
              ],
            )
          }
        >
          <Image
            style={styles.updateLocationImg}
            source={require('../../assets/updateLocation.png')}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.separatorLine} />

      {isLoading ? (
        <LoadingComponent isLoading={isLoading} />
      ) : (
        <View>
          {device_state.location?.latitude &&
          device_state.location?.longitude ? (
            <>
              <View style={styles.maptype}>
                <MapTypeButton type={MAP_TYPES.SATELLITE} text={'Satellite'} />
                <MapTypeButton type={MAP_TYPES.STANDARD} text={'Standard'} />
                <MapTypeButton type={MAP_TYPES.HYBRID} text={'Hybrid'} />
              </View>

              <MapView
                ref={mapRef}
                style={styles.map}
                mapType={mapType}
                provider={PROVIDER_DEFAULT}
                showsUserLocation={true}
                region={region}
              >
                <Marker
                  onCalloutPress={() => getDirections()}
                  coordinate={{
                    latitude: device_state.location.latitude,
                    longitude: device_state.location.longitude,
                  }}
                >
                  <Callout tooltip={true}>
                    <View
                      style={{
                        backgroundColor: '#128cde',
                        padding: 15,
                        borderRadius: 50,
                      }}
                    >
                      <Image
                        source={require('../../assets/directions.png')}
                        style={{ width: 35, height: 35 }}
                      />
                    </View>
                  </Callout>
                </Marker>
                {device_state.location.accuracy && (
                  <Circle
                    center={{
                      latitude: device_state.location.latitude,
                      longitude: device_state.location.longitude,
                    }}
                    radius={device_state.location.accuracy}
                    strokeWidth={1}
                    strokeColor="red"
                  />
                )}
              </MapView>
              <View style={styles.locationText}>
                <View style={styles.locationRow}>
                  <Text style={styles.locationHeading}>Latitude:</Text>
                  <Text>{device_state.location.latitude}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationHeading}>Longitude:</Text>
                  <Text>{device_state.location.longitude}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationHeading}>Altitude:</Text>
                  <Text>{device_state.location.altitude}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationHeading}>Accuracy:</Text>
                  <Text>{device_state.location.accuracy}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.noLocation}>No location to display</Text>
          )}
        </View>
      )}
    </Card>
  )
}
const styles = StyleSheet.create({
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 10,
  },
  maptype: {
    flexDirection: 'row',
    marginTop: 10,
  },
  mapTypeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#128cde',
    flex: 1,
    alignItems: 'center',
    margin: 1,
  },
  mapTypeText: {
    color: '#128cde',
  },
  mapTypeTextSelected: {
    color: '#128cde',
  },
  title: {
    fontWeight: 'bold',
  },
  separatorLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#128cde',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: Dimensions.get('window').height / 2,
    borderRadius: 15,
    marginTop: 15,
  },
  noLocation: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  updateLocationImg: {
    width: 35,
    height: 35,
    padding: 10,
  },
  locationRow: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  locationHeading: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  locationText: {
    marginTop: 10,
  },
})
