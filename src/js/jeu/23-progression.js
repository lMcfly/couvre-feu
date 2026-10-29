// ---------- mutations de la Nuit sans fin
const MUTATIONS = [
  { id: 'dmg', ico: '💥', name: 'Balles enragées', desc: '+20 % de dégâts pour toutes les armes' },
  { id: 'hp', ico: '❤', name: 'Peau dure', desc: '+25 points de vie max, soins complets', apply: (g, p) => { p.maxHp += 25; p.hp = p.maxHp; } },
  { id: 'speed', ico: '👟', name: 'Jambes de feu', desc: '+10 % de vitesse de déplacement' },
  { id: 'reload', ico: '🔄', name: 'Mains rapides', desc: 'Rechargement 25 % plus rapide' },
  { id: 'regen', ico: '✚', name: 'Régénération', desc: 'Récupère 1,5 point de vie par seconde' },
  { id: 'vamp', ico: '🩸', name: 'Vampire', desc: 'Chaque zombie abattu rend 2 points de vie' },
  { id: 'money', ico: '$', name: 'Pilleur', desc: '+40 % d\'argent ramassé' },
  { id: 'boom', ico: '💣', name: 'Artificier', desc: '+3 grenades, +2 mines tout de suite', apply: (g, p) => { p.grenades = Math.min(12, p.grenades + 3); p.mines = Math.min(8, p.mines + 2); } },
  { id: 'buddy', ico: '🐕', name: 'Meilleur ami', desc: 'Un shiba te rejoint et défend ta position', once: true, apply: (g, p) => g.adoptBuddy(p.x - 30, p.y + 10) },
  { id: 'lamp', ico: '🔦', name: 'Piles au lithium', desc: 'La lampe s\'use deux fois moins vite' }
];
const mutN = id => (typeof game !== 'undefined' && game.endless && game.endless.m[id]) || 0;
// ---------- lot 2 : niveaux, accessoires, améliorations de lampe
const LEVEL_MAX = 30;
const LEVEL_NEED = n => Math.round(400 * Math.pow(n, 1.35));
function levelInfo(xp) { let lv = 1, rest = xp || 0; while (lv < LEVEL_MAX && rest >= LEVEL_NEED(lv)) { rest -= LEVEL_NEED(lv); lv++; } return { lv, into: rest, need: lv >= LEVEL_MAX ? 1 : LEVEL_NEED(lv) }; }
const playerLevel = () => levelInfo(Settings.xp).lv;
const REWARDS = [
  { lv: 2, type: 'acc', id: 'lunettes', name: 'Lunettes noires' },
  { lv: 3, type: 'lamp', id: 'large', name: 'Lampe grand angle', desc: 'Le faisceau est plus large' },
  { lv: 4, type: 'acc', id: 'foulard', name: 'Foulard rouge' },
  { lv: 5, type: 'lamp', id: 'longue', name: 'Lampe longue portée', desc: 'Le faisceau porte 25 % plus loin' },
  { lv: 6, type: 'acc', id: 'casque', name: 'Casque audio' },
  { lv: 8, type: 'lamp', id: 'flash', name: 'Flash aveuglant', desc: 'Touche T (croix ↑ à la manette) : étourdit les zombies dans le faisceau' },
  { lv: 10, type: 'acc', id: 'couronne', name: 'Couronne' },
  { lv: 12, type: 'acc', id: 'clown', name: 'Nez de clown' },
  { lv: 15, type: 'acc', id: 'aureole', name: 'Auréole' },
  { lv: 20, type: 'acc', id: 'cornes', name: 'Cornes de démon' }
];
const hasReward = id => id === 'citrouille' ? !!Settings.pumpkin : REWARDS.some(r => r.id === id && playerLevel() >= r.lv);
const ACCS = [{ id: 'aucun', name: 'Aucun', lv: 1 }].concat(REWARDS.filter(r => r.type === 'acc'), [{ id: 'citrouille', name: 'Tête de citrouille', lv: 1, ev: true }]);
const accOk = a => a.ev ? !!Settings.pumpkin : playerLevel() >= a.lv;
const currentAcc = (ch = game.charKey) => { const a = (Settings.accBy && Settings.accBy[ch]) || Settings.acc; return (a && hasReward(a)) ? a : 'aucun'; };
// carnet de route de chaque survivant (parties, zombies, record, XP)
function cstat(ch) { const all = Settings.cstats || (Settings.cstats = {}); return all[ch] || (all[ch] = { games: 0, wins: 0, kills: 0, best: 0, xp: 0, time: 0 }); }
const lampHalf = () => 0.62 * (hasReward('large') ? 1.25 : 1);
const lampRange = () => hasReward('longue') ? 1.25 : 1;
const HEAD_TOP = { pedro: -322, chewie: -306 };
// accessoire sur le personnage de BD (mêmes repères que hero : pieds en 0,0)
function drawAccessory(g, ch, acc, x, y, s) {
  if (!acc || acc === 'aucun') return;
  g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  const K = (fill, path, lw = 4) => { g.beginPath(); path(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); } };
  const top = HEAD_TOP[ch] || -284, eye = ch === 'dobby' ? -222 : ch === 'chewie' ? -240 : -246;
  if (acc === 'citrouille') { g.translate(0, eye + 22); g.scale(5.4, 5.4); g.lineWidth = 1.4; g.strokeStyle = INK; g.beginPath(); g.ellipse(0, -2, 14.6, 10.8, 0, 0, TAU); g.stroke(); drawPumpkin(g, 0, 0, 1, performance.now() / 1000, true); g.restore(); return; }
  if (acc === 'lunettes') { K('#111', () => { RR(g, -34, eye - 10, 30, 20, 7); RR(g, 4, eye - 10, 30, 20, 7); }); K(null, () => { g.moveTo(-4, eye - 3); g.lineTo(4, eye - 3); }); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-28, eye - 6, 8, 3); g.fillRect(10, eye - 6, 8, 3); }
  if (acc === 'foulard') { K('#c0392b', () => { g.moveTo(-36, -206); g.quadraticCurveTo(0, -192, 36, -206); g.lineTo(32, -190); g.quadraticCurveTo(0, -176, -32, -190); g.closePath(); }); K('#c0392b', () => { g.moveTo(14, -192); g.lineTo(30, -160); g.lineTo(6, -168); g.closePath(); }); g.fillStyle = '#f4ead2'; for (const [px, py] of [[-20, -198], [0, -192], [20, -198]]) { g.beginPath(); g.arc(px, py, 2.5, 0, TAU); g.fill(); } }
  if (acc === 'casque') { K(null, () => { g.arc(0, -240, 50, Math.PI * 1.05, Math.PI * 1.95); }, 9); K('#2a2a33', () => { RR(g, -58, -258, 18, 34, 7); RR(g, 40, -258, 18, 34, 7); }); g.fillStyle = '#e2792f'; g.fillRect(-54, -246, 10, 10); g.fillRect(44, -246, 10, 10); }
  if (acc === 'couronne') { K('#ffd23a', () => { g.moveTo(-28, top + 8); g.lineTo(-28, top - 18); g.lineTo(-14, top - 6); g.lineTo(0, top - 26); g.lineTo(14, top - 6); g.lineTo(28, top - 18); g.lineTo(28, top + 8); g.closePath(); }); g.fillStyle = '#d0141e'; g.beginPath(); g.arc(0, top - 2, 4, 0, TAU); g.fill(); }
  if (acc === 'clown') { K('#e0321f', () => g.arc(0, eye + 20, 11, 0, TAU), 3); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(-3, eye + 16, 3, 0, TAU); g.fill(); }
  if (acc === 'aureole') { g.lineWidth = 7; g.strokeStyle = '#ffe07a'; g.shadowColor = '#ffe07a'; g.shadowBlur = 14; g.beginPath(); g.ellipse(0, top - 20, 34, 9, 0, 0, TAU); g.stroke(); g.shadowBlur = 0; }
  if (acc === 'cornes') { K('#8a0c2a', () => { g.moveTo(-26, top + 14); g.quadraticCurveTo(-40, top - 10, -30, top - 30); g.quadraticCurveTo(-24, top - 6, -12, top + 6); g.closePath(); g.moveTo(26, top + 14); g.quadraticCurveTo(40, top - 10, 30, top - 30); g.quadraticCurveTo(24, top - 6, 12, top + 6); g.closePath(); }); }
  g.restore();
}
// version minuscule sur le personnage vu de dessus (tête vers 0,-31)
function drawAccessoryTop(c, acc, hx, hy) {
  if (!acc || acc === 'aucun') return;
  if (acc === 'lunettes') { c.fillStyle = '#0b0b0b'; c.fillRect(hx - 6, hy - 1, 5, 3); c.fillRect(hx + 1, hy - 1, 5, 3); }
  if (acc === 'foulard') { c.fillStyle = '#c0392b'; c.fillRect(hx - 6, hy + 6, 12, 3); }
  if (acc === 'casque') { c.strokeStyle = '#2a2a33'; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy, 8.5, Math.PI, TAU); c.stroke(); c.fillStyle = '#e2792f'; c.fillRect(hx - 10, hy - 2, 3, 5); c.fillRect(hx + 7, hy - 2, 3, 5); }
  if (acc === 'couronne') { c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(hx - 6, hy - 6); c.lineTo(hx - 6, hy - 12); c.lineTo(hx - 3, hy - 8); c.lineTo(hx, hy - 13); c.lineTo(hx + 3, hy - 8); c.lineTo(hx + 6, hy - 12); c.lineTo(hx + 6, hy - 6); c.fill(); }
  if (acc === 'clown') { c.fillStyle = '#e0321f'; c.beginPath(); c.arc(hx, hy + 2, 2.4, 0, TAU); c.fill(); }
  if (acc === 'aureole') { c.strokeStyle = '#ffe07a'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(hx, hy - 12, 7, 2.2, 0, 0, TAU); c.stroke(); }
  if (acc === 'citrouille') { c.save(); c.translate(hx, hy + 1); c.scale(0.62, 0.62); drawPumpkin(c, 0, 0, 1, game.time, true); c.restore(); return; }
  if (acc === 'cornes') { c.fillStyle = '#8a0c2a'; c.beginPath(); c.moveTo(hx - 5, hy - 5); c.lineTo(hx - 8, hy - 12); c.lineTo(hx - 2, hy - 6); c.moveTo(hx + 5, hy - 5); c.lineTo(hx + 8, hy - 12); c.lineTo(hx + 2, hy - 6); c.fill(); }
}
const accThumbs = new Map();
function accThumb(ch, acc) {
  const key = ch + '|' + acc; let cv = accThumbs.get(key); if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = cv.height = 128; renderHead(cv, ch, null, acc); accThumbs.set(key, cv); return cv;
}
function renderAccPicker() {
  const el = $('acc-pick'); if (!el) return; const ch = ficheKey || game.charKey, lv = playerLevel(), cur = currentAcc(ch);
  el.className = 'acc-tiles';
  const lockTxt = a => a.ev ? `Halloween : abats ${HW_GOAL} zombies déguisés (${hwCount()} / ${HW_GOAL})` : 'se débloque au niveau ' + a.lv;
  el.innerHTML = ACCS.filter(a => !a.ev || HALLOWEEN || Settings.pumpkin).map(a => { const ok = accOk(a); return `<button type="button" class="acc-tile ${ok ? '' : 'locked'} ${accPreview === a.id ? 'preview' : ''} ${a.ev ? 'ev' : ''}" data-acc="${a.id}" aria-pressed="${a.id === cur}" title="${ok ? 'Équiper' : 'Aperçu · ' + lockTxt(a)}"><canvas width="128" height="128" aria-hidden="true"></canvas><span>${a.name}</span><small>${ok ? (a.id === cur ? 'équipé' : 'équiper') : a.ev ? `🎃 ${hwCount()} / ${HW_GOAL}` : '🔒 niv. ' + a.lv}</small></button>`; }).join('') + `<p class="fiche-preview" id="acc-prev-msg">${accPreview ? `Aperçu : ${ACCS.find(a => a.id === accPreview).name} · ${lockTxt(ACCS.find(a => a.id === accPreview))}` : ''}</p>`;
  for (const b of el.querySelectorAll('[data-acc]')) {
    b.querySelector('canvas').getContext('2d').drawImage(accThumb(ch, b.dataset.acc), 0, 0);
    b.addEventListener('click', () => {
      const a = ACCS.find(x => x.id === b.dataset.acc); game.audio.ui();
      if (accOk(a)) { accPreview = null; (Settings.accBy || (Settings.accBy = {}))[ch] = a.id; Settings.acc = a.id; Settings.save(); renderWardrobe(); }
      else accPreview = accPreview === a.id ? null : a.id;
      if (ficheKey) renderFiche(); else renderAccPicker();
    });
  }
}
function refreshLevelUI() {
  const L = levelInfo(Settings.xp); const el = $('hub-level'); if (!el) return;
  el.innerHTML = `<b>Niv. ${L.lv}</b><i><s style="width:${L.lv >= LEVEL_MAX ? 100 : Math.round(100 * L.into / L.need)}%"></s></i>`;
  el.title = L.lv >= LEVEL_MAX ? 'Niveau maximum' : `${fmt(L.into)} / ${fmt(L.need)} XP avant le niveau ${L.lv + 1}`;
  const nx = REWARDS.find(r => r.lv > L.lv), rl = $('pv-reward'); if (rl) rl.textContent = nx ? `Prochaine récompense au niveau ${nx.lv} : ${nx.name}` : 'Toutes les récompenses sont débloquées';
}
// ---------- effets de fin de secteur (à débloquer), dans la DA du jeu
const FINISHERS = [
  { id: 'tampon', name: 'Tampon', desc: 'Un tampon rouge « NETTOYÉ » frappe l\'écran', need: 0 },
  { id: 'braises', name: 'Braises', desc: 'Des braises remontent du sol', need: 3 },
  { id: 'shibas', name: 'Pluie de shibas', desc: 'Des shibas tombent du ciel en aboyant', need: 6 },
  { id: 'fusees', name: 'Fusées de détresse', desc: 'Des fusées rouges éclairent le secteur', need: 9 },
  { id: 'noir', name: 'Film noir', desc: 'L\'image passe en noir et blanc', need: 12 },
  { id: 'gyro', name: 'Gyrophares', desc: 'Lumières bleues et rouges qui tournent', need: 15 }
];
const achCount = () => { const u = Ach.get(); return ACH.filter(a => u[a[0]]).length; };
const finisherOk = f => achCount() >= f.need;
function currentFinisher(ch = game.charKey) { const id = (Settings.finBy && Settings.finBy[ch]) || Settings.finisher, f = FINISHERS.find(x => x.id === id); return f && finisherOk(f) ? f : FINISHERS[0]; }
function drawFinisher(c, g, k, t) {
  const f = g.finFx; if (!f) return;
  const id = f.id, a = Math.min(1, k * 3), el = g.slowMax - g.slowT, D = DPR * HUDK;
  if (id === 'tampon') {
    const hit = Math.min(1, el * 6), sc = 1.8 - hit * 0.8;
    c.save(); c.translate(W / 2, H * 0.52); c.rotate(-0.12); c.scale(sc * D, sc * D); c.globalAlpha = hit * a * 0.92;
    c.strokeStyle = '#b0231c'; c.lineWidth = 7; c.strokeRect(-190, -52, 380, 104); c.lineWidth = 2.5; c.strokeRect(-178, -40, 356, 80);
    c.font = `64px ${FD}`; c.textAlign = 'center'; c.fillStyle = '#b0231c'; c.fillText('NETTOYÉ', 0, 22);
    c.globalCompositeOperation = 'destination-out'; const r = mulberry32(7); for (let i = 0; i < 160; i++) c.fillRect(-190 + r() * 380, -52 + r() * 104, 2 + r() * 4, 1 + r() * 3);
    c.restore(); c.globalAlpha = 1;
    if (el < 0.12) { c.fillStyle = `rgba(255,240,220,${0.25 * (1 - el / 0.12)})`; c.fillRect(0, 0, W, H); }
  } else if (id === 'braises' || id === 'shibas') {
    const n = id === 'shibas' ? 22 : 140;
    for (let i = 0; i < n; i++) { const x = (i * 211 + Math.sin(t + i) * 30 * DPR) % W, sp = 0.3 + (i % 7) * 0.07;
      if (id === 'shibas') { const y = ((t * sp * 700 + i * 83) % (H + 120)) - 60; c.save(); c.translate(x, y); c.scale(1.5 * DPR, 1.5 * DPR); c.rotate(Math.sin(t * 3 + i) * 0.4); c.globalAlpha = a; drawShibaSprite(c, 0, 0, 1, t + i); c.restore(); }
      else { const y = H - ((t * sp * 500 + i * 97) % (H + 40)); c.globalAlpha = a * (0.4 + (i % 3) * 0.2); c.fillStyle = i % 4 ? '#e2792f' : '#f0b25a'; c.fillRect(x, y, 2.5 * DPR, 2.5 * DPR); } }
    c.globalAlpha = 1; if (id === 'braises') { const gr = c.createLinearGradient(0, H, 0, H * 0.6); gr.addColorStop(0, `rgba(176,35,28,${0.3 * a})`); gr.addColorStop(1, 'rgba(176,35,28,0)'); c.fillStyle = gr; c.fillRect(0, H * 0.6, W, H * 0.4); }
  } else if (id === 'fusees') {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let bI = 0; bI < 3; bI++) { const ph = ((t * 0.6 + bI * 0.33) % 1), cx = W * (0.25 + bI * 0.25), cy = H * (0.75 - ph * 0.55), rr = (60 + ph * 120) * DPR;
      const gr = c.createRadialGradient(cx, cy, 0, cx, cy, rr * 2.4); gr.addColorStop(0, `rgba(255,90,60,${0.55 * a * (1 - ph * 0.5)})`); gr.addColorStop(1, 'rgba(255,40,20,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = `rgba(255,220,200,${a})`; c.beginPath(); c.arc(cx, cy, 3 * DPR, 0, TAU); c.fill(); }
    c.restore();
  } else if (id === 'noir') {
    c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = `rgba(0,0,0,${a})`; c.fillRect(0, 0, W, H); c.restore();
    c.fillStyle = `rgba(0,0,0,${0.12 * a})`; for (let i = 0; i < 6; i++) c.fillRect(((t * 300 + i * 433) % W), 0, 1.5 * DPR, H);
  } else if (id === 'gyro') {
    c.save(); c.globalCompositeOperation = 'lighter'; const an = t * 5;
    for (const [col, off] of [['60,90,255', 0], ['255,40,40', Math.PI]]) { const x = W / 2 + Math.cos(an + off) * W * 0.4, y = H * 0.5 + Math.sin(an + off) * H * 0.1, gr = c.createRadialGradient(x, y, 0, x, y, W * 0.45); gr.addColorStop(0, `rgba(${col},${0.32 * a})`); gr.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gr; c.fillRect(0, 0, W, H); }
    c.restore();
  }
}
function drawIceTruck(c, x, y, t) {
  // même rendu que les voitures du jeu : boîte extrudée vue de 3/4, couleurs passées
  const w = 96, h = 42, z = 38, ox = x - w / 2, oy = y - h / 2, b = Math.sin(t * 9) * 0.6, body = '#7a5f66', side = '#4a3a3f', roof = '#8d7178';
  c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(ox - 3, oy + 4, w + 6, h);
  c.fillStyle = side; c.fillRect(ox, oy + h - z + b, w, z);
  c.fillStyle = 'rgba(200,160,170,.35)'; c.fillRect(ox, oy + h - z * 0.55 + b, w, 4);
  c.fillStyle = '#0d0d0e'; c.fillRect(ox + 12, oy + h - 8, 18, 8); c.fillRect(ox + w - 30, oy + h - 8, 18, 8);
  c.fillStyle = '#1a1416'; c.fillRect(ox + 34, oy + h - z + 8 + b, 30, 16); c.fillStyle = 'rgba(255,190,150,.5)'; c.fillRect(ox + 36, oy + h - z + 10 + b, 26, 3);
  c.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 9; i++) c.fillRect(ox + ((i * 31) % w), oy + h - z + 4 + ((i * 17) % (z - 8)) + b, 5, 3);
  c.fillStyle = '#5a2a1c'; c.fillRect(ox + 4, oy + h - 12 + b, 10, 3); c.fillRect(ox + w - 22, oy + h - z + 4 + b, 8, 3);
  c.fillStyle = roof; c.fillRect(ox, oy - z + b, w, h);
  c.fillStyle = '#141a20'; c.fillRect(ox + w - 26, oy - z + 5 + b, 20, h - 10); c.fillStyle = shade(roof, 0.12); c.fillRect(ox + 6, oy - z + 6 + b, w - 38, h - 12);
  // cornet géant sur le toit, fêlé et éteint par endroits
  const cx = ox + 34, cy = oy - z + 4 + b, flick = Math.sin(t * 17) > -0.6 ? 1 : 0.35;
  c.fillStyle = '#6a4a2a'; c.beginPath(); c.moveTo(cx - 9, cy); c.lineTo(cx, cy + 22); c.lineTo(cx + 9, cy); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - 6, cy + 4); c.lineTo(cx + 4, cy + 12); c.moveTo(cx + 6, cy + 4); c.lineTo(cx - 4, cy + 12); c.stroke();
  c.fillStyle = `rgba(214,140,160,${0.55 + 0.45 * flick})`; c.beginPath(); c.arc(cx, cy - 4, 10, 0, TAU); c.fill();
  c.fillStyle = 'rgba(90,20,24,.8)'; c.beginPath(); c.arc(cx + 4, cy - 2, 3, 0, TAU); c.fill();
  // haut-parleur et phares
  c.fillStyle = '#2a2a2e'; c.fillRect(ox + 60, oy - z - 4 + b, 10, 8); c.fillStyle = '#1a1a1e'; c.beginPath(); c.arc(ox + 70, oy - z + b, 4, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,230,170,.9)'; c.fillRect(ox + w - 3, oy - z + 6 + b, 3, 6); c.fillRect(ox + w - 3, oy - z + h - 12 + b, 3, 6);
  // conducteur zombie
  c.fillStyle = '#5f7a50'; c.beginPath(); c.arc(ox + w - 16, oy - z + h / 2 + b, 6, 0, TAU); c.fill(); c.fillStyle = '#c0201a'; c.fillRect(ox + w - 14, oy - z + h / 2 - 2 + b, 2, 2);
  if (Math.floor(t * 3) % 2) { c.fillStyle = 'rgba(240,178,90,.85)'; c.font = '14px "Special Elite", monospace'; c.textAlign = 'center'; c.fillText('♪', ox + 72 + Math.sin(t * 4) * 5, oy - z - 12); }
}
function itemArt(c, kind, x, y, size) {
  if (kind === 'shiba') return itemIcon(c, 'shiba', x, y, size, '#d9873a');
  c.save(); c.translate(x, y); const k = size / 40; c.scale(k, k); const ink = '#120c09';
  c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2;
  const F = (fill, path) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.strokeStyle = ink; c.stroke(); };
  const hi = (x0, y0, x1, y1) => { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.lineWidth = 2; };
  switch (kind) {
    case 'grenade':
      F('#4f6a34', () => c.ellipse(-2, 5, 12, 14, 0, 0, TAU));
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.6; c.beginPath(); for (const yy of [-1, 6, 13]) { c.moveTo(-13, yy); c.lineTo(9, yy); } for (const xx of [-8, -2, 4]) { c.moveTo(xx, -8); c.lineTo(xx, 18); } c.stroke(); c.lineWidth = 2;
      hi(-9, -3, -7, -6);
      F('#8a939c', () => c.rect(-7, -13, 10, 6));
      F('#b0b8c0', () => { c.moveTo(2, -13); c.lineTo(15, -7); c.lineTo(14, -3); c.lineTo(1, -8); c.closePath(); });
      c.strokeStyle = '#e0a020'; c.lineWidth = 2.6; c.beginPath(); c.arc(-11, -13, 4.5, 0, TAU); c.stroke(); break;
    case 'mine':
      F('#4a525c', () => c.ellipse(0, 9, 18, 7.5, 0, 0, TAU));
      F('#6f7a86', () => { c.ellipse(0, 3, 12, 6, 0, 0, TAU); });
      F('#3a3f46', () => c.ellipse(0, 1, 7, 3.5, 0, 0, TAU));
      c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); for (const px of [-5, 0, 5]) { c.moveTo(px, 0); c.lineTo(px * 1.4, -8); } c.stroke();
      c.fillStyle = '#ffd23a'; for (const px of [-13, -5, 3, 11]) { c.fillRect(px, 11, 3.5, 2.5); }
      F('#e0321f', () => c.arc(0, -10, 3, 0, TAU)); c.fillStyle = 'rgba(255,200,180,.9)'; c.beginPath(); c.arc(-1, -11, 1, 0, TAU); c.fill(); hi(-8, 4, 2, 2); break;
    case 'decoy':
      c.rotate(0.35);
      F('#c0392b', () => c.rect(-4.5, -6, 9, 24)); c.fillStyle = '#f4ead2'; c.fillRect(-4.5, 1, 9, 3); c.fillRect(-4.5, 8, 9, 3);
      F('#3a3f46', () => c.rect(-6, 16, 12, 5));
      F('#ff7a2a', () => { c.moveTo(0, -22); c.quadraticCurveTo(9, -12, 4, -6); c.lineTo(-4, -6); c.quadraticCurveTo(-9, -12, 0, -22); });
      c.fillStyle = '#ffe07a'; c.beginPath(); c.moveTo(0, -16); c.quadraticCurveTo(4, -11, 2, -7); c.lineTo(-2, -7); c.quadraticCurveTo(-4, -11, 0, -16); c.fill();
      c.fillStyle = 'rgba(255,220,120,.8)'; for (const [sx, sy] of [[7, -20], [-8, -17], [9, -12]]) c.fillRect(sx, sy, 2, 2); break;
    case 'battery':
      F('#2c3138', () => c.rect(-9, -13, 18, 28));
      F('#e0a020', () => c.rect(-9, -13, 18, 10));
      F('#b0b8c0', () => c.rect(-4, -17, 8, 4));
      c.fillStyle = '#7fd18b'; for (let i = 0; i < 3; i++) c.fillRect(-6, 0 + i * 5, 12, 3.2);
      c.fillStyle = INK; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.fillText('+', 0, -5); hi(-6, -10, -6, 12); break;
    case 'med':
      F('#f4f1ea', () => c.rect(-15, -10, 30, 24));
      F('#c9ccd6', () => c.rect(-15, -10, 30, 5));
      F('#8a939c', () => { c.moveTo(-6, -10); c.lineTo(-6, -15); c.lineTo(6, -15); c.lineTo(6, -10); c.lineTo(3, -10); c.lineTo(3, -12.5); c.lineTo(-3, -12.5); c.lineTo(-3, -10); c.closePath(); });
      F('#d0141e', () => { c.rect(-3, -2, 6, 13); c.rect(-7.5, 1.5, 15, 6); }); hi(-12, -2, -12, 11); break;
    case 'armor':
      F('#3d4a5a', () => { c.moveTo(-15, -12); c.lineTo(-6, -16); c.quadraticCurveTo(0, -8, 6, -16); c.lineTo(15, -12); c.lineTo(16, 16); c.lineTo(-16, 16); c.closePath(); });
      F('#2a333f', () => { c.rect(-12, 1, 9, 7); c.rect(3, 1, 9, 7); });
      c.fillStyle = '#e0a020'; c.fillRect(-1.5, -8, 3, 24);
      c.fillStyle = '#9fb3c8'; c.font = 'bold 6px sans-serif'; c.textAlign = 'center'; c.fillText('KDD', 0, 14); hi(-12, -9, -12, 12); break;
    default: c.restore(); return itemIcon(c, kind, x, y, size, '#e8e2d4');
  }
  c.restore();
}
function itemIcon(c, kind, x, y, size, col, accent = true) {
  c.save(); c.translate(x, y); const u = size / 40; c.scale(u, u); c.fillStyle = col; c.strokeStyle = col; c.lineJoin = 'round'; c.lineCap = 'round';
  const dark = 'rgba(0,0,0,.35)';
  switch (kind) {
    case 'grenade':
      c.beginPath(); c.ellipse(-2, 5, 11, 13, 0, 0, TAU); c.fill();
      c.fillStyle = dark; c.fillRect(-13, 1, 22, 2); c.fillRect(-13, 8, 22, 2); c.fillRect(-3, -8, 2, 26); c.fillStyle = col;
      c.fillRect(-7, -13, 10, 6);
      c.beginPath(); c.moveTo(2, -12); c.lineTo(14, -6); c.lineTo(13, -3); c.lineTo(1, -8); c.closePath(); c.fill();
      c.lineWidth = 2.5; c.beginPath(); c.arc(-11, -13, 4.5, 0, TAU); c.stroke(); break;
    case 'mine':
      c.beginPath(); c.ellipse(0, 9, 17, 7, 0, 0, TAU); c.fill();
      c.fillStyle = dark; c.fillRect(-17, 8, 34, 2); c.fillStyle = col;
      c.beginPath(); c.ellipse(0, 1, 9, 5, 0, 0, TAU); c.fill(); c.fillRect(-9, 1, 18, 7);
      c.lineWidth = 2.5; c.beginPath(); for (const px of [-6, 0, 6]) { c.moveTo(px, -1); c.lineTo(px * 1.3, -9); } c.stroke();
      c.fillStyle = dark; for (const px of [-13, -5, 3, 11]) c.fillRect(px, 11, 3, 3);
      c.fillStyle = accent ? '#e0321f' : col; c.beginPath(); c.arc(0, -10, 2.6, 0, TAU); c.fill(); break;
    case 'armor':
      c.beginPath(); c.moveTo(-14, -12); c.lineTo(-6, -15); c.quadraticCurveTo(0, -8, 6, -15); c.lineTo(14, -12); c.lineTo(15, 15); c.lineTo(-15, 15); c.closePath(); c.fill();
      c.fillStyle = dark; c.fillRect(-1, -8, 2, 23); c.fillRect(-11, 2, 8, 6); c.fillRect(3, 2, 8, 6); break;
    case 'decoy':
      c.save(); c.rotate(0.35);
      c.fillRect(-4, -6, 8, 24); c.fillStyle = dark; c.fillRect(-4, 2, 8, 2); c.fillRect(-4, 8, 8, 2); c.fillStyle = col; c.fillRect(-5.5, 16, 11, 4);
      c.fillStyle = accent ? '#ff8a3a' : col; c.beginPath(); c.moveTo(0, -20); c.quadraticCurveTo(7, -12, 3, -7); c.lineTo(-3, -7); c.quadraticCurveTo(-7, -12, 0, -20); c.fill();
      if (accent) { c.fillStyle = '#ffd27a'; c.beginPath(); c.moveTo(0, -15); c.quadraticCurveTo(3, -11, 1.5, -8); c.lineTo(-1.5, -8); c.quadraticCurveTo(-3, -11, 0, -15); c.fill(); }
      c.restore(); break;
    case 'battery':
      c.fillRect(-7, -12, 14, 26); c.fillRect(-3, -15, 6, 3);
      c.fillStyle = accent ? '#c9963a' : dark; c.fillRect(-7, -12, 14, 8);
      c.fillStyle = dark; c.fillRect(-1, 2, 2, 8); c.fillRect(-4, 5, 8, 2); break;
    case 'shiba': c.restore(); drawShibaSprite(c, x + size * 0.02, y + size * 0.3, size / 30, 0); return;
    case 'med':
      c.fillRect(-15, -9, 30, 22); c.fillRect(-6, -13, 12, 4);
      c.fillStyle = accent ? '#b0231c' : dark; c.fillRect(-2.5, -5, 5, 14); c.fillRect(-7, -0.5, 14, 5); break;
  }
  c.restore();
}
const _iconCache = {};
function iconURL(kind, weapon) {
  const key = (weapon ? 'w:' : 'i:') + kind; if (_iconCache[key]) return _iconCache[key];
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 128; const g = cv.getContext('2d');
  if (weapon) weaponIcon(g, kind, 96, 64, 168, 'art'); else itemArt(g, kind, 96, 64, 112);
  return (_iconCache[key] = cv.toDataURL());
}
function drawShibaSprite(c, x, y, sc, t) {
  c.save(); c.translate(x, y); c.scale(sc, sc);
  c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(0, 1, 11, 4, 0, 0, TAU); c.fill();
  const wag = Math.sin(t * 8) * 0.4;
  c.fillStyle = '#d9873a'; c.beginPath(); c.ellipse(0, -7, 9, 7, 0, 0, TAU); c.fill();
  c.save(); c.translate(-8, -11); c.rotate(wag); c.beginPath(); c.arc(0, 0, 4, 0, TAU); c.fill(); c.fillStyle = '#f4e6cc'; c.beginPath(); c.arc(0, 0, 1.8, 0, TAU); c.fill(); c.restore();
  c.fillStyle = '#f4e6cc'; c.beginPath(); c.ellipse(4, -6, 4, 5, 0, 0, TAU); c.fill();
  c.fillStyle = '#d9873a'; c.beginPath(); c.arc(6, -15, 6, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(2, -18); c.lineTo(3, -25); c.lineTo(6, -20); c.closePath(); c.fill(); c.beginPath(); c.moveTo(8, -20); c.lineTo(11, -25); c.lineTo(11, -17); c.closePath(); c.fill();
  c.fillStyle = '#f4e6cc'; c.beginPath(); c.ellipse(8, -12, 3.5, 2.5, 0, 0, TAU); c.fill();
  c.fillStyle = '#1a1210'; c.fillRect(4, -16, 1.6, 1.6); c.fillRect(8, -16, 1.6, 1.6); c.fillRect(10, -13, 1.8, 1.4);
  c.restore();
}
function lockIcon(c, x, y, col) { c.save(); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(x, y - 4, 4, Math.PI, 0); c.stroke(); c.fillRect(x - 5.5, y - 4, 11, 8); c.restore(); }
const MAP_NODES = [{ x: 150, y: 430, name: 'Avenue de la Gare' }, { x: 360, y: 250, name: 'Boulevard des Tanneurs' }, { x: 575, y: 420, name: 'Parking Saint-Roch' }, { x: 790, y: 270, name: 'Place de la Mairie' }, { x: 920, y: 110, name: 'Le Paradis des Shibas' }];
const MAP_INFO = [
  { obj: 'Retrouver la clé du rideau de fer de la pharmacie', threat: 'Marcheurs, coureurs, kamikazes · alarmes de voitures' },
  { obj: 'Défendre la radio le temps d\'envoyer le signal', threat: 'Cracheurs, brutes, CRS-zombies · horde pendant la défense' },
  { obj: 'Porter le bidon d\'essence jusqu\'au groupe électrogène', threat: 'Brutes, cracheurs, CRS-zombies · la horde la plus dense' },
  { obj: 'Abattre le boss qui garde la Place de la Mairie', threat: 'Le boss et sa garde rapprochée' }
];
const MAP_ZOMBIES = (() => { const r = mulberry32(77), a = []; for (const [cx, cy, n] of [[240, 470, 3], [430, 300, 5], [300, 180, 3], [640, 470, 6], [520, 360, 3], [850, 320, 7], [700, 220, 4], [960, 250, 3]]) for (let i = 0; i < n; i++) a.push({ x: cx + (r() - 0.5) * 90, y: cy + (r() - 0.5) * 40, ph: r() * TAU, sp: 0.3 + r() * 0.5, amp: 6 + r() * 14, s: 0.8 + r() * 0.5 }); return a.sort((p, q) => p.y - q.y); })();
const MAP_FIRES = [[95, 330, 1.2], [236, 344, 0.8], [292, 150, 0.9], [452, 160, 0.7], [632, 342, 1], [708, 186, 0.9], [868, 190, 1.3], [498, 452, 0.6]];
let mapStatic = null, mapStaticKey = '';
function buildMapStatic(open) {
  const cv = document.createElement('canvas'); cv.width = 1000; cv.height = 560; const g = cv.getContext('2d'), r = mulberry32(9);
  const bg = g.createLinearGradient(0, 0, 0, 560); bg.addColorStop(0, '#0c0b10'); bg.addColorStop(0.55, '#15110f'); bg.addColorStop(1, '#0d0c0c'); g.fillStyle = bg; g.fillRect(0, 0, 1000, 560);
  // pâtés de maisons vus du dessus, très sombres
  for (let i = 0; i < 46; i++) { const x = r() * 1000, y = 60 + r() * 420, w = 30 + r() * 60, h = 20 + r() * 40; g.fillStyle = `rgba(${24 + r() * 8},${21 + r() * 6},${20 + r() * 6},.55)`; g.fillRect(x, y, w, h); }
  // grain de cendre
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.35)' : 'rgba(120,100,80,.06)'; g.fillRect(r() * 1000, r() * 560, 1 + r() * 2, 1 + r() * 2); }
  // lune rouge
  const mg = g.createRadialGradient(90, 70, 10, 90, 70, 120); mg.addColorStop(0, 'rgba(200,60,40,.35)'); mg.addColorStop(1, 'rgba(200,60,40,0)'); g.fillStyle = mg; g.fillRect(0, 0, 260, 220);
  g.fillStyle = '#b8432c'; g.beginPath(); g.arc(90, 70, 30, 0, TAU); g.fill(); g.fillStyle = 'rgba(80,20,15,.5)'; for (const [x, y, rr] of [[80, 62, 6], [100, 80, 4], [96, 58, 3]]) { g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); }
  // routes : l'itinéraire suit une avenue défoncée
  const road = (i, j) => { const A = MAP_NODES[i], B = MAP_NODES[j]; g.beginPath(); g.moveTo(A.x, A.y); g.quadraticCurveTo((A.x + B.x) / 2, Math.min(A.y, B.y) - 50, B.x, B.y); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < 4; i++) { road(i, i + 1); g.strokeStyle = '#060606'; g.lineWidth = 34; g.stroke(); road(i, i + 1); g.strokeStyle = '#211d1b'; g.lineWidth = 28; g.stroke(); road(i, i + 1); g.setLineDash([10, 14]); g.strokeStyle = 'rgba(160,140,90,.18)'; g.lineWidth = 2; g.stroke(); g.setLineDash([]); }
  // fissures et sang
  g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 1.5; for (let i = 0; i < 40; i++) { let x = r() * 1000, y = 80 + r() * 420; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 30; y += (r() - 0.5) * 20; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 18; i++) { const x = 60 + r() * 900, y = 100 + r() * 380, s = 3 + r() * 8; g.fillStyle = `rgba(${60 + r() * 30},6,5,${0.45 + r() * 0.25})`; g.beginPath(); g.ellipse(x, y, s, s * 0.6, r() * 3, 0, TAU); g.fill(); for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + (r() - 0.5) * s * 3, y + (r() - 0.5) * s * 2, 1 + r() * 2, 0, TAU); g.fill(); } }
  // canal noir
  g.fillStyle = '#07090c'; g.beginPath(); g.moveTo(0, 505); g.bezierCurveTo(250, 470, 500, 545, 1000, 490); g.lineTo(1000, 560); g.lineTo(0, 560); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(90,80,70,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 505); g.bezierCurveTo(250, 470, 500, 545, 1000, 490); g.stroke();
  const ink = '#050505', wall = '#2a2523', edge = '#5a4c42';
  const box = (x, y, w, h) => { g.fillStyle = wall; g.fillRect(x, y, w, h); g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(x, y, w, h); g.strokeStyle = edge; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 2, y + 2); g.lineTo(x + w - 2, y + 2); g.stroke(); };
  const win = (x, y, lit) => { g.fillStyle = lit ? 'rgba(232,168,70,.85)' : '#0a0909'; g.fillRect(x, y, 7, 9); if (!lit && r() < 0.5) { g.strokeStyle = '#2a2522'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 7, y + 9); g.stroke(); } };
  const planks = (x, y, w, h) => { g.strokeStyle = '#4a3624'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke(); };
  // 1 · la gare et son wagon renversé
  box(66, 318, 168, 64); g.fillStyle = wall; g.beginPath(); g.moveTo(130, 318); g.lineTo(130, 270); g.lineTo(170, 270); g.lineTo(170, 318); g.fill(); g.strokeStyle = ink; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#d9cfb3'; g.beginPath(); g.arc(150, 290, 11, 0, TAU); g.fill(); g.strokeStyle = ink; g.lineWidth = 2; g.stroke(); g.beginPath(); g.moveTo(150, 290); g.lineTo(150, 282); g.moveTo(150, 290); g.lineTo(156, 293); g.stroke();
  for (let i = 0; i < 4; i++) { g.fillStyle = '#0a0909'; g.beginPath(); g.arc(91 + i * 39, 382, 12, Math.PI, 0); g.fill(); } planks(80, 334, 22, 18); for (let i = 0; i < 6; i++) win(112 + i * 18, 336, r() < 0.3);
  g.save(); g.translate(36, 470); g.rotate(-0.25); g.fillStyle = '#3a1f1a'; g.fillRect(0, -18, 80, 26); g.strokeStyle = ink; g.lineWidth = 3; g.strokeRect(0, -18, 80, 26); for (let i = 0; i < 4; i++) win(8 + i * 18, -12, false); g.restore();
  // 2 · boulevard : façades éventrées et antenne radio
  for (let i = 0; i < 5; i++) { const x = 258 + i * 44, h = 50 + (i % 2) * 18 + (i === 3 ? -14 : 0), y = 206 - h; box(x, y, 38, h); if (i === 3) { g.fillStyle = '#15110f'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y + 12); g.lineTo(x + 26, y + 2); g.lineTo(x + 38, y + 14); g.lineTo(x + 38, y); g.fill(); } for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) win(x + 7 + j * 17, y + 10 + k * 16, r() < 0.18); }
  g.strokeStyle = '#5a5550'; g.lineWidth = 2; g.beginPath(); g.moveTo(380, 120); g.lineTo(370, 160); g.moveTo(380, 120); g.lineTo(390, 160); g.moveTo(374, 140); g.lineTo(386, 140); g.moveTo(380, 120); g.lineTo(380, 100); g.stroke();
  // 3 · parking : dalle de béton, voitures retournées
  box(498, 318, 156, 66); g.strokeStyle = 'rgba(200,190,150,.15)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(538 + i * 24, 326); g.lineTo(538 + i * 24, 346); g.stroke(); }
  g.font = 'bold 26px "Saira Stencil One", Impact, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#2c4d7a'; g.fillText('P', 518, 352);
  const car = (x, y, a, col) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.fillRect(-18, -9, 36, 18); g.strokeStyle = ink; g.lineWidth = 2.5; g.strokeRect(-18, -9, 36, 18); g.fillStyle = '#0b0b0d'; g.fillRect(-8, -7, 14, 14); g.restore(); };
  car(530, 370, 0.4, '#3e2a24'); car(610, 366, -0.2, '#26323a'); car(470, 410, 1.2, '#2e2a1e'); car(300, 280, 0.1, '#33201c'); car(760, 330, -0.6, '#242a30');
  g.fillStyle = '#3a3a2a'; g.fillRect(640, 392, 22, 16); g.strokeStyle = ink; g.strokeRect(640, 392, 22, 16);
  // 4 · mairie : colonnes, fronton fendu, drapeau en lambeaux
  box(716, 168, 148, 66); g.fillStyle = wall; g.beginPath(); g.moveTo(708, 168); g.lineTo(790, 128); g.lineTo(872, 168); g.closePath(); g.fill(); g.strokeStyle = ink; g.lineWidth = 3; g.stroke();
  g.strokeStyle = '#0a0909'; g.lineWidth = 2; g.beginPath(); g.moveTo(790, 132); g.lineTo(784, 148); g.lineTo(794, 156); g.lineTo(788, 168); g.stroke();
  g.fillStyle = '#2a2522'; for (let i = 0; i < 5; i++) g.fillRect(726 + i * 30, 174, 8, 58);
  g.strokeStyle = '#4a4440'; g.lineWidth = 2; g.beginPath(); g.moveTo(790, 128); g.lineTo(790, 100); g.stroke();
  // sacs de sable et barricades
  for (const [x, y] of [[180, 410], [395, 230], [600, 405], [820, 255]]) { g.fillStyle = '#3a3226'; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + i * 10, y, 6, 4, 0, 0, TAU); g.fill(); g.strokeStyle = ink; g.lineWidth = 1; g.stroke(); } }
  // 5 · le paradis, perché dans les nuages
  g.fillStyle = open ? 'rgba(255,170,200,.18)' : 'rgba(120,110,120,.12)'; for (const [x, y, rr] of [[920, 96, 40], [878, 110, 28], [962, 112, 28], [920, 124, 32]]) { g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); }
  return cv;
}
function mapZombie(g, x, y, s, t, ph) {
  const sw = Math.sin(t * 2 + ph) * 0.18;
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(sw * 0.4);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(0, 1, 7, 2.5, 0, 0, TAU); g.fill();
  g.fillStyle = '#080808'; g.beginPath(); g.moveTo(-4, 0); g.lineTo(-3, -12); g.lineTo(3, -13); g.lineTo(4, 0); g.closePath(); g.fill();
  g.beginPath(); g.arc(1.5, -16, 3.6, 0, TAU); g.fill();
  g.strokeStyle = '#080808'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(1, -11); g.lineTo(9, -10 + Math.sin(t * 3 + ph) * 2); g.moveTo(0, -9); g.lineTo(8, -7 + Math.cos(t * 3 + ph) * 2); g.stroke();
  g.fillStyle = 'rgba(255,60,40,.9)'; g.fillRect(3, -17, 1.4, 1.2); g.restore();
}
function drawMapCanvas(g, game, t, portrait) {
  const open = game.shibaFound.size >= SHIBAS_TOTAL, key = open ? 'o' : 'c';
  if (!mapStatic || mapStaticKey !== key) { mapStatic = buildMapStatic(open); mapStaticKey = key; }
  g.setLineDash([]); g.lineJoin = 'round'; g.lineCap = 'round'; g.textAlign = 'center';
  g.drawImage(mapStatic, 0, 0);
  const cur = game.mapCur, sel = game.mapSel, hov = game.mapHover;
  // fenêtres qui clignotent
  for (const [x, y, ph] of [[148, 336, 1], [276, 120, 2], [320, 150, 3], [790, 200, 4], [560, 334, 5]]) { const f = Math.sin(t * 7 + ph * 9) > 0.6 ? 0.9 : 0.25; g.fillStyle = `rgba(232,168,70,${f})`; g.fillRect(x, y, 7, 9); }
  // feux : halo, flammes et braises
  g.globalCompositeOperation = 'lighter';
  for (const [x, y, s] of MAP_FIRES) {
    const fl = 0.75 + Math.sin(t * 9 + x) * 0.12 + Math.sin(t * 23 + y) * 0.08, R = 60 * s * fl;
    const h = g.createRadialGradient(x, y, 2, x, y, R); h.addColorStop(0, 'rgba(255,140,40,.55)'); h.addColorStop(0.4, 'rgba(200,60,20,.22)'); h.addColorStop(1, 'rgba(120,20,10,0)'); g.fillStyle = h; g.fillRect(x - R, y - R, R * 2, R * 2);
    for (let i = 0; i < 4; i++) { const fx = x + Math.sin(t * 6 + i * 2 + x) * 5 * s, fh = (14 + i * 3) * s * (0.8 + Math.sin(t * 13 + i * 3) * 0.2); g.fillStyle = i < 2 ? 'rgba(255,120,30,.75)' : 'rgba(255,210,120,.7)'; g.beginPath(); g.moveTo(fx - 6 * s, y); g.quadraticCurveTo(fx - 4 * s, y - fh * 0.6, fx, y - fh); g.quadraticCurveTo(fx + 4 * s, y - fh * 0.6, fx + 6 * s, y); g.fill(); }
    for (let i = 0; i < 5; i++) { const p = (t * 0.6 + i / 5 + x * 0.01) % 1; g.fillStyle = `rgba(255,170,80,${1 - p})`; g.fillRect(x + Math.sin(p * 9 + i) * 14 * s, y - p * 70 * s, 2, 2); }
  }
  // gyrophares devant la mairie
  const blink = Math.floor(t * 3) % 2; for (const [x, y, c] of [[742, 252, blink ? 'rgba(220,30,30,' : 'rgba(40,80,255,'], [838, 250, blink ? 'rgba(40,80,255,' : 'rgba(220,30,30,']]) { const h = g.createRadialGradient(x, y, 1, x, y, 40); h.addColorStop(0, c + '.7)'); h.addColorStop(1, c + '0)'); g.fillStyle = h; g.fillRect(x - 40, y - 40, 80, 80); }
  // voyant de l'antenne radio
  if (Math.sin(t * 4) > 0) { const h = g.createRadialGradient(380, 100, 1, 380, 100, 14); h.addColorStop(0, 'rgba(255,40,30,.9)'); h.addColorStop(1, 'rgba(255,40,30,0)'); g.fillStyle = h; g.fillRect(366, 86, 28, 28); }
  g.globalCompositeOperation = 'source-over';
  // drapeau qui claque
  g.fillStyle = '#5a1a14'; g.beginPath(); g.moveTo(790, 100); for (let i = 0; i <= 6; i++) g.lineTo(790 + i * 4, 102 + Math.sin(t * 6 - i) * 2); for (let i = 6; i >= 0; i--) g.lineTo(790 + i * 4, 112 + Math.sin(t * 6 - i) * 2 - (i > 4 ? 3 : 0)); g.fill();
  // fumée qui monte
  for (const [x, y, s] of MAP_FIRES) for (let i = 0; i < 3; i++) { const p = (t * 0.08 + i / 3 + x * 0.003) % 1, sx = x + p * 50 + Math.sin(t + i) * 6, sy = y - 20 - p * 120 * s, rr = (10 + p * 34) * s; g.fillStyle = `rgba(20,18,18,${0.45 * (1 - p)})`; g.beginPath(); g.arc(sx, sy, rr, 0, TAU); g.fill(); }
  // zombies qui titubent (pas sur les missions déjà nettoyées)
  for (const z of MAP_ZOMBIES) { const zone = z.x < 255 ? 0 : z.x < 470 ? 1 : z.x < 690 ? 2 : 3; if (zone < cur) continue; mapZombie(g, z.x + Math.sin(t * z.sp + z.ph) * z.amp, z.y, z.s * 1.5, t, z.ph); }
  // shibas fantômes au paradis quand il est ouvert
  if (open) for (let i = 0; i < 3; i++) drawShibaSprite(g, 890 + i * 28, 96 + Math.sin(t * 3 + i) * 3, 0.45, t);
  // chemin de sang : pointillés qui avancent
  const path = (i, j, on) => { const A = MAP_NODES[i], B = MAP_NODES[j]; g.beginPath(); g.moveTo(A.x, A.y); g.quadraticCurveTo((A.x + B.x) / 2, Math.min(A.y, B.y) - 50, B.x, B.y); g.setLineDash(on ? [14, 12] : [3, 11]); g.lineDashOffset = on ? -t * 14 : 0; g.lineWidth = on ? 6 : 4; g.strokeStyle = on ? (i < cur ? '#5e1410' : '#b3221a') : 'rgba(140,120,130,.35)'; g.shadowColor = on && i >= cur ? 'rgba(255,40,20,.6)' : 'transparent'; g.shadowBlur = 10; g.stroke(); g.shadowBlur = 0; g.setLineDash([]); g.lineDashOffset = 0; };
  for (let i = 0; i < 3; i++) path(i, i + 1, true); path(3, 4, open);
  // pluie
  g.strokeStyle = 'rgba(160,170,190,.18)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 90; i++) { const x = (i * 97 + t * 60) % 1040 - 20, y = (i * 53 + t * 520) % 600 - 20; g.moveTo(x, y); g.lineTo(x - 4, y + 12); } g.stroke();
  // brouillard rasant
  for (let i = 0; i < 4; i++) { const x = ((t * (8 + i * 3) + i * 300) % 1400) - 200, y = 150 + i * 100; const f = g.createRadialGradient(x, y, 10, x, y, 220); f.addColorStop(0, 'rgba(70,60,70,.14)'); f.addColorStop(1, 'rgba(70,60,70,0)'); g.fillStyle = f; g.fillRect(x - 220, y - 220, 440, 440); }
  // obscurité, sauf autour de la lampe du joueur
  const pn = MAP_NODES[Math.min(cur, 3)];
  const dk = g.createRadialGradient(pn.x, pn.y - 30, 40, pn.x, pn.y - 30, 520); dk.addColorStop(0, 'rgba(0,0,0,0)'); dk.addColorStop(0.5, 'rgba(0,0,0,.12)'); dk.addColorStop(1, 'rgba(0,0,0,.42)'); g.fillStyle = dk; g.fillRect(0, 0, 1000, 560);
  g.globalCompositeOperation = 'lighter'; const lamp = g.createRadialGradient(pn.x, pn.y - 30, 5, pn.x, pn.y - 30, 130 + Math.sin(t * 2) * 6); lamp.addColorStop(0, 'rgba(255,220,160,.22)'); lamp.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = lamp; g.fillRect(pn.x - 140, pn.y - 170, 280, 280); g.globalCompositeOperation = 'source-over';
  // étapes : médaillons de métal
  MAP_NODES.forEach((n, i) => {
    const done = i < cur, locked = i === 4 ? !open : i > cur, focus = i === sel || i === hov;
    if (i === cur || focus) { g.strokeStyle = i === cur ? `rgba(255,90,40,${0.55 + Math.sin(t * 4) * 0.3})` : 'rgba(230,220,200,.5)'; g.lineWidth = 3; g.beginPath(); g.arc(n.x, n.y, 34 + Math.sin(t * 4) * 3, 0, TAU); g.stroke(); }
    const sc = focus ? 1.12 : 1;
    const mg = g.createLinearGradient(n.x, n.y - 26, n.x, n.y + 26); mg.addColorStop(0, done ? '#4a4038' : locked ? '#2c2a2c' : '#8a2a1a'); mg.addColorStop(1, done ? '#221c18' : locked ? '#121112' : '#3a0e08');
    g.fillStyle = mg; g.strokeStyle = '#000'; g.lineWidth = 4; g.beginPath(); g.arc(n.x, n.y, 26 * sc, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = done ? '#7a6a58' : locked ? '#4a464a' : '#d0603a'; g.lineWidth = 2; g.beginPath(); g.arc(n.x, n.y, 21 * sc, 0, TAU); g.stroke();
    for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + 0.78; g.fillStyle = '#6a6058'; g.beginPath(); g.arc(n.x + Math.cos(a) * 23.5 * sc, n.y + Math.sin(a) * 23.5 * sc, 1.6, 0, TAU); g.fill(); }
    g.fillStyle = '#e8dfc8'; g.font = `${Math.round(24 * sc)}px "Saira Stencil One", Impact, sans-serif`;
    if (done) { g.strokeStyle = '#b3221a'; g.lineWidth = 5; g.beginPath(); g.moveTo(n.x - 10, n.y - 10); g.lineTo(n.x + 10, n.y + 10); g.moveTo(n.x + 10, n.y - 10); g.lineTo(n.x - 10, n.y + 10); g.stroke(); }
    else if (i === 4 && !open) { g.save(); g.translate(n.x, n.y + 2); g.scale(2, 2); lockIcon(g, 0, 0, '#8a8488'); g.restore(); g.strokeStyle = '#4a464a'; g.lineWidth = 3; g.setLineDash([5, 3]); g.beginPath(); g.moveTo(n.x - 40, n.y - 20); g.lineTo(n.x + 40, n.y + 20); g.moveTo(n.x + 40, n.y - 20); g.lineTo(n.x - 40, n.y + 20); g.stroke(); g.setLineDash([]); }
    else g.fillText(i === 4 ? '?' : String(i + 1), n.x, n.y + 9 * sc);
  });
  // pion du personnage
  const by = pn.y - 76 + Math.sin(t * 3) * 4;
  g.fillStyle = '#c23a1e'; g.beginPath(); g.moveTo(pn.x - 10, by + 28); g.lineTo(pn.x + 10, by + 28); g.lineTo(pn.x, by + 46); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.arc(pn.x, by, 32, 0, TAU); g.fillStyle = '#0c0a09'; g.fill(); g.clip(); if (portrait) g.drawImage(portrait, pn.x - 32, by - 32, 64, 64); g.restore();
  g.lineWidth = 4; g.strokeStyle = '#c23a1e'; g.beginPath(); g.arc(pn.x, by, 32, 0, TAU); g.stroke();
  // éclair de temps en temps
  const lt = t % 9; if (lt < 0.25) { g.fillStyle = `rgba(200,210,255,${(lt < 0.08 || (lt > 0.14 && lt < 0.2)) ? 0.16 : 0})`; g.fillRect(0, 0, 1000, 560); }
  // vignette et grain
  const v = g.createRadialGradient(500, 280, 250, 500, 280, 620); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = v; g.fillRect(0, 0, 1000, 560);
  // titre de la mission choisie
  const sn = MAP_NODES[hov != null ? hov : sel], si = hov != null ? hov : sel, ly = si === 4 ? 58 : sn.y > 300 ? sn.y + 74 : sn.y - 120, lx = si === 4 ? 850 : clamp(sn.x, 200, 800);
  g.font = '40px "Saira Stencil One", Impact, sans-serif'; g.textAlign = si === 4 ? 'right' : 'center'; g.lineWidth = 7; g.strokeStyle = '#000'; g.strokeText(sn.name.toUpperCase(), lx, ly); g.fillStyle = '#e8dfc8'; g.fillText(sn.name.toUpperCase(), lx, ly);
}
function reportHTML(r) {
  const acc = r.shots > 0 ? Math.round(100 * r.hits / r.shots) + ' %' : '–';
  const items = [['Score de la mission', fmt(r.score)], ['Zombies abattus', fmt(r.kills)], ['Dégâts infligés', fmt(Math.round(r.dmg))], ['Tirs', fmt(r.shots)], ['Précision', acc], ['Shibas trouvés', `${r.shibas} / ${SHIBAS_PER}`], ['Survivants sauvés', String(r.saved)], ['Morts', String(r.deaths)], ['Temps', fmtTime(r.time)]];
  return `<div class="report"><h3>Bilan · mission ${r.k + 1}</h3><p class="rep-zone">${ZONES[r.k].name}</p><dl class="rep">${items.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>`;
}
function wrapText(c, text, x, y, maxW, lh) { const words = text.split(' '); let line = ''; for (const w of words) { const test = line ? line + ' ' + w : w; if (c.measureText(test).width > maxW && line) { c.fillText(line, x, y); line = w; y += lh; } else line = test; } if (line) c.fillText(line, x, y); }
function scoreTable(list, hiDate) {
  if (!list.length) return '<p class="empty">Aucun score enregistré sur cet appareil pour l\'instant.</p>';
  return `<div class="tablewrap"><table class="scores"><thead><tr><th>#</th><th>Nom</th><th>Perso</th><th class="num">Score</th><th>Issue</th><th>Difficulté</th><th class="num">Abattus</th></tr></thead><tbody>${list.map((e, i) => `<tr class="${e.date === hiDate ? 'me' : ''}"><td>${i + 1}</td><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.char || '–')}</td><td class="num">${fmt(e.score)}</td><td>${e.wave ? 'Vague ' + e.wave : e.win ? 'Évacué' : 'Disparu'}</td><td>${escapeHtml(e.diff)}</td><td class="num">${fmt(e.kills || 0)}</td></tr>`).join('')}</tbody></table></div>`;
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

