// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAX707-ecQK0ww7NYI0XmfMQnmSKHrZSOA",
    authDomain: "tripledger-7981c.firebaseapp.com",
    projectId: "tripledger-7981c",
    storageBucket: "tripledger-7981c.firebasestorage.app",
    messagingSenderId: "260310398874",
    appId: "1:260310398874:web:a3c2bed01b8b5cc9a46c23"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const db = getFirestore(app);

// Initialize Auth with persistence
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (error) {
    // If auth is already initialized or fails, retrieve the existing instance
    console.log("Auth initialization fallback:", error.message);
    auth = getAuth(app);
}

export { auth };
export default app;
