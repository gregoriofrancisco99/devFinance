const modal = {
  open(){
    document.querySelector('.modal-overlay').classList.add('active');
  },
  close(){
    document.querySelector('.modal-overlay').classList.remove('active');
  }
}
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finance:transactions')) || [];
  },
  set(transactions) {
    localStorage.setItem('dev.finance:transactions', JSON.stringify(transactions));
  }
}

const transactionsSummary = {
  all: Storage.get(),
  
  incomes() {
    let income = 0;
    transactionsSummary.all.forEach(row => {
      if(row.amount > 0) {
        income += row.amount;
      }
    })
    return income;
  },
  expenses() {  
    let expense = 0;
    transactionsSummary.all.forEach(row => {
      if(row.amount < 0) {
        expense += row.amount;
      }
    })
    return expense;
  },
  total(){
    return transactionsSummary.incomes() + transactionsSummary.expenses();
  },
  add(newTransaction) {
    transactionsSummary.all.push(newTransaction);
    App.reload();
  },
  remove(index) {
    transactionsSummary.all.splice(index, 1)
    App.reload();
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    
    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const className = transaction.amount > 0 ? 'income' : 'expense';
    
    const amount = Utils.formatCurrency(transaction.amount);
    
    const html =  
    `
      <td class="description">${transaction.description}</td>
      <td class="${className}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
      <img onClick=(transactionsSummary.remove(${index})) src="./assets/minus.svg" alt="Eliminar transação">
      </td>
    `
    //console.log(amount)
    return html;
  },
  displayBalance() {
    document.getElementById('total-income')
      .innerHTML = Utils.formatCurrency(transactionsSummary.incomes());
    document.getElementById('total-expense')
      .innerHTML =  Utils.formatCurrency(transactionsSummary.expenses());
    document.getElementById('total-amount')
      .innerHTML =  Utils.formatCurrency(transactionsSummary.total());

    
  },
  clear() {
    DOM.transactionsContainer.innerHTML = '';
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value);
    value *= 100;
    
    return value;
  },
  formatDate(value) {
    value = value.split('-');
    return `${value[2]}/${value[1]}/${value[0]}`
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';
    
    value = String(value).replace(/\D/g, '');
    
    value = Number(value) / 100;
    
    value = value.toLocaleString('pt-PT', {
      style: 'currency',
      currency: 'AOA'
    });

    return (signal + value)
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
  },
  formatValues(){
    let {description, amount, date } = Form.getValues();
    
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    Form.description.value = '';
    Form.amount.value = '';
    Form.date.value = '';
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

const App = {
  init() {
        
    // Add transactions in storage to the table
    transactionsSummary.all.forEach(DOM.addTransaction);

    DOM.displayBalance();
    Storage.set(transactionsSummary.all);
  },
  reload() {
    DOM.clear()
    App.init()
  }
}

App.init();
