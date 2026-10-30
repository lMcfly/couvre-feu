// ---------- Nouveautés : journal des mises à jour (le plus récent en haut)
const WN = [
  { v: 73, d: '30 oct.', t: 'L\'armurerie', s: 'Le marché noir devient une vraie armurerie, et la musique suit enfin l\'action.', it: [
    ['new', 'Armurerie', 'Un grand panneau de métal sale : l\'arme choisie en grand avec sa description, une rangée d\'armes, une rangée d\'améliorations avec leurs étoiles, et l\'écran « Nouv. armurerie » qui t\'indique ce qui est enfin à ta portée.'],
    ['new', 'Musique qui suit l\'action', 'Calme quand tu explores. Quand la horde arrive, la batterie et la basse se lèvent. Face à un boss : frappes lourdes et accords qui grincent.'],
    ['new', 'Transitions', 'De temps en temps, en passant d\'un menu à l\'autre, l\'image saute comme une vieille télé.'],
    ['up', 'Pause, carte et fin de partie', 'Même panneau de métal riveté et taché de sang que l\'armurerie.']],
    q: ['pedro', 'Pedro', '¡Una armería de verdad! Il manque juste un rayon burritos.'] },
  { v: 72, d: '30 oct.', t: 'Le bestiaire broie du noir', s: 'Fiches sombres, icônes de fin du monde et plus de carré au survol des menus.', it: [
    ['up', 'Bestiaire sombre', 'Les fiches deviennent des dossiers tachés de sang. En fin de partie, plus de « Tu as découvert ! » : c\'est une mauvaise nouvelle, une nouvelle menace.'],
    ['new', 'Icônes zombie', 'Télé cassée pour l\'affichage, tombe pour la sauvegarde, main qui sort de terre pour le bestiaire, machette, crâne, bâtons de survivant pour les scores…'],
    ['fix', 'Survol des menus', 'Le carré sombre qui apparaissait derrière Solo, Duo et les autres choix au survol a disparu.']],
    q: ['chewie', 'Chewie', 'Une main qui sort de la terre comme icône… grave stylé, mais ça fait flipper.'] },
  { v: 71, d: '30 oct.', t: 'Une seule écriture', s: 'Tout le jeu parle maintenant d\'une même voix, façon affiche de film d\'horreur.', it: [
    ['up', 'Titres', 'Tous les titres en lettres épaisses rouge sang, bords rongés, contour noir.'],
    ['up', 'Boutons et étiquettes', 'Onglets, boutons, chiffres et petites étiquettes dans la même police, en clair. Les phrases restent à la machine à écrire. Seule la BD garde son lettrage.'],
    ['fix', 'Plus de police au hasard', 'Certains textes de boutons s\'affichaient dans la police par défaut du navigateur : c\'est fini.']],
    q: ['dragon', 'Dragon', 'Enfin une typographie à la hauteur de ma noirceur.'] },
  { v: 70, d: '30 oct.', t: 'Cinquième mission : l\'hôpital', s: 'La nuit ne s\'arrête plus à la Mairie : l\'hélicoptère se pose sur le toit de Saint-Lazare.', it: [
    ['new', 'Mission 5 · Hôpital Saint-Lazare', 'Après la Mairie, une BD inédite puis l\'hôpital : couloirs, chambres, morgue et le Chirurgien. Inès, l\'infirmière de garde, attend qu\'on la sorte de là.'],
    ['new', 'Le Hurleur', 'Un patient zombie qui garde ses distances puis hurle : la horde s\'excite et ta lampe grésille. Tire-lui dessus quand il ouvre la bouche pour le faire taire.'],
    ['up', '15 shibas', 'Trois shibas par mission, cachés jusque dans les chambres de l\'hôpital. Il en faut 15 pour le Paradis des Shibas.'],
    ['new', 'Écran Campagne', 'La ville brûle en grand derrière toi : projecteurs, hélico, horde, pluie et éclairs, avec tes cinq missions et tes shibas d\'un coup d\'œil.'],
    ['up', 'Titres en relief', 'Les grands titres dégoulinent et prennent de l\'épaisseur. À l\'arrivée d\'un boss, son nom tombe du ciel lettre par lettre.'],
    ['new', 'Code de transfert', 'Paramètres › Sauvegarde : un code pour passer du PC au téléphone avec ton niveau, tes tenues, tes succès, tes shibas, tes scores et ta partie en cours. On garde le meilleur des deux appareils.']],
    q: ['zeus', 'Zeus', 'Un hôpital sans une seule plante verte. C\'est ça, le vrai cauchemar.'] },
  { v: 69, d: '29 oct.', t: 'Le centre de l\'écran respire', s: 'Les petits événements passent en haut, dans une bande fine, et tout le texte s\'affiche en entier.', it: [
    ['new', 'Bandes fines en haut', 'Arme trouvée, shiba ou survivant sauvé, sauvegarde : une bande discrète sous le bouton pause. La grande bannière reste pour les boss, les vagues et les nouveaux secteurs.'],
    ['fix', 'Plus de texte coupé', 'Messages, succès et descriptions du marché noir s\'affichent en entier, sans points de suspension.'],
    ['fix', 'Rien ne se chevauche', 'La bande et la carte de succès évitent les barres de vie, l\'objectif et le score, du petit iPhone au grand écran.']],
    q: ['pedro', 'Pedro', 'Enfin je vois les zombies arriver. Et ce n\'est pas une bonne nouvelle.'] },
  { v: 68, d: '29 oct.', t: 'Chaque mot à sa place', s: 'Fini les textes qui se marchent dessus quand tu ramasses ou sauves quelqu\'un.', it: [
    ['fix', 'Butin lisible', 'Les « +25 santé », « +1 grenade » et les autres ont chacun leur ligne et un fond ; ils passent sous ton perso quand une bannière s\'affiche.'],
    ['fix', 'Points des zombies', 'Les « +150 » ne s\'empilent plus au même endroit et s\'effacent sous la bannière.'],
    ['fix', 'Messages sur téléphone', 'Ils se rangent sous l\'objectif au lieu de le recouvrir.'],
    ['up', 'Crédits dans les Paramètres', 'L\'onglet quitte le menu : les crédits sont en bas des Paramètres de l\'accueil.']],
    q: ['fiona', 'Fiona', 'Enfin je peux lire ce que je ramasse. Pas que ça change grand-chose.'] },
  { v: 67, d: '29 oct.', t: 'Grand ménage sous le capot', s: 'Rien ne change à l\'écran… sauf que tout va plus vite.', it: [
    ['up', 'Démarrage 4× plus rapide', 'Les portraits ne sont plus dessinés tant que tu n\'ouvres pas leur écran : le jeu est prêt en un clin d\'œil, même sur un vieux téléphone.'],
    ['up', 'Code rangé', 'Le jeu est maintenant découpé en fichiers par thème, avec des vérifications automatiques avant chaque mise en ligne.'],
    ['fix', 'Moins de bugs à venir', 'Un garde-fou bloque les erreurs qui avaient cassé le duo et les grenades avant qu\'elles n\'arrivent chez toi.']],
    q: ['zeus', 'Zeus', 'Un jardin bien rangé pousse mieux. Le code, c\'est pareil.'] },
  { v: 65, d: '29 oct.', t: 'L\'arsenal passe à l\'écran', s: 'Chaque arme se montre en action, l\'accueil prend vie, et les grenades tombent enfin où tu vises.', it: [
    ['new', 'Arsenal « en jeu »', 'Chaque arme a sa fiche avec une vidéo filmée par le moteur du jeu : tir chargé, rafale, flammes, rayon, roquette…'],
    ['new', 'Accueil vivant', 'Ton perso respire sous le projecteur, des poussières dansent dans la lumière, et il lâche une réplique de temps en temps.'],
    ['up', 'Sélecteur sous le perso', 'Nom, rôle et flèches réunis sous la scène, comme un vrai écran de sélection.'],
    ['fix', 'Grenades', 'Elles ne rebondissent plus loin derrière la cible : elles tombent là où tu vises.'],
    ['fix', 'Classement', 'Un seul score par joueur : seul ton meilleur reste.']],
    q: ['chewie', 'Chewie', 'Le lance-roquettes en vidéo. J\'en pleure de joie. Ou c\'est la fumée.'] },
  { v: 64, d: '29 oct.', t: 'Les nouveautés à portée de main', s: 'Elles quittent le menu et s\'installent sur l\'écran d\'accueil.', it: [
    ['up', 'Carte Nouveautés', 'Sur PC, sous le journal télé : le titre de la dernière mise à jour et ses ajouts, d\'un coup d\'œil.'],
    ['up', 'Bouton en bas à gauche', 'Sur téléphone, un bouton compact au pied de l\'écran d\'accueil, avec sa pastille rouge.'],
    ['up', 'Réglages plus aérés', 'Les six icônes remplissent l\'écran, avec des pictos et des titres plus grands.']],
    q: ['dobby', 'Dobby', 'Avant je cherchais les nouveautés. Maintenant ce sont elles qui me trouvent.'] },
  { v: 63, d: '29 oct.', t: 'Réglages rangés, boutique au carré', s: 'Tout est trié par thème, et le marché noir tient enfin sur un téléphone.', it: [
    ['up', 'Réglages par icônes', 'Son, Affichage, Commandes, Accessibilité, En ligne, Sauvegarde : touche une icône, tu n\'as que ses réglages.'],
    ['up', 'Interrupteurs et curseurs', 'Chaque réglage sur sa ligne, avec sa valeur affichée. Plus de fouillis.'],
    ['fix', 'Marché noir sur téléphone', 'Onglets Armes et Équipement, et « Reprendre la route » toujours visible en bas.'],
    ['up', 'Modes sur téléphone', 'Le Duo sur le même écran disparaît du téléphone : place au Duo en ligne.']],
    q: ['zeus', 'Zeus', 'Six icônes. Même moi, je trouve le bouton du volume.'] },
  { v: 62, d: '28 oct.', t: 'Le journal des mises à jour', s: 'Tu ne rateras plus rien : chaque ajout est raconté ici.', it: [
    ['new', 'Onglet Nouveautés', 'Tu es dessus. Les versions s\'empilent du plus récent au plus ancien, avec ce qui a changé.'],
    ['new', 'Pastille rouge', 'Elle s\'allume sur l\'onglet quand une mise à jour arrive, et s\'éteint une fois lue.'],
    ['new', 'Résumé au lancement', 'Après une mise à jour, une petite fenêtre te montre l\'essentiel. Une seule fois, promis.']],
    q: ['chewie', 'Chewie', 'Un journal ? Moi qui croyais que les zombies savaient pas lire.'] },
  { v: 61, d: '28 oct.', t: 'Zéro lag, zéro excuse', s: 'Le duo en ligne répond au quart de tour, et les iPhone récents ont enfin un écran bien calé.', it: [
    ['up', 'Tirs instantanés en duo', 'L\'invité voit ses balles partir dès qu\'il appuie, sans attendre l\'hôte.'],
    ['new', 'Indicateur de connexion', 'En haut de l\'écran : connexion directe ou relais, et la latence en millisecondes.'],
    ['up', 'Duo plus léger', 'Moins de messages envoyés : la partie tient bien mieux en 4G.'],
    ['fix', 'iPhone 15, 16, 17 et plus', 'La Dynamic Island ne mange plus la place des boutons, et l\'écran se recale après une rotation ou le clavier.'],
    ['fix', 'Boss en duo', 'L\'invité voit toujours l\'entrée du boss, même à l\'autre bout de la carte.']],
    q: ['pedro', 'Pedro', 'Mes balles partent quand j\'appuie. C\'est beau, je vais pleurer.'] },
  { v: 58, d: '27 oct.', t: 'Le duo passe en ligne', s: 'Chacun son téléphone, chacun son canapé. Même ville ou pas.', it: [
    ['new', 'Duo en ligne', 'Un code à 4 lettres et ton ami te rejoint, sur téléphone ou sur PC.'],
    ['new', 'Campagne à deux', 'BD, carte, objectifs, survivants, lampadaires : tout est partagé.'],
    ['new', 'Survie à deux', 'Tenez la place de la Mairie ensemble, vague après vague.'],
    ['new', 'Relever son allié', 'Reste quelques secondes dans son cercle pour le remettre debout. Une fois par manche.'],
    ['new', 'Classement en ligne', 'Compare tes meilleurs scores avec ceux des copains.'],
    ['up', 'Visibilité du perso', 'Le réglage « Renforcée » pour ne plus perdre ton perso dans la mêlée.'],
    ['fix', 'Mêlée sur mobile', 'Le bouton de corps à corps est de retour.']],
    q: ['fiona', 'Fiona', 'Enfin quelqu\'un pour porter le jerrican à ma place.'] },
  { v: 52, d: '27 oct.', t: 'Pour tous les yeux', s: 'Des réglages pour jouer confortablement, quoi qu\'il arrive.', it: [
    ['new', 'Mode daltonien', 'Couleurs revues pour bien distinguer dangers, soins et objectifs.'],
    ['new', 'Effets réduits', 'Moins de tremblements d\'écran et de flashs.'],
    ['up', 'Polices intégrées', 'Le jeu s\'affiche plus vite, et pareil même hors ligne.']],
    q: ['zeus', 'Zeus', 'Je vois tout. Même les zombies que je préférais ne pas voir.'] },
  { v: 50, d: '26 oct.', t: 'Les boss sortent le grand jeu', s: 'Six boss redessinés, chacun avec sa technique et son entrée fracassante.', it: [
    ['new', 'Une technique par boss', 'Chaque boss a sa propre attaque spéciale, à apprendre pour survivre.'],
    ['new', 'Rage et point faible', 'À mi-vie, il s\'énerve. S\'il rate une attaque, vise son point faible.'],
    ['new', 'Des entrées mémorables', 'Le Contrôleur te tape sur l\'épaule, la Speakerine sort de la télé, le Gardien pousse une voiture…'],
    ['new', 'Cinématiques', 'Zoom, bandes noires et action figée à chaque arrivée de boss.'],
    ['up', 'Bestiaire en fin d\'acte', 'Les créatures découvertes s\'affichent à la fin de l\'acte, plus en plein combat.']],
    q: ['dobby', 'Dobby', 'Le Shibanophile dans un costume de shiba géant. J\'ai pas les mots.'] },
  { v: 45, d: '26 oct.', t: 'Visée laser', s: 'Viser au doigt n\'a jamais été aussi précis.', it: [
    ['new', 'Ligne de visée laser', 'Elle remplace le viseur, sur mobile comme sur PC.'],
    ['up', 'Visée qui tient', 'Ta visée ne bouge plus quand tu te déplaces.'],
    ['new', 'Recharger d\'un geste', 'Touche le compteur de munitions pour recharger.'],
    ['up', 'Sticks transparents', 'Ils suivent ton pouce, et la caméra regarde devant toi.'],
    ['new', 'Installer le jeu', 'Un petit tuto pour l\'avoir sur l\'écran d\'accueil, comme une vraie appli.']],
    q: ['dragon', 'Dragon', 'Un laser. Sur un pistolet. En pleine apocalypse. Logique.'] },
  { v: 42, d: '25 oct.', t: 'Halloween débarque', s: 'Citrouilles, déguisements et un hôpital qui ne soigne personne.', it: [
    ['new', 'Événement Halloween', 'Citrouilles à trouver, zombies déguisés et une tête de citrouille à gagner.'],
    ['new', 'Bestiaire en BD', 'Toutes les créatures croisées, dessinées et décrites.'],
    ['new', 'Chien zombie', 'Rapide, nerveux, et il ne rapporte pas la balle.'],
    ['new', 'Hôpital Saint-Lazare', 'Un secteur bonus et son boss : Le Chirurgien.']],
    q: ['fiona', 'Fiona', 'Le Chirurgien m\'a proposé un rendez-vous. J\'ai décliné.'] },
  { v: 41, d: '25 oct.', t: 'Le jeu dans ta poche', s: 'Couvre-Feu se joue partout, même sans réseau.', it: [
    ['new', 'Version mobile', 'Commandes tactiles, paysage et boutons réglables.'],
    ['new', 'Hors ligne', 'Une fois chargé, le jeu marche sans internet.'],
    ['new', 'Comme une appli', 'Icône sur l\'écran d\'accueil et plein écran.'],
    ['up', 'Pause automatique', 'Le jeu se met en pause si tu quittes l\'appli.']],
    q: ['pedro', 'Pedro', 'Je peux tuer des zombies dans le bus maintenant. Ma vie a changé.'] }
];
const WN_CUR = WN[0].v, WN_TAG = { new: 'NOUVEAU', up: 'AMÉLIORÉ', fix: 'CORRIGÉ' };
const wnSeen = () => +Settings.wnSeen || 0, WN_PREV = wnSeen();
const wnItems = (it, n) => it.slice(0, n || it.length).map(([k, b, t], j) => `<div class="wn-it" style="--j:${j}"><span class="wn-tag ${k}">${WN_TAG[k]}</span><div><b>${b}</b><span>${t}</span></div></div>`).join('');
const wnQuote = q => q ? `<div class="wn-q"><canvas width="240" height="180" data-portrait="${q[0]}" aria-hidden="true"></canvas><p class="wn-bub"><i>${q[1]}</i>« ${q[2]} »</p></div>` : '';
function wnPortraits(el) { for (const cv of el.querySelectorAll('canvas[data-portrait]')) { try { renderPortrait(cv, cv.dataset.portrait); } catch (e) { } fontsReady.then(() => { try { renderPortrait(cv, cv.dataset.portrait); } catch (e) { } }); } }
function wnHTML() {
  const seen = WN_PREV, unread = seen ? WN.filter(u => u.v > seen).length : 0;
  const intro = unread > 1 ? `<b>${unread} mises à jour</b> depuis ta dernière visite. Touche une version pour l'ouvrir ou la refermer.` : 'Touche une version pour l\'ouvrir ou la refermer.';
  return `<div class="wn${Settings.calm ? ' wn-still' : ''}"><p class="wn-intro">${intro}</p><div class="wn-legend"><span><i class="wn-tag new">NOUVEAU</i>ajout</span><span><i class="wn-tag up">AMÉLIORÉ</i>mieux qu'avant</span><span><i class="wn-tag fix">CORRIGÉ</i>bug réglé</span></div>` +
    WN.map((u, i) => { const isNew = seen && u.v > seen; return `<details class="wn-card${i === 0 ? ' top' : ''}${isNew || i === 0 ? ' unread' : ''}"${i === 0 || isNew ? ' open' : ''} style="--i:${i}"><summary>${i === 0 ? '<span class="wn-ribbon">À la une</span>' : ''}<span class="wn-stamp"><small>Version</small><b>${u.v}</b><small>${u.d}</small></span><div><h4 class="wn-h">${u.t}${isNew && i > 0 ? '<span class="wn-new">Pas encore lu</span>' : ''}</h4><p class="wn-s">${u.s}</p></div><span class="wn-chev" aria-hidden="true">›</span></summary><div class="wn-body">${wnItems(u.it)}${wnQuote(u.q)}</div></details>`; }).join('') + '</div>';
}
function wnMarkRead() { if (wnSeen() < WN_CUR) { Settings.wnSeen = WN_CUR; Settings.save(); } for (const d of document.querySelectorAll('.wn-dot')) d.hidden = true; }
function openNews() { closeHubModals(); togglePanel('panel-news', $('btn-news'), wnHTML); wnPortraits($('panel-news')); wnMarkRead(); }
for (const b of document.querySelectorAll('[data-news]')) { b.addEventListener('click', () => { game.audio.init(); game.audio.ui(); openNews(); }); const d = document.createElement('span'); d.className = 'wn-dot'; d.setAttribute('aria-hidden', 'true'); d.hidden = wnSeen() >= WN_CUR; b.appendChild(d); }
{ const u = WN[0], q = k => document.querySelectorAll(`[data-wn="${k}"]`); for (const e of q('v')) e.textContent = 'v' + u.v; for (const e of q('v2')) e.textContent = `v${u.v} · ${u.t}`; for (const e of q('h')) e.textContent = u.t; for (const e of q('l')) e.innerHTML = u.it.slice(0, 3).map(([k, b]) => `<li data-k="${k}">${b}</li>`).join(''); }
function showWhatsNew() {
  const u = WN[0], el = $('wn-pop'); el.classList.toggle('wn-still', !!Settings.calm);
  el.innerHTML = `<div class="wn-burst" aria-hidden="true"><span>NEW!</span></div><p class="eyebrow">Mise à jour · version ${u.v}</p><h2 id="wn-ph">${u.t}</h2><p class="wn-s">${u.s}</p>${wnItems(u.it, 3)}${wnQuote(u.q)}<div class="wn-acts"><button type="button" class="btn primary" id="wn-all">Voir toutes les nouveautés</button><button type="button" class="btn" id="wn-ok">C'est parti</button></div>`;
  wnPortraits(el); $('wn-modal').hidden = false; wnMarkRead();
  $('wn-all').addEventListener('click', () => { game.audio.init(); game.audio.ui(); $('wn-modal').hidden = true; openNews(); });
  $('wn-ok').addEventListener('click', () => { game.audio.init(); game.audio.ui(); $('wn-modal').hidden = true; });
  requestAnimationFrame(() => { $('wn-all').focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo($('wn-all')); });
}
$('wn-modal').addEventListener('click', e => { if (e.target === e.currentTarget) $('wn-modal').hidden = true; });
// au lancement, une seule fois par mise à jour, quand rien d'autre n'est ouvert (pas pour un tout nouveau joueur)
function maybeWhatsNew(tries) {
  if (navigator.webdriver && !/[?&]wn\b/.test(location.search)) return;
  if (wnSeen() >= WN_CUR) return;
  if (!wnSeen() && !Settings.xp && !Settings.lastRun) { wnMarkRead(); return; }
  if (game.state !== 'title' || (tries | 0) > 40) return;
  if (document.querySelector('.hub-modal:not([hidden]), .sheet:not([hidden])') || ($('splash') && !$('splash').hidden)) { setTimeout(() => maybeWhatsNew((tries | 0) + 1), 1500); return; }
  showWhatsNew();
}
window.__wn = { show: showWhatsNew, open: openNews, WN };
