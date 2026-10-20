#!/bin/sh
# Pousse les changements puis vide le cache jsDelivr (TizenBrew charge le module via jsDelivr).
set -e
cd "$(dirname "$0")"

git push

# @main : sans version, jsDelivr reste figé sur un ancien commit.
REPO="gh/gramosukaj/tizenbrew-launcher@main"
for file in $(git ls-files package.json service.js app); do
  curl -s -o /dev/null -w "purge $file: %{http_code}\n" "https://purge.jsdelivr.net/$REPO/$file"
done
