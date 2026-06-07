import { Utils } from './utils';
import { transactionsSummary } from './summary';

export const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  renderTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    tr.dataset.id = transaction.id;

    const tdDesc = document.createElement('td');
    tdDesc.className = 'description';
    tdDesc.textContent = transaction.description;

    const tdCategory = document.createElement('td');
    tdCategory.className = 'category';
    tdCategory.textContent = transaction.category || '-';

    const tdAmount = document.createElement('td');
    tdAmount.className = Number(transaction.amount) > 0 ? 'income' : 'expense';
    tdAmount.textContent = Utils.formatCurrency(Number(transaction.amount));

    const tdDate = document.createElement('td');
    tdDate.className = 'date';
    tdDate.textContent = Utils.formatDateForDisplay(transaction.date);

    const tdActions = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-edit';
    editBtn.title = 'Editar transação';
    const editImg = document.createElement('img');
    editImg.src = '../assets/edit.png';
    editImg.alt = 'Editar transação';
    editBtn.appendChild(editImg);
    tdActions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.title = 'Remover transação';
    const deleteImg = document.createElement('img');
    deleteImg.src = '../assets/minus.svg';
    deleteImg.alt = 'Eliminar transação';
    deleteBtn.appendChild(deleteImg);
    tdActions.appendChild(deleteBtn);

    tr.appendChild(tdDesc);
    tr.appendChild(tdCategory);
    tr.appendChild(tdAmount);
    tr.appendChild(tdDate);
    tr.appendChild(tdActions);

    this.transactionsContainer.appendChild(tr);
  },

  displayBalance() {
    document.getElementById('total-income').textContent = Utils.formatCurrency(transactionsSummary.incomes());
    document.getElementById('total-expense').textContent = Utils.formatCurrency(transactionsSummary.expenses());
    document.getElementById('total-amount').textContent = Utils.formatCurrency(transactionsSummary.total());
  },

  clear() {
    while (this.transactionsContainer.firstChild) {
      this.transactionsContainer.removeChild(this.transactionsContainer.firstChild);
    }
  },
};
