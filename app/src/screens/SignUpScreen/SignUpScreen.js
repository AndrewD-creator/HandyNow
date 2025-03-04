import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import API_URL from "../../config/apiConfig"; 
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { Picker } from '@react-native-picker/picker';  


//(NotJustDev, 2021)
const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
   const [address, setAddress] = useState('');
    const [eircode, setEircode] = useState('');
    const [county, setCounty] = useState('');

  const router = useRouter(); // Initialize the router

  const counties = ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'];  


  const onSignInPressed = () => {
    router.push('src/screens/SignInScreen'); // Navigate to the SignInScreen
  };

  const onTermsAndConditionsPressed = () => {
    router.push('src/screens/TermsAndConditionsScreen');  };

    // This code is adapted from ChatGPT to match my variables (password & passwordRepeat) 
    const validateInputs = () => {
      if (!username || !email || !password || !passwordRepeat || !address || !eircode || !county) {
        Alert.alert('Error', 'All fields must be filled');
        return false;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Invalid email format');
        return false;
      }
  
      const eircodeRegex = /^[A-Za-z0-9]{3,4} ?[A-Za-z0-9]{3}$/;
      if (!eircodeRegex.test(eircode)) {
        Alert.alert('Error', 'Invalid Eircode format');
        return false;
      }
  
      if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
        Alert.alert('Error', 'Password must be at least 8 characters long, include a number and an uppercase letter');
        return false;
      }
  
      if (password !== passwordRepeat) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
  
      return true;
    };
  
    // 🔹 Register User
    const onRegisterPressed = async () => {
      if (!validateInputs()) return;
  
      try {
        const response = await axios.post(`${API_URL}/users`, {
          name: username,
          email,
          address,
          eircode,
          county,
          password,
          role: 'user',
        });
  
        if (response.status === 201) {
          Alert.alert('Registration successful');
          router.push('src/screens/SignInScreen');
        }
      } catch (error) {
        console.error('Error during registration', error);
        if (error.response) {
          Alert.alert('Error', error.response.data.error);
        } else {
          Alert.alert('Error', 'Failed to register. Please try again later.');
        }
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
        {/* County Picker */}
        <Picker
          selectedValue={county}
          onValueChange={(itemValue) => setCounty(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a County" value="" />
          {counties.map((countyName, index) => (
            <Picker.Item key={index} label={countyName} value={countyName} />
          ))}
        </Picker>
    <CustomInput placeholder="Address" value={address} setValue={setAddress} />
        <CustomInput placeholder="Eircode" value={eircode} setValue={setEircode} />
        
        

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
  picker: {
    backgroundColor: 'white',
        width: '100%',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,

        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 5,
        marginTop: 10,

  },
});

export default SignUpScreen;

//•	NotJustDev (2021) React Native Login Authentication PART 2 (step-by-step tutorial) Available at: https://www.youtube.com/watch?v=_Fi86az2OV4 (Accessed on: 02/11/24)
// ChatGPT 