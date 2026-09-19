/* ============================================================
   FICHIER GENERE PAR build-js.py, NE PAS EDITER A LA MAIN.
   Editer les sources puis relancer : python3 build-js.py
   Genere le 2026-09-19 19:33
   ============================================================ */

/* ----- js/main.js ----- */
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
  document.body.classList.add('theme-switching');
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeColor(next);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      document.body.classList.remove('theme-switching');
    });
  });
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

// ===== Panneau des liens du site =====
(function() {
  var btn = document.getElementById('liens-btn');
  var box = document.getElementById('liens-box');
  if (!btn || !box) return;

  function ferme() {
    box.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var ouvert = box.classList.toggle('open');
    btn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });

  // clic en dehors : on referme
  document.addEventListener('click', function(e) {
    if (box.classList.contains('open') && !box.contains(e.target) && e.target !== btn) ferme();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') ferme();
  });
})();

/* ----- js/music.js ----- */
// ===== iPod Music Player =====
var audio = document.getElementById('audio-player');
var tracks = document.querySelectorAll('.ipod-track');
var nowPlaying = document.getElementById('now-playing');
var progressBar = document.getElementById('progress-bar');
var timeCurrent = document.getElementById('time-current');
var timeTotal = document.getElementById('time-total');
var playBtn = document.getElementById('play-btn');
var currentTrack = null;

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

tracks.forEach(function(track) {
  track.addEventListener('click', function() {
    var src = track.getAttribute('data-src');
    var title = track.getAttribute('data-title');

    // Deselect all
    tracks.forEach(function(t) { t.classList.remove('active'); });
    track.classList.add('active');

    // Load and play
    audio.src = src;
    audio.play();
    nowPlaying.textContent = title;
    currentTrack = track;
  });
});

// Play/Pause button (center of wheel)
playBtn.addEventListener('click', function() {
  if (!audio.src || !currentTrack) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

// Update progress
audio.addEventListener('timeupdate', function() {
  if (audio.duration) {
    var pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + '%';
    timeCurrent.textContent = formatTime(audio.currentTime);
  }
});

audio.addEventListener('loadedmetadata', function() {
  timeTotal.textContent = formatTime(audio.duration);
});

// Auto-play next track
audio.addEventListener('ended', function() {
  if (!currentTrack) return;
  var next = currentTrack.nextElementSibling;
  if (next && next.classList.contains('ipod-track')) {
    next.click();
  } else {
    nowPlaying.textContent = 'Fin de la playlist';
    tracks.forEach(function(t) { t.classList.remove('active'); });
    progressBar.style.width = '0%';
    currentTrack = null;
  }
});
