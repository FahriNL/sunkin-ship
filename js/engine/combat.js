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

  sound.playCannon(source.x, source.y);

  let angles = [source.angle - Math.PI / 2, source.angle + Math.PI / 2];

  // If AI has a targeted enemy or rival, aim cannon fire directly towards target
  if (!isPlayer && target) {
    const targetAngle = Math.atan2(target.y - source.y, target.x - source.x);
    angles = [targetAngle];
  } else if (isPlayer && customAimAngle !== null) {
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

  const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { playerDamageDealtMult: 1 };
  let damage = isPlayer ? getStatValue('cannons', playerState.upgrades.cannons) : source.damage;
  if (isPlayer && diffCfg.playerDamageDealtMult) {
    damage *= diffCfg.playerDamageDealtMult;
  }
  const count = isPlayer ? Math.min(4, 1 + Math.floor(playerState.upgrades.cannons / 2)) : Math.max(1, source.tier || 1);

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
        sourceClan: isPlayer ? 'player' : source.clan,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(fireDir) * (isPlayer ? 7.6 : 6.4),
        vy: Math.sin(fireDir) * (isPlayer ? 7.6 : 6.4),
        radius: isPlayer ? 4.8 : 4,
        damage,
        isPlayer,
        life: 1.35
      });
    }
  });
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
    showToast("Ranjau Mesiu Dilepas ke Belakang!", "rearDefense");
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
