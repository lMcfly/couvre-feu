// ============================================================ réglages et scores
const Settings = {
  quality: 'auto', btnSize: 'normal', btnAlpha: 1, lefty: false, fixedSticks: false, fireAt: 0.6,
  rain: true, fog: true, vol: 0.8, music: 0.6, name: '', char: 'pedro', survival: false, paradise: false, ui: 'normale',
  load() { try { Object.assign(this, JSON.parse(localStorage.getItem('couvrefeu.settings') || '{}')); } catch (e) { } if (!['pedro', 'fiona', 'zeus', 'dobby', 'chewie', 'dragon'].includes(this.char)) this.char = 'pedro'; },
  save() { try { localStorage.setItem('couvrefeu.settings', JSON.stringify({ rain: this.rain, fog: this.fog, vol: this.vol, music: this.music, name: this.name, char: this.char, char2: this.char2, survival: this.survival, paradise: this.paradise, ui: this.ui, lastRun: this.lastRun, bestKills: this.bestKills, daily: this.daily, weekly: this.weekly, finisher: this.finisher, xp: this.xp, acc: this.acc, accBy: this.accBy, cstats: this.cstats, finBy: this.finBy, quality: this.quality, btnSize: this.btnSize, btnAlpha: this.btnAlpha, lefty: this.lefty, fixedSticks: this.fixedSticks, fireAt: this.fireAt, cb: this.cb, calm: this.calm, wnSeen: this.wnSeen, online: this.online, vis: this.vis, seen: this.seen, hw: this.hw, pumpkin: this.pumpkin, hospital: this.hospital })); } catch (e) { } }
};
// touches : codes physiques (KeyW = Z sur AZERTY, W sur QWERTY), deux par action
const ACTIONS = [
  ['up', 'Avancer'], ['down', 'Reculer'], ['left', 'Gauche'], ['right', 'Droite'], ['fire', 'Tirer'], ['roll', 'Roulade'],
  ['melee', 'Mêlée · interagir'], ['reload', 'Recharger'], ['grenade', 'Grenade'], ['mine', 'Mine'], ['decoy', 'Fusée-leurre'],
  ['special', 'Capacité spéciale'], ['flash', 'Flash de lampe'], ['wheel', 'Roue des armes (maintenir)'], ['next', 'Arme suivante'], ['prev', 'Arme précédente'], ['pause', 'Pause']
];
const DEFAULT_BINDS = {
  up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  fire: ['Mouse0', ''], roll: ['ShiftLeft', 'Space'], melee: ['KeyE', ''], reload: ['KeyR', ''],
  grenade: ['KeyG', 'Mouse2'], mine: ['KeyF', ''], decoy: ['KeyV', 'KeyC'], special: ['KeyQ', ''], flash: ['KeyT', ''], wheel: ['Tab', ''], next: ['KeyX', ''], prev: ['', ''], pause: ['KeyP', '']
};
// succès
const ACH = [
  ['burrito', 'Burrito vengé', 'Terminer le jeu avec Pedro.'],
  ['nord', 'Pas morte, juste du Nord', 'Terminer le jeu avec Fiona.'],
  ['win_zeus', 'L\'Olympe vert', 'Terminer le jeu avec Zeus.'],
  ['win_dobby', 'Libre comme une chaussette', 'Terminer le jeu avec Dobby.'],
  ['win_chewie', 'Tranquille, j\'ai kiffé', 'Terminer le jeu avec Chewie.'],
  ['win_dragon', 'Mwahahaha', 'Terminer le jeu avec Dragon.'],
  ['scratch', 'Sans une égratignure', 'Terminer un secteur sans être touché.'],
  ['mult10', 'En pleine forme', 'Atteindre un multiplicateur ×10.'],
  ['alarm', 'Concert de klaxons', 'Tuer 8 zombies avec une seule explosion de voiture.'],
  ['samaritan', 'Bon samaritain', 'Ramener 3 survivants dans une même partie.'],
  ['glutton', 'Gourmand', 'Ramasser 6 objets fétiches dans une même partie.'],
  ['riot', 'Contournement', 'Abattre 20 CRS zombies dans une même partie.'],
  ['special', 'Recette secrète', 'Utiliser 10 fois la capacité spéciale dans une même partie.'],
  ['boss', 'Abominable', 'Vaincre l\'Abomination.'],
  ['nightmare', 'Insomniaque', 'Terminer le jeu en Cauchemar.'],
  ['wave10', 'Ça ne s\'arrête jamais', 'Atteindre la vague 10 en mode Survie.'],
  ['shibas', 'Brigade canine', 'Trouver les 15 shibas cachés dans une même partie.'],
  ['ultimate', 'Le paradis retrouvé', 'Vaincre le Shibanophile dans le Paradis des Shibas.']
];
const Ach = {
  mem: {},
  get() { try { const s = localStorage.getItem('couvrefeu.ach'); if (s) return JSON.parse(s); } catch (e) { } return this.mem; },
  set(o) { this.mem = o; try { localStorage.setItem('couvrefeu.ach', JSON.stringify(o)); } catch (e) { } }
};
// une fois : retire « Sans une égratignure » et « Concert de klaxons », qui se débloquaient trop facilement avant
try { if (!localStorage.getItem('couvrefeu.achfix1')) { const u = Ach.get(); delete u.scratch; delete u.alarm; Ach.set(u); localStorage.setItem('couvrefeu.achfix1', '1'); } } catch (e) { }
const PAD_ACTIONS = ACTIONS.filter(([a]) => !['up', 'down', 'left', 'right'].includes(a));
const DEFAULT_PAD = { fire: [7, -1], roll: [6, 1], flash: [12, -1], melee: [0, -1], reload: [2, -1], grenade: [4, -1], mine: [13, -1], decoy: [3, -1], special: [11, -1], wheel: [8, -1], next: [5, 15], prev: [14, -1], pause: [9, -1] };
const PAD_NAMES = ['A / Croix', 'B / Rond', 'X / Carré', 'Y / Triangle', 'LB / L1', 'RB / R1', 'LT / L2', 'RT / R2', 'Select / Share', 'Start / Options', 'Clic stick gauche', 'Clic stick droit', 'Croix ↑', 'Croix ↓', 'Croix ←', 'Croix →', 'Home / PS'];
const padLabel = i => i == null || i < 0 ? '—' : (PAD_NAMES[i] || 'Bouton ' + i);
Settings.binds = JSON.parse(JSON.stringify(DEFAULT_BINDS));
Settings.padBinds = JSON.parse(JSON.stringify(DEFAULT_PAD));
Settings.load();
// ancienne sauvegarde de touches : le sprint disparaît, sa touche passe à la roulade
{ const sv = Settings.binds; if (sv && sv.sprint) { const r = Array.isArray(sv.roll) ? sv.roll : ['', '']; sv.roll = [sv.sprint[0] || 'ShiftLeft', r[0] || 'Space']; delete sv.sprint; } }
{ const sv = Settings.padBinds; if (sv && sv.sprint) { const r = Array.isArray(sv.roll) ? sv.roll : [-1, -1]; sv.roll = [sv.sprint[0] >= 0 ? sv.sprint[0] : 6, r[0] >= 0 ? r[0] : 1]; delete sv.sprint; } }
{ const sv = Settings.padBinds || {}; if (sv.mine && !sv.roll) { if (sv.mine[0] === 1) sv.mine = [13, sv.mine[1]]; if (sv.mine[1] === 1) sv.mine[1] = -1; } }
{ const sv = Settings.binds || {}; if (sv.special && !sv.roll) sv.special = sv.special.map(x => x === 'Space' ? '' : x); }
{ const b = {}; for (const [a] of PAD_ACTIONS) { const v = Settings.padBinds && Settings.padBinds[a]; b[a] = Array.isArray(v) && v.length === 2 ? v.map(x => Number.isInteger(x) ? x : -1) : DEFAULT_PAD[a].slice(); } Settings.padBinds = b; }
{ const b = {}; for (const [a] of ACTIONS) { const v = Settings.binds && Settings.binds[a]; b[a] = Array.isArray(v) && v.length === 2 ? v.map(x => typeof x === 'string' ? x : '') : DEFAULT_BINDS[a].slice(); } Settings.binds = b; }
{ const _save = Settings.save.bind(Settings); Settings.save = function () { _save(); try { const s = JSON.parse(localStorage.getItem('couvrefeu.settings') || '{}'); s.binds = this.binds; s.padBinds = this.padBinds; localStorage.setItem('couvrefeu.settings', JSON.stringify(s)); } catch (e) { } }; }
let layoutMap = null;
try { if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then(m => { layoutMap = m; if (typeof renderBinds === 'function') renderBinds(); }).catch(() => { }); } catch (e) { }
const AZERTY = /^fr/i.test(navigator.language || '');
const AZMAP = { KeyQ: 'A', KeyW: 'Z', KeyA: 'Q', KeyZ: 'W', KeyM: ',', Semicolon: 'M' };
const NAMED = { Mouse0: 'Clic gauche', Mouse1: 'Clic molette', Mouse2: 'Clic droit', Mouse3: 'Souris 4', Mouse4: 'Souris 5', ShiftLeft: 'Maj gauche', ShiftRight: 'Maj droite', ControlLeft: 'Ctrl gauche', ControlRight: 'Ctrl droite', AltLeft: 'Alt', AltRight: 'Alt Gr', Space: 'Espace', Enter: 'Entrée', Tab: 'Tab', CapsLock: 'Verr. Maj', Backspace: 'Retour arrière', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
function keyLabel(code) {
  if (!code) return '—'; if (NAMED[code]) return NAMED[code];
  if (layoutMap && layoutMap.get(code)) return layoutMap.get(code).toUpperCase();
  if (code.startsWith('Key')) return (AZERTY && AZMAP[code]) || code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Pavé ' + code.slice(6);
  return code;
}
const K = a => keyLabel(Settings.binds[a].find(Boolean));
const PAD_SHORT = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Select', 'Start', 'L3', 'R3', '↑', '↓', '←', '→', 'Home'];
const TOUCH_LBL = { melee: 'E', grenade: 'grenade', mine: 'mine', decoy: 'leurre', special: 'capacité', roll: 'ROULADE', flash: 'FLASH', reload: 'auto', wheel: 'ARME maintenu', next: 'ARME', pause: 'II', fire: 'stick droit', sprint: 'stick à fond' };
function deviceNow() { const i = game.input; if (i.touchMode) return 'touch'; if (i.useGamepad && i.gamepad()) return 'pad'; return 'kb'; }
function KL(a) {
  const d = deviceNow();
  if (d === 'touch') return TOUCH_LBL[a] || '';
  if (d === 'pad') { const v = Settings.padBinds[a], i = v ? v.find(x => x >= 0) : undefined; return i === undefined ? '—' : (PAD_SHORT[i] || 'B' + i); }
  return K(a);
}
const keyPhrase = a => deviceNow() === 'kb' ? `Touche ${K(a)}` : `Bouton ${KL(a)}`;
// ---------- classement en ligne (Supabase) : laisser vide pour le désactiver
const ONLINE = { url: 'https://rnsndniniqpdbubqmpcx.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuc25kbmluaXFwZGJ1YnFtcGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTczMzQsImV4cCI6MjEwODY3MzMzNH0.Z46hidwrJHpWHvdpl-7sX8sg8bXowXNtiPjVr7emeJg' }; // clé publique « anon » : lecture et ajout de scores seulement
const Online = {
  on: () => !!(ONLINE.url && ONLINE.key) && Settings.online !== false,
  hdr: () => ({ apikey: ONLINE.key, Authorization: 'Bearer ' + ONLINE.key, 'Content-Type': 'application/json' }),
  pending() { try { return JSON.parse(localStorage.getItem('couvrefeu.pending') || '[]'); } catch (e) { return []; } },
  setPending(l) { try { localStorage.setItem('couvrefeu.pending', JSON.stringify(l.slice(-20))); } catch (e) { } },
  // envoie le score (et ceux restés en attente hors ligne)
  async send(entry) {
    if (!this.on()) return false; const l = this.pending(); if (entry) l.push(entry); if (!l.length) return true;
    try { const r = await fetch(ONLINE.url + '/rest/v1/scores', { method: 'POST', headers: { ...this.hdr(), Prefer: 'return=minimal' }, body: JSON.stringify(l.map(e => ({ name: String(e.name).slice(0, 16), perso: String(e.char || '').slice(0, 20), mode: e.mode, diff: String(e.diff).slice(0, 40), score: Math.max(0, Math.floor(e.score)), kills: Math.max(0, e.kills | 0), duree: Math.min(86400, Math.max(0, e.time | 0)), win: !!e.win }))) });
      if (!r.ok) throw new Error(r.status); this.setPending([]); return true; } catch (er) { this.setPending(l); return false; }
  },
  async top(mode) {
    const q = `${ONLINE.url}/rest/v1/scores?select=name,perso,mode,diff,score,kills,win,created_at&order=score.desc&limit=400${mode && mode !== 'all' ? '&mode=eq.' + encodeURIComponent(mode) : ''}`;
    const r = await fetch(q, { headers: this.hdr() }); if (!r.ok) throw new Error(r.status); return bestPerName(await r.json()).slice(0, 30);
  }
};
// classement : une seule ligne par joueur, son meilleur score (les noms se comparent sans majuscules ni espaces en trop)
const nameKey = n => String(n || '').trim().toLowerCase();
function bestPerName(rows) { const seen = new Set(), out = []; for (const r of rows.slice().sort((a, b) => b.score - a.score)) { const k = nameKey(r.name); if (seen.has(k)) continue; seen.add(k); out.push(r); } return out; }
const Scores = {
  mem: [],
  list() { let l = this.mem; try { const s = localStorage.getItem('couvrefeu.scores'); if (s) l = JSON.parse(s); } catch (e) { } return bestPerName(Array.isArray(l) ? l : []); },
  add(entry) { const top = bestPerName(this.list().concat([entry])).slice(0, 10); this.mem = top; try { localStorage.setItem('couvrefeu.scores', JSON.stringify(top)); } catch (e) { } return top; }
};

