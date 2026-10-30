// ============================================================ interface : réglages
// réglages rangés par thème : une grille d'icônes, puis une page par thème
const SET_CATS = {
  son: ['Son', '<path d="M3 10v4h3l7 4.5V5.5L6 10z"/><path d="M8.5 9.3l1.4 2-1.2 1.6.9 1.6"/><path d="M16.5 9.5c1 1.2 1 3.8 0 5M19 6.5l.8 1.4M20.5 11.6H22M19 17.5l.8-1.4"/>'],
  affichage: ['Affichage', '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 3l4 4 4-4"/><path d="M10.5 9.5l-2 3.2 2.8.8-1.8 3.5M13 12.5l2.4-1"/><path d="M18.5 10.5h.01M18.5 13h.01"/>'],
  commandes: ['Commandes', '<path d="M6.5 8h4.7l.8 1.2.8-1.2.8 1.2.8-1.2h2.1a4.5 4.5 0 0 1 4.4 5.4l-.4 1.8a2.6 2.6 0 0 1-4.6 1L15.5 14h-7l-1.4 2.2a2.6 2.6 0 0 1-4.6-1l-.4-1.8A4.5 4.5 0 0 1 6.5 8z"/><path d="M8 10.2v3.2M6.4 11.8h3.2M15.6 11h.01M17.6 13h.01"/><path class="ib" d="M12 9.6c0 1-1.4 2.3-1.4 3.1a1.4 1.4 0 0 0 2.8 0c0-.8-1.4-2.1-1.4-3.1z"/>'],
  access: ['Accessibilité', '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12.6" cy="12.8" r="2.7"/><path d="M4.3 10.8l2.2.6M4.8 13.6l2-.4M19.6 10.6l-2 .9M19.2 14.1l-1.9-.6"/>'],
  online: ['En ligne', '<rect x="7" y="7" width="10" height="14" rx="1.6"/><path d="M10 7V2.5M9.5 11h5M9.5 14h5M10 17.5h1.5"/><path d="M4.2 7.2a6 6 0 0 1 2.3-3M1.8 9a9 9 0 0 1 2.6-5.6"/>'],
  credits: ['Crédits', '<path d="M12 3a7.5 7.5 0 0 0-5 13.1V19h10v-2.9A7.5 7.5 0 0 0 12 3z"/><circle cx="9.3" cy="11" r="1.6"/><circle cx="14.7" cy="11" r="1.6"/><path d="M11 15.2l1-1.5 1 1.5M10 19v2M14 19v2"/>'],
  save: ['Sauvegarde', '<path d="M6 21V10a6 6 0 0 1 12 0v11"/><path d="M3.5 21h17"/><path d="M12 8.5v7M9.5 11h5"/><path d="M8 21l1-2M15 21l1.2-1.6"/>']
};
const pct = v => Math.round(v * 100) + ' %';
function setSummary(cat) {
  const Q = { auto: 'auto', high: 'haute', eco: 'économie' }, B = { petit: 'petits', normal: 'normaux', grand: 'grands' };
  if (cat === 'son') return `Volume ${pct(Settings.vol)} · musique ${pct(Settings.music)}`;
  if (cat === 'affichage') return `Qualité ${Q[Settings.quality] || 'auto'} · interface ${(UI_SIZES[Settings.ui] || UI_SIZES.normale)[0].toLowerCase()}`;
  if (cat === 'commandes') return TOUCH ? `Boutons ${B[Settings.btnSize] || 'normaux'}${Settings.lefty ? ' · gaucher' : ''}${Settings.fixedSticks ? ' · sticks fixes' : ''}` : 'Clavier, souris et manette';
  if (cat === 'access') { const on = [Settings.cb && 'daltonien', Settings.calm && 'effets réduits', Settings.vis === 'renforcee' && 'perso renforcé'].filter(Boolean); return on.length ? on.join(' · ').replace(/^./, c => c.toUpperCase()) : 'Rien d\'activé'; }
  if (cat === 'online') return !ONLINE.url ? 'Pas encore branché' : Settings.online !== false ? 'Classement activé' : 'Classement désactivé';
  if (cat === 'credits') return 'Un jeu Nadrax Prod · l\'équipe';
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
function setOpen(el, k) {
  if (k === 'credits') { const x = el.querySelector('[data-extra="credits"]'); if (x && !x.dataset.filled) { fillCredits(x); const h = x.querySelector('h3'); if (h) h.remove(); } } el.querySelector('.set-home').hidden = true; for (const p of el.querySelectorAll('.set-page')) p.hidden = p.dataset.page !== k; const card = el.closest('.sheet-card'); if (card) card.scrollTop = 0; requestAnimationFrame(() => { const f = el.querySelector(`.set-page[data-page="${k}"] .set-list input, .set-page[data-page="${k}"] .set-list button, .set-page[data-page="${k}"] .set-extra button`); (f || el.querySelector(`.set-page[data-page="${k}"] [data-setback]`)).focus({ preventScroll: true }); }); }
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
