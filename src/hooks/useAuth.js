import { useEffect, useState } from 'react';
import {
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setAuthReady(true);
      } else {
        setUser(null);
        signInAnonymously(auth).catch((error) => {
          console.error('Анонимный вход не удался:', error);
          setAuthReady(true);
        });
      }
    });
    return unsubscribe;
  }, []);

  // привязать почту к текущему (анонимному) аккаунту — uid и данные сохраняются
  const linkEmail = (email, password) =>
    linkWithCredential(
      auth.currentUser,
      EmailAuthProvider.credential(email, password)
    );

  // войти в существующий аккаунт
  const signInEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signOutUser = () => signOut(auth);

  return { user, authReady, linkEmail, signInEmail, signOutUser };
}