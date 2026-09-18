/* ==========================================================================
   LAUT DARAH - PHYSICS, AI & SIMULATION ENGINE
   Procedural Coastline Raycasting, Search & Hide Stealth AI, Spiked Mines, & Occult Towers
   ========================================================================== */

let _cachedSalvageContainer = null;
let _cachedSalvageCircle = null;
let _lastSpawnCheck = 0;
let peacefulSailTimer = 0;
let subsurfaceShadow = {
  active: false,
  x: 0,
  y: 0,
  heading: 0,
  speed: 45,
  timer: 0,
  progress: 0,
  maxDuration: 8.0,
  length: 190,
  width: 52
};

function normAngle(a) {
  a = a % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  else if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/* ==========================================================================
   HIGH-PERFORMANCE SPATIAL PARTITIONING ENGINE (Cell Size: 3000m)
   Ensures 60 FPS mobile performance over the 80,000m Ocean Expanse
   ========================================================================== */
const SPATIAL_CELL_SIZE = 3000;
const spatialGrid = {
  cells: new Map(),
  clear() {
    this.cells.clear();
  },
  getCellKey(x, y) {
    return `${Math.floor(x / SPATIAL_CELL_SIZE)},${Math.floor(y / SPATIAL_CELL_SIZE)}`;
  },
  insert(item, category) {
    const key = this.getCellKey(item.x, item.y);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = { islands: [], enemies: [], merchants: [], towers: [], mines: [], loots: [] };
      this.cells.set(key, cell);
    }
    if (cell[category]) {
      cell[category].push(item);
    }
  },
  getNearby(x, y, category, radius = SPATIAL_CELL_SIZE) {
    const minCx = Math.floor((x - radius) / SPATIAL_CELL_SIZE);
    const maxCx = Math.floor((x + radius) / SPATIAL_CELL_SIZE);
    const minCy = Math.floor((y - radius) / SPATIAL_CELL_SIZE);
    const maxCy = Math.floor((y + radius) / SPATIAL_CELL_SIZE);
    const results = [];
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const cell = this.cells.get(`${cx},${cy}`);
        if (cell && cell[category]) {
          const list = cell[category];
          for (let i = 0; i < list.length; i++) {
            results.push(list[i]);
          }
        }
      }
    }
    return results;
  }
};

function rebuildSpatialGrid() {
  spatialGrid.clear();
  if (typeof WORLD_ISLANDS !== 'undefined') {
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      spatialGrid.insert(WORLD_ISLANDS[i], 'islands');
    }
  }
  if (typeof entities !== 'undefined') {
    if (entities.enemies) {
      for (let i = 0; i < entities.enemies.length; i++) {
        spatialGrid.insert(entities.enemies[i], 'enemies');
      }
    }
    if (entities.merchants) {
      for (let i = 0; i < entities.merchants.length; i++) {
        spatialGrid.insert(entities.merchants[i], 'merchants');
      }
    }
    if (entities.towers) {
      for (let i = 0; i < entities.towers.length; i++) {
        spatialGrid.insert(entities.towers[i], 'towers');
      }
    }
    if (entities.floatingLoots) {
      for (let i = 0; i < entities.floatingLoots.length; i++) {
        spatialGrid.insert(entities.floatingLoots[i], 'loots');
      }
    }
  }
}

// Line of Sight: Checks if any island obstructs view between two coordinates using organic radius
function hasLineOfSight(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt((dx) * (dx) + (dy) * (dy));
  if (dist < 1) return true;

  const steps = Math.ceil(dist / 35);
  for (let s = 1; s < steps; s++) {
    const distFromStart = (s / steps) * dist;
    const distFromEnd = dist - distFromStart;
    if (distFromStart < 35 || distFromEnd < 35) continue; // Avoid coastal self-shadowing

    const tx = x1 + (dx / steps) * s;
    const ty = y1 + (dy / steps) * s;
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      const isl = WORLD_ISLANDS[i];
      const distToIsl = Math.sqrt((tx - isl.x) * (tx - isl.x) + (ty - isl.y) * (ty - isl.y));
      if (distToIsl > (isl.radius || 200) + 40) continue; // Skip distant islands without trigonometry
      const ang = Math.atan2(ty - isl.y, tx - isl.x);
      const rAtAng = getIslandRadiusAt(isl, ang);
      if (distToIsl < rAtAng - 16) {
        return false; // Obstructed by organic island contour
      }
    }
  }
  return true;
}

function getIslandHarborAnchor(isl, slotOffset = 0) {
  const angle = (isl.dockAngle !== undefined ? isl.dockAngle : 0) + slotOffset;
  const rAtAng = getIslandRadiusAt(isl, angle);
  const dist = Math.max(isl.dockDist || (rAtAng + 55), rAtAng + 55);
  return {
    x: isl.x + Math.cos(angle) * dist,
    y: isl.y + Math.sin(angle) * dist,
    heading: angle + Math.PI
  };
}

// Smart Island Contour Lookahead Obstacle Avoidance
function avoidIslandObstacles(ship, desiredHeading, lookahead = 175) {
  for (let i = 0; i < WORLD_ISLANDS.length; i++) {
    const isl = WORLD_ISLANDS[i];
    const dToCenter = Math.sqrt((isl.x - ship.x) * (isl.x - ship.x) + (isl.y - ship.y) * (isl.y - ship.y));
    if (dToCenter > isl.radius + lookahead + 120) continue;

    // Whisker probes: center probe, left flank (+0.42 rad), right flank (-0.42 rad)
    const whiskers = [
      { angle: desiredHeading, dist: lookahead },
      { angle: desiredHeading + 0.42, dist: lookahead * 0.8 },
      { angle: desiredHeading - 0.42, dist: lookahead * 0.8 }
    ];

    let blocked = false;
    for (let w = 0; w < whiskers.length; w++) {
      const px = ship.x + Math.cos(whiskers[w].angle) * whiskers[w].dist;
      const py = ship.y + Math.sin(whiskers[w].angle) * whiskers[w].dist;
      const pAngle = Math.atan2(py - isl.y, px - isl.x);
      const rAtAngle = getIslandRadiusAt(isl, pAngle) + (ship.radius || 20) + 40;
      if (Math.sqrt((px - isl.x) * (px - isl.x) + (py - isl.y) * (py - isl.y)) < rAtAngle) {
        blocked = true;
        break;
      }
    }

    // Proximity check to coastline
    const currAngle = Math.atan2(ship.y - isl.y, ship.x - isl.x);
    const currR = getIslandRadiusAt(isl, currAngle) + (ship.radius || 20) + 32;
    const currDist = Math.sqrt((ship.x - isl.x) * (ship.x - isl.x) + (ship.y - isl.y) * (ship.y - isl.y));
    if (currDist < currR + 25) {
      blocked = true;
    }

    if (blocked) {
      // Steer tangentially around the island contour
      const normalAngle = Math.atan2(ship.y - isl.y, ship.x - isl.x);
      let diffCW = (normalAngle + Math.PI / 2) - desiredHeading;
      diffCW = normAngle(diffCW);

      let diffCCW = (normalAngle - Math.PI / 2) - desiredHeading;
      diffCCW = normAngle(diffCCW);

      // Choose tangent that aligns closest to intended course
      const bestTangent = Math.abs(diffCW) < Math.abs(diffCCW)
        ? (normalAngle + Math.PI / 2)
        : (normalAngle - Math.PI / 2);

      // If dangerously close to shore, steer directly away from island
      if (currDist < currR + 10) {
        return normalAngle;
      }
      return bestTangent;
    }
  }
  return desiredHeading;
}

function updateHumanVoyage(e, dt) {
  // Scavenger guarding a sunken shipwreck
  if (e.guardWreckId) {
    const wreck = entities.sunkenShips.find(s => s.id === e.guardWreckId && !s.salvaged);
    if (wreck) {
      const wdx = wreck.x - e.x, wdy = wreck.y - e.y;
      const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
      // Orbit around the guarded shipwreck
      const orbitAng = Math.atan2(wdy, wdx) + Math.PI * 0.5;
      const heading = wdist > 150 ? Math.atan2(wdy, wdx) : orbitAng;
      const safeHeading = avoidIslandObstacles(e, heading, 85);
      let diff = normAngle(safeHeading - e.angle);
      e.angle += Math.sign(diff) * Math.min(Math.abs(diff), e.turnRate * 1.1 * dt);
      const cruiseSpeed = e.speed * 0.6;
      e.x += Math.cos(e.angle) * cruiseSpeed;
      e.y += Math.sin(e.angle) * cruiseSpeed;
      return;
    } else {
      e.guardWreckId = null; // Wreck salvaged or gone, convert to regular voyager
    }
  }

  if (e.isAnchored || e.voyageState === 'docked') {
    e.dockTimer = (e.dockTimer || 20) - dt;
    // Gentle bobbing at harbor anchor with ocean swell
    e.angle += Math.sin(Date.now() * 0.0012 + (e.id || 0)) * 0.002;
    if (e.dockTimer <= 0) {
      // Departure! Hoist anchor and set sail for next port of call
      e.isAnchored = false;
      e.voyageState = 'voyaging';
      const nextIsl = pickDestinationIsland(e, e.destinationIslandId);
      e.destinationIslandId = nextIsl ? nextIsl.id : 'haven';
      e.dockTimer = 0;
    }
    return;
  }

  // Active open sea voyage between harbor ports
  let destIsl = e.destinationIslandId ? WORLD_ISLANDS.find(i => i.id === e.destinationIslandId) : null;
  if (!destIsl) {
    destIsl = pickDestinationIsland(e);
    e.destinationIslandId = destIsl ? destIsl.id : 'haven';
  }

  const harbor = getIslandHarborAnchor(destIsl);
  const dx = harbor.x - e.x;
  const dy = harbor.y - e.y;
  const distToHarbor = Math.sqrt((dx) * (dx) + (dy) * (dy));

  if (distToHarbor < 95) {
    // Reached port harbor! Drop anchor and trade/dock
    e.voyageState = 'docked';
    e.isAnchored = true;
    e.dockTimer = 18 + Math.random() * 16;
    return;
  }

  // Heading towards destination harbor with intelligent island contour avoidance
  let targetHeading = Math.atan2(dy, dx);
  targetHeading = avoidIslandObstacles(e, targetHeading, 190);

  // Smooth turn towards targetHeading
  let angleDiff = targetHeading - e.angle;
  angleDiff = normAngle(angleDiff);
  e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * 0.9 * dt);

  // Cruising forward across shipping lanes
  const cruiseSpeed = e.speed * 0.65;
  e.x += Math.cos(e.angle) * cruiseSpeed;
  e.y += Math.sin(e.angle) * cruiseSpeed;
}

let encounterSpawnCooldown = 2.0;
let sunkenShipCooldown = 0;

// Spawn floating combat spoils when ships sink in battle
function createCombatDebris(x, y, tier) {
  if (entities.floatingLoots.length < 4 && Math.random() < 0.75) {
    entities.floatingLoots.push({
      id: Math.random(),
      x: x + (Math.random() - 0.5) * 26,
      y: y + (Math.random() - 0.5) * 26,
      type: Math.random() > 0.4 ? 'gold' : 'repair',
      value: Math.floor(16 + Math.random() * 24 * (tier || 1)),
      bobOffset: Math.random() * 10
    });
  }
}

