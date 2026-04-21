# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-21 (3e revision)
> Auteur : Claude (audit automatique)
> Statut : **partiellement corrige** — 14 points corriges, 12 restants

---

## Structure du projet

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 45 | Landing page (Tech / Art) |
| `art/index.html` | 226 | Portfolio art — pile, sous-dossiers (edition, graphisme, esport, tiktoks, carnets), PDF viewer, gallery, lightbox |
| `tech/index.html` | 77 | Page tech — laptop mockup + iframe |
| `css/style.css` | 175 | Base + landing + back-link |
| `css/art.css` | 679 | Styles portfolio art (pile, phone, tiktok, gallery, lightbox, book, responsive) |
| `css/tech.css` | 231 | Styles page tech |
| `css/pdf-viewer.css` | 115 | Styles viewer PDF fullscreen |
| `js/main.js` | 17 | Toggle theme clair/sombre |
| `js/art.js` | 496 | Logique pile + folders + livre HTML + PDF + TikTok + lightbox |
| `js/tech.js` | 25 | Logique bureau → iframe |
| `package.json` | 13 | Config npm (rsbuild encore en devDep) |

---

## Points CORRIGES (cumul)

- ~~Double handler clavier en mode PDF~~ — `if (isPdfMode) return;` present
- ~~Fuite memoire listeners touch du PDF~~ — `_touchStart`/`_touchEnd` nettoyes dans `closeBook()`
- ~~setTimeout couple au CSS~~ — animation supprimee
- ~~`js/pdf-viewer.js` code mort~~ — fichier supprime
- ~~Script pdf-viewer retire de art/index.html~~
- ~~Scaffold rsbuild supprime~~ — `src/`, `rsbuild.config.ts` supprimes
- ~~Breakpoint 400px casse~~ — corrige
- ~~`.back-link` duplique~~ — unifie dans `style.css`
- ~~`.theme-toggle` non accessible~~ — `<button>` + `aria-label`
- ~~`.pile-book` non accessible~~ — `<button>` + `all: unset`
- ~~CDN pdf.js sans SRI~~ — `integrity` + `crossorigin` present
- ~~Meta description manquante~~ — present sur les 3 pages
- ~~Open Graph manquant~~ — present sur les 3 pages
- ~~`.pile-book` manque `position: relative`~~ — present ligne 62 de `art.css`
- ~~5 livres placeholder~~ — contenu HTML fictif retire, `#book` vide

---

## Corrections RESTANTES

### 1. CODE MORT JS — systeme de livre HTML inutilise

- **Fichier** : `js/art.js` lignes 429-495
- **Probleme** : Tout le systeme de page-flip HTML (`updateNav`, `updateZIndex`, `nextPage`, `prevPage`, click/keyboard/swipe handlers sur `bookEl`) est mort. Le `<div id="book">` dans `art/index.html:200` est vide — plus aucun `.book-pages` n'existe. Seul le viewer PDF est utilise. Le `book-nav` (prev/next) en HTML appelle encore `prevPage()`/`nextPage()` via `onclick` mais ne sera jamais atteint.
- **Correction** : Supprimer les fonctions `updateNav`, `updateZIndex`, `nextPage`, `prevPage`, le click handler sur `bookEl`, le keydown handler global (sauf la partie Escape), et le swipe support. Supprimer aussi le `book-nav` de `art/index.html` et le `#book` wrapper vide. Ne garder que le PDF container.
- **Priorite** : HAUTE (code mort substantiel, ~70 lignes)

### 2. CODE MORT CSS — styles livre HTML inutilises

- **Fichier** : `css/art.css` lignes 373-594
- **Probleme** : Tout le CSS `book-view`, `.book-wrapper`, `.book`, `.page`, `.page-front`, `.page-back`, `.page-number`, `.page-title`, `.page-subtitle`, `.page-desc`, `.page-image-placeholder`, `.page-tags`, `.page-tag`, `.cover-icon`, `.cover-author`, `.page-endcover`, `.book-nav`, `.nav-btn`, `.nav-indicator`, les shadows `.page.flipped`, et les responsive rules associees — tout est mort puisque plus aucun HTML ne l'utilise.
- **Correction** : Supprimer tout le bloc CSS de `.book-view` jusqu'a `.page:not(.flipped) .page-back::after` (~220 lignes). Garder uniquement le responsive de `.pile-*` et `.back-link`.
- **Priorite** : HAUTE (code mort substantiel, ~220 lignes)

### 3. JS — variable `carnetsView` inutilisee

- **Fichier** : `js/art.js` ligne 19
- **Probleme** : `var carnetsView = document.getElementById('carnets-view');` est declaree mais jamais lue.
- **Correction** : Supprimer cette ligne.
- **Priorite** : BASSE

### 4. JS — variable `pdfCurrentPage` inutilisee

- **Fichier** : `js/art.js` ligne 221
- **Probleme** : `var pdfCurrentPage = 0;` est declaree mais jamais lue ni ecrite.
- **Correction** : Supprimer cette ligne.
- **Priorite** : BASSE

