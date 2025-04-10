import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import EventCard from './EventCard';
import { NavigationProp } from '@react-navigation/native';

interface EventsScreenProps {
  navigation: NavigationProp<any>;
}

const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsSnapshot = await firestore().collection('events').get();
      const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    };
    
    fetchEvents();
  }, []);

  const handleRSVP = (eventId: string) => {
    Alert.alert('RSVP', 'You have successfully RSVPed to this event!');
    // Here you would typically update the event in Firestore
  };

  const handleViewDetails = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const handleJoinEvent = (eventId: string) => {
    navigation.navigate('VirtualEvent', { eventId });
  };

  return (
    <LinearGradient colors={['#A89CFF', '#A89CFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>All Events</Text>
          <View style={{ width: 30 }} /> {/* For alignment */}
        </View>

        {events.length > 0 ? (
          events.map(event => (
            <EventCard
              key={event.id}
              title={event.title}
              dateTime={event.dateTime}
              description={event.description}
              image={require('../assets/event_placeholder.png')}
              attendees={event.attendees || 0}
              engagementRate={event.engagementRate || "85% (+10%)"}
              speakers={event.speakers || []}
              onRSVP={() => handleRSVP(event.id)}
              onViewDetails={() => handleViewDetails(event.id)}
              onJoinEvent={event.isVirtual ? () => handleJoinEvent(event.id) : undefined}
              isVirtual={event.isVirtual}
            />
          ))
        ) : (
          <Text style={styles.noEventsText}>No events available at the moment.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  noEventsText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default EventsScreen;