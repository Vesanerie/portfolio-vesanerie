# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-24 (17e revision)
> Auteur : Claude (audit automatique)
> Statut : **PROPRE** — 0 bug, 0 point critique

---

## Structure du projet

Portfolio vanilla HTML/CSS/JS. 6 pages + 404. O2Switch + GitHub Actions FTP. Assets Cloudflare R2.

### Pages

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 250 | Landing (h1, bio, CTA contact), slideshow bg, CV overlay (pdf.js defer+SRI), section A propos, scroll-to-top, contact card (`<div>`), JSON-LD Person + WebSite, skip-intro, 3D tilt cards |
| `art/index.html` | 520 | Portfolio art — edition (5 PDFs), illustration (3 carnets + gallery 16 + 1 PDF), graphisme (6 items covers), motion design (CMP video 640px), animation (6 YT thumbnails + 1 video), tiktoks (4 embeds + CTA), lightbox, tools-card (`<div>`) + trigger mobile |
| `tech/index.html` | 117 | Laptop (ecran seul mobile), 5 apps grid, hover desc, fiche projet, demo iframe, tools-card + trigger mobile |
| `music/index.html` | 103 | iPod (320px), 7 tracks, tools-card + trigger mobile |
| `mentions-legales.html` | 67 | Mentions legales, layout 2 colonnes avec image |
| `404.html` | 35 | Page 404 personnalisee |
| `sitemap.xml` | 28 | Sitemap XML (5 URLs) |
| `robots.txt` | 5 | Allow all sauf /dist/ |
| `.htaccess` | 1 | ErrorDocument 404 |

### CSS — Architecture modulaire

| Fichier | Lignes | Role | Charge par |
|---|---|---|---|
| `css/variables.css` | 26 | Custom properties light/dark | toutes les pages |
| `css/base.css` | 125 | Reset, body, halftone, slideshow, back-link, legal-link, card-logo | toutes les pages |
| `css/components/theme-toggle.css` | 42 | Switch theme + responsive | toutes les pages |
| `css/components/landing.css` | 274 | Landing page, cards, vinyl, animations + responsive | index |
| `css/components/cards.css` | 292 | CV card, contact card, tools card + trigger + responsive | index, art, tech, music |
| `css/components/about.css` | 93 | Section a propos + responsive | index |
| `css/components/scroll.css` | 58 | Scroll-to-top, scroll-reveal, pile-reveal + responsive | index, art, tech, music |
| `css/components/mentions.css` | 74 | Mentions legales + responsive | mentions-legales |
| `css/components/error-page.css` | 52 | Page 404 + responsive | 404 |
| `css/components/pile.css` | 308 | Pile view, pile-book, sizes, covers, sheen, book-view + responsive | art |
| `css/components/gallery.css` | 103 | Gallery masonry, lightbox + responsive | art |
| `css/components/folder.css` | 71 | Folder card (macOS) + responsive | art |
| `css/components/film.css` | 89 | Film strip card + responsive | art |
| `css/components/anim.css` | 107 | Anim grid, motion design + responsive | art |
| `css/components/tiktok.css` | 224 | Phone card, TikTok scroll/phone/nav + responsive | art |
| `css/components/art-fiche.css` | 82 | Fiche projet art + responsive | art |
| `css/tech.css` | 414 | Laptop, desktop grid, fiche projet, responsive | tech |
| `css/music.css` | 262 | iPod, LCD, click wheel, responsive | music |
| `css/pdf-viewer.css` | 157 | PDF reader, curseurs SVG, responsive | art |

### JavaScript

| Fichier | Lignes | Role |
|---|---|---|
| `js/main.js` | 72 | Theme toggle + theme-color meta, scroll-to-top (throttled, passive), close cards on outside click, Escape shortcuts (CV, contact, tools) |
| `js/art.js` | 635 | `initPdfJs()`, `artProjects{}`, fiche art, pile/folders, lazy covers (sequentiels), media stop/restore, TikTok scroll (throttled), lightbox, PDF viewer, `setBackLink()`, history pushState/popstate, anim-card YT click-to-load, 3D tilt, scroll reveal |
| `js/tech.js` | 79 | `projects{}` (5 apps), hover desc, fiche -> demo -> retour |
| `js/music.js` | 70 | Player iPod, auto-next, formatTime guard |

---

## Nouveautes depuis le dernier audit

### Architecture CSS (v17)
- **Refacto CSS modulaire** : `style.css` (1035 lignes) et `art.css` (984 lignes) decomposes en 16 fichiers composants
- Chaque composant contient son propre responsive (plus de blocs @media de 150 lignes qui melangent tout)
- `variables.css` : source unique pour les custom properties
- `base.css` : reset, body, halftone, elements partages
- `css/components/` : un fichier par composant UI (landing, cards, about, pile, gallery, etc.)
- Fichiers inchanges : `tech.css`, `music.css`, `pdf-viewer.css` (taille raisonnable)
- Total CSS identique (2020 vs 2019 lignes) — zero perte, zero ajout

### UX / Visuel (v16)
- **3D tilt + reflet iridescent** sur les landing cards (homepage) et toutes les cartes art (pile-book, folder, film, phone) — suit la souris, desktop only
- **Animation page refaite** : thumbnails YouTube + bouton play custom, iframe charge au clic (6 iframes en moins au chargement)
- **Motion design** : video CMP limitee a 640px, centree dans `.motion-single`
- **Scroll reveal cascade** sur les pile items (fade-in avec delai 80ms par item)
- **History API** : bouton retour navigateur respecte la profondeur (dossier par dossier)

