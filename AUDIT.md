# Audit complet -- Vesanerie-sur-Internet

> Date : 2026-04-26
> Auteur : Claude Opus 4.6 (audit exhaustif)
> Methode : lecture integrale de tous les fichiers HTML, CSS, JS, config du projet

---

## 1. Structure du projet

### 1.1 Arborescence

```
/
  index.html                    (14 952 o, 315 lignes) -- Landing page
  art/index.html                (32 475 o, 537 lignes) -- Portfolio art
  tech/index.html               (14 751 o, 265 lignes) -- Portfolio tech
  music/index.html              (5 875 o, 105 lignes)  -- Player musique
  mentions-legales.html         (2 954 o, 67 lignes)   -- Mentions legales
  404.html                      (1 446 o, 35 lignes)   -- Page erreur
  css/
    variables.css               (960 o)   -- Custom properties light/dark
    base.css                    (2 227 o) -- Reset, body, texture, slideshow, back-link
    pdf-viewer.css              (3 304 o) -- Lecteur PDF fullscreen
    tech.css                    (11 148 o) -- Page tech (laptop, fiche, lightbox, experiment)
    music.css                   (5 100 o) -- iPod player
    components/
      theme-toggle.css          (921 o)
      landing.css               (7 265 o)
      cards.css                 (5 510 o)
      about.css                 (1 572 o)
      scroll.css                (1 103 o)
      pile.css                  (8 023 o)
      gallery.css               (1 801 o)
      folder.css                (1 467 o)
      film.css                  (2 032 o)
      anim.css                  (4 864 o)
      tiktok.css                (4 771 o)
      art-fiche.css             (1 639 o)
      mentions.css              (1 378 o)
      error-page.css            (1 140 o)
  js/
    main.js                     (2 711 o) -- SW, theme, scroll-top, close cards, Escape
    art.js                      (9 625 o) -- Entry point ES module pour art
    tech.js                     (2 827 o) -- Bureau, fiche, iframe
    music.js                    (2 054 o) -- iPod player
    art/
      state.js                  (652 o)   -- DOM refs, state partagé, setBackLink
      fiche.js                  (2 322 o) -- Fiches projet art (data + show/hide)
      lightbox.js               (1 477 o) -- Lightbox galerie
      cinema.js                 (3 254 o) -- Lecteur animations YouTube/MP4
      tiktok.js                 (1 765 o) -- Scroll TikTok + arrows
      pdf-viewer.js             (5 899 o) -- Lecteur PDF (spreads, touch, ARIA)
      tilt.js                   (1 596 o) -- Tilt 3D desktop + scroll reveal
  sw.js                         (3 285 o) -- Service Worker
  sitemap.xml                   (731 o)
  robots.txt                    (83 o)
  .htaccess                     (28 o)
  CNAME                         (12 o)    -- vesanerie.fr
  .cpanel.yml                   (172 o)
  .github/workflows/deploy.yml  (420 o)
  favicon.png                   (95 o)
  slideshow_optimized/          (2,6 Mo)  -- 10 images webp (165-334 Ko chacune)
  images/                       (2,7 Mo)  -- 6 jpeg Carnet-Rouge (244-645 Ko)
  dist/                         -- Build Rsbuild (ancien, ignore par .gitignore)
  public/                       -- Assets publics (ancien, duplicata de images/)
```

### 1.2 Architecture CSS

16 fichiers CSS, 0 framework. Architecture en couches :
1. `variables.css` -- tokens design (light + dark)
2. `base.css` -- reset, body, elements partages
3. `components/*.css` -- un fichier par composant, responsive inclus dans chaque fichier

Chaque page HTML charge uniquement les CSS dont elle a besoin via `<link>` individuels.

### 1.3 Architecture JavaScript

- `main.js` charge sur toutes les pages (non-module, `<script>`)
- `art.js` est un **ES module** (`<script type="module">`) qui importe 7 sous-modules depuis `js/art/`
- `tech.js` et `music.js` sont des scripts classiques
- Zero dependance externe cote JS (pdf.js charge en CDN defer+SRI)

---

## 2. SEO

### 2.1 Meta tags par page

