
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { Slot } from 'expo-router';
import SignInScreen from './src/screens/SignInScreen';
import Home from './Htabs/home';


const App = () => {

  //(NotJustDev, 2021)
  return (

        <SafeAreaView style={styles.root}>
          
      <SignInScreen />
    </SafeAreaView>
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
