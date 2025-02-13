import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../../../assets/images/HandyNowLogo.png';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import axios from 'axios';
import API_URL from "../../config/apiConfig"; 
import { useUser } from '../../context/UserContext';

const SignInScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { height } = useWindowDimensions();
  const router = useRouter();
  const { setUser } = useUser();

// (ChatGPT) - Prompt: I want to be able to sign in, but only should work if the name and password are in my database
const onSignInPressed = async () => {



    try {
      const response = await axios.post(`${API_URL}/login`, {
        name: username,
        password: password,
      });

      console.log('API Response:', response.data); // Add this log


      if (response.status === 200) {
        Alert.alert('Success', response.data.message);

        setUser({
          id: response.data.id,
          fullname: response.data.fullname,
          role: response.data.role,
        });
  
        if (response.data.role === 'handyman') {
          router.push('Htabs/home');
        } else if (response.data.role === 'admin') {
          router.push('Atabs/home');
        } 
        else {
          router.push('Utabs/home');
        }
      }
    } catch (error) {
      // Handle error response from the server (Troubleshooting)
      if (error.response) {
        console.log('Server error:', error.response.data.error); 
        Alert.alert('Error', error.response.data.error);
      } else {
        console.log('Network error:', error.message); 
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };

  const onForgotPasswordPressed = () => {
    console.warn('onForgotPasswordPressed');
  };

  const onSignUpPressed = () => {
    router.push('src/screens/RegistrationTypeScreen');
  };


  //(NotJustDev, 2021)
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.root}>
          <Image source={Logo} style={[styles.logo, { height: height * 0.4 }]} resizeMode="contain" />

          <CustomInput placeholder="Username" value={username} setValue={setUsername} />
          <CustomInput placeholder="Password" value={password} setValue={setPassword} secureTextEntry />

          <CustomButton text="Sign In" onPress={onSignInPressed} />
          <CustomButton text="Forgot Password?" onPress={onForgotPasswordPressed} type="TERTIARY" />
          <CustomButton text="Don't have an account? Create one" onPress={onSignUpPressed} type="TERTIARY" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e7e9ec', 
  },
  scrollContent: {
    flexGrow: 1, 
    justifyContent: 'center', 
    backgroundColor: '#e7e9ec',
  },
  root: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: '80%',
    maxWidth: 300,
    maxHeight: 400,
  },
});

export default SignInScreen;

//•	NotJustDev (2021) React Native Login Authentication PART 1 (step-by-step tutorial) Available at: https://www.youtube.com/watch?v=ALnJLbjI7EY (Accessed on: 02/11/24)
//ChatGPT