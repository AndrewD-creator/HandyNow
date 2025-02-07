import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import API_URL from "../../config/apiConfig"; 

import { useUser } from '../../context/UserContext';

const AvailabilityScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const handymanId = user?.id;

  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Fetch availability from the backend
  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/handyman/availability`, {
        params: { handyman_id: handymanId },
      });

      setAvailability(response.data.recurring || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Failed to load availability.');
    }
  };

  // Always show Monday-Sunday in order
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Find availability for a given day
  const getAvailabilityForDay = (day) => {
    const availableSlot = availability.find((slot) => slot.day_of_week === day);
    return availableSlot ? `${availableSlot.start_time} - ${availableSlot.end_time}` : 'Unavailable';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regular Available Hours</Text>

      {/* List of Days */}
      <FlatList
        data={weekDays}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const availabilityText = getAvailabilityForDay(item);
          const isAvailable = availabilityText !== 'Unavailable';

          return (
            <TouchableOpacity
              style={[styles.dayRow, isAvailable ? styles.availableRow : styles.unavailableRow]}
              onPress={() => router.replace({ pathname: 'src/screens/TimeSelectionScreen', params: { day: item } })}
              activeOpacity={0.7}
            >
              <Text style={styles.dayText}>{item}</Text>
              <Text style={[styles.timeText, isAvailable ? styles.availableText : styles.unavailableText]}>
                {availabilityText}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f9f9f9' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 16, 
    color: '#333' 
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  availableRow: { borderLeftWidth: 6, borderLeftColor: '#4CAF50' }, // Green border for available days
  unavailableRow: { borderLeftWidth: 6, borderLeftColor: '#FF3B30' }, // Red border for unavailable days
  dayText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  timeText: { 
    fontSize: 16 
  },
  availableText: { 
    color: '#4CAF50', 
    fontWeight: 'bold' 
  },
  unavailableText: { 
    color: '#FF3B30', 
    fontWeight: 'bold' 
  },
});

export default AvailabilityScreen;
