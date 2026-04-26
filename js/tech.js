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
