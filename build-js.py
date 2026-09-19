#!/usr/bin/env python3
"""Concatene les JS de chaque page en un seul fichier par page.

Meme raison que build-css.py : O2Switch renvoie des 429 quand une page reclame
trop de fichiers d'un coup. La page /art tirait 8 scripts et ils revenaient tous
en 429 a froid, donc lightbox, fiches, tiktok et tilt etaient morts pour un
visiteur sans cache.

Cas particulier de /art : ses scripts sont des modules ES. Le graphe est simple,
seul art.js importe et les modules feuilles n'importent rien entre eux. On peut
donc les concatener dans l'ordre en retirant les lignes import et le mot-cle
export, le tout enveloppe dans une IIFE. Le script verifie qu'aucun nom declare
au premier niveau n'entre en collision, et s'arrete si c'est le cas.

    python3 build-js.py
"""
import os
import re
import subprocess
import time

RACINE = os.path.dirname(os.path.abspath(__file__))

# js/main.js est toujours place en tete et HORS de l'IIFE : il definit
# toggleTheme(), appele par des onclick inline dans le HTML. L'enfermer le
# rendrait invisible et casserait le bouton mode nuit.
GLOBAL = 'js/main.js'

# sortie -> (liste ordonnee des sources, est_module)
BUNDLES = {
    'js/art.bundle.js': ([
        'js/art/state.js',
        'js/art/fiche.js',
        'js/art/lightbox.js',
        'js/art/pdf-viewer.js',
        'js/art/cinema.js',
        'js/art/tiktok.js',
        'js/art/tilt.js',
        'js/art.js',
    ], True),
    'js/tech.bundle.js': (['js/main.js', 'js/tech.js'], False),
    'js/music.bundle.js': (['js/main.js', 'js/music.js'], False),
}

RE_IMPORT = re.compile(r'^\s*import\s.*?;\s*$', re.M)
RE_EXPORT = re.compile(r'^(\s*)export\s+(const|let|var|function|async|class)\b', re.M)
RE_DECL = re.compile(r'^(?:export\s+)?(?:const|let|var|function|async function|class)\s+([A-Za-z_$][\w$]*)', re.M)


def lit(rel):
    chemin = os.path.join(RACINE, rel)
    if not os.path.exists(chemin):
        raise SystemExit(f'Source introuvable : {rel}')
    return open(chemin, encoding='utf-8').read()


def verifie_collisions(sources):
    """Deux modules qui declarent le meme nom casseraient la concatenation."""
    vus, collisions = {}, []
    for rel in sources:
        for nom in set(RE_DECL.findall(lit(rel))):
            if nom in vus:
                collisions.append(f'{nom} ({vus[nom]} et {rel})')
            else:
                vus[nom] = rel
    return collisions


def construit(sortie, sources, module):
    if module:
        collisions = verifie_collisions(sources)
        if collisions:
            raise SystemExit('Noms declares en double, concatenation impossible :\n  '
                             + '\n  '.join(collisions))

    entete = ("/* ============================================================\n"
              "   FICHIER GENERE PAR build-js.py, NE PAS EDITER A LA MAIN.\n"
              "   Editer les sources puis relancer : python3 build-js.py\n"
              f"   Genere le {time.strftime('%Y-%m-%d %H:%M')}\n"
              "   ============================================================ */\n")

    corps = []
    for rel in sources:
        code = lit(rel)
        if module:
            code = RE_IMPORT.sub('', code)
            code = RE_EXPORT.sub(r'\1\2', code)
        corps.append(f"\n/* ----- {rel} ----- */\n{code.rstrip()}\n")

    if module:
        global_js = lit(GLOBAL)
        contenu = (entete + f"\n/* ----- {GLOBAL} (hors IIFE : fonctions appelees en inline) ----- */\n"
                   + global_js.rstrip() + '\n'
                   + '\n(function(){\n"use strict";\n' + ''.join(corps) + '\n})();\n')
    else:
        contenu = entete + ''.join(corps)
    open(os.path.join(RACINE, sortie), 'w', encoding='utf-8').write(contenu)

    # on refuse de livrer un fichier qui ne parse pas
    r = subprocess.run(['node', '--check', os.path.join(RACINE, sortie)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f'{sortie} ne parse pas :\n{r.stderr[:400]}')
    return len(sources), len(contenu.encode('utf-8'))


def main():
    for sortie, (sources, module) in BUNDLES.items():
        n, poids = construit(sortie, sources, module)
        print(f'  {sortie:24} {n} fichiers  {poids // 1024:3} Ko  syntaxe OK')
    print('\nPense a incrementer CACHE_NAME dans sw.js.')


if __name__ == '__main__':
    main()
