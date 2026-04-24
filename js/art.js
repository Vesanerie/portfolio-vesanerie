// ===== Art Portfolio — Pile + Book =====

var pileView = document.getElementById('pile-view');
var bookView = document.getElementById('book-view');
var backLink = document.getElementById('back-link');
var pdfContainer = document.getElementById('pdf-container');
var isPdfMode = false;

// Back link helper
function setBackLink(label, href, onclick) {
  backLink.textContent = '\u2190 ' + label;
  backLink.href = href || '#';
  backLink.onclick = onclick ? function(e) { e.preventDefault(); onclick(); } : null;
}

// PDF.js worker — defer: init apres DOMContentLoaded
function initPdfJs() {
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  // Gallery PDF covers (besoin de pdfjsLib charge)
  document.querySelectorAll('.gallery-pdf').forEach(function(item) {
    var pdfUrl = item.getAttribute('data-pdf');
    var canvas = item.querySelector('canvas');
    if (pdfUrl && canvas && typeof pdfjsLib !== 'undefined') {
      pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
        pdf.getPage(1).then(function(page) {
          var viewport = page.getViewport({ scale: 0.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport });
        });
      }).catch(function(e) { console.warn('Gallery PDF cover failed:', e); });
    }
    item.addEventListener('click', function() {
      var bookId = item.getAttribute('data-book');
      if (bookId) openBook(bookId);
    });
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPdfJs);
} else {
  initPdfJs();
}

var currentSubPile = null;

// ===== Fiches projet =====
var artProjects = {
  'culture-hot':      { format: 'Magazine A4, 48 pages',       date: '2025', intent: 'Magazine culturel trimestriel — musique, art, cinema' },
  'memoire-clown':    { format: 'Hors-serie A4',               date: '2025', intent: 'Essai illustre sur la figure du clown' },
  'random-zine':      { format: 'Fanzine A5, 30 exemplaires',  date: '2026', intent: 'Bande dessinee independante' },
  'spirale-sket-tour':{ format: 'Fanzine A5, 30 exemplaires',  date: '2026', intent: 'Carnet de croquis de voyage' },
  'sauce':            { format: 'Zine A6',                     date: '2026', intent: 'Recueil de recettes de sauces maison' },
  'rk-brand':         { format: 'Brand book paysage',          date: '2026', intent: 'Identite visuelle pour un charpentier a Perth' },
  'magnificat':       { format: 'Illustration numerique',      date: '2026', intent: 'Cover remix Vald pour SoundCloud' },
  'flyer-perth':      { format: 'Affiche A3',                  date: '2026', intent: 'Flyer pour Perth Draw Club — appel a artistes' },
  'carnet-rose':      { format: 'Carnet PDF, pages libres',    date: '2024', intent: 'Carnet de recherche — croquis et essais' },
  'carnet-rouge':     { format: 'Carnet PDF, pages libres',    date: '2025', intent: 'Carnet de recherche — explorations graphiques' },
  'carnet-jaune':     { format: 'Carnet PDF, pages libres',    date: '2025', intent: 'Carnet de recherche — etudes de couleur' },
  'voiture':          { format: 'Illustration PDF',            date: '2026', intent: 'Planche illustration automobile' }
};

var artFiche = document.getElementById('art-fiche');
var artFicheTitle = document.getElementById('art-fiche-title');
var artFicheFormat = document.getElementById('art-fiche-format');
var artFicheDate = document.getElementById('art-fiche-date');
var artFicheIntent = document.getElementById('art-fiche-intent');

function showArtFiche(bookId, title) {
  var info = artProjects[bookId];
  if (!info) { openBook(bookId); return; }
  artFicheTitle.textContent = title;
  artFicheFormat.textContent = info.format;
  artFicheDate.textContent = info.date;
  artFicheIntent.textContent = info.intent;
  artFiche.classList.add('open');
  openBook(bookId);
}

function hideArtFiche() {
  artFiche.classList.remove('open');
}

// ===== Pile: click to open a book or folder =====
document.querySelectorAll('.pile-book, .pile-phone, .pile-folder, .pile-film').forEach(function(card) {
  card.addEventListener('click', function() {
    var folder = card.getAttribute('data-folder');
    if (folder) {
      openFolder(folder);
      return;
    }
    var bookId = card.getAttribute('data-book');
    var title = card.querySelector('.pile-book-title');
    showArtFiche(bookId, title ? title.textContent : bookId);
  });
});

