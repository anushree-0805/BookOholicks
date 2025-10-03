import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3kkdDacWZUPnjg_MJ_iGCxD9l1uMAV9g",
  authDomain: "ideanest-9cf3c.firebaseapp.com",
  projectId: "ideanest-9cf3c",
  storageBucket: "ideanest-9cf3c.firebasestorage.app",
  messagingSenderId: "578416565099",
  appId: "1:578416565099:web:099bd82d66adb15533ca2e",
  measurementId: "G-4MHM5L5930"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export default app;
