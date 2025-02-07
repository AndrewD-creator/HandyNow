import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios'; // (Axios Documentation, 2024)
import API_URL from "../../config/apiConfig"; 
import { useUser } from '../../context/UserContext'; // (React Context, 2024)

// (ChatGPT) - Prompt: How do I fetch and display job listings for a logged-in handyman with an option to mark them as complete?
const MyJobsScreen = () => {
  const { user } = useUser(); // Get the logged-in handyman's details
  const [jobs, setJobs] = useState([]); // Store handyman's jobs
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch jobs for the logged-in handyman (Axios Documentation, 2024)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/bookings/my-jobs/${user.id}`);
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

    // Function to handle job completion (ChatGPT, 2024)
  const handleCompleteJob = async (jobId) => {
    try {
      await axios.patch(`${API_URL}/bookings/mark-complete/${jobId}`);
      Alert.alert('Success', 'Job marked as complete, awaiting customer confirmation.');
  
      // Refresh the jobs list
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error('Error marking job as completed:', error);
      Alert.alert('Error', 'Failed to mark job as completed.');
    }
  };
  
  

  // Render individual job card (React Native FlatList Documentation, 2024)
  const renderJob = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.customerName || 'Customer'}</Text>
      <Text style={styles.details}>{`Description: ${item.description}`}</Text>
      <Text style={styles.details}>{`Date: ${new Date(item.date).toLocaleDateString('en-IE')}`}</Text>
            <Text style={styles.details}>{`Address: ${item.address}, ${item.county}, ${item.eircode}`}</Text>
      
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

// React Native styling (React Native Documentation, 2024)
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

// References:
// • React Native Documentation (2024). Available at: https://reactnative.dev/docs/components-and-apis
// • Axios Documentation (2024). Available at: https://axios-http.com/docs/intro
// • React Context (2024). Available at: https://react.dev/reference/react/useContext
// • React Native FlatList Documentation (2024). Available at: https://reactnative.dev/docs/flatlist
// • ChatGPT (2024).