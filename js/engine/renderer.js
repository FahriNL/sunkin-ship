/* ==========================================================================
   LAUT DARAH - 2D VECTOR RENDERING ENGINE
   Organic Archipelagos, Shipwrecks, Occult Spires, Spiked Mines, & Buoyant Waterlines
   ========================================================================== */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
let width = 0;
let height = 0;
let dpr = 1;

let _now = 0;
let _perfNow = 0;
const _renderedCenters = new Set();
let viewLeft = 0, viewRight = 0, viewTop = 0, viewBottom = 0;

function isVisible(x, y, margin) {
  return x > viewLeft - margin && x < viewRight + margin 
      && y > viewTop - margin && y < viewBottom + margin;
}

function resizeCanvas() {
  const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth < 1024;
  dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Precompute and cache island geometry once to eliminate per-frame trigonometry & GC allocations
function getIslandCachedData(isl) {
  if (isl._cachedOuter) return isl;

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

  // Cache pier coordinates
  const dockR = getIslandRadiusAt(isl, isl.dockAngle) - 18;
  const dx = Math.cos(isl.dockAngle) * dockR;
  const dy = Math.sin(isl.dockAngle) * dockR;

  // Cache interior foliage / flesh node positions / skull mounds
  const foliage = [];
  const count = isl.isFlesh ? 9 : 8;
  const offset = isl.isFlesh ? 0.3 : 0.25;
  const factor = isl.isFlesh ? 0.6 : 0.55;
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + offset;
    const r = (getIslandRadiusAt(isl, ang) - 50) * factor;
    foliage.push({
      x: Math.cos(ang) * r,
      y: Math.sin(ang) * r,
      baseRadius: isl.isFlesh ? 15 : 20
    });
  }

  // Pre-cache giant skull mounds and leviathan ribcage pier for Skull Island
  if (isl.isSkullIsland) {
    const skullCount = 14;
    const skulls = [];
    for (let k = 0; k < skullCount; k++) {
      const skAng = (k / skullCount) * Math.PI * 2 + 0.35;
      const skR = (getIslandRadiusAt(isl, skAng) - 65) * (0.35 + (k % 3) * 0.18);
      skulls.push({
        x: Math.cos(skAng) * skR,
        y: Math.sin(skAng) * skR,
        r: 15 + (k % 4) * 4,
        rot: skAng
      });
    }
    isl._cachedSkulls = skulls;

    // Ribcage arches extending from the dock
    const ribCount = 6;
    const ribs = [];
    for (let r = 0; r < ribCount; r++) {
      ribs.push({
        dist: 12 + r * 11,
        span: 17 + (r % 2) * 4
      });
    }
    isl._cachedRibs = ribs;
  }

  isl._cachedOuter = outerPoints;
  isl._cachedInner = innerPoints;
  isl._cachedPier = { dx, dy, pAngle: isl.dockAngle };
  isl._cachedFoliage = foliage;

  return isl;
}

