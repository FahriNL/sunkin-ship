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
let elCargoWidget = null;
let elCargoCountText = null;
let elCargoFillBar = null;
let elCargoMiniPips = null;

// New Phase 2 Telemetry & Action Hotbar Cached Elements
let elWeatherWidget = null;
let elWeatherIcon = null;
let elWeatherName = null;
let elWeatherTimer = null;
let elWeatherTooltipTitle = null;
let elWeatherTooltipTimer = null;
let elWeatherTooltipDesc = null;
let elKnotSpeedText = null;
let elThrottleStateText = null;
let elPcKnotSpeed = null;
let elPcThrottleStatus = null;
let elMobileSpeedText = null;
let elSlotFireCooldown = null;
let elSlotMineCooldown = null;
let elActionSlotMine = null;
let elActionSlotSalvage = null;
let elActionSlotRepair = null;
let elMobileFireCooldownSvg = null;
let elMobileFireCooldownCircle = null;
let elBtnMobileMine = null;
let elBtnMobileSalvage = null;

// Day/Night Cycle Astrolabe Celestial Clock Elements
let elAstrolabeClockWidget = null;
let elClockCelestialIcon = null;
let elSvgSunIcon = null;
let elSvgMoonIcon = null;
let elClockTimeText = null;
let elClockPhaseBadge = null;
let elClockTooltipPhase = null;
let elClockTooltipTime = null;
let elClockTooltipDesc = null;

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
let lastCargoSignature = '';
let lastSpeedRounded = -1;
let lastThrottleStr = '';
let lastWeatherType = '';
let lastWeatherTimerStr = '';
let lastHudLang = '';

const WEATHER_SVGS = {
  clear: `<svg class="w-3 h-3 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  overcast: `<svg class="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  rain: `<svg class="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  gale: `<svg class="w-3 h-3 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7A7.1 7.1 0 1 1 5 10.8"/><path d="m18 10 4-4-4-4"/><path d="M4 14h12a4 4 0 0 1 4 4c0 1.1-.9 2-2 2H8"/><path d="m14 18 4 4-4-4"/></svg>`,
  storm: `<svg class="w-3 h-3 text-cyan-300 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><polyline points="13 14 10 18 14 18 11 22"/></svg>`,
  thunderstorm: `<svg class="w-3 h-3 text-amber-400 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  fog: `<svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="16" x2="18" y2="16"/></svg>`,
  blood_squall: `<svg class="w-3 h-3 text-rose-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
};

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
  elCargoWidget = document.getElementById('hudCargoHoldWidget');
  elCargoCountText = document.getElementById('hudCargoCountText');
  elCargoFillBar = document.getElementById('hudCargoFillBar');
  elCargoMiniPips = document.getElementById('hudCargoMiniPips');

  // Phase 2 Elements
  elWeatherWidget = document.getElementById('weatherWidget');
  elWeatherIcon = document.getElementById('weatherIcon');
  elWeatherName = document.getElementById('weatherName');
  elWeatherTimer = document.getElementById('weatherTimer');
  elWeatherTooltipTitle = document.getElementById('weatherTooltipTitle');
  elWeatherTooltipTimer = document.getElementById('weatherTooltipTimer');
  elWeatherTooltipDesc = document.getElementById('weatherTooltipDesc');
  elKnotSpeedText = document.getElementById('knotSpeedText');
  elThrottleStateText = document.getElementById('throttleStateText');
  elPcKnotSpeed = document.getElementById('pcKnotSpeed');
  elPcThrottleStatus = document.getElementById('pcThrottleStatus');
  elMobileSpeedText = document.getElementById('mobileSpeedText');
  elSlotFireCooldown = document.getElementById('slotFireCooldown');
  elSlotMineCooldown = document.getElementById('slotMineCooldown');
  elActionSlotMine = document.getElementById('actionSlotMine');
  elActionSlotSalvage = document.getElementById('actionSlotSalvage');
  elActionSlotRepair = document.getElementById('actionSlotRepair');
  elMobileFireCooldownSvg = document.getElementById('mobileFireCooldownSvg');
  elMobileFireCooldownCircle = document.getElementById('mobileFireCooldownCircle');
  elBtnMobileMine = document.getElementById('btnMobileMine');
  elBtnMobileSalvage = document.getElementById('btnMobileSalvage');

  // Cache Day/Night Astrolabe Clock Elements
  elAstrolabeClockWidget = document.getElementById('astrolabeClockWidget');
  elClockCelestialIcon = document.getElementById('clockCelestialIcon');
  elSvgSunIcon = document.getElementById('svgSunIcon');
  elSvgMoonIcon = document.getElementById('svgMoonIcon');
  elClockTimeText = document.getElementById('clockTimeText');
  elClockPhaseBadge = document.getElementById('clockPhaseBadge');
  elClockTooltipPhase = document.getElementById('clockTooltipPhase');
  elClockTooltipTime = document.getElementById('clockTooltipTime');
  elClockTooltipDesc = document.getElementById('clockTooltipDesc');

  if (elAstrolabeClockWidget) {
    elAstrolabeClockWidget.addEventListener('click', () => {
      // Quick jump dev control or audio bell
      if (typeof sound !== 'undefined' && sound.playClick) sound.playClick();
    });
  }

  if (elCargoWidget) {
    elCargoWidget.addEventListener('click', () => {
      if (typeof toggleInventoryModal === 'function') toggleInventoryModal();
    });
  }
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