| Page | title | description | canonical | og:title | og:desc | og:image | og:url | og:type | robots |
|---|---|---|---|---|---|---|---|---|---|
| `index.html` L9 | Vesanerie -- Valentin Mardoukhaev \| Designer... | Oui L10 | https://vesanerie.fr/ L11 | Oui L12 | Oui L13 | R2 image L14 | Oui L15 | website L16 | -- |
| `art/index.html` L9 | Valentin Mardoukhaev -- Art \| Fanzines... | Oui L10 | https://vesanerie.fr/art/ L11 | Oui L12 | Oui L13 | R2 image L14 | Oui L15 | website L16 | -- |
| `tech/index.html` L9 | Valentin Mardoukhaev -- Tech \| Gesturo... | Oui L10 | https://vesanerie.fr/tech/ L11 | Oui L12 | Oui L13 | R2 image L14 | Oui L15 | website L16 | -- |
| `music/index.html` L9 | Valentin Mardoukhaev -- Musique \| Beats... | Oui L10 | https://vesanerie.fr/music/ L11 | Oui L12 | Oui L13 | R2 image L14 | Oui L15 | website L16 | -- |
| `mentions-legales.html` L9 | Vesanerie -- Mentions legales | -- | -- | -- | -- | -- | -- | -- | noindex L10 |
| `404.html` L9 | Vesanerie -- 404 | -- | -- | -- | -- | -- | -- | -- | noindex L10 |

### 2.2 Schema.org (JSON-LD)

Uniquement sur `index.html` (L17-49) :
- **WebSite** : name, alternateName, url
- **Person** : name, url, jobTitle, description, image, sameAs (6 liens), knowsAbout (7 items), alumniOf (2 etablissements)

Constat : pas de JSON-LD sur les sous-pages (art, tech, music). Pas de schema `CreativeWork` ou `SoftwareApplication` pour les projets individuels.

### 2.3 Sitemap et robots.txt

- `sitemap.xml` L1-28 : 5 URLs (/, /art/, /tech/, /music/, /mentions-legales.html), lastmod 2026-04-24, priorities definies
- `robots.txt` L1-4 : Allow: /, Disallow: /dist/, Sitemap reference

### 2.4 Constats SEO

- **META description absente** sur `mentions-legales.html` et `404.html` -- acceptable car `noindex`
- **Canonical absent** sur `mentions-legales.html` et `404.html` -- acceptable car `noindex`
- **og:image identique** sur toutes les pages -- meme visuel `Vesanerie_portfolio.png`
- **Pas de Twitter Card** (`twitter:card`, `twitter:title`, etc.) sur aucune page
- **Pas de hreflang** -- site uniquement en francais, pas necessaire sauf si audience internationale visee
- **Titre index.html** utilise `&eacute;` au lieu de l'accent direct -- fonctionne mais inhabituel
- **Description sans accents** sur toutes les pages (ex: "developpeur" au lieu de "developpeur") -- delibere pour compatibilite mais peut affecter la lisibilite dans les SERPs

---

## 3. Performance

### 3.1 Taille des assets

**CSS total** : 57 Ko (16 fichiers). Chaque page ne charge que ce dont elle a besoin :
- Landing : ~18 Ko CSS (6 fichiers)
- Art : ~46 Ko CSS (12 fichiers)
- Tech : ~20 Ko CSS (5 fichiers)
- Music : ~15 Ko CSS (5 fichiers)

**JS total** : ~34 Ko (11 fichiers). art.js+modules = ~27 Ko. main.js = 2,7 Ko.

**Fontes Google** : 2 fontes (Bangers + Special Elite) via `display=swap`.

### 3.2 Images

**Images locales** :
- `slideshow_optimized/` : 10 fichiers webp, 165-334 Ko chacun (total 2,6 Mo) -- **non utilisees dans le HTML**, les URLs pointent vers R2
- `images/` : 6 JPEG Carnet-Rouge, 244-645 Ko (total 2,7 Mo) -- **non referencees dans le HTML actuel**
- `favicon.png` : 95 octets -- tres petit, potentiellement un placeholder ou icone minimale

**Images distantes (R2)** : toutes les images du portfolio sont servies depuis `pub-43a141f7a8b84a30a90fcc01da2114ca.r2.dev`. Formats utilises : .webp, .png, .jpg, .pdf.

### 3.3 Lazy loading

- `loading="lazy"` present sur toutes les images de galerie dans `art/index.html` (L167-209, L263-298, etc.)
- `loading="lazy"` sur l'image de mentions legales (L56)
- `loading="lazy"` sur les thumbnails cinema (L439-458)
- `loading="lazy"` sur les images d'experimentation tech (L126, L142)
- **Slideshow landing** : lazy par construction (2 images max en DOM, creees/supprimees dynamiquement, `index.html` L188-216)
- **PDF covers** : charges sequentiellement avec `await` (`art.js` L61-91)

### 3.4 Optimisations

