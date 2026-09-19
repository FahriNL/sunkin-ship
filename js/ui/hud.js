/* ==========================================================================
   LAUT DARAH - HEADS-UP DISPLAY (HUD) & COMBAT TEXT MODULE
   Horizontal Nautical Compass Bar, Vector POI Markers (No Emoji),
   Circular Mobile Joystick HP Ring, & Contextual Dock Actions
   ========================================================================== */

const toastEl = document.getElementById('toastNotification');
const toastMsg = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
let toastTimeout = null;

function showToast(msg, iconKey = "info") {
  if (!toastEl) return;
  toastMsg.innerText = msg;
  if (toastIcon) {
    toastIcon.innerHTML = SVG_ICONS[iconKey] || SVG_ICONS.info;
  }
  toastEl.classList.remove('opacity-0', '-translate-y-3');
  toastEl.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('opacity-100', 'translate-y-0');
    toastEl.classList.add('opacity-0', '-translate-y-3');
  }, 2600);
}

function addFloatingText(text, x, y, color = '#fbbf24', isCrit = false) {
  entities.floatingTexts.push({
    text,
    x,
    y: y - 10,
    vy: -1.2,
    alpha: 1.0,
    color,
    isCrit,
    scale: isCrit ? 1.3 : 1.0
  });
}

// Cached DOM Elements for high-performance zero-overhead updates
let elHpBar = null;
let elHpNumericText = null;
let elGoldText = null;
let elBloodText = null;
let elDistText = null;
let elZoneInd = null;
let elShipTitle = null;
let elShipRankBadge = null;
let elStealthBar = null;
let elStealthIcon = null;
let elStealthLabel = null;
let elStealthPercentLabel = null;
let elCompassCanvas = null;
let elJoystickHpCircle = null;
let elMobileHpText = null;
let elDockShopAction = null;
let elDockShopSubtitle = null;

let lastHpDisplay = -1;
let lastMaxHpDisplay = -1;
let lastGoldDisplay = -1;
let lastBloodDisplay = -1;
let lastDistDisplay = -1;
let lastZoneName = '';
let lastShipRank = -1;
let lastStealthPercent = -1;
let lastStealthState = '';
let lastDockedState = false;

const STEALTH_ICONS = {
  detected: `<svg class="w-3.5 h-3.5 text-rose-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" stroke-width="2.5"/></svg>`,
  warn: `<svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  safe: `<svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
};

function initHUDElements() {
  elHpBar = document.getElementById('hpBar');
  elHpNumericText = document.getElementById('hpNumericText');
  elGoldText = document.getElementById('goldText');
  elBloodText = document.getElementById('bloodEssenceText');
  elDistText = document.getElementById('distanceText');
  elZoneInd = document.getElementById('zoneIndicator');
  elShipTitle = document.getElementById('shipTitle');
  elShipRankBadge = document.getElementById('shipRankBadge');
  elStealthBar = document.getElementById('stealthBar');
  elStealthIcon = document.getElementById('stealthIcon');
  elStealthLabel = document.getElementById('stealthStatusLabel');
  elStealthPercentLabel = document.getElementById('stealthPercentLabel');
  elCompassCanvas = document.getElementById('compassCanvas');
  elJoystickHpCircle = document.getElementById('joystickHpCircle');
  elMobileHpText = document.getElementById('mobileHpText');
  elDockShopAction = document.getElementById('dockShopAction');
  elDockShopSubtitle = document.getElementById('dockShopSubtitle');
}

/* ==========================================================================
   PROCEDURAL VECTOR DRAWING HELPERS (CANVAS 2D - STRICTLY NO EMOJIS)
   ========================================================================== */

function drawVectorSkull(ctx, x, y, size = 11, color = '#ef4444') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;

  // Cranium dome
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.42, Math.PI, 0, false);
  ctx.lineTo(size * 0.28, size * 0.18);
  ctx.lineTo(-size * 0.28, size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Jaw
  ctx.beginPath();
  ctx.rect(-size * 0.18, size * 0.18, size * 0.36, size * 0.2);
  ctx.fill();
  ctx.stroke();

  // Eye sockets
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-size * 0.14, -size * 0.12, size * 0.11, 0, Math.PI * 2);
  ctx.arc(size * 0.14, -size * 0.12, size * 0.11, 0, Math.PI * 2);
  ctx.fill();

  // Crossbones
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.42, size * 0.42); ctx.lineTo(size * 0.42, -size * 0.42);
  ctx.moveTo(size * 0.42, size * 0.42); ctx.lineTo(-size * 0.42, -size * 0.42);
  ctx.stroke();

  ctx.restore();
}

