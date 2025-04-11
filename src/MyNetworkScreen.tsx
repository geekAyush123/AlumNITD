import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp } from '@react-navigation/native';

// Define types for the connection data
interface Connection {
  id: string;
  fullName: string;
  profilePic?: string;
  jobTitle?: string;
  company?: string;
}

interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: string;
  fromUserProfilePic?: string;
}

interface MyNetworkScreenProps {
  navigation: NavigationProp<any>;
}

const MyNetworkScreen: React.FC<MyNetworkScreenProps> = ({ navigation }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    const fetchConnections = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      try {
        // Get accepted connections
        const connectionsQuery = await firestore()
          .collection('connections')
          .where('status', '==', 'accepted')
          .where('users', 'array-contains', currentUser.uid)
          .get();

        const connectionIds = connectionsQuery.docs.flatMap(doc => 
          doc.data().users.filter((id: string) => id !== currentUser.uid)
        );

        // Get pending requests
        const requestsQuery = await firestore()
          .collection('connectionRequests')
          .where('toUserId', '==', currentUser.uid)
          .where('status', '==', 'pending')
          .get();

        const requests = await Promise.all(requestsQuery.docs.map(async doc => {
          const data = doc.data();
          const userDoc = await firestore().collection('users').doc(data.fromUserId).get();
          return {
            id: doc.id,
            ...data,
            fromUserProfilePic: userDoc.data()?.profilePic
          } as ConnectionRequest;
        }));

        setConnectionRequests(requests);

        if (connectionIds.length > 0) {
          const usersSnapshot = await firestore()
            .collection('users')
            .where('uid', 'in', connectionIds)
            .get();

          const connectedUsers = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Connection[];
          setConnections(connectedUsers);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
        Alert.alert('Error', 'Failed to load network data');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    try {
      // Update request status
      await firestore()
        .collection('connectionRequests')
        .doc(requestId)
        .update({ status: 'accepted' });

      // Create connection document
      await firestore()
        .collection('connections')
        .add({
          users: [fromUserId, auth().currentUser?.uid],
          status: 'accepted',
          createdAt: firestore.FieldValue.serverTimestamp()
        });

      // Update local state
      setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Refresh connections
      const userDoc = await firestore().collection('users').doc(fromUserId).get();
      if (userDoc.exists) {
        setConnections(prev => [...prev, {
          id: fromUserId,
          ...userDoc.data()
        } as Connection]);
      }

      Alert.alert('Success', 'Connection request accepted');
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept connection request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await firestore()
        .collection('connectionRequests')
        .doc(requestId)
        .update({ status: 'declined' });

      setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert('Error', 'Failed to decline connection request');
    }
  };

  const renderConnection = ({ item }: { item: Connection }) => (
    <TouchableOpacity 
      style={styles.connectionItem}
      onPress={() => navigation.navigate('ViewProfile', { userId: item.id })}
    >
      <Image 
        source={item.profilePic ? { uri: item.profilePic } : require('./assets/default-profile.jpg')} 
        style={styles.profileImage}
      />
      <View style={styles.connectionInfo}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.job}>{item.jobTitle || ''} {item.company ? `at ${item.company}` : ''}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  const renderRequest = ({ item }: { item: ConnectionRequest }) => (
    <View style={styles.requestItem}>
      <Image 
        source={item.fromUserProfilePic ? { uri: item.fromUserProfilePic } : require('./assets/default-profile.jpg')} 
        style={styles.profileImage}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{item.fromUserName}</Text>
        <Text style={styles.job}>Wants to connect</Text>
        <View style={styles.requestButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item.id, item.fromUserId)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDeclineRequest(item.id)}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Network</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5C2D91" />
        </View>
      ) : (
        <>
          {connectionRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connection Requests ({connectionRequests.length})</Text>
              <FlatList
                data={connectionRequests}
                renderItem={renderRequest}
                keyExtractor={item => item.id}
              />
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Connections ({connections.length})</Text>
            {connections.length > 0 ? (
              <FlatList
                data={connections}
                renderItem={renderConnection}
                keyExtractor={item => item.id}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="people-outline" size={50} color="#888" />
                <Text style={styles.emptyText}>You don't have any connections yet</Text>
                <Text style={styles.emptySubtext}>Connect with alumni to build your network</Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5C2D91',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4B0082',
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  connectionInfo: {
    flex: 1,
  },
  requestInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  job: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  requestButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#5C2D91',
  },
  declineButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default MyNetworkScreen;