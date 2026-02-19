import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from './config';

// ==================== SYSTEM OPERATIONS ====================
/**
 * Check Firestore connection
 */
export const checkConnection = async () => {
    try {
        await getDoc(doc(db, 'users', 'test'));
        return true;
    } catch (error) {
        console.error('❌ Firestore connection failed:', error.code, error.message);
        return false;
    }
};

// ==================== USER OPERATIONS ====================

/**
 * Create or update user profile in Firestore
 */
export const createUserProfile = async (userId, userData) => {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            uid: userId,
            email: userData.email,
            displayName: userData.displayName || '',
            photoURL: userData.photoURL || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });

        console.log('✅ User profile created/updated');
        return true;
    } catch (error) {
        console.error('❌ Error creating user profile:', error);
        throw error;
    }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    } catch (error) {
        console.error('❌ Error getting user profile:', error);
        throw error;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        console.log('✅ User profile updated');
        return true;
    } catch (error) {
        console.error('❌ Error updating user profile:', error);
        throw error;
    }
};

// ==================== TRIP OPERATIONS ====================

/**
 * Create a new trip
 */
export const createTrip = async (userId, tripData) => {
    try {
        const tripId = Date.now().toString();
        const tripRef = doc(db, 'trips', tripId);

        const initialMembers = [userId];
        const initialMemberDetails = {
            [userId]: {
                name: tripData.ownerName || 'You',
                email: tripData.ownerEmail || '',
                role: 'owner',
                joinedAt: serverTimestamp()
            }
        };

        // Process added members (names)
        if (tripData.members && Array.isArray(tripData.members)) {
            tripData.members.forEach(memberName => {
                if (memberName && typeof memberName === 'string' && memberName.trim() !== '') {
                    // Generate a simple unique ID for non-user members
                    const memId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
                    initialMembers.push(memId);
                    initialMemberDetails[memId] = {
                        name: memberName.trim(),
                        role: 'member',
                        joinedAt: serverTimestamp()
                    };
                }
            });
        }

        const trip = {
            id: tripId,
            name: tripData.name,
            destination: tripData.destination || '',
            startDate: tripData.startDate || null,
            endDate: tripData.endDate || null,
            budget: tripData.budget || 0,
            description: tripData.description || '',
            coverImage: tripData.coverImage || '',

            // Members & Permissions
            ownerId: userId,
            members: initialMembers,
            memberDetails: initialMemberDetails,

            // Expenses
            expenses: [],

            // Metadata
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isArchived: false,
        };

        await setDoc(tripRef, trip);

        // Add trip reference to user's trips
        const userTripRef = doc(db, 'users', userId, 'trips', tripId);
        await setDoc(userTripRef, {
            tripId: tripId,
            role: 'owner',
            addedAt: serverTimestamp()
        });

        console.log('✅ Trip created:', tripId);
        return { ...trip, id: tripId };
    } catch (error) {
        console.error('❌ Error creating trip:', error);
        console.error('Trip Data:', JSON.stringify(tripData));
        throw new Error(`Failed to create trip: ${error.message}`);
    }
};

/**
 * Get all trips for a user
 */
export const getUserTrips = async (userId) => {
    try {
        // Get trip references from user's subcollection
        const userTripsRef = collection(db, 'users', userId, 'trips');
        const userTripsSnap = await getDocs(userTripsRef);

        const tripIds = [];
        userTripsSnap.forEach(doc => {
            tripIds.push(doc.data().tripId);
        });

        if (tripIds.length === 0) {
            return [];
        }

        // Fetch actual trip data
        const trips = [];
        for (const tripId of tripIds) {
            const tripRef = doc(db, 'trips', tripId);
            const tripSnap = await getDoc(tripRef);

            if (tripSnap.exists()) {
                trips.push({ id: tripSnap.id, ...tripSnap.data() });
            }
        }

        // Sort by creation date (newest first)
        trips.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return bTime - aTime;
        });

        console.log(`✅ Loaded ${trips.length} trips for user`);
        return trips;
    } catch (error) {
        console.error('❌ Error getting user trips:', error);
        throw error;
    }
};

/**
 * Get a single trip by ID
 */
export const getTrip = async (tripId) => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);

        if (tripSnap.exists()) {
            return { id: tripSnap.id, ...tripSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('❌ Error getting trip:', error);
        throw error;
    }
};

/**
 * Update trip details
 */
export const updateTrip = async (tripId, updates) => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        await updateDoc(tripRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        console.log('✅ Trip updated:', tripId);
        return true;
    } catch (error) {
        console.error('❌ Error updating trip:', error);
        throw error;
    }
};

