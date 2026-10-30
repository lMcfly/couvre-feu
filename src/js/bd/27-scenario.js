// ---------- prologue : le sommet qui a mal tourné
function bgSummit(g) {
  g.fillStyle = '#1d3566'; g.fillRect(0, 0, 480, 360);
  for (let x = 0; x < 480; x += 40) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, 0, 18, 360); }
  S(g, '#e8e2d0', () => RR(g, 120, 24, 240, 34, 3), 3); sfx(g, 'SOMMET DU G2 · GENÈVE', 240, 50, 20, 0, '#151213');
  for (const [px, kind] of [[50, 'fr'], [430, 'us']]) {
    g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(px, 300); g.lineTo(px, 70); g.stroke();
    const fx = px === 50 ? px : px - 74, fy = 76;
    if (kind === 'fr') { [['#2a4ea0', 0], ['#f4f1e6', 1], ['#c0201a', 2]].forEach(([c, i]) => { g.fillStyle = c; g.fillRect(fx + i * 25, fy, 25, 50); }); }
    else { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#f4f1e6' : '#c0201a'; g.fillRect(fx, fy + i * 50 / 7, 74, 50 / 7 + 0.5); } g.fillStyle = '#2a4ea0'; g.fillRect(fx, fy, 32, 26); }
    S(g, null, () => g.rect(fx, fy, 74, 50), 3);
  }
  g.fillStyle = '#3a2c2a'; g.fillRect(0, 300, 480, 60);
}
function lectern(g, cx) {
  S(g, '#5a3c24', () => { g.moveTo(cx - 92, 262); g.lineTo(cx + 92, 262); g.lineTo(cx + 70, 362); g.lineTo(cx - 70, 362); g.closePath(); });
  S(g, '#7a5432', () => RR(g, cx - 100, 250, 200, 16, 3)); S(g, '#e8e2d0', () => E(g, cx, 306, 26, 26), 3); sfx(g, 'G2', cx, 316, 22, 0, '#2a4ea0');
  g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(cx - 40, 250); g.lineTo(cx - 52, 206); g.stroke(); S(g, '#2a2a2e', () => E(g, cx - 54, 200, 7, 10), 3);
}
function macaron(g, x, y, s, o = {}) {
  const skin = '#e2b594'; g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, '#1d2740', () => { RR(g, -28, -92, 24, 90, 6); RR(g, 4, -92, 24, 90, 6); });
  S(g, '#1f2a44', () => { g.moveTo(-54, -92); g.lineTo(54, -92); g.lineTo(42, -202); g.lineTo(-42, -202); g.closePath(); });
  S(g, '#fff', () => { g.moveTo(-14, -202); g.lineTo(0, -160); g.lineTo(14, -202); g.closePath(); }, 3);
  S(g, '#2a5aa8', () => { g.moveTo(-5, -198); g.lineTo(5, -198); g.lineTo(7, -150); g.lineTo(0, -140); g.lineTo(-7, -150); g.closePath(); }, 2);
  armLine(g, -40, -186, -50, -114, '#1f2a44'); S(g, skin, () => E(g, -52, -106, 10, 10), 3);
  armLine(g, 40, -186, 64, -206, '#1f2a44');
  S(g, '#f4a6c0', () => E(g, 74, -232, 18, 9), 3); S(g, '#fff3e0', () => RR(g, 56, -226, 36, 6, 3), 2); S(g, '#f4a6c0', () => E(g, 74, -218, 18, 8), 3);
  S(g, skin, () => E(g, 66, -206, 10, 10), 3);
  S(g, skin, () => { E(g, -34, -236, 7, 10); E(g, 34, -236, 7, 10); }, 3);
  S(g, skin, () => E(g, 0, -238, 34, 40));
  S(g, '#3b2c22', () => { g.moveTo(-34, -246); g.quadraticCurveTo(-30, -286, 4, -282); g.quadraticCurveTo(34, -280, 36, -250); g.quadraticCurveTo(14, -268, -6, -262); g.quadraticCurveTo(-22, -262, -34, -246); g.closePath(); });
  face(g, 'deadpan', -244, skin); g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(4, -262); g.lineTo(26, -268); g.stroke();
  g.lineWidth = 4; g.beginPath(); g.moveTo(-12, -214); g.quadraticCurveTo(6, -206, 16, -220); g.stroke();
  g.restore();
}
function trompe(g, x, y, s, o = {}) {
  const skin = '#f0a050'; g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, '#1b2236', () => { RR(g, -34, -92, 28, 90, 6); RR(g, 6, -92, 28, 90, 6); });
  S(g, '#1b2236', () => { g.moveTo(-72, -92); g.lineTo(72, -92); g.lineTo(52, -204); g.lineTo(-52, -204); g.closePath(); });
  S(g, '#fff', () => { g.moveTo(-16, -204); g.lineTo(0, -150); g.lineTo(16, -204); g.closePath(); }, 3);
  S(g, '#c0201a', () => { g.moveTo(-8, -198); g.lineTo(8, -198); g.lineTo(13, -96); g.lineTo(0, -80); g.lineTo(-13, -96); g.closePath(); }, 2);
  armLine(g, -48, -186, -60, -112, '#1b2236'); S(g, skin, () => E(g, -62, -104, 12, 12), 3);
  if (o.hand === 'button') { armLine(g, 46, -186, 120, -198, '#1b2236'); S(g, skin, () => E(g, 128, -198, 16, 14), 3); }
  else { armLine(g, 46, -186, 76, -250, '#1b2236'); S(g, skin, () => E(g, 78, -258, 11, 11), 3); }
  S(g, skin, () => E(g, 0, -240, 40, 42));
  S(g, '#f6d7a8', () => { E(g, -15, -246, 14, 10); E(g, 15, -246, 14, 10); }, 0);
  face(g, o.mood || 'angry', -246, skin);
  S(g, '#3a0e0e', () => E(g, 0, -212, 14, 9), 3);
  S(g, '#f2d16b', () => { g.moveTo(-44, -246); g.quadraticCurveTo(-52, -302, 10, -298); g.quadraticCurveTo(66, -294, 56, -262); g.quadraticCurveTo(30, -282, -4, -272); g.quadraticCurveTo(-30, -268, -44, -246); g.closePath(); });
  g.lineWidth = 2.5; g.strokeStyle = 'rgba(120,90,20,.7)'; g.beginPath(); g.moveTo(-30, -280); g.quadraticCurveTo(10, -298, 48, -276); g.moveTo(-36, -266); g.quadraticCurveTo(6, -286, 40, -270); g.stroke();
  g.restore();
}
function redButton(g, x, y) {
  S(g, '#3a3d42', () => RR(g, x, y, 170, 74, 8)); S(g, '#e0201a', () => { g.ellipse(x + 85, y + 6, 46, 28, 0, Math.PI, TAU); g.closePath(); });
  S(g, '#f2c14e', () => RR(g, x + 20, y + 30, 130, 26, 3), 3); sfx(g, 'NE PAS APPUYER', x + 85, y + 50, 15, 0, '#151213');
}
function bgBoom(g) {
  const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#3a0a0a'); gr.addColorStop(0.5, '#ff7a2a'); gr.addColorStop(1, '#ffd27a'); g.fillStyle = gr; g.fillRect(0, 0, 480, 360);
  S(g, '#c9772e', () => { g.moveTo(212, 300); g.quadraticCurveTo(230, 200, 222, 150); g.lineTo(258, 150); g.quadraticCurveTo(250, 200, 268, 300); g.closePath(); });
  S(g, '#e88a3a', () => E(g, 240, 170, 84, 14));
  S(g, '#ffb14a', () => E(g, 240, 124, 112, 56));
  S(g, '#ffd27a', () => { E(g, 168, 112, 50, 38); E(g, 312, 112, 50, 38); E(g, 240, 86, 72, 40); });
  const r = mulberry32(31); let x = -10; g.fillStyle = '#2a1414'; while (x < 490) { const w = 30 + r() * 50, h = 40 + r() * 80; g.fillRect(x, 330 - h, w, h + 40); x += w + 3; }
  for (const [x1, y1, x2, y2] of [[70, 380, 92, 300], [400, 380, 384, 306], [250, 390, 262, 322]]) { armLine(g, x1, y1, x2, y2, '#86a86e'); S(g, '#86a86e', () => E(g, x2, y2 - 6, 13, 15), 3); }
}

