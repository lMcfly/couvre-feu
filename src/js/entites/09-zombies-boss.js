// ============================================================ zombies
class Zombie {
  constructor(g, type, x, y, spawnKind) {
    const T = ZTYPES[type], D = g.diff;
    this.g = g; this.type = type; this.x = x; this.y = y; this.r = T.r; this.nid = ++NET_NID;
    this.maxHp = this.hp = T.hp * D.hp * (1 + Math.max(0, g.activeZone) * 0.08);
    this.speed = rand(T.speed[0], T.speed[1]); this.dmg = T.dmg * D.dmg; this.kbMul = T.kb;
    this.kx = 0; this.ky = 0; this.dir = rand(0, TAU); this.atkCd = rand(0, 0.5);
    this.spawnKind = spawnKind; this.spawnMax = spawnKind === 'sewer' ? 0.9 : spawnKind ? 0.6 : 0; this.spawnT = this.spawnMax;
    this.walkT = rand(0, 10); this.hitFlash = 0; this.burn = 0; this.flameCd = 0; this.stun = 0; this.dead = false;
    this.side = Math.random() < 0.5 ? 1 : -1; this.groanT = rand(2, 10); this.stuckT = 0; this.detour = 0; this.lx = x; this.ly = y;
    this.aggro = !!spawnKind; this.wx = null; this.wt = 0; this.lunge = 0;
    this.skin = type === 'screamer' ? '#a3a89a' : type === 'runner' ? '#8f7466' : type === 'brute' ? '#5f6b55' : type === 'bomber' ? '#86a05e' : type === 'spitter' ? '#6c8d6c' : pick(SKINS);
    this.cloth = type === 'screamer' ? '#6f93a0' : type === 'brute' ? '#2c2f2b' : type === 'bomber' ? '#4e5236' : pick(CLOTHS);
    this.pants = shade(pick(CLOTHS), -0.35);
    this.shootCd = rand(1.5, 3); this.spitWind = 0; this.bState = 'walk'; this.bT = 0; this.bCd = rand(1, 3); this.frenzy = 0;
    if (type === 'dog') { this.skin = pick(['#6b5a48', '#5a5048', '#7a6a52', '#4a4440']); this.bCd = rand(0.6, 1.4); }
    // zombie d'élite : un sur cinquante, doré ou enflammé, plus solide et qui lâche un bonus rare
    this.elite = type !== 'boss' && g.mode !== 'training' && g.state !== 'title' && Math.random() < 0.02 ? (Math.random() < 0.5 ? 'gold' : 'fire') : null;
    if (this.elite) { if (this.elite === 'gold') { this.skin = '#d4ad3c'; this.cloth = '#7a5a14'; } else { this.skin = '#8a3a1e'; this.cloth = '#2a1208'; } this.maxHp = this.hp = this.hp * 3; this.speed *= 1.12; this.dmg *= 1.3; this.aggro = true; }
    this.costume = HALLOWEEN && g.mode !== 'training' && (type === 'walker' || type === 'runner') && Math.random() < 0.3 ? pick(COSTUMES) : null;
  }
  knock(x, y) { this.kx += x * this.kbMul; this.ky += y * this.kbMul; }
  damage(a, dx, dy, src) {
    if (this.dead) return;
    if (this.type === 'riot' && (src === 'bullet' || src === 'fire' || src === 'melee') && (dx || dy)) {
      const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
      if (-(ux * Math.cos(this.dir) + uy * Math.sin(this.dir)) > 0.34) { this.g.shieldHit(this, ux, uy); this.aggro = true; return false; }
    }
    if (this.g.stats && this.g.state === 'playing') this.g.stats.dmg += Math.max(0, Math.min(a, this.hp));
    this.hp -= a; this.hitFlash = 0.08; this.aggro = true;
    if (this.type === 'screamer' && this.bState === 'scream' && this.hp > 0) { this.bState = 'stun'; this.bT = 0.8; this.bCd = rand(4, 6); this.g.floatText(this.x, this.y - 42, 'CHUT !', '#9fe0ff'); } /* touché pendant qu'il prend son souffle : le cri est coupé */
    this.g.bleed(this.x, this.y, dx, dy, Math.min(8, 2 + a / 10));
    if (src !== 'fire') this.g.audio.flesh(0.6);
    if (this.hp <= 0) this.die(src);
  }
  die(src) { if (this.dead) return; this.dead = true; this.g.onZombieKilled(this, src); }
  update(dt) {
    const g = this.g, p = g.targetFor(this);
    this.walkT += dt * (this.speed / 22) * (this.bState === 'charge' ? 3 : 1);
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.spawnT > 0) { this.spawnT -= dt; return; }
    this.atkCd -= dt; this.flameCd -= dt; this.lunge -= dt; if (this.stun > 0) this.stun -= dt;
    if (this.elite === 'fire') { this.burn = 0; if (Math.random() < dt * 14) g.spawnP({ x: this.x + rand(-7, 7), y: this.y, z: this.r * 1.6, vz: rand(40, 90), vx: rand(-15, 15), vy: rand(-15, 15), life: rand(0.3, 0.6), type: 'fire', size: rand(4, 8), emissive: true, drag: 1 }); } /* il brûle sans se consumer */
    if (this.burn > 0) {
      this.burn -= dt; this.hp -= 16 * dt;
      if (Math.random() < dt * 16) g.spawnP({ x: this.x + rand(-6, 6), y: this.y, z: this.r * 1.4, vz: rand(30, 70), vx: rand(-15, 15), vy: rand(-15, 15), life: rand(0.3, 0.6), type: 'fire', size: rand(4, 7), emissive: true, drag: 1 });
      if (this.hp <= 0) { this.die('fire'); return; }
    }
    const pdx = p.x - this.x, pdy = p.y - this.y, pd = Math.hypot(pdx, pdy) || 1;
    const playerOk = !p.dead && !p.hidden && g.state === 'playing' && !(p.playDead > 0);
    const fi = p.char === 'fiona';
    if (playerOk && !this.aggro && (pd < (fi ? 230 : 360) || (pd < (fi ? 380 : 560) && Math.abs(angDiff(p.aim, Math.atan2(-pdy, -pdx))) < 0.6))) this.aggro = true;
    let tx, ty, mode = 'wander', spd = this.speed;
    const att = g.attractions.length ? g.nearestAttraction(this.x, this.y) : null;
    if (att && (!playerOk || pd > 200)) { tx = att.x; ty = att.y; mode = 'attract'; }
    else if (playerOk && this.aggro) { tx = p.x; ty = p.y; mode = 'chase'; }
    else {
      if (this.wx == null || (this.wt -= dt) <= 0) {
        this.wt = rand(3, 7);
        const m = g.level.machines.find(m => !m.broken && dist2(m.x, m.y, this.x, this.y) < 400 * 400);
        if (m && Math.random() < 0.35) { this.wx = m.x + m.w / 2; this.wy = m.y + m.h + 8; }
        else { this.wx = this.x + rand(-220, 220); this.wy = clamp(this.y + rand(-200, 200), ST + 30, SB - 30); }
      }
      tx = this.wx; ty = this.wy; spd *= 0.35;
    }
    const dx = tx - this.x, dy = ty - this.y, d = Math.hypot(dx, dy) || 1;
    let ux = dx / d, uy = dy / d;
    if (mode === 'wander' && d < 16) { ux = 0; uy = 0; }
    if (mode === 'chase' && pd < 280 && pd > 40) { const s = this.side * 0.5 * (1 - pd / 280); const nx = ux - uy * s, ny = uy + ux * s, l = Math.hypot(nx, ny); ux = nx / l; uy = ny / l; }
    if (this.detour > 0) { this.detour -= dt; const nx = ux - uy * this.side * 1.4, ny = uy + ux * this.side * 1.4, l = Math.hypot(nx, ny); ux = nx / l; uy = ny / l; }
    let charging = false, leaping = false;
    switch (this.type) {
      case 'runner': if (mode === 'chase' && pd < 180) spd *= 1.15; break;
      case 'bomber':
        if (mode === 'chase' && pd < this.r + p.r + 12) { this.hp = 0; this.die('self'); return; }
        if (mode === 'chase' && pd < 150) spd *= 1.35; break;
      case 'spitter':
        if (mode === 'chase') {
          if (pd < 220) { ux = -ux; uy = -uy; spd *= 0.8; } else if (pd < 380) spd *= 0.2;
          this.shootCd -= dt;
          if (this.shootCd <= 0 && this.spitWind <= 0 && pd < 470 && g.level.lineClear(this.x, this.y, p.x, p.y)) { this.shootCd = rand(2.4, 3.6); this.spitWind = 0.45; }
          if (this.spitWind > 0) { this.spitWind -= dt; spd = 0; if (this.spitWind <= 0) g.spit(this.x, this.y - 10, p.x + p.vx * 0.5, p.y + p.vy * 0.5, false); }
        }
        break;
      case 'brute':
        if (this.bState === 'wind') { this.bT -= dt; spd = 0; if (this.bT <= 0) { this.bState = 'charge'; this.bT = 1.1; this.cdx = pdx / pd; this.cdy = pdy / pd; g.audio.groan(this.x, this.y, 'brute'); } }
        else if (this.bState === 'charge') { this.bT -= dt; ux = this.cdx; uy = this.cdy; spd = 380; charging = true; if (this.bT <= 0) { this.bState = 'walk'; this.bCd = 4; } if (Math.random() < dt * 20) g.spawnP({ x: this.x, y: this.y, vx: rand(-40, 40), vy: rand(-40, 40), life: 0.6, type: 'smoke', size: 6, grow: 14 }); }
        else if (this.bState === 'stun') { this.bT -= dt; spd = 0; if (this.bT <= 0) this.bState = 'walk'; }
        else { this.bCd -= dt; if (mode === 'chase' && pd < 330 && pd > 90 && this.bCd <= 0 && g.level.lineClear(this.x, this.y, p.x, p.y)) { this.bState = 'wind'; this.bT = 0.7; } }
        break;
      case 'screamer': // garde ses distances, prend son souffle puis hurle
        if (this.bState === 'scream') { this.bT -= dt; spd = 0; if (this.bT <= 0) { this.bState = 'walk'; this.bCd = rand(6, 9); g.scream(this); } }
        else if (this.bState === 'stun') { this.bT -= dt; spd = 0; if (this.bT <= 0) this.bState = 'walk'; }
        else if (mode === 'chase') {
          if (pd < 230) { ux = -ux; uy = -uy; spd *= 0.75; } else if (pd < 380) spd *= 0.25;
          this.bCd -= dt; if (this.bCd <= 0 && pd < 470 && this.stun <= 0 && g.level.lineClear(this.x, this.y, p.x, p.y)) { this.bState = 'scream'; this.bT = 0.9; g.audio.tone({ f: 260, f2: 820, dur: 0.9, type: 'sawtooth', g: 0.05 }); }
        }
        break;
      case 'dog':
        if (this.bState === 'crouch') { this.bT -= dt; spd = 0; this.cdx = pdx / pd; this.cdy = pdy / pd; if (this.bT <= 0) { this.bState = 'leap'; this.bT = 0.3; g.audio.tone({ f: 260, f2: 90, dur: 0.18, type: 'sawtooth', g: 0.12 }); } }
        else if (this.bState === 'leap') { this.bT -= dt; ux = this.cdx; uy = this.cdy; spd = 560; leaping = true; if (this.bT <= 0) { this.bState = 'walk'; this.bCd = rand(1.4, 2.2); } }
        else { this.bCd -= dt; if (mode === 'chase' && pd < 200 && pd > 55 && this.bCd <= 0 && this.stun <= 0 && g.level.lineClear(this.x, this.y, p.x, p.y)) { this.bState = 'crouch'; this.bT = 0.42; this.cdx = pdx / pd; this.cdy = pdy / pd; g.audio.tone({ f: 95, f2: 70, dur: 0.4, type: 'sawtooth', g: 0.1 }); } }
        break;
    }
    if (this.frenzy > 0) { this.frenzy -= dt; spd *= 1.35; } // excité par le cri d'un Hurleur
    // comportement de foule : séparation
    let sx = 0, sy = 0;
    const near = g.hash.query(this.x, this.y, this.r + 40, g._qs);
    for (let i = 0; i < near.length; i++) {
      const o = near[i]; if (o === this || o.dead || o.spawnT > 0) continue;
      const ox = this.x - o.x, oy = this.y - o.y, dd2 = ox * ox + oy * oy, md = this.r + o.r;
      if (dd2 < md * md && dd2 > 0.0001) {
        const dd = Math.sqrt(dd2), f = (md - dd) / md;
        if (charging) { o.knock(-ox / dd * 420 * f, -oy / dd * 420 * f); continue; }
        sx += ox / dd * f; sy += oy / dd * f;
      }
    }
    let vx = ux * spd + sx * 170, vy = uy * spd + sy * 170;
    if (this.stun > 0) { vx *= 0.1; vy *= 0.1; }
    this.lx = this.x; this.ly = this.y;
    this.x += (vx + this.kx) * dt; this.y += (vy + this.ky) * dt;
    const kd = Math.exp(-7 * dt); this.kx *= kd; this.ky *= kd;
    const hit = g.collideWorld(this);
    if (hit) {
      if (leaping) { this.bState = 'walk'; this.bCd = rand(1.4, 2.2); }
      else if (charging && hit.kind !== 'parapet') { this.bState = 'stun'; this.bT = 1.3; g.shake(0.25); g.hitObstacle(hit, 40, this.x, this.y, 'brute'); g.audio.metal(1); }
      else if (hit.kind === 'car' && hit.alarm > 0 && !hit.wreck) { hit.hp -= 7 * dt; if (hit.hp <= 0) g.destroyCar(hit); }
      else if (hit.kind === 'machine' && !hit.broken) { hit.hp -= 10 * dt; if (hit.hp <= 0) g.breakMachine(hit); }
    }
    if (mode !== 'wander' && spd > 1 && this.stun <= 0) {
      const moved = Math.hypot(this.x - this.lx, this.y - this.ly);
      if (moved < spd * dt * 0.25) this.stuckT += dt; else this.stuckT = Math.max(0, this.stuckT - dt);
      if (this.stuckT > 0.45) { this.stuckT = 0; this.side *= -1; this.detour = 0.7; }
    }
    if (Math.abs(vx) + Math.abs(vy) > 5) this.dir += angDiff(this.dir, Math.atan2(vy, vx)) * Math.min(1, dt * 8);
    if (playerOk) {
      const reach = this.r + p.r + 3;
      if (pd < reach && this.atkCd <= 0 && this.stun <= 0 && this.type !== 'bomber') {
        p.hurt(this.dmg * (charging ? 1.4 : leaping ? 1.6 : 1), this.x, this.y, charging ? 650 : leaping ? 420 : 260); this.atkCd = this.type === 'dog' ? 0.6 : 0.9; this.lunge = 0.15;
        if (charging) { this.bState = 'walk'; this.bCd = 4; }
        if (leaping) { this.bState = 'walk'; this.bCd = rand(1.4, 2.2); }
      }
    }
    if ((this.groanT -= dt) <= 0) { this.groanT = rand(5, 14); if (pd < 900) g.audio.groan(this.x, this.y, this.type); }
  }
}

