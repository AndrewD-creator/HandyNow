import { Platform } from "react-native";

const LOCAL_IP = "192.168.0.104"; 

const API_URL =
  Platform.OS === "android"
    ? `http://${LOCAL_IP}:3000` // Android Emulator
    : `http://${LOCAL_IP}:3000`; //  Physical Devices

export default API_URL;
