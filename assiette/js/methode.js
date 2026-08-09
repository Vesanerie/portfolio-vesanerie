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
