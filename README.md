# Pathomino

Un puzzle-roguelike de donjon : trace ton chemin avec des pièces géométriques
(tétrominos), combats avec des mains de poker, survis le plus longtemps possible.

**Jouer :** https://techmefr.github.io/pathomino/ (une fois GitHub Pages activé)

## Stack

Prototype web autonome, sans build :

- `index.html` — coquille HTML : polices, styles, montage React.
- `pathomino.js` — toute la logique de jeu (composant `React.Component`).
- React 18 chargé via CDN (`unpkg`).

Ouvre simplement `index.html` dans un navigateur, ou sers le dossier :

```bash
python3 -m http.server 8080
# puis http://localhost:8080
```

## Origine

Porté depuis le prototype `Pathomino.dc.html` (designer Claude). La couche DSL
propriétaire (`<x-dc>`, `<sc-if>`, runtime `support.js`) a été retirée : la
logique est désormais un composant React standard monté directement.

> Prochaine étape envisagée : réécriture native en **Svelte** + packaging
> **Capacitor** une fois l'approche validée.

## Sauvegarde

Pseudo et meilleur score sont stockés en `localStorage` (par appareil).
