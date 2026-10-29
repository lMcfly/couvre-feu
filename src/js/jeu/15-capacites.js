// ============================================================ jeu : capacités des personnages
mixin(Game, {
  salsa(x, y) {
    const R = 185;
    for (const z of this.hash.query(x, y, R + 40, [])) {
      if (z.dead || z.spawnT > 0) continue; const dx = z.x - x, dy = z.y - y, d = Math.hypot(dx, dy) || 1; if (d > R + z.r) continue;
      z.burn = Math.max(z.burn, 4.5); z.knock(dx / d * 520, dy / d * 520); z.aggro = true; z.damage(z.type === 'boss' ? 160 : 35, dx / d, dy / d, 'salsa');
    }
    for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, s = rand(220, 420); this.spawnP({ x, y, z: 8, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rand(20, 80), life: rand(0.4, 0.7), type: 'fire', size: rand(7, 13), emissive: true, drag: 4 }); }
    this.spawnP({ x, y, life: 0.4, type: 'ring', size: 20, grow: R * 2.6, emissive: true });
    this.addLight(x, y, 520, '255,90,30', 1.6, 0.6); this.shake(0.4); this.audio.explosion(0.6); this.audio.groan(x, y, 'runner');
    this.fires.push(new FireArea(this, x, y, 70, 2.5));
  },
  zeusLightning(p) {
    let fx = p.x, fy = p.y, range = 420, hops = 0; const hit = new Set();
    while (hops < 7) {
      let best = null, bd = range * range;
      for (const z of this.hash.query(fx, fy, range, [])) { if (z.dead || z.spawnT > 0 || hit.has(z)) continue; const d = dist2(z.x, z.y, fx, fy); if (d < bd && this.level.lineClear(fx, fy, z.x, z.y)) { bd = d; best = z; } }
      if (!best) break; hit.add(best);
      this.beams.push({ x1: fx, y1: fy, x2: best.x, y2: best.y, life: 0.4, max: 0.4, dead: false, bolt: true });
      this.addLight(best.x, best.y, 240, '190,220,255', 1.3, 0.3); best.stun = Math.max(best.stun || 0, 1.2);
      best.damage(best.type === 'boss' ? 220 : 95, best.x - fx, best.y - fy, 'rail');
      fx = best.x; fy = best.y; range = 230; hops++;
    }
    if (!hops) { this.toast('Aucune cible à portée de la foudre', '#9fc6e8'); return false; }
    this.audio.shot('rail'); this.audio.explosion(0.35); this.shake(0.35); this.addLight(p.x, p.y, 320, '190,220,255', 1.1, 0.25);
    return true;
  },
  dobbyBlink(p) {
    const a = p.aim, ox = p.x, oy = p.y; let tx = p.x, ty = p.y;
    for (let d = 12; d <= 240; d += 12) { const nx = ox + Math.cos(a) * d, ny = oy + Math.sin(a) * d; if (this.level.pointObstacle(nx, ny) || ny < ST + p.r || ny > SB - p.r) break; tx = nx; ty = ny; }
    const puff = (x, y) => { for (let i = 0; i < 18; i++) { const an = rand(0, TAU), sp = rand(60, 200); this.spawnP({ x, y, z: 12, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: rand(0.4, 0.8), type: 'smoke', size: rand(6, 11), grow: 18, drag: 3 }); } this.spawnP({ x, y, life: 0.3, type: 'ring', size: 10, grow: 300, emissive: true }); };
    puff(ox, oy); p.x = tx; p.y = ty; this.collideWorld(p); p.inv = Math.max(p.inv, 0.6); puff(p.x, p.y);
    for (const z of this.hash.query(p.x, p.y, 160, [])) { if (z.dead || z.spawnT > 0) continue; const dx = z.x - p.x, dy = z.y - p.y, d = Math.hypot(dx, dy) || 1; if (d > 120 + z.r) continue; z.knock(dx / d * 520, dy / d * 520); z.stun = Math.max(z.stun || 0, 0.6); z.damage(25, dx / d, dy / d, 'explosion'); }
    this.audio.tone({ f: 900, f2: 300, dur: 0.25, type: 'triangle', g: 0.2 }); this.addLight(p.x, p.y, 200, '220,230,255', 0.9, 0.2);
  },
  chewieRoar(p) {
    for (const z of this.hash.query(p.x, p.y, 300, [])) {
      if (z.dead || z.spawnT > 0) continue; const dx = z.x - p.x, dy = z.y - p.y, d = Math.hypot(dx, dy) || 1; if (d > 280 + z.r) continue;
      if (z.type === 'boss') { if (z.state !== 'intro') z.setState('stunned', 1.6); } else { z.stun = Math.max(z.stun || 0, 3); z.knock(dx / d * 450, dy / d * 450); }
      z.damage(20, dx / d, dy / d, 'explosion');
    }
    this.spawnP({ x: p.x, y: p.y, life: 0.5, type: 'ring', size: 20, grow: 560, emissive: true }); this.spawnP({ x: p.x, y: p.y, life: 0.7, type: 'ring', size: 10, grow: 420, emissive: true });
    this.audio.roar(0.9); this.shake(0.55);
  },
  dragonBreath(p) {
    const m = p.muzzle();
    for (let i = 0; i < 36; i++) this.flames.push(new Flame(this, m.x, m.y, p.aim + rand(-0.42, 0.42), rand(430, 720), 12));
    this.addLight(p.x + Math.cos(p.aim) * 160, p.y + Math.sin(p.aim) * 160, 460, '255,120,40', 1.5, 0.5);
    this.audio.noise({ f: 500, f2: 1600, type: 'bandpass', q: 0.8, dur: 0.8, g: 0.6 }); this.audio.roar(0.4); this.shake(0.3);
  },
  shieldHit(z, ux, uy) {
    const sx = z.x - ux * z.r * 1.1, sy = z.y - uy * z.r * 1.1;
    for (let i = 0; i < 3; i++) this.spawnP({ x: sx, y: sy, z: 14, vx: -ux * rand(80, 200) + rand(-60, 60), vy: -uy * rand(80, 200) + rand(-60, 60), life: 0.2, type: 'spark', size: 1.4, emissive: true });
    this.audio.metal(0.6, this.audio.at(z.x, z.y).pan);
    if (!this.riotTip) { this.riotTip = true; this.toast('CRS zombie : son bouclier bloque les tirs de face. Contourne-le ou lance une grenade.', '#9fc6e8'); }
  }
});
