// ============================================================ rendu : boss
mixin(Game, {
  drawBossGlow(z) {
    const c = ctx, r = z.r, t = this.time; c.save(); c.globalCompositeOperation = 'lighter'; c.translate(z.x, z.y - (z.jumpZ || 0));
    const glow = (x, y, rr, col, a) => { const gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gr; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill(); };
    if (z.bkind === 'speakerine' && z.state !== 'tvOff') glow(0, -r * 3.1, r * 2.2, z.phase >= 2 ? '255,120,120' : '120,220,210', 0.35);
    if (z.bkind === 'gardien') { const a = t * 6; c.fillStyle = 'rgba(255,160,40,.22)'; c.beginPath(); c.moveTo(0, -r * 2.72); c.arc(0, -r * 2.72, r * 4, a - 0.25, a + 0.25); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, -r * 2.72); c.arc(0, -r * 2.72, r * 4, a + Math.PI - 0.25, a + Math.PI + 0.25); c.closePath(); c.fill(); glow(0, -r * 2.72, r * 0.8, '255,170,60', 0.6); }
    if (z.bkind === 'chirurgien') { const a = z.dir, hx = Math.cos(a) * r * 0.6, hy = -r * 2.6; const gr = c.createRadialGradient(hx, hy, 4, hx, hy, 430); gr.addColorStop(0, 'rgba(240,250,255,.32)'); gr.addColorStop(1, 'rgba(240,250,255,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(hx, hy); c.arc(hx, hy + r * 1.8, 430, a - 0.28, a + 0.28); c.closePath(); c.fill(); glow(hx, hy, r * 0.5, '255,255,230', 0.7); }
    if (this.blackoutT > 0) { c.fillStyle = '#ff3a2a'; c.fillRect(-r * 0.25, -r * 2.4, 5, 4); c.fillRect(r * 0.12, -r * 2.4, 5, 4); glow(0, -r * 2.4, r * 0.7, '255,40,30', 0.4); }
    if (z.weakT > 0) glow(0, -r * 1.25, r * 0.7, '255,210,58', 0.25 + Math.sin(t * 22) * 0.15);
    c.restore();
  },
  drawUltimate(z, ca, sa) {
    const c = ctx, r = z.r, t = this.time, pulse = Math.sin(t * 5) * 2;
    if (z.state === 'windCharge' || z.state === 'windSlam' || z.state === 'spiral') c.translate(rand(-2.5, 2.5), rand(-1, 1));
    c.fillStyle = '#26202e'; c.fillRect(-r * 0.6, -r * 0.6, r * 0.45, r * 0.7); c.fillRect(r * 0.15, -r * 0.6, r * 0.45, r * 0.7);
    c.fillStyle = z.hitFlash > 0 ? '#eee0f0' : '#4a3a5a'; c.beginPath(); c.ellipse(0, -r * 1.2, r * 1.05 + pulse, r * 1.05, 0, 0, TAU); c.fill();
    c.fillStyle = '#d8d0e0'; c.beginPath(); c.ellipse(0, -r * 1.2, r * 0.55, r * 0.6, 0, 0, TAU); c.fill();
    drawShibaSprite(c, -4, -r * 1.0, 1.3, 0); c.strokeStyle = '#c0201a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-r * 0.4, -r * 1.6); c.lineTo(r * 0.4, -r * 0.8); c.moveTo(r * 0.4, -r * 1.6); c.lineTo(-r * 0.4, -r * 0.8); c.stroke();
    c.strokeStyle = '#6a5a7a'; c.lineCap = 'round'; c.lineWidth = r * 0.42;
    c.beginPath(); for (const s2 of [-1, 1]) { const bx = -sa * s2 * r, by = -r * 1.4; c.moveTo(bx, by); c.lineTo(bx + ca * r * 1.5 - sa * s2 * r * 0.4, by + sa * r * 0.9 + Math.sin(t * 3 + s2) * 4); } c.stroke();
    const nx = ca * r * 1.9 + sa * r, ny = -r * 1.5 + sa * r * 0.9;
    c.strokeStyle = '#8a7a5a'; c.lineWidth = 4; c.beginPath(); c.moveTo(ca * r * 1.2, -r * 1.3); c.lineTo(nx, ny - r * 0.9); c.stroke();
    c.strokeStyle = 'rgba(220,220,230,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(nx, ny - r * 1.2, r * 0.45, 0, TAU); c.moveTo(nx - r * 0.45, ny - r * 1.2); c.lineTo(nx + r * 0.45, ny - r * 1.2); c.moveTo(nx, ny - r * 1.65); c.lineTo(nx, ny - r * 0.75); c.stroke();
    c.fillStyle = '#3a2a46'; c.beginPath(); c.arc(ca * r * 0.3, -r * 2.25, r * 0.55, 0, TAU); c.fill();
    c.fillStyle = '#1e1a26'; c.fillRect(ca * r * 0.3 - r * 0.7, -r * 2.6, r * 1.4, r * 0.18); c.fillRect(ca * r * 0.3 - r * 0.42, -r * 3.0, r * 0.84, r * 0.45);
    c.fillStyle = '#1a0806'; c.fillRect(ca * r * 0.3 - 9, -r * 2.05, 18, 5);
    if (z.state === 'stunned') { c.fillStyle = '#f0b25a'; for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; c.fillRect(Math.cos(a) * 24 - 2, -r * 3.2 + Math.sin(a) * 6, 4, 4); } }
  },
  // ---------- boss : une silhouette par boss, plus la rage et le point faible communs
  drawBossKind(z, ca, sa) {
    const c = ctx, r = z.r, t = this.time;
    if (z.state && z.state.startsWith('wind') || z.state === 'whistle' || z.state === 'barriers') c.translate(rand(-1.8, 1.8), rand(-0.8, 0.8));
    if (z.phase >= 2) { const pu = 0.25 + Math.sin(t * 6) * 0.1 + (z.rageT > 0 ? z.rageT * 0.4 : 0); const gr = c.createRadialGradient(0, -r * 1.3, r * 0.3, 0, -r * 1.3, r * 2.1); gr.addColorStop(0, `rgba(255,60,30,${pu})`); gr.addColorStop(1, 'rgba(255,40,20,0)'); c.fillStyle = gr; c.beginPath(); c.arc(0, -r * 1.3, r * 2.1, 0, TAU); c.fill(); }
    this.drawBossTele(z);
    const E = z.state === 'intro' && z.entry, ek = E ? 1 - Math.max(0, z.st) / E.T : 1;
    if (E) {
      // repère au sol : là où il va se tenir
      { const ox = E.tx - z.x, oy = E.ty - z.y + (z.jumpZ || 0), pu = 0.5 + Math.sin(t * 12) * 0.3; c.save(); c.translate(ox, oy); c.scale(1, 0.55); c.strokeStyle = `rgba(${DZ()},${pu})`; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r * 1.6, 0, TAU); c.stroke(); c.restore(); c.fillStyle = `rgba(255,90,60,${pu})`; c.font = '22px Bangers, Impact, sans-serif'; c.textAlign = 'center'; c.fillText('!', ox, oy + 8); }
      if (E.prop === 'metro' || E.prop === 'drawer' || E.prop === 'gore') { c.fillStyle = E.prop === 'gore' ? '#2a0a08' : '#0a0a0c'; c.beginPath(); c.ellipse(0, 0, r * 1.3, r * 0.5, 0, 0, TAU); c.fill(); c.strokeStyle = E.prop === 'metro' ? '#d0a020' : E.prop === 'drawer' ? '#9aa4a8' : '#5a1410'; c.lineWidth = 3; c.stroke(); if (E.prop === 'metro') { c.fillStyle = '#d0a020'; c.font = '14px Bangers, Impact, sans-serif'; c.textAlign = 'center'; c.fillText('M', 0, -r * 0.6); } }
      if (E.prop === 'tvset' && ek < 0.5) { c.fillStyle = '#4a3e36'; RR(c, -r * 0.7, -r * 1.1, r * 1.4, r * 1.0, 6); c.fill(); c.fillStyle = `rgba(160,230,220,${0.5 + Math.random() * 0.5})`; c.fillRect(-r * 0.55, -r * 0.98, r * 1.1, r * 0.72); }
      if (E.prop === 'cables') { c.strokeStyle = '#1a1818'; c.lineWidth = 2; for (const sx of [-r * 0.4, 0, r * 0.4]) { c.beginPath(); c.moveTo(sx, -r * 2.6 - (z.jumpZ || 0) * 0); c.lineTo(sx + Math.sin(t * 3 + sx) * 8, -900); c.stroke(); } }
      if (E.prop === 'gate' && ek < 0.6) { c.save(); c.translate(-r * 1.4, -r * 0.6); c.rotate(-Math.min(1, ek / 0.5) * 1.4); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f0f0f0' : '#d02020'; c.fillRect(i * r * 0.36, -r * 0.08, r * 0.36, r * 0.16); } c.restore(); c.fillStyle = '#3a3a40'; c.fillRect(-r * 1.55, -r * 0.9, r * 0.3, r * 0.9); }
      if (E.prop === 'beacon' && ek < 0.45) { const a = t * 8; c.fillStyle = 'rgba(255,160,40,.35)'; c.beginPath(); c.moveTo(0, -r * 2.7); c.arc(0, -r * 2.7, r * 5, a - 0.3, a + 0.3); c.closePath(); c.fill(); c.fillStyle = '#ffa020'; c.beginPath(); c.arc(0, -r * 2.7, r * 0.22, 0, TAU); c.fill(); }
      if (E.prop === 'lamp' && ek < 0.55) { c.fillStyle = '#fff8d0'; c.beginPath(); c.arc(Math.cos(z.dir) * r * 0.6, -r * 2.65, r * 0.12, 0, TAU); c.fill(); }
    }
    if (E && this.cine && this.cine.b === z) { const ck = Math.min(1, this.cineK || 0); c.save(); c.globalCompositeOperation = 'lighter'; c.translate(0, -r * 1.4); c.rotate(t * 0.4); for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); c.fillStyle = `rgba(255,${z.phase >= 2 ? 90 : 190},90,${0.07 * ck})`; c.beginPath(); c.moveTo(0, 0); c.lineTo(r * 7, -r * 0.5); c.lineTo(r * 7, r * 0.5); c.fill(); } c.restore(); }
    let hide = false;
    if (E) {
      if (E.fx === 'rise') { const u = Math.min(1, ek / 0.75); c.beginPath(); c.rect(-r * 3, -r * 6, r * 6, r * 6); c.clip(); c.translate(0, (1 - u) * r * 3.4); }
      if (E.fx === 'fade') { if (ek < 0.45) hide = true; else c.globalAlpha = Math.min(1, (ek - 0.45) / 0.4) * (!Settings.calm && Math.random() < 0.25 ? 0.4 : 1); }
      if (E.fx === 'tv') { const u = clamp((ek - 0.35) / 0.4, 0.02, 1); c.translate(0, -r * 1.4); c.scale(Math.min(1, 0.3 + u), u); c.translate(0, r * 1.4); if (u < 1) { c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(-r * 1.4, -r * 1.45, r * 2.8, 3 / u); } }
      if (E.fx === 'burst') { const u = E.prop === 'cage' ? (ek < 0.6 ? 0.45 : Math.min(1.12, 0.45 + (ek - 0.6) * 3)) : 1; c.translate(0, 0); c.scale(Math.min(1, u), Math.min(1, u)); if (E.prop === 'cage' && ek < 0.6) c.translate(Math.sin(t * 40) * 3, 0); }
    }
    const fn = { controleur: 'drawControleur', speakerine: 'drawSpeakerine', gardien: 'drawGardien', abomination: 'drawAbomination', chirurgien: 'drawChirurgien', shibanophile: 'drawShibanophile' }[z.bkind];
    if (!hide) this.inkBoss(z, () => { const g2 = ctx; g2.save(); const sq = Math.sin(z.walkT * 2.4) * 0.028 + Math.sin(t * 2.2) * 0.012; g2.scale(1 + sq, 1 - sq); if (fn) this[fn](g2, z, ca, sa, r, t); else this.drawBoss(z, ca, sa); g2.restore(); if (E) this.drawEntryOver(g2, z, E, ek, r, t); });
    if (E) { // neige télé par-dessus le boss
      if (E.prop === 'snow' && ek < 0.85) { for (let i = 0; i < 90; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.75)' : 'rgba(40,40,40,.75)'; c.fillRect(rand(-r * 1.2, r * 1.2), rand(-r * 3.2, 0), 3, 3); } }
    }
    if (z.weakT > 0 && Math.sin(t * 22) > -0.3) { const wy = -r * 1.25; c.strokeStyle = '#ffd23a'; c.lineWidth = 2.5; c.beginPath(); c.arc(0, wy, r * 0.38, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(-r * 0.55, wy); c.lineTo(-r * 0.2, wy); c.moveTo(r * 0.2, wy); c.lineTo(r * 0.55, wy); c.moveTo(0, wy - r * 0.55); c.lineTo(0, wy - r * 0.2); c.moveTo(0, wy + r * 0.2); c.lineTo(0, wy + r * 0.55); c.stroke(); c.fillStyle = '#ffd23a'; c.font = '13px Bangers, Impact, sans-serif'; c.textAlign = 'center'; c.fillText('×2', r * 0.65, wy - r * 0.4); }
    if (z.hitFlash > 0) { c.globalAlpha = 0.45; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, -r * 1.3, r * 1.05, r * 1.35, 0, 0, TAU); c.fill(); c.globalAlpha = 1; }
    if (z.state === 'stunned') { c.fillStyle = '#f0b25a'; for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; c.fillRect(Math.cos(a) * 24 - 2, -r * 3.1 + Math.sin(a) * 6, 4, 4); } }
  },
  // décors d'entrée tenus par le boss (dessinés avec lui, donc encrés)
  drawEntryOver(c, z, E, ek, r, t) {
      if (E.prop === 'car' && ek < 0.92) { const a = Math.atan2(E.ty - E.fy0, E.tx - E.fx0), hor = Math.abs(Math.cos(a)) > 0.5, cx = Math.cos(a) * r * 1.7, cy = Math.sin(a) * r * 0.9 + r * 0.2, w = hor ? 96 : 46, h = hor ? 46 : 96; c.save(); if (ek < 0.72) c.translate(rand(-1.2, 1.2), rand(-0.8, 0.8)); this.drawCar({ x: cx - w / 2, y: cy - h / 2, w, h, z: 24, color: '#3d6a8c', hor, hp: 1, maxHp: 1 }); if (ek < 0.75 && Math.random() < 0.5) { c.fillStyle = '#ffd27a'; c.fillRect(cx + Math.cos(a) * w * 0.5 + rand(-4, 4), cy - 10 + rand(-6, 6), 3, 3); } c.restore(); }
      if (E.prop === 'bed' && ek < 0.78) { c.fillStyle = '#c8ccc8'; RR(c, -r * 1.3, -r * 1.3, r * 2.6, r * 1.0, 6); c.fill(); c.fillStyle = '#e8ece8'; c.beginPath(); c.ellipse(0, -r * 1.45, r * 1.2, r * 0.55, 0, Math.PI, TAU); c.fill(); c.fillStyle = 'rgba(120,10,8,.6)'; c.beginPath(); c.ellipse(r * 0.2, -r * 1.55, r * 0.3, r * 0.15, 0, 0, TAU); c.fill(); c.fillStyle = '#222'; for (const wx of [-r, r]) { c.beginPath(); c.arc(wx, -r * 0.2, 5, 0, TAU); c.fill(); } }
      if (E.prop === 'costume' && ek < 0.72) { const q = r * 1.3; c.fillStyle = '#e09040'; c.beginPath(); c.moveTo(-q * 0.9, -q * 1.6); c.lineTo(-q * 0.7, -q * 2.5); c.lineTo(-q * 0.2, -q * 1.9); c.lineTo(q * 0.2, -q * 1.9); c.lineTo(q * 0.7, -q * 2.5); c.lineTo(q * 0.9, -q * 1.6); c.fill(); c.beginPath(); c.ellipse(0, -q * 1.4, q, q * 0.9, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, -q * 0.5, q * 0.9, q * 0.6, 0, 0, TAU); c.fill(); c.fillStyle = '#fff0dc'; c.beginPath(); c.ellipse(0, -q * 1.1, q * 0.6, q * 0.45, 0, 0, TAU); c.fill(); c.fillStyle = '#1a1210'; c.fillRect(-q * 0.4, -q * 1.55, 5, 5); c.fillRect(q * 0.3, -q * 1.55, 5, 5); c.beginPath(); c.arc(0, -q * 1.25, 4, 0, TAU); c.fill(); if (ek > 0.5) { c.strokeStyle = '#3a2010'; c.lineWidth = 2; c.beginPath(); c.moveTo(-q * 0.2, -q * 0.4); c.lineTo(q * 0.1, -q * 1.0); c.lineTo(-q * 0.1, -q * 1.4); c.stroke(); } }
      if (E.prop === 'cage' && ek < 0.6) { const w = r * 1.5, h = r * 1.6; c.strokeStyle = '#a8acb4'; c.lineWidth = 2.5; c.strokeRect(-w / 2, -h, w, h); c.beginPath(); for (let i = 1; i < 6; i++) { c.moveTo(-w / 2 + i * w / 6, -h); c.lineTo(-w / 2 + i * w / 6, 0); } c.stroke(); }
  },
  // dessine le boss hors écran puis le compose : contour d'encre, lumière en haut, ombre en bas, liseré chaud
  inkBoss(z, draw) {
    const c = ctx, m = c.getTransform(), k = clamp(Math.hypot(m.a, m.b), 0.5, Settings.quality === 'eco' ? 1.1 : TOUCH ? 1.4 : 1.7), r = z.r, Wb = Math.ceil(r * 8 * k), Hb = Math.ceil(r * 7 * k), ox = Wb / 2, oy = Hb * 0.86, t = Math.max(1.6, k * 1.4);
    const I = z._ink || (z._ink = { a: document.createElement('canvas'), sil: document.createElement('canvas'), out: document.createElement('canvas'), at: -1, k: 0 });
    // le boss est recomposé 20 à 30 fois par seconde (sa position, elle, suit chaque image)
    if (this.time - I.at >= (TOUCH ? 1 / 20 : 1 / 30) || Math.abs(I.k - k) > 0.15 || z.hitFlash > 0 && !I.flash) { I.flash = z.hitFlash > 0;
      I.at = this.time; I.k = k;
      for (const cv of [I.a, I.sil, I.out]) if (cv.width !== Wb || cv.height !== Hb) { cv.width = Wb; cv.height = Hb; }
      const { a, sil, out } = I, ac = a.getContext('2d'); ac.setTransform(1, 0, 0, 1, 0, 0); ac.clearRect(0, 0, Wb, Hb); ac.setTransform(k, 0, 0, k, ox, oy);
      const saved = ctx; ctx = ac; try { draw(); } finally { ctx = saved; }
      ac.setTransform(1, 0, 0, 1, 0, 0); ac.globalCompositeOperation = 'source-atop';
      const g1 = ac.createLinearGradient(0, oy - r * 3.4 * k, 0, oy); g1.addColorStop(0, 'rgba(255,244,226,.24)'); g1.addColorStop(0.5, 'rgba(255,244,226,0)'); g1.addColorStop(1, 'rgba(14,4,22,.45)'); ac.fillStyle = g1; ac.fillRect(0, 0, Wb, Hb);
      ac.globalCompositeOperation = 'source-over';
      const sc = sil.getContext('2d'); sc.clearRect(0, 0, Wb, Hb); sc.drawImage(a, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = INK; sc.fillRect(0, 0, Wb, Hb); sc.globalCompositeOperation = 'source-over';
      const oc = out.getContext('2d'); oc.clearRect(0, 0, Wb, Hb);
      // liseré : silhouette chaude décalée vers la lumière, sous le contour
      sc.globalCompositeOperation = 'source-in'; sc.fillStyle = z.phase >= 2 ? '#ff5a32' : '#ffbe78'; sc.fillRect(0, 0, Wb, Hb);
      oc.globalAlpha = 0.85; oc.drawImage(sil, -t * 1.6, -t * 1.6); oc.globalAlpha = 1;
      sc.fillStyle = INK; sc.fillRect(0, 0, Wb, Hb); sc.globalCompositeOperation = 'source-over';
      for (const [dx, dy] of [[t, 0], [-t, 0], [0, t], [0, -t]]) oc.drawImage(sil, dx, dy);
      oc.drawImage(a, 0, 0);
    }
    c.save(); c.scale(1 / k, 1 / k); c.drawImage(I.out, -ox, -oy); c.restore();
  },
  // télégraphes au sol, dessinés sous le boss (coordonnées locales)
  drawBossTele(z) {
    const c = ctx, t = this.time;
    if (z.state === 'windEcho') { const k = 1 - z.st / 0.8; c.save(); c.scale(1, 0.62); c.fillStyle = `rgba(150,220,255,${0.12 + k * 0.25})`; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 320 * (0.3 + k * 0.7), z.echoA - 0.6, z.echoA + 0.6); c.closePath(); c.fill(); c.strokeStyle = 'rgba(190,240,255,.7)'; c.lineWidth = 2; c.stroke(); c.restore(); }
    if (z.state === 'windBlades' && z.bladeA) { c.strokeStyle = `rgba(232,246,255,${0.35 + Math.sin(t * 30) * 0.2})`; c.lineWidth = 2; c.setLineDash([10, 8]); c.beginPath(); for (const a of z.bladeA) { c.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); c.lineTo(Math.cos(a) * 520, Math.sin(a) * 520); } c.stroke(); c.setLineDash([]); }
    if (z.state === 'windRam') { c.strokeStyle = `rgba(255,120,40,${0.5 + Math.sin(t * 20) * 0.3})`; c.lineWidth = 34; c.globalAlpha = 0.25; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(z.ramA) * 700, Math.sin(z.ramA) * 700); c.stroke(); c.globalAlpha = 1; }
    if (z.state === 'windQuake') { for (let i = 1; i <= 3; i++) { c.strokeStyle = `rgba(${DZ()},${0.25 + Math.sin(t * 18 + i) * 0.15})`; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 140 * i, 85 * i, 0, 0, TAU); c.stroke(); } }
    if (z.state === 'absorb') { c.strokeStyle = 'rgba(140,220,110,.55)'; c.lineWidth = 2; for (const o of this.zombies) { if (o === z || o.dead || o.type === 'boss') continue; const dx = o.x - z.x, dy = o.y - z.y; if (dx * dx + dy * dy > 430 * 430) continue; c.beginPath(); c.moveTo(0, -z.r); c.quadraticCurveTo(dx * 0.5 + Math.sin(t * 8 + o.x) * 20, dy * 0.5 - 40, dx, dy - o.r); c.stroke(); } }
  },
  drawControleur(c, z, ca, sa, r, t) {
    const F = col => z.hitFlash > 0 ? '#e8e4f0' : col, sw = Math.sin(z.walkT * 1.2) * r * 0.18, hx = ca * r * 0.5, hy = -r * 2.35 + Math.abs(sa) * r * 0.05;
    c.fillStyle = '#141c30'; c.fillRect(-r * 0.3, -r * 0.95 + sw * 0.3, r * 0.2, r * 0.95); c.fillRect(r * 0.1, -r * 0.95 - sw * 0.3, r * 0.2, r * 0.95);
    c.fillStyle = '#0c0c10'; c.fillRect(-r * 0.36, -r * 0.06 + sw * 0.3, r * 0.32, r * 0.12); c.fillRect(r * 0.06, -r * 0.06 - sw * 0.3, r * 0.32, r * 0.12);
    const arm = (sd, punch) => { const bx = -sa * sd * r * 0.5, by = -r * 2.0, ex = bx + ca * r * 0.7 - sa * sd * r * 0.15, ey = -r * 0.25 + Math.sin(t * 2 + sd) * 3; c.strokeStyle = F('#1f2c4a'); c.lineWidth = r * 0.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + ca * r * 0.5, -r * 1.2, ex, ey); c.stroke();
      if (punch) { const op = z.state === 'whistle' ? 0.5 : (Math.sin(t * 8) > 0 ? 0.35 : 0.05); c.save(); c.translate(ex, ey); c.rotate(Math.atan2(sa, ca)); c.fillStyle = '#8a9096'; c.fillRect(-r * 0.2, -r * 0.22, r * 0.5, r * 0.2); c.save(); c.rotate(op); c.fillStyle = '#b8bec4'; c.fillRect(-r * 0.2, -r * 0.02, r * 0.55, r * 0.16); c.restore(); c.fillStyle = '#3a3e42'; c.beginPath(); c.arc(-r * 0.15, -r * 0.05, r * 0.08, 0, TAU); c.fill(); c.restore(); }
      else { c.fillStyle = F('#7e9a7a'); c.beginPath(); c.arc(ex, ey, r * 0.13, 0, TAU); c.fill(); } };
    if (sa < 0) { arm(1, true); arm(-1, false); }
    c.fillStyle = F('#1f2c4a'); c.beginPath(); c.moveTo(-r * 0.5, -r * 2.15); c.quadraticCurveTo(hx * 0.6, -r * 2.55, r * 0.5, -r * 2.15); c.lineTo(r * 0.42, -r * 0.85); c.lineTo(-r * 0.42, -r * 0.85); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(160,180,220,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-r * 0.1, -r * 2.15); c.lineTo(0, -r * 1.6); c.lineTo(r * 0.1, -r * 2.15); c.stroke();
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-r * 0.42, -r * 1.05, r * 0.84, r * 0.06); c.fillStyle = '#d8c060'; for (let i = 0; i < 4; i++) c.fillRect(-r * 0.04, -r * 1.95 + i * r * 0.22, r * 0.07, r * 0.07);
    c.fillStyle = '#2aa0a0'; c.beginPath(); c.arc(-r * 0.24, -r * 1.85, r * 0.08, 0, TAU); c.fill();
    c.save(); c.translate(-sa * r * 0.5 - ca * r * 0.1, -r * 1.2); c.fillStyle = '#5a3a22'; RR(c, -r * 0.24, -r * 0.18, r * 0.48, r * 0.38, 3); c.fill(); c.fillStyle = '#e8e0c8'; for (let i = 0; i < 4; i++) { c.save(); c.rotate(-0.3 + i * 0.2); c.fillRect(-r * 0.12 + i * 3, -r * 0.34, r * 0.12, r * 0.2); c.restore(); } c.restore();
    c.fillStyle = F('#7e9a7a'); c.beginPath(); c.arc(hx, hy, r * 0.4, 0, TAU); c.fill();
    c.fillStyle = '#ff3a2a'; if (sa > -0.5) { c.fillRect(hx + ca * r * 0.1 - r * 0.2, hy - r * 0.02, 3, 3); c.fillRect(hx + ca * r * 0.1 + r * 0.08, hy - r * 0.02, 3, 3); }
    c.fillStyle = '#c8ccd0'; c.beginPath(); c.ellipse(hx + ca * r * 0.32, hy + r * 0.22, r * 0.14, r * 0.07, 0, 0, TAU); c.fill(); c.strokeStyle = '#b0231c'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx + ca * r * 0.3, hy + r * 0.25); c.quadraticCurveTo(hx, hy + r * 0.7, -r * 0.2, -r * 1.9); c.stroke();
    c.fillStyle = '#16203a'; c.beginPath(); c.ellipse(hx, hy - r * 0.25, r * 0.48, r * 0.24, 0, Math.PI, TAU); c.fill(); c.fillRect(hx - r * 0.48, hy - r * 0.3, r * 0.96, r * 0.12); c.fillStyle = '#d0a020'; c.fillRect(hx - r * 0.44, hy - r * 0.36, r * 0.88, r * 0.07); c.fillStyle = '#0c1222'; c.beginPath(); c.ellipse(hx + ca * r * 0.32, hy - r * 0.2, r * 0.34, r * 0.1, 0, 0, TAU); c.fill();
    if (sa >= 0) { arm(-1, false); arm(1, true); }
  },
  drawSpeakerine(c, z, ca, sa, r, t) {
    const F = col => z.hitFlash > 0 ? '#f0e0ea' : col, bob = Math.sin(t * 2.2) * 4;
    c.translate(0, -r * 0.35 + bob);
    c.strokeStyle = '#1a1818'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const x0 = -r * 0.5 + i * r * 0.2, w = Math.sin(t * 3 + i * 1.3) * r * 0.25; c.beginPath(); c.moveTo(x0, -r * 0.6); c.bezierCurveTo(x0 + w, -r * 0.3, x0 - w, -r * 0.1, x0 + w * 0.6, r * 0.25); c.stroke(); if (Math.random() < 0.08) { c.fillStyle = '#bfe6ff'; c.beginPath(); c.arc(x0 + w * 0.6, r * 0.25, 2.5, 0, TAU); c.fill(); } }
    c.fillStyle = F('#8a2a5a'); c.beginPath(); c.moveTo(-r * 0.35, -r * 1.65); c.lineTo(r * 0.35, -r * 1.65); c.quadraticCurveTo(r * 0.95, -r * 0.9, r * 0.75, -r * 0.6); c.lineTo(-r * 0.75, -r * 0.6); c.quadraticCurveTo(-r * 0.95, -r * 0.9, -r * 0.35, -r * 1.65); c.fill();
    for (let i = 0; i < 14; i++) { const a = Math.sin(t * 5 + i * 2.7); if (a < 0.3) continue; c.fillStyle = `rgba(255,230,250,${a})`; c.fillRect(-r * 0.6 + (i * 37 % 100) / 100 * r * 1.2, -r * 1.5 + (i * 53 % 100) / 100 * r * 0.85, 2, 2); }
    c.fillStyle = F('#9ab08a'); c.beginPath(); c.ellipse(0, -r * 1.75, r * 0.5, r * 0.2, 0, 0, TAU); c.fill();
    const ma = z.state === 'windEcho' ? z.echoA : Math.atan2(sa, ca), mx = Math.cos(ma) * r * 0.95, my = -r * 1.5 + Math.sin(ma) * r * 0.4;
    c.strokeStyle = F('#9ab08a'); c.lineWidth = r * 0.14; c.lineCap = 'round'; c.beginPath(); c.moveTo(r * 0.4 * Math.sign(ca || 1), -r * 1.75); c.lineTo(mx, my); c.stroke();
    c.strokeStyle = '#2a2a2e'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + Math.cos(ma) * 6, my + r * 1.2); c.stroke(); c.fillStyle = '#3a3a40'; c.beginPath(); c.arc(mx + Math.cos(ma) * 8, my - 6, 6, 0, TAU); c.fill(); c.fillStyle = '#888'; c.beginPath(); c.arc(mx + Math.cos(ma) * 8, my - 6, 3, 0, TAU); c.fill();
    const tw = r * 1.35, th = r * 1.0, ty = -r * 2.3; c.strokeStyle = '#2a2a2e'; c.lineWidth = 2; c.beginPath(); c.moveTo(-tw * 0.1, ty - th * 0.5); c.lineTo(-tw * 0.35, ty - th * 1.0); c.moveTo(tw * 0.1, ty - th * 0.5); c.lineTo(tw * 0.38, ty - th * 0.95); c.stroke();
    c.fillStyle = F('#4a3e36'); RR(c, -tw / 2, ty - th / 2, tw, th, 8); c.fill(); c.fillStyle = '#2a221e'; c.fillRect(-tw / 2 + 4, ty + th / 2 - 8, tw - 8, 6); c.fillStyle = '#c8a050'; c.beginPath(); c.arc(tw / 2 - 9, ty + th / 2 - 14, 3, 0, TAU); c.arc(tw / 2 - 9, ty + th / 2 - 24, 3, 0, TAU); c.fill();
    const sx = -tw / 2 + 6, sy = ty - th / 2 + 6, swd = tw - 24, sh = th - 20; c.save(); c.beginPath(); RR(c, sx, sy, swd, sh, 6); c.clip();
    if (z.phase >= 2) { const cols = ['#e8e8e8', '#e8e030', '#30e0e0', '#30e030', '#e030e0', '#e03030', '#3030e0']; cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(sx + i * swd / 7, sy, swd / 7 + 1, sh * 0.7); }); c.fillStyle = '#111'; c.fillRect(sx, sy + sh * 0.7, swd, sh * 0.3); c.fillStyle = '#ff3a2a'; c.fillRect(sx + swd * 0.35, sy + sh * 0.25, swd * 0.3, sh * 0.2); }
    else { c.fillStyle = z.state === 'tvOff' ? '#0a0a0a' : '#7fc8c0'; c.fillRect(sx, sy, swd, sh); if (z.state !== 'tvOff') { c.fillStyle = '#1a3a38'; c.beginPath(); c.ellipse(sx + swd * 0.32, sy + sh * 0.38, 3, 4, 0, 0, TAU); c.ellipse(sx + swd * 0.68, sy + sh * 0.38, 3, 4, 0, 0, TAU); c.fill(); c.strokeStyle = '#1a3a38'; c.lineWidth = 2; c.beginPath(); c.arc(sx + swd / 2, sy + sh * 0.6, swd * 0.16, 0.2, Math.PI - 0.2); c.stroke(); c.fillStyle = '#b0234a'; c.fillRect(sx + swd * 0.38, sy + sh * 0.68, swd * 0.24, 3); } }
    c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 5; i++) c.fillRect(sx, sy + ((t * 60 + i * 13) % sh), swd, 1.5); c.restore();
  },
  drawGardien(c, z, ca, sa, r, t) {
    const F = col => z.hitFlash > 0 ? '#f0f0d0' : col, sw = Math.sin(z.walkT * 1.4) * r * 0.12;
    for (const sd of [-1, 1]) { const lx = sd * r * 0.42, ly = sd * sw; c.fillStyle = '#2c2e30'; c.fillRect(lx - r * 0.18, -r * 0.6 + ly, r * 0.36, r * 0.6); c.fillStyle = '#e0b020'; c.beginPath(); c.arc(lx, ly - 2, r * 0.24, 0, TAU); c.fill(); c.fillStyle = '#2a2a2a'; c.fillRect(lx - r * 0.24, ly - 4, r * 0.48, 4); }
    const bar = () => { const a = Math.atan2(sa, ca) + Math.sin(t * 3) * 0.15 + (z.state === 'barriers' ? -0.8 + (0.6 - z.st) * 2.5 : 0); c.save(); c.translate(sa >= 0 ? r * 0.9 : -r * 0.9, -r * 1.3); c.rotate(a); const L = r * 2.4; for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f0f0f0' : '#d02020'; c.fillRect(i * L / 8, -r * 0.09, L / 8 + 0.5, r * 0.18); } c.fillStyle = '#e8e030'; c.beginPath(); c.arc(L, 0, r * 0.12, 0, TAU); c.fill(); c.restore(); };
    if (sa < 0) bar();
    c.fillStyle = F('#c8b020'); RR(c, -r * 0.95, -r * 2.05, r * 1.9, r * 1.5, r * 0.35); c.fill();
    c.fillStyle = F('#b0b0a4'); c.fillRect(-r * 0.95, -r * 1.5, r * 1.9, r * 0.14); c.fillRect(-r * 0.95, -r * 1.15, r * 1.9, r * 0.14);
    c.fillStyle = 'rgba(60,50,20,.35)'; c.fillRect(-r * 0.05, -r * 2.05, r * 0.1, r * 1.5); c.fillStyle = 'rgba(90,70,30,.4)'; c.beginPath(); c.ellipse(r * 0.4, -r * 1.75, r * 0.2, r * 0.1, 0.4, 0, TAU); c.fill();
    c.strokeStyle = '#9a9a9a'; c.lineWidth = 1.4; for (let i = 0; i < 9; i++) { const kx = -r * 0.5 + i * r * 0.08 + Math.sin(t * 6 + i) * 1.5; c.beginPath(); c.moveTo(-r * 0.4, -r * 0.75); c.lineTo(kx, -r * 0.45 + (i % 3) * 3); c.stroke(); } c.fillStyle = '#c0c0b0'; c.beginPath(); c.arc(-r * 0.4, -r * 0.75, 3, 0, TAU); c.fill();
    c.fillStyle = F('#7a8a6a'); RR(c, -r * 0.38 + ca * r * 0.1, -r * 2.6, r * 0.76, r * 0.6, r * 0.18); c.fill();
    c.fillStyle = '#ff3a2a'; if (sa > -0.5) { c.fillRect(ca * r * 0.1 - r * 0.2, -r * 2.35, 4, 3); c.fillRect(ca * r * 0.1 + r * 0.1, -r * 2.35, 4, 3); }
    c.fillStyle = '#2a2a2a'; c.fillRect(-r * 0.22, -r * 2.68, r * 0.44, r * 0.1);
    const on = Math.sin(t * 10) > 0; c.fillStyle = on ? '#ffa020' : '#c06010'; c.beginPath(); c.arc(0, -r * 2.72, r * 0.2, Math.PI, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(-r * 0.06, -r * 2.86, r * 0.07, r * 0.1);
    if (sa >= 0) bar();
  },
  drawAbomination(c, z, ca, sa, r, t) {
    const F = col => z.hitFlash > 0 ? '#f0e0d8' : col, pulse = Math.sin(t * 5) * 2, sw = Math.sin(z.walkT * 1.1) * r * 0.12;
    for (const [lx, d] of [[-r * 0.55, 1], [0, -1], [r * 0.55, 1]]) { c.fillStyle = '#3a2620'; c.fillRect(lx - r * 0.17, -r * 0.6 + sw * d, r * 0.34, r * 0.6); }
    c.save(); c.translate(0, -r * 2.2); c.fillStyle = F('#a88a3a'); c.beginPath(); c.moveTo(-r * 0.4, r * 0.3); c.quadraticCurveTo(-r * 0.42, -r * 0.45, 0, -r * 0.5); c.quadraticCurveTo(r * 0.42, -r * 0.45, r * 0.4, r * 0.3); c.closePath(); c.fill(); c.fillStyle = '#6a5020'; c.fillRect(-r * 0.46, r * 0.22, r * 0.92, r * 0.1); c.restore();
    const blobs = [[-r * 0.45, -r * 1.25, r * 0.7, '#7a5a4e'], [r * 0.4, -r * 1.35, r * 0.75, '#6a4e44'], [0, -r * 0.95, r * 0.8, '#8a6656'], [r * 0.05, -r * 1.65, r * 0.62, '#76584a']];
    for (const [bx, by, br, col] of blobs) { c.fillStyle = F(col); c.beginPath(); c.ellipse(bx, by, br + pulse * 0.5, br * 0.85, 0, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(30,10,8,.6)'; c.lineWidth = 1.5; for (const [x0, y0, x1, y1] of [[-r * 0.2, -r * 1.7, -r * 0.1, -r * 0.8], [r * 0.3, -r * 1.9, r * 0.45, -r * 1.0]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); for (let k = 0; k < 5; k++) { const u = k / 4, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.stroke(); } }
    c.save(); c.translate(0, -r * 1.3); c.rotate(-0.6); const sh = r * 0.22; for (const [col, k] of [['#2a4aa0', -1], ['#f0f0f0', 0], ['#c02a2a', 1]]) { c.fillStyle = col; c.fillRect(-r * 1.1, k * sh / 3 - sh / 6, r * 2.2, sh / 3 + 0.5); } c.restore();
    c.strokeStyle = F('#6d5a50'); c.lineCap = 'round'; for (const [sd, w, L, ph] of [[-1, 0.42, 1.7, 0], [1, 0.36, 1.5, 1], [-1, 0.18, 0.9, 2], [1, 0.2, 1.0, 3]]) { const small = w < 0.3, bx = -sa * sd * r * (small ? 0.4 : 1.0), by = small ? -r * 2.0 : -r * 1.4; c.lineWidth = r * w; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + ca * r * L - sa * sd * r * 0.3, by + sa * r * L * 0.55 + Math.sin(t * (small ? 6 : 3) + ph) * (small ? 8 : 4) - (small ? r * 0.4 : 0)); c.stroke(); }
    const lit = z.phase >= 3 ? 4 : z.phase >= 2 ? 2 + Math.floor((1 - z.hp / z.maxHp) * 4) : 0;
    [[-r * 0.55, -r * 2.15], [-r * 0.2, -r * 2.45], [r * 0.25, -r * 2.4], [r * 0.6, -r * 2.05]].forEach(([hx, hy], i) => { const hh = r * (0.22 + (i % 2) * 0.04); c.fillStyle = F(['#7a8a6a', '#6a7a5a', '#86967a', '#727e60'][i]); c.beginPath(); c.arc(hx, hy + Math.sin(t * 2 + i) * 2, hh, 0, TAU); c.fill(); c.fillStyle = i < lit ? '#ff2a1a' : '#1a1210'; c.fillRect(hx - hh * 0.5, hy - 1, 2.5, 2.5); c.fillRect(hx + hh * 0.2, hy - 1, 2.5, 2.5); c.fillStyle = '#2a0a08'; c.fillRect(hx - hh * 0.3, hy + hh * 0.35, hh * 0.6, 2); });
    const hx = ca * r * 0.3, hy = -r * 1.95; c.fillStyle = F('#5a3a32'); c.beginPath(); c.arc(hx, hy, r * 0.4, 0, TAU); c.fill(); c.fillStyle = '#1a0806'; c.beginPath(); c.ellipse(hx + ca * r * 0.08, hy + r * 0.15, r * 0.2, r * (z.state === 'absorb' ? 0.18 : 0.08), 0, 0, TAU); c.fill(); c.fillStyle = '#ff3a2a'; c.fillRect(hx - r * 0.2, hy - r * 0.12, 4, 3); c.fillRect(hx + r * 0.1, hy - r * 0.12, 4, 3);
  },
  drawChirurgien(c, z, ca, sa, r, t) {
    const F = col => z.hitFlash > 0 ? '#e0f0ec' : col, sw = Math.sin(z.walkT * 1.3) * r * 0.15;
    c.save(); c.translate(-ca * r * 1.0, -sa * r * 0.4); c.strokeStyle = '#8a9498'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -r * 2.9); c.moveTo(-r * 0.3, -r * 2.9); c.lineTo(r * 0.3, -r * 2.9); c.moveTo(-r * 0.3, 0); c.lineTo(r * 0.3, 0); c.stroke(); c.fillStyle = 'rgba(190,230,200,.75)'; RR(c, r * 0.1, -r * 2.85, r * 0.3, r * 0.45, 4); c.fill(); c.strokeStyle = 'rgba(190,230,200,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(r * 0.25, -r * 2.4); c.quadraticCurveTo(r * 0.6, -r * 1.8, ca * r * 1.1, -r * 1.6); c.stroke(); c.restore();
    c.fillStyle = '#26302c'; c.fillRect(-r * 0.24, -r * 1.0 + sw * 0.4, r * 0.14, r * 1.0); c.fillRect(r * 0.1, -r * 1.0 - sw * 0.4, r * 0.14, r * 1.0);
    const tools = ['scalpel', 'scie', 'pince', 'seringue', 'scalpel', 'pince'];
    const arms = back => { for (let i = 0; i < 6; i++) { const sd = i % 2 ? 1 : -1, row = Math.floor(i / 2); if ((sd * sa < 0) !== back) continue; const bx = -sa * sd * r * 0.35, by = -r * (1.9 - row * 0.3), ang = Math.atan2(sa, ca) + sd * (0.5 + row * 0.45) + Math.sin(t * 4 + i) * 0.15 + (z.state === 'windBlades' ? -sd * 0.4 : 0), L = r * (1.1 - row * 0.1), mx = bx + Math.cos(ang) * L * 0.55, my = by + Math.sin(ang) * L * 0.3 - r * 0.25, ex = bx + Math.cos(ang) * L, ey = by + Math.sin(ang) * L * 0.55;
      c.strokeStyle = F('#8aa48a'); c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, by); c.lineTo(mx, my); c.lineTo(ex, ey); c.stroke();
      c.save(); c.translate(ex, ey); c.rotate(ang); const k = tools[i];
      if (k === 'scalpel') { c.fillStyle = '#e8eef2'; c.beginPath(); c.moveTo(12, 0); c.lineTo(2, -2.5); c.lineTo(2, 2.5); c.fill(); c.fillStyle = '#4a5458'; c.fillRect(-4, -1.5, 7, 3); }
      else if (k === 'scie') { c.fillStyle = '#b8c0c4'; c.fillRect(0, -3, 14, 6); c.fillStyle = '#5a6468'; for (let j = 0; j < 5; j++) c.fillRect(1 + j * 3, 3, 2, 2); }
      else if (k === 'pince') { c.strokeStyle = '#c8d0d4'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(11, -3); c.moveTo(0, 0); c.lineTo(11, 3); c.stroke(); }
      else { c.fillStyle = 'rgba(220,240,240,.9)'; c.fillRect(0, -2.5, 10, 5); c.fillStyle = '#6aff8a'; c.fillRect(1, -1.5, 6, 3); c.fillStyle = '#e8eef2'; c.fillRect(10, -0.6, 5, 1.2); }
      c.restore(); } };
    arms(true);
    c.fillStyle = F('#3f7a68'); c.beginPath(); c.moveTo(-r * 0.4, -r * 2.05); c.quadraticCurveTo(ca * r * 0.4, -r * 2.4, r * 0.4, -r * 2.05); c.lineTo(r * 0.5, -r * 0.85); c.quadraticCurveTo(0, -r * 0.7, -r * 0.5, -r * 0.85); c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,10,8,.7)'; c.beginPath(); c.ellipse(-r * 0.12, -r * 1.35, r * 0.18, r * 0.25, 0.3, 0, TAU); c.fill(); c.beginPath(); c.ellipse(r * 0.22, -r * 1.0, r * 0.1, r * 0.14, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-r * 0.02, -r * 2.0, r * 0.04, r * 1.1);
    const hx = ca * r * 0.6, hy = -r * 2.35; c.strokeStyle = F('#8aa48a'); c.lineWidth = r * 0.16; c.beginPath(); c.moveTo(0, -r * 2.05); c.lineTo(hx * 0.8, hy + r * 0.15); c.stroke();
    c.fillStyle = F('#8aa48a'); c.beginPath(); c.ellipse(hx, hy, r * 0.34, r * 0.4, 0, 0, TAU); c.fill();
    c.fillStyle = '#2f7a6a'; c.beginPath(); c.ellipse(hx, hy - r * 0.22, r * 0.38, r * 0.24, 0, Math.PI, TAU); c.fill(); c.fillRect(hx - r * 0.38, hy - r * 0.26, r * 0.76, r * 0.08);
    c.fillStyle = '#9fd0d8'; c.beginPath(); c.moveTo(hx - r * 0.3, hy + r * 0.02); c.lineTo(hx + r * 0.3, hy + r * 0.02); c.lineTo(hx + r * 0.22, hy + r * 0.35); c.lineTo(hx - r * 0.22, hy + r * 0.35); c.fill();
    c.fillStyle = '#ff3a2a'; if (sa > -0.5) { c.fillRect(hx - r * 0.16, hy - r * 0.08, 3, 3); c.fillRect(hx + r * 0.08, hy - r * 0.08, 3, 3); }
    c.fillStyle = '#fff8d0'; c.beginPath(); c.arc(hx + ca * r * 0.12, hy - r * 0.3, r * 0.1, 0, TAU); c.fill(); c.strokeStyle = '#2a2a2a'; c.lineWidth = 1.5; c.beginPath(); c.arc(hx, hy - r * 0.15, r * 0.36, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    arms(false);
  },
  drawShibanophile(c, z, ca, sa, r, t) {
    const F = col => z.hitFlash > 0 ? '#f6ece0' : col, sw = Math.sin(z.walkT * 1.1) * r * 0.1;
    c.save(); c.translate(-ca * r * 0.25, -r * 2.05); const cw = r * 1.3, chh = r * 0.95; c.fillStyle = 'rgba(40,40,46,.85)'; c.fillRect(-cw / 2, -chh / 2, cw, chh); c.strokeStyle = '#8a8e96'; c.lineWidth = 1.6; c.strokeRect(-cw / 2, -chh / 2, cw, chh); c.beginPath(); for (let i = 1; i < 6; i++) { const x = -cw / 2 + i * cw / 6; c.moveTo(x, -chh / 2); c.lineTo(x, chh / 2); } c.stroke();
    c.save(); c.translate(cw / 2, -chh / 2); c.rotate(Math.max(0, Math.sin(t * 2.5)) * 0.9); c.strokeStyle = '#a8acb4'; c.strokeRect(0, 0, cw * 0.4, chh); c.restore(); c.restore();
    for (const sd of [-1, 1]) { c.fillStyle = '#2a2026'; c.fillRect(sd * r * 0.35 - r * 0.2, -r * 0.65 + sd * sw, r * 0.4, r * 0.65); c.fillStyle = '#141014'; c.fillRect(sd * r * 0.35 - r * 0.24, -r * 0.08 + sd * sw, r * 0.48, r * 0.1); }
    c.fillStyle = F('#7a5a3e'); c.beginPath(); c.ellipse(0, -r * 1.3, r * 1.08, r * 0.95, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(40,24,14,.45)'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 40; i++) { const a = i * 2.39, d = (i % 9) / 9 * r * 0.95, x = Math.cos(a) * d, y = -r * 1.3 + Math.sin(a) * d * 0.85; c.moveTo(x, y); c.lineTo(x + 2, y + 4); } c.stroke();
    for (const [px, py, s] of [[-r * 0.55, -r * 1.55, 1], [r * 0.5, -r * 1.6, 0.9], [-r * 0.15, -r * 0.95, 1.1], [r * 0.55, -r * 0.95, 0.85], [-r * 0.65, -r * 0.9, 0.8]]) { const q = r * 0.2 * s; c.fillStyle = '#e09040'; c.beginPath(); c.moveTo(px - q * 0.9, py - q * 0.2); c.lineTo(px - q * 0.7, py - q * 1.3); c.lineTo(px - q * 0.1, py - q * 0.7); c.lineTo(px + q * 0.1, py - q * 0.7); c.lineTo(px + q * 0.7, py - q * 1.3); c.lineTo(px + q * 0.9, py - q * 0.2); c.fill(); c.beginPath(); c.arc(px, py, q, 0, TAU); c.fill(); c.fillStyle = '#fff0dc'; c.beginPath(); c.ellipse(px, py + q * 0.35, q * 0.6, q * 0.45, 0, 0, TAU); c.fill(); c.fillStyle = '#1a1210'; c.fillRect(px - q * 0.45, py - q * 0.15, 2, 2); c.fillRect(px + q * 0.3, py - q * 0.15, 2, 2); c.fillRect(px - 1, py + q * 0.15, 2, 1.5); c.strokeStyle = 'rgba(80,40,20,.7)'; c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.arc(px, py, q * 1.05, 0, TAU); c.stroke(); c.setLineDash([]); }
    const hx = ca * r * 0.25, hy = -r * 2.35; const whip = z.state === 'windLeash' ? -1.2 + (0.5 - z.st) * 5 : Math.sin(t * 2) * 0.4;
    c.save(); c.translate(-sa * r * 0.9 + ca * r * 0.4, -r * 1.45); c.strokeStyle = '#ff5ad0'; c.lineWidth = 2.5; c.shadowColor = '#ff5ad0'; c.shadowBlur = 8; c.beginPath(); c.moveTo(0, 0); for (let i = 1; i <= 8; i++) { const u = i / 8; c.lineTo(Math.cos(Math.atan2(sa, ca) + whip * u) * r * 1.6 * u, Math.sin(Math.atan2(sa, ca) + whip * u) * r * 0.8 * u + Math.sin(t * 6 + u * 6) * 4 * u); } c.stroke(); c.restore();
    c.fillStyle = F('#e6c8b0'); c.beginPath(); c.arc(hx, hy, r * 0.46, 0, TAU); c.fill(); c.fillStyle = F('#d8b49a'); c.beginPath(); c.arc(hx, hy + r * 0.28, r * 0.32, 0, Math.PI); c.fill();
    c.fillStyle = '#5a3a24'; c.beginPath(); c.ellipse(hx, hy - r * 0.32, r * 0.5, r * 0.26, 0, Math.PI, TAU); c.fill(); c.fillRect(hx - r * 0.52, hy - r * 0.36, r * 1.04, r * 0.14); c.strokeStyle = 'rgba(30,18,10,.5)'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 10; i++) { const x = hx - r * 0.45 + i * r * 0.1; c.moveTo(x, hy - r * 0.36); c.lineTo(x + 1, hy - r * 0.48); } c.stroke();
    if (sa > -0.5) for (const sd of [-1, 1]) { const ex = hx + ca * r * 0.1 + sd * r * 0.18, ey = hy - r * 0.02; c.fillStyle = '#fff'; c.beginPath(); c.arc(ex, ey, r * 0.12, 0, TAU); c.fill(); c.strokeStyle = z.phase >= 2 ? '#e0201a' : '#7a2a8a'; c.lineWidth = 1.2; c.beginPath(); for (let k = 0; k < 24; k++) { const a = k * 0.5 + t * 6 * sd, d = k / 24 * r * 0.11; if (k === 0) c.moveTo(ex, ey); else c.lineTo(ex + Math.cos(a) * d, ey + Math.sin(a) * d); } c.stroke(); }
    c.fillStyle = '#c0c8d0'; c.fillRect(hx + ca * r * 0.1 - 2, hy + r * 0.2, r * 0.3 * (ca >= 0 ? 1 : -1), 4);
  },
  drawBoss(z, ca, sa) {
    const c = ctx, r = z.r, t = this.time, pulse = Math.sin(t * 5) * 2;
    if (z.state === 'windCharge' || z.state === 'windSlam') c.translate(rand(-2.5, 2.5), rand(-1, 1));
    c.fillStyle = '#2a1e1b'; c.fillRect(-r * 0.6, -r * 0.6, r * 0.45, r * 0.7); c.fillRect(r * 0.15, -r * 0.6, r * 0.45, r * 0.7);
    const C = z.cfg || {};
    c.fillStyle = z.hitFlash > 0 ? '#e8d8d0' : C.body || '#5a3c34'; c.beginPath(); c.ellipse(0, -r * 1.2, r * 1.1 + pulse, r * 1.05, 0, 0, TAU); c.fill();
    c.fillStyle = C.blob || '#7a4a3e'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(Math.cos(i * 1.1 + t) * r * 0.6, -r * 1.2 + Math.sin(i * 1.7) * r * 0.5, 5 + (i % 3) * 2, 0, TAU); c.fill(); }
    c.strokeStyle = '#6d5a50'; c.lineCap = 'round'; c.lineWidth = r * 0.45;
    const reach = z.state === 'windSlam' ? -r * 0.8 : 0;
    c.beginPath(); for (const s of [-1, 1]) { const bx = -sa * s * r * 1.0, by = -r * 1.4; c.moveTo(bx, by); c.lineTo(bx + ca * r * 1.5 - sa * s * r * 0.4, by + sa * r * 0.9 + reach + Math.sin(t * 3 + s) * 4); } c.stroke();
    c.fillStyle = C.head || '#4a302a'; c.beginPath(); c.arc(ca * r * 0.3, -r * 2.25, r * 0.55, 0, TAU); c.fill();
    c.fillStyle = '#1a0806'; c.fillRect(ca * r * 0.3 - 8, -r * 2.05, 16, 5);
    if (C.cap) { c.fillStyle = C.cap; c.beginPath(); c.ellipse(ca * r * 0.3, -r * 2.62, r * 0.6, r * 0.22, 0, 0, TAU); c.fill(); c.fillRect(ca * r * 0.3 - r * 0.45, -r * 2.85, r * 0.9, r * 0.25); }
    c.fillStyle = '#ff3a2a'; c.fillRect(ca * r * 0.3 - 9, -r * 2.35, 4, 3); c.fillRect(ca * r * 0.3 + 5, -r * 2.35, 4, 3);
    if (C.surgeon) { const hx = ca * r * 0.3; c.fillStyle = '#8fc4c8'; c.beginPath(); c.moveTo(hx - r * 0.45, -r * 2.2); c.lineTo(hx + r * 0.45, -r * 2.2); c.lineTo(hx + r * 0.32, -r * 1.86); c.lineTo(hx - r * 0.32, -r * 1.86); c.fill(); c.fillStyle = 'rgba(120,10,8,.7)'; c.fillRect(hx - 4, -r * 2.05, 9, 4);
      for (const sd of [-1, 1]) { const bx = -sa * sd * r * 1.0 + ca * r * 1.5 - sa * sd * r * 0.4, by = -r * 1.4 + sa * r * 0.9 + Math.sin(t * 3 + sd) * 4; c.fillStyle = '#d8e0e4'; c.save(); c.translate(bx, by); c.rotate(z.dir + sd * 0.3); c.fillRect(2, -1.5, 16, 3); c.fillStyle = '#3a4448'; c.fillRect(-4, -2, 7, 4); c.restore(); } }
    if (z.state === 'stunned') { c.fillStyle = '#f0b25a'; for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; c.fillRect(Math.cos(a) * 22 - 2, -r * 3 + Math.sin(a) * 6, 4, 4); } }
  }
});
