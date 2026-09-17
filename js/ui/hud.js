/* ==========================================================================
   LAUT DARAH - HEADS-UP DISPLAY (HUD) & COMBAT TEXT MODULE
   Floating damage numbers, SVG toast banners, astrolabe compass, stealth bar
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
let elNeedle = null;
let elZoneInd = null;
let elShipTitle = null;
let elShipRankBadge = null;
let elStealthBar = null;
let elStealthIcon = null;
let elStealthLabel = null;
let elStealthPercentLabel = null;

let lastHpDisplay = -1;
let lastMaxHpDisplay = -1;
let lastGoldDisplay = -1;
let lastBloodDisplay = -1;
let lastDistDisplay = -1;
let lastZoneName = '';
let lastShipRank = -1;
let lastStealthPercent = -1;
let lastStealthState = '';
let lastNeedleDeg = -999;
let lastWindDeg = -999;
let lastTreasureDeg = -999;
let elWindNeedle = null;
let elTreasureNeedle = null;

const STEALTH_ICONS = {
  detected: `<svg class="w-4 h-4 text-rose-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" stroke-width="2.5"/></svg>`,
  warn: `<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  safe: `<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
};

function initHUDElements() {
  elHpBar = document.getElementById('hpBar');
  elHpNumericText = document.getElementById('hpNumericText');
  elGoldText = document.getElementById('goldText');
  elBloodText = document.getElementById('bloodEssenceText');
  elDistText = document.getElementById('distanceText');
  elNeedle = document.getElementById('compassNeedle');
  elWindNeedle = document.getElementById('windNeedle');
  elTreasureNeedle = document.getElementById('treasureNeedle');
  elZoneInd = document.getElementById('zoneIndicator');
  elShipTitle = document.getElementById('shipTitle');
  elShipRankBadge = document.getElementById('shipRankBadge');
  elStealthBar = document.getElementById('stealthBar');
  elStealthIcon = document.getElementById('stealthIcon');
  elStealthLabel = document.getElementById('stealthStatusLabel');
  elStealthPercentLabel = document.getElementById('stealthPercentLabel');
}

function updateHUD() {
  if (!elHpBar) initHUDElements();

  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  const roundedHp = Math.round(playerState.hp);
  if (roundedHp !== lastHpDisplay || maxHp !== lastMaxHpDisplay) {
    lastHpDisplay = roundedHp;
    lastMaxHpDisplay = maxHp;
    const hpPercent = Math.max(0, (playerState.hp / maxHp) * 100);
    if (elHpBar) elHpBar.style.width = `${hpPercent}%`;
    if (elHpNumericText) elHpNumericText.innerText = `${roundedHp}/${maxHp}`;

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

  if (elNeedle) {
    const deg = Math.round((playerState.angle * 180 / Math.PI) + 90);
    if (deg !== lastNeedleDeg) {
      lastNeedleDeg = deg;
      elNeedle.style.transform = `rotate(${deg}deg)`;
    }
  }

  if (elWindNeedle && typeof windAngle !== 'undefined') {
    const windDeg = Math.round((windAngle * 180 / Math.PI) + 90);
    if (windDeg !== lastWindDeg) {
      lastWindDeg = windDeg;
      elWindNeedle.style.transform = `rotate(${windDeg}deg)`;
    }
  }

  if (elTreasureNeedle) {
    if (typeof activeTreasureHint !== 'undefined' && activeTreasureHint) {
      elTreasureNeedle.classList.remove('hidden');
      const tAngle = Math.atan2(activeTreasureHint.y - playerState.y, activeTreasureHint.x - playerState.x);
      const tDeg = Math.round((tAngle * 180 / Math.PI) + 90);
      if (tDeg !== lastTreasureDeg) {
        lastTreasureDeg = tDeg;
        elTreasureNeedle.style.transform = `rotate(${tDeg}deg)`;
      }
    } else {
      elTreasureNeedle.classList.add('hidden');
    }
  }

  const biome = getBiomeInfo(dist);
  if (biome.name !== lastZoneName) {
    lastZoneName = biome.name;
    if (elZoneInd) {
      elZoneInd.innerText = biome.name;
      elZoneInd.className = `text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded border truncate max-w-[80px] sm:max-w-[100px] text-center ${biome.isBloodSea ? 'bg-red-950 text-red-300 border-red-500 animate-pulse' : 'bg-sky-950/80 text-sky-300 border-sky-600/30'}`;
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
    if (elStealthLabel && elStealthBar) {
      if (currentStealthState === 'detected') {
        elStealthLabel.innerText = 'TERDETEKSI!';
        elStealthLabel.className = 'text-rose-400 font-bold truncate';
        elStealthBar.className = 'bg-rose-600 h-full transition-all duration-150';
      } else if (currentStealthState === 'warn') {
        elStealthLabel.innerText = 'Waspada...';
        elStealthLabel.className = 'text-amber-400 font-bold truncate';
        elStealthBar.className = 'bg-amber-500 h-full transition-all duration-150';
      } else {
        elStealthLabel.innerText = 'Siluman: Aman';
        elStealthLabel.className = 'text-emerald-400 font-bold truncate';
        elStealthBar.className = 'bg-emerald-500 h-full transition-all duration-150';
      }
    }
  }
}
