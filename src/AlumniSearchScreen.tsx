import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

interface Alumni {
  id: string;
  fullName: string;
  skill?: string;
  location?: string;
  graduationYear?: string;
  industry?: string;
}

type NavigationProps = {
  navigation: {
    navigate: (screen: string, params?: { alumniList: Alumni[] }) => void;
  };
};

const AlumniSearchScreen = ({ navigation }: NavigationProps) => {
  const [query, setQuery] = useState<string>('');
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    try {
      let queryRef: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> = 
        firestore().collection('alumni');

      if (query.trim()) {
        queryRef = queryRef
          .where('fullName', '>=', query)
          .where('fullName', '<=', query + '\uf8ff');
      }

      if (selectedFilters.length > 0) {
        const graduationYears = selectedFilters.filter(f => ['2020', '2021', '2022', '2023', '2024'].includes(f));
        const locations = selectedFilters.filter(f => ['City', 'State', 'Country'].includes(f));
        const industries = selectedFilters.filter(f => ['Technology', 'Healthcare', 'Education'].includes(f));
        const skills = selectedFilters.filter(f => ['Java', 'Marketing', 'Data Analysis'].includes(f));

        if (graduationYears.length > 0) {
          queryRef = queryRef.where('graduationYear', 'in', graduationYears);
        }
        if (locations.length > 0) {
          queryRef = queryRef.where('location', 'in', locations);
        }
        if (industries.length > 0) {
          queryRef = queryRef.where('industry', 'in', industries);
        }
        if (skills.length > 0) {
          queryRef = queryRef.where('skill', 'in', skills);
        }
      }

      const snapshot = await queryRef.get();
      const results: Alumni[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alumni));
      setAlumniList(results);
    } catch (error) {
      console.error('Error searching alumni:', error);
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(item => item !== filter) : [...prev, filter]
    );
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
          placeholder="Search Alumni by Name, Skills, or Keywords"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Icon name="search" size={25} color="black" />
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

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <LinearGradient colors={['#A89CFF', '#C8A2C8']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>
            {renderHeader()}
            {alumniList.length > 0 && (
              <TouchableOpacity 
                style={styles.viewResultsButton}
                onPress={() => {
                  console.log('Navigating with alumniList:', alumniList);
                  navigation.navigate('AlumniSearchResults', { alumniList });
                }}
              >
                <Text style={styles.viewResultsButtonText}>View All Results ({alumniList.length})</Text>
              </TouchableOpacity>
            )}
          </>
        </TouchableWithoutFeedback>
      </View>
    </LinearGradient>
  );  
};

const styles = StyleSheet.create({
  viewResultsButton: {
    backgroundColor: '#7B61FF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  viewResultsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
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
    padding: 3,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    fontSize: 16,
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