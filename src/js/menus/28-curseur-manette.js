// ---------- curseur manette dans les menus
const padCursor = {
  x: innerWidth / 2, y: innerHeight / 2, on: false, hov: null, lastState: null, el: null, holdRange: null,
  target(el) { return el && el.closest('button:not([disabled]), a[href], input:not([disabled]), select, textarea, summary, label, [role="button"], #map-cv'); },
  show() { if (!this.el) this.el = $('pad-cursor'); if (!this.on) { this.on = true; this.el.hidden = false; document.documentElement.classList.add('pad-on'); } },
  hide() { if (!this.on) return; this.on = false; document.documentElement.classList.remove('pad-on'); if (this.el) this.el.hidden = true; this.setHov(null); this.holdRange = null; if (game.state === 'map' && game.mapHover != null) { game.mapHover = null; game.mapTip(null); } },
  setHov(t) { if (t === this.hov) return; if (this.hov) this.hov.classList.remove('pad-hover'); this.hov = t; if (t && t.id !== 'map-cv') { t.classList.add('pad-hover'); const r = t.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 50) t.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } if (this.el) this.el.classList.toggle('over', !!t); },
  snapTo(el) { const r = el.getBoundingClientRect(); if (!r.width) return; this.x = r.left + r.width / 2; this.y = r.top + r.height / 2; this.place(); },
  place() { this.x = clamp(this.x, 2, innerWidth - 2); this.y = clamp(this.y, 2, innerHeight - 2); if (this.el) this.el.style.transform = `translate(${this.x - 18}px,${this.y - 17}px)`; },
  scroller(el) { for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 2) return e; } return document.querySelector('.sheet:not([hidden]) .sheet-card') || document.querySelector('.screen:not([hidden])'); },
  setRange(r) { const b = r.getBoundingClientRect(), f = clamp((this.x - b.left) / b.width, 0, 1), mn = +r.min || 0, mx = r.max === '' ? 100 : +r.max, st = +r.step || 0; let v = mn + f * (mx - mn); if (st) v = Math.round(v / st) * st; r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); },
  update(g, dt) {
    const inp = g.input, pd = inp.pad;
    const ok = pd && inp.useGamepad && g.state !== 'playing' && g.state !== 'comic' && !padCapture && $('splash').hidden && $('join-modal').hidden;
    if (!ok) { this.hide(); return false; }
    if (!this.on || this.lastState !== g.state) { this.show(); const f = document.activeElement; if (f && f !== document.body && f.getBoundingClientRect().width) this.snapTo(f); else this.place(); }
    this.lastState = g.state;
    const fe = document.activeElement; if (fe !== this.lastFocus) { this.lastFocus = fe; if (fe && fe !== document.body && fe.id !== 'map-cv' && fe.getBoundingClientRect().width && !this.target(document.elementFromPoint(this.x, this.y))?.contains(fe)) this.snapTo(fe); }
    const dz = v => Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82;
    const lx = dz(pd.lx), ly = dz(pd.ly), l = Math.hypot(lx, ly);
    if (l > 0) { const sp = (260 + 1100 * l * l) * (this.hov ? 0.6 : 1) * Math.min(1, innerWidth / 900 + 0.25); this.x += lx / l * sp * l * dt; this.y += ly / l * sp * l * dt; this.place(); }
    const under = document.elementFromPoint(this.x, this.y);
    const ry = dz(pd.ry), edge = this.y < 40 && ly < 0 ? -1 : this.y > innerHeight - 40 && ly > 0 ? 1 : 0;
    if (ry || edge) { const sc = this.scroller(under); if (sc) sc.scrollTop += (ry || edge * 0.7) * 900 * dt; }
    const t = this.target(under); this.setHov(t);
    if (t && t.id === 'map-cv') t.dispatchEvent(new MouseEvent('mousemove', { clientX: this.x, clientY: this.y, bubbles: true }));
    else if (g.state === 'map' && g.mapHover != null) { g.mapHover = null; g.mapTip(null); }
    this.el.classList.toggle('press', pd.aHeld);
    if (this.holdRange) { if (pd.aHeld) this.setRange(this.holdRange); else this.holdRange = null; }
    if (pd.a && t) {
      g.audio.init();
      if (t.type === 'range') { this.holdRange = t; t.focus(); this.setRange(t); }
      else if (t.tagName === 'SELECT') { t.selectedIndex = (t.selectedIndex + 1) % t.options.length; t.dispatchEvent(new Event('change', { bubbles: true })); }
      else if (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /^(text|search|)$/.test(t.type))) t.focus();
      else if (t.id === 'map-cv') t.dispatchEvent(new MouseEvent('click', { clientX: this.x, clientY: this.y, bubbles: true }));
      else { if (t.focus) t.focus({ preventScroll: true }); t.click(); }
      return true;
    }
    if (pd.a && !t) return true;
    return false;
  }
};
window.__pc = padCursor; window.__weaponArt = weaponArt; window.__itemArt = itemArt;
document.addEventListener('click', e => {
  if (game.state === 'playing' || game.state === 'comic') return;
  const t = e.target.closest && e.target.closest('button, summary, #map-cv, .char'); if (!t || !t.closest('.screen, .sheet')) return;
  game.audio.init(); game.audio.argh();
  if (padCursor.on && padCursor.el) { padCursor.el.classList.remove('chomp'); void padCursor.el.offsetWidth; padCursor.el.classList.add('chomp'); }
}, true);
let lastMouse = null; addEventListener('mousemove', e => { const m = [e.clientX, e.clientY]; if (lastMouse && padCursor.on && Math.abs(m[0] - lastMouse[0]) + Math.abs(m[1] - lastMouse[1]) > 3) { game.input.useGamepad = false; padCursor.hide(); } lastMouse = m; });
addEventListener('keydown', () => { if (padCursor.on) padCursor.hide(); });
class Comic {
  constructor(g) {
    this.g = g; this.strip = $('comic-strip'); this.idx = 0; this.done = null;
    $('comic-next').addEventListener('click', () => this.next()); $('comic-skip').addEventListener('click', () => this.finish());
    this.strip.addEventListener('click', () => this.next());
  }
  show(key, onDone) {
    if (this.g.netEmit) this.g.netEmit(['comic', key]); this.key = key;
    const g = this.g, act = ACTS[key], panels = act.panels(g.charKey); this.done = onDone; this.panels = panels;
    g.state = 'comic'; g.audio.flame(false); g.input.mdown = false; g.input.sticks.move = g.input.sticks.aim = null;
    $('comic-act').textContent = act.label; $('comic-title').textContent = act.title;
    const tilt = [-0.8, 0.6, -0.4];
    this.strip.style.gridTemplateColumns = panels.length === 1 ? 'minmax(0,1fr)' : ''; this.strip.style.maxWidth = panels.length === 1 ? '560px' : ''; this.strip.style.margin = panels.length === 1 ? '0 auto' : ''; this.strip.style.width = panels.length === 1 ? '100%' : '';
    this.strip.innerHTML = panels.map((p, i) => `<figure class="panel" style="--tilt:${tilt[i]}deg"><canvas width="480" height="360" aria-hidden="true"></canvas>${p.cap ? `<figcaption class="cap ${p.capPos || ''}">${p.cap}</figcaption>` : ''}${(p.bubbles || []).map(b => `<p class="bubble t-${b.tail || 'bl'} ${b.cls || ''}" style="left:${b.x}%;top:${b.y}%;max-width:${b.w || 46}%">${b.t}</p>`).join('')}</figure>`).join('');
    const cvs = [...this.strip.querySelectorAll('canvas')];
    const draw = () => panels.forEach((p, i) => { const c = cvs[i].getContext('2d'); c.save(); c.clearRect(0, 0, 480, 360); p.draw(c); c.restore(); halftone(c); });
    draw(); fontsReady.then(draw);
    this.idx = 0; this.reveal(); g.showScreen('scr-comic'); $('comic-next').focus();
  }
  reveal() {
    const ps = this.strip.children; for (let i = 0; i < ps.length; i++) { ps[i].classList.toggle('on', i <= this.idx); ps[i].classList.toggle('cur', i === this.idx); }
    const cur = this.panels && this.panels[this.idx]; if (cur && cur.onReveal && !cur._fired) { cur._fired = true; cur.onReveal(); } $('comic-next').textContent = this.idx >= ps.length - 1 ? 'Continuer' : 'Case suivante'; }
  next() { if (this.g.state !== 'comic') return; if (this.idx < this.strip.children.length - 1) { this.idx++; this.reveal(); this.g.audio.ui(); } else this.finish(); }
  finish() { const g = this.g; if (g.state !== 'comic') return; g.showScreen(null); g.state = 'playing'; g.input.mdown = false; const d = this.done; this.done = null; if (d) d(); }
}
const fontsReady = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('40px Bangers'), document.fonts.load('700 16px "Comic Neue"'), document.fonts.load('40px Anton')]).catch(() => { }) : Promise.resolve();

