/* Assiette - fichier genere par build.sh, ne pas editer a la main.
   Source : js/dom.js js/methode.js js/aliments.js js/store.js js/app.js */

/* ===== js/dom.js ===== */
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

/* ===== js/methode.js ===== */
/* methode.js
 * La methode Roba, adaptee a Valentin.
 * Synthese des 16 videos de la chaine @RobaQuest (transcriptions analysees le 2026-08-08).
 * Tout ce qui est "le plan" vit ici. Un seul endroit a modifier si le plan bouge.
 */

const METHODE = {
  // --- Point de depart ---
  depart: {
    poids: 100,
    date: '2026-08-08',
    age: 35,        // sert au calcul de la zone 2 (modifiable dans Reglages)
  },

  /* --- Cibles nutritionnelles ---
   * Maintenance estimee ~2550 kcal. Roba insiste : deficit de 10 a 15 % MAXIMUM.
   * 2200 kcal = 14 % de deficit. Volontairement moins agressif que les 2100 initiaux :
   * un deficit trop creuse fait perdre du muscle et casse la jauge.
   */
  cibles: {
    kcal: 2200,
    prot: 175,   // ~1.75 g/kg, sous les 2 g/kg de la video (poids avec beaucoup de gras)
    lip: 65,     // sa fourchette : 50 a 70 g
    gluc: 220,   // tout le reste, garde haut expres
  },

  deficit: { min: 0.10, max: 0.15 },  // part du maintien

  /* --- Regles d'ajustement hebdo ---
   * Point cle appris des videos : quand ca stagne, il a AUGMENTE sa depense
   * plutot que baisser son alimentation. Il est reste a 2000 kcal pendant 18 mois.
   * Donc l'ordre est : plus de pas > plus de seances > et seulement en dernier, -150 kcal.
   */
  ajustement: {
    cibleMin: 0.5,
    cibleMax: 0.8,
    plafond: 1.0,
    pas: 150,
    semainesStagnation: 2,
    ordre: ['pas', 'seance', 'calories'],
  },

  // --- Sommeil : dicte si le deficit prend sur le gras ou sur le muscle ---
  sommeil: {
    cible: 7.5,
    alerte: 6.5,
    // Etude citee : a deficit egal, 8h30 de sommeil = 1.4 kg de gras perdu,
    // 5h30 = 600 g seulement. Le reste part en muscle.
  },

  // --- Hydratation ---
  eau: {
    cible: 4,      // litres, toutes boissons comprises (the, cafe, zero)
    // Le signal de faim et de soif viennent de la meme zone du cerveau.
  },

  // --- NEAT ---
  neat: {
    paliers: [
      { semaines: [1, 2], pas: 6000 },
      { semaines: [3, 4], pas: 8000 },
      { semaines: [5, 99], pas: 10000 },
    ],
    plancher: 8000,   // le minimum qu'il recommande une fois lance
    marchePostRepas: 3,  // nb de marches de 15-20 min a cocher par jour
  },

  /* --- Le hack du repas ---
   * Ordre d'ingestion : fibres > proteines > lipides > glucides.
   * Meme repas, meme calories, pic de glycemie environ 37 % plus bas.
   */
  ordreRepas: ['Fibres (legumes)', 'Proteines', 'Lipides', 'Glucides'],

  // --- Cardio : zone 2 ou fractionne, jamais entre les deux ---
  cardio: {
    zone2: [0.60, 0.70],   // part de la FC max
    dureeMin: 45,          // minutes, sinon les reserves de glycogene ne sont pas entamees
    zoneGrise: [0.75, 0.85], // le piege : trop dur pour la zone 2, trop mou pour le fractionne
  },

  // --- Musculation : full body 3x/semaine, rotation A > B > C ---
  seances: {
    A: {
      nom: 'Seance A',
      exos: [
        { nom: 'Presse a cuisses', series: 3, reps: '10' },
        { nom: 'Developpe couche (ou machine convergente)', series: 3, reps: '10' },
        { nom: 'Tirage vertical', series: 3, reps: '10' },
        { nom: 'Gainage', series: 3, reps: '40 s' },
      ],
    },
    B: {
      nom: 'Seance B',
      exos: [
        { nom: 'Souleve de terre roumain', series: 3, reps: '10' },
        { nom: 'Developpe militaire', series: 3, reps: '10' },
        { nom: 'Rowing', series: 3, reps: '10' },
        { nom: 'Leg curl', series: 3, reps: '12' },
      ],
    },
    C: {
      nom: 'Seance C',
      exos: [
        { nom: 'Squat gobelet', series: 3, reps: '10' },
        { nom: 'Dips assistes (ou machine)', series: 3, reps: '10' },
        { nom: 'Tirage horizontal', series: 3, reps: '10' },
        { nom: 'Elevations laterales', series: 3, reps: '15' },
      ],
    },
    ordre: ['A', 'B', 'C'],
  },

  // --- Contraintes perso (ce qui differe de la video) ---
  perso: {
    sansPoisson: true,
    omega3: "noix 25 g/j + 1 c.a.s de lin moulu ou chia + huile de colza a froid. Pour l'EPA/DHA reel : capsule d'huile d'algue (seule source non marine).",
    lieu: 'Athenes',
  },

  /* --- Les regles issues des 16 videos, dans l'ordre d'importance ---
   * Sert d'aide-memoire dans Reglages.
   */
  regles: [
    "Deficit de 10 a 15 % du maintien, jamais plus. Trop creuser fait perdre du muscle et casse la jauge.",
    "Quand ca stagne : tu montes la depense avant de baisser l'assiette. Lui est reste 18 mois au meme total calorique.",
    "Ordre d'ingestion a chaque repas : fibres, proteines, lipides, glucides. Meme repas, pic de sucre environ 37 % plus bas.",
    "15 a 20 min de marche apres chaque repas. C'est le seul mecanisme qui capte le glucose sans insuline.",
    "Tu peses et tu logges. La plupart des gens sous-estiment leur apport reel d'un facteur 2 a 3.",
    "Pas de cheat meal. Un ecart, c'est 300 kcal en plus, pas un buffet. Le cheat meal devient cheat day puis cheat week.",
    "Un produit vedette par jour : un aliment que tu adores, integre expres dans le plan. C'est ce qui te fait tenir.",
    "Vire de tes placards ce qui n'est pas dans le plan. Chaque ouverture de placard est une decision de moins a prendre.",
    "Zero alcool. 7 kcal/g de calories vides, et tant qu'il est dans le sang la lipolyse est a l'arret.",
    "Proteines reparties sur la journee, pas en un bloc. Meilleure synthese musculaire.",
    "Cardio : zone 2 (60 a 70 % de la FC max, 45 min minimum) ou fractionne court. Jamais la zone grise, c'est la stagnation garantie.",
    "4 L de liquide par jour, toutes boissons comprises. Faim et soif sortent de la meme zone du cerveau.",
    "Sommeil 7h30. A deficit egal, bien dormir decide si tu perds du gras ou du muscle.",
    "Mesure plus que le poids : tour de taille, photos, et ce qui t'a frustre ou encourage dans la semaine.",
    "Regarde le degre de transformation, pas le Nutriscore. Compositions a 3 ingredients maximum, pas de jus de fruits.",
    "Le sport doit te plaire. Trois criteres : tu y vas avec plaisir, ca stimule assez, ca rentre dans ta semaine.",
  ],
};

