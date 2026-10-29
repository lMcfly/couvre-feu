// ============================================================ rendu : monde et lumières
mixin(Game, {
  drawScreenFx(c) {
    if (this.p2 && this.state === 'playing') { const q = this.p2, s0 = this.worldToScreen(q.x, q.y), x = s0.x * DPR, y = (s0.y - 52) * DPR, w = 44 * DPR; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(x - w / 2, y, w, 6 * DPR); c.fillStyle = q.dead ? '#555' : '#5fb8ff'; c.fillRect(x - w / 2, y, w * Math.max(0, q.hp) / q.maxHp, 6 * DPR); c.font = `${Math.round(11 * DPR)}px ${FD}`; c.textAlign = 'center'; c.fillStyle = '#9fd6e6'; c.fillText(this.net && Net.peer ? Net.peer.name : 'J2', x, y - 3 * DPR); }
    if (this.flashFx > 0) { c.fillStyle = `rgba(255,250,230,${this.flashFx * (Settings.calm ? 0.35 : 1.6)})`; c.fillRect(0, 0, W, H); }
    const e = this.event, p = this.player;
    if (e && this.state === 'playing') {
      const fade = Math.min(1, (e.max - e.t) / 2, e.t / 2);
      if (e.id === 'fog') { const s = this.worldToScreen(p.x, p.y), x = s.x * DPR, y = s.y * DPR, r0 = 140 * VS * DPR; const g = c.createRadialGradient(x, y, r0, x, y, r0 * 3.2); g.addColorStop(0, 'rgba(80,82,92,0)'); g.addColorStop(1, `rgba(80,82,92,${0.9 * fade})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
      if (e.id === 'ash') { c.fillStyle = `rgba(200,190,180,${0.6 * fade})`; const t = this.time; for (let i = 0; i < 140; i++) { const x = ((i * 137.5 + t * (18 + (i % 5) * 6)) % (W + 40)) - 20, y = ((i * 71.3 + t * (40 + (i % 7) * 9)) % (H + 40)) - 20; c.fillRect(x, y, 2 * DPR, 2 * DPR); } c.fillStyle = `rgba(120,60,30,${0.12 * fade})`; c.fillRect(0, 0, W, H); }
    }
    if (this.slowT > 0) {
      const k = Math.min(1, (this.slowMax - this.slowT) * 5, this.slowT * 3), bh = H * 0.09 * k;
      drawFinisher(c, this, k, this.time);
      c.fillStyle = '#000'; c.fillRect(0, 0, W, bh); c.fillRect(0, H - bh, W, bh);
      const D = DPR * HUDK, yb = H * 0.28; c.globalAlpha = k; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(0, yb - 46 * D, W, 72 * D); c.fillStyle = '#b0231c'; c.fillRect(W / 2 - 50 * D, yb - 46 * D, 100 * D, 3 * D);
      c.font = `${Math.round(44 * D)}px ${FD}`; c.textAlign = 'center'; c.fillStyle = '#d8d2c4'; c.fillText(this.slowLabel || '', W / 2, yb + 4 * D);
      if (this.finFx) { c.font = `${Math.round(14 * D)}px ${FT}`; c.fillStyle = '#c6c0b2'; c.fillText('Plus un seul zombie debout dans le secteur', W / 2, yb + 22 * D); } c.globalAlpha = 1;
    }
  },

  // ============================================================ rendu
  render() {
    const c = ctx, S = VS * DPR * (this.zoom || 1), p = this.player;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    const ox = W / 2 - this.cam.x * S + this.shakeX * S, oy = H / 2 - this.cam.y * S + this.shakeY * S;
    c.setTransform(S, 0, 0, S, ox, oy);
    const vx0 = this.cam.x - W / 2 / S - 40, vx1 = this.cam.x + W / 2 / S + 40, vy0 = this.cam.y - H / 2 / S - 40, vy1 = this.cam.y + H / 2 / S + 160;
    const inView = (x, y, m = 60) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m;
    this.level.ground.draw(c, vx0, Math.max(0, vy0), vx1, vy1);
    // sol : flaques d'acide, coffres, mines, objets, anneau d'objectif
    for (const pd of this.puddles) { if (!inView(pd.x, pd.y)) continue; c.globalAlpha = Math.min(1, pd.life / 1.5) * 0.55; c.fillStyle = Settings.cb ? '#2c6a9a' : '#5f9a2c'; c.beginPath(); c.ellipse(pd.x, pd.y, pd.r, pd.r * 0.6, 0, 0, TAU); c.fill(); } c.globalAlpha = 1;
    for (const m of this.mines) { c.fillStyle = '#2b2d2a'; c.beginPath(); c.ellipse(m.x, m.y, 10, 6, 0, 0, TAU); c.fill(); c.fillStyle = '#4a4d47'; c.fillRect(m.x - 4, m.y - 4, 8, 3); }
    for (const pk of this.pickups) if (inView(pk.x, pk.y)) this.drawPickup(pk);
    for (const hz of this.hazards) if (inView(hz.x, hz.y, 260)) hz.draw(c, this.time);
    for (const [d] of this.downPlayers()) { const x = d.downX != null ? d.downX : d.x, y = d.downY != null ? d.downY : d.y; if (!inView(x, y, 120)) continue; c.save(); c.translate(x, y);
      if (!this.reviveUsed) { const k = (d.revT || 0) / REVIVE_T, pu = 0.45 + Math.sin(this.time * 5) * 0.2; c.save(); c.scale(1, 0.6); c.fillStyle = `rgba(127,209,139,${0.08 + k * 0.2})`; c.beginPath(); c.arc(0, 0, REVIVE_R, 0, TAU); c.fill(); c.strokeStyle = `rgba(127,209,139,${pu})`; c.lineWidth = 3; c.setLineDash([10, 8]); c.lineDashOffset = -this.time * 30; c.beginPath(); c.arc(0, 0, REVIVE_R, 0, TAU); c.stroke(); c.setLineDash([]); if (k > 0) { c.strokeStyle = '#7fd18b'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, REVIVE_R + 7, -Math.PI / 2, -Math.PI / 2 + TAU * k); c.stroke(); } c.restore(); }
      c.fillStyle = '#5a5a60'; RR(c, -9, -30, 18, 26, 6); c.fill(); c.fillStyle = '#3a3a40'; c.fillRect(-9, -8, 18, 4); c.strokeStyle = '#2a2a2e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -25); c.lineTo(0, -12); c.moveTo(-5, -20); c.lineTo(5, -20); c.stroke();
      c.font = '12px Bangers, Impact, sans-serif'; c.textAlign = 'center'; c.fillStyle = d === this.p2 ? '#7fb8ff' : '#ff8a72'; c.fillText(this.pName(d), 0, -38); c.restore(); }
    { const bo = this.bossRef; if (bo && !bo.dead && (bo.state === 'windLeap' || bo.state === 'leap')) { const pulse = 0.5 + Math.sin(this.time * 18) * 0.25; c.strokeStyle = `rgba(${DZ()},${pulse + 0.2})`; c.lineWidth = 3; c.beginPath(); c.ellipse(bo.leapX, bo.leapY, bo.r + 70, (bo.r + 70) * 0.55, 0, 0, TAU); c.stroke(); c.fillStyle = `rgba(224,50,31,${pulse * 0.25})`; c.fill(); } }
    if (this.mode === 'secret' && this.npcShibas) for (const sh of this.npcShibas) if (!sh.caught && inView(sh.x, sh.y)) drawShibaSprite(c, sh.x, sh.y, 1.1, this.time + sh.x);
    if (this.buddy && inView(this.buddy.x, this.buddy.y)) { const b = this.buddy; c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(b.x, b.y + 2, 10, 4, 0, 0, TAU); c.fill(); drawShibaSprite(c, b.x, b.y - b.hop, 1, this.time * 1.6); }
    if (this.event && this.event.id === 'icecream' && inView(this.event.x, this.event.y, 120)) drawIceTruck(c, this.event.x, this.event.y, this.time);
    for (const s of this.level.spawners) if (s.anim > 0 && s.kind === 'sewer' && inView(s.x, s.y)) { c.fillStyle = '#55565a'; c.beginPath(); c.ellipse(s.x + 22 * s.anim, s.y - 4, 17, 9, 0.4, 0, TAU); c.fill(); }
    // tri en profondeur
    const list = [];
    for (const o of this.level.queryRect(vx0 - 100, vy0 - 40, vx1 - vx0 + 200, vy1 - vy0 + 200)) { o._sy = o.y + o.h; list.push(o); }
    for (const z of this.zombies) if (inView(z.x, z.y)) { z._sy = z.y; list.push(z); }
    for (const l of this.level.lamps) if (inView(l.x, l.y, 120)) { l._sy = l.y; l._lamp = true; list.push(l); }
    for (const ch of this.level.chests) if (inView(ch.x, ch.y)) { ch._sy = ch.y; ch._chest = true; list.push(ch); }
    for (const sv of this.survivors) if (inView(sv.x, sv.y)) { sv._sy = sv.y; list.push(sv); }
    if (!p.hidden) { p._sy = p.y; list.push(p); }
    if (this.p2 && !this.p2.dead && inView(this.p2.x, this.p2.y)) { this.p2._sy = this.p2.y; list.push(this.p2); }
    list.sort((a, b) => a._sy - b._sy);
    for (const e of list) {
      if (e === p) { if (!p.dead) this.drawPlayerVis(p); }
      else if (e === this.p2) { if (!e.dead) this.drawPlayerVis(e); }
      else if (e instanceof Zombie) this.drawZombie(e);
      else if (e._lamp) this.drawLamp(e);
      else if (e instanceof Survivor) this.drawSurvivor(e);
      else if (e._chest) this.drawChest(e);
      else {
        let fade = false;
        if (!p.hidden && !p.dead && e.z > 30 && e.kind !== 'building' && p.y < e.y + e.h && p.y > e.y - e.z - 10 && p.x > e.x - 8 && p.x < e.x + e.w + 8) fade = true;
        if (fade) c.globalAlpha = 0.42; this.drawObstacle(e); c.globalAlpha = 1;
      }
    }
    this.drawPlayerMarkers();
    for (const t of this.throwables) { c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(t.x, t.y, 5, 2.5, 0, 0, TAU); c.fill(); c.fillStyle = t.kind === 'grenade' ? '#3d4a32' : '#8a2a22'; c.beginPath(); c.arc(t.x, t.y - t.z - 4, 4.5, 0, TAU); c.fill(); }
    for (const a of this.acids) { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(a.x, a.y, 6, 3, 0, 0, TAU); c.fill(); }
    for (const pt of this.particles) if (!pt.emissive && inView(pt.x, pt.y)) this.drawParticle(pt);
    c.globalAlpha = 1;
    // pluie et brouillard (visibles là où la lumière tombe)
    if (this.fogs.length) for (const f of this.fogs) { const gr = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); gr.addColorStop(0, `rgba(160,168,178,${f.a})`); gr.addColorStop(1, 'rgba(160,168,178,0)'); c.fillStyle = gr; c.beginPath(); c.arc(f.x, f.y, f.r, 0, TAU); c.fill(); }
    if (this.rain.length && this.mode === 'secret') { c.fillStyle = 'rgba(255,170,210,.7)'; for (const d of this.rain) c.fillRect(d.x + Math.sin(d.z * 0.03) * 8, d.y - d.z * 0.5, 3, 2); }
    else if (this.rain.length) { c.strokeStyle = 'rgba(175,188,205,.45)'; c.lineWidth = 1; c.beginPath(); for (const d of this.rain) { c.moveTo(d.x, d.y - d.z); c.lineTo(d.x + 3, d.y - d.z - 16); } c.stroke(); }
    // lumière
    this.renderLights(S, ox, oy, inView);
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.drawImage(lightCanvas, 0, 0, W, H);
    // passe émissive
    c.setTransform(S, 0, 0, S, ox, oy); c.globalCompositeOperation = 'lighter';
    this.renderEmissive(inView);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    for (const t of this.texts) { c.globalAlpha = Math.min(1, t.life * 2); c.font = `15px ${FD}`; c.textAlign = 'center'; c.fillStyle = t.color; c.fillText(t.text, t.x, t.y); } c.globalAlpha = 1;
    // écran
    c.setTransform(1, 0, 0, 1, 0, 0);
    this.drawScreenFx(c);
    c.drawImage(VIG, 0, 0, W, H);
    if (this.state !== 'title') {
      const low = p.hp < 35 && !p.dead ? (0.18 + Math.sin(this.time * 6) * 0.08) * (1 - p.hp / 35) : 0, hf = Math.max(this.hurtFlash * 0.45, low);
      if (hf > 0.01) { c.globalAlpha = Math.min(1, hf); c.drawImage(VIG_RED, 0, 0, W, H); c.globalAlpha = 1; }
      this.drawHUD();
      const ck = this.cine ? Math.min(1, this.cineK || 0) : (this.cineK || 0);
      if (ck > 0.01) { const bh = Math.round(H * 0.12 * ck); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, bh); c.fillRect(0, H - bh, W, bh);
        if (this.cine) { const b = this.cine.b, u = Math.min(1, this.cine.t / 0.45), title = (b.title || '').toUpperCase(), sub = (b.cfg && b.cfg.sub) || (b.ultimate ? 'Le zombie qui déteste les shibas' : 'Elle se recolle, morceau par morceau'), fs = Math.round(Math.min(bh * 0.62, W / 14));
          c.save(); c.translate(W * 0.5 + (1 - u) * W * 0.6, bh * 0.56); c.rotate(-0.025); c.font = `${fs}px Bangers, Impact, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = fs * 0.16; c.strokeStyle = INK; c.strokeText(title, 0, 0); c.fillStyle = b.phase >= 2 ? '#ff6a45' : '#ffd23a'; c.fillText(title, 0, 0); c.restore();
          c.save(); c.globalAlpha = ck * u; c.font = `italic ${Math.round(fs * 0.42)}px ${FT}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#d8d2c4'; c.fillText('« ' + sub + ' »', 24 * DPR, H - bh / 2); c.restore(); }
        if (this.cine && this.cine.t > 0.5) { c.globalAlpha = ck * (0.55 + Math.sin(this.time * 4) * 0.25); c.fillStyle = '#d8d2c4'; c.font = `${Math.round(13 * DPR)}px ${FT}`; c.textAlign = 'right'; c.fillText(this.input.touchMode ? 'Touche l\'écran pour passer ›' : 'Une touche pour passer ›', W - 24 * DPR, H - bh / 2 + 5 * DPR); c.globalAlpha = 1; } }
    }
  },
  renderLights(S, ox, oy, inView) {
    const L = lctx, lw = lightCanvas.width, lh = lightCanvas.height, p = this.player, t = this.time;
    L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'source-over';
    const amb = this.mode === 'secret' ? [58, 34, 56] : this.dailyMod && this.dailyMod.id === 'night' ? [3, 3, 6] : this.diff.ambient, bossDark = (this.blackoutT > 0 ? 0.1 : 1) * (this.bossRef && this.bossRef.state === 'intro' ? 0.4 : 1) * (this.event && this.event.id === 'blackout' ? 0.25 : this.event && this.event.id === 'ash' ? 0.7 : 1);
    L.fillStyle = `rgb(${amb[0] * bossDark | 0},${amb[1] * bossDark | 0},${amb[2] * bossDark | 0})`; L.fillRect(0, 0, lw, lh);
    L.setTransform(S / LD, 0, 0, S / LD, ox / LD, oy / LD); L.globalCompositeOperation = 'lighter';
    const glow = (x, y, r, col, i) => {
      if (i <= 0.01 || !inView(x, y, r)) return;
      const gr = L.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${col},${Math.min(1, i)})`); gr.addColorStop(0.35, `rgba(${col},${Math.min(1, i * 0.5)})`); gr.addColorStop(1, `rgba(${col},0)`);
      L.fillStyle = gr; L.beginPath(); L.arc(x, y, r, 0, TAU); L.fill();
      if (i > 1) { L.globalAlpha = Math.min(1, i - 1); L.fill(); L.globalAlpha = 1; }
    };
    // lampe torche avec ombres projetées
    for (const p of this.players()) if (!p.dead) {
      let flick = 1; if (this.torchFlicker > 0) flick = Math.random() < 0.5 ? 0.15 : 0.8;
      const tk = this.state === 'title' ? 1 : p.torchK(); flick *= tk;
      const px = p.x + Math.cos(p.aim) * 6, py = p.y + Math.sin(p.aim) * 6, range = 580 * lampRange() * (0.45 + 0.55 * tk), half = lampHalf(), rays = TOUCH ? 64 : 120;
      const obs = this.level.queryRect(px - range, py - range, range * 2, range * 2).filter(o => !LOWK.has(o.kind));
      const pts = [];
      for (let i = 0; i <= rays; i++) {
        const a = p.aim - half + 2 * half * i / rays, dx = Math.cos(a), dy = Math.sin(a); let tt = range, hit = null;
        for (const o of obs) { const r = rayRect(px, py, dx, dy, o, tt); if (r < tt) { tt = r; hit = o; } }
        if (hit) tt = Math.min(range, tt + Math.min(46, hit.z * 0.7));
        pts.push(px + dx * tt, py + dy * tt, a - p.aim);
      }
      const cone = (lim, inten) => {
        const gr = L.createRadialGradient(px, py, 8, px, py, range);
        const lc = !this.p2 ? ['255,238,205', '255,232,195', '255,230,190'] : p.isP2 ? ['150,200,255', '120,180,255', '110,170,255'] : ['255,150,130', '255,120,100', '255,110,90'];
        gr.addColorStop(0, `rgba(${lc[0]},${inten})`); gr.addColorStop(0.45, `rgba(${lc[1]},${inten * 0.6})`); gr.addColorStop(1, `rgba(${lc[2]},0)`);
        L.fillStyle = gr; L.beginPath(); L.moveTo(px, py); let any = false;
        for (let i = 0; i < pts.length; i += 3) if (Math.abs(pts[i + 2]) <= lim) { L.lineTo(pts[i], pts[i + 1]); any = true; }
        L.closePath(); if (any) L.fill();
      };
      cone(0.63, 0.42 * flick); cone(0.4, 0.55 * flick); cone(0.2, 0.35 * flick);
      glow(p.x, p.y, Settings.vis === 'renforcee' ? 190 : 135, !this.p2 ? '190,200,235' : p.isP2 ? '120,170,255' : '255,120,100', Settings.vis === 'renforcee' ? 0.5 : 0.32);
    } else glow(p.x, p.y, 90, '160,20,10', 0.4);
    if (this.state === 'title') glow(640, 660, 160, '190,200,235', 0.25);
    for (const l of this.level.lamps) {
      if (!l.on) continue; let i = 0.78;
      if (l.flick) { const v = Math.sin(t * 3 + l.phase) * Math.sin(t * 17.3 + l.phase * 3); if (v > 0.72) i = 0.05; else i *= 0.85 + Math.random() * 0.15; }
      l._i = i; glow(l.x, l.y + 12, 250, '255,165,85', i);
    }
    for (const f of this.level.fixedLights) { const fl = Settings.calm && f.flick >= 2 ? 0.8 : f.flick === 3 ? (Math.sin(t * 2.3 + f.x) * Math.sin(t * 11.7 + f.y * 0.01) > 0.55 ? 0.04 : 0.8 + Math.random() * 0.2) : f.flick === 2 ? 0.75 + Math.random() * 0.25 : f.flick === 1 ? 0.95 + Math.sin(t * 2) * 0.05 : 1; glow(f.x, f.y, f.r, f.c, f.i * fl); }
    for (const f of this.fires) glow(f.x, f.y, f.r * 4.5, '255,130,50', 0.85 * Math.min(1, f.life / 1.5) * (0.75 + Math.random() * 0.25));
    for (const l of this.lights) glow(l.x, l.y, l.r, l.c, l.i * (l.life / l.max));
    if (this.event && this.event.id === 'icecream') { const e = this.event; glow(e.x + 52, e.y - 30, 170, '255,220,170', 0.75); glow(e.x - 14, e.y - 50, 90, '214,140,160', 0.5 + Math.sin(this.time * 17) * 0.15); }
    for (const c of this.level.cars) {
      if (c.burning > 0) glow(c.x + c.w / 2, c.y + c.h / 2, 300, '255,120,40', 0.9 * (0.75 + Math.random() * 0.25));
      if (c.alarm > 0 && Math.floor(t * 4) % 2 === 0) { glow(c.x, c.y + c.h / 2, 120, '255,170,60', 0.8); glow(c.x + c.w, c.y + c.h / 2, 120, '255,170,60', 0.8); }
    }
    for (const z of this.zombies) { if (z.type === 'bomber') glow(z.x, z.y - 14, 70, '140,255,90', 0.35 + Math.sin(t * 8 + z.walkT) * 0.1); else if (z.type === 'boss') glow(z.x, z.y - 40, 140, '255,40,20', 0.35); }
    for (const pd of this.puddles) glow(pd.x, pd.y, pd.r * 1.8, Settings.cb ? '80,160,255' : '120,255,60', 0.2 * Math.min(1, pd.life / 1.5));
    for (const a of this.acids) glow(a.x, a.y - a.z, 40, '140,255,70', 0.4);
    for (const th of this.throwables) if (th.kind === 'decoy' && th.landed) glow(th.x, th.y, 260, '255,60,40', 0.75 + Math.random() * 0.25);
    for (const m of this.mines) if (m.arm <= 0 && Math.floor(m.t * 2) % 2 === 0) glow(m.x, m.y, 30, '255,40,30', 0.5);
    for (const o of this.level.machines) if (!o.broken) glow(o.x + o.w / 2, o.y + o.h + 4, 70, '255,90,80', 0.28);
    for (const pk of this.pickups) if (pk.kind === 'key' || pk.kind === 'fuel' || pk.kind === 'weapon') glow(pk.x, pk.y, 90, pk.kind === 'weapon' ? '255,220,150' : '255,200,90', 0.3 + Math.sin(t * 4) * 0.1);
    const ob = this.state === 'playing' ? this.objective() : null;
    if (this.activeZone === 1 && !this.level.obj[1].done) glow(this.level.obj[1].x, 600, 170, this.level.obj[1].started ? '120,255,140' : '255,70,50', 0.35 + Math.sin(t * 5) * 0.12);
    if (this.level.obj[3].dead) { glow(HELI, 600, 260, '255,40,30', 0.6 + Math.sin(t * 6) * 0.2); glow(HELI - 60, 520, 120, '255,60,40', 0.5); glow(HELI + 60, 680, 120, '255,60,40', 0.5); }
    const gen = this.level.obstacles.find(o => o.kind === 'generator'); if (gen && gen.on) glow(gen.x + gen.w / 2, gen.y + gen.h, 140, '255,220,140', 0.5);
    if (ob && ob.tx != null && this.activeZone === 2 && this.level.obj[2].picked && !this.level.obj[2].done) glow(ob.tx, ob.ty, 120, '255,200,90', 0.3 + Math.sin(t * 4) * 0.12);
    L.globalCompositeOperation = 'source-over';
  },
  // ligne de visée laser : part du canon, s'arrête sur le premier mur ou le premier zombie
  drawLaser(q, col) {
    const c = ctx, m = q.muzzle(), dx = Math.cos(q.aim), dy = Math.sin(q.aim); let len = 460, hitZ = false;
    for (const o of this.level.queryRect(Math.min(m.x, m.x + dx * len), Math.min(m.y, m.y + dy * len), Math.abs(dx * len), Math.abs(dy * len))) { if (LOWK.has(o.kind)) continue; const d = rayRect(m.x, m.y, dx, dy, o, len); if (d < len) len = Math.max(0, d); }
    for (const z of this.zombies) { if (z.dead || z.spawnT > 0) continue; const ox = z.x - m.x, oy = z.y - m.y, tt = ox * dx + oy * dy; if (tt < 0 || tt > len) continue; const px = ox - dx * tt, py = oy - dy * tt, r = z.r + 2; if (px * px + py * py < r * r) { len = tt - Math.sqrt(r * r - px * px - py * py); hitZ = true; } }
    if (len < 4) return;
    const x0 = m.x, y0 = m.y - 14, x1 = m.x + dx * len, y1 = m.y + dy * len - 14, fl = 0.85 + Math.sin(this.time * 30) * 0.05;
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    let gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(${col},${0.22 * fl})`); gr.addColorStop(1, `rgba(${col},${hitZ ? 0.18 : 0.02})`);
    c.strokeStyle = gr; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(${col},${0.9 * fl})`); gr.addColorStop(1, `rgba(${col},${hitZ ? 0.8 : 0.08})`);
    c.strokeStyle = gr; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    if (hitZ || len < 455) { c.fillStyle = `rgba(${col},${hitZ ? 0.95 : 0.6})`; c.beginPath(); c.arc(x1, y1, hitZ ? 3 : 2, 0, TAU); c.fill(); c.fillStyle = `rgba(${col},.25)`; c.beginPath(); c.arc(x1, y1, hitZ ? 8 : 5, 0, TAU); c.fill(); }
    c.restore();
  },
  renderEmissive(inView) {
    const c = ctx, t = this.time, p = this.player;
    for (const pt of this.particles) if (pt.emissive && inView(pt.x, pt.y)) this.drawParticle(pt);
    c.globalAlpha = 1;
    for (const z of this.zombies) if (z.type === 'boss' && !z.dead && inView(z.x, z.y, 200)) this.drawBossGlow(z);
    if (this.state === 'playing' || this.state === 'paused') for (const q of this.players()) if (q && !q.dead && !q.hidden) this.drawLaser(q, q === this.p2 ? '255,170,90' : '90,170,255');
    for (const b of this.bullets) { c.strokeStyle = b.charged ? 'rgba(200,235,255,.95)' : 'rgba(255,215,150,.85)'; c.lineWidth = b.charged ? 4 : 1.6; c.beginPath(); c.moveTo(b.px - b.vx * 0.012, b.py - b.vy * 0.012 - 14); c.lineTo(b.x, b.y - 14); c.stroke(); }
    for (const f of this.flames) { const k = f.life / f.max; c.globalAlpha = Math.min(1, k * 1.4) * 0.7; c.fillStyle = k > 0.65 ? '#ffd88a' : k > 0.35 ? '#ff7a22' : '#9c2410'; c.beginPath(); c.arc(f.x, f.y - 12, f.r, 0, TAU); c.fill(); } c.globalAlpha = 1;
    for (const r of this.rockets) { c.fillStyle = '#ffd27a'; c.beginPath(); c.arc(r.x, r.y - 14, 4, 0, TAU); c.fill(); }
    for (const b of this.beams) {
      const k = b.life / b.max; c.beginPath(); c.moveTo(b.x1, b.y1 - 14);
      if (b.bolt) { const n = 7; for (let i = 1; i < n; i++) { const t2 = i / n; c.lineTo(lerp(b.x1, b.x2, t2) + rand(-12, 12), lerp(b.y1, b.y2, t2) - 14 + rand(-12, 12)); } }
      c.lineTo(b.x2, b.y2 - 14);
      c.strokeStyle = `rgba(150,215,255,${k})`; c.lineWidth = (b.bolt ? 6 : 9) * k; c.stroke(); c.strokeStyle = `rgba(255,255,255,${k})`; c.lineWidth = 2.5 * k; c.stroke();
    }
    for (const a of this.acids) { c.fillStyle = ACID(); c.globalAlpha = 0.85; c.beginPath(); c.arc(a.x, a.y - a.z, a.big ? 7 : 5, 0, TAU); c.fill(); } c.globalAlpha = 1;
    for (const s of this.shockwaves) { c.strokeStyle = `rgba(255,140,60,${1 - s.r / s.max})`; c.lineWidth = 6; c.beginPath(); c.ellipse(s.x, s.y, s.r, s.r * 0.85, 0, 0, TAU); c.stroke(); }
    // yeux dans la nuit
    for (const z of this.zombies) {
      if (z.spawnT > 0 || !inView(z.x, z.y)) continue; const sa = Math.sin(z.dir); if (sa < -0.3) continue;
      const ca = Math.cos(z.dir), r = z.r, hx = z.x + ca * r * 0.25, hy = z.y - r * 1.95 + Math.sin(z.walkT * 0.5);
      const a = z.type === 'runner' ? 0.85 : z.type === 'boss' ? 1 : 0.5; c.fillStyle = z.type === 'bomber' || z.type === 'spitter' ? `rgba(170,255,90,${a})` : `rgba(255,55,35,${a})`;
      const ex = r * 0.2, es = z.type === 'boss' ? 3.4 : 1.5;
      c.fillRect(hx - ex + ca * 2 - es / 2, hy - es / 2, es, es); c.fillRect(hx + ex + ca * 2 - es / 2, hy - es / 2, es, es);
      if (z.type === 'bomber') { c.fillStyle = `rgba(150,255,80,${0.35 + Math.sin(t * 8 + z.walkT) * 0.15})`; for (const [bx, by] of [[-5, -14], [4, -10], [0, -20]]) { c.beginPath(); c.arc(z.x + bx, z.y + by, 3, 0, TAU); c.fill(); } }
    }
    // façades : quelques fenêtres encore allumées
    for (const b of this.level.obstacles) {
      if (b.kind !== 'building' || b.x > this.cam.x + 1400 || b.x + b.w < this.cam.x - 1400) continue;
      for (const [i, j, s] of b.lit) { const fl = Math.sin(t * 0.7 + s * 30) > -0.92 ? 1 : 0.2; c.fillStyle = `rgba(255,${150 + s * 60 | 0},80,${0.22 * fl})`; c.fillRect(b.x + 14 + i * 46, b.y + b.h - b.z + 14 + j * 34, 22, 16); }
    }
    c.font = `13px ${FD}`; c.textAlign = 'center';
    for (const sv of this.survivors) if (sv.state === 'idle' && dist2(sv.x, sv.y, p.x, p.y) < 420 * 420 && Math.floor(t * 2) % 2 === 0) { c.fillStyle = 'rgba(255,220,150,.85)'; c.fillText('À L\'AIDE !', sv.x, sv.y - 40); }
    for (const l of this.level.lamps) if (l.on && (l._i || 0) > 0.1 && inView(l.x, l.y, 140)) { c.fillStyle = 'rgba(255,200,130,.9)'; c.beginPath(); c.arc(l.x, l.y - 92, 3.5, 0, TAU); c.fill(); }
    for (const o of this.level.machines) if (!o.broken && inView(o.x, o.y)) { c.fillStyle = `rgba(255,70,60,${0.55 + Math.sin(t * 3) * 0.15})`; const cx = o.x + o.w / 2, cy = o.y + o.h - o.z + 14; c.fillRect(cx - 7, cy - 2, 14, 4); c.fillRect(cx - 2, cy - 7, 4, 14); }
    for (const o of this.level.obstacles) if (o.kind === 'shop' && inView(o.x, o.y)) { c.fillStyle = 'rgba(110,255,160,.5)'; c.fillRect(o.x + 16, o.y + o.h - o.z + 8, o.w - 32, 16); }
    for (const car of this.level.cars) if (car.alarm > 0 && Math.floor(t * 4) % 2 === 0) { c.fillStyle = 'rgba(255,180,70,.9)'; c.fillRect(car.x - 1, car.y - car.z + 2, 4, 6); c.fillRect(car.x + car.w - 3, car.y - car.z + 2, 4, 6); }
    for (const th of this.throwables) if (th.kind === 'decoy' && Math.floor(t * 6) % 2 === 0) { c.fillStyle = '#ff6050'; c.beginPath(); c.arc(th.x, th.y - th.z - 4, 4, 0, TAU); c.fill(); }
    for (const m of this.mines) { c.fillStyle = m.arm > 0 ? 'rgba(255,200,60,.9)' : Math.floor(m.t * 2) % 2 ? 'rgba(255,40,30,.9)' : 'rgba(255,40,30,.3)'; c.fillRect(m.x - 1.5, m.y - 6, 3, 3); }
    for (const pk of this.pickups) {
      if (!inView(pk.x, pk.y)) continue;
      if (pk.kind === 'coin') { if (dist2(pk.x, pk.y, p.x, p.y) < 260 * 260 && Math.sin(t * 6 + pk.x) > 0.6) { c.fillStyle = 'rgba(255,220,120,.6)'; c.fillRect(pk.x - 1, pk.y - 5, 2, 2); } }
      else if (pk.kind === 'shiba') { if (dist2(pk.x, pk.y, p.x, p.y) < 320 * 320 && Math.sin(t * 3 + pk.x) > 0.7) { c.fillStyle = 'rgba(255,200,120,.55)'; c.fillRect(pk.x - 4, pk.y - 18, 2, 2); c.fillRect(pk.x + 2, pk.y - 18, 2, 2); } }
      else if (pk.kind === 'battery' || pk.kind === 'fetish') { if (dist2(pk.x, pk.y, p.x, p.y) < 300 * 300 && Math.sin(t * 4 + pk.y) > 0.5) { c.fillStyle = pk.kind === 'battery' ? 'rgba(240,230,160,.6)' : 'rgba(255,190,110,.6)'; c.fillRect(pk.x - 1.5, pk.y - 14, 3, 3); } }
      else if (pk.kind !== 'ammo' && pk.kind !== 'med' && pk.kind !== 'grenade') { c.strokeStyle = `rgba(255,210,120,${0.4 + Math.sin(t * 4) * 0.25})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(pk.x, pk.y, 20, 11, 0, 0, TAU); c.stroke(); }
    }
    if (this.activeZone === 1) {
      const o = this.level.obj[1]; if (!o.done) {
        c.lineWidth = 3; c.setLineDash([14, 10]); c.strokeStyle = o.started ? 'rgba(120,255,150,.55)' : 'rgba(255,80,60,.55)'; c.beginPath(); c.ellipse(o.x, o.y, o.r, o.r * 0.9, 0, 0, TAU); c.stroke(); c.setLineDash([]);
        if (o.started) { c.strokeStyle = 'rgba(140,255,170,.9)'; c.lineWidth = 5; c.beginPath(); c.ellipse(o.x, o.y, o.r, o.r * 0.9, 0, -Math.PI / 2, -Math.PI / 2 + TAU * (o.t / o.time)); c.stroke(); }
        c.fillStyle = `rgba(120,255,140,${Math.floor(t * 2) % 2 ? 0.9 : 0.3})`; c.fillRect(this.level.obj[1].x - 4, 562, 6, 4);
      }
    }
    if (p.charging && p.charge > 0 && !p.dead) { const m = p.muzzle(); c.fillStyle = `rgba(200,230,255,${0.3 + p.charge * 0.6})`; c.beginPath(); c.arc(m.x, m.y - 14, 3 + p.charge * 9 + (p.charge >= 1 ? Math.sin(t * 30) * 1.5 : 0), 0, TAU); c.fill(); }
    if (p.muzzleT > 0 && !p.dead) { const m = p.muzzle(); c.fillStyle = 'rgba(255,220,150,.95)'; c.beginPath(); c.arc(m.x, m.y - 14, 7, 0, TAU); c.fill(); }
    if (!p.dead && !p.hidden) { const m = p.muzzle(); c.fillStyle = 'rgba(255,245,220,.8)'; c.beginPath(); c.arc(m.x - Math.cos(p.aim) * 4, m.y - 16 - Math.sin(p.aim) * 4, 1.8, 0, TAU); c.fill(); }
  },
  // ---------- dessin des entités
  box(x, y, w, h, z, top, front) { const c = ctx; c.fillStyle = front; c.fillRect(x, y + h - z, w, z); c.fillStyle = top; c.fillRect(x, y - z, w, h); },
  drawObstacle(o) {
    const c = ctx, t = this.time;
    switch (o.kind) {
      case 'building': {
        const hueA = ['#3f3a36', '#3a3c3f', '#45403a', '#3a3632', '#403b40'][Math.floor(o.hue * 5)];
        this.box(o.x, o.y, o.w, o.h, o.z, '#1f2023', hueA);
        c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(o.x, o.y + o.h - o.z, o.w, 3);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(o.x, o.y + o.h - 6, o.w, 6);
        const cols = Math.floor((o.w - 20) / 46), rows = Math.floor((o.z - 40) / 34), fy = o.y + o.h - o.z;
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const wx = o.x + 14 + i * 46, wy = fy + 14 + j * 34; c.fillStyle = '#121418'; c.fillRect(wx, wy, 22, 16); if ((i * 7 + j * 3 + o.seed) % 5 === 0) { c.fillStyle = '#4a3a2a'; c.fillRect(wx - 2, wy + 4, 26, 3); c.fillRect(wx - 2, wy + 10, 26, 3); } }
        c.fillStyle = '#26272b'; for (let i = 0; i < 3; i++) c.fillRect(o.x + 20 + ((o.seed >> (i * 3)) % Math.max(1, o.w - 60)), o.y - o.z + 30 + i * 22, 26, 14);
        for (const d of o.doors) { const dw = d.big ? 64 : 30, dh = d.big ? 56 : 38; c.fillStyle = '#2a211c'; c.fillRect(d.x - dw / 2 - 3, o.y + o.h - dh - 3, dw + 6, dh + 3); c.fillStyle = '#120e0c'; c.fillRect(d.x - dw / 2, o.y + o.h - dh, dw, dh); if (d.big && this.level.obj[3] && this.level.obj[3].spawned) { c.fillStyle = '#050404'; c.fillRect(d.x - dw / 2, o.y + o.h - dh, dw, dh); } }
        break;
      }
      case 'hwall': this.box(o.x, o.y, o.w, o.h, o.z, '#c4d0cc', '#74877f'); c.fillStyle = '#3f6f62'; c.fillRect(o.x, o.y + o.h - o.z * 0.45, o.w, 4); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(o.x, o.y + o.h - 3, o.w, 3); if (o.blood) { c.fillStyle = 'rgba(110,10,8,.7)'; c.fillRect(o.x + o.blood, o.y + o.h - o.z + 8, 10, o.z * 0.5); } break;
      case 'bed': { c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(o.x + 3, o.y + o.h - 4, o.w, 7); this.box(o.x, o.y, o.w, o.h, o.z, '#e4e6e0', '#7e8a86'); c.fillStyle = '#c9d6dc'; c.fillRect(o.x + 4, o.y - o.z + 3, o.w - 8, 12); c.fillStyle = o.sheet || '#a9c2c8'; c.fillRect(o.x + 2, o.y - o.z + 18, o.w - 4, o.h - 22); if (o.stain) { c.fillStyle = 'rgba(120,10,8,.65)'; c.beginPath(); c.ellipse(o.x + o.w / 2, o.y - o.z + o.h * 0.55, 9, 6, 0, 0, TAU); c.fill(); } break; }
      case 'wall': this.box(o.x, o.y, o.w, o.h, o.z, '#2c2c2f', '#4a4845'); c.fillStyle = 'rgba(0,0,0,.25)'; for (let y = o.y; y < o.y + o.h; y += 40) c.fillRect(o.x, y - o.z, o.w, 2); break;
      case 'gate': { c.strokeStyle = '#6a6e72'; c.lineWidth = 3; c.beginPath(); for (let y = o.y + 4; y <= o.y + o.h; y += 11) { c.moveTo(o.x + o.w / 2, y); c.lineTo(o.x + o.w / 2, y - o.z); } c.stroke(); c.fillStyle = '#7a3a1c'; c.fillRect(o.x + 2, o.y - o.z - 4, o.w - 4, 6); c.fillRect(o.x + 2, o.y + o.h - o.z - 4, o.w - 4, 6); c.fillStyle = '#c49a2c'; c.fillRect(o.x + o.w / 2 - 5, o.y + o.h / 2 - o.z / 2, 10, 12); break; }
      case 'car': this.drawCar(o); break;
      case 'barrel': { if (o.pumpkin) { drawPumpkin(c, o.x + 11, o.y + 12, 1, this.time + o.x); break; } c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(o.x + 11, o.y + 20, 13, 5, 0, 0, TAU); c.fill(); c.fillStyle = '#7d1f17'; c.fillRect(o.x + 1, o.y - 6, 20, 26); c.fillStyle = '#d0a425'; c.fillRect(o.x + 1, o.y + 4, 20, 4); c.fillStyle = '#9a2a1f'; c.beginPath(); c.ellipse(o.x + 11, o.y - 6, 10, 4, 0, 0, TAU); c.fill(); break; }
      case 'barrier': this.box(o.x, o.y, o.w, o.h, o.z, '#8f8c84', '#6e6b64'); c.fillStyle = '#8a2b22'; for (let x = o.x + 6; x < o.x + o.w - 10; x += 26) c.fillRect(x, o.y + o.h - o.z + 6, 12, 8); break;
      case 'dumpster': this.box(o.x, o.y, o.w, o.h, o.z, o.hue > 0.5 ? '#2d4a35' : '#4a3d26', o.hue > 0.5 ? '#223a29' : '#3a301e'); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(o.x, o.y - o.z + o.h / 2, o.w, 2); break;
      case 'kiosk': this.box(o.x, o.y, o.w, o.h, o.z, '#2a3b3a', '#3f4a48'); c.fillStyle = '#13181a'; c.fillRect(o.x + 10, o.y + o.h - o.z + 10, o.w - 20, 22); c.fillStyle = '#6b2a20'; c.fillRect(o.x - 4, o.y - o.z - 4, o.w + 8, 10); c.fillStyle = 'rgba(220,210,180,.35)'; c.font = `9px ${FT}`; c.textAlign = 'center'; c.fillText('PRESSE · TABAC', o.x + o.w / 2, o.y - o.z + 4); break;
      case 'machine': { this.box(o.x, o.y, o.w, o.h, o.z, o.broken ? '#3a2a28' : '#8c2a24', o.broken ? '#2c201f' : '#a8342c'); const fy = o.y + o.h - o.z; c.fillStyle = o.broken ? '#1c1817' : '#e9e2d2'; c.fillRect(o.x + 5, fy + 6, o.w - 10, 18); c.fillStyle = '#1a1a1c'; c.fillRect(o.x + 6, fy + 30, o.w - 12, 12); if (!o.broken) { c.fillStyle = '#b0231c'; c.fillRect(o.x + o.w / 2 - 6, fy + 13, 12, 4); c.fillRect(o.x + o.w / 2 - 2, fy + 9, 4, 12); c.fillStyle = '#7fd18b'; for (let i = 0; i < o.charges; i++) c.fillRect(o.x + 8 + i * 8, fy + 44, 5, 4); } break; }
      case 'shop': this.box(o.x, o.y, o.w, o.h, o.z, '#2b2622', '#4a3b2d'); c.fillStyle = '#0d1a12'; c.fillRect(o.x + 14, o.y + o.h - o.z + 6, o.w - 28, 20); c.fillStyle = '#6b5a40'; for (let i = 0; i < 4; i++) c.fillRect(o.x + 10 + i * 24, o.y - o.z + 8, 16, 10); break;
      case 'sandbags': for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#5d5442' : '#6b604a'; c.beginPath(); c.ellipse(o.x + 10 + i * 20, o.y + o.h - 8, 12, 9, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(o.x + 20 + i * 18, o.y + o.h - 20, 12, 8, 0, 0, TAU); c.fill(); } break;
      case 'cot': this.box(o.x, o.y, o.w, o.h, o.z, '#4b5240', '#2a2e25'); c.fillStyle = '#7a7466'; c.fillRect(o.x + 4, o.y - o.z + 4, 18, o.h - 8); break;
      case 'radio': this.box(o.x, o.y, o.w, o.h, o.z, '#3a4231', '#2b3125'); c.strokeStyle = '#8a8d86'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(o.x + 24, o.y - o.z); c.lineTo(o.x + 28, o.y - o.z - 34); c.stroke(); break;
      case 'generator': this.box(o.x, o.y, o.w, o.h, o.z, '#6a5a20', '#8a7426'); c.fillStyle = '#1a1a1a'; for (let x = o.x + 4; x < o.x + o.w - 8; x += 16) c.fillRect(x, o.y + o.h - o.z + 4, 8, o.z - 8); if (o.on) { c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(o.x + rand(-1, 1), o.y - o.z + rand(-1, 1), 10, 6); } break;
      case 'statue': this.box(o.x, o.y, o.w, o.h, o.z, '#4c4a46', '#5d5a54'); c.fillStyle = '#3a3936'; c.fillRect(o.x + 50, o.y - o.z - 50, 40, 60); c.beginPath(); c.arc(o.x + 70, o.y - o.z - 60, 14, 0, TAU); c.fill(); c.fillStyle = 'rgba(220,210,180,.3)'; c.font = `10px ${FT}`; c.textAlign = 'center'; c.fillText('AUX ENFANTS DE LA VILLE', o.x + o.w / 2, o.y + o.h - o.z / 2); break;
      case 'brazier': { c.fillStyle = '#2a2622'; c.fillRect(o.x + 2, o.y - 10, 22, 34); c.fillStyle = '#1a1816'; c.beginPath(); c.ellipse(o.x + 13, o.y - 10, 11, 4, 0, 0, TAU); c.fill(); if (Math.random() < 0.5) this.spawnP({ x: o.x + 13 + rand(-6, 6), y: o.y + 13, z: 30, vz: rand(40, 80), life: rand(0.3, 0.6), type: 'fire', size: rand(4, 7), emissive: true, drag: 1 }); break; }
      case 'parapet': c.fillStyle = '#5a5853'; c.fillRect(o.x, o.y - o.z, o.w, o.h); c.fillStyle = '#3e3d3a'; c.fillRect(o.x, o.y + o.h - o.z, o.w, o.z); break;
      default: this.box(o.x, o.y, o.w, o.h, o.z, '#444', '#333');
    }
  },
  drawCar(o) {
    const c = ctx, z = o.z, col = o.wreck ? '#1c1a19' : o.color;
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(o.x - 3, o.y + 4, o.w + 6, o.h);
    c.fillStyle = o.wreck ? '#141312' : shade(col, -0.35); c.fillRect(o.x, o.y + o.h - z, o.w, z);
    c.fillStyle = '#0d0d0e'; if (o.hor) { c.fillRect(o.x + 10, o.y + o.h - 8, 16, 8); c.fillRect(o.x + o.w - 26, o.y + o.h - 8, 16, 8); } else { c.fillRect(o.x + 4, o.y + o.h - 8, 10, 8); c.fillRect(o.x + o.w - 14, o.y + o.h - 8, 10, 8); }
    c.fillStyle = col; c.fillRect(o.x, o.y - z, o.w, o.h);
    const tx = o.x, ty = o.y - z;
    if (o.hor) { c.fillStyle = o.wreck ? '#0b0b0b' : '#141a20'; c.fillRect(tx + o.w * 0.26, ty + 4, o.w * 0.48, o.h - 8); c.fillStyle = o.wreck ? '#1a1818' : shade(col, 0.12); c.fillRect(tx + o.w * 0.34, ty + 7, o.w * 0.32, o.h - 14); if (!o.wreck) { c.fillStyle = '#8a8676'; c.fillRect(tx + o.w - 4, ty + 5, 3, 7); c.fillRect(tx + o.w - 4, ty + o.h - 12, 3, 7); c.fillStyle = '#5a1712'; c.fillRect(tx + 1, ty + 5, 3, 7); c.fillRect(tx + 1, ty + o.h - 12, 3, 7); } }
    else { c.fillStyle = o.wreck ? '#0b0b0b' : '#141a20'; c.fillRect(tx + 4, ty + o.h * 0.26, o.w - 8, o.h * 0.48); c.fillStyle = o.wreck ? '#1a1818' : shade(col, 0.12); c.fillRect(tx + 7, ty + o.h * 0.34, o.w - 14, o.h * 0.32); if (!o.wreck) { c.fillStyle = '#8a8676'; c.fillRect(tx + 5, ty + o.h - 4, 7, 3); c.fillRect(tx + o.w - 12, ty + o.h - 4, 7, 3); } }
    if (o.explosive && !o.wreck) { c.fillStyle = 'rgba(70,60,20,.85)'; c.beginPath(); c.ellipse(o.x + o.w * 0.2, o.y + o.h + 6, 12, 4, 0, 0, TAU); c.fill(); c.fillStyle = '#c44a1c'; c.fillRect(o.x + o.w * 0.12, o.y + o.h - z + 6, 8, 5); }
    if (!o.wreck && o.hp < o.maxHp) { c.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < (1 - o.hp / o.maxHp) * 8; i++) c.fillRect(o.x + ((i * 37) % o.w), o.y - z + ((i * 23) % o.h), 4, 3); }
  },
  drawSurvivor(sv) {
    const c = ctx; c.save(); c.translate(sv.x, sv.y);
    c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(0, 2, 12, 5, 0, 0, TAU); c.fill();
    const crouch = sv.state === 'idle' ? 8 : 0, sw = Math.sin(sv.walkT) * 3;
    if (!crouch) { c.fillStyle = '#2a2a30'; c.fillRect(-6, -9 + sw * 0.3, 4, 9); c.fillRect(2, -9 - sw * 0.3, 4, 9); }
    c.fillStyle = sv.hurtT > 0 ? '#e8d8d0' : sv.coat; c.beginPath(); c.ellipse(0, -15 + crouch, 10, 11, 0, 0, TAU); c.fill();
    c.fillStyle = '#d2a37c'; c.beginPath(); c.arc(Math.cos(sv.dir) * 2, -28 + crouch, 6.5, 0, TAU); c.fill();
    c.restore();
    if (sv.state === 'follow' && sv.hp < 60) { c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(sv.x - 14, sv.y - 44, 28, 4); c.fillStyle = '#7fd18b'; c.fillRect(sv.x - 14, sv.y - 44, 28 * sv.hp / 60, 4); }
  },
  drawLamp(l) {
    const c = ctx; c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(l.x, l.y + 2, 6, 3, 0, 0, TAU); c.fill();
    c.strokeStyle = '#2d2f33'; c.lineWidth = 3; c.beginPath(); c.moveTo(l.x, l.y); c.lineTo(l.x, l.y - 92); c.stroke();
    c.fillStyle = '#3a3d42'; c.fillRect(l.x - 7, l.y - 97, 14, 6);
  },
  drawChest(ch) {
    const c = ctx; c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(ch.x - 13, ch.y - 2, 28, 8);
    c.fillStyle = ch.open ? '#3a2b1c' : '#5c4124'; c.fillRect(ch.x - 13, ch.y - 16, 26, 18); c.fillStyle = ch.open ? '#20180f' : '#6e5030'; c.fillRect(ch.x - 13, ch.y - 22, 26, 8);
    c.fillStyle = '#9a8040'; c.fillRect(ch.x - 2, ch.y - 16, 4, 6);
  },
  drawPickup(pk) {
    const c = ctx, b = Math.sin(this.time * 4 + pk.x) * 2;
    switch (pk.kind) {
      case 'coin': c.fillStyle = '#c9a23a'; c.beginPath(); c.ellipse(pk.x, pk.y - 2, 4, 3, 0, 0, TAU); c.fill(); c.fillStyle = '#f0d27a'; c.fillRect(pk.x - 1, pk.y - 4, 2, 2); break;
      case 'ammo': c.fillStyle = '#3b4a2c'; c.fillRect(pk.x - 8, pk.y - 10 + b, 16, 10); c.fillStyle = '#c9a23a'; c.fillRect(pk.x - 6, pk.y - 8 + b, 3, 6); c.fillRect(pk.x - 1, pk.y - 8 + b, 3, 6); c.fillRect(pk.x + 4, pk.y - 8 + b, 3, 6); break;
      case 'med': c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(pk.x, pk.y, 9, 3, 0, 0, TAU); c.fill(); itemArt(c, 'med', pk.x, pk.y - 8 + b, 20); break;
      case 'grenade': c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(pk.x, pk.y, 7, 3, 0, 0, TAU); c.fill(); itemArt(c, 'grenade', pk.x, pk.y - 8 + b, 18); break;
      case 'shiba': drawShibaSprite(c, pk.x, pk.y, 1, this.time + pk.x); break;
      case 'battery': c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(pk.x, pk.y, 8, 3, 0, 0, TAU); c.fill(); itemArt(c, 'battery', pk.x, pk.y - 9 + b, 20); break;
      case 'fetish':
        c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(pk.x, pk.y, 10, 4, 0, 0, TAU); c.fill();
        if (this.charKey === 'zeus') { c.fillStyle = '#b5552e'; c.fillRect(pk.x - 6, pk.y - 9 + b, 12, 9); c.fillStyle = '#4a9a4a'; for (const [lx, ly] of [[-4, -13], [0, -16], [4, -13], [0, -11]]) { c.beginPath(); c.ellipse(pk.x + lx, pk.y + ly + b, 3.5, 2.2, lx * 0.2, 0, TAU); c.fill(); } }
        else if (this.charKey === 'dobby') { c.fillStyle = '#c0392b'; c.fillRect(pk.x - 3, pk.y - 16 + b, 6, 12); c.fillRect(pk.x - 3, pk.y - 7 + b, 11, 5); c.fillStyle = '#f4f1e6'; c.fillRect(pk.x - 3, pk.y - 13 + b, 6, 2); c.fillRect(pk.x - 3, pk.y - 9 + b, 6, 2); }
        else if (this.charKey === 'chewie') { c.fillStyle = '#e8d2a0'; c.beginPath(); c.ellipse(pk.x, pk.y - 8 + b, 6, 9, 0.5, 0, TAU); c.fill(); c.fillStyle = '#f4f1e6'; c.fillRect(pk.x - 6, pk.y - 6 + b, 12, 5); c.fillStyle = '#8a4a2a'; c.fillRect(pk.x - 2, pk.y - 16 + b, 4, 4); }
        else if (this.charKey === 'dragon') { c.fillStyle = '#1e1a26'; c.fillRect(pk.x - 5, pk.y - 13 + b, 10, 12); c.fillRect(pk.x + 5, pk.y - 10 + b, 3, 6); c.fillStyle = '#6a2a8a'; c.fillRect(pk.x - 5, pk.y - 13 + b, 10, 2); c.fillStyle = 'rgba(220,220,230,.5)'; c.fillRect(pk.x - 2, pk.y - 19 + b, 1.5, 5); c.fillRect(pk.x + 1, pk.y - 20 + b, 1.5, 5); }
        else if (this.charKey === 'pedro') { c.fillStyle = '#e8c88a'; c.beginPath(); c.ellipse(pk.x, pk.y - 7 + b, 10, 5, -0.4, 0, TAU); c.fill(); c.fillStyle = '#c9ccd2'; c.beginPath(); c.ellipse(pk.x + 8, pk.y - 11 + b, 4, 5, -0.4, 0, TAU); c.fill(); }
        else { c.fillStyle = '#f2c94c'; for (let i = 0; i < 4; i++) c.fillRect(pk.x - 5 + i * 3, pk.y - 20 + b + (i % 2) * 2, 2, 8); c.fillStyle = '#f4f1e6'; c.beginPath(); c.moveTo(pk.x - 7, pk.y - 13 + b); c.lineTo(pk.x + 7, pk.y - 13 + b); c.lineTo(pk.x, pk.y + b); c.closePath(); c.fill(); c.fillStyle = '#d23b2f'; c.fillRect(pk.x - 3, pk.y - 13 + b, 2, 7); c.fillRect(pk.x + 1, pk.y - 13 + b, 2, 7); }
        break;
      case 'weapon': c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(pk.x, pk.y, 16, 6, 0, 0, TAU); c.fill(); c.fillStyle = '#2a2b2e'; c.fillRect(pk.x - 16, pk.y - 10 + b, 32, 6); c.fillStyle = '#5a4630'; c.fillRect(pk.x - 16, pk.y - 8 + b, 9, 8); break;
      case 'key': c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(pk.x, pk.y, 12, 5, 0, 0, TAU); c.fill(); c.strokeStyle = '#b0231c'; c.lineWidth = 3; c.beginPath(); c.moveTo(pk.x - 10, pk.y - 14 + b); c.lineTo(pk.x + 10, pk.y - 4 + b); c.moveTo(pk.x - 10, pk.y - 4 + b); c.lineTo(pk.x + 10, pk.y - 14 + b); c.stroke(); break;
      case 'fuel': c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(pk.x, pk.y, 12, 5, 0, 0, TAU); c.fill(); c.fillStyle = '#a3261d'; c.fillRect(pk.x - 9, pk.y - 22 + b, 18, 22); c.fillStyle = '#5a140f'; c.fillRect(pk.x - 3, pk.y - 26 + b, 8, 5); break;
    }
  },
  drawParticle(p) {
    const c = ctx, k = p.life / p.max;
    switch (p.type) {
      case 'blood': case 'gib': case 'debris': c.globalAlpha = 1; c.fillStyle = p.color; c.fillRect(p.x - p.size / 2, p.y - p.z - p.size / 2, p.size, p.size); break;
      case 'casing': c.globalAlpha = 1; c.fillStyle = p.color; c.save(); c.translate(p.x, p.y - p.z); c.rotate(p.rot); c.fillRect(-2, -1, 4, 2); c.restore(); break;
      case 'smoke': c.globalAlpha = k * 0.35; c.fillStyle = '#6a6a6e'; c.beginPath(); c.arc(p.x, p.y - p.z, p.size, 0, TAU); c.fill(); break;
      case 'splash': c.globalAlpha = k * 0.45; c.strokeStyle = '#9aa6b4'; c.lineWidth = 1; c.beginPath(); c.ellipse(p.x, p.y, p.size * 0.5, p.size * 0.22, 0, 0, TAU); c.stroke(); break;
      case 'fire': c.globalAlpha = Math.min(1, k * 1.5) * 0.8; c.fillStyle = k > 0.6 ? '#ffd27a' : k > 0.3 ? '#ff7a1a' : '#a3200f'; c.beginPath(); c.arc(p.x, p.y - p.z, p.size * (0.6 + k * 0.5), 0, TAU); c.fill(); break;
      case 'spark': c.globalAlpha = k; c.strokeStyle = p.color || '#ffcf80'; c.lineWidth = p.size; c.beginPath(); c.moveTo(p.x, p.y - p.z); c.lineTo(p.x - p.vx * 0.03, p.y - p.z - p.vy * 0.03); c.stroke(); break;
      case 'acid': c.globalAlpha = k; c.fillStyle = ACID(); c.fillRect(p.x - 1.5, p.y - p.z - 1.5, 3, 3); break;
      case 'ring': c.globalAlpha = k * 0.8; c.strokeStyle = '#ffb060'; c.lineWidth = 5 * k + 1; c.beginPath(); c.ellipse(p.x, p.y, p.size, p.size * 0.8, 0, 0, TAU); c.stroke(); break;
    }
  }
});
