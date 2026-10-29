// ============================================================ jeu : deux joueurs
mixin(Game, {
  // ---------- deux joueurs
  syncP2Gear() {
    const p = this.player, q = this.p2; if (!q) return;
    p.weapons.forEach((w, i) => { const v = q.weapons[i]; if (w.owned && !v.owned) { v.owned = true; v.ammo = v.magSize(); } v.lvl = { ...w.lvl }; if (!v.def.infinite) v.reserve = Math.max(v.reserve, w.reserve); });
    q.armor = Math.max(q.armor, p.armor); q.grenades = Math.max(q.grenades, p.grenades); q.mines = Math.max(q.mines, p.mines); q.decoys = Math.max(q.decoys, p.decoys);
  },
  players() { return this.p2 ? [this.player, this.p2] : [this.player]; },
  targetFor(z) { const p = this.player, q = this.p2; if (!q || q.dead) return p; if (p.dead) return q; return dist2(p.x, p.y, z.x, z.y) <= dist2(q.x, q.y, z.x, z.y) ? p : q; },
  nearestPlayer(x, y) { const p = this.player, q = this.p2; if (!q || q.dead) return p; if (p.dead) return q; return dist2(p.x, p.y, x, y) <= dist2(q.x, q.y, x, y) ? p : q; },
  makeP2(x, y) {
    const c1 = this.charKey, c2 = CHARS[Settings.char2] && Settings.char2 !== c1 ? Settings.char2 : CHAR_KEYS[(CHAR_KEYS.indexOf(c1) + 1) % CHAR_KEYS.length];
    this.charKey = c2; const q = new Player(this, x, y); this.charKey = c1; q.isP2 = true; q.inv = 1.5; return q;
  },
  pName(d) { return this.net ? (d === this.player ? (Settings.name || 'J1') : (Net.peer ? Net.peer.name : 'J2')) : d === this.player ? 'J1' : 'J2'; },
  // joueurs à terre dont l'allié est encore debout : [à terre, allié]
  downPlayers() { if (!this.p2) return []; const p = this.player, q = this.p2, out = []; if (p.dead && (this.netGuest || this.p1Down > 0) && !q.dead) out.push([p, q]); if (q.dead && !p.dead) out.push([q, p]); return out; },
  updateRevive(dt) {
    for (const [d, a] of this.downPlayers()) {
      if (d.downX == null) { d.downX = d.x; d.downY = d.y; }
      if (this.reviveUsed) { d.revT = 0; continue; }
      const inside = dist2(a.x, a.y, d.downX, d.downY) < REVIVE_R * REVIVE_R;
      d.revT = clamp((d.revT || 0) + (inside ? dt : -dt * 1.5), 0, REVIVE_T);
      if (inside && Math.random() < dt * 12) { const an = rand(0, TAU), rr = rand(10, REVIVE_R); this.spawnP({ x: d.downX + Math.cos(an) * rr, y: d.downY + Math.sin(an) * rr * 0.6, z: 2, vz: rand(40, 90), life: 0.7, type: 'spark', size: 1.6, color: '#7fd18b', emissive: true }); }
      if (d.revT >= REVIVE_T) { this.reviveUsed = true; this.revivePlayer(d, d.downX, d.downY, 0.5); this.audio.objective(); this.toast(`${this.pName(d)} est relevé !`, '#7fd18b'); }
    }
  },
  revivePlayer(d, x, y, f) { d.dead = false; d.hp = Math.round(d.maxHp * f); d.x = x; d.y = y; d.inv = 2; d.revT = 0; d.downX = d.downY = null; if (d === this.player) this.p1Down = 0; },
  // nouvelle manche (fin d'acte, pause entre deux vagues) : les alliés à terre reviennent et la réanimation se recharge
  newManche(why) {
    this.reviveUsed = false; if (!this.p2) return;
    for (const d of [this.player, this.p2]) { const a = d === this.player ? this.p2 : this.player; if (!d.dead || a.dead || (d === this.player && !(this.p1Down > 0))) continue; this.revivePlayer(d, a.x - 30, a.y + 20, 0.7); this.toast(`${this.pName(d)} revient pour ${why}`, '#7fd18b'); }
  },
  onP2Death(q) {
    if (q.dead) return; q.dead = true; q.hp = 0; q.carry = null;
    q.downX = q.x; q.downY = q.y; q.revT = 0;
    if (this.player.dead) { this.p1Down = 0; const p = this.player; p.dead = false; p.hp = 1; this.onPlayerDeath(); this.bleed(q.x, q.y, 0, 0, 20); return; } this.bleed(q.x, q.y, 0, 0, 20); this.audio.death();
    this.toast(`${this.pName(q)} est à terre`, '#e2792f');
  }
});
