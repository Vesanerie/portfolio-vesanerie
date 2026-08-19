/* AffinityDB - interface de consultation des 100 lecons Affinity */

const THEMES = {
  interface:            { label: "Interface & calques",   color: "#8b6cf0" },
  vecteur:              { label: "Vecteur & tracés",      color: "#4ab8d8" },
  "formes-booleens":    { label: "Formes & booléens",     color: "#4ec98a" },
  typo:                 { label: "Typographie",           color: "#e8a33d" },
  pinceaux:             { label: "Pinceaux",              color: "#e87d9c" },
  "couleur-effets":     { label: "Couleur & effets",      color: "#d868d8" },
  "pixel-photo":        { label: "Pixel & photo",         color: "#6fb6e8" },
  "grilles-alignement": { label: "Grilles & alignement",  color: "#9ab84a" },
  export:               { label: "Export",                color: "#c98a5e" },
};
const LEVELS = { base: "base", inter: "inter", avance: "avancé" };
const THEME_ORDER = Object.keys(THEMES);

const state = {
  lessons: [],
  progress: {},          // { "71": { done: true, note: "..." } }
  view: "themes",
  query: "",
  levels: new Set(),
  themes: new Set(),
  closed: new Set(),
  transcripts: {},       // n -> texte (le paquet complet, chargé à la 1re recherche)
  indexed: false,
  hasApi: false,         // vrai en local avec server.py, faux en prod statique
  open: null,
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* tout le HTML injecté est construit ici et passe par esc() : pas de contenu distant */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const paint = (el, markup) => el.replaceChildren(document.createRange().createContextualFragment(markup));

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------- chargement ---------- */

const LOCAL_KEY = "affinitydb";

// server.py n'existe qu'en local ; en prod (statique O2Switch) tout vit dans
// localStorage, exactement comme /assiette. On ne sonde l'API qu'en local,
// sinon la console se remplit d'un 404 a chaque chargement.
const LOCAL_HOST = ["localhost", "127.0.0.1"].includes(location.hostname);

async function boot() {
  const [db, prog] = await Promise.all([
    fetch("lessons.json").then((r) => r.json()),
    LOCAL_HOST
      ? fetch("api/progress").then((r) => (r.ok ? r.json() : null)).catch(() => null)
      : Promise.resolve(null),
  ]);
  state.lessons = db.lessons;
  state.hasApi = prog !== null;
  state.progress = prog || JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
  buildSidebar();
  render();
  wire();
}

let saveTimer;
function save() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state.progress));
  if (!state.hasApi) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fetch("api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.progress),
    }).catch(() => {});
  }, 400);
}

const prog = (n) => state.progress[n] || {};
const isDone = (n) => !!prog(n).done;

/* les 100 transcripts tiennent dans un seul fichier : une requete au lieu de
   cent (O2Switch coupe au-dela, et ca evite de charger 500 Ko en 4G tant que
   personne ne cherche) */
let bundlePromise = null;
function loadTranscripts() {
  if (!bundlePromise) {
    bundlePromise = fetch("transcripts.json")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((b) => { state.transcripts = b; state.indexed = true; return b; });
  }
  return bundlePromise;
}

async function indexAll() {
  if (state.indexed) return;
  await loadTranscripts();
  if (state.query) render();
}

/* ---------- filtrage ---------- */

function haystack(l) {
  return norm([
    l.n, l.title_fr, l.title_en, l.tags.join(" "), l.resume,
    (l.steps || []).join(" "), l.piege,
    (l.ui || []).map((u) => `${u.fr} ${u.en}`).join(" "),
    state.transcripts[l.n] || "",
  ].join(" "));
}

function filtered() {
  const q = norm(state.query.trim());
  return state.lessons.filter((l) => {
    if (state.levels.size && !state.levels.has(l.level)) return false;
    if (state.themes.size && !state.themes.has(l.theme)) return false;
    if (state.view === "todo" && isDone(l.n)) return false;
    if (q && !haystack(l).includes(q)) return false;
    return true;
  });
}

/* ---------- rendu ---------- */

function buildSidebar() {
  paint($("#theme-list"), THEME_ORDER.map((k) => {
    const n = state.lessons.filter((l) => l.theme === k).length;
    return `<button data-theme="${k}">
      <span class="tdot" style="background:${THEMES[k].color}"></span>
      <span>${THEMES[k].label}</span><span class="tcount">${n}</span></button>`;
  }).join(""));
}

function card(l) {
  const done = isDone(l.n);
  const note = prog(l.n).note;
  return `<div class="card${done ? " done" : ""}" data-n="${l.n}">
    <div class="c-check" data-check="${l.n}">✓</div>
    <div class="c-body">
      <div class="c-title">${esc(l.title_fr || l.title_en)}</div>
      <div class="c-en">${esc(l.title_en)}</div>
      <div class="c-meta">
        <span class="c-num">L${l.n}</span>
        <span>${mmss(l.duration)}</span>
        <span class="lvl ${l.level}">${LEVELS[l.level]}</span>
      </div>
    </div>
    ${note ? '<span class="c-flag" title="tu as une note">✎</span>' : ""}
    ${l.resume ? "" : '<span class="no-card" title="fiche pas encore rédigée"></span>'}
  </div>`;
}