// mises en scène d'entrée : fx = mouvement (rise, drop, fade, tv, run, burst, door), prop = décor dessiné, where = où il apparaît
const BOSS_ENTRIES = {
  controleur: [{ fx: 'rise', prop: 'metro', label: 'TERMINUS !' }, { fx: 'fade', where: 'behind', label: 'BILLET, S\'IL VOUS PLAÎT…' }, { fx: 'run', label: 'CONTRÔLE !' }],
  speakerine: [{ fx: 'tv', prop: 'tvset' }, { fx: 'fade', prop: 'snow', dark: true }, { fx: 'drop', prop: 'cables' }],
  gardien: [{ fx: 'rise', prop: 'gate' }, { fx: 'run', prop: 'car', label: 'STATIONNEMENT INTERDIT' }, { fx: 'fade', where: 'near', prop: 'beacon', dark: true }],
  abomination: [{ fx: 'door', where: 'keep' }, { fx: 'rise', prop: 'gore' }, { fx: 'drop', impact: true }],
  chirurgien: [{ fx: 'fade', dark: true, prop: 'lamp' }, { fx: 'run', prop: 'bed' }, { fx: 'rise', prop: 'drawer' }],
  shibanophile: [{ fx: 'fade', where: 'keep', prop: 'ultra' }, { fx: 'burst', prop: 'costume', label: 'WOUF ?' }, { fx: 'burst', prop: 'cage' }]
};
// l'entrée retenue pour chaque boss
const BOSS_PICK = { controleur: 1, speakerine: 0, gardien: 1, abomination: 1, chirurgien: 1, shibanophile: 1 };
const BOSS_HINT = { controleur: 'sors du cercle quand il siffle', speakerine: 'dans le noir, vise ses yeux rouges', gardien: 'ses barrières ferment les passages', abomination: 'tue les zombies qu\'elle aspire', chirurgien: 'fuis le faisceau de sa frontale', shibanophile: 'roule pour couper sa laisse' };
const RAGE_TXT = { controleur: 'il appelle des renforts', speakerine: 'son micro hurle maintenant', gardien: 'il pousse des épaves', abomination: 'le sol tremble sous ses pas', chirurgien: 'il gaze la salle', shibanophile: 'il sort les croquettes' };
const bossName = b => (b.title || 'Le boss').toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase()).replace(/ (Du|De|Des|La|Le|Les|L')(?= )/g, m => m.toLowerCase()).replace(/^L'a/, "L'A");
class Boss extends Zombie {
  constructor(g, x, y) {
    super(g, 'boss', x, y, null); this.r = 36; this.state = 'intro'; this.st = 2.4; this.phase = 1; this.aggro = true; this.dir = Math.PI / 2;
    this.skin = '#6d5a50'; this.cloth = '#3b2a26'; this.stunToast = false; this.summoned = false; this.bkind = 'abomination'; this.title = "L'ABOMINATION"; this.weakT = 0; this.specCd = 3; this.introFx = false;
  }
  setState(s, t) { this.state = s; this.st = t; }
  knock(x, y) { this.kx += x * 0.04; this.ky += y * 0.04; }
  // attaque ratée : un point faible s'ouvre quelques secondes (dégâts ×2)
  miss() { if (this.dead) return; this.weakT = 2.8; const g = this.g; g.floatText(this.x, this.y - this.r * 3, 'POINT FAIBLE ×2', '#ffd23a'); if (!g.weakTip) { g.weakTip = true; g.toast('Attaque ratée : son point faible clignote, dégâts ×2', '#ffd23a'); } }
  onRage() {
    const g = this.g; g.audio.roar(); g.shake(0.7); g.audio.setTheme('rage'); this.rageT = 1.2;
    g.toast(`${bossName(this)} entre en rage : ${RAGE_TXT[this.bkind] || 'il change de technique'}`, '#e2792f');
    if (this.bkind === 'controleur') this.setState('reinforce', 1.2); else if (this.state === 'chase') this.setState('summon', 1.0);
  }
  introStart() {
    const g = this.g, a = g.audio, E = this.entry;
    if (E && E.fx === 'run') a.tone({ f: 120, f2: 60, dur: 1.2, type: 'sawtooth', g: 0.15 });
    if (E && E.prop === 'cables') a.tone({ f: 300, f2: 80, dur: 1.4, type: 'triangle', g: 0.12 });
    if (E && E.prop === 'gate') a.tone({ f: 200, f2: 500, dur: 0.8, type: 'square', g: 0.06 });
    if (E && E.prop === 'bed') a.tone({ f: 800, f2: 700, dur: 1.4, type: 'triangle', g: 0.04 });
    switch (this.bkind) {
      case 'controleur': a.tone({ f: 2600, f2: 2400, dur: 0.6, type: 'square', g: 0.1 }); a.tone({ f: 2600, f2: 2500, dur: 0.3, type: 'square', g: 0.1, delay: 0.7 }); for (let i = 0; i < 40; i++) g.spawnP({ x: this.x + rand(-20, 20), y: this.y + rand(-10, 10), z: 40, vz: rand(60, 220), vx: rand(-220, 220), vy: rand(-160, 160), grav: 150, drag: 1.5, life: rand(1.5, 2.5), type: 'debris', size: rand(2, 4), color: pick(['#e8e0c8', '#cfe0f0', '#f0e0a0']) }); break;
      case 'speakerine': a.tone({ f: 60, f2: 15000, dur: 0.35, type: 'sawtooth', g: 0.05 }); a.noise({ f: 3000, dur: 1.2, g: 0.15 }); break;
      case 'gardien': a.siren(); break;
      case 'chirurgien': if (!E || E.prop === 'lamp') g.blackoutT = Math.max(g.blackoutT, 1.4); a.tone({ f: 120, f2: 40, dur: 1, type: 'sine', g: 0.3 }); a.tone({ f: 1500, f2: 1500, dur: 0.08, type: 'square', g: 0.08, delay: 1.3 }); break;
      case 'shibanophile': a.tone({ f: 9000, f2: 11000, dur: 1.2, type: 'sine', g: 0.05 }); g.shake(0.6); break;
    }
  }
  // effets permanents : tickets qui volent, étincelles des câbles…
  ambient(dt) {
    const g = this.g; if (this.rageT > 0) this.rageT -= dt;
    if (this.bkind === 'controleur' && Math.random() < dt * 3) g.spawnP({ x: this.x + rand(-10, 10), y: this.y - 20, z: 30, vz: rand(20, 60), vx: -Math.cos(this.dir) * rand(30, 70) + rand(-20, 20), vy: -Math.sin(this.dir) * rand(30, 70), grav: 60, drag: 1, life: 2, type: 'debris', size: 2.5, color: '#e8e0c8' });
    if (this.bkind === 'speakerine' && Math.random() < dt * 4) g.spawnP({ x: this.x + rand(-this.r, this.r) * 0.6, y: this.y - 4, z: rand(4, 20), vz: rand(30, 90), vx: rand(-60, 60), vy: rand(-40, 40), grav: 400, life: 0.4, type: 'spark', size: 1.4, color: '#bfe6ff', emissive: true });
    if (this.bkind === 'abomination' && this.state === 'absorb') for (const z of g.hash.query(this.x, this.y, 430, g._qs)) { if (z === this || z.dead || z.type === 'boss') continue; const dx = this.x - z.x, dy = this.y - z.y, d = Math.hypot(dx, dy) || 1; z.x += dx / d * 150 * dt; z.y += dy / d * 150 * dt; z.stun = Math.max(z.stun, 0.1);
      if (d < this.r + z.r + 6) { z.dead = true; this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.03); g.bleed(z.x, z.y, 0, 0, 8); g.audio.flesh(1); g.floatText(this.x, this.y - this.r * 3, '+SOIN', '#7fd18b'); } }
    if (this.bkind === 'shibanophile' && g.npcShibas) for (const sh of g.npcShibas) if (!sh.caught && dist2(sh.x, sh.y, this.x, this.y) < (this.r + 16) ** 2) { sh.caught = 1.6; this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.05); g.toast('Le Shibanophile a attrapé un shiba : il reprend des forces !', '#ff7ac8'); g.audio.bark(sh.x, sh.y); }
  }
  // choix d'une technique propre au boss (la seconde se débloque en rage)
  special(p, pd) {
    const g = this.g, two = this.phase >= 2, pickT = (a, b) => two && Math.random() < 0.5 ? b : a;
    switch (this.bkind) {
      case 'controleur': this.setState('whistle', 0.5); g.audio.tone({ f: 2700, f2: 2500, dur: 0.45, type: 'square', g: 0.1 }); return true;
      case 'speakerine': { const t = pickT('tvOff', 'windEcho'); if (t === 'tvOff') { this.setState('tvOff', 0.6); g.audio.noise({ f: 2500, dur: 0.6, g: 0.2 }); } else { if (pd > 340) return false; this.setState('windEcho', 0.8); this.echoA = Math.atan2(p.y - this.y, p.x - this.x); } return true; }
      case 'gardien': { const t = pickT('barriers', 'windRam'); if (t === 'barriers') this.setState('barriers', 0.6); else { this.setState('windRam', 0.8); this.ramA = Math.atan2(p.y - this.y, p.x - this.x); } return true; }
      case 'abomination': { const t = pickT('absorb', 'windQuake'); if (t === 'absorb') { if (!g.zombies.some(z => !z.dead && z.type !== 'boss' && dist2(z.x, z.y, this.x, this.y) < 430 * 430)) g.director.queue += 6; this.setState('absorb', 2.6); g.audio.roar(0.7); g.toast('Elle absorbe les zombies : tue-les avant qu\'ils l\'atteignent !', '#7fd18b'); } else this.setState('windQuake', 0.8); return true; }
      case 'chirurgien': { const t = pickT('windBlades', 'windGas'); if (t === 'windBlades') { const b = Math.atan2(p.y - this.y, p.x - this.x); this.bladeA = [-0.36, -0.18, 0, 0.18, 0.36].map(d => b + d); this.setState('windBlades', 0.55); } else { this.gasX = p.x; this.gasY = p.y; this.setState('windGas', 0.45); } return true; }
      case 'shibanophile': { const t = pickT('windLeash', 'kibble'); if (t === 'kibble' && !g.npcShibas) return false; if (t === 'windLeash') { if (pd > 520 || g.hazards.some(h => h.kind === 'leash')) return false; this.setState('windLeash', 0.5); } else this.setState('kibble', 0.6); return true; }
    }
    return false;
  }
  specUpdate(dt, p, pd, ux, uy, alive) {
    const g = this.g, done = (t = rand(1.4, 2.2)) => this.setState('chase', t);
    switch (this.state) {
      case 'whistle': if (this.st <= 0) { g.hazards.push(new Hazard(g, 'fine', { x: p.x, y: p.y, r: 115, life: 2 })); done(); } return [0, 0];
      case 'reinforce': if (this.st <= 0) { for (let i = 0; i < 3; i++) { const a = i * TAU / 3, z = new Zombie(g, 'runner', this.x + Math.cos(a) * 70, this.y + Math.sin(a) * 50, 'dark'); z.costume = 'casquette'; z.aggro = true; z.maxHp = z.hp = z.hp * 2; g.zombies.push(z); } g.toast('Renforts : contrôle des billets !', '#9fc4ff'); done(1); } return [0, 0];
      case 'tvOff': if (this.st <= 0) { g.blackoutT = 3; done(1); } return [0, 0];
      case 'windEcho': if (this.st <= 0) {
          for (const q of g.players()) { if (q.dead) continue; const dx = q.x - this.x, dy = q.y - this.y, d = Math.hypot(dx, dy); if (d < 320 && Math.abs(angDiff(this.echoA, Math.atan2(dy, dx))) < 0.6 && !(q.rollT > 0)) { q.hurt(12 * g.diff.dmg, this.x, this.y, 750); q.dazeT = 1; g.floatText(q.x, q.y - 36, 'ÉTOURDI', '#bfe6ff'); } }
          g.audio.tone({ f: 300, f2: 1400, dur: 0.5, type: 'sawtooth', g: 0.18 }); g.shake(0.4); for (let i = 0; i < 20; i++) { const a = this.echoA + rand(-0.6, 0.6), sp = rand(300, 520); g.spawnP({ x: this.x, y: this.y - 30, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.5, type: 'ring', size: 6, grow: 30, emissive: true }); }
          if (!g.players().some(q => !q.dead && q.dazeT > 0.9)) this.miss(); done(); }
        return [0, 0];
      case 'barriers': if (this.st <= 0) {
          let n = 0; for (let t = 0; t < 24 && n < 3; t++) { const vert = Math.random() < 0.5, w = vert ? 18 : 170, h = vert ? 170 : 18, x = p.x + rand(-230, 230) - w / 2, y = clamp(p.y + rand(-200, 200) - h / 2, ST + 20, SB - h - 20);
            if (x < p.x + 40 && x + w > p.x - 40 && y < p.y + 40 && y + h > p.y - 40) continue; if (g.level.queryRect(x - 6, y - 6, w + 12, h + 12).length) continue;
            const ob = g.level.add({ x: Math.round(x), y: Math.round(y), w, h, z: 30, kind: 'barrier', zone: -2 }); g.hazards.push(new Hazard(g, 'barrier', { x: x + w / 2, y: y + h / 2, ob, life: 6 })); n++; }
          if (n) { g.level.rebuildGrid(); g.audio.metal(1); g.shake(0.3); } done(); }
        return [0, 0];
      case 'windRam': if (this.st <= 0) { const sp = 430; g.hazards.push(new Hazard(g, 'ram', { x: this.x + Math.cos(this.ramA) * (this.r + 40), y: this.y + Math.sin(this.ramA) * (this.r + 40), vx: Math.cos(this.ramA) * sp, vy: Math.sin(this.ramA) * sp, hitZ: new Set() })); g.audio.tone({ f: 90, f2: 160, dur: 0.6, type: 'sawtooth', g: 0.2 }); done(); } return [0, 0];
      case 'absorb': if (this.st <= 0) done(); return [0, 0];
      case 'windQuake': this.jumpZ = Math.sin(Math.min(1, (0.8 - this.st) / 0.8) * Math.PI) * 90; if (this.st <= 0) { this.jumpZ = 0; g.shake(1); g.audio.explosion(1); g.scorch(this.x, this.y, 80); for (let i = 0; i < 3; i++) g.later(i * 0.38, () => { if (!this.dead) g.shockwaves.push(new Shockwave(g, this.x, this.y, 420, 22 * g.diff.dmg)); }); done(2); } return [0, 0];
      case 'windBlades': if (this.st <= 0) { for (const a of this.bladeA) g.hazards.push(new Hazard(g, 'blade', { x: this.x + Math.cos(a) * 30, y: this.y + Math.sin(a) * 30, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560 })); g.audio.tone({ f: 3000, f2: 1200, dur: 0.15, type: 'triangle', g: 0.15 }); this.bladeA = null; done(1.2); } return [0, 0];
      case 'windGas': if (this.st <= 0) { g.hazards.push(new Hazard(g, 'gas', { x: this.gasX, y: this.gasY, r: 125, life: 5 })); g.audio.noise({ f: 900, dur: 0.8, g: 0.25 }); done(); } return [0, 0];
      case 'windLeash': if (this.st <= 0) { g.hazards.push(new Hazard(g, 'leash', { x: this.x, y: this.y, tx: p.x, ty: p.y, boss: this, hp: 60 })); g.audio.tone({ f: 600, f2: 1600, dur: 0.25, type: 'square', g: 0.1 }); done(); } return [0, 0];
      case 'kibble': if (this.st <= 0) { const a = rand(0, TAU); g.hazards.push(new Hazard(g, 'kibble', { x: clamp(this.x + Math.cos(a) * 90, ZONES[3].x0 + 60, ZONES[3].x1 - 60), y: clamp(this.y + Math.sin(a) * 60 + 40, ST + 60, SB - 60), life: 6 })); g.toast('Croquettes ! Les shibas foncent vers le Shibanophile', '#ffb060'); done(); } return [0, 0];
    }
    this.setState('chase', 1); return null;
  }
  reanimate() {
    const g = this.g; g.toast('Le Chirurgien réanime les morts !', '#7fd18b'); g.audio.tone({ f: 60, f2: 400, dur: 1.2, type: 'sawtooth', g: 0.2 }); g.shake(0.5);
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6, z = new Zombie(g, 'walker', this.x + Math.cos(a) * 110, this.y + Math.sin(a) * 80, 'sewer'); z.aggro = true; g.zombies.push(z); }
  }
  damage(a, dx, dy, src) {
    if (this.state === 'intro' || this.dead) return;
    if (this.state === 'stunned') a *= 1.75; else if (this.phase >= 2) a *= 0.8;
    if (this.weakT > 0) a *= 2;
    if (this.g.stats && this.g.state === 'playing') this.g.stats.dmg += Math.max(0, Math.min(a, this.hp));
    this.hp -= a; this.hitFlash = 0.06; this.g.bleed(this.x, this.y - 20, dx, dy, 3);
    if (src !== 'fire') this.g.audio.flesh(0.8);
    if (this.hp <= 0) { this.hp = 0; this.die(src); return; }
    if (this.phase === 1 && this.hp < this.maxHp * 0.5) { this.phase = 2; this.onRage(); }
    if (!this.ultimate && this.phase === 2 && this.hp < this.maxHp * 0.25) { this.phase = 3; this.speed *= 1.2; this.g.audio.roar(1.2); this.g.shake(0.8); this.g.toast(`${bossName(this)} est à bout : il enchaîne tout`, '#ff6a45'); if (this.state === 'chase') this.setState('chase', 0.3); }
    if (this.bkind === 'chirurgien' && !this.revived && this.hp < this.maxHp * 0.3) { this.revived = true; this.reanimate(); }
  }
  update(dt) {
    const g = this.g, p = g.targetFor(this);
    this.walkT += dt * 2.4; if (this.hitFlash > 0) this.hitFlash -= dt; this.atkCd -= dt;
    if (this.burn > 0) { this.burn -= dt; this.hp -= 8 * dt; if (this.hp <= 0) { this.die('fire'); return; } }
    const pdx = p.x - this.x, pdy = p.y - this.y, pd = Math.hypot(pdx, pdy) || 1, ux = pdx / pd, uy = pdy / pd;
    const rage = this.phase >= 3 ? 1.5 : this.phase === 2 ? 1.3 : 1; let vx = 0, vy = 0; this.st -= dt; this.specCd -= dt; if (this.weakT > 0) this.weakT -= dt;
    if (!this.introFx) { this.introFx = true; this.introStart(); }
    this.ambient(dt);
    const alive = !p.dead && !(p.playDead > 0);
    switch (this.state) {
      case 'intro': { const E = this.entry, k = E ? 1 - Math.max(0, this.st) / E.T : 1;
        if (!E || E.fx === 'door') vy = 55;
        else if (E.fx === 'run') { const u = Math.min(1, k / 0.8), e = 1 - (1 - u) * (1 - u); this.x = lerp(E.fx0, E.tx, e); this.y = lerp(E.fy0, E.ty, e); if (u < 1 && Math.random() < 0.6) g.spawnP({ x: this.x + rand(-20, 20), y: this.y, vx: rand(-40, 40), vy: rand(-40, 40), life: 0.6, type: 'smoke', size: 8, grow: 14 }); }
        else if (E.fx === 'drop') { const u = Math.min(1, k / 0.55); this.jumpZ = E.prop === 'cables' ? (1 - u) * 600 : (1 - u * u) * 600; if (u >= 1) this.jumpZ = 0; }
        if (E && (E.fx === 'rise' || E.prop === 'gore') && Math.random() < 0.5 && k < 0.7) g.spawnP({ x: this.x + rand(-this.r, this.r), y: this.y, z: 4, vz: rand(60, 200), vx: rand(-80, 80), vy: rand(-50, 50), grav: 600, life: 0.9, type: E.prop === 'gore' ? 'gib' : 'debris', size: rand(2, 5), color: E.prop === 'gore' ? '#5a1410' : E.prop === 'metro' ? '#e8e0c8' : '#3a3a40', bake: E.prop === 'gore' });
        if (E && E.prop === 'car' && k < 0.8 && Math.random() < 0.7) { g.level.ground.decal(this.x, this.y, 30, c => { c.fillStyle = 'rgba(10,10,12,.35)'; for (const sd of [-1, 1]) c.fillRect(this.x - 4, this.y + sd * 14 - 2, 8, 4); }); }
        if (E && E.prop === 'car' && !E.skid && k > 0.72) { E.skid = true; g.audio.noise({ f: 2600, type: 'bandpass', dur: 0.6, g: 0.3 }); g.shake(0.4); for (let i = 0; i < 16; i++) g.spawnP({ x: this.x + rand(-30, 30), y: this.y + rand(-10, 10), vx: rand(-90, 90), vy: rand(-40, 40), life: 1, type: 'smoke', size: 10, grow: 22 }); }
        if (E && E.prop === 'bed' && k < 0.75 && Math.random() < 0.15) g.audio.tone({ f: 1400 + Math.random() * 300, dur: 0.05, type: 'triangle', g: 0.03 });
        if (E && E.prop === 'bed' && !E.sheet && k > 0.78) { E.sheet = true; g.audio.noise({ f: 1200, dur: 0.4, g: 0.2 }); for (let i = 0; i < 18; i++) g.spawnP({ x: this.x + rand(-20, 20), y: this.y, z: 40, vz: rand(120, 260), vx: rand(-160, 160), vy: rand(-90, 90), grav: 300, drag: 1.2, life: 1.4, type: 'debris', size: rand(4, 7), color: '#e8ece8' }); }
        if (E && E.prop === 'gore' && k < 0.7) { const a = rand(0, TAU), d = rand(90, 160); if (Math.random() < 0.7) g.spawnP({ x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d * 0.6, z: 6, vx: -Math.cos(a) * d * 1.6, vy: -Math.sin(a) * d * 1.0, life: 0.6, type: 'gib', size: rand(3, 6), color: pick(['#7a5a4e', '#5a1410', '#8a6656']) }); }
        if (E && E.prop === 'tvset' && k < 0.5 && Math.random() < 0.2) g.audio.noise({ f: 4000, type: 'highpass', dur: 0.08, g: 0.06 });
        if (E && E.prop === 'tvset' && !E.flashd && k > 0.4) { E.flashd = true; g.flashFx = 0.18; for (let i = 0; i < 20; i++) g.spawnP({ x: this.x, y: this.y - 30, z: 20, vx: rand(-200, 200), vy: rand(-120, 120), vz: rand(40, 140), grav: 300, life: 0.5, type: 'spark', size: 1.6, color: '#bfe6ff', emissive: true }); }
        if (E && E.fx === 'fade' && E.where === 'behind' && !E.tap && k > 0.15) { E.tap = true; const p0 = g.player; g.floatText(p0.x - 10, p0.y - 46, 'TAP TAP', '#ffd23a'); g.audio.tone({ f: 300, dur: 0.06, type: 'square', g: 0.1 }); g.audio.tone({ f: 300, dur: 0.06, type: 'square', g: 0.1, delay: 0.18 }); }
        if (E && E.prop === 'cage' && !E.popped && k > 0.6) { E.popped = true; g.shake(0.7); g.audio.metal(1); for (let i = 0; i < 24; i++) g.spawnP({ x: this.x, y: this.y, z: 40, vz: rand(80, 260), vx: rand(-260, 260), vy: rand(-200, 200), grav: 700, life: 1.4, type: 'debris', size: rand(2, 4), color: '#8a8e96' }); }
        if (E && E.prop === 'costume' && !E.popped && k > 0.72) { E.popped = true; g.audio.roar(0.8); for (let i = 0; i < 30; i++) g.spawnP({ x: this.x, y: this.y, z: 40, vz: rand(60, 220), vx: rand(-220, 220), vy: rand(-160, 160), grav: 500, life: 1.6, type: 'debris', size: rand(3, 6), color: pick(['#e09040', '#fff0dc', '#c87030']) }); }
        if (this.st <= 0) { this.jumpZ = 0; this.setState('chase', 2); }
        break; }
      case 'chase':
        if (alive) { vx = ux * this.speed * rage; vy = uy * this.speed * rage; }
        if (this.bkind === 'chirurgien' && alive && this.st > 0.4 && (this.lampCd = (this.lampCd || 0) - dt) <= 0 && pd < 430 && Math.abs(angDiff(this.dir, Math.atan2(pdy, pdx))) < 0.28 && g.level.lineClear(this.x, this.y, p.x, p.y)) { this.lampCd = 6; this.setState('windCharge', 0.55); g.floatText(this.x, this.y - this.r * 3.2, 'REPÉRÉ', '#e8f6ff'); }
        if (this.st <= 0 && alive && (this.specCd -= 0) <= 0 && Math.random() < (this.phase >= 2 ? 0.55 : 0.4) && this.special(p, pd)) { this.specCd = this.phase >= 2 ? 3.5 : 5; }
        else if (this.st <= 0 && alive) {
          const r = Math.random();
          if (pd > 280 && r < 0.4) this.setState('windCharge', this.phase >= 2 ? 0.7 : 0.9);
          else if (pd > 220 && r < 0.62 && this.phase >= 2) { this.leapX = p.x; this.leapY = p.y; this.setState('windLeap', 0.85); g.audio.roar(0.6); }
          else if (pd < 230 && r < 0.75) this.setState('windSlam', this.phase >= 3 ? 0.55 : 0.75);
          else if (r < 0.85) this.setState('windSpit', 0.55);
          else this.setState('summon', 1.1);
        }
        break;
      case 'windCharge': this.cdx = ux; this.cdy = uy; if (this.st <= 0) { this.setState('charge', 1.25); g.audio.roar(0.5); } break;
      case 'charge':
        if (this.phase >= 2 && alive) { const turn = Math.min(1, dt * 1.4); this.cdx += (ux - this.cdx) * turn; this.cdy += (uy - this.cdy) * turn; const l = Math.hypot(this.cdx, this.cdy) || 1; this.cdx /= l; this.cdy /= l; }
        vx = this.cdx * 430 * rage; vy = this.cdy * 430 * rage;
        if (this.st <= 0 && this.phase >= 3 && !this.chained) { this.chained = true; this.setState('windCharge', 0.35); break; }
        if (this.st <= 0) { this.chained = false; if (!this.hitDuring) this.miss(); this.hitDuring = false; }
        if (Math.random() < dt * 30) g.spawnP({ x: this.x + rand(-20, 20), y: this.y + rand(-6, 6), vx: rand(-50, 50), vy: rand(-50, 50), life: 0.8, type: 'smoke', size: 9, grow: 18 });
        if (this.st <= 0) this.setState('chase', rand(1.5, 2.5));
        break;
      case 'windSlam':
        if (this.st <= 0) {
          g.shockwaves.push(new Shockwave(g, this.x, this.y, 300, 28 * g.diff.dmg)); g.shake(0.7); g.audio.explosion(0.8);
          g.scorch(this.x, this.y, 60); if (pd < this.r + 60) p.hurt(30 * g.diff.dmg, this.x, this.y, 600); else this.miss();
          if (this.phase === 2) g.later(0.4, () => { if (!this.dead) g.shockwaves.push(new Shockwave(g, this.x, this.y, 340, 24 * g.diff.dmg)); });
          this.setState('chase', this.phase >= 3 ? rand(0.8, 1.4) : this.phase === 2 ? rand(1.3, 2) : rand(1.8, 2.6));
        }
        break;
      case 'windSpit':
        if (this.st <= 0) {
          const n = this.phase === 2 ? 9 : 5, base = Math.atan2(pdy, pdx), dd = clamp(pd, 180, 460);
          for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * 0.22; g.spit(this.x, this.y - 30, this.x + Math.cos(a) * dd, this.y + Math.sin(a) * dd, true); }
          this.setState('chase', this.phase >= 3 ? rand(0.8, 1.4) : this.phase === 2 ? rand(1.3, 2) : rand(1.8, 2.6));
        }
        break;
      case 'summon':
        if (!this.summoned) { this.summoned = true; g.audio.roar(); g.director.queue += this.phase === 2 ? 12 : 7; g.shake(0.3); }
        if (this.st <= 0) { this.summoned = false; this.setState('chase', rand(2.5, 3.5)); }
        break;
      case 'stunned': if (this.st <= 0) this.setState('chase', 1.5); break;
      default: { const v = this.specUpdate(dt, p, pd, ux, uy, alive); if (v) { vx = v[0]; vy = v[1]; } }
      case 'windLeap': if (this.st <= 0) { this.lx0 = this.x; this.ly0 = this.y; this.setState('leap', 0.55); } break;
      case 'leap': {
        const k = 1 - Math.max(0, this.st) / 0.55; this.x = lerp(this.lx0, this.leapX, k); this.y = lerp(this.ly0, this.leapY, k); this.jumpZ = Math.sin(k * Math.PI) * 120;
        if (this.st <= 0) { this.jumpZ = 0; g.shockwaves.push(new Shockwave(g, this.x, this.y, 260, 26 * g.diff.dmg)); g.shake(0.8); g.audio.explosion(0.9); g.scorch(this.x, this.y, 70);
          if (dist2(p.x, p.y, this.x, this.y) < (this.r + 70) ** 2) p.hurt(34 * g.diff.dmg, this.x, this.y, 650); else this.miss();
          if (this.phase >= 3) for (let i = 0; i < 8; i++) { const a = i * TAU / 8; g.spit(this.x, this.y - 20, this.x + Math.cos(a) * 200, this.y + Math.sin(a) * 200, true); }
          this.setState('chase', rand(1.2, 2)); }
        break; }
    }
    for (const o of g.hash.query(this.x, this.y, this.r + 40, g._qs)) {
      if (o === this || o.dead) continue; const ox = o.x - this.x, oy = o.y - this.y, dd = Math.hypot(ox, oy) || 1;
      if (dd < this.r + o.r) { o.x += ox / dd * (this.r + o.r - dd); o.y += oy / dd * (this.r + o.r - dd); if (this.state === 'charge') o.knock(ox / dd * 500, oy / dd * 500); }
    }
    this.x += (vx + this.kx) * dt; this.y += (vy + this.ky) * dt; const kd = Math.exp(-6 * dt); this.kx *= kd; this.ky *= kd;
    const hit = this.state === 'leap' ? null : g.collideWorld(this);
    if (this.state === 'charge' && hit && hit.kind !== 'parapet') {
      this.setState('stunned', 2.2); g.shake(0.8); g.audio.metal(1); g.audio.explosion(0.4); g.hitObstacle(hit, 140, this.x, this.y, 'boss');
      if (!this.stunToast) { this.stunToast = true; g.toast('Elle est sonnée : frappe maintenant, dégâts ×1,75', '#f0b25a'); }
    }
    if (alive && pd < this.r + p.r + 4 && this.atkCd <= 0 && this.state !== 'intro' && this.state !== 'stunned' && this.state !== 'leap') {
      p.hurt(this.dmg * (this.state === 'charge' ? 1.3 : 1), this.x, this.y, this.state === 'charge' ? 720 : 420); this.atkCd = 1.0;
      if (this.state === 'charge') { this.hitDuring = false; this.setState('chase', 2); }
    }
    if (this.state !== 'charge') this.dir += angDiff(this.dir, Math.atan2(pdy, pdx)) * Math.min(1, dt * 4); else this.dir = Math.atan2(this.cdy, this.cdx);
    if ((this.groanT -= dt) <= 0) { this.groanT = rand(3, 6); g.audio.groan(this.x, this.y, 'boss'); }
  }
}

