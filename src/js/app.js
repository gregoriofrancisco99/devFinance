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
    App.init();
  },
};
