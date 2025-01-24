import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios'; // (Axios HTTP Requests)
import { useUser } from '../../context/UserContext'; // (React Context, 2024)

// (ChatGPT) - Prompt: How to fetch job requests for a handyman and respond with accept or decline
const JobRequestsScreen = () => {
  const { user } = useUser(); // Fetch logged-in handyman details
  const [requests, setRequests] = useState([]); // Store job requests
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch job requests for the logged-in handyman (inspired by axios documentation, 2024)
  useEffect(() => {
    const fetchJobRequests = async () => {
      try {
        console.log('Fetching job requests for handymanId:', user.id);

        const response = await axios.get(`http://10.0.2.2:3000/bookings/requests/${user.id}`);

        console.log('API Response:', response.data);

        if (response.data?.requests) {
          setRequests(response.data.requests);
        } else {
          console.error('Unexpected API response format:', response.data);
          Alert.alert('Error', 'Unexpected response from server.');
        }
      } catch (error) {
        console.error('Error fetching job requests:', error.message);
        Alert.alert('Error', 'Failed to load job requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchJobRequests();
  }, [user?.id]);

  // Function to handle accept or decline actions (ChatGPT - Prompt: How to update job request status via API)
  const handleResponse = async (id, status) => {
    try {
      const response = await axios.patch(`http://10.0.2.2:3000/bookings/respond/${id}`, { status });

      console.log(`Booking ${id} ${status} response:`, response.data);

      Alert.alert('Success', `Job ${status} successfully.`);
      // Remove the handled job from the list
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (error) {
      console.error(`Error updating booking ${id} status to ${status}:`, error.message);
      Alert.alert('Error', 'Failed to update job status. Please try again.');
    }
  };

  // Render individual job request card (React Native Documentation - FlatList, 2024)
  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.customerName}</Text>
      <Text style={styles.details}>{`Description: ${item.description}`}</Text>
      <Text style={styles.details}>{`Date: ${new Date(item.date).toLocaleDateString('en-IE')}`}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleResponse(item.id, 'confirmed')}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleResponse(item.id, 'declined')}
        >
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Job Requests</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : requests.length > 0 ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequest}
        />
      ) : (
        <Text>No job requests available.</Text>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { padding: 16, backgroundColor: '#fff', marginBottom: 8, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  details: { marginTop: 4, fontSize: 14 },
  actions: { flexDirection: 'row', marginTop: 8 },
  acceptButton: { backgroundColor: '#28a745', padding: 8, borderRadius: 4, marginRight: 8 },
  declineButton: { backgroundColor: '#dc3545', padding: 8, borderRadius: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default JobRequestsScreen;

// References:
// • React Native Documentation (2024). Available at: https://reactnative.dev/docs/components-and-apis
// • Axios HTTP Requests (2024). Available at: https://github.com/axios/axios
// • React Context (2024). Available at: https://react.dev/reference/react/useContext
// • ChatGPT (2024) Prompt: How to fetch job requests for a handyman and respond with accept or decline?
// • React Native FlatList (2024). Available at: https://reactnative.dev/docs/flatlist