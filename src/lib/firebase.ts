
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5cW9c7ANbrlBCsi1zcniW1O8n0tDdAoU",
  authDomain: "tournament-tracker-f0dav.firebaseapp.com",
  projectId: "tournament-tracker-f0dav",
  storageBucket: "tournament-tracker-f0dav.appspot.com",
  messagingSenderId: "", // Optional: Add if you use FCM
  appId: "", // Optional: Add your app ID for analytics etc.
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, firestore, googleProvider };
