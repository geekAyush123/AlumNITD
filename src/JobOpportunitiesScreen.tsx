import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, TextInput, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProp } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedBy?: string;
  salary?: string;
  description: string;
  postedDate: string;
}

interface JobOpportunitiesScreenProps {
  navigation: NavigationProp<any>;
}

const JobOpportunitiesScreen: React.FC<JobOpportunitiesScreenProps> = ({ navigation }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('jobs')
      .onSnapshot(querySnapshot => {
        const jobsList: Job[] = [];
        querySnapshot.forEach(doc => {
          jobsList.push({
            id: doc.id,
            ...doc.data(),
          } as Job);
        });
        setJobs(jobsList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().startsWith(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().startsWith(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || job.type === filter;
    return matchesSearch && matchesFilter;
  });

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
    >
      <View style={styles.jobHeader}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/50' }}
          style={styles.companyLogo} 
        />
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.companyName}>{item.company}</Text>
          <View style={styles.jobMeta}>
            <Text style={styles.jobLocation}>{item.location}</Text>
            <Text style={styles.jobType}>{item.type}</Text>
          </View>
        </View>
      </View>
      {item.postedBy && (
        <Text style={styles.postedBy}>Posted by: {item.postedBy}</Text>
      )}
      {item.salary && (
        <Text style={styles.salary}>Salary: {item.salary}</Text>
      )}
    </TouchableOpacity>
  );

  const getFilterDetails = (type: string) => {
    switch (type) {
      case 'full-time':
        return {
          icon: 'briefcase',
          count: jobs.filter(j => j.type === 'full-time').length
        };
      case 'part-time':
        return {
          icon: 'time-outline',
          count: jobs.filter(j => j.type === 'part-time').length
        };
      case 'internship':
        return {
          icon: 'school-outline',
          count: jobs.filter(j => j.type === 'internship').length
        };
      case 'remote':
        return {
          icon: 'home-outline',
          count: jobs.filter(j => j.type === 'remote').length
        };
      default:
        return {
          icon: 'options-outline',
          count: jobs.length
        };
    }
  };

  const filterTypes = ['all', 'full-time', 'part-time', 'internship', 'remote'];

  const BottomTabBar = () => (
    <View style={styles.bottomTabBar}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('home');
          navigation.navigate('Home');
        }}
      >
        <Icon 
          name={activeTab === 'home' ? 'home' : 'home-outline'} 
          size={24} 
          color={activeTab === 'home' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('jobs');
          navigation.navigate('JobOpportunities');
        }}
      >
        <Icon 
          name={activeTab === 'jobs' ? 'briefcase' : 'briefcase-outline'} 
          size={24} 
          color={activeTab === 'jobs' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('network');
          navigation.navigate('MyNetwork');
        }}
      >
        <Icon 
          name={activeTab === 'network' ? 'people' : 'people-outline'} 
          size={24} 
          color={activeTab === 'network' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'network' && styles.activeTabText]}>Network</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => {
          setActiveTab('profile');
          navigation.navigate('Profile');
        }}
      >
        <Icon 
          name={activeTab === 'profile' ? 'person' : 'person-outline'} 
          size={24} 
          color={activeTab === 'profile' ? '#A89CFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.fullContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs or companies"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filtersWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {filterTypes.map((type) => {
                const isActive = filter === type;
                const details = getFilterDetails(type);
                
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterChip,
                      isActive && styles.activeFilterChip,
                    ]}
                    onPress={() => setFilter(type)}
                  >
                    <Icon 
                      name={details.icon} 
                      size={16} 
                      color={isActive ? 'white' : '#666'} 
                      style={styles.filterIcon}
                    />
                    <Text style={[
                      styles.filterText,
                      isActive && styles.activeFilterText
                    ]}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Text>
                    <Text style={[
                      styles.filterCount,
                      isActive && styles.activeFilterCount
                    ]}>
                      {details.count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A89CFF" />
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="sad-outline" size={50} color="#666" />
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubText}>Try adjusting your filters</Text>
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                Showing {filteredJobs.length} {filter === 'all' ? 'jobs' : filter + ' jobs'}
              </Text>
            }
          />
        )}
      </SafeAreaView>
      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginBottom: 60, // Space for bottom tab bar
  },
  header: {
    backgroundColor: '#f5f5f5',
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  filtersWrapper: {
    height: 60,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  filterChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterChip: {
    backgroundColor: '#A89CFF',
    borderColor: '#A89CFF',
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
    flex: 1,
    fontSize: 12,
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 5,
    fontSize: 10,
    color: '#666',
  },
  activeFilterCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: 'white',
  },
  listContainer: {
    padding: 15,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  jobMeta: {
    flexDirection: 'row',
  },
  jobLocation: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  jobType: {
    fontSize: 12,
    color: '#A89CFF',
    fontWeight: 'bold',
  },
  postedBy: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  salary: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: 'bold',
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
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  resultsCount: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#A89CFF',
    fontWeight: 'bold',
  },
});

export default JobOpportunitiesScreen;