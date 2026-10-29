// ============================================================ jeu : effets visuels
mixin(Game, {
  addLight(x, y, r, c, i, life) { this.netEmit(['light', Math.round(x), Math.round(y), Math.round(r), c, netR(i), netR(life)]); this.lights.push({ x, y, r, c, i, life, max: life, dead: false }); },
  spawnP(o) { if (this.particles.length >= (Settings.quality === 'eco' ? 350 : TOUCH ? 900 : 1800)) return null; const p = new Particle().init(o); this.particles.push(p); return p; },
  floatText(x, y, text, color) { this.netEmit(['text', Math.round(x), Math.round(y), text, color]); this.texts.push({ x, y, text, color, life: 1, dead: false }); },
  bleed(x, y, dx, dy, n) {
    this.netEmit && this.netEmit(['bleed', Math.round(x), Math.round(y), netR(dx), netR(dy), Math.round(n)]);
    for (let i = 0; i < n; i++) this.spawnP({ x, y, z: rand(8, 20), vx: dx * rand(40, 180) + rand(-60, 60), vy: dy * rand(40, 180) + rand(-60, 60), vz: rand(20, 140), grav: 700, drag: 1.5, life: 2, type: 'blood', size: rand(2, 4), bake: true, color: Math.random() < 0.5 ? '#6b0d0b' : '#4f0907' });
  },
  sparks(x, y, dx, dy, n) { for (let i = 0; i < n; i++) { const a = Math.atan2(dy, dx) + rand(-0.9, 0.9), s = rand(120, 380); this.spawnP({ x, y, z: 14, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rand(0, 120), grav: 500, life: rand(0.15, 0.35), type: 'spark', size: 1.4, emissive: true }); } },
  bakeParticle(p) {
    const g = this.level.ground, x = p.x, y = p.y;
    if (p.type === 'blood' || p.type === 'gib') g.decal(x, y, 8, c => { c.fillStyle = p.color; c.globalAlpha = 0.85; c.beginPath(); c.ellipse(x, y, p.size * (p.type === 'gib' ? 1.2 : 1.6), p.size, Math.random() * 3, 0, TAU); c.fill(); });
    else if (p.type === 'casing') g.decal(x, y, 4, c => { c.fillStyle = '#8a6d2e'; c.translate(x, y); c.rotate(p.rot); c.fillRect(-2, -1, 4, 2); });
    else if (p.type === 'debris') g.decal(x, y, 6, c => { c.fillStyle = p.color || '#222'; c.fillRect(x - p.size / 2, y - p.size / 2, p.size, p.size); });
  },
  splat(x, y, s) { this.level.ground.decal(x, y, s * 2, c => { c.fillStyle = '#4d0907'; for (let i = 0; i < 5; i++) { c.globalAlpha = rand(0.5, 0.85); c.beginPath(); c.ellipse(x + rand(-s, s) * 0.7, y + rand(-s, s) * 0.45, rand(s * 0.3, s), rand(s * 0.2, s * 0.55), rand(0, TAU), 0, TAU); c.fill(); } }); },
  scorch(x, y, r) { this.netEmit(['scorch', Math.round(x), Math.round(y), Math.round(r)]); this.level.ground.decal(x, y, r, c => { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(0.6, 'rgba(10,8,6,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }); },
  bakeCorpse(z) {
    const s = z.r, rot = z.dir + rand(-0.6, 0.6);
    this.splat(z.x, z.y, s * 1.4);
    this.level.ground.decal(z.x, z.y, s * 3, c => {
      c.translate(z.x, z.y); c.rotate(rot); c.globalAlpha = 0.95;
      c.fillStyle = shade(z.cloth, -0.25); c.beginPath(); c.ellipse(0, 0, s * 1.05, s * 0.68, 0, 0, TAU); c.fill();
      c.fillStyle = shade(z.pants === undefined ? '#333333' : '#3a3a3a', -0.2); c.fillRect(-s * 1.9, -s * 0.45, s * 0.9, s * 0.3); c.fillRect(-s * 1.8, s * 0.12, s * 0.8, s * 0.3);
      c.fillStyle = shade(z.skin, -0.3); c.beginPath(); c.arc(s * 1.25, rand(-3, 3), s * 0.48, 0, TAU); c.fill();
      c.strokeStyle = shade(z.skin, -0.35); c.lineWidth = s * 0.28; c.lineCap = 'round'; c.beginPath(); c.moveTo(s * 0.4, -s * 0.5); c.lineTo(s * 1.2, -s * 1.1); c.moveTo(s * 0.3, s * 0.5); c.lineTo(s * 0.9, s * 1.2); c.stroke();
    });
  },
  updateWeather(dt) {
    const S = VS * DPR * (this.zoom || 1), hw = W / 2 / S + 60, hh = H / 2 / S + 60, cx = this.cam.x, cy = this.cam.y;
    if (Settings.rain && this.mode !== 'hospital') {
      while (this.rain.length < (TOUCH ? 150 : 260)) this.rain.push({ x: cx + rand(-hw, hw), y: cy + rand(-hh, hh), z: rand(0, 380), v: rand(650, 900) });
      for (const d of this.rain) {
        d.z -= d.v * dt; d.x -= 60 * dt;
        if (d.z <= 0) {
          if (Math.random() < 0.35 && this.particles.length < 1500) this.spawnP({ x: d.x, y: d.y, life: 0.25, type: 'splash', size: 1, grow: 14, drag: 0 });
          d.x = cx + rand(-hw, hw); d.y = cy + rand(-hh, hh); d.z = rand(250, 420);
        }
        if (d.x < cx - hw || d.x > cx + hw || d.y < cy - hh || d.y > cy + hh) { d.x = cx + rand(-hw, hw); d.y = cy + rand(-hh, hh); }
      }
    } else this.rain.length = 0;
    if (Settings.fog && !TOUCH) {
      while (this.fogs.length < 9) this.fogs.push({ x: cx + rand(-hw, hw), y: cy + rand(-hh, hh), r: rand(180, 340), vx: rand(8, 22), a: rand(0.05, 0.1) });
      for (const f of this.fogs) { f.x += f.vx * dt; if (f.x - f.r > cx + hw) f.x = cx - hw - f.r; if (f.x + f.r < cx - hw - 400) f.x = cx + hw + f.r; if (f.y < cy - hh - f.r || f.y > cy + hh + f.r) f.y = cy + rand(-hh, hh); }
    } else this.fogs.length = 0;
  }
});
