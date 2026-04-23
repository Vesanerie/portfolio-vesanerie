# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-22 (11e revision — audit total)
> Auteur : Claude (audit automatique)
> Statut : **PROPRE — 0 point restant**

---

## Structure du projet

Portfolio vanilla HTML/CSS/JS (aucun framework, aucun bundler). 4 pages. Heberge sur O2Switch (deploy GitHub Actions FTP). Assets media sur Cloudflare R2 (`pub-43a141f7a8b84a30a90fcc01da2114ca.r2.dev`).

### Fichiers

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 128 | Landing — titre anime (fadeInUp), bio, email, 3 cartes (Tech/Art/Musique) avec cardDrop anim, slideshow background (10 images), CV overlay (pdf.js defer+SRI), contact card slide-in |
| `art/index.html` | 368 | Portfolio art — pile principale (5 categories : edition, graphisme, illustration, animation, tiktoks), sous-dossiers imbriques avec `folderHistory[]`, PDF viewer fullscreen, lightbox fleches clavier, tools-card |
| `tech/index.html` | 127 | Page tech — laptop mockup, 5 apps (positions absolues), tooltips (hover:hover), fiche projet (nom/desc/stack/annee), demo iframe, tools-card |
| `music/index.html` | 93 | Page musique — iPod classic (320px), 7 tracks audio, play/pause, progress bar, auto-next, tools-card |
| `css/style.css` | 604 | Reset, `.hidden`, variables CSS (light/dark), halftone bg, slideshow bg, theme toggle, landing anims, vinyl disc, back-link, CV card/overlay, contact card, tools-card, responsive 600px/380px |
| `css/art.css` | 691 | pile-book (sm/md/lg/wide/sq), has-cover overlay (`var(--bg)`), gallery masonry (content-visibility), lightbox, pile-phone, pile-folder (macOS), pile-film (pellicule), anim-grid, tiktok scroll, book-view, responsive 700px/400px |
| `css/tech.css` | 394 | Laptop, desktop positions absolues, tooltips (hover:hover, hide mobile), fiche projet (topbar/content/demo-btn), site-view iframe, clavier/trackpad, responsive 600px |
| `css/pdf-viewer.css` | 158 | PDF reader fullscreen, curseurs SVG custom (fleches), spreads/single, responsive 700px, hover:none touch |
| `css/music.css` | 235 | iPod (320px), ecran LCD vert (#c8d4a2 / #2a3a1a dark), click wheel (200px), responsive 380px |
| `js/main.js` | 17 | `initTheme()` + `toggleTheme()` via `localStorage` + `data-theme` |
| `js/art.js` | 505 | Pile click → folder/book, `folderHistory[]` back navigation, lazy `loadCoversInView()` par vue (skip heavy PDFs via `data-skip-cover`), `stopMediaInFolder`/`restoreMediaInFolder` (iframes src swap + video pause/play), TikTok scroll (`getItemH()` dynamique + resize listener + iframe reset au changement), lightbox avec ArrowLeft/Right/Escape, `loadPdfAsBook` (spreads portrait/landscape/mobile single, scale 1/1.5, preload voisins), gallery-pdf canvas covers, Escape close book |
| `js/tech.js` | 88 | Objet `projects{}` avec 5 apps (name/desc/stack/year/type), navigation bureau → fiche → demo → retour |
| `js/music.js` | 71 | Player audio : click track → play, bouton central play/pause, timeupdate progress, `formatTime()` avec guard NaN, auto-next track, fin playlist |

### Architecture de navigation (page art)

```
Pile principale
├── Edition (5 PDFs : Culture Hot, Memoire Clown, Godzi ComiX, Spirale, Sauce)
├── Graphisme
│   ├── RK Brand (PDF single)
│   ├── Esport Team (gallery 12 images)
│   ├── Magnificat (lightbox image)
│   └── Flyer Perth (lightbox image)
├── Illustration
│   ├── Carnets (sous-dossier : Rose, Rouge, Jaune — 3 PDFs)
│   └── Gallery (16 images + 1 PDF canvas)
├── Animation (6 YouTube iframes + 1 video MP4)
└── TikToks (4 embeds dans phone mockup scroll-snap)
```

---

## Securite

- pdf.js CDN avec `integrity` SHA-512 + `crossorigin="anonymous"` sur les 2 pages qui le chargent (`index.html:90`, `art/index.html:18`)
- Pas d'injection possible : tous les `data-url`, `data-pdf`, `data-img` sont hardcodes dans le HTML
- Liens externes avec `target="_blank"` (pas de `rel="noopener"` mais les navigateurs modernes ajoutent `noopener` par defaut)

## Accessibilite

- Theme toggle : `<button>` avec `aria-label="Changer le theme"` sur les 4 pages
- Pile cards : tous des `<button>` (pile-book, pile-phone, pile-folder, pile-film)
- Contact card : `<button>` avec `aria-label="Contact"`
- Tools card : `<button>` avec `aria-label="Outils"` sur les 3 sous-pages
- TikTok fleches : `aria-label="Video precedente/suivante"`
- iPod play : `aria-label="Play/Pause"`
- Lightbox : fermable au clavier (Escape), navigation fleches
- Iframes : `title` sur toutes (TikTok, YouTube, site-iframe)
- Images : `alt` sur toutes les gallery images, `loading="lazy"`

## SEO

- `<meta name="description">` sur les 4 pages
- `<meta property="og:title/description/type">` sur les 4 pages
- `<link rel="icon" href="favicon.png">` sur les 4 pages
- `<title>` unique par page

## Performance

- pdf.js `defer` sur les 2 pages qui le chargent
- Lazy loading covers par vue (`loadCoversInView` ne charge que la vue visible)
- `data-skip-cover` pour eviter de telecharger les PDFs lourds (288MB+)
- PDF render scale reduit sur mobile (`scale: 1` au lieu de `1.5`)
- `content-visibility: auto` sur les images gallery
- `loading="lazy"` sur toutes les images
- Cover JPEG quality 0.6 pour les thumbnails PDF
- Slideshow images reutilisent les URLs R2 deja en cache de la page art

---

## Points corriges au total (40+)

Depuis le premier audit du 2026-04-21, tous les points suivants ont ete corriges :

- Bugs JS : double handler clavier PDF, fuite memoire touch, setTimeout couple CSS, `tiktokWraps` avant assignation, double handler CV, `itemH` hardcode mobile
- Code mort : pdf-viewer.js, scaffold rsbuild, systeme livre HTML (~290 lignes), `isAnimating`, `pdfCurrentPage`, `carnetsView`, `.gallery-pdf-label`
- Accessibilite : `<button>` pour toggle/pile-book/contact, aria-labels, lightbox clavier, iframes title
- Securite : SRI sur pdf.js (2 pages)
- SEO : meta description, OG tags, favicon (4 pages)
- Performance : defer pdf.js (2 pages), lazy covers, content-visibility, mobile scale
- CSS : `.back-link` unifie, `.landing` padding propre, contact-card mobile deduplique, `.has-cover` avec `var(--bg)`, `.hidden` centralise, selecteur `body > *:not()` remplace, overflow tiktok, breakpoint 400px
- Securite : CV overlay handler unique, pas de `!important` sur cv-overlay

---

## Corrections RESTANTES

**Aucune.** Le projet est propre.

---

## Consignes pour tout agent futur

- Le site est **vanilla HTML/CSS/JS** — pas de framework, pas de bundler. Garder ce style.
- Les assets media sont sur **Cloudflare R2** (`pub-43a141f7a8b84a30a90fcc01da2114ca.r2.dev`).
- Le deploy est sur **O2Switch** via GitHub Actions FTP.
- Quand on modifie `art/index.html`, **toujours verifier que `defer` est present** sur la balise `<script>` pdf.js (regression recurrente dans le passe).
- Quand on modifie `index.html`, verifier que le script pdf.js garde `defer` + `integrity` + `crossorigin`.
- Les PDFs lourds (>50MB) doivent avoir `data-skip-cover` pour ne pas etre telecharges comme thumbnails.