function drawVectorAnchor(ctx, x, y, size = 11, color = '#38bdf8') {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Ring
  ctx.beginPath();
  ctx.arc(0, -size * 0.38, size * 0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Vertical shank
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.23);
  ctx.lineTo(0, size * 0.35);
  ctx.stroke();

  // Crossbar stock
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.12);
  ctx.lineTo(size * 0.3, -size * 0.12);
  ctx.stroke();

  // Fluke crescent
  ctx.beginPath();
  ctx.arc(0, size * 0.1, size * 0.38, 0.2 * Math.PI, 0.8 * Math.PI, false);
  ctx.stroke();

  // Tips
  ctx.beginPath();
  ctx.moveTo(-size * 0.38, size * 0.16); ctx.lineTo(-size * 0.32, size * 0.34);
  ctx.moveTo(size * 0.38, size * 0.16); ctx.lineTo(size * 0.32, size * 0.34);
  ctx.stroke();

  ctx.restore();
}

function drawVectorChest(ctx, x, y, size = 11, color = '#fbbf24') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1;

  // Box
  ctx.fillRect(-size * 0.4, -size * 0.05, size * 0.8, size * 0.42);
  ctx.strokeRect(-size * 0.4, -size * 0.05, size * 0.8, size * 0.42);

  // Arched lid
  ctx.beginPath();
  ctx.arc(0, -size * 0.05, size * 0.4, Math.PI, 0, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lock
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-size * 0.09, 0, size * 0.18, size * 0.18);

  ctx.restore();
}

