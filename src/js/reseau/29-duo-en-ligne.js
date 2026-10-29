// ============================================================ interface
// ============================================================ duo en ligne
// L'hôte fait tourner la partie ; l'invité envoie ses commandes et affiche ce que l'hôte lui renvoie.
// Mise en relation par Supabase Realtime (ou BroadcastChannel sur un même appareil), puis WebRTC en direct, avec relais de secours.
const NET_ICE = [{ urls: 'stun:stun.cloudflare.com:3478' }, { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }].concat(ONLINE.turn || []); // ONLINE.turn : serveur relais TURN facultatif
const netCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
// canal de mise en relation
class LocalSig {
  constructor(room, onMsg) { this.bc = new BroadcastChannel('cf-net-' + room); this.bc.onmessage = e => onMsg(e.data); this.ready = Promise.resolve(); }
  send(m) { this.bc.postMessage(m); }
  close() { try { this.bc.close(); } catch (e) { } }
}
class SupaSig {
  constructor(room, onMsg) {
    this.topic = 'realtime:cf-' + room; this.ref = 0; this.onMsg = onMsg; this.q = [];
    this.ready = new Promise((res, rej) => {
      const ws = this.ws = new WebSocket(ONLINE.url.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(ONLINE.key) + '&vsn=1.0.0');
      const to = setTimeout(() => rej(new Error('délai')), 8000);
      ws.onopen = () => { this.raw({ topic: this.topic, event: 'phx_join', payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false }, access_token: ONLINE.key } }); this.hb = setInterval(() => this.raw({ topic: 'phoenix', event: 'heartbeat', payload: {} }), 25000); };
      ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (er) { return; } if (m.event === 'phx_reply' && m.topic === this.topic && !this.joined) { clearTimeout(to); if (m.payload && m.payload.status === 'ok') { this.joined = true; res(); for (const x of this.q) this.send(x); this.q = []; } else rej(new Error('refus')); } else if (m.event === 'broadcast' && m.payload) this.onMsg(m.payload.payload); };
      ws.onerror = () => { clearTimeout(to); rej(new Error('réseau')); }; ws.onclose = () => { clearInterval(this.hb); if (this.onClose) this.onClose(); };
    });
  }
  raw(o) { o.ref = String(++this.ref); if (this.ws.readyState === 1) this.ws.send(JSON.stringify(o)); }
  send(m) { if (!this.joined) { this.q.push(m); return; } this.raw({ topic: this.topic, event: 'broadcast', payload: { type: 'broadcast', event: 'm', payload: m } }); }
  close() { clearInterval(this.hb); try { this.ws.close(); } catch (e) { } }
}
const Net = {
  role: null, room: null, sig: null, pc: null, fast: null, rel: null, relay: false, peer: null, last: 0, onData: null, onState: null, id: Math.random().toString(36).slice(2, 10),
  local: () => /[?&]netlocal\b/.test(location.search) || !(ONLINE.url && ONLINE.key),
  status(s, extra) { this.state = s; if (this.onState) this.onState(s, extra); },
  async open(role, room) {
    this.close(); this.role = role; this.room = room; this.relay = false; this.peer = null; this.last = performance.now();
    const S = this.local() ? LocalSig : SupaSig; this.sig = new S(room, m => this.onSig(m)); this.sig.onClose = () => { if (this.role) this.status('lost'); };
    this.status('connecting');
    try { await this.sig.ready; } catch (e) { this.status('error', 'Mise en relation impossible (réseau ?)'); return false; }
    this.status(role === 'host' ? 'waiting' : 'joining');
    if (role === 'guest') { this.sig.send({ k: 'hello', from: this.id, name: Settings.name || 'Survivant', char: game.charKey }); this.joinT = setTimeout(() => { if (!this.peer) this.status('error', 'Aucune partie avec ce code. Vérifie les 4 lettres.'); }, 7000); }
    return true;
  },
  onSig(m) {
    if (!m || m.from === this.id) return; this.last = performance.now();
    if (m.to && m.to !== this.id) return;
    if (this.role === 'host') {
      if (m.k === 'hello') { if (this.peer && this.peer.id !== m.from) { this.sig.send({ k: 'full', to: m.from, from: this.id }); return; } this.peer = { id: m.from, name: String(m.name || 'Ami').slice(0, 16), char: CHARS[m.char] ? m.char : 'zeus' }; this.sig.send({ k: 'welcome', to: m.from, from: this.id, name: Settings.name || 'Survivant', char: game.charKey }); this.startRtc(true); this.status('peer', this.peer); }
      else if (m.k === 'answer' && this.pc) this.pc.setRemoteDescription(m.sdp).catch(() => { });
      else if (m.k === 'ice' && this.pc && m.c) this.pc.addIceCandidate(m.c).catch(() => { });
      else if (m.k === 'g') this.recv(m.d);
      else if (m.k === 'bye') { this.peer = null; this.status('left'); }
    } else {
      if (m.k === 'welcome') { clearTimeout(this.joinT); this.peer = { id: m.from, name: String(m.name || 'Hôte').slice(0, 16), char: CHARS[m.char] ? m.char : 'pedro' }; this.status('peer', this.peer); }
      else if (m.k === 'full') { clearTimeout(this.joinT); this.status('error', 'Cette partie est déjà complète.'); }
      else if (m.k === 'offer') { this.startRtc(false, m.sdp); }
      else if (m.k === 'ice' && this.pc && m.c) this.pc.addIceCandidate(m.c).catch(() => { });
      else if (m.k === 'g') this.recv(m.d);
      else if (m.k === 'bye') { this.status('left'); }
    }
  },
  async startRtc(host, offer) {
    if (typeof RTCPeerConnection === 'undefined') { this.relay = true; this.status('ready', 'relais'); return; }
    try {
      const pc = this.pc = new RTCPeerConnection({ iceServers: NET_ICE }), to = this.peer.id;
      pc.onicecandidate = e => { if (e.candidate) this.sig.send({ k: 'ice', to, from: this.id, c: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate }); };
      const bind = (ch) => { ch.onmessage = e => { this.last = performance.now(); let d; try { d = JSON.parse(e.data); } catch (er) { return; } this.recv(d); }; ch.onopen = () => { if (this.fast && this.rel && this.fast.readyState === 'open' && this.rel.readyState === 'open') { clearTimeout(this.rtcT); this.relay = false; this.status('ready', 'direct'); } }; };
      if (host) { this.fast = pc.createDataChannel('fast', { ordered: false, maxRetransmits: 0 }); this.rel = pc.createDataChannel('rel', { ordered: true }); bind(this.fast); bind(this.rel);
        const o = await pc.createOffer(); await pc.setLocalDescription(o); this.sig.send({ k: 'offer', to, from: this.id, sdp: pc.localDescription.toJSON ? pc.localDescription.toJSON() : pc.localDescription }); }
      else { pc.ondatachannel = e => { if (e.channel.label === 'fast') this.fast = e.channel; else this.rel = e.channel; bind(e.channel); };
        await pc.setRemoteDescription(offer); const a = await pc.createAnswer(); await pc.setLocalDescription(a); this.sig.send({ k: 'answer', to, from: this.id, sdp: pc.localDescription.toJSON ? pc.localDescription.toJSON() : pc.localDescription }); }
      // si la connexion directe n'aboutit pas (certaines 4G), on passe par le relais
      this.rtcT = setTimeout(() => { if (!(this.fast && this.fast.readyState === 'open')) { this.relay = true; this.status('ready', 'relais'); } }, 6000);
    } catch (e) { this.relay = true; this.status('ready', 'relais'); }
  },
  // aller-retour mesuré chaque seconde (affiché en jeu : direct ou relais, en millisecondes)
  recv(d) { if (!d) return; if (d.t === 'pg') { this.send({ t: 'po', s: d.s }); return; } if (d.t === 'po') { const r = performance.now() - d.s; if (r >= 0 && r < 10000) this.rtt = this.rtt ? lerp(this.rtt, r, 0.3) : r; return; } if (this.onData) this.onData(d); },
  ping() { if (this.peer && this.ok()) this.send({ t: 'pg', s: Math.round(performance.now()) }); },
  ok() { return !!this.peer && (this.relay || (this.fast && this.fast.readyState === 'open')); },
  send(d, reliable) {
    if (!this.peer) return;
    if (!this.relay && this.fast && this.fast.readyState === 'open') { const ch = reliable ? this.rel : this.fast; if (ch.bufferedAmount > 256000 && !reliable) return; ch.send(JSON.stringify(d)); return; }
    if (this.sig) this.sig.send({ k: 'g', to: this.peer.id, from: this.id, d });
  },
  close() {
    clearTimeout(this.joinT); clearTimeout(this.rtcT);
    if (this.sig && this.peer) { try { this.sig.send({ k: 'bye', to: this.peer.id, from: this.id }); } catch (e) { } }
    try { this.pc && this.pc.close(); } catch (e) { } if (this.sig) this.sig.close();
    this.pc = this.fast = this.rel = this.sig = this.peer = null; this.role = null; this.relay = false; this.rtt = 0;
  }
};
setInterval(() => { if (game && game.net) Net.ping(); }, 1000);
// ---------- synchronisation de la partie (hôte → invité, invité → hôte)
const NET_EDGES = ['firePressed', 'melee', 'grenade', 'mine', 'decoy', 'reload', 'special', 'roll', 'flash', 'cycleUp', 'cycleDown'];
const NET_BSTATE = ['walk', 'wind', 'charge', 'stun', 'crouch', 'leap'];
const NET_PK = ['x', 'y', 'aim', 'hp', 'maxHp', 'dead', 'rollT', 'rollDir', 'cur', 'vx', 'vy', 'inv', 'walkT', 'muzzleT', 'meleeT', 'recoil', 'playDead', 'hidden', 'battery', 'stamina', 'armor', 'grenades', 'mines', 'decoys', 'money', 'reloadT', 'charging', 'charge', 'spCd', 'spMax', 'flashCd', 'exhausted', 'hpTrail', 'char', 'downX', 'downY', 'revT', 'slowT', 'dazeT', 'carry'];
const NET_ZS = ['type', 'r', 'skin', 'cloth', 'pants', 'costume', 'spawnMax', 'spawnKind', 'seed', 'mini', 'mk', 'bkind', 'ultimate', 'title', 'maxHp', 'target'];
const NET_BOSS = ['state', 'st', 'phase', 'weakT', 'rageT', 'jumpZ', 'echoA', 'ramA', 'bladeA', 'entry', 'dir', 'hp', 'maxHp', 'r'];
// propriétés calculées du joueur (accesseurs) : on ne les écrit pas
const NET_RO = new Set(Object.entries(Object.getOwnPropertyDescriptors(Player.prototype)).filter(([, d]) => d.get && !d.set).map(([k]) => k));
const netR = v => typeof v === 'number' ? Math.round(v * 100) / 100 : v;
// copie « à plat » d'un objet : nombres arrondis, textes, booléens (pas de références)
const netFlat = o => { const r = {}; for (const k in o) { const v = o[k]; if (typeof v === 'number') r[k] = Math.round(v * 10) / 10; else if (typeof v === 'string' || typeof v === 'boolean') r[k] = v; } return r; };
mixin(Game, {
  netEmit(e) { if (this.net === 'host' && this.netEv && !this._noNetFx) this.netEv.push(e); },
  netWrapAudio() {
    const A = this.audio; if (A._netWrapped) return; A._netWrapped = true; A._d = 0;
    const skip = new Set(['constructor', 'init', 'setTheme', 'musicTick', 'applyVolume', 'at', 'can', 'flame', 'alarmStart', 'alarmStop', 'ui']);
    const plain = v => v == null || typeof v !== 'object' ? typeof v !== 'function' : Object.values(v).every(x => typeof x !== 'object' && typeof x !== 'function');
    for (const k of Object.getOwnPropertyNames(AudioSys.prototype)) {
      if (skip.has(k) || typeof A[k] !== 'function') continue; const f = A[k].bind(A), low = k === 'tone' || k === 'noise';
      A[k] = (...args) => { if (this.net === 'host' && this.netEv && !this._noNetFx && !(low && A._d > 0) && args.every(plain)) this.netEv.push(['snd', k, args.map(v => v && typeof v === 'object' ? netFlat(v) : netR(v))]); A._d++; try { return f(...args); } finally { A._d--; } };
    }
  },
  // ----- hôte
  netAttachP2(gc, x, y) {
    const p = this.player, c1 = this.charKey; this.charKey = CHARS[gc] ? gc : 'zeus'; const q = new Player(this, x, y); this.charKey = c1; q.isP2 = true; q.inv = 1.5;
    q.money = p.money; q.weapons.forEach((w, i) => { const o = p.weapons[i]; w.owned = o.owned; w.ammo = o.ammo; w.reserve = o.reserve; }); this.p2 = q;
  },
  newOnlineStory(gc) {
    this.newGame(); this.net = 'host'; this.coop = true; this.netEv = []; this.netH = { t: 0, cnt: {}, prevF: false, pend: {} }; this.netIn = null; this.netWrapAudio();
    this.netAttachP2(gc, 190, 640);
    if (this.state === 'comic' && this.comic.key) this.netEmit(['comic', this.comic.key]); // le prologue s'est ouvert avant la connexion
  },
  newOnlineSurvival(gc) {
    this.newSurvival(false); this.net = 'host'; this.coop = true; this.netEv = []; this.netH = { t: 0, cnt: {}, prevF: false, pend: {} }; this.netIn = null; this.netWrapAudio();
    const p = this.player, c1 = this.charKey; this.charKey = CHARS[gc] ? gc : 'zeus'; const q = new Player(this, PLAZA + 50, 820); this.charKey = c1; q.isP2 = true; q.inv = 1.5;
    q.money = p.money; q.weapons.forEach((w, i) => { const o = p.weapons[i]; w.owned = o.owned; w.ammo = o.ammo; w.reserve = o.reserve; }); this.p2 = q;
  },
  netStartHost(mode) { const pr = Net.peer; if (!pr) return; mode = mode || this.netMode || 'survival'; this.netMode = mode; Net.send({ t: 'start', mode, diff: this.diffKey, hc: this.charKey, gc: pr.char, hn: Settings.name || 'Hôte' }, true); if (mode === 'story') this.newOnlineStory(pr.char); else this.newOnlineSurvival(pr.char); },
  netRemoteInput() {
    const a = this.act2n || (this.act2n = {}), q = this.p2, m = this.netIn || {}, H = this.netH;
    for (const k of ['fire', 'firePressed', 'sprint', 'melee', 'grenade', 'mine', 'decoy', 'reload', 'special', 'roll', 'flash', 'wheelHeld']) a[k] = false;
    a.cycle = 0; a.slot = -1; a.wheelDir = null; a.gpAim = true; a.pause = false;
    a.moveX = clamp(+m.mx || 0, -1, 1); a.moveY = clamp(+m.my || 0, -1, 1); const ang = isFinite(m.a) ? +m.a : q.aim; a.aimX = q.x + Math.cos(ang) * 240; a.aimY = q.y + Math.sin(ang) * 240;
    if (H.pos && !q.dead) { const [px, py] = H.pos; H.pos = null; if (dist2(px, py, q.x, q.y) < 320 * 320) { q.x = px; q.y = py; this.collideWorld(q); } }
    a.fire = !!m.f; const P = H.pend; for (const k of NET_EDGES) if (P[k] > 0) { P[k]--; if (k === 'cycleUp') a.cycle = 1; else if (k === 'cycleDown') a.cycle = -1; else a[k] = true; }
    if (m.sl >= 0 && m.sl !== H.lastSl) { H.lastSl = m.sl; a.slot = m.sl; }
    return a;
  },
  netHostMsg(d) {
    if (!d || this.net !== 'host') return;
    if (d.t === 'I') { const H = this.netH; if ((d.n | 0) <= (H.lastIn | 0) && d.n) return; H.lastIn = d.n | 0; if (isFinite(d.px)) H.pos = [d.px, d.py]; for (const k of NET_EDGES) { const c = (d.c && d.c[k]) | 0, o = H.cnt[k] | 0; if (c > o) H.pend[k] = Math.min(3, (H.pend[k] | 0) + c - o); H.cnt[k] = c; } this.netIn = d; }
    else if (d.t === 'need') { const out = []; for (const z of this.zombies) if (d.ids.includes(z.nid)) out.push([z.nid, z instanceof UltimateBoss ? 'u' : z instanceof MiniBoss ? 'm' : z instanceof Boss ? 'b' : 'z', NET_ZS.map(k => z[k])]); if (out.length) Net.send({ t: 'ZS', z: out }, true); }
    else if (d.t === 'pause') { this._netQuiet = true; this.pause(); this._netQuiet = false; }
    else if (d.t === 'resume') { this._netQuiet = true; this.resume(); this._netQuiet = false; }
  },
  netHostTick(dt) {
    if (this.net !== 'host' || !Net.peer) return; const H = this.netH;
    // effets groupés : au plus 30 envois par seconde en direct ; par le relais, ils partent avec l'état de la partie
    H.et = (H.et || 0) - dt; if (this.netEv.length && !Net.relay && H.et <= 0) { Net.send({ t: 'E', e: this.netEv }, true); this.netEv = []; H.et = 1 / 30; }
    if ((H.t -= dt) > 0) return; H.t = Net.relay ? 1 / 15 : 1 / 20; H.seq = (H.seq | 0) + 1;
    const q = this.p2, near = o => Math.abs(o.x - q.x) < 950 && Math.abs(o.y - q.y) < 700, pl = p => NET_PK.map(k => netR(p[k]));
    if (!Net.relay && Net.fast && Net.fast.bufferedAmount > 48000) return; // le réseau sature : on saute un envoi plutôt que d'empiler du retard
    const Z = [], B = [];
    for (const z of this.zombies) { if (z.dead || !(near(z) || z === this.bossRef || (this.cine && z === this.cine.b))) continue; /* le boss part toujours, même loin : cinématique et barre de vie chez l'invité */ const row = [z.nid, Math.round(z.x), Math.round(z.y), Math.round(z.dir * 100), Math.round(z.walkT * 10), Math.round(z.hp), (z.hitFlash > 0 ? 1 : 0) | (z.burn > 0 ? 2 : 0) | (z.stun > 0 ? 4 : 0) | (z.lunge > 0 ? 8 : 0), Math.round((z.spawnT || 0) * 100), NET_BSTATE.indexOf(z.bState)]; if (z.type === 'dog' || z.type === 'spitter' || z.type === 'brute') row.push(Math.round((z.spitWind || 0) * 100), netR(z.bT || 0), netR(z.cdx || 0), netR(z.cdy || 0)); Z.push(row);
      if (z.type === 'boss') { const o = {}; for (const k of NET_BOSS) if (z[k] !== undefined) o[k] = typeof z[k] === 'number' ? netR(z[k]) : z[k]; B.push([z.nid, o]); } }
    const flat = (arr, f) => arr.filter(o => !o.dead && near(o)).map(o => f ? f(o) : netFlat(o));
    const S = { t: 'S', n: H.seq, P: [pl(this.player), pl(q)], Z, B,
      b: flat(this.bullets.filter(b => !(b.p2 && !b.charged)), b => [Math.round(b.x), Math.round(b.y), Math.round(b.vx), Math.round(b.vy), b.charged ? 1 : 0]),
      ac: flat(this.acids), pu: flat(this.puddles), fi: flat(this.fires), sw: flat(this.shockwaves), th: flat(this.throwables), mi: flat(this.mines), ro: flat(this.rockets), fl: flat(this.flames), be: this.beams.map(netFlat),
      hz: this.hazards.filter(h => !h.dead).map(h => { const o = netFlat(h); o.hid = h.hid; if (h.boss) o.bn = h.boss.nid; if (h.ob) o.ob = netFlat(h.ob); if (h.hooked) o.hk = h.hooked === this.p2 ? 2 : 1; return o; }),
      pk: flat(this.pickups), ca: this.level.obstacles.filter(o => (o.kind === 'car' || o.kind === 'machine' || o.kind === 'generator') && near(o)).map(o => [o.oid, Math.round(o.hp) || 0, o.wreck ? 1 : 0, netR(o.burning || 0), netR(o.alarm || 0), o.broken || o.on ? 1 : 0, o.charges | 0]),
      G: { sc: Math.floor(this.score), mu: netR(this.mult), ki: this.kills, li: this.lives, bo: this.bossRef && !this.bossRef.dead ? this.bossRef.nid : 0, bk: netR(this.blackoutT || 0), ff: netR(this.flashFx || 0), tf: netR(this.torchFlicker || 0), th: this.audio.themeName, mi: this.bossRef && !this.bossRef.dead ? 1 : 0.5,
        ci: this.cine ? [this.cine.b.nid, netR(this.cine.t)] : 0, ob: this.objective().text, st: this.state, md: this.mode, az: this.activeZone, sn: this.safeName || '', sf: this.shibaFound ? this.shibaFound.size : 0, mo: Math.floor(this.player.money || 0),
        svv: this.survivors.filter(v => !v.dead).map(v => netFlat(v)), ev: this.event ? netFlat(this.event) : 0, bu: this.buddy ? netFlat(this.buddy) : 0, p1d: netR(this.p1Down || 0), rv: this.reviveUsed ? 1 : 0, sv: this.surv ? [this.surv.wave, this.surv.state, netR(this.surv.t)] : 0 } };
    // ce qui change rarement (armes, objectifs, éclairage) n'est renvoyé que s'il a changé, ou une fois par seconde
    const L = { W: q.weapons.map(w => [w.owned ? 1 : 0, w.ammo, w.reserve, w.lvl ? netFlat(w.lvl) : 0]), oj: this.mode === 'story' ? this.level.obj.map(o => o ? netFlat(o) : 0) : 0, lp: this.level.lamps.map(l => l.on ? 1 : 0).join('') }, Ls = JSON.stringify(L);
    if (Ls !== H.lastL || H.seq % 20 === 0) { S.L = L; H.lastL = Ls; }
    if (Net.relay && this.netEv.length) { S.e = this.netEv; this.netEv = []; }
    Net.send(S, !!S.e);
  },
  // ----- invité
  netStartGuest(m) {
    const mine = this.charKey; this.diffKey = DIFFS[m.diff] ? m.diff : 'normal'; if (m.mode === 'story') { this.newGameCore(); this.prologueSeen = true; } else this.newSurvival(false); this.netGuest = true; this.net = 'guest'; this.coop = true; this.netMode = m.mode;
    this.zombies = []; this.pickups = []; this.zmap = new Map(); this.zage = new Map(); this.netNeed = new Set(); this.director.queue = 0; this.savedScore = false;
    const me = this.player; me.isP2 = true; if (m.mode === 'story') { me.x = 190; me.y = 640; } this.charKey = CHARS[m.hc] ? m.hc : 'pedro'; const h = new Player(this, m.mode === 'story' ? 140 : PLAZA, m.mode === 'story' ? 600 : 780); this.charKey = mine; this.p2 = h;
    this.zoneEntered = [true, true, true, true]; this.safeEntered = [true, true, true]; this.survivors = [];
    this.oidMap = new Map(this.level.obstacles.map(o => [o.oid, o])); this.netG = { inT: 0, cnt: {}, objv: { text: '', tx: null }, hz: new Map(), last: performance.now() };
    this.banner('Duo en ligne', `Avec ${Net.peer ? Net.peer.name : 'ton ami'} · ${m.mode === 'story' ? 'Opération Couvre-Feu' : 'Place de la Mairie'}`);
  },
  netGuestMsg(d) {
    if (!d) return;
    if (d.t === 'start') { closeHubModals(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); this.netStartGuest(d); return; }
    if (!this.netGuest) return; this.netG.last = performance.now();
    if (d.t === 'S') { const N = this.netG; if (d.n <= (N.lastN | 0)) return; N.lastN = d.n; const now = performance.now(); if (N.lastS) N.iv = clamp(lerp(N.iv || 50, now - N.lastS, 0.2), 30, 250); N.lastS = now; this.netApply(d); if (d.e) for (const e of d.e) this.netFx(e); }
    else if (d.t === 'E') for (const e of d.e) this.netFx(e);
    else if (d.t === 'ZS') for (const [nid, cls, vals] of d.z) { if (this.zmap.has(nid)) continue; const C = cls === 'u' ? UltimateBoss : cls === 'm' ? MiniBoss : cls === 'b' ? Boss : Zombie, z = Object.create(C.prototype);
      Object.assign(z, { g: this, nid, x: 0, y: 0, dir: 0, walkT: 0, hp: 1, spawnT: 0, hitFlash: 0, burn: 0, stun: 0, lunge: 0, bState: 'walk', dead: false, kx: 0, ky: 0 }); NET_ZS.forEach((k, i) => { if (vals[i] !== undefined && vals[i] !== null) z[k] = vals[i]; }); if (z.mini) z.cfg = MINI_BOSSES[z.mk]; z._new = true; this.zmap.set(nid, z); this.netNeed.delete(nid); }
    else if (d.t === 'pz') { this._netQuiet = true; if (d.on) this.pause(); else this.resume(); this._netQuiet = false; }
    else if (d.t === 'end') { this.score = d.sc; this.kills = d.ki; if (this.surv) this.surv.wave = d.wv; this.runTime = d.rt; this.lastVictory = !!d.vi; netWait(null); this.state = 'playing'; this.netGuestEnd = true; this.showEnd(!!d.vi); }
  },
  netApply(S) {
    const me = this.player, h = this.p2, set = (p, row, skipPos) => NET_PK.forEach((k, i) => { if (skipPos && (k === 'x' || k === 'y' || k === 'aim' || k === 'walkT')) return; if (row[i] !== undefined && row[i] !== null && !NET_RO.has(k)) p[k] = row[i]; });
    const now = performance.now();
    set(h, S.P[0], true); h._fx = h.x; h._fy = h.y; h._tx = S.P[0][0]; h._ty = S.P[0][1]; h._ta = S.P[0][2]; h._t0 = now; if (h._snap !== true || Math.hypot(h._tx - h.x, h._ty - h.y) > 300) { h.x = h._fx = h._tx; h.y = h._fy = h._ty; h._snap = true; } h.walkT = S.P[0][12];
    const hp0 = me.hp; set(me, S.P[1], true); if (me.hp < hp0 - 0.5) this.hurtFlash = Math.min(1, (this.hurtFlash || 0) + 0.6);
    // sa position fait foi : on ne recale que s'il y a un vrai écart (réanimation, téléportation, mort)
    const tx = S.P[1][0], ty = S.P[1][1], err = Math.hypot(tx - me.x, ty - me.y); if (err > 300 || me.dead || !this._meSync || (this._wasDead && !me.dead)) { me.x = tx; me.y = ty; this._meSync = true; } this._wasDead = me.dead;
    if (S.L) { this.netG.L = S.L; } const L = this.netG.L || {};
    if (S.L) (S.L.W || []).forEach((w, i) => { const o = me.weapons[i]; if (!o) return; o.owned = !!w[0]; o.ammo = w[1]; o.reserve = w[2]; if (w[3]) Object.assign(o.lvl || (o.lvl = {}), w[3]); });
    const seen = new Set(), need = [];
    for (const r of S.Z) { const nid = r[0], z = this.zmap.get(nid); seen.add(nid); if (!z) { if (!this.netNeed.has(nid)) { this.netNeed.add(nid); need.push(nid); } continue; }
      z._fx = z.x; z._fy = z.y; z._tx = r[1]; z._ty = r[2]; z._t0 = now; if (z._new || Math.hypot(r[1] - z.x, r[2] - z.y) > 260) { z.x = z._fx = r[1]; z.y = z._fy = r[2]; z._new = false; } z.dir = r[3] / 100; z.walkT = r[4] / 10; z.hp = r[5]; const f = r[6]; z.hitFlash = f & 1 ? 0.06 : 0; z.burn = f & 2 ? 1 : 0; z.stun = f & 4 ? 1 : 0; z.lunge = f & 8 ? 0.1 : 0;
      z.spawnT = r[7] / 100; z.bState = NET_BSTATE[r[8]] || 'walk'; z.spitWind = (r[9] || 0) / 100; z.bT = r[10] || 0; z.cdx = r[11] || 0; z.cdy = r[12] || 0; this.zage.set(nid, 0); }
    for (const [nid, o] of S.B) { const z = this.zmap.get(nid); if (z) Object.assign(z, o); }
    if (need.length) Net.send({ t: 'need', ids: need }, true);
    for (const [nid, z] of this.zmap) if (!seen.has(nid)) { const a = (this.zage.get(nid) || 0) + 1; this.zage.set(nid, a); if (a > 3) { this.zmap.delete(nid); this.zage.delete(nid); } }
    this.zombies = [...this.zmap.values()];
    this._hb = S.b.map(([x, y, vx, vy, ch]) => ({ x, y, px: x, py: y, vx, vy, charged: !!ch, dead: false })); this.bullets = this._hb.concat(this.netG.lb || []);
    this.acids = S.ac; this.puddles = S.pu; this.fires = S.fi; this.shockwaves = S.sw; this.throwables = S.th; this.mines = S.mi; this.rockets = S.ro; this.flames = S.fl; this.beams = S.be;
    this.pickups = S.pk.map(o => Object.assign(Object.create(Pickup.prototype), o, { g: this }));
    // dangers des boss (et barrières posées dans le décor)
    const H = this.netG.hz, alive = new Set();
    this.hazards = S.hz.map(o => { alive.add(o.hid); const hz = Object.assign(Object.create(Hazard.prototype), o, { g: this }); if (o.bn) hz.boss = this.zmap.get(o.bn); if (o.hk) hz.hooked = o.hk === 2 ? me : h;
      if (o.ob && !H.has(o.hid)) { const ob = this.level.add(Object.assign({}, o.ob, { zone: -2 })); this.level.rebuildGrid(); H.set(o.hid, ob); } return hz; });
    for (const [hid, ob] of H) if (!alive.has(hid)) { this.level.removeObstacle(ob); H.delete(hid); }
    for (const [oid, hp, wr, bu, al, br, chg] of S.ca) { const o = this.oidMap.get(oid); if (!o) continue; o.hp = hp; o.wreck = !!wr; o.burning = bu; o.alarm = al; if (o.kind === 'machine') { o.broken = !!br; o.charges = chg; } if (o.kind === 'generator') o.on = !!br; }
    const G = S.G; this.score = G.sc; this.mult = G.mu; this.kills = G.ki; this.lives = G.li; this.blackoutT = G.bk; this.flashFx = Math.max(this.flashFx || 0, G.ff); this.torchFlicker = G.tf; this.netG.objv = { text: G.ob || '', tx: null }; this.netG.mi = G.mi;
    if (G.th && G.th !== this.audio.themeName) this.audio.setTheme(G.th);
    this.bossRef = G.bo ? this.zmap.get(G.bo) || null : null; this.p1Down = G.p1d; this.reviveUsed = !!G.rv; if (G.sv && this.surv) { this.surv.wave = G.sv[0]; this.surv.state = G.sv[1]; this.surv.t = G.sv[2]; }
    if (G.ci) { const b = this.zmap.get(G.ci[0]); if (b) { this.cine = this.cine && this.cine.b === b ? this.cine : { b, t: G.ci[1], t0: performance.now() }; } } else if (this.cine) { this.cine = null; this.bannerObj = null; }
    // campagne : objectifs, survivants, éclairage, événement, shiba compagnon
    if (G.md === 'story') {
      this.activeZone = G.az; this.safeName = G.sn || null; if (!this.shibaFound || this.shibaFound.size !== G.sf) this.shibaFound = new Set(Array.from({ length: G.sf }, (_, i) => 'n' + i));
      if (S.L && L.oj) L.oj.forEach((o, k) => { if (o && this.level.obj[k]) Object.assign(this.level.obj[k], o); });
      this.survivors = (G.svv || []).map(o => Object.assign(Object.create(Survivor.prototype), o, { g: this }));
      if (S.L && L.lp) this.level.lamps.forEach((l, i) => { l.on = L.lp[i] === '1'; });
      this.event = G.ev ? Object.assign({}, G.ev) : null; this.buddy = G.bu ? Object.assign({}, G.bu) : null;
    }
    me.money = G.mo;
    // l'hôte lit une BD, regarde la carte ou fait ses achats : l'invité patiente
    const N = this.netG; N.hostSt = G.st;
    if (G.st === 'playing' || G.st === 'paused' || G.st === 'end') { netWait(null); if (this.state === 'comic' && G.st === 'playing') this.comic.finish(); }
    else if (this.state !== 'comic') netWait(G.st === 'comic' ? 'Ton ami lit la BD…' : G.st === 'map' ? 'Ton ami regarde la carte et prépare la prochaine mission…' : G.st === 'shop' ? 'Ton ami fait ses achats au marché noir…' : 'En attente de ton ami…');
  },
  netFx(e) {
    const [k, ...a] = e;
    switch (k) {
      case 'snd': { const f = this.audio[a[0]]; if (typeof f === 'function') try { f.apply(this.audio, a[1]); } catch (er) { } break; }
      case 'bleed': this.bleed(...a); break;
      case 'scorch': this.scorch(...a); break;
      case 'light': this.addLight(...a); break;
      case 'shake': this.shake(a[0]); break;
      case 'toast': if (!/marché noir|Distributeur|trousse|Santé déjà|munitions|en recharge|^Plus de /.test(a[0])) this.toast(a[0], a[1]); break;
      case 'banner': this.banner(a[0], a[1]); break;
      case 'text': this.floatText(...a); break;
      case 'slow': this.slowT = a[0]; this.slowMax = a[0]; this.slowLabel = a[1]; break;
      case 'boom': { const [x, y, R] = a; for (let i = 0; i < 26; i++) { const an = rand(0, TAU), s = rand(40, R * 2.4); this.spawnP({ x, y, z: rand(4, 20), vx: Math.cos(an) * s, vy: Math.sin(an) * s, vz: rand(20, 120), life: rand(0.3, 0.7), type: 'fire', size: rand(8, 16), emissive: true, drag: 3.5 }); } for (let i = 0; i < 14; i++) { const an = rand(0, TAU), s = rand(20, R); this.spawnP({ x, y, z: 10, vx: Math.cos(an) * s, vy: Math.sin(an) * s, life: rand(1, 2.2), type: 'smoke', size: rand(10, 18), grow: 22, drag: 1.5 }); } break; }
      case 'die': { const z = this.zmap.get(a[0]); if (z) { z.x = a[1]; z.y = a[2]; z.dead = true; try { this.bakeCorpse(z); } catch (er) { } for (let i = 0; i < (z.type === 'brute' ? 6 : 3); i++) this.spawnP({ x: z.x, y: z.y, z: 14, vx: rand(-160, 160), vy: rand(-160, 160), vz: rand(60, 220), grav: 700, life: 2, type: 'gib', size: rand(3, 5), bake: true, color: '#5a1410' }); this.zmap.delete(a[0]); this.zombies = [...this.zmap.values()]; } break; }
      case 'rmob': { const o = this.oidMap.get(a[0]); if (o) { if (o.light) o.light.i = 0; this.level.removeObstacle(o); } break; }
      case 'gate': this.level.setGate(a[0], a[1]); break;
      case 'cine': break;
      case 'comic': if (ACTS[a[0]]) { netWait(null); this.comic.show(a[0], null); } break;
      case 'kb': { const N = this.netG; if (N) { N.kx = (N.kx || 0) + a[0]; N.ky = (N.ky || 0) + a[1]; } break; }
    }
  },
  updateGuest(dt, inp) {
    const N = this.netG, me = this.player, h = this.p2;
    if (this.portrait) return;
    if (N.hostSt && N.hostSt !== 'playing' && N.hostSt !== 'paused') { this.updateCommon(dt); return; }
    if (inp.pause) { this.pause(); return; }
    // commandes envoyées à l'hôte (les appuis sont comptés pour ne jamais se perdre)
    const C = N.cnt; for (const k of NET_EDGES) if (k !== 'cycleUp' && k !== 'cycleDown' && inp[k]) C[k] = (C[k] | 0) + 1; if (inp.cycle > 0) C.cycleUp = (C.cycleUp | 0) + 1; if (inp.cycle < 0) C.cycleDown = (C.cycleDown | 0) + 1;
    if (inp.slot >= 0) N.sl = inp.slot;
    me.aim = Math.atan2(inp.aimY - me.y, inp.aimX - me.x) || me.aim;
    if ((N.inT -= dt) <= 0) { N.inT = Net.relay ? 1 / 15 : 1 / 30; N.inN = (N.inN | 0) + 1; Net.send({ t: 'I', n: N.inN, px: Math.round(me.x), py: Math.round(me.y), mx: netR(inp.moveX || 0), my: netR(inp.moveY || 0), a: Math.round(me.aim * 1000) / 1000, f: inp.fire ? 1 : 0, c: C, sl: N.sl == null ? -1 : N.sl }, false); }
    // prédiction locale de son perso, lissage du reste
    if (!me.dead && !this.cine) {
      if (inp.roll && !(N.rollT > 0) && (N.rollCd || 0) <= 0 && me.stamina >= 18) { N.rollT = ROLL_T; N.rollCd = 0.55; N.rollDir = Math.hypot(inp.moveX || 0, inp.moveY || 0) > 0.1 ? Math.atan2(inp.moveY, inp.moveX) : me.aim; }
      N.rollCd = (N.rollCd || 0) - dt; let vx, vy;
      if (N.rollT > 0) { N.rollT -= dt; const rs = 560 * (0.45 + 0.75 * Math.max(0, N.rollT) / ROLL_T); vx = Math.cos(N.rollDir) * rs; vy = Math.sin(N.rollDir) * rs; }
      else { const sp = (me.char === 'dobby' ? 222 : 195) * (me.slowT > 0 ? 0.5 : 1) * (me.dazeT > 0 ? 0.12 : 1); vx = (inp.moveX || 0) * sp; vy = (inp.moveY || 0) * sp; }
      const kd = Math.exp(-7 * dt); N.kx = (N.kx || 0) * kd; N.ky = (N.ky || 0) * kd;
      me.x += (vx + N.kx) * dt; me.y += (vy + N.ky) * dt; this.collideWorld(me); me.walkT += dt * Math.hypot(inp.moveX || 0, inp.moveY || 0) * 11;
    }
    // interpolation linéaire entre deux états, au rythme mesuré des envois (légère extrapolation si un paquet tarde)
    const now = performance.now(), iv = N.iv || 50, k = 1 - Math.exp(-14 * dt), lerpTo = o => { if (o._tx == null) return; const u = clamp((now - o._t0) / iv, 0, 1.25); o.x = o._fx + (o._tx - o._fx) * u; o.y = o._fy + (o._ty - o._fy) * u; };
    if (h._tx != null) { lerpTo(h); h.aim += angDiff(h.aim, h._ta) * k; }
    for (const z of this.zombies) lerpTo(z);
    for (const b of this._hb || []) { b.px = b.x; b.py = b.y; b.x += b.vx * dt; b.y += b.vy * dt; }
    this.netGuestShots(dt, inp); this.bullets = (this._hb || []).concat(N.lb);
    for (const f of this.fires) if (Math.random() < dt * f.r * 0.5) { const a = rand(0, TAU), d = Math.sqrt(Math.random()) * f.r; this.spawnP({ x: f.x + Math.cos(a) * d, y: f.y + Math.sin(a) * d, z: 2, vz: rand(40, 90), vx: rand(-10, 10), vy: rand(-10, 10), life: rand(0.4, 0.8), type: 'fire', size: rand(5, 9), emissive: true }); }
    if (this.slowT > 0) this.slowT -= dt; if (this.flashFx > 0) this.flashFx -= dt; if (this.hurtFlash > 0) this.hurtFlash -= dt * 2;
    this.updateCommon(dt);
    if (this.bannerObj) { this.bannerObj.t -= dt; if (this.bannerObj.t <= 0) this.bannerObj = null; }
    // caméra : sur soi, ou sur le boss pendant sa cinématique
    const S = VS * DPR * (this.zoom || 1), hw = W / 2 / S, hh = H / 2 / S; let tx = me.dead && !h.dead ? h.x : me.x, ty = me.dead && !h.dead ? h.y : me.y;
    if (this.cine) { const E = this.cine.b.entry; tx = E ? E.tx : this.cine.b.x; ty = (E ? E.ty : this.cine.b.y) - this.cine.b.r * 1.4; this.zoom = lerp(this.zoom || 1, 1.6, 1 - Math.exp(-4 * dt)); this.cineK = Math.min(1, (this.cineK || 0) + dt * 3); }
    else { this.zoom = lerp(this.zoom || 1, 1, 1 - Math.exp(-4 * dt)); this.cineK = Math.max(0, (this.cineK || 0) - dt * 2.5); if (!me.dead) { const lead = TOUCH ? (this.input.sticks.aim ? 1 : 0.6) : 1; tx += Math.cos(me.aim) * 150 * lead; ty += Math.sin(me.aim) * 110 * lead; } }
    const kc = 1 - Math.exp(-5 * dt); this.cam.x = lerp(this.cam.x, tx, kc); this.cam.y = lerp(this.cam.y, ty, kc);
    this.cam.x = clamp(this.cam.x, hw, WORLD.w - hw); this.cam.y = hh * 2 >= 1280 ? 560 : clamp(this.cam.y, -110 + hh, 1170 - hh);
    this.trauma = Math.max(0, this.trauma - dt * 1.5); const sh = this.trauma * this.trauma * 16; this.shakeX = rand(-sh, sh); this.shakeY = rand(-sh, sh);
    this.audio.musicTick(N.mi || 0.5);
    const lag = performance.now() - N.last;
    if (lag > 4000 && !N.lostTip) { N.lostTip = true; this.toast('Connexion avec l\'hôte perdue… reconnexion', '#ff8a5a'); }
    if (lag < 1000) N.lostTip = false;
    if (lag > 15000) { this.netLeave('La connexion avec l\'hôte est perdue.'); }
  },
  // l'invité voit ses propres balles partir sans attendre l'hôte (l'hôte reste seul juge des dégâts)
  netGuestShots(dt, inp) {
    const N = this.netG, me = this.player, w = me.weapon, d = w && w.def; N.lb = N.lb || []; N.fcd = (N.fcd || 0) - dt;
    if (d && d.type === 'bullet' && !me.dead && !this.cine && !(me.reloadT > 0) && w.ammo > 0 && N.fcd <= 0 && (d.id === 'pistol' ? inp.firePressed : inp.fire)) {
      N.fcd = w.rate(); w.ammo--; me.muzzleT = 0.05; me.recoil = 1; const m = me.muzzle();
      for (let i = 0; i < d.pellets; i++) { const a = me.aim + (Math.random() - 0.5) * d.spread, sp = d.speed * rand(0.9, 1.1); N.lb.push({ x: m.x, y: m.y, px: m.x, py: m.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, charged: false, dead: false, life: 0.9, pierce: d.pierce, hit: new Set() }); }
      this.lights.push({ x: m.x, y: m.y, r: d.id === 'shotgun' ? 280 : 210, c: '255,205,130', i: 1, life: 0.06, max: 0.06, dead: false });
      this.spawnP({ x: me.x, y: me.y, z: 16, vx: Math.cos(me.aim + 1.6) * rand(60, 110), vy: Math.sin(me.aim + 1.6) * rand(60, 110), vz: rand(90, 160), grav: 600, drag: 1.5, life: 3, type: 'casing', size: 3, bake: true, color: '#b8913c', vr: rand(-20, 20) });
      for (let i = 0; i < 4; i++) this.spawnP({ x: m.x, y: m.y, z: 14, vx: Math.cos(me.aim + rand(-0.4, 0.4)) * rand(150, 400), vy: Math.sin(me.aim + rand(-0.4, 0.4)) * rand(150, 400), life: 0.12, type: 'spark', size: 1.5, emissive: true });
      this.trauma = Math.min(1, this.trauma + d.shake * (Settings.calm ? 0.25 : 1)); this.audio.shot(d.id, false);
    }
    for (const b of N.lb) {
      b.px = b.x; b.py = b.y; if ((b.life -= dt) <= 0) { b.dead = true; continue; }
      const dx = b.vx * dt, dy = b.vy * dt, st = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 12));
      for (let s = 0; s < st && !b.dead; s++) { b.x += dx / st; b.y += dy / st;
        if (this.level.pointObstacle(b.x, b.y)) { const sp = Math.hypot(b.vx, b.vy) || 1; this.sparks(b.x, b.y, -b.vx / sp, -b.vy / sp, 4); b.dead = true; break; }
        for (const z of this.zombies) { if (z.dead || z.spawnT > 0 || b.hit.has(z)) continue; const rr = z.r + 3; if (dist2(b.x, b.y, z.x, z.y) < rr * rr) { b.hit.add(z); z.hitFlash = 0.06; if (--b.pierce < 0) { b.dead = true; break; } } } }
    }
    N.lb = N.lb.filter(b => !b.dead);
  },
  netLeave(msg) {
    netWait(null); const was = this.net; Net.close(); this.net = null; this.netGuest = false; this.netGuestEnd = false; this.coop = false; this.p2 = null; this.cine = null;
    if (msg) setTimeout(() => netNotice(msg), 50);
    if (was && this.state !== 'title') { this.audio.flame(false); this.setupDemo(); this.showScreen('scr-title'); refreshContinue(); }
  }
});
// ---------- écran « Duo en ligne »
function netWait(msg) { const el = $('net-wait'); if (!el) return; if (!msg) { el.hidden = true; return; } $('net-wait-t').textContent = msg; el.hidden = false; }
function netView(v) { for (const id of ['net-choose', 'net-hostv', 'net-joinv']) $(id).hidden = id !== v; }
function netNotice(msg) { $('net-modal').hidden = false; netView(null); $('net-note').textContent = msg; $('net-close').focus(); }
function openNet() {
  game.audio.init(); game.audio.ui(); $('net-modal').hidden = false; netView('net-choose'); $('net-st-h').textContent = ''; $('net-st-j').textContent = '';
  $('net-note').textContent = Net.local() && !/[?&]netlocal\b/.test(location.search) ? 'Le jeu à distance s\'active dès que le compte Supabase est branché. En attendant, ça marche entre deux onglets du même navigateur.' : 'Campagne ou Survie à deux. Ton ami peut être sur téléphone ou sur PC.';
  requestAnimationFrame(() => { $('net-host').focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo($('net-host')); });
}
Net.onState = (s, x) => {
  const host = Net.role === 'host', st = $(host ? 'net-st-h' : 'net-st-j');
  if (s === 'connecting') st.textContent = 'Connexion au service de mise en relation…';
  else if (s === 'waiting') st.textContent = 'En attente de ton ami…';
  else if (s === 'joining') st.textContent = 'Recherche de la partie…';
  else if (s === 'peer') { st.textContent = host ? `${x.name} (${CHARS[x.char].name}) a rejoint ! Connexion en cours…` : `Connecté à la partie de ${x.name}. Connexion en cours…`; game.audio.objective(); }
  else if (s === 'ready') { st.textContent = host ? `${Net.peer.name} est prêt (${x === 'direct' ? 'connexion directe' : 'via le relais'}). Lance quand tu veux !` : `Prêt ! (${x === 'direct' ? 'connexion directe' : 'via le relais'}) · ${Net.peer.name} choisit le mode et lance la partie…`; if (host) { $('net-go').disabled = false; $('net-go-story').disabled = false; $('net-go-story').focus(); } }
  else if (s === 'error') { st.textContent = x || 'Erreur de connexion.'; if (!host) $('net-ok').disabled = false; }
  else if (s === 'left' || s === 'lost') {
    if (game.net === 'host') { game.toast(`${Net.peer ? Net.peer.name : 'Ton ami'} a quitté la partie`, '#ff8a5a'); game.p2 = null; game.coop = false; game.net = null; }
    else if (game.netGuest) game.netLeave('L\'hôte a quitté la partie.');
    else { st.textContent = 'Ton ami est parti.'; if (host) $('net-go').disabled = $('net-go-story').disabled = true; }
  }
};
Net.onData = d => { if (game.net === 'host') game.netHostMsg(d); else game.netGuestMsg(d); };
$('net-host').addEventListener('click', async () => { game.audio.ui(); const code = netCode(); $('net-code').textContent = code; $('net-go').disabled = true; netView('net-hostv'); await Net.open('host', code); });
$('net-join').addEventListener('click', () => { game.audio.ui(); netView('net-joinv'); $('net-in').value = ''; $('net-ok').disabled = false; $('net-in').focus(); });
$('net-in').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });
$('net-in').addEventListener('keydown', e => { if (e.key === 'Enter') $('net-ok').click(); });
$('net-ok').addEventListener('click', async () => { const code = $('net-in').value.trim(); if (code.length !== 4) { $('net-st-j').textContent = 'Le code fait 4 lettres.'; return; } game.audio.ui(); $('net-ok').disabled = true; await Net.open('guest', code); });
for (const [id, mode] of [['net-go', 'survival'], ['net-go-story', 'story']]) $(id).addEventListener('click', () => { if (!Net.ok()) return; game.audio.ui(); $('net-modal').hidden = true; if (TOUCH && !fsEl()) enterFullscreen(); game.netStartHost(mode); });
for (const id of ['net-cancel-h', 'net-cancel-j']) $(id).addEventListener('click', () => { game.audio.ui(); Net.close(); netView('net-choose'); });
$('net-close').addEventListener('click', () => { game.audio.ui(); $('net-modal').hidden = true; if (!game.net && !game.netGuest) Net.close(); });
$('mode-online').addEventListener('click', openNet);
window.__Net = Net;
const game = new Game();
window.__cf = game;
// réglages rangés par thème : une grille d'icônes, puis une page par thème
const SET_CATS = {
  son: ['Son', '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'],
  affichage: ['Affichage', '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>'],
  commandes: ['Commandes', '<path d="M6.5 8h11a4.5 4.5 0 0 1 4.4 5.4l-.4 1.8a2.6 2.6 0 0 1-4.6 1L15.5 14h-7l-1.4 2.2a2.6 2.6 0 0 1-4.6-1l-.4-1.8A4.5 4.5 0 0 1 6.5 8z"/><path d="M8 10.2v3.2M6.4 11.8h3.2M15.6 11h.01M17.6 13h.01"/>'],
  access: ['Accessibilité', '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'],
  online: ['En ligne', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3.4 3.2 14.6 0 18M12 3c-3.2 3.4-3.2 14.6 0 18"/>'],
  save: ['Sauvegarde', '<path d="M5 3h11.5L20 6.5V21H5z"/><path d="M8.5 3v5h7V3M8.5 21v-7h8v7"/>']
};
const pct = v => Math.round(v * 100) + ' %';
function setSummary(cat) {
  const Q = { auto: 'auto', high: 'haute', eco: 'économie' }, B = { petit: 'petits', normal: 'normaux', grand: 'grands' };
  if (cat === 'son') return `Volume ${pct(Settings.vol)} · musique ${pct(Settings.music)}`;
  if (cat === 'affichage') return `Qualité ${Q[Settings.quality] || 'auto'} · interface ${(UI_SIZES[Settings.ui] || UI_SIZES.normale)[0].toLowerCase()}`;
  if (cat === 'commandes') return TOUCH ? `Boutons ${B[Settings.btnSize] || 'normaux'}${Settings.lefty ? ' · gaucher' : ''}${Settings.fixedSticks ? ' · sticks fixes' : ''}` : 'Clavier, souris et manette';
  if (cat === 'access') { const on = [Settings.cb && 'daltonien', Settings.calm && 'effets réduits', Settings.vis === 'renforcee' && 'perso renforcé'].filter(Boolean); return on.length ? on.join(' · ').replace(/^./, c => c.toUpperCase()) : 'Rien d\'activé'; }
  if (cat === 'online') return !ONLINE.url ? 'Pas encore branché' : Settings.online !== false ? 'Classement activé' : 'Classement désactivé';
  if (cat === 'save') { const d = typeof readSave === 'function' ? readSave() : null; return d ? 'Partie en cours sauvegardée' : 'Code de transfert, remise à zéro'; }
  return '';
}
function optionsHTML(pre, cat) {
  const sw = (label, attrs, on, hint) => `<label class="set-row"><span class="set-l">${label}${hint ? `<small>${hint}</small>` : ''}</span><input type="checkbox" class="sw" ${attrs} ${on ? 'checked' : ''}></label>`;
  const rg = (label, id, attrs, val, txt, vid) => `<label class="set-row" for="${id}"><span class="set-l">${label}</span><span class="set-r"><input type="range" id="${id}" ${attrs} value="${val}"><b class="set-val"${vid ? ` id="${vid}"` : ''}>${txt}</b></span></label>`;
  const seg = (label, list, attr) => `<div class="set-row" role="group" aria-label="${label}"><span class="set-l">${label}</span><span class="sseg">${list.map(([k, v, on]) => `<button type="button" class="btn sm" ${attr}="${k}" aria-pressed="${on}">${v}</button>`).join('')}</span></div>`;
  const opt = (key, list, cur) => seg(list.label, list.v.map(([k, v]) => [k, v, cur === k]), `data-opt="${key}" data-val`);
  if (cat === 'son') return rg('Volume', `${pre}-vol`, 'min="0" max="1" step="0.05" data-fmt="pct"', Settings.vol, pct(Settings.vol)) + rg('Musique', `${pre}-music`, 'min="0" max="1" step="0.05" data-fmt="pct"', Settings.music, pct(Settings.music));
  if (cat === 'affichage') return sw('Pluie', `id="${pre}-rain"`, Settings.rain) + sw('Brouillard', `id="${pre}-fog"`, Settings.fog)
    + opt('quality', { label: 'Qualité', v: [['auto', 'Auto'], ['high', 'Haute'], ['eco', 'Éco']] }, Settings.quality)
    + seg('Taille de l\'interface', Object.entries(UI_SIZES).map(([k, v]) => [k, v[0], Settings.ui === k]), 'data-ui');
  if (cat === 'commandes') return TOUCH ? opt('btnSize', { label: 'Taille des boutons', v: [['petit', 'Petits'], ['normal', 'Normaux'], ['grand', 'Grands']] }, Settings.btnSize)
    + rg('Opacité des boutons', `${pre}-alpha`, 'data-optr="btnAlpha" min="0.3" max="1" step="0.05" data-fmt="pct"', Settings.btnAlpha, pct(Settings.btnAlpha))
    + rg('Le stick droit tire à partir de', `${pre}-fireat`, 'data-optr="fireAt" min="0.3" max="0.9" step="0.05"', +Settings.fireAt || 0.6, pct(+Settings.fireAt || 0.6), `${pre}-fireat-v`)
    + sw('Mode gaucher', 'data-optc="lefty"', Settings.lefty, 'Les sticks et les boutons changent de côté')
    + sw('Sticks fixes', 'data-optc="fixedSticks"', Settings.fixedSticks, 'Ils restent en place au lieu de suivre le pouce') : '';
  if (cat === 'access') return sw('Mode daltonien', 'data-optc="cb"', Settings.cb, 'Zones de danger en orange, gaz et acide en bleu')
    + sw('Effets réduits', 'data-optc="calm"', Settings.calm, 'Moins de tremblements, de flashs et de clignotements')
    + opt('vis', { label: 'Visibilité du perso', v: [['normale', 'Normale'], ['renforcee', 'Renforcée']] }, Settings.vis || 'normale');
  if (cat === 'online') return ONLINE.url ? sw('Classement en ligne', 'data-optc="online"', Settings.online !== false, 'Ton nom et ton score rejoignent le classement partagé') : '<p class="hint">Le classement en ligne n\'est pas encore branché.</p>';
  return '';
}
function setShell(el) {
  if (el.dataset.built) return; el.dataset.built = '1'; const cats = el.dataset.cats.split(' ').filter(k => TOUCH || k !== 'commandes' || el.id !== 'opts-pause'), ico = k => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${SET_CATS[k][1]}</svg>`;
  el.innerHTML = `<div class="set-home">${cats.map(k => `<button type="button" class="set-tile" data-setcat="${k}">${ico(k)}<b>${SET_CATS[k][0]}</b><small data-sum="${k}"></small></button>`).join('')}</div>`
    + cats.map(k => `<section class="set-page" data-page="${k}" hidden><header><button type="button" class="btn sm" data-setback aria-label="Retour aux réglages">‹</button><h4>${ico(k)}${SET_CATS[k][0]}</h4></header><div class="set-list" data-opts="${k}"></div><div class="set-extra" data-extra="${k}"></div></section>`).join('');
  if (el.id === 'opts-title') for (const n of [...$('set-stash').children]) { const x = el.querySelector(`[data-extra="${n.dataset.to}"]`); if (x) x.appendChild(n); }
  if (!TOUCH) { const c = el.querySelector('[data-opts="commandes"]'); if (c) c.innerHTML = ''; }
  el.addEventListener('click', e => {
    const t = e.target.closest('[data-setcat]'), bk = e.target.closest('[data-setback]');
    if (t) { game.audio.init(); game.audio.ui(); setOpen(el, t.dataset.setcat); }
    else if (bk) { game.audio.ui(); setHome(el); }
  });
  el.addEventListener('input', e => { const r = e.target; if (r.type !== 'range') return; const v = r.parentNode.querySelector('.set-val'); if (v && r.dataset.fmt === 'pct') v.textContent = pct(+r.value); setSums(el); });
}
function setSums(el) { for (const s of el.querySelectorAll('[data-sum]')) s.textContent = setSummary(s.dataset.sum); }
function setOpen(el, k) { el.querySelector('.set-home').hidden = true; for (const p of el.querySelectorAll('.set-page')) p.hidden = p.dataset.page !== k; const card = el.closest('.sheet-card'); if (card) card.scrollTop = 0; requestAnimationFrame(() => { const f = el.querySelector(`.set-page[data-page="${k}"] .set-list input, .set-page[data-page="${k}"] .set-list button, .set-page[data-page="${k}"] .set-extra button`); (f || el.querySelector(`.set-page[data-page="${k}"] [data-setback]`)).focus({ preventScroll: true }); }); }
function setHome(el, quiet) { if (typeof el === 'string') el = $(el); if (!el || !el.querySelector('.set-home')) return; const open = el.querySelector('.set-page:not([hidden])'); for (const p of el.querySelectorAll('.set-page')) p.hidden = true; el.querySelector('.set-home').hidden = false; setSums(el); if (!quiet) requestAnimationFrame(() => { const t = open && el.querySelector(`[data-setcat="${open.dataset.page}"]`); if (t) t.focus({ preventScroll: true }); }); }
// Échap / B : une page de réglages ouverte revient d'abord à la grille d'icônes
function setBack() { for (const el of document.querySelectorAll('.set-wrap')) if (el.offsetParent && el.querySelector('.set-page:not([hidden])')) { setHome(el); return true; } return false; }
function bindOptions(pre) {
  const el = $('opts-' + pre); setShell(el); for (const c of el.querySelectorAll('[data-opts]')) if (TOUCH || c.dataset.opts !== 'commandes') c.innerHTML = optionsHTML(pre, c.dataset.opts); setSums(el);
  const sync = () => { for (const p of ['title', 'pause']) { const e = $(p + '-rain'); if (!e) continue; e.checked = Settings.rain; $(p + '-fog').checked = Settings.fog; $(p + '-vol').value = Settings.vol; $(p + '-music').value = Settings.music; } };
  $(pre + '-rain').addEventListener('change', e => { Settings.rain = e.target.checked; Settings.save(); game.audio.applyVolume(); sync(); });
  $(pre + '-fog').addEventListener('change', e => { Settings.fog = e.target.checked; Settings.save(); sync(); });
  $(pre + '-vol').addEventListener('input', e => { Settings.vol = +e.target.value; Settings.save(); game.audio.applyVolume(); sync(); });
  $(pre + '-music').addEventListener('input', e => { Settings.music = +e.target.value; Settings.save(); game.audio.applyVolume(); sync(); });
  if (0) for (const b of el.querySelectorAll('[data-fin]')) b.addEventListener('click', () => { Settings.finisher = b.dataset.fin; Settings.save(); for (const x of document.querySelectorAll('[data-fin]')) x.setAttribute('aria-pressed', x.dataset.fin === Settings.finisher ? 'true' : 'false'); });
  const reb = () => { bindOptions('title'); bindOptions('pause'); };
  for (const b of el.querySelectorAll('[data-opt]')) b.addEventListener('click', () => { Settings[b.dataset.opt] = b.dataset.val; Settings.save(); if (b.dataset.opt === 'quality') { dprCap = 2; resize(); } reb(); });
  for (const b of el.querySelectorAll('[data-optc]')) b.addEventListener('change', () => { Settings[b.dataset.optc] = b.checked; Settings.save(); reb(); });
  for (const b of el.querySelectorAll('[data-optr]')) b.addEventListener('input', () => { Settings[b.dataset.optr] = +b.value; Settings.save(); if (b.dataset.optr === 'fireAt') for (const p of ['title', 'pause']) { const v = $(p + '-fireat-v'), r = $(p + '-fireat'); if (v) v.textContent = Math.round(b.value * 100) + ' %'; if (r && r !== b) r.value = b.value; } });
  for (const b of el.querySelectorAll('[data-ui]')) b.addEventListener('click', () => { Settings.ui = b.dataset.ui; Settings.save(); applyUiScale(); for (const x of document.querySelectorAll('[data-ui]')) x.setAttribute('aria-pressed', x.dataset.ui === Settings.ui ? 'true' : 'false'); });
}
bindOptions('title'); bindOptions('pause');
for (const b of document.querySelectorAll('#diff button')) b.addEventListener('click', () => {
  game.audio.init(); game.audio.ui(); game.diffKey = b.dataset.diff;
  for (const x of document.querySelectorAll('#diff button')) x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
  game.diff = DIFFS[game.diffKey];
});
