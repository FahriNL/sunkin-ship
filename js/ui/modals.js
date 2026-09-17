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
  closeLoreModal();
  closeHelpModal();
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

// Settings Modal Management
function openSettingsModal(fromTarget = 'game') {
  sound.init();
  settingsReturnTarget = fromTarget;
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
  if (pcControlsBar) pcControlsBar.classList.remove('hidden');
  const joystickWrapper = document.getElementById('joystickWrapper');
  if (joystickWrapper) joystickWrapper.classList.remove('pointer-events-none');

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
  const joystickWrapper = document.getElementById('joystickWrapper');
  if (joystickWrapper) joystickWrapper.classList.add('pointer-events-none');
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

