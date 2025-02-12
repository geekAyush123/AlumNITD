import React from "react";
import {
     View,
     Text,
     Button,
     StyleSheet
}   from "react-native";

const styles = StyleSheet.create({
    text: {
        fontSize: 20,
        color: 'black'
    }
})

function App(){
    return(
        <View>
            <Text style={styles.text}>Hello, world!</Text>
        </View>
    )
}

export default App