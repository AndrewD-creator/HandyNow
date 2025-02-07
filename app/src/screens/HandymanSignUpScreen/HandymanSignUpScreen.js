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
  const [fullName, setFullName] = useState('');
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

  const onRegisterPressed = async () => {
    // Check if passwords match (inspired by MDN, 2024)
    if (password !== repeatPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Check if all fields are filled 
    if (!username || !fullName || !email || !phone || !password || !address || !eircode || !county) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      console.log('Sending registration data:', {
        username, fullName, email, phone, password, address, eircode, county, role: 'handyman',
      });
      const response = await axios.post(`${API_URL}/users`, {
        name: username,
        fullname: fullName,
        email: email,
        phone: phone,
        password: password,
        address: address,
        eircode: eircode,
        county: county,
        role: 'handyman',
      });


      //(Expo router for naviagtion)
      if (response.status === 201) {
        Alert.alert('Success', 'Handyman account created successfully!');
        router.push('src/screens/SignInScreen');  // Navigate to home screen after successful signup
      }
    } catch (error) { // (Inspired by Axios error handling best practices)
      console.error('Error registering handyman:', error);
      if (error.response) {
        Alert.alert('Error', error.response.data.error);
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
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
        <CustomInput placeholder="Full Name" value={fullName} setValue={setFullName} />
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


