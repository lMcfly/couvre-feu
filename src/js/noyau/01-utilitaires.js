'use strict';
(() => {
// ============================================================ utilitaires
const TAU = Math.PI * 2;
// ajoute des méthodes à une classe depuis un autre fichier (comme si elles étaient écrites dans la classe) ; refuse d'en écraser une existante
function mixin(C, methods) {
  for (const k of Object.keys(methods)) {
    if (Object.prototype.hasOwnProperty.call(C.prototype, k)) throw new Error(`mixin : ${C.name}.${k} est défini deux fois`);
    Object.defineProperty(C.prototype, k, { value: methods[k], writable: true, configurable: true, enumerable: false });
  }
}
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rayRect(ox, oy, dx, dy, o, maxT) {
  let tmin = 0, tmax = maxT;
  if (Math.abs(dx) < 1e-9) { if (ox < o.x || ox > o.x + o.w) return Infinity; }
  else { let t1 = (o.x - ox) / dx, t2 = (o.x + o.w - ox) / dx; if (t1 > t2) { const s = t1; t1 = t2; t2 = s; } if (t1 > tmin) tmin = t1; if (t2 < tmax) tmax = t2; if (tmin > tmax) return Infinity; }
  if (Math.abs(dy) < 1e-9) { if (oy < o.y || oy > o.y + o.h) return Infinity; }
  else { let t1 = (o.y - oy) / dy, t2 = (o.y + o.h - oy) / dy; if (t1 > t2) { const s = t1; t1 = t2; t2 = s; } if (t1 > tmin) tmin = t1; if (t2 < tmax) tmax = t2; if (tmin > tmax) return Infinity; }
  return tmin > 0 ? tmin : Infinity;
}
const rectDist = (x, y, o) => { const dx = Math.max(o.x - x, 0, x - (o.x + o.w)), dy = Math.max(o.y - y, 0, y - (o.y + o.h)); return Math.hypot(dx, dy); };
function compact(arr) { let j = 0; for (let i = 0; i < arr.length; i++) { const e = arr[i]; if (!e.dead) arr[j++] = e; } arr.length = j; }
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } return `rgb(${r | 0},${g | 0},${b | 0})`; }
const fmt = n => Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtTime = s => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const FD = '"Saira Stencil One", Impact, sans-serif';
const FT = '"Special Elite", "Courier New", monospace';

