// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Initialize Firebase
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5aXEnjFnqBil-OaDlnMaUlA5DkDGVuAg",
  authDomain: "itechz-ed07e.firebaseapp.com",
  projectId: "itechz-ed07e",
  storageBucket: "itechz-ed07e.firebasestorage.app",
  messagingSenderId: "259549515349",
  appId: "1:259549515349:web:98a4a96aa6b5284dea0edc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services to use in your app
export const db = getFirestore(app);      // Para Firestore Database
export const storage = getStorage(app);   // Para Storage (subir archivos)
export const auth = getAuth(app);         // Para Authentication

export default app;