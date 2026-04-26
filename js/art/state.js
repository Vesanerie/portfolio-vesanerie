// ===== Shared state & DOM refs =====

export const dom = {
  pileView: document.getElementById('pile-view'),
  bookView: document.getElementById('book-view'),
  backLink: document.getElementById('back-link'),
  pdfContainer: document.getElementById('pdf-container')
};

export const state = {
  isPdfMode: false,
  historyDepth: 0,
  poppingState: false,
  currentSubPile: null,
  folderHistory: []
};

export function setBackLink(label, href, onclick) {
  dom.backLink.textContent = '\u2190 ' + label;
  dom.backLink.href = href || '#';
  dom.backLink.onclick = onclick ? function(e) { e.preventDefault(); onclick(); } : null;
}
