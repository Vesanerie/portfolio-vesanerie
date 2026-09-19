/* ============================================================
   FICHIER GENERE PAR build-js.py, NE PAS EDITER A LA MAIN.
   Editer les sources puis relancer : python3 build-js.py
   Genere le 2026-09-19 19:33
   ============================================================ */

/* ----- js/main.js (hors IIFE : fonctions appelees en inline) ----- */
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

(function(){
"use strict";

/* ----- js/art/state.js ----- */
// ===== Shared state & DOM refs =====

const dom = {
  pileView: document.getElementById('pile-view'),
  bookView: document.getElementById('book-view'),
  backLink: document.getElementById('back-link'),
  pdfContainer: document.getElementById('pdf-container')
};

const state = {
  isPdfMode: false,
  historyDepth: 0,
  poppingState: false,
  skipPopstate: 0,
  closing: false,
  currentSubPile: null,
  folderHistory: []
};

function setBackLink(label, href, onclick) {
  dom.backLink.textContent = '\u2190 ' + label;
  dom.backLink.href = href || '#';
  dom.backLink.onclick = onclick ? function(e) { e.preventDefault(); onclick(); } : null;
}

/* ----- js/art/fiche.js ----- */
// ===== Fiches projet art =====

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
  if (!info) return false;
  artFicheTitle.textContent = title;
  artFicheFormat.textContent = info.format;
  artFicheDate.textContent = info.date;
  artFicheIntent.textContent = info.intent;
  artFiche.classList.add('open');
  return true;
}

function hideArtFiche() {
  artFiche.classList.remove('open');
}

/* ----- js/art/lightbox.js ----- */
// ===== Gallery lightbox =====

var galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
var lightboxIdx = 0;
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightbox-img');

function showLightbox(idx) {
  if (idx < 0 || idx >= galleryImages.length) return;
  lightboxIdx = idx;
  lightboxImg.src = galleryImages[idx].src;
  lightboxImg.alt = galleryImages[idx].alt;
  lightbox.classList.add('open');
  lightbox.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
}

function showInLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.classList.add('open');
  lightbox.focus();
}

// Click handlers on gallery images
galleryImages.forEach(function(img, i) {
  img.addEventListener('click', function() { showLightbox(i); });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (lightboxIdx < galleryImages.length - 1) showLightbox(lightboxIdx + 1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (lightboxIdx > 0) showLightbox(lightboxIdx - 1);
  } else if (e.key === 'Escape') {
    closeLightbox();
  }
});

// Close on click overlay
lightbox.addEventListener('click', function(e) {
  if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
});

/* ----- js/art/pdf-viewer.js ----- */
// ===== PDF Book Viewer =====

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
    viewer.setAttribute('role', 'document');
    viewer.setAttribute('aria-label', 'Lecteur PDF');
    container.appendChild(viewer);

    var display = document.createElement('div');
    display.className = 'pdf-display';
    viewer.appendChild(display);

    // Click zones
    var zoneLeft = document.createElement('div');
    zoneLeft.className = 'pdf-zone pdf-zone-left';
    zoneLeft.setAttribute('role', 'button');
    zoneLeft.setAttribute('aria-label', 'Page precedente');
    display.appendChild(zoneLeft);

    var zoneRight = document.createElement('div');
    zoneRight.className = 'pdf-zone pdf-zone-right';
    zoneRight.setAttribute('role', 'button');
    zoneRight.setAttribute('aria-label', 'Page suivante');
    display.appendChild(zoneRight);

    // Page counter
    var counter = document.createElement('div');
    counter.className = 'pdf-counter';
    counter.setAttribute('aria-live', 'polite');
    container.appendChild(counter);

    // Detect if pages are landscape (already double-page spreads)
    var firstCanvas = pdfPages[0];
    var isLandscape = firstCanvas.width > firstCanvas.height;
    var isMobile = window.innerWidth <= 700;

    // Build spreads
    var spreads = [];
    if (isLandscape || forceSingle || isMobile) {
      for (var s = 0; s < numPages; s++) {
        spreads.push([s]);
      }
    } else {
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

    async function showSpread(idx) {
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

    showSpread(0);

    zoneLeft.addEventListener('click', function(e) {
      e.stopPropagation();
      if (currentSpread > 0) showSpread(currentSpread - 1);
    });

    zoneRight.addEventListener('click', function(e) {
      e.stopPropagation();
      if (currentSpread < spreads.length - 1) showSpread(currentSpread + 1);
    });

    container._keyHandler = function(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentSpread < spreads.length - 1) showSpread(currentSpread + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSpread > 0) showSpread(currentSpread - 1);
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
        if (diff > 0 && currentSpread < spreads.length - 1) showSpread(currentSpread + 1);
        else if (diff < 0 && currentSpread > 0) showSpread(currentSpread - 1);
      }
    };
    display.addEventListener('touchstart', container._touchStart, { passive: true });
    display.addEventListener('touchend', container._touchEnd, { passive: true });

  } catch (err) {
    container.innerHTML = '<div class="book-loading">Erreur de chargement du PDF</div>';
    console.error(err);
  }
}

