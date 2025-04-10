import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support AlumNITD</Text>
      <Text style={styles.subtitle}>Every contribution helps us grow!</Text>

      <Image
        source={require("./assets/qr-code.png")} // Replace with your actual QR image path
        style={styles.qrImage}
      />

      <Text style={styles.scanText}>Scan to Donate</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Or enter amount (₹)"
      />
      <Button title="Donate Now" onPress={handleDonate} />
    </ScrollView>
  );
};

export default DonationScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
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
  qrImage: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    marginBottom: 10,
    borderRadius: 10,
  },
  scanText: {
    fontSize: 16,
    marginBottom: 20,
    color: "gray",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
    width: "100%",
  },
});
