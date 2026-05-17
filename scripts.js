const modal = {
  previouslyFocused: null,
  open(){
    this.previouslyFocused = document.activeElement;
    const overlay = document.querySelector('.modal-overlay');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    const first = document.getElementById('description');
    if(first) first.focus();
    document.addEventListener('keydown', modal._handleKeydown);
  },
  close(){
    const overlay = document.querySelector('.modal-overlay');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    if(this.previouslyFocused) this.previouslyFocused.focus();
    document.removeEventListener('keydown', modal._handleKeydown);
  },
  _handleKeydown(e) {
    if(e.key === 'Escape') modal.close();
  }
}
const Storage = {
  get() {
    const raw = localStorage.getItem('dev.finance:transactions');
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(Transaction.normalize);
    } catch {
      return [];
    }
  },
  set(transactions) {
    const safeTransactions = Array.isArray(transactions)
      ? transactions.map(Transaction.normalize)
      : [];

    localStorage.setItem('dev.finance:transactions', JSON.stringify(safeTransactions));
  }
}

const Transaction = {
  create({ description, amount, date }) {
    const timestamp = new Date().toISOString();
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      description,
      amount,
      date,
      createdAt: timestamp,
      modifiedAt: timestamp,
    };
  },
  normalize(transaction) {
    const createdAt = transaction.createdAt || new Date().toISOString();
    return {
      id: transaction.id || (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`),
      description: transaction.description || '',
      amount: Number(transaction.amount) || 0,
      date: transaction.date || '',
      createdAt,
      modifiedAt: transaction.modifiedAt || createdAt,
    };
  }
}

const transactionsSummary = {
  all: Storage.get(),
  
  incomes() {
    let income = 0;
    transactionsSummary.all.forEach(row => {
      if(Number(row.amount) > 0) income += Number(row.amount);
    });
    return income;
  },
  expenses() {  
    let expense = 0;
    transactionsSummary.all.forEach(row => {
      if(Number(row.amount) < 0) expense += Number(row.amount);
    });
    return expense;
  },
  total(){
    return transactionsSummary.incomes() + transactionsSummary.expenses();
  },
  add(newTransaction) {
    transactionsSummary.all.push(newTransaction);
    App.reload();
  },
  remove(idOrIndex) {
    const index = typeof idOrIndex === 'string'
      ? transactionsSummary.all.findIndex(transaction => transaction.id === idOrIndex)
      : idOrIndex;

    if (index < 0) return;
    transactionsSummary.all.splice(index, 1);
    App.reload();
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  
  renderTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    tr.dataset.id = transaction.id;

    const tdDesc = document.createElement('td');
    tdDesc.className = 'description';
    tdDesc.textContent = transaction.description;

    const tdAmount = document.createElement('td');
    tdAmount.className = Number(transaction.amount) > 0 ? 'income' : 'expense';
    tdAmount.textContent = Utils.formatCurrency(Number(transaction.amount));

    const tdDate = document.createElement('td');
    tdDate.className = 'date';
    // display: convert stored ISO to localized format if needed
    tdDate.textContent = Utils.formatDateForDisplay(transaction.date);

    const tdActions = document.createElement('td');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-delete';
    btn.title = 'Remover transação';
    const img = document.createElement('img');
    img.src = './assets/minus.svg';
    img.alt = 'Eliminar transação';
    btn.appendChild(img);
    tdActions.appendChild(btn);

    tr.appendChild(tdDesc);
    tr.appendChild(tdAmount);
    tr.appendChild(tdDate);
    tr.appendChild(tdActions);

    DOM.transactionsContainer.appendChild(tr);
  },
  displayBalance() {
    document.getElementById('total-income').textContent = Utils.formatCurrency(transactionsSummary.incomes());
    document.getElementById('total-expense').textContent = Utils.formatCurrency(transactionsSummary.expenses());
    document.getElementById('total-amount').textContent = Utils.formatCurrency(transactionsSummary.total());
  },
  clear() {
    while (DOM.transactionsContainer.firstChild) {
      DOM.transactionsContainer.removeChild(DOM.transactionsContainer.firstChild);
    }
  }
}

const Utils = {
  formatAmount(value) {
    // Accept comma or dot as decimal separator, ensure integer cents
    if (typeof value === 'string') value = value.replace(',', '.');
    const num = Number(value);
    if (Number.isNaN(num)) throw new Error('Valor inválido');
    return Math.round(num * 100);
  },
  formatDate(value) {
    // Convert ISO date (YYYY-MM-DD) or already formatted date to DD/MM/YYYY
    if (!value) return '';
    if (value.includes('-')) {
      const parts = value.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return value;
  },
  formatDateForDisplay(value) {
    // handle stored ISO or already formatted
    if (!value) return '';
    if (value.includes('-')) return Utils.formatDate(value);
    // assume already dd/mm/yyyy
    return value;
  },
  formatCurrency(value) {
    const cents = Number(value) || 0;
    const amount = Math.abs(cents) / 100;
    const formatted = amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return (cents < 0 ? '-' : '') + formatted;
  }
}


const Form = {
  description: document.getElementById('description'),
  amount: document.getElementById('amount'),
  date: document.getElementById('date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },
  validateFields() {
    const {description, amount, date } = Form.getValues();

    if(
        description.trim() === '' ||
        amount.trim() === '' ||
        date.trim() === ''
      ) {
        throw new Error('Por favor, preencha todos os campos');
    }
    // Validate amount is a number
    const cleaned = amount.replace(',', '.');
    if (Number.isNaN(Number(cleaned))) throw new Error('Valor inválido');
  },
  formatValues(){
    let {description, amount, date } = Form.getValues();
    // store amount as integer cents and date as ISO (input format)
    amount = Utils.formatAmount(amount);
    // date from input is YYYY-MM-DD; keep that for storage
    return Transaction.create({
      description: description.trim(),
      amount,
      date
    });
  },
  clearFields() {
    form.reset();
  },
  submit(event) {
    event.preventDefault();
    
    try {
      Form.validateFields();
      const newTransaction = Form.formatValues()
      transactionsSummary.add(newTransaction);
      Form.clearFields();
      modal.close();
    } catch (error) {
      alert(error.message)
    }
  }
}

// Wire up UI event listeners
const newBtn = document.getElementById('new-transaction');
const cancelBtn = document.getElementById('cancel-button');
const form = document.getElementById('transaction-form');

if (newBtn) newBtn.addEventListener('click', () => modal.open());
if (cancelBtn) cancelBtn.addEventListener('click', () => modal.close());
if (form) form.addEventListener('submit', (e) => Form.submit(e));

// delegate delete button clicks
DOM.transactionsContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  const tr = btn.closest('tr');
  if (!tr) return;
  const id = tr.dataset.id;
  if (id) {
    transactionsSummary.remove(id);
    return;
  }
  const index = Number(tr.dataset.index);
  if (!Number.isNaN(index)) transactionsSummary.remove(index);
});

const App = {
  init() {
        
    // Render stored transactions in the table
    transactionsSummary.all.forEach(DOM.renderTransaction);

    DOM.displayBalance();
    Storage.set(transactionsSummary.all);
  },
  reload() {
    DOM.clear()
    App.init()
  }
}

App.init();
