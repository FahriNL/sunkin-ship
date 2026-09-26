/* ==========================================================================
   LAUT DARAH - GAME CONFIGURATION DATA
   Upgrades, Clans, Lore, Islands, & Biome Constants (Emoji-Free / SVG Powered)
   ========================================================================== */

let currentSaveSlot = parseInt(localStorage.getItem('SUNKEN_SHIP_ACTIVE_SLOT') || '1', 10);
if (isNaN(currentSaveSlot) || currentSaveSlot < 1 || currentSaveSlot > 3) currentSaveSlot = 1;

function getSaveSlotKey(slot = currentSaveSlot) {
  return `SUNKEN_SHIP_SAVE_SLOT_${slot}`;
}
function getWorldGenSlotKey(slot = currentSaveSlot) {
  return `SUNKEN_SHIP_WORLD_GEN_SLOT_${slot}`;
}

// Automatic Migration from legacy BLOOD_SEA_SAVE_DATA_v2 to Slot 1
try {
  if (!localStorage.getItem('SUNKEN_SHIP_SAVE_SLOT_1') && localStorage.getItem('BLOOD_SEA_SAVE_DATA_v2')) {
    localStorage.setItem('SUNKEN_SHIP_SAVE_SLOT_1', localStorage.getItem('BLOOD_SEA_SAVE_DATA_v2'));
  }
} catch (e) {
  console.warn("Save slot migration error:", e);
}

const SAVE_KEY = 'BLOOD_SEA_SAVE_DATA_v2'; // fallback legacy reference
const SETTINGS_KEY = 'BLOOD_SEA_SETTINGS_v2';
const DIFFICULTY_STORAGE_KEY = 'BLOOD_SEA_DIFFICULTY_v2';
const WORLD_GEN_KEY = 'BLOOD_SEA_WORLD_GEN_v2';
const LANGUAGE_STORAGE_KEY = 'SUNKEN_SHIP_LANGUAGE';

let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'id';
if (currentLanguage !== 'id' && currentLanguage !== 'en') currentLanguage = 'id';

