# Accueil — lanceur léger pour TizenBrew

Un écran d'accueil minimaliste pour TV Samsung (Tizen) : tes applis TV et tes modules TizenBrew sur une seule grille, sans pub ni recommandations. HTML/CSS/JS sans framework.

## Installation

Dans TizenBrew : gestionnaire de modules → **Ajouter un Module GitHub** → `gramosukaj/tizenbrew-launcher@main`.

Le `@main` compte : sans lui, jsDelivr reste figé sur un ancien commit.

Pour l'ouvrir à chaque lancement de TizenBrew : **Paramètres → Paramètres AutoLaunch → Accueil**.
Pour revenir au menu TizenBrew malgré l'AutoLaunch, appuie sur ↑ pendant que TizenBrew démarre.

## Personnaliser

Tout se règle dans [`app/config.js`](app/config.js) : rangées, applis (id Tizen, nom, couleur) et libellés des modules. Les applis absentes de la TV sont masquées automatiquement.

## Publier une modification

```bash
./deploy.sh
```

Pousse sur GitHub puis vide le cache jsDelivr. Relance ensuite TizenBrew sur la TV.