function spawnWorldEntities() {
  const isMobile = isMobileDevice();
  // Dedicated capacity for open ocean encounters vs territorial island garrisons
  const maxOceanEnemies = isMobile ? 10 : 12;
  const maxIslandGuards = isMobile ? 8 : 10;
  const minLocalEnemies = isMobile ? 3 : 4;
  const localRadius = isMobile ? 1400 : 1800;
  const recycleDist = isMobile ? 2200 : 2800;
  const spawnDistMin = isMobile ? 750 : 980;
  const spawnDistMax = isMobile ? 1050 : 1350;

  const playerDist = Math.sqrt((playerState.x) * (playerState.x) + (playerState.y) * (playerState.y));
  const biome = getBiomeInfo(playerDist);

  // Count active enemies by category
  let currentOceanEnemies = 0;
  let currentIslandGuards = 0;
  let localEnemiesCount = 0;

  // 1. Distance-Based Entity Recycling: Only despawn unaware enemies when beyond recycleDist
  for (let i = entities.enemies.length - 1; i >= 0; i--) {
    const e = entities.enemies[i];
    const dx = e.x - playerState.x, dy = e.y - playerState.y;
    const distSq = dx * dx + dy * dy;

    // Check if island guard's home island is still within active sector
    if (e.homeIslandId) {
      const homeIsl = WORLD_ISLANDS.find(isl => isl.id === e.homeIslandId);
      if (homeIsl) {
        const dToIslSq = (playerState.x - homeIsl.x) * (playerState.x - homeIsl.x) + (playerState.y - homeIsl.y) * (playerState.y - homeIsl.y);
        if (dToIslSq < 3200 * 3200) {
          // Keep island guard alive while player is in the island's territorial waters!
          currentIslandGuards++;
          if (distSq < localRadius * localRadius) localEnemiesCount++;
          continue;
        }
      }
    }

    // Keep ships that are currently fighting the player
    if (distSq >= recycleDist * recycleDist && e.alertState !== 'alerted') {
      entities.enemies.splice(i, 1);
      continue;
    }

    if (e.homeIslandId) currentIslandGuards++;
    else currentOceanEnemies++;
    if (distSq < localRadius * localRadius) localEnemiesCount++;
  }

  // Despawn props when beyond maxPropDist
  const maxPropDist = isMobile ? 2000 : 2600;
  for (let i = entities.sunkenShips.length - 1; i >= 0; i--) {
    const s = entities.sunkenShips[i];
    const dx = s.x - playerState.x, dy = s.y - playerState.y;
    if (dx * dx + dy * dy >= maxPropDist * maxPropDist) {
      entities.sunkenShips.splice(i, 1);
    }
  }
  for (let i = entities.floatingLoots.length - 1; i >= 0; i--) {
    const l = entities.floatingLoots[i];
    const dx = l.x - playerState.x, dy = l.y - playerState.y;
    if (dx * dx + dy * dy >= maxPropDist * maxPropDist) {
      entities.floatingLoots.splice(i, 1);
    }
  }
  for (let i = entities.mines.length - 1; i >= 0; i--) {
    const m = entities.mines[i];
    const dx = m.x - playerState.x, dy = m.y - playerState.y;
    if (dx * dx + dy * dy >= maxPropDist * maxPropDist) {
      entities.mines.splice(i, 1);
    }
  }

  // 1.5 Sanitize any guards from conquered islands
  if (playerState.conqueredIslands && playerState.conqueredIslands.length > 0) {
    for (let i = entities.enemies.length - 1; i >= 0; i--) {
      const e = entities.enemies[i];
      if (e.homeIslandId && playerState.conqueredIslands.includes(e.homeIslandId)) {
        entities.enemies.splice(i, 1);
      }
    }
  }

  // 2. Maintain Hostile Island Garrisons & Orbital Patrols (Guaranteed Spawns)
  WORLD_ISLANDS.forEach(isl => {
    // Only hostile outposts (ignore neutral, merchant, home port, or already conquered islands)
    if (isl.clan === 'neutral' || isl.clan === 'merchant' || isl.isShopIsland || isl.isHomePort) return;
    if (playerState.conqueredIslands && playerState.conqueredIslands.includes(isl.id)) return;

    const distToPlayerSq = (isl.x - playerState.x) * (isl.x - playerState.x) + (isl.y - playerState.y) * (isl.y - playerState.y);
    if (distToPlayerSq < 2500 * 2500) {
      const existingGuards = entities.enemies.filter(e => e.homeIslandId === isl.id);
      // Fortress or major clan bastions get 3 guards; smaller outposts get 2 guards
      const targetGuards = (isl.hasFortress || (isl.tier !== undefined && isl.tier <= 2)) ? 3 : 2;

      while (existingGuards.length < targetGuards && currentIslandGuards < maxIslandGuards) {
        const guardIndex = existingGuards.length;
        const orbitDir = guardIndex % 2 === 0 ? 1 : -1;
        const baseAngle = (isl.dockAngle !== undefined ? isl.dockAngle : 0) + (guardIndex / targetGuards) * Math.PI * 2;
        const orbitDist = 65 + guardIndex * 35;
        const rAtAng = getIslandRadiusAt(isl, baseAngle);
        const spawnDist = rAtAng + orbitDist;
        const ex = isl.x + Math.cos(baseAngle) * spawnDist;
        const ey = isl.y + Math.sin(baseAngle) * spawnDist;

        // Tier distribution: flagship guard is Tier 2/3, escort skiffs are Tier 1/2
        const maxIslandTier = isl.tier !== undefined ? Math.max(1, 4 - isl.tier) : 1;
        const tierIndex = guardIndex === 0 ? Math.min(2, Math.max(1, maxIslandTier)) : Math.min(1, Math.max(0, maxIslandTier - 1));

        const tangentHeading = baseAngle + (Math.PI / 2) * orbitDir;
        const guardEntity = createEnemyEntity(isl.clan, tierIndex, ex, ey, tangentHeading, {
          homeIslandId: isl.id,
          formationType: 'solitary',
          formationRole: guardIndex === 0 ? 'guard_flagship' : 'guard_patrol',
          patrolAngle: baseAngle,
          orbitDist: orbitDist,
          orbitDir: orbitDir
        });

        entities.enemies.push(guardEntity);
        existingGuards.push(guardEntity);
        currentIslandGuards++;
      }
    }
  });

  // 3. Open Ocean Forward Intercept Encounters
  const shouldSpawnEncounter = currentOceanEnemies < maxOceanEnemies && 
    (encounterSpawnCooldown <= 0 || (localEnemiesCount < minLocalEnemies && encounterSpawnCooldown <= 1.0));

  if (shouldSpawnEncounter) {
    encounterSpawnCooldown = localEnemiesCount < minLocalEnemies 
      ? (1.8 + Math.random() * 1.5) 
      : (3.2 + Math.random() * 2.2);

    // Forward Intercept Arc: Spawn ahead of the player's heading (+/- 45 to 65 degrees)
    const isMoving = (typeof joystickState !== 'undefined' && joystickState.active) || 
                     (typeof keys !== 'undefined' && (keys['KeyW'] || keys['ArrowUp'] || keys['KeyS'] || keys['ArrowDown']));
    const playerHeading = isMoving ? playerState.angle : (Math.random() * Math.PI * 2);
    const spawnAngle = playerHeading + (Math.random() - 0.5) * 1.5;
    const spawnDist = spawnDistMin + Math.random() * (spawnDistMax - spawnDistMin);
    const ex = playerState.x + Math.cos(spawnAngle) * spawnDist;
    const ey = playerState.y + Math.sin(spawnAngle) * spawnDist;

    let insideIsland = false;
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      const isl = WORLD_ISLANDS[i];
      const ang = Math.atan2(ey - isl.y, ex - isl.x);
      if (Math.sqrt((ex - isl.x) * (ex - isl.x) + (ey - isl.y) * (ey - isl.y)) < getIslandRadiusAt(isl, ang) + 120) {
        insideIsland = true;
        break;
      }
    }

    if (!insideIsland) {
      const distFromCenter = Math.sqrt((ex) * (ex) + (ey) * (ey));
      // Safe Zone: No hostile armadas patrol inside Home Harbor waters (within 650px of center)
      if (distFromCenter >= 650) {
        // Course: Intersect or cross the player's path across shipping lanes
        const angleToPlayer = Math.atan2(playerState.y - ey, playerState.x - ex);
        const encounterAngle = angleToPlayer + (Math.random() - 0.5) * 1.2;

        if (distFromCenter >= 75000) {
          // 100% BLOOD SEA MONSTERS: Kraken (Ink Blindness), Ancient Leviathan (Whirlpool), Megalodon (Spine Shark)
          const depth = Math.min(1.0, (distFromCenter - 75000) / 11000);
          encounterSpawnCooldown = Math.max(1.4, 3.8 - depth * 2.2 + Math.random() * 1.2);
          const roll = Math.random();

          if (depth < 0.35) {
            // Shallows of Blood Sea: Megalodon stalker, Kraken scout, or Larva
            if (roll < 0.40) {
              entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                monsterType: 'megalodon',
                name: 'Hiu Purba Megalodon'
              }));
            } else if (roll < 0.70) {
              entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                monsterType: 'kraken',
                name: 'The Abyssal Kraken'
              }));
            } else {
              entities.enemies.push(createEnemyEntity('blood', 0, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                monsterType: 'larva',
                name: 'Larva Daging Pengintai'
              }));
            }
          } else if (depth < 0.75) {
            // Mid Blood Sea: The Abyssal Kraken or Megalodon Hunter Pack
            if (roll < 0.45) {
              entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                monsterType: 'kraken',
                name: 'The Abyssal Kraken'
              }));
            } else if (roll < 0.80) {
              entities.enemies.push(createEnemyEntity('blood', 2, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                monsterType: 'megalodon',
                name: 'Megalodon Gergasi Abisal'
              }));
            } else {
              entities.enemies.push(createEnemyEntity('blood', 2, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                monsterType: 'leviathan',
                name: 'Naga Laut Purba (Leviathan)'
              }));
            }
          } else {
            // Abyssal Core: Apex Ancient Leviathan & Ancient Kraken
            if (roll < 0.55) {
              entities.enemies.push(createEnemyEntity('blood', 2, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                monsterType: 'leviathan',
                name: 'Ancient Leviathan (Raja Palung)'
              }));
            } else {
              entities.enemies.push(createEnemyEntity('blood', 2, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                monsterType: 'kraken',
                name: 'The Abyssal Kraken Titan'
              }));
            }
          }
        } else if (distFromCenter >= 62000) {
          // GERBANG PALUNG NERAKA: Blood Kraken/Larvae, Viking Berserkers, Mist Cult
          const roll = Math.random();
          if (roll < 0.35) {
            entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, encounterAngle, {
              formationType: 'solitary',
              formationRole: 'solitary',
              monsterType: 'kraken',
              name: 'The Abyssal Kraken'
            }));
          } else if (roll < 0.60 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnVikingRaidFlotilla(ex, ey, encounterAngle);
          } else if (roll < 0.85 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnMistRitual(ex, ey);
          } else {
            spawnSolitaryShip(ex, ey, encounterAngle, Math.random() < 0.5 ? 'viking' : 'mist', distFromCenter);
          }
        } else if (distFromCenter >= 42000) {
          // MIST & FROST WATERS: Mist Ritual, Viking Flotilla, Iron Juggernaut
          const roll = Math.random();
          if (roll < 0.35 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnMistRitual(ex, ey);
          } else if (roll < 0.65 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnVikingRaidFlotilla(ex, ey, encounterAngle);
          } else if (roll < 0.85 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnIronWedge(ex, ey, encounterAngle);
          } else {
            const clanPick = Math.random() < 0.4 ? 'mist' : (Math.random() < 0.7 ? 'viking' : 'iron');
            spawnSolitaryShip(ex, ey, encounterAngle, clanPick, distFromCenter);
          }
        } else if (distFromCenter >= 22000) {
          // IRON SEAS & FROST FJORD: Viking Flotilla, Iron Wedge, Wokou Pack, Mist Shadows
          const roll = Math.random();
          if (roll < 0.35 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnVikingRaidFlotilla(ex, ey, encounterAngle);
          } else if (roll < 0.65 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnIronWedge(ex, ey, encounterAngle);
          } else if (roll < 0.85 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnWokouWolfpack(ex, ey, encounterAngle);
          } else {
            const clanPick = Math.random() < 0.4 ? 'viking' : (Math.random() < 0.7 ? 'iron' : (Math.random() < 0.85 ? 'wokou' : 'mist'));
            spawnSolitaryShip(ex, ey, encounterAngle, clanPick, distFromCenter);
          }
        } else if (distFromCenter >= 8000) {
          // PERAIRAN SENJA & KEPULAUAN NIAGA: Batavia Convoy, Wokou Wolfpack, Iron Wedge, Viking Snekkja
          const roll = Math.random();
          if (roll < 0.30 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnBataviaConvoy(ex, ey, encounterAngle);
          } else if (roll < 0.55 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnWokouWolfpack(ex, ey, encounterAngle);
          } else if (roll < 0.80 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnIronWedge(ex, ey, encounterAngle);
          } else {
            const clanRoll = Math.random();
            const clanPick = clanRoll < 0.35 ? 'gold' : (clanRoll < 0.65 ? 'iron' : (clanRoll < 0.85 ? 'wokou' : 'viking'));
            spawnSolitaryShip(ex, ey, encounterAngle, clanPick, distFromCenter);
          }
        } else {
          // TELUK NUSA DAMAI & PERAIRAN LUAR: Batavia Patrols, Iron Barges, Wokou Sampans
          const roll = Math.random();
          if (roll < 0.40 && currentOceanEnemies <= maxOceanEnemies - 3) {
            spawnBataviaConvoy(ex, ey, encounterAngle);
          } else if (roll < 0.65) {
            spawnSolitaryShip(ex, ey, encounterAngle, 'wokou', distFromCenter);
          } else if (roll < 0.85) {
            spawnSolitaryShip(ex, ey, encounterAngle, 'iron', distFromCenter);
          } else {
            spawnSolitaryShip(ex, ey, encounterAngle, 'gold', distFromCenter);
          }
        }
      }
    }
  }

  // 4. Guarded Sunken Ships (Contested Salvage POI, max 3)
  sunkenShipCooldown -= 0.016;
  if (entities.sunkenShips.length < 3 && sunkenShipCooldown <= 0) {
    sunkenShipCooldown = 18.0 + Math.random() * 12.0; // 18-30s cooldown between spawns
    const sAngle = Math.random() * Math.PI * 2;
    const sDist = 650 + Math.random() * 650;
    const sx = playerState.x + Math.cos(sAngle) * sDist;
    const sy = playerState.y + Math.sin(sAngle) * sDist;
    const sDistCenter = Math.sqrt((sx) * (sx) + (sy) * (sy));

    let onLand = false;
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      const isl = WORLD_ISLANDS[i];
      const ang = Math.atan2(sy - isl.y, sx - isl.x);
      if (Math.sqrt((sx - isl.x) * (sx - isl.x) + (sy - isl.y) * (sy - isl.y)) < getIslandRadiusAt(isl, ang) + 35) {
        onLand = true;
        break;
      }
    }

    if (!onLand && sDistCenter > 400) {
      const wreckId = Math.random();
      const isGuarded = Math.random() < 0.75;
      const isAbyssal = sDistCenter >= 75000;

      entities.sunkenShips.push({
        id: wreckId,
        x: sx,
        y: sy,
        angle: Math.random() * Math.PI * 2,
        radius: 38,
        salvageTime: 4.5,
        salvaged: false,
        isAbyssal: isAbyssal,
        isGuarded: isGuarded,
        goldReward: Math.floor(45 + (sDistCenter / 250)),
        bloodReward: isAbyssal ? Math.floor(5 + (sDistCenter - 75000) / 1000) : 0
      });

      // Spawn Scavenger / Guard Ship around the wreck
      if (isGuarded && currentOceanEnemies < maxOceanEnemies) {
        let guardClan = 'gold';
        let tierIdx = 0;
        if (sDistCenter >= 75000) {
          guardClan = 'blood';
          tierIdx = Math.random() < 0.5 ? 1 : 2;
        } else if (sDistCenter >= 42000) {
          guardClan = Math.random() < 0.5 ? 'mist' : 'viking';
          tierIdx = Math.random() < 0.6 ? 1 : 2;
        } else if (sDistCenter >= 22000) {
          guardClan = Math.random() < 0.4 ? 'viking' : (Math.random() < 0.7 ? 'iron' : 'wokou');
          tierIdx = Math.random() < 0.6 ? 0 : 1;
        } else if (sDistCenter >= 8000) {
          guardClan = Math.random() < 0.35 ? 'gold' : (Math.random() < 0.7 ? 'wokou' : 'iron');
          tierIdx = 0;
        } else {
          guardClan = Math.random() < 0.5 ? 'gold' : 'wokou';
          tierIdx = 0;
        }

        const gAng = Math.random() * Math.PI * 2;
        const gDist = 120 + Math.random() * 50;
        const gx = sx + Math.cos(gAng) * gDist;
        const gy = sy + Math.sin(gAng) * gDist;

        entities.enemies.push(createEnemyEntity(guardClan, tierIdx, gx, gy, gAng + Math.PI / 2, {
          formationType: 'solitary',
          formationRole: 'scavenger',
          guardWreckId: wreckId,
          name: guardClan === 'blood' ? 'Pemakan Bangkai Palung' : `Pemburu Harta ${CLAN_LORE[guardClan].name}`
        }));
      }
    }
  }

  // 5. Floating Loot crates (capped at 3, spawned primarily from battle debris)
  if (entities.floatingLoots.length < 3 && Math.random() < 0.006) {
    const fAngle = Math.random() * Math.PI * 2;
    const fDist = 450 + Math.random() * 450;
    const rollBottle = (!activeTreasureHint && Math.random() < 0.28);
    entities.floatingLoots.push({
      id: Math.random(),
      x: playerState.x + Math.cos(fAngle) * fDist,
      y: playerState.y + Math.sin(fAngle) * fDist,
      type: rollBottle ? 'bottle' : (Math.random() > 0.4 ? 'gold' : 'repair'),
      value: rollBottle ? 50 : Math.floor(12 + Math.random() * 18),
      bobOffset: Math.random() * 10
    });
  }
}

// Destroy an Island Tower/Defense & Check if Island is fully Conquered
function destroyTowerAndCheckConquer(tw, tIndex) {
  if (tIndex !== undefined && tIndex >= 0 && tIndex < entities.towers.length) {
    entities.towers.splice(tIndex, 1);
  } else {
    const idx = entities.towers.indexOf(tw);
    if (idx !== -1) entities.towers.splice(idx, 1);
  }

  // Audio & Visual Destruction FX
  screenShake = Math.max(screenShake, tw.isPeranakan ? 7 : 14);
  if (typeof sound !== 'undefined' && typeof sound.playTowerDestruction === 'function') {
    sound.playTowerDestruction(tw.x, tw.y);
  }
  if (tw.defenseType === 'tentacle' || tw.defenseType === 'flesh_spitter') {
    sound.playMonsterRoar(tw.x, tw.y);
  } else if (tw.defenseType === 'steam_harpoon' || tw.defenseType === 'steam_vent') {
    sound.playIronHit(tw.x, tw.y);
  } else {
    sound.playCannon(tw.x, tw.y);
  }

  // Destruction Debris Particles
  const partCount = tw.isPeranakan ? 14 : 26;
  for (let p = 0; p < partCount; p++) {
    const pAng = Math.random() * Math.PI * 2;
    const pSpd = 1.5 + Math.random() * 4.5;
    let pColor = '#f59e0b';
    if (tw.defenseType === 'tentacle' || tw.defenseType === 'flesh_spitter') {
      pColor = p % 2 === 0 ? '#e11d48' : '#881337';
    } else if (tw.defenseType === 'mist_spire' || tw.defenseType === 'skull_pylon') {
      pColor = p % 2 === 0 ? '#22d3ee' : '#0f766e';
    } else if (tw.defenseType === 'steam_harpoon' || tw.defenseType === 'steam_vent') {
      pColor = p % 2 === 0 ? '#94a3b8' : '#f97316';
    }
    entities.particles.push({
      x: tw.x,
      y: tw.y,
      vx: Math.cos(pAng) * pSpd,
      vy: Math.sin(pAng) * pSpd,
      life: 0.6,
      maxLife: 0.6,
      size: 3 + Math.random() * 4,
      color: pColor
    });
  }

  // Loot Bounty for Destroying Defense
  const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { rewardMultiplier: 1.0 };
  const rMult = diffCfg.rewardMultiplier || 1.0;
  const bountyGold = tw.isPeranakan ? Math.floor((30 + Math.random() * 25) * rMult) : Math.floor((90 + Math.random() * 60) * rMult);
  const bountyBlood = (tw.clan === 'blood' || tw.defenseType === 'tentacle' || tw.defenseType === 'flesh_spitter')
    ? (tw.isPeranakan ? 3 : 8) : 0;

  playerState.gold += bountyGold;
  if (bountyBlood > 0) playerState.bloodEssence += bountyBlood;

  if (bountyBlood > 0) {
    showToast(`Hancur! +${bountyGold} Koin +${bountyBlood} Darah: ${tw.name}`, "blood");
  } else {
    showToast(`Hancur! +${bountyGold} Koin: ${tw.name}`, "gold");
  }
  addFloatingText(`HANCUR! +${bountyGold} Koin`, tw.x, tw.y - 25, '#fbbf24', true);
  sound.playCoin();

  // Check Island Conquer Condition!
  if (!tw.islandId) return;
  const remaining = entities.towers.filter(t => t.islandId === tw.islandId);
  if (remaining.length === 0) {
    const isl = WORLD_ISLANDS.find(i => i.id === tw.islandId);
    if (isl && !isl.isConquered) {
      isl.isConquered = true;
      if (!playerState.conqueredIslands.includes(isl.id)) {
        playerState.conqueredIslands.push(isl.id);
      }

      // Immediately remove and surrender all defending patrol guards stationed at this conquered island
      for (let i = entities.enemies.length - 1; i >= 0; i--) {
        const guard = entities.enemies[i];
        if (guard.homeIslandId === isl.id) {
          createCombatDebris(guard.x, guard.y, guard.tier);
          entities.sinkingShips.push({
            x: guard.x,
            y: guard.y,
            angle: guard.angle,
            clan: guard.clan,
            tier: guard.tier,
            name: guard.name,
            isMonster: guard.isMonster,
            rotSpeed: (Math.random() - 0.5) * 1.8,
            progress: 0,
            maxLife: 2.0,
            life: 2.0
          });
          addFloatingText("MENYERAH!", guard.x, guard.y - 20, '#fde047', true);
          entities.enemies.splice(i, 1);
        }
      }

      // Conquest Rewards based on Tier
      const tier = isl.tier || 4;
      let conquestGold = 200;
      let conquestBlood = 0;
      if (tier === 1) {
        conquestGold = 850;
        conquestBlood = 25;
      } else if (tier === 2) {
        conquestGold = 500;
        conquestBlood = 10;
      } else if (tier === 3) {
        conquestGold = 320;
        conquestBlood = 4;
      } else {
        conquestGold = 180;
      }
      conquestGold = Math.floor(conquestGold * rMult);
      conquestBlood = Math.floor(conquestBlood * rMult);

      playerState.gold += conquestGold;
      if (conquestBlood > 0) playerState.bloodEssence += conquestBlood;

      screenShake = 22;
      if (typeof sound !== 'undefined' && typeof sound.playConquestFanfare === 'function') {
        sound.playConquestFanfare();
      } else {
        sound.playLoot();
      }

      showToast(`PULAU DITAKLUKKAN: ${isl.name}! Bendera armada berkibar! (+${conquestGold} Koin)`, "trophy");
      addFloatingText(`PULAU DITAKLUKKAN!`, isl.x, isl.y - 40, '#fde047', true);

      // Save game on conquest
      saveGame();

      // Dispatch a celebratory merchant trade convoy to the newly conquered island
      setTimeout(() => {
        if (typeof seedWorldMerchants === 'function') {
          seedWorldMerchants();
        }
      }, 1500);
    }
  }
}

// Check safe harbor port docking for player
function checkPlayerPortDocking(pState) {
  let nearPort = null;
  for (let i = 0; i < WORLD_ISLANDS.length; i++) {
    const isl = WORLD_ISLANDS[i];
    if (!isl.isHomePort && !isl.isShopIsland && !isl.isConquered) continue;

    const dx = pState.x - isl.x;
    const dy = pState.y - isl.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const harborRadius = (isl.radius || 200) + 140;

    if (dist < harborRadius) {
      nearPort = isl;
      break;
    }
  }

  if (nearPort) {
    if (!pState.isDockedAtPort) {
      pState.isDockedAtPort = true;
      pState.dockedPort = nearPort;
      showToast(`Berlabuh di ${nearPort.name}: Galangan kapal siap melayani!`, "anchor");
      if (typeof sound !== 'undefined' && typeof sound.playPortDocking === 'function') {
        sound.playPortDocking();
      } else if (sound.playSplash) {
        sound.playSplash();
      }
    }
    pState.dockedPort = nearPort;

    // Passive gentle harbor repair (+1.5 HP/sec at safe dock)
    const maxHp = getStatValue('hull', pState.upgrades.hull);
    if (pState.hp < maxHp) {
      pState.hp = Math.min(maxHp, pState.hp + 0.05);
    }
  } else {
    if (pState.isDockedAtPort) {
      pState.isDockedAtPort = false;
      pState.dockedPort = null;
      if (typeof sound !== 'undefined' && typeof sound.playWeighAnchor === 'function') {
        sound.playWeighAnchor();
      }
    }
  }
}

// Dynamic Map Exploration & Fog of War Sector Tracking
function recordMapExploration(x, y, mapLevel = 1) {
  if (!playerState.exploredSectors) playerState.exploredSectors = {};
  const cfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined' && MAP_UPGRADE_CONFIG[mapLevel])
    ? MAP_UPGRADE_CONFIG[mapLevel]
    : { fogClearanceRadius: 2400 };

  const clearRadius = cfg.fogClearanceRadius || 2400;
  const sectorSize = (typeof FOG_SECTOR_SIZE !== 'undefined') ? FOG_SECTOR_SIZE : 1200;
  const secRadius = Math.ceil(clearRadius / sectorSize);
  const centerSecX = Math.round(x / sectorSize);
  const centerSecY = Math.round(y / sectorSize);

  for (let dx = -secRadius; dx <= secRadius; dx++) {
    for (let dy = -secRadius; dy <= secRadius; dy++) {
      if (dx * dx + dy * dy <= secRadius * secRadius) {
        const sx = centerSecX + dx;
        const sy = centerSecY + dy;
        playerState.exploredSectors[`${sx},${sy}`] = 1;
      }
    }
  }
}

