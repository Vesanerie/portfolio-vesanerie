# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-25 (19e revision)
> Auteur : Claude (audit automatique)
> Statut : **PROPRE** — 0 bug, 0 point critique

---

## Structure du projet

Portfolio vanilla HTML/CSS/JS. 6 pages + 404. O2Switch + GitHub Actions FTP. Assets Cloudflare R2.

### Pages

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 271 | Landing (h1, bio, CTA contact), slideshow bg lazy (2 img max en DOM), CV overlay (pdf.js defer+SRI, role="dialog"), section A propos, scroll-to-top, contact card (role="complementary"), JSON-LD Person + WebSite, skip-intro, 3D tilt cards |
| `art/index.html` | 521 | Portfolio art — edition (5 PDFs), illustration (pile-book), graphisme (6 items covers), motion design (CMP video 640px), animation (cinema mode : ecran + filmstrip + ARIA), tiktoks (4 embeds + CTA), lightbox (role="dialog"), tools-card + trigger mobile, deal cards animation |
| `tech/index.html` | 117 | Laptop (ecran seul mobile), 5 apps grid, hover desc, fiche projet, demo iframe, tools-card + trigger mobile |
| `music/index.html` | 103 | iPod (320px), 7 tracks, tools-card + trigger mobile |
| `mentions-legales.html` | 67 | Mentions legales, layout 2 colonnes avec image (loading="lazy") |
| `404.html` | 34 | Page 404 personnalisee |
| `sitemap.xml` | 28 | Sitemap XML (5 URLs) |
| `robots.txt` | 5 | Allow all sauf /dist/ |
| `.htaccess` | 1 | ErrorDocument 404 |
| `sw.js` | 100 | Service Worker — cache offline (network-first HTML, cache-first assets, R2 images) |

### CSS — Architecture modulaire

| Fichier | Lignes | Role | Charge par |
|---|---|---|---|
| `css/variables.css` | 26 | Custom properties light/dark | toutes les pages |
| `css/base.css` | 108 | Reset, body, texture background (R2), slideshow, back-link, legal-link, card-logo | toutes les pages |
| `css/components/theme-toggle.css` | 42 | Switch theme rectangulaire + responsive | toutes les pages |
| `css/components/landing.css` | 291 | Landing page, cards (paper fold texture), vinyl, animations + responsive | index |
| `css/components/cards.css` | 292 | CV card, contact card, tools card + trigger + responsive | index, art, tech, music |
| `css/components/about.css` | 93 | Section a propos + responsive | index |
| `css/components/scroll.css` | 58 | Scroll-to-top (bas gauche), scroll-reveal, pile-reveal + responsive | index, art, tech, music |
| `css/components/mentions.css` | 74 | Mentions legales + responsive | mentions-legales |
| `css/components/error-page.css` | 52 | Page 404 + responsive | 404 |
| `css/components/pile.css` | 346 | Pile view, pile-book (paper fold), sizes, covers, sheen, book-view, deal animation + responsive | art |
| `css/components/gallery.css` | 103 | Gallery masonry, lightbox + responsive | art |
| `css/components/folder.css` | 71 | Folder card (macOS) + responsive | art |
| `css/components/film.css` | 88 | Film strip card + responsive | art |
| `css/components/anim.css` | 253 | Cinema mode (ecran + filmstrip + nav), motion design + responsive | art |
| `css/components/tiktok.css` | 223 | Phone card, TikTok scroll/phone/nav + responsive | art |
| `css/components/art-fiche.css` | 82 | Fiche projet art + responsive | art |
| `css/tech.css` | 414 | Laptop, desktop grid, fiche projet, responsive | tech |
| `css/music.css` | 262 | iPod, LCD, click wheel, responsive | music |
| `css/pdf-viewer.css` | 157 | PDF reader, curseurs SVG, responsive | art |

### JavaScript — Architecture modulaire ES

| Fichier | Lignes | Role |
|---|---|---|
| `js/main.js` | 78 | Service Worker registration, theme toggle instantane, theme-color meta, scroll-to-top (throttled, passive), close cards on outside click, Escape shortcuts |
| `js/art.js` | 200 | Entry point module — imports tous les sous-modules, pile/folders, openBook/closeBook, covers sequentiels, media control, popstate |
| `js/art/state.js` | 25 | Shared state (DOM refs, flags) + setBackLink |
| `js/art/fiche.js` | 35 | artProjects data + showArtFiche/hideArtFiche |
| `js/art/lightbox.js` | 50 | Gallery lightbox (show/close, click, keyboard, focus) |
| `js/art/cinema.js` | 80 | Cinema mode (YouTube/video, thumbs, arrows, keyboard) |
| `js/art/tiktok.js` | 45 | TikTok scroll counter + arrows (throttled) |
| `js/art/pdf-viewer.js` | 165 | loadPdfAsBook (spreads, navigation, touch, ARIA) |
| `js/art/tilt.js` | 45 | 3D tilt desktop (hover:hover) + scroll reveal |
| `js/tech.js` | 79 | `projects{}` (5 apps), hover desc, fiche -> demo -> retour |
| `js/music.js` | 70 | Player iPod, auto-next, formatTime guard |

### Assets Cloudflare R2

