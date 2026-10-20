# Accueil — lanceur premium pour TizenBrew

Un écran d'accueil pour TV Samsung (Tizen) : tes applis TV et tes modules TizenBrew sur une seule grille, avec mise en avant de l'élément sélectionné, lumière d'ambiance aux couleurs de la marque, rangée « Récents » et transitions animées. HTML/CSS/JS sans framework, pensé pour le processeur modeste d'une TV (animations limitées à `transform`/`opacity`, halo dessiné dans un petit canvas).

## Installation

Dans TizenBrew : gestionnaire de modules → **Ajouter un Module GitHub** → `gramosukaj/tizenbrew-launcher@main`.

Le `@main` compte : sans lui, jsDelivr reste figé sur un ancien commit.

Pour l'ouvrir à chaque lancement de TizenBrew : **Paramètres → Paramètres AutoLaunch → Accueil**.
Pour revenir au menu TizenBrew malgré l'AutoLaunch, appuie sur ↑ pendant que TizenBrew démarre.

## Fonctionnement

- `app/` : la page du lanceur (servie par TizenBrew depuis jsDelivr).
- `service.js` : petit service Node lancé par TizenBrew. La page n'a pas accès à l'API `tizen`, ce service lui fournit la liste des applis installées et leur lancement sur `http://127.0.0.1:8095`. Il tourne tant que la TV n'est pas redémarrée : une modification de ce fichier demande un redémarrage complet de la TV.

## Personnaliser

Tout se règle dans [`app/config.js`](app/config.js) : rangées, applis (id Tizen, nom, accroche, dégradé, couleur du halo, logo) et modules. Les applis absentes de la TV sont masquées automatiquement.

Les logos des marques (`app/logos/`) appartiennent à leurs propriétaires respectifs et ne servent qu'à identifier les applis.

## Publier une modification

```bash
./deploy.sh
```

Pousse sur GitHub puis vide le cache jsDelivr. Relance ensuite TizenBrew sur la TV.
