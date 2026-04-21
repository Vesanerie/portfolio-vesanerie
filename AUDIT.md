# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-21
> Auteur : Claude (audit automatique)
> Statut : **tous les points sont a corriger**

---

## Structure du projet

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 42 | Landing page |
| `art/index.html` | 365 | Portfolio art (pile + livre feuilletable + PDF) |
| `tech/index.html` | 73 | Page tech (laptop + iframe) |
| `css/style.css` | 150 | Base + landing |
| `css/art.css` | 427 | Styles portfolio art |
| `css/tech.css` | 245 | Styles page tech |
| `css/pdf-viewer.css` | 179 | Styles viewer PDF |
| `js/main.js` | 17 | Toggle theme clair/sombre |
| `js/art.js` | 378 | Logique pile + livre + PDF |
| `js/tech.js` | 25 | Logique bureau → iframe |
| `js/pdf-viewer.js` | 77 | **CODE MORT** — Viewer PDF avec StPageFlip (jamais charge) |
| `src/index.html` | 12 | **INUTILISE** — scaffold rsbuild |
| `src/index.js` | 1 | **INUTILISE** — scaffold rsbuild |
| `rsbuild.config.ts` | 7 | **INUTILISE** — config rsbuild |

---

## Corrections a appliquer

### 1. BUGS JS CRITIQUES

#### 1a. Double handler clavier en mode PDF

- **Fichier** : `js/art.js`, handler global `keydown` ligne ~351
- **Probleme** : Le listener global `keydown` pour le livre HTML reste actif en mode PDF. Appuyer sur ArrowRight declenche a la fois `nextPage()` (livre HTML) et `showSpread()` (PDF).
- **Correction** : Ajouter `if (isPdfMode) return;` au tout debut du handler global keydown.

#### 1b. Fuite memoire listeners touch du PDF

