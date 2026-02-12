import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
    const [trips, setTrips] = useState([]);
    // Start with null, will load from storage
    const [currentTrip, setCurrentTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const storedTrips = await AsyncStorage.getItem('trips');
            if (storedTrips) {
                const parsedTrips = JSON.parse(storedTrips);
                // Sanitize data: Ensure expenses and members arrays exist
                const sanitizedTrips = parsedTrips.map(trip => ({
                    ...trip,
                    members: trip.members || [],
                    expenses: trip.expenses || []
                }));

                setTrips(sanitizedTrips);
                if (sanitizedTrips.length > 0) {
                    setCurrentTrip(sanitizedTrips[sanitizedTrips.length - 1]);
                }
            }
        } catch (e) {
            console.error("Failed to load trips", e);
            AsyncStorage.removeItem('trips'); // Optional: Clear corrupt data if needed
        } finally {
            setLoading(false);
        }
    };

    const saveTripsToStorage = async (updatedTrips) => {
        try {
            await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
        } catch (e) {
            console.error("Failed to save trips", e);
        }
    };

    const addTrip = (tripData) => {
        const newTrip = {
            members: [], // Default to empty if not provided
            ...tripData, // This will override members if tripData has it
            id: Date.now().toString(),
            expenses: []
        };
        const updatedTrips = [...trips, newTrip];
        setTrips(updatedTrips);
        setCurrentTrip(newTrip);
        saveTripsToStorage(updatedTrips);
    };

    const addExpense = (expenseData) => {
        if (!currentTrip) return;
        const newExpense = { ...expenseData, id: Date.now().toString(), date: new Date().toISOString() };
        const updatedTrip = {
            ...currentTrip,
            expenses: [newExpense, ...currentTrip.expenses]
        };

        // Update the trip in the trips array
        const updatedTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);

        setTrips(updatedTrips);
        setCurrentTrip(updatedTrip); // Update current trip state immediately
        saveTripsToStorage(updatedTrips);
    };

    const deleteTrip = (tripId) => {
        const updatedTrips = trips.filter(t => t.id !== tripId);
        setTrips(updatedTrips);
        if (currentTrip && currentTrip.id === tripId) {
            setCurrentTrip(updatedTrips.length > 0 ? updatedTrips[updatedTrips.length - 1] : null);
        }
        saveTripsToStorage(updatedTrips);
    };

    const deleteExpense = (expenseId) => {
        if (!currentTrip) return;
        const updatedExpenses = currentTrip.expenses.filter(e => e.id !== expenseId);
        const updatedTrip = { ...currentTrip, expenses: updatedExpenses };

        const updatedTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);

        setTrips(updatedTrips);
        setCurrentTrip(updatedTrip);
        saveTripsToStorage(updatedTrips);
    };

    return (
        <TripContext.Provider value={{ trips, currentTrip, setCurrentTrip, addTrip, deleteTrip, addExpense, deleteExpense, loading }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTripContext = () => useContext(TripContext);
