import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform, ScrollView,
} from "react-native";
import { useUser } from "../../context/UserContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker"; 
import axios from "axios";
import API_URL from "../../config/apiConfig"; 
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

const durations = [
  { label: "1 Hour", value: 60 },
  { label: "2 Hours", value: 120 },
  { label: "3 Hours", value: 180 },
];

const HandymanDetailsScreen = () => {
  const { selectedHandyman, user, setSelectedBooking } = useUser();
  const [date, setDate] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(60); // Default 1 hour
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (selectedHandyman?.id) {
      fetchAvailableTimes();
    }
  }, [date, selectedHandyman]);
  
  const fetchAvailableTimes = async () => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      console.log(`Fetching times for handyman_id: ${selectedHandyman.id} on ${formattedDate}`);
  
      const response = await axios.get(`${API_URL}/api/handyman/availability/times`, {
        params: { handyman_id: selectedHandyman.id, date: formattedDate },
      });
  
      console.log("API Response:", response.data);
  
      if (!response.data || !Array.isArray(response.data.times)) {
        throw new Error("Invalid API response format");
      }
  
      setAvailableTimes(response.data.times);
    } catch (error) {
      console.error("Error fetching times:", error.message);
      setAvailableTimes([]); // ✅ Prevents UI from breaking
    }
  };
  
  const getAvailableDurations = (startTime) => {
    if (!startTime) return []; // Prevent errors
  
    return durations
      .filter(({ value }) => {
        let currentTime = startTime;
        const requiredSlots = [];
  
        // 🔹 Generate required time slots
        for (let i = 0; i < value / 60; i++) {
          currentTime = calculateEndTime(currentTime, 60);
          requiredSlots.push(currentTime);
        }
  
        // ✅ Convert "HH:mm:ss" → "HH:mm"
        const formattedSlots = requiredSlots.map((time) => time.slice(0, 5));
  
        console.log(`🔍 Checking Time Blocks: ${formattedSlots}`);
        console.log(`📅 Available Times: ${availableTimes}`);
  
        // 🔹 Allow if all slots exist OR first required slot matches an end time of an existing booking
        const isAvailable = formattedSlots.every((slot, index) => {
          const isFirstSlot = index === 0;
  
          return (
            availableTimes.includes(slot) || // ✅ Slot exists in available times
            (isFirstSlot && existingBookings.some((booking) => booking.end_time.slice(0, 5) === slot)) // ✅ First slot is a previous booking’s end time
          );
        });
  
        console.log(`🧐 Checking: Start=${startTime}, Duration=${value}, Required Slots=${formattedSlots}, Available=${isAvailable}`);
  
        return isAvailable;
      })
      .map(({ value }) => value); // ✅ Extract only duration values
  };
  
  

  // 🔹 Handle Booking Submission
  const handleBooking = async () => {
    if (!startTime || !description) {
      Alert.alert("Error", "Please select a time and enter a description.");
      return;
    }
  
    const formattedDate = date.toISOString().split("T")[0];
    const endTime = startTime ? calculateEndTime(startTime, duration) : null;
    
    if (!endTime) {
      Alert.alert("Error", "Please select a valid time slot.");
      return;
    }

    // ✅ Define bookingData before logging it
    const bookingData = {
        handymanId: selectedHandyman.id,
        userId: user.id,
        date: formattedDate,
        startTime,
        endTime,
        duration,
        description,
    };

    console.log("📌 Sending Booking Data:", bookingData);
      
    try {
      const response = await axios.post(`${API_URL}/bookings`, bookingData);
  
      if (response.status === 201) {
        Alert.alert("Success", response.data.message);
        setSelectedBooking(response.data);
        router.push("src/screens/PaymentScreen");
      }
    
    } catch (error) {
      console.error("❌ Error creating booking:", error.response?.data || error.message);
      
      // 🔹 Show user-friendly alert if time slot is already booked
      Alert.alert("Booking Unavailable", error.response?.data?.error || "Failed to create booking.");
    }
};



  // 🔹 Calculate End Time Based on Duration
  const calculateEndTime = (start, duration) => {
    if (!start) return null; // 🔹 Prevents undefined error
  
    const [hour, minute] = start.split(":").map(Number); // Convert "09:00" -> [9, 0]
    if (isNaN(hour) || isNaN(minute)) return null; // 🔹 Prevent invalid values
  
    const endMinutes = hour * 60 + minute + duration; // 🔹 Convert to total minutes
    const endHour = Math.floor(endMinutes / 60) % 24; // 🔹 Prevent overflow
    const endMinute = endMinutes % 60;
  
    const formattedEndTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}:00`;
    
  
    return formattedEndTime;
  };
  

  return (
    <ScrollView style={styles.container}>
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
      

<View style={styles.section}>
  <Text style={styles.subtitle}>💰 Hourly Rate:</Text>
  <Text style={styles.skills}>
    €{selectedHandyman.hourly_rate || "N/A"}
  </Text>
</View>
</View>
      <View style={styles.bookingForm}>
        <Text style={styles.formTitle}>Book {selectedHandyman.fullname}</Text>
        <Text style={styles.dateLabel}>Select a date:</Text>

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

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
            minimumDate={new Date()}
          />
        )}

        {/* 🔹 Time Slot Selection */}
        <Text style={styles.subtitle}>Select a time:</Text>
        <View style={styles.timeContainer}>
  {availableTimes.length > 0 ? (
    availableTimes.map((time) => (
      <TouchableOpacity
        key={time}
        style={[
          styles.timeSlot,
          startTime === time && styles.selectedSlot,
        ]}
        onPress={() => setStartTime(time)}
      >
        <Text style={styles.timeText}>{time}</Text>
      </TouchableOpacity>
    ))
  ) : (
    <Text>No Available Times</Text> // ✅ Show message when no times exist
  )}
</View>


    {/* 🔹 Duration Selection */}
<Text style={styles.subtitle}>Select Duration:</Text>
<View style={styles.timeContainer}>
  {durations.map((min) => {
    const availableDurations = getAvailableDurations(startTime);
    const isAvailable = availableDurations.includes(Number(min.value)); // 🔥 Ensures data type match

    console.log(`🚀 Checking UI: Start=${startTime}, Duration=${min.value}, Available Durations:`, availableDurations);
    console.log(`🟢 UI Duration Check: ${min.value} | Available: ${isAvailable}`);
    
    return (
      <TouchableOpacity
        key={min.value} 
        style={[
          styles.timeSlot,
          duration === min.value && styles.selectedSlot,
          !isAvailable && styles.disabledSlot, // ✅ Only disable if unavailable
        ]}
        onPress={() => isAvailable && setDuration(min.value)}
        disabled={!isAvailable}
      >
        <Text style={[styles.timeText, !isAvailable && styles.disabledText]}>
          {min.label}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>






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
    </ScrollView>
  );
};

//Adapted from OpenAI, (2024) & React Native Styling
const styles = StyleSheet.create({
  timeContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  timeSlot: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc", 
    backgroundColor: "#fff", 
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: "30%",
    alignItems: "center",
  },
  selectedSlot: { backgroundColor: "#007bff" },
  timeText: { fontSize: 16, color: "#1a1919" },
  bookButton: { backgroundColor: "#007bff", padding: 14, borderRadius: 8 },
  bookButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
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
  disabledSlot: {
    backgroundColor: "#ccc", // Greyed out
  },
  disabledText: {
    color: "#666",
  },  
  bookButton: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30, 

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
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    paddingBottom: 20, // Adds space at the bottom to prevent cut-off
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

