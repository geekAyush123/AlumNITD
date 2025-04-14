import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator, Platform } from 'react-native';
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

const EMOTIONAL_TONES = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Nostalgic' },
  { emoji: '💪', label: 'Motivational' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '🤔', label: 'Reflective' },
];

const CAPSULE_COVERS = [
  { id: 'classic', name: 'Classic Yearbook', color: '#8B4513' },
  { id: 'modern', name: 'Modern', color: '#6200ea' },
  { id: 'vintage', name: 'Vintage', color: '#795548' },
  { id: 'premium', name: 'Premium', color: '#FFD700' },
];

const CreateTimeCapsuleScreen: React.FC<CreateTimeCapsuleScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [media, setMedia] = useState<string[]>([]);
  const [recipientEmails, setRecipientEmails] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string | undefined>(undefined);
  const [selectedCover, setSelectedCover] = useState(CAPSULE_COVERS[0].id);
  const [showTonePicker, setShowTonePicker] = useState(false);

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

  const calculateDaysDifference = () => {
    const diffTime = Math.abs(unlockDate.getTime() - new Date().getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
        isPublic,
        emotionalTone: selectedTone,
        coverStyle: selectedCover
      });
      navigation.goBack();
      Alert.alert('Success', 'Your memory has been preserved for the future!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create time capsule';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: '#F9F5FF' }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/time-capsule-header.png')} 
          style={styles.headerImage}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Preserve a Memory for the Future</Text>
        <Text style={styles.headerSubtitle}>Create a message that will resurface when the time is right</Text>
      </View>

      {/* Time Capsule Cover Selection */}
      <Text style={styles.label}>Choose Your Time Capsule Style</Text>
      <View style={styles.coverContainer}>
        {CAPSULE_COVERS.map(cover => (
          <TouchableOpacity
            key={cover.id}
            style={[
              styles.coverOption,
              selectedCover === cover.id && styles.selectedCover,
              { backgroundColor: cover.color }
            ]}
            onPress={() => setSelectedCover(cover.id)}
          >
            <Text style={styles.coverText}>{cover.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title Section */}
      <Text style={styles.label}>Memory Title*</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="What do you want to call this memory?"
        placeholderTextColor="#888"
        maxLength={100}
      />
      
      {/* Message Section */}
      <Text style={styles.label}>Your Message*</Text>
      <Text style={styles.promptText}>
        This message will be opened on {unlockDate.toLocaleDateString()}. 
        What would you like your future self or classmates to remember?
      </Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={message}
        onChangeText={setMessage}
        placeholder="Write from the heart..."
        placeholderTextColor="#888"
        multiline
        numberOfLines={6}
        maxLength={2000}
      />
      
      {/* Emotional Tone */}
      <Text style={styles.label}>Emotional Tone (Optional)</Text>
      <TouchableOpacity 
        style={styles.toneButton}
        onPress={() => setShowTonePicker(!showTonePicker)}
      >
        <Text>
          {selectedTone ? 
            EMOTIONAL_TONES.find(t => t.label === selectedTone)?.emoji + ' ' + selectedTone : 
            'Select the mood of this memory'}
        </Text>
        <Icon name={showTonePicker ? "chevron-up" : "chevron-down"} size={16} />
      </TouchableOpacity>
      
      {showTonePicker && (
        <View style={styles.tonePicker}>
          {EMOTIONAL_TONES.map(tone => (
            <TouchableOpacity
              key={tone.label}
              style={[
                styles.toneOption,
                selectedTone === tone.label && styles.selectedTone
              ]}
              onPress={() => {
                setSelectedTone(tone.label);
                setShowTonePicker(false);
              }}
            >
              <Text style={styles.toneText}>{tone.emoji} {tone.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Unlock Date */}
      <Text style={styles.label}>When Should This Memory Resurface?*</Text>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <View>
          <Text style={styles.dateLabel}>Unlock Date</Text>
          <Text style={styles.dateValue}>{unlockDate.toLocaleDateString()}</Text>
          <Text style={styles.dateNote}>{calculateDaysDifference()} days from now</Text>
        </View>
        <Icon name="calendar" size={24} color="#6200ea" />
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={unlockDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            date && setUnlockDate(date);
          }}
        />
      )}
      
      {/* Media Section */}
      <Text style={styles.label}>Add Photos/Videos ({media.length}/5)</Text>
      <Text style={styles.promptText}>
        Visuals help bring memories back to life. Add up to 5 items.
      </Text>
      {media.length < 5 && (
        <TouchableOpacity style={styles.addMediaButton} onPress={handleAddMedia}>
          <Icon name="images" size={20} color="#fff" />
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
      
      {/* Recipients */}
      <Text style={styles.label}>Share With (Optional)</Text>
      <Text style={styles.promptText}>
        Enter alumni emails (comma separated) to share this memory with others
      </Text>
      <TextInput
        style={styles.input}
        value={recipientEmails}
        onChangeText={setRecipientEmails}
        placeholder="classmate1@example.com, classmate2@example.com"
        placeholderTextColor="#888"
        keyboardType="email-address"
      />
      
      {/* Public Toggle */}
      <View style={styles.publicToggleContainer}>
        <View>
          <Text style={styles.toggleLabel}>Make this memory public?</Text>
          <Text style={styles.toggleSubLabel}>Visible to all alumni after unlocking</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, isPublic && styles.toggleActive]}
          onPress={() => setIsPublic(!isPublic)}
        >
          <Text style={styles.toggleText}>{isPublic ? 'YES' : 'NO'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Submit Button */}
      {isSubmitting && <ActivityIndicator size="large" style={styles.loader} color="#6200ea" />}
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? 'PRESERVING YOUR MEMORY...' : 'SEAL THIS TIME CAPSULE'}
        </Text>
        <Icon name="time" size={20} color="#fff" style={styles.submitIcon} />
      </TouchableOpacity>
      
      <Text style={styles.footerNote}>
        This memory will be securely stored until the unlock date. 
        You'll receive a notification when it's time to open it.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  headerImage: {
    width: '100%',
    height: 120,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5E35B1',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
    color: '#333',
  },
  promptText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  coverContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  coverOption: {
    width: '48%',
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
  },
  selectedCover: {
    borderWidth: 3,
    borderColor: '#000',
    elevation: 5,
  },
  coverText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  toneButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
  },
  tonePicker: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  toneOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedTone: {
    backgroundColor: '#EDE7F6',
  },
  toneText: {
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dateNote: {
    fontSize: 12,
    color: '#6200ea',
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ea',
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
  },
  addMediaText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
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
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  toggleSubLabel: {
    fontSize: 12,
    color: '#666',
  },
  toggleButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
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
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitIcon: {
    marginLeft: 10,
  },
  footerNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default CreateTimeCapsuleScreen;