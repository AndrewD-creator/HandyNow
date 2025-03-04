import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Picker } from '@react-native-picker/picker'; // React Native Community Picker GitHub Repository (2024)
import axios from "axios";
import API_URL from "../../config/apiConfig"; 
import CustomButton from '../../components/CustomButton';
import { useRouter } from "expo-router"; // (Expo Router for Navigation, 2024)
import { useUser } from "../../context/UserContext"; // (React Context, 2024) 
import { FontAwesome } from "@expo/vector-icons";  // Import FontAwesome for stars

const skillOptions = ["Plumbing", "Electrical", "Carpentry", "Painting", "Landscaping"];

const SearchHandymanScreen = () => {
  const [county, setCounty] = useState("");
  const [skill, setSkill] = useState("");

  const [handymen, setHandymen] = useState([]);
  const [error, setError] = useState(null);

  // ChatGPT: Prompt - How do i search handymen based on their county
  const searchHandymen = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/search-handymen?county=${county}&skill=${skill}`
      );
      setHandymen(response.data.handymen);
      console.log(response.data.handymen); 

      // (Axios Docs Error Handling in Axios, 2024)
      setError(null); 
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No handymen found in this area.");
      } else {
        setError("Failed to search. Please try again.");
      }
    }
  };

// (Expo Router for Navigation, 2024)
  const router = useRouter();
  const { setSelectedHandyman } = useUser();


  const handleHandymanPress = (handyman) => {
    setSelectedHandyman(handyman); 
    router.push("src/screens/HandymanDetailsScreen"); 
  };

// inspired by Card Componenet
//ChatGPT: Prompt - How do i display handymen cards with their name, county & skills
const renderHandyman = ({ item }) => (
  <TouchableOpacity style={styles.card} onPress={() => handleHandymanPress(item)}>
    <View style={styles.cardContent}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.fullname}</Text>
        <Text style={styles.details}>County: {item.county}</Text>
        <Text style={styles.details}>Skills: {item.skills.join(", ")}</Text>
        <Text style={styles.details}>💰 Hourly Rate: €{item.hourly_rate || "N/A"}</Text>

        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.average_rating.toFixed(2)}</Text>
        </View>
      </View>

      {/* Profile Picture on the Right */}
      {item.profile_picture ? (
        <Image
          source={{ uri: `${item.profile_picture}?timestamp=${new Date().getTime()}` }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.fullname.charAt(0)}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);


//(React Native Doc - Flatlist, 2024)
// (custom button and inputs inspired by NotJustDev, 2021)
// React Native Community Picker GitHub Repository (2024)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for Handymen</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your county"
        value={county}
        onChangeText={setCounty}
      />
       <Picker
        selectedValue={skill}
        style={styles.picker}
        onValueChange={(itemValue) => setSkill(itemValue)}
      >
        <Picker.Item label="Select a skill" value="" />
        {skillOptions.map((skill) => (
          <Picker.Item key={skill} label={skill} value={skill.toLowerCase()} />
        ))}
      </Picker>
      <CustomButton text="Search" onPress={searchHandymen} />

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={handymen}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHandyman}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

//Adapted from OpenAI, (2024) & React Native Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  list: {
    marginTop: 16,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  error: {
    color: "red",
    marginTop: 8,
  },
  handymanHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {
    flexDirection: "row", // Aligns text and image in a row
    justifyContent: "space-between", // Pushes content to opposite sides
    alignItems: "center", // Align vertically
  },
  textContainer: {
    flex: 1, // Takes up available space, ensuring text stays left
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: 10, // Adds spacing from text
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#cfe9ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    marginLeft: 10, // Adds spacing from text
    marginRight: 12,

  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007bff",
  },
  
});

export default SearchHandymanScreen;

//References:
// React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// Expo Router for Navigation (2024), Available at:: https://expo.github.io/router/docs/
// OpenAI - ChatGPT
// NotJustDev (2021) React Native Login Authentication PART 1 (step-by-step tutorial) Available at: https://www.youtube.com/watch?v=ALnJLbjI7EY (Accessed on: 02/11/24)
// Axios Docs Error Handling in Axios (2024), Available at: https://axios-http.com/docs/handling_errors
// React Context (2024), Available at:: https://react.dev/reference/react/useContext
// React Native Community Picker GitHub Repository (2024). Available at: https://github.com/react-native-picker/picker
// Card Component, Available at: https://callstack.github.io/react-native-paper/docs/components/Card/