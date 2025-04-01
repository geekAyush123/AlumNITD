import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { RouteProp } from '@react-navigation/native';

interface EventDetailsScreenProps {
  route: RouteProp<{ params: { eventId: string } }, 'params'>;
  navigation: any;
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
    // Here you would typically update the event in Firestore
  };

  const handleJoinEvent = () => {
    navigation.navigate('VirtualEvent', { eventId });
  };

  if (!event) {
    return (
      <LinearGradient colors={['#A89CFF', '#A89CFF']} style={styles.container}>
        <Text style={styles.loadingText}>Loading event details...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#A89CFF', '#A89CFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Event Details</Text>
          <View style={{ width: 30 }} /> {/* For alignment */}
        </View>

        <Image source={require('./assets/event-placeholder.png')} style={styles.eventImage} />
        
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDateTime}>{event.dateTime}</Text>
        
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.eventDescription}>{event.description}</Text>
        
        <Text style={styles.sectionTitle}>Agenda</Text>
        {event.agenda ? (
          event.agenda.map((item: string, index: number) => (
            <View key={index} style={styles.agendaItem}>
              <Icon name="time-outline" size={16} color="#666" />
              <Text style={styles.agendaText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noAgendaText}>Agenda to be announced</Text>
        )}
        
        <Text style={styles.sectionTitle}>Highlights</Text>
        {event.highlights ? (
          event.highlights.map((highlight: string, index: number) => (
            <Text key={index} style={styles.highlightText}>• {highlight}</Text>
          ))
        ) : (
          <Text style={styles.noHighlightsText}>Highlights to be announced</Text>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="people-outline" size={20} color="#666" />
            <Text style={styles.statText}>{event.attendees || 0}+ attendees</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-up-outline" size={20} color="#666" />
            <Text style={styles.statText}>{event.engagementRate || "85% (+10%)"} engagement</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Speakers</Text>
        {event.speakers && event.speakers.length > 0 ? (
          event.speakers.map((speaker: any, index: number) => (
            <View key={index} style={styles.speakerItem}>
              <Icon name="person-circle-outline" size={30} color="#666" />
              <View style={styles.speakerTextContainer}>
                <Text style={styles.speakerName}>{speaker.name}</Text>
                <Text style={styles.speakerRole}>{speaker.role}</Text>
                {speaker.bio && <Text style={styles.speakerBio}>{speaker.bio}</Text>}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noSpeakersText}>Speakers to be announced</Text>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.rsvpButton} onPress={handleRSVP}>
            <Text style={styles.buttonText}>RSVP</Text>
          </TouchableOpacity>
          {event.isVirtual && (
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinEvent}>
              <Text style={styles.buttonText}>Join Event</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {event.isVirtual && (
          <TouchableOpacity style={styles.locationButton}>
            <Icon name="map-outline" size={16} color="#666" />
            <Text style={styles.locationText}>Virtual Event Location Map</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { width: '90%', alignSelf: 'center', paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDateTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  eventDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#444',
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agendaText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
  noAgendaText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  highlightText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
    marginLeft: 5,
  },
  noHighlightsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
  speakerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  speakerTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  speakerRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  speakerBio: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    lineHeight: 20,
  },
  noSpeakersText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  rsvpButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  joinButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 15,
  },
});

export default EventDetailsScreen;