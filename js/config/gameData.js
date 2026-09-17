/* ==========================================================================
   LAUT DARAH - GAME CONFIGURATION DATA
   Upgrades, Clans, Lore, Islands, & Biome Constants (Emoji-Free / SVG Powered)
   ========================================================================== */

const SAVE_KEY = 'BLOOD_SEA_SAVE_DATA_v2';
const SETTINGS_KEY = 'BLOOD_SEA_SETTINGS_v2';

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

// Ship Upgrades Definition (6 branches, MAX 6 levels each = 36 levels total)
const UPGRADE_CONFIG = {
  hull: {
    name: "Lambung Kapal (Armor & HP)",
    iconKey: "hull",
    maxLevel: 6,
    baseCost: 35,
    costMult: 1.75,
    bloodCostStart: 3,
    desc: "Meningkatkan ketahanan maksimum kapal dari tembakan dan tabrakan."
  },
  speed: {
    name: "Layar & Kemudi (Kecepatan)",
    iconKey: "speed",
    maxLevel: 6,
    baseCost: 30,
    costMult: 1.7,
    bloodCostStart: 3,
    desc: "Menambah kelincahan putar kemudi dan laju kecepatan layar."
  },
  cannons: {
    name: "Baterai Meriam Sisi (Daya Hancur)",
    iconKey: "cannons",
    maxLevel: 6,
    baseCost: 45,
    costMult: 1.85,
    bloodCostStart: 4,
    desc: "Menambah jumlah meriam lambung samping dan daya hancur peluru."
  },
  rearDefense: {
    name: "Pertahanan Buritan & Ranjau (Blind Spot)",
    iconKey: "rearDefense",
    maxLevel: 6,
    baseCost: 40,
    costMult: 1.8,
    bloodCostStart: 3,
    desc: "Membuka meriam buritan & melepas ranjau mesiu terapung jika musuh mengekor."
  },
  stealthCamo: {
    name: "Layar Siluman & Kamuflase (Stealth)",
    iconKey: "stealthCamo",
    maxLevel: 6,
    baseCost: 35,
    costMult: 1.75,
    bloodCostStart: 3,
    desc: "Mempersempit jarak pandang musuh & memperlambat meteran ketahuan hingga 70%."
  },
  relicSiphon: {
    name: "Lentera Vampirisme (Life Steal)",
    iconKey: "relicSiphon",
    maxLevel: 6,
    baseCost: 55,
    costMult: 2.0,
    bloodCostStart: 2,
    desc: "Menghisap darah kapal atau monster lawan untuk memulihkan lambung."
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
  }
};

const WORLD_GEN_KEY = 'BLOOD_SEA_WORLD_GEN_v1';
let currentWorldGenSeed = 104928;
let currentWorldGenNumber = 1;

