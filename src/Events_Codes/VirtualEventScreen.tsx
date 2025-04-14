import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
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
      <View style={[styles.container, styles.loadingContainer]}>
        <Icon name="time-outline" size={40} color="#6A5ACD" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <View style={styles.timeContainer}>
        <Icon name="time-outline" size={18} color="#6A5ACD" />
        <Text style={styles.eventDateTime}>{event.dateTime}</Text>
      </View>

      {/* Purple divider line */}
      <View style={styles.purpleDivider} />

      <View style={styles.meetingInfo}>
        <View style={styles.videoIconContainer}>
          <Icon name="videocam" size={32} color="white" />
        </View>
        <Text style={styles.meetingText}>Online Meeting</Text>
        {event.meetingPlatform && (
          <Text style={styles.platformText}>{event.meetingPlatform}</Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.joinButton} 
        onPress={handleJoinEvent}
        activeOpacity={0.8}
      >
        <View style={styles.joinButtonContent}>
          <Icon name="enter-outline" size={22} color="white" />
          <Text style={styles.joinButtonText}>Join Event</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Event Instructions</Text>
        <View style={styles.instructionItem}>
          <Icon name="globe-outline" size={18} color="#6A5ACD" />
          <Text style={styles.instructionsText}>
            Click "Join Event" to open in your browser
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Icon name="download-outline" size={18} color="#6A5ACD" />
          <Text style={styles.instructionsText}>
            Install required software beforehand
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Icon name="alarm-outline" size={18} color="#6A5ACD" />
          <Text style={styles.instructionsText}>
            Join 5 minutes early to test audio/video
          </Text>
        </View>
        {event.additionalInstructions && (
          <View style={styles.instructionItem}>
            <Icon name="information-circle-outline" size={18} color="#6A5ACD" />
            <Text style={styles.instructionsText}>
              {event.additionalInstructions}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 25,
    paddingTop: 40,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6A5ACD',
    fontSize: 16,
    marginTop: 15,
    fontFamily: 'Roboto-Medium',
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  eventDateTime: {
    fontSize: 16,
    color: '#6A5ACD',
    marginLeft: 8,
    fontFamily: 'Roboto-Medium',
  },
  purpleDivider: {
    height: 5,
    backgroundColor: '#6A5ACD',
    marginBottom: 20,
    width: '100%',
  },
  meetingInfo: {
    alignItems: 'center',
    marginBottom: 35,
    paddingVertical: 25,
    backgroundColor: 'rgba(106, 90, 205, 0.1)',
    borderRadius: 20,
  },
  videoIconContainer: {
    backgroundColor: '#6A5ACD',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  meetingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
    marginBottom: 5,
    fontFamily: 'Roboto-Medium',
  },
  platformText: {
    fontSize: 16,
    color: '#6A5ACD',
    fontWeight: '500',
    fontFamily: 'Roboto-Medium',
  },
  joinButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#4CAF50',
  },
  joinButtonContent: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'Roboto-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 20,
  },
  instructions: {
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto-Bold',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 12,
    flex: 1,
    fontFamily: 'Roboto-Regular',
  },
});

export default VirtualEventScreen;