// Comprehensive Localization Dictionary (Bahasa Indonesia & English)
const TRANSLATIONS = {
  id: {
    // Brand & Main Menu
    gameTitle: "SUNKEN SHIP",
    diffLabel: "TINGKAT KESULITAN:",
    playBtnText: "BERLAYAR SEKARANG",
    playBtnSub: "PILIH SLOT & JELAJAHI SAMUDRA",
    codexBtnText: "LOG & BESTIARY",
    codexBtnTag: "DOKUMEN HISTORIS",
    settingsBtnText: "PENGATURAN",
    settingsBtnTag: "AUDIO & GRAFIS",
    controlsBtnText: "PANDUAN KONTROL",
    controlsBtnTag: "NAVIGASI & MERIAM",

    // Save Slots
    saveSlotsTitle: "SLOT PERJALANAN EKSPEDISI",
    saveSlotsSubtitle: "Pilih slot data untuk memulai atau melanjutkan pelayaran",
    slotEmptyBadge: "KOSONG",
    slotActiveBadge: "AKTIF",
    slotEmptyTitle: "Slot Kosong",
    slotEmptyDesc: "Siap untuk petualangan baru",
    newGame: "MULAI BARU",
    continueGame: "LANJUTKAN",
    deleteSlot: "HAPUS",
    shipLabel: "Kapal:",
    tierLabel: "Tingkat:",
    hullLabel: "Lambung:",
    wealthLabel: "Kekayaan:",
    worldLabel: "Dunia:",
    goldUnit: "Emas",
    bloodUnit: "Darah",
    confirmDeleteTitle: "HAPUS SLOT {slot}?",
    confirmDeleteDesc: "Apakah Anda yakin ingin menghapus Slot {slot}? Seluruh data petualangan dan progres kapal pada slot ini akan dihapus secara permanen.",
    cancel: "BATAL",
    deleteConfirm: "HAPUS PERMANEN",

    // Pause Menu
    pauseTitle: "PERMAINAN DIHENTIKAN",
    pauseSubtitle: "Kapal lego jangkar di samudra luas",
    pauseFleetStatus: "STATUS ARMADA",
    pauseHullIntegrity: "INTEGRITAS LAMBUNG",
    pauseCargoCapacity: "KAPASITAS KARGO",
    pauseWorldGen: "DUNIA LAUT DARAH",
    pauseResume: "LANJUTKAN BERLAYAR (ESC)",
    pauseInventory: "INVENTARIS & CRAFTING (I)",
    pauseMap: "PETA SAMUDRA & KABUT (M)",
    pauseCodex: "LOG HISTORIS & KLAN (L)",
    pauseSettings: "PENGATURAN SUARA & GRAFIS",
    pauseControls: "PANDUAN KONTROL & KEMUDI (H)",
    pauseRestart: "MULAI ULANG PERMAINAN",
    pauseReturnMenu: "KEMBALI KE MENU UTAMA",

    // Settings Modal
    settingsTitle: "PENGATURAN",
    settingsSubtitle: "Audio, Grafis & Kontrol",
    tabAudio: "SUARA",
    tabGraphics: "GRAFIS",
    tabGameplay: "GAMEPLAY & BAHASA",

    // Audio Settings
    masterVol: "Volume Utama (Master Volume)",
    sfxVol: "Efek Suara (SFX Meriam, Ledakan & Tabrakan)",
    seaAmbienceVol: "Suara Laut (Sea Ambience & Desau Angin)",
    seaAmbienceDesc: "Gemuruh deburan ombak dan desau angin samudra purba.",
    battleMusicVol: "Musik Pertempuran & Badai (Dynamic Battle Music)",
    muteAll: "Senyapkan Semua Suara (Mute All)",
    muteAllDesc: "Nonaktifkan seluruh suara dan musik permainan",

    // Graphics Settings
    graphicsPreset: "Preset Kualitas Grafis",
    graphicsBuffer: "DPR & Rendering Buffer",
    qualityHigh: "TINGGI",
    qualityHighDesc: "DPR 2.0x • Partikel Penuh • Cahaya Halus (60 FPS)",
    qualityMed: "SEIMBANG",
    qualityMedDesc: "DPR 1.5x • Keseimbangan Visual & Performa",
    qualityLow: "HEMAT BATERAI",
    qualityLowDesc: "DPR 1.0x • Ringan GPU • Suhu Dingin di Ponsel",
    fullscreenMode: "Mode Layar Penuh (Fullscreen)",
    fullscreenDesc: "Buka permainan dalam layar penuh tanpa gangguan browser",
    btnFullscreenToggle: "Aktifkan",
    autoFullscreen: "Auto Fullscreen Saat Mulai Main",
    autoFullscreenDesc: "Otomatis masuk layar penuh saat klik Berlayar",
    screenShake: "Efek Guncangan Layar (Screen Shake)",
    screenShakeDesc: "Getaran kamera saat ledakan & benturan lambung",

    // Gameplay & Language
    languageTitle: "Bahasa Permainan (Language)",
    languageDesc: "Pilih bahasa pengantar antarmuka dan narasi.",
    difficultyTitle: "Tingkat Kesulitan Ekspedisi",
    diffEasy: "Mudah",
    diffMedium: "Normal",
    diffHard: "Sulit",
    controlsGuideTitle: "Panduan Kontrol PC & Sentuh",
    controlsGuideDesc: "Lihat diagram tombol kemudi, hotkey meriam, dan gestur layar",
    btnOpenGuide: "Buka Panduan",
    saveAndReturn: "SIMPAN & KEMBALI",

    // Difficulty Descriptions
    diffEasyDesc: "Petualangan santai: Kerusakan diterima -25%, damage meriam +20%, hadiah Koin & Darah +25%.",
    diffMediumDesc: "Keseimbangan standar ekspedisi Laut Darah saat ini.",
    diffHardDesc: "Kutukan Palung: Kerusakan diterima +35%, musuh lebih tangguh & agresif, hadiah Koin & Darah +50%.",

    // Help & Lore
    loreModalTitle: "KODEX 6 TINGKAT ANCAMAN SAMUDRA",
    loreModalSubtitle: "Hierarki faksi laut & teror palung abisal dari yang termudah hingga apex predator",
    helpModalTitle: "PANDUAN KONTROL BAHARI PC",
    helpModalSubtitle: "Kemudi kapal, laju layar, dan persenjataan keyboard & mouse",
    helpCloseEsc: "Tekan Esc untuk menutup panduan",

    // Loading & Game Over
    loadingStatus: "Memuat Samudra...",
    gameOverTitle: "KAPAL KARAM",
    gameOverReason: "Armada Anda telah karam di kedalaman samudra.",
    gameOverPermaText: "",
    statMaxDist: "Jarak Terjauh:",
    statKills: "Musuh Dikalahkan:",
    statSalvages: "Bangkai Diselamatkan:",
    respawnBtn: "RESPAWN",
    cinematicCredits: [
      { subtitle: "KARYA PERTAMA", title: "Dibuat oleh Iyodihhh" },
      { subtitle: "TEKNOLOGI AGENTIK", title: "Vibe coded with Antigravity" },
      { subtitle: "TATA SUARA & MUSIK", title: "Procedural Web Audio" },
      { subtitle: "SAMUDRA TAK BERUJUNG", title: "Selamat Berlayar" }
    ],

    // In-game Toasts & HUD
    toastGameStarted: "Petualangan Dimulai! Selamat Berlayar.",
    toastGameResumed: "Selamat Datang Kembali, Kapten!",
    toastSaved: "Progres Disimpan!",
    toastSlotDeleted: "Slot {slot} berhasil dihapus.",
    toastSettingsSaved: "Pengaturan Berhasil Disimpan",

    // In-game HUD & Telemetry
    throttleNeutral: "Netral",
    throttleClear: "Layar Bersih",
    throttleHalf: "Layar Setengah",
    throttleFull: "Layar Penuh",
    throttleStealth: "Layar Senyap",
    throttleBoost: "Laju Cepat",
    hullFirm: "Lambung Kokoh",
    stealthSafe: "Aman",
    stealthWarn: "Waspada",
    stealthDetected: "Terdeteksi!",
    hudPauseBtn: "JEDA",
    hudMapBtn: "PETA",
    hudBagBtn: "TAS",
    hudCargoTitle: "KARGO",
    hudCargoHoldTooltip: "Buka Pundi Kargo & Bengkel [I]",
    hudSailingSpeed: "Kecepatan Berlayar",
    hudGoldTitle: "Koin Emas Rampasan",
    hudBloodTitle: "Darah Abisal",
    spyglassTitle: "PENGINTAI CAKRAWALA",
    spyglassExit: "[ESC] / [F] KELUAR TEROPONG",
    divingSalvage: "Menyelam Bangkai...",

    // Hotbars & Controls
    hotbarSalvo: "SALVO",
    hotbarMine: "BURITAN",
    hotbarSalvage: "KATROL",
    hotbarSpyglass: "TEROPONG",
    hotbarRepair: "REPARASI",
    hotbarSalvoTip: "Tembakan Meriam Salvo Lambung [SPACE]",
    hotbarMineTip: "Peluncur Ranjau Buritan & Meriam Belakang [2]",
    hotbarSalvageTip: "Katrol Derek Bangkai Kapal & Penarik Peti [E]",
    hotbarSpyglassTip: "Teropong Samudra Jarak Jauh [F]",
    hotbarRepairTip: "Reparasi Lambung Cepat (15 Koin) [R]",
    pcSteer: "Kemudi",
    pcBoost: "Laju Cepat",
    pcStealth: "Siluman",
    pcSpeedLabel: "LAJU:",
    mobileSalvo: "SALVO",
    mobileRepair: "REPAIR",
    mobileMineTip: "Ranjau Buritan [2]",
    mobileSalvageTip: "Katrol Derek [E]",
    mobileSpyglassTip: "Teropong Samudra [F]",
    mobileFireTip: "Tembak Meriam Broadside [Space]",

    // Contextual Dock Prompt
    dockPromptTitle: "GALANGAN KAPAL",
    dockPromptSub: "Berlabuh di Pelabuhan",
    dockedAt: "Berlabuh di {port}",

    // Weather Intel
    weatherIntelTitle: "Kondisi Samudra",
    weatherForecast: "Prakiraan Cuaca Samudra",
    weatherRemaining: "{time} tersisa",
    weatherClearName: "Laut Tenang",
    weatherClearDesc: "Angin sepoi-sepoi dan perairan bersahabat. Kemudi stabil tanpa hambatan cuaca.",
    weatherOvercastName: "Langit Berawan",
    weatherOvercastDesc: "Awan tebal meredupkan cakrawala samudra.",
    weatherRainName: "Hujan Samudra",
    weatherRainDesc: "Rintik hujan membasahi geladak, pengereman licin.",
    weatherGaleName: "Angin Kencang",
    weatherGaleDesc: "Hembusan angin kencang menyeret haluan kapal.",
    weatherStormName: "Badai Gelombang",
    weatherStormDesc: "Ombak ganas bergulung dan hempasan angin liar.",
    weatherThunderName: "Badai Petir Maut",
    weatherThunderDesc: "Kilat membelah langit, interferensi kompas terjadi.",
    weatherMistName: "Kabut Halimun",
    weatherMistDesc: "Kabut mistis perairan kutukan menyelimuti laut.",
    weatherDenseFogName: "Kabut Padat Abisal",
    weatherDenseFogDesc: "Pandangan tertutup pekat, musuh terselubung misteri.",
    weatherBloodName: "Prahara Darah Neraka",
    weatherBloodDesc: "Hujan darah korosif dan petir abisal merah.",

    // Day/Night & Celestial Time
    timePhase_predawn: "Fajar Awal",
    timePhase_dawn: "Subuh",
    timePhase_morning: "Pagi",
    timePhase_noon: "Siang",
    timePhase_afternoon: "Sore",
    timePhase_sunset: "Senja (Matahari Terbenam)",
    timePhase_dusk: "Lembayung Malam",
    timePhase_night: "Malam",
    timePhase_midnight: "Tengah Malam",
    hudClockTooltipTitle: "Waktu & Astronomi Bahari",
    hudClockTooltipDesc: "Siklus siang dan malam mengarahkan bayangan matahari, pantulan kemilau laut, serta visibilitas lentera.",
    devTimeDawn: "Subuh (06:00)",
    devTimeNoon: "Siang (12:00)",
    devTimeSunset: "Sore (17:30)",
    devTimeNight: "Malam (22:00)",
    devTimeSpeed: "Kecepatan Waktu",
    devTimePause: "Jeda Waktu",

    // Shipyard & Upgrades
    shipyardHeader: "GALANGAN KAPAL",
    shipyardSub: "Pusat Arsitektur Kapal & Modifikasi Geladak",
    shipyardAtPort: "Dermaga Berlabuh: {port}",
    shipOverallTierTitle: "ARMADA SAAT INI:",
    maxProgressLabel: "Kemajuan Armada:",
    effLevel: "Tingkat Efektivitas",
    archStage: "Tahap Arsitektur",
    archLevelOf: "{lvl} dari {max} Tingkat",
    vesselEffect: "Efek Kapal",
    optimalPerf: "Performa Optimal",
    effectiveBoost: "+Peningkatan Efektif",
    upgradeCost: "Biaya Peningkatan:",
    peakTierReached: "Telah Mencapai Tingkat Puncak!",
    compartmentMaxed: "KOMPARTEMEN MAKSIMAL",
    upgradeToLevel: "TINGKATKAN KE LEVEL {lvl}",
    insufficientResources: "SUMBER DAYA TIDAK CUKUP",
    upgradeCompleted: "SELESAI",
    upgradeBtn: "TINGKATKAN",
    insufficientBtn: "KURANG",
    fleetPeakTier: "Tingkat Puncak Armada",
    repairResources: "Reparasi (6 Kayu + 3 Tali)",
    hullPrime: "Lambung Prima (100%)",
    repairDockRequired: "Reparasi (Wajib di Dermaga)",
    repairMissingMat: "Kurang Bahan ({wood}/6 Kayu, {rope}/3 Tali)",
    repairGoldService: "Jasa Galangan (85 Koin)",
    goldServiceDockReq: "Jasa (Wajib di Dermaga)",
    goldServiceMissing: "Emas Kurang ({gold}/85 Koin)",
    blueprintTitle: "SKEMA POTONGAN KAPAL (FLAGSHIP BLUEPRINT)",
    selectCompartmentHint: "Pilih Kompartemen",
    terminalTitle: "TERMINAL REKAYASA & PENINGKATAN",
    terminalSub: "ARSITEKTUR ARMADA",
    mobileUpgradeCardsTitle: "OPSI PENINGKATAN KAPAL",
    mobileUpgradeCardsSub: "Pilih Modul & Ketuk Tingkatkan",

    // Inventory & Forge Workshop
    invTitle: "ARSENAL KAPAL & BENGKEL TEMPA",
    invSubtitle: "Pundi Kargo 16 Slot • Manajemen Artileri Kapal • Peleburan & Tempa Senjata Faksi",
    invSailingStatus: "Laut Lepas (Berlayar)",
    invMooredStatus: "Berlabuh di {port}",
    invAlmanacBtn: "ALMANAK RESEP",
    invBackBtn: "KEMBALI",
    invMobileCargo: "Pundi Kargo",
    invMobileArmory: "Armori Geladak",
    invMobileCraft: "Bengkel Tempa",
    invCargoSection: "RUANG MUATAN KAPAL",
    invFilterAll: "Semua",
    invFilterRes: "Material",
    invFilterWeap: "Senjata",
    invSlotLabel: "Slot:",
    invEmptySlot: "Slot Kosong",
    invItemDetails: "DOSSIER & TINDAKAN BENDA",
    invTapToInspect: "Pilih benda di dalam kargo untuk memeriksa detail, memasang senjata, atau membuang muatan.",
    invEquipBtn: "PASANG",
    invUnequipBtn: "LEPAS",
    invDiscardBtn: "HAPUS / BUANG",
    invArmorySection: "GELADAK ARTILERI KAPAL",
    invArmorySub: "Konfigurasi senjata broadside dan daya hancur armada",
    invMountPrompt: "Ketuk untuk Pasang Meriam",
    invNoWeaponInCargo: "Belum Ada Senjata di Kargo",
    invRepairCannon: "Reparasi",
    invDurability: "Durabilitas Laras:",
    invWorkshopSection: "BENGKEL TEMPA SENJATA",
    invCraftPortReq: "Dermaga Saja",
    invCraftWeapon: "RAKIT SENJATA",
    invMissingMats: "Bahan Kurang",
    invDockRequired: "Wajib di Dermaga",
    invFormulaBlueprint: "Formula lengkap cetak biru:",
    invOpenAlmanac: "Buka Almanak",
    invFooterHint: "Tekan I untuk menutup inventori • Tempa meriam hingga Lv.5 untuk meningkatkan daya ledak & durabilitas 3x",
    invToShipyard: "Menuju Galangan Kapal",
    cannonPickerTitle: "PASANG MERIAM GELADAK",
    cannonPickerSub: "Pilih senjata dari kargo untuk dipasang ke kapal",
    cannonPickerFooter: "Rakit senjata faksi di Bengkel Dermaga",
    cannonPickerClose: "Tutup",
    cannonPickerMount: "Pasang",

    // Sea Map
    mapTitle: "BAGAN KARTOGRAFI SAMUDRA",
    mapShipCoord: "Kapal: X: {x}, Y: {y}",
    mapSector: "Sektor {sec}",
    mapFogProgress: "KABUT SAMUDRA:",
    mapPinActive: "Pin: Aktif",
    mapPinOff: "Pin: Mati",
    mapReturnSea: "KEMBALI KE LAUT",
    mapInstruction: "Ketuk pulau untuk intelijen • Ketuk laut untuk pin • Geser & cubit untuk peta",
    mapZoomIn: "Perbesar Peta (Zoom In)",
    mapZoomOut: "Perkecil Peta (Zoom Out)",
    mapCenterShip: "Pusatkan Pada Kapal Anda [C]",
    mapResetZoom: "Reset Skala Peta (100%)",
    mapClearPin: "Hapus Pin Navigasi",
    mapLegendPlayer: "Kapal Anda",
    mapLegendPin: "Pin Navigasi",
    mapLegendHomePort: "Pelabuhan Asal",
    mapLegendTrade: "Pasar Niaga",
    mapLegendConquered: "Taklukan",
    mapLegendPirate: "Sarang Bajak Laut / Klan Musuh",
    mapLegendMerchant: "Saudagar",
    mapTierLabel: "Tingkat Kartografi:",
    mapUpgradeBtn: "Tingkatkan Peta ({cost} Koin)",
    intelIslandName: "Nama Pulau",
    intelShipDist: "JARAK KAPAL:",
    intelCoords: "KOORDINAT:",
    intelSafe: "Kondisi Wilayah: Bebas Bahaya",
    intelThreatLow: "Kondisi Wilayah: Ancaman Ringan",
    intelThreatHigh: "Kondisi Wilayah: Armada Berbahaya",
    intelSetWaypoint: "TETAPKAN WAYPOINT",
    intelCenterCamera: "Pusatkan Kamera ke Pulau Ini",

    // Toasts
    toastPinCleared: "Pin navigasi dihapus",
    toastPinArrived: "Tiba di Titik Tujuan Pin Navigasi!",
    toastWaypointSet: "Waypoint ditetapkan ke {island}! Jarak: {dist}m",
    toastRepairDockOnly: "Reparasi lambung hanya dapat dilakukan saat berlabuh di pelabuhan/dermaga!",
    toastRepairPrime: "Lambung kapal sudah dalam kondisi prima 100%!",
    toastRepairResourceDone: "Lambung diperbaiki menggunakan 6 Kayu & 3 Tali!",
    toastRepairNoMats: "Bahan baku tidak cukup! Butuh 6 Kayu & 3 Tali (Miliki: {wood} Kayu, {rope} Tali).",
    toastRepairGoldDone: "Jasa galangan telah memperbaiki kapal! (-85 Koin)",
    toastRepairNoGold: "Koin emas tidak mencukupi untuk jasa galangan (Butuh 85 Koin).",
    toastCargoFull: "Pundi Kargo Penuh! Tidak dapat menampung jenis barang baru.",
    toastNoCannonsInCargo: "Belum ada meriam di kargo! Rakit senjata faksi di Bengkel Rakit terlebih dahulu.",
    toastGraphicChanged: "Kualitas Grafis Diubah: {label}",
    toastCannonEquipped: "{name} berhasil dipasang ke Slot #{slot}!",
    toastCannonUnequipped: "{name} dilepas ke kargo.",
    toastCannonCrafted: "{name} berhasil dirakit & disimpan di kargo!",
    toastCannonRepaired: "Meriam berhasil diperbaiki!",
    toastItemDiscarded: "{name} dibuang dari kargo.",
    toastMapUpgraded: "Peta berhasil ditingkatkan! Jangkauan kabut berkurang.",
    toastCannonsEmptyOrJammed: "Meriam kapal kosong atau aus! Buka Galangan Kapal [U] / Inventori [I].",
    toastCannonBroken: "{name} telah aus dan pecah hancur berkeping-keping!",
    toastCannonJammed: "{name} aus dan macet! Perlu perbaikan di pelabuhan.",
    cannonBrokenFloat: "MERIAM PECAH!",
    cannonJammedFloat: "MERIAM MACET!",
    toastMineDeployed: "Ranjau Mesiu Dilepas ke Belakang!",
    toastUpgradeSternNeeded: "Tingkatkan Kompartemen Buritan di Galangan!",
    toastSpyglassActive: "Teropong Samudra Aktif [F]",
    toastDockedReady: "Berlabuh di {port}: Galangan kapal siap melayani!",
    toastUpgraded: "{name} ditingkatkan ke Lv.{level}!",
    toastNotEnoughUpgrade: "Emas atau Esensi Darah Anda tidak mencukupi untuk peningkatan ini.",
    toastGamepadConnected: "Kontroler Terhubung: {name}",
    toastGamepadDisconnected: "Kontroler Terputus!",
    toastCosmicMirrorStarted: "Fenomena Laut Kaca Bimasakti! Samudra mencerminkan kubah kosmos.",
    helpTabKeyboard: "KEYBOARD & MOUSE (PC)",
    helpTabGamepad: "KONTROLER / GAMEPAD",
    steerLabel: "Kemudi",
    steerJoystickLabel: "Joystick 360°",
    boostLabel: "Laju Cepat",
    stealthLabel: "Siluman"
  },
  en: {
    // Brand & Main Menu
    gameTitle: "SUNKEN SHIP",
    diffLabel: "DIFFICULTY:",
    playBtnText: "SET SAIL NOW",
    playBtnSub: "SELECT SLOT & EXPLORE OCEANS",
    codexBtnText: "LOG & BESTIARY",
    codexBtnTag: "HISTORICAL ARCHIVES",
    settingsBtnText: "SETTINGS",
    settingsBtnTag: "AUDIO & GRAPHICS",
    controlsBtnText: "CONTROLS GUIDE",
    controlsBtnTag: "NAVIGATION & CANNONS",

    // Save Slots
    saveSlotsTitle: "EXPEDITION VOYAGE SLOTS",
    saveSlotsSubtitle: "Select a save slot to embark or resume your voyage",
    slotEmptyBadge: "EMPTY",
    slotActiveBadge: "ACTIVE",
    slotEmptyTitle: "Empty Slot",
    slotEmptyDesc: "Ready for a new adventure",
    newGame: "NEW GAME",
    continueGame: "CONTINUE",
    deleteSlot: "DELETE",
    shipLabel: "Ship:",
    tierLabel: "Tier:",
    hullLabel: "Hull:",
    wealthLabel: "Wealth:",
    worldLabel: "World:",
    goldUnit: "Gold",
    bloodUnit: "Blood",
    confirmDeleteTitle: "DELETE SLOT {slot}?",
    confirmDeleteDesc: "Are you sure you want to delete Slot {slot}? All expedition data and ship progress in this slot will be permanently erased.",
    cancel: "CANCEL",
    deleteConfirm: "DELETE PERMANENTLY",

    // Pause Menu
    pauseTitle: "GAME PAUSED",
    pauseSubtitle: "Ship anchored in the open ocean",
    pauseFleetStatus: "FLEET STATUS",
    pauseHullIntegrity: "HULL INTEGRITY",
    pauseCargoCapacity: "CARGO CAPACITY",
    pauseWorldGen: "BLOOD SEA WORLD",
    pauseResume: "RESUME SAILING (ESC)",
    pauseInventory: "INVENTORY & CRAFTING (I)",
    pauseMap: "OCEAN MAP & FOG (M)",
    pauseCodex: "LORE ARCHIVE & CLANS (L)",
    pauseSettings: "AUDIO & GRAPHICS SETTINGS",
    pauseControls: "CONTROLS & HELM GUIDE (H)",
    pauseRestart: "RESTART EXPEDITION",
    pauseReturnMenu: "RETURN TO MAIN MENU",

    // Settings Modal
    settingsTitle: "SETTINGS",
    settingsSubtitle: "Audio, Graphics & Controls",
    tabAudio: "AUDIO",
    tabGraphics: "GRAPHICS",
    tabGameplay: "GAMEPLAY & LANGUAGE",

    // Audio Settings
    masterVol: "Master Volume",
    sfxVol: "Sound Effects (Cannons, Explosions & Impact)",
    seaAmbienceVol: "Sea Ambience & Wind Gusts",
    seaAmbienceDesc: "Roaring waves and ancient ocean winds.",
    battleMusicVol: "Dynamic Battle & Storm Music",
    muteAll: "Mute All Audio",
    muteAllDesc: "Disable all game sounds and music",

    // Graphics Settings
    graphicsPreset: "Graphics Quality Preset",
    graphicsBuffer: "DPR & Rendering Buffer",
    qualityHigh: "HIGH",
    qualityHighDesc: "DPR 2.0x • Full Particles • Smooth Lighting (60 FPS)",
    qualityMed: "BALANCED",
    qualityMedDesc: "DPR 1.5x • Visual Balance & Performance",
    qualityLow: "BATTERY SAVER",
    qualityLowDesc: "DPR 1.0x • GPU Friendly • Runs Cool on Mobile",
    fullscreenMode: "Fullscreen Mode",
    fullscreenDesc: "Play in fullscreen without browser distractions",
    btnFullscreenToggle: "Toggle",
    autoFullscreen: "Auto Fullscreen on Launch",
    autoFullscreenDesc: "Automatically enter fullscreen when sailing",
    screenShake: "Screen Shake Effect",
    screenShakeDesc: "Camera vibration during explosions & hull impacts",

    // Gameplay & Language
    languageTitle: "Game Language",
    languageDesc: "Choose interface and narrative language.",
    difficultyTitle: "Expedition Difficulty",
    diffEasy: "Easy",
    diffMedium: "Normal",
    diffHard: "Hard",
    controlsGuideTitle: "PC & Touch Controls Guide",
    controlsGuideDesc: "View helm keys, cannon hotkeys, and touch gestures",
    btnOpenGuide: "View Guide",
    saveAndReturn: "SAVE & RETURN",

    // Difficulty Descriptions
    diffEasyDesc: "Relaxed voyage: Damage received -25%, cannon damage +20%, Gold & Blood rewards +25%.",
    diffMediumDesc: "Standard balanced Blood Sea expedition experience.",
    diffHardDesc: "Trench Curse: Damage received +35%, tougher & aggressive enemies, rewards +50%.",

    // Help & Lore
    loreModalTitle: "CODEX: 6 SEAFARING THREAT TIERS",
    loreModalSubtitle: "Naval faction hierarchy from easiest foes to primordial abyssal apex terrors",
    helpModalTitle: "PC NAVAL CONTROLS GUIDE",
    helpModalSubtitle: "Ship steering, sail speeds, keyboard & mouse controls",
    helpCloseEsc: "Press Esc to close guide",

    // Loading & Game Over
    loadingStatus: "Loading Ocean...",
    gameOverTitle: "SHIP SUNK",
    gameOverReason: "Your fleet has perished in the ocean depths.",
    gameOverPermaText: "",
    statMaxDist: "Max Distance:",
    statKills: "Enemies Defeated:",
    statSalvages: "Wrecks Salvaged:",
    respawnBtn: "RESPAWN",
    cinematicCredits: [
      { subtitle: "ORIGINAL CREATION", title: "Created by Iyodihhh" },
      { subtitle: "AGENTIC CRAFT", title: "Vibe coded with Antigravity" },
      { subtitle: "SOUND & MUSIC", title: "Procedural Web Audio" },
      { subtitle: "THE ENDLESS OCEAN", title: "Bon Voyage" }
    ],

    // In-game Toasts & HUD
    toastGameStarted: "Adventure Begins! Smooth Sailing.",
    toastGameResumed: "Welcome Back, Captain!",
    toastSaved: "Progress Saved!",
    toastSlotDeleted: "Slot {slot} successfully deleted.",
    toastSettingsSaved: "Settings Saved Successfully",

    // In-game HUD & Telemetry
    throttleNeutral: "Neutral",
    throttleClear: "Clear Sails",
    throttleHalf: "Half Sail",
    throttleFull: "Full Sail",
    throttleStealth: "Silent Sail",
    throttleBoost: "Full Boost",
    hullFirm: "Sturdy Hull",
    stealthSafe: "Safe",
    stealthWarn: "Caution",
    stealthDetected: "Detected!",
    hudPauseBtn: "PAUSE",
    hudMapBtn: "MAP",
    hudBagBtn: "CARGO",
    hudCargoTitle: "CARGO",
    hudCargoHoldTooltip: "Open Cargo & Workshop [I]",
    hudSailingSpeed: "Sailing Speed",
    hudGoldTitle: "Looted Gold Coins",
    hudBloodTitle: "Abyssal Blood",
    spyglassTitle: "HORIZON SCOUT",
    spyglassExit: "[ESC] / [F] EXIT SPYGLASS",
    divingSalvage: "Diving Wreck...",

    // Hotbars & Controls
    hotbarSalvo: "SALVO",
    hotbarMine: "STERN",
    hotbarSalvage: "WINCH",
    hotbarSpyglass: "SPYGLASS",
    hotbarRepair: "REPAIR",
    hotbarSalvoTip: "Broadside Cannon Salvo [SPACE]",
    hotbarMineTip: "Stern Chasers & Mine Dispenser [2]",
    hotbarSalvageTip: "Wreck Salvage Hook & Winch [E]",
    hotbarSpyglassTip: "Long-Range Ocean Spyglass [F]",
    hotbarRepairTip: "Emergency Hull Repair (15 Gold) [R]",
    pcSteer: "Steer",
    pcBoost: "Full Boost",
    pcStealth: "Stealth",
    pcSpeedLabel: "SPEED:",
    mobileSalvo: "SALVO",
    mobileRepair: "REPAIR",
    mobileMineTip: "Stern Mines [2]",
    mobileSalvageTip: "Salvage Winch [E]",
    mobileSpyglassTip: "Ocean Spyglass [F]",
    mobileFireTip: "Fire Broadside Cannons [Space]",

    // Contextual Dock Prompt
    dockPromptTitle: "SHIPYARD",
    dockPromptSub: "Moored at Port",
    dockedAt: "Moored at {port}",

    // Weather Intel
    weatherIntelTitle: "Ocean Conditions",
    weatherForecast: "Ocean Weather Forecast",
    weatherRemaining: "{time} remaining",
    weatherClearName: "Calm Seas",
    weatherClearDesc: "Gentle breeze and friendly waters. Steady helm with no weather hindrance.",
    weatherOvercastName: "Overcast Skies",
    weatherOvercastDesc: "Thick clouds darken the ocean horizon.",
    weatherRainName: "Ocean Rain",
    weatherRainDesc: "Rain drenches the deck, slippery braking.",
    weatherGaleName: "Gale Winds",
    weatherGaleDesc: "Strong wind gusts dragging the ship's prow.",
    weatherStormName: "Storm Seas",
    weatherStormDesc: "Fierce rolling waves and wild wind bursts.",
    weatherThunderName: "Thunderstorm",
    weatherThunderDesc: "Lightning splits the sky, compass interference occurs.",
    weatherMistName: "Mystic Mist",
    weatherMistDesc: "Mystic fog shrouds the cursed waters.",
    weatherDenseFogName: "Dense Abyssal Fog",
    weatherDenseFogDesc: "Heavy zero visibility, enemies cloaked in mystery.",
    weatherBloodName: "Blood Tempest",
    weatherBloodDesc: "Corrosive blood rain and abyssal crimson lightning.",

    // Day/Night & Celestial Time
    timePhase_predawn: "Astronomical Twilight",
    timePhase_dawn: "Dawn",
    timePhase_morning: "Morning",
    timePhase_noon: "Midday",
    timePhase_afternoon: "Afternoon",
    timePhase_sunset: "Golden Hour (Sunset)",
    timePhase_dusk: "Dusk",
    timePhase_night: "Night",
    timePhase_midnight: "Midnight",
    hudClockTooltipTitle: "Nautical Time & Celestial Watch",
    hudClockTooltipDesc: "The day and night cycle dictates solar shadows, sea specular glint, and lantern illumination.",
    devTimeDawn: "Dawn (06:00)",
    devTimeNoon: "Noon (12:00)",
    devTimeSunset: "Sunset (17:30)",
    devTimeNight: "Night (22:00)",
    devTimeSpeed: "Time Speed",
    devTimePause: "Pause Time",

    // Shipyard & Upgrades
    shipyardHeader: "SHIPYARD",
    shipyardSub: "Naval Architecture & Deck Modification Center",
    shipyardAtPort: "Moored at: {port}",
    shipOverallTierTitle: "CURRENT FLEET:",
    maxProgressLabel: "Fleet Progress:",
    effLevel: "Effectiveness Level",
    archStage: "Architectural Stage",
    archLevelOf: "{lvl} of {max} Tiers",
    vesselEffect: "Ship Effect",
    optimalPerf: "Optimal Performance",
    effectiveBoost: "+Effective Boost",
    upgradeCost: "Upgrade Cost:",
    peakTierReached: "Peak Fleet Tier Reached!",
    compartmentMaxed: "COMPARTMENT MAXED",
    upgradeToLevel: "UPGRADE TO LEVEL {lvl}",
    insufficientResources: "INSUFFICIENT RESOURCES",
    upgradeCompleted: "MAX LEVEL",
    upgradeBtn: "UPGRADE",
    insufficientBtn: "INSUFFICIENT",
    fleetPeakTier: "Peak Fleet Tier",
    repairResources: "Repair (6 Wood + 3 Rope)",
    hullPrime: "Hull Prime (100%)",
    repairDockRequired: "Repair (Dock Required)",
    repairMissingMat: "Missing Materials ({wood}/6 Wood, {rope}/3 Rope)",
    repairGoldService: "Shipyard Service (85 Gold)",
    goldServiceDockReq: "Service (Dock Required)",
    goldServiceMissing: "Need Gold ({gold}/85 Gold)",
    blueprintTitle: "FLAGSHIP CROSS-SECTION BLUEPRINT",
    selectCompartmentHint: "Select Compartment",
    terminalTitle: "ENGINEERING & UPGRADE TERMINAL",
    terminalSub: "FLEET ARCHITECTURE",
    mobileUpgradeCardsTitle: "SHIP UPGRADE OPTIONS",
    mobileUpgradeCardsSub: "Select a module and tap Upgrade",

    // Inventory & Forge Workshop
    invTitle: "NAVAL ARSENAL & FORGE WORKSHOP",
    invSubtitle: "16-Slot Cargo Hold • Ship Artillery Management • Faction Weapon Smelting & Forging",
    invSailingStatus: "Open Waters (Sailing)",
    invMooredStatus: "Moored at {port}",
    invAlmanacBtn: "RECIPE ALMANAC",
    invBackBtn: "BACK",
    invMobileCargo: "Cargo Hold",
    invMobileArmory: "Deck Armory",
    invMobileCraft: "Forge Workshop",
    invCargoSection: "SHIP CARGO HOLD",
    invFilterAll: "All",
    invFilterRes: "Materials",
    invFilterWeap: "Weapons",
    invSlotLabel: "Slots:",
    invEmptySlot: "Empty Slot",
    invItemDetails: "ITEM DOSSIER & ACTIONS",
    invTapToInspect: "Select an item in cargo to inspect details, equip weapons, or discard freight.",
    invEquipBtn: "EQUIP",
    invUnequipBtn: "UNEQUIP",
    invDiscardBtn: "DISCARD",
    invArmorySection: "SHIP ARTILLERY DECK",
    invArmorySub: "Broadside hardpoint configuration and fleet firepower",
    invMountPrompt: "Tap to Mount Cannon",
    invNoWeaponInCargo: "No Weapons in Cargo",
    invRepairCannon: "Repair",
    invDurability: "Barrel Durability:",
    invWorkshopSection: "FACTION WEAPON FORGE",
    invCraftPortReq: "Port Dock Only",
    invCraftWeapon: "CRAFT WEAPON",
    invMissingMats: "Missing Materials",
    invDockRequired: "Requires Docking",
    invFormulaBlueprint: "Complete blueprint formulas:",
    invOpenAlmanac: "Open Almanac",
    invFooterHint: "Press I to close inventory • Forge cannons up to Lv.5 to triple firepower & durability",
    invToShipyard: "Go to Shipyard",
    cannonPickerTitle: "MOUNT DECK CANNON",
    cannonPickerSub: "Select a weapon from cargo to mount on your ship",
    cannonPickerFooter: "Craft faction weapons at the Port Workshop",
    cannonPickerClose: "Close",
    cannonPickerMount: "Mount",

    // Sea Map
    mapTitle: "OCEAN CARTOGRAPHY CHART",
    mapShipCoord: "Ship: X: {x}, Y: {y}",
    mapSector: "Sector {sec}",
    mapFogProgress: "OCEAN FOG:",
    mapPinActive: "Pin: Active",
    mapPinOff: "Pin: Off",
    mapReturnSea: "RETURN TO SEA",
    mapInstruction: "Tap island for intel • Tap ocean to pin • Drag & pinch to navigate",
    mapZoomIn: "Zoom In (+)",
    mapZoomOut: "Zoom Out (-)",
    mapCenterShip: "Center on Ship [C]",
    mapResetZoom: "Reset Map Scale (100%)",
    mapClearPin: "Clear Waypoint Pin",
    mapLegendPlayer: "Your Ship",
    mapLegendPin: "Navigation Pin",
    mapLegendHomePort: "Home Port",
    mapLegendTrade: "Trade Outpost",
    mapLegendConquered: "Conquered Port",
    mapLegendPirate: "Pirate Lair / Enemy Clan",
    mapLegendMerchant: "Merchant Ship",
    mapTierLabel: "Cartography Tier:",
    mapUpgradeBtn: "Upgrade Map ({cost} Gold)",
    intelIslandName: "Island Name",
    intelShipDist: "SHIP DISTANCE:",
    intelCoords: "COORDINATES:",
    intelSafe: "Territory Status: Safe Waters",
    intelThreatLow: "Territory Status: Low Threat",
    intelThreatHigh: "Territory Status: Dangerous Fleet",
    intelSetWaypoint: "SET WAYPOINT",
    intelCenterCamera: "Center Camera on Island",

    // Toasts
    toastPinCleared: "Navigation pin removed",
    toastPinArrived: "Arrived at Navigation Waypoint!",
    toastWaypointSet: "Waypoint set to {island}! Distance: {dist}m",
    toastRepairDockOnly: "Hull repairs can only be performed while moored at a port dock!",
    toastRepairPrime: "Ship hull is already in 100% prime condition!",
    toastRepairResourceDone: "Hull repaired using 6 Wood & 3 Rope!",
    toastRepairNoMats: "Insufficient materials! Requires 6 Wood & 3 Rope (Have: {wood} Wood, {rope} Rope).",
    toastRepairGoldDone: "Shipyard service has repaired the ship! (-85 Gold)",
    toastRepairNoGold: "Insufficient gold for shipyard service (Need 85 Gold).",
    toastCargoFull: "Cargo Hold Full! Cannot hold new types of cargo.",
    toastNoCannonsInCargo: "No cannons in cargo! Craft faction weapons at the Workshop first.",
    toastGraphicChanged: "Graphics Quality Changed: {label}",
    toastCannonEquipped: "{name} successfully mounted to Slot #{slot}!",
    toastCannonUnequipped: "{name} returned to cargo.",
    toastCannonCrafted: "{name} successfully crafted & stored in cargo!",
    toastCannonRepaired: "Cannon successfully repaired!",
    toastItemDiscarded: "{name} discarded from cargo.",
    toastMapUpgraded: "Map successfully upgraded! Fog of war reduced.",
    toastCannonsEmptyOrJammed: "Ship cannons are empty or jammed! Open Shipyard [U] / Inventory [I].",
    toastCannonBroken: "{name} has shattered into pieces!",
    toastCannonJammed: "{name} is jammed! Needs repairs at port.",
    cannonBrokenFloat: "CANNON BROKEN!",
    cannonJammedFloat: "CANNON JAMMED!",
    toastMineDeployed: "Gunpowder Mine Deployed Aft!",
    toastUpgradeSternNeeded: "Upgrade Stern Castle at the Shipyard!",
    toastSpyglassActive: "Ocean Spyglass Active [F]",
    toastDockedReady: "Docked at {port}: Shipyard ready for service!",
    toastUpgraded: "{name} upgraded to Lv.{level}!",
    toastNotEnoughUpgrade: "Insufficient Gold or Blood Essence for this upgrade.",
    toastGamepadConnected: "Gamepad Connected: {name}",
    toastGamepadDisconnected: "Gamepad Disconnected!",
    toastCosmicMirrorStarted: "Mirror of the Cosmos Active! The ocean reflects the starry heavens.",
    helpTabKeyboard: "KEYBOARD & MOUSE (PC)",
    helpTabGamepad: "CONTROLLER / GAMEPAD",
    steerLabel: "Helm",
    steerJoystickLabel: "360° Joystick",
    boostLabel: "Full Sail",
    stealthLabel: "Stealth"
  }
};

