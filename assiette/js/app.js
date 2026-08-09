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
