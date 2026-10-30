// ============================================================ jeu : campagne, carte et fin de partie
mixin(Game, {
  makeCheckpoint(x, y) { const p = this.player; return { x, y, score: this.score, kills: this.kills, money: p.money, armor: p.armor, grenades: p.grenades, mines: p.mines, decoys: p.decoys, cur: p.cur, weapons: p.weapons.map(w => w.snapshot()), shibas: [...this.shibaFound] }; },
  snapStats() { return { score: this.score, kills: this.kills, shots: this.stats.shots, hits: this.stats.hits, dmg: this.stats.dmg, deaths: this.stats.deaths, time: this.runTime, saved: this.run.saved }; },
  missionReport(k) {
    const a = this.missionStart || { score: 0, kills: 0, shots: 0, hits: 0, dmg: 0, deaths: 0, time: 0, saved: 0 }, b = this.snapStats(), r = { k };
    for (const key of Object.keys(b)) r[key] = b[key] - a[key];
    r.shibas = [...this.shibaFound].filter(id => id.startsWith(k + '-')).length; return r;
  },
  showMap({ current, report = null, onGo = null, resumed = false }) {
    this.state = 'map'; this.audio.flame(false); this.mapGo = onGo; this.mapCur = current; this.mapSel = Math.min(current, MISSIONS - 1);
    $('map-eyebrow').textContent = `Carte de l'aventure · ${CHARS[this.charKey].name} · ${this.diff.name}`;
    $('map-shibas').innerHTML = `<img src="${iconURL('shiba')}" alt="">${this.shibaFound.size}/${SHIBAS_TOTAL}`; $('map-score').textContent = `${fmt(this.score)} pts`;
    this.mapHover = null; this.mapReports = this.mapReports || {}; if (report) this.mapReports[report.k] = report; $('map-tip').classList.remove('show');
    const nb = report ? newBeastsHTML(this.takeActBeasts()) : '';
    $('map-report').innerHTML = report ? reportHTML(report) + nb : resumed ? '<p class="hint">Partie reprise au dernier point de sauvegarde.</p>' : `<p class="hint">Trouve les 3 shibas cachés de chaque mission : ils aboient quand tu t\'approches. Les ${SHIBAS_TOTAL} débloquent un niveau secret.</p>`;
    $('btn-map-go').textContent = `Entrer · mission ${current + 1}`;
    const pc = this._mapPortrait || (this._mapPortrait = document.createElement('canvas')); pc.width = pc.height = 160; renderHead(pc, this.charKey, '#0c0a09');
    this.mapInfo(); this.showScreen('scr-map'); $('btn-map-go').focus(); if (nb) drawBestiary();
    const cv = $('map-cv'), g = cv.getContext('2d'), loop = () => { if (this.state !== 'map') return; drawMapCanvas(g, this, performance.now() / 1000, pc); requestAnimationFrame(loop); }; loop();
    const hit = e => { const r = cv.getBoundingClientRect(), sc = Math.min(r.width / 1000, r.height / 560), x = (e.clientX - r.left - (r.width - 1000 * sc) / 2) / sc, y = (e.clientY - r.top - (r.height - 560 * sc) / 2) / sc; let k = null; MAP_NODES.forEach((n, i) => { if (dist2(x, y, n.x, n.y) < 50 * 50) k = i; }); return k; };
    cv.onmousemove = e => { if (e.pointerType === 'touch' || TOUCH) return; const k = hit(e); if (k !== this.mapHover) { this.mapHover = k; this.mapTip(k); } cv.style.cursor = k == null ? 'default' : 'pointer'; };
    cv.onmouseleave = () => { this.mapHover = null; this.mapTip(null); };
    cv.onclick = e => { const k = hit(e); if (k == null) { if (TOUCH) this.mapTip(null); return; } this.mapSel = k; this.mapInfo(); this.audio.ui(); if (TOUCH) this.mapTip(k); };
  },
  mapTip(i) {
    const tip = $('map-tip'); if (i == null) { tip.classList.remove('show'); return; }
    const cur = this.mapCur, open = this.shibaFound.size >= SHIBAS_TOTAL, ic = iconURL('shiba');
    let h;
    if (i === MISSIONS) {
      h = `<h4>Le Paradis des Shibas</h4><span class="st lock">${open ? 'Débloqué' : 'Verrouillé'}</span><dl><dt>Accès</dt><dd>${open ? 'S\'ouvre après la victoire finale' : `Trouver les ${SHIBAS_TOTAL} shibas cachés`}</dd><dt>Shibas</dt><dd><b class="${open ? 'ok' : 'wait'}">${this.shibaFound.size} / ${SHIBAS_TOTAL}</b></dd><dt>Menace</dt><dd>${open ? 'Le Shibanophile, le zombie qui déteste les shibas' : '???'}</dd><dt>À protéger</dt><dd>${open ? '9 shibas du paradis' : '???'}</dd></dl>`;
    } else {
      const st = i < cur ? ['done', 'Terminée'] : i === cur ? ['cur', 'Mission en cours'] : ['todo', 'À venir'];
      let shib = ''; for (let k = 0; k < SHIBAS_PER; k++) shib += `<img src="${ic}" class="${this.shibaFound.has(i + '-' + k) ? '' : 'off'}" alt="">`;
      const n = [...this.shibaFound].filter(id => id.startsWith(i + '-')).length, svs = this.run.sv || [], si = MISSION_SURV[i];
      let sv;
      if (si < 0) sv = '<span class="ko">Aucun signalé</span>';
      else { const d = SURVIVORS[si], v = svs[i], e = d.f ? 'e' : ''; sv = `${d.name}, ${d.who} · ` + (v === 2 ? `<span class="ok">Sauvé${e}</span>` : v === 3 ? `<span class="ko">Perdu${e}</span>` : i < cur ? `<span class="ko">Non secouru${e}</span>` : '<span class="wait">À secourir</span>'); }
      const rep = this.mapReports && this.mapReports[i];
      h = `<h4>${i + 1} · ${MISSION_NAMES[i]}</h4><span class="st ${st[0]}">${st[1]}</span><dl><dt>Objectif</dt><dd>${MAP_INFO[i].obj}</dd><dt>Survivant</dt><dd>${sv}</dd><dt>Shibas</dt><dd><span class="sh">${shib}</span>${n}/${SHIBAS_PER}</dd><dt>Menace</dt><dd>${MAP_INFO[i].threat}</dd>${rep ? `<dt>Bilan</dt><dd>${fmt(rep.score)} pts · ${fmt(rep.kills)} zombies</dd>` : ''}</dl>`;
    }
    tip.innerHTML = h;
    const n = MAP_NODES[i], cv = $('map-cv'), fw = cv.clientWidth, fh = cv.clientHeight, sc = Math.min(fw / 1000, fh / 560), nx = (fw - 1000 * sc) / 2 + n.x * sc, ny = (fh - 560 * sc) / 2 + n.y * sc;
    tip.style.left = nx > fw * 0.55 ? '' : `${nx + 36}px`; tip.style.right = nx > fw * 0.55 ? `${fw - nx + 36}px` : '';
    tip.style.top = ny > fh * 0.55 ? '' : `${Math.max(6, ny - fh * 0.08)}px`; tip.style.bottom = ny > fh * 0.55 ? `${Math.max(6, fh - ny - fh * 0.08)}px` : '';
    tip.classList.remove('show'); void tip.offsetWidth; tip.classList.add('show');
  },
  mapInfo() {
    const i = this.mapSel, cur = this.mapCur, found = z => [...this.shibaFound].filter(id => id.startsWith(z + '-')).length;
    $('map-info').textContent = i === MISSIONS
      ? (this.shibaFound.size >= SHIBAS_TOTAL ? 'Le Paradis des Shibas · débloqué : il t\'attend après l\'hôpital.' : `Le Paradis des Shibas · niveau secret verrouillé. Trouve les ${SHIBAS_TOTAL} shibas (${this.shibaFound.size} pour l'instant).`)
      : `Mission ${i + 1} · ${MISSION_NAMES[i]} · ${i < cur ? 'terminée' : i === cur ? 'mission en cours' : 'à venir'} · shibas ${found(i)}/${SHIBAS_PER}`;
  },
  mapContinue() { if (this.state !== 'map') return; const f = this.mapGo; this.mapGo = null; this.state = 'playing'; this.showScreen(null); this.input.mdown = false; if (f) f(); },
  seedZone(k) {
    const n = Math.round(ZCFG[k].seed * this.diff.pop), Z = ZONES[k], p = this.player;
    for (let i = 0; i < n; i++) for (let t = 0; t < 10; t++) {
      const x = rand(Z.x0 + 200, Z.x1 - 60), y = rand(ST + 40, SB - 40);
      if (Math.hypot(x - p.x, y - p.y) < 500 || this.level.pointObstacle(x, y)) continue;
      const z = new Zombie(this, this.director.pickType(ZCFG[k].w), x, y, null); z.aggro = false; this.zombies.push(z); break;
    }
  },
  // ---------- lot 1 : compagnon, ralenti, événements
  adoptBuddy(x, y) {
    const had = !!this.buddy; this.buddy = { x, y, vx: 0, vy: 0, r: 9, biteCd: 0, barkCd: 2, hop: 0 };
    if (!had) this.toast('Un shiba te suit : il aboie quand un zombie approche et mord les plus proches', '#ffb46a');
  },
  updateBuddy(dt) {
    const b = this.buddy, p = this.player; if (!b || p.dead) return;
    b.biteCd -= dt; b.barkCd -= dt;
    let near = null, nd = 1e9; for (const z of this.hash.query(b.x, b.y, 340, this._q)) { if (z.dead || z.spawnT > 0 || z.type === 'boss') continue; const d = dist2(z.x, z.y, b.x, b.y); if (d < nd) { nd = d; near = z; } }
    nd = Math.sqrt(nd);
    let tx = p.x - Math.cos(p.aim) * 38, ty = p.y + 14;
    if (near && nd < 150 && dist2(near.x, near.y, p.x, p.y) < 260 * 260) { tx = near.x; ty = near.y; }
    if (dist2(b.x, b.y, p.x, p.y) > 640 * 640) { b.x = p.x - 30; b.y = p.y + 10; }
    const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1, sp = d > 40 ? Math.min(300, d * 4) : 0;
    b.vx = dx / d * sp; b.vy = dy / d * sp; b.x += b.vx * dt; b.y += b.vy * dt; if (sp) b.face = dx >= 0 ? 1 : -1; this.collideWorld(b);
    b.hop = sp > 0 ? Math.abs(Math.sin(this.time * 14)) * 3 : 0;
    if (near && nd < near.r + 22 && b.biteCd <= 0) { b.biteCd = 0.9; near.damage(16 * (1 + this.diff.dmg * 0.2), near.x - b.x, near.y - b.y, 'bite'); this.audio.bark(b.x, b.y); this.floatText(b.x, b.y - 26, 'GRRR', '#ff9a5a'); }
    else if (near && nd < 340 && b.barkCd <= 0) { b.barkCd = 5; this.audio.bark(b.x, b.y, true); this.floatText(b.x, b.y - 28, 'WAF !', '#ffd27a'); near.spotted = 2.5; }
  },
  startEvent(k) {
    if (this.mode !== 'story' || this.activeZone !== k || this.event) return;
    const id = pick(['blackout', 'fog', 'ash', 'icecream']), Z = ZONES[k];
    const ev = this.event = { id, t: 26, max: 26, zone: k };
    if (id === 'icecream') { ev.x = Z.x0 + 80; ev.y = 600 + rand(-120, 120); ev.note = 0; ev.nt = 0; }
    const B = { blackout: ['Coupure de courant', 'Il ne reste que ta lampe'], fog: ['Brouillard épais', 'Tu ne vois plus très loin'], ash: ['Pluie de cendres', 'Le ciel brûle encore'], icecream: ['Le camion de glaces zombie', 'Sa musique attire la horde : profites-en'] }[id];
    this.banner(B[0], B[1]); this.audio.siren();
  },
  updateEvent(dt) {
    const e = this.event; if (!e) return;
    if (this.activeZone !== e.zone) { this.event = null; return; }
    e.t -= dt;
    if (e.id === 'icecream') {
      const Z = ZONES[e.zone]; e.x = Math.min(Z.x1 - 80, e.x + 70 * dt);
      if ((e.nt -= dt) <= 0) { const mel = [523, 659, 784, 659, 698, 587, 523, 392]; e.nt = 0.32; const v = this.audio.at ? this.audio.at(e.x, e.y).v : 0.5; if (this.audio.ctx && v > 0.02) this.audio.tone({ f: mel[e.note++ % mel.length], dur: 0.25, type: 'square', g: 0.05 * v }); }
    }
    if (e.t <= 0) { this.toast({ blackout: 'Le courant revient', fog: 'Le brouillard se lève', ash: 'Les cendres retombent', icecream: 'Le camion de glaces s\'éloigne' }[e.id], '#c6c0b2'); this.event = null; }
  },
  onPlayerDeath() {
    const p = this.player; if (p.dead) return;
    if (this.p2 && !this.p2.dead) {
      p.dead = true; p.hp = 0; p.carry = null; this.p1Down = 1; p.downX = p.x; p.downY = p.y; p.revT = 0; this.audio.death(); this.bleed(p.x, p.y, 0, 0, 20); this.toast(`${this.pName(p)} est à terre`, '#e2792f');
      return;
    }
    p.dead = true; p.hp = 0; this.lives--; this.stats.deaths++; this.mult = 1; this.deathT = 3.4; this.deathLine = this.pickDeathLine(); this.deathSay = pick(DEATH_SAY[this.charKey] || DEATH_SAY.pedro); this.bannerObj = null; this.notices = []; this.audio.death(); this.later(0.25, () => this.audio.heartbeat && this.audio.heartbeat()); this.audio.flame(false); this.shake(0.6);
    this.bleed(p.x, p.y, 0, 0, 24); this.splat(p.x, p.y, 26);
  },
  onObjectivePickup(pk, by) {
    if (pk.kind === 'key') {
      this.level.obj[0].done = true; this.director.queue += Math.round(34 * this.diff.pop); this.completeZone(0); this.later(4, () => this.spawnMiniBoss(0));
      this.banner('La horde arrive', 'La grille Est est ouverte : cours'); this.audio.siren();
    } else if (pk.kind === 'fuel') {
      const o = this.level.obj[2]; o.picked = true; (by || this.player).carry = 'fuel'; this.director.queue += Math.round(44 * this.diff.pop); this.later(3, () => this.spawnMiniBoss(2));
      this.notice('Jerrican récupéré', 'Vers le groupe électrogène', '#f0b25a'); this.audio.siren(); this.later(1.5, () => this.quip('fuel'));
    }
  },
  completeZone(k) {
    if (k < 3) this.level.setGate(ZONES[k].x1, false);
    this.score += Math.round(2500 * this.diff.score); this.audio.objective();
    if (k !== 0) this.notice('Grille ouverte', 'Cap sur le point de sauvegarde', '#9fd6e6');
  },
  enterZone(k) {
    if (this.missionFor !== k) { this.missionFor = k; this.missionStart = this.snapStats(); }
    this.zoneEntered[k] = true; this.activeZone = k; this.zoneHit = false; if (k > 0) this.level.setGate(ZONES[k].x0, true);
    this.banner(ZONES[k].sub, ZONES[k].name); this.seedZone(k); this.director.reset();
    this.audio.setTheme(['gare', 'boulevard', 'parking', 'mairie'][k]);
    if (this.mode === 'story' && k >= 1 && Math.random() < 0.6) this.later(rand(18, 35), () => this.startEvent(k));
    if (k === 3) this.later(1.8, () => { if (this.activeZone === 3 && !this.level.obj[3].spawned) this.spawnBoss(); });
  },
  enterSafe(s) {
    this.event = null; this.newManche('la fin de l\'acte');
    if (this.bossRef && this.bossRef.mini) this.bossRef = null;
    if (this.mode === 'story') { const st = this.missionStart || { kills: 0 }; const xp = this.gainXP(150 + (this.kills - (st.kills || 0)) * 2 + (this.cleared && this.cleared[s] ? 120 : 0)); this.later(1.8, () => this.toast(`+${xp} XP · mission ${s + 1} terminée`, '#9fd6e6')); }
    if (this.mode === 'story' && !this.zoneHit && this.activeZone === s) this.unlock('scratch');
    this.timers = []; this.fires = []; this.throwables = []; this.mines = []; this.flames = []; this.rockets = []; this.bullets = [];
    for (const c of this.level.cars) { if (c.snd) this.audio.alarmStop(c); c.alarm = 0; c.burning = 0; }
    this.safeEntered[s] = true; this.activeZone = -1; this.level.setGate(SAFES[s].x0, true); this.safeName = SAFES[s].name;
    for (const o of this.level.obstacles) if (o.snd) this.audio.alarmStop(o);
    this.zombies = []; this.acids = []; this.puddles = []; this.shockwaves = []; this.director.queue = 0;
    const p = this.player; p.hp = p.maxHp; p.carry = null; p.battery = 100;
    if (this.p2) { const q = this.p2; q.dead = false; q.hp = q.maxHp; q.battery = 100; q.x = p.x - 30; q.y = p.y + 20; }
    for (const sv of this.survivors) {
      if (sv.dead || sv.state !== 'follow') continue;
      sv.dead = true;
      if (dist2(sv.x, sv.y, p.x, p.y) < 320 * 320) {
        const pts = Math.round(3000 * this.diff.score); this.score += pts; p.money += 200; this.run.saved++; if (this.run.sv) this.run.sv[sv.zone] = 2;
        this.later(1.2, () => { this.notice(`${sv.name} est sauvé${sv.f ? 'e' : ''}`, `+${fmt(pts)} · +$200`); this.toast(`${sv.name} : « ${sv.line} »`, '#7fd18b'); });
        if (this.run.saved >= 3) this.unlock('samaritan');
      } else { if (this.run.sv) this.run.sv[sv.zone] = 3; this.later(1.2, () => this.toast(`${sv.name} est resté${sv.f ? 'e' : ''} dehors`, '#a39e93')); }
    }
    this.checkpoint = this.makeCheckpoint(SAFES[s].x0 + 200, 600); this.checkpoint.safe = s;
    this.notice('Sauvegardé', SAFES[s].name);
    if (this.endless) { this.later(0.8, () => this.openMutations()); return; }
    const report = this.missionReport(s); writeSave(this, s);
    this.missionWin(s, () => this.comic.show(['act2', 'act3', 'act4'][s], () => this.showMap({ current: s + 1, report })));
  },
  pickDeathLine() {
    let i; do i = Math.floor(Math.random() * DEATH_LINES.length); while (i === this._lastDeath && DEATH_LINES.length > 1); this._lastDeath = i;
    const f = CHARS[this.charKey].fallen.endsWith('TOMBÉE'); return DEATH_LINES[i].replace(/\{e\}/g, f ? 'E' : '');
  },
  // fin de mission : un grand « SECTEUR NETTOYÉ » rongé, au ralenti, avant la BD
  missionWin(k, then) {
    const r = this.missionReport(k), sub = `${MISSION_NAMES[k]} · ${fmt(r.kills)} zombies abattus · ${fmtTime(r.time)}`;
    this.winFx = { t: 0, title: k === 4 ? 'HÔPITAL NETTOYÉ' : 'SECTEUR NETTOYÉ', sub, then }; /* « then » part après 2,8 s de temps réel (le monde, lui, est au ralenti) */ this.netEmit(['win', this.winFx.title, sub]);
    this.bannerObj = null; this.notices = []; this.audio.objective(); this.later(0.15, () => this.shake(0.35));
  },
  // la campagne continue à l'hôpital (mission 5)
  isCampaign() { return this.mode === 'story' || (this.mode === 'hospital' && !!this.hcamp); },
  // l'hélicoptère de la Mairie : fin de la mission 4, cap sur l'hôpital
  toHospital() {
    this.event = null; this.newManche('la fin de l\'acte');
    const st = this.missionStart || { kills: 0 }, xp = this.gainXP(150 + (this.kills - (st.kills || 0)) * 2 + (this.cleared && this.cleared[3] ? 120 : 0)); this.later(1.8, () => this.toast(`+${xp} XP · mission 4 terminée`, '#9fd6e6'));
    if (!this.zoneHit && this.activeZone === 3) this.unlock('scratch');
    for (const o of this.level.obstacles) if (o.snd) this.audio.alarmStop(o);
    const p = this.player; p.hp = p.maxHp; p.battery = 100; this.activeZone = -1;
    this.checkpoint = this.makeCheckpoint(150, 600); this.checkpoint.safe = SAFES.length;
    const report = this.missionReport(3); writeSave(this, SAFES.length);
    this.missionWin(3, () => this.comic.show('act5', () => this.showMap({ current: 4, report, onGo: () => this.newHospitalMission() })));
  },
  // le Chirurgien est tombé : l'équipe s'envole du toit de l'hôpital
  finishCampaign() {
    const p = this.player;
    for (const sv of this.survivors) {
      if (sv.dead || sv.state !== 'follow') continue;
      sv.dead = true; const pts = Math.round(3000 * this.diff.score); this.score += pts; p.money += 200; this.run.saved++; this.run.sv[sv.zone] = 2;
      this.notice(`${sv.name} est sauvé${sv.f ? 'e' : ''}`, `+${fmt(pts)} · +$200`); this.toast(`${sv.name} : « ${sv.line} »`, '#7fd18b'); if (this.run.saved >= 3) this.unlock('samaritan');
    }
    const xp = this.gainXP(200 + (this.kills - ((this.missionStart || {}).kills || 0)) * 2); this.toast(`+${xp} XP · mission 5 terminée`, '#9fd6e6');
    this.unlock(WIN_ACH[this.charKey]); if (this.diffKey === 'cauchemar') this.unlock('nightmare');
    Settings.survival = true; clearSave(); if (this.shibaFound.size >= SHIBAS_TOTAL) Settings.paradise = true; Settings.save(); refreshSurvivalBtn();
    this.later(0.8, () => this.missionWin(4, () => { if (this.state === 'playing') this.comic.show('epilogue', () => this.showEnd(true)); }));
  },
  respawn() {
    const cp = this.checkpoint, kz = this.activeZone;
    if (cp.shibas) this.shibaFound = new Set(cp.shibas);
    for (const o of this.level.obstacles) if (o.snd) this.audio.alarmStop(o);
    for (const h of this.hazards || []) if (h.ob) this.level.removeObstacle(h.ob);
    for (const k of ['zombies', 'bullets', 'flames', 'rockets', 'throwables', 'mines', 'acids', 'puddles', 'fires', 'shockwaves', 'beams', 'timers', 'attractions', 'hazards']) this[k] = []; this.blackoutT = 0;
    this.director.reset();
    if (kz >= 0) {
      this.level.resetZone(kz); this.zoneEntered[kz] = false; this.bossRef = null;
      if (kz > 0) this.level.setGate(ZONES[kz].x0, false);
      if (kz < 3) this.level.setGate(ZONES[kz].x1, true); else this.level.setGate(EXIT.x0, true);
    }
    const p = new Player(this, cp.x, cp.y);
    p.money = cp.money; p.armor = cp.armor; p.grenades = cp.grenades; p.mines = cp.mines; p.decoys = cp.decoys; p.cur = cp.cur;
    p.weapons.forEach((w, i) => w.restore(cp.weapons[i])); p.inv = 2; this.player = p;
    this.p1Down = 0; this.reviveUsed = false; if (this.p2) { const q = this.p2; q.dead = false; q.hp = q.maxHp; q.x = cp.x - 30; q.y = cp.y + 20; q.inv = 2; q.downX = q.downY = null; q.revT = 0; }
    this.score = cp.score || 0; this.kills = cp.kills || 0;
    this.mult = 1; this.activeZone = -1; this.cam.x = p.x; this.cam.y = p.y;
    this.banner('Retour au point de sauvegarde', `${this.lives} vie${this.lives > 1 ? 's' : ''} restante${this.lives > 1 ? 's' : ''}`);
  },
  tryInteract(by) {
    const p = by || this.player;
    { const t = this.trapNear(p); if (t) { this.useTrap(t, p); return true; } }
    for (const o of this.level.obstacles) {
      if (o.kind === 'shop' && rectDist(p.x, p.y, o) < 46) { if (this.net && p.isP2) { this.toast('Le marché noir est réservé à l\'hôte en duo en ligne', '#8b867b'); return true; } this.shop.open(); return true; }
      if (o.kind === 'machine' && rectDist(p.x, p.y, o) < 34) {
        if (o.broken || o.charges <= 0) { this.toast('Distributeur vide', '#8b867b'); return true; }
        if (p.hp >= p.maxHp) { this.toast('Santé déjà au maximum', '#8b867b'); return true; }
        const h = Math.round(40 * p.healMul); o.charges--; p.hp = Math.min(p.maxHp, p.hp + h); this.audio.pickup(); this.toast(`+${h} santé · ${o.charges} trousse${o.charges > 1 ? 's' : ''} restante${o.charges > 1 ? 's' : ''}`, '#7fd18b'); return true;
      }
    }
    return false;
  },
  showEnd(victory) {
    if (this.net === 'host') Net.send({ t: 'end', sc: Math.floor(this.score), ki: this.kills, wv: this.surv ? this.surv.wave : 0, rt: Math.floor(this.runTime), vi: victory === true ? 1 : 0 }, true);
    this.state = 'end'; this.audio.flame(false);
    for (const o of this.level.obstacles) if (o.snd) this.audio.alarmStop(o);
    const secret = victory === 'secret' || this.mode === 'secret', hosp = this.mode === 'hospital' && !this.hcamp, camp = this.isCampaign();
    let bonus = 0; if (victory) { bonus = Math.round((10000 + this.lives * 4000) * this.diff.score); this.score += bonus; }
    this.lastVictory = victory; const surv = this.mode === 'survival', wave = surv ? this.surv.wave : 0; $('btn-again').textContent = this.netGuest ? 'En attente de l\'hôte…' : 'Rejouer';
    $('end-eyebrow').textContent = secret ? 'Rapport final · Le Paradis des Shibas' : surv ? 'Rapport de survie · Place de la Mairie' : victory ? 'Rapport d\'évacuation · Hôpital Saint-Lazare' : 'Rapport de fin de nuit';
    $('end-title').textContent = secret ? (victory ? 'Paradis sauvé' : 'Le paradis est tombé') : surv ? 'Fin de la survie' : victory ? 'Évacué' : 'Fin de la nuit';
    $('end-stamp').textContent = secret ? (victory ? 'Ami des shibas' : 'Porté disparu') : surv ? `Vague ${wave}` : victory ? 'Survivant' : 'Porté disparu';
    $('btn-paradise').hidden = !(camp && victory && this.shibaFound.size >= SHIBAS_TOTAL);
    $('end-stamp').style.color = $('end-stamp').style.borderColor = victory ? '#7fd18b' : '';
    if (hosp) { $('end-eyebrow').textContent = 'Rapport médical · Hôpital Saint-Lazare'; $('end-title').textContent = victory ? 'Le Chirurgien est tombé' : 'Admis aux urgences'; $('end-stamp').textContent = victory ? 'Sorti guéri' : 'Porté disparu'; }
    $('btn-survival').hidden = !(victory || surv) || hosp; $('end-credits').hidden = !victory || hosp; if (victory && !hosp) fillCreditsOnce($('end-credits')); $('btn-survival').textContent = surv ? 'Relancer la Survie' : 'Mode Survie';
    const stats = [['Personnage', CHARS[this.charKey].name], ['Score', fmt(this.score)], ['Zombies abattus', fmt(this.kills)], ['Multiplicateur max', '×' + this.maxMult.toFixed(1)], ['Temps', fmtTime(this.runTime)], ['Difficulté', this.diff.name]];
    if (bonus) stats.splice(1, 0, ['Bonus évacuation', '+' + fmt(bonus)]);
    if (surv) stats.splice(1, 0, ['Vagues tenues', String(Math.max(0, wave - 1))]);
    if (!surv && !secret) stats.push(['Survivants sauvés', String(this.run.saved)]);
    const st = this.stats; stats.push(['Dégâts infligés', fmt(Math.round(st.dmg))], ['Tirs', fmt(st.shots)], ['Précision', st.shots ? Math.round(100 * st.hits / st.shots) + ' %' : '–'], ['Morts', String(st.deaths)]);
    if (camp) stats.push(['Shibas trouvés', `${this.shibaFound.size} / ${SHIBAS_TOTAL}`]);
    if (this.achCards.length) { stats.push(['Succès débloqués', this.achCards.map(a => a.name).join(' · ')]); this.achCards = []; }
    { const mode = this.dailyMod ? (this.dailyMod.week ? 'weekly' : 'daily') : camp ? 'story' : this.mode; Settings.lastRun = { char: this.charKey, mode, win: !!victory, kills: this.kills, score: Math.floor(this.score), zone: Math.max(0, this.missionFor == null ? this.activeZone : this.missionFor), wave, shibas: this.shibaFound.size, diff: this.diffKey, mod: this.dailyMod ? this.dailyMod.name : '', date: Date.now() };
      Settings.bestKills = Math.max(Settings.bestKills || 0, this.kills);
      if (this.mode !== 'training') for (const q of this.players()) { const cs = cstat(q.char); cs.games++; if (victory) cs.wins++; cs.kills += this.kills; cs.best = Math.max(cs.best, Math.floor(this.score)); cs.time += Math.floor(this.runTime || 0); }
      { this.levelUps = 0; const xp = this.gainXP(this.kills * 2 + this.score / 250 + (victory ? 600 : 0) + this.shibaFound.size * 40), L = levelInfo(Settings.xp); stats.push(['Expérience', `+${fmt(xp)} XP · niveau ${L.lv}${this.levelUps ? ' (niveau supérieur !)' : ''}`]); }
      if (this.dailyMod && !this.dailyMod.week && this.score > dailyBest()) { Settings.daily = { d: dayKey(), best: Math.floor(this.score) }; stats.unshift(['Nouveau record du jour', fmt(this.score)]); }
      if (this.dailyMod && this.dailyMod.week && this.score > weeklyBest()) { Settings.weekly = { w: weekKey(), best: Math.floor(this.score) }; stats.unshift(['Nouveau record de la semaine', fmt(this.score)]); }
      Settings.save(); }
    if (this.endless) { $('end-eyebrow').textContent = 'Nuit sans fin'; $('end-title').textContent = `Tombé pendant la nuit ${this.endless.night}`; $('end-stamp').textContent = `Nuit ${this.endless.night}`; stats.unshift(['Nuits survécues', String(this.endless.night - 1)], ['Mutations', String(Object.values(this.endless.m).reduce((a, b) => a + b, 0))]); }
    if (this.dailyMod) { $('end-eyebrow').textContent = `${this.dailyMod.week ? 'Défi de la semaine' : 'Défi du jour'} · ${this.dailyMod.name}`; $('end-title').textContent = 'Défi terminé'; $('end-stamp').textContent = `Vague ${wave}`; }
    $('end-stats').innerHTML = stats.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
    { const h = newBeastsHTML(this.takeActBeasts()); $('end-beasts').innerHTML = h; $('end-beasts').hidden = !h; if (h) drawBestiary(); }
    $('end-name').value = Settings.name || 'Survivant'; $('btn-save').disabled = false; $('end-namebox').hidden = false;
    $('end-scores').innerHTML = scoreTable(Scores.list());
    this.showScreen('scr-end'); $('end-name').focus(); $('end-name').select();
  },
  saveScore() {
    if (this.savedScore) return; this.savedScore = true;
    const name = ($('end-name').value || 'Survivant').trim().slice(0, 16) || 'Survivant'; Settings.name = name; Settings.save();
    const entry = { name, char: CHARS[this.charKey].name, score: Math.floor(this.score), diff: (this.endless ? `Nuit sans fin ${this.endless.night} · ` : this.dailyMod ? (this.dailyMod.week ? 'Semaine · ' : 'Défi · ') : this.mode === 'survival' ? 'Survie · ' : this.mode === 'secret' ? 'Paradis · ' : this.mode === 'hospital' && !this.hcamp ? 'Hôpital · ' : '') + this.diff.name, kills: this.kills, time: Math.floor(this.runTime), win: !!this.lastVictory, wave: this.mode === 'survival' ? this.surv.wave : 0, date: Date.now() };
    const top = Scores.add(entry); $('end-scores').innerHTML = scoreTable(top, entry.date); $('btn-save').disabled = true; $('btn-again').focus();
    { const best = top.find(r => nameKey(r.name) === nameKey(name)); if (best && best.date !== entry.date && best.score >= entry.score) this.toast(`Ton record tient toujours : ${fmt(Math.floor(best.score))} pts`, '#f0b25a'); }
    if (Online.on() && this.mode !== 'training') { entry.mode = this.endless ? 'endless' : this.dailyMod ? (this.dailyMod.week ? weekMode() : 'daily') : this.coop ? 'coop' : this.mode; Online.send(entry).then(ok => this.toast(ok ? 'Score envoyé au classement en ligne' : 'Hors ligne : score envoyé à la prochaine connexion', ok ? '#7fd18b' : '#8b867b')); }
  },
  // près d'une boutique ou d'un distributeur : le bouton E indique l'action possible
  nearInteract() { const p = this.player; if (!p || p.dead || !this.level) return null; for (const o of this.level.obstacles) { if (o.kind === 'shop' && rectDist(p.x, p.y, o) < 46) return 'BOUTIQUE'; if (o.kind === 'machine' && rectDist(p.x, p.y, o) < 34 && !o.broken && o.charges > 0) return 'SOINS'; } { const t = this.trapNear(p); if (t && t.cd <= 0) return t.kind === 'fence' ? 'COURANT' : 'EAU'; } return null; },
  updateObjectives(dt) {
    const k = this.activeZone; if (k < 0) return; const o = this.level.obj[k], p = this.player;
    const alive = this.players().filter(q => !q.dead), near = (r) => alive.some(q => dist2(q.x, q.y, o.x, o.y) < r * r);
    if (o.type === 'defend' && !o.done && alive.length) {
      const inside = near(o.r);
      if (inside && !o.started) { o.started = true; this.later(8, () => this.spawnMiniBoss(1)); this.banner('Émetteur radio activé', `Tiens la position ${o.time} secondes`); this.audio.siren(); this.director.queue += 8; for (const [kd, dx, dy] of [['med', -70, 40], ['ammo', 70, 40], ['grenade', 0, -70]]) { const pk = new Pickup(this, kd, o.x + dx, o.y + dy, 0); pk.zone = 1; pk.life = Infinity; pk.vx = pk.vy = 0; this.pickups.push(pk); } this.toast('Ravitaillement largué près de la radio', '#7fd18b'); }
      if (o.started) { if (inside) o.t += dt; else if (near(o.r * 1.8)) o.t += dt * 0.4; if (o.t >= o.time) { o.done = true; this.completeZone(1); this.toast('Signal envoyé. L\'hélicoptère attendra place de la Mairie.', '#7fd18b'); } }
    }
    const carrier = o.type === 'carry' && alive.find(q => q.carry && dist2(q.x, q.y, o.gx, o.gy) < 95 * 95);
    if (o.type === 'carry' && o.picked && !o.done && carrier) {
      o.done = true; for (const q of this.players()) q.carry = null; this.audio.generator();
      for (const l of this.level.lamps) if (l.grid) { l.on = true; l.flick = false; }
      const gen = this.level.obstacles.find(x => x.kind === 'generator'); if (gen) gen.on = true;
      this.completeZone(2); this.toast('Courant rétabli : les lampadaires du parking se rallument', '#f0b25a');
    }
  },
  // ---------- objectif courant (texte et cible)
  objective() {
    if (this.netGuest) return this.netG.objv;
    const ob = this.objectiveBase(), k = this.activeZone;
    if (this.mode === 'story' && k >= 0 && this.level.obj[k] && (k < 3 ? this.level.obj[k].done : this.level.obj[k].dead) && !(this.cleared && this.cleared[k])) { const n = this.zombies.filter(z => !z.dead).length + Math.max(0, this.director.queue); if (n > 0) ob.text += ` · Optionnel : nettoie le secteur (${n} restant${n > 1 ? 's' : ''})`; }
    return ob;
  },
  objectiveBase() {
    const k = this.activeZone, p = this.player;
    if (k < 0) {
      if (p.x > SAFES[0].x0 && this.safeEntered.some(Boolean)) return { text: `Point de sauvegarde · [${KL('melee')}] au comptoir pour le marché noir · la route continue à l'est`, tx: null };
      return { text: '', tx: null };
    }
    const o = this.level.obj[k];
    if (this.mode === 'secret') { const b = this.bossRef; return { text: b && !b.dead ? 'Le Paradis des Shibas · abats le Shibanophile' : 'Le Paradis des Shibas · le Shibanophile approche…', tx: null }; }
    if (this.mode === 'hospital') { if (o.dead) return { text: 'Le Chirurgien est tombé · l\'hôpital se tait', tx: null }; if (o.spawned) return { text: 'Morgue · abats le Chirurgien', tx: null }; return { text: 'Hôpital Saint-Lazare · rejoins la morgue au fond du couloir', tx: HOSP.morgue + 200, ty: 600 }; }
    if (this.mode === 'training') return this.trainObjective();
    if (this.mode === 'survival') { const sv = this.surv; return { text: sv.state === 'break' ? `Survie · vague ${sv.wave + 1} dans ${Math.ceil(sv.t)} s · ramasse les munitions au centre` : `Survie · vague ${sv.wave} · encore ${this.director.queue + this.zombies.length} zombies`, tx: null }; }
    if (k === 0) return o.done ? { text: 'Rejoins la grille Est, elle est ouverte', tx: ZONES[0].x1, ty: 600 } : { text: 'Trouve la pince coupe-boulons pour ouvrir la grille Est', tx: o.x, ty: o.y };
    if (k === 1) { if (o.done) return { text: 'Rejoins la grille Est, elle est ouverte', tx: ZONES[1].x1, ty: 600 }; if (o.started) return { text: `Défends l'émetteur radio · reste dans le cercle · ${Math.ceil(o.time - o.t)} s`, tx: o.x, ty: o.y, progress: o.t / o.time }; return { text: 'Rejoins l\'émetteur radio au centre du boulevard', tx: o.x, ty: o.y }; }
    if (k === 2) { if (o.done) return { text: 'Rejoins la grille Est, elle est ouverte', tx: ZONES[2].x1, ty: 600 }; if (o.picked) return { text: 'Apporte l\'essence au groupe électrogène', tx: o.gx, ty: o.gy }; return { text: 'Trouve un jerrican d\'essence dans le parking', tx: o.ix, ty: o.iy }; }
    if (k === 3) { if (o.dead) return { text: 'Rejoins l\'hélicoptère d\'évacuation', tx: HELI, ty: 600 }; return { text: 'Abats l\'Abomination · fais-la charger contre un obstacle pour l\'étourdir', tx: null }; }
    return { text: '', tx: null };
  }
});