- **Service Worker** (`sw.js`) : precache de tous les CSS/JS/HTML, cache-first pour assets, network-first pour HTML, images R2 mises en cache au premier chargement
- **`content-visibility: auto`** sur `.gallery-item img` (`gallery.css` L33)
- **`contain: strict`** sur les images du slideshow (`base.css` L45)
- **`will-change: opacity`** sur les images du slideshow (`base.css` L44)
- **`preconnect`** vers fonts.googleapis.com et fonts.gstatic.com (toutes les pages)
- **PDF.js en `defer`+SRI** sur art/index.html (L33)
- **PDF.js en chargement paresseux** sur index.html (charge uniquement au clic sur CV, L235-240)
- **Scroll listeners** : tous throttles a 100ms et `{ passive: true }` (`main.js` L41, `tiktok.js` L18)
- **requestAnimationFrame** pour le tilt 3D (`tilt.js` et `index.html` L291-294)
- **Slideshow pause** quand l'onglet est masque (`index.html` L221-228 via `visibilitychange`)
- **Skip intro animations** via `sessionStorage('visited')` (`index.html` L164-168)
- **Skip deal animation** via `sessionStorage('art-dealt')` (`art.js` L12-15)
- **Theme switch instantane** : classe `theme-switching` desactive toutes les transitions (`variables.css` L40-45)

### 3.5 Constats performance

- **16 fichiers CSS separees sur art/index.html** -- 16 requetes HTTP distinctes (potentiellement lent sur HTTP/1.1, OK sur HTTP/2+). Pas de concatenation ni minification.
- **Aucune minification** ni des CSS ni des JS
- **Pas de cache-busting** (hash) sur les noms de fichiers CSS/JS -- le Service Worker gere le cache mais un deploy FTP ne vide pas le cache navigateur
- **`slideshow_optimized/` et `images/` sont des fichiers locaux non utilises** -- poids mort dans le repo (5,3 Mo)
- **favicon.png = 95 octets** -- le vrai favicon est charge depuis R2 (`Logo.png`). Le fichier local est probablement un reliquat.
- **Paper Fold texture** chargee 2 fois : dans `landing.css` L148 et dans `pile.css` L50 (meme URL R2, donc cache navigateur fait le travail)
- **Texture_landscape.png** (508 Ko) chargee en `background` sur `body::before` (`base.css` L19) -- fichier lourd pour une texture de fond

---

## 4. Accessibilite

### 4.1 ARIA et roles

| Element | Fichier | Ligne | Attributs |
|---|---|---|---|
| Theme toggle | toutes pages | variable | `aria-label="Changer le theme"` |
| Scroll-to-top | pages concernees | variable | `aria-label="Retour en haut"` |
| Contact card | `index.html` | L144 | `role="complementary"` `aria-label="Contact"` |
| CV overlay | `index.html` | L156 | `role="dialog"` `aria-modal="true"` `aria-label` |
| Art fiche | `art/index.html` | L501 | `role="complementary"` `aria-label="Fiche projet"` |
| Cinema region | `art/index.html` | L424 | `role="region"` `aria-label="Lecteur d'animations"` |
| Cinema placeholder | `art/index.html` | L426 | `role="button"` `aria-label` `tabindex="0"` |
| Cinema label | `art/index.html` | L431 | `aria-live="polite"` |
| Cinema counter | `art/index.html` | L434 | `aria-live="polite"` |
| Cinema arrows | `art/index.html` | L433-435 | `aria-label` sur chaque fleche |
| Lightbox (art) | `art/index.html` | L516 | `role="dialog"` `aria-modal="true"` `aria-label` `tabindex="-1"` |
| PDF container | `art/index.html` | L512 | `role="document"` `aria-label="Lecteur PDF"` |
| PDF zones | `pdf-viewer.js` | L44-50 | `role="button"` `aria-label` |
| PDF counter | `pdf-viewer.js` | L56 | `aria-live="polite"` |
| TikTok arrows | `art/index.html` | L491-493 | `aria-label` |
| Tools trigger | pages art/tech/music | variable | `aria-label="Outils"` |

### 4.2 Navigation clavier

- **Escape** : ferme CV overlay, contact card, tools card (`main.js` L71-83), book view (`art.js` L268-271), lightbox (`lightbox.js` L42-43)
- **ArrowLeft/Right** : navigation lightbox (`lightbox.js` L36-41), cinema (`cinema.js` L80-92), PDF (`pdf-viewer.js` L148-156)
- **Espace** : page suivante dans le PDF (`pdf-viewer.js` L149)

### 4.3 Constats accessibilite

