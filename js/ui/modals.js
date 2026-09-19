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
const btnTabUpgradeCards = document.getElementById('btnTabUpgradeCards');
const btnTabUpgradeCutaway = document.getElementById('btnTabUpgradeCutaway');
const upgradeCardsContainer = document.getElementById('upgradeCardsContainer');
const upgradeCutawayContainer = document.getElementById('upgradeCutawayContainer');

let activeShipyardTab = 'cards';

// 6 Functional Ship Compartments matching UPGRADE_CONFIG
const SHIP_COMPARTMENTS = {
  relicSiphon: {
    key: 'relicSiphon',
    name: "Haluan & Ram Relik (Forecastle)",
    shortName: "Haluan & Ram",
    subtitle: "Moncong Depan, Tiang Cucur, Rantai Jangkar & Ram Pertempuran",
    lore: '"Moncong kapal diperkuat perunggu tebal dan ornamen naga abisal yang mampu meremukkan lambung lawan sekaligus menyedot esensi darah untuk memulihkan kapal."',
    iconKey: "relicSiphon",
    rect: { x: 640, y: 170, w: 150, h: 175 },
    badgePos: { x: 715, y: 250 },
    statName: "Hisapan Darah (Vampirism)",
    getStatDesc: (lvl) => {
      const cur = getStatValue('relicSiphon', lvl);
      const nxt = getStatValue('relicSiphon', lvl + 1);
      return lvl === 0 ? `Terkunci -> +${nxt.toFixed(1)} HP per pukulan` : `+${cur.toFixed(1)} HP -> +${nxt.toFixed(1)} HP per pukulan (+4.5)`;
    }
  },
  speed: {
    key: 'speed',
    name: "Geladak Utama & Layar (Main Deck & Rigging)",
    shortName: "Geladak & Layar",
    subtitle: "Tiang Layar Bertingkat, Tangga Tali, Roda Kemudi & Kompas",
    lore: '"Ketinggian tiang layar kayu ulin dan rajutan tambang sutra rami memungkinkan kapal membelah angin kencang dengan kelincahan manuver mematikan."',
    iconKey: "speed",
    rect: { x: 270, y: 25, w: 370, h: 185 },
    badgePos: { x: 455, y: 105 },
    statName: "Kecepatan Jelajah & Kelincahan",
    getStatDesc: (lvl) => {
      const cur = getStatValue('speed', lvl);
      const nxt = getStatValue('speed', lvl + 1);
      return `${cur.toFixed(2)} knot -> ${nxt.toFixed(2)} knot (+0.65 Spd)`;
    }
  },
  cannons: {
    key: 'cannons',
    name: "Geladak Meriam (Gun Deck & Powder Magazine)",
    shortName: "Geladak Meriam",
    subtitle: "Baterai Meriam Samping, Kereta Roda Kayu & Peti Amunisi",
    lore: '"Lantai tengah kapal dirancang meredam sentakan dentuman meriam kaliber berat, dilengkapi laci mesiu kedap air untuk tembakan broadside beruntun."',
    iconKey: "cannons",
    rect: { x: 270, y: 210, w: 370, h: 75 },
    badgePos: { x: 455, y: 248 },
    statName: "Daya Hancur & Jumlah Meriam",
    getStatDesc: (lvl) => {
      const curDmg = getStatValue('cannons', lvl);
      const nxtDmg = getStatValue('cannons', lvl + 1);
      const curBalls = Math.min(4, 1 + Math.floor(lvl / 2));
      const nxtBalls = Math.min(4, 1 + Math.floor((lvl + 1) / 2));
      return `${curBalls} Meriam (${curDmg} Dmg) -> ${nxtBalls} Meriam (${nxtDmg} Dmg)`;
    }
  },
  hull: {
    key: 'hull',
    name: "Palka Bawah & Ballast (Bilge & Lower Hold)",
    shortName: "Palka & Lambung",
    subtitle: "Gading Lambung Kayu Lapis, Pompa Air Ballast & Peti Kargo",
    lore: '"Dasar terdalam lambung kapal diperkuat balok kayu ulin lapis ganda dan batu ballast pemberat ombak, mencegah kebocoran fatal di laut ganas."',
    iconKey: "hull",
    rect: { x: 270, y: 285, w: 370, h: 75 },
    badgePos: { x: 455, y: 322 },
    statName: "Ketahanan Lambung (Max HP)",
    getStatDesc: (lvl) => {
      const cur = getStatValue('hull', lvl);
      const nxt = getStatValue('hull', lvl + 1);
      return `${cur} Max HP -> ${nxt} Max HP (+75 HP)`;
    }
  },
  stealthCamo: {
    key: 'stealthCamo',
    name: "Kabin Kapten & Navigasi (Captain's Cabin)",
    shortName: "Kabin Kapten",
    subtitle: "Meja Peta Kuno, Galeri Kaca Buritan & Dupa Siluman Kabut",
    lore: '"Ruang komando pribadi kapten menyimpan instrumen navigasi bahari dan pembakar dupa kabut gaib yang menyamarkan siluet kapal dari intaian musuh."',
    iconKey: "stealthCamo",
    rect: { x: 120, y: 160, w: 150, h: 80 },
    badgePos: { x: 195, y: 200 },
    statName: "Reduksi Deteksi (Stealth)",
    getStatDesc: (lvl) => {
      const cur = Math.round((1 - getStatValue('stealthCamo', lvl)) * 100);
      const nxt = Math.round((1 - getStatValue('stealthCamo', lvl + 1)) * 100);
      return `${cur}% Kamuflase -> ${nxt}% Kamuflase (-12% Deteksi)`;
    }
  },
  rearDefense: {
    key: 'rearDefense',
    name: "Geladak Buritan & Ranjau (Stern Castle & Mine Station)",
    shortName: "Buritan & Ranjau",
    subtitle: "Saluran Luncur Ranjau, Katrol Derek & Meriam Putar Belakang",
    lore: '"Menara buritan bertingkat mengawasi titik buta kapal, dilengkapi pelontar mekanik untuk menebar ranjau mesiu berduri bagi musuh yang membuntuti."',
    iconKey: "rearDefense",
    rect: { x: 120, y: 240, w: 150, h: 110 },
    badgePos: { x: 195, y: 295 },
    statName: "Ranjau & Meriam Belakang",
    getStatDesc: (lvl) => {
      const cur = getStatValue('rearDefense', lvl);
      const nxt = getStatValue('rearDefense', lvl + 1);
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
  const scaleX = 880 / w;
  const scaleY = 440 / h;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
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

// Draw the master architectural cutaway schematic on the HTML5 canvas
function renderShipCutaway() {
  if (!shipCutawayCanvas || !upgradeModal || !upgradeModal.classList.contains('modal-active')) return;
  const ctx = shipCutawayCanvas.getContext('2d');
  if (!ctx) return;

  const rect = shipCutawayCanvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const targetW = Math.round(rect.width * dpr);
  const targetH = Math.round(rect.height * dpr);

  if (shipCutawayCanvas.width !== targetW || shipCutawayCanvas.height !== targetH) {
    shipCutawayCanvas.width = targetW;
    shipCutawayCanvas.height = targetH;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const scaleCanvasX = rect.width / 880;
  const scaleCanvasY = rect.height / 440;
  ctx.scale(scaleCanvasX, scaleCanvasY);

  cutawayState.animTime += 0.035;
  const t = cutawayState.animTime;

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
    const isSelected = (cutawayState.selectedKey === comp.key);
    const isHovered = (cutawayState.hoveredKey === comp.key);
    const lvl = (playerState.upgrades && playerState.upgrades[comp.key]) || 0;
    const conf = UPGRADE_CONFIG[comp.key];
    const isMax = lvl >= conf.maxLevel;
    const goldCost = isMax ? 0 : Math.floor(conf.baseCost * Math.pow(conf.costMult, Math.max(0, lvl - (comp.key === 'rearDefense' ? 0 : 1))));
    const bloodCost = (!isMax && lvl >= conf.bloodCostStart) ? (lvl - conf.bloodCostStart + 1) * 3 : 0;
    const canAfford = !isMax && (playerState.gold >= goldCost) && (playerState.bloodEssence >= bloodCost);

    ctx.save();

    // Compartment interior chamber base fill
    ctx.fillStyle = isSelected 
      ? 'rgba(245, 158, 11, 0.14)' 
      : (isHovered ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 23, 42, 0.35)');
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // Deck plank floor and boundary joists
    ctx.strokeStyle = isSelected 
      ? '#fbbf24' 
      : (isHovered ? '#f59e0b' : 'rgba(217, 119, 6, 0.45)');
    ctx.lineWidth = isSelected ? 2.2 : (isHovered ? 1.8 : 1.2);
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
      // 2. GUN DECK (cannons)
      const numGuns = Math.min(3, 1 + Math.floor(cannonLvl / 2));
      for (let g = 0; g < numGuns; g++) {
        const gx = r.x + 45 + g * 110;
        const gy = r.y + 45;

        // Wood gun carriage
        ctx.fillStyle = '#78350f';
        ctx.fillRect(gx - 14, gy + 8, 28, 12);
        // Carriage wheels
        ctx.fillStyle = '#1c0d06';
        ctx.beginPath();
        ctx.arc(gx - 10, gy + 20, 5, 0, Math.PI * 2);
        ctx.arc(gx + 10, gy + 20, 5, 0, Math.PI * 2);
        ctx.fill();

        // Cannon barrel (longer & bronze as level increases)
        ctx.fillStyle = cannonLvl >= 5 ? '#d97706' : (cannonLvl >= 3 ? '#92400e' : '#1e293b');
        ctx.fillRect(gx - 18, gy - 2, 34, 10);
        ctx.fillRect(gx + 14, gy, 6, 6);

        // Cannon recoil ropes
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx - 12, gy + 12);
        ctx.lineTo(gx - 22, gy + 22);
        ctx.stroke();
      }

      // Stack of cannonballs & powder kegs
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(r.x + 335, r.y + 60, 4.5, 0, Math.PI * 2);
      ctx.arc(r.x + 344, r.y + 60, 4.5, 0, Math.PI * 2);
      ctx.arc(r.x + 339.5, r.y + 52, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Powder keg
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(r.x + 348, r.y + 48, 12, 16);
      ctx.strokeStyle = '#fde047';
      ctx.strokeRect(r.x + 348, r.y + 48, 12, 16);

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
  for (let i = cutawayState.particles.length - 1; i >= 0; i--) {
    const p = cutawayState.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.035;
    if (p.life <= 0) {
      cutawayState.particles.splice(i, 1);
      continue;
    }
    const alpha = p.life / p.maxLife;
    ctx.fillStyle = p.color.replace(')', `, ${alpha.toFixed(2)})`).replace('rgb', 'rgba');
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }

  // Loop next frame
  if (upgradeModal && upgradeModal.classList.contains('modal-active')) {
    cutawayAnimationId = requestAnimationFrame(renderShipCutaway);
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

// Unified selector for ship compartments ensuring immediate visual synchronization
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

// Switch between Mobile Cards View and Architectural Cutaway View
function switchShipyardTab(tab) {
  activeShipyardTab = tab;
  const isCards = (tab === 'cards');

  if (btnTabUpgradeCards && btnTabUpgradeCutaway) {
    if (isCards) {
      btnTabUpgradeCards.className = 'flex-1 py-2 px-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer bg-amber-500 text-slate-950 shadow-md';
      btnTabUpgradeCutaway.className = 'flex-1 py-2 px-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-amber-300';
    } else {
      btnTabUpgradeCutaway.className = 'flex-1 py-2 px-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer bg-amber-500 text-slate-950 shadow-md';
      btnTabUpgradeCards.className = 'flex-1 py-2 px-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-amber-300';
    }
  }

  if (upgradeCardsContainer) {
    upgradeCardsContainer.classList.toggle('hidden', !isCards);
  }
  if (upgradeCutawayContainer) {
    upgradeCutawayContainer.classList.toggle('hidden', isCards);
  }

  if (isCards) {
    stopCutawayLoop();
    renderUpgradeCardsView();
  } else {
    startCutawayLoop();
    renderCompartmentChips();
    renderCompartmentDetail(cutawayState.selectedKey);
  }
}

// Render the 6 Touch-Friendly Mobile Upgrade Cards
function renderUpgradeCardsView() {
  if (!upgradeCardsContainer) return;
  upgradeCardsContainer.innerHTML = '';

  for (const comp of Object.values(SHIP_COMPARTMENTS)) {
    const key = comp.key;
    const lvl = (playerState.upgrades && playerState.upgrades[key]) || 0;
    const conf = UPGRADE_CONFIG[key];
    const isMax = lvl >= conf.maxLevel;

    const goldCost = isMax ? 0 : Math.floor(conf.baseCost * Math.pow(conf.costMult, Math.max(0, lvl - (key === 'rearDefense' ? 0 : 1))));
    const bloodCost = (!isMax && lvl >= conf.bloodCostStart) ? (lvl - conf.bloodCostStart + 1) * 3 : 0;
    const hasGold = playerState.gold >= goldCost;
    const hasBlood = playerState.bloodEssence >= bloodCost;
    const canAfford = !isMax && hasGold && hasBlood;

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
            <h3 class="font-cinzel text-xs sm:text-sm font-bold text-slate-100">${comp.name}</h3>
            <p class="text-[10px] sm:text-[10.5px] text-slate-400 leading-tight mt-0.5">${comp.subtitle}</p>
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
          <span>Tingkat Efektivitas</span>
          <span class="text-amber-400 font-bold">${lvl} / ${conf.maxLevel}</span>
        </div>
        <div class="flex items-center gap-1 w-full">
          ${notchesHtml}
        </div>
      </div>

      <!-- Stat Comparison Box -->
      <div class="bg-slate-900/80 rounded-xl px-2.5 py-1.5 border border-white/5 flex items-center justify-between text-xs">
        <span class="text-[9.5px] uppercase tracking-wider font-bold text-slate-400">${comp.statName}:</span>
        <span class="text-[11px] font-bold text-amber-300 font-mono">
          ${isMax ? getStatValue(key, lvl) + ' (Maksimal)' : comp.getStatDesc(lvl)}
        </span>
      </div>

      <!-- Footer: Cost & 1-Tap Upgrade Button -->
      <div class="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
        <!-- Cost badges -->
        <div class="flex items-center gap-2 text-[11px] font-mono font-bold">
          ${!isMax ? `
            <div class="flex items-center gap-1 ${hasGold ? 'text-amber-400' : 'text-rose-400'}">
              <span class="w-2 h-2 rounded-full ${hasGold ? 'bg-amber-400' : 'bg-rose-500'} inline-block shadow-sm"></span>
              <span>${goldCost} Koin</span>
            </div>
            ${bloodCost > 0 ? `
              <div class="flex items-center gap-1 ${hasBlood ? 'text-rose-300' : 'text-rose-500'}">
                <span class="w-2 h-2 rounded-full ${hasBlood ? 'bg-rose-500' : 'bg-rose-700'} inline-block shadow-sm"></span>
                <span>${bloodCost} Darah</span>
              </div>
            ` : ''}
          ` : '<span class="text-amber-400/80 text-[10.5px] font-bold font-cinzel">Tingkat Puncak Armada</span>'}
        </div>

        <!-- 1-Tap Direct Upgrade Action Button -->
        <button type="button" class="btn-direct-upgrade px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold font-cinzel transition tracking-wide flex items-center justify-center gap-1.5 shadow-md ${
          isMax 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
            : (canAfford 
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 border border-amber-300 active:scale-95 shadow-amber-900/40 cursor-pointer' 
                : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/10 opacity-70')
        }" ${!canAfford ? 'disabled' : ''} data-key="${key}">
          <svg class="w-3.5 h-3.5 ${isMax ? 'hidden' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>
          <span>${isMax ? 'SELESAI' : (canAfford ? 'TINGKATKAN' : 'KURANG')}</span>
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

// Update the Quick Repair button in the Shipyard footer
function updateShipyardRepairButton() {
  if (!btnRepairShip) return;
  const maxHp = getStatValue('hull', playerState.upgrades.hull);
  const roundedHp = Math.round(playerState.hp);
  if (roundedHp >= maxHp) {
    btnRepairShip.className = 'bg-slate-800/80 text-emerald-400/70 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-500/20 cursor-default select-none shadow-sm';
    btnRepairShip.innerHTML = `
      <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      <span>Lambung Prima (100%)</span>
    `;
    btnRepairShip.disabled = true;
  } else {
    btnRepairShip.className = 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl active:scale-95 transition flex items-center gap-1.5 shadow-md cursor-pointer';
    btnRepairShip.innerHTML = `
      <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      <span>Perbaiki Lambung (15 Koin)</span>
      <kbd class="kbd-badge bg-black/40 text-[9px] hidden sm:inline-block">R</kbd>
    `;
    btnRepairShip.disabled = false;
  }
}

// Attach Tab Switcher Listeners
if (btnTabUpgradeCards) btnTabUpgradeCards.addEventListener('click', () => switchShipyardTab('cards'));
if (btnTabUpgradeCutaway) btnTabUpgradeCutaway.addEventListener('click', () => switchShipyardTab('cutaway'));

// Render the 6 Touch-Friendly Selector Chips underneath the canvas
function renderCompartmentChips() {
  if (!compartmentChipsBar) return;
  compartmentChipsBar.innerHTML = '';

  for (const comp of Object.values(SHIP_COMPARTMENTS)) {
    const lvl = (playerState.upgrades && playerState.upgrades[comp.key]) || 0;
    const conf = UPGRADE_CONFIG[comp.key];
    const isMax = lvl >= conf.maxLevel;
    const goldCost = isMax ? 0 : Math.floor(conf.baseCost * Math.pow(conf.costMult, Math.max(0, lvl - (comp.key === 'rearDefense' ? 0 : 1))));
    const bloodCost = (!isMax && lvl >= conf.bloodCostStart) ? (lvl - conf.bloodCostStart + 1) * 3 : 0;
    const canAfford = !isMax && (playerState.gold >= goldCost) && (playerState.bloodEssence >= bloodCost);
    const isSelected = (cutawayState.selectedKey === comp.key);

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
      <span class="text-[11px] font-medium">${comp.shortName}</span>
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
  const comp = SHIP_COMPARTMENTS[key] || SHIP_COMPARTMENTS.cannons;
  const actualKey = comp.key;
  cutawayState.selectedKey = actualKey;
  const conf = UPGRADE_CONFIG[actualKey];
  const lvl = (playerState.upgrades && playerState.upgrades[actualKey]) || 0;
  const isMax = lvl >= conf.maxLevel;

  const goldCost = isMax ? 0 : Math.floor(conf.baseCost * Math.pow(conf.costMult, Math.max(0, lvl - (actualKey === 'rearDefense' ? 0 : 1))));
  const bloodCost = (!isMax && lvl >= conf.bloodCostStart) ? (lvl - conf.bloodCostStart + 1) * 3 : 0;
  const hasGold = playerState.gold >= goldCost;
  const hasBlood = playerState.bloodEssence >= bloodCost;
  const canAfford = !isMax && hasGold && hasBlood;

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

  compartmentDetailPanel.innerHTML = `
    <!-- Header: Title, Category & Level Status -->
    <div class="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
      <div class="flex items-center gap-2.5">
        <div class="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300 shrink-0 shadow-inner">
          ${SVG_ICONS[comp.iconKey] || SVG_ICONS.hull}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-cinzel text-sm sm:text-base font-bold text-slate-100">${comp.name}</h3>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              isMax ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-amber-300 border border-amber-500/30'
            }">
              ${isMax ? 'TINGKAT MAKSIMAL' : `Level ${lvl} / ${conf.maxLevel}`}
            </span>
          </div>
          <p class="text-[10.5px] text-slate-400 mt-0.5">${comp.subtitle}</p>
        </div>
      </div>
    </div>

    <!-- Segmented Level Progress Bar -->
    <div class="space-y-1">
      <div class="flex justify-between text-[10px] text-slate-400">
        <span>Tahap Arsitektur</span>
        <span class="font-mono text-amber-400 font-bold">${lvl} dari ${conf.maxLevel} Tingkat</span>
      </div>
      <div class="flex items-center gap-1.5 w-full">
        ${notchesHtml}
      </div>
    </div>

    <!-- Lore Quote -->
    <p class="text-[10px] sm:text-[10.5px] text-slate-300 italic bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed">
      ${comp.lore}
    </p>

    <!-- Stat Differential Comparison Card -->
    <div class="bg-slate-900/90 rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-3 text-xs">
      <div class="flex flex-col">
        <span class="text-[9.5px] uppercase tracking-wider font-bold text-slate-400">${comp.statName}</span>
        <span class="text-xs font-bold text-amber-300 font-mono mt-0.5">
          ${isMax ? getStatValue(actualKey, lvl) + ' (Maksimal)' : comp.getStatDesc(lvl)}
        </span>
      </div>
      <div class="text-right">
        <span class="text-[9.5px] uppercase tracking-wider text-slate-400">Efek Kapal</span>
        <div class="text-[10.5px] text-emerald-400 font-semibold mt-0.5">
          ${isMax ? 'Performa Optimal' : '+Peningkatan Efektif'}
        </div>
      </div>
    </div>

    <!-- Action Upgrade Button & Resource Cost Row -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
      <!-- Cost breakdown -->
      <div class="flex items-center gap-3 text-xs font-mono font-bold">
        ${!isMax ? `
          <div class="flex items-center gap-1 ${hasGold ? 'text-amber-400' : 'text-rose-400'}">
            <span class="w-2.5 h-2.5 rounded-full ${hasGold ? 'bg-amber-400' : 'bg-rose-500'} inline-block shadow-sm"></span>
            <span>${goldCost} Koin</span>
          </div>
          ${bloodCost > 0 ? `
            <div class="flex items-center gap-1 ${hasBlood ? 'text-rose-300' : 'text-rose-500'}">
              <span class="w-2.5 h-2.5 rounded-full ${hasBlood ? 'bg-rose-500' : 'bg-rose-700'} inline-block shadow-sm"></span>
              <span>${bloodCost} Darah</span>
            </div>
          ` : ''}
        ` : '<span class="text-amber-400 text-xs font-bold">Kompartemen ini telah mencapai potensi puncak armada!</span>'}
      </div>

      <!-- Upgrade Button -->
      <button id="btnPerformUpgrade" type="button" class="px-5 py-2 rounded-xl text-xs font-bold font-cinzel transition tracking-wide flex items-center justify-center gap-2 shadow-lg ${
        isMax 
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
          : (canAfford 
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 border border-amber-300 active:scale-95 shadow-amber-900/40 cursor-pointer' 
              : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/10 opacity-70')
      }" ${!canAfford ? 'disabled' : ''}>
        ${isMax ? 'TINGKAT MAKSIMAL' : (canAfford ? `TINGKATKAN KE LV.${lvl + 1}` : 'SUMBER DAYA TIDAK CUKUP')}
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

  const goldCost = Math.floor(conf.baseCost * Math.pow(conf.costMult, Math.max(0, lvl - (key === 'rearDefense' ? 0 : 1))));
  const bloodCost = lvl >= conf.bloodCostStart ? (lvl - conf.bloodCostStart + 1) * 3 : 0;

  if (playerState.gold >= goldCost && playerState.bloodEssence >= bloodCost) {
    playerState.gold -= goldCost;
    playerState.bloodEssence -= bloodCost;
    playerState.upgrades[key]++;

    // If upgrading hull, reward player with immediate +75 HP heal matching the increased max capacity!
    if (key === 'hull') {
      const newMaxHp = getStatValue('hull', playerState.upgrades.hull);
      playerState.hp = Math.min(newMaxHp, playerState.hp + 75);
    }

    // Spawn 25 celebration sparkle particles around the upgraded compartment
    const r = comp.rect;
    for (let p = 0; p < 25; p++) {
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

    if (typeof sound !== 'undefined' && typeof sound.playShipyardHammer === 'function') {
      sound.playShipyardHammer();
    } else {
      sound.playLoot();
    }
    showToast(`${comp.name} ditingkatkan ke Lv.${playerState.upgrades[key]}!`, "check");
    saveGame();

    // Re-render entire shipyard UI and detail card instantly in place!
    renderUpgradeUI();
    updateHUD();
  } else {
    showToast("Emas atau Esensi Darah Anda tidak mencukupi untuk peningkatan ini.", "alert");
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
    const portName = playerState.dockedPortName || "Dermaga Nusa Damai";
    shipyardLocationLabel.innerText = `Dermaga Berlabuh: ${portName}`;
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
    if (key !== cutawayState.hoveredKey) {
      cutawayState.hoveredKey = key;
      if (cutawayHoverLabel) {
        if (key && SHIP_COMPARTMENTS[key]) {
          cutawayHoverLabel.innerText = SHIP_COMPARTMENTS[key].shortName;
          cutawayHoverLabel.classList.remove('hidden');
        } else {
          cutawayHoverLabel.innerText = "Pilih Kompartemen";
        }
      }
    }
  });

  shipCutawayCanvas.addEventListener('pointerleave', () => {
    cutawayState.hoveredKey = null;
    if (cutawayHoverLabel) cutawayHoverLabel.innerText = "Pilih Kompartemen";
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
    showToast("Galangan Kapal hanya melayani di dermaga pelabuhan! Berlabuhlah di Nusa Damai, Pasar, atau Pulau Taklukan.", "alert");
    return;
  }

  closeLoreModal();
  closeHelpModal();
  closeMapModal();
  switchShipyardTab(activeShipyardTab);
  renderUpgradeUI();
  upgradeModal.classList.remove('modal-enter', 'hidden');
  upgradeModal.classList.add('modal-active');
  isGamePaused = true;
  if (activeShipyardTab === 'cutaway') {
    startCutawayLoop();
  }
}

function closeUpgradeModal() {
  if (!upgradeModal) return;
  upgradeModal.classList.remove('modal-active');
  upgradeModal.classList.add('modal-enter', 'hidden');
  isGamePaused = false;
  lastTime = performance.now();
  stopCutawayLoop();
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

// Interactive Sea Map Navigation Controls & State
const btnMapZoomIn = document.getElementById('btnMapZoomIn');
const btnMapZoomOut = document.getElementById('btnMapZoomOut');
const btnMapCenterShip = document.getElementById('btnMapCenterShip');
const btnMapResetView = document.getElementById('btnMapResetView');
const mapZoomBadge = document.getElementById('mapZoomBadge');

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
  pinchWorldY: 0
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
      mapUpgradeBtnText.innerText = `Tingkatkan Peta (${nextCfg.cost} Koin)`;
      if (playerState.gold >= nextCfg.cost) {
        btnUpgradeMap.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        btnUpgradeMap.classList.add('opacity-50', 'cursor-not-allowed');
      }
    }
  }

  updateMapZoomBadge();
  renderSeaMapCanvas();
}

/* ==========================================================================
   PROCEDURAL VECTOR EMBLEMS FOR SEA MAP (100% VECTOR PATHS - NO EMOJIS)
   ========================================================================== */

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
    } else if (isl.isConquered) {
      drawMapConqueredFlagIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.clan === 'blood' || isl.isFlesh) {
      drawMapBloodClanIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.clan === 'mist') {
      drawMapMistClanIcon(mctx, mapX, mapY, dotRadius);
    } else if (isl.clan === 'iron') {
      drawMapIronClanIcon(mctx, mapX, mapY, dotRadius);
    } else {
      drawMapGoldClanIcon(mctx, mapX, mapY, dotRadius);
    }

    // Island Name (dynamically scaled font)
    const fontPx = Math.max(7, Math.min(11, 7.5 * Math.sqrt(seaMapState.zoom || 1.0)));
    mctx.font = `bold ${fontPx}px "Cinzel", sans-serif`;
    mctx.fillStyle = '#f8fafc';
    mctx.textAlign = 'center';
    mctx.fillText(isl.name, mapX, mapY - dotRadius - 3);

    // Conquered Tag
    if (isl.isConquered && !isl.isHomePort) {
      mctx.font = `bold ${Math.max(6, fontPx - 1)}px "Cinzel", sans-serif`;
      mctx.fillStyle = '#facc15';
      mctx.fillText("Takluk", mapX, mapY + dotRadius + 8);
    }
  });

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
    showToast(`Emas tidak cukup untuk peningkatan peta (Butuh ${nextCfg.cost} Koin).`, "alert");
  }
}

/* ==========================================================================
   INTERACTIVE SEA MAP EVENT HANDLERS (Pinch-to-zoom, Pan, Mouse Drag & Wheel)
   ========================================================================== */

function initSeaMapInteractions() {
  if (!seaMapCanvas) return;

  // 1. Mouse Drag Pan
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;

  seaMapCanvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isMouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    seaMapState.lastPanX = seaMapState.panX;
    seaMapState.lastPanY = seaMapState.panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    seaMapState.panX = seaMapState.lastPanX + (e.clientX - mouseStartX);
    seaMapState.panY = seaMapState.lastPanY + (e.clientY - mouseStartY);
  });

  window.addEventListener('mouseup', () => {
    if (isMouseDown) {
      isMouseDown = false;
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
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

  // 3. Touch Drag (1 Finger) & Pinch-to-Zoom (2 Fingers)
  seaMapCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      seaMapState.isDragging = true;
      seaMapState.isPinching = false;
      seaMapState.dragStartX = e.touches[0].clientX;
      seaMapState.dragStartY = e.touches[0].clientY;
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
    } else if (e.touches.length >= 2) {
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
      seaMapState.panX = seaMapState.lastPanX + (curX - seaMapState.dragStartX);
      seaMapState.panY = seaMapState.lastPanY + (curY - seaMapState.dragStartY);
    }
  }, { passive: false });

  const endTouch = (e) => {
    if (e.touches.length === 0) {
      seaMapState.isDragging = false;
      seaMapState.isPinching = false;
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
    } else if (e.touches.length === 1) {
      seaMapState.isPinching = false;
      seaMapState.isDragging = true;
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
    if (typeof sound !== 'undefined' && typeof sound.playRepair === 'function') {
      sound.playRepair();
    } else {
      sound.playSplash();
    }
    showToast("Kapal diperbaiki sepenuhnya! (-15 Koin)", "anchor");
    updateHUD();
    updateShipyardRepairButton();
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

