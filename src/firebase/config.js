// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