function drawVectorShip(ctx, x, y, size = 11, color = '#38bdf8') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.8;

  // Hull
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, size * 0.2);
  ctx.lineTo(size * 0.45, size * 0.2);
  ctx.lineTo(size * 0.3, size * 0.42);
  ctx.lineTo(-size * 0.3, size * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mast
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.2);
  ctx.lineTo(0, -size * 0.4);
  ctx.stroke();

  // Sail
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.35);
  ctx.lineTo(size * 0.35, -size * 0.05);
  ctx.lineTo(0, -size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/* ==========================================================================
   HORIZONTAL NAUTICAL COMPASS BAR (HIGH DPI 2D CANVAS)
   ========================================================================== */

function renderCompassBar() {
  if (!elCompassCanvas) elCompassCanvas = document.getElementById('compassCanvas');
  if (!elCompassCanvas) return;

  const rect = elCompassCanvas.getBoundingClientRect();
  const w = rect.width || 340;
  const h = rect.height || 36;
  if (w <= 0 || h <= 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (elCompassCanvas.width !== Math.floor(w * dpr) || elCompassCanvas.height !== Math.floor(h * dpr)) {
    elCompassCanvas.width = Math.floor(w * dpr);
    elCompassCanvas.height = Math.floor(h * dpr);
  }

  const ctx = elCompassCanvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const compassStatus = (typeof weatherState !== 'undefined' && weatherState.compassStatus) ? weatherState.compassStatus : 'normal';

  // Subtle dark ocean parchment gradient (dynamic according to compass status)
  const bgGrad = ctx.createLinearGradient(0, 0, w, 0);
  if (compassStatus === 'corrupted') {
    bgGrad.addColorStop(0, 'rgba(45, 10, 15, 0.96)');
    bgGrad.addColorStop(0.2, 'rgba(127, 29, 29, 0.75)');
    bgGrad.addColorStop(0.5, 'rgba(69, 10, 10, 0.55)');
    bgGrad.addColorStop(0.8, 'rgba(127, 29, 29, 0.75)');
    bgGrad.addColorStop(1, 'rgba(45, 10, 15, 0.96)');
  } else if (compassStatus === 'blind') {
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.96)');
    bgGrad.addColorStop(0.2, 'rgba(51, 65, 85, 0.75)');
    bgGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.55)');
    bgGrad.addColorStop(0.8, 'rgba(51, 65, 85, 0.75)');
    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
  } else {
    bgGrad.addColorStop(0, 'rgba(8, 14, 26, 0.95)');
    bgGrad.addColorStop(0.15, 'rgba(15, 23, 42, 0.7)');
    bgGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.45)');
    bgGrad.addColorStop(0.85, 'rgba(15, 23, 42, 0.7)');
    bgGrad.addColorStop(1, 'rgba(8, 14, 26, 0.95)');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Player Heading in Degrees
  const headingRad = normAngle(playerState.angle + Math.PI / 2);
  let headingDeg = ((headingRad * 180 / Math.PI) + 360) % 360;

  // Distort heading if compass is compromised
  if (compassStatus === 'corrupted') {
    const corruptSpin = Math.sin(Date.now() * 0.008) * 180 + (Math.random() - 0.5) * 35;
    headingDeg = (headingDeg + corruptSpin + 720) % 360;
  } else if (compassStatus === 'blind') {
    const fogSpin = (Date.now() * 0.015) % 360;
    headingDeg = (headingDeg + fogSpin) % 360;
  } else if (compassStatus === 'jitter') {
    const jitter = Math.sin(Date.now() * 0.04) * 18 + (Math.random() - 0.5) * 10;
    headingDeg = (headingDeg + jitter + 360) % 360;
  }

  // Total FOV span across the bar = 160 degrees (+/- 80 deg)
  const FOV_SPAN = 160;
  const pixelsPerDeg = w / FOV_SPAN;
  const cx = w / 2;
  const baseLineY = h - 6;

  // Baseline
  ctx.strokeStyle = (compassStatus === 'corrupted') 
    ? 'rgba(239, 68, 68, 0.65)' 
    : (compassStatus === 'blind' ? 'rgba(148, 163, 184, 0.45)' : 'rgba(217, 119, 6, 0.45)');
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12, baseLineY);
  ctx.lineTo(w - 12, baseLineY);
  ctx.stroke();

  // Compass Distortions Banner Tag
  if (compassStatus === 'corrupted') {
    ctx.font = 'bold 7px "Cinzel", monospace';
    ctx.fillStyle = '#f87171';
    ctx.textAlign = 'center';
    ctx.fillText("[KOMPAS DIRASUKI - MALFUNGSI TOTAL]", cx, 8);
  } else if (compassStatus === 'blind') {
    ctx.font = 'bold 7px "Cinzel", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText("[KABUT PADAT - HILANG ARAH]", cx, 8);
  } else if (compassStatus === 'jitter') {
    ctx.font = 'bold 7px "Cinzel", monospace';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText("[INTERFERENSI MAGNETIK]", cx, 8);
  }

  // Cardinal point names
  const CARDINALS = {
    0: 'N',
    45: 'NE',
    90: 'E',
    135: 'SE',
    180: 'S',
    225: 'SW',
    270: 'W',
    315: 'NW',
    360: 'N'
  };

  const startDeg = Math.floor((headingDeg - 85) / 5) * 5;
  const endDeg = headingDeg + 85;

  ctx.textAlign = 'center';

  for (let d = startDeg; d <= endDeg; d += 5) {
    const degNorm = ((d % 360) + 360) % 360;
    const diff = d - headingDeg;
    const x = cx + diff * pixelsPerDeg;
    if (x < 10 || x > w - 10) continue;

    const isCardinal = (degNorm % 45 === 0);
    const isMedium = (degNorm % 15 === 0);

    if (isCardinal) {
      // Major cardinal tick
      ctx.strokeStyle = (compassStatus === 'corrupted') ? '#fca5a5' : '#fef08a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x, baseLineY);
      ctx.lineTo(x, baseLineY - 9);
      ctx.stroke();

      // Cardinal letter
      const label = (compassStatus === 'corrupted' && Math.random() < 0.25) ? '?' : (CARDINALS[degNorm] || `${degNorm}°`);
      ctx.font = 'bold 9px "Cinzel", sans-serif';
      ctx.fillStyle = (compassStatus === 'corrupted') 
        ? '#f87171' 
        : (degNorm === 0 ? '#ef4444' : (compassStatus === 'blind' ? '#cbd5e1' : '#fde68a'));
      ctx.fillText(label, x, baseLineY - 12);
    } else if (isMedium) {
      // Medium tick
      ctx.strokeStyle = (compassStatus === 'corrupted') ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x, baseLineY);
      ctx.lineTo(x, baseLineY - 6);
      ctx.stroke();
    } else {
      // Minor tick
      ctx.strokeStyle = (compassStatus === 'corrupted') ? 'rgba(185, 28, 28, 0.35)' : 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, baseLineY);
      ctx.lineTo(x, baseLineY - 3.5);
      ctx.stroke();
    }
  }

  // If compass is corrupted or blinded by dense fog, POI markers are completely disabled!
  if (compassStatus === 'corrupted' || compassStatus === 'blind') {
    ctx.restore();
    return;
  }

  // In thunderstorm jitter, POI markers intermittently flicker
  const poiFlicker = (compassStatus === 'jitter') && (Math.random() < 0.48);
  if (poiFlicker) {
    ctx.restore();
    return;
  }

  // =========================================================================
  // VECTOR POI MARKERS (ENEMIES, PORTS, TREASURE, MERCHANTS) - NO EMOJIS!
  // =========================================================================

  const FOV_RAD = (FOV_SPAN * 0.5) * (Math.PI / 180); // ~80 degrees

  // 1. Nearest Enemy Ship Marker (Vector Skull + Distance in Meters)
  let nearestEnemy = null;
  let nearestEnemyDist = 999999;
  if (entities.enemies && entities.enemies.length > 0) {
    for (let i = 0; i < entities.enemies.length; i++) {
      const e = entities.enemies[i];
      if (e.hp <= 0) continue;
      const d = Math.hypot(e.x - playerState.x, e.y - playerState.y);
      if (d < nearestEnemyDist && d < 1200) {
        nearestEnemyDist = d;
        nearestEnemy = e;
      }
    }
  }

  if (nearestEnemy) {
    const eAngle = Math.atan2(nearestEnemy.y - playerState.y, nearestEnemy.x - playerState.x);
    const angleDiff = normAngle(eAngle - playerState.angle);
    if (Math.abs(angleDiff) < FOV_RAD) {
      const px = cx + (angleDiff / FOV_RAD) * (w * 0.46);
      if (px >= 18 && px <= w - 18) {
        drawVectorSkull(ctx, px, 14, 9, '#ef4444');
        ctx.font = 'bold 7.5px "Plus Jakarta Sans", monospace';
        ctx.fillStyle = '#f87171';
        ctx.fillText(`${Math.round(nearestEnemyDist)}`, px, 6);
      }
    }
  }

  // 2. Nearest Port / Island Marker (Vector Anchor + Distance in Meters)
  let nearestPort = null;
  let nearestPortDist = 999999;
  for (let i = 0; i < WORLD_ISLANDS.length; i++) {
    const isl = WORLD_ISLANDS[i];
    if (!isl.isHomePort && !isl.isShopIsland && !isl.isConquered) continue;
    const d = Math.hypot(isl.x - playerState.x, isl.y - playerState.y);
    if (d < nearestPortDist && d < 2400) {
      nearestPortDist = d;
      nearestPort = isl;
    }
  }

  if (nearestPort) {
    const pAngle = Math.atan2(nearestPort.y - playerState.y, nearestPort.x - playerState.x);
    const angleDiff = normAngle(pAngle - playerState.angle);
    if (Math.abs(angleDiff) < FOV_RAD) {
      const px = cx + (angleDiff / FOV_RAD) * (w * 0.46);
      if (px >= 18 && px <= w - 18) {
        const portColor = nearestPort.isHomePort ? '#38bdf8' : (nearestPort.isShopIsland ? '#10b981' : '#facc15');
        drawVectorAnchor(ctx, px, 14, 9, portColor);
        ctx.font = 'bold 7.5px "Plus Jakarta Sans", monospace';
        ctx.fillStyle = portColor;
        ctx.fillText(`${Math.round(nearestPortDist)}`, px, 6);
      }
    }
  }

  // 3. Active Treasure Hint Marker (Vector Chest + Distance)
  if (typeof activeTreasureHint !== 'undefined' && activeTreasureHint) {
    const tDist = Math.hypot(activeTreasureHint.x - playerState.x, activeTreasureHint.y - playerState.y);
    const tAngle = Math.atan2(activeTreasureHint.y - playerState.y, activeTreasureHint.x - playerState.x);
    const angleDiff = normAngle(tAngle - playerState.angle);
    if (Math.abs(angleDiff) < FOV_RAD) {
      const px = cx + (angleDiff / FOV_RAD) * (w * 0.46);
      if (px >= 18 && px <= w - 18) {
        drawVectorChest(ctx, px, 14, 9, '#fbbf24');
        ctx.font = 'bold 7.5px "Plus Jakarta Sans", monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${Math.round(tDist)}`, px, 6);
      }
    }
  }

  // 4. Nearest Merchant Vessel Marker (Vector Cog Ship + Distance)
  if (entities.merchants && entities.merchants.length > 0) {
    let nearM = null;
    let nearMDist = 550;
    for (let i = 0; i < entities.merchants.length; i++) {
      const m = entities.merchants[i];
      const d = Math.hypot(m.x - playerState.x, m.y - playerState.y);
      if (d < nearMDist) {
        nearMDist = d;
        nearM = m;
      }
    }
    if (nearM) {
      const mAngle = Math.atan2(nearM.y - playerState.y, nearM.x - playerState.x);
      const angleDiff = normAngle(mAngle - playerState.angle);
      if (Math.abs(angleDiff) < FOV_RAD) {
        const px = cx + (angleDiff / FOV_RAD) * (w * 0.46);
        if (px >= 18 && px <= w - 18) {
          drawVectorShip(ctx, px, 14, 9, '#38bdf8');
          ctx.font = 'bold 7.5px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`${Math.round(nearMDist)}`, px, 6);
        }
      }
    }
  }

  ctx.restore();
}

