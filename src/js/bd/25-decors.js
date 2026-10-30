// ---------- décors
function bgNight(g, seed = 1, sky = ['#16193a', '#3a2547']) {
  const r = mulberry32(seed), gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); g.fillStyle = gr; g.fillRect(0, 0, 480, 360);
  S(g, '#efe2b0', () => E(g, 412, 56, 24, 24), 3);
  let x = -10; while (x < 490) { const w = 50 + r() * 60, h = 110 + r() * 140; g.fillStyle = '#101327'; g.fillRect(x, 300 - h, w, h + 60); for (let wy = 300 - h + 14; wy < 290; wy += 22) for (let wx = x + 8; wx < x + w - 12; wx += 18) if (r() < 0.16) { g.fillStyle = '#f0b25a'; g.fillRect(wx, wy, 8, 10); } x += w + 4; }
  g.fillStyle = '#24273a'; g.fillRect(0, 300, 480, 60); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 300); g.lineTo(480, 300); g.stroke();
  rain(g, r);
}
function bgTruck(g) {
  bgNight(g, 5); glowAt(g, 140, 200, 200, '255,190,90');
  S(g, '#c0392b', () => RR(g, 26, 104, 250, 36, 4)); sfx(g, 'EL BURRITO LOCO', 151, 132, 25, 0);
  S(g, '#2f8f6b', () => RR(g, 20, 140, 262, 150, 12)); S(g, '#f6e7c8', () => RR(g, 46, 168, 160, 62, 3), 3);
  S(g, '#e8c88a', () => E(g, 90, 200, 26, 11, -0.3), 3); S(g, '#e8c88a', () => E(g, 150, 204, 26, 11, 0.3), 3);
  S(g, '#1b1b1b', () => { E(g, 72, 292, 22, 22); E(g, 232, 292, 22, 22); });
}
function bgFriterie(g) {
  bgNight(g, 3); glowAt(g, 150, 200, 210, '255,190,90');
  S(g, '#2a2224', () => RR(g, 50, 74, 190, 38, 4)); sfx(g, 'FRITERIE', 145, 104, 30, 0, '#ffe36b');
  for (let i = 0; i < 8; i++) S(g, i % 2 ? '#fff' : '#d23b2f', () => { g.moveTo(22 + i * 31, 150); g.lineTo(53 + i * 31, 150); g.lineTo(47 + i * 31, 120); g.lineTo(28 + i * 31, 120); g.closePath(); }, 3);
  S(g, '#b8322a', () => RR(g, 28, 150, 236, 150, 4)); S(g, '#f6e7c8', () => RR(g, 48, 176, 196, 60, 3), 3);
  sfx(g, 'FRITES · FRICADELLE · MAROILLES', 146, 214, 13, 0, '#b8322a');
}
function bgPharmacy(g) {
  const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#2a4a40'); gr.addColorStop(1, '#14231d'); g.fillStyle = gr; g.fillRect(0, 0, 480, 360);
  const r = mulberry32(21); const cols = ['#d9534f', '#f0ad4e', '#5bc0de', '#f7f7f7', '#7fd18b'];
  for (let i = 0; i < 3; i++) { S(g, '#5a4632', () => RR(g, 10, 92 + i * 66, 300, 10, 2), 3); for (let x = 16; x < 300; x += 18 + r() * 10) S(g, cols[Math.floor(r() * 5)], () => RR(g, x, 66 + i * 66, 14, 26, 2), 2); }
  glowAt(g, 404, 70, 90, '77,255,138'); S(g, '#4dff8a', () => { g.rect(390, 40, 28, 60); g.rect(374, 56, 60, 28); }, 3);
  g.fillStyle = '#262626'; g.fillRect(0, 300, 480, 60); S(g, '#e8e2d0', () => RR(g, 250, 228, 240, 74, 3));
}
function bgMarket(g) {
  g.fillStyle = '#1c1517'; g.fillRect(0, 0, 480, 360); glowAt(g, 250, 46, 220, '255,210,120');
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(250, 0); g.lineTo(250, 34); g.stroke(); S(g, '#ffe08a', () => E(g, 250, 44, 11, 13), 3);
  for (let i = 0; i < 4; i++) S(g, '#3a2e2a', () => RR(g, 30 + i * 112, 90 + (i % 2) * 14, 90, 12, 3), 3);
  for (const [x, y, w] of [[20, 236, 120], [300, 246, 160], [150, 270, 110]]) { S(g, '#7a5a34', () => RR(g, x, y, w, 64, 3)); g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + 64); g.moveTo(x + w, y); g.lineTo(x, y + 64); g.lineWidth = 3; g.stroke(); }
}
function bgRadio(g) {
  g.fillStyle = '#272c38'; g.fillRect(0, 0, 480, 360);
  S(g, '#d9cfa8', () => RR(g, 250, 40, 190, 120, 2), 3); g.strokeStyle = '#b0231c'; g.lineWidth = 3; g.beginPath(); g.moveTo(270, 120); g.lineTo(330, 80); g.lineTo(400, 110); g.stroke(); S(g, '#b0231c', () => E(g, 400, 110, 6, 6), 2);
  S(g, '#5a4030', () => g.rect(-4, 262, 488, 110));
  S(g, '#3a4a32', () => RR(g, 268, 182, 160, 82, 6)); S(g, '#d8d2c4', () => { E(g, 300, 214, 14, 14); E(g, 340, 214, 14, 14); }, 3); S(g, '#111', () => RR(g, 368, 200, 46, 40, 3), 3);
  g.lineWidth = 3; g.beginPath(); g.moveTo(410, 182); g.lineTo(440, 110); g.stroke();
}
function bgMetro(g) {
  g.fillStyle = '#d8d0b4'; g.fillRect(0, 0, 480, 360); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.5; g.beginPath();
  for (let x = 0; x < 480; x += 24) { g.moveTo(x, 0); g.lineTo(x, 300); } for (let y = 0; y < 300; y += 14) { g.moveTo(0, y); g.lineTo(480, y); } g.stroke();
  S(g, '#1f3b5a', () => g.rect(-4, 120, 488, 30), 3); S(g, '#f2c14e', () => E(g, 70, 70, 28, 28)); sfx(g, 'M', 70, 84, 38, 0, '#151213');
  S(g, '#b0231c', () => RR(g, 300, 30, 120, 76, 2), 3); sfx(g, 'COUVRE-FEU 20 H', 360, 76, 16, 0, '#fff');
  g.fillStyle = '#3a3a3a'; g.fillRect(0, 300, 480, 60); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 300); g.lineTo(480, 300); g.stroke();
}
function bgParking(g, lit) {
  g.fillStyle = lit ? '#5d5a50' : '#1d1f24'; g.fillRect(0, 0, 480, 360); g.fillStyle = lit ? '#4a4840' : '#15171b'; g.fillRect(0, 0, 480, 60);
  if (lit) for (const x of [90, 240, 390]) { glowAt(g, x, 60, 150, '255,210,120'); S(g, '#ffe9a8', () => RR(g, x - 30, 52, 60, 10, 3), 3); }
  for (const x of [20, 200, 400]) S(g, lit ? '#77746a' : '#2c2f35', () => g.rect(x, 60, 46, 240), 3);
  for (const [x, c] of [[60, '#5b2a26'], [260, '#2f3d4f']]) S(g, lit ? c : '#22252b', () => RR(g, x, 236, 130, 60, 14), 3);
  g.fillStyle = lit ? '#3e3c36' : '#121317'; g.fillRect(0, 300, 480, 60); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 300); g.lineTo(480, 300); g.stroke();
}
function bgPlaza(g) {
  bgNight(g, 11, ['#120c1e', '#2a1424']);
  S(g, '#4a403a', () => g.rect(50, 92, 380, 210)); S(g, '#574b44', () => { g.moveTo(36, 94); g.lineTo(240, 30); g.lineTo(444, 94); g.closePath(); });
  S(g, '#e8dcb0', () => E(g, 240, 68, 17, 17), 3); g.lineWidth = 3; g.beginPath(); g.moveTo(240, 68); g.lineTo(240, 57); g.moveTo(240, 68); g.lineTo(248, 72); g.stroke();
  for (const x of [70, 140, 350, 410]) S(g, '#6a5e55', () => g.rect(x - 11, 112, 22, 190), 3);
  sfx(g, 'MAIRIE', 240, 112, 18, 0, '#d8c9a0');
  S(g, '#090505', () => RR(g, 176, 150, 128, 152, 4)); g.strokeStyle = '#c0201a'; g.lineWidth = 3; g.beginPath(); g.moveTo(176, 180); g.lineTo(196, 200); g.lineTo(186, 230); g.moveTo(304, 170); g.lineTo(288, 196); g.stroke();
  for (const [x, y] of [[210, 196], [252, 182], [228, 236], [272, 222], [198, 262]]) { glowAt(g, x + 6, y, 26, '255,40,20'); S(g, '#ff2a1a', () => { E(g, x, y, 5, 3); E(g, x + 13, y, 5, 3); }, 0); }
  S(g, '#e8e2d0', () => { for (let i = 0; i < 7; i++) { g.moveTo(206 + i * 11, 280); g.lineTo(211 + i * 11, 294); g.lineTo(216 + i * 11, 280); } }, 2);
}
function bgDawn(g, seed = 13) {
  const r = mulberry32(seed), gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#5a3a6a'); gr.addColorStop(0.55, '#f08a5a'); gr.addColorStop(1, '#ffd9a0'); g.fillStyle = gr; g.fillRect(0, 0, 480, 360);
  S(g, '#fff1c0', () => E(g, 110, 262, 48, 48), 0);
  let x = -10; g.fillStyle = '#2a1a2a'; while (x < 490) { const w = 40 + r() * 60, h = 50 + r() * 110; g.fillRect(x, 330 - h, w, h + 40); x += w + 3; }
}
function bgCamp(g) {
  const r = mulberry32(17), gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#7c848e'); gr.addColorStop(1, '#c4c9cc'); g.fillStyle = gr; g.fillRect(0, 0, 480, 360);
  for (const [x, w] of [[10, 170], [200, 150], [360, 140]]) { S(g, '#efeee8', () => { g.moveTo(x, 290); g.lineTo(x + w / 2, 170); g.lineTo(x + w, 290); g.closePath(); }); S(g, '#c0201a', () => { g.rect(x + w / 2 - 5, 210, 10, 34); g.rect(x + w / 2 - 17, 222, 34, 10); }, 2); }
  g.fillStyle = '#5a5246'; g.fillRect(0, 290, 480, 70); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 290); g.lineTo(480, 290); g.stroke(); rain(g, r, 0.4);
}
function bgHospital(g) {
  bgNight(g, 37, ['#0e1a24', '#24323a']);
  S(g, '#d9d6cc', () => g.rect(70, 92, 340, 220)); g.fillStyle = 'rgba(40,50,48,.35)'; g.fillRect(70, 92, 340, 220);
  const r = mulberry32(43); for (let y = 112; y < 270; y += 38) for (let x = 88; x < 392; x += 40) { const lit = r() < 0.22; S(g, lit ? '#bff0d8' : '#1a2226', () => g.rect(x, y, 24, 24), 2); if (lit) glowAt(g, x + 12, y + 12, 26, '170,240,210'); }
  S(g, '#2a2f30', () => g.rect(205, 250, 70, 62)); S(g, '#9fd3e8', () => g.rect(213, 258, 54, 24), 2);
  glowAt(g, 240, 60, 90, '255,60,50'); S(g, '#d8241c', () => { g.rect(228, 30, 24, 64); g.rect(208, 50, 64, 24); }, 4);
  S(g, '#3a3f40', () => g.rect(60, 84, 360, 12)); helicopter(g, 380, 62, 0.42);
  sfx(g, 'URGENCES', 240, 246, 24, 0, '#ff5a4a');
}
function bgHeli(g) {
  g.fillStyle = '#2b3328'; g.fillRect(0, 0, 480, 360);
  for (const x of [40, 260]) { g.save(); g.beginPath(); RR(g, x, 40, 180, 120, 18); g.clip(); bgDawn(g, 19); g.restore(); S(g, null, () => RR(g, x, 40, 180, 120, 18), 6); }
  S(g, '#3d4a38', () => RR(g, -10, 250, 500, 120, 8));
}
function helicopter(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  S(g, '#4a5a3a', () => { g.moveTo(-60, -8); g.lineTo(-170, -20); g.lineTo(-170, -4); g.lineTo(-60, 12); g.closePath(); });
  S(g, '#4a5a3a', () => E(g, 0, 0, 72, 36)); S(g, '#9fd3e8', () => { g.moveTo(18, -30); g.quadraticCurveTo(68, -22, 66, 6); g.lineTo(18, 6); g.closePath(); }, 3);
  g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(0, -36); g.lineTo(0, -48); g.moveTo(-40, 34); g.lineTo(-50, 50); g.moveTo(40, 34); g.lineTo(50, 50); g.moveTo(-70, 50); g.lineTo(70, 50); g.stroke();
  S(g, 'rgba(30,30,30,.45)', () => E(g, 0, -50, 160, 6), 2); S(g, 'rgba(30,30,30,.45)', () => E(g, -170, -12, 6, 22), 2);
  g.restore();
}
