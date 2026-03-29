import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyCb6Dlb7P6TbLnW0RaGC09E0m7w-CYSFV8",
  authDomain: "book-list-79650.firebaseapp.com",
  projectId: "book-list-79650",
  storageBucket: "book-list-79650.firebasestorage.app",
  messagingSenderId: "1085049688015",
  appId: "1:1085049688015:web:e7d8b1f570e1117a1fccba",
  measurementId: "G-6JTDH2VDVD",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Add these two lines to export the auth services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
