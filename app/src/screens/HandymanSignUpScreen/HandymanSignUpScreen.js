import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import API_URL from "../../config/apiConfig"; 
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { Picker } from '@react-native-picker/picker';  

const HandymanSignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [fullname, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [address, setAddress] = useState('');
  const [eircode, setEircode] = useState('');
  const [county, setCounty] = useState(''); 

  const { height } = useWindowDimensions();
  const router = useRouter();

  const counties = ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'];  

  const validateInputs = () => {
    if (!username || !fullname || !email || !phone ||!password || !repeatPassword || !address || !eircode || !county) {
      Alert.alert('Error', 'All fields must be filled');
      return false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Invalid email format');
      return false;
    }
  
    const phoneRegex = /^0[1-9][0-9]{8}$/;
if (!phoneRegex.test(phone)) {
  Alert.alert("Error", "Invalid phone number. Must be 10 digits and start with 08 or a landline code.");
  return false;
}

    const eircodeRegex = /^[A-Za-z0-9]{3,4} ?[A-Za-z0-9]{3}$/;
    if (!eircodeRegex.test(eircode)) {
      Alert.alert('Error', 'Invalid Eircode format');
      return false;
    }
  
    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long and contain a number and an uppercase letter');
      return false;
    }
  
        // Check if passwords match (inspired by MDN, 2024)
    if (password !== repeatPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
  
    return true;
  };
  
  const onTermsAndConditionsPressed = () => {
    router.push('src/screens/TermsAndConditionsScreen');  };

  const onRegisterPressed = async () => {
    if (!validateInputs()) return;

  
    try {
      const response = await axios.post(`${API_URL}/users`, {
        name: username,
        fullname,
        email,
        phone,
        password,
        address,
        eircode,
        county,
        role: 'handyman',
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

  const onSignInPressed = () => {
    router.push('src/screens/SignInScreen');
  };

  // (React Native - ScrollView)
  // (custom inputs and buttons inspired by NotJustDev)
  // (picker component is from React Native Community picker)
  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.root}>
        <Text style={styles.title}>Create a handyman account</Text>
        
        <CustomInput placeholder="Username" value={username} setValue={setUsername} />
        <CustomInput placeholder="Full Name" value={fullname} setValue={setFullName} />
        <CustomInput placeholder="Email" value={email} setValue={setEmail} />
        <CustomInput placeholder="Phone Number" value={phone} setValue={setPhone} />
        
        
        {/* New fields for Address, Eircode, and County */}
        <CustomInput placeholder="Address" value={address} setValue={setAddress} />
        <CustomInput placeholder="Eircode" value={eircode} setValue={setEircode} />
        
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
        <CustomInput placeholder="Password" value={password} setValue={setPassword} secureTextEntry />
        <CustomInput placeholder="Confirm Password" value={repeatPassword} setValue={setRepeatPassword} secureTextEntry />
        <CustomButton text="Register" onPress={onRegisterPressed} />
        <Text style={styles.text}>
                  By registering, you confirm that you accept our{' '}
                  <Text style={styles.link} onPress={onTermsAndConditionsPressed}>
                    Terms and Conditions
                  </Text>
                </Text>
        <CustomButton text="Already have an account? Sign In" onPress={onSignInPressed} type="TERTIARY" />
      </View>
    </ScrollView>
  );
};

//Adapted from OpenAI, (2024) & React Native Styling
const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e7e9ec',
  },
  scrollView: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
    fontFamily: 'Roboto',
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

export default HandymanSignUpScreen;

//References:
// • Axios Docs Error Handling in Axios (2024), Available at: https://axios-http.com/docs/handling_errors
// • Expo Router for Navigation (2024), Available at:: https://expo.github.io/router/docs/
// • React Native Styling (2024), Available at:: https://reactnative.dev/docs/style
// • MDN (2024), Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
// • React Native Documentation - ScrollView. Available at: https://reactnative.dev/docs/scrollview
// • React Native Community Picker. Available at: https://github.com/react-native-picker/picker
// •	NotJustDev (2021) React Native Login Authentication PART 1 (step-by-step tutorial) Available at: https://www.youtube.com/watch?v=ALnJLbjI7EY (Accessed on: 02/11/24)
// • OpenAI - ChatGPT


