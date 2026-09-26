/* ==========================================================================
   LAUT DARAH - COMBAT & WEAPONS ENGINE
   Broadside Cannons, Stern Chasers, Gunpowder Mines, Occult Wisps, & Chitin Spikes
   ========================================================================== */

function normAngle(a) {
  a = a % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  else if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function fireCannons(source, target = null, isPlayer = false, customAimAngle = null) {
  const now = Date.now() / 1000;
  const reloadDelay = isPlayer ? Math.max(0.35, 1.3 - (playerState.upgrades.speed - 1) * 0.1) : 2.2;

  if (isPlayer && now - lastFireTime < reloadDelay) return;
  if (isPlayer) lastFireTime = now;

  if (!isPlayer) {
    if (typeof sound !== 'undefined' && typeof sound.playCannonType === 'function') {
      sound.playCannonType(source.clan || 'standard', source.x, source.y);
    } else if (typeof sound !== 'undefined') {
      sound.playCannon(source.x, source.y);
    }
  }

  let angles = [source.angle - Math.PI / 2, source.angle + Math.PI / 2];

  // If AI has a targeted enemy or rival, aim cannon fire directly towards target
  if (!isPlayer && target) {
    const targetAngle = Math.atan2(target.y - source.y, target.x - source.x);
    angles = [targetAngle];
  } else {
    // If player fires manually without auto-target, check if broadside is facing nearby island defenses to allow deliberate attack
    if (isPlayer && customAimAngle === null && typeof entities !== 'undefined' && entities.towers) {
      for (let t = 0; t < entities.towers.length; t++) {
        const tw = entities.towers[t];
        if (tw.clan === 'neutral' || tw.defenseType === 'haven_bastion') continue;
        const dx = tw.x - source.x, dy = tw.y - source.y;
        if (dx * dx + dy * dy > 460 * 460) continue;
        if (typeof hasLineOfSight === 'function' && !hasLineOfSight(source.x, source.y, tw.x, tw.y)) continue;
        const angToTw = Math.atan2(dy, dx);
        let relAng = Math.abs(normAngle(angToTw - source.angle));
        if (relAng > 0.35 && relAng < 2.8) {
          customAimAngle = angToTw;
          if (typeof WORLD_ISLANDS !== 'undefined') {
            const isl = WORLD_ISLANDS.find(i => i.id === tw.islandId);
            if (isl && !isl.isProvoked && typeof triggerIslandProvocation === 'function') {
              triggerIslandProvocation(isl);
            }
          }
          break;
        }
      }
    }

    if (isPlayer && customAimAngle !== null) {
      // Dynamic Gun Carriage Traverse for Player Cannons:
      // Accurately aims the broadside cannons towards targeted enemy ship or island tower
      const portAngle = source.angle - Math.PI / 2;
      const stbdAngle = source.angle + Math.PI / 2;

      const diffPort = Math.abs(normAngle(customAimAngle - portAngle));
      const diffStbd = Math.abs(normAngle(customAimAngle - stbdAngle));

      const chosenSide = (diffPort < diffStbd) ? portAngle : stbdAngle;
      const diffChosen = normAngle(customAimAngle - chosenSide);

      // Dynamic gunport traverse clamped to +/- 32 degrees (0.56 rad)
      const traverse = Math.max(-0.56, Math.min(0.56, diffChosen));
      const aimedAngle = chosenSide + traverse;

      // The engaged broadside fires directly at the target; the opposite side fires perpendicular
      angles = [aimedAngle, (diffPort < diffStbd) ? stbdAngle : portAngle];
    }
  }

  const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { playerDamageDealtMult: 1 };

  if (isPlayer) {
    const activeCannons = (playerState.equippedCannons || []).filter(c => c && c.durability > 0);
    if (activeCannons.length === 0) {
      showToast(typeof t === 'function' ? t('toastCannonsEmptyOrJammed') : "Meriam kapal kosong atau aus! Buka Galangan Kapal [U] / Inventori [I].", "alert");
      if (typeof sound !== 'undefined' && typeof sound.playSplash === 'function') sound.playSplash();
      return;
    }

    // Play distinct weapon sound effect for each unique equipped cannon type!
    const firedTypes = new Set(activeCannons.map(c => c.type || 'standard'));
    firedTypes.forEach(t => {
      if (typeof sound !== 'undefined' && typeof sound.playCannonType === 'function') {
        sound.playCannonType(t, source.x, source.y);
      } else if (typeof sound !== 'undefined') {
        sound.playCannon(source.x, source.y);
      }
    });

    angles.forEach(sideAngle => {
      const muzzleX = source.x + Math.cos(sideAngle) * (source.radius || 20);
      const muzzleY = source.y + Math.sin(sideAngle) * (source.radius || 20);

      activeCannons.forEach((c, idx) => {
        const cConf = (typeof CANNON_TYPES !== 'undefined' && CANNON_TYPES[c.type]) ? CANNON_TYPES[c.type] : {
          damage: 22,
          projectileType: 'cannonball',
          color: '#94a3b8'
        };

        const muzzleColor = cConf.color || '#f59e0b';
        for (let m = 0; m < 3; m++) {
          entities.particles.push({
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(sideAngle) * (2.2 + Math.random() * 3) + (Math.random() - 0.5) * 1.5,
            vy: Math.sin(sideAngle) * (2.2 + Math.random() * 3) + (Math.random() - 0.5) * 1.5,
            life: 0.22,
            color: muzzleColor,
            size: 2.2 + Math.random() * 2.5
          });
        }

        const count = activeCannons.length;
        const spread = (idx - (count - 1) / 2) * 0.14;
        const fireDir = sideAngle + spread;
        const baseDmg = (typeof getCannonDamage === 'function') ? getCannonDamage(c) : (cConf.damage || 22);
        const dmg = baseDmg * (diffCfg.playerDamageDealtMult || 1);

        if (c.type === 'wokou') {
          // Wokou Bamboo Fireworks Rocket (Single powerful rocket per side, total 2 per wokou cannon)
          entities.projectiles.push({
            type: 'rocket_arrow',
            sourceClan: 'player',
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(fireDir) * 8.6,
            vy: Math.sin(fireDir) * 8.6,
            angle: fireDir,
            radius: 5,
            damage: dmg,
            isPlayer: true,
            life: 1.35
          });
        } else if (c.type === 'mist') {
          // Mist Spirit Occult Wisps (Homing towards nearest hostile enemy or tower)
          let mistTarget = null;
          let nearestDistSq = 480 * 480;
          for (let eIdx = 0; eIdx < entities.enemies.length; eIdx++) {
            const en = entities.enemies[eIdx];
            const dSq = (en.x - muzzleX) * (en.x - muzzleX) + (en.y - muzzleY) * (en.y - muzzleY);
            if (dSq < nearestDistSq) {
              nearestDistSq = dSq;
              mistTarget = en;
            }
          }
          entities.projectiles.push({
            type: 'spirit',
            sourceClan: 'player',
            target: mistTarget,
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(fireDir) * 6.8,
            vy: Math.sin(fireDir) * 6.8,
            angle: fireDir,
            speed: 6.8,
            turnRate: 3.5,
            radius: 6,
            damage: dmg,
            isPlayer: true,
            life: 2.5
          });
        } else if (c.type === 'frost') {
          // Viking Norse Frost Throwing Battleaxe (Slows target on hit)
          entities.projectiles.push({
            type: 'frost_axe',
            sourceClan: 'player',
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(fireDir) * 7.8,
            vy: Math.sin(fireDir) * 7.8,
            angle: fireDir,
            spinAngle: Math.random() * Math.PI * 2,
            spinSpeed: 24.0,
            radius: 5,
            damage: dmg,
            isPlayer: true,
            life: 1.45
          });
        } else if (c.type === 'chitin') {
          // Abyssal Bio-Organic Chitin Spike (Corrosive Bleed)
          entities.projectiles.push({
            type: 'spike',
            sourceClan: 'player',
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(fireDir) * 8.2,
            vy: Math.sin(fireDir) * 8.2,
            angle: fireDir,
            radius: 5,
            damage: dmg,
            isPlayer: true,
            life: 1.3
          });
        } else {
          // Standard Heavy Iron Cannonball
          entities.projectiles.push({
            type: 'cannonball',
            sourceClan: 'player',
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(fireDir) * 7.6,
            vy: Math.sin(fireDir) * 7.6,
            radius: 4.8,
            damage: dmg,
            isPlayer: true,
            life: 1.35
          });
        }
      });
    });

    // Durability consumption & shattering sequence
    for (let cIdx = playerState.equippedCannons.length - 1; cIdx >= 0; cIdx--) {
      const c = playerState.equippedCannons[cIdx];
      if (!c || c.durability <= 0) continue;
      c.durability -= 1;

      if (c.durability <= 0) {
        c.durability = 0;
        const cConf = (typeof CANNON_TYPES !== 'undefined' && CANNON_TYPES[c.type]) ? CANNON_TYPES[c.type] : null;
        const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
        const cName = (isEn && cConf?.nameEn) ? cConf.nameEn : (cConf?.name || c.name || (isEn ? 'Cannon' : 'Meriam'));
        if (cConf && cConf.isOrbSpecial) {
          // Special Orb Cannon shatters completely and vanishes forever!
          playerState.equippedCannons.splice(cIdx, 1);
          showToast(typeof t === 'function' ? t('toastCannonBroken', { name: cName }) : `${cName} telah aus dan pecah hancur berkeping-keping!`, "skull");
          addFloatingText(typeof t === 'function' ? t('cannonBrokenFloat') : "MERIAM PECAH!", playerState.x, playerState.y - 25, '#ef4444', true);
          if (typeof sound !== 'undefined' && typeof sound.playHit === 'function') sound.playHit(playerState.x, playerState.y);
        } else {
          // Standard Cannon is jammed/worn out - needs port workshop refurbish
          showToast(typeof t === 'function' ? t('toastCannonJammed', { name: cName }) : `${cName} aus dan macet! Perlu perbaikan di pelabuhan.`, "alert");
          addFloatingText(typeof t === 'function' ? t('cannonJammedFloat') : "MERIAM MACET!", playerState.x, playerState.y - 25, '#f59e0b', true);
        }
      }
    }
  } else {
    // Enemy AI cannon firing
    const damage = source.damage || 14;
    const count = Math.max(1, source.tier || 1);

    angles.forEach(sideAngle => {
      const muzzleX = source.x + Math.cos(sideAngle) * (source.radius || 20);
      const muzzleY = source.y + Math.sin(sideAngle) * (source.radius || 20);

      for (let m = 0; m < 4; m++) {
        entities.particles.push({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(sideAngle) * (2.5 + Math.random() * 3) + (Math.random() - 0.5) * 1.5,
          vy: Math.sin(sideAngle) * (2.5 + Math.random() * 3) + (Math.random() - 0.5) * 1.5,
          life: 0.22,
          color: '#f59e0b',
          size: 2.5 + Math.random() * 3
        });
      }

      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) / 2) * 0.12;
        const fireDir = sideAngle + spread;
        entities.projectiles.push({
          type: 'cannonball',
          sourceClan: source.clan,
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(fireDir) * 6.4,
          vy: Math.sin(fireDir) * 6.4,
          radius: 4,
          damage,
          isPlayer: false,
          life: 1.35
        });
      }
    });
  }
}

