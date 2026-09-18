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
  // Adaptive Draw Distance & Density parameters (PC vs Mobile)
  const maxEnemies = isMobile ? 14 : 16;
  const minLocalEnemies = isMobile ? 3 : 4;
  const localRadius = isMobile ? 1350 : 1750;
  const recycleDist = isMobile ? 1900 : 2500;
  const spawnDistMin = isMobile ? 720 : 950;
  const spawnDistMax = isMobile ? 980 : 1300;

  const playerDist = Math.sqrt((playerState.x) * (playerState.x) + (playerState.y) * (playerState.y));
  const biome = getBiomeInfo(playerDist);

  // 1. Distance-Based Entity Recycling: Only despawn unaware enemies when beyond recycleDist
  for (let i = entities.enemies.length - 1; i >= 0; i--) {
    const e = entities.enemies[i];
    const dx = e.x - playerState.x, dy = e.y - playerState.y;
    // Keep ships that are currently fighting the player
    if (dx * dx + dy * dy >= recycleDist * recycleDist && e.alertState !== 'alerted') {
      entities.enemies.splice(i, 1);
    }
  }

  // Despawn props when beyond maxPropDist
  const maxPropDist = isMobile ? 1900 : 2500;
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

  // 2. Count active enemies in the player's immediate cruising sector
  let localEnemiesCount = 0;
  for (let i = 0; i < entities.enemies.length; i++) {
    const e = entities.enemies[i];
    const dx = e.x - playerState.x, dy = e.y - playerState.y;
    if (dx * dx + dy * dy < localRadius * localRadius) {
      localEnemiesCount++;
    }
  }

  // Maintain docked clan guards / island patrols (Max 1 guard per outpost)
  WORLD_ISLANDS.forEach(isl => {
    const distToPlayerSq = (isl.x - playerState.x) * (isl.x - playerState.x) + (isl.y - playerState.y) * (isl.y - playerState.y);
    if (distToPlayerSq < 1400 * 1400 && isl.clan !== 'neutral') {
      const islandGuards = entities.enemies.filter(e => e.homeIslandId === isl.id);
      if (islandGuards.length < 1 && entities.enemies.length < maxEnemies) {
        const spawnAngle = (isl.dockAngle !== undefined ? isl.dockAngle : 0) + (Math.random() - 0.5) * 0.9;
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

  // 3. Open Ocean Forward Intercept Encounters
  const shouldSpawnEncounter = entities.enemies.length < maxEnemies && 
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

        if (distFromCenter >= 5500) {
          // 100% BLOOD SEA MONSTERS: Depth scaling with increasing ferocity & frequency
          const depth = Math.min(1.0, (distFromCenter - 5500) / 2500);
          encounterSpawnCooldown = Math.max(1.4, 3.8 - depth * 2.2 + Math.random() * 1.2);
          const roll = Math.random();

          if (depth < 0.35) {
            // Shallows of Blood Sea: Immediate Larva or Hydra encounters
            if (roll < 0.55) {
              entities.enemies.push(createEnemyEntity('blood', 0, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary'
              }));
            } else {
              entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary'
              }));
            }
          } else if (depth < 0.75) {
            // Mid Blood Sea: Monster Pairs or Hydra
            if (roll < 0.50 && entities.enemies.length <= maxEnemies - 2) {
              spawnMonsterPair(ex, ey, encounterAngle);
            } else {
              entities.enemies.push(createEnemyEntity('blood', 1, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary'
              }));
            }
          } else {
            // Abyssal Core: Apex Leviathans & Aggressive Monster Packs
            if (roll < 0.45 && entities.enemies.length <= maxEnemies - 2) {
              spawnMonsterPair(ex, ey, encounterAngle);
            } else {
              entities.enemies.push(createEnemyEntity('blood', 2, ex, ey, encounterAngle, {
                formationType: 'solitary',
                formationRole: 'solitary',
                name: 'Leviathan Raksasa Purba'
              }));
            }
          }
        } else if (distFromCenter >= 3800) {
          // MIST WATERS: 35% Mist Ritual, 30% Iron Wedge, 35% Solitary Occult
          const roll = Math.random();
          if (roll < 0.35 && entities.enemies.length <= maxEnemies - 3) {
            spawnMistRitual(ex, ey);
          } else if (roll < 0.65 && entities.enemies.length <= maxEnemies - 3) {
            spawnIronWedge(ex, ey, encounterAngle);
          } else {
            spawnSolitaryShip(ex, ey, encounterAngle, 'mist', distFromCenter);
          }
        } else if (distFromCenter >= 2000) {
          // IRON SEAS: 35% Iron Wedge, 30% Batavia Convoy, 35% Solitary Iron
          const roll = Math.random();
          if (roll < 0.35 && entities.enemies.length <= maxEnemies - 3) {
            spawnIronWedge(ex, ey, encounterAngle);
          } else if (roll < 0.65 && entities.enemies.length <= maxEnemies - 3) {
            spawnBataviaConvoy(ex, ey, encounterAngle);
          } else {
            spawnSolitaryShip(ex, ey, encounterAngle, 'iron', distFromCenter);
          }
        } else {
          // BATAVIA SEAS: 35% Batavia Convoy, 25% Iron Wedge, 40% Solitary Merchant
          const roll = Math.random();
          if (roll < 0.35 && entities.enemies.length <= maxEnemies - 3) {
            spawnBataviaConvoy(ex, ey, encounterAngle);
          } else if (roll < 0.60 && entities.enemies.length <= maxEnemies - 3) {
            spawnIronWedge(ex, ey, encounterAngle);
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
      const isAbyssal = sDistCenter >= 4200;

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
        goldReward: Math.floor(45 + (sDistCenter / 120)),
        bloodReward: isAbyssal ? Math.floor(5 + (sDistCenter - 4200) / 300) : 0
      });

      // Spawn Scavenger / Guard Ship around the wreck
      if (isGuarded && entities.enemies.length < maxEnemies) {
        let guardClan = 'gold';
        let tierIdx = 0;
        if (sDistCenter >= 4200) {
          guardClan = 'blood';
          tierIdx = Math.random() < 0.5 ? 0 : 1;
        } else if (sDistCenter >= 2600) {
          guardClan = 'mist';
          tierIdx = Math.random() < 0.6 ? 0 : 1;
        } else if (sDistCenter >= 1600) {
          guardClan = 'iron';
          tierIdx = Math.random() < 0.6 ? 0 : 1;
        } else {
          guardClan = 'gold';
          tierIdx = Math.random() < 0.7 ? 0 : 1;
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

function updateGame(dt) {
  const currentMaxHp = getStatValue('hull', playerState.upgrades.hull);
  const moveSpeed = getStatValue('speed', playerState.upgrades.speed);

  // Dynamic Ocean Wind & Sailing Tailwind Bonus
  windAngle += 0.0012 * dt;
  const windAlignment = Math.cos(playerState.angle - windAngle);
  const tailwindBonus = 1 + Math.max(0, windAlignment) * 0.15; // Up to +15% speed boost when running with wind!

  // Iron Harpoon Snare Debuff
  if (playerState.speedSnareTimer > 0) {
    playerState.speedSnareTimer -= dt;
  }
  const snareMultiplier = (playerState.speedSnareTimer > 0) ? 0.65 : 1.0;

  // Joystick / Keyboard Steering & Movement
  let isPlayerMoving = false;
  if (joystickState.active && joystickState.magnitude > 0.08) {
    isPlayerMoving = true;
    const targetAngle = joystickState.angle;
    let diff = targetAngle - playerState.angle;
    
    diff = normAngle(diff);

    const turnSpeed = 3.2 * dt;
    playerState.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);

    const currentSpeed = moveSpeed * joystickState.magnitude * tailwindBonus * snareMultiplier;
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

  // Subsurface Leviathan Shadow update
  if (distFromStart >= 3200 && battleIntensityLevel === 0) {
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

  // Biome & Blood Sea roar ambient & First Encounter Ambush
  const biome = getBiomeInfo(distFromStart);
  if (biome.bloodRatio > 0.05 || biome.isBloodSea) {
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
          tw.slamCooldown = 2.6 * (diffCfg.enemyReloadMultiplier || 1.0);
          sound.playMonsterAttack(tw.slamTargetX, tw.slamTargetY);

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

    // 1. Check hit against Occult Towers & Spiked Sea Mines (Checked BEFORE island terrain clipping)
    let hitObstacle = false;
    if (p.isPlayer) {
      // Check hit against Active Island Defenses
      for (let t = entities.towers.length - 1; t >= 0; t--) {
        const tw = entities.towers[t];
        // Friendly fire check: Player cannot attack Haven's friendly peacekeepers
        if (tw.clan === 'neutral' || tw.defenseType === 'haven_bastion') continue;

        const hitRadius = tw.radius + 32;
        if (((p.x - tw.x) * (p.x - tw.x) + (p.y - tw.y) * (p.y - tw.y) < hitRadius * hitRadius)) {
          tw.hp -= p.damage;
          p.life = 0;

          let hitColor = '#22d3ee';
          if (tw.defenseType === 'tentacle') {
            hitColor = '#f43f5e';
            sound.playMonsterHit(tw.x, tw.y);
          } else if (tw.defenseType === 'steam_harpoon') {
            hitColor = '#94a3b8';
            sound.playIronHit(tw.x, tw.y);
          } else if (tw.defenseType === 'cannon_bastion') {
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
            const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { rewardMultiplier: 1.0 };
            const rMult = diffCfg.rewardMultiplier || 1.0;

            if (tw.defenseType === 'tentacle') {
              sound.playMonsterRoar(tw.x, tw.y);
              screenShake = 14;
              const gRew = Math.round(25 * rMult);
              const bRew = Math.round(5 * rMult);
              playerState.gold += gRew;
              playerState.bloodEssence += bRew;
              showToast(`Tentakel Abisal Ditumbangkan! +${gRew} Koin +${bRew} Darah`, "skull");
              for (let b = 0; b < 24; b++) {
                const bang = (b / 24) * Math.PI * 2;
                entities.particles.push({
                  x: tw.x,
                  y: tw.y,
                  vx: Math.cos(bang) * (2.5 + Math.random() * 4),
                  vy: Math.sin(bang) * (2.5 + Math.random() * 4),
                  life: 0.8,
                  color: '#e11d48',
                  size: 5 + Math.random() * 4
                });
              }
            } else if (tw.defenseType === 'cannon_bastion') {
              sound.playCannon(tw.x, tw.y);
              screenShake = 11;
              const gRew = Math.round(45 * rMult);
              playerState.gold += gRew;
              showToast(`Benteng Meriam Pesisir Diratakan! +${gRew} Koin`, "gold");
              for (let b = 0; b < 24; b++) {
                const bang = (b / 24) * Math.PI * 2;
                entities.particles.push({
                  x: tw.x,
                  y: tw.y,
                  vx: Math.cos(bang) * (3 + Math.random() * 3),
                  vy: Math.sin(bang) * (3 + Math.random() * 3),
                  life: 0.75,
                  color: b % 2 === 0 ? '#f59e0b' : '#78716c',
                  size: 4 + Math.random() * 3
                });
              }
            } else if (tw.defenseType === 'steam_harpoon') {
              sound.playExplosion(tw.x, tw.y);
              screenShake = 12;
              const gRew = Math.round(35 * rMult);
              playerState.gold += gRew;
              showToast(`Menara Harpoon Uap Baja Meledak! +${gRew} Koin`, "iron");
              for (let b = 0; b < 24; b++) {
                const bang = (b / 24) * Math.PI * 2;
                entities.particles.push({
                  x: tw.x,
                  y: tw.y,
                  vx: Math.cos(bang) * (3 + Math.random() * 4),
                  vy: Math.sin(bang) * (3 + Math.random() * 4),
                  life: 0.8,
                  color: b % 2 === 0 ? '#94a3b8' : '#f59e0b',
                  size: 4 + Math.random() * 3
                });
              }
            } else {
              sound.playEerieRoar();
              screenShake = 12;
              const gRew = Math.round(70 * rMult);
              const bRew = Math.round(15 * rMult);
              playerState.gold += gRew;
              playerState.bloodEssence += bRew;
              showToast(`Menara Okultis Diruntuhkan! +${gRew} Koin +${bRew} Darah`, "scroll");
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
            }
            entities.towers.splice(t, 1);
          }
          hitObstacle = true;
          break;
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
            color: p.type === 'blood_bile' ? '#e11d48' : (p.type === 'iron_harpoon' ? '#94a3b8' : '#78350f'),
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
          const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { enemyReloadMultiplier: 1.0 };
          e.specialCooldown = (2.8 + Math.random() * 1.5) * (diffCfg.enemyReloadMultiplier || 1.0);
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
      s.isCarrion = sDistFromCenter >= 5500 || isNearSkull;

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
