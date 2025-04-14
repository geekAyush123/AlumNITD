import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Dimensions,
  TouchableOpacity,
  Share,
  Animated,
  Easing
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import Video from 'react-native-video';
import auth from '@react-native-firebase/auth';

interface TimeCapsule {
  title: string;
  message: string;
  mediaUrls: string[];
  creationDate: any;
  unlockDate: any;
  creatorId: string;
  emotionalTone?: string;
  coverStyle?: string;
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
  creatorId: '',
};

const EMOTION_ICONS: Record<string, string> = {
  'Happy': 'happy-outline',
  'Nostalgic': 'sad-outline',
  'Motivational': 'body-outline',
  'Funny': 'happy-outline',
  'Reflective': 'headset-outline',
};

const ViewTimeCapsuleScreen: React.FC<ViewTimeCapsuleScreenProps> = ({ route }) => {
  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { capsuleId } = route.params;
  const user = auth().currentUser;

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
            creationDate: data?.creationDate,
            unlockDate: data?.unlockDate,
            creatorId: data?.creatorId || '',
            emotionalTone: data?.emotionalTone,
            coverStyle: data?.coverStyle
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

    // Celebration animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    return () => unsubscribe();
  }, [capsuleId]);

  const getCoverStyle = () => {
    switch (capsule?.coverStyle) {
      case 'classic':
        return { backgroundColor: '#8B4513', borderColor: '#A0522D' };
      case 'modern':
        return { backgroundColor: '#6200ea', borderColor: '#3700B3' };
      case 'vintage':
        return { backgroundColor: '#795548', borderColor: '#5D4037' };
      case 'premium':
        return { backgroundColor: '#FFD700', borderColor: '#FFC600' };
      default:
        return { backgroundColor: '#6200ea', borderColor: '#3700B3' };
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this time capsule I created: "${capsule?.title}"\n\n${capsule?.message}`,
        title: 'Time Capsule Memory',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderMedia = (url: string, index: number) => {
    const isVideo = url.endsWith('.mp4') || url.endsWith('.mov') || url.includes('video');
    const isGif = url.endsWith('.gif');

    if (isVideo) {
      return (
        <View key={index} style={styles.mediaContainer}>
          <Video
            source={{ uri: url }}
            style={styles.media}
            resizeMode="contain"
            controls
            paused={false}
          />
        </View>
      );
    }

    return (
      <View key={index} style={styles.mediaContainer}>
        <Image
          source={{ uri: url }}
          style={styles.media}
          resizeMode="contain"
        />
      </View>
    );
  };

  const isCreator = user?.uid === capsule?.creatorId;
  const creationDate = capsule?.creationDate ? new Date(capsule.creationDate.seconds * 1000).toLocaleDateString() : 'Unknown';
  const unlockDate = capsule?.unlockDate ? new Date(capsule.unlockDate.seconds * 1000).toLocaleDateString() : 'Unknown';
  const daysBetween = capsule?.creationDate && capsule?.unlockDate ? 
    Math.ceil((capsule.unlockDate.seconds - capsule.creationDate.seconds) / (60 * 60 * 24)) : 0;

  if (loading || !capsule) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Celebration Banner */}
      {showCelebration && (
        <Animated.View style={[styles.unlockCelebration, { opacity: fadeAnim }]}>
          <Icon name="sparkles" size={20} color="#FFD600" />
          <Text style={styles.celebrationText}>Time Capsule Unlocked!</Text>
          <TouchableOpacity 
            style={styles.closeCelebration}
            onPress={() => setShowCelebration(false)}
          >
            <Icon name="close" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Cover Section */}
      <View style={[styles.cover, getCoverStyle()]}>
        <Text style={styles.coverTitle}>{capsule.title}</Text>
        <View style={styles.coverDates}>
          <Text style={styles.coverDateText}>Created: {creationDate}</Text>
          <Text style={styles.coverDateText}>Unlocked: {unlockDate}</Text>
        </View>
        {capsule.emotionalTone && (
          <View style={styles.emotionBadge}>
            <Icon 
              name={EMOTION_ICONS[capsule.emotionalTone] || 'help-outline'} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.emotionText}>{capsule.emotionalTone}</Text>
          </View>
        )}
      </View>

      {/* Time Machine Effect */}
      <View style={styles.timeMachineEffect}>
        <Text style={styles.timeLabel}>
          This message traveled through time for {daysBetween} days
        </Text>
      </View>

      {/* Media Section */}
      {capsule.mediaUrls?.length > 0 && (
        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Memory Media</Text>
          {capsule.mediaUrls.map((url, index) => renderMedia(url, index))}
        </View>
      )}

      {/* Message Section */}
      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>The Message</Text>
        <Text style={styles.message}>
          {capsule.message.split('\n').map((paragraph, i) => (
            <Text key={i}>
              {paragraph}
              {'\n\n'}
            </Text>
          ))}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {isCreator && (
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Icon name="share-social" size={20} color="#6200ea" />
            <Text style={styles.shareButtonText}>Share This Memory</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.footerText}>
          {isCreator ? 'You created this memory' : 'Shared with you'} on {creationDate}
        </Text>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  unlockCelebration: {
    backgroundColor: '#5E35B1',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  closeCelebration: {
    position: 'absolute',
    right: 15,
  },
  cover: {
    padding: 25,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coverDates: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 5,
  },
  coverDateText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  emotionBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  emotionText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  timeMachineEffect: {
    padding: 15,
    backgroundColor: '#F3E5F5',
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeLabel: {
    color: '#5E35B1',
    fontStyle: 'italic',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  mediaSection: {
    marginTop: 20,
  },
  mediaContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  media: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  messageSection: {
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 20,
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
  },
  shareButtonText: {
    color: '#6200ea',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});

export default ViewTimeCapsuleScreen;