function t(key, vars = {}) {
  const lang = (typeof currentLanguage !== 'undefined' && currentLanguage) ? currentLanguage : 'id';
  let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['id'] && TRANSLATIONS['id'][key]) || key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return str;
}
function normAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
  window.t = t;
  window.normAngle = normAngle;
}

// Difficulty System Configuration (Easy, Medium/Default, Hard)
const DIFFICULTY_SETTINGS = {
  easy: {
    id: 'easy',
    name: 'Mudah (Easy)',
    badge: 'MUDAH',
    badgeEn: 'EASY',
    badgeColor: 'text-emerald-400 bg-emerald-950 border-emerald-500/40',
    desc: 'Petualangan santai: Kerusakan diterima -25%, damage meriam +20%, hadiah Koin & Darah +25%.',
    descEn: 'Relaxed voyage: Damage received -25%, cannon damage +20%, Gold & Blood rewards +25%.',
    playerDamageReceivedMult: 0.75,
    playerDamageDealtMult: 1.20,
    rewardMultiplier: 1.25,
    enemyReloadMultiplier: 1.25,
    enemyHpMultiplier: 0.85
  },
  medium: {
    id: 'medium',
    name: 'Normal (Medium)',
    badge: 'NORMAL',
    badgeEn: 'NORMAL',
    badgeColor: 'text-amber-300 bg-amber-950 border-amber-500/40',
    desc: 'Keseimbangan standar ekspedisi Laut Darah saat ini.',
    descEn: 'Standard balanced Blood Sea expedition experience.',
    playerDamageReceivedMult: 1.0,
    playerDamageDealtMult: 1.0,
    rewardMultiplier: 1.0,
    enemyReloadMultiplier: 1.0,
    enemyHpMultiplier: 1.0
  },
  hard: {
    id: 'hard',
    name: 'Sulit (Hard)',
    badge: 'EKSTREM',
    badgeEn: 'EXTREME',
    badgeColor: 'text-rose-400 bg-rose-950 border-rose-500/40',
    desc: 'Kutukan Palung: Kerusakan diterima +35%, musuh lebih tangguh & agresif, hadiah Koin & Darah +50%.',
    descEn: 'Trench Curse: Damage received +35%, tougher & aggressive enemies, rewards +50%.',
    playerDamageReceivedMult: 1.35,
    playerDamageDealtMult: 0.90,
    rewardMultiplier: 1.50,
    enemyReloadMultiplier: 0.85,
    enemyHpMultiplier: 1.25
  }
};

// Clean SVG Icon paths for Upgrades, Items, Cannons & UI elements (100% Vector - Zero Emojis)
const SVG_ICONS = {
  hull: `<svg class="w-5 h-5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  speed: `<svg class="w-5 h-5 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/><path d="M4 18L12 3l8 15"/><path d="M12 3v15"/></svg>`,
  cannons: `<svg class="w-5 h-5 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 11 12-4 3 6-12 4z"/><path d="m14 4 3 6"/><circle cx="7" cy="18" r="3"/><circle cx="17" cy="18" r="3"/></svg>`,
  rearDefense: `<svg class="w-5 h-5 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>`,
  stealthCamo: `<svg class="w-5 h-5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  relicSiphon: `<svg class="w-5 h-5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="m12 8-2 4h4l-2 4"/><circle cx="12" cy="12" r="3"/></svg>`,
  gold: `<svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2" fill="#d97706"/><path d="M12 6v12M9 9.5c0-1.5 1.5-2 3-2s3 .8 3 2c0 2-3 2.5-3 4 0 1.5 1.5 2 3 2s3-.8 3-2" stroke="#fef3c7" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  blood: `<svg class="w-3.5 h-3.5 text-rose-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  anchor: `<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="21"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
  scroll: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8a2 2 0 0 1 2 2v14a4 4 0 0 1-4 4H6a2 2 0 0 1-2-2V6a4 4 0 0 1 4-4Z"/><path d="M18 18H6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2Z"/><line x1="8" y1="7" x2="14" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  compass: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  soundOn: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  soundOff: `<svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  info: `<svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  alert: `<svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check: `<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  skull: `<svg class="w-12 h-12 text-rose-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`,
  
  // Survival Resources Icons (Thematic & Distinct)
  wood: `<svg class="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="4" cy="6" r="2" fill="currentColor"/><circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="4" cy="18" r="2" fill="currentColor"/><path d="M20 6c0 1.1-.9 2-2 2H6M20 12c0 1.1-.9 2-2 2H6M20 18c0 1.1-.9 2-2 2H6"/></svg>`,
  rope: `<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c3-4 6-4 9 0s6 4 9 0"/><path d="M4.5 11.5c3-4 6-4 9 0s6 4 9 0"/><path d="M4.5 6.5c3-4 6-4 9 0s6 4 9 0"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/></svg>`,
  iron: `<svg class="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="3,16 6,7 18,7 21,16" fill="rgba(148,163,184,0.25)"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="3" y1="16" x2="3" y2="19"/><line x1="21" y1="16" x2="21" y2="19"/><line x1="3" y1="19" x2="21" y2="19"/><line x1="7.5" y1="7" x2="5.5" y2="16"/><line x1="16.5" y1="7" x2="18.5" y2="16"/></svg>`,
  stone: `<svg class="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="5,18 2,12 7,5 16,3 21,9 19,19 12,21" fill="rgba(100,116,139,0.25)"/><line x1="7" y1="5" x2="12" y2="13"/><line x1="12" y1="13" x2="19" y2="19"/><line x1="12" y1="13" x2="5" y2="18"/></svg>`,
  bamboo: `<svg class="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="2" x2="8" y2="22"/><line x1="16" y1="2" x2="16" y2="22"/><rect x="6" y="7" width="4" height="2" rx="1" fill="currentColor"/><rect x="6" y="15" width="4" height="2" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="2" rx="1" fill="currentColor"/><rect x="14" y="13" width="4" height="2" rx="1" fill="currentColor"/><path d="M10 7c2-2 4-2 6-4M10 15c2-2 4-2 6-4"/></svg>`,
  mistOrb: `<svg class="w-6 h-6 text-cyan-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" fill="rgba(6,182,212,0.2)"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/><path d="M8 8a5.5 5.5 0 0 1 8 0M8 16a5.5 5.5 0 0 0 8 0"/><path d="M5 12h2M17 12h2"/></svg>`,
  snowOrb: `<svg class="w-6 h-6 text-sky-300 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="rgba(56,189,248,0.2)"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`,
  firePowder: `<svg class="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1 5H9L8 3z" fill="rgba(244,63,94,0.3)"/><path d="M7 8h10c2 4 2 9-1 12H8C5 17 5 12 7 8z" fill="rgba(244,63,94,0.2)"/><polygon points="12,12 13.5,15 11,15.5 12.5,18 10,18" fill="currentColor"/></svg>`,
  chitin: `<svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C9 7 4 12 4 18a8 8 0 0 0 16 0c0-6-5-11-8-16z" fill="rgba(225,29,72,0.2)"/><path d="M12 6v14M8 11l4 3 4-3M7 16l5 3 5-3"/></svg>`,
  sailCloth: `<svg class="w-6 h-6 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c0 8-4 16-16 16V4z" fill="rgba(226,232,240,0.25)"/><path d="M4 12c4 0 8-2 12-6"/><line x1="4" y1="20" x2="4" y2="4"/><line x1="2" y1="20" x2="6" y2="20"/></svg>`,
  bronze: `<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" fill="rgba(202,138,4,0.25)"/><polygon points="12 4 14.5 9.5 20.5 10 16 14.5 17.5 20.5 12 17.5 6.5 20.5 8 14.5 3.5 10 9.5 9.5 12 4" stroke="#eab308" stroke-width="1.5"/><circle cx="12" cy="12" r="2.5" fill="#fde047"/></svg>`,
  krakenInk: `<svg class="w-6 h-6 text-indigo-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 7 4 12 4 17a8 8 0 0 0 16 0c0-5-4-10-8-15z" fill="rgba(99,102,241,0.3)"/><path d="M9 14c1.5 2 4.5 2 6 0"/><circle cx="12" cy="11" r="2" fill="currentColor"/></svg>`,
  leviathanBone: `<svg class="w-6 h-6 text-slate-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8c2-2 5-2 7 1l1 1 1-1c2-3 5-3 7-1 2 2 1 5-1 7l-7 7-7-7c-2-2-3-5-1-7z" fill="rgba(241,245,249,0.25)"/><path d="M8 12l4 4 4-4"/><circle cx="12" cy="8" r="2" fill="currentColor"/></svg>`,

  // Faction Cannon Inventory Items Icons (Distinct Weapon Gear)
  cannon_standard: `<svg class="w-7 h-7 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 14 13-4 2 5-13 4z" fill="rgba(148,163,184,0.3)"/><circle cx="6" cy="18" r="3" fill="#78350f" stroke="#f59e0b"/><circle cx="15" cy="18" r="2.5" fill="#78350f" stroke="#f59e0b"/><line x1="16" y1="10" x2="22" y2="8"/><line x1="18" y1="15" x2="22" y2="13.5"/></svg>`,
  cannon_mist: `<svg class="w-7 h-7 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 13 12-4 2 5-12 4z" fill="rgba(6,182,212,0.35)"/><circle cx="6" cy="18" r="3" fill="#083344" stroke="#22d3ee"/><circle cx="17" cy="8" r="3" fill="#06b6d4" class="animate-pulse"/><path d="M18 5c2-2 4 0 3 3"/></svg>`,
  cannon_frost: `<svg class="w-7 h-7 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 13 12-4 2 5-12 4z" fill="rgba(56,189,248,0.3)"/><path d="M16 4l5 5-3 3-5-5z" fill="#0284c7" stroke="#7dd3fc"/><circle cx="6" cy="18" r="3" fill="#0c4a6e" stroke="#38bdf8"/><path d="M18 10l3-3M19 13l2-2"/></svg>`,
  cannon_wokou: `<svg class="w-7 h-7 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 15 12-5 2 4-12 5z" fill="rgba(244,63,94,0.3)"/><line x1="8" y1="6" x2="21" y2="3" stroke="#facc15" stroke-width="2"/><line x1="9" y1="9" x2="22" y2="6" stroke="#facc15" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="#881337" stroke="#f43f5e"/><line x1="19" y1="4" x2="22" y2="5"/></svg>`,
  cannon_chitin: `<svg class="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 14 13-5 2 6-13 4z" fill="rgba(190,18,60,0.4)"/><circle cx="6" cy="18" r="3" fill="#4c0519" stroke="#e11d48"/><path d="M14 6l7 3-2 3M16 11l4 2" stroke="#fda4af"/><circle cx="18" cy="8" r="1.5" fill="#f43f5e"/></svg>`,

  // UI Action & Thematic Icons
  inventory: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M3 11h18M12 11v3"/></svg>`,
  recipeBook: `<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="6" x2="16" y2="6"/><line x1="9" y1="10" x2="14" y2="10"/></svg>`,
  workshop: `<svg class="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  repair: `<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.36 6.36"/><path d="m11 5 4 4"/></svg>`,
  trash: `<svg class="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  equip: `<svg class="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  unequip: `<svg class="w-3.5 h-3.5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
};

// Maximum cargo slots capacity for the ship's hold
const MAX_CARGO_SLOTS = 24;

// Survival Resource Items Configuration (Strict Vector & Semantic Categories)
const RESOURCE_TYPES = {
  wood: {
    id: 'wood',
    name: 'Kayu Gelondong',
    nameEn: 'Timber Logs',
    category: 'Bahan Baku',
    categoryEn: 'Raw Material',
    rarity: 'Umum',
    rarityEn: 'Common',
    desc: 'Kayu jati gelondong kuat. Bahan primer reparasi lambung dan struktur dudukan meriam.',
    descEn: 'Sturdy teak logs. Primary material for hull repairs and gun mount frames.',
    color: '#b45309',
    icon: 'wood',
    iconKey: 'wood',
    baseCost: 3,
    dropSource: 'Peti Apung & Kapal Karam',
    dropSourceEn: 'Floating Crates & Shipwrecks'
  },
  rope: {
    id: 'rope',
    name: 'Tali Rami',
    nameEn: 'Hemp Rope',
    category: 'Bahan Baku',
    categoryEn: 'Raw Material',
    rarity: 'Umum',
    rarityEn: 'Common',
    desc: 'Pintalan serat rami laut. Pengikat tambatan layar, lashing meriam, dan reparasi cepat.',
    descEn: 'Braided sea hemp fibers. Used for sail rigging, cannon lashing, and field repairs.',
    color: '#d97706',
    icon: 'rope',
    iconKey: 'rope',
    baseCost: 4,
    dropSource: 'Peti Terapung Samudra',
    dropSourceEn: 'Floating Ocean Crates'
  },
  iron: {
    id: 'iron',
    name: 'Pelat Besi Baja',
    nameEn: 'Steel Plates',
    category: 'Bahan Baku',
    categoryEn: 'Raw Material',
    rarity: 'Biasa',
    rarityEn: 'Standard',
    desc: 'Logam tempa balok baja. Komponen utama selongsong meriam berat dan penguat struktur.',
    descEn: 'Forged steel bars. Core component for heavy cannon jackets and hull plating.',
    color: '#94a3b8',
    icon: 'iron',
    iconKey: 'iron',
    baseCost: 7,
    dropSource: 'Bangkai Kapal Dagang & Menara',
    dropSourceEn: 'Merchant Hulks & Watchtowers'
  },
  stone: {
    id: 'stone',
    name: 'Bongkahan Batu',
    nameEn: 'Granite Boulders',
    category: 'Bahan Baku',
    categoryEn: 'Raw Material',
    rarity: 'Umum',
    rarityEn: 'Common',
    desc: 'Batu granit padat dari tebing pulau. Pemberat balast kapal dan fondasi pertahanan cadas.',
    descEn: 'Dense granite carved from sea crags. Ballast weight and defensive stronghold masonry.',
    color: '#64748b',
    icon: 'stone',
    iconKey: 'stone',
    baseCost: 2,
    dropSource: 'Tebing Pulau Karang & Reruntuhan',
    dropSourceEn: 'Reef Cliffs & Ruins'
  },
  bamboo: {
    id: 'bamboo',
    name: 'Batang Bambu',
    nameEn: 'Bamboo Poles',
    category: 'Bahan Baku',
    categoryEn: 'Raw Material',
    rarity: 'Khusus',
    rarityEn: 'Special',
    desc: 'Bambu oriental lentur dan tahan api. Selongsong baterai roket salvo armada Wokou.',
    descEn: 'Flexible fire-resistant eastern bamboo. Casing for Wokou salvo rocket batteries.',
    color: '#84cc16',
    icon: 'bamboo',
    iconKey: 'bamboo',
    baseCost: 5,
    dropSource: 'Kapal Bajak Laut Wokou',
    dropSourceEn: 'Wokou Pirate Vessels'
  },
  mistOrb: {
    id: 'mistOrb',
    name: 'Orb Kabut Gaib',
    nameEn: 'Mystic Fog Orb',
    category: 'Artefak Faksi',
    categoryEn: 'Faction Artifact',
    rarity: 'Mistik',
    rarityEn: 'Occult',
    desc: 'Esensi roh berdenyut gaib. Menghidupkan meriam berpelacak roh otomatis (Homing).',
    descEn: 'Pulsing spiritual essence. Powers auto-tracking spirit projectiles (Homing).',
    color: '#06b6d4',
    icon: 'mistOrb',
    iconKey: 'mistOrb',
    baseCost: 45,
    isSpecial: true,
    dropSource: 'Kapal & Menara Sekte Kabut',
    dropSourceEn: 'Mist Sect Ships & Spires'
  },
  snowOrb: {
    id: 'snowOrb',
    name: 'Orb Salju Fjord',
    nameEn: 'Fjord Snow Orb',
    category: 'Artefak Faksi',
    categoryEn: 'Faction Artifact',
    rarity: 'Mistik',
    rarityEn: 'Occult',
    desc: 'Kristal es abadi samudra utara. Membekukan dan melumpuhkan kecepatan kapal musuh.',
    descEn: 'Eternal permafrost crystal. Freezes and paralyzes enemy vessel speed.',
    color: '#38bdf8',
    icon: 'snowOrb',
    iconKey: 'snowOrb',
    baseCost: 45,
    isSpecial: true,
    dropSource: 'Drakkar & Ballista Viking',
    dropSourceEn: 'Viking Drakkars & Ballistas'
  },
  firePowder: {
    id: 'firePowder',
    name: 'Bubuk Mesiu Api',
    nameEn: 'Blazing Gunpowder',
    category: 'Artefak Faksi',
    categoryEn: 'Faction Artifact',
    rarity: 'Eksotis',
    rarityEn: 'Exotic',
    desc: 'Bubuk mesiu mesiu merah peledak. Menghasilkan ledakan beruntun roket salvo.',
    descEn: 'Volatile red gunpowder. Unleashes concussive chain-explosions in rocket salvos.',
    color: '#f43f5e',
    icon: 'firePowder',
    iconKey: 'firePowder',
    baseCost: 30,
    isSpecial: true,
    dropSource: 'Jung Meriam Wokou',
    dropSourceEn: 'Wokou Fire Junks'
  },
  chitin: {
    id: 'chitin',
    name: 'Cangkang Kitin',
    nameEn: 'Chitin Carapace',
    category: 'Artefak Abisal',
    categoryEn: 'Abyssal Artifact',
    rarity: 'Abisal',
    rarityEn: 'Abyssal',
    desc: 'Duri pelindung keras beracun. Menembakkan duri asam korosif penembus baja lambung.',
    descEn: 'Spiked venomous carapace. Fires corrosive acidic barbs that pierce armor plating.',
    color: '#e11d48',
    icon: 'chitin',
    iconKey: 'chitin',
    baseCost: 25,
    isSpecial: true,
    dropSource: 'Monster Palung Laut Darah',
    dropSourceEn: 'Blood Sea Trench Monsters'
  },
  sailCloth: {
    id: 'sailCloth',
    name: 'Kain Layar Sutra',
    nameEn: 'Reinforced Sailcloth',
    category: 'Bahan Baku',
    categoryEn: 'Raw Material',
    rarity: 'Biasa',
    rarityEn: 'Standard',
    desc: 'Lembaran kain layar serat sutra rami tahan badai. Bahan baku peningkatan layar kapal dan kamuflase kabut.',
    descEn: 'Storm-resistant silk-hemp canvas fabric. Core material for sail speed and stealth camouflage.',
    color: '#e2e8f0',
    icon: 'sailCloth',
    iconKey: 'sailCloth',
    baseCost: 15,
    dropSource: 'Kapal Batavia & Wokou, Peti Apung',
    dropSourceEn: 'Batavia & Wokou Vessels, Floating Crates'
  },
  bronze: {
    id: 'bronze',
    name: 'Kuningan Perunggu',
    nameEn: 'Forged Bronze Hardware',
    category: 'Bahan Baku',
    categoryEn: 'Raw Material',
    rarity: 'Khusus',
    rarityEn: 'Special',
    desc: 'Logam cor kuningan tahan air asin. Komponen kunci bantalan roda meriam, pelat ranjau, dan taji haluan.',
    descEn: 'Seawater-resistant forged bronze alloy. Essential for cannon carriages, naval mines, and prow rams.',
    color: '#ca8a04',
    icon: 'bronze',
    iconKey: 'bronze',
    baseCost: 20,
    dropSource: 'Galleon Besi, Menara Bastion, Bangkai Kapal',
    dropSourceEn: 'Iron Galleons, Bastion Towers, Shipwrecks'
  },
  krakenInk: {
    id: 'krakenInk',
    name: 'Tinta Cumi Abisal',
    nameEn: 'Abyssal Kraken Ink',
    category: 'Artefak Abisal',
    categoryEn: 'Abyssal Artifact',
    rarity: 'Abisal',
    rarityEn: 'Abyssal',
    desc: 'Cairan tinta hitam pekat dari monster gurita palung terdalam. Menghilangkan deteksi pandangan musuh seketika.',
    descEn: 'Pitch-black abyssal ink drawn from deep-sea trench cephalopods. Completely baffles enemy detection grids.',
    color: '#6366f1',
    icon: 'krakenInk',
    iconKey: 'krakenInk',
    baseCost: 50,
    isSpecial: true,
    dropSource: 'Abyssal Kraken & Monster Palung Darah',
    dropSourceEn: 'Abyssal Kraken & Blood Trench Horrors'
  },
  leviathanBone: {
    id: 'leviathanBone',
    name: 'Tulang Purba Lautan',
    nameEn: 'Ancient Leviathan Bone',
    category: 'Artefak Abisal',
    categoryEn: 'Abyssal Artifact',
    rarity: 'Legendaris',
    rarityEn: 'Legendary',
    desc: 'Serpihan tulang gading monster purba laut dalam. Memberikan kekokohan struktur mutlak dan memperkuat hisapan relik vampir.',
    descEn: 'Ivory bone fragment of ancient oceanic leviathans. Grants absolute hull structural density and empowers relic vampirism.',
    color: '#f1f5f9',
    icon: 'leviathanBone',
    iconKey: 'leviathanBone',
    baseCost: 80,
    isSpecial: true,
    dropSource: 'Ancient Leviathan & Bangkai Kapal Kuno',
    dropSourceEn: 'Ancient Leviathans & Sunken Relic Wrecks'
  }
};

