import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import axios from 'axios';
import API_URL from "../src/config/apiConfig"; 
import { useUser } from '../src/context/UserContext';
import { useRouter, useFocusEffect } from 'expo-router';
import moment from 'moment';

const CalendarScreen = () => {
  const { user } = useUser();
  const router = useRouter();
  const [events, setEvents] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchCalendarData(user.id);
      }
    }, [user])
  );

  // 🔹 Fetch Availability & Confirmed Bookings
  const fetchCalendarData = async (handymanId) => {
    try {
      console.log(`📅 Fetching availability for handyman_id: ${handymanId}`);

      // ✅ Fetch availability
      const availabilityResponse = await axios.get(`${API_URL}/api/handyman/availability`, {
        params: { handyman_id: handymanId },
      });

      console.log(`✅ Availability API Response:`, availabilityResponse.data);

      // ✅ Fetch confirmed jobs
      const bookingsResponse = await axios.get(`${API_URL}/bookings/my-jobs/${handymanId}`);

      console.log(`✅ Confirmed Bookings API Response:`, bookingsResponse.data);

      const { recurring = [], exceptions = [] } = availabilityResponse.data;
      const confirmedBookings = bookingsResponse.data.jobs || []; // ✅ Corrected variable

      const events = [];
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(today.getMonth() + 3);

      // 🔹 Generate Availability Events
      for (let date = new Date(today); date <= threeMonthsLater; date.setDate(date.getDate() + 1)) {
        const weekday = date.toLocaleDateString('en-IE', { weekday: 'long' });

        recurring.forEach(({ day_of_week, start_time, end_time }) => {
          if (weekday === day_of_week) {
            const formattedDate = date.toISOString().split('T')[0];
            events.push({
              title: 'Available',
              start: new Date(`${formattedDate}T${start_time}`),
              end: new Date(`${formattedDate}T${end_time}`),
              color: 'green',
            });
          }
        });
      }

      // 🔹 Add Exceptions
      exceptions.forEach(({ date, start_time, end_time, available }) => {
        if (available) {
          events.push({
            title: 'Available (Exception)',
            start: new Date(`${date}T${start_time}`),
            end: new Date(`${date}T${end_time}`),
            color: 'blue',
          });
        } else {
          events.push({
            title: 'Unavailable',
            start: new Date(`${date}T00:00`),
            end: new Date(`${date}T23:59`),
            color: 'red',
          });
        }
      });

      // 🔹 Add Confirmed Jobs
      // 🔹 Add Confirmed Jobs
confirmedBookings.forEach(({ date, start_time, end_time, customerName, description, address, eircode, county }) => {
  if (!start_time || !end_time) {
    console.warn(`⚠️ Skipping job - Missing time:`, { date, start_time, end_time });
    return;
  }

  // ✅ Convert Date Correctly (Remove "T00:00:00.000Z" issue)
  const formattedDate = date.split('T')[0]; // Extract YYYY-MM-DD
  const formattedStart = start_time.length === 5 ? `${start_time}:00` : start_time; // Ensure "HH:mm:ss"
  const formattedEnd = end_time.length === 5 ? `${end_time}:00` : end_time;

  // ✅ Ensure new Date() works properly
  const jobStart = new Date(`${formattedDate}T${formattedStart}`);
  const jobEnd = new Date(`${formattedDate}T${formattedEnd}`);

  console.log(`📌 Adding Confirmed Job:`, {
    customerName,
    date: formattedDate,
    formattedStart,
    formattedEnd,
    jobStart,
    jobEnd,
  });

  if (isNaN(jobStart.getTime()) || isNaN(jobEnd.getTime())) {
    console.error(`❌ Invalid Job Dates:`, { jobStart, jobEnd });
    return; // Skip invalid job
  }

  events.push({
    title: `🔨 Job with ${customerName}`,
    start: jobStart,
    end: jobEnd,
    color: 'orange', // ✅ Different color for confirmed jobs
    description: `Desciption: ${description}\n📍Address: ${address}, ${county}, ${eircode}`, // ✅ Include address
  });
});


      console.log(`📅 Final Events Array:`, events);
      setEvents(events); // ✅ Update state
    } catch (error) {
      console.error('❌ Error fetching calendar data:', error.message || error);
      Alert.alert('Error', 'Failed to load calendar data.');
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        events={events}
        height={600}
        mode="week"
        eventCellStyle={(event) => ({ backgroundColor: event.color })}
        scrollOffsetMinutes={420} // Start at 7 AM
        onPressEvent={(event) =>
          Alert.alert(
            event.title,
            `From ${moment(event.start).format('HH:mm')} to ${moment(event.end).format('HH:mm')}\n${event.description || ''}`
          )
        }
        onPressCell={(date) => {
          Alert.alert(
            'Add Availability',
            `Do you want to add availability?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Add',
                onPress: () => {
                  router.push({
                    pathname: 'src/screens/AvailabilityScreen'
                    
                  });
                },
              },
            ]
          );
        }}
        style={styles.calendar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: 60 },
  calendar: { flex: 1 },
});

export default CalendarScreen;
