import React from 'react';
import { TripProvider } from './src/context/TripContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <TripProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </TripProvider>
    </SafeAreaProvider>
  );
}