// Craftable Faction Cannons Configuration (Durability & Weapon Types)
const CANNON_TYPES = {
  standard: {
    id: 'standard',
    name: 'Meriam Besi Standar',
    nameEn: 'Standard Iron Cannon',
    subtitle: 'Arsenil Angkatan Laut Klasik',
    subtitleEn: 'Classic Naval Arsenal',
    factionName: 'Angkatan Laut',
    factionNameEn: 'Navy',
    desc: 'Meriam peluru besi cor klasik. Handal, stabil, dan berdaya hancur fisik mantap.',
    descEn: 'Classic cast iron cannon. Reliable, durable, and delivers solid physical impact.',
    maxDurability: 180,
    damage: 22,
    projectileType: 'cannonball',
    color: '#94a3b8',
    itemIconKey: 'cannon_standard',
    recipe: { wood: 8, iron: 5, rope: 3 },
    isOrbSpecial: false // Jika aus (durability 0), bisa diperbaiki di pelabuhan
  },
  mist: {
    id: 'mist',
    name: 'Meriam Arwah Kabut',
    nameEn: 'Mist Soul Cannon',
    subtitle: 'Senjata Gaib Sekte Kabut',
    subtitleEn: 'Occult Weapon of the Mist',
    factionName: 'Sekte Kabut',
    factionNameEn: 'Mist Sect',
    desc: 'Meriam mistis bermahkota lentera toska. Menembakkan proyektil roh berpelacak otomatis (Homing Wisps).',
    descEn: 'Mystic cannon crowned with a teal lantern. Fires auto-homing spiritual wisps.',
    maxDurability: 140,
    damage: 24,
    projectileType: 'spirit',
    color: '#06b6d4',
    itemIconKey: 'cannon_mist',
    recipe: { wood: 8, iron: 4, mistOrb: 2 },
    isOrbSpecial: true // Jika aus (durability 0), langsung pecah hancur & sirna!
  },
  frost: {
    id: 'frost',
    name: 'Pelontar Es Viking',
    nameEn: 'Viking Frost Hurler',
    subtitle: 'Artileri Badai Salju Norse',
    subtitleEn: 'Norse Blizzard Artillery',
    factionName: 'Klan Viking',
    factionNameEn: 'Viking Clan',
    desc: 'Pelontar berukir runik samudra utara. Menembakkan kapak es berputar yang memperlambat musuh (Slow 40%).',
    descEn: 'Northern ocean runic hurler. Launches spinning frost axes that slow enemy ships by 40%.',
    maxDurability: 150,
    damage: 26,
    projectileType: 'frost_axe',
    color: '#38bdf8',
    itemIconKey: 'cannon_frost',
    recipe: { wood: 8, iron: 5, snowOrb: 2 },
    isOrbSpecial: true // Sirna ketika durability habis
  },
  wokou: {
    id: 'wokou',
    name: 'Baterai Roket Bambu',
    nameEn: 'Bamboo Rocket Battery',
    subtitle: 'Teknologi Api Timur Wokou',
    subtitleEn: 'Eastern Firework Tech',
    factionName: 'Jung Wokou',
    factionNameEn: 'Wokou Fleet',
    desc: 'Peluncur roket oriental berlapis bambu. Meluncurkan panah roket kembang api berdaya ledak tinggi dengan percikan membakar.',
    descEn: 'Bamboo-clad rocket launcher. Discharges incendiary rocket arrows with high explosive splash.',
    maxDurability: 130,
    damage: 32,
    burstCount: 1,
    projectileType: 'rocket_arrow',
    color: '#f43f5e',
    itemIconKey: 'cannon_wokou',
    recipe: { bamboo: 10, iron: 4, firePowder: 2 },
    isOrbSpecial: true // Sirna ketika durability habis
  },
  chitin: {
    id: 'chitin',
    name: 'Penyembur Duri Kitin',
    nameEn: 'Chitin Spike Spitter',
    subtitle: 'Organ Biologis Palung Darah',
    subtitleEn: 'Blood Trench Bio-Weapon',
    factionName: 'Palung Abisal',
    factionNameEn: 'Abyssal Trench',
    desc: 'Moncong organik berduri kitin tajam. Menembakkan duri beracun yang mengikis lambung musuh secara berkala.',
    descEn: 'Organic spitter spiked with sharpened chitin. Shoots venomous barbs eroding enemy hull over time.',
    maxDurability: 160,
    damage: 28,
    projectileType: 'spike',
    color: '#e11d48',
    itemIconKey: 'cannon_chitin',
    recipe: { wood: 6, chitin: 8, bloodEssence: 4 },
    isOrbSpecial: true // Sirna ketika durability habis
  }
};

// 5-Level Cannon Upgrade System (Enhances Durability & Attack Power)
const CANNON_LEVELS = [
  { level: 1, title: 'Tingkat I (Dasar)', titleEn: 'Tier I (Basic)', badge: 'Lv.1', stars: '★☆☆☆☆', dmgMult: 1.0, durMult: 1.0 },
  { level: 2, title: 'Tingkat II (Tempa Baja)', titleEn: 'Tier II (Steel Forged)', badge: 'Lv.2', stars: '★★☆☆☆', dmgMult: 1.25, durMult: 1.35 },
  { level: 3, title: 'Tingkat III (Laras Perunggu)', titleEn: 'Tier III (Bronze Barrel)', badge: 'Lv.3', stars: '★★★☆☆', dmgMult: 1.50, durMult: 1.75 },
  { level: 4, title: 'Tingkat IV (Artileri Perwira)', titleEn: 'Tier IV (Officer Artillery)', badge: 'Lv.4', stars: '★★★★☆', dmgMult: 1.80, durMult: 2.25 },
  { level: 5, title: 'Tingkat V (Mahakarya Abisal)', titleEn: 'Tier V (Abyssal Masterpiece)', badge: 'Lv.5', stars: '★★★★★', dmgMult: 2.20, durMult: 3.00 }
];

function getCannonLevelConfig(level = 1) {
  const safeLvl = Math.max(1, Math.min(5, Math.floor(level || 1)));
  return CANNON_LEVELS[safeLvl - 1] || CANNON_LEVELS[0];
}

function getCannonDamage(cannon) {
  if (!cannon) return 22;
  const conf = CANNON_TYPES[cannon.type] || CANNON_TYPES.standard;
  const lvlCfg = getCannonLevelConfig(cannon.level || 1);
  return Math.round(conf.damage * (lvlCfg.dmgMult || 1.0));
}

function getCannonMaxDurability(cannonType, level = 1) {
  const conf = CANNON_TYPES[cannonType] || CANNON_TYPES.standard;
  const lvlCfg = getCannonLevelConfig(level);
  return Math.round(conf.maxDurability * (lvlCfg.durMult || 1.0));
}

// Upgrade cost progression (Balances finance: heavy gold investment required!)
function getCannonUpgradeCost(cannon) {
  if (!cannon || (cannon.level || 1) >= 5) return null;
  const curLvl = cannon.level || 1;
  const nextLvl = curLvl + 1;
  const cType = cannon.type || 'standard';

  switch (nextLvl) {
    case 2:
      return { gold: 250, wood: 6, iron: 4 };
    case 3:
      if (cType === 'mist') return { gold: 600, wood: 10, iron: 6, mistOrb: 1 };
      if (cType === 'frost') return { gold: 600, wood: 10, iron: 6, snowOrb: 1 };
      if (cType === 'wokou') return { gold: 600, bamboo: 12, iron: 6, firePowder: 1 };
      if (cType === 'chitin') return { gold: 600, wood: 8, chitin: 6, bloodEssence: 3 };
      return { gold: 500, wood: 10, iron: 8 }; // standard
    case 4:
      if (cType === 'mist') return { gold: 1200, wood: 14, iron: 10, mistOrb: 2 };
      if (cType === 'frost') return { gold: 1200, wood: 14, iron: 10, snowOrb: 2 };
      if (cType === 'wokou') return { gold: 1200, bamboo: 16, iron: 10, firePowder: 2 };
      if (cType === 'chitin') return { gold: 1200, wood: 12, chitin: 10, bloodEssence: 6 };
      return { gold: 1100, wood: 16, iron: 14 }; // standard
    case 5:
      if (cType === 'mist') return { gold: 2500, wood: 20, iron: 16, mistOrb: 3, bloodEssence: 6 };
      if (cType === 'frost') return { gold: 2500, wood: 20, iron: 16, snowOrb: 3, bloodEssence: 6 };
      if (cType === 'wokou') return { gold: 2500, bamboo: 24, iron: 16, firePowder: 3, bloodEssence: 6 };
      if (cType === 'chitin') return { gold: 2500, wood: 16, chitin: 16, bloodEssence: 10 };
      return { gold: 2400, wood: 24, iron: 20, bloodEssence: 5 }; // standard
    default:
      return null;
  }
}

// Device platform detection for adaptive draw distance and spawning density
function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 1024);
}

// Ship Upgrades Definition (6 branches, MAX 6 levels each = 36 levels total)
// Pure Resource/Material Dependent Upgrades (100% Commodity-Based, Zero Gold)
const UPGRADE_CONFIG = {
  hull: {
    name: "Lambung Kapal (Armor & HP)",
    nameEn: "Hull Structure (Armor & HP)",
    iconKey: "hull",
    maxLevel: 6,
    desc: "Meningkatkan ketahanan maksimum kapal dari tembakan dan tabrakan.",
    descEn: "Increases maximum ship durability against incoming fire and ram impacts.",
    costs: {
      2: { wood: 8, iron: 4 },
      3: { wood: 14, iron: 8, stone: 6 },
      4: { wood: 22, iron: 14, stone: 10, chitin: 2 },
      5: { wood: 32, iron: 20, stone: 15, chitin: 5 },
      6: { wood: 45, iron: 28, stone: 20, chitin: 10, leviathanBone: 2 }
    }
  },
  speed: {
    name: "Layar & Kemudi (Kecepatan)",
    nameEn: "Sails & Rigging (Speed & Agility)",
    iconKey: "speed",
    maxLevel: 6,
    desc: "Menambah kelincahan putar kemudi dan laju kecepatan layar.",
    descEn: "Increases rudder turning responsiveness and top sail velocity.",
    costs: {
      2: { rope: 6, wood: 6 },
      3: { rope: 12, wood: 10, sailCloth: 4 },
      4: { rope: 18, wood: 16, sailCloth: 8, bamboo: 6 },
      5: { rope: 26, wood: 22, sailCloth: 14, bamboo: 12, mistOrb: 2 },
      6: { rope: 36, wood: 30, sailCloth: 20, bamboo: 18, mistOrb: 4 }
    }
  },
  cannons: {
    name: "Kapasitas Slot Meriam (Cannon Slots)",
    nameEn: "Cannon Battery Deck (Broadside Ports)",
    iconKey: "cannons",
    maxLevel: 6,
    desc: "Membuka slot tambahan untuk memasang meriam hasil kerajinan pada sisi kapal (Hingga 4 slot per sisi).",
    descEn: "Unlocks extra cannon mounts for craftable naval artillery (Up to 4 ports per broadside).",
    costs: {
      2: { iron: 6, wood: 8, rope: 4 },
      3: { iron: 12, wood: 14, rope: 8, bronze: 4 },
      4: { iron: 20, wood: 20, rope: 12, bronze: 8, firePowder: 3 },
      5: { iron: 28, wood: 28, rope: 16, bronze: 14, firePowder: 6 },
      6: { iron: 38, wood: 36, rope: 22, bronze: 20, firePowder: 10, snowOrb: 3 }
    }
  },
  rearDefense: {
    name: "Pertahanan Buritan & Ranjau (Blind Spot)",
    nameEn: "Stern Castle & Mines (Blind Spot Defense)",
    iconKey: "rearDefense",
    maxLevel: 6,
    desc: "Membuka meriam buritan & melepas ranjau mesiu terapung jika musuh mengekor.",
    descEn: "Deploys rear-facing swivel guns and dropped naval mines for pursuers.",
    costs: {
      1: { firePowder: 2, iron: 6, wood: 8, rope: 4 },
      2: { firePowder: 4, iron: 10, wood: 12, stone: 6 },
      3: { firePowder: 7, iron: 16, wood: 18, stone: 10, bronze: 4 },
      4: { firePowder: 11, iron: 22, wood: 24, stone: 14, bronze: 8 },
      5: { firePowder: 16, iron: 30, wood: 30, chitin: 6, bronze: 12 },
      6: { firePowder: 22, iron: 40, wood: 38, chitin: 10, snowOrb: 4 }
    }
  },
  stealthCamo: {
    name: "Layar Siluman & Kamuflase (Stealth)",
    nameEn: "Stealth Canvas & Camouflage (Stealth)",
    iconKey: "stealthCamo",
    maxLevel: 6,
    desc: "Mempersempit jarak pandang musuh & memperlambat meteran ketahuan hingga 70%.",
    descEn: "Narrows enemy vision cones and slows alert detection meters by up to 70%.",
    costs: {
      2: { rope: 6, bamboo: 6, mistOrb: 1 },
      3: { rope: 10, bamboo: 12, mistOrb: 2, sailCloth: 4 },
      4: { rope: 16, bamboo: 18, mistOrb: 4, sailCloth: 8, krakenInk: 2 },
      5: { rope: 22, bamboo: 24, mistOrb: 6, sailCloth: 14, krakenInk: 4 },
      6: { rope: 30, bamboo: 32, mistOrb: 9, sailCloth: 20, krakenInk: 8 }
    }
  },
  relicSiphon: {
    name: "Lentera Vampirisme (Life Steal)",
    nameEn: "Relic Siphon & Ram (Life Steal)",
    iconKey: "relicSiphon",
    maxLevel: 6,
    desc: "Menghisap darah kapal atau monster lawan untuk memulihkan lambung saat menabrak.",
    descEn: "Crushes enemy vessels with the prow ram and siphons vitality to heal the hull.",
    costs: {
      2: { iron: 8, stone: 6, chitin: 2 },
      3: { iron: 14, stone: 10, chitin: 5, bronze: 4 },
      4: { iron: 22, stone: 16, chitin: 9, bronze: 8, snowOrb: 2 },
      5: { iron: 30, stone: 22, chitin: 14, bronze: 12, snowOrb: 4, leviathanBone: 2 },
      6: { iron: 40, stone: 30, chitin: 20, bronze: 18, snowOrb: 6, leviathanBone: 5 }
    }
  }
};

// Helper: Get resource costs for a specific compartment upgrade tier
function getCompartmentUpgradeCost(compKey, targetLevel) {
  const conf = UPGRADE_CONFIG[compKey];
  if (!conf || !conf.costs || !conf.costs[targetLevel]) return null;
  return conf.costs[targetLevel];
}

// Helper: Check if player has all required resources for an upgrade tier (Pure Material, No Gold)
function checkCanAffordCompartmentUpgrade(compKey, targetLevel) {
  const cost = getCompartmentUpgradeCost(compKey, targetLevel);
  if (!cost) return false;
  if (typeof playerState === 'undefined' || !playerState.resources) return false;
  for (const [resKey, reqQty] of Object.entries(cost)) {
    const curQty = playerState.resources[resKey] || 0;
    if (curQty < reqQty) return false;
  }
  return true;
}

const FOG_SECTOR_SIZE = 1200;

const MAP_UPGRADE_CONFIG = {
  1: {
    level: 1,
    name: "Peta Sketsa Nelayan",
    nameEn: "Fisherman's Sketch Chart",
    cost: 0,
    maxRadius: 22000,
    fogClearanceRadius: 2400,
    showTiers: [4],
    desc: "Bagan navigasi dasar mencatat Teluk Nusa Damai dan perairan senja awal (Ring 0 & 1).",
    descEn: "Basic navigation chart mapping Peace Haven Bay and early twilight waters (Ring 0 & 1)."
  },
  2: {
    level: 2,
    name: "Peta Pandu Perwira",
    nameEn: "Officer's Pilot Chart",
    cost: 150,
    maxRadius: 42000,
    fogClearanceRadius: 3600,
    showTiers: [3, 4],
    desc: "Bagan laut perwira menembus Selat Karang Besi dan pangkalan armada tempur (Ring 2).",
    descEn: "Officer's nautical chart piercing Iron Reef Strait and fleet naval bases (Ring 2)."
  },
  3: {
    level: 3,
    name: "Peta Samudra Kerajaan",
    nameEn: "Royal Ocean Chart",
    cost: 400,
    maxRadius: 65000,
    fogClearanceRadius: 5200,
    showTiers: [2, 3, 4],
    desc: "Bagan resmi kerajaan melacak konvoi niaga dan kepulauan Sekte Kabut (Ring 3).",
    descEn: "Official royal chart tracking merchant convoys and Mist Clan archipelagos (Ring 3)."
  },
  4: {
    level: 4,
    name: "Peta Kartografi Abisal",
    nameEn: "Abyssal Cartography Chart",
    cost: 850,
    maxRadius: 92000,
    fogClearanceRadius: 7500,
    showTiers: [1, 2, 3, 4],
    desc: "Gulungan navigasi terlarang membuka seluruh batas Laut Merah dan Pulau Tengkorak (Ring 4 & 5).",
    descEn: "Forbidden navigation scroll uncovering all boundaries of the Crimson Sea and Skull Islands (Ring 4 & 5)."
  }
};

const MERCHANT_CONFIG = {
  cargo: {
    name: "Kapal Kargo Niaga",
    hp: 170,
    speed: 1.85,
    radius: 20,
    cargoLoot: 45
  },
  escort: {
    name: "Sekoci Pengawal Niaga",
    hp: 250,
    speed: 2.25,
    radius: 22,
    damage: 18,
    cargoLoot: 35
  }
};


