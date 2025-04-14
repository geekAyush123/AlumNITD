import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp } from '@react-navigation/native';

interface Connection {
  id: string;
  userId: string;
  fullName: string;
  profilePic?: string;
  jobTitle?: string;
  company?: string;
  connectionId: string; // Added to track the connection document ID
}

interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: string;
  fromUserProfilePic?: string;
  fromUserJobTitle?: string;
}

interface SentRequest {
  id: string;
  toUserId: string;
  toUserName: string;
  toUserProfilePic?: string;
  toUserJobTitle?: string;
  status: string;
}

interface MyNetworkScreenProps {
  navigation: NavigationProp<any>;
}

const MyNetworkScreen: React.FC<MyNetworkScreenProps> = ({ navigation }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);

  const fetchNetworkData = useCallback(async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.log("No current user found");
      return;
    }

    try {
      setLoading(true);

      // 1. Get all accepted connections
      const connectionsSnapshot = await firestore()
        .collection('connections')
        .where('users', 'array-contains', currentUser.uid)
        .where('status', '==', 'accepted')
        .get();

      // 2. Extract connected user IDs and connection document IDs
      const connectionsData = connectionsSnapshot.docs.flatMap(doc => {
        const users = doc.data().users;
        return users
          .filter((id: string) => id !== currentUser.uid)
          .map((userId: string) => ({
            userId,
            connectionId: doc.id
          }));
      });

      // 3. Remove duplicate user IDs using Map
      const uniqueConnections = Array.from(
        new Map(connectionsData.map(item => [item.userId, item])).values()
      );

      // 4. Fetch user documents
      const userDocs = await Promise.all(
        uniqueConnections.map(conn => 
          firestore().collection('users').doc(conn.userId).get()
        )
      );

      const connectedUsers = userDocs
        .filter(doc => doc.exists)
        .map((doc, index) => {
          const userData = doc.data();
          return {
            id: doc.id,
            userId: doc.id,
            connectionId: uniqueConnections[index].connectionId,
            fullName: userData?.fullName || 'Unknown',
            profilePic: userData?.profilePic,
            jobTitle: userData?.jobTitle,
            company: userData?.company,
          };
        });

      // 5. Get pending incoming requests
      const incomingRequestsSnapshot = await firestore()
        .collection('connectionRequests')
        .where('toUserId', '==', currentUser.uid)
        .where('status', '==', 'pending')
        .get();

      const incomingRequests = await Promise.all(
        incomingRequestsSnapshot.docs.map(async doc => {
          const data = doc.data();
          const fromUserDoc = await firestore().collection('users').doc(data.fromUserId).get();
          const fromUserData = fromUserDoc.data();
          return {
            id: doc.id,
            fromUserId: data.fromUserId,
            fromUserName: fromUserData?.fullName || 'Unknown',
            toUserId: currentUser.uid,
            status: data.status,
            fromUserProfilePic: fromUserData?.profilePic,
            fromUserJobTitle: fromUserData?.jobTitle,
          };
        })
      );

      // 6. Get pending sent requests
      const sentRequestsSnapshot = await firestore()
        .collection('connectionRequests')
        .where('fromUserId', '==', currentUser.uid)
        .where('status', '==', 'pending')
        .get();

      const sentRequests = await Promise.all(
        sentRequestsSnapshot.docs.map(async doc => {
          const data = doc.data();
          const toUserDoc = await firestore().collection('users').doc(data.toUserId).get();
          const toUserData = toUserDoc.data();
          return {
            id: doc.id,
            toUserId: data.toUserId,
            toUserName: toUserData?.fullName || 'Unknown',
            toUserProfilePic: toUserData?.profilePic,
            toUserJobTitle: toUserData?.jobTitle,
            status: data.status,
          };
        })
      );

      // Set all states
      setConnections(connectedUsers);
      setConnectionRequests(incomingRequests);
      setSentRequests(sentRequests);

    } catch (error) {
      console.error("Error fetching network data:", error);
      Alert.alert("Error", "Failed to load network data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchNetworkData);
    fetchNetworkData();
    return unsubscribe;
  }, [fetchNetworkData, navigation]);

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const batch = firestore().batch();

      // Update request status
      const requestRef = firestore().collection('connectionRequests').doc(requestId);
      batch.update(requestRef, { status: 'accepted' });

      // Create new connection
      const connectionRef = firestore().collection('connections').doc();
      batch.set(connectionRef, {
        users: [fromUserId, currentUser.uid],
        status: 'accepted',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
      await fetchNetworkData();
      Alert.alert("Success", "Connection request accepted");
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept connection request");
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await firestore().collection('connectionRequests').doc(requestId).update({ status: 'declined' });
      await fetchNetworkData();
    } catch (error) {
      console.error("Error declining request:", error);
      Alert.alert("Error", "Failed to decline connection request");
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await firestore().collection('connectionRequests').doc(requestId).delete();
      await fetchNetworkData();
    } catch (error) {
      console.error("Error canceling request:", error);
      Alert.alert("Error", "Failed to cancel connection request");
    }
  };

  const handleRemoveConnection = async (connectionId: string, otherUserId: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      Alert.alert(
        "Remove Connection",
        "Are you sure you want to remove this connection?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Remove", 
            onPress: async () => {
              // First delete the connection document
              await firestore().collection('connections').doc(connectionId).delete();
              
              // Then delete any related connection requests
              const requestsQuery = await firestore()
                .collection('connectionRequests')
                .where('status', 'in', ['accepted', 'declined'])
                .where('fromUserId', 'in', [currentUser.uid, otherUserId])
                .where('toUserId', 'in', [currentUser.uid, otherUserId])
                .get();
              
              const batch = firestore().batch();
              requestsQuery.docs.forEach(doc => {
                batch.delete(doc.ref);
              });
              
              await batch.commit();
              await fetchNetworkData();
              Alert.alert("Success", "Connection removed successfully");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error removing connection:", error);
      Alert.alert("Error", "Failed to remove connection");
    }
  };

  const renderConnection = ({ item }: { item: Connection }) => (
    <View style={styles.connectionItem}>
      <TouchableOpacity
        style={styles.connectionTouchable}
        onPress={() => navigation.navigate('ViewProfile', { userId: item.userId })}
      >
        <Image
          source={item.profilePic ? { uri: item.profilePic } : require('./assets/default-profile.jpg')}
          style={styles.profileImage}
        />
        <View style={styles.connectionInfo}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.job}>
            {item.jobTitle || ''} {item.company ? `at ${item.company}` : ''}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#888" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveConnection(item.connectionId, item.userId)}
      >
        <Icon name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const renderIncomingRequest = ({ item }: { item: ConnectionRequest }) => (
    <View style={styles.requestItem}>
      <Image
        source={item.fromUserProfilePic ? { uri: item.fromUserProfilePic } : require('./assets/default-profile.jpg')}
        style={styles.profileImage}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{item.fromUserName}</Text>
        <Text style={styles.job}>{item.fromUserJobTitle || 'Alumni'}</Text>
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

  const renderSentRequest = ({ item }: { item: SentRequest }) => (
    <View style={styles.requestItem}>
      <Image
        source={item.toUserProfilePic ? { uri: item.toUserProfilePic } : require('./assets/default-profile.jpg')}
        style={styles.profileImage}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{item.toUserName}</Text>
        <Text style={styles.job}>{item.toUserJobTitle || 'Alumni'}</Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => handleCancelRequest(item.id)}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
                renderItem={renderIncomingRequest} 
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {sentRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sent Requests ({sentRequests.length})</Text>
              <FlatList 
                data={sentRequests} 
                renderItem={renderSentRequest} 
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Connections ({connections.length})</Text>
            {connections.length > 0 ? (
              <FlatList 
                data={connections} 
                renderItem={renderConnection} 
                keyExtractor={item => item.userId}
                scrollEnabled={false}
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
  connectionTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  cancelButton: {
    backgroundColor: '#ff4444',
    marginTop: 8,
  },
  removeButton: {
    padding: 8,
    marginLeft: 10,
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