// firebase.js
// Configuration and initialization for Firebase Realtime Database
// Works with Firebase v8 (via CDN)

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdmv-ntCG0bRE8qdJJ1aRsvQOsJrZGNqw",
  authDomain: "trying-481a3.firebaseapp.com",
  databaseURL: "https://trying-481a3-default-rtdb.firebaseio.com",
  projectId: "trying-481a3",
  storageBucket: "trying-481a3.firebasestorage.app",
  messagingSenderId: "805552095273",
  appId: "1:805552095273:web:f0f4236402b566f3ee9c38",
  measurementId: "G-Q58QVNF60G"
};


// Initialize Firebase app instance using provided configuration
firebase.initializeApp(firebaseConfig);

// Retrieve the Realtime Database service reference
const db = firebase.database();

// Expose the database reference globally so that other scripts can access it
window.firebaseDb = db;
