// ===== App Data (placeholders) =====
const apps = [
  {
    icon: '\u{1F4BB}',
    name: 'PortfolioGen',
    desc: 'Générateur de sites portfolio statiques avec thème personnalisable et déploiement automatique.',
    tags: ['HTML/CSS', 'Node.js', 'CI/CD']
  },
  {
    icon: '\u{1F916}',
    name: 'ChatBot IA',
    desc: 'Assistant conversationnel propulsé par un LLM, avec mémoire contextuelle et interface minimaliste.',
    tags: ['Python', 'LLM', 'API']
  },
  {
    icon: '\u{1F4CA}',
    name: 'DataViz',
    desc: 'Dashboard interactif pour visualiser des jeux de données complexes en temps réel.',
    tags: ['D3.js', 'SVG', 'Data']
  },
  {
    icon: '\u{1F3A8}',
    name: 'PixelForge',
    desc: 'Outil de création de pixel art dans le navigateur avec export PNG et palette personnalisée.',
    tags: ['Canvas', 'JavaScript', 'Web App']
  },
  {
    icon: '\u{1F50C}',
    name: 'API Toolkit',
    desc: 'Collection d\'outils pour tester, documenter et monitorer des APIs REST et GraphQL.',
    tags: ['REST', 'GraphQL', 'Testing']
  },
  {
    icon: '\u{1F4C4}',
    name: 'DocParser',
    desc: 'Extracteur intelligent de données depuis des PDFs et documents scannés via OCR.',
    tags: ['OCR', 'Python', 'PDF']
  }
];

// ===== Modal Logic =====
const modal = document.getElementById('modal');

function openModal(index) {
  const app = apps[index];
  document.getElementById('modal-icon').textContent = app.icon;
  document.getElementById('modal-title').textContent = app.name;
  document.getElementById('modal-desc').textContent = app.desc;

  const tagsEl = document.getElementById('modal-tags');
  tagsEl.innerHTML = app.tags
    .map(function(t) { return '<span class="modal-tag">' + t + '</span>'; })
    .join('');

  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
}

modal.addEventListener('click', function(e) {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ===== Bind App Icons =====
document.querySelectorAll('.app-icon').forEach(function(btn) {
  btn.addEventListener('click', function() {
    openModal(parseInt(this.dataset.app));
  });
});