// Player Spawn Point dynamically berthed at Home Port Pier
const PLAYER_SPAWN = { x: 28, y: -70, angle: -Math.PI / 2 };

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
      x: Math.round(bestX),
      y: Math.round(bestY),
      radius: bestRadius,
      seed: seedVal,
      color: template.color,
      sandColor: template.sandColor,
      hasLighthouse: Boolean(template.hasLighthouse),
      hasFortress: Boolean(template.hasFortress),
      hasSmokestack: Boolean(template.hasSmokestack),
      hasOccultCircle: Boolean(template.hasOccultCircle),
      isFlesh: Boolean(template.isFlesh),
      dockAngle: dockAng,
      desc: template.desc || ""
    };

    islandObj.dockDist = Math.round(getIslandRadiusAt(islandObj, islandObj.dockAngle) - 18);

    // Invalidate geometry cache for renderer to compute fresh spline once
    islandObj._cachedOuter = null;
    islandObj._cachedInner = null;
    islandObj._cachedPier = null;
    islandObj._cachedFoliage = null;

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
  haven._cachedPier = null;
  haven._cachedFoliage = null;
  WORLD_ISLANDS.push(haven);

  // Update dynamic player spawn aligned at Haven pier
  PLAYER_SPAWN.x = Math.round(haven.x + Math.cos(haven.dockAngle) * (haven.dockDist + 45));
  PLAYER_SPAWN.y = Math.round(haven.y + Math.sin(haven.dockAngle) * (haven.dockDist + 45));
  PLAYER_SPAWN.angle = haven.dockAngle;

  // 2. RING 1: Perairan Senja Berombak (1400 - 3200m)
  // Batavia Outpost (Gold Clan, NE quadrant)
  placeIsland({
    id: 'batavia_outpost',
    name: "Benteng Niaga Batavia",
    clan: 'gold',
    minRadius: 310,
    maxRadius: 360,
    color: '#1e3a1e',
    sandColor: '#d97706',
    hasFortress: true,
    desc: "Pangkalan markas Klan Sindikat Emas dengan gudang rempah megah."
  }, 1400, 2100, Math.PI * 0.25, Math.PI * 0.7);

  // Iron Forge Isle (Iron Clan, SW quadrant)
  placeIsland({
    id: 'iron_forge_isle',
    name: "Pulau Peleburan Besi Hitam",
    clan: 'iron',
    minRadius: 320,
    maxRadius: 370,
    color: '#334155',
    sandColor: '#57534e',
    hasSmokestack: true,
    desc: "Pabrik taji besi klan pemburu berbatu tajam dengan dermaga berjelaga."
  }, 1500, 2200, Math.PI * 1.25, Math.PI * 0.7);

  // Merchant Key / Free Trading Atoll
  const innerKeyNames = ["Pos Cukai Selat Batavia", "Karang Saudagar Bebas", "Dermaga Rempah Emas"];
  placeIsland({
    id: 'merchant_key',
    name: innerKeyNames[Math.floor(rng() * innerKeyNames.length)],
    clan: rng() > 0.4 ? 'gold' : 'neutral',
    minRadius: 210,
    maxRadius: 260,
    color: '#1e3a1e',
    sandColor: '#ca8a04',
    desc: "Pos niaga persinggahan kapal dagang di perairan senja."
  }, 1700, 2600, Math.PI * 1.85, Math.PI * 0.8);

  // 3. RING 2 & 3: Selat Badai & Perairan Kutukan Kabut (3200 - 5500m)
  // Mist Atoll (Mist Clan Occult Sanctuary)
  placeIsland({
    id: 'mist_atoll',
    name: "Atol Tulang Belulang Kabut",
    clan: 'mist',
    minRadius: 340,
    maxRadius: 400,
    color: '#134e4a',
    sandColor: '#475569',
    hasOccultCircle: true,
    desc: "Lingkaran karang mistis tempat Sekte Kabut merapalkan kutukan arwah."
  }, 3400, 4600, Math.PI * 0.8, Math.PI * 0.9);

  // Shark Reef (Iron Clan Forward Outpost)
  placeIsland({
    id: 'shark_reef',
    name: "Karang Gigi Hiu",
    clan: 'iron',
    minRadius: 280,
    maxRadius: 330,
    color: '#1e293b',
    sandColor: '#475569',
    hasSmokestack: true,
    desc: "Pos depan penjaga selat barat berkarang curam dan berombak ganas."
  }, 3200, 4500, -Math.PI * 0.6, Math.PI * 0.8);

  // Pirate Stronghold / Ghost Key
  const pirateNames = ["Karang Badai Tengkorak", "Teluk Penyamun Gelap", "Atol Arwah Kelabu", "Karang Karang Pembakar Laut"];
  placeIsland({
    id: 'pirate_stronghold',
    name: pirateNames[Math.floor(rng() * pirateNames.length)],
    clan: rng() > 0.5 ? 'mist' : 'iron',
    minRadius: 260,
    maxRadius: 310,
    color: '#1e293b',
    sandColor: '#334155',
    desc: "Tempat persembunyian rahasia armada perompak samudra."
  }, 3800, 5200, Math.PI * 1.5, Math.PI * 0.9);

  // 4. RING 4 & 5: Gerbang Palung Abisal & LAUT DARAH (6500 - 9500m)
  // Cursed Spire (Blood Clan Flesh Island)
  placeIsland({
    id: 'cursed_spire',
    name: "Pulau Tengkorak Abisal",
    clan: 'blood',
    minRadius: 390,
    maxRadius: 440,
    color: '#4c0519',
    sandColor: '#881337',
    isFlesh: true,
    desc: "Gerbang Laut Darah. Daratan berdenyut dengan tumpukan tulang belulang kurban."
  }, 6600, 7800, rng() * Math.PI * 2, Math.PI * 0.8);

  // Hive Nest (Blood Clan Leviathan Mothership Spire)
  placeIsland({
    id: 'hive_nest',
    name: "Sarang Induk Sang Pemangsa",
    clan: 'blood',
    minRadius: 430,
    maxRadius: 490,
    color: '#450a0a',
    sandColor: '#991b1b',
    isFlesh: true,
    desc: "Jantung terdalam Laut Darah tempat bertenggernya para raksasa abisal purba."
  }, 8300, 9600, rng() * Math.PI * 2, Math.PI * 0.8);

  // Additional Abyssal Monolith
  const abyssalNames = ["Palung Daging Menganga", "Altar Karang Berdarah", "Monolit Purba Abisal"];
  placeIsland({
    id: 'abyssal_monolith',
    name: abyssalNames[Math.floor(rng() * abyssalNames.length)],
    clan: 'blood',
    minRadius: 330,
    maxRadius: 380,
    color: '#3f0713',
    sandColor: '#9f1239',
    isFlesh: true,
    desc: "Tonjolan daging karang abisal berdenyut di kedalaman samudra darah."
  }, 7300, 8900, rng() * Math.PI * 2, Math.PI * 0.8);

  return WORLD_ISLANDS;
}

// Initial bootstrap generation
generateGenerationalWorld(currentWorldGenSeed, currentWorldGenNumber);

const BIOME_STOPS = [
  { dist: 0,    name: "Laut Tenang",               waterA: [16, 85, 130], waterB: [10, 48, 90],  isBlood: false },
  { dist: 1400, name: "Perairan Senja Berombak",   waterA: [14, 62, 105], waterB: [8, 34, 72],   isBlood: false },
  { dist: 3200, name: "Selat Badai Bajak Laut",   waterA: [12, 38, 75],  waterB: [6, 20, 48],   isBlood: false },
  { dist: 5200, name: "Perairan Kutukan Kabut",   waterA: [46, 18, 70],  waterB: [22, 8, 42],   isBlood: false },
  { dist: 7000, name: "Gerbang Palung Abisal",     waterA: [98, 14, 38],  waterB: [42, 6, 22],   isBlood: true  },
  { dist: 8800, name: "LAUT DARAH (BLOOD SEA)",    waterA: [145, 10, 22], waterB: [65, 4, 15],   isBlood: true  }
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
  for (let i = 0; i < BIOME_STOPS.length - 1; i++) {
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

  const isBloodSea = dist >= 6500;
  const bloodRatio = Math.max(0, Math.min(1, (dist - 6200) / 2400));

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
