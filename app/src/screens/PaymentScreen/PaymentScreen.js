import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { FontAwesome } from '@expo/vector-icons'; // For lock icon
import axios from 'axios';

const PaymentScreen = () => {
  const { confirmPayment } = useStripe();
  const [email, setEmail] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cardDetails, setCardDetails] = useState(null);

  // Function to handle payment
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
        Alert.alert('Success', `Payment successful! ID: ${paymentIntent.id}`);
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
