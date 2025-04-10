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
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const DonationScreen = () => {
  const [transactionId, setTransactionId] = useState("");
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "We need access to your photos to upload the screenshot.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!transactionId.trim()) {
      Alert.alert("Missing Info", "Please enter the transaction ID.");
      return;
    }

    if (!screenshotUri) {
      Alert.alert("Missing Screenshot", "Please upload a screenshot of your payment.");
      return;
    }

    Alert.alert("Thank You!", `Transaction ID: ${transactionId} has been recorded.`);
    setTransactionId("");
    setScreenshotUri(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support AlumNITD</Text>
      <Text style={styles.subtitle}>Scan the QR code below to donate!</Text>

      <Image
        source={require("./assets/qr-code.png")} // Replace with your actual QR image path
        style={styles.qrImage}
      />

      <Text style={styles.scanText}>After payment, enter your Transaction ID and upload screenshot</Text>

      <TextInput
        style={styles.input}
        value={transactionId}
        onChangeText={setTransactionId}
        placeholder="Enter Transaction ID"
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.imageUploadButton} onPress={handleImagePick}>
        <Text style={styles.imageUploadText}>Upload Payment Screenshot</Text>
      </TouchableOpacity>

      {screenshotUri && (
        <Image source={{ uri: screenshotUri }} style={styles.uploadedImage} />
      )}

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
  imageUploadButton: {
    backgroundColor: "#4A00E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
  },
  imageUploadText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  uploadedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "contain",
  },
});
