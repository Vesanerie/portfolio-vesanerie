// ===== Service Worker =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function() {});
}

// ===== Theme Toggle =====
function updateThemeColor(theme) {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e0e0e' : '#f0ece4');
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const theme = saved || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeColor(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeColor(next);
}

// Init on load
initTheme();

// ===== Scroll to Top =====
(function() {
  var btn = document.getElementById('scroll-top');
  if (!btn) return;
  var scrollTimer = null;
  window.addEventListener('scroll', function() {
    if (scrollTimer) return;
    scrollTimer = setTimeout(function() {
      scrollTimer = null;
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, 100);
  }, { passive: true });
})();

// ===== Close cards on outside tap =====
(function() {
  document.addEventListener('click', function(e) {
    // Contact card
    var contact = document.getElementById('contact-card');
    if (contact && contact.classList.contains('open') && !contact.contains(e.target) && !e.target.classList.contains('landing-cta')) {
      contact.classList.remove('open');
    }
    // Tools card
    var tools = document.querySelector('.tools-card');
    if (tools && tools.classList.contains('open') && !tools.contains(e.target)) {
      tools.classList.remove('open');
    }
  });
})();

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Close CV overlay
    var cv = document.getElementById('cv-overlay');
    if (cv && cv.classList.contains('open')) { cv.classList.remove('open'); return; }
    // Close contact card
    var contact = document.getElementById('contact-card');
    if (contact && contact.classList.contains('open')) { contact.classList.remove('open'); return; }
    // Close tools card
    var tools = document.querySelector('.tools-card.open');
    if (tools) { tools.classList.remove('open'); return; }
  }
});
