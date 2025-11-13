// firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// ✅ Correct configuration (from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyA_g3HMPhBW22KMoFuJw85fSdmD4SFU2o0",
  authDomain: "finalhomeedge.firebaseapp.com",
  projectId: "finalhomeedge",
  storageBucket: "finalhomeedge.appspot.com",
  messagingSenderId: "713071714077",
  appId: "1:713071714077:web:552706292e08492008cbf4",
  measurementId: "G-97DKXSPRPL",
};

// 🔹 Prevent re-initializing
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔹 React Native-safe Auth (persistent)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// 🔹 Firestore
const db = getFirestore(app);

export { app, auth, db };
