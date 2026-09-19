/* ==========================================================================
   LAUT DARAH - GAME STATE & PERSISTENCE
   Player stats, Upgrades, Active Entities, Spiked Mines, Towers, & LocalStorage
   ========================================================================== */

let playerState = {
  x: PLAYER_SPAWN.x,
  y: PLAYER_SPAWN.y,
  angle: PLAYER_SPAWN.angle,
  hp: 100,
  gold: 50,
  bloodEssence: 0,
  kills: 0,
  salvages: 0,
  maxDistanceReached: 0,
  speedSnareTimer: 0, // Iron harpoon snare debuff timer
  inkedTimer: 0, // Kraken ink blindness timer
  whirlpoolPull: { x: 0, y: 0 }, // Leviathan whirlpool pull vector
  conqueredIslands: ['haven', 'shop_haven_senja', 'shop_karang_tengah', 'shop_ambang_kabut'],
  mapLevel: 1, // 1 to 4
  exploredSectors: {}, // { "x,y": true }
  isDockedAtPort: true,
  dockedPort: null,
  upgrades: {
    hull: 1,
    speed: 1,
    cannons: 1,
    rearDefense: 0, // 0 = locked, 1-6 = unlocked & upgraded
    stealthCamo: 1, // 1-6
    relicSiphon: 1  // 1-6
  }
};

// Global entities pool
const entities = {
  enemies: [],
  merchants: [],    // Peaceful merchant cogs and escorts sailing trade routes
  sinkingShips: [], // Ships currently sinking into the deep with bubbles & rotation
  spikedMines: [],  // Floating spiked sea mines around Iron island
  towers: [],       // Island defense bastions, turrets, spires, tentacles, and peranakans
  projectiles: [],
  mines: [],        // Player dropped gunpowder barrels
  whirlpools: [],   // Ancient Leviathan swirling whirlpool vortices
  inkClouds: [],    // The Abyssal Kraken murky ink clouds
  sunkenShips: [],  // Ancient wrecked hulls to salvage
  floatingLoots: [],
  particles: [],
  seaRipples: [],   // Wake water trails for moving vessels
  floatingTexts: [],
  ambientMist: [],  // Drifting sea fog and atmospheric oceanic mist
  seagulls: []      // Oceanic seabirds flying and gliding over the sea
};

// Dynamic Regional Weather & Atmospheric Event State
let weatherState = {
  type: 'clear',
  targetType: 'clear',
  intensity: 0.0,
  timer: 0,
  cooldown: 25.0, // Initial calm period on launch
  windDrift: { x: 0, y: 0 },
  activeStrikes: [], // Telegraphed and active lightning strikes
  compassStatus: 'normal', // 'normal' | 'jitter' | 'blind' | 'corrupted'
  banner: { text: '', subtext: '', alpha: 0, timer: 0 },
  bloodCorrosionTimer: 0
};

// Game Difficulty State & Persistence (Easy, Medium/Default, Hard)
let currentDifficulty = 'medium';
try {
  const savedDiff = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
  if (savedDiff && typeof DIFFICULTY_SETTINGS !== 'undefined' && DIFFICULTY_SETTINGS[savedDiff]) {
    currentDifficulty = savedDiff;
  }
} catch (e) {}

function getDifficultyConfig() {
  if (typeof DIFFICULTY_SETTINGS !== 'undefined' && DIFFICULTY_SETTINGS[currentDifficulty]) {
    return DIFFICULTY_SETTINGS[currentDifficulty];
  }
  return {
    id: 'medium',
    name: 'Normal (Medium)',
    playerDamageReceivedMult: 1.0,
    playerDamageDealtMult: 1.0,
    rewardMultiplier: 1.0,
    enemyReloadMultiplier: 1.0,
    enemyHpMultiplier: 1.0
  };
}

function setGameDifficulty(diffKey) {
  if (typeof DIFFICULTY_SETTINGS !== 'undefined' && DIFFICULTY_SETTINGS[diffKey]) {
    currentDifficulty = diffKey;
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, diffKey);
    } catch (e) {}
  }
}

