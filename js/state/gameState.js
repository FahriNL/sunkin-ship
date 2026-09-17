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
  sinkingShips: [], // Ships currently sinking into the deep with bubbles & rotation
  spikedMines: [],  // Floating spiked sea mines around Iron island
  towers: [],       // Mysterious shooting occult towers around Mist Atoll
  projectiles: [],
  mines: [],        // Player dropped gunpowder barrels
  sunkenShips: [],  // Ancient wrecked hulls to salvage
  floatingLoots: [],
  particles: [],
  seaRipples: [],   // Wake water trails for moving vessels
  floatingTexts: [],
  ambientMist: [],  // Drifting sea fog and atmospheric oceanic mist
  seagulls: []      // Oceanic seabirds flying and gliding over the sea
};

// Spawn Spiked Sea Mines around Iron islands & Occult Towers on Mist atolls
function initTerritorialDefenses() {
  entities.spikedMines = [];
  entities.towers = [];

  // 1. Spiked Mines around all Iron clan islands
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

  // 2. Mysterious Glowing Occult Towers on Mist atolls
  const mistIslands = WORLD_ISLANDS.filter(i => i.clan === 'mist' && i.hasOccultCircle);
  mistIslands.forEach(mistIsland => {
    [-0.5, 0.5].forEach((offsetAngle, idx) => {
      const towerAngle = (mistIsland.dockAngle !== undefined ? mistIsland.dockAngle : 0) + Math.PI + offsetAngle;
      const towerDist = mistIsland.radius - 35;
      entities.towers.push({
        id: Math.random(),
        islandId: mistIsland.id,
        name: idx === 0 ? "Menara Jiwa Abisal Utara" : "Menara Arwah Pualam Selatan",
        x: mistIsland.x + Math.cos(towerAngle) * towerDist,
        y: mistIsland.y + Math.sin(towerAngle) * towerDist,
        radius: 28,
        hp: 320,
        maxHp: 320,
        clan: 'mist',
        damage: 18,
        bulletColor: '#22d3ee',
        shootCooldown: 2.2 + idx * 1.2,
        orbAngle: 0,
        glowPulse: 0
      });
    });
  });
}

// Entity Factory for Ships and Abyssal Sea Monsters
function createEnemyEntity(clanKey, tierIndex, x, y, angle, options = {}) {
  const clanData = CLAN_LORE[clanKey];
  const tierData = clanData.tiers[Math.max(0, Math.min(2, tierIndex))];
  const isMonster = clanKey === 'blood';

  return {
    id: Math.random(),
    homeIslandId: options.homeIslandId || null,
    convoyId: options.convoyId || null,
    formationType: options.formationType || 'solitary',
    formationRole: options.formationRole || 'solitary',
    formationIndex: options.formationIndex || 0,
    formationTotal: options.formationTotal || 1,
    ritualCenter: options.ritualCenter || null,
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
    hp: options.hp || tierData.hp,
    maxHp: options.hp || tierData.hp,
    speed: options.speed || tierData.speed,
    baseSpeed: options.speed || tierData.speed,
    damage: options.damage || tierData.damage,
    radius: options.radius || tierData.radius,
    shootCooldown: 1.2 + Math.random() * 1.5,
    specialCooldown: 3.2 + Math.random() * 2.5,
    chargeState: 'idle',
    chargeTimer: 0,
    recoveryTimer: 0,
    lostSightTimer: 0,
    disengageTimer: 0,
    tailgateTimer: 0,
    orbitDir: Math.random() > 0.5 ? 1 : -1,
    preferredDist: isMonster ? (100 + tierIndex * 30) : (clanKey === 'iron' ? (120 + tierIndex * 20) : (180 + tierIndex * 35)),
    turnRate: isMonster ? 3.6 : 2.2,
    patrolAngle: angle,
    detectionMeter: 0,
    alertState: 'unaware',
    searchTimer: 0,
    lastKnownPos: null,
    targetEntity: null,
    bulletColor: '#475569'
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
  // Flagship Galleon Leader
  entities.enemies.push(createEnemyEntity('gold', 1, ex, ey, angle, {
    convoyId,
    formationType: 'batavia_column',
    formationRole: 'leader',
    formationIndex: 0,
    voyageState: 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));

  // Column Escorts: spaced at 75px intervals behind leader for clean, majestic formation
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
      voyageState: 'voyaging',
      destinationIslandId: destIsl ? destIsl.id : 'haven'
    }));
  }
}

function spawnIronWedge(ex, ey, angle) {
  const convoyId = 'convoy_iron_' + Math.random().toString(36).substr(2, 6);
  const destIsl = pickDestinationIsland('iron');
  // Heavy Ironclad Leader at apex of wedge
  entities.enemies.push(createEnemyEntity('iron', 1, ex, ey, angle, {
    convoyId,
    formationType: 'iron_wedge',
    formationRole: 'leader',
    formationIndex: 0,
    voyageState: 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));

  // Left & Right Flank Rams at angle ± 2.4 rad, distance 78px
  const lx = ex + Math.cos(angle + 2.4) * 78;
  const ly = ey + Math.sin(angle + 2.4) * 78;
  entities.enemies.push(createEnemyEntity('iron', 0, lx, ly, angle, {
    convoyId,
    formationType: 'iron_wedge',
    formationRole: 'wing_left',
    formationIndex: 1,
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
      ritualCenter: ritualCenter
    }));
  }
}

