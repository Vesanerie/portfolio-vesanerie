// ===== Art Portfolio — Pile + Book =====

var pileView = document.getElementById('pile-view');
var bookView = document.getElementById('book-view');
var backLink = document.getElementById('back-link');
var bookEl = document.getElementById('book');
var pdfContainer = document.getElementById('pdf-container');
var bookNav = document.querySelector('.book-nav');
var activePages = [];
var currentPage = 0;
var totalPages = 0;
var isPdfMode = false;

// PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

var carnetsView = document.getElementById('carnets-view');
var currentSubPile = null;

// ===== Pile: click to open a book or folder =====
document.querySelectorAll('.pile-book, .pile-phone').forEach(function(card) {
  card.addEventListener('click', function() {
    var folder = card.getAttribute('data-folder');
    if (folder) {
      openFolder(folder);
      return;
    }
    openBook(card.getAttribute('data-book'));
  });

  // Load PDF cover as card thumbnail
  var pdfUrl = card.getAttribute('data-pdf') || card.getAttribute('data-cover-pdf');
  if (pdfUrl) {
    loadPdfCover(pdfUrl, card);
  }
});

function openFolder(folderId) {
  var folderView = document.getElementById(folderId + '-view');
  if (!folderView) return;
  pileView.classList.add('hidden');
  folderView.classList.remove('hidden');
  currentSubPile = folderId;

  backLink.textContent = '\u2190 Pile';
  backLink.href = '#';
  backLink.onclick = function(e) {
    e.preventDefault();
    closeFolder();
  };
}

// TikTok scroll counter + arrows
var tiktokScroll = document.querySelector('.tiktok-scroll');
var tiktokCounter = document.getElementById('tiktok-counter');
var tiktokUp = document.getElementById('tiktok-up');
var tiktokDown = document.getElementById('tiktok-down');
if (tiktokScroll && tiktokCounter) {
  var tiktokTotal = tiktokScroll.querySelectorAll('.tiktok-embed-wrap').length;
  var itemH = 580;

  tiktokScroll.addEventListener('scroll', function() {
    var idx = Math.round(tiktokScroll.scrollTop / itemH);
    tiktokCounter.textContent = (idx + 1) + ' / ' + tiktokTotal;
  });

  tiktokUp.addEventListener('click', function() {
    var idx = Math.round(tiktokScroll.scrollTop / itemH);
    if (idx > 0) tiktokScroll.scrollTo({ top: (idx - 1) * itemH, behavior: 'smooth' });
  });

  tiktokDown.addEventListener('click', function() {
    var idx = Math.round(tiktokScroll.scrollTop / itemH);
    if (idx < tiktokTotal - 1) tiktokScroll.scrollTo({ top: (idx + 1) * itemH, behavior: 'smooth' });
  });
}

// Gallery lightbox
document.querySelectorAll('.gallery-item img').forEach(function(img) {
  img.addEventListener('click', function() {
    document.getElementById('lightbox-img').src = img.src;
    document.getElementById('lightbox').classList.add('open');
  });
});

function closeFolder() {
  if (currentSubPile) {
    var folderView = document.getElementById(currentSubPile + '-view');
    if (folderView) folderView.classList.add('hidden');
    currentSubPile = null;
  }
  pileView.classList.remove('hidden');
  backLink.textContent = '\u2190 Retour';
  backLink.href = '../';
  backLink.onclick = null;
}

async function loadPdfCover(url, card) {
  try {
    var pdf = await pdfjsLib.getDocument(url).promise;
    var page = await pdf.getPage(1);
    var viewport = page.getViewport({ scale: 0.5 });
    var canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
    card.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
    card.classList.add('has-cover');
  } catch (e) {}
}