/* Objectif de pas pour une semaine donnee (1 = premiere semaine). */
function neatObjectif(semaine) {
  const p = METHODE.neat.paliers.find(
    (x) => semaine >= x.semaines[0] && semaine <= x.semaines[1]
  );
  return p ? p.pas : METHODE.neat.paliers[METHODE.neat.paliers.length - 1].pas;
}

/* Zone 2 en battements par minute. */
function zone2(age = METHODE.depart.age) {
  const fcMax = 220 - age;
  return {
    fcMax,
    bas: Math.round(fcMax * METHODE.cardio.zone2[0]),
    haut: Math.round(fcMax * METHODE.cardio.zone2[1]),
    griseBas: Math.round(fcMax * METHODE.cardio.zoneGrise[0]),
    griseHaut: Math.round(fcMax * METHODE.cardio.zoneGrise[1]),
  };
}

/* Verdict hebdo : compare deux moyennes glissantes.
 * L'ordre des leviers suit la methode : depense d'abord, calories en dernier.
 * Renvoie { ton, titre, detail, levier }
 */
function verdictHebdo(moyActuelle, moyPrecedente, semainesPlates = 0) {
  if (moyActuelle == null || moyPrecedente == null) {
    return {
      ton: 'neutre',
      titre: 'Pas encore assez de donnees',
      detail: "Pese-toi tous les matins. Il faut deux semaines de pesees pour que la boucle demarre.",
      levier: null,
    };
  }

  const perte = moyPrecedente - moyActuelle;
  const a = METHODE.ajustement;

  if (perte > a.plafond) {
    return {
      ton: 'alerte',
      titre: `Trop rapide : ${perte.toFixed(2)} kg cette semaine`,
      detail: `Au dela de ${a.plafond} kg/semaine, ce que tu perds c'est du muscle. Rajoute ${a.pas} kcal de glucides des demain.`,
      levier: 'calories+',
    };
  }

  if (perte >= a.cibleMin && perte <= a.cibleMax) {
    return {
      ton: 'ok',
      titre: `Dans la cible : ${perte.toFixed(2)} kg cette semaine`,
      detail: "Tu ne touches a rien. C'est exactement le rythme vise.",
      levier: null,
    };
  }

  if (perte > a.cibleMax && perte <= a.plafond) {
    return {
      ton: 'ok',
      titre: `Un peu vite : ${perte.toFixed(2)} kg cette semaine`,
      detail: "Acceptable. Si ca se repete la semaine prochaine, remonte les glucides plutot que de laisser filer.",
      levier: null,
    };
  }

  if (perte > 0.1) {
    return {
      ton: 'attention',
      titre: `Lent : ${perte.toFixed(2)} kg cette semaine`,
      detail: "Ca descend quand meme, ne coupe rien. Verifie d'abord que tu peses vraiment tout, c'est presque toujours la que ca se joue.",
      levier: null,
    };
  }

  // Stagnation ou reprise : on monte la depense avant de toucher a l'assiette
  const titre = perte <= -0.1
    ? `Ca remonte : +${Math.abs(perte).toFixed(2)} kg`
    : 'Plat cette semaine';

  if (semainesPlates < a.semainesStagnation) {
    return {
      ton: 'attention',
      titre,
      detail: "Premier reflexe : +1000 pas par jour et une seance de plus. On monte la depense, on ne baisse pas l'assiette. C'est comme ca qu'il a tenu 18 mois au meme total calorique.",
      levier: 'depense',
    };
  }

  return {
    ton: 'attention',
    titre: `${titre} (${semainesPlates} semaines)`,
    detail: `La depense a ete montee et ca ne bouge toujours pas. La, tu peux retirer ${a.pas} kcal de glucides. Une seule fois, puis tu observes deux semaines.`,
    levier: 'calories-',
  };
}

/* ===== js/aliments.js ===== */
/* aliments.js
 * Base d'aliments, valeurs pour 100 g (source : Ciqual / USDA, arrondies).
 * Format : { n: nom, k: kcal, p: proteines, l: lipides, g: glucides, c: categorie, u: unites }
 * u = unites pratiques : [["libelle", grammes], ...]
 * Volontairement sans poisson ni fruits de mer.
 * Attention : "cru" et "cuit" ne sont PAS interchangeables, surtout riz et pates.
 */

