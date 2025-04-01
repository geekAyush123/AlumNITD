import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp } from '@react-navigation/native';
import EventCard from './EventCard';

interface HomePageProps {
  navigation: NavigationProp<any>;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>('User');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setDisplayName(userDoc.data()?.fullName || 'User');
        }
      }
    };
    
    const fetchEvents = async () => {
      const eventsSnapshot = await firestore().collection('events').limit(3).get();
      const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    };
    
    fetchUserData();
    fetchEvents();
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => auth().signOut().then(() => navigation.navigate('Login')) },
    ]);
  };

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
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Icon name="menu" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.logo}>AlumNITD</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('AlumniSearch')}>
              <Icon name="search" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {menuVisible && (
          <View style={styles.menu}>
            <MenuItem icon="person-circle" text="Profile" onPress={() => navigation.navigate('Profile')} />
            <MenuItem icon="mail" text="Messages" onPress={() => navigation.navigate('MessagesList')} />
            <MenuItem icon="cash-outline" text="Donations" onPress={() => {}} />
            <MenuItem icon="chatbubble-ellipses-outline" text="Discussion" onPress={() => {}} />
            <MenuItem 
              icon="log-out-outline" 
              text="Log Out" 
              onPress={handleSignOut} 
              iconColor="#FF0000" 
              textColor="#FF0000" 
            />
          </View>
        )}

        <Text style={styles.userText}><Text style={styles.bold}>Hi, </Text>{displayName}</Text>
        <Text style={styles.welcomeText}>Welcome to AlumNITD - Your Alumni Network</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('JobOpportunities')}>
            <FeatureCard 
              title="Explore Job Opportunities" 
              image={require('./assets/Job.png')} 
              text="Join our community for exclusive job listings." 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <FeatureCard
              title="Connect with Nearby Alumni"
              image={require('./assets/alumni.png')}
              text="See alumni locations and connect with peers."
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Events')}>
            <FeatureCard 
              title="Upcoming Events" 
              image={require('./assets/events.png')} 
              text="Stay updated with events and networking opportunities." 
            />
          </TouchableOpacity>
        </View>

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionHeader}>Upcoming Events</Text>
          {events.length > 0 ? (
            events.map(event => (
              <EventCard
                key={event.id}
                title={event.title}
                dateTime={event.dateTime}
                description={event.description}
                image={require('./assets/event-placeholder.png')}
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
            <Text style={styles.noEventsText}>No upcoming events. Check back later!</Text>
          )}
          
          {events.length > 0 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Events')}
            >
              <Text style={styles.viewAllButtonText}>View All Events</Text>
              <Icon name="arrow-forward" size={20} color="#A89CFF" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// ... (keep the existing FeatureCard and MenuItem components)

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  header: { flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  logo: { fontSize: 22, fontWeight: 'bold' },
  userText: { fontSize: 18 },
  bold: { fontWeight: 'bold' },
  welcomeText: { fontSize: 16, textAlign: 'center', marginVertical: 20 },
  cardContainer: { width: '90%' },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15 },
  cardImage: { width: 80, height: 80, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  cardDescription: { fontSize: 14, textAlign: 'center', color: 'gray' },
  menu: { backgroundColor: 'white', padding: 10, borderRadius: 8, width: '80%', marginVertical: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  menuText: { fontSize: 16, marginLeft: 10 },
  eventsSection: {
    width: '90%',
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
  },
  noEventsText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
  },
  viewAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export default HomePage;