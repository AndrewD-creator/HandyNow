import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router"; // (Expo Router for Navigation, 2024)
import { useUser } from "../../context/UserContext"; // (React Context, 2024)
import axios from "axios"; // (Axios HTTP Requests, 2024)
import API_URL from "../../config/apiConfig"; 
import { FontAwesome } from "@expo/vector-icons"; // Import star icons (Expo Vector Icons, 2024)


// (ChatGPT) - Prompt: How can I create a review system in React Native where users can rate a handyman with a star rating system
const ReviewScreen = () => {
  const router = useRouter();
  const { user, selectedBooking } = useUser();  // Ensure user is retrieved from context
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    console.log("Selected Booking:", selectedBooking);
    console.log("Logged-in User:", user);

    if (!selectedBooking || !selectedBooking.handyman_id) {
      Alert.alert("Error", "Missing booking details. Navigating back.");
      router.back();
    }
  }, [selectedBooking, user]);

    // Handle review submission (Axios HTTP Requests, 2024)
  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please provide a rating before submitting.");
      return;
    }

    if (!user || !user.id) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/reviews`, {
        handyman_id: selectedBooking.handyman_id,
        booking_id: selectedBooking.id,
        user_id: user.id, 
        rating,
        comment,
      });

      if (response.status === 201) {
        Alert.alert("Success", "Thank you for your review!");
        router.back(); // Navigate back to UserBookingsScreen
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  // Function to handle star rating selection
  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  if (!selectedBooking) {
    return null; // Avoid rendering if data is not available
  }

  // FontAwesome Star Rating (2024). 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate & Review</Text>
      <Text style={styles.label}>Handyman: {selectedBooking.handymanName}</Text>


      <Text style={styles.label}>Rating:</Text>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
            <FontAwesome
              name={star <= rating ? "star" : "star-o"}
              size={40}
              color="#FFD700"
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Comment (optional):</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your comment (optional)"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </TouchableOpacity>
    </View>
  );
};

// React Native styling (React Native Documentation, 2024)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 16, color: "#333" },
  label: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#555" },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  starIcon: {
    marginHorizontal: 5,
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
  textArea: { minHeight: 80, textAlignVertical: "top" },
  submitButton: { 
    backgroundColor: "#007bff", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center",
    elevation: 3,
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default ReviewScreen;


// References:
// • React Native Documentation (2024). Available at: https://reactnative.dev/docs/components-and-apis
// • Expo Router Documentation (2024). Available at: https://expo.github.io/router/docs/
// • Axios HTTP Requests (2024). Available at: https://axios-http.com/docs/intro
// • Expo Vector Icons (2024). Available at: https://docs.expo.dev/guides/icons/
// • FontAwesome Star Rating Example (2024). Available at: https://github.com/djchie/react-native-star-rating
// • ChatGPT by OpenAI 