/* ==========================================================================
   CIRCULAR MOBILE JOYSTICK HP RING & DESKTOP HP UPDATES
   ========================================================================== */

function updateHealthMeters(roundedHp, maxHp) {
  const hpPercent = Math.max(0, (playerState.hp / maxHp) * 100);
  const hpFrac = Math.max(0, Math.min(1, playerState.hp / maxHp));

  // 1. Desktop / PC Hull Gauge
  if (elHpBar) elHpBar.style.width = `${hpPercent}%`;
  if (elHpNumericText) elHpNumericText.innerText = `${roundedHp}/${maxHp}`;

  // 2. Mobile Circular Progress Ring around Joystick
  if (!elJoystickHpCircle) elJoystickHpCircle = document.getElementById('joystickHpCircle');
  if (!elMobileHpText) elMobileHpText = document.getElementById('mobileHpText');

  if (elJoystickHpCircle) {
    const circumference = 339.29; // 2 * PI * 54
    const offset = circumference * (1 - hpFrac);
    elJoystickHpCircle.style.strokeDashoffset = `${offset}`;

    if (hpFrac > 0.5) {
      elJoystickHpCircle.style.stroke = '#10b981'; // Emerald
      elJoystickHpCircle.classList.remove('hp-ring-danger');
    } else if (hpFrac > 0.25) {
      elJoystickHpCircle.style.stroke = '#f59e0b'; // Amber
      elJoystickHpCircle.classList.remove('hp-ring-danger');
    } else {
      elJoystickHpCircle.style.stroke = '#ef4444'; // Crimson
      elJoystickHpCircle.classList.add('hp-ring-danger');
    }
  }

  if (elMobileHpText) {
    elMobileHpText.innerText = `${roundedHp}/${maxHp}`;
    if (hpFrac <= 0.25) {
      elMobileHpText.className = "text-rose-400 font-mono font-black animate-pulse";
    } else if (hpFrac <= 0.5) {
      elMobileHpText.className = "text-amber-300 font-mono font-bold";
    } else {
      elMobileHpText.className = "text-emerald-400 font-mono font-bold";
    }
  }

  // Quick repair button status
  const btnRepair = document.getElementById('btnMobileRepair');
  if (btnRepair) {
    if (roundedHp < maxHp && playerState.gold >= 15) {
      btnRepair.classList.add('border-emerald-400', 'animate-pulse');
      btnRepair.classList.remove('opacity-50');
    } else {
      btnRepair.classList.remove('border-emerald-400', 'animate-pulse');
      if (roundedHp >= maxHp) btnRepair.classList.add('opacity-50');
    }
  }

  if (typeof updateShipyardRepairButton === 'function') {
    updateShipyardRepairButton();
  }
}

