
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Removed GoogleAuthProvider as we are switching
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB5cW9c7ANbrlBCsi1zcniW1O8n0tDdAoU",
  authDomain: "tournament-tracker-f0dav.firebaseapp.com", // Derived from projectId
  projectId: "tournament-tracker-f0dav",
  storageBucket: "tournament-tracker-f0dav.appspot.com", // Derived from projectId
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // TODO: Replace with your actual messagingSenderId
  appId: "YOUR_APP_ID", // TODO: Replace with your actual appId
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional: Replace if using Firebase Analytics
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
// Removed googleProvider

export { app, auth, db }; // Export db and auth
