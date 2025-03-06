import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator 
} from "react-native";
import API_URL from "../../config/apiConfig";
import axios from 'axios'; // (Axios HTTP Requests)import API_URL from "../../config/apiConfig";
import { useUser } from "../../context/UserContext";//(React Context, 2024)
import { Ionicons } from "@expo/vector-icons"; 

// (ChatGPT) - Prompt: How to fetch job requests for a handyman and respond with accept or decline
const JobRequestsScreen = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); 

    // Fetch job requests for the logged-in handyman (inspired by axios documentation, 2024)
  useEffect(() => {
    const fetchJobRequests = async () => {
      try {
        const response = await axios.get(`${API_URL}/bookings/requests/${user.id}`);
        setRequests(response.data.requests || []);
      } catch (error) {
        Alert.alert("Error", "Failed to load job requests.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchJobRequests();
  }, [user?.id]);

    // Function to handle accept or decline actions (ChatGPT - Prompt: How to update job request status via API)
  const handleResponse = async (id, status) => {
    setProcessing(id); //  Show loading on clicked button
    try {
      await axios.patch(`${API_URL}/bookings/respond/${id}`, { status });
      Alert.alert("Success", `Job ${status} successfully.`);
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (error) {
      Alert.alert("Error", "Failed to update job status.");
    } finally {
      setProcessing(null);
    }
  };

    // Render individual job request card (React Native Documentation - FlatList, 2024)
  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.customerName} - {`${new Date(item.date).toLocaleDateString('en-IE')}`} </Text>
        <Text style={styles.time}>{item.start_time} - {item.end_time}</Text>
      </View>
      
      <Text style={styles.details}>{item.description}</Text>
      <Text style={styles.address}>{`${item.address}, ${item.county}, ${item.eircode}`}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleResponse(item.id, "confirmed")}
          disabled={processing === item.id}
        >
          {processing === item.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Accept</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleResponse(item.id, "declined")}
          disabled={processing === item.id}
        >
          {processing === item.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Decline</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Job Requests</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : requests.length > 0 ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequest}
        />
      ) : (
        <Text style={styles.noRequests}>No job requests available.</Text>
      )}
    </View>
  );
};

// 🔹 Enhanced Styling
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  noRequests: { fontSize: 16, textAlign: "center", color: "#555", marginTop: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  time: { fontSize: 14, fontWeight: "bold", color: "#007bff" },
  details: { fontSize: 14, color: "#444", marginBottom: 4 },
  address: { fontSize: 13, color: "#777", fontStyle: "italic" },
  actions: { flexDirection: "row", marginTop: 12, justifyContent: "space-between" },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    marginRight: 5,
  },
  declineButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    marginLeft: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 5 },
});

export default JobRequestsScreen;

// References:
// • React Native Documentation (2024). Available at: https://reactnative.dev/docs/components-and-apis
// • Axios HTTP Requests (2024). Available at: https://github.com/axios/axios
// • React Context (2024). Available at: https://react.dev/reference/react/useContext
// • ChatGPT (2024) Prompt: How to fetch job requests for a handyman and respond with accept or decline?
// • React Native FlatList (2024). Available at: https://reactnative.dev/docs/flatlist