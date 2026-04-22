# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-22 (6e revision)
> Auteur : Claude (audit automatique)
> Statut : **bon etat** — 28 corriges, 12 restants (dont 2 bugs)

---

## Structure du projet

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 98 | Landing (Tech/Art/Musique) + bio + CV overlay + contact card |
| `art/index.html` | 354 | Portfolio art — pile, edition, illustration, graphisme, esport, animation, tiktoks, carnets, PDF viewer, lightbox |
| `tech/index.html` | 99 | Page tech — laptop 5 apps avec tooltips + iframe |
| `music/index.html` | 67 | Page musique — iPod classic + player audio 3 tracks |
| `css/style.css` | 467 | Base + halftone + landing + vinyl + CV card + contact card + responsive mobile |
| `css/art.css` | 693 | Pile, folder, film, phone, gallery, lightbox, tiktok, anim-grid, book-view, responsive |
| `css/tech.css` | 266 | Laptop + tooltips + responsive |
| `css/pdf-viewer.css` | 158 | PDF reader fullscreen + curseurs custom + responsive mobile + touch |
| `css/music.css` | 235 | iPod classic + responsive |
| `js/main.js` | 17 | Toggle theme |
| `js/art.js` | 489 | Pile + folders + media stop/restore + PDF + TikTok + lightbox (fleches) + gallery-pdf |
| `js/tech.js` | 25 | Bureau → iframe |
| `js/music.js` | 70 | Player audio iPod |

---

## Corrections RESTANTES

### 1. BUG — `itemH = 580` casse le scroll TikTok sur mobile

- **Fichier** : `js/art.js` ligne 70
- **Probleme** : `var itemH = 580` est hardcode, mais le CSS change la hauteur de `.tiktok-embed-wrap` a `480px` sous 700px et `400px` sous 400px (`art.css:645-646` et `685-686`). Le calcul de scroll (`scrollTop / itemH`) est faux sur mobile — le compteur et les fleches sautent des videos.
- **Correction** : Lire dynamiquement : `var itemH = tiktokScroll.querySelector('.tiktok-embed-wrap').offsetHeight || 580;`.
- **Priorite** : **HAUTE** (bug visible sur mobile)

### 2. BUG — double handler sur le bouton CV

- **Fichier** : `index.html` lignes 23-24 et 81-82
- **Probleme** : Le bouton `.cv-card` a un `onclick="...classList.toggle('open')"` ET un `addEventListener('click')` en JS qui fait `classList.add('open')`. Au clic pour fermer : l'onclick toggle (retire 'open'), puis le JS le remet ('add'). Resultat : impossible de fermer le CV via le bouton.
- **Correction** : Retirer le `onclick` du bouton HTML (ligne 23) et laisser uniquement le handler JS.
- **Priorite** : **HAUTE** (bug fonctionnel)

### 3. SECURITE — pdf.js sans SRI sur index.html

- **Fichier** : `index.html` ligne 76
- **Probleme** : `<script src="https://cdnjs.cloudflare.com/.../pdf.min.js"></script>` sans `integrity` ni `crossorigin`. La page art a le SRI, mais pas la landing.
- **Correction** : Ajouter les memes attributs `integrity` et `crossorigin="anonymous"` que sur `art/index.html:18`.
- **Priorite** : MOYENNE

### 4. PERF — pdf.js charge en synchrone sur la landing

- **Fichier** : `index.html` ligne 76
- **Probleme** : pdf.js (~800KB) est charge en synchrone dans le body de la landing juste pour le CV. Bloque le rendu.
- **Correction** : Ajouter `defer` au script. Le code inline qui l'utilise devrait etre dans un `DOMContentLoaded` ou un fichier separe charge apres.
- **Priorite** : MOYENNE

### 5. PERF — pdf.js sans `defer` sur art/index.html (regression persistante)

- **Fichier** : `art/index.html` ligne 18
- **Probleme** : Le `defer` a ete ajoute puis retire. Le script bloque toujours le rendu.
- **Correction** : Ajouter `defer`.
- **Priorite** : MOYENNE

### 6. A11Y — contact card non accessible

