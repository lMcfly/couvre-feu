// ============================================================ jeu
class Game {
  constructor() {
    this.audio = new AudioSys(); this.input = new Input(canvas); this.shop = new Shop(this); this.director = new Director(this);
    this.hash = new SpatialHash(64); this._q = []; this._qs = [];
    this.state = 'title'; this.diffKey = 'normal'; this.diff = DIFFS.normal; this.time = 0;
    this.cam = { x: 760, y: 600 }; this.trauma = 0; this.shakeX = 0; this.shakeY = 0;
    this.toasts = []; this.pops = []; this.denyMsg = null; this.speech = null; this.achCards = []; this.bannerObj = null; this.notices = []; this.hurtFlash = 0; this.weaponFlash = 0; this.multPulse = 0; this.hint = null;
    this.charKey = Settings.char; this.comic = new Comic(this);
    this.run = { fetish: 0, saved: 0, riot: 0, special: 0, sv: [0, 0, 0] }; this.mode = 'story'; this.stats = newStats(); this.shibaFound = new Set();
    this.torchFlicker = 0; this.score = 0; this.mult = 1; this.lives = 2; this.kills = 0; this.maxMult = 1; this.runTime = 0;
    this.setupDemo();
  }
  resetWorld() {
    this.cleared = []; this.finFx = null; this.buddy = null; this.event = null; this.slowT = 0; this.recentKills = []; this.slowCd = 0; this.dailyMod = null;
    this.mapReports = {}; this.toasts = []; this.pops = []; this.denyMsg = null; this.speech = null; this.achCards = []; this.bannerObj = null; this.notices = []; this.mapHover = null;
    this.zombies = []; this.bullets = []; this.flames = []; this.rockets = []; this.throwables = []; this.mines = []; this.acids = [];
    this.puddles = []; this.fires = []; this.shockwaves = []; this.beams = []; this.particles = []; this.pickups = []; this.lights = []; this.survivors = [];
    this.timers = []; this.attractions = []; this.texts = []; this.rain = []; this.fogs = []; this.hazards = []; this.blackoutT = 0; this.cine = null; this.zoom = 1; this.cineK = 0;
    if (this.level) for (const o of this.level.obstacles) if (o.snd) this.audio.alarmStop(o);
    this.level = new Level(this); this.director.reset(); this.bossRef = null;
  }
  setupDemo() {
    this.keysOpen = false; this.resetModes(); this.state = 'title'; this.diff = DIFFS[this.diffKey]; this.activeZone = 0; this.resetWorld();
    this.player = new Player(this, 640, 640); this.player.hidden = true;
    for (let i = 0; i < 22; i++) { const z = new Zombie(this, Math.random() < 0.15 ? 'runner' : 'walker', rand(300, 1500), rand(260, 960), null); if (!this.level.pointObstacle(z.x, z.y)) this.zombies.push(z); }
    this.cam.x = 760; this.cam.y = 600;
  }
  showScreen(id) { for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id; }
  screenToWorld(sx, sy) { const S = VS * DPR * (this.zoom || 1); return { x: (sx * DPR - (W / 2 - this.cam.x * S)) / S, y: (sy * DPR - (H / 2 - this.cam.y * S)) / S }; }
  wheelCenter() { const ch = H / DPR / HUDK, cw = W / DPR / HUDK, Ro = Math.min(TOUCH ? 92 : 104, ch * 0.24), ps = this.w2h(this.player.x, this.player.y - 16); return { x: clamp(ps.x, Ro + 12, cw - Ro - 12), y: clamp(ps.y, Ro + 40, ch - Ro - 50) }; }
  w2h(x, y) { const s = this.worldToScreen(x, y); s.x /= HUDK; s.y /= HUDK; return s; }
  worldToScreen(x, y) { const S = VS * DPR * (this.zoom || 1); return { x: ((x - this.cam.x) * S + W / 2) / DPR, y: ((y - this.cam.y) * S + H / 2) / DPR }; }
  // ---------- aides
  later(t, fn) { this.timers.push({ t, fn, dead: false }); }
  shake(a) { this.netEmit(['shake', netR(a)]); if (Settings.calm) a *= 0.25; this.trauma = Math.min(1, this.trauma + a); }
  // Messages rangés par type : butin au-dessus du joueur, refus sous le joueur, répliques en bulle, succès en carte, le reste dans le fil à gauche
  toast(msg, color = '#d8d2c4') {
    this.netEmit(['toast', msg, color]);
    if (msg.startsWith('Succès débloqué : ')) { const name = msg.slice(18); if (!this.achCards.some(a => a.name === name)) this.achCards.push({ name, t: 3.8 }); return; }
    if (/^\+/.test(msg)) { const o = this.pops.find(x => x.msg === msg); if (o) { o.n++; o.t = 1.6; } else { this.pops.push({ msg, color, t: 1.6, n: 1 }); if (this.pops.length > 3) this.pops.shift(); } return; }
    if (color === '#8b867b' || /plus de munitions|^Plus de |en recharge|déjà au maximum|^Distributeur vide/.test(msg)) { this.denyMsg = { msg, color: color === '#8b867b' ? '#c6c0b2' : color, t: 1.4 }; return; }
    const f = this.toasts.find(x => x.msg === msg); if (f) { f.n++; f.t = Math.max(f.t, 3.2); return; }
    this.toasts.unshift({ msg, color, t: this.p2 ? 2.8 : 4.2, n: 1, age: 0 }); if (this.toasts.length > 3) this.toasts.length = 3;
  }
  say(msg) { this.speech = { msg, t: 3 }; }
  banner(title, sub) { this.netEmit(['banner', title, sub]); this.bannerObj = { title, sub, t: 3.6 }; }
  // petit événement : bande fine en haut, la grande bannière reste pour les vrais moments
  notice(title, sub, color = '#7fd18b') {
    this.netEmit(['notice', title, sub, color]);
    if (this.notices.some(n => n.title === title && n.sub === sub)) return;
    this.notices.push({ title, sub, color, t: 3, age: 0 }); if (this.notices.length > 3) this.notices.splice(1, 1);
  }
  unlock(id) {
    if (this.mode === 'training') return;
    const u = Ach.get(); if (u[id]) return; u[id] = Date.now(); Ach.set(u);
    const a = ACH.find(x => x[0] === id); if (!a) return;
    this.toast(`Succès débloqué : ${a[1]}`, '#ffd23a'); this.audio.objective();
  }
  quip(k) { const l = QUIPS[this.charKey] && QUIPS[this.charKey][k]; if (l && this.state === 'playing') this.say(pick(l)); }
  makeNoise(x, y, r) { for (const z of this.hash.query(x, y, r, [])) if (dist2(z.x, z.y, x, y) < r * r) z.aggro = true; }
  nearestAttraction(x, y) { let best = null, bd = Infinity; for (const a of this.attractions) { const d = dist2(a.x, a.y, x, y); if (d < a.r * a.r && d < bd) { bd = d; best = a; } } return best; }
  collideWorld(e) {
    let hit = null;
    for (const o of this.level.queryRect(e.x - e.r - 2, e.y - e.r - 2, e.r * 2 + 4, e.r * 2 + 4)) {
      const nx = clamp(e.x, o.x, o.x + o.w), ny = clamp(e.y, o.y, o.y + o.h), dx = e.x - nx, dy = e.y - ny, d2 = dx * dx + dy * dy;
      if (d2 >= e.r * e.r) continue;
      if (d2 > 1e-6) { const d = Math.sqrt(d2), push = e.r - d; e.x += dx / d * push; e.y += dy / d * push; }
      else { const l = e.x - o.x, rr = o.x + o.w - e.x, t = e.y - o.y, b = o.y + o.h - e.y, m = Math.min(l, rr, t, b); if (m === l) e.x = o.x - e.r; else if (m === rr) e.x = o.x + o.w + e.r; else if (m === t) e.y = o.y - e.r; else e.y = o.y + o.h + e.r; }
      hit = o;
    }
    e.x = clamp(e.x, e.r, WORLD.w - e.r); e.y = clamp(e.y, ST + e.r * 0.6, SB - e.r);
    return hit;
  }
  slowMo(t, label) { this.netEmit(['slow', t, label]); if (label !== 'SECTEUR NETTOYÉ') this.finFx = null; this.slowT = t; this.slowMax = t; this.slowLabel = label; this.audio.tone({ f: 90, f2: 40, dur: 0.9, type: 'sine', g: 0.35 }); this.shake(0.4); }
  pause() { if (this.state !== 'playing') return; this.fillPauseStats(); if (this.wheel) { this.wheel.open = false; this.wheel.k = 0; } this.state = 'paused'; this.audio.flame(false); this.showScreen('scr-pause'); $('btn-resume').focus(); if (this.net && !this._netQuiet) Net.send(this.net === 'host' ? { t: 'pz', on: 1 } : { t: 'pause' }, true); }
  fillPauseStats() {
    const st = this.stats || {}, t = Math.floor(this.runTime || 0), acc = st.shots ? Math.round(100 * st.hits / st.shots) : 0, p = this.player;
    const zn = this.activeZone >= 0 ? ZONES[this.activeZone] : null;
    $('pause-where').textContent = this.mode === 'training' ? (this.train && this.train.tut ? 'Didacticiel' : "Camp d'entraînement") : this.endless ? `Nuit sans fin · nuit ${this.endless.night}` : this.dailyMod ? `Défi du jour · ${this.dailyMod.name}` : this.mode === 'survival' ? `Mode survie · vague ${this.surv ? this.surv.wave : 0}` : this.mode === 'secret' ? 'Le Paradis des Shibas' : this.mode === 'hospital' ? (this.hcamp ? 'Mission 5 · Hôpital Saint-Lazare' : 'Secteur 5 · Hôpital Saint-Lazare') : `${zn ? zn.sub + ' · ' + zn.name : this.safeName || 'Campagne'} · ${this.diff.name}${this.p2 ? ' · duo' : ''}`;
    const cells = [['Score', fmt(Math.floor(this.score))], ['Zombies abattus', fmt(this.kills)], ['Temps', `${Math.floor(t / 60)} min ${String(t % 60).padStart(2, '0')}`], ['Précision', acc + ' %'], ['Multiplicateur max', '×' + (this.maxMult || 1).toFixed(1)], ['Argent', '$ ' + fmt(p ? p.money : 0)]];
    if (this.isCampaign()) cells.push(['Shibas', `${this.shibaFound.size} / ${SHIBAS_TOTAL}`], ['Vies', `${this.lives} / ${this.diff.lives}`], ['Survivants sauvés', String(this.run ? this.run.saved : 0)]);
    if (this.mode === 'training' && this.train) cells.push(['Cibles abattues', String(this.train.hits)]);
    $('pause-stats').innerHTML = cells.map(([a, b]) => `<div><b>${b}</b><span>${a}</span></div>`).join('');
    $('pause-main').hidden = false; $('pause-settings').hidden = true;
  }
  resume() { if (this.state !== 'paused') return; this.state = 'playing'; this.showScreen(null); this.input.mdown = false; if (this.net && !this._netQuiet) Net.send(this.net === 'host' ? { t: 'pz', on: 0 } : { t: 'resume' }, true); }
  // ---------- mise à jour
  update(dt) {
    this.time += dt;
    const inp = this.input.poll(this);
    pollPadCapture();
    const st0 = this.state;
    if (st0 === 'playing') { if (this.netGuest) { this.portrait = this.input.touchMode && innerHeight > innerWidth * 1.05; this.updateGuest(dt, inp); } else this.updatePlaying(dt, inp); }
    else if (this.state === 'title') { this.updateTitle(dt); if (!padCursor.update(this, dt)) this.menuNav(inp); }
    else if (!padCursor.update(this, dt)) this.menuNav(inp);
    if (this.net === 'host') this.netHostTick(dt);
    if (this.state === 'playing') padCursor.hide();
    if (this.state !== 'playing' && this.level) for (const c of this.level.cars) if (c.snd) c.snd.g.gain.setTargetAtTime(0, this.audio.t, 0.05);
    this.input.endFrame();
  }
  menuNav(a) {
    if (padCapture || performance.now() < padBlockUntil || !$('join-modal').hidden) return;
    if (this.keysOpen) {
      if (capture && a.menuBack) { capture = null; renderBinds(); return; }
      if (!capture && (a.menuBack || a.pause)) { closeKeys(); return; }
    } else {
      if (this.state === 'paused' && (a.pause || a.menuBack)) { if (!$('pause-settings').hidden) { if (!setBack()) $('btn-pause-back').click(); } else this.resume(); return; }
      if (this.state === 'shop' && (a.pause || a.menuBack)) { this.shop.close(); return; }
      if (this.state === 'comic' && (a.pause || a.menuBack)) { this.comic.finish(); return; }
      if (this.state === 'map' && a.pause && !this.input.pc.has('Escape')) { this.mapContinue(); return; }
    }
    if (this.state === 'title' && !this.keysOpen) {
      const sheet = document.querySelector('.sheet:not([hidden])');
      if (a.menuBack && (closeHubModals() || (!sheet && (closeFiche() || closeFolder())))) return;
      if (sheet && a.menuBack) { if (!setBack()) closeSheets(); return; }
      const td = a.menuTab || a.cycle, hm = document.querySelector('.hub-modal:not([hidden])'); if (hm) { /* menu modal ouvert : pas d'onglets */ } else if (td) { const tabs = [...document.querySelectorAll('.hub-tabs .tab')], cur = tabs.findIndex(b => b.getAttribute('aria-selected') === 'true'); tabs[(cur + td + tabs.length) % tabs.length].click(); this.audio.ui(); return; }
      if (!sheet && !hm && a.menuY) { $('btn-ach').click(); return; }
    }
    if (!(a.menuPrev || a.menuNext || a.menuOk || a.menuLeft || a.menuRight)) return;
    const scr = document.querySelector('.hub-modal:not([hidden])') || document.querySelector('.sheet:not([hidden])') || document.querySelector('.screen:not([hidden])'); if (!scr) return;
    const items = [...scr.querySelectorAll('button:not([disabled]), input')].filter(e => e.offsetParent !== null); if (!items.length) return;
    const ae = document.activeElement; let i = items.indexOf(ae);
    if (ae && ae.type === 'range' && (a.menuLeft || a.menuRight)) { ae.value = clamp(+ae.value + (a.menuRight ? 0.1 : -0.1), 0, 1); ae.dispatchEvent(new Event('input')); return; }
    if (a.menuPrev || a.menuLeft) i = i <= 0 ? items.length - 1 : i - 1; else if (a.menuNext || a.menuRight) i = (i + 1) % items.length;
    if (a.menuOk && ae && items.includes(ae)) { ae.click(); return; }
    const it = items[i] || items[0]; it.focus(); padCursor.snapTo(it);
  }
  updateTitle(dt) {
    this.audio.setTheme('kdd'); this.audio.musicTick(0.1);
    const p = this.player; p.aim = -0.15 + Math.sin(this.time * 0.35) * 1.0; this.activeZone = 0;
    this.hash.clear(); for (const z of this.zombies) this.hash.insert(z);
    for (const z of this.zombies) z.update(dt);
    this.updateCommon(dt);
    this.cam.x = lerp(this.cam.x, 760, 0.05); this.cam.y = lerp(this.cam.y, 600, 0.05);
  }
  closeWheel(apply) {
    const W8 = this.wheel; if (!W8 || !W8.open) return; W8.open = false;
    const p = this.player, w = p.weapons[W8.sel];
    if (!apply || !w || W8.sel === p.cur) return;
    if (w.owned) p.switchTo(W8.sel);
    else { this.audio.deny(); this.toast(`${w.def.name} : pas encore disponible (marché noir · $${fmt(w.def.price)})`, '#8b867b'); }
  }
  updatePlaying(dt, inp) {
    this.portrait = this.input.touchMode && innerHeight > innerWidth * 1.05;
    if (this.portrait) { this.audio.flame(false); return; }
    if (inp.pause) { this.closeWheel(false); this.pause(); return; }
    if (this.cine) { this.updateCine(dt, inp); return; }
    const p = this.player; this.runTime += dt;
    const realDt = dt; let pdt = dt;
    const W8 = this.wheel || (this.wheel = { open: false, sel: -1, k: 0 });
    if (inp.wheelHeld && !p.dead) {
      if (!W8.open) { W8.open = true; W8.sel = p.cur; this.audio.tone({ f: 220, f2: 110, dur: 0.35, type: 'sine', g: 0.2 }); this.audio.flame(false); }
      if (inp.wheelDir != null) W8.sel = ((Math.round((inp.wheelDir + Math.PI / 2) / (TAU / 6)) % 6) + 6) % 6;
      inp.fire = inp.firePressed = inp.melee = inp.grenade = inp.mine = inp.decoy = inp.special = inp.reload = false; inp.cycle = 0; inp.slot = -1;
      inp.aimX = p.x + Math.cos(p.aim) * 200; inp.aimY = p.y + Math.sin(p.aim) * 200;
    } else if (W8.open) this.closeWheel(true);
    W8.k = clamp(W8.k + (W8.open ? 1 : -1) * realDt * 6, 0, 1);
    if (W8.open) { dt *= 0.2; pdt = realDt * 0.5; }
    if (this.slowT > 0) { this.slowT -= realDt; if (!W8.open) { dt *= 0.28; pdt = realDt * 0.45; } }
    if (!p.dead) p.update(pdt, inp);
    else if (this.p1Down > 0) { /* à terre : attend d'être relevé par son allié ou la fin de la manche */ }
    else { this.deathT -= dt; if (this.deathT <= 0) { if (this.lives > 0) { if (this.mode === 'secret' || this.mode === 'hospital') this.respawnSecret(); else this.respawn(); } else if (this.mode === 'survival' || this.mode === 'secret' || (this.mode === 'hospital' && !this.hcamp) || this.endless) { this.showEnd(false); return; } else { this.comic.show('gameover', () => this.showEnd(false)); return; } } }
    if (this.p2) this.updateRevive(pdt);
    if (this.p2) { const q = this.p2, i2 = this.input.pollP2(this); if (i2.pause && !inp.pause) { this.pause(); return; } if (!q.dead) { q.update(pdt, i2); if (!p.dead && !this.net && dist2(q.x, q.y, p.x, p.y) > 720 * 720) { q.x = p.x - 30; q.y = p.y + 20; this.toast('J2 ramené près du J1', '#9fd6e6'); } } }
    // progression
    const px = this.player.dead ? -1 : this.player.x;
    for (let k = 0; k < 4; k++) if (!this.zoneEntered[k] && px > ZONES[k].x0 + (k === 0 ? 0 : 50) && px < ZONES[k].x1) this.enterZone(k);
    for (let s = 0; s < 3; s++) if (!this.safeEntered[s] && px > SAFES[s].x0 + 40 && px < SAFES[s].x1) this.enterSafe(s);
    if (this.endless && px > EXIT.x0 + 50 && this.level.obj[3].dead) { this.nextNight(); return; }
    if (this.mode === 'story' && px > EXIT.x0 + 50 && this.level.obj[3].dead) { this.toHospital(); return; }
    if (this.mode === 'survival') this.updateSurvival(dt);
    if (this.mode === 'training') this.updateTraining(dt);
    if (this.mode === 'secret') this.updateShibaNPC(dt);
    if (this.mode === 'hospital') this.updateHospital();
    if (HALLOWEEN && !this.hwTip && this.mode !== 'training') { this.hwTip = true; this.later(4, () => this.toast(`Halloween : ${hwCount() >= HW_GOAL || Settings.pumpkin ? 'tête de citrouille déjà gagnée, joyeux massacre' : `abats des zombies déguisés (${hwCount()} / ${HW_GOAL}) pour la tête de citrouille`}`, '#ff9a3a')); }
    if ((this.seenT = (this.seenT || 0) - dt) <= 0) { this.seenT = 0.5; this.spotMonsters(); }
    this.updateBuddy(dt); this.updateEvent(dt);
    if (p.flashCd > 0) p.flashCd -= realDt; if (inp.flash && !p.dead) this.flash(); if (this.flashFx > 0) this.flashFx -= realDt;
    if (this.mode !== 'training') this.director.update(dt);
    this.hash.clear(); for (const z of this.zombies) if (!z.dead) this.hash.insert(z);
    this.attractions.length = 0;
    for (const c of this.level.cars) if (c.alarm > 0) this.attractions.push({ x: c.x + c.w / 2, y: c.y + c.h / 2, r: 1000 });
    for (const t of this.throwables) if (t.kind === 'decoy' && t.landed) this.attractions.push({ x: t.x, y: t.y, r: 950 });
    if (this.event && this.event.id === 'icecream') this.attractions.push({ x: this.event.x, y: this.event.y, r: 900 });
    for (const z of this.zombies) if (!z.dead) {
      const ox = z.x, oy = z.y; z.update(dt);
      if (!isFinite(z.x) || !isFinite(z.y)) { for (const k in z) if (typeof z[k] === 'number' && !isFinite(z[k])) z[k] = 0; z.x = isFinite(ox) ? ox : this.player.x + 320; z.y = isFinite(oy) ? oy : this.player.y; }
    }
    compact(this.zombies);
    for (const arr of [this.bullets, this.flames, this.rockets, this.throwables, this.mines, this.acids, this.shockwaves, this.fires, this.pickups, this.survivors, this.hazards]) { for (const e of arr) if (!e.dead) e.update(dt); compact(arr); }
    if (this.blackoutT > 0) this.blackoutT -= dt;
    for (const pd of this.puddles) { pd.life -= dt; if (pd.life <= 0) pd.dead = true; else for (const q of this.players()) if (!q.dead && dist2(q.x, q.y, pd.x, pd.y) < pd.r * pd.r) q.hurtDot(9 * this.diff.dmg * dt); }
    compact(this.puddles);
    for (const c of this.level.chests) if (!c.open && !p.dead && dist2(p.x, p.y, c.x, c.y) < 30 * 30) {
      c.open = true; const v = Math.round(c.value * this.diff.money); p.money += v; const bonus = Math.random() < 0.4; if (bonus) p.grenades = Math.min(9, p.grenades + 1);
      p.battery = Math.min(100, p.battery + 25);
      this.toast(`Coffre caché : +$${v} · piles +25 %${bonus ? ' · +1 grenade' : ''}`, '#f0b25a'); this.audio.pickup(); this.audio.coin();
      for (let i = 0; i < 12; i++) this.spawnP({ x: c.x, y: c.y, z: 8, vx: rand(-80, 80), vy: rand(-80, 80), vz: rand(80, 200), grav: 500, life: 0.7, type: 'spark', size: 1.8, emissive: true, color: '#ffd27a' });
    }
    for (const c of this.level.cars) {
      if (c.alarmCd > 0) c.alarmCd -= dt;
      if (c.alarm > 0) { c.alarm -= dt; this.audio.alarmUpdate(c); if (c.alarm <= 0) { this.audio.alarmStop(c); c.alarmCd = 6; } }
      if (c.burning > 0) { c.burning -= dt; if (Math.random() < dt * 22) this.spawnP({ x: c.x + rand(4, c.w - 4), y: c.y + c.h / 2, z: c.z + 6, vz: rand(40, 90), vx: rand(-10, 10), vy: rand(-10, 10), life: rand(0.4, 0.8), type: 'fire', size: rand(6, 11), emissive: true, drag: 1 }); }
      else if (c.wreck && Math.random() < dt * 3) this.spawnP({ x: c.x + rand(4, c.w - 4), y: c.y + c.h / 2, z: c.z + 6, vz: rand(20, 40), vx: rand(-8, 8), vy: rand(-8, 8), life: rand(1.5, 2.5), type: 'smoke', size: 7, grow: 12, drag: 0.5 });
      else if (!c.wreck && c.hp < c.maxHp * 0.45 && Math.random() < dt * 4) this.spawnP({ x: c.x + c.w * 0.8, y: c.y + c.h / 2, z: c.z, vz: 30, life: 1.4, type: 'smoke', size: 5, grow: 10, drag: 0.5 });
    }
    for (const s of this.level.spawners) if (s.anim > 0) s.anim = Math.max(0, s.anim - dt);
    this.updateObjectives(dt);
    this.updateCommon(dt);
    // indice d'interaction
    this.hint = null;
    if (!p.dead) for (const o of this.level.obstacles) {
      if (o.kind === 'shop' && rectDist(p.x, p.y, o) < 46) { this.hint = this.input.touchMode ? 'Bouton BOUTIQUE : ouvrir le marché noir' : `[${KL('melee')}] Ouvrir le marché noir`; break; }
      if (o.kind === 'machine' && rectDist(p.x, p.y, o) < 34) { this.hint = o.broken || o.charges <= 0 ? 'Distributeur vide' : (this.input.touchMode ? `Bouton SOINS : trousse de soin (${o.charges})` : `[${KL('melee')}] Prendre une trousse de soin (${o.charges})`); break; }
    }
    // caméra
    this.zoom = lerp(this.zoom || 1, 1, 1 - Math.exp(-4 * realDt)); this.cineK = Math.max(0, (this.cineK || 0) - realDt * 2.5);
    const S = VS * DPR * this.zoom, hw = W / 2 / S, hh = H / 2 / S;
    let tx = p.x, ty = p.y;
    if (this.p2 && !this.p2.dead && !p.dead && !this.net) { tx = (p.x + this.p2.x) / 2; ty = (p.y + this.p2.y) / 2; }
    else if (p.dead && this.p2 && !this.p2.dead) { tx = this.p2.x; ty = this.p2.y; }
    else if (!p.dead) { const ax = Math.cos(p.aim), ay = Math.sin(p.aim), lead = TOUCH ? (this.input.sticks.aim ? 1 : 0.6) : 1; tx += ax * 150 * lead; ty += ay * 110 * lead; }
    const k = 1 - Math.exp(-5 * realDt); this.cam.x = lerp(this.cam.x, tx, k); this.cam.y = lerp(this.cam.y, ty, k);
    this.cam.x = hw * 2 >= WORLD.w ? WORLD.w / 2 : clamp(this.cam.x, hw, WORLD.w - hw);
    this.cam.y = hh * 2 >= 1280 ? 560 : clamp(this.cam.y, -110 + hh, 1170 - hh);
    // musique : intensité selon les zombies proches
    let near = 0; for (const z of this.zombies) if (z.aggro && dist2(z.x, z.y, p.x, p.y) < 500 * 500) near++;
    this.audio.musicTick(this.bossRef && !this.bossRef.dead ? 1 : clamp(near / 30, 0, 1));
  }
  updateCommon(dt) {
    for (const t of this.timers) { t.t -= dt; if (t.t <= 0 && !t.dead) { t.dead = true; t.fn(); } } compact(this.timers);
    for (const pt of this.particles) pt.update(dt, this); compact(this.particles);
    for (const l of this.lights) { l.life -= dt; if (l.life <= 0) l.dead = true; } compact(this.lights);
    for (const b of this.beams) { b.life -= dt; if (b.life <= 0) b.dead = true; } compact(this.beams);
    for (const t of this.texts) { t.life -= dt; t.y -= 30 * dt; if (t.life <= 0) t.dead = true; } compact(this.texts);
    for (const t of this.toasts) { t.t -= dt; t.age += dt; } this.toasts = this.toasts.filter(t => t.t > 0);
    for (const t of this.pops) t.t -= dt; this.pops = this.pops.filter(t => t.t > 0);
    if (this.denyMsg && (this.denyMsg.t -= dt) <= 0) this.denyMsg = null; if (this.speech && (this.speech.t -= dt) <= 0) this.speech = null;
    if (this.achCards.length && (this.achCards[0].t -= dt) <= 0) this.achCards.shift();
    if (this.bannerObj) { this.bannerObj.t -= dt; if (this.bannerObj.t <= 0) this.bannerObj = null; }
    if (this.notices.length && !(this._achB > 50)) { const n = this.notices[0]; n.age += dt; n.t -= dt * (this.notices.length > 1 ? 1.8 : 1); if (n.t <= 0) this.notices.shift(); }
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 1.6); this.weaponFlash = Math.max(0, this.weaponFlash - dt); this.multPulse = Math.max(0, this.multPulse - dt * 4);
    this.trauma = Math.max(0, this.trauma - dt * 1.5); const sh = this.trauma * this.trauma * 16; this.shakeX = rand(-sh, sh); this.shakeY = rand(-sh, sh);
    this.torchFlicker = Math.max(0, this.torchFlicker - dt);
    this.updateWeather(dt);
  }
}
