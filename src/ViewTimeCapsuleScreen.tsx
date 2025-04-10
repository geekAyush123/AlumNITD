import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './App';

interface ViewTimeCapsuleScreenProps {
  route: RouteProp<RootStackParamList, 'ViewTimeCapsule'>;
}

const ViewTimeCapsuleScreen: React.FC<ViewTimeCapsuleScreenProps> = ({ route }) => {
  const { capsule } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{capsule.title}</Text>
        <View style={styles.dateContainer}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            Created on {capsule.creationDate.toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {capsule.mediaUrls.length > 0 && (
        <Image 
          source={{ uri: capsule.mediaUrls[0] }} 
          style={styles.mainImage}
          resizeMode="cover"
        />
      )}
      
      <Text style={styles.message}>{capsule.message}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This capsule was unlocked on {capsule.unlockDate.toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 30,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ViewTimeCapsuleScreen;