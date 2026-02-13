import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
    const { user } = useAuth(); // Get current user
    const [trips, setTrips] = useState([]);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load data whenever user changes (Login/Logout)
    useEffect(() => {
        setLoading(true);
        if (user) {
            loadFromFirestore();
        } else {
            loadFromStorage();
        }
    }, [user]);

    // --- Data Loading Functions ---

    const loadFromStorage = async () => {
        try {
            const storedTrips = await AsyncStorage.getItem('trips');
            if (storedTrips) {
                const parsedTrips = JSON.parse(storedTrips);
                setTrips(parsedTrips);
                // Don't auto-set currentTrip, let user select or logic handle it
            } else {
                setTrips([]);
            }
        } catch (e) {
            console.error("Local Load Error", e);
        } finally {
            setLoading(false);
        }
    };

    const loadFromFirestore = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'trips'));
            const cloudTrips = [];
            querySnapshot.forEach((doc) => {
                cloudTrips.push(doc.data());
            });
            // Sort by ID (timestamp) usually
            cloudTrips.sort((a, b) => b.id - a.id);
            setTrips(cloudTrips);
        } catch (e) {
            console.error("Firestore Load Error", e);
        } finally {
            setLoading(false);
        }
    };

    // --- Helper to update State & Storage/Cloud ---

    const persistData = async (newTrips, operation, affectedTrip = null) => {
        setTrips(newTrips); // Optimistic Update

        if (user) {
            // CLOUD MODE
            try {
                if (operation === 'add' || operation === 'update') {
                    if (affectedTrip) {
                        await setDoc(doc(db, 'users', user.uid, 'trips', affectedTrip.id), affectedTrip);
                    }
                } else if (operation === 'delete') {
                    if (affectedTrip) {
                        await deleteDoc(doc(db, 'users', user.uid, 'trips', affectedTrip.id));
                    }
                }
            } catch (e) {
                console.error("Firestore Sync Error", e);
                // TODO: Revert state if needed
            }
        } else {
            // LOCAL MODE
            try {
                await AsyncStorage.setItem('trips', JSON.stringify(newTrips));
            } catch (e) {
                console.error("AsyncStorage Error", e);
            }
        }
    };

    // --- Actions ---

    const addTrip = (tripData) => {
        const newTrip = {
            members: [],
            ...tripData,
            id: Date.now().toString(),
            expenses: []
        };
        const updatedTrips = [...trips, newTrip];
        setCurrentTrip(newTrip);
        persistData(updatedTrips, 'add', newTrip);
    };

    const updateTrip = (tripId, updatedData) => {
        let updatedTrip = null;
        const updatedTrips = trips.map(t => {
            if (t.id === tripId) {
                updatedTrip = { ...t, ...updatedData };
                return updatedTrip;
            }
            return t;
        });

        if (currentTrip && currentTrip.id === tripId) {
            setCurrentTrip(updatedTrip);
        }

        persistData(updatedTrips, 'update', updatedTrip);
    };

    const deleteTrip = (tripId) => {
        const tripToDelete = trips.find(t => t.id === tripId);
        const updatedTrips = trips.filter(t => t.id !== tripId);

        if (currentTrip && currentTrip.id === tripId) {
            setCurrentTrip(null);
        }

        persistData(updatedTrips, 'delete', tripToDelete);
    };

    const addExpense = (expenseData) => {
        if (!currentTrip) return;

        const newExpense = {
            ...expenseData,
            id: Date.now().toString(),
            date: new Date().toISOString()
        };

        const updatedTrip = {
            ...currentTrip,
            expenses: [newExpense, ...currentTrip.expenses]
        };

        const updatedTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);

        setCurrentTrip(updatedTrip);
        persistData(updatedTrips, 'update', updatedTrip);
    };

    const editExpense = (expenseId, updatedExpenseData) => {
        if (!currentTrip) return;

        const updatedExpenses = currentTrip.expenses.map(e => {
            if (e.id === expenseId) {
                return { ...e, ...updatedExpenseData };
            }
            return e;
        });

        const updatedTrip = { ...currentTrip, expenses: updatedExpenses };
        const updatedTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);

        setCurrentTrip(updatedTrip);
        persistData(updatedTrips, 'update', updatedTrip);
    };

    const deleteExpense = (expenseId) => {
        if (!currentTrip) return;

        const updatedExpenses = currentTrip.expenses.filter(e => e.id !== expenseId);
        const updatedTrip = { ...currentTrip, expenses: updatedExpenses };
        const updatedTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);

        setCurrentTrip(updatedTrip);
        persistData(updatedTrips, 'update', updatedTrip);
    };

    return (
        <TripContext.Provider value={{
            trips,
            currentTrip,
            setCurrentTrip,
            addTrip,
            updateTrip,
            deleteTrip,
            addExpense,
            deleteExpense,
            editExpense,
            loading
        }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTripContext = () => useContext(TripContext);
