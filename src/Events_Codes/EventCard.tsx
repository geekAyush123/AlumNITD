import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface EventCardProps {
  title: string;
  dateTime: string;
  description: string;
  image: any; // Can be require(localImage) or {uri: 'https://...'}
  attendees: number;
  engagementRate: string;
  speakers: { name: string; role: string }[];
  onRSVP: () => void;
  onViewDetails: () => void;
  onJoinEvent?: () => void;
  isVirtual?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  dateTime,
  description,
  image,
  attendees,
  engagementRate,
  speakers,
  onRSVP,
  onViewDetails,
  onJoinEvent,
  isVirtual = false,
}) => {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.eventImage} />
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventDateTime}>{dateTime}</Text>
      
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.eventDescription}>{description}</Text>
      
      <Text style={styles.sectionTitle}>Agenda</Text>
      <View style={styles.agendaItem}>
        <Icon name="time-outline" size={16} color="#666" />
        <Text style={styles.agendaText}>Opening Keynote</Text>
      </View>
      <View style={styles.agendaItem}>
        <Icon name="time-outline" size={16} color="#666" />
        <Text style={styles.agendaText}>Panel Discussion with industry insights</Text>
      </View>
      
      <Text style={styles.sectionTitle}>Highlights</Text>
      <Text style={styles.highlightsText}>Networking with industry leaders</Text>
      <Text style={styles.highlightsText}>Career development workshops</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="people-outline" size={20} color="#666" />
          <Text style={styles.statText}>{attendees}+ attendees</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="trending-up-outline" size={20} color="#666" />
          <Text style={styles.statText}>{engagementRate} engagement</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Speakers</Text>
      {speakers.map((speaker, index) => (
        <View key={index} style={styles.speakerItem}>
          <Icon name="person-circle-outline" size={20} color="#666" />
          <View style={styles.speakerTextContainer}>
            <Text style={styles.speakerName}>{speaker.name}</Text>
            <Text style={styles.speakerRole}>{speaker.role}</Text>
          </View>
        </View>
      ))}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.rsvpButton} onPress={onRSVP}>
          <Text style={styles.buttonText}>RSVP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
        {isVirtual && (
          <TouchableOpacity style={styles.joinButton} onPress={onJoinEvent}>
            <Text style={styles.buttonText}>Join Event</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {isVirtual && (
        <TouchableOpacity style={styles.locationButton}>
          <Icon name="map-outline" size={16} color="#666" />
          <Text style={styles.locationText}>Virtual Event Location Map</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '90%',
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#444',
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  agendaText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  highlightsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  speakerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  speakerTextContainer: {
    marginLeft: 10,
  },
  speakerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  speakerRole: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  rsvpButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  detailsButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  joinButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  locationText: {
    marginLeft: 5,
    color: '#666',
  },
});

export default EventCard;