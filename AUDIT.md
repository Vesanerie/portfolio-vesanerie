# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-24 (15e revision)
> Auteur : Claude (audit automatique)
> Statut : **5 bugs, 2 points mineurs**

---

## Structure du projet

Portfolio vanilla HTML/CSS/JS. 6 pages + 404. O2Switch + GitHub Actions FTP. Assets Cloudflare R2.

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 220 | Landing (h1 nom, bio, CTA contact), slideshow bg, CV overlay (pdf.js defer+SRI), section A propos (formation, XP, langues), scroll-to-top, contact card, JSON-LD Person + WebSite, skip-intro sessionStorage |
| `art/index.html` | 503 | Portfolio art — edition (5 PDFs), illustration (3 carnets + gallery 16 + 1 PDF), graphisme (Vesanerie, covers album, 404, esport, RK Brand, Flyer Perth), motion design (CMP video), animation (6 YT + 1 video), tiktoks (4 embeds + CTA), lightbox, tools-card |
| `tech/index.html` | 112 | Laptop, 5 apps grid, hover desc, fiche projet, demo iframe, tools-card |
| `music/index.html` | 98 | iPod (320px), 7 tracks, tools-card |
| `mentions-legales.html` | 63 | Mentions legales (editeur, hebergement, PI, RGPD), layout 2 colonnes avec image |
| `404.html` | 30 | Page 404 personnalisee (code + message + bouton retour) |
| `sitemap.xml` | 28 | Sitemap XML (5 URLs avec priorites) |
| `robots.txt` | 5 | Allow all sauf /dist/, pointe vers sitemap |
| `.htaccess` | 1 | ErrorDocument 404 |
| `css/style.css` | 1005 | Base, halftone, slideshow, anims, vinyl, CV, contact, tools-card, back-link, about, scroll-top, scroll-reveal, error-page, mentions, no-intro, responsive |
| `css/art.css` | 920 | Pile (5 variantes), has-cover, gallery masonry, lightbox, phone/folder/film, tiktok + CTA, anim-grid, book-view, fiche art, motion-desc, gallery-item-link, responsive |
| `css/tech.css` | 463 | Laptop, desktop flex-wrap, app-desc hover, fiche projet, site-iframe, clavier, responsive |
| `css/pdf-viewer.css` | 157 | PDF reader, curseurs SVG, responsive, hover:none |
| `css/music.css` | 262 | iPod, LCD vert, click wheel, responsive |
| `js/main.js` | 61 | Theme toggle, scroll-to-top, close cards on outside click, Escape shortcuts |
| `js/art.js` | 567 | `initPdfJs()`, `artProjects{}`, fiche art, pile/folders, lazy covers, media stop/restore, TikTok scroll, lightbox, PDF viewer, `setBackLink()` dynamique |
| `js/tech.js` | 79 | `projects{}` (5 apps), hover desc, fiche -> demo -> retour |
| `js/music.js` | 70 | Player iPod, auto-next, formatTime guard |

---

## Corrections RESTANTES

### 1. BUG — CSS tech.css : duplications massives dans le media query mobile

- **Fichier** : `css/tech.css`, `@media (max-width: 600px)`
- **Probleme** : `.desktop`, `.screen-shell`, `.screen-inner`, `.base-shell`, `.app-icon`, `.app-icon-img`, `.app-icon-name` sont chacun declares **deux fois** dans le meme media query. Les premiers blocs (lignes 310-360) sont du code mort car ecrases par les seconds (lignes 365-463).
- **Correction** : Fusionner chaque paire en un seul bloc, en gardant les valeurs finales.
- **Priorite** : MOYENNE

### 2. BUG — CSS style.css : landing-card cassee a 380px

- **Fichier** : `css/style.css`, lignes 948-957, `@media (max-width: 380px)`
- **Probleme** : `.landing-card { width: 90px; height: 120px; }` — les cartes deviennent minuscules (90px de large) sur petit ecran, alors qu'elles sont en `flex-direction: column` depuis le breakpoint 600px. Visuellement casse.
- **Correction** : Garder `width: 100%` et reduire seulement le `height` (ex: `height: 110px`).
- **Priorite** : HAUTE (affecte le mobile)

### 3. BUG — JS art.js : selecteur `.section-title` inexistant

- **Fichier** : `js/art.js`, ligne 335
- **Probleme** : `fv.querySelector('.section-title')` — cette classe n'existe nulle part dans le HTML. Devrait etre `.pile-title`. Consequence : le back-link en mode PDF depuis un sous-dossier affiche le slug brut (ex: "edition") au lieu du nom affiche ("Edition").
- **Correction** : Remplacer `.section-title` par `.pile-title`.
- **Priorite** : BASSE

### 4. BUG — HTML : `<button>` imbriquant des `<a>` (invalid HTML)