/* ==========================================================================
   PRIMARY HUD LOOP DISPATCHER
   ========================================================================== */

function updateHUD() {
  if (!elHpBar) initHUDElements();

  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  const roundedHp = Math.round(playerState.hp);
  if (roundedHp !== lastHpDisplay || maxHp !== lastMaxHpDisplay) {
    lastHpDisplay = roundedHp;
    lastMaxHpDisplay = maxHp;
    updateHealthMeters(roundedHp, maxHp);
  }

  if (playerState.gold !== lastGoldDisplay) {
    lastGoldDisplay = playerState.gold;
    if (elGoldText) elGoldText.innerText = playerState.gold.toLocaleString('id-ID');
  }

  if (playerState.bloodEssence !== lastBloodDisplay) {
    lastBloodDisplay = playerState.bloodEssence;
    if (elBloodText) elBloodText.innerText = playerState.bloodEssence.toLocaleString('id-ID');
  }

  const dist = Math.floor(Math.hypot(playerState.x, playerState.y));
  if (dist !== lastDistDisplay) {
    lastDistDisplay = dist;
    if (elDistText) elDistText.innerText = `${dist}m`;
  }

  // Render Horizontal Nautical Compass Bar
  renderCompassBar();

  const biome = getBiomeInfo(dist);
  if (biome.name !== lastZoneName) {
    lastZoneName = biome.name;
    if (elZoneInd) {
      elZoneInd.innerText = biome.name;
      elZoneInd.className = `text-[7.5px] sm:text-[8.5px] font-bold px-2 py-0.2 rounded-full border truncate max-w-[120px] text-center ${biome.isBloodSea ? 'bg-red-950 text-red-300 border-red-500 animate-pulse' : 'bg-slate-950/85 text-sky-300 border-sky-600/30'}`;
    }
  }

  const tier = getShipTier();
  if (tier.rank !== lastShipRank) {
    lastShipRank = tier.rank;
    if (elShipTitle) {
      elShipTitle.innerText = tier.name;
      elShipTitle.style.color = tier.color;
    }
    if (elShipRankBadge) {
      elShipRankBadge.innerText = tier.rank;
    }
  }

  // Update Stealth UI Meter only on changes
  const stealthPercent = Math.round(highestDetectionLevel * 100);
  if (stealthPercent !== lastStealthPercent) {
    lastStealthPercent = stealthPercent;
    if (elStealthBar) elStealthBar.style.width = `${stealthPercent}%`;
    if (elStealthPercentLabel) elStealthPercentLabel.innerText = `${stealthPercent}%`;
  }

  let currentStealthState = 'safe';
  if (stealthPercent >= 100) currentStealthState = 'detected';
  else if (stealthPercent > 10) currentStealthState = 'warn';

  if (currentStealthState !== lastStealthState) {
    lastStealthState = currentStealthState;
    if (elStealthIcon) elStealthIcon.innerHTML = STEALTH_ICONS[currentStealthState];
    if (elStealthLabel) {
      if (currentStealthState === 'detected') {
        elStealthLabel.innerText = 'AWAS!';
        elStealthLabel.className = 'text-rose-400 font-bold truncate';
        if (elStealthBar) elStealthBar.className = 'bg-rose-600 h-full transition-all duration-150';
      } else if (currentStealthState === 'warn') {
        elStealthLabel.innerText = 'Waspada';
        elStealthLabel.className = 'text-amber-400 font-bold truncate';
        if (elStealthBar) elStealthBar.className = 'bg-amber-500 h-full transition-all duration-150';
      } else {
        elStealthLabel.innerText = 'Aman';
        elStealthLabel.className = 'text-emerald-400 font-bold truncate';
        if (elStealthBar) elStealthBar.className = 'bg-emerald-500 h-full transition-all duration-150';
      }
    }
  }

  // =========================================================================
  // CONTEXTUAL DOCK SHOP BUTTON UPDATE
  // Appears ONLY when docked at safe harbor, shop island, or conquered port
  // =========================================================================
  if (!elDockShopAction) elDockShopAction = document.getElementById('dockShopAction');
  if (!elDockShopSubtitle) elDockShopSubtitle = document.getElementById('dockShopSubtitle');

  if (playerState.isDockedAtPort !== lastDockedState) {
    lastDockedState = playerState.isDockedAtPort;
    if (elDockShopAction) {
      if (playerState.isDockedAtPort && playerState.dockedPort) {
        elDockShopAction.classList.remove('hidden');
        if (elDockShopSubtitle) {
          elDockSubtitle.innerText = `Berlabuh di ${playerState.dockedPort.name}`;
        }
      } else {
        elDockShopAction.classList.add('hidden');
      }
    }
  }
}

