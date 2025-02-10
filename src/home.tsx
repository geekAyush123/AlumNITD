import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import auth from "@react-native-firebase/auth";

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Alumni Platform!</Text>
      <Button title="Logout" onPress={() => auth().signOut()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default HomeScreen;
