# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-22 (10e revision — audit complet pour nouvel agent)
> Auteur : Claude (audit automatique)
> Statut : **quasi parfait** — 1 seul point restant

---

## Structure du projet

Le site est un portfolio vanilla HTML/CSS/JS (aucun framework, aucun bundler). 4 pages, hebergees sur O2Switch, assets sur Cloudflare R2.

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 128 | Landing — titre anime, bio, email, 3 cartes (Tech/Art/Musique), slideshow background, CV overlay (pdf.js defer+SRI), contact card |
| `art/index.html` | 368 | Portfolio art — pile principale (5 categories), sous-dossiers imbriques (edition 5 PDFs, graphisme 4 items, illustration gallery 16 images + carnets, esport gallery 12 images, animation 6 YouTube + 1 video, tiktoks 4 embeds), PDF viewer fullscreen, lightbox fleches, tools-card |
| `tech/index.html` | 127 | Page tech — laptop mockup, 5 apps (positions absolues) avec tooltips (hover:hover), fiche projet (nom/desc/stack/annee), demo iframe, tools-card |
| `music/index.html` | 93 | Page musique — iPod classic, 7 tracks audio, play/pause, progress, auto-next, tools-card |
| `css/style.css` | 604 | Reset, `.hidden`, variables CSS (light/dark), halftone bg, slideshow bg, theme toggle, landing (fadeInUp/cardDrop anims), vinyl, back-link, CV card/overlay, contact card, tools-card, responsive 600px/380px |
| `css/art.css` | 691 | Pile-book (sm/md/lg/wide/sq), has-cover overlay, gallery masonry (content-visibility), lightbox, pile-phone, pile-folder (macOS), pile-film (pellicule), anim-grid, tiktok scroll, book-view, responsive 700px/400px |
| `css/tech.css` | 394 | Laptop, desktop positions absolues, tooltips (hover:hover, hide mobile), fiche projet, site-view iframe, clavier/trackpad, responsive 600px |
| `css/pdf-viewer.css` | 158 | PDF reader fullscreen, curseurs SVG custom, spreads/single, responsive 700px, hover:none touch |
| `css/music.css` | 235 | iPod (320px), ecran LCD vert, click wheel, responsive 380px |
| `js/main.js` | 17 | `initTheme()` + `toggleTheme()` via localStorage |
| `js/art.js` | 505 | Pile click → folder/book, `folderHistory[]` navigation, lazy `loadCoversInView()` (skip heavy PDFs via `data-skip-cover`), `stopMediaInFolder`/`restoreMediaInFolder` (iframes + video), TikTok scroll (`getItemH()` dynamique + resize), lightbox avec fleches clavier, `loadPdfAsBook` (spreads portrait/landscape/mobile single, scale 1/1.5), gallery-pdf canvas covers, Escape close |
| `js/tech.js` | 88 | Objet `projects{}` avec 5 apps, fiche projet → demo iframe, navigation bureau ↔ fiche ↔ site |
| `js/music.js` | 71 | Player audio : click track → play, bouton central play/pause, timeupdate progress, auto-next, `formatTime()` avec guard NaN |

---

## Historique des corrections (40+ points corriges au total)

Points majeurs corriges depuis le premier audit :
- Double handler clavier PDF, fuite memoire touch, setTimeout couple CSS
- Code mort supprime (pdf-viewer.js, scaffold rsbuild, systeme livre HTML ~290 lignes JS+CSS)
- Accessibilite : `<button>` pour theme-toggle, pile-book, contact-card + aria-labels
- Securite : SRI + crossorigin sur pdf.js (art + landing)
- SEO : meta description, OG tags, favicon sur les 4 pages
- Performance : defer pdf.js landing, lazy covers, scale mobile reduit, content-visibility
- Bugs fixes : overflow tiktok, `.landing-card` duplique, `isAnimating` mort, `pdfCurrentPage` mort, `carnetsView` mort, `.has-cover` couleur hardcodee, `.gallery-pdf-label` CSS mort, selecteur `body > *:not()` fragile, double handler CV, `tiktokWraps` avant assignation, padding landing duplique, contact-card mobile duplique
- `.hidden` centralise dans style.css, `.back-link` unifie

---

## Correction RESTANTE

### 1. PERF — pdf.js sans `defer` sur art/index.html

- **Fichier** : `art/index.html` ligne 18
- **Probleme** : `<script src="https://cdnjs.cloudflare.com/.../pdf.min.js" integrity="..." crossorigin="anonymous"></script>` — pas de `defer`. Le script (~800KB) bloque le rendu dans le `<head>`. La page landing a bien `defer` (ligne 90 de `index.html`), mais pas la page art.
- **Pourquoi c'est safe** : `art.js` teste `typeof pdfjsLib !== 'undefined'` (ligne 10) et tous les appels PDF sont asynchrones. Ajouter `defer` ne casse rien.
- **Correction** : Ajouter `defer` apres `src` :
  ```html
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" integrity="sha512-q+4liFwdPC/bNdhUpZx6aXDx/h77yEQtn4I1slHydcbZK34nLaR3cAeYSJshoxIOq3mjEf7xJE8YWIUHMn+oCQ==" crossorigin="anonymous"></script>
  ```
- **Priorite** : MOYENNE
- **Note** : Ce point revient a chaque audit car le `defer` est retire lors de modifications de la page. Verifier systematiquement apres toute modification de `art/index.html`.

---

## Resume

| Priorite | Probleme | Effort |
|---|---|---|
| **MOYENNE** | pdf.js sans `defer` sur `art/index.html:18` | Ajouter 1 mot |

Le reste du projet est propre. Aucun bug JS, aucun code mort, accessibilite correcte, SEO en place, responsive fonctionnel.

---

## Consignes pour l'agent qui corrige

- Ajouter `defer` sur la balise script pdf.js de `art/index.html` ligne 18.
- Ne changer **rien d'autre**.
- Tester que la page art fonctionne (ouvrir un PDF, naviguer les pages).
- **Attention** : ne pas retirer `integrity` ni `crossorigin="anonymous"` en modifiant la ligne.