- **Fichier** : `index.html` ligne 61
- **Probleme** : `<div class="contact-card" onclick="...">` n'est pas navigable au clavier (pas de tabindex, pas de role, pas de keydown).
- **Correction** : Remplacer par `<button class="contact-card" onclick="...">` ou ajouter `tabindex="0" role="button"` et un handler keydown.
- **Priorite** : BASSE

### 7. JS — `isAnimating` jamais active

- **Fichier** : `js/art.js` lignes 326 et 359
- **Probleme** : Garde morte — `isAnimating` est teste mais jamais mis a `true`.
- **Correction** : Supprimer les 2 lignes.
- **Priorite** : BASSE

### 8. CSS — `.has-cover` couleur hardcodee

- **Fichier** : `css/art.css` ligne 124
- **Probleme** : `color: #f0ece4` en dur au lieu de `var(--bg)`.
- **Correction** : Remplacer par `color: var(--bg);`.
- **Priorite** : BASSE

### 9. SEO — page musique sans Open Graph

- **Fichier** : `music/index.html`
- **Probleme** : Pas de balises `og:title`, `og:description`, `og:type`.
- **Correction** : Ajouter les 3 meta OG dans le `<head>`.
- **Priorite** : BASSE

### 10. CSS — `.gallery-pdf-label` jamais utilise

- **Fichier** : `css/art.css` lignes 189-201
- **Probleme** : Classe CSS definie mais absente du HTML. Code mort.
- **Correction** : Supprimer le bloc.
- **Priorite** : BASSE

### 11. HTML — canvas gallery-pdf sans dimensions

- **Fichier** : `art/index.html` ligne 125
- **Probleme** : `<canvas id="voiture-cover"></canvas>` sans dimensions — layout shift a la gallery.
- **Correction** : Ajouter `style="aspect-ratio: 3/4;"` ou des attributs `width`/`height`.
- **Priorite** : BASSE

### 12. CSS — selecteur `body > *:not(...)` fragile

- **Fichier** : `css/style.css` ligne 65
- **Probleme** : `body > *:not(.gallery-lightbox):not(.theme-toggle):not(.back-link):not(.cv-card):not(.contact-card):not(.cv-overlay)` — chaque nouvel element fixe doit etre exclu manuellement. Fragile et en croissance.
- **Correction** : Inverser la logique : mettre `position: relative; z-index: 1;` sur `.landing`, `.pile-view`, `.tech-page`, `.music-page`, `.book-view` directement, au lieu d'exclure tous les elements fixes.
- **Priorite** : BASSE

---

## Resume des priorites

| Priorite | Ref | Probleme | Effort |
|---|---|---|---|
| **HAUTE** | 1 | `itemH=580` casse TikTok sur mobile | 1 ligne |
| **HAUTE** | 2 | Double handler bouton CV (impossible de fermer) | 1 ligne |
| **MOYENNE** | 3 | pdf.js sans SRI sur index.html | 1 ligne |
| **MOYENNE** | 4 | pdf.js synchrone sur landing | 1 mot + refacto inline JS |
| **MOYENNE** | 5 | pdf.js sans `defer` sur art (regression) | 1 mot |
| **BASSE** | 6 | Contact card non accessible | 1 ligne |
| **BASSE** | 7 | `isAnimating` garde morte | 2 lignes |
| **BASSE** | 8 | `.has-cover` couleur hardcodee | 1 ligne |
| **BASSE** | 9 | OG manquant page musique | 3 lignes |
| **BASSE** | 10 | `.gallery-pdf-label` CSS mort | Suppression |
| **BASSE** | 11 | Canvas sans dimensions | 1 ligne |
| **BASSE** | 12 | Selecteur `body > *:not()` fragile | Refacto |

---

## Consignes pour l'agent qui corrige

- Ne changer **rien d'autre** que ce qui est liste ci-dessus.
- Ne creer **aucun nouveau fichier**.
- Garder le style de code existant (vanilla JS, pas de framework).
- Tester les 4 pages (`/`, `/art/`, `/tech/`, `/music/`) apres modifications.
- **Points 1 et 2 sont des bugs visibles** — a corriger en priorite.
- **Point 5** est une regression recurrente — surveiller que `defer` ne disparaisse plus.
