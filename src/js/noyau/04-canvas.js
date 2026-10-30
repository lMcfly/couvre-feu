// ============================================================ canvas
const $ = id => document.getElementById(id);
const canvas = $('game'); let ctx = canvas.getContext('2d'); // let : le teaser des fiches emprunte le moteur de dessin
const lightCanvas = document.createElement('canvas'), lctx = lightCanvas.getContext('2d');
let RW = 0, RH = 0, W = 0, H = 0, DPR = 1, VS = 1, dprCap = 2, SAFE = { l: 0, r: 0, t: 0, b: 0 }; // dprCap : baissé automatiquement si l'appareil n'arrive pas à suivre
let TOUCH = false; try { TOUCH = matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches; } catch (e) { }
const STICK_R = 58;
let LD = 2; // diviseur de résolution du calque de lumière
// vignettes précalculées une fois, étirées à l'écran (évite un dégradé plein écran par image)
function makeVignette(rgb, a0, a1) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 60, 128, 128, 182); gr.addColorStop(0, `rgba(${rgb},${a0})`); gr.addColorStop(1, `rgba(${rgb},${a1})`); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return c; }
const VIG = makeVignette('0,0,0', 0, 0.7), VIG_RED = makeVignette('150,8,4', 0, 1);
// zones sûres (encoche, barre d'accueil des iPhone) lues depuis le CSS
function readSafe() { let el = document.getElementById('safe-probe'); if (!el) { el = document.createElement('div'); el.id = 'safe-probe'; el.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)'; document.body.appendChild(el); } const cs = getComputedStyle(el); SAFE = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  // en paysage, iOS réserve la même marge des deux côtés alors que l'encoche (ou la Dynamic Island) n'est que d'un côté : on rend la place de l'autre
  if (SAFE.l > 30 && SAFE.r > 30 && Math.abs(SAFE.l - SAFE.r) < 4) { const o = typeof window.orientation === 'number' ? (window.orientation + 360) % 360 : screen.orientation && typeof screen.orientation.angle === 'number' ? screen.orientation.angle : 0; if (o === 90) SAFE.r = 16; else if (o === 270) SAFE.l = 16; } }
function resize() { readSafe(); if (Settings.quality === 'eco') dprCap = 1; else if (Settings.quality === 'high') dprCap = 2;
  DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, dprCap)); LD = TOUCH ? 3 : 2;
  const cw = window.innerWidth, ch = window.innerHeight; RW = cw; RH = ch;
  W = Math.max(1, Math.floor(cw * DPR)); H = Math.max(1, Math.floor(ch * DPR));
  canvas.width = W; canvas.height = H;
  lightCanvas.width = Math.ceil(W / LD); lightCanvas.height = Math.ceil(H / LD);
  VS = clamp(Math.min(cw / (TOUCH ? 900 : 1250), ch / (TOUCH ? 500 : 720)), 0.45, 2.2);
  document.documentElement.classList.toggle('touch', TOUCH);
  applyUiScale();
}
// taille de l'interface : ajustée à l'écran, puis au choix du joueur
const UI_SIZES = { petite: ['Petite', 0.86], normale: ['Normale', 1], grande: ['Grande', 1.16] };
let HUDK = 1;
function applyUiScale() {
  const fit = clamp(Math.min(innerWidth / 1280, innerHeight / 740), 0.7, 1.22), m = (UI_SIZES[Settings.ui] || UI_SIZES.normale)[1];
  HUDK = TOUCH ? clamp(0.9 * m * clamp(innerHeight / 412, 0.9, 1.3), 0.75, 1.3) : clamp(fit * m, 0.6, 1.4);
  document.documentElement.style.setProperty('--ui', clamp(fit * m, 0.62, 1.3).toFixed(3));
}
window.addEventListener('resize', resize); resize();
// iPhone : après une rotation, la taille et les marges de l'écran arrivent en retard ; on revérifie plusieurs fois
function resizeSoon() { resize(); for (const t of [120, 400, 900]) setTimeout(resize, t); }
window.addEventListener('orientationchange', resizeSoon); try { screen.orientation && screen.orientation.addEventListener('change', resizeSoon); } catch (e) { }
if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (innerWidth !== RW || innerHeight !== RH) resizeSoon(); });
// après le clavier (nom, code de salle), iOS laisse la page décalée : les touches ne tombaient plus sous les doigts
function unshift() { const a = document.activeElement; if (a && a.tagName === 'INPUT' && a.type !== 'checkbox' && a.type !== 'range') return; if (scrollX || scrollY || document.documentElement.scrollTop || document.body.scrollTop) { scrollTo(0, 0); document.documentElement.scrollTop = document.body.scrollTop = 0; } }
document.addEventListener('focusout', () => setTimeout(() => { unshift(); resizeSoon(); }, 80));
window.addEventListener('scroll', () => { if (!document.activeElement || document.activeElement.tagName !== 'INPUT') unshift(); }, { passive: true });