function triggerPlayerRearDefense() {
  const now = Date.now() / 1000;
  const rearLvl = playerState.upgrades.rearDefense;
  if (rearLvl <= 0 || now - lastRearDefenseTime < 1.6) return;

  lastRearDefenseTime = now;
  const rearAngle = playerState.angle + Math.PI;
  const sternX = playerState.x - Math.cos(playerState.angle) * 24;
  const sternY = playerState.y - Math.sin(playerState.angle) * 24;
  sound.playCannon(sternX, sternY);
  const rearDmg = getStatValue('rearDefense', rearLvl);

  // Twin stern chaser cannonballs
  [-0.15, 0.15].forEach(spread => {
    const fireDir = rearAngle + spread;
    entities.projectiles.push({
      type: 'cannonball',
      sourceClan: 'player',
      x: sternX,
      y: sternY,
      vx: Math.cos(fireDir) * 8.0,
      vy: Math.sin(fireDir) * 8.0,
      radius: 5,
      damage: rearDmg,
      isPlayer: true,
      life: 1.1
    });
  });

  // At level 3+, drop a floating gunpowder mine behind
  if (rearLvl >= 3) {
    sound.playMineDrop();
    entities.mines.push({
      x: sternX - Math.cos(playerState.angle) * 14,
      y: sternY - Math.sin(playerState.angle) * 14,
      damage: rearDmg * 1.5,
      radius: 12,
      life: 8.0
    });
    showToast(typeof t === 'function' ? t('toastMineDeployed') : "Ranjau Mesiu Dilepas ke Belakang!", "rearDefense");
  }
}