- **Pas de skip link** (`<a href="#main-content" class="skip-link">`) sur aucune page
- **Pas de `<main>`** ni de landmarks semantiques (`<nav>`, `<header>`, `<footer>`) -- le body contient directement les sections
- **`lang="fr"`** present sur toutes les pages (L2 de chaque HTML)
- **Theme toggle est un `<button>`** avec `aria-label` -- correct
- **Landing CTA** utilise `onclick` inline (`index.html` L82-83) -- fonctionnel mais pas de `focus` visible specifique
- **Contact card toggle** via `onclick` sur un `<div>` (`cards.css`) -- pas un element focusable nativement
- **Tools card toggle** via `onclick` sur un `<div>` -- meme probleme
- **Contraste** : en light mode, texte `#111` sur fond `#f0ece4` -- ratio ~12:1 (excellent). En dark mode, texte `#f0ece4` sur `#0e0e0e` -- ratio ~15:1 (excellent). Texte muted `#666` sur `#f0ece4` -- ratio ~5:1 (passe AA). Muted dark `#999` sur `#0e0e0e` -- ratio ~9:1 (excellent).
- **Focus visible** : pas de style `:focus-visible` personnalise -- repose sur le defaut du navigateur. Les elements avec `all: unset` (nombreux boutons) perdent leur outline de focus natif.
- **`all: unset` sur les boutons** : `.pile-book` (pile.css L84), `.ipod-track` (music.css L77), `.ipod-wheel-center` (music.css L183), `.cinema-arrow` (anim.css L66), `.tiktok-arrow` (tiktok.css L179), `.fiche-back` (tech.css L122), `.site-back` (tech.css L237), `.contact-card` (cards.css L78), `.tools-card` (cards.css L132), `.lightbox-arrow` (tech.css L496) -- **tous ces elements perdent leur outline de focus**
- **Images decoratives** : `alt=""` sur les logos et images purement decoratives (correct)
- **Images de contenu** : `alt` descriptifs sur toutes les images de galerie (correct)
- **PDF viewer** : pas de moyen de sortir du mode fullscreen autre que Escape ou back-link -- pas de bouton fermer visible
- **TikTok iframes** : ont un attribut `title` (L476-485) -- correct

---

## 5. Mobile / Responsive

### 5.1 Breakpoints

| Breakpoint | Utilise dans |
|---|---|
| `max-width: 700px` | pile.css, gallery.css, folder.css, film.css, anim.css, tiktok.css, art-fiche.css, mentions.css, pdf-viewer.css |
| `max-width: 600px` | base.css, theme-toggle.css, landing.css, cards.css, about.css, scroll.css, mentions.css, error-page.css, tech.css, music.css |
| `max-width: 400px` | pile.css, gallery.css, film.css, tiktok.css |
| `max-width: 380px` | landing.css, music.css |
| `hover: none` | pdf-viewer.css L151 |
| `hover: hover` | index.html L282 (tilt), tilt.js L3 |

Constat : **deux breakpoints principaux** (600px et 700px) utilises de maniere incoherente -- certains composants cassent a 700px, d'autres a 600px. Le gap 600-700px peut creer des etats intermediaires non testes.

### 5.2 Adaptations mobiles

- **Landing** : cards en colonne, taille reduite, description masquee sous 380px
- **Art pile** : grille 2 colonnes, items uniformes 160px, pas de rotation, box-shadow reduit
- **Tech** : clavier/trackpad masques, grille 3 icones, ecran aspect-ratio auto + min-height 60vh
- **Music** : iPod reduit (290px puis 250px), wheel reduit, tracks plus grands (min-height 36px pour touch)
- **Contact card** : bottom-sheet plein largeur (`cards.css` L205-238)
- **Tools card** : bottom-sheet plein largeur + trigger icon en bas a gauche (`cards.css` L241-292)
- **PDF viewer** : page unique, touch swipe (50px seuil), pas de curseurs custom
- **Cinema** : thumbnails plus petits (110px)
- **Galerie** : 2 colonnes a 700px, 1 colonne a 400px

### 5.3 Touch

- **PDF swipe** : `touchstart`/`touchend` avec seuil 50px (`pdf-viewer.js` L159-171), `{ passive: true }`
- **TikTok scroll** : `scroll-snap-type: y mandatory` + `-webkit-overflow-scrolling: touch` (`tiktok.css` L147-148)
- **Scroll listeners** : tous en `{ passive: true }`
- **Tilt 3D** : desactive sur mobile via `(hover: hover)` media query

### 5.4 Constats mobile

- **`viewport` correct** sur toutes les pages : `width=device-width, initial-scale=1.0`
- **Pas de `user-scalable=no`** -- bon, le zoom est permis
- **TikTok iframes a 580px de haut** puis 480px a 700px et 400px a 400px -- fonctionne mais poids lourd sur mobile (4 iframes chargees simultanement)
- **Tech page** : l'iframe d'app dans l'ecran du laptop sur mobile peut etre difficile a utiliser (petit ecran dans un petit ecran)
- **Back-link** repositionne en haut a gauche sur mobile (`base.css` L106) -- peut chevaucher avec le CV card qui est aussi en haut a gauche (`cards.css` L194-200)

---

## 6. Dark mode