/**
 * Delete a trip
 */
export const deleteTrip = async (tripId, userId) => {
    try {
        const batch = writeBatch(db);

        // Get trip to find all members
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
            throw new Error('Trip not found');
        }

        const tripData = tripSnap.data();

        // Delete trip document
        batch.delete(tripRef);

        // Remove trip reference from all members
        for (const memberId of tripData.members || []) {
            const userTripRef = doc(db, 'users', memberId, 'trips', tripId);
            batch.delete(userTripRef);
        }

        await batch.commit();
        console.log('✅ Trip deleted:', tripId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting trip:', error);
        throw error;
    }
};

// ==================== MEMBER OPERATIONS ====================

/**
 * Add member to trip
 */
export const addMemberToTrip = async (tripId, memberData) => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const memberId = memberData.id || Date.now().toString();

        await updateDoc(tripRef, {
            members: arrayUnion(memberId),
            [`memberDetails.${memberId}`]: {
                name: memberData.name,
                email: memberData.email || '',
                role: 'member',
                joinedAt: serverTimestamp()
            },
            updatedAt: serverTimestamp()
        });

        console.log('✅ Member added to trip:', memberId);
        return memberId;
    } catch (error) {
        console.error('❌ Error adding member:', error);
        throw error;
    }
};

/**
 * Remove member from trip
 */
export const removeMemberFromTrip = async (tripId, memberId) => {
    try {
        const tripRef = doc(db, 'trips', tripId);

        // Get current trip data
        const tripSnap = await getDoc(tripRef);
        if (!tripSnap.exists()) {
            throw new Error('Trip not found');
        }

        const tripData = tripSnap.data();
        const updatedMemberDetails = { ...tripData.memberDetails };
        delete updatedMemberDetails[memberId];

        await updateDoc(tripRef, {
            members: arrayRemove(memberId),
            memberDetails: updatedMemberDetails,
            updatedAt: serverTimestamp()
        });

        console.log('✅ Member removed from trip:', memberId);
        return true;
    } catch (error) {
        console.error('❌ Error removing member:', error);
        throw error;
    }
};

// ==================== EXPENSE OPERATIONS ====================

/**
 * Add expense to trip
 */
export const addExpense = async (tripId, expenseData) => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const expenseId = Date.now().toString();

        const expense = {
            id: expenseId,
            title: expenseData.title,
            amount: parseFloat(expenseData.amount),
            category: expenseData.category || 'Other',
            paidBy: expenseData.paidBy,
            splitBetween: expenseData.splitBetween || [],
            description: expenseData.description || '',
            date: expenseData.date || new Date().toISOString(),
            receipt: expenseData.receipt || '',
            createdAt: serverTimestamp()
        };

        await updateDoc(tripRef, {
            expenses: arrayUnion(expense),
            updatedAt: serverTimestamp()
        });

        console.log('✅ Expense added:', expenseId);
        return expense;
    } catch (error) {
        console.error('❌ Error adding expense:', error);
        console.error('Expense Data:', JSON.stringify(expenseData));
        throw new Error(`Failed to add expense: ${error.message}`);
    }
};

/**
 * Update expense
 */
export const updateExpense = async (tripId, expenseId, updates) => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
            throw new Error('Trip not found');
        }

        const tripData = tripSnap.data();
        const updatedExpenses = tripData.expenses.map(exp => {
            if (exp.id === expenseId) {
                return { ...exp, ...updates };
            }
            return exp;
        });

        await updateDoc(tripRef, {
            expenses: updatedExpenses,
            updatedAt: serverTimestamp()
        });

        console.log('✅ Expense updated:', expenseId);
        return true;
    } catch (error) {
        console.error('❌ Error updating expense:', error);
        throw error;
    }
};

/**
 * Delete expense
 */
export const deleteExpense = async (tripId, expenseId) => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
            throw new Error('Trip not found');
        }

        const tripData = tripSnap.data();
        const updatedExpenses = tripData.expenses.filter(exp => exp.id !== expenseId);

        await updateDoc(tripRef, {
            expenses: updatedExpenses,
            updatedAt: serverTimestamp()
        });

        console.log('✅ Expense deleted:', expenseId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting expense:', error);
        throw error;
    }
};

// ==================== REAL-TIME LISTENERS ====================

/**
 * Subscribe to trip updates (Real-time)
 */