function fireSpiritWisps(enemy, target = null) {
  sound.playMistCast(enemy.x, enemy.y);
  const tgt = target || enemy.targetEntity || playerState;
  const count = enemy.tier === 3 ? 3 : (enemy.tier === 2 ? 2 : 1);
  
  // Predictive lead targeting (Kalkulasi posisi masa depan target)
  let targetVx = 0;
  let targetVy = 0;
  if (tgt === playerState) {
    targetVx = Math.cos(playerState.angle) * (playerState.speed || 0);
    targetVy = Math.sin(playerState.angle) * (playerState.speed || 0);
  } else if (tgt) {
    targetVx = Math.cos(tgt.angle || 0) * (tgt.speed || 1.4);
    targetVy = Math.sin(tgt.angle || 0) * (tgt.speed || 1.4);
  }

  const distToTgt = Math.hypot((tgt.x || enemy.x) - enemy.x, (tgt.y || enemy.y) - enemy.y);
  const projSpeed = 4.8 + enemy.tier * 0.4;
  const travelTime = Math.min(1.4, distToTgt / projSpeed);

  // Titik intersepsi prediktif
  const predX = (tgt.x || enemy.x) + targetVx * travelTime * 0.85;
  const predY = (tgt.y || enemy.y) + targetVy * travelTime * 0.85;
  const baseAngle = Math.atan2(predY - enemy.y, predX - enemy.x);
  
  for (let i = 0; i < count; i++) {
    const spreadAngle = baseAngle + (i - (count - 1) / 2) * 0.26;
    entities.projectiles.push({
      type: 'spirit',
      sourceClan: enemy.clan,
      target: tgt,
      x: enemy.x + Math.cos(spreadAngle) * 20,
      y: enemy.y + Math.sin(spreadAngle) * 20,
      vx: Math.cos(spreadAngle) * projSpeed,
      vy: Math.sin(spreadAngle) * projSpeed,
      angle: spreadAngle,
      speed: projSpeed,
      turnRate: 3.6,
      radius: 6.5,
      damage: enemy.damage * 0.95,
      isPlayer: false,
      life: 3.6,
      clan: 'mist'
    });
  }
}