// Spawn Spiked Sea Mines (Iron islands & Open Sea Straits) & Defenses for ALL Islands
function initTerritorialDefenses() {
  entities.spikedMines = [];
  entities.towers = [];

  // 1a. Spiked Mines around all Iron clan islands
  const ironIslands = WORLD_ISLANDS.filter(i => i.clan === 'iron');
  ironIslands.forEach(ironIsland => {
    const mineCount = Math.min(14, Math.max(8, Math.floor(ironIsland.radius / 25)));
    for (let m = 0; m < mineCount; m++) {
      const ang = (m / mineCount) * Math.PI * 2 + 0.2;
      const dist = ironIsland.radius + 65 + (m % 3) * 30;
      entities.spikedMines.push({
        id: Math.random(),
        islandId: ironIsland.id,
        x: ironIsland.x + Math.cos(ang) * dist,
        y: ironIsland.y + Math.sin(ang) * dist,
        baseX: ironIsland.x + Math.cos(ang) * dist,
        baseY: ironIsland.y + Math.sin(ang) * dist,
        radius: 12,
        damage: 48,
        hp: 20,
        bobPhase: Math.random() * Math.PI * 2,
        flashTimer: 0,
        detonating: false,
        detonateTimer: 0.75
      });
    }
  });

  // 1b. Open Sea Minefields in navigable straits and contested waters (1800 - 5200px)
  const openSeaCount = 14;
  for (let om = 0; om < openSeaCount; om++) {
    const omAng = (om / openSeaCount) * Math.PI * 2 + 0.35;
    const omDist = 1850 + (om % 4) * 780 + Math.sin(om * 2.1) * 200;
    const mx = Math.cos(omAng) * omDist;
    const my = Math.sin(omAng) * omDist;

    // Ensure it's not placed inside or too close to any island
    let insideIsland = false;
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      const isl = WORLD_ISLANDS[i];
      if (Math.hypot(mx - isl.x, my - isl.y) < (isl.radius || 200) + 75) {
        insideIsland = true;
        break;
      }
    }
    if (!insideIsland) {
      entities.spikedMines.push({
        id: Math.random(),
        islandId: null,
        isOpenSea: true,
        x: mx,
        y: my,
        baseX: mx,
        baseY: my,
        radius: 12,
        damage: 48,
        hp: 20,
        bobPhase: Math.random() * Math.PI * 2,
        flashTimer: Math.random() * 2,
        detonating: false,
        detonateTimer: 0.75
      });
    }
  }

  // 2. Territorial Active Defenses for ALL Islands across the world
  entities.towers = [];
  WORLD_ISLANDS.forEach(isl => {
    // Initialize Island Provocation & Conquest State
    isl.isProvoked = (isl.clan === 'blood' || isl.isFlesh || isl.isSkullIsland);
    isl.conquestActive = false;
    isl.reinforcementWavesLeft = 0;
    isl.reinforcementTimer = 0;
    isl.reinforcementWaveCurrent = 0;
    isl.reinforcementTotalWaves = 0;

    // 0. Peaceful zones: Shop Islands & Conquered Islands have no hostile defenses
    if (isl.isShopIsland || isl.isConquered) {
      return;
    }

    // Haven Peacekeeper Bastions
    if (isl.id === 'haven') {
      [-0.45, 0.45].forEach((offsetAngle, idx) => {
        const baseFacing = (isl.dockAngle !== undefined ? isl.dockAngle : 0) + Math.PI;
        const angle = baseFacing + offsetAngle;
        const dist = (typeof getIslandRadiusAt === 'function' ? getIslandRadiusAt(isl, angle) : (isl.radius || 300)) + 18;
        entities.towers.push({
          id: Math.random(),
          islandId: isl.id,
          tier: 0,
          isPeranakan: false,
          defenseType: 'haven_bastion',
          name: idx === 0 ? "Meriam Penjaga Damai Barat" : "Meriam Penjaga Damai Timur",
          x: isl.x + Math.cos(angle) * dist,
          y: isl.y + Math.sin(angle) * dist,
          baseAngle: angle,
          aimAngle: angle,
          radius: 28,
          hp: 520,
          maxHp: 520,
          clan: 'neutral',
          damage: 30,
          shootCooldown: 1.2 + idx * 0.6
        });
      });
      return;
    }

    // 1. Build Territorial Defense Squads (Induk Primary + Peranakan Flankers)
    const tier = isl.tier || 4;
    const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyHpMultiplier: 1.0 };
    const hpMult = diffCfg.enemyHpMultiplier || 1.0;

    const defenseSquad = [];

    if (isl.clan === 'blood' || isl.isFlesh || isl.isSkullIsland) {
      // TIER 1: Laut Darah - Sarang Induk / Pulau Tengkorak
      const primaryCount = isl.id === 'hive_nest' ? 2 : 1;
      if (primaryCount === 1) {
        defenseSquad.push({ type: 'tentacle', isPeranakan: false, hp: 520, dmg: 38, rad: 26, name: `${isl.name} - Tentakel Induk Leviathan` });
        defenseSquad.push({ type: 'flesh_spitter', isPeranakan: true, hp: 170, dmg: 16, rad: 18, name: `Kantung Parasit Pembusuk Barat` });
        defenseSquad.push({ type: 'flesh_spitter', isPeranakan: true, hp: 170, dmg: 16, rad: 18, name: `Kantung Parasit Pembusuk Timur` });
      } else {
        defenseSquad.push({ type: 'tentacle', isPeranakan: false, hp: 520, dmg: 38, rad: 26, name: `Tentakel Induk Abisal I` });
        defenseSquad.push({ type: 'tentacle', isPeranakan: false, hp: 520, dmg: 38, rad: 26, name: `Tentakel Induk Abisal II` });
        defenseSquad.push({ type: 'flesh_spitter', isPeranakan: true, hp: 170, dmg: 16, rad: 18, name: `Kantung Parasit Penjaga` });
        defenseSquad.push({ type: 'flesh_spitter', isPeranakan: true, hp: 170, dmg: 16, rad: 18, name: `Tentakel Cambuk Lendir` });
      }

    } else if (isl.clan === 'mist') {
      // TIER 2: Sekte Kabut
      defenseSquad.push({ type: 'mist_spire', isPeranakan: false, hp: 420, dmg: 28, rad: 30, name: `${isl.name} - Spire Okultis Utama` });
      defenseSquad.push({ type: 'skull_pylon', isPeranakan: true, hp: 160, dmg: 15, rad: 18, name: `Pylon Tengkorak Arwah Barat` });
      defenseSquad.push({ type: 'skull_pylon', isPeranakan: true, hp: 160, dmg: 15, rad: 18, name: `Pylon Tengkorak Arwah Timur` });

    } else if (isl.clan === 'iron') {
      // TIER 2 or 3: Pemburu Besi Hitam
      const isTier2 = tier <= 2;
      defenseSquad.push({
        type: 'steam_harpoon',
        isPeranakan: false,
        hp: isTier2 ? 420 : 340,
        dmg: isTier2 ? 30 : 25,
        rad: 28,
        name: `${isl.name} - Turret Harpoon Baja Uap`
      });
      defenseSquad.push({
        type: 'steam_vent',
        isPeranakan: true,
        hp: isTier2 ? 160 : 135,
        dmg: 14,
        rad: 18,
        name: `Tungku Cerobong Uap Kiri`
      });
      defenseSquad.push({
        type: 'steam_vent',
        isPeranakan: true,
        hp: isTier2 ? 160 : 135,
        dmg: 14,
        rad: 18,
        name: `Tungku Cerobong Uap Kanan`
      });

    } else if (isl.clan === 'viking') {
      // TIER 2 or 3: Klan Penakluk Viking (Runestone Watchtowers & Ice Ballista)
      defenseSquad.push({
        type: 'viking_ballista',
        isPeranakan: false,
        hp: 440,
        dmg: 32,
        rad: 30,
        name: `${isl.name} - Ballista Pelontar Es Nordik`
      });
      defenseSquad.push({
        type: 'viking_watchtower',
        isPeranakan: true,
        hp: 165,
        dmg: 16,
        rad: 20,
        name: `Menara Pasak Fjord Barat`
      });
      defenseSquad.push({
        type: 'viking_watchtower',
        isPeranakan: true,
        hp: 165,
        dmg: 16,
        rad: 20,
        name: `Menara Pasak Fjord Timur`
      });

    } else if (isl.clan === 'wokou') {
      // TIER 3 or 4: Perompak Jung Wokou (Firework Pagoda & Bamboo Rocket Nest)
      defenseSquad.push({
        type: 'wokou_pagoda',
        isPeranakan: false,
        hp: 410,
        dmg: 28,
        rad: 30,
        name: `${isl.name} - Pagoda Baterai Mesiu Naga`
      });
      defenseSquad.push({
        type: 'wokou_rocket_nest',
        isPeranakan: true,
        hp: 155,
        dmg: 14,
        rad: 18,
        name: `Gardu Panah Roket Bambu I`
      });
      defenseSquad.push({
        type: 'wokou_rocket_nest',
        isPeranakan: true,
        hp: 155,
        dmg: 14,
        rad: 18,
        name: `Gardu Panah Roket Bambu II`
      });

    } else {
      // TIER 3 or 4: Sindikat Emas Batavia / Neutral
      const isTier4 = tier >= 4;
      defenseSquad.push({
        type: 'cannon_bastion',
        isPeranakan: false,
        hp: isTier4 ? 240 : 340,
        dmg: isTier4 ? 18 : 24,
        rad: 26,
        name: `${isl.name} - Bastion Meriam Emas`
      });
      defenseSquad.push({
        type: 'swivel_outpost',
        isPeranakan: true,
        hp: isTier4 ? 110 : 135,
        dmg: 11,
        rad: 18,
        name: `Gardu Pengintai Senapan Putar Barat`
      });
      if (!isTier4) {
        defenseSquad.push({
          type: 'swivel_outpost',
          isPeranakan: true,
          hp: 135,
          dmg: 11,
          rad: 18,
          name: `Gardu Pengintai Senapan Putar Timur`
        });
      }
    }

    // 2. Radially Distribute Defenses Around Island Perimeter (Not clustered at one spot!)
    const dockAngle = (isl.dockAngle !== undefined ? isl.dockAngle : 0);
    const N = defenseSquad.length;
    let assignedAngles = [];
    if (N === 2) {
      assignedAngles = [dockAngle + Math.PI - 1.25, dockAngle + Math.PI + 1.25];
    } else if (N === 3) {
      assignedAngles = [dockAngle + Math.PI, dockAngle + Math.PI - 1.7, dockAngle + Math.PI + 1.7];
    } else if (N >= 4) {
      assignedAngles = [
        dockAngle + Math.PI,
        dockAngle + Math.PI - 1.4,
        dockAngle + Math.PI + 1.4,
        dockAngle + Math.PI * 0.5
      ];
    } else {
      assignedAngles = [dockAngle + Math.PI];
    }

    defenseSquad.forEach((def, idx) => {
      const angle = assignedAngles[idx] || (dockAngle + Math.PI + (idx * 1.5));
      const rAtAng = typeof getIslandRadiusAt === 'function' ? getIslandRadiusAt(isl, angle) : (isl.radius || 300);
      const dist = rAtAng + (def.type === 'tentacle' ? 24 : 18);
      const scaledHp = Math.round(def.hp * hpMult);

      entities.towers.push({
        id: Math.random(),
        islandId: isl.id,
        tier: tier,
        isPeranakan: def.isPeranakan,
        defenseType: def.type,
        name: def.name,
        x: isl.x + Math.cos(angle) * dist,
        y: isl.y + Math.sin(angle) * dist,
        baseAngle: angle,
        aimAngle: angle,
        radius: def.rad,
        hp: scaledHp,
        maxHp: scaledHp,
        clan: isl.clan || 'neutral',
        damage: def.dmg,
        shootCooldown: 0.8 + idx * 0.5,
        // Specialized states:
        orbAngle: 0,
        glowPulse: 0,
        steamPuffTimer: Math.random() * 2,
        wrigglePhase: Math.random() * Math.PI * 2,
        isSlamming: false,
        slamProgress: 0,
        slamCooldown: 0,
        slamTargetX: 0,
        slamTargetY: 0
      });
    });
  });
}

