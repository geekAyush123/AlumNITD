import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

type Application = {
  id: string;
  title: string;
  company: string;
  status: 'Applied' | 'In Progress' | 'Rejected';
};

const applications: Application[] = [
  { id: '1', title: 'Software Engineer', company: 'Google', status: 'Applied' },
  { id: '2', title: 'UX Designer', company: 'Apple', status: 'In Progress' },
  { id: '3', title: 'Data Analyst', company: 'Microsoft', status: 'Rejected' },
];

const ApplicationScreen = () => {
  const getStatusStyle = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return styles.applied;
      case 'In Progress':
        return styles.inprogress;
      case 'Rejected':
        return styles.rejected;
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Filtered Applications</Text>
      <Text style={styles.subHeader}>Showing applications based on your filters</Text>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.company}>{item.company}</Text>
            <Text style={[styles.status, getStatusStyle(item.status)]}>
              {item.status}
            </Text>
          </View>
        )}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportText}>Export to CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton}>
          <Text style={styles.resetText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2A2FF',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  applied: {
    color: 'blue',
  },
  inprogress: {
    color: 'orange',
  },
  rejected: {
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  exportButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  exportText: {
    color: '#000',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  resetText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ApplicationScreen;