// ---------- accueil : boutons, panneaux (succès, scores, crédits, réglages), sauvegarde, invites manette
function refreshHub() {
  refreshLevelUI(); renderAccPicker();
  { const m = todayMod(), b = dailyBest(); $('daily-sub').textContent = `${m.name} · ${b ? 'record ' + fmt(b) : m.desc}`; }
  rebuildNews();
  const u = Ach.get(), got = ACH.filter(a => u[a[0]]).length, d = readSave();
  $('hub-achchip').textContent = `★ ${got}/${ACH.length}`;
  $('hub-shibas').innerHTML = `<img src="${iconURL('shiba')}" alt=""> ${Settings.paradise ? SHIBAS_TOTAL : d ? (d.cp.shibas || []).length : 0}/${SHIBAS_TOTAL}`; $('hub-shibas').classList.toggle('gold', !!Settings.paradise); $('hub-shibas').title = Settings.paradise ? 'Tous les shibas sont sauvés : un endroit secret s\'est ouvert' : 'Shibas sauvés';
  const todo = ACH.filter(a => !u[a[0]]).slice(0, 3);
  document.querySelector('.start-card').dataset.diff = game.diffKey;
  const pct = d ? Math.round((d.safe + 1) / MISSIONS * 100) : 0, next = d ? Math.min(MISSIONS - 1, d.safe + 1) : 0;
  $('story-act').textContent = d ? `Mission ${next + 1} sur ${MISSIONS}` : `Mission 1 sur ${MISSIONS}`; $('story-zone').textContent = MISSION_NAMES[next] + (d ? ` · ${CHARS[d.char].name}` : '');
  $('start-kicker').textContent = d ? `Reprendre · ${CHARS[d.char].name} · ${DIFFS[d.diff].name}` : `Nouvelle nuit · ${START_FLAVOR[game.diffKey] || ''}`; $('start-title').textContent = d ? MISSION_NAMES[next] : 'Opération Couvre-Feu';
  $('btn-start').classList.toggle('primary', !d); $('btn-start').textContent = d ? 'Nouvelle partie' : 'Prendre la route';
}
$('story-card').addEventListener('click', () => { const d = readSave(); if (d) game.loadSave(d); else openLaunch('story'); });
$('story-card').setAttribute('role', 'button'); $('story-card').tabIndex = 0;
$('mode-story').addEventListener('click', () => openLaunch('story'));
// barre d'aide en bas : boutons de l'appareil utilisé
const PB = { a: ['A', 'pa'], b: ['B', 'pb'], x: ['X', 'px'], y: ['Y', 'py'] };
function promptHTML(items) { return items.map(([k, t]) => `<span class="pr"><span class="key ${k.cls || ''}">${k.t}</span>${t}</span>`).join(''); }
let lastPromptKey = '';
function refreshPrompts() {
  const st = game.state, dev = deviceNow(), el = $('prompt-bar'); if (!el) return; document.documentElement.dataset.dev = dev; $('op-dev').textContent = dev === 'pad' ? '🎮' : dev === 'touch' ? '📱' : '⌨';
  const menu = ['title', 'paused', 'shop', 'map', 'end'].includes(st) && dev === 'pad' && !game.keysOpen;
  const pageOpen = $('scr-title').classList.contains('page-open'), key = st + dev + hubTab + menu + pageOpen; if (key === lastPromptKey) return; lastPromptKey = key; el.hidden = !menu; if (!menu) return;
  const P = dev === 'pad', A = P ? { t: 'A', cls: 'pa' } : { t: 'Entrée' }, B = P ? { t: 'B', cls: 'pb' } : { t: 'Échap' }, Y = P ? { t: 'Y', cls: 'py' } : { t: 'Clic' };
  const L = P ? [{ t: 'LB' }, { t: 'RB' }] : [{ t: 'Clic' }];
  let items = [[A, 'Sélectionner']];
  if (st === 'title') { items.push([B, 'Fermer']); if (P) items.push([{ t: 'LB · RB', cls: 'wide' }, 'Onglets']); if (hubTab === 'lobby' && !pageOpen && !P) items.push([{ t: '← →', cls: 'wide' }, 'Personnage']); if (P) items.push([Y, 'Succès']); }
  else if (st === 'paused') items.push([B, 'Reprendre']);
  else if (st === 'shop') items.push([B, 'Reprendre la route']);
  else if (st === 'map') items.push([{ t: P ? 'Start' : 'Clic', cls: 'wide' }, 'Entrer dans la mission']);
  if (P) items.push([{ t: 'Stick D', cls: 'wide' }, 'Défiler']);
  el.innerHTML = promptHTML(items);
}
setInterval(refreshPrompts, 250);
refreshStartDiff();
$('ward-prev').addEventListener('click', () => { game.audio.init(); game.audio.ui(); setWard(wardIdx - 1); });
$('ward-next').addEventListener('click', () => { game.audio.init(); game.audio.ui(); setWard(wardIdx + 1); });
game.charKey = CHAR_KEYS[wardIdx]; renderWardrobe();
addEventListener('keydown', e => {
  if (game.state !== 'title' || game.keysOpen || document.querySelector('.sheet:not([hidden])')) return;
  const ae = document.activeElement; if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
  if (typeof hubTab !== 'undefined' && hubTab !== 'lobby') return;
  if (e.key === 'ArrowLeft') { setWard(wardIdx - 1); e.preventDefault(); } else if (e.key === 'ArrowRight') { setWard(wardIdx + 1); e.preventDefault(); }
});
$('btn-start').addEventListener('click', () => {
  if (TOUCH && !fsEl()) { enterFullscreen(); }
  const sv = readSave();
  if (launchMode === 'story' && sv) { const b = $('btn-start'); if (!b.dataset.confirm) { b.dataset.confirm = '1'; b.textContent = 'Confirmer : effacer la sauvegarde'; b.classList.add('danger'); return; } clearSave(); }
  if (launchMode === 'coop' && sv && !$('btn-start').dataset.confirm) { const b = $('btn-start'); b.dataset.confirm = '1'; b.textContent = 'Confirmer : la sauvegarde solo sera remplacée'; b.classList.add('danger'); return; }
  $('btn-start').dataset.confirm = ''; $('btn-start').classList.remove('danger');
  closeHubModals();
  if (launchMode === 'coop') openJoin(); else if (launchMode === 'survival') game.newSurvival(false); else if (launchMode === 'endless') game.newEndless(); else if (launchMode === 'daily') game.newDaily(); else if (launchMode === 'hospital') game.newHospital(); else game.newGame();
});
// panneaux de l'écran titre : un seul ouvert à la fois, et on défile jusqu'à lui
const TITLE_PANELS = [['panel-settings', 'btn-settings'], ['panel-scores', 'btn-scores'], ['panel-ach', 'btn-ach'], ['panel-best', 'btn-best'], ['panel-news', 'btn-news']];
const CREDITS = [['Zeus', 'Plante', 'zeus'], ['Dobby', 'Lor\'hi', 'dobby'], ['Chewie', 'Kiffeur', 'chewie'], ['Dragon', 'Maléfique', 'dragon']];
function fillCredits(el) {
  el.innerHTML = `<h3>Crédits</h3><div class="credits"><p class="eyebrow">Un jeu Nadrax Prod</p><div class="credit-list">${CREDITS.map(([n, r, k]) => `<div class="credit"><canvas width="480" height="360" data-portrait="${k}" aria-hidden="true"></canvas><div><b>${n}</b><span>${r}</span></div></div>`).join('')}</div></div>`;
  for (const cv of el.querySelectorAll('canvas[data-portrait]')) { renderPortrait(cv, cv.dataset.portrait); if (document.fonts && document.fonts.status !== 'loaded') fontsReady.then(() => renderPortrait(cv, cv.dataset.portrait)); }
  el.dataset.filled = '1';
}
const fillCreditsOnce = el => { if (el && !el.dataset.filled) fillCredits(el); };
function togglePanel(id, btn, fill) {
  game.audio.init(); const p = $(id);
  for (const [pid, bid] of TITLE_PANELS) { $(pid).hidden = true; $(bid).setAttribute('aria-expanded', 'false'); }
  if (fill) (p.querySelector('.sheet-body') || p).innerHTML = fill();
  p.hidden = false; btn.setAttribute('aria-expanded', 'true'); p.scrollTop = 0;
  $('scr-title').classList.add('page-open'); markTabs(btn);
  requestAnimationFrame(() => { const f = p.querySelector('.sheet-close'); if (f) f.focus({ preventScroll: true }); });
}
function markTabs(sel) { for (const b of document.querySelectorAll('.hub-tabs .tab')) b.setAttribute('aria-selected', b === sel ? 'true' : 'false'); }
$('btn-settings').addEventListener('click', e => { refreshContinue(); setHome('opts-title', true); togglePanel('panel-settings', e.currentTarget); });
function closeSheets() { for (const [pid, bid] of TITLE_PANELS) { $(pid).hidden = true; $(bid).setAttribute('aria-expanded', 'false'); } $('scr-title').classList.remove('page-open'); if (typeof setTab === 'function') setTab(hubTab); }
for (const sh of document.querySelectorAll('.sheet')) sh.addEventListener('click', e => { if (e.target === sh || e.target.closest('.sheet-close')) { closeSheets(); game.audio.ui(); } });
addEventListener('keydown', e => { if (e.key === 'Escape' && !game.keysOpen && document.querySelector('.sheet:not([hidden])')) { e.preventDefault(); if (!setBack()) closeSheets(); } });
const ONLINE_MODES = [['all', 'Tous'], ['story', 'Campagne'], ['survival', 'Survie'], ['endless', 'Nuit sans fin'], ['daily', 'Défi'], ['hospital', 'Hôpital'], ['coop', 'Duo']];
function scoresHTML() {
  if (!Online.on()) return scoreTable(Scores.list()) + (ONLINE.url ? '<p class="hint">Classement en ligne désactivé dans les Paramètres.</p>' : '');
  return `<div class="sc-tabs" role="tablist"><button type="button" class="btn sm" data-sct="local" aria-pressed="false">Sur cet appareil</button><button type="button" class="btn sm" data-sct="online" aria-pressed="true">En ligne</button></div><div class="sc-modes">${ONLINE_MODES.map(([k, v]) => `<button type="button" class="btn sm" data-scm="${k}" aria-pressed="${k === 'all'}">${v}</button>`).join('')}</div><div id="sc-body"><p class="hint">Chargement du classement…</p></div>`;
}
async function loadOnline(mode) {
  const el = $('sc-body'); if (!el) return; el.innerHTML = '<p class="hint">Chargement du classement…</p>';
  try { const l = await Online.top(mode); const me = (Settings.name || '').trim();
    el.innerHTML = !l.length ? '<p class="empty">Personne n\'a encore envoyé de score ici. À toi de jouer !</p>' : `<div class="tablewrap"><table class="scores"><thead><tr><th>#</th><th>Nom</th><th>Perso</th><th class="num">Score</th><th>Mode</th><th class="num">Abattus</th></tr></thead><tbody>${l.map((e, i) => `<tr class="${e.name === me ? 'me' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.perso || '–')}</td><td class="num">${fmt(e.score)}</td><td>${escapeHtml(e.diff || e.mode || '')}</td><td class="num">${fmt(e.kills || 0)}</td></tr>`).join('')}</tbody></table></div>`;
  } catch (er) { el.innerHTML = '<p class="empty">Classement en ligne injoignable (pas de réseau ?). Tes scores restent enregistrés sur l\'appareil.</p>'; }
}
$('btn-scores').addEventListener('click', e => {
  togglePanel('panel-scores', e.currentTarget, scoresHTML); if (!Online.on()) return; Online.send(null); loadOnline('all');
  const body = $('panel-scores').querySelector('.sheet-body'), sel = (attr, v) => { for (const b of body.querySelectorAll(`[${attr}]`)) b.setAttribute('aria-pressed', b.getAttribute(attr) === v); };
  for (const b of body.querySelectorAll('[data-scm]')) b.addEventListener('click', () => { game.audio.ui(); sel('data-scm', b.dataset.scm); sel('data-sct', 'online'); body.querySelector('.sc-modes').hidden = false; loadOnline(b.dataset.scm); });
  for (const b of body.querySelectorAll('[data-sct]')) b.addEventListener('click', () => { game.audio.ui(); sel('data-sct', b.dataset.sct); const loc = b.dataset.sct === 'local'; body.querySelector('.sc-modes').hidden = loc; if (loc) $('sc-body').innerHTML = scoreTable(Scores.list()); else loadOnline((body.querySelector('[data-scm][aria-pressed="true"]') || {}).dataset?.scm || 'all'); });
});
$('btn-resume').addEventListener('click', () => game.resume());
$('btn-pause-settings').addEventListener('click', () => { game.audio.ui(); setHome('opts-pause', true); $('pause-main').hidden = true; $('pause-settings').hidden = false; requestAnimationFrame(() => { $('btn-pause-back').focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo($('btn-pause-back')); }); });
$('btn-pause-back').addEventListener('click', () => { game.audio.ui(); $('pause-settings').hidden = true; $('pause-main').hidden = false; requestAnimationFrame(() => { $('btn-resume').focus({ preventScroll: true }); if (padCursor.on) padCursor.snapTo($('btn-resume')); }); });
$('btn-map-go').addEventListener('click', () => game.mapContinue());
$('btn-map-home').addEventListener('click', () => { game.audio.flame(false); game.setupDemo(); game.showScreen('scr-title'); refreshContinue(); });
function refreshHw() {
  const el = $('hw-chip'); if (!el) return; el.hidden = !HALLOWEEN; if (!HALLOWEEN) return;
  el.innerHTML = Settings.pumpkin ? '<b>🎃 Halloween</b> jusqu\'au 2 novembre · citrouilles piégées, zombies déguisés · tête de citrouille gagnée !' : `<b>🎃 Halloween</b> jusqu'au 2 novembre · zombies déguisés abattus : ${hwCount()} / ${HW_GOAL} pour la tête de citrouille`;
}
function refreshSurvivalBtn() {
  refreshHw();
  const sv = $('btn-survival-title'), pa = $('btn-paradise-title');
  sv.disabled = !Settings.survival; sv.classList.toggle('locked', !Settings.survival); $('surv-sub').textContent = Settings.survival ? 'Vagues sans fin sur la Place de la Mairie' : 'Verrouillé · termine la campagne une fois';
  pa.disabled = !Settings.paradise;
  refreshContinue();
}
function refreshAchCount() { const u = Ach.get(); $('ach-count').textContent = `${ACH.filter(a => u[a[0]]).length}/${ACH.length}`; }
function refreshContinue() {
  refreshAchCount(); if (typeof refreshHub === 'function') refreshHub();
  const d = readSave(), b = $('btn-continue'), sm = $('save-summary');
  b.hidden = !d; sm.hidden = !d; if (d) sm.textContent = `Sauvegarde : ${saveLine(d)}. Commencer une nouvelle nuit la remplacera au premier point de sauvegarde.`;
  $('save-info').textContent = d ? `Sauvegarde actuelle : ${saveLine(d)}.` : 'Aucune sauvegarde pour l\'instant : elle se crée au premier point de sauvegarde.';
  $('btn-save-delete').disabled = !d; $('btn-save-delete').dataset.confirm = '';  $('btn-save-delete').textContent = 'Supprimer la sauvegarde';
}
$('btn-continue').addEventListener('click', () => { const d = readSave(); closeHubModals(); if (d) game.loadSave(d); });

