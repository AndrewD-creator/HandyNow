import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; //(Expo Router for Navigation, 2024)
import { useUser } from "../src/context/UserContext"; 
import API_URL from "../src/config/apiConfig";
import axios from "axios"; 



//  Notification Badge Component
const NotificationBadge = ({ count }) => {
  if (count === 0) return null; // Hide badge if no items

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
};

const home = () => {
  const router = useRouter();
  const { user } = useUser(); // Get logged-in handyman info
  const [jobRequestsCount, setJobRequestsCount] = useState(0);
  const [myJobsCount, setMyJobsCount] = useState(0);
  const [disputesCount, setDisputesCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchCounts();
    }, [])
  );

  const fetchCounts = async () => {
    try {
      // Fetch Job Requests Count
      const jobRequestsRes = await axios.get(`${API_URL}/handyman/job-requests/count/${user.id}`);
      setJobRequestsCount(jobRequestsRes.data.count);

      // Fetch My Jobs Count
      const myJobsRes = await axios.get(`${API_URL}/handyman/my-jobs/count/${user.id}`);
      setMyJobsCount(myJobsRes.data.count);

      // Fetch Dispute Count
      const disputesRes = await axios.get(`${API_URL}/handyman/disputes/count/${user.id}`);
      setDisputesCount(disputesRes.data.count);

    } catch (error) {
      console.error("❌ Error fetching counts:", error);
    }
  };
  // Inspired by Card Component
  return (
    <ScrollView style={styles.container}>
<View style={styles.header}>
        
        <Text style={styles.title}>Welcome, {user?.fullname || "Handyman"}! 👋</Text>
      </View>    
     {/* Navigate to JobRequests */}
     <TouchableOpacity style={styles.card} onPress={() => router.push("../src/screens/JobRequestsScreen")}>
        <View style={styles.cardContent}>
          <Image source={require('../assets/images/JobRequests.png')} style={styles.cardImage} />
          <View>
            <Text style={styles.cardTitle}>Job Requests</Text>
            <Text style={styles.cardDescription}>View, Accept and Decline your job requests.</Text>
          </View>
        </View>
        <NotificationBadge count={jobRequestsCount} />
      </TouchableOpacity>

{/* Navigate to MyJobs */}
<TouchableOpacity style={styles.card} onPress={() => router.push("../src/screens/MyJobsScreen")}>
        <View style={styles.cardContent}>
          <Image source={require('../assets/images/JobRequestsImage.png')} style={styles.cardImage} />
          <View>
            <Text style={styles.cardTitle}>My Jobs</Text>
            <Text style={styles.cardDescription}>View and manage your upcoming job bookings.</Text>
          </View>
        </View>
        <NotificationBadge count={myJobsCount} />
      </TouchableOpacity>
      
      {/* Navigate to MyAvailability */}
<TouchableOpacity
        style={styles.card}
        onPress={() => router.push("../src/screens/AvailabilityScreen")}
      >
        <View style={styles.cardContent}>
          <Image
            source={require('../assets/images/MyAvailability.png')} //Handyman Icon generated through AI
            style={styles.cardImage}
          />
          <View>
            <Text style={styles.cardTitle}>My Availability</Text>
            <Text style={styles.cardDescription}>
            Manage your availability.
            </Text>
          </View>
        </View>
      </TouchableOpacity>

  {/* Navigate to Disputes */}
  <TouchableOpacity style={styles.card} onPress={() => router.push("../src/screens/HandymanDisputeScreen")}>
        <View style={styles.cardContent}>
          <Image source={require('../assets/images/Dispute.png')} style={styles.cardImage} />
          <View>
            <Text style={styles.cardTitle}>Disputes</Text>
            <Text style={styles.cardDescription}>Look at any job disputes.</Text>
          </View>
        </View>
        <NotificationBadge count={disputesCount} />
      </TouchableOpacity>
    </ScrollView>
  );
};




//Adapted from OpenAI, (2024) & React Native Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 50,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: "relative", 

    
  },
  cardContent: {
    flexDirection: "row",
    marginLeft: 0, 
  },
  cardImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20, 
    flexWrap: "wrap", 
    maxWidth: "80%", 
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "blue",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default home;

// References:
// Card Component, Available at: https://callstack.github.io/react-native-paper/docs/components/Card/
// React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// Expo Router Documentation (2024). Available at: https://expo.github.io/router/docs/
// ChatGPT by OpenAI
