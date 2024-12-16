import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import CustomButton from '../../components/CustomButton';
import { useRouter } from "expo-router"; // (Expo Router for Navigation, 2024)
import { useUser } from "../../context/UserContext"; // (React Context, 2024) 




const SearchHandymanScreen = () => {
  const [county, setCounty] = useState("");
  const [handymen, setHandymen] = useState([]);
  const [error, setError] = useState(null);

  // ChatGPT: Prompt - How do i search handymen based on their county
  const searchHandymen = async () => {
    try {
      const response = await axios.get(
        `http://10.0.2.2:3000/search-handymen?county=${county}`
      );
      setHandymen(response.data.handymen);
      console.log(response.data.handymen); 

      // (Axios Docs Error Handling in Axios, 2024)
      setError(null); 
    } catch (err) {
      console.error("Error searching handymen:", err);
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

//ChatGPT: Prompt - How do i display handymen cards with their name, county & skills
  const renderHandyman = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleHandymanPress(item)}>
      <Text style={styles.name}>{item.fullname}</Text>
      <Text style={styles.details}>County: {item.county}</Text>
      <Text style={styles.details}>Skills: {item.skills.join(", ")}</Text>

    </TouchableOpacity>
  );

//(React Native Doc - Flatlist, 2024)
// (custom button and inputs inspired by NotJustDev, 2021)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for Handymen</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your county"
        value={county}
        onChangeText={setCounty}
      />
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
  error: {
    color: "red",
    marginTop: 8,
  },
});

export default SearchHandymanScreen;

//References:
// • React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// • Expo Router for Navigation (2024), Available at:: https://expo.github.io/router/docs/
// • OpenAI - ChatGPT
// •	NotJustDev (2021) React Native Login Authentication PART 1 (step-by-step tutorial) Available at: https://www.youtube.com/watch?v=ALnJLbjI7EY (Accessed on: 02/11/24)
// • Axios Docs Error Handling in Axios (2024), Available at: https://axios-http.com/docs/handling_errors
// • React Context (2024), Available at:: https://react.dev/reference/react/useContext
