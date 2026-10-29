// ---------- ouverture du studio
let splashDoneAt = Infinity;
// ---------- appel, changement d'appli, écran verrouillé : pause et son coupé, reprise propre au retour
document.addEventListener('visibilitychange', () => {
  const ac = game.audio && game.audio.ctx;
  if (document.hidden) { if (game.state === 'playing') game.pause(); if (ac && ac.state === 'running') ac.suspend().catch(() => { }); }
  else if (ac && ac.state === 'suspended') ac.resume().catch(() => { });
});
addEventListener('pagehide', () => { if (game.state === 'playing') game.pause(); });
// ---------- hors ligne : le site garde une copie du jeu (uniquement sur le site en ligne)
if ('serviceWorker' in navigator && location.protocol === 'https:' && /github\.io$/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => { });
// ---------- icônes et noms courts des onglets (utilisés par la barre verticale sur téléphone)
{ const ICO = { 'btn-best': '<path d="M12 3c-4.4 0-8 3.1-8 7.4 0 2.4 1.1 4.1 2.6 5.1V19h10.8v-3.5c1.5-1 2.6-2.7 2.6-5.1C20 6.1 16.4 3 12 3z"/><path d="M9 11h.01M15 11h.01M10 19v-2M14 19v-2"/>', lobby: '<path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/>', perso: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>', arsenal: '<circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>', 'btn-ach': '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', 'btn-scores': '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/>', 'btn-credits': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', 'btn-news': '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-1.5-4-6-5-6-2s4 2 6 2c2 0 6 1 6-2s-4.5-2-6 2"/>', 'btn-settings': '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>' };
  const SHORT = { lobby: 'Accueil', perso: 'Perso', arsenal: 'Arsenal', 'btn-ach': 'Succès', 'btn-best': 'Bestiaire', 'btn-scores': 'Scores', 'btn-news': 'Nouveau', 'btn-credits': 'Crédits', 'btn-settings': 'Réglages' };
  for (const t of document.querySelectorAll('.hub-tabs .tab:not(.fs-tab)')) { const k = t.dataset.tab || t.id; if (!ICO[k]) continue; const lbl = document.createElement('span'); lbl.className = 't-lbl'; while (t.firstChild) lbl.appendChild(t.firstChild); t.insertAdjacentHTML('afterbegin', `<svg class="t-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`); t.appendChild(lbl); t.insertAdjacentHTML('beforeend', `<span class="t-short" aria-hidden="true">${SHORT[k]}</span>`); } }