const ALIMENTS = [
  // --- Laitiers ---
  { n: 'Yaourt grec 2%', k: 73, p: 9.9, l: 1.9, g: 3.9, c: 'laitier', u: [['pot 150 g', 150], ['bol 250 g', 250]] },
  { n: 'Yaourt grec 0%', k: 59, p: 10.3, l: 0.4, g: 3.6, c: 'laitier', u: [['pot 150 g', 150]] },
  { n: 'Fromage blanc 0%', k: 47, p: 8, l: 0.2, g: 4, c: 'laitier', u: [['pot 200 g', 200]] },
  { n: 'Skyr', k: 63, p: 11, l: 0.2, g: 4, c: 'laitier', u: [['pot 150 g', 150]] },
  { n: 'Cottage cheese', k: 98, p: 11, l: 4.3, g: 3.4, c: 'laitier' },
  { n: 'Feta', k: 264, p: 14, l: 21, g: 4, c: 'laitier', u: [['tranche 30 g', 30]] },
  { n: 'Halloumi', k: 320, p: 22, l: 25, g: 2, c: 'laitier', u: [['tranche 40 g', 40]] },
  { n: 'Mozzarella', k: 254, p: 18, l: 19, g: 2, c: 'laitier' },
  { n: 'Parmesan', k: 392, p: 36, l: 27, g: 3, c: 'laitier', u: [['c.a.s 8 g', 8]] },
  { n: 'Emmental', k: 380, p: 28, l: 29, g: 1, c: 'laitier' },
  { n: 'Lait demi-ecreme', k: 46, p: 3.3, l: 1.6, g: 4.8, c: 'laitier', u: [['verre 200 ml', 200]] },
  { n: 'Whey (poudre)', k: 400, p: 80, l: 6, g: 6, c: 'laitier', u: [['dose 30 g', 30]] },

  // --- Viandes, oeufs ---
  { n: 'Blanc de poulet cru', k: 110, p: 23, l: 1.5, g: 0, c: 'viande' },
  { n: 'Blanc de poulet grille', k: 165, p: 31, l: 3.6, g: 0, c: 'viande', u: [['portion 150 g', 150]] },
  { n: 'Cuisse de poulet sans peau, cuite', k: 180, p: 26, l: 8, g: 0, c: 'viande' },
  { n: 'Escalope de dinde crue', k: 105, p: 23, l: 1.2, g: 0, c: 'viande' },
  { n: 'Viande hachee boeuf 5% cuite', k: 170, p: 26, l: 7, g: 0, c: 'viande' },
  { n: 'Viande hachee boeuf 15% crue', k: 215, p: 19, l: 15, g: 0, c: 'viande' },
  { n: 'Steak de boeuf maigre cuit', k: 190, p: 30, l: 7.5, g: 0, c: 'viande' },
  { n: 'Filet mignon de porc cuit', k: 165, p: 28, l: 5.5, g: 0, c: 'viande' },
  { n: 'Agneau cuit', k: 250, p: 26, l: 16, g: 0, c: 'viande' },
  { n: 'Jambon blanc', k: 110, p: 19, l: 3.5, g: 1, c: 'viande', u: [['tranche 40 g', 40]] },
  { n: 'Oeuf entier', k: 143, p: 12.6, l: 9.5, g: 0.7, c: 'viande', u: [['oeuf moyen', 55], ['gros oeuf', 65]] },
  { n: 'Blanc d\'oeuf', k: 52, p: 11, l: 0.2, g: 0.7, c: 'viande', u: [['blanc', 33]] },

  // --- Feculents ---
  { n: 'Riz blanc cru', k: 350, p: 7, l: 0.6, g: 78, c: 'feculent' },
  { n: 'Riz blanc cuit', k: 130, p: 2.7, l: 0.3, g: 28, c: 'feculent', u: [['bol 200 g', 200]] },
  { n: 'Riz complet cuit', k: 123, p: 2.7, l: 1, g: 25.6, c: 'feculent', u: [['bol 200 g', 200]] },
  { n: 'Pates seches', k: 355, p: 12.5, l: 1.5, g: 71, c: 'feculent', u: [['portion 80 g', 80]] },
  { n: 'Pates cuites', k: 158, p: 5.8, l: 0.9, g: 31, c: 'feculent', u: [['assiette 250 g', 250]] },
  { n: 'Pain complet', k: 250, p: 9, l: 3, g: 43, c: 'feculent', u: [['tranche 35 g', 35]] },
  { n: 'Baguette / pain blanc', k: 270, p: 8.5, l: 1.5, g: 55, c: 'feculent', u: [['demi-baguette 125 g', 125]] },
  { n: 'Pita grecque', k: 275, p: 9, l: 3, g: 51, c: 'feculent', u: [['pita 60 g', 60]] },
  { n: 'Flocons d\'avoine', k: 375, p: 13, l: 7, g: 60, c: 'feculent', u: [['portion 40 g', 40]] },
  { n: 'Pomme de terre cuite', k: 87, p: 2, l: 0.1, g: 19, c: 'feculent' },
  { n: 'Patate douce cuite', k: 90, p: 2, l: 0.1, g: 20, c: 'feculent' },
  { n: 'Quinoa cuit', k: 120, p: 4.4, l: 1.9, g: 21, c: 'feculent' },
  { n: 'Semoule / couscous cuit', k: 112, p: 3.8, l: 0.2, g: 23, c: 'feculent' },
  { n: 'Boulgour cuit', k: 83, p: 3, l: 0.2, g: 19, c: 'feculent' },

  // --- Legumineuses ---
  { n: 'Lentilles cuites', k: 116, p: 9, l: 0.4, g: 20, c: 'legumineuse' },
  { n: 'Pois chiches cuits (revithia)', k: 164, p: 8.9, l: 2.6, g: 27, c: 'legumineuse' },
  { n: 'Haricots blancs cuits (fasolada)', k: 130, p: 8.7, l: 0.5, g: 23, c: 'legumineuse' },
  { n: 'Gigantes (haricots geants)', k: 135, p: 8.5, l: 1.5, g: 23, c: 'legumineuse' },
  { n: 'Houmous', k: 170, p: 8, l: 10, g: 14, c: 'legumineuse', u: [['c.a.s 25 g', 25]] },
  { n: 'Tofu ferme', k: 145, p: 16, l: 9, g: 3, c: 'legumineuse' },
  { n: 'Tempeh', k: 190, p: 19, l: 11, g: 9, c: 'legumineuse' },
  { n: 'Seitan', k: 145, p: 25, l: 2, g: 6, c: 'legumineuse' },

  // --- Legumes ---
  { n: 'Tomate', k: 18, p: 0.9, l: 0.2, g: 3.9, c: 'legume', u: [['tomate moyenne', 120]] },
  { n: 'Concombre', k: 15, p: 0.7, l: 0.1, g: 3.6, c: 'legume' },
  { n: 'Courgette', k: 17, p: 1.2, l: 0.3, g: 3.1, c: 'legume' },
  { n: 'Aubergine cuite', k: 35, p: 0.8, l: 0.2, g: 8.7, c: 'legume' },
  { n: 'Poivron', k: 27, p: 1, l: 0.3, g: 6, c: 'legume' },
  { n: 'Brocoli cuit', k: 35, p: 2.4, l: 0.4, g: 7, c: 'legume' },
  { n: 'Epinards cuits', k: 23, p: 3, l: 0.4, g: 3.8, c: 'legume' },
  { n: 'Horta (verdure grecque)', k: 30, p: 3, l: 0.4, g: 4, c: 'legume' },
  { n: 'Haricots verts', k: 31, p: 1.8, l: 0.1, g: 7, c: 'legume' },
  { n: 'Carotte', k: 41, p: 0.9, l: 0.2, g: 9.6, c: 'legume' },
  { n: 'Oignon', k: 40, p: 1.1, l: 0.1, g: 9, c: 'legume' },
  { n: 'Salade verte', k: 15, p: 1.4, l: 0.2, g: 2.9, c: 'legume' },
  { n: 'Champignons', k: 22, p: 3.1, l: 0.3, g: 3.3, c: 'legume' },

  // --- Fruits ---
  { n: 'Pomme', k: 52, p: 0.3, l: 0.2, g: 14, c: 'fruit', u: [['pomme moyenne', 180]] },
  { n: 'Banane', k: 89, p: 1.1, l: 0.3, g: 23, c: 'fruit', u: [['banane moyenne', 120]] },
  { n: 'Pasteque', k: 30, p: 0.6, l: 0.2, g: 7.6, c: 'fruit', u: [['part 300 g', 300]] },
  { n: 'Melon', k: 34, p: 0.8, l: 0.2, g: 8, c: 'fruit' },
  { n: 'Orange', k: 47, p: 0.9, l: 0.1, g: 12, c: 'fruit', u: [['orange moyenne', 150]] },
  { n: 'Raisin', k: 69, p: 0.7, l: 0.2, g: 18, c: 'fruit' },
  { n: 'Peche', k: 39, p: 0.9, l: 0.3, g: 10, c: 'fruit' },
  { n: 'Figue fraiche', k: 74, p: 0.8, l: 0.3, g: 19, c: 'fruit', u: [['figue', 50]] },
  { n: 'Fraise', k: 32, p: 0.7, l: 0.3, g: 7.7, c: 'fruit' },
  { n: 'Myrtille', k: 57, p: 0.7, l: 0.3, g: 14, c: 'fruit' },
  { n: 'Kiwi', k: 61, p: 1.1, l: 0.5, g: 15, c: 'fruit', u: [['kiwi', 75]] },

  // --- Gras et oleagineux ---
  { n: 'Huile d\'olive', k: 900, p: 0, l: 100, g: 0, c: 'gras', u: [['c.a.s 10 g', 10], ['c.a.c 5 g', 5]] },
  { n: 'Huile de colza', k: 900, p: 0, l: 100, g: 0, c: 'gras', u: [['c.a.s 10 g', 10]] },
  { n: 'Beurre', k: 745, p: 0.7, l: 82, g: 0.6, c: 'gras', u: [['noisette 10 g', 10]] },
  { n: 'Noix', k: 654, p: 15, l: 65, g: 14, c: 'gras', u: [['poignee 25 g', 25]] },
  { n: 'Amandes', k: 579, p: 21, l: 50, g: 22, c: 'gras', u: [['poignee 25 g', 25]] },
  { n: 'Noix de cajou', k: 553, p: 18, l: 44, g: 30, c: 'gras', u: [['poignee 25 g', 25]] },
  { n: 'Cacahuetes', k: 567, p: 26, l: 49, g: 16, c: 'gras', u: [['poignee 25 g', 25]] },
  { n: 'Beurre de cacahuete', k: 588, p: 25, l: 50, g: 20, c: 'gras', u: [['c.a.s 16 g', 16]] },
  { n: 'Graines de lin moulues', k: 534, p: 18, l: 42, g: 29, c: 'gras', u: [['c.a.s 10 g', 10]] },
  { n: 'Graines de chia', k: 486, p: 17, l: 31, g: 42, c: 'gras', u: [['c.a.s 12 g', 12]] },
  { n: 'Tahini', k: 595, p: 17, l: 54, g: 21, c: 'gras', u: [['c.a.s 15 g', 15]] },
  { n: 'Avocat', k: 160, p: 2, l: 15, g: 9, c: 'gras', u: [['demi avocat', 100]] },
  { n: 'Olives noires', k: 145, p: 1, l: 15, g: 4, c: 'gras', u: [['10 olives', 40]] },

  // --- Plats grecs ---
  { n: 'Souvlaki poulet', k: 175, p: 27, l: 7, g: 0, c: 'grec', u: [['brochette 100 g', 100]] },
  { n: 'Gyros porc', k: 215, p: 20, l: 15, g: 0, c: 'grec' },
  { n: 'Tzatziki', k: 120, p: 3.5, l: 10, g: 3.5, c: 'grec', u: [['c.a.s 25 g', 25]] },
  { n: 'Spanakopita', k: 250, p: 7, l: 16, g: 19, c: 'grec', u: [['part 150 g', 150]] },
  { n: 'Dolmades', k: 165, p: 3, l: 8, g: 20, c: 'grec' },
  { n: 'Salade grecque (horiatiki)', k: 105, p: 3, l: 8.5, g: 4.5, c: 'grec', u: [['assiette 300 g', 300]] },

  // --- Les pieges (logge-les quand meme, c'est le but) ---
  { n: 'Chips', k: 536, p: 6.6, l: 34, g: 53, c: 'piege', u: [['petit paquet 45 g', 45], ['gros paquet 150 g', 150]] },
  { n: 'Frites', k: 312, p: 3.4, l: 15, g: 41, c: 'piege', u: [['portion 150 g', 150]] },
  { n: 'Chocolat noir 70%', k: 550, p: 8, l: 40, g: 34, c: 'piege', u: [['carre 10 g', 10]] },
  { n: 'Chocolat au lait', k: 535, p: 7.6, l: 30, g: 59, c: 'piege', u: [['carre 10 g', 10]] },
  { n: 'Glace vanille', k: 207, p: 3.5, l: 11, g: 24, c: 'piege', u: [['boule 60 g', 60]] },
  { n: 'Baklava', k: 430, p: 6, l: 24, g: 48, c: 'piege', u: [['part 60 g', 60]] },
  { n: 'Biere', k: 43, p: 0.5, l: 0, g: 3.6, c: 'piege', u: [['canette 330 ml', 330], ['pinte 500 ml', 500]] },
  { n: 'Vin rouge', k: 85, p: 0.1, l: 0, g: 2.6, c: 'piege', u: [['verre 125 ml', 125]] },
  { n: 'Coca / soda', k: 42, p: 0, l: 0, g: 10.6, c: 'piege', u: [['canette 330 ml', 330]] },
  { n: 'Miel', k: 304, p: 0.3, l: 0, g: 82, c: 'piege', u: [['c.a.c 7 g', 7]] },
  { n: 'Sucre', k: 400, p: 0, l: 0, g: 100, c: 'piege', u: [['morceau 5 g', 5]] },

  // --- Divers ---
  { n: 'Cafe noir', k: 2, p: 0.1, l: 0, g: 0, c: 'divers', u: [['tasse', 100]] },
  { n: 'The / infusion', k: 1, p: 0, l: 0, g: 0, c: 'divers', u: [['tasse', 200]] },
  { n: 'Sauce tomate nature', k: 35, p: 1.5, l: 0.5, g: 6, c: 'divers', u: [['louche 100 g', 100]] },
  { n: 'Ketchup', k: 110, p: 1.2, l: 0.2, g: 25, c: 'divers', u: [['c.a.s 15 g', 15]] },
  { n: 'Mayonnaise', k: 680, p: 1, l: 75, g: 1.5, c: 'divers', u: [['c.a.s 13 g', 13]] },
];