const CLAN_LORE = {
  gold: {
    id: 'gold',
    name: "Kesultanan Emas Al-Zahab",
    nameEn: "Al-Zahab Gold Sultanate",
    species: "Sultan Malik Al-Zahab",
    speciesEn: "Sultan Malik Al-Zahab",
    threatLevel: 1,
    threatLabel: "TINGKAT ANCAMAN I • PALING MUDAH",
    threatLabelEn: "THREAT TIER I • EASIEST",
    badgeColor: "#d97706",
    bgClass: "from-amber-950/40 to-slate-900/80 border-amber-500/30",
    bulletColor: "#fbbf24",
    lore: "Meskipun secara menyeluruh adalah faksi paling kaya raya, kehidupan hedon para elit tidak seimbang dengan pengembangan teknologi senjata, membuat mereka menjadi musuh paling mudah ditaklukkan. Dipimpin oleh Sultan Malik Al-Zahab yang menguasai banyak laut dan memelihara bajak laut bayaran, mereka mengutamakan perdagangan dibanding peperangan. Ketamakan para penguasa membuat kekayaan besar hanya dinikmati segelintir elit sementara rakyatnya menderita di bawah tirani upeti.",
    loreEn: "Although the wealthiest faction across the realm, their hedonistic lifestyle neglected weapon technology, making them the easiest foes to conquer. Commanded by Sultan Malik Al-Zahab who controls maritime trade routes and pays off corsairs, they prioritize commerce over warfare. Ruthless greed concentrates immense wealth among ruling elites while heavily oppressing their subjects.",
    tiers: [
      { level: 1, name: "Kolek Cukai Al-Zahab", nameEn: "Al-Zahab Toll Sloop", hp: 45, speed: 2.3, damage: 8, radius: 24, desc: "Sekoci pemungut upeti berbalut sutra kuning gading dengan meriam kuningan ringkih.", descEn: "Tribute-collecting skiff lined with ivory-gold silk and frail brass cannons." },
      { level: 2, name: "Korvet Pengawal Emas", nameEn: "Gold Escort Corvette", hp: 110, speed: 2.4, damage: 14, radius: 30, desc: "Kapal niaga berlapis kayu jati ganda dengan patung singa emas dan pengawal bayaran.", descEn: "Double-hulled teak merchant vessel adorned with golden lion figurehead and hired guards." },
      { level: 3, name: "Galleon Kas Diraja Al-Zahab", nameEn: "Al-Zahab Royal Treasury Galleon", hp: 260, speed: 2.6, damage: 22, radius: 40, desc: "Bahtera megah lambang kemewahan Sultan, sarat timbunan peti emas koin melimpah namun rapuh terhadap serangan artileri terarah.", descEn: "Opulent flagship symbolizing the Sultan's luxury, laden with overflowing gold chests yet structurally fragile against focused artillery." }
    ]
  },
  wokou: {
    id: 'wokou',
    name: "Sindikat Penyelundup Wokou",
    nameEn: "Wokou Smuggler Syndicate",
    species: "Sindikat Bajak Laut Terbesar",
    speciesEn: "Largest Pirate Syndicate",
    threatLevel: 2,
    threatLabel: "TINGKAT ANCAMAN II • MENENGAH",
    threatLabelEn: "THREAT TIER II • INTERMEDIATE",
    badgeColor: "#e11d48",
    bgClass: "from-rose-950/40 to-slate-900/80 border-rose-500/30",
    bulletColor: "#fb7185",
    lore: "Alih-alih suatu negara, mereka adalah kelompok bajak laut terbesar di samudra ini. Berawal dari perintis di bawah naungan Kesultanan Gold, pengalaman tempur lapangan yang panjang membuat strategi dan persenjataan mereka jauh lebih berkembang dibanding mantan majikan mereka. Terkenal atas kebrutalan, kelicikan perang laut, penjarahan tanpa ampun, dan penguasaan rute penyelundupan ilegal menggunakan salvo panah roket mesiu.",
    loreEn: "Rather than a sovereign nation, they are the largest pirate syndicate in this ocean. Originally rising under Gold's payroll, extensive frontline combat experience propelled their strategies and rocket weaponry far beyond their former masters. Infamous for naval brutality, cunning tactics, merciless looting, and iron-fisted control over contraband smuggling routes.",
    tiers: [
      { level: 1, name: "Sampan Roket Api", nameEn: "Fire Rocket Sampan", hp: 65, speed: 2.8, damage: 12, radius: 23, desc: "Sampan oriental bersayap tunggal layar batten bambu dengan peluncur panah roket haluan.", descEn: "Oriental sampan with batten sail and prow-mounted fire rocket launcher." },
      { level: 2, name: "Jung Perang Wokou", nameEn: "Wokou War Junk", hp: 150, speed: 2.8, damage: 20, radius: 30, desc: "Kapal perang bertiang dua dengan lentera merah berayun, geladak buritan tinggi, dan meriam mesiu samping.", descEn: "Two-masted war junk with swaying lanterns, elevated stern castle, and broadside cannons." },
      { level: 3, name: "Benteng Jung Kaisar Naga", nameEn: "Dragon Emperor Fortress Junk", hp: 340, speed: 3.0, damage: 30, radius: 41, desc: "Benteng terapung bertiang 3 bertingkat pagoda megah, berhaluan naga emas, dengan baterai roket kembar yang mematikan.", descEn: "Floating 3-masted pagoda fortress adorned with golden dragon prow and twin rocket batteries." }
    ]
  },
  iron: {
    id: 'iron',
    name: "Rezim Militer Besi Hitam",
    nameEn: "Black Iron Military Regime",
    species: "High Marshal Valerius von Eisenhardt",
    speciesEn: "High Marshal Valerius von Eisenhardt",
    threatLevel: 3,
    threatLabel: "TINGKAT ANCAMAN III • TANGGUH",
    threatLabelEn: "THREAT TIER III • FORMIDABLE",
    badgeColor: "#ea580c",
    bgClass: "from-orange-950/40 to-slate-900/80 border-orange-500/30",
    bulletColor: "#78716c",
    lore: "Rezim totaliter militeristik yang dipimpin oleh High Marshal Valerius von Eisenhardt. Mengubah setiap pulau taklukan menjadi tambang kerja paksa dan galangan kapal perang berlapis pelat baja uap tebal. Mereka memiliki ambisi perang paling ekspansif di samudra, memagari wilayah kekuasaan dengan ranjau berduri dan meluncurkan taji penabrak bertenaga uap jelaga.",
    loreEn: "A totalitarian militaristic regime commanded by High Marshal Valerius von Eisenhardt. Transforming every conquered island into forced-labor mine shafts and steam ironclad shipyards. Possessing the most aggressive expansionist war ambitions, ringing their waters with spiked sea mines and devastating steam-boosted prow rams.",
    tiers: [
      { level: 1, name: "Sekoci Perisai Berduri", nameEn: "Spiked Shield Skiff", hp: 90, speed: 2.0, damage: 15, radius: 25, desc: "Perahu besi kusam dengan taji penusuk di haluan depan dan perisai baja samping.", descEn: "Tarnished iron skiff sporting a jagged prow ram and armored bulwarks." },
      { level: 2, name: "Pembelah Karang Baja", nameEn: "Steel Reef Breaker", hp: 220, speed: 2.2, damage: 25, radius: 32, desc: "Kapal perang lapis pelat baja tebal dengan cerobong asap tunggal yang mengepulkan jelaga hitam pekat.", descEn: "Armor-plated vessel with a single soot-belching smokestack." },
      { level: 3, name: "Mesin Jagal Laut Valerius", nameEn: "Valerius Naval Juggernaut", hp: 480, speed: 2.4, damage: 36, radius: 42, desc: "Benteng besi uap raksasa kebanggaan High Marshal dengan ketahanan tabrakan ekstrem dan meriam baja tempa berat.", descEn: "Massive iron steam fortress of the High Marshal with extreme ramming resilience and heavy forged cannons." }
    ]
  },
  viking: {
    id: 'viking',
    name: "Klan Penakluk Es Viking",
    nameEn: "Frost-Weaver Viking Raiders",
    species: "Jarl Ragnvaldr Frost-Weaver",
    speciesEn: "Jarl Ragnvaldr Frost-Weaver",
    threatLevel: 4,
    threatLabel: "TINGKAT ANCAMAN IV • BERBAHAYA",
    threatLabelEn: "THREAT TIER IV • DANGEROUS",
    badgeColor: "#38bdf8",
    bgClass: "from-sky-950/40 to-slate-900/80 border-sky-500/30",
    bulletColor: "#7dd3fc",
    lore: "Dipimpin oleh Jarl Ragnvaldr Frost-Weaver, bangsa utara tangguh yang menjunjung persaudaraan internal namun memperlakukan orang luar sebagai budak atau korban jarahan tanpa ampun. Mewarisi sihir es purba yang sanggup membekukan ombak samudra, melumpuhkan laju kemudi musuh dengan ballista pembeku, dan menyulut amukan tempur lewat tiupan sangkakala perang.",
    loreEn: "Led by Jarl Ragnvaldr Frost-Weaver, hardened northern raiders bound by fierce internal brotherhood who enslave or plunder all outsiders without mercy. Wielding ancient preserved Frost magic to freeze ocean swells, cripple enemy rudders with frost ballistas, and ignite battle frenzies with roaring war horns.",
    tiers: [
      { level: 1, name: "Snekkja Salju", nameEn: "Snow Snekkja", hp: 80, speed: 2.6, damage: 16, radius: 24, desc: "Perahu naga es ramping dengan dayung berirama, balutan rune beku, dan haluan ukir kepala naga kayu.", descEn: "Slender ice dragon skiff with rhythmic oars, frozen runes, and a carved wooden dragonhead." },
      { level: 2, name: "Skeid Pembantai Fjord", nameEn: "Fjord Skeid Raider", hp: 210, speed: 2.8, damage: 26, radius: 31, desc: "Kapal perang fjord lapis perisai ganda dengan taji es depan, dayung cepat, dan peluncur tombak es.", descEn: "Double-shielded fjord warship with ice prow ram, swift oars, and frost spear ballista." },
      { level: 3, name: "Drakkar Kerajaan Frost-Weaver", nameEn: "Frost-Weaver Royal Drakkar", hp: 490, speed: 3.2, damage: 38, radius: 42, desc: "Drakkar perang legendaris sang Jarl bertaring mammoth purba, kepala naga kembar bertanduk emas, dan aura sihir es pembeku samudra.", descEn: "Legendary royal flagship of the Jarl armed with mammoth tusk rams, gold-horned dragon crests, and ocean-freezing frost magic." }
    ]
  },
  mist: {
    id: 'mist',
    name: "Kultus Kabut Terkutuk",
    nameEn: "Accursed Mist Cult",
    species: "Cendekiawan & Ilmuwan Pembelot",
    speciesEn: "Apostate Scholars & Cultists",
    threatLevel: 5,
    threatLabel: "TINGKAT ANCAMAN V • MEMATIKAN",
    threatLabelEn: "THREAT TIER V • LETHAL",
    badgeColor: "#06b6d4",
    bgClass: "from-cyan-950/40 to-slate-900/80 border-cyan-500/30",
    bulletColor: "#22d3ee",
    lore: "Kelompok ilmuwan dan cendekiawan elit yang awalnya didanai oleh Kesultanan Gold untuk meneliti anomali di balik kabut tebal. Di sana mereka menemukan Laut Darah yang terus meluas menelan bumi, pulau-pulau dari daging dan tulang purba, serta manuskrip ramalan kiamat. Didorong kegilaan atas kepunahan dunia yang tak terhindarkan, mereka membelot dari Gold dan membentuk sekte okultis menyambut datangnya kiamat dengan lentera jiwa toska dan orba arwah pelacak.",
    loreEn: "An elite enclave of scientists and scholars originally funded by Gold to investigate anomalies beyond the thick mists. There they discovered the expanding Blood Sea swallowing the globe, fleshy bone islands, and apocalyptic prophecies. Driven to insanity by the unavoidable doom of mankind, they abandoned Gold to form an occult sect welcoming the apocalypse with teal soul lanterns and homing spirit orbs.",
    tiers: [
      { level: 1, name: "Sekoci Sesaji Kabut", nameEn: "Mist Sacrificial Skiff", hp: 85, speed: 2.8, damage: 18, radius: 24, desc: "Perahu kayu kelabu berlayar sobek dengan lentera jiwa berpendar toska yang menembakkan arwah.", descEn: "Ashen timber boat with tattered sails and a glowing teal spirit lantern launching ghostly embers." },
      { level: 2, name: "Bahtera Arwah Gentayangan", nameEn: "Wraith Ark", hp: 230, speed: 3.0, damage: 30, radius: 31, desc: "Kapal bermastaka kerangka paus raksasa yang memancarkan kabut roh dingin dan anomali navigasi.", descEn: "Vessel adorned with colossal whale ribs radiating supernatural chilling fog and navigational anomalies." },
      { level: 3, name: "Katedral Kiamat Tenggelam", nameEn: "Sunken Cataclysm Cathedral", hp: 520, speed: 3.3, damage: 44, radius: 42, desc: "Kuil terapung seram penuh rusuk tulang belulang dengan mata okultis kembar yang meluncurkan kutukan kepunahan abadi.", descEn: "Eerie floating cathedral framed by ribcage pillars and twin occult eyes projecting eternal extinction curses." }
    ]
  },
  blood: {
    id: 'blood',
    name: "Teror Palung Laut Darah (Leviathan)",
    nameEn: "Abyssal Blood Sea Leviathans",
    species: "Monster Neraka Purba (Bukan Manusia)",
    speciesEn: "Primordial Hell Abominations (Non-Human)",
    threatLevel: 6,
    threatLabel: "TINGKAT ANCAMAN VI • APEX ABISAL",
    threatLabelEn: "THREAT TIER VI • ABYSSAL APEX",
    badgeColor: "#ef4444",
    bgClass: "from-red-950/60 to-slate-900/80 border-red-500/40",
    bulletColor: "#f43f5e",
    lore: "Monster neraka purba yang bangkit dari palung terdalam Laut Darah, mendiami bekas reruntuhan peradaban manusia kuno yang tenggelam. Merupakan manifestasi siklus evolusi neraka tergelap yang memangsa segala bentuk kehidupan. Menyerang kapal pengembara dengan tentakel raksasa pengoyak lambung, semburan empedu korosif beracun, dan mulut melingkar raksasa pemangsa samudra.",
    loreEn: "Primordial hell monsters rising from the deepest trenches of the Blood Sea, inhabiting the sunken ruins of drowned human civilizations. Dark evolutionary apex terrors hunting all living forms with hull-cleaving colossal tentacles, venomous corrosive bile, and ocean-swallowing circular jaws.",
    tiers: [
      { level: 1, name: "Larva Daging Pengintai", nameEn: "Flesh Scout Larva", hp: 140, speed: 3.2, damage: 22, radius: 26, desc: "Kutu parasit laut merah berduri kitin yang melata lincah di permukaan air memangsa sisa bangkai kapal.", descEn: "Crimson parasitic sea crawler skittering swiftly along the ocean surface scavenging shipwrecks." },
      { level: 2, name: "Hydra Palung Abisal", nameEn: "Abyssal Hydra", hp: 360, speed: 3.4, damage: 36, radius: 34, desc: "Monster bercabang tentakel dengan sirip berdarah, taji kitin pembelah kapal, dan semprotan empedu korosif.", descEn: "Multi-tentacled abomination armed with sanguine fins, chitin rams, and corrosive bile venom." },
      { level: 3, name: "Sang Pemangsa Jiwa (Ancient Leviathan)", nameEn: "Ancient Leviathan (Deep-Trench Apex)", hp: 800, speed: 3.6, damage: 52, radius: 46, desc: "Bencana hidup palung abisal dengan 6 mata merah membara, pusaran air maut, taring melingkar raksasa, dan tentakel pencabut nyawa.", descEn: "Living cataclysm of the abyssal deep with 6 crimson eyes, maelstrom vortexes, circular jaws, and lethal whip tentacles." }
    ]
  },
  pirate: {
    id: 'pirate',
    name: "Bajak Laut Selat Liar",
    nameEn: "Wild Strait Corsairs",
    species: "Perompak Samudra Bebas",
    speciesEn: "Rogue Ocean Corsairs",
    threatLevel: null,
    threatLabel: "FRAKSI LIAR • PEROMPAK BEBAS",
    threatLabelEn: "ROGUE FACTION • WILD CORSAIRS",
    badgeColor: "#f97316",
    bgClass: "from-zinc-950/70 to-slate-900/90 border-orange-500/40",
    bulletColor: "#f97316",
    lore: "Kawanan bajak laut pemberontak dan perompak buas yang bersarang di sekitar pulau-pulau karang terpencil tak berpenghuni. Berlayar dengan kapal bercat hitam kelam dan panji tengkorak merah, mereka menyergap pelaut yang melintas sendirian ataupun dalam armada serigala laut tanpa memedulikan diplomasi faksi.",
    loreEn: "Renegade buccaneers nesting in secluded uninhabited reef islets, sailing under black pitch hulls and crimson skull pennants, ambushing any passing solitary vessels or convoys regardless of faction diplomacy.",
    tiers: [
      { level: 1, name: "Sekoci Penyamun", nameEn: "Raider Skiff", hp: 75, speed: 2.7, damage: 13, radius: 24, desc: "Sekoci gesit bercat hitam arang dengan layar robek bertengkorak dan haluan belati penusuk.", descEn: "Nimble charcoal-painted skiff with tattered skull sail and dagger ram." },
      { level: 2, name: "Brigantin Bendera Tengkorak", nameEn: "Jolly Roger Brigantine", hp: 175, speed: 2.8, damage: 21, radius: 31, desc: "Kapal layar ganda hitam legam dengan lambang tengkorak putih, meriam besi tempa, dan taji penabrak.", descEn: "Twin-masted black vessel bearing skull emblems, forged iron broadsides, and a heavy ram." },
      { level: 3, name: "Galleon Kutukan Badai", nameEn: "Storm Curse Galleon", hp: 430, speed: 3.0, damage: 33, radius: 42, desc: "Dreadnought bajak laut raksasa bertiang tiga dengan layar bertengkorak kembar, lambung baja hitam, dan deretan meriam broadside ganas.", descEn: "Three-masted dreadnought flagship bearing twin skull sails, black armor, and ferocious broadside batteries." }
    ]
  }
};
CLAN_LORE.batavia = CLAN_LORE.gold;

// Unique individual Pirate Ship & Dread Captain Names
const PIRATE_SHIP_NAMES = [
  "Kapal 'Hantu Selat' (Kapt. Badai Hitam)",
  "Kapal 'Mata Belati' (Kapt. Jack Gagak)",
  "Kapal 'Gagak Bangkai' (Kapt. Siliwangi)",
  "Kapal 'Darah Hitam' (Kapt. Redbeard)",
  "Kapal 'Hiu Karang' (Kapt. Morgan)",
  "Kapal 'Siluman Laut' (Kapt. Cakar Besi)",
  "Kapal 'Bintang Hitam' (Kapt. Alap-Alap)",
  "Kapal 'Bangkai Neraka' (Kapt. Moros)",
  "Kapal 'Kutukan Malaka' (Kapt. Braja)",
  "Kapal 'Belati Karang' (Kapt. Belang)",
  "Kapal 'Tengkorak Baja' (Kapt. Raga)",
  "Kapal 'Serigala Ombak' (Kapt. Duri Laut)",
  "Kapal 'Pemberontak Senja' (Kapt. Malik)",
  "Kapal 'Taring Buana' (Kapt. Baruna Hitam)",
  "Kapal 'Maut Kelabu' (Kapt. Jagal)",
  "Kapal 'Krakatoa Api' (Kapt. Keling)",
  "Kapal 'Pembalas Dendam' (Kapt. Lautan)",
  "Kapal 'Sayap Gagak' (Kapt. Ruyung)",
  "Kapal 'Pedang Karang' (Kapt. Arung)",
  "Kapal 'Badai Malam' (Kapt. Sembara)"
];

function getRandomPirateShipName() {
  return PIRATE_SHIP_NAMES[Math.floor(Math.random() * PIRATE_SHIP_NAMES.length)];
}

// Island Conquest Reinforcement Parameters by Island Tier
const CONQUEST_REINFORCEMENT_CONFIG = {
  4: {
    waves: 1,
    totalWaves: 1,
    interval: 14.0,
    waveInterval: 14.0,
    countPerWave: 2,
    shipsPerWave: [2],
    minTier: 0,
    maxTier: 0,
    tiers: [0],
    title: "Patroli Pesisir",
    arrivalNotice: "Patroli Pesisir Merapat!"
  },
  3: {
    waves: 2,
    totalWaves: 2,
    interval: 12.0,
    waveInterval: 12.0,
    countPerWave: 3,
    shipsPerWave: [2, 3],
    minTier: 0,
    maxTier: 1,
    tiers: [0, 1],
    title: "Armada Pengawal Niaga",
    arrivalNotice: "Armada Pengawal Niaga Merapat!"
  },
  2: {
    waves: 3,
    totalWaves: 3,
    interval: 11.0,
    waveInterval: 11.0,
    countPerWave: 3,
    shipsPerWave: [3, 3, 3],
    minTier: 1,
    maxTier: 2,
    tiers: [1, 2],
    title: "Skuadron Kapal Tempur",
    arrivalNotice: "Skuadron Tempur Lapis Baja Merapat!"
  },
  1: {
    waves: 4,
    totalWaves: 4,
    interval: 10.0,
    waveInterval: 10.0,
    countPerWave: 4,
    shipsPerWave: [3, 4, 4, 4],
    minTier: 1,
    maxTier: 2,
    tiers: [1, 2],
    title: "Bala Bantuan Legiun Palung",
    arrivalNotice: "Armada Induk Legiun Abisal Menyerbu!"
  }
};

let currentWorldGenSeed = 104928;
let currentWorldGenNumber = 1;

