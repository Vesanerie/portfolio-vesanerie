const CATS = ['Tout', ...new Set(recipes.map(r => r.cat))];
let current = 'Tout';
let query = '';
let maxBudget = 0;
let maxTime = 0;
let sortBy = 'default';

// Sélection de la semaine, persistée en localStorage.
const STORE = 'recettes_selection';
let selection = new Set();
try { const a = JSON.parse(localStorage.getItem(STORE)); if (Array.isArray(a)) selection = new Set(a); } catch (e) {}

function saveSelection() { try { localStorage.setItem(STORE, JSON.stringify([...selection])); } catch (e) {} }
function selectedRecipes() { return recipes.filter(r => selection.has(r.id)); }

// Normalisation d'un ingrédient (minuscule + pluriel ignoré) pour comparer entre recettes.
function normIng(name) {
  let k = name.trim().toLowerCase();
  if (k.length > 3 && k.endsWith('s')) k = k.slice(0, -1);
  return k;
}
function ingSet(r) { return new Set(r.ingredients.map(i => normIng(i[0]))); }

// Recettes les plus proches d'une recette donnée (par ingrédients communs).
function similarRecipes(r, n) {
  const a = ingSet(r);
  return recipes.filter(x => x.id !== r.id)
    .map(x => ({ r: x, shared: [...ingSet(x)].filter(k => a.has(k)).length }))
    .filter(o => o.shared >= 2)
    .sort((p, q) => q.shared - p.shared || totalCost(p.r) - totalCost(q.r))
    .slice(0, n);
}

// Ingrédients déjà couverts par la sélection.
function basketIngredients() {
  const s = new Set();
  selectedRecipes().forEach(r => ingSet(r).forEach(k => s.add(k)));
  return s;
}

// Recettes à ajouter qui réutilisent les ingrédients déjà choisis (coût marginal).
function suggestions(n) {
  const basket = basketIngredients();
  if (!basket.size) return [];
  return recipes.filter(r => !selection.has(r.id))
    .map(r => {
      const shared = [...ingSet(r)].filter(k => basket.has(k)).length;
      const marginal = r.ingredients.reduce((s, ing) => s + (basket.has(normIng(ing[0])) ? 0 : (ing[2] || 0)), 0);
      return { r: r, shared: shared, marginal: marginal };
    })
    .filter(o => o.shared >= 2)
    .sort((a, b) => b.shared - a.shared || a.marginal - b.marginal)
    .slice(0, n);
}

function totalCost(r) {
  return r.ingredients.reduce((s, ing) => s + (ing[2] || 0), 0);
}

