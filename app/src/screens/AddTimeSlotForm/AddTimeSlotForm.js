import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // For time selection
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '../../context/UserContext'; // Assuming you have UserContext for logged-in user info

const AddTimeSlotForm = () => {
  const router = useRouter();
  const { date } = useLocalSearchParams(); // Retrieve the date parameter
  const { user } = useUser(); // Get the logged-in user (dynamically fetch ID)
  const handymanId = user?.id || 0; // Replace with logged-in handyman's ID, fallback to 0
  const formattedDate = date || new Date().toISOString(); // Fallback to the current date

  const [startTime, setStartTime] = useState(new Date()); // Start time state
  const [endTime, setEndTime] = useState(new Date()); // End time state
  const [available, setAvailable] = useState(true); // Availability toggle
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const saveTimeSlot = async () => {
    if (!startTime || !endTime) {
      Alert.alert('Error', 'Start time and end time are required.');
      return;
    }

    try {
      const data = {
        handyman_id: handymanId, // Logged-in user's ID
        date: formattedDate,
        start_time: startTime.toTimeString().slice(0, 5), // Format as HH:mm
        end_time: endTime.toTimeString().slice(0, 5), // Format as HH:mm
        available,
      };

      await axios.post('http://10.0.2.2:3000/api/handyman/availability/exception', data);

      Alert.alert('Success', 'Time slot saved successfully!');
      router.replace('src/screens/HandymanAvailabilityScreen'); // Go back to the calendar screen
    } catch (error) {
      console.error('Error saving time slot:', error.message || error);
      Alert.alert('Error', 'Failed to save time slot.');
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartPicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndPicker(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Availability</Text>
      <Text>{`Date: ${new Date(formattedDate).toDateString()}`}</Text>

      {/* Start Time Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Start Time:</Text>
        <Button
          title={startTime.toTimeString().slice(0, 5)} // Display selected time
          onPress={() => setShowStartPicker(true)}
        />
        {showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleStartTimeChange}
          />
        )}
      </View>

      {/* End Time Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>End Time:</Text>
        <Button
          title={endTime.toTimeString().slice(0, 5)} // Display selected time
          onPress={() => setShowEndPicker(true)}
        />
        {showEndPicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleEndTimeChange}
          />
        )}
      </View>

      {/* Availability Switch */}
      <View style={styles.switchGroup}>
        <Text style={styles.label}>Available:</Text>
        <Switch value={available} onValueChange={setAvailable} />
      </View>

      <Button title="Save Availability" onPress={saveTimeSlot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default AddTimeSlotForm;
