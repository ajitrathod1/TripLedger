import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreateTripScreen from '../screens/CreateTripScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import TripSummaryScreen from '../screens/TripSummaryScreen';
import SettleUpScreen from '../screens/SettleUpScreen';
import HomeScreen from '../screens/HomeScreen';
import TripListScreen from '../screens/TripListScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="TripList" component={TripListScreen} />
                <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
                <Stack.Screen name="TripSummary" component={TripSummaryScreen} />
                <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
                <Stack.Screen name="SettleUp" component={SettleUpScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
