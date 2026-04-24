# Audit complet — Vesanerie-sur-Internet

> Date : 2026-04-24 (14e revision)
> Auteur : Claude (audit automatique)
> Statut : **PROPRE** — 0 bug, 1 point mineur

---

## Structure du projet

Portfolio vanilla HTML/CSS/JS. 6 pages + 404. O2Switch + GitHub Actions FTP. Assets Cloudflare R2.

| Fichier | Lignes | Role |
|---|---|---|
| `index.html` | 222 | Landing (h1 nom, bio, CTA contact), slideshow bg, CV overlay (pdf.js defer+SRI), section A propos (formation, XP, langues), scroll-to-top, contact card, JSON-LD Person, skip-intro sessionStorage |
| `art/index.html` | 499 | Portfolio art — edition (5 PDFs), illustration (3 carnets + gallery 16 + 1 PDF), graphisme (Vesanerie, covers album, 404, esport), motion design (CMP video), animation (6 YT + 1 video), tiktoks (4 embeds + CTA), lightbox, tools-card |
| `tech/index.html` | 108 | Laptop, 5 apps flex-wrap, hover desc, fiche projet, demo iframe, tools-card |
| `music/index.html` | 96 | iPod (320px), 7 tracks, tools-card |
| `mentions-legales.html` | 62 | Mentions legales (editeur, hebergement, PI, RGPD), layout 2 colonnes avec image |
| `404.html` | 29 | Page 404 personnalisee (code + message + bouton retour) |
| `sitemap.xml` | 28 | Sitemap XML (5 URLs avec priorites) |
| `robots.txt` | 5 | Allow all sauf /dist/, pointe vers sitemap |
| `.htaccess` | 1 | ErrorDocument 404 |
| `css/style.css` | 884 | Base, halftone, slideshow, anims, vinyl, CV, contact, tools-card, back-link, about, scroll-top, scroll-reveal, error-page, mentions, no-intro, responsive |
| `css/art.css` | 825 | Pile (5 variantes), has-cover, gallery masonry, lightbox, phone/folder/film, tiktok + CTA, anim-grid, book-view, fiche art, motion-desc, gallery-item-link, responsive |
| `css/tech.css` | 365 | Laptop, desktop flex-wrap, app-desc hover, fiche projet, site-iframe, clavier, responsive |
| `css/pdf-viewer.css` | 157 | PDF reader, curseurs SVG, responsive, hover:none |
| `css/music.css` | 234 | iPod, LCD vert, click wheel, responsive |
| `js/main.js` | 16 | Theme toggle |
| `js/art.js` | 553 | `initPdfJs()`, `artProjects{}`, fiche art, pile/folders, lazy covers, media stop/restore, TikTok scroll, lightbox, PDF viewer, `setBackLink()` dynamique |
| `js/tech.js` | 79 | `projects{}` (5 apps), hover desc, fiche -> demo -> retour |
| `js/music.js` | 70 | Player iPod, auto-next, formatTime guard |

---

## Nouveautes depuis le dernier audit

### SEO
- **Titres enrichis** : "Valentin Mardoukhaev — Designer graphique..." sur toutes les pages (au lieu de juste "Vesanerie")
- **JSON-LD Person** : schema structure sur la homepage (nom, job, sameAs LinkedIn/Malt/Instagram/TikTok/YouTube/Gesturo, formation, competences)
- **URL canonique** (`<link rel="canonical">`) sur les 4 pages principales
- **og:url** ajoute sur toutes les pages
- **Meta descriptions** enrichies avec mots-cles
- **`<h1>` semantique** pour le nom sur la homepage (au lieu de `<div>`)
- **sitemap.xml** + **robots.txt** crees
- **Alt texts** ajoutes sur les images du slideshow homepage
- **Lazy loading** (`loading="lazy"`) sur les images slideshow (sauf la 1re)

### Contenu
- **Section A propos** sur la homepage : bio (Metal Hurlant, profil hybride), blocs Formation, Experience (Sauvages/Cesar, Gesturo, Culture Hot Mag, branding), Langues. Logo en signature en bas.
- **Page mentions legales** : editeur, hebergement O2Switch, PI, pas de cookies. Layout 2 colonnes avec image.
- **Page 404 personnalisee** : "404 / Page introuvable" avec bouton retour accueil + `.htaccess`

### UX
- **Scroll-to-top** : bouton fleche fixe en bas a droite, apparait apres 400px de scroll
- **Scroll reveal** : blocs A propos apparaissent en fondu au scroll (IntersectionObserver)
- **Skip intro** : les animations landing ne jouent qu'une fois par session (sessionStorage)
- **Back-link dynamique** : `setBackLink()` dans art.js — affiche "← Art" dans un dossier, "← Edition" en lecture PDF, "← Accueil" sur la pile principale

### Corrections
- **Back-link simplifie** : supprime le breadcrumb multi-niveaux (trop verbeux), retour au simple lien contextuel
- **Transition de page supprimee** : effet wipe retire (raté visuellement)

---

## Corrections RESTANTES

### 1. CSS — `.desktop` declare deux fois dans le media query

- **Fichier** : `css/tech.css` (dans `@media max-width: 600px`)
- **Probleme** : `.desktop` declare deux fois avec des proprietes differentes
- **Correction** : Fusionner en un seul bloc.
- **Priorite** : BASSE

---

## Verifications

- pdf.js `defer` sur art : **present** (ligne 19)
- pdf.js `defer` + SRI sur index : **present**
- `initPdfJs()` gere le timing defer : **OK**
- TikTok `getItemH()` dynamique : **OK**
- JSON-LD Person valide : **OK** (schema.org)
- Canonical URLs coherentes avec sitemap : **OK**
- sessionStorage skip-intro : **OK** (se reinit a la fermeture d'onglet)
- setBackLink() remplace tous les anciens backLink.textContent : **OK**
- .htaccess 404 : **OK**

---

## Consignes pour tout agent futur

- Site **vanilla HTML/CSS/JS** — pas de framework, pas de bundler.
- Assets sur **Cloudflare R2** (`pub-43a141f7a8b84a30a90fcc01da2114ca.r2.dev`).
- Deploy **O2Switch** via **GitHub Actions FTP**. Toujours push apres commit.
- Quand on modifie `art/index.html`, **verifier que `defer` est present** sur pdf.js.
- Les PDFs lourds peuvent utiliser `data-skip-cover` pour eviter le telechargement en thumbnail.
- Les PDFs comprimes sont dans `/Art/Fanzine/` avec suffixe `_compressé` ou `_compressed`.
- Le titre de chaque page doit commencer par "Valentin Mardoukhaev" pour le SEO.
- Le JSON-LD Person est sur la homepage — mettre a jour si nouveaux reseaux/projets.