// Entity Factory for Merchant Ships
function createMerchantEntity(type, x, y, angle, waypoints = []) {
  const cfg = (typeof MERCHANT_CONFIG !== 'undefined' && MERCHANT_CONFIG[type]) 
    ? MERCHANT_CONFIG[type] 
    : { name: "Kapal Niaga", hp: 180, speed: 1.9, radius: 20, cargoLoot: 40 };

  return {
    id: 'merch_' + Math.random().toString(36).substring(2, 9),
    type: type, // 'cargo' or 'escort'
    clan: 'merchant',
    isMerchant: true,
    name: cfg.name,
    x: x,
    y: y,
    prevX: x,
    prevY: y,
    vx: 0,
    vy: 0,
    angle: angle,
    targetAngle: angle,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed,
    radius: cfg.radius,
    damage: cfg.damage || 14,
    cargoLoot: cfg.cargoLoot || 40,
    shootCooldown: 2.0,
    isMoving: true,
    state: 'sailing', // 'sailing', 'docked', 'fleeing', 'retaliating'
    stateTimer: 0,
    dockTimer: 0,
    waypoints: waypoints,
    currentWpIdx: 0,
    fleeTimer: 0,
    retaliateTarget: null
  };
}

// Seed world merchant shipping trade convoys
function seedWorldMerchants() {
  entities.merchants = [];

  // Filter friendly or neutral trade harbors: Haven, Shop Islands, and Conquered Islands
  const safePorts = WORLD_ISLANDS.filter(isl => isl.isHomePort || isl.isShopIsland || isl.isConquered);
  if (safePorts.length < 2) return;

  // Convoy 1: Trade run between Haven and Shop Island 1 & 2
  const haven = safePorts.find(i => i.isHomePort) || safePorts[0];
  const shop1 = safePorts.find(i => i.id === 'shop_haven_senja') || safePorts[1 % safePorts.length];
  const shop2 = safePorts.find(i => i.id === 'shop_karang_tengah') || safePorts[safePorts.length - 1];

  const wpRoute1 = [haven, shop1, shop2];
  const wpRoute2 = [shop2, shop1, haven];

  // Cargo Cog 1
  const spawn1X = haven.x + Math.cos(haven.dockAngle) * (haven.dockDist + 120);
  const spawn1Y = haven.y + Math.sin(haven.dockAngle) * (haven.dockDist + 120);
  entities.merchants.push(createMerchantEntity('cargo', spawn1X, spawn1Y, haven.dockAngle, wpRoute1));

  // Escort Cutter 1
  const spawn2X = spawn1X + Math.cos(haven.dockAngle + 1.2) * 55;
  const spawn2Y = spawn1Y + Math.sin(haven.dockAngle + 1.2) * 55;
  entities.merchants.push(createMerchantEntity('escort', spawn2X, spawn2Y, haven.dockAngle, wpRoute1));

  // Cargo Cog 2 (Sailing reverse route)
  const spawn3X = shop1.x + Math.cos(shop1.dockAngle) * (shop1.dockDist + 110);
  const spawn3Y = shop1.y + Math.sin(shop1.dockAngle) * (shop1.dockDist + 110);
  entities.merchants.push(createMerchantEntity('cargo', spawn3X, spawn3Y, shop1.dockAngle, wpRoute2));

  // Armed Merchant 3 in outer waters if Ring 3 shop exists
  const shop3 = safePorts.find(i => i.id === 'shop_ambang_kabut');
  if (shop3) {
    const wpRoute3 = [shop2, shop3];
    const spawn4X = shop2.x + Math.cos(shop2.dockAngle) * (shop2.dockDist + 120);
    const spawn4Y = shop2.y + Math.sin(shop2.dockAngle) * (shop2.dockDist + 120);
    entities.merchants.push(createMerchantEntity('escort', spawn4X, spawn4Y, shop2.dockAngle, wpRoute3));
  }
}