// Render Natural Organic Coastlines (Procedural Spline Contour)
function drawWorldIsland(ctx, isl) {
  getIslandCachedData(isl);
  const outerPoints = isl._cachedOuter;
  const innerPoints = isl._cachedInner;

  ctx.save();
  ctx.translate(isl.x, isl.y);

  // 1. Sand Rim / Outer Beach (Organic Shape)
  ctx.fillStyle = isl.sandColor || '#ca8a04';
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 1; i < outerPoints.length; i++) {
    const prev = outerPoints[i - 1];
    const curr = outerPoints[i];
    const mx = (prev.x + curr.x) * 0.5;
    const my = (prev.y + curr.y) * 0.5;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.closePath();
  ctx.fill();

  // 2. Interior Lush Landmass / Volcanic Rocks / Dark Ossuary Stone
  ctx.fillStyle = isl.color || '#166534';
  ctx.beginPath();
  ctx.moveTo(innerPoints[0].x, innerPoints[0].y);
  for (let i = 1; i < innerPoints.length; i++) {
    const prev = innerPoints[i - 1];
    const curr = innerPoints[i];
    const mx = (prev.x + curr.x) * 0.5;
    const my = (prev.y + curr.y) * 0.5;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.closePath();
  ctx.fill();

  // 3. Island Interior Features (Foliage / Eldritch Flesh nodes / Giant Skull Mounds)
  if (isl.isSkullIsland && isl._cachedSkulls) {
    // Render Giant Ossuary & Skulls Mounds
    for (let i = 0; i < isl._cachedSkulls.length; i++) {
      const sk = isl._cachedSkulls[i];
      ctx.save();
      ctx.translate(sk.x, sk.y);
      ctx.rotate(sk.rot);

      // Bone-white skull cranium
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(0, 0, sk.r, sk.r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lower maxilla / jaw shelf
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-sk.r * 0.45, sk.r * 0.45, sk.r * 0.9, sk.r * 0.4);

      // Hollow dark eye sockets
      ctx.fillStyle = '#0f172a';
      const eyeR = Math.max(2.2, sk.r * 0.22);
      ctx.beginPath();
      ctx.ellipse(-sk.r * 0.35, -sk.r * 0.1, eyeR, eyeR * 1.25, -0.2, 0, Math.PI * 2);
      ctx.ellipse(sk.r * 0.35, -sk.r * 0.1, eyeR, eyeR * 1.25, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Nasal cavity
      ctx.beginPath();
      ctx.moveTo(0, sk.r * 0.05);
      ctx.lineTo(-eyeR * 0.5, sk.r * 0.35);
      ctx.lineTo(eyeR * 0.5, sk.r * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  } else if (isl.isFlesh) {
    ctx.fillStyle = '#ef4444';
    const time = _now * 0.002;
    for (let i = 0; i < isl._cachedFoliage.length; i++) {
      const node = isl._cachedFoliage[i];
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.baseRadius + Math.sin(time + i) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#14532d';
    for (let i = 0; i < isl._cachedFoliage.length; i++) {
      const node = isl._cachedFoliage[i];
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.baseRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Pier extending from shoreline (Wooden Pier or Leviathan Ribcage Pier)
  const pier = isl._cachedPier;
  const pLen = 65;
  const pAngle = pier.pAngle;

  ctx.save();
  ctx.translate(pier.dx, pier.dy);
  ctx.rotate(pAngle);

  if (isl.isSkullIsland && isl._cachedRibs) {
    // Leviathan Ribcage Pier (Arched Ivory Ribs over Dock Water)
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.fillRect(0, -9, pLen, 18);
    ctx.strokeRect(0, -9, pLen, 18);

    // Bone planks
    ctx.strokeStyle = '#94a3b8';
    for (let pl = 8; pl < pLen; pl += 9) {
      ctx.beginPath();
      ctx.moveTo(pl, -9);
      ctx.lineTo(pl, 9);
      ctx.stroke();
    }

    // Arching Leviathan Ribs Tunnel
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    isl._cachedRibs.forEach(rib => {
      ctx.beginPath();
      ctx.moveTo(rib.dist, -10);
      ctx.quadraticCurveTo(rib.dist - 3, -rib.span, rib.dist + 3, -rib.span * 0.65);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rib.dist, 10);
      ctx.quadraticCurveTo(rib.dist - 3, rib.span, rib.dist + 3, rib.span * 0.65);
      ctx.stroke();
    });

    // Crimson Blood Lantern on Rib Pier Tip
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pLen - 4, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    const ribGlow = ctx.createRadialGradient(pLen - 4, 0, 3, pLen - 4, 0, 36);
    ribGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    ribGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = ribGlow;
    ctx.beginPath();
    ctx.arc(pLen - 4, 0, 36, 0, Math.PI * 2);
    ctx.fill();

  } else {
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

    // Pennant flags for Haven, Conquered Islands, and Shop Islands
    if (isl.id === 'haven') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(pLen - 2, 0);
      ctx.lineTo(pLen + 14, -6);
      ctx.lineTo(pLen - 2, -12);
      ctx.closePath();
      ctx.fill();
    } else if (isl.isConquered) {
      // Golden Player Armada Pennant Flag fluttering on conquered pier
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(pLen - 2, 0);
      ctx.lineTo(pLen + 16, -6);
      ctx.lineTo(pLen - 2, -12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (isl.isShopIsland) {
      // Emerald Trade Flag for Shop Islands
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(pLen - 2, 0);
      ctx.lineTo(pLen + 15, -6);
      ctx.lineTo(pLen - 2, -12);
      ctx.closePath();
      ctx.fill();
    }

    // Dock lanterns & ambient glow
    ctx.fillStyle = isl.isConquered ? '#fde047' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(pLen - 4, -7, 3.5, 0, Math.PI * 2);
    ctx.arc(pLen - 4, 7, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const pierGlow = ctx.createRadialGradient(pLen - 4, 0, 4, pLen - 4, 0, 34);
    pierGlow.addColorStop(0, isl.isConquered ? 'rgba(253, 224, 71, 0.45)' : 'rgba(251, 191, 36, 0.35)');
    pierGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = pierGlow;
    ctx.beginPath();
    ctx.arc(pLen - 4, 0, 34, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Finish pier

  // Island Name Plaque & Clan Crest
  ctx.font = 'bold 12px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  const prevFill = ctx.fillStyle;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillText(isl.name, 2, -8);
  ctx.fillStyle = prevFill;
  ctx.fillText(isl.name, 0, -10);

  ctx.font = 'bold 9px sans-serif';
  let subtitle = "";
  let subColor = "#fbbf24";
  if (isl.id === 'haven') {
    subtitle = "PANGKALAN UTAMA ARMADA (HOME PORT)";
    subColor = '#38bdf8';
  } else if (isl.isShopIsland) {
    subtitle = "PASAR APUNG NIAGA & GALANGAN KAPAL";
    subColor = '#34d399';
  } else if (isl.isConquered) {
    subtitle = `PULAU KEKUASAAN (TIER ${isl.tier || 4}) • TERLINDUNGI`;
    subColor = '#fde047';
  } else {
    subtitle = `[TIER ${isl.tier || 4}] WILAYAH: ${CLAN_LORE[isl.clan]?.name || 'PIRATE'}`;
    subColor = CLAN_LORE[isl.clan]?.badgeColor || '#fbbf24';
  }
  ctx.fillStyle = subColor;
  ctx.fillText(subtitle, 0, 8);

  ctx.restore();
}

function drawVectorShip(ctx, ship, isPlayer = false, tier = 1) {
  ctx.save();
  ctx.translate(ship.x, ship.y);

  const time = _now * 0.003;
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

    // 1. UNAWARE (Tidak notice): Segitiga untuk kapal, Lingkaran Penuh 360 untuk Monster Laut
    if (ship.alertState === 'unaware' || ship.alertState === 'suspicious') {
      ctx.save();
      if (ship.isMonster) {
        // Monster memiliki sensor getaran air sirkular 360 derajat yang luas!
        const auraR = 420;
        const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, auraR);
        auraGrad.addColorStop(0, 'rgba(244, 63, 94, 0.04)');
        auraGrad.addColorStop(0.75, 'rgba(244, 63, 94, 0.015)');
        auraGrad.addColorStop(1, 'rgba(244, 63, 94, 0.16)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, auraR, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing underwater acoustic sonar ring
        const sonarPulse = (_now * 0.002) % 1;
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.45 - sonarPulse * 0.35})`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, auraR * (0.75 + sonarPulse * 0.25), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        const coneDist = ship.convoyId ? 340 : 270;
        const coneAngle = ship.convoyId ? 0.85 : 0.65;
        ctx.fillStyle = ship.convoyId ? 'rgba(251, 191, 36, 0.06)' : 'rgba(251, 191, 36, 0.05)';
        ctx.strokeStyle = ship.convoyId ? 'rgba(251, 191, 36, 0.42)' : 'rgba(251, 191, 36, 0.32)';
        ctx.lineWidth = ship.convoyId ? 1.6 : 1.3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, coneDist, -coneAngle, coneAngle);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

    // 2. SEARCHING (Saat mencari): Lingkaran kecil bersih tanda penyelidikan
    } else if (ship.alertState === 'searching') {
      ctx.save();
      const searchR = ship.isMonster ? 240 : 160;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
      ctx.beginPath();
      ctx.arc(0, 0, searchR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating radar beam inside small circle
      const sweepAng = _now * 0.005;
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
        ctx.fillStyle = '#ff4500';
      } else if (isWindup) {
        ctx.fillStyle = (Math.sin(_now * 0.02) > 0) ? '#ea580c' : '#b45309';
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
        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.bezierCurveTo(len * 0.3, -wid * 0.8, -len * 0.3, -wid * 0.6, -len / 2, 0);
        ctx.bezierCurveTo(-len * 0.3, wid * 0.6, len * 0.3, wid * 0.8, len / 2, 0);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Flagship Command Pennant for Convoy Leaders
    if (ship.formationRole === 'leader' && !ship.isMonster) {
      ctx.save();
      const mastX = -ship.radius * 0.15;
      const pennantColor = clan === 'iron' ? '#94a3b8' : (clan === 'mist' ? '#22d3ee' : '#f59e0b');
      ctx.fillStyle = pennantColor;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mastX, 0);
      ctx.lineTo(mastX - 16, -6 + Math.sin(_now * 0.008) * 2.5);
      ctx.lineTo(mastX - 11, 0);
      ctx.lineTo(mastX - 16, 6 + Math.sin(_now * 0.008) * 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
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
      const sweepAng = _now * 0.006;
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
    const isDocked = ship.isAnchored && !ship.isMonster && ship.alertState === 'unaware';
    const plaqueWidth = isDocked ? barWidth + 22 : barWidth;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(-plaqueWidth / 2 - 2, -36, plaqueWidth + 4, barHeight + 11);

    ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = clanInfo.badgeColor;
    ctx.textAlign = 'center';
    const label = isDocked 
      ? `Lv.${t} ${clan.toUpperCase()} [BERLABUH]`
      : `Lv.${t} ${clan === 'blood' ? 'ELD' : clan.toUpperCase()}`;
    ctx.fillText(label, 0, -28);

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

  const time = _now * 0.003;

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
    : (Math.sin(_now * 0.005 + sm.bobPhase) > 0.4);

  ctx.fillStyle = isFlashing ? '#ef4444' : '#450a0a';
  ctx.beginPath();
  ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  if (isFlashing) {
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1;
    ctx.stroke();
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

  // Floating Rotating Crystal Orb / Spectral Eye
  const orbY = -6 + Math.sin(tw.orbAngle * 2) * 3;
  const orbGrad = ctx.createRadialGradient(-2, orbY - 2, 1, 0, orbY, 9);
  orbGrad.addColorStop(0, '#e0f2fe');
  orbGrad.addColorStop(0.4, '#38bdf8');
  orbGrad.addColorStop(1, '#0369a1');

  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(0, orbY, 8, 0, Math.PI * 2);
  ctx.fill();

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

// Coastal Cannon Bastion (Gold & Haven)
function drawCannonBastion(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  const isHaven = tw.defenseType === 'haven_bastion';
  const baseColor = isHaven ? '#1e3a8a' : '#292524';
  const stoneColor = isHaven ? '#3b82f6' : '#78716c';
  const trimColor = isHaven ? '#60a5fa' : '#ca8a04';

  // Circular / Octagonal Stone Foundation Platform
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = stoneColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let h = 0; h < 8; h++) {
    const hang = (h / 8) * Math.PI * 2;
    const hx = Math.cos(hang) * tw.radius;
    const hy = Math.sin(hang) * tw.radius;
    if (h === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Battlement Tier
  ctx.fillStyle = '#1c1917';
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius * 0.68, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rotating Heavy Cannon Carriage & Barrel
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);

  // Cast-iron Gun Turret Mount
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Heavy Cannon Barrel
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.lineTo(24, -3);
  ctx.lineTo(25, -4.5);
  ctx.lineTo(26, 4.5);
  ctx.lineTo(24, 3);
  ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cannon Muzzle Ring
  ctx.fillStyle = trimColor;
  ctx.fillRect(23, -3.5, 2.5, 7);

  ctx.restore();

  // Structure HP Bar & Title
  const barW = 46;
  const barH = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -38, barW + 4, barH + 11);

  ctx.font = 'bold 8px "Cinzel", serif';
  ctx.fillStyle = isHaven ? '#60a5fa' : '#f59e0b';
  ctx.textAlign = 'center';
  ctx.fillText(isHaven ? "MERIAM DAMAI" : "BENTENG MERIAM", 0, -30);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -28, barW, barH);

  ctx.fillStyle = isHaven ? '#3b82f6' : '#eab308';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -28, barW * hpRatio, barH);

  ctx.restore();
}

// Steam Harpoon Turret (Iron Clan)
function drawSteamHarpoonTurret(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Heavy Iron Plated Square Bunker Platform
  const bunkerSize = tw.radius * 1.6;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(-bunkerSize * 0.5, -bunkerSize * 0.5, bunkerSize, bunkerSize);
  ctx.fill();
  ctx.stroke();

  // Corner Brass Rivets
  ctx.fillStyle = '#f59e0b';
  const rOff = bunkerSize * 0.42;
  [[-rOff, -rOff], [rOff, -rOff], [rOff, rOff], [-rOff, rOff]].forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Iron Turret Rotating Mount
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);

  // Turret Housing
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Twin Harpoon Ballista Rails
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.fillRect(4, -7, 22, 3);
  ctx.fillRect(4, 4, 22, 3);
  ctx.strokeRect(4, -7, 22, 3);
  ctx.strokeRect(4, 4, 22, 3);

  // Loaded Steel Harpoon Spike
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(28, -5.5);
  ctx.lineTo(23, -8);
  ctx.lineTo(25, -5.5);
  ctx.lineTo(10, -5.5);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(28, 5.5);
  ctx.lineTo(23, 3);
  ctx.lineTo(25, 5.5);
  ctx.lineTo(10, 5.5);
  ctx.closePath();
  ctx.fill();

  // Steam Smokestack Pipe on rear of turret
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(-8, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(-8, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Structure HP Bar & Title
  const barW = 46;
  const barH = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -38, barW + 4, barH + 11);

  ctx.font = 'bold 8px "Cinzel", serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText("HARPOON BAJA", 0, -30);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -28, barW, barH);

  ctx.fillStyle = '#64748b';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -28, barW * hpRatio, barH);

  ctx.restore();
}

// Abyssal Living Tentacle (Blood/Meat Islands)
function drawAbyssalTentacle(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Sea water churn & bubbling blood whirlpool around base
  const churn = Math.sin(_now * 0.004 + tw.id) * 3;
  ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 0, tw.radius + 6 + churn, (tw.radius + 4) * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spurt bubbles around base
  ctx.fillStyle = '#f43f5e';
  for (let b = 0; b < 3; b++) {
    const bAng = (b / 3) * Math.PI * 2 + _now * 0.002;
    const bx = Math.cos(bAng) * (tw.radius * 0.7);
    const by = Math.sin(bAng) * (tw.radius * 0.4);
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Calculate 6 segment inverse kinematics / procedural sway
  const segments = 6;
  const segLength = 9;
  const phase = tw.wrigglePhase || 0;
  
  let curX = 0;
  let curY = 0;
  let angle = tw.baseAngle !== undefined ? tw.baseAngle : 0;

  if (tw.isSlamming) {
    const slamTargetAngle = Math.atan2(tw.slamTargetY - tw.y, tw.slamTargetX - tw.x);
    angle = slamTargetAngle;
  }

  // Draw 6 connected fleshy tentacle segments
  for (let s = 0; s < segments; s++) {
    const segT = s / segments;
    const segWidth = (1.0 - segT * 0.68) * 14;
    const sway = Math.sin(phase + s * 0.85) * (0.35 + segT * 0.4);
    const segAngle = angle + sway;

    const nextX = curX + Math.cos(segAngle) * segLength;
    const nextY = curY + Math.sin(segAngle) * segLength - (s * 3.5);

    // Segment flesh body
    ctx.fillStyle = s % 2 === 0 ? '#4c0519' : '#881337';
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.ellipse(curX, curY, segWidth * 0.5, segWidth * 0.45, segAngle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White suckers along the rim
    if (s >= 1) {
      const suckerX = curX + Math.cos(segAngle + Math.PI * 0.5) * (segWidth * 0.45);
      const suckerY = curY + Math.sin(segAngle + Math.PI * 0.5) * (segWidth * 0.45);
      ctx.fillStyle = '#fecdd3';
      ctx.beginPath();
      ctx.arc(suckerX, suckerY, Math.max(1.2, 3.2 - s * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    curX = nextX;
    curY = nextY;
  }

  // Sharp claw / thorn tip
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(curX, curY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Structure HP Bar & Title
  const barW = 46;
  const barH = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -44, barW + 4, barH + 11);

  ctx.font = 'bold 8px "Cinzel", serif';
  ctx.fillStyle = '#f43f5e';
  ctx.textAlign = 'center';
  ctx.fillText("TENTAKEL ABISAL", 0, -36);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -34, barW, barH);

  ctx.fillStyle = '#e11d48';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -34, barW * hpRatio, barH);

  ctx.restore();
}

// Gold Clan Peranakan: Swivel Gun Outpost
function drawSwivelOutpost(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Stilt platform on ocean water
  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
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

  // Wooden plank flooring
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Swivel gun mount & barrel
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Single sleek swivel barrel
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(2, -2, 16, 4);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(15, -2.5, 3, 5);
  ctx.restore();

  // HP Bar & Title
  const barW = 38;
  const barH = 3.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -32, barW + 4, barH + 9);

  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#fde047';
  ctx.textAlign = 'center';
  ctx.fillText("GARDU PUTAR", 0, -25);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -23, barW, barH);

  ctx.fillStyle = '#f59e0b';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -23, barW * hpRatio, barH);

  ctx.restore();
}

// Iron Clan Peranakan: Steam Furnace Vent
function drawSteamVent(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Riveted boiler base
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing furnace fire grate
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Twin chimney vents
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1;
  ctx.fillRect(2, -6, 14, 4);
  ctx.fillRect(2, 2, 14, 4);
  ctx.strokeRect(2, -6, 14, 4);
  ctx.strokeRect(2, 2, 14, 4);
  ctx.restore();

  // Steam puff particles around vent
  ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
  ctx.beginPath();
  ctx.arc(Math.sin(_now * 0.005) * 4, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // HP Bar & Title
  const barW = 38;
  const barH = 3.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -32, barW + 4, barH + 9);

  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.textAlign = 'center';
  ctx.fillText("CEROBONG UAP", 0, -25);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -23, barW, barH);

  ctx.fillStyle = '#94a3b8';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -23, barW * hpRatio, barH);

  ctx.restore();
}

// Mist Clan Peranakan: Occult Skull Pylon
function drawSkullPylon(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Arcane water ripple
  ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius + 6, 0, Math.PI * 2);
  ctx.fill();

  // Dark obsidian needle spire
  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(8, 8);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Levitating glowing skull above pylon tip
  const skullBob = Math.sin(_now * 0.004 + (tw.id || 0)) * 3;
  ctx.save();
  ctx.translate(0, -24 + skullBob);
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cyan glowing eyes
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(-1.8, -0.5, 1, 0, Math.PI * 2);
  ctx.arc(1.8, -0.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // HP Bar & Title
  const barW = 38;
  const barH = 3.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -38, barW + 4, barH + 9);

  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#67e8f9';
  ctx.textAlign = 'center';
  ctx.fillText("PYLON ARWAH", 0, -31);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -29, barW, barH);

  ctx.fillStyle = '#22d3ee';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -29, barW * hpRatio, barH);

  ctx.restore();
}

// Blood Clan Peranakan: Parasitic Flesh Spitter
function drawFleshSpitter(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Blood pool ripple
  const pulse = Math.sin(_now * 0.006 + (tw.id || 0)) * 2;
  ctx.fillStyle = 'rgba(153, 27, 27, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius + 4 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Pulsating fleshy bio-pod
  ctx.fillStyle = '#881337';
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, tw.radius + pulse * 0.6, (tw.radius - 2) + pulse * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gaping acidic mouth / orifice aiming at target
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);
  ctx.fillStyle = '#4c0519';
  ctx.beginPath();
  ctx.ellipse(8, 0, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sharp yellowed bone teeth
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(11, -3); ctx.lineTo(13, 0); ctx.lineTo(11, 3);
  ctx.fill();
  ctx.restore();

  // HP Bar & Title
  const barW = 38;
  const barH = 3.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -32, barW + 4, barH + 9);

  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#fda4af';
  ctx.textAlign = 'center';
  ctx.fillText("KANTUNG PARASIT", 0, -25);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -23, barW, barH);

  ctx.fillStyle = '#f43f5e';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -23, barW * hpRatio, barH);

  ctx.restore();
}

// Master Dispatcher for Island Defenses
function drawIslandDefense(ctx, tw) {
  if (tw.defenseType === 'tentacle') {
    drawAbyssalTentacle(ctx, tw);
  } else if (tw.defenseType === 'flesh_spitter') {
    drawFleshSpitter(ctx, tw);
  } else if (tw.defenseType === 'steam_harpoon') {
    drawSteamHarpoonTurret(ctx, tw);
  } else if (tw.defenseType === 'steam_vent') {
    drawSteamVent(ctx, tw);
  } else if (tw.defenseType === 'swivel_outpost') {
    drawSwivelOutpost(ctx, tw);
  } else if (tw.defenseType === 'skull_pylon') {
    drawSkullPylon(ctx, tw);
  } else if (tw.defenseType === 'cannon_bastion' || tw.defenseType === 'haven_bastion') {
    drawCannonBastion(ctx, tw);
  } else {
    drawOccultTower(ctx, tw);
  }
}

// Render Peaceful Merchant Ships & Trade Convoys
function drawMerchantShip(ctx, m) {
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.angle);

  const isCargo = m.type === 'cargo';
  const len = isCargo ? 32 : 28;
  const wid = isCargo ? 18 : 14;

  // Water displacement / shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(1.5, 2.5, len * 0.5, wid * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isCargo) {
    // 1. Cargo Cog / Pinisi Dagang Hull
    ctx.fillStyle = '#78350f'; // Warm teak wood
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(len * 0.52, 0); // Bow
    ctx.bezierCurveTo(len * 0.35, -wid * 0.55, -len * 0.3, -wid * 0.52, -len * 0.48, -wid * 0.35);
    ctx.lineTo(-len * 0.48, wid * 0.35);
    ctx.bezierCurveTo(-len * 0.3, wid * 0.52, len * 0.35, wid * 0.55, len * 0.52, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wooden deck
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(-len * 0.05, 0, len * 0.36, wid * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cargo Crates & Spice Barrels on Deck
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.fillRect(-6, -5, 6, 5);
    ctx.strokeRect(-6, -5, 6, 5);
    ctx.fillRect(-6, 1, 6, 5);
    ctx.strokeRect(-6, 1, 6, 5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(2, -3, 6, 6);
    ctx.strokeRect(2, -3, 6, 6);

    // Main Mast & Striped Merchant Sail
    ctx.fillStyle = '#fef3c7'; // Cream cloth
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2, -wid * 0.85);
    ctx.quadraticCurveTo(len * 0.25, 0, -2, wid * 0.85);
    ctx.quadraticCurveTo(0, 0, -2, -wid * 0.85);
    ctx.fill();
    ctx.stroke();

    // Merchant Emerald Trade Stripe
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-1, -wid * 0.45);
    ctx.lineTo(len * 0.12, 0);
    ctx.lineTo(-1, wid * 0.45);
    ctx.stroke();

    // Bow Gold Lantern
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(len * 0.48, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // 2. Armed Escort Cutter
    ctx.fillStyle = '#1e293b'; // Slate dark hull
    ctx.strokeStyle = '#0284c7'; // Cyan trim
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(len * 0.55, 0);
    ctx.bezierCurveTo(len * 0.3, -wid * 0.5, -len * 0.35, -wid * 0.45, -len * 0.48, -wid * 0.28);
    ctx.lineTo(-len * 0.48, wid * 0.28);
    ctx.bezierCurveTo(-len * 0.35, wid * 0.45, len * 0.3, wid * 0.5, len * 0.55, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Deck
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.35, wid * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Port & Starboard Swivel Guns
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, -wid * 0.5 - 2, 4, 3);
    ctx.fillRect(-2, wid * 0.5 - 1, 4, 3);

    // Escort Chevron Sails
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-4, -wid * 0.8);
    ctx.quadraticCurveTo(len * 0.22, 0, -4, wid * 0.8);
    ctx.quadraticCurveTo(-1, 0, -4, -wid * 0.8);
    ctx.fill();
    ctx.stroke();
  }

  // Anchor emblem when docked (Vector)
  if (m.isAnchored || m.state === 'docked') {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -wid - 9, 2, 0, Math.PI * 2);
    ctx.moveTo(0, -wid - 7);
    ctx.lineTo(0, -wid - 2);
    ctx.moveTo(-3, -wid - 5);
    ctx.lineTo(3, -wid - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -wid - 4, 3, 0.25 * Math.PI, 0.75 * Math.PI, false);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();

  // Floating HP bar above merchant ship
  const barW = 36;
  const barH = 3;
  ctx.save();
  ctx.translate(m.x, m.y);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(-barW / 2 - 2, -26, barW + 4, barH + 9);

  ctx.font = 'bold 7px sans-serif';
  ctx.fillStyle = isCargo ? '#34d399' : '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText(m.name, 0, -19);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -18, barW, barH);

  ctx.fillStyle = isCargo ? '#10b981' : '#0ea5e9';
  const hpRatio = Math.max(0, m.hp / m.maxHp);
  ctx.fillRect(-barW / 2, -18, barW * hpRatio, barH);

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

  const isCarrion = !!s.isCarrion;
  const wingColor = isCarrion ? '#1e293b' : '#ffffff';
  const tipColor = isCarrion ? '#020617' : '#64748b';
  const bodyColor = isCarrion ? '#0f172a' : '#f8fafc';
  const beakColor = isCarrion ? '#475569' : '#f59e0b';

  // Wings
  ctx.strokeStyle = wingColor;
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

  // Wingtips
  ctx.strokeStyle = tipColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-1, -8 + flap * 1.2);
  ctx.lineTo(-1, -11 + flap * 1.4);
  ctx.moveTo(-1, 8 - flap * 1.2);
  ctx.lineTo(-1, 11 - flap * 1.4);
  ctx.stroke();

  // Sleek Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(1, 0, 5.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = beakColor;
  ctx.beginPath();
  ctx.moveTo(5.5, -0.8);
  ctx.lineTo(8.5, 0);
  ctx.lineTo(5.5, 0.8);
  ctx.closePath();
  ctx.fill();

  // Carrion Crow Glowing Crimson Eye
  if (isCarrion) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(3.5, -0.8, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderMistRituals(ctx) {
  _renderedCenters.clear();
  entities.enemies.forEach(e => {
    if (e.formationType === 'mist_ritual' && e.ritualCenter && !_renderedCenters.has(e.ritualCenter)) {
      _renderedCenters.add(e.ritualCenter);
      const rc = e.ritualCenter;

      ctx.save();
      ctx.translate(rc.x, rc.y);
      ctx.rotate(rc.angle || 0);

      // Ethereal glowing circle on water
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 98);
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.16)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 98, 0, Math.PI * 2);
      ctx.fill();

      // Outer arcane dashed ritual circle
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([12, 8, 4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.stroke();

      // Inner occult pentagram / runic star
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5;
        const rx = Math.cos(a) * 55;
        const ry = Math.sin(a) * 55;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.stroke();

      // Central pulsing arcane wisp orb
      const corePulse = Math.sin(_now * 0.005) * 3 + 9;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
      ctx.beginPath();
      ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  });
}

// Pre-rendered offscreen mist sprite textures for ultra-fast GPU blitting
let mistSpriteNormal = null;
let mistSpriteBlood = null;

function createMistSprite(colorA, colorB) {
  const size = 128;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = size;
  offCanvas.height = size;
  const offCtx = offCanvas.getContext('2d');
  const grad = offCtx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, colorA);
  grad.addColorStop(0.5, colorB);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  offCtx.fillStyle = grad;
  offCtx.beginPath();
  offCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  offCtx.fill();
  return offCanvas;
}

function getMistSprite(isBlood) {
  if (isBlood) {
    if (!mistSpriteBlood) mistSpriteBlood = createMistSprite('rgba(220, 38, 38, 0.45)', 'rgba(180, 20, 30, 0.15)');
    return mistSpriteBlood;
  } else {
    if (!mistSpriteNormal) mistSpriteNormal = createMistSprite('rgba(220, 240, 255, 0.45)', 'rgba(200, 230, 255, 0.15)');
    return mistSpriteNormal;
  }
}

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  _now = Date.now();
  _perfNow = performance.now() * 0.001;
  const playerDist = Math.hypot(playerState.x, playerState.y);
  const biome = getBiomeInfo(playerDist);
  const time = _perfNow;

  // Hardware-accelerated linear gradient for mobile GPU fill rate efficiency
  const [r1, g1, b1] = biome.waterA;
  const [r2, g2, b2] = biome.waterB;
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
  oceanGrad.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  let shakeX = 0;
  let shakeY = 0;
  if (screenShake > 0 && sound.screenShakeEnabled) {
    shakeX = (Math.random() - 0.5) * screenShake * 2;
    shakeY = (Math.random() - 0.5) * screenShake * 2;
  }

  // Adaptive Camera Zoom:
  // On PC / wide screens, cameraZoom is 1.0.
  // On mobile portrait, zoom is tuned (~0.88x - 0.90x) so ship is close and prominent without feeling cramped.
  const isMobile = isMobileDevice() || width < 1024;
  const cameraZoom = isMobile ? Math.min(1.0, Math.max(0.85, width / 520)) : 1.0;

  // True Centering Transform:
  // Center world coordinates at (width/2, height/2), apply zoom, then translate to player
  ctx.translate(width / 2, height / 2);
  ctx.scale(cameraZoom, cameraZoom);
  ctx.translate(-playerState.x + shakeX, -playerState.y + shakeY);

  const drawMargin = isMobile ? 100 : 180;
  const halfViewW = (width / 2) / cameraZoom;
  const halfViewH = (height / 2) / cameraZoom;
  viewLeft = playerState.x - halfViewW - drawMargin;
  viewRight = playerState.x + halfViewW + drawMargin;
  viewTop = playerState.y - halfViewH - drawMargin;
  viewBottom = playerState.y + halfViewH + drawMargin;

  // Ocean Wave Ribbons (Optimized step and spacing to cut trig calls and stroke paths)
  const waveSpacing = 135;
  const startWaveY = Math.floor(viewTop / waveSpacing) * waveSpacing;
  const endWaveY = viewBottom + waveSpacing;

  ctx.lineWidth = 1.6;
  for (let wy = startWaveY; wy < endWaveY; wy += waveSpacing) {
    ctx.beginPath();
    const waveColor = biome.isBloodSea 
      ? `rgba(255, 60, 60, ${0.12 + Math.sin(time + wy * 0.02) * 0.04})` 
      : `rgba(255, 255, 255, ${0.08 + Math.sin(time + wy * 0.02) * 0.03})`;
    ctx.strokeStyle = waveColor;

    const stepX = 65;
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

  // Render Drifting Ambient Sea Fog Clouds using pre-rendered texture sprite
  const mistSprite = getMistSprite(biome.isBloodSea);
  entities.ambientMist.forEach(m => {
    if (m.x + m.radius > viewLeft && m.x - m.radius < viewRight &&
        m.y + m.radius > viewTop && m.y - m.radius < viewBottom) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, m.alpha * 1.3));
      ctx.drawImage(mistSprite, m.x - m.radius, m.y - m.radius, m.radius * 2, m.radius * 2);
      ctx.restore();
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
  entities.sunkenShips.forEach(s => {
    if (!isVisible(s.x, s.y, 200)) return;
    drawSunkenShip(ctx, s)
  });

  // Render Spiked Floating Sea Mines (Iron Islands)
  entities.spikedMines.forEach(sm => {
    if (!isVisible(sm.x, sm.y, 100)) return;
    drawSpikedMine(ctx, sm)
  });

  // Render Occult Watchtowers (Mist Atoll)
  entities.towers.forEach(tw => {
    if (!isVisible(tw.x, tw.y, 200)) return;
    drawIslandDefense(ctx, tw);
  });

  // Render Player Mines
  entities.mines.forEach(m => {
    if (!isVisible(m.x, m.y, 50)) return;
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

  // Render Floating Loots & Message Bottles
  entities.floatingLoots.forEach(loot => {
    if (!isVisible(loot.x, loot.y, 50)) return;
    if (loot.type === 'bottle') {
      ctx.save();
      ctx.translate(loot.x, loot.y);
      ctx.rotate(Math.sin(_now * 0.003 + (loot.bobOffset || 0)) * 0.25);

      // Glass bottle body
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 2, 6, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bottle neck & cork
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(-2.5, -9, 5, 5);
      ctx.strokeRect(-2.5, -9, 5, 5);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-2, -12, 4, 3);

      // Rolled parchment treasure map inside
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2, 0, 4, 7);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-2, 0, 4, 7);

      ctx.restore();
    } else {
      ctx.fillStyle = loot.type === 'repair' ? '#b45309' : '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(loot.x - 7, loot.y - 7, 14, 14, 3);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  });

  // Render Sea Ripples & Water Trails
  entities.seaRipples.forEach(r => {
    if (!isVisible(r.x, r.y, 50)) return;
    const strokeColor = r.color ? `${r.color}${r.alpha})` : `rgba(255, 255, 255, ${r.alpha})`;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Render Subsurface Leviathan Shadow (Bayangan Purba Melintas di Bawah Air)
  if (typeof subsurfaceShadow !== 'undefined' && subsurfaceShadow.active && isVisible(subsurfaceShadow.x, subsurfaceShadow.y, 250)) {
    ctx.save();
    ctx.translate(subsurfaceShadow.x, subsurfaceShadow.y);
    ctx.rotate(subsurfaceShadow.heading);
    const lifeRatio = subsurfaceShadow.progress / subsurfaceShadow.maxDuration;
    const shadowAlpha = Math.sin(lifeRatio * Math.PI) * 0.36;
    ctx.fillStyle = `rgba(3, 7, 18, ${shadowAlpha})`;

    // Undulating colossal body
    ctx.beginPath();
    ctx.ellipse(0, 0, subsurfaceShadow.length * 0.5, subsurfaceShadow.width * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leviathan flipper fins
    ctx.beginPath();
    ctx.ellipse(-12, -subsurfaceShadow.width * 0.52, 28, 14, 0.4, 0, Math.PI * 2);
    ctx.ellipse(-12, subsurfaceShadow.width * 0.52, 28, 14, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Tail fin
    const tailWiggle = Math.sin(_now * 0.005) * 12;
    ctx.beginPath();
    ctx.moveTo(-subsurfaceShadow.length * 0.46, 0);
    ctx.lineTo(-subsurfaceShadow.length * 0.64, -26 + tailWiggle);
    ctx.lineTo(-subsurfaceShadow.length * 0.64, 26 + tailWiggle);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Render Sinking Ships in death sequence
  entities.sinkingShips.forEach(s => {
    if (!isVisible(s.x, s.y, 200)) return;
    drawSinkingShip(ctx, s)
  });

  // Render Mist Occult Ritual Circles
  renderMistRituals(ctx);

  // Render Merchant Shipping Vessels & Convoys
  if (entities.merchants) {
    entities.merchants.forEach(m => {
      if (!isVisible(m.x, m.y, 300)) return;
      drawMerchantShip(ctx, m);
    });
  }

  // Render Enemy Ships
  entities.enemies.forEach(e => {
    if (!isVisible(e.x, e.y, 300)) return;
    drawVectorShip(ctx, e, false);
  });

  // Render Player Ship
  const tierInfo = getShipTier();
  drawVectorShip(ctx, playerState, true, tierInfo.rank);

  // Render Harbor Docking Aura & Prompt
  if (playerState.isDockedAtPort && playerState.dockedPort) {
    const port = playerState.dockedPort;
    ctx.save();
    ctx.translate(playerState.x, playerState.y);
    const auraPulse = Math.sin(_now * 0.004) * 4 + 36;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, auraPulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 9px "Cinzel", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    ctx.fillText(`BERLABUH DI ${port.name.toUpperCase()}`, 0, -40);
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText("Galangan Kapal Siap [U]", 0, -30);
    ctx.restore();
  }

  // Render Projectiles
  entities.projectiles.forEach(p => {
    if (!isVisible(p.x, p.y, 50)) return;
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
      ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius || 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(-1, -1, (p.radius || 6) * 0.45, 0, Math.PI * 2);
      ctx.fill();

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

    } else if (p.type === 'iron_harpoon') {
      ctx.rotate(p.angle || 0);
      // Heavy barbed iron bolt
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(2, -4);
      ctx.lineTo(4, -1.5);
      ctx.lineTo(-8, -1.5);
      ctx.lineTo(-8, 1.5);
      ctx.lineTo(4, 1.5);
      ctx.lineTo(2, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Trailing steam / chain cord
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-18, 0);
      ctx.stroke();

    } else if (p.type === 'blood_bile') {
      // Corrosive blood globule
      ctx.fillStyle = 'rgba(225, 29, 72, 0.9)';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius || 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(-1.5, -1.5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  });

  // Render Particles
  const particlesByColor = {};
  entities.particles.forEach(p => {
    if (!isVisible(p.x, p.y, 20)) return;
    (particlesByColor[p.color] || (particlesByColor[p.color] = [])).push(p);
  });
  for (const color in particlesByColor) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const group = particlesByColor[color];
    for (let i = 0; i < group.length; i++) {
      const p = group[i];
      ctx.moveTo(p.x + p.size, p.y);
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Render Floating Combat Numbers
  entities.floatingTexts.forEach(ft => {
    if (!isVisible(ft.x, ft.y, 50)) return;
    ctx.save();
    ctx.font = ft.isCrit ? '900 13px "Cinzel", sans-serif' : 'bold 11px sans-serif';
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.textAlign = 'center';
    const prevFill = ctx.fillStyle;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
    ctx.fillStyle = prevFill;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });

  // Render Oceanic Seagulls overhead
  if (entities.seagulls) {
    entities.seagulls.forEach(s => {
      if (!isVisible(s.x, s.y, 100)) return;
      drawSeagull(ctx, s)
    });
  }

  ctx.restore();

  // Blood Sea Vignette
  if (biome.bloodRatio > 0.05) {
    const vignetteAlpha = 0.45 * biome.bloodRatio;
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    const bloodGrad = ctx.createRadialGradient(
      width / 2, height / 2, minDim * (0.55 - biome.bloodRatio * 0.2),
      width / 2, height / 2, maxDim * 0.65
    );
    bloodGrad.addColorStop(0, 'rgba(180, 0, 0, 0)');
    bloodGrad.addColorStop(1, `rgba(160, 5, 15, ${vignetteAlpha})`);
    ctx.fillStyle = bloodGrad;
    ctx.fillRect(0, 0, width, height);
  }
}