function openBook(bookId) {
  // Check if this book has a PDF
  var card = document.querySelector('.pile-book[data-book="' + bookId + '"]');
  var pdfUrl = card ? card.getAttribute('data-pdf') : null;

  if (pdfUrl) {
    var singlePage = card.getAttribute('data-single') === 'true';
    openPdfBook(pdfUrl, singlePage);
    return;
  }

  // HTML book mode
  isPdfMode = false;
  pdfContainer.style.display = 'none';
  bookEl.style.display = '';
  bookNav.style.display = '';

  // Hide all book-pages, show the selected one
  document.querySelectorAll('.book-pages').forEach(function(bp) {
    bp.classList.remove('active');
  });
  var target = document.querySelector('.book-pages[data-book="' + bookId + '"]');
  if (!target) return;
  target.classList.add('active');

  // Reset all pages
  activePages = target.querySelectorAll('.page');
  totalPages = activePages.length;
  currentPage = 0;
  activePages.forEach(function(p) {
    p.classList.remove('flipped');
  });

  // Switch views
  pileView.classList.add('hidden');
  bookView.classList.remove('hidden');

  // Update back link to go to pile
  backLink.textContent = '\u2190 Pile';
  backLink.href = '#';
  backLink.onclick = function(e) {
    e.preventDefault();
    closeBook();
  };

  updateZIndex();
  updateNav();
}

function openPdfBook(pdfUrl, singlePage) {
  isPdfMode = true;
  bookEl.style.display = 'none';
  bookNav.style.display = 'none';
  pdfContainer.style.display = '';
  pdfContainer.style.width = '100%';
  pdfContainer.innerHTML = '<div class="book-loading">Chargement du PDF...</div>';

  // Switch views
  pileView.classList.add('hidden');
  bookView.classList.remove('hidden');

  // Update back link
  backLink.textContent = '\u2190 Pile';
  backLink.href = '#';
  backLink.onclick = function(e) {
    e.preventDefault();
    closeBook();
  };

  // Load PDF and render pages into flip-through
  loadPdfAsBook(pdfUrl, pdfContainer, singlePage);
}

async function loadPdfAsBook(url, container, forceSingle) {
  try {
    var pdf = await pdfjsLib.getDocument(url).promise;
    var numPages = pdf.numPages;

    var pdfPages = new Array(numPages).fill(null);
    var pdfCurrentPage = 0;

    async function renderPage(idx) {
      if (pdfPages[idx]) return pdfPages[idx];
      var page = await pdf.getPage(idx + 1);
      var scale = 1.5;
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

    // Build spreads
    var spreads = [];
    if (isLandscape || forceSingle) {
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
    var isAnimating = false;

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
      if (isAnimating) return;
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
    bookEl.style.display = '';
    bookNav.style.display = '';
    isPdfMode = false;
  }

  // Return to sub-pile or main pile
  if (currentSubPile) {
    var folderView = document.getElementById(currentSubPile + '-view');
    if (folderView) folderView.classList.remove('hidden');
    backLink.textContent = '\u2190 Pile';
    backLink.href = '#';
    backLink.onclick = function(e) {
      e.preventDefault();
      closeFolder();
    };
  } else {
    pileView.classList.remove('hidden');
    backLink.textContent = '\u2190 Retour';
    backLink.href = '../';
    backLink.onclick = null;
  }
}

// ===== Book: page flip =====
function updateNav() {
  document.getElementById('prev-btn').disabled = currentPage === 0;
  document.getElementById('next-btn').disabled = currentPage >= totalPages - 1;
  document.getElementById('nav-indicator').textContent = (currentPage + 1) + ' / ' + totalPages;
}

function updateZIndex() {
  activePages.forEach(function(page, i) {
    if (i < currentPage) {
      page.style.zIndex = i;
    } else {
      page.style.zIndex = totalPages - i;
    }
  });
}

function nextPage() {
  if (currentPage >= totalPages - 1) return;
  activePages[currentPage].classList.add('flipped');
  currentPage++;
  updateZIndex();
  updateNav();
}

function prevPage() {
  if (currentPage <= 0) return;
  currentPage--;
  activePages[currentPage].classList.remove('flipped');
  updateZIndex();
  updateNav();
}

// Click on book to flip forward
bookEl.addEventListener('click', function() {
  nextPage();
});

// Keyboard navigation (only when book is open)
document.addEventListener('keydown', function(e) {
  if (bookView.classList.contains('hidden')) return;
  if (isPdfMode) return;
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextPage();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevPage();
  } else if (e.key === 'Escape') {
    closeBook();
  }
});

// Swipe support
(function() {
  var startX = 0;
  bookEl.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  bookEl.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPage();
      else prevPage();
    }
  }, { passive: true });
})();
