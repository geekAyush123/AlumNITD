import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getUserTimeCapsules, markCapsuleAsViewed } from './TimeCapsuleService';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';

interface TimeCapsuleItemProps {
  item: any;
  onPress: () => void;
}

interface TimeCapsuleListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TimeCapsules'>;
}

const TimeCapsuleItem: React.FC<TimeCapsuleItemProps> = ({ item, onPress }) => {
  const isUnlocked = new Date() >= item.unlockDate;
  const user = auth().currentUser;
  const hasViewed = user && item.viewedBy.includes(user.uid);

  return (
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

  useEffect(() => {
    loadCapsules();
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
    backgroundColor: '#A89CFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default TimeCapsuleListScreen;