// Load covers only for cards visible in the main pile (not sub-piles)
var coversLoaded = {};
function loadCoversInView(viewId) {
  var view = viewId ? document.getElementById(viewId + '-view') : document.getElementById('pile-view');
  if (!view || coversLoaded[viewId || 'main']) return;
  coversLoaded[viewId || 'main'] = true;
  view.querySelectorAll('.pile-book, .pile-phone, .pile-folder, .pile-film').forEach(function(card) {
    var pdfUrl = card.getAttribute('data-pdf') || card.getAttribute('data-cover-pdf');
    if (pdfUrl && !card.classList.contains('has-cover')) {
      loadPdfCover(pdfUrl, card);
    }
  });
}

// Load main pile covers on start
loadCoversInView(null);

var folderHistory = [];

function openFolder(folderId) {
  var folderView = document.getElementById(folderId + '-view');
  if (!folderView) return;

  // Hide current view
  if (currentSubPile) {
    var currentView = document.getElementById(currentSubPile + '-view');
    if (currentView) currentView.classList.add('hidden');
    folderHistory.push(currentSubPile);
  } else {
    pileView.classList.add('hidden');
    folderHistory = [];
  }

  folderView.classList.remove('hidden');
  currentSubPile = folderId;

  loadCoversInView(folderId);
  restoreMediaInFolder(folderId);

  setBackLink('Art', '#', function() { closeFolder(); });
}

// TikTok scroll counter + arrows
var tiktokScroll = document.querySelector('.tiktok-scroll');
var tiktokCounter = document.getElementById('tiktok-counter');
var tiktokUp = document.getElementById('tiktok-up');
var tiktokDown = document.getElementById('tiktok-down');
if (tiktokScroll && tiktokCounter) {
  var tiktokWraps = tiktokScroll.querySelectorAll('.tiktok-embed-wrap');
  var tiktokTotal = tiktokWraps.length;
  function getItemH() { return tiktokWraps[0] ? tiktokWraps[0].offsetHeight : 580; }
  var itemH = getItemH();
  window.addEventListener('resize', function() { itemH = getItemH(); });
  var currentTiktok = 0;

  tiktokScroll.addEventListener('scroll', function() {
    itemH = getItemH();
    var idx = Math.floor(tiktokScroll.scrollTop / itemH);
    tiktokCounter.textContent = (idx + 1) + ' / ' + tiktokTotal;

    if (idx !== currentTiktok) {
      // Stop previous video
      var prevIframe = tiktokWraps[currentTiktok].querySelector('iframe');
      if (prevIframe) {
        var src = prevIframe.src;
        prevIframe.src = '';
        prevIframe.src = src;
      }
      currentTiktok = idx;
    }
  });

  tiktokUp.addEventListener('click', function() {
    itemH = getItemH();
    var idx = Math.floor(tiktokScroll.scrollTop / itemH);
    if (idx > 0) tiktokScroll.scrollTo({ top: (idx - 1) * itemH, behavior: 'smooth' });
  });

  tiktokDown.addEventListener('click', function() {
    itemH = getItemH();
    var idx = Math.floor(tiktokScroll.scrollTop / itemH);
    if (idx < tiktokTotal - 1) tiktokScroll.scrollTo({ top: (idx + 1) * itemH, behavior: 'smooth' });
  });
}

// Gallery lightbox with arrow navigation
var galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
var lightboxIdx = 0;

function showLightbox(idx) {
  if (idx < 0 || idx >= galleryImages.length) return;
  lightboxIdx = idx;
  document.getElementById('lightbox-img').src = galleryImages[idx].src;
  document.getElementById('lightbox-img').alt = galleryImages[idx].alt;
  document.getElementById('lightbox').classList.add('open');
}

galleryImages.forEach(function(img, i) {
  img.addEventListener('click', function() {
    showLightbox(i);
  });
});

document.addEventListener('keydown', function(e) {
  var lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (lightboxIdx < galleryImages.length - 1) showLightbox(lightboxIdx + 1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (lightboxIdx > 0) showLightbox(lightboxIdx - 1);
  } else if (e.key === 'Escape') {
    lb.classList.remove('open');
  }
});


function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  hideArtFiche();
}

function stopMediaInFolder(folderId) {
  var view = document.getElementById(folderId + '-view');
  if (!view) return;
  // Stop iframes (YouTube, TikTok)
  view.querySelectorAll('iframe').forEach(function(iframe) {
    var src = iframe.src;
    iframe.src = '';
    iframe.setAttribute('data-src', src);
  });
  // Pause videos
  view.querySelectorAll('video').forEach(function(v) { v.pause(); });
}

