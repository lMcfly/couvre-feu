// ---------- Nouveautés : journal des mises à jour (le plus récent en haut)
const WN = [
  { v: 67, d: '29 oct.', t: 'Grand ménage sous le capot', s: 'Rien ne change à l\'écran… sauf que tout va plus vite.', it: [
    ['up', 'Démarrage 4× plus rapide', 'Les portraits ne sont plus dessinés tant que tu n\'ouvres pas leur écran : le jeu est prêt en un clin d\'œil, même sur un vieux téléphone.'],
    ['up', 'Code rangé', 'Le jeu est maintenant découpé en 39 fichiers par thème, avec des vérifications automatiques avant chaque mise en ligne.'],
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