### 5. JS — `catch (e) {}` vide dans `loadPdfCover`

- **Fichier** : `js/art.js` ligne 139
- **Probleme** : Les erreurs de chargement de couverture PDF sont avalees silencieusement.
- **Correction** : Ajouter `console.warn('Cover load failed:', url, e);`.
- **Priorite** : BASSE

### 6. CSS — `.tiktok-scroll` overflow conflictuel

- **Fichier** : `css/art.css` lignes 311-316
- **Probleme** : `overflow-y: scroll;` (ligne 311) est ecrase par `overflow: hidden;` (ligne 316). Le shorthand `overflow` remplace les deux axes. Le scroll TikTok vertical est casse.
- **Correction** : Remplacer `overflow: hidden;` par `overflow-x: hidden;`.
- **Priorite** : HAUTE (casse le scroll TikTok)

### 7. CSS — `.landing-card` defini deux fois

- **Fichier** : `css/style.css` lignes 105-118 et 121-123
- **Probleme** : `.landing-card` est declare deux fois. Le second bloc ajoute `box-shadow: 6px 6px 0 0 var(--border)` seul. Devrait etre fusionne dans le premier bloc.
- **Correction** : Deplacer `box-shadow` dans le premier `.landing-card` et supprimer le second bloc.
- **Priorite** : BASSE

### 8. PERF — pdf.js charge en synchrone sans `defer`

- **Fichier** : `art/index.html` ligne 17
- **Probleme** : Le script pdf.js (~800KB) bloque le rendu dans le `<head>`.
- **Correction** : Ajouter `defer` a la balise `<script>`.
- **Priorite** : MOYENNE

### 9. SEO — favicon non lie dans les HTML

- **Fichier** : `index.html`, `art/index.html`, `tech/index.html`
- **Probleme** : `favicon.png` existe dans `public/` mais aucun `<link rel="icon">` dans les HTML.
- **Correction** : Ajouter `<link rel="icon" href="public/favicon.png">` dans `index.html` et `<link rel="icon" href="../public/favicon.png">` dans les sous-pages.
- **Priorite** : BASSE

### 10. A11Y — iframes TikTok sans `title`

- **Fichier** : `art/index.html` lignes 149-159
- **Probleme** : Les 4 `<iframe>` TikTok n'ont pas d'attribut `title`.
- **Correction** : Ajouter `title="Video TikTok 1"` (etc.) a chaque iframe.
- **Priorite** : BASSE

### 11. A11Y — lightbox img `alt` vide

- **Fichier** : `art/index.html` ligne 220
- **Probleme** : `<img id="lightbox-img" src="" alt="">` a un alt vide en permanence. Le JS (`art.js:95`) copie le `src` mais pas le `alt` de l'image cliquee.
- **Correction** : Dans le handler de clic gallery (`art.js:93-97`), copier aussi l'alt : `document.getElementById('lightbox-img').alt = img.alt;`.
- **Priorite** : BASSE

### 12. PACKAGE.JSON — devDependency rsbuild residuelle

- **Fichier** : `package.json`
- **Probleme** : `@rsbuild/core` est encore dans les `devDependencies`. Le site est 100% vanilla.
- **Correction** : Retirer `@rsbuild/core` et les scripts `build`/`dev` inutiles.
- **Priorite** : BASSE

---

## Resume des priorites

| Priorite | Ref | Probleme | Effort |
|---|---|---|---|
| **HAUTE** | 1 | Code mort JS — systeme livre HTML (~70 lignes) | Suppression |
| **HAUTE** | 2 | Code mort CSS — styles livre HTML (~220 lignes) | Suppression |
| **HAUTE** | 6 | `.tiktok-scroll` overflow conflictuel | 1 ligne |
| **MOYENNE** | 8 | pdf.js bloquant — ajouter `defer` | 1 mot |
| **BASSE** | 3 | Variable `carnetsView` inutilisee | 1 ligne |
| **BASSE** | 4 | Variable `pdfCurrentPage` inutilisee | 1 ligne |
| **BASSE** | 5 | `catch` vide dans `loadPdfCover` | 1 ligne |
| **BASSE** | 7 | `.landing-card` defini deux fois | Fusion |
| **BASSE** | 9 | Favicon non lie | 3 lignes |
| **BASSE** | 10 | Iframes TikTok sans `title` | 4 lignes |
| **BASSE** | 11 | Lightbox img alt vide | 1 ligne |
| **BASSE** | 12 | devDependency rsbuild residuelle | 1 ligne |

---

## Consignes pour l'agent qui corrige

- Ne changer **rien d'autre** que ce qui est liste ci-dessus.
- Ne creer **aucun nouveau fichier** sauf si strictement necessaire.
- Garder le style de code existant (vanilla JS, pas de framework, pas de bundler).
- Tester que les 3 pages (`/`, `/art/`, `/tech/`) fonctionnent apres modifications.
- Pour les points 1 et 2 (code mort) : bien verifier qu'aucun chemin ne mene plus au systeme de livre HTML avant de supprimer. Si un futur livre HTML est prevu, conserver le code mais le commenter.
