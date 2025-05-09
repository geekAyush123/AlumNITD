import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Dimensions, SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import EventCard from './EventCard';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Event {
  id: string;
  title: string;
  dateTime: string;
  description: string;
  imageUrl?: string;
  isVirtual?: boolean;
  speakers?: { name: string; role: string }[];
}

interface EventsScreenProps {
  navigation: NavigationProp<any>;
}

const { width } = Dimensions.get('window');

const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('');

  const BottomTabBar = () => (
    <View style={styles.bottomTabBar}>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('jobs');
          navigation.navigate('JobOpportunities');
        }}
      >
        <Icon 
          name={activeTab === 'jobs' ? 'briefcase' : 'briefcase-outline'} 
          size={24} 
          color={activeTab === 'jobs' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('map');
          navigation.navigate('Map');
        }}
      >
        <Icon 
          name={activeTab === 'map' ? 'map' : 'map-outline'} 
          size={24} 
          color={activeTab === 'map' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'map' && styles.activeTabText]}>Map</Text>
      </TouchableOpacity>

            <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('home');
          navigation.navigate('Home');
        }}
      >
        <Icon 
          name={activeTab === 'home' ? 'home' : 'home-outline'} 
          size={24} 
          color={activeTab === 'home' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('network');
          navigation.navigate('MyNetwork');
        }}
      >
        <Icon 
          name={activeTab === 'network' ? 'people' : 'people-outline'} 
          size={24} 
          color={activeTab === 'network' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'network' && styles.activeTabText]}>Network</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('profile');
          navigation.navigate('Profile');
        }}
      >
        <Icon 
          name={activeTab === 'profile' ? 'person' : 'person-outline'} 
          size={24} 
          color={activeTab === 'profile' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await firestore().collection('events').get();
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRSVP = (eventId: string) => {
    Alert.alert('RSVP', 'You have successfully RSVPed to this event!');
  };

  const handleViewDetails = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const handleJoinEvent = (eventId: string) => {
    navigation.navigate('VirtualEvent', { eventId });
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.fullContainer}>
        <LinearGradient colors={['#A89CFF', '#7F7CFF']} style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </LinearGradient>
        <BottomTabBar />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.fullContainer}>
        <LinearGradient colors={['#A89CFF', '#7F7CFF']} style={[styles.container, styles.center]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </LinearGradient>
        <BottomTabBar />
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <LinearGradient colors={['#A89CFF', '#7F7CFF']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>All Events</Text>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search events..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  dateTime={event.dateTime}
                  description={event.description}
                  image={event.imageUrl ? { uri: event.imageUrl } : require('../assets/event_placeholder.png')}
                  onRSVP={() => handleRSVP(event.id)}
                  onViewDetails={() => handleViewDetails(event.id)}
                  onJoinEvent={event.isVirtual ? () => handleJoinEvent(event.id) : undefined}
                  isVirtual={event.isVirtual}
                  speakers={event.speakers || []}
                />
              ))
            ) : (
              <View style={styles.center}>
                <Text style={styles.noEventsText}>No matching events found.</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    marginBottom: 60, // Space for bottom tab bar
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 20,
  },
  header: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
  },
  searchContainer: {
    width: '90%',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    elevation: 2,
  },
  noEventsText: {
    color: 'white',
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: '#7F7CFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#A89CFF',
    fontWeight: 'bold',
  },
});

export default EventsScreen;