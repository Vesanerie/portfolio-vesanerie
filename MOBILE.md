# Audit Mobile — Vesanerie-sur-Internet

> Date : 2026-04-24
> Statut : **REFONTE COMPLETE** — toutes les pages corrigees

---

## Breakpoints

| Breakpoint | Cible | Fichiers |
|---|---|---|
| `700px` | Tablette / petit laptop | art.css |
| `600px` | Mobile standard (iPhone, Android) | style.css, art.css, tech.css, music.css |
| `400px` | Petit mobile | art.css |
| `380px` | Tres petit ecran (iPhone SE) | style.css, music.css |

---

## Corrections effectuees

### Homepage (`style.css`)

| Element | Avant | Apres | Pourquoi |
|---|---|---|---|
| Contact card | Glisse depuis la droite (200px) | **Bottom-sheet pleine largeur** avec border-radius top | Plus naturel sur mobile, plus d'espace |
| Contact items | `font-size: 10px`, pas de padding | `13px`, `padding: 14px 0`, `min-height` implicite | Touch target 44px, lisible |
| Theme toggle | `44x24px` | `48x28px` | Meilleur touch target |
| Scroll-top | `38x38px` | `44x44px` | Respect du minimum 44px |
| Landing bio | `10px` | `11px`, `line-height: 1.6` | Lisibilite |
| Landing cards | `height: 160px` | `140px`, gap 14px | Plus compact, moins de scroll |
| About title | `28px` | `26px` | Proportion |
| About items | `12px` inchange | `11px` | Coherence |
| About logo | `40px` | `32px` | Proportion mobile |
| Error 404 | `72px` | `64px` | Pas de debordement |
| Mentions legales | Pas de responsive | `24px` titre, `16px` h2, `12px` texte | Lisibilite |
| Legal link | `10px` | `9px`, repositionne | Discret sur mobile |

### Art (`art.css`)

| Element | Avant | Apres | Pourquoi |
|---|---|---|---|
| Pile view padding | `70px 10px` | `56px 16px` | Moins colle aux bords |
| Pile stack | `max-width: 1100px` (overflow) | `max-width: 100%` | **Fix critique** — plus de scroll horizontal |
| Pile items | `160x220px` | `150x210px`, box-shadow reduit | Meilleure proportion |
| Pile book type | Pas de responsive | `10px` | Coherence |
| Pile phone | `140x260px` | `130x240px`, border-width 3px | Proportion |
| Pile folder | `180x140px` | `160x130px` | Proportion |
| Pile film | `180x240px` | `160x220px` | Proportion |
| Film title | `26px` inchange | `20px` | Lisible sans deborder |
| Gallery padding | `0 20px 40px` | `0 8px 30px` | Plus d'espace pour les images |
| Gallery links | `padding: 8px 0` | `padding: 10px 0`, `min-height: 44px`, flexbox | Touch target |
| Anim label | `14px` | `12px` | Proportion |
| Fiche art | `200px`, `left: -210px` | `180px`, `left: -190px`, border 2px | Plus compact |
| Fiche row | `11px` | `10px` | Lisibilite |
| Book view padding | `60px 10px` | `56px 16px` | Coherence avec pile-view |
| TikTok phone | Border 4px | Border 3px, radius 28px | Plus fin sur mobile |
| TikTok CTA | `16px` padding | `14px`, `padding: 12px 16px` | Touch target |

### Art breakpoint 400px (petit mobile)

| Element | Changement |
|---|---|
| Pile view | `padding: 52px 12px 24px` |
| Pile items | `130x180px` |
| Pile phone | `110x200px` |
| Pile folder | `140x110px` |
| Pile film | `140x190px` |
| Gallery | `columns: 1`, `padding: 0 4px 24px` |
| Book view | `padding: 52px 10px 24px` |

### Tech (`tech.css`)

| Element | Avant | Apres | Pourquoi |
|---|---|---|---|
| Laptop | `max-width: 780px` inchange | `max-width: 100%` | **Fix critique** — plus de debordement |
| `.desktop` | Declare **2 fois** | Fusionne en 1 bloc | Bug fix |
| Fiche back btn | `padding: 2px 8px` | `padding: 6px 12px` | Touch target |
| Fiche content | `padding: 20px 24px` | `padding: 16px` | Moins serre |
| Fiche name | `32px` | `22px` | Pas de debordement |
| Fiche desc | `13px` | `12px` | Lisibilite |
| Fiche header | `flex-row` | `flex-direction: column` | Nom + annee empile |
| App desc | `12px` | `10px` | Proportion |

### Musique (`music.css`)

| Element | Avant (380px seulement) | Apres (600px + 380px) | Pourquoi |
|---|---|---|---|
| Music page | Pas de responsive 600px | `padding: 56px 16px 30px` | Coherence |
| iPod | `320px` (seulement 380px: 250px) | `290px` a 600px, `250px` a 380px | Progression douce |
| iPod wheel | Pas de 600px | `180x180px` a 600px | Proportion |
| iPod tracks | `padding: 5px 8px` | `padding: 8px 10px`, `min-height: 36px` | Touch target |
| Wheel center | Pas de 600px | `60x60px` a 600px | Touch target |

---

## Regles mobile a respecter

1. **Touch targets** : minimum `44x44px` sur tous les elements cliquables
2. **Padding horizontal** : minimum `12px` (jamais `10px` ou moins)
3. **Font-size minimum** : `9px` (legal), `10px` (secondaire), `11px` (body)
4. **Contact card** : bottom-sheet pleine largeur sur mobile
5. **Pas de `max-width` fixe en px** sur les conteneurs principaux — utiliser `100%`
6. **Box-shadow** : reduire sur mobile (3-4px au lieu de 6-8px)
7. **Border-width** : reduire a `2-3px` sur mobile
8. **Videos** : jamais d'`autoplay` sur les vues cachees — lancer via JS a l'ouverture

---

## Pages validees

- [x] Homepage (landing + about + contact + CV + scroll-top)
- [x] Art (pile + dossiers + gallery + lightbox + tiktok + motion + fiche)
- [x] Tech (laptop + fiche + demo)
- [x] Musique (iPod + tracks)
- [x] Mentions legales
- [x] Page 404
