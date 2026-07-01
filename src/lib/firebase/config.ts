import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHxa_R68V3AHBrImXaV9LU8dmfL-5E51U",
  authDomain: "gamingbay.firebaseapp.com",
  projectId: "gamingbay",
  storageBucket: "gamingbay.firebasestorage.app",
  messagingSenderId: "122280130497",
  appId: "1:122280130497:web:5a7912a239afee5063a140"
};

// Initialize Firebase (singleton pattern for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