/* ----- js/art/cinema.js ----- */
// ===== Cinema mode (Animation) — MP4 only =====

var cinemaScreen = document.querySelector('.cinema-screen');
var cinemaLabel = document.getElementById('cinema-label');
var cinemaPlaceholder = document.getElementById('cinema-placeholder');
var cinemaThumbs = document.querySelectorAll('.cinema-thumb');
var cinemaCounter = document.querySelector('.cinema-counter');

function cinemaPlayVideo(src) {
  if (!cinemaScreen) return;
  var video = document.createElement('video');
  video.src = src;
  video.controls = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  cinemaScreen.innerHTML = '';
  cinemaScreen.appendChild(video);
}

function cinemaSelect(index) {
  var thumb = cinemaThumbs[index];
  if (!thumb) return;
  cinemaThumbs.forEach(function(t) { t.classList.remove('active'); });
  thumb.classList.add('active');
  cinemaLabel.textContent = thumb.dataset.label;
  if (cinemaCounter) cinemaCounter.textContent = (index + 1) + ' / ' + cinemaThumbs.length;
  thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  if (thumb.dataset.video) cinemaPlayVideo(thumb.dataset.video);
}

function cinemaActiveIndex() {
  var active = document.querySelector('.cinema-thumb.active');
  return Array.prototype.indexOf.call(cinemaThumbs, active);
}

// Placeholder click — play first video
if (cinemaPlaceholder) {
  cinemaPlaceholder.addEventListener('click', function() {
    var activeThumb = document.querySelector('.cinema-thumb.active');
    if (activeThumb && activeThumb.dataset.video) {
      cinemaPlayVideo(activeThumb.dataset.video);
    }
  });
}

// Thumb click handlers
cinemaThumbs.forEach(function(thumb, i) {
  thumb.addEventListener('click', function() { cinemaSelect(i); });
});

// Arrow navigation
var arrowLeft = document.querySelector('.cinema-arrow-left');
var arrowRight = document.querySelector('.cinema-arrow-right');
if (arrowLeft) arrowLeft.addEventListener('click', function() {
  var i = cinemaActiveIndex();
  cinemaSelect(i > 0 ? i - 1 : cinemaThumbs.length - 1);
});
if (arrowRight) arrowRight.addEventListener('click', function() {
  var i = cinemaActiveIndex();
  cinemaSelect(i < cinemaThumbs.length - 1 ? i + 1 : 0);
});

// Keyboard navigation when cinema is visible
document.addEventListener('keydown', function(e) {
  var animView = document.getElementById('animation-view');
  if (!animView || animView.classList.contains('hidden')) return;
  var idx = cinemaActiveIndex();
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    cinemaSelect(idx < cinemaThumbs.length - 1 ? idx + 1 : 0);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    cinemaSelect(idx > 0 ? idx - 1 : cinemaThumbs.length - 1);
  }
});