function spawnMonsterPair(ex, ey, angle) {
  const convoyId = 'monster_' + Math.random().toString(36).substr(2, 6);
  // Alpha Adult Monster
  entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, angle, {
    convoyId: convoyId,
    formationType: 'monster_pair',
    formationRole: 'monster_alpha',
    name: 'Monster Palung Induk'
  }));

  // Agile Juvenile Companion
  const juvAngle = angle + 2.2;
  const jx = ex + Math.cos(juvAngle) * 65;
  const jy = ey + Math.sin(juvAngle) * 65;
  entities.enemies.push(createEnemyEntity('blood', 0, jx, jy, angle, {
    convoyId: convoyId,
    formationType: 'monster_pair',
    formationRole: 'monster_juvenile',
    name: 'Anak Monster Palung'
  }));
}

function spawnSolitaryShip(ex, ey, angle, clan, distFromCenter) {
  const destIsl = pickDestinationIsland(clan);
  const isStartingDocked = Math.random() < 0.35;
  const tier = Math.min(2, Math.floor(distFromCenter / 2600));
  entities.enemies.push(createEnemyEntity(clan, tier, ex, ey, angle, {
    formationType: 'solitary',
    formationRole: 'solitary',
    isAnchored: isStartingDocked,
    voyageState: isStartingDocked ? 'docked' : 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven'
  }));
}

// Seed persistent initial formations across the oceanic rings so the world is alive immediately!
function seedWorldFormations() {
  entities.enemies = [];

  // 1. Batavia Column Convoy in Ring 1 (Gold/Batavia Waters)
  const goldIslands = WORLD_ISLANDS.filter(i => i.clan === 'gold');
  if (goldIslands.length > 0) {
    const targetIsl = goldIslands[0];
    const bAngle = Math.atan2(targetIsl.y, targetIsl.x) + 0.35;
    const bDist = 1100 + Math.random() * 350;
    spawnBataviaConvoy(Math.cos(bAngle) * bDist, Math.sin(bAngle) * bDist, bAngle + Math.PI / 2);
  } else {
    spawnBataviaConvoy(1150, -850, 0.4);
  }

  // 2. Iron Wedge Armada in Ring 2 (Iron Waters)
  const ironIslands = WORLD_ISLANDS.filter(i => i.clan === 'iron');
  if (ironIslands.length > 0) {
    const ironIsl = ironIslands[0];
    const iAngle = Math.atan2(ironIsl.y, ironIsl.x) - 0.3;
    const iDist = 1850 + Math.random() * 350;
    spawnIronWedge(Math.cos(iAngle) * iDist, Math.sin(iAngle) * iDist, iAngle - Math.PI / 2);
  } else {
    spawnIronWedge(-1600, 1300, -0.7);
  }

  // 3. Mist Occult Ritual Circle in Ring 3 (Mist Waters)
  const mistIslands = WORLD_ISLANDS.filter(i => i.clan === 'mist');
  if (mistIslands.length > 0) {
    const mistIsl = mistIslands[0];
    const mAngle = Math.atan2(mistIsl.y, mistIsl.x) + 0.2;
    const mDist = 2650 + Math.random() * 400;
    spawnMistRitual(Math.cos(mAngle) * mDist, Math.sin(mAngle) * mDist);
  } else {
    spawnMistRitual(-2100, -2100);
  }

  // 4. Roaming Monster Pair in Ring 4/5 (Abyssal Waters)
  const monAngle = Math.random() * Math.PI * 2;
  const monDist = 4100 + Math.random() * 450;
  spawnMonsterPair(Math.cos(monAngle) * monDist, Math.sin(monAngle) * monDist, monAngle + Math.PI / 2);

  // 5. One or two solitary ships in transit
  spawnSolitaryShip(850, 750, Math.random() * Math.PI * 2, 'gold', 1100);
  spawnSolitaryShip(-1100, -900, Math.random() * Math.PI * 2, 'iron', 1400);
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

  // 2. Re-initialize spiked sea mines & occult towers around the new island locations
  initTerritorialDefenses();

  // 3. Clear all dynamic sea entities
  entities.enemies = [];
  entities.sinkingShips = [];
  entities.projectiles = [];
  entities.mines = [];
  entities.sunkenShips = [];
  entities.floatingLoots = [];
  entities.particles = [];
  entities.seaRipples = [];
  entities.floatingTexts = [];

  // Seed live starting world formations across the ocean rings
  seedWorldFormations();

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
    initTerritorialDefenses();
    if (entities.enemies.length === 0) {
      seedWorldFormations();
    }

    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      playerState = { 
        ...playerState, 
        ...parsed, 
        upgrades: { ...playerState.upgrades, ...(parsed.upgrades || {}) } 
      };
      // Always embark fresh from Home Port dock on session load
      playerState.x = PLAYER_SPAWN.x;
      playerState.y = PLAYER_SPAWN.y;
      playerState.angle = PLAYER_SPAWN.angle;
      playerState.hp = getStatValue('hull', playerState.upgrades.hull);
    }
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
