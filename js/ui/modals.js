/* ==========================================================================
   LAUT DARAH - UI MODALS & DIALOGS ENGINE
   Shipyard Upgrades, Clan Codex Lore, Game Over Screen, Controls Guide, & SVG Audio
   ========================================================================== */

const topHUD = document.getElementById('topHUD');
const mainMenuModal = document.getElementById('mainMenuModal');
const btnMainMenuPlay = document.getElementById('btnMainMenuPlay');
const btnMainMenuSettings = document.getElementById('btnMainMenuSettings');
const btnMainMenuCodex = document.getElementById('btnMainMenuCodex');
const btnMainMenuControls = document.getElementById('btnMainMenuControls');

const pauseModal = document.getElementById('pauseModal');
const btnPauseGame = document.getElementById('btnPauseGame');
const btnResumeGame = document.getElementById('btnResumeGame');
const btnRestartGame = document.getElementById('btnRestartGame');
const btnPauseSettings = document.getElementById('btnPauseSettings');
const btnReturnToMainMenu = document.getElementById('btnReturnToMainMenu');

const settingsModal = document.getElementById('settingsModal');
const btnOpenSettings = document.getElementById('btnOpenSettings');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const sliderMasterVol = document.getElementById('sliderMasterVol');
const labelMasterVol = document.getElementById('labelMasterVol');
const sliderAmbienceVol = document.getElementById('sliderAmbienceVol');
const labelAmbienceVol = document.getElementById('labelAmbienceVol');
const sliderSfxVol = document.getElementById('sliderSfxVol');
const labelSfxVol = document.getElementById('labelSfxVol');
const sliderBattleVol = document.getElementById('sliderBattleVol');
const labelBattleVol = document.getElementById('labelBattleVol');
const btnActionFullscreen = document.getElementById('btnActionFullscreen');
const txtBtnFullscreen = document.getElementById('txtBtnFullscreen');
const btnToggleFullscreen = document.getElementById('btnToggleFullscreen');
const chkAutoFullscreen = document.getElementById('chkAutoFullscreen');
const chkScreenShake = document.getElementById('chkScreenShake');
const chkMuteAll = document.getElementById('chkMuteAll');

const labelDifficultyBadge = document.getElementById('labelDifficultyBadge');
const labelDifficultyDesc = document.getElementById('labelDifficultyDesc');
const btnDiffEasy = document.getElementById('btnDiffEasy');
const btnDiffMedium = document.getElementById('btnDiffMedium');
const btnDiffHard = document.getElementById('btnDiffHard');
const btnMainMenuDiffCycle = document.getElementById('btnMainMenuDiffCycle');
const mainMenuDiffText = document.getElementById('mainMenuDiffText');
const pauseDiffBadge = document.getElementById('pauseDiffBadge');

let settingsReturnTarget = 'mainMenu'; // 'mainMenu' | 'pause' | 'game'

const upgradeModal = document.getElementById('upgradeModal');
const upgradeList = document.getElementById('upgradeList');
const btnOpenUpgrade = document.getElementById('btnOpenUpgrade');
const btnCloseUpgrade = document.getElementById('btnCloseUpgrade');
const btnRepairShip = document.getElementById('btnRepairShip');

const loreModal = document.getElementById('loreModal');
const btnOpenLore = document.getElementById('btnOpenLore');
const btnCloseLore = document.getElementById('btnCloseLore');
const clanCodexContainer = document.getElementById('clanCodexContainer');

const helpModal = document.getElementById('helpModal');
const btnOpenHelp = document.getElementById('btnOpenHelp');
const btnCloseHelp = document.getElementById('btnCloseHelp');

const gameOverModal = document.getElementById('gameOverModal');
const btnRespawn = document.getElementById('btnRespawn');

const btnToggleSound = document.getElementById('btnToggleSound');
const soundIcon = document.getElementById('soundIcon');
const btnCenterCamera = document.getElementById('btnCenterCamera');