/* ----- js/art/tiktok.js ----- */
// ===== TikTok infinite scroll + arrows =====

var tiktokScroll = document.querySelector('.tiktok-scroll');
var tiktokCounter = document.getElementById('tiktok-counter');
var tiktokUp = document.getElementById('tiktok-up');
var tiktokDown = document.getElementById('tiktok-down');

if (tiktokScroll && tiktokCounter) {
  var originalWraps = Array.from(tiktokScroll.querySelectorAll('.tiktok-embed-wrap'));
  var tiktokTotal = originalWraps.length;
  function getItemH() { return tiktokScroll.querySelector('.tiktok-embed-wrap') ? tiktokScroll.querySelector('.tiktok-embed-wrap').offsetHeight : 580; }
  var itemH = getItemH();
  window.addEventListener('resize', function() { itemH = getItemH(); });
  var currentTiktok = 0;

  function getCurrentIndex() {
    return Math.round(tiktokScroll.scrollTop / itemH);
  }

  function getDisplayIndex(idx) {
    return ((idx % tiktokTotal) + tiktokTotal) % tiktokTotal;
  }

  function ensureWraps() {
    var allWraps = tiktokScroll.querySelectorAll('.tiktok-embed-wrap');
    var idx = getCurrentIndex();
    var needed = idx + 4;
    if (allWraps.length < needed) {
      for (var i = allWraps.length; i < needed; i++) {
        var srcIdx = i % tiktokTotal;
        var clone = originalWraps[srcIdx].cloneNode(true);
        var video = clone.querySelector('video');
        if (video) {
          video.removeAttribute('src');
          video.pause();
        }
        tiktokScroll.appendChild(clone);
      }
    }
  }

  function playCurrentVideo() {
    var allWraps = tiktokScroll.querySelectorAll('.tiktok-embed-wrap');
    var idx = getCurrentIndex();
    allWraps.forEach(function(wrap, i) {
      var video = wrap.querySelector('video');
      if (!video) return;
      if (i === idx) {
        if (!video.src && video.dataset.src) video.src = video.dataset.src;
        video.muted = false;
        video.play().catch(function(){});
      } else {
        video.muted = true;
        video.pause();
      }
    });
  }

  var tiktokScrollTimer = null;
  tiktokScroll.addEventListener('scroll', function() {
    if (tiktokScrollTimer) return;
    tiktokScrollTimer = setTimeout(function() {
      tiktokScrollTimer = null;
      var idx = getCurrentIndex();
      var display = getDisplayIndex(idx);
      tiktokCounter.textContent = (display + 1) + ' / ' + tiktokTotal;
      ensureWraps();
      if (idx !== currentTiktok) {
        currentTiktok = idx;
        playCurrentVideo();
      }
    }, 100);
  }, { passive: true });

  tiktokUp.addEventListener('click', function() {
    itemH = getItemH();
    var idx = getCurrentIndex();
    if (idx > 0) tiktokScroll.scrollTo({ top: (idx - 1) * itemH, behavior: 'smooth' });
  });

  tiktokDown.addEventListener('click', function() {
    itemH = getItemH();
    var idx = getCurrentIndex();
    ensureWraps();
    tiktokScroll.scrollTo({ top: (idx + 1) * itemH, behavior: 'smooth' });
  });
}

/* ----- js/art/tilt.js ----- */
// ===== 3D tilt on pile items (desktop only) =====

if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.pile-book, .pile-phone, .pile-folder, .pile-film').forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'none';
    });
    card.addEventListener('mousemove', function(e) {
      var rect = this.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var rotY = (x - 0.5) * 16;
      var rotX = (0.5 - y) * 16;
      this.style.transform = 'rotate(0deg) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(8px)';
      this.style.setProperty('--mx', (x * 100) + '%');
      this.style.setProperty('--my', (y * 100) + '%');
    });
    card.addEventListener('mouseleave', function() {
      this.style.transition = '';
      this.style.transform = '';
    });
  });
}

