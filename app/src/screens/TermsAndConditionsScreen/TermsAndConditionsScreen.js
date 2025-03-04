import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const TermsAndConditionsScreen = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms and Conditions</Text>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.text}>
        Welcome to HandyNow. By registering for an account, you agree to these Terms and Conditions. Please read them carefully.
      </Text>

      <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
      <Text style={styles.text}>
        - You must provide accurate and complete registration details.
        {'\n'}- You are responsible for maintaining the confidentiality of your account credentials.
        {'\n'}- You agree to use the platform lawfully and not engage in fraudulent activities.
      </Text>

      <Text style={styles.sectionTitle}>3. Handyman Responsibilities</Text>
      <Text style={styles.text}>
        - Handymen must provide true and verified skills and qualifications.
        {'\n'}- You must complete jobs professionally and in compliance with local regulations.
        {'\n'}- You are responsible for any disputes that arise due to poor service.
      </Text>

      <Text style={styles.sectionTitle}>4. Payment & Fees</Text>
      <Text style={styles.text}>
        - Payments are processed securely through our platform.
        {'\n'}- HandyNow is not responsible for cash transactions outside the platform.
      </Text>

      <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
      <Text style={styles.text}>
        - HandyNow is not responsible for damages or issues arising from handyman services.
        {'\n'}- Users and handymen agree to resolve disputes in good faith.
      </Text>

      <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
      <Text style={styles.text}>
        - HandyNow reserves the right to update these terms at any time.
        {'\n'}- Users will be notified of significant changes via email or app notification.
      </Text>

      <Text style={styles.text}>By proceeding with registration, you agree to these Terms and Conditions.</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Accept & Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    marginTop: 5,
    color: '#555',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TermsAndConditionsScreen;