// Clan Codex Modal
function renderClanCodexUI() {
  if (!clanCodexContainer) return;
  clanCodexContainer.innerHTML = '';
  for (const [key, clan] of Object.entries(CLAN_LORE)) {
    const card = document.createElement('div');
    card.className = `p-3.5 rounded-2xl border bg-gradient-to-br ${clan.bgClass} flex flex-col gap-2`;

    let tiersHtml = '';
    clan.tiers.forEach(t => {
      tiersHtml += `
        <div class="bg-black/40 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-white flex items-center gap-1.5">
              <span class="text-[9px] px-1.5 py-0.5 rounded font-black" style="background-color: ${clan.badgeColor}; color: #000;">Lv.${t.level}</span>
              ${t.name}
            </span>
            <span class="text-[10px] text-slate-300 font-mono">HP: ${t.hp} • DMG: ${t.damage}</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">${t.desc}</p>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-cinzel text-sm font-black" style="color: ${clan.badgeColor}">${clan.name}</h3>
            <span class="text-[9px] px-2 py-0.5 rounded-full bg-black/60 text-slate-300 border border-white/10 font-bold uppercase">${clan.species}</span>
          </div>
          <p class="text-[10px] text-slate-300 mt-1 leading-relaxed">${clan.lore}</p>
        </div>
      </div>
      <div class="space-y-1.5 mt-1">
        ${tiersHtml}
      </div>
    `;
    clanCodexContainer.appendChild(card);
  }
}

function openLoreModal() {
  sound.init();
  closeUpgradeModal();
  closeHelpModal();
  renderClanCodexUI();
  const elGen = document.getElementById('worldGenLabel');
  if (elGen) {
    elGen.innerText = `Generasi #${currentWorldGenNumber || 1} (Seed: ${currentWorldGenSeed || 'Default'})`;
  }
  loreModal.classList.remove('modal-enter', 'hidden');
  loreModal.classList.add('modal-active');
  isGamePaused = true;
}

function closeLoreModal() {
  if (!loreModal) return;
  loreModal.classList.remove('modal-active');
  loreModal.classList.add('modal-enter', 'hidden');
  isGamePaused = false;
  lastTime = performance.now();
}

function toggleLoreModal() {
  if (loreModal && loreModal.classList.contains('modal-active')) {
    closeLoreModal();
  } else {
    openLoreModal();
  }
}

if (btnOpenLore) btnOpenLore.addEventListener('click', openLoreModal);
if (btnCloseLore) btnCloseLore.addEventListener('click', closeLoreModal);
if (loreModal) {
  loreModal.addEventListener('click', (e) => {
    if (e.target === loreModal) closeLoreModal();
  });
}

// Controls Help Modal
function openHelpModal() {
  sound.init();
  closeUpgradeModal();
  closeLoreModal();
  if (!helpModal) return;
  helpModal.classList.remove('modal-enter', 'hidden');
  helpModal.classList.add('modal-active');
  isGamePaused = true;
}

function closeHelpModal() {
  if (!helpModal) return;
  helpModal.classList.remove('modal-active');
  helpModal.classList.add('modal-enter', 'hidden');
  isGamePaused = false;
  lastTime = performance.now();
}

function toggleHelpModal() {
  if (helpModal && helpModal.classList.contains('modal-active')) {
    closeHelpModal();
  } else {
    openHelpModal();
  }
}

if (btnOpenHelp) btnOpenHelp.addEventListener('click', openHelpModal);
if (btnCloseHelp) btnCloseHelp.addEventListener('click', closeHelpModal);
if (helpModal) {
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) closeHelpModal();
  });
}

// Shipyard Upgrades Modal (Rendered with pure SVG icons)
function renderUpgradeUI() {
  if (!upgradeList) return;
  upgradeList.innerHTML = '';
  let totalLevels = 0;

  for (const [key, conf] of Object.entries(UPGRADE_CONFIG)) {
    const currentLvl = playerState.upgrades[key];
    totalLevels += currentLvl;
    const isMax = currentLvl >= conf.maxLevel;

    const goldCost = isMax ? 0 : Math.floor(conf.baseCost * Math.pow(conf.costMult, Math.max(0, currentLvl - (key === 'rearDefense' ? 0 : 1))));
    const bloodCost = (!isMax && currentLvl >= conf.bloodCostStart) ? (currentLvl - conf.bloodCostStart + 1) * 3 : 0;
    const canAfford = !isMax && (playerState.gold >= goldCost) && (playerState.bloodEssence >= bloodCost);

    const iconHtml = SVG_ICONS[conf.iconKey] || SVG_ICONS.hull;

    const row = document.createElement('div');
    row.className = 'bg-slate-900/80 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-2.5';
    row.innerHTML = `
      <div class="flex items-center gap-2.5">
        <div class="p-2 rounded-xl bg-slate-950/70 border border-white/10 shrink-0">
          ${iconHtml}
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-bold text-slate-200">${conf.name}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded font-mono ${isMax ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}">
              ${isMax ? 'MAX' : (currentLvl === 0 ? 'Terkunci' : `Lv.${currentLvl}/${conf.maxLevel}`)}
            </span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">${conf.desc}</p>
        </div>
      </div>
      <button data-key="${key}" class="upgrade-btn px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
        isMax ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
        canAfford ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95' :
        'bg-slate-800/80 text-slate-500 cursor-not-allowed'
      }">
        ${isMax ? 'TERKUAT' : `${goldCost} 🪙 ${bloodCost > 0 ? `+ ${bloodCost} 🩸` : ''}`}
      </button>
    `;
    upgradeList.appendChild(row);
  }

  const maxProgressLabel = document.getElementById('maxProgressLabel');
  if (maxProgressLabel) {
    maxProgressLabel.innerText = `${totalLevels}/36 Tingkat`;
  }

  document.querySelectorAll('.upgrade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      if (!key) return;
      const conf = UPGRADE_CONFIG[key];
      const currentLvl = playerState.upgrades[key];
      if (currentLvl >= conf.maxLevel) return;

      const goldCost = Math.floor(conf.baseCost * Math.pow(conf.costMult, Math.max(0, currentLvl - (key === 'rearDefense' ? 0 : 1))));
      const bloodCost = currentLvl >= conf.bloodCostStart ? (currentLvl - conf.bloodCostStart + 1) * 3 : 0;

      if (playerState.gold >= goldCost && playerState.bloodEssence >= bloodCost) {
        playerState.gold -= goldCost;
        playerState.bloodEssence -= bloodCost;
        playerState.upgrades[key]++;
        sound.playLoot();
        showToast(`${conf.name} ditingkatkan ke Lv.${playerState.upgrades[key]}!`, "check");
        saveGame();
        renderUpgradeUI();
        updateHUD();
      }
    });
  });
}

