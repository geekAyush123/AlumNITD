import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { createTimeCapsule } from './TimeCapsuleService';
import auth from '@react-native-firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type CreateTimeCapsuleScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'CreateTimeCapsule'>;
};

const CreateTimeCapsuleScreen: React.FC<CreateTimeCapsuleScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [media, setMedia] = useState<string[]>([]);
  const [recipientEmails, setRecipientEmails] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMedia = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      quality: 0.8,
      selectionLimit: 5 - media.length,
    });

    if (!result.didCancel && result.assets) {
      const newMediaUris = result.assets
        .map((asset: Asset) => asset.uri)
        .filter((uri): uri is string => uri !== undefined);
      setMedia([...media, ...newMediaUris]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Title and message are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTimeCapsule({
        title,
        message,
        unlockDate,
        mediaUrls: media,
        recipients: recipientEmails.split(',').map(e => e.trim()).filter(e => e),
        isPublic
      });
      navigation.goBack();
      Alert.alert('Success', 'Time capsule created!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create time capsule';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Title*</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Capsule title"
        maxLength={100}
      />
      
      <Text style={styles.label}>Message*</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={message}
        onChangeText={setMessage}
        placeholder="Write your message..."
        multiline
        numberOfLines={4}
        maxLength={2000}
      />
      
      <Text style={styles.label}>Unlock Date*</Text>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{unlockDate.toLocaleDateString()}</Text>
        <Icon name="calendar" size={20} />
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={unlockDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            date && setUnlockDate(date);
          }}
        />
      )}
      
      <Text style={styles.label}>Media ({media.length}/5)</Text>
      {media.length < 5 && (
        <TouchableOpacity style={styles.addMediaButton} onPress={handleAddMedia}>
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addMediaText}>Add Media</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.mediaGrid}>
        {media.map((uri, index) => (
          <View key={index} style={styles.mediaItem}>
            {uri.endsWith('.mp4') ? (
              <View style={styles.videoThumbnail}>
                <Icon name="videocam" size={24} color="#fff" />
              </View>
            ) : (
              <Image source={{ uri }} style={styles.mediaImage} />
            )}
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveMedia(index)}
            >
              <Icon name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      
      <Text style={styles.label}>Recipients (comma-separated emails)</Text>
      <TextInput
        style={styles.input}
        value={recipientEmails}
        onChangeText={setRecipientEmails}
        placeholder="friend1@example.com, friend2@example.com"
        keyboardType="email-address"
      />
      
      <View style={styles.publicToggleContainer}>
        <Text>Make public to all alumni?</Text>
        <TouchableOpacity
          style={[styles.toggleButton, isPublic && styles.toggleActive]}
          onPress={() => setIsPublic(!isPublic)}
        >
          <Text style={styles.toggleText}>{isPublic ? 'YES' : 'NO'}</Text>
        </TouchableOpacity>
      </View>
      
      {isSubmitting && <ActivityIndicator size="large" style={styles.loader} />}
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? 'CREATING...' : 'CREATE TIME CAPSULE'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  addMediaText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  mediaItem: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publicToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: '#6200ea',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loader: {
    marginVertical: 16,
  },
  submitButton: {
    backgroundColor: '#6200ea',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateTimeCapsuleScreen;