import { Transaction } from './transaction';
import { addTransaction, deleteTransaction, updateTransaction } from './db';

export const transactionsSummary = {
  all: [],

  setTransactions(transactions) {
    this.all = transactions.map(Transaction.normalize);
  },

  incomes() {
    let income = 0;
    this.all.forEach((row) => {
      if (Number(row.amount) > 0) income += Number(row.amount);
    });
    return income;
  },

  expenses() {
    let expense = 0;
    this.all.forEach((row) => {
      if (Number(row.amount) < 0) expense += Number(row.amount);
    });
    return expense;
  },

  total() {
    return this.incomes() + this.expenses();
  },

  async add(newTransaction) {
    await addTransaction(newTransaction);
  },

  async update(id, values) {
    await updateTransaction(id, values);
  },

  async remove(idOrIndex) {
    const transactionId = typeof idOrIndex === 'string'
      ? idOrIndex
      : this.all[idOrIndex]?.id;

    if (!transactionId) return;
    await deleteTransaction(transactionId);
  },
};