function groupBlock(key, items) {
  const done = items.filter((l) => isDone(l.n)).length;
  const pct = items.length ? (done / items.length) * 100 : 0;
  const t = THEMES[key] || { label: key, color: "#8b6cf0" };
  return `<div class="group${state.closed.has(key) ? " closed" : ""}" data-group="${key}">
    <div class="group-head">
      <span class="gdot" style="background:${t.color}"></span>
      <h3>${t.label}</h3>
      <div class="group-bar"><i style="width:${pct}%"></i></div>
      <span class="group-meta">${done}/${items.length}</span>
    </div>
    <div class="cards">${items.map(card).join("")}</div>
  </div>`;
}

function render() {
  const list = filtered();
  const box = $("#results");

  $("#search-count").textContent = state.query ? `${list.length} résultat${list.length > 1 ? "s" : ""}` : "";

  const done = state.lessons.filter((l) => isDone(l.n)).length;
  $("#pg-fill").style.width = `${(done / state.lessons.length) * 100}%`;
  $("#pg-label").textContent = `${done} / ${state.lessons.length}`;

  if (!list.length) {
    paint(box, `<p class="empty">${state.view === "todo" && !state.query ? "Tout est vu. Bien joué." : "Rien ne correspond."}</p>`);
    return;
  }

  if (state.view === "themes" && !state.query) {
    paint(box, THEME_ORDER
      .map((k) => [k, list.filter((l) => l.theme === k)])
      .filter(([, items]) => items.length)
      .map(([k, items]) => groupBlock(k, items))
      .join(""));
  } else {
    paint(box, `<div class="cards">${list.map(card).join("")}</div>`);
  }
}

/* ---------- fiche ---------- */

function highlight(text, q) {
  const safe = esc(text);
  if (!q) return safe;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return safe.replace(re, "<mark>$1</mark>");
}

