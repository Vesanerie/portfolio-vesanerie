#!/usr/bin/env python3
"""Concatene les CSS de la landing en un seul fichier.

Pourquoi : O2Switch (PowerBoost) renvoie des 429 quand une page reclame trop de
fichiers d'un coup. La home demandait 8 feuilles plus le JS, et un visiteur qui
arrivait sans cache recevait la page sans styles. Un seul fichier regle le probleme.

Les fichiers sources restent la source de verite, on ne les modifie jamais.
Relancer ce script apres toute modification d'un CSS de la landing :

    python3 build-css.py
"""
import os
import time

RACINE = os.path.dirname(os.path.abspath(__file__))

# l'ordre compte : variables et base d'abord, puis les composants
SOURCES = [
    'css/variables.css',
    'css/base.css',
    'css/components/theme-toggle.css',
    'css/components/liens.css',
    'css/components/landing.css',
    'css/components/cards.css',
    'css/components/about.css',
    'css/components/scroll.css',
]
SORTIE = 'css/home.css'


def main():
    morceaux = [
        "/* ============================================================\n"
        "   FICHIER GENERE PAR build-css.py, NE PAS EDITER A LA MAIN.\n"
        "   Editer les fichiers sources puis relancer : python3 build-css.py\n"
        f"   Genere le {time.strftime('%Y-%m-%d %H:%M')}\n"
        "   ============================================================ */\n"
    ]
    for rel in SOURCES:
        chemin = os.path.join(RACINE, rel)
        if not os.path.exists(chemin):
            raise SystemExit(f'Source introuvable : {rel}')
        morceaux.append(f"\n/* ----- {rel} ----- */\n")
        morceaux.append(open(chemin, encoding='utf-8').read().rstrip() + '\n')

    contenu = ''.join(morceaux)
    dest = os.path.join(RACINE, SORTIE)
    open(dest, 'w', encoding='utf-8').write(contenu)

    poids = len(contenu.encode('utf-8'))
    print(f'{SORTIE} : {len(SOURCES)} fichiers concatenes, {poids // 1024} Ko')
    print('Pense a incrementer CACHE_NAME dans sw.js si le contenu a change.')


if __name__ == '__main__':
    main()