// ============================================================ hachage spatial
class SpatialHash {
  constructor(cell) { this.cell = cell; this.map = new Map(); this.pool = []; }
  clear() { for (const a of this.map.values()) { a.length = 0; this.pool.push(a); } this.map.clear(); }
  insert(e) { const k = (Math.floor(e.x / this.cell) + 64) * 8192 + (Math.floor(e.y / this.cell) + 64); let a = this.map.get(k); if (!a) { a = this.pool.pop() || []; this.map.set(k, a); } a.push(e); }
  query(x, y, r, out) {
    out = out || []; out.length = 0; const c = this.cell;
    const x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c), y0 = Math.floor((y - r) / c), y1 = Math.floor((y + r) / c);
    for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) { const a = this.map.get((i + 64) * 8192 + (j + 64)); if (a) for (let n = 0; n < a.length; n++) out.push(a[n]); }
    return out;
  }
}

// titres façon affiche de film d'horreur : lettres épaisses rouge sang, contour noir, bords rongés et salis (rendus une fois puis gardés)
const TITLE_CACHE = new Map();
function grungeTitle(c, t, x, y, fs, o = {}) {
  const sc = Math.max(1, Math.min(3, Math.hypot(c.getTransform().a, c.getTransform().b))), key = `${t}|${Math.round(fs * sc)}|${o.rage ? 1 : 0}`;
  let e = TITLE_CACHE.get(key);
  if (!e) {
    const F = fs * sc, font = `${F}px ${FH}`, m = document.createElement('canvas').getContext('2d'); m.font = font;
    const tw = m.measureText(t).width, cv = document.createElement('canvas'); cv.width = Math.ceil(tw + F * 0.5); cv.height = Math.ceil(F * 1.55);
    const g = cv.getContext('2d'), bx = F * 0.25, by = F * 1.18; let h = 7; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const r = mulberry32(h);
    g.font = font; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
    g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = F * 0.18; g.shadowOffsetY = F * 0.06; g.lineWidth = F * 0.08; g.strokeStyle = '#140202'; g.strokeText(t, bx, by); g.shadowColor = 'transparent';
    const gr = g.createLinearGradient(0, by - F * 0.9, 0, by + F * 0.04), S = o.rage ? ['#ffb04a', '#ff5a1e', '#c4140c', '#5a0404'] : ['#ff6a3a', '#e8261a', '#a8110b', '#4e0404'];
    S.forEach((col, k) => gr.addColorStop([0, 0.36, 0.7, 1][k], col)); g.fillStyle = gr; g.fillText(t, bx, by);
    g.globalCompositeOperation = 'source-atop';
    for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(30,0,0,${0.06 + r() * 0.12})`; g.beginPath(); g.ellipse(r() * cv.width, by - r() * F, F * (0.2 + r() * 0.5), F * (0.015 + r() * 0.04), (r() - 0.5) * 0.3, 0, TAU); g.fill(); } /* traînées de crasse */
    g.strokeStyle = 'rgba(255,170,130,.18)'; g.lineWidth = Math.max(1, F * 0.012); for (let k = 0; k < 10; k++) { const sx = r() * cv.width, sy = by - r() * F * 0.85; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (r() - 0.5) * F * 0.5, sy + (r() - 0.3) * F * 0.2); g.stroke(); }
    g.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < tw / F * 70; k++) { const px = bx + r() * tw, py = by - r() * F * 0.95, rr = F * (r() < 0.85 ? 0.006 + r() * 0.018 : 0.03 + r() * 0.04); g.globalAlpha = 0.5 + r() * 0.5; g.beginPath(); g.arc(px, py, rr, 0, TAU); g.fill(); }
    g.globalAlpha = 0.7; g.lineWidth = Math.max(1, F * 0.01); for (let k = 0; k < tw / F * 5; k++) { const sx = bx + r() * tw, sy = by - r() * F; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (r() - 0.5) * F * 0.4, sy + r() * F * 0.12); g.stroke(); }
    e = { cv, sc, ox: bx / sc, oy: by / sc, w: tw / sc };
    if (!document.fonts || document.fonts.check(`20px ${FH}`)) { TITLE_CACHE.set(key, e); if (TITLE_CACHE.size > 120) TITLE_CACHE.delete(TITLE_CACHE.keys().next().value); } /* police pas encore chargée : on ne garde pas le brouillon */
  }
  const dx = c.textAlign === 'center' ? -e.w / 2 : c.textAlign === 'right' ? -e.w : 0;
  c.drawImage(e.cv, x + dx - e.ox, y - e.oy, e.cv.width / e.sc, e.cv.height / e.sc);
}
// textures de l'interface, fabriquées au lancement : usure pour les titres, métal sale et éclaboussures pour les panneaux
(function uiTextures() {
  try {
    const mk = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return [cv, cv.getContext('2d')]; }, r = mulberry32(4242);
    const [a, ga] = mk(256, 256); ga.fillStyle = '#fff'; ga.fillRect(0, 0, 256, 256); ga.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 900; k++) { ga.globalAlpha = 0.4 + r() * 0.6; ga.beginPath(); ga.arc(r() * 256, r() * 256, r() < 0.9 ? 0.5 + r() * 1.3 : 2 + r() * 3, 0, TAU); ga.fill(); }
    ga.lineWidth = 1; for (let k = 0; k < 40; k++) { const x = r() * 256, y = r() * 256; ga.globalAlpha = 0.5; ga.beginPath(); ga.moveTo(x, y); ga.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 10); ga.stroke(); }
    const [b, gb] = mk(512, 512);
    for (let k = 0; k < 5000; k++) { gb.fillStyle = r() < 0.5 ? `rgba(0,0,0,${r() * 0.22})` : `rgba(255,235,210,${r() * 0.035})`; gb.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2); }
    gb.strokeStyle = 'rgba(255,240,220,.05)'; for (let k = 0; k < 70; k++) { const x = r() * 512, y = r() * 512; gb.lineWidth = 0.5 + r(); gb.beginPath(); gb.moveTo(x, y); gb.lineTo(x + (r() - 0.5) * 120, y + (r() - 0.5) * 30); gb.stroke(); }
    for (let s = 0; s < 3; s++) { const cx = r() * 512, cy = r() * 512, R = 30 + r() * 50; // éclaboussure : une tache, des gouttes projetées, des traînées
      gb.fillStyle = 'rgba(105,8,6,.42)'; gb.beginPath(); for (let k = 0; k <= 24; k++) { const an = k / 24 * TAU, rr = R * (0.55 + r() * 0.45); k ? gb.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr) : gb.moveTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } gb.fill();
      for (let k = 0; k < 60; k++) { const an = r() * TAU, d = R * (0.9 + r() * 2.2); gb.fillStyle = `rgba(${90 + r() * 40},6,5,${0.25 + r() * 0.35})`; gb.beginPath(); gb.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d, r() * 3 + 0.5, 0, TAU); gb.fill(); }
      for (let k = 0; k < 3; k++) { const x = cx + (r() - 0.5) * R, len = 30 + r() * 90; const gr = gb.createLinearGradient(0, cy, 0, cy + len); gr.addColorStop(0, 'rgba(105,8,6,.4)'); gr.addColorStop(1, 'rgba(105,8,6,0)'); gb.fillStyle = gr; gb.fillRect(x, cy, 2 + r() * 3, len); } }
    const R = document.documentElement.style; R.setProperty('--grunge', `url(${a.toDataURL()})`); R.setProperty('--grime', `url(${b.toDataURL()})`);
  } catch (e) { }
})();