// CMP video: unmute at 50% volume on first user interaction
var cmpVideo = document.getElementById('cmp-video');
if (cmpVideo) {
  cmpVideo.volume = 0.5;
  document.addEventListener('click', function unmuteCmp() {
    cmpVideo.muted = false;
    document.removeEventListener('click', unmuteCmp);
  }, { once: true });
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

function closeFolder() {
  closeLightbox();
  if (currentSubPile) {
    stopMediaInFolder(currentSubPile);
    var folderView = document.getElementById(currentSubPile + '-view');
    if (folderView) folderView.classList.add('hidden');
  }

  // Go back to parent folder or main pile
  if (folderHistory.length > 0) {
    currentSubPile = folderHistory.pop();
    var parentView = document.getElementById(currentSubPile + '-view');
    if (parentView) parentView.classList.remove('hidden');
    setBackLink('Art', '#', function() { closeFolder(); });
  } else {
    currentSubPile = null;
    pileView.classList.remove('hidden');
    setBackLink('Accueil', '../', null);
  }
}

async function loadPdfCover(url, card) {
  // Skip if card says no cover
  if (card.hasAttribute('data-skip-cover')) return;
  try {
    var pdf = await pdfjsLib.getDocument(url).promise;
    var page = await pdf.getPage(1);
    var viewport = page.getViewport({ scale: 0.4 });
    var canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
    card.style.backgroundImage = 'url(' + canvas.toDataURL('image/jpeg', 0.6) + ')';
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
    card.classList.add('has-cover');
  } catch (e) { console.warn('Cover load failed:', url, e); }
}

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
    document.getElementById('lightbox-img').src = imgUrl;
    document.getElementById('lightbox-img').alt = card.querySelector('.pile-book-title')?.textContent || '';
    document.getElementById('lightbox').classList.add('open');
  }
}

function openPdfBook(pdfUrl, singlePage) {
  isPdfMode = true;
  pdfContainer.style.display = '';
  pdfContainer.style.width = '100%';
  pdfContainer.innerHTML = '<div class="book-loading">Chargement du PDF...</div>';

  // Hide current view (sub-pile or main pile)
  if (currentSubPile) {
    var currentView = document.getElementById(currentSubPile + '-view');
    if (currentView) currentView.classList.add('hidden');
  } else {
    pileView.classList.add('hidden');
  }
  bookView.classList.remove('hidden');

  // Update back link
  if (currentSubPile) {
    var fv = document.getElementById(currentSubPile + '-view');
    var ft = fv && fv.querySelector('.section-title') ? fv.querySelector('.section-title').textContent : currentSubPile;
    setBackLink(ft, '#', function() { closeBook(); });
  } else {
    setBackLink('Art', '#', function() { closeBook(); });
  }

  // Load PDF and render pages into flip-through
  loadPdfAsBook(pdfUrl, pdfContainer, singlePage);
}

