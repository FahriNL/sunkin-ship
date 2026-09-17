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

function updateHUD() {
  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  const hpPercent = Math.max(0, (playerState.hp / maxHp) * 100);
  
  const hpBar = document.getElementById('hpBar');
  const hpNumericText = document.getElementById('hpNumericText');
  if (hpBar) hpBar.style.width = `${hpPercent}%`;
  if (hpNumericText) hpNumericText.innerText = `${Math.round(playerState.hp)}/${maxHp}`;

  const goldText = document.getElementById('goldText');
  const bloodText = document.getElementById('bloodEssenceText');
  if (goldText) goldText.innerText = playerState.gold.toLocaleString('id-ID');
  if (bloodText) bloodText.innerText = playerState.bloodEssence.toLocaleString('id-ID');

  const dist = Math.floor(Math.hypot(playerState.x, playerState.y));
  const distText = document.getElementById('distanceText');
  if (distText) distText.innerText = `${dist}m`;

  const needle = document.getElementById('compassNeedle');
  if (needle) {
    const deg = (playerState.angle * 180 / Math.PI) + 90;
    needle.style.transform = `rotate(${deg}deg)`;
  }

  const biome = getBiomeInfo(dist);
  const zoneInd = document.getElementById('zoneIndicator');
  if (zoneInd) {
    zoneInd.innerText = biome.name;
    zoneInd.className = `text-[9px] font-bold px-1.5 py-0.2 rounded border truncate max-w-[85px] text-center ${biome.isBloodSea ? 'bg-red-950 text-red-300 border-red-500 animate-pulse' : 'bg-sky-950/80 text-sky-300 border-sky-600/30'}`;
  }

  const tier = getShipTier();
  const shipTitle = document.getElementById('shipTitle');
  const shipRankBadge = document.getElementById('shipRankBadge');
  if (shipTitle) {
    shipTitle.innerText = tier.name;
    shipTitle.style.color = tier.color;
  }
  if (shipRankBadge) {
    shipRankBadge.innerText = tier.rank;
  }

  // Update Stealth UI Meter with Crisp SVG Icons
  const stealthPercent = Math.round(highestDetectionLevel * 100);
  const stealthBar = document.getElementById('stealthBar');
  const stealthIcon = document.getElementById('stealthIcon');
  const stealthLabel = document.getElementById('stealthStatusLabel');
  const stealthPercentLabel = document.getElementById('stealthPercentLabel');

  if (stealthBar) stealthBar.style.width = `${stealthPercent}%`;
  if (stealthPercentLabel) stealthPercentLabel.innerText = `${stealthPercent}%`;

  if (stealthLabel && stealthIcon && stealthBar) {
    if (stealthPercent >= 100) {
      stealthIcon.innerHTML = `<svg class="w-4 h-4 text-rose-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" stroke-width="2.5"/></svg>`;
      stealthLabel.innerText = 'TERDETEKSI!';
      stealthLabel.className = 'text-rose-400 font-bold truncate';
      stealthBar.className = 'bg-rose-600 h-full transition-all duration-150';
    } else if (stealthPercent > 10) {
      stealthIcon.innerHTML = `<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      stealthLabel.innerText = 'Waspada...';
      stealthLabel.className = 'text-amber-400 font-bold truncate';
      stealthBar.className = 'bg-amber-500 h-full transition-all duration-150';
    } else {
      stealthIcon.innerHTML = `<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
      stealthLabel.innerText = 'Siluman: Aman';
      stealthLabel.className = 'text-emerald-400 font-bold truncate';
      stealthBar.className = 'bg-emerald-500 h-full transition-all duration-150';
    }
  }
}
