#!/usr/bin/env node
// Test rapide du jeu assemblé dans un vrai navigateur (Playwright + Chromium) : ~1 min.
// Accueil, campagne, marché noir, réglages, arsenal, survie, pause et Duo en ligne (deux onglets, sans réseau).
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
let pw; for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) { try { pw = require(p); break; } catch (e) { } }
if (!pw) { console.log('… test rapide ignoré : Playwright absent sur cette machine'); process.exit(process.argv.includes('--require') ? 1 : 0); }
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain' };
const server = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r)); const URL = `http://127.0.0.1:${server.address().port}/index.html?nohalloween`;
  const exe = fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined;
  const b = await pw.chromium.launch({ executablePath: exe, args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
  const errs = [], steps = [], ok = (name, cond, info) => { steps.push(`${cond ? '✓' : '✗'} ${name}${info ? ' · ' + info : ''}`); if (!cond) errs.push(name); };
  const page = async (ctxOpt) => { const c = await b.newContext(ctxOpt); const p = await c.newPage(); p.on('pageerror', e => errs.push('erreur JS : ' + e.message)); await p.addInitScript(() => { try { localStorage.setItem('couvrefeu.installseen', '1'); localStorage.setItem('couvrefeu.settings', JSON.stringify({ xp: 10, wnSeen: 9999 })); } catch (e) { } }); return p; };
  try {
    for (const [dev, opt] of [['PC', { viewport: { width: 1280, height: 720 } }], ['téléphone', { viewport: { width: 874, height: 402 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
      const p = await page(opt); await p.goto(URL); await p.waitForTimeout(3500);
      ok(`${dev} : accueil`, await p.evaluate(() => !!window.__cf && __cf.state === 'title'));
      for (const t of ['perso', 'arsenal', 'lobby']) await p.evaluate(t => document.querySelector(`.hub-tabs [data-tab="${t}"]`).click(), t);
      await p.evaluate(() => { document.getElementById('btn-settings').click(); document.querySelector('#opts-title [data-setcat="son"]').click(); });
      ok(`${dev} : réglages`, await p.evaluate(() => !document.querySelector('#opts-title [data-page="son"]').hidden));
      await p.evaluate(() => document.querySelector('#panel-settings .sheet-close').click());
      await p.evaluate(() => { const g = __cf; g.newGame(); for (let i = 0; i < 6 && g.state !== 'playing'; i++) { if (g.state === 'comic') g.comic.finish(); else if (g.state === 'map') g.mapContinue(); } });
      await p.waitForTimeout(400); await p.mouse.move(900, 300); await p.mouse.down(); await p.keyboard.down('KeyD'); await p.waitForTimeout(2500); await p.keyboard.up('KeyD'); await p.mouse.up();
      ok(`${dev} : campagne jouée`, await p.evaluate(() => __cf.state === 'playing' && __cf.player.x > 190), await p.evaluate(() => `x=${Math.round(__cf.player.x)}`));
      await p.evaluate(() => { __cf.player.money = 2000; __cf.shop.open(); }); ok(`${dev} : marché noir`, await p.evaluate(() => __cf.state === 'shop')); await p.evaluate(() => __cf.shop.close());
      await p.evaluate(() => { __cf.newSurvival(false); }); await p.waitForTimeout(2500); ok(`${dev} : survie`, await p.evaluate(() => __cf.state === 'playing' && __cf.mode === 'survival'));
      await p.evaluate(() => __cf.pause()); ok(`${dev} : pause`, await p.evaluate(() => __cf.state === 'paused'));
      await p.context().close();
    }
    // Duo en ligne entre deux onglets (relais local, sans Supabase)
    const ctx = await b.newContext({ viewport: { width: 560, height: 315 } }), H = await ctx.newPage(), G = await ctx.newPage();
    for (const p of [H, G]) { p.on('pageerror', e => errs.push('erreur JS (duo) : ' + e.message)); await p.goto(URL + '&netlocal'); } await H.waitForTimeout(3500);
    await H.evaluate(() => { document.getElementById('mode-online').click(); document.getElementById('net-host').click(); }); await H.waitForTimeout(400);
    const code = await H.evaluate(() => document.getElementById('net-code').textContent);
    await G.evaluate(c => { document.getElementById('mode-online').click(); document.getElementById('net-join').click(); document.getElementById('net-in').value = c; document.getElementById('net-ok').click(); }, code);
    await H.waitForTimeout(2500); await H.evaluate(() => document.getElementById('net-go').click()); await H.waitForTimeout(3000);
    ok('duo en ligne : partie lancée chez les deux', await H.evaluate(() => __cf.state === 'playing' && __cf.net === 'host') && await G.evaluate(() => __cf.state === 'playing' && __cf.netGuest));
  } catch (e) { errs.push('test interrompu : ' + e.message.split('\n')[0]); }
  await b.close(); server.close();
  console.log(steps.join('\n'));
  if (errs.length) { console.error(`✗ test rapide en échec :\n- ` + [...new Set(errs)].join('\n- ')); process.exit(1); }
  console.log('✓ test rapide OK');
})();
