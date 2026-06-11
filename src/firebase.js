import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtqpiRbvRfvj0kaOLBFCZt8I6LJE01sO0",
  authDomain: "spec-clipboard.firebaseapp.com",
  projectId: "spec-clipboard",
  storageBucket: "spec-clipboard.firebasestorage.app",
  messagingSenderId: "520038203804",
  appId: "1:520038203804:web:bca87a578c5e5df4b20859",
  measurementId: "G-2QM9V1V7YC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);