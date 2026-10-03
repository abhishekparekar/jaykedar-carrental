// Firebase Configuration — Jay Kedar Car Rental
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX19VWQ81SAB5Hy_gkMyV6Dwx9SZgy6iI",
  authDomain: "job-portal-85414.firebaseapp.com",
  databaseURL: "https://job-portal-85414-default-rtdb.firebaseio.com",
  projectId: "job-portal-85414",
  storageBucket: "job-portal-85414.firebasestorage.app",
  messagingSenderId: "699831995778",
  appId: "1:699831995778:web:e27e95bbec41744bd4d39b",
  measurementId: "G-957K9HNL00"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics (browser only)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn('Firebase Analytics not supported in this environment');
  }
}
export { analytics };

export default app;

