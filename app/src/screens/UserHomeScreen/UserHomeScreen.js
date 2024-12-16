import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>UserHomeScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#051C60',
  },
});

export default UserHomeScreen;
