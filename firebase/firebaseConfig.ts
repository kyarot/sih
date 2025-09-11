// firebaseConfig.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6teSgKvK5rutg2Slvr8KEQsL3HSgLhN4",
  authDomain: "medi-connect-fd1f4.firebaseapp.com",
  projectId: "medi-connect-fd1f4",
  storageBucket: "medi-connect-fd1f4.appspot.com",
  messagingSenderId: "620614772458",
  appId: "1:620614772458:web:2e29ef433cb9719bfd5993",
  measurementId: "G-MZDP6ZN43B",
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

export { app, auth };