export const subscribeToTrip = (tripId, callback) => {
    const tripRef = doc(db, 'trips', tripId);

    const unsubscribe = onSnapshot(tripRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() });
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('❌ Error in trip subscription:', error);
    });

    return unsubscribe;
};

/**
 * Subscribe to user's trips (Real-time)
 */
export const subscribeToUserTrips = (userId, callback) => {
    const userTripsRef = collection(db, 'users', userId, 'trips');

    const unsubscribe = onSnapshot(userTripsRef, async (snapshot) => {
        const tripIds = [];
        snapshot.forEach(doc => {
            tripIds.push(doc.data().tripId);
        });

        if (tripIds.length === 0) {
            callback([]);
            return;
        }

        // Fetch all trips
        const trips = [];
        for (const tripId of tripIds) {
            const tripRef = doc(db, 'trips', tripId);
            const tripSnap = await getDoc(tripRef);

            if (tripSnap.exists()) {
                trips.push({ id: tripSnap.id, ...tripSnap.data() });
            }
        }

        // Sort by creation date
        trips.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return bTime - aTime;
        });

        callback(trips);
    }, (error) => {
        console.error('❌ Error in trips subscription:', error);
    });

    return unsubscribe;
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Archive/Unarchive trip
 */
export const toggleArchiveTrip = async (tripId, isArchived) => {
    try {
        const tripRef = doc(db, 'trips', tripId);
        await updateDoc(tripRef, {
            isArchived: isArchived,
            updatedAt: serverTimestamp()
        });

        console.log(`✅ Trip ${isArchived ? 'archived' : 'unarchived'}:`, tripId);
        return true;
    } catch (error) {
        console.error('❌ Error toggling archive:', error);
        throw error;
    }
};

/**
 * Get trip statistics
 */
export const getTripStats = (trip) => {
    if (!trip || !trip.expenses) {
        return {
            totalExpenses: 0,
            expenseCount: 0,
            categoryBreakdown: {},
            memberSpending: {}
        };
    }

    const totalExpenses = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = trip.expenses.length;

    // Category breakdown
    const categoryBreakdown = {};
    trip.expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + exp.amount;
    });

    // Member spending
    const memberSpending = {};
    trip.expenses.forEach(exp => {
        const payer = exp.paidBy;
        memberSpending[payer] = (memberSpending[payer] || 0) + exp.amount;
    });

    return {
        totalExpenses,
        expenseCount,
        categoryBreakdown,
        memberSpending
    };
};

/**
 * Calculate settlements (Who owes whom)
 */
/**
 * Calculate settlements (Who owes whom)
 */
export const calculateSettlements = (trip) => {
    if (!trip || !trip.expenses || !trip.members) {
        return [];
    }

    const members = trip.members;
    const expenses = trip.expenses;

    // Initialize balances
    const balances = {};
    members.forEach(m => balances[m] = 0);

    // Process each expense to calculate net balances
    expenses.forEach(expense => {
        const { amount, paidBy, splitBetween } = expense;

        // Validation: Ensure payer and amount exist
        if (!paidBy || !amount) return;

        // Credit the payer (they paid, so they are owed this amount initially)
        balances[paidBy] = (balances[paidBy] || 0) + amount;

        // Determine who splits this expense
        // specific split > all members fallback
        const splitters = (splitBetween && splitBetween.length > 0) ? splitBetween : members;

        const splitAmount = amount / splitters.length;

        // Debit the splitters (they consumed, so they owe this amount)
        splitters.forEach(member => {
            balances[member] = (balances[member] || 0) - splitAmount;
        });
    });

    // Separate debtors and creditors
    const debtors = [];
    const creditors = [];

    // Round balances to 2 decimal places to avoid float precision issues
    Object.keys(balances).forEach(m => {
        const balance = Math.round(balances[m] * 100) / 100;
        if (balance < -0.01) {
            debtors.push({ name: m, amount: -balance });
        } else if (balance > 0.01) {
            creditors.push({ name: m, amount: balance });
        }
    });

    // Calculate settlements using a greedy approach
    const transactions = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debt = debtors[i];
        const credit = creditors[j];

        // The amount to settle is the minimum of what's owed vs what's receivable
        const amount = Math.min(debt.amount, credit.amount);

        if (amount > 0) {
            transactions.push({
                from: debt.name,
                to: credit.name,
                amount: Math.round(amount * 100) / 100
            });
        }

        // Update remaining amounts
        debt.amount -= amount;
        credit.amount -= amount;

        // Move to next person if their balance is settled (close to 0)
        if (debt.amount < 0.01) i++;
        if (credit.amount < 0.01) j++;
    }

    return transactions;
};
