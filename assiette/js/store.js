/* store.js
 * Persistance locale. Tout vit dans localStorage, aucun serveur, aucune donnee qui sort.
 * Cle unique : assiette.v1
 */

const CLE = 'assiette.v1';

const DEFAUT = {
  cibles: { ...METHODE.cibles },
  jours: {},        // "AAAA-MM-JJ" : voir jour() pour la forme complete
  perso: [],        // aliments ajoutes a la main
  recents: [],      // noms d'aliments, les plus recents d'abord
  debut: METHODE.depart.date,
  age: METHODE.depart.age,
  taille: {},       // "AAAA-MM-JJ" : { taille, hanches, poitrine, bras }
  qtes: {},         // nom d'aliment : derniere quantite utilisee (g)
  types: [],        // repas types : { nom, repas, items: [{nom, q}] }
};

let S = charger();

function charger() {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return structuredClone(DEFAUT);
    const d = JSON.parse(brut);
    return { ...structuredClone(DEFAUT), ...d };
  } catch (e) {
    console.warn('Donnees illisibles, on repart a zero', e);
    return structuredClone(DEFAUT);
  }
}

function sauver() {
  localStorage.setItem(CLE, JSON.stringify(S));
}

/* --- Dates --- */
function cleDate(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

function dateDepuisCle(c) {
  const [a, m, j] = c.split('-').map(Number);
  return new Date(a, m - 1, j);
}

function decalerJour(cle, n) {
  const d = dateDepuisCle(cle);
  d.setDate(d.getDate() + n);
  return cleDate(d);
}

function libelleDate(cle) {
  const auj = cleDate();
  if (cle === auj) return 'Aujourd\'hui';
  if (cle === decalerJour(auj, -1)) return 'Hier';
  const d = dateDepuisCle(cle);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* Numero de semaine du programme, 1 = premiere semaine */
function semaineProgramme(cle = cleDate()) {
  const d0 = dateDepuisCle(S.debut);
  const d1 = dateDepuisCle(cle);
  const jours = Math.floor((d1 - d0) / 86400000);
  return Math.max(1, Math.floor(jours / 7) + 1);
}

/* --- Acces au jour --- */
function jour(cle = cleDate()) {
  if (!S.jours[cle]) {
    S.jours[cle] = {
      repas: { matin: [], midi: [], collation: [], soir: [] },
      poids: null,
      sommeil: null,
      pas: null,
      seance: null,   // 'A' | 'B' | 'C' | null
      note: '',
      eau: 0,         // litres bus
      marches: 0,     // marches post-repas cochees
      ordre: false,   // ordre fibres > prot > lip > gluc respecte
    };
  }
  // migration douce si une cle manque
  const j = S.jours[cle];
  if (!j.repas) j.repas = { matin: [], midi: [], collation: [], soir: [] };
  for (const r of ['matin', 'midi', 'collation', 'soir']) {
    if (!Array.isArray(j.repas[r])) j.repas[r] = [];
  }
  return j;
}

/* --- Totaux --- */
function totauxRepas(liste) {
  return liste.reduce(
    (t, e) => ({
      kcal: t.kcal + e.kcal,
      prot: t.prot + e.prot,
      lip: t.lip + e.lip,
      gluc: t.gluc + e.gluc,
    }),
    { kcal: 0, prot: 0, lip: 0, gluc: 0 }
  );
}

function totauxJour(cle = cleDate()) {
  const j = jour(cle);
  const tout = [...j.repas.matin, ...j.repas.midi, ...j.repas.collation, ...j.repas.soir];
  return totauxRepas(tout);
}

/* --- Ajout / suppression d'entrees --- */
function ajouterEntree(cle, repas, aliment, grammes) {
  const f = grammes / 100;
  jour(cle).repas[repas].push({
    id: Math.random().toString(36).slice(2, 9),
    nom: aliment.n,
    q: Math.round(grammes * 10) / 10,
    kcal: Math.round(aliment.k * f),
    prot: Math.round(aliment.p * f * 10) / 10,
    lip: Math.round(aliment.l * f * 10) / 10,
    gluc: Math.round(aliment.g * f * 10) / 10,
  });
  noterRecent(aliment.n);
  S.qtes[aliment.n] = Math.round(grammes * 10) / 10;
  sauver();
}

/* Quantite proposee par defaut : la derniere utilisee, sinon l'unite pratique, sinon 100 g. */
function qteDefaut(aliment) {
  if (S.qtes[aliment.n]) return S.qtes[aliment.n];
  if (aliment.u && aliment.u.length) return aliment.u[0][1];
  return 100;
}

/* Repas devine a partir de l'heure. */
function repasDeLHeure(h = new Date().getHours()) {
  if (h < 11) return 'matin';
  if (h < 15) return 'midi';
  if (h < 19) return 'collation';
  return 'soir';
}

/* --- Repas types : enregistrer et rejouer --- */
function enregistrerType(nom, cle, repas) {
  const items = jour(cle).repas[repas].map((e) => ({ nom: e.nom, q: e.q }));
  if (!items.length) return false;
  S.types = S.types.filter((t) => t.nom !== nom);
  S.types.push({ nom, repas, items });
  sauver();
  return true;
}

function jouerType(type, cle, repas) {
  let n = 0;
  for (const it of type.items) {
    const a = catalogue().find((x) => x.n === it.nom);
    if (!a) continue;
    ajouterEntree(cle, repas, a, it.q);
    n++;
  }
  return n;
}

/* Recopie un repas d'un autre jour. */
function copierRepas(cleSource, cleCible, repas) {
  const src = (S.jours[cleSource] && S.jours[cleSource].repas[repas]) || [];
  let n = 0;
  for (const e of src) {
    const a = catalogue().find((x) => x.n === e.nom);
    if (!a) continue;
    ajouterEntree(cleCible, repas, a, e.q);
    n++;
  }
  return n;
}

/* Totaux d'une liste d'items {nom, q} sans les ajouter. */
function apercuType(type) {
  return type.items.reduce(
    (t, it) => {
      const a = catalogue().find((x) => x.n === it.nom);
      if (!a) return t;
      const f = it.q / 100;
      return {
        kcal: t.kcal + a.k * f,
        prot: t.prot + a.p * f,
        lip: t.lip + a.l * f,
        gluc: t.gluc + a.g * f,
      };
    },
    { kcal: 0, prot: 0, lip: 0, gluc: 0 }
  );
}

function supprimerEntree(cle, repas, id) {
  const j = jour(cle);
  j.repas[repas] = j.repas[repas].filter((e) => e.id !== id);
  sauver();
}

function noterRecent(nom) {
  S.recents = [nom, ...S.recents.filter((x) => x !== nom)].slice(0, 12);
}

/* --- Catalogue complet, base + perso --- */
function catalogue() {
  return [...S.perso.map((a) => ({ ...a, c: 'perso' })), ...ALIMENTS];
}

function chercher(q) {
  const t = normaliser(q);
  if (!t) return [];
  return catalogue()
    .filter((a) => normaliser(a.n).includes(t))
    .sort((a, b) => normaliser(a.n).indexOf(t) - normaliser(b.n).indexOf(t))
    .slice(0, 40);
}

function normaliser(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/* --- Suivi du poids --- */
function pesees() {
  return Object.entries(S.jours)
    .filter(([, j]) => typeof j.poids === 'number' && j.poids > 0)
    .map(([cle, j]) => ({ cle, poids: j.poids }))
    .sort((a, b) => (a.cle < b.cle ? -1 : 1));
}

/* Moyenne glissante sur les n derniers jours calendaires finissant a `fin` */
function moyenneGlissante(fin, n = 7) {
  const p = pesees();
  const debut = decalerJour(fin, -(n - 1));
  const dedans = p.filter((x) => x.cle >= debut && x.cle <= fin);
  if (dedans.length < 3) return null; // pas fiable en dessous de 3 pesees
  return dedans.reduce((s, x) => s + x.poids, 0) / dedans.length;
}

/* Nombre de semaines consecutives sans baisse reelle, en remontant depuis `cle`. */
function semainesPlates(cle = cleDate()) {
  let n = 0;
  for (let i = 0; i < 8; i++) {
    const fin = decalerJour(cle, -7 * i);
    const a = moyenneGlissante(fin, 7);
    const b = moyenneGlissante(decalerJour(fin, -7), 7);
    if (a == null || b == null) break;
    if (b - a > 0.1) break;   // ca a baisse cette semaine la, on arrete
    n++;
  }
  return n;
}

function bilanHebdo(cle = cleDate()) {
  const actuelle = moyenneGlissante(cle, 7);
  const precedente = moyenneGlissante(decalerJour(cle, -7), 7);
  return {
    actuelle,
    precedente,
    verdict: verdictHebdo(actuelle, precedente, semainesPlates(cle)),
  };
}

function dernierPoids() {
  const p = pesees();
  return p.length ? p[p.length - 1].poids : METHODE.depart.poids;
}

/* --- Seance suggeree : rotation A > B > C sur les seances deja faites --- */
function seanceSuggeree() {
  const faites = Object.entries(S.jours)
    .filter(([, j]) => j.seance)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1));
  if (!faites.length) return 'A';
  const derniere = faites[faites.length - 1][1].seance;
  const o = METHODE.seances.ordre;
  return o[(o.indexOf(derniere) + 1) % o.length];
}

/* --- Export / import --- */
function exporter() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `assiette-${cleDate()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importer(fichier, apres) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d.jours) throw new Error('format inattendu');
      S = { ...structuredClone(DEFAUT), ...d };
      sauver();
      apres(null);
    } catch (e) {
      apres(e);
    }
  };
  r.readAsText(fichier);
}
