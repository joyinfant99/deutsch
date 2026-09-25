import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase web config is public by design; access is protected by Auth + Firestore rules.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBUsq7hfS2kQtNhiuDlhesMt1-YbmUk3-g",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "presalesbench.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "presalesbench",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "presalesbench.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "153054066367",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:153054066367:web:5110b39337d8cd96ca380a",
};

export const USERS_COLLECTION = "deutsch_users";

export function fb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return { auth: getAuth(app) };
}