function openUpgradeModal() {
  sound.init();
  // SHOP OVERHAUL RESTRICTION: Upgrades only available when docked at Haven, Shop Island, or Conquered Island
  if (!playerState.isDockedAtPort) {
    showToast("⚓ Galangan Kapal tidak melayani di laut lepas! Berlabuhlah di Pelabuhan Asal, Pulau Pasar, atau Pulau Kekuasaanmu.", "alert");
    return;
  }

  closeLoreModal();
  closeHelpModal();
  closeMapModal();
  renderUpgradeUI();
  upgradeModal.classList.remove('modal-enter', 'hidden');
  upgradeModal.classList.add('modal-active');
  isGamePaused = true;
}

function closeUpgradeModal() {
  if (!upgradeModal) return;
  upgradeModal.classList.remove('modal-active');
  upgradeModal.classList.add('modal-enter', 'hidden');
  isGamePaused = false;
  lastTime = performance.now();
}

function toggleUpgradeModal() {
  if (upgradeModal && upgradeModal.classList.contains('modal-active')) {
    closeUpgradeModal();
  } else {
    openUpgradeModal();
  }
}

if (btnOpenUpgrade) btnOpenUpgrade.addEventListener('click', openUpgradeModal);
if (btnCloseUpgrade) btnCloseUpgrade.addEventListener('click', closeUpgradeModal);
if (upgradeModal) {
  upgradeModal.addEventListener('click', (e) => {
    if (e.target === upgradeModal) closeUpgradeModal();
  });
}

// Sea Chart / Oceanic Map Modal Elements
const seaMapModal = document.getElementById('seaMapModal');
const seaMapCanvas = document.getElementById('seaMapCanvas');
const btnOpenMap = document.getElementById('btnOpenMap');
const btnCloseSeaMap = document.getElementById('btnCloseSeaMap');
const btnUpgradeMap = document.getElementById('btnUpgradeMap');
const mapLevelBadge = document.getElementById('mapLevelBadge');
const mapNameLabel = document.getElementById('mapNameLabel');
const mapDescLabel = document.getElementById('mapDescLabel');
const mapUpgradeBtnText = document.getElementById('mapUpgradeBtnText');

function renderSeaMapUI() {
  const curLevel = playerState.mapLevel || 1;
  const cfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined' && MAP_UPGRADE_CONFIG[curLevel]) 
    ? MAP_UPGRADE_CONFIG[curLevel] 
    : { name: "Peta Nelayan", desc: "Bagan laut dasar" };
  const nextCfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined') ? MAP_UPGRADE_CONFIG[curLevel + 1] : null;

  if (mapLevelBadge) mapLevelBadge.innerText = `Lv.${curLevel}`;
  if (mapNameLabel) mapNameLabel.innerText = cfg.name;
  if (mapDescLabel) mapDescLabel.innerText = cfg.desc;

  if (btnUpgradeMap && mapUpgradeBtnText) {
    if (!nextCfg) {
      mapUpgradeBtnText.innerText = "Peta Samudra Maksimal";
      btnUpgradeMap.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      mapUpgradeBtnText.innerText = `Tingkatkan Peta (${nextCfg.cost} 🪙)`;
      if (playerState.gold >= nextCfg.cost) {
        btnUpgradeMap.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        btnUpgradeMap.classList.add('opacity-50', 'cursor-not-allowed');
      }
    }
  }

  renderSeaMapCanvas();
}