const CATEGORIES = {
  laitier: 'Laitiers',
  viande: 'Viandes, oeufs',
  feculent: 'Feculents',
  legumineuse: 'Legumineuses',
  legume: 'Legumes',
  fruit: 'Fruits',
  gras: 'Gras, oleagineux',
  grec: 'Plats grecs',
  piege: 'Pieges',
  divers: 'Divers',
  perso: 'Mes aliments',
};

/* ===== js/store.js ===== */
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

/* ===== js/app.js ===== */
/* app.js - interface et logique de vue */

const REPAS = [
  ['matin', 'Matin'],
  ['midi', 'Midi'],
  ['collation', 'Collation'],
  ['soir', 'Soir'],
];
const NOM_REPAS = Object.fromEntries(REPAS);

let jourActif = cleDate();
let repasCible = repasDeLHeure();
let alimentChoisi = null;
let ongletAjout = 'habituel';   // 'habituel' | 'recherche'
let champInline = null;

/* ============ Utilitaires ============ */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('on'), 1600);
}

function pct(v, max) {
  return max ? Math.min(100, (v / max) * 100) : 0;
}

function arr(n, d = 0) {
  return Number(Number(n).toFixed(d));
}

/* ============ Vue Jour ============ */
function rendreJour() {
  const t = totauxJour(jourActif);
  const c = S.cibles;

  const reste = Math.round(c.kcal - t.kcal);
  const chiffre = $('#resteKcal');
  chiffre.textContent = Math.abs(reste);
  chiffre.classList.toggle('depasse', reste < 0);
  $('#resteSous').textContent =
    reste < 0 ? `kcal au dessus de ${c.kcal}` : `kcal restantes sur ${c.kcal}`;

  const majJauge = (jauge, label, val, cible) => {
    $(label).textContent = `${arr(val, 1)} / ${cible} g`;
    const j = $(jauge);
    j.firstElementChild.style.width = pct(val, cible) + '%';
    j.classList.toggle('over', val > cible * 1.05);
  };
  majJauge('#jProt', '#lProt', t.prot, c.prot);
  majJauge('#jLip', '#lLip', t.lip, c.lip);
  majJauge('#jGluc', '#lGluc', t.gluc, c.gluc);

  rendreChips();
  rendreRituels();
  rendreRepas();
}

