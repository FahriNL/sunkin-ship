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

// 3 Save Slots Modal & Delete Confirmation
const saveSlotsModal = document.getElementById('saveSlotsModal');
const btnCloseSaveSlots = document.getElementById('btnCloseSaveSlots');
const saveSlotsList = document.getElementById('saveSlotsList');
const deleteSlotConfirmModal = document.getElementById('deleteSlotConfirmModal');
const deleteSlotModalTitle = document.getElementById('deleteSlotModalTitle');
const btnCancelDeleteSlot = document.getElementById('btnCancelDeleteSlot');
const btnConfirmDeleteSlot = document.getElementById('btnConfirmDeleteSlot');
let slotPendingDeletion = null;

const pauseModal = document.getElementById('pauseModal');
const btnPauseGame = document.getElementById('btnPauseGame');
const btnResumeGame = document.getElementById('btnResumeGame');
const btnRestartGame = document.getElementById('btnRestartGame');
const btnPauseSettings = document.getElementById('btnPauseSettings');
const btnReturnToMainMenu = document.getElementById('btnReturnToMainMenu');
const pauseShipName = document.getElementById('pauseShipName');
const pauseShipRank = document.getElementById('pauseShipRank');
const pauseShipHp = document.getElementById('pauseShipHp');
const pauseCargoSum = document.getElementById('pauseCargoSum');

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
const tabSettingsAudio = document.getElementById('tabSettingsAudio');
const tabSettingsGraphics = document.getElementById('tabSettingsGraphics');
const tabSettingsGameplay = document.getElementById('tabSettingsGameplay');
const panelSettingsAudio = document.getElementById('panelSettingsAudio');
const panelSettingsGraphics = document.getElementById('panelSettingsGraphics');
const panelSettingsGameplay = document.getElementById('panelSettingsGameplay');
const btnQualityHigh = document.getElementById('btnQualityHigh');
const btnQualityMed = document.getElementById('btnQualityMed');
const btnQualityLow = document.getElementById('btnQualityLow');
const btnOpenControlsFromSettings = document.getElementById('btnOpenControlsFromSettings');
const btnCloseSettingsBottom = document.getElementById('btnCloseSettingsBottom');

const labelDifficultyBadge = document.getElementById('labelDifficultyBadge');
const labelDifficultyDesc = document.getElementById('labelDifficultyDesc');
const btnDiffEasy = document.getElementById('btnDiffEasy');
const btnDiffMedium = document.getElementById('btnDiffMedium');
const btnDiffHard = document.getElementById('btnDiffHard');
const btnMainMenuDiffCycle = document.getElementById('btnMainMenuDiffCycle');
const mainMenuDiffText = document.getElementById('mainMenuDiffText');
const pauseDiffBadge = document.getElementById('pauseDiffBadge');

let settingsReturnTarget = 'mainMenu'; // 'mainMenu' | 'pause' | 'game'
let pauseReturnTarget = null; // null | 'pause'

