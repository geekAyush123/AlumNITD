import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList, Alumni } from './App';

type AlumniSearchResultsNavigationProp = StackNavigationProp<RootStackParamList, 'AlumniSearchResults'>;

const AlumniSearchResults = () => {
  const navigation = useNavigation<AlumniSearchResultsNavigationProp>();
  const route = useRoute();
  const { alumniList } = route.params as { alumniList: Alumni[] };
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleViewProfile = (userId: string) => {
    try {
      setLoading(true);
      navigation.navigate('ViewProfile', { userId });
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAlumniCard = React.useCallback(({ item }: { item: Alumni }) => (
    <View style={styles.alumniCard}>
      <View style={styles.profileHeader}>
        {item.profilePic ? (
          <Image 
            source={{ uri: item.profilePic }} 
            style={styles.profileImage}
            onError={() => console.log("Error loading profile image")}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Icon name="person" size={30} color="#666" />
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.alumniName}>{item.fullName}</Text>
          {item.company && (
            <Text style={styles.alumniCompany}>
              <Icon name="business" size={14} color="#666" /> {item.company}
              {item.jobTitle && ` (${item.jobTitle})`}
            </Text>
          )}
          {item.location && (
            <Text style={styles.alumniLocation}>
              <Icon name="location" size={14} color="#666" /> {item.location}
            </Text>
          )}
          {item.graduationYear && (
            <Text style={styles.alumniGraduation}>
              <Icon name="school" size={14} color="#666" /> Class of {item.graduationYear}
            </Text>
          )}
        </View>
      </View>
      
      {item.skills && item.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.sectionTitle}>Skills:</Text>
          <View style={styles.skillsList}>
            {item.skills.slice(0, 3).map((skill, index) => (
              <View key={`${item.id}-${index}`} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {item.skills.length > 3 && (
              <View style={styles.skillTag}>
                <Text style={styles.skillText}>+{item.skills.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.viewProfileButton}
        onPress={() => handleViewProfile(item.id)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.viewProfileButtonText}>View Profile</Text>
            <Icon name="arrow-forward" size={16} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </View>
  ), [loading]);

  if (alumniList.length === 0) {
    return (
      <LinearGradient colors={['#A89CFF', '#C8A2C8']} style={styles.gradientContainer}>
        <View style={styles.emptyContainer}>
          <Icon name="search" size={50} color="#666" />
          <Text style={styles.emptyText}>No alumni found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Search</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#A89CFF', '#C8A2C8']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.resultsHeader}>
            {alumniList.length} {alumniList.length === 1 ? 'Result' : 'Results'} Found
          </Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>
        
        <FlatList
          data={alumniList}
          renderItem={renderAlumniCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7B61FF']}
              tintColor="#7B61FF"
            />
          }
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#7B61FF',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  alumniCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  alumniName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 3,
  },
  alumniCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  alumniLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  alumniGraduation: {
    fontSize: 14,
    color: '#666',
  },
  skillsContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#333',
  },
  viewProfileButton: {
    backgroundColor: '#7B61FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  viewProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default AlumniSearchResults;