import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useUser } from "../src/context/UserContext";
import { useRouter } from "expo-router";
import axios from "axios";
import API_URL from "../src/config/apiConfig"


const profile = () => {
  const { user, setUser } = useUser(); 
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter();

    // (React Context 2024)
  useEffect(() => {
    if (!user) return; // Ensure user is defined before fetching

    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for user ID:", user.id);
        const response = await axios.get(`${API_URL}/users/${user.id}`);
        console.log("Fetched profile:", response.data);
        setProfile(response.data); // Set profile data
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Alert.alert("Error", "Failed to load profile. Please try again.");
      } finally {
        setLoading(false); // Stop loading when done
      }
    };

    fetchProfile();
  }, [user?.id]); // Use optional chaining to prevent crashes

  const logout = () => {
    setUser(null); 
    router.replace("/"); 
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};


// (inspired by OpenAI and react native stylesheet)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 50, // Add padding at the top
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30, 
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default profile;

//References:
// React Native - stylesheet(2024), Available at:https://reactnative.dev/docs/next/stylesheet
// OpenAI - ChatGPT
// React Context (2024), Available at:: https://react.dev/reference/react/useContext
