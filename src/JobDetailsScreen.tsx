import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from './App';
import firestore from '@react-native-firebase/firestore';

type JobDetailsRouteProp = RouteProp<RootStackParamList, 'JobDetails'>;

interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedBy?: string;
  salary?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  postedDate: string;
  contactEmail?: string;
}

const JobDetailsScreen = () => {
  const route = useRoute<JobDetailsRouteProp>();
  const { jobId } = route.params;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const doc = await firestore().collection('jobs').doc(jobId).get();
        if (doc.exists) {
          setJob(doc.data() as JobDetails);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleApply = () => {
    if (job?.contactEmail) {
      Linking.openURL(`mailto:${job.contactEmail}?subject=Application for ${job.title}`);
    } else {
      Linking.openURL(`mailto:careers@example.com?subject=Application for ${job?.title}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A89CFF" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="sad-outline" size={50} color="#666" />
        <Text style={styles.emptyText}>Job not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.company}</Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Icon name="location-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="time-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{job.type}</Text>
          </View>
          {job.salary && (
            <View style={styles.metaItem}>
              <Icon name="cash-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{job.salary}</Text>
            </View>
          )}
        </View>
        {job.postedBy && (
          <Text style={styles.postedBy}>Posted by: {job.postedBy}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Description</Text>
        <Text style={styles.description}>{job.description}</Text>
      </View>

      {job.requirements && job.requirements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {job.requirements.map((req, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="ellipse" size={8} color="#333" style={styles.bullet} />
              <Text style={styles.listText}>{req}</Text>
            </View>
          ))}
        </View>
      )}

      {job.responsibilities && job.responsibilities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsibilities</Text>
          {job.responsibilities.map((resp, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="ellipse" size={8} color="#333" style={styles.bullet} />
              <Text style={styles.listText}>{resp}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <Text style={styles.applyButtonText}>Apply Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  company: {
    fontSize: 18,
    color: '#555',
    marginBottom: 15,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  metaText: {
    marginLeft: 5,
    color: '#666',
  },
  postedBy: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    marginTop: 8,
    marginRight: 8,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    flex: 1,
  },
  applyButton: {
    backgroundColor: '#A89CFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default JobDetailsScreen;