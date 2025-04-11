import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

// Define types
interface TimeCapsule {
  title: string;
  message: string;
  mediaUrls: string[];
  creationDate: Date;
  unlockDate: Date;
}

interface ViewTimeCapsuleScreenProps {
  route: RouteProp<RootStackParamList, 'ViewTimeCapsule'>;
}

const DEFAULT_CAPSULE: TimeCapsule = {
  title: 'Time Capsule',
  message: 'No content available',
  mediaUrls: [],
  creationDate: new Date(),
  unlockDate: new Date(),
};

const ViewTimeCapsuleScreen: React.FC<ViewTimeCapsuleScreenProps> = ({ route }) => {
  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [loading, setLoading] = useState(true);
  const { capsuleId } = route.params;

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('timeCapsules')
      .doc(capsuleId)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          setCapsule({
            title: data?.title || DEFAULT_CAPSULE.title,
            message: data?.message || DEFAULT_CAPSULE.message,
            mediaUrls: data?.mediaUrls || DEFAULT_CAPSULE.mediaUrls,
            creationDate: data?.creationDate?.toDate() || DEFAULT_CAPSULE.creationDate,
            unlockDate: data?.unlockDate?.toDate() || DEFAULT_CAPSULE.unlockDate,
          });
        } else {
          setCapsule(DEFAULT_CAPSULE);
        }
        setLoading(false);
      }, error => {
        console.error("Error fetching capsule:", error);
        setCapsule(DEFAULT_CAPSULE);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [capsuleId]);

  if (loading || !capsule) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{capsule.title}</Text>
      
      <View style={styles.dateRow}>
        <Icon name="time-outline" size={16} color="#666" />
        <Text style={styles.dateText}>
          Created on {capsule.creationDate.toLocaleDateString()}
        </Text>
      </View>

      {capsule.mediaUrls.length > 0 && (
        <Image 
          source={{ uri: capsule.mediaUrls[0] }} 
          style={styles.media} 
          resizeMode="cover"
        />
      )}

      <Text style={styles.message}>{capsule.message}</Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Unlocked on {capsule.unlockDate.toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
  },
  media: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 24,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  footerText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ViewTimeCapsuleScreen;