// Entity Factory for Ships and Abyssal Sea Monsters
function createEnemyEntity(clanKey, tierIndex, x, y, angle, options = {}) {
  const clanData = CLAN_LORE[clanKey] || CLAN_LORE.gold;
  const tierData = clanData.tiers[Math.max(0, Math.min(2, tierIndex))];
  const isMonster = clanKey === 'blood';
  const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyHpMultiplier: 1.0 };
  const baseHp = options.hp || tierData.hp;
  const scaledHp = Math.round(baseHp * (diffCfg.enemyHpMultiplier || 1.0));

  const monsterType = options.monsterType || (isMonster ? (tierIndex === 0 ? 'larva' : (tierIndex === 1 ? 'kraken' : 'leviathan')) : null);
  let speed = options.speed || tierData.speed;
  let preferredDist = isMonster ? (100 + tierIndex * 30) : (clanKey === 'iron' ? (120 + tierIndex * 20) : (clanKey === 'viking' ? 95 : (clanKey === 'wokou' ? 220 : (180 + tierIndex * 35))));
  let turnRate = isMonster ? 3.6 : (clanKey === 'wokou' ? 2.8 : (clanKey === 'viking' ? 2.5 : 2.2));

  if (monsterType === 'megalodon') {
    speed = options.speed || 3.8;
    preferredDist = 75;
    turnRate = 3.2;
  } else if (monsterType === 'kraken') {
    speed = options.speed || 2.4;
    preferredDist = 220;
    turnRate = 2.4;
  } else if (monsterType === 'leviathan') {
    speed = options.speed || 3.4;
    preferredDist = 140;
    turnRate = 3.4;
  }

  return {
    id: Math.random(),
    homeIslandId: options.homeIslandId || null,
    convoyId: options.convoyId || null,
    formationType: options.formationType || 'solitary',
    formationRole: options.formationRole || 'solitary',
    formationIndex: options.formationIndex || 0,
    formationTotal: options.formationTotal || 1,
    ritualCenter: options.ritualCenter || null,
    guardWreckId: options.guardWreckId || null,
    isAnchored: Boolean(options.isAnchored),
    voyageState: options.voyageState || (options.isAnchored ? 'docked' : 'voyaging'),
    destinationIslandId: options.destinationIslandId || null,
    dockTimer: options.dockTimer !== undefined ? options.dockTimer : (options.isAnchored ? (16 + Math.random() * 20) : 0),
    x: x,
    y: y,
    prevX: x,
    prevY: y,
    angle: angle,
    clan: clanKey,
    tier: tierData.level,
    name: options.name || tierData.name,
    isMonster: isMonster,
    monsterType: monsterType,
    hp: scaledHp,
    maxHp: scaledHp,
    speed: speed,
    baseSpeed: speed,
    damage: options.damage || tierData.damage,
    radius: options.radius || tierData.radius,
    shootCooldown: 1.2 + Math.random() * 1.5,
    specialCooldown: 2.8 + Math.random() * 2.2,
    chargeState: 'idle',
    chargeTimer: 0,
    recoveryTimer: 0,
    lostSightTimer: 0,
    disengageTimer: 0,
    tailgateTimer: 0,
    orbitDir: options.orbitDir !== undefined ? options.orbitDir : (Math.random() > 0.5 ? 1 : -1),
    preferredDist: preferredDist,
    turnRate: turnRate,
    patrolAngle: options.patrolAngle !== undefined ? options.patrolAngle : angle,
    orbitDist: options.orbitDist !== undefined ? options.orbitDist : 65,
    detectionMeter: 0,
    alertState: 'unaware',
    searchTimer: 0,
    lastKnownPos: null,
    targetEntity: null,
    bulletColor: clanData.bulletColor || '#475569'
  };
}

