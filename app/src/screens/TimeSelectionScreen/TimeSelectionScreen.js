import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import API_URL from "../../config/apiConfig"; 
import { useUser } from '../../context/UserContext';

// ChatGPT - Prompt: "How do I implement a selectable time range for scheduling"
const timeSlots = [
  '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM',
  '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

const TimeSelectionScreen = () => {
  const router = useRouter(); // (Expo Router, 2024)
  const { day } = useLocalSearchParams();
  const { user } = useUser();
  const handymanId = user?.id;

  const [selectedTimes, setSelectedTimes] = useState([]);

  // Function to handle time slot selection
  const selectTimeSlot = (time) => {
    if (selectedTimes.length === 0) {
      setSelectedTimes([time]); // First tap: Set start time
    } else if (selectedTimes.length === 1) {
      const startIndex = timeSlots.indexOf(selectedTimes[0]);
      const endIndex = timeSlots.indexOf(time);

      if (endIndex > startIndex) {
        setSelectedTimes(timeSlots.slice(startIndex, endIndex + 1)); // Highlight full range
      } else {
        setSelectedTimes([time]); // Reset if tapped incorrectly
      }
    } else {
      setSelectedTimes([time]); // Reset selection if tapped a third time
    }
  };

  // Convert 12-hour format to 24-hour (HH:mm:ss)
  const convertTo24Hour = (time) => {
    const [hour, modifier] = time.split(' ');
    let hourNum = parseInt(hour);

    if (modifier === 'PM' && hourNum !== 12) hourNum += 12;
    if (modifier === 'AM' && hourNum === 12) hourNum = 0;

    return `${hourNum.toString().padStart(2, '0')}:00:00`;
  };

  // Save availability
  const saveAvailability = async () => {
    if (selectedTimes.length < 2) {
      Alert.alert('Error', 'Select a start and end time.');
      return;
    }

    const startTime = convertTo24Hour(selectedTimes[0]);
    const endTime = convertTo24Hour(selectedTimes[selectedTimes.length - 1]);

    try {
      const data = {
        handyman_id: handymanId,
        recurring: [{ day_of_week: day, start_time: startTime, end_time: endTime }],
        exceptions: [],
      };

      await axios.post(`${API_URL}/api/handyman/availability/update`, data, {
        headers: { 'Content-Type': 'application/json' },
      });

      Alert.alert('Success', `Availability for ${day} updated!`);
      router.replace('src/screens/AvailabilityScreen'); // Back to availability screen
    } catch (error) {
      console.error('Error saving availability:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to save availability.');
    }
  };

  // Mark unavailable (Delete from DB)
  const markUnavailable = async () => {
    Alert.alert( // React Native Alert (2024)
      'Confirm',
      `Do you want to mark ${day} as unavailable?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/handyman/availability/delete`, {
                data: { handyman_id: handymanId, day_of_week: day },
              });

              Alert.alert('Success', `${day} marked as unavailable.`);
              router.replace('src/screens/AvailabilityScreen'); // Back to availability screen
            } catch (error) {
              console.error('Error marking unavailable:', error.response?.data || error.message);
              Alert.alert('Error', 'Failed to update availability.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Hours for {day}</Text>

      <ScrollView contentContainerStyle={styles.timeGrid}>
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[styles.timeSlot, selectedTimes.includes(time) && styles.selectedSlot]}
            onPress={() => selectTimeSlot(time)}
          >
            <Text style={styles.timeText}>{time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveAvailability}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.unavailableButton} onPress={markUnavailable}>
          <Text style={styles.unavailableButtonText}>Mark Unavailable</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// (React Native Styling, 2024)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  timeSlot: {
    backgroundColor: '#ddd',
    padding: 12,
    margin: 5,
    borderRadius: 5,
    width: '25%',
    alignItems: 'center',
  },
  selectedSlot: { backgroundColor: '#007bff' }, 
  timeText: { fontSize: 16, color: '#fff' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  unavailableButton: { backgroundColor: '#dc3545', padding: 15, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: 'center' },
  unavailableButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default TimeSelectionScreen;

//References
//OpenAI
//React Native Alert (2024). Available at: https://reactnative.dev/docs/alert
//Expo Router (2024). Available at: https://docs.expo.dev/router/introduction/