const btnPauseToggleSound = document.getElementById('btnPauseToggleSound');
const pauseSoundIcon = document.getElementById('pauseSoundIcon');
const pauseSoundLabel = document.getElementById('pauseSoundLabel');
const btnPauseLore = document.getElementById('btnPauseLore');
const btnPauseMap = document.getElementById('btnPauseMap');
const btnPauseHelp = document.getElementById('btnPauseHelp');
const btnDockShop = document.getElementById('btnDockShop');

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
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  for (const [key, clan] of Object.entries(CLAN_LORE)) {
    if (key === 'batavia') continue;
    const card = document.createElement('div');
    card.className = `p-3.5 rounded-2xl border bg-gradient-to-br ${clan.bgClass} flex flex-col gap-2`;

    const clanName = (isEn && clan.nameEn) ? clan.nameEn : clan.name;
    const clanSpecies = (isEn && clan.speciesEn) ? clan.speciesEn : clan.species;
    const clanLore = (isEn && clan.loreEn) ? clan.loreEn : clan.lore;

    let tiersHtml = '';
    clan.tiers.forEach(t => {
      const tName = (isEn && t.nameEn) ? t.nameEn : t.name;
      const tDesc = (isEn && t.descEn) ? t.descEn : t.desc;
      tiersHtml += `
        <div class="bg-black/40 p-2 rounded-xl border border-white/5 flex flex-col gap-0.5">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-white flex items-center gap-1.5">
              <span class="text-[9px] px-1.5 py-0.5 rounded font-black" style="background-color: ${clan.badgeColor}; color: #000;">Lv.${t.level}</span>
              ${tName}
            </span>
            <span class="text-[10px] text-slate-300 font-mono">HP: ${t.hp} • DMG: ${t.damage}</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">${tDesc}</p>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-cinzel text-sm font-black" style="color: ${clan.badgeColor}">${clanName}</h3>
            <span class="text-[9px] px-2 py-0.5 rounded-full bg-black/60 text-slate-300 border border-white/10 font-bold uppercase">${clanSpecies}</span>
          </div>
          <p class="text-[10px] text-slate-300 mt-1 leading-relaxed">${clanLore}</p>
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
  if (pauseReturnTarget === 'pause') {
    pauseReturnTarget = null;
    openPauseModal();
    return;
  }
  if (isGameStarted) {
    isGamePaused = false;
    lastTime = performance.now();
  }
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
// Controls Help Modal
function openHelpModal() {
  sound.init();
  closeUpgradeModal();
  closeLoreModal();
  if (!helpModal) return;
  helpModal.classList.remove('modal-enter', 'hidden');
  helpModal.classList.add('modal-active');
  isGamePaused = true;

  // Auto-switch to active input device tab
  if (typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad')) {
    switchHelpTab('gamepad');
  } else {
    switchHelpTab('keyboard');
  }
}

function closeHelpModal() {
  if (!helpModal) return;
  helpModal.classList.remove('modal-active');
  helpModal.classList.add('modal-enter', 'hidden');
  if (pauseReturnTarget === 'pause') {
    pauseReturnTarget = null;
    openPauseModal();
    return;
  }
  if (isGameStarted) {
    isGamePaused = false;
    lastTime = performance.now();
  }
}

function switchHelpTab(tab) {
  const btnKbd = document.getElementById('helpTabBtnKeyboard');
  const btnPad = document.getElementById('helpTabBtnGamepad');
  const paneKbd = document.getElementById('helpKeyboardContent');
  const panePad = document.getElementById('helpGamepadContent');
  const statusEl = document.getElementById('helpGamepadStatus');

  if (tab === 'gamepad') {
    if (btnPad) {
      btnPad.className = "flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-pointer flex items-center justify-center gap-1.5 transition";
    }
    if (btnKbd) {
      btnKbd.className = "flex-1 py-1.5 px-2 rounded-lg text-slate-400 hover:text-slate-200 border border-transparent cursor-pointer flex items-center justify-center gap-1.5 transition";
    }
    if (paneKbd) paneKbd.classList.add('hidden');
    if (panePad) panePad.classList.remove('hidden');

    if (statusEl) {
      if (typeof connectedGamepadIndex !== 'undefined' && connectedGamepadIndex >= 0) {
        const isPS = typeof activeInputDevice !== 'undefined' && activeInputDevice === 'gamepad_ps';
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
  } else {
    if (btnKbd) {
      btnKbd.className = "flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-pointer flex items-center justify-center gap-1.5 transition";
    }
    if (btnPad) {
      btnPad.className = "flex-1 py-1.5 px-2 rounded-lg text-slate-400 hover:text-slate-200 border border-transparent cursor-pointer flex items-center justify-center gap-1.5 transition";
    }
    if (panePad) panePad.classList.add('hidden');
    if (paneKbd) paneKbd.classList.remove('hidden');
  }
}
window.switchHelpTab = switchHelpTab;

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

// ============================================================================
// PHASE 2: SHIPYARD CROSS-SECTION CUTAWAY & COMPARTMENT UPGRADE SYSTEM
// ============================================================================

const shipCutawayCanvas = document.getElementById('shipCutawayCanvas');
const compartmentDetailPanel = document.getElementById('compartmentDetailPanel');
const compartmentChipsBar = document.getElementById('compartmentChipsBar');
const shipyardTierBadge = document.getElementById('shipyardTierBadge');
const shipyardLocationLabel = document.getElementById('shipyardLocationLabel');
const shipyardGoldText = document.getElementById('shipyardGoldText');
const shipyardBloodText = document.getElementById('shipyardBloodText');
const cutawayHoverLabel = document.getElementById('cutawayHoverLabel');
const shipOverallTierTitle = document.getElementById('shipOverallTierTitle');
const maxProgressLabel = document.getElementById('maxProgressLabel');
const mobileUpgradeCinematicModal = document.getElementById('mobileUpgradeCinematicModal');
const cinematicCutawayCanvas = document.getElementById('cinematicCutawayCanvas');
const cinematicModuleTitle = document.getElementById('cinematicModuleTitle');
const cinematicModuleLevel = document.getElementById('cinematicModuleLevel');
const cinematicShipStatusTitle = document.getElementById('cinematicShipStatusTitle');
const upgradeCardsContainer = document.getElementById('upgradeCardsContainer');

let cinematicAnimId = null;
let cinematicStartTime = 0;
let cinematicParticles = [];

// 6 Functional Ship Compartments matching UPGRADE_CONFIG
const SHIP_COMPARTMENTS = {
  relicSiphon: {
    key: 'relicSiphon',
    name: "Haluan & Ram Relik (Forecastle)",
    nameEn: "Forecastle & Relic Ram",
    shortName: "Haluan & Ram",
    shortNameEn: "Forecastle & Ram",
    subtitle: "Moncong Depan, Tiang Cucur, Rantai Jangkar & Ram Pertempuran",
    subtitleEn: "Prow, Bowsprit, Anchor Chain & Combat Ram",
    lore: '"Moncong kapal diperkuat perunggu tebal dan ornamen naga abisal yang mampu meremukkan lambung lawan sekaligus menyedot esensi darah untuk memulihkan kapal."',
    loreEn: '"The ship prow is reinforced with heavy bronze and abyssal dragon ornamentation, capable of crushing enemy hulls while siphoning blood essence to restore ship integrity."',
    iconKey: "relicSiphon",
    rect: { x: 640, y: 170, w: 150, h: 175 },
    badgePos: { x: 715, y: 250 },
    statName: "Hisapan Darah (Vampirism)",
    statNameEn: "Blood Siphon (Vampirism)",
    getStatDesc: (lvl, isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en')) => {
      const cur = getStatValue('relicSiphon', lvl);
      const nxt = getStatValue('relicSiphon', lvl + 1);
      if (isEn) {
        return lvl === 0 ? `Locked -> +${nxt.toFixed(1)} HP per hit` : `+${cur.toFixed(1)} HP -> +${nxt.toFixed(1)} HP per hit (+4.5)`;
      }
      return lvl === 0 ? `Terkunci -> +${nxt.toFixed(1)} HP per pukulan` : `+${cur.toFixed(1)} HP -> +${nxt.toFixed(1)} HP per pukulan (+4.5)`;
    }
  },
  speed: {
    key: 'speed',
    name: "Geladak Utama & Layar (Main Deck & Rigging)",
    nameEn: "Main Deck & Rigging",
    shortName: "Geladak & Layar",
    shortNameEn: "Deck & Rigging",
    subtitle: "Tiang Layar Bertingkat, Tangga Tali, Roda Kemudi & Kompas",
    subtitleEn: "Tiered Masts, Rigging, Ship Wheel & Compass",
    lore: '"Ketinggian tiang layar kayu ulin dan rajutan tambang sutra rami memungkinkan kapal membelah angin kencang dengan kelincahan manuver mematikan."',
    loreEn: '"Ironwood masts and braided hemp rigging allow the ship to cleave high winds with lethal maneuverability."',
    iconKey: "speed",
    rect: { x: 270, y: 25, w: 370, h: 185 },
    badgePos: { x: 455, y: 105 },
    statName: "Kecepatan Jelajah & Kelincahan",
    statNameEn: "Cruising Speed & Agility",
    getStatDesc: (lvl, isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en')) => {
      const cur = getStatValue('speed', lvl);
      const nxt = getStatValue('speed', lvl + 1);
      return `${cur.toFixed(2)} knot -> ${nxt.toFixed(2)} knot (+0.65 Spd)`;
    }
  },
  cannons: {
    key: 'cannons',
    name: "Geladak Meriam (Gun Deck & Powder Magazine)",
    nameEn: "Gun Deck & Powder Magazine",
    shortName: "Geladak Meriam",
    shortNameEn: "Gun Deck",
    subtitle: "Baterai Meriam Samping, Kereta Roda Kayu & Peti Amunisi",
    subtitleEn: "Broadside Cannons, Timber Carriages & Ammo Crates",
    lore: '"Lantai tengah kapal dirancang meredam sentakan dentuman meriam kaliber berat, dilengkapi laci mesiu kedap air untuk tembakan broadside beruntun."',
    loreEn: '"The mid-deck is built to dampen heavy caliber broadside recoils, equipped with watertight powder magazines for continuous salvos."',
    iconKey: "cannons",
    rect: { x: 270, y: 210, w: 370, h: 75 },
    badgePos: { x: 455, y: 248 },
    statName: "Kapasitas Slot Meriam (Cannon Slots)",
    statNameEn: "Cannon Slot Capacity",
    getStatDesc: (lvl, isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en')) => {
      const curSlots = (typeof getMaxCannonSlots === 'function') ? getMaxCannonSlots(lvl) : Math.min(4, 1 + Math.floor(lvl / 2));
      const nxtSlots = (typeof getMaxCannonSlots === 'function') ? getMaxCannonSlots(lvl + 1) : Math.min(4, 1 + Math.floor((lvl + 1) / 2));
      if (isEn) {
        return `${curSlots} Active Cannon Slots -> ${nxtSlots} Cannon Slots (+1 New Slot)`;
      }
      return `${curSlots} Slot Meriam Aktif -> ${nxtSlots} Slot Meriam (+1 Slot Baru)`;
    }
  },
  hull: {
    key: 'hull',
    name: "Palka Bawah & Ballast (Bilge & Lower Hold)",
    nameEn: "Bilge & Lower Hold",
    shortName: "Palka & Lambung",
    shortNameEn: "Hold & Hull",
    subtitle: "Gading Lambung Kayu Lapis, Pompa Air Ballast & Peti Kargo",
    subtitleEn: "Reinforced Ribbing, Bilge Pumps & Cargo Hold",
    lore: '"Dasar terdalam lambung kapal diperkuat balok kayu ulin lapis ganda dan batu ballast pemberat ombak, mencegah kebocoran fatal di laut ganas."',
    loreEn: '"The deepest hull foundation is reinforced with double-layered ironwood and ballast stones, preventing catastrophic leaks in rough seas."',
    iconKey: "hull",
    rect: { x: 270, y: 285, w: 370, h: 75 },
    badgePos: { x: 455, y: 322 },
    statName: "Ketahanan Lambung (Max HP)",
    statNameEn: "Hull Durability (Max HP)",
    getStatDesc: (lvl, isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en')) => {
      const cur = getStatValue('hull', lvl);
      const nxt = getStatValue('hull', lvl + 1);
      return `${cur} Max HP -> ${nxt} Max HP (+75 HP)`;
    }
  },
  stealthCamo: {
    key: 'stealthCamo',
    name: "Kabin Kapten & Navigasi (Captain's Cabin)",
    nameEn: "Captain's Cabin & Navigation",
    shortName: "Kabin Kapten",
    shortNameEn: "Captain's Cabin",
    subtitle: "Meja Peta Kuno, Galeri Kaca Buritan & Dupa Siluman Kabut",
    subtitleEn: "Ancient Chart Table, Stern Gallery & Stealth Incense",
    lore: '"Ruang komando pribadi kapten menyimpan instrumen navigasi bahari dan pembakar dupa kabut gaib yang menyamarkan siluet kapal dari intaian musuh."',
    loreEn: '"The captain\'s private quarters house nautical charts and mystical fog incense that masks the ship\'s silhouette from enemy eyes."',
    iconKey: "stealthCamo",
    rect: { x: 120, y: 160, w: 150, h: 80 },
    badgePos: { x: 195, y: 200 },
    statName: "Reduksi Deteksi (Stealth)",
    statNameEn: "Detection Reduction (Stealth)",
    getStatDesc: (lvl, isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en')) => {
      const cur = Math.round((1 - getStatValue('stealthCamo', lvl)) * 100);
      const nxt = Math.round((1 - getStatValue('stealthCamo', lvl + 1)) * 100);
      if (isEn) {
        return `${cur}% Camouflage -> ${nxt}% Camouflage (-12% Detection)`;
      }
      return `${cur}% Kamuflase -> ${nxt}% Kamuflase (-12% Deteksi)`;
    }
  },
  rearDefense: {
    key: 'rearDefense',
    name: "Geladak Buritan & Ranjau (Stern Castle & Mine Station)",
    nameEn: "Stern Castle & Mine Station",
    shortName: "Buritan & Ranjau",
    shortNameEn: "Stern & Mines",
    subtitle: "Saluran Luncur Ranjau, Katrol Derek & Meriam Putar Belakang",
    subtitleEn: "Mine Chute, Winch Cranes & Rear Swivel Chaser",
    lore: '"Menara buritan bertingkat mengawasi titik buta kapal, dilengkapi pelontar mekanik untuk menebar ranjau mesiu berduri bagi musuh yang membuntuti."',
    loreEn: '"The tiered stern castle monitors the ship\'s blind spot, equipped with mechanical deployers to lay spiked naval mines for pursuers."',
    iconKey: "rearDefense",
    rect: { x: 120, y: 240, w: 150, h: 110 },
    badgePos: { x: 195, y: 295 },
    statName: "Ranjau & Meriam Belakang",
    statNameEn: "Naval Mines & Stern Chaser",
    getStatDesc: (lvl, isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en')) => {
      const cur = getStatValue('rearDefense', lvl);
      const nxt = getStatValue('rearDefense', lvl + 1);
      if (isEn) {
        return lvl === 0 ? `Locked -> Active (${nxt} Mine Dmg)` : `${cur} Dmg -> ${nxt} Mine/Chaser Dmg`;
      }
      return lvl === 0 ? `Terkunci -> Aktif (${nxt} Dmg Ranjau)` : `${cur} Dmg -> ${nxt} Dmg Ranjau/Chaser`;
    }
  }
};

const cutawayState = {
  selectedKey: 'cannons',
  hoveredKey: null,
  animTime: 0,
  particles: []
};

let cutawayAnimationId = null;

// Convert client mouse/touch event coordinates into virtual 880x440 canvas coordinates
function getCutawayCanvasCoords(e) {
  if (!shipCutawayCanvas) return { x: 0, y: 0 };
  const rect = shipCutawayCanvas.getBoundingClientRect();
  let clientX = e.clientX;
  let clientY = e.clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  }
  const w = rect.width > 0 ? rect.width : 1;
  const h = rect.height > 0 ? rect.height : 1;
  const fitScale = Math.min(w / 880, h / 440);
  const offsetX = (w - 880 * fitScale) / 2;
  const offsetY = (h - 440 * fitScale) / 2;
  return {
    x: ((clientX - rect.left) - offsetX) / fitScale,
    y: ((clientY - rect.top) - offsetY) / fitScale
  };
}

function findCompartmentAt(x, y) {
  // 1. Direct bounding box hit
  for (const comp of Object.values(SHIP_COMPARTMENTS)) {
    const r = comp.rect;
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
      return comp.key;
    }
  }

  // 2. Proximity fallback: check distance to badge center or compartment center (up to 45px tolerance)
  let closestKey = null;
  let minDistSq = 45 * 45;
  for (const comp of Object.values(SHIP_COMPARTMENTS)) {
    const bp = comp.badgePos;
    const dx = x - bp.x;
    const dy = y - bp.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < minDistSq) {
      minDistSq = dSq;
      closestKey = comp.key;
    }
  }
  return closestKey;
}

// Draw the master architectural cutaway schematic on the HTML5 canvas (Fullscreen Responsive View)
let lastCutawayFrameTime = 0;

function renderShipCutaway(timestamp) {
  if (!shipCutawayCanvas || !upgradeModal || !upgradeModal.classList.contains('modal-active')) return;
  const isMobile = isMobileDevice() || window.innerWidth < 1024;

  // Battery & thermal throttling: 30 FPS on mobile phones to prevent processor heating
  if (isMobile && timestamp) {
    if (timestamp - lastCutawayFrameTime < 32) {
      cutawayAnimationId = requestAnimationFrame(renderShipCutaway);
      return;
    }
    lastCutawayFrameTime = timestamp;
  }

  const ctx = shipCutawayCanvas.getContext('2d');
  if (!ctx) return;

  const rect = shipCutawayCanvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  // DPR Capping: 1.5 on mobile to avoid 4K GPU overdraw, 2 on desktop
  const dpr = isMobile ? Math.min(1.5, window.devicePixelRatio || 1) : Math.min(2, window.devicePixelRatio || 1);
  const targetW = Math.round(rect.width * dpr);
  const targetH = Math.round(rect.height * dpr);

  if (shipCutawayCanvas.width !== targetW || shipCutawayCanvas.height !== targetH) {
    shipCutawayCanvas.width = targetW;
    shipCutawayCanvas.height = targetH;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Background fill for full canvas viewport
  ctx.fillStyle = '#04070e';
  ctx.fillRect(0, 0, rect.width, rect.height);

  // Uniform aspect-ratio fitting (880 x 440 = 2:1 locked proportion)
  const fitScale = Math.min(rect.width / 880, rect.height / 440);
  const offsetX = (rect.width - 880 * fitScale) / 2;
  const offsetY = (rect.height - 440 * fitScale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(fitScale, fitScale);

  cutawayState.animTime += 0.035;
  drawMasterCutawayGraphic(ctx, cutawayState.animTime, cutawayState.selectedKey, 0, cutawayState.particles);
  ctx.restore();

  if (upgradeModal && upgradeModal.classList.contains('modal-active')) {
    cutawayAnimationId = requestAnimationFrame(renderShipCutaway);
  }
}

// Master schematic rendering routine shared by PC cutaway & Android cinematic zoom animation
function drawMasterCutawayGraphic(ctx, t, highlightKey = null, highlightPulse = 0, customParticles = null) {
  // 1. Deep Parchment / Ocean Blueprint Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 440);
  bgGrad.addColorStop(0, '#060a12');
  bgGrad.addColorStop(0.65, '#0b1322');
  bgGrad.addColorStop(1, '#080d19');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 880, 440);

  // Subtle architectural grid watermark lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let gx = 40; gx < 880; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, 440);
    ctx.stroke();
  }
  for (let gy = 40; gy < 440; gy += 40) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(880, gy);
    ctx.stroke();
  }

  // 2. Calm Ocean Waterline under keel
  const waterY = 320;
  ctx.fillStyle = 'rgba(14, 116, 144, 0.12)';
  ctx.beginPath();
  ctx.moveTo(0, waterY);
  for (let wx = 0; wx <= 880; wx += 20) {
    ctx.lineTo(wx, waterY + Math.sin(wx * 0.015 + t * 1.5) * 4);
  }
  ctx.lineTo(880, 440);
  ctx.lineTo(0, 440);
  ctx.closePath();
  ctx.fill();

  // Waterline surface sheen
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let wx = 0; wx <= 880; wx += 20) {
    const wy = waterY + Math.sin(wx * 0.015 + t * 1.5) * 4;
    if (wx === 0) ctx.moveTo(wx, wy);
    else ctx.lineTo(wx, wy);
  }
  ctx.stroke();

  // 3. Draw Outer Hull Framework Silhouette
  ctx.save();

  // Keel beam & outer planking curve
  ctx.fillStyle = '#241208';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(120, 160); // Quarterdeck stern top
  ctx.lineTo(120, 240); // Stern drop
  ctx.bezierCurveTo(115, 280, 130, 350, 180, 360); // Stern curve to keel
  ctx.lineTo(700, 360); // Flat keel bottom
  ctx.bezierCurveTo(740, 350, 770, 270, 755, 175); // Prow bow sweep
  ctx.lineTo(640, 180); // Forecastle step
  ctx.lineTo(640, 210); // Down to main deck
  ctx.lineTo(270, 210); // Main deck run
  ctx.lineTo(270, 160); // Quarterdeck step
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Heavy Keel Beam at bottom
  ctx.fillStyle = '#1c0d06';
  ctx.fillRect(170, 355, 540, 14);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(170, 355, 540, 14);

  // Stern Rudder Post
  ctx.fillStyle = '#3a1a08';
  ctx.fillRect(100, 255, 18, 105);
  ctx.strokeStyle = '#78350f';
  ctx.strokeRect(100, 255, 18, 105);

  // Bowsprit spar reaching forward
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(740, 180);
  ctx.lineTo(865, 95);
  ctx.lineTo(865, 105);
  ctx.lineTo(740, 195);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 4. Render the 6 Cutaway Compartments
  const hullLvl = (playerState.upgrades && playerState.upgrades.hull) || 1;
  const speedLvl = (playerState.upgrades && playerState.upgrades.speed) || 1;
  const cannonLvl = (playerState.upgrades && playerState.upgrades.cannons) || 1;
  const rearLvl = (playerState.upgrades && playerState.upgrades.rearDefense) || 0;
  const stealthLvl = (playerState.upgrades && playerState.upgrades.stealthCamo) || 1;
  const relicLvl = (playerState.upgrades && playerState.upgrades.relicSiphon) || 1;

  for (const comp of Object.values(SHIP_COMPARTMENTS)) {
    const r = comp.rect;
    const isSelected = (comp.key === highlightKey || cutawayState.selectedKey === comp.key);
    const isHovered = (cutawayState.hoveredKey === comp.key);
    const lvl = (playerState.upgrades && playerState.upgrades[comp.key]) || 0;
    const conf = UPGRADE_CONFIG[comp.key];
    const isMax = lvl >= conf.maxLevel;
    const canAfford = !isMax && (typeof checkCanAffordCompartmentUpgrade === 'function' ? checkCanAffordCompartmentUpgrade(comp.key, lvl + 1) : false);

    ctx.save();

    // Compartment interior chamber base fill
    ctx.fillStyle = isSelected 
      ? 'rgba(245, 158, 11, 0.14)' 
      : (isHovered ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 23, 42, 0.35)');
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // Deck plank floor and boundary joists
    if (comp.key === highlightKey && highlightPulse > 0) {
      ctx.strokeStyle = `rgba(251, 191, 36, ${Math.min(1, 0.7 + highlightPulse * 0.3)})`;
      ctx.lineWidth = 3.5;
    } else {
      ctx.strokeStyle = isSelected 
        ? '#fbbf24' 
        : (isHovered ? '#f59e0b' : 'rgba(217, 119, 6, 0.45)');
      ctx.lineWidth = isSelected ? 2.2 : (isHovered ? 1.8 : 1.2);
    }
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    // Subtle wooden ceiling & floor beam lines
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h - 3);
    ctx.lineTo(r.x + r.w, r.y + r.h - 3);
    ctx.stroke();

    // -------------------------------------------------------------
    // PROCEDURAL INTERIOR PROPS PER COMPARTMENT & LEVEL
    // -------------------------------------------------------------
    if (comp.key === 'speed') {
      // 1. MAIN DECK & RIGGING (speed)
      // Billowing Sails & 3 Towering Masts
      const masts = [
        { x: 330, scale: 0.75, name: 'Mizzen' },
        { x: 455, scale: 1.0,  name: 'Main' },
        { x: 575, scale: 0.85, name: 'Fore' }
      ];

      masts.forEach((m, idx) => {
        // Only draw Fore/Mizzen if speedLvl >= 2 or 4
        if (idx === 0 && speedLvl < 4) return;
        if (idx === 2 && speedLvl < 2) return;

        // Mast pole
        ctx.fillStyle = '#291508';
        ctx.fillRect(m.x - 3, 20, 6, 190);
        ctx.strokeStyle = '#78350f';
        ctx.strokeRect(m.x - 3, 20, 6, 190);

        // Crow's nest lookout
        if (speedLvl >= 3) {
          ctx.fillStyle = '#451a03';
          ctx.fillRect(m.x - 10, 50, 20, 10);
        }

        // Billowing canvas sails (animated wind sway)
        const sway = Math.sin(t * 1.8 + idx) * 3;
        ctx.fillStyle = stealthLvl >= 4 ? 'rgba(51, 65, 85, 0.85)' : 'rgba(248, 250, 252, 0.88)';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;

        // Lower yard & sail
        ctx.beginPath();
        ctx.moveTo(m.x - 36 * m.scale, 75);
        ctx.quadraticCurveTo(m.x + sway, 105, m.x + 40 * m.scale, 75);
        ctx.lineTo(m.x + 36 * m.scale, 130);
        ctx.quadraticCurveTo(m.x + sway * 1.2, 145, m.x - 32 * m.scale, 130);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Upper topsail if speedLvl >= 3
        if (speedLvl >= 3) {
          ctx.beginPath();
          ctx.moveTo(m.x - 26 * m.scale, 30);
          ctx.quadraticCurveTo(m.x + sway * 0.8, 52, m.x + 28 * m.scale, 30);
          ctx.lineTo(m.x + 24 * m.scale, 65);
          ctx.quadraticCurveTo(m.x + sway, 75, m.x - 22 * m.scale, 65);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Rigging ropes
        ctx.strokeStyle = 'rgba(180, 130, 80, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(m.x, 25);
        ctx.lineTo(m.x - 45 * m.scale, 205);
        ctx.moveTo(m.x, 25);
        ctx.lineTo(m.x + 45 * m.scale, 205);
        ctx.stroke();
      });

      // Ship's Helm Wheel on Main Deck
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(385, 195, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(385, 195, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (comp.key === 'cannons') {
      // 2. GUN DECK (cannons) - Procedural Rendering of Equipped Faction Cannons
      const maxSlots = (typeof getMaxCannonSlots === 'function') 
        ? getMaxCannonSlots(cannonLvl) 
        : Math.min(4, 1 + Math.floor(cannonLvl / 2));
      const equipped = playerState.equippedCannons || [];
      const slotSpacing = (r.w - 75) / maxSlots;

      for (let s = 0; s < maxSlots; s++) {
        const gx = r.x + 35 + s * slotSpacing + slotSpacing * 0.45;
        const gy = r.y + 36;
        const cannon = equipped[s];

        if (cannon) {
          const type = cannon.type || 'standard';
          const durRatio = Math.max(0, Math.min(1, cannon.durability / cannon.maxDurability));
          const isJammed = cannon.durability <= 0;

          ctx.save();
          if (type === 'mist') {
            // MIST OCCULT CANNON: Spectral cyan runes, occult glow, ghostly wisps
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = isJammed ? 0 : 8;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(gx - 13, gy + 8, 26, 12);
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 1;
            ctx.strokeRect(gx - 13, gy + 8, 26, 12);

            ctx.fillStyle = '#164e63';
            ctx.beginPath();
            ctx.arc(gx - 9, gy + 20, 5, 0, Math.PI * 2);
            ctx.arc(gx + 9, gy + 20, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#67e8f9';
            ctx.stroke();

            ctx.fillStyle = isJammed ? '#334155' : '#0891b2';
            ctx.fillRect(gx - 17, gy - 2, 32, 10);
            ctx.fillStyle = '#67e8f9';
            ctx.fillRect(gx + 13, gy - 1, 5, 8);

            if (!isJammed) {
              const wispY = gy - 7 + Math.sin(t * 4 + s) * 3;
              ctx.fillStyle = 'rgba(103, 232, 249, 0.8)';
              ctx.beginPath();
              ctx.arc(gx - 2, wispY, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }

          } else if (type === 'frost') {
            // FROST VIKING CANNON: Pale blue/white metal, hanging icicles
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = isJammed ? 0 : 6;

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(gx - 13, gy + 8, 26, 12);
            ctx.strokeStyle = '#7dd3fc';
            ctx.lineWidth = 1;
            ctx.strokeRect(gx - 13, gy + 8, 26, 12);

            ctx.fillStyle = '#0369a1';
            ctx.beginPath();
            ctx.arc(gx - 9, gy + 20, 5, 0, Math.PI * 2);
            ctx.arc(gx + 9, gy + 20, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = isJammed ? '#475569' : '#0284c7';
            ctx.fillRect(gx - 17, gy - 2, 32, 10);
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(gx + 13, gy - 1, 5, 8);

            if (!isJammed) {
              ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
              ctx.beginPath();
              ctx.moveTo(gx - 5, gy + 8);
              ctx.lineTo(gx - 2, gy + 14);
              ctx.lineTo(gx + 1, gy + 8);
              ctx.fill();
            }

          } else if (type === 'wokou') {
            // WOKOU BAMBOO ROCKET SALVO: Triple green bamboo cluster, red lacquer carriage
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(gx - 14, gy + 8, 28, 12);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(gx - 14, gy + 8, 28, 12);

            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.arc(gx - 9, gy + 20, 5, 0, Math.PI * 2);
            ctx.arc(gx + 9, gy + 20, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = isJammed ? '#3f6212' : '#16a34a';
            ctx.fillRect(gx - 16, gy - 4, 30, 4);
            ctx.fillRect(gx - 18, gy + 1, 32, 4);
            ctx.fillRect(gx - 16, gy + 6, 30, 4);

            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(gx - 6, gy - 5, 3, 16);
            ctx.fillRect(gx + 8, gy - 5, 3, 16);

          } else if (type === 'chitin') {
            // CHITIN BIO-ORGANIC CANNON: Deep crimson shell, monster teeth, pulsating veins
            ctx.shadowColor = '#e11d48';
            ctx.shadowBlur = isJammed ? 0 : 7;

            ctx.fillStyle = '#4c0519';
            ctx.fillRect(gx - 13, gy + 8, 26, 12);
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1;
            ctx.strokeRect(gx - 13, gy + 8, 26, 12);

            ctx.fillStyle = '#881337';
            ctx.beginPath();
            ctx.arc(gx - 9, gy + 20, 5, 0, Math.PI * 2);
            ctx.arc(gx + 9, gy + 20, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = isJammed ? '#4c0519' : '#9f1239';
            ctx.fillRect(gx - 16, gy - 2, 30, 10);

            ctx.fillStyle = '#fecdd3';
            ctx.beginPath();
            ctx.moveTo(gx + 14, gy - 3);
            ctx.lineTo(gx + 20, gy + 3);
            ctx.lineTo(gx + 14, gy + 9);
            ctx.closePath();
            ctx.fill();

          } else {
            // STANDARD IRON CANNON
            ctx.fillStyle = '#78350f';
            ctx.fillRect(gx - 14, gy + 8, 28, 12);
            ctx.fillStyle = '#1c0d06';
            ctx.beginPath();
            ctx.arc(gx - 10, gy + 20, 5, 0, Math.PI * 2);
            ctx.arc(gx + 10, gy + 20, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = isJammed ? '#475569' : (cannonLvl >= 5 ? '#d97706' : '#1e293b');
            ctx.fillRect(gx - 18, gy - 2, 34, 10);
            ctx.fillRect(gx + 14, gy, 6, 6);
          }
          ctx.restore();

          // Durability Gauge Mini-Bar under gun
          const barW = 28;
          const barH = 3;
          const barX = gx - barW / 2;
          const barY = gy + 27;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(barX, barY, barW, barH);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(barX, barY, barW, barH);

          ctx.fillStyle = isJammed ? '#ef4444' : (durRatio > 0.5 ? '#10b981' : (durRatio > 0.25 ? '#f59e0b' : '#ef4444'));
          ctx.fillRect(barX, barY, barW * durRatio, barH);

          ctx.font = 'bold 7px "Plus Jakarta Sans", monospace';
          ctx.fillStyle = isJammed ? '#f87171' : '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.fillText(isJammed ? 'RUSAK' : `${cannon.durability}/${cannon.maxDurability}`, gx, barY + 9);

        } else {
          // EMPTY UNLOCKED CANNON SLOT
          ctx.save();
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(gx - 16, gy - 4, 32, 30);
          ctx.setLineDash([]);

          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
          ctx.textAlign = 'center';
          ctx.fillText('+', gx, gy + 10);
          ctx.font = '7px sans-serif';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
          ctx.fillText('Slot Kosong', gx, gy + 20);
          ctx.restore();
        }
      }

      // Stack of cannonballs & powder kegs at far right
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(r.x + 342, r.y + 60, 4.5, 0, Math.PI * 2);
      ctx.arc(r.x + 351, r.y + 60, 4.5, 0, Math.PI * 2);
      ctx.arc(r.x + 346.5, r.y + 52, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Powder keg
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(r.x + 354, r.y + 48, 12, 16);
      ctx.strokeStyle = '#fde047';
      ctx.strokeRect(r.x + 354, r.y + 48, 12, 16);

    } else if (comp.key === 'hull') {
      // 3. CARGO HOLD & BILGE (hull)
      // Oak curved framing ribs
      ctx.strokeStyle = hullLvl >= 4 ? '#d97706' : '#78350f';
      ctx.lineWidth = hullLvl >= 4 ? 2.5 : 1.5;
      for (let ribX = r.x + 20; ribX < r.x + r.w - 10; ribX += 35) {
        ctx.beginPath();
        ctx.moveTo(ribX, r.y);
        ctx.lineTo(ribX, r.y + r.h);
        ctx.stroke();
      }

      // Ballast stones at bottom
      ctx.fillStyle = '#475569';
      for (let bx = r.x + 15; bx < r.x + 110; bx += 18) {
        ctx.beginPath();
        ctx.ellipse(bx, r.y + r.h - 7, 9, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Treasure Chest & Rum Barrels
      ctx.fillStyle = '#b45309';
      ctx.fillRect(r.x + 130, r.y + 42, 24, 18);
      ctx.strokeStyle = '#fbbf24';
      ctx.strokeRect(r.x + 130, r.y + 42, 24, 18);
      // Gold chest latch
      ctx.fillStyle = '#fde047';
      ctx.fillRect(r.x + 140, r.y + 48, 4, 6);

      // Rum Barrels
      for (let br = 0; br < 3; br++) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(r.x + 175 + br * 18, r.y + 40, 16, 22);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(r.x + 175 + br * 18, r.y + 40, 16, 22);
      }

      // Bilge pump pistons
      ctx.fillStyle = '#64748b';
      ctx.fillRect(r.x + 265, r.y + 25, 8, 38);
      ctx.fillRect(r.x + 258, r.y + 25, 22, 6);

    } else if (comp.key === 'stealthCamo') {
      // 4. CAPTAIN'S CABIN (stealthCamo)
      // Stern transom multi-pane glass gallery windows
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(r.x + 6, r.y + 12, 34, 45);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(r.x + 6, r.y + 12, 34, 45);
      // Window panes
      ctx.beginPath();
      ctx.moveTo(r.x + 23, r.y + 12);
      ctx.lineTo(r.x + 23, r.y + 57);
      ctx.moveTo(r.x + 6, r.y + 34);
      ctx.lineTo(r.x + 40, r.y + 34);
      ctx.stroke();

      // Captain's chart table & rolled map
      ctx.fillStyle = '#451a03';
      ctx.fillRect(r.x + 55, r.y + 45, 45, 18);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(r.x + 62, r.y + 42, 28, 4);

      // Hanging lantern
      ctx.fillStyle = stealthLvl >= 3 ? '#22d3ee' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(r.x + 115, r.y + 26, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Stealth mystic mist cloud if upgraded
      if (stealthLvl >= 3) {
        const mistPulse = 0.35 + Math.sin(t * 2) * 0.15;
        ctx.fillStyle = `rgba(168, 85, 247, ${mistPulse.toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(r.x + 80, r.y + 35, 35, 16, 0, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (comp.key === 'rearDefense') {
      // 5. STERN CASTLE & MINES (rearDefense)
      // Wooden mine slide chute angled off the transom
      ctx.fillStyle = '#291508';
      ctx.beginPath();
      ctx.moveTo(r.x + 15, r.y + 35);
      ctx.lineTo(r.x + 60, r.y + 65);
      ctx.lineTo(r.x + 55, r.y + 75);
      ctx.lineTo(r.x + 10, r.y + 45);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.stroke();

      // Floating Spiked Contact Mines
      if (rearLvl > 0) {
        const mineCount = Math.min(3, rearLvl);
        for (let m = 0; m < mineCount; m++) {
          const mx = r.x + 75 + m * 24;
          const my = r.y + 55;
          ctx.fillStyle = rearLvl >= 4 ? '#b91c1c' : '#1e293b';
          ctx.beginPath();
          ctx.arc(mx, my, 7, 0, Math.PI * 2);
          ctx.fill();
          // Contact mine spikes
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mx - 10, my); ctx.lineTo(mx + 10, my);
          ctx.moveTo(mx, my - 10); ctx.lineTo(mx, my + 10);
          ctx.stroke();
        }
      } else {
        // Locked label indicator inside room
        ctx.font = '9px sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText("Terkunci (Lv.0)", r.x + r.w / 2, r.y + 55);
      }

      // Stern swivel chaser gun
      ctx.fillStyle = '#334155';
      ctx.fillRect(r.x + 35, r.y + 12, 22, 5);

    } else if (comp.key === 'relicSiphon') {
      // 6. FORECASTLE & RAM (relicSiphon)
      // Heavy bronze ram spur projecting forward
      ctx.fillStyle = relicLvl >= 4 ? '#991b1b' : (relicLvl >= 2 ? '#d97706' : '#64748b');
      ctx.beginPath();
      ctx.moveTo(r.x + 95, r.y + 110);
      ctx.lineTo(r.x + 145 + Math.min(20, relicLvl * 3), r.y + 140);
      ctx.lineTo(r.x + 95, r.y + 155);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.stroke();

      // Anchor Winch Drum & Cable
      ctx.fillStyle = '#451a03';
      ctx.fillRect(r.x + 30, r.y + 55, 32, 20);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(r.x + 30, r.y + 55, 32, 20);

      // Hanging Iron Anchor
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(r.x + 85, r.y + 90, 8, 0, Math.PI);
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Glowing Blood Vampirism Orb / Relic Lantern
      if (relicLvl >= 2) {
        const relicPulse = 0.65 + Math.sin(t * 3) * 0.35;
        const radGrad = ctx.createRadialGradient(r.x + 80, r.y + 35, 2, r.x + 80, r.y + 35, 22);
        radGrad.addColorStop(0, `rgba(244, 63, 94, ${relicPulse.toFixed(2)})`);
        radGrad.addColorStop(0.6, `rgba(225, 29, 72, 0.4)`);
        radGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(r.x + 80, r.y + 35, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(r.x + 80, r.y + 35, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // -------------------------------------------------------------
    // LEVEL BADGE & GOLD PULSE UPGRADE READY INDICATOR
    // -------------------------------------------------------------
    const bp = comp.badgePos;
    ctx.font = 'bold 9.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Badge pill background
    ctx.fillStyle = isSelected 
      ? '#b45309' 
      : (isMax ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.85)');
    ctx.strokeStyle = isSelected ? '#fde68a' : (canAfford ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)');
    ctx.lineWidth = 1;

    const badgeText = isMax ? 'MAX' : `Lv.${lvl}/${conf.maxLevel}`;
    const badgeW = 48;
    const badgeH = 16;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bp.x - badgeW / 2, bp.y - badgeH / 2, badgeW, badgeH, 6);
    } else {
      ctx.rect(bp.x - badgeW / 2, bp.y - badgeH / 2, badgeW, badgeH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isSelected ? '#ffffff' : (canAfford ? '#fef08a' : '#cbd5e1');
    ctx.fillText(badgeText, bp.x, bp.y);

    // Pulsing Gold indicator dot if upgrade is affordable & ready!
    if (canAfford) {
      const pDot = 0.5 + Math.sin(t * 4) * 0.5;
      ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + pDot * 0.6})`;
      ctx.beginPath();
      ctx.arc(bp.x + badgeW / 2 + 5, bp.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 5. Draw Floating Upgrade Sparks / Celebration Particles
  const particlesToDraw = customParticles || cutawayState.particles;
  for (let i = particlesToDraw.length - 1; i >= 0; i--) {
    const p = particlesToDraw[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.035;
    if (p.life <= 0) {
      particlesToDraw.splice(i, 1);
      continue;
    }
    const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
    ctx.fillStyle = p.color.replace(')', `, ${alpha.toFixed(2)})`).replace('rgb', 'rgba');
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

function startCutawayLoop() {
  if (cutawayAnimationId) cancelAnimationFrame(cutawayAnimationId);
  cutawayAnimationId = requestAnimationFrame(renderShipCutaway);
}

function stopCutawayLoop() {
  if (cutawayAnimationId) {
    cancelAnimationFrame(cutawayAnimationId);
    cutawayAnimationId = null;
  }
}

// Unified selector for ship compartments ensuring immediate visual synchronization (PC View)
function selectCompartment(key, shouldScroll = false) {
  if (!key || !SHIP_COMPARTMENTS[key]) return;
  const prevKey = cutawayState.selectedKey;
  cutawayState.selectedKey = key;
  if (prevKey !== key) {
    if (typeof sound !== 'undefined' && typeof sound.playCompartmentInspect === 'function') {
      sound.playCompartmentInspect();
    } else {
      sound.playClick();
    }
  }
  renderCompartmentChips();
  renderCompartmentDetail(key);
  if (shouldScroll && compartmentDetailPanel) {
    compartmentDetailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Mobile/Android Cinematic Cutaway Zoom Animation Engine
function showMobileUpgradeCinematic(comp, targetLevel) {
  if (!mobileUpgradeCinematicModal || !cinematicCutawayCanvas || !comp) return;

  if (cinematicAnimId) {
    cancelAnimationFrame(cinematicAnimId);
    cinematicAnimId = null;
  }

  // Set celebratory typography
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  if (cinematicModuleTitle) {
    const cName = (isEn && comp.nameEn) ? comp.nameEn : comp.name;
    cinematicModuleTitle.innerText = cName.toUpperCase();
  }
  if (cinematicModuleLevel) {
    cinematicModuleLevel.innerText = isEn ? `New Tier: Lv.${targetLevel}` : `Tingkat Baru: Lv.${targetLevel}`;
  }
  const tierInfo = getShipTier();
  if (cinematicShipStatusTitle) {
    cinematicShipStatusTitle.innerText = isEn ? `FLEET REINFORCED • ${tierInfo.name}` : `ARMADA DIPERKUAT • ${tierInfo.name}`;
    cinematicShipStatusTitle.style.color = tierInfo.color || '#e2e8f0';
  }

  // Populate 35 celebration particles in virtual coordinates within compartment rect
  cinematicParticles = [];
  const r = comp.rect;
  for (let p = 0; p < 35; p++) {
    cinematicParticles.push({
      x: r.x + Math.random() * r.w,
      y: r.y + Math.random() * r.h,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 1.5,
      life: 1.0 + Math.random() * 0.8,
      maxLife: 1.8,
      color: Math.random() < 0.65 ? 'rgb(251, 191, 36)' : 'rgb(244, 63, 94)',
      size: 3 + Math.random() * 3.5
    });
  }

  // Display overlay
  mobileUpgradeCinematicModal.classList.remove('hidden');

  const targetCx = r.x + r.w / 2;
  const targetCy = r.y + r.h / 2;
  cinematicStartTime = performance.now();

  function cinematicStep(now) {
    const elapsed = (now - cinematicStartTime) / 1000;
    if (elapsed >= 2.2) {
      closeMobileUpgradeCinematic();
      return;
    }

    const ctx = cinematicCutawayCanvas.getContext('2d');
    if (!ctx) return;

    const rect = cinematicCutawayCanvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (cinematicCutawayCanvas.width !== targetW || cinematicCutawayCanvas.height !== targetH) {
      cinematicCutawayCanvas.width = targetW;
      cinematicCutawayCanvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Dynamic camera interpolation:
    // Phase 1 (0.0s - 0.7s): Zoomed in 2.4x at (targetCx, targetCy) with pulsing gold border
    // Phase 2 (0.7s - 1.7s): Smooth cubic ease out to 1.0x at (440, 220)
    // Phase 3 (1.7s - 2.2s): Full ship overview at 1.0x
    let currentZoom = 2.4;
    let currentCx = targetCx;
    let currentCy = targetCy;
    let pulse = 0;

    if (elapsed < 0.7) {
      currentZoom = 2.4;
      currentCx = targetCx;
      currentCy = targetCy;
      pulse = Math.sin(elapsed * 12) * 0.5 + 0.5;
    } else if (elapsed < 1.7) {
      const t = (elapsed - 0.7) / 1.0;
      // Smooth easeInOutCubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      currentZoom = 2.4 - (2.4 - 1.0) * ease;
      currentCx = targetCx + (440 - targetCx) * ease;
      currentCy = targetCy + (220 - targetCy) * ease;
      pulse = Math.max(0, 1 - t);
    } else {
      currentZoom = 1.0;
      currentCx = 440;
      currentCy = 220;
      pulse = 0;
    }

    const W = rect.width;
    const H = rect.height;
    const baseScale = Math.min(W / 880, H / 440);

    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.translate(W / 2, H / 2);
    ctx.scale(currentZoom * baseScale, currentZoom * baseScale);
    ctx.translate(-currentCx, -currentCy);

    drawMasterCutawayGraphic(ctx, elapsed * 2, comp.key, pulse, cinematicParticles);

    ctx.restore();

    cinematicAnimId = requestAnimationFrame(cinematicStep);
  }

  cinematicAnimId = requestAnimationFrame(cinematicStep);
}

function closeMobileUpgradeCinematic() {
  if (cinematicAnimId) {
    cancelAnimationFrame(cinematicAnimId);
    cinematicAnimId = null;
  }
  cinematicParticles = [];
  if (mobileUpgradeCinematicModal) {
    mobileUpgradeCinematicModal.classList.add('hidden');
  }
}

if (mobileUpgradeCinematicModal) {
  mobileUpgradeCinematicModal.addEventListener('click', () => {
    closeMobileUpgradeCinematic();
  });
}

// Backwards compatibility stub for legacy shipyard tab references
function switchShipyardTab(tab) {
  // Tabs replaced by responsive layout: PC has dedicated cutaway; Android has direct cards.
}

// Render the 6 Touch-Friendly Mobile Upgrade Cards
function renderUpgradeCardsView() {
  if (!upgradeCardsContainer) return;
  upgradeCardsContainer.innerHTML = '';
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');

  for (const comp of Object.values(SHIP_COMPARTMENTS)) {
    const key = comp.key;
    const lvl = (playerState.upgrades && playerState.upgrades[key]) || 0;
    const conf = UPGRADE_CONFIG[key];
    const isMax = lvl >= conf.maxLevel;
    const canAfford = !isMax && (typeof checkCanAffordCompartmentUpgrade === 'function' ? checkCanAffordCompartmentUpgrade(key, lvl + 1) : false);
    const upgradeCost = !isMax && typeof getCompartmentUpgradeCost === 'function' ? getCompartmentUpgradeCost(key, lvl + 1) : null;

    const compName = (isEn && comp.nameEn) ? comp.nameEn : comp.name;
    const compSubtitle = (isEn && comp.subtitleEn) ? comp.subtitleEn : comp.subtitle;
    const compStatName = (isEn && comp.statNameEn) ? comp.statNameEn : comp.statName;

    let notchesHtml = '';
    for (let i = 1; i <= conf.maxLevel; i++) {
      const isDone = (i <= lvl);
      const isNext = (i === lvl + 1);
      notchesHtml += `
        <div class="flex-1 h-2 rounded-full overflow-hidden border ${
          isDone ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 shadow-sm' :
          (isNext && canAfford ? 'bg-amber-950/60 border-amber-400/80 animate-pulse' : 'bg-slate-900 border-white/5')
        }"></div>
      `;
    }

    let costBadgesHtml = '';
    if (!isMax && upgradeCost) {
      costBadgesHtml = Object.entries(upgradeCost).map(([resKey, reqQty]) => {
        const curQty = (playerState.resources && playerState.resources[resKey]) || 0;
        const hasEnough = curQty >= reqQty;
        const resDef = (typeof RESOURCE_TYPES !== 'undefined' && RESOURCE_TYPES[resKey]) || null;
        const resIcon = (resDef && SVG_ICONS && SVG_ICONS[resDef.iconKey || resKey]) ? SVG_ICONS[resDef.iconKey || resKey] : '';
        const resName = resDef ? ((isEn && resDef.nameEn) ? resDef.nameEn : resDef.name) : resKey;
        return `
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9.5px] font-mono font-bold ${
            hasEnough 
              ? 'bg-slate-900/90 text-amber-300 border-amber-500/35' 
              : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
          }" title="${resName}: ${curQty} / ${reqQty}">
            <span class="w-3 h-3 flex items-center justify-center shrink-0">${resIcon}</span>
            <span>${curQty}/${reqQty}</span>
          </div>
        `;
      }).join('');
    }

    const card = document.createElement('div');
    card.className = `p-3 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 shadow-lg ${
      isMax ? 'bg-slate-950/70 border-amber-500/20' :
      (canAfford ? 'bg-slate-950/90 border-amber-500/40 hover:border-amber-400/80' : 'bg-slate-950/60 border-white/10')
    }`;

    card.innerHTML = `
      <!-- Card Header: Icon, Name, Level Badge -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="p-2 sm:p-2.5 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-300 shrink-0 shadow-inner">
            ${SVG_ICONS[comp.iconKey] || SVG_ICONS.hull}
          </div>
          <div>
            <h3 class="font-cinzel text-xs sm:text-sm font-bold text-slate-100">${compName}</h3>
            <p class="text-[10px] sm:text-[10.5px] text-slate-400 leading-tight mt-0.5">${compSubtitle}</p>
          </div>
        </div>
        <span class="text-[9.5px] sm:text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
          isMax ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-slate-800 text-amber-300 border border-amber-500/30'
        }">
          ${isMax ? 'MAX' : `Lv.${lvl} / ${conf.maxLevel}`}
        </span>
      </div>

      <!-- Segmented Level Progress Bar -->
      <div class="space-y-1">
        <div class="flex justify-between text-[9.5px] text-slate-400 font-mono">
          <span>${isEn ? 'Efficiency Level' : 'Tingkat Efektivitas'}</span>
          <span class="text-amber-400 font-bold">${lvl} / ${conf.maxLevel}</span>
        </div>
        <div class="flex items-center gap-1 w-full">
          ${notchesHtml}
        </div>
      </div>

      <!-- Stat Comparison Box -->
      <div class="bg-slate-900/80 rounded-xl px-2.5 py-1.5 border border-white/5 flex items-center justify-between text-xs">
        <span class="text-[9.5px] uppercase tracking-wider font-bold text-slate-400">${compStatName}:</span>
        <span class="text-[11px] font-bold text-amber-300 font-mono">
          ${isMax ? getStatValue(key, lvl) + (isEn ? ' (Maximum)' : ' (Maksimal)') : comp.getStatDesc(lvl, isEn)}
        </span>
      </div>

      <!-- Footer: Cost & 1-Tap Upgrade Button -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-white/10">
        <!-- Cost badges -->
        <div class="flex items-center gap-1.5 flex-wrap">
          ${!isMax ? costBadgesHtml : `<span class="text-amber-400/80 text-[10.5px] font-bold font-cinzel">${isEn ? 'Peak Fleet Tier' : 'Tingkat Puncak Armada'}</span>`}
        </div>

        <!-- 1-Tap Direct Upgrade Action Button -->
        <button type="button" class="btn-direct-upgrade shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold font-cinzel transition tracking-wide flex items-center justify-center gap-1.5 shadow-md ${
          isMax 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
            : (canAfford 
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 border border-amber-300 active:scale-95 shadow-amber-900/40 cursor-pointer' 
                : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/10 opacity-70')
        }" ${!canAfford ? 'disabled' : ''} data-key="${key}">
          <svg class="w-3.5 h-3.5 ${isMax ? 'hidden' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>
          <span>${isMax ? (isEn ? 'COMPLETED' : 'SELESAI') : (canAfford ? (isEn ? 'UPGRADE' : 'TINGKATKAN') : (isEn ? 'INSUFFICIENT' : 'KURANG BAHAN'))}</span>
        </button>
      </div>
    `;

    const btnDirectUpgrade = card.querySelector('.btn-direct-upgrade');
    if (btnDirectUpgrade && canAfford) {
      btnDirectUpgrade.addEventListener('click', (e) => {
        e.stopPropagation();
        performCompartmentUpgrade(key);
      });
    }

    upgradeCardsContainer.appendChild(card);
  }
}

// Update the Dual Quick Repair buttons in the Shipyard footer
function updateShipyardRepairButton() {
  const btnResource = document.getElementById('btnRepairShipResource');
  const btnGold = document.getElementById('btnRepairShipGold');
  const txtResource = document.getElementById('txtRepairShipResource');
  const txtGold = document.getElementById('txtRepairShipGold');
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');

  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  const roundedHp = Math.round(playerState.hp);
  const isFullHp = roundedHp >= maxHp;
  const isDocked = Boolean(playerState.isDockedAtPort);

  const curWood = (playerState.resources && playerState.resources.wood) || 0;
  const curRope = (playerState.resources && playerState.resources.rope) || 0;
  const hasResources = curWood >= 6 && curRope >= 3;
  const hasGold = (playerState.gold || 0) >= 85;

  if (btnResource) {
    if (isFullHp) {
      btnResource.className = 'bg-slate-800/80 text-emerald-400/70 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-500/20 cursor-default select-none shadow-sm text-[11px]';
      if (txtResource) txtResource.innerText = isEn ? 'Hull Pristine (100%)' : 'Lambung Prima (100%)';
      btnResource.disabled = true;
    } else if (!isDocked) {
      btnResource.className = 'bg-slate-800/80 text-slate-500 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/5 cursor-not-allowed select-none opacity-60 text-[11px]';
      if (txtResource) txtResource.innerText = isEn ? 'Repairs (Port Dock Required)' : 'Reparasi (Wajib di Dermaga)';
      btnResource.disabled = true;
    } else if (hasResources) {
      btnResource.className = 'bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl active:scale-95 transition flex items-center gap-1.5 shadow-md cursor-pointer text-[11px]';
      if (txtResource) txtResource.innerText = isEn ? 'Repair (6 Wood + 3 Rope)' : 'Reparasi (6 Kayu + 3 Tali)';
      btnResource.disabled = false;
    } else {
      btnResource.className = 'bg-slate-800 text-amber-300/80 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-amber-500/30 cursor-not-allowed opacity-75 text-[11px]';
      if (txtResource) txtResource.innerText = isEn ? `Need Materials (${curWood}/6 Wood, ${curRope}/3 Rope)` : `Kurang Bahan (${curWood}/6 Kayu, ${curRope}/3 Tali)`;
      btnResource.disabled = true;
    }
  }

  if (btnGold) {
    if (isFullHp) {
      btnGold.className = 'hidden';
      btnGold.disabled = true;
    } else if (!isDocked) {
      btnGold.className = 'bg-slate-800/80 text-slate-500 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/5 cursor-not-allowed select-none opacity-60 text-[11px]';
      if (txtGold) txtGold.innerText = isEn ? 'Service (Port Dock Required)' : 'Jasa (Wajib di Dermaga)';
      btnGold.disabled = true;
    } else if (hasGold) {
      btnGold.className = 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl active:scale-95 transition flex items-center gap-1.5 shadow-md cursor-pointer text-[11px]';
      if (txtGold) txtGold.innerText = isEn ? 'Shipyard Service (85 Coins)' : 'Jasa Galangan (85 Koin)';
      btnGold.disabled = false;
    } else {
      btnGold.className = 'bg-slate-800 text-slate-500 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/5 cursor-not-allowed opacity-60 text-[11px]';
      if (txtGold) txtGold.innerText = isEn ? `Need Gold (${playerState.gold || 0}/85 Coins)` : `Emas Kurang (${playerState.gold || 0}/85 Koin)`;
      btnGold.disabled = true;
    }
  }
}

// Render the 6 Touch-Friendly Selector Chips underneath the canvas (PC View)
function renderCompartmentChips() {
  if (!compartmentChipsBar) return;
  compartmentChipsBar.innerHTML = '';
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');

  for (const comp of Object.values(SHIP_COMPARTMENTS)) {
    const lvl = (playerState.upgrades && playerState.upgrades[comp.key]) || 0;
    const conf = UPGRADE_CONFIG[comp.key];
    const isMax = lvl >= conf.maxLevel;
    const canAfford = !isMax && (typeof checkCanAffordCompartmentUpgrade === 'function' ? checkCanAffordCompartmentUpgrade(comp.key, lvl + 1) : false);
    const isSelected = (cutawayState.selectedKey === comp.key);
    const shortName = (isEn && comp.shortNameEn) ? comp.shortNameEn : comp.shortName;

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `compartment-chip px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
      isSelected 
        ? 'active bg-amber-950/80 border-amber-400 text-amber-300 font-bold shadow-md' 
        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-amber-500/40'
    }`;

    chip.innerHTML = `
      <span class="w-3.5 h-3.5 flex items-center justify-center shrink-0">
        ${SVG_ICONS[comp.iconKey] || SVG_ICONS.hull}
      </span>
      <span class="text-[11px] font-medium">${shortName}</span>
      <span class="text-[9px] font-mono px-1 py-0.2 rounded ${isMax ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}">
        ${isMax ? 'MAX' : `Lv.${lvl}`}
      </span>
      ${canAfford ? '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>' : ''}
    `;

    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      selectCompartment(comp.key, false);
    });

    compartmentChipsBar.appendChild(chip);
  }
}

// Render the detailed upgrade card for the currently selected compartment
function renderCompartmentDetail(key) {
  if (!compartmentDetailPanel) return;
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  const comp = SHIP_COMPARTMENTS[key] || SHIP_COMPARTMENTS.cannons;
  const actualKey = comp.key;
  cutawayState.selectedKey = actualKey;
  const conf = UPGRADE_CONFIG[actualKey];
  const lvl = (playerState.upgrades && playerState.upgrades[actualKey]) || 0;
  const isMax = lvl >= conf.maxLevel;
  const canAfford = !isMax && (typeof checkCanAffordCompartmentUpgrade === 'function' ? checkCanAffordCompartmentUpgrade(actualKey, lvl + 1) : false);
  const upgradeCost = !isMax && typeof getCompartmentUpgradeCost === 'function' ? getCompartmentUpgradeCost(actualKey, lvl + 1) : null;

  const compName = (isEn && comp.nameEn) ? comp.nameEn : comp.name;
  const compSubtitle = (isEn && comp.subtitleEn) ? comp.subtitleEn : comp.subtitle;
  const compLore = (isEn && comp.loreEn) ? comp.loreEn : comp.lore;
  const compStatName = (isEn && comp.statNameEn) ? comp.statNameEn : comp.statName;

  // Segmented Progress Notches (6 blocks)
  let notchesHtml = '';
  for (let i = 1; i <= conf.maxLevel; i++) {
    const isDone = (i <= lvl);
    const isNext = (i === lvl + 1);
    notchesHtml += `
      <div class="flex-1 h-2 rounded-full overflow-hidden border ${
        isDone ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 shadow-sm' :
        (isNext && canAfford ? 'bg-amber-950/60 border-amber-400/80 animate-pulse' : 'bg-slate-900 border-white/5')
      }"></div>
    `;
  }

  // Material Requirements Grid for Selected Compartment Tier
  let materialReqHtml = '';
  if (!isMax && upgradeCost) {
    materialReqHtml = Object.entries(upgradeCost).map(([resKey, reqQty]) => {
      const curQty = (playerState.resources && playerState.resources[resKey]) || 0;
      const hasEnough = curQty >= reqQty;
      const resDef = (typeof RESOURCE_TYPES !== 'undefined' && RESOURCE_TYPES[resKey]) || null;
      const resIcon = (resDef && SVG_ICONS && SVG_ICONS[resDef.iconKey || resKey]) ? SVG_ICONS[resDef.iconKey || resKey] : '';
      const resName = resDef ? ((isEn && resDef.nameEn) ? resDef.nameEn : resDef.name) : resKey;
      return `
        <div class="flex items-center justify-between p-2 rounded-xl border transition-all ${
          hasEnough 
            ? 'bg-slate-900/90 border-amber-500/30 text-amber-200 shadow-sm' 
            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
        }">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-5 h-5 flex items-center justify-center shrink-0">${resIcon}</span>
            <div class="flex flex-col min-w-0">
              <span class="text-[11px] font-bold text-slate-100 truncate">${resName}</span>
              <span class="text-[9px] font-mono ${hasEnough ? 'text-emerald-400' : 'text-rose-400'}">
                ${hasEnough ? (isEn ? 'Available' : 'Tersedia') : (isEn ? 'Deficit' : 'Kurang')}
              </span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="font-mono text-xs font-bold ${hasEnough ? 'text-amber-300' : 'text-rose-400'}">
              ${curQty} / ${reqQty}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  compartmentDetailPanel.innerHTML = `
    <!-- Header: Title, Category & Level Status -->
    <div class="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
      <div class="flex items-center gap-2.5">
        <div class="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300 shrink-0 shadow-inner">
          ${SVG_ICONS[comp.iconKey] || SVG_ICONS.hull}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-cinzel text-sm sm:text-base font-bold text-slate-100">${compName}</h3>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              isMax ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-amber-300 border border-amber-500/30'
            }">
              ${isMax ? (isEn ? 'MAX LEVEL' : 'TINGKAT MAKSIMAL') : `Level ${lvl} / ${conf.maxLevel}`}
            </span>
          </div>
          <p class="text-[10.5px] text-slate-400 mt-0.5">${compSubtitle}</p>
        </div>
      </div>
    </div>

    <!-- Segmented Level Progress Bar -->
    <div class="space-y-1">
      <div class="flex justify-between text-[10px] text-slate-400">
        <span>${isEn ? 'Architecture Phase' : 'Tahap Arsitektur'}</span>
        <span class="font-mono text-amber-400 font-bold">${isEn ? `${lvl} of ${conf.maxLevel} Tiers` : `${lvl} dari ${conf.maxLevel} Tingkat`}</span>
      </div>
      <div class="flex items-center gap-1.5 w-full">
        ${notchesHtml}
      </div>
    </div>

    <!-- Lore Quote -->
    <p class="text-[10px] sm:text-[10.5px] text-slate-300 italic bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed">
      ${compLore}
    </p>

    <!-- Stat Differential Comparison Card -->
    <div class="bg-slate-900/90 rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-3 text-xs">
      <div class="flex flex-col">
        <span class="text-[9.5px] uppercase tracking-wider font-bold text-slate-400">${compStatName}</span>
        <span class="text-xs font-bold text-amber-300 font-mono mt-0.5">
          ${isMax ? getStatValue(actualKey, lvl) + (isEn ? ' (Maximum)' : ' (Maksimal)') : comp.getStatDesc(lvl, isEn)}
        </span>
      </div>
      <div class="text-right">
        <span class="text-[9.5px] uppercase tracking-wider text-slate-400">${isEn ? 'Ship Effect' : 'Efek Kapal'}</span>
        <div class="text-[10.5px] text-emerald-400 font-semibold mt-0.5">
          ${isMax ? (isEn ? 'Optimal Performance' : 'Performa Optimal') : (isEn ? '+Effective Boost' : '+Peningkatan Efektif')}
        </div>
      </div>
    </div>

    <!-- Action Upgrade Button & Resource Cost Card (Material Requirements Terminal) -->
    <div class="flex flex-col gap-2.5 pt-2">
      <!-- Cost breakdown: Pure Maritime Materials -->
      <div class="bg-black/60 rounded-xl p-2.5 sm:p-3 border border-amber-500/25 flex flex-col gap-2 shadow-inner">
        <div class="flex items-center justify-between">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>${isEn ? 'Material Requirements:' : 'Kebutuhan Bahan Baku:'}</span>
          </span>
          ${!isMax && canAfford ? `
            <span class="text-[9.5px] font-bold text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40">
              ${isEn ? 'READY TO FORGE' : 'BAHAN LENGKAP'}
            </span>
          ` : ''}
        </div>
        ${!isMax ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            ${materialReqHtml}
          </div>
        ` : `<span class="text-amber-400 text-xs font-bold font-cinzel text-center py-2">${isEn ? 'Peak Fleet Tier Reached!' : 'Telah Mencapai Tingkat Puncak Armada!'}</span>`}
      </div>

      <!-- Upgrade Button -->
      <button id="btnPerformUpgrade" type="button" class="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black font-cinzel transition tracking-wider flex items-center justify-center gap-2 shadow-xl ${
        isMax 
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
          : (canAfford 
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 border-2 border-amber-200 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer' 
              : 'bg-slate-800/80 text-slate-400 cursor-not-allowed border border-white/10 opacity-70')
      }" ${!canAfford ? 'disabled' : ''}>
        ${isMax ? (isEn ? 'MAX COMPARTMENT' : 'KOMPARTEMEN MAKSIMAL') : (canAfford ? (isEn ? `UPGRADE TO LEVEL ${lvl + 1}` : `TINGKATKAN KE LEVEL ${lvl + 1}`) : (isEn ? 'INSUFFICIENT MATERIALS' : 'BAHAN TIDAK CUKUP'))}
      </button>
    </div>
  `;

  // Bind upgrade button click and touch for instantaneous responsiveness
  const btnUpgrade = document.getElementById('btnPerformUpgrade');
  if (btnUpgrade && canAfford) {
    const handleUpgradeClick = (e) => {
      e.stopPropagation();
      performCompartmentUpgrade(actualKey);
    };
    btnUpgrade.addEventListener('click', handleUpgradeClick);
  }
}

// Perform the actual upgrade purchase with animation and audio
function performCompartmentUpgrade(key) {
  const comp = SHIP_COMPARTMENTS[key];
  if (!comp) return;
  cutawayState.selectedKey = key;
  const conf = UPGRADE_CONFIG[key];
  const lvl = (playerState.upgrades && playerState.upgrades[key]) || 0;
  if (lvl >= conf.maxLevel) return;

  const canAfford = typeof checkCanAffordCompartmentUpgrade === 'function' && checkCanAffordCompartmentUpgrade(key, lvl + 1);

  if (canAfford) {
    const cost = typeof getCompartmentUpgradeCost === 'function' ? getCompartmentUpgradeCost(key, lvl + 1) : null;
    if (cost && playerState.resources) {
      for (const [resKey, reqQty] of Object.entries(cost)) {
        playerState.resources[resKey] = Math.max(0, (playerState.resources[resKey] || 0) - reqQty);
      }
    }
    playerState.upgrades[key]++;

    // If upgrading hull, reward player with immediate +75 HP heal matching the increased max capacity!
    if (key === 'hull') {
      const newMaxHp = getStatValue('hull', playerState.upgrades.hull);
      playerState.hp = Math.min(newMaxHp, playerState.hp + 75);
    }

    if (typeof sound !== 'undefined' && typeof sound.playShipyardHammer === 'function') {
      sound.playShipyardHammer();
    } else {
      sound.playLoot();
    }
    const cName = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en' && comp.nameEn) ? comp.nameEn : comp.name;
    showToast(typeof t === 'function' ? t('toastUpgraded', { name: cName, level: playerState.upgrades[key] }) : `${comp.name} ditingkatkan ke Lv.${playerState.upgrades[key]}!`, "check");
    saveGame();

    // Re-render entire shipyard UI and detail card instantly in place!
    renderUpgradeUI();
    updateHUD();

    const isMobile = isMobileDevice() || window.innerWidth < 1024;
    if (isMobile) {
      // Trigger cinematic zoom-in / zoom-out animation on mobile!
      showMobileUpgradeCinematic(comp, playerState.upgrades[key]);
    } else {
      // Spawn celebratory golden sparkle particles directly on the master cutaway canvas (Desktop)
      const r = comp.rect;
      for (let p = 0; p < 30; p++) {
        cutawayState.particles.push({
          x: r.x + Math.random() * r.w,
          y: r.y + Math.random() * r.h,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 1.5,
          life: 1.0,
          maxLife: 1.0,
          color: Math.random() < 0.6 ? 'rgb(251, 191, 36)' : 'rgb(244, 63, 94)',
          size: 2.5 + Math.random() * 3.5
        });
      }
    }
  } else {
    showToast(typeof t === 'function' ? t('toastNotEnoughUpgrade') : "Sumber daya material Anda tidak mencukupi untuk peningkatan ini.", "alert");
  }
}

// Master shipyard update function called when modal opens or state refreshes
function renderUpgradeUI() {
  // Update header currencies
  if (shipyardGoldText) shipyardGoldText.innerText = (playerState.gold || 0).toLocaleString('id-ID');
  if (shipyardBloodText) shipyardBloodText.innerText = (playerState.bloodEssence || 0).toLocaleString('id-ID');

  // Update Ship Tier Badge & Title
  const tierInfo = getShipTier();
  if (shipyardTierBadge) {
    shipyardTierBadge.innerText = `Rank ${tierInfo.rank}`;
    shipyardTierBadge.style.color = tierInfo.color;
  }
  if (shipOverallTierTitle) {
    shipOverallTierTitle.innerText = `• ${tierInfo.name}`;
    shipOverallTierTitle.style.color = tierInfo.color;
  }

  // Update Total Level Progress
  const totalLevels = Object.values(playerState.upgrades || {}).reduce((a, b) => a + b, 0);
  if (maxProgressLabel) {
    maxProgressLabel.innerText = `${totalLevels}/36`;
  }

  // Update Port Docking Location subtitle
  if (shipyardLocationLabel) {
    const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
    const portName = playerState.dockedPortName || (isEn ? "Peace Haven Dock" : "Dermaga Nusa Damai");
    shipyardLocationLabel.innerText = typeof t === 'function' ? t('dockedAt', { port: portName }) : `Dermaga Berlabuh: ${portName}`;
  }

  // Update quick repair button in shipyard footer
  updateShipyardRepairButton();

  // Render both viewports (cards & cutaway)
  renderUpgradeCardsView();
  renderCompartmentChips();
  renderCompartmentDetail(cutawayState.selectedKey);
}

// Setup pointer interaction events on the cutaway canvas
if (shipCutawayCanvas) {
  shipCutawayCanvas.addEventListener('pointermove', (e) => {
    const { x, y } = getCutawayCanvasCoords(e);
    const key = findCompartmentAt(x, y);
    const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
    if (key !== cutawayState.hoveredKey) {
      cutawayState.hoveredKey = key;
      if (cutawayHoverLabel) {
        if (key && SHIP_COMPARTMENTS[key]) {
          cutawayHoverLabel.innerText = (isEn && SHIP_COMPARTMENTS[key].shortNameEn) ? SHIP_COMPARTMENTS[key].shortNameEn : SHIP_COMPARTMENTS[key].shortName;
          cutawayHoverLabel.classList.remove('hidden');
        } else {
          cutawayHoverLabel.innerText = isEn ? "Select Compartment" : "Pilih Kompartemen";
        }
      }
    }
  });

  shipCutawayCanvas.addEventListener('pointerleave', () => {
    cutawayState.hoveredKey = null;
    const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
    if (cutawayHoverLabel) cutawayHoverLabel.innerText = isEn ? "Select Compartment" : "Pilih Kompartemen";
  });

  const handleCanvasSelect = (e) => {
    const { x, y } = getCutawayCanvasCoords(e);
    const key = findCompartmentAt(x, y);
    if (key) {
      selectCompartment(key, false);
    }
  };

  shipCutawayCanvas.addEventListener('pointerdown', handleCanvasSelect);
  shipCutawayCanvas.addEventListener('click', handleCanvasSelect);
}

function openUpgradeModal() {
  sound.init();
  // SHOP OVERHAUL RESTRICTION: Upgrades only available when docked at Haven, Shop Island, or Conquered Island
  if (!playerState.isDockedAtPort) {
    showToast(typeof t === 'function' ? t('toastRepairDockOnly') : "Galangan Kapal hanya melayani di dermaga pelabuhan! Berlabuhlah di Nusa Damai, Pasar, atau Pulau Taklukan.", "alert");
    return;
  }

  closeLoreModal();
  closeHelpModal();
  closeMapModal();
  renderUpgradeUI();
  upgradeModal.classList.remove('modal-enter', 'hidden');
  upgradeModal.classList.add('modal-active');
  isGamePaused = true;
  startCutawayLoop();
}

function closeUpgradeModal() {
  if (!upgradeModal) return;
  upgradeModal.classList.remove('modal-active');
  upgradeModal.classList.add('modal-enter', 'hidden');
  isGamePaused = false;
  lastTime = performance.now();
  stopCutawayLoop();
  closeMobileUpgradeCinematic();
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

// ============================================================================
// ============================================================================
// PHASE 4: FULLSCREEN 3-COLUMN NAVAL ARMORY, CARGO MATRIX & FOUNDRY (v2.9.9)
// ============================================================================

const inventoryModal = document.getElementById('inventoryModal');
const btnOpenInventory = document.getElementById('btnOpenInventory');
const btnCloseInventory = document.getElementById('btnCloseInventory');
const btnOpenRecipeBook = document.getElementById('btnOpenRecipeBook');
const btnOpenRecipeBookFromColumn = document.getElementById('btnOpenRecipeBookFromColumn');
const recipeBookModal = document.getElementById('recipeBookModal');
const btnCloseRecipeBook = document.getElementById('btnCloseRecipeBook');
const btnReturnToInventoryFromBook = document.getElementById('btnReturnToInventoryFromBook');
const recipeBookGrid = document.getElementById('recipeBookGrid');

const invDockStatusBadge = document.getElementById('invDockStatusBadge');
const invGoldText = document.getElementById('invGoldText');
const invBloodText = document.getElementById('invBloodText');
const invEquippedRack = document.getElementById('invEquippedRack');
const invEquippedSlotCountBadge = document.getElementById('invEquippedSlotCountBadge');
const invCargoGrid = document.getElementById('invCargoGrid');
const invCargoOccupiedCount = document.getElementById('invCargoOccupiedCount');
const cargoCapacityBar = document.getElementById('cargoCapacityBar');
const invSlotInspector = document.getElementById('invSlotInspector');
const invCraftableList = document.getElementById('invCraftableList');
const invCraftPortIndicator = document.getElementById('invCraftPortIndicator');
const btnQuickNavShipyard = document.getElementById('btnQuickNavShipyard');
const btnPauseInventory = document.getElementById('btnPauseInventory');

const armoryTotalDmgText = document.getElementById('armoryTotalDmgText');
const armoryAvgDurText = document.getElementById('armoryAvgDurText');
const mobileCargoBadgeCount = document.getElementById('mobileCargoBadgeCount');

const colCargoDeck = document.getElementById('colCargoDeck') || document.getElementById('invCargoCol');
const colArmoryDeck = document.getElementById('colArmoryDeck');
const colCraftDeck = document.getElementById('colCraftDeck') || document.getElementById('invCraftCol');
const invCargoCol = colCargoDeck;
const invCraftCol = colCraftDeck;

const btnMobileTabCargo = document.getElementById('btnMobileTabCargo');
const btnMobileTabArmory = document.getElementById('btnMobileTabArmory');
const btnMobileTabCraft = document.getElementById('btnMobileTabCraft');

const btnFilterCargoAll = document.getElementById('btnFilterCargoAll');
const btnFilterCargoRes = document.getElementById('btnFilterCargoRes');
const btnFilterCargoWeap = document.getElementById('btnFilterCargoWeap');

const btnCraftFilterAll = document.getElementById('btnCraftFilterAll');
const btnCraftFilterFaction = document.getElementById('btnCraftFilterFaction');
const btnCraftFilterOccult = document.getElementById('btnCraftFilterOccult');

const cargoHoverTooltip = document.getElementById('cargoHoverTooltip');
const cannonPickerModal = document.getElementById('cannonPickerModal');
const btnCloseCannonPicker = document.getElementById('btnCloseCannonPicker');
const btnCancelCannonPicker = document.getElementById('btnCancelCannonPicker');
const cannonPickerList = document.getElementById('cannonPickerList');
const cannonPickerTitle = document.getElementById('cannonPickerTitle');
let targetEquipSlotIndex = -1;
let selectedEquippedSlotIndex = -1;
let mobileInventoryActiveTab = 'cargo';
let currentCargoFilter = 'all'; // 'all' | 'res' | 'weap'
let currentCraftFilter = 'all'; // 'all' | 'faction' | 'occult'

function setMobileInventoryTab(tab) {
  mobileInventoryActiveTab = tab;
  if (btnMobileTabCargo) {
    btnMobileTabCargo.className = (tab === 'cargo')
      ? "flex-1 py-2 rounded-xl text-xs font-cinzel font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 text-center transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[46px] shadow-md"
      : "flex-1 py-2 rounded-xl text-xs font-cinzel font-bold text-slate-400 hover:text-slate-200 text-center transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[46px]";
  }
  if (btnMobileTabArmory) {
    btnMobileTabArmory.className = (tab === 'armory')
      ? "flex-1 py-2 rounded-xl text-xs font-cinzel font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 text-center transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[46px] shadow-md"
      : "flex-1 py-2 rounded-xl text-xs font-cinzel font-bold text-slate-400 hover:text-slate-200 text-center transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[46px]";
  }
  if (btnMobileTabCraft) {
    btnMobileTabCraft.className = (tab === 'craft')
      ? "flex-1 py-2 rounded-xl text-xs font-cinzel font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 text-center transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[46px] shadow-md"
      : "flex-1 py-2 rounded-xl text-xs font-cinzel font-bold text-slate-400 hover:text-slate-200 text-center transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[46px]";
  }
  applyColumnVisibility();
}

function applyColumnVisibility() {
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    if (colCargoDeck) {
      colCargoDeck.classList.remove('hidden');
      colCargoDeck.classList.add('flex');
      if (mobileInventoryActiveTab === 'cargo') {
        colCargoDeck.classList.add('ring-2', 'ring-amber-500/50');
      } else {
        colCargoDeck.classList.remove('ring-2', 'ring-amber-500/50');
      }
    }
    if (colArmoryDeck) {
      colArmoryDeck.classList.remove('hidden');
      colArmoryDeck.classList.add('flex');
      if (mobileInventoryActiveTab === 'armory') {
        colArmoryDeck.classList.add('ring-2', 'ring-cyan-500/50');
      } else {
        colArmoryDeck.classList.remove('ring-2', 'ring-cyan-500/50');
      }
    }
    if (colCraftDeck) {
      colCraftDeck.classList.remove('hidden');
      colCraftDeck.classList.add('flex');
      if (mobileInventoryActiveTab === 'craft') {
        colCraftDeck.classList.add('ring-2', 'ring-emerald-500/50');
      } else {
        colCraftDeck.classList.remove('ring-2', 'ring-emerald-500/50');
      }
    }
  } else {
    if (colCargoDeck) {
      colCargoDeck.classList.remove('ring-2', 'ring-amber-500/50');
      if (mobileInventoryActiveTab === 'cargo') {
        colCargoDeck.classList.remove('hidden');
        colCargoDeck.classList.add('flex');
      } else {
        colCargoDeck.classList.add('hidden');
        colCargoDeck.classList.remove('flex');
      }
    }
    if (colArmoryDeck) {
      colArmoryDeck.classList.remove('ring-2', 'ring-cyan-500/50');
      if (mobileInventoryActiveTab === 'armory') {
        colArmoryDeck.classList.remove('hidden');
        colArmoryDeck.classList.add('flex');
      } else {
        colArmoryDeck.classList.add('hidden');
        colArmoryDeck.classList.remove('flex');
      }
    }
    if (colCraftDeck) {
      colCraftDeck.classList.remove('ring-2', 'ring-emerald-500/50');
      if (mobileInventoryActiveTab === 'craft') {
        colCraftDeck.classList.remove('hidden');
        colCraftDeck.classList.add('flex');
      } else {
        colCraftDeck.classList.add('hidden');
        colCraftDeck.classList.remove('flex');
      }
    }
  }
}

window.addEventListener('resize', () => {
  if (inventoryModal && inventoryModal.classList.contains('modal-active')) {
    applyColumnVisibility();
  }
});

function setCargoFilter(filter) {
  currentCargoFilter = filter;
  const btns = [
    { btn: btnFilterCargoAll, key: 'all' },
    { btn: btnFilterCargoRes, key: 'res' },
    { btn: btnFilterCargoWeap, key: 'weap' }
  ];
  btns.forEach(({ btn, key }) => {
    if (!btn) return;
    if (key === filter) {
      btn.className = "cargo-filter-btn flex-1 py-1 rounded-lg text-[10px] font-cinzel font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 text-center transition cursor-pointer active";
    } else {
      btn.className = "cargo-filter-btn flex-1 py-1 rounded-lg text-[10px] font-cinzel font-bold text-slate-400 hover:text-slate-200 text-center transition cursor-pointer";
    }
  });
  renderInventoryUI();
}

function setCraftFilter(filter) {
  currentCraftFilter = filter;
  const btns = [
    { btn: btnCraftFilterAll, key: 'all' },
    { btn: btnCraftFilterFaction, key: 'faction' },
    { btn: btnCraftFilterOccult, key: 'occult' }
  ];
  btns.forEach(({ btn, key }) => {
    if (!btn) return;
    if (key === filter) {
      btn.className = "craft-filter-btn flex-1 py-1 rounded-lg text-[10px] font-cinzel font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 text-center transition cursor-pointer active";
    } else {
      btn.className = "craft-filter-btn flex-1 py-1 rounded-lg text-[10px] font-cinzel font-bold text-slate-400 hover:text-slate-200 text-center transition cursor-pointer";
    }
  });
  renderInventoryUI();
}

if (btnMobileTabCargo) btnMobileTabCargo.onclick = () => setMobileInventoryTab('cargo');
if (btnMobileTabArmory) btnMobileTabArmory.onclick = () => setMobileInventoryTab('armory');
if (btnMobileTabCraft) btnMobileTabCraft.onclick = () => setMobileInventoryTab('craft');

if (btnFilterCargoAll) btnFilterCargoAll.onclick = () => setCargoFilter('all');
if (btnFilterCargoRes) btnFilterCargoRes.onclick = () => setCargoFilter('res');
if (btnFilterCargoWeap) btnFilterCargoWeap.onclick = () => setCargoFilter('weap');

if (btnCraftFilterAll) btnCraftFilterAll.onclick = () => setCraftFilter('all');
if (btnCraftFilterFaction) btnCraftFilterFaction.onclick = () => setCraftFilter('faction');
if (btnCraftFilterOccult) btnCraftFilterOccult.onclick = () => setCraftFilter('occult');

if (btnOpenRecipeBookFromColumn) btnOpenRecipeBookFromColumn.onclick = openRecipeBookModal;

function showCargoTooltip(e, item) {
  if (!cargoHoverTooltip || !item) return;
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  let html = '';
  if (item.kind === 'resource') {
    const res = item.def;
    const resName = (isEn && res.nameEn) ? res.nameEn : res.name;
    const resCategory = (isEn && res.categoryEn) ? res.categoryEn : (res.category || 'Bahan Baku');
    const resRarity = (isEn && res.rarityEn) ? res.rarityEn : (res.rarity || 'Biasa');
    const resDesc = (isEn && res.descEn) ? res.descEn : res.desc;
    const resDropSource = (isEn && res.dropSourceEn) ? res.dropSourceEn : res.dropSource;

    const iconSvg = SVG_ICONS[res.iconKey || item.key] || SVG_ICONS.inventory;
    html = `
      <div class="flex items-center gap-2 mb-1.5">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border" style="background: rgba(15,23,42,0.9); border-color: ${res.color || '#f59e0b'}; color: ${res.color || '#fbbf24'};">
          ${iconSvg}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-1">
            <h4 class="font-cinzel text-xs font-bold text-white truncate">${resName}</h4>
            <span class="font-mono text-[10px] text-amber-300 font-bold">x${item.count}</span>
          </div>
          <div class="flex items-center gap-1 mt-0.5">
            <span class="text-[8px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500/30">${resCategory}</span>
            <span class="text-[8px] px-1 py-0.2 rounded font-bold bg-slate-900 text-slate-300">${resRarity}</span>
          </div>
        </div>
      </div>
      <p class="text-[10px] text-slate-300 leading-snug">${resDesc}</p>
      ${resDropSource ? `<div class="text-[9px] text-slate-400 mt-1 italic border-t border-white/10 pt-1">${isEn ? 'Source:' : 'Sumber:'} ${resDropSource}</div>` : ''}
    `;
  } else if (item.kind === 'cannon') {
    const conf = item.def;
    const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;
    const confFaction = (isEn && conf.factionNameEn) ? conf.factionNameEn : (conf.factionName || 'Faksi');
    const confDesc = (isEn && conf.descEn) ? conf.descEn : conf.desc;

    const iconSvg = SVG_ICONS[conf.itemIconKey] || SVG_ICONS.cannons;
    html = `
      <div class="flex items-center gap-2 mb-1.5">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border" style="background: rgba(15,23,42,0.9); border-color: ${conf.color || '#f59e0b'}; color: ${conf.color || '#fbbf24'};">
          ${iconSvg}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-1">
            <h4 class="font-cinzel text-xs font-bold text-white truncate">${confName}</h4>
            <span class="text-[8px] px-1.5 py-0.2 rounded font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30">${confFaction}</span>
          </div>
          <div class="text-[9px] text-amber-300 font-mono mt-0.5">${isEn ? 'Durability:' : 'Durabilitas:'} ${item.cannon.durability}/${item.cannon.maxDurability}</div>
        </div>
      </div>
      <p class="text-[10px] text-slate-300 leading-snug">${confDesc}</p>
      <div class="flex items-center justify-between text-[9px] font-mono text-emerald-400 mt-1 border-t border-white/10 pt-1">
        <span>${isEn ? 'Destructive Power:' : 'Daya Hancur:'} ${conf.damage}</span>
        <span class="text-amber-300 font-sans font-bold">${isEn ? 'Tap to Mount' : 'Ketuk untuk Pasang'}</span>
      </div>
    `;
  }

  cargoHoverTooltip.innerHTML = html;
  cargoHoverTooltip.classList.remove('invisible', 'opacity-0');
  cargoHoverTooltip.classList.add('active');
  moveCargoTooltip(e);
}

function moveCargoTooltip(e) {
  if (!cargoHoverTooltip || !cargoHoverTooltip.classList.contains('active')) return;
  const padding = 14;
  let x = e.clientX + padding;
  let y = e.clientY + padding;
  const w = cargoHoverTooltip.offsetWidth || 230;
  const h = cargoHoverTooltip.offsetHeight || 100;
  if (x + w > window.innerWidth - 10) x = e.clientX - w - padding;
  if (y + h > window.innerHeight - 10) y = e.clientY - h - padding;
  cargoHoverTooltip.style.left = `${Math.max(10, x)}px`;
  cargoHoverTooltip.style.top = `${Math.max(10, y)}px`;
}

function hideCargoTooltip() {
  if (!cargoHoverTooltip) return;
  cargoHoverTooltip.classList.remove('active');
  cargoHoverTooltip.classList.add('invisible', 'opacity-0');
}

function handleBroadsideSlotClick(slotIdx) {
  const unequippedCannons = playerState.cannonInventory || [];
  if (unequippedCannons.length === 0) {
    showToast(typeof t === 'function' ? t('toastNoCannonsInCargo') : "Belum ada meriam di kargo! Rakit senjata faksi di Bengkel Rakit terlebih dahulu.", "alert");
    return;
  }
  if (unequippedCannons.length === 1) {
    equipCannonFromCargo(0, slotIdx);
    return;
  }
  openCannonPickerForSlot(slotIdx);
}

function openCannonPickerForSlot(slotIdx) {
  targetEquipSlotIndex = slotIdx;
  if (!cannonPickerModal || !cannonPickerList) return;
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');

  const cannons = (playerState.cannonInventory || []);
  if (cannons.length === 0) {
    showToast(typeof t === 'function' ? t('toastNoCannonsInCargo') : "Belum ada meriam di kargo! Rakit senjata di Bengkel Rakit dermaga terlebih dahulu.", "alert");
    return;
  }

  if (cannonPickerTitle) {
    cannonPickerTitle.innerText = isEn ? `MOUNT DECK CANNON (SLOT #${slotIdx + 1})` : `PASANG MERIAM GELADAK (SLOT #${slotIdx + 1})`;
  }

  cannonPickerList.innerHTML = '';
  cannons.forEach((cannon, idx) => {
    const conf = CANNON_TYPES[cannon.type] || CANNON_TYPES.standard;
    const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;
    const confFaction = (isEn && conf.factionNameEn) ? conf.factionNameEn : (conf.factionName || 'Faksi');

    const durRatio = cannon.durability / cannon.maxDurability;
    const itemEl = document.createElement('div');
    itemEl.className = 'p-2.5 sm:p-3 rounded-xl border bg-slate-900/90 hover:border-amber-400/80 flex items-center justify-between gap-3 transition shadow-md';
    itemEl.style.borderColor = conf.color || 'rgba(217, 119, 6, 0.4)';
    itemEl.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border" style="background: rgba(15,23,42,0.9); border-color: ${conf.color || '#f59e0b'}; color: ${conf.color || '#fbbf24'};">
          ${SVG_ICONS[conf.itemIconKey] || SVG_ICONS.cannons}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <h4 class="font-cinzel text-xs font-bold text-white truncate">${confName}</h4>
            <span class="text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500/30">${confFaction}</span>
          </div>
          <div class="flex items-center gap-2 text-[9.5px] font-mono text-slate-300 mt-0.5">
            <span>Dmg: <strong class="text-amber-300">${conf.damage}</strong></span>
            <span>Dur: <strong class="${durRatio > 0.5 ? 'text-emerald-400' : 'text-rose-400'}">${cannon.durability}/${cannon.maxDurability}</strong></span>
          </div>
        </div>
      </div>
      <button type="button" class="btn-picker-equip-now px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-cinzel font-bold text-xs shadow-md border border-emerald-300/40 active:scale-95 transition cursor-pointer shrink-0" data-idx="${idx}">
        ${isEn ? 'Mount' : 'Pasang'}
      </button>
    `;

    itemEl.querySelector('.btn-picker-equip-now').onclick = () => {
      closeCannonPicker();
      equipCannonFromCargo(idx, slotIdx);
    };

    cannonPickerList.appendChild(itemEl);
  });

  cannonPickerModal.classList.remove('hidden');
}

function closeCannonPicker() {
  if (cannonPickerModal) cannonPickerModal.classList.add('hidden');
  targetEquipSlotIndex = -1;
}

if (btnCloseCannonPicker) btnCloseCannonPicker.onclick = closeCannonPicker;
if (btnCancelCannonPicker) btnCancelCannonPicker.onclick = closeCannonPicker;
if (cannonPickerModal) {
  cannonPickerModal.onclick = (e) => {
    if (e.target === cannonPickerModal) closeCannonPicker();
  };
}

let selectedCargoSlotIndex = -1;

function getCargoOccupiedCount() {
  if (!playerState) return 0;
  const resCount = playerState.resources 
    ? Object.keys(playerState.resources).filter(k => (playerState.resources[k] || 0) > 0).length 
    : 0;
  const cannonCount = Array.isArray(playerState.cannonInventory) ? playerState.cannonInventory.length : 0;
  return resCount + cannonCount;
}

function getCargoOccupiedItems() {
  const items = [];
  if (!playerState) return items;

  // 1. Resources (> 0)
  if (playerState.resources && typeof RESOURCE_TYPES !== 'undefined') {
    for (const [key, def] of Object.entries(RESOURCE_TYPES)) {
      const count = playerState.resources[key] || 0;
      if (count > 0) {
        items.push({
          kind: 'resource',
          key,
          def,
          count
        });
      }
    }
  }

  // 2. Unequipped Cannon Items in Cargo
  if (Array.isArray(playerState.cannonInventory)) {
    playerState.cannonInventory.forEach((cannon, idx) => {
      const def = (typeof CANNON_TYPES !== 'undefined' && CANNON_TYPES[cannon.type]) || CANNON_TYPES.standard;
      items.push({
        kind: 'cannon',
        cannon,
        cannonIdx: idx,
        def
      });
    });
  }

  return items;
}

function renderInventoryUI() {
  if (!inventoryModal) return;
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';

  // Header Currencies
  if (invGoldText) invGoldText.innerText = (playerState.gold || 0).toLocaleString(isEn ? 'en-US' : 'id-ID');
  if (invBloodText) invBloodText.innerText = (playerState.bloodEssence || 0).toLocaleString(isEn ? 'en-US' : 'id-ID');

  // Port Docking Status
  const isDocked = Boolean(playerState.isDockedAtPort);
  if (invDockStatusBadge) {
    if (isDocked) {
      const portName = playerState.dockedPortName || (isEn ? "Harbor Dock" : "Dermaga Pelabuhan");
      invDockStatusBadge.className = 'text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm';
      invDockStatusBadge.innerText = `${isEn ? 'Moored' : 'Berlabuh'}: ${portName}`;
    } else {
      invDockStatusBadge.className = 'text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono bg-slate-900 text-amber-400/90 border border-amber-500/30';
      invDockStatusBadge.innerText = isEn ? 'Open Ocean (Sailing)' : 'Laut Lepas (Berlayar)';
    }
  }

  if (invCraftPortIndicator) {
    if (isDocked) {
      invCraftPortIndicator.className = 'text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40';
      invCraftPortIndicator.innerText = isEn ? 'Dock Ready' : 'Dermaga Siap';
    } else {
      invCraftPortIndicator.className = 'text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-500/40';
      invCraftPortIndicator.innerText = isEn ? 'Port Required' : 'Wajib di Dermaga';
    }
  }

  // Ensure playerState data integrity
  if (!playerState.resources) {
    playerState.resources = { wood: 0, rope: 0, iron: 0, stone: 0, bamboo: 0, mistOrb: 0, snowOrb: 0, firePowder: 0, chitin: 0, sailCloth: 0, bronze: 0, krakenInk: 0, leviathanBone: 0 };
  }
  if (!playerState.equippedCannons) {
    playerState.equippedCannons = [{ id: 'cannon_starter', type: 'standard', durability: 90, maxDurability: 90 }];
  }
  if (!playerState.cannonInventory) {
    playerState.cannonInventory = [];
  }

  const maxSlots = (typeof getMaxCannonSlots === 'function') 
    ? getMaxCannonSlots(playerState.upgrades.cannons || 1) 
    : Math.min(4, 1 + Math.floor((playerState.upgrades.cannons || 1) / 2));
  const equipped = playerState.equippedCannons || [];

  if (invEquippedSlotCountBadge) {
    invEquippedSlotCountBadge.innerText = `${equipped.length} / ${maxSlots} ${isEn ? 'Mounted' : 'Terpasang'}`;
  }

  // Artillery Combat Telemetry
  let totalDmg = 0;
  let totalDur = 0;
  let totalMaxDur = 0;
  equipped.forEach(c => {
    if (!c) return;
    const conf = CANNON_TYPES[c.type] || CANNON_TYPES.standard;
    const dmg = (typeof getCannonDamage === 'function') ? getCannonDamage(c) : conf.damage;
    totalDmg += dmg;
    totalDur += (c.durability || 0);
    totalMaxDur += (c.maxDurability || 1);
  });
  if (armoryTotalDmgText) {
    armoryTotalDmgText.innerText = `${totalDmg} DMG`;
  }
  if (armoryAvgDurText) {
    const durPct = totalMaxDur > 0 ? Math.round((totalDur / totalMaxDur) * 100) : 100;
    armoryAvgDurText.innerText = `${durPct}%`;
    armoryAvgDurText.className = durPct > 60 ? 'text-emerald-400 font-bold' : (durPct > 25 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold');
  }

  // 1. RENDER EQUIPPED CANNONS RACK (BROADSIDE SLOTS)
  if (invEquippedRack) {
    invEquippedRack.innerHTML = '';
    for (let slotIdx = 0; slotIdx < maxSlots; slotIdx++) {
      const cannon = equipped[slotIdx];
      const slotEl = document.createElement('div');

      if (cannon) {
        const conf = CANNON_TYPES[cannon.type] || CANNON_TYPES.standard;
        const curLvl = cannon.level || 1;
        const durRatio = Math.max(0, Math.min(1, cannon.durability / cannon.maxDurability));
        const isJammed = cannon.durability <= 0;
        const durColor = isJammed ? '#ef4444' : (durRatio > 0.5 ? '#10b981' : (durRatio > 0.25 ? '#f59e0b' : '#ef4444'));
        const isSelected = selectedEquippedSlotIndex === slotIdx;
        const cannonName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;

        slotEl.id = `hardpointSlot_${slotIdx}`;
        slotEl.dataset.hardpointIdx = slotIdx;
        slotEl.setAttribute('tabindex', '0');
        slotEl.className = 'hardpoint-card p-2.5 rounded-xl border bg-slate-900/90 flex flex-col justify-between gap-2 shadow-md relative overflow-hidden transition-all';
        slotEl.style.borderColor = isSelected ? '#38bdf8' : (isJammed ? 'rgba(239, 68, 68, 0.6)' : (conf.color || 'rgba(217, 119, 6, 0.4)'));
        if (isSelected) {
          slotEl.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.45)';
        }

        let actionBtns = '';
        if (cannon.type === 'standard' && cannon.durability < cannon.maxDurability) {
          const curIron = playerState.resources.iron || 0;
          const curWood = playerState.resources.wood || 0;
          const canRepairRes = isDocked && curIron >= 4 && curWood >= 2;
          const canRepairGold = isDocked && (playerState.gold || 0) >= 120;
          actionBtns += `
            <button type="button" class="btn-refurbish-cannon px-2 py-0.5 rounded text-[8.5px] font-bold border transition flex items-center justify-center gap-0.5 ${
              canRepairRes ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-400 cursor-pointer active:scale-95' : 'bg-slate-900 text-slate-500 border-white/10 cursor-not-allowed opacity-60'
            }" data-slot="${slotIdx}" data-mode="resource" ${!canRepairRes ? 'disabled' : ''} title="${isDocked ? (isEn ? 'Service Mats: 4 Iron + 2 Wood' : 'Servis Bahan: 4 Besi + 2 Kayu') : (isEn ? 'Port Required' : 'Wajib di Dermaga')}">
              ${isEn ? 'Service' : 'Servis'}
            </button>
            <button type="button" class="btn-refurbish-cannon-gold px-2 py-0.5 rounded text-[8.5px] font-bold border transition flex items-center justify-center gap-0.5 ${
              canRepairGold ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-300 cursor-pointer active:scale-95 font-black' : 'bg-slate-900 text-slate-500 border-white/10 cursor-not-allowed opacity-60'
            }" data-slot="${slotIdx}" data-mode="gold" ${!canRepairGold ? 'disabled' : ''} title="${isDocked ? (isEn ? 'Express Yard Fee: 120 Gold Coins' : 'Jasa Kilat Bengkel: 120 Koin Emas') : (isEn ? 'Port Required' : 'Wajib di Dermaga')}">
              ${isEn ? '120 Coins' : '120 Koin'}
            </button>
          `;
        }

        actionBtns += `
          <button type="button" class="btn-unequip-cannon px-2.5 py-0.5 rounded-lg text-[9px] font-cinzel font-bold border border-white/10 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition cursor-pointer flex items-center justify-center gap-1 active:scale-95" data-slot="${slotIdx}" title="${isEn ? 'Unequip cannon to cargo' : 'Lepas meriam ke kargo'}">
            ${SVG_ICONS.unequip || ''}
            <span>${isEn ? 'Unequip' : 'Lepas'}</span>
          </button>
        `;

        slotEl.innerHTML = `
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border relative shadow-inner" style="background: rgba(15,23,42,0.9); border-color: ${conf.color || '#f59e0b'};">
              ${SVG_ICONS[conf.itemIconKey] || SVG_ICONS.cannons}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-mono text-cyan-300 font-bold">Slot #${slotIdx + 1}</span>
                <span class="text-[8px] px-1.5 py-0.2 rounded font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40">Lv.${curLvl}</span>
              </div>
              <h5 class="font-cinzel text-[10.5px] font-bold text-slate-100 truncate">${cannonName}</h5>
            </div>
          </div>
          <div>
            <div class="flex justify-between items-center text-[8.5px] font-mono mb-0.5">
              <span class="text-slate-400">${isEn ? 'Barrel Durability:' : 'Durabilitas Laras:'}</span>
              <span class="font-bold" style="color: ${durColor};">${cannon.durability}/${cannon.maxDurability}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-950 border border-white/10 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300" style="width: ${(durRatio * 100).toFixed(0)}%; background-color: ${durColor};"></div>
            </div>
          </div>
          <div class="flex items-center gap-1 mt-0.5 flex-wrap">
            ${actionBtns}
          </div>
        `;

        slotEl.style.cursor = 'pointer';
        slotEl.onclick = (e) => {
          if (!e.target.closest('button')) {
            selectedEquippedSlotIndex = slotIdx;
            selectedCargoSlotIndex = -1;
            hideCargoTooltip();
            renderInventoryUI();
          }
        };

        slotEl.addEventListener('mouseenter', (e) => showCargoTooltip(e, { kind: 'cannon', def: conf, cannon }));
        slotEl.addEventListener('mousemove', (e) => moveCargoTooltip(e));
        slotEl.addEventListener('mouseleave', () => hideCargoTooltip());
      } else {
        slotEl.id = `hardpointSlot_${slotIdx}`;
        slotEl.dataset.hardpointIdx = slotIdx;
        slotEl.setAttribute('tabindex', '0');
        slotEl.className = `p-3 rounded-xl border border-dashed bg-slate-950/40 flex flex-col items-center justify-center text-center gap-1.5 min-h-[85px] broadside-slot-empty ${hasUnusedCannons ? 'highlight-ready' : 'border-white/10'}`;
        slotEl.innerHTML = `
          <div class="w-7 h-7 rounded-lg border border-dashed ${hasUnusedCannons ? 'border-emerald-400 text-emerald-300' : 'border-white/20 text-slate-500'} flex items-center justify-center font-mono text-sm font-bold">+</div>
          <span class="text-[10px] font-cinzel font-bold ${hasUnusedCannons ? 'text-emerald-300' : 'text-slate-400'}">Slot #${slotIdx + 1} ${isEn ? 'Empty' : 'Kosong'}</span>
          <span class="text-[8.5px] ${hasUnusedCannons ? 'text-emerald-400 font-semibold' : 'text-slate-500'}">${hasUnusedCannons ? (isEn ? 'Tap to Mount Cannon' : 'Ketuk untuk Pasang Meriam') : (isEn ? 'No Weapons in Cargo' : 'Belum Ada Senjata di Kargo')}</span>
        `;
        slotEl.onclick = (e) => {
          e.stopPropagation();
          handleBroadsideSlotClick(slotIdx);
        };
      }

      invEquippedRack.appendChild(slotEl);
    }
  }

  // 2. RENDER 16 CARGO SLOTS (GRID ALA RPG/SURVIVAL)
  const occupiedItems = getCargoOccupiedItems();
  const maxCargoCapacity = typeof MAX_CARGO_SLOTS !== 'undefined' ? MAX_CARGO_SLOTS : 16;
  const occupiedCount = occupiedItems.length;

  if (invCargoOccupiedCount) {
    invCargoOccupiedCount.innerText = occupiedCount;
    invCargoOccupiedCount.className = (occupiedCount >= maxCargoCapacity) ? "text-rose-400 font-bold animate-pulse" : "text-amber-300 font-bold";
  }
  if (mobileCargoBadgeCount) {
    mobileCargoBadgeCount.innerText = occupiedCount;
  }
  if (cargoCapacityBar) {
    const capPct = Math.min(100, Math.round((occupiedCount / maxCargoCapacity) * 100));
    cargoCapacityBar.style.width = `${capPct}%`;
    if (capPct >= 100) {
      cargoCapacityBar.className = 'h-full rounded-full bg-rose-500 animate-pulse transition-all duration-300';
    } else if (capPct >= 75) {
      cargoCapacityBar.className = 'h-full rounded-full bg-amber-500 transition-all duration-300';
    } else {
      cargoCapacityBar.className = 'h-full rounded-full bg-emerald-500 transition-all duration-300';
    }
  }

  let displayItems = occupiedItems;
  if (currentCargoFilter === 'res') {
    displayItems = occupiedItems.filter(item => item.kind === 'resource');
  } else if (currentCargoFilter === 'weap') {
    displayItems = occupiedItems.filter(item => item.kind === 'cannon');
  }

  if (invCargoGrid) {
    invCargoGrid.innerHTML = '';

    for (let slotIdx = 0; slotIdx < maxCargoCapacity; slotIdx++) {
      const item = displayItems[slotIdx];
      const slotEl = document.createElement('div');

      if (item) {
        const itemActualIndex = occupiedItems.indexOf(item);
        const isSelected = selectedCargoSlotIndex === itemActualIndex;
        let rarityClass = 'rarity-common';
        if (item.kind === 'resource') {
          if (item.def.rarity === 'Mistik' || item.def.rarity === 'Mystic') rarityClass = 'rarity-occult';
          else if (item.def.rarity === 'Abisal' || item.def.rarity === 'Abyssal') rarityClass = 'rarity-abyssal';
          else if (item.def.rarity === 'Khusus' || item.def.rarity === 'Eksotis' || item.def.rarity === 'Special' || item.def.rarity === 'Exotic') rarityClass = 'rarity-rare';
        } else if (item.kind === 'cannon') {
          rarityClass = item.def.isOrbSpecial ? 'rarity-occult' : 'rarity-common';
        }

        slotEl.id = `cargoSlot_${slotIdx}`;
        slotEl.dataset.slotIdx = slotIdx;
        slotEl.dataset.occupied = '1';
        slotEl.setAttribute('tabindex', '0');
        slotEl.className = `cargo-slot cargo-slot-occupied ${rarityClass} ${isSelected ? 'active ring-2 ring-sky-400' : ''}`;

        if (item.kind === 'resource') {
          const iconSvg = SVG_ICONS[item.def.iconKey || item.key] || SVG_ICONS.inventory;
          const resName = (isEn && item.def.nameEn) ? item.def.nameEn : item.def.name;
          slotEl.innerHTML = `
            <div class="w-8 h-8 flex items-center justify-center shrink-0" style="color: ${item.def.color || '#fbbf24'};">
              ${iconSvg}
            </div>
            <span class="cargo-slot-count">x${item.count}</span>
          `;
          slotEl.title = `${resName} (x${item.count}) - ${isEn ? 'Click for info' : 'Klik untuk info'}`;
        } else if (item.kind === 'cannon') {
          const iconSvg = SVG_ICONS[item.def.itemIconKey] || SVG_ICONS.cannons;
          const durRatio = item.cannon.durability / item.cannon.maxDurability;
          const durBadgeColor = durRatio > 0.5 ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-rose-950 text-rose-300 border-rose-500/40';
          const cannonName = (isEn && item.def.nameEn) ? item.def.nameEn : item.def.name;
          slotEl.innerHTML = `
            <span class="cargo-slot-durability ${durBadgeColor} border">${item.cannon.durability}</span>
            <div class="w-8 h-8 flex items-center justify-center shrink-0" style="color: ${item.def.color || '#f59e0b'};">
              ${iconSvg}
            </div>
            <span class="cargo-slot-count text-[9px] font-bold text-amber-300">${isEn ? 'WEAPON' : 'SENJATA'}</span>
          `;
          slotEl.title = `${cannonName} (${item.cannon.durability}/${item.cannon.maxDurability}) - ${isEn ? 'Click to inspect/equip' : 'Klik untuk pasang'}`;
        }

        slotEl.addEventListener('mouseenter', (e) => showCargoTooltip(e, item));
        slotEl.addEventListener('mousemove', (e) => moveCargoTooltip(e));
        slotEl.addEventListener('mouseleave', () => hideCargoTooltip());

        slotEl.addEventListener('click', () => {
          selectedCargoSlotIndex = itemActualIndex;
          selectedEquippedSlotIndex = -1;
          hideCargoTooltip();
          renderInventoryUI();
        });
      } else {
        // Empty Slot
        slotEl.id = `cargoSlot_${slotIdx}`;
        slotEl.dataset.slotIdx = slotIdx;
        slotEl.dataset.occupied = '0';
        slotEl.setAttribute('tabindex', '0');
        slotEl.className = 'cargo-slot cargo-slot-empty';
        slotEl.innerHTML = `<span class="text-xs font-mono font-bold select-none opacity-40">+</span>`;
        slotEl.title = `Slot #${slotIdx + 1} ${isEn ? 'Empty' : 'Kosong'}`;
        slotEl.addEventListener('click', () => {
          selectedCargoSlotIndex = -1;
          hideCargoTooltip();
          renderInventoryUI();
        });
      }

      invCargoGrid.appendChild(slotEl);
    }
  }

  // 3. RENDER SELECTED ITEM INSPECTOR
  if (invSlotInspector) {
    let selectedItem = null;

    if (selectedEquippedSlotIndex >= 0 && selectedEquippedSlotIndex < equipped.length && equipped[selectedEquippedSlotIndex]) {
      const eqCannon = equipped[selectedEquippedSlotIndex];
      selectedItem = {
        kind: 'cannon',
        isEquipped: true,
        slotIdx: selectedEquippedSlotIndex,
        cannon: eqCannon,
        def: CANNON_TYPES[eqCannon.type] || CANNON_TYPES.standard
      };
    } else if (selectedCargoSlotIndex >= 0 && selectedCargoSlotIndex < occupiedItems.length) {
      selectedItem = occupiedItems[selectedCargoSlotIndex];
    }

    if (selectedItem) {
      if (selectedItem.kind === 'resource') {
        const res = selectedItem.def;
        const iconSvg = SVG_ICONS[res.iconKey || selectedItem.key] || SVG_ICONS.inventory;
        const resName = (isEn && res.nameEn) ? res.nameEn : res.name;
        const resCategory = (isEn && res.categoryEn) ? res.categoryEn : (res.category || (isEn ? 'Raw Material' : 'Bahan Baku'));
        const resRarity = (isEn && res.rarityEn) ? res.rarityEn : (res.rarity || (isEn ? 'Common' : 'Umum'));
        const resSource = (isEn && res.dropSourceEn) ? res.dropSourceEn : (res.dropSource || '');
        const resDesc = (isEn && res.descEn) ? res.descEn : res.desc;

        invSlotInspector.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner" style="background: rgba(15,23,42,0.9); border-color: ${res.color || '#f59e0b'}; color: ${res.color || '#fbbf24'};">
              ${iconSvg}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <h4 class="font-cinzel text-xs font-bold text-slate-100 truncate">${resName}</h4>
                <span class="font-mono text-xs font-bold text-amber-300">x${selectedItem.count} ${isEn ? 'Units' : 'Unit'}</span>
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500/30">${resCategory}</span>
                <span class="text-[8.5px] px-1.5 py-0.2 rounded font-bold bg-slate-900 text-slate-300 border border-white/10">${resRarity}</span>
                <span class="text-[8.5px] text-slate-400 italic ml-auto truncate max-w-[140px]">${resSource}</span>
              </div>
              <p class="text-[10px] text-slate-300 mt-1 leading-snug">${resDesc}</p>
            </div>
          </div>
          <div class="mt-2.5 pt-2 border-t border-white/10 flex justify-end">
            <button type="button" class="btn-discard-item px-3 py-1 rounded-xl text-[10px] font-bold border border-rose-500/30 bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition flex items-center gap-1.5 cursor-pointer active:scale-95" data-kind="resource" data-key="${selectedItem.key}">
              ${SVG_ICONS.trash || ''}
              <span>${isEn ? 'Discard from Cargo' : 'Buang dari Kargo'}</span>
            </button>
          </div>
        `;
      } else if (selectedItem.kind === 'cannon') {
        const conf = selectedItem.def;
        const cannon = selectedItem.cannon;
        const iconSvg = SVG_ICONS[conf.itemIconKey] || SVG_ICONS.cannons;
        const curLvl = cannon.level || 1;
        const lvlCfg = (typeof getCannonLevelConfig === 'function') ? getCannonLevelConfig(curLvl) : { title: `Tingkat ${curLvl}`, titleEn: `Tier ${curLvl}`, stars: '★☆☆☆☆' };
        const lvlTitle = (isEn && lvlCfg.titleEn) ? lvlCfg.titleEn : (lvlCfg.title || (isEn ? `Tier ${curLvl}` : `Tingkat ${curLvl}`));
        const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;
        const confDesc = (isEn && conf.descEn) ? conf.descEn : conf.desc;
        const isMaxLevel = curLvl >= 5;
        const curDmg = (typeof getCannonDamage === 'function') ? getCannonDamage(cannon) : conf.damage;
        const nextDmg = !isMaxLevel && typeof getCannonDamage === 'function' ? getCannonDamage({ ...cannon, level: curLvl + 1 }) : curDmg;
        const nextMaxDur = !isMaxLevel && typeof getCannonMaxDurability === 'function' ? getCannonMaxDurability(cannon.type, curLvl + 1) : cannon.maxDurability;

        const upgradeCost = !isMaxLevel && typeof getCannonUpgradeCost === 'function' ? getCannonUpgradeCost(cannon) : null;
        let canAffordUpgrade = false;
        let costPills = [];

        if (upgradeCost) {
          canAffordUpgrade = isDocked;
          if (upgradeCost.gold) {
            const hasG = (playerState.gold || 0) >= upgradeCost.gold;
            if (!hasG) canAffordUpgrade = false;
            costPills.push(`<span class="${hasG ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}">${upgradeCost.gold} ${isEn ? 'Coins' : 'Koin'}</span>`);
          }
          if (upgradeCost.wood) {
            const hasW = (playerState.resources?.wood || 0) >= upgradeCost.wood;
            if (!hasW) canAffordUpgrade = false;
            costPills.push(`<span class="${hasW ? 'text-slate-200' : 'text-rose-400'}">${upgradeCost.wood} ${isEn ? 'Wood' : 'Kayu'}</span>`);
          }
          if (upgradeCost.iron) {
            const hasI = (playerState.resources?.iron || 0) >= upgradeCost.iron;
            if (!hasI) canAffordUpgrade = false;
            costPills.push(`<span class="${hasI ? 'text-slate-200' : 'text-rose-400'}">${upgradeCost.iron} ${isEn ? 'Iron' : 'Besi'}</span>`);
          }
          if (upgradeCost.bamboo) {
            const hasB = (playerState.resources?.bamboo || 0) >= upgradeCost.bamboo;
            if (!hasB) canAffordUpgrade = false;
            costPills.push(`<span class="${hasB ? 'text-slate-200' : 'text-rose-400'}">${upgradeCost.bamboo} ${isEn ? 'Bamboo' : 'Bambu'}</span>`);
          }
          if (upgradeCost.mistOrb) {
            const hasM = (playerState.resources?.mistOrb || 0) >= upgradeCost.mistOrb;
            if (!hasM) canAffordUpgrade = false;
            costPills.push(`<span class="${hasM ? 'text-cyan-300 font-semibold' : 'text-rose-400'}">${upgradeCost.mistOrb} ${isEn ? 'Mist Orb' : 'Orb Kabut'}</span>`);
          }
          if (upgradeCost.snowOrb) {
            const hasS = (playerState.resources?.snowOrb || 0) >= upgradeCost.snowOrb;
            if (!hasS) canAffordUpgrade = false;
            costPills.push(`<span class="${hasS ? 'text-sky-300 font-semibold' : 'text-rose-400'}">${upgradeCost.snowOrb} ${isEn ? 'Snow Orb' : 'Orb Salju'}</span>`);
          }
          if (upgradeCost.firePowder) {
            const hasF = (playerState.resources?.firePowder || 0) >= upgradeCost.firePowder;
            if (!hasF) canAffordUpgrade = false;
            costPills.push(`<span class="${hasF ? 'text-orange-400 font-semibold' : 'text-rose-400'}">${upgradeCost.firePowder} ${isEn ? 'Powder' : 'Mesiu'}</span>`);
          }
          if (upgradeCost.chitin) {
            const hasC = (playerState.resources?.chitin || 0) >= upgradeCost.chitin;
            if (!hasC) canAffordUpgrade = false;
            costPills.push(`<span class="${hasC ? 'text-rose-400 font-semibold' : 'text-rose-400'}">${upgradeCost.chitin} ${isEn ? 'Chitin' : 'Kitin'}</span>`);
          }
          if (upgradeCost.bloodEssence) {
            const hasBE = (playerState.bloodEssence || 0) >= upgradeCost.bloodEssence;
            if (!hasBE) canAffordUpgrade = false;
            costPills.push(`<span class="${hasBE ? 'text-rose-400 font-semibold' : 'text-rose-400'}">${upgradeCost.bloodEssence} ${isEn ? 'Blood' : 'Darah'}</span>`);
          }
        }

        const maxCannonMountSlots = (typeof getMaxCannonSlots === 'function') 
          ? getMaxCannonSlots(playerState.upgrades.cannons || 1) 
          : 1;
        const equippedCount = (playerState.equippedCannons || []).length;
        const nextSlotIndex = Math.min(maxCannonMountSlots - 1, equippedCount);
        const hasEmptySlot = equippedCount < maxCannonMountSlots;

        let actionHtml = '';
        if (selectedItem.isEquipped) {
          actionHtml = `
            <button type="button" class="btn-unequip-cannon px-3 py-1.5 rounded-xl text-[10px] font-cinzel font-bold border border-white/10 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition cursor-pointer flex items-center justify-center gap-1 active:scale-95" data-slot="${selectedItem.slotIdx}">
              ${SVG_ICONS.unequip || ''}
              <span>${isEn ? 'Unequip to Cargo' : 'Lepas ke Kargo'}</span>
            </button>
          `;
        } else {
          actionHtml = `
            <button type="button" class="btn-equip-cannon-from-cargo px-3.5 py-1.5 rounded-xl text-[10px] sm:text-[10.5px] font-cinzel font-black border border-emerald-300 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer active:scale-95" data-cannon-idx="${selectedItem.cannonIdx}" data-slot="${nextSlotIndex}">
              ${SVG_ICONS.equip || ''}
              <span>${hasEmptySlot ? (isEn ? `Mount to Slot #${nextSlotIndex + 1}` : `Pasang ke Slot #${nextSlotIndex + 1}`) : (isEn ? 'Swap to Ship' : 'Tukar ke Kapal')}</span>
            </button>
            <button type="button" class="btn-discard-item px-2 py-0.5 rounded-lg text-[9px] font-bold border border-rose-500/20 bg-rose-950/40 hover:bg-rose-900 text-rose-300 transition flex items-center justify-center gap-1 cursor-pointer" data-kind="cannon" data-key="${selectedItem.cannonIdx}">
              <span>${isEn ? 'Discard Weapon' : 'Buang Senjata'}</span>
            </button>
          `;
        }

        invSlotInspector.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner relative" style="background: rgba(15,23,42,0.9); border-color: ${conf.color || '#f59e0b'}; color: ${conf.color || '#fbbf24'};">
              ${iconSvg}
              <span class="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold px-1 rounded bg-amber-950 text-amber-300 border border-amber-500/50">Lv.${curLvl}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 flex-wrap">
                <div class="flex items-center gap-1.5">
                  <h4 class="font-cinzel text-xs font-bold text-white truncate">${confName}</h4>
                  <span class="text-[8.5px] px-2 py-0.2 rounded font-bold uppercase ${selectedItem.isEquipped ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-300 border border-white/10'}">${selectedItem.isEquipped ? (isEn ? 'Mounted on Ship' : 'Terpasang di Kapal') : (isEn ? 'In Cargo' : 'Dalam Kargo')}</span>
                </div>
                <span class="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.2 rounded border border-amber-500/40">${lvlCfg.stars} ${lvlTitle}</span>
              </div>
              <div class="text-[9.5px] text-slate-300 mt-0.5">${confDesc}</div>
              <div class="flex items-center gap-3 mt-1 text-[9.5px] font-mono flex-wrap">
                <span class="text-amber-300">${isEn ? 'Destructive Power:' : 'Daya Hancur:'} <strong>${curDmg}</strong> DMG ${!isMaxLevel ? `<span class="text-emerald-400 font-semibold">(➔ ${nextDmg})</span>` : ''}</span>
                <span class="text-emerald-400">${isEn ? 'Durability:' : 'Durabilitas:'} <strong>${cannon.durability}/${cannon.maxDurability}</strong> ${!isMaxLevel ? `<span class="text-sky-300 font-semibold">(➔ ${nextMaxDur})</span>` : ''}</span>
              </div>
              ${!isMaxLevel && costPills.length > 0 ? `
                <div class="text-[9px] font-mono text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span class="font-cinzel font-bold text-amber-300/90">${isEn ? `Forge Cost Lv.${curLvl + 1}:` : `Biaya Tempa Lv.${curLvl + 1}:`}</span>
                  ${costPills.join(' • ')}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
            ${!isMaxLevel ? `
              <button type="button" class="btn-upgrade-cannon px-3 py-1.5 rounded-xl text-[10px] sm:text-[10.5px] font-cinzel font-black border transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95 ${
                canAffordUpgrade 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 border-amber-300 cursor-pointer shadow-amber-950/50' 
                  : 'bg-slate-900 text-slate-500 border-white/10 cursor-not-allowed opacity-60'
              }" ${!canAffordUpgrade ? 'disabled' : ''} data-equipped="${selectedItem.isEquipped ? '1' : '0'}" data-idx="${selectedItem.isEquipped ? selectedItem.slotIdx : selectedItem.cannonIdx}" title="${!isDocked ? (isEn ? 'Cannon upgrades require mooring at a harbor dock!' : 'Peningkatan meriam wajib di dermaga pelabuhan!') : (canAffordUpgrade ? (isEn ? 'Enhance cannon durability and attack power' : 'Tingkatkan durabilitas & serangan meriam') : (isEn ? 'Insufficient materials or Gold Coins' : 'Bahan atau Koin Emas belum mencukupi'))}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>
                <span>${canAffordUpgrade ? (isEn ? `Forge Lv.${curLvl + 1}` : `Tempa Lv.${curLvl + 1}`) : (!isDocked ? (isEn ? 'Port Required' : 'Wajib Dermaga') : (isEn ? 'Need Mats' : 'Kurang Biaya'))}</span>
              </button>
            ` : `<div class="text-[9px] font-cinzel font-bold text-amber-300 text-center px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-500/20">${isEn ? 'MAX LEVEL' : 'TINGKAT MAKSIMAL'}</div>`}
            <div class="flex items-center gap-2">
              ${actionHtml}
            </div>
          </div>
        `;
      }
    } else {
      invSlotInspector.innerHTML = `
        <div class="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 shrink-0">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <div class="text-xs text-slate-400 italic">${isEn ? 'Select an item in cargo or a broadside cannon to inspect details, forge levels, or mount weapons to the ship.' : 'Pilih benda di dalam kargo atau meriam geladak untuk memeriksa detail, menempa level, atau memasang senjata ke kapal.'}</div>
      `;
    }
  }

  // 4. RENDER BLACKSMITH FOUNDRY & RECIPE ALMANAC (COLUMN 3)
  if (invCraftableList && typeof CANNON_TYPES !== 'undefined') {
    invCraftableList.innerHTML = '';

    let entries = Object.entries(CANNON_TYPES);
    if (currentCraftFilter === 'faction') {
      entries = entries.filter(([typeKey, conf]) => !conf.isOrbSpecial);
    } else if (currentCraftFilter === 'occult') {
      entries = entries.filter(([typeKey, conf]) => conf.isOrbSpecial);
    }

    entries.forEach(([typeKey, conf]) => {
      if (!conf.recipe) return;
      let hasAllIngredients = true;
      let recipeChips = '';

      for (const [resKey, reqQty] of Object.entries(conf.recipe)) {
        const resDef = (resKey === 'bloodEssence')
          ? { name: isEn ? 'Abyssal Blood' : 'Darah Abisal', color: '#f43f5e' }
          : (RESOURCE_TYPES[resKey] || { name: resKey, color: '#f59e0b' });
        const resName = (resKey === 'bloodEssence')
          ? (isEn ? 'Abyssal Blood' : 'Darah Abisal')
          : ((isEn && resDef.nameEn) ? resDef.nameEn : (resDef.name || resKey));
        const curQty = (resKey === 'bloodEssence') 
          ? (playerState.bloodEssence || 0) 
          : (playerState.resources[resKey] || 0);

        const hasEnough = curQty >= reqQty;
        if (!hasEnough) hasAllIngredients = false;

        recipeChips += `
          <span class="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border ${
            hasEnough ? 'border-emerald-500/40 text-emerald-300' : 'border-rose-500/30 text-rose-300'
          }">
            <span>${resName}:</span>
            <strong class="${hasEnough ? 'text-white' : 'text-rose-200'}">${curQty}/${reqQty}</strong>
            <span>${hasEnough ? '✓' : '✗'}</span>
          </span>
        `;
      }

      const card = document.createElement('div');
      const canCraftNow = isDocked && hasAllIngredients;
      const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;
      const confFaction = (isEn && conf.factionNameEn) ? conf.factionNameEn : (conf.factionName || (isEn ? 'Faction' : 'Faksi'));
      const confSubtitle = (isEn && conf.subtitleEn) ? conf.subtitleEn : (conf.subtitle || '');
      const confDesc = (isEn && conf.descEn) ? conf.descEn : conf.desc;

      card.id = `craftCard_${typeKey}`;
      card.dataset.type = typeKey;
      card.setAttribute('tabindex', '0');
      card.className = `craftable-recipe-card p-3 rounded-xl border flex flex-col gap-2 transition shadow-md ${
        hasAllIngredients 
          ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400' 
          : 'bg-slate-950/70 border-white/10 hover:border-white/20 opacity-85'
      }`;

      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-inner" style="background: rgba(15,23,42,0.9); border-color: ${conf.color || '#f59e0b'}; color: ${conf.color || '#fbbf24'};">
              ${SVG_ICONS[conf.itemIconKey] || SVG_ICONS.cannons}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="font-cinzel text-xs font-bold text-white">${confName}</h4>
                <span class="text-[8px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500/30">${confFaction}</span>
              </div>
              <div class="text-[9.5px] text-amber-300/80 mt-0.5">${confSubtitle}</div>
            </div>
          </div>
          <span class="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
            hasAllIngredients 
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
              : 'bg-slate-900 text-slate-400 border border-white/10'
          }">
            ${hasAllIngredients ? (isEn ? 'READY TO CRAFT' : 'SIAP RAKIT') : (isEn ? 'NEED MATERIALS' : 'BAHAN KURANG')}
          </span>
        </div>

        <div class="text-[9.5px] text-slate-300 leading-snug">${confDesc}</div>

        <div class="flex flex-wrap gap-1">
          ${recipeChips}
        </div>

        <div class="pt-1.5 border-t border-white/5 flex items-center justify-between gap-2">
          <div class="text-[9px] font-mono text-slate-400">
            <span>Dmg: <strong class="text-amber-300">${conf.damage}</strong></span> • 
            <span>Dur: <strong class="text-sky-300">${conf.maxDurability}</strong></span>
          </div>
          <button id="btnCraftCannon_${typeKey}" type="button" class="btn-craft-cannon px-3 py-1.5 rounded-xl text-[10px] font-cinzel font-black transition flex items-center gap-1.5 shadow-md active:scale-95 ${
            canCraftNow 
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white cursor-pointer border border-emerald-300/40 shadow-emerald-950/50' 
              : 'bg-slate-800 text-slate-400 border border-white/10 cursor-not-allowed opacity-60'
          }" data-type="${typeKey}" ${!canCraftNow ? 'disabled' : ''} title="${
            !isDocked ? (isEn ? 'Must be moored at harbor dock to craft' : 'Wajib berlabuh di dermaga pelabuhan untuk merakit') : (hasAllIngredients ? (isEn ? 'Craft and store into Cargo Hold' : 'Rakit dan simpan ke Pundi Kargo') : (isEn ? 'Insufficient raw materials' : 'Bahan baku belum mencukupi'))
          }">
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <span>${!isDocked ? (isEn ? 'Port Required' : 'Wajib Dermaga') : (hasAllIngredients ? (isEn ? 'CRAFT TO CARGO' : 'RAKIT KE KARGO') : (isEn ? 'Need Materials' : 'Bahan Kurang'))}</span>
          </button>
        </div>
      `;

      invCraftableList.appendChild(card);
    });
  }

  // Hook up event listeners for newly rendered buttons
  attachInventoryDynamicListeners();
}