function renderSeaMapCanvas() {
  if (!seaMapCanvas) return;
  const dprMap = Math.min(window.devicePixelRatio || 1, 2);
  const rect = seaMapCanvas.getBoundingClientRect();
  const w = rect.width || 540;
  const h = rect.height || 400;

  seaMapCanvas.width = Math.floor(w * dprMap);
  seaMapCanvas.height = Math.floor(h * dprMap);

  const mctx = seaMapCanvas.getContext('2d');
  mctx.save();
  mctx.scale(dprMap, dprMap);

  // Background Parchment & Ocean Tone
  mctx.fillStyle = '#090f1d';
  mctx.fillRect(0, 0, w, h);

  const curLevel = playerState.mapLevel || 1;
  const cfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined' && MAP_UPGRADE_CONFIG[curLevel]) ? MAP_UPGRADE_CONFIG[curLevel] : { maxRadius: 3000 };
  const maxVisionRadius = cfg.maxRadius || 3000;

  // Center coordinate
  const cx = w / 2;
  const cy = h / 2;
  const scale = (Math.min(w, h) * 0.45) / maxVisionRadius;

  // 1. Concentric Ocean Rings
  const rings = [
    { r: 1600, label: "Ring 1: Perairan Senja", color: 'rgba(56, 189, 248, 0.15)' },
    { r: 3200, label: "Ring 2: Karang Besi", color: 'rgba(234, 88, 12, 0.15)' },
    { r: 5000, label: "Ring 3: Sekte Kabut", color: 'rgba(168, 85, 247, 0.15)' },
    { r: 7500, label: "Ring 4: Laut Darah Abisal", color: 'rgba(225, 29, 72, 0.18)' }
  ];

  rings.forEach(ring => {
    if (ring.r <= maxVisionRadius * 1.3) {
      mctx.strokeStyle = ring.color;
      mctx.lineWidth = 1;
      mctx.setLineDash([4, 6]);
      mctx.beginPath();
      mctx.arc(cx, cy, ring.r * scale, 0, Math.PI * 2);
      mctx.stroke();

      mctx.font = '8px sans-serif';
      mctx.fillStyle = ring.color.replace('0.15', '0.5').replace('0.18', '0.6');
      mctx.fillText(ring.label, cx + 6, cy - ring.r * scale - 3);
    }
  });
  mctx.setLineDash([]);

  // 2. Graticule / Coordinate Grid Lines
  mctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  mctx.lineWidth = 0.8;
  for (let gridX = 40; gridX < w; gridX += 45) {
    mctx.beginPath(); mctx.moveTo(gridX, 0); mctx.lineTo(gridX, h); mctx.stroke();
  }
  for (let gridY = 40; gridY < h; gridY += 45) {
    mctx.beginPath(); mctx.moveTo(0, gridY); mctx.lineTo(w, gridY); mctx.stroke();
  }

  // 3. Explored Sectors (Fog of War)
  const sectorSize = 180;
  if (playerState.exploredSectors) {
    mctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
    for (const secKey in playerState.exploredSectors) {
      const parts = secKey.split(',');
      const sx = parseInt(parts[0], 10) * sectorSize;
      const sy = parseInt(parts[1], 10) * sectorSize;
      const mapX = cx + sx * scale;
      const mapY = cy + sy * scale;
      if (mapX >= -20 && mapX <= w + 20 && mapY >= -20 && mapY <= h + 20) {
        mctx.beginPath();
        mctx.arc(mapX, mapY, sectorSize * scale * 1.15, 0, Math.PI * 2);
        mctx.fill();
      }
    }
  }

  // 4. World Islands
  WORLD_ISLANDS.forEach(isl => {
    const mapX = cx + isl.x * scale;
    const mapY = cy + isl.y * scale;

    const secKey = `${Math.round(isl.x / sectorSize)},${Math.round(isl.y / sectorSize)}`;
    const isExplored = (playerState.exploredSectors && playerState.exploredSectors[secKey]) || isl.isHomePort;
    const isRevealedByLevel = cfg.showTiers && cfg.showTiers.includes(isl.tier);

    if (!isExplored && !isRevealedByLevel && !isl.isShopIsland && !isl.isHomePort) {
      if (Math.hypot(isl.x, isl.y) <= maxVisionRadius) {
        mctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
        mctx.font = 'bold 9px sans-serif';
        mctx.fillText("?", mapX - 2, mapY + 3);
      }
      return;
    }

    let dotColor = '#ca8a04';
    if (isl.isHomePort) {
      dotColor = '#38bdf8';
    } else if (isl.isShopIsland) {
      dotColor = '#10b981';
    } else if (isl.isConquered) {
      dotColor = '#facc15';
    } else if (isl.clan === 'blood' || isl.isFlesh) {
      dotColor = '#ef4444';
    } else if (isl.clan === 'mist') {
      dotColor = '#c084fc';
    } else if (isl.clan === 'iron') {
      dotColor = '#94a3b8';
    }

    const dotRadius = Math.max(5, (isl.radius || 200) * scale);
    mctx.fillStyle = dotColor;
    mctx.beginPath();
    mctx.arc(mapX, mapY, dotRadius, 0, Math.PI * 2);
    mctx.fill();

    mctx.strokeStyle = '#ffffff';
    mctx.lineWidth = 1;
    mctx.stroke();

    // Island Name
    mctx.font = 'bold 8px "Cinzel", sans-serif';
    mctx.fillStyle = '#f8fafc';
    mctx.textAlign = 'center';
    mctx.fillText(isl.name, mapX, mapY - dotRadius - 3);

    // Conquered Tag
    if (isl.isConquered && !isl.isHomePort) {
      mctx.font = '7px sans-serif';
      mctx.fillStyle = '#facc15';
      mctx.fillText("✓ Takluk", mapX, mapY + dotRadius + 8);
    }
  });

  // 5. Merchant Ships (if Map Level >= 3)
  if (curLevel >= 3 && entities.merchants) {
    entities.merchants.forEach(m => {
      const mx = cx + m.x * scale;
      const my = cy + m.y * scale;
      mctx.fillStyle = m.type === 'cargo' ? '#38bdf8' : '#0284c7';
      mctx.beginPath();
      mctx.arc(mx, my, 3, 0, Math.PI * 2);
      mctx.fill();
    });
  }

  // 6. Player Vessel & Direction Triangle
  const px = cx + playerState.x * scale;
  const py = cy + playerState.y * scale;

  const ping = (_now * 0.003) % 1;
  mctx.strokeStyle = `rgba(251, 191, 36, ${0.7 - ping * 0.6})`;
  mctx.lineWidth = 1.5;
  mctx.beginPath();
  mctx.arc(px, py, 6 + ping * 18, 0, Math.PI * 2);
  mctx.stroke();

  mctx.save();
  mctx.translate(px, py);
  mctx.rotate(playerState.angle);
  mctx.fillStyle = '#fbbf24';
  mctx.strokeStyle = '#000000';
  mctx.lineWidth = 1;
  mctx.beginPath();
  mctx.moveTo(8, 0);
  mctx.lineTo(-5, -5);
  mctx.lineTo(-3, 0);
  mctx.lineTo(-5, 5);
  mctx.closePath();
  mctx.fill();
  mctx.stroke();
  mctx.restore();

  // 7. Decorative Compass Rose
  const compassX = w - 35;
  const compassY = 35;
  mctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  mctx.lineWidth = 1;
  mctx.beginPath();
  mctx.arc(compassX, compassY, 16, 0, Math.PI * 2);
  mctx.stroke();

  mctx.fillStyle = '#ef4444';
  mctx.beginPath();
  mctx.moveTo(compassX, compassY - 16);
  mctx.lineTo(compassX - 3.5, compassY);
  mctx.lineTo(compassX + 3.5, compassY);
  mctx.closePath();
  mctx.fill();

  mctx.fillStyle = '#94a3b8';
  mctx.beginPath();
  mctx.moveTo(compassX, compassY + 16);
  mctx.lineTo(compassX - 3.5, compassY);
  mctx.lineTo(compassX + 3.5, compassY);
  mctx.closePath();
  mctx.fill();

  mctx.font = 'bold 8px sans-serif';
  mctx.fillStyle = '#fbbf24';
  mctx.textAlign = 'center';
  mctx.fillText("U", compassX, compassY - 19);

  mctx.restore();
}

