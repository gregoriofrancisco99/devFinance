import { Utils } from './utils';
import { transactionsSummary } from './summary';

export const Form = {
  editingId: null,

  init(formElement, modal) {
    this.form = formElement;
    this.modal = modal;
    this.description = formElement.querySelector('#description');
    this.category = formElement.querySelector('#category');
    this.amount = formElement.querySelector('#amount');
    this.date = formElement.querySelector('#date');
    this.incomeType = formElement.querySelector('#income-type');
    this.expenseType = formElement.querySelector('#expense-type');
    this.submitButton = formElement.querySelector('button[type="submit"]');
    this.cancelButton = formElement.querySelector('#cancel-button');
    this.titleElement = document.getElementById('new-transaction-title');

    this.form.addEventListener('submit', (event) => this.submit(event));
    this.cancelButton.addEventListener('click', () => this.handleCancel());
    this.amount.addEventListener('input', (event) => this.formatAmountInput(event));
    this.setCreateMode();
    this.setTodayDate();
  },

  setTodayDate() {
    const today = new Date().toISOString().slice(0, 10);
    this.date.value = today;

  },

  formatAmountInput(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value === '') {
      event.target.value = '';
      return;
    }

    let numValue = parseInt(value, 10);
    const formatted = (numValue / 100).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    event.target.value = formatted;
  },


  getValues() {
    const isExpense = this.expenseType.checked;
    return {
      description: this.description.value,
      category: this.category.value,
      amount: this.amount.value,
      date: this.date.value,
      isExpense,
    };
  },

  validateFields() {
    const { description, category, amount, date } = this.getValues();

    if (
      description.trim() === '' ||
      category.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os campos');
    }

    const cleaned = amount.replace(/[^\d,]/g, '').replace(',', '.');
    if (Number.isNaN(Number(cleaned))) throw new Error('Valor inválido');
  },

  formatValues() {
    const { description, category, amount, date, isExpense } = this.getValues();
    const cleaned = amount.replace(/[^\d,]/g, '').replace(',', '.');
    let numValue = Number(cleaned);
    const normalizedAmount = Math.round(numValue * 100);
    const finalAmount = isExpense ? -normalizedAmount : normalizedAmount;

    return {
      description: description.trim(),
      category: category.trim(),
      amount: finalAmount,
      date,
    };
  },

  clearFields() {
    this.form.reset();
  },

  setCreateMode() {
    this.editingId = null;
    if (this.submitButton) this.submitButton.textContent = 'Enviar';
    if (this.titleElement) this.titleElement.textContent = 'Nova transação';
    this.incomeType.checked = true;
    this.clearFields();
    this.setTodayDate();
  },

  openEdit(transaction) {
    this.editingId = transaction.id;
    if (this.titleElement) this.titleElement.textContent = 'Editar transação';
    if (this.submitButton) this.submitButton.textContent = 'Atualizar';
    this.description.value = transaction.description || '';
    this.category.value = transaction.category || '';
    const isExpense = transaction.amount < 0;
    if (isExpense) {
      this.expenseType.checked = true;
    } else {
      this.incomeType.checked = true;
    }
    const absAmount = Math.abs(transaction.amount) / 100;
    this.amount.value = absAmount.toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    this.date.value = transaction.date || '';
    this.modal.open();
  },

  handleCancel() {
    this.setCreateMode();
    this.modal.close();
  },

  async submit(event) {
    event.preventDefault();

    try {
      this.validateFields();
      const values = this.formatValues();
      if (this.editingId) {
        await transactionsSummary.update(this.editingId, values);
      } else {
        await transactionsSummary.add(values);
      }
      this.setCreateMode();
      this.modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};
