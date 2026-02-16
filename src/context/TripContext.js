import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import {
    getUserTrips,
    createTrip as dbCreateTrip,
    updateTrip as dbUpdateTrip,
    deleteTrip as dbDeleteTrip,
    addExpense as dbAddExpense,
    updateExpense as dbUpdateExpense,
    deleteExpense as dbDeleteExpense,
    addMemberToTrip,
    removeMemberFromTrip,
    subscribeToUserTrips,
    subscribeToTrip,
    calculateSettlements,
    getTripStats
} from '../firebase/database';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Real-time subscription cleanup
    useEffect(() => {
        let unsubscribeTrips = null;
        let unsubscribeCurrentTrip = null;

        const setupSubscriptions = async () => {
            setLoading(true);
            setError(null);

            if (user) {
                try {
                    // Subscribe to user's trips (Real-time updates)
                    unsubscribeTrips = subscribeToUserTrips(user.uid, (updatedTrips) => {
                        setTrips(updatedTrips);
                        setLoading(false);
                    });
                } catch (e) {
                    console.error("❌ Subscription Error:", e);
                    setError(e.message);
                    setLoading(false);
                }
            } else {
                // Load from local storage when not logged in
                loadFromStorage();
            }
        };

        setupSubscriptions();

        // Cleanup subscriptions on unmount or user change
        return () => {
            if (unsubscribeTrips) unsubscribeTrips();
            if (unsubscribeCurrentTrip) unsubscribeCurrentTrip();
        };
    }, [user]);

    // Subscribe to current trip updates
    useEffect(() => {
        let unsubscribe = null;

        if (user && currentTrip?.id) {
            unsubscribe = subscribeToTrip(currentTrip.id, (updatedTrip) => {
                if (updatedTrip) {
                    setCurrentTrip(updatedTrip);
                }
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user, currentTrip?.id]);

    // --- Local Storage Functions (Offline Mode) ---

    const loadFromStorage = async () => {
        try {
            const storedTrips = await AsyncStorage.getItem('trips');
            if (storedTrips) {
                const parsedTrips = JSON.parse(storedTrips);
                setTrips(parsedTrips);
            } else {
                setTrips([]);
            }
        } catch (e) {
            console.error("❌ Local Load Error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const saveToStorage = async (updatedTrips) => {
        try {
            await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
        } catch (e) {
            console.error("❌ AsyncStorage Error:", e);
        }
    };

    // --- Trip Actions ---

    const addTrip = async (tripData) => {
        try {
            setError(null);

            if (user) {
                // Cloud mode
                const newTrip = await dbCreateTrip(user.uid, {
                    ...tripData,
                    ownerName: user.displayName || user.email,
                    ownerEmail: user.email
                });

                // Optimistic update (real-time listener will update anyway)
                setCurrentTrip(newTrip);
                return newTrip;
            } else {
                // Local mode
                const newTrip = {
                    id: Date.now().toString(),
                    ...tripData,
                    members: ['You'],
                    memberDetails: {
                        'You': {
                            name: 'You',
                            role: 'owner',
                            joinedAt: new Date().toISOString()
                        }
                    },
                    expenses: [],
                    createdAt: new Date().toISOString()
                };

                // Process added members (names)
                if (tripData.members && Array.isArray(tripData.members)) {
                    tripData.members.forEach(memberName => {
                        if (memberName && typeof memberName === 'string' && memberName.trim() !== '') {
                            const memId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
                            newTrip.members.push(memId);
                            newTrip.memberDetails[memId] = {
                                name: memberName.trim(),
                                role: 'member',
                                joinedAt: new Date().toISOString()
                            };
                        }
                    });
                }

                const updatedTrips = [...trips, newTrip];
                setTrips(updatedTrips);
                setCurrentTrip(newTrip);
                await saveToStorage(updatedTrips);
                return newTrip;
            }
        } catch (e) {
            console.error("❌ Add Trip Error:", e);
            setError(e.message);
            throw e;
        }
    };

    const updateTrip = async (tripId, updatedData) => {
        try {
            setError(null);

            if (user) {
                // Cloud mode
                await dbUpdateTrip(tripId, updatedData);

                // Update current trip if it's the one being updated
                if (currentTrip?.id === tripId) {
                    setCurrentTrip(prev => ({ ...prev, ...updatedData }));
                }
            } else {
                // Local mode
                const updatedTrips = trips.map(t =>
                    t.id === tripId ? { ...t, ...updatedData } : t
                );

                setTrips(updatedTrips);

                if (currentTrip?.id === tripId) {
                    setCurrentTrip(prev => ({ ...prev, ...updatedData }));
                }

                await saveToStorage(updatedTrips);
            }
        } catch (e) {
            console.error("❌ Update Trip Error:", e);
            setError(e.message);
            throw e;
        }
    };

    const deleteTrip = async (tripId) => {
        try {
            setError(null);

            if (user) {
                // Cloud mode
                await dbDeleteTrip(tripId, user.uid);

                if (currentTrip?.id === tripId) {
                    setCurrentTrip(null);
                }
            } else {
                // Local mode
                const updatedTrips = trips.filter(t => t.id !== tripId);
                setTrips(updatedTrips);

                if (currentTrip?.id === tripId) {
                    setCurrentTrip(null);
                }

                await saveToStorage(updatedTrips);
            }
        } catch (e) {
            console.error("❌ Delete Trip Error:", e);
            setError(e.message);
            throw e;
        }
    };

    // --- Member Actions ---

    const addMember = async (tripId, memberData) => {
        try {
            setError(null);

            if (user) {
                await addMemberToTrip(tripId, memberData);
            } else {
                // Local mode
                const updatedTrips = trips.map(t => {
                    if (t.id === tripId) {
                        const memberId = memberData.id || Date.now().toString();
                        return {
                            ...t,
                            members: [...(t.members || []), memberId],
                            memberDetails: {
                                ...(t.memberDetails || {}),
                                [memberId]: {
                                    name: memberData.name,
                                    email: memberData.email || '',
                                    role: 'member',
                                    joinedAt: new Date().toISOString()
                                }
                            }
                        };
                    }
                    return t;
                });

                setTrips(updatedTrips);

                if (currentTrip?.id === tripId) {
                    const updated = updatedTrips.find(t => t.id === tripId);
                    setCurrentTrip(updated);
                }

                await saveToStorage(updatedTrips);
            }
        } catch (e) {
            console.error("❌ Add Member Error:", e);
            setError(e.message);
            throw e;
        }
    };

    const removeMember = async (tripId, memberId) => {
        try {
            setError(null);

            if (user) {
                await removeMemberFromTrip(tripId, memberId);
            } else {
                // Local mode
                const updatedTrips = trips.map(t => {
                    if (t.id === tripId) {
                        const updatedMemberDetails = { ...t.memberDetails };
                        delete updatedMemberDetails[memberId];

                        return {
                            ...t,
                            members: t.members.filter(m => m !== memberId),
                            memberDetails: updatedMemberDetails
                        };
                    }
                    return t;
                });

                setTrips(updatedTrips);

                if (currentTrip?.id === tripId) {
                    const updated = updatedTrips.find(t => t.id === tripId);
                    setCurrentTrip(updated);
                }

                await saveToStorage(updatedTrips);
            }
        } catch (e) {
            console.error("❌ Remove Member Error:", e);
            setError(e.message);
            throw e;
        }
    };

    // --- Expense Actions ---

    const addExpense = async (expenseData) => {
        if (!currentTrip) {
            throw new Error('No trip selected');
        }

        try {
            setError(null);

            if (user) {
                await dbAddExpense(currentTrip.id, expenseData);
            } else {
                // Local mode
                const newExpense = {
                    id: Date.now().toString(),
                    ...expenseData,
                    date: expenseData.date || new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };

                const updatedTrip = {
                    ...currentTrip,
                    expenses: [newExpense, ...(currentTrip.expenses || [])]
                };

                const updatedTrips = trips.map(t =>
                    t.id === updatedTrip.id ? updatedTrip : t
                );

                setTrips(updatedTrips);
                setCurrentTrip(updatedTrip);
                await saveToStorage(updatedTrips);
            }
        } catch (e) {
            console.error("❌ Add Expense Error:", e);
            setError(e.message);
            throw e;
        }
    };

    const editExpense = async (expenseId, updatedExpenseData) => {
        if (!currentTrip) {
            throw new Error('No trip selected');
        }

        try {
            setError(null);

            if (user) {
                await dbUpdateExpense(currentTrip.id, expenseId, updatedExpenseData);
            } else {
                // Local mode
                const updatedExpenses = currentTrip.expenses.map(e =>
                    e.id === expenseId ? { ...e, ...updatedExpenseData } : e
                );

                const updatedTrip = { ...currentTrip, expenses: updatedExpenses };
                const updatedTrips = trips.map(t =>
                    t.id === updatedTrip.id ? updatedTrip : t
                );

                setTrips(updatedTrips);
                setCurrentTrip(updatedTrip);
                await saveToStorage(updatedTrips);
            }
        } catch (e) {
            console.error("❌ Edit Expense Error:", e);
            setError(e.message);
            throw e;
        }
    };

    const deleteExpense = async (expenseId) => {
        if (!currentTrip) {
            throw new Error('No trip selected');
        }

        try {
            setError(null);

            if (user) {
                await dbDeleteExpense(currentTrip.id, expenseId);
            } else {
                // Local mode
                const updatedExpenses = currentTrip.expenses.filter(e => e.id !== expenseId);
                const updatedTrip = { ...currentTrip, expenses: updatedExpenses };
                const updatedTrips = trips.map(t =>
                    t.id === updatedTrip.id ? updatedTrip : t
                );

                setTrips(updatedTrips);
                setCurrentTrip(updatedTrip);
                await saveToStorage(updatedTrips);
            }
        } catch (e) {
            console.error("❌ Delete Expense Error:", e);
            setError(e.message);
            throw e;
        }
    };

    // --- Utility Functions ---

    const getSettlements = () => {
        if (!currentTrip) return [];
        return calculateSettlements(currentTrip);
    };

    const getStats = () => {
        if (!currentTrip) return null;
        return getTripStats(currentTrip);
    };

    return (
        <TripContext.Provider value={{
            trips,
            currentTrip,
            setCurrentTrip,
            loading,
            error,

            // Trip actions
            addTrip,
            updateTrip,
            deleteTrip,

            // Member actions
            addMember,
            removeMember,

            // Expense actions
            addExpense,
            editExpense,
            deleteExpense,

            // Utilities
            getSettlements,
            getStats
        }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTripContext = () => useContext(TripContext);