// ===== Scroll reveal on pile items =====
(function() {
  var items = document.querySelectorAll('#pile-stack > *');
  if (!items.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var idx = Array.prototype.indexOf.call(items, entry.target);
        entry.target.style.transitionDelay = (idx * 0.08) + 's';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(function(el) {
    el.classList.add('pile-reveal');
    observer.observe(el);
  });
})();

/* ----- js/art.js ----- */
// ===== Art Portfolio — Entry Point =====







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
  var firstVideo = true;
  view.querySelectorAll('video').forEach(function(v) {
    if (firstVideo) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      v.muted = false;
      v.play().catch(function(){});
      firstVideo = false;
    } else {
      v.muted = true;
    }
  });
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

  var backLabel = 'Art';
  if (state.folderHistory.length > 0) {
    var parentId = state.folderHistory[state.folderHistory.length - 1];
    var parentView = document.getElementById(parentId + '-view');
    if (parentView) {
      var parentTitle = parentView.querySelector('.pile-title');
      if (parentTitle) backLabel = parentTitle.textContent;
    }
  }
  setBackLink(backLabel, '#', function() { closeFolder(); });
  history.pushState({view: 'folder', id: folderId}, '');
  state.historyDepth++;
}

function closeFolder() {
  if (state.closing) return;
  state.closing = true;
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
    // Back label = parent du parent, ou "Art" si on est au 1er niveau
    var backLabel = 'Art';
    if (state.folderHistory.length > 0) {
      var gpId = state.folderHistory[state.folderHistory.length - 1];
      var gpView = document.getElementById(gpId + '-view');
      if (gpView) {
        var gpTitle = gpView.querySelector('.pile-title');
        if (gpTitle) backLabel = gpTitle.textContent;
      }
    }
    setBackLink(backLabel, '#', function() { closeFolder(); });
  } else {
    state.currentSubPile = null;
    dom.pileView.classList.remove('hidden');
    setBackLink('Accueil', '../', null);
  }
  if (!state.poppingState && state.historyDepth > 0) {
    state.historyDepth--;
    state.skipPopstate++;
    history.back();
    // Sécurité : si le popstate ne se déclenche pas (ex: iOS Safari gesture), reset après 200ms
    setTimeout(function() { if (state.skipPopstate > 0) state.skipPopstate = 0; }, 200);
  }
  setTimeout(function() { state.closing = false; }, 100);
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
  if (state.closing) return;
  state.closing = true;
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
    var backLabel = 'Art';
    if (state.folderHistory.length > 0) {
      var gpId = state.folderHistory[state.folderHistory.length - 1];
      var gpView = document.getElementById(gpId + '-view');
      if (gpView) {
        var gpTitle = gpView.querySelector('.pile-title');
        if (gpTitle) backLabel = gpTitle.textContent;
      }
    }
    setBackLink(backLabel, '#', function() { closeFolder(); });
  } else {
    dom.pileView.classList.remove('hidden');
    setBackLink('Accueil', '../', null);
  }
  if (!state.poppingState && state.historyDepth > 0) {
    state.historyDepth--;
    state.skipPopstate++;
    history.back();
    setTimeout(function() { if (state.skipPopstate > 0) state.skipPopstate = 0; }, 200);
  }
  setTimeout(function() { state.closing = false; }, 100);
}

// Escape to close book
document.addEventListener('keydown', function(e) {
  if (dom.bookView.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeBook();
});

// ===== Browser back button =====
window.addEventListener('popstate', function() {
  // Skip popstate events triggered by our own history.back() calls
  if (state.skipPopstate > 0) {
    state.skipPopstate--;
    return;
  }
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

})();