async function loadPdfAsBook(url, container, forceSingle) {
  try {
    var pdf = await pdfjsLib.getDocument(url).promise;
    var numPages = pdf.numPages;

    var pdfPages = new Array(numPages).fill(null);
    async function renderPage(idx) {
      if (pdfPages[idx]) return pdfPages[idx];
      var page = await pdf.getPage(idx + 1);
      var scale = window.innerWidth <= 700 ? 1 : 1.5;
      var viewport = page.getViewport({ scale: scale });
      var canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }).promise;
      pdfPages[idx] = canvas;
      return canvas;
    }

    // Render first page immediately
    await renderPage(0);

    // Build fullscreen viewer
    container.innerHTML = '';
    var viewer = document.createElement('div');
    viewer.className = 'pdf-reader';
    container.appendChild(viewer);

    var display = document.createElement('div');
    display.className = 'pdf-display';
    viewer.appendChild(display);

    // Click zones
    var zoneLeft = document.createElement('div');
    zoneLeft.className = 'pdf-zone pdf-zone-left';
    display.appendChild(zoneLeft);

    var zoneRight = document.createElement('div');
    zoneRight.className = 'pdf-zone pdf-zone-right';
    display.appendChild(zoneRight);

    // Page counter
    var counter = document.createElement('div');
    counter.className = 'pdf-counter';
    container.appendChild(counter);

    // Detect if pages are landscape (already double-page spreads)
    var firstCanvas = pdfPages[0];
    var isLandscape = firstCanvas.width > firstCanvas.height;
    var isMobile = window.innerWidth <= 700;

    // Build spreads
    var spreads = [];
    if (isLandscape || forceSingle || isMobile) {
      // Each PDF page is already a spread — show one at a time
      for (var s = 0; s < numPages; s++) {
        spreads.push([s]);
      }
    } else {
      // Portrait: page 0 alone (cover), then pairs [1,2], [3,4], etc.
      spreads.push([0]);
      for (var s = 1; s < numPages; s += 2) {
        if (s + 1 < numPages) {
          spreads.push([s, s + 1]);
        } else {
          spreads.push([s]);
        }
      }
    }

    var currentSpread = 0;

    function copyCanvas(source) {
      var copy = document.createElement('canvas');
      copy.width = source.width;
      copy.height = source.height;
      copy.getContext('2d').drawImage(source, 0, 0);
      return copy;
    }

    function buildSpreadEl(spread, canvases) {
      var spreadDiv = document.createElement('div');
      spreadDiv.className = spread.length === 1 ? 'pdf-spread pdf-spread-single' : 'pdf-spread';
      spreadDiv.appendChild(copyCanvas(canvases[0]));
      if (canvases.length === 2) {
        var spine = document.createElement('div');
        spine.className = 'pdf-spine';
        spreadDiv.appendChild(spine);
        spreadDiv.appendChild(copyCanvas(canvases[1]));
      }
      return spreadDiv;
    }

    async function loadSpreadCanvases(idx) {
      var spread = spreads[idx];
      var canvases = [];
      for (var i = 0; i < spread.length; i++) {
        canvases.push(await renderPage(spread[i]));
      }
      return canvases;
    }

    async function showSpread(idx, direction) {
      if (idx < 0 || idx >= spreads.length) return;

      var newCanvases = await loadSpreadCanvases(idx);

      // Preload neighbors
      if (idx + 1 < spreads.length) loadSpreadCanvases(idx + 1);
      if (idx - 1 >= 0) loadSpreadCanvases(idx - 1);

      display.querySelectorAll('.pdf-page-wrapper').forEach(function(w) { w.remove(); });
      var wrapper = document.createElement('div');
      wrapper.className = 'pdf-page-wrapper';
      wrapper.appendChild(buildSpreadEl(spreads[idx], newCanvases));
      display.insertBefore(wrapper, display.firstChild);

      currentSpread = idx;

      var spread = spreads[idx];
      var first = spread[0] + 1;
      var last = spread[spread.length - 1] + 1;
      counter.textContent = (first === last ? first : first + '-' + last) + ' / ' + numPages;
    }

    showSpread(0, null);

    zoneLeft.addEventListener('click', function(e) {
      e.stopPropagation();
      if (currentSpread > 0) showSpread(currentSpread - 1, 'prev');
    });

    zoneRight.addEventListener('click', function(e) {
      e.stopPropagation();
      if (currentSpread < spreads.length - 1) showSpread(currentSpread + 1, 'next');
    });

    container._keyHandler = function(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentSpread < spreads.length - 1) showSpread(currentSpread + 1, 'next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSpread > 0) showSpread(currentSpread - 1, 'prev');
      }
    };
    document.addEventListener('keydown', container._keyHandler);

    var startX = 0;
    container._touchStart = function(e) {
      startX = e.touches[0].clientX;
    };
    container._touchEnd = function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSpread < spreads.length - 1) showSpread(currentSpread + 1, 'next');
        else if (diff < 0 && currentSpread > 0) showSpread(currentSpread - 1, 'prev');
      }
    };
    display.addEventListener('touchstart', container._touchStart, { passive: true });
    display.addEventListener('touchend', container._touchEnd, { passive: true });

  } catch (err) {
    container.innerHTML = '<div class="book-loading">Erreur de chargement du PDF</div>';
    console.error(err);
  }
}

function closeBook() {
  closeLightbox();
  hideArtFiche();
  bookView.classList.add('hidden');

  // Clean up PDF
  if (isPdfMode) {
    if (pdfContainer._keyHandler) {
      document.removeEventListener('keydown', pdfContainer._keyHandler);
    }
    if (pdfContainer._touchStart) {
      var pdfDisplay = pdfContainer.querySelector('.pdf-display');
      if (pdfDisplay) {
        pdfDisplay.removeEventListener('touchstart', pdfContainer._touchStart);
        pdfDisplay.removeEventListener('touchend', pdfContainer._touchEnd);
      }
    }
    pdfContainer.innerHTML = '';
    pdfContainer.style.display = 'none';
    isPdfMode = false;
  }

  // Return to sub-pile or main pile
  if (currentSubPile) {
    var folderView = document.getElementById(currentSubPile + '-view');
    if (folderView) folderView.classList.remove('hidden');
    setBackLink('Art', '#', function() { closeFolder(); });
  } else {
    pileView.classList.remove('hidden');
    setBackLink('Accueil', '../', null);
  }
}

// Keyboard: Escape to close book
document.addEventListener('keydown', function(e) {
  if (bookView.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeBook();
});
