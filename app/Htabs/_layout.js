//Adapted from Simon Grimm (2023) 

import { Tabs } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === "home") {
                        iconName = "home-outline";
                    } else if (route.name === "profile") {
                        iconName = "person-outline";
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "tomato",
                tabBarInactiveTintColor: "gray",
                headerShown: false, // This removes the header globally
            })}
        >
            <Tabs.Screen
                name="home"
                options={{
                    tabBarLabel: "Home",
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: "Profile",
                }}
            />
        </Tabs>
    );
}
//•   Simon Grimm (2023) React Native Tab Bar Routing with Expo Router Available at: https://www.youtube.com/watch?v=4-shpLyYBLc (Accessed on: 14/11/24)
