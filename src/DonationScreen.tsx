import React, { useState } from 'react';
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
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadToCloudinary } from './TimeCapsuleCodes/CloudinaryService';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const DonationScreen = () => {
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);

  const handleImagePick = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      (response) => {
        if (response.didCancel) return;

        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          setScreenshotUri(response.assets[0].uri || null);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      Alert.alert('Missing Info', 'Please enter the transaction ID.');
      return;
    }

    if (!screenshotUri) {
      Alert.alert('Missing Screenshot', 'Please upload a screenshot of your payment.');
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Not Logged In', 'You must be logged in to donate.');
      return;
    }

    try {
      // Upload screenshot to Cloudinary
      const screenshotUrl = await uploadToCloudinary({
        uri: screenshotUri,
        uploadPreset: 'timeCapsule', // change if needed
        cloudName: 'dqdhnkdzo',
        folder: 'donations',
        resourceType: 'image',
        fileName: `donation_${Date.now()}.jpg`,
      });

      // Save donation to Firestore
      await firestore().collection('user_donations').add({
        userId: user.uid,
        transactionId: transactionId.trim(),
        screenshotUrl,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Donation recorded successfully!');
      setTransactionId('');
      setScreenshotUri(null);
    } catch (error) {
      console.error('Donation submission failed:', error);
      Alert.alert('Error', 'Something went wrong while submitting your donation.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support AlumNITD</Text>
      <Text style={styles.subtitle}>Scan the QR code below to donate!</Text>

      <Image
        source={require('./assets/qr-code.png')} // Replace with your actual QR image
        style={styles.qrImage}
      />

      <Text style={styles.scanText}>
        After payment, enter your Transaction ID and upload a screenshot
      </Text>

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a365d',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4A00E0',
  },
  qrImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 10,
  },
  scanText: {
    fontSize: 16,
    marginBottom: 20,
    color: 'gray',
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
    width: '100%',
  },
  imageUploadButton: {
    backgroundColor: '#4A00E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  imageUploadText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  uploadedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'contain',
  },
});
