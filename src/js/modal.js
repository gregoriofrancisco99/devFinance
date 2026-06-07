export const modal = {
  previouslyFocused: null,

  open() {
    this.previouslyFocused = document.activeElement;
    const overlay = document.querySelector('.modal-overlay');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    const first = document.getElementById('description');
    if (first) first.focus();
    document.addEventListener('keydown', this._handleKeydown);
  },

  close() {
    const overlay = document.querySelector('.modal-overlay');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    if (this.previouslyFocused) this.previouslyFocused.focus();
    document.removeEventListener('keydown', this._handleKeydown);
  },

  _handleKeydown: (e) => {
    if (e.key === 'Escape') modal.close();
  },
};
