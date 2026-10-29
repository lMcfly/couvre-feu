#!/usr/bin/env node
// Assemble le jeu : les fichiers de src/ sont réunis dans un seul index.html (jouable hors ligne, sans serveur).
// Usage : node tools/build.js [--out chemin]   (par défaut : index.html à la racine du dépôt)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src');
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

function build() {
  const order = JSON.parse(read('ordre.json'));
  const js = order.js.map(f => read(f.replace(/^src\//, ''))).join('');
  return read('head.html') + '<style>' + read('css/polices.css') + '</style>\n<style>\n' + read('css/style.css') + '</style>\n'
    + read('body.html') + '<script>\n' + js + '</script>' + read('tail.html');
}

if (require.main === module) {
  const i = process.argv.indexOf('--out'), out = i > 0 ? process.argv[i + 1] : path.join(ROOT, 'index.html');
  const html = build(); fs.writeFileSync(out, html);
  console.log(`index.html assemblé : ${(html.length / 1024).toFixed(0)} Ko → ${path.relative(process.cwd(), out) || out}`);
}
module.exports = { build };
