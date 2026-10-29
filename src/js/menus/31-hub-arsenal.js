// ---------- hub : onglets, arsenal, défis, cartes
const HUB_TABS = ['lobby', 'perso', 'arsenal'];
let hubTab = 'lobby';
function setTab(t) {
  hubTab = t; if ($('scr-title').classList.contains('page-open')) { for (const [pid, bid] of TITLE_PANELS) { $(pid).hidden = true; $(bid).setAttribute('aria-expanded', 'false'); } $('scr-title').classList.remove('page-open'); } for (const k of HUB_TABS) $('pane-' + k).hidden = k !== t;
  for (const b of document.querySelectorAll('.hub-tabs .tab')) b.setAttribute('aria-selected', b.dataset.tab === t ? 'true' : 'false');
  if (t === 'arsenal') renderArsenal();
  if (t === 'perso' && typeof ficheKey !== 'undefined' && ficheKey) renderFiche();
}
for (const b of document.querySelectorAll('.hub-tabs .tab[data-tab]')) b.addEventListener('click', () => { game.audio.init(); setTab(b.dataset.tab); });
const W_KIND = { pistol: 'Arme de poing', shotgun: 'Fusil à pompe', smg: 'Mitraillette', flamer: 'Arme thermique', rail: 'Arme lourde', rocket: 'Explosif' };
const W_RANGE = { pistol: 0.55, shotgun: 0.25, smg: 0.5, flamer: 0.15, rail: 1, rocket: 0.8 };
function weaponStats(d) {
  const dps = d.dmg * (d.pellets || 1) * (d.type === 'rocket' ? 2 : 1);
  return [['Dégâts', clamp(dps / 230, 0.08, 1)], ['Cadence', clamp((1 / d.rate) / 26, 0.08, 1)], ['Portée', W_RANGE[d.id] || 0.5], ['Précision', clamp(1 - (d.spread || 0) / 0.32, 0.08, 1)], ['Chargeur', clamp(d.mag / 150, 0.06, 1)], ['Maniabilité', clamp(1.6 - d.reload / 1.6, 0.1, 1)]];
}
let arsenalSel = 0;
function renderArsenal() {
  const d = WEAPONS[arsenalSel];
  $('av-type').textContent = W_KIND[d.id] || d.type; $('av-name').textContent = d.name; $('av-desc').textContent = d.desc;
  $('av-up').innerHTML = `<b>Marché noir</b> · améliore les dégâts, la cadence et le chargeur (3 niveaux chacun)${d.infinite ? '' : ` · +${d.ammoPack} munitions pour $${d.ammoPrice}`}`;
  $('av-price').textContent = d.price ? `Marché noir · $${fmt(d.price)}` : 'Arme de départ'; $('av-price').classList.toggle('free', !d.price);
  $('wteaser-cap').textContent = W_TEASE[d.id] || ''; weaponScene.wi = -1; if (!wteaserRaf) wteaserRaf = requestAnimationFrame(wteaserLoop);
  $('av-stats').innerHTML = statBars(weaponStats(d));
  $('av-mag').textContent = String(d.mag); $('av-res').textContent = d.infinite ? '∞' : String(d.ammoPack);
  for (const c of document.querySelectorAll('#arsenal-cards .wcard')) c.setAttribute('aria-pressed', +c.dataset.w === arsenalSel ? 'true' : 'false');
}
// ---------- Arsenal : l'arme filmée en situation, avec le moteur du jeu (même principe que les capacités)
const W_TEASE = {
  pistol: 'Tir précis à volonté. Maintiens la détente : le tir chargé perce toute la file.',
  shotgun: 'Neuf plombs d\'un coup : dévastateur de près, il repousse la horde.',
  smg: 'Une rafale continue qui hache les groupes. Surveille le chargeur.',
  flamer: 'Un jet de flammes court : tout ce qu\'il lèche brûle plusieurs secondes.',
  rail: 'Un rayon instantané qui traverse tous les zombies alignés.',
  rocket: 'Une roquette qui souffle le cœur du groupe. Garde tes distances.'
};
const W_SHOUT = { pistol: 'TIR CHARGÉ !', shotgun: 'BOUM !', smg: 'RAFALE !', flamer: 'FLAMBÉS !', rail: 'PERFORATION !', rocket: 'KABOUM !' };
const weaponScene = { wi: -1 };
function wteaserReset(wi) {
  const T = weaponScene, d = WEAPONS[wi], ck = game.charKey; T.p = new Player(game, 62, 100); game.charKey = ck;
  const p = T.p; p.weapons.forEach(w => { w.owned = true; }); p.cur = wi; p.aim = 0; T.wi = wi; T.blood = []; T.tracer = []; T.fx = []; T.shake = 0; T.done = {};
  const at = { pistol: [[170, 100], [205, 100], [240, 100], [275, 100], [300, 72], [300, 130]], shotgun: [[150, 84], [160, 112], [185, 96], [205, 126], [210, 72], [290, 100]],
    smg: [[200, 60], [230, 100], [210, 140], [270, 80], [285, 125], [310, 100]], flamer: [[150, 92], [170, 112], [195, 84], [215, 108], [280, 70], [300, 130]],
    rail: [[150, 100], [185, 100], [220, 100], [255, 100], [290, 100], [300, 62]], rocket: [[240, 88], [262, 110], [282, 84], [250, 132], [272, 64], [296, 120]] }[d.id];
  T.z = at.map(([x, y], i) => { const z = new Zombie(game, i % 3 === 2 ? 'runner' : 'walker', x, y, null); z.dir = Math.PI; z.alive = 1; z.fx = 0; z.hits = 0; return z; });
}
function drawWeaponTeaser(cv, wi, t) {
  const T = weaponScene, d = WEAPONS[wi], D = 4.2, cyc = Math.floor(t / D), u = t % D;
  if (T.wi !== wi || T.cycle !== cyc) { wteaserReset(wi); T.cycle = cyc; }
  const g = cv.getContext('2d'), k = cv.width / 320, p = T.p, id = d.id, live = () => T.z.filter(z => z.alive);
  p.walkT += 0.04; p.muzzleT = Math.max(0, p.muzzleT - 0.016); p.recoil = Math.max(0, (p.recoil || 0) - 0.05);
  const kill = (z, why) => { if (!z.alive) return; z.alive = 0; z.why = why; z.deadT = u; T.blood.push({ x: z.x, y: z.y, r: 7 + Math.random() * 5 }); };
  const once = (key, at) => { if (u >= at && !T.done[key]) { T.done[key] = 1; return true; } return false; };
  const muzzle = () => ({ x: p.x + Math.cos(p.aim) * 20, y: p.y - 14 + Math.sin(p.aim) * 20 }); /* hauteur de l'arme, pas des pieds */
  const shoot = (z, hitsToKill, col) => { if (!z) return; p.aim = Math.atan2(z.y - p.y, z.x - p.x); p.muzzleT = 0.06; p.recoil = 1; const m = muzzle(); T.tracer.push({ x0: m.x, y0: m.y, x: z.x, y: z.y - 14, t: 0.1, w: 1.5, c: col || '255,220,150' }); z.hitFlash = 0.1; if (++z.hits >= hitsToKill) kill(z, 'shot'); };
  // les zombies avancent
  for (const z of T.z) { if (z.hitFlash > 0) z.hitFlash -= 0.016; if (!z.alive) continue; z.walkT += 0.08 * (z.type === 'runner' ? 1.5 : 1); if (z.kx) { z.x += z.kx; z.kx *= 0.8; if (Math.abs(z.kx) < 0.1) z.kx = 0; continue; }
    const dx = p.x - z.x, dy = p.y - z.y, dd = Math.hypot(dx, dy) || 1; if (dd > 40) { const sp = z.type === 'runner' ? 0.55 : 0.32; z.x += dx / dd * sp; z.y += dy / dd * sp; } z.dir = Math.atan2(dy, dx);
    if (z.burn) { z.burnT = (z.burnT || 0) + 0.016; if (z.burnT > 0.9) kill(z, 'fire'); } }
  let shout = null;
  if (id === 'pistol') {
    for (const [i, at] of [0.35, 0.7, 1.05, 1.4].entries()) if (once('s' + i, at)) shoot(live()[0], 2);
    if (u > 1.9 && u < 2.7) { p.aim = 0; p.charging = true; p.charge = Math.min(1, (u - 1.9) / 0.7); } else { p.charging = false; p.charge = 0; }
    if (once('c', 2.7)) { p.aim = 0; p.muzzleT = 0.1; p.recoil = 1; const m = muzzle(); T.tracer.push({ x0: m.x, y0: m.y, x: 330, y: m.y, t: 0.35, w: 4, c: '180,225,255' }); for (const z of live()) if (Math.abs(z.y - p.y) < 16) kill(z, 'shot'); T.shake = 0.3; }
    if (u > 2.7 && u < 3.6) shout = W_SHOUT.pistol;
  } else if (id === 'shotgun') {
    for (const [i, at] of [0.5, 1.6, 2.7].entries()) if (once('b' + i, at)) { const tg = live()[0]; p.aim = tg ? Math.atan2(tg.y - p.y, tg.x - p.x) : 0; p.muzzleT = 0.08; p.recoil = 1; const m = muzzle();
      for (let j = 0; j < 9; j++) { const a = p.aim + (j / 8 - 0.5) * 0.5, L = 150 + Math.random() * 40; T.tracer.push({ x0: m.x, y0: m.y, x: m.x + Math.cos(a) * L, y: m.y + Math.sin(a) * L, t: 0.09, w: 1.2, c: '255,220,150' }); }
      for (const z of live()) { const dx = z.x - p.x, dy = z.y - p.y, dd = Math.hypot(dx, dy), an = Math.abs(angDiff(Math.atan2(dy, dx), p.aim)); if (an < 0.32 && dd < 170) { if (dd < 120) kill(z, 'shot'); else { z.kx = 5; z.hitFlash = 0.1; } } }
      T.shake = 0.25; if (i < 2) shout = null; }
    if ((u > 0.5 && u < 1.1) || (u > 1.6 && u < 2.2)) shout = W_SHOUT.shotgun;
  } else if (id === 'smg') {
    if (u > 0.3 && u < 3.2) { const n = Math.floor((u - 0.3) / 0.08); if (n !== T.lastN) { T.lastN = n; const L = live(); if (L.length) { const z = L[n % Math.min(2, L.length)]; const m = muzzle(); p.aim = Math.atan2(z.y - p.y, z.x - p.x) + (Math.random() - 0.5) * 0.12; p.muzzleT = 0.04; p.recoil = 0.6; T.tracer.push({ x0: m.x, y0: m.y, x: z.x + (Math.random() - 0.5) * 8, y: z.y - 14 + (Math.random() - 0.5) * 8, t: 0.06, w: 1.2, c: '255,220,150' }); z.hitFlash = 0.08; if (++z.hits >= 5) kill(z, 'shot'); } } }
    if (u > 0.8 && u < 2.6) shout = W_SHOUT.smg;
  } else if (id === 'flamer') {
    if (u > 0.4 && u < 3.0) { const tg = live()[0]; if (tg) p.aim += angDiff(p.aim, Math.atan2(tg.y - p.y, tg.x - p.x)) * 0.1; for (let j = 0; j < 3; j++) T.fx.push({ k: 'fl', x: p.x + Math.cos(p.aim) * 20, y: p.y + Math.sin(p.aim) * 20, vx: Math.cos(p.aim + (Math.random() - 0.5) * 0.4) * (3 + Math.random()), vy: Math.sin(p.aim + (Math.random() - 0.5) * 0.4) * (3 + Math.random()), t: 0.5 });
      for (const z of live()) { const dx = z.x - p.x, dy = z.y - p.y, dd = Math.hypot(dx, dy); if (dd < 150 && Math.abs(angDiff(Math.atan2(dy, dx), p.aim)) < 0.3) z.burn = 1; } }
    if (u > 1.0 && u < 2.8) shout = W_SHOUT.flamer;
  } else if (id === 'rail') {
    if (u > 0.4 && u < 1.2) { p.aim = 0; p.charging = true; p.charge = (u - 0.4) / 0.8; } else { p.charging = false; p.charge = 0; }
    if (once('r', 1.2)) { p.aim = 0; p.muzzleT = 0.1; p.recoil = 1; const m = muzzle(); T.tracer.push({ x0: m.x, y0: m.y, x: 340, y: m.y, t: 0.5, w: 5, c: '160,240,255', glow: 1 }); for (const z of live()) if (Math.abs(z.y - p.y) < 14) kill(z, 'zap'); T.shake = 0.35; }
    if (once('r2', 2.9)) { const z = live()[0]; if (z) { p.aim = Math.atan2(z.y - p.y, z.x - p.x); p.muzzleT = 0.1; const m = muzzle(); T.tracer.push({ x0: m.x, y0: m.y, x: m.x + Math.cos(p.aim) * 340, y: m.y + Math.sin(p.aim) * 340, t: 0.5, w: 5, c: '160,240,255', glow: 1 }); kill(z, 'zap'); } }
    if (u > 1.2 && u < 2.2) shout = W_SHOUT.rail;
  } else if (id === 'rocket') {
    const fire = (key, at, tx, ty) => { if (once(key, at)) { p.aim = Math.atan2(ty - p.y, tx - p.x); p.muzzleT = 0.1; p.recoil = 1; const m = muzzle(); T.fx.push({ k: 'rk', x: m.x, y: m.y, tx, ty, a: p.aim }); } };
    fire('k1', 0.5, 262, 100); const L = live(); if (L.length) fire('k2', 2.4, L[0].x, L[0].y);
    for (const f of T.fx) if (f.k === 'rk' && !f.boom) { const dx = f.tx - f.x, dy = f.ty - f.y, dd = Math.hypot(dx, dy); if (dd < 7) { f.boom = u; for (const z of live()) if (Math.hypot(z.x - f.tx, z.y - f.ty) < 62) kill(z, 'fire'); T.shake = 0.5; } else { f.x += dx / dd * 6; f.y += dy / dd * 6; T.fx.push({ k: 'sm', x: f.x, y: f.y, t: 0.6 }); } }
    if (T.fx.some(f => f.k === 'rk' && f.boom && u - f.boom < 0.9)) shout = W_SHOUT.rocket;
  }
  // ---- rendu (décor de rue de nuit, comme les capacités)
  T.shake = Math.max(0, T.shake - 0.02); const sx = (Math.random() - 0.5) * T.shake * 10, sy = (Math.random() - 0.5) * T.shake * 10;
  g.setTransform(k, 0, 0, k, sx * k, sy * k);
  g.fillStyle = '#26252a'; g.fillRect(-10, -10, 340, 200);
  g.fillStyle = '#2d2c31'; for (let i = 0; i < 40; i++) g.fillRect((i * 83) % 320, (i * 47) % 180, 14, 9);
  g.fillStyle = 'rgba(230,220,190,.35)'; for (let x = -20; x < 340; x += 60) g.fillRect(x, 98, 34, 4);
  g.fillStyle = '#1a191d'; g.fillRect(-10, -10, 340, 36); g.fillRect(-10, 168, 340, 22); g.fillStyle = '#3a3238'; g.fillRect(-10, 26, 340, 4);
  for (const bl of T.blood) { g.fillStyle = 'rgba(110,8,6,.8)'; g.beginPath(); g.ellipse(bl.x, bl.y + 2, bl.r * 1.5, bl.r, 0, 0, TAU); g.fill(); }
  for (const f of T.fx) if (f.k === 'rk' && f.boom) { g.fillStyle = 'rgba(20,16,14,.6)'; g.beginPath(); g.ellipse(f.tx, f.ty + 2, 34, 22, 0, 0, TAU); g.fill(); }
  const saved = ctx; ctx = g;
  try {
    const list = T.z.filter(z => z.alive || u - z.deadT < 0.3).sort((a, b) => a.y - b.y);
    for (const z of list) { g.save(); if (!z.alive) g.globalAlpha = Math.max(0, 1 - (u - z.deadT) / 0.3); game.drawZombie(z); g.restore(); }
    game.drawPlayer(p);
  } catch (er) { } ctx = saved;
  // obscurité + lampe torche
  const lc = weaponScene.lc || (weaponScene.lc = document.createElement('canvas')); lc.width = cv.width; lc.height = cv.height; const l = lc.getContext('2d'); l.setTransform(k, 0, 0, k, 0, 0);
  l.fillStyle = 'rgba(6,6,12,.78)'; l.fillRect(0, 0, 320, 180); l.globalCompositeOperation = 'destination-out';
  const halo = l.createRadialGradient(p.x, p.y, 4, p.x, p.y, 60); halo.addColorStop(0, 'rgba(0,0,0,.9)'); halo.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = halo; l.fillRect(0, 0, 320, 180);
  const cone = l.createRadialGradient(p.x, p.y, 10, p.x, p.y, 280); cone.addColorStop(0, 'rgba(0,0,0,.95)'); cone.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = cone; l.beginPath(); l.moveTo(p.x, p.y); l.arc(p.x, p.y, 280, p.aim - 0.55, p.aim + 0.55); l.closePath(); l.fill();
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(lc, 0, 0); g.setTransform(k, 0, 0, k, sx * k, sy * k);
  // effets lumineux
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const tr of T.tracer) { if (tr.t <= 0) continue; tr.t -= 0.016; const a = Math.min(1, tr.t * (tr.w > 3 ? 3 : 8)); if (tr.glow) { g.shadowColor = `rgb(${tr.c})`; g.shadowBlur = 14; } g.strokeStyle = `rgba(${tr.c},${a})`; g.lineWidth = tr.w; g.beginPath(); g.moveTo(tr.x0, tr.y0); g.lineTo(tr.x, tr.y); g.stroke(); g.shadowBlur = 0; }
  if (p.charging) { const m = muzzle(), r = 3 + p.charge * 7; g.fillStyle = id === 'rail' ? `rgba(160,240,255,${0.4 + p.charge * 0.5})` : `rgba(180,225,255,${0.3 + p.charge * 0.5})`; g.beginPath(); g.arc(m.x, m.y, r, 0, TAU); g.fill(); }
  for (const f of T.fx) {
    if (f.k === 'fl' && f.t > 0) { f.t -= 0.016; f.x += f.vx; f.y += f.vy; f.vx *= 0.96; f.vy *= 0.96; const q = f.t / 0.5; g.fillStyle = q > 0.6 ? 'rgba(255,230,140,.5)' : q > 0.3 ? 'rgba(255,130,40,.45)' : 'rgba(200,50,20,.3)'; g.beginPath(); g.arc(f.x, f.y, 3 + (1 - q) * 8, 0, TAU); g.fill(); }
    if (f.k === 'sm' && f.t > 0) { f.t -= 0.016; g.fillStyle = `rgba(255,170,80,${f.t * 0.4})`; g.beginPath(); g.arc(f.x, f.y, 2 + (0.6 - f.t) * 6, 0, TAU); g.fill(); }
    if (f.k === 'rk' && !f.boom) { g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(f.x, f.y, 3, 0, TAU); g.fill(); }
    if (f.k === 'rk' && f.boom && u - f.boom < 0.7) { const q = (u - f.boom) / 0.7, R = 20 + q * 60; const gr = g.createRadialGradient(f.tx, f.ty, 2, f.tx, f.ty, R); gr.addColorStop(0, `rgba(255,240,180,${1 - q})`); gr.addColorStop(0.5, `rgba(255,120,30,${0.8 * (1 - q)})`); gr.addColorStop(1, 'rgba(160,30,10,0)'); g.fillStyle = gr; g.beginPath(); g.arc(f.tx, f.ty, R, 0, TAU); g.fill(); }
  }
  T.fx = T.fx.filter(f => f.k === 'rk' || f.t > 0);
  for (const z of T.z) if (z.burn && (z.alive || u - z.deadT < 0.5)) for (let f = 0; f < 5; f++) { const fx = z.x + Math.sin(u * 30 + f * 2) * 6, fy = z.y - 4 - f * 3; g.fillStyle = f % 2 ? 'rgba(255,170,40,.6)' : 'rgba(255,80,20,.6)'; g.beginPath(); g.arc(fx, fy, 4 - f * 0.5, 0, TAU); g.fill(); }
  g.restore();
  g.setTransform(k, 0, 0, k, 0, 0);
  if (shout) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 140, 320, 26); g.fillStyle = '#ffd23a'; g.font = `15px ${FD}`; g.textAlign = 'center'; g.fillText(shout, 160, 158); }
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, 320, 18); g.fillStyle = '#e0321f'; g.beginPath(); g.arc(10, 9, 4, 0, TAU); g.fill(); g.fillStyle = '#d8d2c4'; g.font = `10px ${FT}`; g.textAlign = 'left'; g.fillText('EN JEU · ' + d.name.toUpperCase(), 19, 13);
  g.textAlign = 'right'; g.fillStyle = '#8b867b'; g.fillText(`chargeur ${d.mag} · ${d.infinite ? 'munitions infinies' : 'réserve ' + d.ammoPack}`, 312, 13);
}
let wteaserRaf = 0;
function wteaserLoop(now) { wteaserRaf = 0; if (game.state !== 'title' || $('pane-arsenal').hidden || document.hidden || $('scr-title').classList.contains('page-open')) return; if (now - (weaponScene.last || 0) > 15) { weaponScene.last = now; drawWeaponTeaser($('wteaser-cv'), arsenalSel, now / 1000); } wteaserRaf = requestAnimationFrame(wteaserLoop); }
setInterval(() => { if (!wteaserRaf && game.state === 'title' && !$('pane-arsenal').hidden) wteaserRaf = requestAnimationFrame(wteaserLoop); }, 700);
window.__wteaser = { draw: (cv, i, t) => drawWeaponTeaser(cv, i, t) };
$('arsenal-cards').innerHTML = WEAPONS.map((d, i) => `<button type="button" class="wcard weapon" data-w="${i}" aria-pressed="false"><span class="wc-kind">${W_KIND[d.id] || d.type}</span><span class="wc-pips" aria-hidden="true"><i></i><i></i><i></i></span><img src="${iconURL(d.id, true)}" alt=""><b>${d.name}</b><span class="wc-foot ${d.price ? 'contra' : ''}">${d.price ? `<span class="ft-mn">Marché noir · </span>$${fmt(d.price)}` : '<span class="ft-mn">Arme de </span>départ'}</span></button>`).join('');
for (const c of document.querySelectorAll('#arsenal-cards .wcard')) c.addEventListener('click', () => { arsenalSel = +c.dataset.w; renderArsenal(); });
const GEAR = [['grenade', 'Grenade', 'Touche ' + K('grenade')], ['mine', 'Mine', 'Explose au contact'], ['decoy', 'Fusée-leurre', 'Attire la horde'], ['battery', 'Piles', 'Recharge la lampe'], ['med', 'Trousse', '+25 santé']];
$('gear-cards').innerHTML = GEAR.map(([k, n, s2]) => `<div class="wcard gear"><img src="${iconURL(k)}" alt=""><b>${n}</b><span class="wc-foot">${s2}</span></div>`).join('');
// illustration de l'opération : les fleurs changent avec la difficulté
const START_FLAVOR = { facile: 'Les fleurs poussent encore', normal: 'Les fleurs ont brûlé', cauchemar: 'Les fleurs ont faim' };
function drawFlower(g, x, y, h, t, i, kind) {
  const sw = Math.sin(t * 1.6 + i * 1.3) * (kind === 'normal' ? 2 : 4), hx = x + sw, hy = y - h;
  if (kind === 'facile') {
    g.strokeStyle = '#3e8a3a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw * 0.3, y - h * 0.5, hx, hy); g.stroke();
    g.fillStyle = '#4fa548'; g.beginPath(); g.ellipse(x + sw * 0.2 + 5, y - h * 0.4, 6, 2.6, -0.6, 0, TAU); g.fill();
    const cols = ['#ff8fb8', '#ffd84d', '#f4f1ff', '#8fc8ff', '#ff9b5a'], c = cols[i % cols.length], r = 5 + (i % 3);
    g.fillStyle = c; for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + t * 0.3; g.beginPath(); g.ellipse(hx + Math.cos(a) * r, hy + Math.sin(a) * r, r * 0.75, r * 0.5, a, 0, TAU); g.fill(); }
    g.fillStyle = '#ffcf33'; g.beginPath(); g.arc(hx, hy, r * 0.45, 0, TAU); g.fill();
  } else if (kind === 'normal') {
    const droop = 0.5 + (i % 3) * 0.2, ex = x + h * 0.35 * droop, ey = y - h * (1 - droop * 0.45);
    g.strokeStyle = '#4a3326'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw, y - h * 0.9, ex + sw * 0.5, ey); g.stroke();
    const r = 6 + (i % 3), glow = 0.5 + Math.sin(t * 5 + i * 2) * 0.35;
    for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + 0.4 + (k % 2) * 0.2, pl = k === 2 ? 0.55 : 1; g.fillStyle = k % 2 ? '#2a1c16' : '#3b2a20'; g.beginPath(); g.ellipse(ex + Math.cos(a) * r * 0.85 * pl, ey + Math.sin(a) * r * 0.85 * pl + 2, r * 0.62 * pl, r * 0.34, a, 0, TAU); g.fill();
      g.strokeStyle = `rgba(255,${100 + glow * 70},40,${0.45 + glow * 0.45})`; g.lineWidth = 1; g.stroke(); }
    g.fillStyle = '#120a08'; g.beginPath(); g.arc(ex, ey + 2, r * 0.35, 0, TAU); g.fill();
    g.fillStyle = `rgba(255,140,50,${glow})`; g.beginPath(); g.arc(ex, ey + 2, 1.6, 0, TAU); g.fill();
    if ((i + Math.floor(t * 2)) % 5 === 0) { g.fillStyle = 'rgba(80,70,65,.6)'; g.fillRect(ex - 1 + Math.sin(t * 3) * 2, ey - 6 - (t * 20 % 14), 2, 2); }
  } else {
    g.strokeStyle = '#2a0a1e'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - sw, y - h * 0.5, hx, hy); g.stroke();
    g.fillStyle = '#3a0c26'; for (let k = 1; k < 4; k++) { const ty = y - h * k / 4, tx = x + (hx - x) * k / 4; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + (k % 2 ? 6 : -6), ty - 2); g.lineTo(tx, ty - 4); g.fill(); }
    const r = 8 + (i % 3) * 1.5, open = 0.75 + Math.sin(t * 3 + i) * 0.2;
    g.fillStyle = '#7a0a1a'; for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + Math.sin(t + i) * 0.2; g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo(hx + Math.cos(a - 0.4) * r * 1.4 * open, hy + Math.sin(a - 0.4) * r * 1.4 * open, hx + Math.cos(a) * r * 1.6 * open, hy + Math.sin(a) * r * 1.6 * open); g.quadraticCurveTo(hx + Math.cos(a + 0.4) * r * 1.4 * open, hy + Math.sin(a + 0.4) * r * 1.4 * open, hx, hy); g.fill(); }
    g.fillStyle = '#1a0006'; g.beginPath(); g.arc(hx, hy, r * 0.62, 0, TAU); g.fill();
    const blink = (Math.sin(t * 0.9 + i * 2.7) > 0.96) ? 0.15 : 1;
    g.fillStyle = '#f2e6cf'; g.beginPath(); g.ellipse(hx, hy, r * 0.5, r * 0.42 * blink, 0, 0, TAU); g.fill();
    if (blink > 0.5) { const lx = Math.sin(t * 0.7 + i) * r * 0.18; g.fillStyle = '#e0141e'; g.beginPath(); g.arc(hx + lx, hy, r * 0.26, 0, TAU); g.fill(); g.fillStyle = '#000'; g.fillRect(hx + lx - 0.8, hy - r * 0.22, 1.6, r * 0.44); }
    g.fillStyle = '#f2e6cf'; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(hx + k * 2.6 - 1.2, hy + r * 0.62); g.lineTo(hx + k * 2.6, hy + r * 0.62 + 3); g.lineTo(hx + k * 2.6 + 1.2, hy + r * 0.62); g.fill(); }
  }
}
function drawStartArt(t = 0) {
  const cv = $('start-cv'); if (!cv) return; const g = cv.getContext('2d'), r = mulberry32(3), kind = game.diffKey || 'normal';
  g.clearRect(0, 0, 360, 150);
  const SKY = { facile: ['#1c2440', '#5a3d5e', '#e09a7a'], normal: ['#1a0c0a', '#3a1208', '#8a3410'], cauchemar: ['#0a0206', '#2a0410', '#6a0618'] }[kind];
  const sky = g.createLinearGradient(0, 0, 0, 150); sky.addColorStop(0, SKY[0]); sky.addColorStop(0.6, SKY[1]); sky.addColorStop(1, SKY[2]); g.fillStyle = sky; g.fillRect(0, 0, 360, 150);
  if (kind === 'facile') { g.fillStyle = 'rgba(255,240,210,.9)'; g.beginPath(); g.arc(300, 34, 13, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 18; i++) g.fillRect(r() * 360, r() * 60, 1.4, 1.4); }
  if (kind === 'normal') { const f = g.createRadialGradient(270, 130, 5, 270, 130, 150); f.addColorStop(0, 'rgba(255,140,40,.6)'); f.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = f; g.fillRect(0, 0, 360, 150); for (let i = 0; i < 4; i++) { const p = (t * 0.05 + i / 4) % 1; g.fillStyle = `rgba(30,24,22,${0.5 * (1 - p)})`; g.beginPath(); g.arc(80 + i * 70 + p * 40, 110 - p * 110, 14 + p * 30, 0, TAU); g.fill(); } }
  if (kind === 'cauchemar') { const m = g.createRadialGradient(64, 36, 4, 64, 36, 60); m.addColorStop(0, 'rgba(255,40,40,.9)'); m.addColorStop(0.3, 'rgba(200,0,20,.5)'); m.addColorStop(1, 'rgba(120,0,20,0)'); g.fillStyle = m; g.fillRect(0, 0, 160, 110); g.fillStyle = '#d0141e'; g.beginPath(); g.arc(64, 36, 12, 0, TAU); g.fill();
    g.strokeStyle = `rgba(255,30,60,${0.12 + Math.sin(t * 2) * 0.06})`; g.lineWidth = 1.5; g.beginPath(); for (let k = 0; k <= 5; k++) { const a = -Math.PI / 2 + k * 2 * TAU / 5; const px = 250 + Math.cos(a) * 34, py = 70 + Math.sin(a) * 34; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.beginPath(); g.arc(250, 70, 38, 0, TAU); g.stroke(); }
  // ville au loin
  g.fillStyle = kind === 'facile' ? '#14142a' : '#0a0606'; let x = 0; while (x < 360) { const w = 24 + r() * 40, h = 30 + r() * 60; g.fillRect(x, 120 - h, w - 3, h + 30); x += w; }
  if (kind !== 'facile') { g.fillStyle = kind === 'cauchemar' ? 'rgba(255,40,60,.7)' : 'rgba(255,190,90,.8)'; for (let i = 0; i < 26; i++) g.fillRect(r() * 360, 40 + r() * 70, 2, 3); }
  else { g.fillStyle = 'rgba(255,230,140,.75)'; for (let i = 0; i < 20; i++) g.fillRect(r() * 360, 50 + r() * 60, 2, 3); }
  // sol
  g.fillStyle = kind === 'facile' ? '#1d3a1e' : kind === 'normal' ? '#1a1210' : '#14040c'; g.fillRect(0, 128, 360, 22);
  // zombies au loin, plus nombreux quand c'est plus dur
  const nz = kind === 'facile' ? 2 : kind === 'normal' ? 4 : 6; for (let i = 0; i < nz; i++) mapZombie(g, 40 + i * (300 / nz) + Math.sin(t * 0.4 + i) * 8, 130, 1.5, t + i, i * 1.7);
  // fleurs au premier plan
  for (let i = 0; i < 13; i++) { g.save(); const fx = 10 + i * 28 + (i % 2) * 5; g.translate(fx, 150); g.scale(1.35, 1.35); drawFlower(g, 0, 0, 18 + ((i * 7) % 5) * 4, t, i, kind); g.restore(); }
  // particules : lucioles, braises ou étincelles démoniaques
  for (let i = 0; i < 14; i++) { const p = (t * (kind === 'facile' ? 0.06 : 0.18) + i / 14) % 1, px = (i * 53 + Math.sin(t + i) * 12) % 360, py = 150 - p * 150;
    g.fillStyle = kind === 'facile' ? `rgba(220,255,150,${0.8 * Math.sin(p * Math.PI)})` : kind === 'normal' ? `rgba(255,150,60,${1 - p})` : `rgba(255,30,80,${1 - p})`; g.fillRect(px, py, 2, 2); }
  if (kind === 'cauchemar') { const v = g.createLinearGradient(0, 0, 0, 150); v.addColorStop(0, 'rgba(60,0,10,.0)'); v.addColorStop(1, 'rgba(120,0,20,.25)'); g.fillStyle = v; g.fillRect(0, 0, 360, 150); }
}
(function startArtLoop() { if (game.state === 'title' && !$('launch-modal').hidden) drawStartArt(performance.now() / 1000); requestAnimationFrame(startArtLoop); })();
function refreshStartDiff() { const card = document.querySelector('.start-card'); card.dataset.diff = game.diffKey; if (!readSave()) $('start-kicker').textContent = `Nouvelle nuit · ${START_FLAVOR[game.diffKey]}`; }
for (const b of document.querySelectorAll('#diff button')) b.addEventListener('click', () => setTimeout(refreshStartDiff, 0));