async function openSheet(n) {
  const l = state.lessons.find((x) => x.n === n);
  if (!l) return;
  state.open = n;
  const p = prog(n);
  const t = THEMES[l.theme];
  const txt = l.has_transcript ? (await loadTranscripts())[n] || "" : "";

  const sec = (title, markup) => (markup ? `<div class="sh-sec"><h4>${title}</h4>${markup}</div>` : "");

  paint($("#sheet"), `
    <button class="sh-close" data-close>×</button>
    <div class="sh-num">LEÇON ${n}</div>
    <h2 class="sh-title">${esc(l.title_fr || l.title_en)}</h2>
    <div class="sh-en">${esc(l.title_en)}</div>
    <div class="sh-meta">
      <span style="color:${t.color}">${t.label}</span>
      <span>${LEVELS[l.level]}</span>
      <span>${mmss(l.duration)}</span>
      ${l.tags.map((x) => `<span>${esc(x)}</span>`).join("")}
    </div>

    <div class="sh-actions">
      <button class="primary${p.done ? " done" : ""}" data-toggle="${n}">${p.done ? "✓ vue" : "marquer comme vue"}</button>
      <a href="https://www.youtube.com/watch?v=${esc(l.id)}&list=PL_dhPga7ruucfyaDJq9hYQGPTNKkDcNBO" target="_blank" rel="noreferrer">ouvrir sur YouTube</a>
    </div>

    <div class="embed" data-embed="${esc(l.id)}">
      <div class="embed-ph"><b>▶</b><span>charger la vidéo</span></div>
    </div>

    ${l.resume ? "" : '<div class="sh-sec"><div class="piege">Fiche pas encore rédigée pour cette leçon. Le transcript brut est en bas.</div></div>'}
    ${sec("À quoi ça sert", l.resume ? `<p>${esc(l.resume)}</p>` : "")}
    ${sec("La manip", l.steps?.length ? `<ol>${l.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : "")}
    ${sec("Raccourcis", l.shortcuts?.length ? `<div class="kbds">${l.shortcuts.map((s) => `<div><b>${esc(s.k)}</b><span>${esc(s.d)}</span></div>`).join("")}</div>` : "")}
    ${sec("Piège", l.piege ? `<div class="piege">${esc(l.piege)}</div>` : "")}
    ${sec("Vocabulaire FR / EN", l.ui?.length ? `<div class="ui-terms">${l.ui.map((u) => `<div><b>${esc(u.fr)}</b> <span>= ${esc(u.en)}</span></div>`).join("")}</div>` : "")}
    ${sec("À enchaîner avec", l.related?.length ? `<div class="related">${l.related.map((r) => { const o = state.lessons.find((x) => x.n === r); return o ? `<button data-goto="${r}">L${r} · ${esc(o.title_fr || o.title_en)}</button>` : ""; }).join("")}</div>` : "")}

    ${sec("Ma note", `<textarea class="note-area" data-note="${n}" placeholder="ce que tu retiens, ton usage a toi...">${esc(p.note || "")}</textarea><div class="note-state" data-notestate></div>`)}

    ${txt ? `<details${state.query ? " open" : ""}><summary>Transcript brut (EN, sous-titres auto)</summary><div class="trans">${highlight(txt, state.query.trim())}</div></details>` : ""}
  `);
  $("#sheet").hidden = false;
  $("#backdrop").hidden = false;
  $("#sheet").scrollTop = 0;
}

function closeSheet() {
  state.open = null;
  $("#sheet").hidden = true;
  $("#backdrop").hidden = true;
}

function toggleDone(n) {
  const p = state.progress[n] || (state.progress[n] = {});
  p.done = !p.done;
  if (p.done) p.at = new Date().toISOString().slice(0, 10);
  else delete p.at;
  save();
  render();
  if (state.open === n) openSheet(n);
}

/* ---------- evenements ---------- */

function wire() {
  $("#search").addEventListener("input", (e) => {
    state.query = e.target.value;
    indexAll();
    render();
  });

  $("#views").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-view]");
    if (!b) return;
    state.view = b.dataset.view;
    $$("#views button").forEach((x) => x.classList.toggle("on", x === b));
    render();
  });

  $("#levels").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-level]");
    if (!b) return;
    if (state.levels.has(b.dataset.level)) state.levels.delete(b.dataset.level);
    else state.levels.add(b.dataset.level);
    b.classList.toggle("on");
    render();
  });

  $("#theme-list").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-theme]");
    if (!b) return;
    if (state.themes.has(b.dataset.theme)) state.themes.delete(b.dataset.theme);
    else state.themes.add(b.dataset.theme);
    b.classList.toggle("on");
    render();
  });

  $("#reset").addEventListener("click", () => {
    state.query = "";
    state.levels.clear();
    state.themes.clear();
    state.view = "themes";
    $("#search").value = "";
    $$(".chips button, .theme-list button").forEach((b) => b.classList.remove("on"));
    $$("#views button").forEach((x) => x.classList.toggle("on", x.dataset.view === "themes"));
    render();
  });

  $("#export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.progress, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "affinitydb-progression.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("#import").addEventListener("click", () => $("#import-file").click());

  $("#import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const incoming = JSON.parse(await file.text());
      // fusion : on ne perd pas ce qui est deja coche sur cet appareil
      for (const [k, v] of Object.entries(incoming)) {
        state.progress[k] = { ...(state.progress[k] || {}), ...v };
      }
      save();
      render();
      $("#io-hint").textContent = `${Object.keys(incoming).length} leçons fusionnées.`;
    } catch {
      $("#io-hint").textContent = "Fichier illisible.";
    }
    e.target.value = "";
  });

  $("#results").addEventListener("click", (e) => {
    const check = e.target.closest("[data-check]");
    if (check) { e.stopPropagation(); return toggleDone(+check.dataset.check); }
    const head = e.target.closest(".group-head");
    if (head) {
      const k = head.parentElement.dataset.group;
      if (state.closed.has(k)) state.closed.delete(k);
      else state.closed.add(k);
      return render();
    }
    const c = e.target.closest(".card");
    if (c) openSheet(+c.dataset.n);
  });

  $("#backdrop").addEventListener("click", closeSheet);

  $("#sheet").addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeSheet();
    const tg = e.target.closest("[data-toggle]");
    if (tg) return toggleDone(+tg.dataset.toggle);
    const go = e.target.closest("[data-goto]");
    if (go) return openSheet(+go.dataset.goto);
    const emb = e.target.closest("[data-embed]");
    if (emb && emb.querySelector(".embed-ph")) {
      paint(emb, `<iframe src="https://www.youtube-nocookie.com/embed/${esc(emb.dataset.embed)}?autoplay=1&rel=0"
        allow="accelerometer;autoplay;encrypted-media;picture-in-picture" allowfullscreen></iframe>`);
    }
  });

  $("#sheet").addEventListener("input", (e) => {
    const ta = e.target.closest("[data-note]");
    if (!ta) return;
    const n = +ta.dataset.note;
    const p = state.progress[n] || (state.progress[n] = {});
    p.note = ta.value;
    if (!p.note) delete p.note;
    save();
    const st = $("[data-notestate]", $("#sheet"));
    if (st) { st.textContent = "enregistré"; setTimeout(() => (st.textContent = ""), 1200); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return closeSheet();
    const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
    if (e.key === "/" && !typing) {
      e.preventDefault();
      $("#search").focus();
    }
  });
}

boot();
