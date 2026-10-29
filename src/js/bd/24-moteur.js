// ============================================================ BD : cases dessinées à la volée sur canvas (480×360)
const INK = '#151213';
// duo : un allié à terre revient en fin de manche, ou avant si son partenaire reste 4 s dans son cercle (une fois par manche)
const REVIVE_T = 4, REVIVE_R = 75;
// accessibilité : danger (rouge → orange vif) et toxique (vert → bleu) quand le mode daltonien est actif
const DZ = () => Settings.cb ? '255,150,0' : '224,50,31', TOX = () => Settings.cb ? '90,170,255' : '120,230,150', ACID = () => Settings.cb ? '#6ab8ff' : '#9cff5a';
function drawPumpkin(c, x, y, s, t, head) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (!head) { c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(0, 9, 14, 5, 0, 0, TAU); c.fill(); }
  for (const [dx, w, col] of [[-6, 7, '#c85a0c'], [6, 7, '#c85a0c'], [0, 8, '#e8761c']]) { c.fillStyle = col; c.beginPath(); c.ellipse(dx, -2, w, 10, 0, 0, TAU); c.fill(); }
  c.strokeStyle = 'rgba(90,30,0,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-3, -11); c.quadraticCurveTo(-5, -2, -3, 7); c.moveTo(3, -11); c.quadraticCurveTo(5, -2, 3, 7); c.stroke();
  c.fillStyle = '#3d5a1c'; c.fillRect(-1.5, -15, 3, 5);
  const gl = 0.75 + Math.sin(t * 9) * 0.15 + Math.random() * 0.1; c.fillStyle = `rgba(255,${190 + Math.round(gl * 40)},70,${gl})`;
  c.beginPath(); c.moveTo(-7, -5); c.lineTo(-2, -5); c.lineTo(-4.5, -9); c.moveTo(2, -5); c.lineTo(7, -5); c.lineTo(4.5, -9); c.fill();
  c.beginPath(); c.moveTo(-7, 1); c.lineTo(7, 1); c.lineTo(5, 5); c.lineTo(2.5, 3); c.lineTo(0, 5.5); c.lineTo(-2.5, 3); c.lineTo(-5, 5); c.closePath(); c.fill();
  c.restore();
}
function drawCostume(c, k, hx, hy, r, t) {
  if (k === 'casquette') { c.fillStyle = '#1c2a48'; c.beginPath(); c.ellipse(hx, hy - r * 0.32, r * 0.56, r * 0.3, 0, Math.PI, TAU); c.fill(); c.fillRect(hx - r * 0.56, hy - r * 0.36, r * 1.12, r * 0.12); c.fillStyle = '#d0a020'; c.fillRect(hx - r * 0.5, hy - r * 0.44, r, r * 0.08); c.fillStyle = '#10182c'; c.beginPath(); c.ellipse(hx + r * 0.3, hy - r * 0.28, r * 0.36, r * 0.1, 0, 0, TAU); c.fill(); return; }
  if (k === 'citrouille') { c.save(); c.translate(hx, hy); const s = r / 13 * 0.62; c.scale(s * 1.6, s * 1.6); c.translate(0, 2); drawPumpkin(c, 0, 0, 1, t, true); c.restore(); return; }
  if (k === 'sorciere') { c.fillStyle = '#1c1424'; c.beginPath(); c.ellipse(hx, hy - r * 0.38, r * 0.85, r * 0.24, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(hx - r * 0.45, hy - r * 0.42); c.lineTo(hx + r * 0.25 + Math.sin(t * 0.5) * 2, hy - r * 1.55); c.lineTo(hx + r * 0.45, hy - r * 0.42); c.fill(); c.fillStyle = '#7a3ab0'; c.fillRect(hx - r * 0.42, hy - r * 0.58, r * 0.84, r * 0.14); return; }
  if (k === 'drap') {
    c.fillStyle = 'rgba(236,236,228,.95)'; c.beginPath(); c.moveTo(hx - r * 0.55, hy); c.quadraticCurveTo(hx - r * 0.6, hy - r * 0.62, hx, hy - r * 0.62); c.quadraticCurveTo(hx + r * 0.6, hy - r * 0.62, hx + r * 0.55, hy);
    c.lineTo(r * 0.95, -r * 0.35); for (let i = 0; i <= 6; i++) { const x = r * 0.95 - i * r * 0.317; c.lineTo(x, -r * 0.35 + (i % 2 ? -r * 0.18 : 0) + Math.sin(t + i) * 1.5); } c.closePath(); c.fill();
    c.fillStyle = '#141014'; c.beginPath(); c.ellipse(hx - r * 0.2, hy - r * 0.08, r * 0.1, r * 0.15, 0, 0, TAU); c.ellipse(hx + r * 0.2, hy - r * 0.08, r * 0.1, r * 0.15, 0, 0, TAU); c.fill();
  }
}
function S(g, fill, build, lw = 4) { g.beginPath(); build(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
const E = (g, x, y, rx, ry, r = 0) => { g.moveTo(x + rx * Math.cos(r), y + rx * Math.sin(r)); g.ellipse(x, y, rx, ry, r, 0, TAU); };
function wrapLines(c, text, maxW) { const words = text.split(' '), out = []; let line = ''; for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; }
function fitText(c, t, maxW) { if (c.measureText(t).width <= maxW) return t; while (t.length > 1 && c.measureText(t + '…').width > maxW) t = t.slice(0, -1); return t + '…'; }
const RR = (g, x, y, w, h, r = 6) => { if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
function armLine(g, x1, y1, x2, y2, col) { g.lineCap = 'round'; g.lineWidth = 26; g.strokeStyle = INK; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.lineWidth = 19; g.strokeStyle = col; g.stroke(); }
let HT = null;
function halftone(g) {
  if (!HT) { const c = document.createElement('canvas'); c.width = c.height = 7; const x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.6)'; x.beginPath(); x.arc(3.5, 3.5, 1.3, 0, TAU); x.fill(); HT = c; }
  g.save(); g.globalAlpha = 0.16; g.fillStyle = g.createPattern(HT, 'repeat'); g.fillRect(0, 0, 480, 360); g.restore();
  const v = g.createRadialGradient(240, 180, 150, 240, 180, 330); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = v; g.fillRect(0, 0, 480, 360);
}
function sfx(g, text, x, y, size, rot = -0.08, fill = '#ffd23a') { g.save(); g.translate(x, y); g.rotate(rot); g.font = `${size}px Bangers, Impact, sans-serif`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = size * 0.2; g.strokeStyle = INK; g.strokeText(text, 0, 0); g.fillStyle = fill; g.fillText(text, 0, 0); g.restore(); }
function speedBg(g, col) { g.fillStyle = col; g.fillRect(0, 0, 480, 360); g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 52; i++) { const a = i / 52 * TAU; g.moveTo(240 + Math.cos(a) * 60, 170 + Math.sin(a) * 60); g.lineTo(240 + Math.cos(a) * 420, 170 + Math.sin(a) * 420); } g.stroke(); }
function rain(g, r, a = 0.28) { g.strokeStyle = `rgba(190,205,255,${a})`; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < 60; i++) { const x = r() * 490, y = r() * 360; g.moveTo(x, y); g.lineTo(x - 6, y + 18); } g.stroke(); }
function glowAt(g, x, y, r, col) { const gr = g.createRadialGradient(x, y, 4, x, y, r); gr.addColorStop(0, `rgba(${col},.55)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
