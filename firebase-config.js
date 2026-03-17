// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAnalytics } from "firebase/analytics";

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const analytics = getAnalytics(app);

export { db };
