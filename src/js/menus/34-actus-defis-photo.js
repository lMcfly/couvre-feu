// ---------- flash info de l'accueil : 20 actus en BD, une nouvelle toutes les 4 s
const ZB = (g, x, y, s, o) => zombieC(g, x, y, s, o);
// ---------- défi du jour
const DAILY_MODS = [
  { id: 'pistol', name: 'Pistolet seulement', desc: 'Aucune autre arme, le marché noir ne vend que des munitions et de l\'équipement.' },
  { id: 'runners', name: 'Marathon', desc: 'Que des coureurs. Ne t\'arrête jamais.', weights: { runner: 100 } },
  { id: 'bombers', name: 'Feu d\'artifice', desc: 'Des kamikazes partout. Garde tes distances.', weights: { walker: 40, bomber: 45, runner: 15 } },
  { id: 'glass', name: 'Fragile', desc: 'Tu commences avec 40 points de vie.' },
  { id: 'lamp', name: 'Piles usées', desc: 'La lampe se vide deux fois et demie plus vite.' },
  { id: 'tanks', name: 'Zombies costauds', desc: 'Les zombies ont 60 % de vie en plus.' },
  { id: 'night', name: 'Nuit noire', desc: 'Presque aucune lumière en dehors de ta lampe.' }
];
const dayKey = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
function todayMod() { const k = dayKey(); return DAILY_MODS[(Math.imul(k, 2654435761) >>> 0) % DAILY_MODS.length]; }
function dailyBest() { const d = Settings.daily; return d && d.d === dayKey() ? d.best : 0; }
// ---------- actus KE-DLA-D sur ta dernière partie
const FEM = { fiona: true, dragon: true };
const ZONE_BG = [g => bgNight(g, 4), bgRadio, g => bgParking(g, false), bgPlaza];
function personalNews() {
  const r = Settings.lastRun, out = []; if (!r || !CHARS[r.char]) return out;
  const N = CHARS[r.char].name, e = FEM[r.char] ? 'e' : '', z = Math.max(0, Math.min(3, r.zone | 0)), body = (g, mood) => hero(r.char, g, 250, 420, 1.0, { mood, hand: PROP[r.char] });
  if (r.mode === 'daily') out.push({ h: `Défi du jour : ${fmt(r.score)} points pour ${N}`, t: `Épreuve « ${r.mod} ». ${r.kills} zombies abattus avant la fin.`, loc: 'la place de la Mairie', draw: g => { bgPlaza(g); body(g, 'determined'); sfx(g, 'DÉFI !', 380, 80, 46, 0.08); } });
  else if (r.mode === 'survival') out.push({ h: `Survie : ${N} tient ${r.wave} vague${r.wave > 1 ? 's' : ''}`, t: `${r.kills} zombies abattus sur la Place de la Mairie. Les voisins n'ont pas fermé l'œil.`, loc: 'la place de la Mairie', draw: g => { bgPlaza(g); body(g, 'determined'); sfx(g, 'TENU !', 380, 80, 46, 0.08); } });
  else if (r.mode === 'secret') out.push({ h: r.win ? `Le Shibanophile vaincu par ${N}` : `${N} recule devant le Shibanophile`, t: r.win ? 'Les shibas du paradis organisent une fête. Croquettes à volonté.' : 'Les shibas attendent toujours leur héros.', loc: 'le Paradis des Shibas', draw: g => { bgParadise(g); body(g, r.win ? 'happy' : 'shock'); shibaC(g, 400, 330, 1.2, { flip: true }); } });
  else if (r.win) out.push({ h: `${N} évacué${e} de la Place de la Mairie !`, t: `${r.kills} zombies abattus et ${fmt(r.score)} points. La Mairie salue un${e} « survivant${e} têtu${e} ».`, loc: 'la place de la Mairie', draw: g => { bgHeli(g); body(g, 'happy'); sfx(g, 'SAUVÉ' + (e ? 'E' : '') + ' !', 370, 80, 46, 0.08); } });
  else out.push({ h: `Disparition : ${N} aperçu${e} ${['avenue de la Gare', 'boulevard des Tanneurs', 'au parking Saint-Roch', 'place de la Mairie'][z]}`, t: `Dernier signe de vie : ${r.kills} zombies au compteur. Les recherches continuent.`, loc: ZONES[z].name.toLowerCase(), draw: g => { ZONE_BG[z](g); body(g, 'shock'); zombieC(g, 400, 430, 0.85, { flip: true }); sfx(g, 'AVIS DE RECHERCHE', 240, 70, 36, -0.04, '#ff6a4a'); } });
  if (r.shibas > 0 && r.mode === 'story') out.push({ h: `${r.shibas} shiba${r.shibas > 1 ? 's' : ''} sauvé${r.shibas > 1 ? 's' : ''} par ${N}`, t: 'Les éleveurs remercient le héros. Les shibas, eux, réclament une croquette.', loc: 'le refuge canin', draw: g => { bgDawn(g); body(g, 'happy'); shibaC(g, 400, 340, 1.3, { flip: true }); } });
  if (Settings.bestKills && r.kills >= Settings.bestKills && r.kills > 0) out.push({ h: `Record : ${r.kills} zombies abattus en une nuit`, t: `${N} entre dans l'histoire de Couvre-Feu. Le précédent record ne tient plus.`, loc: 'la rédaction', draw: g => { speedBg(g, '#5a1a14'); body(g, 'happy'); sfx(g, 'RECORD', 380, 80, 52, 0.08); } });
  return out;
}
function rebuildNews() {
  for (let i = NEWS.length - 1; i >= 0; i--) if (NEWS[i].personal) NEWS.splice(i, 1);
  const pn = personalNews();
  if (HALLOWEEN) pn.unshift({ h: 'Halloween : les zombies se déguisent', loc: 'les rues de la ville', t: `Citrouilles piégées dans les rues et zombies costumés jusqu'au 2 novembre. Abats-en ${HW_GOAL} pour gagner la tête de citrouille.`, draw: g => { bgNight(g, 9, ['#2a1440', '#6a2a10']); for (const [x, y, sc] of [[100, 300, 4], [385, 305, 3.4], [245, 325, 5.4]]) drawPumpkin(g, x, y, sc, 1); sfx(g, 'BOUH !', 370, 90, 50, 0.1, '#ff9a3a'); } });
  pn.forEach(n => n.personal = true); NEWS.unshift(...pn);
  newsCache = {}; for (const k in slideBase) delete slideBase[k];
  if (typeof updateTicker === 'function') updateTicker();
  if (pn.length && typeof showNews === 'function') showNews(0, 1, true);
}
// ---------- photo souvenir façon une de journal
function makeSouvenir(g0) {
  const r = Settings.lastRun || {}, ch = r.char || g0.charKey, N = CHARS[ch].name, W2 = 1200, H2 = 675;
  const cv = document.createElement('canvas'); cv.width = W2; cv.height = H2; const g = cv.getContext('2d');
  g.fillStyle = '#efe6cf'; g.fillRect(0, 0, W2, H2);
  g.fillStyle = 'rgba(120,90,50,.08)'; const rr = mulberry32(3); for (let i = 0; i < 900; i++) g.fillRect(rr() * W2, rr() * H2, 2, 2);
  g.fillStyle = '#d0141e'; g.fillRect(0, 0, W2, 92);
  g.font = '64px Bangers, Impact, sans-serif'; g.textAlign = 'left'; g.fillStyle = '#ffcf33'; g.lineWidth = 6; g.strokeStyle = '#120c09'; g.strokeText('KE-DLA-D', 40, 68); g.fillText('KE-DLA-D', 40, 68); g.fillStyle = '#fff'; g.fillText('TV', 300, 68);
  g.font = '22px "Special Elite", monospace'; g.textAlign = 'right'; g.fillStyle = '#fff'; g.fillText('ÉDITION SPÉCIALE · ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), W2 - 40, 56);
  const pn = personalNews()[0] || { h: `${N} a survécu à la nuit`, t: '' };
  g.textAlign = 'left'; g.fillStyle = '#120c09'; g.font = '58px Bangers, Impact, sans-serif';
  const lines = wrapLines(g, pn.h.toUpperCase(), 1120).slice(0, 2); lines.forEach((l, i) => g.fillText(l, 40, 160 + i * 60));
  const ty = 160 + lines.length * 60;
  const pc = document.createElement('canvas'); pc.width = 480; pc.height = 360; renderPortrait(pc, ch);
  g.save(); g.translate(40, ty); g.rotate(-0.02); g.fillStyle = '#fff'; g.fillRect(-10, -10, 520, 400); g.drawImage(pc, 0, 0, 500, 375); g.strokeStyle = '#120c09'; g.lineWidth = 4; g.strokeRect(0, 0, 500, 375); g.restore();
  g.font = '24px "Comic Neue", sans-serif'; g.fillStyle = '#2a2018'; wrapLines(g, pn.t, 600).slice(0, 4).forEach((l, i) => g.fillText(l, 580, ty + 30 + i * 32));
  const st = [['Score', fmt(r.score || g0.score)], ['Zombies', fmt(r.kills || g0.kills)], ['Shibas', String(r.shibas || 0)], [r.mode === 'survival' || r.mode === 'daily' ? 'Vagues' : 'Difficulté', r.mode === 'survival' || r.mode === 'daily' ? String(r.wave || 0) : (DIFFS[r.diff] || g0.diff).name]];
  st.forEach(([k, v], i) => { const x = 580 + (i % 2) * 290, y = ty + 180 + Math.floor(i / 2) * 104; g.fillStyle = '#120c09'; g.fillRect(x, y, 270, 90); g.fillStyle = '#ffcf33'; g.font = '46px Bangers, Impact, sans-serif'; g.fillText(v, x + 16, y + 56); g.fillStyle = '#c6c0b2'; g.font = '16px "Special Elite", monospace'; g.fillText(k.toUpperCase(), x + 16, y + 80); });
  g.fillStyle = '#120c09'; g.fillRect(0, H2 - 40, W2, 40); g.fillStyle = '#efe6cf'; g.font = '18px "Special Elite", monospace'; g.textAlign = 'center'; g.fillText('COUVRE-FEU · UN JEU NADRAX PROD · L\'INFO QUI PIQUE… ET QUI MORD', W2 / 2, H2 - 14);
  return cv;
}
function openSouvenir() {
  const cv = makeSouvenir(game), url = cv.toDataURL('image/png');
  $('photo-img').src = url; $('photo-dl').href = url; $('photo-dl').download = `couvre-feu-${CHARS[(Settings.lastRun || {}).char || game.charKey].name.toLowerCase()}.png`;
  $('photo-modal').hidden = false; $('photo-close').focus();
  $('photo-share').hidden = !(navigator.canShare);
  $('photo-share').onclick = () => cv.toBlob(b => { const f = new File([b], $('photo-dl').download, { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'Couvre-Feu', text: 'Ma nuit dans Couvre-Feu' }).catch(() => { }); else $('photo-dl').click(); });
}
const NEWS = [
  { h: 'Macaron s\'excuse… par SMS', t: '« Dsl pr la bombe 😬 » : le message a mis trois semaines à arriver, les antennes ayant fondu.', draw: g => { bgSummit(g); macaron(g, 240, 400, 1.0, { mood: 'shock' }); sfx(g, 'DSL…', 380, 90, 44, 0.1); } },
  { h: 'Trompe : « Les zombies ? Des fake news »', t: 'Le président a tenu sa conférence depuis un bunker, porte blindée fermée à double tour.', draw: g => { speedBg(g, '#6a1a14'); ZB(g, 110, 420, 0.95); trompe(g, 300, 420, 1.0, { mood: 'angry' }); sfx(g, 'FAKE !', 380, 80, 48, -0.1); } },
  { h: 'Pénurie de burritos : un Mexicain soupçonné', t: 'Les enquêteurs ont suivi une piste de haricots rouges jusqu\'à un food-truck.', draw: g => { bgTruck(g); pedro(g, 250, 420, 1.0, { mood: 'happy', hand: 'burrito' }); sfx(g, 'MIAM', 400, 90, 46, 0.12); } },
  { h: 'Une Nordiste prise pour un zombie, 14e fois', t: '« J\'ai juste pas dormi », explique-t-elle, un cornet de frites à la main.', draw: g => { bgFriterie(g); ZB(g, 340, 420, 0.95, { flip: true }); fiona(g, 150, 420, 1.0, { mood: 'deadpan', hand: 'frites' }); sfx(g, '?!', 250, 80, 52, 0); } },
  { h: 'Un ficus survit à la bombe', t: 'Son propriétaire, un barbu aux 147 plantes, se dit « pas surpris du tout ».', draw: g => { bgBalcony(g, true); zeusC(g, 240, 420, 1.0, { mood: 'happy', hand: 'plant' }); sfx(g, 'INCASSABLE', 250, 70, 38, -0.06, '#7fd18b'); } },
  { h: 'Météo : averses de zombies ce soir', t: 'Nuit noire, rafales de gémissements. Sortez couverts, et armés.', draw: g => { bgNight(g, 7); rain(g, mulberry32(7), 0.4); ZB(g, 110, 430, 0.8); ZB(g, 250, 440, 0.9, { flip: true }); ZB(g, 390, 430, 0.8); sfx(g, 'ALERTE', 240, 70, 46, -0.05, '#9fd6e6'); } },
  { h: 'Les shibas refusent de commenter', t: 'Interrogés sur leur rôle dans la fin du monde, ils ont réclamé une croquette.', draw: g => { bgDawn(g); shibaC(g, 130, 330, 1.3); shibaC(g, 250, 340, 1.5, { flip: true }); shibaC(g, 370, 330, 1.3); sfx(g, 'WAF', 250, 90, 54, 0.08); } },
  { h: 'Le Shibanophile porte plainte', t: 'Motif : « mignonnerie excessive en bande organisée ». Les shibas ont souri.', draw: g => { bgLair(g, true); shibanophileC(g, 170, 420, 0.95); shibaC(g, 360, 340, 1.4, { flip: true }); sfx(g, 'GRRR', 200, 80, 44, -0.1, '#ff6a8a'); } },
  { h: 'Une chaussette retrouvée dans les ruines', t: 'Son nouveau propriétaire se déclare « libre ». Personne ne sait de quoi.', draw: g => { bgHome(g, false); dobbyC(g, 240, 420, 1.15, { mood: 'happy', hand: 'sock' }); sfx(g, 'LIBRE !', 250, 80, 48, -0.08); } },
  { h: 'Un kebab rouvre en pleine apocalypse', t: 'Le patron, très poilu, ne sert qu\'une sauce : la blanche. « Tranquille. »', draw: g => { bgKebab(g); chewieC(g, 240, 420, 1.0, { mood: 'happy', hand: 'kebab' }); sfx(g, 'SAUCE BLANCHE', 250, 70, 34, -0.05); } },
  { h: 'Pour Dragon, le feu est « un mode de vie »', t: 'Elle a allumé sa cigarette sur un zombie en flammes. Il n\'a pas apprécié.', draw: g => { bgLair(g, true); glowAt(g, 360, 300, 140, '255,120,40'); dragonC(g, 200, 420, 1.0, { mood: 'determined', hand: 'coffee' }); ZB(g, 380, 430, 0.85, { flip: true }); sfx(g, 'FSHHH', 380, 90, 42, 0.1, '#ff9a3a'); } },
  { h: 'Les CRS-zombies en grève', t: 'Ils réclament une prime de risque et des boucliers « moins lourds à traîner ».', draw: g => { bgPlaza(g); ZB(g, 140, 430, 0.9); ZB(g, 320, 430, 0.9, { flip: true }); sfx(g, 'GRÈVE !', 240, 80, 54, -0.06, '#ff5a3a'); } },
  { h: 'Bouchon monstre au parking Saint-Roch', t: '3 000 zombies et une 2CV bloquent la sortie. Le klaxon n\'a rien arrangé.', draw: g => { bgParking(g, false); ZB(g, 90, 430, 0.75); ZB(g, 200, 440, 0.8); ZB(g, 310, 430, 0.75, { flip: true }); ZB(g, 420, 440, 0.8, { flip: true }); sfx(g, 'POUET', 250, 80, 50, 0.08); } },
  { h: 'La boulangère menace : « Chocolatine ou je mords »', t: 'Mme Lefebvre précise qu\'elle « ne juge pas ». Elle juge un peu.', draw: g => { bgMarket(g); npc(g, 240, 420, 1.0, { coat: '#9a5a7a', mood: 'angry' }); sfx(g, 'PAIN AU CHOCO ?', 250, 70, 34, -0.04, '#ff9a6a'); } },
  { h: 'Gérard a connu pire', t: 'Le cheminot retraité compare l\'apocalypse à « la grève de 95, en plus calme ».', draw: g => { bgMetro(g); npc(g, 240, 420, 1.0, { coat: '#5a4a3a', mood: 'happy', prop: 'clipboard' }); sfx(g, 'BOF', 380, 90, 46, 0.1); } },
  { h: 'Livreur à vélo : 3 minutes, une horde aux trousses', t: 'Kévin a livré à l\'heure. La commande, elle, est froide. Cinq étoiles quand même.', draw: g => { speedBg(g, '#1f4a3a'); npc(g, 300, 420, 1.0, { coat: '#2f8f6b', mood: 'shock', flip: true }); ZB(g, 110, 430, 0.85); sfx(g, 'VROOOM', 250, 80, 48, -0.1); } },
  { h: 'Le métro Lafayette devient une boîte de nuit', t: 'Clientèle : 100 % zombie. Ambiance : « mortelle », selon un videur.', draw: g => { bgMetro(g); glowAt(g, 240, 200, 200, '200,60,220'); ZB(g, 140, 430, 0.85, { sniff: true }); ZB(g, 330, 430, 0.85, { flip: true }); sfx(g, 'BOUM BOUM', 250, 80, 44, 0.06, '#d88aff'); } },
  { h: 'Couvre-feu prolongé jusqu\'à… on ne sait pas', t: 'Personne ne répond à la Mairie. Le standard sonne dans le vide depuis mardi.', draw: g => { bgPlaza(g); ZB(g, 240, 430, 1.0, { sniff: true }); sfx(g, 'DRING ?', 250, 80, 50, -0.08); } },
  { h: 'Sondage : 87 % des zombies veulent des cerveaux bio', t: 'Les 13 % restants n\'ont pas compris la question.', draw: g => { bgNight(g, 3); npc(g, 330, 420, 0.95, { coat: '#3a5a7a', prop: 'clipboard', mood: 'annoyed', flip: true }); ZB(g, 140, 430, 0.95); sfx(g, '87 %', 250, 80, 54, -0.05, '#7fd18b'); } },
  { h: 'Macaron et Trompe : un nouveau sommet prévu', t: 'Ordre du jour : « ne plus toucher au bouton rouge ». Les experts restent prudents.', draw: g => { bgSummit(g); macaron(g, 150, 420, 0.85, { mood: 'happy' }); trompe(g, 340, 420, 0.85, { mood: 'angry', flip: true }); sfx(g, 'OUPS', 250, 80, 48, 0.08, '#ff5a3a'); } }
];
let newsIdx = 0, newsT = 0, newsPaused = false, newsCache = {};
function newsCanvas(i) {
  if (newsCache[i]) return newsCache[i];
  const cv = document.createElement('canvas'); cv.width = 480; cv.height = 360; const g = cv.getContext('2d');
  try { NEWS[i].draw(g); } catch (e) { g.fillStyle = '#222'; g.fillRect(0, 0, 480, 360); }
  halftone(g);
  g.lineWidth = 8; g.strokeRect(0, 0, 480, 360);
  return (newsCache[i] = cv);
}
// petit plateau du JT incrusté en bas à gauche de l'image
const clockStr = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
// petit plateau du JT incrusté en bas à gauche de l'image, animé
const slideBase = {};
const NEWS_LOC = ['Genève', 'le bunker présidentiel', 'le food-truck', 'la friterie', 'le balcon de Zeus', 'la rocade nord', 'le parc canin', 'le repaire du Shibanophile', 'les ruines', 'le kebab', 'la crypte', 'la place de la Mairie', 'le parking Saint-Roch', 'la boulangerie', 'le dépôt SNCF', 'la rue de la Paix', 'le métro Lafayette', 'la Mairie', 'le marché', 'Genève'];
NEWS.forEach((n, k) => { if (!n.loc) n.loc = NEWS_LOC[k]; });
// image de JT : sujet en fond sur le mur d'écrans, présentateurs devant, bureau blanc, habillage de chaîne
function drawDuplex(g, i, t) {
  const W2 = 480, H2 = 270;
  // décor : ville de nuit floutée, façon plateau du 20 h
  const wg = g.createLinearGradient(0, 0, 0, H2); wg.addColorStop(0, '#0d2a6a'); wg.addColorStop(0.6, '#1a3f8f'); wg.addColorStop(1, '#0a1a44'); g.fillStyle = wg; g.fillRect(0, 0, W2, H2);
  const rr = mulberry32(11); for (let k = 0; k < 60; k++) { const x = rr() * 480, y = 90 + rr() * 100, r0 = 2 + rr() * 6; g.fillStyle = `rgba(255,${190 + rr() * 50 | 0},${120 + rr() * 80 | 0},${0.15 + rr() * 0.35})`; g.beginPath(); g.arc(x, y, r0, 0, TAU); g.fill(); }
  // grand écran avec le sujet, entier
  const sx = 170, sy = 10, sw = 266, sh = 186;
  g.fillStyle = '#05070f'; g.fillRect(sx - 5, sy - 5, sw + 10, sh + 10); g.drawImage(newsCanvas(i), 0, 30, 480, 335, sx, sy, sw, sh);
  g.strokeStyle = 'rgba(160,200,255,.55)'; g.lineWidth = 2; g.strokeRect(sx - 5, sy - 5, sw + 10, sh + 10);
  const gl = g.createLinearGradient(sx, sy, sx + sw * 0.6, sy + sh * 0.6); gl.addColorStop(0, 'rgba(255,255,255,.12)'); gl.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(sx, sy, sw, sh);
  // projecteurs
  for (let k = 0; k < 3; k++) { const lx = 90 + k * 150, sx = Math.sin(t * 0.8 + k * 2) * 20; const c = g.createLinearGradient(lx, 0, lx + sx, 170); c.addColorStop(0, 'rgba(255,245,220,.22)'); c.addColorStop(1, 'rgba(255,245,220,0)'); g.fillStyle = c; g.beginPath(); g.moveTo(lx - 5, 0); g.lineTo(lx + 5, 0); g.lineTo(lx + sx + 36, 170); g.lineTo(lx + sx - 36, 170); g.fill(); }
  // présentateur zombie, debout à gauche : il se balance, penche la tête et parle
  const bob = Math.sin(t * 2.2) * 2, tilt = Math.sin(t * 0.9) * 0.05, s = 0.52;
  g.save(); g.translate(92, 236 + bob); g.rotate(tilt); zombieC(g, 0, 0, s);
  g.fillStyle = '#123a9e'; g.beginPath(); g.moveTo(1, -104); g.lineTo(9, -104); g.lineTo(10, -80); g.lineTo(5, -75); g.lineTo(0, -80); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  const talk = Math.abs(Math.sin(t * 12)) * (Math.sin(t * 1.3) > -0.4 ? 1 : 0.15); g.fillStyle = '#2a0a0a'; g.beginPath(); g.ellipse(6, -112, 8, 1.2 + talk * 5, 0, 0, TAU); g.fill();
  g.restore();
  // co-présentatrice shiba, à droite, sur le bureau
  const hop = Math.max(0, Math.sin(t * 3.1)) * 4, wag = Math.sin(t * 13) * 0.07;
  g.save(); g.translate(452, 214 - hop); g.rotate(wag); shibaC(g, 0, 0, 0.62, { flip: true }); g.restore();
  // bureau blanc brillant avec liseré bleu
  const dg = g.createLinearGradient(0, 178, 0, H2); dg.addColorStop(0, '#f4f6fb'); dg.addColorStop(0.4, '#c9d3e6'); dg.addColorStop(1, '#7d8db0'); g.fillStyle = dg; g.beginPath(); g.moveTo(0, 212); g.quadraticCurveTo(240, 194, W2, 208); g.lineTo(W2, H2); g.lineTo(0, H2); g.closePath(); g.fill();
  g.strokeStyle = `rgba(60,140,255,${0.6 + Math.sin(t * 2.5) * 0.3})`; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 214); g.quadraticCurveTo(240, 196, W2, 210); g.stroke();
  g.fillStyle = '#fff'; g.save(); g.translate(250, 220); g.rotate(-0.06); g.fillRect(0, 0, 40, 26); g.fillStyle = '#c9ccd6'; for (let k = 0; k < 4; k++) g.fillRect(5, 5 + k * 5, 30, 1.5); g.restore();
  // logo de la chaîne, heure réelle, direct
  g.textAlign = 'left'; g.font = '20px Bangers, Impact, sans-serif'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.5)'; g.strokeText('KE-DLA-D', 10, 28); g.fillStyle = '#fff'; g.fillText('KE-DLA-D', 10, 28); g.strokeText('TV.', 10, 48); g.fillText('TV.', 10, 48);
  g.fillStyle = '#fff'; g.fillRect(98, 13, 44, 18); g.fillStyle = '#0a1a4a'; g.font = '15px Bangers, Impact, sans-serif'; g.fillText(clockStr(), 104, 27);
  g.fillStyle = '#123a9e'; g.fillRect(142, 13, 52, 18); g.fillStyle = Math.sin(t * 4) > -0.2 ? '#fff' : '#9fb8ff'; g.fillText('DIRECT', 148, 27);
}
function paintSlide(el, t) { const i = +el.dataset.idx; if (!el.dataset.idx || isNaN(i)) return; drawDuplex(el.querySelector('canvas').getContext('2d'), i, t); }
function fillSlide(el, i) {
  const n = NEWS[i]; el.dataset.idx = i; paintSlide(el, performance.now() / 1000);
  el.querySelector('.news-h').textContent = n.h; const nt = el.querySelector('.news-t'); nt.innerHTML = ''; const b = document.createElement('b'); b.textContent = NEWS[i].loc.charAt(0).toUpperCase() + NEWS[i].loc.slice(1) + ' : '; nt.append(b, n.t);
}
(function newsLoop() { if (game.state === 'title' && !$('pane-lobby').hidden && !$('scr-title').classList.contains('page-open')) { const t = performance.now() / 1000; for (const el of document.querySelectorAll('.news-slide')) paintSlide(el, t); const c = $('news-clock'); if (c) c.textContent = clockStr(); } requestAnimationFrame(newsLoop); })();
let newsBusy = false;
function updateTicker() { const line = NEWS.map(n => n.h).join('   ✦   ') + '   ✦   '; $('news-ticker').textContent = line + line; }
updateTicker();
function showNews(i, dir = 1, instant = false) {
  const view = document.querySelector('.news-view'), cur = view.querySelector('.news-slide.cur'), nxt = view.querySelector('.news-slide.nxt');
  newsIdx = (i + NEWS.length) % NEWS.length; newsT = 0;
  if (instant) { fillSlide(cur, newsIdx); return; }
  if (newsBusy) return; newsBusy = true;
  fillSlide(nxt, newsIdx);
  nxt.style.transition = 'none'; nxt.style.transform = `translateX(${dir > 0 ? 100 : -100}%)`; void nxt.offsetWidth;
  nxt.style.transition = ''; cur.style.transition = '';
  nxt.style.transform = 'translateX(0)'; cur.style.transform = `translateX(${dir > 0 ? -100 : 100}%)`;
  setTimeout(() => { cur.classList.replace('cur', 'nxt'); nxt.classList.replace('nxt', 'cur'); cur.setAttribute('aria-hidden', 'true'); nxt.removeAttribute('aria-hidden'); newsBusy = false; }, 760);
}
$('news-prev').addEventListener('click', () => showNews(newsIdx - 1, -1));
$('news-next').addEventListener('click', () => showNews(newsIdx + 1));
$('news-card').addEventListener('mouseenter', () => { newsPaused = true; });
$('news-card').addEventListener('mouseleave', () => { newsPaused = false; });
setInterval(() => { if (game.state !== 'title' || newsPaused || $('pane-lobby').hidden || $('scr-title').classList.contains('page-open') || document.hidden) return; newsT += 0.25; if (newsT >= 8) showNews(newsIdx + 1); }, 250);
showNews(Math.floor(Math.random() * NEWS.length), 1, true); fontsReady.then(() => { newsCache = {}; for (const k in slideBase) delete slideBase[k]; showNews(newsIdx, 1, true); });
// écran de JT : présentateur zombie, incrustation de l'actu, bandeau et défilant
