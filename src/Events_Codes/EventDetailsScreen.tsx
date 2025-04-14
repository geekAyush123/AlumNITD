import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

interface EventDetailsScreenProps {
  route: RouteProp<RootStackParamList, 'EventDetails'>;
  navigation: StackNavigationProp<RootStackParamList, 'EventDetails'>;
}

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ route, navigation }) => {
  const [event, setEvent] = useState<any>(null);
  const { eventId } = route.params;

  useEffect(() => {
    const fetchEvent = async () => {
      const eventDoc = await firestore().collection('events').doc(eventId).get();
      if (eventDoc.exists) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() });
      }
    };
    
    fetchEvent();
  }, [eventId]);

  const handleRSVP = () => {
    Alert.alert('RSVP', 'You have successfully RSVPed to this event!');
  };

  const handleJoinEvent = () => {
    navigation.navigate('VirtualEvent', { eventId });
  };

  if (!event) {
    return (
      <LinearGradient colors={['#6A5ACD', '#9370DB']} style={styles.container}>
        <Text style={styles.loadingText}>Loading event details...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#6A5ACD', '#9370DB']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={{ width: 24 }} /> 
        </View> */}

        <View style={styles.card}>
          <Image 
            source={require('../assets/event_placeholder.png')} 
            style={styles.eventImage} 
          />
          
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.dateTimeContainer}>
              <Icon name="calendar-outline" size={16} color="#7F7CFF" />
              <Text style={styles.eventDateTime}>{event.dateTime}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            {event.agenda ? (
              event.agenda.map((item: string, index: number) => (
                <View key={index} style={styles.agendaItem}>
                  <View style={styles.agendaBullet}>
                    <Icon name="time-outline" size={14} color="#7F7CFF" />
                  </View>
                  <Text style={styles.agendaText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noContentText}>Agenda to be announced</Text>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            {event.highlights ? (
              event.highlights.map((highlight: string, index: number) => (
                <View key={index} style={styles.highlightItem}>
                  <View style={styles.highlightBullet} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noContentText}>Highlights to be announced</Text>
            )}
          </View>
          
          {/* Enhanced Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Icon name="people-outline" size={20} color="#7F7CFF" />
              </View>
              <Text style={styles.statValue}>{event.attendees || 0}+</Text>
              <Text style={styles.statText}>Attendees</Text>
            </View>
            
            <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#F0F0FF' }]}>
              <View style={styles.statIconContainer}>
                <Icon name="trending-up-outline" size={20} color="#7F7CFF" />
              </View>
              <Text style={styles.statValue}>{event.engagementRate || "85%"}</Text>
              <Text style={styles.statText}>Engagement</Text>
              {event.engagementRate && (
                <Text style={[styles.statText, { color: '#4CAF50', fontSize: 12 }]}>
                  (+10% from last year)
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Speakers</Text>
            {event.speakers && event.speakers.length > 0 ? (
              event.speakers.map((speaker: any, index: number) => (
                <View key={index} style={styles.speakerItem}>
                  <View style={styles.speakerAvatar}>
                    <Icon name="person-circle-outline" size={40} color="#7F7CFF" />
                  </View>
                  <View style={styles.speakerTextContainer}>
                    <Text style={styles.speakerName}>{speaker.name}</Text>
                    <Text style={styles.speakerRole}>{speaker.role}</Text>
                    {speaker.bio && <Text style={styles.speakerBio}>{speaker.bio}</Text>}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noContentText}>Speakers to be announced</Text>
            )}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rsvpButton]} 
            onPress={handleRSVP}
          >
            <Text style={styles.buttonText}>RSVP</Text>
          </TouchableOpacity>
          {event.isVirtual && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.joinButton]} 
              onPress={handleJoinEvent}
            >
              <Text style={styles.buttonText}>Join Event</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {event.isVirtual && (
          <TouchableOpacity style={styles.locationButton}>
            <Icon name="map-outline" size={16} color="#7F7CFF" />
            <Text style={styles.locationText}>Virtual Event Location Map</Text>
            <Icon name="chevron-forward" size={16} color="#7F7CFF" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#6A5ACD',
  },
  scrollContainer: { 
    paddingBottom: 30,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  eventHeader: {
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  agendaBullet: {
    marginRight: 10,
    marginTop: 2,
  },
  agendaText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7F7CFF',
    marginRight: 10,
    marginTop: 7,
  },
  highlightText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  noContentText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#F0F0FF',
    shadowColor: '#7F7CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statIconContainer: {
    backgroundColor: '#F5F5FF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    textAlign: 'center',
  },
  speakerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: '#F9F9FF',
    borderRadius: 12,
    padding: 12,
  },
  speakerAvatar: {
    marginRight: 12,
  },
  speakerTextContainer: {
    flex: 1,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  speakerRole: {
    fontSize: 13,
    color: '#7F7CFF',
    marginTop: 2,
    fontWeight: '500',
  },
  speakerBio: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rsvpButton: {
    backgroundColor: '#FF6B6B',
    marginRight: 10,
  },
  joinButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EventDetailsScreen;