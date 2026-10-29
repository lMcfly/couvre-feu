// ============================================================ jeu : lancement des modes
mixin(Game, {
  newGame() { this.newGameCore();
    const startMap = () => this.showMap({ current: 0, onGo: () => this.comic.show('intro', null) });
    if (!this.prologueSeen) { this.prologueSeen = true; this.comic.show('prologue', startMap); } else startMap();
  },
  newGameCore() {
    this.resetModes(); this.shibaSeed = Math.floor(Math.random() * 1e6); this.keysOpen = false; this.audio.init(); this.diff = DIFFS[this.diffKey]; this.activeZone = -1; this.shibaFound = new Set(); this.resetWorld();
    this.mode = 'story'; this.run = { fetish: 0, saved: 0, riot: 0, special: 0, sv: [0, 0, 0] }; this.stats = newStats(); this.shibaFound = new Set(); this.missionFor = -1;
    this.player = new Player(this, 140, 600); this.lives = this.diff.lives; this.score = 0; this.mult = 1; this.maxMult = 1; this.kills = 0; this.runTime = 0;
    this.zoneEntered = [false, false, false, false]; this.safeEntered = [false, false, false]; this.safeName = null; this.savedScore = false;
    this.checkpoint = this.makeCheckpoint(140, 600); this.state = 'playing'; this.deathT = 0;
    this.cam.x = 600; this.cam.y = 600; this.showScreen(null); this.input.mdown = false;
  },
  loadSave(d) {
    this.keysOpen = false; this.audio.init(); this.charKey = d.char; this.diffKey = d.diff; Settings.char = d.char; Settings.save(); wardIdx = Math.max(0, CHAR_KEYS.indexOf(d.char)); renderWardrobe(); for (const x of document.querySelectorAll('#diff button')) x.setAttribute('aria-pressed', x.dataset.diff === d.diff ? 'true' : 'false');
    this.diff = DIFFS[d.diff]; this.activeZone = -1; this.shibaFound = new Set(d.cp.shibas || []); this.endless = null; this.coop = false; this.p2 = null; this.p1Down = 0; this.seedOff = 0; this.shibaSeed = d.shibaSeed || 0; this.resetWorld();
    this.mode = 'story'; this.run = { fetish: 0, saved: 0, riot: 0, special: 0, sv: [0, 0, 0], ...(d.run || {}) }; this.stats = { ...newStats(), ...(d.stats || {}) }; this.missionFor = d.safe;
    const s = d.safe, cp = { ...d.cp, weapons: d.cp.weapons.map((w, i) => ({ ...w, reserve: WEAPONS[i].infinite || w.reserve === -1 || w.reserve == null ? (WEAPONS[i].infinite ? Infinity : 0) : w.reserve })) };
    this.checkpoint = cp;
    const p = this.player = new Player(this, cp.x, cp.y);
    p.money = cp.money; p.armor = cp.armor; p.grenades = cp.grenades; p.mines = cp.mines; p.decoys = cp.decoys; p.cur = cp.cur; p.weapons.forEach((w, i) => w.restore(cp.weapons[i]));
    this.lives = d.lives; this.score = cp.score || 0; this.kills = cp.kills || 0; this.mult = 1; this.maxMult = d.maxMult || 1; this.runTime = d.runTime || 0; this.savedScore = false; this.deathT = 0;
    this.zoneEntered = [0, 1, 2, 3].map(k => k <= s); this.safeEntered = [0, 1, 2].map(i => i <= s); this.safeName = SAFES[s].name; this.prologueSeen = true;
    this.level.setGate(SAFES[s].x0, true); for (let k = 0; k <= s; k++) this.level.obj[k].done = true;
    this.cam.x = cp.x; this.cam.y = cp.y; this.input.mdown = false; this.showMap({ current: s + 1, resumed: true });
  },
  newSecret(keep) {
    this.keysOpen = false; this.audio.init(); const prev = keep && this.player ? this.player : null; this.resetModes();
    this.diff = DIFFS[this.diffKey]; this.activeZone = -1; this.shibaFound = new Set(); this.resetWorld();
    this.mode = 'secret'; this.run = { fetish: 0, saved: 0, riot: 0, special: 0, sv: [0, 0, 0] }; this.stats = newStats();
    const p = this.player = new Player(this, PLAZA, 820);
    if (prev) { p.money = prev.money; p.armor = prev.armor; p.weapons.forEach((w, i) => w.restore(prev.weapons[i].snapshot())); p.cur = prev.cur; }
    else { p.armor = 2; for (const w of p.weapons) { w.owned = true; w.ammo = w.magSize(); if (!w.def.infinite) w.reserve = w.def.ammoPack * 2; } }
    p.grenades = Math.max(p.grenades, 5); p.mines = Math.max(p.mines, 3); p.decoys = Math.max(p.decoys, 3);
    this.secretCp = { armor: p.armor, cur: p.cur, weapons: p.weapons.map(w => w.snapshot()), grenades: p.grenades, mines: p.mines, decoys: p.decoys };
    this.lives = this.diff.lives; this.score = 0; this.mult = 1; this.maxMult = 1; this.kills = 0; this.runTime = 0; this.savedScore = false; this.deathT = 0;
    this.zoneEntered = [true, true, true, true]; this.safeEntered = [true, true, true]; this.safeName = null; this.checkpoint = null;
    this.activeZone = 3; this.zoneHit = false; this.level.setGate(ZONES[3].x0, true); this.level.setGate(EXIT.x0, true);
    this.level.obj[3] = { type: 'secret', spawned: false, dead: false };
    this.pickups = this.pickups.filter(pk => pk.zone === 3 && pk.kind !== 'shiba'); this.survivors = [];
    for (const l of this.level.lamps) if (l.zone === 3) { l.on = true; l.flick = false; }
    for (const [x, y] of [[PLAZA - 400, 600], [PLAZA + 400, 600], [PLAZA, 300], [PLAZA, 900]]) this.level.fixedLights.push({ x, y, r: 380, c: '255,150,200', i: 0.55, flick: 1, zone: 3 });
    this.npcShibas = []; for (let i = 0; i < 9; i++) this.npcShibas.push({ x: rand(PLAZA - 550, PLAZA + 550), y: rand(260, 960), vx: 0, vy: 0, t: rand(0, 3), barkT: rand(1, 5), dead: false });
    this.state = 'playing'; this.cam.x = p.x; this.cam.y = p.y; this.showScreen(null); this.input.mdown = false;
    this.banner('Le Paradis des Shibas', 'Protège les shibas. Abats le Shibanophile.'); this.audio.setTheme('paradis');
    this.later(3, () => { if (this.mode !== 'secret') return; const b = new UltimateBoss(this, PLAZA, ST + 24); this.bossEntry(b); this.zombies.push(b); this.bossRef = b; this.level.obj[3].spawned = true; this.audio.roar(1.4); this.shake(1); this.banner('Le Shibanophile', 'Le zombie qui déteste les shibas'); this.torchFlicker = 1; });
  },
  // ---------- Secteur 5 bonus : l'hôpital
  newHospital() {
    this.keysOpen = false; this.audio.init(); this.resetModes();
    this.diff = DIFFS[this.diffKey]; this.activeZone = -1; this.shibaFound = new Set(); this.resetWorld();
    this.mode = 'hospital'; this.run = { fetish: 0, saved: 0, riot: 0, special: 0, sv: [0, 0, 0] }; this.stats = newStats();
    const p = this.player = new Player(this, 150, 600);
    p.armor = 2; for (const w of p.weapons) { w.owned = true; w.ammo = w.magSize(); if (!w.def.infinite) w.reserve = w.def.ammoPack * 2; }
    p.grenades = Math.max(p.grenades, 4); p.mines = Math.max(p.mines, 2); p.decoys = Math.max(p.decoys, 2);
    this.secretCp = { armor: p.armor, cur: p.cur, weapons: p.weapons.map(w => w.snapshot()), grenades: p.grenades, mines: p.mines, decoys: p.decoys };
    this.lives = this.diff.lives; this.score = 0; this.mult = 1; this.maxMult = 1; this.kills = 0; this.runTime = 0; this.savedScore = false; this.deathT = 0;
    this.zoneEntered = [true, true, true, true]; this.safeEntered = [true, true, true]; this.safeName = null; this.checkpoint = null;
    this.activeZone = 0; this.zoneHit = false; this.level.setGate(ZONES[0].x1, true);
    this.buildHospital(); this.level.obj[0] = { type: 'hospital', spawned: false, dead: false };
    for (let i = 0, t = 0; i < Math.round(16 * this.diff.pop) && t < 200; t++) { const x = rand(600, 2000), y = rand(ST + 40, SB - 40); if (this.level.pointObstacle(x, y)) continue; const z = new Zombie(this, this.director.pickType(HOSP_W), x, y, null); z.aggro = false; this.zombies.push(z); i++; }
    this.state = 'playing'; this.cam.x = p.x; this.cam.y = p.y; this.showScreen(null); this.input.mdown = false;
    this.banner('Secteur 5 · Hôpital Saint-Lazare', 'Traverse les couloirs jusqu\'à la morgue'); this.audio.setTheme('parking');
  },
  buildHospital() {
    const L = this.level, H = HOSP;
    L.obstacles = L.obstacles.filter(o => o.zone !== 0); L.spawners = L.spawners.filter(s => s.zone !== 0); L.chests = (L.chests || []).filter(c => c.zone !== 0);
    for (const l of L.lamps) if (l.zone === 0) l.on = false;
    this.pickups = this.pickups.filter(pk => pk.zone !== 0);
    const A = o => { o.zone = 0; return L.add(o); }, wall = (x, y, w, h) => A({ x, y, w, h, z: 46, kind: 'hwall', blood: Math.random() < 0.3 ? Math.round(rand(4, Math.max(5, w - 14))) : 0 });
    for (const y of [H.top, H.bot]) { let x = H.x0; for (const d of H.doors) { wall(x, y, d - 42 - x, 18); x = d + 42; } wall(x, y, H.morgue - x, 18); }
    for (const x of H.cols) { wall(x, ST, 18, H.top - ST); wall(x, H.bot + 18, 18, SB - H.bot - 18); }
    for (const d of H.doors) for (const y of [205, 905]) { A({ x: d - 70, y, w: 40, h: 62, z: 18, kind: 'bed', stain: Math.random() < 0.4 }); A({ x: d + 30, y: y + 8, w: 40, h: 62, z: 18, kind: 'bed', stain: Math.random() < 0.4 }); }
    for (let i = 0; i < 4; i++) A({ x: H.morgue + 150 + (i % 2) * 150, y: 300 + Math.floor(i / 2) * 480, w: 44, h: 70, z: 18, kind: 'bed', sheet: '#e8ece8', stain: true });
    for (let x = H.x0 + 120; x < H.morgue; x += 280) L.fixedLights.push({ x, y: 600, r: 220, c: '190,230,255', i: 0.6, flick: 3, zone: 0 });
    for (const d of H.doors) for (const y of [300, 900]) L.fixedLights.push({ x: d, y, r: 190, c: '170,215,255', i: 0.38, flick: Math.random() < 0.5 ? 3 : 2, zone: 0 });
    L.fixedLights.push({ x: H.morgue + 270, y: 600, r: 430, c: '140,255,210', i: 0.42, flick: 3, zone: 0 }, { x: 120, y: 600, r: 260, c: '255,220,170', i: 0.5, flick: 1, zone: 0 });
    for (const d of H.doors) for (const y of [300, 900]) L.spawners.push({ x: d, y, kind: 'vent', zone: 0 });
    for (const [kd, x, y] of [['med', H.doors[0], 260], ['ammo', H.doors[1], 960], ['med', H.doors[2], 960], ['ammo', H.doors[3], 260], ['grenade', H.doors[3], 960], ['ammo', H.morgue - 60, 600]]) { const pk = new Pickup(this, kd, x, y, 0); pk.zone = 0; pk.life = Infinity; this.pickups.push(pk); }
    L.hosp = true; L.rebuildGrid(); L.ground.chunks.clear();
  },
  updateHospital() {
    const o = this.level.obj[0], p = this.player; if (!o || o.spawned || p.dead) return;
    if (p.x > HOSP.morgue + 60) {
      o.spawned = true;
      const b = new MiniBoss(this, HOSP.morgue + 380, 600, 3); this.bossEntry(b); this.zombies.push(b); this.bossRef = b;
      this.audio.roar(1.2); this.shake(0.8); this.torchFlicker = 1.2; this.banner('LE CHIRURGIEN', 'Il opère sans anesthésie');
      for (const f of this.level.fixedLights) if (f.zone === 0 && f.flick === 3) f.i *= 0.7;
    }
  },
  respawnSecret() {
    const hosp = this.mode === 'hospital', cp = this.secretCp, p = new Player(this, hosp ? (this.level.obj[0].spawned ? HOSP.morgue + 90 : 150) : PLAZA, hosp ? 600 : 820);
    p.armor = cp.armor; p.cur = cp.cur; p.weapons.forEach((w, i) => w.restore(cp.weapons[i])); p.grenades = cp.grenades; p.mines = cp.mines; p.decoys = cp.decoys; p.inv = 2;
    this.player = p; this.mult = 1; for (const z of this.zombies) if (!z.dead && z.type !== 'boss' && dist2(z.x, z.y, p.x, p.y) < 300 * 300) z.dead = true; compact(this.zombies);
    this.banner('Encore debout', `${this.lives} vie${this.lives > 1 ? 's' : ''} restante${this.lives > 1 ? 's' : ''}`);
  },
  updateShibaNPC(dt) {
    if (!this.npcShibas) return;
    const kib = this.hazards.find(h => h.kind === 'kibble');
    for (const sh of this.npcShibas) {
      if (sh.caught) { sh.caught -= dt; if (sh.caught <= 0) { sh.caught = 0; sh.x = rand(ZONES[3].x0 + 100, ZONES[3].x1 - 100); sh.y = rand(ST + 80, SB - 80); } continue; }
      sh.t -= dt; let fx = 0, fy = 0;
      if (kib) { const dx = kib.x - sh.x, dy = kib.y - sh.y, d = Math.hypot(dx, dy) || 1; if (d > 14) { sh.vx = dx / d * 150; sh.vy = dy / d * 150; } else sh.vx = sh.vy = 0; sh.x += sh.vx * dt; sh.y += sh.vy * dt; continue; }
      for (const z of this.hash.query(sh.x, sh.y, 140, this._q)) { if (z.dead) continue; const dx = sh.x - z.x, dy = sh.y - z.y, d = Math.hypot(dx, dy) || 1; fx += dx / d; fy += dy / d; }
      if (fx || fy) { const l = Math.hypot(fx, fy); sh.vx = fx / l * 230; sh.vy = fy / l * 230; }
      else if (sh.t <= 0) { sh.t = rand(1, 3); const a = rand(0, TAU), sp = Math.random() < 0.4 ? 0 : 60; sh.vx = Math.cos(a) * sp; sh.vy = Math.sin(a) * sp; }
      sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.r = 9; this.collideWorld(sh); sh.x = clamp(sh.x, ZONES[3].x0 + 40, ZONES[3].x1 - 40);
      if ((sh.barkT -= dt) <= 0) { sh.barkT = rand(4, 9); this.audio.bark(sh.x, sh.y); }
    }
  },
  newDaily() {
    const m = todayMod(); this.newSurvival(false); this.dailyMod = m;
    const p = this.player;
    if (m.id === 'pistol') { p.weapons.forEach((w, i) => { if (i) w.owned = false; }); p.cur = 0; }
    if (m.id === 'glass') { p.maxHp = p.hp = 40; }
    if (m.id === 'tanks') { }
    this.banner('Défi du jour', m.name + ' · ' + m.desc);
  },
  newSurvival(keep) {
    this.keysOpen = false; this.audio.init(); const prev = keep && this.player ? this.player : null; this.resetModes();
    this.diff = DIFFS[this.diffKey]; this.activeZone = -1; this.shibaFound = new Set(); this.resetWorld();
    this.mode = 'survival'; this.run = { fetish: 0, saved: 0, riot: 0, special: 0, sv: [0, 0, 0] }; this.stats = newStats(); this.shibaFound = new Set();
    const p = this.player = new Player(this, PLAZA, 780);
    if (prev) { p.money = prev.money; p.armor = prev.armor; p.grenades = Math.max(3, prev.grenades); p.mines = Math.max(1, prev.mines); p.decoys = Math.max(2, prev.decoys); p.weapons.forEach((w, i) => w.restore(prev.weapons[i].snapshot())); p.cur = prev.cur; }
    else { p.money = 600; for (const i of [1, 2]) { const w = p.weapons[i]; w.owned = true; w.ammo = w.magSize(); w.reserve = w.def.ammoPack * 2; } }
    this.lives = 1; this.score = 0; this.mult = 1; this.maxMult = 1; this.kills = 0; this.runTime = 0; this.savedScore = false; this.deathT = 0;
    this.zoneEntered = [true, true, true, true]; this.safeEntered = [true, true, true]; this.safeName = null; this.checkpoint = null;
    this.activeZone = 3; this.zoneHit = false; this.level.setGate(ZONES[3].x0, true); this.level.setGate(EXIT.x0, true);
    this.level.obj[3] = { type: 'survival', spawned: false, dead: false };
    this.pickups = this.pickups.filter(pk => pk.zone === 3 || pk.zone === -2); this.survivors = [];
    this.surv = { wave: 0, state: 'break', t: 5, weights: { walker: 60, runner: 20 } };
    this.state = 'playing'; this.cam.x = p.x; this.cam.y = p.y; this.showScreen(null); this.input.mdown = false;
    this.banner('Mode Survie', 'Place de la Mairie · des vagues sans fin'); this.audio.setTheme('mairie');
  },
  updateSurvival(dt) {
    const s = this.surv; if (!s || this.player.dead) return;
    if (s.state === 'break') {
      s.t -= dt;
      if (s.t <= 0) {
        s.wave++; s.state = 'wave'; const n = s.wave;
        s.weights = this.dailyMod && this.dailyMod.weights ? this.dailyMod.weights : { walker: 50, runner: 20 + n * 2, bomber: 8, spitter: 6 + n, brute: 2 + n, riot: 3 + n * 1.5, dog: n > 1 ? 2 + n : 0 };
        this.director.queue += Math.min(90, Math.round((8 + n * 5) * this.diff.pop));
        this.banner(`Vague ${n}`, n % 5 === 0 ? 'L\'Abomination revient' : 'Tiens la place'); this.audio.siren();
        if (n % 5 === 0) this.later(1.5, () => this.spawnBoss());
        if (n >= 10) this.unlock('wave10');
      }
    } else if (this.director.queue <= 0 && this.zombies.length === 0) {
      s.state = 'break'; s.t = 9; const bonus = Math.round(1000 * s.wave * this.diff.score); this.score += bonus; this.newManche('la pause entre deux vagues');
      this.toast(`Vague ${s.wave} repoussée · +${fmt(bonus)}`, '#7fd18b'); this.audio.objective();
      for (const [kind, dx] of [['ammo', -40], ['ammo', 40], ['med', 0], ['battery', 80]]) { const pk = new Pickup(this, kind, PLAZA + dx, 700, 0); pk.vx = pk.vy = 0; this.pickups.push(pk); }
    }
  },
  // une partie ne doit rien hériter du mode joué avant (duo, nuit sans fin, entraînement)
  resetModes() { this.reviveUsed = false; this.net = null; this.netGuest = false; this.netGuestEnd = false; this.hwTip = false; this.dogTip = false; this.endless = null; this.coop = false; this.p2 = null; this.p1Down = 0; this.train = null; this.dailyMod = null; this.seedOff = 0; },
  newCoop() {
    const L = this.input.padList(), cpads = this.coopPads; this.newGame(); this.coop = true; this.coopPads = cpads; this.p2 = this.makeP2(140, 660);
    this.later(0.5, () => this.toast(cpads ? `J1 : ${cpads.p1 === 'kb' ? 'clavier et souris' : 'manette ' + (cpads.p1 + 1)} · J2 : manette ${cpads.p2 + 1}` : L.length ? `J2 : ${L.length >= 2 ? '2e manette' : 'manette'} · J1 : ${L.length >= 2 ? '1re manette ou clavier' : 'clavier et souris'}` : 'J2 : branche une manette et appuie sur un bouton', '#9fd6e6'));
  },
  // ---------- camp d'entraînement
  newTraining(tut) {
    this.keysOpen = false; this.audio.init(); this.endless = null; this.coop = false; this.p2 = null; this.dailyMod = null; this.seedOff = 0;
    this.diff = DIFFS.facile; this.activeZone = -1; this.shibaFound = new Set(); this.resetWorld();
    this.mode = 'training'; this.run = { fetish: 0, saved: 0, riot: 0, special: 0, sv: [0, 0, 0] }; this.stats = newStats();
    const p = this.player = new Player(this, 220, 600); p.money = 0; p.grenades = 9; p.mines = 5; p.decoys = 5;
    for (const w of p.weapons) { w.owned = true; w.ammo = w.magSize(); if (!w.def.infinite) w.reserve = 999; }
    this.lives = 9; this.score = 0; this.mult = 1; this.maxMult = 1; this.kills = 0; this.runTime = 0; this.savedScore = true; this.deathT = 0;
    this.zoneEntered = [true, true, true, true]; this.safeEntered = [true, true, true]; this.safeName = null; this.checkpoint = this.makeCheckpoint(220, 600);
    this.level.setGate(ZONES[0].x1, true); this.pickups = []; this.survivors = []; this.zombies = []; this.director.reset();
    const R = (ax, ay, bx, by, sp) => ({ ax, ay, bx, by, sp });
    this.trainRails = [R(560, 360, 560, 840, 120), R(820, 300, 1240, 300, 160), R(1000, 900, 1500, 900, 200), R(1400, 420, 1400, 780, 260), R(1750, 300, 1750, 900, 180), R(2050, 500, 2350, 700, 230)];
    this.trainFixed = [[420, 520], [1900, 560], [1950, 620], [1880, 650]];
    this.zombies.push(...this.trainRails.map(r => new Target(this, 0, 0, r)), ...this.trainFixed.map(([x, y]) => new Target(this, x, y, null)));
    for (const [x, y] of [[420, 600], [1000, 600], [1600, 600], [2100, 600]]) this.level.fixedLights.push({ x, y, r: 460, c: '255,224,180', i: 0.55, flick: 0, zone: 0 });
    this.train = { tut: !!tut, step: 0, stepT: 0, moved: 0, hits: 0, sprint: 0, cur0: p.cur, gr0: p.grenades, lx: p.x, ly: p.y, done: false };
    this.state = 'playing'; this.cam.x = p.x; this.cam.y = p.y; this.showScreen(null); this.input.mdown = false;
    this.banner(tut ? 'Didacticiel' : "Camp d'entraînement", tut ? 'Cortana débarque… on ne sait pas trop comment' : 'Les cibles ne mordent pas'); this.audio.setTheme('gare');
  },
  updateTraining(dt) {
    const s = this.train, p = this.player; if (!s || p.dead) return;
    s.moved += Math.hypot(p.x - s.lx, p.y - s.ly); s.lx = p.x; s.ly = p.y; if (p.sprinting) s.sprint += dt;
    p.hp = Math.max(p.hp, p.maxHp * 0.5); p.battery = Math.max(p.battery, 60); s.stepT += dt;
    if (!s.tut) return;
    const st = TRAIN_STEPS[s.step];
    if (st && st.ok(this, s)) {
      s.step++; s.stepT = 0; this.audio.objective(); this.toast('Étape réussie', '#7fd18b');
      if (TRAIN_STEPS[s.step].id === 'switch') s.cur0 = p.cur; if (TRAIN_STEPS[s.step].id === 'grenade') s.gr0 = p.grenades;
      if (TRAIN_STEPS[s.step].id === 'free' && !s.done) { s.done = true; this.banner('Entraînement réussi', 'Tu es prêt pour la nuit'); this.audio.siren && this.audio.objective(); }
    }
  },
  trainKill(z) {
    this.train.hits++; this.score += 100; this.toast('+100', '#f0b25a');
    this.later(1.6, () => { if (this.mode !== 'training') return; this.zombies.push(new Target(this, z.rail ? 0 : z.x, z.rail ? 0 : z.y, z.rail)); });
  },
  trainObjective() { const s = this.train; if (!s.tut) return { text: `Tir libre · ${s.hits} cible${s.hits > 1 ? 's' : ''} abattue${s.hits > 1 ? 's' : ''} · Pause puis « Quitter » pour revenir`, tx: null };
    const i = Math.min(s.step, TRAIN_STEPS.length - 1); return { text: TRAIN_STEPS[i].t(), progress: i / (TRAIN_STEPS.length - 1), tx: null }; },
  // ---------- mode Nuit sans fin
  newEndless() {
    this.newGameCore(); this.endless = { night: 1, m: {} };
    this.seedOff = Math.floor(Math.random() * 100000); this.resetWorld(); this.player = new Player(this, 140, 600); this.checkpoint = this.makeCheckpoint(140, 600);
    this.audio.setTheme('gare'); this.banner('Nuit sans fin · nuit 1', 'Une ville différente à chaque partie. Jusqu\'où tiendras-tu ?');
  },
  nextNight() {
    const E = this.endless, p = this.player; E.night++;
    const keep = { money: p.money, armor: p.armor, grenades: p.grenades, mines: p.mines, decoys: p.decoys, weapons: p.weapons.map(w => ({ owned: w.owned, ammo: w.ammo, reserve: w.reserve, lvl: { ...w.lvl } })), maxHp: p.maxHp, battery: p.battery };
    const b = DIFFS[this.diffKey], n = E.night - 1; this.diff = { ...b, hp: b.hp * (1 + 0.3 * n), dmg: b.dmg * (1 + 0.15 * n), pop: b.pop * (1 + 0.15 * n), spawn: b.spawn * (1 + 0.1 * n), score: b.score * (1 + 0.25 * n) };
    this.seedOff = Math.floor(Math.random() * 100000); const buddy = this.buddy; this.resetWorld(); this.buddy = buddy;
    const q = this.player = new Player(this, 140, 600); Object.assign(q, { money: keep.money, armor: keep.armor, grenades: keep.grenades, mines: keep.mines, decoys: keep.decoys, maxHp: keep.maxHp, hp: keep.maxHp, battery: 100 });
    q.weapons.forEach((w, i) => { const k = keep.weapons[i]; w.owned = k.owned; w.ammo = k.ammo; w.reserve = k.reserve; w.lvl = k.lvl; });
    this.zoneEntered = [false, false, false, false]; this.safeEntered = [false, false, false]; this.cleared = []; this.checkpoint = this.makeCheckpoint(140, 600);
    this.cam.x = 600; this.cam.y = 600; this.state = 'playing';
    this.banner(`Nuit ${E.night}`, 'Les zombies sont plus nombreux et plus coriaces'); this.audio.siren();
  },
  openMutations() {
    const E = this.endless, pool = MUTATIONS.filter(m => !(m.once && E.m[m.id])), picks = [];
    while (picks.length < 3 && pool.length) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    this.state = 'mut'; this.audio.flame(false); this.bannerObj = null;
    $('mut-list').innerHTML = picks.map(m => `<button type="button" class="mut-card" data-mut="${m.id}"><span class="mut-ico" aria-hidden="true">${m.ico}</span><b>${m.name}</b><small>${m.desc}</small>${E.m[m.id] ? `<i>déjà ×${E.m[m.id]}</i>` : ''}</button>`).join('');
    $('mut-night').textContent = `Nuit ${E.night} · secteur ${Math.min(4, this.safeEntered.filter(Boolean).length + 1)}`;
    $('mut-modal').hidden = false;
    for (const b of document.querySelectorAll('[data-mut]')) b.addEventListener('click', () => this.pickMutation(b.dataset.mut));
    requestAnimationFrame(() => { const f = document.querySelector('[data-mut]'); if (f) f.focus(); });
  },
  pickMutation(id) {
    const E = this.endless, m = MUTATIONS.find(x => x.id === id), p = this.player; if (!m) return;
    E.m[id] = (E.m[id] || 0) + 1; if (m.apply) m.apply(this, p);
    $('mut-modal').hidden = true; this.state = 'playing'; this.input.mdown = false; this.audio.objective(); this.toast(`Mutation : ${m.name}`, '#d88aff');
  }
});
