// ============================================================ entrées clavier / souris / manette
class Input {
  constructor(el) {
    this.keys = new Set(); this.codes = new Set(); this.pk = new Set(); this.pc = new Set();
    this.mx = innerWidth / 2; this.my = innerHeight / 2; this.wheel = 0;
    this.gpPrev = []; this.useGamepad = false; this.gpAimAng = null; this.act = {}; this.stickPrev = 0;
    addEventListener('keydown', e => {
      if (e.target && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'range') return;
      const k = (e.key || '').toLowerCase();
      if (!e.repeat) { this.pk.add(k); this.pc.add(e.code); }
      this.keys.add(k); this.codes.add(e.code);
      if (game.state === 'playing' && (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].includes(k) || Object.values(Settings.binds).some(v => v.includes(e.code)))) e.preventDefault();
    });
    addEventListener('keyup', e => { this.keys.delete((e.key || '').toLowerCase()); this.codes.delete(e.code); if (e.key === 'Shift') { this.keys.delete('shift'); this.codes.delete('ShiftLeft'); this.codes.delete('ShiftRight'); } });
    addEventListener('blur', () => { this.keys.clear(); this.codes.clear(); });
    addEventListener('keydown', () => { this.useGamepad = false; });
    el.addEventListener('mousemove', e => { if (Math.abs(e.clientX - this.mx) + Math.abs(e.clientY - this.my) > 2) { this.useGamepad = false; if (this.touchMode) this.setTouch(false); } this.mx = e.clientX; this.my = e.clientY; });
    // tactile : deux sticks flottants et des boutons dessinés sur le canvas
    this.touchMode = TOUCH; this.sticks = { move: null, aim: null }; this.btnPtr = new Map(); this.tPressed = new Set(); this.lastAimAng = 0;
    el.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      e.preventDefault(); this.setTouch(true); game.audio.init(); this.lastTap = performance.now();
      const x = e.clientX, y = e.clientY;
      if (game.state !== 'playing') return;
      const b = game.touchButtons().find(b => (x - b.x) ** 2 + (y - b.y) ** 2 < (b.r + 10) ** 2);
      if (b) { this.btnPtr.set(e.pointerId, b.id); if (b.id === 'weapon') this.wheelTouch = { id: e.pointerId, ox: x, oy: y, x, y, t0: performance.now() }; else this.tPressed.add(b.id); try { el.setPointerCapture(e.pointerId); } catch (er) { } return; }
      const side = Settings.lefty ? (x > innerWidth * 0.55 ? 'move' : 'aim') : (x < innerWidth * 0.45 ? 'move' : 'aim');
      if (!this.sticks[side]) { const h = Settings.fixedSticks ? game.stickHome(side) : { x, y }; this.sticks[side] = { id: e.pointerId, ox: h.x, oy: h.y, x, y }; }
      try { el.setPointerCapture(e.pointerId); } catch (er) { }
    });
    el.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') return; const wt = this.wheelTouch; if (wt && wt.id === e.pointerId) { wt.x = e.clientX; wt.y = e.clientY; } for (const k of ['move', 'aim']) { const s = this.sticks[k]; if (s && s.id === e.pointerId) { s.x = e.clientX; s.y = e.clientY; } } });
    const up = e => { const wt = this.wheelTouch; if (wt && wt.id === e.pointerId) { if (performance.now() - wt.t0 < 250) this.tPressed.add('weapon'); this.wheelTouch = null; } this.btnPtr.delete(e.pointerId); for (const k of ['move', 'aim']) { const s = this.sticks[k]; if (s && s.id === e.pointerId) this.sticks[k] = null; } };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('mousedown', e => { game.audio.init(); const c = 'Mouse' + e.button; this.codes.add(c); this.pc.add(c); if (e.button === 1) e.preventDefault(); });
    addEventListener('mouseup', e => { this.codes.delete('Mouse' + e.button); });
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('wheel', e => { e.preventDefault(); this.wheel += Math.sign(e.deltaY); }, { passive: false });
  }
  down(...ks) { for (const k of ks) if (this.keys.has(k)) return true; return false; }
  pressed(...ks) { for (const k of ks) if (this.pk.has(k)) return true; return false; }
  get mdown() { return this.codes.has('Mouse0'); }
  set mdown(v) { if (!v) for (let i = 0; i < 5; i++) this.codes.delete('Mouse' + i); }
  bd(a) { const b = Settings.binds[a]; return !!b && ((b[0] && this.codes.has(b[0])) || (b[1] && this.codes.has(b[1]))); }
  bp(a) { const b = Settings.binds[a]; return !!b && ((b[0] && this.pc.has(b[0])) || (b[1] && this.pc.has(b[1]))); }
  endFrame() { this.pk.clear(); this.pc.clear(); this.wheel = 0; this.tPressed.clear(); }
  setTouch(v) { if (this.touchMode === v) return; this.touchMode = v; TOUCH = v; this.sticks.move = this.sticks.aim = null; resize(); }
  stickVec(s) {
    if (!s) return null; let dx = (s.x - s.ox) / STICK_R, dy = (s.y - s.oy) / STICK_R; const l = Math.hypot(dx, dy);
    if (l > 1) { dx /= l; dy /= l; s.ox = s.x - dx * STICK_R; s.oy = s.y - dy * STICK_R; }
    return { x: dx, y: dy, l: Math.min(1, l) };
  }
  gamepad() { const pads = navigator.getGamepads ? navigator.getGamepads() : []; if (typeof game !== 'undefined' && game.p2 && game.state === 'playing') { const L = [...pads].filter(p => p && p.connected), cp = game.coopPads; if (cp) return cp.p1 === 'kb' ? null : L.find(p => p.index === cp.p1) || null; return L.length >= 2 ? L[0] : null; } for (const p of pads) if (p && p.connected) return p; return null; }
  padList() { const pads = navigator.getGamepads ? navigator.getGamepads() : []; return [...pads].filter(p => p && p.connected); }
  // joueur 2 : deuxième manette (ou la seule manette si le joueur 1 est au clavier)
  pollP2(game) {
    if (game.net === 'host') return game.netRemoteInput();
    const L = this.padList(), cp = game.coopPads, gp = cp ? L.find(q => q.index === cp.p2) : L.length >= 2 ? L[1] : L[0], a = this.act2 || (this.act2 = {}), p = game.p2;
    for (const k of ['fire', 'firePressed', 'sprint', 'melee', 'grenade', 'mine', 'decoy', 'reload', 'special', 'roll', 'flash', 'wheelHeld']) a[k] = false;
    a.cycle = 0; a.slot = -1; a.wheelDir = null; a.moveX = 0; a.moveY = 0; a.gpAim = true; a.pause = false;
    if (!gp || !p) { a.aimX = p ? p.x + Math.cos(p.aim) * 200 : 0; a.aimY = p ? p.y + Math.sin(p.aim) * 200 : 0; return a; }
    const prev = this.gp2Prev || [], b = i => gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.4), bp = i => b(i) && !prev[i];
    const dz = v => Math.abs(v) < 0.22 ? 0 : v, lx = dz(gp.axes[0] || 0), ly = dz(gp.axes[1] || 0), rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
    a.moveX = lx; a.moveY = ly;
    if (Math.hypot(rx, ry) > 0.35) this.p2Aim = Math.atan2(ry, rx); else if (lx || ly) this.p2Aim = this.p2Aim == null ? Math.atan2(ly, lx) : this.p2Aim;
    const ang = this.p2Aim == null ? p.aim : this.p2Aim; a.aimX = p.x + Math.cos(ang) * 240; a.aimY = p.y + Math.sin(ang) * 240;
    const PB = Settings.padBinds, pd = k => PB[k].some(i => i >= 0 && b(i)), pp = k => PB[k].some(i => i >= 0 && bp(i));
    a.fire = pd('fire'); a.firePressed = pp('fire'); a.sprint = false; a.melee = pp('melee'); a.grenade = pp('grenade'); a.mine = pp('mine'); a.decoy = pp('decoy');
    a.reload = pp('reload'); a.special = pp('special'); a.roll = pp('roll'); if (pp('next')) a.cycle = 1; if (pp('prev')) a.cycle = -1; a.pause = pp('pause');
    this.gp2Prev = gp.buttons.map(x => x.pressed || x.value > 0.4);
    return a;
  }

  poll(game) {
    const a = this.act; let mx = 0, my = 0;
    if (this.bd('up')) my -= 1; if (this.bd('down')) my += 1;
    if (this.bd('left')) mx -= 1; if (this.bd('right')) mx += 1;
    a.fire = this.bd('fire'); a.firePressed = this.bp('fire');
    a.sprint = false; a.melee = this.bp('melee'); a.grenade = this.bp('grenade'); a.mine = this.bp('mine');
    a.decoy = this.bp('decoy'); a.reload = this.bp('reload'); a.pause = this.bp('pause') || this.pc.has('Escape'); a.special = this.bp('special'); a.roll = this.bp('roll'); a.flash = this.bp('flash');
    a.wheelHeld = this.bd('wheel'); a.wheelDir = null;
    if (a.wheelHeld && game.player) { const wc = game.wheelCenter(), ps = { x: wc.x * HUDK, y: wc.y * HUDK }, dx = this.mx - ps.x, dy = this.my - ps.y; if (Math.hypot(dx, dy) > 28) a.wheelDir = Math.atan2(dy, dx); }
    a.slot = -1; for (let i = 1; i <= 6; i++) if (this.pc.has('Digit' + i) || this.pc.has('Numpad' + i)) a.slot = i - 1;
    a.cycle = this.wheel > 0 || this.bp('next') ? 1 : this.wheel < 0 || this.bp('prev') ? -1 : 0;
    const w = game.screenToWorld(this.mx, this.my); a.aimX = w.x; a.aimY = w.y; a.gpAim = false;
    a.menuPrev = a.menuNext = a.menuOk = a.menuBack = a.menuLeft = a.menuRight = a.menuY = false; a.menuTab = 0;
    if (this.touchMode && game.player && game.state === 'playing') {
      const p = game.player, mv = this.stickVec(this.sticks.move), av = this.stickVec(this.sticks.aim);
      if (mv && mv.l > 0.12) { mx = mv.x; my = mv.y; }
      let ang = null, fire = false;
      if (av && av.l > 0.25) { ang = Math.atan2(av.y, av.x); fire = av.l > clamp(+Settings.fireAt || 0.6, 0.3, 0.9); }
      // la visée reste là où on l'a laissée : se déplacer ne la fait pas tourner
      if (ang != null) this.lastAimAng = ang; else if (this.lastAimAng == null) this.lastAimAng = p.aim;
      a.aimX = p.x + Math.cos(this.lastAimAng) * 240; a.aimY = p.y + Math.sin(this.lastAimAng) * 240; a.gpAim = true;
      a.fire = fire; a.firePressed = fire && p.cd <= 0 && (p.weapon.ammo > 0 || !this.prevTouchFire); this.prevTouchFire = fire;
      const tp = this.tPressed;
      if (tp.has('melee')) a.melee = true; if (tp.has('grenade')) a.grenade = true; if (tp.has('mine')) a.mine = true;
      const wt = this.wheelTouch; if (wt && performance.now() - wt.t0 >= 250) { a.wheelHeld = true; const dx = wt.x - wt.ox, dy = wt.y - wt.oy; a.wheelDir = Math.hypot(dx, dy) > 22 ? Math.atan2(dy, dx) : null; }
      if (tp.has('reload')) a.reload = true;
      if (tp.has('decoy')) a.decoy = true; if (tp.has('roll')) a.roll = true; if (tp.has('flash')) a.flash = true; if (tp.has('weapon')) a.cycle = 1; if (tp.has('pause')) a.pause = true; if (tp.has('special')) a.special = true;
    }
    const gp = this.gamepad(); this.pad = null;
    if (gp) {
      const b = i => gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.4);
      const bp = i => b(i) && !this.gpPrev[i];
      const dz = v => Math.abs(v) < 0.22 ? 0 : v;
      const lx = dz(gp.axes[0] || 0), ly = dz(gp.axes[1] || 0); if (lx || ly) { mx = lx; my = ly; this.useGamepad = true; }
      const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0; if (Math.hypot(rx, ry) > 0.35) { this.gpAimAng = Math.atan2(ry, rx); this.useGamepad = true; }
      if (this.useGamepad && game.player) {
        if (this.gpAimAng == null && (lx || ly)) this.gpAimAng = Math.atan2(ly, lx);
        if (this.gpAimAng != null) { a.aimX = game.player.x + Math.cos(this.gpAimAng) * 240; a.aimY = game.player.y + Math.sin(this.gpAimAng) * 240; a.gpAim = true; }
      }
      const PB = Settings.padBinds, pd = k => PB[k].some(i => i >= 0 && b(i)), pp = k => PB[k].some(i => i >= 0 && bp(i));
      if (pd('fire')) a.fire = true; if (pp('fire')) a.firePressed = true;
      if (pp('melee')) a.melee = true; if (pp('grenade')) a.grenade = true; if (pp('mine')) a.mine = true; if (pp('decoy')) a.decoy = true;
      if (pp('roll')) a.roll = true; if (pp('flash')) a.flash = true; if (pp('reload')) a.reload = true; if (pp('pause')) a.pause = true; if (pp('special')) a.special = true;
      if (pp('next')) a.cycle = 1; if (pp('prev')) a.cycle = -1;
      if (pd('wheel')) { a.wheelHeld = true; const sx = Math.hypot(rx, ry) > 0.5 ? rx : lx, sy = Math.hypot(rx, ry) > 0.5 ? ry : ly; a.wheelDir = Math.hypot(sx, sy) > 0.5 ? Math.atan2(sy, sx) : null; }
      a.menuPrev = bp(12); a.menuNext = bp(13);
      a.menuLeft = bp(14); a.menuRight = bp(15); a.menuOk = bp(0); a.menuBack = bp(1) || bp(9); a.menuY = bp(3); a.menuTab = bp(5) ? 1 : bp(4) ? -1 : 0;
      this.pad = { lx: gp.axes[0] || 0, ly: gp.axes[1] || 0, rx, ry, a: bp(0), aHeld: b(0) };
      if (gp.buttons.some(x => x.pressed || x.value > 0.4)) this.useGamepad = true;
      this.gpPrev = gp.buttons.map(x => x.pressed || x.value > 0.4);
    }
    a.moveX = mx; a.moveY = my;
    return a;
  }
}

