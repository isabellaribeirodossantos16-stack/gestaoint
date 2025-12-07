
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB203iYO9fQZVEy0YqUkly9gfUkkZSYwcA",
  authDomain: "portal-corporativobr.firebaseapp.com",
  projectId: "portal-corporativobr",
  storageBucket: "portal-corporativobr.firebasestorage.app",
  messagingSenderId: "671941361744",
  appId: "1:671941361744:web:fee2bade6d875b4be61155",
  measurementId: "G-B7KXEPQLR3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore (Database) - Necessário para o sistema funcionar
const db = getFirestore(app);

export { db, app, analytics };
