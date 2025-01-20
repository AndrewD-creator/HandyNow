import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const MyJobsScreen = () => {
  const { user } = useUser(); // Get the logged-in handyman's details
  const [jobs, setJobs] = useState([]); // Store handyman's jobs
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch jobs for the logged-in handyman
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:3000/bookings/my-jobs/${user.id}`);
        setJobs(response.data.jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        Alert.alert('Error', 'Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchJobs();
  }, [user?.id]);

  const handleCompleteJob = async (jobId) => {
    try {
      await axios.patch(`http://10.0.2.2:3000/bookings/mark-complete/${jobId}`);
      Alert.alert('Success', 'Job marked as complete, awaiting customer confirmation.');
  
      // Refresh the jobs list
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error('Error marking job as completed:', error);
      Alert.alert('Error', 'Failed to mark job as completed.');
    }
  };
  
  

  // Render individual job card
  const renderJob = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.customerName || 'Customer'}</Text>
      <Text style={styles.details}>{`Description: ${item.description}`}</Text>
      <Text style={styles.details}>{`Date: ${new Date(item.date).toLocaleDateString('en-IE')}`}</Text>
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => handleCompleteJob(item.id)}
      >
        <Text style={styles.completeButtonText}>Mark as Completed</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Jobs</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : jobs.length > 0 ? (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJob}
        />
      ) : (
        <Text style={styles.noJobsText}>You have no jobs at the moment.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  details: { fontSize: 14, marginBottom: 4 },
  completeButton: {
    marginTop: 10,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  noJobsText: { fontSize: 16, textAlign: 'center', color: '#555', marginTop: 20 },
});

export default MyJobsScreen;
