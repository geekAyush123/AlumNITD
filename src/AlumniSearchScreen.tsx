import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

// Define Alumni Type
interface Alumni {
  id: string;
  fullName: string;
  skill?: string;
  location?: string;
}

const AlumniSearchScreen = ({ navigation }: { navigation: any }) => {
  const [query, setQuery] = useState<string>('');
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const snapshot = await firestore()
      .collection('alumni')
      .where('fullName', '>=', query)
      .where('fullName', '<=', query + '\uf8ff')
      .get();

    const results: Alumni[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alumni));
    setAlumniList(results);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(item => item !== filter) : [...prev, filter]
    );
  };

  return (
    <LinearGradient colors={['#A89CFF', '#C8A2C8']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView showsVerticalScrollIndicator={false}>
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

            <Text style={styles.filterTitle}>Filter Graduation Year</Text>
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

            <Text style={styles.filterTitle}>Filter Location</Text>
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

            <Text style={styles.filterTitle}>Filter Industry</Text>
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

            <Text style={styles.filterTitle}>Filter Skills</Text>
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

            <Text style={styles.filterTitle}>Sort By</Text>
            <View style={styles.filterContainer}>
              {['Relevance', 'Graduation Year', 'Alphabetical'].map(sortOption => (
                <TouchableOpacity
                  key={sortOption}
                  style={[styles.filterButton, selectedFilters.includes(sortOption) && styles.selectedFilter]}
                  onPress={() => toggleFilter(sortOption)}
                >
                  <Text style={styles.filterText}>{sortOption}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={() => setSelectedFilters([])}>
              <Text style={styles.buttonText}>Reset Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.buttonText}>Save Search</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>

            <FlatList
              data={alumniList}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.alumniCard}>
                  <Text style={styles.alumniName}>{item.fullName}</Text>
                  <Text style={styles.alumniDetails}>{item.skill || 'N/A'} | {item.location || 'N/A'}</Text>
                  <TouchableOpacity style={styles.connectButton}>
                    <Text style={styles.connectText}>Connect</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
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
    padding: 20,
  },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 6,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  filterTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  filterButton: { backgroundColor: '#e0e0e0', padding: 8, borderRadius: 10, margin: 5 },
  selectedFilter: { backgroundColor: '#7B61FF' },
  filterText: { color: 'black' },
  resetButton: { backgroundColor: 'white', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 5 },
  saveButton: { backgroundColor: 'white', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 5 },
  searchButton: { backgroundColor: 'black', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 5 },
  searchButtonText: { color: 'white' },
  alumniCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginVertical: 5 },
  alumniName: { fontSize: 18, fontWeight: 'bold' },
  alumniDetails: { fontSize: 14, color: 'gray' },
  connectButton: { backgroundColor: '#6200EE', padding: 8, borderRadius: 5, marginTop: 5 },
  connectText: { color: 'white', textAlign: 'center' },
  buttonText: { color: 'black' },
});

export default AlumniSearchScreen;  