import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  TextInput,
   Modal,
} from "react-native";
import axios from "axios"; // (Axios, 2024)
import API_URL from "../../config/apiConfig";
import { useUser } from "../../context/UserContext";  // (React Context, 2024)
import { useRouter } from "expo-router";  // (Expo Router, 2024)


const HandymanDisputeScreen = () => {
  const { user } = useUser();
  const router = useRouter();
  const [disputes, setDisputes] = useState([]); // (React, 2024)
  const [loading, setLoading] = useState(true);
  const [rejectComments, setRejectComments] = useState({});
  const [selectedImage, setSelectedImage] = useState(null); // ✅ Store the selected image


  useEffect(() => {
    fetchDisputes();
  }, []);

  //  Fetch Disputes for Handyman
  const fetchDisputes = async () => {
    try {
      const response = await axios.get(`${API_URL}/handyman/${user.id}/disputes`); // (Axios, 2024)
  
      console.log("📩 RAW API RESPONSE FROM SERVER:", response.data);
  
      const formattedDisputes = response.data.disputes.map((dispute) => ({
        ...dispute,
        images: Array.isArray(dispute.images) ? dispute.images : [], //  Ensure images is an array
      }));

      setDisputes(formattedDisputes);
    } catch (error) {
      console.error("❌ Error fetching disputes:", error);
      Alert.alert("Error", "Failed to load disputes.");
    } finally {
      setLoading(false);
    }
  };

  //  Format Date to Irish Format (DD/MM/YYYY)
  const formatDate = (isoDate) => {
    if (!isoDate) return "Invalid Date";
    return isoDate.split("T")[0].split("-").reverse().join("/"); //  Converts YYYY-MM-DD → DD/MM/YYYY
  };

    //  Handle Image Click to Show Fullscreen Modal
    const handleImagePress = (imageUrl) => {
        setSelectedImage(imageUrl);
      };
    
      //  Close Image Modal
      const closeImageModal = () => {
        setSelectedImage(null);
      };

  //  Accept Dispute (Refund Customer)
  const handleAcceptDispute = async (disputeId) => {
    Alert.alert(
      "Confirm Acceptance",
      "Are you sure you want to accept this dispute? The customer will be refunded.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            try {
              await axios.patch(`${API_URL}/handyman/respond-dispute`, { // (Axios, 2024)
                disputeId,
                handymanId: user.id,
                response: "accepted",
              });
              Alert.alert("Success", "Dispute resolved. Customer refunded.");
              fetchDisputes();
            } catch (error) {
              console.error("❌ Error accepting dispute:", error);
              Alert.alert("Error", "Failed to process dispute.");
            }
          },
        },
      ]
    );
  };

  //  Reject Dispute (Escalate to Admin)
  const handleRejectDispute = async (disputeId) => {
    if (!rejectComments[disputeId]) {
      Alert.alert("Error", "Please provide a comment before rejecting.");
      return;
    }

    try {
      await axios.patch(`${API_URL}/handyman/respond-dispute`, { // (Axios, 2024)
        disputeId,
        handymanId: user.id,
        response: "rejected",
        resolutionDetails: rejectComments[disputeId],
      });

      Alert.alert("Dispute Escalated", "The dispute has been sent to an admin for review.");
      fetchDisputes();
    } catch (error) {
      console.error("❌ Error rejecting dispute:", error);
      Alert.alert("Error", "Failed to escalate dispute.");
    }
  };

  //  Render Dispute Item
  const renderDisputeItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.customerName}>Customer: {item.customer_name}</Text>
      <Text style={styles.date}>Booking Date: {formatDate(item.booking_date)}</Text>
      <Text style={styles.reason}>Reason: {item.reason}</Text>
      <Text style={styles.description}>{item.description}</Text>

      {/* Show Images if uploaded (Inspired by React Native Image and ChatGPT) */}
      {item.images && item.images.length > 0 && (
  <View style={styles.imageContainer}>
    {item.images.map((imagePath, index) => {
      
      const cleanPath = imagePath.replace(/^\/+/, ""); // Remove leading slashes
      const imageUrl = imagePath.startsWith("http") ? imagePath : `${API_URL}/${cleanPath}`;

      return (
        <TouchableOpacity key={index} onPress={() => handleImagePress(imageUrl)}>

        <Image 
          key={index} 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          onError={(e) => console.warn("⚠️ Image Load Failed:", e.nativeEvent.error)}
        />
                      </TouchableOpacity>

      );
    })}
  </View>
)}


      {/* Accept & Reject Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptDispute(item.dispute_id)}>
          <Text style={styles.buttonText}>✅ Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectDispute(item.dispute_id)}>
          <Text style={styles.buttonText}>❌ Reject</Text>
        </TouchableOpacity>
      </View>

      {/* Reject Comment Input (React Native TextInput, 2024) */}
      <TextInput
        style={styles.input}
        placeholder="Provide reason for rejection..."
        value={rejectComments[item.dispute_id] || ""}
        onChangeText={(text) => setRejectComments({ ...rejectComments, [item.dispute_id]: text })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Disputes</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : disputes.length > 0 ? (
        <FlatList
          data={disputes}
          keyExtractor={(item) => item.dispute_id.toString()}
          renderItem={renderDisputeItem}
        />
      ) : (
        <Text style={styles.noDisputesText}>No active disputes.</Text>
      )}

      {/* Fullscreen Image Preview Modal (React Native Image, Modal, 2024) */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalClose} onPress={closeImageModal}>
            <Text style={styles.closeText}>✖</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
};

// Styles (React Stylesheet, 2024)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16, color: "#333" },
  loadingText: { fontSize: 16, textAlign: "center", color: "#555" },
  noDisputesText: { fontSize: 16, textAlign: "center", color: "#777", marginTop: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customerName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  date: { fontSize: 16, color: "#666", marginBottom: 6 },
  reason: { fontSize: 16, fontWeight: "bold", color: "#d9534f", marginBottom: 6 },
  description: { fontSize: 14, color: "#555", marginBottom: 6 },
  imageContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  image: { width: 80, height: 80, marginRight: 8, borderRadius: 8 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  acceptButton: { backgroundColor: "#fff", borderColor: "#28a745", borderWidth: 2, padding: 10, borderRadius: 5, flex: 1, alignItems: "center", marginRight: 5 },
  rejectButton: { backgroundColor: "#fff", borderColor: "#dc3545", borderWidth: 2, padding: 10, borderRadius: 5, flex: 1, alignItems: "center", marginLeft: 5 },
  buttonText: { color: "#555", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  modalBackground: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "center", alignItems: "center" },
  fullImage: { width: "90%", height: "80%" },
  modalClose: { position: "absolute", top: 40, right: 20 },
  closeText: { fontSize: 28, color: "#fff" },
});

export default HandymanDisputeScreen;

// References:
// - Axios. (2024). Available at: https://rapidapi.com/guides/axios-async-await
// - Expo Router. (2024). Available at: https://docs.expo.dev/router/introduction/
// - React. (2024). Available at: https://reactjs.org/docs/hooks-overview.html
// - React Context. (2024). Available at: https://reactjs.org/docs/context.html
// - React Native Image. (2024). Available at: https://reactnative.dev/docs/image
// - React Native Modal. (2024). Available at: https://reactnative.dev/docs/modal
// - React Native TextInput. (2024). Available at: https://reactnative.dev/docs/textinput
// - React Stylesheet. (2024). Available at: https://reactnative.dev/docs/stylesheet