function attachInventoryDynamicListeners() {
  // Unequip cannon
  document.querySelectorAll('.btn-unequip-cannon').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const slotIdx = parseInt(btn.dataset.slot, 10);
      unequipCannon(slotIdx);
    };
  });

  // Refurbish standard cannon (Resources)
  document.querySelectorAll('.btn-refurbish-cannon').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const slotIdx = parseInt(btn.dataset.slot, 10);
      const mode = btn.dataset.mode || 'resource';
      refurbishStandardCannon(slotIdx, mode);
    };
  });

  // Refurbish standard cannon (Gold)
  document.querySelectorAll('.btn-refurbish-cannon-gold').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const slotIdx = parseInt(btn.dataset.slot, 10);
      refurbishStandardCannon(slotIdx, 'gold');
    };
  });

  // Upgrade cannon level (Levels 1 to 5)
  document.querySelectorAll('.btn-upgrade-cannon').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const isEquipped = btn.dataset.equipped === '1';
      const idx = parseInt(btn.dataset.idx, 10);
      upgradeCannon(isEquipped, idx);
    };
  });

  // Equip cannon from cargo
  document.querySelectorAll('.btn-equip-cannon-from-cargo').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cannonIdx = parseInt(btn.dataset.cannonIdx, 10);
      const slotIdx = btn.dataset.slot !== undefined ? parseInt(btn.dataset.slot, 10) : -1;
      equipCannonFromCargo(cannonIdx, slotIdx);
    };
  });

  // Discard item from cargo
  document.querySelectorAll('.btn-discard-item').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const kind = btn.dataset.kind;
      const keyOrIdx = btn.dataset.key;
      discardCargoItem(kind, keyOrIdx);
    };
  });

  // Craft cannon
  document.querySelectorAll('.btn-craft-cannon').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const type = btn.dataset.type;
      craftCannon(type);
    };
  });
}

