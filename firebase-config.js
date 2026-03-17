// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5GP4AjhiruLww-9Ow2DC3JCKyRUNKdz4",
  authDomain: "ccraft-space-scripts.firebaseapp.com",
  databaseURL: "https://ccraft-space-scripts-default-rtdb.firebaseio.com",
  projectId: "ccraft-space-scripts",
  storageBucket: "ccraft-space-scripts.firebasestorage.app",
  messagingSenderId: "816078027492",
  appId: "1:816078027492:web:6472cce474078fd4d90af1",
  measurementId: "G-MHDM7YYYBN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
