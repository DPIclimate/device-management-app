import React, { useContext, useState } from 'react'
import { Col, Row } from 'react-native-easy-grid'
import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  Image,
  Modal,
  Pressable,
} from 'react-native'
import { ManageDeviceContext } from '../../shared/context/ManageDeviceContext'
import Card from '../../shared/components/Card'
import { TouchableOpacity } from 'react-native-gesture-handler'
import ChangeDetailsComponent from '../components/ChangeDetailsComponenet'
import { useKeyboardHeight } from '../../shared/hooks/useKeyboardHeight'

export function DeviceCard(): JSX.Element {
  const { device_state, set_device_state, device_comm_data } = useContext(
    ManageDeviceContext,
  )
  const [overlay_vis, set_overlay_vis] = useState(false)
  const keyboardHeight = useKeyboardHeight();

  //Mappings from key to display text
  const mappings = {
    id: 'Device ID:',
    name: 'Device Name:',
    applications_id: 'Application ID:',
    dev_eui: 'Dev EUI:',
    join_eui: 'Join EUI:',
    created_at: 'Created:',
    updated_at: 'Updated',
    uid: 'UID:',
  }

  return (
    <>
      <Card>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={styles.cardTitle}>Device Details</Text>
          <TouchableOpacity onPress={() => set_overlay_vis(true)}>
            <Image
              style={styles.updateImg}
              source={require('../../assets/edit.png')}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.separatorLine} />

        {Object.keys(device_state)?.map(
          (key: string): JSX.Element => {
            if (key == 'location') {
              return
            } else if (key == 'description') {
              return
            } else if (key == 'isFave') {
              return
            }
            return (
              <Row style={styles.cardRow} key={key}>
                <Col size={1}>
                  <Text style={styles.devTitle}>{mappings[key]}</Text>
                </Col>
                <Col size={2}>
                  <Text selectable={true}>
                    {device_state[key] == null ? '-' : device_state[key]}
                  </Text>
                </Col>
              </Row>
            )
          },
        )}
      </Card>
      <Modal
        animationType="slide"
        transparent={true}
        visible={overlay_vis}
        onRequestClose={() => {
          set_overlay_vis(false)
        }}
      >
        <Pressable
          style={{ width: '100%', height: '100%' }}
          onPress={() => set_overlay_vis(false)}
        >
          <View style={styles.overlay}>
            <ChangeDetailsComponent set_overlay_vis={set_overlay_vis}/>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 10,
  },
  separatorLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#128cde',
    alignSelf: 'flex-start',
  },
  image: {
    width: 20,
    height: 20,
  },
  cardRow: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devTitle: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  updateImg: {
    width: 30,
    height: 30,
    padding: 10,
  },
  overlay: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
