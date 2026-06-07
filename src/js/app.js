import { DOM } from './dom';
import { transactionsSummary } from './summary';

export const App = {
  init() {
    transactionsSummary.all.forEach((transaction, index) => {
      DOM.renderTransaction(transaction, index);
    });
    DOM.displayBalance();
  },

  reload() {
    DOM.clear();

    const fragment = document.createDocumentFragment();

    transactionsSummary.all.forEach((transaction, index) => {
      const row = DOM.renderTransaction(transaction, index);
      fragment.appendChild(row);
    });

    DOM.transactionsContainer.appendChild(fragment);
    DOM.displayBalance();

    App.init();
  },
};
