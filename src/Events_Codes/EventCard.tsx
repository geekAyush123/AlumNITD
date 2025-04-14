import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';

interface Speaker {
  name: string;
  role: string;
}

interface EventCardProps {
  title: string;
  dateTime: string;
  description: string;
  image: ImageSourcePropType;
  onRSVP: () => void;
  onViewDetails: () => void;
  onJoinEvent?: () => void;
  isVirtual?: boolean;
  speakers?: Speaker[];
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  dateTime,
  description,
  image,
  onRSVP,
  onViewDetails,
  onJoinEvent,
  isVirtual = false,
  speakers = [],
}) => {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.dateTime}>{dateTime}</Text>
        <Text style={styles.description}>{description}</Text>
        
        {speakers.length > 0 && (
          <View style={styles.speakersContainer}>
            <Text style={styles.sectionTitle}>Speakers:</Text>
            {speakers.map((speaker, index) => (
              <View key={index} style={styles.speakerContainer}>
                <View style={styles.speakerTextContainer}>
                  <Text style={styles.speakerName}>{speaker.name}</Text>
                  <Text style={styles.speakerRole}>{speaker.role}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.rsvpButton} onPress={onRSVP}>
            <Text style={styles.buttonText}>RSVP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>
          {isVirtual && onJoinEvent && (
            <TouchableOpacity style={styles.virtualButton} onPress={onJoinEvent}>
              <Text style={styles.buttonText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    width: '90%',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 15,
  },
  speakersContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  speakerContainer: {
    marginBottom: 5,
  },
  speakerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speakerName: {
    fontWeight: '500',
  },
  speakerRole: {
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    backgroundColor: '#FF6B6B', // Coral red color for RSVP
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  detailsButton: {
    backgroundColor: '#4D96FF', // Bright blue color for Details
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  virtualButton: {
    backgroundColor: '#4CAF50', // Green color for Join
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default EventCard;