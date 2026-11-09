// ============================================================ jeu : effets visuels
mixin(Game, {
  addLight(x, y, r, c, i, life) { this.netEmit(['light', Math.round(x), Math.round(y), Math.round(r), c, netR(i), netR(life)]); this.lights.push({ x, y, r, c, i, life, max: life, dead: false }); },
  spawnP(o) { if (this.particles.length >= (Settings.quality === 'eco' ? 350 : PERF_LOW ? 500 : TOUCH ? 900 : 1800)) return null; const p = new Particle().init(o); this.particles.push(p); return p; },
  // ---------- pièges du décor : ils frappent tout le monde, zombies comme survivants
  trapNear(p) { for (const t of this.level.traps || []) if (rectDist(p.x, p.y, t.ob) < 40) return t; return null; },
  useTrap(t, by) {
    if (t.cd > 0) { this.toast(`${t.kind === 'fence' ? 'La clôture' : 'La bouche d\'incendie'} se recharge (${Math.ceil(t.cd)} s)`, '#8b867b'); return; }
    t.on = t.kind === 'fence' ? 6 : 4; t.cd = t.on + 14; t.ang = by.aim || 0;
    this.netEmit(['trap', t.ob.oid, netR(t.ang)]); this.trapFx(t);
  },
  trapFx(t) {
    if (t.kind === 'fence') { this.audio.tone({ f: 60, f2: 120, dur: 0.5, type: 'sawtooth', g: 0.12 }); this.notice('Clôture électrifiée', 'Attention : elle grille tout le monde', '#9fd6ff'); }
    else { this.audio.noise && this.audio.noise({ f: 1800, f2: 900, dur: 0.6, g: 0.2 }); this.notice('Bouche d\'incendie ouverte', 'Le jet repousse tout le monde', '#9fd6ff'); }
  },
  updateTraps(dt) {
    for (const t of this.level.traps || []) {
      if (t.cd > 0) t.cd -= dt; if (t.on <= 0) continue; t.on -= dt;
      const host = !this.netGuest;
      if (t.kind === 'fence') {
        if (Math.random() < dt * 22) { const x = t.x + Math.random() * t.w; this.spawnP({ x, y: t.y + 8, z: 6 + Math.random() * 14, vx: rand(-60, 60), vy: rand(-40, 40), vz: rand(20, 80), life: 0.25, type: 'spark', size: 1.6, emissive: true, color: '#bfe6ff' }); }
        if (!host) continue;
        const inside = e => e.x > t.x - e.r && e.x < t.x + t.w + e.r && e.y > t.y - e.r && e.y < t.y + t.h + e.r;
        for (const z of this.zombies) if (!z.dead && z.spawnT <= 0 && inside(z)) { z.damage(70 * dt, 0, 0, 'shock'); z.stun = Math.max(z.stun, 0.35); if (Math.random() < dt * 8) this.sparks(z.x, z.y - 14, 0, -1, 3); }
        for (const p of this.players()) if (!p.dead && inside(p)) { this.hitCause = 'trap'; p.hurtDot(22 * dt); this.hitCause = null; p.ky += (p.y < t.y + 8 ? -1 : 1) * 900 * dt; /* la décharge rejette le survivant hors de la clôture */ }
      } else {
        const o = t.ob, hx = o.x + 8, hy = o.y + 8, ca = Math.cos(t.ang), sa = Math.sin(t.ang), R = 300;
        for (let i = 0; i < 6; i++) { const a = t.ang + rand(-0.22, 0.22), sp = rand(420, 620); this.spawnP({ x: hx, y: hy, z: 14, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rand(10, 70), grav: 300, life: rand(0.4, 0.6), type: 'spark', size: 3, color: 'rgba(200,232,255,.95)', drag: 1 }); }
        if (!host) continue;
        const cone = (e, f) => { const dx = e.x - hx, dy = e.y - hy, d = Math.hypot(dx, dy) || 1; if (d > R || (dx * ca + dy * sa) / d < 0.85) return; const k = (1 - d / R) * f * dt; e.kx += ca * k; e.ky += sa * k; return true; };
        for (const z of this.zombies) if (!z.dead && z.type !== 'boss' && cone(z, 5200 * z.kbMul)) { z.stun = Math.max(z.stun, 0.25); z.burn = 0; }
        for (const p of this.players()) if (!p.dead) cone(p, 3600);
        for (const f of this.fires) { const dx = f.x - hx, dy = f.y - hy, d = Math.hypot(dx, dy) || 1; if (d < R && (dx * ca + dy * sa) / d > 0.85) f.life = Math.min(f.life, 0.2); /* le jet éteint les flammes */ }
      }
    }
  },
  // cri du Hurleur : la horde alentour s'excite et les lampes grésillent
  scream(z) {
    this.netEmit(['scream', Math.round(z.x), Math.round(z.y)]); this.screamFx(z.x, z.y);
    this.torchFlicker = Math.max(this.torchFlicker, 1.6);
    for (const o of this.zombies) if (!o.dead && o !== z && o.type !== 'boss' && !o.mini && dist2(o.x, o.y, z.x, z.y) < 520 * 520) { o.aggro = true; o.frenzy = 4; }
  },
  screamFx(x, y) { this.audio.tone({ f: 1500, f2: 420, dur: 0.75, type: 'sawtooth', g: 0.08 }); this.shake(0.22); this.floatText(x, y - 46, 'AAAAAH !', '#9fe0ff'); for (const k of [0, 0.12, 0.24]) this.later(k, () => this.spawnP({ x, y: y - 20, life: 0.55, type: 'ring', size: 20, grow: 600, emissive: true, color: '#9fe0ff' })); },
  floatText(x, y, text, color) {
    this.netEmit(['text', Math.round(x), Math.round(y), text, color]);
    for (let k = 0; k < 6 && this.texts.some(t => Math.abs(t.x - x) < 56 && Math.abs(t.y - y) < 16); k++) y -= 17; // pas de texte posé sur un autre
    this.texts.push({ x, y, text, color, life: 1, dead: false });
  },
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
  // ---------- Noël : les zombies à bonnet font venir le Père Noël zombie ; le battre offre son bonnet
  updateNoel(dt) {
    if (!NOEL || Settings.santaHat || this.santaDone || this.net === 'guest' || this.mode === 'hospital') return;
    if (xmCount() < XM_GOAL || (this.bossRef && !this.bossRef.dead) || this.player.dead || this.cine) return;
    if ((this.santaT = (this.santaT ?? 12) - dt) <= 0) this.spawnSanta();
  },
  spawnSanta() {
    this.santaDone = true; const s = this.findSpawnPoint(clamp(this.activeZone, 0, 3)) || { x: this.player.x + 420, y: this.player.y }, b = new MiniBoss(this, s.x, s.y, 4);
    this.bossEntry(b); this.zombies.push(b); this.bossRef = b; this.audio.roar(1.1); this.shake(0.7); this.banner(MINI_BOSSES[4].title, MINI_BOSSES[4].sub); this.torchFlicker = 0.8;
  },
  // ---------- radio des survivants pendant la partie : alertes et petites nouvelles, espacées d'au moins 14 s
  radio(text, force) {
    if (this.mode === 'training' || this.state !== 'playing') return; const now = this.time;
    if (!force && now - (this.radioAt ?? -99) < 14) return; this.radioAt = now;
    this.toast(`📻 Radio : ${text}`, '#9fd6e6'); this.audio.noise({ f: 2600, type: 'bandpass', q: 2, dur: 0.35, g: 0.1 }); this.audio.noise({ f: 1800, type: 'bandpass', q: 3, dur: 0.15, g: 0.07, delay: 0.45 });
  },
  dirName(x, y) { const p = this.player, a = Math.atan2(p.y - y, x - p.x), i = ((Math.round(a / (TAU / 8)) % 8) + 8) % 8; return ['à l\'est', 'au nord-est', 'au nord', 'au nord-ouest', 'à l\'ouest', 'au sud-ouest', 'au sud', 'au sud-est'][i]; },
  updateRadio(dt) {
    const p = this.player; if (p.dead || this.cine || this.net === 'guest') return;
    if ((this.radioT = (this.radioT ?? rand(25, 40)) - dt) > 0) return; this.radioT = rand(40, 70);
    const near = this.zombies.filter(z => !z.dead && z.type !== 'boss' && dist2(z.x, z.y, p.x, p.y) > 300 * 300 && dist2(z.x, z.y, p.x, p.y) < 900 * 900);
    if (near.length >= 10) { let sx = 0, sy = 0; for (const z of near) { sx += z.x; sy += z.y; } this.radio(pick(RADIO_LIVE.horde).replace('{dir}', this.dirName(sx / near.length, sy / near.length)).replace('{n}', near.length)); return; }
    this.radio(pick(p.hp < 35 ? RADIO_LIVE.low : RADIO_LIVE.idle));
  },
  // ---------- ravitaillement par hélico : une caisse sous une fusée rouge ; bon matériel, mais la horde converge dessus
  updateDrops(dt) {
    const p = this.player; if (p.dead || this.cine || this.mode === 'hospital') return;
    if ((this.dropT = (this.dropT ?? rand(60, 100)) - dt) > 0) return;
    this.dropT = rand(80, 130); if (this.pickups.some(k => k.kind === 'crate')) return;
    const Z = this.activeZone >= 0 ? ZONES[this.activeZone] : { x0: 0, x1: WORLD.w };
    for (let t = 0; t < 30; t++) {
      const a = rand(0, TAU), d = rand(350, 620), x = Math.round(clamp(p.x + Math.cos(a) * d, Z.x0 + 90, Z.x1 - 90)), y = Math.round(clamp(p.y + Math.sin(a) * d * 0.6, ST + 80, SB - 50));
      if (Math.hypot(x - p.x, y - p.y) < 300 || this.level.queryRect(x - 30, y - 30, 60, 60).some(o => rectDist(x, y, o) < 30)) continue; /* jamais sur la tête du joueur, même au bord d'un secteur */
      const pk = new Pickup(this, 'crate', x, y, 0); pk.life = 75; pk.vx = pk.vy = 0; pk.drop = DROP_FALL; this.pickups.push(pk);
      this.notice('Ravitaillement largué', 'Une fusée rouge marque la caisse : la horde l\'a vue aussi', '#ff6a4a'); this.later(1, () => this.radio(pick(RADIO_LIVE.crate).replace('{dir}', this.dirName(x, y)), true));
      for (let i = 0; i < 14; i++) this.audio.noise({ f: 260, f2: 120, dur: 0.07, g: 0.22 * (1 - Math.abs(i - 7) / 8), delay: i * 0.11 }); /* rotor qui passe */
      this.director.queue += Math.round(6 * this.diff.pop); return;
    }
  },
  crateLand(pk) {
    this.audio.tone({ f: 110, f2: 45, dur: 0.4, g: 0.4 }); this.shake(0.25); this.audio.noise({ f: 2400, f2: 1200, dur: 1.4, g: 0.12, delay: 0.3 }); /* la fusée s'allume */
    for (let i = 0; i < 12; i++) this.spawnP({ x: pk.x + rand(-18, 18), y: pk.y + rand(-6, 6), vx: rand(-90, 90), vy: rand(-40, 40), life: rand(0.6, 1.1), type: 'smoke', size: 8, grow: 14 });
  },
  openCrate(pk, p) {
    const cash = Math.round(250 * this.diff.money); (this.p2 ? this.player : p).money += cash; p.grenades = Math.min(9, p.grenades + 2); p.hp = Math.min(p.maxHp, p.hp + Math.round(30 * p.healMul));
    for (const w of p.weapons) if (own(w) && !w.def.infinite) w.reserve += Math.ceil(w.def.ammoPack * 0.5);
    new Pickup(this, 'scrap', pk.x, pk.y, 0).collect(p);
    this.notice('Caisse ouverte', `$${fmt(cash)} · 2 grenades · munitions · soins · une arme de fortune`, '#ff6a4a'); this.audio.objective();
    if (this.mode !== 'training') { carnet().drops++; this.stats.crates++; }
  },
  // ---------- nuit de pleine lune : zombies plus rapides, points et argent doublés ; l'hôte tire au sort, l'invité suit
  setMoon(on) {
    if (!!this.moon === on) return; this.moon = on; this.netEmit(['moon', on ? 1 : 0]);
    if (!on) { if (this.state === 'playing') this.toast('La lune rouge se cache derrière les nuages', '#c6c0b2'); return; }
    for (const z of this.zombies) if (!z.dead && z.type !== 'boss') z.speed *= MOON_SPEED;
    this.later(2.6, () => { if (this.moon) this.banner('Nuit de pleine lune', 'Les zombies courent plus vite, mais rapportent le double'); }); this.audio.roar(0.5);
    if (this.net !== 'guest') this.later(5, () => { if (this.moon) this.radio(pick(RADIO_LIVE.moon), true); });
    if (this.state === 'playing' && this.net !== 'guest') { carnet().moons++; this.stats.moons++; }
  },
  rollMoon(chance) { if (this.net !== 'guest') this.setMoon(Math.random() < chance); },
  // ---------- météo : clair, averse, brouillard, orage ; l'hôte décide, l'invité suit
  wxOn() { return (this.mode === 'story' || this.mode === 'survival') && !this.level.hosp; },
  setWeather(k) {
    const X = this.wx, W0 = NOEL && k === 'averse' ? { ...WEATHER[k], name: 'Tempête de neige', sub: 'Les flocons cachent tout au-delà de ta lampe' } : WEATHER[k]; if (!X || !W0 || X.k === k) return;
    X.k = k; X.t = rand(45, 80); if (k === 'orage') X.boltCd = rand(2, 5);
    this.netEmit(['wx', k]); this.notice(W0.name, W0.sub, W0.col); if (this.net !== 'guest') this.later(1.6, () => this.radio(pick(RADIO_LIVE.wx[NOEL && k === 'averse' ? 'neige' : k]), true));
    if (k === 'orage') this.audio.noise({ f: 300, f2: 50, dur: 2.6, g: 0.35, delay: 0.4 });
  },
  bolt() {
    const X = this.wx; if (!X) return; X.bolt = 0.5; X.boltCd = rand(7, 15); this.netEmit(['bolt']);
    const d = rand(0.3, 1.2); this.audio.noise({ f: 2200, f2: 300, dur: 0.35, g: 0.25, delay: d * 0.4 }); this.audio.noise({ f: 420, f2: 45, dur: 2.4, g: 0.55, delay: d }); this.audio.tone({ f: 55, f2: 30, dur: 1.6, g: 0.3, delay: d });
    if (this.state === 'playing') carnet().bolts++;
  },
  // intensité de l'éclair en cours : deux flashs rapprochés puis un reflux
  boltK() { const b = this.wx ? this.wx.bolt : 0; if (!(b > 0)) return 0; const v = b > 0.42 ? 1 : b > 0.34 ? 0.15 : b > 0.24 ? 0.85 : b / 0.24 * 0.45; return v * (Settings.calm ? 0.35 : 1); },
  updateWeather(dt) {
    const S = VS * DPR * (this.zoom || 1), hw = W / 2 / S + 60, hh = H / 2 / S + 60, cx = this.cam.x, cy = this.cam.y;
    const X = this.wx || (this.wx = { k: 'clair', t: rand(40, 70), vis: 1, fog: 0, rain: 1, bolt: 0, boltCd: 8 }), on = this.wxOn();
    if (this.state === 'playing' && on && this.net !== 'guest') {
      if ((X.t -= dt) <= 0) this.setWeather(X.k === 'clair' ? pick(['averse', 'brouillard', 'orage']) : Math.random() < 0.6 ? 'clair' : pick(['averse', 'brouillard', 'orage'].filter(k => k !== X.k)));
      if (X.k === 'orage' && (X.boltCd -= dt) <= 0) this.bolt();
    }
    if (!on) X.k = 'clair';
    const T = WEATHER[X.k], e = Math.min(1, dt * 0.4); X.vis += (T.vis - X.vis) * e; X.fog += (T.fog - X.fog) * e; X.rain += (T.rain - X.rain) * e; X.bolt = Math.max(0, X.bolt - dt);
    if (this.audio.rainG) this.audio.rainG.gain.value = (Settings.rain ? 0.05 : 0.012) * (0.55 + 0.45 * X.rain);
    if (Settings.rain && this.mode !== 'hospital') {
      const nr = Math.round((TOUCH ? 150 : 260) * X.rain * (PERF_LOW || Settings.quality === 'eco' ? 0.5 : 1)); if (this.rain.length > nr) this.rain.length = nr;
      while (this.rain.length < nr) this.rain.push({ x: cx + rand(-hw, hw), y: cy + rand(-hh, hh), z: rand(0, 380), v: rand(650, 900) });
      for (const d of this.rain) {
        d.z -= d.v * dt * (NOEL ? 0.22 : 1); d.x -= (NOEL ? 22 : 60) * dt; /* en décembre, la pluie tombe en flocons */
        if (d.z <= 0) {
          if (!NOEL && Math.random() < 0.35 && this.particles.length < 1500) this.spawnP({ x: d.x, y: d.y, life: 0.25, type: 'splash', size: 1, grow: 14, drag: 0 });
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