// Craft cannon and store into player's cargo inventory
function craftCannon(type) {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (!playerState.isDockedAtPort) {
    showToast(isEn ? "Faction cannons can only be crafted at harbor docks!" : "Perakitan meriam faksi hanya dapat dilakukan di bengkel dermaga pelabuhan!", "alert");
    return;
  }

  const occupied = getCargoOccupiedCount();
  const maxCargoCapacity = typeof MAX_CARGO_SLOTS !== 'undefined' ? MAX_CARGO_SLOTS : 16;
  if (occupied >= maxCargoCapacity) {
    showToast(isEn ? `Cargo Hold Full (${occupied}/${maxCargoCapacity})! Clear cargo space before crafting new weapons.` : `Pundi Kargo Penuh (${occupied}/${maxCargoCapacity})! Kosongkan ruang muatan sebelum merakit senjata baru.`, "alert");
    return;
  }

  const conf = CANNON_TYPES[type];
  if (!conf || !conf.recipe) return;
  const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;

  // Verify resources
  for (const [resKey, reqQty] of Object.entries(conf.recipe)) {
    const curQty = (resKey === 'bloodEssence') 
      ? (playerState.bloodEssence || 0) 
      : (playerState.resources[resKey] || 0);
    if (curQty < reqQty) {
      showToast(isEn ? `Insufficient materials to craft ${confName}!` : `Bahan tidak mencukupi untuk merakit ${conf.name}!`, "alert");
      return;
    }
  }

  // Deduct resources
  for (const [resKey, reqQty] of Object.entries(conf.recipe)) {
    if (resKey === 'bloodEssence') {
      playerState.bloodEssence -= reqQty;
    } else {
      playerState.resources[resKey] -= reqQty;
    }
  }

  // Create new cannon item in cargo inventory (Level 1)
  const newCannon = {
    id: `cannon_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type,
    level: 1,
    durability: conf.maxDurability,
    maxDurability: conf.maxDurability,
    obtainedAt: Date.now()
  };

  if (!Array.isArray(playerState.cannonInventory)) {
    playerState.cannonInventory = [];
  }
  playerState.cannonInventory.push(newCannon);

  // Auto select this newly crafted cannon in cargo so inspector opens with "Pasang ke Kapal"
  const updatedItems = getCargoOccupiedItems();
  selectedCargoSlotIndex = updatedItems.findIndex(it => it.kind === 'cannon' && it.cannon && it.cannon.id === newCannon.id);
  if (selectedCargoSlotIndex === -1) selectedCargoSlotIndex = updatedItems.length - 1;

  const maxSlots = (typeof getMaxCannonSlots === 'function') 
    ? getMaxCannonSlots(playerState.upgrades.cannons || 1) 
    : 1;
  const equippedCount = (playerState.equippedCannons || []).length;
  if (equippedCount < maxSlots) {
    showToast(isEn ? `${confName} crafted! Tap 'Mount to Ship' or tap an empty slot above.` : `${conf.name} berhasil dirakit! Ketuk 'Pasang ke Kapal' atau ketuk slot kosong di atas.`, "check");
  } else {
    showToast(isEn ? `${confName} crafted & stored in Cargo Hold!` : `${conf.name} berhasil dirakit & tersimpan di Pundi Kargo!`, "check");
  }

  if (typeof sound !== 'undefined' && typeof sound.playShipyardHammer === 'function') {
    sound.playShipyardHammer();
  } else if (typeof sound !== 'undefined') {
    sound.playLoot();
  }

  renderInventoryUI();
  updateHUD();
  saveGame();
}

// 5-Level Cannon Upgrade System (Enhances Attack Power & Max Durability)
function upgradeCannon(isEquipped, idx) {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (!playerState.isDockedAtPort) {
    showToast(isEn ? "Cannon upgrades and forging can only be done while moored at a port dock!" : "Peningkatan dan penempaan meriam hanya dapat dilakukan saat berlabuh di dermaga pelabuhan!", "alert");
    return;
  }

  let cannon = null;
  if (isEquipped) {
    if (playerState.equippedCannons && playerState.equippedCannons[idx]) {
      cannon = playerState.equippedCannons[idx];
    }
  } else {
    if (playerState.cannonInventory && playerState.cannonInventory[idx]) {
      cannon = playerState.cannonInventory[idx];
    }
  }

  if (!cannon) return;
  const curLvl = cannon.level || 1;
  if (curLvl >= 5) {
    showToast(isEn ? "This cannon has reached maximum level (Tier V)!" : "Meriam ini sudah mencapai tingkat maksimal (Tingkat V)!", "info");
    return;
  }

  const upgradeCost = (typeof getCannonUpgradeCost === 'function') ? getCannonUpgradeCost(cannon) : null;
  if (!upgradeCost) return;

  // Validate currencies & materials
  if (upgradeCost.gold && (playerState.gold || 0) < upgradeCost.gold) {
    showToast(isEn ? `Insufficient Gold Coins! Need ${upgradeCost.gold} Coins (You have: ${playerState.gold || 0}).` : `Koin Emas tidak mencukupi! Butuh ${upgradeCost.gold} Koin (Miliki: ${playerState.gold || 0}).`, "alert");
    return;
  }
  if (upgradeCost.bloodEssence && (playerState.bloodEssence || 0) < upgradeCost.bloodEssence) {
    showToast(isEn ? `Insufficient Abyssal Blood! Need ${upgradeCost.bloodEssence} Blood.` : `Darah Abisal tidak mencukupi! Butuh ${upgradeCost.bloodEssence} Darah.`, "alert");
    return;
  }
  for (const [resKey, reqQty] of Object.entries(upgradeCost)) {
    if (resKey === 'gold' || resKey === 'bloodEssence') continue;
    const curQty = playerState.resources?.[resKey] || 0;
    if (curQty < reqQty) {
      const resDef = RESOURCE_TYPES[resKey];
      const resName = (isEn && resDef?.nameEn) ? resDef.nameEn : (resDef?.name || resKey);
      showToast(isEn ? `Insufficient ${resName}! Need ${reqQty} (You have: ${curQty}).` : `Bahan ${resName} tidak mencukupi! Butuh ${reqQty} (Miliki: ${curQty}).`, "alert");
      return;
    }
  }

  // Deduct currencies & materials
  if (upgradeCost.gold) playerState.gold -= upgradeCost.gold;
  if (upgradeCost.bloodEssence) playerState.bloodEssence -= upgradeCost.bloodEssence;
  for (const [resKey, reqQty] of Object.entries(upgradeCost)) {
    if (resKey === 'gold' || resKey === 'bloodEssence') continue;
    playerState.resources[resKey] -= reqQty;
  }

  // Elevate level & update durability pool
  cannon.level = curLvl + 1;
  const newMaxDur = (typeof getCannonMaxDurability === 'function') 
    ? getCannonMaxDurability(cannon.type, cannon.level) 
    : Math.round((cannon.maxDurability || 180) * 1.35);
  cannon.maxDurability = newMaxDur;
  cannon.durability = newMaxDur; // Restored and reinforced to max capacity

  const lvlCfg = (typeof getCannonLevelConfig === 'function') ? getCannonLevelConfig(cannon.level) : { title: `Tingkat ${cannon.level}`, titleEn: `Tier ${cannon.level}`, stars: '★★☆☆☆' };
  const conf = CANNON_TYPES[cannon.type] || CANNON_TYPES.standard;
  const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;
  const lvlTitle = (isEn && lvlCfg.titleEn) ? lvlCfg.titleEn : lvlCfg.title;

  showToast(isEn ? `${confName} forged to ${lvlTitle}! Attack power & durability increased significantly!` : `${conf.name} berhasil ditempa ke ${lvlCfg.title}! Daya serang & durabilitas meningkat pesat!`, "check");

  if (typeof sound !== 'undefined') {
    if (typeof sound.playShipyardHammer === 'function') sound.playShipyardHammer();
    else if (typeof sound.playRepair === 'function') sound.playRepair();
    else sound.playLoot();
  }

  renderInventoryUI();
  updateHUD();
  saveGame();
}

// Equip cannon from cargo into broadside slot
function equipCannonFromCargo(cannonIdx, targetSlotIdx = -1) {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (!Array.isArray(playerState.cannonInventory) || !playerState.cannonInventory[cannonIdx]) return;

  const maxSlots = (typeof getMaxCannonSlots === 'function') 
    ? getMaxCannonSlots(playerState.upgrades.cannons || 1) 
    : Math.min(4, 1 + Math.floor((playerState.upgrades.cannons || 1) / 2));

  if (!Array.isArray(playerState.equippedCannons)) playerState.equippedCannons = [];

  const cannonToEquip = playerState.cannonInventory.splice(cannonIdx, 1)[0];
  const conf = CANNON_TYPES[cannonToEquip.type] || CANNON_TYPES.standard;
  const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;

  if (targetSlotIdx >= 0 && targetSlotIdx < playerState.equippedCannons.length) {
    // Replace existing occupied slot
    const oldCannon = playerState.equippedCannons[targetSlotIdx];
    playerState.equippedCannons[targetSlotIdx] = cannonToEquip;
    if (oldCannon) playerState.cannonInventory.push(oldCannon);
    const oldConf = CANNON_TYPES[oldCannon?.type];
    const oldName = (isEn && oldConf?.nameEn) ? oldConf.nameEn : (oldConf?.name || (isEn ? 'old cannon' : 'meriam lama'));
    showToast(isEn ? `${confName} mounted to Slot #${targetSlotIdx + 1} replacing ${oldName}!` : `${conf.name} dipasang ke Slot #${targetSlotIdx + 1} menggantikan ${CANNON_TYPES[oldCannon?.type]?.name || 'meriam lama'}!`, "info");
  } else if (playerState.equippedCannons.length < maxSlots) {
    // Fill next available slot
    playerState.equippedCannons.push(cannonToEquip);
    showToast(isEn ? `${confName} successfully mounted to Slot #${playerState.equippedCannons.length}!` : `${conf.name} berhasil dipasang ke Slot #${playerState.equippedCannons.length}!`, "check");
  } else {
    // Swap with first equipped cannon
    const oldCannon = playerState.equippedCannons.shift();
    playerState.equippedCannons.push(cannonToEquip);
    if (oldCannon) playerState.cannonInventory.push(oldCannon);
    const oldConf = CANNON_TYPES[oldCannon?.type];
    const oldName = (isEn && oldConf?.nameEn) ? oldConf.nameEn : (oldConf?.name || (isEn ? 'old cannon' : 'meriam lama'));
    showToast(isEn ? `${confName} mounted replacing ${oldName}!` : `${conf.name} dipasang menggantikan ${CANNON_TYPES[oldCannon?.type]?.name || 'meriam lama'}!`, "info");
  }
  playerState.equippedCannons = playerState.equippedCannons.filter(Boolean);

  selectedCargoSlotIndex = -1;
  hideCargoTooltip();
  if (typeof sound !== 'undefined') {
    if (typeof sound.playShipyardHammer === 'function') sound.playShipyardHammer();
    else sound.playClick();
  }
  renderInventoryUI();
  updateHUD();
  saveGame();
}

// Unequip cannon from broadside back to cargo inventory
function unequipCannon(slotIdx) {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (!playerState.equippedCannons || !playerState.equippedCannons[slotIdx]) return;

  const occupied = getCargoOccupiedCount();
  const maxCargoCapacity = typeof MAX_CARGO_SLOTS !== 'undefined' ? MAX_CARGO_SLOTS : 16;
  if (occupied >= maxCargoCapacity) {
    showToast(isEn ? `Cargo Hold Full (${occupied}/${maxCargoCapacity})! Clear cargo space before unequipping.` : `Pundi Kargo Penuh (${occupied}/${maxCargoCapacity})! Kosongkan slot muatan sebelum mencopot meriam.`, "alert");
    return;
  }

  const removed = playerState.equippedCannons.splice(slotIdx, 1)[0];
  if (!Array.isArray(playerState.cannonInventory)) playerState.cannonInventory = [];
  playerState.cannonInventory.push(removed);

  const conf = CANNON_TYPES[removed.type] || CANNON_TYPES.standard;
  const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;
  showToast(isEn ? `${confName} unmounted and stored in Cargo Hold.` : `${conf.name} dilepas dan disimpan ke Pundi Kargo.`, "info");

  selectedCargoSlotIndex = -1;
  if (typeof sound !== 'undefined') sound.playClick();
  renderInventoryUI();
  updateHUD();
  saveGame();
}

// Refurbish standard iron cannon at port (Supports 4 Iron + 2 Wood OR 120 Gold)
function refurbishStandardCannon(slotIdx, mode = 'resource') {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (!playerState.isDockedAtPort) {
    showToast(isEn ? "Cannon servicing can only be done while moored at a dock!" : "Servis meriam hanya dapat dilakukan saat berlabuh di dermaga!", "alert");
    return;
  }
  const cannon = playerState.equippedCannons[slotIdx];
  if (!cannon || cannon.type !== 'standard') return;

  if (mode === 'gold') {
    const curGold = playerState.gold || 0;
    if (curGold < 120) {
      showToast(isEn ? `Insufficient Gold Coins! Need 120 Coins (You have: ${curGold}).` : `Koin Emas tidak mencukupi! Butuh 120 Koin Emas (Miliki: ${curGold}).`, "alert");
      return;
    }
    playerState.gold -= 120;
  } else {
    const curIron = playerState.resources?.iron || 0;
    const curWood = playerState.resources?.wood || 0;
    if (curIron < 4 || curWood < 2) {
      showToast(isEn ? `Insufficient materials! Need 4 Iron & 2 Wood (You have: ${curIron} Iron, ${curWood} Wood).` : `Bahan servis tidak cukup! Butuh 4 Besi & 2 Kayu (Miliki: ${curIron} Besi, ${curWood} Kayu).`, "alert");
      return;
    }
    playerState.resources.iron -= 4;
    playerState.resources.wood -= 2;
  }

  cannon.durability = cannon.maxDurability;

  if (typeof sound !== 'undefined' && typeof sound.playRepair === 'function') {
    sound.playRepair();
  } else if (typeof sound !== 'undefined') {
    sound.playCoin();
  }

  showToast(isEn ? `Standard Iron Cannon serviced (${mode === 'gold' ? '120 Gold Coins' : '4 Iron + 2 Wood'}) and ready for combat!` : `Meriam Besi Standar berhasil diservis (${mode === 'gold' ? '120 Koin Emas' : '4 Besi + 2 Kayu'}) dan siap tempur kembali!`, "check");
  renderInventoryUI();
  updateHUD();
  saveGame();
}

// Discard item from cargo
function discardCargoItem(kind, keyOrIdx) {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (kind === 'resource') {
    const resDef = RESOURCE_TYPES[keyOrIdx];
    const name = (isEn && resDef?.nameEn) ? resDef.nameEn : (resDef ? resDef.name : keyOrIdx);
    playerState.resources[keyOrIdx] = 0;
    showToast(isEn ? `${name} discarded from Cargo Hold.` : `${name} telah dibuang dari pundi kargo.`, "info");
  } else if (kind === 'cannon') {
    const idx = parseInt(keyOrIdx, 10);
    if (playerState.cannonInventory && playerState.cannonInventory[idx]) {
      const removed = playerState.cannonInventory.splice(idx, 1)[0];
      const conf = CANNON_TYPES[removed.type];
      const name = (isEn && conf?.nameEn) ? conf.nameEn : (conf?.name || (isEn ? 'Cannon' : 'Meriam'));
      showToast(isEn ? `${name} discarded into the sea.` : `${name} telah dibuang ke laut.`, "info");
    }
  }

  selectedCargoSlotIndex = -1;
  if (typeof sound !== 'undefined') sound.playClick();
  renderInventoryUI();
  updateHUD();
  saveGame();
}

// ============================================================================
// RECIPE CODEX (BUKU RESEP BAHARI & CETAK BIRU FAKSI)
// ============================================================================

