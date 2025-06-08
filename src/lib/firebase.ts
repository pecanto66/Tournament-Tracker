
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB5cW9c7ANbrlBCsi1zcniW1O8n0tDdAoU",
  authDomain: "tournament-tracker-f0dav.firebaseapp.com",
  projectId: "tournament-tracker-f0dav",
  storageBucket: "tournament-tracker-f0dav.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace if you use FCM, otherwise can be a placeholder or removed if not used
  appId: "YOUR_APP_ID", // Replace with your actual App ID from Firebase console
  measurementId: "YOUR_MEASUREMENT_ID" // Optional: Replace if you use Analytics
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
