// DonationScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

const DonationScreen = () => {
  const [amount, setAmount] = useState("");

  const handleDonate = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Invalid Input", "Please enter a valid donation amount.");
      return;
    }

    // Ideally, integrate payment gateway here
    Alert.alert("Thank You!", `You've donated ₹${amount}`);
    setAmount("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support AlumNITD</Text>
      <Text style={styles.subtitle}>Every contribution helps us grow!</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount (₹)"
      />
      <Button title="Donate Now" onPress={handleDonate} />
    </View>
  );
};

export default DonationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a365d",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#4A00E0",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
  },
});
