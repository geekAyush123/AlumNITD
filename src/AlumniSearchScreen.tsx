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
  ActivityIndicator,
  FlatList
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
  const [searchResults, setSearchResults] = useState<Alumni[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch all alumni data on component mount
  useEffect(() => {
    const fetchAllAlumni = async () => {
      try {
        const alumniSnapshot = await firestore().collection('users').get();
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
          fieldOfStudy: doc.data().fieldOfStudy,
          degree: doc.data().degree,
          institution: doc.data().institution,
          bio: doc.data().bio,
          jobDescription: doc.data().jobDescription
        } as Alumni));
        
        setAllAlumni(alumniData);
      } catch (error) {
        console.error('Error fetching alumni:', error);
      }
    };

    fetchAllAlumni();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, filters: string[]) => {
      if (searchQuery.trim() === '' && filters.length === 0) {
        setSearchResults([]);
        setIsSearching(false);
        setShowResults(false);
        return;
      }

      const lowerCaseQuery = searchQuery.toLowerCase();
      const results = allAlumni.filter(alum => {
        // Apply filters first
        const filterMatch = filters.length === 0 ? true : 
          filters.some(filter => {
            return (
              alum.graduationYear === filter ||
              alum.location === filter ||
              alum.industry === filter ||
              (alum.skills && alum.skills.includes(filter)) ||
              alum.fieldOfStudy === filter ||
              alum.institution === filter
            );
          });

        if (!filterMatch) return false;
        
        if (searchQuery.trim() === '') return true;

        // Apply text search across multiple fields
        const searchFields = [
          alum.fullName,
          alum.location,
          alum.industry,
          alum.graduationYear,
          alum.company,
          alum.jobTitle,
          alum.fieldOfStudy,
          alum.degree,
          alum.institution,
          alum.bio,
          alum.jobDescription,
          ...(alum.skills || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchFields.includes(lowerCaseQuery) || 
               searchFields.split(' ').some(word => word.startsWith(lowerCaseQuery));
      });

      setSearchResults(results);
      setIsSearching(false);
      setShowResults(searchQuery.trim().length > 0 || filters.length > 0);
    }, 300),
    [allAlumni]
  );

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setQuery(text);
    if (text.trim().length > 0 || selectedFilters.length > 0) {
      setIsSearching(true);
      debouncedSearch(text, selectedFilters);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setShowResults(false);
    }
  };

  // Handle filter changes
  const toggleFilter = (filter: string) => {
    const newFilters = selectedFilters.includes(filter) 
      ? selectedFilters.filter(item => item !== filter) 
      : [...selectedFilters, filter];
    setSelectedFilters(newFilters);
    
    // Trigger search when filters change
    if (query.trim().length > 0 || newFilters.length > 0) {
      setIsSearching(true);
      debouncedSearch(query, newFilters);
    }
  };

  const toggleFilterVisibility = () => {
    setShowFilters(!showFilters);
  };

  const handleResultSelect = (alum: Alumni) => {
    navigation.navigate('ViewProfile', { userId: alum.id });
    setShowResults(false);
    Keyboard.dismiss();
  };

  const renderSearchResult = ({ item }: { item: Alumni }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultSelect(item)}
    >
      <Text style={styles.resultName}>{item.fullName}</Text>
      <Text style={styles.resultDetails}>
        {item.jobTitle ? `${item.jobTitle}` : ''}
        {item.company ? ` at ${item.company}` : ''}
        {!item.jobTitle && !item.company && item.institution ? 
          `${item.institution} (${item.fieldOfStudy || 'Alumni'})` : ''}
      </Text>
      {item.location && (
        <Text style={[styles.resultDetails, { color: '#888' }]}>{item.location}</Text>
      )}
    </TouchableOpacity>
  );

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
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchIcon}>
          {isSearching ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Icon name="search" size={25} color="black" />
          )}
        </TouchableOpacity>
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#7B61FF" />
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="always"
              style={styles.resultsList}
            />
          ) : (
            <Text style={styles.noResultsText}>No results found</Text>
          )}
        </View>
      )}

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
            {['New York', 'California', 'Texas', 'London', 'Paris'].map(location => (
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
            {['Technology', 'Healthcare', 'Education', 'Finance', 'Marketing'].map(industry => (
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
            {['JavaScript', 'React', 'Marketing', 'Data Analysis', 'Leadership'].map(skill => (
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
              onPress={() => {
                setSelectedFilters([]);
                if (query.trim().length > 0) {
                  setIsSearching(true);
                  debouncedSearch(query, []);
                }
              }}
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
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setShowResults(false);
    }} accessible={false}>
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
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultsList: {
    paddingHorizontal: 10,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
    color: 'black',
  },
  resultDetails: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 15,
    alignItems: 'center',
  },
  noResultsText: {
    padding: 15,
    textAlign: 'center',
    color: '#666',
  },
});

export default AlumniSearchScreen;