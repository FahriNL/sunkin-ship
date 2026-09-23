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

// Clean SVG Icon paths for Upgrades, Items, Cannons & UI elements (100% Vector - Zero Emojis)
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
  skull: `<svg class="w-12 h-12 text-rose-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`,
  
  // Survival Resources Icons (Thematic & Distinct)
  wood: `<svg class="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="4" cy="6" r="2" fill="currentColor"/><circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="4" cy="18" r="2" fill="currentColor"/><path d="M20 6c0 1.1-.9 2-2 2H6M20 12c0 1.1-.9 2-2 2H6M20 18c0 1.1-.9 2-2 2H6"/></svg>`,
  rope: `<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c3-4 6-4 9 0s6 4 9 0"/><path d="M4.5 11.5c3-4 6-4 9 0s6 4 9 0"/><path d="M4.5 6.5c3-4 6-4 9 0s6 4 9 0"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/></svg>`,
  iron: `<svg class="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="3,16 6,7 18,7 21,16" fill="rgba(148,163,184,0.25)"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="3" y1="16" x2="3" y2="19"/><line x1="21" y1="16" x2="21" y2="19"/><line x1="3" y1="19" x2="21" y2="19"/><line x1="7.5" y1="7" x2="5.5" y2="16"/><line x1="16.5" y1="7" x2="18.5" y2="16"/></svg>`,
  stone: `<svg class="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="5,18 2,12 7,5 16,3 21,9 19,19 12,21" fill="rgba(100,116,139,0.25)"/><line x1="7" y1="5" x2="12" y2="13"/><line x1="12" y1="13" x2="19" y2="19"/><line x1="12" y1="13" x2="5" y2="18"/></svg>`,
  bamboo: `<svg class="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="2" x2="8" y2="22"/><line x1="16" y1="2" x2="16" y2="22"/><rect x="6" y="7" width="4" height="2" rx="1" fill="currentColor"/><rect x="6" y="15" width="4" height="2" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="2" rx="1" fill="currentColor"/><rect x="14" y="13" width="4" height="2" rx="1" fill="currentColor"/><path d="M10 7c2-2 4-2 6-4M10 15c2-2 4-2 6-4"/></svg>`,
  mistOrb: `<svg class="w-6 h-6 text-cyan-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" fill="rgba(6,182,212,0.2)"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/><path d="M8 8a5.5 5.5 0 0 1 8 0M8 16a5.5 5.5 0 0 0 8 0"/><path d="M5 12h2M17 12h2"/></svg>`,
  snowOrb: `<svg class="w-6 h-6 text-sky-300 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="rgba(56,189,248,0.2)"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`,
  firePowder: `<svg class="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1 5H9L8 3z" fill="rgba(244,63,94,0.3)"/><path d="M7 8h10c2 4 2 9-1 12H8C5 17 5 12 7 8z" fill="rgba(244,63,94,0.2)"/><polygon points="12,12 13.5,15 11,15.5 12.5,18 10,18" fill="currentColor"/></svg>`,
  chitin: `<svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C9 7 4 12 4 18a8 8 0 0 0 16 0c0-6-5-11-8-16z" fill="rgba(225,29,72,0.2)"/><path d="M12 6v14M8 11l4 3 4-3M7 16l5 3 5-3"/></svg>`,

  // Faction Cannon Inventory Items Icons (Distinct Weapon Gear)
  cannon_standard: `<svg class="w-7 h-7 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 14 13-4 2 5-13 4z" fill="rgba(148,163,184,0.3)"/><circle cx="6" cy="18" r="3" fill="#78350f" stroke="#f59e0b"/><circle cx="15" cy="18" r="2.5" fill="#78350f" stroke="#f59e0b"/><line x1="16" y1="10" x2="22" y2="8"/><line x1="18" y1="15" x2="22" y2="13.5"/></svg>`,
  cannon_mist: `<svg class="w-7 h-7 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 13 12-4 2 5-12 4z" fill="rgba(6,182,212,0.35)"/><circle cx="6" cy="18" r="3" fill="#083344" stroke="#22d3ee"/><circle cx="17" cy="8" r="3" fill="#06b6d4" class="animate-pulse"/><path d="M18 5c2-2 4 0 3 3"/></svg>`,
  cannon_frost: `<svg class="w-7 h-7 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 13 12-4 2 5-12 4z" fill="rgba(56,189,248,0.3)"/><path d="M16 4l5 5-3 3-5-5z" fill="#0284c7" stroke="#7dd3fc"/><circle cx="6" cy="18" r="3" fill="#0c4a6e" stroke="#38bdf8"/><path d="M18 10l3-3M19 13l2-2"/></svg>`,
  cannon_wokou: `<svg class="w-7 h-7 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 15 12-5 2 4-12 5z" fill="rgba(244,63,94,0.3)"/><line x1="8" y1="6" x2="21" y2="3" stroke="#facc15" stroke-width="2"/><line x1="9" y1="9" x2="22" y2="6" stroke="#facc15" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="#881337" stroke="#f43f5e"/><line x1="19" y1="4" x2="22" y2="5"/></svg>`,
  cannon_chitin: `<svg class="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 14 13-5 2 6-13 4z" fill="rgba(190,18,60,0.4)"/><circle cx="6" cy="18" r="3" fill="#4c0519" stroke="#e11d48"/><path d="M14 6l7 3-2 3M16 11l4 2" stroke="#fda4af"/><circle cx="18" cy="8" r="1.5" fill="#f43f5e"/></svg>`,

  // UI Action & Thematic Icons
  inventory: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M3 11h18M12 11v3"/></svg>`,
  recipeBook: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="6" x2="16" y2="6"/><line x1="9" y1="10" x2="14" y2="10"/></svg>`,
  workshop: `<svg class="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  repair: `<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.36 6.36"/><path d="m11 5 4 4"/></svg>`,
  trash: `<svg class="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  equip: `<svg class="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  unequip: `<svg class="w-3.5 h-3.5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
};

// Maximum cargo slots capacity for the ship's hold
const MAX_CARGO_SLOTS = 16;

// Survival Resource Items Configuration (Strict Vector & Semantic Categories)
const RESOURCE_TYPES = {
  wood: {
    id: 'wood',
    name: 'Kayu Gelondong',
    category: 'Bahan Baku',
    rarity: 'Umum',
    desc: 'Kayu jati gelondong kuat. Bahan primer reparasi lambung dan struktur dudukan meriam.',
    color: '#b45309',
    icon: 'wood',
    iconKey: 'wood',
    baseCost: 3,
    dropSource: 'Peti Apung & Kapal Karam'
  },
  rope: {
    id: 'rope',
    name: 'Tali Rami',
    category: 'Bahan Baku',
    rarity: 'Umum',
    desc: 'Pintalan serat rami laut. Pengikat tambatan layar, lashing meriam, dan reparasi cepat.',
    color: '#d97706',
    icon: 'rope',
    iconKey: 'rope',
    baseCost: 4,
    dropSource: 'Peti Terapung Samudra'
  },
  iron: {
    id: 'iron',
    name: 'Pelat Besi Baja',
    category: 'Bahan Baku',
    rarity: 'Biasa',
    desc: 'Logam tempa balok baja. Komponen utama selongsong meriam berat dan penguat struktur.',
    color: '#94a3b8',
    icon: 'iron',
    iconKey: 'iron',
    baseCost: 7,
    dropSource: 'Bangkai Kapal Dagang & Menara'
  },
  stone: {
    id: 'stone',
    name: 'Bongkahan Batu',
    category: 'Bahan Baku',
    rarity: 'Umum',
    desc: 'Batu granit padat dari tebing pulau. Pemberat balast kapal dan fondasi pertahanan cadas.',
    color: '#64748b',
    icon: 'stone',
    iconKey: 'stone',
    baseCost: 2,
    dropSource: 'Tebing Pulau Karang & Reruntuhan'
  },
  bamboo: {
    id: 'bamboo',
    name: 'Batang Bambu',
    category: 'Bahan Baku',
    rarity: 'Khusus',
    desc: 'Bambu oriental lentur dan tahan api. Selongsong baterai roket salvo armada Wokou.',
    color: '#84cc16',
    icon: 'bamboo',
    iconKey: 'bamboo',
    baseCost: 5,
    dropSource: 'Kapal Bajak Laut Wokou'
  },
  mistOrb: {
    id: 'mistOrb',
    name: 'Orb Kabut Gaib',
    category: 'Artefak Faksi',
    rarity: 'Mistik',
    desc: 'Esensi roh berdenyut gaib. Menghidupkan meriam berpelacak roh otomatis (Homing).',
    color: '#06b6d4',
    icon: 'mistOrb',
    iconKey: 'mistOrb',
    baseCost: 45,
    isSpecial: true,
    dropSource: 'Kapal & Menara Sekte Kabut'
  },
  snowOrb: {
    id: 'snowOrb',
    name: 'Orb Salju Fjord',
    category: 'Artefak Faksi',
    rarity: 'Mistik',
    desc: 'Kristal es abadi samudra utara. Membekukan dan melumpuhkan kecepatan kapal musuh.',
    color: '#38bdf8',
    icon: 'snowOrb',
    iconKey: 'snowOrb',
    baseCost: 45,
    isSpecial: true,
    dropSource: 'Drakkar & Ballista Viking'
  },
  firePowder: {
    id: 'firePowder',
    name: 'Bubuk Mesiu Api',
    category: 'Artefak Faksi',
    rarity: 'Eksotis',
    desc: 'Bubuk mesiu mesiu merah peledak. Menghasilkan ledakan beruntun roket salvo.',
    color: '#f43f5e',
    icon: 'firePowder',
    iconKey: 'firePowder',
    baseCost: 30,
    isSpecial: true,
    dropSource: 'Jung Meriam Wokou'
  },
  chitin: {
    id: 'chitin',
    name: 'Cangkang Kitin',
    category: 'Artefak Abisal',
    rarity: 'Abisal',
    desc: 'Duri pelindung keras beracun. Menembakkan duri asam korosif penembus baja lambung.',
    color: '#e11d48',
    icon: 'chitin',
    iconKey: 'chitin',
    baseCost: 25,
    isSpecial: true,
    dropSource: 'Monster Palung Laut Darah'
  }
};

// Craftable Faction Cannons Configuration (Durability & Weapon Types)
const CANNON_TYPES = {
  standard: {
    id: 'standard',
    name: 'Meriam Besi Standar',
    subtitle: 'Arsenil Angkatan Laut Klasik',
    factionName: 'Angkatan Laut',
    desc: 'Meriam peluru besi cor klasik. Handal, stabil, dan berdaya hancur fisik mantap.',
    maxDurability: 90,
    damage: 22,
    projectileType: 'cannonball',
    color: '#94a3b8',
    itemIconKey: 'cannon_standard',
    recipe: { wood: 8, iron: 5, rope: 3 },
    isOrbSpecial: false // Jika aus (durability 0), bisa diperbaiki di pelabuhan
  },
  mist: {
    id: 'mist',
    name: 'Meriam Arwah Kabut',
    subtitle: 'Senjata Gaib Sekte Kabut',
    factionName: 'Sekte Kabut',
    desc: 'Meriam mistis bermahkota lentera toska. Menembakkan proyektil roh berpelacak otomatis (Homing Wisps).',
    maxDurability: 70,
    damage: 24,
    projectileType: 'spirit',
    color: '#06b6d4',
    itemIconKey: 'cannon_mist',
    recipe: { wood: 8, iron: 4, mistOrb: 2 },
    isOrbSpecial: true // Jika aus (durability 0), langsung pecah hancur & sirna!
  },
  frost: {
    id: 'frost',
    name: 'Pelontar Es Viking',
    subtitle: 'Artileri Badai Salju Norse',
    factionName: 'Klan Viking',
    desc: 'Pelontar berukir runik samudra utara. Menembakkan kapak es berputar yang memperlambat musuh (Slow 40%).',
    maxDurability: 75,
    damage: 26,
    projectileType: 'frost_axe',
    color: '#38bdf8',
    itemIconKey: 'cannon_frost',
    recipe: { wood: 8, iron: 5, snowOrb: 2 },
    isOrbSpecial: true // Sirna ketika durability habis
  },
  wokou: {
    id: 'wokou',
    name: 'Baterai Roket Bambu',
    subtitle: 'Teknologi Api Timur Wokou',
    factionName: 'Jung Wokou',
    desc: 'Peluncur roket oriental berlapis bambu. Meluncurkan salvo 3 panah roket api beruntun dengan percikan membakar.',
    maxDurability: 65,
    damage: 20,
    burstCount: 3,
    projectileType: 'rocket_arrow',
    color: '#f43f5e',
    itemIconKey: 'cannon_wokou',
    recipe: { bamboo: 10, iron: 4, firePowder: 2 },
    isOrbSpecial: true // Sirna ketika durability habis
  },
  chitin: {
    id: 'chitin',
    name: 'Penyembur Duri Kitin',
    subtitle: 'Organ Biologis Palung Darah',
    factionName: 'Palung Abisal',
    desc: 'Moncong organik berduri kitin tajam. Menembakkan duri beracun yang mengikis lambung musuh secara berkala.',
    maxDurability: 80,
    damage: 28,
    projectileType: 'spike',
    color: '#e11d48',
    itemIconKey: 'cannon_chitin',
    recipe: { wood: 6, chitin: 8, bloodEssence: 4 },
    isOrbSpecial: true // Sirna ketika durability habis
  }
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
    name: "Kapasitas Slot Meriam (Cannon Slots)",
    iconKey: "cannons",
    maxLevel: 6,
    baseCost: 45,
    costMult: 1.9,
    bloodCostStart: 2, // Lv.3+ requires Blood Essence!
    desc: "Membuka slot tambahan untuk memasang meriam hasil kerajinan pada sisi kapal (Hingga 4 slot per sisi)."
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
CLAN_LORE.batavia = CLAN_LORE.gold;

// Island Conquest Reinforcement Parameters by Island Tier
const CONQUEST_REINFORCEMENT_CONFIG = {
  4: {
    waves: 1,
    totalWaves: 1,
    interval: 14.0,
    waveInterval: 14.0,
    countPerWave: 2,
    shipsPerWave: [2],
    minTier: 0,
    maxTier: 0,
    tiers: [0],
    title: "Patroli Pesisir",
    arrivalNotice: "Patroli Pesisir Merapat!"
  },
  3: {
    waves: 2,
    totalWaves: 2,
    interval: 12.0,
    waveInterval: 12.0,
    countPerWave: 3,
    shipsPerWave: [2, 3],
    minTier: 0,
    maxTier: 1,
    tiers: [0, 1],
    title: "Armada Pengawal Niaga",
    arrivalNotice: "Armada Pengawal Niaga Merapat!"
  },
  2: {
    waves: 3,
    totalWaves: 3,
    interval: 11.0,
    waveInterval: 11.0,
    countPerWave: 3,
    shipsPerWave: [3, 3, 3],
    minTier: 1,
    maxTier: 2,
    tiers: [1, 2],
    title: "Skuadron Kapal Tempur",
    arrivalNotice: "Skuadron Tempur Lapis Baja Merapat!"
  },
  1: {
    waves: 4,
    totalWaves: 4,
    interval: 10.0,
    waveInterval: 10.0,
    countPerWave: 4,
    shipsPerWave: [3, 4, 4, 4],
    minTier: 1,
    maxTier: 2,
    tiers: [1, 2],
    title: "Bala Bantuan Legiun Palung",
    arrivalNotice: "Armada Induk Legiun Abisal Menyerbu!"
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
      isUninhabited: Boolean(template.isUninhabited),
      isSandOnly: Boolean(template.isSandOnly),
      isRockOnly: Boolean(template.isRockOnly),
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

  // Iron Slag Watch (Iron Clan, Tier 4)
  placeIsland({
    id: 'iron_slag_watch',
    name: "Pos Tinjau Jelaga Besi",
    clan: 'iron',
    tier: 4,
    minRadius: 240,
    maxRadius: 290,
    color: '#334155',
    sandColor: '#64748b',
    hasSmokestack: true,
    desc: "Pos peninjau klan besi terdepan dengan cerobong jelaga kecil dan dermaga taji."
  }, 10500, 14500, rng() * Math.PI * 2, Math.PI * 0.8);

  // Wokou Smuggler Cove (Wokou Clan, Tier 4)
  placeIsland({
    id: 'wokou_smuggler_cove',
    name: "Teluk Selundup Jung Wokou",
    clan: 'wokou',
    tier: 4,
    minRadius: 230,
    maxRadius: 280,
    color: '#15803d',
    sandColor: '#fde047',
    hasTorii: true,
    desc: "Sarang penyelundup roket mesiu dan perbekalan bajak laut Wokou di tepi perairan senja."
  }, 11500, 16000, rng() * Math.PI * 2, Math.PI * 0.8);

  // Viking Raider Outpost (Viking Clan, Tier 4)
  placeIsland({
    id: 'viking_raider_outpost',
    name: "Pos Pengintai Drakkar Viking",
    clan: 'viking',
    tier: 4,
    minRadius: 240,
    maxRadius: 290,
    color: '#94a3b8',
    sandColor: '#f1f5f9',
    hasLonghouse: true,
    desc: "Pangkalan kayu terluar prajurit Norse yang mengamati alur pelayaran kapal dagang."
  }, 12500, 17500, rng() * Math.PI * 2, Math.PI * 0.85);

  // Mist Whispering Shrine (Mist Clan, Tier 4)
  placeIsland({
    id: 'mist_whispering_shrine',
    name: "Altar Bisikan Kabut",
    clan: 'mist',
    tier: 4,
    minRadius: 230,
    maxRadius: 280,
    color: '#1e1b4b',
    sandColor: '#475569',
    hasOccultCircle: true,
    desc: "Altar terpencil tempat para pengikut kabut melantunkan mantra penyesat kompas."
  }, 13500, 19000, rng() * Math.PI * 2, Math.PI * 0.8);

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

  // Viking Snowy Fjord Isle (Viking Clan, Tier 3)
  placeIsland({
    id: 'viking_fjord_isle',
    name: "Fjord Salju Jarl Viking",
    clan: 'viking',
    tier: 3,
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

  // Batavia Grand Citadel (Gold Clan, Tier 2)
  placeIsland({
    id: 'batavia_grand_citadel',
    name: "Citadel Emas Batavia",
    clan: 'gold',
    tier: 2,
    minRadius: 330,
    maxRadius: 390,
    color: '#1e3a1e',
    sandColor: '#d97706',
    hasFortress: true,
    desc: "Benteng pertahanan kelas berat Sindikat Emas yang mengawal jalur niaga selat badai."
  }, 28000, 36000, Math.PI * 1.1, Math.PI * 0.8);

  // Mist Crypt Atoll (Mist Clan, Tier 3)
  placeIsland({
    id: 'mist_crypt_atoll',
    name: "Atol Makam Kabut Gelap",
    clan: 'mist',
    tier: 3,
    minRadius: 290,
    maxRadius: 350,
    color: '#0f172a',
    sandColor: '#334155',
    hasOccultCircle: true,
    desc: "Makam keramat tempat kapal-kapal karam masa lampau dipuja oleh kultus kabut."
  }, 25000, 33000, -Math.PI * 0.05, Math.PI * 0.8);

  // Blood Coral Shallows (Blood Clan, Tier 3)
  placeIsland({
    id: 'blood_coral_shallows',
    name: "Dangkal Karang Berdarah",
    clan: 'blood',
    tier: 3,
    minRadius: 290,
    maxRadius: 350,
    color: '#4c0519',
    sandColor: '#f43f5e',
    isFlesh: true,
    desc: "Gugusan karang berduri berdenyut merah di ambang selat dalam."
  }, 34000, 41000, rng() * Math.PI * 2, Math.PI * 0.85);

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

  // Batavia Galleon Redoubt (Gold Clan, Tier 1)
  placeIsland({
    id: 'batavia_galleon_redoubt',
    name: "Kubu Armada Megah Batavia",
    clan: 'gold',
    tier: 1,
    minRadius: 360,
    maxRadius: 420,
    color: '#142a14',
    sandColor: '#f59e0b',
    hasFortress: true,
    desc: "Kubu pertahanan pamungkas kongsi dagang Batavia dengan baterai meriam kuningan kaisar."
  }, 50000, 59000, Math.PI * 0.45, Math.PI * 0.8);

  // Iron Dreadnought Foundry (Iron Clan, Tier 1)
  placeIsland({
    id: 'iron_dreadnought_foundry',
    name: "Pabrik Jagal Karang Besi",
    clan: 'iron',
    tier: 1,
    minRadius: 360,
    maxRadius: 420,
    color: '#1c1917',
    sandColor: '#475569',
    hasFortress: true,
    hasSmokestack: true,
    desc: "Pabrik pembakar raksasa tempat kapal perang besi terkuat ditempa dengan ketel uap kembar."
  }, 48000, 58000, -Math.PI * 0.7, Math.PI * 0.8);

  // Wokou Dragon Fortress (Wokou Clan, Tier 1)
  placeIsland({
    id: 'wokou_dragon_fortress',
    name: "Benteng Armada Kaisar Naga Wokou",
    clan: 'wokou',
    tier: 1,
    minRadius: 360,
    maxRadius: 430,
    color: '#14532d',
    sandColor: '#fde047',
    hasTorii: true,
    hasPagoda: true,
    desc: "Benteng pulau keramat Kaisar Naga Wokou yang terlindung oleh salvo roket naga tanpa henti."
  }, 46000, 56000, Math.PI * 1.2, Math.PI * 0.8);

  // Viking Valhalla Crag (Viking Clan, Tier 1)
  placeIsland({
    id: 'viking_valhalla_crag',
    name: "Karang Tanduk Valhalla Viking",
    clan: 'viking',
    tier: 1,
    minRadius: 360,
    maxRadius: 420,
    color: '#64748b',
    sandColor: '#f8fafc',
    hasLonghouse: true,
    hasFortress: true,
    desc: "Karang es suci tempat para berserker Viking bertarung hingga tetes darah penghabisan."
  }, 53000, 61000, -Math.PI * 0.6, Math.PI * 0.8);

  // Mist Cathedral Crag (Mist Clan, Tier 1)
  placeIsland({
    id: 'mist_cathedral_crag',
    name: "Kuil Katedral Arwah Kabut",
    clan: 'mist',
    tier: 1,
    minRadius: 370,
    maxRadius: 430,
    color: '#090514',
    sandColor: '#334155',
    hasOccultCircle: true,
    desc: "Katedral terapung tertinggi para pendeta Sekte Kabut yang memanggil orba arwah abisal."
  }, 54000, 62000, Math.PI * 0.95, Math.PI * 0.8);

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

  // Bone Reef (Tier 2)
  placeIsland({
    id: 'bone_reef',
    name: "Gugusan Karang Belulang",
    clan: 'blood',
    tier: 2,
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

  // 6. GUGUSAN PULAU & ATOL TAK BERPENGHUNI (Scenic Uninhabited Islets, Sandbars & Sea Crags)
  const uninhabitedTemplates = [
    // Ring 1 (2,000m - 10,000m)
    { id: 'islet_kelapa_sunyi', name: "Atol Kelapa Sunyi", minDist: 2200, maxDist: 4800, minR: 50, maxR: 75, color: '#15803d', sand: '#fef08a', desc: "Atol alami berpasir dengan nyiur kelapa yang melambai ditiup angin laut." },
    { id: 'islet_pasir_putih',  name: "Gosong Pasir Putih", minDist: 3500, maxDist: 7200, minR: 45, maxR: 70, isSandOnly: true, sand: '#fef9c3', desc: "Gundukan gosong pasir putih murni tanpa pepohonan yang tersapu riak buih ombak." },
    { id: 'islet_penyu_damai',  name: "Karang Penyu Damai", minDist: 5000, maxDist: 9500, minR: 55, maxR: 85, color: '#14532d', sand: '#fef08a', desc: "Atol karang bundar tempat bersarangnya penyu samudra." },
    { id: 'islet_laguna_biru',  name: "Atol Laguna Biru",   minDist: 6500, maxDist: 10500, minR: 50, maxR: 80, color: '#15803d', sand: '#fef08a', desc: "Atol melingkar dengan laguna tenang di tengahnya." },
    { id: 'islet_camar_timur',  name: "Batu Camar Timur",   minDist: 4200, maxDist: 8800, minR: 40, maxR: 65, isRockOnly: true, color: '#334155', desc: "Batu cadas karang terjal tempat burung camar bertengger mengeringkan sayap." },
    { id: 'islet_pasir_sepi',   name: "Pulau Pasir Sepi",   minDist: 7500, maxDist: 11000, minR: 48, maxR: 78, isSandOnly: true, sand: '#fef08a', desc: "Gundukan pasir kuning landai yang hanya ditumbuhi rumput angin pantai." },

    // Ring 2 (11,000m - 26,000m)
    { id: 'islet_tapak_hiu',    name: "Karang Tapak Hiu",    minDist: 11500, maxDist: 16500, minR: 52, maxR: 82, isRockOnly: true, color: '#1e293b', desc: "Gugusan cadas karang hitam bergerigi tajam memecah ombak selat badai." },
    { id: 'islet_karang_lumut', name: "Atol Karang Lumut",   minDist: 14000, maxDist: 19500, minR: 50, maxR: 75, color: '#166534', sand: '#ca8a04', desc: "Atol berbatu licin berlumut hijau di tepi jalur pelayaran selat." },
    { id: 'islet_cadas_kelabu', name: "Batu Cadas Kelabu",   minDist: 17500, maxDist: 23500, minR: 45, maxR: 70, isRockOnly: true, color: '#475569', desc: "Formasi batu cadas kelabu purba yang menjulang kokoh tanpa pasir." },
    { id: 'islet_karang_layang',name: "Gugusan Karang Layang",minDist: 19500, maxDist: 25500, minR: 55, maxR: 85, color: '#15803d', sand: '#eab308', desc: "Karang dangkal berpasir keemasan tempat berteduh satwa laut." },
    { id: 'islet_karang_karat', name: "Pulau Karang Karat",  minDist: 21500, maxDist: 27500, minR: 48, maxR: 76, isRockOnly: true, color: '#78350f', desc: "Formasi batu cadas berkandungan bijih besi berkarat merah." },
    { id: 'islet_camar_liar',   name: "Atol Camar Liar",     minDist: 13500, maxDist: 22500, minR: 50, maxR: 80, color: '#14532d', sand: '#fef08a', desc: "Atol hijau terpencil yang menjadi koloni kawanan burung camar." },

    // Ring 3 (27,000m - 48,000m)
    { id: 'islet_makam_karang', name: "Atol Makam Karang",   minDist: 28000, maxDist: 34500, minR: 52, maxR: 80, color: '#312e81', sand: '#c7d2fe', desc: "Atol berpasir ungu kelam di perairan kutukan kabut." },
    { id: 'islet_arwah_kelana', name: "Batu Arwah Kelana",   minDist: 32000, maxDist: 39500, minR: 45, maxR: 70, isRockOnly: true, color: '#1e1b4b', desc: "Batu cadas hitam pekat yang menjulang di tengah kepungan kabut arwah." },
    { id: 'islet_halimun_ungu', name: "Gosong Halimun Ungu", minDist: 36000, maxDist: 43500, minR: 50, maxR: 78, isSandOnly: true, sand: '#e9d5ff', desc: "Gosong pasir tipis berpendar ungu di balik tirai halimun samudra." },
    { id: 'islet_tulang_camar', name: "Karang Tulang Camar", minDist: 40000, maxDist: 47500, minR: 48, maxR: 75, isRockOnly: true, color: '#1f2937', desc: "Cadas karang terjal kelabu pucat yang dipenuhi sarang burung camar liar." },
    { id: 'islet_cadas_hantu',  name: "Atol Cadas Hantu",    minDist: 43500, maxDist: 49500, minR: 54, maxR: 84, color: '#111827', sand: '#9ca3af', desc: "Gugusan atol sunyi tempat bersemayamnya sisa-sisa karang mati." },

    // Ring 4 (50,000m - 68,000m)
    { id: 'islet_karang_abisal', name: "Gugusan Karang Abisal", minDist: 51000, maxDist: 57500, minR: 50, maxR: 80, isRockOnly: true, color: '#1c1917', desc: "Taji karang monolitik hitam di ambang palung dalam." },
    { id: 'islet_kitin_merah',   name: "Batu Kitin Merah",      minDist: 55000, maxDist: 62500, minR: 46, maxR: 74, isRockOnly: true, color: '#881337', desc: "Batu karang merah pekat dengan formasi tonjolan seperti lapisan kitin." },
    { id: 'islet_belulang_hiu',  name: "Gosong Belulang Hiu",   minDist: 59000, maxDist: 66500, minR: 52, maxR: 82, isSandOnly: true, sand: '#f1f5f9', desc: "Gosong pasir pucat keperakan seperti serbuk tulang belulang purba." },
    { id: 'islet_fosil_purba',   name: "Atol Fosil Purba",      minDist: 62000, maxDist: 68500, minR: 55, maxR: 85, color: '#450a0a', sand: '#fecdd3', desc: "Atol karang mengeras dengan formasi batuan purbakala." },

    // Ring 5 (69,000m - 82,000m - Laut Darah)
    { id: 'islet_duri_merah',    name: "Atol Duri Merah Purba",  minDist: 70000, maxDist: 76500, minR: 48, maxR: 78, color: '#4c0519', sand: '#fb7185', isFlesh: true, desc: "Atol karang berduri berdenyut merah di dasar samudra darah." },
    { id: 'islet_tulang_raksasa',name: "Karang Tulang Raksasa",  minDist: 74000, maxDist: 79500, minR: 54, maxR: 86, isRockOnly: true, color: '#1c1917', isFlesh: true, desc: "Tanduk karang hitam kelam menjulang di tengah ombak merah pekat." },
    { id: 'islet_palung_purba',  name: "Batu Palung Purba",      minDist: 78000, maxDist: 83500, minR: 50, maxR: 80, isRockOnly: true, color: '#3f0713', isFlesh: true, desc: "Batu cadas palung abisal tempat teror laut darah mengintai." }
  ];

  uninhabitedTemplates.forEach(t => {
    placeIsland({
      id: t.id,
      name: t.name,
      clan: 'uninhabited',
      tier: 0,
      isUninhabited: true,
      isConquered: false,
      isShopIsland: false,
      isHomePort: false,
      isSandOnly: Boolean(t.isSandOnly),
      isRockOnly: Boolean(t.isRockOnly),
      hasFortress: false,
      hasLighthouse: false,
      minRadius: t.minR,
      maxRadius: t.maxR,
      color: t.color || '#166534',
      sandColor: t.sand || '#ca8a04',
      isFlesh: Boolean(t.isFlesh),
      desc: t.desc || "Pulau karang alami tak berpenghuni yang menjadi tempat singgah burung camar dan satwa samudra."
    }, t.minDist, t.maxDist, rng() * Math.PI * 2, Math.PI * 0.9);
  });

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
    denseFog: false,
    calmCooldownMin: 30,
    calmCooldownMax: 45
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
    denseFog: false,
    durationMin: 45,
    durationMax: 60
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
    denseFog: false,
    durationMin: 45,
    durationMax: 60
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
    denseFog: false,
    durationMin: 45,
    durationMax: 60
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
    denseFog: false,
    durationMin: 50,
    durationMax: 65
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
    denseFog: false,
    durationMin: 60,
    durationMax: 75
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
    denseFog: false,
    durationMin: 50,
    durationMax: 65
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
    denseFog: true,
    durationMin: 60,
    durationMax: 75
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
    denseFog: true,
    durationMin: 75,
    durationMax: 90
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