| Fichier | Taille | Role |
|---|---|---|
| `Texture_landscape.png` | 508 Ko | Texture background repeat (600x451) |
| `Paper Fold.jpeg` | 86 Ko | Paper fold texture sur les cards |
| `Texture_small.png` | 518 Ko | Texture portrait (backup) |
| `Logo.png` | 6 Ko | Favicon + about |
| `CV_Valentin.pdf` | 147 Ko | CV PDF |

---

## Nouveautes depuis le dernier audit

### JavaScript modulaire ES (v18 → v19)
- **art.js decoupe en 8 modules ES** : state, fiche, lightbox, cinema, tiktok, pdf-viewer, tilt + entry point
- **`<script type="module">`** sur art/index.html — imports natifs sans bundler
- **Zero dependance circulaire** : topologie en etoile, entry point importe tout

### Accessibilite ARIA (v19)
- **Lightbox** : `role="dialog"`, `aria-modal="true"`, `aria-label`, `tabindex="-1"`, focus automatique a l'ouverture
- **Cinema mode** : `role="region"`, `aria-label` sur ecran/fleches/compteur, `aria-live="polite"` sur label et compteur, keyboard navigation (fleches)
- **PDF viewer** : `role="document"`, `aria-label` sur zones de clic, `aria-live="polite"` sur compteur de pages
- **CV overlay** : `role="dialog"`, `aria-modal="true"`
- **Contact card** : `role="complementary"`, `aria-label`
- **Art fiche** : `role="complementary"`, `aria-label`

### Performance (v19)
- **loading="lazy"** sur l'image mentions legales
- **Service Worker** : cache offline pour toutes les pages, CSS, JS. Images R2 mises en cache au premier chargement. HTML network-first, assets cache-first.

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
- sessionStorage deal-animation : **OK**
- setBackLink() avec `.pile-title` : **OK**
- history pushState/popstate : **OK** (folder + book)
- .htaccess 404 : **OK**
- Contact card `<div>` (pas `<button>`) : **OK**
- Tools card `<div>` + trigger mobile : **OK**
- Fermeture cards tap exterieur : **OK**
- theme-color dynamique : **OK**
- Cinema mode click-to-load YouTube : **OK**
- PDF covers sequentiels : **OK**
- 3D tilt desktop only (hover: hover) : **OK**
- Scroll listeners throttles + passive : **OK**
- CSS modulaire : 16 composants, 0 regle perdue : **OK**
- HTML `<link>` mis a jour (6 pages) : **OK**
- Theme switch instantane (0 transition body) : **OK**
- Slideshow lazy (2 img max DOM) : **OK**
- Texture background fixe (pas de changement dark/light) : **OK**
- Deal cards animation + skip session : **OK**
- Scroll-top bas gauche, mentions bas droite : **OK**
- JS modules ES (art.js → 8 modules) : **OK**
- ARIA lightbox/cinema/pdf/cv/contact/fiche : **OK**
- Service Worker registration (main.js) : **OK**
- Service Worker cache strategy (sw.js) : **OK**
- loading="lazy" images : **OK**

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
- Deploy **O2Switch** via **GitHub Actions FTP**. Push seulement quand l'utilisateur valide.
- **CSS modulaire** : `variables.css` → `base.css` → `components/*.css`. Chaque composant contient son propre responsive.
- **JS modulaire ES** : `js/art.js` est un entry point `type="module"` qui importe depuis `js/art/*.js`. Les autres scripts (main, tech, music) restent en `<script>` classique.
- **Theme switch instantane** : pas de `transition` sur `background`, `color` ou `opacity` des layers lourds (texture, slideshow). Seules les CSS custom properties changent.
- **Texture background** : image PNG sur `body::before`, opacite fixe (ne change PAS au switch dark/light).
- **Slideshow lazy** : max 2 images dans le DOM, creees/supprimees dynamiquement.
- **Service Worker** (`sw.js`) : HTML network-first, CSS/JS cache-first, images R2 cache-on-first-load. Incrementer `CACHE_NAME` a chaque mise a jour significative des assets.
- Quand on ajoute un nouveau composant CSS, creer un fichier dans `css/components/` et l'ajouter aux `<link>` des pages concernees.
- Quand on ajoute un nouveau module JS art, creer dans `js/art/` et importer dans `js/art.js`.
- Quand on modifie `art/index.html`, **verifier que `defer` est present** sur pdf.js.
- Les PDFs comprimes sont dans `/Art/Fanzine/` avec suffixe `_compressé` ou `_compressed`.
- Le titre de chaque page doit commencer par "Valentin Mardoukhaev" pour le SEO.
- Le JSON-LD Person est sur la homepage — mettre a jour si nouveaux reseaux/projets.
- **Contact et tools cards** sont des `<div>` (pas `<button>`) — le toggle est sur le `.label`.
- **Cinema mode** (Animation) : ecran + filmstrip thumbnails + fleches/compteur + ARIA. Click thumbnail = load YouTube iframe.
- **3D tilt** : desktop only via `(hover: hover)`, module `js/art/tilt.js`.
- **Scroll listeners** : toujours throttler (100ms min) et utiliser `{ passive: true }`.
- **PDF covers** : charger sequentiellement (`await`), jamais en parallele.
- **Deal animation** : jouee une seule fois par session via `sessionStorage('art-dealt')`.
- **Paper fold** : texture sur pile-book (edition, graphisme, illustration) et landing cards. Pas sur film/phone.
- **ARIA** : lightbox et CV overlay = `role="dialog"` + `aria-modal="true"`. Cinema = `role="region"`. Compteurs et labels dynamiques = `aria-live="polite"`.
