//Adapted from Simon Grimm (2023) & OpenAI 

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { tabs } from 'expo-router';
import { UserProvider } from "./src/context/UserContext";



import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <UserProvider>

      <Stack
        screenOptions={{
          headerTitle: '',
          headerLeft: () => {
            if (router.canGoBack()) {
              return (
                <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 10 }}>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              );
            }
            return null;
          },
        }}
      >
        <Stack.Screen name="Utabs" options={{ headerShown: false }} />
        <Stack.Screen name="Htabs" options={{ headerShown: false }} />
        <Stack.Screen name="Atabs" options={{ headerShown: false }} />

      </Stack>
      </UserProvider>
    </ThemeProvider>
  );
}


//References:
// • Simon Grimm (2023) React Native Tab Bar Routing with Expo Router Available at: https://www.youtube.com/watch?v=4-shpLyYBLc (Accessed on: 14/11/24)
// • OpenAI - ChatGPT