/* --- Chips d'etat du jour --- */
function rendreChips() {
  const j = jour(jourActif);
  const defs = [
    ['poids', 'Poids', j.poids ? `${j.poids} kg` : null],
    ['sommeil', 'Sommeil', j.sommeil ? `${j.sommeil} h` : null],
    ['pas', 'Pas', j.pas ? j.pas.toLocaleString('fr-FR') : null],
    ['seance', 'Seance', j.seance || (j.seance === null && j.seanceRepos ? 'Repos' : null)],
  ];

  poser(
    '#etatJour',
    defs.map(([cle, lbl, val]) =>
      el('button.chip' + (val ? '.rempli' : ''), {
        onclick: () => ouvrirInline(cle),
      },
        el('span.chip-l', { text: lbl }),
        el('span.chip-v', { text: val || '+' })
      )
    )
  );
}

function ouvrirInline(cle) {
  const zone = $('#saisieInline');
  if (champInline === cle) {
    zone.hidden = true;
    champInline = null;
    return;
  }
  champInline = cle;
  zone.hidden = false;
  const j = jour(jourActif);

  if (cle === 'seance') {
    poser(
      zone,
      el('div.inline-titre', { text: 'Seance du jour' }),
      el(
        'div.choix-seance',
        [...METHODE.seances.ordre.map((s) => [s, s]), ['', 'Repos']].map(([v, lbl]) =>
          el('button' + ((j.seance || '') === v ? '.on' : ''), {
            text: lbl,
            onclick: () => {
              j.seance = v || null;
              j.seanceRepos = !v;
              sauver();
              rendreChips();
              champInline = null;      // sinon ouvrirInline referme au lieu de rafraichir
              ouvrirInline('seance');
              rendreSuivi();
            },
          })
        )
      ),
      j.seance ? blocExos(j) : null,
      el('div.inline-aide', {
        text: `Prochaine seance suggeree : ${seanceSuggeree()}`,
      })
    );
    return;
  }

  const conf = {
    poids: { label: 'Pesee du matin (kg)', step: '0.1', ph: '99.4', val: j.poids },
    sommeil: { label: 'Sommeil (heures)', step: '0.5', ph: '7.5', val: j.sommeil },
    pas: { label: 'Pas', step: '100', ph: '8000', val: j.pas },
  }[cle];

  const input = el('input', {
    type: 'number',
    step: conf.step,
    inputMode: 'decimal',
    placeholder: conf.ph,
    value: conf.val ?? '',
  });

  const valider = () => {
    const v = parseFloat(input.value);
    if (cle === 'poids') {
      if (!v || v < 30 || v > 300) return toast('Poids invalide');
      j.poids = v;
    } else if (cle === 'sommeil') {
      j.sommeil = isNaN(v) ? null : v;
    } else {
      j.pas = isNaN(v) ? null : Math.round(v);
    }
    sauver();
    zone.hidden = true;
    champInline = null;
    rendreChips();
    rendreSuivi();
    toast('Enregistre');
  };

  input.addEventListener('keydown', (e) => e.key === 'Enter' && valider());

  poser(
    zone,
    el('div.inline-titre', { text: conf.label }),
    el('div.inline-ligne', input, el('button.btn.mini', { text: 'OK', onclick: valider }))
  );
  setTimeout(() => input.focus(), 50);
}

function blocExos(j) {
  const s = METHODE.seances[j.seance];
  if (!s) return null;
  j.charges = j.charges || {};
  return el(
    'div',
    { style: { marginTop: '10px' } },
    s.exos.map((e, i) =>
      el(
        'div.exo',
        el('div.txt', el('b', { text: e.nom }), el('span', { text: `${e.series} x ${e.reps}` })),
        el('input', {
          type: 'text',
          inputMode: 'decimal',
          placeholder: 'kg',
          value: j.charges[i] || '',
          // input et non change : sur mobile, quitter l'app sans blur perdrait la saisie
          oninput: (ev) => {
            j.charges[i] = ev.target.value;
            sauver();
          },
        })
      )
    )
  );
}

