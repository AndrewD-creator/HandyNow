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
  ScrollView,
  Modal,
} from "react-native";
import axios from "axios";
import API_URL from "../../config/apiConfig";
import { useRouter } from "expo-router";

const AdminDisputeScreen = () => {
  const router = useRouter();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState({});
    const [selectedImage, setSelectedImage] = useState(null); // ✅ Store the selected image
  

  useEffect(() => {
    fetchDisputes();
  }, []);

  // ✅ Fetch Disputes Pending Admin Review
  const fetchDisputes = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/disputes`);
      setDisputes(response.data.disputes);
    } catch (error) {
      console.error("❌ Error fetching disputes:", error);
      Alert.alert("Error", "Failed to load disputes.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format Date (DD/MM/YYYY)
  const formatDate = (isoDate) => {
    if (!isoDate) return "Invalid Date";
    return isoDate.split("T")[0].split("-").reverse().join("/");
  };

   // ✅ Handle Image Click to Show Fullscreen Modal
   const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // ✅ Close Image Modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // ✅ Admin Approves Refund
  const handleApprove = async (disputeId) => {
    try {
      await axios.patch(`${API_URL}/admin/resolve-dispute`, {
        disputeId,
        adminDecision: "approved",
        adminNote: adminNotes[disputeId] || "",
      });
      Alert.alert("Success", "Refund approved.");
      fetchDisputes();
    } catch (error) {
      console.error("❌ Error approving refund:", error);
      Alert.alert("Error", "Failed to process refund.");
    }
  };

  // ❌ Admin Rejects Refund
  const handleReject = async (disputeId) => {
    if (!adminNotes[disputeId]) {
      Alert.alert("Error", "Please provide a reason for rejection.");
      return;
    }

    try {
      await axios.patch(`${API_URL}/admin/resolve-dispute`, {
        disputeId,
        adminDecision: "rejected",
        adminNote: adminNotes[disputeId],
      });
      Alert.alert("Dispute Rejected", "Refund request denied.");
      fetchDisputes();
    } catch (error) {
      console.error("❌ Error rejecting dispute:", error);
      Alert.alert("Error", "Failed to reject dispute.");
    }
  };

  // 🔹 Render Dispute Item
  const renderDisputeItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.customerName}>Customer: {item.customer_name}</Text>
      <Text style={styles.handymanName}>Handyman: {item.handyman_name}</Text>
      <Text style={styles.date}>Booking Date: {formatDate(item.booking_date)}</Text>
      <Text style={styles.reason}>Reason: {item.reason}</Text>

      {/* Customer Complaint */}
      <View style={styles.disputeSection}>
        <Text style={styles.disputeLabel}>Customer's Dispute:</Text>
        <Text style={styles.disputeText}>{item.description}</Text>
      </View>

      {/* Handyman Response */}
      <View style={styles.handymanResponseSection}>
        <Text style={styles.disputeLabel}>Handyman's Response:</Text>
        <Text style={styles.disputeText}>
          {item.handyman_response || "No response from handyman yet."}
        </Text>
      </View>

    {/* Shows Images */}
      {item.images.length > 0 && (
  <View>
    <Text style={styles.imageLabel}>Evidence Provided by Customer:</Text>
    <ScrollView horizontal style={styles.imageContainer}>
      {item.images.map((imagePath, index) => {
        const imageUrl = `${API_URL}${imagePath}`;
        return (
          <TouchableOpacity key={index} onPress={() => handleImagePress(imageUrl)}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image} 
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
)}

      {/* Admin Decision Input */}
      <TextInput
        style={styles.input}
        placeholder="Add admin decision note..."
        value={adminNotes[item.dispute_id] || ""}
        onChangeText={(text) => setAdminNotes({ ...adminNotes, [item.dispute_id]: text })}
      />

      {/* Approve & Reject Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item.dispute_id)}>
          <Text style={styles.buttonText}>✅ Approve Refund</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item.dispute_id)}>
          <Text style={styles.buttonText}>❌ Reject Refund</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dispute Management</Text>

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
    

    {/* ✅ Fullscreen Image Preview Modal */}
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
    handymanName: { fontSize: 16, fontWeight: "bold", color: "#555", marginBottom: 6 },
    date: { fontSize: 16, color: "#666", marginBottom: 6 },
    reason: { fontSize: 16, fontWeight: "bold", color: "#d9534f", marginBottom: 6 },
    disputeSection: { marginVertical: 8, padding: 10, backgroundColor: "#ffdddd", borderRadius: 6 },
    handymanResponseSection: { marginVertical: 8, padding: 10, backgroundColor: "#ddffdd", borderRadius: 6 },
    disputeLabel: { fontWeight: "bold", color: "#333" },
    disputeText: { fontSize: 14, color: "#555" },
    imageContainer: { flexDirection: "row", marginVertical: 8 },
    image: { width: 100, height: 100, marginRight: 8, borderRadius: 8 },
    
    // ✅ Input Styling
    input: { 
      borderWidth: 1, 
      borderColor: "#ccc", 
      borderRadius: 8, 
      padding: 12, 
      fontSize: 16, 
      marginTop: 10, 
      backgroundColor: "#fff" 
    },
  
    // ✅ Button Container
    buttonContainer: { 
      flexDirection: "row", 
      justifyContent: "space-between", 
      marginTop: 16 
    },
  
    // ✅ Approve Button Styling
    approveButton: { 
      flex: 1,
      backgroundColor: "#28a745",  // Green ✅
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginRight: 5, 
      elevation: 3, // Shadow for Android
      shadowColor: "#000", // Shadow for iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  
    // ✅ Reject Button Styling
    rejectButton: { 
      flex: 1,
      backgroundColor: "#dc3545", // Red ❌
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginLeft: 5, 
      elevation: 3, // Shadow for Android
      shadowColor: "#000", // Shadow for iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  
    // ✅ Button Text
    buttonText: { 
      color: "#fff", 
      fontSize: 16, 
      fontWeight: "bold", 
      textTransform: "uppercase" 
    },
    modalBackground: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "center", alignItems: "center" },
  fullImage: { width: "90%", height: "80%" },
  modalClose: { position: "absolute", top: 40, right: 20 },
  closeText: { fontSize: 28, color: "#fff" },
  });

  export default AdminDisputeScreen;
