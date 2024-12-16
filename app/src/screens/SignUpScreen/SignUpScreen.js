import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

//(NotJustDev, 2021)
const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const router = useRouter(); // Initialize the router

  const onSignInPressed = () => {
    router.push('src/screens/SignInScreen'); // Navigate to the SignInScreen
  };

  const onTermsAndConditionsPressed = () => {
    console.warn('onTermsAndConditionsPressed');
  };

    // This code is adapted from ChatGPT to match my variables (password & passwordRepeat) 
  const onRegisterPressed = async () => {
    if (password !== passwordRepeat) {
      Alert.alert('Passwords do not match!');
      return;
    }

    if (!username || !email || !password ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

// (ChatGPT) -Prompt: I want to be able to add users who register into my connected database

    try {
        const response = await axios.post('http://10.0.2.2:3000/users', {
          name: username,
          email: email,
          password: password,
          role: 'user',
          
        });
  
        if (response.status === 201) {
          Alert.alert('Registration successful');
          router.push('src/screens/SignInScreen'); 
        }
      } catch (error) {
        console.error('Error during registration', error);
        console.warn('Failed to register. Please try again later.');
      }
    };

    // (NotJustDev, 2021)
  return (
    <ScrollView>
      <View style={styles.root}>
        <Text style={styles.title}>Create an account</Text>

        <CustomInput
          placeholder="Username"
          value={username}
          setValue={setUsername}
        />

        <CustomInput
          placeholder="Email"
          value={email}
          setValue={setEmail}
        />

        <CustomInput
          placeholder="Password"
          value={password}
          setValue={setPassword}
          secureTextEntry={true}
        />

        <CustomInput
          placeholder="Repeat Password"
          value={passwordRepeat}
          setValue={setPasswordRepeat}
          secureTextEntry={true}
        />

        <CustomButton text="Register" onPress={onRegisterPressed} />

        <Text style={styles.text}>
          By registering, you confirm that you accept our{' '}
          <Text style={styles.link} onPress={onTermsAndConditionsPressed}>
            Terms and Conditions
          </Text>
        </Text>

        <CustomButton
          text="Have an account? Sign in"
          onPress={onSignInPressed}
          type="TERTIARY"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#051C60',
    margin: 10,
  },
  text: {
    color: 'gray',
    marginVertical: 10, 
  },
  link: {
    color: '#0000EE',
  },
});

export default SignUpScreen;

//•	NotJustDev (2021) React Native Login Authentication PART 2 (step-by-step tutorial) Available at: https://www.youtube.com/watch?v=_Fi86az2OV4 (Accessed on: 02/11/24)
// ChatGPT 