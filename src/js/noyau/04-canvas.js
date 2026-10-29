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