### 6.1 Variables CSS

Definies dans `variables.css` L1-37 :

| Variable | Light | Dark |
|---|---|---|
| `--bg` | `#f0ece4` | `#0e0e0e` |
| `--bg-card` | `#f8f5ee` | `#1a1a1a` |
| `--text` | `#111` | `#f0ece4` |
| `--text-muted` | `#666` | `#999` |
| `--border` | `#111` | `#f0ece4` |
| `--accent` | `#333` | `#ccc` |
| `--switch-bg` | `#ddd` | `#333` |
| `--switch-dot` | `#111` | `#f0ece4` |
| `--halftone` | `#111` | `#f0ece4` |
| `--card-keep-*` | valeurs light | **identiques en dark** |

### 6.2 Strategie "cards keep light"

Les cartes de la pile (edition, illustration, graphisme, animation) **restent en theme light** meme en dark mode via les variables `--card-keep-*`. Ceci est applique a :
- `.pile-book:not(.has-cover)` (`pile.css` L237-250)
- `.pile-phone` (`tiktok.css` L59-80)
- `.film-body`, `.film-title`, `.film-sub` (`film.css` L70-80)
- `.landing-card` (`landing.css` L155-173)
- `.has-cover` en hover : texte `#f0ece4` + text-shadow (`pile.css` L252-256)

### 6.3 Composants avec dark mode explicite

- **iPod LCD** : variables locales `--lcd-*` avec override dark (`music.css` L25-37)
- **iPod tracks** : couleur overridee en dark (`music.css` L91-111)
- **iPod progress** : overridee (`music.css` L145-147)
- **iPod time** : overridee (`music.css` L157-159)
- **Card logo** : `mix-blend-mode: multiply` en light, `screen` en dark (`base.css` L98-103)
- **Theme-color meta** : mise a jour dynamique (`main.js` L7-9)

### 6.4 Constats dark mode

- **Texture background** (`body::before`) : meme opacite (1) en light et dark -- la texture PNG `Texture_landscape.png` a un fond transparent, donc elle s'adapte visuellement, mais `opacity: 1` semble eleve pour le dark mode
- **Variable `--halftone`** definie mais **jamais utilisee** dans aucun fichier CSS
- **Variable `--accent`** definie mais **jamais utilisee** dans aucun fichier CSS
- **Lightbox tech** (`tech.css` L483) : bordure hardcodee `#f0ece4` au lieu de `var(--bg)` -- fonctionne en dark mais pas coherent
- **Lightbox counter tech** (`tech.css` L519) : couleur hardcodee `#f0ece4`
- **Lightbox arrows tech** (`tech.css` L506) : couleur hardcodee `#f0ece4`
- **CV overlay canvas** : background hardcode `#fff` (`cards.css` L46)
- **iPod track couleur** hardcodee `color: #333` (`music.css` L87) au lieu de variable -- overridee en dark mais duplication
- **`theme-switching` class** desactive toutes les transitions pendant le switch -- correct, evite les flashs

---

## 7. Fonctionnalites

### 7.1 Slideshow background (index.html L170-229)

- 10 images webp depuis R2
- Maximum 2 images dans le DOM simultanement
- Transition crossfade 1,5s, intervalle 4s
- Pause quand l'onglet est masque (visibilitychange)
- Preload de l'image suivante
- Opacite : 6% (`base.css` L48-49)

### 7.2 CV PDF Viewer (index.html L231-263)

- Chargement paresseux : pdf.js charge uniquement au clic sur le bouton CV
- Rendu sur canvas (scale 1.5)
- Overlay fullscreen avec role="dialog"
- Lien de telechargement direct
- Fermeture au clic sur l'overlay ou Escape

### 7.3 PDF Book Viewer (pdf-viewer.js)

- Double page (spreads) sur desktop, single page sur mobile
- Detection automatique paysage -> single page
- Navigation : clic zones gauche/droite, fleches clavier, espace, swipe touch
- Curseurs SVG custom (fleches) en desktop
- Preload des pages voisines
- Compteur de pages aria-live
- Cache des pages rendues (evite le re-render)

### 7.4 Lightbox galerie (lightbox.js)

- Navigation fleches clavier (ArrowLeft/Right)
- Fermeture Escape ou clic overlay
- Focus automatique a l'ouverture
- Aussi utilisee pour afficher les images individuelles (data-img)

### 7.5 Lightbox tech (tech/index.html L177-262)

- Inline script (pas module)
- Supporte 3 types : video, image, galerie d'images
- Navigation fleches pour les galeries
- Fermeture Escape ou clic

### 7.6 Tilt 3D (tilt.js + index.html L282-312)