// Player Spawn Point dynamically berthed at Home Port Pier
const PLAYER_SPAWN = { x: 28, y: -70, angle: -Math.PI / 2 };

// Phase 3: Multi-Layer Island Palettes & Procedural Biome Characteristics
const ISLAND_PALETTES = {
  haven: {
    sand: '#eab308',
    lowland: '#15803d',
    highland: '#14532d',
    reef: 'rgba(20, 184, 166, 0.35)',
    surf: 'rgba(255, 255, 255, 0.85)',
    propType: 'palm'
  },
  merchant: {
    sand: '#facc15',
    lowland: '#16a34a',
    highland: '#15803d',
    reef: 'rgba(45, 212, 191, 0.38)',
    surf: 'rgba(255, 255, 255, 0.85)',
    propType: 'market'
  },
  gold: { // Batavia
    sand: '#d97706',
    lowland: '#1e3a1e',
    highland: '#142a14',
    reef: 'rgba(13, 148, 136, 0.32)',
    surf: 'rgba(254, 243, 199, 0.75)',
    propType: 'batavia'
  },
  iron: { // Karang Besi
    sand: '#57534e',
    lowland: '#334155',
    highland: '#0f172a',
    reef: 'rgba(71, 85, 105, 0.38)',
    surf: 'rgba(226, 232, 240, 0.7)',
    propType: 'iron'
  },
  mist: { // Sekte Kabut
    sand: '#71717a',
    lowland: '#3f3f46',
    highland: '#18181b',
    reef: 'rgba(100, 116, 139, 0.35)',
    surf: 'rgba(192, 132, 252, 0.5)',
    propType: 'mist'
  },
  blood: { // Skull / Abisal
    sand: '#881337',
    lowland: '#4c0519',
    highland: '#1c0209',
    reef: 'rgba(225, 29, 72, 0.35)',
    surf: 'rgba(251, 113, 133, 0.65)',
    propType: 'blood'
  },
  viking: { // Snowy Fjord
    sand: '#f8fafc',
    lowland: '#cbd5e1',
    highland: '#475569',
    reef: 'rgba(56, 189, 248, 0.4)',
    surf: 'rgba(255, 255, 255, 0.9)',
    propType: 'viking'
  },
  wokou: { // Bamboo & Pagoda
    sand: '#fde047',
    lowland: '#15803d',
    highland: '#14532d',
    reef: 'rgba(13, 148, 136, 0.35)',
    surf: 'rgba(254, 240, 138, 0.75)',
    propType: 'wokou'
  },
  neutral: {
    sand: '#ca8a04',
    lowland: '#166534',
    highland: '#14532d',
    reef: 'rgba(20, 184, 166, 0.32)',
    surf: 'rgba(255, 255, 255, 0.75)',
    propType: 'palm'
  }
};

function getIslandPalette(isl) {
  if (isl.isSkullIsland || isl.isFlesh) return ISLAND_PALETTES.blood;
  if (isl.id === 'haven') return ISLAND_PALETTES.haven;
  if (isl.isShopIsland) return ISLAND_PALETTES.merchant;
  return ISLAND_PALETTES[isl.clan] || ISLAND_PALETTES.neutral;
}