function openMapModal() {
  sound.init();
  closeUpgradeModal();
  closeLoreModal();
  closeHelpModal();
  renderSeaMapUI();
  if (seaMapModal) {
    seaMapModal.classList.remove('modal-enter', 'hidden');
    seaMapModal.classList.add('modal-active');
  }
  isGamePaused = true;
}

function closeMapModal() {
  if (!seaMapModal) return;
  seaMapModal.classList.remove('modal-active');
  seaMapModal.classList.add('modal-enter', 'hidden');
  isGamePaused = false;
  lastTime = performance.now();
}

function toggleMapModal() {
  if (seaMapModal && seaMapModal.classList.contains('modal-active')) {
    closeMapModal();
  } else {
    openMapModal();
  }
}

function upgradeMap() {
  const curLevel = playerState.mapLevel || 1;
  const nextCfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined') ? MAP_UPGRADE_CONFIG[curLevel + 1] : null;
  if (!nextCfg) {
    showToast("Peta samudra telah mencapai tingkat kartografi tertinggi!", "compass");
    return;
  }
  if (playerState.gold >= nextCfg.cost) {
    playerState.gold -= nextCfg.cost;
    playerState.mapLevel = nextCfg.level;
    sound.playCoin();
    sound.playLoot();
    showToast(`Peta Samudra ditingkatkan ke ${nextCfg.name}!`, "compass");
    saveGame();
    updateHUD();
    renderSeaMapUI();
  } else {
    showToast(`Emas tidak cukup untuk peningkatan peta (Butuh ${nextCfg.cost} 🪙).`, "alert");
  }
}

if (btnOpenMap) btnOpenMap.addEventListener('click', openMapModal);
if (btnCloseSeaMap) btnCloseSeaMap.addEventListener('click', closeMapModal);
if (btnUpgradeMap) btnUpgradeMap.addEventListener('click', upgradeMap);
if (seaMapModal) {
  seaMapModal.addEventListener('click', (e) => {
    if (e.target === seaMapModal) closeMapModal();
  });
}

// Quick Repair Ship (Shared by button & keyboard hotkey [R])
function quickRepairShip() {
  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  if (playerState.hp >= maxHp) {
    showToast("Lambung kapal dalam kondisi prima 100%!", "check");
    return;
  }
  if (playerState.gold >= 15) {
    playerState.gold -= 15;
    playerState.hp = maxHp;
    sound.playSplash();
    showToast("Kapal diperbaiki sepenuhnya! (-15 Koin)", "anchor");
    updateHUD();
    saveGame();
  } else {
    showToast("Emas tidak cukup untuk reparasi (Butuh 15 Koin).", "alert");
  }
}

if (btnRepairShip) btnRepairShip.addEventListener('click', quickRepairShip);

// Fullscreen Management API
function toggleFullscreen(force) {
  const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  const shouldEnter = (typeof force === 'boolean') ? force : !isFs;
  
  if (shouldEnter) {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {});
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    }
  } else if (isFs) {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
  updateFullscreenUI();
}

function updateFullscreenUI() {
  const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  if (txtBtnFullscreen) {
    txtBtnFullscreen.innerText = isFs ? "Keluar" : "Aktifkan";
  }
}
document.addEventListener('fullscreenchange', updateFullscreenUI);
document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

if (btnActionFullscreen) btnActionFullscreen.addEventListener('click', () => toggleFullscreen());
if (btnToggleFullscreen) btnToggleFullscreen.addEventListener('click', () => toggleFullscreen());

