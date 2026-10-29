// ============================================================ interface : réglages
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

  const reb = () => { bindOptions('title'); bindOptions('pause'); };
  for (const b of el.querySelectorAll('[data-opt]')) b.addEventListener('click', () => { Settings[b.dataset.opt] = b.dataset.val; Settings.save(); if (b.dataset.opt === 'quality') { dprCap = 2; resize(); } reb(); });
  for (const b of el.querySelectorAll('[data-optc]')) b.addEventListener('change', () => { Settings[b.dataset.optc] = b.checked; Settings.save(); reb(); });
  for (const b of el.querySelectorAll('[data-optr]')) b.addEventListener('input', () => { Settings[b.dataset.optr] = +b.value; Settings.save(); if (b.dataset.optr === 'fireAt') for (const p of ['title', 'pause']) { const v = $(p + '-fireat-v'), r = $(p + '-fireat'); if (v) v.textContent = Math.round(b.value * 100) + ' %'; if (r && r !== b) r.value = b.value; } });
  for (const b of el.querySelectorAll('[data-ui]')) b.addEventListener('click', () => { Settings.ui = b.dataset.ui; Settings.save(); applyUiScale(); for (const x of document.querySelectorAll('[data-ui]')) x.setAttribute('aria-pressed', x.dataset.ui === Settings.ui ? 'true' : 'false'); });
}
bindOptions('title'); bindOptions('pause');
