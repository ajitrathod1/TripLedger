import React from 'react';
import { TripProvider } from './src/context/TripContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-Bold': Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TripProvider>
          {/* StatusBar is managed by ThemeProvider now */}
          <AppNavigator />
        </TripProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
