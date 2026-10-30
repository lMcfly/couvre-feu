// ============================================================ rendu : interface en jeu
mixin(Game, {
  drawWheel(cw, ch) {
    const W8 = this.wheel; if (!W8 || W8.k <= 0) return;
    const c = ctx, p = this.player, k = W8.k, seg = TAU / 6;
    const Ro = Math.min(TOUCH ? 92 : 104, ch * 0.24) * (0.8 + 0.2 * k), Ri = Ro * 0.38;
    const ps = this.w2h(p.x, p.y - 16), cx = clamp(ps.x, Ro + 12, cw - Ro - 12), cy = clamp(ps.y, Ro + 40, ch - Ro - 50);
    c.save(); c.globalAlpha = k;
    c.fillStyle = 'rgba(30,50,80,.2)'; c.fillRect(0, 0, cw, ch);
    c.textAlign = 'center'; c.font = `12px ${FT}`; c.fillStyle = '#9fc6e8'; c.fillText('RALENTI', cx, cy - Ro - 12);
    for (let i = 0; i < 6; i++) {
      const w = p.weapons[i], a0 = -Math.PI / 2 + i * seg - seg / 2 + 0.04, a1 = a0 + seg - 0.08, hov = i === W8.sel, ro = Ro + (hov ? 6 : 0);
      c.beginPath(); c.arc(cx, cy, ro, a0, a1); c.arc(cx, cy, Ri, a1, a0, true); c.closePath();
      c.fillStyle = w.owned ? (hov ? 'rgba(58,32,16,.95)' : 'rgba(12,12,16,.88)') : (hov ? 'rgba(236,230,216,.6)' : 'rgba(216,210,196,.32)'); c.fill();
      c.lineWidth = hov ? 3 : 1.2; c.strokeStyle = hov ? (w.owned ? '#e2792f' : '#cfc8b8') : 'rgba(0,0,0,.55)'; c.stroke();
      const am = -Math.PI / 2 + i * seg, tr = (ro + Ri) / 2, tx = cx + Math.cos(am) * tr, ty = cy + Math.sin(am) * tr;
      weaponIcon(c, w.def.id, tx, ty, (Ro - Ri) * (hov ? 0.86 : 0.78), w.owned ? 'art' : 'rgba(25,25,30,.55)');
      c.font = `10px ${FT}`; c.fillStyle = w.owned ? '#e2792f' : 'rgba(25,25,30,.6)';
      const nx = cx + Math.cos(am) * (ro - 9), ny = cy + Math.sin(am) * (ro - 9) + 3; if (deviceNow() === 'kb') c.fillText(String(i + 1), nx, ny);
      if (!w.owned) lockIcon(c, tx + (Ro - Ri) * 0.3, ty + (Ro - Ri) * 0.2, 'rgba(25,25,30,.7)');
      if (i === p.cur && w.owned) { c.fillStyle = '#7fd18b'; c.beginPath(); c.arc(cx + Math.cos(am) * (Ri + 7), cy + Math.sin(am) * (Ri + 7), 3, 0, TAU); c.fill(); }
    }
    const sw = p.weapons[W8.sel];
    if (sw) {
      const l1 = sw.def.name, l2 = sw.owned ? (W8.sel === p.cur ? 'En main' : `${sw.ammo} / ${sw.def.infinite ? '∞' : sw.reserve} · relâche pour équiper`) : `Non disponible · marché noir $${fmt(sw.def.price)}`;
      c.font = `15px ${FD}`; const w1 = c.measureText(l1).width; c.font = `11px ${FT}`; const w2 = c.measureText(l2).width; const bw = Math.max(w1, w2) + 20, by = cy + Ro + 12;
      c.fillStyle = 'rgba(8,8,10,.85)'; c.fillRect(cx - bw / 2, by, bw, 38);
      c.fillStyle = sw.owned ? '#efe9dc' : '#b8b2a4'; c.font = `15px ${FD}`; c.fillText(l1, cx, by + 16);
      c.fillStyle = sw.owned ? '#f0b25a' : '#8b867b'; c.font = `11px ${FT}`; c.fillText(l2, cx, by + 31);
    }
    c.restore();
  },
  // position de repos des sticks (fixes ou fantômes), en tenant compte du mode gaucher et de l'encoche
  stickHome(side) {
    const cw = innerWidth, ch = innerHeight, mx = Math.max(90, cw * 0.14) + SAFE.l, ax = cw - Math.max(170, cw * 0.24) - SAFE.r, y = ch - 74 - SAFE.b * 0.6;
    const x = side === 'move' ? mx : ax; return { x: Settings.lefty ? cw - x : x, y };
  },
  touchButtons() {
    // disposition « pouce droit » : les actions principales en arc au-dessus du stick de visée,
    // les objets secondaires en petit sur le bord droit ; le haut de l'écran reste libre
    const cw = innerWidth, ch = innerHeight, p = this.player, sz = { petit: 0.86, normal: 1, grand: 1.18 }[Settings.btnSize] || 1, r = Math.round(clamp(ch * 0.066, 21, 31) * sz), rs = Math.round(r * 0.82);
    const home = this.stickHome('aim'), ax = home.x, ay = home.y, Ra = STICK_R + r + 26, L = Settings.lefty;
    const arc = deg => { const a = (L ? 180 - deg : deg) * Math.PI / 180; return { x: ax + Math.cos(a) * Ra, y: ay + Math.sin(a) * Ra }; };
    const side = i => ({ x: L ? rs + 10 + SAFE.l : cw - rs - 10 - SAFE.r, y: Math.max(ch * 0.4, 96) + i * (rs * 2 + 10) });
    const B = (id, at, rr, o) => Object.assign({ id, x: at.x, y: at.y, r: rr }, o);
    return [
      { id: 'pause', x: cw / 2, y: 26, r: 18, label: 'II' },
      { id: 'reload', x: SAFE.l + (cw - SAFE.l - SAFE.r) / 2, y: SAFE.t * 0.5 + ch - SAFE.b - 28 * HUDK, r: Math.round(36 * HUDK), label: '', hide: true },
      B('roll', arc(180), Math.round(r * 1.15), { label: 'ROULADE', cd: p.rollCd > 0 ? p.rollCd / 0.55 : 0 }),
      B('grenade', arc(-142), r, { label: 'G', n: p.grenades, icon: 'grenade' }),
      B('special', arc(-104), Math.round(r * 1.1), { label: CHARS[p.char].sp, cd: p.spCd / p.spMax }),
      B('weapon', arc(-66), r, { label: 'ARME' }),
      ...(() => { const ni = this.nearInteract(); return [B('melee', arc(-28), r, ni ? { label: ni, glow: true } : { label: 'MÊLÉE', cd: p.meleeCd > 0 ? Math.min(1, p.meleeCd / 0.45) : 0 })]; })(),
      B('mine', side(0), rs, { label: 'MINE', n: p.mines, icon: 'mine' }),
      B('decoy', side(1), rs, { label: 'LEURRE', n: p.decoys, icon: 'decoy' })
    ].concat(hasReward('flash') ? [B('flash', side(2), rs, { label: 'FLASH', cd: p.flashCd > 0 ? p.flashCd / 10 : 0 })] : []);
  },
  drawHUD() {
    const c = ctx, K = HUDK, cw = W / DPR / K, ch = H / DPR / K, p = this.player, t = this.time;
    c.setTransform(DPR * K, 0, 0, DPR * K, 0, 0); c.globalAlpha = 1; c.textBaseline = 'alphabetic';
    if (this.input.touchMode) {
      if (this.portrait) { c.fillStyle = 'rgba(5,5,7,.92)'; c.fillRect(0, 0, cw, ch); c.textAlign = 'center'; c.fillStyle = '#d8d2c4'; c.font = `30px ${FD}`; c.fillText('TOURNE TON TÉLÉPHONE', cw / 2, ch / 2 - 10); c.font = `15px ${FT}`; c.fillStyle = '#8b867b'; c.fillText('Le jeu se joue en mode paysage.', cw / 2, ch / 2 + 22); return; }
      c.save(); c.translate(SAFE.l / K, SAFE.t / K * 0.5); this.drawHUDTouch(cw - (SAFE.l + SAFE.r) / K, ch - SAFE.b / K); c.restore(); this.drawHUDShared(cw, ch, true); this.drawInstructor(cw, ch); c.setTransform(DPR, 0, 0, DPR, 0, 0); if (!(this.player.dead && !(this.p1Down > 0) && this.deathT > 0)) this.drawTouchControls(W / DPR, H / DPR); /* mort : rien par-dessus le message */ c.setTransform(DPR * K, 0, 0, DPR * K, 0, 0); this.drawWheel(cw, ch); return;
    }
    const small = cw < 700;
    const S = (small ? 0.72 : 1), coop = !!this.p2;
    // score et multiplicateur, en haut au centre (pas pendant l'entraînement)
    if (this.mode !== 'training') { const m = this.mult, y = small ? 34 : 46; c.font = `${small ? 28 : 40}px ${FD}`; c.textAlign = 'right'; c.fillStyle = '#d8d2c4'; c.fillText(fmt(this.score), cw / 2 + 6, y);
      c.textAlign = 'left'; c.font = `${(small ? 22 : 30) + this.multPulse * 10}px ${FD}`; c.fillStyle = m >= 8 ? '#ff4a2c' : m >= 4 ? '#ff7a3c' : '#e2792f'; c.fillText(m.toFixed(1) + '×', cw / 2 + 20, y);
      c.textAlign = 'center'; c.font = `12px ${FT}`; c.fillStyle = '#8b867b'; let sub = `${fmt(this.kills)} abattus`;
      if (this.mode !== 'training') sub += '   ' + '■'.repeat(Math.max(0, this.lives)) + '□'.repeat(Math.max(0, this.diff.lives - this.lives)); if (this.isCampaign()) sub += `   shibas ${this.shibaFound.size}/${SHIBAS_TOTAL}`;
      c.fillText(sub, cw / 2, y + 20); }
    // panneaux joueurs
    this.drawPanel(p, 1, cw, ch, S, coop ? (this.netGuest ? 'TOI' : 'J1') : '');
    if (coop) this.drawPanel(this.p2, -1, cw, ch, S, this.netGuest ? 'J1' : 'J2');
    // objectif
    const ob = this.objective(); const zn = this.activeZone >= 0 ? ZONES[this.activeZone] : null;
    if (ob.text && !(this.train && this.train.tut)) {
      c.textAlign = 'left'; c.font = `12px ${FT}`; c.fillStyle = '#8b867b'; c.fillText(this.mode === 'secret' ? 'NIVEAU SECRET · LE PARADIS DES SHIBAS' : this.mode === 'hospital' ? (this.hcamp ? 'MISSION 5 · HÔPITAL SAINT-LAZARE' : 'SECTEUR 5 · HÔPITAL SAINT-LAZARE') : this.mode === 'training' ? "CAMP D'ENTRAÎNEMENT" : this.mode === 'survival' ? 'MODE SURVIE · PLACE DE LA MAIRIE' : zn ? `${zn.sub.toUpperCase()} · ${zn.name.toUpperCase()}` : (this.safeName || '').toUpperCase(), 22, small ? 92 : 136);
      c.font = `${small ? 13 : 15}px ${FT}`; c.fillStyle = '#d8d2c4'; wrapText(c, ob.text, 22, small ? 110 : 156, Math.min(380, cw * 0.32), 19);
      if (ob.progress != null) { c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(22, small ? 136 : 196, 240, 5); c.fillStyle = '#7fd18b'; c.fillRect(22, small ? 136 : 196, 240 * ob.progress, 5); }
    }
    // flèche vers l'objectif
    if (ob.tx != null && !p.dead) {
      const s = this.w2h(ob.tx, ob.ty);
      if (s.x < 30 || s.x > cw - 30 || s.y < 30 || s.y > ch - 30) {
        const cx = cw / 2, cy = ch / 2, a = Math.atan2(s.y - cy, s.x - cx), mx = cw / 2 - 60, my = ch / 2 - 150, k = Math.min(mx / Math.abs(Math.cos(a) || 1e-6), my / Math.abs(Math.sin(a) || 1e-6));
        const ax = cx + Math.cos(a) * k, ay = cy + Math.sin(a) * k;
        c.save(); c.translate(ax, ay); c.rotate(a); c.globalAlpha = 0.6 + Math.sin(t * 4) * 0.25; c.fillStyle = '#e2792f'; c.beginPath(); c.moveTo(14, 0); c.lineTo(-8, -9); c.lineTo(-3, 0); c.lineTo(-8, 9); c.closePath(); c.fill(); c.restore(); c.globalAlpha = 1;
      }
    }
    // boss
    const boss = this.bossRef;
    if (boss && !boss.dead && boss.state !== 'intro') {
      const bw2 = Math.min(coop ? 420 : 560, cw - 60), bx2 = (cw - bw2) / 2, by2 = small ? 80 : 100;
      c.textAlign = 'center'; c.font = `${small ? 16 : 20}px ${FD}`; c.fillStyle = '#d8d2c4'; c.fillText(boss.title || "L'ABOMINATION", cw / 2, by2 - 6);
      c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(bx2, by2, bw2, 10); c.fillStyle = boss.phase === 2 ? '#e0321f' : '#8f1c15'; c.fillRect(bx2, by2, bw2 * boss.hp / boss.maxHp, 10);
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(bx2 + bw2 / 2 - 1, by2, 2, 10);
    }
    this.drawHUDShared(cw, ch, small); this.drawInstructor(cw, ch);
    this.drawWheel(cw, ch);
  },
  // panneau d'un joueur, façon Dead Nation : haut (argent, vie, endurance), côté (objets), bas (carrousel d'armes). side = 1 à gauche, -1 à droite (miroir)
  drawPanel(p, side, cw, ch, S, tag) {
    const c = ctx, ox = side > 0 ? 0 : cw, L = side > 0, al = L ? 'left' : 'right', X = (x, w = 0) => L ? x : -x - w;
    const bar = (x, y, w, h, k, col, back = 'rgba(255,255,255,.1)', trail) => { const x0 = X(x, w); c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); RR(c, x0 - 2, y - 2, w + 4, h + 4, (h + 4) / 2); c.fill(); c.fillStyle = back; c.beginPath(); RR(c, x0, y, w, h, h / 2); c.fill(); if (trail != null && trail > 0) { c.fillStyle = 'rgba(240,220,200,.45)'; c.beginPath(); RR(c, x0, y, Math.max(h, w * trail), h, h / 2); c.fill(); } if (k > 0) { c.fillStyle = col; c.beginPath(); RR(c, x0, y, Math.max(h, w * k), h, h / 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x0 + h / 2, y + 1, Math.max(0, w * k - h), Math.max(1, h * 0.28)); } };
    const heart = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.3, y, x - r * 0.9, y - r * 1.1, x, y - r * 0.35); c.bezierCurveTo(x + r * 0.9, y - r * 1.1, x + r * 1.3, y, x, y + r * 0.9); c.fill(); };
    const run = (x, y, col) => { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(x - 6 + i * 5, y - 4); c.lineTo(x - 2 + i * 5, y); c.lineTo(x - 6 + i * 5, y + 4); } c.stroke(); };
    const bw = 230, hpK = Math.max(0, p.hp) / p.maxHp;
    // --- haut
    c.save(); c.translate(ox, 0); c.scale(S, S); c.textAlign = al;
    c.font = `30px ${FD}`; c.fillStyle = '#f0b25a'; const mx = X(22);
    { const ix = L ? 34 : -34; c.fillStyle = '#c98a2a'; c.beginPath(); c.moveTo(ix - 12, 36); c.lineTo(ix + 12, 36); c.lineTo(ix + 8, 26); c.lineTo(ix - 8, 26); c.closePath(); c.fill(); c.fillStyle = '#f7cf6a'; c.fillRect(ix - 7, 27, 14, 3); }
    const money = tag === 'J2' && !this.net ? this.player.money : p.money; c.fillStyle = '#f0b25a'; c.fillText(fmt(money), X(54), 40);
    if (tag) { c.font = `12px ${FT}`; c.fillStyle = tag === 'J2' || tag === 'TOI' ? '#7fb8ff' : '#ff8a72'; c.font = `30px ${FD}`; const mw = c.measureText(fmt(money)).width; c.font = `12px ${FT}`; c.fillText(tag, X(54 + mw + 12), 40); }
    heart(X(30) + (L ? 0 : 0), 58, 8, p.hp < 35 ? '#ff4a2c' : '#e0321f');
    bar(46, 52, bw, 12, hpK, p.hp < 35 ? '#e0321f' : '#b0231c', undefined, Math.max(0, p.hpTrail) / p.maxHp);
    run(X(30), 77, p.exhausted ? '#7a3a1c' : '#c9b26a');
    bar(46, 74, bw, 6, p.stamina / 100, p.exhausted ? '#7a3a1c' : '#c9b26a');
    for (let i = 0; i < 3; i++) { c.fillStyle = i < p.armor ? '#9aa4ae' : 'rgba(255,255,255,.1)'; c.fillRect(X(46 + i * 20, 16), 88, 16, 5); }
    { const spK = 1 - p.spCd / p.spMax, w2 = bw - 70; bar(116, 88, w2 / 2 - 4, 5, p.battery / 100, p.battery < 20 ? '#e0321f' : '#efe3a2'); bar(116 + w2 / 2 + 4, 88, w2 / 2 - 4, 5, spK, spK >= 1 ? '#e2792f' : '#7a4a2a');
      c.font = `10px ${FT}`; c.fillStyle = p.battery < 20 ? '#e0321f' : '#6a665d'; c.textAlign = al; c.fillText(`LAMPE ${Math.round(p.battery)} %`, X(116), 106);
      c.fillStyle = spK >= 1 ? '#f0b25a' : '#6a665d'; c.fillText(`${CHARS[p.char].sp}${tag ? '' : ` [${KL('special')}]`}${spK >= 1 ? ' · PRÊT' : ''}`, X(116 + w2 / 2 + 4), 106); }
    c.restore();
    // --- côté : objets à la verticale
    c.save(); c.translate(ox, ch * 0.4); c.scale(S, S);
    [['grenade', 'grenade', p.grenades], ['mine', 'mine', p.mines], ['decoy', 'decoy', p.decoys]].forEach(([kind, act, n], i) => {
      const y = i * 56, x = X(40);
      c.globalAlpha = n > 0 ? 1 : 0.45; if (n > 0) itemArt(c, kind, x, y, 34); else itemIcon(c, kind, x, y, 34, '#4a463f', false);
      c.textAlign = al; c.font = `18px ${FD}`; c.fillStyle = n > 0 ? '#d8d2c4' : '#5a554c'; c.fillText(String(n), X(64), y + 7);
      if (!tag) { c.font = `10px ${FT}`; c.fillStyle = '#6a665d'; c.textAlign = 'center'; c.fillText(KL(act), x, y + 28); }
      c.globalAlpha = 1;
    });
    c.restore();
    // --- bas : carrousel d'armes (précédente · en main · suivante)
    c.save(); c.translate(ox, ch); c.scale(S, S);
    const owned = p.weapons.map((w, i) => i).filter(i => p.weapons[i].owned), at = Math.max(0, owned.indexOf(p.cur)), n = owned.length;
    const slot = (wi, dx, size, main) => {
      const w = p.weapons[wi], x = X(dx); c.globalAlpha = main ? 1 : 0.55;
      weaponArt(c, w.def.id, x, -78, size);
      c.textAlign = 'center'; const res = w.def.infinite ? '∞' : String(w.reserve);
      if (main) { c.font = `26px ${FD}`; c.fillStyle = w.ammo === 0 ? '#e0321f' : '#d8d2c4'; c.fillText(`${w.ammo}/${res}`, x, -22); c.font = `12px ${FT}`; c.fillStyle = this.weaponFlash > 0 && p === this.player ? '#f0b25a' : '#8b867b'; c.fillText(w.def.name.toUpperCase(), x, -6);
        if (p.reloadT > 0) { const k = 1 - p.reloadT / w.reloadTime(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x - 50, -48, 100, 4); c.fillStyle = '#e2792f'; c.fillRect(x - 50, -48, 100 * k, 4); } }
      else { c.font = `14px ${FD}`; c.fillStyle = '#c6c0b2'; c.fillText(`${w.ammo}/${res}`, x, -28); }
      c.globalAlpha = 1;
    };
    if (n > 1) { slot(owned[(at - 1 + n) % n], 50, 52, false); if (n > 2) slot(owned[(at + 1) % n], 250, 52, false); }
    slot(p.cur, n > 1 ? 150 : 80, 88, true);
    if (n > 1) { c.fillStyle = 'rgba(216,210,196,.35)'; for (const [dx, d] of [[96, -1], [204, 1]]) { if (d > 0 && n < 3) continue; const x = X(dx); c.beginPath(); c.moveTo(x + d * 5, -80); c.lineTo(x - d * 3, -86); c.lineTo(x - d * 3, -74); c.closePath(); c.fill(); } }
    c.restore();
  },
  // Cortana parle dans son micro, en haut à droite ; la bulle sort du micro
  drawInstructor(cw, ch) {
    const s = this.train; if (!s || !s.tut || this.state !== 'playing') return;
    const c = ctx, i = Math.min(s.step, TRAIN_STEPS.length - 1), st = TRAIN_STEPS[i], line = GINETTE[st.id] + (st.id === 'free' ? '' : ' ' + st.t() + '.');
    const touch = this.input.touchMode, small = cw < 760, r = touch || small ? 26 : 40, px = cw - r - (touch ? 18 : 22), py = r + (touch ? 12 : 18), k = Math.min(1, s.stepT * 4);
    const talk = s.stepT < line.length / 55 + 0.2 ? Math.abs(Math.sin(this.time * 15)) : 0;
    c.save(); c.globalAlpha = k;
    // médaillon holographique : IA bleue, carré court, circuits lumineux, lignes de balayage
    const fl = 0.86 + Math.sin(this.time * 23) * 0.05 + (Math.random() < 0.03 ? -0.3 : 0);
    c.fillStyle = 'rgba(4,12,24,.82)'; c.beginPath(); c.arc(px, py, r + 6, 0, TAU); c.fill(); c.strokeStyle = '#5fc8ff'; c.lineWidth = 2.5; c.shadowColor = '#5fc8ff'; c.shadowBlur = 12; c.stroke(); c.shadowBlur = 0;
    c.save(); c.beginPath(); c.arc(px, py, r + 4, 0, TAU); c.clip(); c.globalAlpha = k * fl;
    const glowB = c.createRadialGradient(px, py + r * 0.2, 2, px, py, r * 1.3); glowB.addColorStop(0, 'rgba(90,180,255,.35)'); glowB.addColorStop(1, 'rgba(10,30,60,0)'); c.fillStyle = glowB; c.fillRect(px - r * 1.3, py - r * 1.3, r * 2.6, r * 2.6);
    c.strokeStyle = 'rgba(200,240,255,.9)'; c.lineWidth = 1.6;
    const skin = c.createLinearGradient(px - r, py - r, px + r, py + r); skin.addColorStop(0, '#c8ecff'); skin.addColorStop(0.5, '#6fb8f0'); skin.addColorStop(1, '#2a6fc0');
    c.fillStyle = skin; c.beginPath(); c.moveTo(px - r * 0.9, py + r * 1.3); c.quadraticCurveTo(px - r * 0.85, py + r * 0.8, px - r * 0.3, py + r * 0.72); c.lineTo(px + r * 0.3, py + r * 0.72); c.quadraticCurveTo(px + r * 0.85, py + r * 0.8, px + r * 0.9, py + r * 1.3); c.closePath(); c.fill(); // épaules
    c.fillRect(px - r * 0.17, py + r * 0.35, r * 0.34, r * 0.45); // cou
    c.beginPath(); c.ellipse(px, py + r * 0.02, r * 0.5, r * 0.62, 0, 0, TAU); c.fill(); c.stroke(); // visage
    c.fillStyle = '#16233f'; c.beginPath(); c.moveTo(px - r * 0.62, py + r * 0.42); c.quadraticCurveTo(px - r * 0.78, py - r * 0.75, px, py - r * 0.72); c.quadraticCurveTo(px + r * 0.78, py - r * 0.75, px + r * 0.62, py + r * 0.42); c.lineTo(px + r * 0.44, py + r * 0.4); c.quadraticCurveTo(px + r * 0.5, py - r * 0.35, px + r * 0.05, py - r * 0.42); c.quadraticCurveTo(px - r * 0.42, py - r * 0.2, px - r * 0.44, py + r * 0.4); c.closePath(); c.fill(); // carré court, raie de côté
    c.strokeStyle = 'rgba(110,190,255,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px - r * 0.3, py - r * 0.6); c.quadraticCurveTo(px - r * 0.62, py - r * 0.1, px - r * 0.55, py + r * 0.35); c.stroke();
    c.fillStyle = '#0b2550'; for (const dx of [-0.2, 0.2]) { c.beginPath(); c.ellipse(px + dx * r, py + r * 0.02, r * 0.09, r * 0.05, 0, 0, TAU); c.fill(); } // yeux
    c.fillStyle = '#e8fbff'; for (const dx of [-0.18, 0.22]) { c.fillRect(px + dx * r, py - r * 0.01, 1.5, 1.5); }
    c.strokeStyle = '#1d4f8f'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(px - r * 0.27, py - r * 0.12); c.lineTo(px - r * 0.12, py - r * 0.1); c.moveTo(px + r * 0.12, py - r * 0.1); c.lineTo(px + r * 0.27, py - r * 0.12); c.stroke();
    c.fillStyle = '#3a6fb8'; c.beginPath(); c.ellipse(px, py + r * 0.36, r * 0.11, r * 0.03 + talk * r * 0.07, 0, 0, TAU); c.fill(); // bouche
    c.strokeStyle = 'rgba(20,60,140,.85)'; c.lineWidth = 1.5; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(px + sx * r * 0.12, py + r * 0.75); c.lineTo(px + sx * r * 0.35, py + r * 0.95); c.lineTo(px + sx * r * 0.35, py + r * 1.2); c.moveTo(px + sx * r * 0.55, py + r * 0.85); c.lineTo(px + sx * r * 0.7, py + r * 1.1); c.stroke(); } // circuits
    c.fillStyle = 'rgba(160,230,255,.12)'; for (let yy = py - r - 4; yy < py + r + 4; yy += 3) c.fillRect(px - r - 4, yy, r * 2 + 8, 1); // balayage
    c.restore(); c.globalAlpha = k;
    // micro tenu devant la bouche
    const mx = px - r * 0.95, my = py + r * 0.55;
    c.strokeStyle = '#120c09'; c.lineWidth = r * 0.16; c.lineCap = 'round'; c.beginPath(); c.moveTo(mx + 0.1 * r, my + r * 0.1); c.lineTo(mx + 0.55 * r, my + r * 0.75); c.stroke();
    c.strokeStyle = '#5fc8ff'; c.lineWidth = r * 0.08; c.stroke();
    c.fillStyle = '#16304f'; c.strokeStyle = '#120c09'; c.lineWidth = 2; c.beginPath(); c.arc(mx, my, r * 0.24, 0, TAU); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(200,200,210,.55)'; c.lineWidth = 1; for (let j = -2; j <= 2; j++) { c.beginPath(); c.moveTo(mx + j * r * 0.08, my - r * 0.2); c.lineTo(mx + j * r * 0.08, my + r * 0.2); c.stroke(); }
    if (talk > 0) { c.strokeStyle = 'rgba(95,200,255,.9)'; c.lineWidth = 1.5; for (let j = 1; j <= 2; j++) { c.beginPath(); c.arc(mx, my, r * 0.3 + j * 5 + talk * 3, Math.PI * 0.7, Math.PI * 1.3); c.stroke(); } }
    // bulle qui sort du micro, vers la gauche
    const fs = touch || small ? 12 : 14, lh = fs + 4, bw = touch ? Math.max(200, Math.min(320, cw - r * 2.6 - 60 - (cw / 2 + 28))) : Math.min(420, cw * 0.4); // au tactile : ne déborde pas sur le bouton pause c.font = `${fs}px ${FT}`;
    const all = wrapLines(c, line, bw - 24), n = Math.floor(s.stepT * 55); let left = n; const shown = all.map(l => { const t2 = l.slice(0, Math.max(0, left)); left -= l.length + 1; return t2; });
    const bh = all.length * lh + 30, bx = mx - r * 0.5 - 14 - bw, by = touch ? 8 : Math.max(90, my - bh * 0.35);
    c.fillStyle = 'rgba(8,22,40,.92)'; c.strokeStyle = '#5fc8ff'; c.lineWidth = 2; c.shadowColor = 'rgba(95,200,255,.6)'; c.shadowBlur = 10; c.beginPath(); RR(c, bx, by, bw, bh, 8); c.fill(); c.stroke(); c.shadowBlur = 0;
    { const ex = bx + bw - 1, t1 = by + Math.min(bh - 14, Math.max(10, my - by - 8)), t2 = by + Math.min(bh - 4, Math.max(20, my - by + 8)); c.beginPath(); c.moveTo(ex, t1); c.lineTo(mx - r * 0.3, my); c.lineTo(ex, t2); c.closePath(); c.fill(); c.stroke(); c.fillStyle = 'rgba(8,22,40,.92)'; c.fillRect(ex - 3, t1 + 1, 4, t2 - t1 - 2); }
    c.textAlign = 'left'; c.fillStyle = '#7fd6ff'; c.font = `${fs - 1}px ${FD}`; c.fillText('CORTANA', bx + 12, by + 17);
    c.fillStyle = 'rgba(160,220,255,.55)'; c.font = `10px ${FT}`; c.textAlign = 'right'; c.fillText(st.id === 'free' ? 'terminé' : `étape ${i + 1}/${TRAIN_STEPS.length - 1}`, bx + bw - 10, by + 16);
    c.textAlign = 'left'; c.fillStyle = '#e4f6ff'; c.font = `${fs}px ${FT}`; shown.forEach((l, j) => c.fillText(l, bx + 12, by + 22 + lh * (j + 0.9)));
    c.restore();
  },
  drawHUDTouch(cw, ch) {
    const c = ctx, p = this.player, t = this.time;
    c.textAlign = 'left'; c.font = `20px ${FD}`; c.fillStyle = '#f0b25a'; c.fillText('$ ' + fmt(p.money), 16, 30);
    for (let i = 0; i < this.diff.lives; i++) { c.fillStyle = i < this.lives ? '#b0231c' : 'rgba(255,255,255,.12)'; c.fillRect(16 + i * 14, 38, 9, 9); }
    if (this.isCampaign()) { const sx = 16 + this.diff.lives * 14 + 10; itemIcon(c, 'shiba', sx + 7, 42, 16, '#d9873a'); c.font = `11px ${FT}`; c.textAlign = 'left'; c.fillStyle = '#ffb46a'; c.fillText(`${this.shibaFound.size}/${SHIBAS_TOTAL}`, sx + 18, 47); }
    const bw = Math.min(190, cw * 0.28);
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(16, 56, bw, 9);
    c.fillStyle = 'rgba(240,220,200,.5)'; c.fillRect(16, 56, bw * Math.max(0, p.hpTrail) / p.maxHp, 9);
    c.fillStyle = p.hp < 35 ? '#e0321f' : '#b0231c'; c.fillRect(16, 56, bw * Math.max(0, p.hp) / p.maxHp, 9);
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(16, 69, bw, 4); c.fillStyle = p.exhausted ? '#7a3a1c' : '#c9b26a'; c.fillRect(16, 69, bw * p.stamina / 100, 4);
    for (let i = 0; i < 3; i++) { c.fillStyle = i < p.armor ? '#9aa4ae' : 'rgba(255,255,255,.08)'; c.fillRect(16 + bw + 6, 56 + i * 6, 10, 4); }
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(16, 76, bw, 3); c.fillStyle = p.battery < 20 ? '#e0321f' : '#efe3a2'; c.fillRect(16, 76, bw * p.battery / 100, 3);
    const ob = this.objective();
    this._objB = 0; this._objR = 0; if (ob.text && !(this.wheel && this.wheel.k > 0) && !(this.train && this.train.tut)) { c.font = `12px ${FT}`; c.fillStyle = '#d8d2c4'; wrapText(c, ob.text, 16, 98, Math.min(300, cw * 0.38), 16); const ol = wrapLines(c, ob.text, Math.min(300, cw * 0.38)); this._objB = 98 + ol.length * 16 + (ob.progress != null ? 14 : 0) + SAFE.t / HUDK * 0.5; this._objR = SAFE.l / HUDK + 16 + Math.max(ob.progress != null ? 160 : 0, ...ol.map(l => c.measureText(l).width)); if (ob.progress != null) { c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(16, 128, 160, 4); c.fillStyle = '#7fd18b'; c.fillRect(16, 128, 160 * ob.progress, 4); } }
    if (ob.tx != null && !p.dead) {
      const s = this.w2h(ob.tx, ob.ty);
      if (s.x < 30 || s.x > cw - 30 || s.y < 30 || s.y > ch - 30) {
        const a = Math.atan2(s.y - ch / 2, s.x - cw / 2), k = Math.min((cw / 2 - 70) / Math.abs(Math.cos(a) || 1e-6), (ch / 2 - 60) / Math.abs(Math.sin(a) || 1e-6));
        c.save(); c.translate(cw / 2 + Math.cos(a) * k, ch / 2 + Math.sin(a) * k); c.rotate(a); c.globalAlpha = 0.6 + Math.sin(t * 4) * 0.25; c.fillStyle = '#e2792f'; c.beginPath(); c.moveTo(13, 0); c.lineTo(-7, -8); c.lineTo(-3, 0); c.lineTo(-7, 8); c.closePath(); c.fill(); c.restore(); c.globalAlpha = 1;
      }
    }
    if (this.mode !== 'training') { c.textAlign = 'right'; c.font = `26px ${FD}`; c.fillStyle = '#d8d2c4'; c.fillText(fmt(this.score), cw - 16, 32);
    c.font = `${21 + this.multPulse * 8}px ${FD}`; c.fillStyle = this.mult >= 8 ? '#ff4a2c' : this.mult >= 4 ? '#ff7a3c' : '#e2792f'; c.fillText('×' + this.mult.toFixed(1), cw - 16, 58); }
    const w = p.weapon; c.textAlign = 'center';
    c.font = `22px ${FD}`; c.fillStyle = w.ammo === 0 ? '#e0321f' : '#d8d2c4'; c.fillText(`${w.ammo} / ${w.def.infinite ? '∞' : w.reserve}`, cw / 2, ch - 14);
    if (p.reloadT <= 0 && w.ammo < w.magSize() && (w.def.infinite || w.reserve > 0)) { const tw = c.measureText(`${w.ammo} / ${w.def.infinite ? '∞' : w.reserve}`).width; c.font = `18px ${FD}`; c.fillStyle = `rgba(240,178,90,${0.55 + Math.sin(t * 4) * 0.3})`; c.fillText('↻', cw / 2 + tw / 2 + 14, ch - 15); }
    c.font = `12px ${FT}`; c.fillStyle = this.weaponFlash > 0 ? '#f0b25a' : '#8b867b'; c.fillText(w.def.name.toUpperCase() + (p.reloadT > 0 ? ' · RECHARGE' : ''), cw / 2, ch - 40);
    const boss = this.bossRef;
    if (boss && !boss.dead && boss.state !== 'intro') {
      const bw2 = Math.min(320, cw - 420), bx2 = (cw - bw2) / 2;
      c.font = `13px ${FD}`; c.fillStyle = '#d8d2c4'; c.fillText(boss.title || "L'ABOMINATION", cw / 2, 60);
      c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(bx2, 66, bw2, 7); c.fillStyle = boss.phase === 2 ? '#e0321f' : '#8f1c15'; c.fillRect(bx2, 66, bw2 * boss.hp / boss.maxHp, 7);
    }
  },
  drawTouchControls(cw, ch) {
    const c = ctx, inp = this.input; c.save(); c.globalAlpha = clamp(+Settings.btnAlpha || 1, 0.3, 1);
    for (const b of this.touchButtons()) {
      if (b.hide) continue;
      const down = [...inp.btnPtr.values()].includes(b.id);
      c.fillStyle = down ? 'rgba(226,121,47,.45)' : 'rgba(10,10,12,.5)'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(216,210,196,.35)'; c.lineWidth = 1.5; c.stroke();
      if (b.cd > 0) { c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.moveTo(b.x, b.y); c.arc(b.x, b.y, b.r, -Math.PI / 2, -Math.PI / 2 + TAU * b.cd); c.closePath(); c.fill(); }
      else if (b.glow) { c.strokeStyle = `rgba(127,209,139,${0.6 + Math.sin(this.time * 6) * 0.35})`; c.lineWidth = 3; c.beginPath(); c.arc(b.x, b.y, b.r + 3, 0, TAU); c.stroke(); }
      else if (b.cd === 0) { c.strokeStyle = 'rgba(226,121,47,.9)'; c.lineWidth = 2.5; c.beginPath(); c.arc(b.x, b.y, b.r + 2, 0, TAU); c.stroke(); }
      if (b.icon) { if (b.n > 0) itemArt(c, b.icon, b.x, b.y, b.r * 1.25); else itemIcon(c, b.icon, b.x, b.y, b.r * 1.25, '#5a554c', false); }
      else { c.textAlign = 'center'; c.fillStyle = '#d8d2c4'; c.font = `${b.label.length > 2 ? 13 : 16}px ${FD}`; c.fillText(b.label, b.x, b.y + (b.label.length > 2 ? 5 : 6)); }
      if (b.n != null) { c.fillStyle = b.n > 0 ? '#e2792f' : '#5a554c'; c.beginPath(); c.arc(b.x + b.r * 0.72, b.y - b.r * 0.72, 9, 0, TAU); c.fill(); c.fillStyle = '#0b0b0d'; c.font = `11px ${FD}`; c.fillText(String(b.n), b.x + b.r * 0.72, b.y - b.r * 0.72 + 4); }
    }
    const drawStick = (s, gx, gy, label) => {
      if (s) {
        const v = inp.stickVec(s);
        c.fillStyle = 'rgba(216,210,196,.05)'; c.beginPath(); c.arc(s.ox, s.oy, STICK_R, 0, TAU); c.fill(); c.strokeStyle = 'rgba(216,210,196,.2)'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = 'rgba(216,210,196,.22)'; c.beginPath(); c.arc(s.ox + v.x * STICK_R, s.oy + v.y * STICK_R, 24, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1.5; c.stroke();
        if (s === inp.sticks.aim && v.l > clamp(+Settings.fireAt || 0.6, 0.3, 0.9)) { c.strokeStyle = 'rgba(226,121,47,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(s.ox, s.oy, STICK_R, 0, TAU); c.stroke(); }
      } else {
        c.strokeStyle = 'rgba(216,210,196,.12)'; c.lineWidth = 2; c.beginPath(); c.arc(gx, gy, STICK_R, 0, TAU); c.stroke();
        c.textAlign = 'center'; c.font = `14px ${FD}`; c.fillStyle = 'rgba(216,210,196,.3)'; c.fillText(label, gx, gy + 5);
      }
    };
    { const hm = this.stickHome('move'), ha = this.stickHome('aim'); drawStick(inp.sticks.move, hm.x, hm.y, 'DÉPLACER'); drawStick(inp.sticks.aim, ha.x, ha.y, 'VISER · TIRER'); }
    c.restore();
  },
  drawHUDShared(cw, ch, small) {
    const c = ctx, p = this.player, t = this.time;
    // qualité de la connexion en duo en ligne
    if (this.net && Net.peer && !this.cine && !(this.input.touchMode && this.notices.length)) { const r = Math.round(Net.rtt || 0), col = !r ? '#8b867b' : r < 90 ? '#7fd18b' : r < 180 ? '#f0b25a' : '#ff6a52'; c.textAlign = 'center'; c.font = `10px ${FT}`; c.fillStyle = 'rgba(0,0,0,.5)'; const y = small ? 58 : 60, tx = `${Net.relay ? 'relais' : 'direct'} · ${r ? r + ' ms' : '…'}`, tw = c.measureText(tx).width + 18; c.fillRect(cw / 2 - tw / 2, y - 10, tw, 14); c.fillStyle = col; c.beginPath(); c.arc(cw / 2 - tw / 2 + 7, y - 3, 2.5, 0, TAU); c.fill(); c.fillStyle = '#c6c0b2'; c.fillText(tx, cw / 2 + 4, y + 1); }
    // bannière
    if (this.bannerObj && !this.cine && !(this.wheel && this.wheel.k > 0)) {
      const b = this.bannerObj, a = Math.min(1, b.t * 2, (3.6 - b.t) * 3); c.globalAlpha = a; c.textAlign = 'center';
      const y = ch * 0.3; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, y - 54, cw, 94);
      c.fillStyle = '#b0231c'; c.fillRect(cw / 2 - 40, y - 54, 80, 3);
      grungeTitle(c, b.title.toUpperCase(), cw / 2, y + 2, small ? 34 : 50);
      c.font = `${small ? 13 : 16}px ${FT}`; c.fillStyle = '#c6c0b2'; c.fillText(b.sub, cw / 2, y + 30); c.globalAlpha = 1;
    }
    // bande fine en haut pour les petits événements : au tactile sous le bouton pause, entre les barres de vie et le score et au-dessus de l'objectif ; sur PC sous le score
    if (this.notices.length && !this.cine && !(this.wheel && this.wheel.k > 0) && !(this._achB > 50)) { /* au tactile, attend qu'une carte de succès sur deux lignes soit partie */
      const n = this.notices[0], tu = this.input.touchMode, k = Math.min(1, n.age * 5), pad = tu ? 14 : 18, gap = tu ? 10 : 14;
      const fT = `${tu ? 15 : 20}px ${FD}`, fS = `${tu ? 12 : 14}px ${FT}`, lhT = tu ? 17 : 23, lhS = tu ? 15 : 18;
      const maxW = tu ? cw - 2 * (SAFE.l / HUDK + 228) : Math.min(720, cw - 80), title = n.title.toUpperCase();
      c.font = fT; const tw = c.measureText(title).width; c.font = fS; const sw = n.sub ? c.measureText(n.sub).width + gap : 0;
      const one = tw + sw + pad * 2 <= maxW; /* tout le texte s'affiche : sur une ligne si ça tient, sinon sur plusieurs */
      const mw = tu ? Math.min(maxW, cw - 2 * ((this._objR || 0) + 14)) : maxW; /* sur plusieurs lignes, la bande descend à hauteur de l'objectif : plus étroite */
      c.font = fT; const tl = one ? [title] : wrapLines(c, title, mw - pad * 2); c.font = fS; const sl = one || !n.sub ? [] : wrapLines(c, n.sub, mw - pad * 2);
      const w = one ? tw + sw + pad * 2 : mw, hh = one ? (tu ? 26 : 34) : 10 + tl.length * lhT + sl.length * lhS, x = cw / 2 - w / 2;
      let y = tu ? 54 : small ? 64 : 82; /* PC : sous le score */ if (!tu && this._achH) y += this._achH + 8;
      y -= (1 - k) * 10;
      c.globalAlpha = Math.max(0, Math.min(1, n.t * 3, k)); c.fillStyle = 'rgba(8,8,10,.74)'; c.beginPath(); RR(c, x, y, w, hh, 4); c.fill();
      c.fillStyle = n.color; c.fillRect(x, y, w, 2);
      if (one) {
        const by = y + hh / 2 + (tu ? 5 : 7), x0 = cw / 2 - (tw + sw) / 2; c.textAlign = 'left';
        c.font = fT; c.fillStyle = n.color; c.fillText(title, x0, by);
        if (n.sub) { c.font = fS; c.fillStyle = '#d8d2c4'; c.fillText(n.sub, x0 + tw + gap, by - 1); }
      } else {
        c.textAlign = 'center'; let ly = y + 4;
        c.font = fT; c.fillStyle = n.color; for (const l of tl) c.fillText(l, cw / 2, ly += lhT);
        c.font = fS; c.fillStyle = '#d8d2c4'; for (const l of sl) c.fillText(l, cw / 2, (ly += lhS) - 2);
      }
      c.globalAlpha = 1;
    }
    // fil de messages : en bas au centre sur PC, en haut au centre au tactile
    {
      const touchUI = this.input.touchMode, duo = !!this.p2, fw = Math.min(duo ? (touchUI ? 230 : 340) : touchUI ? 290 : 460, cw * (touchUI ? 0.32 : 0.4)), fx = touchUI ? 12 : cw / 2 - fw / 2;
      c.font = `${duo ? 11 : touchUI ? 12 : small ? 12 : 14}px ${FT}`; c.textAlign = 'left';
      const lh = duo ? 13 : touchUI ? 15 : small ? 15 : 18, cards = (duo ? this.toasts.slice(0, 1) : touchUI ? this.toasts.slice(0, 2) : this.toasts).map(to => { const lines = wrapLines(c, to.msg + (to.n > 1 ? `  ×${to.n}` : ''), fw - 24); /* message entier, jamais coupé */ return { to, lines, h: lines.length * lh + (duo ? 8 : 12) }; });
      let fy = touchUI ? Math.max(92, (this._objB || 0) + 6) : ch - 112; /* au tactile : sous l'objectif */
      for (const cd of cards) {
        const { to, lines, h } = cd, k = Math.min(1, to.age * 5), a = Math.min(1, to.t * 1.5, k);
        const y = touchUI ? fy + (1 - k) * -14 : fy - h + (1 - k) * 14;
        c.globalAlpha = a; c.fillStyle = 'rgba(8,8,10,.74)'; c.beginPath(); RR(c, fx, y, fw, h, 4); c.fill();
        c.fillStyle = to.color; c.fillRect(fx, y, 3, h);
        c.fillStyle = '#e8e2d4'; lines.forEach((l, j) => c.fillText(l, fx + 13, y + 6 + lh * (j + 0.78)));
        fy += touchUI ? h + 5 : -(h + 5);
      }
      c.globalAlpha = 1;
    }
    // carte de succès en haut : au tactile à gauche du bouton pause, ou à droite si le nom n'y tient pas ; sur PC sous le score
    this._achH = 0; this._achB = 0;
    if (this.achCards.length) {
      const tu = this.input.touchMode, a = this.achCards[0], k = Math.min(1, (3.8 - a.t) * 4, a.t * 3), r0 = tu ? 11 : 15, fN = `${tu ? 13 : small ? 15 : 17}px ${FD}`, lhN = tu ? 16 : 20, inner = r0 * 2 + 18;
      c.font = fN; const nw = c.measureText(a.name).width; c.font = `${tu ? 9 : 11}px ${FT}`; const need = inner + 10 + Math.max(nw, c.measureText('SUCCÈS DÉBLOQUÉ').width);
      const roomL = cw / 2 - 36 - (SAFE.l / HUDK + 228), roomR = cw / 2 - 36 - (SAFE.r / HUDK + 130), left = need <= roomL;
      const w = tu ? Math.min(need, left ? roomL : roomR) : Math.min(Math.max(340, need), cw - 40);
      c.font = fN; const nl = wrapLines(c, a.name, w - inner - 10), hh = (tu ? 40 : 56) + (nl.length - 1) * lhN; /* le nom entier, sur deux lignes s'il le faut */
      const x = !tu ? cw / 2 - w / 2 : left ? cw / 2 - 36 - w : cw / 2 + 36, y0 = tu ? 8 : small ? 64 : 82, y = -hh - 8 + k * (hh + 8 + y0);
      if (tu) this._achB = y + hh; else this._achH = hh * Math.max(0, k);
      c.globalAlpha = Math.max(0, k); c.fillStyle = 'rgba(16,12,6,.92)'; c.beginPath(); RR(c, x, y, w, hh, 6); c.fill(); c.strokeStyle = '#ffd23a'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(x + r0 + 10, y + hh / 2, r0, 0, TAU); c.fill(); c.fillStyle = '#1a1206'; c.font = `${tu ? 13 : 18}px ${FD}`; c.textAlign = 'center'; c.fillText('★', x + r0 + 10, y + hh / 2 + (tu ? 5 : 6));
      const tx = x + inner; c.textAlign = 'left'; c.font = `${tu ? 9 : 11}px ${FT}`; c.fillStyle = '#c9b46a'; c.fillText('SUCCÈS DÉBLOQUÉ', tx, y + (tu ? 15 : 22));
      c.font = fN; c.fillStyle = '#f4ead2'; nl.forEach((l, j) => c.fillText(l, tx, y + (tu ? 32 : 43) + j * lhN)); c.globalAlpha = 1;
    }
    // autour du joueur : bulle de réplique et butin au-dessus de la tête, ou en dessous s'ils toucheraient la bannière ; refus en dessous
    if (!p.dead && this.state === 'playing') {
      const sp = this.w2h(p.x, p.y); c.textAlign = 'center';
      let sb = null;
      if (this.speech) { const s = this.speech; c.font = `${small ? 12 : 14}px ${FT}`; const lines = wrapLines(c, s.msg, small ? 190 : 240), lh = small ? 15 : 17; sb = { s, lines, lh, w: Math.max(...lines.map(l => c.measureText(l).width)) + 20, h: lines.length * lh + 12 }; }
      const PH = 21, stackH = (sb ? sb.h + 14 : 0) + this.pops.length * PH + 8, headY = sp.y - 44 / HUDK;
      const bnr = this.bannerObj && !this.cine && !(this.wheel && this.wheel.k > 0) ? [ch * 0.3 - 60, ch * 0.3 + 44] : null;
      const below = (bnr && headY - stackH < bnr[1] && headY > bnr[0]) || headY - stackH < 8;
      let cur = below ? sp.y + 34 / HUDK + (this.hint ? 30 : 0) + (this.denyMsg ? 26 : 0) : headY;
      if (sb) {
        const { s, lines, lh, w, h } = sb; c.font = `${small ? 12 : 14}px ${FT}`; const bx = clamp(sp.x - w / 2, 8, cw - w - 8), by = below ? cur + 10 : cur - h - 10;
        c.globalAlpha = Math.min(1, s.t * 2, (3 - s.t) * 6); c.fillStyle = 'rgba(244,234,210,.95)'; c.beginPath(); RR(c, bx, by, w, h, 8); c.fill();
        c.beginPath(); if (below) { c.moveTo(sp.x - 6, by); c.lineTo(sp.x + 6, by); c.lineTo(sp.x, by - 9); } else { c.moveTo(sp.x - 6, by + h); c.lineTo(sp.x + 6, by + h); c.lineTo(sp.x, by + h + 9); } c.fill();
        c.fillStyle = '#1a120c'; lines.forEach((l, k) => c.fillText(l, bx + w / 2, by + 6 + lh * (k + 0.78))); cur = below ? by + h + 4 : by - 4; c.globalAlpha = 1;
      }
      // le butin : chaque ligne a sa place (plus de lettres les unes sur les autres) et un fond pour rester lisible
      c.font = `bold ${small ? 13 : 15}px ${FT}`;
      this.pops.forEach((po, i) => {
        const k = 1.6 - po.t, j = this.pops.length - 1 - i, y = below ? cur + 18 + j * PH + k * 4 : cur - 8 - j * PH - k * 6;
        const tx = po.msg + (po.n > 1 ? ` ×${po.n}` : ''), hw = c.measureText(tx).width / 2 + 8, px = clamp(sp.x, hw, cw - hw);
        c.globalAlpha = Math.min(1, po.t * 2.5); c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); RR(c, px - hw, y - 15, hw * 2, 20, 5); c.fill();
        c.fillStyle = po.color; c.fillText(tx, px, y);
      });
      c.globalAlpha = 1;
      if (this.denyMsg) { const d = this.denyMsg; c.font = `${small ? 12 : 13}px ${FT}`; const y = sp.y + (this.hint ? 66 : 40), tw = c.measureText(d.msg).width + 16, dx = clamp(sp.x, tw / 2 + 6, cw - tw / 2 - 6); c.globalAlpha = Math.min(1, d.t * 3); c.fillStyle = 'rgba(0,0,0,.6)'; c.beginPath(); RR(c, dx - tw / 2, y - 14, tw, 20, 4); c.fill(); c.fillStyle = d.color; c.fillText(d.msg, dx, y); c.globalAlpha = 1; }
    }
    if (this.hint && !p.dead) { const s = this.w2h(p.x, p.y); c.font = `14px ${FT}`; const tw = c.measureText(this.hint).width + 20; c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(s.x - tw / 2, s.y + 22, tw, 24); c.fillStyle = '#f0b25a'; c.fillText(this.hint, s.x, s.y + 39); }
    // mort
    const downs = this.downPlayers();
    if (downs.length) { const [d, a] = downs[0], meDown = d === p; c.textAlign = 'center'; c.font = `${small ? 15 : 19}px ${FD}`; c.fillStyle = '#ff6a52'; c.fillText(meDown ? (this.p2 && !this.net ? 'J1 À TERRE' : 'TU ES À TERRE') : `${this.pName(d).toUpperCase()} EST À TERRE`, cw / 2, ch * 0.24); c.font = `13px ${FT}`; c.fillStyle = '#c6c0b2';
      c.font = `11px ${FT}`; c.fillText(this.reviveUsed ? 'Retour en fin d\'acte ou de vague' : meDown ? `${this.pName(a)} doit rester 4 s dans ton cercle` : 'Reste 4 s dans son cercle vert', cw / 2, ch * 0.24 + 16); }
    else if (!p.dead) this._deathHit = false;
    if (!downs.length && p.dead && !this.netGuest) {
      // écran de mort : les couleurs se vident, le rouge envahit les bords, puis « TU ES MORT » s'écrase au centre
      const e = 3.4 - this.deathT, a = Math.min(1, e * 0.8), k = Math.min(1, e / 0.6);
      c.save(); c.globalCompositeOperation = 'saturation'; c.globalAlpha = Math.min(1, e * 1.4); c.fillStyle = '#808080'; c.fillRect(0, 0, cw, ch); c.restore();
      c.globalAlpha = a * 0.55; c.fillStyle = '#0c0101'; c.fillRect(0, 0, cw, ch);
      c.globalAlpha = Math.min(1, e * 0.9); c.drawImage(VIG_RED, 0, 0, cw, ch); c.globalAlpha = 1;
      if (e > 0.15) { const dl = this.deathLine || 'TU ES MORT', fs = Math.min(small ? 62 : 120, cw * 0.15, cw * 1.6 / Math.max(6, dl.length)), /* le titre tient toujours en largeur */ s = 1 + (1 - k) * (1 - k) * 1.8, sh = k < 1 ? 0 : Math.max(0, 0.18 - (e - 0.75)) * 40; c.save(); c.translate(cw / 2 + rand(-sh, sh), ch / 2 - fs * 0.05 + rand(-sh, sh)); c.scale(s, s); c.globalAlpha = Math.min(1, (e - 0.15) * 4); c.textAlign = 'center'; grungeTitle(c, dl, 0, fs * 0.35, fs); c.restore(); if (k >= 1 && !this._deathHit) { this._deathHit = true; this.shake(0.5); } }
      if (e > 0.9) { c.globalAlpha = Math.min(1, (e - 0.9) * 2); c.textAlign = 'center'; const fs = Math.min(small ? 62 : 120, cw * 0.15, cw * 1.6 / Math.max(6, (this.deathLine || 'TU ES MORT').length));
        c.font = `${small ? 15 : 20}px ${FD}`; c.fillStyle = '#d8d2c4'; c.fillText(CHARS[this.charKey].fallen, cw / 2, ch / 2 + fs * 0.55);
        c.font = `${small ? 12 : 15}px ${FT}`; c.fillStyle = '#a39e93'; c.fillText(this.lives > 0 ? `${this.lives} vie${this.lives > 1 ? 's' : ''} restante${this.lives > 1 ? 's' : ''} · retour au dernier point de sauvegarde` : 'Plus aucune vie. La nuit a gagné.', cw / 2, ch / 2 + fs * 0.55 + (small ? 22 : 28)); c.globalAlpha = 1; }
    }
    // jauge de tir chargé du J2, autour de lui
    if (this.p2 && !this.p2.dead && this.state === 'playing') {
      const q = this.p2, s2 = this.w2h(q.x, q.y - 16); // plus de réticule : la ligne laser orange suffit
      if (q.charging && q.charge > 0) { c.strokeStyle = q.charge >= 1 ? '#bfe6ff' : 'rgba(191,230,255,.7)'; c.lineWidth = 3; c.beginPath(); c.arc(s2.x, s2.y, 22, -Math.PI / 2, -Math.PI / 2 + TAU * q.charge); c.stroke(); if (q.charge >= 1) { c.font = `11px ${FT}`; c.textAlign = 'center'; c.fillStyle = '#bfe6ff'; c.fillText('CHARGÉ', s2.x, s2.y + 38); } }
    }
    // viseur
    // la ligne laser suffit : plus de viseur (tactile, manette et souris), la jauge du tir chargé entoure le perso
    if (!p.dead) { if (p.charging && p.charge > 0) { const ps = this.w2h(p.x, p.y - 16); c.strokeStyle = p.charge >= 1 ? '#bfe6ff' : 'rgba(191,230,255,.6)'; c.lineWidth = 2.5; c.beginPath(); c.arc(ps.x, ps.y, 22, -Math.PI / 2, -Math.PI / 2 + TAU * p.charge); c.stroke(); } }
  }
});
// version illustrée des armes (style BD : contour encre, métal, bois, détails colorés)
function weaponArt(c, id, x, y, size) {
  c.save(); c.translate(x, y); const u = size, ink = '#120c09';
  c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = Math.max(1.5, u * 0.022);
  const P = (pts, fill) => { c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px * u, py * u) : c.moveTo(px * u, py * u)); c.closePath(); c.fillStyle = fill; c.fill(); c.strokeStyle = ink; c.stroke(); };
  const B = (x0, y0, w, h, fill, r = 0.015) => { c.beginPath(); if (c.roundRect) c.roundRect(x0 * u, y0 * u, w * u, h * u, r * u); else c.rect(x0 * u, y0 * u, w * u, h * u); c.fillStyle = fill; c.fill(); c.strokeStyle = ink; c.stroke(); };
  const O = (cx, cy, rx, ry, fill) => { c.beginPath(); c.ellipse(cx * u, cy * u, rx * u, ry * u, 0, 0, TAU); c.fillStyle = fill; c.fill(); c.strokeStyle = ink; c.stroke(); };
  const shine = (x0, y0, w) => { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = Math.max(1, u * 0.012); c.beginPath(); c.moveTo(x0 * u, y0 * u); c.lineTo((x0 + w) * u, y0 * u); c.stroke(); c.lineWidth = Math.max(1.5, u * 0.022); };
  const M = '#6f7a86', M2 = '#4a525c', MD = '#2c3138', WOOD = '#9a5a2c', WOOD2 = '#6e3c1a';
  switch (id) {
    case 'pistol':
      P([[-0.3, -0.04], [-0.06, -0.04], [-0.12, 0.25], [-0.31, 0.25]], WOOD2);
      c.strokeStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-0.27 * u, (0.03 + k * 0.05) * u); c.lineTo(-0.12 * u, (0.03 + k * 0.05) * u); c.stroke(); }
      B(-0.06, -0.03, 0.1, 0.08, MD); B(-0.32, -0.17, 0.66, 0.15, M); B(0.3, -0.15, 0.06, 0.06, MD);
      c.fillStyle = MD; for (let k = 0; k < 5; k++) c.fillRect((-0.28 + k * 0.035) * u, -0.14 * u, 0.015 * u, 0.09 * u);
      shine(-0.25, -0.145, 0.5); B(-0.31, -0.2, 0.04, 0.03, MD); break;
    case 'shotgun':
      P([[-0.2, -0.1], [-0.52, -0.05], [-0.52, 0.11], [-0.44, 0.11], [-0.16, 0.0]], WOOD);
      c.strokeStyle = 'rgba(60,25,8,.5)'; c.beginPath(); c.moveTo(-0.48 * u, 0); c.lineTo(-0.25 * u, -0.05 * u); c.stroke();
      B(-0.22, -0.12, 0.74, 0.07, M); B(-0.1, -0.05, 0.4, 0.05, M2); B(0.04, -0.04, 0.2, 0.09, WOOD);
      c.strokeStyle = 'rgba(60,25,8,.6)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo((0.07 + k * 0.035) * u, -0.03 * u); c.lineTo((0.07 + k * 0.035) * u, 0.04 * u); c.stroke(); }
      P([[-0.1, -0.05], [-0.02, -0.05], [-0.05, 0.08], [-0.12, 0.08]], WOOD2); shine(-0.18, -0.105, 0.66); B(0.5, -0.13, 0.03, 0.04, '#d0141e'); break;
    case 'smg':
      B(-0.46, -0.09, 0.22, 0.05, MD); B(-0.46, -0.09, 0.05, 0.16, MD);
      B(-0.25, -0.12, 0.48, 0.15, M); B(0.21, -0.08, 0.24, 0.05, M2); B(0.42, -0.1, 0.03, 0.09, MD);
      P([[-0.03, 0.03], [0.08, 0.03], [0.12, 0.3], [0.01, 0.3]], MD);
      c.fillStyle = '#e0a020'; c.fillRect(0.02 * u, 0.06 * u, 0.06 * u, 0.02 * u);
      P([[-0.17, 0.03], [-0.05, 0.03], [-0.11, 0.2], [-0.21, 0.2]], '#3a3f46'); shine(-0.2, -0.1, 0.38);
      c.fillStyle = '#7fd18b'; c.fillRect(-0.02 * u, -0.155 * u, 0.06 * u, 0.03 * u); c.strokeStyle = ink; c.strokeRect(-0.02 * u, -0.155 * u, 0.06 * u, 0.03 * u); break;
    case 'flamer':
      O(-0.31, 0.03, 0.13, 0.21, '#c0392b'); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-0.38 * u, -0.1 * u, 0.03 * u, 0.22 * u);
      c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(-0.31 * u, -0.05 * u); c.lineTo(-0.36 * u, 0.06 * u); c.lineTo(-0.26 * u, 0.06 * u); c.closePath(); c.fill(); c.strokeStyle = ink; c.stroke();
      B(-0.2, -0.07, 0.5, 0.11, M); B(0.28, -0.09, 0.12, 0.15, MD); P([[-0.03, 0.04], [0.07, 0.04], [0.03, 0.21], [-0.07, 0.21]], MD);
      c.strokeStyle = '#2c3138'; c.lineWidth = u * 0.03; c.beginPath(); c.moveTo(-0.22 * u, 0.12 * u); c.quadraticCurveTo(-0.1 * u, 0.22 * u, 0.0 * u, 0.12 * u); c.stroke(); c.lineWidth = Math.max(1.5, u * 0.022);
      P([[0.4, -0.08], [0.6, -0.16], [0.53, -0.02], [0.62, 0.08], [0.4, 0.06]], '#ff7a2a'); P([[0.4, -0.04], [0.52, -0.08], [0.48, 0.0], [0.53, 0.04], [0.4, 0.03]], '#ffd23a'); shine(-0.15, -0.05, 0.4); break;
    case 'rail':
      B(-0.5, -0.09, 1.0, 0.11, '#3a3f58'); B(-0.32, 0.02, 0.52, 0.06, M2); P([[-0.08, 0.06], [0.04, 0.06], [-0.01, 0.23], [-0.12, 0.23]], MD);
      for (let k = 0; k < 4; k++) { B(-0.22 + k * 0.14, -0.15, 0.07, 0.22, '#2a6fb0', 0.01); c.fillStyle = '#9fe4ff'; c.fillRect((-0.205 + k * 0.14) * u, -0.13 * u, 0.04 * u, 0.18 * u); }
      B(0.44, -0.11, 0.08, 0.15, MD); c.fillStyle = '#9fe4ff'; c.beginPath(); c.arc(0.52 * u, -0.035 * u, 0.025 * u, 0, TAU); c.fill(); shine(-0.46, -0.075, 0.9); break;
    case 'rocket':
      B(-0.46, -0.1, 0.76, 0.2, '#5a6b3a'); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-0.46 * u, 0.04 * u, 0.76 * u, 0.06 * u);
      B(-0.5, -0.13, 0.08, 0.26, MD); P([[0.3, -0.13], [0.52, 0], [0.3, 0.13]], '#d0141e'); B(0.26, -0.13, 0.05, 0.26, '#e8e2d4');
      c.fillStyle = '#ffd23a'; c.fillRect(-0.3 * u, -0.1 * u, 0.04 * u, 0.2 * u); c.fillRect(-0.18 * u, -0.1 * u, 0.04 * u, 0.2 * u);
      P([[-0.12, 0.1], [0.0, 0.1], [-0.03, 0.26], [-0.14, 0.26]], MD); B(0.04, -0.19, 0.14, 0.09, MD); c.fillStyle = '#9fe4ff'; c.fillRect(0.14 * u, -0.17 * u, 0.03 * u, 0.05 * u); shine(-0.42, -0.07, 0.66); break;
  }
  c.restore();
}
function weaponIcon(c, id, x, y, size, col) {
  if (col === 'art') return weaponArt(c, id, x, y, size);
  c.save(); c.translate(x, y); const u = size; c.fillStyle = col; c.strokeStyle = col; c.lineJoin = 'round';
  const poly = pts => { c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px * u, py * u) : c.moveTo(px * u, py * u)); c.closePath(); c.fill(); };
  const rect = (x0, y0, w, h) => c.fillRect(x0 * u, y0 * u, w * u, h * u);
  switch (id) {
    case 'pistol': rect(-0.3, -0.16, 0.6, 0.14); poly([[-0.28, -0.03], [-0.04, -0.03], [-0.1, 0.24], [-0.3, 0.24]]); rect(-0.05, -0.02, 0.1, 0.06); break;
    case 'shotgun': rect(-0.2, -0.1, 0.7, 0.07); rect(-0.1, -0.02, 0.34, 0.06); rect(0.06, -0.03, 0.16, 0.08); poly([[-0.2, -0.1], [-0.5, -0.04], [-0.5, 0.1], [-0.16, 0.0]]); break;
    case 'smg': rect(-0.24, -0.11, 0.46, 0.14); rect(0.2, -0.07, 0.22, 0.05); rect(-0.02, 0.02, 0.09, 0.26); poly([[-0.16, 0.02], [-0.04, 0.02], [-0.1, 0.18], [-0.2, 0.18]]); rect(-0.44, -0.08, 0.2, 0.05); rect(-0.44, -0.08, 0.05, 0.14); break;
    case 'flamer':
      c.beginPath(); c.ellipse(-0.3 * u, 0.02 * u, 0.13 * u, 0.2 * u, 0, 0, TAU); c.fill();
      rect(-0.18, -0.06, 0.5, 0.1); rect(0.3, -0.08, 0.1, 0.14); poly([[-0.04, 0.04], [0.06, 0.04], [0.02, 0.2], [-0.08, 0.2]]);
      c.fillStyle = col === 'rgba(25,25,30,.55)' ? col : '#ff8a3a'; poly([[0.4, -0.08], [0.56, -0.14], [0.5, -0.01], [0.58, 0.08], [0.4, 0.06]]); break;
    case 'rail':
      rect(-0.48, -0.08, 0.98, 0.1); rect(-0.3, 0.02, 0.5, 0.06); poly([[-0.08, 0.06], [0.04, 0.06], [-0.02, 0.22], [-0.12, 0.22]]);
      c.fillStyle = col === 'rgba(25,25,30,.55)' ? col : '#6ec3f0'; for (let i = 0; i < 4; i++) rect(-0.2 + i * 0.14, -0.13, 0.06, 0.2); break;
    case 'rocket':
      rect(-0.44, -0.09, 0.74, 0.18); poly([[0.3, -0.12], [0.5, 0], [0.3, 0.12]]); rect(-0.48, -0.12, 0.08, 0.24);
      poly([[-0.1, 0.09], [0.02, 0.09], [-0.02, 0.24], [-0.12, 0.24]]); rect(0.06, -0.17, 0.12, 0.08); break;
  }
  c.restore();
}
// version illustrée des objets (même style BD que les armes)
