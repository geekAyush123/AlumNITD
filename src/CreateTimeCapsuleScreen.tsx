import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { createTimeCapsule } from './TimeCapsuleService';
import auth from '@react-native-firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './App';

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
      selectionLimit: 5 - media.length, // Allow up to 5 media items
    });

    if (!result.didCancel && result.assets) {
      const newMediaUris = result.assets.map(asset => asset.uri).filter(uri => uri) as string[];
      setMedia([...media, ...newMediaUris]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const newMedia = [...media];
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Title and message are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const emails = recipientEmails.split(',').map(e => e.trim()).filter(e => e);
      
      await createTimeCapsule({
        title,
        message,
        unlockDate,
        mediaUrls: media,
        recipients: emails,
        isPublic
      });
      
      navigation.goBack();
      Alert.alert('Success', 'Time capsule created successfully!');
    } catch (error) {
      console.error('Error creating time capsule:', error);
      Alert.alert('Error', 'Failed to create time capsule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.label}>Title*</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Give your time capsule a title"
        maxLength={100}
      />
      
      <Text style={styles.label}>Message*</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={message}
        onChangeText={setMessage}
        placeholder="Write your message here..."
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
        <Icon name="calendar" size={20} color="#555" />
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={unlockDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setUnlockDate(selectedDate);
            }
          }}
        />
      )}
      
      <Text style={styles.label}>Add Media (Optional, max 5)</Text>
      {media.length < 5 && (
        <TouchableOpacity style={styles.addMediaButton} onPress={handleAddMedia}>
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addMediaText}>Add Photo/Video</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.mediaContainer}>
        {media.map((uri, index) => (
          <View key={index} style={styles.mediaItem}>
            {uri.endsWith('.mp4') || uri.endsWith('.mov') ? (
              <View style={styles.videoThumbnail}>
                <Icon name="videocam" size={24} color="#fff" />
              </View>
            ) : (
              <Image source={{ uri }} style={styles.mediaThumbnail} />
            )}
            <TouchableOpacity 
              style={styles.removeMediaButton}
              onPress={() => handleRemoveMedia(index)}
            >
              <Icon name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      
      <Text style={styles.label}>Recipients (comma separated emails)</Text>
      <TextInput
        style={styles.input}
        value={recipientEmails}
        onChangeText={setRecipientEmails}
        placeholder="alumni1@example.com, alumni2@example.com"
        keyboardType="email-address"
      />
      
      <View style={styles.publicContainer}>
        <Text style={styles.publicText}>Make this capsule public to all alumni?</Text>
        <TouchableOpacity
          style={[styles.publicToggle, isPublic && styles.publicToggleActive]}
          onPress={() => setIsPublic(!isPublic)}
        >
          <Text style={styles.publicToggleText}>{isPublic ? 'Yes' : 'No'}</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Creating...' : 'Create Time Capsule'}
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
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A89CFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  addMediaText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  mediaItem: {
    width: 80,
    height: 80,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  publicText: {
    fontSize: 16,
    color: '#333',
  },
  publicToggle: {
    backgroundColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  publicToggleActive: {
    backgroundColor: '#A89CFF',
  },
  publicToggleText: {
    color: '#fff',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#A89CFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTimeCapsuleScreen;