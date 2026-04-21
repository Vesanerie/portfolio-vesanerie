# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-21 (mis a jour)
> Auteur : Claude (audit automatique)
> Statut : **partiellement corrige** — voir detail ci-dessous

---

## Structure du projet

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 45 | Landing page |
| `art/index.html` | 445 | Portfolio art (pile + livre + PDF + TikTok + carnets) |
| `tech/index.html` | 77 | Page tech (laptop + iframe) |
| `css/style.css` | 171 | Base + landing + back-link |
| `css/art.css` | 613 | Styles portfolio art (pile, phone, tiktok, book, responsive) |
| `css/tech.css` | 231 | Styles page tech |
| `css/pdf-viewer.css` | 115 | Styles viewer PDF |
| `js/main.js` | 17 | Toggle theme clair/sombre |
| `js/art.js` | 462 | Logique pile + folders + livre + PDF + TikTok |
| `js/tech.js` | 25 | Logique bureau → iframe |
| `package.json` | 13 | Config npm (rsbuild encore en devDep) |

---

## Points CORRIGES depuis le dernier audit

- ~~1a. Double handler clavier en mode PDF~~ — Corrige : `if (isPdfMode) return;` present `js/art.js:436`
- ~~1b. Fuite memoire listeners touch du PDF~~ — Corrige : `_touchStart`/`_touchEnd` stockes et nettoyes dans `closeBook()` `js/art.js:363-369`
- ~~1c. setTimeout couple au CSS~~ — Corrige : animation supprimee, remplacement simple dans `showSpread`
- ~~2a. Supprimer `js/pdf-viewer.js`~~ — Corrige : fichier supprime
- ~~2b. Retirer le script de `art/index.html`~~ — Corrige : balise script retiree
- ~~2c. Supprimer le scaffold rsbuild~~ — Corrige : `src/index.html`, `src/index.js`, `rsbuild.config.ts` supprimes
- ~~3a. Breakpoint 400px casse~~ — Corrige : `width`/`height` retires de `.pile-stack` dans le media query
- ~~3b. `.back-link` duplique~~ — Corrige : unifie dans `css/style.css:147-164`, supprime de `art.css` et `tech.css`
- ~~4a. `.theme-toggle` non accessible~~ — Corrige : `<button>` avec `aria-label` sur les 3 pages, `all: unset` en CSS
- ~~4b. `.pile-book` non accessibles~~ — Corrige : `<button>` avec `all: unset` en CSS
- ~~5a. CDN pdf.js sans SRI~~ — Corrige : `integrity` + `crossorigin="anonymous"` present `art/index.html:17`
- ~~6a. Pas de meta description~~ — Corrige : present sur les 3 pages
- ~~6c. Pas de balises Open Graph~~ — Corrige : `og:title`, `og:description`, `og:type` sur les 3 pages

---

## Corrections RESTANTES

### 1. PACKAGE.JSON — devDependency rsbuild residuelle

- **Fichier** : `package.json`
- **Probleme** : `@rsbuild/core` est encore dans les `devDependencies` alors que le scaffold rsbuild a ete supprime. Le site est 100% vanilla, cette dependance ne sert a rien.
- **Correction** : Retirer `@rsbuild/core` de `package.json`. Si le fichier ne contient plus que `name`/`version`/`private`/`type` sans scripts utiles, envisager de le supprimer.
- **Priorite** : BASSE

### 2. FAVICON — pas lie dans les HTML

- **Fichier** : `index.html`, `art/index.html`, `tech/index.html`
- **Probleme** : `favicon.png` existe dans `public/` et `dist/` mais aucun `<link rel="icon">` dans les HTML.
- **Correction** : Ajouter `<link rel="icon" href="public/favicon.png">` dans `index.html` et `<link rel="icon" href="../public/favicon.png">` dans les sous-pages (ou copier `favicon.png` a la racine et utiliser `href="favicon.png"` / `href="../favicon.png"`).
- **Priorite** : BASSE

### 3. JS — `catch` vide dans `loadPdfCover`

- **Fichier** : `js/art.js` ligne 105
- **Probleme** : `catch (e) {}` avale silencieusement toute erreur de chargement de couverture PDF. Si une URL est incorrecte ou le reseau echoue, aucun feedback.
- **Correction** : Ajouter au minimum `console.warn('Cover load failed:', url, e);` dans le catch.
- **Priorite** : BASSE

### 4. JS — variable `pdfCurrentPage` inutilisee

- **Fichier** : `js/art.js` ligne 187
- **Probleme** : `var pdfCurrentPage = 0;` est declaree mais jamais lue ni ecrite apres. Code mort.
- **Correction** : Supprimer cette ligne.
- **Priorite** : BASSE

### 5. CSS — `.tiktok-scroll` `overflow` conflictuel

- **Fichier** : `css/art.css` lignes 241-246
- **Probleme** : `overflow-y: scroll;` est suivi par `overflow: hidden;` quelques lignes plus bas. La seconde propriete ecrase la premiere — le scroll TikTok vertical ne fonctionne pas comme prevu si les iframes debordent.
- **Correction** : Remplacer `overflow: hidden;` par `overflow-x: hidden;` pour garder le scroll vertical.
- **Priorite** : HAUTE (impacte le fonctionnement du scroll TikTok)

### 6. CSS — `.pile-book` manque `position: relative`

- **Fichier** : `css/art.css` ligne 47-64
- **Probleme** : `.pile-book.has-cover::before` utilise `position: absolute; inset: 0;` (ligne 89-96) mais `.pile-book` n'a pas `position: relative`. Le pseudo-element se positionne par rapport au parent le plus proche avec `position`, ce qui peut donner un overlay deplace.
- **Correction** : Ajouter `position: relative;` a `.pile-book`.
- **Priorite** : MOYENNE

### 7. HTML — 5 livres HTML sont des placeholders

- **Fichier** : `art/index.html` lignes 165-426
- **Probleme** : Les livres `nuits-blanches`, `chroniques-urbaines`, `portraits-perdus`, `identites-visuelles`, `derives`, `carnet-croquis` sont du contenu fictif avec `[ image ]` en placeholder. Ils apparaissent dans la grille mais n'ont pas de vrai contenu.
- **Correction** : Soit remplacer par du vrai contenu (PDF ou images), soit les retirer de la grille jusqu'a ce que le contenu soit pret.
- **Priorite** : MOYENNE (impacte l'experience utilisateur)

### 8. PERF — pdf.js charge systematiquement sur la page art

- **Fichier** : `art/index.html` ligne 17
- **Probleme** : Le script pdf.js (~800KB) est charge en synchrone dans le `<head>`, bloquant le rendu, meme si l'utilisateur ne consulte jamais un PDF.
- **Correction** : Ajouter l'attribut `defer` a la balise script : `<script defer src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" …></script>`.
- **Priorite** : MOYENNE

### 9. A11Y — iframes TikTok sans `title`

- **Fichier** : `art/index.html` lignes 111-120
- **Probleme** : Les 4 `<iframe>` TikTok n'ont pas d'attribut `title`, ce qui les rend opaques pour les lecteurs d'ecran.
- **Correction** : Ajouter `title="Video TikTok 1"` (etc.) a chaque iframe.
- **Priorite** : BASSE

### 10. A11Y — boutons TikTok nav sans etiquettes explicites

- **Fichier** : `art/index.html` lignes 126-128
- **Probleme** : Les boutons `tiktok-up`/`tiktok-down` ont des `aria-label` (bien), mais le contenu textuel est une fleche unicode qui n'a pas de semantique. OK pour l'accessibilite grace au `aria-label`.
- **Note** : Pas de correction requise — juste a verifier que les `aria-label` sont bien lus.

---

## Resume des priorites

| Priorite | Ref | Probleme | Effort |
|---|---|---|---|
| **HAUTE** | 5 | `.tiktok-scroll` overflow conflictuel | 1 ligne |
| **MOYENNE** | 6 | `.pile-book` manque `position: relative` | 1 ligne |
| **MOYENNE** | 7 | 5 livres HTML sont des placeholders | Decision contenu |
| **MOYENNE** | 8 | pdf.js bloquant — ajouter `defer` | 1 mot |
| **BASSE** | 1 | devDependency rsbuild residuelle | 1 ligne |
| **BASSE** | 2 | Favicon non lie dans les HTML | 3 lignes |
| **BASSE** | 3 | `catch` vide dans `loadPdfCover` | 1 ligne |
| **BASSE** | 4 | Variable `pdfCurrentPage` inutilisee | 1 ligne |
| **BASSE** | 9 | Iframes TikTok sans `title` | 4 lignes |

---

## Consignes pour l'agent qui corrige

- Ne changer **rien d'autre** que ce qui est liste ci-dessus.
- Ne creer **aucun nouveau fichier** sauf si strictement necessaire.
- Garder le style de code existant (vanilla JS, pas de framework, pas de bundler).
- Tester que les 3 pages (`/`, `/art/`, `/tech/`) fonctionnent apres modifications.