// Ports frequented by human seafaring clans across the generational map
function pickDestinationIsland(shipOrClan, currentIslandId = null) {
  const clan = (typeof shipOrClan === 'string') ? shipOrClan : (shipOrClan && shipOrClan.clan);
  const nonBlood = WORLD_ISLANDS.filter(isl => !isl.isFlesh && isl.clan !== 'blood' && isl.id !== currentIslandId);
  
  // Prefer ports belonging to their own clan
  let candidates = nonBlood.filter(isl => isl.clan === clan);
  if (candidates.length === 0) {
    // If no port of own clan, allow friendly/neutral ports or Haven
    candidates = nonBlood.filter(isl => isl.clan === 'neutral' || isl.id === 'haven');
  }
  if (candidates.length === 0) candidates = nonBlood;
  if (candidates.length === 0) return WORLD_ISLANDS[0];
  
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function spawnBataviaConvoy(ex, ey, angle) {
  const convoyId = 'convoy_batavia_' + Math.random().toString(36).substr(2, 6);
  const destIsl = pickDestinationIsland('gold');
  // Flagship Treasury Galleon Leader (Carries royal cargo, drops gold chests upon sinking)
  entities.enemies.push(createEnemyEntity('gold', 1, ex, ey, angle, {
    convoyId,
    formationType: 'batavia_column',
    formationRole: 'leader',
    formationIndex: 0,
    isTreasuryShip: true,
    name: 'Galleon Kas Diraja Batavia',
    voyageState: 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));

  // Column Escorts: spaced at 75px intervals behind leader
  const escortCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 1; i <= escortCount; i++) {
    const dist = i * 75;
    const sx = ex + Math.cos(angle + Math.PI) * dist;
    const sy = ey + Math.sin(angle + Math.PI) * dist;
    entities.enemies.push(createEnemyEntity('gold', 0, sx, sy, angle, {
      convoyId,
      formationType: 'batavia_column',
      formationRole: 'escort_' + i,
      formationIndex: i,
      name: 'Korvet Pengawal Upeti',
      voyageState: 'voyaging',
      destinationIslandId: destIsl ? destIsl.id : 'haven'
    }));
  }
}

function spawnIronWedge(ex, ey, angle) {
  const convoyId = 'convoy_iron_' + Math.random().toString(36).substr(2, 6);
  const destIsl = pickDestinationIsland('iron');
  // Heavy Ironclad Juggernaut at apex of wedge
  entities.enemies.push(createEnemyEntity('iron', 1, ex, ey, angle, {
    convoyId,
    formationType: 'iron_wedge',
    formationRole: 'leader',
    formationIndex: 0,
    hasSteamRam: true,
    name: 'Baji Pemecah Karang Baja',
    voyageState: 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));

  // Left & Right Flank Spiked Rams at angle ± 2.4 rad, distance 78px
  const lx = ex + Math.cos(angle + 2.4) * 78;
  const ly = ey + Math.sin(angle + 2.4) * 78;
  entities.enemies.push(createEnemyEntity('iron', 0, lx, ly, angle, {
    convoyId,
    formationType: 'iron_wedge',
    formationRole: 'wing_left',
    formationIndex: 1,
    name: 'Sekoci Baji Berduri Sayap Barat',
    voyageState: 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));

  const rx = ex + Math.cos(angle - 2.4) * 78;
  const ry = ey + Math.sin(angle - 2.4) * 78;
  entities.enemies.push(createEnemyEntity('iron', 0, rx, ry, angle, {
    convoyId,
    formationType: 'iron_wedge',
    formationRole: 'wing_right',
    formationIndex: 2,
    name: 'Sekoci Baji Berduri Sayap Timur',
    voyageState: 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));

  if (Math.random() < 0.5) {
    const bx = ex + Math.cos(angle + Math.PI) * 115;
    const by = ey + Math.sin(angle + Math.PI) * 115;
    entities.enemies.push(createEnemyEntity('iron', 0, bx, by, angle, {
      convoyId,
      formationType: 'iron_wedge',
      formationRole: 'escort_rear',
      formationIndex: 3,
      name: 'Tongkang Peleburan Arang',
      voyageState: 'voyaging',
      destinationIslandId: destIsl ? destIsl.id : 'haven'
    }));
  }
}

function spawnMistRitual(ex, ey) {
  const convoyId = 'convoy_mist_' + Math.random().toString(36).substr(2, 6);
  const ritualCenter = { x: ex, y: ey, angle: Math.random() * Math.PI * 2 };
  const cultistCount = 3 + Math.floor(Math.random() * 2);

  for (let i = 0; i < cultistCount; i++) {
    const ang = ritualCenter.angle + (i / cultistCount) * Math.PI * 2;
    const cx = ex + Math.cos(ang) * 85;
    const cy = ey + Math.sin(ang) * 85;
    entities.enemies.push(createEnemyEntity('mist', i === 0 ? 1 : 0, cx, cy, ang + Math.PI / 2, {
      convoyId,
      formationType: 'mist_ritual',
      formationRole: i === 0 ? 'leader' : 'ritual_cultist',
      formationIndex: i,
      formationTotal: cultistCount,
      name: i === 0 ? 'Bahtera Arwah Gentayangan' : 'Sekoci Sesaji Pemuja',
      ritualCenter: ritualCenter
    }));
  }
}

function spawnMonsterPair(ex, ey, angle) {
  const convoyId = 'monster_' + Math.random().toString(36).substr(2, 6);
  // Alpha Leviathan / Hydra
  entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, angle, {
    convoyId: convoyId,
    formationType: 'monster_pair',
    formationRole: 'monster_alpha',
    name: 'Ular Palung Daging (Hydra Induk)'
  }));

  // 2 Agile Juvenile Blood Larvae swarming alongside
  [-2.2, 2.2].forEach((offsetAng, idx) => {
    const jx = ex + Math.cos(angle + offsetAng) * 65;
    const jy = ey + Math.sin(angle + offsetAng) * 65;
    entities.enemies.push(createEnemyEntity('blood', 0, jx, jy, angle, {
      convoyId: convoyId,
      formationType: 'monster_pair',
      formationRole: 'monster_juvenile_' + (idx + 1),
      name: 'Larva Daging Pemangsa'
    }));
  });
}

function spawnSolitaryShip(ex, ey, angle, clan, distFromCenter) {
  const destIsl = pickDestinationIsland(clan);
  const isStartingDocked = Math.random() < 0.35;
  const tier = Math.min(2, Math.floor(distFromCenter / 22000));
  entities.enemies.push(createEnemyEntity(clan, tier, ex, ey, angle, {
    formationType: 'solitary',
    formationRole: 'solitary',
    isAnchored: isStartingDocked,
    voyageState: isStartingDocked ? 'docked' : 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));
}

function spawnVikingRaidFlotilla(ex, ey, angle) {
  const convoyId = 'convoy_viking_' + Math.random().toString(36).substr(2, 6);
  const destIsl = pickDestinationIsland('viking');
  // Flagship Skeid / Drakkar Jarl Leader (Equipped with War Horn & Frost Ballistas)
  entities.enemies.push(createEnemyEntity('viking', 1, ex, ey, angle, {
    convoyId,
    formationType: 'viking_line',
    formationRole: 'leader',
    formationIndex: 0,
    hasWarHorn: true,
    name: 'Drakkar Jarl Penakluk Fjord',
    voyageState: 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));

  // Line Abreast Snekkja Berserkers (Flanking left & right for rapid boarding dash)
  [-60, 60].forEach((offsetSide, idx) => {
    const lx = ex + Math.cos(angle + Math.PI / 2) * offsetSide - Math.cos(angle) * 35;
    const ly = ey + Math.sin(angle + Math.PI / 2) * offsetSide - Math.sin(angle) * 35;
    entities.enemies.push(createEnemyEntity('viking', 0, lx, ly, angle, {
      convoyId,
      formationType: 'viking_line',
      formationRole: 'flanker_' + (idx + 1),
      formationIndex: idx + 1,
      name: 'Snekkja Salju Berserker',
      voyageState: 'voyaging',
      destinationIslandId: destIsl ? destIsl.id : 'haven'
    }));
  });
}

function spawnWokouWolfpack(ex, ey, angle) {
  const convoyId = 'convoy_wokou_' + Math.random().toString(36).substr(2, 6);
  const destIsl = pickDestinationIsland('wokou');
  // War Junk Leader (Equipped with Firework Smokescreen & Rocket Batteries)
  entities.enemies.push(createEnemyEntity('wokou', 1, ex, ey, angle, {
    convoyId,
    formationType: 'wokou_pack',
    formationRole: 'leader',
    formationIndex: 0,
    hasSmokeScreen: true,
    name: 'Jung Perang Kaisar Naga',
    voyageState: 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));

  // Agile Rocket Sampans trailing in crescent chevron
  const flankers = [
    { dist: 70, sideAng: 2.2 },
    { dist: 70, sideAng: -2.2 }
  ];
  flankers.forEach((flk, idx) => {
    const fx = ex + Math.cos(angle + flk.sideAng) * flk.dist;
    const fy = ey + Math.sin(angle + flk.sideAng) * flk.dist;
    entities.enemies.push(createEnemyEntity('wokou', 0, fx, fy, angle, {
      convoyId,
      formationType: 'wokou_pack',
      formationRole: 'wing_' + (idx + 1),
      formationIndex: idx + 1,
      name: 'Sampan Mesiu Roket Api',
      voyageState: 'voyaging',
      destinationIslandId: destIsl ? destIsl.id : 'haven'
    }));
  });
}

// Seed persistent initial formations across the oceanic rings so the world is alive immediately!
function seedWorldFormations() {
  entities.enemies = [];

  // 1. Batavia Column Convoy in Ring 1 (Gold/Batavia Waters)
  const goldIslands = WORLD_ISLANDS.filter(i => i.clan === 'gold' && i.id !== 'haven');
  if (goldIslands.length > 0) {
    const targetIsl = goldIslands[0];
    const bAngle = Math.atan2(targetIsl.y, targetIsl.x) + 0.35;
    const bDist = Math.max(1200, Math.hypot(targetIsl.x, targetIsl.y) * 0.65);
    spawnBataviaConvoy(Math.cos(bAngle) * bDist, Math.sin(bAngle) * bDist, bAngle + Math.PI / 2);
  } else {
    spawnBataviaConvoy(1850, -1250, 0.4);
  }

  // 2. Wokou Wolfpack in Ring 1/2
  const wokouIslands = WORLD_ISLANDS.filter(i => i.clan === 'wokou');
  if (wokouIslands.length > 0) {
    const wIsl = wokouIslands[0];
    const wAngle = Math.atan2(wIsl.y, wIsl.x) + 0.4;
    const wDist = Math.max(5000, Math.hypot(wIsl.x, wIsl.y) * 0.75);
    spawnWokouWolfpack(Math.cos(wAngle) * wDist, Math.sin(wAngle) * wDist, wAngle + Math.PI / 2);
  }

  // 3. Iron Wedge Armada in Ring 2 (Iron Waters)
  const ironIslands = WORLD_ISLANDS.filter(i => i.clan === 'iron');
  if (ironIslands.length > 0) {
    const ironIsl = ironIslands[0];
    const iAngle = Math.atan2(ironIsl.y, ironIsl.x) - 0.3;
    const iDist = Math.max(8000, Math.hypot(ironIsl.x, ironIsl.y) * 0.8);
    spawnIronWedge(Math.cos(iAngle) * iDist, Math.sin(iAngle) * iDist, iAngle - Math.PI / 2);
  } else {
    spawnIronWedge(-12000, 10000, -0.7);
  }

  // 4. Viking Raid Flotilla in Ring 2
  const vikingIslands = WORLD_ISLANDS.filter(i => i.clan === 'viking');
  if (vikingIslands.length > 0) {
    const vIsl = vikingIslands[0];
    const vAngle = Math.atan2(vIsl.y, vIsl.x) - 0.4;
    const vDist = Math.max(15000, Math.hypot(vIsl.x, vIsl.y) * 0.8);
    spawnVikingRaidFlotilla(Math.cos(vAngle) * vDist, Math.sin(vAngle) * vDist, vAngle + Math.PI / 2);
  }

  // 5. Mist Occult Ritual Circle in Ring 3 (Mist Waters)
  const mistIslands = WORLD_ISLANDS.filter(i => i.clan === 'mist');
  if (mistIslands.length > 0) {
    const mistIsl = mistIslands[0];
    const mAngle = Math.atan2(mistIsl.y, mistIsl.x) + 0.2;
    const mDist = Math.max(25000, Math.hypot(mistIsl.x, mistIsl.y) * 0.85);
    spawnMistRitual(Math.cos(mAngle) * mDist, Math.sin(mAngle) * mDist);
  } else {
    spawnMistRitual(-32000, -28000);
  }

  // 4. Roaming Monster Pair in Ring 4/5 (Laut Merah Abisal >= 75000m)
  const monAngle = Math.random() * Math.PI * 2;
  const monDist = 76000 + Math.random() * 4000;
  spawnMonsterPair(Math.cos(monAngle) * monDist, Math.sin(monAngle) * monDist, monAngle + Math.PI / 2);

  // 5. Initial solitary ships in transit across outer calm waters (Gold, Iron, Wokou, Viking)
  spawnSolitaryShip(1200, 950, Math.random() * Math.PI * 2, 'gold', 1500);
  spawnSolitaryShip(-1900, -1600, Math.random() * Math.PI * 2, 'iron', 2400);
  spawnSolitaryShip(1800, -1700, Math.random() * Math.PI * 2, 'wokou', 2400);
  spawnSolitaryShip(-1700, 1600, Math.random() * Math.PI * 2, 'viking', 2300);
}

initTerritorialDefenses();
seedWorldFormations();

// Seed atmospheric sea mist clouds
for (let i = 0; i < 22; i++) {
  entities.ambientMist.push({
    x: (Math.random() - 0.5) * 4000,
    y: (Math.random() - 0.5) * 4000,
    vx: -0.2 - Math.random() * 0.4,
    vy: (Math.random() - 0.5) * 0.2,
    radius: 120 + Math.random() * 160,
    alpha: 0.04 + Math.random() * 0.05
  });
}

// Seed oceanic seagulls (burung camar melayang di atas laut)
for (let i = 0; i < 14; i++) {
  const ang = Math.random() * Math.PI * 2;
  const dist = 150 + Math.random() * 900;
  entities.seagulls.push({
    x: playerState.x + Math.cos(ang) * dist,
    y: playerState.y + Math.sin(ang) * dist,
    heading: Math.random() * Math.PI * 2,
    speed: 1.4 + Math.random() * 1.2,
    altitude: 22 + Math.random() * 18,
    turnRate: (Math.random() - 0.5) * 0.02,
    wingPhase: Math.random() * Math.PI * 2,
    wingSpeed: 4.5 + Math.random() * 2.5,
    chirpCooldown: 5.0 + Math.random() * 15.0
  });
}

// Runtime dynamic gameplay flags
let isGameStarted = false;
let isGamePaused = false;
let lastFireTime = 0;
let lastRearDefenseTime = 0;
let bloodSeaRoarTimer = 0;
let seagullAwayTimer = 22.0 + Math.random() * 25.0; // Interval for rare distant seagull away cries
let currentSalvagingShip = null;
let salvageProgress = 0;
let screenShake = 0;
let highestDetectionLevel = 0; // 0 to 1 for HUD stealth bar
let battleIntensityLevel = 0;  // 0 to 1 for battle music fading

// Save & Load Generational World Map
function saveWorldGeneration() {
  try {
    localStorage.setItem(WORLD_GEN_KEY, JSON.stringify({
      seed: currentWorldGenSeed,
      genNumber: currentWorldGenNumber
    }));
  } catch (e) {
    console.warn("World gen save error:", e);
  }
}

function loadWorldGeneration() {
  try {
    const raw = localStorage.getItem(WORLD_GEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.seed) {
        generateGenerationalWorld(parsed.seed, parsed.genNumber || 1);
        return true;
      }
    }
  } catch (e) {
    console.warn("World gen load error:", e);
  }
  return false;
}

// Hardcore Roguelike Reset: Wipes upgrades, stats, currencies, generates fresh procedural world
function resetRoguelikeRun() {
  // 1. Procedural Generational World Generation
  currentWorldGenNumber = (currentWorldGenNumber || 1) + 1;
  const newSeed = Math.floor(Math.random() * 10000000) + 1;
  generateGenerationalWorld(newSeed, currentWorldGenNumber);
  saveWorldGeneration();

  playerState.x = PLAYER_SPAWN.x;
  playerState.y = PLAYER_SPAWN.y;
  playerState.angle = PLAYER_SPAWN.angle;
  playerState.gold = 50;
  playerState.bloodEssence = 0;
  playerState.kills = 0;
  playerState.salvages = 0;
  playerState.maxDistanceReached = 0;
  playerState.upgrades = {
    hull: 1,
    speed: 1,
    cannons: 1,
    rearDefense: 0,
    stealthCamo: 1,
    relicSiphon: 1
  };
  playerState.hp = getStatValue('hull', 1);
  playerState.speedSnareTimer = 0;

  playerState.conqueredIslands = ['haven', 'shop_haven_senja', 'shop_karang_tengah', 'shop_ambang_kabut'];
  playerState.mapLevel = 1;
  playerState.exploredSectors = {};
  playerState.isDockedAtPort = true;
  playerState.dockedPort = null;

  // Reset conquered state on world islands
  WORLD_ISLANDS.forEach(isl => {
    if (!isl.isHomePort && !isl.isShopIsland) {
      isl.isConquered = false;
    }
  });

  // 2. Re-initialize spiked sea mines & occult towers around the new island locations
  initTerritorialDefenses();

  // 3. Clear all dynamic sea entities
  entities.enemies = [];
  entities.merchants = [];
  entities.sinkingShips = [];
  entities.projectiles = [];
  entities.mines = [];
  entities.sunkenShips = [];
  entities.floatingLoots = [];
  entities.particles = [];
  entities.seaRipples = [];
  entities.floatingTexts = [];

  // Reset Regional Weather to calm state
  if (typeof weatherState !== 'undefined') {
    weatherState.type = 'clear';
    weatherState.targetType = 'clear';
    weatherState.intensity = 0;
    weatherState.timer = 0;
    weatherState.cooldown = 25.0;
    weatherState.windDrift = { x: 0, y: 0 };
    weatherState.activeStrikes = [];
    weatherState.compassStatus = 'normal';
    weatherState.banner = { text: '', subtext: '', alpha: 0, timer: 0 };
    weatherState.bloodCorrosionTimer = 0;
  }

  // Seed live starting world formations across the ocean rings
  seedWorldFormations();
  seedWorldMerchants();

  // Re-seed seagulls around the new haven
  entities.seagulls = [];
  for (let i = 0; i < 14; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 900;
    entities.seagulls.push({
      x: playerState.x + Math.cos(ang) * dist,
      y: playerState.y + Math.sin(ang) * dist,
      heading: Math.random() * Math.PI * 2,
      speed: 1.4 + Math.random() * 1.2,
      altitude: 22 + Math.random() * 18,
      turnRate: (Math.random() - 0.5) * 0.02,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 4.5 + Math.random() * 2.5,
      chirpCooldown: 5.0 + Math.random() * 15.0
    });
  }

  // 4. Reset indicators & trackers
  highestDetectionLevel = 0;
  battleIntensityLevel = 0;
  currentSalvagingShip = null;
  salvageProgress = 0;
  screenShake = 0;
  hasEnteredBloodSeaThisRun = false;
  activeTreasureHint = null;
  windAngle = Math.random() * Math.PI * 2;

  // 5. Perma-Death Storage Reset
  try {
    localStorage.removeItem(SAVE_KEY);
    saveGame();
  } catch (e) {
    console.warn("Roguelike wipe storage error:", e);
  }

  // 6. Update HUD
  if (typeof updateHUD === 'function') {
    updateHUD();
  }

  if (typeof showToast === 'function') {
    showToast(`Dunia Baru Terbangkit: Generasi #${currentWorldGenNumber}`, "compass");
  }
}

function loadSavedGame() {
  try {
    const genLoaded = loadWorldGeneration();
    if (!genLoaded) {
      generateGenerationalWorld(currentWorldGenSeed, currentWorldGenNumber);
      saveWorldGeneration();
    }

    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      playerState = { 
        ...playerState, 
        ...parsed, 
        upgrades: { ...playerState.upgrades, ...(parsed.upgrades || {}) } 
      };
      if (!Array.isArray(playerState.conqueredIslands)) {
        playerState.conqueredIslands = ['haven', 'shop_haven_senja', 'shop_karang_tengah', 'shop_ambang_kabut'];
      }
      if (!playerState.mapLevel) playerState.mapLevel = 1;
      if (!playerState.exploredSectors) playerState.exploredSectors = {};

      // Sync conquered state to world islands
      WORLD_ISLANDS.forEach(isl => {
        if (playerState.conqueredIslands.includes(isl.id)) {
          isl.isConquered = true;
        }
      });

      // Always embark fresh from Home Port dock on session load
      playerState.x = PLAYER_SPAWN.x;
      playerState.y = PLAYER_SPAWN.y;
      playerState.angle = PLAYER_SPAWN.angle;
      playerState.hp = getStatValue('hull', playerState.upgrades.hull);
    }

    initTerritorialDefenses();
    if (entities.enemies.length === 0) {
      seedWorldFormations();
    }
    seedWorldMerchants();
  } catch (e) {
    console.warn("Save load failed:", e);
  }
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(playerState));
  } catch (e) {
    console.warn("Save write failed:", e);
  }
}

function getStatValue(type, level) {
  switch (type) {
    case 'hull': return 100 + (level - 1) * 75; // Max 475 HP
    case 'speed': return 3.2 + (level - 1) * 0.65; // Max speed 6.45
    case 'cannons': return 12 + (level - 1) * 8; // Cannon damage
    case 'rearDefense': return level * 9; // Rear defense damage / mine damage
    case 'stealthCamo': return 1 - (level - 1) * 0.12; // Detection multiplier (1.0 down to 0.40)
    case 'relicSiphon': return (level - 1) * 4.5; // Life steal amount
    default: return 1;
  }
}

function getShipTier() {
  const sum = Object.values(playerState.upgrades).reduce((a, b) => a + b, 0);
  if (sum >= 30) return { name: "Leviathan Slayer", rank: 5, color: "#f43f5e" };
  if (sum >= 23) return { name: "Galleon Perang Besi", rank: 4, color: "#a855f7" };
  if (sum >= 16) return { name: "Brigantine Tempur", rank: 3, color: "#38bdf8" };
  if (sum >= 9)  return { name: "Caravel Penjelajah", rank: 2, color: "#34d399" };
  return { name: "Sekoci Pemburu", rank: 1, color: "#fbbf24" };
}

// Initial state load
loadSavedGame();