// ---------- scénario : trois cases par acte, propres à chaque personnage
const P = (ch, a, b) => ch === 'pedro' ? a : b;
const ACTS = {
  prologue: { label: 'Prologue', title: 'Comment on en est arrivés là', panels: () => [
    { draw: g => { bgSummit(g); macaron(g, 300, 400, 1.0, { hand: 'macaron' }); lectern(g, 300); }, cap: '2027. Sommet du G2 à Genève. Le président Macaron prend la parole.', bubbles: [{ t: 'Cher collègue, votre bronzage est aussi faux que vos sondages.', x: 3, y: 34, tail: 'br', w: 42 }] },
    { draw: g => { speedBg(g, '#7a1a12'); redButton(g, 286, 266); trompe(g, 196, 540, 1.35, { mood: 'angry', hand: 'button' }); sfx(g, 'CLIC', 420, 240, 40, 0.12); }, cap: 'Le président Trompe le prend très, très mal.', capPos: 'b', bubbles: [{ t: 'PERSONNE ne parle de mon bronzage ! Le gros bouton rouge, MAINTENANT !', x: 46, y: 5, tail: 'bl', w: 50 }] },
    { draw: g => { bgBoom(g); sfx(g, 'BOOOOOM !', 240, 66, 62, -0.05, '#ffe14d'); }, cap: 'Trois minutes plus tard, les bombes tombent. Les retombées ne tuent pas tout le monde : elles les relèvent.', capPos: 'b', onReveal: () => { game.audio.explosion(1); game.audio.roar(0.4); } }
  ] },
  intro: { label: 'Acte I', title: 'La nuit tombe', panels: ch => ch === 'pedro' ? [
    { draw: g => { bgTruck(g); pedro(g, 340, 360, 1.0, { mood: 'happy', hand: 'burrito' }); }, cap: '20 h 02. Pedro Ramírez, de Guadalajara, en vacances dans le Nord.', bubbles: [{ t: '¡Un burrito bajo la lluvia, la vida es bella!', x: 4, y: 46, tail: 'br', w: 42 }] },
    { draw: g => { bgNight(g, 7); zombieC(g, 150, 360, 0.95, { bite: true }); pedro(g, 380, 360, 0.95, { mood: 'shock', flip: true }); sfx(g, 'CHOMP !', 190, 90, 48, -0.12); }, cap: '20 h 03. Le couvre-feu sonne. Personne ne l\'écoute.', capPos: 'b', bubbles: [{ t: '¿¡Mi burrito!?', x: 54, y: 6, tail: 'br', w: 34 }] },
    { draw: g => { speedBg(g, '#7a1a12'); pedro(g, 250, 560, 1.55, { mood: 'angry', hand: 'gun' }); sfx(g, '¡AY CARAMBA !', 250, 340, 46, -0.05); }, cap: 'Personne ne touche au burrito de Pedro.', capPos: 'tr', bubbles: [{ t: 'Vous allez le payer, cabrones !', x: 3, y: 6, tail: 'br', w: 34 }] }
  ] : [
    { draw: g => { bgFriterie(g); fiona(g, 350, 360, 1.0, { mood: 'deadpan', hand: 'frites' }); }, cap: '20 h 02. Fiona Delattre, née à Roubaix. Teint gris, cernes violets. Naturellement.', bubbles: [{ t: 'Une frite-fricadelle. Avec beaucoup d\'sauce.', x: 4, y: 48, tail: 'br', w: 40 }] },
    { draw: g => { bgNight(g, 9); zombieC(g, 100, 360, 0.9, { sniff: true }); zombieC(g, 450, 360, 0.85, { flip: true }); fiona(g, 280, 360, 0.95, { mood: 'annoyed', hand: 'frites' }); sfx(g, 'SNIF SNIF', 120, 78, 30, -0.1, '#c9f27a'); }, cap: 'Les zombies passent sans la toucher. Ils la prennent pour l\'une des leurs.', capPos: 'b', bubbles: [{ t: 'J\'suis pas morte, biloute ! J\'suis juste du Nord !', x: 50, y: 4, tail: 'bl', w: 46 }] },
    { draw: g => { speedBg(g, '#23345a'); fiona(g, 250, 560, 1.55, { mood: 'angry', hand: 'gun' }); sfx(g, 'BLAM !', 400, 340, 50, -0.1); }, cap: 'Elle n\'avait pas fini ses frites. Ils vont le regretter.', capPos: 'tr', bubbles: [{ t: 'Bon. On va faire ça à la ch\'ti.', x: 3, y: 6, tail: 'br', w: 34 }] }
  ] },
  act2: { label: 'Acte II', title: 'La pharmacie', panels: ch => [
    { draw: g => { bgPharmacy(g); npc(g, 390, 360, 0.95, { flip: true, coat: '#556b2f', prop: 'shotgun', mood: 'angry' }); hero(ch, g, 140, 360, 0.95, { mood: 'shock', hand: 'up' }); }, cap: 'La pharmacie barricadée. Un survivant garde le comptoir.', bubbles: [{ t: P(ch, 'Pas un pas de plus !', 'Recule, la morte !'), x: 54, y: 20, tail: 'br', w: 34 }, { t: P(ch, '¡Tranquilo! Je cherche juste de la salsa.', 'J\'ai juste pas dormi depuis 2009 !'), x: 3, y: 64, tail: 'tr', w: 40 }] },
    { draw: g => { bgMarket(g); npc(g, 350, 360, 1.0, { flip: true, coat: '#2a2430', head: 'hood' }); hero(ch, g, 110, 500, 1.3, { mood: P(ch, 'shock', 'annoyed') }); }, cap: 'Au fond, le marché noir. Ici, tout se paie en dollars.', capPos: 'b', bubbles: [{ t: '450 le fusil à pompe, l\'ami.', x: 46, y: 4, tail: 'br', w: 36 }, { t: P(ch, '¿450? ¡Por ese precio quiero guacamole!', 'T\'as pas des frites dans ton bazar ?'), x: 3, y: 6, tail: 'bl', w: 38 }] },
    { draw: g => { bgRadio(g); hero(ch, g, 140, 360, 0.95, { mood: 'determined' }); sfx(g, 'KRRZZT', 350, 170, 34, 0.08, '#9fe0ff'); }, cap: 'La radio grésille : un émetteur, sur le boulevard des Tanneurs, peut appeler les secours.', bubbles: [{ t: P(ch, 'Vamos. On va l\'allumer, cette radio.', 'Allez, on y va. Il va pleuvoir. Ah non, il pleut d\'jà.'), x: 36, y: 56, tail: 'tl', w: 44 }] }
  ] },
  act3: { label: 'Acte III', title: 'Sous la ville', panels: ch => [
    { draw: g => { bgMetro(g); hero(ch, g, 250, 360, 1.0, { mood: 'happy' }); sfx(g, 'KRRZ…', 420, 200, 26, 0.1, '#9fe0ff'); }, cap: 'Le signal est passé. Un hélicoptère se posera place de la Mairie, à l\'aube.', bubbles: [{ t: '… hélico … place de la Mairie … à l\'aube …', x: 60, y: 30, tail: 'none', w: 36, cls: 'radio' }, { t: P(ch, '¡Un helicóptero! ¡Gracias, Virgencita!', 'Un hélico ! Ch\'est l\'heure d\'partir d\'ichi.'), x: 3, y: 62, tail: 'tr', w: 40 }] },
    ch === 'pedro'
      ? { draw: g => { bgMetro(g); vending(g, 40, 104); pedro(g, 340, 360, 1.0, { mood: 'happy', hand: 'burrito' }); }, cap: 'Dans un distributeur du quai : un dernier burrito sous plastique.', capPos: 'tr', bubbles: [{ t: 'Périmé depuis 2019… Lo como igual.', x: 3, y: 62, tail: 'tr', w: 40 }] }
      : { draw: g => { bgMetro(g); zombieC(g, 340, 410, 0.9, { flip: true }); fiona(g, 150, 410, 0.9, { mood: 'deadpan' }); S(g, '#6a4a2a', () => RR(g, 10, 266, 460, 20, 4)); S(g, '#4a3420', () => { g.rect(40, 286, 14, 30); g.rect(420, 286, 14, 30); }); }, cap: 'Sur le quai, un zombie s\'assoit à côté d\'elle. Il ne bronche pas.', bubbles: [{ t: 'Même eux, ils me trouvent normale…', x: 3, y: 72, tail: 'tl', w: 40 }] },
    { draw: g => { bgParking(g, false); jerrycan(g, 370, 200); hero(ch, g, 170, 530, 1.4, { mood: P(ch, 'tired', 'determined') }); }, cap: 'La Mairie est plongée dans le noir. Il faut rallumer le groupe électrogène du parking Saint-Roch.', bubbles: [{ t: P(ch, 'Necesito gasolina. Y un milagro.', 'J\'ai bossé au garage d\'mon père. J\'sais faire.'), x: 52, y: 40, tail: 'bl', w: 40 }] }
  ] },
  act4: { label: 'Acte IV', title: 'La Mairie', panels: ch => [
    { draw: g => { bgParking(g, true); hero(ch, g, 250, 360, 1.0, { mood: 'happy' }); }, cap: 'Les lampadaires du parking se rallument. Au bout de l\'avenue : la place de la Mairie.', bubbles: [{ t: P(ch, '¡Luz! ¡Por fin!', 'Ah, d\'la lumière. Ça m\'change.'), x: 58, y: 44, tail: 'bl', w: 36 }] },
    { draw: g => { bgPlaza(g); sfx(g, 'BOUM… BOUM…', 240, 344, 34, 0.03, '#ff6a3a'); }, cap: 'Derrière la grande porte, quelque chose de gros attend. Les survivants l\'appellent l\'Abomination.' },
    { draw: g => { speedBg(g, '#5a0f0c'); hero(ch, g, 250, 560, 1.55, { mood: 'angry', hand: 'gun' }); }, cap: 'Dernier secteur. L\'hélicoptère n\'attendra pas.', capPos: 'b', bubbles: [{ t: P(ch, 'Grande, fea… y seguro que se comió todos los burritos de la ciudad.', 'Elle a une plus sale tête que moi. Respect. Mais elle va prendre.'), x: 3, y: 5, tail: 'br', w: 40 }] }
  ] },
  gameover: { label: 'Fin de partie', title: 'La nuit a gagné', panels: ch => [ ch === 'pedro'
    ? { draw: g => { bgNight(g, 29, ['#1a1030', '#3a1a2a']); zombieC(g, 90, 360, 0.85, {}); zombieC(g, 420, 360, 0.85, { flip: true }); pedro(g, 250, 360, 1.0, { zombie: true, mood: 'zombie', hand: 'burrito' }); }, cap: 'Pedro a rejoint la horde. Il réclame toujours des burritos. Mais en grognant.', capPos: 'b', bubbles: [{ t: 'Bu… rri… toooo…', x: 4, y: 8, tail: 'br', w: 32 }] }
    : { draw: g => { bgNight(g, 31, ['#1a1030', '#3a1a2a']); zombieC(g, 90, 360, 0.85, {}); zombieC(g, 420, 360, 0.85, { flip: true }); fiona(g, 250, 360, 1.0, { mood: 'deadpan', hand: 'frites' }); S(g, '#7a0f0c', () => { E(g, 300, 196, 9, 6); E(g, 312, 204, 7, 5); }, 2); }, cap: 'Fiona a été mordue. Franchement, personne n\'a vu la différence.', capPos: 'b', bubbles: [{ t: 'J\'me sens comme d\'habitude, hein.', x: 4, y: 8, tail: 'br', w: 34 }] }
  ] },
  epilogue: { label: 'Épilogue', title: 'L\'aube', panels: ch => [
    { draw: g => { bgDawn(g); helicopter(g, 290, 130, 1.05); sfx(g, 'TCHOP TCHOP TCHOP', 250, 330, 32, -0.04, '#fff3c0'); }, cap: 'L\'aube. L\'hélicoptère décolle enfin du toit de l\'hôpital.' },
    ch === 'pedro'
      ? { draw: g => { bgHeli(g); npc(g, 370, 380, 1.0, { flip: true, coat: '#3b4a3a', head: 'pilot', prop: 'burrito' }); pedro(g, 130, 400, 1.0, { mood: 'happy' }); }, cap: 'Sous son siège, le pilote gardait un sachet.', bubbles: [{ t: 'Tiens. C\'est tout ce qu\'on a.', x: 56, y: 16, tail: 'br', w: 34 }, { t: '¿Un burrito? ¡Te quiero, amigo!', x: 3, y: 64, tail: 'tr', w: 40 }] }
      : { draw: g => { bgCamp(g); npc(g, 370, 360, 1.0, { flip: true, coat: '#f2f2ee', head: 'doctor', prop: 'clipboard', skin: '#e0b896' }); fiona(g, 140, 360, 0.95, { mood: 'annoyed' }); }, cap: 'Au camp de réfugiés, un médecin la regarde de travers.', bubbles: [{ t: 'Celle-là, en quarantaine. Elle est infectée.', x: 50, y: 16, tail: 'br', w: 40 }, { t: 'Mais j\'suis d\'Roubaix !', x: 3, y: 64, tail: 'tr', w: 36 }] },
    ch === 'pedro'
      ? { draw: g => { bgDawn(g, 23); pedro(g, 240, 560, 1.5, { mood: 'sleep', hand: 'burrito' }); sfx(g, 'ZZZ…', 400, 90, 40, -0.12, '#fff'); }, cap: 'Pedro Ramírez a survécu au couvre-feu. Il ne mangera plus jamais de frites. Enfin… peut-être une fois.', capPos: 'b' }
      : { draw: g => { bgCamp(g); fiona(g, 240, 560, 1.5, { mood: 'happy', hand: 'frites' }); }, cap: 'Fiona Delattre a survécu. On lui a servi des frites. Il pleuvait. Elle était chez elle.', capPos: 'b' }
  ] }
};
// ---------- décors des nouveaux personnages
function potRow(g, y) { for (let i = 0; i < 6; i++) { const x = 30 + i * 74; S(g, '#4a9a4a', () => { E(g, x, y - 30, 16, 10, -0.5); E(g, x + 18, y - 34, 14, 9, 0.5); E(g, x + 8, y - 48, 9, 14); }, 3); S(g, '#b5552e', () => { g.moveTo(x - 12, y - 22); g.lineTo(x + 28, y - 22); g.lineTo(x + 22, y + 8); g.lineTo(x - 6, y + 8); g.closePath(); }); } }
function bgBalcony(g, broken) {
  bgNight(g, 41); g.fillStyle = '#2a2430'; g.fillRect(0, 250, 480, 110);
  g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(0, 230); g.lineTo(480, 230); for (let x = 10; x < 480; x += 26) { g.moveTo(x, 230); g.lineTo(x, 300); } g.stroke();
  if (!broken) potRow(g, 290);
  else { potRow(g, 290); S(g, '#b5552e', () => { g.moveTo(200, 300); g.lineTo(230, 286); g.lineTo(240, 304); g.closePath(); g.moveTo(250, 300); g.lineTo(276, 292); g.lineTo(270, 310); g.closePath(); }); S(g, '#4a9a4a', () => E(g, 236, 316, 22, 7), 3); }
}
function bgHome(g, horde) {
  g.fillStyle = '#3a3048'; g.fillRect(0, 0, 480, 360); g.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 0; x < 480; x += 30) g.fillRect(x, 0, 14, 300);
  g.save(); g.beginPath(); RR(g, 300, 40, 150, 130, 4); g.clip(); bgNight(g, 43); if (horde) { zombieC(g, 340, 330, 0.55, {}); zombieC(g, 410, 340, 0.5, { flip: true }); } g.restore(); S(g, null, () => RR(g, 300, 40, 150, 130, 4), 6); g.lineWidth = 4; g.beginPath(); g.moveTo(375, 40); g.lineTo(375, 170); g.moveTo(300, 105); g.lineTo(450, 105); g.stroke();
  g.lineWidth = 2; g.strokeStyle = '#d8d2c4'; g.beginPath(); g.moveTo(0, 60); g.quadraticCurveTo(140, 90, 280, 60); g.stroke();
  for (const [x, c] of [[40, '#c0392b'], [90, '#2a5aa8'], [150, '#f2c14e'], [210, '#2e8b57']]) S(g, c, () => { RR(g, x, 70, 16, 36, 4); RR(g, x, 96, 28, 12, 5); }, 2);
  g.fillStyle = '#2a2230'; g.fillRect(0, 300, 480, 60); S(g, '#6a4a2a', () => RR(g, 20, 230, 160, 70, 4));
}
function bgKebab(g) {
  bgNight(g, 45); glowAt(g, 150, 200, 210, '255,200,110');
  S(g, '#2e6b3a', () => RR(g, 50, 74, 190, 38, 4)); sfx(g, 'KEBAB · GRILL', 145, 104, 26, 0, '#ffe36b');
  S(g, '#b8322a', () => RR(g, 28, 120, 236, 180, 4)); S(g, '#f6e7c8', () => RR(g, 48, 146, 196, 90, 3), 3);
  S(g, '#8a4a2a', () => { g.moveTo(96, 156); g.lineTo(126, 156); g.lineTo(120, 226); g.lineTo(102, 226); g.closePath(); }); g.lineWidth = 3; g.beginPath(); g.moveTo(111, 150); g.lineTo(111, 232); g.stroke();
  sfx(g, 'SAUCE BLANCHE · SAMOURAÏ', 146, 258, 13, 0, '#2e6b3a');
}
function bgLair(g, glow) {
  g.fillStyle = '#1a1022'; g.fillRect(0, 0, 480, 360);
  g.save(); g.beginPath(); g.moveTo(300, 170); g.lineTo(300, 70); g.quadraticCurveTo(360, 20, 420, 70); g.lineTo(420, 170); g.closePath(); g.clip();
  if (glow) { const gr = g.createLinearGradient(0, 30, 0, 170); gr.addColorStop(0, '#3a0a0a'); gr.addColorStop(1, '#ff8a3a'); g.fillStyle = gr; g.fillRect(300, 20, 120, 150); S(g, '#ffd27a', () => { E(g, 360, 110, 34, 20); }, 0); } else bgNight(g, 47);
  g.restore(); S(g, null, () => { g.moveTo(300, 170); g.lineTo(300, 70); g.quadraticCurveTo(360, 20, 420, 70); g.lineTo(420, 170); g.closePath(); }, 6);
  for (const x of [60, 120, 220]) { S(g, '#e8e2d0', () => RR(g, x - 6, 230, 12, 40, 2), 3); glowAt(g, x, 222, 60, '255,190,90'); S(g, '#ffb14a', () => E(g, x, 222, 5, 9), 2); }
  S(g, '#4a1e5e', () => RR(g, 20, 270, 260, 30, 3)); g.fillStyle = '#0f0a14'; g.fillRect(0, 300, 480, 60);
}
// ---------- histoires des nouveaux personnages (prologue commun, puis chacun la sienne)
const NEW_STORY = {
  zeus: {
    intro: [
      { draw: g => { bgBalcony(g, false); zeusC(g, 330, 360, 0.95, { mood: 'happy', hand: 'plant' }); }, cap: '20 h 02. Zeus, prof de SVT à la retraite, chouchoute ses 147 plantes vertes.', bubbles: [{ t: 'Bonne nuit, Ficus. Bonne nuit, Basilic. Bonne nuit, Géranium.', x: 4, y: 42, tail: 'br', w: 42 }] },
      { draw: g => { bgBalcony(g, true); zombieC(g, 180, 360, 0.95, {}); zeusC(g, 390, 360, 0.95, { mood: 'shock', flip: true }); sfx(g, 'CRAC !', 230, 80, 48, -0.1); }, cap: '20 h 03. Un zombie enjambe le balcon. Le géranium n\'a rien vu venir.', capPos: 'b', bubbles: [{ t: 'PAS LE GÉRANIUM !', x: 56, y: 6, tail: 'br', w: 34 }] },
      { draw: g => { speedBg(g, '#1d3566'); zeusC(g, 250, 560, 1.5, { mood: 'angry', hand: 'gun' }); sfx(g, 'KRAKOOM !', 250, 340, 46, -0.05, '#bfe6ff'); }, cap: 'On ne touche pas aux plantes de Zeus.', capPos: 'tr', bubbles: [{ t: 'Par ma barbe… vous allez prendre la foudre.', x: 3, y: 6, tail: 'br', w: 36 }] }
    ],
    surv: 'Pas un pas de plus, le barbu !', reply: 'Je viens en paix. Et pour du terreau, si vous en avez.',
    market: '450 ? Par Jupiter, c\'est du vol !', radio: 'Une radio. Les dieux m\'envoient un signe.',
    heli: 'Un char volant ! Enfin, un hélico. C\'est presque pareil.', findCap: 'Sur le quai, une plante oubliée dans son pot. Zeus l\'adopte aussitôt.', find: 'Je t\'appellerai Hermès.',
    fuel: 'Je vais rallumer la lumière. Les plantes ont besoin de soleil.', light: 'De la lumière ! Hermès est ravi.', boss: 'Toi, l\'Abomination… tu vas rencontrer la foudre.',
    pilot: 'Le pot de fleurs reste sur vos genoux, hein.', pilotReply: 'Hermès voyage en première classe.',
    end: 'Zeus a survécu, et Hermès le ficus aussi. Ensemble, ils ont ouvert une jardinerie : « L\'Olympe vert ».',
    goCap: 'Zeus a rejoint la horde. Le ficus, lui, va très bien.', goSay: 'Grrr… arroser… grrr…'
  },
  dobby: {
    intro: [
      { draw: g => { bgHome(g, false); dobbyC(g, 200, 360, 1.0, { mood: 'happy', hand: 'sock' }); }, cap: '20 h 02. Dobby, de la famille Lor\'hi, plie le linge de tout l\'immeuble. Gratuitement. Toujours.', bubbles: [{ t: 'Dobby a retrouvé une chaussette orpheline ! Dobby est si heureux !', x: 46, y: 50, tail: 'bl', w: 42 }] },
      { draw: g => { bgHome(g, true); dobbyC(g, 160, 360, 1.0, { mood: 'shock' }); sfx(g, 'TOC TOC TOC', 380, 220, 30, 0.08); }, cap: '20 h 03. Les voisins ont changé. Ils sont verts, et ils mordent.', capPos: 'b', bubbles: [{ t: 'Dobby ne pense pas que ce soient des clients satisfaits…', x: 40, y: 4, tail: 'bl', w: 40 }] },
      { draw: g => { speedBg(g, '#2e7a50'); dobbyC(g, 250, 570, 1.6, { mood: 'angry', hand: 'gun' }); sfx(g, 'POUF !', 400, 336, 46, -0.1); }, cap: 'Petit, rapide, et très, très motivé.', capPos: 'tr', bubbles: [{ t: 'Dobby va défendre la rue ! Poliment, mais fermement.', x: 3, y: 6, tail: 'br', w: 36 }] }
    ],
    surv: 'Qu\'est-ce que c\'est que ce lutin ?!', reply: 'Dobby demande pardon ! Dobby cherche juste des pansements !',
    market: 'Dobby n\'a que des chaussettes. Dobby peut payer en chaussettes ?', radio: 'Dobby va allumer la radio ! Dobby est très doué avec les boutons !',
    heli: 'Un hélicoptère ! Dobby n\'est jamais monté dans un hélicoptère !', findCap: 'Sur le quai, une valise abandonnée. Pleine de chaussettes.', find: 'C\'est le plus beau jour de la vie de Dobby.',
    fuel: 'Dobby va trouver l\'essence ! Dobby est très bon pour trouver des choses.', light: 'C\'est si beau… Dobby veut pleurer.', boss: 'Dobby n\'a pas peur ! Bon, un peu. Mais Dobby y va !',
    pilot: 'Tu as un truc bizarre sur les oreilles, non ?', pilotReply: 'Ce sont les oreilles de Dobby. Elles adorent le vent !',
    end: 'Dobby a survécu. Les rescapés de l\'immeuble lui ont offert une paire de chaussettes assorties. Dobby a pleuré trois jours.',
    goCap: 'Dobby a rejoint la horde. Même zombie, Dobby range encore les chaussettes des autres.', goSay: 'Grrr… Dobby… plie…'
  },
  chewie: {
    intro: [
      { draw: g => { bgKebab(g); chewieC(g, 350, 360, 0.95, { mood: 'happy', hand: 'kebab' }); }, cap: '20 h 02. Chewie, deux mètres de poils et de bonne humeur, savoure sa soirée.', bubbles: [{ t: 'Kebab, sauce blanche, la base. Franchement, je kiffe.', x: 4, y: 46, tail: 'br', w: 40 }] },
      { draw: g => { bgNight(g, 49); zombieC(g, 140, 360, 0.95, { bite: true }); chewieC(g, 380, 360, 0.92, { mood: 'shock', flip: true }); sfx(g, 'CHOMP !', 200, 86, 46, -0.12); }, cap: '20 h 03. Un zombie croque dans le kebab. Grave erreur.', capPos: 'b', bubbles: [{ t: 'Wesh… c\'était MON kebab, ça.', x: 54, y: 6, tail: 'br', w: 36 }] },
      { draw: g => { speedBg(g, '#5a3a1a'); chewieC(g, 250, 590, 1.45, { mood: 'angry', hand: 'gun' }); sfx(g, 'GRRRAAAWR !', 250, 342, 40, -0.05); }, cap: 'Le kiff est terminé.', capPos: 'tr', bubbles: [{ t: 'Là, par contre… on touche pas au kebab.', x: 3, y: 6, tail: 'br', w: 36 }] }
    ],
    surv: 'Recule, le yéti !', reply: 'Tranquille, frère. Je suis un gentil, moi.',
    market: '450 balles ? T\'as pas un prix d\'ami ? J\'aime bien ta capuche.', radio: 'Une radio ? Grave. On met du son et on appelle les secours.',
    heli: 'Un hélico ? Trop bien, je kiffe.', findCap: 'Sur le quai, un distributeur de bonbons, encore plein.', find: 'Gratuit ? Franchement, je kiffe l\'apocalypse.',
    fuel: 'Groupe électrogène, essence… easy, je gère.', light: 'Ah, la lumière. Je kiffe.', boss: 'Elle a l\'air vénère. Moi aussi, maintenant.',
    pilot: 'Il reste un kebab sous le siège, si ça te dit.', pilotReply: 'Frère… je te kiffe.',
    end: 'Chewie a survécu et a ouvert un kebab au bord de la mer. Tout le monde y kiffe.',
    goCap: 'Chewie a rejoint la horde. Franchement, ça change pas grand-chose : déjà poilu, déjà grognon.', goSay: 'Grrraaawr… kiffe…'
  },
  dragon: {
    intro: [
      { draw: g => { bgLair(g, false); dragonC(g, 200, 360, 0.95, { mood: 'determined', hand: 'coffee' }); }, cap: '20 h 02. Dragon, alias le Maléfique, joue les grands méchants depuis la maternelle.', bubbles: [{ t: 'Mwahaha… Ce soir, je conquiers le monde. Après mon café.', x: 48, y: 52, tail: 'bl', w: 40 }] },
      { draw: g => { bgLair(g, true); dragonC(g, 170, 360, 0.95, { mood: 'shock' }); sfx(g, 'BOOM…', 360, 214, 34, 0.06, '#ff8a3a'); }, cap: '20 h 03. Quelqu\'un a conquis le monde avant. Et c\'est raté.', capPos: 'b', bubbles: [{ t: 'Hé ! C\'était MON plan de destruction !', x: 4, y: 6, tail: 'br', w: 36 }] },
      { draw: g => { speedBg(g, '#3a1050'); dragonC(g, 250, 560, 1.5, { mood: 'angry', hand: 'gun' }); sfx(g, 'MWAHAHA !', 250, 342, 44, -0.05, '#d9a0ff'); }, cap: 'Le mal a ses principes.', capPos: 'tr', bubbles: [{ t: 'Personne ne détruit le monde à ma place.', x: 3, y: 6, tail: 'br', w: 36 }] }
    ],
    surv: 'Ne bouge plus, toi et ta cape !', reply: 'Baisse ton arme, mortel. Je suis du bon côté… pour ce soir.',
    market: 'Enfin un commerçant à ma hauteur. Je prends tout.', radio: 'Parfait. Une antenne, ça fait très repaire de méchant.',
    heli: 'Un hélicoptère. Je l\'aurais préféré noir, mais soit.', findCap: 'Sur le quai, une vieille affiche : « Le Maléfique, spectacle de magie ».', find: 'J\'étais déjà célèbre. Mwahaha.',
    fuel: 'Plonger la ville dans le noir, c\'était MON idée. Je la rallume, par principe.', light: 'Trop de lumière. Mais je tolère.', boss: 'Il ne peut y avoir qu\'un seul monstre dans cette ville. Et c\'est moi.',
    pilot: 'C\'est vous, le Maléfique du spectacle de magie ?', pilotReply: 'En personne. Un autographe ?',
    end: 'Dragon a survécu et a enfin conquis quelque chose : le cœur des réfugiés. Mwahaha… snif.',
    goCap: 'Dragon a rejoint la horde et la commande déjà. Évidemment.', goSay: 'Mwahaha… grrr… à genoux, zombies !'
  }
};
function newPanels(key, ch) {
  const T = NEW_STORY[ch], H = (g, x, y, s, o) => hero(ch, g, x, y, s, o), prop = PROP[ch];
  switch (key) {
    case 'intro': return T.intro;
    case 'act2': return [
      { draw: g => { bgPharmacy(g); npc(g, 390, 360, 0.95, { flip: true, coat: '#556b2f', prop: 'shotgun', mood: 'angry' }); H(g, 140, 360, 0.95, { mood: 'shock', hand: 'up' }); }, cap: 'La pharmacie barricadée. Un survivant garde le comptoir.', bubbles: [{ t: T.surv, x: 54, y: 20, tail: 'br', w: 36 }, { t: T.reply, x: 3, y: 64, tail: 'tr', w: 42 }] },
      { draw: g => { bgMarket(g); npc(g, 350, 360, 1.0, { flip: true, coat: '#2a2430', head: 'hood' }); H(g, 110, 500, 1.3, { mood: 'annoyed' }); }, cap: 'Au fond, le marché noir. Ici, tout se paie en dollars.', capPos: 'b', bubbles: [{ t: '450 le fusil à pompe, l\'ami.', x: 46, y: 4, tail: 'br', w: 36 }, { t: T.market, x: 3, y: 6, tail: 'bl', w: 40 }] },
      { draw: g => { bgRadio(g); H(g, 140, 360, 0.95, { mood: 'determined' }); sfx(g, 'KRRZZT', 350, 170, 34, 0.08, '#9fe0ff'); }, cap: 'La radio grésille : un émetteur, sur le boulevard des Tanneurs, peut appeler les secours.', bubbles: [{ t: T.radio, x: 36, y: 56, tail: 'tl', w: 46 }] }
    ];
    case 'act3': return [
      { draw: g => { bgMetro(g); H(g, 250, 360, 1.0, { mood: 'happy' }); sfx(g, 'KRRZ…', 420, 200, 26, 0.1, '#9fe0ff'); }, cap: 'Le signal est passé. Un hélicoptère se posera place de la Mairie, à l\'aube.', bubbles: [{ t: '… hélico … place de la Mairie … à l\'aube …', x: 60, y: 30, tail: 'none', w: 36, cls: 'radio' }, { t: T.heli, x: 3, y: 62, tail: 'tr', w: 40 }] },
      { draw: g => { bgMetro(g); H(g, 300, 360, 1.0, { mood: 'happy', hand: prop }); }, cap: T.findCap, bubbles: [{ t: T.find, x: 3, y: 60, tail: 'tr', w: 40 }] },
      { draw: g => { bgParking(g, false); jerrycan(g, 370, 200); H(g, 170, 530, 1.4, { mood: 'determined' }); }, cap: 'La Mairie est plongée dans le noir. Il faut rallumer le groupe électrogène du parking Saint-Roch.', bubbles: [{ t: T.fuel, x: 52, y: 40, tail: 'bl', w: 42 }] }
    ];
    case 'act4': return [
      { draw: g => { bgParking(g, true); H(g, 250, 360, 1.0, { mood: 'happy' }); }, cap: 'Les lampadaires du parking se rallument. Au bout de l\'avenue : la place de la Mairie.', bubbles: [{ t: T.light, x: 58, y: 44, tail: 'bl', w: 36 }] },
      { draw: g => { bgPlaza(g); sfx(g, 'BOUM… BOUM…', 240, 344, 34, 0.03, '#ff6a3a'); }, cap: 'Derrière la grande porte, quelque chose de gros attend. Les survivants l\'appellent l\'Abomination.' },
      { draw: g => { speedBg(g, '#5a0f0c'); H(g, 250, 560, 1.5, { mood: 'angry', hand: 'gun' }); }, cap: 'Dernier secteur. L\'hélicoptère n\'attendra pas.', capPos: 'b', bubbles: [{ t: T.boss, x: 3, y: 5, tail: 'br', w: 40 }] }
    ];
    case 'epilogue': return [
      { draw: g => { bgDawn(g); helicopter(g, 290, 130, 1.05); sfx(g, 'TCHOP TCHOP TCHOP', 250, 330, 32, -0.04, '#fff3c0'); }, cap: 'L\'aube. L\'hélicoptère décolle enfin du toit de l\'hôpital.' },
      { draw: g => { bgHeli(g); npc(g, 370, 380, 1.0, { flip: true, coat: '#3b4a3a', head: 'pilot' }); H(g, 130, 400, 1.0, { mood: 'happy', hand: prop }); }, cap: 'Dans l\'hélicoptère, le pilote jette un œil en arrière.', bubbles: [{ t: T.pilot, x: 54, y: 16, tail: 'br', w: 38 }, { t: T.pilotReply, x: 3, y: 64, tail: 'tr', w: 40 }] },
      { draw: g => { bgDawn(g, 51); H(g, 240, 560, 1.5, { mood: 'happy', hand: prop }); }, cap: T.end, capPos: 'b' }
    ];
    case 'gameover': return [
      { draw: g => { bgNight(g, 53, ['#1a1030', '#3a1a2a']); zombieC(g, 90, 360, 0.85, {}); zombieC(g, 420, 360, 0.85, { flip: true }); H(g, 250, 360, 1.0, { zombie: true, mood: 'zombie', hand: prop }); }, cap: T.goCap, capPos: 'b', bubbles: [{ t: T.goSay, x: 4, y: 8, tail: 'br', w: 34 }] }
    ];
  }
  return [];
}
function shibaC(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, '#d9873a', () => { g.moveTo(-40, -20); g.quadraticCurveTo(-56, -64, -30, -70); g.quadraticCurveTo(-20, -52, -24, -30); g.closePath(); });
  S(g, '#f4e6cc', () => E(g, -34, -62, 7, 7), 2);
  S(g, '#d9873a', () => E(g, -6, -30, 34, 26));
  S(g, '#d9873a', () => { RR(g, -30, -14, 14, 18, 5); RR(g, 10, -14, 14, 18, 5); });
  S(g, '#f4e6cc', () => E(g, 12, -32, 14, 18), 2);
  S(g, '#d9873a', () => { g.moveTo(4, -78); g.lineTo(10, -104); g.lineTo(22, -82); g.closePath(); g.moveTo(32, -82); g.lineTo(44, -104); g.lineTo(46, -76); g.closePath(); });
  S(g, '#d9873a', () => E(g, 26, -64, 26, 22));
  S(g, '#f4e6cc', () => E(g, 34, -56, 14, 10), 2);
  S(g, INK, () => { E(g, 18, -68, 3.5, 3.5); E(g, 34, -68, 3.5, 3.5); E(g, 44, -58, 4, 3); }, 0);
  if (o.happy !== false) { g.lineWidth = 2.5; g.strokeStyle = INK; g.beginPath(); g.arc(38, -52, 5, 0.2, Math.PI - 0.2); g.stroke(); S(g, '#e86a7a', () => E(g, 38, -46, 4, 5), 2); }
  g.restore();
}
function shibanophileC(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, '#4a3a5a', () => E(g, 0, -120, 92, 110));
  S(g, '#d8d0e0', () => E(g, 0, -120, 52, 60), 3);
  g.save(); g.translate(-20, -96); g.scale(0.6, 0.6); shibaC(g, 0, 0, 1, { happy: true }); g.restore();
  g.lineWidth = 7; g.strokeStyle = '#c0201a'; g.beginPath(); g.moveTo(-40, -164); g.lineTo(40, -80); g.moveTo(40, -164); g.lineTo(-40, -80); g.stroke();
  S(g, '#3a2a46', () => E(g, 0, -250, 50, 46));
  S(g, '#1e1a26', () => { RR(g, -66, -296, 132, 16, 4); RR(g, -38, -340, 76, 48, 6); });
  S(g, '#f4f0d0', () => { E(g, -18, -256, 10, 9); E(g, 18, -256, 10, 9); }, 3);
  if (o.sad) { S(g, '#6ab0e8', () => { E(g, -22, -236, 5, 8); E(g, 22, -236, 5, 8); }, 2); S(g, INK, () => { E(g, -18, -258, 3, 3); E(g, 18, -258, 3, 3); }, 0); g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.arc(0, -214, 12, Math.PI + 0.3, -0.3); g.stroke(); }
  else { S(g, '#c0201a', () => { E(g, -16, -256, 3.5, 3.5); E(g, 20, -256, 3.5, 3.5); }, 0); S(g, '#2a0a0a', () => RR(g, -18, -226, 36, 12, 3), 3); }
  g.restore();
}
function bgParadise(g) {
  const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#ffb3cf'); gr.addColorStop(0.6, '#ffe0c8'); gr.addColorStop(1, '#cfe8b0'); g.fillStyle = gr; g.fillRect(0, 0, 480, 360);
  for (const [cx, cy, w] of [[80, 60, 60], [300, 40, 80], [420, 90, 50]]) S(g, '#fff6f8', () => { E(g, cx, cy, w, w * 0.4); E(g, cx + w * 0.5, cy - 6, w * 0.6, w * 0.35); E(g, cx - w * 0.5, cy + 4, w * 0.5, w * 0.3); }, 3);
  S(g, '#fff1c0', () => E(g, 240, 70, 30, 30), 0);
  g.fillStyle = '#9fd07a'; g.fillRect(0, 290, 480, 70); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 290); g.lineTo(480, 290); g.stroke();
  const r = mulberry32(61); g.fillStyle = '#ff8fb8'; for (let i = 0; i < 40; i++) g.fillRect(r() * 480, r() * 300, 4, 3);
}
const PARADISE_LINES = { pedro: '¡Qué lindos! Mi corazón… ¡ay caramba!', fiona: 'Ch\'est mignon tout plein. J\'vais pleurer, mais pas devant eux.', zeus: 'Même l\'Olympe n\'est pas aussi beau.', dobby: 'Dobby a plein de nouveaux amis !', chewie: 'Franchement… je kiffe trop.', dragon: 'Bon. D\'accord. Ils sont mignons. Ne le répétez pas.' };
ACTS.paradise = { label: 'Fin secrète', title: 'Le Paradis des Shibas', panels: ch => [
  { draw: g => { bgParadise(g); hero(ch, g, 240, 380, 0.85, { mood: 'happy' }); shibaC(g, 70, 330, 0.9, {}); shibaC(g, 400, 335, 0.85, { flip: true }); shibaC(g, 140, 300, 0.6, {}); shibaC(g, 340, 300, 0.6, { flip: true }); }, cap: `Les ${SHIBAS_TOTAL} shibas sauvés gambadent enfin en paix.`, capPos: 'b', bubbles: [{ t: PARADISE_LINES[ch], x: 3, y: 4, tail: 'br', w: 42 }] },
  { draw: g => { bgParadise(g); shibanophileC(g, 240, 380, 0.8, { sad: true }); shibaC(g, 360, 330, 0.9, { flip: true }); sfx(g, 'LÈCHE LÈCHE', 380, 120, 26, 0.1, '#ff8fb8'); }, cap: 'Vaincu, le Shibanophile avoue tout : il n\'a jamais eu le droit d\'avoir un chien.', capPos: 'b', bubbles: [{ t: 'Snif… il est tout doux, en fait…', x: 4, y: 6, tail: 'br', w: 36 }] },
  { draw: g => { bgParadise(g); for (let i = 0; i < 6; i++) shibaC(g, 50 + i * 76, 330 + (i % 2) * 14, 0.7, { flip: i % 2 === 1 }); hero(ch, g, 240, 300, 0.6, { mood: 'happy', hand: PROP[ch] }); sfx(g, 'WOUF !', 240, 70, 52, -0.06, '#ffd23a'); }, cap: 'Fin. Pour de vrai, cette fois. Merci d\'avoir sauvé les shibas.', capPos: 'b' }
] };
// ---------- acte V : l'hôpital Saint-Lazare (mission 5), commun à tous les personnages
const ACT5_LINES = {
  pedro: ['¿Un hospital? J\'espère qu\'ils ont des burritos à la cafétéria.', '¡Vamos! Un docteur zombie, il ne manquait plus que ça.'],
  fiona: ['Un hôpital ? Ils vont encore vouloir m\'mettre en quarantaine.', 'Allez. Les urgences, j\'connais : j\'suis du Nord.'],
  zeus: ['Un hôpital. Pourvu qu\'il y ait des plantes dans le hall.', 'Même les dieux détestent les salles d\'attente.'],
  dobby: ['Dobby n\'aime pas les hôpitaux : toutes les chaussettes y sont blanches.', 'Dobby va être très courageux. Encore une fois.'],
  chewie: ['L\'hosto ? Grave, j\'avais une carie à faire voir.', 'On y va. Même les couloirs qui sentent l\'éther, je kiffe.'],
  dragon: ['Un hôpital. Enfin un endroit aussi sinistre que mon antre.', 'Un Chirurgien ? Il va découvrir le vrai Maléfique.']
};
ACTS.act5 = { label: 'Acte V', title: 'L\'hôpital Saint-Lazare', panels: ch => { const L = ACT5_LINES[ch] || ACT5_LINES.pedro; return [
  { draw: g => { bgHeli(g); npc(g, 370, 380, 1.0, { flip: true, coat: '#3b4a3a', head: 'pilot' }); hero(ch, g, 130, 400, 1.0, { mood: 'shock' }); }, cap: 'L\'hélicoptère quitte la Mairie. La radio crache un nouvel ordre.', bubbles: [{ t: 'On se pose sur le toit de l\'hôpital Saint-Lazare. Une infirmière y est bloquée.', x: 50, y: 14, tail: 'br', w: 44 }, { t: L[0], x: 3, y: 64, tail: 'tr', w: 42 }] },
  { draw: g => { bgHospital(g); sfx(g, 'KRRZZT', 400, 170, 26, 0.1, '#9fe0ff'); }, cap: 'Sur le toit, personne. Des néons qui grésillent et une odeur d\'éther.', capPos: 'b', bubbles: [{ t: '… ici Inès… urgences… il y a quelqu\'un ?', x: 4, y: 6, tail: 'none', w: 38, cls: 'radio' }] },
  { draw: g => { speedBg(g, '#0f4a44'); hero(ch, g, 250, 560, 1.5, { mood: 'angry', hand: 'gun' }); }, cap: 'Mission 5. Descendre jusqu\'à la morgue. Quelqu\'un y opère encore.', capPos: 'b', bubbles: [{ t: L[1], x: 3, y: 5, tail: 'br', w: 40 }] }
]; } };
for (const key of ['intro', 'act2', 'act3', 'act4', 'epilogue', 'gameover']) { const orig = ACTS[key].panels; ACTS[key].panels = ch => NEW_STORY[ch] ? newPanels(key, ch) : orig(ch); }
const PORTRAIT_BG = { pedro: bgTruck, fiona: bgFriterie, zeus: g => bgBalcony(g, false), dobby: g => bgHome(g, false), chewie: bgKebab, dragon: g => bgLair(g, false) };
const HEAD_CROP = { pedro: [135, 18, 210], fiona: [148, 44, 184], zeus: [148, 36, 184], dobby: [130, 96, 220], chewie: [132, 4, 216], dragon: [146, 34, 188] };
let headScratch = null;
const HEAD_BG = { pedro: ['#f0a04a', '#7a2a12'], fiona: ['#a8d07a', '#25401c'], zeus: ['#9fe0c8', '#1c4a3c'], dobby: ['#a8c8f0', '#1c2f5a'], chewie: ['#f0c070', '#5a3210'], dragon: ['#e0a0ff', '#3a1458'] };
function renderHead(cv, ch, bgc, acc) {
  const sc = headScratch || (headScratch = document.createElement('canvas')); sc.width = 960; sc.height = 720; const s2 = sc.getContext('2d'); s2.setTransform(2, 0, 0, 2, 0, 0); s2.clearRect(0, 0, 480, 360);
  const hs = ch === 'chewie' ? 1.6 : 1.75; shadedFigure(s2, c => { hero(ch, c, 240, 600, hs, { mood: ch === 'fiona' ? 'deadpan' : ch === 'dragon' ? 'determined' : 'happy' }); if (acc && acc !== 'aucun') drawAccessory(c, ch, acc, 240, 600, hs); }, { lx: 0.35, ly: 0.2 });
  const g = cv.getContext('2d'), W2 = cv.width, H2 = cv.height, [cx, cy, sz] = HEAD_CROP[ch] || HEAD_CROP.pedro, [c1, c2] = HEAD_BG[ch] || HEAD_BG.pedro;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W2, H2);
  if (bgc) { g.fillStyle = bgc; g.fillRect(0, 0, W2, H2); } else {
    const bg = g.createRadialGradient(W2 * 0.42, H2 * 0.35, 2, W2 / 2, H2 / 2, W2 * 0.72); bg.addColorStop(0, c1); bg.addColorStop(0.55, c2); bg.addColorStop(1, '#08070a'); g.fillStyle = bg; g.fillRect(0, 0, W2, H2);
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = W2 * 0.012; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; g.beginPath(); g.moveTo(W2 / 2, H2 / 2); g.lineTo(W2 / 2 + Math.cos(a) * W2, H2 / 2 + Math.sin(a) * W2); g.stroke(); }
  }
  g.drawImage(sc, cx * 2, cy * 2, sz * 2, sz * 2, 0, 0, W2, H2);
}
function renderPortrait(cv, ch) { const g = cv.getContext('2d'); g.setTransform(cv.width / 480, 0, 0, cv.width / 480, 0, 0); g.clearRect(0, 0, 480, 360); (PORTRAIT_BG[ch] || bgTruck)(g); shadedFigure(g, c => hero(ch, c, 240, 600, ch === 'chewie' ? 1.6 : 1.75, { mood: ch === 'fiona' ? 'deadpan' : ch === 'dragon' ? 'determined' : 'happy', hand: PROP[ch] }), { lx: 0.3, ly: 0.25 }); halftone(g); }
