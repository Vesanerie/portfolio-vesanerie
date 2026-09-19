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

/* ----- js/tech.js ----- */
// ===== Bureau → Fiche → Site =====
var desktop = document.getElementById('desktop');
var siteView = document.getElementById('site-view');
var siteIframe = document.getElementById('site-iframe');
var siteUrl = document.getElementById('site-url');
var siteBack = document.getElementById('site-back');

var projects = {
  'https://gesturo.fr/': {
    name: 'Gesturo',
    desc: 'Plateforme de dessin assiste par IA. Generation de poses, croquis et modeles vivants. Application web multiplateforme destinee aux dessinateurs.',
    stack: 'React, Node.js, ComfyUI, ControlNet, LoRA',
    year: '2025',
    type: 'Application web'
  },
  'https://gesturo-imagegen.pages.dev/': {
    name: 'ImageGen',
    desc: 'Generateur d\'images par IA a partir de prompts texte. Interface simple pour creer des visuels rapidement.',
    stack: 'React, Cloudflare Pages, API IA',
    year: '2025',
    type: 'Outil web'
  },
  'https://gesturo.fr/Vidtojpeg/': {
    name: 'VidToJpeg',
    desc: 'Convertit une video en sequence d\'images JPEG. Extraction frame par frame, utile pour le stop-motion et l\'analyse de mouvement.',
    stack: 'JavaScript vanilla, Canvas API',
    year: '2025',
    type: 'Outil web'
  },
  'https://gesturo.fr/Pdfdecompil/': {
    name: 'PdfDecompil',
    desc: 'Decompose un PDF en images. Extrait chaque page en PNG haute qualite, directement dans le navigateur.',
    stack: 'JavaScript vanilla, PDF.js',
    year: '2025',
    type: 'Outil web'
  },
  'https://gesturo.fr/vectorio/': {
    name: 'Vectorio',
    desc: 'Convertit des images bitmap en fichiers vectoriels SVG. Vectorisation automatique pour le graphisme et l\'impression.',
    stack: 'JavaScript vanilla, Potrace',
    year: '2025',
    type: 'Outil web'
  },
  'monvpn': {
    name: 'MonVPN',
    desc: 'App desktop Electron pour se connecter a son propre serveur VPN WireGuard. Dashboard avec IP, latence, trafic temps reel, speed test. Zero logs, chiffrement ChaCha20-Poly1305.',
    stack: 'Electron, WireGuard, Python, Oracle Cloud',
    year: '2026',
    type: 'Application desktop'
  }
};

// Description au hover
var appDesc = document.getElementById('app-desc');
document.querySelectorAll('.app-icon').forEach(function(btn) {
  btn.addEventListener('mouseenter', function() {
    var key = this.dataset.url || (this.dataset.img ? this.querySelector('.app-icon-name').textContent.toLowerCase().replace(/\s/g, '') : null);
    var proj = projects[key];
    if (!proj) return;
    appDesc.textContent = proj.desc;
    appDesc.classList.add('visible');
  });
  btn.addEventListener('mouseleave', function() {
    appDesc.classList.remove('visible');
  });
});

var siteImg = document.getElementById('site-img');

// Clic sur icone → lance la demo ou affiche l'image dans l'ecran
document.querySelectorAll('.app-icon').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var imgSrc = this.dataset.img;
    if (imgSrc) {
      siteIframe.style.display = 'none';
      siteImg.src = imgSrc;
      siteImg.style.display = '';
      siteUrl.textContent = 'MonVPN';
      desktop.classList.add('hidden');
      siteView.classList.remove('hidden');
      return;
    }
    var url = this.dataset.url;
    if (!url) return;
    siteImg.style.display = 'none';
    siteIframe.style.display = '';
    siteIframe.src = url;
    siteUrl.textContent = url;
    desktop.classList.add('hidden');
    siteView.classList.remove('hidden');
  });
});

// Retour site → bureau
siteBack.addEventListener('click', function() {
  siteView.classList.add('hidden');
  siteIframe.src = '';
  siteIframe.style.display = '';
  siteImg.style.display = 'none';
  desktop.classList.remove('hidden');
});
