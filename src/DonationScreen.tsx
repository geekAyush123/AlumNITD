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
      const screenshotUrl = await uploadToCloudinary({
        uri: screenshotUri,
        uploadPreset: 'timeCapsule',
        cloudName: 'dqdhnkdzo',
        folder: 'donations',
        resourceType: 'image',
        fileName: `donation_${Date.now()}.jpg`,
      });

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
        source={require('./assets/qr-code.png')}
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
        placeholderTextColor="#888"
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.imageUploadButton} onPress={handleImagePick}>
        <Text style={styles.imageUploadText}>Upload Payment Screenshot</Text>
      </TouchableOpacity>

      {screenshotUri && (
        <Image source={{ uri: screenshotUri }} style={styles.uploadedImage} />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DonationScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F4F1FB',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7D5FFF',
    marginBottom: 18,
    textAlign: 'center',
  },
  qrImage: {
    width: 230,
    height: 230,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#B3A5D7',
  },
  scanText: {
    fontSize: 15,
    color: '#6B5E9E',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#A98BD0',
    borderWidth: 1.2,
    marginBottom: 18,
    elevation: 2,
    color: '#333',
  },
  imageUploadButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#6C00FF',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  imageUploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadedImage: {
    width: 220,
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#A98BD0',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#8E2DE2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
