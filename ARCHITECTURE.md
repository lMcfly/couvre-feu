# Architecture de Couvre-Feu

Le jeu publié est **un seul fichier**, `index.html`, jouable hors ligne. On ne le modifie jamais à la main :
il est **assemblé** à partir des sources rangées dans `src/`.

```
src/
  head.html, body.html, tail.html   le squelette HTML (écrans, menus, fenêtres)
  css/polices.css, css/style.css    polices hébergées et styles
  ordre.json                        l'ordre de chargement des fichiers JavaScript
  js/
    noyau/      utilitaires, réglages et scores, données (armes, persos…), canvas, audio, entrées
    monde/      sol et niveau (carte, obstacles, secteurs)
    entites/    armes et joueur, zombies et boss, projectiles et dangers, marché noir et directeur de hordes
    jeu/        la classe Game (boucle, état) et ses modules : modes, campagne, capacités,
                combat et boss, effets, deux joueurs, progression (mutations, accessoires, effets de fin)
    rendu/      dessin du monde, des personnages, des boss et de l'interface en jeu
    bd/         les cases de BD : moteur, décors, personnages, scénario
    reseau/     Duo en ligne (mise en relation, WebRTC, synchronisation hôte → invité)
    demarrage/  30 : création de l'objet game ; 40 : ouverture, hors ligne, plein écran, boucle d'images
    menus/      curseur manette, réglages, accueil et perso, hub et arsenal, actus et photo,
                boutons et panneaux de l'accueil, lancement des modes, bestiaire et touches, Nouveautés,
                écran Campagne animé
tools/
  build.js      assemble src/ → index.html
  check.js      vérifications sans dépendance (voir plus bas)
  smoke.js      test rapide dans un vrai navigateur (Playwright)
  publier.sh    assemble, vérifie, teste, change la version du cache hors ligne, commit et push
```

## Principes

- **Un fichier = un rôle.** Les fichiers sont numérotés dans l'ordre où ils se chargent (`src/ordre.json`) :
  un fichier ne peut utiliser au chargement que ce qui est défini avant lui (les fonctions appelées plus tard, elles, peuvent être n'importe où).
- **Avant / après `demarrage/30-creation-du-jeu.js`.** Les fichiers d'avant ne font que définir (classes, données, fonctions) ;
  c'est là qu'est créé `game`. Les fichiers d'après (menus, démarrage) peuvent s'en servir dès leur chargement.
- **La classe `Game` est découpée en modules.** Le noyau (`jeu/12-jeu.js`) contient l'état et la boucle ;
  chaque autre fichier ajoute ses méthodes avec `mixin(Game, { … })`.
  `mixin` refuse d'écraser une méthode qui existe déjà : un doublon arrête le jeu au chargement au lieu de casser une fonction en silence.
- **Tout est dessiné par le code** (canvas 2D), sons compris (Web Audio) : aucune image ni aucun son externe, à part les polices.
- **Rien n'est dessiné avant d'être utile.** Les portraits de la galerie, des accessoires et des crédits sont dessinés
  à la première ouverture de leur écran (ou quand le navigateur est libre, avec `whenIdle`) : le jeu démarre ~4× plus vite.
- **Pas de dépendance à l'exécution.** Les outils n'utilisent que Node ; Playwright sert seulement au test rapide.

## Travailler sur le jeu

```bash
node tools/build.js          # après chaque modification de src/
node tools/check.js          # vérifications (≈ 1 s)
node tools/smoke.js          # test rapide dans le navigateur (≈ 1 min)
tools/publier.sh "message"   # tout ce qui précède, puis publication sur GitHub Pages
```

Le crochet `.githooks/pre-commit` (activé par `git config core.hooksPath .githooks`) refuse un commit si
`index.html` n'a pas été réassemblé ou si les vérifications échouent. GitHub refait les mêmes vérifications à chaque envoi.

## Ce que vérifie `check.js`

1. chaque fichier de `src/js` est listé dans `src/ordre.json`, et inversement ;
2. le jeu assemblé est du JavaScript valide ;
3. aucun commentaire `//` n'avale du code écrit après lui sur la même ligne (utiliser `/* … */` au milieu d'une ligne) ;
4. aucune méthode n'est écrite deux fois dans une même classe ou un même mixin ;
5. les fichiers mis en cache hors ligne par `sw.js` existent.
