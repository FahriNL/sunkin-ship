/* ==========================================================================
   LAUT DARAH - UI MODALS & DIALOGS ENGINE
   Shipyard Upgrades, Clan Codex Lore, Game Over Screen, Controls Guide, & SVG Audio
   ========================================================================== */

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
  loreModal.classList.remove('modal-enter');
  loreModal.classList.add('modal-active');
  isGamePaused = true;
}

function closeLoreModal() {
  if (!loreModal) return;
  loreModal.classList.remove('modal-active');
  loreModal.classList.add('modal-enter');
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
  helpModal.classList.remove('modal-enter');
  helpModal.classList.add('modal-active');
  isGamePaused = true;
}

function closeHelpModal() {
  if (!helpModal) return;
  helpModal.classList.remove('modal-active');
  helpModal.classList.add('modal-enter');
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
  closeLoreModal();
  closeHelpModal();
  renderUpgradeUI();
  upgradeModal.classList.remove('modal-enter');
  upgradeModal.classList.add('modal-active');
  isGamePaused = true;
}

function closeUpgradeModal() {
  if (!upgradeModal) return;
  upgradeModal.classList.remove('modal-active');
  upgradeModal.classList.add('modal-enter');
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
  return closedAny;
}

// Game Over Modal & Respawn
function triggerGameOver(reason) {
  isGamePaused = true;
  closeAllModals();
  const reasonEl = document.getElementById('gameOverReason');
  const statDistEl = document.getElementById('statMaxDist');
  const statKillsEl = document.getElementById('statKills');
  const statSalvagesEl = document.getElementById('statSalvages');

  if (reasonEl) reasonEl.innerText = reason;
  if (statDistEl) statDistEl.innerText = `${playerState.maxDistanceReached}m`;
  if (statKillsEl) statKillsEl.innerText = playerState.kills;
  if (statSalvagesEl) statSalvagesEl.innerText = playerState.salvages;

  if (gameOverModal) {
    gameOverModal.classList.remove('modal-enter');
    gameOverModal.classList.add('modal-active');
  }
}

if (btnRespawn) {
  btnRespawn.addEventListener('click', () => {
    playerState.x = PLAYER_SPAWN.x;
    playerState.y = PLAYER_SPAWN.y;
    playerState.angle = PLAYER_SPAWN.angle;
    playerState.hp = getStatValue('hull', playerState.upgrades.hull);
    entities.enemies = [];
    entities.sinkingShips = [];
    entities.projectiles = [];
    entities.mines = [];
    saveGame();

    if (gameOverModal) {
      gameOverModal.classList.remove('modal-active');
      gameOverModal.classList.add('modal-enter');
    }
    isGamePaused = false;
    lastTime = performance.now();
    showToast("Berlabuh kembali di Dermaga Nusa Damai.", "anchor");
  });
}

// Toggle Sound with SVG Icon
function toggleSound() {
  sound.init();
  sound.muted = !sound.muted;
  if (soundIcon) {
    soundIcon.innerHTML = sound.muted ? SVG_ICONS.soundOff : SVG_ICONS.soundOn;
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
