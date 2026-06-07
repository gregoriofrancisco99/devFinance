import { Transaction } from './transaction';

const STORAGE_KEY = 'dev.finance:transactions';

export const Storage = {
  get() {
    const raw = localStorage.getItem(STORAGE_KEY);
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeTransactions));
  },
};
