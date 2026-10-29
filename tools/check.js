#!/usr/bin/env node
// Vérifications avant publication (sans dépendance) : rien n'est publié si l'une d'elles échoue.
//   1. tous les fichiers de src/js sont listés dans src/ordre.json (et inversement)
//   2. le jeu assemblé est du JavaScript valide
//   3. aucun commentaire « // » ne désactive du code écrit après lui sur la même ligne
//   4. aucune méthode n'est écrite deux fois dans une même classe ou un même mixin
//   5. les fichiers mis en cache hors ligne par sw.js existent
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), { build } = require('./build');
const errors = [], warn = m => errors.push(m);

// 1. ordre de chargement complet
const order = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/ordre.json'), 'utf8')).js;
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const onDisk = walk(path.join(ROOT, 'src/js')).filter(f => f.endsWith('.js')).map(f => path.relative(ROOT, f).split(path.sep).join('/'));
for (const f of onDisk) if (!order.includes(f)) warn(`${f} existe mais n'est pas dans src/ordre.json`);
for (const f of order) if (!onDisk.includes(f)) warn(`src/ordre.json cite ${f}, introuvable`);
if (new Set(order).size !== order.length) warn('src/ordre.json cite un fichier deux fois');

// 2. syntaxe du jeu assemblé (compilé sans être exécuté)
const html = build(), m = html.match(/<script>\n([\s\S]*)<\/script>/);
if (!m) warn('balise <script> introuvable dans le jeu assemblé');
else try { new vm.Script(m[1], { filename: 'jeu.js' }); } catch (e) { warn(`syntaxe : ${e.message}\n${(e.stack || '').split('\n').slice(0, 3).join('\n')}`); }

// découpe une ligne en code / commentaire de fin de ligne, en ignorant les chaînes et les expressions régulières simples
function lineComment(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '/' && line[i + 1] === '/') return line.slice(i + 2);
    if (c === '/' && line[i + 1] === '*') { const j = line.indexOf('*/', i + 2); if (j < 0) return null; i = j + 1; continue; }
    if (c === '/' && /[=(,:!&|?;{}[]\s*$/.test(line.slice(0, i))) { const j = line.slice(i + 1).search(/(?<!\\)\//); if (j >= 0) { i += j + 1; continue; } }
  }
  return null;
}
// 3. commentaire qui avale du code (c'est arrivé deux fois : les zombies du duo, puis les grenades)
const CODEY = /[;{}]\s*(const|let|var|if|for|while|return|else|this\.|[A-Za-z_$][\w$]*\s*(\.|\(|=[^=]))/;
for (const f of order) fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((l, n) => {
  const c = lineComment(l); if (c && CODEY.test(c)) warn(`${f}:${n + 1} : un commentaire « // » semble contenir du code (utiliser /* … */) :\n    ${l.trim().slice(0, 160)}`);
});

// 4. méthodes en double (une classe ou un mixin à la fois) : la seconde écraserait la première sans bruit
for (const f of order) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n'); let block = null, seen = null;
  src.forEach((l, n) => {
    if (/^(class \w+|mixin\(\w+, \{)/.test(l)) { block = l.match(/^(class \w+|mixin\(\w+)/)[1]; seen = new Map(); return; }
    if (/^(\}|\}\);)\s*$/.test(l)) { block = null; return; }
    const mm = block && l.match(/^  (?:static |async )?(?:get |set )?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/);
    if (mm && !/^\s*(if|for|while|switch|catch)\b/.test(mm[1])) { const k = (l.includes(' get ') || l.trimStart().startsWith('get ') ? 'get ' : l.trimStart().startsWith('set ') ? 'set ' : '') + mm[1]; if (seen.has(k)) warn(`${f}:${n + 1} : ${block} définit ${mm[1]} deux fois (déjà ligne ${seen.get(k)})`); else seen.set(k, n + 1); }
  });
}

// 5. cache hors ligne
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), core = (sw.match(/CORE\s*=\s*\[([^\]]*)\]/) || [, ''])[1];
for (const u of core.match(/'[^']+'/g) || []) { const p = u.slice(1, -1).replace(/^\.\//, '') || 'index.html'; if (p && !p.endsWith('/') && !fs.existsSync(path.join(ROOT, p))) warn(`sw.js met en cache ${p}, introuvable`); }

if (errors.length) { console.error(`✗ ${errors.length} problème(s) :\n- ` + errors.join('\n- ')); process.exit(1); }
console.log(`✓ vérifications OK (${order.length} fichiers, ${(html.length / 1024).toFixed(0)} Ko)`);
