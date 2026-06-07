export const Utils = {
  formatAmount(value) {
    if (typeof value === 'string') value = value.replace(',', '.');
    const num = Number(value);
    if (Number.isNaN(num)) throw new Error('Valor inválido');
    return Math.round(num * 100);
  },

  formatDate(value) {
    if (!value) return '';

    if (typeof value !== 'string') {
      if (typeof value.toDate === 'function') {
        value = value.toDate().toISOString().slice(0, 10);
      } else if (value instanceof Date) {
        value = value.toISOString().slice(0, 10);
      } else {
        value = String(value);
      }
    }

    if (value.includes('-')) {
      const parts = value.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  },

  formatDateForDisplay(value) {
    if (!value) return '';
    if (typeof value !== 'string') {
      if (typeof value.toDate === 'function') {
        value = value.toDate().toISOString().slice(0, 10);
      } else if (value instanceof Date) {
        value = value.toISOString().slice(0, 10);
      } else {
        value = String(value);
      }
    }

    if (value.includes('-')) return Utils.formatDate(value);
    return value;
  },

  formatCurrency(value) {
    const cents = Number(value) || 0;
    const amount = Math.abs(cents) / 100;
    const formatted = amount.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return (cents < 0 ? '-' : '') + formatted;
  },
};
