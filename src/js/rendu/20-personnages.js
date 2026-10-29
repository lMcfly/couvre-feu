// ============================================================ rendu : personnages et zombies
mixin(Game, {
  // couleur propre à chaque joueur (solo : blanc chaud ; duo : J1 rouge, J2 bleu)
  playerCol(p) { return !this.p2 ? '255,236,200' : p.isP2 ? '110,180,255' : '255,110,90'; },
  // visibilité renforcée : anneau au sol + liseré lumineux autour du perso
  drawPlayerVis(p) {
    if (Settings.vis !== 'renforcee') { this.drawPlayer(p); return; }
    const c = ctx, col = this.playerCol(p), pu = 0.75 + Math.sin(this.time * 4) * 0.2;
    c.save(); c.translate(p.x, p.y); c.scale(1, 0.5); c.fillStyle = `rgba(${col},.18)`; c.beginPath(); c.arc(0, 4, 26, 0, TAU); c.fill(); c.strokeStyle = `rgba(${col},${pu})`; c.lineWidth = 4.5; c.stroke(); c.restore();
    c.save(); c.shadowColor = `rgba(${col},1)`; c.shadowBlur = 14 * DPR; this.drawPlayer(p); c.restore();
  },
  // par-dessus le décor : repère du perso quand il passe derrière une voiture ou un mur
  drawPlayerMarkers() {
    if (Settings.vis !== 'renforcee') return; const c = ctx;
    for (const q of this.players()) { if (!q || q.dead || q.hidden) continue; const col = this.playerCol(q), hidden = this.level.queryRect(q.x - 20, q.y - 10, 40, 60).some(o => o.kind !== 'building' && o.z > 20 && q.y < o.y + o.h && q.y > o.y - o.z - 10 && q.x > o.x - 8 && q.x < o.x + o.w + 8);
      c.save(); c.translate(q.x, q.y); if (hidden) { c.globalAlpha = 0.85; c.strokeStyle = `rgb(${col})`; c.lineWidth = 2.5; c.setLineDash([5, 4]); c.beginPath(); c.ellipse(0, -16, 11, 18, 0, 0, TAU); c.stroke(); c.setLineDash([]); c.beginPath(); c.arc(Math.cos(q.aim) * 2, -36, 6, 0, TAU); c.stroke(); }
      c.globalAlpha = 1; c.fillStyle = `rgb(${col})`; c.strokeStyle = INK; c.lineWidth = 2; const by = -58 + Math.sin(this.time * 5) * 2.5; c.beginPath(); c.moveTo(0, by + 11); c.lineTo(-8, by); c.lineTo(8, by); c.closePath(); c.fill(); c.stroke(); c.restore(); }
  },
  drawPlayer(p) {
    const c = ctx; c.save(); c.translate(p.x, p.y);
    if (p.rollT > 0) { const k = 1 - p.rollT / ROLL_T; c.translate(0, -12); c.rotate(k * TAU * (Math.cos(p.rollDir) >= 0 ? 1 : -1)); c.scale(1, 0.85); c.translate(0, 12); }
    if (p.inv > 0 && Math.floor(this.time * 20) % 2) c.globalAlpha = 0.5;
    if (p.playDead > 0) { c.globalAlpha = 0.45 + Math.sin(this.time * 6) * 0.1; }
    c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(0, 2, 14, 6, 0, 0, TAU); c.fill();
    const a = p.aim, ca = Math.cos(a), sa = Math.sin(a), sw = Math.sin(p.walkT) * 4;
    c.fillStyle = '#1e2126'; c.fillRect(-7, -9 + sw * 0.3, 5, 10); c.fillRect(2, -9 - sw * 0.3, 5, 10);
    const id = p.weapon.def.id, len = { pistol: 13, shotgun: 24, smg: 19, flamer: 25, rail: 29, rocket: 30 }[id], thick = id === 'rocket' ? 6 : id === 'flamer' ? 5 : 3.5;
    const gun = () => {
      c.save(); c.translate(0, -16); c.rotate(a); c.translate(-p.recoil * 3, 0);
      c.fillStyle = id === 'rail' ? '#2c3e4a' : id === 'flamer' ? '#4a3a22' : '#1a1b1e'; c.fillRect(4, -thick / 2, len, thick);
      if (id === 'flamer') { c.fillStyle = '#7a2a1a'; c.fillRect(2, 3, 9, 6); } if (id === 'rail') { c.fillStyle = '#5ab0e0'; c.fillRect(10, -1, len - 10, 2); }
      c.fillStyle = '#c9a98a'; c.beginPath(); c.arc(7, 0, 3, 0, TAU); c.fill();
      c.restore();
    };
    if (sa < 0) gun();
    const hx = ca * 2;
    if (p.char === 'zeus') {
      c.fillStyle = '#e8e2d4'; c.beginPath(); c.ellipse(0, -17, 12, 12.5, 0, 0, TAU); c.fill(); c.fillStyle = '#3d6a3a'; c.fillRect(-8, -22, 16, 14);
      if (p.carry) { c.fillStyle = '#a3261d'; c.fillRect(-ca * 12 - 5, -22, 10, 13); }
      c.fillStyle = '#e0b08a'; c.beginPath(); c.arc(hx, -31, 7.5, 0, TAU); c.fill();
      c.fillStyle = '#f2f0ea'; c.beginPath(); c.arc(hx - ca * 1.5, -36, 7.8, Math.PI, TAU); c.fill(); if (sa > -0.3) { c.beginPath(); c.ellipse(hx + ca * 2, -26, 6.5, 6, 0, 0, Math.PI); c.fill(); }
      c.strokeStyle = '#5aa04a'; c.lineWidth = 2.2; c.beginPath(); c.arc(hx, -32, 8.5, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    } else if (p.char === 'dobby') {
      c.fillStyle = '#c9b98a'; c.beginPath(); c.ellipse(0, -15, 9.5, 10.5, 0, 0, TAU); c.fill(); c.fillStyle = '#a3261d'; c.fillRect(-7, -6, 5, 5); c.fillStyle = '#2a5aa8'; c.fillRect(2, -6, 5, 5);
      if (p.carry) { c.fillStyle = '#a3261d'; c.fillRect(-ca * 11 - 5, -20, 10, 12); }
      c.fillStyle = '#cdb8a0'; c.beginPath(); c.moveTo(hx - 6, -30); c.lineTo(hx - 17, -35); c.lineTo(hx - 5, -26); c.closePath(); c.fill(); c.beginPath(); c.moveTo(hx + 6, -30); c.lineTo(hx + 17, -35); c.lineTo(hx + 5, -26); c.closePath(); c.fill();
      c.beginPath(); c.arc(hx, -29, 7.5, 0, TAU); c.fill();
      if (sa > -0.3) { c.fillStyle = '#2e7a50'; c.fillRect(hx + ca * 2 - 4.5, -30, 3, 3); c.fillRect(hx + ca * 2 + 1.5, -30, 3, 3); }
    } else if (p.char === 'chewie') {
      c.fillStyle = '#7a4a2a'; c.beginPath(); c.ellipse(0, -18, 14, 14, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(40,20,10,.6)'; c.lineWidth = 1.5; c.beginPath(); for (let i = -10; i <= 10; i += 5) { c.moveTo(i, -28); c.lineTo(i + 2, -8); } c.stroke();
      if (p.carry) { c.fillStyle = '#a3261d'; c.fillRect(-ca * 14 - 5, -24, 10, 13); }
      c.fillStyle = '#6a3e22'; c.beginPath(); c.arc(hx, -34, 8.5, 0, TAU); c.fill(); if (sa > -0.3) { c.fillStyle = '#a06a40'; c.beginPath(); c.ellipse(hx + ca * 2, -32, 5, 4, 0, 0, TAU); c.fill(); }
      c.fillStyle = '#e8d9a0'; c.beginPath(); c.ellipse(hx, -40, 10, 3.5, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(hx, -42, 6, 4, 0, Math.PI, TAU); c.fill();
      c.fillStyle = '#2a2a30'; c.fillRect(hx - 9, -30, 18, 2.5);
    } else if (p.char === 'dragon') {
      c.fillStyle = '#4a1e5e'; c.beginPath(); c.moveTo(-14, -6); c.lineTo(14, -6); c.lineTo(10, -28); c.lineTo(-10, -28); c.closePath(); c.fill();
      c.fillStyle = '#1e1a26'; c.beginPath(); c.ellipse(0, -17, 10, 12, 0, 0, TAU); c.fill();
      if (p.carry) { c.fillStyle = '#a3261d'; c.fillRect(-ca * 12 - 5, -22, 10, 13); }
      c.fillStyle = '#2a1a36'; c.beginPath(); c.arc(hx - ca * 2, -32, 8.5, 0, TAU); c.fill();
      c.fillStyle = '#e6d8dc'; c.beginPath(); c.arc(hx + ca * 1.5, -31, 6.6, 0, TAU); c.fill();
      c.fillStyle = '#111'; c.beginPath(); c.moveTo(hx - 6, -36); c.lineTo(hx - 9, -46); c.lineTo(hx - 3, -38); c.closePath(); c.fill(); c.beginPath(); c.moveTo(hx + 6, -36); c.lineTo(hx + 9, -46); c.lineTo(hx + 3, -38); c.closePath(); c.fill();
      if (sa > -0.3) { c.fillStyle = '#f0c040'; c.fillRect(hx + ca * 2 - 4.5, -31, 3, 1.8); c.fillRect(hx + ca * 2 + 1.5, -31, 3, 1.8); }
    } else if (p.char === 'fiona') {
      c.fillStyle = '#d6a92a'; c.beginPath(); c.ellipse(0, -17, 11, 12.5, 0, 0, TAU); c.fill();
      c.fillStyle = '#8a6a14'; c.fillRect(-1, -27, 2, 18);
      if (p.carry) { c.fillStyle = '#a3261d'; c.fillRect(-ca * 12 - 5, -22, 10, 13); }
      c.fillStyle = '#3a2c26'; c.beginPath(); c.arc(hx - ca * 3, -33, 8.5, 0, TAU); c.fill(); c.beginPath(); c.arc(hx - ca * 2, -41, 4.5, 0, TAU); c.fill();
      c.fillStyle = '#aeb79c'; c.beginPath(); c.arc(hx + ca * 1.5, -31, 6.8, 0, TAU); c.fill();
      if (sa > -0.3) { c.fillStyle = 'rgba(110,70,130,.8)'; c.fillRect(hx + ca * 2 - 4.5, -31, 3, 1.5); c.fillRect(hx + ca * 2 + 1.5, -31, 3, 1.5); }
    } else {
      c.fillStyle = '#8a2a1e'; c.beginPath(); c.ellipse(0, -17, 12, 12, 0, 0, TAU); c.fill();
      c.fillStyle = '#d9a93c'; c.fillRect(-11, -20, 22, 2.5); c.fillStyle = '#2e7a50'; c.fillRect(-11, -16, 22, 2.5);
      if (p.carry) { c.fillStyle = '#a3261d'; c.fillRect(-ca * 12 - 5, -22, 10, 13); }
      c.fillStyle = '#b57a4f'; c.beginPath(); c.arc(hx, -31, 7.5, 0, TAU); c.fill();
      if (sa > -0.3) { c.fillStyle = '#1b1d20'; c.fillRect(hx + ca * 2 - 4, -28.5, 8, 2); }
      c.fillStyle = '#c9963a'; c.beginPath(); c.ellipse(hx, -36, 13, 5, 0, 0, TAU); c.fill();
      c.fillStyle = '#d9a93c'; c.beginPath(); c.ellipse(hx, -39, 6, 5, 0, Math.PI, TAU); c.fill(); c.fillStyle = '#a3261d'; c.fillRect(hx - 6, -39.5, 12, 2);
    }
    if (sa >= 0) gun();
    drawAccessoryTop(c, currentAcc(p.char), ca * 2, -31);
    if (p.meleeT > 0) { c.strokeStyle = `rgba(230,220,200,${p.meleeT * 3})`; c.lineWidth = 3; c.beginPath(); c.arc(0, -10, 44, a - 1.1, a + 1.1); c.stroke(); }
    c.restore();
  },
  drawTarget(z) {
    const c = ctx, ink = '#120c09', hit = z.hitFlash > 0; c.save(); c.translate(z.x, z.y);
    c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(0, 3, 20, 8, 0, 0, TAU); c.fill();
    if (z.rail) { c.strokeStyle = 'rgba(160,150,130,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(z.rail.ax - z.x, z.rail.ay - z.y); c.lineTo(z.rail.bx - z.x, z.rail.by - z.y); c.stroke(); }
    c.lineWidth = 2.5; c.strokeStyle = ink; c.fillStyle = '#6e4a2a'; c.fillRect(-9, -6, 4, 8); c.strokeRect(-9, -6, 4, 8); c.fillRect(5, -6, 4, 8); c.strokeRect(5, -6, 4, 8);
    // silhouette de zombie en carton
    c.fillStyle = hit ? '#fff3d6' : '#c9a46a'; c.beginPath(); c.moveTo(-16, -6); c.lineTo(-14, -34); c.lineTo(-22, -40); c.lineTo(-18, -46); c.lineTo(-8, -42); c.arc(0, -52, 9, Math.PI * 0.85, Math.PI * 0.15); c.lineTo(10, -42); c.lineTo(22, -44); c.lineTo(24, -38); c.lineTo(14, -34); c.lineTo(16, -6); c.closePath(); c.fill(); c.stroke();
    for (const [r, col] of [[11, '#e8e0cc'], [8, '#b0231c'], [5, '#e8e0cc'], [2.5, '#b0231c']]) { c.fillStyle = col; c.beginPath(); c.arc(0, -24, r, 0, TAU); c.fill(); }
    c.strokeStyle = ink; c.lineWidth = 1.5; c.beginPath(); c.arc(0, -24, 11, 0, TAU); c.stroke();
    if (z.hp < z.maxHp) { c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(-14, -66, 28, 4); c.fillStyle = '#f0b25a'; c.fillRect(-14, -66, 28 * Math.max(0, z.hp) / z.maxHp, 4); }
    c.restore();
  },
  drawZombie(z) {
    if (z.target) return this.drawTarget(z);
    const c = ctx, r = z.r, t = z.walkT; c.save(); c.translate(z.x, z.y);
    let rise = 1; if (z.spawnT > 0) { rise = 1 - z.spawnT / z.spawnMax; c.globalAlpha = Math.min(1, rise * 1.6); }
    c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(0, 2, r * 1.1, r * 0.5, 0, 0, TAU); c.fill();
    if (z.spawnT > 0 && z.spawnKind === 'sewer') { c.beginPath(); c.rect(-r * 3, -r * 5, r * 6, r * 5); c.clip(); c.translate(0, (1 - rise) * r * 3.2); }
    const ca = Math.cos(z.dir), sa = Math.sin(z.dir), sw = Math.sin(t) * r * 0.35;
    if (z.type === 'brute' && z.bState === 'wind') c.translate(rand(-1.5, 1.5), 0);
    if (z.type === 'boss' && z.jumpZ > 0) { c.translate(0, -z.jumpZ); c.scale(1 + z.jumpZ / 600, 1 + z.jumpZ / 600); }
    if (z.type === 'boss') { this.drawBossKind(z, ca, sa); c.restore(); return; }
    if (z.type === 'riot') { this.drawRiot(z, ca, sa, sw); c.restore(); return; }
    if (z.type === 'dog') { this.drawDog(z, ca, sa); c.restore(); return; }
    c.fillStyle = z.pants; c.fillRect(-r * 0.5, -r * 0.62 + sw * 0.2, r * 0.38, r * 0.72); c.fillRect(r * 0.12, -r * 0.62 - sw * 0.2, r * 0.38, r * 0.72);
    const armLen = r * (1.25 + (z.lunge > 0 ? 0.55 : 0) + (z.type === 'brute' ? 0.2 : 0)), sh = -r * 1.15;
    const arms = () => { c.strokeStyle = z.skin; c.lineWidth = r * (z.type === 'brute' ? 0.45 : 0.3); c.lineCap = 'round'; c.beginPath(); for (const s of [-1, 1]) { const bx = -sa * s * r * 0.62, by = sh + ca * s * r * 0.3; c.moveTo(bx, by); c.lineTo(bx + ca * armLen + Math.sin(t * 0.5 + s) * 2, by + sa * armLen * 0.6 + Math.cos(t * 0.5 + s) * 2); } c.stroke(); };
    if (sa < 0) arms();
    c.fillStyle = z.cloth; c.beginPath(); c.ellipse(0, -r * 1.05, r * (z.type === 'bomber' ? 0.98 : z.type === 'runner' ? 0.7 : 0.82), r * 0.9, 0, 0, TAU); c.fill();
    if (z.type === 'brute') { c.fillStyle = shade(z.skin, -0.15); c.beginPath(); c.ellipse(-sa * r * 0.6, -r * 1.4, r * 0.42, r * 0.35, 0, 0, TAU); c.ellipse(sa * r * 0.6, -r * 1.4, r * 0.42, r * 0.35, 0, 0, TAU); c.fill(); }
    if (z.type === 'bomber') { c.fillStyle = '#7da04a'; for (const [bx, by, br] of [[-5, -14, 4], [4, -10, 3.5], [0, -20, 3]]) { c.beginPath(); c.arc(bx, by, br, 0, TAU); c.fill(); } }
    c.fillStyle = 'rgba(80,10,8,.55)'; c.fillRect(-r * 0.3 + (z.seed || 0), -r * 1.2, r * 0.35, r * 0.3);
    const hy = -r * (z.type === 'spitter' ? 2.2 : 1.95) + Math.sin(t * 0.5);
    c.fillStyle = z.skin; c.beginPath(); c.arc(ca * r * 0.25, hy, r * (z.type === 'brute' ? 0.45 : 0.52), 0, TAU); c.fill();
    if (z.type === 'spitter' && z.spitWind > 0) { c.fillStyle = ACID(); c.beginPath(); c.arc(ca * r * 0.6, hy + 3, 3 + (0.45 - z.spitWind) * 6, 0, TAU); c.fill(); }
    if (sa >= 0) arms();
    if (z.costume) drawCostume(c, z.costume, ca * r * 0.25, hy, r, z.walkT);
    if (z.hitFlash > 0) { c.globalAlpha = 0.6; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, -r * 1.2, r * 0.85, r * 1.15, 0, 0, TAU); c.fill(); c.globalAlpha = 1; }
    if (z.burn > 0) { c.globalAlpha = 0.35; c.fillStyle = '#ff7a22'; c.beginPath(); c.ellipse(0, -r * 1.2, r * 0.9, r * 1.2, 0, 0, TAU); c.fill(); c.globalAlpha = 1; }
    c.restore();
    if ((z.type === 'brute' || z.type === 'spitter') && z.hp < z.maxHp && z.spawnT <= 0) { c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(z.x - 16, z.y - r * 2.9, 32, 4); c.fillStyle = '#b0231c'; c.fillRect(z.x - 16, z.y - r * 2.9, 32 * z.hp / z.maxHp, 4); }
  },
  drawDog(z, ca, sa) {
    const c = ctx, r = z.r, t = z.walkT, crouch = z.bState === 'crouch', leap = z.bState === 'leap';
    const lift = leap ? 9 : crouch ? -3 : 0, step = Math.sin(t * 1.7) * r * 0.4, fx = ca * r * 0.95, fy = sa * r * 0.4;
    if (crouch) { // télégraphe : la trajectoire du bond s'affiche au sol
      const k = 1 - z.bT / 0.42; c.strokeStyle = `rgba(${DZ()},${0.25 + k * 0.5})`; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(0, 0); c.lineTo(z.cdx * 150, z.cdy * 150); c.stroke(); c.setLineDash([]);
      c.translate(rand(-1, 1), 0);
    }
    c.strokeStyle = shade(z.skin, -0.35); c.lineWidth = 3.2; c.lineCap = 'round'; c.beginPath();
    for (const [f, sd] of [[0.62, 1], [0.62, -1], [-0.6, 1], [-0.6, -1]]) { const px = fx * f - sa * sd * r * 0.38, py = -r * 0.6 - lift + fy * f + ca * sd * r * 0.16, w = (f > 0 ? step : -step) * sd * (leap ? 0 : 1); c.moveTo(px, py); c.lineTo(px + ca * w + (leap ? -ca * f * 6 : 0), py + r * 0.6 + lift * 0.6); }
    c.stroke();
    c.save(); c.translate(0, -r * 0.85 - lift);
    c.strokeStyle = z.skin; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-fx * 0.9, -fy * 0.9); c.quadraticCurveTo(-fx * 1.4, -fy * 1.4 - r * 0.5, -fx * 1.6 + Math.sin(t * 2.4) * 3, -fy * 1.2 - r * 0.7); c.stroke();
    c.fillStyle = z.hitFlash > 0 ? '#eee' : z.skin; c.beginPath(); c.ellipse(0, 0, r * (0.62 + Math.abs(ca) * 0.5), r * (0.62 - Math.abs(ca) * 0.08), 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(30,20,16,.55)'; c.lineWidth = 1.2; c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(-r * 0.2 + i * 4, -r * 0.35); c.lineTo(-r * 0.05 + i * 4, r * 0.1); } c.stroke();
    c.fillStyle = 'rgba(110,12,8,.75)'; c.beginPath(); c.ellipse(r * 0.15, -r * 0.05, r * 0.22, r * 0.14, 0.4, 0, TAU); c.fill();
    const hx = fx * 1.1, hy = fy * 0.8 - r * 0.32 + (crouch ? r * 0.28 : 0);
    c.fillStyle = shade(z.skin, 0.1); c.beginPath(); c.ellipse(hx, hy, r * 0.46, r * 0.4, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(hx + ca * r * 0.4, hy + r * 0.1 + sa * r * 0.08, r * 0.27, r * 0.2, 0, 0, TAU); c.fill();
    c.fillStyle = '#1a1210'; c.beginPath(); c.arc(hx + ca * r * 0.62, hy + r * 0.06 + sa * r * 0.1, 2, 0, TAU); c.fill();
    c.fillStyle = shade(z.skin, -0.3); c.beginPath(); for (const sd of [-1, 1]) { c.moveTo(hx + sd * r * 0.32, hy - r * 0.18); c.lineTo(hx + sd * r * 0.22 - ca * 2, hy - r * 0.72); c.lineTo(hx + sd * r * 0.04, hy - r * 0.3); } c.fill();
    if (sa > -0.4) { c.fillStyle = crouch || leap ? '#ff3a2a' : '#ffcf4a'; c.fillRect(hx + ca * r * 0.18 - 4, hy - r * 0.12, 2.4, 2.4); c.fillRect(hx + ca * r * 0.18 + 1.6, hy - r * 0.12, 2.4, 2.4); }
    if (crouch || leap) { c.fillStyle = '#efe6d0'; c.fillRect(hx + ca * r * 0.4 - 3, hy + r * 0.24, 2, 3); c.fillRect(hx + ca * r * 0.4 + 1, hy + r * 0.24, 2, 3); }
    if (z.burn > 0) { c.globalAlpha = 0.35; c.fillStyle = '#ff7a22'; c.beginPath(); c.ellipse(0, 0, r, r * 0.7, 0, 0, TAU); c.fill(); c.globalAlpha = 1; }
    c.restore();
  },
  drawRiot(z, ca, sa, sw) {
    const c = ctx, r = z.r;
    const shield = () => {
      c.save(); c.translate(ca * r * 0.95, -r * 1.05 + sa * r * 0.45); c.rotate(z.dir + Math.PI / 2);
      c.fillStyle = 'rgba(150,172,195,.85)'; c.fillRect(-r * 1.15, -3.5, r * 2.3, 7); c.fillStyle = '#e8e2d0'; c.fillRect(-r * 0.5, -1, r, 2);
      c.restore();
    };
    if (sa < 0) shield();
    c.fillStyle = '#1b2233'; c.fillRect(-r * 0.5, -r * 0.62 + sw * 0.2, r * 0.38, r * 0.72); c.fillRect(r * 0.12, -r * 0.62 - sw * 0.2, r * 0.38, r * 0.72);
    c.fillStyle = z.hitFlash > 0 ? '#e8e8f0' : '#24304a'; c.beginPath(); c.ellipse(0, -r * 1.05, r * 0.88, r * 0.9, 0, 0, TAU); c.fill();
    c.fillStyle = '#3a4a66'; c.fillRect(-r * 0.7, -r * 1.35, r * 1.4, r * 0.35);
    c.fillStyle = '#7d8a6a'; c.beginPath(); c.arc(ca * r * 0.25, -r * 1.95, r * 0.5, 0, TAU); c.fill();
    c.fillStyle = '#141a26'; c.beginPath(); c.arc(ca * r * 0.25, -r * 2.05, r * 0.56, Math.PI, TAU); c.fill();
    if (sa > -0.3) { c.fillStyle = 'rgba(120,160,200,.55)'; c.fillRect(ca * r * 0.25 - r * 0.45, -r * 2.02, r * 0.9, r * 0.32); }
    if (sa >= 0) shield();
    if (z.hp < z.maxHp) { c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(-16, -r * 2.9, 32, 4); c.fillStyle = '#b0231c'; c.fillRect(-16, -r * 2.9, 32 * z.hp / z.maxHp, 4); }
  }
});
