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
  const [transactionId, setTransactionId] = useState("");

  const handleSubmit = () => {
    if (!transactionId.trim()) {
      Alert.alert("Missing Transaction ID", "Please enter a valid transaction ID.");
      return;
    }

    Alert.alert("Thank You!", `Your transaction ID: ${transactionId} has been recorded.`);
    setTransactionId("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support AlumNITD</Text>
      <Text style={styles.subtitle}>Scan the QR code below to donate!</Text>

      <Image
        source={require("./assets/qr-code.png")} // Make sure your QR code image is here
        style={styles.qrImage}
      />

      <Text style={styles.scanText}>After payment, enter your Transaction ID below</Text>

      <TextInput
        style={styles.input}
        value={transactionId}
        onChangeText={setTransactionId}
        placeholder="Enter Transaction ID"
        autoCapitalize="characters"
      />
      <Button title="Submit" onPress={handleSubmit} />
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
    textAlign: "center",
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
