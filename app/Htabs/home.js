import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router"; //(Expo Router for Navigation, 2024)

const home = () => {
  const router = useRouter();

  // Inspired by Card Component
  return (
    <View style={styles.container}>
      <Text style={styles.title}>handyman home</Text>
    
     {/* Navigate to JobRequests */}
     <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("../src/screens/JobRequestsScreen")}
      >
        <View style={styles.cardContent}>
          <Image
            source={require('../assets/images/JobRequestsImage.png')} //Handyman Icon generated through AI
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

{/* Navigate to JobRequests */}
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
            View, Accept and Decline your job requests.
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
    </View>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 60,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardContent: {
    flexDirection: "row",
    marginLeft: -10, 
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
