import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import API_URL from "../../config/apiConfig";

const InvoiceScreen = () => {
  const { bookingId } = useLocalSearchParams(); 
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      console.log(`🔍 Fetching invoice for Booking ID: ${bookingId}`);
      const response = await axios.get(`${API_URL}/invoices/${bookingId}`);
      setInvoice(response.data.invoice);
    } catch (error) {
      console.error("❌ Error fetching invoice:", error);
      Alert.alert("Error", "Failed to load invoice.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4A4A8E" style={styles.loader} />;
  }

  if (!invoice) {
    return <Text style={styles.errorText}>Invoice not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoice</Text>

      {/* Invoice Box */}
      <View style={styles.invoiceBox}>
        <Text style={styles.invoiceId}>Invoice ID: {invoice.invoice_id}</Text>
        <Text style={styles.detail}>
  Issued on: {new Date(invoice.date_issued).toLocaleString("en-IE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Use 24-hour format
  })}
</Text>
        <Text style={styles.detail}>Customer: {invoice.customer_name}</Text>
        <Text style={styles.detail}>Handyman: {invoice.handyman_name}</Text>
        <Text style={styles.detail}>Booking ID: {invoice.booking_id}</Text>

        {/* Invoice Status with Color */}
        <View style={[styles.statusBox, invoice.status === "paid" ? styles.paid : styles.pending]}>
          <Text style={styles.statusText}>{invoice.status.toUpperCase()}</Text>
        </View>

        <Text style={styles.amount}>Total: €{invoice.amount}</Text>
      </View>
    </View>
  );
};

// 🔹 **Updated Styles**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9F9F9", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 20 },
  loader: { flex: 1, justifyContent: "center" },
  errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 20 },

  // 🔹 Invoice Box
  invoiceBox: {
    backgroundColor: "#FFF",
    width: "90%",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
    alignItems: "center",
  },
  invoiceId: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  detail: { fontSize: 16, marginBottom: 6, color: "#555" },
  amount: { fontSize: 22, fontWeight: "bold", color: "#4A4A8E", marginTop: 16 },

  // 🔹 Status Box
  statusBox: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 10,
  },
  paid: { backgroundColor: "rgba(46, 204, 113, 0.2)" }, // Green
  pending: { backgroundColor: "rgba(243, 156, 18, 0.2)" }, // Orange
  statusText: { fontSize: 16, fontWeight: "bold", textTransform: "uppercase", color: "#333" },
});

export default InvoiceScreen;
