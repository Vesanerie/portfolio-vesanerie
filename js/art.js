// ===== Art Portfolio — Pile + Book =====

var pileView = document.getElementById('pile-view');
var bookView = document.getElementById('book-view');
var backLink = document.getElementById('back-link');
var bookEl = document.getElementById('book');
var activePages = [];
var currentPage = 0;
var totalPages = 0;

// ===== Pile: click to open a book =====
document.querySelectorAll('.pile-book').forEach(function(card) {
  card.addEventListener('click', function() {
    openBook(card.getAttribute('data-book'));
  });
});

function openBook(bookId) {
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

function closeBook() {
  bookView.classList.add('hidden');
  pileView.classList.remove('hidden');

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
