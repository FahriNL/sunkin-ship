/* ==========================================================================
   LAUT DARAH - COMBAT & WEAPONS ENGINE
   Broadside Cannons, Stern Chasers, Gunpowder Mines, Occult Wisps, & Chitin Spikes
   ========================================================================== */

function fireCannons(source, target = null, isPlayer = false) {
  const now = Date.now() / 1000;
  const reloadDelay = isPlayer ? Math.max(0.4, 1.3 - (playerState.upgrades.speed - 1) * 0.1) : 2.2;

  if (isPlayer && now - lastFireTime < reloadDelay) return;
  if (isPlayer) lastFireTime = now;

  sound.playCannon(source.x, source.y);

  const angles = [source.angle - Math.PI / 2, source.angle + Math.PI / 2];
  const damage = isPlayer ? getStatValue('cannons', playerState.upgrades.cannons) : source.damage;
  const count = isPlayer ? Math.min(4, 1 + Math.floor(playerState.upgrades.cannons / 2)) : (source.tier || 1);

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
        vx: Math.cos(fireDir) * (isPlayer ? 7.2 : 6.2),
        vy: Math.sin(fireDir) * (isPlayer ? 7.2 : 6.2),
        radius: isPlayer ? 4.5 : 4,
        damage,
        isPlayer,
        life: 1.15
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

function fireSpiritWisps(enemy) {
  sound.playGhostWisp();
  const count = enemy.tier === 3 ? 3 : (enemy.tier === 2 ? 2 : 1);
  
  for (let i = 0; i < count; i++) {
    const spreadAngle = enemy.angle + (i - (count - 1) / 2) * 0.5;
    entities.projectiles.push({
      type: 'spirit',
      sourceClan: enemy.clan,
      x: enemy.x + Math.cos(spreadAngle) * 20,
      y: enemy.y + Math.sin(spreadAngle) * 20,
      vx: Math.cos(spreadAngle) * 3.5,
      vy: Math.sin(spreadAngle) * 3.5,
      angle: spreadAngle,
      speed: 3.8 + enemy.tier * 0.4,
      turnRate: 1.8,
      radius: 6,
      damage: enemy.damage * 0.85,
      isPlayer: false,
      life: 3.2,
      clan: 'mist'
    });
  }
}

function fireChitinSpikes(enemy, isNova = false) {
  sound.playSpikeLaunch();

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
