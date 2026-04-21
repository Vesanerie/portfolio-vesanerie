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

// ===== Pile: click to open a book =====
document.querySelectorAll('.pile-book').forEach(function(card) {
  card.addEventListener('click', function() {
    openBook(card.getAttribute('data-book'));
  });
});

function openBook(bookId) {
  // Check if this book has a PDF
  var card = document.querySelector('.pile-book[data-book="' + bookId + '"]');
  var pdfUrl = card ? card.getAttribute('data-pdf') : null;

  if (pdfUrl) {
    openPdfBook(pdfUrl);
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

function openPdfBook(pdfUrl) {
  isPdfMode = true;
  bookEl.style.display = 'none';
  bookNav.style.display = 'none';
  pdfContainer.style.display = '';
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
  loadPdfAsBook(pdfUrl, pdfContainer);
}

async function loadPdfAsBook(url, container) {
  try {
    var pdf = await pdfjsLib.getDocument(url).promise;
    var numPages = pdf.numPages;

    container.innerHTML = '';

    // Create book wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'pdf-book-wrapper';
    container.appendChild(wrapper);

    var pagesEl = document.createElement('div');
    pagesEl.className = 'pdf-book';
    wrapper.appendChild(pagesEl);

    var pdfPages = [];
    var pdfCurrentPage = 0;

    // Render pages
    for (var i = 1; i <= numPages; i++) {
      var page = await pdf.getPage(i);
      var scale = 1.5;
      var viewport = page.getViewport({ scale: scale });

      var canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }).promise;

      var pageDiv = document.createElement('div');
      pageDiv.className = 'pdf-page';
      if (i > 1) pageDiv.style.display = 'none';
      pageDiv.appendChild(canvas);
      pagesEl.appendChild(pageDiv);
      pdfPages.push(pageDiv);
    }

    // Show first page
    pdfPages[0].style.display = '';

    // Navigation
    var nav = document.createElement('div');
    nav.className = 'book-nav';
    nav.innerHTML =
      '<button class="nav-btn" id="pdf-prev">&#8592; Pr\u00e9c.</button>' +
      '<span class="nav-indicator" id="pdf-indicator">1 / ' + numPages + '</span>' +
      '<button class="nav-btn" id="pdf-next">Suiv. &#8594;</button>';
    container.appendChild(nav);

    var prevBtn = nav.querySelector('#pdf-prev');
    var nextBtn = nav.querySelector('#pdf-next');
    var indicator = nav.querySelector('#pdf-indicator');

    function showPdfPage(idx) {
      pdfPages[pdfCurrentPage].style.display = 'none';
      pdfCurrentPage = idx;
      pdfPages[pdfCurrentPage].style.display = '';
      indicator.textContent = (pdfCurrentPage + 1) + ' / ' + numPages;
      prevBtn.disabled = pdfCurrentPage === 0;
      nextBtn.disabled = pdfCurrentPage >= numPages - 1;
    }

    prevBtn.disabled = true;
    if (numPages <= 1) nextBtn.disabled = true;

    prevBtn.addEventListener('click', function() {
      if (pdfCurrentPage > 0) showPdfPage(pdfCurrentPage - 1);
    });
    nextBtn.addEventListener('click', function() {
      if (pdfCurrentPage < numPages - 1) showPdfPage(pdfCurrentPage + 1);
    });

    // Keyboard
    container._keyHandler = function(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (pdfCurrentPage < numPages - 1) showPdfPage(pdfCurrentPage + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (pdfCurrentPage > 0) showPdfPage(pdfCurrentPage - 1);
      }
    };
    document.addEventListener('keydown', container._keyHandler);

  } catch (err) {
    container.innerHTML = '<div class="book-loading">Erreur de chargement du PDF</div>';
    console.error(err);
  }
}

function closeBook() {
  bookView.classList.add('hidden');
  pileView.classList.remove('hidden');

  // Clean up PDF
  if (isPdfMode) {
    if (pdfContainer._keyHandler) {
      document.removeEventListener('keydown', pdfContainer._keyHandler);
    }
    pdfContainer.innerHTML = '';
    pdfContainer.style.display = 'none';
    bookEl.style.display = '';
    bookNav.style.display = '';
    isPdfMode = false;
  }

  // Restore back link
  backLink.textContent = '\u2190 Retour';
  backLink.href = '../';
  backLink.onclick = null;
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
