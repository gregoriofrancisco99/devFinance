import { app } from './firebase-config';
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

const db = getFirestore(app);
const transactionsCollection = collection(db, 'transactions');

const createTransactionsQuery = (uid) => query(
  transactionsCollection,
  where('userId', '==', uid),
  orderBy('date', 'desc'),
);

export const getTransactions = async (uid) => {
  if (!uid) return [];
  const snapshot = await getDocs(createTransactionsQuery(uid));
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
};

export const subscribeTransactions = (uid, callback) => {
  if (!uid) return () => {};
  return onSnapshot(createTransactionsQuery(uid), (snapshot) => {
    const transactions = snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
    callback(transactions);
  });
};

export const addTransaction = async (transaction) => {
  const transactionData = {
    ...transaction,
    date: transaction.date ? Timestamp.fromDate(new Date(transaction.date)) : null,
    createdAt: serverTimestamp(),
    modifiedAt: serverTimestamp(),
  };

  await addDoc(transactionsCollection, transactionData);
};

export const deleteTransaction = async (transactionId) => {
  await deleteDoc(doc(db, 'transactions', transactionId));
};

export const updateTransaction = async (transactionId, values) => {
  const transactionDoc = doc(db, 'transactions', transactionId);
  await updateDoc(transactionDoc, {
    ...values,
    date: values.date ? Timestamp.fromDate(new Date(values.date)) : null,
    modifiedAt: serverTimestamp(),
  });
};