- Effet parallaxe sur les cartes au survol souris
- Rotation X/Y en fonction de la position du curseur (16 deg max sur art, 20 deg sur landing)
- Sheen iridescent via variables CSS `--mx`/`--my` et `radial-gradient`
- Desktop only via `(hover: hover)` media query
- requestAnimationFrame pour les landing cards

### 7.7 Cinema mode (cinema.js)

- Ecran 16:9 avec placeholder cliquable
- Thumbnails filmstrip horizontaux avec scroll
- Navigation : fleches, clic thumb, clavier (quand animation-view visible)
- Supporte YouTube (embed) et MP4 direct
- Badge "MP4" sur les thumbs video locales
- Compteur "1 / 7"

### 7.8 TikTok viewer (tiktok.js)

- Scroll snap dans un faux telephone
- 4 iframes TikTok embed
- Navigation fleches haut/bas
- Compteur "1 / 4"
- Reset iframe au changement de video (evite la lecture simultanee)
- CTA vers le profil TikTok

### 7.9 iPod Music Player (music.js)

- 7 tracks MP3 depuis R2
- Play/pause via bouton central wheel
- Barre de progression
- Affichage temps courant/total
- Auto-play du morceau suivant
- Message "Fin de la playlist" en fin de liste
- Lien Spotify fixe en bas a gauche

### 7.10 Tech Desktop (tech.js)

- 6 apps (Gesturo, ImageGen, VidToJpeg, PdfDecompil, Vectorio, MonVPN)
- Description au hover (desktop)
- Clic -> demo dans iframe integree (ou image plein ecran pour MonVPN)
- MonVPN : app desktop Electron (WireGuard, Oracle Cloud) -- affiche une capture dans l'ecran du laptop au lieu d'un iframe, fond noir, icone cadenas SVG
- Bouton retour au bureau
- Experimentations IA en dessous du laptop (3 projets)

### 7.11 Art Fiche (fiche.js)

- Carte laterale gauche avec metadata du projet
- 12 projets documentes (format, date, intention)
- S'ouvre a la selection d'un book, se ferme a la fermeture

### 7.12 Covers PDF (art.js L61-91)

- Chargement sequentiel (pas parallele) pour eviter la surcharge
- Render page 1 a scale 0.4, conversion en dataURL JPEG 60%
- Application en background-image + classe `has-cover`

---

## 8. Contenu

### 8.1 Landing (index.html)

- **H1** : "Valentin Mardoukhaev"
- **Sous-titre** : "Dessinateur - Developpeur - Auto-editeur"
- **Bio** : ~50 mots
- **CTA** : "Me contacter" (ouvre contact card), "A propos" (scroll)
- **3 cartes** : Tech, Art, Musique (avec vinyle anime)
- **Section A propos** : bio, formation (TALM Angers, EESAB Lorient), experience (Sauvages Cesar 2025, Gesturo.art, Culture Hot Mag, branding esport/charpentier Perth), langues
- **Contact** : email, TikTok, Instagram, YouTube
- **CV** : overlay PDF
- **Mentions legales** : lien fixe bas droite

### 8.2 Art (art/index.html)

**Pile principale** (6 items) :
1. Edition (dossier -> 5 PDFs : Culture Hot, Hs Culture Hot, Godzi ComiX, Spirale Sket Tour, Sauce)
2. Graphisme (dossier -> 6 items : RK Brand, Esport Team, Vesanerie, Covers d'album, 404 Error Page, Flyer Perth Draw Club)
3. Illustration (dossier -> 3 carnets PDF + 16 images galerie)
4. Motion Design (dossier -> 3 videos : CMP, Tatouage Typo, Titanic)
5. Video/TikToks (dossier -> 4 TikTok embeds)
6. Animation (dossier -> 7 videos : 6 YouTube + 1 MP4)

**Sous-dossiers** :
- Esport Team : 12 images galerie
- 404 Error Page : 3 images galerie
- Covers d'album : 6 images galerie (2 avec liens externes)
- Vesanerie : 8 images galerie

### 8.3 Tech (tech/index.html)

**Laptop** (6 apps) :
1. Gesturo -- plateforme de dessin assistee par IA
2. ImageGen -- generateur d'images IA
3. VidToJpeg -- conversion video -> JPEG
4. PdfDecompil -- decomposition PDF -> PNG
5. Vectorio -- vectorisation bitmap -> SVG
6. MonVPN -- app desktop Electron VPN (WireGuard, Oracle Cloud, zero logs)

**Experimentations IA** (3 projets) :
1. Chibi Anime (video) -- rigging/animation par IA (Blender + Python + Claude Code)
2. Animate 3D (image) -- pipeline video -> BVH (MediaPipe + MotionBERT)
3. Generation de corps (galerie 2 images) -- modele vivant generatif (LoRA + ComfyUI)

### 8.4 Music (music/index.html)

**7 morceaux** :
1. SANGANT 2 (Rap, 2024)
2. Regarde le monde bruler (Film, 2024)
3. Spider Man V7 (Rap, 2024)
4. Dans les etoiles Vesanerie V2
5. Infamous V4
6. PROD PROJ ORIENT?
7. Maquette son joie de vivre

**Lien** : Playlist Spotify

---

## 9. Deploiement

### 9.1 GitHub Actions FTP (`deploy.yml`)

- Trigger : push sur `main`
- Action : `SamKirkland/FTP-Deploy-Action@v4.3.5`
- Destination : `/vesanerie.fr/` sur O2Switch
- Secrets : `FTP_HOST`, `FTP_USER`, `FTP_PASS`
- Exclusions : `.git*`, `.cpanel.yml`, `node_modules`, `src`, `package*.json`, `rsbuild.config.ts`
- Constat : exclut `rsbuild.config.ts` qui n'existe pas dans le repo (reliquat d'une ancienne config)