function renderRecipeBookUI() {
  if (!recipeBookGrid || typeof CANNON_TYPES === 'undefined') return;
  recipeBookGrid.innerHTML = '';
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';

  // 1. Upgrade System Guide Banner & Progression Codex
  const upgradeGuideEl = document.createElement('div');
  upgradeGuideEl.className = 'recipe-codex-card p-3.5 sm:p-4 rounded-2xl flex flex-col gap-2.5 border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 col-span-full shadow-lg';
  upgradeGuideEl.innerHTML = `
    <div class="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/50 bg-amber-950/60 text-amber-400 shadow-inner">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/><circle cx="12" cy="12" r="9"/></svg>
        </div>
        <div>
          <h3 class="font-cinzel text-xs sm:text-sm font-bold text-amber-300">${isEn ? 'CANNON FORGING GUIDE (TIERS I - V)' : 'PANDUAN TEMPA MERIAM (TINGKAT I - V)'}</h3>
          <p class="text-[9.5px] sm:text-[10px] text-slate-300">${isEn ? 'Increase projectile damage and extend cannon durability up to 3x!' : 'Tingkatkan daya hancur proyektil dan perpanjang durabilitas meriam hingga 3x lipat!'}</p>
        </div>
      </div>
      <span class="text-[8.5px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500/40">${isEn ? '5 TIERS' : '5 TINGKAT'}</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[9.5px] font-mono">
      <div class="p-2 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-amber-400 font-bold">★☆☆☆☆</span>
          <span class="text-[8.5px] text-slate-400">Lv.1</span>
        </div>
        <div class="font-bold text-slate-200">${isEn ? 'Tier I (Base)' : 'Tingkat I (Dasar)'}</div>
        <div class="text-[8.5px] text-slate-400">${isEn ? '1.0x Damage<br>1.0x Durability' : '1.0x Kerusakan<br>1.0x Durabilitas'}</div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/80 border border-amber-500/20 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-amber-400 font-bold">★★☆☆☆</span>
          <span class="text-[8.5px] text-amber-300">Lv.2</span>
        </div>
        <div class="font-bold text-slate-200">${isEn ? 'Tier II (Steel)' : 'Tingkat II (Baja)'}</div>
        <div class="text-[8.5px] text-emerald-400">${isEn ? '+25% Damage<br>+35% Durability' : '+25% Kerusakan<br>+35% Durabilitas'}</div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-amber-400 font-bold">★★★☆☆</span>
          <span class="text-[8.5px] text-amber-300">Lv.3</span>
        </div>
        <div class="font-bold text-slate-200">${isEn ? 'Tier III (Bronze)' : 'Tingkat III (Perunggu)'}</div>
        <div class="text-[8.5px] text-emerald-400">${isEn ? '+50% Damage<br>+75% Durability' : '+50% Kerusakan<br>+75% Durabilitas'}</div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/80 border border-amber-500/40 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-amber-400 font-bold">★★★★☆</span>
          <span class="text-[8.5px] text-amber-300">Lv.4</span>
        </div>
        <div class="font-bold text-slate-200">${isEn ? 'Tier IV (Officer)' : 'Tingkat IV (Perwira)'}</div>
        <div class="text-[8.5px] text-emerald-400">${isEn ? '+80% Damage<br>+125% Durability' : '+80% Kerusakan<br>+125% Durabilitas'}</div>
      </div>
      <div class="p-2 rounded-xl bg-slate-950/80 border border-amber-400/60 bg-gradient-to-b from-amber-950/30 to-slate-950/80 flex flex-col gap-1 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-amber-300 font-bold">★★★★★</span>
          <span class="text-[8.5px] text-amber-300 font-bold">Lv.5</span>
        </div>
        <div class="font-bold text-amber-300">${isEn ? 'Tier V (Abyssal)' : 'Tingkat V (Abisal)'}</div>
        <div class="text-[8.5px] text-emerald-400 font-bold">${isEn ? '+120% Damage<br>+200% Durability (3x!)' : '+120% Kerusakan<br>+200% Durabilitas (3x!)'}</div>
      </div>
    </div>

    <div class="text-[9px] sm:text-[9.5px] p-2 rounded-lg bg-slate-950/60 text-slate-300 border border-white/5 leading-relaxed">
      <strong>${isEn ? 'Forging Instructions:' : 'Instruksi Tempa:'}</strong> ${
        isEn
          ? 'Tap any cannon in the broadside rack or cargo while moored at a port dock, then press the <strong class="text-amber-300">Forge Lv.X</strong> button. Each tier elevation completely restores the cannon\'s durability!'
          : 'Ketuk meriam mana pun di rak geladak atau di kargo saat berada di dermaga pelabuhan, lalu gunakan tombol <strong class="text-amber-300">Tempa Lv.X</strong>. Setiap kenaikan tingkat akan sekaligus memulihkan kondisi durabilitas meriam hingga penuh!'
      }
    </div>
  `;
  recipeBookGrid.appendChild(upgradeGuideEl);

  for (const [typeKey, conf] of Object.entries(CANNON_TYPES)) {
    const card = document.createElement('div');
    card.className = 'recipe-codex-card p-3 sm:p-4 rounded-2xl flex flex-col gap-2.5';
    const confName = (isEn && conf.nameEn) ? conf.nameEn : conf.name;
    const confFaction = (isEn && conf.factionNameEn) ? conf.factionNameEn : (conf.factionName || (isEn ? 'Faction' : 'Faksi'));
    const confSubtitle = (isEn && conf.subtitleEn) ? conf.subtitleEn : (conf.subtitle || '');
    const confDesc = (isEn && conf.descEn) ? conf.descEn : conf.desc;

    let recipeStatusList = '';
    let isFullyCraftable = true;

    for (const [resKey, reqQty] of Object.entries(conf.recipe)) {
      const resDef = (resKey === 'bloodEssence')
        ? { name: isEn ? 'Abyssal Blood' : 'Darah Abisal', color: '#f43f5e' }
        : (RESOURCE_TYPES[resKey] || { name: resKey, color: '#f59e0b' });
      const resName = (resKey === 'bloodEssence')
        ? (isEn ? 'Abyssal Blood' : 'Darah Abisal')
        : ((isEn && resDef.nameEn) ? resDef.nameEn : (resDef.name || resKey));
      const curQty = (resKey === 'bloodEssence') 
        ? (playerState.bloodEssence || 0) 
        : (playerState.resources[resKey] || 0);

      const hasEnough = curQty >= reqQty;
      if (!hasEnough) isFullyCraftable = false;

      recipeStatusList += `
        <div class="flex items-center justify-between text-[10px] sm:text-xs py-0.5 border-b border-white/5">
          <span class="flex items-center gap-1.5" style="color: ${resDef.color || '#f59e0b'};">
            <span class="w-1.5 h-1.5 rounded-full" style="background: ${resDef.color || '#f59e0b'};"></span>
            ${resName}
          </span>
          <span class="font-mono font-bold ${hasEnough ? 'text-emerald-400' : 'text-rose-400'}">
            ${curQty} / ${reqQty} ${hasEnough ? '✓' : '✗'}
          </span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner" style="background: rgba(15,23,42,0.9); border-color: ${conf.color || '#f59e0b'}; color: ${conf.color || '#fbbf24'};">
            ${SVG_ICONS[conf.itemIconKey] || SVG_ICONS.cannons}
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="font-cinzel text-xs sm:text-sm font-bold text-white">${confName}</h3>
              <span class="text-[8.5px] px-2 py-0.2 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500/30">${confFaction}</span>
            </div>
            <div class="text-[10px] text-amber-300/80 mt-0.5">${confSubtitle}</div>
          </div>
        </div>
        <span class="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${isFullyCraftable ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-white/10'}">
          ${isFullyCraftable ? (isEn ? 'MATERIALS READY ✓' : 'BAHAN LENGKAP ✓') : (isEn ? 'NEED MATERIALS' : 'BAHAN KURANG')}
        </span>
      </div>

      <p class="text-[10px] sm:text-xs text-slate-300 leading-relaxed">${confDesc}</p>

      <div class="bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-1">
        <div class="text-[9.5px] font-cinzel font-bold text-amber-200/90 mb-1">${isEn ? 'RAW MATERIAL FORMULA:' : 'FORMULA BAHAN BAKU:'}</div>
        ${recipeStatusList}
      </div>

      <div class="grid grid-cols-2 gap-2 text-[9.5px] font-mono bg-slate-950/60 p-2 rounded-xl border border-white/5">
        <div><span class="text-slate-400">${isEn ? 'Destructive Power:' : 'Daya Hancur:'}</span> <strong class="text-amber-300">${conf.damage} DMG</strong></div>
        <div><span class="text-slate-400">${isEn ? 'Durability:' : 'Durabilitas:'}</span> <strong class="text-sky-300">${conf.maxDurability} ${isEn ? 'Shots' : 'Tembakan'}</strong></div>
      </div>

      <div class="text-[9px] sm:text-[9.5px] p-2 rounded-lg ${conf.isOrbSpecial ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/25' : 'bg-amber-950/30 text-amber-200 border border-amber-500/20'} leading-relaxed">
        <strong>${isEn ? 'Barrel Rule:' : 'Aturan Laras:'}</strong> ${
          conf.isOrbSpecial 
            ? (isEn ? 'This mythical faction cannon will vanish instantly when its durability reaches 0!' : 'Meriam faksi mistis ini akan sirna dan lenyap seketika saat durabilitasnya mencapai 0!') 
            : (isEn ? 'Standard iron cannons jam when worn out and can be serviced at a harbor dock (4 Iron + 2 Wood).' : 'Meriam besi standar akan macet saat aus, dan dapat diservis kembali di dermaga pelabuhan (4 Besi + 2 Kayu).')
        }
      </div>
    `;

    recipeBookGrid.appendChild(card);
  }
}

function openRecipeBookModal() {
  sound.init();
  renderRecipeBookUI();
  if (recipeBookModal) {
    recipeBookModal.classList.remove('modal-enter', 'hidden');
    recipeBookModal.classList.add('modal-active');
  }
}

function closeRecipeBookModal() {
  if (!recipeBookModal) return;
  recipeBookModal.classList.remove('modal-active');
  recipeBookModal.classList.add('modal-enter', 'hidden');
}

if (btnOpenRecipeBook) btnOpenRecipeBook.addEventListener('click', openRecipeBookModal);
if (btnCloseRecipeBook) btnCloseRecipeBook.addEventListener('click', closeRecipeBookModal);
if (btnReturnToInventoryFromBook) btnReturnToInventoryFromBook.addEventListener('click', closeRecipeBookModal);

// Modal open / close / toggle
function openInventoryModal() {
  sound.init();
  closeLoreModal();
  closeHelpModal();
  closeMapModal();
  closeUpgradeModal();
  closeCannonPicker();
  hideCargoTooltip();
  setMobileInventoryTab('cargo');
  renderInventoryUI();
  if (inventoryModal) {
    inventoryModal.classList.remove('modal-enter', 'hidden');
    inventoryModal.classList.add('modal-active');
  }
  applyColumnVisibility();
  isGamePaused = true;
}

function closeInventoryModal() {
  hideCargoTooltip();
  closeCannonPicker();
  if (!inventoryModal) return;
  inventoryModal.classList.remove('modal-active');
  inventoryModal.classList.add('modal-enter', 'hidden');
  if (pauseReturnTarget === 'pause') {
    pauseReturnTarget = null;
    openPauseModal();
    return;
  }
  if (isGameStarted) {
    isGamePaused = false;
    lastTime = performance.now();
  }
}

function toggleInventoryModal() {
  if (inventoryModal && inventoryModal.classList.contains('modal-active')) {
    closeInventoryModal();
  } else {
    openInventoryModal();
  }
}

if (btnOpenInventory) btnOpenInventory.addEventListener('click', openInventoryModal);
if (btnCloseInventory) btnCloseInventory.addEventListener('click', closeInventoryModal);
const hudCargoHoldWidget = document.getElementById('hudCargoHoldWidget');
if (hudCargoHoldWidget) hudCargoHoldWidget.addEventListener('click', openInventoryModal);
if (btnPauseInventory) {
  btnPauseInventory.addEventListener('click', () => {
    closePauseModal();
    pauseReturnTarget = 'pause';
    openInventoryModal();
  });
}
if (btnQuickNavShipyard) {
  btnQuickNavShipyard.addEventListener('click', () => {
    closeInventoryModal();
    openUpgradeModal();
  });
}
if (inventoryModal) {
  inventoryModal.addEventListener('click', (e) => {
    if (e.target === inventoryModal) closeInventoryModal();
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

// Telemetry & Exploration UI
const mapPlayerCoords = document.getElementById('mapPlayerCoords');
const mapSectorLabel = document.getElementById('mapSectorLabel');
const fogProgressBar = document.getElementById('fogProgressBar');
const fogProgressText = document.getElementById('fogProgressText');
const mapActivePinBadge = document.getElementById('mapActivePinBadge');
const txtActivePinStatus = document.getElementById('txtActivePinStatus');

// Interactive Sea Map Navigation Controls & State
const btnMapZoomIn = document.getElementById('btnMapZoomIn');
const btnMapZoomOut = document.getElementById('btnMapZoomOut');
const btnMapCenterShip = document.getElementById('btnMapCenterShip');
const btnMapResetView = document.getElementById('btnMapResetView');
const mapZoomBadge = document.getElementById('mapZoomBadge');
const btnMapClearPin = document.getElementById('btnMapClearPin');

// Island Intelligence Dossier Elements
const islandIntelDrawer = document.getElementById('islandIntelDrawer');
const intelIslandName = document.getElementById('intelIslandName');
const intelFactionBadge = document.getElementById('intelFactionBadge');
const intelThreatBadge = document.getElementById('intelThreatBadge');
const intelDistanceLabel = document.getElementById('intelDistanceLabel');
const intelCoordsLabel = document.getElementById('intelCoordsLabel');
const intelDescLabel = document.getElementById('intelDescLabel');
const intelPirateStatusContainer = document.getElementById('intelPirateStatusContainer');
const intelPirateStatusLabel = document.getElementById('intelPirateStatusLabel');
const btnSetWaypointToIsland = document.getElementById('btnSetWaypointToIsland');
const btnCenterIslandOnMap = document.getElementById('btnCenterIslandOnMap');
const btnCloseIslandIntel = document.getElementById('btnCloseIslandIntel');
const intelEmblemContainer = document.getElementById('intelEmblemContainer');

const seaMapState = {
  zoom: 1.0,
  minZoom: 0.5,
  maxZoom: 4.5,
  panX: 0,
  panY: 0,
  lastPanX: 0,
  lastPanY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  isPinching: false,
  initialPinchDist: 0,
  initialPinchZoom: 1.0,
  pinchMidX: 0,
  pinchMidY: 0,
  pinchWorldX: 0,
  pinchWorldY: 0,
  selectedIsland: null
};

let mapAnimationId = null;

function updateMapZoomBadge() {
  if (mapZoomBadge) {
    mapZoomBadge.innerText = `${Math.round(seaMapState.zoom * 100)}%`;
  }
}

function getMapBaseScale(w, h) {
  const curLevel = playerState.mapLevel || 1;
  const cfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined' && MAP_UPGRADE_CONFIG[curLevel]) 
    ? MAP_UPGRADE_CONFIG[curLevel] 
    : { maxRadius: 3000 };
  const maxVisionRadius = cfg.maxRadius || 3000;
  return (Math.min(w, h) * 0.45) / maxVisionRadius;
}

function centerMapOnPlayer() {
  if (!seaMapCanvas) return;
  const rect = seaMapCanvas.getBoundingClientRect();
  const w = rect.width || 540;
  const h = rect.height || 400;
  const baseScale = getMapBaseScale(w, h);
  const scale = baseScale * seaMapState.zoom;
  seaMapState.panX = -playerState.x * scale;
  seaMapState.panY = -playerState.y * scale;
  seaMapState.lastPanX = seaMapState.panX;
  seaMapState.lastPanY = seaMapState.panY;
  renderSeaMapCanvas();
}

function resetMapView() {
  seaMapState.zoom = 1.0;
  seaMapState.panX = 0;
  seaMapState.panY = 0;
  seaMapState.lastPanX = 0;
  seaMapState.lastPanY = 0;
  updateMapZoomBadge();
  renderSeaMapCanvas();
}

function zoomMapStep(factor) {
  if (!seaMapCanvas) return;
  const oldZoom = seaMapState.zoom;
  const newZoom = Math.max(seaMapState.minZoom, Math.min(seaMapState.maxZoom, oldZoom * factor));
  if (newZoom === oldZoom) return;

  const ratio = newZoom / oldZoom;
  seaMapState.panX = seaMapState.panX * ratio;
  seaMapState.panY = seaMapState.panY * ratio;
  seaMapState.lastPanX = seaMapState.panX;
  seaMapState.lastPanY = seaMapState.panY;
  seaMapState.zoom = newZoom;
  updateMapZoomBadge();
  renderSeaMapCanvas();
}

function selectIslandIntel(isl) {
  if (!isl || !islandIntelDrawer) return;
  seaMapState.selectedIsland = isl;
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';

  if (intelIslandName) intelIslandName.innerText = isl.name;
  if (intelCoordsLabel) intelCoordsLabel.innerText = `X: ${isl.x}, Y: ${isl.y}`;

  const dist = Math.hypot(isl.x - playerState.x, isl.y - playerState.y);
  if (intelDistanceLabel) intelDistanceLabel.innerText = `${Math.round(dist)}m (± ${Math.max(1, Math.round(dist / 40))}s)`;

  if (intelDescLabel) {
    intelDescLabel.innerText = isl.desc || (isEn ? "Strategic oceanic territory with natural resources and fortifications." : "Wilayah perairan strategis dengan potensi sumber daya alam dan benteng pertahanan.");
  }

  // Dynamic Faction Badge
  if (intelFactionBadge) {
    if (isl.isHomePort) {
      intelFactionBadge.innerText = isEn ? "Fleet Base" : "Pangkalan Armada";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-sky-950 text-sky-300 font-bold border border-sky-500/40";
    } else if (isl.isShopIsland) {
      intelFactionBadge.innerText = isEn ? "Free Trade Port" : "Pasar Bebas Niaga";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40";
    } else if (isl.isUninhabited) {
      intelFactionBadge.innerText = isEn ? "Uninhabited Isle" : "Pulau Tak Berpenghuni";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold border border-white/10";
    } else if (isl.clan === 'blood' || isl.isFlesh) {
      intelFactionBadge.innerText = isEn ? "Abyssal Blood Clan" : "Klan Darah Abisal";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-500/40";
    } else if (isl.clan === 'mist') {
      intelFactionBadge.innerText = isEn ? "Mystic Mist Clan" : "Klan Kabut Mistis";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-purple-950 text-purple-300 font-bold border border-purple-500/40";
    } else if (isl.clan === 'iron') {
      intelFactionBadge.innerText = isEn ? "Iron Reef Clan" : "Klan Karang Besi";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-orange-950 text-orange-300 font-bold border border-orange-500/40";
    } else if (isl.clan === 'viking') {
      intelFactionBadge.innerText = isEn ? "Viking Raider Clan" : "Klan Penjarah Viking";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-blue-950 text-blue-300 font-bold border border-blue-500/40";
    } else if (isl.clan === 'wokou') {
      intelFactionBadge.innerText = isEn ? "Wokou Corsair Clan" : "Klan Perompak Wokou";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-500/40";
    } else {
      intelFactionBadge.innerText = isEn ? "Maritime Gold Clan" : "Klan Emas Maritim";
      intelFactionBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-amber-900/60 text-amber-200 font-bold border border-amber-400/40";
    }
  }

  // Threat Level Badge
  if (intelThreatBadge) {
    if (isl.isHomePort || isl.isShopIsland || isl.isConquered) {
      intelThreatBadge.innerText = isl.isConquered ? (isEn ? "Conquered Territory" : "Wilayah Taklukan") : (isEn ? "Safe" : "Aman");
      intelThreatBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30";
    } else if (isl.tier >= 3 || isl.clan === 'blood' || isl.isFlesh) {
      intelThreatBadge.innerText = isEn ? "Extreme Hazard" : "Bahaya Ekstrem";
      intelThreatBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-500/50 animate-pulse";
    } else if (isl.tier === 2) {
      intelThreatBadge.innerText = isEn ? "High" : "Tinggi";
      intelThreatBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-orange-950 text-orange-300 font-bold border border-orange-500/40";
    } else {
      intelThreatBadge.innerText = isEn ? "Moderate" : "Moderat";
      intelThreatBadge.className = "text-[8.5px] px-2 py-0.2 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-500/40";
    }
  }

  // Pirate / Garrison Status Pill
  if (intelPirateStatusContainer && intelPirateStatusLabel) {
    if (isl.isUninhabited) {
      const isCleared = isl.isPirateCleared || (playerState.clearedPirateIslands && playerState.clearedPirateIslands.includes(isl.id));
      if (isCleared) {
        intelPirateStatusLabel.innerText = isEn ? "Pirate Lair: Cleared (Corsairs Eliminated)" : "Sarang Bajak Laut: Bersih (Perompak Telah Dieliminasi)";
        intelPirateStatusContainer.className = "flex items-center gap-1.5 text-[9.5px] font-bold p-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 mb-2.5 text-emerald-300";
      } else {
        intelPirateStatusLabel.innerText = isEn ? "Pirate Lair: Warning! Guarded by Wild Corsairs" : "Sarang Bajak Laut: Waspada! Dijaga oleh Perompak Liar";
        intelPirateStatusContainer.className = "flex items-center gap-1.5 text-[9.5px] font-bold p-1.5 rounded-xl bg-rose-950/70 border border-rose-500/40 mb-2.5 text-rose-300 animate-pulse";
      }
    } else if (isl.isHomePort) {
      intelPirateStatusLabel.innerText = isEn ? "Peaceful Harbor: Protected by Defense Batteries" : "Pelabuhan Damai: Terlindungi Meriam Pertahanan";
      intelPirateStatusContainer.className = "flex items-center gap-1.5 text-[9.5px] font-bold p-1.5 rounded-xl bg-sky-950/60 border border-sky-500/30 mb-2.5 text-sky-300";
    } else if (isl.isShopIsland) {
      intelPirateStatusLabel.innerText = isEn ? "Trade Neutral Zone: Hostility Free" : "Zona Netral Perdagangan: Bebas Permusuhan";
      intelPirateStatusContainer.className = "flex items-center gap-1.5 text-[9.5px] font-bold p-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 mb-2.5 text-emerald-300";
    } else if (isl.isConquered) {
      intelPirateStatusLabel.innerText = isEn ? "Fleet Vassal: Regular Tributes & Resources" : "Taklukan Armada: Memberi Upeti & Hasil Alam Berkala";
      intelPirateStatusContainer.className = "flex items-center gap-1.5 text-[9.5px] font-bold p-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 mb-2.5 text-amber-300";
    } else {
      intelPirateStatusLabel.innerText = isEn ? "Active Enemy Garrison: Attacks Approaching Fleets" : "Garnisun Musuh Aktif: Menyerang Armada yang Mendekat";
      intelPirateStatusContainer.className = "flex items-center gap-1.5 text-[9.5px] font-bold p-1.5 rounded-xl bg-red-950/60 border border-red-500/30 mb-2.5 text-red-300";
    }
  }

  islandIntelDrawer.classList.remove('hidden');

  if (typeof sound !== 'undefined' && typeof sound.playClick === 'function') {
    sound.playClick();
  }
}

function closeIslandIntel() {
  seaMapState.selectedIsland = null;
  if (islandIntelDrawer) islandIntelDrawer.classList.add('hidden');
}

function renderSeaMapUI() {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  const curLevel = playerState.mapLevel || 1;
  const cfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined' && MAP_UPGRADE_CONFIG[curLevel]) 
    ? MAP_UPGRADE_CONFIG[curLevel] 
    : { name: "Peta Nelayan", nameEn: "Fisherman's Chart", desc: "Bagan laut dasar", descEn: "Basic nautical chart" };
  const nextCfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined') ? MAP_UPGRADE_CONFIG[curLevel + 1] : null;

  if (mapLevelBadge) mapLevelBadge.innerText = `Lv.${curLevel}`;
  if (mapNameLabel) mapNameLabel.innerText = (isEn && cfg.nameEn) ? cfg.nameEn : cfg.name;
  if (mapDescLabel) mapDescLabel.innerText = (isEn && cfg.descEn) ? cfg.descEn : cfg.desc;

  // Real-time telemetry coordinates
  if (mapPlayerCoords) {
    mapPlayerCoords.innerText = `${isEn ? 'Ship' : 'Kapal'}: X: ${Math.round(playerState.x)}, Y: ${Math.round(playerState.y)}`;
  }
  if (mapSectorLabel) {
    const secX = Math.round(playerState.x / 1200);
    const secY = Math.round(playerState.y / 1200);
    mapSectorLabel.innerText = `• ${isEn ? 'Sector' : 'Sektor'} (${secX}, ${secY})`;
  }

  // Fog of War exploration progress
  const exploredCount = Object.keys(playerState.exploredSectors || {}).length;
  const exploredPct = Math.min(100, Math.max(1, Math.round((exploredCount / 220) * 100)));
  if (fogProgressBar) {
    fogProgressBar.style.width = `${exploredPct}%`;
  }
  if (fogProgressText) {
    fogProgressText.innerText = `${exploredPct}%`;
  }

  // Active Waypoint Pin readout
  if (playerState.waypointPin) {
    const distToPin = Math.hypot(playerState.waypointPin.x - playerState.x, playerState.waypointPin.y - playerState.y);
    if (txtActivePinStatus) txtActivePinStatus.innerText = `Pin: ${Math.round(distToPin)}m`;
    if (mapActivePinBadge) mapActivePinBadge.classList.remove('hidden');
  } else {
    if (txtActivePinStatus) txtActivePinStatus.innerText = isEn ? 'Pin: Inactive' : 'Pin: Nonaktif';
    if (mapActivePinBadge) mapActivePinBadge.classList.add('hidden');
  }

  if (btnUpgradeMap && mapUpgradeBtnText) {
    if (!nextCfg) {
      mapUpgradeBtnText.innerText = isEn ? "Max Ocean Chart" : "Peta Samudra Maksimal";
      btnUpgradeMap.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      mapUpgradeBtnText.innerText = isEn ? `Upgrade Chart (${nextCfg.cost} Coins)` : `Tingkatkan Peta (${nextCfg.cost} Koin)`;
      if (playerState.gold >= nextCfg.cost) {
        btnUpgradeMap.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        btnUpgradeMap.classList.add('opacity-50', 'cursor-not-allowed');
      }
    }
  }

  updateMapZoomBadge();
  updateMapPinButton();
  renderSeaMapCanvas();
}

function updateMapPinButton() {
  if (!btnMapClearPin) return;
  if (playerState.waypointPin) {
    btnMapClearPin.classList.remove('hidden');
  } else {
    btnMapClearPin.classList.add('hidden');
  }
}

function handleMapPinClick(clientX, clientY) {
  if (!seaMapCanvas) return;
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  const rect = seaMapCanvas.getBoundingClientRect();
  const clickX = clientX - rect.left;
  const clickY = clientY - rect.top;

  const w = rect.width || 540;
  const h = rect.height || 400;
  const curLevel = playerState.mapLevel || 1;
  const cfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined' && MAP_UPGRADE_CONFIG[curLevel]) ? MAP_UPGRADE_CONFIG[curLevel] : { maxRadius: 3000 };
  const maxVisionRadius = cfg.maxRadius || 3000;
  const scale = ((Math.min(w, h) * 0.45) / maxVisionRadius) * (seaMapState.zoom || 1.0);

  const cx = w / 2 + (seaMapState.panX || 0);
  const cy = h / 2 + (seaMapState.panY || 0);

  // 1. Check if clicked an island
  let clickedIsland = null;
  const sectorSize = (typeof FOG_SECTOR_SIZE !== 'undefined') ? FOG_SECTOR_SIZE : 1200;
  for (let i = 0; i < WORLD_ISLANDS.length; i++) {
    const isl = WORLD_ISLANDS[i];
    const secKey = `${Math.round(isl.x / sectorSize)},${Math.round(isl.y / sectorSize)}`;
    const isExplored = (playerState.exploredSectors && playerState.exploredSectors[secKey]) || isl.isHomePort;
    const isRevealedByLevel = cfg.showTiers && cfg.showTiers.includes(isl.tier);
    if (!isExplored && !isRevealedByLevel && !isl.isShopIsland && !isl.isHomePort) continue;

    const islScreenX = cx + isl.x * scale;
    const islScreenY = cy + isl.y * scale;
    const distToClick = Math.hypot(clickX - islScreenX, clickY - islScreenY);
    const islHitRadius = Math.max(22, (isl.radius || 200) * scale + 10);
    if (distToClick <= islHitRadius) {
      clickedIsland = isl;
      break;
    }
  }

  if (clickedIsland) {
    selectIslandIntel(clickedIsland);
    return;
  }

  // 2. If clicked very close to existing pin (< 26px on canvas), clear it
  if (playerState.waypointPin) {
    const existingPinScreenX = cx + playerState.waypointPin.x * scale;
    const existingPinScreenY = cy + playerState.waypointPin.y * scale;
    const distToPinScreen = Math.hypot(clickX - existingPinScreenX, clickY - existingPinScreenY);
    if (distToPinScreen < 26) {
      playerState.waypointPin = null;
      updateMapPinButton();
      closeIslandIntel();
      showToast(isEn ? "Navigation pin removed" : "Pin navigasi dihapus", "compass");
      if (typeof sound !== 'undefined' && typeof sound.playClick === 'function') {
        sound.playClick();
      }
      renderSeaMapCanvas();
      renderSeaMapUI();
      return;
    }
  }

  // 3. Open ocean click: drop/move Waypoint Pin
  const worldX = (clickX - cx) / scale;
  const worldY = (clickY - cy) / scale;

  playerState.waypointPin = { x: Math.round(worldX), y: Math.round(worldY) };
  closeIslandIntel();
  updateMapPinButton();
  const dist = Math.hypot(worldX - playerState.x, worldY - playerState.y);
  showToast(isEn ? `Navigation Pin Set! Distance: ${Math.round(dist)}m` : `Pin Navigasi Ditetapkan! Jarak: ${Math.round(dist)}m`, "compass");
  if (typeof sound !== 'undefined' && typeof sound.playLoot === 'function') {
    sound.playLoot();
  }
  renderSeaMapCanvas();
}

function toggleMapPinAtCenter() {
  if (!seaMapCanvas) return;
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  const rect = seaMapCanvas.getBoundingClientRect();
  const w = rect.width || 540;
  const h = rect.height || 400;
  const curLevel = playerState.mapLevel || 1;
  const cfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined' && MAP_UPGRADE_CONFIG[curLevel]) ? MAP_UPGRADE_CONFIG[curLevel] : { maxRadius: 3000 };
  const maxVisionRadius = cfg.maxRadius || 3000;
  const scale = ((Math.min(w, h) * 0.45) / maxVisionRadius) * (seaMapState.zoom || 1.0);
  const cx = w / 2 + (seaMapState.panX || 0);
  const cy = h / 2 + (seaMapState.panY || 0);

  const midX = w / 2;
  const midY = h / 2;

  // 1. Check if center reticle is over an explored island
  let clickedIsland = null;
  const sectorSize = (typeof FOG_SECTOR_SIZE !== 'undefined') ? FOG_SECTOR_SIZE : 1200;
  for (let i = 0; i < WORLD_ISLANDS.length; i++) {
    const isl = WORLD_ISLANDS[i];
    const secKey = `${Math.round(isl.x / sectorSize)},${Math.round(isl.y / sectorSize)}`;
    const isExplored = (playerState.exploredSectors && playerState.exploredSectors[secKey]) || isl.isHomePort;
    const isRevealedByLevel = cfg.showTiers && cfg.showTiers.includes(isl.tier);
    if (!isExplored && !isRevealedByLevel && !isl.isShopIsland && !isl.isHomePort) continue;

    const islScreenX = cx + isl.x * scale;
    const islScreenY = cy + isl.y * scale;
    const distToCenter = Math.hypot(midX - islScreenX, midY - islScreenY);
    const islHitRadius = Math.max(22, (isl.radius || 200) * scale + 10);
    if (distToCenter <= islHitRadius) {
      clickedIsland = isl;
      break;
    }
  }

  if (clickedIsland) {
    selectIslandIntel(clickedIsland);
    playerState.waypointPin = { x: clickedIsland.x, y: clickedIsland.y };
    updateMapPinButton();
    const dist = Math.hypot(clickedIsland.x - playerState.x, clickedIsland.y - playerState.y);
    showToast(isEn ? `Waypoint set to ${clickedIsland.name}! Distance: ${Math.round(dist)}m` : `Waypoint ditetapkan ke ${clickedIsland.name}! Jarak: ${Math.round(dist)}m`, "compass");
    if (typeof sound !== 'undefined' && typeof sound.playLoot === 'function') {
      sound.playLoot();
    }
    renderSeaMapCanvas();
    return;
  }

  // 1.5 Check if center reticle is over player's death shipwreck
  if (playerState.playerDeathWreck && Date.now() < playerState.playerDeathWreck.expiresAt) {
    const dw = playerState.playerDeathWreck;
    const dwScreenX = cx + dw.x * scale;
    const dwScreenY = cy + dw.y * scale;
    const distToCenter = Math.hypot(midX - dwScreenX, midY - dwScreenY);
    if (distToCenter <= 28) {
      playerState.waypointPin = { x: dw.x, y: dw.y };
      updateMapPinButton();
      const dist = Math.hypot(dw.x - playerState.x, dw.y - playerState.y);
      showToast(isEn ? `Waypoint set to Sunken Ship! Distance: ${Math.round(dist)}m` : `Waypoint ditetapkan ke Kapal Karam Anda! Jarak: ${Math.round(dist)}m`, "compass");
      if (typeof sound !== 'undefined' && typeof sound.playLoot === 'function') {
        sound.playLoot();
      }
      renderSeaMapCanvas();
      return;
    }
  }

  // 2. If already pinned near center reticle (< 28px), remove pin
  if (playerState.waypointPin) {
    const existingPinScreenX = cx + playerState.waypointPin.x * scale;
    const existingPinScreenY = cy + playerState.waypointPin.y * scale;
    const distToPin = Math.hypot(midX - existingPinScreenX, midY - existingPinScreenY);
    if (distToPin < 28) {
      playerState.waypointPin = null;
      updateMapPinButton();
      closeIslandIntel();
      showToast(isEn ? "Navigation pin removed" : "Pin navigasi dihapus", "compass");
      if (typeof sound !== 'undefined' && typeof sound.playClick === 'function') {
        sound.playClick();
      }
      renderSeaMapCanvas();
      renderSeaMapUI();
      return;
    }
  }

  // 3. Open ocean: set pin at center reticle
  const worldX = (midX - cx) / scale;
  const worldY = (midY - cy) / scale;
  playerState.waypointPin = { x: Math.round(worldX), y: Math.round(worldY) };
  closeIslandIntel();
  updateMapPinButton();
  const dist = Math.hypot(worldX - playerState.x, worldY - playerState.y);
  showToast(isEn ? `Navigation Pin Set! Distance: ${Math.round(dist)}m` : `Pin Navigasi Ditetapkan! Jarak: ${Math.round(dist)}m`, "compass");
  if (typeof sound !== 'undefined' && typeof sound.playLoot === 'function') {
    sound.playLoot();
  }
  renderSeaMapCanvas();
}

/* ==========================================================================
   PROCEDURAL VECTOR EMBLEMS FOR SEA MAP (100% VECTOR PATHS - NO EMOJIS)
   ========================================================================== */

function drawMapShipwreckIcon(ctx, x, y, r = 11) {
  ctx.save();
  ctx.translate(x, y);

  // Background crimson glow disc
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Broken ship hull / keel vector
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  // Curved broken hull bottom
  ctx.moveTo(-r * 0.65, r * 0.2);
  ctx.quadraticCurveTo(0, r * 0.55, r * 0.65, r * 0.2);
  ctx.lineTo(r * 0.45, -r * 0.05);
  ctx.lineTo(-r * 0.45, -r * 0.05);
  ctx.closePath();
  ctx.fillStyle = 'rgba(153, 27, 27, 0.9)';
  ctx.fill();
  ctx.stroke();

  // Snapped tilting mast
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.1, -r * 0.05);
  ctx.lineTo(-r * 0.35, -r * 0.65);
  ctx.stroke();

  // Broken spar / crossbeam
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 0.45);
  ctx.lineTo(-r * 0.15, -r * 0.35);
  ctx.stroke();

  ctx.restore();
}

function drawMapAnchorIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(2, 132, 199, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Anchor Vector
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Ring
  ctx.beginPath();
  ctx.arc(0, -r * 0.42, r * 0.18, 0, Math.PI * 2);
  ctx.stroke();

  // Shank
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.24);
  ctx.lineTo(0, r * 0.45);
  ctx.stroke();

  // Stock
  ctx.beginPath();
  ctx.moveTo(-r * 0.35, -r * 0.1);
  ctx.lineTo(r * 0.35, -r * 0.1);
  ctx.stroke();

  // Fluke crescent
  ctx.beginPath();
  ctx.arc(0, r * 0.15, r * 0.42, 0.25 * Math.PI, 0.75 * Math.PI, false);
  ctx.stroke();

  ctx.restore();
}

function drawMapScalesIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(5, 150, 105, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Scales Vector
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';

  // Pillar
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.45);
  ctx.lineTo(0, r * 0.45);
  ctx.stroke();

  // Balance beam
  ctx.beginPath();
  ctx.moveTo(-r * 0.42, -r * 0.2);
  ctx.lineTo(r * 0.42, -r * 0.2);
  ctx.stroke();

  // Left pan
  ctx.beginPath();
  ctx.moveTo(-r * 0.42, -r * 0.2);
  ctx.lineTo(-r * 0.42, r * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-r * 0.42, r * 0.18, r * 0.18, 0, Math.PI, false);
  ctx.stroke();

  // Right pan
  ctx.beginPath();
  ctx.moveTo(r * 0.42, -r * 0.2);
  ctx.lineTo(r * 0.42, r * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(r * 0.42, r * 0.18, r * 0.18, 0, Math.PI, false);
  ctx.stroke();

  ctx.restore();
}

function drawMapConqueredFlagIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(180, 83, 9, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pennant Pole
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.25, -r * 0.55);
  ctx.lineTo(-r * 0.25, r * 0.55);
  ctx.stroke();

  // Golden Victory Pennant
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(-r * 0.25, -r * 0.5);
  ctx.lineTo(r * 0.45, -r * 0.18);
  ctx.lineTo(-r * 0.25, r * 0.1);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMapUninhabitedIsletIcon(ctx, x, y, r = 6) {
  ctx.save();
  ctx.translate(x, y);

  // Turquoise shallow atoll reef halo
  ctx.fillStyle = 'rgba(20, 184, 166, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
  ctx.fill();

  // Golden sandy islet
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tiny emerald foliage dot
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMapGoldClanIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(217, 119, 6, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Lion / Doubloons Sigil
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Cross crown
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.35);
  ctx.lineTo(0, r * 0.35);
  ctx.moveTo(-r * 0.35, 0);
  ctx.lineTo(r * 0.35, 0);
  ctx.stroke();

  ctx.restore();
}

function drawMapIronClanIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Crossed Hammers
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.38, -r * 0.38); ctx.lineTo(r * 0.38, r * 0.38);
  ctx.moveTo(r * 0.38, -r * 0.38); ctx.lineTo(-r * 0.38, r * 0.38);
  ctx.stroke();

  // Anvil core
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-r * 0.25, -r * 0.12, r * 0.5, r * 0.25);

  ctx.restore();
}

function drawMapMistClanIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(107, 33, 168, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Occult Eye
  ctx.strokeStyle = '#f5d0fe';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.42, 0);
  ctx.quadraticCurveTo(0, -r * 0.35, r * 0.42, 0);
  ctx.quadraticCurveTo(0, r * 0.35, -r * 0.42, 0);
  ctx.stroke();

  // Slit Pupil
  ctx.fillStyle = '#e879f9';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMapBloodClanIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(159, 18, 57, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tentacles / Kraken Maw
  ctx.strokeStyle = '#fecdd3';
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-r * 0.1, r * 0.4);
  ctx.quadraticCurveTo(-r * 0.45, 0, -r * 0.28, -r * 0.35);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(r * 0.1, r * 0.4);
  ctx.quadraticCurveTo(r * 0.45, 0, r * 0.28, -r * 0.35);
  ctx.stroke();

  // Maw core
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMapVikingClanIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Crossed Viking Battleaxes
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.38, -r * 0.38); ctx.lineTo(r * 0.38, r * 0.38);
  ctx.moveTo(r * 0.38, -r * 0.38); ctx.lineTo(-r * 0.38, r * 0.38);
  ctx.stroke();

  // Crescent axe blades
  ctx.fillStyle = '#bae6fd';
  ctx.beginPath();
  ctx.arc(-r * 0.28, -r * 0.28, r * 0.16, 0, Math.PI * 2);
  ctx.arc(r * 0.28, -r * 0.28, r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Central Nordic boss
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawMapWokouClanIcon(ctx, x, y, r = 8) {
  ctx.save();
  ctx.translate(x, y);

  // Background disc
  ctx.fillStyle = 'rgba(225, 29, 72, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Torii Arch / Dragon Gateway
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Curved top beam (kasagi)
  ctx.beginPath();
  ctx.moveTo(-r * 0.45, -r * 0.28);
  ctx.quadraticCurveTo(0, -r * 0.4, r * 0.45, -r * 0.28);
  ctx.stroke();

  // Straight tie beam (nuki)
  ctx.beginPath();
  ctx.moveTo(-r * 0.35, -r * 0.12);
  ctx.lineTo(r * 0.35, -r * 0.12);
  ctx.stroke();

  // Vertical pillars (hashira)
  ctx.strokeStyle = '#fda4af';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-r * 0.24, -r * 0.28);
  ctx.lineTo(-r * 0.24, r * 0.4);
  ctx.moveTo(r * 0.24, -r * 0.28);
  ctx.lineTo(r * 0.24, r * 0.4);
  ctx.stroke();

  // Central Crimson Sun
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.arc(0, r * 0.08, r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMapEnemyUnitIcon(ctx, x, y, e) {
  ctx.save();
  ctx.translate(x, y);

  const clan = (e.clan === 'batavia') ? 'gold' : (e.clan || 'gold');
  const isMonster = Boolean(e.isMonster || clan === 'blood');
  const heading = e.angle || 0;

  // Pulsing alert aura if alerted
  if (e.alertState === 'alerted') {
    const pulse = (Date.now() * 0.005) % 1;
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 - pulse * 0.7})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 8 + pulse * 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Treasury Ship aura
  if (e.isTreasuryShip) {
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (isMonster) {
    // ----------------------------------------------------
    // SEA MONSTERS & ABYSSAL CREATURES
    // ----------------------------------------------------
    ctx.rotate(heading);
    if (e.monsterType === 'megalodon') {
      // Megalodon: Shark Silhouette with Dorsal Fin & Razor Teeth
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(7, 0);       // Snout
      ctx.lineTo(2, -3.5);
      ctx.lineTo(0, -6);      // Dorsal fin tip
      ctx.lineTo(-1, -3.5);
      ctx.lineTo(-5, -4);     // Tail upper lobe
      ctx.lineTo(-4, 0);      // Tail fork
      ctx.lineTo(-5, 4);      // Tail lower lobe
      ctx.lineTo(1, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (e.monsterType === 'kraken') {
      // Kraken: Central Eye & Writhing Tentacle Cluster
      ctx.fillStyle = '#881337';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Radiating tentacles
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 1.1;
      for (let t = 0; t < 4; t++) {
        const ta = (t * Math.PI) / 2 + 0.3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ta) * 3, Math.sin(ta) * 3);
        ctx.quadraticCurveTo(Math.cos(ta + 0.6) * 6, Math.sin(ta + 0.6) * 6, Math.cos(ta) * 7.5, Math.sin(ta) * 7.5);
        ctx.stroke();
      }
    } else if (e.monsterType === 'leviathan') {
      // Ancient Leviathan: Colossal Armored Skull & Serpentine Horns
      ctx.fillStyle = '#450a0a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(3, -4.5);
      ctx.lineTo(-2, -6);     // Left Horn
      ctx.lineTo(-1, -2.5);
      ctx.lineTo(-6, -3);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, 3);
      ctx.lineTo(-1, 2.5);
      ctx.lineTo(-2, 6);      // Right Horn
      ctx.lineTo(3, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing crimson eyes
      ctx.fillStyle = '#f87171';
      ctx.fillRect(2, -2, 1.5, 1.5);
      ctx.fillRect(2, 0.5, 1.5, 1.5);
    } else {
      // Larva / Deep Parasite: Spiky Abyssal Crawl
      ctx.fillStyle = '#991b1b';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else {
    // ----------------------------------------------------
    // HUMAN CLAN ENEMY VESSELS
    // ----------------------------------------------------
    ctx.rotate(heading);

    if (clan === 'viking') {
      // Viking Longship: Dragon Head Prow, Crossed Axes motif, Sky Blue sails
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.9;

      // Long narrow drakkar hull
      ctx.beginPath();
      ctx.moveTo(8, 0);         // Dragon Prow
      ctx.lineTo(5, -1.8);
      ctx.lineTo(-5, -2.5);
      ctx.lineTo(-7, 0);        // Curly Stern
      ctx.lineTo(-5, 2.5);
      ctx.lineTo(5, 1.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Square Viking Sail
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(-2, -3.2, 3.2, 6.4);
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-2, -3.2, 3.2, 6.4);

    } else if (clan === 'wokou') {
      // Wokou Junk: High stern deck, fan-ribbed junk sail, red pennant
      ctx.fillStyle = '#9f1239';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 0.9;

      // Junk Hull (broad flat bow, high stern)
      ctx.beginPath();
      ctx.moveTo(6.5, -1.5);
      ctx.lineTo(6.5, 1.5);
      ctx.lineTo(-4.5, 3.2);
      ctx.lineTo(-6.5, 2.2);
      ctx.lineTo(-6.5, -2.2);
      ctx.lineTo(-4.5, -3.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Batten Junk Sail (Fan Ribbed)
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-1, -4.5);
      ctx.lineTo(2.5, -3);
      ctx.lineTo(2.5, 3);
      ctx.lineTo(-1, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 0.6;
      ctx.stroke();

    } else if (clan === 'iron') {
      // Ironclad Ram: Heavy armored wedge, smoking smokestack, dark slate
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.0;

      // Wedge Hull with Iron Ram
      ctx.beginPath();
      ctx.moveTo(8, 0);         // Steam Ram beak
      ctx.lineTo(4, -3.5);
      ctx.lineTo(-6, -3.5);
      ctx.lineTo(-6, 3.5);
      ctx.lineTo(4, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Twin Iron Smokestacks
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-1.5, -2, 2.8, 1.8);
      ctx.fillRect(-1.5, 0.5, 2.8, 1.8);

    } else if (clan === 'mist') {
      // Mist Phantom: Slender ghostly hull with occult soul glow
      ctx.fillStyle = '#3b0764';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 0.9;

      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(2, -2.8);
      ctx.lineTo(-6, -2.2);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-6, 2.2);
      ctx.lineTo(2, 2.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Soul Lantern Prow
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(3.5, 0, 1.6, 0, Math.PI * 2);
      ctx.fill();

    } else if (clan === 'pirate') {
      // Corsair / Pirate Vessel: Black charred hull, skull & crossbones flag, crimson bowsprit
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 0.9;

      ctx.beginPath();
      ctx.moveTo(8, 0); // Sharp bowsprit
      ctx.lineTo(3, -3);
      ctx.lineTo(-6, -2.5);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-6, 2.5);
      ctx.lineTo(3, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Black Jolly Roger sail with white skull dot
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-2, -3.5, 3.5, 7);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-2, -3.5, 3.5, 7);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(-0.25, 0, 1.2, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Batavia Galleon: High aftcastle, gold royal lion heraldry
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 0.9;

      ctx.beginPath();
      ctx.moveTo(7.5, 0);
      ctx.lineTo(2.5, -3.2);
      ctx.lineTo(-5.5, -3.8);
      ctx.lineTo(-7, -2.5);
      ctx.lineTo(-7, 2.5);
      ctx.lineTo(-5.5, 3.8);
      ctx.lineTo(2.5, 3.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Triple Mast Sails
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2, -3.2, 3, 6.4);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-6, -2.2, 2.5, 4.4);
    }
  }

  ctx.restore();
}

function drawMapMerchantShipIcon(ctx, x, y, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Wooden Hull
  ctx.fillStyle = '#b45309';
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(6.5, 0);
  ctx.lineTo(-3.5, -3.2);
  ctx.lineTo(-3.5, 3.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Billowing White Sail
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, 0, 3, -Math.PI * 0.45, Math.PI * 0.45, false);
  ctx.fill();

  ctx.restore();
}

function renderSeaMapCanvas() {
  const isMobile = isMobileDevice() || window.innerWidth < 1024;
  const dprMap = isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2);
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

  // Center coordinate offset by pan and scaled by zoom
  const cx = w / 2 + (seaMapState.panX || 0);
  const cy = h / 2 + (seaMapState.panY || 0);
  const scale = ((Math.min(w, h) * 0.45) / maxVisionRadius) * (seaMapState.zoom || 1.0);

  // 1. Concentric Ocean Rings
  const rings = [
    { r: 8000,  label: "Ring 0: Teluk Nusa Damai", color: 'rgba(56, 189, 248, 0.2)' },
    { r: 22000, label: "Ring 1: Perairan Senja",   color: 'rgba(234, 179, 8, 0.2)' },
    { r: 42000, label: "Ring 2: Karang Besi",      color: 'rgba(234, 88, 12, 0.2)' },
    { r: 62000, label: "Ring 3: Sekte Kabut",      color: 'rgba(168, 85, 247, 0.2)' },
    { r: 75000, label: "Ring 4: Laut Merah Abisal", color: 'rgba(225, 29, 72, 0.25)' }
  ];

  rings.forEach(ring => {
    if (ring.r <= maxVisionRadius * 1.5) {
      mctx.strokeStyle = ring.color;
      mctx.lineWidth = 1;
      mctx.setLineDash([4, 6]);
      mctx.beginPath();
      mctx.arc(cx, cy, ring.r * scale, 0, Math.PI * 2);
      mctx.stroke();

      mctx.font = '8px sans-serif';
      mctx.fillStyle = ring.color.replace('0.2', '0.6').replace('0.25', '0.7');
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
  const sectorSize = (typeof FOG_SECTOR_SIZE !== 'undefined') ? FOG_SECTOR_SIZE : 1200;
  if (playerState.exploredSectors) {
    mctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
    for (const secKey in playerState.exploredSectors) {
      const parts = secKey.split(',');
      const sx = parseInt(parts[0], 10) * sectorSize;
      const sy = parseInt(parts[1], 10) * sectorSize;
      const mapX = cx + sx * scale;
      const mapY = cy + sy * scale;
      if (mapX >= -30 && mapX <= w + 30 && mapY >= -30 && mapY <= h + 30) {
        mctx.beginPath();
        mctx.arc(mapX, mapY, sectorSize * scale * 1.15, 0, Math.PI * 2);
        mctx.fill();
      }
    }
  }

  // 4. World Islands with Procedural Vector Emblems (NO EMOJIS!)
  WORLD_ISLANDS.forEach(isl => {
    const mapX = cx + isl.x * scale;
    const mapY = cy + isl.y * scale;

    const secKey = `${Math.round(isl.x / sectorSize)},${Math.round(isl.y / sectorSize)}`;
    const isExplored = (playerState.exploredSectors && playerState.exploredSectors[secKey]) || isl.isHomePort;
    const isRevealedByLevel = cfg.showTiers && cfg.showTiers.includes(isl.tier);

    if (!isExplored && !isRevealedByLevel && !isl.isShopIsland && !isl.isHomePort) {
      if (Math.hypot(isl.x, isl.y) <= maxVisionRadius) {
        if (mapX >= -20 && mapX <= w + 20 && mapY >= -20 && mapY <= h + 20) {
          mctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
          mctx.font = 'bold 9px sans-serif';
          mctx.fillText("?", mapX - 2, mapY + 3);
        }
      }
      return;
    }

    // Viewport Culling
    if (mapX < -40 || mapX > w + 40 || mapY < -40 || mapY > h + 40) return;

    const dotRadius = Math.max(7, Math.min(22, (isl.radius || 200) * scale * 1.2));

    // Render Distinct Vector Emblem per Faction / Clan
    if (isl.isHomePort) {
      drawMapAnchorIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.isShopIsland) {
      drawMapScalesIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.isUninhabited) {
      drawMapUninhabitedIsletIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.isConquered) {
      drawMapConqueredFlagIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.clan === 'blood' || isl.isFlesh) {
      drawMapBloodClanIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.clan === 'mist') {
      drawMapMistClanIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.clan === 'iron') {
      drawMapIronClanIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.clan === 'viking') {
      drawMapVikingClanIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.clan === 'wokou') {
      drawMapWokouClanIcon(mctx, mapX, mapY, dotRadius);
    } else {
      drawMapGoldClanIcon(mctx, mapX, mapY, dotRadius);
    }

    // Island Name (dynamically scaled font)
    const fontPx = Math.max(7, Math.min(11, 7.5 * Math.sqrt(seaMapState.zoom || 1.0)));
    mctx.font = `bold ${fontPx}px "Cinzel", sans-serif`;
    mctx.fillStyle = isl.isUninhabited ? '#94a3b8' : '#f8fafc';
    mctx.textAlign = 'center';
    mctx.fillText(isl.name, mapX, mapY - dotRadius - 3);

    // Conquered Tag
    if (isl.isConquered && !isl.isHomePort && !isl.isUninhabited) {
      mctx.font = `bold ${Math.max(6, fontPx - 1)}px "Cinzel", sans-serif`;
      mctx.fillStyle = '#facc15';
      mctx.fillText("Takluk", mapX, mapY + dotRadius + 8);
    }
  });

  // 4.5 Animated Focus Reticle around Selected Island (Island Intelligence)
  if (seaMapState.selectedIsland) {
    const sIsl = seaMapState.selectedIsland;
    const sMapX = cx + sIsl.x * scale;
    const sMapY = cy + sIsl.y * scale;
    if (sMapX >= -50 && sMapX <= w + 50 && sMapY >= -50 && sMapY <= h + 50) {
      const sRad = Math.max(16, (sIsl.radius || 200) * scale + 12);
      mctx.save();
      mctx.translate(sMapX, sMapY);
      const angleRot = (Date.now() * 0.001) % (Math.PI * 2);
      mctx.rotate(angleRot);

      // Outer dashed glowing ring
      mctx.strokeStyle = '#f59e0b';
      mctx.lineWidth = 1.6;
      mctx.setLineDash([8, 6]);
      mctx.beginPath();
      mctx.arc(0, 0, sRad, 0, Math.PI * 2);
      mctx.stroke();

      // 4 Precision Corner Brackets
      mctx.setLineDash([]);
      mctx.strokeStyle = '#fef08a';
      mctx.lineWidth = 2.0;
      for (let b = 0; b < 4; b++) {
        mctx.rotate(Math.PI / 2);
        mctx.beginPath();
        mctx.moveTo(sRad - 7, -sRad - 3);
        mctx.lineTo(sRad + 3, -sRad - 3);
        mctx.lineTo(sRad + 3, -sRad + 7);
        mctx.stroke();
      }
      mctx.restore();
    }
  }

  // 5. Merchant Ships (if Map Level >= 3)
  if (curLevel >= 3 && entities.merchants) {
    entities.merchants.forEach(m => {
      const mx = cx + m.x * scale;
      const my = cy + m.y * scale;
      if (mx >= -20 && mx <= w + 20 && my >= -20 && my <= h + 20) {
        drawMapMerchantShipIcon(mctx, mx, my, m.angle || 0);
      }
    });
  }

  // 5.5 Hostile Enemy Vessels, Patrols & Sea Monsters on Map
  if (entities.enemies && entities.enemies.length > 0) {
    entities.enemies.forEach(e => {
      const ex = cx + e.x * scale;
      const ey = cy + e.y * scale;
      if (ex < -25 || ex > w + 25 || ey < -25 || ey > h + 25) return;

      const secKey = `${Math.round(e.x / sectorSize)},${Math.round(e.y / sectorSize)}`;
      const isExplored = Boolean(playerState.exploredSectors && playerState.exploredSectors[secKey]);
      const distToPlayer = Math.hypot(e.x - playerState.x, e.y - playerState.y);
      const isVisibleOnRadar = (curLevel >= 2 && distToPlayer <= (cfg.fogClearanceRadius || 3600) * 1.5)
                            || e.alertState === 'alerted'
                            || isExplored
                            || (typeof devTestingState !== 'undefined' && devTestingState.revealFullMap);

      if (!isVisibleOnRadar) return;

      drawMapEnemyUnitIcon(mctx, ex, ey, e);
    });
  }

  // 6. Player Vessel & Direction Triangle
  const px = cx + playerState.x * scale;
  const py = cy + playerState.y * scale;

  const nowMs = Date.now();
  const ping = (nowMs * 0.003) % 1;
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

  // 6.5 Custom Waypoint Navigation Pin Marker
  if (playerState.waypointPin) {
    const pinMapX = cx + playerState.waypointPin.x * scale;
    const pinMapY = cy + playerState.waypointPin.y * scale;

    // Viewport check (render if on or near screen)
    if (pinMapX >= -60 && pinMapX <= w + 60 && pinMapY >= -60 && pinMapY <= h + 60) {
      mctx.save();

      // Dotted trajectory line connecting Player Ship to Waypoint Pin
      mctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
      mctx.lineWidth = 1.3;
      mctx.setLineDash([5, 4]);
      mctx.beginPath();
      mctx.moveTo(px, py);
      mctx.lineTo(pinMapX, pinMapY);
      mctx.stroke();
      mctx.setLineDash([]);

      // Pulsing beacon ring
      const pinPulse = (nowMs * 0.0035) % 1;
      mctx.strokeStyle = `rgba(244, 63, 94, ${0.85 - pinPulse * 0.75})`;
      mctx.lineWidth = 1.5;
      mctx.beginPath();
      mctx.arc(pinMapX, pinMapY, 5 + pinPulse * 16, 0, Math.PI * 2);
      mctx.stroke();

      // Soft ground shadow
      mctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      mctx.beginPath();
      mctx.ellipse(pinMapX, pinMapY + 1, 4.5, 2.2, 0, 0, Math.PI * 2);
      mctx.fill();

      // Sharp Navigator Pin Shape
      mctx.fillStyle = '#f43f5e';
      mctx.strokeStyle = '#ffffff';
      mctx.lineWidth = 1.2;
      mctx.beginPath();
      mctx.moveTo(pinMapX, pinMapY);
      mctx.lineTo(pinMapX - 5.5, pinMapY - 14);
      mctx.arc(pinMapX, pinMapY - 14, 5.5, Math.PI, 0, false);
      mctx.lineTo(pinMapX, pinMapY);
      mctx.closePath();
      mctx.fill();
      mctx.stroke();

      // Center golden pip
      mctx.fillStyle = '#fde047';
      mctx.beginPath();
      mctx.arc(pinMapX, pinMapY - 14, 2.2, 0, Math.PI * 2);
      mctx.fill();

      // Distance tag
      const distToPin = Math.hypot(playerState.waypointPin.x - playerState.x, playerState.waypointPin.y - playerState.y);
      mctx.font = 'bold 8.5px "Plus Jakarta Sans", sans-serif';
      mctx.fillStyle = '#fecdd3';
      mctx.textAlign = 'center';
      mctx.fillText(`PIN (${Math.round(distToPin)}m)`, pinMapX, pinMapY - 21);

      mctx.restore();
    }
  }

  // 6.6 Player Death Shipwreck Marker & Countdown Timer (9 Minutes)
  if (playerState.playerDeathWreck) {
    const dw = playerState.playerDeathWreck;
    const timeLeftMs = (dw.expiresAt || 0) - Date.now();
    if (timeLeftMs > 0) {
      const dwMapX = cx + dw.x * scale;
      const dwMapY = cy + dw.y * scale;

      if (dwMapX >= -80 && dwMapX <= w + 80 && dwMapY >= -80 && dwMapY <= h + 80) {
        mctx.save();

        // Pulsing crimson distress ring
        const dwPulse = (nowMs * 0.003) % 1;
        mctx.strokeStyle = `rgba(239, 68, 68, ${0.9 - dwPulse * 0.8})`;
        mctx.lineWidth = 1.8;
        mctx.beginPath();
        mctx.arc(dwMapX, dwMapY, 8 + dwPulse * 24, 0, Math.PI * 2);
        mctx.stroke();

        // Dotted trajectory line connecting Player Ship to Sunken Wreck
        mctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        mctx.lineWidth = 1.2;
        mctx.setLineDash([4, 4]);
        mctx.beginPath();
        mctx.moveTo(px, py);
        mctx.lineTo(dwMapX, dwMapY);
        mctx.stroke();
        mctx.setLineDash([]);

        // Procedural Broken Keel Shipwreck Icon
        drawMapShipwreckIcon(mctx, dwMapX, dwMapY, 11);

        // Format Countdown MM:SS
        const totalSec = Math.floor(timeLeftMs / 1000);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
        const wreckLabel = isEn ? `SUNKEN SHIP (${timeStr})` : `KAPAL KARAM ANDA (${timeStr})`;

        // Text Badge
        mctx.font = 'bold 8.5px "Cinzel", sans-serif';
        mctx.fillStyle = '#ef4444';
        mctx.textAlign = 'center';
        mctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        mctx.shadowBlur = 4;
        mctx.fillText(wreckLabel, dwMapX, dwMapY - 17);

        mctx.restore();
      }
    }
  }

  // 7. Decorative Compass Rose (Stationary HUD in top right)
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

  // 8. Nautical Targeting Reticle for Gamepad Navigation
  const isGamepadActive = typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad');
  if (isGamepadActive) {
    const midX = w / 2;
    const midY = h / 2;
    
    // Check if hovering near an island
    let targetIsland = null;
    const sectorSize = (typeof FOG_SECTOR_SIZE !== 'undefined') ? FOG_SECTOR_SIZE : 1200;
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      const isl = WORLD_ISLANDS[i];
      const secKey = `${Math.round(isl.x / sectorSize)},${Math.round(isl.y / sectorSize)}`;
      const isExplored = (playerState.exploredSectors && playerState.exploredSectors[secKey]) || isl.isHomePort;
      const isRevealedByLevel = cfg.showTiers && cfg.showTiers.includes(isl.tier);
      if (!isExplored && !isRevealedByLevel && !isl.isShopIsland && !isl.isHomePort) continue;

      const islScreenX = cx + isl.x * scale;
      const islScreenY = cy + isl.y * scale;
      const dist = Math.hypot(midX - islScreenX, midY - islScreenY);
      const islHitRadius = Math.max(22, (isl.radius || 200) * scale + 10);
      if (dist <= islHitRadius) {
        targetIsland = isl;
        break;
      }
    }

    const reticleColor = targetIsland ? '#10b981' : '#f59e0b';
    const reticleRingR = 14;

    mctx.save();
    // Subtle outer halo
    mctx.beginPath();
    mctx.arc(midX, midY, reticleRingR + 4, 0, Math.PI * 2);
    mctx.fillStyle = targetIsland ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)';
    mctx.fill();

    // Crosshair circle
    mctx.beginPath();
    mctx.arc(midX, midY, reticleRingR, 0, Math.PI * 2);
    mctx.strokeStyle = reticleColor;
    mctx.lineWidth = 1.5;
    mctx.stroke();

    // Crosshair ticks
    mctx.beginPath();
    // Top
    mctx.moveTo(midX, midY - reticleRingR - 6);
    mctx.lineTo(midX, midY - reticleRingR + 2);
    // Bottom
    mctx.moveTo(midX, midY + reticleRingR - 2);
    mctx.lineTo(midX, midY + reticleRingR + 6);
    // Left
    mctx.moveTo(midX - reticleRingR - 6, midY);
    mctx.lineTo(midX - reticleRingR + 2, midY);
    // Right
    mctx.moveTo(midX + reticleRingR - 2, midY);
    mctx.lineTo(midX + reticleRingR + 6, midY);
    mctx.stroke();

    // Center pip
    mctx.beginPath();
    mctx.arc(midX, midY, 2, 0, Math.PI * 2);
    mctx.fillStyle = '#ffffff';
    mctx.fill();

    // Label below reticle
    const reticleWorldX = Math.round((midX - cx) / scale);
    const reticleWorldY = Math.round((midY - cy) / scale);
    mctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    mctx.textAlign = 'center';
    if (targetIsland) {
      mctx.fillStyle = '#6ee7b7';
      mctx.fillText(targetIsland.name, midX, midY + reticleRingR + 15);
      mctx.font = '8px monospace';
      mctx.fillStyle = '#a7f3d0';
      mctx.fillText('[A] Pilih & Waypoint', midX, midY + reticleRingR + 25);
    } else {
      const distFromPlayer = Math.round(Math.hypot(reticleWorldX - playerState.x, reticleWorldY - playerState.y));
      mctx.fillStyle = '#fde68a';
      mctx.fillText(`(${reticleWorldX}, ${reticleWorldY}) • ${distFromPlayer}m`, midX, midY + reticleRingR + 15);
      mctx.font = '8px monospace';
      mctx.fillStyle = '#cbd5e1';
      mctx.fillText('[A] Pasang Pin', midX, midY + reticleRingR + 25);
    }
    mctx.restore();
  }

  mctx.restore();
}

function startMapAnimationLoop() {
  if (mapAnimationId) cancelAnimationFrame(mapAnimationId);
  function loop() {
    if (!seaMapModal || !seaMapModal.classList.contains('modal-active')) {
      mapAnimationId = null;
      return;
    }
    renderSeaMapCanvas();
    mapAnimationId = requestAnimationFrame(loop);
  }
  mapAnimationId = requestAnimationFrame(loop);
}

function stopMapAnimationLoop() {
  if (mapAnimationId) {
    cancelAnimationFrame(mapAnimationId);
    mapAnimationId = null;
  }
}

function openMapModal() {
  sound.init();
  if (typeof sound !== 'undefined' && typeof sound.playMapToggle === 'function') {
    sound.playMapToggle();
  }
  closeUpgradeModal();
  closeLoreModal();
  closeHelpModal();
  renderSeaMapUI();
  centerMapOnPlayer();
  updateMapZoomBadge();
  if (seaMapModal) {
    seaMapModal.classList.remove('modal-enter', 'hidden');
    seaMapModal.classList.add('modal-active');
  }
  isGamePaused = true;
  startMapAnimationLoop();
}

function closeMapModal() {
  stopMapAnimationLoop();
  closeIslandIntel();
  if (!seaMapModal) return;
  if (typeof sound !== 'undefined' && typeof sound.playMapToggle === 'function') {
    sound.playMapToggle();
  }
  seaMapModal.classList.remove('modal-active');
  seaMapModal.classList.add('modal-enter', 'hidden');
  if (pauseReturnTarget === 'pause') {
    pauseReturnTarget = null;
    openPauseModal();
    return;
  }
  if (isGameStarted) {
    isGamePaused = false;
    lastTime = performance.now();
  }
}

function toggleMapModal() {
  if (seaMapModal && seaMapModal.classList.contains('modal-active')) {
    closeMapModal();
  } else {
    openMapModal();
  }
}

function upgradeMap() {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  const curLevel = playerState.mapLevel || 1;
  const nextCfg = (typeof MAP_UPGRADE_CONFIG !== 'undefined') ? MAP_UPGRADE_CONFIG[curLevel + 1] : null;
  if (!nextCfg) {
    showToast(isEn ? "Ocean chart has reached maximum cartographic level!" : "Peta samudra telah mencapai tingkat kartografi tertinggi!", "compass");
    return;
  }
  if (playerState.gold >= nextCfg.cost) {
    playerState.gold -= nextCfg.cost;
    playerState.mapLevel = nextCfg.level;
    sound.playCoin();
    sound.playLoot();
    const mapName = (isEn && nextCfg.nameEn) ? nextCfg.nameEn : nextCfg.name;
    showToast(isEn ? `Ocean chart upgraded to ${mapName}!` : `Peta Samudra ditingkatkan ke ${nextCfg.name}!`, "compass");
    saveGame();
    updateHUD();
    renderSeaMapUI();
  } else {
    showToast(isEn ? `Insufficient gold to upgrade chart (Need ${nextCfg.cost} Coins).` : `Emas tidak cukup untuk peningkatan peta (Butuh ${nextCfg.cost} Koin).`, "alert");
  }
}

/* ==========================================================================
   INTERACTIVE SEA MAP EVENT HANDLERS (Pinch-to-zoom, Pan, Mouse Drag & Wheel)
   ========================================================================== */

function initSeaMapInteractions() {
  if (!seaMapCanvas) return;

  // 1. Mouse Drag Pan & Click-to-Pin
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;
  let hasMouseMoved = false;

  seaMapCanvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isMouseDown = true;
    hasMouseMoved = false;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    seaMapState.lastPanX = seaMapState.panX;
    seaMapState.lastPanY = seaMapState.panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    if (Math.hypot(e.clientX - mouseStartX, e.clientY - mouseStartY) > 5) {
      hasMouseMoved = true;
    }
    seaMapState.panX = seaMapState.lastPanX + (e.clientX - mouseStartX);
    seaMapState.panY = seaMapState.lastPanY + (e.clientY - mouseStartY);
  });

  window.addEventListener('mouseup', (e) => {
    if (isMouseDown) {
      isMouseDown = false;
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
      if (!hasMouseMoved) {
        handleMapPinClick(e.clientX, e.clientY);
      }
    }
  });

  // 2. Mouse Wheel Zoom (Anchored to Cursor Position)
  seaMapCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (!seaMapCanvas) return;
    const rect = seaMapCanvas.getBoundingClientRect();
    const w = rect.width || 540;
    const h = rect.height || 400;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const baseScale = getMapBaseScale(w, h);
    const oldZoom = seaMapState.zoom;
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(seaMapState.minZoom, Math.min(seaMapState.maxZoom, oldZoom * factor));
    if (newZoom === oldZoom) return;

    const oldScale = baseScale * oldZoom;
    const newScale = baseScale * newZoom;

    // Convert mouse position to world coordinates
    const worldX = (mx - (w / 2 + seaMapState.panX)) / oldScale;
    const worldY = (my - (h / 2 + seaMapState.panY)) / oldScale;

    seaMapState.zoom = newZoom;
    seaMapState.panX = mx - w / 2 - worldX * newScale;
    seaMapState.panY = my - h / 2 - worldY * newScale;
    seaMapState.lastPanX = seaMapState.panX;
    seaMapState.lastPanY = seaMapState.panY;

    updateMapZoomBadge();
  }, { passive: false });

  // 3. Touch Drag (1 Finger), Pinch-to-Zoom (2 Fingers), & Tap-to-Pin
  let touchStartX = 0;
  let touchStartY = 0;
  let hasTouchMoved = false;

  seaMapCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      seaMapState.isDragging = true;
      seaMapState.isPinching = false;
      hasTouchMoved = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      seaMapState.dragStartX = e.touches[0].clientX;
      seaMapState.dragStartY = e.touches[0].clientY;
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
    } else if (e.touches.length >= 2) {
      hasTouchMoved = true;
      seaMapState.isPinching = true;
      seaMapState.isDragging = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      seaMapState.initialPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      seaMapState.initialPinchZoom = seaMapState.zoom;

      const rect = seaMapCanvas.getBoundingClientRect();
      const w = rect.width || 540;
      const h = rect.height || 400;
      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
      const baseScale = getMapBaseScale(w, h);
      const currentScale = baseScale * seaMapState.zoom;

      seaMapState.pinchMidX = midX;
      seaMapState.pinchMidY = midY;
      seaMapState.pinchWorldX = (midX - (w / 2 + seaMapState.panX)) / currentScale;
      seaMapState.pinchWorldY = (midY - (h / 2 + seaMapState.panY)) / currentScale;
    }
  }, { passive: false });

  seaMapCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (seaMapState.isPinching && e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (seaMapState.initialPinchDist > 5) {
        const factor = currentDist / seaMapState.initialPinchDist;
        const newZoom = Math.max(seaMapState.minZoom, Math.min(seaMapState.maxZoom, seaMapState.initialPinchZoom * factor));

        const rect = seaMapCanvas.getBoundingClientRect();
        const w = rect.width || 540;
        const h = rect.height || 400;
        const baseScale = getMapBaseScale(w, h);
        const newScale = baseScale * newZoom;

        const curMidX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const curMidY = (t1.clientY + t2.clientY) / 2 - rect.top;

        seaMapState.zoom = newZoom;
        seaMapState.panX = curMidX - w / 2 - seaMapState.pinchWorldX * newScale;
        seaMapState.panY = curMidY - h / 2 - seaMapState.pinchWorldY * newScale;
        seaMapState.lastPanX = seaMapState.panX;
        seaMapState.lastPanY = seaMapState.panY;

        updateMapZoomBadge();
      }
    } else if (seaMapState.isDragging && e.touches.length === 1) {
      const curX = e.touches[0].clientX;
      const curY = e.touches[0].clientY;
      if (Math.hypot(curX - touchStartX, curY - touchStartY) > 8) {
        hasTouchMoved = true;
      }
      seaMapState.panX = seaMapState.lastPanX + (curX - seaMapState.dragStartX);
      seaMapState.panY = seaMapState.lastPanY + (curY - seaMapState.dragStartY);
    }
  }, { passive: false });

  const endTouch = (e) => {
    if (e.touches.length === 0) {
      const wasPinching = seaMapState.isPinching;
      seaMapState.isDragging = false;
      seaMapState.isPinching = false;
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
      if (!hasTouchMoved && !wasPinching) {
        handleMapPinClick(touchStartX, touchStartY);
      }
    } else if (e.touches.length === 1) {
      seaMapState.isPinching = false;
      seaMapState.isDragging = true;
      hasTouchMoved = true;
      seaMapState.dragStartX = e.touches[0].clientX;
      seaMapState.dragStartY = e.touches[0].clientY;
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
    }
  };

  seaMapCanvas.addEventListener('touchend', endTouch, { passive: true });
  seaMapCanvas.addEventListener('touchcancel', endTouch, { passive: true });

  // 4. Floating Map Navigation Button Listeners
  if (btnMapZoomIn) btnMapZoomIn.addEventListener('click', (e) => { e.stopPropagation(); zoomMapStep(1.25); });
  if (btnMapZoomOut) btnMapZoomOut.addEventListener('click', (e) => { e.stopPropagation(); zoomMapStep(0.8); });
  if (btnMapCenterShip) btnMapCenterShip.addEventListener('click', (e) => { e.stopPropagation(); centerMapOnPlayer(); });
  if (btnMapResetView) btnMapResetView.addEventListener('click', (e) => { e.stopPropagation(); resetMapView(); });
  if (btnMapClearPin) {
    btnMapClearPin.addEventListener('click', (e) => {
      e.stopPropagation();
      playerState.waypointPin = null;
      updateMapPinButton();
      showToast("Pin navigasi dihapus", "compass");
      if (typeof sound !== 'undefined' && typeof sound.playClick === 'function') {
        sound.playClick();
      }
      renderSeaMapCanvas();
    });
  }

  // 5. Island Intelligence Drawer Listeners
  if (btnCloseIslandIntel) {
    btnCloseIslandIntel.addEventListener('click', (e) => {
      e.stopPropagation();
      closeIslandIntel();
      renderSeaMapCanvas();
    });
  }

  if (btnSetWaypointToIsland) {
    btnSetWaypointToIsland.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!seaMapState.selectedIsland) return;
      const isl = seaMapState.selectedIsland;
      playerState.waypointPin = { x: isl.x, y: isl.y };
      updateMapPinButton();
      renderSeaMapUI();
      const dist = Math.hypot(isl.x - playerState.x, isl.y - playerState.y);
      showToast(`Waypoint ditetapkan ke ${isl.name}! Jarak: ${Math.round(dist)}m`, "compass");
      if (typeof sound !== 'undefined' && typeof sound.playLoot === 'function') {
        sound.playLoot();
      }
      renderSeaMapCanvas();
    });
  }

  if (btnCenterIslandOnMap) {
    btnCenterIslandOnMap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!seaMapState.selectedIsland || !seaMapCanvas) return;
      const isl = seaMapState.selectedIsland;
      const rect = seaMapCanvas.getBoundingClientRect();
      const w = rect.width || 540;
      const h = rect.height || 400;
      const baseScale = getMapBaseScale(w, h);
      const scale = baseScale * seaMapState.zoom;
      seaMapState.panX = -isl.x * scale;
      seaMapState.panY = -isl.y * scale;
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
      renderSeaMapCanvas();
      if (typeof sound !== 'undefined' && typeof sound.playClick === 'function') {
        sound.playClick();
      }
    });
  }
}

// Attach Map Modal Controls
if (btnOpenMap) btnOpenMap.addEventListener('click', openMapModal);
if (btnCloseSeaMap) btnCloseSeaMap.addEventListener('click', closeMapModal);
if (btnUpgradeMap) btnUpgradeMap.addEventListener('click', upgradeMap);
if (seaMapModal) {
  seaMapModal.addEventListener('click', (e) => {
    if (e.target === seaMapModal) closeMapModal();
  });
}

// Initialize Interactive Sea Map Listeners
initSeaMapInteractions();

// Primary Survival Repair using collected wood & rope at port
function repairShipWithResources() {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (!playerState.isDockedAtPort) {
    showToast(isEn ? "Hull repairs can only be conducted while moored at port/dock!" : "Reparasi lambung hanya dapat dilakukan saat berlabuh di pelabuhan/dermaga!", "alert");
    return;
  }
  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  if (playerState.hp >= maxHp) {
    showToast(isEn ? "Ship hull is already in pristine 100% condition!" : "Lambung kapal sudah dalam kondisi prima 100%!", "check");
    return;
  }
  const curWood = (playerState.resources && playerState.resources.wood) || 0;
  const curRope = (playerState.resources && playerState.resources.rope) || 0;
  if (curWood >= 6 && curRope >= 3) {
    playerState.resources.wood -= 6;
    playerState.resources.rope -= 3;
    playerState.hp = maxHp;
    if (typeof sound !== 'undefined' && typeof sound.playRepair === 'function') {
      sound.playRepair();
    } else {
      sound.playSplash();
    }
    showToast(isEn ? "Hull repaired using 6 Wood & 3 Rope!" : "Lambung diperbaiki menggunakan 6 Kayu & 3 Tali!", "anchor");
    updateHUD();
    updateShipyardRepairButton();
    saveGame();
  } else {
    showToast(isEn ? `Insufficient materials! Need 6 Wood & 3 Rope (You have: ${curWood} Wood, ${curRope} Rope).` : `Bahan baku tidak cukup! Butuh 6 Kayu & 3 Tali (Miliki: ${curWood} Kayu, ${curRope} Tali).`, "alert");
  }
}

// Secondary Gold Service Repair at dockyard
function repairShipWithGold() {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (!playerState.isDockedAtPort) {
    showToast(isEn ? "Shipyard services are only available at harbor docks!" : "Jasa galangan kapal hanya tersedia di dermaga pelabuhan!", "alert");
    return;
  }
  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  if (playerState.hp >= maxHp) {
    showToast(isEn ? "Ship hull is already in pristine 100% condition!" : "Lambung kapal sudah dalam kondisi prima 100%!", "check");
    return;
  }
  if ((playerState.gold || 0) >= 85) {
    playerState.gold -= 85;
    playerState.hp = maxHp;
    if (typeof sound !== 'undefined' && typeof sound.playRepair === 'function') {
      sound.playRepair();
    } else {
      sound.playSplash();
    }
    showToast(isEn ? "Shipyard services repaired the vessel! (-85 Coins)" : "Jasa galangan telah memperbaiki kapal! (-85 Koin)", "anchor");
    updateHUD();
    updateShipyardRepairButton();
    saveGame();
  } else {
    showToast(isEn ? "Insufficient Gold Coins for shipyard service (Need 85 Coins)." : "Koin emas tidak mencukupi untuk jasa galangan (Butuh 85 Koin).", "alert");
  }
}

// Quick Repair Ship (Shared by button & keyboard hotkey [R])
// Strictly requires docking at port; prioritizes resource repair with gold fallback.
function quickRepairShip() {
  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
  if (!playerState.isDockedAtPort) {
    showToast(isEn ? "Ship repairs can only be conducted while moored at port/dock!" : "Perbaikan kapal hanya dapat dilakukan saat berlabuh di pelabuhan/dermaga!", "alert");
    return;
  }
  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  if (playerState.hp >= maxHp) {
    showToast(isEn ? "Ship hull is already in pristine 100% condition!" : "Lambung kapal dalam kondisi prima 100%!", "check");
    return;
  }
  const curWood = (playerState.resources && playerState.resources.wood) || 0;
  const curRope = (playerState.resources && playerState.resources.rope) || 0;
  if (curWood >= 6 && curRope >= 3) {
    repairShipWithResources();
  } else if ((playerState.gold || 0) >= 85) {
    repairShipWithGold();
  } else {
    showToast(isEn ? "Insufficient resources! Need 6 Wood + 3 Rope, or 85 Gold Coins." : "Sumber daya tidak cukup! Butuh 6 Kayu + 3 Tali, atau 85 Koin Emas.", "alert");
  }
}

const btnRepairShipResource = document.getElementById('btnRepairShipResource');
const btnRepairShipGold = document.getElementById('btnRepairShipGold');
if (btnRepairShipResource) btnRepairShipResource.addEventListener('click', repairShipWithResources);
if (btnRepairShipGold) btnRepairShipGold.addEventListener('click', repairShipWithGold);
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
    id: 'medium', name: 'Normal (Medium)', badge: 'NORMAL', badgeEn: 'NORMAL',
    badgeColor: 'text-amber-300 bg-amber-950 border-amber-500/40',
    desc: 'Keseimbangan standar ekspedisi Laut Darah saat ini.',
    descEn: 'Standard balanced Blood Sea expedition experience.'
  };

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  const badgeText = (isEn && cfg.badgeEn) ? cfg.badgeEn : cfg.badge;
  const descText = (isEn && cfg.descEn) ? cfg.descEn : cfg.desc;

  // 1. Settings Modal Badge & Description
  if (labelDifficultyBadge) {
    labelDifficultyBadge.innerText = badgeText;
    labelDifficultyBadge.className = `text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-cinzel ${cfg.badgeColor}`;
  }
  if (labelDifficultyDesc) {
    labelDifficultyDesc.innerText = descText;
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
    mainMenuDiffText.innerText = badgeText;
    btnMainMenuDiffCycle.className = `font-cinzel font-black text-[11px] px-2.5 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${cfg.badgeColor}`;
  }

  // 4. Pause Menu Badge
  if (pauseDiffBadge) {
    pauseDiffBadge.innerText = badgeText;
    pauseDiffBadge.className = `text-[10px] font-bold font-cinzel px-2 py-0.5 rounded-lg border ${cfg.badgeColor}`;
  }
}

