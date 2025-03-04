import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { CardField, useStripe, PaymentCardTextField } from '@stripe/stripe-react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import API_URL from "../../config/apiConfig"; 
import { useRouter } from "expo-router";
import { useUser } from "../../context/UserContext"; // ✅ Access selected booking

// • ChatGPT (2024) - Prompt: "How do I implement a payment screen in React Native using Stripe API and handle navigation after successful payment?"
const PaymentScreen = () => {
  const { confirmPayment } = useStripe();
  const router = useRouter();
  const { selectedBooking } = useUser(); // ✅ Get selected booking details
  console.log("📌 Loaded Selected Booking in PaymentScreen:", selectedBooking);
  const { selectedHandyman } = useUser(); 
  const [email, setEmail] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardDetails, setCardDetails] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null); // ✅ Store price in cents

  // 🔹 Fetch calculated price when screen loads
  useEffect(() => {
    if (selectedBooking) {
      fetchPrice();
    }
  }, [selectedBooking]);  // ✅ Runs when `selectedBooking` changes
  
      console.log(`🔍 Fetching price for Handyman ID: ${selectedBooking.handyman_id}, Duration: ${selectedBooking.duration}`);

      const fetchPrice = async () => {
        if (!selectedBooking?.handyman_id || !selectedBooking?.duration) {
          console.error("❌ Missing handyman ID or duration!", selectedBooking);
          return;
        }
      
        console.log(`🔍 Fetching price for Handyman ID: ${selectedBooking.handyman_id}, Duration: ${selectedBooking.duration}`);
      
        try {
          const response = await axios.get(`${API_URL}/calculate-price`, {
            params: {
              handymanId: selectedBooking.handyman_id,
              duration: selectedBooking.duration,
            },
          });
      
          console.log("✅ Price API Response:", response.data);
          setTotalAmount(response.data.price);  // ✅ Correct state update
      
        } catch (error) {
          console.error("❌ Error fetching price:", error);
          setTotalAmount(null); // Prevent undefined issues
        }
      };
      
  

  // 🔹 Handle Payment Process
  const handlePayment = async () => {
    if (!email || !cardholderName || !cardDetails?.complete) {
      Alert.alert('Error', 'Please fill in all fields and complete card details.');
      return;
    }

    if (!totalAmount) {
      Alert.alert('Error', 'Price calculation failed. Please try again.');
      return;
    }

    try {
      // ✅ Step 1: Create Payment Intent
      const response = await axios.post(`${API_URL}/create-payment-intent`, {
        amount: totalAmount, // ✅ Use dynamically fetched amount
        currency: 'eur',
      });

      const { clientSecret } = response.data;

      // ✅ Step 2: Confirm Payment
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        billingDetails: { email, name: cardholderName },
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        Alert.alert('Success', `Payment successful!`, [
          {
            text: 'OK',
            onPress: () => router.replace("Utabs/home"),
          }
        ]);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      {/* Cardholder Name */}
      <Text style={styles.label}>Name on Card</Text>
      <TextInput
        style={styles.input}
        placeholder="Cardholder Name"
        value={cardholderName}
        onChangeText={setCardholderName}
      />

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="test@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Card Input */}
      <Text style={styles.label}>Card Information</Text>
      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        style={styles.cardField}
        onCardChange={(details) => setCardDetails(details)}
      />

      {/* Pay Button - Display Dynamic Price */}
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
  <Text style={styles.payButtonText}>
    Pay €{totalAmount !== null ? totalAmount.toFixed(2) : "..."}
  </Text>
  <FontAwesome name="lock" size={16} color="#FFF" style={styles.lockIcon} />
</TouchableOpacity>


    </View>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#333' },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, backgroundColor: '#F9F9F9' },
  cardField: { height: 50, marginBottom: 16 },
  payButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#4A4A8E', paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  payButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  lockIcon: { marginLeft: 4 },
});

export default PaymentScreen;


// 📌 References:
// • React Native Documentation (2024) - https://reactnative.dev/docs/components-and-apis
// • Stripe React Native Documentation (2024) - https://stripe.com/docs/payments/accept-a-payment?platform=react-native
// • Axios Documentation (2024) - https://axios-http.com/docs/intro
// • Expo Router Documentation (2024) - https://docs.expo.dev/router/introduction/
// • Expo Vector Icons Documentation (2024) - https://docs.expo.dev/guides/icons/
// • ChatGPT (2024) - Prompt: "How do I implement a payment screen in React Native using Stripe API and handle navigation after successful payment?"