// "5 min" -> 5 · "1h" -> 60 · "1h15" -> 75 · "2h30" -> 150
function totalMinutes(r) {
  const t = r.time;
  if (t.indexOf('h') !== -1) {
    const m = t.match(/(\d+)h(\d*)/);
    return parseInt(m[1], 10) * 60 + (m[2] ? parseInt(m[2], 10) : 0);
  }
  const m = t.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
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
  let filtered = recipes.filter(r => {
    const matchCat = current === 'Tout' || r.cat === current;
    const q = query.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
    const matchBudget = !maxBudget || totalCost(r) <= maxBudget;
    const matchTime = !maxTime || totalMinutes(r) <= maxTime;
    return matchCat && matchQ && matchBudget && matchTime;
  });

  if (sortBy === 'price') {
    filtered = filtered.slice().sort((a, b) => totalCost(a) - totalCost(b));
  } else if (sortBy === 'time') {
    filtered = filtered.slice().sort((a, b) => totalMinutes(a) - totalMinutes(b));
  }

  const grid = document.getElementById('grid');
  if (!filtered.length) {
    grid.innerHTML = '<div class="no-results">Aucune recette trouvée.</div>';
    return;
  }

  grid.innerHTML = filtered.map(r => {
    const cost = totalCost(r).toFixed(2);
    const on = selection.has(r.id);
    return '<div class="card" onclick="openModal(' + r.id + ')">'
      + '<button class="add-btn' + (on ? ' added' : '') + '" data-id="' + r.id + '" onclick="event.stopPropagation();toggleSelect(' + r.id + ')" aria-label="' + (on ? 'Retirer de ma liste' : 'Ajouter à ma liste') + '">' + (on ? '✓' : '+') + '</button>'
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
    + '<button id="modal-add" class="modal-add' + (selection.has(r.id) ? ' added' : '') + '" data-id="' + r.id + '" onclick="toggleSelect(' + r.id + ')">' + (selection.has(r.id) ? '✓ Dans ma liste' : '+ Ajouter à ma liste') + '</button>'
    + '<div class="section-title">🛒 Liste de courses</div>'
    + '<ul class="ingredient-list">' + ingList + '</ul>'
    + '<div class="total-cost"><span class="label">Coût estimé (tarif Paris)</span><span class="amount">~' + cost + ' €</span></div>'
    + '<div class="section-title">👨‍🍳 Préparation</div>'
    + '<div class="instructions">' + r.instructions + '</div>'
    + similarHtml(r)
    + '</div>';

  document.getElementById('modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function similarHtml(r) {
  const sim = similarRecipes(r, 3);
  if (!sim.length) return '';
  const items = sim.map(o =>
    '<li onclick="openModal(' + o.r.id + ')">'
    + '<span class="sim-name">' + o.r.name + '</span>'
    + '<span class="sim-tag">' + o.shared + ' en commun</span>'
    + '</li>'
  ).join('');
  return '<div class="section-title">🔁 Avec les mêmes ingrédients</div>'
    + '<ul class="similar-list">' + items + '</ul>';
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ---------- Sélection de la semaine + liste de courses ---------- */

function toggleSelect(id) {
  if (selection.has(id)) selection.delete(id); else selection.add(id);
  saveSelection();
  updateCart();

  const on = selection.has(id);
  const cardBtn = document.querySelector('.add-btn[data-id="' + id + '"]');
  if (cardBtn) {
    cardBtn.classList.toggle('added', on);
    cardBtn.textContent = on ? '✓' : '+';
    cardBtn.setAttribute('aria-label', on ? 'Retirer de ma liste' : 'Ajouter à ma liste');
  }
  const modalBtn = document.getElementById('modal-add');
  if (modalBtn && parseInt(modalBtn.dataset.id, 10) === id) {
    modalBtn.classList.toggle('added', on);
    modalBtn.textContent = on ? '✓ Dans ma liste' : '+ Ajouter à ma liste';
  }
  if (!document.getElementById('sheet').classList.contains('hidden')) renderSheet();
}

function updateCart() {
  const bar = document.getElementById('cart-bar');
  const n = selection.size;
  if (n === 0) {
    bar.classList.add('hidden');
    if (!document.getElementById('sheet').classList.contains('hidden')) closeSheet();
    return;
  }
  const total = selectedRecipes().reduce((s, r) => s + totalCost(r), 0);
  document.getElementById('cart-summary').textContent =
    n + ' recette' + (n > 1 ? 's' : '') + ' · ~' + total.toFixed(2) + ' €';
  bar.classList.remove('hidden');
}

// Regroupe les ingrédients identiques de toutes les recettes choisies.
function buildShoppingList() {
  const map = new Map();
  selectedRecipes().forEach(r => {
    r.ingredients.forEach(ing => {
      const name = ing[0], qty = ing[1], price = ing[2] || 0;
      const key = name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, { name: name, qtys: [], price: 0 });
      const e = map.get(key);
      if (qty) e.qtys.push(qty);
      e.price += price;
    });
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

function renderSheet() {
  const sel = selectedRecipes();
  const body = document.getElementById('sheet-body');
  if (!sel.length) { body.innerHTML = ''; return; }

  const total = sel.reduce((s, r) => s + totalCost(r), 0);

  const recipesHtml = sel.map(r =>
    '<li class="sheet-recipe">'
    + '<span class="sr-name">' + r.name + '</span>'
    + '<span class="sr-cost">~' + totalCost(r).toFixed(2) + ' €</span>'
    + '<button class="sr-remove" onclick="toggleSelect(' + r.id + ')" aria-label="Retirer">×</button>'
    + '</li>'
  ).join('');

  const items = buildShoppingList();
  const listHtml = items.map(it =>
    '<li><span class="sl-name">' + it.name + '</span>'
    + '<span class="sl-qty">' + (it.qtys.join(' + ') || '') + '</span>'
    + '<span class="sl-price">' + (it.price > 0 ? it.price.toFixed(2) + ' €' : 'gratuit') + '</span></li>'
  ).join('');

  const sugg = suggestions(3);
  let suggHtml = '';
  if (sugg.length) {
    const sItems = sugg.map(o =>
      '<li class="sugg-item">'
      + '<div class="sugg-info"><span class="sugg-name">' + o.r.name + '</span>'
      + '<span class="sugg-meta">réutilise ' + o.shared + ' ingrédient' + (o.shared > 1 ? 's' : '') + ' · +' + o.marginal.toFixed(2) + ' €</span></div>'
      + '<button class="sugg-add" onclick="toggleSelect(' + o.r.id + ')" aria-label="Ajouter">+</button>'
      + '</li>'
    ).join('');
    suggHtml = '<div class="section-title">✨ Complète ta semaine</div>'
      + '<ul class="sugg-list">' + sItems + '</ul>';
  }

  body.innerHTML =
    '<ul class="sheet-recipes">' + recipesHtml + '</ul>'
    + '<div class="total-cost"><span class="label">Budget de la semaine (tarif Paris)</span><span class="amount">~' + total.toFixed(2) + ' €</span></div>'
    + '<div class="section-title">🛒 Liste de courses</div>'
    + '<ul class="ingredient-list">' + listHtml + '</ul>'
    + suggHtml
    + '<div class="sheet-actions">'
    + '<button class="btn-print" onclick="window.print()">🖨 Imprimer</button>'
    + '<button class="btn-clear" onclick="clearSelection()">Vider</button>'
    + '</div>';
}

function openSheet() {
  renderSheet();
  document.getElementById('sheet').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  document.getElementById('sheet').classList.add('hidden');
  document.body.style.overflow = '';
}

function clearSelection() {
  selection.clear();
  saveSelection();
  closeSheet();
  updateCart();
  renderGrid();
}

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeModal(); closeSheet(); } });

document.getElementById('search').addEventListener('input', function(e) {
  query = e.target.value;
  renderGrid();
});

document.getElementById('budget').addEventListener('change', function(e) {
  maxBudget = parseFloat(e.target.value);
  renderGrid();
});

document.getElementById('maxtime').addEventListener('change', function(e) {
  maxTime = parseInt(e.target.value, 10);
  renderGrid();
});

document.getElementById('sort').addEventListener('change', function(e) {
  sortBy = e.target.value;
  renderGrid();
});

renderFilters();
renderGrid();
updateCart();
