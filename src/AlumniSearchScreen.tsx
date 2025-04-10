import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  Keyboard, 
  ScrollView, 
  ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Alumni } from './App';
import debounce from 'lodash.debounce';

type AlumniSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AlumniSearch'>;

const AlumniSearchScreen = () => {
  const navigation = useNavigation<AlumniSearchScreenNavigationProp>();
  const [query, setQuery] = useState<string>('');
  const [allAlumni, setAllAlumni] = useState<Alumni[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all alumni data on component mount
  useEffect(() => {
    const fetchAllAlumni = async () => {
      try {
        const alumniSnapshot = await firestore().collection('alumni').get();
        const alumniData = alumniSnapshot.docs.map(doc => ({
          id: doc.id,
          fullName: doc.data().fullName || '',
          company: doc.data().company,
          jobTitle: doc.data().jobTitle,
          profilePic: doc.data().profilePic,
          location: doc.data().location,
          skills: doc.data().skills || [],
          graduationYear: doc.data().graduationYear,
          industry: doc.data().industry,
          skill: doc.data().skill
        } as Alumni));
        
        setAllAlumni(alumniData);
      } catch (error) {
        console.error('Error fetching alumni:', error);
      }
    };

    fetchAllAlumni();
  }, []);

  // Perform the search with debouncing
  const performSearch = useCallback(
    debounce((searchQuery: string, filters: string[]) => {
      if (searchQuery.trim() === '' && filters.length === 0) {
        setIsSearching(false);
        return;
      }

      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredResults = allAlumni.filter(alum => {
        // Apply text search
        const textMatch = searchQuery.trim() === '' ? true : [
          alum.fullName,
          alum.location,
          alum.industry,
          alum.graduationYear,
          alum.company,
          alum.jobTitle,
          ...(alum.skills || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(lowerCaseQuery);

        // Apply filters
        const filterMatch = filters.length === 0 ? true : filters.some(filter => {
          return (
            alum.graduationYear === filter ||
            alum.location === filter ||
            alum.industry === filter ||
            (alum.skills && alum.skills.includes(filter))
          );
        });

        return textMatch && filterMatch;
      });

      // Navigate to results page with the filtered results
      navigation.navigate('AlumniSearchResults', { 
        alumniList: filteredResults 
      });
      setIsSearching(false);
    }, 300),
    [allAlumni, navigation]
  );

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setQuery(text);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (query.trim() === '' && selectedFilters.length === 0) return;
    setIsSearching(true);
    performSearch(query, selectedFilters);
  };

  // Handle filter changes
  const toggleFilter = (filter: string) => {
    const newFilters = selectedFilters.includes(filter) 
      ? selectedFilters.filter(item => item !== filter) 
      : [...selectedFilters, filter];
    setSelectedFilters(newFilters);
  };

  const toggleFilterVisibility = () => {
    setShowFilters(!showFilters);
  };

  const renderHeader = () => (
    <>
      <Text style={styles.header}>Search Alumni</Text>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search by name, skills, company..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearchSubmit} style={styles.searchIcon}>
          {isSearching ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Icon name="search" size={25} color="black" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.filterToggleButton}
        onPress={toggleFilterVisibility}
      >
        <Text style={styles.filterToggleText}>Filters</Text>
        <Icon 
          name={showFilters ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="black" 
        />
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Graduation Year</Text>
          <View style={styles.filterContainer}>
            {['2020', '2021', '2022', '2023', '2024'].map(year => (
              <TouchableOpacity
                key={year}
                style={[styles.filterButton, selectedFilters.includes(year) && styles.selectedFilter]}
                onPress={() => toggleFilter(year)}
              >
                <Text style={styles.filterText}>{year}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterTitle}>Location</Text>
          <View style={styles.filterContainer}>
            {['City', 'State', 'Country'].map(location => (
              <TouchableOpacity
                key={location}
                style={[styles.filterButton, selectedFilters.includes(location) && styles.selectedFilter]}
                onPress={() => toggleFilter(location)}
              >
                <Text style={styles.filterText}>{location}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterTitle}>Industry</Text>
          <View style={styles.filterContainer}>
            {['Technology', 'Healthcare', 'Education'].map(industry => (
              <TouchableOpacity
                key={industry}
                style={[styles.filterButton, selectedFilters.includes(industry) && styles.selectedFilter]}
                onPress={() => toggleFilter(industry)}
              >
                <Text style={styles.filterText}>{industry}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterTitle}>Skills</Text>
          <View style={styles.filterContainer}>
            {['Java', 'Marketing', 'Data Analysis'].map(skill => (
              <TouchableOpacity
                key={skill}
                style={[styles.filterButton, selectedFilters.includes(skill) && styles.selectedFilter]}
                onPress={() => toggleFilter(skill)}
              >
                <Text style={styles.filterText}>{skill}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterActionButtons}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={() => setSelectedFilters([])}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={toggleFilterVisibility}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.searchButton} 
        onPress={handleSearchSubmit}
        disabled={isSearching}
      >
        {isSearching ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.searchButtonText}>Search</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient colors={['#A89CFF', '#C8A2C8']} style={styles.gradientContainer}>
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {renderHeader()}
        </ScrollView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );  
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: 'black',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  searchIcon: {
    marginLeft: 10,
    padding: 5,
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  filterToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
    color: 'black',
  },
  filterSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  filterTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 10,
    marginBottom: 5,
  },
  filterContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 10,
  },
  filterButton: { 
    backgroundColor: '#e0e0e0', 
    padding: 8, 
    borderRadius: 10, 
    margin: 5,
  },
  selectedFilter: { 
    backgroundColor: '#7B61FF',
  },
  filterText: { 
    color: 'black',
    fontSize: 14,
  },
  filterActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  resetButton: { 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 10, 
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#7B61FF',
  },
  applyButton: { 
    backgroundColor: '#7B61FF', 
    padding: 10, 
    borderRadius: 10, 
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: { 
    color: '#7B61FF',
    fontWeight: 'bold',
  },
  applyButtonText: { 
    color: 'white',
    fontWeight: 'bold',
  },
  searchButton: { 
    backgroundColor: 'black', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginVertical: 5,
  },
  searchButtonText: { 
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AlumniSearchScreen;