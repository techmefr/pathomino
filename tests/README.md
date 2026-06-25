# Tests Pathomino (Playwright)

Tests E2E **de développement uniquement** — le jeu (`index.html` + `pathomino.js`)
reste sans aucune dépendance. Playwright n'est installé que dans ce dossier.

## Installation (une fois)

```bash
cd tests
npm run setup   # npm install + télécharge le navigateur Chromium
```

## Lancer

```bash
npm test          # responsive + parcours de jeu + personnages
npm run devices   # responsive : mobile / tablette / laptop / desktop / TV (+ rotation)
npm run qa        # parcours complet + capture des erreurs JS, 100% hors-ligne
npm run chars     # personnages : déblocages, profils Balatro, pentominos, triche, soin
```

Chaque script démarre son propre `python3 -m http.server` sur la racine du repo,
pilote le composant React via sa fiber, et sort en code ≠ 0 si un problème est trouvé
(utilisable en CI).

## Ce qui est vérifié

- **devices.mjs** — chaque écran (home, select, plan, combat, boutique, résultat)
  tient dans le viewport sans débordement ni clipping, sur 18 gabarits d'appareils,
  en portrait, paysage et rotation live. Capture aussi les erreurs JS par appareil.
- **qa.mjs** — déroule invité → select → plan → combat → boutique → mort, en
  bloquant tout le réseau externe (prouve le fonctionnement hors-ligne et le chargement
  local des polices), et remonte toute erreur `pageerror` / `console.error`.
- **chars.mjs** — les 5 personnages : échelle de déblocage (1/3/5/7 boss), profils par
  perso (défausses, pioches de pièces, main de cartes, jeu de formes), pentominos du
  Voleur, pouvoir −1 carte du Tricheur, soin du Paladin, offres de recharge en boutique.

## Notes d'implémentation

Les tests atteignent l'instance du composant via la fiber React de `#pm-root` puis
appellent directement ses méthodes (`startRun`, `beginCombat`, `floorComplete`,
`death`…). Si une de ces méthodes est renommée, mettre à jour les sélecteurs ici.
