/* ==========================================================================
   LAUT DARAH - GAME CONFIGURATION DATA
   Upgrades, Clans, Lore, Islands, & Biome Constants (Emoji-Free / SVG Powered)
   ========================================================================== */

const SAVE_KEY = 'BLOOD_SEA_SAVE_DATA_v2';
const SETTINGS_KEY = 'BLOOD_SEA_SETTINGS_v2';
const DIFFICULTY_STORAGE_KEY = 'BLOOD_SEA_DIFFICULTY_v2';

// Difficulty System Configuration (Easy, Medium/Default, Hard)
const DIFFICULTY_SETTINGS = {
  easy: {
    id: 'easy',
    name: 'Mudah (Easy)',
    badge: 'MUDAH',
    badgeColor: 'text-emerald-400 bg-emerald-950 border-emerald-500/40',
    desc: 'Petualangan santai: Kerusakan diterima -25%, damage meriam +20%, hadiah Koin & Darah +25%.',
    playerDamageReceivedMult: 0.75,
    playerDamageDealtMult: 1.20,
    rewardMultiplier: 1.25,
    enemyReloadMultiplier: 1.25,
    enemyHpMultiplier: 0.85
  },
  medium: {
    id: 'medium',
    name: 'Normal (Medium)',
    badge: 'NORMAL',
    badgeColor: 'text-amber-300 bg-amber-950 border-amber-500/40',
    desc: 'Keseimbangan standar ekspedisi Laut Darah saat ini.',
    playerDamageReceivedMult: 1.0,
    playerDamageDealtMult: 1.0,
    rewardMultiplier: 1.0,
    enemyReloadMultiplier: 1.0,
    enemyHpMultiplier: 1.0
  },
  hard: {
    id: 'hard',
    name: 'Sulit (Hard)',
    badge: 'EKSTREM',
    badgeColor: 'text-rose-400 bg-rose-950 border-rose-500/40',
    desc: 'Kutukan Palung: Kerusakan diterima +35%, musuh lebih tangguh & agresif, hadiah Koin & Darah +50%.',
    playerDamageReceivedMult: 1.35,
    playerDamageDealtMult: 0.90,
    rewardMultiplier: 1.50,
    enemyReloadMultiplier: 0.85,
    enemyHpMultiplier: 1.25
  }
};