- **Fichier** : `index.html` (ligne 143, contact-card) et toutes les pages avec tools-card
- **Probleme** : La carte contact est un `<button>` qui contient des `<a>`. Imbriquer des elements interactifs est invalide en HTML5. De plus, cliquer un lien dans la carte declenche aussi le `toggle('open')` du bouton parent, ce qui ferme la carte en meme temps.
- **Correction** : Remplacer le `<button class="contact-card">` par un `<div>`, et ajouter un bouton separe pour toggler. Idem pour tools-card.
- **Priorite** : MOYENNE (accessibilite + UX mobile)

### 5. BUG — Contact card : clic sur un lien ferme la carte

- **Fichier** : `index.html`, lien direct avec le bug #4
- **Probleme** : Le `onclick="this.classList.toggle('open')"` sur le `<button>` parent fait que cliquer sur un lien (`mailto:`, Instagram, etc.) ferme aussi la carte immediatement. Sur mobile (bottom-sheet), c'est particulierement genant.
- **Correction** : Ajouter `e.stopPropagation()` sur les liens, ou restructurer en `<div>` avec un bouton toggle separe.
- **Priorite** : HAUTE (UX mobile)

---

## Points mineurs

### 6. JS main.js : handler Escape lightbox mort

- **Fichier** : `js/main.js`, ligne 58
- **Probleme** : Le test `lb.style.display !== 'none'` ne marchera jamais car la lightbox utilise la classe `.open` (geree par art.js qui a son propre handler Escape). Code mort.
- **Correction** : Supprimer le bloc lightbox dans main.js (deja gere par art.js ligne 218).
- **Priorite** : BASSE

### 7. Meta theme-color manquant

- **Probleme** : Aucune page ne declare `<meta name="theme-color">`. Sur mobile (Chrome, Safari), la barre d'adresse ne prend pas la couleur du site.
- **Correction** : Ajouter `<meta name="theme-color" content="#f0ece4">` dans le `<head>` de chaque page. Bonus : le changer en JS quand le theme dark est actif.
- **Priorite** : BASSE

---

## Points corriges (depuis l'audit precedent)

- ~~`.desktop` declare deux fois~~ → englobes dans le bug #1 (probleme plus large que prevu)

---

## Verifications

- pdf.js `defer` sur art : **present** (ligne 22)
- pdf.js `defer` + SRI sur index : **present**
- `initPdfJs()` gere le timing defer : **OK**
- TikTok `getItemH()` dynamique : **OK**
- JSON-LD Person + WebSite valide : **OK**
- Canonical URLs coherentes avec sitemap : **OK**
- sessionStorage skip-intro : **OK**
- setBackLink() contextuel : **OK** (sauf bug #3)
- .htaccess 404 : **OK**
- Contact card fermeture clic exterieur : **OK** (main.js)
- Lightbox fleches clavier : **OK** (art.js)
- Musique auto-next : **OK**
- Tech demo iframe retour : **OK**

---

## Audit mobile specifique

| Page | Breakpoint 600px | Breakpoint 400px | Breakpoint 380px | Verdict |
|---|---|---|---|---|
| **Accueil** | OK (cards column, bio reduite) | OK | **KO** : landing-card 90px de large = casse (bug #2) | A corriger |
| **Art** | OK (pile 2 colonnes, gallery 2 col) | OK (pile 130px, gallery 1 col) | OK | OK |
| **Tech** | OK sauf CSS dead code (bug #1) | - | - | A nettoyer |
| **Music** | OK (ipod 290px) | - | OK (ipod 250px) | OK |
| **Mentions** | OK (1 colonne) | - | - | OK |
| **404** | OK (taille reduite) | - | - | OK |
| **Contact card** | **KO** : clic lien ferme la carte (bug #5) | idem | idem | A corriger |
| **CV overlay** | OK | OK | OK | OK |
| **PDF viewer** | OK (single page, touch swipe) | OK | OK | OK |
| **TikTok** | OK (column layout, phone 280px) | OK (phone 240px) | - | OK |

---

## Consignes pour tout agent futur

- Site **vanilla HTML/CSS/JS** — pas de framework, pas de bundler.
- Assets sur **Cloudflare R2** (`pub-43a141f7a8b84a30a90fcc01da2114ca.r2.dev`).
- Deploy **O2Switch** via **GitHub Actions FTP**. Toujours push apres commit.
- Quand on modifie `art/index.html`, **verifier que `defer` est present** sur pdf.js.
- Les PDFs lourds peuvent utiliser `data-skip-cover` pour eviter le telechargement en thumbnail.
- Les PDFs comprimes sont dans `/Art/Fanzine/` avec suffixe `_compresse` ou `_compressed`.
- Le JSON-LD Person est sur la homepage — mettre a jour si nouveaux reseaux/projets.
