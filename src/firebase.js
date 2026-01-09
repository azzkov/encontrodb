import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
apiKey: "AIzaSyC-NzZVaBdnWyARIIUwdSk5oxLeQqja4gk",
  authDomain: "simulado-8aa74.firebaseapp.com",
  projectId: "simulado-8aa74",
  storageBucket: "simulado-8aa74.firebasestorage.app",
  messagingSenderId: "889179479895",
  appId: "1:889179479895:web:400c7b4f4ec66dbf7a6812"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);