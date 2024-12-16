
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { Slot } from 'expo-router';
import SignInScreen from './src/screens/SignInScreen';
import Home from './Htabs/home';
import { StripeProvider } from '@stripe/stripe-react-native';



const App = () => {

  //(NotJustDev, 2021)
  return (

    <StripeProvider publishableKey="pk_test_51QWg2AFz5vaiQFyZUlF1XhnDYqoflmz32Zp1603qKvacuMqONMbIm9rHtzO1r9nbmjkFniHJm6pLaLf2dF6PE8eU00og2dIHN9">
        <SafeAreaView style={styles.root}>
          
      <SignInScreen />
    </SafeAreaView>
    </StripeProvider>

  );
};


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#e7e9ec'
  
  },
});

export default App;

//•	NotJustDev (2021) React Native Login Authentication PART 1 (step-by-step tutorial) Available at: https://www.youtube.com/watch?v=ALnJLbjI7EY (Accessed on: 02/11/24)
