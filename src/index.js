import './style.css';
import { App } from './js/app';
import { Form } from './js/form';
import { modal } from './js/modal';
import { DOM } from './js/dom';
import { transactionsSummary } from './js/summary';
import {
  subscribeTransactions,
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  onAuthStateChangedListener,
  sendPasswordReset,
} from './js/db';

const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const appContainer = document.getElementById('app-container');
const authMessage = document.getElementById('auth-message');
const authForm = document.getElementById('auth-form');
const signInButton = document.getElementById('sign-in-button');
const signInwithGoogleButton = document.getElementById('sign-in-with-google');
const registerButton = document.getElementById('register-button');
const signOutButton = document.getElementById('sign-out-button');
const userEmailLabel = document.getElementById('user-email');
const addNewTransaction = document.getElementById('new-transaction');
const cancelBtn = document.getElementById('cancel-button');
const formElement = document.getElementById('transaction-form');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const userAvatar = document.getElementById('user-avatar');
const isLoginPage = !!loginPage;
const isRegisterPage = !!registerPage;
const isAppPage = !!appContainer;
let unsubscribeTransactions = null;


const setAuthMessage = (message) => {
  if (authMessage) authMessage.textContent = message;
};

if (addNewTransaction) addNewTransaction.addEventListener('click', () => {
        Form.setCreateMode(); 
        modal.open();
    });

if (cancelBtn) cancelBtn.addEventListener('click', () => modal.close());
if (formElement) Form.init(formElement, modal);

if (DOM.transactionsContainer) {
  DOM.transactionsContainer.addEventListener('click', async (event) => {
    const editBtn = event.target.closest('.btn-edit');
    if (editBtn) {
      const tr = editBtn.closest('tr');
      if (!tr) return;

      const id = tr.dataset.id;
      const transaction = transactionsSummary.all.find((item) => item.id === id);
      if (transaction) Form.openEdit(transaction);
      return;
    }

    const deleteBtn = event.target.closest('.btn-delete');
    if (deleteBtn) {
      const tr = deleteBtn.closest('tr');
      if (!tr) return;

      const id = tr.dataset.id;
      if (id) {
        await transactionsSummary.remove(id);
      }
    }
  });
}

const teardownTransactions = () => {
    if (typeof unsubscribeTransactions === 'function') {
        unsubscribeTransactions();
        unsubscribeTransactions = null;

    };
  }

onAuthStateChangedListener((user) => {
    window.currentUser = user;

    if (isLoginPage || isRegisterPage) {
    if (user) window.location.replace('index.html'); 
    return;
  }

  if (isAppPage) {
      if (!user) {
          window.location.replace('login.html');
          return;
        }
        
        if (userAvatar && user.photoURL) {
          userAvatar.src = user.photoURL;
          userAvatar.onerror = () => {
            userAvatar.src = './assets/user-regular-full.svg';
          };
        } else if (userAvatar) {
          userAvatar.src = './assets/user-regular-full.svg';
        }

        if (userEmailLabel) userEmailLabel.textContent = user.email || 'Usuário'; 
        
        teardownTransactions();
        
        unsubscribeTransactions = subscribeTransactions(user.uid, (transactions) => {
            console.log('Auth state changed. Current user:', user.email);

            transactionsSummary.setTransactions(transactions);
            App.reload();
        });
  }
});

if (authForm) {
    authForm.addEventListener('submit', async (e) => {   
        e.preventDefault();


        const emailInput = document.getElementById('auth-email');
        const passwordInput = document.getElementById('auth-password');

        const email = emailInput?.value;
        const password = passwordInput?.value;
        
        try {
            signInButton.disabled = true;
            signInButton.classList.add('loading');
            signInButton.textContent = 'Entrando...';
            if(emailInput) emailInput.disabled = true;
            if(passwordInput) passwordInput.disabled = true;

            setAuthMessage('');

            await loginUser(email, password);
        
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        setAuthMessage(error.message);

        signInButton.disabled = false;
        signInButton.classList.remove('loading');
        signInButton.textContent = 'Entrar';
        if(emailInput) emailInput.disabled = false;
        if(passwordInput) passwordInput.disabled = false;
        }
    });
}

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email')?.value;
    if (!email) {
      setAuthMessage('Digite seu email acima para receber o link de redefinição.');
      return;
    }

    try {
      await sendPasswordReset(email);
      setAuthMessage('Se essa conta existir, um email de redefinição foi enviado.');
    } catch (err) {
      setAuthMessage(err.message);
    }
  });
}

if (registerButton) {
  registerButton.addEventListener('click', async () => {
    const email = document.getElementById('auth-email')?.value;
    const password = document.getElementById('auth-password')?.value;
    const confirmPassword = document.getElementById('auth-password-confirm')?.value;

    if (password !== confirmPassword) {
      setAuthMessage('As senhas não coincidem.');
      return;
    }

    try {
      setAuthMessage('');
      await registerUser(email, password);
    } catch (error) {
      setAuthMessage(error.message);
    }
  });
}

if (signInwithGoogleButton) {
    signInwithGoogleButton.addEventListener('click', async () => {
      try {
            signInwithGoogleButton.disabled = true;
            signInwithGoogleButton.classList.add('loading');
            setAuthMessage('');
            await loginWithGoogle();
        } catch (error) {
            setAuthMessage(error.message);
              signInwithGoogleButton.disabled = false;
            signInwithGoogleButton.classList.remove('loading');
        }
    });
} else {
    console.log('Botão de login com Google não encontrado. Ignorando funcionalidade de login social.');
}

if (signOutButton) {
  signOutButton.addEventListener('click', async () => {
    try {
      await logoutUser();
      if (isAppPage) window.location.replace('login.html');
    } catch (error) {
      setAuthMessage(error.message);
    }
  });
}

if (isAppPage) {
  App.init();
}