// ---------- Nouveautés : journal des mises à jour (le plus récent en haut)
const WN = [
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
// ---------- pas de zoom, sur aucun appareil : pincement, double-tap, Ctrl + molette, Ctrl + / -
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, e => e.preventDefault(), { passive: false });
document.addEventListener('touchmove', e => { if (e.touches.length > 1 || (e.scale && e.scale !== 1)) e.preventDefault(); }, { passive: false });
// (le double-tap est neutralisé par touch-action: manipulation, sans bloquer les appuis rapides sur les boutons)
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0', '_'].includes(e.key)) e.preventDefault(); });
// ---------- paysage : on verrouille dès qu'on peut (plein écran ou application installée)
function lockLandscape() { try { if (screen.orientation && screen.orientation.lock && (fsEl() || standalone())) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }
document.addEventListener('pointerdown', lockLandscape, { once: true });
// ---------- plein écran : proposé à l'ouverture (le navigateur exige un appui du joueur)
const IOS = /iPhone|iPod/.test(navigator.userAgent) || (/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
const fsOK = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
// appli installée (repéré au lancement : plus tard, le plein écran du navigateur fausserait le test)
const INSTALLED = (() => { try { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || !!navigator.standalone; } catch (e) { return false; } })();
const standalone = () => INSTALLED || (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
const ANDROID = /Android/i.test(navigator.userAgent);
let installEvt = null; addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; const b = $('inst-now'); if (b) b.hidden = false; });
addEventListener('appinstalled', () => { installEvt = null; closeInstall(); try { localStorage.setItem('couvrefeu.installseen', '1'); } catch (e) { } });
function installSeen() { try { return localStorage.getItem('couvrefeu.installseen') === '1'; } catch (e) { return false; } }
function showInstall() {
  const m = $('install-modal'); for (const p of m.querySelectorAll('.inst-os')) p.hidden = (IOS && p.dataset.os !== 'ios') || (ANDROID && p.dataset.os !== 'android');
  $('inst-now').hidden = !installEvt; $('inst-ok').hidden = !!installEvt;
  m.hidden = false; requestAnimationFrame(() => { const b = installEvt ? $('inst-now') : $('inst-ok'); b.focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo(b); });
}
function closeInstall() { const m = $('install-modal'); if (!m || m.hidden) return false; m.hidden = true; try { localStorage.setItem('couvrefeu.installseen', '1'); } catch (e) { } return true; }
function enterFullscreen() {
  const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen; if (!req) return Promise.resolve(false);
  try { const r = req.call(el, { navigationUI: 'hide' }); return Promise.resolve(r).then(() => { try { if (TOUCH && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } return true; }).catch(() => false); } catch (e) { return Promise.resolve(false); }
}
function toggleFullscreen() { if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } else enterFullscreen(); }
function fsNever() { try { return localStorage.getItem('couvrefeu.fsnever') === '1'; } catch (e) { return false; } }
function offerFullscreen(force) {
  if (!force && navigator.webdriver) return; // tests automatisés
  if (fsEl() || standalone()) return;
  if (TOUCH && !installSeen()) { showInstall(); return; } // sur mobile, on propose d'abord d'installer le jeu
  if (fsNever()) return;
  if (!fsOK() && !IOS) return;
  const m = $('fs-modal');
  if (!fsOK() && IOS) { $('fs-h').textContent = 'Jouer en plein écran'; $('fs-txt').innerHTML = 'Sur iPhone, touche <b>Partager</b> puis <b>« Sur l\'écran d\'accueil »</b> : le jeu s\'ouvrira en plein écran comme une application.'; $('fs-yes').textContent = 'Compris'; m.dataset.ios = '1'; }
  m.hidden = false; requestAnimationFrame(() => { $('fs-yes').focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo($('fs-yes')); });
}
function closeFsModal() { const m = $('fs-modal'); if (m.hidden) return false; if ($('fs-never').checked) { try { localStorage.setItem('couvrefeu.fsnever', '1'); } catch (e) { } } m.hidden = true; return true; }
$('fs-yes').addEventListener('click', () => { game.audio.init(); const ios = $('fs-modal').dataset.ios; closeFsModal(); if (!ios) enterFullscreen(); });
$('fs-no').addEventListener('click', () => { game.audio.init(); closeFsModal(); });
$('inst-later').addEventListener('click', () => { game.audio.init(); closeInstall(); if (fsOK() && !fsNever()) enterFullscreen(); });
$('inst-ok').addEventListener('click', () => { game.audio.init(); closeInstall(); });
$('inst-now').addEventListener('click', () => { game.audio.init(); const e = installEvt; if (!e) return closeInstall(); e.prompt(); (e.userChoice || Promise.resolve()).then(() => { installEvt = null; closeInstall(); }); });
$('install-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeInstall(); });
$('btn-install').addEventListener('click', () => { game.audio.init(); game.audio.ui(); showInstall(); });
if (!TOUCH || standalone()) $('btn-install').hidden = true;
$('fs-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeFsModal(); });
$('btn-fs').addEventListener('click', () => { game.audio.init(); toggleFullscreen(); });
$('btn-fs-pause').addEventListener('click', () => toggleFullscreen());
const syncFsBtn = () => { const on = !!fsEl(); $('btn-fs').setAttribute('aria-pressed', on); $('btn-fs-pause').textContent = on ? 'Quitter le plein écran' : 'Plein écran'; };
document.addEventListener('fullscreenchange', () => { syncFsBtn(); lockLandscape(); }); document.addEventListener('webkitfullscreenchange', syncFsBtn);
if (!fsOK()) { $('btn-fs').hidden = true; $('btn-fs-pause').hidden = true; }
window.__offerFs = () => offerFullscreen(true); window.__showInstall = showInstall;
(() => {
  const sp = $('splash'); let done = false;
  const end = () => { if (done) return; done = true; sp.hidden = true; splashDoneAt = performance.now(); setTimeout(offerFullscreen, 250); setTimeout(maybeWhatsNew, 1400); };
  let reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  setTimeout(end, reduce ? 1500 : 3900);
  sp.addEventListener('pointerdown', end); addEventListener('keydown', end, { once: true });
})();
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'playing') game.pause(); });
addEventListener('keydown', e => { if (game.state === 'title' && e.key === 'Enter' && !game.keysOpen && performance.now() - splashDoneAt > 300 && document.activeElement === document.body && $('launch-modal').hidden && !join.open) openLaunch('story'); });

let last = performance.now(), errShown = false;
const perf = { t: 0, n: 0, slow: 0 };
function frame(now) {
  if (Settings.quality === 'eco' && now - last < 30) { requestAnimationFrame(frame); return; } // économie de batterie : 30 images par seconde
  const raw = (now - last) / 1000, dt = Math.min(0.034, Math.max(0, raw)); last = now;
  // qualité automatique : en partie, si l'image tombe sous ~38 i/s pendant 3 s, on réduit la résolution d'un cran
  if (Settings.quality === 'auto' && game.state === 'playing' && raw < 0.25 && !document.hidden) { perf.t += raw; perf.n++; if (perf.t >= 3) { const avg = perf.t / perf.n; if (avg > 0.026 && dprCap > 1) { dprCap = Math.max(1, +(Math.min(dprCap, DPR) * 0.8).toFixed(2)); resize(); } perf.t = 0; perf.n = 0; } }
  if (innerWidth !== RW || innerHeight !== RH) resize();
  try { game.update(dt); game.render(); } catch (err) { if (!errShown) { errShown = true; console.error(err); } }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
