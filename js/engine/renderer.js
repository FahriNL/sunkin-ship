/* ==========================================================================
   LAUT DARAH - 2D VECTOR RENDERING ENGINE
   Organic Archipelagos, Shipwrecks, Occult Spires, Spiked Mines, & Buoyant Waterlines
   ========================================================================== */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width = 0;
let height = 0;
let dpr = 1;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Render Natural Organic Coastlines (Procedural Spline Contour)
function drawWorldIsland(ctx, isl) {
  ctx.save();
  ctx.translate(isl.x, isl.y);

  const steps = 48;
  const outerPoints = [];
  const innerPoints = [];

  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const rOuter = getIslandRadiusAt(isl, theta);
    const rInner = Math.max(20, rOuter - 24);
    outerPoints.push({ x: Math.cos(theta) * rOuter, y: Math.sin(theta) * rOuter });
    innerPoints.push({ x: Math.cos(theta) * rInner, y: Math.sin(theta) * rInner });
  }

  // 1. Sand Rim / Outer Beach (Organic Shape)
  ctx.fillStyle = isl.sandColor || '#ca8a04';
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 1; i < outerPoints.length; i++) {
    const prev = outerPoints[i - 1];
    const curr = outerPoints[i];
    const mx = (prev.x + curr.x) / 2;
    const my = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.closePath();
  ctx.fill();

  // 2. Interior Lush Landmass / Volcanic Rocks
  ctx.fillStyle = isl.color || '#166534';
  ctx.beginPath();
  ctx.moveTo(innerPoints[0].x, innerPoints[0].y);
  for (let i = 1; i < innerPoints.length; i++) {
    const prev = innerPoints[i - 1];
    const curr = innerPoints[i];
    const mx = (prev.x + curr.x) / 2;
    const my = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.closePath();
  ctx.fill();

  // 3. Island Interior Features (Foliage / Eldritch Flesh nodes)
  if (isl.isFlesh) {
    ctx.fillStyle = '#ef4444';
    const time = Date.now() * 0.002;
    for (let i = 0; i < 9; i++) {
      const ang = (i / 9) * Math.PI * 2 + 0.3;
      const r = (getIslandRadiusAt(isl, ang) - 50) * 0.6;
      const px = Math.cos(ang) * r;
      const py = Math.sin(ang) * r;
      ctx.beginPath();
      ctx.arc(px, py, 15 + Math.sin(time + i) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#14532d';
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + 0.25;
      const r = (getIslandRadiusAt(isl, ang) - 50) * 0.55;
      const px = Math.cos(ang) * r;
      const py = Math.sin(ang) * r;
      ctx.beginPath();
      ctx.arc(px, py, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Wooden Pier extending from shoreline
  const dockR = getIslandRadiusAt(isl, isl.dockAngle) - 18;
  const dx = Math.cos(isl.dockAngle) * dockR;
  const dy = Math.sin(isl.dockAngle) * dockR;
  const pLen = 65;
  const pAngle = isl.dockAngle;

  ctx.save();
  ctx.translate(dx, dy);
  ctx.rotate(pAngle);
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2;
  ctx.fillRect(0, -9, pLen, 18);
  ctx.strokeRect(0, -9, pLen, 18);

  // Pier planks
  ctx.strokeStyle = '#291102';
  for (let pl = 8; pl < pLen; pl += 9) {
    ctx.beginPath();
    ctx.moveTo(pl, -9);
    ctx.lineTo(pl, 9);
    ctx.stroke();
  }

  // Dock mooring bollards (Patok tambatan tali kapal di tepi dermaga)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(pLen * 0.3 - 2, -11, 4, 3);
  ctx.fillRect(pLen * 0.7 - 2, -11, 4, 3);
  ctx.fillRect(pLen * 0.3 - 2, 8, 4, 3);
  ctx.fillRect(pLen * 0.7 - 2, 8, 4, 3);

  // Home Port welcome pennant flag
  if (isl.id === 'haven') {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(pLen - 2, 0);
    ctx.lineTo(pLen + 14, -6);
    ctx.lineTo(pLen - 2, -12);
    ctx.closePath();
    ctx.fill();
  }

  // Dock lanterns & ambient glow
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(pLen - 4, -7, 3.5, 0, Math.PI * 2);
  ctx.arc(pLen - 4, 7, 3.5, 0, Math.PI * 2);
  ctx.fill();

  const pierGlow = ctx.createRadialGradient(pLen - 4, 0, 4, pLen - 4, 0, 34);
  pierGlow.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
  pierGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = pierGlow;
  ctx.beginPath();
  ctx.arc(pLen - 4, 0, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // Finish wooden pier

  // Island Name Plaque & Clan Crest
  ctx.font = 'bold 12px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 6;
  ctx.fillText(isl.name, 0, -10);

  ctx.font = 'bold 9px sans-serif';
  ctx.fillStyle = isl.id === 'haven' ? '#38bdf8' : (isl.clan === 'neutral' ? '#86efac' : (CLAN_LORE[isl.clan]?.badgeColor || '#fbbf24'));
  ctx.fillText(isl.id === 'haven' ? "PANGKALAN UTAMA ARMADA (HOME PORT)" : (isl.clan === 'neutral' ? "PELABUHAN AMAN" : `WILAYAH: ${CLAN_LORE[isl.clan]?.name || 'PIRATE'}`), 0, 8);

  ctx.restore();
}

function drawVectorShip(ctx, ship, isPlayer = false, tier = 1) {
  ctx.save();
  ctx.translate(ship.x, ship.y);

  const time = Date.now() * 0.003;
  const isMoving = isPlayer 
    ? (joystickState.active && joystickState.magnitude > 0.1) 
    : Boolean(ship.isMoving);

  // Dynamic Ship Lantern Glow
  if (isPlayer) {
    const lanternGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 75 + tier * 5);
    lanternGrad.addColorStop(0, 'rgba(251, 191, 36, 0.18)');
    lanternGrad.addColorStop(0.6, 'rgba(217, 119, 6, 0.08)');
    lanternGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lanternGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 75 + tier * 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const clan = ship.clan || 'gold';
    let glowColorInner = 'rgba(251, 191, 36, 0.14)';
    let glowColorOuter = 'rgba(217, 119, 6, 0.04)';
    if (clan === 'iron') {
      glowColorInner = 'rgba(234, 88, 12, 0.18)';
      glowColorOuter = 'rgba(194, 65, 12, 0.04)';
    } else if (clan === 'mist') {
      glowColorInner = 'rgba(34, 211, 238, 0.22)';
      glowColorOuter = 'rgba(6, 182, 212, 0.05)';
    } else if (clan === 'blood') {
      glowColorInner = 'rgba(244, 63, 94, 0.25)';
      glowColorOuter = 'rgba(190, 18, 60, 0.06)';
    }
    const enemyGlow = ctx.createRadialGradient(0, 0, 8, 0, 0, 55 + (ship.radius || 20));
    enemyGlow.addColorStop(0, glowColorInner);
    enemyGlow.addColorStop(0.65, glowColorOuter);
    enemyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = enemyGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 55 + (ship.radius || 20), 0, Math.PI * 2);
    ctx.fill();
  }

  // Natural Hydrodynamic Buoyancy when stationary
  let bobOffset = 0;
  let bobAngle = 0;
  if (!isMoving) {
    const hullSeed = (ship.x * 0.05 + ship.y * 0.03);
    bobOffset = Math.sin(time * 2.2 + hullSeed) * 1.5;
    bobAngle = Math.cos(time * 1.7 + hullSeed) * 0.022;
  }

  // ELEGANT IDLE WATER SURFACE DISPLACEMENT (Cincin riak desakan air & busa halus alami)
  if (!isMoving) {
    ctx.save();
    ctx.rotate(ship.angle);
    const footprintL = isPlayer ? (34 + tier * 3.5) : (ship.radius * 2.1 || 40);
    const footprintW = isPlayer ? (16 + tier * 1.8) : (ship.radius * 1.3 || 24);

    // 1. Expanding subtle displacement water rings
    for (let r = 0; r < 2; r++) {
      const cycle = ((time * 0.75 + r * 0.5) % 1.0);
      const ringScale = 1.0 + cycle * 0.45;
      const ringAlpha = (1.0 - cycle) * 0.35;
      ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, bobOffset * 0.5, (footprintL / 2) * ringScale, (footprintW / 2) * ringScale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Translucent waterline perimeter foam hugging the hull edge
    const foamAlpha = 0.15 + Math.sin(time * 2.8) * 0.06;
    ctx.fillStyle = `rgba(224, 242, 254, ${foamAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(0, bobOffset * 0.7, footprintL * 0.53, footprintW * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.translate(0, bobOffset);
  ctx.rotate(ship.angle + bobAngle);

  if (isPlayer) {
    const hullLength = 34 + tier * 3.5;
    const hullWidth = 16 + tier * 1.8;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-2, 4, hullLength / 2, hullWidth / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Hull
    ctx.fillStyle = tier >= 4 ? '#381d11' : '#6b4226';
    ctx.strokeStyle = tier >= 4 ? '#d97706' : '#271406';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hullLength / 2, 0);
    ctx.bezierCurveTo(hullLength * 0.3, -hullWidth / 2, -hullLength * 0.3, -hullWidth / 2, -hullLength / 2, -hullWidth * 0.35);
    ctx.lineTo(-hullLength / 2, hullWidth * 0.35);
    ctx.bezierCurveTo(-hullLength * 0.3, hullWidth / 2, hullLength * 0.3, hullWidth / 2, hullLength / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner Deck
    ctx.fillStyle = tier >= 4 ? '#78350f' : '#92400e';
    ctx.beginPath();
    ctx.ellipse(-2, 0, (hullLength / 2) - 5, (hullWidth / 2) - 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Side Broadside Cannons
    const numCannons = Math.min(6, 2 + Math.floor(playerState.upgrades.cannons / 2));
    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < numCannons; i++) {
      const offsetX = -hullLength * 0.3 + (i * (hullLength * 0.6 / (numCannons - 1 || 1)));
      ctx.fillRect(offsetX - 2, -hullWidth / 2 - 3, 4, 4);
      ctx.fillRect(offsetX - 2, hullWidth / 2 - 1, 4, 4);
    }

    // Stern Chasers
    if (playerState.upgrades.rearDefense > 0) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hullLength / 2 - 4, -hullWidth * 0.25, 4, 3);
      ctx.fillRect(-hullLength / 2 - 4, hullWidth * 0.12, 4, 3);
      if (playerState.upgrades.rearDefense >= 3) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-hullLength / 2 - 2, -3, 3, 6);
      }
    }

    // Mast & Billowing White/Camo Sail
    ctx.fillStyle = '#172554';
    ctx.fillRect(-6, -1.5, 12, 3);
    ctx.fillStyle = playerState.upgrades.stealthCamo >= 4 ? '#334155' : (tier >= 5 ? '#fef08a' : '#f8fafc');
    ctx.strokeStyle = playerState.upgrades.stealthCamo >= 4 ? '#1e293b' : '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-10, -hullWidth * 0.85);
    ctx.quadraticCurveTo(8, 0, -10, hullWidth * 0.85);
    ctx.quadraticCurveTo(2, 0, -10, -hullWidth * 0.85);
    ctx.fill();
    ctx.stroke();

    // Flag at stern
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-hullLength / 2, 0);
    ctx.lineTo(-hullLength / 2 - 8, -4);
    ctx.lineTo(-hullLength / 2 - 8, 4);
    ctx.closePath();
    ctx.fill();

    // Bow Brass Lantern
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(hullLength / 2 - 2, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else {
    const clan = ship.clan || 'gold';
    const t = ship.tier || 1;

    // 1. UNAWARE (Tidak notice): Bentuk Segitiga / Vision Cone di hadapan kapal
    if (ship.alertState === 'unaware' || ship.alertState === 'suspicious') {
      ctx.save();
      const coneDist = ship.isMonster ? 300 : 260;
      const coneAngle = 0.65;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.05)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.32)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, coneDist, -coneAngle, coneAngle);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

    // 2. ALERTED (Notice / Mengejar): Bentuk berubah menjadi Full Circle Besar untuk lari
    } else if (ship.alertState === 'alerted') {
      ctx.save();
      const alertR = ship.isMonster ? 520 : 460;
      const alertGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, alertR);
      alertGrad.addColorStop(0, 'rgba(239, 68, 68, 0.05)');
      alertGrad.addColorStop(0.85, 'rgba(239, 68, 68, 0.02)');
      alertGrad.addColorStop(1, 'rgba(239, 68, 68, 0.15)');
      ctx.fillStyle = alertGrad;
      ctx.beginPath();
      ctx.arc(0, 0, alertR, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing warning ring
      ctx.strokeStyle = (Math.sin(Date.now() * 0.007) > 0) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(249, 115, 22, 0.3)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

    // 3. SEARCHING (Saat mencari): Bentuk Circle Kecil dengan sapuan radar
    } else if (ship.alertState === 'searching') {
      ctx.save();
      const searchR = 150;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
      ctx.beginPath();
      ctx.arc(0, 0, searchR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating radar beam inside small circle
      const sweepAng = Date.now() * 0.005;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweepAng) * searchR, Math.sin(sweepAng) * searchR);
      ctx.stroke();
      ctx.restore();
    }

    if (clan === 'gold') {
      const len = 26 + t * 6;
      const wid = 14 + t * 4;
      ctx.fillStyle = t === 3 ? '#291807' : '#45220a';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5 + t * 0.5;
      ctx.beginPath();
      ctx.moveTo(len / 2, 0);
      ctx.bezierCurveTo(len * 0.3, -wid / 2, -len * 0.3, -wid / 2, -len / 2, -wid * 0.3);
      ctx.lineTo(-len / 2, wid * 0.3);
      ctx.bezierCurveTo(-len * 0.3, wid / 2, len * 0.3, wid / 2, len / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.ellipse(0, 0, len * 0.32, wid * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      const cannonCount = t + 1;
      for (let i = 0; i < cannonCount; i++) {
        const cx = -len * 0.2 + (i * (len * 0.4 / (cannonCount - 1 || 1)));
        ctx.fillRect(cx - 2, -wid / 2 - 3, 4, 3);
        ctx.fillRect(cx - 2, wid / 2, 4, 3);
      }

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5, -wid * 0.8);
      ctx.quadraticCurveTo(len * 0.2, 0, -5, wid * 0.8);
      ctx.quadraticCurveTo(0, 0, -5, -wid * 0.8);
      ctx.fill();
      ctx.stroke();

    } else if (clan === 'iron') {
      const len = 28 + t * 6;
      const wid = 16 + t * 4;

      // Boiler rumble vibration during windup
      if (ship.chargeState === 'windup') {
        const jx = (Math.random() - 0.5) * 2.5;
        const jy = (Math.random() - 0.5) * 2.5;
        ctx.translate(jx, jy);
      }

      ctx.fillStyle = t === 3 ? '#0f172a' : '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(len / 2, 0);
      ctx.lineTo(len * 0.2, -wid / 2);
      ctx.lineTo(-len / 2, -wid / 2);
      ctx.lineTo(-len / 2, wid / 2);
      ctx.lineTo(len * 0.2, wid / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Heavy Iron Ram Prow (Membara oranye/merah saat charging!)
      const isCharging = ship.chargeState === 'charging';
      const isWindup = ship.chargeState === 'windup';

      if (isCharging) {
        ctx.save();
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ff4500';
      } else if (isWindup) {
        ctx.fillStyle = (Math.sin(Date.now() * 0.02) > 0) ? '#ea580c' : '#b45309';
      } else {
        ctx.fillStyle = '#ea580c';
      }

      ctx.beginPath();
      ctx.moveTo(len / 2, -wid * 0.3);
      ctx.lineTo(len / 2 + 10 + t * 3 + (isCharging ? 5 : 0), 0);
      ctx.lineTo(len / 2, wid * 0.3);
      ctx.closePath();
      ctx.fill();

      if (isCharging) {
        // Glowing core of the molten ram
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(len / 2 + 6, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Speed thrust shockwave line behind stern
        ctx.save();
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-len / 2 - 4, -wid * 0.45);
        ctx.lineTo(-len / 2 - 18, 0);
        ctx.lineTo(-len / 2 - 4, wid * 0.45);
        ctx.stroke();
        ctx.restore();
      }

      if (t >= 2) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-len * 0.15, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (clan === 'mist') {
      const len = 26 + t * 5;
      const wid = 13 + t * 3.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 6 + t * 3;
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(len / 2, 0);
      ctx.bezierCurveTo(len * 0.3, -wid / 2, -len * 0.2, -wid / 2, -len / 2, -wid * 0.2);
      ctx.lineTo(-len / 2, wid * 0.2);
      ctx.bezierCurveTo(-len * 0.2, wid / 2, len * 0.3, wid / 2, len / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.beginPath();
      ctx.moveTo(-6, -wid * 0.9);
      ctx.quadraticCurveTo(len * 0.2, -wid * 0.3, -4, 0);
      ctx.quadraticCurveTo(len * 0.2, wid * 0.3, -6, wid * 0.9);
      ctx.lineTo(-10, wid * 0.7);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-10, -wid * 0.7);
      ctx.closePath();
      ctx.fill();

    } else if (clan === 'blood') {
      const len = 30 + t * 8;
      const wid = 14 + t * 5;

      if (t === 1) {
        ctx.fillStyle = '#881337';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, len / 2, wid / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(8, 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (t === 2) {
        ctx.fillStyle = '#7f1d1d';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(4, 0, len * 0.4, wid * 0.45, 0, 0, Math.PI * 2);
        ctx.ellipse(-len * 0.25, Math.sin(time) * 4, len * 0.28, wid * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.bezierCurveTo(len * 0.3, -wid * 0.8, -len * 0.3, -wid * 0.6, -len / 2, 0);
        ctx.bezierCurveTo(-len * 0.3, wid * 0.6, len * 0.3, wid * 0.8, len / 2, 0);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    ctx.rotate(-ship.angle);
    const barWidth = 38;
    const barHeight = 4;
    const clanInfo = CLAN_LORE[clan] || CLAN_LORE.gold;

    // Vector Alert Indicators (No Emojis!)
    if (ship.alertState === 'searching') {
      // Searching Radar Waves (Amber searching indicator)
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -45, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating radar sweep
      const sweepAng = Date.now() * 0.006;
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(Math.cos(sweepAng) * 9, -45 + Math.sin(sweepAng) * 9);
      ctx.stroke();
      ctx.restore();
    } else if (ship.alertState === 'suspicious') {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -45, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, -44);
      ctx.restore();
    } else if (ship.alertState === 'alerted') {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -45, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, -44);
      ctx.restore();
    }

    // HP & Clan Info Plaque
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(-barWidth / 2 - 2, -36, barWidth + 4, barHeight + 11);

    ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = clanInfo.badgeColor;
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${t} ${clan === 'blood' ? 'ELD' : clan.toUpperCase()}`, 0, -28);

    ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
    ctx.fillRect(-barWidth / 2, -26, barWidth, barHeight);

    ctx.fillStyle = clanInfo.badgeColor;
    const hpPercent = Math.max(0, ship.hp / ship.maxHp);
    ctx.fillRect(-barWidth / 2, -26, barWidth * hpPercent, barHeight);
  }

  ctx.restore();
}

// OVERHAUL: High-Fidelity Sunken Shipwreck with Broken Keel, Rib Timbers & Treasure Glow
function drawSunkenShip(ctx, wreck) {
  ctx.save();
  ctx.translate(wreck.x, wreck.y);
  ctx.rotate(wreck.angle);

  const time = Date.now() * 0.003;

  // Murky underwater seabed silhouette
  ctx.fillStyle = wreck.isAbyssal ? 'rgba(153, 27, 27, 0.35)' : 'rgba(15, 23, 42, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fractured Keel - Main Hull Section
  ctx.fillStyle = wreck.isAbyssal ? '#4c0519' : '#1e1b18';
  ctx.strokeStyle = wreck.isAbyssal ? '#f43f5e' : '#78716c';
  ctx.lineWidth = 1.6;

  // Fore Section
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(2, -9);
  ctx.lineTo(-2, -5);
  ctx.lineTo(12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Aft Section (Tilted)
  ctx.beginPath();
  ctx.moveTo(-4, -6);
  ctx.lineTo(-22, -10);
  ctx.lineTo(-24, 6);
  ctx.lineTo(-6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Exposed Rib Timbers (Tulang Rusuk Kayu Kapal Karam)
  ctx.strokeStyle = wreck.isAbyssal ? '#fca5a5' : '#a8a29e';
  ctx.lineWidth = 1.2;
  for (let i = -18; i <= 14; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, -11);
    ctx.lineTo(i + 2, 7);
    ctx.stroke();
  }

  // Tilted Broken Mainmast
  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(14, 18);
  ctx.stroke();

  // Tattered submerged sails
  ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.quadraticCurveTo(8, 16, 12, 12);
  ctx.closePath();
  ctx.fill();

  // Underwater Treasure Light Glow
  const treasureGlow = ctx.createRadialGradient(-2, -2, 2, -2, -2, 22);
  treasureGlow.addColorStop(0, wreck.isAbyssal ? 'rgba(244, 63, 94, 0.45)' : 'rgba(251, 191, 36, 0.4)');
  treasureGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = treasureGlow;
  ctx.beginPath();
  ctx.arc(-2, -2, 22, 0, Math.PI * 2);
  ctx.fill();

  // Rising sparkling bubbles from open cargo hatch
  for (let i = 0; i < 4; i++) {
    const bx = Math.sin(time + i * 2) * 14;
    const by = Math.cos(time + i * 2.2) * 8;
    ctx.fillStyle = wreck.isAbyssal ? 'rgba(244, 63, 94, 0.7)' : 'rgba(254, 240, 138, 0.8)';
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vector Anchor resting nearby with chain
  ctx.rotate(-wreck.angle);
  ctx.save();
  ctx.translate(0, -24);
  ctx.strokeStyle = wreck.isAbyssal ? '#f87171' : '#fbbf24';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -6, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(0, 6);
  ctx.moveTo(-5, -1);
  ctx.lineTo(5, -1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 3, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// Render Spiked Floating Sea Mines (Iron Island Defenses)
function drawSpikedMine(ctx, sm) {
  ctx.save();
  ctx.translate(sm.x, sm.y);

  // Submerged anchor chain down
  ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(0, 22);
  ctx.stroke();
  ctx.setLineDash([]);

  // Spikes protruding from iron sphere
  ctx.strokeStyle = sm.detonating ? '#ef4444' : '#71717a';
  ctx.lineWidth = 2.5;
  for (let s = 0; s < 8; s++) {
    const sAng = (s / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(sAng) * 6, Math.sin(sAng) * 6);
    ctx.lineTo(Math.cos(sAng) * 14, Math.sin(sAng) * 14);
    ctx.stroke();
  }

  // Heavy Spiked Iron Sphere Body
  const mineGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, sm.radius);
  mineGrad.addColorStop(0, '#71717a');
  mineGrad.addColorStop(0.5, '#27272a');
  mineGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = mineGrad;
  ctx.beginPath();
  ctx.arc(0, 0, sm.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Flashing Danger Sensor Light (Red Warning Beacon)
  const isFlashing = sm.detonating 
    ? (Math.sin(sm.flashTimer) > 0) 
    : (Math.sin(Date.now() * 0.005 + sm.bobPhase) > 0.4);

  ctx.fillStyle = isFlashing ? '#ef4444' : '#450a0a';
  ctx.beginPath();
  ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  if (isFlashing) {
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// Render Occult Watchtowers (Mist Atoll Mysterious Spire)
function drawOccultTower(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Basalt Stone Hexagonal Foundation
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let h = 0; h < 6; h++) {
    const hang = (h / 6) * Math.PI * 2;
    const hx = Math.cos(hang) * tw.radius;
    const hy = Math.sin(hang) * tw.radius;
    if (h === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Basalt Spire tier
  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#312e81';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius * 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing Occult Runes (Rune toska misterius bersinar)
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 10 * tw.glowPulse + 4;
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 1.5;
  for (let r = 0; r < 4; r++) {
    const rang = (r / 4) * Math.PI * 2 + tw.orbAngle * 0.3;
    const rx = Math.cos(rang) * (tw.radius * 0.45);
    const ry = Math.sin(rang) * (tw.radius * 0.45);
    ctx.beginPath();
    ctx.moveTo(rx - 3, ry - 3);
    ctx.lineTo(rx + 3, ry + 3);
    ctx.moveTo(rx + 3, ry - 3);
    ctx.lineTo(rx - 3, ry + 3);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Floating Rotating Crystal Orb / Spectral Eye
  const orbY = -6 + Math.sin(tw.orbAngle * 2) * 3;
  const orbGrad = ctx.createRadialGradient(-2, orbY - 2, 1, 0, orbY, 9);
  orbGrad.addColorStop(0, '#e0f2fe');
  orbGrad.addColorStop(0.4, '#38bdf8');
  orbGrad.addColorStop(1, '#0369a1');

  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 16;
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(0, orbY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Structure HP Bar & Name
  const barW = 46;
  const barH = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -38, barW + 4, barH + 11);

  ctx.font = 'bold 8px "Cinzel", serif';
  ctx.fillStyle = '#22d3ee';
  ctx.textAlign = 'center';
  ctx.fillText("MENARA KUTUKAN", 0, -30);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -28, barW, barH);

  ctx.fillStyle = '#06b6d4';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -28, barW * hpRatio, barH);

  ctx.restore();
}

// Render Ships Currently Sinking into the Deep
function drawSinkingShip(ctx, s) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle);

  const scale = Math.max(0.2, 1 - s.progress * 0.6);
  ctx.scale(scale, scale);
  ctx.globalAlpha = Math.max(0, 1 - s.progress * 0.85);

  const len = 28;
  const wid = 14;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, len * 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#291807';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, len / 2, wid / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(8, 4);
  ctx.stroke();

  ctx.restore();
}

// Render Oceanic Seagulls (Burung Camar Laut Terbang & Mengepak Sayap)
function drawSeagull(ctx, s) {
  ctx.save();
  ctx.translate(s.x, s.y);

  // 1. Soft Shadow cast on Sea Water
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
  ctx.translate(0, s.altitude);
  ctx.rotate(s.heading);
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Flying Bird Body
  ctx.rotate(s.heading);
  const flap = Math.sin(s.wingPhase) * 5.5;

  // Wings (White with Slate Gray Wingtips)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';

  // Left Wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-2, -6 + flap, -1, -11 + flap * 1.4);
  ctx.stroke();

  // Right Wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-2, 6 - flap, -1, 11 - flap * 1.4);
  ctx.stroke();

  // Slate Gray Wingtips
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-1, -8 + flap * 1.2);
  ctx.lineTo(-1, -11 + flap * 1.4);
  ctx.moveTo(-1, 8 - flap * 1.2);
  ctx.lineTo(-1, 11 - flap * 1.4);
  ctx.stroke();

  // Sleek White Body
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(1, 0, 5.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Yellow Beak
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(5.5, -0.8);
  ctx.lineTo(8.5, 0);
  ctx.lineTo(5.5, 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function render() {
  const playerDist = Math.hypot(playerState.x, playerState.y);
  const biome = getBiomeInfo(playerDist);
  const time = performance.now() * 0.001;

  const [r1, g1, b1] = biome.waterA;
  const [r2, g2, b2] = biome.waterB;
  const oceanGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, Math.max(width, height));
  oceanGrad.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
  oceanGrad.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  let shakeX = 0;
  let shakeY = 0;
  if (screenShake > 0) {
    shakeX = (Math.random() - 0.5) * screenShake * 2;
    shakeY = (Math.random() - 0.5) * screenShake * 2;
  }

  ctx.translate(width / 2 - playerState.x + shakeX, height / 2 - playerState.y + shakeY);

  const viewLeft = playerState.x - width / 2 - 120;
  const viewRight = playerState.x + width / 2 + 120;
  const viewTop = playerState.y - height / 2 - 120;
  const viewBottom = playerState.y + height / 2 + 120;

  // Ocean Wave Ribbons
  const waveSpacing = 95;
  const startWaveY = Math.floor(viewTop / waveSpacing) * waveSpacing;
  const endWaveY = viewBottom + waveSpacing;

  ctx.lineWidth = 1.8;
  for (let wy = startWaveY; wy < endWaveY; wy += waveSpacing) {
    ctx.beginPath();
    const waveColor = biome.isBloodSea 
      ? `rgba(255, 60, 60, ${0.12 + Math.sin(time + wy * 0.02) * 0.04})` 
      : `rgba(255, 255, 255, ${0.08 + Math.sin(time + wy * 0.02) * 0.03})`;
    ctx.strokeStyle = waveColor;

    const stepX = 40;
    for (let wx = viewLeft; wx <= viewRight; wx += stepX) {
      const swellOffset = Math.sin(wx * 0.012 + time * 1.4 + wy * 0.02) * 12 
                        + Math.cos(wx * 0.024 - time * 0.8) * 6;
      if (wx === viewLeft) {
        ctx.moveTo(wx, wy + swellOffset);
      } else {
        ctx.lineTo(wx, wy + swellOffset);
      }
    }
    ctx.stroke();
  }

  // Render Drifting Ambient Sea Fog Clouds
  entities.ambientMist.forEach(m => {
    if (m.x + m.radius > viewLeft && m.x - m.radius < viewRight &&
        m.y + m.radius > viewTop && m.y - m.radius < viewBottom) {
      const mistGrad = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.radius);
      const mistColor = biome.isBloodSea ? 'rgba(180, 20, 30, ' : 'rgba(200, 230, 255, ';
      mistGrad.addColorStop(0, `${mistColor}${m.alpha})`);
      mistGrad.addColorStop(1, `${mistColor}0)`);
      ctx.fillStyle = mistGrad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Render Organic Archipelago Islands
  WORLD_ISLANDS.forEach(isl => {
    if (isl.x + isl.radius + 50 > viewLeft && isl.x - isl.radius - 50 < viewRight &&
        isl.y + isl.radius + 50 > viewTop && isl.y - isl.radius - 50 < viewBottom) {
      drawWorldIsland(ctx, isl);
    }
  });

  // Render Sunken Ships (High-Fidelity Wreck)
  entities.sunkenShips.forEach(s => drawSunkenShip(ctx, s));

  // Render Spiked Floating Sea Mines (Iron Islands)
  entities.spikedMines.forEach(sm => drawSpikedMine(ctx, sm));

  // Render Occult Watchtowers (Mist Atoll)
  entities.towers.forEach(tw => drawOccultTower(ctx, tw));

  // Render Player Mines
  entities.mines.forEach(m => {
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(m.x, m.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Render Floating Loots
  entities.floatingLoots.forEach(loot => {
    ctx.fillStyle = loot.type === 'repair' ? '#b45309' : '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(loot.x - 7, loot.y - 7, 14, 14, 3);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  });

  // Render Sea Ripples & Water Trails
  entities.seaRipples.forEach(r => {
    const strokeColor = r.color ? `${r.color}${r.alpha})` : `rgba(255, 255, 255, ${r.alpha})`;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Render Sinking Ships in death sequence
  entities.sinkingShips.forEach(s => drawSinkingShip(ctx, s));

  // Render Enemy Ships
  entities.enemies.forEach(e => drawVectorShip(ctx, e, false));

  // Render Player Ship
  const tierInfo = getShipTier();
  drawVectorShip(ctx, playerState, true, tierInfo.rank);

  // Render Projectiles
  entities.projectiles.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.type === 'cannonball' || !p.type) {
      const ballRad = p.radius || 4;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(1.5, 3, ballRad, 0, Math.PI * 2);
      ctx.fill();

      const ironGrad = ctx.createRadialGradient(-ballRad * 0.35, -ballRad * 0.35, 1, 0, 0, ballRad);
      ironGrad.addColorStop(0, '#94a3b8');
      ironGrad.addColorStop(0.35, '#475569');
      ironGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = ironGrad;
      ctx.beginPath();
      ctx.arc(0, 0, ballRad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      ctx.stroke();

    } else if (p.type === 'spirit') {
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius || 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(-1, -1, (p.radius || 6) * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

    } else if (p.type === 'spike') {
      ctx.rotate(p.angle || 0);
      ctx.fillStyle = '#881337';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-6, -3.5);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  });

  // Render Particles
  entities.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Render Floating Combat Numbers
  entities.floatingTexts.forEach(ft => {
    ctx.save();
    ctx.font = ft.isCrit ? '900 13px "Cinzel", sans-serif' : 'bold 11px sans-serif';
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.textAlign = 'center';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });

  // Render Oceanic Seagulls overhead
  if (entities.seagulls) {
    entities.seagulls.forEach(s => drawSeagull(ctx, s));
  }

  ctx.restore();

  // Blood Sea Vignette
  if (biome.bloodRatio > 0.05) {
    const vignetteAlpha = 0.45 * biome.bloodRatio;
    const bloodGrad = ctx.createRadialGradient(
      width / 2, height / 2, width * (0.55 - biome.bloodRatio * 0.2),
      width / 2, height / 2, width * 0.72
    );
    bloodGrad.addColorStop(0, 'rgba(180, 0, 0, 0)');
    bloodGrad.addColorStop(1, `rgba(160, 5, 15, ${vignetteAlpha})`);
    ctx.fillStyle = bloodGrad;
    ctx.fillRect(0, 0, width, height);
  }
}
