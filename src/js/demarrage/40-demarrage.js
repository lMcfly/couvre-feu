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
// ---------- icônes et noms courts des onglets (barre verticale sur téléphone), dessinées dans l'ambiance du jeu
{ const ICO = { 'btn-best': '<path d="M3 21h18"/><path d="M8 21v-5l-1.6-3.6a1 1 0 0 1 1.8-.9L9.5 14V7a1 1 0 0 1 2 0v5.5V5.5a1 1 0 0 1 2 0V12V7a1 1 0 0 1 2 0v7.5l1-1.6a1 1 0 0 1 1.7 1L16 19v2"/><path class="ib" d="M11.5 1.2c0 1-1.4 2.3-1.4 3.1a1.4 1.4 0 0 0 2.8 0c0-.8-1.4-2.1-1.4-3.1z"/>', lobby: '<path d="M3 11l9-7 9 7v10H3z"/><path d="M7.5 13.5l9 5M16.5 13.5l-9 5"/><path d="M15 6.5V3.5h2.5v4.8"/>', perso: '<circle cx="12" cy="8" r="4.2"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/><path d="M9.6 5.2l2.6 3.6M9.8 7.4l1.2-.8M11 8.9l1.2-.8"/>', arsenal: '<path d="M4.5 19.5l6-6"/><path d="M9.5 14.5L17 7l3 3-7.5 7.5z"/><path d="M3 21l1.5-1.5"/><path class="ib" d="M14 17.6c0 1-1.4 2.3-1.4 3.1a1.4 1.4 0 0 0 2.8 0c0-.8-1.4-2.1-1.4-3.1z"/>', 'btn-ach': '<circle cx="12" cy="15" r="5.5"/><path d="M8 3l4 6.5L16 3"/><path d="M10.2 14.3h.01M13.8 14.3h.01M10.8 17.4l.6-.6.6.6.6-.6.6.6"/>', 'btn-scores': '<path d="M5 5v14M9 4v15M13 5v14M17 4v15M3 15.5l17-7"/>', 'btn-credits': '<path d="M12 3a7.5 7.5 0 0 0-5 13.1V19h10v-2.9A7.5 7.5 0 0 0 12 3z"/><circle cx="9.3" cy="11" r="1.6"/><circle cx="14.7" cy="11" r="1.6"/><path d="M11 15.2l1-1.5 1 1.5M10 19v2M14 19v2"/>', 'btn-news': '<path d="M4 4h13v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v11a2 2 0 0 1-2 2M7 8h7M7 11h7M7 14h4.5"/><path d="M11 4l1.5 2L14 4"/><path class="ib" d="M18.5 1.5c0 1-1.4 2.3-1.4 3.1a1.4 1.4 0 0 0 2.8 0c0-.8-1.4-2.1-1.4-3.1z"/>', 'btn-settings': '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/><path d="M13.5 9.5l1.5-2M10.6 14.5l-1 1.8"/>' };
  const SHORT = { lobby: 'Accueil', perso: 'Perso', arsenal: 'Arsenal', 'btn-ach': 'Succès', 'btn-best': 'Bestiaire', 'btn-scores': 'Scores', 'btn-news': 'Nouveau', 'btn-credits': 'Crédits', 'btn-settings': 'Réglages' };
  for (const t of document.querySelectorAll('.hub-tabs .tab:not(.fs-tab)')) { const k = t.dataset.tab || t.id; if (!ICO[k]) continue; const lbl = document.createElement('span'); lbl.className = 't-lbl'; while (t.firstChild) lbl.appendChild(t.firstChild); t.insertAdjacentHTML('afterbegin', `<svg class="t-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`); t.appendChild(lbl); t.insertAdjacentHTML('beforeend', `<span class="t-short" aria-hidden="true">${SHORT[k]}</span>`); } }
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