// Language Switching Engine
function setGameLanguage(lang) {
  if (lang !== 'id' && lang !== 'en') lang = 'id';
  currentLanguage = lang;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    console.warn("Could not save language to localStorage:", e);
  }
  updateLanguageButtonsUI();
  applyTranslations();
}

function updateLanguageButtonsUI() {
  const btnId = document.getElementById('btnLangId');
  const btnEn = document.getElementById('btnLangEn');
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  if (btnId) {
    btnId.className = !isEn
      ? "py-2 px-2 rounded-xl text-xs font-cinzel font-bold border transition cursor-pointer text-center flex items-center justify-center gap-1.5 border-amber-500/80 bg-amber-500/20 text-amber-300 shadow-md"
      : "py-2 px-2 rounded-xl text-xs font-cinzel font-bold border transition cursor-pointer text-center flex items-center justify-center gap-1.5 border-white/10 bg-slate-800/80 text-slate-300 hover:bg-slate-700";
  }
  if (btnEn) {
    btnEn.className = isEn
      ? "py-2 px-2 rounded-xl text-xs font-cinzel font-bold border transition cursor-pointer text-center flex items-center justify-center gap-1.5 border-amber-500/80 bg-amber-500/20 text-amber-300 shadow-md"
      : "py-2 px-2 rounded-xl text-xs font-cinzel font-bold border transition cursor-pointer text-center flex items-center justify-center gap-1.5 border-white/10 bg-slate-800/80 text-slate-300 hover:bg-slate-700";
  }
  const labelCurrentLang = document.getElementById('labelCurrentLang');
  if (labelCurrentLang) {
    labelCurrentLang.innerText = isEn ? 'EN' : 'ID';
  }
}

function applyTranslations() {
  const setTxt = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };

  // Main Menu
  setTxt('mainMenuDiffLabel', t('diffLabel'));
  setTxt('mainMenuPlayText', t('playBtnText'));
  setTxt('mainMenuPlaySub', t('playBtnSub'));
  setTxt('mainMenuCodexText', t('codexBtnText'));
  setTxt('mainMenuCodexTag', t('codexBtnTag'));
  setTxt('mainMenuSettingsText', t('settingsBtnText'));
  setTxt('mainMenuSettingsTag', t('settingsBtnTag'));
  setTxt('mainMenuControlsText', t('controlsBtnText'));
  setTxt('mainMenuControlsTag', t('controlsBtnTag'));

  // Save Slots Modal
  setTxt('saveSlotsModalTitle', t('saveSlotsTitle'));
  setTxt('saveSlotsModalSubtitle', t('saveSlotsSubtitle'));
  setTxt('btnCancelDeleteSlot', t('cancel'));
  setTxt('btnConfirmDeleteSlot', t('deleteConfirm'));

  // Pause Modal
  setTxt('pauseTitle', t('pauseTitle'));
  setTxt('pauseSubtitle', t('pauseSubtitle'));
  setTxt('pauseShipHeader', t('pauseFleetStatus'));
  setTxt('pauseHullHeader', t('pauseHullIntegrity'));
  setTxt('pauseCargoHeader', t('pauseCargoCapacity'));
  setTxt('pauseWorldGenHeader', t('pauseWorldGen'));
  setTxt('pauseResumeText', t('pauseResume'));
  setTxt('pauseInvText', t('pauseInventory'));
  setTxt('pauseMapText', t('pauseMap'));
  setTxt('pauseCodexText', t('pauseCodex'));
  setTxt('pauseSettingsText', t('pauseSettings'));
  setTxt('pauseHelpText', t('pauseControls'));
  setTxt('pauseRestartText', t('pauseRestart'));
  setTxt('pauseReturnMainText', t('pauseReturnMenu'));

  // Settings Modal
  setTxt('settingsModalTitle', t('settingsTitle'));
  setTxt('settingsModalSubtitle', t('settingsSubtitle'));
  setTxt('tabSettingsAudio', t('tabAudio'));
  setTxt('tabSettingsGraphics', t('tabGraphics'));
  setTxt('tabSettingsGameplay', t('tabGameplay'));

  setTxt('labelMasterVolTitle', t('masterVol'));
  setTxt('labelSfxVolTitle', t('sfxVol'));
  setTxt('labelAmbienceVolTitle', t('seaAmbienceVol'));
  setTxt('labelAmbienceVolDesc', t('seaAmbienceDesc'));
  setTxt('labelBattleVolTitle', t('battleMusicVol'));
  setTxt('labelMuteAllTitle', t('muteAll'));
  setTxt('labelMuteAllDesc', t('muteAllDesc'));

  setTxt('labelGraphicsPresetTitle', t('graphicsPreset'));
  setTxt('labelGraphicsPresetSub', t('graphicsBuffer'));
  setTxt('btnQualityHighTitle', t('qualityHigh'));
  setTxt('btnQualityHighDesc', t('qualityHighDesc'));
  setTxt('btnQualityMedTitle', t('qualityMed'));
  setTxt('btnQualityMedDesc', t('qualityMedDesc'));
  setTxt('btnQualityLowTitle', t('qualityLow'));
  setTxt('btnQualityLowDesc', t('qualityLowDesc'));

  setTxt('labelFullscreenTitle', t('fullscreenMode'));
  setTxt('labelFullscreenDesc', t('fullscreenDesc'));
  setTxt('labelAutoFullscreenTitle', t('autoFullscreen'));
  setTxt('labelAutoFullscreenDesc', t('autoFullscreenDesc'));
  setTxt('labelScreenShakeTitle', t('screenShake'));
  setTxt('labelScreenShakeDesc', t('screenShakeDesc'));

  setTxt('labelSettingsLangTitle', t('languageTitle'));
  setTxt('labelSettingsLangDesc', t('languageDesc'));
  setTxt('labelDifficultyTitle', t('difficultyTitle'));
  setTxt('btnDiffEasyText', t('diffEasy'));
  setTxt('btnDiffMediumText', t('diffMedium'));
  setTxt('btnDiffHardText', t('diffHard'));
  setTxt('labelControlsTitle', t('controlsGuideTitle'));
  setTxt('labelControlsDesc', t('controlsGuideDesc'));
  setTxt('btnOpenControlsFromSettingsText', t('btnOpenGuide'));
  setTxt('btnCloseSettingsBottom', t('cancel'));
  setTxt('btnSaveSettings', t('saveAndReturn'));

  // Help & Lore
  setTxt('loreTitle', t('loreModalTitle'));
  setTxt('loreSubtitle', t('loreModalSubtitle'));
  setTxt('helpTitle', t('helpModalTitle'));
  setTxt('helpSubtitle', t('helpModalSubtitle'));
  setTxt('helpCloseEsc', t('helpCloseEsc'));

  // Game Over
  setTxt('gameOverTitle', t('gameOverTitle'));
  setTxt('gameOverReason', t('gameOverReason'));
  setTxt('gameOverPermaText', t('gameOverPermaText'));
  setTxt('statDistLabel', t('statMaxDist'));
  setTxt('statKillsLabel', t('statKills'));
  setTxt('statSalvagesLabel', t('statSalvages'));
  setTxt('btnRespawnText', t('respawnBtn'));

  const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';

  // In-Game Top HUD & Hotbars
  setTxt('hudCargoLabel', isEn ? 'CARGO' : 'KARGO');
  setTxt('btnOpenMapText', isEn ? 'MAP' : 'PETA');
  setTxt('btnOpenInventoryText', isEn ? 'CARGO' : 'TAS');
  setTxt('pcHullStatusLabel', isEn ? 'Hull Intact' : 'Lambung Kokoh');
  setTxt('pcSteerLabel', isEn ? 'Steer' : 'Kemudi');
  setTxt('pcBoostLabel', isEn ? 'Full Sail' : 'Laju Cepat');
  setTxt('pcStealthLabel', isEn ? 'Stealth' : 'Siluman');
  setTxt('pcSpeedTextLabel', isEn ? 'SPEED:' : 'LAJU:');
  setTxt('hotbarSalvoLabel', 'SALVO');
  setTxt('hotbarMineLabel', isEn ? 'STERN' : 'BURITAN');
  setTxt('hotbarSalvageLabel', isEn ? 'WINCH' : 'KATROL');
  setTxt('hotbarSpyglassLabel', isEn ? 'SPYGLASS' : 'TEROPONG');
  setTxt('hotbarRepairLabel', isEn ? 'REPAIR' : 'REPARASI');
  setTxt('mobileSalvoLabel', 'SALVO');
  setTxt('mobileRepairLabel', 'REPAIR');
  setTxt('salvageContainerText', isEn ? 'Salvaging Wreck...' : 'Menyelam Bangkai...');
  setTxt('dockShopTitle', isEn ? 'SHIPYARD' : 'GALANGAN KAPAL');
  setTxt('dockShopSubtitle', isEn ? 'Moored at Harbor' : 'Berlabuh di Pelabuhan');

  // Shipyard Modal
  setTxt('shipyardModalTitle', isEn ? 'SHIPYARD' : 'GALANGAN KAPAL');
  setTxt('shipyardGoldUnitText', isEn ? 'COINS' : 'KOIN');
  setTxt('shipyardBloodUnitText', isEn ? 'BLOOD' : 'DARAH');
  setTxt('shipyardReturnText', isEn ? 'RETURN TO SEA' : 'KEMBALI KE LAUT');
  setTxt('blueprintTitle', isEn ? 'SHIP CUTAWAY BLUEPRINT' : 'SKEMA POTONGAN KAPAL (FLAGSHIP BLUEPRINT)');

  // Inventory Modal
  setTxt('invModalTitle', isEn ? 'SHIP ARMORY & FOUNDRY' : 'ARSENAL KAPAL & BENGKEL TEMPA');
  setTxt('invModalSubtitle', isEn ? '16-Slot Cargo Hold • Ship Artillery Management • Faction Weapon Smelting & Forging' : 'Pundi Kargo 16 Slot • Manajemen Artileri Kapal • Peleburan & Tempa Senjata Faksi');
  setTxt('invRecipeAlmanacBtnText', isEn ? 'RECIPE ALMANAC' : 'ALMANAK RESEP');
  setTxt('invCloseBtnText', isEn ? 'RETURN' : 'KEMBALI');
  setTxt('mobileTabCargoText', isEn ? 'Cargo Hold' : 'Pundi Kargo');
  setTxt('mobileTabArmoryText', isEn ? 'Deck Armory' : 'Armori Geladak');
  setTxt('mobileTabCraftText', isEn ? 'Foundry' : 'Bengkel Tempa');
  setTxt('invCargoSectionTitle', isEn ? 'SHIP CARGO HOLD' : 'RUANG MUATAN KAPAL');
  setTxt('invSlotHeaderLabel', 'Slot:');
  setTxt('invFilterAllText', isEn ? 'All' : 'Semua');
  setTxt('invFilterResText', isEn ? 'Materials' : 'Bahan');
  setTxt('invFilterWeapText', isEn ? 'Weapons' : 'Senjata');
  setTxt('invInspectorHeaderTitle', isEn ? 'ITEM DOSSIER & ACTIONS' : 'DOSSIER & TINDAKAN BENDA');
  setTxt('invArmorySectionTitle', isEn ? 'SHIP ARTILLERY DECK' : 'GELADAK ARTILERI KAPAL');
  setTxt('invArmorySectionSub', isEn ? 'Broadside weapon configuration and fleet firepower' : 'Konfigurasi senjata broadside dan daya hancur armada');
  setTxt('invArmoryGraphicText', isEn ? 'BROADSIDE ARTILLERY DECK' : 'GELADAK ARTILERI SALVO');
  setTxt('invArmorySlotsTitle', isEn ? 'CANNON MOUNT SLOTS (HARDPOINTS)' : 'SLOT DUDUKAN MERIAM (HARDPOINTS)');
  setTxt('invArmoryTapHint', isEn ? 'Tap slot to swap' : 'Ketuk slot untuk ganti');
  setTxt('invForgeSectionTitle', isEn ? 'WEAPONS FOUNDRY' : 'BENGKEL TEMPA SENJATA');
  setTxt('invForgeSectionSub', isEn ? 'Craft legendary cannons and mystical ordnance from sea loot' : 'Rakit meriam legendaris dan amunisi mistis dari jarahan laut');
  setTxt('invCraftFilterAllText', isEn ? 'All' : 'Semua');
  setTxt('invCraftFilterFactionText', isEn ? 'Faction' : 'Faksi');
  setTxt('invCraftFilterOccultText', isEn ? 'Occult/Orb' : 'Mistik/Orb');
  setTxt('invForgeFormulaTip', isEn ? 'Complete blueprint formulas:' : 'Formula lengkap cetak biru:');
  setTxt('invOpenAlmanacBtnText', isEn ? 'Open Almanac' : 'Buka Almanak');
  setTxt('invFooterTip1', isEn ? 'Press I to close inventory' : 'Tekan I untuk menutup inventori');
  setTxt('invFooterTip2', isEn ? 'Forge cannons up to Lv.5 to increase firepower & durability 3x' : 'Tempa meriam hingga Lv.5 untuk meningkatkan daya ledak & durabilitas 3x');
  setTxt('invGoToShipyardText', isEn ? 'Go to Shipyard' : 'Menuju Galangan Kapal');

  // Recipe Almanac Modal
  setTxt('almanacModalTitle', isEn ? 'OCEANIC WEAPON BLUEPRINT ALMANAC' : 'ALMANAK CETAK BIRU SENJATA SAMUDRA');
  setTxt('almanacModalSubtitle', isEn ? 'Complete crafting formulas for faction ordnance & material hunting guide' : 'Formula lengkap pembuatan persenjataan faksi & panduan berburu material');
  setTxt('almanacTipText', isEn ? 'Nautical Tip: Collect Occult Orbs by sinking faction warships in their respective biomes.' : 'Tip Bahari: Kumpulkan Orbs Gaib dengan menenggelamkan kapal perang faksi di bioma masing-masing.');
  setTxt('almanacReturnBtnText', isEn ? 'Return to Inventory' : 'Kembali ke Inventori');

  // Sea Map Modal
  setTxt('mapModalTitle', isEn ? 'OCEANIC CARTOGRAPHY CHART' : 'BAGAN KARTOGRAFI SAMUDRA');
  setTxt('mapFogLabel', isEn ? 'OCEAN FOG:' : 'KABUT SAMUDRA:');
  setTxt('mapReturnBtnText', isEn ? 'RETURN TO SEA' : 'KEMBALI KE LAUT');
  setTxt('mapInstructionPill', isEn ? 'Tap island for intel • Tap ocean to drop pin • Drag & pinch to pan/zoom' : 'Ketuk pulau untuk intelijen • Ketuk laut untuk pin • Geser & cubit untuk peta');
  setTxt('intelShipDistHeader', isEn ? 'SHIP DISTANCE:' : 'JARAK KAPAL:');
  setTxt('intelCoordsHeader', isEn ? 'COORDINATES:' : 'KOORDINAT:');
  setTxt('intelWaypointBtnText', isEn ? 'SET WAYPOINT' : 'TETAPKAN WAYPOINT');
  setTxt('mapLegendPlayerText', isEn ? 'Your Ship' : 'Kapal Anda');
  setTxt('mapLegendPinText', isEn ? 'Nav Pin' : 'Pin Navigasi');
  setTxt('mapLegendHomePortText', isEn ? 'Home Port' : 'Pelabuhan Asal');
  setTxt('mapLegendTradeText', isEn ? 'Free Port' : 'Pasar Niaga');
  setTxt('mapLegendConqueredText', isEn ? 'Conquered' : 'Taklukan');
  setTxt('mapLegendPirateText', isEn ? 'Pirate Lair / Enemy Clan' : 'Sarang Bajak Laut / Klan Musuh');
  setTxt('mapLegendMerchantText', isEn ? 'Merchant' : 'Saudagar');
  setTxt('mapTierHeader', isEn ? 'Cartography Tier:' : 'Tingkat Kartografi:');

  // Refresh difficulty badge & description
  updateDifficultyUI();

  // If save slots modal is currently visible, refresh its cards
  if (saveSlotsModal && !saveSlotsModal.classList.contains('hidden')) {
    renderSaveSlotsUI();
  }

  // Refresh active HUD elements and open modals instantly (only if game has started)
  if (typeof updateHUD === 'function' && typeof isGameStarted !== 'undefined' && isGameStarted) {
    try {
      updateHUD();
    } catch (e) {
      console.warn("HUD update deferred:", e);
    }
  }
  if (typeof updateShipyardRepairButton === 'function') updateShipyardRepairButton();
  if (typeof renderUpgradeUI === 'function' && upgradeModal && !upgradeModal.classList.contains('hidden')) renderUpgradeUI();
  if (typeof renderUpgradeCardsView === 'function' && upgradeModal && !upgradeModal.classList.contains('hidden')) renderUpgradeCardsView();
  if (typeof renderCompartmentChips === 'function' && upgradeModal && !upgradeModal.classList.contains('hidden')) renderCompartmentChips();
  if (typeof renderCompartmentDetail === 'function' && typeof cutawayState !== 'undefined' && cutawayState.selectedKey) renderCompartmentDetail(cutawayState.selectedKey);
  if (typeof renderInventoryUI === 'function' && inventoryModal && !inventoryModal.classList.contains('hidden')) renderInventoryUI();
  if (typeof renderSeaMapUI === 'function' && seaMapModal && !seaMapModal.classList.contains('hidden')) renderSeaMapUI();
  if (typeof renderRecipeBookUI === 'function' && recipeBookModal && !recipeBookModal.classList.contains('hidden')) renderRecipeBookUI();
  if (typeof renderClanCodexUI === 'function' && loreModal && !loreModal.classList.contains('hidden')) renderClanCodexUI();
}

// Settings Modal Management
function openSettingsModal(fromTarget = 'game') {
  sound.init();
  settingsReturnTarget = fromTarget;
  updateDifficultyUI();
  updateQualityUI();
  switchSettingsTab('audio');

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

function switchSettingsTab(tabName) {
  const tabs = {
    audio: { btn: tabSettingsAudio, panel: panelSettingsAudio },
    graphics: { btn: tabSettingsGraphics, panel: panelSettingsGraphics },
    gameplay: { btn: tabSettingsGameplay, panel: panelSettingsGameplay }
  };
  for (const key in tabs) {
    const item = tabs[key];
    if (item.btn) {
      if (key === tabName) {
        item.btn.classList.add('active');
      } else {
        item.btn.classList.remove('active');
      }
    }
    if (item.panel) {
      if (key === tabName) {
        item.panel.classList.remove('hidden');
      } else {
        item.panel.classList.add('hidden');
      }
    }
  }
}

function updateQualityUI() {
  const q = (typeof window.getGraphicsQuality === 'function' ? window.getGraphicsQuality() : localStorage.getItem('BLOOD_SEA_GRAPHICS_QUALITY')) || 'high';
  const chips = [
    { btn: btnQualityHigh, key: 'high' },
    { btn: btnQualityMed, key: 'med' },
    { btn: btnQualityLow, key: 'low' }
  ];
  chips.forEach(c => {
    if (c.btn) {
      if (c.key === q) {
        c.btn.classList.add('active');
      } else {
        c.btn.classList.remove('active');
      }
    }
  });
}

function applyGraphicsQuality(quality) {
  if (typeof window.setGraphicsQuality === 'function') {
    window.setGraphicsQuality(quality);
  } else {
    localStorage.setItem('BLOOD_SEA_GRAPHICS_QUALITY', quality);
  }
  updateQualityUI();
  sound.playCoin();
  const label = quality === 'high' ? 'TINGGI (60 FPS)' : (quality === 'med' ? 'SEIMBANG' : 'HEMAT BATERAI');
  showToast(`Kualitas Grafis Diubah: ${label}`, "gear");
}

if (btnOpenSettings) btnOpenSettings.addEventListener('click', () => openSettingsModal(isGameStarted ? 'game' : 'mainMenu'));
if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettingsModal);
if (btnCloseSettingsBottom) btnCloseSettingsBottom.addEventListener('click', closeSettingsModal);
if (btnSaveSettings) btnSaveSettings.addEventListener('click', () => {
  sound.saveSettings();
  closeSettingsModal();
  showToast(t('toastSettingsSaved'), "check");
});
if (settingsModal) {
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });
}

if (tabSettingsAudio) tabSettingsAudio.addEventListener('click', () => switchSettingsTab('audio'));
if (tabSettingsGraphics) tabSettingsGraphics.addEventListener('click', () => switchSettingsTab('graphics'));
if (tabSettingsGameplay) tabSettingsGameplay.addEventListener('click', () => switchSettingsTab('gameplay'));

if (btnQualityHigh) btnQualityHigh.addEventListener('click', () => applyGraphicsQuality('high'));
if (btnQualityMed) btnQualityMed.addEventListener('click', () => applyGraphicsQuality('med'));
if (btnQualityLow) btnQualityLow.addEventListener('click', () => applyGraphicsQuality('low'));

if (btnOpenControlsFromSettings) {
  btnOpenControlsFromSettings.addEventListener('click', () => {
    closeSettingsModal();
    openHelpModal();
  });
}

function initSettingsUI() {
  // Difficulty Selection Handlers
  if (btnDiffEasy) {
    btnDiffEasy.addEventListener('click', () => {
      setGameDifficulty('easy');
      updateDifficultyUI();
      sound.playCoin();
      showToast(currentLanguage === 'en' ? "Difficulty: EASY" : "Tingkat Kesulitan Diubah: MUDAH", "check");
    });
  }
  if (btnDiffMedium) {
    btnDiffMedium.addEventListener('click', () => {
      setGameDifficulty('medium');
      updateDifficultyUI();
      sound.playCoin();
      showToast(currentLanguage === 'en' ? "Difficulty: NORMAL" : "Tingkat Kesulitan Diubah: NORMAL (MEDIUM)", "anchor");
    });
  }
  if (btnDiffHard) {
    btnDiffHard.addEventListener('click', () => {
      setGameDifficulty('hard');
      updateDifficultyUI();
      sound.playCoin();
      showToast(currentLanguage === 'en' ? "Difficulty: HARD (EXTREME)" : "Tingkat Kesulitan Diubah: SULIT (EKSTREM)", "skull");
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
      const bText = (currentLanguage === 'en' && cfg && cfg.badgeEn) ? cfg.badgeEn : (cfg ? cfg.badge : nextDiff.toUpperCase());
      showToast(`${t('difficultyTitle')}: ${bText}`, "anchor");
    });
  }
  updateDifficultyUI();

  // Language Selector Handlers
  const btnLangId = document.getElementById('btnLangId');
  const btnLangEn = document.getElementById('btnLangEn');
  if (btnLangId) {
    btnLangId.addEventListener('click', () => {
      setGameLanguage('id');
      if (typeof sound !== 'undefined') sound.playCoin();
      showToast("Bahasa diubah: Bahasa Indonesia", "check");
    });
  }
  if (btnLangEn) {
    btnLangEn.addEventListener('click', () => {
      setGameLanguage('en');
      if (typeof sound !== 'undefined') sound.playCoin();
      showToast("Language changed: English", "check");
    });
  }
  updateLanguageButtonsUI();
  applyTranslations();

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
try {
  initSettingsUI();
} catch (e) {
  console.warn("initSettingsUI warning:", e);
}

// Main Menu Handlers
function updateMainMenuSaveStatus() {
  // Save slots are dynamically managed via the 3-save slots modal
}

// 3 Save Slots Modal Functions
function openSaveSlotsModal() {
  if (typeof sound !== 'undefined') sound.init();
  closeAllModals();
  renderSaveSlotsUI();
  if (saveSlotsModal) {
    saveSlotsModal.classList.remove('modal-enter', 'hidden');
    saveSlotsModal.classList.add('modal-active');
  }
  if (typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad')) {
    const ssBar = document.getElementById('saveSlotsGamepadBar');
    if (ssBar) {
      ssBar.classList.remove('hidden');
      ssBar.classList.add('flex');
    }
    const slotList = document.getElementById('saveSlotsList');
    if (slotList) {
      const firstBtn = slotList.querySelector('.btn-slot-play, .btn-slot-new');
      if (firstBtn && typeof setGamepadMenuFocus === 'function') {
        setGamepadMenuFocus(firstBtn);
      }
    }
  }
}

function closeSaveSlotsModal() {
  if (!saveSlotsModal) return;
  saveSlotsModal.classList.remove('modal-active');
  saveSlotsModal.classList.add('modal-enter', 'hidden');
  const ssBar = document.getElementById('saveSlotsGamepadBar');
  if (ssBar) {
    ssBar.classList.add('hidden');
    ssBar.classList.remove('flex');
  }
  if (typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad')) {
    const playBtn = document.getElementById('btnMainMenuPlay');
    if (playBtn && typeof setGamepadMenuFocus === 'function') {
      setGamepadMenuFocus(playBtn);
    }
    const mmBar = document.getElementById('mainMenuGamepadBar');
    if (mmBar) {
      mmBar.classList.remove('hidden');
      mmBar.classList.add('flex');
    }
  }
}

function renderSaveSlotsUI() {
  if (!saveSlotsList) return;
  saveSlotsList.innerHTML = '';

  for (let slot = 1; slot <= 3; slot++) {
    const raw = localStorage.getItem(getSaveSlotKey(slot)) || (slot === 1 ? localStorage.getItem(SAVE_KEY) : null);
    let slotData = null;
    if (raw) {
      try {
        slotData = JSON.parse(raw);
      } catch (e) {
        slotData = null;
      }
    }

    const card = document.createElement('div');
    card.className = "bg-slate-900/90 rounded-2xl p-3.5 sm:p-5 border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition shadow-xl relative shrink-0 min-h-[220px]";

    if (!slotData) {
      card.innerHTML = `
        <div class="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10 mb-2.5 sm:mb-3">
          <div class="flex items-center gap-2">
            <span class="font-cinzel font-black text-sm text-slate-200">SLOT ${slot}</span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">${t('slotEmptyBadge')}</span>
        </div>
        <div class="flex flex-col items-center justify-center py-3 sm:py-5 text-center my-auto">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-2">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div class="text-xs text-slate-400 font-cinzel font-bold">${t('slotEmptyTitle')}</div>
          <div class="text-[10px] text-slate-500 mt-0.5 sm:mt-1">${t('slotEmptyDesc')}</div>
        </div>
        <div class="pt-2.5 sm:pt-3 border-t border-white/10 mt-2 shrink-0">
          <button class="btn-slot-new w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5" data-slot="${slot}">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>${t('newGame')}</span>
          </button>
        </div>
      `;
    } else {
      const upgrades = slotData.upgrades || { hull: 1, speed: 1, cannons: 1, armor: 1 };
      const totalRank = Object.values(upgrades).reduce((a, b) => a + b, 0);
      let shipTierName = 'Sekoci Pemburu';
      let shipRank = 1;
      if (typeof getShipTierByUpgrades === 'function') {
        const tObj = getShipTierByUpgrades(upgrades);
        shipTierName = tObj.name;
        shipRank = tObj.rank;
      } else if (typeof SHIP_TIERS !== 'undefined') {
        const found = SHIP_TIERS.find(t => totalRank >= t.minRank && totalRank <= t.maxRank);
        if (found) {
          shipTierName = found.name;
          shipRank = found.rank;
        }
      }
      if (currentLanguage === 'en') {
        const rankNames = {
          1: "Hunter Skiff",
          2: "Explorer Caravel",
          3: "Combat Brigantine",
          4: "Iron War Galleon",
          5: "Leviathan Slayer"
        };
        if (rankNames[shipRank]) shipTierName = rankNames[shipRank];
      }
      const maxHp = 100 + ((upgrades.hull - 1) * 35);
      const hp = slotData.hp || maxHp;
      const gold = slotData.gold || 0;
      const blood = slotData.bloodEssence || 0;
      const genNum = slotData.worldGenNumber || 1;

      card.innerHTML = `
        <div class="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10 mb-2 sm:mb-3">
          <div class="flex items-center gap-2">
            <span class="font-cinzel font-black text-sm text-amber-300">SLOT ${slot}</span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">${t('slotActiveBadge')}</span>
        </div>
        <div class="space-y-1.5 sm:space-y-2 text-xs my-auto py-1 sm:py-2">
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-cinzel text-[11px]">${t('shipLabel')}</span>
            <span class="font-bold text-amber-300 font-cinzel text-[11px] truncate max-w-[130px]">${shipTierName}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-cinzel text-[11px]">${t('tierLabel')}</span>
            <span class="font-mono font-bold text-sky-300 text-[11px]">Rank ${shipRank} (${totalRank}/36)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-cinzel text-[11px]">${t('hullLabel')}</span>
            <span class="font-mono text-emerald-400 text-[11px] font-bold">${hp} / ${maxHp} HP</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-cinzel text-[11px]">${t('wealthLabel')}</span>
            <span class="font-mono text-amber-400 text-[11px] font-bold">${gold} ${t('goldUnit')} • ${blood} ${t('bloodUnit')}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-cinzel text-[11px]">${t('worldLabel')}</span>
            <span class="font-mono text-slate-300 text-[11px]">Gen #${genNum}</span>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 pt-2.5 sm:pt-3 border-t border-white/10 mt-2 shrink-0">
          <button class="btn-slot-play col-span-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-cinzel font-black text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5" data-slot="${slot}">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>${t('continueGame')}</span>
          </button>
          <button class="btn-slot-delete col-span-1 py-2.5 px-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-300 font-cinzel font-bold text-[11px] transition active:scale-95 cursor-pointer flex items-center justify-center gap-1" data-slot="${slot}">
            <svg class="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
            <span>${t('deleteSlot')}</span>
          </button>
        </div>
      `;
    }

    saveSlotsList.appendChild(card);
  }

  // Bind slot button actions
  saveSlotsList.querySelectorAll('.btn-slot-new').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseInt(btn.getAttribute('data-slot'), 10);
      startNewGameInSlot(s);
    });
  });
  saveSlotsList.querySelectorAll('.btn-slot-play').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseInt(btn.getAttribute('data-slot'), 10);
      continueGameInSlot(s);
    });
  });
  saveSlotsList.querySelectorAll('.btn-slot-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseInt(btn.getAttribute('data-slot'), 10);
      promptDeleteSlot(s);
    });
  });
}

function startNewGameInSlot(slot) {
  currentSaveSlot = slot;
  localStorage.setItem('SUNKEN_SHIP_ACTIVE_SLOT', slot);
  resetRoguelikeRun(slot);
  closeSaveSlotsModal();
  window.shouldPlayCinematicPrologue = true;
  showGameLoadingScreen(() => startGameFromMenu());
}

function continueGameInSlot(slot) {
  currentSaveSlot = slot;
  localStorage.setItem('SUNKEN_SHIP_ACTIVE_SLOT', slot);
  loadSavedGame(slot);
  closeSaveSlotsModal();
  showGameLoadingScreen(() => continueGameFromMenu());
}

function promptDeleteSlot(slot) {
  slotPendingDeletion = slot;
  if (deleteSlotModalTitle) {
    deleteSlotModalTitle.innerText = t('confirmDeleteTitle', { slot });
  }
  const deleteSlotModalDesc = document.getElementById('deleteSlotModalDesc');
  if (deleteSlotModalDesc) {
    deleteSlotModalDesc.innerText = t('confirmDeleteDesc', { slot });
  }
  if (deleteSlotConfirmModal) {
    deleteSlotConfirmModal.classList.remove('hidden');
  }
  if (typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad')) {
    const cancelBtn = document.getElementById('btnCancelDeleteSlot');
    if (cancelBtn && typeof setGamepadMenuFocus === 'function') {
      setGamepadMenuFocus(cancelBtn);
    }
  }
}

// Cinematic Narrative Prologue (Pure black screen, left-aligned, typewriter, blood-red climax dissolve)
let prologueState = {
  active: false,
  isTyping: false,
  skipTyping: false,
  isWaitingNext: false,
  isClimaxAnimating: false,
  currentLine: 0,
  typingTimer: null,
  waitTimer: null,
  onComplete: null,
  cleanupListeners: null
};

function startCinematicPrologue(onComplete) {
  const modal = document.getElementById('cinematicPrologueModal');
  const textEl = document.getElementById('prologueText');
  if (!modal || !textEl) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  isGamePaused = true;

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  const scriptLines = isEn ? [
    { text: "In the boundless expanse of the Endless Ocean..." },
    { text: "Countless sailors arrived driven by ambition and greed." },
    { text: "Yet the ancient tempests and trench beasts know no mercy." },
    { text: "Every shattered hull beneath the waves preserves remnants of past glory." },
    { text: "If you fail to steady your helm..." },
    {
      isClimax: true,
      prefix: "Then you will just become another ",
      phrase: "sunken ship",
      suffix: "."
    }
  ] : [
    { text: "Di luasnya Samudra Tak Berujung..." },
    { text: "Banyak pelaut datang membawa ambisi dan keserakahan." },
    { text: "Namun badai purba dan monster palung tidak mengenal belas kasihan." },
    { text: "Setiap pecahan kayu yang tenggelam menyimpan sisa kejayaan masa lalu." },
    { text: "Bila kamu gagal mempertahankan kemudimu..." },
    {
      isClimax: true,
      prefix: "Lalu kamu akan menjadi ",
      phrase: "kapal karam",
      suffix: " seperti lainnya."
    }
  ];

  modal.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
  modal.classList.add('opacity-100', 'pointer-events-auto');

  prologueState.active = true;
  prologueState.currentLine = 0;
  prologueState.onComplete = onComplete;

  function endPrologue() {
    if (!prologueState.active) return;
    prologueState.active = false;

    if (prologueState.typingTimer) clearTimeout(prologueState.typingTimer);
    if (prologueState.waitTimer) clearTimeout(prologueState.waitTimer);

    if (prologueState.cleanupListeners) {
      prologueState.cleanupListeners();
      prologueState.cleanupListeners = null;
    }

    // Call onComplete immediately so flight sequence and camera start underneath the dissolving black screen
    if (typeof prologueState.onComplete === 'function') {
      const cb = prologueState.onComplete;
      prologueState.onComplete = null;
      cb();
    }

    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');

    setTimeout(() => {
      modal.classList.add('hidden');
      textEl.innerHTML = '';
      textEl.style.opacity = '1';
    }, 700);
  }

  // Handle player skip / advance by clicking or tapping anywhere, or pressing key/gamepad
  function handleAdvanceOrSkip(e) {
    if (e) {
      e.stopPropagation();
      if (e.preventDefault && e.type !== 'keydown') e.preventDefault();
    }
    if (!prologueState.active) return;

    if (prologueState.isTyping) {
      prologueState.skipTyping = true;
    } else if (prologueState.isWaitingNext) {
      if (prologueState.waitTimer) clearTimeout(prologueState.waitTimer);
      if (typeof prologueState.proceedNextLine === 'function') {
        prologueState.proceedNextLine();
      }
    } else if (prologueState.isClimaxAnimating) {
      endPrologue();
    }
  }

  const onPointerDown = (e) => handleAdvanceOrSkip(e);
  const onKeyDown = (e) => handleAdvanceOrSkip(e);

  modal.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);

  prologueState.cleanupListeners = () => {
    modal.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('keydown', onKeyDown);
  };

  function playLine(lineIdx) {
    if (!prologueState.active) return;
    if (lineIdx >= scriptLines.length) {
      endPrologue();
      return;
    }

    const item = scriptLines[lineIdx];
    prologueState.currentLine = lineIdx;
    prologueState.isTyping = true;
    prologueState.skipTyping = false;
    prologueState.isWaitingNext = false;
    prologueState.isClimaxAnimating = false;

    textEl.style.transition = 'none';
    textEl.style.opacity = '1';

    if (!item.isClimax) {
      textEl.textContent = '';
      const fullText = item.text;
      let charIdx = 0;

      function typeChar() {
        if (!prologueState.active) return;
        if (prologueState.skipTyping || charIdx >= fullText.length) {
          textEl.textContent = fullText;
          prologueState.isTyping = false;
          prologueState.isWaitingNext = true;

          prologueState.proceedNextLine = () => {
            prologueState.isWaitingNext = false;
            textEl.style.transition = 'opacity 0.6s ease-out';
            textEl.style.opacity = '0';
            prologueState.waitTimer = setTimeout(() => {
              playLine(lineIdx + 1);
            }, 600);
          };

          prologueState.waitTimer = setTimeout(() => {
            prologueState.proceedNextLine();
          }, 2000);
          return;
        }

        textEl.textContent += fullText.charAt(charIdx);
        const char = fullText.charAt(charIdx);
        charIdx++;

        let delay = 38;
        if (char === '.' || char === '!' || char === '?') delay = 350;
        else if (char === ',') delay = 200;

        prologueState.typingTimer = setTimeout(typeChar, delay);
      }

      typeChar();
    } else {
      prologueState.isClimaxAnimating = true;
      textEl.innerHTML = `
        <span class="prologue-fade-target inline transition-opacity duration-1000"></span><span class="prologue-climax-phrase inline font-bold transition-all duration-1000"></span><span class="prologue-fade-target inline transition-opacity duration-1000"></span>
      `;

      const spans = textEl.querySelectorAll('span');
      const prefixSpan = spans[0];
      const phraseSpan = spans[1];
      const suffixSpan = spans[2];

      const parts = [
        { span: prefixSpan, text: item.prefix },
        { span: phraseSpan, text: item.phrase },
        { span: suffixSpan, text: item.suffix }
      ];

      let currentPartIdx = 0;
      let partCharIdx = 0;

      function typeClimaxChar() {
        if (!prologueState.active) return;
        if (prologueState.skipTyping) {
          prefixSpan.textContent = item.prefix;
          phraseSpan.textContent = item.phrase;
          suffixSpan.textContent = item.suffix;
          runClimaxResolution();
          return;
        }

        if (currentPartIdx >= parts.length) {
          prologueState.isTyping = false;
          runClimaxResolution();
          return;
        }

        const curr = parts[currentPartIdx];
        if (partCharIdx >= curr.text.length) {
          currentPartIdx++;
          partCharIdx = 0;
          prologueState.typingTimer = setTimeout(typeClimaxChar, 50);
          return;
        }

        curr.span.textContent += curr.text.charAt(partCharIdx);
        const char = curr.text.charAt(partCharIdx);
        partCharIdx++;

        let delay = 40;
        if (char === '.' || char === '!' || char === '?') delay = 350;
        else if (char === ',') delay = 200;

        prologueState.typingTimer = setTimeout(typeClimaxChar, delay);
      }

      function runClimaxResolution() {
        prologueState.isTyping = false;
        prologueState.waitTimer = setTimeout(() => {
          if (!prologueState.active) return;

          // Climax Phase 1: Turn "kapal karam" / "sunken ship" to glowing blood-red
          phraseSpan.style.color = '#ef4444';
          phraseSpan.style.textShadow = '0 0 25px rgba(239, 68, 68, 0.9), 0 0 50px rgba(185, 28, 28, 0.6)';

          // Climax Phase 2: Fade surrounding words to black, leaving crimson phrase alone
          prologueState.waitTimer = setTimeout(() => {
            if (!prologueState.active) return;
            prefixSpan.style.opacity = '0';
            suffixSpan.style.opacity = '0';

            // Climax Phase 3: Crimson phrase dissolves into black
            prologueState.waitTimer = setTimeout(() => {
              if (!prologueState.active) return;
              phraseSpan.style.opacity = '0';

              // Climax Complete: Transition into game world
              prologueState.waitTimer = setTimeout(() => {
                endPrologue();
              }, 1200);
            }, 2000);
          }, 700);
        }, 800);
      }

      typeClimaxChar();
    }
  }

  playLine(0);
}

