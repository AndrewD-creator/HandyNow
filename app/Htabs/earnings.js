import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Alert 
} from "react-native";
import axios from "axios";
import API_URL from "../src/config/apiConfig"; 
import { useUser } from "../src/context/UserContext"; 
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"; 

const Earnings = () => {
  const { user } = useUser();
  const [invoices, setInvoices] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API_URL}/handyman/${user.id}/earnings`);
      setInvoices(response.data.invoices);
      setTotalEarnings(response.data.totalEarnings);
    } catch (error) {
      console.error("❌ Error fetching earnings:", error);
      Alert.alert("Error", "Failed to fetch earnings.");
    }
  };

  return (
    <View style={styles.container}>
      {/* 💰 Earnings Summary */}
      <View style={styles.earningsContainer}>
        <Text style={styles.earningsTitle}>Total Earnings</Text>
        <Text style={styles.earningsAmount}>€{totalEarnings.toFixed(2)}</Text>
      </View>

      {invoices.length === 0 ? (
        <Text style={styles.noInvoices}>No invoices available.</Text>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceTitle}>Booking #{item.booking_id}</Text>
                <Text style={styles.invoiceAmount}>€{item.amount}</Text>
              </View>

              <Text style={styles.customerText}>👤 {item.customer_name}</Text>
              <Text style={styles.dateText}>Date: {new Date(item.booking_date).toLocaleDateString("en-IE")}</Text>

              <View style={styles.statusContainer}>
                {item.status === "paid" ? (
                  <MaterialIcons name="check-circle" size={18} color="green" />
                ) : (
                  <MaterialIcons name="error-outline" size={18} color="red" />
                )}
                <Text style={[styles.status, item.status === "paid" ? styles.paid : styles.unpaid]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#f9f9f9" 
  },

  // ✅ More professional earnings display
  earningsContainer: {
    backgroundColor: "#fff", 
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earningsTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#333" 
  },
  earningsAmount: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#007bff", 
    marginTop: 5 
  },

  // 📃 Invoice Cards
  invoiceCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  invoiceTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#333" 
  },
  invoiceAmount: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#007bff" 
  },

  customerText: { fontSize: 15, color: "#555",  },
  dateText: { fontSize: 15, color: "#555",  },
  // ✅ Invoice Status
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  status: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginLeft: 5 
  },
  paid: { color: "green" },
  unpaid: { color: "red" },

  noInvoices: { 
    fontSize: 16, 
    textAlign: "center", 
    color: "#777", 
    marginTop: 20 
  },
});

export default Earnings;
