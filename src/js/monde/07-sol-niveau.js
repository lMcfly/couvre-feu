// ============================================================ sol : tuiles peintes une fois, sang et corps cuits dedans
const CH = 512, GS = 0.7;
class Ground {
  constructor(level) { this.level = level; this.chunks = new Map(); }
  get(cx, cy) {
    const k = cx * 1000 + cy; let c = this.chunks.get(k);
    if (!c) {
      c = document.createElement('canvas'); c.width = c.height = Math.ceil(CH * GS);
      const g = c.getContext('2d'); g.setTransform(GS, 0, 0, GS, -cx * CH * GS, -cy * CH * GS);
      this.level.paintGround(g, cx * CH, cy * CH, CH, CH, cx, cy); c.g = g; this.chunks.set(k, c);
    }
    return c;
  }
  valid(cx, cy) { return cx >= 0 && cy >= 0 && cx * CH < WORLD.w && cy * CH < WORLD.h; }
  draw(ctx, x0, y0, x1, y1) {
    for (let cx = Math.floor(x0 / CH); cx <= Math.floor(x1 / CH); cx++) for (let cy = Math.floor(y0 / CH); cy <= Math.floor(y1 / CH); cy++) {
      if (!this.valid(cx, cy)) continue; ctx.drawImage(this.get(cx, cy), cx * CH, cy * CH, CH + 1, CH + 1);
    }
  }
  decal(x, y, r, fn) {
    for (let cx = Math.floor((x - r) / CH); cx <= Math.floor((x + r) / CH); cx++) for (let cy = Math.floor((y - r) / CH); cy <= Math.floor((y + r) / CH); cy++) {
      if (!this.valid(cx, cy)) continue; const c = this.get(cx, cy); c.g.save(); fn(c.g); c.g.restore();
    }
  }
}