function fireChitinSpikes(enemy, isNova = false) {
  sound.playMonsterAttack(enemy.x, enemy.y);

  if (isNova) {
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      entities.projectiles.push({
        type: 'spike',
        sourceClan: enemy.clan,
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(ang) * 6.5,
        vy: Math.sin(ang) * 6.5,
        angle: ang,
        radius: 5,
        damage: enemy.damage * 1.1,
        isPlayer: false,
        life: 1.6
      });
    }
  } else {
    const targetX = enemy.targetEntity ? enemy.targetEntity.x : playerState.x;
    const targetY = enemy.targetEntity ? enemy.targetEntity.y : playerState.y;
    const baseAngle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
    const count = enemy.tier >= 2 ? 3 : 1;

    for (let i = 0; i < count; i++) {
      const ang = baseAngle + (i - (count - 1) / 2) * 0.22;
      entities.projectiles.push({
        type: 'spike',
        sourceClan: enemy.clan,
        x: enemy.x + Math.cos(ang) * (enemy.radius + 6),
        y: enemy.y + Math.sin(ang) * (enemy.radius + 6),
        vx: Math.cos(ang) * 7.8,
        vy: Math.sin(ang) * 7.8,
        angle: ang,
        radius: 4.5,
        damage: enemy.damage,
        isPlayer: false,
        life: 1.25
      });
    }
  }
}

function fireFrostAxes(enemy, target = null) {
  if (sound && sound.playFrostThrow) sound.playFrostThrow(enemy.x, enemy.y);
  const tgt = target || enemy.targetEntity || playerState;
  const count = enemy.tier === 3 ? 3 : (enemy.tier === 2 ? 2 : 1);
  const targetX = tgt.x || enemy.x;
  const targetY = tgt.y || enemy.y;
  const baseAngle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
  const projSpeed = 7.4 + enemy.tier * 0.4;

  for (let i = 0; i < count; i++) {
    const ang = baseAngle + (i - (count - 1) / 2) * 0.22;
    entities.projectiles.push({
      type: 'frost_axe',
      sourceClan: 'viking',
      x: enemy.x + Math.cos(ang) * (enemy.radius + 6),
      y: enemy.y + Math.sin(ang) * (enemy.radius + 6),
      vx: Math.cos(ang) * projSpeed,
      vy: Math.sin(ang) * projSpeed,
      angle: ang,
      spinAngle: Math.random() * Math.PI * 2,
      spinSpeed: 24.0,
      radius: 4.5,
      damage: enemy.damage * 1.05,
      isPlayer: false,
      life: 1.6,
      clan: 'viking'
    });
  }
}