const MINI_BOSSES = [
  { kind: 'controleur', title: 'LE CONTRÔLEUR', sub: 'Il n\'a jamais aimé les voyageurs sans billet', hp: 1900, r: 30, speed: 70, body: '#2c3e5a', blob: '#3d5478', head: '#4a6a4a', cap: '#1a2638' },
  { kind: 'speakerine', title: 'LA SPEAKERINE', sub: 'Elle tient l\'antenne… et ne la lâchera pas', hp: 2600, r: 32, speed: 64, body: '#6a2a4a', blob: '#8a3a62', head: '#6a8a5a', cap: '#d0a020', spitty: true },
  { kind: 'gardien', title: 'LE GARDIEN DU PARKING', sub: 'Stationnement interdit. Pour toujours.', hp: 3400, r: 34, speed: 68, body: '#3e4a2a', blob: '#56643a', head: '#5a7a4a', cap: '#e0a020' },
  { kind: 'chirurgien', title: 'LE CHIRURGIEN', sub: 'Il opère sans anesthésie', hp: 4300, r: 31, speed: 80, body: '#cfd8d6', blob: '#8a1a14', head: '#7a9a7a', cap: '#3f8f80', surgeon: true }
];
// cible d'entraînement en carton, sur rail (ne mord pas)
class Target extends Zombie {
  constructor(g, x, y, rail) {
    super(g, 'walker', x, y, null); this.target = true; this.maxHp = this.hp = 60; this.r = 16; this.rail = rail; this.u = Math.random(); this.dirU = 1; this.kbMul = 0; this.speed = 0;
    if (rail) { this.x = rail.ax + (rail.bx - rail.ax) * this.u; this.y = rail.ay + (rail.by - rail.ay) * this.u; }
  }
  update(dt) {
    if (this.hitFlash > 0) this.hitFlash -= dt; this.walkT += dt; this.stun = 0; this.burn = 0;
    const R = this.rail; if (!R) return; const L = Math.hypot(R.bx - R.ax, R.by - R.ay) || 1;
    this.u += this.dirU * R.sp * dt / L; if (this.u > 1) { this.u = 1; this.dirU = -1; } if (this.u < 0) { this.u = 0; this.dirU = 1; }
    this.x = R.ax + (R.bx - R.ax) * this.u; this.y = R.ay + (R.by - R.ay) * this.u;
  }
}
const GINETTE = {
  move: 'Mais… WTF ? Je me battais avec John il y a deux minutes, et là je me retrouve ici. Bref. OK. Moi c\'est Cortana, et je vais t\'expliquer comment survivre. D\'abord :',
  shoot: 'Ces cartons sont moins dangereux qu\'un Élite, mais on fait avec. Vise et tire :',
  reload: 'John rechargeait toujours avant de râler. Fais pareil :',
  switch: 'Un seul flingue, c\'est un plan B qui n\'existe pas. Change d\'arme :',
  roll: 'Une roulade au bon moment, et les dents mordent le vide :',
  melee: 'À court de balles ? Une crosse dans la mâchoire, ça marche aussi :',
  grenade: 'Les groupes, c\'est pour les grenades. Vise le paquet de cibles :',
  special: 'Mes capteurs détectent un talent caché chez toi. C\'est le moment :',
  free: 'Tu apprends plus vite que John. Ne lui répète pas. Continue à t\'entraîner, ou rentre : Pause puis « Quitter ».'
};
const TRAIN_STEPS = [
  { id: 'move', t: () => deviceNow() === 'touch' ? 'Pose le pouce gauche sur l\'écran et glisse : c\'est le stick DÉPLACER' : `Déplace-toi ${deviceNow() === 'pad' ? 'avec le stick gauche' : `avec ${KL('up')} ${KL('left')} ${KL('down')} ${KL('right')}`}`, ok: (g, s) => s.moved > 320 },
  { id: 'shoot', t: () => deviceNow() === 'touch' ? 'Pouce droit sur VISER · TIRER, pousse au-delà de la moitié pour tirer, et abats 3 cibles' : `Vise ${deviceNow() === 'pad' ? 'au stick droit' : 'à la souris'} et abats 3 cibles [${KL('fire')}]`, ok: (g, s) => s.hits >= 3 },
  { id: 'reload', t: () => deviceNow() === 'touch' ? 'Au tactile, le rechargement est automatique : vide ton chargeur et regarde' : `Recharge ton arme [${KL('reload')}] (ça se fait aussi tout seul quand le chargeur est vide)`, ok: (g, s) => g.player.reloadT > 0 },
  { id: 'switch', t: () => deviceNow() === 'touch' ? 'Touche le bouton ARME pour changer d\'arme (appui long : la roue des armes)' : `Change d'arme [${KL('next')}]${deviceNow() === 'pad' ? '' : ' ou touches 1 à 6'}`, ok: (g, s) => g.player.cur !== s.cur0 },
  { id: 'roll', t: () => `Fais une roulade [${deviceNow() === 'touch' ? 'bouton ROULADE' : KL('roll')}] : tu es intouchable pendant le roulé`, ok: (g, s) => g.player.rollT > 0 },
  { id: 'melee', t: () => `Approche la cible fixe et donne un coup de crosse [${deviceNow() === 'touch' ? 'bouton E' : KL('melee')}]`, ok: (g, s) => g.player.meleeT > 0 },
  { id: 'grenade', t: () => `Lance une grenade sur le groupe de cibles [${deviceNow() === 'touch' ? 'bouton grenade' : KL('grenade')}]`, ok: (g, s) => g.player.grenades < s.gr0 },
  { id: 'special', t: () => `Déclenche ta capacité spéciale : ${CHARS[g_char()].spLong} [${deviceNow() === 'touch' ? 'bouton ' + CHARS[g_char()].sp : KL('special')}]`, ok: (g, s) => g.player.spCd > 0 },
  { id: 'free', t: () => 'Entraînement terminé ! Tire librement · Pause puis « Quitter » pour revenir au menu', ok: () => false }
];
function g_char() { return game.charKey; }
class MiniBoss extends Boss {
  constructor(g, x, y, k) {
    super(g, x, y); const C = MINI_BOSSES[k]; this.mini = true; this.mk = k; this.cfg = C; this.bkind = C.kind; this.title = C.title; this.r = C.r; this.speed = C.speed;
    this.maxHp = this.hp = C.hp * g.diff.hp; this.dmg *= 0.8; this.state = 'intro'; this.st = 1.6;
  }
  update(dt) {
    if (this.cfg.spitty && this.state === 'chase' && this.st <= dt && Math.random() < 0.45) this.setState('windSpit', 0.5);
    super.update(dt);
  }
}
class UltimateBoss extends Boss {
  constructor(g, x, y) {
    super(g, x, y); this.ultimate = true; this.bkind = 'shibanophile'; this.title = 'LE SHIBANOPHILE'; this.r = 44; this.speed = 72;
    this.maxHp = this.hp = 9000 * g.diff.hp; this.spT = 0;
  }
  damage(a, dx, dy, src) {
    super.damage(a, dx, dy, src);
    if (!this.dead && this.phase === 2 && this.hp < this.maxHp * 0.25) { this.phase = 3; this.speed *= 1.15; this.g.audio.roar(1.2); this.g.shake(0.7); this.g.toast('Le Shibanophile perd la tête !', '#ff6a45'); }
  }
  update(dt) {
    if (this.state === 'chase' && this.phase === 3 && this.st <= dt && Math.random() < 0.4) this.setState('spiral', 1.8);
    super.update(dt);
    if (this.state === 'spiral') {
      this.spT -= dt;
      if (this.spT <= 0) { this.spT = 0.3; const off = rand(0, TAU); for (let i = 0; i < 10; i++) { const a = off + i * TAU / 10, d = rand(160, 320); this.g.spit(this.x, this.y - 30, this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, true); } }
      if (this.st <= 0) this.setState('chase', rand(1.5, 2.5));
    }
  }
}
