// ViewTimeCapsuleScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './App';
import firestore from '@react-native-firebase/firestore';

interface ViewTimeCapsuleScreenProps {
  route: RouteProp<RootStackParamList, 'ViewTimeCapsule'>;
}

const DEFAULT_CAPSULE = {
  title: 'Time Capsule',
  message: 'No content available',
  creationDate: new Date(),
  unlockDate: new Date(),
  mediaUrls: [],
};

const ViewTimeCapsuleScreen: React.FC<ViewTimeCapsuleScreenProps> = ({ route }) => {
  const [capsule, setCapsule] = useState(DEFAULT_CAPSULE);
  const [loading, setLoading] = useState(true);
  const { capsuleId } = route.params;

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const doc = await firestore().collection('timeCapsules').doc(capsuleId).get();
        if (doc.exists) {
          const data = doc.data();
          setCapsule({
            title: data?.title || DEFAULT_CAPSULE.title,
            message: data?.message || DEFAULT_CAPSULE.message,
            creationDate: data?.creationDate?.toDate() || new Date(),
            unlockDate: data?.unlockDate?.toDate() || new Date(),
            mediaUrls: data?.mediaUrls || [],
          });
        }
      } catch (error) {
        console.error('Error fetching capsule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsule();
  }, [capsuleId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A89CFF" />
      </View>
    );
  }

  const creationDateString = capsule.creationDate?.toLocaleDateString() || 'Unknown date';
  const unlockDateString = capsule.unlockDate?.toLocaleDateString() || 'Unknown date';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{capsule.title}</Text>
        <View style={styles.dateContainer}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            Created on {creationDateString}
          </Text>
        </View>
      </View>
      
      {capsule.mediaUrls?.length > 0 ? (
        <Image 
          source={{ uri: capsule.mediaUrls[0] }} 
          style={styles.mainImage}
          resizeMode="cover"
          onError={() => console.log('Error loading image')}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Icon name="image-outline" size={50} color="#ccc" />
        </View>
      )}
      
      <Text style={styles.message}>{capsule.message}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This capsule was unlocked on {unlockDateString}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 30,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ViewTimeCapsuleScreen;