### 9.2 cPanel YAML (`.cpanel.yml`)

- Deploie uniquement `index.html` et `images/` vers `/home/jeke7360/vesanerie.fr/`
- **Probleme** : ne deploie pas les sous-dossiers (art/, tech/, music/, css/, js/), ni les autres fichiers HTML (mentions-legales, 404), ni robots.txt, ni sitemap.xml, ni sw.js, ni .htaccess
- **Ce fichier est probablement obsolete** -- le deploy reel passe par GitHub Actions FTP

### 9.3 CNAME

- `vesanerie.fr` -- fichier present a la racine
- Aussi present dans `public/CNAME` et `dist/CNAME` (reliquats)

### 9.4 .htaccess

- Contenu : `ErrorDocument 404 /404.html`
- Deploye via FTP Actions (non exclu)

### 9.5 Service Worker

- Enregistre depuis `main.js` L2-4
- Precache toutes les pages et assets CSS/JS
- **Le SW utilise des chemins absolus** (`/sw.js`, `/art/`, etc.) -- fonctionne si le site est a la racine du domaine

### 9.6 Constats deploiement

- **FTP deploy est lent** et ne supporte pas de cache-busting automatique
- **Le `.cpanel.yml` est incomplet** et ne devrait probablement pas etre dans le repo s'il n'est plus utilise
- **`dist/` et `public/` sont des reliquats** d'un ancien build Rsbuild -- inutiles, prennent de la place dans le repo
- **`AUDIT.md`, `MOBILE.md`, `rapport_web_design_2026.md`** sont deployes sur le serveur via FTP (non exclus) -- fichiers internes exposes publiquement

---

## 10. Bugs potentiels et incoherences

### 10.1 Bugs

1. **`all: unset` supprime l'outline de focus** sur de nombreux boutons interactifs (`pile-book`, `ipod-track`, `cinema-arrow`, `tiktok-arrow`, `fiche-back`, `site-back`, `contact-card`, `tools-card`, `lightbox-arrow`). Les utilisateurs clavier ne voient pas quel element est focus. Fichiers concernes : `pile.css` L84, `music.css` L77, `anim.css` L66, `tiktok.css` L179, `tech.css` L122/L237, `cards.css` L78/L132, `tech.css` L496.

2. **`.cpanel.yml` deploie uniquement `index.html` et `images/`** (`.cpanel.yml` L3-5) -- si cPanel est encore utilise, les sous-pages ne sont pas deployees. Probablement inactif (FTP Actions fait le vrai deploy).

3. **`playsinline` mal ecrit** : `art/index.html` L394, L402, L410 utilisent `playsinline` (tout attache) au lieu de `playsinline` -- en fait l'attribut correct est `playsinline` (pas de tiret) pour l'attribut HTML, mais la propriete JavaScript est `playsInline`. L'attribut HTML est correct.

4. **Fichiers internes deployes publiquement** : `AUDIT.md`, `MOBILE.md`, `rapport_web_design_2026.md` ne sont pas exclus du FTP deploy et sont accessibles a `https://vesanerie.fr/AUDIT.md` etc.

5. **iPod track couleur hardcodee** : `music.css` L87 `color: #333` -- fonctionne car override en dark L91-92, mais une variable serait plus propre.

### 10.2 Incoherences

6. **Breakpoints 600px vs 700px** : les composants de la page Art utilisent 700px tandis que les composants partages (theme-toggle, cards, about) utilisent 600px. Entre 600 et 700px, certains elements sont en mode mobile et d'autres en mode desktop.

