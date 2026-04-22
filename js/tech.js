// ===== Bureau → Fiche → Site =====
var desktop = document.getElementById('desktop');
var siteView = document.getElementById('site-view');
var siteIframe = document.getElementById('site-iframe');
var siteUrl = document.getElementById('site-url');
var siteBack = document.getElementById('site-back');
var ficheView = document.getElementById('fiche-view');
var ficheBack = document.getElementById('fiche-back');

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
  }
};

// Ouvrir la fiche projet
document.querySelectorAll('.app-icon').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var url = this.dataset.url;
    var proj = projects[url];
    if (!proj) return;

    document.getElementById('fiche-name').textContent = proj.name;
    document.getElementById('fiche-desc').textContent = proj.desc;
    document.getElementById('fiche-stack').textContent = proj.stack;
    document.getElementById('fiche-year').textContent = proj.year;
    document.getElementById('fiche-type').textContent = proj.type;
    document.getElementById('fiche-demo').dataset.url = url;

    desktop.style.display = 'none';
    ficheView.classList.remove('hidden');
  });
});

// Lancer la demo depuis la fiche
document.getElementById('fiche-demo').addEventListener('click', function() {
  var url = this.dataset.url;
  siteIframe.src = url;
  siteUrl.textContent = url;
  ficheView.classList.add('hidden');
  siteView.classList.remove('hidden');
});

// Retour fiche → bureau
ficheBack.addEventListener('click', function() {
  ficheView.classList.add('hidden');
  desktop.style.display = '';
});

// Retour site → fiche
siteBack.addEventListener('click', function() {
  siteView.classList.add('hidden');
  siteIframe.src = '';
  ficheView.classList.remove('hidden');
});
