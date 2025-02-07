import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'expo-router';

const AddAvailabilityForm = () => {
  const { user } = useUser(); // Get the logged-in user
  const router = useRouter();

  // State for recurring availability (Monday to Sunday)
  const [recurring, setRecurring] = useState([
    { day: 'Monday', available: false, start_time: '09:00', end_time: '17:00' },
    { day: 'Tuesday', available: false, start_time: '09:00', end_time: '17:00' },
    { day: 'Wednesday', available: false, start_time: '09:00', end_time: '17:00' },
    { day: 'Thursday', available: false, start_time: '09:00', end_time: '17:00' },
    { day: 'Friday', available: false, start_time: '09:00', end_time: '17:00' },
    { day: 'Saturday', available: false, start_time: '10:00', end_time: '14:00' },
    { day: 'Sunday', available: false, start_time: '', end_time: '' }, // Default unavailable
  ]);

  // Handle availability toggle
  const toggleAvailability = (index) => {
    const updated = [...recurring];
    updated[index].available = !updated[index].available;
    setRecurring(updated);
  };

  // Handle input changes (start or end time)
  const handleInputChange = (index, field, value) => {
    const updated = [...recurring];
    updated[index][field] = value;
    setRecurring(updated);
  };

  // Save availability to the server
  const saveAvailability = async () => {
    try {
      const filteredRecurring = recurring
        .filter((day) => day.available) // Only include available days
        .map(({ day, start_time, end_time }) => ({
          day_of_week: day,
          start_time: `${start_time}:00`, // Add seconds to match DB format
          end_time: `${end_time}:00`,
        }));

      const data = {
        handyman_id: user.id,
        recurring: filteredRecurring,
        exceptions: [], // Placeholder for now
      };

      await axios.post('http://10.0.2.2:3000/api/handyman/availability/update', data);

      Alert.alert('Success', 'Availability updated successfully!');
      router.push('src/screens/HandymanAvailabilityScreen'); // Navigate back
    } catch (error) {
      console.error('Error saving availability:', error.message || error);
      Alert.alert('Error', 'Failed to save availability.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Set Your Availability</Text>

      {recurring.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayText}>{day.day}</Text>
            <Switch
              value={day.available}
              onValueChange={() => toggleAvailability(index)}
            />
          </View>

          {day.available && (
            <View style={styles.timeContainer}>
              <TextInput
                style={styles.input}
                placeholder="Start Time (e.g., 09:00)"
                value={day.start_time}
                onChangeText={(value) => handleInputChange(index, 'start_time', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="End Time (e.g., 17:00)"
                value={day.end_time}
                onChangeText={(value) => handleInputChange(index, 'end_time', value)}
              />
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={saveAvailability}>
        <Text style={styles.saveButtonText}>Save Availability</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  dayContainer: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default AddAvailabilityForm;
