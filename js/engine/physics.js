/* ==========================================================================
   LAUT DARAH - PHYSICS, AI & SIMULATION ENGINE
   Procedural Coastline Raycasting, Search & Hide Stealth AI, Spiked Mines, & Occult Towers
   ========================================================================== */

let _cachedSalvageContainer = null;
let _cachedSalvageCircle = null;
let _lastSpawnCheck = 0;

function normAngle(a) {
  a = a % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  else if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

// Line of Sight: Checks if any island obstructs view between two coordinates using organic radius
function hasLineOfSight(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt((dx) * (dx) + (dy) * (dy));
  if (dist < 1) return true;

  const steps = Math.ceil(dist / 35);
  for (let s = 1; s < steps; s++) {
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

// Ports frequented by human seafaring clans
const HUMAN_PORTS = ['haven', 'batavia_outpost', 'iron_forge_isle', 'shark_reef', 'mist_atoll'];

function pickDestinationIsland(shipOrClan, currentIslandId = null) {
  const clan = (typeof shipOrClan === 'string') ? shipOrClan : (shipOrClan && shipOrClan.clan);
  let candidates = HUMAN_PORTS.filter(id => id !== currentIslandId);
  if (clan === 'gold') {
    candidates = ['batavia_outpost', 'haven', 'iron_forge_isle'].filter(id => id !== currentIslandId);
  } else if (clan === 'iron') {
    candidates = ['iron_forge_isle', 'shark_reef', 'batavia_outpost', 'haven'].filter(id => id !== currentIslandId);
  } else if (clan === 'mist') {
    candidates = ['mist_atoll', 'shark_reef', 'haven'].filter(id => id !== currentIslandId);
  }
  if (!candidates || candidates.length === 0) candidates = ['haven', 'batavia_outpost', 'iron_forge_isle'];
  const chosenId = candidates[Math.floor(Math.random() * candidates.length)];
  return WORLD_ISLANDS.find(isl => isl.id === chosenId) || WORLD_ISLANDS[0];
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

function spawnSolitaryShip(ex, ey, angle, clan, distFromCenter) {
  const destIsl = pickDestinationIsland(clan);
  const isStartingDocked = Math.random() < 0.35;
  const tier = Math.min(2, Math.floor(distFromCenter / 2600));
  entities.enemies.push(createEnemyEntity(clan, tier, ex, ey, angle, {
    formationType: 'solitary',
    formationRole: 'solitary',
    isAnchored: isStartingDocked,
    voyageState: isStartingDocked ? 'docked' : 'voyaging',
    destinationIslandId: destIsl ? destIsl.id : 'haven',
    dockTimer: isStartingDocked ? (16 + Math.random() * 20) : 0
  }));
}

let encounterSpawnCooldown = 4.0;

function spawnWorldEntities() {
  const playerDist = Math.sqrt((playerState.x) * (playerState.x) + (playerState.y) * (playerState.y));
  const biome = getBiomeInfo(playerDist);

  const maxDist = 2400;
  for (let i = entities.enemies.length - 1; i >= 0; i--) {
    const e = entities.enemies[i];
    const dx = e.x - playerState.x, dy = e.y - playerState.y;
    if (dx * dx + dy * dy >= maxDist * maxDist) {
      entities.enemies[i] = entities.enemies[entities.enemies.length - 1];
      entities.enemies.pop();
    }
  }
  for (let i = entities.sunkenShips.length - 1; i >= 0; i--) {
    const s = entities.sunkenShips[i];
    const dx = s.x - playerState.x, dy = s.y - playerState.y;
    if (dx * dx + dy * dy >= maxDist * maxDist) {
      entities.sunkenShips[i] = entities.sunkenShips[entities.sunkenShips.length - 1];
      entities.sunkenShips.pop();
    }
  }
  for (let i = entities.floatingLoots.length - 1; i >= 0; i--) {
    const l = entities.floatingLoots[i];
    const dx = l.x - playerState.x, dy = l.y - playerState.y;
    if (dx * dx + dy * dy >= maxDist * maxDist) {
      entities.floatingLoots[i] = entities.floatingLoots[entities.floatingLoots.length - 1];
      entities.floatingLoots.pop();
    }
  }
  for (let i = entities.mines.length - 1; i >= 0; i--) {
    const m = entities.mines[i];
    const dx = m.x - playerState.x, dy = m.y - playerState.y;
    if (dx * dx + dy * dy >= maxDist * maxDist) {
      entities.mines[i] = entities.mines[entities.mines.length - 1];
      entities.mines.pop();
    }
  }

  // Maintain docked clan guards / island patrols (Max 1 guard per outpost)
  WORLD_ISLANDS.forEach(isl => {
    const distToPlayer = Math.sqrt((isl.x - playerState.x) * (isl.x - playerState.x) + (isl.y - playerState.y) * (isl.y - playerState.y));
    if (distToPlayer < 1400 && isl.clan !== 'neutral') {
      const islandGuards = entities.enemies.filter(e => e.homeIslandId === isl.id);
      if (islandGuards.length < 1) {
        const spawnAngle = isl.dockAngle + (Math.random() - 0.5) * 0.9;
        const rAtAng = getIslandRadiusAt(isl, spawnAngle);
        const spawnDist = rAtAng + 45 + Math.random() * 55;
        const ex = isl.x + Math.cos(spawnAngle) * spawnDist;
        const ey = isl.y + Math.sin(spawnAngle) * spawnDist;

        const tierIndex = Math.min(2, Math.floor(isl.radius / 150) - 1);
        entities.enemies.push(createEnemyEntity(isl.clan, Math.max(0, tierIndex), ex, ey, spawnAngle + Math.PI / 2, {
          homeIslandId: isl.id,
          formationType: 'solitary',
          formationRole: 'guard'
        }));
      }
    }
  });

  // Open Ocean Structured Encounters (Spawn Throttled & Distant: Max 8 enemies total)
  encounterSpawnCooldown -= 0.016;
  const maxEnemies = 8;
  if (entities.enemies.length < maxEnemies && encounterSpawnCooldown <= 0) {
    encounterSpawnCooldown = 9.0 + Math.random() * 7.0; // Wait 9-16 seconds between open ocean spawns
    const spawnAngle = Math.random() * Math.PI * 2;
    // Spawn safely off-screen (1250 - 1750px away from player)
    const spawnDist = 1250 + Math.random() * 500;
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
      // Safe Zone: No hostile armadas patrol inside Home Harbor waters (within 750px of center)
      if (distFromCenter >= 750) {
        const encounterAngle = Math.random() * Math.PI * 2;

        if (distFromCenter >= 6500) {
          // BLOOD SEA: 65% Solo Leviathan apex roaming, 35% Monster Pairs (Mother + Juvenile)
          const isPair = Math.random() < 0.35;
          const convoyId = 'monster_' + Math.random().toString(36).substr(2, 6);

          if (isPair) {
            // 1 Alpha Monster + 1 Agile Juvenile
            const alphaTier = Math.random() < 0.5 ? 1 : 2;
            entities.enemies.push(createEnemyEntity('blood', alphaTier, ex, ey, encounterAngle, {
              convoyId: convoyId,
              formationType: 'monster_pair',
              formationRole: 'monster_alpha'
            }));

            const juvAngle = encounterAngle + 2.2;
            const jx = ex + Math.cos(juvAngle) * 60;
            const jy = ey + Math.sin(juvAngle) * 60;
            entities.enemies.push(createEnemyEntity('blood', 0, jx, jy, encounterAngle, {
              convoyId: convoyId,
              formationType: 'monster_pair',
              formationRole: 'monster_juvenile',
              name: 'Anak Monster Palung'
            }));
          } else {
            // Solo Ancient Leviathan (Highest rate for monsters)
            entities.enemies.push(createEnemyEntity('blood', 2, ex, ey, encounterAngle, {
              formationType: 'solitary',
              formationRole: 'solitary',
              name: 'Leviathan Raksasa Purba'
            }));
          }

        } else {
          // EMPIRE SEAS: Single Ship Cruising (Highest Rate: 65-70%), Convoys & Formations Rarer (10-15%)
          const roll = Math.random();

          if (distFromCenter < 2400) {
            // Inner Empire: 70% Single Ship Cruising, 15% Batavia Column, 15% Iron Wedge
            if (roll < 0.70) {
              spawnSolitaryShip(ex, ey, encounterAngle, Math.random() < 0.55 ? 'gold' : 'iron', distFromCenter);
            } else if (roll < 0.85) {
              spawnBataviaConvoy(ex, ey, encounterAngle);
            } else {
              spawnIronWedge(ex, ey, encounterAngle);
            }

          } else if (distFromCenter < 4800) {
            // Mid Seas: 65% Single Ship Cruising, 15% Batavia Column, 10% Iron Wedge, 10% Mist Ritual
            if (roll < 0.65) {
              spawnSolitaryShip(ex, ey, encounterAngle, Math.random() < 0.4 ? 'gold' : (Math.random() < 0.75 ? 'iron' : 'mist'), distFromCenter);
            } else if (roll < 0.80) {
              spawnBataviaConvoy(ex, ey, encounterAngle);
            } else if (roll < 0.90) {
              spawnIronWedge(ex, ey, encounterAngle);
            } else {
              spawnMistRitual(ex, ey);
            }

          } else {
            // Outer Reaches: 65% Solitary Ship Cruising, 15% Mist Ritual, 10% Iron Wedge, 10% Monster Pair
            if (roll < 0.65) {
              spawnSolitaryShip(ex, ey, encounterAngle, Math.random() < 0.6 ? 'mist' : 'iron', distFromCenter);
            } else if (roll < 0.80) {
              spawnMistRitual(ex, ey);
            } else if (roll < 0.90) {
              spawnIronWedge(ex, ey, encounterAngle);
            } else {
              // Rare monster scouting pair near deep abyss
              const convoyId = 'monster_' + Math.random().toString(36).substr(2, 6);
              entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, encounterAngle, {
                convoyId: convoyId,
                formationType: 'monster_pair',
                formationRole: 'monster_alpha'
              }));
              entities.enemies.push(createEnemyEntity('blood', 0, ex + 55, ey + 55, encounterAngle, {
                convoyId: convoyId,
                formationType: 'monster_pair',
                formationRole: 'monster_juvenile'
              }));
            }
          }
        }
      }
    }
  }

  // Spawn Sunken Ships
  if (entities.sunkenShips.length < 5) {
    const sAngle = Math.random() * Math.PI * 2;
    const sDist = 450 + Math.random() * 700;
    const sx = playerState.x + Math.cos(sAngle) * sDist;
    const sy = playerState.y + Math.sin(sAngle) * sDist;
    const sDistCenter = Math.sqrt((sx) * (sx) + (sy) * (sy));

    let onLand = false;
    WORLD_ISLANDS.forEach(isl => {
      const ang = Math.atan2(sy - isl.y, sx - isl.x);
      if (Math.sqrt((sx - isl.x) * (sx - isl.x) + (sy - isl.y) * (sy - isl.y)) < getIslandRadiusAt(isl, ang) + 30) onLand = true;
    });

    if (!onLand) {
      entities.sunkenShips.push({
        id: Math.random(),
        x: sx,
        y: sy,
        angle: Math.random() * Math.PI * 2,
        radius: 38,
        salvageTime: 3.5,
        salvaged: false,
        isAbyssal: sDistCenter >= 6800,
        goldReward: Math.floor(25 + (sDistCenter / 150)),
        bloodReward: sDistCenter >= 6800 ? Math.floor(8 + (sDistCenter - 6800) / 250) : 0
      });
    }
  }

  // Spawn Floating Loot crates
  if (entities.floatingLoots.length < 7) {
    const fAngle = Math.random() * Math.PI * 2;
    const fDist = 300 + Math.random() * 600;
    entities.floatingLoots.push({
      id: Math.random(),
      x: playerState.x + Math.cos(fAngle) * fDist,
      y: playerState.y + Math.sin(fAngle) * fDist,
      type: Math.random() > 0.3 ? 'gold' : 'repair',
      value: Math.floor(10 + Math.random() * 20),
      bobOffset: Math.random() * 10
    });
  }
}

function updateGame(dt) {
  const currentMaxHp = getStatValue('hull', playerState.upgrades.hull);
  const moveSpeed = getStatValue('speed', playerState.upgrades.speed);

  // Joystick / Keyboard Steering & Movement
  let isPlayerMoving = false;
  if (joystickState.active && joystickState.magnitude > 0.08) {
    isPlayerMoving = true;
    const targetAngle = joystickState.angle;
    let diff = targetAngle - playerState.angle;
    
    diff = normAngle(diff);

    const turnSpeed = 3.2 * dt;
    playerState.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);

    const currentSpeed = moveSpeed * joystickState.magnitude;
    playerState.x += Math.cos(playerState.angle) * currentSpeed;
    playerState.y += Math.sin(playerState.angle) * currentSpeed;

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
  }

  // Island physical collision using Procedural Coastline Radius
  WORLD_ISLANDS.forEach(isl => {
    const _dx = playerState.x - isl.x, _dy = playerState.y - isl.y;
    const _maxR = ((isl.radius || 200) * 1.3 + 50);
    if (_dx * _dx + _dy * _dy > _maxR * _maxR) return;
    const ang = Math.atan2(_dy, _dx);
    const rAtAng = getIslandRadiusAt(isl, ang);
    const d = Math.sqrt(_dx * _dx + _dy * _dy);
    const minDist = rAtAng + 15;
    if (d < minDist && d > 0.001) {
      playerState.x = isl.x + Math.cos(ang) * minDist;
      playerState.y = isl.y + Math.sin(ang) * minDist;
    }
  });

  // Max Distance Record
  const distFromStart = Math.floor(Math.sqrt((playerState.x) * (playerState.x) + (playerState.y) * (playerState.y)));
  if (distFromStart > playerState.maxDistanceReached) {
    playerState.maxDistanceReached = distFromStart;
  }

  // Biome & Blood Sea roar ambient
  const biome = getBiomeInfo(distFromStart);
  if (biome.isBloodSea) {
    bloodSeaRoarTimer += dt;
    if (bloodSeaRoarTimer > 18) {
      bloodSeaRoarTimer = 0;
      sound.playEerieRoar();
      showToast("Jeritan terdengar dari palung Laut Darah...", "alert");
    }
  }

  // Broadside Cannons Auto-Fire
  const fireDelay = Math.max(0.4, 1.3 - (playerState.upgrades.speed - 1) * 0.1);
  const currentTimeSec = Date.now() / 1000;

  if (currentTimeSec - lastFireTime >= fireDelay) {
    const targetInBroadside = entities.enemies.some(e => {
      const dx = e.x - playerState.x, dy = e.y - playerState.y;
      if (dx * dx + dy * dy > 260 * 260) return false;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (!hasLineOfSight(playerState.x, playerState.y, e.x, e.y)) return false;
      const angleToEnemy = Math.atan2(e.y - playerState.y, e.x - playerState.x);
      let relativeAngle = Math.abs(angleToEnemy - playerState.angle);
      while (relativeAngle > Math.PI) relativeAngle = Math.abs(relativeAngle - Math.PI * 2);
      return relativeAngle > 0.65 && relativeAngle < 2.35;
    });

    if (targetInBroadside) {
      fireCannons(playerState, null, true);
    }
  }

  // Rear Defense / Stern Chaser check
  if (playerState.upgrades.rearDefense > 0) {
    const targetInRear = entities.enemies.some(e => {
      const dx = e.x - playerState.x, dy = e.y - playerState.y;
      if (dx * dx + dy * dy > 220 * 220) return false;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (!hasLineOfSight(playerState.x, playerState.y, e.x, e.y)) return false;
      const angleToEnemy = Math.atan2(e.y - playerState.y, e.x - playerState.x);
      let relativeAngle = Math.abs(angleToEnemy - playerState.angle);
      while (relativeAngle > Math.PI) relativeAngle = Math.abs(relativeAngle - Math.PI * 2);
      return relativeAngle >= 2.35;
    });

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

    // Check proximity to Enemies
    for (let j = 0; j < entities.enemies.length; j++) {
      const e = entities.enemies[j];
      const dx = e.x - sm.x, dy = e.y - sm.y;
      if (dx * dx + dy * dy < (e.radius + 25) * (e.radius + 25)) {
        sm.detonating = true;
        break;
      }
    }

    if (sm.detonating) {
      sm.detonateTimer -= dt;
      sm.flashTimer += dt * 16;
      if (sm.detonateTimer <= 0) {
        // DETONATE!
        sound.playMineExplosion(sm.x, sm.y);
        screenShake = Math.max(screenShake, 10);

        // Damage Player if in blast radius
        if (distToPlayer < 90) {
          playerState.hp -= sm.damage;
          addFloatingText(`LEDAKAN RANJAU! -${sm.damage}`, playerState.x, playerState.y, '#ef4444', true);
          if (playerState.hp <= 0) {
            triggerGameOver("Kapal Anda hancur terkena ladang ranjau bertaji besi!");
          }
        }

        // Damage Enemies in blast radius
        entities.enemies.forEach(e => {
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

  // Occult Watchtowers (Mist Atoll Spires)
  entities.towers.forEach(tw => {
    tw.orbAngle += dt * 1.6;
    tw.glowPulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5;

    tw.shootCooldown -= dt;
    if (tw.shootCooldown <= 0) {
      // Find targets: Player or non-Mist ships within 440px range
      const dx = playerState.x - tw.x, dy = playerState.y - tw.y;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);
      let target = null;
      if (dx * dx + dy * dy < 440 * 440 && hasLineOfSight(tw.x, tw.y, playerState.x, playerState.y)) {
        target = playerState;
      } else {
        // Target rival ships
        const rival = entities.enemies.find(e => e.clan !== 'mist' && ((e.x - tw.x) * (e.x - tw.x) + (e.y - tw.y) * (e.y - tw.y) < 440 * 440));
        if (rival) target = rival;
      }

      if (target) {
        tw.shootCooldown = 3.0;
        sound.playMistCast(tw.x, tw.y);

        let tgtVx = 0;
        let tgtVy = 0;
        if (target === playerState) {
          tgtVx = Math.cos(playerState.angle) * (playerState.speed || 0);
          tgtVy = Math.sin(playerState.angle) * (playerState.speed || 0);
        } else {
          tgtVx = Math.cos(target.angle || 0) * (target.speed || 1.4);
          tgtVy = Math.sin(target.angle || 0) * (target.speed || 1.4);
        }

        const dToTgt = Math.sqrt((target.x - tw.x) * (target.x - tw.x) + (target.y - tw.y) * (target.y - tw.y));
        const pSpeed = 4.8;
        const timeToHit = Math.min(1.4, dToTgt / pSpeed);
        const aimX = target.x + tgtVx * timeToHit * 0.85;
        const aimY = target.y + tgtVy * timeToHit * 0.85;
        const fireAngle = Math.atan2(aimY - tw.y, aimX - tw.x);

        entities.projectiles.push({
          type: 'spirit',
          sourceClan: 'mist',
          target: target,
          x: tw.x,
          y: tw.y - 15,
          vx: Math.cos(fireAngle) * pSpeed,
          vy: Math.sin(fireAngle) * pSpeed,
          angle: fireAngle,
          speed: pSpeed,
          turnRate: 3.4,
          radius: 7,
          damage: 28,
          isPlayer: false,
          life: 3.8,
          clan: 'mist'
        });
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

    // Collision with Organic Islands
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

    // Check hit against Spiked Sea Mines (Can be detonated by player cannons!)
    if (p.isPlayer) {
      for (let k = 0; k < entities.spikedMines.length; k++) {
        const sm = entities.spikedMines[k];
        const dx = p.x - sm.x, dy = p.y - sm.y;
        if (dx * dx + dy * dy < (sm.radius + 8) * (sm.radius + 8)) {
          sm.detonating = true;
          sm.detonateTimer = 0.05; // Detonate immediately!
          p.life = 0;
          break;
        }
      }

      // Check hit against Occult Towers
      for (let t = entities.towers.length - 1; t >= 0; t--) {
        const tw = entities.towers[t];
        if (((p.x - tw.x) * (p.x - tw.x) + (p.y - tw.y) * (p.y - tw.y) < (tw.radius + 10) * (tw.radius + 10))) {
          tw.hp -= p.damage;
          p.life = 0;
          sound.playMistCast(tw.x, tw.y);
          addFloatingText(`-${Math.round(p.damage)}`, tw.x, tw.y - 20, '#22d3ee', true);

          if (tw.hp <= 0) {
            sound.playEerieRoar();
            screenShake = 12;
            playerState.gold += 70;
            playerState.bloodEssence += 15;
            showToast(`Menara Okultis Diruntuhkan! +70 Koin +15 Darah`, "scroll");

            // Massive Occult Burst
            for (let b = 0; b < 30; b++) {
              const bang = (b / 30) * Math.PI * 2;
              entities.particles.push({
                x: tw.x,
                y: tw.y,
                vx: Math.cos(bang) * (3 + Math.random() * 4),
                vy: Math.sin(bang) * (3 + Math.random() * 4),
                life: 0.8,
                color: '#22d3ee',
                size: 4 + Math.random() * 3
              });
            }
            entities.towers.splice(t, 1);
          }
          break;
        }
      }
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
            const goldGained = e.isMonster ? Math.floor(45 + Math.random() * 55) : Math.floor(18 + Math.random() * 25 * e.tier);
            playerState.gold += goldGained;
            
            if (e.isMonster || biome.isBloodSea) {
              const bloodGained = Math.floor(4 * e.tier + Math.random() * 6);
              playerState.bloodEssence += bloodGained;
              showToast(`+${goldGained} Koin +${bloodGained} Darah: Menumpas ${e.name}!`, "blood");
            } else {
              showToast(`+${goldGained} Koin: Menenggelamkan ${e.name}!`, "gold");
            }
            sound.playCoin();

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
        playerState.hp -= p.damage;
        p.life = 0;
        sound.playHit(playerState.x, playerState.y);
        screenShake = 7;
        addFloatingText(`-${Math.round(p.damage)}`, playerState.x, playerState.y, '#ef4444', true);

        for (let sp = 0; sp < 6; sp++) {
          entities.particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 0.35,
            color: '#78350f',
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
          if (rival.clan !== p.sourceClan && ((p.x - rival.x) * (p.x - rival.x) + (p.y - rival.y) * (p.y - rival.y) < rival.radius * rival.radius)) {
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

      const minSafeDist = e1.radius + e2.radius + 18;
      if (dist < minSafeDist && dist > 0.001) {
        const overlap = (minSafeDist - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;
        e1.x -= nx * overlap * 0.6;
        e1.y -= ny * overlap * 0.6;
        e2.x += nx * overlap * 0.6;
        e2.y += ny * overlap * 0.6;
      }
    }
  }

  // 2. Process AI behavior, stealth vision, and inter-clan rival battles
  entities.enemies.forEach(e => {
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
    const distMoved = Math.sqrt((e.x - (e.prevX ?? e.x)) * (e.x - (e.prevX ?? e.x)) + (e.y - (e.prevY ?? e.y) * (e.y - (e.prevY ?? e.y)));
    e.isMoving = distMoved > 0.22;
    e.prevX = e.x;
    e.prevY = e.y;

    // Enemy Water Trail: ONLY when actually translating across the ocean!
    if (e.isMoving && Math.random() < 0.55) {
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

    const distToPlayer = Math.sqrt((playerState.x - e.x) * (playerState.x - e.x) + (playerState.y - e.y) * (playerState.y - e.y));
    const targetAngle = Math.atan2(playerState.y - e.y, playerState.x - e.x);
    // STATE 1: UNAWARE / SUSPICIOUS
    let checkLOS() = false;
    let _canSeeComputed = false;
    
    function checkLOS() {
      if (!_canSeeComputed) {
         checkLOS() = hasLineOfSight(e.x, e.y, playerState.x, playerState.y);
         _canSeeComputed = true;
      }
      return checkLOS();
    }

    if (e.alertState === 'unaware' || e.alertState === 'suspicious') {
      let detected = false;

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
              matif (!e.lastKnownPos) e.lastKnownPos = { x: 0, y: 0 };
          e.lastKnownPos.x = playerState.x;
          e.lastKnownPos.y = playerState.y;
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
      const alertEscapeRadius = (e.isMonster ? 850 : (e.convoyId ? 780 : 720)) * stealthMult;
      const insideEscapeCircle = distToPlayer <= alertEscapeRadius;

      if (insideEscapeCircle && checkLOS()) {
        if (!e.lastKnownPos) e.lastKnownPos = { x: 0, y: 0 };
          e.lastKnownPos.x = playerState.x;
          e.lastKnownPos.y = playerState.y;
        e.detectionMeter = 100;
        e.lostSightTimer = 0;
      } else {
        // Grace period 5.5 detik: jangan langsung lepas target saat charging melewatinya atau manuver menjauh!
        e.lostSightTimer = (e.lostSightTimer || 0) + dt;
        if (e.lostSightTimer > 5.5 || distToPlayer > 950) {
          e.alertState = 'searching';
          e.searchTimer = 5.0;
          e.detectionMeter = 100;
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
              matif (!e.lastKnownPos) e.lastKnownPos = { x: 0, y: 0 };
          e.lastKnownPos.x = playerState.x;
          e.lastKnownPos.y = playerState.y;
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
    const _now = Date.now();
    let nearestRival = null;
    let minRivalDist = 550;

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

    if (nearestRival) {
      const distToPlayer = Math.sqrt((playerState.x - e.x) * (playerState.x - e.x) + (playerState.y - e.y) * (playerState.y - e.y));
      // Engage rival if unaware, OR if currently targeting player but rival is closer/in immediate combat range
      const shouldEngageRival = (e.alertState === 'unaware') ||
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

          if (e.chargeState === 'charging' || e.clan === 'iron' || e.isMonster) {
            const ramDmg = Math.round(e.damage * (e.chargeState === 'charging' ? 1.4 : 0.85));
            target.hp -= ramDmg;
            if (e.clan === 'iron') {
              sound.playIronHit(target.x, target.y);
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
              e.shootCooldown = 2.4 + Math.random() * 1.5;
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
            e.specialCooldown = 3.0 + Math.random() * 1.8;
            fireSpiritWisps(e, target);
          }
        }
      } else if (e.clan === 'blood') {
        e.specialCooldown -= dt;
        let monsterHeading = avoidIslandObstacles(e, targetAngle, 160);
        let angleDiff = monsterHeading - e.angle;
        angleDiff = normAngle(angleDiff);
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
        const surge = (!isSearching && targetDist < 160) ? 1.7 : 1.0;
        e.x += Math.cos(e.angle) * (cruiseSpeed * surge);
        e.y += Math.sin(e.angle) * (cruiseSpeed * surge);

        if (!isSearching && surge > 1.0) {
          sound.playMonsterCharge(e.x, e.y);
        } else if (targetDist < 450) {
          sound.playMonsterMove(e.x, e.y);
        }

        if (!isSearching && e.specialCooldown <= 0 && targetDist < 340) {
          e.specialCooldown = 2.8 + Math.random() * 1.5;
          fireChitinSpikes(e, e.tier >= 3);
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
            e.shootCooldown = 1.8 + Math.random() * 1.3;
            fireCannons(e, target, false);
          }
        }
      }
    } else {
      // Passive Navigation: Convoys, Rituals, Monster Pairs, Island Guards, and Solitary Ships
      if (e.homeIslandId) {
        const homeIsl = WORLD_ISLANDS.find(i => i.id === e.homeIslandId);
        if (homeIsl) {
          e.patrolAngle += 0.45 * dt * e.orbitDir;
          const rAtAng = getIslandRadiusAt(homeIsl, e.patrolAngle);
          const patrolDist = rAtAng + 65;
          const targetPatrolX = homeIsl.x + Math.cos(e.patrolAngle) * patrolDist;
          const targetPatrolY = homeIsl.y + Math.sin(e.patrolAngle) * patrolDist;
          const headingToPatrol = Math.atan2(targetPatrolY - e.y, targetPatrolX - e.x);

          let angleDiff = headingToPatrol - e.angle;
          angleDiff = normAngle(angleDiff);
          e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
          e.x += Math.cos(e.angle) * (e.speed * 0.7);
          e.y += Math.sin(e.angle) * (e.speed * 0.7);
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

    if (salvageProgress >= 1) {
      nearWreck.salvaged = true;
      playerState.salvages++;
      playerState.gold += nearWreck.goldReward;
      addFloatingText(`+${nearWreck.goldReward} Koin`, playerState.x, playerState.y - 20, '#fbbf24', true);
      if (nearWreck.bloodReward > 0) {
        playerState.bloodEssence += nearWreck.bloodReward;
        addFloatingText(`+${nearWreck.bloodReward} Darah`, playerState.x, playerState.y - 35, '#ef4444', true);
        showToast(`Relik Kuno: +${nearWreck.goldReward} Koin +${nearWreck.bloodReward} Darah!`, "anchor");
      } else {
        showToast(`Harta Karam Diangkat: +${nearWreck.goldReward} Koin!`, "gold");
      }
      sound.playCoin();
      sound.playLoot();
      salvageProgress = 0;
      entities.sunkenShips = entities.sunkenShips.filter(s => !s.salvaged);
    }
  } else {
    salvageProgress = 0;
    if (salvageContainer) {
      salvageContainer.classList.remove('opacity-100');
      salvageContainer.classList.add('opacity-0');
    }
  }

  // Collect Floating Cargo
  for (let i = entities.floatingLoots.length - 1; i >= 0; i--) {
    const loot = entities.floatingLoots[i];
    if (((playerState.x - loot.x) * (playerState.x - loot.x) + (playerState.y - loot.y) * (playerState.y - loot.y) < 36 * 36)) {
      if (loot.type === 'repair') {
        playerState.hp = Math.min(currentMaxHp, playerState.hp + 25);
        addFloatingText("+25 HP", playerState.x, playerState.y, '#34d399');
        showToast("Memungut Kayu Apung (+25 Lambung)", "check");
        sound.playSplash();
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

  // Oceanic Seagulls (Burung Camar Laut) flight, banking & sounds
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

      // Reposition seagulls if they drift too far from the player
      const distToPlayer = Math.sqrt((s.x - playerState.x) * (s.x - playerState.x) + (s.y - playerState.y) * (s.y - playerState.y));
      if (distToPlayer > 1500) {
        const wrapAng = Math.random() * Math.PI * 2;
        s.x = playerState.x + Math.cos(wrapAng) * 950;
        s.y = playerState.y + Math.sin(wrapAng) * 950;
        s.heading = wrapAng + Math.PI + (Math.random() - 0.5) * 0.8;
      }

      // Play seagull sound when passing near player
      s.chirpCooldown -= dt;
      if (distToPlayer < 380 && s.chirpCooldown <= 0) {
        sound.playSeagullNear(s.x, s.y);
        s.chirpCooldown = 12.0 + Math.random() * 18.0;
      }
    });
  }

  // Rare ambient seagull away calls in the background
  seagullAwayTimer -= dt;
  if (seagullAwayTimer <= 0) {
    sound.playSeagullAway();
    seagullAwayTimer = 25.0 + Math.random() * 30.0;
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

  if (Date.now() - _lastSpawnCheck > 1500) {
    _lastSpawnCheck = Date.now();
    spawnWorldEntities();
  }
}