// Clean SVG Icon paths for Upgrades & UI elements
const SVG_ICONS = {
  hull: `<svg class="w-5 h-5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  speed: `<svg class="w-5 h-5 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/><path d="M4 18L12 3l8 15"/><path d="M12 3v15"/></svg>`,
  cannons: `<svg class="w-5 h-5 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 11 12-4 3 6-12 4z"/><path d="m14 4 3 6"/><circle cx="7" cy="18" r="3"/><circle cx="17" cy="18" r="3"/></svg>`,
  rearDefense: `<svg class="w-5 h-5 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>`,
  stealthCamo: `<svg class="w-5 h-5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  relicSiphon: `<svg class="w-5 h-5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="m12 8-2 4h4l-2 4"/><circle cx="12" cy="12" r="3"/></svg>`,
  gold: `<svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2" fill="#d97706"/><path d="M12 6v12M9 9.5c0-1.5 1.5-2 3-2s3 .8 3 2c0 2-3 2.5-3 4 0 1.5 1.5 2 3 2s3-.8 3-2" stroke="#fef3c7" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  blood: `<svg class="w-3.5 h-3.5 text-rose-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  anchor: `<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="21"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
  scroll: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8a2 2 0 0 1 2 2v14a4 4 0 0 1-4 4H6a2 2 0 0 1-2-2V6a4 4 0 0 1 4-4Z"/><path d="M18 18H6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2Z"/><line x1="8" y1="7" x2="14" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  compass: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  soundOn: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  soundOff: `<svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  info: `<svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  alert: `<svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check: `<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  skull: `<svg class="w-12 h-12 text-rose-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`
};

// Device platform detection for adaptive draw distance and spawning density
function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 1024);
}

// Ship Upgrades Definition (6 branches, MAX 6 levels each = 36 levels total)
const UPGRADE_CONFIG = {
  hull: {
    name: "Lambung Kapal (Armor & HP)",
    iconKey: "hull",
    maxLevel: 6,
    baseCost: 35,
    costMult: 1.85,
    bloodCostStart: 2, // Lv.3+ requires Blood Essence!
    desc: "Meningkatkan ketahanan maksimum kapal dari tembakan dan tabrakan."
  },
  speed: {
    name: "Layar & Kemudi (Kecepatan)",
    iconKey: "speed",
    maxLevel: 6,
    baseCost: 30,
    costMult: 1.8,
    bloodCostStart: 3, // Lv.4+ requires Blood Essence
    desc: "Menambah kelincahan putar kemudi dan laju kecepatan layar."
  },
  cannons: {
    name: "Baterai Meriam Sisi (Daya Hancur)",
    iconKey: "cannons",
    maxLevel: 6,
    baseCost: 45,
    costMult: 1.9,
    bloodCostStart: 2, // Lv.3+ requires Blood Essence!
    desc: "Menambah jumlah meriam lambung samping dan daya hancur peluru."
  },
  rearDefense: {
    name: "Pertahanan Buritan & Ranjau (Blind Spot)",
    iconKey: "rearDefense",
    maxLevel: 6,
    baseCost: 40,
    costMult: 1.85,
    bloodCostStart: 2, // Lv.3+ requires Blood Essence!
    desc: "Membuka meriam buritan & melepas ranjau mesiu terapung jika musuh mengekor."
  },
  stealthCamo: {
    name: "Layar Siluman & Kamuflase (Stealth)",
    iconKey: "stealthCamo",
    maxLevel: 6,
    baseCost: 35,
    costMult: 1.8,
    bloodCostStart: 3, // Lv.4+ requires Blood Essence
    desc: "Mempersempit jarak pandang musuh & memperlambat meteran ketahuan hingga 70%."
  },
  relicSiphon: {
    name: "Lentera Vampirisme (Life Steal)",
    iconKey: "relicSiphon",
    maxLevel: 6,
    baseCost: 55,
    costMult: 2.1,
    bloodCostStart: 2, // Lv.3+ requires Blood Essence!
    desc: "Menghisap darah kapal atau monster lawan untuk memulihkan lambung."
  }
};

const FOG_SECTOR_SIZE = 1200;

const MAP_UPGRADE_CONFIG = {
  1: {
    level: 1,
    name: "Peta Sketsa Nelayan",
    cost: 0,
    maxRadius: 22000,
    fogClearanceRadius: 2400,
    showTiers: [4],
    desc: "Bagan navigasi dasar mencatat Teluk Nusa Damai dan perairan senja awal (Ring 0 & 1)."
  },
  2: {
    level: 2,
    name: "Peta Pandu Perwira",
    cost: 150,
    maxRadius: 42000,
    fogClearanceRadius: 3600,
    showTiers: [3, 4],
    desc: "Bagan laut perwira menembus Selat Karang Besi dan pangkalan armada tempur (Ring 2)."
  },
  3: {
    level: 3,
    name: "Peta Samudra Kerajaan",
    cost: 400,
    maxRadius: 65000,
    fogClearanceRadius: 5200,
    showTiers: [2, 3, 4],
    desc: "Bagan resmi kerajaan melacak konvoi niaga dan kepulauan Sekte Kabut (Ring 3)."
  },
  4: {
    level: 4,
    name: "Peta Kartografi Abisal",
    cost: 850,
    maxRadius: 92000,
    fogClearanceRadius: 7500,
    showTiers: [1, 2, 3, 4],
    desc: "Gulungan navigasi terlarang membuka seluruh batas Laut Merah dan Pulau Tengkorak (Ring 4 & 5)."
  }
};

const MERCHANT_CONFIG = {
  cargo: {
    name: "Kapal Kargo Niaga",
    hp: 170,
    speed: 1.85,
    radius: 20,
    cargoLoot: 45
  },
  escort: {
    name: "Sekoci Pengawal Niaga",
    hp: 250,
    speed: 2.25,
    radius: 22,
    damage: 18,
    cargoLoot: 35
  }
};


const CLAN_LORE = {
  gold: {
    id: 'gold',
    name: "Sindikat Emas Batavia",
    species: "Manusia (Tirani Niaga)",
    badgeColor: "#d97706",
    bgClass: "from-amber-950/40 to-slate-900/80 border-amber-500/30",
    bulletColor: "#fbbf24",
    lore: "Kongsi dagang bengis yang memonopoli rempah dan emas. Mereka berpatroli di perairan pulau niaga dengan formasi kapal bersenjata kuningan presisi.",
    tiers: [
      { level: 1, name: "Kolek Cukai", hp: 55, speed: 2.3, damage: 10, radius: 24, desc: "Sekoci ringan pemburu upeti dengan layar tunggal bercorak emas." },
      { level: 2, name: "Korvet Pengawal Emas", hp: 140, speed: 2.5, damage: 18, radius: 30, desc: "Kapal perang lapis ganda dengan meriam samping kuningan dan patung singa emas." },
      { level: 3, name: "Benteng Terapung Batavia", hp: 360, speed: 2.8, damage: 28, radius: 40, desc: "Dreadnought raksasa bermahkota kaisar emas yang sanggup meratakan armada seketika." }
    ]
  },
  iron: {
    id: 'iron',
    name: "Pemburu Besi Hitam",
    species: "Manusia (Pandai Besi Brutal)",
    badgeColor: "#ea580c",
    bgClass: "from-orange-950/40 to-slate-900/80 border-orange-500/30",
    bulletColor: "#78716c",
    lore: "Klan pandai besi laut pemakan batubara. Menjaga pulau peleburan dengan lambung lapis baja, taji penabrak depan, dan kepulan cerobong uap hitam.",
    tiers: [
      { level: 1, name: "Sekoci Perisai Berduri", hp: 80, speed: 1.9, damage: 13, radius: 25, desc: "Perahu besi kusam dengan taji penusuk di haluan depan." },
      { level: 2, name: "Pembelah Karang Baja", hp: 200, speed: 2.2, damage: 22, radius: 32, desc: "Kapal lapis pelat besi dengan cerobong asap tunggal yang mengepulkan jelaga." },
      { level: 3, name: "Mesin Jagal Laut (Juggernaut)", hp: 460, speed: 2.4, damage: 34, radius: 42, desc: "Benteng besi raksasa dengan dua cerobong uap besar dan daya tahan tabrakan ekstrem." }
    ]
  },
  mist: {
    id: 'mist',
    name: "Sekte Kabut Kelabu",
    species: "Manusia (Pemuja Okultisme)",
    badgeColor: "#06b6d4",
    bgClass: "from-cyan-950/40 to-slate-900/80 border-cyan-500/30",
    bulletColor: "#22d3ee",
    lore: "Pemuja kutukan kabut yang menanggalkan nama mereka. Berpatroli di atol terpencil dengan lentera jiwa toska dan menembakkan orba arwah pelacak.",
    tiers: [
      { level: 1, name: "Sekoci Sesaji", hp: 65, speed: 2.4, damage: 14, radius: 24, desc: "Perahu kayu kelabu berlayar sobek dengan satu lentera jiwa berpendar hijau toska." },
      { level: 2, name: "Bahtera Arwah Gentayangan", hp: 165, speed: 2.7, damage: 24, radius: 31, desc: "Kapal bermastaka kerangka paus yang memancarkan kabut roh dingin di sekelilingnya." },
      { level: 3, name: "Katedral Tenggelam (Cursed Cathedra)", hp: 410, speed: 3.0, damage: 36, radius: 42, desc: "Kuil terapung seram penuh rusuk tulang belulang dengan mata arwah kembar yang menembakkan kutukan abadi." }
    ]
  },
  blood: {
    id: 'blood',
    name: "Legiun Palung Darah",
    species: "BUKAN MANUSIA (Abyssal Eldritch)",
    badgeColor: "#ef4444",
    bgClass: "from-red-950/60 to-slate-900/80 border-red-500/40",
    bulletColor: "#f43f5e",
    lore: "Organisme purba bukan manusia yang bangkit dari sarang pulau daging palung Laut Darah. Menyerang siapa saja dengan tentakel, duri kitin beracun, dan mulut raksasa.",
    tiers: [
      { level: 1, name: "Larva Daging Pengintai", hp: 110, speed: 3.0, damage: 18, radius: 26, desc: "Kutu parasit laut merah berduri kitin yang melata lincah di permukaan air." },
      { level: 2, name: "Ular Palung Daging (Hydra)", hp: 280, speed: 3.3, damage: 30, radius: 34, desc: "Monster bercabang tentakel dengan sirip berdarah dan duri penyemprot empedu beracun." },
      { level: 3, name: "Sang Pemangsa Jiwa (Ancient Leviathan)", hp: 650, speed: 3.6, damage: 45, radius: 46, desc: "Dewa purba palung terdalam dengan 6 mata merah membara, taring melingkar raksasa, dan tentakel cambuk yang mematikan." }
    ]
  },
  viking: {
    id: 'viking',
    name: "Klan Penakluk Viking",
    species: "Manusia (Norse Ice Raiders)",
    badgeColor: "#38bdf8",
    bgClass: "from-sky-950/40 to-slate-900/80 border-sky-500/30",
    bulletColor: "#7dd3fc",
    lore: "Pelaut tangguh dari samudra es utara yang mengarungi badai salju. Mereka menyerbu dengan drakkar berdayung cepat, benteng perisai kayu berlapis es, dan kapak es pembelah haluan.",
    tiers: [
      { level: 1, name: "Snekkja Salju", hp: 70, speed: 2.5, damage: 12, radius: 24, desc: "Perahu naga es ramping dengan 4 pasang dayung berirama dan haluan ukir kepala naga kayu." },
      { level: 2, name: "Skeid Pembantai Fjord", hp: 175, speed: 2.7, damage: 20, radius: 31, desc: "Kapal perang fjord lapis perisai ganda dengan 6 pasang dayung, taji es depan, dan layar kotak bergaris." },
      { level: 3, name: "Drakkar Jarl Raksasa", hp: 440, speed: 3.1, damage: 32, radius: 42, desc: "Drakkar perang legendaris sang Jarl dengan 8 pasang dayung, taring mammoth penusuk, dan kepala naga kembar bertanduk emas." }
    ]
  },
  wokou: {
    id: 'wokou',
    name: "Perompak Jung Wokou",
    species: "Manusia (Oriental Junk Pirates)",
    badgeColor: "#e11d48",
    bgClass: "from-rose-950/40 to-slate-900/80 border-rose-500/30",
    bulletColor: "#fb7185",
    lore: "Perompak samudra timur yang menguasai seni mesiu kembang api dan panah roket. Mereka bermanuver lincah menggunakan layar bertulang bambu dan melancarkan salvo roket yang membakar lautan.",
    tiers: [
      { level: 1, name: "Sampan Roket Api", hp: 60, speed: 2.7, damage: 11, radius: 23, desc: "Sampan oriental bersayap tunggal layar batten bambu dengan peluncur panah roket haluan." },
      { level: 2, name: "Jung Perang Wokou", hp: 155, speed: 2.6, damage: 19, radius: 30, desc: "Kapal perang bertiang dua dengan lentera merah berayun, geladak buritan tinggi, dan meriam mesiu samping." },
      { level: 3, name: "Benteng Jung Kaisar Naga", hp: 400, speed: 2.9, damage: 30, radius: 41, desc: "Benteng terapung bertiang 3 bertingkat pagoda megah, berhaluan naga emas, dengan baterai roket kembar yang mematikan." }
    ]
  }
};

const WORLD_GEN_KEY = 'BLOOD_SEA_WORLD_GEN_v1';
let currentWorldGenSeed = 104928;
let currentWorldGenNumber = 1;

// Player Spawn Point dynamically berthed at Home Port Pier
const PLAYER_SPAWN = { x: 28, y: -70, angle: -Math.PI / 2 };

// Phase 3: Multi-Layer Island Palettes & Procedural Biome Characteristics
const ISLAND_PALETTES = {
  haven: {
    sand: '#eab308',
    lowland: '#15803d',
    highland: '#14532d',
    reef: 'rgba(20, 184, 166, 0.35)',
    surf: 'rgba(255, 255, 255, 0.85)',
    propType: 'palm'
  },
  merchant: {
    sand: '#facc15',
    lowland: '#16a34a',
    highland: '#15803d',
    reef: 'rgba(45, 212, 191, 0.38)',
    surf: 'rgba(255, 255, 255, 0.85)',
    propType: 'market'
  },
  gold: { // Batavia
    sand: '#d97706',
    lowland: '#1e3a1e',
    highland: '#142a14',
    reef: 'rgba(13, 148, 136, 0.32)',
    surf: 'rgba(254, 243, 199, 0.75)',
    propType: 'batavia'
  },
  iron: { // Karang Besi
    sand: '#57534e',
    lowland: '#334155',
    highland: '#0f172a',
    reef: 'rgba(71, 85, 105, 0.38)',
    surf: 'rgba(226, 232, 240, 0.7)',
    propType: 'iron'
  },
  mist: { // Sekte Kabut
    sand: '#71717a',
    lowland: '#3f3f46',
    highland: '#18181b',
    reef: 'rgba(100, 116, 139, 0.35)',
    surf: 'rgba(192, 132, 252, 0.5)',
    propType: 'mist'
  },
  blood: { // Skull / Abisal
    sand: '#881337',
    lowland: '#4c0519',
    highland: '#1c0209',
    reef: 'rgba(225, 29, 72, 0.35)',
    surf: 'rgba(251, 113, 133, 0.65)',
    propType: 'blood'
  },
  viking: { // Snowy Fjord
    sand: '#f8fafc',
    lowland: '#cbd5e1',
    highland: '#475569',
    reef: 'rgba(56, 189, 248, 0.4)',
    surf: 'rgba(255, 255, 255, 0.9)',
    propType: 'viking'
  },
  wokou: { // Bamboo & Pagoda
    sand: '#fde047',
    lowland: '#15803d',
    highland: '#14532d',
    reef: 'rgba(13, 148, 136, 0.35)',
    surf: 'rgba(254, 240, 138, 0.75)',
    propType: 'wokou'
  },
  neutral: {
    sand: '#ca8a04',
    lowland: '#166534',
    highland: '#14532d',
    reef: 'rgba(20, 184, 166, 0.32)',
    surf: 'rgba(255, 255, 255, 0.75)',
    propType: 'palm'
  }
};

function getIslandPalette(isl) {
  if (isl.isSkullIsland || isl.isFlesh) return ISLAND_PALETTES.blood;
  if (isl.id === 'haven') return ISLAND_PALETTES.haven;
  if (isl.isShopIsland) return ISLAND_PALETTES.merchant;
  return ISLAND_PALETTES[isl.clan] || ISLAND_PALETTES.neutral;
}

// Organic Archipelago Islands: Procedurally Generated per World Generation
const WORLD_ISLANDS = [];

// Procedural Organic Coastline Formula: Returns exact radius at any angle theta
function getIslandRadiusAt(isl, angle) {
  const seed = isl.seed || 3.14;
  const wave1 = Math.sin(angle * 3 + seed) * (isl.radius * 0.12);
  const wave2 = Math.cos(angle * 5 + seed * 1.7) * (isl.radius * 0.08);
  const wave3 = Math.sin(angle * 7 - seed * 2.3) * (isl.radius * 0.04);
  const wave4 = Math.cos(angle * 2 - seed * 0.9) * (isl.radius * 0.06);
  return isl.radius + wave1 + wave2 + wave3 + wave4;
}

// Pseudo-Random Number Generator (PRNG - Mulberry32 for deterministic generational maps)
function createSeededRng(seed) {
  let s = Math.abs(typeof seed === 'number' ? seed : (function(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i) | 0;
    return Math.abs(hash) || 12345;
  })(String(seed)));
  return function() {
    let t = s += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generational Archipelago Generator: Procedural Islands placed across Concentric Ocean Rings
function generateGenerationalWorld(seed, genNumber) {
  if (seed === undefined || seed === null) {
    seed = Math.floor(Math.random() * 10000000) + 1;
  }
  if (genNumber === undefined || genNumber === null) {
    genNumber = currentWorldGenNumber || 1;
  }

  currentWorldGenSeed = seed;
  currentWorldGenNumber = genNumber;

  const rng = createSeededRng(seed);
  WORLD_ISLANDS.length = 0;

  // Collision-free placement helper ensuring wide open sea lanes
  function placeIsland(template, minDist, maxDist, baseAngle, angleSpread) {
    let bestX = 0;
    let bestY = 0;
    let bestRadius = template.minRadius || 250;
    let placed = false;

    for (let attempt = 0; attempt < 36; attempt++) {
      const ang = baseAngle + (rng() - 0.5) * angleSpread;
      const dist = minDist + rng() * (maxDist - minDist);
      const candX = Math.cos(ang) * dist;
      const candY = Math.sin(ang) * dist;
      const candRad = template.minRadius + Math.floor(rng() * (template.maxRadius - template.minRadius));

      let overlap = false;
      for (let i = 0; i < WORLD_ISLANDS.length; i++) {
        const other = WORLD_ISLANDS[i];
        const d = Math.hypot(candX - other.x, candY - other.y);
        if (d < candRad + other.radius + 320) {
          overlap = true;
          break;
        }
      }

      if (!overlap) {
        bestX = candX;
        bestY = candY;
        bestRadius = candRad;
        placed = true;
        break;
      }
    }

    if (!placed) {
      const ang = baseAngle + (WORLD_ISLANDS.length * 0.45);
      const dist = minDist + 120;
      bestX = Math.cos(ang) * dist;
      bestY = Math.sin(ang) * dist;
      bestRadius = template.minRadius;
    }

    const seedVal = Math.round((rng() * 990 + 10) * 10) / 10;
    const dockAng = template.dockAngle !== undefined 
      ? template.dockAngle 
      : (Math.atan2(-bestY, -bestX) + (rng() - 0.5) * 0.8);

    const islandObj = {
      id: template.id,
      name: template.name,
      clan: template.clan,
      tier: template.tier !== undefined ? template.tier : 4,
      isShopIsland: Boolean(template.isShopIsland),
      isHomePort: Boolean(template.isHomePort),
      isConquered: Boolean(template.isConquered),
      x: Math.round(bestX),
      y: Math.round(bestY),
      radius: bestRadius,
      seed: seedVal,
      color: template.color,
      hasLighthouse: template.hasLighthouse !== undefined ? Boolean(template.hasLighthouse) : (Boolean(template.isShopIsland) || (template.tier !== undefined && template.tier <= 2)),
      hasFortress: Boolean(template.hasFortress),
      hasSmokestack: Boolean(template.hasSmokestack),
      hasOccultCircle: Boolean(template.hasOccultCircle),
      hasLonghouse: Boolean(template.hasLonghouse),
      hasTorii: Boolean(template.hasTorii),
      hasPagoda: Boolean(template.hasPagoda),
      isFlesh: Boolean(template.isFlesh),
      isSkullIsland: Boolean(template.isSkullIsland),
      dockAngle: dockAng,
      desc: template.desc || ""
    };

    islandObj.dockDist = Math.round(getIslandRadiusAt(islandObj, islandObj.dockAngle) - 18);

    // Invalidate multi-layer geometry cache for renderer to compute fresh spline once
    islandObj._cachedOuter = null;
    islandObj._cachedInner = null;
    islandObj._cachedReef = null;
    islandObj._cachedHill = null;
    islandObj._cachedProps = null;
    islandObj._cachedLighthouse = null;
    islandObj._cachedPier = null;
    islandObj._cachedFoliage = null;
    islandObj._cachedSkulls = null;
    islandObj._cachedRibs = null;

    WORLD_ISLANDS.push(islandObj);
    return islandObj;
  }

  // 1. RING 0: Home Port (Nusa Damai - Haven)
  const havenDist = 160 + rng() * 60;
  const havenAng = Math.PI * 0.5 + (rng() - 0.5) * 0.5; // Southern calm quadrant
  const havenRad = 230 + Math.floor(rng() * 30);
  const havenDockAng = -Math.PI * 0.5 + (rng() - 0.5) * 0.3; // Northern open pier
  const havenSeed = Math.round((rng() * 80 + 20) * 10) / 10;

  const haven = {
    id: 'haven',
    name: "Nusa Damai - Pelabuhan Asal",
    clan: 'neutral',
    tier: 0,
    isHomePort: true,
    isConquered: true,
    x: Math.round(Math.cos(havenAng) * havenDist),
    y: Math.round(Math.sin(havenAng) * havenDist),
    radius: havenRad,
    seed: havenSeed,
    color: '#166534',
    sandColor: '#ca8a04',
    hasLighthouse: true,
    dockAngle: havenDockAng,
    desc: "Pangkalan armada Anda di Laut Tenang. Tempat berlabuh aman dengan galangan kapal."
  };
  haven.dockDist = Math.round(getIslandRadiusAt(haven, haven.dockAngle) - 18);
  haven._cachedOuter = null;
  haven._cachedInner = null;
  haven._cachedReef = null;
  haven._cachedHill = null;
  haven._cachedProps = null;
  haven._cachedLighthouse = null;
  haven._cachedPier = null;
  haven._cachedFoliage = null;
  WORLD_ISLANDS.push(haven);

  // Update dynamic player spawn aligned at Haven pier
  PLAYER_SPAWN.x = Math.round(haven.x + Math.cos(haven.dockAngle) * (haven.dockDist + 45));
  PLAYER_SPAWN.y = Math.round(haven.y + Math.sin(haven.dockAngle) * (haven.dockDist + 45));
  PLAYER_SPAWN.angle = haven.dockAngle;

  // 1.5. RING 0 (Outer Calm Waters): Peaceful Outlying Atolls (2000 - 7500m)
  placeIsland({
    id: 'haven_atoll_1',
    name: "Atol Nelayan Damai",
    clan: 'neutral',
    tier: 4,
    minRadius: 180,
    maxRadius: 220,
    color: '#166534',
    sandColor: '#fde047',
    desc: "Atol persinggahan nelayan Nusa Damai tempat menjemur jala dan mengisi air tawar."
  }, 2800, 4500, Math.PI * 0.15, Math.PI * 0.7);

  placeIsland({
    id: 'haven_atoll_2',
    name: "Pulau Karang Kelapa",
    clan: 'neutral',
    tier: 4,
    minRadius: 190,
    maxRadius: 240,
    color: '#15803d',
    sandColor: '#facc15',
    desc: "Pulau kecil berpasir putih penanda batas luar Teluk Damai sebelum memasuki perairan berombak."
  }, 5000, 7200, Math.PI * 0.65, Math.PI * 0.8);

  // 2. RING 1: Perairan Senja Berombak (8000 - 22000m)
  // Shop Island 1: Pasar Apung Senja (Trading Outpost Ring 1)
  placeIsland({
    id: 'shop_haven_senja',
    name: "Pasar Apung Senja",
    clan: 'merchant',
    tier: 0,
    isShopIsland: true,
    isConquered: true,
    minRadius: 180,
    maxRadius: 220,
    color: '#15803d',
    sandColor: '#fde047',
    desc: "Bandar terapung para saudagar rempah dengan galangan kapal & perbekalan lengkap."
  }, 11000, 15000, Math.PI * 0.95, Math.PI * 0.7);

  // Batavia Outpost (Gold Clan, Tier 3)
  placeIsland({
    id: 'batavia_outpost',
    name: "Benteng Niaga Batavia",
    clan: 'gold',
    tier: 3,
    minRadius: 320,
    maxRadius: 380,
    color: '#1e3a1e',
    sandColor: '#d97706',
    hasFortress: true,
    desc: "Pangkalan markas Klan Sindikat Emas dengan gudang rempah megah."
  }, 13000, 17500, Math.PI * 0.25, Math.PI * 0.7);

  // Iron Forge Isle (Iron Clan, Tier 3)
  placeIsland({
    id: 'iron_forge_isle',
    name: "Pulau Peleburan Besi Hitam",
    clan: 'iron',
    tier: 3,
    minRadius: 320,
    maxRadius: 370,
    color: '#334155',
    sandColor: '#57534e',
    hasSmokestack: true,
    desc: "Pabrik taji besi klan pemburu berbatu tajam dengan dermaga berjelaga."
  }, 14000, 18500, Math.PI * 1.25, Math.PI * 0.7);

  // Merchant Key / Free Trading Atoll (Tier 4)
  const innerKeyNames = ["Pos Cukai Selat Batavia", "Karang Saudagar Bebas", "Dermaga Rempah Emas"];
  placeIsland({
    id: 'merchant_key',
    name: innerKeyNames[Math.floor(rng() * innerKeyNames.length)],
    clan: rng() > 0.4 ? 'gold' : 'neutral',
    tier: 4,
    minRadius: 230,
    maxRadius: 280,
    color: '#1e3a1e',
    sandColor: '#ca8a04',
    desc: "Pos niaga persinggahan kapal dagang di perairan senja."
  }, 9500, 14000, Math.PI * 1.85, Math.PI * 0.8);

  // Batavia Spice Cove (Tier 4)
  placeIsland({
    id: 'batavia_cove',
    name: "Teluk Rempah Batavia",
    clan: 'gold',
    tier: 4,
    minRadius: 240,
    maxRadius: 290,
    color: '#166534',
    sandColor: '#d97706',
    desc: "Dermaga transit rempah dan perbekalan armada niaga emas."
  }, 16000, 21000, rng() * Math.PI * 2, Math.PI * 0.85);

  // Wokou Bamboo Cove (Wokou Clan, Tier 3)
  placeIsland({
    id: 'wokou_bamboo_cove',
    name: "Teluk Bambu Naga Wokou",
    clan: 'wokou',
    tier: 3,
    minRadius: 300,
    maxRadius: 360,
    color: '#15803d',
    sandColor: '#fde047',
    hasTorii: true,
    hasPagoda: true,
    desc: "Pangkalan persembunyian jung bajak laut Wokou di balik rumpun bambu lebat dan gerbang Torii merah."
  }, 15000, 20500, Math.PI * 0.65, Math.PI * 0.7);

  // 3. RING 2: Selat Badai Karang Besi (22000 - 42000m)
  // Shop Island 2: Bandar Dagang Karang Tengah (Trading Outpost Ring 2)
  placeIsland({
    id: 'shop_karang_tengah',
    name: "Bandar Dagang Karang Tengah",
    clan: 'merchant',
    tier: 0,
    isShopIsland: true,
    isConquered: true,
    minRadius: 180,
    maxRadius: 220,
    color: '#0d9488',
    sandColor: '#facc15',
    desc: "Pos niaga persinggahan bebas di selat badai. Tempat berlabuh aman bagi para pengembara."
  }, 26000, 32000, -Math.PI * 0.25, Math.PI * 0.8);

  // Shark Reef (Iron Clan Forward Outpost, Tier 2)
  placeIsland({
    id: 'shark_reef',
    name: "Karang Gigi Hiu",
    clan: 'iron',
    tier: 2,
    minRadius: 290,
    maxRadius: 350,
    color: '#1e293b',
    sandColor: '#475569',
    hasSmokestack: true,
    desc: "Pos depan penjaga selat barat berkarang curam dan berombak ganas."
  }, 24000, 31000, -Math.PI * 0.6, Math.PI * 0.8);

  // Pirate Stronghold (Tier 2)
  const pirateNames = ["Karang Badai Tengkorak", "Teluk Penyamun Gelap", "Atol Arwah Kelabu", "Karang Pembakar Laut"];
  placeIsland({
    id: 'pirate_stronghold',
    name: pirateNames[Math.floor(rng() * pirateNames.length)],
    clan: rng() > 0.5 ? 'mist' : 'iron',
    tier: 2,
    minRadius: 280,
    maxRadius: 340,
    color: '#1e293b',
    sandColor: '#334155',
    desc: "Tempat persembunyian rahasia armada perompak samudra."
  }, 33000, 40000, Math.PI * 1.5, Math.PI * 0.9);

  // Iron West Bastion (Tier 2)
  placeIsland({
    id: 'iron_west_bastion',
    name: "Benteng Karang Besi Barat",
    clan: 'iron',
    tier: 2,
    minRadius: 310,
    maxRadius: 360,
    color: '#334155',
    sandColor: '#64748b',
    hasFortress: true,
    hasSmokestack: true,
    desc: "Kubu pertahanan utama Karang Besi dengan meriam baterai berat."
  }, 29000, 37000, Math.PI * 0.8, Math.PI * 0.8);

  // Viking Snowy Fjord Isle (Viking Clan, Tier 2)
  placeIsland({
    id: 'viking_fjord_isle',
    name: "Fjord Salju Jarl Viking",
    clan: 'viking',
    tier: 2,
    minRadius: 320,
    maxRadius: 380,
    color: '#cbd5e1',
    sandColor: '#f8fafc',
    hasLonghouse: true,
    desc: "Pangkalan dingin para perompak salju Norse dengan dermaga drakkar, rumah panjang, dan prasasti runik."
  }, 27000, 35000, Math.PI * 0.3, Math.PI * 0.8);

  // Wokou Red Pagoda Isle (Wokou Clan, Tier 2)
  placeIsland({
    id: 'wokou_red_pagoda',
    name: "Pulau Paviliun Jung Merah",
    clan: 'wokou',
    tier: 2,
    minRadius: 310,
    maxRadius: 370,
    color: '#166534',
    sandColor: '#fde047',
    hasTorii: true,
    hasPagoda: true,
    desc: "Kuil terapung para nakhoda bajak laut Wokou bersenjatakan baterai roket mesiu dan lentera merah."
  }, 31000, 39000, -Math.PI * 0.8, Math.PI * 0.8);

  // 4. RING 3: Perairan Kutukan Sekte Kabut (42000 - 62000m)
  // Shop Island 3: Pos Niaga Ambang Kabut (Trading Outpost Ring 3)
  placeIsland({
    id: 'shop_ambang_kabut',
    name: "Pos Niaga Ambang Kabut",
    clan: 'merchant',
    tier: 0,
    isShopIsland: true,
    isConquered: true,
    minRadius: 180,
    maxRadius: 210,
    color: '#334155',
    sandColor: '#cbd5e1',
    desc: "Bazar terapung terakhir para penyelundup sebelum menembus batas Laut Merah."
  }, 44000, 51000, Math.PI * 1.8, Math.PI * 0.8);

  // Viking Frost Bastion (Viking Clan, Tier 2)
  placeIsland({
    id: 'viking_frost_bastion',
    name: "Benteng Es Drakkar Abadi",
    clan: 'viking',
    tier: 2,
    minRadius: 340,
    maxRadius: 400,
    color: '#94a3b8',
    sandColor: '#f8fafc',
    hasLonghouse: true,
    hasFortress: true,
    desc: "Kubu pertahanan terkuat Klan Viking di perairan glasial sebelum gerbang palung merah."
  }, 47000, 56000, -Math.PI * 0.15, Math.PI * 0.85);

  // Mist Atoll (Mist Clan Occult Sanctuary, Tier 2)
  placeIsland({
    id: 'mist_atoll',
    name: "Atol Tulang Belulang Kabut",
    clan: 'mist',
    tier: 2,
    minRadius: 360,
    maxRadius: 430,
    color: '#134e4a',
    sandColor: '#475569',
    hasOccultCircle: true,
    desc: "Lingkaran karang mistis tempat Sekte Kabut merapalkan kutukan arwah."
  }, 46000, 55000, Math.PI * 0.8, Math.PI * 0.9);

  // Ghost Reef (Atol Arwah Kabut, Tier 2)
  placeIsland({
    id: 'ghost_atoll',
    name: "Karang Arwah Berkabut",
    clan: 'mist',
    tier: 2,
    minRadius: 270,
    maxRadius: 330,
    color: '#0f2926',
    sandColor: '#334155',
    desc: "Gugusan karang sunyi di perairan kabut yang sering memikat kapal terdampar."
  }, 51000, 59000, rng() * Math.PI * 2, Math.PI * 0.85);

  // Mist Pagoda Isle (Tier 2)
  placeIsland({
    id: 'mist_pagoda_isle',
    name: "Kuil Pagoda Roh Kabut",
    clan: 'mist',
    tier: 2,
    minRadius: 320,
    maxRadius: 380,
    color: '#1e1b4b',
    sandColor: '#64748b',
    hasOccultCircle: true,
    desc: "Kuil keramat persembunyian tetua Sekte Kabut dengan lentera jiwa ungu."
  }, 43000, 53000, -Math.PI * 0.45, Math.PI * 0.85);

  // 5. RING 4 & 5: Gerbang Palung Neraka & LAUT MERAH (62000 - 86000m - ~7 Menit Pelayaran Penuh)
  // Shop Island 4: Dermaga Ambang Laut Merah
  placeIsland({
    id: 'shop_blood_brink',
    name: "Dermaga Ambang Laut Merah",
    clan: 'merchant',
    tier: 0,
    isShopIsland: true,
    isConquered: true,
    minRadius: 180,
    maxRadius: 210,
    color: '#4c0519',
    sandColor: '#fda4af',
    desc: "Pelabuhan terisolasi di bibir palung merah tempat para pemburu monster abisal mempersiapkan peluru."
  }, 64000, 70000, Math.PI * 0.35, Math.PI * 0.7);

  // Bone Reef (Tier 1)
  placeIsland({
    id: 'bone_reef',
    name: "Gugusan Karang Belulang",
    clan: 'blood',
    tier: 1,
    minRadius: 310,
    maxRadius: 370,
    color: '#1c1917',
    sandColor: '#f1f5f9',
    isSkullIsland: true,
    desc: "Gugusan karang tulang gading purba yang menjulang di batas awal Laut Merah."
  }, 67000, 73000, rng() * Math.PI * 2, Math.PI * 0.85);

  // Abyssal Monolith (Tier 1)
  const abyssalNames = ["Palung Daging Menganga", "Altar Karang Berdarah", "Monolit Purba Abisal"];
  placeIsland({
    id: 'abyssal_monolith',
    name: abyssalNames[Math.floor(rng() * abyssalNames.length)],
    clan: 'blood',
    tier: 1,
    minRadius: 350,
    maxRadius: 410,
    color: '#3f0713',
    sandColor: '#9f1239',
    isFlesh: true,
    desc: "Tonjolan daging karang abisal berdenyut di kedalaman samudra darah."
  }, 70000, 76000, rng() * Math.PI * 2, Math.PI * 0.8);

  // SKULL ISLAND (Tier 1) - PUSAT LAUT MERAH (78000m)
  placeIsland({
    id: 'skull_island',
    name: "Pulau Tengkorak (Skull Island)",
    clan: 'blood',
    tier: 1,
    minRadius: 420,
    maxRadius: 480,
    color: '#1c1917',
    sandColor: '#f1f5f9',
    isSkullIsland: true,
    desc: "Pulau terkutuk yang terbentuk dari jutaan tumpukan tengkorak dan kerangka paus purba di tengah Laut Merah."
  }, 76000, 81000, rng() * Math.PI * 2, Math.PI * 0.85);

  // Hive Nest (Tier 1 - Ujung Abisal Samudra)
  placeIsland({
    id: 'hive_nest',
    name: "Sarang Induk Sang Pemangsa",
    clan: 'blood',
    tier: 1,
    minRadius: 460,
    maxRadius: 520,
    color: '#450a0a',
    sandColor: '#991b1b',
    isFlesh: true,
    desc: "Jantung terdalam Laut Darah tempat bertenggernya para raksasa abisal purba."
  }, 80000, 86000, rng() * Math.PI * 2, Math.PI * 0.8);

  return WORLD_ISLANDS;
}

// Initial bootstrap generation
generateGenerationalWorld(currentWorldGenSeed, currentWorldGenNumber);

// Global immersion variables (Zero-overhead navigation & state)
let windAngle = 0.5; // Dynamic ocean wind vector
let activeTreasureHint = null; // { x, y, name }
let hasEnteredBloodSeaThisRun = false;

const BIOME_STOPS = [
  { dist: 0,     name: "Laut Tenang - Teluk Nusa Damai",  waterA: [16, 85, 130], waterB: [10, 48, 90],  isBlood: false },
  { dist: 8000,  name: "Perairan Senja Berombak",        waterA: [14, 62, 105], waterB: [8, 34, 72],   isBlood: false },
  { dist: 22000, name: "Selat Badai Karang Besi",        waterA: [12, 38, 75],  waterB: [6, 20, 48],   isBlood: false },
  { dist: 42000, name: "Perairan Kutukan Sekte Kabut",   waterA: [46, 18, 70],  waterB: [22, 8, 42],   isBlood: false },
  { dist: 62000, name: "Gerbang Palung Neraka",          waterA: [105, 14, 38], waterB: [45, 6, 22],   isBlood: false },
  { dist: 75000, name: "LAUT MERAH (LAUT DARAH ABISAL)",  waterA: [155, 8, 24],  waterB: [72, 4, 16],   isBlood: true  }
];

const _biomeColorA = [0, 0, 0];
const _biomeColorB = [0, 0, 0];

function lerpColorOut(out, c1, c2, t) {
  out[0] = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  out[1] = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  out[2] = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return out;
}

let _cachedBiomeInfo = null;
let _cachedBiomeDist = -1;

function getBiomeInfo(dist) {
  const quantizedDist = Math.floor(dist / 50);
  if (quantizedDist === _cachedBiomeDist && _cachedBiomeInfo) return _cachedBiomeInfo;
  _cachedBiomeDist = quantizedDist;

  let idx = 0;
  for (let i = 0; i < BIOME_STOPS.length; i++) {
    if (dist >= BIOME_STOPS[i].dist) {
      idx = i;
    }
  }
  
  const curr = BIOME_STOPS[idx];
  const next = BIOME_STOPS[Math.min(idx + 1, BIOME_STOPS.length - 1)];

  let t = 0;
  if (next.dist > curr.dist) {
    t = Math.max(0, Math.min(1, (dist - curr.dist) / (next.dist - curr.dist)));
  }

  // Pre-allocate to avoid new objects
  lerpColorOut(_biomeColorA, curr.waterA, next.waterA, t);
  lerpColorOut(_biomeColorB, curr.waterB, next.waterB, t);

  const isBloodSea = dist >= 75000;
  const bloodRatio = Math.max(0, Math.min(1, (dist - 62000) / 13000));

  let displayName = curr.name;
  if (t > 0.6 && curr !== next) {
    displayName = `Menuju ${next.name}`;
  }

  // To truly avoid creating objects on EVERY call, 
  // if we return _cachedBiomeInfo, it must be the ONLY object we modify
  if (!_cachedBiomeInfo) {
    _cachedBiomeInfo = {
      name: displayName,
      waterA: [0, 0, 0],
      waterB: [0, 0, 0],
      bloodRatio,
      isBloodSea,
      dangerLevel: idx + 1
    };
  }

  _cachedBiomeInfo.name = displayName;
  _cachedBiomeInfo.waterA[0] = _biomeColorA[0];
  _cachedBiomeInfo.waterA[1] = _biomeColorA[1];
  _cachedBiomeInfo.waterA[2] = _biomeColorA[2];
  _cachedBiomeInfo.waterB[0] = _biomeColorB[0];
  _cachedBiomeInfo.waterB[1] = _biomeColorB[1];
  _cachedBiomeInfo.waterB[2] = _biomeColorB[2];
  _cachedBiomeInfo.bloodRatio = bloodRatio;
  _cachedBiomeInfo.isBloodSea = isBloodSea;
  _cachedBiomeInfo.dangerLevel = idx + 1;

  return _cachedBiomeInfo;
}

/* ==========================================================================
   DYNAMIC REGIONAL WEATHER & RANDOM ATMOSPHERIC EVENTS
   Distance-Gated Event Pools & Environmental Hazards (Strictly 0 Emoji)
   ========================================================================== */

const WEATHER_CONFIGS = {
  clear: {
    id: 'clear',
    name: 'Laut Tenang',
    subtext: 'Angin sepoi-sepoi dan perairan bersahabat',
    compassStatus: 'normal',
    color: '#38bdf8',
    rainDensity: 0,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false
  },
  overcast: {
    id: 'overcast',
    name: 'Langit Berawan',
    subtext: 'Awan tebal meredupkan cakrawala samudra',
    compassStatus: 'normal',
    color: '#94a3b8',
    rainDensity: 0,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false
  },
  rain: {
    id: 'rain',
    name: 'Hujan Samudra',
    subtext: 'Rintik hujan membasahi geladak, pengereman licin',
    compassStatus: 'normal',
    color: '#60a5fa',
    rainDensity: 1.0,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false
  },
  gale: {
    id: 'gale',
    name: 'Angin Kencang',
    subtext: 'Hembusan angin kencang menyeret haluan kapal',
    compassStatus: 'normal',
    color: '#a7f3d0',
    rainDensity: 0.2,
    hasWindDrift: true,
    windDriftMultiplier: 1.0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false
  },
  storm: {
    id: 'storm',
    name: 'Badai Gelombang',
    subtext: 'Ombak ganas bergulung dan hempasan angin liar',
    compassStatus: 'normal',
    color: '#38bdf8',
    rainDensity: 1.6,
    hasWindDrift: true,
    windDriftMultiplier: 1.3,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Badai Petir Maut',
    subtext: 'Kilat membelah langit, interferensi kompas terjadi',
    compassStatus: 'jitter',
    color: '#fef08a',
    rainDensity: 2.2,
    hasWindDrift: true,
    windDriftMultiplier: 1.5,
    hasLightning: true,
    hasBloodCorrosion: false,
    denseFog: false
  },
  mist: {
    id: 'mist',
    name: 'Kabut Halimun',
    subtext: 'Kabut mistis perairan kutukan menyelimuti laut',
    compassStatus: 'normal',
    color: '#c084fc',
    rainDensity: 0.1,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false
  },
  dense_fog: {
    id: 'dense_fog',
    name: 'Kabut Padat Abisal',
    subtext: 'Pandangan tertutup pekat, musuh terselubung misteri',
    compassStatus: 'blind',
    color: '#e2e8f0',
    rainDensity: 0,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: true
  },
  blood_tempest: {
    id: 'blood_tempest',
    name: 'Prahara Darah Neraka',
    subtext: 'Hujan darah korosif dan petir abisal merah',
    compassStatus: 'corrupted',
    color: '#ef4444',
    rainDensity: 2.8,
    isBlood: true,
    hasWindDrift: true,
    windDriftMultiplier: 1.8,
    hasLightning: true,
    hasBloodCorrosion: true,
    denseFog: true
  }
};

const ZONE_WEATHER_POOLS = [
  { maxDist: 8000,  weathers: ['overcast', 'rain', 'gale'] },
  { maxDist: 22000, weathers: ['overcast', 'rain', 'gale', 'storm'] },
  { maxDist: 42000, weathers: ['overcast', 'rain', 'gale', 'storm', 'thunderstorm'] },
  { maxDist: 62000, weathers: ['rain', 'gale', 'mist'] },
  { maxDist: 75000, weathers: ['dense_fog'] },
  { maxDist: Infinity, weathers: ['blood_tempest'] }
];

function getAvailableWeathersForDistance(dist) {
  for (let i = 0; i < ZONE_WEATHER_POOLS.length; i++) {
    if (dist < ZONE_WEATHER_POOLS[i].maxDist) {
      return ZONE_WEATHER_POOLS[i].weathers;
    }
  }
  return ['blood_tempest'];
}

