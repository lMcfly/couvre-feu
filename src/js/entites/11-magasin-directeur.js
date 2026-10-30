// ============================================================ magasin
class Shop {
  constructor(g) {
    this.g = g; this.body = $('shop-body');
    this.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) this.act(b.dataset.act); });
  }
  upPrice(i, u) { const w = this.g.player.weapons[i]; return Math.round({ dmg: 220, rate: 240, mag: 170 }[u] * (w.lvl[u] + 1) * w.def.tier / 10) * 10; }
  open() { const g = this.g; g.state = 'shop'; g.audio.flame(false); this.render(); g.showScreen('scr-shop'); const b = this.body.querySelector('button:not([disabled])'); if (b) b.focus(); }
  close() { const g = this.g; g.state = 'playing'; g.showScreen(null); g.input.mdown = false; if (g.p2) g.syncP2Gear(); }
  render() {
    const g = this.g, p = g.player, money = p.money;
    const btn = (act, label, ok, cls = 'sm') => `<button type="button" class="btn ${cls}" data-act="${act}" ${ok ? '' : 'disabled'}>${label}</button>`;
    const pips = (l, m) => `<span class="pips" aria-label="niveau ${l} sur ${m}">${'■'.repeat(l)}<i>${'■'.repeat(m - l)}</i></span>`;
    const tab = this.tab || 'arms', tb = (k, l) => `<button type="button" class="btn sm" data-act="tab:${k}" aria-pressed="${tab === k}">${l}</button>`;
    let h = `<header class="shop-head"><div><p class="eyebrow">${g.safeName || 'Point de sauvegarde'} · progression sauvegardée</p><h2>Marché noir</h2></div><span class="sseg shop-tabs" role="group" aria-label="Rayon">${tb('arms', 'Armes')}${tb('gear', 'Équipement')}</span><div class="purse" aria-label="Argent disponible">$ ${fmt(money)}</div></header>`;
    h += `<div class="shop-cols" data-tab="${tab}"><section class="sec-arms"><h3 class="sec">Armes</h3><div class="shop-grid">`;
    p.weapons.forEach((w, i) => {
      const d = w.def;
      h += `<article class="card ${w.owned ? '' : 'locked'}"><img class="ico" src="${iconURL(d.id, true)}" alt=""><div class="card-head"><h3>${d.name}</h3><span class="slot">${i + 1}</span></div><p class="desc">${d.desc}</p>`;
      if (!w.owned) h += btn(`buy:${i}`, `Acheter · $${fmt(d.price)}`, money >= d.price, '');
      else {
        h += `<p class="ammo">Munitions : ${w.ammo} / ${d.infinite ? '∞' : w.reserve}</p>`;
        if (!d.infinite) h += btn(`ammo:${i}`, `+${d.ammoPack} munitions · $${d.ammoPrice}`, money >= d.ammoPrice);
        for (const u of ['dmg', 'rate', 'mag']) { const l = w.lvl[u], pr = this.upPrice(i, u); h += `<div class="up"><span>${UPNAMES[u]}</span>${pips(l, 3)}${l >= 3 ? '<span class="maxed">MAX</span>' : btn(`up:${i}:${u}`, '$' + fmt(pr), money >= pr)}</div>`; }
      }
      h += '</article>';
    });
    h += '</div></section><section class="sec-gear"><h3 class="sec">Équipement</h3><div class="gear">';
    const armP = 300 * (p.armor + 1);
    h += `<article class="card"><img class="ico" src="${iconURL('armor')}" alt=""><div class="card-head"><h3>Armure</h3>${pips(p.armor, 3)}</div><p class="desc">Chaque niveau réduit les dégâts de 15 %.</p>${p.armor >= 3 ? '<span class="maxed">MAX</span>' : btn('armor', `Renforcer · $${armP}`, money >= armP)}</article>`;
    h += `<article class="card"><img class="ico" src="${iconURL('med')}" alt=""><div class="card-head"><h3>Soins complets</h3><span class="slot">${Math.ceil(p.hp)}/${p.maxHp}</span></div><p class="desc">Remet la santé au maximum.</p>${btn('heal', 'Soigner · $150', money >= 150 && p.hp < p.maxHp)}</article>`;
    h += `<article class="card"><img class="ico" src="${iconURL('battery')}" alt=""><div class="card-head"><h3>Piles de lampe</h3><span class="slot">${Math.round(p.battery)} %</span></div><p class="desc">La lampe s'use. +50 % d'autonomie.</p>${btn('battery', 'Recharger · $40', money >= 40 && p.battery < 100)}</article>`;
    const ICO = { grenades: 'grenade', mines: 'mine', decoys: 'decoy' };
    for (const [k, name, price, max, desc] of [['grenades', 'Grenade', 60, 9, `${keyPhrase('grenade')}. Explose après 1,7 s.`], ['mines', 'Mine', 80, 5, `${keyPhrase('mine')}. Posée à tes pieds, s'arme en 1 s.`], ['decoys', 'Fusée-leurre', 70, 5, `${keyPhrase('decoy')}. Attire la horde 8 s puis explose.`]])
      h += `<article class="card"><img class="ico" src="${iconURL(ICO[k])}" alt=""><div class="card-head"><h3>${name}</h3><span class="slot">${p[k]}/${max}</span></div><p class="desc">${desc}</p>${btn('item:' + k + ':' + price + ':' + max, `+1 · $${price}`, money >= price && p[k] < max)}</article>`;
    h += `</div></section></div><div class="row end shop-foot"><button type="button" class="btn primary" data-act="close">Reprendre la route</button></div>`;
    this.body.innerHTML = h;
  }
  act(a) {
    const g = this.g, p = g.player, parts = a.split(':'); let ok = false;
    if (parts[0] === 'tab') { this.tab = parts[1]; g.audio.ui(); this.render(); $('scr-shop').scrollTop = 0; const t = this.body.querySelector(`[data-act="tab:${parts[1]}"]`); if (t) t.focus({ preventScroll: true }); return; }
    const pay = n => { if (p.money < n) return false; p.money -= n; return true; };
    switch (parts[0]) {
      case 'close': g.audio.ui(); this.close(); return;
      case 'buy': { const w = p.weapons[+parts[1]]; if (g.dailyMod && g.dailyMod.id === 'pistol') { g.toast('Défi du jour : pistolet seulement', '#8b867b'); break; } if (!w.owned && pay(w.def.price)) { w.owned = true; w.ammo = w.magSize(); w.reserve = w.def.ammoPack; ok = true; } break; }
      case 'ammo': { const w = p.weapons[+parts[1]]; if (pay(w.def.ammoPrice)) { w.reserve += w.def.ammoPack; ok = true; } break; }
      case 'up': { const i = +parts[1], u = parts[2], w = p.weapons[i]; if (w.lvl[u] < 3 && pay(this.upPrice(i, u))) { const before = w.magSize(); w.lvl[u]++; if (u === 'mag') w.ammo += w.magSize() - before; ok = true; } break; }
      case 'armor': if (p.armor < 3 && pay(300 * (p.armor + 1))) { p.armor++; ok = true; } break;
      case 'heal': if (p.hp < p.maxHp && pay(150)) { p.hp = p.maxHp; ok = true; } break;
      case 'battery': if (p.battery < 100 && pay(40)) { p.battery = Math.min(100, p.battery + 50); ok = true; } break;
      case 'item': { const k = parts[1], price = +parts[2], max = +parts[3]; if (p[k] < max && pay(price)) { p[k]++; ok = true; } break; }
    }
    if (ok) g.audio.buy(); else g.audio.deny();
    const ae = document.activeElement, focusAct = ae && ae.dataset ? ae.dataset.act : null, scr = $('scr-shop'), keep = scr.scrollTop;
    const cardIdx = ae && ae.closest ? [...this.body.querySelectorAll('.card')].indexOf(ae.closest('.card')) : -1;
    this.render();
    let again = focusAct && this.body.querySelector(`[data-act="${focusAct}"]:not([disabled])`);
    if (!again && cardIdx >= 0) { const card = this.body.querySelectorAll('.card')[cardIdx]; again = card && card.querySelector('button:not([disabled])'); }
    (again || this.body.querySelector('[data-act="close"]')).focus({ preventScroll: true }); scr.scrollTop = keep;
  }
}

