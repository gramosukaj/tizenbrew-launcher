#!/bin/sh
# Pousse les changements puis vide le cache jsDelivr (TizenBrew charge le module via jsDelivr).
set -e
cd "$(dirname "$0")"

git push

REPO="gh/gramosukaj/tizenbrew-launcher"
for file in package.json app/index.html app/config.js app/launcher.js; do
  curl -s -o /dev/null -w "purge $file: %{http_code}\n" "https://purge.jsdelivr.net/$REPO/$file"
done
