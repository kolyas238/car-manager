import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBIrzW2fOpQ-EV_aQyrYGFnIkbc2tYf0oE',
  authDomain: 'cat-manager-ca5f3.firebaseapp.com',
  projectId: 'cat-manager-ca5f3',
  storageBucket: 'cat-manager-ca5f3.firebasestorage.app',
  messagingSenderId: '996943329349',
  appId: '1:996943329349:web:041767222d23306ff9f8b2c',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);