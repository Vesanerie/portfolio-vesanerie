# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-24 (18e revision)
> Auteur : Claude (audit automatique)
> Statut : **PROPRE** — 0 bug, 0 point critique

---

## Structure du projet

Portfolio vanilla HTML/CSS/JS. 6 pages + 404. O2Switch + GitHub Actions FTP. Assets Cloudflare R2.

### Pages

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 271 | Landing (h1, bio, CTA contact), slideshow bg lazy (2 img max en DOM), CV overlay (pdf.js defer+SRI), section A propos, scroll-to-top, contact card (`<div>`), JSON-LD Person + WebSite, skip-intro, 3D tilt cards |
| `art/index.html` | 521 | Portfolio art — edition (5 PDFs), illustration (pile-book), graphisme (6 items covers), motion design (CMP video 640px), animation (cinema mode : ecran + filmstrip thumbnails), tiktoks (4 embeds + CTA), lightbox, tools-card + trigger mobile, deal cards animation |
| `tech/index.html` | 117 | Laptop (ecran seul mobile), 5 apps grid, hover desc, fiche projet, demo iframe, tools-card + trigger mobile |
| `music/index.html` | 103 | iPod (320px), 7 tracks, tools-card + trigger mobile |
| `mentions-legales.html` | 67 | Mentions legales, layout 2 colonnes avec image |
| `404.html` | 34 | Page 404 personnalisee |
| `sitemap.xml` | 28 | Sitemap XML (5 URLs) |
| `robots.txt` | 5 | Allow all sauf /dist/ |
| `.htaccess` | 1 | ErrorDocument 404 |

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

### JavaScript

| Fichier | Lignes | Role |
|---|---|---|
| `js/main.js` | 72 | Theme toggle instantane (pas de transition), theme-color meta, scroll-to-top (throttled, passive), close cards on outside click, Escape shortcuts |
| `js/art.js` | 701 | `initPdfJs()`, `artProjects{}`, fiche art, pile/folders, lazy covers (sequentiels), media stop/restore, TikTok scroll (throttled), lightbox, PDF viewer, `setBackLink()`, history pushState/popstate, cinema mode (YouTube/video), 3D tilt, scroll reveal, deal animation skip |
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

### Architecture CSS (v17 → v18)
- **Theme toggle rectangulaire** : `border-radius: 4px` au lieu de `14px`, dot `2px` au lieu de `50%`
- **Scroll-to-top deplace en bas a gauche** pour eviter le conflit avec la tools card
- **Mentions legales deplacees en bas a droite**

### Performance (v18)
- **Halftone CSS supprime** (3 radial-gradients) → remplace par texture PNG (508 Ko) en repeat sur `body::before`
- **Transition body supprimee** — switch dark/light instantane (0 transition sur body)
- **Slideshow lazy** : max 2 images dans le DOM au lieu de 10. Les images sont creees/supprimees dynamiquement via JS
- **Texture/slideshow non affectes par le theme** — pas de changement d'opacite au switch, zero repaint sur les layers lourds
- **Selection de texte fluide** — plus de lag grace a la suppression du halftone CSS et des transitions body

### UX / Visuel (v18)
- **Animation "distribution de cartes"** sur la page Art : les 6 cards arrivent du bas avec rotation et rebond, delai 150ms entre chaque
- **Animation jouee une seule fois** par session (`sessionStorage`)
- **Cinema mode pour Animation** : grand ecran video + filmstrip de thumbnails en bas + fleches navigation + compteur "1/7"
- **Paper fold texture** sur les landing cards (homepage) et les pile-book cards (edition, graphisme, illustration)
- **Illustration** : passe de folder a pile-book pile-lg, tilt vers la droite
- **iPhone (Video)** repositionne entre Motion Design et Animation

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
- **Theme switch instantane** : pas de `transition` sur `background`, `color` ou `opacity` des layers lourds (texture, slideshow). Seules les CSS custom properties changent.
- **Texture background** : image PNG sur `body::before`, opacite fixe (ne change PAS au switch dark/light).
- **Slideshow lazy** : max 2 images dans le DOM, creees/supprimees dynamiquement.
- Quand on ajoute un nouveau composant CSS, creer un fichier dans `css/components/` et l'ajouter aux `<link>` des pages concernees.
- Quand on modifie `art/index.html`, **verifier que `defer` est present** sur pdf.js.
- Les PDFs comprimes sont dans `/Art/Fanzine/` avec suffixe `_compressé` ou `_compressed`.
- Le titre de chaque page doit commencer par "Valentin Mardoukhaev" pour le SEO.
- Le JSON-LD Person est sur la homepage — mettre a jour si nouveaux reseaux/projets.
- **Contact et tools cards** sont des `<div>` (pas `<button>`) — le toggle est sur le `.label`.
- **Cinema mode** (Animation) : ecran + filmstrip thumbnails + fleches/compteur. Click thumbnail = load YouTube iframe.
- **3D tilt** : desktop only via `(hover: hover)`, JS dans index.html et art.js.
- **Scroll listeners** : toujours throttler (100ms min) et utiliser `{ passive: true }`.
- **PDF covers** : charger sequentiellement (`await`), jamais en parallele.
- **Deal animation** : jouee une seule fois par session via `sessionStorage('art-dealt')`.
- **Paper fold** : texture sur pile-book (edition, graphisme, illustration) et landing cards. Pas sur film/phone.