/* --- Rituels : eau et marches --- */
function rendreRituels() {
  const j = jour(jourActif);
  const cibleEau = METHODE.eau.cible;

  $('#lEau').textContent = `${j.eau} / ${cibleEau} L`;
  poser(
    '#compteurEau',
    Array.from({ length: cibleEau * 2 }, (_, i) =>
      el('button.eau' + (j.eau > i / 2 ? '.on' : ''), {
        text: '½',
        'aria-label': `${(i + 1) / 2} litre`,
        onclick: () => {
          const cible = (i + 1) / 2;
          j.eau = j.eau === cible ? i / 2 : cible;
          sauver();
          rendreRituels();
        },
      })
    )
  );

  const cibleM = METHODE.neat.marchePostRepas;
  $('#lMarches').textContent = `${j.marches} / ${cibleM}`;
  poser(
    '#compteurMarches',
    Array.from({ length: cibleM }, (_, i) =>
      el('button' + (j.marches > i ? '.on' : ''), {
        text: ['Matin', 'Midi', 'Soir'][i] || String(i + 1),
        onclick: () => {
          j.marches = j.marches === i + 1 ? i : i + 1;
          sauver();
          rendreRituels();
        },
      })
    )
  );
}

/* --- Liste des repas --- */
function rendreRepas() {
  const j = jour(jourActif);
  poser(
    '#repasListe',
    REPAS.map(([cle, nom]) => {
      const liste = j.repas[cle];
      const tt = totauxRepas(liste);
      return el(
        'div.repas',
        el(
          'div.repas-tete',
          el('h3', { text: nom }),
          el('span.kc', { text: `${Math.round(tt.kcal)} kcal` }),
          liste.length
            ? el('button.icone', {
                text: '☆',
                title: 'Enregistrer comme repas type',
                onclick: () => demanderType(cle, nom),
              })
            : null
        ),
        liste.map((e) =>
          el(
            'div.ligne',
            el(
              'div.nom',
              el('b', { text: e.nom }),
              el('span', {
                text: `${e.q} g · ${arr(e.prot, 1)}P ${arr(e.lip, 1)}L ${arr(e.gluc, 1)}G`,
              })
            ),
            el('div.kc', { text: String(e.kcal) }),
            el('button.sup', {
              text: '×',
              'aria-label': 'Supprimer',
              onclick: () => {
                supprimerEntree(jourActif, cle, e.id);
                rendreJour();
                rendreSuivi();
              },
            })
          )
        ),
        el('button.btn-ajout', {
          text: '+ Ajouter',
          onclick: () => ouvrirPanneau(cle),
        })
      );
    })
  );
}

function demanderType(repas, nomRepas) {
  const nom = prompt('Nom du repas type :', `Mon ${nomRepas.toLowerCase()}`);
  if (!nom) return;
  if (enregistrerType(nom.trim(), jourActif, repas)) {
    toast('Repas type enregistre');
    rendreReglages();
  }
}

/* ============ Panneau d'ajout ============ */
function ouvrirPanneau(repas) {
  repasCible = repas || repasDeLHeure();
  ongletAjout = 'habituel';
  $('#panneau').classList.add('ouvert');
  $('#recherche').value = '';
  rendreChoixRepas();
  rendreResultats('');
}

function fermerPanneau() {
  $('#panneau').classList.remove('ouvert');
}

function rendreChoixRepas() {
  poser(
    '#repasChoix',
    REPAS.map(([cle, nom]) =>
      el('button.puce' + (repasCible === cle ? '.on' : ''), {
        text: nom,
        onclick: () => {
          repasCible = cle;
          rendreChoixRepas();
          if (!$('#recherche').value) rendreResultats('');
        },
      })
    )
  );
}

function ligneResultat(a) {
  return el(
    'div.res',
    { onclick: () => ouvrirFeuille(a) },
    el(
      'div.txt',
      el('b', { text: a.n }),
      el('span', { text: `${a.k} kcal · ${a.p}P ${a.l}L ${a.g}G / 100 g` })
    ),
    el('span.cat', { text: CATEGORIES[a.c] || '' })
  );
}

function rendreResultats(q) {
  const corps = $('#panneauCorps');

  if (q) {
    const r = chercher(q);
    poser(
      corps,
      r.length
        ? r.map(ligneResultat)
        : el('div.vide', "Rien trouve. Tu peux l'ajouter dans Reglages.")
    );
    return;
  }

  const blocs = [];

  // Repas types du repas courant
  const types = S.types.filter((t) => t.repas === repasCible);
  if (types.length) {
    blocs.push(el('div.titre-bloc', { text: 'Mes repas types' }));
    blocs.push(
      ...types.map((t) => {
        const ap = apercuType(t);
        return el(
          'div.res.type',
          {
            onclick: () => {
              const n = jouerType(t, jourActif, repasCible);
              fermerPanneau();
              rendreJour();
              rendreSuivi();
              toast(`${n} aliments ajoutes`);
            },
          },
          el(
            'div.txt',
            el('b', { text: t.nom }),
            el('span', {
              text: `${t.items.length} aliments · ${Math.round(ap.kcal)} kcal · ${arr(ap.prot)}P`,
            })
          ),
          el('span.cat.vert', { text: 'Tout ajouter' })
        );
      })
    );
  }

  // Comme hier
  const hier = decalerJour(jourActif, -1);
  const srcHier = (S.jours[hier] && S.jours[hier].repas[repasCible]) || [];
  if (srcHier.length) {
    blocs.push(el('div.titre-bloc', { text: 'Hier' }));
    blocs.push(
      el(
        'div.res.type',
        {
          onclick: () => {
            const n = copierRepas(hier, jourActif, repasCible);
            fermerPanneau();
            rendreJour();
            rendreSuivi();
            toast(`${n} aliments repris`);
          },
        },
        el(
          'div.txt',
          el('b', { text: `Mon ${NOM_REPAS[repasCible].toLowerCase()} d'hier` }),
          el('span', {
            text: srcHier.map((e) => e.nom).join(', ').slice(0, 60),
          })
        ),
        el('span.cat.vert', { text: 'Reprendre' })
      )
    );
  }

  // Recents
  const recents = S.recents
    .map((n) => catalogue().find((a) => a.n === n))
    .filter(Boolean);
  if (recents.length) {
    blocs.push(el('div.titre-bloc', { text: 'Recents' }));
    blocs.push(...recents.map(ligneResultat));
  }

  // Categories
  blocs.push(el('div.titre-bloc', { text: 'Parcourir' }));
  blocs.push(
    el(
      'div.puces',
      Object.entries(CATEGORIES)
        .filter(([k]) => k !== 'perso' || S.perso.length)
        .map(([k, v]) =>
          el('button.puce', {
            text: v,
            onclick: () => {
              const items = catalogue().filter((a) => a.c === k);
              poser(corps, el('div.titre-bloc', { text: v }), ...items.map(ligneResultat));
            },
          })
        )
    )
  );

  if (!recents.length && !types.length && !srcHier.length) {
    blocs.unshift(
      el('div.astuce', "Compose un repas, puis appuie sur ☆ a cote de son nom pour pouvoir le rejouer en un geste.")
    );
  }

  poser(corps, blocs);
}

