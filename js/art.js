// ===== Art Portfolio — Entry Point =====

import { dom, state, setBackLink } from './art/state.js';
import { showArtFiche, hideArtFiche } from './art/fiche.js';
import { closeLightbox, showInLightbox } from './art/lightbox.js';
import { loadPdfAsBook } from './art/pdf-viewer.js';
import './art/cinema.js';
import './art/tiktok.js';
import './art/tilt.js';

// Skip deal animation if already played this session
if (sessionStorage.getItem('art-dealt')) {
  document.getElementById('pile-stack').classList.add('no-anim');
}
sessionStorage.setItem('art-dealt', '1');

// ===== PDF.js lazy load =====
var pdfJsLoaded = false;
function loadPdfJs(callback) {
  if (pdfJsLoaded) { callback(); return; }
  if (typeof pdfjsLib !== 'undefined') { pdfJsLoaded = true; callback(); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload = function() {
    pdfJsLoaded = true;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    callback();
  };
  document.head.appendChild(s);
}

// Gallery PDF click handlers
document.querySelectorAll('.gallery-pdf').forEach(function(item) {
  item.addEventListener('click', function() {
    var bookId = item.getAttribute('data-book');
    if (bookId) openBook(bookId);
  });
});

// PDF covers are now static thumbnails in the HTML (no JS loading needed)

// ===== Media control =====
function stopMediaInFolder(folderId) {
  var view = document.getElementById(folderId + '-view');
  if (!view) return;
  view.querySelectorAll('iframe').forEach(function(iframe) {
    var src = iframe.src;
    iframe.src = '';
    iframe.setAttribute('data-src', src);
  });
  view.querySelectorAll('video').forEach(function(v) { v.pause(); });
}

function restoreMediaInFolder(folderId) {
  var view = document.getElementById(folderId + '-view');
  if (!view) return;
  view.querySelectorAll('iframe').forEach(function(iframe) {
    var src = iframe.getAttribute('data-src');
    if (src) {
      iframe.src = src;
      iframe.removeAttribute('data-src');
    }
  });
  view.querySelectorAll('video').forEach(function(v) { v.play().catch(function(){}); });
}

// CMP video
var cmpVideo = document.getElementById('cmp-video');
if (cmpVideo) cmpVideo.volume = 0.5;

// ===== Pile: click to open a book or folder =====
document.querySelectorAll('.pile-book, .pile-phone, .pile-folder, .pile-film').forEach(function(card) {
  card.addEventListener('click', function() {
    var folder = card.getAttribute('data-folder');
    if (folder) { openFolder(folder); return; }
    var bookId = card.getAttribute('data-book');
    var title = card.querySelector('.pile-book-title');
    showArtFiche(bookId, title ? title.textContent : bookId);
    openBook(bookId);
  });
});

// ===== Folder navigation =====
function openFolder(folderId) {
  var folderView = document.getElementById(folderId + '-view');
  if (!folderView) return;

  if (state.currentSubPile) {
    var currentView = document.getElementById(state.currentSubPile + '-view');
    if (currentView) currentView.classList.add('hidden');
    state.folderHistory.push(state.currentSubPile);
  } else {
    dom.pileView.classList.add('hidden');
    state.folderHistory = [];
  }

  folderView.classList.remove('hidden');
  state.currentSubPile = folderId;

  restoreMediaInFolder(folderId);

  setBackLink('Art', '#', function() { closeFolder(); });
  history.pushState({view: 'folder', id: folderId}, '');
  state.historyDepth++;
}

function closeFolder() {
  closeLightbox();
  if (state.currentSubPile) {
    stopMediaInFolder(state.currentSubPile);
    var folderView = document.getElementById(state.currentSubPile + '-view');
    if (folderView) folderView.classList.add('hidden');
  }

  if (state.folderHistory.length > 0) {
    state.currentSubPile = state.folderHistory.pop();
    var parentView = document.getElementById(state.currentSubPile + '-view');
    if (parentView) parentView.classList.remove('hidden');
    setBackLink('Art', '#', function() { closeFolder(); });
  } else {
    state.currentSubPile = null;
    dom.pileView.classList.remove('hidden');
    setBackLink('Accueil', '../', null);
  }
  if (!state.poppingState && state.historyDepth > 0) {
    state.historyDepth--;
    history.back();
  }
}

// ===== Book / PDF open & close =====
function openBook(bookId) {
  var card = document.querySelector('[data-book="' + bookId + '"]');
  if (!card) return;

  var pdfUrl = card.getAttribute('data-pdf');
  if (pdfUrl) {
    var singlePage = card.getAttribute('data-single') === 'true';
    openPdfBook(pdfUrl, singlePage);
    return;
  }

  var imgUrl = card.getAttribute('data-img');
  if (imgUrl) {
    var title = card.querySelector('.pile-book-title');
    showInLightbox(imgUrl, title ? title.textContent : '');
  }
}

function openPdfBook(pdfUrl, singlePage) {
  state.isPdfMode = true;
  dom.pdfContainer.style.display = '';
  dom.pdfContainer.style.width = '100%';
  dom.pdfContainer.innerHTML = '<div class="book-loading">Chargement du PDF...</div>';

  if (state.currentSubPile) {
    var currentView = document.getElementById(state.currentSubPile + '-view');
    if (currentView) currentView.classList.add('hidden');
  } else {
    dom.pileView.classList.add('hidden');
  }
  dom.bookView.classList.remove('hidden');

  if (state.currentSubPile) {
    var fv = document.getElementById(state.currentSubPile + '-view');
    var ft = fv && fv.querySelector('.pile-title') ? fv.querySelector('.pile-title').textContent : state.currentSubPile;
    setBackLink(ft, '#', function() { closeBook(); });
  } else {
    setBackLink('Art', '#', function() { closeBook(); });
  }

  loadPdfJs(function() {
    loadPdfAsBook(pdfUrl, dom.pdfContainer, singlePage);
  });
  history.pushState({view: 'book'}, '');
  state.historyDepth++;
}

function closeBook() {
  closeLightbox();
  hideArtFiche();
  dom.bookView.classList.add('hidden');

  if (state.isPdfMode) {
    if (dom.pdfContainer._keyHandler) {
      document.removeEventListener('keydown', dom.pdfContainer._keyHandler);
    }
    if (dom.pdfContainer._touchStart) {
      var pdfDisplay = dom.pdfContainer.querySelector('.pdf-display');
      if (pdfDisplay) {
        pdfDisplay.removeEventListener('touchstart', dom.pdfContainer._touchStart);
        pdfDisplay.removeEventListener('touchend', dom.pdfContainer._touchEnd);
      }
    }
    dom.pdfContainer.innerHTML = '';
    dom.pdfContainer.style.display = 'none';
    state.isPdfMode = false;
  }

  if (state.currentSubPile) {
    var folderView = document.getElementById(state.currentSubPile + '-view');
    if (folderView) folderView.classList.remove('hidden');
    setBackLink('Art', '#', function() { closeFolder(); });
  } else {
    dom.pileView.classList.remove('hidden');
    setBackLink('Accueil', '../', null);
  }
  if (!state.poppingState && state.historyDepth > 0) {
    state.historyDepth--;
    history.back();
  }
}

// Escape to close book
document.addEventListener('keydown', function(e) {
  if (dom.bookView.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeBook();
});

// ===== Browser back button =====
window.addEventListener('popstate', function() {
  if (state.historyDepth <= 0) return;
  state.historyDepth--;
  state.poppingState = true;
  if (state.isPdfMode || !dom.bookView.classList.contains('hidden')) {
    closeBook();
  } else if (state.currentSubPile) {
    closeFolder();
  }
  state.poppingState = false;
});