// ============================================================ directeur de hordes
const SAVE_KEY = 'couvrefeu.save'; let memSave = null;
function writeSave(g, s) {
  if (g.mode !== 'story' || !g.checkpoint || g.net) return;
  const cp = g.checkpoint;
  const data = { v: 1, char: g.charKey, diff: g.diffKey, safe: s, shibaSeed: g.shibaSeed || 0, cp: { ...cp, weapons: cp.weapons.map(w => ({ ...w, reserve: w.reserve === Infinity ? -1 : w.reserve })) }, lives: g.lives, maxMult: g.maxMult, runTime: g.runTime, stats: g.stats, run: g.run, date: Date.now() };
  memSave = JSON.parse(JSON.stringify(data)); try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { }
}
function validSave(d) { return !!d && d.v === 1 && !!CHARS[d.char] && !!DIFFS[d.diff] && Number.isInteger(d.safe) && d.safe >= 0 && d.safe <= 3 && d.cp && Array.isArray(d.cp.weapons) && d.cp.weapons.length === WEAPONS.length; }
function readSave() { try { const t = localStorage.getItem(SAVE_KEY); if (t) { const d = JSON.parse(t); return validSave(d) ? d : null; } } catch (e) { } return validSave(memSave) ? memSave : null; }
function clearSave() { memSave = null; try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
function encodeSave(d) { return 'CF1.' + btoa(unescape(encodeURIComponent(JSON.stringify(d)))); }
function decodeSave(code) { try { const t = String(code).trim().replace(/^CF1\./, ''); const d = JSON.parse(decodeURIComponent(escape(atob(t)))); return validSave(d) ? d : null; } catch (e) { return null; } }
// code de transfert : toute la progression (niveau, tenues, succès, shibas, scores, partie en cours) d'un appareil à l'autre
const PROFILE_KEYS = ['xp', 'survival', 'paradise', 'hospital', 'pumpkin', 'bestKills', 'daily', 'hw', 'seen', 'cstats', 'acc', 'accBy', 'finisher', 'finBy', 'name'];
const b64u = {
  enc: u8 => { let s = ''; for (const b of u8) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: t => Uint8Array.from(atob(t.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0))
};
async function deflate(u8, pack) { const cs = pack ? new CompressionStream('deflate-raw') : new DecompressionStream('deflate-raw'); return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(cs)).arrayBuffer()); }
async function encodeProfile() {
  const s = {}; for (const k of PROFILE_KEYS) if (Settings[k] != null) s[k] = Settings[k];
  const raw = new TextEncoder().encode(JSON.stringify({ v: 2, s, a: Ach.get(), sc: Scores.list(), sv: readSave() }));
  if (typeof CompressionStream === 'function') try { return 'CF2.' + b64u.enc(await deflate(raw, true)); } catch (e) { }
  return 'CF2U.' + b64u.enc(raw);
}
async function decodeProfile(code) {
  const t = String(code).replace(/\s+/g, '');
  try {
    if (t.startsWith('CF1.')) { const sv = decodeSave(t); return sv ? { v: 2, s: {}, a: {}, sc: [], sv } : null; } /* ancien code : la partie en cours seule */
    const raw = t.startsWith('CF2.') ? await deflate(b64u.dec(t.slice(4)), false) : t.startsWith('CF2U.') ? b64u.dec(t.slice(5)) : null; if (!raw) return null;
    const d = JSON.parse(new TextDecoder().decode(raw)); return d && d.v === 2 && typeof d.s === 'object' ? d : null;
  } catch (e) { return null; }
}
// la progression ne fait que monter : on garde le meilleur des deux appareils
function mergeProgress(a, b) {
  if (b == null) return a; if (a == null) return b;
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (typeof a === 'boolean' || typeof b === 'boolean') return !!a || !!b;
  if (Array.isArray(a) && Array.isArray(b)) return [...new Set([...a, ...b])];
  if (typeof a === 'object' && typeof b === 'object') { const o = { ...a }; for (const k of Object.keys(b)) o[k] = mergeProgress(a[k], b[k]); return o; }
  return a;
}
function applyProfile(d) {
  const s = d.s || {};
  for (const k of PROFILE_KEYS) { if (s[k] == null) continue; Settings[k] = k === 'daily' ? (!Settings.daily || s.daily.d > Settings.daily.d ? s.daily : s.daily.d === Settings.daily.d ? { d: s.daily.d, best: Math.max(s.daily.best || 0, Settings.daily.best || 0) } : Settings.daily) : mergeProgress(Settings[k], s[k]); }
  Settings.save(); Ach.set(mergeProgress(Ach.get(), d.a || {}));
  for (const e of d.sc || []) if (e && e.name && typeof e.score === 'number') Scores.add(e);
  const sv = validSave(d.sv) ? d.sv : null, cur = readSave(); if (sv && (!cur || (sv.date || 0) >= (cur.date || 0))) { memSave = sv; try { localStorage.setItem(SAVE_KEY, JSON.stringify(sv)); } catch (e) { } } /* la partie la plus récente gagne */
  return { lv: levelInfo(Settings.xp || 0).lv, ach: ACH.filter(a => Ach.get()[a[0]]).length, run: !!readSave() };
}
function saveLine(d) { return `${CHARS[d.char].name} · ${DIFFS[d.diff].name} · mission ${d.safe + 2} sur ${MISSIONS} · ${fmt(d.cp.score || 0)} pts · ${(d.cp.shibas || []).length}/${SHIBAS_TOTAL} shibas`; }
function newStats() { return { shots: 0, hits: 0, dmg: 0, deaths: 0 }; }
const SHIBAS_PER = 3, SHIBAS_TOTAL = SHIBAS_PER * MISSIONS;
const BESTIARY = [
  { k: 'walker', name: 'Le Traînard', type: 'Zombie ordinaire', m: 1, txt: 'Ancien usager de la ligne 4. Attend toujours son bus, mais accepte un mollet en dédommagement.', tip: 'Lent, mais jamais seul. Recule en tirant.' },
  { k: 'runner', name: 'Le Coureur', type: 'Zombie rapide', m: 2, txt: 'Inscrit au semi-marathon la veille de l\'épidémie. Il n\'a jamais franchi la ligne d\'arrivée, alors il court encore.', tip: 'Fragile : une rafale suffit. Ne lui tourne jamais le dos.' },
  { k: 'dog', name: 'Le Chien zombie', type: 'Chasse en meute', m: 3, txt: 'Toujours aussi content de te voir. Juste un peu plus affamé. Ne rapporte plus les bâtons, seulement les tibias.', tip: 'Il s\'accroupit et grogne avant de bondir : roule pile à ce moment.' },
  { k: 'screamer', name: 'Le Hurleur', type: 'Cri d\'alerte', m: 3, txt: 'Patient de la chambre 12, en attente de son résultat d\'examen depuis l\'épidémie. Il a perdu patience. Et la voix, presque.', tip: 'Quand il ouvre grand la bouche, tire : touché, il se tait. Sinon la horde s\'excite et ta lampe grésille.' },
  { k: 'bomber', name: 'Le Gonflé', type: 'Explosif', m: 2, txt: 'A mangé le kebab de la gare après minuit. Les gaz ont fait le reste.', tip: 'Abats-le de loin : il explose au contact.' },
  { k: 'spitter', name: 'Le Cracheur', type: 'Tir d\'acide', m: 3, txt: 'Champion régional de crachat de noyaux de cerise. Il a juste changé de munitions.', tip: 'Il recule pour viser. Zigzague et colle-le.' },
  { k: 'riot', name: 'Le CRS', type: 'Bouclier', m: 3, txt: 'Son bouclier a survécu à trois manifs et une apocalypse. Son sens de l\'humour, non.', tip: 'Le bouclier arrête les balles : contourne-le, ou une grenade.' },
  { k: 'brute', name: 'La Brute', type: 'Charge', m: 4, txt: 'Videur au Macumba depuis 1998. Tu n\'es toujours pas sur la liste.', tip: 'Fais-le charger contre un mur : il reste sonné.' },
  { k: 'mini0', name: 'Le Contrôleur', type: 'Boss · secteur 1', m: 4, boss: true, txt: 'Il verbalise depuis quarante ans. La mort n\'a pas annulé l\'amende.', tip: '« Vos papiers ! » : sors du cercle avant la fin, sinon c\'est l\'amende. En rage, il appelle des renforts.' },
  { k: 'mini1', name: 'La Speakerine', type: 'Boss · secteur 2', m: 4, boss: true, txt: 'Elle présente encore la météo : couvre-feu, avec de forts risques de morsures.', tip: 'Coupure de courant : suis tes yeux et son écran. En rage, son micro étourdit : roule quand l\'onde arrive.' },
  { k: 'mini2', name: 'Le Gardien du parking', type: 'Boss · secteur 3', m: 4, boss: true, txt: 'Ton ticket a expiré. Toi aussi, bientôt.', tip: 'Ses barrières ferment les passages. En rage, il pousse des épaves : écarte-toi de la ligne orange.' },
  { k: 'boss', name: 'L\'Abomination', type: 'Boss · secteur 4', m: 5, boss: true, txt: 'Trois conseillers municipaux, un adjoint et un pigeon. Le conseil n\'a jamais été aussi soudé.', tip: 'Tue les zombies qu\'elle aspire avant qu\'elle les avale. En rage, roule au passage des ondes du séisme.' },
  { k: 'mini3', name: 'Le Chirurgien', type: 'Boss · hôpital', m: 5, boss: true, txt: 'Major de sa promo en chirurgie, recalé en anesthésie. Ses patients ne se plaignent plus jamais.', tip: 'Fuis le faisceau de sa frontale. Les lignes blanches annoncent ses scalpels ; à 30 %, il réanime les morts.' },
  { k: 'ultimate', name: 'Le Shibanophile', type: 'Boss secret', m: 5, boss: true, txt: 'Mordu par un shiba en 2019. Depuis, c\'est personnel.', tip: 'Laisse : roule ou tire dessus pour la couper. En rage, il attire les shibas avec des croquettes : protège-les.' }
];
const beastKey = z => z.ultimate ? 'ultimate' : z.mini ? 'mini' + (z.mk || 0) : z.type;
const SECRET_W = { walker: 40, runner: 30, riot: 12, brute: 8, bomber: 10 };
// plan de l'hôpital (secteur 1 réaménagé) : couloir central, chambres de part et d'autre, morgue au fond
const HOSP = { x0: 250, top: 452, bot: 730, doors: [470, 860, 1250, 1640], cols: [250, 660, 1050, 1440, 1830, 2060], morgue: 2060 };
class Director {
  constructor(g) { this.g = g; this.t = 2; this.queue = 0; this.qT = 0; }
  reset() { this.t = 2; this.queue = 0; }
  pickType(w) { let tot = 0; for (const k in w) tot += w[k]; let r = Math.random() * tot; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return 'walker'; }
  update(dt) {
    const g = this.g, k = g.activeZone; if (k < 0 || g.player.dead) return;
    const zc = ZCFG[k], D = g.diff, obj = g.level.obj[k];
    let pop = zc.pop * D.pop, interval = zc.interval / D.spawn;
    if (obj.type === 'defend' && obj.started && !obj.done) { pop += 26; interval *= 0.55; }
    if (obj.done && k < 3) pop = 0;
    if (k === 3) pop = g.bossRef && !g.bossRef.dead ? zc.pop * D.pop : 0;
    if (g.mode === 'survival') pop = 0;
    if (g.mode === 'secret') pop = g.bossRef && !g.bossRef.dead ? 20 * D.pop : 0;
    if (g.mode === 'hospital') pop = obj.dead ? 0 : (obj.spawned ? 14 : 24) * D.pop;
    if (this.queue > 0) { this.qT -= dt; if (this.qT <= 0 && g.zombies.length < 220) { this.qT = g.mode === 'survival' ? 0.12 : 0.06; this.queue--; g.spawnAt(this.pickType(g.mode === 'survival' ? g.surv.weights : g.mode === 'secret' ? SECRET_W : k === 3 ? zc.w : HORDE_W), k, true); } }
    this.t -= dt;
    if (this.t <= 0) { this.t = interval * rand(0.6, 1.4); if (g.zombies.length < pop) { const n = randi(1, 3); for (let i = 0; i < n; i++) g.spawnAt(this.pickType(g.mode === 'secret' ? SECRET_W : g.mode === 'hospital' ? HOSP_W : zc.w), k, false); } }
  }
}

