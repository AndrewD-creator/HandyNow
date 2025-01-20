import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'expo-router';


const UserBookingsScreen = () => {
  const router = useRouter();
  const { user } = useUser(); // Fetch logged-in user details
  const [bookings, setBookings] = useState([]); // Store bookings
  const [loading, setLoading] = useState(true); // Loading state
  const [filter, setFilter] = useState('active'); // Default filter
  const { setSelectedHandyman, setSelectedBooking } = useUser();


  // Fetch bookings for the logged-in user with selected filter
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `http://10.0.2.2:3000/bookings/user/${user.id}?filter=${filter}`
        );
        setBookings(response.data.bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        Alert.alert('Error', 'Failed to load your bookings.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchBookings();
  }, [user?.id, filter]);

  const handleConfirmComplete = async (bookingId) => {
    Alert.alert(
      "Confirm Job Completion",
      "Are you sure the job has been completed?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const response = await axios.patch(
                `http://10.0.2.2:3000/bookings/complete/${bookingId}`
              );
  
              Alert.alert("Success", response.data.message);
  
              // Update the local state to reflect the completed status
              setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                  booking.id === bookingId
                    ? { ...booking, status: "completed" }
                    : booking
                )
              );
            } catch (error) {
              console.error("Error marking booking as complete:", error);
              Alert.alert("Error", "Failed to mark booking as complete.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel action aborted"),
          style: "cancel",
        },
        {
          text: "Yes",
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
      { cancelable: true }
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

      {/* Mark as Complete Button */}
    {item.status === 'awaiting_confirmation' && (
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => handleConfirmComplete(item.id)}
      >
        <Text style={styles.completeButtonText}>Mark as Complete</Text>
      </TouchableOpacity>
    )}

      {/* Cancel Button */}
    {item.status !== 'cancelled' && item.status !== 'completed' && (
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelBooking(item.id)}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    )}
    {/* Rate & Review Button */}
    {item.status === "completed" && !item.reviewed && (
        <TouchableOpacity
        style={styles.reviewButton}
        onPress={() => {
          setSelectedBooking(item);  // Set the booking details in context
          router.push("src/screens/ReviewScreen");
        }}
      >
        <Text style={styles.reviewButtonText}>Rate & Review</Text>
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
        return { color: '#6c757d' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
          onPress={() => setFilter('active')}
        >
          <Text style={styles.filterText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'past' && styles.activeFilter]}
          onPress={() => setFilter('past')}
        >
          <Text style={styles.filterText}>Past</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
      </View>

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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#007bff',
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
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
  completeButton: {
    marginTop: 10,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewButton: {
    marginTop: 10,
    backgroundColor: "#ff9900", // Bright orange color
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3, // Adds a shadow for Android
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  reviewButtonText: {
    color: "#fff", // White text
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  
});

export default UserBookingsScreen;
