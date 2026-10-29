// ---------- personnages
function face(g, mood, ey, skin, bags) {
  if (bags) S(g, 'rgba(110,70,130,.8)', () => { E(g, -16, ey + 11, 13, 6); E(g, 16, ey + 11, 13, 6); }, 0);
  const whites = ry => S(g, '#fff', () => { E(g, -15, ey, 10, ry); E(g, 15, ey, 10, ry); }, 3);
  const pupils = (r, dy = 0) => S(g, INK, () => { E(g, -14, ey + dy, r, r); E(g, 16, ey + dy, r, r); }, 0);
  const brows = (inner, outer, lw = 5) => { g.lineWidth = lw; g.strokeStyle = INK; g.beginPath(); g.moveTo(-28, ey - outer); g.lineTo(-6, ey - inner); g.moveTo(28, ey - outer); g.lineTo(6, ey - inner); g.stroke(); };
  const lids = () => { S(g, skin, () => { g.rect(-27, ey - 13, 24, 12); g.rect(3, ey - 13, 24, 12); }, 0); g.lineWidth = 3; g.strokeStyle = INK; g.beginPath(); g.moveTo(-25, ey - 1); g.lineTo(-5, ey - 1); g.moveTo(5, ey - 1); g.lineTo(25, ey - 1); g.stroke(); };
  const arcs = (a0, a1, dy) => { g.lineWidth = 4; g.strokeStyle = INK; for (const x of [-15, 15]) { g.beginPath(); g.arc(x, ey + dy, 8, a0, a1); g.stroke(); } };
  switch (mood) {
    case 'happy': arcs(Math.PI * 1.15, Math.PI * 1.85, 5); break;
    case 'shock': whites(13); pupils(3); brows(17, 19, 4); break;
    case 'angry': case 'determined': whites(8); pupils(3.5, 1); brows(4, 16, 6); break;
    case 'annoyed': whites(8); pupils(3.5, 2); lids(); brows(11, 12, 5); break;
    case 'sleep': arcs(Math.PI * 0.15, Math.PI * 0.85, -2); break;
    case 'zombie': S(g, '#f4f0d0', () => { E(g, -15, ey, 10, 11); E(g, 15, ey, 10, 9); }, 3); S(g, '#c0201a', () => { E(g, -13, ey + 1, 3.5, 3.5); E(g, 17, ey, 3, 3); }, 0); break;
    default: whites(8); pupils(3.5, 2); lids();
  }
}
function mouth(g, mood, my) {
  switch (mood) {
    case 'happy': case 'determined': S(g, '#7a1f1f', () => { g.moveTo(-14, my); g.quadraticCurveTo(0, my + 18, 14, my); g.closePath(); }, 3); break;
    case 'shock': S(g, '#3a0e0e', () => E(g, 0, my + 7, 8, 10), 3); break;
    case 'angry': S(g, '#fff', () => RR(g, -15, my, 30, 11, 3), 3); g.lineWidth = 2; g.beginPath(); g.moveTo(-15, my + 5.5); g.lineTo(15, my + 5.5); g.stroke(); break;
    case 'sleep': g.lineWidth = 3; g.strokeStyle = INK; g.beginPath(); g.arc(0, my, 7, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); break;
    case 'zombie': S(g, '#2a0a0a', () => { g.moveTo(-14, my); g.lineTo(14, my - 2); g.lineTo(10, my + 12); g.lineTo(-10, my + 12); g.closePath(); }, 3); S(g, '#f4f0d0', () => { g.rect(-8, my, 5, 5); g.rect(4, my - 1, 5, 5); }, 0); break;
    default: g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(-11, my + 5); g.lineTo(11, my + 5); g.stroke();
  }
}
function hands(g, hand, skin, sleeve) {
  const H = (x, y) => S(g, skin, () => E(g, x, y, 11, 11), 3);
  switch (hand) {
    case 'gun': armLine(g, 40, -186, 112, -184, sleeve); S(g, '#2a2a2e', () => { RR(g, 112, -200, 52, 14, 3); RR(g, 114, -192, 14, 26, 3); }); H(116, -184); break;
    case 'burrito': armLine(g, 42, -186, 28, -150, sleeve); S(g, '#e8c88a', () => E(g, 44, -162, 38, 15, -0.5)); S(g, '#c9ccd2', () => E(g, 73, -181, 12, 15, -0.5), 3); H(24, -148); break;
    case 'frites':
      armLine(g, 42, -186, 28, -146, sleeve);
      S(g, '#f2c94c', () => { for (let i = 0; i < 5; i++) RR(g, 22 + i * 7, -202 + (i % 2) * 7, 6, 32, 1); }, 2);
      S(g, '#f4f1e6', () => { g.moveTo(16, -176); g.lineTo(62, -176); g.lineTo(39, -122); g.closePath(); });
      g.save(); g.beginPath(); g.moveTo(16, -176); g.lineTo(62, -176); g.lineTo(39, -122); g.closePath(); g.clip(); g.fillStyle = '#d23b2f'; for (let i = 0; i < 4; i++) g.fillRect(16 + i * 13, -180, 6, 60); g.restore();
      S(g, null, () => { g.moveTo(16, -176); g.lineTo(62, -176); g.lineTo(39, -122); g.closePath(); }); H(30, -140); break;
    case 'up': armLine(g, -40, -186, -72, -252, sleeve); armLine(g, 40, -186, 72, -252, sleeve); H(-74, -258); H(74, -258); break;
    case 'plant':
      armLine(g, 42, -186, 30, -150, sleeve);
      S(g, '#4a9a4a', () => { E(g, 30, -206, 14, 8, -0.6); E(g, 50, -210, 14, 8, 0.6); E(g, 40, -222, 9, 14); E(g, 22, -190, 12, 7, -0.2); E(g, 58, -192, 12, 7, 0.2); }, 3);
      S(g, '#b5552e', () => { g.moveTo(18, -186); g.lineTo(62, -186); g.lineTo(56, -142); g.lineTo(24, -142); g.closePath(); }); S(g, '#c96a3a', () => RR(g, 14, -192, 52, 10, 3), 3); H(26, -150); break;
    case 'sock':
      armLine(g, 42, -186, 34, -150, sleeve);
      S(g, '#c0392b', () => { RR(g, 26, -214, 22, 50, 6); RR(g, 26, -176, 44, 18, 8); }); g.fillStyle = '#f4f1e6'; g.fillRect(28, -204, 18, 6); g.fillRect(28, -190, 18, 6); H(30, -150); break;
    case 'kebab':
      armLine(g, 42, -186, 30, -150, sleeve);
      S(g, '#e8d2a0', () => { g.moveTo(14, -200); g.quadraticCurveTo(40, -230, 66, -200); g.lineTo(48, -146); g.lineTo(32, -146); g.closePath(); });
      S(g, '#8a4a2a', () => E(g, 40, -200, 20, 8), 2); S(g, '#4a9a4a', () => E(g, 30, -204, 7, 4), 2); S(g, '#f7f3ea', () => E(g, 46, -206, 9, 4), 2);
      S(g, '#f4f1e6', () => { g.moveTo(26, -176); g.lineTo(56, -176); g.lineTo(48, -146); g.lineTo(32, -146); g.closePath(); }, 3); H(30, -150); break;
    case 'coffee':
      armLine(g, 42, -186, 32, -152, sleeve);
      S(g, '#1e1a26', () => RR(g, 20, -200, 34, 40, 4)); S(g, null, () => { g.arc(58, -180, 9, -Math.PI / 2, Math.PI / 2); }, 5); S(g, '#6a2a8a', () => RR(g, 20, -200, 34, 8, 3), 2);
      g.strokeStyle = 'rgba(240,240,250,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, -206); g.quadraticCurveTo(24, -220, 32, -232); g.moveTo(42, -206); g.quadraticCurveTo(36, -222, 44, -236); g.stroke(); H(28, -152); break;
    default: armLine(g, -44, -184, -58, -112, sleeve); armLine(g, 44, -184, 58, -112, sleeve); H(-60, -104); H(60, -104);
  }
}
function pedro(g, x, y, s, o = {}) {
  const mood = o.mood || 'happy', skin = o.zombie ? '#86a86e' : '#c68955';
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, '#3b2c25', () => { RR(g, -34, -96, 28, 92, 8); RR(g, 6, -96, 28, 92, 8); });
  S(g, '#6a4326', () => { E(g, -22, -4, 24, 11); E(g, 22, -4, 24, 11); });
  const poncho = () => { g.moveTo(-78, -92); g.lineTo(78, -92); g.lineTo(44, -202); g.lineTo(-44, -202); g.closePath(); };
  S(g, '#c0392b', poncho);
  g.save(); g.beginPath(); poncho(); g.clip(); for (const [yy, c] of [[-120, '#f2c14e'], [-129, '#2e8b57'], [-162, '#f2c14e'], [-171, '#f7f1e3']]) { g.fillStyle = c; g.fillRect(-90, yy, 180, 8); } g.restore();
  S(g, null, poncho); g.lineWidth = 2.5; g.beginPath(); for (let i = -74; i <= 74; i += 9) { g.moveTo(i, -92); g.lineTo(i, -80); } g.stroke();
  hands(g, o.hand, skin, '#c0392b');
  S(g, skin, () => RR(g, -14, -216, 28, 22, 4), 3);
  S(g, skin, () => { E(g, -40, -238, 8, 11); E(g, 40, -238, 8, 11); }, 3);
  S(g, skin, () => E(g, 0, -240, 40, 44));
  face(g, mood, -246, skin, false);
  S(g, INK, () => { g.moveTo(-36, -222); g.quadraticCurveTo(-18, -238, 0, -228); g.quadraticCurveTo(18, -238, 36, -222); g.quadraticCurveTo(32, -206, 16, -214); g.quadraticCurveTo(0, -208, -16, -214); g.quadraticCurveTo(-32, -206, -36, -222); g.closePath(); }, 2);
  mouth(g, mood, -206);
  S(g, '#e0b04a', () => E(g, 0, -276, 96, 20));
  S(g, '#e0b04a', () => { g.moveTo(-34, -278); g.bezierCurveTo(-34, -332, 34, -332, 34, -278); g.closePath(); });
  S(g, '#c0392b', () => RR(g, -34, -293, 68, 11, 2), 3);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.beginPath(); for (let i = -80; i <= 80; i += 16) { g.moveTo(i, -270); g.lineTo(i * 0.9, -281); } g.stroke();
  g.restore();
}
function fiona(g, x, y, s, o = {}) {
  const mood = o.mood || 'deadpan', skin = '#b4bd9e';
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, '#34405e', () => { RR(g, -32, -96, 26, 92, 8); RR(g, 6, -96, 26, 92, 8); });
  S(g, '#1e1e22', () => { RR(g, -36, -40, 32, 40, 6); RR(g, 4, -40, 32, 40, 6); });
  S(g, '#e3b92b', () => E(g, 0, -228, 50, 44));
  S(g, '#3a2c26', () => E(g, 0, -248, 46, 44));
  const coat = () => { g.moveTo(-64, -92); g.lineTo(64, -92); g.lineTo(46, -204); g.quadraticCurveTo(0, -214, -46, -204); g.closePath(); };
  S(g, '#e8bf2e', coat); g.lineWidth = 3; g.beginPath(); g.moveTo(0, -206); g.lineTo(0, -92); g.stroke();
  S(g, '#1e1e22', () => { E(g, -9, -120, 4, 4); E(g, -9, -150, 4, 4); E(g, -9, -180, 4, 4); }, 0);
  hands(g, o.hand, skin, '#e8bf2e');
  S(g, skin, () => RR(g, -13, -216, 26, 20, 4), 3);
  S(g, skin, () => E(g, 0, -242, 38, 42));
  S(g, '#3a2c26', () => { g.moveTo(-40, -250); g.quadraticCurveTo(-32, -294, 0, -288); g.quadraticCurveTo(36, -294, 42, -248); g.quadraticCurveTo(26, -268, 12, -262); g.quadraticCurveTo(-4, -272, -16, -258); g.quadraticCurveTo(-30, -264, -40, -250); g.closePath(); });
  S(g, '#3a2c26', () => E(g, 8, -300, 20, 15));
  g.lineWidth = 2.5; g.strokeStyle = INK; g.beginPath(); g.moveTo(22, -306); g.lineTo(40, -322); g.moveTo(-6, -308); g.lineTo(-18, -326); g.moveTo(30, -296); g.lineTo(50, -300); g.stroke();
  face(g, mood, -246, skin, true);
  mouth(g, mood === 'deadpan' ? 'flat' : mood, -218);
  g.restore();
}
function zombieC(g, x, y, s, o = {}) {
  const skin = '#86a86e';
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s); if (o.sniff) g.rotate(0.16);
  S(g, '#3a3a46', () => { RR(g, -30, -96, 24, 92, 6); RR(g, 6, -96, 24, 92, 6); });
  armLine(g, -10, -184, 92, -168, '#4c406a');
  S(g, '#5d4f7c', () => { g.moveTo(-44, -92); for (let i = 0; i <= 8; i++) g.lineTo(-44 + i * 11, -92 + (i % 2 ? 10 : 0)); g.lineTo(40, -202); g.lineTo(-40, -202); g.closePath(); });
  armLine(g, 24, -190, 108, -184, '#5d4f7c'); S(g, skin, () => { E(g, 112, -184, 11, 10); E(g, 96, -168, 10, 9); }, 3);
  S(g, skin, () => E(g, 8, -238, 34, 37));
  S(g, '#f4f0d0', () => { E(g, -4, -246, 8, 9); E(g, 22, -246, 8, 9); }, 3); S(g, '#c0201a', () => { E(g, -2, -245, 3, 3); E(g, 24, -245, 3, 3); }, 0);
  if (o.bite) { S(g, '#e8c88a', () => E(g, 34, -218, 30, 12, 0.2)); S(g, '#c9ccd2', () => E(g, 60, -212, 10, 12, 0.2), 3); }
  else { S(g, '#2a0a0a', () => { g.moveTo(-6, -222); g.lineTo(28, -224); g.lineTo(24, -208); g.lineTo(-2, -208); g.closePath(); }, 3); S(g, '#f4f0d0', () => { g.rect(2, -223, 5, 5); g.rect(14, -224, 5, 5); }, 0); }
  g.lineWidth = 2.5; g.strokeStyle = INK; g.beginPath(); g.moveTo(-18, -262); g.lineTo(-8, -252); g.moveTo(-14, -266); g.lineTo(-6, -270); g.moveTo(10, -276); g.lineTo(12, -286); g.stroke();
  g.restore();
}
function npc(g, x, y, s, o = {}) {
  const skin = o.skin || '#d2a37c';
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, '#2e3038', () => { RR(g, -30, -96, 26, 92, 8); RR(g, 4, -96, 26, 92, 8); });
  S(g, o.coat || '#556b2f', () => { g.moveTo(-60, -92); g.lineTo(60, -92); g.lineTo(44, -204); g.lineTo(-44, -204); g.closePath(); });
  if (o.prop === 'shotgun') { S(g, '#2a2522', () => { g.save(); g.translate(-30, -150); g.rotate(-0.32); RR(g, 0, -7, 150, 14, 3); g.restore(); }); armLine(g, -40, -184, -12, -152, o.coat); armLine(g, 40, -184, 50, -186, o.coat); S(g, skin, () => { E(g, -12, -152, 11, 11); E(g, 56, -186, 11, 11); }, 3); }
  else if (o.prop === 'clipboard') { armLine(g, 40, -184, 40, -150, o.coat); S(g, '#8a6a3a', () => RR(g, 22, -196, 50, 64, 3)); S(g, '#fff', () => RR(g, 28, -188, 38, 50, 2), 2); S(g, skin, () => E(g, 40, -146, 11, 11), 3); }
  else if (o.prop === 'burrito') { armLine(g, 40, -184, 100, -170, o.coat); S(g, '#e8c88a', () => E(g, 124, -172, 30, 13, -0.2)); S(g, '#c9ccd2', () => E(g, 148, -178, 10, 12, -0.2), 3); S(g, skin, () => E(g, 102, -170, 11, 11), 3); }
  else { armLine(g, -44, -184, -56, -112, o.coat); armLine(g, 44, -184, 56, -112, o.coat); S(g, skin, () => { E(g, -58, -104, 11, 11); E(g, 58, -104, 11, 11); }, 3); }
  if (o.head === 'hood') {
    S(g, o.coat, () => E(g, 0, -244, 52, 56)); S(g, '#0f0b10', () => E(g, 0, -234, 32, 34), 3);
    S(g, '#ffd23a', () => { E(g, -12, -244, 5, 3); E(g, 12, -244, 5, 3); }, 0);
    S(g, '#fff', () => { g.moveTo(-16, -222); g.quadraticCurveTo(0, -208, 16, -222); g.closePath(); }, 2);
  } else {
    S(g, skin, () => E(g, 0, -240, 38, 42));
    if (o.head === 'doctor') { face(g, 'annoyed', -246, skin); S(g, '#bfe3ea', () => RR(g, -28, -232, 56, 26, 8), 3); S(g, '#9fd0c8', () => { g.arc(0, -258, 39, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); }); }
    else if (o.head === 'pilot') { S(g, '#4a5a48', () => { g.arc(0, -250, 44, Math.PI * 0.95, Math.PI * 2.05); g.closePath(); }); S(g, '#1a2a33', () => RR(g, -32, -262, 64, 20, 8)); mouth(g, 'happy', -218); }
    else { face(g, o.mood || 'angry', -244, skin); mouth(g, o.mood || 'angry', -216); S(g, '#556b2f', () => { g.arc(0, -252, 44, Math.PI, 0); g.closePath(); }); g.lineWidth = 5; g.beginPath(); g.moveTo(-52, -252); g.lineTo(52, -252); g.stroke(); }
  }
  g.restore();
}
function zeusC(g, x, y, s, o = {}) {
  const mood = o.mood || 'happy', skin = o.zombie ? '#86a86e' : '#e0b08a';
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, skin, () => { RR(g, -30, -96, 24, 88, 8); RR(g, 6, -96, 24, 88, 8); });
  S(g, '#7a5a34', () => { RR(g, -34, -14, 30, 12, 4); RR(g, 4, -14, 30, 12, 4); });
  const toga = () => { g.moveTo(-66, -90); g.lineTo(66, -90); g.lineTo(46, -204); g.lineTo(-46, -204); g.closePath(); };
  S(g, '#f2efe6', toga); g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(-40, -200); g.lineTo(30, -96); g.moveTo(-20, -200); g.lineTo(46, -110); g.stroke();
  S(g, '#3d6a3a', () => { g.moveTo(-34, -170); g.lineTo(34, -170); g.lineTo(40, -92); g.lineTo(-40, -92); g.closePath(); }); S(g, '#2e522c', () => RR(g, -14, -150, 28, 22, 3), 3);
  hands(g, o.hand, skin, '#f2efe6');
  S(g, skin, () => E(g, 0, -240, 38, 42));
  S(g, '#f6f4ee', () => { g.moveTo(-40, -238); g.quadraticCurveTo(-46, -282, 0, -290); g.quadraticCurveTo(46, -282, 40, -238); g.quadraticCurveTo(26, -262, 0, -260); g.quadraticCurveTo(-26, -262, -40, -238); g.closePath(); });
  face(g, mood, -244, skin);
  S(g, '#f6f4ee', () => { g.moveTo(-34, -222); g.quadraticCurveTo(-46, -170, 0, -160); g.quadraticCurveTo(46, -170, 34, -222); g.quadraticCurveTo(14, -210, 0, -214); g.quadraticCurveTo(-14, -210, -34, -222); g.closePath(); });
  g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,.2)'; g.beginPath(); for (const dx of [-20, -8, 4, 16]) { g.moveTo(dx, -204); g.quadraticCurveTo(dx + 4, -188, dx, -172); } g.stroke();
  mouth(g, mood === 'happy' || mood === 'determined' ? 'happy' : mood, -214);
  g.lineWidth = 6; g.strokeStyle = '#4a9a4a'; g.beginPath(); g.arc(0, -262, 40, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  S(g, '#5aa04a', () => { for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + i * 0.12); E(g, Math.cos(a) * 40, -262 + Math.sin(a) * 40, 7, 4, a + 1.2); } }, 2);
  g.restore();
}
function dobbyC(g, x, y, s, o = {}) {
  const mood = o.mood || 'happy', skin = o.zombie ? '#86a86e' : '#cdb8a0';
  g.save(); g.translate(x, y); g.scale(o.flip ? -s * 0.86 : s * 0.86, s * 0.86);
  S(g, skin, () => { RR(g, -26, -96, 20, 90, 8); RR(g, 6, -96, 20, 90, 8); });
  S(g, '#c0392b', () => RR(g, -30, -40, 28, 38, 6)); S(g, '#2a5aa8', () => RR(g, 4, -40, 28, 38, 6));
  g.fillStyle = '#f4f1e6'; g.fillRect(-28, -30, 24, 5); g.fillRect(-28, -18, 24, 5); g.fillStyle = '#f2c14e'; g.fillRect(6, -30, 24, 5); g.fillRect(6, -18, 24, 5);
  const tunic = () => { g.moveTo(-54, -90); g.lineTo(54, -90); g.lineTo(40, -200); g.lineTo(-40, -200); g.closePath(); };
  S(g, '#d9c9a0', tunic); g.save(); g.beginPath(); tunic(); g.clip(); g.fillStyle = 'rgba(160,60,40,.6)'; g.fillRect(-60, -130, 120, 6); g.fillRect(-60, -118, 120, 4); g.restore(); S(g, null, tunic);
  hands(g, o.hand, skin, '#d9c9a0');
  S(g, skin, () => { g.moveTo(-30, -250); g.lineTo(-110, -296); g.lineTo(-38, -226); g.closePath(); g.moveTo(30, -250); g.lineTo(110, -296); g.lineTo(38, -226); g.closePath(); });
  S(g, skin, () => E(g, 0, -240, 46, 46));
  if (mood === 'happy' || mood === 'zombie' || mood === 'sleep') face(g, mood, -246, skin);
  else { S(g, '#fff', () => { E(g, -18, -246, 15, 17); E(g, 18, -246, 15, 17); }, 3); S(g, o.zombie ? '#c0201a' : '#2e7a50', () => { E(g, -16, -244, 8, 9); E(g, 20, -244, 8, 9); }, 0); S(g, INK, () => { E(g, -15, -244, 3.5, 4); E(g, 21, -244, 3.5, 4); }, 0); if (mood === 'angry' || mood === 'determined') { g.lineWidth = 6; g.strokeStyle = INK; g.beginPath(); g.moveTo(-34, -270); g.lineTo(-6, -262); g.moveTo(34, -270); g.lineTo(6, -262); g.stroke(); } }
  S(g, skin, () => { g.moveTo(-4, -238); g.lineTo(0, -218); g.lineTo(8, -226); }, 3);
  mouth(g, mood, -210);
  g.restore();
}
function chewieC(g, x, y, s, o = {}) {
  const mood = o.mood || 'happy', fur = o.zombie ? '#5e7a4e' : '#7a4a2a', skin = o.zombie ? '#86a86e' : '#a06a40';
  g.save(); g.translate(x, y); g.scale(o.flip ? -s * 1.08 : s * 1.08, s * 1.08);
  S(g, fur, () => { RR(g, -38, -98, 32, 96, 10); RR(g, 6, -98, 32, 96, 10); });
  const body = () => { g.moveTo(-74, -92); g.lineTo(74, -92); g.quadraticCurveTo(70, -214, 0, -214); g.quadraticCurveTo(-70, -214, -74, -92); g.closePath(); };
  S(g, fur, body); g.lineWidth = 2.5; g.strokeStyle = 'rgba(30,15,5,.45)'; g.beginPath(); for (let i = -60; i <= 60; i += 14) { g.moveTo(i, -190); g.lineTo(i + 6, -170); g.moveTo(i + 4, -140); g.lineTo(i + 10, -118); } g.stroke();
  S(g, '#3a2a1a', () => { g.moveTo(-50, -200); g.lineTo(44, -110); g.lineTo(54, -122); g.lineTo(-40, -210); g.closePath(); }, 2);
  hands(g, o.hand, skin, fur);
  S(g, '#2a2a30', () => { g.arc(0, -214, 36, 0, Math.PI); }, 5); S(g, '#2a2a30', () => { RR(g, -42, -226, 14, 22, 5); RR(g, 28, -226, 14, 22, 5); }, 3);
  S(g, fur, () => E(g, 0, -248, 46, 46));
  S(g, skin, () => E(g, 0, -238, 30, 28), 3);
  face(g, mood, -246, skin); mouth(g, mood, -220);
  S(g, '#2a1a10', () => E(g, 0, -228, 7, 5), 2);
  S(g, '#e8d9a0', () => E(g, 0, -286, 64, 14)); S(g, '#e8d9a0', () => { g.moveTo(-40, -288); g.quadraticCurveTo(-36, -326, 0, -326); g.quadraticCurveTo(36, -326, 40, -288); g.closePath(); });
  g.restore();
}
function dragonC(g, x, y, s, o = {}) {
  const mood = o.mood || 'determined', skin = o.zombie ? '#86a86e' : '#e6d8dc';
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  S(g, '#4a1e5e', () => { g.moveTo(-60, -204); g.lineTo(-96, -10); g.lineTo(96, -10); g.lineTo(60, -204); g.closePath(); });
  S(g, '#1e1a26', () => { RR(g, -30, -96, 24, 92, 8); RR(g, 6, -96, 24, 92, 8); });
  S(g, '#120f18', () => { E(g, -20, -4, 22, 9); E(g, 20, -4, 22, 9); });
  S(g, '#1e1a26', () => { g.moveTo(-54, -92); g.lineTo(54, -92); g.lineTo(42, -204); g.lineTo(-42, -204); g.closePath(); });
  S(g, '#6a2a8a', () => { g.moveTo(-6, -200); g.lineTo(6, -200); g.lineTo(10, -96); g.lineTo(-10, -96); g.closePath(); }, 2);
  S(g, '#2a1a36', () => { g.moveTo(-58, -206); g.lineTo(-74, -264); g.lineTo(-30, -214); g.closePath(); g.moveTo(58, -206); g.lineTo(74, -264); g.lineTo(30, -214); g.closePath(); });
  hands(g, o.hand, skin, '#1e1a26');
  S(g, '#2a1a36', () => { E(g, 0, -244, 48, 50); g.rect(-48, -244, 96, 70); });
  S(g, skin, () => E(g, 0, -238, 34, 40));
  S(g, '#2a1a36', () => { g.moveTo(-36, -250); g.quadraticCurveTo(-20, -290, 30, -284); g.quadraticCurveTo(10, -262, -36, -250); g.closePath(); });
  S(g, '#111', () => { g.moveTo(-22, -270); g.quadraticCurveTo(-46, -300, -40, -330); g.quadraticCurveTo(-26, -300, -10, -276); g.closePath(); g.moveTo(22, -270); g.quadraticCurveTo(46, -300, 40, -330); g.quadraticCurveTo(26, -300, 10, -276); g.closePath(); });
  if (mood === 'zombie' || mood === 'sleep' || mood === 'happy' || mood === 'shock') face(g, mood, -244, skin);
  else { S(g, '#f0c040', () => { E(g, -14, -244, 9, 6); E(g, 14, -244, 9, 6); }, 3); S(g, INK, () => { E(g, -13, -244, 2, 5); E(g, 15, -244, 2, 5); }, 0); g.lineWidth = 5; g.strokeStyle = INK; g.beginPath(); g.moveTo(-28, -258); g.lineTo(-6, -252); g.moveTo(28, -258); g.lineTo(6, -252); g.stroke(); }
  if (mood === 'determined' || mood === 'happy') { g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(-14, -216); g.quadraticCurveTo(4, -206, 16, -220); g.stroke(); S(g, '#fff', () => { g.moveTo(6, -213); g.lineTo(9, -205); g.lineTo(12, -214); }, 1.5); }
  else mouth(g, mood, -216);
  g.restore();
}
const HERO_FN = { pedro: (...a) => pedro(...a), fiona: (...a) => fiona(...a), zeus: (...a) => zeusC(...a), dobby: (...a) => dobbyC(...a), chewie: (...a) => chewieC(...a), dragon: (...a) => dragonC(...a) };
const hero = (ch, g, x, y, s, o) => (HERO_FN[ch] || HERO_FN.pedro)(g, x, y, s, o);
// rendu « en volume » pour les menus : la figure est dessinée à part, éclairée en haut à gauche,
// assombrie en bas à droite, puis posée avec un liseré lumineux de contre-jour
const shadeBufs = [document.createElement('canvas'), document.createElement('canvas')];
function shadedFigure(g, draw, o = {}) {
  const W2 = g.canvas.width, H2 = g.canvas.height, [a, b] = shadeBufs; a.width = b.width = W2; a.height = b.height = H2;
  const ac = a.getContext('2d'); ac.setTransform(g.getTransform()); draw(ac); ac.setTransform(1, 0, 0, 1, 0, 0);
  ac.globalCompositeOperation = 'source-atop';
  const lx = W2 * (o.lx ?? 0.3), ly = H2 * (o.ly ?? 0.12), R2 = Math.max(W2, H2);
  const key = ac.createRadialGradient(lx, ly, 0, lx, ly, R2 * 0.95); key.addColorStop(0, 'rgba(255,246,228,.26)'); key.addColorStop(0.42, 'rgba(255,246,228,0)'); key.addColorStop(1, 'rgba(18,6,28,.42)'); ac.fillStyle = key; ac.fillRect(0, 0, W2, H2);
  const floor = ac.createLinearGradient(0, H2 * 0.55, 0, H2); floor.addColorStop(0, 'rgba(0,0,0,0)'); floor.addColorStop(1, 'rgba(10,4,0,.32)'); ac.fillStyle = floor; ac.fillRect(0, 0, W2, H2);
  ac.globalCompositeOperation = 'source-over';
  const bc = b.getContext('2d'); bc.setTransform(1, 0, 0, 1, 0, 0); bc.clearRect(0, 0, W2, H2); bc.drawImage(a, 0, 0); bc.globalCompositeOperation = 'source-in'; bc.fillStyle = o.rim || '#ffb066'; bc.fillRect(0, 0, W2, H2); bc.globalCompositeOperation = 'source-over';
  const k = Math.max(1.5, W2 / 260);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.shadowColor = o.glow || 'rgba(255,150,70,.7)'; g.shadowBlur = k * 5; g.globalAlpha = 0.6;
  g.drawImage(b, k * 1.2, -k * 1.6); g.drawImage(b, -k * 1.4, -k * 0.8); g.shadowBlur = 0; g.globalAlpha = 1; g.drawImage(a, 0, 0); g.restore();
}
const PROP = { pedro: 'burrito', fiona: 'frites', zeus: 'plant', dobby: 'sock', chewie: 'kebab', dragon: 'coffee' };
function vending(g, x, y) { S(g, '#9a2a2a', () => RR(g, x, y, 112, 196, 6)); S(g, '#9fc6d8', () => RR(g, x + 12, y + 14, 88, 112, 4), 3); S(g, '#e8c88a', () => E(g, x + 56, y + 80, 26, 10, 0.2), 3); S(g, '#c9ccd2', () => E(g, x + 78, y + 84, 7, 9, 0.2), 2); S(g, '#222', () => RR(g, x + 20, y + 144, 72, 20, 3), 3); }
function jerrycan(g, x, y) { S(g, '#b0281e', () => RR(g, x, y, 70, 92, 8)); g.lineWidth = 6; g.strokeStyle = INK; g.beginPath(); g.moveTo(x + 14, y); g.lineTo(x + 14, y - 16); g.lineTo(x + 44, y - 16); g.lineTo(x + 44, y); g.stroke(); S(g, '#222', () => RR(g, x + 52, y - 12, 14, 14, 3), 3); g.lineWidth = 3; g.beginPath(); g.moveTo(x + 10, y + 20); g.lineTo(x + 60, y + 80); g.moveTo(x + 60, y + 20); g.lineTo(x + 10, y + 80); g.stroke(); }
