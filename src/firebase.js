import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKHGzGy8bZAKT5-N-YGo1hLNR844oFRZw",
  authDomain: "tourist-app-daa76.firebaseapp.com",
  projectId: "tourist-app-daa76",
  storageBucket: "tourist-app-daa76.firebasestorage.app",
  messagingSenderId: "549823956417",
  appId: "1:549823956417:web:2b840675b661aec8aa1b40",
  measurementId: "G-HL6ZHJXSDZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
