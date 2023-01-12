import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

export default function SearchBox({showSearch, searchText, setSearchText, setShow}) {
  return (
    <View style={styles.searchBoxView}>
        {showSearch && (
            <TextInput
                clearButtonMode="always"
                autoFocus={true}
                onSubmitEditing={() => setShow(false)}
                value={searchText}
                placeholder="example-id"
                style={styles.searchBox}
                onChangeText={(e) => {
                    setSearchText(e);
                }}
                autoCorrect={false}
                autoCapitalize="none"
            />
        )}
    </View>
  )
}

const styles = StyleSheet.create({
    searchBoxView: {
        position: "absolute",
        top: 15,
        width: "100%",
        // backgroundColor: "white",
        borderRadius: 50,
    },
    searchBox: {
        backgroundColor: "white",
        // margin: 5,
        height: 50,
        width: "90%",
        padding: 10,
        alignSelf: "center",
        borderRadius: 25,
        borderWidth: 5,
        borderColor:"#128cde"
    }
})