import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getUserTimeCapsules, markCapsuleAsViewed, deleteTimeCapsule } from './TimeCapsuleService';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import notifee, { AndroidImportance } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';

interface TimeCapsuleItemProps {
  item: any;
  onPress: () => void;
  onDelete: () => void;
}

interface TimeCapsuleListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TimeCapsules'>;
}

const NEW_CAPSULE_MESSAGES = [
  "🎉 Time to time-travel! A new capsule just landed!",
  "🚀 Houston, we have a new time capsule!",
  "🕰️ Future you will thank present you for this new capsule!",
  "💎 You've got a new treasure chest for the future!",
  "📦 Package from the present, delivery to the future!"
];

const UNLOCKED_CAPSULE_MESSAGES = [
  "🔓 Ka-ching! A time capsule just unlocked!",
  "🎁 Surprise! Your past self has a gift for you!",
  "⏳ The future is now! Check your unlocked capsule!",
  "🪄 Abracadabra! Your time capsule has materialized!",
  "🦉 Owl post! You've got mail from the past!"
];

const getRandomFunkyMessage = (messages: string[]) => {
  return messages[Math.floor(Math.random() * messages.length)];
};

const TimeCapsuleItem: React.FC<TimeCapsuleItemProps> = ({ item, onPress, onDelete }) => {
  const isUnlocked = new Date() >= item.unlockDate;
  const user = auth().currentUser;
  const hasViewed = user && item.viewedBy.includes(user.uid);

  const renderRightActions = () => {
    return (
      <RectButton style={styles.deleteButton} onPress={onDelete}>
        <Icon name="trash-outline" size={24} color="white" />
      </RectButton>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity 
        style={[styles.itemContainer, isUnlocked && styles.unlockedContainer]}
        onPress={onPress}
        disabled={!isUnlocked}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {isUnlocked ? (
            <Icon name="lock-open" size={20} color="#4CAF50" />
          ) : (
            <Icon name="lock-closed" size={20} color="#FF9800" />
          )}
        </View>
        
        <Text style={styles.itemDate}>
          {isUnlocked ? 'Unlocked on: ' : 'Will unlock on: '}
          {item.unlockDate.toLocaleDateString()}
        </Text>
        
        {item.mediaUrls.length > 0 && (
          <Image 
            source={{ uri: item.mediaUrls[0] }} 
            style={styles.itemThumbnail} 
            resizeMode="cover"
          />
        )}
        
        {isUnlocked && hasViewed && (
          <Text style={styles.viewedText}>Viewed</Text>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
};

const TimeCapsuleListScreen: React.FC<TimeCapsuleListScreenProps> = ({ navigation }) => {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = auth().currentUser;

  const loadCapsules = async () => {
    try {
      if (!user) return;
      
      const data = await getUserTimeCapsules(user.uid);
      setCapsules(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load time capsules');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const displayNotification = async (title: string, body: string) => {
    try {
      await notifee.requestPermission();

      const channelId = await notifee.createChannel({
        id: 'time-capsules',
        name: 'Time Capsule Notifications',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
      });
      console.log('Notification channel created:', channelId); // Check logs
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  };

  const checkForUnlockedCapsules = (currentCapsules: any[]) => {
    const now = new Date();
    currentCapsules.forEach(capsule => {
      const isUnlocked = now >= capsule.unlockDate;
      const wasLocked = !capsules.some(c => c.id === capsule.id && new Date(c.unlockDate) <= now);
      
      if (isUnlocked && wasLocked) {
        displayNotification(
          'Time Capsule Unlocked!', 
          getRandomFunkyMessage(UNLOCKED_CAPSULE_MESSAGES)
        );
      }
    });
  };

  useEffect(() => {
    loadCapsules();

    if (user) {
      const unsubscribe = firestore()
        .collection('timeCapsules')
        .where('status', '==', 'active')
        .where('recipients', 'array-contains', user.uid)
        .orderBy('unlockDate', 'asc')
        .onSnapshot(snapshot => {
          const newCapsules = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            creationDate: doc.data().creationDate?.toDate() || new Date(),
            unlockDate: doc.data().unlockDate?.toDate() || new Date()
          }));

          if (newCapsules.length > capsules.length) {
            const newCapsule = newCapsules.find(
              nc => !capsules.some(c => c.id === nc.id)
            );
            
            if (newCapsule) {
              displayNotification(
                'New Time Capsule Received!', 
                getRandomFunkyMessage(NEW_CAPSULE_MESSAGES)
              );
            }
          }
          
          checkForUnlockedCapsules(newCapsules);
          setCapsules(newCapsules);
        }, error => {
          console.error('Snapshot error:', error);
        });

      return () => unsubscribe();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCapsules();
  };

  const handleOpenCapsule = async (capsule: any) => {
    if (user) {
      await markCapsuleAsViewed(capsule.id, user.uid);
    }
    navigation.navigate('ViewTimeCapsule', { capsuleId: capsule.id });
  };

  const handleDeleteCapsule = async (capsuleId: string) => {
    try {
      Alert.alert(
        'Delete Time Capsule',
        'Are you sure you want to delete this time capsule? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteTimeCapsule(capsuleId);
              setCapsules(capsules.filter(c => c.id !== capsuleId));
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error deleting capsule:', error);
      Alert.alert('Error', 'Failed to delete time capsule');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A89CFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={capsules}
        renderItem={({ item }) => (
          <TimeCapsuleItem 
            item={item} 
            onPress={() => handleOpenCapsule(item)}
            onDelete={() => handleDeleteCapsule(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="time-outline" size={50} color="#A89CFF" />
            <Text style={styles.emptyText}>No time capsules found</Text>
            <Text style={styles.emptySubText}>Create your first time capsule to get started</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateTimeCapsule')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 10,
    color: '#555',
  },
  emptySubText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 5,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    marginBottom: 5,
    elevation: 2,
    opacity: 0.8,
  },
  unlockedContainer: {
    opacity: 1,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  itemThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    marginTop: 5,
  },
  viewedText: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#8F85E6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    //elevation: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '80%',
    marginTop: 10,
    borderRadius: 10,
    marginRight: 10,
  },
});

export default TimeCapsuleListScreen;