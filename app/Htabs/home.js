import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>handyman home</Text>
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

export default home;