- **Fichier** : `js/art.js`, fonction `loadPdfAsBook` lignes ~273-282
- **Probleme** : Les handlers `touchstart`/`touchend` sur l'element `display` ne sont jamais nettoyes dans `closeBook()`. Chaque ouverture de PDF ajoute de nouveaux listeners.
- **Correction** : Stocker les references des handlers touch (comme c'est fait pour `_keyHandler`) et les retirer dans `closeBook()`.

#### 1c. setTimeout couple au CSS

- **Fichier** : `js/art.js` ligne ~233
- **Probleme** : `setTimeout(…, 650)` est couple a la duree de transition CSS `0.6s`. Si le CSS change, l'animation casse silencieusement.
- **Correction** : Remplacer le `setTimeout` par un listener `transitionend` sur `spreadEl`.

---

### 2. CODE MORT A SUPPRIMER

#### 2a. Supprimer `js/pdf-viewer.js`

- **Probleme** : Reference `St.PageFlip` (ligne 43) qui n'est jamais charge. Le vrai viewer PDF est dans `js/art.js` (`loadPdfAsBook`).
- **Correction** : Supprimer le fichier `js/pdf-viewer.js`.

#### 2b. Retirer le script de `art/index.html`

- **Fichier** : `art/index.html` ligne 362
- **Correction** : Retirer `<script src="../js/pdf-viewer.js"></script>`.

#### 2c. Supprimer le scaffold rsbuild

- **Fichiers** : `src/index.html`, `src/index.js`, `rsbuild.config.ts`
- **Probleme** : Le site est 100% vanilla HTML/CSS/JS. Rsbuild n'est jamais utilise en production.
- **Correction** : Supprimer ces 3 fichiers. Retirer `@rsbuild/core` de `package.json`. Si `package.json` devient vide, le supprimer aussi.

---

### 3. CSS

#### 3a. Breakpoint 400px casse

- **Fichier** : `css/art.css` lignes 401-405
- **Probleme** : Le media query `@media (max-width: 400px)` impose a `.pile-stack` une `width: 260px; height: 400px;` qui casse la grille (c'est un conteneur grid).
- **Correction** : Retirer `width` et `height` de `.pile-stack` dans ce media query. Garder les regles sur `.pile-book`, `.page-front`, `.page-back`, `.page-title`.

#### 3b. `.back-link` duplique

- **Fichiers** : `css/art.css` lignes 6-18 et `css/tech.css` lignes 11-23
- **Probleme** : Deux definitions differentes de `.back-link` dans deux fichiers. Styles incoherents entre pages.
- **Correction** :
  1. Deplacer la definition complete de `.back-link` (version `art.css`, la plus complete avec border + box-shadow) dans `css/style.css`.
  2. Supprimer `.back-link` de `art.css` et `tech.css`.

---

### 4. ACCESSIBILITE

#### 4a. `.theme-toggle` non accessible

- **Fichiers** : `index.html` ligne 14, `art/index.html` ligne 17, `tech/index.html` ligne 15
- **Probleme** : `<div class="theme-toggle" onclick="toggleTheme()">` n'est pas navigable au clavier, invisible aux lecteurs d'ecran.
- **Correction** :
  1. Remplacer `<div>` par `<button aria-label="Changer le theme">` dans les 3 HTML.
  2. Ajouter `all: unset; cursor: pointer;` au CSS `.theme-toggle` dans `css/style.css`.

#### 4b. `.pile-book` non accessibles

- **Fichier** : `art/index.html` lignes 31-73
- **Probleme** : `<div class="pile-book">` avec click handlers JS — pas navigable au clavier.
- **Correction** :
  1. Remplacer chaque `<div class="pile-book" …>` par `<button class="pile-book" …>`.
  2. Ajouter `all: unset;` au debut du CSS `.pile-book` dans `css/art.css`.

---

### 5. SECURITE

#### 5a. CDN pdf.js sans SRI

- **Fichier** : `art/index.html` ligne 13
- **Probleme** : `<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>` sans attribut `integrity` ni `crossorigin`. Si le CDN est compromis, du code malveillant s'execute.
- **Correction** : Ajouter `integrity="sha384-[HASH]" crossorigin="anonymous"` avec le hash SHA-384 correct pour pdf.js 3.11.174 (recuperer depuis cdnjs.com ou SRI hash generator).

---

### 6. SEO / META

#### 6a. Pas de meta description

- **Fichiers** : `index.html`, `art/index.html`, `tech/index.html`
- **Correction** : Ajouter dans le `<head>` de chaque page :
  - `index.html` : `<meta name="description" content="Valentin Mardoukhaev — Dessinateur, developpeur, auto-editeur. Portfolio art et tech.">`
  - `art/index.html` : `<meta name="description" content="Portfolio art de Valentin Mardoukhaev — Fanzines, bande dessinee, illustration, graphisme.">`
  - `tech/index.html` : `<meta name="description" content="Projets tech de Valentin Mardoukhaev — Developpement, IA, outils.">`

#### 6b. Favicon non lie

- **Probleme** : `favicon.png` existe dans `dist/` mais n'est reference dans aucun HTML.
- **Correction** : Ajouter `<link rel="icon" href="favicon.png">` dans `index.html` et `<link rel="icon" href="../favicon.png">` dans les sous-pages. S'assurer que le fichier est bien a la racine (pas seulement dans `dist/`).

#### 6c. Pas de balises Open Graph

- **Correction** : Ajouter dans le `<head>` de chaque page :
  ```html
  <meta property="og:title" content="[titre de la page]">
  <meta property="og:description" content="[description de la page]">
  <meta property="og:type" content="website">
  ```

---

## Resume des priorites

| Priorite | Ref | Probleme | Effort |
|---|---|---|---|
| **HAUTE** | 1a | Double keydown en mode PDF | 1 ligne |
| **HAUTE** | 1b | Fuite memoire listeners touch | ~10 lignes |
| **HAUTE** | 5a | SRI sur CDN pdf.js | 1 ligne |
| **MOYENNE** | 1c | setTimeout couple au CSS | ~5 lignes |
| **MOYENNE** | 2a-2c | Supprimer code mort | Suppressions |
| **MOYENNE** | 3a | Breakpoint 400px casse | 2 lignes |
| **MOYENNE** | 4a-4b | Accessibilite toggle + pile-book | ~20 lignes |
| **BASSE** | 3b | Unifier `.back-link` | Refacto CSS |
| **BASSE** | 6a-6c | SEO meta + favicon + OG | ~15 lignes |

---

## Consignes pour l'agent qui corrige

- Ne changer **rien d'autre** que ce qui est liste ci-dessus.
- Ne creer **aucun nouveau fichier** sauf si strictement necessaire.
- Garder le style de code existant (vanilla JS, pas de framework, pas de bundler).
- Tester que les 3 pages (`/`, `/art/`, `/tech/`) fonctionnent apres modifications.
- Commiter chaque groupe de corrections separement (bugs JS, code mort, CSS, accessibilite, securite, SEO).
