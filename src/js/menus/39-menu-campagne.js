// ---------- écran Campagne : la ville en feu en plein écran, les cinq missions, la difficulté
const CAMP_THEME = {
  facile: { sky: ['#140f26', '#3a2648', '#a85a5e'], moon: '#f1e4c0', glow: '255,170,120', win: '255,214,140', ground: '#120e18', beam: '255,236,200' },
  normal: { sky: ['#0a0508', '#2a0c08', '#8a3010'], moon: '#c2432c', glow: '255,120,40', win: '255,180,80', ground: '#0d0907', beam: '255,226,180' },
  cauchemar: { sky: ['#050104', '#22040e', '#6a0618'], moon: '#d0141e', glow: '255,30,60', win: '255,60,80', ground: '#0b0306', beam: '255,190,200' }
};
const camp = { on: false, key: '', W: 0, H: 0, k: 1, layers: null, hero: null, heroKey: '', grain: null, t0: 0 };
// pâtés d'immeubles d'une couche de parallaxe, en deux exemplaires côte à côte pour défiler sans couture
function campSkyline(W, H, seed, base, hMin, hMax, col, winCol, winP) {
  const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H; const g = cv.getContext('2d'), r = mulberry32(seed), roofs = [];
  for (let rep = 0; rep < 2; rep++) {
    const r2 = mulberry32(seed); let x = rep * W;
    while (x < (rep + 1) * W) {
      const w = (0.04 + r2() * 0.07) * W, h = hMin + r2() * (hMax - hMin), y = base - h; g.fillStyle = col; g.fillRect(x, y, w + 1, H - y);
      if (r2() < 0.3) g.fillRect(x + w * 0.4, y - h * 0.12, w * 0.12, h * 0.12);
      if (r2() < 0.25) { g.fillRect(x + w * 0.2, y - 10, 2, 10); }
      const ws = Math.max(3, W * 0.004); for (let wy = y + ws * 2; wy < base - ws; wy += ws * 2.6) for (let wx = x + ws; wx < x + w - ws; wx += ws * 2.2) if (r2() < winP) { g.fillStyle = `rgba(${winCol},${0.35 + r2() * 0.5})`; g.fillRect(wx, wy, ws, ws * 1.3); }
      if (rep === 0 && r2() < 0.28) roofs.push([x + w * (0.2 + r2() * 0.6), y]);
      x += w;
    }
  }
  return { cv, roofs };
}
function campBuild() {
  const cv = $('camp-cv'), k = Math.min(1.5, window.devicePixelRatio || 1), W = Math.max(320, Math.round(cv.clientWidth * k)), H = Math.max(240, Math.round(cv.clientHeight * k)), th = CAMP_THEME[game.diffKey] || CAMP_THEME.normal;
  cv.width = W; cv.height = H; camp.W = W; camp.H = H; camp.k = k; camp.key = `${W}x${H}:${game.diffKey}`;
  const street = H * 0.8;
  camp.layers = [
    { ...campSkyline(W, H, 11, street - H * 0.05, H * 0.18, H * 0.42, '#0b0a10', th.win, 0.05), sp: 4 },
    { ...campSkyline(W, H, 23, street, H * 0.12, H * 0.32, '#060508', th.win, 0.08), sp: 11 }
  ];
  const n = document.createElement('canvas'); n.width = n.height = 160; const ng = n.getContext('2d'), r = mulberry32(5);
  for (let i = 0; i < 1400; i++) { ng.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.5)' : 'rgba(255,240,220,.06)'; ng.fillRect(r() * 160, r() * 160, 1, 1); }
  camp.grain = n; camp.heroKey = '';
}
// le personnage choisi, en ombre chinoise bordée de lumière
function campHero() {
  const ch = game.charKey; if (camp.hero && camp.heroKey === ch) return camp.hero;
  const cv = document.createElement('canvas'); cv.width = 600; cv.height = 760; const g = cv.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0);
  shadedFigure(g, c => hero(ch, c, 150, 372, 1, { mood: ch === 'fiona' ? 'deadpan' : 'determined', hand: 'gun' }), { lx: 0.8, ly: 0.2 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; const sh = g.createLinearGradient(0, 0, 600, 0); sh.addColorStop(0, 'rgba(4,3,6,.78)'); sh.addColorStop(0.7, 'rgba(4,3,6,.55)'); sh.addColorStop(1, 'rgba(4,3,6,.2)'); g.fillStyle = sh; g.fillRect(0, 0, 600, 760);
  camp.hero = cv; camp.heroKey = ch; return cv;
}
function campFire(g, x, y, s, t, th) {
  const fl = 0.8 + Math.sin(t * 9 + x) * 0.12, R = 55 * s * fl, h = g.createRadialGradient(x, y, 2, x, y, R);
  h.addColorStop(0, `rgba(${th.glow},.4)`); h.addColorStop(1, `rgba(${th.glow},0)`); g.fillStyle = h; g.fillRect(x - R, y - R, R * 2, R * 2);
  for (let i = 0; i < 4; i++) { const fx = x + Math.sin(t * 6 + i * 2 + x) * 6 * s, fh = (22 + i * 5) * s * (0.8 + Math.sin(t * 13 + i * 3) * 0.2); g.fillStyle = i < 2 ? 'rgba(255,110,30,.8)' : 'rgba(255,210,120,.75)'; g.beginPath(); g.moveTo(fx - 9 * s, y); g.quadraticCurveTo(fx - 6 * s, y - fh * 0.6, fx, y - fh); g.quadraticCurveTo(fx + 6 * s, y - fh * 0.6, fx + 9 * s, y); g.fill(); }
  for (let i = 0; i < 6; i++) { const p = (t * 0.5 + i / 6 + x * 0.01) % 1; g.fillStyle = `rgba(255,170,80,${1 - p})`; g.fillRect(x + Math.sin(p * 9 + i) * 20 * s, y - p * 140 * s, 2.4 * s, 2.4 * s); }
}
function campDraw(t) {
  const cv = $('camp-cv'), g = cv.getContext('2d'); if (`${Math.round(cv.clientWidth * camp.k)}x${Math.round(cv.clientHeight * camp.k)}:${game.diffKey}` !== camp.key) campBuild();
  const W = camp.W, H = camp.H, th = CAMP_THEME[game.diffKey] || CAMP_THEME.normal, street = H * 0.8, u = H / 600;
  const sky = g.createLinearGradient(0, 0, 0, street); sky.addColorStop(0, th.sky[0]); sky.addColorStop(0.62, th.sky[1]); sky.addColorStop(1, th.sky[2]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // lune et nuages qui passent devant
  const mx = W * 0.6, my = H * 0.16, mr = 40 * u, mg = g.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 4); mg.addColorStop(0, `rgba(${th.glow},.28)`); mg.addColorStop(1, `rgba(${th.glow},0)`); g.fillStyle = mg; g.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
  g.fillStyle = th.moon; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; for (const [dx, dy, rr] of [[-0.3, -0.2, 0.22], [0.25, 0.3, 0.16], [0.1, -0.35, 0.1]]) { g.beginPath(); g.arc(mx + dx * mr, my + dy * mr, rr * mr, 0, TAU); g.fill(); }
  for (let i = 0; i < 5; i++) { const x = ((t * (6 + i * 2) * u + i * W * 0.31) % (W * 1.5)) - W * 0.25, y = H * (0.12 + i * 0.07); g.fillStyle = 'rgba(8,6,10,.55)'; g.beginPath(); g.ellipse(x, y, 160 * u, 18 * u, 0, 0, TAU); g.ellipse(x + 90 * u, y - 8 * u, 90 * u, 16 * u, 0, 0, TAU); g.fill(); }
  // projecteurs qui balaient le ciel
  g.globalCompositeOperation = 'lighter';
  for (const [bx, ph] of [[0.22, 0], [0.86, 2.1]]) { const a = -Math.PI / 2 + Math.sin(t * 0.35 + ph) * 0.5, x0 = W * bx, L = H * 1.1, sp = 0.07; g.fillStyle = `rgba(${th.beam},.07)`; g.beginPath(); g.moveTo(x0, street); g.lineTo(x0 + Math.cos(a - sp) * L, street + Math.sin(a - sp) * L); g.lineTo(x0 + Math.cos(a + sp) * L, street + Math.sin(a + sp) * L); g.closePath(); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  // ville en parallaxe et toits en feu
  for (const [i, L] of camp.layers.entries()) { const off = (t * L.sp * u) % W; g.drawImage(L.cv, -off, 0); if (i === 1) for (const [rx, ry] of L.roofs) { let x = rx - off; if (x < -60) x += W; campFire(g, x, ry, u * 0.9, t, th); } }
  // l'hélicoptère passe de temps en temps, projecteur braqué sur la ville
  { const T = 17, p = (t % T) / T; if (p < 0.55) { const q = p / 0.55, x = W * 1.1 - q * W * 1.3, y = H * 0.24 + Math.sin(q * 6) * 10 * u, s = u * 1.1;
    g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,240,200,.06)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 70 * s, street); g.lineTo(x + 50 * s, street); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#050406'; g.beginPath(); g.ellipse(x, y, 24 * s, 11 * s, 0, 0, TAU); g.fill(); g.fillRect(x + 14 * s, y - 3 * s, 30 * s, 5 * s); g.fillRect(x + 40 * s, y - 10 * s, 4 * s, 12 * s);
    g.strokeStyle = 'rgba(20,18,22,.8)'; g.lineWidth = 2 * s; const ro = t * 40; g.beginPath(); g.moveTo(x - Math.cos(ro) * 38 * s, y - 14 * s); g.lineTo(x + Math.cos(ro) * 38 * s, y - 14 * s); g.stroke();
    if (Math.sin(t * 8) > 0) { g.fillStyle = 'rgba(255,50,40,.95)'; g.beginPath(); g.arc(x + 44 * s, y - 10 * s, 2.5 * s, 0, TAU); g.fill(); } } }
  // la rue et la horde qui titube
  g.fillStyle = th.ground; g.fillRect(0, street, W, H - street); g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, street, W, 2 * u);
  for (let i = 0; i < 14; i++) { const sp = 8 + (i % 4) * 3, x = ((i * W * 0.137 + t * sp * u) % (W * 1.2)) - W * 0.1, y = street + (6 + (i % 3) * 9) * u; mapZombie(g, x, y, u * (2.1 + (i % 3) * 0.3), t + i, i * 1.3); }
  // le personnage, sur le trottoir, qui respire
  { const hc = campHero(), hh = H * 0.46, hw = hh * hc.width / hc.height, x = W * 0.32, y = street + 10 * u + Math.sin(t * 1.6) * 1.5 * u;
    const rim = g.createRadialGradient(x, y - hh * 0.5, 10, x, y - hh * 0.5, hh * 0.75); rim.addColorStop(0, `rgba(${th.glow},.22)`); rim.addColorStop(1, `rgba(${th.glow},0)`); g.fillStyle = rim; g.fillRect(x - hh, y - hh * 1.3, hh * 2, hh * 1.4);
    g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(x, y - 4 * u, hw * 0.32, 8 * u, 0, 0, TAU); g.fill(); g.drawImage(hc, x - hw / 2, y - hh, hw, hh); }
  // brume au ras du sol, pluie, éclairs
  for (let i = 0; i < 3; i++) { const x = ((t * (14 + i * 6) * u + i * W * 0.4) % (W * 1.6)) - W * 0.3, f = g.createRadialGradient(x, street, 10, x, street, 320 * u); f.addColorStop(0, 'rgba(90,80,96,.16)'); f.addColorStop(1, 'rgba(90,80,96,0)'); g.fillStyle = f; g.fillRect(x - 320 * u, street - 320 * u, 640 * u, 640 * u); }
  g.strokeStyle = 'rgba(170,180,210,.16)'; g.lineWidth = Math.max(1, u); g.beginPath(); for (let i = 0; i < 110; i++) { const x = ((i * 97.3 + t * 90 * u) % (W + 60)) - 30, y = ((i * 53.7 + t * 700 * u) % (H + 60)) - 30; g.moveTo(x, y); g.lineTo(x - 6 * u, y + 18 * u); } g.stroke();
  { const lt = t % 11; if (lt < 0.32) { const on = lt < 0.06 || (lt > 0.14 && lt < 0.22); if (on) { g.fillStyle = 'rgba(210,215,255,.13)'; g.fillRect(0, 0, W, H); const r = mulberry32(Math.floor(t / 11)), bx = W * (0.15 + r() * 0.7); g.strokeStyle = 'rgba(235,235,255,.75)'; g.lineWidth = 2 * u; g.beginPath(); let x = bx, y = 0; g.moveTo(x, y); while (y < H * 0.5) { x += (r() - 0.5) * 50 * u; y += (20 + r() * 30) * u; g.lineTo(x, y); } g.stroke(); } } }
  // vignette et grain
  const v = g.createRadialGradient(W * 0.45, H * 0.45, H * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.72)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.globalAlpha = 0.5; g.fillStyle = g.createPattern(camp.grain, 'repeat'); g.save(); g.translate((t * 997) % 160, (t * 613) % 160); g.fillRect(-160, -160, W + 320, H + 320); g.restore(); g.globalAlpha = 1;
}
// les cinq missions et le niveau secret, d'après la sauvegarde
function campTrack() {
  const d = readSave(), cur = d ? d.safe + 1 : 0, found = new Set(d ? d.cp.shibas || [] : []), ic = iconURL('shiba');
  const li = MISSION_NAMES.map((name, i) => {
    const st = i < cur ? 'done' : i === cur ? 'cur' : 'todo', lab = { done: 'Terminée', cur: d ? 'Reprendre ici' : 'Première mission', todo: 'À venir' }[st];
    let sh = ''; for (let k = 0; k < SHIBAS_PER; k++) sh += `<img src="${ic}" class="${found.has(i + '-' + k) ? '' : 'off'}" alt="">`;
    return `<li class="camp-m ${st}" style="--d:${0.12 + i * 0.07}s"><span class="camp-n">${i + 1}</span><b>${name}</b><small>${lab}</small><span class="camp-sh" aria-label="${[...found].filter(id => id.startsWith(i + '-')).length} shibas sur ${SHIBAS_PER}">${sh}</span></li>`;
  });
  li.push(`<li class="camp-m secret ${Settings.paradise ? 'open' : ''}" style="--d:${0.12 + MISSIONS * 0.07}s"><span class="camp-n">?</span><b>Le Paradis des Shibas</b><small>${Settings.paradise ? 'Débloqué' : `Secret · les ${SHIBAS_TOTAL} shibas`}</small></li>`);
  $('camp-track').innerHTML = li.join('');
  $('camp-sub').textContent = d ? `${CHARS[d.char].name} · ${DIFFS[d.diff].name} · mission ${cur + 1} sur ${MISSIONS} · ${found.size}/${SHIBAS_TOTAL} shibas` : `${CHARS[game.charKey].name} · de la gare à l'hôpital, une seule nuit`;
}
function campRefresh(on) {
  const m = $('launch-modal'); m.classList.toggle('camp', on); camp.on = on; if (!on) return;
  m.dataset.diff = game.diffKey; campTrack();
  if (!camp.loop) { camp.loop = true; camp.t0 = performance.now(); let reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
    const tick = () => { if (!camp.on || m.hidden) { camp.loop = false; return; } campDraw(reduce ? 4 : (performance.now() - camp.t0) / 1000 + 3); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
}
