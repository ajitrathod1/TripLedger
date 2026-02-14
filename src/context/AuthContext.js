import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createUserProfile, getUserProfile } from '../firebase/database';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (usr) => {
            console.log("Auth State Changed:", usr ? "User Logged In: " + usr.email : "User Logged Out");

            if (usr) {
                // Check if user profile exists in Firestore, create if not
                try {
                    const profile = await getUserProfile(usr.uid);
                    if (!profile) {
                        await createUserProfile(usr.uid, {
                            email: usr.email,
                            displayName: usr.displayName,
                            photoURL: usr.photoURL
                        });
                    }
                } catch (error) {
                    console.error("❌ Error checking/creating user profile:", error);
                }
            }

            setUser(usr);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => {
        console.log("Attempting Login for:", email);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, displayName = '') => {
        console.log("Attempting Signup for:", email);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name if provided
            if (displayName) {
                await updateProfile(userCredential.user, {
                    displayName: displayName
                });
            }

            // Create user profile in Firestore
            await createUserProfile(userCredential.user.uid, {
                email: email,
                displayName: displayName || email.split('@')[0],
                photoURL: ''
            });

            return userCredential;
        } catch (error) {
            console.error("❌ Signup Error:", error);
            throw error;
        }
    };

    const googleLogin = async () => {
        console.log("Attempting Google Login...");
        if (Platform.OS === 'web') {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Create user profile if first time login
            await createUserProfile(result.user.uid, {
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL
            });

            return result;
        } else {
            // Native implementation requires expo-auth-session and Google Cloud Setup
            // For now, we return a rejected promise to handle it gracefully in UI
            return Promise.reject(new Error("Google Sign-In on Mobile requires additional setup (SHA-1 keys). currently supported on Web only."));
        }
    };

    const logout = () => {
        console.log("Logging Out");
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, googleLogin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
