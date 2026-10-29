// ---------- garde-robe : le personnage au centre
function drawWardrobeBg(g, ch) {
  const W2 = 440, H2 = 520;
  g.fillStyle = '#24160e'; g.fillRect(0, 0, W2, H2);
  g.fillStyle = 'rgba(0,0,0,.25)'; for (let x = 0; x < W2; x += 44) g.fillRect(x, 0, 3, H2);
  const lg = g.createRadialGradient(220, 40, 10, 220, 260, 330); lg.addColorStop(0, 'rgba(255,214,150,.55)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = lg; g.fillRect(0, 0, W2, H2);
  g.lineWidth = 6; g.strokeStyle = '#8a8a90'; g.beginPath(); g.moveTo(30, 64); g.lineTo(410, 64); g.stroke();
  const outfits = [['#c0392b', 60], ['#e8bf2e', 110], ['#f2efe6', 330], ['#d9c9a0', 380]];
  for (const [col, x] of outfits) { g.lineWidth = 3; g.strokeStyle = '#6a6a70'; g.beginPath(); g.moveTo(x, 64); g.lineTo(x, 80); g.moveTo(x - 22, 92); g.lineTo(x, 80); g.lineTo(x + 22, 92); g.stroke(); S(g, col, () => { g.moveTo(x - 24, 92); g.lineTo(x + 24, 92); g.lineTo(x + 32, 190); g.lineTo(x - 32, 190); g.closePath(); }, 3); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 32, 92, 64, 98); }
  g.fillStyle = '#3a2416'; g.fillRect(0, 470, W2, 50); g.strokeStyle = '#120c09'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 470); g.lineTo(W2, 470); g.stroke();
  const sp = g.createRadialGradient(220, 480, 10, 220, 480, 150); sp.addColorStop(0, 'rgba(255,220,160,.35)'); sp.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = sp; g.fillRect(60, 420, 320, 100);
  S(g, '#5a3a22', () => { g.moveTo(0, 0); g.lineTo(40, 20); g.lineTo(40, 500); g.lineTo(0, 520); g.closePath(); g.moveTo(440, 0); g.lineTo(400, 20); g.lineTo(400, 500); g.lineTo(440, 520); g.closePath(); }, 4);
  S(g, '#c9963a', () => { E(g, 30, 270, 5, 5); E(g, 410, 270, 5, 5); }, 2);
}
let wardIdx = Math.max(0, CHAR_KEYS.indexOf(Settings.char));
// accueil : le perso est dessiné une fois (cache), puis la scène vit : respiration, projecteur, poussières, répliques
const WARD_QUIPS = {
  pedro: ['¡Ay caramba !', 'Quelqu\'un a vu mon burrito ?', 'La salsa, ça soigne tout.'],
  fiona: ['…', 'Je fais la morte. Ça marche à chaque fois.', 'Pas un bruit.'],
  zeus: ['La nature reprend ses droits.', 'Respire… puis tire.', 'T\'inquiète, ça repousse.'],
  dobby: ['Trop lent !', 'Je suis déjà là.', 'Attrape-moi si tu peux.'],
  chewie: ['GRAAAOU !', 'Un câlin ? Non : un coup de poing.', 'J\'ai faim. De zombies.'],
  dragon: ['Ça va chauffer.', 'Un peu de feu ?', 'Tout brûle, tout s\'oublie.']
};
const wardAnim = { cache: null, key: null, t0: 0, raf: 0, q: 0, nextQ: 4 }; window.__ward = wardAnim;
function renderWardrobe() {
  const ch = CHARS[CHAR_KEYS[wardIdx]], key = CHAR_KEYS[wardIdx], cv = $('ward-cv');
  const c = wardAnim.cache || (wardAnim.cache = document.createElement('canvas')); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d');
  g.setTransform(cv.width / 440, 0, 0, cv.width / 440, 0, 0); g.clearRect(0, 0, 440, 520);
  const sc = key === 'dobby' ? 1.32 : key === 'chewie' ? 1.04 : 1.14;
  shadedFigure(g, c2 => { hero(key, c2, 220, 482, sc, { mood: key === 'fiona' ? 'deadpan' : key === 'dragon' ? 'determined' : 'happy', hand: PROP[key] }); drawAccessory(c2, key, currentAcc(key), 220, 482, sc); });
  if (wardAnim.key !== key) { wardAnim.t0 = performance.now(); wardAnim.key = key; wardAnim.nextQ = 2.5; const b = $('ward-bubble'); if (b) b.classList.remove('on'); }
  $('ward-name').textContent = ch.name; $('ward-role').textContent = CHAR_ROLE[key] || ''; $('ward-tag').textContent = ch.tag; $('ward-perk').textContent = ch.perk;
  wardFrame(performance.now()); wardPlay();
  if (ficheKey) renderFiche(); if (typeof refreshRoster === 'function' && document.querySelector('#chars .wc-lv')) refreshRoster();
  for (const b of document.querySelectorAll('#chars .char')) b.setAttribute('aria-pressed', b.dataset.char === key ? 'true' : 'false');
}
const wardVisible = () => game.state === 'title' && !document.hidden && !$('pane-lobby').hidden && !$('scr-title').classList.contains('page-open') && !$('scr-title').hidden;
function wardPlay() { if (!wardAnim.raf && wardVisible()) wardAnim.raf = requestAnimationFrame(wardLoop); }
function wardLoop(now) { wardAnim.raf = 0; if (!wardVisible()) return; if (now - (wardAnim.last || 0) > 32) { wardAnim.last = now; wardFrame(now); } wardAnim.raf = requestAnimationFrame(wardLoop); }
setInterval(wardPlay, 600);
function wardFrame(now) {
  const cv = $('ward-cv'), g = cv.getContext('2d'), k = cv.width / 440, A = wardAnim, t = now / 1000, e = (now - A.t0) / 1000, calm = !!Settings.calm;
  g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, 440, 520);
  const fl = calm ? 1 : 0.9 + 0.1 * Math.sin(t * 13) * Math.sin(t * 3.1) + (Math.sin(t * 0.7) > 0.985 ? -0.25 : 0); // le projecteur grésille
  const sp = g.createRadialGradient(220, 470, 10, 220, 470, 210); sp.addColorStop(0, `rgba(255,190,120,${0.42 * fl})`); sp.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = sp; g.beginPath(); g.ellipse(220, 478, 200, 46, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(226,121,47,.55)'; g.lineWidth = 2; g.beginPath(); g.ellipse(220, 482, 120, 22, 0, 0, TAU); g.stroke();
  // anneau en pointillés qui tourne au sol
  g.save(); g.strokeStyle = 'rgba(226,121,47,.35)'; g.lineWidth = 2; g.setLineDash([10, 14]); g.lineDashOffset = calm ? 0 : -t * 22; g.beginPath(); g.ellipse(220, 482, 160, 30, 0, 0, TAU); g.stroke(); g.restore();
  const cone = g.createLinearGradient(220, 0, 220, 480); cone.addColorStop(0, 'rgba(255,220,170,0)'); cone.addColorStop(1, `rgba(255,220,170,${0.12 * fl})`); g.fillStyle = cone; g.beginPath(); g.moveTo(170, 0); g.lineTo(270, 0); g.lineTo(360, 480); g.lineTo(80, 480); g.closePath(); g.fill();
  // poussières dans le faisceau
  if (!calm) for (let i = 0; i < 22; i++) { const u = ((i * 0.618 + t * (0.03 + (i % 5) * 0.008)) % 1), y = 470 - u * 470, half = 50 + (y / 480) * 90, x = 220 + Math.sin(i * 12.9 + t * 0.6 + u * 5) * half * 0.85; g.fillStyle = `rgba(255,230,190,${0.5 * Math.sin(u * Math.PI)})`; g.beginPath(); g.arc(x, y, 0.8 + (i % 3) * 0.6, 0, TAU); g.fill(); }
  // le perso : arrivée en petit saut, puis respiration et léger balancement autour des pieds
  if (A.cache) {
    const inT = Math.min(1, e / 0.45), drop = calm ? 0 : (1 - inT) * (1 - inT) * -60, squash = calm ? 0 : inT < 1 ? 0 : Math.max(0, 0.06 * (1 - (e - 0.45) / 0.18)) * (e < 0.63 ? 1 : 0);
    const br = calm ? 0 : Math.sin(t * 2.4) * 0.012, sw = calm ? 0 : Math.sin(t * 0.9) * 0.012, fx = 220 * k, fy = 482 * k;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = Math.min(1, e / 0.2); g.translate(fx, fy + drop * k); g.rotate(sw); g.scale(1 - br * 0.5 + squash, 1 + br - squash); g.translate(-fx, -fy); g.drawImage(A.cache, 0, 0); g.restore();
    if (!calm && e < 0.8 && e > 0.4) { const q = (e - 0.4) / 0.4; g.strokeStyle = `rgba(255,220,170,${0.5 * (1 - q)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(220, 484, 60 + q * 120, 10 + q * 22, 0, 0, TAU); g.stroke(); }
  }
  // une réplique de temps en temps
  const b = $('ward-bubble'); if (b && e > A.nextQ) { const L = WARD_QUIPS[A.key] || ['…']; b.textContent = L[A.q++ % L.length]; b.classList.add('on'); A.nextQ = e + 9 + Math.random() * 4; A.hideAt = e + 3.2; }
  if (b && A.hideAt && e > A.hideAt) { b.classList.remove('on'); A.hideAt = 0; }
}
const CHAR_ROLE = { pedro: 'Gourmand · soutien', fiona: 'Discrète · fantôme', zeus: 'Druide · régénération', dobby: 'Rapide · éclaireur', chewie: 'Costaud · mêlée', dragon: 'Pyromane · feu' };
const CHAR_STATS = {
  pedro: [['Santé', 0.62], ['Vitesse', 0.55], ['Mêlée', 0.5], ['Discrétion', 0.4], ['Soins', 0.95]],
  fiona: [['Santé', 0.55], ['Vitesse', 0.55], ['Mêlée', 0.45], ['Discrétion', 0.95], ['Endurance', 0.85]],
  zeus: [['Santé', 0.62], ['Vitesse', 0.5], ['Mêlée', 0.45], ['Discrétion', 0.45], ['Régénération', 0.95]],
  dobby: [['Santé', 0.45], ['Vitesse', 0.95], ['Mêlée', 0.35], ['Discrétion', 0.7], ['Agilité', 0.9]],
  chewie: [['Santé', 0.95], ['Vitesse', 0.45], ['Mêlée', 0.95], ['Discrétion', 0.25], ['Résistance', 0.85]],
  dragon: [['Santé', 0.6], ['Vitesse', 0.55], ['Mêlée', 0.5], ['Discrétion', 0.4], ['Feu', 0.95]]
};
function statBars(list) { return list.map(([n, v]) => `<li><span>${n}</span><i><b style="width:${Math.round(v * 100)}%"></b></i></li>`).join(''); }
var ficheKey = null, accPreview = null;
function drawCharStage(cv, key) {
  const g = cv.getContext('2d'); g.setTransform(cv.width / 440, 0, 0, cv.width / 440, 0, 0); g.clearRect(0, 0, 440, 520);
  const sp = g.createRadialGradient(220, 470, 10, 220, 470, 210); sp.addColorStop(0, 'rgba(255,190,120,.42)'); sp.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = sp; g.beginPath(); g.ellipse(220, 478, 200, 46, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(226,121,47,.55)'; g.lineWidth = 2; g.beginPath(); g.ellipse(220, 482, 120, 22, 0, 0, TAU); g.stroke();
  const sc = key === 'dobby' ? 1.32 : key === 'chewie' ? 1.04 : 1.14;
  shadedFigure(g, c => { hero(key, c, 220, 482, sc, { mood: key === 'fiona' ? 'deadpan' : key === 'dragon' ? 'determined' : 'happy', hand: PROP[key] }); drawAccessory(c, key, (cv.id === 'fiche-cv' && accPreview) || currentAcc(key), 220, 482, sc); });
}
const TEASER_CAP = { pedro: 'Salsa picante : une flaque de sauce qui enflamme la horde', fiona: 'La morte : les zombies passent à côté sans la voir', zeus: 'Foudre : l\'éclair saute de zombie en zombie', dobby: 'Transplanage : il disparaît et réapparaît derrière eux', chewie: 'Rugissement : une onde qui renverse tout le monde', dragon: 'Souffle : un cône de flammes droit devant' };
// teaser filmé avec le moteur du jeu : vue de dessus, vrais sprites, lampe torche, et la capacité en situation
const teaserScene = { key: null };
function teaserReset(key) {
  const T = teaserScene, ck = game.charKey; game.charKey = key; T.p = new Player(game, 70, 100); game.charKey = ck;
  T.p.char = key; T.p.aim = 0; T.key = key; T.z = [[250, 64], [290, 104], [262, 142], [330, 86], [320, 132]].map(([x, y]) => { const z = new Zombie(game, Math.random() < 0.3 ? 'runner' : 'walker', x, y, null); z.dir = Math.PI; z.alive = 1; z.fx = 0; return z; });
  T.blood = []; T.tracer = []; T.cycle = -1;
}
function drawTeaser(cv, key, t) {
  const T = teaserScene, D = 4.4, cyc = Math.floor(t / D), u = (t % D);
  if (T.key !== key || T.cycle !== cyc) { teaserReset(key); T.cycle = cyc; }
  const g = cv.getContext('2d'), k = cv.width / 320, p = T.p, TR = 1.3, e = u - TR; // e : temps depuis la capacité
  p.walkT += 0.05; p.muzzleT = 0;
  // les zombies avancent vers le joueur
  for (const z of T.z) { if (z.hitFlash > 0) z.hitFlash -= 0.016; if (!z.alive) continue; z.walkT += 0.08 * (z.type === 'runner' ? 1.6 : 1);
    if (key === 'fiona' && e > 0) { z.x -= 0.45; z.y += Math.sin(z.walkT * 0.3) * 0.3; z.dir = Math.PI + Math.sin(z.walkT * 0.2) * 0.4; continue; }
    if (z.fx <= 0) { const dx = p.x - z.x, dy = p.y - z.y, d = Math.hypot(dx, dy) || 1; if (d > 34) { const sp = (z.type === 'runner' ? 1.1 : 0.6) * (e > 0 ? 0.4 : 1); z.x += dx / d * sp; z.y += dy / d * sp; } z.dir = Math.atan2(dy, dx); } }
  // tir au pistolet avant la capacité
  if (e < 0 && Math.floor(u * 3) !== T.lastShot) { T.lastShot = Math.floor(u * 3); const tg = T.z.find(z => z.alive); if (tg) { p.aim = Math.atan2(tg.y - p.y, tg.x - p.x); p.muzzleT = 0.06; T.tracer.push({ x: tg.x, y: tg.y, t: 0.12 }); tg.hitFlash = 0.1; } }
  // la capacité
  const kill = (z, why) => { if (!z.alive) return; z.alive = 0; z.why = why; z.deadT = u; T.blood.push({ x: z.x, y: z.y, r: 7 + Math.random() * 5 }); };
  if (e > 0) {
    const live = T.z.filter(z => z.alive);
    if (key === 'pedro') for (const z of live) if (Math.hypot(z.x - p.x - 40, z.y - p.y) < 30 + e * 70) { z.burn = 1; if (e > 0.8 + (z.x % 7) / 10) kill(z, 'fire'); }
    if (key === 'zeus') live.slice(0, Math.floor(e * 6)).forEach((z, i) => { if (e > 0.25 + i * 0.12) kill(z, 'zap'); });
    if (key === 'dragon') for (const z of live) { if (z.x > p.x && Math.abs(z.y - p.y) < (z.x - p.x) * 0.55 + 10) { z.burn = 1; if (e > 0.6) kill(z, 'fire'); } }
    if (key === 'chewie') for (const z of live) { const dx = z.x - p.x, dy = z.y - p.y, d = Math.hypot(dx, dy) || 1; if (d < e * 260) { z.fx = 1; z.x += dx / d * Math.max(0, 3 - e * 2); z.y += dy / d * Math.max(0, 3 - e * 2); z.stun = 1; } }
    if (key === 'dobby') { if (e > 0.25 && !T.blinked) { T.blinked = 1; T.from = { x: p.x, y: p.y }; p.x = 340 - 40; p.y = 100; p.aim = Math.PI; for (const z of live) { z.fx = 1; z.stun = 1; } } if (e > 0.6) live.forEach((z, i) => { if (e > 0.6 + i * 0.15) { p.aim = Math.atan2(z.y - p.y, z.x - p.x); p.muzzleT = 0.06; T.tracer.push({ x: z.x, y: z.y, t: 0.1 }); kill(z, 'shot'); } }); }
    if (key === 'fiona') p.playDead = 2;
  } else { T.blinked = 0; p.playDead = 0; }
  // ---- rendu
  g.setTransform(k, 0, 0, k, 0, 0);
  g.fillStyle = '#26252a'; g.fillRect(0, 0, 320, 180);
  g.fillStyle = '#2d2c31'; for (let i = 0; i < 40; i++) g.fillRect((i * 83) % 320, (i * 47) % 180, 14, 9);
  g.fillStyle = 'rgba(230,220,190,.35)'; for (let x = -20; x < 340; x += 60) g.fillRect(x, 98, 34, 4);
  g.fillStyle = '#1a191d'; g.fillRect(0, 0, 320, 26); g.fillRect(0, 168, 320, 12); g.fillStyle = '#3a3238'; g.fillRect(0, 26, 320, 4);
  for (const bl of T.blood) { g.fillStyle = 'rgba(110,8,6,.8)'; g.beginPath(); g.ellipse(bl.x, bl.y + 2, bl.r * 1.5, bl.r, 0, 0, TAU); g.fill(); }
  if (key === 'pedro' && e > 0) { const r = Math.min(100, 20 + e * 90); const gr = g.createRadialGradient(p.x + 40, p.y, 4, p.x + 40, p.y, r); gr.addColorStop(0, 'rgba(210,40,15,.85)'); gr.addColorStop(1, 'rgba(160,20,10,.2)'); g.fillStyle = gr; g.beginPath(); g.ellipse(p.x + 40, p.y, r, r * 0.75, 0, 0, TAU); g.fill(); }
  // sprites du jeu, dessinés par le moteur
  const saved = ctx; ctx = g;
  try {
    const list = T.z.filter(z => z.alive || u - z.deadT < 0.3).sort((a, b) => a.y - b.y);
    for (const z of list) { g.save(); if (!z.alive) g.globalAlpha = Math.max(0, 1 - (u - z.deadT) / 0.3); if (z.stun) { g.translate(z.x, z.y); g.rotate(Math.sin(u * 20) * 0.08); g.translate(-z.x, -z.y); } game.drawZombie(z); g.restore(); }
    game.drawPlayer(p);
  } catch (er) { } ctx = saved;
  // obscurité + lampe torche
  const lc = teaserScene.lc || (teaserScene.lc = document.createElement('canvas')); lc.width = cv.width; lc.height = cv.height; const l = lc.getContext('2d'); l.setTransform(k, 0, 0, k, 0, 0);
  l.fillStyle = 'rgba(6,6,12,.82)'; l.fillRect(0, 0, 320, 180); l.globalCompositeOperation = 'destination-out';
  const halo = l.createRadialGradient(p.x, p.y, 4, p.x, p.y, 60); halo.addColorStop(0, 'rgba(0,0,0,.9)'); halo.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = halo; l.fillRect(0, 0, 320, 180);
  if (!(p.playDead > 0)) { const cone = l.createRadialGradient(p.x, p.y, 10, p.x, p.y, 260); cone.addColorStop(0, 'rgba(0,0,0,.95)'); cone.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = cone; l.beginPath(); l.moveTo(p.x, p.y); l.arc(p.x, p.y, 260, p.aim - 0.5, p.aim + 0.5); l.closePath(); l.fill(); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(lc, 0, 0); g.setTransform(k, 0, 0, k, 0, 0);
  // effets lumineux par-dessus
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const tr of T.tracer) { if (tr.t <= 0) continue; tr.t -= 0.016; g.strokeStyle = `rgba(255,220,150,${tr.t * 6})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(p.x + Math.cos(p.aim) * 18, p.y + Math.sin(p.aim) * 18); g.lineTo(tr.x, tr.y); g.stroke(); }
  for (const z of T.z) if (z.burn && (z.alive || u - z.deadT < 0.6)) for (let f = 0; f < 5; f++) { const fx = z.x + Math.sin(u * 30 + f * 2) * 6, fy = z.y - 4 - f * 3; g.fillStyle = f % 2 ? 'rgba(255,170,40,.6)' : 'rgba(255,80,20,.6)'; g.beginPath(); g.arc(fx, fy, 4 - f * 0.5, 0, TAU); g.fill(); }
  if (key === 'pedro' && e > 0) for (let i = 0; i < 18; i++) { const a = i * 2.4 + u * 3, r = (i * 13) % Math.min(100, 20 + e * 90); g.fillStyle = 'rgba(255,120,30,.35)'; g.beginPath(); g.arc(p.x + 40 + Math.cos(a) * r, p.y + Math.sin(a) * r * 0.75, 3 + (i % 3), 0, TAU); g.fill(); }
  if (key === 'zeus' && e > 0 && e < 1.4) { let px = p.x, py = p.y - 10; g.strokeStyle = '#cfeaff'; g.lineWidth = 2; g.shadowColor = '#6fc0ff'; g.shadowBlur = 12; g.beginPath(); g.moveTo(px, py); for (const z of T.z.filter(z => !z.alive && z.why === 'zap' || z.alive).slice(0, 1 + Math.floor(e * 5))) { for (let j = 1; j <= 4; j++) g.lineTo(px + (z.x - px) * j / 4 + (j < 4 ? rand(-6, 6) : 0), py + (z.y - py) * j / 4 + (j < 4 ? rand(-6, 6) : 0)); px = z.x; py = z.y; } g.stroke(); g.shadowBlur = 0; if (e < 0.15) { g.fillStyle = 'rgba(160,210,255,.25)'; g.fillRect(0, 0, 320, 180); } }
  if (key === 'dragon' && e > 0 && e < 1.6) { const len = Math.min(1, e * 3) * 230, gr = g.createRadialGradient(p.x, p.y, 10, p.x, p.y, len); gr.addColorStop(0, 'rgba(255,230,140,.85)'); gr.addColorStop(0.5, 'rgba(255,110,30,.55)'); gr.addColorStop(1, 'rgba(200,30,10,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(p.x + 10, p.y); g.arc(p.x, p.y, len, -0.5 + Math.sin(u * 20) * 0.03, 0.5); g.closePath(); g.fill(); }
  if (key === 'chewie' && e > 0 && e < 1.2) for (let j = 0; j < 2; j++) { const r = e * 260 - j * 30; if (r > 0) { g.strokeStyle = `rgba(255,230,180,${0.7 * (1 - r / 300)})`; g.lineWidth = 4; g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.stroke(); } }
  if (key === 'dobby' && e > 0) for (const pt of [T.from || p, T.blinked ? p : null]) { if (!pt) continue; const q = pt === p ? e - 0.25 : e; if (q > 0 && q < 0.7) { g.fillStyle = `rgba(200,200,220,${0.5 * (0.7 - q)})`; for (let j = 0; j < 8; j++) { const a = j / 8 * TAU; g.beginPath(); g.arc(pt.x + Math.cos(a) * q * 40, pt.y + Math.sin(a) * q * 30, 7, 0, TAU); g.fill(); } } }
  g.restore();
  for (const z of T.z) if (z.stun && z.alive) { g.fillStyle = '#ffd23a'; g.font = `10px ${FD}`; g.textAlign = 'center'; g.fillText('✦', z.x + Math.cos(u * 8) * 8, z.y - 26); }
  if (key === 'fiona' && e > 0) for (const z of T.z) { g.fillStyle = '#f4ead2'; g.font = `12px ${FD}`; g.textAlign = 'center'; g.fillText('?', z.x, z.y - 28); }
  // incrustations façon jeu
  if (e > 0 && e < 1.2) { const a = Math.min(1, (1.2 - e) * 3); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 140, 320, 26); g.fillStyle = '#ffd23a'; g.font = `15px ${FD}`; g.textAlign = 'center'; g.fillText(`${CHARS[key].spLong.toUpperCase()} !`, 160, 158); g.globalAlpha = 1; }
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, 320, 18); g.fillStyle = '#e0321f'; g.beginPath(); g.arc(10, 9, 4, 0, TAU); g.fill(); g.fillStyle = '#d8d2c4'; g.font = `10px ${FT}`; g.textAlign = 'left'; g.fillText('EN JEU · ' + CHARS[key].spLong.toUpperCase(), 19, 13);
  g.textAlign = 'right'; g.fillStyle = '#8b867b'; g.fillText(`touche ${KL('special')}`, 312, 13);
}
window.__teaser = { draw: (cv, k, t) => drawTeaser(cv, k, t), reset: () => { teaserScene.key = null; } };
let teaserRaf = 0;
function teaserLoop(now) { teaserRaf = 0; const cv = $('teaser-cv'); if (!ficheKey || $('fiche').hidden || game.state !== 'title' || $('pane-perso').hidden) return; drawTeaser(cv, ficheKey, now / 1000); teaserRaf = requestAnimationFrame(teaserLoop); }
function charLevel(ch) { return levelInfo(cstat(ch).xp); }
function renderFiche() {
  const key = ficheKey; if (!key) return; const ch = CHARS[key], cs = cstat(key), L = charLevel(key);
  drawCharStage($('fiche-cv'), key);
  $('pv-name').textContent = ch.full || ch.name; $('pv-desc').textContent = ch.tag; $('pv-sp').textContent = ch.spLong; $('pv-fetish').textContent = ch.fetish; $('pv-role').textContent = CHAR_ROLE[key]; $('ward-perk').textContent = ch.perk;
  $('pv-stats').innerHTML = statBars(CHAR_STATS[key]);
  $('fiche-lv').innerHTML = `<b>Niveau ${L.lv}</b><i><s style="width:${L.lv >= LEVEL_MAX ? 100 : Math.round(100 * L.into / L.need)}%"></s></i><small>${L.lv >= LEVEL_MAX ? 'Niveau maximum' : `${fmt(L.into)} / ${fmt(L.need)} XP avant le niveau ${L.lv + 1}`} · niveau du compte : ${playerLevel()}</small>`;
  const mins = Math.round(cs.time / 60);
  $('pv-record').innerHTML = [['Parties', cs.games], ['Victoires', cs.wins], ['Zombies abattus', fmt(cs.kills)], ['Meilleur score', fmt(cs.best)], ['Temps de jeu', mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60}` : `${mins} min`]].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
  const sel = key === game.charKey, b = $('fiche-pick'); b.textContent = sel ? `✓ ${ch.name} est en jeu` : `Jouer avec ${ch.name}`; b.disabled = sel;
  { const el = $('fin-pick'), cf = currentFinisher(key); el.innerHTML = FINISHERS.map(f => `<button type="button" class="btn sm" data-fin="${f.id}" aria-pressed="${cf.id === f.id}" ${finisherOk(f) ? '' : 'disabled'} title="${f.desc}">${finisherOk(f) ? '' : '🔒 '}${f.name}${finisherOk(f) ? '' : ` · ${f.need} succès`}</button>`).join('');
    for (const b of el.querySelectorAll('[data-fin]')) b.addEventListener('click', () => { (Settings.finBy || (Settings.finBy = {}))[key] = b.dataset.fin; Settings.save(); game.audio.ui(); renderFiche(); }); }
  $('teaser-cap').textContent = TEASER_CAP[key] || ''; if (!teaserRaf) teaserRaf = requestAnimationFrame(teaserLoop);
  renderAccPicker();
}
function refreshRoster() { for (const b of document.querySelectorAll('#chars .char')) { const k = b.dataset.char; b.querySelector('.wc-lv').textContent = `Niv. ${charLevel(k).lv}`; b.querySelector('.wc-sel').textContent = k === game.charKey ? '✓ En jeu' : ''; } }
function openFiche(key) { ficheKey = key; accPreview = null; $('roster').hidden = true; $('fiche').hidden = false; renderFiche(); $('scr-title').querySelector('#pane-perso').scrollTop = 0; requestAnimationFrame(() => { const b = $('fiche-back'); b.focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo(b); }); }
function closeFiche() { if ($('fiche').hidden) return false; const k = ficheKey; ficheKey = null; $('fiche').hidden = true; $('roster').hidden = false; refreshRoster(); const b = document.querySelector(`#chars .char[data-char="${k}"]`); if (b) { b.focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo(b); } return true; }
$('fiche-back').addEventListener('click', () => { game.audio.ui(); closeFiche(); });
function ficheStep(d) { if (!ficheKey) return; game.audio.ui(); const i = CHAR_KEYS.indexOf(ficheKey); ficheKey = CHAR_KEYS[(i + d + CHAR_KEYS.length) % CHAR_KEYS.length]; accPreview = null; teaserScene.key = null; renderFiche(); }
$('fiche-prev').addEventListener('click', () => ficheStep(-1)); $('fiche-next').addEventListener('click', () => ficheStep(1));
addEventListener('keydown', e => { if (game.state !== 'title' || !ficheKey || $('fiche').hidden || $('pane-perso').hidden || game.keysOpen) return; if (e.key === 'ArrowLeft') { ficheStep(-1); e.preventDefault(); } else if (e.key === 'ArrowRight') { ficheStep(1); e.preventDefault(); } });
$('fiche-pick').addEventListener('click', () => { game.audio.ui(); setWard(CHAR_KEYS.indexOf(ficheKey)); renderFiche(); });
function setWard(i) { wardIdx = (i + CHAR_KEYS.length) % CHAR_KEYS.length; const ch = CHAR_KEYS[wardIdx]; Settings.char = game.charKey = ch; Settings.save(); renderWardrobe(); }
$('chars').innerHTML = CHAR_KEYS.map((k, i) => `<button type="button" class="char wcard" data-char="${k}" aria-pressed="false" aria-label="${CHARS[k].name}"><span class="wc-kind">${CHAR_ROLE[k].split(' · ')[0]}</span><span class="wc-pips" aria-hidden="true"><i></i><i></i><i></i></span><canvas width="240" height="240" aria-hidden="true"></canvas><b>${CHARS[k].name}</b><span class="wc-foot">${CHARS[k].spLong}</span><span class="wc-lv"></span><span class="wc-sel"></span></button>`).join('');
for (const b of document.querySelectorAll('#chars .char')) {
  const cv = b.querySelector('canvas'); renderHead(cv, b.dataset.char); fontsReady.then(() => renderHead(cv, b.dataset.char));
  b.addEventListener('click', () => { game.audio.init(); game.audio.ui(); openFiche(b.dataset.char); });
}
refreshRoster();
