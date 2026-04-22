# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-22 (5e revision)
> Auteur : Claude (audit automatique)
> Statut : **bon etat general** — 28 corriges, 8 restants

---

## Structure du projet

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 53 | Landing page (Tech / Art / Musique) + bio |
| `art/index.html` | 347 | Portfolio art — pile, edition, graphisme, esport, illustration, animation, tiktoks, carnets, PDF viewer, gallery, lightbox |
| `tech/index.html` | 94 | Page tech — laptop mockup + 5 apps + iframe |
| `music/index.html` | 67 | **NOUVEAU** — Page musique — iPod classic + player audio |
| `css/style.css` | 210 | Base + halftone bg + landing + bio + back-link |
| `css/art.css` | 625 | Styles pile, folder, film, phone, tiktok, gallery, lightbox, anim-grid, book-view, responsive |
| `css/tech.css` | 231 | Styles page tech |
| `css/pdf-viewer.css` | 117 | Styles viewer PDF fullscreen (curseurs custom) |
| `css/music.css` | 213 | **NOUVEAU** — Styles iPod classic |
| `js/main.js` | 17 | Toggle theme clair/sombre |
| `js/art.js` | 488 | Logique pile + folders + media stop/restore + PDF + TikTok + lightbox (avec fleches) + gallery-pdf |
| `js/tech.js` | 25 | Logique bureau → iframe |
| `js/music.js` | 70 | **NOUVEAU** — Player audio iPod (play, progress, auto-next) |

---

## Points CORRIGES (cumul)

1-27. *(voir revisions precedentes)*
28. ~~Lightbox pas fermable au clavier~~ — handler keydown avec Escape + ArrowLeft/Right `art.js:120-132`

---

## Corrections RESTANTES

### 1. PERF — pdf.js `defer` retire (regression)

- **Fichier** : `art/index.html` ligne 18
- **Probleme** : Le `defer` qui avait ete ajoute sur le `<script>` pdf.js a ete retire. Le script bloque a nouveau le rendu dans le `<head>` (~800KB).
- **Correction** : Remettre `defer` : `<script defer src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" ...>`.
- **Priorite** : MOYENNE

### 2. JS — `isAnimating` jamais active (garde morte)

- **Fichier** : `js/art.js` ligne 325 et 358
- **Probleme** : `var isAnimating = false;` est declare et teste (`if (isAnimating) return;`) mais jamais mis a `true`. La garde ne bloque jamais rien.
- **Correction** : Supprimer `var isAnimating = false;` et `if (isAnimating) return;`.
- **Priorite** : BASSE

### 3. JS — `var itemH = 580` couple au CSS

- **Fichier** : `js/art.js` ligne 70
- **Probleme** : Hauteur hardcodee, couplee a `.tiktok-embed-wrap { height: 580px }` en CSS.
- **Correction** : Lire dynamiquement : `var itemH = tiktokScroll.querySelector('.tiktok-embed-wrap').offsetHeight || 580;`.
- **Priorite** : BASSE

### 4. CSS — `.has-cover` couleur texte hardcodee

- **Fichier** : `css/art.css` ligne 124
- **Probleme** : `.pile-book.has-cover .pile-book-title` et `.pile-book-type` ont `color: #f0ece4` en dur. En dark mode, le texte overlay est identique au fond sombre, donc invisible si le background-image ne charge pas.
- **Correction** : Utiliser `color: var(--bg);` pour que la couleur s'adapte au theme.
- **Priorite** : BASSE

### 5. SEO — page musique sans Open Graph

- **Fichier** : `music/index.html`
- **Probleme** : Pas de balises `og:title`, `og:description`, `og:type` (presentes sur les 3 autres pages).
- **Correction** : Ajouter dans le `<head>` :
  ```html
  <meta property="og:title" content="Vesanerie — Musique">
  <meta property="og:description" content="Musique de Valentin Mardoukhaev — Beats, compositions, projets sonores.">
  <meta property="og:type" content="website">
  ```
- **Priorite** : BASSE

### 6. CSS — `.gallery-pdf-label` jamais utilise

- **Fichier** : `css/art.css` lignes 189-201
- **Probleme** : La classe `.gallery-pdf-label` est definie dans le CSS mais n'existe dans aucun HTML. Code mort.
- **Correction** : Supprimer le bloc CSS `.gallery-pdf-label`.
- **Priorite** : BASSE

### 7. A11Y — iPod wheel non navigable au clavier

- **Fichier** : `music/index.html` lignes 52-58
- **Probleme** : Les labels "MENU", ">>", "||", "<<" sur la click wheel sont decoratifs (`<div>`) — pas de boutons, pas d'action. Seul le bouton central (play/pause) est fonctionnel. Les labels suggerent des actions (prev, next, pause) qui ne sont pas implementees.
- **Correction** : Soit implementer prev/next/menu comme boutons fonctionnels, soit retirer le texte des labels pour eviter la confusion (ou les remplacer par de simples decorations sans texte semantique).
- **Priorite** : BASSE (cosmetique, le player fonctionne via la liste de tracks et le bouton central)

### 8. HTML — canvas gallery-pdf sans dimensions initiales

- **Fichier** : `art/index.html` ligne 113
- **Probleme** : `<canvas id="voiture-cover"></canvas>` n'a aucune dimension initiale. Le canvas est invisible (0x0) jusqu'a ce que le PDF se charge, causant un layout shift dans la grille gallery.
- **Correction** : Ajouter des dimensions par defaut : `<canvas id="voiture-cover" width="300" height="400"></canvas>` ou un style CSS `.gallery-pdf canvas { aspect-ratio: 3/4; }`.
- **Priorite** : BASSE

---

## Resume des priorites

| Priorite | Ref | Probleme | Effort |
|---|---|---|---|
| **MOYENNE** | 1 | pdf.js `defer` retire (regression) | 1 mot |
| **BASSE** | 2 | `isAnimating` jamais active | 2 lignes |
| **BASSE** | 3 | `itemH = 580` couple au CSS | 1 ligne |
| **BASSE** | 4 | `.has-cover` couleur hardcodee | 1 ligne |
| **BASSE** | 5 | Page musique sans Open Graph | 3 lignes |
| **BASSE** | 6 | `.gallery-pdf-label` CSS mort | Suppression |
| **BASSE** | 7 | iPod wheel labels non fonctionnels | Decision UX |
| **BASSE** | 8 | Canvas gallery-pdf sans dimensions | 1 ligne |

---

## Consignes pour l'agent qui corrige

- Ne changer **rien d'autre** que ce qui est liste ci-dessus.
- Ne creer **aucun nouveau fichier**.
- Garder le style de code existant (vanilla JS, pas de framework).
- Tester que les 4 pages (`/`, `/art/`, `/tech/`, `/music/`) fonctionnent apres modifications.
- **Attention au point 1** : c'est une regression, le `defer` avait deja ete ajoute puis retire.