let cachedCompassWidth = 0;
let cachedCompassHeight = 0;
let compassRectDirty = true;
window.addEventListener('resize', () => { compassRectDirty = true; });

function drawCompassShipIcon(ctx, x, y, size = 11, color = '#38bdf8') {
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

  if (compassRectDirty || cachedCompassWidth <= 0 || cachedCompassHeight <= 0) {
    const rect = elCompassCanvas.getBoundingClientRect();
    cachedCompassWidth = rect.width || 340;
    cachedCompassHeight = rect.height || 36;
    compassRectDirty = false;
  }
  const w = cachedCompassWidth;
  const h = cachedCompassHeight;
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
  const norm = (typeof normAngle === 'function') ? normAngle : (a => {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  });
  const headingRad = norm(playerState.angle + Math.PI / 2);
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
          drawCompassShipIcon(ctx, px, 14, 9, '#38bdf8');
          ctx.font = 'bold 7.5px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`${Math.round(nearMDist)}`, px, 6);
        }
      }
    }
  }

  // 5. Custom Waypoint Navigation Pin Marker on Compass Bar
  if (playerState.waypointPin) {
    const pin = playerState.waypointPin;
    const pinDist = Math.hypot(pin.x - playerState.x, pin.y - playerState.y);
    const pinAngle = Math.atan2(pin.y - playerState.y, pin.x - playerState.x);
    const angleDiff = normAngle(pinAngle - playerState.angle);

    // Check arrival at waypoint pin (< 75px)
    if (pinDist < 75) {
      playerState.waypointPin = null;
      showToast(typeof t === 'function' ? t('toastPinArrived') : "Tiba di Titik Tujuan Pin Navigasi!", "gold");
      if (typeof sound !== 'undefined' && typeof sound.playQuestComplete === 'function') {
        sound.playQuestComplete();
      }
    } else if (Math.abs(angleDiff) < FOV_RAD) {
      // Pin is directly within the forward compass field of view!
      const px = cx + (angleDiff / FOV_RAD) * (w * 0.46);
      if (px >= 18 && px <= w - 18) {
        ctx.save();
        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.ellipse(px, 21, 3.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pin Body
        ctx.fillStyle = '#f43f5e';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(px, 20); // Tip pointing down
        ctx.lineTo(px - 4, 11);
        ctx.arc(px, 11, 4, Math.PI, 0, false);
        ctx.lineTo(px, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gold center dot
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(px, 11, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Distance text
        ctx.font = 'bold 7.5px "Plus Jakarta Sans", monospace';
        ctx.fillStyle = '#fda4af';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(pinDist)}m`, px, 5);
        ctx.restore();
      }
    } else {
      // Pin is outside forward FOV: draw edge navigation indicator pointing left or right
      const isRight = angleDiff > 0;
      const arrowX = isRight ? (w - 18) : 18;
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      if (isRight) {
        ctx.moveTo(arrowX - 4, 10);
        ctx.lineTo(arrowX + 4, 15);
        ctx.lineTo(arrowX - 4, 20);
      } else {
        ctx.moveTo(arrowX + 4, 10);
        ctx.lineTo(arrowX - 4, 15);
        ctx.lineTo(arrowX + 4, 20);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 7px "Plus Jakarta Sans", monospace';
      ctx.fillStyle = '#fda4af';
      ctx.textAlign = isRight ? 'right' : 'left';
      ctx.fillText(`PIN ${Math.round(pinDist)}m`, isRight ? (arrowX - 7) : (arrowX + 7), 16);
      ctx.restore();
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
  if (typeof isGameStarted !== 'undefined' && !isGameStarted) return;
  if (!elHpBar) initHUDElements();

  const curLang = (typeof currentLanguage !== 'undefined' && currentLanguage) ? currentLanguage : 'id';
  if (curLang !== lastHudLang) {
    lastHudLang = curLang;
    lastZoneName = '';
    lastShipRank = -1;
    lastStealthState = '';
    lastThrottleStr = '';
    lastWeatherType = '';
    lastWeatherTimerStr = '';
    lastDockedState = !playerState.isDockedAtPort;
  }

  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  const roundedHp = Math.round(playerState.hp);
  if (roundedHp !== lastHpDisplay || maxHp !== lastMaxHpDisplay) {
    lastHpDisplay = roundedHp;
    lastMaxHpDisplay = maxHp;
    updateHealthMeters(roundedHp, maxHp);
  }

  if (playerState.gold !== lastGoldDisplay) {
    lastGoldDisplay = playerState.gold;
    if (elGoldText) elGoldText.innerText = playerState.gold.toLocaleString(curLang === 'en' ? 'en-US' : 'id-ID');
  }

  if (playerState.bloodEssence !== lastBloodDisplay) {
    lastBloodDisplay = playerState.bloodEssence;
    if (elBloodText) elBloodText.innerText = playerState.bloodEssence.toLocaleString(curLang === 'en' ? 'en-US' : 'id-ID');
  }

  // Update exterior nautical cargo hold widget
  if (playerState.resources) {
    const resCount = Object.keys(playerState.resources).filter(k => (playerState.resources[k] || 0) > 0).length;
    const cannonCount = (playerState.cannonInventory || []).length;
    const occupied = resCount + cannonCount;
    const maxSlots = typeof MAX_CARGO_SLOTS !== 'undefined' ? MAX_CARGO_SLOTS : 16;

    const activeKeys = Object.keys(playerState.resources)
      .filter(k => (playerState.resources[k] || 0) > 0)
      .sort((a, b) => (playerState.resources[b] || 0) - (playerState.resources[a] || 0))
      .slice(0, 3);
    const cargoSignature = `${occupied}/${maxSlots}|` + activeKeys.map(k => `${k}:${playerState.resources[k]}`).join(',');

    if (cargoSignature !== lastCargoSignature) {
      lastCargoSignature = cargoSignature;
      if (elCargoCountText) elCargoCountText.innerText = `${occupied}/${maxSlots}`;
      if (elCargoFillBar) {
        const pct = Math.min(100, Math.round((occupied / maxSlots) * 100));
        elCargoFillBar.style.width = `${pct}%`;
        if (occupied >= maxSlots) {
          elCargoFillBar.className = "bg-gradient-to-r from-red-600 via-rose-500 to-red-400 h-full transition-[width] duration-200";
        } else {
          elCargoFillBar.className = "bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 h-full transition-[width] duration-200";
        }
      }

      if (elCargoMiniPips) {
        let pipsHtml = '';
        for (const k of activeKeys) {
          const resDef = typeof RESOURCE_TYPES !== 'undefined' && RESOURCE_TYPES[k];
          const iconSvg = resDef && SVG_ICONS && SVG_ICONS[resDef.iconKey || k] ? SVG_ICONS[resDef.iconKey || k] : '';
          const count = playerState.resources[k];
          const resName = resDef ? ((curLang === 'en' && resDef.nameEn) ? resDef.nameEn : resDef.name) : k;
          pipsHtml += `<div class="flex items-center gap-0.5 text-[8.5px] font-mono font-bold text-amber-200/90" title="${resName}: ${count}"><span class="w-3.5 h-3.5 flex items-center justify-center shrink-0">${iconSvg}</span><span>${count}</span></div>`;
        }
        elCargoMiniPips.innerHTML = pipsHtml;
      }

      // If inventory modal happens to be open when cargo changes (e.g. looted something), update it once
      const invModal = document.getElementById('inventoryModal');
      if (invModal && invModal.classList.contains('modal-active') && typeof renderInventoryUI === 'function') {
        renderInventoryUI();
      }
    }
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
  if (tier.rank !== lastShipRank || tier.name !== (elShipTitle ? elShipTitle.innerText : '')) {
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
        elStealthLabel.innerText = t('stealthDetected');
        elStealthLabel.className = 'text-rose-400 font-bold truncate';
        if (elStealthBar) elStealthBar.className = 'bg-rose-600 h-full transition-all duration-150';
      } else if (currentStealthState === 'warn') {
        elStealthLabel.innerText = t('stealthWarn');
        elStealthLabel.className = 'text-amber-400 font-bold truncate';
        if (elStealthBar) elStealthBar.className = 'bg-amber-500 h-full transition-all duration-150';
      } else {
        elStealthLabel.innerText = t('stealthSafe');
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

  const isFlightActive = !!(window.cinematicFlightState && window.cinematicFlightState.active);
  const isDead = (playerState.hp <= 0);
  const isInitialCleanPort = (playerState.hasDepartedInitialPort === false);

  if (isFlightActive || isDead || isInitialCleanPort) {
    if (elDockShopAction) elDockShopAction.classList.add('hidden');
    lastDockedState = false;
  } else if (playerState.isDockedAtPort !== lastDockedState) {
    lastDockedState = playerState.isDockedAtPort;
    if (elDockShopAction) {
      if (playerState.isDockedAtPort && playerState.dockedPort) {
        elDockShopAction.classList.remove('hidden');
        if (elDockShopSubtitle) {
          elDockShopSubtitle.innerText = t('dockedAt', { port: playerState.dockedPort.name });
        }
      } else {
        elDockShopAction.classList.add('hidden');
      }
    }
  }

  // =========================================================================
  // PHASE 2: SPEEDOMETER, WEATHER INTEL & ACTION HOTBAR TICK
  // =========================================================================

  // 1. Knot Speedometer & Throttle Status
  const speedKts = Math.hypot(playerState.vx, playerState.vy) * 2.8;
  const speedRounded = Math.round(speedKts * 10) / 10;
  if (speedRounded !== lastSpeedRounded) {
    lastSpeedRounded = speedRounded;
    const speedStr = `${speedRounded.toFixed(1)} Kts`;
    if (elKnotSpeedText) elKnotSpeedText.innerText = speedStr;
    if (elPcKnotSpeed) elPcKnotSpeed.innerText = speedStr;
    if (elMobileSpeedText) elMobileSpeedText.innerText = speedStr;
  }

  let throttleStr = t('throttleNeutral');
  if (typeof pcNavalState !== 'undefined' && pcNavalState.boost) {
    throttleStr = t('throttleBoost');
  } else if (speedKts > 5.5) {
    throttleStr = t('throttleFull');
  } else if (speedKts > 1.0) {
    throttleStr = t('throttleHalf');
  } else if (typeof pcNavalState !== 'undefined' && pcNavalState.stealth) {
    throttleStr = t('throttleStealth');
  }
  if (throttleStr !== lastThrottleStr) {
    lastThrottleStr = throttleStr;
    if (elThrottleStateText) elThrottleStateText.innerText = throttleStr;
    if (elPcThrottleStatus) elPcThrottleStatus.innerText = throttleStr;
  }

  // 2. AAA Weather Intelligence Widget
  if (typeof weatherState !== 'undefined') {
    const wType = weatherState.type || 'clear';
    const cfg = (typeof WEATHER_CONFIGS !== 'undefined' && WEATHER_CONFIGS[wType]) ? WEATHER_CONFIGS[wType] : { name: 'Laut Tenang', nameEn: 'Calm Seas', subtext: 'Perairan bersahabat', subtextEn: 'Friendly waters' };
    const isEn = (curLang === 'en');
    const wName = (isEn && cfg.nameEn) ? cfg.nameEn : (cfg.name || t('weatherClearName'));
    const wDesc = (isEn && cfg.subtextEn) ? cfg.subtextEn : (cfg.subtext || t('weatherClearDesc'));

    let rem = 0;
    if (wType === 'clear') {
      rem = Math.max(0, Math.ceil(weatherState.cooldown || 0));
    } else {
      rem = Math.max(0, Math.ceil(weatherState.timer || 0));
    }
    const mins = Math.floor(rem / 60);
    const secs = rem % 60;
    const timerStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    if (wType !== lastWeatherType) {
      lastWeatherType = wType;
      if (elWeatherIcon) elWeatherIcon.innerHTML = WEATHER_SVGS[wType] || WEATHER_SVGS.clear;
      if (elWeatherName) {
        elWeatherName.innerText = wName;
        elWeatherName.style.color = cfg.color || '#38bdf8';
      }
      if (elWeatherTooltipTitle) elWeatherTooltipTitle.innerText = wName;
      if (elWeatherTooltipDesc) elWeatherTooltipDesc.innerText = wDesc;
    }

    if (timerStr !== lastWeatherTimerStr) {
      lastWeatherTimerStr = timerStr;
      if (elWeatherTimer) elWeatherTimer.innerText = timerStr;
      if (elWeatherTooltipTimer) elWeatherTooltipTimer.innerText = t('weatherRemaining', { time: timerStr });
    }
  }

  // 2b. Day/Night Cycle Astrolabe Celestial Clock Widget
  if (typeof dayNightState !== 'undefined') {
    const timeHours = (dayNightState.time !== undefined) ? dayNightState.time : 8.0;
    const hours = Math.floor(timeHours) % 24;
    const mins = Math.floor((timeHours % 1) * 60);
    const timeStr = `${hours < 10 ? '0' : ''}${hours}:${mins < 10 ? '0' : ''}${mins}`;
    
    if (elClockTimeText && elClockTimeText.innerText !== timeStr) {
      elClockTimeText.innerText = timeStr;
    }

    const phaseId = dayNightState.phaseId || 'morning';
    const phaseKey = `timePhase_${phaseId}`;
    const phaseDescKey = `timeDesc_${phaseId}`;
    const phaseName = (typeof t === 'function') ? t(phaseKey) : phaseId.toUpperCase();
    const phaseDesc = (typeof t === 'function') ? t(phaseDescKey) : '';

    if (elClockPhaseBadge && elClockPhaseBadge.innerText !== phaseName) {
      elClockPhaseBadge.innerText = phaseName;
    }

    // Toggle Sun vs Moon Icon and smooth rotation
    const isDay = dayNightState.isDay;
    if (elSvgSunIcon && elSvgMoonIcon) {
      if (isDay) {
        if (elSvgSunIcon.classList.contains('hidden')) elSvgSunIcon.classList.remove('hidden');
        if (!elSvgMoonIcon.classList.contains('hidden')) elSvgMoonIcon.classList.add('hidden');
      } else {
        if (!elSvgSunIcon.classList.contains('hidden')) elSvgSunIcon.classList.add('hidden');
        if (elSvgMoonIcon.classList.contains('hidden')) elSvgMoonIcon.classList.remove('hidden');
      }
    }

    // Astrolabe Dial rotation: sun rises at 06:00 (0 deg), noon at 12:00 (90 deg), sunset at 18:00 (180 deg), midnight at 00:00 (270 deg)
    if (elClockCelestialIcon) {
      const dialDeg = ((timeHours - 6.0 + 24.0) % 24.0) * 15.0; // 360 / 24 = 15 deg per hour
      elClockCelestialIcon.style.transform = `rotate(${dialDeg.toFixed(1)}deg)`;
    }

    if (elClockTooltipPhase) elClockTooltipPhase.innerText = phaseName;
    if (elClockTooltipTime) elClockTooltipTime.innerText = timeStr;
    if (elClockTooltipDesc) elClockTooltipDesc.innerText = phaseDesc;
  }

  // 3. Action Hotbar Slot 1: Broadside Cannon Cooldown
  const reloadDelay = Math.max(0.35, 1.3 - (playerState.upgrades.speed - 1) * 0.1);
  const fireElapsed = (Date.now() / 1000) - lastFireTime;
  const fireFrac = Math.max(0, Math.min(1, fireElapsed / reloadDelay));
  if (elSlotFireCooldown) {
    if (fireFrac < 1) {
      elSlotFireCooldown.style.opacity = '1';
      const deg = Math.floor((1 - fireFrac) * 360);
      elSlotFireCooldown.style.background = `conic-gradient(rgba(0,0,0,0.78) ${deg}deg, transparent 0deg)`;
    } else {
      elSlotFireCooldown.style.opacity = '0';
    }
  }
  if (elMobileFireCooldownSvg && elMobileFireCooldownCircle) {
    if (fireFrac < 1) {
      elMobileFireCooldownSvg.style.opacity = '1';
      const circ = 131.95;
      elMobileFireCooldownCircle.style.strokeDashoffset = `${circ * (1 - fireFrac)}`;
    } else {
      elMobileFireCooldownSvg.style.opacity = '0';
    }
  }

  // Action Hotbar Slot 2: Stern Chaser / Mine Cooldown & Unlock State
  const rearLvl = playerState.upgrades.rearDefense;
  if (elActionSlotMine) {
    if (rearLvl <= 0) {
      elActionSlotMine.classList.add('locked');
    } else {
      elActionSlotMine.classList.remove('locked');
      const rearElapsed = (Date.now() / 1000) - lastRearDefenseTime;
      const rearFrac = Math.max(0, Math.min(1, rearElapsed / 1.6));
      if (elSlotMineCooldown) {
        if (rearFrac < 1) {
          elSlotMineCooldown.style.opacity = '1';
          const deg = Math.floor((1 - rearFrac) * 360);
          elSlotMineCooldown.style.background = `conic-gradient(rgba(0,0,0,0.78) ${deg}deg, transparent 0deg)`;
        } else {
          elSlotMineCooldown.style.opacity = '0';
        }
      }
    }
  }
  if (elBtnMobileMine) {
    if (rearLvl <= 0) elBtnMobileMine.classList.add('opacity-40');
    else elBtnMobileMine.classList.remove('opacity-40');
  }

  // Action Hotbar Slot 3: Salvage Hook Proximity Glow
  let nearSalvage = false;
  if (entities.sunkenShips && entities.sunkenShips.some(s => !s.salvaged && Math.hypot(s.x - playerState.x, s.y - playerState.y) < 140)) {
    nearSalvage = true;
  } else if (entities.floatingLoots && entities.floatingLoots.some(l => Math.hypot(l.x - playerState.x, l.y - playerState.y) < 360)) {
    nearSalvage = true;
  }
  if (elActionSlotSalvage) {
    if (nearSalvage) elActionSlotSalvage.classList.add('salvage-ready-glow');
    else elActionSlotSalvage.classList.remove('salvage-ready-glow');
  }
  if (elBtnMobileSalvage) {
    if (nearSalvage) elBtnMobileSalvage.classList.add('border-sky-400', 'animate-pulse');
    else elBtnMobileSalvage.classList.remove('border-sky-400', 'animate-pulse');
  }

  // Action Hotbar Slot 5: Emergency Repair Readiness
  if (elActionSlotRepair) {
    if (roundedHp < maxHp && playerState.gold >= 15) {
      elActionSlotRepair.classList.add('border-emerald-400', 'animate-pulse');
    } else {
      elActionSlotRepair.classList.remove('border-emerald-400', 'animate-pulse');
    }
  }
}

/* ==========================================================================
   DYNAMIC CONTROLLER & KEYBOARD PROMPT GLYPH SYSTEM
   Swaps hotbar & telemetry badges smoothly based on active device
   ========================================================================== */
function updateInputPromptGlyphs(deviceType) {
  const isXbox = deviceType === 'gamepad_xbox';
  const isPS = deviceType === 'gamepad_ps';
  const isGamepad = isXbox || isPS;

  const bFire = document.getElementById('badgeFire');
  const bMine = document.getElementById('badgeMine');
  const bSalvage = document.getElementById('badgeSalvage');
  const bSpyglass = document.getElementById('badgeSpyglass');
  const bRepair = document.getElementById('badgeRepair');
  const bSteerKeys = document.getElementById('badgeSteerKeys');
  const pcSteerLabel = document.getElementById('pcSteerLabel');
  const bBoostKeys = document.getElementById('badgeBoostKeys');
  const pcBoostLabel = document.getElementById('pcBoostLabel');
  const bStealthKeys = document.getElementById('badgeStealthKeys');
  const pcStealthLabel = document.getElementById('pcStealthLabel');

  if (isGamepad) {
    if (bFire) {
      bFire.textContent = isXbox ? 'RT' : 'R2';
      bFire.className = 'kbd-badge font-bold px-1.5 py-0 mt-0.5 pointer-events-none bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm';
    }
    if (bMine) {
      bMine.textContent = isXbox ? 'RB' : 'R1';
      bMine.className = 'kbd-badge font-bold px-1.5 py-0 mt-0.5 pointer-events-none bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-sm';
    }
    if (bSalvage) {
      bSalvage.textContent = isXbox ? 'X' : '□';
      bSalvage.className = 'kbd-badge font-bold px-1.5 py-0 mt-0.5 pointer-events-none bg-sky-950/80 border-sky-500/50 text-sky-300 shadow-sm';
    }
    if (bSpyglass) {
      bSpyglass.textContent = isXbox ? 'Y' : '△';
      bSpyglass.className = 'kbd-badge font-bold px-1.5 py-0 mt-0.5 pointer-events-none bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-sm';
    }
    if (bRepair) {
      bRepair.textContent = isXbox ? 'LB' : 'L1';
      bRepair.className = 'kbd-badge font-bold px-1.5 py-0 mt-0.5 pointer-events-none bg-teal-950/80 border-teal-500/50 text-teal-300 shadow-sm';
    }
    if (bSteerKeys) {
      bSteerKeys.innerHTML = `<kbd class="kbd-badge font-bold px-1.5 py-0.5 bg-slate-800 border-slate-600 text-amber-300">${isXbox ? 'LS' : 'L-Stick'}</kbd><span class="text-slate-400 text-[8px] font-sans">/ D-Pad</span>`;
    }
    if (pcSteerLabel) {
      pcSteerLabel.textContent = typeof t === 'function' ? (t('steerJoystickLabel') || 'Joystick 360°') : 'Joystick 360°';
    }
    if (bBoostKeys) {
      bBoostKeys.innerHTML = `<kbd class="kbd-badge font-bold px-1.5 py-0.5 bg-amber-950/80 border-amber-500/50 text-amber-300">${isXbox ? 'LT' : 'L2'}</kbd>`;
    }
    if (pcBoostLabel) {
      pcBoostLabel.textContent = typeof t === 'function' ? (t('boostLabel') || 'Laju Cepat') : 'Laju Cepat';
    }
    if (bStealthKeys) {
      bStealthKeys.innerHTML = `<kbd class="kbd-badge font-bold px-1.5 py-0.5 bg-emerald-950/80 border-emerald-500/50 text-emerald-300">L3</kbd>`;
    }
    if (pcStealthLabel) {
      pcStealthLabel.textContent = typeof t === 'function' ? (t('stealthLabel') || 'Siluman') : 'Siluman';
    }
    const bDockKey = document.getElementById('badgeDockKey');
    if (bDockKey) {
      bDockKey.textContent = isXbox ? 'Y' : '△';
      bDockKey.className = 'kbd-badge font-bold px-1.5 py-0 bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-sm text-[8px] sm:text-[9px]';
    }
    const bMapKey = document.getElementById('badgeMapKey');
    if (bMapKey) {
      bMapKey.textContent = isXbox ? 'View' : 'Touchpad';
      bMapKey.className = 'kbd-badge font-bold px-1.5 py-0.5 bg-sky-950/90 border-sky-500/60 text-sky-300 shadow-sm text-[8px] sm:text-[9px] inline-flex';
    }
    const bInvKey = document.getElementById('badgeInvKey');
    if (bInvKey) {
      bInvKey.textContent = 'D-Pad ↓';
      bInvKey.className = 'kbd-badge font-bold px-1.5 py-0.5 bg-amber-950/90 border-amber-500/60 text-amber-300 shadow-sm text-[8px] sm:text-[9px] inline-flex';
    }
    const bCargoBarKey = document.getElementById('badgeCargoBarKey');
    if (bCargoBarKey) {
      bCargoBarKey.textContent = 'D-Pad ↓';
      bCargoBarKey.className = 'kbd-badge font-bold text-[8px] px-1.5 py-0.2 ml-auto inline-block bg-amber-950/90 border-amber-500/60 text-amber-300';
    }

    // Ensure PC Controls Bar is visible and Mobile Dock is hidden during active voyage with Gamepad
    if (typeof isGameStarted !== 'undefined' && isGameStarted) {
      const pcBar = document.getElementById('pcControlsBar');
      if (pcBar) {
        pcBar.classList.remove('hidden');
        pcBar.style.display = 'flex';
      }
      const mobDock = document.getElementById('mobileControlsDock');
      if (mobDock) {
        mobDock.classList.add('hidden');
        mobDock.style.display = 'none';
      }
    }
  } else {
    if (bFire) {
      bFire.textContent = 'SPACE';
      bFire.className = 'kbd-badge text-[7.5px] px-1 py-0 mt-0.5 pointer-events-none';
    }
    if (bMine) {
      bMine.textContent = '2';
      bMine.className = 'kbd-badge text-[7.5px] px-1 py-0 mt-0.5 pointer-events-none';
    }
    if (bSalvage) {
      bSalvage.textContent = 'E';
      bSalvage.className = 'kbd-badge text-[7.5px] px-1 py-0 mt-0.5 pointer-events-none';
    }
    if (bSpyglass) {
      bSpyglass.textContent = 'F';
      bSpyglass.className = 'kbd-badge text-[7.5px] px-1 py-0 mt-0.5 pointer-events-none';
    }
    if (bRepair) {
      bRepair.textContent = 'R';
      bRepair.className = 'kbd-badge text-[7.5px] px-1 py-0 mt-0.5 pointer-events-none';
    }
    if (bSteerKeys) {
      bSteerKeys.innerHTML = `<kbd class="kbd-badge">W</kbd><kbd class="kbd-badge">A</kbd><kbd class="kbd-badge">S</kbd><kbd class="kbd-badge">D</kbd>`;
    }
    if (pcSteerLabel) {
      pcSteerLabel.textContent = typeof t === 'function' ? (t('steerLabel') || 'Kemudi') : 'Kemudi';
    }
    if (bBoostKeys) {
      bBoostKeys.innerHTML = `<kbd class="kbd-badge">Shift</kbd>`;
    }
    if (pcBoostLabel) {
      pcBoostLabel.textContent = typeof t === 'function' ? (t('boostLabel') || 'Laju Cepat') : 'Laju Cepat';
    }
    if (bStealthKeys) {
      bStealthKeys.innerHTML = `<kbd class="kbd-badge">Ctrl</kbd>`;
    }
    if (pcStealthLabel) {
      pcStealthLabel.textContent = typeof t === 'function' ? (t('stealthLabel') || 'Siluman') : 'Siluman';
    }
    const bDockKey = document.getElementById('badgeDockKey');
    if (bDockKey) {
      bDockKey.textContent = 'U';
      bDockKey.className = 'kbd-badge bg-black/80 text-amber-200 border-amber-400 text-[8px] sm:text-[9px]';
    }
    const bMapKey = document.getElementById('badgeMapKey');
    if (bMapKey) {
      bMapKey.textContent = 'M';
      bMapKey.className = 'kbd-badge hidden sm:inline-flex';
    }
    const bInvKey = document.getElementById('badgeInvKey');
    if (bInvKey) {
      bInvKey.textContent = 'I';
      bInvKey.className = 'kbd-badge hidden sm:inline-flex';
    }
    const bCargoBarKey = document.getElementById('badgeCargoBarKey');
    if (bCargoBarKey) {
      bCargoBarKey.textContent = 'I';
      bCargoBarKey.className = 'kbd-badge text-[8px] px-1 py-0.2 ml-auto hidden sm:inline-block';
    }

    // Restore device-appropriate dock on keyboard
    if (typeof isGameStarted !== 'undefined' && isGameStarted) {
      const pcBar = document.getElementById('pcControlsBar');
      const mobDock = document.getElementById('mobileControlsDock');
      const isMob = typeof isMobileDevice === 'function' ? isMobileDevice() : (window.innerWidth < 1024);
      if (pcBar) {
        if (!isMob && window.innerWidth >= 1024) {
          pcBar.classList.remove('hidden');
          pcBar.style.display = 'flex';
        } else {
          pcBar.classList.add('hidden');
          pcBar.style.display = 'none';
        }
      }
      if (mobDock) {
        if (isMob || window.innerWidth < 1024) {
          mobDock.classList.remove('hidden', 'pointer-events-none');
          mobDock.style.display = 'flex';
        } else {
          mobDock.classList.add('hidden');
          mobDock.style.display = 'none';
        }
      }
    }
  }

  // Update Help Modal status if open
  const statusEl = document.getElementById('helpGamepadStatus');
  if (statusEl) {
    if (typeof connectedGamepadIndex !== 'undefined' && connectedGamepadIndex >= 0) {
      const gName = (typeof connectedGamepadName !== 'undefined' && connectedGamepadName) ? connectedGamepadName : (isPS ? 'PlayStation Controller' : 'Xbox Controller');
      statusEl.innerHTML = `
        <div class="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
          <span>TERHUBUNG: ${gName}</span>
          <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">Haptik Siap</span>
        </div>`;
    } else {
      statusEl.innerHTML = `
        <div class="flex items-center gap-2 text-slate-400 font-semibold text-[11px]">
          <span class="w-2 h-2 rounded-full bg-amber-400/80 inline-block"></span>
          <span>SIAP TERHUBUNG: Sambungkan USB / Bluetooth & tekan sembarang tombol</span>
        </div>`;
    }
  }
}

if (typeof window !== 'undefined') {
  window.updateInputPromptGlyphs = updateInputPromptGlyphs;
}


