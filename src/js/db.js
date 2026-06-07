import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAn096tA0ya0L8Zd6xpDQbBwQfEwWIbQNo',
  authDomain: 'devfinance-d5d0b.firebaseapp.com',
  projectId: 'devfinance-d5d0b',
  storageBucket: 'devfinance-d5d0b.firebasestorage.app',
  messagingSenderId: '15012144569',
  appId: '1:15012144569:web:a3f5f0e384fe834aa80268',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const transactionsCollection = collection(db, 'transactions');

const createTransactionsQuery = (uid) => query(
  transactionsCollection,
  where('userId', '==', uid),
  orderBy('date', 'desc'),
);

export const registerUser = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return signOut(auth);
};

export const onAuthStateChangedListener = (callback) => onAuthStateChanged(auth, callback);

export const loginWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
};

export const getTransactions = async (uid) => {
  if (!uid) return [];
  const snapshot = await getDocs(createTransactionsQuery(uid));
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
};

export const sendPasswordReset = async (email) => {
  if (!email) throw new Error('Email obrigatório');
  return firebaseSendPasswordResetEmail(auth, email);
};

export const subscribeTransactions = (uid, callback) => {
  if (!uid) return () => {};
  return onSnapshot(createTransactionsQuery(uid), (snapshot) => {
    const transactions = snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
    callback(transactions);
  });
};

export const addTransaction = async (transaction) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  await addDoc(transactionsCollection, {
    ...transaction,
    uid: user.uid,
    date: transaction.date ? Timestamp.fromDate(new Date(transaction.date)) : null,
    createdAt: serverTimestamp(),
    modifiedAt: serverTimestamp(),
  });
};

export const deleteTransaction = async (transactionId) => {
  await deleteDoc(doc(db, 'transactions', transactionId));
};

export const updateTransaction = async (transactionId, values) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  const transactionDoc = doc(db, 'transactions', transactionId);
  await updateDoc(transactionDoc, {
    ...values,
    date: values.date ? Timestamp.fromDate(new Date(values.date)) : null,
    modifiedAt: serverTimestamp(),
  });
};
