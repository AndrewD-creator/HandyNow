import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Alert } from "react-native";
import API_URL from "../config/apiConfig"; // ✅ Ensure this is correct
import axios from "axios";

export const registerForPushNotifications = async (userId) => {
  try {
    if (!Device.isDevice) {
      Alert.alert("Push Notifications", "Must use a physical device for push notifications.");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Push Notifications", "Permission denied.");
      return;
    }

    // ✅ Get Expo push token
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    console.log("📲 Expo Push Token:", token);

    // ✅ Save push token to backend
    if (userId) {
      await axios.post(`${API_URL}/save-push-token`, { userId, pushToken: token });
      console.log("✅ Push token saved to backend.");
    }

    return token;
  } catch (error) {
    console.error("❌ Error registering for push notifications:", error);
  }
};
