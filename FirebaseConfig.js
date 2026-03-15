// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-LOrPzRH2wd4rS2ftp-ZKI3wg0Migvww",
  authDomain: "namaa-30e99.firebaseapp.com",
  projectId: "namaa-30e99",
  storageBucket: "namaa-30e99.firebasestorage.app",
  messagingSenderId: "678910410774",
  appId: "1:678910410774:web:191cb32c8f98503d9ff537",
  measurementId: "G-YJ7307VKLP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
