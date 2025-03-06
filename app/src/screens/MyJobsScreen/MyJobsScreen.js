import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Alert, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Image Picker
import axios from "axios"; // (Axios Documentation, 2024)
import API_URL from "../../config/apiConfig"; 
import { useUser } from "../../context/UserContext"; // (React Context, 2024)
import { Ionicons } from "@expo/vector-icons"; 

// (ChatGPT) - Prompt: How do I fetch and display job listings for a logged-in handyman with an option to mark them as complete?
const MyJobsScreen = () => {
  const { user } = useUser(); 
  const [jobs, setJobs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState({});
  const [processingJob, setProcessingJob] = useState(null); // ✅ Track button state

    // Fetch jobs for the logged-in handyman (Axios Documentation, 2024)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/bookings/my-jobs/${user.id}`);
        setJobs(response.data.jobs);
      } catch (error) {
        Alert.alert("Error", "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchJobs();
  }, [user?.id]);

  const pickImage = async (jobId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri, jobId);
    }
  };

  const uploadImage = async (imageUri, bookingId) => {
    let formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      name: `completion_${bookingId}.jpg`,
      type: "image/jpeg",
    });

    try {
      const response = await axios.post(`${API_URL}/bookings/${bookingId}/completion-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.image) {
        const fullImageUrl = `${API_URL}${response.data.image}`;
        setUploadedImages((prev) => ({ ...prev, [bookingId]: fullImageUrl }));
        Alert.alert("Success", "Image uploaded successfully!");
      } else {
        throw new Error("Image URL not returned from server.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  const handleCompleteJob = async (jobId) => {
    setProcessingJob(jobId); // ✅ Show loading on clicked button
    try {
      await axios.patch(`${API_URL}/bookings/mark-complete/${jobId}`, {
        completion_image: uploadedImages[jobId] || "",
      });

      Alert.alert("Success", "Job marked as complete, awaiting customer confirmation.");
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      Alert.alert("Error", "Failed to mark job as completed.");
    } finally {
      setProcessingJob(null);
    }
  };

    // Render individual job card (React Native FlatList Documentation, 2024)
  const renderJob = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.customerName || "Customer"}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString("en-IE")}</Text>
      </View>

      <Text style={styles.details}>{item.description}</Text>
      <Text style={styles.address}>{`${item.address}, ${item.county}, ${item.eircode}`}</Text>

      {uploadedImages[item.id] && (
        <Image 
          source={{ uri: `${uploadedImages[item.id]}?timestamp=${new Date().getTime()}` }} 
          style={styles.previewImage} 
          resizeMode="cover"
        />
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(item.id)}>
        <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
        <Text style={styles.uploadButtonText}>Upload Completion Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.completeButton, !uploadedImages[item.id] && styles.disabledButton]}
        onPress={() => handleCompleteJob(item.id)}
        disabled={!uploadedImages[item.id]}
      >
        {processingJob === item.id ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-done" size={18} color="#fff" />
            <Text style={styles.completeButtonText}>Mark as Completed</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Jobs</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : jobs.length > 0 ? (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJob}
        />
      ) : (
        <Text style={styles.noJobsText}>You have no jobs at the moment.</Text>
      )}
    </View>
  );
};

// React Native styling (React Native Documentation, 2024)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  date: { fontSize: 14, fontWeight: "bold", color: "#007bff" },
  details: { fontSize: 14, color: "#444", marginBottom: 4 },
  address: { fontSize: 13, color: "#777", fontStyle: "italic" },
  previewImage: { 
    width: "100%", 
    height: 180, 
    borderRadius: 10, 
    marginVertical: 10, 
    alignSelf: "center" 
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 8,
    marginTop:8,
  },
  uploadButtonText: { color: "#fff", fontWeight: "bold", marginLeft: 5 },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  disabledButton: { backgroundColor: "#ccc" },
  completeButtonText: { color: "#fff", fontWeight: "bold", marginLeft: 5 },
  noJobsText: { fontSize: 16, textAlign: "center", color: "#555", marginTop: 20 },
});

export default MyJobsScreen;

// References:
// • React Native Documentation (2024). Available at: https://reactnative.dev/docs/components-and-apis
// • Axios Documentation (2024). Available at: https://axios-http.com/docs/intro
// • React Context (2024). Available at: https://react.dev/reference/react/useContext
// • React Native FlatList Documentation (2024). Available at: https://reactnative.dev/docs/flatlist
// • ChatGPT (2024).