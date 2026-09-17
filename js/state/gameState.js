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

// Spawn Spiked Sea Mines around Iron Forge Isle & Shark Reef
function initTerritorialDefenses() {
  entities.spikedMines = [];
  entities.towers = [];

  // 1. Spiked Mines around Iron Forge Isle
  const ironIsland = WORLD_ISLANDS.find(i => i.id === 'iron_forge_isle');
  if (ironIsland) {
    for (let m = 0; m < 14; m++) {
      const ang = (m / 14) * Math.PI * 2 + 0.2;
      const dist = ironIsland.radius + 75 + (m % 3) * 35;
      entities.spikedMines.push({
        id: Math.random(),
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
  }

  // 2. Spiked Mines around Shark Reef
  const sharkReef = WORLD_ISLANDS.find(i => i.id === 'shark_reef');
  if (sharkReef) {
    for (let m = 0; m < 10; m++) {
      const ang = (m / 10) * Math.PI * 2;
      const dist = sharkReef.radius + 65 + (m % 2) * 30;
      entities.spikedMines.push({
        id: Math.random(),
        x: sharkReef.x + Math.cos(ang) * dist,
        y: sharkReef.y + Math.sin(ang) * dist,
        baseX: sharkReef.x + Math.cos(ang) * dist,
        baseY: sharkReef.y + Math.sin(ang) * dist,
        radius: 12,
        damage: 48,
        hp: 20,
        bobPhase: Math.random() * Math.PI * 2,
        flashTimer: 0,
        detonating: false,
        detonateTimer: 0.75
      });
    }
  }

  // 3. Mysterious Glowing Occult Towers on Mist Atoll
  const mistIsland = WORLD_ISLANDS.find(i => i.id === 'mist_atoll');
  if (mistIsland) {
    // Twin mystical watchtowers flanking the occult atoll
    [-0.5, 0.5].forEach((offsetAngle, idx) => {
      const towerAngle = mistIsland.dockAngle + Math.PI + offsetAngle;
      const towerDist = mistIsland.radius - 35;
      entities.towers.push({
        id: idx + 1,
        islandId: mistIsland.id,
        name: idx === 0 ? "Menara Jiwa Abisal Utara" : "Menara Arwah Pualam Selatan",
        x: mistIsland.x + Math.cos(towerAngle) * towerDist,
        y: mistIsland.y + Math.sin(towerAngle) * towerDist,
        radius: 28,
        hp: 320,
        maxHp: 320,
        clan: 'mist',
        shootCooldown: 2.2 + idx * 1.2,
        orbAngle: 0,
        glowPulse: 0
      });
    });
  }
}

initTerritorialDefenses();

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

// Hardcore Roguelike Reset: Wipes upgrades, stats, currencies, procedural seeds, and entities
function resetRoguelikeRun() {
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

  // 1. Procedural Coastline Re-Seed for all Archipelago Islands
  WORLD_ISLANDS.forEach(isl => {
    isl.seed = Math.random() * 50 + 1;
  });

  // 2. Re-initialize spiked sea mines & occult towers
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
}

function loadSavedGame() {
  try {
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
