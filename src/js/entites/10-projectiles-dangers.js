// ============================================================ projectiles et effets
class Bullet {
  constructor(g, x, y, a, spd, dmg, pierce, charged) { this.g = g; this.x = x; this.y = y; this.px = x; this.py = y; this.vx = Math.cos(a) * spd; this.vy = Math.sin(a) * spd; this.dmg = dmg; this.pierce = pierce; this.charged = charged; this.life = 0.9; this.hit = new Set(); this.dead = false; }
  update(dt) {
    const g = this.g; this.px = this.x; this.py = this.y; this.life -= dt; if (this.life <= 0) { this.dead = true; return; }
    const dx = this.vx * dt, dy = this.vy * dt, len = Math.hypot(dx, dy), steps = Math.max(1, Math.ceil(len / 12)), sp = Math.hypot(this.vx, this.vy);
    for (let s = 0; s < steps; s++) {
      this.x += dx / steps; this.y += dy / steps;
      const o = g.level.pointObstacle(this.x, this.y);
      if (o) { g.hitObstacle(o, this.dmg, this.x, this.y, 'bullet'); g.sparks(this.x, this.y, -this.vx / sp, -this.vy / sp, o.kind === 'car' ? 6 : 4); this.dead = true; return; }
      const near = g.hash.query(this.x, this.y, 44, g._q);
      for (let i = 0; i < near.length; i++) {
        const z = near[i]; if (z.dead || z.spawnT > 0 || this.hit.has(z)) continue;
        const rr = z.r + (this.charged ? 8 : 3);
        if (dist2(this.x, this.y, z.x, z.y) < rr * rr) {
          this.hit.add(z); if (this.shot && !this.shot.hit) { this.shot.hit = true; g.stats.hits++; } z.knock(this.vx / sp * (this.charged ? 420 : 110), this.vy / sp * (this.charged ? 420 : 110)); z.damage(this.dmg, this.vx / sp, this.vy / sp, 'bullet');
          if (--this.pierce < 0) { this.dead = true; return; }
        }
      }
    }
  }
}
class Flame {
  constructor(g, x, y, a, spd, dmg) { this.g = g; this.x = x; this.y = y; this.vx = Math.cos(a) * spd; this.vy = Math.sin(a) * spd; this.dmg = dmg; this.life = this.max = rand(0.42, 0.55); this.r = 6; this.dead = false; }
  update(dt) {
    const g = this.g; this.life -= dt; if (this.life <= 0) { this.dead = true; return; }
    const dr = Math.exp(-2.2 * dt); this.vx *= dr; this.vy *= dr; this.x += this.vx * dt; this.y += this.vy * dt; this.r += dt * 40;
    const o = g.level.pointObstacle(this.x, this.y);
    if (o) { if (Math.random() < 0.3) g.hitObstacle(o, this.dmg * 0.6, this.x, this.y, 'fire'); this.dead = true; return; }
    for (const z of g.hash.query(this.x, this.y, this.r + 40, g._q)) {
      if (z.dead || z.spawnT > 0) continue;
      if (dist2(this.x, this.y, z.x, z.y) < (z.r + this.r) ** 2) { if (z.flameCd <= 0) { z.flameCd = 0.12; z.flameBlocked = z.damage(this.dmg, this.vx, this.vy, 'fire') === false; } if (!z.dead && !z.flameBlocked) z.burn = Math.max(z.burn, 2.8); if (z.flameBlocked) { this.dead = true; return; } }
    }
  }
}
class Rocket {
  constructor(g, x, y, a, dmg, rad) { this.g = g; this.x = x; this.y = y; this.a = a; this.vx = Math.cos(a) * 720; this.vy = Math.sin(a) * 720; this.dmg = dmg; this.rad = rad; this.life = 2.2; this.dead = false; }
  update(dt) {
    const g = this.g; this.life -= dt; if (this.life <= 0) return this.explode();
    const steps = 3;
    for (let s = 0; s < steps; s++) {
      this.x += this.vx * dt / steps; this.y += this.vy * dt / steps;
      if (g.level.pointObstacle(this.x, this.y)) return this.explode();
      for (const z of g.hash.query(this.x, this.y, 50, g._q)) if (!z.dead && z.spawnT <= 0 && dist2(this.x, this.y, z.x, z.y) < (z.r + 8) ** 2) return this.explode();
    }
    g.spawnP({ x: this.x, y: this.y, z: 14, vx: rand(-20, 20), vy: rand(-20, 20), life: rand(0.5, 0.9), type: 'smoke', size: rand(4, 7), grow: 16 });
    g.spawnP({ x: this.x, y: this.y, z: 14, vx: -this.vx * 0.1, vy: -this.vy * 0.1, life: 0.15, type: 'fire', size: 5, emissive: true });
    g.addLight(this.x, this.y, 170, '255,160,80', 0.8, 0.03);
  }
  explode() { if (this.dead) return; this.dead = true; const n = this.g.explosion(this.x, this.y, this.rad, this.dmg, 'rocket'); if (n > 0 && this.shot && !this.shot.hit) { this.shot.hit = true; this.g.stats.hits++; } }
}
class Throwable {
  constructor(g, kind, x, y, tx, ty) {
    this.g = g; this.kind = kind; this.x = x; this.y = y; const d = Math.hypot(tx - x, ty - y);
    this.T = 0.35 + d / 700; this.vx = (tx - x) / this.T; this.vy = (ty - y) / this.T; this.grav = 900; this.z = 14; this.vz = (this.grav * this.T * this.T / 2 - this.z) / this.T; /* touche le sol pile au point visé */
    this.fuse = kind === 'grenade' ? 1.7 : 0; this.active = 0; this.landed = false; this.beepT = 0; this.dead = false;
  }
  update(dt) {
    const g = this.g;
    if (!this.landed) {
      const nx = this.x + this.vx * dt; if (g.level.pointObstacle(nx, this.y)) this.vx *= -0.4; else this.x = nx;
      const ny = this.y + this.vy * dt; if (g.level.pointObstacle(this.x, ny)) this.vy *= -0.4; else this.y = ny;
      this.z += this.vz * dt; this.vz -= this.grav * dt;
      if (this.z <= 0) { this.z = 0; if (this.vz < -150) { this.vz = -this.vz * 0.3; this.vx *= 0.12; this.vy *= 0.12; g.audio.metal(0.5); } /* petit rebond sur place : l'objet tombe là où on a visé */ else { this.landed = true; this.vx = this.vy = 0; if (this.kind === 'decoy') { this.active = 8; g.makeNoise(this.x, this.y, 950); } } }
    }
    if (this.kind === 'grenade') { this.fuse -= dt; if (this.fuse <= 0) { this.dead = true; g.explosion(this.x, this.y, 150, 170, 'grenade'); } }
    else if (this.landed) {
      this.active -= dt; this.beepT -= dt;
      if (this.beepT <= 0) { this.beepT = 0.5; g.audio.beep(this.x, this.y); }
      if (Math.random() < dt * 30) g.spawnP({ x: this.x, y: this.y, z: 6, vx: rand(-30, 30), vy: rand(-30, 30), vz: rand(40, 120), grav: 300, life: rand(0.3, 0.6), type: 'spark', size: 1.5, emissive: true, color: '#ff5a4a' });
      if (this.active <= 0) { this.dead = true; g.explosion(this.x, this.y, 100, 120, 'decoy'); }
    }
  }
}
class Mine {
  constructor(g, x, y) { this.g = g; this.x = x; this.y = y; this.arm = 0.8; this.dead = false; this.t = 0; }
  update(dt) {
    this.arm -= dt; this.t += dt; if (this.arm > 0) return;
    for (const z of this.g.hash.query(this.x, this.y, 70, this.g._q)) if (!z.dead && z.spawnT <= 0 && dist2(z.x, z.y, this.x, this.y) < (z.r + 22) ** 2) { this.dead = true; this.g.explosion(this.x, this.y, 125, 200, 'mine'); return; }
  }
}
class Acid {
  constructor(g, x, y, tx, ty, big) { this.g = g; this.sx = x; this.sy = y; this.tx = tx; this.ty = ty; this.T = 0.45 + Math.hypot(tx - x, ty - y) / 520; this.t = 0; this.big = big; this.x = x; this.y = y; this.z = 0; this.dead = false; }
  update(dt) {
    this.t += dt; const k = Math.min(1, this.t / this.T); this.x = lerp(this.sx, this.tx, k); this.y = lerp(this.sy, this.ty, k); this.z = Math.sin(k * Math.PI) * (50 + this.T * 70);
    if (k >= 1) {
      this.dead = true; const g = this.g, R = this.big ? 42 : 30;
      for (const p of g.players()) if (!p.dead && dist2(p.x, p.y, this.x, this.y) < (R + p.r) ** 2) p.hurt((this.big ? 18 : 11) * g.diff.dmg, this.x, this.y, 150);
      g.puddles.push({ x: this.x, y: this.y, r: R, life: this.big ? 6 : 4.5, max: this.big ? 6 : 4.5, dead: false });
      for (let i = 0; i < 8; i++) g.spawnP({ x: this.x, y: this.y, z: 2, vx: rand(-90, 90), vy: rand(-90, 90), vz: rand(60, 160), grav: 600, life: 0.6, type: 'acid', size: 2.5, emissive: true });
      g.audio.splat(this.x, this.y);
    }
  }
}
class Shockwave {
  constructor(g, x, y, max, dmg) { this.g = g; this.x = x; this.y = y; this.r = 20; this.max = max; this.dmg = dmg; this.hit = false; this.dead = false; }
  update(dt) {
    this.r += 520 * dt; if (this.r > this.max) { this.dead = true; return; }
    this.hitSet = this.hitSet || new Set(); for (const p of this.g.players()) if (!this.hitSet.has(p) && !p.dead) { const d = Math.hypot(p.x - this.x, p.y - this.y); if (Math.abs(d - this.r) < 18 + p.r) { this.hitSet.add(p); p.hurt(this.dmg, this.x, this.y, 520); } }
    if (Math.random() < 0.6) { const a = rand(0, TAU); this.g.spawnP({ x: this.x + Math.cos(a) * this.r, y: this.y + Math.sin(a) * this.r, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, life: 0.6, type: 'smoke', size: 8, grow: 16 }); }
  }
}
// dangers lancés par les boss : zone d'amende, voiture-bélier, scalpels, gaz, laisse, croquettes, barrières
class Hazard {
  constructor(g, kind, o) { this.g = g; this.kind = kind; this.dead = false; this.t = 0; this.hid = ++NET_HID; Object.assign(this, o); }
  update(dt) {
    const g = this.g, p = g.player; this.t += dt;
    switch (this.kind) {
      case 'fine': // « Vos papiers ! » : sortir du cercle avant la fin
        if (this.t >= this.life) { this.dead = true; for (const q of g.players()) if (!q.dead && dist2(q.x, q.y, this.x, this.y) < this.r * this.r) { if (q.rollT > 0 || q.inv > 0) continue; q.hurt(20 * g.diff.dmg, this.x, this.y, 300); const m = Math.min(q.money || 0, Math.max(20, Math.round((q.money || 0) * 0.1))); if (m > 0) { q.money -= m; g.floatText(q.x, q.y - 40, `AMENDE −$${m}`, '#ff6a45'); } else g.floatText(q.x, q.y - 40, 'AMENDE !', '#ff6a45'); g.audio.tone({ f: 1800, f2: 1800, dur: 0.25, type: 'square', g: 0.12 }); }
          for (let i = 0; i < 14; i++) g.spawnP({ x: this.x + rand(-this.r, this.r), y: this.y + rand(-this.r, this.r) * 0.6, z: 30, vz: rand(40, 120), vx: rand(-40, 40), vy: rand(-40, 40), grav: 200, life: 1.4, type: 'debris', size: 3, color: '#e8e0c8' }); }
        break;
      case 'ram': { // voiture poussée en ligne droite : explose sur un mur
        this.x += this.vx * dt; this.y += this.vy * dt; if (Math.random() < dt * 20) g.spawnP({ x: this.x, y: this.y, vx: rand(-30, 30), vy: rand(-30, 30), life: 0.6, type: 'smoke', size: 8, grow: 14 });
        for (const z of g.hash.query(this.x, this.y, 46, g._qs)) if (!z.dead && z.type !== 'boss' && !this.hitZ.has(z)) { this.hitZ.add(z); z.damage(300, this.vx, this.vy, 'explosion'); }
        for (const q of g.players()) if (!q.dead && dist2(q.x, q.y, this.x, this.y) < 40 * 40 && !this.hitP) { this.hitP = true; q.hurt(22 * g.diff.dmg, this.x - this.vx * 0.1, this.y - this.vy * 0.1, 700); }
        if (this.t > 2.6 || g.level.pointObstacle(this.x + Math.sign(this.vx) * 30, this.y) || g.level.pointObstacle(this.x, this.y + Math.sign(this.vy) * 18) || this.y < ST + 10 || this.y > SB - 10) { this.dead = true; g.explosion(this.x, this.y, 125, 70, 'barrel'); g.fires.push(new FireArea(g, this.x, this.y, 50, 3)); }
        break; }
      case 'blade':
        this.x += this.vx * dt; this.y += this.vy * dt;
        for (const q of g.players()) if (!q.dead && dist2(q.x, q.y, this.x, this.y) < 18 * 18) { q.hurt(13 * g.diff.dmg, this.x - this.vx * 0.05, this.y - this.vy * 0.05, 200); this.dead = true; }
        if (this.t > 1.4 || g.level.pointObstacle(this.x, this.y)) { this.dead = true; g.audio.metal(0.3); }
        break;
      case 'gas':
        if (this.t >= this.life) this.dead = true;
        for (const q of g.players()) if (!q.dead && dist2(q.x, q.y, this.x, this.y) < this.r * this.r) q.slowT = Math.max(q.slowT || 0, 0.25);
        if (Math.random() < dt * 8) g.spawnP({ x: this.x + rand(-this.r, this.r) * 0.8, y: this.y + rand(-this.r, this.r) * 0.6, z: 6, vz: 10, vx: rand(-10, 10), vy: rand(-10, 10), life: 1.6, type: 'smoke', size: 14, grow: 24 });
        break;
      case 'leash': { // part vers le joueur ; accroché, il le tire vers le boss
        const b = this.boss; if (!b || b.dead || this.t > 4.2) { this.dead = true; break; }
        if (!this.hooked) { const dx = this.tx - this.x, dy = this.ty - this.y, d = Math.hypot(dx, dy); const st = 620 * dt; if (d <= st) { this.dead = !(dist2(p.x, p.y, this.tx, this.ty) < 40 * 40); this.x = this.tx; this.y = this.ty; if (!this.dead) { this.hooked = p; this.ht = 0; g.toast('Laisse ! Roule ou tire dessus pour la couper', '#ff7ac8'); } } else { this.x += dx / d * st; this.y += dy / d * st; } }
        else { const q = this.hooked; this.ht += dt; if (q.dead || q.rollT > 0 || this.hp <= 0 || this.ht > 2.6) { this.dead = true; g.audio.tone({ f: 900, f2: 300, dur: 0.2, type: 'square', g: 0.1 }); if (q.rollT > 0 || this.hp <= 0) g.floatText(q.x, q.y - 34, 'LAISSE COUPÉE', '#ff9ad6'); break; }
          const dx = b.x - q.x, dy = b.y - q.y, d = Math.hypot(dx, dy) || 1; if (d > b.r + 30) { q.x += dx / d * 170 * dt; q.y += dy / d * 170 * dt; } this.x = q.x; this.y = q.y; }
        // les balles qui croisent la laisse l'abîment
        for (const bl of g.bullets) { if (bl.dead) continue; const ax = b.x, ay = b.y - 30, ex = this.x - ax, ey = this.y - ay, L2 = ex * ex + ey * ey || 1, u = clamp(((bl.x - ax) * ex + (bl.y - ay) * ey) / L2, 0, 1), px = ax + ex * u - bl.x, py = ay + ey * u - bl.y; if (px * px + py * py < 14 * 14) { this.hp -= bl.dmg; bl.dead = true; g.spawnP({ x: bl.x, y: bl.y, life: 0.3, type: 'spark', size: 1.5, vx: rand(-80, 80), vy: rand(-80, 80), color: '#ff9ad6', emissive: true }); } }
        break; }
      case 'kibble': if (this.t >= this.life) this.dead = true; break;
      case 'barrier': if (this.t >= this.life) { this.dead = true; g.level.removeObstacle(this.ob); g.audio.metal(0.4); } break;
    }
  }
  draw(c, t) {
    switch (this.kind) {
      case 'fine': { const k = this.t / this.life; c.save(); c.translate(this.x, this.y); c.scale(1, 0.62);
        c.fillStyle = `rgba(${DZ()},${0.1 + k * 0.18})`; c.beginPath(); c.arc(0, 0, this.r, 0, TAU); c.fill();
        c.strokeStyle = `rgba(${DZ()},${0.6 + Math.sin(t * 16) * 0.3})`; c.lineWidth = 4; c.setLineDash([14, 10]); c.lineDashOffset = -t * 60; c.beginPath(); c.arc(0, 0, this.r, 0, TAU); c.stroke(); c.setLineDash([]);
        c.strokeStyle = 'rgba(255,210,58,.9)'; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, this.r + 8, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - k)); c.stroke(); c.restore();
        c.font = `16px Bangers, Impact, sans-serif`; c.textAlign = 'center'; c.fillStyle = '#ffd23a'; c.fillText('VOS PAPIERS !', this.x, this.y - this.r * 0.62 - 12); break; }
      case 'ram': { const hor = Math.abs(this.vx) >= Math.abs(this.vy), w = hor ? 96 : 46, h = hor ? 46 : 96; c.save(); c.translate(rand(-1, 1), rand(-0.6, 0.6)); this.g.drawCar({ x: this.x - w / 2, y: this.y - h / 2, w, h, z: 24, color: '#6a5a3a', hor, hp: 30, maxHp: 170 }); c.fillStyle = `rgba(255,${140 + Math.random() * 80 | 0},40,.85)`; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(this.x - Math.sign(this.vx || 1) * w * 0.3 + rand(-8, 8), this.y - 30 - rand(0, 10), rand(4, 8), 0, TAU); c.fill(); } c.restore(); break; }
      case 'ramOld': { c.save(); c.translate(this.x, this.y); c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(0, 6, 44, 14, 0, 0, TAU); c.fill(); const s = Math.sign(this.vx) || 1; c.scale(s, 1);
        c.fillStyle = '#4a4e52'; RR(c, -40, -26, 80, 30, 6); c.fill(); c.fillStyle = '#6a6e70'; RR(c, -24, -40, 46, 16, 5); c.fill(); c.fillStyle = 'rgba(140,180,200,.5)'; c.fillRect(-20, -37, 18, 10); c.fillStyle = '#1a1a1c'; for (const wx of [-26, 24]) { c.beginPath(); c.arc(wx, 4, 9, 0, TAU); c.fill(); }
        c.fillStyle = '#e8c860'; c.fillRect(-36, -16, 18, 4); c.fillRect(-36, -10, 18, 4); c.fillStyle = '#ff6a22'; c.fillRect(34, -18, 6, 8); c.fillStyle = 'rgba(255,160,60,.8)'; c.beginPath(); c.arc(-42 + Math.random() * 3, -12, 5 + Math.random() * 3, 0, TAU); c.fill(); c.restore(); break; }
      case 'blade': c.save(); c.translate(this.x, this.y - 18); c.rotate(Math.atan2(this.vy, this.vx)); c.fillStyle = '#e8eef2'; c.beginPath(); c.moveTo(10, 0); c.lineTo(-2, -3); c.lineTo(-2, 3); c.fill(); c.fillStyle = '#3a4448'; c.fillRect(-9, -1.5, 8, 3); c.restore(); break;
      case 'gas': { const a = Math.min(1, this.t * 3, (this.life - this.t) * 1.5); c.save(); c.globalAlpha = a; c.translate(this.x, this.y); c.scale(1, 0.62); const gr = c.createRadialGradient(0, 0, 10, 0, 0, this.r); gr.addColorStop(0, `rgba(${TOX()},.45)`); gr.addColorStop(1, `rgba(${TOX()},0)`); c.fillStyle = gr; c.beginPath(); c.arc(0, 0, this.r, 0, TAU); c.fill(); c.restore(); break; }
      case 'leash': { const b = this.boss; if (!b) break; c.save(); c.strokeStyle = 'rgba(255,90,200,.9)'; c.lineWidth = 3; c.shadowColor = '#ff5ad0'; c.shadowBlur = 10; c.beginPath(); c.moveTo(b.x + Math.cos(b.dir) * b.r * 0.8, b.y - b.r * 1.3); const mx = (b.x + this.x) / 2, my = (b.y + this.y) / 2 - (this.hooked ? 10 : 40); c.quadraticCurveTo(mx, my, this.x, this.y - 16); c.stroke(); c.fillStyle = '#ffd0f0'; c.beginPath(); c.arc(this.x, this.y - 16, 5, 0, TAU); c.fill(); c.restore(); break; }
      case 'kibble': { c.save(); c.translate(this.x, this.y); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, 3, 26, 9, 0, 0, TAU); c.fill(); c.fillStyle = '#8a5a2a'; for (let i = 0; i < 16; i++) { const a = i * 2.4, d = (i % 5) * 4; c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d * 0.5 - 2, 3, 0, TAU); c.fill(); } c.font = '13px Bangers, Impact, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#ffb060'; c.fillText('CROQUETTES', 0, -16 + Math.sin(t * 4) * 2); c.restore(); break; }
    }
  }
}
class FireArea {
  constructor(g, x, y, r, life) { this.g = g; this.x = x; this.y = y; this.r = r; this.life = this.max = life; this.dead = false; }
  update(dt) {
    const g = this.g; this.life -= dt; if (this.life <= 0) { this.dead = true; return; }
    const k = Math.min(1, this.life / 1.5);
    if (Math.random() < dt * this.r * 0.7 * k) { const a = rand(0, TAU), d = Math.sqrt(Math.random()) * this.r; g.spawnP({ x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d, z: 2, vz: rand(40, 90), vx: rand(-10, 10), vy: rand(-10, 10), life: rand(0.4, 0.8), type: 'fire', size: rand(5, 10), emissive: true, drag: 1 }); }
    for (const z of g.hash.query(this.x, this.y, this.r + 30, g._q)) if (!z.dead && dist2(z.x, z.y, this.x, this.y) < this.r * this.r) z.burn = Math.max(z.burn, 1.2);
    const p = g.player; if (!p.dead && p.char !== 'dragon' && dist2(p.x, p.y, this.x, this.y) < (this.r * 0.85) ** 2) p.hurtDot(14 * g.diff.dmg * dt);
  }
}
class Pickup {
  constructor(g, kind, x, y, val) { this.g = g; this.kind = kind; this.x = x; this.y = y; this.val = val; this.t = 0; this.vx = rand(-70, 70); this.vy = rand(-70, 70); this.life = kind === 'coin' ? 30 : 40; this.dead = false; this.zone = -2; }
  update(dt) {
    const g = this.g, p = g.nearestPlayer(this.x, this.y); this.t += dt; const dr = Math.exp(-5 * dt); this.vx *= dr; this.vy *= dr; this.x += this.vx * dt; this.y += this.vy * dt;
    this.life -= dt; if (this.life <= 0) { this.dead = true; return; }
    if (p.dead || g.state !== 'playing') return;
    const d = Math.hypot(p.x - this.x, p.y - this.y);
    if (this.kind === 'shiba' && d < 380) { this.barkT = (this.barkT || rand(0.5, 2)) - dt; if (this.barkT <= 0) { this.barkT = rand(2.5, 4.5); g.audio.bark(this.x, this.y); } }
    if (this.kind === 'coin' && d < 120 && this.t > 0.25) { const s = 520 * dt / (d || 1); this.x += (p.x - this.x) * Math.min(1, s); this.y += (p.y - this.y) * Math.min(1, s); }
    if (d < p.r + 14 && this.t > 0.2) this.collect(p);
  }
  collect(by) {
    const g = this.g, p = by || g.player;
    switch (this.kind) {
      case 'coin': (g.p2 ? g.player : p).money += this.val; g.audio.coin(); break;
      case 'ammo': {
        const owned = p.weapons.filter(w => w.owned && !w.def.infinite);
        if (owned.length) { const w = owned.includes(p.weapon) ? p.weapon : pick(owned); const n = Math.ceil(w.def.ammoPack * 0.35); w.reserve += n; g.toast(`+${n} munitions · ${w.def.name}`, '#d8d2c4'); }
        else { p.grenades++; g.toast('+1 grenade', '#d8d2c4'); }
        g.audio.pickup(); break;
      }
      case 'med': { const h = Math.round(25 * p.healMul); p.hp = Math.min(p.maxHp, p.hp + h); g.toast(`+${h} santé`, '#7fd18b'); g.audio.pickup(); break; }
      case 'grenade': p.grenades++; g.toast('+1 grenade', '#d8d2c4'); g.audio.pickup(); break;
      case 'weapon': {
        const w = p.weapons[this.val];
        if (!w.owned) { w.owned = true; w.ammo = w.magSize(); w.reserve = w.def.ammoPack; p.switchTo(this.val); g.notice('Arme trouvée', `${w.def.name} · touche ${this.val + 1}`, '#f0b25a'); }
        else { w.reserve += w.def.ammoPack; g.toast(`+${w.def.ammoPack} munitions · ${w.def.name}`, '#d8d2c4'); }
        g.audio.pickup(); break;
      }
      case 'key': case 'fuel': g.onObjectivePickup(this, p); g.audio.pickup(); break;
      case 'shiba': {
        g.shibaFound.add(this.zone + '-' + this.val); const n = g.shibaFound.size;
        g.notice('Shiba sauvé', `${n} / ${SHIBAS_TOTAL}${n === SHIBAS_TOTAL ? ' · le Paradis t\'attend' : ''}`, '#ffb46a'); g.audio.bark(this.x, this.y, true); g.audio.pickup();
        for (let i = 0; i < 16; i++) g.spawnP({ x: this.x, y: this.y, z: 10, vx: rand(-90, 90), vy: rand(-90, 90), vz: rand(80, 200), grav: 400, life: 0.9, type: 'spark', size: 2, emissive: true, color: '#ffd27a' });
        if (n === SHIBAS_TOTAL) g.unlock('shibas'); if (g.mode === 'story') g.adoptBuddy(this.x, this.y); break;
      }
      case 'battery': p.battery = Math.min(100, p.battery + 35); g.toast(`+35 % de pile · lampe à ${Math.round(p.battery)} %`, '#efe3a2'); g.audio.pickup(); break;
      case 'fetish': {
        const h = Math.round(35 * p.healMul); p.hp = Math.min(p.maxHp, p.hp + h); p.stamina = 100; g.run.fetish++; if (g.run.fetish >= 6) g.unlock('glutton');
        g.toast(`${CHARS[p.char].fetish} : +${h} santé, endurance pleine`, '#7fd18b'); g.quip('fetish'); g.audio.pickup(); break;
      }
    }
    this.dead = true;
  }
}
class Survivor {
  constructor(g, x, y, zone, idx) { const d = SURVIVORS[idx]; this.g = g; this.x = x; this.y = y; this.r = 12; this.zone = zone; this.hp = 60; this.state = 'idle'; this.dead = false; this.name = d.name; this.who = d.who; this.coat = d.coat; this.line = d.line; this.walkT = 0; this.hurtT = 0; this.dir = 0; }
  update(dt) {
    const g = this.g, p = g.player; if (this.hurtT > 0) this.hurtT -= dt;
    if (this.state === 'idle') { if (!p.dead && dist2(p.x, p.y, this.x, this.y) < 44 * 44) { this.state = 'follow'; g.toast(`${this.name} (${this.who}) te suit : ramène-le au point de sauvegarde`, '#7fd18b'); g.audio.pickup(); } }
    else if (!p.dead) {
      const dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1;
      if (d > 46) { const sp = Math.min(240, (d - 40) * 4); this.x += dx / d * sp * dt; this.y += dy / d * sp * dt; this.walkT += dt * 9; this.dir = Math.atan2(dy, dx); }
      g.collideWorld(this);
    }
    for (const z of g.hash.query(this.x, this.y, 50, g._q)) if (!z.dead && z.spawnT <= 0 && dist2(z.x, z.y, this.x, this.y) < (z.r + this.r + 4) ** 2) { this.hp -= 12 * dt * g.diff.dmg; this.hurtT = 0.2; }
    if (this.hp <= 0) { this.dead = true; if (g.run.sv) g.run.sv[this.zone] = 3; g.bleed(this.x, this.y, 0, 0, 12); g.splat(this.x, this.y, 16); g.toast(`${this.name} n'a pas survécu.`, '#b0231c'); }
  }
}
class Particle {
  init(o) {
    this.x = o.x; this.y = o.y; this.z = o.z || 0; this.vx = o.vx || 0; this.vy = o.vy || 0; this.vz = o.vz || 0;
    this.life = this.max = o.life || 1; this.size = o.size || 2; this.color = o.color || null; this.type = o.type || 'dot';
    this.grav = o.grav || 0; this.drag = o.drag == null ? 2 : o.drag; this.rot = o.rot || 0; this.vr = o.vr || 0; this.grow = o.grow || 0;
    this.emissive = !!o.emissive; this.bake = !!o.bake; this.text = o.text; this.dead = false; this.bounced = false; return this;
  }
  update(dt, g) {
    this.life -= dt; if (this.life <= 0) { if (this.bake) g.bakeParticle(this); this.dead = true; return; }
    const dr = Math.exp(-this.drag * dt); this.vx *= dr; this.vy *= dr; this.x += this.vx * dt; this.y += this.vy * dt; this.rot += this.vr * dt; this.size += this.grow * dt;
    if (this.grav) {
      this.vz -= this.grav * dt; this.z += this.vz * dt;
      if (this.z <= 0) {
        this.z = 0;
        if (this.type === 'casing' && !this.bounced) { this.bounced = true; this.vz = Math.abs(this.vz) * 0.35; this.vx *= 0.5; this.vy *= 0.5; this.vr *= 0.5; }
        else if (this.bake) { g.bakeParticle(this); this.dead = true; }
        else { this.vz = 0; this.vx *= 0.7; this.vy *= 0.7; }
      }
    } else this.z += this.vz * dt;
  }
}

