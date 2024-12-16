import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useUser } from "../src/context/UserContext"; // (React Context)
import { useRouter } from "expo-router"; // (Expo Router)

import axios from "axios";


const HandymanProfileScreen = () => {
  const { user, setUser } = useUser(); // (React Context)
  const [profile, setProfile] = useState({ bio: "", skills: [] });

  const router = useRouter(); // (Expo Router)
  console.log("User fetched in HandymanProfileScreen:", user);

  const [bio, setBio] = useState(""); 
  const [skills, setSkills] = useState([
    { id: 1, name: "Plumbing", selected: false },
    { id: 2, name: "Electrical", selected: false },
    { id: 3, name: "Carpentry", selected: false },
    { id: 4, name: "Painting", selected: false },
    { id: 5, name: "Landscaping", selected: false },
  ]);

  // (Axios HTTP Requests)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:3000/users/${user.id}/profile`);
        console.log("Fetched profile:", response.data);

        setProfile(response.data);
        setBio(response.data.bio); // Pre-fill bio field with fetched bio
        // Mark selected skills
        const updatedSkills = skills.map((skill) => ({
          ...skill,
          selected: response.data.skills.includes(skill.name),
        }));
        setSkills((prevSkills) =>
          prevSkills.map((skill) => ({
            ...skill,
            selected: response.data.skills.includes(skill.name),
          }))
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user.id]);

  const toggleSkill = (id) => {
    setSkills((prevSkills) =>
      prevSkills.map((skill) =>
        skill.id === id ? { ...skill, selected: !skill.selected } : skill
      )
    );
  };

// Adapted from (Axios HTTP Requests) & OpenAI (ChatGPT) - Prompt: Make sure the slected skills are being updated
  const saveProfile = async () => {
    const selectedSkills = skills.filter((skill) => skill.selected).map((skill) => skill.name);

    try {
      const response = await axios.put(`http://10.0.2.2:3000/users/${user.id}/profile`, {
        bio,
        skills: selectedSkills,
      });
      console.log("Profile saved:", response.data);
      Alert.alert("Success", "Profile saved successfully!");
      setProfile({ bio, skills: selectedSkills });

    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const logout = () => {
    setUser(null); // Clear user data from context
    router.replace("/"); // Navigate back to the login screen
  };

  //(Inspired by React Native TextInput Documentation & OpenAI)
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullname?.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user?.fullname || "Name not available"}</Text>
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Write something about yourself..."
          value={bio}
          onChangeText={(text) => setBio(text)}
          multiline
        />
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {skills.map((skill) => (
          <TouchableOpacity
            key={skill.id}
            style={[
              styles.skillItem,
              skill.selected && styles.skillItemSelected,
            ]}
            onPress={() => toggleSkill(skill.id)}
          >
            <Text
              style={[
                styles.skillText,
                skill.selected && styles.skillTextSelected,
              ]}
            >
              {skill.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>

 {/* Display Saved Profile */}
 <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Profile</Text>
        <Text style={styles.profileLabel}>Bio:</Text>
        <Text style={styles.profileValue}>{profile.bio || "No bio yet."}</Text>
        <Text style={styles.profileLabel}>Skills:</Text>
        <Text style={styles.profileValue}>
          {profile.skills.length > 0
            ? profile.skills.join(", ")
            : "No skills selected."}
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

//Adapted from OpenAI, (2024) & React Native Styling
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 50, 
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    minHeight: 80,
  },
  skillItem: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  skillItemSelected: {
    borderColor: "tomato",
    backgroundColor: "rgba(255, 99, 71, 0.1)",
  },
  skillText: {
    fontSize: 16,
    color: "#333",
  },
  skillTextSelected: {
    color: "tomato",
  },
  saveButton: {
    backgroundColor: "tomato",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
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
  profileLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  profileValue: {
    fontSize: 16,
    marginTop: 4,
  },
});

export default HandymanProfileScreen;

// References
// • React Native Official Documentation (2024), Available at:: https://reactnative.dev/docs/components-and-apis
// • React Context (2024), Available at:: https://react.dev/reference/react/useContext
// • Axios HTTP Requests (2024), Available at:: https://github.com/axios/axios
// • React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// • Expo Router for Navigation (2024), Available at:: https://expo.github.io/router/docs/
// • React Native TextInput Documentation (2024), Available at: https://reactnative.dev/docs/textinput
// • OpenAI (ChatGPT)