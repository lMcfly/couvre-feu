// ============================================================ armes
class Weapon {
  constructor(def) { this.def = def; this.owned = def.id === 'pistol'; this.lvl = { dmg: 0, rate: 0, mag: 0 }; this.ammo = this.magSize(); this.reserve = def.infinite ? Infinity : 0; }
  dmg() { return this.def.dmg * (1 + 0.25 * this.lvl.dmg) * (1 + 0.2 * mutN('dmg')); }
  rate() { return this.def.rate * Math.pow(0.86, this.lvl.rate); }
  magSize() { return Math.round(this.def.mag * (1 + 0.35 * this.lvl.mag)); }
  reloadTime() { return this.def.reload * Math.pow(0.9, this.lvl.mag) * Math.pow(0.75, mutN('reload')); }
  snapshot() { return { owned: this.owned, lvl: { ...this.lvl }, ammo: this.ammo, reserve: this.reserve }; }
  restore(s) { this.owned = s.owned; this.lvl = { ...s.lvl }; this.ammo = s.ammo; this.reserve = s.reserve; }
}

// ============================================================ joueur
const ROLL_T = 0.3;
class Player {
  constructor(g, x, y) {
    this.g = g; this.x = x; this.y = y; this.r = 14; this.vx = 0; this.vy = 0; this.kx = 0; this.ky = 0;
    this.maxHp = 100; this.hp = 100; this.hpTrail = 100; this.stamina = 100; this.staminaDelay = 0; this.exhausted = false;
    this.aim = 0; this.weapons = WEAPONS.map(d => new Weapon(d)); this.cur = 0; this.cd = 0; this.reloadT = 0;
    this.charge = 0; this.holdT = 0; this.charging = false; this.meleeCd = 0; this.meleeT = 0; this.inv = 0; this.armor = 0;
    this.grenades = 3; this.mines = 1; this.decoys = 2; this.money = 0; this.throwCd = 0; this.walkT = 0; this.recoil = 0;
    this.dead = false; this.hidden = false; this.muzzleT = 0; this.sprinting = false; this.noiseT = 0; this.dotSnd = 0;
    this.char = g.charKey || 'pedro'; this.lowQuip = false;
    if (this.char === 'pedro') this.grenades = 4;
    if (this.char === 'chewie') { this.maxHp = this.hp = this.hpTrail = 140; this.r = 15; }
    if (this.char === 'dobby') this.r = 12;
    this.lastHurt = -99;
    this.battery = 100; this.lowBattery = false; this.spCd = 0; this.playDead = 0;
  }
  get healMul() { return this.char === 'pedro' ? 1.5 : 1; }
  get spMax() { return { pedro: 25, fiona: 30, zeus: 28, dobby: 12, chewie: 22, dragon: 25 }[this.char] || 25; }
  torchK() { const b = this.battery; return b >= 25 ? 1 : 0.3 + 0.7 * b / 25; }
  useSpecial() {
    const g = this.g;
    if (this.spCd > 0) { g.audio.empty(); g.toast(`Capacité en recharge : ${Math.ceil(this.spCd)} s`, '#8b867b'); return; }
    this.spCd = this.spMax; g.run.special++; if (g.run.special >= 10) g.unlock('special'); g.quip('special');
    if (this.char === 'pedro') g.salsa(this.x, this.y);
    else if (this.char === 'zeus') { if (!g.zeusLightning(this)) this.spCd = 1; }
    else if (this.char === 'dobby') g.dobbyBlink(this);
    else if (this.char === 'chewie') g.chewieRoar(this);
    else if (this.char === 'dragon') g.dragonBreath(this);
    else { this.playDead = 5; for (const z of g.zombies) z.aggro = false; g.audio.death(); g.toast('Fiona fait la morte : les zombies l\'ignorent 5 s. Tirer la trahit.', '#c9f27a'); }
  }
  breakCover() { if (this.playDead > 0) { this.playDead = 0; this.g.toast('Fiona se relève !', '#c9f27a'); } }
  get weapon() { return this.weapons[this.cur]; }
  switchTo(i) {
    if (i < 0 || i >= this.weapons.length || !this.weapons[i].owned || i === this.cur) return;
    this.cur = i; this.reloadT = 0; this.charge = 0; this.holdT = 0; this.charging = false; this.cd = Math.max(this.cd, 0.15);
    this.g.audio.ui(); this.g.weaponFlash = 1.6; this.g.audio.flame(false);
  }
  cycle(dir) { let i = this.cur; for (let n = 0; n < 6; n++) { i = (i + dir + 6) % 6; if (this.weapons[i].owned) { this.switchTo(i); return; } } }
  startReload() { const w = this.weapon; if (this.reloadT > 0 || w.ammo >= w.magSize() || w.reserve <= 0) return; this.reloadT = w.reloadTime(); this.charging = false; this.charge = 0; this.g.audio.reload(); }
  update(dt, inp) {
    const g = this.g;
    let mx = inp.moveX, my = inp.moveY; const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
    let speed = (this.char === 'dobby' ? 222 : 195) * (1 + 0.1 * mutN('speed'));
    if (this.slowT > 0) { this.slowT -= dt; speed *= 0.5; } if (this.dazeT > 0) { this.dazeT -= dt; speed *= 0.12; }
    if (mutN('regen') && g.state === 'playing' && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + 1.5 * mutN('regen') * dt);
    if (this.char === 'zeus' && g.time - this.lastHurt > 4 && this.hp < this.maxHp && g.state === 'playing') this.hp = Math.min(this.maxHp, this.hp + 3 * dt);
    if (inp.sprint && ml > 0.1 && !this.exhausted && this.stamina > 0) {
      speed *= 1.65; this.stamina -= (this.char === 'fiona' ? 27 : 38) * dt; this.staminaDelay = 0.9; this.sprinting = true;
      if (this.stamina <= 0) { this.stamina = 0; this.exhausted = true; }
    } else {
      this.sprinting = false;
      if (this.staminaDelay > 0) this.staminaDelay -= dt; else this.stamina = Math.min(100, this.stamina + 24 * dt);
      if (this.exhausted && this.stamina > 30) this.exhausted = false;
    }
    if (this.carry) speed *= 0.85;
    this.rollCd = (this.rollCd || 0) - dt;
    if (inp.roll && this.rollCd <= 0 && !(this.rollT > 0) && this.stamina >= 18 && !this.carry && this.playDead <= 0) {
      this.rollDir = ml > 0.1 ? Math.atan2(my, mx) : this.aim; this.rollT = ROLL_T; this.rollCd = 0.55; this.stamina -= 18; this.staminaDelay = 0.6; this.charging = false; this.charge = 0;
      g.audio.melee(); for (let i = 0; i < 6; i++) g.spawnP({ x: this.x, y: this.y, vx: rand(-60, 60), vy: rand(-60, 60), life: 0.5, type: 'smoke', size: 5, grow: 10 });
    }
    const k = 1 - Math.exp(-14 * dt);
    if (this.rollT > 0) {
      this.rollT -= dt; const rs = 560 * (0.45 + 0.75 * Math.max(0, this.rollT) / ROLL_T);
      this.vx = Math.cos(this.rollDir) * rs; this.vy = Math.sin(this.rollDir) * rs; inp.fire = inp.firePressed = false;
    } else { this.vx = lerp(this.vx, mx * speed, k); this.vy = lerp(this.vy, my * speed, k); }
    this.x += (this.vx + this.kx) * dt; this.y += (this.vy + this.ky) * dt;
    const kd = Math.exp(-8 * dt); this.kx *= kd; this.ky *= kd;
    g.collideWorld(this);
    if (ml > 0.1) this.walkT += dt * speed / 26;
    this.aim = Math.atan2(inp.aimY - this.y, inp.aimX - this.x);
    this.cd -= dt; this.inv -= dt; this.meleeCd -= dt; this.throwCd -= dt; this.meleeT -= dt; this.muzzleT -= dt; this.noiseT -= dt;
    this.recoil = Math.max(0, this.recoil - dt * 8);
    this.spCd = Math.max(0, this.spCd - dt); if (this.playDead > 0) this.playDead -= dt;
    if (g.state === 'playing') {
      this.battery = Math.max(0, this.battery - g.diff.battery * (g.dailyMod && g.dailyMod.id === 'lamp' ? 2.5 : 1) * Math.pow(0.5, mutN('lamp')) * dt);
      if (this.battery < 20 && !this.lowBattery) { this.lowBattery = true; g.toast('Lampe faible : trouve des piles', '#f0b25a'); }
      if (this.battery > 40) this.lowBattery = false;
    }
    if (inp.special) this.useSpecial();
    this.hpTrail = this.hpTrail > this.hp ? Math.max(this.hp, this.hpTrail - 40 * dt) : this.hp;
    if (inp.slot >= 0) this.switchTo(inp.slot);
    if (inp.cycle) this.cycle(inp.cycle);
    const w = this.weapon;
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) { const take = Math.min(w.magSize() - w.ammo, w.reserve); w.ammo += take; if (w.reserve !== Infinity) w.reserve -= take; this.reloadT = 0; }
    }
    if (inp.reload) this.startReload();
    const isPistol = w.def.id === 'pistol';
    if (this.reloadT <= 0) {
      if (isPistol) {
        if (inp.firePressed) { if (w.ammo > 0 && this.cd <= 0) { this.fire(false); this.charging = true; this.holdT = 0; this.charge = 0; } else if (w.ammo <= 0) this.startReload(); else this.charging = true; }
        if (this.charging && inp.fire && w.ammo > 0) { this.holdT += dt; if (this.holdT > 0.18) { const prev = this.charge; this.charge = Math.min(1, this.charge + dt / 0.9); if (prev < 1 && this.charge >= 1) g.audio.chargeReady(); } }
        if (this.charging && !inp.fire) { if (this.charge >= 0.35 && w.ammo > 0) this.fire(true); this.charging = false; this.charge = 0; this.holdT = 0; }
      } else if (inp.fire && this.cd <= 0) {
        if (w.ammo > 0) this.fire(false);
        else if (w.reserve > 0) this.startReload();
        else if (inp.firePressed) { g.audio.empty(); g.toast(`${w.def.name} : plus de munitions`, '#e2792f'); }
      }
      // chargeur vide : on recharge tout de suite, même gâchette enfoncée (souris, manette ou stick tactile)
      if (w.ammo <= 0 && w.reserve > 0) this.startReload();
      // plus aucune munition, ni chargeur ni réserve : on passe tout seul à la meilleure arme qui a encore des balles
      else if (w.ammo <= 0 && w.reserve <= 0 && !w.def.infinite) {
        let best = -1; this.weapons.forEach((o, k) => { if (k !== this.cur && o.owned && (o.ammo > 0 || o.reserve > 0) && (best < 0 || o.def.tier > this.weapons[best].def.tier)) best = k; });
        if (best >= 0) { this.switchTo(best); g.toast(`${w.def.name} vide · ${this.weapons[best].def.name} en main`, '#8b867b'); }
      }
    } else { this.charging = false; this.charge = 0; }
    g.audio.flame(w.def.id === 'flamer' && inp.fire && w.ammo > 0 && this.reloadT <= 0);
    if (inp.melee && !g.tryInteract(this)) this.melee();
    if (inp.grenade) this.throwItem('grenade', inp);
    if (inp.mine) this.throwItem('mine', inp);
    if (inp.decoy) this.throwItem('decoy', inp);
  }
  muzzle() { return { x: this.x + Math.cos(this.aim) * 22, y: this.y + Math.sin(this.aim) * 22 }; }
  fire(charged) {
    const g = this.g; if (this.isP2 && g.net === 'host' && this.weapon.def.type === 'bullet' && !charged) { g._noNetFx = true; try { this.fire0(charged); } finally { g._noNetFx = false; } return; } this.fire0(charged);
  }
  fire0(charged) {
    const g = this.g, w = this.weapon, d = w.def; this.cd = w.rate(); w.ammo--; this.breakCover();
    const m = this.muzzle(); this.recoil = 1; this.muzzleT = 0.05;
    if (this.noiseT <= 0 && d.type !== 'flame') { g.makeNoise(this.x, this.y, 650); this.noiseT = 0.25; }
    const shot = { hit: false }; if (d.type !== 'flame') g.stats.shots++;
    if (d.type === 'bullet') {
      for (let i = 0; i < d.pellets; i++) {
        const a = this.aim + (Math.random() - 0.5) * d.spread * (this.sprinting ? 1.6 : 1);
        const bl = new Bullet(g, m.x, m.y, a, d.speed * rand(0.9, 1.1), charged ? w.dmg() * 6 : w.dmg(), charged ? 9 : d.pierce, charged); bl.shot = shot; bl.p2 = this.isP2; g.bullets.push(bl);
      }
      g.addLight(m.x, m.y, charged ? 340 : d.id === 'shotgun' ? 280 : 210, '255,205,130', charged ? 1.4 : 1, 0.06);
      g.spawnP({ x: this.x, y: this.y, z: 16, vx: Math.cos(this.aim + 1.6) * rand(60, 110), vy: Math.sin(this.aim + 1.6) * rand(60, 110), vz: rand(90, 160), grav: 600, drag: 1.5, life: 3, type: 'casing', size: 3, bake: true, color: '#b8913c', vr: rand(-20, 20) });
      for (let i = 0; i < 4; i++) g.spawnP({ x: m.x, y: m.y, z: 14, vx: Math.cos(this.aim + rand(-0.4, 0.4)) * rand(150, 400), vy: Math.sin(this.aim + rand(-0.4, 0.4)) * rand(150, 400), life: 0.12, type: 'spark', size: 1.5, emissive: true });
      if (d.id === 'shotgun') { this.kx -= Math.cos(this.aim) * 120; this.ky -= Math.sin(this.aim) * 120; }
    } else if (d.type === 'flame') {
      for (let i = 0; i < 2; i++) { const a = this.aim + (Math.random() - 0.5) * d.spread; g.flames.push(new Flame(g, m.x, m.y, a, d.speed * rand(0.85, 1.1), w.dmg())); }
      g.addLight(this.x + Math.cos(this.aim) * 110, this.y + Math.sin(this.aim) * 110, 300, '255,140,50', 0.8, 0.05);
      if (this.noiseT <= 0) { g.makeNoise(this.x, this.y, 400); this.noiseT = 0.5; }
    } else if (d.type === 'rail') {
      if (g.railShot(m.x, m.y, this.aim, w.dmg())) g.stats.hits++;
      this.kx -= Math.cos(this.aim) * 160; this.ky -= Math.sin(this.aim) * 160;
    } else if (d.type === 'rocket') {
      const rk = new Rocket(g, m.x, m.y, this.aim, w.dmg(), d.radius); rk.shot = shot; g.rockets.push(rk);
      g.addLight(m.x, m.y, 260, '255,170,90', 1, 0.08);
      this.kx -= Math.cos(this.aim) * 200; this.ky -= Math.sin(this.aim) * 200;
      for (let i = 0; i < 10; i++) g.spawnP({ x: this.x - Math.cos(this.aim) * 16, y: this.y - Math.sin(this.aim) * 16, z: 14, vx: -Math.cos(this.aim + rand(-0.6, 0.6)) * rand(80, 240), vy: -Math.sin(this.aim + rand(-0.6, 0.6)) * rand(80, 240), life: rand(0.5, 1), type: 'smoke', size: rand(6, 12), grow: 20 });
    }
    g.shake(d.shake * (charged ? 3 : 1));
    if (d.type !== 'flame') g.audio.shot(d.id, charged);
  }
  melee() {
    if (this.meleeCd > 0) return; const g = this.g; this.breakCover();
    this.meleeCd = 0.55; this.meleeT = 0.2; this.stamina = Math.max(0, this.stamina - 12); this.staminaDelay = 0.6; g.audio.melee();
    for (const z of g.hash.query(this.x, this.y, 110, [])) {
      if (z.dead || z.spawnT > 0) continue; const dx = z.x - this.x, dy = z.y - this.y, d = Math.hypot(dx, dy) || 1;
      if (d > 78 + z.r) continue;
      if (Math.abs(angDiff(this.aim, Math.atan2(dy, dx))) < 1.25 || d < z.r + this.r + 10) { const big = this.char === 'chewie'; z.knock(dx / d * (big ? 800 : 620), dy / d * (big ? 800 : 620)); z.stun = Math.max(z.stun, big ? 0.8 : 0.45); z.damage(big ? 36 : 18, dx / d, dy / d, 'melee'); z.aggro = true; }
    }
    for (let i = 0; i < 8; i++) { const a = this.aim + (i / 7 - 0.5) * 2.2; g.spawnP({ x: this.x + Math.cos(a) * 40, y: this.y + Math.sin(a) * 40, z: 10, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, life: 0.18, type: 'spark', size: 2, emissive: true }); }
  }
  throwItem(kind, inp) {
    if (this.throwCd > 0) return; const g = this.g;
    const key = kind === 'grenade' ? 'grenades' : kind === 'mine' ? 'mines' : 'decoys';
    if (this[key] <= 0) { g.audio.empty(); g.toast(kind === 'grenade' ? 'Plus de grenades' : kind === 'mine' ? 'Plus de mines' : 'Plus de fusées-leurres', '#8b867b'); return; }
    this[key]--; this.throwCd = 0.45;
    if (kind === 'mine') { g.mines.push(new Mine(g, this.x, this.y)); g.audio.beep(this.x, this.y); return; }
    let dx = inp.aimX - this.x, dy = inp.aimY - this.y; const d = Math.hypot(dx, dy) || 1; const dd = clamp(d, 60, 360); /* portée max : environ la moitié de l'écran */
    g.throwables.push(new Throwable(g, kind, this.x, this.y, this.x + dx / d * dd, this.y + dy / d * dd)); g.audio.melee();
  }
  hurt(dmg, sx, sy, kb = 260) {
    const g = this.g; if (this.inv > 0 || this.rollT > 0 || this.dead || g.state !== 'playing') return;
    dmg *= 1 - 0.15 * this.armor; this.hp -= dmg; this.inv = 0.35; g.zoneHit = true; this.lastHurt = g.time;
    g.mult = Math.max(1, g.mult - 1); g.hurtFlash = Math.min(1, 0.35 + dmg / 40); g.shake(0.25 + dmg / 80); g.audio.hurt();
    const dx = this.x - sx, dy = this.y - sy, d = Math.hypot(dx, dy) || 1; this.kx += dx / d * kb; this.ky += dy / d * kb; if (this.isP2 && g.net === 'host') g.netEmit(['kb', Math.round(dx / d * kb), Math.round(dy / d * kb)]);
    g.bleed(this.x, this.y, dx / d, dy / d, 6);
    if (this.hp <= 0) { if (this.isP2) g.onP2Death(this); else g.onPlayerDeath(); }
    else if (this.hp < 30 && !this.lowQuip) { this.lowQuip = true; g.quip('low'); }
  }
  hurtDot(a) {
    const g = this.g; if (this.dead || g.state !== 'playing') return;
    this.hp -= a * (1 - 0.15 * this.armor); g.hurtFlash = Math.max(g.hurtFlash, 0.18); g.zoneHit = true; this.lastHurt = g.time;
    if (g.time - this.dotSnd > 0.45) { this.dotSnd = g.time; g.audio.hurt(); }
    if (this.hp <= 0) { if (this.isP2) g.onP2Death(this); else g.onPlayerDeath(); }
  }
}

