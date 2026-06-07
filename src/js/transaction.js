const normalizeDate = (value) => {
  if (!value) return '';
  if (typeof value === 'object' && value !== null) {
    if (typeof value.toDate === 'function') {
      value = value.toDate();
    }

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
  }

  return String(value);
};

export const Transaction = {
  create({ description, category, amount, date }) {
    const timestamp = new Date().toISOString();
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      description,
      category,
      amount,
      date: normalizeDate(date),
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
      category: transaction.category || '',
      amount: Number(transaction.amount) || 0,
      date: normalizeDate(transaction.date),
      createdAt,
      modifiedAt: transaction.modifiedAt || createdAt,
    };
  },
};
