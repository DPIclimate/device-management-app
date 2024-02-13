import {Dimensions, Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModalViewParams{
  children:JSX.Element,
  isVisible:boolean,
  set_isVisible:React.Dispatch<React.SetStateAction<boolean>>
  isDismissible?:boolean
  style?:StyleProp<ViewStyle>
}

/**
 * Modal component for overlay views.
 *
 * @param children - The content to be displayed inside the modal.
 * @param isVisible - Determines whether the modal is visible or not.
 * @param set_isVisible - Callback function to update the visibility of the modal.
 * @param isDismissible - Determines whether the modal can be dismissed by tapping outside.
 * @param style - Additional styles to be applied to the modal.
 * @returns The JSX element representing the modal view.
 */
export default function ModalView({children, isVisible, set_isVisible, isDismissible=true, style}:ModalViewParams):JSX.Element {
  /*
        Modal component for overlay views
    */
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        set_isVisible(false);
      }}>
      <Pressable
        style={{width: '100%', height: '100%'}}
        onPress={() => isDismissible && set_isVisible(false)}>
        <View style={styles.overlay}>
          <Pressable style={[styles.content, style]}>
            {children}
          </Pressable>
          </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    alignItems: "center",
    backgroundColor: "white",
    width: "90%",
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#cccc",
    shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: "grey",
}
});
