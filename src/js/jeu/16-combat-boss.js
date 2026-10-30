// ============================================================ jeu : combat, apparitions et boss
mixin(Game, {
  // ---------- apparitions
  inCone(x, y) { const p = this.player; const d = Math.hypot(x - p.x, y - p.y); return d < 620 && Math.abs(angDiff(p.aim, Math.atan2(y - p.y, x - p.x))) < 0.75; },
  findSpawnPoint(k) {
    const p = this.player, Z = ZONES[k];
    const sp = this.level.spawners.filter(s => s.zone === k);
    for (let t = 0; t < 8 && sp.length; t++) { const s = pick(sp); const d = Math.hypot(s.x - p.x, s.y - p.y); if (d > 300 && d < 1100 && !this.inCone(s.x, s.y)) return s; }
    for (let t = 0; t < 14; t++) {
      const x = rand(Z.x0 + 40, Z.x1 - 40), y = rand(ST + 40, SB - 40), d = Math.hypot(x - p.x, y - p.y);
      if (d > 430 && d < 950 && !this.inCone(x, y) && !this.level.queryRect(x - 16, y - 16, 32, 32).some(o => rectDist(x, y, o) < 18)) return { x, y, kind: 'dark' };
    }
    return null;
  },
  spawnAt(type, k, aggro) {
    if (this.zombies.length >= 220) return null; const s = this.findSpawnPoint(k); if (!s) return null;
    const z = new Zombie(this, type, s.x + rand(-6, 6), s.y + rand(-6, 6), s.kind === 'door' ? 'door' : s.kind === 'sewer' ? 'sewer' : 'dark');
    z.aggro = true; if (this.dailyMod && this.dailyMod.id === 'tanks') z.maxHp = z.hp = z.hp * 1.6; this.zombies.push(z); if (s.anim !== undefined) s.anim = 1;
    if (s.kind === 'sewer') for (let i = 0; i < 5; i++) this.spawnP({ x: s.x, y: s.y, vx: rand(-40, 40), vy: rand(-40, 40), life: 1, type: 'smoke', size: 8, grow: 12 });
    if (type === 'dog') { const n = randi(1, 3); for (let i = 0; i < n && this.zombies.length < 220; i++) { const d = new Zombie(this, 'dog', s.x + rand(-26, 26), s.y + rand(-26, 26), z.spawnKind); d.aggro = true; d.spawnT += i * 0.15; this.zombies.push(d); } if (!this.dogTip && this.mode !== 'training') { this.dogTip = true; this.toast('Meute de chiens : quand un chien s\'accroupit en grognant, roule !', '#ff8a5a'); } }
    return z;
  },
  spawnMiniBoss(k) {
    if (this.mode !== 'story' || this.activeZone !== k || (this.bossRef && !this.bossRef.dead)) return;
    const s = this.findSpawnPoint(k) || { x: this.player.x + 400, y: this.player.y }, b = new MiniBoss(this, s.x, s.y, k); this.bossEntry(b);
    this.zombies.push(b); this.bossRef = b; this.audio.roar(1.1); this.shake(0.7); this.banner(MINI_BOSSES[k].title, MINI_BOSSES[k].sub); this.torchFlicker = 0.8;
  },
  // entrée du boss : 3 mises en scène par boss, tirées au hasard, et un endroit qui change
  bossEntry(b) {
    const v = BOSS_PICK[b.bkind] || 0, p = this.player, E = BOSS_ENTRIES[b.bkind][v], T = b.ultimate || !b.mini ? 2.6 : 2.2;
    const hosp = this.mode === 'hospital', k = clamp(this.activeZone, 0, 3), Z = ZONES[k];
    const x0 = hosp ? HOSP.morgue + 70 : Z.x0 + 80, x1 = hosp ? ZONES[0].x1 - 70 : Z.x1 - 80, aim = p.aim || 0;
    const spot = (a, d) => { for (let t = 0; t < 12; t++) { const aa = a + (t ? rand(-0.6, 0.6) : 0), dd = d * (t ? rand(0.8, 1.15) : 1), x = clamp(p.x + Math.cos(aa) * dd, x0, x1), y = clamp(p.y + Math.sin(aa) * dd, ST + 60, SB - 60); if (Math.hypot(x - p.x, y - p.y) > d * 0.65 && !this.level.pointObstacle(x, y) && !this.level.queryRect(x - 40, y - 40, 80, 80).some(o => rectDist(x, y, o) < 34)) return { x, y }; } return null; };
    let at = null;
    if (E.where === 'behind') at = spot(aim + Math.PI, 150);
    else if (E.where === 'near') at = spot(aim + pick([-1, 1]) * Math.PI / 2, 190);
    else if (E.where !== 'keep') at = spot(aim + pick([0, 0.5, -0.5, Math.PI / 2, -Math.PI / 2]), rand(300, 380));
    if (at) { b.x = at.x; b.y = at.y; }
    b.entry = { fx: E.fx, prop: E.prop, T, v, tx: b.x, ty: b.y, label: E.label }; b.state = 'intro'; b.st = T;
    if (E.fx === 'run') { const a = Math.atan2(b.y - p.y, b.x - p.x); b.entry.fx0 = clamp(b.x + Math.cos(a) * 520, x0, x1); b.entry.fy0 = clamp(b.y + Math.sin(a) * 300, ST + 40, SB - 40); b.x = b.entry.fx0; b.y = b.entry.fy0; }
    if (E.fx === 'drop') b.jumpZ = 600;
    if (E.dark) this.blackoutT = Math.max(this.blackoutT, T * 0.75);
    if (E.label) this.later(0.3, () => this.floatText(b.entry.tx, b.entry.ty - 80, E.label, '#ffd23a'));
    this.cine = { b, t: 0, t0: performance.now() }; this.input.mdown = false;
    if (E.fx === 'drop' && E.impact) this.later(T * 0.55, () => { if (b.dead) return; this.shake(1); this.audio.explosion(1); this.scorch(b.x, b.y, 80); this.shockwaves.push(new Shockwave(this, b.x, b.y, 260, 18 * this.diff.dmg)); });
    return v;
  },
  spawnBoss() {
    const b = new Boss(this, PLAZA, ST + 24); this.bossEntry(b); this.zombies.push(b); this.bossRef = b; this.level.obj[3].spawned = true;
    if (this.mode === 'survival') { b.maxHp = b.hp = b.maxHp * (0.6 + this.surv.wave * 0.08); }
    this.audio.roar(1.2); this.shake(0.9); this.banner("L'Abomination", 'Quelque chose enfonce la porte de la Mairie'); this.torchFlicker = 1.2;
    this.later(2.6, () => this.quip('boss'));
    for (let i = 0; i < 20; i++) this.spawnP({ x: PLAZA + rand(-30, 30), y: ST + 20, z: rand(10, 60), vx: rand(-200, 200), vy: rand(40, 250), vz: rand(50, 200), grav: 600, life: 1.5, type: 'debris', size: rand(3, 6), bake: true, color: '#2a2420' });
  },
  // ---------- combat
  hitObstacle(o, dmg, x, y, src) {
    switch (o.kind) {
      case 'car':
        if (o.wreck) return; o.hp -= dmg; o.byPlayer = src === 'bullet' || src === 'rail' || src === 'fire' || src === 'explosion'; this.triggerAlarm(o); if (src === 'bullet') this.audio.metal(0.7, this.audio.at(x, y).pan);
        if (o.hp <= 0) this.destroyCar(o); break;
      case 'barrel':
        if (o.dead) return; o.hp -= dmg;
        if (o.hp <= 0) { o.dead = true; this.level.removeObstacle(o); const cx = o.x + o.w / 2, cy = o.y + o.h / 2; if (o.light) o.light.i = 0;
          if (o.pumpkin) for (let i = 0; i < 16; i++) this.spawnP({ x: cx, y: cy, z: 12, vx: rand(-220, 220), vy: rand(-220, 220), vz: rand(80, 260), grav: 700, life: 2, type: 'gib', size: rand(3, 6), bake: true, color: pick(['#e8761c', '#c85a0c', '#f2c25a']) });
          this.later(0.05, () => { this.explosion(cx, cy, o.pumpkin ? 120 : 135, o.pumpkin ? 110 : 130, 'barrel'); this.fires.push(new FireArea(this, cx, cy, 55, o.pumpkin ? 3 : 5)); }); }
        break;
      case 'machine': if (o.broken) return; o.hp -= dmg; if (o.hp <= 0) this.breakMachine(o); break;
      default: if (src === 'bullet') this.audio.metal(0.3, this.audio.at(x, y).pan);
    }
  },
  triggerAlarm(o) {
    if (o.alarm > 0 || o.alarmCd > 0 || o.wreck) return;
    o.alarm = 12; this.audio.alarmStart(o); this.makeNoise(o.x + o.w / 2, o.y + o.h / 2, 900);
    if (!this.alarmTip) { this.alarmTip = true; this.toast('Alarme déclenchée : la horde converge vers la voiture', '#f0b25a'); }
  },
  destroyCar(o) {
    if (o.wreck) return; o.wreck = true; o.alarm = 0; this.audio.alarmStop(o);
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    if (o.explosive) { this.explosion(cx, cy, 165, 150, o.byPlayer ? 'car' : 'carz'); o.burning = 12; this.fires.push(new FireArea(this, cx, cy + 6, 62, 7)); }
    else { for (let i = 0; i < 14; i++) this.spawnP({ x: cx + rand(-20, 20), y: cy, z: 20, vx: rand(-60, 60), vy: rand(-60, 60), life: rand(1, 2), type: 'smoke', size: 10, grow: 14 }); this.sparks(cx, cy, 0, -1, 12); this.audio.metal(1); o.smoking = 20; }
  },
  breakMachine(o) { o.broken = true; o.charges = 0; this.sparks(o.x + o.w / 2, o.y + o.h, 0, 1, 16); this.audio.metal(1); if (dist2(o.x, o.y, this.player.x, this.player.y) < 900 * 900) this.toast('Un distributeur de soins a été détruit', '#a39e93'); },
  explosion(x, y, R, dmg, src) {
    this.netEmit(['boom', Math.round(x), Math.round(y), Math.round(R)]);
    let killed = 0, hitN = 0;
    for (const z of this.hash.query(x, y, R + 40, [])) {
      if (z.dead) continue; const dx = z.x - x, dy = z.y - y, d = Math.hypot(dx, dy) || 1; if (d > R + z.r) continue;
      const f = 1 - Math.min(1, d / (R + z.r)) * 0.6; z.knock(dx / d * 650 * f, dy / d * 650 * f); z.aggro = true;
      if (src !== 'bomber' && src !== 'decoy') z.burn = Math.max(z.burn, 1.6);
      z.damage(dmg * f, dx / d, dy / d, 'explosion'); if (z.dead) killed++; hitN++;
    }
    if (src === 'car' && killed >= 8) this.unlock('alarm');
    for (const p of this.players()) if (!p.dead) { const d = Math.hypot(p.x - x, p.y - y); if (d < R) { const f = 1 - d / R, mul = { rocket: 0.35, grenade: 0.45, mine: 0.3, decoy: 0.3, car: 0.55, barrel: 0.55, bomber: 0.9 }[src] ?? 0.5; const a = dmg * mul * f * this.diff.dmg; if (a > 2) p.hurt(a, x, y, 520 * f); } }
    if (dmg > 0) for (const o of this.level.queryRect(x - R, y - R, R * 2, R * 2)) {
      if (o.kind !== 'car' && o.kind !== 'barrel' && o.kind !== 'machine') continue;
      if (rectDist(x, y, o) < R) this.later(0.08 + Math.random() * 0.12, () => this.hitObstacle(o, dmg * 1.3, x, y, src === 'bomber' || src === 'carz' ? 'zexplosion' : 'explosion'));
    }
    this.addLight(x, y, R * 3.2, '255,150,70', 1.8, 0.55); this.shake(Math.min(1, R / 220));
    for (let i = 0; i < 26; i++) { const a = rand(0, TAU), s = rand(40, R * 2.4); this.spawnP({ x, y, z: rand(4, 20), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rand(20, 120), life: rand(0.3, 0.7), type: 'fire', size: rand(8, 16), emissive: true, drag: 3.5 }); }
    for (let i = 0; i < 14; i++) { const a = rand(0, TAU), s = rand(20, R); this.spawnP({ x, y, z: 10, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(1, 2.2), type: 'smoke', size: rand(10, 18), grow: 22, drag: 1.5 }); }
    for (let i = 0; i < 12; i++) { const a = rand(0, TAU), s = rand(100, 360); this.spawnP({ x, y, z: 10, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rand(100, 300), grav: 700, life: 2, type: 'debris', size: rand(2, 5), bake: true, color: '#1d1b19' }); }
    this.spawnP({ x, y, life: 0.35, type: 'ring', size: R * 0.3, grow: R * 3, emissive: true });
    this.scorch(x, y, R * 0.6);
    const a = this.audio.at(x, y); this.audio.explosion(a.v, a.pan);
    this.makeNoise(x, y, 1000);
    return hitN;
  },
  railShot(x, y, a, dmg) {
    const dx = Math.cos(a), dy = Math.sin(a); let len = 1500, hitO = null;
    for (const o of this.level.queryRect(Math.min(x, x + dx * len) - 2, Math.min(y, y + dy * len) - 2, Math.abs(dx * len) + 4, Math.abs(dy * len) + 4)) { if (LOWK.has(o.kind)) continue; const t = rayRect(x, y, dx, dy, o, len); if (t < len) { len = t; hitO = o; } }
    const hitSet = new Set();
    for (let s = 0; s <= len; s += 40) for (const z of this.hash.query(x + dx * s, y + dy * s, 70, [])) {
      if (z.dead || hitSet.has(z) || z.spawnT > 0) continue; const px = z.x - x, py = z.y - y, t = px * dx + py * dy; if (t < 0 || t > len) continue;
      const perp = Math.abs(px * dy - py * dx); if (perp < z.r + 9) { hitSet.add(z); z.knock(dx * 300, dy * 300); z.damage(dmg, dx, dy, 'rail'); }
    }
    const ex = x + dx * len, ey = y + dy * len;
    if (hitO) { this.hitObstacle(hitO, dmg, ex, ey, 'rail'); this.sparks(ex, ey, -dx, -dy, 10); }
    this.beams.push({ x1: x, y1: y, x2: ex, y2: ey, life: 0.3, max: 0.3, dead: false });
    for (let s = 0; s < len; s += 220) this.addLight(x + dx * s, y + dy * s, 200, '140,210,255', 0.9, 0.18);
    return hitSet.size > 0;
  },
  spit(x, y, tx, ty, big) { this.acids.push(new Acid(this, x, y, tx, ty, big)); this.audio.spit(x, y); },
  onZombieKilled(z, src) {
    if (this.state !== 'playing') return;
    this.netEmit(['die', z.nid, Math.round(z.x), Math.round(z.y)]);
    if (this.mode === 'training') { this.trainKill(z); return; }
    const T = ZTYPES[z.type]; this.kills++; this.noteKill(z);
    { const now = this.time; this.recentKills = (this.recentKills || []).filter(t0 => now - t0 < 8); this.recentKills.push(now);
      const k0 = this.activeZone, o0 = k0 >= 0 && this.level.obj[k0];
      if (this.mode === 'story' && o0 && (k0 < 3 ? o0.done : o0.dead) && this.director.queue <= 0 && !(this.cleared || (this.cleared = []))[k0] && !this.zombies.some(o => o !== z && !o.dead)) {
        this.cleared[k0] = true; this.finFx = currentFinisher(); this.slowMo(2.2, 'SECTEUR NETTOYÉ'); this.slowCd = now + 20; this.recentKills = [];
        const bonus = Math.round(3000 * this.diff.score); this.score += bonus; this.player.money += 150; this.later(0.6, () => this.toast(`Secteur nettoyé : +${fmt(bonus)} points, +$150`, '#ffd23a')); this.audio.objective();
      } else if (this.recentKills.length >= 12 && !(this.slowCd > now) && !this.zombies.some(o => o !== z && !o.dead && o.aggro && dist2(o.x, o.y, this.player.x, this.player.y) < 700 * 700)) { this.slowMo(1.2, 'HORDE NETTOYÉE'); this.slowCd = now + 20; this.recentKills = []; } }
    const pts = Math.round(T.score * this.mult * this.diff.score); this.score += pts;
    if (this.mult < 5 && this.mult + 0.1 >= 5) this.quip('streak');
    this.mult = Math.min(this.mult + 0.1, 25); this.maxMult = Math.max(this.maxMult, this.mult); this.multPulse = 1;
    if (this.mult >= 10) this.unlock('mult10');
    if (z.type === 'riot') { this.run.riot++; if (this.run.riot >= 20) this.unlock('riot'); }
    this.floatText(z.x, z.y - 34, '+' + fmt(pts), this.mult >= 5 ? '#ff6a45' : '#f0b25a');
    if (mutN('vamp') && !this.player.dead) this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2 * mutN('vamp'));
    const m = Math.max(1, Math.round((1 + 0.4 * mutN('money')) * T.money * this.diff.money * rand(0.8, 1.3))), n = Math.min(z.type === 'boss' ? 40 : 8, Math.ceil(m / 6));
    for (let i = 0; i < n; i++) this.pickups.push(new Pickup(this, 'coin', z.x + rand(-6, 6), z.y + rand(-6, 6), Math.max(1, Math.round(m / n))));
    const r = Math.random();
    if (r < 0.05) this.pickups.push(new Pickup(this, 'ammo', z.x, z.y, 0)); else if (r < 0.075) this.pickups.push(new Pickup(this, 'med', z.x, z.y, 0)); else if (r < 0.085) this.pickups.push(new Pickup(this, 'grenade', z.x, z.y, 0)); else if (r < 0.125) this.pickups.push(new Pickup(this, 'battery', z.x, z.y, 0));
    this.bleed(z.x, z.y, 0, 0, z.type === 'boss' ? 40 : 10);
    for (let i = 0; i < (z.type === 'brute' ? 6 : 3); i++) this.spawnP({ x: z.x, y: z.y, z: 14, vx: rand(-160, 160), vy: rand(-160, 160), vz: rand(60, 220), grav: 700, life: 2, type: 'gib', size: rand(3, 5), bake: true, color: '#5a1410' });
    this.bakeCorpse(z);
    if (z.type === 'bomber') { const x = z.x, y = z.y; this.later(src === 'explosion' ? 0.15 : 0.01, () => this.explosion(x, y, 100, 75, 'bomber')); }
    if (z.type === 'boss') this.onBossKilled(z);
  },
    gainXP(n, why) {
    n = Math.max(0, Math.round(n)); if (!n) return 0; const before = playerLevel(); Settings.xp = (Settings.xp || 0) + n; if (this.mode !== 'training') for (const q of this.players()) cstat(q.char).xp += n; Settings.save();
    const after = playerLevel();
    if (after > before) { const got = REWARDS.filter(r => r.lv > before && r.lv <= after); this.later(0.4, () => { this.achCards.push({ name: `Niveau ${after}${got.length ? ' · ' + got.map(r => r.name).join(', ') : ''}`, t: 3.8 }); this.audio.objective(); }); this.levelUps = (this.levelUps || 0) + (after - before); }
    return n;
  },
  flash() {
    const p = this.player; if (!hasReward('flash') || p.dead) return;
    if ((p.flashCd || 0) > 0) { this.toast(`Flash en recharge : ${Math.ceil(p.flashCd)} s`, '#8b867b'); return; }
    if (p.battery < 15) { this.toast('Pas assez de pile pour le flash', '#8b867b'); return; }
    p.flashCd = 10; p.battery -= 15; this.flashFx = 0.35; this.audio.tone({ f: 2400, f2: 600, dur: 0.25, type: 'square', g: 0.12 }); this.audio.noise({ f: 4000, type: 'highpass', dur: 0.2, g: 0.2 });
    let n = 0; const R = 440 * lampRange(), H = lampHalf() + 0.15;
    for (const z of this.hash.query(p.x, p.y, R, this._q)) { if (z.dead) continue; const d = Math.hypot(z.x - p.x, z.y - p.y); if (d < R && Math.abs(angDiff(p.aim, Math.atan2(z.y - p.y, z.x - p.x))) < H) { if (z.type === 'boss') { if (z.state === 'chase') z.setState('stunned', 1.2); } else z.stun = Math.max(z.stun || 0, 2.4); n++; } }
    if (n) this.floatText(p.x, p.y - 40, `ÉBLOUIS ×${n}`, '#fff6c8');
  },
  noteKill(z) {
    if (this.mode === 'training') return; const k = beastKey(z), S = Settings.seen || (Settings.seen = {}); if (S[k] == null) this.noteNewBeast(k); S[k] = (S[k] || 0) + 1;
    if (HALLOWEEN && COSTUMES.includes(z.costume)) {
      const y = new Date().getFullYear(); if (!Settings.hw || Settings.hw.y !== y) Settings.hw = { y, n: 0 }; Settings.hw.n++;
      if (Settings.hw.n >= HW_GOAL && !Settings.pumpkin) { Settings.pumpkin = true; this.later(0.4, () => { this.achCards.push({ name: 'Halloween · Tête de citrouille débloquée', t: 4.5 }); this.audio.objective(); }); }
      else if (!Settings.pumpkin && Settings.hw.n % 10 === 0) this.floatText(z.x, z.y - 52, `🎃 ${Settings.hw.n} / ${HW_GOAL}`, '#ff9a3a');
    }
    Settings.save();
  },
  noteNewBeast(k) { const A = this.actBeasts || (this.actBeasts = []); if (!A.includes(k)) A.push(k); },
  // récapitulatif de fin d'acte : « tu as découvert… »
  takeActBeasts() { const A = this.actBeasts || []; this.actBeasts = []; return A.filter(k => BESTIARY.some(b => b.k === k)); },
  // le bestiaire se remplit dès qu'un monstre entre dans le champ de vision
  spotMonsters() {
    if (this.mode === 'training' || this.state !== 'playing') return; const p = this.player; if (!p || p.dead) return; const S = Settings.seen || (Settings.seen = {}); let nw = null;
    for (const z of this.zombies) { if (z.dead || z.target || z.spawnT > 0) continue; const k = beastKey(z); if (S[k] != null) continue; if (dist2(z.x, z.y, p.x, p.y) < 520 * 520) { S[k] = 0; nw = k; this.noteNewBeast(k); } }
    if (nw) Settings.save(); // la découverte est annoncée en fin d'acte, pas pendant la partie
  },
  onBossKilled(b) {
    this.audio.setTheme(this.mode === 'secret' ? 'paradis' : this.mode === 'hospital' ? 'parking' : ['gare', 'boulevard', 'parking', 'mairie'][clamp(this.activeZone, 0, 3)]); this.blackoutT = 0; for (const h of this.hazards) if (h.kind !== 'barrier' && h.kind !== 'ram') h.dead = true;
    if (b.mini) {
      this.slowMo(1.6, b.title + ' EST TOMBÉ'); this.audio.roar(1); this.shake(0.8); if (this.bossRef === b) this.bossRef = null;
      const pts = Math.round(6000 * this.diff.score); this.score += pts; this.player.money += 400; this.unlock('boss');
      for (const kd of ['med', 'ammo', 'grenade']) this.pickups.push(new Pickup(this, kd, b.x + rand(-30, 30), b.y + rand(-20, 20), 0));
      this.later(1.2, () => this.toast(`${b.title.toLowerCase().replace(/^./, m => m.toUpperCase())} vaincu : +${fmt(pts)} points, +$400`, '#ffd23a'));
      if (this.mode === 'hospital') { this.level.obj[0].dead = true; Settings.hospital = true; Settings.save(); for (const z of this.zombies) if (!z.dead) z.burn = Math.max(z.burn, 0.01); if (this.hcamp) this.later(1.6, () => { if (this.state === 'playing') this.finishCampaign(); }); else this.later(3.2, () => { if (this.mode === 'hospital' && this.state === 'playing') this.showEnd(true); }); }
      return;
    }
    this.slowMo(1.8, b.title || 'K.O.');
    this.level.obj[3].dead = true; this.audio.roar(1.3); this.shake(1);
    for (let i = 0; i < 6; i++) this.later(i * 0.25, () => this.explosion(b.x + rand(-40, 40), b.y + rand(-30, 30), 90, 0, 'decoy'));
    this.score += Math.round(10000 * this.diff.score); this.unlock('boss');
    if (this.mode === 'secret') { this.unlock('ultimate'); this.score += Math.round(25000 * this.diff.score); this.later(3, () => this.comic.show('paradise', () => this.showEnd('secret'))); return; }
    if (this.mode === 'survival') { this.level.obj[3].dead = false; this.later(1.2, () => this.toast('L\'Abomination est tombée. Pour l\'instant.', '#f0b25a')); return; }
    if (!this.zoneHit) this.unlock('scratch');
    this.later(1.6, () => { this.level.setGate(EXIT.x0, false); this.banner("L'Abomination est tombée", "Rejoins l'hélicoptère à l'est"); this.audio.objective(); this.audio.siren(); });
    for (const z of this.zombies) if (!z.dead) z.burn = Math.max(z.burn, 0.01);
  },
  // cinématique d'entrée d'un boss : zoom, bandes noires, tout le reste est figé
  updateCine(dt, inp) {
    const C = this.cine, b = C.b, E = b.entry; C.t += dt;
    const I = this.input, skip = C.t > 0.5 && (I.touchMode ? (I.lastTap || 0) > C.t0 + 300 : (inp.firePressed || inp.roll || inp.melee || inp.special || inp.grenade || inp.reload || inp.cycle || I.pc.size > 0));
    if (skip && b.state === 'intro') { b.st = Math.min(b.st, 0.01); if (E) E.popped = true; }
    this.hash.clear(); for (const z of this.zombies) if (!z.dead) this.hash.insert(z);
    if (!b.dead) b.update(dt);
    this.updateCommon(dt); if (this.blackoutT > 0) this.blackoutT -= dt;
    this.cineK = Math.min(1, (this.cineK || 0) + dt * 3);
    const k = 1 - Math.exp(-4 * dt), tx = E ? E.tx : b.x, ty = (E ? E.ty : b.y) - b.r * 1.4;
    this.cam.x = lerp(this.cam.x, tx, k); this.cam.y = lerp(this.cam.y, ty, k); this.zoom = lerp(this.zoom || 1, 1.6, k);
    if (b.dead || b.state !== 'intro') { this.cine = null; this.bannerObj = null; this.audio.roar(1.2); this.shake(0.9); this.flashFx = Math.max(this.flashFx || 0, 0.22); this.player.inv = Math.max(this.player.inv, 0.6); this.spawnP({ x: b.x, y: b.y, life: 0.5, type: 'ring', size: 30, grow: 520, emissive: true }); this.toast(`${bossName(b)} : ${BOSS_HINT[b.bkind] || 'attention à ses attaques'}`, '#ffd23a'); }
  }
});