// Merchant Shipping Convoys AI & Navigation
function updateMerchants(dt) {
  if (!entities.merchants || entities.merchants.length === 0) return;

  const safePorts = WORLD_ISLANDS.filter(i => i.isHomePort || i.isShopIsland || i.isConquered);
  if (safePorts.length === 0) return;

  for (let i = entities.merchants.length - 1; i >= 0; i--) {
    const m = entities.merchants[i];

    // 1. Sinking Check
    if (m.hp <= 0) {
      sound.playMineExplosion(m.x, m.y);
      screenShake = Math.max(screenShake, 8);
      for (let c = 0; c < 3; c++) {
        entities.floatingLoots.push({
          id: Math.random(),
          x: m.x + (Math.random() - 0.5) * 40,
          y: m.y + (Math.random() - 0.5) * 40,
          type: 'gold',
          value: Math.floor(35 + Math.random() * 30),
          bobOffset: Math.random() * 10
        });
      }
      addFloatingText("KAPAL NIAGA KARAM!", m.x, m.y - 25, '#fbbf24', true);
      showToast("Kapal Niaga karam! Muatan kargo rempah & emas mengapung!", "gold");

      entities.sinkingShips.push({
        x: m.x,
        y: m.y,
        angle: m.angle,
        clan: 'merchant',
        tier: 1,
        name: m.name,
        isMonster: false,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        progress: 0,
        maxLife: 2.2,
        life: 2.2
      });

      entities.merchants.splice(i, 1);
      continue;
    }

    // 2. Fleeing state (Cargo ships when attacked)
    if (m.state === 'fleeing') {
      m.fleeTimer -= dt;
      if (m.fleeTimer <= 0) {
        m.state = 'sailing';
      } else {
        const fleeAngle = Math.atan2(m.y - playerState.y, m.x - playerState.x);
        let safeAngle = avoidIslandObstacles(m, fleeAngle, 140);
        let diff = normAngle(safeAngle - m.angle);
        m.angle += Math.sign(diff) * Math.min(Math.abs(diff), 2.8 * dt);

        const fleeSpeed = m.speed * 1.35;
        m.x += Math.cos(m.angle) * fleeSpeed;
        m.y += Math.sin(m.angle) * fleeSpeed;

        if (Math.random() < 0.008 && entities.floatingLoots.length < 5) {
          entities.floatingLoots.push({
            id: Math.random(),
            x: m.x,
            y: m.y,
            type: 'gold',
            value: Math.floor(25 + Math.random() * 20),
            bobOffset: 0
          });
          addFloatingText("Kargo Dibuang!", m.x, m.y - 18, '#fbbf24');
        }
        continue;
      }
    }

    // 3. Retaliating state (Escort Cutters when attacked)
    if (m.state === 'retaliating') {
      m.shootCooldown -= dt;
      const dToP = Math.hypot(playerState.x - m.x, playerState.y - m.y);
      if (dToP > 750) {
        m.state = 'sailing';
      } else {
        const angToP = Math.atan2(playerState.y - m.y, playerState.x - m.x);
        const broadsideAng = angToP + Math.PI * 0.5;
        let safeAng = avoidIslandObstacles(m, broadsideAng, 140);
        let diff = normAngle(safeAng - m.angle);
        m.angle += Math.sign(diff) * Math.min(Math.abs(diff), 2.6 * dt);

        const cruise = m.speed * 0.85;
        m.x += Math.cos(m.angle) * cruise;
        m.y += Math.sin(m.angle) * cruise;

        if (m.shootCooldown <= 0 && dToP < 420 && hasLineOfSight(m.x, m.y, playerState.x, playerState.y)) {
          m.shootCooldown = 1.6 + Math.random() * 0.8;
          sound.playCannon(m.x, m.y);
          const fAngle = Math.atan2(playerState.y - m.y, playerState.x - m.x);
          entities.projectiles.push({
            type: 'cannonball',
            sourceClan: 'merchant',
            x: m.x + Math.cos(fAngle) * 20,
            y: m.y + Math.sin(fAngle) * 20,
            vx: Math.cos(fAngle) * 7.5,
            vy: Math.sin(fAngle) * 7.5,
            radius: 5,
            damage: m.damage || 14,
            isPlayer: false,
            life: 1.2
          });
        }
        continue;
      }
    }

    // 4. Normal Shipping Trade Route navigation between friendly ports
    if (m.state === 'docked') {
      m.dockTimer -= dt;
      m.angle += Math.sin(Date.now() * 0.0015 + (m.id ? m.id.charCodeAt(0) : 0)) * 0.0015;

      if (m.dockTimer <= 0) {
        m.state = 'sailing';
        m.isAnchored = false;
        m.taxPaid = false;
        m.currentWpIdx = (m.currentWpIdx + 1) % (m.waypoints && m.waypoints.length > 0 ? m.waypoints.length : safePorts.length);
      }
      continue;
    }

    // Sailing towards current waypoint island
    let targetPort = null;
    if (m.waypoints && m.waypoints.length > 0) {
      targetPort = m.waypoints[m.currentWpIdx % m.waypoints.length];
    }
    if (!targetPort || !safePorts.some(p => p.id === targetPort.id)) {
      targetPort = safePorts[Math.floor(Math.random() * safePorts.length)];
      if (m.waypoints) m.waypoints = safePorts;
    }

    const harbor = getIslandHarborAnchor(targetPort);
    const dx = harbor.x - m.x;
    const dy = harbor.y - m.y;
    const distToHarbor = Math.hypot(dx, dy);

    if (distToHarbor < 90) {
      m.state = 'docked';
      m.isAnchored = true;
      m.dockTimer = 16 + Math.random() * 14;

      if (!m.taxPaid && (playerState.conqueredIslands.includes(targetPort.id) || targetPort.id === 'haven')) {
        m.taxPaid = true;
        const tax = m.type === 'cargo' ? Math.floor(18 + Math.random() * 16) : Math.floor(8 + Math.random() * 8);
        playerState.gold += tax;
        addFloatingText(`+${tax} Pajak Niaga!`, m.x, m.y - 25, '#fbbf24');
        showToast(`Saudagar berlabuh di ${targetPort.name}! Membayar pajak niaga +${tax} Koin`, "gold");
        sound.playCoin();
      }
      continue;
    }

    let desiredHeading = Math.atan2(dy, dx);
    desiredHeading = avoidIslandObstacles(m, desiredHeading, 175);

    let diff = normAngle(desiredHeading - m.angle);
    m.angle += Math.sign(diff) * Math.min(Math.abs(diff), 2.2 * dt);

    const speed = m.speed * 0.75;
    m.x += Math.cos(m.angle) * speed;
    m.y += Math.sin(m.angle) * speed;

    if (Math.random() < 0.35) {
      entities.seaRipples.push({
        x: m.x - Math.cos(m.angle) * (m.radius * 0.8),
        y: m.y - Math.sin(m.angle) * (m.radius * 0.8),
        radius: 3,
        maxRadius: 16,
        alpha: 0.45,
        color: 'rgba(255, 255, 255, '
      });
    }
  }
}

/* ==========================================================================
   DYNAMIC REGIONAL WEATHER SIMULATION & HAZARDS ENGINE
   Location-Gated Atmospheric Events, Lightning Telegraphing, & Compass Distortions
   ========================================================================== */

function updateWeatherSystem(dt) {
  if (typeof weatherState === 'undefined') return;

  const playerDist = Math.hypot(playerState.x, playerState.y);
  const availableWeathers = (typeof getAvailableWeathersForDistance === 'function') 
    ? getAvailableWeathersForDistance(playerDist) 
    : ['clear'];

  // Check if current weather is still allowed in this distance zone
  const isCurrentAllowed = weatherState.type === 'clear' || availableWeathers.includes(weatherState.type);

  // Weather Event Lifecycle State Machine
  if (weatherState.targetType !== weatherState.type) {
    // Transitioning between weathers
    if (weatherState.targetType === 'clear') {
      weatherState.intensity = Math.max(0, weatherState.intensity - dt * 0.22); // ~4.5s fade out
      if (weatherState.intensity <= 0) {
        weatherState.type = 'clear';
        weatherState.cooldown = 32 + Math.random() * 22; // 32-54s calm period
      }
    } else {
      weatherState.type = weatherState.targetType;
      weatherState.intensity = Math.min(1.0, weatherState.intensity + dt * 0.22); // ~4.5s fade in
    }
  } else {
    // Stable state
    if (weatherState.type === 'clear') {
      weatherState.cooldown -= dt;
      if (weatherState.cooldown <= 0) {
        // Pick a random weather from available weathers in player's current zone
        const nextWeather = availableWeathers[Math.floor(Math.random() * availableWeathers.length)];
        weatherState.targetType = nextWeather;
        weatherState.timer = 45 + Math.random() * 25; // 45-70s duration
        weatherState.intensity = 0.05;
        
        // Trigger banner announcement
        const cfg = (typeof WEATHER_CONFIGS !== 'undefined') ? (WEATHER_CONFIGS[nextWeather] || WEATHER_CONFIGS.clear) : { name: nextWeather, subtext: '' };
        weatherState.banner = {
          text: `CUACA BERUBAH: ${cfg.name.toUpperCase()}`,
          subtext: cfg.subtext,
          alpha: 1.0,
          timer: 5.5
        };
        showToast(`Cuaca: ${cfg.name} - ${cfg.subtext}`, "compass");
        if (typeof sound !== 'undefined' && typeof sound.playWindGust === 'function') {
          sound.playWindGust();
        }
      }
    } else {
      // Weather event active!
      // If player sailed into a zone where current weather is disallowed, force end early
      if (!isCurrentAllowed) {
        weatherState.timer = Math.min(weatherState.timer, 2.0);
      }

      weatherState.timer -= dt;
      if (weatherState.timer <= 0) {
        // Weather ending, return to clear
        weatherState.targetType = 'clear';
      }
    }
  }

  // Banner fadeout
  if (weatherState.banner && weatherState.banner.timer > 0) {
    weatherState.banner.timer -= dt;
    if (weatherState.banner.timer < 1.0) {
      weatherState.banner.alpha = Math.max(0, weatherState.banner.timer);
    }
  }

  // Update Config & Compass Status
  const activeCfg = (typeof WEATHER_CONFIGS !== 'undefined') 
    ? (WEATHER_CONFIGS[weatherState.type] || WEATHER_CONFIGS.clear) 
    : { compassStatus: 'normal' };

  if (weatherState.intensity > 0.3) {
    weatherState.compassStatus = activeCfg.compassStatus || 'normal';
  } else {
    weatherState.compassStatus = 'normal';
  }

  // Update Dynamic Wind Angle
  const windRate = (activeCfg.hasWindDrift ? 0.0035 : 0.0012) * (1 + weatherState.intensity * 0.8);
  windAngle += windRate * dt;

  // Calculate Wind Drift Vector
  if (activeCfg.hasWindDrift && weatherState.intensity > 0.1) {
    const driftSpeed = 38 * (activeCfg.windDriftMultiplier || 1.0) * weatherState.intensity;
    weatherState.windDrift.x = Math.cos(windAngle) * driftSpeed;
    weatherState.windDrift.y = Math.sin(windAngle) * driftSpeed;
  } else {
    weatherState.windDrift.x = 0;
    weatherState.windDrift.y = 0;
  }

  // Handle Lightning Strikes (Thunderstorm & Blood Tempest)
  if (activeCfg.hasLightning && weatherState.intensity > 0.35) {
    if (!weatherState._lightningCooldown) weatherState._lightningCooldown = 3.5 + Math.random() * 3.5;
    weatherState._lightningCooldown -= dt;
    if (weatherState._lightningCooldown <= 0) {
      weatherState._lightningCooldown = 4.8 + Math.random() * 4.2;
      
      // Spawn strike near player (telegraphed)
      const strikeAng = Math.random() * Math.PI * 2;
      const strikeDist = 100 + Math.random() * 340;
      const sx = playerState.x + Math.cos(strikeAng) * strikeDist;
      const sy = playerState.y + Math.sin(strikeAng) * strikeDist;
      const isBlood = Boolean(activeCfg.isBlood);

      // Pre-generate lightning branch points
      const branches = [];
      const numSegments = 7;
      let currX = sx + (Math.random() - 0.5) * 50;
      let currY = sy - 420;
      branches.push({ x: currX, y: currY });
      for (let s = 1; s <= numSegments; s++) {
        const segY = currY + (420 / numSegments) * s;
        const segX = (s === numSegments) ? sx : currX + (Math.random() - 0.5) * 55;
        branches.push({ x: segX, y: segY });
        currX = segX;
      }

      weatherState.activeStrikes.push({
        x: sx,
        y: sy,
        timer: 1.25, // 1.25s telegraph circle warning
        strikeDuration: 0.28,
        hasStruck: false,
        isBlood: isBlood,
        branches: branches
      });
      if (typeof sound !== 'undefined' && typeof sound.playLightningWarning === 'function') {
        sound.playLightningWarning(sx, sy);
      }
    }
  }

  // Process Active Lightning Strikes
  if (weatherState.activeStrikes) {
    for (let i = weatherState.activeStrikes.length - 1; i >= 0; i--) {
      const s = weatherState.activeStrikes[i];
      s.timer -= dt;

      if (s.timer <= 0 && !s.hasStruck) {
        s.hasStruck = true;
        // Strike event!
        screenShake = Math.max(screenShake, s.isBlood ? 22 : 17);
        if (typeof sound !== 'undefined' && typeof sound.playThunderClap === 'function') {
          sound.playThunderClap(s.isBlood);
        }

        // Check damage to player (if within blast radius)
        const dToP = Math.hypot(playerState.x - s.x, playerState.y - s.y);
        if (dToP < 80) {
          const dmg = Math.floor(30 + Math.random() * 15);
          playerState.hp = Math.max(1, playerState.hp - dmg);
          addFloatingText(`TERSEMBAR PETIR! -${dmg}`, playerState.x, playerState.y - 30, '#ef4444', true);
          showToast(`Kapal tersambar petir ganas! (-${dmg} HP)`, "crosshairs");
        }

        // Check damage to nearby enemies
        if (entities.enemies) {
          entities.enemies.forEach(e => {
            const dToE = Math.hypot(e.x - s.x, e.y - s.y);
            if (dToE < 85) {
              e.hp -= 45;
              addFloatingText(`PETIR -45`, e.x, e.y - 20, '#fef08a', true);
            }
          });
        }

        // Splash particles
        for (let p = 0; p < 16; p++) {
          const pAng = Math.random() * Math.PI * 2;
          const pSpd = 40 + Math.random() * 90;
          entities.particles.push({
            x: s.x,
            y: s.y,
            vx: Math.cos(pAng) * pSpd,
            vy: Math.sin(pAng) * pSpd,
            size: 2.5 + Math.random() * 2.5,
            color: s.isBlood ? '#ef4444' : '#fef08a',
            alpha: 1.0,
            maxLife: 0.5,
            life: 0.5
          });
        }
      }

      if (s.hasStruck) {
        s.strikeDuration -= dt;
        if (s.strikeDuration <= 0) {
          weatherState.activeStrikes.splice(i, 1);
        }
      }
    }
  }

  // Handle Blood Rain Corrosion (Blood Tempest in Red Sea)
  if (activeCfg.hasBloodCorrosion && weatherState.intensity > 0.55 && !playerState.isDockedAtPort) {
    weatherState.bloodCorrosionTimer += dt;
    if (weatherState.bloodCorrosionTimer >= 1.2) {
      weatherState.bloodCorrosionTimer = 0;
      // Corrosive blood rain eats away 1 HP
      if (playerState.hp > 5) {
        playerState.hp -= 1;
        addFloatingText("-1 Darah Korosif", playerState.x + (Math.random() - 0.5) * 20, playerState.y - 25, '#f43f5e', false);
        if (typeof sound !== 'undefined' && typeof sound.triggerCorrosiveSizzle === 'function') {
          sound.triggerCorrosiveSizzle(dt);
        }
      }
    }
  }

  // Dynamic Weather Ambience Streams & Atmospheric SFX
  if (typeof sound !== 'undefined') {
    if (typeof sound.updateWeatherAmbience === 'function') {
      sound.updateWeatherAmbience(weatherState.type, weatherState.intensity, playerDist, dt);
    }
    // Occult Whispers & Compass Glitch in dense fog & blood sea
    if (weatherState.compassStatus !== 'normal' && weatherState.intensity > 0.35) {
      if (weatherState.compassStatus === 'jitter' || weatherState.compassStatus === 'corrupted') {
        sound.playCompassGlitch();
      }
      if (weatherState.compassStatus === 'corrupted' || playerDist >= 75000) {
        sound.playOccultWhisper();
      }
    }
    // Heavy ocean swell crash during storm, thunderstorm, or blood tempest
    if ((weatherState.type === 'storm' || weatherState.type === 'thunderstorm' || weatherState.type === 'blood_tempest') && weatherState.intensity > 0.4) {
      if (Math.random() < 0.05 * dt * 60) {
        const swX = playerState.x + (Math.random() - 0.5) * 360;
        const swY = playerState.y + (Math.random() - 0.5) * 360;
        sound.playOceanSwellCrash(swX, swY);
      }
    }
    // Periodic gale wind gusts
    if ((weatherState.type === 'gale' || weatherState.type === 'storm' || weatherState.type === 'blood_tempest') && weatherState.intensity > 0.3) {
      if (Math.random() < 0.03 * dt * 60) {
        sound.playWindGust();
      }
    }
  }
}

