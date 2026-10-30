// ============================================================ données de jeu
const WORLD = { w: 10600, h: 1200 };
const ST = 160, SB = 1040;
const ZONES = [
  { x0: 0, x1: 2600, name: 'Avenue de la Gare', sub: 'Secteur 1' },
  { x0: 3000, x1: 5600, name: 'Boulevard des Tanneurs', sub: 'Secteur 2' },
  { x0: 6000, x1: 8600, name: 'Parking Saint-Roch', sub: 'Secteur 3' },
  { x0: 9000, x1: 10400, name: 'Place de la Mairie', sub: 'Secteur 4' }
];
const SAFES = [
  { x0: 2600, x1: 3000, name: 'Pharmacie barricadée' },
  { x0: 5600, x1: 6000, name: 'Station de métro Lafayette' },
  { x0: 8600, x1: 9000, name: 'Poste de secours' }
];
const EXIT = { x0: 10400, x1: 10600 };
// la campagne : les quatre secteurs de la ville, puis l'hôpital (mission 5)
const MISSION_NAMES = [...ZONES.map(z => z.name), 'Hôpital Saint-Lazare'], MISSIONS = MISSION_NAMES.length;
const BOUNDS = [2600, 3000, 5600, 6000, 8600, 9000, 10400];
// centre de la Place de la Mairie et hélicoptère d'évacuation
const PLAZA = ZONES[3].x0 + 700, HELI = EXIT.x0 + 100;
const DIFFS = {
  facile: { key: 'facile', name: 'Facile', hp: 0.75, dmg: 0.6, spawn: 0.75, pop: 0.8, lives: 3, score: 0.75, ambient: [22, 22, 32], money: 1.25, defend: 0.8, battery: 0.6 },
  normal: { key: 'normal', name: 'Normal', hp: 1, dmg: 1, spawn: 1, pop: 1, lives: 2, score: 1, ambient: [14, 14, 21], money: 1, defend: 1, battery: 0.85 },
  cauchemar: { key: 'cauchemar', name: 'Cauchemar', hp: 1.35, dmg: 1.45, spawn: 1.3, pop: 1.25, lives: 1, score: 1.6, ambient: [7, 7, 11], money: 0.85, defend: 1.2, battery: 1.15 }
};
let NET_NID = 0, NET_HID = 0; // identifiants réseau des zombies et des dangers
const ZTYPES = {
  walker: { hp: 34, speed: [38, 60], dmg: 10, r: 13, money: 4, score: 100, kb: 1 },
  runner: { hp: 22, speed: [135, 168], dmg: 7, r: 12, money: 7, score: 150, kb: 1.2 },
  brute: { hp: 320, speed: [34, 42], dmg: 26, r: 22, money: 40, score: 600, kb: 0.22 },
  bomber: { hp: 26, speed: [70, 86], dmg: 0, r: 14, money: 9, score: 220, kb: 1 },
  spitter: { hp: 45, speed: [55, 66], dmg: 6, r: 13, money: 14, score: 260, kb: 0.9 },
  riot: { hp: 90, speed: [44, 54], dmg: 14, r: 15, money: 18, score: 320, kb: 0.4 },
  dog: { hp: 30, speed: [172, 198], dmg: 9, r: 11, money: 6, score: 180, kb: 1.3 },
  screamer: { hp: 58, speed: [50, 62], dmg: 8, r: 13, money: 16, score: 300, kb: 0.9 },
  boss: { hp: 5600, speed: [70, 70], dmg: 38, r: 36, money: 1200, score: 15000, kb: 0.04 }
};
const ZCFG = [
  { pop: 30, interval: 1.0, seed: 16, w: { walker: 75, runner: 18, bomber: 7 } },
  { pop: 36, interval: 0.85, seed: 22, w: { walker: 62, runner: 20, bomber: 7, spitter: 6, brute: 3, riot: 2, dog: 4 } },
  { pop: 60, interval: 0.6, seed: 26, w: { walker: 45, runner: 25, bomber: 10, spitter: 12, brute: 8, riot: 9, dog: 6, screamer: 4 } },
  { pop: 14, interval: 1.2, seed: 0, w: { walker: 50, runner: 32, bomber: 10, riot: 8, screamer: 5 } }
];
const HORDE_W = { walker: 50, runner: 38, bomber: 8, brute: 4, riot: 3, dog: 5 };
const HOSP_W = { walker: 58, runner: 15, dog: 9, spitter: 6, bomber: 5, screamer: 9 };
// Halloween : du 25 octobre au 2 novembre, chaque année (?halloween pour forcer, ?nohalloween pour couper)
const HALLOWEEN = (() => { try { const q = location.search; if (/[?&]nohalloween\b/.test(q)) return false; if (/[?&]halloween\b/.test(q)) return true; } catch (e) { } const d = new Date(), m = d.getMonth(), j = d.getDate(); return (m === 9 && j >= 25) || (m === 10 && j <= 2); })();
const HW_GOAL = 31, COSTUMES = ['citrouille', 'drap', 'sorciere'];
const hwCount = () => { const y = new Date().getFullYear(); return Settings.hw && Settings.hw.y === y ? Settings.hw.n : 0; };
const SURVIVORS = [
  { name: 'Gérard', who: 'cheminot retraité', coat: '#5a4a3a', line: 'Merci ! J\'ai connu pire : la grève de 95.' },
  { name: 'Mme Lefebvre', who: 'boulangère', f: true, coat: '#9a5a7a', line: 'Passez à la boutique, je vous ferai un pain au chocolat. Ou une chocolatine, je juge pas.' },
  { name: 'Kévin', who: 'livreur à vélo', coat: '#2f8f6b', line: 'Ma commande est froide, mais moi je suis vivant. Cinq étoiles !' },
  { name: 'Inès', who: 'infirmière de garde', f: true, coat: '#6fa8bf', line: 'Trois gardes d\'affilée et une invasion de zombies. Je veux une prime.' }
];
const WEAPONS = [
  { id: 'pistol', name: 'Pistolet', type: 'bullet', dmg: 20, rate: 0.2, mag: 12, reload: 1.0, spread: 0.035, pellets: 1, speed: 1500, pierce: 0, infinite: true, price: 0, ammoPrice: 0, ammoPack: 0, tier: 0.6, shake: 0.08, desc: 'Munitions infinies. Maintiens le clic pour charger un tir perçant.' },
  { id: 'shotgun', name: 'Fusil à pompe', type: 'bullet', dmg: 14, rate: 0.75, mag: 6, reload: 1.6, spread: 0.26, pellets: 9, speed: 1300, pierce: 1, price: 450, ammoPrice: 60, ammoPack: 18, tier: 1, shake: 0.3, desc: 'Neuf plombs à courte portée. Repousse la foule.' },
  { id: 'smg', name: 'Mitraillette', type: 'bullet', dmg: 11, rate: 0.075, mag: 40, reload: 1.4, spread: 0.1, pellets: 1, speed: 1600, pierce: 0, price: 600, ammoPrice: 70, ammoPack: 120, tier: 1, shake: 0.06, desc: 'Cadence élevée, chargeur de 40 balles.' },
  { id: 'flamer', name: 'Lance-flammes', type: 'flame', dmg: 7, rate: 0.035, mag: 150, reload: 2.0, spread: 0.2, pellets: 1, speed: 430, pierce: 0, price: 950, ammoPrice: 90, ammoPack: 150, tier: 1.2, shake: 0.02, desc: 'Embrase la horde. Les cibles brûlent plusieurs secondes.' },
  { id: 'rail', name: 'Fusil à rail', type: 'rail', dmg: 220, rate: 1.1, mag: 5, reload: 2.0, pellets: 1, speed: 0, pierce: 99, price: 1400, ammoPrice: 120, ammoPack: 10, tier: 1.4, shake: 0.35, desc: 'Rayon instantané qui traverse toutes les cibles alignées.' },
  { id: 'rocket', name: 'Lance-roquettes', type: 'rocket', dmg: 260, radius: 125, rate: 0.9, mag: 3, reload: 2.2, pellets: 1, speed: 720, pierce: 0, price: 1900, ammoPrice: 150, ammoPack: 4, tier: 1.5, shake: 0.25, desc: 'Explosion de zone. Garde tes distances avec le souffle.' }
];
const UPNAMES = { dmg: 'Dégâts', rate: 'Cadence', mag: 'Chargeur' };
const CHARS = {
  pedro: { name: 'Pedro', full: 'Pedro Ramírez', fallen: 'PEDRO EST TOMBÉ', sp: 'SALSA', spLong: 'SALSA', fetish: 'Burrito caché', tag: 'Mexicain, fan de burritos, en vacances au pire moment. ¡Ay caramba !', perk: 'Estomac blindé : les soins rendent 50 % de plus, +1 grenade. Capacité : salsa picante.' },
  fiona: { name: 'Fiona', full: 'Fiona Delattre', fallen: 'FIONA EST TOMBÉE', sp: 'MORTE', spLong: 'LA MORTE', fetish: 'Cornet de frites caché', tag: 'On la prend pour un zombie. Elle est juste du Nord.', perk: 'Tête de déterrée : repérée de moins loin, endurance +30 %. Capacité : faire la morte.' },
  zeus: { name: 'Zeus', full: 'Zeus · Plante', fallen: 'ZEUS EST K.O.', sp: 'FOUDRE', spLong: 'FOUDRE', fetish: 'Pot de basilic', tag: 'Barbe divine et 147 plantes vertes. Personne ne touche au ficus.', perk: 'Main verte : la santé se régénère hors combat. Capacité : foudre en chaîne.' },
  dobby: { name: 'Dobby', full: 'Dobby · Lor\'hi', fallen: 'DOBBY EST K.O.', sp: 'POUF', spLong: 'TRANSPLANAGE', fetish: 'Chaussette dépareillée', tag: 'De la famille Lor\'hi. Grandes oreilles, chaussettes dépareillées, parle à la troisième personne.', perk: 'Petit et vif : plus rapide, plus dur à toucher. Capacité : transplanage.' },
  chewie: { name: 'Chewie', full: 'Chewie · Kiffeur', fallen: 'CHEWIE EST K.O.', sp: 'RUGIR', spLong: 'RUGISSEMENT', fetish: 'Kebab sauce blanche', tag: 'Deux mètres de poils et de bonne humeur. Kiffe tout, sauf qu\'on touche à son kebab.', perk: 'Costaud : +40 santé, coups de mêlée doublés. Capacité : rugissement.' },
  dragon: { name: 'Dragon', full: 'Dragon · Maléfique', fallen: 'DRAGON EST K.O.', sp: 'SOUFFLE', spLong: 'SOUFFLE', fetish: 'Café noir', tag: 'Alias le Maléfique. Grand méchant depuis la maternelle, cœur tendre en secret.', perk: 'Sang-froid : insensible au feu. Capacité : souffle du dragon.' }
};
const CHAR_KEYS = Object.keys(CHARS);
const WIN_ACH = { pedro: 'burrito', fiona: 'nord', zeus: 'win_zeus', dobby: 'win_dobby', chewie: 'win_chewie', dragon: 'win_dragon' };
const QUIPS = {
  pedro: { low: ['¡Ay caramba, ça pique !', '¡Madre mía! Il me faut un burrito…'], streak: ['¡Olé!', '¡Ándale, ándale!'], boss: ['¡Qué fea es! On dirait ma belle-mère.'], fuel: ['Gasolina… ¡vámonos!'], fetish: ['¡Un burrito! Dios existe.', 'Encore tiède… ¡milagro!'], special: ['¡SALSA PICANTE!', '¡Que pique, cabrones!'], battery: ['Des piles. ¡Gracias!'] },
  zeus: { low: ['Par ma barbe, ça fait mal !', 'Même Zeus a ses limites…'], streak: ['Que la foudre soit !', 'Olympien !'], boss: ['Une créature digne des Titans.'], fuel: ['Du carburant. Prométhée serait fier.'], fetish: ['Un basilic en pot ! Je le garde.', 'Une plante ! Ça va tout de suite mieux.'], special: ['FOUDRE !', 'Par Zeus… enfin, par moi !'] },
  dobby: { low: ['Aïe ! Dobby a mal !', 'Dobby doit être courageux…'], streak: ['Dobby est un héros !', 'Dobby fait le ménage !'], boss: ['Dobby n\'aime pas du tout cette chose.'], fuel: ['Dobby a trouvé l\'essence !'], fetish: ['Une chaussette ! Dobby est comblé !', 'Encore une chaussette !'], special: ['POUF !', 'Dobby transplane !'] },
  chewie: { low: ['Aïe, ça pique, wesh.', 'Grrr… pas cool.'], streak: ['Trop bien, je kiffe !', 'Grrraaawr !'], boss: ['Elle est énorme… respect.'], fuel: ['L\'essence ? Easy.'], fetish: ['Un kebab ! Sauce blanche en plus !', 'Kebab trouvé, moral au top.'], special: ['GRRRAAAWR !', 'Tout le monde se calme !'] },
  dragon: { low: ['Hmpf. Une égratignure.', 'Le mal ne saigne pas. Enfin, un peu.'], streak: ['Mwahaha !', 'Tremblez, mortels !'], boss: ['Enfin, un adversaire à ma mesure.'], fuel: ['Du carburant pour mon souffle.'], fetish: ['Un café noir. Comme mon âme.', 'Café corsé. Parfait.'], special: ['SOUFFLE DU DRAGON !', 'Brûlez !'] },
  fiona: { low: ['Ouille. Ch’est pas l’moment.', 'J’ai d’jà eu pire au carnaval d’Dunkerque.'], streak: ['Allez hop, biloute !', 'Comme à la braderie !'], boss: ['Elle a pire tête que moi. Respect.'], fuel: ['Un jerrican. Comme au garage d’papa.'], fetish: ['Un cornet d’frites. La vie est belle.', 'Avec d’la sauce andalouse, en plus.'], special: ['Bon. Je fais la morte. J’ai l’habitude.'], battery: ['Des piles. Pas d’trop.'] }
};
// le grand titre de l'écran de mort, tiré au hasard (accordé au féminin pour Fiona) ; jamais deux fois de suite le même
const DEATH_LINES = ['TU ES MORT{e}', 'DÉVORÉ{e}', 'MORDU{e}', 'DÉCHIQUETÉ{e}', 'C\'EST FINI', 'TROP TARD', 'ILS T\'ONT EU', 'REPOSE EN PIÈCES', 'PLAT DU JOUR', 'AU MENU CE SOIR', 'LA HORDE A FAIM', 'MANGÉ{e} TOUT{e} CRU{e}', 'UN DE PLUS', 'TU AS PERDU LA TÊTE', 'BIENVENUE DANS LA HORDE', 'ÇA SENT LE SAPIN', 'CHAIR FRAÎCHE', 'TU NE RENTRERAS PAS', 'TOUT LE MONDE A MANGÉ', 'RIP'];
const SKINS = ['#7d8a6a', '#8b8f74', '#6f7b63', '#9a9178', '#7a8570', '#848a7a'];
const CLOTHS = ['#3d4652', '#5a3b33', '#4a4a3c', '#2f3a35', '#5b5448', '#3b2f3f', '#6a5a3a', '#4b3a2c'];
const CAR_COLORS = ['#5b2a26', '#2f3d4f', '#4f5254', '#6b6a5e', '#2e4436', '#6e5a35', '#3a3340', '#7a7c80'];
const LOWK = new Set(['barrel', 'barrier', 'sandbags', 'parapet', 'radio', 'brazier', 'bed']);

