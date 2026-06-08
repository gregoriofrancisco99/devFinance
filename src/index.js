import './style.css';
import { App } from './js/app';
import { Form } from './js/form';
import { modal } from './js/modal';
import { DOM } from './js/dom';
import { transactionsSummary } from './js/summary';

// 🔑 Importações exclusivas de Autenticação (Sem checkRedirectResult)
import { 
  registerUser, 
  loginUser, 
  loginWithGoogle, 
  logoutUser, 
  onAuthStateChangedListener, 
  sendPasswordReset 
} from './js/auth-db';

let transactionsDbPromise = null;
const loadTransactionsDb = () => {
  if (!transactionsDbPromise) {
    transactionsDbPromise = import(/* webpackChunkName: "transactions-db" */ './js/transactions-db');
  }
  return transactionsDbPromise;
};

// Detecção dinâmica de contexto através de IDs únicos no DOM
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const appContainer = document.getElementById('app-container');
const authMessage = document.getElementById('auth-message');
const signOutButton = document.getElementById('sign-out-button');
const userEmailLabel = document.getElementById('user-email');
const addNewTransaction = document.getElementById('new-transaction');
const cancelBtn = document.getElementById('cancel-button');
const formElement = document.getElementById('transaction-form');
const userAvatar = document.getElementById('user-avatar');

const isLoginPage = !!loginPage;
const isRegisterPage = !!registerPage;
const isAppPage = !!appContainer;
let unsubscribeTransactions = null;

const setAuthMessage = (message) => {
  if (authMessage) {
    authMessage.textContent = message;
    authMessage.classList.remove('hiden', 'hidden'); 
  }
};

const teardownTransactions = () => {
  if (typeof unsubscribeTransactions === 'function') {
    unsubscribeTransactions();
    unsubscribeTransactions = null;
  }
};

// ========================================================
// 1. MONITOR CENTRAL DE ESTADO GLOBAL
// ========================================================
onAuthStateChangedListener((user) => {
  window.currentUser = user;
  console.log('Monitor de autenticação global: usuário atual ->', user ? user.email : 'null');

  if (isLoginPage || isRegisterPage) {
    if (user) {
      console.log('Usuário autenticado detetado. Redirecionando para a Dashboard...');
      window.location.replace('/');
    }
    return; 
  }

  if (isAppPage) {
    if (!user) {
      console.log('Acesso restrito. Redirecionando para login.html...');
      window.location.replace('/login.html');
      return;
    }

    if (userAvatar && user.photoURL) {
      userAvatar.src = user.photoURL;
      userAvatar.onerror = () => { userAvatar.src = './assets/user-regular-full.svg'; };
    } else if (userAvatar) {
      userAvatar.src = './assets/user-regular-full.svg';
    }

    if (userEmailLabel) userEmailLabel.textContent = user.email || 'Usuário';

    teardownTransactions();

    loadTransactionsDb().then(({ subscribeTransactions }) => {
      unsubscribeTransactions = subscribeTransactions(user.uid, (transactions) => {
        transactionsSummary.setTransactions(transactions);
        App.reload();
      });
    }).catch(err => console.error("Erro ao carregar base de dados:", err));
  }
});

// ========================================================
// 2. VINCULAÇÃO DE COMPONENTES E LISTENERS
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM totalmente carregado. Mapeando listeners com Popup...');

  // --- LISTENERS EXCLUSIVOS DA DASHBOARD ---
  if (addNewTransaction) addNewTransaction.addEventListener('click', () => { Form.setCreateMode(); modal.open(); });
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.close());
  if (formElement) Form.init(formElement, modal);

  if (DOM && DOM.transactionsContainer) {
    DOM.transactionsContainer.addEventListener('click', async (event) => {
      const editBtn = event.target.closest('.btn-edit');
      if (editBtn) {
        const tr = editBtn.closest('tr');
        if (!tr) return;
        const transaction = transactionsSummary.all.find((item) => item.id === tr.dataset.id);
        if (transaction) Form.openEdit(transaction);
        return;
      }

      const deleteBtn = event.target.closest('.btn-delete');
      if (deleteBtn) {
        const tr = deleteBtn.closest('tr');
        if (tr?.dataset.id) await transactionsSummary.remove(tr.dataset.id);
      }
    });
  }

  // --- LISTENERS EXCLUSIVOS DE AUTENTICAÇÃO ---
  const authForm = document.getElementById('auth-form');
  const signInButton = document.getElementById('sign-in-button');
  const signInwithGoogleButton = document.getElementById('sign-in-with-google');
  const registerButton = document.getElementById('register-button');
  const forgotPasswordLink = document.getElementById('forgot-password-link');

  // Login tradicional (E-mail/Senha)
  if (authForm && isLoginPage) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('auth-email')?.value.trim();
      const passwordInput = document.getElementById('auth-password')?.value;

      try {
        if (signInButton) {
          signInButton.disabled = true;
          signInButton.textContent = 'A entrar...';
        }
        setAuthMessage('');
        await loginUser(emailInput, passwordInput);
      } catch (error) {
        console.error(error);
        setAuthMessage('E-mail ou senha incorretos.');
      } finally {
        if (signInButton) {
          signInButton.disabled = false;
          signInButton.textContent = 'Entrar';
        }
      }
    });
  }

  // Registo de utilizador
  if (registerButton && isRegisterPage) {
    registerButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email')?.value.trim();
      const password = document.getElementById('auth-password')?.value;
      const confirmPassword = document.getElementById('auth-password-confirm')?.value;

      if (password !== confirmPassword) {
        setAuthMessage('As senhas não coincidem.');
        return;
      }

      try {
        setAuthMessage('');
        registerButton.disabled = true;
        registerButton.textContent = 'A cadastrar...';
        await registerUser(email, password);
      } catch (error) {
        setAuthMessage(error.message);
      } finally {
        registerButton.disabled = false;
        registerButton.textContent = 'Cadastrar';
      }
    });
  }

  // 💡 Botão do Google com Popup
  if (signInwithGoogleButton) {
    signInwithGoogleButton.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        signInwithGoogleButton.disabled = true;
        signInwithGoogleButton.textContent = 'A abrir Google...';
        setAuthMessage('');
        
        const user = await loginWithGoogle();
        if (user) {
          console.log('Sucesso no Popup! Redirecionando...');
          window.location.replace('/');
        }
      } catch (error) {
        console.error('Erro ao autenticar com Popup:', error);
        setAuthMessage('Falha ao abrir a autenticação do Google.');
        signInwithGoogleButton.disabled = false;
        signInwithGoogleButton.textContent = 'Entrar com Google';
      }
    });
  }

  // Recuperação de password
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email')?.value.trim();
      if (!email) {
        setAuthMessage('Introduza o e-mail no campo acima.');
        return;
      }
      try {
        await sendPasswordReset(email);
        setAuthMessage('E-mail de redefinição enviado!');
      } catch (error) {
        setAuthMessage(error.message);
      }
    });
  }

  // Logout
  if (signOutButton) {
    signOutButton.addEventListener('click', async () => {
      try {
        teardownTransactions();
        await logoutUser();
        window.location.replace('login.html');
      } catch (error) {
        console.error('Erro ao terminar sessão:', error);
      }
    });
  }

  if (isAppPage) {
    App.init();
  }
});