/* ============ Feuille quantite ============ */
function ouvrirFeuille(a) {
  alimentChoisi = a;
  $('#fNom').textContent = a.n;
  $('#fP100').textContent = `${a.k} kcal · ${a.p}P ${a.l}L ${a.g}G pour 100 g`;

  const unites = a.u || [];
  poser(
    '#fUnites',
    [['100 g', 100], ...unites].map(([lib, gr]) =>
      el('button.puce', {
        text: lib,
        onclick: () => {
          $('#fQte').value = gr;
          majApercu();
        },
      })
    )
  );

  $('#fQte').value = qteDefaut(a);
  majApercu();
  $('#feuille').classList.add('ouvert');
}

function majApercu() {
  if (!alimentChoisi) return;
  const f = (parseFloat($('#fQte').value) || 0) / 100;
  $('#fK').textContent = Math.round(alimentChoisi.k * f);
  $('#fP').textContent = arr(alimentChoisi.p * f, 1);
  $('#fL').textContent = arr(alimentChoisi.l * f, 1);
  $('#fG').textContent = arr(alimentChoisi.g * f, 1);
}

function fermerFeuille() {
  $('#feuille').classList.remove('ouvert');
  alimentChoisi = null;
}

/* ============ Vue Suivi ============ */
function rendreSuivi() {
  const b = bilanHebdo(jourActif);
  const v = b.verdict;
  poser(
    '#verdictBloc',
    el('div.verdict.' + v.ton, el('b', { text: v.titre }), el('p', { text: v.detail }))
  );

  const dp = dernierPoids();
  $('#sPoids').textContent = dp ? dp.toFixed(1) : '-';
  $('#sMoy').textContent = b.actuelle ? b.actuelle.toFixed(1) : '-';
  const perdu = METHODE.depart.poids - dp;
  $('#sPerdu').textContent = (perdu > 0 ? '-' : '') + Math.abs(perdu).toFixed(1);

  dessinerCourbe();
  rendreSemaine();
  rendreMensurations();
  rendreZone2();
}

function rendreSemaine() {
  const lignes = [];
  for (let i = 6; i >= 0; i--) {
    const cle = decalerJour(cleDate(), -i);
    const d = S.jours[cle];
    const t = d ? totauxJour(cle) : { kcal: 0 };
    const bouts = [];
    if (t.kcal) bouts.push(`${Math.round(t.kcal)} kcal`);
    if (d && d.pas) bouts.push(`${d.pas.toLocaleString('fr-FR')} pas`);
    if (d && d.sommeil) bouts.push(`${d.sommeil} h`);
    lignes.push(
      el(
        'div.ligne',
        el(
          'div.nom',
          el('b', { text: libelleDate(cle) }),
          el('span', { text: bouts.join(' · ') || 'rien note' })
        ),
        el('div.kc', {
          text: d && d.seance ? d.seance : '·',
          style: { color: d && d.seance ? 'var(--accent)' : 'var(--doux)' },
        })
      )
    );
  }
  poser('#semaineHisto', lignes);
}

const CHAMPS_MENSUR = [
  ['taille', '#mTaille', 'Taille'],
  ['hanches', '#mHanches', 'Hanches'],
  ['poitrine', '#mPoitrine', 'Poitrine'],
  ['bras', '#mBras', 'Bras'],
];

function rendreMensurations() {
  const m = S.taille[jourActif] || {};
  CHAMPS_MENSUR.forEach(([cle, sel]) => ($(sel).value = m[cle] ?? ''));

  const histo = Object.entries(S.taille)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 6);

  poser(
    '#mensurHisto',
    histo.map(([cle, v]) =>
      el(
        'div.ligne',
        el(
          'div.nom',
          el('b', { text: libelleDate(cle) }),
          el('span', {
            text:
              CHAMPS_MENSUR.filter(([k]) => v[k] != null)
                .map(([k, , lbl]) => `${lbl} ${v[k]}`)
                .join(' · ') || 'vide',
          })
        )
      )
    )
  );
}

function rendreZone2() {
  const z = zone2(S.age);
  poser(
    '#zone2Bloc',
    el(
      'div.zone-ligne.bonne',
      el(
        'div',
        el('div', { text: 'Zone 2, endurance fondamentale' }),
        el('div.lbl', { text: `60 a 70 % de ta FC max (${z.fcMax} bpm)` })
      ),
      el('b', { text: `${z.bas} - ${z.haut}` })
    ),
    el(
      'div.zone-ligne.mauvaise',
      el(
        'div',
        el('div', { text: 'Zone grise, a eviter' }),
        el('div.lbl', { text: 'Trop dur pour la zone 2, trop mou pour le fractionne' })
      ),
      el('b', { text: `${z.griseBas} - ${z.griseHaut}` })
    )
  );
}

function dessinerCourbe() {
  const cv = $('#courbe');
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth || 320;
  const h = 150;
  cv.width = w * dpr;
  cv.height = h * dpr;
  const x = cv.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.clearRect(0, 0, w, h);

  const p = pesees().slice(-60);
  if (p.length < 2) {
    x.fillStyle = '#8b909b';
    x.font = '13px -apple-system, system-ui, sans-serif';
    x.textAlign = 'center';
    x.fillText('Il faut au moins 2 pesees', w / 2, h / 2);
    return;
  }

  const vals = p.map((d) => d.poids);
  const marge = Math.max(0.5, (Math.max(...vals) - Math.min(...vals)) * 0.15);
  const min = Math.min(...vals) - marge;
  const max = Math.max(...vals) + marge;

  const px = (i) => 8 + (i / (p.length - 1)) * (w - 16);
  const py = (v) => h - 20 - ((v - min) / (max - min)) * (h - 40);

  const moy = p.map((_, i) => {
    const t = p.slice(Math.max(0, i - 6), i + 1);
    return t.reduce((s, d) => s + d.poids, 0) / t.length;
  });

  x.fillStyle = 'rgba(139,144,155,.55)';
  p.forEach((d, i) => {
    x.beginPath();
    x.arc(px(i), py(d.poids), 2, 0, Math.PI * 2);
    x.fill();
  });

  x.strokeStyle = '#7bd88f';
  x.lineWidth = 2.5;
  x.lineJoin = 'round';
  x.beginPath();
  moy.forEach((v, i) => (i ? x.lineTo(px(i), py(v)) : x.moveTo(px(i), py(v))));
  x.stroke();

  x.fillStyle = '#8b909b';
  x.font = '11px -apple-system, system-ui, sans-serif';
  x.textAlign = 'left';
  x.fillText(max.toFixed(1) + ' kg', 8, 12);
  x.fillText(min.toFixed(1) + ' kg', 8, h - 4);
}

