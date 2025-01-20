// (React Native Documentation)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useUser } from "../../context/UserContext";
import DateTimePicker from "@react-native-community/datetimepicker"; 
import axios from "axios"; // (Axios HTTP Requests)
import { MaterialIcons } from "@expo/vector-icons"; // (Expo Vector Icons)
import { FontAwesome } from "@expo/vector-icons";  // Import FontAwesome for stars


const HandymanDetailsScreen = () => {
  const { selectedHandyman, user } = useUser();
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

    // Booking logic (OpenAI, 2024)
  const handleBooking = async () => {
    if (!date || !description) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const formattedDate = date.toISOString().split("T")[0];

      //(Inspired by Axios HTTP Requests)
      const response = await axios.post("http://10.0.2.2:3000/bookings", {
        handymanId: selectedHandyman.id,
        userId: user.id,
        date: formattedDate,
        description,
      });

      if (response.status === 201) {
        Alert.alert("Success", response.data.message);
        setDate(new Date());
        setDescription("");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert("Error", "Failed to create booking. Please try again.");
    }
  };

const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  if (!selectedHandyman) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No handyman selected.</Text>
      </View>
    );
  }

    // Main UI (adapted from Material UI styling, React Native TextInput Documentation, & OpenAI, 2024)
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {selectedHandyman.fullname?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.title}>{selectedHandyman.fullname}</Text>
          <Text style={styles.location}>{selectedHandyman.county}</Text>
        </View>

  {/* Handyman Rating */}
  <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={24} color="#FFD700" />
          <Text style={styles.ratingText}>
            {selectedHandyman.average_rating?.toFixed(2)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Bio:</Text>
          <Text style={styles.bio}>
            {selectedHandyman.bio || "No bio available."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Skills:</Text>
          <Text style={styles.skills}>
            {selectedHandyman.skills?.join(", ") || "No skills listed."}
          </Text>
        </View>
      </View>

      <View style={styles.bookingForm}>
        <Text style={styles.formTitle}>Book {selectedHandyman.fullname}</Text>
        <Text style={styles.dateLabel}>Select a date:</Text>

        {// MaterialIcons used for adding a calendar icon. (Expo Vector Icons)
}
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="calendar-today" size={20} color="#555" />
          <Text style={styles.dateText}>
            {date.toLocaleDateString("en-IE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
        </TouchableOpacity>

        {// DateTimePicker for selecting a booking date. (React Native DateTimePicker)
        }
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={"default"}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your request"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Submit Booking</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#cfe9ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007bff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  location: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: "#333",
    textAlign: "justify",
  },
  skills: {
    fontSize: 16,
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  bookingForm: {
    marginTop: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  dateLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  bookButton: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
  error: {
    fontSize: 18,
    color: "red",
  },
});

export default HandymanDetailsScreen;

// References:
// • React Native Documentation. Available at: https://reactnative.dev/docs/components-and-apis
// • React Native DateTimePicker Documentation. Available at: https://www.npmjs.com/package/@react-native-community/datetimepicker
// • Expo Vector Icons. Available at: https://docs.expo.dev/guides/icons/
// • Axios HTTP Requests (2024), Available at:: https://github.com/axios/axios
// • React Context (2024), Available at:: https://react.dev/reference/react/useContext
// • Expo documentation, Available at: https://docs.expo.dev/
// • Material UI design concepts, Available at: https://mui.com/
// • React Native TextInput Documentation (2024), Available at: https://reactnative.dev/docs/textinput
// • React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// • ChatGPT by OpenAI
