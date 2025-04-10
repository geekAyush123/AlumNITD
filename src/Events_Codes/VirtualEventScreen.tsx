import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

interface VirtualEventScreenProps {
  route: RouteProp<RootStackParamList, 'VirtualEvent'>;
  navigation: StackNavigationProp<RootStackParamList, 'VirtualEvent'>;
}

const VirtualEventScreen: React.FC<VirtualEventScreenProps> = ({ route, navigation }) => {
  const [event, setEvent] = useState<any>(null);
  const { eventId } = route.params;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await firestore().collection('events').doc(eventId).get();
        if (eventDoc.exists) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Error', 'Failed to load event details');
      }
    };
    
    fetchEvent();
  }, [eventId]);

  const handleJoinEvent = () => {
    if (event?.meetingLink) {
      Linking.openURL(event.meetingLink).catch(() => {
        Alert.alert('Error', 'Could not open the meeting link');
      });
    } else {
      Alert.alert('Error', 'No meeting link available for this event');
    }
  };

  if (!event) {
    return (
      <LinearGradient colors={['#A89CFF', '#A89CFF']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#A89CFF', '#A89CFF']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Virtual Event</Text>
        <View style={{ width: 30 }} /> {/* For alignment */}
      </View>

      <View style={styles.content}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDateTime}>{event.dateTime}</Text>
        
        <View style={styles.meetingInfo}>
          <Icon name="videocam-outline" size={50} color="#666" />
          <Text style={styles.meetingText}>Virtual Meeting</Text>
          {event.meetingPlatform && (
            <Text style={styles.platformText}>Platform: {event.meetingPlatform}</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinEvent}>
          <Text style={styles.joinButtonText}>Join Event</Text>
        </TouchableOpacity>
        
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            • Click the "Join Event" button to open the meeting in your browser
          </Text>
          <Text style={styles.instructionsText}>
            • Make sure you have the required software installed (if any)
          </Text>
          <Text style={styles.instructionsText}>
            • Join a few minutes early to test your audio/video
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: 'black',
  },
  eventDateTime: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  meetingInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  meetingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: 'black',
  },
  platformText: {
    fontSize: 16,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 30,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  instructions: {
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 5,
    color: 'black',
  },
});

export default VirtualEventScreen;