// Difficulty UI Synchronizer
function updateDifficultyUI() {
  const diffKey = currentDifficulty || 'medium';
  const cfg = (typeof DIFFICULTY_SETTINGS !== 'undefined' && DIFFICULTY_SETTINGS[diffKey]) ? DIFFICULTY_SETTINGS[diffKey] : {
    id: 'medium', name: 'Normal (Medium)', badge: 'NORMAL',
    badgeColor: 'text-amber-300 bg-amber-950 border-amber-500/40',
    desc: 'Keseimbangan standar ekspedisi Laut Darah saat ini.'
  };

  // 1. Settings Modal Badge & Description
  if (labelDifficultyBadge) {
    labelDifficultyBadge.innerText = cfg.badge;
    labelDifficultyBadge.className = `text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-cinzel ${cfg.badgeColor}`;
  }
  if (labelDifficultyDesc) {
    labelDifficultyDesc.innerText = cfg.desc;
  }

  // 2. Settings Modal Selection Buttons
  const buttons = [
    { el: btnDiffEasy, key: 'easy', activeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-500 shadow-sm', inactiveClass: 'bg-slate-800 text-slate-400 border-white/10 hover:border-emerald-500/40' },
    { el: btnDiffMedium, key: 'medium', activeClass: 'bg-amber-950/70 text-amber-300 border-amber-500 shadow-sm', inactiveClass: 'bg-slate-800 text-slate-400 border-white/10 hover:border-amber-500/40' },
    { el: btnDiffHard, key: 'hard', activeClass: 'bg-rose-950/70 text-rose-300 border-rose-500 shadow-sm', inactiveClass: 'bg-slate-800 text-slate-400 border-white/10 hover:border-rose-500/40' }
  ];

  buttons.forEach(({ el, key, activeClass, inactiveClass }) => {
    if (!el) return;
    el.className = `py-2 px-1 rounded-xl text-xs font-cinzel font-bold border transition cursor-pointer text-center ${diffKey === key ? activeClass : inactiveClass}`;
  });

  // 3. Main Menu Pill
  if (btnMainMenuDiffCycle && mainMenuDiffText) {
    mainMenuDiffText.innerText = cfg.badge;
    btnMainMenuDiffCycle.className = `font-cinzel font-black text-[11px] px-2.5 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${cfg.badgeColor}`;
  }

  // 4. Pause Menu Badge
  if (pauseDiffBadge) {
    pauseDiffBadge.innerText = cfg.badge;
    pauseDiffBadge.className = `text-[10px] font-bold font-cinzel px-2 py-0.5 rounded-lg border ${cfg.badgeColor}`;
  }
}

// Settings Modal Management
function openSettingsModal(fromTarget = 'game') {
  sound.init();
  settingsReturnTarget = fromTarget;
  updateDifficultyUI();
  if (settingsModal) {
    settingsModal.classList.remove('modal-enter', 'hidden');
    settingsModal.classList.add('modal-active');
  }
  updateFullscreenUI();
  if (isGameStarted) {
    isGamePaused = true;
  }
}

function closeSettingsModal() {
  if (!settingsModal) return;
  settingsModal.classList.remove('modal-active');
  settingsModal.classList.add('modal-enter', 'hidden');

  if (settingsReturnTarget === 'pause') {
    if (pauseModal) {
      pauseModal.classList.remove('modal-enter', 'hidden');
      pauseModal.classList.add('modal-active');
    }
  } else if (settingsReturnTarget === 'mainMenu') {
    // Keep main menu active
  } else {
    // Return to game
    if (isGameStarted) {
      isGamePaused = false;
      lastTime = performance.now();
    }
  }
}

if (btnOpenSettings) btnOpenSettings.addEventListener('click', () => openSettingsModal(isGameStarted ? 'game' : 'mainMenu'));
if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettingsModal);
if (btnSaveSettings) btnSaveSettings.addEventListener('click', closeSettingsModal);
if (settingsModal) {
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });
}

