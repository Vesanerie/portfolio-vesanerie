# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-24 (16e revision)
> Auteur : Claude (audit automatique)
> Statut : **PROPRE** — 0 bug, 0 point critique

---

## Structure du projet

Portfolio vanilla HTML/CSS/JS. 6 pages + 404. O2Switch + GitHub Actions FTP. Assets Cloudflare R2.

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 240 | Landing (h1, bio, CTA contact), slideshow bg, CV overlay (pdf.js defer+SRI), section A propos, scroll-to-top, contact card (`<div>`), JSON-LD Person + WebSite, skip-intro, 3D tilt cards |
| `art/index.html` | 510 | Portfolio art — edition (5 PDFs), illustration (3 carnets + gallery 16 + 1 PDF), graphisme (6 items covers), motion design (CMP video 640px), animation (6 YT thumbnails + 1 video), tiktoks (4 embeds + CTA), lightbox, tools-card (`<div>`) + trigger mobile |
| `tech/index.html` | 113 | Laptop (ecran seul mobile), 5 apps grid, hover desc, fiche projet, demo iframe, tools-card + trigger mobile |
| `music/index.html` | 99 | iPod (320px), 7 tracks, tools-card + trigger mobile |
| `mentions-legales.html` | 64 | Mentions legales, layout 2 colonnes avec image |
| `404.html` | 31 | Page 404 personnalisee |
| `sitemap.xml` | 28 | Sitemap XML (5 URLs) |
| `robots.txt` | 5 | Allow all sauf /dist/ |
| `.htaccess` | 1 | ErrorDocument 404 |
| `css/style.css` | 1035 | Base, halftone, slideshow, anims, vinyl, CV, contact (bottom-sheet mobile), tools (bottom-sheet mobile), tools-trigger, back-link, about, scroll-top, scroll-reveal, pile-reveal, error-page, mentions, no-intro, 3D tilt + iridescent sheen, responsive (600px, 380px) |
| `css/art.css` | 984 | Pile (5 variantes + perspective + iridescent sheen), has-cover, gallery masonry, lightbox, phone/folder/film, tiktok + CTA, anim-card (thumbnail + play button), book-view, fiche art, motion-single, responsive (700px, 400px) |
| `css/tech.css` | 414 | Laptop, desktop grid 3 colonnes mobile, fiche projet responsive, site-iframe, responsive (600px) |
| `css/pdf-viewer.css` | 157 | PDF reader, curseurs SVG, responsive, hover:none |
| `css/music.css` | 262 | iPod, LCD vert, click wheel, responsive (600px, 380px) |
| `js/main.js` | 72 | Theme toggle + theme-color meta, scroll-to-top (throttled, passive), close cards on outside click, Escape shortcuts (CV, contact, tools) |
| `js/art.js` | 635 | `initPdfJs()`, `artProjects{}`, fiche art, pile/folders, lazy covers (sequentiels), media stop/restore, TikTok scroll (throttled), lightbox, PDF viewer, `setBackLink()`, history pushState/popstate, anim-card YT click-to-load, 3D tilt, scroll reveal |
| `js/tech.js` | 79 | `projects{}` (5 apps), hover desc, fiche -> demo -> retour |
| `js/music.js` | 70 | Player iPod, auto-next, formatTime guard |

---

## Nouveautes depuis le dernier audit

### UX / Visuel
- **3D tilt + reflet iridescent** sur les landing cards (homepage) et toutes les cartes art (pile-book, folder, film, phone) — suit la souris, desktop only
- **Animation page refaite** : thumbnails YouTube + bouton play custom, iframe charge au clic (6 iframes en moins au chargement)
- **Motion design** : video CMP limitee a 640px, centree dans `.motion-single`
- **Scroll reveal cascade** sur les pile items (fade-in avec delai 80ms par item)
- **History API** : bouton retour navigateur respecte la profondeur (dossier par dossier)

### Performance
- **MutationObserver supprime** (causait jank sur ouverture de dossiers)
- **PDF covers sequentiels** au lieu de paralleles (plus de freeze)
- **Scroll listeners throttles** (TikTok + scroll-to-top, 100ms)
- **Scroll-to-top passive** pour ne pas bloquer le scroll natif

### Mobile
- **Contact card** : bottom-sheet pleine largeur avec items espaces (touch 44px)
- **Tools card** : bottom-sheet pleine largeur + bouton trigger logo en bas a gauche (mobile only)
- **Grille uniforme** sur art mobile : tous les items meme taille, pas de rotation, 2 colonnes
- **Covers mobile** : overlay sombre permanent + titres toujours visibles
- **Tech mobile** : clavier/trackpad caches, ecran plein, grille 3 icones, fiche responsive
- **iPod** : nouveau breakpoint 600px (taille intermediaire)
- **Fermeture cards au tap exterieur** (contact + tools)

### Bugs corriges
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
- Quand on modifie `art/index.html`, **verifier que `defer` est present** sur pdf.js.
- Les PDFs comprimes sont dans `/Art/Fanzine/` avec suffixe `_compressé` ou `_compressed`.
- Le titre de chaque page doit commencer par "Valentin Mardoukhaev" pour le SEO.
- Le JSON-LD Person est sur la homepage — mettre a jour si nouveaux reseaux/projets.
- **Contact et tools cards** sont des `<div>` (pas `<button>`) — le toggle est sur le `.label`.
- **Animations YouTube** : thumbnails + click-to-load, pas d'iframes au chargement.
- **3D tilt** : desktop only via `(hover: hover)`, JS dans index.html et art.js.
- **Scroll listeners** : toujours throttler (100ms min) et utiliser `{ passive: true }`.
- **PDF covers** : charger sequentiellement (`await`), jamais en parallele.