// ============================================================ niveau
class Level {
  constructor(g) {
    this.g = g; this.obstacles = []; this.lamps = []; this.spawners = []; this.chests = []; this.fixedLights = []; this.obj = []; this.gates = {}; this.stamp = 0;
    this.buildStatic(); for (let k = 0; k < 4; k++) this.buildZone(k);
    if (HALLOWEEN) this.addPumpkins();
    this.rebuildGrid(); this.ground = new Ground(this);
  }
  // Halloween : les barils deviennent des citrouilles, et quelques citrouilles en plus dans chaque secteur
  addPumpkins() {
    const r = mulberry32(3110 + (this.g.seedOff || 0)), light = (o, k) => { o.light = { x: o.x + 11, y: o.y + 8, r: 80, c: '255,140,40', i: 0.32, flick: 2, zone: k }; this.fixedLights.push(o.light); };
    for (const o of this.obstacles) if (o.kind === 'barrel') { o.pumpkin = true; light(o, o.zone); }
    for (let k = 0; k < 4; k++) { const Z = ZONES[k]; let n = 0;
      for (let t = 0; t < 80 && n < (k === 3 ? 3 : 6); t++) {
        const x = Math.round(Z.x0 + 200 + r() * (Z.x1 - Z.x0 - 400)), y = Math.round(260 + r() * 700);
        if (y < 740 && y + 22 > 460 && (x < Z.x0 + 260 || x > Z.x1 - 260)) continue;
        if (this.obstacles.some(o => o.kind !== 'building' && x < o.x + o.w + 30 && x + 22 + 30 > o.x && y < o.y + o.h + 30 && y + 22 + 30 > o.y)) continue;
        const o = this.add({ x, y, w: 22, h: 22, z: 22, kind: 'barrel', hp: 20, pumpkin: true, zone: k }); light(o, k); n++;
      } }
  }
  add(o) { if (o.z == null) o.z = 40; if (o.hp == null) o.hp = Infinity; if (o.oid == null) o.oid = (this._oid = (this._oid || 0) + 1); this.obstacles.push(o); return o; }
  buildStatic() {
    const r = mulberry32(77);
    let x = -60;
    while (x < WORLD.w + 60) { const w = Math.round(170 + r() * 210); this.add({ x, y: 0, w, h: ST, z: Math.round(84 + r() * 56), kind: 'building', zone: -1, hue: r(), doors: [], seed: Math.floor(r() * 1e6), lit: [] }); x += w; }
    for (const b of this.obstacles) { const rr = mulberry32(b.seed); const cols = Math.floor((b.w - 20) / 46), rows = Math.floor((b.z - 40) / 34); for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (rr() < 0.06) b.lit.push([i, j, rr()]); }
    this.add({ x: -60, y: SB, w: WORLD.w + 120, h: 22, z: 18, kind: 'parapet', zone: -1 });
    this.add({ x: -60, y: ST, w: 60, h: SB - ST, z: 80, kind: 'wall', zone: -1 });
    this.add({ x: WORLD.w, y: ST, w: 60, h: SB - ST, z: 80, kind: 'wall', zone: -1 });
    for (const b of BOUNDS) {
      this.add({ x: b - 12, y: ST, w: 24, h: 520 - ST, z: 70, kind: 'wall', zone: -1 });
      this.add({ x: b - 12, y: 680, w: 24, h: SB - 680, z: 70, kind: 'wall', zone: -1 });
      const open = SAFES.some(sf => sf.x1 === b);
      this.gates[b] = { x: b - 12, y: 520, w: 24, h: 160, z: 70, kind: 'gate', zone: -1, closed: !open, hp: Infinity };
      if (!open) this.obstacles.push(this.gates[b]);
    }
    SAFES.forEach(s => {
      this.add({ x: s.x0 + 120, y: ST + 6, w: 110, h: 40, z: 56, kind: 'shop', zone: -1 });
      this.add({ x: s.x1 - 180, y: SB - 64, w: 120, h: 36, z: 24, kind: 'sandbags', zone: -1 });
      this.add({ x: s.x0 + 60, y: SB - 110, w: 70, h: 40, z: 22, kind: 'cot', zone: -1 });
      this.fixedLights.push({ x: (s.x0 + s.x1) / 2, y: 600, r: 460, c: '255,190,120', i: 0.8, flick: 1 });
      this.fixedLights.push({ x: s.x0 + 175, y: 240, r: 220, c: '120,255,170', i: 0.4, flick: 0 });
    });
  }
  buildZone(k) {
    const Z = ZONES[k], g = this.g, r = mulberry32(1000 + k * 31 + (g.seedOff || 0));
    const add = o => { o.zone = k; return this.add(o); };
    const reserved = [];
    const overlaps = (x, y, w, h, o, pad) => x < o.x + o.w + pad && x + w + pad > o.x && y < o.y + o.h + pad && y + h + pad > o.y;
    const free = (x, y, w, h, pad = 36) => {
      if ((x < Z.x0 + 170 || x + w > Z.x1 - 170) && y < 730 && y + h > 470) return false;
      if (k === 0 && x < 380 && y < 760 && y + h > 440) return false;
      for (const o of this.obstacles) if ((o.zone === k || o.zone === -1) && o.kind !== 'building' && o.kind !== 'parapet' && overlaps(x, y, w, h, o, pad)) return false;
      for (const o of reserved) if (overlaps(x, y, w, h, o, pad)) return false;
      return true;
    };
    const place = (w, h, tries, yMin, yMax, fn, pad) => {
      for (let t = 0; t < tries; t++) { const x = Z.x0 + 120 + r() * (Z.x1 - Z.x0 - 240 - w), y = yMin + r() * (yMax - yMin - h); if (free(x, y, w, h, pad)) return fn(Math.round(x), Math.round(y)); }
      return null;
    };
    const car = (x, y, w, h, expl) => add({ x, y, w, h, z: 24, kind: 'car', hp: 170, maxHp: 170, explosive: expl, color: CAR_COLORS[Math.floor(r() * CAR_COLORS.length)], alarm: 0, alarmCd: 0, wreck: false, burning: 0, hor: w > h });
    const pickup = (kind, x, y, val) => { const p = new Pickup(g, kind, x, y, val); p.zone = k; p.life = Infinity; p.vx = p.vy = 0; g.pickups.push(p); reserved.push({ x: x - 30, y: y - 30, w: 60, h: 60 }); };

    // objectif de la zone
    if (k === 0) { this.obj[0] = { type: 'fetch', x: Z.x0 + 2250, y: 214, done: false }; pickup('key', Z.x0 + 2250, 214, 0); pickup('weapon', Z.x0 + 1360, 990, 1); }
    if (k === 1) {
      this.obj[1] = { type: 'defend', x: Z.x0 + 1300, y: 600, r: 200, time: Math.round(35 * g.diff.defend), t: 0, started: false, done: false };
      add({ x: Z.x0 + 1284, y: 588, w: 32, h: 22, z: 26, kind: 'radio' }); reserved.push({ x: Z.x0 + 1130, y: 430, w: 340, h: 340 });
      pickup('weapon', Z.x0 + 720, 226, 2);
    }
    if (k === 2) {
      this.obj[2] = { type: 'carry', ix: Z.x0 + 1675, iy: 992, gx: Z.x1 - 190, gy: ST + 45, picked: false, done: false };
      add({ x: Z.x1 - 230, y: ST + 20, w: 80, h: 50, z: 46, kind: 'generator', on: false }); pickup('fuel', Z.x0 + 1675, 992, 0);
    }
    if (k === 3) { this.obj[3] = { type: 'boss', spawned: false, dead: false }; }

    // lampadaires
    for (let x = Z.x0 + 170; x < Z.x1 - 90; x += 300 + r() * 90) {
      for (const [lx, ly] of [[x, ST + 30], [x + 150, SB - 30]]) { if (lx > Z.x1 - 60) continue; const on = k === 2 ? false : r() < (k === 3 ? 0.4 : 0.55); this.lamps.push({ x: lx, y: ly, on, flick: r() < 0.35, phase: r() * 10, zone: k, grid: k === 2 }); }
    }

    const kiosks = [];
    if (k === 2) {
      // parking : rangées de voitures en épi
      let col = 0;
      for (let cx = Z.x0 + 290; cx < Z.x1 - 300; cx += 78, col++) {
        if (col % 6 === 5) continue;
        for (const ry of [268, 372, 740, 844]) { if (r() < 0.62 && free(cx, ry, 44, 88, 4)) car(cx, ry, 44, 88, r() < 0.3); }
      }
      for (let i = 0; i < 3; i++) place(64, 34, 30, ST + 82, ST + 140, (x, y) => add({ x, y, w: 64, h: 34, z: 36, kind: 'dumpster', hue: r() }));
    } else if (k < 3) {
      for (let i = 0; i < (k === 0 ? 3 : 4); i++) { const o = place(150, 80, 50, 300, 880, (x, y) => add({ x, y, w: 150, h: 80, z: 66, kind: 'kiosk', hue: r() }), 70); if (o) kiosks.push(o); }
      for (let i = 0; i < 14; i++) { const hor = r() < 0.7; const w = hor ? 92 : 46, h = hor ? 46 : 92; place(w, h, 40, 250, 950, (x, y) => car(x, y, w, h, r() < 0.4)); }
      for (let i = 0; i < 4; i++) place(110, 24, 30, 260, 940, (x, y) => add({ x, y, w: 110, h: 24, z: 26, kind: 'barrier' }));
      for (let i = 0; i < 2; i++) place(64, 34, 30, ST + 82, ST + 140, (x, y) => add({ x, y, w: 64, h: 34, z: 36, kind: 'dumpster', hue: r() }));
    } else {
      add({ x: PLAZA - 70, y: 548, w: 140, h: 100, z: 60, kind: 'statue' });
      for (const [bx, by] of [[PLAZA - 400, 380], [PLAZA + 400, 380], [PLAZA - 400, 820], [PLAZA + 400, 820]]) { add({ x: bx - 13, y: by - 13, w: 26, h: 26, z: 30, kind: 'brazier' }); this.fixedLights.push({ x: bx, y: by, r: 230, c: '255,130,50', i: 0.75, flick: 2, zone: 3 }); }
      for (let i = 0; i < 4; i++) { const hor = r() < 0.6; const w = hor ? 92 : 46, h = hor ? 46 : 92; place(w, h, 40, 260, 940, (x, y) => car(x, y, w, h, r() < 0.5), 80); }
    }
    // barils explosifs
    for (let i = 0; i < (k === 3 ? 3 : 7); i++) place(22, 22, 30, 250, 950, (x, y) => { add({ x, y, w: 22, h: 22, z: 28, kind: 'barrel', hp: 30 }); if (r() < 0.5 && free(x + 26, y, 22, 22, 2)) add({ x: x + 26, y: y + 2, w: 22, h: 22, z: 28, kind: 'barrel', hp: 30 }); });
    // distributeurs de soins contre les façades
    for (let i = 0; i < 2; i++) {
      for (let t = 0; t < 30; t++) { const x = Math.round(Z.x0 + 260 + r() * (Z.x1 - Z.x0 - 520)); if (free(x, ST + 2, 38, 26, 40)) { add({ x, y: ST + 2, w: 38, h: 26, z: 56, kind: 'machine', hp: 220, maxHp: 220, charges: 3, broken: false }); break; } }
    }
    // coffres cachés : derrière les kiosques et dans un recoin
    for (const kk of kiosks) if (r() < 0.85) this.chests.push({ x: kk.x + kk.w / 2 + (r() - 0.5) * 70, y: kk.y - 14, open: false, zone: k, value: Math.round(140 + r() * 170) });
    for (let t = 0; t < 20; t++) {
      const x = r() < 0.5 ? Z.x0 + 70 + r() * 200 : Z.x1 - 70 - r() * 200, y = r() < 0.5 ? ST + 96 + r() * 40 : SB - 56;
      if (free(x - 14, y - 10, 28, 20, 10)) { this.chests.push({ x, y, open: false, zone: k, value: Math.round(160 + r() * 190) }); break; }
    }
    // piles, objets fétiches et survivant, dans des recoins sombres
    const spot = () => { for (let t = 0; t < 50; t++) { const x = Math.round(Z.x0 + 160 + r() * (Z.x1 - Z.x0 - 320)), y = Math.round(r() < 0.5 ? ST + 92 + r() * 50 : SB - 46 - r() * 50); if (free(x - 14, y - 14, 28, 28, 6)) return [x, y]; } return null; };
    // shibas : cachettes tirées au hasard à chaque nouvelle partie (graine gardée dans la sauvegarde)
    { const rs = mulberry32(7919 + k * 97 + (g.shibaSeed || 0)), ok = [];
      for (let i = 0; i < SHIBAS_PER; i++) for (let t = 0; t < 80; t++) {
        const edge = rs() < 0.6, x = Math.round(Z.x0 + 170 + rs() * (Z.x1 - Z.x0 - 340)), y = Math.round(edge ? (rs() < 0.5 ? ST + 92 + rs() * 60 : SB - 46 - rs() * 60) : 280 + rs() * 640);
        if (!free(x - 14, y - 14, 28, 28, 6) || ok.some(([a, b]) => Math.abs(a - x) < 380 && Math.abs(b - y) < 260)) continue;
        ok.push([x, y]); if (!(g.shibaFound && g.shibaFound.has(k + '-' + i))) pickup('shiba', x, y, i); else reserved.push({ x: x - 30, y: y - 30, w: 60, h: 60 }); break;
      } }
    for (let i = 0; i < (k < 3 ? 2 : 1); i++) { const s1 = spot(); if (s1) pickup('battery', s1[0], s1[1], 0); const s2 = spot(); if (s2) pickup('fetish', s2[0], s2[1], 0); }
    if (k < 3) { const s = spot(); if (s) { const sv = new Survivor(g, s[0], s[1], k, k); g.survivors.push(sv); } }
    if (k === 2) for (let t = 0; t < 30; t++) { const x = Z.x0 + 400 + r() * 1700, y = 362 + (r() < 0.5 ? 0 : 470); if (free(x - 14, y - 6, 28, 12, 2)) { this.chests.push({ x, y, open: false, zone: k, value: Math.round(200 + r() * 200) }); break; } }
    // portes et égouts : points d'apparition
    const buildings = this.obstacles.filter(o => o.kind === 'building');
    for (let i = 0; i < (k === 3 ? 4 : 6); i++) {
      const x = Math.round(Z.x0 + 150 + r() * (Z.x1 - Z.x0 - 300));
      const b = buildings.find(b => x >= b.x + 24 && x <= b.x + b.w - 24); if (!b) continue;
      b.doors.push({ x, zone: k }); this.spawners.push({ x, y: ST + 16, kind: 'door', zone: k, anim: 0 });
    }
    if (k === 3) { const b = buildings.find(b => PLAZA >= b.x && PLAZA <= b.x + b.w); if (b) b.doors.push({ x: PLAZA, zone: 3, big: true }); }
    for (let i = 0; i < (k === 3 ? 4 : 7); i++) {
      for (let t = 0; t < 30; t++) { const x = Math.round(Z.x0 + 200 + r() * (Z.x1 - Z.x0 - 400)), y = Math.round(k === 2 ? (r() < 0.5 ? 600 : ST + 100) : 280 + r() * 640); if (free(x - 20, y - 20, 40, 40, 10)) { this.spawners.push({ x, y, kind: 'sewer', zone: k, anim: 0 }); reserved.push({ x: x - 20, y: y - 20, w: 40, h: 40 }); break; } }
    }
  }
  resetZone(k) {
    for (const o of this.obstacles) if (o.zone === k && o.snd) this.g.audio.alarmStop(o);
    this.obstacles = this.obstacles.filter(o => o.zone !== k);
    this.lamps = this.lamps.filter(o => o.zone !== k);
    this.spawners = this.spawners.filter(o => o.zone !== k);
    this.chests = this.chests.filter(o => o.zone !== k);
    this.fixedLights = this.fixedLights.filter(o => o.zone !== k);
    for (const b of this.obstacles) if (b.kind === 'building') b.doors = b.doors.filter(d => d.zone !== k);
    this.g.pickups = this.g.pickups.filter(p => p.zone !== k);
    this.g.survivors = this.g.survivors.filter(s => s.zone !== k); if (this.g.run && this.g.run.sv && k < 3 && this.g.run.sv[k] !== 2) this.g.run.sv[k] = 0;
    this.buildZone(k); this.rebuildGrid();
  }
  rebuildGrid() {
    this.grid = new Map(); const GC = 160;
    for (const o of this.obstacles) {
      const x0 = Math.floor(o.x / GC), x1 = Math.floor((o.x + o.w) / GC), y0 = Math.floor(o.y / GC), y1 = Math.floor((o.y + o.h) / GC);
      for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) { const key = (i + 10) * 1000 + (j + 10); let a = this.grid.get(key); if (!a) this.grid.set(key, a = []); a.push(o); }
    }
    this.cars = this.obstacles.filter(o => o.kind === 'car');
    this.machines = this.obstacles.filter(o => o.kind === 'machine');
  }
  queryRect(x, y, w, h) {
    const out = [], st = ++this.stamp, GC = 160;
    for (let i = Math.floor(x / GC); i <= Math.floor((x + w) / GC); i++) for (let j = Math.floor(y / GC); j <= Math.floor((y + h) / GC); j++) {
      const a = this.grid.get((i + 10) * 1000 + (j + 10)); if (!a) continue;
      for (const o of a) if (o._st !== st) { o._st = st; out.push(o); }
    }
    return out;
  }
  pointObstacle(x, y) {
    const a = this.grid.get((Math.floor(x / 160) + 10) * 1000 + (Math.floor(y / 160) + 10)); if (!a) return null;
    for (const o of a) if (x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h) return o;
    return null;
  }
  lineClear(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    for (const o of this.queryRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(dx), Math.abs(dy))) { if (LOWK.has(o.kind)) continue; if (rayRect(x1, y1, dx / len, dy / len, o, len) < len) return false; }
    return true;
  }
  setGate(b, closed) {
    const gt = this.gates[b]; if (!gt || gt.closed === closed) return; gt.closed = closed; if (this.g.netEmit) this.g.netEmit(['gate', b, closed]);
    if (closed) this.obstacles.push(gt); else this.obstacles = this.obstacles.filter(o => o !== gt);
    this.rebuildGrid(); this.g.audio.clank();
  }
  removeObstacle(o) { this.obstacles = this.obstacles.filter(x => x !== o); this.rebuildGrid(); if (this.g.netEmit) this.g.netEmit(['rmob', o.oid]); }
  paintHospital(g, x0, y0, w, h, r) {
    const x1 = Math.min(x0 + w, ZONES[0].x1 - 12), ya = Math.max(y0, ST), yb = Math.min(y0 + h, SB); if (x1 <= x0 || yb <= ya) return;
    g.fillStyle = '#2c3836'; g.fillRect(x0, ya, x1 - x0, yb - ya);
    g.fillStyle = '#26302f'; for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) for (let y = Math.floor(ya / 40) * 40; y < yb; y += 40) if (((x + y) / 40) % 2 === 0) g.fillRect(x, y, 40, 40);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); for (let x = Math.floor(x0 / 40) * 40; x <= x1; x += 40) { g.moveTo(x, ya); g.lineTo(x, yb); } for (let y = Math.floor(ya / 40) * 40; y <= yb; y += 40) { g.moveTo(x0, y); g.lineTo(x1, y); } g.stroke();
    g.fillStyle = 'rgba(80,190,150,.22)'; g.fillRect(x0, 586, x1 - x0, 6); g.fillStyle = 'rgba(230,200,80,.18)'; g.fillRect(x0, 606, x1 - x0, 6);
    for (let i = 0; i < 5; i++) { const x = x0 + r() * (x1 - x0), y = ya + r() * (yb - ya); g.fillStyle = 'rgba(90,8,6,.45)'; g.beginPath(); g.ellipse(x, y, 10 + r() * 24, 5 + r() * 9, r() * 3, 0, TAU); g.fill(); }
    if (x0 <= HOSP.morgue + 260 && x1 >= HOSP.morgue + 140) { g.save(); g.font = `bold 30px ${FD}`; g.fillStyle = 'rgba(160,230,200,.18)'; g.textAlign = 'center'; g.fillText('MORGUE', HOSP.morgue + 270, 470); g.restore(); }
  }
  paintGround(g, x0, y0, w, h, cx, cy) {
    const r = mulberry32(cx * 92821 + cy * 68917 + 7);
    g.save(); g.beginPath(); g.rect(x0, y0, w + 1, h + 1); g.clip();
    g.fillStyle = '#17181b'; g.fillRect(x0, y0, w, h);
    const sections = [{ x0: -200, x1: 0, t: 'street' }, ...ZONES.map((z, i) => ({ x0: z.x0, x1: z.x1, t: i === 3 ? 'plaza' : i === 2 ? 'lot' : 'street' })), ...SAFES.map(s => ({ x0: s.x0, x1: s.x1, t: 'safe' })), { x0: EXIT.x0, x1: EXIT.x1 + 100, t: 'plaza' }];
    for (const s of sections) {
      if (s.x1 < x0 || s.x0 > x0 + w) continue;
      const sx0 = Math.max(s.x0, x0), sx1 = Math.min(s.x1, x0 + w), sw = sx1 - sx0;
      if (s.t === 'street' || s.t === 'lot') {
        g.fillStyle = '#4a4947'; g.fillRect(sx0, ST, sw, 76);
        g.fillStyle = '#46453f'; g.fillRect(sx0, SB - 76, sw, 76);
        g.fillStyle = s.t === 'lot' ? '#36383b' : '#303134'; g.fillRect(sx0, ST + 76, sw, SB - ST - 152);
        g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1; g.beginPath();
        for (let x = Math.floor(sx0 / 48) * 48; x < sx1; x += 48) { g.moveTo(x, ST); g.lineTo(x, ST + 76); g.moveTo(x, SB - 76); g.lineTo(x, SB); }
        g.moveTo(sx0, ST + 38); g.lineTo(sx1, ST + 38); g.moveTo(sx0, SB - 38); g.lineTo(sx1, SB - 38); g.stroke();
        g.fillStyle = '#6b6962'; g.fillRect(sx0, ST + 74, sw, 4); g.fillRect(sx0, SB - 78, sw, 4);
        if (s.t === 'street') {
          g.fillStyle = 'rgba(196,182,130,.55)'; for (let x = Math.floor(sx0 / 140) * 140; x < sx1; x += 140) g.fillRect(x, 597, 70, 6);
          g.fillStyle = 'rgba(190,190,190,.2)'; for (let x = Math.floor(sx0 / 90) * 90; x < sx1; x += 90) { g.fillRect(x, 418, 40, 3); g.fillRect(x, 780, 40, 3); }
          const cw = s.x0 + 900; if (cw > sx0 - 200 && cw < sx1 + 200) { g.fillStyle = 'rgba(200,200,190,.28)'; for (let y = ST + 90; y < SB - 90; y += 34) g.fillRect(cw, y, 110, 18); }
        } else {
          g.fillStyle = 'rgba(210,205,180,.35)';
          let col = 0; for (let cxp = s.x0 + 290; cxp < s.x1 - 300; cxp += 78, col++) { if (col % 6 === 5) continue; for (const [ya, yb] of [[262, 460], [734, 938]]) g.fillRect(cxp - 17, ya, 3, yb - ya); }
          g.fillRect(sx0, 364, sw, 3); g.fillRect(sx0, 836, sw, 3);
          g.fillStyle = 'rgba(230,200,90,.35)'; for (let x = Math.floor(sx0 / 120) * 120; x < sx1; x += 120) { g.beginPath(); g.moveTo(x, 590); g.lineTo(x + 30, 600); g.lineTo(x, 610); g.fill(); }
        }
      } else if (s.t === 'safe') {
        g.fillStyle = '#3a3530'; g.fillRect(sx0, ST, sw, SB - ST);
        g.strokeStyle = '#2b2723'; g.lineWidth = 2; g.beginPath();
        for (let x = Math.floor(sx0 / 40) * 40; x < sx1; x += 40) { g.moveTo(x, ST); g.lineTo(x, SB); }
        for (let y = ST; y < SB; y += 40) { g.moveTo(sx0, y); g.lineTo(sx1, y); } g.stroke();
        g.fillStyle = 'rgba(120,30,25,.35)'; g.fillRect(s.x0 + 120, 470, 160, 260);
      } else {
        g.fillStyle = '#34322f'; g.fillRect(sx0, ST, sw, SB - ST);
        for (let y = ST, row = 0; y < SB; y += 14, row++) for (let x = Math.floor(sx0 / 22) * 22 - (row % 2) * 11; x < sx1; x += 22) { const v = 52 + r() * 16 | 0; g.fillStyle = `rgb(${v},${v - 2},${v - 5})`; g.fillRect(x + 1, y + 1, 20, 12); }
        g.strokeStyle = 'rgba(150,140,120,.25)'; g.lineWidth = 6; g.beginPath(); g.arc(PLAZA, 598, 320, 0, TAU); g.stroke(); g.beginPath(); g.arc(PLAZA, 598, 200, 0, TAU); g.stroke();
        if (s.x0 === EXIT.x0) { g.fillStyle = '#2a2c2e'; g.beginPath(); g.arc(HELI, 600, 88, 0, TAU); g.fill(); g.strokeStyle = 'rgba(230,220,190,.6)'; g.lineWidth = 6; g.stroke(); g.fillStyle = 'rgba(230,220,190,.6)'; g.fillRect(8072, 560, 12, 80); g.fillRect(8116, 560, 12, 80); g.fillRect(8072, 594, 56, 12); }
      }
    }
    g.fillStyle = '#0a0f13'; g.fillRect(x0, SB + 22, w, WORLD.h);
    g.strokeStyle = 'rgba(90,110,130,.18)'; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < 18; i++) { const x = x0 + r() * w, y = SB + 40 + r() * 140; g.moveTo(x, y); g.lineTo(x + 30 + r() * 50, y); } g.stroke();
    for (let i = 0; i < 520; i++) { const x = x0 + r() * w, y = y0 + r() * h; if (y < ST || y > SB) continue; g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.05)'; g.fillRect(x, y, 1 + r() * 2.5, 1 + r() * 2.5); }
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { let x = x0 + r() * w, y = ST + 80 + r() * (SB - ST - 160); g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 3; i++) { const x = x0 + r() * w, y = ST + 90 + r() * (SB - ST - 180); g.fillStyle = 'rgba(14,18,24,.75)'; g.beginPath(); g.ellipse(x, y, 30 + r() * 50, 12 + r() * 18, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(120,140,160,.12)'; g.stroke(); }
    for (let i = 0; i < 2; i++) { const x = x0 + r() * w, y = ST + 120 + r() * (SB - ST - 240); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y, 20 + r() * 20, 10 + r() * 10, r() * 3, 0, TAU); g.fill(); }
    for (const s of this.spawners) {
      if (s.kind !== 'sewer' || s.x < x0 - 30 || s.x > x0 + w + 30 || s.y < y0 - 30 || s.y > y0 + h + 30) continue;
      g.fillStyle = '#202124'; g.beginPath(); g.arc(s.x, s.y, 17, 0, TAU); g.fill();
      g.strokeStyle = '#55565a'; g.lineWidth = 2.5; g.stroke();
      g.strokeStyle = '#3a3b3e'; g.lineWidth = 1.5; g.beginPath(); for (let i = -10; i <= 10; i += 5) { g.moveTo(s.x + i, s.y - 13); g.lineTo(s.x + i, s.y + 13); } g.stroke();
    }
    if (this.hosp && x0 < ZONES[0].x1) this.paintHospital(g, x0, y0, w, h, r);
    g.restore();
  }
}