function updateGame(dt) {
  rebuildSpatialGrid();
  updateWeatherSystem(dt);
  const currentMaxHp = getStatValue('hull', playerState.upgrades.hull);
  const moveSpeed = getStatValue('speed', playerState.upgrades.speed);

  const activeWeatherCfg = (typeof WEATHER_CONFIGS !== 'undefined' && typeof weatherState !== 'undefined')
    ? (WEATHER_CONFIGS[weatherState.type] || WEATHER_CONFIGS.clear)
    : null;

  // Dynamic Ocean Wind & Sailing Tailwind Bonus
  const windAlignment = Math.cos(playerState.angle - windAngle);
  let tailwindBonus = 1;
  if (activeWeatherCfg && activeWeatherCfg.hasWindDrift) {
    if (windAlignment > 0) {
      tailwindBonus = 1 + windAlignment * (0.15 + 0.15 * weatherState.intensity); // Up to +30% tailwind!
    } else {
      tailwindBonus = 1 + windAlignment * (0.12 * weatherState.intensity); // Up to -12% headwind penalty!
    }
  } else {
    tailwindBonus = 1 + Math.max(0, windAlignment) * 0.15;
  }

  // Iron Harpoon Snare Debuff
  if (playerState.speedSnareTimer > 0) {
    playerState.speedSnareTimer -= dt;
  }
  const snareMultiplier = (playerState.speedSnareTimer > 0) ? 0.65 : 1.0;

  // Kraken Inked Blindness & Slow Debuff
  if (playerState.inkedTimer > 0) {
    playerState.inkedTimer -= dt;
  }
  const inkMultiplier = (playerState.inkedTimer > 0) ? 0.60 : 1.0;

  // Player Naval Steering & Movement (Dedicated PC Rudder/Throttle OR Mobile Touch Joystick)
  let isPlayerMoving = false;

  if (typeof pcNavalState !== 'undefined' && pcNavalState.active) {
    // 1. DEDICATED PC NAVAL CONTROLS (A/D Rudder, W/S Throttle)
    isPlayerMoving = true;

    // Rudder Rotation with Wind Steering Resistance
    const headingDiffFromWind = normAngle(playerState.angle - windAngle);
    const turningAgainstWind = (pcNavalState.rudder > 0 && headingDiffFromWind > 0) || (pcNavalState.rudder < 0 && headingDiffFromWind < 0);
    const windSteerPenalty = (activeWeatherCfg && activeWeatherCfg.hasWindDrift && turningAgainstWind) ? (1 - 0.28 * weatherState.intensity) : 1.0;
    const navalTurnSpeed = 2.4 * dt * windSteerPenalty;
    playerState.angle += pcNavalState.rudder * navalTurnSpeed;

    // Speed modifiers (Shift Boost / Ctrl Stealth)
    let speedMult = 0.9;
    if (pcNavalState.boost) speedMult = 1.25;
    else if (pcNavalState.stealth) speedMult = 0.38;

    const currentSpeed = moveSpeed * pcNavalState.throttle * speedMult * tailwindBonus * snareMultiplier * inkMultiplier;
    playerState.x += Math.cos(playerState.angle) * currentSpeed;
    playerState.y += Math.sin(playerState.angle) * currentSpeed;

    // Wind Drift Vector Application
    if (weatherState && (weatherState.windDrift.x !== 0 || weatherState.windDrift.y !== 0)) {
      playerState.x += weatherState.windDrift.x * dt;
      playerState.y += weatherState.windDrift.y * dt;
    }

    // Player Water Trail Wake (Only when sailing forward!)
    if (pcNavalState.throttle > 0 && Math.random() < 0.65) {
      const sternX = playerState.x - Math.cos(playerState.angle) * 20;
      const sternY = playerState.y - Math.sin(playerState.angle) * 20;
      entities.seaRipples.push({
        x: sternX,
        y: sternY,
        radius: 4,
        maxRadius: 26,
        alpha: 0.55,
        color: 'rgba(255, 255, 255, '
      });
    }
  } else if (joystickState.active && joystickState.magnitude > 0.08) {
    // 2. MOBILE TOUCH VIRTUAL HELM JOYSTICK
    isPlayerMoving = true;
    const targetAngle = joystickState.angle;
    let diff = targetAngle - playerState.angle;
    
    diff = normAngle(diff);

    // Turning Resistance against Gale Wind
    const headingDiffFromWind = normAngle(playerState.angle - windAngle);
    const turningAgainstWind = (Math.sign(diff) > 0 && headingDiffFromWind > 0) || (Math.sign(diff) < 0 && headingDiffFromWind < 0);
    const windSteerPenalty = (activeWeatherCfg && activeWeatherCfg.hasWindDrift && turningAgainstWind) ? (1 - 0.28 * weatherState.intensity) : 1.0;
    const turnSpeed = 3.2 * dt * windSteerPenalty;
    playerState.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);

    const currentSpeed = moveSpeed * joystickState.magnitude * tailwindBonus * snareMultiplier * inkMultiplier;
    playerState.x += Math.cos(playerState.angle) * currentSpeed;
    playerState.y += Math.sin(playerState.angle) * currentSpeed;

    // Wind Drift Vector Application
    if (weatherState && (weatherState.windDrift.x !== 0 || weatherState.windDrift.y !== 0)) {
      playerState.x += weatherState.windDrift.x * dt;
      playerState.y += weatherState.windDrift.y * dt;
    }

    // Player Water Trail (Only when moving forward!)
    if (Math.random() < 0.65) {
      const sternX = playerState.x - Math.cos(playerState.angle) * 20;
      const sternY = playerState.y - Math.sin(playerState.angle) * 20;
      entities.seaRipples.push({
        x: sternX,
        y: sternY,
        radius: 4,
        maxRadius: 26,
        alpha: 0.55,
        color: 'rgba(255, 255, 255, '
      });
    }
  } else {
    // Idle drifting with wind force when undocked
    if (weatherState && (weatherState.windDrift.x !== 0 || weatherState.windDrift.y !== 0) && !playerState.isDockedAtPort) {
      playerState.x += weatherState.windDrift.x * 0.7 * dt;
      playerState.y += weatherState.windDrift.y * 0.7 * dt;
    }
  }

  // Ocean Storm Heavy Wave Camera Sway
  if (activeWeatherCfg && activeWeatherCfg.id === 'storm' && weatherState && weatherState.intensity > 0.3) {
    if (Math.random() < 0.04) {
      screenShake = Math.max(screenShake, 3.5 * weatherState.intensity);
    }
  }

  // Leviathan Whirlpool Suction Pull on Player Ship
  if (playerState.whirlpoolPull && (playerState.whirlpoolPull.x !== 0 || playerState.whirlpoolPull.y !== 0)) {
    playerState.x += playerState.whirlpoolPull.x * dt;
    playerState.y += playerState.whirlpoolPull.y * dt;
    playerState.whirlpoolPull.x = 0;
    playerState.whirlpoolPull.y = 0;
  }

  // Island physical collision using Procedural Coastline Radius (Spatial Grid Optimized)
  const nearbyIslands = spatialGrid.getNearby(playerState.x, playerState.y, 'islands', 2500);
  for (let i = 0; i < nearbyIslands.length; i++) {
    const isl = nearbyIslands[i];
    const _dx = playerState.x - isl.x, _dy = playerState.y - isl.y;
    const _maxR = ((isl.radius || 200) * 1.3 + 50);
    if (_dx * _dx + _dy * _dy > _maxR * _maxR) continue;
    const ang = Math.atan2(_dy, _dx);
    const rAtAng = getIslandRadiusAt(isl, ang);
    const d = Math.sqrt(_dx * _dx + _dy * _dy);
    const minDist = rAtAng + 15;
    if (d < minDist && d > 0.001) {
      playerState.x = isl.x + Math.cos(ang) * minDist;
      playerState.y = isl.y + Math.sin(ang) * minDist;
    }
  }

  // Max Distance Record
  const distFromStart = Math.floor(Math.sqrt((playerState.x) * (playerState.x) + (playerState.y) * (playerState.y)));
  if (distFromStart > playerState.maxDistanceReached) {
    playerState.maxDistanceReached = distFromStart;
  }

  // Safe Harbor & Port Docking Verification
  checkPlayerPortDocking(playerState);

  // Dynamic Map Exploration & Fog of War Sector Tracking
  recordMapExploration(playerState.x, playerState.y, playerState.mapLevel);

  // Active Treasure Map proximity check
  if (activeTreasureHint) {
    const distToTreasure = Math.hypot(playerState.x - activeTreasureHint.x, playerState.y - activeTreasureHint.y);
    if (distToTreasure < 140) {
      showToast(`Harta Karun Terungkap: ${activeTreasureHint.name}!`, "compass");
      playerState.gold += 80;
      sound.playLoot();
      activeTreasureHint = null;
    }
  }

  // Subsurface Leviathan Shadow update (deep waters only)
  if (distFromStart >= 42000 && battleIntensityLevel === 0) {
    subsurfaceShadow.timer += dt;
    if (subsurfaceShadow.timer > 70 && !subsurfaceShadow.active) {
      subsurfaceShadow.timer = 0;
      subsurfaceShadow.active = true;
      subsurfaceShadow.progress = 0;
      subsurfaceShadow.heading = playerState.angle + (Math.random() > 0.5 ? 0.65 : -0.65);
      subsurfaceShadow.x = playerState.x - Math.cos(subsurfaceShadow.heading) * 350;
      subsurfaceShadow.y = playerState.y - Math.sin(subsurfaceShadow.heading) * 350;
    }
  }
  if (subsurfaceShadow.active) {
    subsurfaceShadow.progress += dt;
    subsurfaceShadow.x += Math.cos(subsurfaceShadow.heading) * subsurfaceShadow.speed * dt;
    subsurfaceShadow.y += Math.sin(subsurfaceShadow.heading) * subsurfaceShadow.speed * dt;
    if (subsurfaceShadow.progress >= subsurfaceShadow.maxDuration) {
      subsurfaceShadow.active = false;
    }
  }

  // Peaceful Sailing Crew Whistle
  if (isPlayerMoving && battleIntensityLevel === 0 && !getBiomeInfo(distFromStart).isBloodSea) {
    peacefulSailTimer += dt;
    if (peacefulSailTimer > 36) {
      peacefulSailTimer = 0;
      sound.playSeaShantyWhistle();
    }
  } else {
    peacefulSailTimer = 0;
  }

  // Biome & Blood Sea roar ambient & First Encounter Ambush (Only in true Laut Merah >= 75000m)
  const biome = getBiomeInfo(distFromStart);
  if (biome.isBloodSea) {
    // Immediate Dramatic Ambush on first crossing into the Blood Sea!
    if (!hasEnteredBloodSeaThisRun) {
      hasEnteredBloodSeaThisRun = true;
      screenShake = 16;
      sound.playMonsterRoar(playerState.x, playerState.y);
      sound.playEerieRoar();
      showToast("PERINGATAN: Lautan memerah darah! Monster purba bangkit!", "skull");

      // Instantly surface an abyssal monster hunter directly in front of the player's path
      const ambushAngle = playerState.angle + (Math.random() - 0.5) * 0.4;
      const ambushDist = 460;
      const ax = playerState.x + Math.cos(ambushAngle) * ambushDist;
      const ay = playerState.y + Math.sin(ambushAngle) * ambushDist;
      entities.enemies.push(createEnemyEntity('blood', 1, ax, ay, ambushAngle + Math.PI, {
        formationType: 'solitary',
        formationRole: 'solitary',
        name: 'Kraken Pemburu Pertama'
      }));

      // Surface water burst particles
      for (let p = 0; p < 12; p++) {
        entities.particles.push({
          x: ax + (Math.random() - 0.5) * 30,
          y: ay + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 1.2,
          maxLife: 1.2,
          size: 6 + Math.random() * 6,
          color: '#e11d48'
        });
      }
    }

    bloodSeaRoarTimer += dt;
    if (bloodSeaRoarTimer > 18) {
      bloodSeaRoarTimer = 0;
      sound.playEerieRoar();
      showToast("Jeritan terdengar dari palung Laut Darah...", "alert");
    }
  }

  // Broadside & Naval Battery Auto-Fire with Dynamic Traverse Aiming
  const fireDelay = Math.max(0.35, 1.3 - (playerState.upgrades.speed - 1) * 0.1);
  const currentTimeSec = Date.now() / 1000;

  if (currentTimeSec - lastFireTime >= fireDelay) {
    let primaryTarget = null;
    let targetAimAngle = null;

    // 1. Scan for nearby hostile island defenses (generous 450px range!)
    for (let t = 0; t < entities.towers.length; t++) {
      const tw = entities.towers[t];
      if (tw.clan === 'neutral' || tw.defenseType === 'haven_bastion') continue;

      const dx = tw.x - playerState.x, dy = tw.y - playerState.y;
      const dSq = dx * dx + dy * dy;
      if (dSq > 450 * 450) continue;
      if (!hasLineOfSight(playerState.x, playerState.y, tw.x, tw.y)) continue;

      const angToTw = Math.atan2(dy, dx);
      let relAng = Math.abs(normAngle(angToTw - playerState.angle));

      // Wide broadside arc + forward engagement (25 deg to 155 deg)
      if (relAng > 0.35 && relAng < 2.8) {
        primaryTarget = tw;
        targetAimAngle = angToTw;
        break;
      }
    }

    // 2. Scan for enemy ships (range up to 330px)
    if (!primaryTarget) {
      for (let e = 0; e < entities.enemies.length; e++) {
        const en = entities.enemies[e];
        const dx = en.x - playerState.x, dy = en.y - playerState.y;
        const dSq = dx * dx + dy * dy;
        if (dSq > 330 * 330) continue;
        if (!hasLineOfSight(playerState.x, playerState.y, en.x, en.y)) continue;

        const angToEn = Math.atan2(dy, dx);
        let relAng = Math.abs(normAngle(angToEn - playerState.angle));
        if (relAng > 0.55 && relAng < 2.55) {
          primaryTarget = en;
          targetAimAngle = angToEn;
          break;
        }
      }
    }

    if (primaryTarget) {
      fireCannons(playerState, primaryTarget, true, targetAimAngle);
    }
  }

  // Rear Defense / Stern Chaser check
  if (playerState.upgrades.rearDefense > 0) {
    const checkRear = (e) => {
      const dx = e.x - playerState.x, dy = e.y - playerState.y;
      if (dx * dx + dy * dy > 240 * 240) return false;
      if (!hasLineOfSight(playerState.x, playerState.y, e.x, e.y)) return false;
      const angleToEnemy = Math.atan2(e.y - playerState.y, e.x - playerState.x);
      let relativeAngle = Math.abs(angleToEnemy - playerState.angle);
      while (relativeAngle > Math.PI) relativeAngle = Math.abs(relativeAngle - Math.PI * 2);
      return relativeAngle >= 2.35;
    };

    const isHostileTowerRear = (tw) => tw.clan !== 'neutral' && tw.defenseType !== 'haven_bastion' && checkRear(tw);
    const targetInRear = entities.enemies.some(checkRear) || entities.towers.some(isHostileTowerRear);

    if (targetInRear) {
      triggerPlayerRearDefense();
    }
  }

  // Floating Player Mines Lifecycle & Detonation
  for (let i = entities.mines.length - 1; i >= 0; i--) {
    const mine = entities.mines[i];
    mine.life -= dt;

    for (let j = entities.enemies.length - 1; j >= 0; j--) {
      const e = entities.enemies[j];
      const dx = e.x - mine.x, dy = e.y - mine.y;
      if (dx * dx + dy * dy < (e.radius + mine.radius) * (e.radius + mine.radius)) {
        e.hp -= mine.damage;
        sound.playMineExplosion(mine.x, mine.y);
        screenShake = Math.max(screenShake, 8);
        addFloatingText(`RANJAU! -${Math.round(mine.damage)}`, e.x, e.y, '#f97316', true);

        for (let k = 0; k < 18; k++) {
          entities.particles.push({
            x: mine.x,
            y: mine.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 0.5,
            color: k % 2 === 0 ? '#f97316' : '#78350f',
            size: 3 + Math.random() * 3
          });
        }
        mine.life = 0;
        break;
      }
    }

    // Check hit against island defense bastions & peranakans
    if (mine.life > 0) {
      for (let t = entities.towers.length - 1; t >= 0; t--) {
        const tw = entities.towers[t];
        if (tw.clan === 'neutral' || tw.defenseType === 'haven_bastion') continue;
        const dx = tw.x - mine.x, dy = tw.y - mine.y;
        if (dx * dx + dy * dy < (tw.radius + mine.radius + 16) * (tw.radius + mine.radius + 16)) {
          tw.hp -= mine.damage * 1.5;
          sound.playMineExplosion(mine.x, mine.y);
          screenShake = Math.max(screenShake, 8);
          addFloatingText(`RANJAU! -${Math.round(mine.damage * 1.5)}`, tw.x, tw.y - 20, '#f97316', true);
          for (let k = 0; k < 18; k++) {
            entities.particles.push({
              x: mine.x,
              y: mine.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 0.5,
              color: k % 2 === 0 ? '#f97316' : '#78350f',
              size: 3 + Math.random() * 3
            });
          }
          if (tw.hp <= 0) {
            destroyTowerAndCheckConquer(tw, t);
          }
          mine.life = 0;
          break;
        }
      }
    }

    if (mine.life <= 0) {
      entities.mines.splice(i, 1);
    }
  }

  // Spiked Territorial Sea Mines (Iron Island Defenses)
  for (let i = entities.spikedMines.length - 1; i >= 0; i--) {
    const sm = entities.spikedMines[i];
    sm.bobPhase += dt * 2.2;
    sm.x = sm.baseX + Math.sin(sm.bobPhase) * 4;
    sm.y = sm.baseY + Math.cos(sm.bobPhase * 0.7) * 4;

    // Check proximity to Player
    const distToPlayer = Math.sqrt((playerState.x - sm.x) * (playerState.x - sm.x) + (playerState.y - sm.y) * (playerState.y - sm.y));
    if (distToPlayer < 55) {
      sm.detonating = true;
    }

    // Check proximity to Enemies ONLY if within player's active screen area!
    // Off-screen mines in the fog of war remain pristine until player arrives!
    const activeMineRadius = isMobileDevice() ? 650 : 850;
    if (distToPlayer <= activeMineRadius) {
      for (let j = 0; j < entities.enemies.length; j++) {
        const e = entities.enemies[j];
        if (e.clan === 'iron') continue; // Iron clan ships completely ignore spiked sea mines!
        const dx = e.x - sm.x, dy = e.y - sm.y;
        if (dx * dx + dy * dy < (e.radius + 25) * (e.radius + 25)) {
          sm.detonating = true;
          break;
        }
      }
    }

    if (sm.detonating) {
      sm.detonateTimer -= dt;
      sm.flashTimer += dt * 16;
      if (sm.detonateTimer <= 0) {
        // DETONATE!
        if (distToPlayer <= activeMineRadius + 100) {
          sound.playMineExplosion(sm.x, sm.y);
          screenShake = Math.max(screenShake, 10);
        }

        const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { playerDamageReceivedMult: 1 };

        // Damage Player if in blast radius
        if (distToPlayer < 90) {
          const dmg = Math.round(sm.damage * (diffCfg.playerDamageReceivedMult || 1.0));
          playerState.hp -= dmg;
          addFloatingText(`LEDAKAN RANJAU! -${dmg}`, playerState.x, playerState.y, '#ef4444', true);
          if (playerState.hp <= 0) {
            triggerGameOver("Kapal Anda hancur terkena ladang ranjau bertaji besi!");
          }
        }

        // Damage Enemies in blast radius
        entities.enemies.forEach(e => {
          if (e.clan === 'iron') return; // Iron clan ships immune to spiked mine explosions!
          const dx = e.x - sm.x, dy = e.y - sm.y;
          if (dx * dx + dy * dy < 110 * 110) {
            e.hp -= sm.damage * 1.3;
            addFloatingText(`RANJAU BESI! -${Math.round(sm.damage * 1.3)}`, e.x, e.y, '#f97316', true);
          }
        });

        // Fiery iron shrapnel particles
        for (let k = 0; k < 22; k++) {
          entities.particles.push({
            x: sm.x,
            y: sm.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 0.6,
            color: k % 3 === 0 ? '#ea580c' : (k % 3 === 1 ? '#71717a' : '#fbbf24'),
            size: 3 + Math.random() * 4
          });
        }

        entities.spikedMines.splice(i, 1);
        continue;
      }
    }
  }

  // Kraken Ink Clouds Lifecycle & Blindness Collision
  if (entities.inkClouds) {
    for (let i = entities.inkClouds.length - 1; i >= 0; i--) {
      const c = entities.inkClouds[i];
      c.life -= dt;
      const dx = playerState.x - c.x, dy = playerState.y - c.y;
      if (dx * dx + dy * dy < (c.radius + 20) * (c.radius + 20)) {
        if (!playerState.inkedTimer || playerState.inkedTimer <= 0) {
          showToast("Tinta Gelap Kraken! Penglihatan & Laju Kapal Berkurang!", "alert");
          if (sound && sound.playInkSpit) sound.playInkSpit(playerState.x, playerState.y);
        }
        playerState.inkedTimer = Math.max(playerState.inkedTimer || 0, 4.0);
      }
      if (c.life <= 0) {
        entities.inkClouds.splice(i, 1);
      }
    }
  }

  // Ancient Leviathan Whirlpools Lifecycle & Gravitational Suction
  if (entities.whirlpools) {
    for (let i = entities.whirlpools.length - 1; i >= 0; i--) {
      const w = entities.whirlpools[i];
      w.life -= dt;
      w.angle = (w.angle || 0) + 3.2 * dt;

      const dx = w.x - playerState.x, dy = w.y - playerState.y;
      const dist = Math.hypot(dx, dy);
      const pullRad = (w.radius || 130) * 2.1;

      if (dist < pullRad && dist > 1) {
        const factor = 1 - (dist / pullRad);
        const pullMag = 130 * factor * (w.pullStrength || 1.0);
        const dirX = dx / dist, dirY = dy / dist;
        // Tangential vortex rotation
        const perpX = -dirY * 0.55, perpY = dirX * 0.55;

        if (!playerState.whirlpoolPull) playerState.whirlpoolPull = { x: 0, y: 0 };
        playerState.whirlpoolPull.x += (dirX + perpX) * pullMag;
        playerState.whirlpoolPull.y += (dirY + perpY) * pullMag;

        // Churning damage if sucked into the vortex center!
        if (dist < 36) {
          playerState.hp = Math.max(0, playerState.hp - 10 * dt);
          screenShake = Math.max(screenShake, 3);
          if (Math.random() < 0.25) {
            addFloatingText("-3", playerState.x, playerState.y - 12, '#38bdf8');
          }
        }
      }

      if (w.life <= 0) {
        entities.whirlpools.splice(i, 1);
      }
    }
  }

  // Active Island Defenses for all Island Clans (Cannon Bastions, Harpoon Turrets, Mist Spires, Tentacles)
  entities.towers.forEach(tw => {
    // 0. Proximity Sleep Culling: Skip heavy targeting and LOS math if beyond active combat radius
    const dxP = playerState.x - tw.x, dyP = playerState.y - tw.y;
    const distSqP = dxP * dxP + dyP * dyP;
    const activeTowerRadius = isMobileDevice() ? 650 : 850;
    if (distSqP > activeTowerRadius * activeTowerRadius) {
      tw.shootCooldown = Math.max(0, tw.shootCooldown - dt);
      if (tw.slamCooldown > 0) tw.slamCooldown -= dt;
      return;
    }

    tw.shootCooldown -= dt;
    if (tw.slamCooldown > 0) tw.slamCooldown -= dt;

    // Type-specific state updates
    if (tw.defenseType === 'mist_spire') {
      tw.orbAngle += dt * 1.6;
      tw.glowPulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5;
    } else if (tw.defenseType === 'steam_harpoon') {
      tw.steamPuffTimer += dt;
      if (tw.steamPuffTimer > 1.6) {
        tw.steamPuffTimer = 0;
        if (Math.random() < 0.7) {
          entities.particles.push({
            x: tw.x + Math.cos(tw.aimAngle + Math.PI * 0.5) * 12,
            y: tw.y + Math.sin(tw.aimAngle + Math.PI * 0.5) * 12 - 14,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -1.5 - Math.random() * 1.5,
            life: 0.6,
            maxLife: 0.6,
            size: 4 + Math.random() * 4,
            color: 'rgba(226, 232, 240, 0.7)'
          });
        }
      }
    } else if (tw.defenseType === 'tentacle') {
      tw.wrigglePhase += dt * 3.2;
    }

    // 1. Target Selection
    let target = null;
    const maxRange = (tw.defenseType === 'mist_spire') ? 580 : (tw.defenseType === 'tentacle' ? 520 : 540);

    if (tw.defenseType === 'haven_bastion') {
      // Haven peacekeeper: ONLY targets hostile enemies that attack or approach Haven
      const hostile = entities.enemies.find(e => e.clan !== 'neutral' && e.clan !== 'player' && ((e.x - tw.x) * (e.x - tw.x) + (e.y - tw.y) * (e.y - tw.y) < maxRange * maxRange));
      if (hostile && hasLineOfSight(tw.x, tw.y, hostile.x, hostile.y)) {
        target = hostile;
      }
    } else if (tw.defenseType === 'tentacle') {
      // Abyssal Tentacle: attacks player or any ship near the fleshy island
      if (distSqP < maxRange * maxRange && hasLineOfSight(tw.x, tw.y, playerState.x, playerState.y)) {
        target = playerState;
      } else {
        const victim = entities.enemies.find(e => e.clan !== 'blood' && ((e.x - tw.x) * (e.x - tw.x) + (e.y - tw.y) * (e.y - tw.y) < maxRange * maxRange));
        if (victim) target = victim;
      }
    } else {
      // Clan Bastions & Turrets (Gold, Iron, Mist)
      if (distSqP < maxRange * maxRange && hasLineOfSight(tw.x, tw.y, playerState.x, playerState.y)) {
        target = playerState;
      } else {
        const rival = entities.enemies.find(e => e.clan !== tw.clan && ((e.x - tw.x) * (e.x - tw.x) + (e.y - tw.y) * (e.y - tw.y) < (maxRange - 20) * (maxRange - 20)));
        if (rival) target = rival;
      }
    }

    // 2. Attack Execution
    if (tw.defenseType === 'tentacle') {
      // Tentacle Dual-Mode Attack: Melee Slam (<210px) vs Ranged Blood Bile (210-520px)
      if (tw.isSlamming) {
        tw.slamProgress += dt * 2.2;
        if (tw.slamProgress >= 1.0) {
          const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1, playerDamageReceivedMult: 1 };
          tw.isSlamming = false;
          if (typeof sound !== 'undefined' && typeof sound.playTentacleSlap === 'function') {
            sound.playTentacleSlap(tw.slamTargetX, tw.slamTargetY);
          } else {
            sound.playMonsterAttack(tw.slamTargetX, tw.slamTargetY);
          }

          // Shockwave ripple and blood splashes
          entities.seaRipples.push({
            x: tw.slamTargetX,
            y: tw.slamTargetY,
            radius: 6,
            maxRadius: 42,
            alpha: 0.75,
            color: 'rgba(225, 29, 72, '
          });

          for (let p = 0; p < 14; p++) {
            const pang = (p / 14) * Math.PI * 2;
            entities.particles.push({
              x: tw.slamTargetX,
              y: tw.slamTargetY,
              vx: Math.cos(pang) * (2.5 + Math.random() * 3),
              vy: Math.sin(pang) * (2.5 + Math.random() * 3),
              life: 0.5,
              maxLife: 0.5,
              size: 4 + Math.random() * 4,
              color: '#e11d48'
            });
          }

          // Damage check within slam impact radius (85px)
          const slamDx = playerState.x - tw.slamTargetX, slamDy = playerState.y - tw.slamTargetY;
          if (slamDx * slamDx + slamDy * slamDy < 85 * 85) {
            const dmg = Math.round(tw.damage * (diffCfg.playerDamageReceivedMult || 1.0));
            playerState.hp -= dmg;
            screenShake = 14;
            sound.playHit(playerState.x, playerState.y);
            addFloatingText(`-${dmg} Hantaman Tentakel!`, playerState.x, playerState.y, '#ef4444', true);
            if (playerState.hp <= 0) triggerGameOver("Kapal Anda hancur lebur dihantam tentakel abisal!");
          }

          // Also check rival enemies in slam impact
          entities.enemies.forEach(e => {
            if (e.clan !== 'blood') {
              const edx = e.x - tw.slamTargetX, edy = e.y - tw.slamTargetY;
              if (edx * edx + edy * edy < 85 * 85) {
                e.hp -= tw.damage;
                addFloatingText(`-${Math.round(tw.damage)}`, e.x, e.y, '#f43f5e', true);
              }
            }
          });
        }
      } else if (target) {
        const dToTgt = Math.hypot(target.x - tw.x, target.y - tw.y);
        if (dToTgt < 210 && tw.slamCooldown <= 0) {
          // Initiate slam towards target's current position
          tw.isSlamming = true;
          tw.slamProgress = 0;
          tw.slamTargetX = target.x;
          tw.slamTargetY = target.y;
        } else if (dToTgt >= 210 && tw.shootCooldown <= 0) {
          // Ranged Blood Bile Volley
          const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1 };
          tw.shootCooldown = (2.4 + Math.random() * 0.5) * (diffCfg.enemyReloadMultiplier || 1.0);
          sound.playMonsterAttack(tw.x, tw.y);
          const fireAngle = Math.atan2(target.y - tw.y, target.x - tw.x);
          [-0.12, 0.12].forEach(spr => {
            entities.projectiles.push({
              type: 'blood_bile',
              sourceClan: 'blood',
              x: tw.x,
              y: tw.y,
              vx: Math.cos(fireAngle + spr) * 7.2,
              vy: Math.sin(fireAngle + spr) * 7.2,
              radius: 5.5,
              damage: tw.damage * 0.65,
              isPlayer: false,
              life: 1.4
            });
          });
        }
      }
    } else if (target) {
      // Calculate smooth predictive aim
      let tgtVx = 0;
      let tgtVy = 0;
      if (target === playerState) {
        tgtVx = Math.cos(playerState.angle) * (playerState.speed || 0);
        tgtVy = Math.sin(playerState.angle) * (playerState.speed || 0);
      } else {
        tgtVx = Math.cos(target.angle || 0) * (target.speed || 1.4);
        tgtVy = Math.sin(target.angle || 0) * (target.speed || 1.4);
      }

      const dToTgt = Math.hypot(target.x - tw.x, target.y - tw.y);
      const projSpeed = (tw.defenseType === 'steam_harpoon') ? 9.2 : ((tw.defenseType === 'mist_spire') ? 4.8 : 6.8);
      const timeToHit = Math.min(1.4, dToTgt / projSpeed);
      const aimX = target.x + tgtVx * timeToHit * 0.85;
      const aimY = target.y + tgtVy * timeToHit * 0.85;
      const fireAngle = Math.atan2(aimY - tw.y, aimX - tw.x);

      // Rotate turret aim smoothly
      tw.aimAngle = fireAngle;

      if (tw.shootCooldown <= 0) {
        const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1 };
        const reloadMult = diffCfg.enemyReloadMultiplier || 1.0;
        if (tw.defenseType === 'mist_spire') {
          tw.shootCooldown = 2.2 * reloadMult;
          sound.playMistCast(tw.x, tw.y);
          entities.projectiles.push({
            type: 'spirit',
            sourceClan: 'mist',
            target: target,
            x: tw.x,
            y: tw.y - 15,
            vx: Math.cos(fireAngle) * projSpeed,
            vy: Math.sin(fireAngle) * projSpeed,
            angle: fireAngle,
            speed: projSpeed,
            turnRate: 3.4,
            radius: 7,
            damage: tw.damage,
            isPlayer: false,
            life: 3.8,
            clan: 'mist'
          });
        } else if (tw.defenseType === 'skull_pylon') {
          // Mist Peranakan: Occult spirit bolt
          tw.shootCooldown = (1.9 + Math.random() * 0.4) * reloadMult;
          sound.playMistCast(tw.x, tw.y);
          entities.projectiles.push({
            type: 'spirit',
            sourceClan: 'mist',
            target: target,
            x: tw.x,
            y: tw.y - 10,
            vx: Math.cos(fireAngle) * (projSpeed * 0.9),
            vy: Math.sin(fireAngle) * (projSpeed * 0.9),
            angle: fireAngle,
            speed: projSpeed * 0.9,
            turnRate: 2.6,
            radius: 5,
            damage: tw.damage,
            isPlayer: false,
            life: 2.8,
            clan: 'mist'
          });
        } else if (tw.defenseType === 'steam_harpoon') {
          tw.shootCooldown = (2.6 + Math.random() * 0.4) * reloadMult;
          sound.playIronHit(tw.x, tw.y);
          // Steam burst from muzzle
          for (let p = 0; p < 6; p++) {
            entities.particles.push({
              x: tw.x + Math.cos(fireAngle) * 26,
              y: tw.y + Math.sin(fireAngle) * 26,
              vx: Math.cos(fireAngle) * (2.5 + Math.random() * 2) + (Math.random() - 0.5) * 1.5,
              vy: Math.sin(fireAngle) * (2.5 + Math.random() * 2) + (Math.random() - 0.5) * 1.5,
              life: 0.32,
              maxLife: 0.32,
              size: 3 + Math.random() * 3,
              color: p < 3 ? '#e2e8f0' : '#f59e0b'
            });
          }
          entities.projectiles.push({
            type: 'iron_harpoon',
            sourceClan: 'iron',
            x: tw.x + Math.cos(fireAngle) * 26,
            y: tw.y + Math.sin(fireAngle) * 26,
            vx: Math.cos(fireAngle) * projSpeed,
            vy: Math.sin(fireAngle) * projSpeed,
            angle: fireAngle,
            radius: 5,
            damage: tw.damage,
            isPlayer: false,
            life: 1.3
          });
        } else if (tw.defenseType === 'steam_vent') {
          // Iron Peranakan: High-pressure shrapnel blast
          tw.shootCooldown = (1.7 + Math.random() * 0.3) * reloadMult;
          sound.playIronHit(tw.x, tw.y);
          for (let sp of [-0.08, 0.08]) {
            entities.projectiles.push({
              type: 'iron_harpoon',
              sourceClan: 'iron',
              x: tw.x + Math.cos(fireAngle + sp) * 20,
              y: tw.y + Math.sin(fireAngle + sp) * 20,
              vx: Math.cos(fireAngle + sp) * (projSpeed * 0.9),
              vy: Math.sin(fireAngle + sp) * (projSpeed * 0.9),
              angle: fireAngle + sp,
              radius: 4,
              damage: tw.damage * 0.6,
              isPlayer: false,
              life: 1.1
            });
          }
        } else if (tw.defenseType === 'flesh_spitter') {
          // Blood Peranakan: Parasitic bile spitter
          tw.shootCooldown = (1.8 + Math.random() * 0.4) * reloadMult;
          sound.playMonsterAttack(tw.x, tw.y);
          entities.projectiles.push({
            type: 'blood_bile',
            sourceClan: 'blood',
            x: tw.x,
            y: tw.y,
            vx: Math.cos(fireAngle) * (projSpeed * 0.9),
            vy: Math.sin(fireAngle) * (projSpeed * 0.9),
            radius: 5,
            damage: tw.damage,
            isPlayer: false,
            life: 1.3
          });
        } else if (tw.defenseType === 'swivel_outpost') {
          // Gold Peranakan: Rapid swivel battery
          tw.shootCooldown = (1.3 + Math.random() * 0.3) * reloadMult;
          sound.playCannon(tw.x, tw.y);
          entities.projectiles.push({
            type: 'cannonball',
            sourceClan: tw.clan,
            x: tw.x + Math.cos(fireAngle) * 20,
            y: tw.y + Math.sin(fireAngle) * 20,
            vx: Math.cos(fireAngle) * (projSpeed * 1.05),
            vy: Math.sin(fireAngle) * (projSpeed * 1.05),
            radius: 4.5,
            damage: tw.damage,
            isPlayer: false,
            life: 1.25
          });
        } else {
          // Cannon Bastion & Haven Bastion
          tw.shootCooldown = (2.3 + Math.random() * 0.4) * reloadMult;
          sound.playCannon(tw.x, tw.y);
          // Muzzle flash & smoke
          for (let p = 0; p < 6; p++) {
            entities.particles.push({
              x: tw.x + Math.cos(fireAngle) * 26,
              y: tw.y + Math.sin(fireAngle) * 26,
              vx: Math.cos(fireAngle) * (3 + Math.random() * 2) + (Math.random() - 0.5) * 1.5,
              vy: Math.sin(fireAngle) * (3 + Math.random() * 2) + (Math.random() - 0.5) * 1.5,
              life: 0.35,
              maxLife: 0.35,
              size: 4 + Math.random() * 3,
              color: p < 2 ? '#f59e0b' : '#94a3b8'
            });
          }
          entities.projectiles.push({
            type: 'cannonball',
            sourceClan: tw.clan,
            x: tw.x + Math.cos(fireAngle) * 26,
            y: tw.y + Math.sin(fireAngle) * 26,
            vx: Math.cos(fireAngle) * projSpeed,
            vy: Math.sin(fireAngle) * projSpeed,
            radius: 5.5,
            damage: tw.damage,
            isPlayer: false,
            life: 1.35
          });
        }
      }
    }
  });

  // Projectiles simulation with splash, splinters & hit tests against towers/mines
  for (let i = entities.projectiles.length - 1; i >= 0; i--) {
    const p = entities.projectiles[i];

    if (p.type === 'spirit') {
      const tgt = p.target || playerState;
      let targetX = tgt.x || playerState.x;
      let targetY = tgt.y || playerState.y;

      let tgtVx = 0;
      let tgtVy = 0;
      if (tgt === playerState) {
        tgtVx = Math.cos(playerState.angle) * (playerState.speed || 0);
        tgtVy = Math.sin(playerState.angle) * (playerState.speed || 0);
      } else if (tgt) {
        tgtVx = Math.cos(tgt.angle || 0) * (tgt.speed || 1.4);
        tgtVy = Math.sin(tgt.angle || 0) * (tgt.speed || 1.4);
      }
      targetX += tgtVx * 0.45;
      targetY += tgtVy * 0.45;

      const targetAngle = Math.atan2(targetY - p.y, targetX - p.x);
      let diff = targetAngle - p.angle;
      diff = normAngle(diff);

      const effectiveTurn = (p.turnRate || 3.5) * dt;
      p.angle += Math.sign(diff) * Math.min(Math.abs(diff), effectiveTurn);
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;

      if (Math.random() < 0.35) {
        entities.particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: 0.28,
          color: '#22d3ee',
          size: 2.2
        });
      }
    }

    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;

    // 1. Check hit against Active Island Defenses (Checked BEFORE island terrain clipping)
    let hitObstacle = false;
    if (p.isPlayer) {
      for (let t = entities.towers.length - 1; t >= 0; t--) {
        const tw = entities.towers[t];
        if (tw.clan === 'neutral' || tw.defenseType === 'haven_bastion') continue;

        const hitRadius = tw.radius + 32;
        if (((p.x - tw.x) * (p.x - tw.x) + (p.y - tw.y) * (p.y - tw.y) < hitRadius * hitRadius)) {
          tw.hp -= p.damage;
          p.life = 0;

          let hitColor = '#22d3ee';
          if (tw.defenseType === 'tentacle' || tw.defenseType === 'flesh_spitter') {
            hitColor = '#f43f5e';
            sound.playMonsterHit(tw.x, tw.y);
          } else if (tw.defenseType === 'steam_harpoon' || tw.defenseType === 'steam_vent') {
            hitColor = '#94a3b8';
            sound.playIronHit(tw.x, tw.y);
          } else if (tw.defenseType === 'cannon_bastion' || tw.defenseType === 'swivel_outpost') {
            hitColor = '#f59e0b';
            sound.playIronHit(tw.x, tw.y);
          } else {
            sound.playMistCast(tw.x, tw.y);
          }

          addFloatingText(`-${Math.round(p.damage)}`, tw.x, tw.y - 20, hitColor, true);

          for (let sp = 0; sp < 8; sp++) {
            entities.particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              life: 0.35,
              color: hitColor,
              size: 2.5
            });
          }

          if (tw.hp <= 0) {
            destroyTowerAndCheckConquer(tw, t);
          }
          hitObstacle = true;
          break;
        }
      }

      // Check hit against Merchant Trade Ships
      if (!hitObstacle && entities.merchants) {
        for (let m = entities.merchants.length - 1; m >= 0; m--) {
          const merch = entities.merchants[m];
          const dxM = p.x - merch.x, dyM = p.y - merch.y;
          if (dxM * dxM + dyM * dyM < (merch.radius + 12) * (merch.radius + 12)) {
            merch.hp -= p.damage;
            p.life = 0;
            sound.playIronHit(merch.x, merch.y);
            addFloatingText(`-${Math.round(p.damage)}`, merch.x, merch.y - 18, '#fbbf24', true);

            // Retaliation / Panic response
            if (merch.type === 'escort') {
              merch.state = 'retaliating';
              merch.shootCooldown = 0.4;
              showToast("Pengawal Niaga membalas tembakan meriam!", "alert");
            } else {
              merch.state = 'fleeing';
              merch.fleeTimer = 12.0;
              showToast("Kapal Niaga panik dan melarikan diri!", "alert");
            }

            // Alert escorts in vicinity
            entities.merchants.forEach(other => {
              if (other.type === 'escort' && Math.hypot(other.x - merch.x, other.y - merch.y) < 450) {
                other.state = 'retaliating';
              }
            });

            hitObstacle = true;
            break;
          }
        }
      }
    }

    if (!hitObstacle) {
      for (let k = 0; k < entities.spikedMines.length; k++) {
        const sm = entities.spikedMines[k];
        const dx = p.x - sm.x, dy = p.y - sm.y;
        if (dx * dx + dy * dy < (sm.radius + 10) * (sm.radius + 10)) {
          sm.detonating = true;
          sm.detonateTimer = 0.05; // Detonate immediately!
          p.life = 0;
          hitObstacle = true;
          break;
        }
      }
    }

    if (hitObstacle) {
      entities.projectiles.splice(i, 1);
      continue;
    }

    // 2. Collision with Organic Islands
    let hitIsland = false;
    for (let k = 0; k < WORLD_ISLANDS.length; k++) {
      const isl = WORLD_ISLANDS[k];
      const _dx = p.x - isl.x, _dy = p.y - isl.y;
      const _maxR = ((isl.radius || 200) * 1.3 + 50);
      if (_dx * _dx + _dy * _dy > _maxR * _maxR) continue;
      const ang = Math.atan2(_dy, _dx);
      if (Math.sqrt(_dx * _dx + _dy * _dy) < getIslandRadiusAt(isl, ang) - 10) {
        hitIsland = true;
        break;
      }
    }

    if (hitIsland) {
      for (let s = 0; s < 5; s++) {
        entities.particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 0.3,
          color: '#d97706',
          size: 2
        });
      }
      p.life = 0;
      entities.projectiles.splice(i, 1);
      continue;
    }

    // Damage resolution for ships
    if (p.isPlayer) {
      for (let j = entities.enemies.length - 1; j >= 0; j--) {
        const e = entities.enemies[j];
        const dx = p.x - e.x, dy = p.y - e.y;
        if (dx * dx + dy * dy < e.radius * e.radius) {
          e.hp -= p.damage;
          p.life = 0;
          if (e.isMonster || e.clan === 'blood') {
            sound.playMonsterHit(e.x, e.y);
          } else if (e.clan === 'iron') {
            sound.playIronHit(e.x, e.y);
          } else {
            sound.playHit(e.x, e.y);
          }
          addFloatingText(`-${Math.round(p.damage)}`, e.x, e.y, '#f59e0b', p.damage > 28);

          // Wood Splinters
          for (let sp = 0; sp < 7; sp++) {
            entities.particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 0.4,
              color: e.isMonster ? '#be123c' : '#854d0e',
              size: 2 + Math.random() * 2.5
            });
          }

          // Relic Vampirism
          const siphon = getStatValue('relicSiphon', playerState.upgrades.relicSiphon);
          if (siphon > 0) {
            playerState.hp = Math.min(currentMaxHp, playerState.hp + siphon);
            addFloatingText(`+${Math.round(siphon)} HP`, playerState.x, playerState.y, '#34d399');
          }

          // Aggro enemy
          e.alertState = 'alerted';
          e.detectionMeter = 100;
          if (!e.lastKnownPos) e.lastKnownPos = { x: 0, y: 0 };
          e.lastKnownPos.x = playerState.x;
          e.lastKnownPos.y = playerState.y;
          e.targetEntity = playerState;

          if (e.hp <= 0) {
            playerState.kills++;
            screenShake = Math.max(screenShake, e.tier >= 3 ? 10 : 4);
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { rewardMultiplier: 1.0 };
            const rMult = diffCfg.rewardMultiplier || 1.0;
            let goldGained = 0;
            let bloodGained = 0;

            if (e.isMonster) {
              goldGained = Math.floor((65 * e.tier + Math.random() * 45) * rMult);
              bloodGained = Math.floor((6 * e.tier + Math.random() * 6) * rMult);
            } else if (e.tier >= 3) {
              goldGained = Math.floor((200 + Math.random() * 80) * rMult);
              bloodGained = Math.floor((12 + Math.random() * 8) * rMult);
            } else if (e.tier === 2) {
              goldGained = Math.floor((85 + Math.random() * 40) * rMult);
              bloodGained = Math.floor((4 + Math.random() * 4) * rMult);
            } else {
              goldGained = Math.floor((35 + Math.random() * 25) * rMult);
              bloodGained = biome.isBloodSea ? Math.floor((2 + Math.random() * 3) * rMult) : 0;
            }

            playerState.gold += goldGained;
            if (bloodGained > 0) playerState.bloodEssence += bloodGained;

            if (bloodGained > 0) {
              showToast(`+${goldGained} Koin +${bloodGained} Darah: Menumpas ${e.name}!`, "blood");
            } else {
              showToast(`+${goldGained} Koin: Menenggelamkan ${e.name}!`, "gold");
            }
            sound.playCoin();
            createCombatDebris(e.x, e.y, e.tier);

            // Transition to Sinking Sequence
            entities.sinkingShips.push({
              x: e.x,
              y: e.y,
              angle: e.angle,
              clan: e.clan,
              tier: e.tier,
              name: e.name,
              isMonster: e.isMonster,
              rotSpeed: (Math.random() - 0.5) * 1.8,
              progress: 0,
              maxLife: 2.0,
              life: 2.0
            });

            entities.enemies.splice(j, 1);
          }
          break;
        }
      }
    } else {
      // Enemy projectile hitting player OR rival clan ship
      const dx = p.x - playerState.x, dy = p.y - playerState.y;
      if (dx * dx + dy * dy < 22 * 22) {
        const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { playerDamageReceivedMult: 1.0 };
        const pDmg = Math.round(p.damage * (diffCfg.playerDamageReceivedMult || 1.0));
        playerState.hp -= pDmg;
        p.life = 0;
        screenShake = 7;
        addFloatingText(`-${pDmg}`, playerState.x, playerState.y, '#ef4444', true);

        // Special on-hit effects
        if (p.type === 'iron_harpoon') {
          sound.playIronHit(playerState.x, playerState.y);
          playerState.speedSnareTimer = 1.4;
          showToast("Terkait Harpoon Besi Baja! Laju Kapal Melambat!", "alert");
        } else if (p.type === 'frost_axe') {
          if (sound && sound.playFrostFreeze) sound.playFrostFreeze(playerState.x, playerState.y);
          else sound.playHit(playerState.x, playerState.y);
          playerState.speedSnareTimer = 2.0;
          showToast("Hantaman Kapak Es Viking! Kemudi Membeku!", "alert");
        } else if (p.type === 'rocket_arrow') {
          if (sound && sound.playRocketBarrage) sound.playRocketBarrage(playerState.x, playerState.y);
          else sound.playHit(playerState.x, playerState.y);
          screenShake = 11;
        } else if (p.type === 'blood_bile') {
          sound.playMonsterHit(playerState.x, playerState.y);
        } else {
          sound.playHit(playerState.x, playerState.y);
        }

        for (let sp = 0; sp < 6; sp++) {
          entities.particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 0.35,
            color: p.type === 'blood_bile' ? '#e11d48' : (p.type === 'iron_harpoon' ? '#94a3b8' : (p.type === 'frost_axe' ? '#38bdf8' : (p.type === 'rocket_arrow' ? '#fbbf24' : '#78350f'))),
            size: 2.5
          });
        }

        if (playerState.hp <= 0) {
          triggerGameOver("Armada Anda karam dihancurkan armada lawan!");
        }
      } else {
        // Inter-clan warfare hit
        for (let j = entities.enemies.length - 1; j >= 0; j--) {
          const rival = entities.enemies[j];
          const hitDist = rival.radius + (p.radius || 4) + 5;
          if (rival.clan !== p.sourceClan && ((p.x - rival.x) * (p.x - rival.x) + (p.y - rival.y) * (p.y - rival.y) < hitDist * hitDist)) {
            rival.hp -= p.damage;
            p.life = 0;
            if (rival.isMonster || rival.clan === 'blood') {
              sound.playMonsterHit(rival.x, rival.y);
            } else if (rival.clan === 'iron') {
              sound.playIronHit(rival.x, rival.y);
            } else {
              sound.playHit(rival.x, rival.y);
            }
            addFloatingText(`-${Math.round(p.damage)}`, rival.x, rival.y, '#94a3b8');

            if (rival.hp <= 0) {
              sound.playCannon(rival.x, rival.y);
              entities.sinkingShips.push({
                x: rival.x,
                y: rival.y,
                angle: rival.angle,
                clan: rival.clan,
                tier: rival.tier,
                name: rival.name,
                isMonster: rival.isMonster,
                rotSpeed: (Math.random() - 0.5) * 1.5,
                progress: 0,
                maxLife: 1.8,
                life: 1.8
              });
              entities.enemies.splice(j, 1);
              createCombatDebris(rival.x, rival.y, rival.tier);
            }
            break;
          }
        }
      }
    }

    // Water Splash on projectile expiration
    if (p.life <= 0) {
      entities.seaRipples.push({
        x: p.x,
        y: p.y,
        radius: 2,
        maxRadius: 16,
        alpha: 0.45,
        color: 'rgba(255, 255, 255, '
      });
      entities.projectiles.splice(i, 1);
    }
  }

  // Sinking Ships Animation & Death Sequence
  for (let i = entities.sinkingShips.length - 1; i >= 0; i--) {
    const s = entities.sinkingShips[i];
    s.life -= dt;
    s.progress = 1 - (s.life / s.maxLife);
    s.angle += s.rotSpeed * dt;

    if (Math.random() < 0.4) {
      entities.seaRipples.push({
        x: s.x + (Math.random() - 0.5) * s.radius,
        y: s.y + (Math.random() - 0.5) * s.radius,
        radius: 3,
        maxRadius: 18,
        alpha: 0.6,
        color: s.isMonster ? 'rgba(239, 68, 68, ' : 'rgba(255, 255, 255, '
      });
    }

    if (s.life <= 0) {
      entities.floatingLoots.push({
        id: Math.random(),
        x: s.x,
        y: s.y,
        type: 'gold',
        value: Math.floor(20 + Math.random() * 25),
        bobOffset: 0
      });
      entities.sinkingShips.splice(i, 1);
    }
  }

  // Merchant Shipping Convoys & Trade Routes
  updateMerchants(dt);

  // Stealth & Detection Logic
  highestDetectionLevel = 0;
  const stealthMult = getStatValue('stealthCamo', playerState.upgrades.stealthCamo);
  const isPlayerMovingFast = joystickState.active && joystickState.magnitude > 0.45;

  // 1. Separation Physics between enemies
  const enemyCount = entities.enemies.length;
  for (let i = 0; i < enemyCount; i++) {
    for (let j = i + 1; j < enemyCount; j++) {
      const e1 = entities.enemies[i];
      const e2 = entities.enemies[j];
      const dx = e2.x - e1.x;
      const dy = e2.y - e1.y;
      const dist = Math.sqrt((dx) * (dx) + (dy) * (dy));

      // Same convoy/formation: DO NOT violently push apart with safety buffer!
      if (e1.convoyId && e1.convoyId === e2.convoyId) {
        const hullMin = e1.radius + e2.radius;
        if (dist < hullMin && dist > 0.001) {
          const overlap = (hullMin - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          e1.x -= nx * overlap * 0.25;
          e1.y -= ny * overlap * 0.25;
          e2.x += nx * overlap * 0.25;
          e2.y += ny * overlap * 0.25;
        }
        continue;
      }

      // Hostile rivals: allow them to close in and ram each other!
      const isRival = e1.clan !== e2.clan;
      const minSafeDist = e1.radius + e2.radius + (isRival ? 2 : 16);
      if (dist < minSafeDist && dist > 0.001) {
        const overlap = (minSafeDist - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;
        const pushFactor = isRival ? 0.35 : 0.6;
        e1.x -= nx * overlap * pushFactor;
        e1.y -= ny * overlap * pushFactor;
        e2.x += nx * overlap * pushFactor;
        e2.y += ny * overlap * pushFactor;
      }
    }
  }

  // 2. Process AI behavior, stealth vision, and inter-clan rival battles
  entities.enemies.forEach(e => {
    const distToPlayer = Math.hypot(playerState.x - e.x, playerState.y - e.y);
    const simRadius = isMobileDevice() ? 780 : 1050;

    // Dormant Off-Screen Optimization: If far off-screen, do lightweight drift and skip heavy collision/vision/combat
    if (distToPlayer > simRadius) {
      e.prevX = e.x;
      e.prevY = e.y;
      e.vx = (e.vx || 0) * 0.98;
      e.vy = (e.vy || 0) * 0.98;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.isMoving = false;
      return;
    }

    // Collision with Organic Islands
    WORLD_ISLANDS.forEach(isl => {
      const _dx = e.x - isl.x, _dy = e.y - isl.y;
      const _maxR = ((isl.radius || 200) * 1.3 + 50);
      if (_dx * _dx + _dy * _dy > _maxR * _maxR) return;
      const ang = Math.atan2(_dy, _dx);
      const rAtAng = getIslandRadiusAt(isl, ang);
      const d = Math.sqrt(_dx * _dx + _dy * _dy);
      const minDist = rAtAng + e.radius + 8;
      if (d < minDist && d > 0.001) {
        e.x = isl.x + Math.cos(ang) * minDist;
        e.y = isl.y + Math.sin(ang) * minDist;
      }
    });

    // Calculate actual movement displacement since previous frame!
    const dxMoved = e.x - (e.prevX ?? e.x);
    const dyMoved = e.y - (e.prevY ?? e.y);
    const distMoved = Math.sqrt(dxMoved * dxMoved + dyMoved * dyMoved);
    e.isMoving = distMoved > 0.22;
    e.prevX = e.x;
    const targetAngle = Math.atan2(playerState.y - e.y, playerState.x - e.x);
    const highLodDist = isMobileDevice() ? 850 : 1200;

    // Enemy Water Trail: ONLY when actually translating across the ocean and within LOD range!
    if (distToPlayer < highLodDist && e.isMoving && Math.random() < 0.55) {
      const sternX = e.x - Math.cos(e.angle) * (e.radius * 0.85);
      const sternY = e.y - Math.sin(e.angle) * (e.radius * 0.85);
      
      let rippleColor = 'rgba(255, 255, 255, ';
      if (e.clan === 'blood') {
        rippleColor = 'rgba(244, 63, 94, ';
      } else if (e.clan === 'mist') {
        rippleColor = 'rgba(34, 211, 238, ';
      }

      entities.seaRipples.push({
        x: sternX,
        y: sternY,
        radius: 3.5,
        maxRadius: e.radius * 0.8 + 12,
        alpha: 0.48,
        color: rippleColor
      });

      if (e.clan === 'iron' && e.tier >= 2 && Math.random() < 0.3) {
        entities.particles.push({
          x: sternX,
          y: sternY - 4,
          vx: -Math.cos(e.angle) * 0.8 + (Math.random() - 0.5) * 0.5,
          vy: -Math.sin(e.angle) * 0.8 - 0.6,
          life: 0.8,
          color: 'rgba(148, 163, 184, 0.7)',
          size: 3 + Math.random() * 3
        });
      }
    }

    // STATE 1: UNAWARE / SUSPICIOUS
    let _canSeeVal = false;
    let _canSeeComputed = false;
    
    function checkLOS() {
      if (!_canSeeComputed) {
        _canSeeVal = hasLineOfSight(e.x, e.y, playerState.x, playerState.y);
        _canSeeComputed = true;
      }
      return _canSeeVal;
    }

    if (e.alertState === 'unaware' || e.alertState === 'suspicious') {
      let detected = false;

      // Scavenger guarding a sunken shipwreck: alerts if player approaches wreck or guard
      if (e.guardWreckId) {
        const wreck = entities.sunkenShips.find(s => s.id === e.guardWreckId && !s.salvaged);
        if (wreck) {
          const wdx = playerState.x - wreck.x, wdy = playerState.y - wreck.y;
          if (wdx * wdx + wdy * wdy < 360 * 360 || distToPlayer < 360) {
            detected = true;
          }
        }
      }

      if (!detected) {
        if (e.isMonster) {
          // Sea Monster 360-degree circular underwater vibration sonar!
          const monsterAuraDist = 420 * (isPlayerMovingFast ? 1.25 : 0.95) * stealthMult;
          detected = (distToPlayer <= monsterAuraDist) && checkLOS();
        } else {
          // Ship visual lookout cone
          let headingDiff = Math.abs(targetAngle - e.angle);
          headingDiff = normAngle(headingDiff);
          headingDiff = Math.abs(headingDiff);

          // Convoys have wider coordinated lookouts
          const visionAngle = e.convoyId ? 0.85 : 0.65;
          const visionConeDist = (e.convoyId ? 340 : 270) * (isPlayerMovingFast ? 1.15 : 0.85) * stealthMult;
          detected = ((headingDiff <= visionAngle && distToPlayer <= visionConeDist) || distToPlayer < 60) && checkLOS();
        }
      }

      if (detected) {
        e.alertState = 'alerted';
        e.targetEntity = playerState;
        if (!e.lastKnownPos) e.lastKnownPos = { x: 0, y: 0 };
          e.lastKnownPos.x = playerState.x;
          e.lastKnownPos.y = playerState.y;
        e.detectionMeter = 100;
        e.lostSightTimer = 0;

        // Broadcast alert to entire fleet if in a convoy/formation!
        if (e.convoyId) {
          entities.enemies.forEach(mate => {
            if (mate.convoyId === e.convoyId && mate !== e) {
              mate.alertState = 'alerted';
              mate.targetEntity = playerState;
              if (!mate.lastKnownPos) mate.lastKnownPos = { x: 0, y: 0 };
              mate.lastKnownPos.x = playerState.x;
              mate.lastKnownPos.y = playerState.y;
              mate.detectionMeter = 100;
              mate.lostSightTimer = 0;
            }
          });
        }

        if (e.isMonster || e.clan === 'blood') {
          sound.playMonsterRoar(e.x, e.y);
        } else {
          sound.playAlertHorn();
        }

        if (e.convoyId && e.clan !== 'blood') {
          showToast(`Armada ${e.name} Mengunci Target! Bersiap Tempur!`, "alert");
        } else {
          showToast(`${e.name} Melihatmu & Mulai Mengejar!`, "alert");
        }
      } else {
        e.detectionMeter = Math.max(0, e.detectionMeter - 30 * dt);
      }

    // STATE 2: ALERTED (Notice / Mengejar: Jangkauan Luas & Memori Pemburuan Cerdas)
    } else if (e.alertState === 'alerted') {
      const isTargetingRival = Boolean(e.targetEntity && e.targetEntity !== playerState);
      const activeTarget = isTargetingRival ? e.targetEntity : playerState;

      if (isTargetingRival && (!activeTarget || activeTarget.hp <= 0)) {
        e.targetEntity = null;
        e.alertState = 'searching';
        e.searchTimer = 3.0;
        e.detectionMeter = 60;
      } else {
        const distToTarget = isTargetingRival 
          ? Math.sqrt((activeTarget.x - e.x) * (activeTarget.x - e.x) + (activeTarget.y - e.y) * (activeTarget.y - e.y))
          : distToPlayer;
        const alertEscapeRadius = (e.isMonster ? 850 : (e.convoyId ? 780 : 720)) * (isTargetingRival ? 1.0 : stealthMult);
        const insideEscapeCircle = distToTarget <= alertEscapeRadius;
        const canSeeTarget = isTargetingRival ? hasLineOfSight(e.x, e.y, activeTarget.x, activeTarget.y) : checkLOS();

        if (insideEscapeCircle && canSeeTarget) {
          if (!e.lastKnownPos) e.lastKnownPos = { x: 0, y: 0 };
          e.lastKnownPos.x = activeTarget.x;
          e.lastKnownPos.y = activeTarget.y;
          e.detectionMeter = 100;
          e.lostSightTimer = 0;
        } else {
          // Grace period 5.5 detik: jangan langsung lepas target saat charging melewatinya atau manuver menjauh!
          e.lostSightTimer = (e.lostSightTimer || 0) + dt;
          if (e.lostSightTimer > 5.5 || distToTarget > 950) {
            e.alertState = 'searching';
            e.searchTimer = 5.0;
            e.detectionMeter = 100;
          }
        }
      }

    // STATE 3: SEARCHING (Saat mencari: Menyelidiki posisi terakhir)
    } else if (e.alertState === 'searching') {
      const searchRadius = e.isMonster ? 260 : 180;
      e.searchTimer -= dt;
      e.detectionMeter = Math.max(0, (e.searchTimer / 5.0) * 100);

      const reDetected = (distToPlayer <= searchRadius) && checkLOS();

      if (reDetected) {
        e.alertState = 'alerted';
        e.targetEntity = playerState;
        if (!e.lastKnownPos) e.lastKnownPos = { x: 0, y: 0 };
          e.lastKnownPos.x = playerState.x;
          e.lastKnownPos.y = playerState.y;
        e.detectionMeter = 100;
        e.lostSightTimer = 0;

        if (e.convoyId) {
          entities.enemies.forEach(mate => {
            if (mate.convoyId === e.convoyId && mate !== e) {
              mate.alertState = 'alerted';
              mate.targetEntity = playerState;
              if (!mate.lastKnownPos) mate.lastKnownPos = { x: 0, y: 0 };
              mate.lastKnownPos.x = playerState.x;
              mate.lastKnownPos.y = playerState.y;
              mate.detectionMeter = 100;
              mate.lostSightTimer = 0;
            }
          });
        }

        if (e.isMonster || e.clan === 'blood') {
          sound.playMonsterRoar(e.x, e.y);
        } else {
          sound.playAlertHorn();
        }
        showToast(`${e.name} Menemukanmu Kembali!`, "alert");
      } else if (e.searchTimer <= 0) {
        e.alertState = 'unaware';
        e.detectionMeter = 0;
        e.targetEntity = null;
        e.lastKnownPos = null;
        e.lostSightTimer = 0;
        showToast(`${e.name} Kehilangan Jejak dan Kembali Berpatroli.`, "info");
      }
    }

    highestDetectionLevel = Math.max(highestDetectionLevel, e.detectionMeter / 100);

    // Dynamic Inter-Clan Rivalry (Gold vs Iron vs Mist vs Blood)
    // ONLY seek rivals if within player's active screen/encounter range!
    // Off-screen ships stay on patrol and don't fight/destroy each other before player arrives!
    const _now = Date.now();
    let nearestRival = null;
    let minRivalDist = 550;
    const activeCombatRadius = isMobileDevice() ? 650 : 850;

    if (distToPlayer <= activeCombatRadius) {
      if (e._lastRivalryCheck && _now - e._lastRivalryCheck < 500) {
        nearestRival = e._cachedRival;
        minRivalDist = e._cachedRivalDist;
      } else {
        e._lastRivalryCheck = _now;
        for (let k = 0; k < entities.enemies.length; k++) {
          const other = entities.enemies[k];
          if (other === e || (other.convoyId && other.convoyId === e.convoyId)) continue;
          if (other.clan !== e.clan && other.hp > 0) {
            const dx = other.x - e.x, dy = other.y - e.y;
            if (dx * dx + dy * dy < minRivalDist * minRivalDist && hasLineOfSight(e.x, e.y, other.x, other.y)) {
              minRivalDist = Math.sqrt(dx * dx + dy * dy);
              nearestRival = other;
            }
          }
        }
        e._cachedRival = nearestRival;
        e._cachedRivalDist = minRivalDist;
      }
    }

    if (nearestRival) {
      // Engage rival if unaware/searching, OR if currently targeting player but rival is closer/in immediate combat range
      const shouldEngageRival = (e.alertState === 'unaware' || e.alertState === 'searching') ||
                                (e.targetEntity === playerState && (minRivalDist < distToPlayer * 1.25 || minRivalDist < 360)) ||
                                (e.targetEntity && e.targetEntity !== playerState && e.targetEntity.hp <= 0);

      if (shouldEngageRival) {
        e.alertState = 'alerted';
        e.targetEntity = nearestRival;
        if (!e.lastKnownPos) e.lastKnownPos = { x: 0, y: 0 };
        e.lastKnownPos.x = nearestRival.x;
        e.lastKnownPos.y = nearestRival.y;
        e.detectionMeter = 100;
        e.lostSightTimer = 0;

        if (nearestRival.alertState !== 'alerted' || (nearestRival.targetEntity === playerState && minRivalDist < 360)) {
          nearestRival.alertState = 'alerted';
          nearestRival.targetEntity = e;
          if (!nearestRival.lastKnownPos) nearestRival.lastKnownPos = { x: 0, y: 0 };
          nearestRival.lastKnownPos.x = e.x;
          nearestRival.lastKnownPos.y = e.y;
          nearestRival.detectionMeter = 100;
          nearestRival.lostSightTimer = 0;
        }
      }
    } else if (e.targetEntity && e.targetEntity !== playerState && e.targetEntity.hp <= 0) {
      e.targetEntity = null;
      e.alertState = 'searching';
      e.searchTimer = 3.0;
    }

    // Active Target Selection
    let target = null;
    if (e.alertState === 'alerted') {
      target = e.targetEntity || playerState;
      if (target && target !== playerState && target.hp <= 0) {
        e.targetEntity = null;
        e.alertState = 'searching';
        e.searchTimer = 3.0;
        target = null;
      }
    } else if (e.alertState === 'searching') {
      target = e.lastKnownPos ? { x: e.lastKnownPos.x, y: e.lastKnownPos.y, angle: 0, radius: 10 } : null;
    }

    if (target) {
      const targetDist = Math.sqrt((target.x - e.x) * (target.x - e.x) + (target.y - e.y) * (target.y - e.y));
      const targetAngle = Math.atan2(target.y - e.y, target.x - e.x);

      // Physical Ramming collision
      if (e.alertState === 'alerted') {
        const minTargetDist = e.radius + (target === playerState ? 20 : (target.radius || 20));
        if (targetDist < minTargetDist && targetDist > 0.001) {
          const pushX = (e.x - target.x) / targetDist;
          const pushY = (e.y - target.y) / targetDist;
          e.x = target.x + pushX * minTargetDist;
          e.y = target.y + pushY * minTargetDist;

          if (e.chargeState === 'charging' || e.clan === 'iron' || e.isMonster || (target !== playerState && target.clan !== e.clan)) {
            const mult = e.chargeState === 'charging' ? 1.4 : (e.clan === 'iron' || e.isMonster ? 0.85 : 0.6);
            let ramDmg = Math.max(8, Math.round(e.damage * mult));
            if (target === playerState) {
              const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { playerDamageReceivedMult: 1.0 };
              ramDmg = Math.max(8, Math.round(ramDmg * (diffCfg.playerDamageReceivedMult || 1.0)));
            }
            target.hp -= ramDmg;
            if (e.clan === 'iron') {
              if (typeof sound.playIronRamCollision === 'function') {
                sound.playIronRamCollision(target.x, target.y);
              } else {
                sound.playIronHit(target.x, target.y);
              }
            } else if (e.isMonster || e.clan === 'blood') {
              sound.playMonsterHit(target.x, target.y);
            } else {
              sound.playRamHit();
            }
            addFloatingText(`TERJANG! -${ramDmg}`, target.x, target.y, '#f87171', true);

            e.x += pushX * 55;
            e.y += pushY * 55;
            e.disengageTimer = 1.6;
            e.orbitDir = Math.random() > 0.5 ? 1 : -1;

            if (e.chargeState === 'charging') {
              e.chargeState = 'recovering';
              e.recoveryTimer = 1.0;
            }

            if (target === playerState && playerState.hp <= 0) {
              triggerGameOver("Kapal Anda remuk ditabrak kapal perang baja/monster palung!");
            } else if (target !== playerState && target.hp <= 0) {
              // Destroy and sink rival ship!
              sound.playCannon(target.x, target.y);
              entities.sinkingShips.push({
                x: target.x,
                y: target.y,
                angle: target.angle || 0,
                clan: target.clan,
                tier: target.tier || 0,
                name: target.name || 'Kapal',
                isMonster: Boolean(target.isMonster),
                rotSpeed: (Math.random() - 0.5) * 1.6,
                progress: 0,
                maxLife: 2.0,
                life: 2.0
              });

              for (let sp = 0; sp < 10; sp++) {
                entities.particles.push({
                  x: target.x,
                  y: target.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  life: 0.45,
                  color: target.isMonster ? '#be123c' : '#854d0e',
                  size: 2.5 + Math.random() * 2.5
                });
              }

              const tIdx = entities.enemies.indexOf(target);
              if (tIdx !== -1) {
                entities.enemies.splice(tIdx, 1);
                createCombatDebris(target.x, target.y, target.tier);
              }
              e.targetEntity = null;
              e.alertState = 'unaware';
            }
          }
        }
      }

      // Anti-tailgate maneuver
      if (target === playerState && e.alertState === 'alerted') {
        let relativeHeading = Math.abs(targetAngle - playerState.angle);
        while (relativeHeading > Math.PI) relativeHeading = Math.abs(relativeHeading - Math.PI * 2);
        if (relativeHeading < 0.65 && targetDist < 180) {
          e.tailgateTimer = (e.tailgateTimer || 0) + dt;
        } else {
          e.tailgateTimer = Math.max(0, (e.tailgateTimer || 0) - dt * 2);
        }

        if (e.tailgateTimer > 1.2) {
          e.disengageTimer = 1.8;
          e.tailgateTimer = 0;
        }
      }

      if (e.disengageTimer > 0) {
        e.disengageTimer -= dt;
        const flankAngle = (target.angle || 0) + (Math.PI * 0.5) * e.orbitDir;
        const safeFlank = avoidIslandObstacles(e, flankAngle, 160);
        let flankDiff = safeFlank - e.angle;
        flankDiff = normAngle(flankDiff);
        e.angle += Math.sign(flankDiff) * Math.min(Math.abs(flankDiff), e.turnRate * 1.3 * dt);
        e.x += Math.cos(e.angle) * (e.speed * 1.15);
        e.y += Math.sin(e.angle) * (e.speed * 1.15);
        return;
      }

      // Tactical combat when Alerted vs investigative cruise when Searching
      const isSearching = e.alertState === 'searching';
      const cruiseSpeed = isSearching ? e.speed * 0.8 : e.speed;

      if (e.clan === 'iron') {
        e.specialCooldown -= dt;
        if (e.chargeState === 'idle') {
          let facingDiff = Math.abs(targetAngle - e.angle);
          while (facingDiff > Math.PI) facingDiff = Math.abs(facingDiff - Math.PI * 2);
          if (!isSearching && e.specialCooldown <= 0 && targetDist < 260 && facingDiff < 0.65) {
            e.chargeState = 'windup';
            e.chargeTimer = 0.55;
            sound.playSteamHiss();
          }
        } else if (e.chargeState === 'windup') {
          e.chargeTimer -= dt;
          if (Math.random() < 0.7) {
            entities.particles.push({
              x: e.x - Math.cos(e.angle) * 12 + (Math.random() - 0.5) * 8,
              y: e.y - Math.sin(e.angle) * 12 + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 1.5,
              vy: -1.5 - Math.random() * 2,
              life: 0.45,
              maxLife: 0.45,
              color: 'rgba(241, 245, 249, 0.75)',
              size: 4 + Math.random() * 4
            });
          }
          if (e.chargeTimer <= 0) {
            e.chargeState = 'charging';
            e.chargeTimer = 1.4;
            sound.playIronChargeHorn();
            showToast(`${e.name} Menyalakan Ketel Uap & Menerjang!`, "alert");
          }
        } else if (e.chargeState === 'charging') {
          e.chargeTimer -= dt;
          const chargeSpeed = e.baseSpeed * (2.4 + e.tier * 0.25);
          e.x += Math.cos(e.angle) * chargeSpeed;
          e.y += Math.sin(e.angle) * chargeSpeed;

          // Glowing ram sparks & soot particles
          const prowX = e.x + Math.cos(e.angle) * (e.radius + 8);
          const prowY = e.y + Math.sin(e.angle) * (e.radius + 8);
          for (let sp = 0; sp < 2; sp++) {
            const spAng = e.angle + Math.PI + (Math.random() - 0.5) * 1.8;
            entities.particles.push({
              x: prowX,
              y: prowY,
              vx: Math.cos(spAng) * (2 + Math.random() * 4),
              vy: Math.sin(spAng) * (2 + Math.random() * 4),
              life: 0.35,
              maxLife: 0.35,
              color: Math.random() < 0.6 ? '#f97316' : '#facc15',
              size: 2.5 + Math.random() * 2.5
            });
          }

          const aftX = e.x - Math.cos(e.angle) * (e.radius * 0.75);
          const aftY = e.y - Math.sin(e.angle) * (e.radius * 0.75);
          entities.particles.push({
            x: aftX + (Math.random() - 0.5) * 10,
            y: aftY + (Math.random() - 0.5) * 10,
            vx: -Math.cos(e.angle) * 3.5 + (Math.random() - 0.5) * 1.5,
            vy: -Math.sin(e.angle) * 3.5 + (Math.random() - 0.5) * 1.5,
            life: 0.65,
            maxLife: 0.65,
            color: Math.random() < 0.75 ? 'rgba(148, 163, 184, 0.75)' : 'rgba(234, 88, 12, 0.85)',
            size: 6 + Math.random() * 6
          });

          if (targetDist < 350) {
            screenShake = Math.max(screenShake, 5);
          }

          if (e.chargeTimer <= 0) {
            // Charging selesai -> masuki recovery drift turnaround
            e.chargeState = 'recovering';
            e.recoveryTimer = 1.3;
            e.specialCooldown = 4.0 + Math.random() * 2.5;
          }
        } else if (e.chargeState === 'recovering') {
          e.recoveryTimer -= dt;
          // Drift turnaround rudder: manuver putar balik cepat agar tidak kehilangan jejak!
          let angleDiff = targetAngle - e.angle;
          angleDiff = normAngle(angleDiff);
          e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * 2.4 * dt);
          e.x += Math.cos(e.angle) * (cruiseSpeed * 0.75);
          e.y += Math.sin(e.angle) * (cruiseSpeed * 0.75);

          if (e.recoveryTimer <= 0 || Math.abs(angleDiff) < 0.35) {
            e.chargeState = 'idle';
          }
        }

        if (e.chargeState === 'idle') {
          let targetCourseAngle = (targetDist > e.preferredDist + 40 || isSearching) ? targetAngle : (targetAngle + (Math.PI / 2) * e.orbitDir);
          targetCourseAngle = avoidIslandObstacles(e, targetCourseAngle, 175);
          let angleDiff = targetCourseAngle - e.angle;
          angleDiff = normAngle(angleDiff);
          e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
          e.x += Math.cos(e.angle) * cruiseSpeed;
          e.y += Math.sin(e.angle) * cruiseSpeed;

          if (!isSearching) {
            e.shootCooldown -= dt;
            if (e.shootCooldown <= 0 && targetDist < 280) {
              const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
              e.shootCooldown = (2.4 + Math.random() * 1.5) * (diffCfg.enemyReloadMultiplier || 1.0);
              fireCannons(e, target, false);
            }
          }
        }
      } else if (e.clan === 'mist') {
        // Mist tactical spellcasting: shadow and kite dynamically
        let targetCourseAngle = targetAngle;
        if (!isSearching) {
          if (targetDist < 180) {
            targetCourseAngle = targetAngle + Math.PI; // Kite backward
          } else if (targetDist > 300) {
            targetCourseAngle = targetAngle; // Shadow / cut off
          } else {
            targetCourseAngle = targetAngle + (Math.PI / 2) * e.orbitDir; // Broadside orbit
          }
        }
        targetCourseAngle = avoidIslandObstacles(e, targetCourseAngle, 175);

        let angleDiff = targetCourseAngle - e.angle;
        angleDiff = normAngle(angleDiff);
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * 1.3 * dt);
        const mSpeed = (!isSearching && targetDist > 300) ? cruiseSpeed * 1.35 : cruiseSpeed;
        e.x += Math.cos(e.angle) * mSpeed;
        e.y += Math.sin(e.angle) * mSpeed;

        if (!isSearching) {
          e.specialCooldown -= dt;
          if (e.specialCooldown <= 0 && targetDist < 420) {
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
            e.specialCooldown = (3.0 + Math.random() * 1.8) * (diffCfg.enemyReloadMultiplier || 1.0);
            fireSpiritWisps(e, target);
          }
        }
      } else if (e.clan === 'viking') {
        // Viking Norse Berserk Rush: aggressive close-quarters ramming and frost axes
        let targetCourseAngle = (targetDist > e.preferredDist + 30 || isSearching) ? targetAngle : (targetAngle + (Math.PI / 2) * e.orbitDir);
        targetCourseAngle = avoidIslandObstacles(e, targetCourseAngle, 175);
        let angleDiff = targetCourseAngle - e.angle;
        angleDiff = normAngle(angleDiff);
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
        const vSurge = (!isSearching && targetDist < 220) ? 1.25 : 1.0;
        e.x += Math.cos(e.angle) * (cruiseSpeed * vSurge);
        e.y += Math.sin(e.angle) * (cruiseSpeed * vSurge);

        if (!isSearching) {
          e.specialCooldown -= dt;
          if (e.specialCooldown <= 0 && targetDist < 260) {
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
            e.specialCooldown = (2.6 + Math.random() * 1.6) * (diffCfg.enemyReloadMultiplier || 1.0);
            fireFrostAxes(e, target);
          }

          e.shootCooldown -= dt;
          if (e.shootCooldown <= 0 && targetDist < 300) {
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
            e.shootCooldown = (2.0 + Math.random() * 1.3) * (diffCfg.enemyReloadMultiplier || 1.0);
            fireCannons(e, target, false);
          }
        }
      } else if (e.clan === 'wokou') {
        // Wokou hit-and-run kiting with firework rockets
        let targetCourseAngle = targetAngle;
        if (!isSearching) {
          if (targetDist < 160) {
            targetCourseAngle = targetAngle + Math.PI; // Kite away
          } else if (targetDist > 320) {
            targetCourseAngle = targetAngle; // Close in
          } else {
            targetCourseAngle = targetAngle + (Math.PI / 2) * e.orbitDir; // Broadside circle
          }
        }
        targetCourseAngle = avoidIslandObstacles(e, targetCourseAngle, 175);

        let angleDiff = targetCourseAngle - e.angle;
        angleDiff = normAngle(angleDiff);
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * 1.25 * dt);
        e.x += Math.cos(e.angle) * cruiseSpeed;
        e.y += Math.sin(e.angle) * cruiseSpeed;

        if (!isSearching) {
          e.specialCooldown -= dt;
          if (e.specialCooldown <= 0 && targetDist < 380) {
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
            e.specialCooldown = (2.8 + Math.random() * 1.5) * (diffCfg.enemyReloadMultiplier || 1.0);
            fireRocketVolley(e, target);
          }

          e.shootCooldown -= dt;
          if (e.shootCooldown <= 0 && targetDist < 290) {
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
            e.shootCooldown = (1.9 + Math.random() * 1.2) * (diffCfg.enemyReloadMultiplier || 1.0);
            fireCannons(e, target, false);
          }
        }
      } else if (e.clan === 'blood') {
        // ABYSSAL SEA MONSTERS: Megalodon, The Kraken, Ancient Leviathan, Larva
        e.specialCooldown -= dt;
        const mType = e.monsterType || (e.tier === 1 ? 'larva' : (e.tier === 2 ? 'kraken' : 'leviathan'));

        let monsterHeading = targetAngle;
        if (mType === 'kraken' && !isSearching) {
          // Kraken circles player at medium standoff distance
          monsterHeading = (targetDist < 170) ? (targetAngle + Math.PI) : (targetAngle + (Math.PI / 2) * e.orbitDir);
        } else if (mType === 'leviathan' && !isSearching) {
          // Leviathan sinuous orbital sweep
          monsterHeading = targetAngle + (Math.PI / 2.3) * e.orbitDir;
        }
        monsterHeading = avoidIslandObstacles(e, monsterHeading, 160);

        let angleDiff = monsterHeading - e.angle;
        angleDiff = normAngle(angleDiff);
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);

        let surge = 1.0;
        if (mType === 'megalodon' && !isSearching && targetDist < 260) {
          surge = 2.1; // Predatory dash!
        } else if (!isSearching && targetDist < 160) {
          surge = 1.6;
        }

        e.x += Math.cos(e.angle) * (cruiseSpeed * surge);
        e.y += Math.sin(e.angle) * (cruiseSpeed * surge);

        if (!isSearching && surge > 1.4) {
          if (mType === 'megalodon' && typeof sound.playPredatorySurge === 'function') {
            sound.playPredatorySurge(e.x, e.y);
          } else {
            sound.playMonsterCharge(e.x, e.y);
          }
        } else if (targetDist < 450) {
          sound.playMonsterMove(e.x, e.y);
        }

        // Megalodon close-contact predatory bite
        if (mType === 'megalodon' && !isSearching && targetDist < 42) {
          if (!e.biteCooldown) e.biteCooldown = 0;
          e.biteCooldown -= dt;
          if (e.biteCooldown <= 0) {
            e.biteCooldown = 1.6;
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { playerDamageReceivedMult: 1.0 };
            const bDmg = Math.round(e.damage * 1.35 * (diffCfg.playerDamageReceivedMult || 1.0));
            playerState.hp -= bDmg;
            screenShake = Math.max(screenShake, 12);
            if (typeof sound.playBiteCrunch === 'function') {
              sound.playBiteCrunch(playerState.x, playerState.y);
            } else {
              sound.playMonsterHit(playerState.x, playerState.y);
            }
            addFloatingText(`GIGITAN MEGALODON! -${bDmg}`, playerState.x, playerState.y, '#ef4444', true);
            showToast("Gigitan Predator Megalodon Merobek Lambung!", "alert");
            if (playerState.hp <= 0) {
              triggerGameOver("Kapal Anda dikoyak habis oleh Megalodon purba!");
            }
          }
        }

        // Special Monster Abilities
        if (!isSearching && e.specialCooldown <= 0) {
          const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
          if (mType === 'kraken' && targetDist < 380) {
            e.specialCooldown = (3.6 + Math.random() * 2.0) * (diffCfg.enemyReloadMultiplier || 1.0);
            spitKrakenInk(e, target);
          } else if (mType === 'leviathan' && targetDist < 420) {
            e.specialCooldown = (4.2 + Math.random() * 2.2) * (diffCfg.enemyReloadMultiplier || 1.0);
            if (typeof sound.playLeviathanBellow === 'function') {
              sound.playLeviathanBellow(e.x, e.y);
            }
            summonLeviathanWhirlpool(e, target);
            fireChitinSpikes(e, true);
          } else if (targetDist < 340) {
            e.specialCooldown = (2.8 + Math.random() * 1.5) * (diffCfg.enemyReloadMultiplier || 1.0);
            fireChitinSpikes(e, e.tier >= 3);
          }
        }
      } else {
        // Batavia
        let targetCourseAngle = (targetDist > e.preferredDist + 40 || isSearching) ? targetAngle : (targetAngle + (Math.PI / 2) * e.orbitDir);
        targetCourseAngle = avoidIslandObstacles(e, targetCourseAngle, 175);
        let angleDiff = targetCourseAngle - e.angle;
        angleDiff = normAngle(angleDiff);
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
        e.x += Math.cos(e.angle) * cruiseSpeed;
        e.y += Math.sin(e.angle) * cruiseSpeed;

        if (!isSearching) {
          e.shootCooldown -= dt;
          if (e.shootCooldown <= 0 && targetDist < 350) {
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
            e.shootCooldown = (1.8 + Math.random() * 1.3) * (diffCfg.enemyReloadMultiplier || 1.0);
            fireCannons(e, target, false);
          }
        }
      }
    } else {
      // Passive Navigation: Convoys, Rituals, Monster Pairs, Island Guards, and Solitary Ships
      if (e.homeIslandId) {
        const homeIsl = WORLD_ISLANDS.find(i => i.id === e.homeIslandId);
        if (homeIsl) {
          const orbitR = e.orbitDist || 75;
          const rAtAng = getIslandRadiusAt(homeIsl, e.patrolAngle);
          const patrolDist = rAtAng + orbitR;
          const orbitDirection = e.orbitDir || 1;
          const angSpeed = Math.max(0.08, Math.min(0.28, (e.speed * 0.75) / patrolDist));
          e.patrolAngle += angSpeed * dt * orbitDirection;

          const lookaheadAng = e.patrolAngle + 0.22 * orbitDirection;
          const rAhead = getIslandRadiusAt(homeIsl, lookaheadAng);
          const targetPatrolX = homeIsl.x + Math.cos(lookaheadAng) * (rAhead + orbitR);
          const targetPatrolY = homeIsl.y + Math.sin(lookaheadAng) * (rAhead + orbitR);

          let headingToPatrol = Math.atan2(targetPatrolY - e.y, targetPatrolX - e.x);
          headingToPatrol = avoidIslandObstacles(e, headingToPatrol, 120);

          let angleDiff = headingToPatrol - e.angle;
          angleDiff = normAngle(angleDiff);
          e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
          e.x += Math.cos(e.angle) * (e.speed * 0.75);
          e.y += Math.sin(e.angle) * (e.speed * 0.75);

          if (e.clan === 'blood' && (((e.x - playerState.x) * (e.x - playerState.x) + (e.y - playerState.y) * (e.y - playerState.y)) < (420) * (420))) {
            sound.playMonsterMove(e.x, e.y);
          }
        }
      } else if (e.formationType === 'mist_ritual' && e.ritualCenter) {
        // Mist Cultists orbiting in sacred circle
        if (e.formationRole === 'leader') {
          e.ritualCenter.angle += 0.28 * dt;
        }
        const ang = e.ritualCenter.angle + (e.formationIndex / e.formationTotal) * Math.PI * 2;
        const targetX = e.ritualCenter.x + Math.cos(ang) * 85;
        const targetY = e.ritualCenter.y + Math.sin(ang) * 85;
        const desiredHeading = ang + Math.PI / 2;

        const dToPos = Math.sqrt((targetX - e.x) * (targetX - e.x) + (targetY - e.y) * (targetY - e.y));
        const steerAngle = dToPos > 25 ? Math.atan2(targetY - e.y, targetX - e.x) : desiredHeading;

        let angleDiff = steerAngle - e.angle;
        angleDiff = normAngle(angleDiff);
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * 1.5 * dt);
        e.x += Math.cos(e.angle) * (e.speed * 0.55);
        e.y += Math.sin(e.angle) * (e.speed * 0.55);

        // Ritual center particle wisps
        if (e.formationRole === 'leader' && Math.random() < 0.25) {
          entities.particles.push({
            x: e.ritualCenter.x + (Math.random() - 0.5) * 45,
            y: e.ritualCenter.y + (Math.random() - 0.5) * 45,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.9 - Math.random() * 0.9,
            life: 0.7,
            color: '#22d3ee',
            size: 2.8
          });
        }
      } else if (e.formationType === 'monster_pair' && e.convoyId) {
        const alpha = entities.enemies.find(m => m.convoyId === e.convoyId && m.formationRole === 'monster_alpha');
        if (e.formationRole === 'monster_alpha' || !alpha || alpha === e) {
          // Alpha cruises open waters smoothly
          e.patrolAngle = (e.patrolAngle || e.angle) + (Math.random() - 0.5) * 0.03;
          let angleDiff = e.patrolAngle - e.angle;
          angleDiff = normAngle(angleDiff);
          e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
          e.x += Math.cos(e.angle) * (e.speed * 0.65);
          e.y += Math.sin(e.angle) * (e.speed * 0.65);
        } else {
          // Juvenile accompanies Alpha, weaving alongside
          const weave = Math.sin(Date.now() * 0.0025) * 0.35;
          const targetX = alpha.x + Math.cos(alpha.angle + 2.2 + weave) * 52;
          const targetY = alpha.y + Math.sin(alpha.angle + 2.2 + weave) * 52;
          const headingToLead = Math.atan2(targetY - e.y, targetX - e.x);
          let angleDiff = headingToLead - e.angle;
          angleDiff = normAngle(angleDiff);
          e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * 1.5 * dt);
          const dToSlot = Math.sqrt((targetX - e.x) * (targetX - e.x) + (targetY - e.y) * (targetY - e.y));
          const spd = dToSlot > 80 ? e.speed * 1.2 : e.speed * 0.75;
          e.x += Math.cos(e.angle) * spd;
          e.y += Math.sin(e.angle) * spd;
        }
        if ((((e.x - playerState.x) * (e.x - playerState.x) + (e.y - playerState.y) * (e.y - playerState.y)) < (420) * (420))) {
          sound.playMonsterMove(e.x, e.y);
        }
      } else if (e.convoyId) {
        // Convoy fleet navigation (Batavia column & Iron wedge)
        const leader = entities.enemies.find(c => c.convoyId === e.convoyId && c.formationRole === 'leader') || e;
        if (e === leader || leader === e) {
          // Leader conducts purposeful human voyage between island ports
          updateHumanVoyage(e, dt);
        } else {
          // Escort / Wing maintains assigned slot relative to leader
          let slotX = leader.x;
          let slotY = leader.y;

          if (e.formationType === 'batavia_column') {
            const distBehind = (e.formationIndex || 1) * 75;
            slotX = leader.x + Math.cos(leader.angle + Math.PI) * distBehind;
            slotY = leader.y + Math.sin(leader.angle + Math.PI) * distBehind;
          } else if (e.formationType === 'iron_wedge') {
            const side = e.formationRole === 'wing_left' ? 2.4 : (e.formationRole === 'wing_right' ? -2.4 : Math.PI);
            const distFromLead = e.formationRole === 'escort_rear' ? 115 : 78;
            slotX = leader.x + Math.cos(leader.angle + side) * distFromLead;
            slotY = leader.y + Math.sin(leader.angle + side) * distFromLead;
          } else if (e.formationType === 'viking_line') {
            const offsetSide = e.formationRole === 'flanker_1' ? -55 : 55;
            slotX = leader.x + Math.cos(leader.angle + Math.PI / 2) * offsetSide - Math.cos(leader.angle) * 35;
            slotY = leader.y + Math.sin(leader.angle + Math.PI / 2) * offsetSide - Math.sin(leader.angle) * 35;
          } else if (e.formationType === 'wokou_pack') {
            const sideAng = e.formationRole === 'wing_1' ? 2.3 : -2.3;
            slotX = leader.x + Math.cos(leader.angle + sideAng) * 65;
            slotY = leader.y + Math.sin(leader.angle + sideAng) * 65;
          }

          const distToSlot = Math.sqrt((slotX - e.x) * (slotX - e.x) + (slotY - e.y) * (slotY - e.y));

          if (leader.isAnchored || leader.voyageState === 'docked') {
            // Convoy flagship is docked at harbor! Escorts anchor in their slots
            e.isAnchored = true;
            if (distToSlot > 12) {
              const angleToSlot = Math.atan2(slotY - e.y, slotX - e.x);
              let angleDiff = angleToSlot - e.angle;
              angleDiff = normAngle(angleDiff);
              e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
              const dockSpeed = Math.min(e.speed * 0.45, distToSlot * 0.08);
              e.x += Math.cos(e.angle) * dockSpeed;
              e.y += Math.sin(e.angle) * dockSpeed;
            } else {
              e.angle += Math.sin(Date.now() * 0.0012 + (e.id || 0)) * 0.002;
            }
          } else {
            // Voyaging fleet: smoothly blend heading and throttle speed
            e.isAnchored = false;
            const angleToSlot = Math.atan2(slotY - e.y, slotX - e.x);
            const slotWeight = Math.min(1, distToSlot / 35);
            let desiredAngle = leader.angle;
            if (slotWeight > 0.05) {
              let diff = angleToSlot - leader.angle;
              diff = normAngle(diff);
              desiredAngle = leader.angle + diff * slotWeight;
            }

            let angleDiff = desiredAngle - e.angle;
            angleDiff = normAngle(angleDiff);
            e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * 1.8 * dt);

            let speedMult = 0.65;
            if (distToSlot > 75) speedMult = 1.15;
            else if (distToSlot > 30) speedMult = 0.85;
            else if (distToSlot < 14) speedMult = 0.5;

            const moveStep = e.speed * speedMult;
            e.x += Math.cos(e.angle) * moveStep;
            e.y += Math.sin(e.angle) * moveStep;
          }
        }
      } else {
        // Solitary ship: purposeful voyage from island harbor to harbor!
        if (e.clan !== 'blood') {
          updateHumanVoyage(e, dt);
        } else {
          // Solitary deep monster roaming smoothly
          e.patrolAngle = (e.patrolAngle || e.angle) + (Math.random() - 0.5) * 0.025;
          let angleDiff = e.patrolAngle - e.angle;
          angleDiff = normAngle(angleDiff);
          e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * 0.8 * dt);
          e.x += Math.cos(e.angle) * (e.speed * 0.5);
          e.y += Math.sin(e.angle) * (e.speed * 0.5);
        }
      }
    }
  });

  // Salvage Sunken Ships
  if (!_cachedSalvageContainer) _cachedSalvageContainer = document.getElementById('salvageContainer');
  const salvageContainer = _cachedSalvageContainer;
  if (!_cachedSalvageCircle) _cachedSalvageCircle = document.getElementById('salvageCircle');
  const salvageCircle = _cachedSalvageCircle;
  let nearWreck = null;

  entities.sunkenShips.forEach(s => {
    const d = Math.sqrt((playerState.x - s.x) * (playerState.x - s.x) + (playerState.y - s.y) * (playerState.y - s.y));
    if (d < 50 && !s.salvaged) {
      nearWreck = s;
    }
  });

  if (nearWreck) {
    if (salvageContainer) {
      salvageContainer.classList.remove('opacity-0');
      salvageContainer.classList.add('opacity-100');
    }
    salvageProgress += dt / nearWreck.salvageTime;
    const percent = Math.min(100, Math.floor(salvageProgress * 100));
    if (salvageCircle) {
      salvageCircle.setAttribute('stroke-dasharray', `${percent}, 100`);
    }

    // Salvage noise & water disturbance: alerts nearby enemies within 460px
    if (Math.random() < 0.35) {
      entities.particles.push({
        x: playerState.x + (Math.random() - 0.5) * 35,
        y: playerState.y + (Math.random() - 0.5) * 35,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.6 - Math.random() * 1.2,
        life: 0.55,
        color: '#e0f2fe',
        size: 2.5 + Math.random() * 2
      });
    }

    for (let eIdx = 0; eIdx < entities.enemies.length; eIdx++) {
      const e = entities.enemies[eIdx];
      const edx = e.x - playerState.x, edy = e.y - playerState.y;
      if (edx * edx + edy * edy < 460 * 460 && e.alertState === 'unaware') {
        e.alertState = 'suspicious';
        e.detectionMeter = Math.min(100, e.detectionMeter + 50 * dt);
        if (e.detectionMeter >= 100) {
          e.alertState = 'alerted';
          e.targetEntity = playerState;
          sound.playAlertHorn();
          showToast(`${e.name} Mendengar Suara Derek Harta!`, "alert");
        }
      }
    }

    if (salvageProgress >= 1) {
      nearWreck.salvaged = true;
      playerState.salvages++;
      const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { rewardMultiplier: 1.0 };
      const rMult = diffCfg.rewardMultiplier || 1.0;
      const gReward = Math.round(nearWreck.goldReward * rMult);
      const bReward = Math.round(nearWreck.bloodReward * rMult);
      playerState.gold += gReward;
      addFloatingText(`+${gReward} Koin`, playerState.x, playerState.y - 20, '#fbbf24', true);
      if (bReward > 0) {
        playerState.bloodEssence += bReward;
        addFloatingText(`+${bReward} Darah`, playerState.x, playerState.y - 35, '#ef4444', true);
        showToast(`Relik Kuno: +${gReward} Koin +${bReward} Darah!`, "anchor");
      } else {
        showToast(`Harta Karam Diangkat: +${gReward} Koin!`, "gold");
      }
      sound.playCoin();
      sound.playLoot();
      salvageProgress = 0;
      sunkenShipCooldown = 25.0; // Cooldown before next wreck can spawn
      entities.sunkenShips = entities.sunkenShips.filter(s => !s.salvaged);
    }
  } else {
    salvageProgress = 0;
    if (salvageContainer) {
      salvageContainer.classList.remove('opacity-100');
      salvageContainer.classList.add('opacity-0');
    }
  }

  // Collect Floating Cargo & Message in a Bottle
  for (let i = entities.floatingLoots.length - 1; i >= 0; i--) {
    const loot = entities.floatingLoots[i];
    if (((playerState.x - loot.x) * (playerState.x - loot.x) + (playerState.y - loot.y) * (playerState.y - loot.y) < 36 * 36)) {
      if (loot.type === 'repair') {
        playerState.hp = Math.min(currentMaxHp, playerState.hp + 25);
        addFloatingText("+25 HP", playerState.x, playerState.y, '#34d399');
        showToast("Memungut Kayu Apung (+25 Lambung)", "check");
        sound.playSplash();
      } else if (loot.type === 'bottle') {
        playerState.gold += loot.value;
        sound.playLoot();
        // Target nearest unsalvaged ship or Skull Island
        const unsalvaged = entities.sunkenShips.find(s => !s.salvaged);
        if (unsalvaged) {
          activeTreasureHint = { x: unsalvaged.x, y: unsalvaged.y, name: unsalvaged.name || "Bangkai Harta Karun" };
        } else {
          const skullIsl = WORLD_ISLANDS.find(isl => isl.isSkullIsland || isl.id === 'skull_island');
          if (skullIsl) {
            activeTreasureHint = { x: skullIsl.x, y: skullIsl.y, name: skullIsl.name };
          }
        }
        addFloatingText(`+${loot.value} Koin & Peta Kuno!`, playerState.x, playerState.y, '#38bdf8');
        showToast("Pesan Dalam Botol: Jarum kompas menunjukkan lokasi harta karun!", "scroll");
      } else {
        playerState.gold += loot.value;
        addFloatingText(`+${loot.value} Koin`, playerState.x, playerState.y, '#fbbf24');
        showToast(`Peti Terapung: +${loot.value} Koin!`, "gold");
        sound.playCoin();
      }
      entities.floatingLoots.splice(i, 1);
    }
  }

  // Drift Ambient Sea Mist
  entities.ambientMist.forEach(m => {
    m.x += m.vx;
    m.y += m.vy;
    if (((m.x - playerState.x) * (m.x - playerState.x) + (m.y - playerState.y) * (m.y - playerState.y) > 2600 * 2600)) {
      m.x = playerState.x + (Math.random() - 0.5) * 2200;
      m.y = playerState.y + (Math.random() - 0.5) * 2200;
    }
  });

  // Oceanic Seagulls & Carrion Crows flight, banking & sounds
  const skullIslandRef = WORLD_ISLANDS.find(i => i.isSkullIsland || i.id === 'skull_island');
  if (entities.seagulls) {
    entities.seagulls.forEach(s => {
      s.heading += s.turnRate;
      s.x += Math.cos(s.heading) * s.speed;
      s.y += Math.sin(s.heading) * s.speed;
      s.wingPhase += dt * s.wingSpeed;

      // Natural gentle steering adjustment
      if (Math.random() < 0.02) {
        s.turnRate = (Math.random() - 0.5) * 0.025;
      }

      // Identify if bird is in the Blood Sea or circling Skull Island
      const sDistFromCenter = Math.hypot(s.x, s.y);
      const isNearSkull = skullIslandRef && Math.hypot(s.x - skullIslandRef.x, s.y - skullIslandRef.y) < (skullIslandRef.radius + 500);
      s.isCarrion = sDistFromCenter >= 75000 || isNearSkull;

      // Orbit Skull Island if near it
      if (isNearSkull) {
        const angToSkull = Math.atan2(s.y - skullIslandRef.y, s.x - skullIslandRef.x);
        s.heading = angToSkull + Math.PI / 2 + 0.05;
      }

      // Reposition seagulls if they drift too far from the player
      const distToPlayer = Math.sqrt((s.x - playerState.x) * (s.x - playerState.x) + (s.y - playerState.y) * (s.y - playerState.y));
      if (distToPlayer > 1500) {
        const wrapAng = Math.random() * Math.PI * 2;
        s.x = playerState.x + Math.cos(wrapAng) * 950;
        s.y = playerState.y + Math.sin(wrapAng) * 950;
        s.heading = wrapAng + Math.PI + (Math.random() - 0.5) * 0.8;
      }

      // Play seagull sound (cheerful seagull or dark carrion caw) when passing near player
      s.chirpCooldown -= dt;
      if (distToPlayer < 380 && s.chirpCooldown <= 0) {
        if (s.isCarrion) {
          sound.playCrowCaw(s.x, s.y);
          s.chirpCooldown = 14.0 + Math.random() * 18.0;
        } else {
          sound.playSeagullNear(s.x, s.y);
          s.chirpCooldown = 12.0 + Math.random() * 18.0;
        }
      }
    });
  }

  // Rare ambient bird away calls in the background (Crows in Blood Sea, Seagulls in normal seas)
  seagullAwayTimer -= dt;
  if (seagullAwayTimer <= 0) {
    const currentBiome = getBiomeInfo(distFromStart);
    if (currentBiome.isBloodSea) {
      sound.playCrowAway();
    } else {
      sound.playSeagullAway();
    }
    seagullAwayTimer = 20.0 + Math.random() * 25.0;
  }

  // Dynamic Battle Music (Mentrigger lagu tempur seketika saat berhadapan dengan konvoi terkoordinasi)
  const activeConvoyCombat = entities.enemies.some(e => 
    e.alertState === 'alerted' && e.convoyId && e.clan !== 'blood' && (((e.x - playerState.x) * (e.x - playerState.x) + (e.y - playerState.y) * (e.y - playerState.y)) < (950
  ) * (950
  )));
  const alertedCombatCount = entities.enemies.filter(e => 
    e.alertState === 'alerted' && e.clan !== 'blood' && (((e.x - playerState.x) * (e.x - playerState.x) + (e.y - playerState.y) * (e.y - playerState.y)) < (750
  ) * (750
  ))).length;
  const isHighThreatShip = entities.enemies.some(e => 
    e.alertState === 'alerted' && e.tier >= 3 && e.clan !== 'blood' && (((e.x - playerState.x) * (e.x - playerState.x) + (e.y - playerState.y) * (e.y - playerState.y)) < (800
  ) * (800
  )));
  const inHeavyBattle = activeConvoyCombat || (alertedCombatCount >= 2) || isHighThreatShip;
  sound.updateBattleMusic(inHeavyBattle, dt);

  // Dynamic Abyssal Ambiance (Laut Darah atau saat diteror monster abisal di dekat kapal)
  const nearAlertedMonster = entities.enemies.some(e => 
    e.isMonster && e.alertState === 'alerted' && (((e.x - playerState.x) * (e.x - playerState.x) + (e.y - playerState.y) * (e.y - playerState.y)) < (850
  ) * (850
  )));
  sound.updateAbyssalAmbience(biome.isBloodSea || nearAlertedMonster, dt);

  // Particles, Ripples & Combat Text Lifecycle
  for (let i = entities.particles.length - 1; i >= 0; i--) {
    const p = entities.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;
    if (p.life <= 0) entities.particles.splice(i, 1);
  }
  if (entities.particles.length > 70) {
    entities.particles.splice(0, entities.particles.length - 70);
  }

  for (let i = entities.seaRipples.length - 1; i >= 0; i--) {
    const r = entities.seaRipples[i];
    r.radius += dt * 14;
    r.alpha -= dt * 0.45;
    if (r.alpha <= 0) entities.seaRipples.splice(i, 1);
  }
  if (entities.seaRipples.length > 35) {
    entities.seaRipples.splice(0, entities.seaRipples.length - 35);
  }

  for (let i = entities.floatingTexts.length - 1; i >= 0; i--) {
    const ft = entities.floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= dt * 0.9;
    if (ft.alpha <= 0) entities.floatingTexts.splice(i, 1);
  }
  if (entities.floatingTexts.length > 12) {
    entities.floatingTexts.splice(0, entities.floatingTexts.length - 12);
  }

  if (screenShake > 0) {
    screenShake = Math.max(0, screenShake - dt * 25);
  }

  // Real-time encounter spawn cooldown
  encounterSpawnCooldown -= dt;

  if (Date.now() - _lastSpawnCheck > 750) {
    _lastSpawnCheck = Date.now();
    spawnWorldEntities();
  }
}
