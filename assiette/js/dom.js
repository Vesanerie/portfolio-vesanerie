/* dom.js - micro helpers DOM.
 * Tout le contenu dynamique est construit en noeuds reels, jamais en chaine HTML.
 * Consequence : aucune injection possible depuis un nom d'aliment saisi a la main.
 */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* el('div.carte', {onclick: fn}, 'texte', autreNoeud, ...) */
function el(spec, props, ...enfants) {
  const [tag, ...classes] = String(spec).split('.');
  const n = document.createElement(tag || 'div');
  if (classes.length) n.className = classes.join(' ');

  if (props && typeof props === 'object' && !(props instanceof Node) && !Array.isArray(props)) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k === 'text') n.textContent = v;
      else if (k in n && k !== 'list') n[k] = v;
      else n.setAttribute(k, v);
    }
  } else if (props != null) {
    enfants.unshift(props);
  }

  for (const c of enfants.flat()) {
    if (c == null || c === false) continue;
    n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return n;
}

/* Remplace le contenu d'un conteneur */
function poser(cible, ...enfants) {
  const n = typeof cible === 'string' ? $(cible) : cible;
  n.replaceChildren(...enfants.flat().filter((x) => x != null && x !== false));
  return n;
}
