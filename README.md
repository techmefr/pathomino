# Pathomino

Un puzzle-roguelike de donjon : trace ton chemin avec des pièces géométriques
(tétrominos), combats avec des mains de poker, survis le plus longtemps possible.

**Jouer :** https://techmefr.github.io/pathomino/ (une fois GitHub Pages activé)

## Stack

Prototype web autonome, sans build et **sans aucune dépendance réseau** (marche hors-ligne) :

- `index.html` — coquille HTML : styles, montage React, ordre de chargement des scripts.
- `data.js` — données / config du jeu (`window.PM`) : persos, jokers, formes, sprites, boss, armes, couleurs, icônes SVG. **C'est ici qu'on équilibre.**
- `pathomino.js` — le composant `Pathomino` (state, logique de jeu, petits rendus).
- `render-plan.js` / `render-combat.js` / `render-shop.js` — les gros écrans, qui étendent `Pathomino.prototype` (chargés après `pathomino.js`).
- `vendor/` — React 18 (UMD) et les polices (Space Grotesk, Press Start 2P), servis en local.
- `tests/` — tests Playwright (responsive, parcours, personnages). Voir `tests/README.md`.

> Découpé en plusieurs `<script>` classiques (pas de modules ES) pour rester jouable en `file://`.

Aucun serveur requis : **double-clique `index.html`** (`file://`) et c'est jouable.

Pour reproduire les conditions GitHub Pages, sers le dossier avec n'importe quel
serveur statique, par exemple :

```bash
npx serve .
# ou : python3 -m http.server 8080
```

## Origine

Porté depuis le prototype `Pathomino.dc.html` (designer Claude). La couche DSL
propriétaire (`<x-dc>`, `<sc-if>`, runtime `support.js`) a été retirée : la
logique est désormais un composant React standard monté directement.

> Prochaine étape envisagée : réécriture native en **Svelte** + packaging
> **Capacitor** une fois l'approche validée.

## Sauvegarde

Pseudo et meilleur score sont stockés en `localStorage` (par appareil).
