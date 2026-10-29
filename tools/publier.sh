#!/bin/bash
# Publie le jeu : assemble, vérifie, teste, change la version du cache hors ligne, puis envoie sur GitHub (GitHub Pages).
# Usage : tools/publier.sh "Message de commit"        (ajouter --sans-envoi pour tout faire sauf le push)
set -euo pipefail
cd "$(dirname "$0")/.."
MSG="${1:-}"; [ -z "$MSG" ] && { echo 'usage : tools/publier.sh "message"'; exit 1; }
node tools/build.js
node tools/check.js
node tools/smoke.js --require
V=$(grep -o "couvre-feu-v[0-9]*" sw.js | head -1 | grep -o "[0-9]*$"); N=$((V + 1))
sed -i "s/couvre-feu-v$V'/couvre-feu-v$N'/" sw.js && echo "cache hors ligne : v$V → v$N"
git add -A && git commit -q -m "$MSG" && echo "commit : $(git log --oneline -1)"
[ "${2:-}" = "--sans-envoi" ] && exit 0
for d in 0 2 4 8 16; do sleep $d; git push -u origin "$(git branch --show-current)" && exit 0; done
echo "envoi impossible (réseau ?)"; exit 1
