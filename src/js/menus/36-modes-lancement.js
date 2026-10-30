// ---------- choix de la difficulté
for (const b of document.querySelectorAll('#diff button')) b.addEventListener('click', () => {
  game.audio.init(); game.audio.ui(); game.diffKey = b.dataset.diff;
  for (const x of document.querySelectorAll('#diff button')) x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
  game.diff = DIFFS[game.diffKey];
});
// ---------- dossiers de modes : on ouvre un dossier, le reste de l'accueil passe au flou
function openFolder(f) {
  game.audio.init(); game.audio.ui(); $('folders').hidden = true; for (const fp of document.querySelectorAll('.folder-pane')) fp.hidden = fp.dataset.f !== f;
  const first = document.querySelector(`.folder-pane[data-f="${f}"] .mode:not([disabled])`) || document.querySelector(`.folder-pane[data-f="${f}"] .folder-back`);
  requestAnimationFrame(() => { first.focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo(first); });
}
function closeFolder() {
  const open = document.querySelector('.folder-pane:not([hidden])'); if (!open) return false;
  open.hidden = true; $('folders').hidden = false;
  const b = document.querySelector(`.folder[data-folder="${open.dataset.f}"]`); if (b) { b.focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo(b); } return true;
}
for (const b of document.querySelectorAll('.folder')) b.addEventListener('click', () => openFolder(b.dataset.folder));
window.openFolder = openFolder; window.closeFolder = closeFolder; window.openLaunch = openLaunch;
for (const b of document.querySelectorAll('.folder-back')) b.addEventListener('click', () => { game.audio.ui(); closeFolder(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && game.state === 'title' && !game.keysOpen && !document.querySelector('.hub-modal:not([hidden])') && !document.querySelector('.sheet:not([hidden])') && (closeFiche() || closeFolder())) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
// ---------- lancement d'un mode : difficulté puis départ
const LAUNCH = {
  story: { eb: 'Campagne', title: 'Opération Couvre-Feu' },
  coop: { eb: 'Campagne à deux', title: 'Opération Couvre-Feu', kick: 'Deux survivants, une seule nuit', go: 'Connecter les manettes' },
  survival: { eb: 'Challenge', title: 'Mode Survie', kick: 'Place de la Mairie · vagues sans fin', go: 'Tenir la place' },
  endless: { eb: 'Challenge', title: 'Nuit sans fin', kick: 'Ville tirée au hasard · mutations', go: 'Entrer dans la nuit' },
  daily: { eb: 'Challenge', title: 'Défi du jour', go: 'Relever le défi' },
  hospital: { eb: 'Bonus · secteur 5', title: 'Hôpital Saint-Lazare', kick: 'Couloirs étroits, néons qui grésillent… et Le Chirurgien', go: 'Entrer aux urgences' }
};
let launchMode = 'story';
function launchText() {
  const L = LAUNCH[launchMode], d = readSave();
  $('launch-mode').textContent = L.eb; campRefresh(launchMode === 'story');
  if (launchMode === 'story') { refreshStartDiff(); refreshContinue(); if (!d) $('start-title').textContent = `Mission 1 · ${MISSION_NAMES[0]}`; return; }
  $('start-title').textContent = L.title; $('start-kicker').textContent = launchMode === 'daily' ? `${todayMod().name} · ${todayMod().desc}` : L.kick;
  $('btn-continue').hidden = true; $('save-summary').hidden = true; $('btn-start').textContent = L.go; $('btn-start').classList.add('primary');
}
function openLaunch(mode) {
  game.audio.init(); game.audio.ui(); launchMode = mode; $('btn-start').dataset.confirm = ''; $('btn-start').classList.remove('danger'); refreshContinue(); launchText();
  $('launch-modal').hidden = false; requestAnimationFrame(() => { const b = !$('btn-continue').hidden ? $('btn-continue') : $('btn-start'); b.focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo(b); });
}
function closeHubModals() { let any = closeFsModal(); if (closeInstall()) any = true; if (!$('net-modal').hidden) { $('net-modal').hidden = true; any = true; if (!game.net && !game.netGuest && Net.role && !Net.peer) Net.close(); } for (const id of ['launch-modal', 'secret-modal', 'wn-modal']) if (!$(id).hidden) { $(id).hidden = true; any = true; } if (!$('join-modal').hidden) { closeJoin(); any = true; } return any; }
$('launch-close').addEventListener('click', () => { closeHubModals(); game.audio.ui(); });
$('launch-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeHubModals(); });
$('secret-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeHubModals(); });
$('secret-close').addEventListener('click', () => closeHubModals());
addEventListener('keydown', e => { if (e.key === 'Escape' && game.state === 'title' && !game.keysOpen && closeHubModals()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
for (const b of document.querySelectorAll('#diff button')) b.addEventListener('click', () => setTimeout(launchText, 0));
$('mode-coop').addEventListener('click', () => openLaunch('coop'));
$('mode-endless').addEventListener('click', () => openLaunch('endless'));
$('mode-hospital').addEventListener('click', () => openLaunch('hospital'));
$('mode-daily').addEventListener('click', () => openLaunch('daily'));
$('btn-survival-title').addEventListener('click', () => openLaunch('survival'));
$('mode-training').addEventListener('click', () => { game.audio.init(); game.newTraining(false); });
$('mode-tutorial').addEventListener('click', () => { game.audio.init(); game.newTraining(true); });
$('hub-shibas').addEventListener('click', () => {
  if (!Settings.paradise) { game.audio.init(); game.audio.ui(); const c = $('hub-shibas'); c.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 220 }); return; }
  game.audio.init(); game.audio.ui(); drawSecretArt(); $('secret-modal').hidden = false; requestAnimationFrame(() => { $('btn-paradise-title').focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo($('btn-paradise-title')); });
});
function drawSecretArt() {
  const cv = $('secret-cv'), g = cv.getContext('2d'), r = mulberry32(12);
  const sky = g.createLinearGradient(0, 0, 0, 240); sky.addColorStop(0, '#ff9ad0'); sky.addColorStop(0.6, '#ffd2a8'); sky.addColorStop(1, '#ffe9c4'); g.fillStyle = sky; g.fillRect(0, 0, 480, 240);
  g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 6; i++) { const x = r() * 480, y = 20 + r() * 80; g.beginPath(); g.arc(x, y, 18, 0, TAU); g.arc(x + 20, y + 4, 14, 0, TAU); g.arc(x - 18, y + 6, 12, 0, TAU); g.fill(); }
  g.fillStyle = '#7fc46a'; g.beginPath(); g.moveTo(0, 190); g.quadraticCurveTo(240, 150, 480, 190); g.lineTo(480, 240); g.lineTo(0, 240); g.fill();
  for (let i = 0; i < 9; i++) itemArt(g, 'shiba', 40 + i * 50 + (r() - 0.5) * 14, 192 + (r() - 0.5) * 16, 44);
  g.fillStyle = '#e0325a'; for (let i = 0; i < 10; i++) { const x = r() * 480, y = 30 + r() * 120, s = 4 + r() * 5; g.beginPath(); g.moveTo(x, y + s); g.bezierCurveTo(x - s * 1.4, y, x - s, y - s * 1.2, x, y - s * 0.4); g.bezierCurveTo(x + s, y - s * 1.2, x + s * 1.4, y, x, y + s); g.fill(); }
}
// ---------- connexion des manettes (comme sur console : chacun appuie sur A)
const join = { open: false, slots: [null, null], prev: {}, kbPrev: {} };
function padsNow() { const ps = navigator.getGamepads ? navigator.getGamepads() : []; return [...ps].filter(p => p && p.connected); }
function openJoin() {
  join.open = true; join.slots = [null, null]; join.prev = {}; for (const p of padsNow()) join.prev[p.index] = p.buttons.map(b => b.pressed); join.axPrev = {};
  $('launch-modal').hidden = true; $('join-modal').hidden = false; padCursor.hide(); renderJoin(); requestAnimationFrame(joinLoop);
}
function closeJoin() { join.open = false; $('join-modal').hidden = true; }
function nextChar(ch, d, other) { let i = CHAR_KEYS.indexOf(ch); for (let n = 0; n < CHAR_KEYS.length; n++) { i = (i + d + CHAR_KEYS.length) % CHAR_KEYS.length; if (CHAR_KEYS[i] !== other) return CHAR_KEYS[i]; } return ch; }
function joinSlot(dev) {
  const free = join.slots.findIndex(s => !s); if (free < 0) return;
  if (dev !== 'kb' && free === 0 && false) return;
  const other = join.slots[1 - free], c0 = free === 0 ? game.charKey : (CHARS[Settings.char2] ? Settings.char2 : game.charKey);
  join.slots[free] = { dev, ch: other && other.ch === c0 ? nextChar(c0, 1, other.ch) : c0 }; game.audio.ui(); renderJoin();
}
function joinLeave(i) { join.slots[i] = null; game.audio.ui(); renderJoin(); }
function joinChar(i, d) { const s = join.slots[i]; if (!s) return; const o = join.slots[1 - i]; s.ch = nextChar(s.ch, d, o && o.ch); game.audio.ui(); renderJoin(); }
function joinReady() { const [a, b] = join.slots; return !!(a && b && b.dev !== 'kb'); }
function joinGo() {
  if (!joinReady()) return; const [a, b] = join.slots; closeJoin();
  game.charKey = a.ch; Settings.char = a.ch; Settings.char2 = b.ch; Settings.save(); wardIdx = Math.max(0, CHAR_KEYS.indexOf(a.ch)); renderWardrobe();
  game.coopPads = { p1: a.dev, p2: b.dev }; game.newCoop();
}
function renderJoin() {
  const pads = padsNow(), el = $('join-slots');
  $('join-hint').textContent = pads.length >= 2 ? 'Chaque joueur appuie sur A sur sa manette. Croix ← → : changer de personnage · B : se retirer.' : pads.length === 1 ? 'Une seule manette détectée : le J1 peut jouer au clavier et à la souris (appuie sur Entrée), le J2 appuie sur A.' : 'Aucune manette détectée : branche une ou deux manettes et appuie sur un bouton. Le J1 peut jouer au clavier (Entrée).';
  el.innerHTML = join.slots.map((s, i) => `<div class="jslot ${s ? 'on' : ''}" data-p="${i + 1}"><span class="jtag">J${i + 1}</span>${s ? `<canvas width="960" height="720" data-ch="${s.ch}"></canvas><div class="jname"><button type="button" class="btn sm" data-jc="${i}" data-d="-1" aria-label="Personnage précédent">‹</button>${CHARS[s.ch].name}<button type="button" class="btn sm" data-jc="${i}" data-d="1" aria-label="Personnage suivant">›</button></div><span class="jdev">${s.dev === 'kb' ? '⌨ Clavier et souris' : `🎮 Manette ${s.dev + 1}`} · prêt</span><button type="button" class="btn sm" data-jl="${i}">Se retirer</button>` : `<span class="jwait">${i === 0 ? 'Appuie sur A (ou Entrée)' : 'Appuie sur A'}</span><span class="jdev">${i === 1 ? 'Le joueur 2 joue à la manette' : 'Manette ou clavier'}</span>`}</div>`).join('');
  for (const cv of el.querySelectorAll('canvas[data-ch]')) renderPortrait(cv, cv.dataset.ch);
  for (const b of el.querySelectorAll('[data-jc]')) b.addEventListener('click', () => joinChar(+b.dataset.jc, +b.dataset.d));
  for (const b of el.querySelectorAll('[data-jl]')) b.addEventListener('click', () => joinLeave(+b.dataset.jl));
  $('join-go').disabled = !joinReady(); $('join-go').textContent = joinReady() ? 'Lancer la partie' : join.slots[0] && join.slots[0].dev === 'kb' && !join.slots[1] ? 'En attente du J2…' : 'En attente des joueurs…';
}
function joinLoop() {
  if (!join.open) return; requestAnimationFrame(joinLoop);
  let n = 0;
  for (const p of padsNow()) {
    n++; const pr = join.prev[p.index] || [], B = i => p.buttons[i] && p.buttons[i].pressed, E = i => B(i) && !pr[i];
    const ax = p.axes[0] || 0, axp = join.axPrev[p.index] || 0, sx = Math.abs(ax) > 0.6 && Math.abs(axp) <= 0.6 ? Math.sign(ax) : 0; join.axPrev[p.index] = ax;
    const si = join.slots.findIndex(s => s && s.dev === p.index);
    if (si < 0) { if (E(0)) joinSlot(p.index); else if (E(1) && !join.slots.some(Boolean)) { closeJoin(); openLaunch('coop'); return; } }
    else {
      if (E(14) || sx < 0) joinChar(si, -1); if (E(15) || sx > 0) joinChar(si, 1);
      if (E(1)) joinLeave(si); else if ((E(9) || E(0)) && joinReady()) { join.prev[p.index] = p.buttons.map(b => b.pressed); joinGo(); return; }
    }
    join.prev[p.index] = p.buttons.map(b => b.pressed);
  }
  if (n !== join.lastN) { join.lastN = n; renderJoin(); }
}
addEventListener('keydown', e => {
  if (!join.open) return; const ki = join.slots.findIndex(s => s && s.dev === 'kb');
  if (e.key === 'Enter') { e.preventDefault(); if (ki < 0) { if (!join.slots[0]) joinSlot('kb'); else if (!join.slots[1] && join.slots[0].dev !== 'kb') { join.slots[1] = join.slots[0]; join.slots[0] = null; joinSlot('kb'); } } else if (joinReady()) joinGo(); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (ki >= 0) joinLeave(ki); else { closeJoin(); openLaunch('coop'); } }
  else if (ki >= 0 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); e.stopImmediatePropagation(); joinChar(ki, e.key === 'ArrowLeft' ? -1 : 1); }
}, true);
$('join-back').addEventListener('click', () => { closeJoin(); openLaunch('coop'); });
$('join-go').addEventListener('click', joinGo);

$('btn-paradise').addEventListener('click', () => game.newSecret(true));
$('btn-survival').addEventListener('click', () => game.newSurvival(game.mode === 'story' && game.lastVictory));
function achHTML() { const u = Ach.get(); return `<p class="hint">${ACH.filter(a => u[a[0]]).length} / ${ACH.length} succès débloqués sur cet appareil</p><div class="achs">${ACH.map(([id, n, d]) => `<div class="ach ${u[id] ? 'on' : ''}"><b>${n}</b><span>${u[id] ? d : d + ' · verrouillé'}</span></div>`).join('')}</div>`; }
$('btn-ach').addEventListener('click', e => togglePanel('panel-ach', e.currentTarget, achHTML));
