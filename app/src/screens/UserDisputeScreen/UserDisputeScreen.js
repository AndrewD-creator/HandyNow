import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // (Expo ImagePicker, 2024)
import { useRouter, useLocalSearchParams } from "expo-router"; // (Expo Router, 2024)
import axios from "axios"; // (Axios, 2024)
import API_URL from "../../config/apiConfig";
import { useUser } from "../../context/UserContext"; //(React Context, 2024)

   

const disputeReasons = [
  "Incomplete Work",
  "Overcharged",
  "Poor Service",
  "Handyman Didn't Show Up",
  "Other",
];

const UserDisputeScreen = () => {
  const router = useRouter();
  const { user,  } = useUser();
  const { bookingId,  handymanName, handyman_id } = useLocalSearchParams(); // ✅ Get handymanId
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // Store uploaded images

  useEffect(() => {
    console.log("Logged-in User:", user);

    
  }, [ user]);

  //  Select Image from Device (Expo ImagePicker, Image, 2024)
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "You need to allow access to upload images.");
      return;
    }

    
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1); // Remove image at index
    setImages(updatedImages);
  };
  
  //  Submit Dispute
  const submitDispute = async () => {
    if (!reason || !description) {
      Alert.alert("Error", "Please select a reason and provide details.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("booking_id", bookingId);
      formData.append("user_id", user.id);
      formData.append("handyman_id", handyman_id); //  Ensure we pass handyman_id, not name
      formData.append("reason", reason);
      formData.append("description", description);

      images.forEach((uri, index) => {
        formData.append(`images`, {
          uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg", //  Ensure correct image type
        });
      });

      await axios.post(`${API_URL}/disputes`, formData, { // (Axios, 2024)
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Your dispute has been submitted.");
      router.back(); //  Redirect to bookings

    } catch (error) {
      console.error("❌ Error submitting dispute:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to submit dispute.");
    }
  };

 // (React Native ScrollView, TouchableOpacity, 2024)
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Raise a Dispute</Text>
      <Text style={styles.subtitle}>Booking with {handymanName}</Text>

      {/* Dispute Reason Selection */}
      <Text style={styles.label}>Select a Reason:</Text>
      {disputeReasons.map((r) => (
        <TouchableOpacity
          key={r}
          style={[styles.reasonButton, reason === r && styles.selectedReason]}
          onPress={() => setReason(r)}
        >
          <Text style={[styles.reasonText, reason === r && styles.selectedReasonText]}>
            {r}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Description Input */}
      <Text style={styles.label}>Explain Your Issue:</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe what happened..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Upload Images (React Native Image, 2024) */}
<Text style={styles.label}>Upload Evidence (Optional):</Text>
<View style={styles.imageContainer}>
  {images.map((uri, index) => (
    <View key={index} style={styles.imageWrapper}>
      <Image source={{ uri }} style={styles.image} />
      
      {/* Remove Image Button  */}
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemoveImage(index)}
      >
        <Text style={styles.removeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  ))}
</View>

<TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
  <Text style={styles.uploadButtonText}>+ Upload Image</Text>
</TouchableOpacity>


      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={submitDispute}>
        <Text style={styles.submitButtonText}>Submit Dispute</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// (React Stylesheet, 2024)
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  reasonButton: {
    padding: 12,
    backgroundColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    width: "100%",
    alignItems: "center",
  },
  selectedReason: {
    backgroundColor: "#007bff",
  },
  reasonText: {
    fontSize: 16,
    color: "#333",
  },
  selectedReasonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    width: "100%",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
  },
  uploadButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    width: "100%",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#dc3545",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: 5,
    backgroundColor: "red",
    borderRadius: 15,
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  
});

export default UserDisputeScreen;

// References:
// - Axios. (2024). Available at: https://rapidapi.com/guides/axios-async-await
// - Expo Router. (2024). Available at: https://docs.expo.dev/router/introduction/
// - React. (2024). Available at: https://reactjs.org/docs/hooks-overview.html
// - React Context. (2024). Available at: https://reactjs.org/docs/context.html
// - Expo ImagePicker. (2024). Available at: https://docs.expo.dev/versions/latest/sdk/imagepicker/
// - React Native ScrollView. (2024). Available at: https://reactnative.dev/docs/scrollview
// - React Native Image. (2024). Available at: https://reactnative.dev/docs/image
// - React Native TouchableOpacity. (2024). Available at: https://reactnative.dev/docs/touchableopacity
// - React Stylesheet. (2024). Available at: https://reactnative.dev/docs/stylesheet
