// ============================================================ audio (Web Audio, tout est synthétisé)
const MUSIC_THEMES = {
  gare: { base: 36.7, tempo: 1.55, beat: 1, scale: [146.83, 155.56, 174.61, 196, 207.65, 233.08, 261.63] },
  boulevard: { base: 41.2, tempo: 1.3, beat: 1.1, scale: [164.81, 174.61, 196, 220, 246.94, 261.63, 293.66] },
  parking: { base: 34.65, tempo: 1.15, beat: 1.25, triple: true, scale: [138.59, 146.83, 164.81, 185, 196, 220, 246.94] },
  mairie: { base: 30.87, tempo: 1.0, beat: 1.4, triple: true, scale: [123.47, 130.81, 146.83, 155.56, 185, 196, 220] },
  rage: { base: 29.14, tempo: 2.15, beat: 0.75, scale: [116.54, 123.47, 138.59, 155.56, 164.81, 185, 207.65] },
  paradis: { base: 43.65, tempo: 1.7, beat: 0.6, scale: [174.61, 196, 220, 261.63, 293.66, 349.23, 392] },
  kdd: { base: 36.7, tempo: 1.8, beat: 0.5, scale: [146.83, 174.61, 196, 220, 261.63, 293.66], motif: [0, 2, 4, 3, 2, null, 0, 2, 5, 4, null, null] }
};
class AudioSys {
  constructor() { this.ctx = null; this.last = {}; this.intensity = 0; }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { return; }
    const c = this.ctx;
    this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -16; this.comp.knee.value = 12; this.comp.ratio.value = 5; this.comp.connect(c.destination);
    this.master = c.createGain(); this.master.connect(this.comp);
    this.sfx = c.createGain(); this.sfx.connect(this.master);
    this.mus = c.createGain(); this.mus.connect(this.master);
    const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.nb = buf;
    this.applyVolume(); this.startMusic(); this.startFlame();
  }
  applyVolume() { if (!this.master) return; this.master.gain.value = Settings.vol; this.mus.gain.value = Settings.music * 0.6; if (this.rainG) this.rainG.gain.value = Settings.rain ? 0.05 : 0.012; }
  get t() { return this.ctx.currentTime; }
  can(k, ms) { const t = performance.now(); if (this.last[k] && t - this.last[k] < ms) return false; this.last[k] = t; return true; }
  dest(pan) { if (pan && !TOUCH && this.ctx.createStereoPanner) { const p = this.ctx.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(this.sfx); return p; } return this.sfx; }
  at(x, y) { const p = game.player; if (!p) return { v: 1, pan: 0 }; const d = Math.hypot(x - p.x, y - p.y); return { v: Math.max(0, 1 - d / 1400), pan: clamp((x - p.x) / 800, -0.9, 0.9) }; }
  noise({ dur = 0.2, f = 1000, f2 = null, q = 1, type = 'lowpass', g = 0.5, a = 0.002, pan = 0, delay = 0, out = null }) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = this.nb;
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur); fl.Q.value = q;
    const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(Math.max(0.0002, g), t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(gn); gn.connect(out || this.dest(pan)); s.start(t, Math.random() * 1.5, dur + 0.05);
  }
  tone({ f = 440, f2 = null, dur = 0.2, type = 'sine', g = 0.3, a = 0.005, pan = 0, delay = 0, out = null }) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(Math.max(0.0002, g), t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(out || this.dest(pan)); o.start(t); o.stop(t + dur + 0.05);
  }
  shot(id, charged) {
    if (!this.ctx) return;
    switch (id) {
      case 'pistol':
        if (charged) { this.tone({ f: 1100, f2: 90, dur: 0.4, type: 'sawtooth', g: 0.22 }); this.noise({ f: 6000, f2: 300, dur: 0.45, g: 0.7 }); this.tone({ f: 80, f2: 35, dur: 0.3, g: 0.5 }); }
        else { this.noise({ f: 3200, f2: 500, dur: 0.16, g: 0.5 }); this.tone({ f: 190, f2: 60, dur: 0.09, type: 'triangle', g: 0.35 }); }
        break;
      case 'shotgun': this.noise({ f: 2200, f2: 180, dur: 0.42, g: 0.85 }); this.tone({ f: 95, f2: 38, dur: 0.25, g: 0.55 }); this.noise({ f: 2500, type: 'highpass', dur: 0.05, g: 0.25, delay: 0.38 }); break;
      case 'smg': if (this.can('smg', 45)) { this.noise({ f: 3600, f2: 700, dur: 0.09, g: 0.35 }); this.tone({ f: 160, f2: 70, dur: 0.05, type: 'triangle', g: 0.2 }); } break;
      case 'rail': this.tone({ f: 2400, f2: 120, dur: 0.45, type: 'sawtooth', g: 0.22 }); this.noise({ f: 4000, type: 'highpass', dur: 0.3, g: 0.35 }); this.tone({ f: 55, dur: 0.5, g: 0.5 }); break;
      case 'rocket': this.noise({ f: 500, f2: 2200, type: 'bandpass', q: 2, dur: 0.6, g: 0.45 }); this.tone({ f: 120, f2: 50, dur: 0.2, g: 0.3 }); break;
    }
  }
  explosion(v = 1, pan = 0) { if (!this.ctx || v <= 0.02) return; this.noise({ f: 1400, f2: 70, dur: 1.3, g: 0.95 * v, pan }); this.tone({ f: 75, f2: 28, dur: 0.9, g: 0.75 * v, pan }); this.noise({ f: 3000, type: 'highpass', dur: 0.12, g: 0.3 * v, pan }); }
  flesh(v = 1) { if (!this.ctx || !this.can('flesh', 35)) return; this.noise({ f: 900, type: 'bandpass', q: 1.5, dur: 0.07, g: 0.22 * v }); }
  metal(v = 1, pan = 0) { if (!this.ctx || !this.can('metal', 60)) return; this.tone({ f: rand(1100, 1600), f2: 700, dur: 0.07, type: 'square', g: 0.05 * v, pan }); this.noise({ f: 5000, type: 'highpass', dur: 0.04, g: 0.12 * v, pan }); }
  groan(x, y, type) {
    if (!this.ctx || !this.can('groan', 260)) return; const { v, pan } = this.at(x, y); if (v <= 0.05) return;
    const c = this.ctx, t = this.t; const base = type === 'brute' ? 52 : type === 'runner' ? rand(115, 140) : type === 'boss' ? 38 : rand(72, 100); const dur = rand(0.7, 1.4);
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(base, t); o.frequency.linearRampToValueAtTime(base * rand(0.7, 0.9), t + dur);
    const vib = c.createOscillator(); vib.frequency.value = rand(5, 9); const vg = c.createGain(); vg.gain.value = base * 0.07; vib.connect(vg); vg.connect(o.frequency);
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(rand(420, 720), t); f.frequency.linearRampToValueAtTime(rand(250, 450), t + dur); f.Q.value = 3;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.24 * v, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(this.dest(pan)); o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  }
  roar(v = 1) { if (!this.ctx) return; this.tone({ f: 70, f2: 32, dur: 1.8, type: 'sawtooth', g: 0.45 * v }); this.noise({ f: 500, f2: 120, dur: 1.6, g: 0.5 * v }); this.tone({ f: 105, f2: 48, dur: 1.4, type: 'square', g: 0.08 * v }); }
  hurt() { if (!this.ctx || !this.can('hurt', 120)) return; this.tone({ f: 170, f2: 60, dur: 0.25, g: 0.45 }); this.noise({ f: 600, dur: 0.15, g: 0.3 }); }
  coin() { if (!this.ctx || !this.can('coin', 40)) return; this.tone({ f: 1320, dur: 0.07, g: 0.1 }); this.tone({ f: 1760, dur: 0.12, g: 0.08, delay: 0.05 }); }
  pickup() { if (!this.ctx) return; this.tone({ f: 520, f2: 900, dur: 0.16, type: 'triangle', g: 0.2 }); this.tone({ f: 780, f2: 1300, dur: 0.18, type: 'triangle', g: 0.12, delay: 0.08 }); }
  reload() { if (!this.ctx) return; this.noise({ f: 3000, type: 'highpass', dur: 0.04, g: 0.25 }); this.noise({ f: 2200, type: 'bandpass', dur: 0.06, g: 0.3, delay: 0.3 }); }
  empty() { if (!this.ctx || !this.can('empty', 180)) return; this.tone({ f: 900, dur: 0.03, type: 'square', g: 0.08 }); }
  melee() { if (!this.ctx) return; this.noise({ f: 300, f2: 1600, type: 'bandpass', q: 1.2, dur: 0.2, g: 0.35 }); }
  argh() {
    if (!this.ctx || !this.can('argh', 140)) return; const c = this.ctx, t = this.t, dur = rand(0.38, 0.5), base = rand(105, 135);
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(base * 1.25, t); o.frequency.exponentialRampToValueAtTime(base * 0.62, t + dur);
    const vib = c.createOscillator(); vib.frequency.value = 23; const vg = c.createGain(); vg.gain.value = base * 0.12; vib.connect(vg); vg.connect(o.frequency);
    const out = c.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(0.32, t + 0.03); out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [f, q, gv] of [[720, 6, 1], [1150, 8, 0.6], [2500, 10, 0.25]]) { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); bp.frequency.linearRampToValueAtTime(f * 0.8, t + dur); bp.Q.value = q; const gg = c.createGain(); gg.gain.value = gv; o.connect(bp); bp.connect(gg); gg.connect(out); }
    out.connect(this.dest(0)); o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
    this.noise({ f: 1800, type: 'bandpass', q: 1, dur: dur * 0.8, g: 0.08 });
  }
  ui() { if (!this.ctx) return; this.tone({ f: 520, dur: 0.05, type: 'triangle', g: 0.12 }); }
  buy() { if (!this.ctx) return; this.tone({ f: 660, dur: 0.06, type: 'square', g: 0.06 }); this.tone({ f: 990, dur: 0.12, type: 'square', g: 0.05, delay: 0.06 }); }
  deny() { if (!this.ctx) return; this.tone({ f: 180, dur: 0.15, type: 'square', g: 0.08 }); }
  chargeReady() { if (!this.ctx) return; this.tone({ f: 1500, dur: 0.12, g: 0.12 }); }
  spit(x, y) { if (!this.ctx || !this.can('spit', 80)) return; const { v, pan } = this.at(x, y); this.noise({ f: 1600, f2: 400, type: 'bandpass', q: 2, dur: 0.22, g: 0.3 * v, pan }); }
  splat(x, y) { if (!this.ctx || !this.can('splat', 80)) return; const { v, pan } = this.at(x, y); this.noise({ f: 700, f2: 200, dur: 0.18, g: 0.3 * v, pan }); }
  bark(x, y, happy) { if (!this.ctx) return; const { v, pan } = this.at(x, y); if (v <= 0.02) return; const f = happy ? 760 : 620; this.tone({ f, f2: f * 0.6, dur: 0.09, type: 'square', g: 0.09 * v, pan }); this.tone({ f: f * 1.05, f2: f * 0.55, dur: 0.1, type: 'square', g: 0.08 * v, pan, delay: 0.14 }); }
  beep(x, y) { if (!this.ctx) return; const { v, pan } = this.at(x, y); this.tone({ f: 1500, dur: 0.06, type: 'square', g: 0.07 * v, pan }); }
  clank() { if (!this.ctx) return; this.tone({ f: 140, f2: 90, dur: 0.5, type: 'square', g: 0.12 }); this.noise({ f: 1800, type: 'bandpass', q: 3, dur: 0.4, g: 0.3 }); }
  objective() { if (!this.ctx) return; [392, 523, 659].forEach((f, i) => this.tone({ f, dur: 0.5, type: 'triangle', g: 0.14, delay: i * 0.12 })); }
  siren() { if (!this.ctx) return; this.tone({ f: 500, f2: 900, dur: 1.2, type: 'sawtooth', g: 0.08 }); this.tone({ f: 900, f2: 500, dur: 1.2, type: 'sawtooth', g: 0.08, delay: 1.2 }); }
  death() { if (!this.ctx) return; this.tone({ f: 220, f2: 40, dur: 2.2, type: 'sawtooth', g: 0.25 }); this.noise({ f: 400, f2: 60, dur: 2, g: 0.4 }); }
  generator() { if (!this.ctx) return; this.tone({ f: 40, f2: 60, dur: 1.6, type: 'sawtooth', g: 0.25 }); this.noise({ f: 300, dur: 1.4, g: 0.2 }); }
  startFlame() { const c = this.ctx; const s = c.createBufferSource(); s.buffer = this.nb; s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 650; f.Q.value = 0.6; const g = c.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(this.sfx); s.start(); this.flameG = g; }
  flame(on) { if (!this.flameG) return; this.flameG.gain.setTargetAtTime(on ? 0.5 : 0, this.t, 0.05); }
  alarmStart(car) {
    const c = this.ctx; if (!c || car.snd) return;
    const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 880;
    const lfo = c.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 2.2; const lg = c.createGain(); lg.gain.value = 230; lfo.connect(lg); lg.connect(o.frequency);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400; const g = c.createGain(); g.gain.value = 0;
    const pn = c.createStereoPanner ? c.createStereoPanner() : null;
    o.connect(f); f.connect(g); if (pn) { g.connect(pn); pn.connect(this.sfx); } else g.connect(this.sfx);
    o.start(); lfo.start(); car.snd = { o, lfo, g, pn };
  }
  alarmUpdate(car) { const s = car.snd; if (!s) return; const { v, pan } = this.at(car.x + car.w / 2, car.y + car.h / 2); s.g.gain.setTargetAtTime(0.05 * v, this.t, 0.1); if (s.pn) s.pn.pan.setTargetAtTime(pan, this.t, 0.1); }
  alarmStop(car) { const s = car.snd; if (!s) return; try { s.g.gain.setTargetAtTime(0, this.t, 0.05); s.o.stop(this.t + 0.3); s.lfo.stop(this.t + 0.3); } catch (e) { } car.snd = null; }
  startMusic() {
    const c = this.ctx;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; lp.Q.value = 5; lp.connect(this.mus); this.mlp = lp;
    const dg = c.createGain(); dg.gain.value = 0.15; dg.connect(lp);
    this.drones = []; [[36.7, 'sawtooth'], [36.95, 'sawtooth'], [55, 'triangle'], [77.8, 'sine']].forEach(([f, tp]) => { const o = c.createOscillator(); o.type = tp; o.frequency.value = f; o.connect(dg); o.start(); this.drones.push(o); });
    const lfo = c.createOscillator(); lfo.frequency.value = 0.06; const lg = c.createGain(); lg.gain.value = 110; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    // pluie et vent
    const s = c.createBufferSource(); s.buffer = this.nb; s.loop = true; const wf = c.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 1400; wf.Q.value = 0.4;
    const wg = c.createGain(); wg.gain.value = 0.05; s.connect(wf); wf.connect(wg); wg.connect(this.mus); s.start(); this.rainG = wg;
    const wl = c.createOscillator(); wl.frequency.value = 0.08; const wlg = c.createGain(); wlg.gain.value = 500; wl.connect(wlg); wlg.connect(wf.frequency); wl.start();
    // écho pour les notes
    const dl = c.createDelay(1); dl.delayTime.value = 0.42; const fb = c.createGain(); fb.gain.value = 0.38; dl.connect(fb); fb.connect(dl); dl.connect(this.mus); this.echo = dl;
    this.nextBeat = c.currentTime + 1.5; this.nextNote = c.currentTime + 3; this.applyVolume();
  }
  setTheme(name) {
    const T = MUSIC_THEMES[name] || MUSIC_THEMES.gare; this.themeName = MUSIC_THEMES[name] ? name : 'gare'; if (this.theme === T) return; this.theme = T; this.motifI = 0;
    if (this.drones && this.ctx) this.drones.forEach((o, i) => o.frequency.setTargetAtTime(T.base * [1, 1.007, 1.5, 2.12][i], this.ctx.currentTime, 1.2));
  }
  // musique qui suit l'action : exploration (nappe et notes rares), horde (charleston et basse qui pousse), boss (frappes lourdes et accords dissonants)
  musicTick(target, boss) {
    if (!this.ctx || !this.mlp) return; this.intensity = lerp(this.intensity, target, target > this.intensity ? 0.05 : 0.012);
    const t = this.t, I = this.intensity; this.mlp.frequency.setTargetAtTime(200 + I * 900 + (boss ? 500 : 0), t, 0.5);
    const TH = this.theme || MUSIC_THEMES.gare, stage = boss ? 2 : I > 0.38 ? 1 : 0;
    if (stage > (this.stage || 0)) this.stinger(t, stage); this.stage = stage;
    if (stage >= 1) {
      if (!this.nextHat || this.nextHat < t - 0.5) this.nextHat = t; const step = (TH.tempo - I * 0.85) / (boss ? 4 : 2);
      while (this.nextHat < t + 0.1) { const h = this.nextHat, k = this.hatI = ((this.hatI || 0) + 1) % 8; this.hat(h, (boss ? 0.05 : 0.035) * (k % 2 ? 0.6 : 1) * Math.min(1, (I - 0.3) * 2.5 + (boss ? 0.5 : 0)));
        if (k % 2 === 0 && (I > 0.55 || boss)) this.bass(h, (TH.base || 36.7) * (boss ? [1, 1, 1.06, 1][k / 2 % 4] : [1, 1, 1.5, 1.33][k / 2 % 4]) * 2, step * 1.6, boss ? 0.13 : 0.09);
        if (boss && k === 0) { this.thump(h, 0.55); this.mtone(h, (TH.base || 36.7) * 4 * 1.414, 0.6, 0.035); } /* triton de boss */
        this.nextHat = h + step; }
    }
    if (t > this.nextBeat - 0.05) { const bt = Math.max(t, this.nextBeat); this.thump(bt, (0.16 + I * 0.4) * TH.beat); this.thump(bt + 0.22, (0.1 + I * 0.3) * TH.beat); if (TH.triple) this.thump(bt + 0.44, 0.08 + I * 0.25); this.nextBeat = bt + (TH.tempo - I * 0.85); }
    if (TH.motif && t > this.nextNote - 0.05) {
      const nt = Math.max(t, this.nextNote), m = TH.motif[this.motifI++ % TH.motif.length];
      if (m != null) this.mtone(nt, TH.scale[m % TH.scale.length] * (m >= TH.scale.length ? 2 : 1), 0.9, 0.05);
      this.nextNote = nt + (this.motifI % TH.motif.length === 0 ? 3.5 : 0.3); return;
    }
    if (t > this.nextNote - 0.05) {
      const nt = Math.max(t, this.nextNote); const scale = TH.scale;
      const f = pick(scale) * (Math.random() < 0.3 ? 0.5 : 1); this.mtone(nt, f, 3.5, 0.055); if (Math.random() < 0.4) this.mtone(nt + 0.02, f * 1.5 * 1.012, 3, 0.025);
      this.nextNote = nt + Math.max(1.2, rand(2.4, 5.2) - I * 1.4);
    }
  }
  hat(t, g) { const c = this.ctx, s = c.createBufferSource(); s.buffer = this.nb; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; const gn = c.createGain(); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); s.connect(f); f.connect(gn); gn.connect(this.mus); s.start(t, Math.random() * 1.5, 0.07); }
  bass(t, f, dur, g) { const c = this.ctx, o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(g, t + 0.015); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(lp); lp.connect(gn); gn.connect(this.mus); o.start(t); o.stop(t + dur + 0.05); }
  // la horde arrive / le boss entre : une montée brève qui annonce le changement
  stinger(t, stage) { const c = this.ctx, o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(stage > 1 ? 55 : 110, t); o.frequency.exponentialRampToValueAtTime(stage > 1 ? 40 : 220, t + 0.9); const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(stage > 1 ? 0.16 : 0.08, t + 0.6); gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.1); o.connect(gn); gn.connect(this.mus); o.start(t); o.stop(t + 1.2); if (stage > 1) this.thump(t + 0.9, 0.7); }
  thump(t, g) { const c = this.ctx; const o = c.createOscillator(); o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.2); const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(g, t + 0.01); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.24); o.connect(gn); gn.connect(this.mus); o.start(t); o.stop(t + 0.3); }
  mtone(t, f, dur, g) { const c = this.ctx; const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(g, t + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(gn); gn.connect(this.mus); gn.connect(this.echo); o.start(t); o.stop(t + dur + 0.1); }
}

