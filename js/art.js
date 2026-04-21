// ===== Book Page Flip =====
const pages = document.querySelectorAll('.page');
const totalPages = pages.length;
let currentPage = 0;

function updateNav() {
  document.getElementById('prev-btn').disabled = currentPage === 0;
  document.getElementById('next-btn').disabled = currentPage === totalPages - 1;
  document.getElementById('nav-indicator').textContent = (currentPage + 1) + ' / ' + totalPages;
}

function updateZIndex() {
  pages.forEach(function(page, i) {
    if (i < currentPage) {
      page.style.zIndex = i;
    } else {
      page.style.zIndex = totalPages - i;
    }
  });
}

function nextPage() {
  if (currentPage >= totalPages - 1) return;
  pages[currentPage].classList.add('flipped');
  currentPage++;
  updateZIndex();
  updateNav();
}

function prevPage() {
  if (currentPage <= 0) return;
  currentPage--;
  pages[currentPage].classList.remove('flipped');
  updateZIndex();
  updateNav();
}

// Click on page to flip forward
document.getElementById('book').addEventListener('click', function(e) {
  if (e.target.closest('.nav-btn')) return;
  nextPage();
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextPage();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevPage();
  }
});

// Swipe support for mobile
(function() {
  var startX = 0;
  var book = document.getElementById('book');

  book.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });

  book.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPage();
      else prevPage();
    }
  }, { passive: true });
})();

// Init
updateZIndex();
updateNav();
