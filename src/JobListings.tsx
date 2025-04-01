import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

// Define Job type
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
}

const JobListings: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]); // Explicitly set the type

  useEffect(() => {
    const fetchJobs = async () => {
      const jobsCollection = await firestore().collection('jobs').get();
      setJobs(jobsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[]);
    };
    fetchJobs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Opportunities</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobCard}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text>{item.company}</Text>
            <Text>{item.location}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  jobCard: { padding: 15, backgroundColor: 'white', marginVertical: 5, borderRadius: 8 },
  jobTitle: { fontSize: 18, fontWeight: 'bold' },
});

export default JobListings;
