# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-22 (9e revision — aucun changement depuis la 8e)
> Auteur : Claude (audit automatique)
> Statut : **1 bug critique**, sinon tres propre

---

## Structure du projet

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 101 | Landing (Tech/Art/Musique) + bio + email + CV overlay (pdf.js defer+SRI) + contact card |
| `art/index.html` | 368 | Portfolio art — edition, graphisme, illustration, esport, animation, tiktoks, carnets, PDF viewer, lightbox, tools-card |
| `tech/index.html` | 109 | Page tech — laptop 5 apps (position absolue) + tooltips (hover:hover) + iframe + tools-card |
| `music/index.html` | 77 | Page musique — iPod classic (380px) + player 3 tracks + tools-card |
| `css/style.css` | 580 | Base + halftone + landing (animations fadeInUp/cardDrop) + vinyl + CV + contact + tools-card + responsive |
| `css/art.css` | 692 | Pile, folder, film, phone, gallery (content-visibility), lightbox, tiktok, anim-grid, book-view, responsive |
| `css/tech.css` | 282 | Laptop + tooltips (hover:hover + mobile hide) + positions absolues + responsive |
| `css/pdf-viewer.css` | 158 | PDF reader + curseurs custom + responsive + hover:none |
| `css/music.css` | 235 | iPod classic + responsive |
| `js/main.js` | 17 | Toggle theme |
| `js/art.js` | 506 | Pile + lazy covers (skip heavy PDFs) + folders + media stop/restore + PDF (mobile single) + TikTok + lightbox (fleches) + gallery-pdf |
| `js/tech.js` | 25 | Bureau → iframe |
| `js/music.js` | 70 | Player audio iPod |

---

## Corrections RESTANTES

### 1. BUG CRITIQUE — `tiktokWraps` utilise avant assignation

- **Fichier** : `js/art.js` ligne 82
- **Probleme** : `var itemH = tiktokWraps[0] ? tiktokWraps[0].offsetHeight : 580;` utilise `tiktokWraps` qui est declare ligne 84. Le `var` hoisting fait que la variable vaut `undefined` → `undefined[0]` lance un `TypeError` → tout le bloc TikTok est mort (compteur, fleches, stop au scroll).
- **Correction** : Inverser les lignes 82 et 84 :
  ```js
  var tiktokWraps = tiktokScroll.querySelectorAll('.tiktok-embed-wrap');
  var itemH = tiktokWraps[0] ? tiktokWraps[0].offsetHeight : 580;
  ```
- **Priorite** : **CRITIQUE**

### 2. PERF — pdf.js sans `defer` sur art/index.html

- **Fichier** : `art/index.html` ligne 18
- **Probleme** : Le script pdf.js (~800KB) est charge en synchrone dans le `<head>`, bloquant le rendu. Le `defer` a ete ajoute puis retire a plusieurs reprises au fil des iterations.
- **Correction** : Ajouter `defer` apres `src` : `<script defer src="...pdf.min.js" ...></script>`.
- **Priorite** : MOYENNE

### 3. CSS — proprietes dupliquees dans `.landing`

- **Fichier** : `css/style.css` lignes 131-142
- **Probleme** : `padding: 10px 20px;` (ligne 138) est immediatement ecrase par `padding-top: 40px; padding-bottom: 30px;` (lignes 140-141). L'ancien `justify-content: center` en double a ete corrige mais le padding reste incoherent.
- **Correction** : Remplacer par `padding: 40px 20px 30px;` et supprimer les lignes 140-141.
- **Priorite** : BASSE

### 4. CSS — regles contact-card mobile dupliquees

- **Fichier** : `css/style.css` lignes 579-587 et 588-590
- **Probleme** : `.contact-card-label`, `.contact-card-content` et `.contact-item` sont declares deux fois identiquement dans le meme media query `@media (max-width: 600px)`.
- **Correction** : Supprimer les lignes 588-590 (second bloc identique).
- **Priorite** : BASSE

---

## Resume

| Priorite | Ref | Probleme | Effort |
|---|---|---|---|
| **CRITIQUE** | 1 | `tiktokWraps` TypeError — TikTok casse | Inverser 2 lignes |
| **MOYENNE** | 2 | pdf.js sans `defer` sur art | 1 mot |
| **BASSE** | 3 | `.landing` padding incoherent | 1 ligne |
| **BASSE** | 4 | Contact-card mobile duplique | Supprimer 3 lignes |

---

## Consignes pour l'agent qui corrige

- **Point 1** : crash JS — le TikTok ne fonctionne pas du tout. Corriger en priorite absolue.
- **Point 2** : regression recurrente — a chaque modif de `art/index.html`, verifier que `defer` est present.
- Points 3-4 : proprete CSS, aucun impact visuel.
- Ne changer rien d'autre.
- Tester les 4 pages apres modifications.