function initSettingsUI() {
  // Difficulty Selection Handlers
  if (btnDiffEasy) {
    btnDiffEasy.addEventListener('click', () => {
      setGameDifficulty('easy');
      updateDifficultyUI();
      sound.playCoin();
      showToast("Tingkat Kesulitan Diubah: MUDAH", "check");
    });
  }
  if (btnDiffMedium) {
    btnDiffMedium.addEventListener('click', () => {
      setGameDifficulty('medium');
      updateDifficultyUI();
      sound.playCoin();
      showToast("Tingkat Kesulitan Diubah: NORMAL (MEDIUM)", "anchor");
    });
  }
  if (btnDiffHard) {
    btnDiffHard.addEventListener('click', () => {
      setGameDifficulty('hard');
      updateDifficultyUI();
      sound.playCoin();
      showToast("Tingkat Kesulitan Diubah: SULIT (EKSTREM)", "skull");
    });
  }
  if (btnMainMenuDiffCycle) {
    btnMainMenuDiffCycle.addEventListener('click', () => {
      const cycleMap = { easy: 'medium', medium: 'hard', hard: 'easy' };
      const nextDiff = cycleMap[currentDifficulty] || 'medium';
      setGameDifficulty(nextDiff);
      updateDifficultyUI();
      sound.playCoin();
      const cfg = DIFFICULTY_SETTINGS[nextDiff];
      showToast(`Tingkat Kesulitan: ${cfg ? cfg.badge : nextDiff.toUpperCase()}`, "anchor");
    });
  }
  updateDifficultyUI();

  if (sliderMasterVol) {
    sliderMasterVol.value = Math.round(sound.masterVolume * 100);
    labelMasterVol.innerText = `${sliderMasterVol.value}%`;
    sliderMasterVol.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      labelMasterVol.innerText = `${val}%`;
      sound.setMasterVolume(val / 100);
    });
  }
  if (sliderAmbienceVol) {
    sliderAmbienceVol.value = Math.round(sound.ambienceVolume * 100);
    labelAmbienceVol.innerText = `${sliderAmbienceVol.value}%`;
    sliderAmbienceVol.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      labelAmbienceVol.innerText = `${val}%`;
      sound.setAmbienceVolume(val / 100);
    });
  }
  if (sliderSfxVol) {
    sliderSfxVol.value = Math.round(sound.sfxVolume * 100);
    labelSfxVol.innerText = `${sliderSfxVol.value}%`;
    sliderSfxVol.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      labelSfxVol.innerText = `${val}%`;
      sound.setSfxVolume(val / 100);
    });
  }
  if (sliderBattleVol) {
    sliderBattleVol.value = Math.round(sound.battleVolume * 100);
    labelBattleVol.innerText = `${sliderBattleVol.value}%`;
    sliderBattleVol.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      labelBattleVol.innerText = `${val}%`;
      sound.setBattleVolume(val / 100);
    });
  }
  if (chkAutoFullscreen) {
    chkAutoFullscreen.checked = sound.autoFullscreen;
    chkAutoFullscreen.addEventListener('change', (e) => {
      sound.autoFullscreen = e.target.checked;
      sound.saveSettings();
    });
  }
  if (chkScreenShake) {
    chkScreenShake.checked = sound.screenShakeEnabled;
    chkScreenShake.addEventListener('change', (e) => {
      sound.screenShakeEnabled = e.target.checked;
      sound.saveSettings();
    });
  }
  if (chkMuteAll) {
    chkMuteAll.checked = sound.muted;
    chkMuteAll.addEventListener('change', (e) => {
      sound.muted = e.target.checked;
      if (soundIcon) {
        soundIcon.innerHTML = sound.muted ? SVG_ICONS.soundOff : SVG_ICONS.soundOn;
      }
    });
  }
}
initSettingsUI();

// Main Menu Handlers
function startGameFromMenu() {
  sound.init();
  sound.startAmbience();

  if (sound.autoFullscreen) {
    toggleFullscreen(true);
  }

  isGameStarted = true;
  isGamePaused = false;
  lastTime = performance.now();

  // Hide Main Menu
  if (mainMenuModal) {
    mainMenuModal.classList.add('opacity-0', 'pointer-events-none');
    mainMenuModal.classList.remove('opacity-100', 'pointer-events-auto');
  }

  // Reveal Top HUD, joystick & PC controls
  if (topHUD) {
    topHUD.classList.remove('opacity-0', 'pointer-events-none');
    topHUD.classList.add('opacity-100');
  }
  const pcControlsBar = document.getElementById('pcControlsBar');
  if (pcControlsBar) {
    if (!isMobileDevice() && window.innerWidth >= 1024) {
      pcControlsBar.classList.remove('hidden');
    } else {
      pcControlsBar.classList.add('hidden');
    }
  }
  const controlsDock = document.getElementById('mobileControlsDock') || document.getElementById('joystickWrapper');
  if (controlsDock) controlsDock.classList.remove('pointer-events-none');

  showToast("Ekspedisi Dimulai! Berlayar menembus batas lautan.", "anchor");
  updateHUD();
}

function returnToMainMenu() {
  closePauseModal();
  closeAllModals();

  isGameStarted = false;
  isGamePaused = true;

  // Show Main Menu
  if (mainMenuModal) {
    mainMenuModal.classList.remove('opacity-0', 'pointer-events-none');
    mainMenuModal.classList.add('opacity-100', 'pointer-events-auto');
  }

  // Hide Top HUD & controls
  if (topHUD) {
    topHUD.classList.add('opacity-0', 'pointer-events-none');
    topHUD.classList.remove('opacity-100');
  }
  const pcControlsBar = document.getElementById('pcControlsBar');
  if (pcControlsBar) pcControlsBar.classList.add('hidden');
  const controlsDock = document.getElementById('mobileControlsDock') || document.getElementById('joystickWrapper');
  if (controlsDock) controlsDock.classList.add('pointer-events-none');
}

if (btnMainMenuPlay) btnMainMenuPlay.addEventListener('click', startGameFromMenu);
if (btnMainMenuSettings) btnMainMenuSettings.addEventListener('click', () => openSettingsModal('mainMenu'));
if (btnMainMenuCodex) btnMainMenuCodex.addEventListener('click', openLoreModal);
if (btnMainMenuControls) btnMainMenuControls.addEventListener('click', openHelpModal);

// Pause Menu Handlers
function openPauseModal() {
  if (!isGameStarted || (gameOverModal && gameOverModal.classList.contains('modal-active'))) return;
  sound.init();
  closeUpgradeModal();
  closeLoreModal();
  closeHelpModal();
  if (settingsModal && settingsModal.classList.contains('modal-active')) {
    settingsModal.classList.remove('modal-active');
    settingsModal.classList.add('modal-enter', 'hidden');
  }

  if (pauseModal) {
    updateDifficultyUI();
    const elPauseGen = document.getElementById('pauseWorldGenLabel');
    if (elPauseGen) {
      elPauseGen.innerText = `Peta Samudra: Generasi #${currentWorldGenNumber || 1} (Seed: ${currentWorldGenSeed || 'Default'})`;
    }
    pauseModal.classList.remove('modal-enter', 'hidden');
    pauseModal.classList.add('modal-active');
  }
  isGamePaused = true;
}

