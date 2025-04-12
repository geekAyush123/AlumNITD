import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  Keyboard,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Alumni } from './App';
import debounce from 'lodash.debounce';

type AlumniSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AlumniSearch'>;

const FILTER_CATEGORIES = [
  {
    name: 'Education',
    icon: 'school',
    fields: ['graduationYear', 'institution', 'fieldOfStudy', 'degree']
  },
  {
    name: 'Career',
    icon: 'briefcase',
    fields: ['company', 'jobTitle', 'skill']
  },
  {
    name: 'Location',
    icon: 'location',
    fields: ['location']
  }
];

const AlumniSearchScreen = () => {
  const navigation = useNavigation<AlumniSearchScreenNavigationProp>();
  const [query, setQuery] = useState('');
  const [allAlumni, setAllAlumni] = useState<Alumni[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Education');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Alumni[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filterInput, setFilterInput] = useState('');

  // Fetch all alumni data
  useEffect(() => {
    const fetchAllAlumni = async () => {
      try {
        const alumniSnapshot = await firestore().collection('users').get();
        const alumniData = alumniSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fullName: doc.data().fullName || '',
          skills: Array.isArray(doc.data().skills) ? doc.data().skills : [],
        } as Alumni));
        
        setAllAlumni(alumniData);
      } catch (error) {
        console.error('Error fetching alumni:', error);
      }
    };

    fetchAllAlumni();
  }, []);

  // Extract filter options for the active category
  const filterOptions = useMemo(() => {
    const activeFields = FILTER_CATEGORIES.find(c => c.name === activeCategory)?.fields || [];
    const options = new Set<string>();
    
    allAlumni.forEach(alum => {
      activeFields.forEach(field => {
        if (field === 'skill') {
          if (Array.isArray(alum.skills)) {
            alum.skills.forEach(skill => {
              if (skill) {
                options.add(`skill:${skill.toLowerCase().trim()}`);
              }
            });
          }
        } else {
          const value = alum[field as keyof Alumni];
          if (value) {
            options.add(`${field}:${value.toString().toLowerCase().trim()}`);
          }
        }
      });
    });

    return Array.from(options).sort();
  }, [allAlumni, activeCategory]);

  // Filter options based on search input
  const filteredOptions = useMemo(() => {
    if (!filterInput) return filterOptions;
    return filterOptions.filter(option => 
      option.toLowerCase().includes(filterInput.toLowerCase())
    );
  }, [filterOptions, filterInput]);

  // Filter alumni based on query and selected filters
  const filteredResults = useMemo(() => {
    if (query.trim() === '' && selectedFilters.length === 0) {
      return [];
    }
  
    const lowerCaseQuery = query.toLowerCase();
    return allAlumni.filter(alum => {
      // Apply filters first
      const filterMatch = selectedFilters.length === 0 ? true : 
        selectedFilters.some(filter => {
          const [filterType, filterValue] = filter.split(':');
          
          if (filterType === 'skill') {
            return Array.isArray(alum.skills) && 
              alum.skills.some(skill => skill.toLowerCase() === filterValue);
          }
          
          const fieldValue = alum[filterType as keyof Alumni];
          return fieldValue && fieldValue.toString().toLowerCase() === filterValue;
        });
  
      if (!filterMatch) return false;
      
      if (query.trim() === '') return true;
  
      // Apply text search
      const searchFields = [
        alum.fullName,
        alum.company,
        alum.jobTitle,
        alum.location,
        alum.institution,
        alum.fieldOfStudy,
        alum.degree,
        ...(Array.isArray(alum.skills) ? alum.skills : [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
  
      return searchFields.includes(lowerCaseQuery) || 
             searchFields.split(' ').some(word => word.startsWith(lowerCaseQuery));
    });
  }, [query, selectedFilters, allAlumni]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(() => {
      setSearchResults(filteredResults);
      setIsSearching(false);
      setShowResults(query.trim().length > 0 || selectedFilters.length > 0);
    }, 300),
    [filteredResults, query, selectedFilters]
  );

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setQuery(text);
    if (text.trim().length > 0 || selectedFilters.length > 0) {
      setIsSearching(true);
      debouncedSearch();
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setShowResults(false);
    }
  };

  // Toggle filter selection
  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(item => item !== filter) 
        : [...prev, filter]
    );
    
    if (query.trim().length > 0 || selectedFilters.length > 0) {
      setIsSearching(true);
      debouncedSearch();
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters([]);
    if (query.trim().length > 0) {
      setIsSearching(true);
      debouncedSearch();
    }
  };

  // Navigate to alumni profile
  const handleResultSelect = (alum: Alumni) => {
    navigation.navigate('ViewProfile', { userId: alum.id });
    setShowResults(false);
    Keyboard.dismiss();
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: Alumni }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultSelect(item)}
      accessible={true}
      accessibilityLabel={`View profile of ${item.fullName}, ${item.jobTitle || 'Alumni'} at ${item.company || item.institution || 'unknown'}`}
      accessibilityRole="button"
    >
      <Text style={styles.resultName}>{item.fullName}</Text>
      <Text style={styles.resultDetails}>
        {item.jobTitle ? `${item.jobTitle}` : ''}
        {item.company ? ` at ${item.company}` : ''}
        {!item.jobTitle && !item.company && item.institution ? 
          `${item.institution} (${item.fieldOfStudy || 'Alumni'})` : ''}
      </Text>
      {item.location && (
        <Text style={styles.resultLocation}>{item.location}</Text>
      )}
      {Array.isArray(item.skills) && item.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {item.skills.slice(0, 3).map((skill, index) => (
            <View 
              key={`${skill}-${index}`} 
              style={styles.skillTag}
              accessible={true}
              accessibilityLabel={`Skill: ${skill}`}
            >
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  // Render filter option
  const renderFilterOption = (option: string) => {
    const [type, value] = option.split(':');
    const displayValue = value.replace(/_/g, ' ');
    const isSelected = selectedFilters.includes(option);
    
    return (
      <TouchableOpacity
        key={option}
        style={[
          styles.filterOption,
          isSelected && styles.selectedFilterOption
        ]}
        onPress={() => toggleFilter(option)}
        accessible={true}
        accessibilityLabel={`${type} filter: ${displayValue}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        <Text style={[
          styles.filterOptionText,
          isSelected && styles.selectedFilterOptionText
        ]}>
          {displayValue}
        </Text>
        {isSelected && (
          <Icon name="checkmark" size={18} color="white" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback 
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <LinearGradient 
        colors={['#6A5ACD', '#9370DB']} 
        style={styles.gradientContainer}
        accessibilityLabel="Alumni search screen"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle} accessibilityRole="header">
                Alumni Search
              </Text>
              <Text style={styles.headerSubtitle}>
                Find and connect with alumni
              </Text>
            </View>

            {/* Search Bar */}
            <View 
              style={styles.searchContainer}
              accessible={true}
              accessibilityLabel="Search alumni"
            >
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, company, skills..."
                placeholderTextColor="#999"
                value={query}
                onChangeText={handleSearchChange}
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel="Search input"
                accessibilityHint="Type to search for alumni"
              />
              <View style={styles.searchIconContainer}>
                {isSearching ? (
                  <ActivityIndicator size="small" color="#6A5ACD" />
                ) : (
                  <Icon name="search" size={22} color="#6A5ACD" />
                )}
              </View>
            </View>

            {/* Active Filters */}
            {selectedFilters.length > 0 && (
              <View 
                style={styles.activeFiltersContainer}
                accessible={true}
                accessibilityLabel={`${selectedFilters.length} filters applied`}
              >
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.activeFiltersScroll}
                >
                  {selectedFilters.map(filter => {
                    const [type, value] = filter.split(':');
                    const displayValue = value.replace(/_/g, ' ');
                    
                    return (
                      <View 
                        key={filter} 
                        style={styles.activeFilter}
                        accessible={true}
                        accessibilityLabel={`Filter: ${type} ${displayValue}`}
                      >
                        <Text style={styles.activeFilterText}>
                          {type}: {displayValue}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => toggleFilter(filter)}
                          style={styles.removeFilterButton}
                          accessibilityLabel={`Remove ${type} ${displayValue} filter`}
                          accessibilityRole="button"
                        >
                          <Icon name="close" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  <TouchableOpacity
                    onPress={clearAllFilters}
                    style={styles.clearAllButton}
                    accessibilityLabel="Clear all filters"
                    accessibilityRole="button"
                  >
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {/* Search Results */}
            {showResults && (
              <View 
                style={styles.resultsContainer}
                accessible={true}
                accessibilityLabel={searchResults.length > 0 ? 
                  `${searchResults.length} search results` : 'No results found'}
              >
                {isSearching ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6A5ACD" />
                  </View>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchResult}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    nestedScrollEnabled={true}
                  />
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Icon name="search-circle-outline" size={40} color="#999" />
                    <Text style={styles.noResultsText}>No results found</Text>
                    <Text style={styles.noResultsSubtext}>
                      Try different search terms or filters
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Filter Categories */}
            <Text style={styles.sectionTitle}>Filter by</Text>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {FILTER_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.categoryButton,
                    activeCategory === category.name && styles.activeCategoryButton
                  ]}
                  onPress={() => setActiveCategory(category.name)}
                  accessible={true}
                  accessibilityLabel={`${category.name} filters`}
                  accessibilityRole="button"
                >
                  <Icon 
                    name={category.icon} 
                    size={20} 
                    color={activeCategory === category.name ? 'white' : '#6A5ACD'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    activeCategory === category.name && styles.activeCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Filter Options */}
            <View style={styles.filterOptionsContainer}>
              <TextInput
                style={styles.filterSearchInput}
                placeholder={`Search ${activeCategory.toLowerCase()} filters...`}
                placeholderTextColor="#999"
                value={filterInput}
                onChangeText={setFilterInput}
                accessibilityLabel={`Search ${activeCategory.toLowerCase()} filters`}
              />
              <View style={styles.filterOptionsGrid}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(renderFilterOption)
                ) : (
                  <Text style={styles.noFiltersText}>
                    No {activeCategory.toLowerCase()} filters available
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    paddingVertical: 0,
  },
  searchIconContainer: {
    marginLeft: 8,
    width: 24,
    alignItems: 'center',
  },
  activeFiltersContainer: {
    marginBottom: 16,
  },
  activeFiltersScroll: {
    paddingRight: 16,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 14,
    marginRight: 8,
  },
  removeFilterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  clearAllText: {
    color: 'white',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    maxHeight: 400,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  resultDetails: {
    color: '#555',
    fontSize: 14,
  },
  resultLocation: {
    color: '#777',
    fontSize: 13,
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    color: '#5E35B1',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  categoryContainer: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  activeCategoryButton: {
    backgroundColor: '#6A5ACD',
  },
  categoryText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: '500',
  },
  activeCategoryText: {
    fontWeight: 'bold',
  },
  filterOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterSearchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: '#6A5ACD',
  },
  filterOptionText: {
    color: '#333',
    marginRight: 8,
  },
  selectedFilterOptionText: {
    color: 'white',
  },
  noFiltersText: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 16,
  },
});

export default AlumniSearchScreen;