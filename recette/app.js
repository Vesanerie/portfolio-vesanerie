const CATS = ['Tout', ...new Set(recipes.map(r => r.cat))];
let current = 'Tout';
let query = '';

function totalCost(r) {
  return r.ingredients.reduce((s, ing) => s + (ing[2] || 0), 0);
}

function imgUrl(r) {
  // Photos Pexels haut de gamme hébergées en local (/recette/img/{id}.jpg).
  return 'img/' + r.id + '.jpg';
}

function renderFilters() {
  const el = document.getElementById('filters');
  el.innerHTML = CATS.map(c =>
    '<button class="filter-btn' + (c === current ? ' active' : '') + '" onclick="setFilter(\'' + c + '\')">' + c + '</button>'
  ).join('');
}

function setFilter(cat) {
  current = cat;
  renderFilters();
  renderGrid();
}

function renderGrid() {
  const filtered = recipes.filter(r => {
    const matchCat = current === 'Tout' || r.cat === current;
    const q = query.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const grid = document.getElementById('grid');
  if (!filtered.length) {
    grid.innerHTML = '<div class="no-results">Aucune recette trouvée.</div>';
    return;
  }

  grid.innerHTML = filtered.map(r => {
    const cost = totalCost(r).toFixed(2);
    return '<div class="card" onclick="openModal(' + r.id + ')">'
      + '<img class="card-img" src="' + imgUrl(r) + '" alt="' + r.name + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop\'">'
      + '<div class="card-body">'
      + '<div class="card-cat">' + r.cat + '</div>'
      + '<div class="card-name">' + r.name + '</div>'
      + '<div class="card-meta"><span>⏱ ' + r.time + '</span><span class="card-cost">~' + cost + ' €</span></div>'
      + '</div></div>';
  }).join('');
}

function openModal(id) {
  const r = recipes.find(x => x.id === id);
  if (!r) return;
  const cost = totalCost(r).toFixed(2);
  const ingList = r.ingredients.map(function(ing) {
    const name = ing[0], qty = ing[1], price = ing[2];
    return '<li><span>' + name + '</span><span class="qty">' + qty + '</span><span class="price">' + (price > 0 ? price.toFixed(2) + ' €' : 'gratuit') + '</span></li>';
  }).join('');

  const fallback = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop';
  document.getElementById('modal-body').innerHTML =
    '<img class="modal-img" src="' + imgUrl(r) + '" alt="' + r.name + '" onerror="this.src=\'' + fallback + '\'">'
    + '<div class="modal-body-inner">'
    + '<div class="modal-cat">' + r.cat + '</div>'
    + '<h2 class="modal-title">' + r.name + '</h2>'
    + '<p class="modal-desc">' + r.desc + '</p>'
    + '<p class="modal-time">Temps de préparation : <span>' + r.time + '</span></p>'
    + '<div class="section-title">🛒 Liste de courses</div>'
    + '<ul class="ingredient-list">' + ingList + '</ul>'
    + '<div class="total-cost"><span class="label">Coût estimé (tarif Paris)</span><span class="amount">~' + cost + ' €</span></div>'
    + '<div class="section-title">👨‍🍳 Préparation</div>'
    + '<div class="instructions">' + r.instructions + '</div>'
    + '</div>';

  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

document.getElementById('search').addEventListener('input', function(e) {
  query = e.target.value;
  renderGrid();
});

renderFilters();
renderGrid();