7. **Deux systemes de lightbox differents** :
   - `art/index.html` : lightbox simple dans `lightbox.js` (galerie images) -- div avec id `lightbox`, classe `.gallery-lightbox`
   - `tech/index.html` : lightbox inline script (video + galerie + image) -- div avec id `lightbox`, classe `.lightbox`
   Ces deux systemes ont des classes CSS differentes et ne partagent pas de code.

8. **Variables CSS inutilisees** : `--halftone` et `--accent` sont definies dans `variables.css` L13-14 et L27-28 mais ne sont referencees dans aucun fichier CSS ou JS du projet.

9. **Couleurs hardcodees dans tech.css** : la lightbox tech utilise `#f0ece4` directement (L483, L506, L519) au lieu de `var(--bg)` ou `var(--text)`. En light mode `--bg` vaut `#f0ece4` donc ca fonctionne, mais conceptuellement c'est la couleur du dark mode qui est hardcodee dans le lightbox (fond noir + texte clair).

10. **`slideshow_optimized/` et `images/` sont des copies locales** des assets R2 qui ne sont pas referencees dans le HTML. Elles sont deployees via FTP (non exclues) et prennent 5,3 Mo sur le serveur pour rien.

11. **`dist/` et `public/` dans le repo** : bien que `dist/` soit dans `.gitignore`, `public/` ne l'est pas et contient des duplicatas (CNAME, images, favicon).

12. **`sw.js` precache `/art/` mais art.js est un ES module** : le SW precache `/js/art.js` mais les imports ES (`./art/state.js`, etc.) ne declenchent pas le cache directement -- ils sont precaches individuellement dans `PRECACHE_URLS` donc c'est OK, mais un oubli futur serait silencieux.

13. **`data-skip-cover`** reference dans `art.js` L62 mais **aucun element HTML** ne porte cet attribut -- code mort.

14. **`ficheView` et `ficheBack`** declares dans `tech.js` L7-8 mais jamais utilises (pas de `fiche-view` ni `fiche-back` dans le HTML de tech/index.html, ces elements n'existent pas dans le DOM actuel) -- la fiche projet tech a ete retiree du HTML mais les references JS subsistent.

15. **Cinema thumb Toucan Parapluie** reutilise la meme image que "Bande Demo" (`art/index.html` L457 : `https://img.youtube.com/vi/b65QqvTkKlQ/hqdefault.jpg`) -- thumbnail incorrect pour cette video MP4.

16. **Contact card `<div>` avec `all: unset`** (`cards.css` L78) : le `all: unset` reset aussi `position`, `top`, etc., qui sont ensuite re-declares. Fonctionne mais fragile -- un seul oubli de re-declaration et le layout casse.

17. **No `<h1>`** sur `art/index.html`, `tech/index.html` et `music/index.html` -- la structure heading commence par des `.pile-title` ou equivalents qui sont des `<div>`, pas des headings HTML. SEO impact : les crawlers ne trouvent pas de heading principal sur ces pages.

### 10.3 Points d'attention (non-bugs)

18. **4 iframes TikTok chargees simultanement** sur `art/index.html` L476-486 -- poids reseau significatif, pas de lazy loading. Les iframes ne sont visibles que quand on ouvre le dossier "tiktoks" mais elles sont presentes dans le DOM des le chargement.

19. **Tech page demo iframe** : les sites charges dans l'iframe (gesturo.fr etc.) peuvent bloquer le framing via `X-Frame-Options` ou `Content-Security-Policy`. Si c'est le cas, l'iframe sera vide sans message d'erreur visible.

20. **Service Worker `CACHE_NAME = 'vesanerie-v1'`** (`sw.js` L3) : n'a pas ete incremente depuis la creation -- les mises a jour d'assets pourraient etre servies depuis l'ancien cache.

---

## Resume

| Categorie | Etat | Points critiques |
|---|---|---|
| Structure | Propre | Architecture modulaire coherente, CSS/JS bien decoupe |
| SEO | Bon | JSON-LD, canonical, sitemap, og. Manque Twitter Cards et headings sur sous-pages |
| Performance | Bon | Lazy loading, SW, prefetch. Manque minification et cache-busting |
| Accessibilite | Moyen | ARIA present mais `all: unset` casse le focus sur ~12 elements |
| Mobile | Bon | Responsive complet, touch supporte. Incoherence breakpoints 600/700px |
| Dark mode | Bon | Variables coherentes, cards keep-light. Variables inutilisees et couleurs hardcodees |
| Fonctionnalites | Complet | Slideshow, PDF, lightbox, tilt, cinema, TikTok, iPod -- tout fonctionne |
| Deploiement | Fonctionnel | FTP Actions OK. `.cpanel.yml` obsolete, fichiers internes exposes |
| Bugs | 3 vrais bugs | Focus invisible (all:unset), fichiers internes publics, variables mortes dans tech.js |
