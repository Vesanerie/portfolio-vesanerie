#!/bin/bash
# Concatene les modules JS en un seul fichier servi par index.html.
#
# Pourquoi : O2Switch applique un rate limit et renvoie des 429 quand la page
# demande 5 fichiers JS d'un coup. Un seul fichier = une seule requete, et ca
# allege aussi le chargement en partage de connexion 4G.
#
# La source reste modulaire dans js/. On ne modifie JAMAIS js/assiette.js a la main.
set -e

cd "$(dirname "$0")"

ORDRE="js/dom.js js/methode.js js/aliments.js js/store.js js/app.js"
SORTIE="js/assiette.js"

{
  echo "/* Assiette - fichier genere par build.sh, ne pas editer a la main."
  echo "   Source : $ORDRE */"
  echo
  for f in $ORDRE; do
    echo "/* ===== $f ===== */"
    cat "$f"
    echo
  done
} > "$SORTIE"

echo "$SORTIE genere ($(wc -c < "$SORTIE" | tr -d ' ') octets, $(echo $ORDRE | wc -w | tr -d ' ') modules)"

# Verification syntaxique du resultat concatene
if command -v node >/dev/null 2>&1; then
  node --check "$SORTIE" && echo "syntaxe OK"
fi