function fireFrostBallista(tower, target = null) {
  const tgt = target || playerState;
  const targetX = tgt.x || playerState.x;
  const targetY = tgt.y || playerState.y;
  const baseAngle = Math.atan2(targetY - tower.y, targetX - tower.x);
  const projSpeed = 8.6;

  if (sound && sound.playCannon) sound.playCannon(tower.x, tower.y);
  entities.projectiles.push({
    type: 'frost_axe',
    sourceClan: 'viking',
    x: tower.x + Math.cos(baseAngle) * (tower.radius + 10),
    y: tower.y + Math.sin(baseAngle) * (tower.radius + 10),
    vx: Math.cos(baseAngle) * projSpeed,
    vy: Math.sin(baseAngle) * projSpeed,
    angle: baseAngle,
    spinAngle: 0,
    spinSpeed: 26.0,
    radius: 5,
    damage: tower.damage,
    isPlayer: false,
    life: 1.8,
    clan: 'viking'
  });
}

function fireRocketVolley(enemy, target = null) {
  if (sound && sound.playRocketBarrage) sound.playRocketBarrage(enemy.x, enemy.y);
  const tgt = target || enemy.targetEntity || playerState;
  const count = enemy.tier === 3 ? 4 : (enemy.tier === 2 ? 3 : 2);
  const targetX = tgt.x || enemy.x;
  const targetY = tgt.y || enemy.y;
  const baseAngle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
  const projSpeed = 8.5;

  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * 0.35;
    const ang = baseAngle + spread;
    entities.projectiles.push({
      type: 'rocket_arrow',
      sourceClan: 'wokou',
      x: enemy.x + Math.cos(ang) * (enemy.radius + 6),
      y: enemy.y + Math.sin(ang) * (enemy.radius + 6),
      vx: Math.cos(ang) * projSpeed,
      vy: Math.sin(ang) * projSpeed,
      angle: ang,
      radius: 5,
      damage: enemy.damage * 0.85,
      isPlayer: false,
      life: 1.4,
      clan: 'wokou'
    });
  }
}

function spitKrakenInk(enemy, target = null) {
  if (sound && sound.playInkSpit) sound.playInkSpit(enemy.x, enemy.y);
  const tgt = target || enemy.targetEntity || playerState;
  const targetX = tgt.x || enemy.x;
  const targetY = tgt.y || enemy.y;
  const angleToTarget = Math.atan2(targetY - enemy.y, targetX - enemy.x);
  const dist = Math.min(220, Math.hypot(targetX - enemy.x, targetY - enemy.y));

  // Spawn expanding ink cloud entity on the water surface
  const cloudX = enemy.x + Math.cos(angleToTarget) * (dist * 0.65);
  const cloudY = enemy.y + Math.sin(angleToTarget) * (dist * 0.65);

  if (!entities.inkClouds) entities.inkClouds = [];
  entities.inkClouds.push({
    id: Math.random(),
    x: cloudX,
    y: cloudY,
    radius: 95,
    life: 5.5,
    maxLife: 5.5,
    seed: Math.random() * Math.PI * 2
  });

  // Also push small ink droplets
  for (let p = 0; p < 8; p++) {
    const sAng = angleToTarget + (Math.random() - 0.5) * 0.6;
    const sSpd = 3.5 + Math.random() * 4;
    entities.projectiles.push({
      type: 'blood_bile',
      sourceClan: 'blood',
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(sAng) * sSpd,
      vy: Math.sin(sAng) * sSpd,
      radius: 6,
      damage: enemy.damage * 0.5,
      isPlayer: false,
      life: 1.2
    });
  }
}

function summonLeviathanWhirlpool(enemy, target = null) {
  if (sound && sound.playWhirlpool) sound.playWhirlpool(enemy.x, enemy.y);
  const tgt = target || enemy.targetEntity || playerState;
  const targetX = tgt.x || enemy.x;
  const targetY = tgt.y || enemy.y;

  if (!entities.whirlpools) entities.whirlpools = [];
  entities.whirlpools.push({
    id: Math.random(),
    x: targetX,
    y: targetY,
    radius: 130,
    pullStrength: 1.4,
    life: 6.5,
    maxLife: 6.5,
    enemySourceId: enemy.id
  });
}
