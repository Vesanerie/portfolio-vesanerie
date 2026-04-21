# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-21 (4e revision)
> Auteur : Claude (audit automatique)
> Statut : **quasi propre** — 21 points corriges, 4 mineurs restants

---

## Structure du projet

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 47 | Landing page (Tech / Art) |
| `art/index.html` | 211 | Portfolio art — pile, sous-dossiers (edition, graphisme, esport, tiktoks, carnets), PDF viewer, gallery, lightbox |
| `tech/index.html` | 79 | Page tech — laptop mockup + iframe |
| `css/style.css` | 198 | Base + halftone background + landing + back-link |
| `css/art.css` | 441 | Styles pile, phone, tiktok, gallery, lightbox, book-view, responsive |
| `css/tech.css` | 231 | Styles page tech |
| `css/pdf-viewer.css` | 115 | Styles viewer PDF fullscreen |
| `js/main.js` | 17 | Toggle theme clair/sombre |
| `js/art.js` | 382 | Logique pile + folders + PDF viewer + TikTok scroll + lightbox |
| `js/tech.js` | 25 | Logique bureau → iframe |

---

## Points CORRIGES (cumul depuis le 1er audit)

1. ~~Double handler clavier en mode PDF~~
2. ~~Fuite memoire listeners touch du PDF~~
3. ~~setTimeout couple au CSS~~
4. ~~`js/pdf-viewer.js` code mort~~ — supprime
5. ~~Script pdf-viewer retire de art/index.html~~
6. ~~Scaffold rsbuild supprime~~ — `src/`, `rsbuild.config.ts` supprimes
7. ~~Breakpoint 400px casse~~
8. ~~`.back-link` duplique~~ — unifie dans `style.css`
9. ~~`.theme-toggle` non accessible~~ — `<button>` + `aria-label`
10. ~~`.pile-book` non accessible~~ — `<button>` + `all: unset`
11. ~~CDN pdf.js sans SRI~~ — `integrity` + `crossorigin`
12. ~~Meta description~~ — present sur les 3 pages
13. ~~Open Graph~~ — present sur les 3 pages
14. ~~`.pile-book` manque `position: relative`~~ — present
15. ~~5 livres placeholder HTML~~ — contenu fictif retire
16. ~~Code mort JS systeme livre HTML~~ — supprime (nextPage, prevPage, updateNav, updateZIndex, book click/swipe)
17. ~~Code mort CSS livre HTML~~ — supprime (.page, .page-front, .page-back, .book-nav, etc.)
18. ~~`.tiktok-scroll` overflow conflictuel~~ — `overflow-x: hidden` remplace `overflow: hidden`
19. ~~pdf.js sans `defer`~~ — `defer` present `art/index.html:18`
20. ~~Favicon non lie~~ — `<link rel="icon">` present sur les 3 pages, `favicon.png` a la racine
21. ~~Iframes TikTok sans `title`~~ — `title="Video TikTok N"` present
22. ~~Lightbox img alt vide~~ — `img.alt` copie dans le handler `art.js:90`
23. ~~`catch (e) {}` vide dans `loadPdfCover`~~ — `console.warn` ajoute
24. ~~Variable `pdfCurrentPage` inutilisee~~ — supprimee
25. ~~Variable `carnetsView` inutilisee~~ — supprimee
26. ~~`.landing-card` defini deux fois~~ — fusionne (box-shadow dans le premier bloc)
27. ~~`package.json` avec rsbuild~~ — fichier supprime

---

## Corrections RESTANTES

### 1. CSS — `.has-cover` couleur texte codee en dur

- **Fichier** : `css/art.css` lignes 118-127
- **Probleme** : `.pile-book.has-cover .pile-book-title` et `.pile-book-type` ont `color: #f0ece4` et `border-color: #f0ece4` codes en dur au lieu d'utiliser une variable CSS. Si les couleurs du theme changent, ces valeurs seront incoherentes.
- **Correction** : Utiliser les variables CSS existantes, par exemple `color: var(--bg);` et `border-color: var(--bg);` (qui correspond a `#f0ece4` en light et est toujours la couleur de fond opposee au texte).
- **Priorite** : BASSE

### 2. JS — `var isAnimating = false` jamais passe a `true`

- **Fichier** : `js/art.js` ligne 240
- **Probleme** : `isAnimating` est declare et teste dans `showSpread()` (ligne 273) mais n'est jamais mis a `true`. La garde `if (isAnimating) return;` ne bloque jamais rien. Soit supprimer la variable et la garde, soit implementer le verrouillage.
- **Correction** : Supprimer `var isAnimating = false;` et `if (isAnimating) return;` puisque l'animation a ete retiree. Ou bien, si on veut eviter les double-clics rapides, ajouter `isAnimating = true;` au debut de `showSpread` et `isAnimating = false;` a la fin (apres le DOM update).
- **Priorite** : BASSE

### 3. JS — `var itemH = 580` couple au CSS

- **Fichier** : `js/art.js` ligne 68
- **Probleme** : La hauteur `580` est codee en dur, couplee a `.tiktok-embed-wrap { height: 580px }` dans `art.css:327`. Si le CSS change, le calcul de scroll sera faux.
- **Correction** : Lire la hauteur dynamiquement : `var itemH = tiktokScroll.querySelector('.tiktok-embed-wrap').offsetHeight || 580;`.
- **Priorite** : BASSE

### 4. A11Y — lightbox fermeture clavier impossible

- **Fichier** : `art/index.html` ligne 203
- **Probleme** : La lightbox se ferme au clic (`onclick="this.classList.remove('open')"`) mais pas au clavier (Escape). Un utilisateur clavier est bloque.
- **Correction** : Ajouter un listener `keydown` pour Escape dans `js/art.js` :
  ```js
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') document.getElementById('lightbox').classList.remove('open');
  });
  ```
- **Priorite** : BASSE

---

## Resume des priorites

| Priorite | Ref | Probleme | Effort |
|---|---|---|---|
| **BASSE** | 1 | `.has-cover` couleur codee en dur | 2 lignes |
| **BASSE** | 2 | `isAnimating` jamais active | 2 lignes |
| **BASSE** | 3 | `itemH = 580` couple au CSS | 1 ligne |
| **BASSE** | 4 | Lightbox pas fermable au clavier | 3 lignes |

---

## Consignes pour l'agent qui corrige

- Ne changer **rien d'autre** que ce qui est liste ci-dessus.
- Ne creer **aucun nouveau fichier**.
- Garder le style de code existant (vanilla JS, pas de framework).
- Tester que les 3 pages (`/`, `/art/`, `/tech/`) fonctionnent apres modifications.