// Fast hex to [r, g, b] parser
function parseHexColor(hex) {
  if (!hex || typeof hex !== 'string' || hex[0] !== '#') return [128, 128, 128];
  if (hex.length === 4) {
    return [
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
      parseInt(hex[3] + hex[3], 16)
    ];
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

// Modulate island colors with day/night celestial lighting
function modulateIslandColor(hex, dnState) {
  if (!dnState || typeof dnState.ambientMult !== 'number') return hex;
  const [r, g, b] = parseHexColor(hex);
  const amb = dnState.ambientMult;
  const ambRGB = Array.isArray(dnState.ambientRGB) ? dnState.ambientRGB : [255, 255, 255];
  const tr = ambRGB[0] / 255;
  const tg = ambRGB[1] / 255;
  const tb = ambRGB[2] / 255;

  let finalR, finalG, finalB;
  if (dnState.isDay) {
    // Daytime / Golden hour: blend base color scaled by ambient luminance with atmospheric tint
    finalR = Math.round(Math.min(255, Math.max(15, r * (amb * 0.65 + 0.35 * tr))));
    finalG = Math.round(Math.min(255, Math.max(20, g * (amb * 0.65 + 0.35 * tg))));
    finalB = Math.round(Math.min(255, Math.max(25, b * (amb * 0.65 + 0.35 * tb))));
  } else {
    // Nocturnal / Moonlight: cool silvery-slate desaturation with ambient floor
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const nightAmb = Math.max(0.32, amb * 1.15); // keep island readable (32% - 40% luminance)
    finalR = Math.round(Math.min(255, Math.max(12, (r * 0.42 + lum * 0.38 + ambRGB[0] * 0.20) * nightAmb)));
    finalG = Math.round(Math.min(255, Math.max(18, (g * 0.42 + lum * 0.38 + ambRGB[1] * 0.20) * nightAmb)));
    finalB = Math.round(Math.min(255, Math.max(28, (b * 0.42 + lum * 0.38 + ambRGB[2] * 0.20) * nightAmb)));
  }

  return `rgb(${finalR}, ${finalG}, ${finalB})`;
}

function getModulatedIslandPalette(isl, dnState) {
  const base = getIslandPalette(isl);
  if (!dnState || typeof dnState.ambientMult !== 'number') return base;
  
  const isNight = !dnState.isDay;
  const surfAlpha = isNight ? 0.42 : 0.85;
  const reefAlpha = isNight ? 0.18 : 0.35;
  
  return {
    sand: modulateIslandColor(base.sand, dnState),
    lowland: modulateIslandColor(base.lowland, dnState),
    highland: modulateIslandColor(base.highland, dnState),
    reef: isNight ? `rgba(15, 76, 92, ${reefAlpha})` : base.reef,
    surf: `rgba(255, 255, 255, ${surfAlpha})`,
    propType: base.propType
  };
}

// Organic Archipelago Islands: Procedurally Generated per World Generation
const WORLD_ISLANDS = [];

// Procedural Organic Coastline Formula: Returns exact radius at any angle theta
function getIslandRadiusAt(isl, angle) {
  const seed = isl.seed || 3.14;
  const wave1 = Math.sin(angle * 3 + seed) * (isl.radius * 0.12);
  const wave2 = Math.cos(angle * 5 + seed * 1.7) * (isl.radius * 0.08);
  const wave3 = Math.sin(angle * 7 - seed * 2.3) * (isl.radius * 0.04);
  const wave4 = Math.cos(angle * 2 - seed * 0.9) * (isl.radius * 0.06);
  return isl.radius + wave1 + wave2 + wave3 + wave4;
}

// Pseudo-Random Number Generator (PRNG - Mulberry32 for deterministic generational maps)
function createSeededRng(seed) {
  let s = Math.abs(typeof seed === 'number' ? seed : (function(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i) | 0;
    return Math.abs(hash) || 12345;
  })(String(seed)));
  return function() {
    let t = s += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generational Archipelago Generator: Procedural Islands placed across Concentric Ocean Rings
function generateGenerationalWorld(seed, genNumber) {
  if (seed === undefined || seed === null) {
    seed = Math.floor(Math.random() * 10000000) + 1;
  }
  if (genNumber === undefined || genNumber === null) {
    genNumber = currentWorldGenNumber || 1;
  }

  currentWorldGenSeed = seed;
  currentWorldGenNumber = genNumber;

  const rng = createSeededRng(seed);
  WORLD_ISLANDS.length = 0;

  // Collision-free placement helper ensuring wide open sea lanes
  function placeIsland(template, minDist, maxDist, baseAngle, angleSpread) {
    let bestX = 0;
    let bestY = 0;
    let bestRadius = template.minRadius || 250;
    let placed = false;

    for (let attempt = 0; attempt < 36; attempt++) {
      const ang = baseAngle + (rng() - 0.5) * angleSpread;
      const dist = minDist + rng() * (maxDist - minDist);
      const candX = Math.cos(ang) * dist;
      const candY = Math.sin(ang) * dist;
      const candRad = template.minRadius + Math.floor(rng() * (template.maxRadius - template.minRadius));

      let overlap = false;
      for (let i = 0; i < WORLD_ISLANDS.length; i++) {
        const other = WORLD_ISLANDS[i];
        const d = Math.hypot(candX - other.x, candY - other.y);
        if (d < candRad + other.radius + 320) {
          overlap = true;
          break;
        }
      }

      if (!overlap) {
        bestX = candX;
        bestY = candY;
        bestRadius = candRad;
        placed = true;
        break;
      }
    }

    if (!placed) {
      const ang = baseAngle + (WORLD_ISLANDS.length * 0.45);
      const dist = minDist + 120;
      bestX = Math.cos(ang) * dist;
      bestY = Math.sin(ang) * dist;
      bestRadius = template.minRadius;
    }

    const seedVal = Math.round((rng() * 990 + 10) * 10) / 10;
    const dockAng = template.dockAngle !== undefined 
      ? template.dockAngle 
      : (Math.atan2(-bestY, -bestX) + (rng() - 0.5) * 0.8);

    const islandObj = {
      id: template.id,
      name: template.name,
      clan: template.clan,
      tier: template.tier !== undefined ? template.tier : 4,
      isShopIsland: Boolean(template.isShopIsland),
      isHomePort: Boolean(template.isHomePort),
      isConquered: Boolean(template.isConquered),
      x: Math.round(bestX),
      y: Math.round(bestY),
      radius: bestRadius,
      seed: seedVal,
      color: template.color,
      hasLighthouse: template.hasLighthouse !== undefined ? Boolean(template.hasLighthouse) : (Boolean(template.isShopIsland) || (template.tier !== undefined && template.tier <= 2)),
      hasFortress: Boolean(template.hasFortress),
      hasSmokestack: Boolean(template.hasSmokestack),
      hasOccultCircle: Boolean(template.hasOccultCircle),
      hasLonghouse: Boolean(template.hasLonghouse),
      hasTorii: Boolean(template.hasTorii),
      hasPagoda: Boolean(template.hasPagoda),
      isFlesh: Boolean(template.isFlesh),
      isSkullIsland: Boolean(template.isSkullIsland),
      isUninhabited: Boolean(template.isUninhabited),
      isSandOnly: Boolean(template.isSandOnly),
      isRockOnly: Boolean(template.isRockOnly),
      dockAngle: dockAng,
      desc: template.desc || ""
    };

    islandObj.dockDist = Math.round(getIslandRadiusAt(islandObj, islandObj.dockAngle) - 18);

    // Invalidate multi-layer geometry cache for renderer to compute fresh spline once
    islandObj._cachedOuter = null;
    islandObj._cachedInner = null;
    islandObj._cachedReef = null;
    islandObj._cachedHill = null;
    islandObj._cachedProps = null;
    islandObj._cachedLighthouse = null;
    islandObj._cachedPier = null;
    islandObj._cachedFoliage = null;
    islandObj._cachedSkulls = null;
    islandObj._cachedRibs = null;

    WORLD_ISLANDS.push(islandObj);
    return islandObj;
  }

  // 1. RING 0: Home Port (Nusa Damai - Haven)
  const havenDist = 160 + rng() * 60;
  const havenAng = Math.PI * 0.5 + (rng() - 0.5) * 0.5; // Southern calm quadrant
  const havenRad = 230 + Math.floor(rng() * 30);
  const havenDockAng = -Math.PI * 0.5 + (rng() - 0.5) * 0.3; // Northern open pier
  const havenSeed = Math.round((rng() * 80 + 20) * 10) / 10;

  const haven = {
    id: 'haven',
    name: "Nusa Damai - Pelabuhan Asal",
    clan: 'neutral',
    tier: 0,
    isHomePort: true,
    isConquered: true,
    x: Math.round(Math.cos(havenAng) * havenDist),
    y: Math.round(Math.sin(havenAng) * havenDist),
    radius: havenRad,
    seed: havenSeed,
    color: '#166534',
    sandColor: '#ca8a04',
    hasLighthouse: true,
    dockAngle: havenDockAng,
    desc: "Pangkalan armada Anda di Laut Tenang. Tempat berlabuh aman dengan galangan kapal."
  };
  haven.dockDist = Math.round(getIslandRadiusAt(haven, haven.dockAngle) - 18);
  haven._cachedOuter = null;
  haven._cachedInner = null;
  haven._cachedReef = null;
  haven._cachedHill = null;
  haven._cachedProps = null;
  haven._cachedLighthouse = null;
  haven._cachedPier = null;
  haven._cachedFoliage = null;
  WORLD_ISLANDS.push(haven);

  // Update dynamic player spawn aligned at Haven pier
  PLAYER_SPAWN.x = Math.round(haven.x + Math.cos(haven.dockAngle) * (haven.dockDist + 45));
  PLAYER_SPAWN.y = Math.round(haven.y + Math.sin(haven.dockAngle) * (haven.dockDist + 45));
  PLAYER_SPAWN.angle = haven.dockAngle;

  // 1.5. RING 0 (Outer Calm Waters): Peaceful Outlying Atolls (2000 - 7500m)
  placeIsland({
    id: 'haven_atoll_1',
    name: "Atol Nelayan Damai",
    clan: 'neutral',
    tier: 4,
    minRadius: 180,
    maxRadius: 220,
    color: '#166534',
    sandColor: '#fde047',
    desc: "Atol persinggahan nelayan Nusa Damai tempat menjemur jala dan mengisi air tawar."
  }, 2800, 4500, Math.PI * 0.15, Math.PI * 0.7);

  placeIsland({
    id: 'haven_atoll_2',
    name: "Pulau Karang Kelapa",
    clan: 'neutral',
    tier: 4,
    minRadius: 190,
    maxRadius: 240,
    color: '#15803d',
    sandColor: '#facc15',
    desc: "Pulau kecil berpasir putih penanda batas luar Teluk Damai sebelum memasuki perairan berombak."
  }, 5000, 7200, Math.PI * 0.65, Math.PI * 0.8);

  // 2. RING 1: Perairan Senja Berombak (8000 - 22000m)
  // Shop Island 1: Pasar Apung Senja (Trading Outpost Ring 1)
  placeIsland({
    id: 'shop_haven_senja',
    name: "Pasar Apung Senja",
    clan: 'merchant',
    tier: 0,
    isShopIsland: true,
    isConquered: true,
    minRadius: 180,
    maxRadius: 220,
    color: '#15803d',
    sandColor: '#fde047',
    desc: "Bandar terapung para saudagar rempah dengan galangan kapal & perbekalan lengkap."
  }, 11000, 15000, Math.PI * 0.95, Math.PI * 0.7);

  // Batavia Outpost (Gold Clan, Tier 3)
  placeIsland({
    id: 'batavia_outpost',
    name: "Benteng Niaga Batavia",
    clan: 'gold',
    tier: 3,
    minRadius: 320,
    maxRadius: 380,
    color: '#1e3a1e',
    sandColor: '#d97706',
    hasFortress: true,
    desc: "Pangkalan markas Klan Sindikat Emas dengan gudang rempah megah."
  }, 13000, 17500, Math.PI * 0.25, Math.PI * 0.7);

  // Iron Forge Isle (Iron Clan, Tier 3)
  placeIsland({
    id: 'iron_forge_isle',
    name: "Pulau Peleburan Besi Hitam",
    clan: 'iron',
    tier: 3,
    minRadius: 320,
    maxRadius: 370,
    color: '#334155',
    sandColor: '#57534e',
    hasSmokestack: true,
    desc: "Pabrik taji besi klan pemburu berbatu tajam dengan dermaga berjelaga."
  }, 14000, 18500, Math.PI * 1.25, Math.PI * 0.7);

  // Merchant Key / Free Trading Atoll (Tier 4)
  const innerKeyNames = ["Pos Cukai Selat Batavia", "Karang Saudagar Bebas", "Dermaga Rempah Emas"];
  placeIsland({
    id: 'merchant_key',
    name: innerKeyNames[Math.floor(rng() * innerKeyNames.length)],
    clan: rng() > 0.4 ? 'gold' : 'neutral',
    tier: 4,
    minRadius: 230,
    maxRadius: 280,
    color: '#1e3a1e',
    sandColor: '#ca8a04',
    desc: "Pos niaga persinggahan kapal dagang di perairan senja."
  }, 9500, 14000, Math.PI * 1.85, Math.PI * 0.8);

  // Batavia Spice Cove (Tier 4)
  placeIsland({
    id: 'batavia_cove',
    name: "Teluk Rempah Batavia",
    clan: 'gold',
    tier: 4,
    minRadius: 240,
    maxRadius: 290,
    color: '#166534',
    sandColor: '#d97706',
    desc: "Dermaga transit rempah dan perbekalan armada niaga emas."
  }, 16000, 21000, rng() * Math.PI * 2, Math.PI * 0.85);

  // Wokou Bamboo Cove (Wokou Clan, Tier 3)
  placeIsland({
    id: 'wokou_bamboo_cove',
    name: "Teluk Bambu Naga Wokou",
    clan: 'wokou',
    tier: 3,
    minRadius: 300,
    maxRadius: 360,
    color: '#15803d',
    sandColor: '#fde047',
    hasTorii: true,
    hasPagoda: true,
    desc: "Pangkalan persembunyian jung bajak laut Wokou di balik rumpun bambu lebat dan gerbang Torii merah."
  }, 15000, 20500, Math.PI * 0.65, Math.PI * 0.7);

  // Iron Slag Watch (Iron Clan, Tier 4)
  placeIsland({
    id: 'iron_slag_watch',
    name: "Pos Tinjau Jelaga Besi",
    clan: 'iron',
    tier: 4,
    minRadius: 240,
    maxRadius: 290,
    color: '#334155',
    sandColor: '#64748b',
    hasSmokestack: true,
    desc: "Pos peninjau klan besi terdepan dengan cerobong jelaga kecil dan dermaga taji."
  }, 10500, 14500, rng() * Math.PI * 2, Math.PI * 0.8);

  // Wokou Smuggler Cove (Wokou Clan, Tier 4)
  placeIsland({
    id: 'wokou_smuggler_cove',
    name: "Teluk Selundup Jung Wokou",
    clan: 'wokou',
    tier: 4,
    minRadius: 230,
    maxRadius: 280,
    color: '#15803d',
    sandColor: '#fde047',
    hasTorii: true,
    desc: "Sarang penyelundup roket mesiu dan perbekalan bajak laut Wokou di tepi perairan senja."
  }, 11500, 16000, rng() * Math.PI * 2, Math.PI * 0.8);

  // Viking Raider Outpost (Viking Clan, Tier 4)
  placeIsland({
    id: 'viking_raider_outpost',
    name: "Pos Pengintai Drakkar Viking",
    clan: 'viking',
    tier: 4,
    minRadius: 240,
    maxRadius: 290,
    color: '#94a3b8',
    sandColor: '#f1f5f9',
    hasLonghouse: true,
    desc: "Pangkalan kayu terluar prajurit Norse yang mengamati alur pelayaran kapal dagang."
  }, 12500, 17500, rng() * Math.PI * 2, Math.PI * 0.85);

  // Mist Whispering Shrine (Mist Clan, Tier 4)
  placeIsland({
    id: 'mist_whispering_shrine',
    name: "Altar Bisikan Kabut",
    clan: 'mist',
    tier: 4,
    minRadius: 230,
    maxRadius: 280,
    color: '#1e1b4b',
    sandColor: '#475569',
    hasOccultCircle: true,
    desc: "Altar terpencil tempat para pengikut kabut melantunkan mantra penyesat kompas."
  }, 13500, 19000, rng() * Math.PI * 2, Math.PI * 0.8);

  // 3. RING 2: Selat Badai Karang Besi (22000 - 42000m)
  // Shop Island 2: Bandar Dagang Karang Tengah (Trading Outpost Ring 2)
  placeIsland({
    id: 'shop_karang_tengah',
    name: "Bandar Dagang Karang Tengah",
    clan: 'merchant',
    tier: 0,
    isShopIsland: true,
    isConquered: true,
    minRadius: 180,
    maxRadius: 220,
    color: '#0d9488',
    sandColor: '#facc15',
    desc: "Pos niaga persinggahan bebas di selat badai. Tempat berlabuh aman bagi para pengembara."
  }, 26000, 32000, -Math.PI * 0.25, Math.PI * 0.8);

  // Shark Reef (Iron Clan Forward Outpost, Tier 2)
  placeIsland({
    id: 'shark_reef',
    name: "Karang Gigi Hiu",
    clan: 'iron',
    tier: 2,
    minRadius: 290,
    maxRadius: 350,
    color: '#1e293b',
    sandColor: '#475569',
    hasSmokestack: true,
    desc: "Pos depan penjaga selat barat berkarang curam dan berombak ganas."
  }, 24000, 31000, -Math.PI * 0.6, Math.PI * 0.8);

  // Pirate Stronghold (Tier 2)
  const pirateNames = ["Karang Badai Tengkorak", "Teluk Penyamun Gelap", "Atol Arwah Kelabu", "Karang Pembakar Laut"];
  placeIsland({
    id: 'pirate_stronghold',
    name: pirateNames[Math.floor(rng() * pirateNames.length)],
    clan: rng() > 0.5 ? 'mist' : 'iron',
    tier: 2,
    minRadius: 280,
    maxRadius: 340,
    color: '#1e293b',
    sandColor: '#334155',
    desc: "Tempat persembunyian rahasia armada perompak samudra."
  }, 33000, 40000, Math.PI * 1.5, Math.PI * 0.9);

  // Iron West Bastion (Tier 2)
  placeIsland({
    id: 'iron_west_bastion',
    name: "Benteng Karang Besi Barat",
    clan: 'iron',
    tier: 2,
    minRadius: 310,
    maxRadius: 360,
    color: '#334155',
    sandColor: '#64748b',
    hasFortress: true,
    hasSmokestack: true,
    desc: "Kubu pertahanan utama Karang Besi dengan meriam baterai berat."
  }, 29000, 37000, Math.PI * 0.8, Math.PI * 0.8);

  // Viking Snowy Fjord Isle (Viking Clan, Tier 3)
  placeIsland({
    id: 'viking_fjord_isle',
    name: "Fjord Salju Jarl Viking",
    clan: 'viking',
    tier: 3,
    minRadius: 320,
    maxRadius: 380,
    color: '#cbd5e1',
    sandColor: '#f8fafc',
    hasLonghouse: true,
    desc: "Pangkalan dingin para perompak salju Norse dengan dermaga drakkar, rumah panjang, dan prasasti runik."
  }, 27000, 35000, Math.PI * 0.3, Math.PI * 0.8);

  // Wokou Red Pagoda Isle (Wokou Clan, Tier 2)
  placeIsland({
    id: 'wokou_red_pagoda',
    name: "Pulau Paviliun Jung Merah",
    clan: 'wokou',
    tier: 2,
    minRadius: 310,
    maxRadius: 370,
    color: '#166534',
    sandColor: '#fde047',
    hasTorii: true,
    hasPagoda: true,
    desc: "Kuil terapung para nakhoda bajak laut Wokou bersenjatakan baterai roket mesiu dan lentera merah."
  }, 31000, 39000, -Math.PI * 0.8, Math.PI * 0.8);

  // Batavia Grand Citadel (Gold Clan, Tier 2)
  placeIsland({
    id: 'batavia_grand_citadel',
    name: "Citadel Emas Batavia",
    clan: 'gold',
    tier: 2,
    minRadius: 330,
    maxRadius: 390,
    color: '#1e3a1e',
    sandColor: '#d97706',
    hasFortress: true,
    desc: "Benteng pertahanan kelas berat Sindikat Emas yang mengawal jalur niaga selat badai."
  }, 28000, 36000, Math.PI * 1.1, Math.PI * 0.8);

  // Mist Crypt Atoll (Mist Clan, Tier 3)
  placeIsland({
    id: 'mist_crypt_atoll',
    name: "Atol Makam Kabut Gelap",
    clan: 'mist',
    tier: 3,
    minRadius: 290,
    maxRadius: 350,
    color: '#0f172a',
    sandColor: '#334155',
    hasOccultCircle: true,
    desc: "Makam keramat tempat kapal-kapal karam masa lampau dipuja oleh kultus kabut."
  }, 25000, 33000, -Math.PI * 0.05, Math.PI * 0.8);

  // Karang Besi Shallows (Iron Clan, Tier 3) - Ring 2
  placeIsland({
    id: 'iron_coral_shallows',
    name: "Dangkal Karang Besi",
    clan: 'iron',
    tier: 3,
    minRadius: 290,
    maxRadius: 350,
    color: '#334155',
    sandColor: '#94a3b8',
    hasFortress: true,
    desc: "Gugusan karang cadas berlapis bijih besi kokoh di ambang selat badai."
  }, 34000, 41000, rng() * Math.PI * 2, Math.PI * 0.85);

  // 4. RING 3: Perairan Kutukan Sekte Kabut (42000 - 62000m)
  // Shop Island 3: Pos Niaga Ambang Kabut (Trading Outpost Ring 3)
  placeIsland({
    id: 'shop_ambang_kabut',
    name: "Pos Niaga Ambang Kabut",
    clan: 'merchant',
    tier: 0,
    isShopIsland: true,
    isConquered: true,
    minRadius: 180,
    maxRadius: 210,
    color: '#334155',
    sandColor: '#cbd5e1',
    desc: "Bazar terapung terakhir para penyelundup sebelum menembus batas Laut Merah."
  }, 44000, 51000, Math.PI * 1.8, Math.PI * 0.8);

  // Viking Frost Bastion (Viking Clan, Tier 2)
  placeIsland({
    id: 'viking_frost_bastion',
    name: "Benteng Es Drakkar Abadi",
    clan: 'viking',
    tier: 2,
    minRadius: 340,
    maxRadius: 400,
    color: '#94a3b8',
    sandColor: '#f8fafc',
    hasLonghouse: true,
    hasFortress: true,
    desc: "Kubu pertahanan terkuat Klan Viking di perairan glasial sebelum gerbang palung merah."
  }, 47000, 56000, -Math.PI * 0.15, Math.PI * 0.85);

  // Mist Atoll (Mist Clan Occult Sanctuary, Tier 2)
  placeIsland({
    id: 'mist_atoll',
    name: "Atol Tulang Belulang Kabut",
    clan: 'mist',
    tier: 2,
    minRadius: 360,
    maxRadius: 430,
    color: '#134e4a',
    sandColor: '#475569',
    hasOccultCircle: true,
    desc: "Lingkaran karang mistis tempat Sekte Kabut merapalkan kutukan arwah."
  }, 46000, 55000, Math.PI * 0.8, Math.PI * 0.9);

  // Ghost Reef (Atol Arwah Kabut, Tier 2)
  placeIsland({
    id: 'ghost_atoll',
    name: "Karang Arwah Berkabut",
    clan: 'mist',
    tier: 2,
    minRadius: 270,
    maxRadius: 330,
    color: '#0f2926',
    sandColor: '#334155',
    desc: "Gugusan karang sunyi di perairan kabut yang sering memikat kapal terdampar."
  }, 51000, 59000, rng() * Math.PI * 2, Math.PI * 0.85);

  // Mist Pagoda Isle (Tier 2)
  placeIsland({
    id: 'mist_pagoda_isle',
    name: "Kuil Pagoda Roh Kabut",
    clan: 'mist',
    tier: 2,
    minRadius: 320,
    maxRadius: 380,
    color: '#1e1b4b',
    sandColor: '#64748b',
    hasOccultCircle: true,
    desc: "Kuil keramat persembunyian tetua Sekte Kabut dengan lentera jiwa ungu."
  }, 43000, 53000, -Math.PI * 0.45, Math.PI * 0.85);

  // Batavia Galleon Redoubt (Gold Clan, Tier 1)
  placeIsland({
    id: 'batavia_galleon_redoubt',
    name: "Kubu Armada Megah Batavia",
    clan: 'gold',
    tier: 1,
    minRadius: 360,
    maxRadius: 420,
    color: '#142a14',
    sandColor: '#f59e0b',
    hasFortress: true,
    desc: "Kubu pertahanan pamungkas kongsi dagang Batavia dengan baterai meriam kuningan kaisar."
  }, 50000, 59000, Math.PI * 0.45, Math.PI * 0.8);

  // Iron Dreadnought Foundry (Iron Clan, Tier 1)
  placeIsland({
    id: 'iron_dreadnought_foundry',
    name: "Pabrik Jagal Karang Besi",
    clan: 'iron',
    tier: 1,
    minRadius: 360,
    maxRadius: 420,
    color: '#1c1917',
    sandColor: '#475569',
    hasFortress: true,
    hasSmokestack: true,
    desc: "Pabrik pembakar raksasa tempat kapal perang besi terkuat ditempa dengan ketel uap kembar."
  }, 48000, 58000, -Math.PI * 0.7, Math.PI * 0.8);

  // Wokou Dragon Fortress (Wokou Clan, Tier 1)
  placeIsland({
    id: 'wokou_dragon_fortress',
    name: "Benteng Armada Kaisar Naga Wokou",
    clan: 'wokou',
    tier: 1,
    minRadius: 360,
    maxRadius: 430,
    color: '#14532d',
    sandColor: '#fde047',
    hasTorii: true,
    hasPagoda: true,
    desc: "Benteng pulau keramat Kaisar Naga Wokou yang terlindung oleh salvo roket naga tanpa henti."
  }, 46000, 56000, Math.PI * 1.2, Math.PI * 0.8);

  // Viking Valhalla Crag (Viking Clan, Tier 1)
  placeIsland({
    id: 'viking_valhalla_crag',
    name: "Karang Tanduk Valhalla Viking",
    clan: 'viking',
    tier: 1,
    minRadius: 360,
    maxRadius: 420,
    color: '#64748b',
    sandColor: '#f8fafc',
    hasLonghouse: true,
    hasFortress: true,
    desc: "Karang es suci tempat para berserker Viking bertarung hingga tetes darah penghabisan."
  }, 53000, 61000, -Math.PI * 0.6, Math.PI * 0.8);

  // Mist Cathedral Crag (Mist Clan, Tier 1)
  placeIsland({
    id: 'mist_cathedral_crag',
    name: "Kuil Katedral Arwah Kabut",
    clan: 'mist',
    tier: 1,
    minRadius: 370,
    maxRadius: 430,
    color: '#090514',
    sandColor: '#334155',
    hasOccultCircle: true,
    desc: "Katedral terapung tertinggi para pendeta Sekte Kabut yang memanggil orba arwah abisal."
  }, 54000, 62000, Math.PI * 0.95, Math.PI * 0.8);

  // 5. RING 4 & 5: Gerbang Palung Neraka & LAUT MERAH (62000 - 86000m - ~7 Menit Pelayaran Penuh)
  // Shop Island 4: Dermaga Ambang Laut Merah
  placeIsland({
    id: 'shop_blood_brink',
    name: "Dermaga Ambang Laut Merah",
    clan: 'merchant',
    tier: 0,
    isShopIsland: true,
    isConquered: true,
    minRadius: 180,
    maxRadius: 210,
    color: '#4c0519',
    sandColor: '#fda4af',
    desc: "Pelabuhan terisolasi di bibir palung merah tempat para pemburu monster abisal mempersiapkan peluru."
  }, 64000, 70000, Math.PI * 0.35, Math.PI * 0.7);

  // Bone Reef (Tier 2)
  placeIsland({
    id: 'bone_reef',
    name: "Gugusan Karang Belulang",
    clan: 'blood',
    tier: 2,
    minRadius: 310,
    maxRadius: 370,
    color: '#1c1917',
    sandColor: '#f1f5f9',
    isSkullIsland: true,
    desc: "Gugusan karang tulang gading purba yang menjulang di batas awal Laut Merah."
  }, 67000, 73000, rng() * Math.PI * 2, Math.PI * 0.85);

  // Abyssal Monolith (Tier 1)
  const abyssalNames = ["Palung Daging Menganga", "Altar Karang Berdarah", "Monolit Purba Abisal"];
  placeIsland({
    id: 'abyssal_monolith',
    name: abyssalNames[Math.floor(rng() * abyssalNames.length)],
    clan: 'blood',
    tier: 1,
    minRadius: 350,
    maxRadius: 410,
    color: '#3f0713',
    sandColor: '#9f1239',
    isFlesh: true,
    desc: "Tonjolan daging karang abisal berdenyut di kedalaman samudra darah."
  }, 70000, 76000, rng() * Math.PI * 2, Math.PI * 0.8);

  // Blood Coral Shallows (Blood Clan, Tier 2) - Exclusively in Laut Darah
  placeIsland({
    id: 'blood_coral_shallows',
    name: "Dangkal Karang Berdarah",
    clan: 'blood',
    tier: 2,
    minRadius: 320,
    maxRadius: 380,
    color: '#4c0519',
    sandColor: '#f43f5e',
    isFlesh: true,
    desc: "Sarang organisme monster berdenyut merah pekat di dalam samudra darah abisal."
  }, 71000, 75500, rng() * Math.PI * 2, Math.PI * 0.85);

  // SKULL ISLAND (Tier 1) - PUSAT LAUT MERAH (78000m)
  placeIsland({
    id: 'skull_island',
    name: "Pulau Tengkorak (Skull Island)",
    clan: 'blood',
    tier: 1,
    minRadius: 420,
    maxRadius: 480,
    color: '#1c1917',
    sandColor: '#f1f5f9',
    isSkullIsland: true,
    desc: "Pulau terkutuk yang terbentuk dari jutaan tumpukan tengkorak dan kerangka paus purba di tengah Laut Merah."
  }, 76000, 81000, rng() * Math.PI * 2, Math.PI * 0.85);

  // Hive Nest (Tier 1 - Ujung Abisal Samudra)
  placeIsland({
    id: 'hive_nest',
    name: "Sarang Induk Sang Pemangsa",
    clan: 'blood',
    tier: 1,
    minRadius: 460,
    maxRadius: 520,
    color: '#450a0a',
    sandColor: '#991b1b',
    isFlesh: true,
    desc: "Jantung terdalam Laut Darah tempat bertenggernya para raksasa abisal purba."
  }, 80000, 86000, rng() * Math.PI * 2, Math.PI * 0.8);

  // 6. GUGUSAN PULAU & ATOL TAK BERPENGHUNI (Scenic Uninhabited Islets, Sandbars & Sea Crags)
  const uninhabitedTemplates = [
    // Ring 1 (2,000m - 10,000m)
    { id: 'islet_kelapa_sunyi', name: "Atol Kelapa Sunyi", minDist: 2200, maxDist: 4800, minR: 50, maxR: 75, color: '#15803d', sand: '#fef08a', desc: "Atol alami berpasir dengan nyiur kelapa yang melambai ditiup angin laut." },
    { id: 'islet_pasir_putih',  name: "Gosong Pasir Putih", minDist: 3500, maxDist: 7200, minR: 45, maxR: 70, isSandOnly: true, sand: '#fef9c3', desc: "Gundukan gosong pasir putih murni tanpa pepohonan yang tersapu riak buih ombak." },
    { id: 'islet_penyu_damai',  name: "Karang Penyu Damai", minDist: 5000, maxDist: 9500, minR: 55, maxR: 85, color: '#14532d', sand: '#fef08a', desc: "Atol karang bundar tempat bersarangnya penyu samudra." },
    { id: 'islet_laguna_biru',  name: "Atol Laguna Biru",   minDist: 6500, maxDist: 10500, minR: 50, maxR: 80, color: '#15803d', sand: '#fef08a', desc: "Atol melingkar dengan laguna tenang di tengahnya." },
    { id: 'islet_camar_timur',  name: "Batu Camar Timur",   minDist: 4200, maxDist: 8800, minR: 40, maxR: 65, isRockOnly: true, color: '#334155', desc: "Batu cadas karang terjal tempat burung camar bertengger mengeringkan sayap." },
    { id: 'islet_pasir_sepi',   name: "Pulau Pasir Sepi",   minDist: 7500, maxDist: 11000, minR: 48, maxR: 78, isSandOnly: true, sand: '#fef08a', desc: "Gundukan pasir kuning landai yang hanya ditumbuhi rumput angin pantai." },

    // Ring 2 (11,000m - 26,000m)
    { id: 'islet_tapak_hiu',    name: "Karang Tapak Hiu",    minDist: 11500, maxDist: 16500, minR: 52, maxR: 82, isRockOnly: true, color: '#1e293b', desc: "Gugusan cadas karang hitam bergerigi tajam memecah ombak selat badai." },
    { id: 'islet_karang_lumut', name: "Atol Karang Lumut",   minDist: 14000, maxDist: 19500, minR: 50, maxR: 75, color: '#166534', sand: '#ca8a04', desc: "Atol berbatu licin berlumut hijau di tepi jalur pelayaran selat." },
    { id: 'islet_cadas_kelabu', name: "Batu Cadas Kelabu",   minDist: 17500, maxDist: 23500, minR: 45, maxR: 70, isRockOnly: true, color: '#475569', desc: "Formasi batu cadas kelabu purba yang menjulang kokoh tanpa pasir." },
    { id: 'islet_karang_layang',name: "Gugusan Karang Layang",minDist: 19500, maxDist: 25500, minR: 55, maxR: 85, color: '#15803d', sand: '#eab308', desc: "Karang dangkal berpasir keemasan tempat berteduh satwa laut." },
    { id: 'islet_karang_karat', name: "Pulau Karang Karat",  minDist: 21500, maxDist: 27500, minR: 48, maxR: 76, isRockOnly: true, color: '#78350f', desc: "Formasi batu cadas berkandungan bijih besi berkarat merah." },
    { id: 'islet_camar_liar',   name: "Atol Camar Liar",     minDist: 13500, maxDist: 22500, minR: 50, maxR: 80, color: '#14532d', sand: '#fef08a', desc: "Atol hijau terpencil yang menjadi koloni kawanan burung camar." },

    // Ring 3 (27,000m - 48,000m)
    { id: 'islet_makam_karang', name: "Atol Makam Karang",   minDist: 28000, maxDist: 34500, minR: 52, maxR: 80, color: '#312e81', sand: '#c7d2fe', desc: "Atol berpasir ungu kelam di perairan kutukan kabut." },
    { id: 'islet_arwah_kelana', name: "Batu Arwah Kelana",   minDist: 32000, maxDist: 39500, minR: 45, maxR: 70, isRockOnly: true, color: '#1e1b4b', desc: "Batu cadas hitam pekat yang menjulang di tengah kepungan kabut arwah." },
    { id: 'islet_halimun_ungu', name: "Gosong Halimun Ungu", minDist: 36000, maxDist: 43500, minR: 50, maxR: 78, isSandOnly: true, sand: '#e9d5ff', desc: "Gosong pasir tipis berpendar ungu di balik tirai halimun samudra." },
    { id: 'islet_tulang_camar', name: "Karang Tulang Camar", minDist: 40000, maxDist: 47500, minR: 48, maxR: 75, isRockOnly: true, color: '#1f2937', desc: "Cadas karang terjal kelabu pucat yang dipenuhi sarang burung camar liar." },
    { id: 'islet_cadas_hantu',  name: "Atol Cadas Hantu",    minDist: 43500, maxDist: 49500, minR: 54, maxR: 84, color: '#111827', sand: '#9ca3af', desc: "Gugusan atol sunyi tempat bersemayamnya sisa-sisa karang mati." },

    // Ring 4 (50,000m - 68,000m)
    { id: 'islet_karang_abisal', name: "Gugusan Karang Abisal", minDist: 51000, maxDist: 57500, minR: 50, maxR: 80, isRockOnly: true, color: '#1c1917', desc: "Taji karang monolitik hitam di ambang palung dalam." },
    { id: 'islet_kitin_merah',   name: "Batu Kitin Merah",      minDist: 55000, maxDist: 62500, minR: 46, maxR: 74, isRockOnly: true, color: '#881337', desc: "Batu karang merah pekat dengan formasi tonjolan seperti lapisan kitin." },
    { id: 'islet_belulang_hiu',  name: "Gosong Belulang Hiu",   minDist: 59000, maxDist: 66500, minR: 52, maxR: 82, isSandOnly: true, sand: '#f1f5f9', desc: "Gosong pasir pucat keperakan seperti serbuk tulang belulang purba." },
    { id: 'islet_fosil_purba',   name: "Atol Fosil Purba",      minDist: 62000, maxDist: 68500, minR: 55, maxR: 85, color: '#450a0a', sand: '#fecdd3', desc: "Atol karang mengeras dengan formasi batuan purbakala." },

    // Ring 5 (69,000m - 82,000m - Laut Darah)
    { id: 'islet_duri_merah',    name: "Atol Duri Merah Purba",  minDist: 70000, maxDist: 76500, minR: 48, maxR: 78, color: '#4c0519', sand: '#fb7185', isFlesh: true, desc: "Atol karang berduri berdenyut merah di dasar samudra darah." },
    { id: 'islet_tulang_raksasa',name: "Karang Tulang Raksasa",  minDist: 74000, maxDist: 79500, minR: 54, maxR: 86, isRockOnly: true, color: '#1c1917', isFlesh: true, desc: "Tanduk karang hitam kelam menjulang di tengah ombak merah pekat." },
    { id: 'islet_palung_purba',  name: "Batu Palung Purba",      minDist: 78000, maxDist: 83500, minR: 50, maxR: 80, isRockOnly: true, color: '#3f0713', isFlesh: true, desc: "Batu cadas palung abisal tempat teror laut darah mengintai." }
  ];

  uninhabitedTemplates.forEach(t => {
    placeIsland({
      id: t.id,
      name: t.name,
      clan: 'uninhabited',
      tier: 0,
      isUninhabited: true,
      isConquered: false,
      isShopIsland: false,
      isHomePort: false,
      isSandOnly: Boolean(t.isSandOnly),
      isRockOnly: Boolean(t.isRockOnly),
      hasFortress: false,
      hasLighthouse: false,
      minRadius: t.minR,
      maxRadius: t.maxR,
      color: t.color || '#166534',
      sandColor: t.sand || '#ca8a04',
      isFlesh: Boolean(t.isFlesh),
      desc: t.desc || "Pulau karang alami tak berpenghuni yang menjadi tempat singgah burung camar dan satwa samudra."
    }, t.minDist, t.maxDist, rng() * Math.PI * 2, Math.PI * 0.9);
  });

  return WORLD_ISLANDS;
}

// Initial bootstrap generation
generateGenerationalWorld(currentWorldGenSeed, currentWorldGenNumber);

// Global immersion variables (Zero-overhead navigation & state)
let windAngle = 0.5; // Dynamic ocean wind vector
let activeTreasureHint = null; // { x, y, name }
let hasEnteredBloodSeaThisRun = false;

const BIOME_STOPS = [
  { dist: 0,     name: "Laut Tenang - Teluk Nusa Damai", nameEn: "Calm Seas - Peace Bay",        waterA: [16, 85, 130], waterB: [10, 48, 90],  isBlood: false },
  { dist: 8000,  name: "Perairan Senja Berombak",       nameEn: "Choppy Twilight Waters",       waterA: [14, 62, 105], waterB: [8, 34, 72],   isBlood: false },
  { dist: 22000, name: "Selat Badai Karang Besi",       nameEn: "Iron Reef Storm Strait",       waterA: [12, 38, 75],  waterB: [6, 20, 48],   isBlood: false },
  { dist: 42000, name: "Perairan Kutukan Sekte Kabut",  nameEn: "Mist Sect Cursed Waters",      waterA: [46, 18, 70],  waterB: [22, 8, 42],   isBlood: false },
  { dist: 62000, name: "Gerbang Palung Neraka",         nameEn: "Gates of the Abyssal Trench",  waterA: [105, 14, 38], waterB: [45, 6, 22],   isBlood: false },
  { dist: 75000, name: "LAUT MERAH (LAUT DARAH ABISAL)", nameEn: "RED SEA (ABYSSAL BLOOD SEA)", waterA: [155, 8, 24],  waterB: [72, 4, 16],   isBlood: true  }
];

const _biomeColorA = [0, 0, 0];
const _biomeColorB = [0, 0, 0];

function lerpColorOut(out, c1, c2, t) {
  out[0] = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  out[1] = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  out[2] = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return out;
}

let _cachedBiomeInfo = null;
let _cachedBiomeDist = -1;
let _cachedBiomeLang = '';

function getBiomeInfo(dist) {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
  const quantizedDist = Math.floor(dist / 50);
  const langKey = isEn ? 'en' : 'id';
  if (quantizedDist === _cachedBiomeDist && _cachedBiomeInfo && _cachedBiomeLang === langKey) return _cachedBiomeInfo;
  _cachedBiomeDist = quantizedDist;
  _cachedBiomeLang = langKey;

  let idx = 0;
  for (let i = 0; i < BIOME_STOPS.length; i++) {
    if (dist >= BIOME_STOPS[i].dist) {
      idx = i;
    }
  }
  
  const curr = BIOME_STOPS[idx];
  const next = BIOME_STOPS[Math.min(idx + 1, BIOME_STOPS.length - 1)];

  let t = 0;
  if (next.dist > curr.dist) {
    t = Math.max(0, Math.min(1, (dist - curr.dist) / (next.dist - curr.dist)));
  }

  // Pre-allocate to avoid new objects
  lerpColorOut(_biomeColorA, curr.waterA, next.waterA, t);
  lerpColorOut(_biomeColorB, curr.waterB, next.waterB, t);

  const isBloodSea = dist >= 75000;
  const bloodRatio = Math.max(0, Math.min(1, (dist - 62000) / 13000));

  const currName = (isEn && curr.nameEn) ? curr.nameEn : curr.name;
  const nextName = (isEn && next.nameEn) ? next.nameEn : next.name;

  let displayName = currName;
  if (t > 0.6 && curr !== next) {
    displayName = isEn ? `Towards ${nextName}` : `Menuju ${nextName}`;
  }

  // To truly avoid creating objects on EVERY call, 
  // if we return _cachedBiomeInfo, it must be the ONLY object we modify
  if (!_cachedBiomeInfo) {
    _cachedBiomeInfo = {
      name: displayName,
      waterA: [0, 0, 0],
      waterB: [0, 0, 0],
      bloodRatio,
      isBloodSea,
      dangerLevel: idx + 1
    };
  }

  _cachedBiomeInfo.name = displayName;
  _cachedBiomeInfo.waterA[0] = _biomeColorA[0];
  _cachedBiomeInfo.waterA[1] = _biomeColorA[1];
  _cachedBiomeInfo.waterA[2] = _biomeColorA[2];
  _cachedBiomeInfo.waterB[0] = _biomeColorB[0];
  _cachedBiomeInfo.waterB[1] = _biomeColorB[1];
  _cachedBiomeInfo.waterB[2] = _biomeColorB[2];
  _cachedBiomeInfo.bloodRatio = bloodRatio;
  _cachedBiomeInfo.isBloodSea = isBloodSea;
  _cachedBiomeInfo.dangerLevel = idx + 1;

  return _cachedBiomeInfo;
}

/* ==========================================================================
   DYNAMIC REGIONAL WEATHER & RANDOM ATMOSPHERIC EVENTS
   Distance-Gated Event Pools & Environmental Hazards (Strictly 0 Emoji)
   ========================================================================== */

const WEATHER_CONFIGS = {
  clear: {
    id: 'clear',
    name: 'Laut Tenang',
    nameEn: 'Calm Seas',
    subtext: 'Angin sepoi-sepoi dan perairan bersahabat',
    subtextEn: 'Gentle breeze and friendly waters',
    compassStatus: 'normal',
    color: '#38bdf8',
    rainDensity: 0,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false,
    calmCooldownMin: 100,
    calmCooldownMax: 200
  },
  overcast: {
    id: 'overcast',
    name: 'Langit Berawan',
    nameEn: 'Overcast Skies',
    subtext: 'Awan tebal meredupkan cakrawala samudra',
    subtextEn: 'Thick clouds darken the ocean horizon',
    compassStatus: 'normal',
    color: '#94a3b8',
    rainDensity: 0,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false,
    durationMin: 45,
    durationMax: 60
  },
  rain: {
    id: 'rain',
    name: 'Hujan Samudra',
    nameEn: 'Ocean Rain',
    subtext: 'Rintik hujan membasahi geladak, pengereman licin',
    subtextEn: 'Rain drenches the deck, slippery braking',
    compassStatus: 'normal',
    color: '#60a5fa',
    rainDensity: 1.0,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false,
    durationMin: 45,
    durationMax: 60
  },
  gale: {
    id: 'gale',
    name: 'Angin Kencang',
    nameEn: 'Gale Winds',
    subtext: 'Hembusan angin kencang menyeret haluan kapal',
    subtextEn: 'Strong wind gusts dragging the prow',
    compassStatus: 'normal',
    color: '#a7f3d0',
    rainDensity: 0.2,
    hasWindDrift: true,
    windDriftMultiplier: 1.0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false,
    durationMin: 45,
    durationMax: 60
  },
  storm: {
    id: 'storm',
    name: 'Badai Gelombang',
    nameEn: 'Storm Seas',
    subtext: 'Ombak ganas bergulung dan hempasan angin liar',
    subtextEn: 'Fierce rolling waves and wild wind bursts',
    compassStatus: 'normal',
    color: '#38bdf8',
    rainDensity: 1.6,
    hasWindDrift: true,
    windDriftMultiplier: 1.3,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false,
    durationMin: 50,
    durationMax: 65
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Badai Petir Maut',
    nameEn: 'Thunderstorm',
    subtext: 'Kilat membelah langit, interferensi kompas terjadi',
    subtextEn: 'Lightning splits the sky, compass interference occurs',
    compassStatus: 'jitter',
    color: '#fef08a',
    rainDensity: 2.2,
    hasWindDrift: true,
    windDriftMultiplier: 1.5,
    hasLightning: true,
    hasBloodCorrosion: false,
    denseFog: false,
    durationMin: 60,
    durationMax: 75
  },
  mist: {
    id: 'mist',
    name: 'Kabut Halimun',
    nameEn: 'Mystic Mist',
    subtext: 'Kabut mistis perairan kutukan menyelimuti laut',
    subtextEn: 'Mystic fog shrouds the cursed waters',
    compassStatus: 'normal',
    color: '#c084fc',
    rainDensity: 0.1,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: false,
    durationMin: 50,
    durationMax: 65
  },
  dense_fog: {
    id: 'dense_fog',
    name: 'Kabut Padat Abisal',
    nameEn: 'Dense Abyssal Fog',
    subtext: 'Pandangan tertutup pekat, musuh terselubung misteri',
    subtextEn: 'Heavy zero visibility, enemies cloaked in mystery',
    compassStatus: 'blind',
    color: '#e2e8f0',
    rainDensity: 0,
    hasWindDrift: false,
    windDriftMultiplier: 0,
    hasLightning: false,
    hasBloodCorrosion: false,
    denseFog: true,
    durationMin: 60,
    durationMax: 75
  },
  blood_tempest: {
    id: 'blood_tempest',
    name: 'Prahara Darah Neraka',
    nameEn: 'Blood Tempest',
    subtext: 'Hujan darah korosif dan petir abisal merah',
    subtextEn: 'Corrosive blood rain and abyssal crimson lightning',
    compassStatus: 'corrupted',
    color: '#ef4444',
    rainDensity: 2.8,
    isBlood: true,
    hasWindDrift: true,
    windDriftMultiplier: 1.8,
    hasLightning: true,
    hasBloodCorrosion: true,
    denseFog: true,
    durationMin: 75,
    durationMax: 90
  }
};

const ZONE_WEATHER_POOLS = [
  { maxDist: 8000,  weathers: ['overcast', 'rain', 'gale'] },
  { maxDist: 22000, weathers: ['overcast', 'rain', 'gale', 'storm'] },
  { maxDist: 42000, weathers: ['overcast', 'rain', 'gale', 'storm', 'thunderstorm'] },
  { maxDist: 62000, weathers: ['rain', 'gale', 'mist'] },
  { maxDist: 75000, weathers: ['dense_fog'] },
  { maxDist: Infinity, weathers: ['blood_tempest'] }
];

function getAvailableWeathersForDistance(dist) {
  for (let i = 0; i < ZONE_WEATHER_POOLS.length; i++) {
    if (dist < ZONE_WEATHER_POOLS[i].maxDist) {
      return ZONE_WEATHER_POOLS[i].weathers;
    }
  }
  return ['blood_tempest'];
}

/* ==========================================================================
   DAY / NIGHT CELESTIAL ASTRONOMY & OCEAN LIGHTING CONFIGURATION
   20-minute real-time full 24h cycle (1200 sec) with 60 FPS frame cache
   ========================================================================== */

const DAY_NIGHT_CONFIG = {
  durationSec: 1200, // 20 minutes real-time for full 24h day
  keyframes: [
    { time: 0.0,   id: 'midnight',  name: 'Tengah Malam', nameEn: 'Midnight',  ambientMult: 0.28, ambientRGB: [32, 48, 86],   waterTint: [-4, -2, 10],   skyRGB: [6, 12, 28],    altitude: -75, shadowLen: 12, shadowAlpha: 0.22, glintColor: [186, 230, 253], isDay: false, celestial: 'moon', bioLum: 1.0 },
    { time: 4.25,  id: 'predawn',   name: 'Fajar Awal',   nameEn: 'Twilight',  ambientMult: 0.35, ambientRGB: [48, 62, 105],  waterTint: [-3, -1, 6],    skyRGB: [14, 22, 48],   altitude: -15, shadowLen: 16, shadowAlpha: 0.20, glintColor: [196, 181, 253], isDay: false, celestial: 'moon', bioLum: 0.8 },
    { time: 5.5,   id: 'dawn',      name: 'Subuh',        nameEn: 'Dawn',      ambientMult: 0.60, ambientRGB: [240, 180, 160], waterTint: [10, 2, -4],    skyRGB: [65, 48, 78],   altitude: 8,   shadowLen: 30, shadowAlpha: 0.38, glintColor: [253, 186, 116], isDay: true,  celestial: 'sun',  bioLum: 0.2 },
    { time: 7.0,   id: 'morning',   name: 'Pagi',         nameEn: 'Morning',   ambientMult: 0.85, ambientRGB: [255, 238, 210], waterTint: [3, 3, 4],      skyRGB: [115, 155, 205],altitude: 28,  shadowLen: 18, shadowAlpha: 0.42, glintColor: [254, 240, 138], isDay: true,  celestial: 'sun',  bioLum: 0.0 },
    { time: 12.0,  id: 'noon',      name: 'Siang',        nameEn: 'Midday',    ambientMult: 1.00, ambientRGB: [255, 255, 255], waterTint: [0, 0, 2],      skyRGB: [135, 206, 235],altitude: 75,  shadowLen: 6,  shadowAlpha: 0.46, glintColor: [255, 255, 255], isDay: true,  celestial: 'sun',  bioLum: 0.0 },
    { time: 16.0,  id: 'afternoon', name: 'Sore',         nameEn: 'Afternoon', ambientMult: 0.92, ambientRGB: [255, 226, 182], waterTint: [6, 2, -2],     skyRGB: [180, 160, 150],altitude: 42,  shadowLen: 16, shadowAlpha: 0.44, glintColor: [254, 240, 138], isDay: true,  celestial: 'sun',  bioLum: 0.0 },
    { time: 17.75, id: 'sunset',    name: 'Senja',        nameEn: 'Sunset',    ambientMult: 0.68, ambientRGB: [255, 138, 72],  waterTint: [18, -2, -10],  skyRGB: [125, 42, 52],  altitude: 10,  shadowLen: 32, shadowAlpha: 0.42, glintColor: [251, 146, 60],  isDay: true,  celestial: 'sun',  bioLum: 0.2 },
    { time: 19.25, id: 'dusk',      name: 'Lembayung',    nameEn: 'Dusk',      ambientMult: 0.48, ambientRGB: [92, 82, 142],   waterTint: [6, -4, 10],    skyRGB: [30, 22, 58],   altitude: -8,  shadowLen: 18, shadowAlpha: 0.25, glintColor: [196, 181, 253], isDay: false, celestial: 'moon', bioLum: 0.6 },
    { time: 21.0,  id: 'night',     name: 'Malam',        nameEn: 'Night',     ambientMult: 0.32, ambientRGB: [38, 56, 96],    waterTint: [-4, -2, 10],   skyRGB: [8, 16, 36],   altitude: -45, shadowLen: 14, shadowAlpha: 0.24, glintColor: [186, 230, 253], isDay: false, celestial: 'moon', bioLum: 0.9 },
    { time: 24.0,  id: 'midnight',  name: 'Tengah Malam', nameEn: 'Midnight',  ambientMult: 0.28, ambientRGB: [32, 48, 86],   waterTint: [-4, -2, 10],   skyRGB: [6, 12, 28],    altitude: -75, shadowLen: 12, shadowAlpha: 0.22, glintColor: [186, 230, 253], isDay: false, celestial: 'moon', bioLum: 1.0 }
  ]
};

/* ==========================================================================
   RARE CELESTIAL PHENOMENA (Laut Kaca Bimasakti / Cosmic Milky Way Mirror)
   ========================================================================== */
const CELESTIAL_EVENTS = {
  cosmic_mirror: {
    id: 'cosmic_mirror',
    name: 'Laut Kaca Bimasakti',
    nameEn: 'Mirror of the Cosmos',
    subtitle: 'Permukaan samudra tenang bak cermin kristal, memantulkan kemegahan Galaksi Bimasakti.',
    subtitleEn: 'Ocean surface turns glassy mirror-still, reflecting the majestic Milky Way and starfield.',
    minHour: 21.0,
    maxHour: 3.8,
    waterA: [18, 10, 36],       // Cosmic ultraviolet-indigo deep sea
    waterB: [8, 16, 42],        // Royal sapphire deep sea
    ambientRGB: [88, 56, 120],   // Luminous nebula ambient tint
    milkyWayColors: ['#7c3aed', '#c026d3', '#38bdf8', '#fde047'],
    ambientMult: 0.38,
    specularIntensity: 0.65,
    glintColor: [224, 231, 255]
  }
};

function calculateCelestialLighting(timeHours) {
  const normTime = ((timeHours % 24) + 24) % 24;
  const kfs = DAY_NIGHT_CONFIG.keyframes;
  
  // Find surrounding keyframes
  let idx = 0;
  for (let i = 0; i < kfs.length - 1; i++) {
    if (normTime >= kfs[i].time && normTime < kfs[i + 1].time) {
      idx = i;
      break;
    }
  }
  const k1 = kfs[idx];
  const k2 = kfs[idx + 1];
  const span = k2.time - k1.time;
  const rawT = span > 0 ? (normTime - k1.time) / span : 0;
  // Smoothstep interpolation
  const t = rawT * rawT * (3 - 2 * rawT);

  // Interpolated properties
  const ambientMult = k1.ambientMult + (k2.ambientMult - k1.ambientMult) * t;
  const ambientRGB = [
    Math.round(k1.ambientRGB[0] + (k2.ambientRGB[0] - k1.ambientRGB[0]) * t),
    Math.round(k1.ambientRGB[1] + (k2.ambientRGB[1] - k1.ambientRGB[1]) * t),
    Math.round(k1.ambientRGB[2] + (k2.ambientRGB[2] - k1.ambientRGB[2]) * t)
  ];
  const waterTint = [
    Math.round(k1.waterTint[0] + (k2.waterTint[0] - k1.waterTint[0]) * t),
    Math.round(k1.waterTint[1] + (k2.waterTint[1] - k1.waterTint[1]) * t),
    Math.round(k1.waterTint[2] + (k2.waterTint[2] - k1.waterTint[2]) * t)
  ];
  const shadowLen = k1.shadowLen + (k2.shadowLen - k1.shadowLen) * t;
  const shadowAlpha = k1.shadowAlpha + (k2.shadowAlpha - k1.shadowAlpha) * t;
  const bioLum = k1.bioLum + (k2.bioLum - k1.bioLum) * t;

  const glintColor = [
    Math.round(k1.glintColor[0] + (k2.glintColor[0] - k1.glintColor[0]) * t),
    Math.round(k1.glintColor[1] + (k2.glintColor[1] - k1.glintColor[1]) * t),
    Math.round(k1.glintColor[2] + (k2.glintColor[2] - k1.glintColor[2]) * t)
  ];

  // Solar & Lunar celestial vectors
  const isDay = normTime >= 5.25 && normTime < 18.75;
  const activeCelestial = isDay ? 'sun' : 'moon';

  let celestialAngle = 0;
  let celestialAlt = 0;

  if (isDay) {
    // Sun arcs East (X>0) -> Overhead Zenith (Y<0) -> West (X<0)
    const dayProgress = (normTime - 5.25) / 13.5; // 0 to 1
    celestialAngle = Math.PI - dayProgress * Math.PI; // PI (East) to 0 (West)
    celestialAlt = Math.sin(dayProgress * Math.PI) * 75;
  } else {
    // Moon arcs East (X>0) -> Zenith -> West (X<0)
    const nightTime = normTime >= 18.75 ? normTime - 18.75 : normTime + 5.25;
    const nightProgress = nightTime / 10.5; // 0 to 1
    celestialAngle = Math.PI - nightProgress * Math.PI;
    celestialAlt = Math.sin(nightProgress * Math.PI) * 65;
  }

  // Directional shadow vector (opposite to celestial body)
  const lightDirX = Math.cos(celestialAngle);
  const lightDirY = -Math.sin(celestialAngle);
  const shadowDirX = -lightDirX;
  const shadowDirY = -lightDirY;
  const sVecX = shadowDirX * shadowLen;
  const sVecY = shadowDirY * shadowLen;
  const specularIntensity = isDay ? (ambientMult * 0.7) : (bioLum * 0.35);

  return {
    time: normTime,
    phaseId: k1.id,
    phaseName: k1.name,
    phaseNameEn: k1.nameEn,
    isDay,
    activeCelestial,
    celestialAngle,
    celestialAlt,
    lightDirX,
    lightDirY,
    shadowDirX,
    shadowDirY,
    shadowVecX: sVecX,
    shadowVecY: sVecY,
    shadowOffsetX: sVecX,
    shadowOffsetY: sVecY,
    shadowLen,
    shadowAlpha,
    ambientMult,
    ambientRGB,
    waterTint,
    glintColor,
    specularIntensity,
    bioLum
  };
}

if (typeof window !== 'undefined') {
  window.DAY_NIGHT_CONFIG = DAY_NIGHT_CONFIG;
  window.CELESTIAL_EVENTS = CELESTIAL_EVENTS;
  window.calculateCelestialLighting = calculateCelestialLighting;
  window.getIslandPalette = getIslandPalette;
  window.getModulatedIslandPalette = getModulatedIslandPalette;
  window.modulateIslandColor = modulateIslandColor;
}