### Performance (v16)
- **MutationObserver supprime** (causait jank sur ouverture de dossiers)
- **PDF covers sequentiels** au lieu de paralleles (plus de freeze)
- **Scroll listeners throttles** (TikTok + scroll-to-top, 100ms)
- **Scroll-to-top passive** pour ne pas bloquer le scroll natif

### Mobile (v16)
- **Contact card** : bottom-sheet pleine largeur avec items espaces (touch 44px)
- **Tools card** : bottom-sheet pleine largeur + bouton trigger logo en bas a gauche (mobile only)
- **Grille uniforme** sur art mobile : tous les items meme taille, pas de rotation, 2 colonnes
- **Covers mobile** : overlay sombre permanent + titres toujours visibles
- **Tech mobile** : clavier/trackpad caches, ecran plein, grille 3 icones, fiche responsive
- **iPod** : nouveau breakpoint 600px (taille intermediaire)
- **Fermeture cards au tap exterieur** (contact + tools)

### Bugs corriges (v16)
- **CSS tech.css** : declarations dupliquees fusionnees
- **Landing-card 380px** : garde width 100% au lieu de 90px
- **`.section-title` → `.pile-title`** dans art.js
- **`<button>` imbriquant `<a>`** → `<div>` sur contact-card et tools-card
- **Clic lien ferme la carte** : resolu par restructuration en `<div>` + toggle sur le label
- **Lightbox mort dans main.js** : remplace par fermeture tools-card
- **`theme-color`** : ajoute sur les 6 pages, dynamique au toggle theme

---

## Corrections RESTANTES

Aucun bug connu.

---

## Verifications

- pdf.js `defer` + SRI : **OK** (index + art)
- `initPdfJs()` timing defer : **OK**
- TikTok `getItemH()` throttle : **OK** (100ms)
- JSON-LD Person valide : **OK**
- Canonical URLs coherentes sitemap : **OK**
- sessionStorage skip-intro : **OK**
- setBackLink() avec `.pile-title` : **OK**
- history pushState/popstate : **OK** (folder + book)
- .htaccess 404 : **OK**
- Contact card `<div>` (pas `<button>`) : **OK**
- Tools card `<div>` + trigger mobile : **OK**
- Fermeture cards tap exterieur : **OK**
- theme-color dynamique : **OK**
- Anim cards click-to-load YouTube : **OK**
- PDF covers sequentiels : **OK**
- 3D tilt desktop only (hover: hover) : **OK**
- Scroll listeners throttles + passive : **OK**
- CSS modulaire : 16 composants, 0 regle perdue : **OK**
- HTML `<link>` mis a jour (6 pages) : **OK**

---

## Audit mobile

| Page | 600px | 400px | 380px | Verdict |
|---|---|---|---|---|
| **Accueil** | OK (cards column, about responsive, contact bottom-sheet) | - | OK (cards 100% x 110px) | OK |
| **Art** | OK (grille 2 col uniforme, covers visibles, fiche compacte) | OK (grille 130px, gallery 1 col) | - | OK |
| **Tech** | OK (ecran plein, grid 3 icones, fiche responsive) | - | - | OK |
| **Musique** | OK (iPod 290px, tracks touch-friendly) | - | OK (iPod 250px) | OK |
| **Mentions** | OK (1 colonne, typo reduite) | - | - | OK |
| **404** | OK (code 64px, bouton adapte) | - | - | OK |
| **Contact** | OK (bottom-sheet, liens espaces) | - | - | OK |
| **Tools** | OK (bottom-sheet + trigger logo) | - | - | OK |
| **PDF viewer** | OK (single page, touch swipe) | - | - | OK |

---

## Consignes pour tout agent futur

- Site **vanilla HTML/CSS/JS** — pas de framework, pas de bundler.
- Assets sur **Cloudflare R2** (`pub-43a141f7a8b84a30a90fcc01da2114ca.r2.dev`).
- Deploy **O2Switch** via **GitHub Actions FTP**. Toujours push apres commit.
- **CSS modulaire** : `variables.css` → `base.css` → `components/*.css`. Chaque composant contient son propre responsive.
- Quand on ajoute un nouveau composant CSS, creer un fichier dans `css/components/` et l'ajouter aux `<link>` des pages concernees.
- Quand on modifie `art/index.html`, **verifier que `defer` est present** sur pdf.js.
- Les PDFs comprimes sont dans `/Art/Fanzine/` avec suffixe `_compressé` ou `_compressed`.
- Le titre de chaque page doit commencer par "Valentin Mardoukhaev" pour le SEO.
- Le JSON-LD Person est sur la homepage — mettre a jour si nouveaux reseaux/projets.
- **Contact et tools cards** sont des `<div>` (pas `<button>`) — le toggle est sur le `.label`.
- **Animations YouTube** : thumbnails + click-to-load, pas d'iframes au chargement.
- **3D tilt** : desktop only via `(hover: hover)`, JS dans index.html et art.js.
- **Scroll listeners** : toujours throttler (100ms min) et utiliser `{ passive: true }`.
- **PDF covers** : charger sequentiellement (`await`), jamais en parallele.
