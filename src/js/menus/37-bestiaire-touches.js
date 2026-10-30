// ---------- bestiaire : fiches BD dessinées par le moteur du jeu
function newBeastsHTML(keys) {
  if (!keys || !keys.length) return '';
  return `<div class="new-beasts"><p class="nb-eb">Mauvaise nouvelle…</p><p class="nb-h">${keys.length > 1 ? 'Nouvelles menaces' : 'Nouvelle menace'}</p><div class="nb-row">${keys.map(k => { const B = BESTIARY.find(b => b.k === k); return `<div class="nb ${B.boss ? 'boss' : ''}"><canvas width="160" height="128" data-beast="${k}" data-known="1" aria-hidden="true"></canvas><b>${B.name}</b><small>${'☠'.repeat(B.m)}</small></div>`; }).join('')}</div><p class="nb-foot">Ajouté${keys.length > 1 ? 's' : ''} au Bestiaire. Méfie-toi.</p></div>`;
}
function bestHTML() {
  const S = Settings.seen || {}, n = BESTIARY.filter(b => S[b.k] != null).length;
  return `<p class="hint">${n} / ${BESTIARY.length} fiches · chaque rencontre dans la nuit en ouvre une nouvelle</p><div class="beasts">${BESTIARY.map((b, i) => { const known = S[b.k] != null; return `<article class="beast ${known ? '' : 'unk'} ${b.boss ? 'boss' : ''}"><div class="beast-art"><canvas width="240" height="190" data-beast="${b.k}" data-known="${known ? 1 : ''}" aria-hidden="true"></canvas><span class="beast-no">N° ${String(i + 1).padStart(2, '0')}</span>${known ? `<span class="beast-sfx">${b.boss ? 'DANGER' : b.k === 'dog' ? 'GRRR…' : 'ARGH…'}</span>` : ''}</div><div class="beast-txt"><b>${known ? b.name : '???'}</b><small>${known ? b.type : 'Pas encore rencontré'}</small><span class="menace" aria-label="Menace ${b.m} sur 5">${'☠'.repeat(b.m)}<i>${'☠'.repeat(5 - b.m)}</i></span>${known ? `<p class="beast-say">${b.txt}</p><p class="beast-tip"><b>Astuce</b>${b.tip}</p><p class="beast-kills">Abattus : <b>${fmt(S[b.k] || 0)}</b></p>` : `<p class="beast-tip">${b.boss ? 'Un boss rôde quelque part. Trouve-le pour ouvrir sa fiche.' : 'Croise-le dans la nuit pour ouvrir sa fiche.'}</p>`}</div></article>`; }).join('')}</div>`;
}
function beastSprite(k) {
  const g = game, z = k === 'ultimate' ? new UltimateBoss(g, 0, 0) : k === 'boss' ? new Boss(g, 0, 0) : k.startsWith('mini') ? new MiniBoss(g, 0, 0, +k.slice(4)) : new Zombie(g, k, 0, 0, null);
  z.spawnT = 0; z.dir = Math.PI * 0.3; z.walkT = 2.2; z.costume = null; z.state = 'chase'; z.hitFlash = 0; z.hp = z.maxHp; z.burn = 0; if (k === 'dog') { z.bState = 'crouch'; z.bT = 0.2; z.cdx = 0; z.cdy = 0; } return z;
}
const beastBuf = document.createElement('canvas');
function drawBeast(cv, k, known) {
  const g = cv.getContext('2d'), W = cv.width, H = cv.height;
  const bg = g.createRadialGradient(W / 2, H * 0.55, 10, W / 2, H * 0.55, W * 0.7); bg.addColorStop(0, known ? '#5a1612' : '#2a2630'); bg.addColorStop(0.55, known ? '#240a09' : '#141218'); bg.addColorStop(1, known ? '#070505' : '#08070a'); /* fond de dossier sombre, halo rouge sale */ g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H * 0.55); g.fillStyle = known ? 'rgba(255,90,60,.06)' : 'rgba(255,255,255,.03)'; for (let i = 0; i < 16; i++) { g.rotate(TAU / 16); g.beginPath(); g.moveTo(0, 0); g.lineTo(W, -18); g.lineTo(W, 18); g.fill(); } g.restore();
  g.fillStyle = known ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.25)'; for (let y = 6; y < H; y += 9) for (let x = (y / 9 % 2) * 4.5; x < W; x += 9) { g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill(); }
  const b = beastBuf; b.width = W; b.height = H; const bc = b.getContext('2d'), z = beastSprite(k), sc = Math.min(3.4, (H * 0.8) / (z.r * (z.type === 'dog' ? 2.6 : z.type === 'boss' ? 4 : 3.2)));
  bc.save(); bc.translate(W / 2, H * 0.9); bc.scale(sc, sc); const saved = ctx; ctx = bc; try { game.drawZombie(z); } catch (e) { } ctx = saved; bc.restore();
  if (!known) { bc.globalCompositeOperation = 'source-in'; bc.fillStyle = '#0b090d'; bc.fillRect(0, 0, W, H); bc.globalCompositeOperation = 'source-over'; bc.fillStyle = '#5a5560'; bc.font = `64px ${FD}`; bc.textAlign = 'center'; bc.fillText('?', W / 2, H * 0.58); }
  g.drawImage(b, 0, 0);
  if (known) { const r = mulberry32(k.length * 97 + k.charCodeAt(0)); for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${110 + r() * 40},8,6,${0.25 + r() * 0.4})`; g.beginPath(); g.arc(r() * W, H * 0.55 + (r() - 0.2) * H * 0.5, 0.6 + r() * 2.4, 0, TAU); g.fill(); } } // éclaboussures
}
function drawBestiary() { for (const cv of document.querySelectorAll('canvas[data-beast]')) drawBeast(cv, cv.dataset.beast, !!cv.dataset.known); }
$('btn-best').addEventListener('click', e => { togglePanel('panel-best', e.currentTarget, bestHTML); drawBestiary(); fontsReady.then(drawBestiary); });
window.__drawBestiary = drawBestiary; window.__v42 = { HALLOWEEN, Zombie, Settings, HOSP, ONLINE, Online, Scores };
$('btn-quit').addEventListener('click', () => { if (game.net || game.netGuest) { game.netLeave(); return; } game.audio.flame(false); game.setupDemo(); game.showScreen('scr-title'); refreshSurvivalBtn(); });
$('btn-save').addEventListener('click', () => game.saveScore());
$('end-name').addEventListener('keydown', e => { if (e.key === 'Enter') game.saveScore(); });
$('btn-again').addEventListener('click', () => { if (game.net === 'host' && Net.ok()) { game.netStartHost(game.netMode); return; } if (game.netGuest) { game.toast('C\'est l\'hôte qui relance la partie', '#9fd6e6'); return; } if (game.coop) game.newCoop(); else if (game.endless) game.newEndless(); else if (game.dailyMod) game.newDaily(); else if (game.mode === 'survival') game.newSurvival(false); else if (game.mode === 'secret') game.newSecret(false); else if (game.mode === 'hospital') game.newHospital(); else game.newGame(); });
$('btn-photo').addEventListener('click', openSouvenir);
$('photo-close').addEventListener('click', () => { $('photo-modal').hidden = true; $('btn-photo').focus(); });
$('btn-menu').addEventListener('click', () => { if (game.net || game.netGuest) { game.netLeave(); return; } game.setupDemo(); game.showScreen('scr-title'); refreshSurvivalBtn(); });
// ---------- personnalisation des touches
let capture = null, captureArmed = false, ignoreClickUntil = 0, keysReturn = null;
const actLabel = a => ACTIONS.find(x => x[0] === a)[1];
function renderBinds() {
  const t = $('binds'); if (!t) return;
  t.innerHTML = '<thead><tr><th>Action</th><th>Touche 1</th><th>Touche 2</th></tr></thead><tbody>' + ACTIONS.map(([a, label]) => `<tr><td>${label}</td>${[0, 1].map(i => { const on = !!capture && capture.a === a && capture.i === i; return `<td><button type="button" class="btn sm keycap" data-act="${a}" data-slot="${i}" aria-pressed="${on}" aria-label="${label}, touche ${i + 1}">${on ? 'Appuie sur une touche…' : keyLabel(Settings.binds[a][i])}</button></td>`; }).join('')}</tr>`).join('') + '</tbody>';
}
function assignBind(code) {
  const { a, i } = capture; capture = null; captureArmed = false; let msg = `${actLabel(a)} : ${keyLabel(code)}.`;
  for (const [o] of ACTIONS) for (let j = 0; j < 2; j++) if (Settings.binds[o][j] === code && !(o === a && j === i)) { Settings.binds[o][j] = ''; if (o !== a) msg += ` Retirée de « ${actLabel(o)} ».`; }
  Settings.binds[a][i] = code; Settings.save(); $('bind-msg').textContent = msg; renderBinds(); game.audio.ui();
  const btn = document.querySelector(`.keycap[data-act="${a}"][data-slot="${i}"]`); if (btn) btn.focus();
}
$('binds').addEventListener('click', e => {
  const b = e.target.closest('.keycap'); if (!b || performance.now() < ignoreClickUntil) return;
  game.audio.init(); capture = { a: b.dataset.act, i: +b.dataset.slot }; captureArmed = false; $('bind-msg').textContent = ''; renderBinds();
  setTimeout(() => { captureArmed = true; }, 0);
});
addEventListener('keydown', e => {
  if (!capture) return; e.preventDefault(); e.stopImmediatePropagation();
  if (e.code === 'Escape') { capture = null; $('bind-msg').textContent = 'Modification annulée.'; renderBinds(); return; }
  if (/^(Digit|Numpad)[1-6]$/.test(e.code)) { $('bind-msg').textContent = 'Les touches 1 à 6 sont réservées au choix direct des armes.'; return; }
  assignBind(e.code);
}, true);
addEventListener('mousedown', e => {
  if (!capture || !captureArmed) return;
  const t = e.target && e.target.closest ? e.target.closest('button') : null;
  const same = t && t.classList.contains('keycap') && t.dataset.act === capture.a && +t.dataset.slot === capture.i;
  if (t && !same) { capture = null; renderBinds(); $('bind-msg').textContent = 'Modification annulée.'; return; }
  e.preventDefault(); e.stopImmediatePropagation(); ignoreClickUntil = performance.now() + 500; assignBind('Mouse' + e.button);
}, true);
addEventListener('contextmenu', e => { if (game.keysOpen) e.preventDefault(); }, true);
let padCapture = null, padBlockUntil = 0;
// ---------- schéma de manette pour l'écran des touches (dessin au trait, étiquettes en deux colonnes)
const PAD_POS = { 0: [720, 312], 1: [752, 280], 2: [688, 280], 3: [720, 248], 4: [490, 168], 5: [710, 168], 6: [490, 134], 7: [710, 134], 8: [528, 214], 9: [672, 214], 10: [552, 352], 11: [648, 352], 12: [480, 254], 13: [480, 306], 14: [454, 280], 15: [506, 280] };
const PAD_COL = { 0: '#5fbf55', 1: '#e0483c', 2: '#4a8fe8', 3: '#e8b828' };
function padActionsFor(i) { return PAD_ACTIONS.filter(([a]) => Settings.padBinds[a].includes(i)).map(([, l]) => l.replace(' (maintenir)', '')); }
function renderPadSvg() {
  const el = $('pad-svg'); if (!el) return;
  const left = [6, 4, 8, 12, 14, 13, 15, 10], right = [7, 5, 9, 3, 1, 0, 2, 11];
  const fixed = { 10: 'Déplacer', 11: 'Viser' }, row = k => 64 + k * 58;
  const glyph = (i, x, y) => {
    if (i <= 3) return `<circle cx="${x}" cy="${y}" r="15" class="gface" style="stroke:${PAD_COL[i]}"/><text class="gt" x="${x}" y="${y + 6}" text-anchor="middle" style="fill:${PAD_COL[i]}">${PAD_SHORT[i]}</text>`;
    if (i >= 12) { const a = { 12: 0, 15: 90, 13: 180, 14: 270 }[i]; return `<rect class="gchip" x="${x - 17}" y="${y - 15}" width="34" height="30" rx="6"/><path class="garrow" transform="translate(${x} ${y}) rotate(${a})" d="M0 -8 L8 5 L-8 5 Z"/>`; }
    const t = PAD_SHORT[i], w = Math.max(40, t.length * 11 + 18); return `<rect class="gchip" x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="6"/><text class="gt" x="${x}" y="${y + 6}" text-anchor="middle">${t}</text>`;
  };
  const lab = (i, side, k) => {
    const [bx, by] = PAD_POS[i], ly = row(k), acts = (fixed[i] ? [fixed[i]] : []).concat(padActionsFor(i)), none = !acts.length;
    const gx = side < 0 ? 300 : 900, x0 = side < 0 ? gx + 40 : gx - 40, mx = side < 0 ? Math.min(bx - 30, 400) : Math.max(bx + 30, 800);
    const lines = acts.length > 1 ? [acts[0], acts.slice(1).join(' · ')] : [acts[0] || '—'], hw = i <= 3 ? 16 : i >= 12 ? 17 : Math.max(40, PAD_SHORT[i].length * 11 + 18) / 2, tx = side < 0 ? gx - hw - 14 : gx + hw + 14, anc = side < 0 ? 'end' : 'start';
    return `<g class="pl ${none ? 'none' : ''}"><path d="M${side < 0 ? gx + hw + 6 : gx - hw - 6} ${ly} H${mx} L${bx} ${by}"/><circle cx="${bx}" cy="${by}" r="3"/>${glyph(i, gx, ly)}<text x="${tx}" y="${ly + (lines.length > 1 ? -3 : 6)}" text-anchor="${anc}">${lines.map((l, j) => `<tspan x="${tx}" dy="${j ? 20 : 0}" class="${j ? 'sub' : ''}">${l}</tspan>`).join('')}</text></g>`;
  };
  el.innerHTML = `<svg viewBox="0 0 1200 540" role="img" aria-label="Schéma de la manette avec l'action de chaque bouton">
    <defs><radialGradient id="padspot" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="rgba(255,255,255,.10)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>
    <rect x="0" y="0" width="1200" height="540" fill="url(#padspot)"/>
    <g class="pad-art">
      <rect x="452" y="118" width="76" height="32" rx="12"/><rect x="672" y="118" width="76" height="32" rx="12"/>
      <rect x="446" y="158" width="88" height="20" rx="10"/><rect x="666" y="158" width="88" height="20" rx="10"/>
      <path d="M468 182 Q600 166 732 182 Q806 192 836 266 Q876 386 856 456 Q836 506 794 500 Q762 494 738 444 L704 392 Q600 376 496 392 L462 444 Q438 494 406 500 Q364 506 344 456 Q324 386 364 266 Q394 192 468 182 Z"/>
      <rect x="560" y="196" width="80" height="58" rx="10" class="pad-touch"/>
      <rect x="514" y="206" width="28" height="16" rx="8"/><rect x="658" y="206" width="28" height="16" rx="8"/>
      <path d="M470 236 h20 v34 h34 v20 h-34 v34 h-20 v-34 h-34 v-20 h34 z"/>
      ${[0, 1, 2, 3].map(i => `<circle cx="${PAD_POS[i][0]}" cy="${PAD_POS[i][1]}" r="15"/>`).join('')}
      <circle cx="552" cy="352" r="30"/><circle cx="552" cy="352" r="18"/><circle cx="648" cy="352" r="30"/><circle cx="648" cy="352" r="18"/>
      <circle cx="600" cy="300" r="9"/>
    </g>
    ${left.map((i, k) => lab(i, -1, k)).join('')}${right.map((i, k) => lab(i, 1, k)).join('')}
  </svg>`;
}
let keysView = null;
function setKeysView(v, manual) {
  if (manual) keysView = v; const view = keysView || (deviceNow() === 'pad' ? 'pad' : 'kb');
  $('keys-kb').hidden = view !== 'kb'; $('keys-pad').hidden = view !== 'pad';
  for (const b of document.querySelectorAll('[data-kview]')) b.setAttribute('aria-pressed', b.dataset.kview === view ? 'true' : 'false');
  if (view === 'pad') renderPadSvg();
}
setInterval(() => { if (game.keysOpen && !keysView) setKeysView(); }, 400);
function renderPadBinds() {
  const t = $('padbinds'); if (!t) return; renderPadSvg();
  t.innerHTML = '<thead><tr><th>Action</th><th>Bouton 1</th><th>Bouton 2</th></tr></thead><tbody>' + PAD_ACTIONS.map(([a, label]) => `<tr><td>${label}</td>${[0, 1].map(i => { const on = !!padCapture && padCapture.a === a && padCapture.i === i; return `<td><button type="button" class="btn sm keycap padcap" data-pact="${a}" data-slot="${i}" aria-pressed="${on}" aria-label="${label}, bouton ${i + 1}">${on ? 'Appuie sur un bouton…' : padLabel(Settings.padBinds[a][i])}</button></td>`; }).join('')}</tr>`).join('') + '</tbody>';
}
function cancelPad(msg) { padCapture = null; renderPadBinds(); if (msg) $('bind-msg').textContent = msg; }
function assignPad(btn) {
  const { a, i } = padCapture; padCapture = null; padBlockUntil = performance.now() + 350; let msg = `${actLabel(a)} : ${padLabel(btn)}.`;
  for (const [o] of PAD_ACTIONS) for (let j = 0; j < 2; j++) if (Settings.padBinds[o][j] === btn && !(o === a && j === i)) { Settings.padBinds[o][j] = -1; if (o !== a) msg += ` Retiré de « ${actLabel(o)} ».`; }
  Settings.padBinds[a][i] = btn; Settings.save(); $('bind-msg').textContent = msg; renderPadBinds(); game.audio.ui();
  const el = document.querySelector(`.padcap[data-pact="${a}"][data-slot="${i}"]`); if (el) el.focus();
}
function pollPadCapture() {
  if (game.keysOpen) {
    const gp = game.input.gamepad(), st = $('pad-status');
    const txt = gp ? `Manette détectée : ${gp.id.replace(/\s*\(.*$/, '').slice(0, 60) || 'manette'}` : 'Aucune manette détectée : branche-la puis appuie sur un de ses boutons.';
    if (st.textContent !== txt) st.textContent = txt;
  }
  if (!padCapture) return;
  if (performance.now() > padCapture.until) { cancelPad('Aucun bouton reçu : modification annulée.'); return; }
  const gp = game.input.gamepad(); if (!gp) return;
  const pressed = gp.buttons.map(x => x.pressed || x.value > 0.5);
  if (!padCapture.armed) { if (!pressed.some(Boolean)) padCapture.armed = true; return; }
  const btn = pressed.findIndex(Boolean); if (btn >= 0) assignPad(btn);
}
$('padbinds').addEventListener('click', e => {
  const b = e.target.closest('.padcap'); if (!b || performance.now() < padBlockUntil) return;
  game.audio.init(); capture = null; renderBinds();
  padCapture = { a: b.dataset.pact, i: +b.dataset.slot, armed: false, until: performance.now() + 8000 };
  $('bind-msg').textContent = 'Appuie sur le bouton de la manette voulu (8 s, Échap pour annuler).'; renderPadBinds();
});
addEventListener('keydown', e => { if (padCapture && e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); cancelPad('Modification annulée.'); } }, true);
addEventListener('mousedown', e => { if (padCapture && !(e.target.closest && e.target.closest('.padcap'))) cancelPad('Modification annulée.'); }, true);
function openKeys(from) { keysReturn = from; game.keysOpen = true; capture = null; padCapture = null; keysView = null; renderBinds(); renderPadBinds(); setKeysView(); $('bind-msg').textContent = ''; game.showScreen('scr-keys'); const b = document.querySelector('.keycap'); if (b) b.focus(); }
function closeKeys() { capture = null; padCapture = null; game.keysOpen = false; game.input.pc.clear(); game.input.pk.clear(); game.showScreen(keysReturn); const f = keysReturn === 'scr-pause' ? $('btn-resume') : $('btn-keys'); if (f) f.focus(); }
$('btn-keys').addEventListener('click', () => openKeys('scr-title'));
$('btn-keys-pause').addEventListener('click', () => openKeys('scr-pause'));
$('btn-binds-back').addEventListener('click', closeKeys);
for (const b of document.querySelectorAll('[data-kview]')) b.addEventListener('click', () => setKeysView(b.dataset.kview, true));
$('btn-binds-reset').addEventListener('click', () => { Settings.binds = JSON.parse(JSON.stringify(DEFAULT_BINDS)); Settings.padBinds = JSON.parse(JSON.stringify(DEFAULT_PAD)); Settings.save(); $('bind-msg').textContent = 'Touches et boutons par défaut rétablis.'; renderBinds(); renderPadBinds(); });
addEventListener('keydown', e => { if (game.keysOpen && !capture && e.code === 'Escape') { e.preventDefault(); closeKeys(); } });
