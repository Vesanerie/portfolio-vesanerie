# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-22 (8e revision)
> Auteur : Claude (audit automatique)
> Statut : **1 bug critique**, sinon tres propre

---

## Structure du projet

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 101 | Landing (Tech/Art/Musique) + bio + email + CV overlay (pdf.js defer+SRI) + contact card |
| `art/index.html` | 368 | Portfolio art — edition, graphisme, illustration, esport, animation, tiktoks, carnets, PDF viewer, lightbox, tools-card |
| `tech/index.html` | 109 | Page tech — laptop 5 apps (position absolue) + tooltips (hover:hover) + iframe + tools-card |
| `music/index.html` | 77 | Page musique — iPod classic + player 3 tracks + tools-card |
| `css/style.css` | 580 | Base + halftone + landing (animations fadeInUp/cardDrop) + vinyl + CV + contact + tools-card + responsive |
| `css/art.css` | 692 | Pile, folder, film, phone, gallery (content-visibility), lightbox, tiktok, anim-grid, book-view, responsive |
| `css/tech.css` | 282 | Laptop + tooltips (hover:hover + mobile hide) + positions absolues + responsive |
| `css/pdf-viewer.css` | 158 | PDF reader + curseurs custom + responsive + touch |
| `css/music.css` | 235 | iPod classic (380px) + responsive |
| `js/main.js` | 17 | Toggle theme |
| `js/art.js` | 506 | Pile + lazy covers (skip heavy PDFs) + folders + media stop/restore + PDF (mobile single) + TikTok + lightbox (fleches) + gallery-pdf |
| `js/tech.js` | 25 | Bureau → iframe |
| `js/music.js` | 70 | Player audio iPod |

---

## Points corriges depuis la derniere revision

- ~~`.tools-card` sans CSS~~ — styles ajoutes dans `style.css:442-494` (slide-in depuis la droite, comme contact-card)

---

## Corrections RESTANTES

### 1. BUG CRITIQUE — `tiktokWraps` utilise avant assignation

- **Fichier** : `js/art.js` lignes 82-84
- **Probleme** : Ligne 82 utilise `tiktokWraps[0]` mais `tiktokWraps` est declare ligne 84. Le `var` hoisting fait que la variable existe mais vaut `undefined` au moment de l'acces. `undefined[0]` lance un `TypeError` qui casse tout le bloc TikTok (compteur, fleches, stop au scroll).
- **Correction** : Deplacer la ligne 84 **avant** la ligne 82 :
  ```js
  var tiktokWraps = tiktokScroll.querySelectorAll('.tiktok-embed-wrap');
  var itemH = tiktokWraps[0] ? tiktokWraps[0].offsetHeight : 580;
  ```
- **Priorite** : **CRITIQUE**

### 2. PERF — pdf.js sans `defer` sur art/index.html

- **Fichier** : `art/index.html` ligne 18
- **Probleme** : Regression persistante — le `defer` a ete ajoute puis retire a plusieurs reprises. Le script (~800KB) bloque le rendu du `<head>`.
- **Correction** : Ajouter `defer` : `<script defer src="...pdf.min.js" integrity="..." crossorigin="anonymous"></script>`.
- **Priorite** : MOYENNE

### 3. CSS — proprietes dupliquees dans `.landing`

- **Fichier** : `css/style.css` lignes 109 et 114
- **Probleme** : `.landing` declare `justify-content: center;` deux fois (ligne 109 dans le bloc principal, ligne 114 en redeclaration). Le `padding` a aussi des valeurs qui s'ecrasent (ligne 112 : `padding: 10px 20px;` puis lignes 115-116 : `padding-top: 40px; padding-bottom: 30px;`).
- **Correction** : Fusionner en un seul bloc coherent :
  ```css
  .landing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 10px;
    padding: 40px 20px 30px;
    overflow: hidden;
  }
  ```
- **Priorite** : BASSE

### 4. CSS — regles contact-card mobile dupliquees

- **Fichier** : `css/style.css` lignes 551-562 (dans `@media max-width: 600px`)
- **Probleme** : `.contact-card-label`, `.contact-card-content`, et `.contact-item` sont declares deux fois dans le meme media query (lignes 551-553 puis 560-562, identiques).
- **Correction** : Supprimer les lignes 560-562 (le second bloc duplique).
- **Priorite** : BASSE

---

## Resume des priorites

| Priorite | Ref | Probleme | Effort |
|---|---|---|---|
| **CRITIQUE** | 1 | `tiktokWraps` avant assignation — TypeError | Inverser 2 lignes |
| **MOYENNE** | 2 | pdf.js sans `defer` sur art (regression recurrente) | 1 mot |
| **BASSE** | 3 | `.landing` proprietes dupliquees | Fusionner |
| **BASSE** | 4 | Contact-card mobile regles dupliquees | Supprimer 3 lignes |

---

## Consignes pour l'agent qui corrige

- **Point 1 est un crash JavaScript** — le scroll TikTok, le compteur, et les fleches ne fonctionnent pas du tout. A corriger immediatement.
- **Point 2** revient a chaque iteration. Quand on modifie `art/index.html`, verifier que `defer` est toujours present.
- Points 3 et 4 sont cosmetiques — aucun impact visuel, juste de la proprete CSS.
- Ne changer **rien d'autre** que ce qui est liste.
- Tester les 4 pages (`/`, `/art/`, `/tech/`, `/music/`) apres modifications.