// Respawn Narrative Dialogue (Lalu kamu akan menjadi kapal karam...)
function startRespawnPrologue(onComplete) {
  const modal = document.getElementById('cinematicPrologueModal');
  const textEl = document.getElementById('prologueText');
  if (!modal || !textEl) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  isGamePaused = true;
  modal.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
  modal.classList.add('opacity-100', 'pointer-events-auto');

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  const item = isEn ? {
    prefix: "Then you will just become another ",
    phrase: "sunken ship",
    suffix: "."
  } : {
    prefix: "Lalu kamu akan menjadi ",
    phrase: "kapal karam",
    suffix: " seperti lainnya."
  };

  let active = true;
  let typingTimer = null;
  let waitTimer = null;
  let skipRequested = false;

  textEl.innerHTML = `
    <span class="prologue-fade-target inline transition-opacity duration-1000"></span><span class="prologue-climax-phrase inline font-bold transition-all duration-1000"></span><span class="prologue-fade-target inline transition-opacity duration-1000"></span>
  `;

  const spans = textEl.querySelectorAll('span');
  const prefixSpan = spans[0];
  const phraseSpan = spans[1];
  const suffixSpan = spans[2];

  const parts = [
    { span: prefixSpan, text: item.prefix },
    { span: phraseSpan, text: item.phrase },
    { span: suffixSpan, text: item.suffix }
  ];

  let currentPartIdx = 0;
  let partCharIdx = 0;

  function cleanup() {
    active = false;
    if (typingTimer) clearTimeout(typingTimer);
    if (waitTimer) clearTimeout(waitTimer);
    modal.removeEventListener('pointerdown', handleSkip);
    window.removeEventListener('keydown', handleSkip);
  }

  function finish() {
    cleanup();
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      modal.classList.add('hidden');
      textEl.innerHTML = '';
      textEl.style.opacity = '1';
      if (typeof onComplete === 'function') onComplete();
    }, 600);
  }

  function handleSkip(e) {
    if (e) {
      e.stopPropagation();
      if (e.preventDefault && e.type !== 'keydown') e.preventDefault();
    }
    if (!active) return;
    if (!skipRequested) {
      skipRequested = true;
      prefixSpan.textContent = item.prefix;
      phraseSpan.textContent = item.phrase;
      suffixSpan.textContent = item.suffix;
      runRespawnClimaxResolution(true);
    } else {
      finish();
    }
  }

  modal.addEventListener('pointerdown', handleSkip);
  window.addEventListener('keydown', handleSkip);

  function typeChar() {
    if (!active) return;
    if (skipRequested) return;

    if (currentPartIdx >= parts.length) {
      runRespawnClimaxResolution(false);
      return;
    }

    const curr = parts[currentPartIdx];
    if (partCharIdx >= curr.text.length) {
      currentPartIdx++;
      partCharIdx = 0;
      typingTimer = setTimeout(typeChar, 50);
      return;
    }

    curr.span.textContent += curr.text.charAt(partCharIdx);
    const char = curr.text.charAt(partCharIdx);
    partCharIdx++;

    let delay = 40;
    if (char === '.' || char === '!' || char === '?') delay = 350;
    else if (char === ',') delay = 200;

    typingTimer = setTimeout(typeChar, delay);
  }

  function runRespawnClimaxResolution(fast) {
    const delayPhase1 = fast ? 150 : 800;
    const delayPhase2 = fast ? 200 : 700;
    const delayPhase3 = fast ? 300 : 2000;
    const delayPhase4 = fast ? 200 : 1200;

    waitTimer = setTimeout(() => {
      if (!active) return;
      // Climax Phase 1: Turn phrase to glowing blood-red
      phraseSpan.style.color = '#ef4444';
      phraseSpan.style.textShadow = '0 0 25px rgba(239, 68, 68, 0.9), 0 0 50px rgba(185, 28, 28, 0.6)';

      waitTimer = setTimeout(() => {
        if (!active) return;
        // Climax Phase 2: Fade surrounding words to black, leaving crimson phrase alone
        prefixSpan.style.opacity = '0';
        suffixSpan.style.opacity = '0';

        waitTimer = setTimeout(() => {
          if (!active) return;
          // Climax Phase 3: Crimson phrase dissolves into black
          phraseSpan.style.opacity = '0';

          waitTimer = setTimeout(() => {
            finish();
          }, delayPhase4);
        }, delayPhase3);
      }, delayPhase2);
    }, delayPhase1);
  }

  typeChar();
}
if (typeof window !== 'undefined') {
  window.startRespawnPrologue = startRespawnPrologue;
}

// Ensure Ancient Shipwreck exists in entities.sunkenShips for New Game Seagull Intro (Placed ~13,500m out in open water)
function ensureAncientIntroShipwreck() {
  const targetDist = 13500;
  const targetAngle = 0.95; // Southeast open ocean lane
  let testX = Math.round(Math.cos(targetAngle) * targetDist);
  let testY = Math.round(Math.sin(targetAngle) * targetDist);

  // If there is any island nearby, push outward into open waters
  if (typeof WORLD_ISLANDS !== 'undefined' && Array.isArray(WORLD_ISLANDS)) {
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      const isl = WORLD_ISLANDS[i];
      const d = Math.hypot(testX - isl.x, testY - isl.y);
      const safeR = (isl.radius || 200) + 180;
      if (d < safeR) {
        const pushAng = Math.atan2(testY - isl.y, testX - isl.x);
        testX = Math.round(isl.x + Math.cos(pushAng) * (safeR + 80));
        testY = Math.round(isl.y + Math.sin(pushAng) * (safeR + 80));
      }
    }
  }

  const introCoords = { x: testX, y: testY };
  if (typeof entities !== 'undefined' && Array.isArray(entities.sunkenShips)) {
    let existing = entities.sunkenShips.find(s => s.id === 'ancient_intro_wreck');
    if (!existing) {
      existing = {
        id: 'ancient_intro_wreck',
        x: introCoords.x,
        y: introCoords.y,
        angle: 0.65,
        radius: 40,
        salvageTime: 4.5,
        salvaged: false,
        isAbyssal: false,
        isGuarded: false,
        goldReward: 35,
        bloodReward: 0
      };
      entities.sunkenShips.push(existing);
    } else {
      existing.x = introCoords.x;
      existing.y = introCoords.y;
    }
    return { x: existing.x, y: existing.y };
  }
  return introCoords;
}
if (typeof window !== 'undefined') {
  window.ensureAncientIntroShipwreck = ensureAncientIntroShipwreck;
}

// Update Rolling Credits during New Game Intro Flight (Synchronized across ~75-second voyage)
function updateCinematicCreditsUI(elapsed, duration) {
  const overlay = document.getElementById('cinematicCreditsOverlay');
  const subEl = document.getElementById('cinematicCreditSubtitle');
  const titleEl = document.getElementById('cinematicCreditTitle');
  if (!overlay || !subEl || !titleEl) return;

  const credits = (typeof t === 'function' && Array.isArray(t('cinematicCredits')))
    ? t('cinematicCredits')
    : [
      { subtitle: "KARYA PERTAMA", title: "Dibuat oleh Iyodihhh" },
      { subtitle: "TEKNOLOGI AGENTIK", title: "Vibe coded with Antigravity" },
      { subtitle: "TATA SUARA & MUSIK", title: "Procedural Web Audio" },
      { subtitle: "SAMUDRA TAK BERUJUNG", title: "Selamat Berlayar" }
    ];

  // Paced timing windows across 75 seconds voyage
  const windows = [
    { start: 8.0, end: 20.0, fadeIn: 2.0, fadeOut: 2.0 },
    { start: 24.0, end: 36.0, fadeIn: 2.0, fadeOut: 2.0 },
    { start: 40.0, end: 52.0, fadeIn: 2.0, fadeOut: 2.0 },
    { start: 56.0, end: 68.0, fadeIn: 2.0, fadeOut: 2.0 }
  ];

  let activeCredit = null;
  let alpha = 0;

  for (let i = 0; i < windows.length; i++) {
    const win = windows[i];
    if (elapsed >= win.start && elapsed <= win.end && credits[i]) {
      activeCredit = credits[i];
      if (elapsed < win.start + win.fadeIn) {
        alpha = (elapsed - win.start) / win.fadeIn;
      } else if (elapsed > win.end - win.fadeOut) {
        alpha = (win.end - elapsed) / win.fadeOut;
      } else {
        alpha = 1.0;
      }
      break;
    }
  }

  if (activeCredit && alpha > 0.01) {
    if (subEl.textContent !== activeCredit.subtitle) subEl.textContent = activeCredit.subtitle;
    if (titleEl.textContent !== activeCredit.title) titleEl.textContent = activeCredit.title;
    overlay.style.opacity = Math.max(0, Math.min(1, alpha)).toFixed(3);
  } else {
    overlay.style.opacity = '0';
  }
}
if (typeof window !== 'undefined') {
  window.updateCinematicCreditsUI = updateCinematicCreditsUI;
}

// Cinematic Seagull Flight Coordinator
function startSeagullFlightSequence(type, startPos, endPos, onComplete) {
  isGameStarted = true;
  isGamePaused = false;
  lastTime = performance.now();

  // Hide HUD & Controls during cinematic flight
  if (topHUD) {
    topHUD.classList.add('opacity-0', 'pointer-events-none');
    topHUD.classList.remove('opacity-100');
  }
  const pcControlsBar = document.getElementById('pcControlsBar');
  if (pcControlsBar) {
    pcControlsBar.classList.add('hidden');
    pcControlsBar.style.display = 'none';
  }
  const mobileDock = document.getElementById('mobileControlsDock');
  if (mobileDock) {
    mobileDock.classList.add('hidden');
    mobileDock.style.display = 'none';
  }

  const creditsOverlay = document.getElementById('cinematicCreditsOverlay');
  if (type === 'new_game' && creditsOverlay) {
    creditsOverlay.classList.remove('hidden');
    creditsOverlay.style.opacity = '0';
  } else if (creditsOverlay) {
    creditsOverlay.classList.add('hidden');
    creditsOverlay.style.opacity = '0';
  }

  // Show Skip Option Button (For both new_game and respawn flights)
  const skipContainer = document.getElementById('cinematicSkipContainer');
  const skipLabel = document.getElementById('skipFlightLabel');
  const badgeKey = document.getElementById('badgeSkipKey');
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  const isGamepad = (typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad'));
  if (skipContainer) {
    if (skipLabel) {
      skipLabel.innerText = (type === 'new_game')
        ? (isEn ? "LEWATI INTRO" : "LEWATI INTRO")
        : (isEn ? "SKIP TO SHIP" : "LEWATI KE KAPAL");
    }
    if (badgeKey) {
      badgeKey.innerText = isGamepad ? "A" : (isEn ? "SPACE" : "SPASI");
    }
    skipContainer.classList.remove('hidden');
    skipContainer.classList.remove('opacity-0');
    skipContainer.classList.add('opacity-100');
  }

  const btnSkipFlight = document.getElementById('btnSkipCinematicFlight');
  if (btnSkipFlight) {
    btnSkipFlight.onclick = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
      }
      skipCinematicFlight();
    };
  }

  // Play intro music during New Game intro flight
  if (type === 'new_game' && typeof sound !== 'undefined' && typeof sound.playIntroMusic === 'function') {
    sound.playIntroMusic();
  }

  // 75 seconds for expansive New Game intro; distance-scaled for respawn recovery
  const flightDist = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y);
  const duration = (type === 'new_game') ? 75.0 : Math.max(8.0, Math.min(22.0, 3.0 + flightDist / 140.0));
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const initialHeading = Math.atan2(dy, dx);

  window.cinematicFlightState = {
    active: true,
    type: type,
    elapsed: 0,
    duration: duration,
    startPos: { x: startPos.x, y: startPos.y },
    endPos: { x: endPos.x, y: endPos.y },
    seagull: {
      x: startPos.x,
      y: startPos.y,
      heading: initialHeading,
      state: 'perched',
      altitude: 3.5,
      wingPhase: 0,
      alpha: 1.0,
      isCarrion: false
    },
    onComplete: onComplete,
    cleanupSkip: null
  };

  if (window.cameraState) {
    window.cameraState.x = startPos.x;
    window.cameraState.y = startPos.y;
    window.cameraState.overrideActive = true;
    window.cameraState.zoomOverride = 0.84;
  }

  function handleFlightSkip(e) {
    if (e) {
      e.stopPropagation();
      if (e.preventDefault && e.type !== 'keydown') e.preventDefault();
    }
    skipCinematicFlight();
  }

  window.addEventListener('pointerdown', handleFlightSkip);
  window.addEventListener('keydown', handleFlightSkip);

  window.cinematicFlightState.cleanupSkip = () => {
    window.removeEventListener('pointerdown', handleFlightSkip);
    window.removeEventListener('keydown', handleFlightSkip);
  };
}
if (typeof window !== 'undefined') {
  window.startSeagullFlightSequence = startSeagullFlightSequence;
}

function endCinematicFlight() {
  const flight = window.cinematicFlightState;
  if (!flight || !flight.active) return;
  flight.active = false;

  if (flight.cleanupSkip) {
    flight.cleanupSkip();
    flight.cleanupSkip = null;
  }

  // Hide Skip Option Button
  const skipContainer = document.getElementById('cinematicSkipContainer');
  if (skipContainer) {
    skipContainer.classList.remove('opacity-100');
    skipContainer.classList.add('opacity-0');
    setTimeout(() => skipContainer.classList.add('hidden'), 300);
  }

  // Stop / fade out intro music if playing
  if (typeof sound !== 'undefined' && typeof sound.stopIntroMusic === 'function') {
    sound.stopIntroMusic(false);
  }

  const creditsOverlay = document.getElementById('cinematicCreditsOverlay');
  if (creditsOverlay) {
    creditsOverlay.classList.add('hidden');
    creditsOverlay.style.opacity = '0';
  }

  // Release camera override back to player ship
  if (window.cameraState) {
    window.cameraState.overrideActive = false;
    window.cameraState.zoomOverride = null;
    window.cameraState.x = playerState.x;
    window.cameraState.y = playerState.y;
  }

  // Reveal Top HUD, joystick & PC controls
  if (topHUD) {
    topHUD.classList.remove('opacity-0', 'pointer-events-none');
    topHUD.classList.add('opacity-100');
  }
  const isGamepadActive = typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad');
  const pcControlsBar = document.getElementById('pcControlsBar');
  if (pcControlsBar) {
    if (isGamepadActive || (!isMobileDevice() && window.innerWidth >= 1024) || (window.innerWidth >= 1024)) {
      pcControlsBar.classList.remove('hidden');
      pcControlsBar.style.display = 'flex';
    } else {
      pcControlsBar.classList.add('hidden');
      pcControlsBar.style.display = 'none';
    }
  }
  const mobileDock = document.getElementById('mobileControlsDock');
  if (mobileDock) {
    if (!isGamepadActive && (isMobileDevice() || window.innerWidth < 1024)) {
      mobileDock.classList.remove('hidden', 'pointer-events-none');
      mobileDock.style.display = 'flex';
    } else {
      mobileDock.classList.add('hidden');
      mobileDock.style.display = 'none';
    }
  }

  if (typeof updateHUD === 'function') updateHUD();

  if (typeof flight.onComplete === 'function') {
    const cb = flight.onComplete;
    flight.onComplete = null;
    cb();
  }
}
if (typeof window !== 'undefined') {
  window.endCinematicFlight = endCinematicFlight;
}

function skipCinematicFlight() {
  const flight = window.cinematicFlightState;
  if (!flight || !flight.active) return;
  if (flight.seagull && flight.endPos) {
    flight.seagull.x = flight.endPos.x;
    flight.seagull.y = flight.endPos.y;
    flight.seagull.state = 'perched';
    flight.seagull.altitude = 3.5;
  }
  endCinematicFlight();
}
if (typeof window !== 'undefined') {
  window.skipCinematicFlight = skipCinematicFlight;
}

function startGameFromMenu() {
  sound.init();
  sound.startAmbience();

  if (sound.autoFullscreen) {
    toggleFullscreen(true);
  }

  if (window.shouldPlayCinematicPrologue) {
    window.shouldPlayCinematicPrologue = false;
    isGameStarted = true;
    isGamePaused = true;

    // Immediately hide HUD, controls, and dock action
    if (topHUD) {
      topHUD.classList.add('opacity-0', 'pointer-events-none');
      topHUD.classList.remove('opacity-100');
    }
    const pcControlsBar = document.getElementById('pcControlsBar');
    if (pcControlsBar) {
      pcControlsBar.classList.add('hidden');
      pcControlsBar.style.display = 'none';
    }
    const mobileDock = document.getElementById('mobileControlsDock');
    if (mobileDock) {
      mobileDock.classList.add('hidden');
      mobileDock.style.display = 'none';
    }
    const dockAction = document.getElementById('dockShopAction');
    if (dockAction) dockAction.classList.add('hidden');

    // Pre-calculate ancient intro shipwreck in open waters
    const startWreckPos = ensureAncientIntroShipwreck();
    const havenPos = { x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y };

    // Set camera IMMEDIATELY to intro shipwreck location (eliminates visual jump/flash!)
    if (window.cameraState) {
      window.cameraState.x = startWreckPos.x;
      window.cameraState.y = startWreckPos.y;
      window.cameraState.overrideActive = true;
      window.cameraState.zoomOverride = 0.84;
    }

    // Seed dramatic naval combat skirmishes along the flight route
    if (typeof seedCinematicNavalBattles === 'function') {
      seedCinematicNavalBattles(startWreckPos, havenPos);
    }

    // Hide Main Menu
    if (mainMenuModal) {
      mainMenuModal.classList.add('opacity-0', 'pointer-events-none');
      mainMenuModal.classList.remove('opacity-100', 'pointer-events-auto');
    }

    startCinematicPrologue(() => {
      startSeagullFlightSequence('new_game', startWreckPos, havenPos, () => {
        isGamePaused = false;
        lastTime = performance.now();
        showToast(t('toastGameStarted'), "anchor");
        updateHUD();
      });
    });
    return;
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
  const isGamepadActive = typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad');
  const pcControlsBar = document.getElementById('pcControlsBar');
  if (pcControlsBar) {
    if (isGamepadActive || (!isMobileDevice() && window.innerWidth >= 1024) || (window.innerWidth >= 1024)) {
      pcControlsBar.classList.remove('hidden');
      pcControlsBar.style.display = 'flex';
    } else {
      pcControlsBar.classList.add('hidden');
      pcControlsBar.style.display = 'none';
    }
  }
  const mobileDock = document.getElementById('mobileControlsDock');
  if (mobileDock) {
    if (!isGamepadActive && (isMobileDevice() || window.innerWidth < 1024)) {
      mobileDock.classList.remove('hidden', 'pointer-events-none');
      mobileDock.style.display = 'flex';
    } else {
      mobileDock.classList.add('hidden');
      mobileDock.style.display = 'none';
    }
  }

  showToast(t('toastGameStarted'), "anchor");
  updateHUD();
}

function continueGameFromMenu() {
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
  const isGamepadActive = typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad');
  const pcControlsBar = document.getElementById('pcControlsBar');
  if (pcControlsBar) {
    if (isGamepadActive || (!isMobileDevice() && window.innerWidth >= 1024) || (window.innerWidth >= 1024)) {
      pcControlsBar.classList.remove('hidden');
      pcControlsBar.style.display = 'flex';
    } else {
      pcControlsBar.classList.add('hidden');
      pcControlsBar.style.display = 'none';
    }
  }
  const mobileDock = document.getElementById('mobileControlsDock');
  if (mobileDock) {
    if (!isGamepadActive && (isMobileDevice() || window.innerWidth < 1024)) {
      mobileDock.classList.remove('hidden', 'pointer-events-none');
      mobileDock.style.display = 'flex';
    } else {
      mobileDock.classList.add('hidden');
      mobileDock.style.display = 'none';
    }
  }

  showToast(t('toastGameResumed'), "compass");
  updateHUD();
}

function returnToMainMenu() {
  closePauseModal();
  closeAllModals();

  isGameStarted = false;
  isGamePaused = true;

  updateMainMenuSaveStatus();

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
  if (pcControlsBar) {
    pcControlsBar.classList.add('hidden');
    pcControlsBar.style.display = 'none';
  }
  const mobileDock = document.getElementById('mobileControlsDock');
  if (mobileDock) {
    mobileDock.classList.add('hidden', 'pointer-events-none');
    mobileDock.style.display = 'none';
  }

  if (typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad')) {
    const playBtn = document.getElementById('btnMainMenuPlay');
    if (playBtn && typeof setGamepadMenuFocus === 'function') {
      setGamepadMenuFocus(playBtn);
    }
    const mmBar = document.getElementById('mainMenuGamepadBar');
    if (mmBar) {
      mmBar.classList.remove('hidden');
      mmBar.classList.add('flex');
    }
  }
}

function setupMainMenuListeners() {
  const playBtn = document.getElementById('btnMainMenuPlay');
  const closeSlotsBtn = document.getElementById('btnCloseSaveSlots');
  const cancelDelBtn = document.getElementById('btnCancelDeleteSlot');
  const confirmDelBtn = document.getElementById('btnConfirmDeleteSlot');
  const settingsBtn = document.getElementById('btnMainMenuSettings');
  const codexBtn = document.getElementById('btnMainMenuCodex');
  const controlsBtn = document.getElementById('btnMainMenuControls');

  if (playBtn && !playBtn._hasMainMenuListener) {
    playBtn._hasMainMenuListener = true;
    playBtn.addEventListener('click', openSaveSlotsModal);
  }
  if (closeSlotsBtn && !closeSlotsBtn._hasMainMenuListener) {
    closeSlotsBtn._hasMainMenuListener = true;
    closeSlotsBtn.addEventListener('click', closeSaveSlotsModal);
  }
  if (cancelDelBtn && !cancelDelBtn._hasMainMenuListener) {
    cancelDelBtn._hasMainMenuListener = true;
    cancelDelBtn.addEventListener('click', () => {
      slotPendingDeletion = null;
      if (deleteSlotConfirmModal) deleteSlotConfirmModal.classList.add('hidden');
      if (typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad')) {
        const slotList = document.getElementById('saveSlotsList');
        if (slotList) {
          const firstBtn = slotList.querySelector('.btn-slot-play, .btn-slot-new');
          if (firstBtn && typeof setGamepadMenuFocus === 'function') setGamepadMenuFocus(firstBtn);
        }
      }
    });
  }
  if (confirmDelBtn && !confirmDelBtn._hasMainMenuListener) {
    confirmDelBtn._hasMainMenuListener = true;
    confirmDelBtn.addEventListener('click', () => {
      if (slotPendingDeletion !== null) {
        deleteSaveSlot(slotPendingDeletion);
        if (deleteSlotConfirmModal) deleteSlotConfirmModal.classList.add('hidden');
        renderSaveSlotsUI();
        if (typeof showToast === 'function') {
          showToast(t('toastSlotDeleted', { slot: slotPendingDeletion }), 'trash');
        }
        slotPendingDeletion = null;
        if (typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad')) {
          const slotList = document.getElementById('saveSlotsList');
          if (slotList) {
            const firstBtn = slotList.querySelector('.btn-slot-play, .btn-slot-new');
            if (firstBtn && typeof setGamepadMenuFocus === 'function') setGamepadMenuFocus(firstBtn);
          }
        }
      }
    });
  }
  if (settingsBtn && !settingsBtn._hasMainMenuListener) {
    settingsBtn._hasMainMenuListener = true;
    settingsBtn.addEventListener('click', () => openSettingsModal('mainMenu'));
  }
  if (codexBtn && !codexBtn._hasMainMenuListener) {
    codexBtn._hasMainMenuListener = true;
    codexBtn.addEventListener('click', openLoreModal);
  }
  if (controlsBtn && !controlsBtn._hasMainMenuListener) {
    controlsBtn._hasMainMenuListener = true;
    controlsBtn.addEventListener('click', openHelpModal);
  }
  const diffCycleBtn = document.getElementById('btnMainMenuDiffCycle');
  if (diffCycleBtn && !diffCycleBtn._hasMainMenuListener) {
    diffCycleBtn._hasMainMenuListener = true;
    diffCycleBtn.addEventListener('click', () => {
      sound.init();
      cycleDifficulty();
    });
  }
}

setupMainMenuListeners();
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMainMenuListeners);
  }
}

// Initial main menu state check on page load
updateMainMenuSaveStatus();
const initPcControlsBar = document.getElementById('pcControlsBar');
if (initPcControlsBar) {
  initPcControlsBar.classList.add('hidden');
  initPcControlsBar.style.display = 'none';
}
const initMobileDock = document.getElementById('mobileControlsDock');
if (initMobileDock) {
  initMobileDock.classList.add('hidden', 'pointer-events-none');
  initMobileDock.style.display = 'none';
}

function updatePauseSoundUI() {
  if (pauseSoundIcon) {
    pauseSoundIcon.innerHTML = sound.muted ? SVG_ICONS.soundOff : SVG_ICONS.soundOn;
  }
  if (pauseSoundLabel) {
    pauseSoundLabel.innerText = sound.muted ? "SUARA: MATI" : "SUARA: AKTIF";
  }
}

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
    updatePauseSoundUI();

    const tier = getShipTier();
    const pauseShipName = document.getElementById('pauseShipName');
    const pauseShipRank = document.getElementById('pauseShipRank');
    const pauseShipHp = document.getElementById('pauseShipHp');
    const pauseCargoSum = document.getElementById('pauseCargoSum');
    const elPauseGen = document.getElementById('pauseWorldGenLabel');

    if (pauseShipName) pauseShipName.innerText = tier.name;
    if (pauseShipRank) pauseShipRank.innerText = `Rank ${tier.rank}`;
    if (pauseShipHp) {
      const maxHp = 100 + ((playerState.upgrades.hull - 1) * 35);
      pauseShipHp.innerText = `${Math.round(playerState.hp)} / ${maxHp} HP`;
    }
    if (pauseCargoSum) {
      const wood = (playerState.resources && playerState.resources.wood) || 0;
      pauseCargoSum.innerText = `${playerState.gold || 0} Emas • ${playerState.bloodEssence || 0} Darah • ${wood} Kayu`;
    }
    if (elPauseGen) {
      elPauseGen.innerText = `Gen #${currentWorldGenNumber || 1} (Seed: ${currentWorldGenSeed || 'Default'})`;
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
  closePauseModal();
  closeAllModals();
  resetRoguelikeRun(currentSaveSlot);
  window.shouldPlayCinematicPrologue = true;
  showGameLoadingScreen(() => startGameFromMenu());
}

if (btnPauseGame) btnPauseGame.addEventListener('click', openPauseModal);
if (btnResumeGame) btnResumeGame.addEventListener('click', closePauseModal);
if (btnRestartGame) btnRestartGame.addEventListener('click', restartExpedition);
if (btnPauseToggleSound) {
  btnPauseToggleSound.addEventListener('click', () => {
    toggleSound();
  });
}
if (btnPauseLore) {
  btnPauseLore.addEventListener('click', () => {
    closePauseModal();
    pauseReturnTarget = 'pause';
    openLoreModal();
  });
}
if (btnPauseMap) {
  btnPauseMap.addEventListener('click', () => {
    closePauseModal();
    pauseReturnTarget = 'pause';
    openMapModal();
  });
}
if (btnPauseHelp) {
  btnPauseHelp.addEventListener('click', () => {
    closePauseModal();
    pauseReturnTarget = 'pause';
    openHelpModal();
  });
}
if (btnPauseSettings) btnPauseSettings.addEventListener('click', () => {
  closePauseModal();
  openSettingsModal('pause');
});
if (btnReturnToMainMenu) btnReturnToMainMenu.addEventListener('click', returnToMainMenu);
if (btnDockShop) btnDockShop.addEventListener('click', openUpgradeModal);
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
  if (typeof isSpyglassActive !== 'undefined' && isSpyglassActive && typeof toggleSpyglass === 'function') {
    toggleSpyglass(false);
    closedAny = true;
  }
  if (saveSlotsModal && saveSlotsModal.classList.contains('modal-active')) {
    closeSaveSlotsModal();
    closedAny = true;
  }
  if (deleteSlotConfirmModal && !deleteSlotConfirmModal.classList.contains('hidden')) {
    deleteSlotConfirmModal.classList.add('hidden');
    closedAny = true;
  }
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
  if (typeof inventoryModal !== 'undefined' && inventoryModal && inventoryModal.classList.contains('modal-active')) {
    closeInventoryModal();
    closedAny = true;
  }
  if (typeof recipeBookModal !== 'undefined' && recipeBookModal && recipeBookModal.classList.contains('modal-active')) {
    closeRecipeBookModal();
    closedAny = true;
  }
  if (typeof cannonPickerModal !== 'undefined' && cannonPickerModal && !cannonPickerModal.classList.contains('hidden')) {
    closeCannonPicker();
    closedAny = true;
  }
  if (typeof hideCargoTooltip === 'function') {
    hideCargoTooltip();
  }
  return closedAny;
}

// Game Over Modal & Shipwreck Overhaul Respawn
function triggerGameOver(reason) {
  isGamePaused = true;
  closeAllModals();
  if (pauseModal) {
    pauseModal.classList.remove('modal-active');
    pauseModal.classList.add('modal-enter', 'hidden');
  }

  // 1. Immediately terminate combat / battle music on player death
  if (typeof sound !== 'undefined' && typeof sound.stopBattleMusic === 'function') {
    sound.stopBattleMusic();
  }
  highestDetectionLevel = 0;
  battleIntensityLevel = 0;

  // Clear enemy aggro on dead player
  if (typeof entities !== 'undefined' && entities.enemies) {
    entities.enemies.forEach(e => {
      if (e.targetEntity === playerState) {
        e.targetEntity = null;
        e.alertState = 'unaware';
        e.detectionMeter = 0;
      }
    });
  }

  // 2. Clear and hide any active salvage diving ring and prompts
  currentSalvagingShip = null;
  salvageProgress = 0;
  const salvageContainer = document.getElementById('salvageContainer');
  if (salvageContainer) {
    salvageContainer.classList.remove('opacity-100');
    salvageContainer.classList.add('opacity-0');
  }
  const salvageCircle = document.getElementById('salvageCircle');
  if (salvageCircle) {
    salvageCircle.setAttribute('stroke-dasharray', '0, 100');
  }
  const toastContainer = document.getElementById('toastContainer');
  if (toastContainer) {
    toastContainer.innerHTML = '';
  }
  const elActionSlotSalvage = document.getElementById('actionSlotSalvage');
  if (elActionSlotSalvage) elActionSlotSalvage.classList.remove('salvage-ready-glow');
  const elBtnMobileSalvage = document.getElementById('btnMobileSalvage');
  if (elBtnMobileSalvage) elBtnMobileSalvage.classList.remove('border-sky-400', 'animate-pulse');
  const dockAction = document.getElementById('dockShopAction');
  if (dockAction) dockAction.classList.add('hidden');
  if (topHUD) {
    topHUD.classList.remove('opacity-100');
    topHUD.classList.add('opacity-0', 'pointer-events-none');
  }

  // 3. Create death shipwreck entity with all lost resources and 9-min timer
  if (typeof createDeathShipwreck === 'function') {
    createDeathShipwreck();
  }

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  const titleEl = document.getElementById('gameOverTitle');
  const reasonEl = document.getElementById('gameOverReason');
  const statDistEl = document.getElementById('statMaxDist');
  const statKillsEl = document.getElementById('statKills');
  const statSalvagesEl = document.getElementById('statSalvages');

  if (titleEl && typeof t === 'function') {
    titleEl.innerText = t('gameOverTitle');
  }
  if (reasonEl) {
    if (typeof t === 'function' && t('gameOverReason')) {
      reasonEl.innerText = t('gameOverReason');
    } else {
      reasonEl.innerText = isEn ? "Your fleet has sunk into the ocean depths." : (reason || "Armada Anda telah karam di kedalaman samudra.");
    }
  }
  if (statDistEl) statDistEl.innerText = `${playerState.maxDistanceReached}m`;
  if (statKillsEl) statKillsEl.innerText = playerState.kills;
  if (statSalvagesEl) statSalvagesEl.innerText = playerState.salvages;

  const btnRespawnText = document.getElementById('btnRespawnText');
  if (btnRespawnText && typeof t === 'function') {
    btnRespawnText.innerText = t('respawnBtn');
  }

  if (gameOverModal) {
    gameOverModal.classList.remove('modal-enter', 'hidden', 'opacity-0', 'pointer-events-none');
    gameOverModal.classList.add('modal-active', 'opacity-100', 'pointer-events-auto');
  }
}

function handlePlayerRespawnSequence() {
  if (gameOverModal) {
    gameOverModal.classList.remove('modal-active', 'opacity-100', 'pointer-events-auto');
    gameOverModal.classList.add('modal-enter', 'hidden', 'opacity-0', 'pointer-events-none');
  }

  const deathPos = playerState.playerDeathWreck
    ? { x: playerState.playerDeathWreck.x, y: playerState.playerDeathWreck.y }
    : { x: playerState.x, y: playerState.y };
  const havenPos = { x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y };

  if (typeof respawnAfterDeath === 'function') {
    respawnAfterDeath();
  }

  // 1. Play Respawn Typewriter Dialogue on clean pure black screen
  startRespawnPrologue(() => {
    // 2. Play Seagull Flight from death shipwreck back to Port Nusa Damai (WITHOUT CREDITS)
    startSeagullFlightSequence('respawn', deathPos, havenPos, () => {
      isGamePaused = false;
      lastTime = performance.now();

      const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
      if (typeof showToast === 'function') {
        showToast(isEn 
          ? "Awakened at Port Nusa Damai! Sail back to recover your sunken wreck within 9 minutes!" 
          : "Bangkit kembali di Pelabuhan Nusa Damai! Berlayarlah untuk menyelamatkan kargo kapal karam Anda sebelum 9 menit!", "anchor");
      }
      if (typeof updateHUD === 'function') updateHUD();
    });
  });
}
if (typeof window !== 'undefined') {
  window.handlePlayerRespawnSequence = handlePlayerRespawnSequence;
}

if (btnRespawn) {
  btnRespawn.addEventListener('click', (e) => {
    e.stopPropagation();
    handlePlayerRespawnSequence();
  });
}

if (gameOverModal) {
  gameOverModal.addEventListener('click', () => {
    handlePlayerRespawnSequence();
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
  updatePauseSoundUI();
  showToast(sound.muted ? "Suara Dimatikan (Mute)" : "Suara Diaktifkan", sound.muted ? "alert" : "check");
}

if (btnToggleSound) btnToggleSound.addEventListener('click', toggleSound);

// Check Coordinates
function showCoordinates() {
  const dist = Math.floor(Math.hypot(playerState.x, playerState.y));
  showToast(`Posisi Armada: X:${Math.round(playerState.x)} Y:${Math.round(playerState.y)} (Jarak: ${dist}m)`, "compass");
}

if (btnCenterCamera) btnCenterCamera.addEventListener('click', showCoordinates);

/* ==========================================================================
   GAMEPLAY LOADING SCREEN & ENGINE PRE-WARMING
   Displays image artwork and loading bar only when entering/starting gameplay
   ========================================================================== */

const loadingScreenModal = document.getElementById('loadingScreenModal');
const loadingScreenImg = document.getElementById('loadingScreenImg');
const loadingProgressBar = document.getElementById('loadingProgressBar');
const loadingPercentText = document.getElementById('loadingPercentText');
const loadingStatusText = document.getElementById('loadingStatusText');

function updateLoadingProgress(percent, statusMsg) {
  if (loadingProgressBar) {
    loadingProgressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }
  if (loadingPercentText) {
    loadingPercentText.innerText = `${Math.round(percent)}%`;
  }
  if (loadingStatusText && statusMsg) {
    loadingStatusText.innerText = statusMsg;
  }
}

function showGameLoadingScreen(onComplete) {
  const modal = document.getElementById('loadingScreenModal');
  const img = document.getElementById('loadingScreenImg');

  if (!modal) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Randomize artwork for visual variety
  if (img) {
    const randomIdx = Math.floor(Math.random() * 4) + 1;
    img.src = `loadingscreen${randomIdx}.jpeg`;
  }

  updateLoadingProgress(0, "Mempersiapkan Kapal...");

  modal.classList.remove('hidden');
  void modal.offsetWidth;
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100');

  let current = 0;
  const targetTimeMs = 1200;
  const intervalMs = 40;
  const incrementPerTick = 100 / (targetTimeMs / intervalMs);

  const timer = setInterval(() => {
    current += incrementPerTick * (0.8 + Math.random() * 0.5);
    if (current >= 100) {
      current = 100;
      clearInterval(timer);
      updateLoadingProgress(100, "Siap Berlayar!");

      setTimeout(() => {
        if (typeof onComplete === 'function') onComplete();
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
          modal.classList.add('hidden');
        }, 500);
      }, 250);
    } else {
      let msg = "Mempersiapkan Kapal...";
      if (current > 35 && current <= 70) msg = "Menyesuaikan Arah Angin...";
      else if (current > 70) msg = "Membentangkan Layar...";
      updateLoadingProgress(Math.min(99, Math.round(current)), msg);
    }
  }, intervalMs);
}

// Silent engine asset pre-warming & cache initialization in background
async function runEnginePrewarming() {
  const imgSrcs = ['loadingscreen1.jpeg', 'loadingscreen2.jpeg', 'loadingscreen3.jpeg', 'loadingscreen4.jpeg'];
  try {
    await Promise.all(imgSrcs.map(src => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = src;
        if (img.decode) {
          img.decode().then(resolve).catch(resolve);
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
    }));
  } catch (err) {}

  if (typeof WORLD_ISLANDS !== 'undefined' && typeof getIslandCachedData === 'function') {
    for (let i = 0; i < WORLD_ISLANDS.length; i++) {
      getIslandCachedData(WORLD_ISLANDS[i]);
    }
  }

  if (typeof getMistSprite === 'function') {
    getMistSprite(false);
    getMistSprite(true);
  }
  if (typeof getCloudShadowSprite === 'function') {
    getCloudShadowSprite(false);
    getCloudShadowSprite(true);
  }

  if (typeof sound !== 'undefined') {
    sound.init();
  }
}

// Bootstrap silent background pre-warming on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runEnginePrewarming);
} else {
  runEnginePrewarming();
}

