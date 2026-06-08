import { app } from './firebase-config';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup, // 💡 Alterado de signInWithRedirect para signInWithPopup
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configuração opcional para forçar a escolha de conta no Popup do Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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

// 💡 Alterado para abrir como Janela Popup flutuante
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Usuário autenticado via Popup com sucesso:", result.user);
    return result.user;
  } catch (error) {
    console.error("Erro interno no Popup do Google:", error);
    throw error;
  }
};

export const sendPasswordReset = async (email) => {
  if (!email) throw new Error('Email obrigatório');
  return firebaseSendPasswordResetEmail(auth, email);
};