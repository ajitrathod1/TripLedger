import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (usr) => {
            console.log("Auth State Changed:", usr ? "User Logged In: " + usr.email : "User Logged Out");
            setUser(usr);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => {
        console.log("Attempting Login for:", email);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = (email, password) => {
        console.log("Attempting Signup for:", email);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const googleLogin = async () => {
        console.log("Attempting Google Login...");
        if (Platform.OS === 'web') {
            const provider = new GoogleAuthProvider();
            return signInWithPopup(auth, provider);
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
