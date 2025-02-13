import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router"; //(Expo Router for Navigation, 2024)

const home = () => {
  const router = useRouter();

  // (inspired by card component & react native styling)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin</Text>

      {/* Navigate to Search Handymen */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("../src/screens/AdminDisputeScreen")}
      >
        <View style={styles.cardContent}>
          <Image
            source={require('../assets/images/HandymanIcon2.png')} //Handyman Icon generated through AI
            style={styles.cardImage}
          />
          <View>
            <Text style={styles.cardTitle}>Disputes</Text>
            <Text style={styles.cardDescription}>
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

//References:
// • React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// • OpenAI - ChatGPT
// • Expo Router for Navigation (2024), Available at:: https://expo.github.io/router/docs/
// • Card Component, Available at: https://callstack.github.io/react-native-paper/docs/components/Card/