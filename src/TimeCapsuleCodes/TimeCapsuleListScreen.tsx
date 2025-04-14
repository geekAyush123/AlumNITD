import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, SectionList } from 'react-native';
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
  const isUnlocked = new Date() >= new Date(item.unlockDate.seconds * 1000);
  const user = auth().currentUser;
  const hasViewed = user && item.viewedBy?.includes(user.uid);
  const unlockDate = item.unlockDate?.toDate?.() || new Date(item.unlockDate.seconds * 1000); // fallback for backward compatibility
  const daysUntilUnlock = isUnlocked ? 0 : Math.ceil((unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const creationDate = new Date(item.creationDate.seconds * 1000).toLocaleDateString();

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
        style={[
          styles.itemContainer, 
          isUnlocked ? styles.unlockedContainer : styles.lockedContainer,
          hasViewed && isUnlocked && styles.viewedContainer
        ]}
        onPress={onPress}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
          {isUnlocked ? (
            <Icon name="lock-open" size={20} color="#4CAF50" />
          ) : (
            <Icon name="lock-closed" size={20} color="#FF9800" />
          )}
        </View>
        
        <Text style={styles.itemDate}>
          Created on {creationDate}
        </Text>
        
        {!isUnlocked && (
          <View style={styles.countdownContainer}>
            <Icon name="time-outline" size={16} color="#6200ea" />
            <Text style={styles.countdownText}>
              {daysUntilUnlock} days until unlock
            </Text>
          </View>
        )}
        
        {item.mediaUrls?.length > 0 ? (
          <Image 
            source={{ uri: item.mediaUrls[0] }} 
            style={styles.itemThumbnail} 
            resizeMode="cover"
            blurRadius={isUnlocked ? 0 : 3}
          />
        ) : (
          <View style={[styles.itemThumbnail, styles.emptyThumbnail]}>
            <Icon 
              name={isUnlocked ? "open-outline" : "lock-closed-outline"} 
              size={40} 
              color="#6200ea" 
            />
          </View>
        )}
        
        {isUnlocked && (
          <View style={styles.statusContainer}>
            {hasViewed ? (
              <Text style={styles.viewedText}>
                <Icon name="checkmark-done" size={14} color="#4CAF50" /> Viewed
              </Text>
            ) : (
              <Text style={styles.newText}>
                <Icon name="sparkles" size={14} color="#FFC107" /> New!
              </Text>
            )}
          </View>
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
      const unlockDate = new Date(capsule.unlockDate.seconds * 1000);
      const isUnlocked = now >= unlockDate;
      const wasLocked = !capsules.some(c => c.id === capsule.id && new Date(c.unlockDate.seconds * 1000) <= now);
      
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
            creationDate: doc.data().creationDate,
            unlockDate: doc.data().unlockDate
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
        'Are you sure you want to delete this memory? This action cannot be undone.',
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

  const groupCapsules = () => {
    const now = new Date();
    const unlocked = capsules.filter(c => new Date(c.unlockDate.seconds * 1000) <= now);
    const locked = capsules.filter(c => new Date(c.unlockDate.seconds * 1000) > now);

    return [
      { title: 'Unlocked Memories', data: unlocked },
      { title: 'Future Surprises', data: locked }
    ];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
        <Text style={styles.loadingText}>Loading your memories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupCapsules()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TimeCapsuleItem 
            item={item} 
            onPress={() => handleOpenCapsule(item)}
            onDelete={() => handleDeleteCapsule(item.id)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length} items</Text>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../assets/empty-capsule.jpg')} 
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>No Time Capsules Yet</Text>
            <Text style={styles.emptyText}>Your memories from the past will appear here</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateTimeCapsule')}
            >
              <Text style={styles.emptyButtonText}>Create Your First Memory</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 15,
    color: '#6200ea',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#6200ea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionHeader: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  sectionCount: {
    fontSize: 12,
    color: '#666',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    elevation: 2,
  },
  lockedContainer: {
    opacity: 0.85,
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
  },
  unlockedContainer: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  viewedContainer: {
    backgroundColor: '#E8F5E9',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  countdownText: {
    fontSize: 12,
    color: '#6200ea',
    marginLeft: 5,
  },
  itemThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 5,
  },
  emptyThumbnail: {
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  viewedText: {
    color: '#4CAF50',
    fontSize: 12,
  },
  newText: {
    color: '#FF9800',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#6200ea',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
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