$('btn-save-copy').addEventListener('click', async () => {
  const code = await encodeProfile(), ta = $('save-code'); ta.value = code; ta.hidden = false;
  const done = () => { $('save-msg').textContent = 'Code copié. Sur l\'autre appareil : Paramètres › Sauvegarde › « Charger un code ».'; };
  const fallback = () => { ta.focus(); ta.select(); $('save-msg').textContent = 'Le code est sélectionné ci-dessus : copie-le avec Ctrl+C (ou un appui long sur téléphone).'; };
  try { navigator.clipboard.writeText(code).then(done, fallback); } catch (e) { fallback(); }
});
$('btn-save-import').addEventListener('click', async () => {
  const d = await decodeProfile($('save-import').value);
  if (!d) { $('save-msg').textContent = 'Ce code n\'est pas valide. Vérifie qu\'il est complet, de « CF » jusqu\'au dernier caractère.'; return; }
  const r = applyProfile(d); $('save-import').value = '';
  refreshSurvivalBtn(); renderWardrobe();
  $('save-msg').textContent = `Progression chargée : niveau ${r.lv}, ${r.ach} succès${r.run ? ', partie en cours prête : appuie sur « Continuer »' : ''}.`;
});
$('btn-wipe').addEventListener('click', e => {
  const b = e.currentTarget; if (!b.dataset.confirm) { b.dataset.confirm = '1'; b.textContent = 'Confirmer : niveaux, succès, scores et sauvegarde effacés'; return; }
  try { for (const k of ['couvrefeu.save', 'couvrefeu.ach', 'couvrefeu.scores', 'couvrefeu.settings']) localStorage.removeItem(k); localStorage.setItem('couvrefeu.achfix1', '1'); } catch (er) { }
  location.reload();
});
$('btn-save-delete').addEventListener('click', e => {
  const b = e.currentTarget; if (!b.dataset.confirm) { b.dataset.confirm = '1'; b.textContent = 'Confirmer la suppression'; return; }
  clearSave(); refreshContinue(); $('save-code').hidden = true; $('save-msg').textContent = 'Sauvegarde supprimée.';
});
refreshSurvivalBtn();
$('btn-paradise-title').addEventListener('click', () => { closeHubModals(); game.newSecret(false); });
