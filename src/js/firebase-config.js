import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const firebaseConfig = {
  apiKey: 'AIzaSyAn096tA0ya0L8Zd6xpDQbBwQfEwWIbQNo',
  // 💡 Resolve o problema de entregar o token no lugar errado ou bloquear cookies
  authDomain: isLocalhost ? 'devfinance-d5d0b.firebaseapp.com' : 'financesdev.vercel.app', 
  projectId: 'devfinance-d5d0b',
  storageBucket: 'devfinance-d5d0b.firebasestorage.app',
  messagingSenderId: '15012144569',
  appId: '1:15012144569:web:a3f5f0e384fe834aa80268',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };