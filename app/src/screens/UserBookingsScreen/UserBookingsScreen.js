import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const UserBookingsScreen = () => {
  const { user } = useUser(); // Fetch logged-in user details
  const [bookings, setBookings] = useState([]); // Store bookings
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch bookings for the logged-in user
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:3000/bookings/user/${user.id}`);
        console.log(response.data.bookings); // Debugging: Check what's being returned
        setBookings(response.data.bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        Alert.alert('Error', 'Failed to load your bookings.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchBookings();
  }, [user?.id]);

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Cancel Booking", // Title of the alert
      "Are you sure you want to cancel this booking?", // Message
      [
        {
          text: "No", // 'No' button
          onPress: () => console.log("Cancel action aborted"), // Action for No
          style: "cancel", // 'Cancel' button style
        },
        {
          text: "Yes", // 'Yes' button
          onPress: async () => {
            try {
              // Call the backend to cancel the booking
              const response = await axios.patch(
                `http://10.0.2.2:3000/bookings/cancel/${bookingId}`
              );
              Alert.alert("Success", "Booking cancelled successfully!");
  
              // Update the local state to reflect the canceled status
              setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                  booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
                )
              );
            } catch (error) {
              console.error("Error canceling booking:", error);
              Alert.alert("Error", "Failed to cancel booking. Please try again.");
            }
          },
        },
      ],
      { cancelable: true } // Allows users to dismiss the alert without pressing any button
    );
  };
  

  // Format Date to DD/MM/YYYY
  const formatDate = (isoDate) => {
    if (!isoDate) return 'Invalid Date';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Render individual booking card
  const renderBookingItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{`Date: ${formatDate(item.date)}`}</Text>
      <Text style={styles.handyman}>{`Handyman: ${item.handymanName || 'N/A'}`}</Text>
      <Text style={styles.description}>{`Description: ${item.description}`}</Text>
      <Text style={styles.status}>
        {`Status: `}
        <Text style={[styles.statusHighlight, getStatusStyle(item.status)]}>
          {item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : 'Pending'}
        </Text>
      </Text>

      {/* Cancel Button */}
    {item.status !== 'cancelled' && (
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelBooking(item.id)}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    )}
    </View>
  );
  

  // Function to determine dynamic color for status
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { color: '#FFAA00' };
      case 'confirmed':
        return { color: '#007bff' };
      case 'completed':
        return { color: '#28a745' };
      case 'cancelled':
        return { color: '#dc3545' };
      default:
        return { color: '#6c757d' }; // Default grey color
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingItem}
        />
      ) : (
        <Text style={styles.noBookingsText}>You have no bookings yet.</Text>
      )}
    </View>
  );

 
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  noBookingsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    color: '#555',
  },
  status: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: 'bold',
  },
  statusHighlight: {
    fontWeight: 'bold',
  },
  handyman: {
    fontSize: 14,
    marginTop: 8,
    color: '#444',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
});

export default UserBookingsScreen;
