#!/usr/bin/env python3
"""Concatene les CSS de chaque page en un seul fichier par page.

Pourquoi : O2Switch (PowerBoost) renvoie des 429 quand une page reclame trop de
fichiers d'un coup. Mesure a froid sur la home avant correction : 7 fichiers sur
9 en 429, donc un visiteur sans cache recevait la page sans aucun style et avec
les boutons inertes. La page /art etait la pire avec 12 feuilles plus le JS.

Les fichiers sources restent la source de verite, on ne les modifie jamais.
Relancer ce script apres toute modification d'un CSS, puis incrementer
CACHE_NAME dans sw.js :

    python3 build-css.py
"""
import os
import time

RACINE = os.path.dirname(os.path.abspath(__file__))

COMMUN = ['css/variables.css', 'css/base.css', 'css/components/theme-toggle.css']

# un bundle par page : sortie -> liste ordonnee des sources
BUNDLES = {
    'css/home.css': COMMUN + [
        'css/components/liens.css',
        'css/components/landing.css',
        'css/components/cards.css',
        'css/components/about.css',
        'css/components/scroll.css',
    ],
    'css/art.bundle.css': COMMUN + [
        'css/components/cards.css',
        'css/components/scroll.css',
        'css/components/pile.css',
        'css/components/gallery.css',
        'css/components/film.css',
        'css/components/anim.css',
        'css/components/tiktok.css',
        'css/components/art-fiche.css',
        'css/pdf-viewer.css',
    ],
    'css/tech.bundle.css': COMMUN + [
        'css/components/cards.css',
        'css/components/scroll.css',
        'css/tech.css',
    ],
    'css/music.bundle.css': COMMUN + [
        'css/components/cards.css',
        'css/components/scroll.css',
        'css/music.css',
    ],
    'css/mentions.bundle.css': COMMUN + ['css/components/mentions.css'],
    'css/erreur.bundle.css': COMMUN + ['css/components/error-page.css'],
}


def construit(sortie, sources):
    morceaux = [
        "/* ============================================================\n"
        "   FICHIER GENERE PAR build-css.py, NE PAS EDITER A LA MAIN.\n"
        "   Editer les fichiers sources puis relancer : python3 build-css.py\n"
        f"   Genere le {time.strftime('%Y-%m-%d %H:%M')}\n"
        "   ============================================================ */\n"
    ]
    for rel in sources:
        chemin = os.path.join(RACINE, rel)
        if not os.path.exists(chemin):
            raise SystemExit(f'Source introuvable : {rel}')
        morceaux.append(f"\n/* ----- {rel} ----- */\n")
        morceaux.append(open(chemin, encoding='utf-8').read().rstrip() + '\n')

    contenu = ''.join(morceaux)
    open(os.path.join(RACINE, sortie), 'w', encoding='utf-8').write(contenu)
    return len(sources), len(contenu.encode('utf-8'))


def main():
    for sortie, sources in BUNDLES.items():
        n, poids = construit(sortie, sources)
        print(f'  {sortie:26} {n:2} fichiers  {poids // 1024:3} Ko')
    print('\nPense a incrementer CACHE_NAME dans sw.js.')


if __name__ == '__main__':
    main()
