import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native'; // (Stripe React Native, 2024)
import { FontAwesome } from '@expo/vector-icons'; // For lock icon (Expo Vector Icons, 2024)
import axios from 'axios'; // (Axios HTTP Requests, 2024)
import { useRouter } from "expo-router"; // (Expo Router for Navigation, 2024)

// (ChatGPT) - Prompt: How do I implement a payment screen in React Native using Stripe API and handle navigation after successful payment
const PaymentScreen = () => {
  const { confirmPayment } = useStripe();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cardDetails, setCardDetails] = useState(null);

  // Function to handle payment (Axios HTTP Requests, 2024)
  const handlePayment = async () => {
    if (!email || !cardholderName || !cardDetails?.complete) {
      Alert.alert('Error', 'Please fill in all fields and complete card details.');
      return;
    }

    try {
      const response = await axios.post('http://10.0.2.2:3000/create-payment-intent', {
        amount: 1000, // €10.00 in cents
        currency: 'eur',
      });

      const { clientSecret } = response.data;

      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        billingDetails: {
          email,
          name: cardholderName,
        },
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        Alert.alert('Success', `Payment successful! ID: ${paymentIntent.id}`, [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to the home screen after successful payment (Expo Router for Navigation, 2024)
              router.replace("Utabs/home");
            }
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
        postalCodeEnabled={true}
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
        style={styles.cardField}
        onCardChange={(details) => setCardDetails(details)}
      />
      
      {/* Pay Button */}
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Pay</Text>
        <FontAwesome name="lock" size={16} color="#FFF" style={styles.lockIcon} />
      </TouchableOpacity>
    </View>
  );
};

// React Native styling (React Native Documentation, 2024)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  cardField: {
    height: 50,
    marginBottom: 16,
  },
  payButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A4A8E',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  lockIcon: {
    marginLeft: 4,
  },
});

export default PaymentScreen;

// References:
// • React Native Documentation (2024). Available at: https://reactnative.dev/docs/components-and-apis
// • Stripe React Native Documentation (2024). Available at: https://stripe.com/docs/payments/accept-a-payment?platform=react-native
// • Axios Documentation (2024). Available at: https://axios-http.com/docs/intro
// • Expo Router Documentation (2024). Available at: https://expo.github.io/router/docs/
// • Expo Vector Icons Documentation (2024). Available at: https://docs.expo.dev/guides/icons/
// • ChatGPT (2024). Prompt: How do I implement a payment screen in React Native using Stripe API and handle navigation after successful payment