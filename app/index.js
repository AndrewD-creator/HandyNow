import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useUser } from "./src/context/UserContext"; 
import API_URL from "./src/config/apiConfig"; 
import axios from "axios";
import SignInScreen from "./src/screens/SignInScreen"; 
import HomeScreen from "./Htabs/home"; 
import { registerForPushNotifications } from "../app/src/utils/pushNotifications"; // ✅ Import function

const App = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      registerForPushNotifications(user.id);
    }
  }, [user]);

  return (
    <StripeProvider publishableKey="pk_test_51QWg2AFz5vaiQFyZUlF1XhnDYqoflmz32Zp1603qKvacuMqONMbIm9rHtzO1r9nbmjkFniHJm6pLaLf2dF6PE8eU00og2dIHN9">
      <SafeAreaView style={styles.root}>
        {user ? <HomeScreen /> : <SignInScreen />}
      </SafeAreaView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#e7e9ec" },
});

export default App;