/* ============ Vue Reglages ============ */
function rendreReglages() {
  $('#cKcal').value = S.cibles.kcal;
  $('#cProt').value = S.cibles.prot;
  $('#cLip').value = S.cibles.lip;
  $('#cGluc').value = S.cibles.gluc;
  $('#cAge').value = S.age;

  poser(
    '#typesListe',
    S.types.length
      ? S.types.map((t, i) =>
          el(
            'div.ligne',
            el(
              'div.nom',
              el('b', { text: t.nom }),
              el('span', {
                text: `${NOM_REPAS[t.repas]} · ${t.items.length} aliments · ${Math.round(apercuType(t).kcal)} kcal`,
              })
            ),
            el('button.sup', {
              text: '×',
              onclick: () => {
                S.types.splice(i, 1);
                sauver();
                rendreReglages();
              },
            })
          )
        )
      : el('div.note', 'Aucun repas type pour le moment.')
  );

  poser(
    '#persoListe',
    S.perso.map((a, i) =>
      el(
        'div.ligne',
        el(
          'div.nom',
          el('b', { text: a.n }),
          el('span', { text: `${a.k} kcal · ${a.p}P ${a.l}L ${a.g}G` })
        ),
        el('button.sup', {
          text: '×',
          onclick: () => {
            S.perso.splice(i, 1);
            sauver();
            rendreReglages();
          },
        })
      )
    )
  );

  poser(
    '#rappelMethode',
    el(
      'ol',
      { style: { margin: '0 0 14px', paddingLeft: '18px' } },
      METHODE.regles.map((r) => el('li', { text: r, style: { marginBottom: '7px' } }))
    ),
    el('div', el('b', { text: 'Omega-3 sans poisson : ' }), METHODE.perso.omega3)
  );
}

/* ============ Navigation ============ */
function majEntete() {
  $('#dateLbl').textContent = libelleDate(jourActif);
  $('#semaineLbl').textContent = `Semaine ${semaineProgramme(jourActif)} du programme`;
  $('#suiv').style.visibility = jourActif >= cleDate() ? 'hidden' : 'visible';
}

function rendreTout() {
  majEntete();
  rendreJour();
  rendreSuivi();
  rendreReglages();
}

function allerVue(nom) {
  $$('.vue').forEach((v) => v.classList.toggle('actif', v.id === 'vue-' + nom));
  $$('.barre button').forEach((b) => b.classList.toggle('on', b.dataset.vue === nom));
  $('#fab').hidden = nom !== 'jour';
  window.scrollTo(0, 0);
}

/* ============ Branchements ============ */
function init() {
  $('#prec').addEventListener('click', () => {
    jourActif = decalerJour(jourActif, -1);
    champInline = null;
    $('#saisieInline').hidden = true;
    rendreTout();
  });
  $('#suiv').addEventListener('click', () => {
    if (jourActif >= cleDate()) return;
    jourActif = decalerJour(jourActif, 1);
    champInline = null;
    $('#saisieInline').hidden = true;
    rendreTout();
  });

  $$('.barre button').forEach((b) =>
    b.addEventListener('click', () => allerVue(b.dataset.vue))
  );

  $('#fab').addEventListener('click', () => ouvrirPanneau(repasDeLHeure()));

  $('#rappelOrdre').addEventListener('click', () =>
    toast('Legumes, puis proteines, puis lipides, puis glucides')
  );

  $('#fermerPanneau').addEventListener('click', fermerPanneau);
  let deb;
  $('#recherche').addEventListener('input', (e) => {
    clearTimeout(deb);
    const v = e.target.value;
    deb = setTimeout(() => rendreResultats(v), 120);
  });

  $('#fQte').addEventListener('input', majApercu);
  $('#fMoins').addEventListener('click', () => {
    $('#fQte').value = Math.max(0, (parseFloat($('#fQte').value) || 0) - 10);
    majApercu();
  });
  $('#fPlus').addEventListener('click', () => {
    $('#fQte').value = (parseFloat($('#fQte').value) || 0) + 10;
    majApercu();
  });
  $('#fAnnuler').addEventListener('click', fermerFeuille);
  $('#feuille').addEventListener('click', (e) => {
    if (e.target.id === 'feuille') fermerFeuille();
  });
  $('#fValider').addEventListener('click', () => {
    const g = parseFloat($('#fQte').value);
    if (!alimentChoisi || !g || g <= 0) return toast('Quantite invalide');
    ajouterEntree(jourActif, repasCible, alimentChoisi, g);
    fermerFeuille();
    fermerPanneau();
    rendreJour();
    rendreSuivi();
    toast(`Ajoute au ${NOM_REPAS[repasCible].toLowerCase()}`);
  });

  $('#mensurOk').addEventListener('click', () => {
    const m = {};
    let vide = true;
    CHAMPS_MENSUR.forEach(([cle, sel]) => {
      const v = parseFloat($(sel).value);
      if (!isNaN(v)) {
        m[cle] = v;
        vide = false;
      }
    });
    if (vide) return toast('Rien a enregistrer');
    S.taille[jourActif] = m;
    sauver();
    rendreMensurations();
    toast('Enregistre');
  });

  $('#ciblesOk').addEventListener('click', () => {
    S.cibles = {
      kcal: parseInt($('#cKcal').value, 10) || METHODE.cibles.kcal,
      prot: parseInt($('#cProt').value, 10) || METHODE.cibles.prot,
      lip: parseInt($('#cLip').value, 10) || METHODE.cibles.lip,
      gluc: parseInt($('#cGluc').value, 10) || METHODE.cibles.gluc,
    };
    S.age = parseInt($('#cAge').value, 10) || METHODE.depart.age;
    sauver();
    rendreJour();
    rendreZone2();
    toast('Enregistre');
  });

  $('#persoOk').addEventListener('click', () => {
    const n = $('#pNom').value.trim();
    const k = parseFloat($('#pK').value);
    if (!n || isNaN(k)) return toast('Nom et kcal obligatoires');
    S.perso.push({
      n,
      k,
      p: parseFloat($('#pP').value) || 0,
      l: parseFloat($('#pL').value) || 0,
      g: parseFloat($('#pG').value) || 0,
      c: 'perso',
    });
    sauver();
    ['#pNom', '#pK', '#pP', '#pL', '#pG'].forEach((s) => ($(s).value = ''));
    rendreReglages();
    toast('Aliment ajoute');
  });

  $('#exportBtn').addEventListener('click', exporter);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    importer(f, (err) => {
      if (err) return toast('Fichier illisible');
      rendreTout();
      toast('Sauvegarde restauree');
    });
  });

  window.addEventListener('resize', dessinerCourbe);
  rendreTout();
}

document.addEventListener('DOMContentLoaded', init);

