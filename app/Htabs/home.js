import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router"; //(Expo Router for Navigation, 2024)
import { useUser } from "../src/context/UserContext"; 

const home = () => {
  const router = useRouter();
  const { user } = useUser(); // ✅ Get logged-in handyman info


  // Inspired by Card Component
  return (
    <ScrollView style={styles.container}>
<View style={styles.header}>
        
        <Text style={styles.title}>Welcome, {user?.fullname || "Handyman"}! 👋</Text>
      </View>    
     {/* Navigate to JobRequests */}
     <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("../src/screens/JobRequestsScreen")}
      >
        <View style={styles.cardContent}>
          <Image
            source={require('../assets/images/JobRequests.png')} //Handyman Icon generated through AI
            style={styles.cardImage}
          />
          <View>
            <Text style={styles.cardTitle}>Job Requests</Text>
            <Text style={styles.cardDescription}>
            View, Accept and Decline your job requests.
            </Text>
          </View>
        </View>
      </TouchableOpacity>

{/* Navigate to MyJobs */}
<TouchableOpacity
        style={styles.card}
        onPress={() => router.push("../src/screens/MyJobsScreen")}
      >
        <View style={styles.cardContent}>
          <Image
            source={require('../assets/images/JobRequestsImage.png')} //Handyman Icon generated through AI
            style={styles.cardImage}
          />
          <View>
            <Text style={styles.cardTitle}>My Jobs</Text>
            <Text style={styles.cardDescription}>
            View and manage your upcoming job bookings in one place.
            </Text>
          </View>
        </View>
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
  <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("../src/screens/HandymanDisputeScreen")}
      >
        <View style={styles.cardContent}>
          <Image
            source={require('../assets/images/MyAvailability.png')} //Handyman Icon generated through AI
            style={styles.cardImage}
          />
          <View>
            <Text style={styles.cardTitle}>Disputes</Text>
            <Text style={styles.cardDescription}>
            Look at any job disputes.
            </Text>
          </View>
        </View>
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
    marginTop: 40,
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
});

export default home;

// References:
// Card Component, Available at: https://callstack.github.io/react-native-paper/docs/components/Card/
// React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// Expo Router Documentation (2024). Available at: https://expo.github.io/router/docs/
// ChatGPT by OpenAI
