/* ==========================================================================
   LAUT DARAH - PHYSICS, AI & SIMULATION ENGINE
   Procedural Coastline Raycasting, Search & Hide Stealth AI, Spiked Mines, & Occult Towers
   ========================================================================== */

// Line of Sight: Checks if any island obstructs view between two coordinates using organic radius
function hasLineOfSight(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;

  const steps = Math.ceil(dist / 35);
  for (let s = 1; s < steps; s++) {
    const tx = x1 + (dx / steps) * s;
    const ty = y1 + (dy / steps) * s;
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      const isl = WORLD_ISLANDS[i];
      const ang = Math.atan2(ty - isl.y, tx - isl.x);
      const rAtAng = getIslandRadiusAt(isl, ang);
      if (Math.hypot(tx - isl.x, ty - isl.y) < rAtAng - 16) {
        return false; // Obstructed by organic island contour
      }
    }
  }
  return true;
}

function spawnWorldEntities() {
  const playerDist = Math.hypot(playerState.x, playerState.y);
  const biome = getBiomeInfo(playerDist);

  const maxDist = 2400;
  entities.enemies = entities.enemies.filter(e => Math.hypot(e.x - playerState.x, e.y - playerState.y) < maxDist);
  entities.sunkenShips = entities.sunkenShips.filter(s => Math.hypot(s.x - playerState.x, s.y - playerState.y) < maxDist);
  entities.floatingLoots = entities.floatingLoots.filter(l => Math.hypot(l.x - playerState.x, l.y - playerState.y) < maxDist);
  entities.mines = entities.mines.filter(m => Math.hypot(m.x - playerState.x, m.y - playerState.y) < maxDist);

  // Maintain docked clan guards / patrol fleets
  WORLD_ISLANDS.forEach(isl => {
    const distToPlayer = Math.hypot(isl.x - playerState.x, isl.y - playerState.y);
    if (distToPlayer < 1800 && isl.clan !== 'neutral') {
      const islandGuards = entities.enemies.filter(e => e.homeIslandId === isl.id);
      if (islandGuards.length < 3) {
        const spawnAngle = isl.dockAngle + (Math.random() - 0.5) * 0.9;
        const rAtAng = getIslandRadiusAt(isl, spawnAngle);
        const spawnDist = rAtAng + 45 + Math.random() * 55;
        const ex = isl.x + Math.cos(spawnAngle) * spawnDist;
        const ey = isl.y + Math.sin(spawnAngle) * spawnDist;

        const clanData = CLAN_LORE[isl.clan];
        const tierIndex = Math.min(2, Math.floor(isl.radius / 150) - 1);
        const tierData = clanData.tiers[Math.max(0, tierIndex)];

        entities.enemies.push({
          id: Math.random(),
          homeIslandId: isl.id,
          x: ex,
          y: ey,
          prevX: ex,
          prevY: ey,
          angle: spawnAngle + Math.PI / 2,
          clan: isl.clan,
          tier: tierData.level,
          name: tierData.name,
          isMonster: isl.clan === 'blood',
          hp: tierData.hp,
          maxHp: tierData.hp,
          speed: tierData.speed,
          baseSpeed: tierData.speed,
          damage: tierData.damage,
          radius: tierData.radius,
          shootCooldown: 1.5 + Math.random() * 1.5,
          specialCooldown: 3.5 + Math.random() * 3.0,
          chargeState: 'idle',
          chargeTimer: 0,
          disengageTimer: 0,
          tailgateTimer: 0,
          orbitDir: Math.random() > 0.5 ? 1 : -1,
          preferredDist: isl.clan === 'blood' ? 120 : (isl.clan === 'iron' ? 140 : 200),
          turnRate: isl.clan === 'blood' ? 3.6 : 2.2,
          patrolAngle: spawnAngle,
          detectionMeter: 0,
          alertState: 'unaware', // 'unaware', 'suspicious', 'alerted', 'searching'
          searchTimer: 0,
          lastKnownPos: null,
          targetEntity: null,
          bulletColor: '#475569'
        });
      }
    }
  });

  // Roaming fleets cap at 10 ships nearby
  if (entities.enemies.length < 10) {
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = 700 + Math.random() * 550;
    const ex = playerState.x + Math.cos(spawnAngle) * spawnDist;
    const ey = playerState.y + Math.sin(spawnAngle) * spawnDist;

    let insideIsland = false;
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      const isl = WORLD_ISLANDS[i];
      const ang = Math.atan2(ey - isl.y, ex - isl.x);
      if (Math.hypot(ex - isl.x, ey - isl.y) < getIslandRadiusAt(isl, ang) + 50) {
        insideIsland = true;
        break;
      }
    }

    if (!insideIsland) {
      const distFromCenter = Math.hypot(ex, ey);
      // Safe Zone: No enemy ships patrol inside Home Harbor waters (within 750px of center)
      if (distFromCenter < 750) return;

      let chosenClanKey = 'gold';
      let tierIndex = 0;

      if (distFromCenter < 1500) {
        chosenClanKey = Math.random() < 0.6 ? 'gold' : 'iron';
        tierIndex = Math.random() < 0.85 ? 0 : 1;
      } else if (distFromCenter < 3800) {
        const roll = Math.random();
        chosenClanKey = roll < 0.4 ? 'iron' : (roll < 0.75 ? 'gold' : 'mist');
        tierIndex = Math.random() < 0.6 ? 1 : 0;
      } else if (distFromCenter < 6800) {
        chosenClanKey = Math.random() < 0.65 ? 'mist' : 'iron';
        tierIndex = Math.random() < 0.45 ? 1 : 2;
      } else {
        chosenClanKey = 'blood';
        const bloodRoll = Math.random();
        tierIndex = bloodRoll < 0.35 ? 0 : (bloodRoll < 0.75 ? 1 : 2);
      }

      const clanData = CLAN_LORE[chosenClanKey];
      const tierData = clanData.tiers[tierIndex];

      entities.enemies.push({
        id: Math.random(),
        homeIslandId: null,
        x: ex,
        y: ey,
        prevX: ex,
        prevY: ey,
        angle: Math.random() * Math.PI * 2,
        clan: chosenClanKey,
        tier: tierData.level,
        name: tierData.name,
        isMonster: chosenClanKey === 'blood',
        hp: tierData.hp,
        maxHp: tierData.hp,
        speed: tierData.speed,
        baseSpeed: tierData.speed,
        damage: tierData.damage,
        radius: tierData.radius,
        shootCooldown: 1.4 + Math.random() * 1.6,
        specialCooldown: 3.5 + Math.random() * 3.0,
        chargeState: 'idle',
        chargeTimer: 0,
        disengageTimer: 0,
        tailgateTimer: 0,
        orbitDir: Math.random() > 0.5 ? 1 : -1,
        preferredDist: chosenClanKey === 'blood' ? (100 + tierIndex * 30) : (chosenClanKey === 'iron' ? (120 + tierIndex * 20) : (180 + tierIndex * 35)),
        turnRate: chosenClanKey === 'blood' ? 3.6 : 2.2,
        patrolAngle: Math.random() * Math.PI * 2,
        detectionMeter: 0,
        alertState: 'unaware',
        searchTimer: 0,
        lastKnownPos: null,
        targetEntity: null,
        bulletColor: '#475569'
      });
    }
  }

  // Spawn Sunken Ships
  if (entities.sunkenShips.length < 5) {
    const sAngle = Math.random() * Math.PI * 2;
    const sDist = 450 + Math.random() * 700;
    const sx = playerState.x + Math.cos(sAngle) * sDist;
    const sy = playerState.y + Math.sin(sAngle) * sDist;
    const sDistCenter = Math.hypot(sx, sy);

    let onLand = false;
    WORLD_ISLANDS.forEach(isl => {
      const ang = Math.atan2(sy - isl.y, sx - isl.x);
      if (Math.hypot(sx - isl.x, sy - isl.y) < getIslandRadiusAt(isl, ang) + 30) onLand = true;
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
    
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

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
    const ang = Math.atan2(playerState.y - isl.y, playerState.x - isl.x);
    const rAtAng = getIslandRadiusAt(isl, ang);
    const d = Math.hypot(playerState.x - isl.x, playerState.y - isl.y);
    const minDist = rAtAng + 15;
    if (d < minDist && d > 0.001) {
      playerState.x = isl.x + Math.cos(ang) * minDist;
      playerState.y = isl.y + Math.sin(ang) * minDist;
    }
  });

  // Max Distance Record
  const distFromStart = Math.floor(Math.hypot(playerState.x, playerState.y));
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
      const d = Math.hypot(e.x - playerState.x, e.y - playerState.y);
      if (d > 260) return false;
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
      const d = Math.hypot(e.x - playerState.x, e.y - playerState.y);
      if (d > 220) return false;
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
      if (Math.hypot(e.x - mine.x, e.y - mine.y) < e.radius + mine.radius) {
        e.hp -= mine.damage;
        sound.playCannon(mine.x, mine.y);
        sound.playHit(mine.x, mine.y);
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
    const distToPlayer = Math.hypot(playerState.x - sm.x, playerState.y - sm.y);
    if (distToPlayer < 55) {
      sm.detonating = true;
    }

    // Check proximity to Enemies
    for (let j = 0; j < entities.enemies.length; j++) {
      const e = entities.enemies[j];
      if (Math.hypot(e.x - sm.x, e.y - sm.y) < e.radius + 25) {
        sm.detonating = true;
        break;
      }
    }

    if (sm.detonating) {
      sm.detonateTimer -= dt;
      sm.flashTimer += dt * 16;
      if (sm.detonateTimer <= 0) {
        // DETONATE!
        sound.playCannon(sm.x, sm.y);
        sound.playHit(sm.x, sm.y);
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
          const de = Math.hypot(e.x - sm.x, e.y - sm.y);
          if (de < 110) {
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
      const distToPlayer = Math.hypot(playerState.x - tw.x, playerState.y - tw.y);
      let target = null;
      if (distToPlayer < 440 && hasLineOfSight(tw.x, tw.y, playerState.x, playerState.y)) {
        target = playerState;
      } else {
        // Target rival ships
        const rival = entities.enemies.find(e => e.clan !== 'mist' && Math.hypot(e.x - tw.x, e.y - tw.y) < 440);
        if (rival) target = rival;
      }

      if (target) {
        tw.shootCooldown = 3.2;
        sound.playGhostWisp();
        const fireAngle = Math.atan2(target.y - tw.y, target.x - tw.x);
        entities.projectiles.push({
          type: 'spirit',
          sourceClan: 'mist',
          x: tw.x,
          y: tw.y - 15,
          vx: Math.cos(fireAngle) * 3.6,
          vy: Math.sin(fireAngle) * 3.6,
          angle: fireAngle,
          speed: 4.2,
          turnRate: 1.6,
          radius: 7,
          damage: 26,
          isPlayer: false,
          life: 3.5,
          clan: 'mist'
        });
      }
    }
  });

  // Projectiles simulation with splash, splinters & hit tests against towers/mines
  for (let i = entities.projectiles.length - 1; i >= 0; i--) {
    const p = entities.projectiles[i];

    if (p.type === 'spirit') {
      const targetX = p.target ? p.target.x : playerState.x;
      const targetY = p.target ? p.target.y : playerState.y;
      const targetAngle = Math.atan2(targetY - p.y, targetX - p.x);
      let diff = targetAngle - p.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      p.angle += Math.sign(diff) * Math.min(Math.abs(diff), p.turnRate * dt);
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;

    // Collision with Organic Islands
    let hitIsland = false;
    for (let k = 0; k < WORLD_ISLANDS.length; k++) {
      const isl = WORLD_ISLANDS[k];
      const ang = Math.atan2(p.y - isl.y, p.x - isl.x);
      if (Math.hypot(p.x - isl.x, p.y - isl.y) < getIslandRadiusAt(isl, ang) - 10) {
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
        if (Math.hypot(p.x - sm.x, p.y - sm.y) < sm.radius + 8) {
          sm.detonating = true;
          sm.detonateTimer = 0.05; // Detonate immediately!
          p.life = 0;
          break;
        }
      }

      // Check hit against Occult Towers
      for (let t = entities.towers.length - 1; t >= 0; t--) {
        const tw = entities.towers[t];
        if (Math.hypot(p.x - tw.x, p.y - tw.y) < tw.radius + 10) {
          tw.hp -= p.damage;
          p.life = 0;
          sound.playHit(tw.x, tw.y);
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
        if (Math.hypot(p.x - e.x, p.y - e.y) < e.radius) {
          e.hp -= p.damage;
          p.life = 0;
          sound.playHit(e.x, e.y);
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
          e.lastKnownPos = { x: playerState.x, y: playerState.y };
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
            sound.playLoot();

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
      if (Math.hypot(p.x - playerState.x, p.y - playerState.y) < 22) {
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
          if (rival.clan !== p.sourceClan && Math.hypot(p.x - rival.x, p.y - rival.y) < rival.radius) {
            rival.hp -= p.damage;
            p.life = 0;
            sound.playHit(rival.x, rival.y);
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
      const dist = Math.hypot(dx, dy);
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
      const ang = Math.atan2(e.y - isl.y, e.x - isl.x);
      const rAtAng = getIslandRadiusAt(isl, ang);
      const d = Math.hypot(e.x - isl.x, e.y - isl.y);
      const minDist = rAtAng + e.radius + 8;
      if (d < minDist && d > 0.001) {
        e.x = isl.x + Math.cos(ang) * minDist;
        e.y = isl.y + Math.sin(ang) * minDist;
      }
    });

    // Calculate actual movement displacement since previous frame!
    const distMoved = Math.hypot(e.x - (e.prevX ?? e.x), e.y - (e.prevY ?? e.y));
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

    const distToPlayer = Math.hypot(playerState.x - e.x, playerState.y - e.y);
    const targetAngle = Math.atan2(playerState.y - e.y, playerState.x - e.x);
    const canSeePlayerLine = hasLineOfSight(e.x, e.y, playerState.x, playerState.y);

    // STATE 1: UNAWARE (Posisi sedang tidak notice -> bentuk segitiga di hadapannya seperti biasa)
    if (e.alertState === 'unaware' || e.alertState === 'suspicious') {
      let headingDiff = Math.abs(targetAngle - e.angle);
      while (headingDiff > Math.PI) headingDiff = Math.abs(headingDiff - Math.PI * 2);

      const visionConeDist = (e.isMonster ? 300 : 260) * (isPlayerMovingFast ? 1.15 : 0.85) * stealthMult;
      const inTriangleVisionCone = (headingDiff <= 0.65 && distToPlayer <= visionConeDist) || distToPlayer < 55;

      if (inTriangleVisionCone && canSeePlayerLine) {
        // Player entered forward triangle vision cone -> NOTICE & switch to Full Circle Besar!
        e.alertState = 'alerted';
        e.targetEntity = playerState;
        e.lastKnownPos = { x: playerState.x, y: playerState.y };
        e.detectionMeter = 100;
        sound.playAlertHorn();
        showToast(`${e.name} Melihatmu & Mulai Mengejar!`, "alert");
      } else {
        e.detectionMeter = Math.max(0, e.detectionMeter - 30 * dt);
      }

    // STATE 2: ALERTED (Ketika notice -> bentuk berubah menjadi full circle besar untuk lari)
    } else if (e.alertState === 'alerted') {
      const alertEscapeRadius = (e.isMonster ? 520 : 460) * stealthMult;
      const insideEscapeCircle = distToPlayer <= alertEscapeRadius;

      // Bentuk akan terintersepsi jika ada pulau untuk sembunyi, atau lari keluar circle besar
      if (insideEscapeCircle && canSeePlayerLine) {
        // Still actively tracking player inside large circle without island obstruction
        e.lastKnownPos = { x: playerState.x, y: playerState.y };
        e.detectionMeter = 100;
      } else {
        // Sembunyi di balik pulau ATAU lari keluar dari full circle besar -> beralih ke posisi mencari!
        e.alertState = 'searching';
        e.searchTimer = 4.5;
        e.detectionMeter = 100;
      }

    // STATE 3: SEARCHING (Saat mencari -> bentuk circle namun kecil)
    } else if (e.alertState === 'searching') {
      const searchRadius = 150; // Circle kecil saat mencari
      e.searchTimer -= dt;
      e.detectionMeter = Math.max(0, (e.searchTimer / 4.5) * 100);

      // Jika pemain tertangkap di dalam circle kecil dan tidak tertutup pulau -> notice lagi!
      if (distToPlayer <= searchRadius && canSeePlayerLine) {
        e.alertState = 'alerted';
        e.targetEntity = playerState;
        e.lastKnownPos = { x: playerState.x, y: playerState.y };
        e.detectionMeter = 100;
        sound.playAlertHorn();
        showToast(`${e.name} Menemukanmu Kembali!`, "alert");
      } else if (e.searchTimer <= 0) {
        // Jika sudah tidak dapat -> barulah kembali ke posisi tidak notice (segitiga biasa)
        e.alertState = 'unaware';
        e.detectionMeter = 0;
        e.targetEntity = null;
        e.lastKnownPos = null;
        showToast(`${e.name} Kehilangan Jejak dan Kembali Berpatroli.`, "info");
      }
    }

    highestDetectionLevel = Math.max(highestDetectionLevel, e.detectionMeter / 100);

    // Active Target Selection
    let target = null;
    if (e.alertState === 'alerted') {
      target = e.targetEntity || playerState;
    } else if (e.alertState === 'searching') {
      // Sail towards the last known position to investigate
      target = e.lastKnownPos ? { x: e.lastKnownPos.x, y: e.lastKnownPos.y, angle: 0, radius: 10 } : null;
    }

    if (target) {
      const targetDist = Math.hypot(target.x - e.x, target.y - e.y);
      const targetAngle = Math.atan2(target.y - e.y, target.x - e.x);

      // Physical Ramming collision (Only when alerted and attacking, not searching empty ocean)
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
            sound.playRamHit();
            addFloatingText(`TERJANG! -${ramDmg}`, target.x, target.y, '#f87171', true);

            e.x += pushX * 55;
            e.y += pushY * 55;
            e.disengageTimer = 1.6;
            e.orbitDir = Math.random() > 0.5 ? 1 : -1;

            if (e.chargeState === 'charging') {
              e.chargeState = 'idle';
              e.chargeTimer = 0;
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
        let flankDiff = flankAngle - e.angle;
        while (flankDiff < -Math.PI) flankDiff += Math.PI * 2;
        while (flankDiff > Math.PI) flankDiff -= Math.PI * 2;
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
          if (!isSearching && e.specialCooldown <= 0 && targetDist < 240 && facingDiff < 0.6) {
            e.chargeState = 'windup';
            e.chargeTimer = 0.55;
            sound.playSteamHiss();
          }
        } else if (e.chargeState === 'windup') {
          e.chargeTimer -= dt;
          // Steam venting from twin boiler pipes during windup
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

          // 1. Violent glowing ram prow sparks
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

          // 2. Heavy twin boiler exhaust: black coal soot & glowing embers
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

          // 3. Dense frothing charge wake
          if (Math.random() < 0.85) {
            entities.seaRipples.push({
              x: aftX,
              y: aftY,
              radius: 8,
              maxRadius: 32,
              alpha: 0.7,
              decay: 1.3,
              color: 'rgba(255, 255, 255, '
            });
          }

          // 4. Violent bow wave foaming spray on port & starboard
          [-1, 1].forEach(side => {
            const sideAng = e.angle + (Math.PI / 2) * side;
            entities.particles.push({
              x: e.x + Math.cos(sideAng) * (e.radius * 0.8),
              y: e.y + Math.sin(sideAng) * (e.radius * 0.8),
              vx: Math.cos(sideAng) * 2.5 + Math.cos(e.angle) * 1.2,
              vy: Math.sin(sideAng) * 2.5 + Math.sin(e.angle) * 1.2,
              life: 0.3,
              maxLife: 0.3,
              color: 'rgba(255, 255, 255, 0.8)',
              size: 3 + Math.random() * 3
            });
          });

          // 5. Screen rumble when charging near player
          if (targetDist < 350) {
            screenShake = Math.max(screenShake, 5);
          }

          if (e.chargeTimer <= 0 || targetDist > 380) {
            e.chargeState = 'idle';
            e.specialCooldown = 4.5 + Math.random() * 2.5;
          }
        }

        if (e.chargeState !== 'charging') {
          let targetCourseAngle = (targetDist > e.preferredDist + 40 || isSearching) ? targetAngle : (targetAngle + (Math.PI / 2) * e.orbitDir);
          let angleDiff = targetCourseAngle - e.angle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
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
        let targetCourseAngle = (!isSearching && targetDist < e.preferredDist - 40) ? (targetAngle + Math.PI) : (targetAngle + (Math.PI / 2) * e.orbitDir);
        if (isSearching) targetCourseAngle = targetAngle;

        let angleDiff = targetCourseAngle - e.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
        e.x += Math.cos(e.angle) * cruiseSpeed;
        e.y += Math.sin(e.angle) * cruiseSpeed;

        if (!isSearching) {
          e.specialCooldown -= dt;
          if (e.specialCooldown <= 0 && targetDist < 380) {
            e.specialCooldown = 3.2 + Math.random() * 2.0;
            fireSpiritWisps(e);
          }
        }
      } else if (e.clan === 'blood') {
        e.specialCooldown -= dt;
        let angleDiff = targetAngle - e.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
        const surge = (!isSearching && targetDist < 140) ? 1.6 : 1.0;
        e.x += Math.cos(e.angle) * (cruiseSpeed * surge);
        e.y += Math.sin(e.angle) * (cruiseSpeed * surge);

        if (!isSearching && e.specialCooldown <= 0 && targetDist < 300) {
          e.specialCooldown = 2.8 + Math.random() * 1.5;
          fireChitinSpikes(e, e.tier >= 3);
        }
      } else {
        // Batavia
        let targetCourseAngle = (targetDist > e.preferredDist + 40 || isSearching) ? targetAngle : (targetAngle + (Math.PI / 2) * e.orbitDir);
        let angleDiff = targetCourseAngle - e.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
        e.x += Math.cos(e.angle) * cruiseSpeed;
        e.y += Math.sin(e.angle) * cruiseSpeed;

        if (!isSearching) {
          e.shootCooldown -= dt;
          if (e.shootCooldown <= 0 && targetDist < 320) {
            e.shootCooldown = 2.0 + Math.random() * 1.4;
            fireCannons(e, target, false);
          }
        }
      }
    } else {
      // Passive Patrol Route circling dock
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
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          e.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), e.turnRate * dt);
          e.x += Math.cos(e.angle) * (e.speed * 0.7);
          e.y += Math.sin(e.angle) * (e.speed * 0.7);
        }
      }
    }
  });

  // Salvage Sunken Ships
  const salvageContainer = document.getElementById('salvageContainer');
  const salvageCircle = document.getElementById('salvageCircle');
  let nearWreck = null;

  entities.sunkenShips.forEach(s => {
    const d = Math.hypot(playerState.x - s.x, playerState.y - s.y);
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
    if (Math.hypot(playerState.x - loot.x, playerState.y - loot.y) < 36) {
      if (loot.type === 'repair') {
        playerState.hp = Math.min(currentMaxHp, playerState.hp + 25);
        addFloatingText("+25 HP", playerState.x, playerState.y, '#34d399');
        showToast("Memungut Kayu Apung (+25 Lambung)", "check");
      } else {
        playerState.gold += loot.value;
        addFloatingText(`+${loot.value} Koin`, playerState.x, playerState.y, '#fbbf24');
        showToast(`Peti Terapung: +${loot.value} Koin!`, "gold");
      }
      sound.playSplash();
      entities.floatingLoots.splice(i, 1);
    }
  }

  // Drift Ambient Sea Mist
  entities.ambientMist.forEach(m => {
    m.x += m.vx;
    m.y += m.vy;
    if (Math.hypot(m.x - playerState.x, m.y - playerState.y) > 2600) {
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
      const distToPlayer = Math.hypot(s.x - playerState.x, s.y - playerState.y);
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

  // Dynamic Battle Music (Fade in halus saat pertarungan banyak kapal, fade out halus saat selesai/lari)
  const alertedCombatCount = entities.enemies.filter(e => 
    e.alertState === 'alerted' && Math.hypot(e.x - playerState.x, e.y - playerState.y) < 700
  ).length;
  const isHighThreatNear = entities.enemies.some(e => 
    e.alertState === 'alerted' && (e.tier >= 3 || e.isMonster) && Math.hypot(e.x - playerState.x, e.y - playerState.y) < 800
  );
  const inHeavyBattle = (alertedCombatCount >= 3) || isHighThreatNear;
  sound.updateBattleMusic(inHeavyBattle, dt);

  // Particles, Ripples & Combat Text Lifecycle
  for (let i = entities.particles.length - 1; i >= 0; i--) {
    const p = entities.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;
    if (p.life <= 0) entities.particles.splice(i, 1);
  }

  for (let i = entities.seaRipples.length - 1; i >= 0; i--) {
    const r = entities.seaRipples[i];
    r.radius += dt * 14;
    r.alpha -= dt * 0.45;
    if (r.alpha <= 0) entities.seaRipples.splice(i, 1);
  }

  for (let i = entities.floatingTexts.length - 1; i >= 0; i--) {
    const ft = entities.floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= dt * 0.9;
    if (ft.alpha <= 0) entities.floatingTexts.splice(i, 1);
  }

  if (screenShake > 0) {
    screenShake = Math.max(0, screenShake - dt * 25);
  }

  spawnWorldEntities();
}
