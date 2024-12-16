import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const RegistrationTypeScreen = () => {
  const router = useRouter(); // (Expo Router for Naviagtion, 2024)

  const onCustomerPressed = () => {
    router.push('src/screens/SignUpScreen');
  };

  const onHandymanPressed = () => {
    router.push('src/screens/HandymanSignUpScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register As</Text>

      <TouchableOpacity style={styles.customerButton} onPress={onCustomerPressed}>
        <Text style={styles.buttonText}>Customer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.handymanButton} onPress={onHandymanPressed}>
        <Text style={styles.buttonText}>Handyman</Text>
      </TouchableOpacity>
    </View>
  );
};

//Adapted from OpenAI, (2024) & React Native Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7e9ec', 
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'Roboto', 
  },
  customerButton: {
    backgroundColor: '#4A90E2', 
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginVertical: 15,
    elevation: 8, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handymanButton: {
    backgroundColor: '#4A90E2', 
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginVertical: 15,
    elevation: 8, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto', 
  },
});

export default RegistrationTypeScreen;

//References:
// • React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// • Expo Router for Navigation (2024), Available at:: https://expo.github.io/router/docs/
// • OpenAI - ChatGPT