function closePauseModal() {
  if (!pauseModal) return;
  pauseModal.classList.remove('modal-active');
  pauseModal.classList.add('modal-enter', 'hidden');
  if (isGameStarted) {
    isGamePaused = false;
    lastTime = performance.now();
  }
}

function togglePauseModal() {
  if (!isGameStarted) return;
  if (pauseModal && pauseModal.classList.contains('modal-active')) {
    closePauseModal();
  } else {
    openPauseModal();
  }
}

function restartExpedition() {
  resetRoguelikeRun();
  closePauseModal();
  closeAllModals();
  isGamePaused = false;
  lastTime = performance.now();
  showToast("Ekspedisi baru dimulai! Map dan kapal telah direset.", "anchor");
}

if (btnPauseGame) btnPauseGame.addEventListener('click', openPauseModal);
if (btnResumeGame) btnResumeGame.addEventListener('click', closePauseModal);
if (btnRestartGame) btnRestartGame.addEventListener('click', restartExpedition);
if (btnPauseSettings) btnPauseSettings.addEventListener('click', () => {
  closePauseModal();
  openSettingsModal('pause');
});
if (btnReturnToMainMenu) btnReturnToMainMenu.addEventListener('click', returnToMainMenu);
if (pauseModal) {
  pauseModal.addEventListener('click', (e) => {
    if (e.target === pauseModal) closePauseModal();
  });
}

// Auto-pause when window loses focus (blur) or tab switches
window.addEventListener('blur', () => {
  if (isGameStarted && !isGamePaused && gameOverModal && !gameOverModal.classList.contains('modal-active') && mainMenuModal && mainMenuModal.classList.contains('opacity-0')) {
    openPauseModal();
  }
});

// Close all active modals
function closeAllModals() {
  let closedAny = false;
  if (loreModal && loreModal.classList.contains('modal-active')) {
    closeLoreModal();
    closedAny = true;
  }
  if (upgradeModal && upgradeModal.classList.contains('modal-active')) {
    closeUpgradeModal();
    closedAny = true;
  }
  if (helpModal && helpModal.classList.contains('modal-active')) {
    closeHelpModal();
    closedAny = true;
  }
  if (settingsModal && settingsModal.classList.contains('modal-active')) {
    closeSettingsModal();
    closedAny = true;
  }
  if (pauseModal && pauseModal.classList.contains('modal-active')) {
    closePauseModal();
    closedAny = true;
  }
  if (seaMapModal && seaMapModal.classList.contains('modal-active')) {
    closeMapModal();
    closedAny = true;
  }
  return closedAny;
}

// Game Over Modal & Hardcore Roguelike Respawn
function triggerGameOver(reason) {
  isGamePaused = true;
  closeAllModals();
  if (pauseModal) {
    pauseModal.classList.remove('modal-active');
    pauseModal.classList.add('modal-enter', 'hidden');
  }

  const reasonEl = document.getElementById('gameOverReason');
  const statDistEl = document.getElementById('statMaxDist');
  const statKillsEl = document.getElementById('statKills');
  const statSalvagesEl = document.getElementById('statSalvages');

  if (reasonEl) reasonEl.innerText = reason;
  if (statDistEl) statDistEl.innerText = `${playerState.maxDistanceReached}m`;
  if (statKillsEl) statKillsEl.innerText = playerState.kills;
  if (statSalvagesEl) statSalvagesEl.innerText = playerState.salvages;

  // Immediately wipe save data from localStorage on perma-death
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}

  if (gameOverModal) {
    gameOverModal.classList.remove('modal-enter', 'hidden');
    gameOverModal.classList.add('modal-active');
  }
}

if (btnRespawn) {
  btnRespawn.addEventListener('click', () => {
    // Perform full roguelike reset: upgrades, stats, currencies, procedural island seeds
    resetRoguelikeRun();

    if (gameOverModal) {
      gameOverModal.classList.remove('modal-active');
      gameOverModal.classList.add('modal-enter', 'hidden');
    }
    isGamePaused = false;
    lastTime = performance.now();
    showToast("Ekspedisi baru dimulai di Pelabuhan Nusa Damai!", "anchor");
  });
}

// Toggle Sound with SVG Icon
function toggleSound() {
  sound.init();
  sound.muted = !sound.muted;
  if (soundIcon) {
    soundIcon.innerHTML = sound.muted ? SVG_ICONS.soundOff : SVG_ICONS.soundOn;
  }
  if (chkMuteAll) {
    chkMuteAll.checked = sound.muted;
  }
  showToast(sound.muted ? "Suara Dimatikan (Mute)" : "Suara Diaktifkan", sound.muted ? "alert" : "check");
}

if (btnToggleSound) btnToggleSound.addEventListener('click', toggleSound);

// Check Coordinates
function showCoordinates() {
  const dist = Math.floor(Math.hypot(playerState.x, playerState.y));
  showToast(`Posisi Armada: X:${Math.round(playerState.x)} Y:${Math.round(playerState.y)} (Jarak: ${dist}m)`, "compass");
}

if (btnCenterCamera) btnCenterCamera.addEventListener('click', showCoordinates);

