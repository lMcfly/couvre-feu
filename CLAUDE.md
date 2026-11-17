# Couvre-Feu — règles pour Claude et ses sous-agents

Jeu de survie zombie en HTML5 (canvas 2D + Web Audio), un seul fichier `index.html` jouable hors ligne,
sur PC, téléphone et manette, en solo, à deux ou en ligne. Tout le projet est en français
(code commenté en français, noms de fichiers en français) : on continue ainsi.

## Règles qui ne se discutent pas
1. **Ne jamais modifier `index.html` à la main.** Il est assemblé depuis `src/` par `node tools/build.js`.
2. **Ordre de chargement** : tout fichier JS de `src/js` doit être listé dans `src/ordre.json`.
   Un fichier ne peut utiliser *au chargement* que ce qui est défini avant lui.
   Avant `demarrage/30-creation-du-jeu.js` : on ne fait que définir. `game` (alias `window.__cf`) est créé là.
3. **La classe `Game` est découpée en mixins** : `mixin(Game, { … })`. `mixin` refuse d'écraser une méthode :
   avant d'ajouter une méthode, chercher (`grep -rn "nomMethode("`) qu'elle n'existe pas déjà ailleurs.
4. **Commentaires** : `//` seulement en fin de ligne sans code après ; au milieu d'une ligne, `/* … */`.
5. **Aucun asset externe** (images, sons) : tout est dessiné et synthétisé par le code. Seules les polices de `fonts/` existent.
6. **Aucune dépendance à l'exécution.** Les outils n'utilisent que Node ; Playwright sert seulement aux tests.
7. Ne pas toucher à `sw.js` (version du cache) : c'est `tools/publier.sh` qui la change.
8. Publication : l'utilisateur veut que chaque version terminée soit publiée sans lui demander.
   On publie avec `bash tools/publier.sh "message"` (assemble, vérifie, teste, change la version du cache, commit, push),
   seulement après une boucle de vérification réussie. Jamais de `git push` qui contourne ce script pour le jeu.

## Boucle de vérification (obligatoire avant de dire « terminé »)
```bash
node tools/build.js && node tools/check.js && node tools/smoke.js
```
Si une commande échoue, corriger puis relancer. Ne jamais déclarer une tâche finie avec une vérification en échec.

## Carte du code
- `noyau/` : utilitaires (`rand`, `randi`…), réglages et scores (+ classement Supabase), données
  (`03-donnees.js` : `WEAPONS`, `CHARS`, `DIFFS`, `ZTYPES`, `ZCFG`, `HORDE_W`, `HOSP_W`, `MEDAL_PAR`, `RADIO`…),
  canvas (`SpatialHash`), audio, entrées.
- `monde/` : sol, niveau, secteurs. `entites/` : `Weapon`, `Player`, `Zombie`, `Boss`, projectiles, `Shop`, `Director`.
- `jeu/` : `Game` (boucle, état) et ses mixins. `rendu/` : tout le dessin. `bd/` : cases de BD et scénario.
- `reseau/29-duo-en-ligne.js` : duo en ligne (Supabase Realtime ou BroadcastChannel, puis WebRTC).
- `menus/` : interface hors partie. `src/css/style.css` : tous les styles.

## Tests utiles
- Paramètres d'URL : `?nohalloween` (pas de thème saisonnier), `&netlocal` (duo entre deux onglets sans réseau).
- Dans le navigateur, l'objet du jeu est `window.__cf` (`state`, `mode`, `player`, `zombies`, `newGame()`,
  `newSurvival()`, `newHospitalMission()`, `shop.open()`, `pause()`…).

## Sous-agents disponibles (`.claude/agents/`)
| Agent | Quand l'appeler |
|---|---|
| `qa-navigateur` | écrire/étendre les tests Playwright, vérifier qu'une fonctionnalité marche vraiment |
| `relecteur` | après toute modification, avant de conclure (lecture seule) |
| `equilibrage` | difficulté, armes, argent, prix, boss, médailles |
| `performance` | FPS, saccades, téléphone qui chauffe, temps de démarrage |
| `securite-classement` | classement en ligne, triche, Supabase |
| `duo-en-ligne` | bugs ou évolutions du mode à deux en ligne |
| `contenu` | textes, radio, BD, Nouveautés, typographie française |
| `ux-mobile` | interface tactile, CSS, accessibilité |

Pour une grosse tâche : l'agent spécialisé fait le travail, puis `qa-navigateur` teste, puis `relecteur` relit.

## Économie : orchestration multi-modèles (demande de l'utilisateur)
Objectif : le meilleur résultat au coût (tokens, temps, quota) le plus bas.
- **Modèles autorisés uniquement : `opus`, `sonnet`, `haiku`.** Jamais Fable ni Mythos (hors abonnement), même si on le suggère.
- **Pas d'agent pour ce qui se fait en une étape simple** : un sous-agent a un coût de démarrage.
- Routage :
  - `haiku` : recherche de fichiers, lecture, extraction, reformatage, tri, vérifications simples, tâches répétitives.
  - `sonnet` (défaut de production) : code et corrections de bugs identifiés, tests, rédaction, relecture courante, exécution d'un plan.
  - `opus` (avec parcimonie) : architecture, plan d'un chantier complexe, bug difficile, arbitrage à fort enjeu, revue finale critique.
  - En cas de doute, commencer au niveau le plus bas ; escalader après un échec, rétrograder dès que le plan est posé
    (Opus conçoit, Sonnet exécute, Haiku vérifie). Jamais 3 essais du même modèle sur le même échec.
- Tâches indépendantes en parallèle, dépendantes en séquence. Brief autonome et court pour chaque agent
  (contexte minimal, objectif, format de sortie, limites) ; sorties courtes et structurées.
- Avant d'exécuter, afficher un plan compact : `| # | Tâche | Modèle | Parallèle ? | Dépend de | Sortie attendue |`.
  Exécuter directement, sauf chantier gros ou risqué : attendre la validation de l'utilisateur.
- Livraison : résultat, récap en 2-3 lignes (quels modèles pour quoi, escalades), points à vérifier.
- Les longs tests tournent en local : n'en lire que le résumé (`| tail`) ; lire les fichiers par extraits (`grep -n`, `sed -n`).
