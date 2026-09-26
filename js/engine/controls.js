/* ==========================================================================
   LAUT DARAH - CONTROLS & KEYBIND ENGINE
   Virtual Helm Joystick + Comprehensive PC Keyboard Controls (WASD / Arrows & Hotkeys)
   ========================================================================== */

const joystickZone = document.getElementById('joystickZone');
const joystickKnob = document.getElementById('joystickKnob');

const joystickState = {
  active: false,
  pointerId: null,
  originX: 0,
  originY: 0,
  dx: 0,
  dy: 0,
  angle: 0,
  magnitude: 0
};

const maxRadius = 26;
let pendingKnobX = 0;
let pendingKnobY = 0;
let knobDirty = false;

function updateJoystickPosition(clientX, clientY) {
  const diffX = clientX - joystickState.originX;
  const diffY = clientY - joystickState.originY;
  const dist = Math.hypot(diffX, diffY);
  const angle = Math.atan2(diffY, diffX);
  const clampedDist = Math.min(dist, maxRadius);

  joystickState.dx = Math.cos(angle) * (clampedDist / maxRadius);
  joystickState.dy = Math.sin(angle) * (clampedDist / maxRadius);
  joystickState.magnitude = clampedDist / maxRadius;
  joystickState.angle = angle;

  const visualX = Math.cos(angle) * clampedDist;
  const visualY = Math.sin(angle) * clampedDist;
  pendingKnobX = visualX;
  pendingKnobY = visualY;
  knobDirty = true;
}

function handleTouchStart(e) {
  if (!isGameStarted || isGamePaused) return;
  sound.init();
  const touch = e.changedTouches ? e.changedTouches[0] : e;
  const rect = joystickZone.getBoundingClientRect();
  joystickState.active = true;
  joystickState.pointerId = touch.identifier ?? 'mouse';
  joystickState.originX = rect.left + rect.width / 2;
  joystickState.originY = rect.top + rect.height / 2;
  updateJoystickPosition(touch.clientX, touch.clientY);
}

function handleTouchMove(e) {
  if (!joystickState.active) return;
  let touch = null;
  if (e.changedTouches) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickState.pointerId) {
        touch = e.changedTouches[i];
        break;
      }
    }
  } else {
    touch = e;
  }
  if (touch) {
    updateJoystickPosition(touch.clientX, touch.clientY);
  }
}

function handleTouchEnd(e) {
  if (!joystickState.active) return;
  let matched = false;
  if (e.changedTouches) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickState.pointerId) {
        matched = true;
        break;
      }
    }
  } else {
    matched = true;
  }

  if (matched) {
    joystickState.active = false;
    joystickState.pointerId = null;
    joystickState.dx = 0;
    joystickState.dy = 0;
    joystickState.magnitude = 0;
    pendingKnobX = 0;
    pendingKnobY = 0;
    knobDirty = true;
  }
}

if (joystickZone) {
  // Touch listeners
  joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

  // Mouse drag listeners
  joystickZone.addEventListener('mousedown', handleTouchStart);
  window.addEventListener('mousemove', handleTouchMove);
  window.addEventListener('mouseup', handleTouchEnd);
}

function flushJoystickVisual() {
  if (knobDirty && joystickKnob) {
    joystickKnob.style.transform = `translate(${pendingKnobX}px, ${pendingKnobY}px)`;
    knobDirty = false;
  }
}

/* ==========================================================================
   PC KEYBOARD INPUT & HOTKEYS HANDLER
   ========================================================================== */

const activeKeys = {
  KeyW: false, KeyS: false, KeyA: false, KeyD: false,
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
  ShiftLeft: false, ShiftRight: false,
  ControlLeft: false, ControlRight: false, AltLeft: false, AltRight: false
};

window.addEventListener('keydown', (e) => {
  // Dynamic switch to Keyboard input device on physical key press
  if (typeof activeInputDevice !== 'undefined' && activeInputDevice !== 'keyboard') {
    activeInputDevice = 'keyboard';
    if (typeof updateInputPromptGlyphs === 'function') {
      updateInputPromptGlyphs('keyboard');
    }
  }

  // Prevent browser window scroll on movement & space keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  // Escape handling: close active spyglass, or active modal, otherwise toggle pause
  if (e.code === 'Escape') {
    if (typeof isSpyglassActive !== 'undefined' && isSpyglassActive) {
      toggleSpyglass(false);
      return;
    }
    const closed = closeAllModals();
    if (!closed && isGameStarted) {
      togglePauseModal();
    }
    return;
  }

  // P Key toggles pause
  if (e.code === 'KeyP') {
    if (isGameStarted) {
      togglePauseModal();
    }
    return;
  }

  // F Key toggles tactical ocean spyglass [F]
  if (e.code === 'KeyF') {
    if (isGameStarted && !isGamePaused) {
      toggleSpyglass();
    }
    return;
  }

  // Action Hotkeys
  if (e.code === 'KeyU') {
    if (isGameStarted) toggleUpgradeModal();
    return;
  }
  if (e.code === 'KeyK' || e.code === 'KeyL') {
    toggleLoreModal();
    return;
  }
  if (e.code === 'KeyH' || (e.key === '?' || e.code === 'Slash' && e.shiftKey)) {
    toggleHelpModal();
    return;
  }
  if (e.code === 'KeyM') {
    if (isGameStarted) toggleMapModal();
    return;
  }
  if (e.code === 'KeyN') {
    toggleSound();
    return;
  }
  if (e.code === 'KeyC') {
    if (isGameStarted) showCoordinates();
    return;
  }
  if (e.code === 'KeyE') {
    if (isGameStarted && !isGamePaused && typeof window.triggerSalvageHook === 'function') {
      window.triggerSalvageHook();
    }
    return;
  }
  if (e.code === 'Digit2' || e.code === 'Numpad2') {
    if (isGameStarted && !isGamePaused) {
      handleMineAction();
    }
    return;
  }
  if (e.code === 'KeyR') {
    if (isGameStarted && !isGamePaused) quickRepairShip();
    return;
  }
  if (e.code === 'KeyI' || e.code === 'KeyB') {
    if (isGameStarted) {
      if (typeof toggleInventoryModal === 'function') toggleInventoryModal();
    }
    return;
  }

  // Gate ship movement & firing while game is in menu or paused
  if (!isGameStarted || isGamePaused) return;

  if (e.code === 'Space') {
    // Primary broadside salvo
    fireCannons(playerState, null, true);
    return;
  }

  if (activeKeys.hasOwnProperty(e.code)) {
    activeKeys[e.code] = true;
    sound.init();
    updateKeyboardSteering();
  }
});

window.addEventListener('keyup', (e) => {
  if (activeKeys.hasOwnProperty(e.code)) {
    activeKeys[e.code] = false;
    updateKeyboardSteering();
  }
});

/* ==========================================================================
   AUTHENTIC PC NAVAL CONTROLS (RUDDER & THROTTLE SYSTEM)
   ========================================================================== */
const pcNavalState = {
  active: false,
  rudder: 0,      // -1 (Port / Belok Kiri), +1 (Starboard / Belok Kanan), 0 (Lurus)
  throttle: 0,    // 1 (Layar Penuh Maju), 0 (Netral), -0.35 (Rem / Mundur Perlahan)
  boost: false,   // Shift (Laju Cepat)
  stealth: false  // Ctrl / Alt (Layar Senyap)
};

function updateKeyboardSteering() {
  // Rudder turning: A/D or Arrow Left/Right
  let r = 0;
  if (activeKeys.KeyA || activeKeys.ArrowLeft) r -= 1;
  if (activeKeys.KeyD || activeKeys.ArrowRight) r += 1;
  pcNavalState.rudder = r;

  // Throttle forward/brake: W/S or Arrow Up/Down
  let t = 0;
  if (activeKeys.KeyW || activeKeys.ArrowUp) t += 1;
  if (activeKeys.KeyS || activeKeys.ArrowDown) t -= 0.35;
  pcNavalState.throttle = t;

  // Modifiers: Shift = boost, Ctrl/Alt = stealth
  pcNavalState.boost = !!(activeKeys.ShiftLeft || activeKeys.ShiftRight);
  pcNavalState.stealth = !!(activeKeys.ControlLeft || activeKeys.ControlRight || activeKeys.AltLeft || activeKeys.AltRight);

  pcNavalState.active = (r !== 0 || t !== 0);
}

// Mouse aiming & shooting for PC
const canvasGameEl = document.getElementById('gameCanvas');
if (canvasGameEl) {
  // Prevent context menu so right click can be used for rear mines
  canvasGameEl.addEventListener('contextmenu', (e) => {
    if (isGameStarted && !isGamePaused) {
      e.preventDefault();
    }
  });

  canvasGameEl.addEventListener('mousedown', (e) => {
    if (!isGameStarted || isGamePaused || isMobileDevice()) return;
    if (typeof activeInputDevice !== 'undefined' && activeInputDevice !== 'keyboard') {
      activeInputDevice = 'keyboard';
      if (typeof updateInputPromptGlyphs === 'function') {
        updateInputPromptGlyphs('keyboard');
      }
    }
    sound.init();

    if (e.button === 0) {
      // Left click: Fire broadside/bow cannons
      fireCannons(playerState, null, true);
    } else if (e.button === 2) {
      // Right click: Deploy rear mine / stern chaser
      e.preventDefault();
      handleMineAction();
    }
  });
}

/* ==========================================================================
   AAA TACTICAL ACTION DECK & MOBILE TOUCH ACTION HANDLERS
   ========================================================================== */

function handleMineAction() {
  if (!isGameStarted || isGamePaused) return;
  sound.init();
  if (playerState.upgrades.rearDefense > 0) {
    triggerPlayerRearDefense();
    if (typeof playGamepadRumble === 'function') playGamepadRumble(0.25, 0.45, 120);
  } else {
    showToast(typeof t === 'function' ? t('toastUpgradeSternNeeded') : "Tingkatkan Kompartemen Buritan di Galangan!", "alert");
    if (typeof sound !== 'undefined' && typeof sound.playHitWood === 'function') sound.playHitWood();
  }
}
window.handleMineAction = handleMineAction;

function toggleSpyglass(forcedState = null) {
  if (!isGameStarted || isGamePaused) return;
  if (typeof sound !== 'undefined' && typeof sound.init === 'function') sound.init();
  if (typeof isSpyglassActive === 'undefined') isSpyglassActive = false;
  isSpyglassActive = (forcedState !== null) ? forcedState : !isSpyglassActive;

  const overlay = document.getElementById('spyglassOverlay');
  const slotSpyglass = document.getElementById('actionSlotSpyglass');
  const btnMobileSpyglass = document.getElementById('btnMobileSpyglass');

  if (overlay) {
    if (isSpyglassActive) {
      overlay.classList.remove('hidden', 'opacity-0');
      overlay.classList.add('opacity-100');
    } else {
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0', 'hidden');
    }
  }

  if (slotSpyglass) {
    if (isSpyglassActive) {
      slotSpyglass.classList.add('active-slot-glow');
    } else {
      slotSpyglass.classList.remove('active-slot-glow');
    }
  }

  if (btnMobileSpyglass) {
    if (isSpyglassActive) {
      btnMobileSpyglass.classList.add('border-cyan-400', 'bg-cyan-900/60');
    } else {
      btnMobileSpyglass.classList.remove('border-cyan-400', 'bg-cyan-900/60');
    }
  }

  if (isSpyglassActive) {
    showToast(typeof t === 'function' ? t('toastSpyglassActive') : "Teropong Samudra Aktif [F]", "compass");
    if (typeof sound !== 'undefined' && typeof sound.playCompassGlitch === 'function') sound.playCompassGlitch();
  }
}
window.toggleSpyglass = toggleSpyglass;

const btnMobileFire = document.getElementById('btnMobileFire');
const btnMobileRepair = document.getElementById('btnMobileRepair');
const btnMobileMine = document.getElementById('btnMobileMine');
const btnMobileSalvage = document.getElementById('btnMobileSalvage');
const btnMobileSpyglass = document.getElementById('btnMobileSpyglass');

function handleMobileFire(e) {
  if (e && e.cancelable) e.preventDefault();
  if (!isGameStarted || isGamePaused) return;
  sound.init();
  fireCannons(playerState, null, true);
}

function handleMobileRepair(e) {
  if (e && e.cancelable) e.preventDefault();
  if (!isGameStarted || isGamePaused) return;
  sound.init();
  quickRepairShip();
}

if (btnMobileFire) {
  btnMobileFire.addEventListener('touchstart', handleMobileFire, { passive: false });
  btnMobileFire.addEventListener('click', handleMobileFire);
}

if (btnMobileRepair) {
  btnMobileRepair.addEventListener('touchstart', handleMobileRepair, { passive: false });
  btnMobileRepair.addEventListener('click', handleMobileRepair);
}

if (btnMobileMine) {
  btnMobileMine.addEventListener('touchstart', (e) => { if (e && e.cancelable) e.preventDefault(); handleMineAction(); }, { passive: false });
  btnMobileMine.addEventListener('click', handleMineAction);
}

if (btnMobileSalvage) {
  btnMobileSalvage.addEventListener('touchstart', (e) => {
    if (e && e.cancelable) e.preventDefault();
    if (typeof window.triggerSalvageHook === 'function') window.triggerSalvageHook();
  }, { passive: false });
  btnMobileSalvage.addEventListener('click', () => {
    if (typeof window.triggerSalvageHook === 'function') window.triggerSalvageHook();
  });
}

if (btnMobileSpyglass) {
  btnMobileSpyglass.addEventListener('touchstart', (e) => { if (e && e.cancelable) e.preventDefault(); toggleSpyglass(); }, { passive: false });
  btnMobileSpyglass.addEventListener('click', () => toggleSpyglass());
}

// Tactical Action Deck Slots (PC / Universal Clicks)
const slotActionFire = document.getElementById('actionSlotFire');
const slotActionMine = document.getElementById('actionSlotMine');
const slotActionSalvage = document.getElementById('actionSlotSalvage');
const slotActionSpyglass = document.getElementById('actionSlotSpyglass');
const slotActionRepair = document.getElementById('actionSlotRepair');

if (slotActionFire) {
  slotActionFire.addEventListener('click', () => {
    if (!isGameStarted || isGamePaused) return;
    sound.init();
    fireCannons(playerState, null, true);
  });
}

if (slotActionMine) {
  slotActionMine.addEventListener('click', () => handleMineAction());
}

if (slotActionSalvage) {
  slotActionSalvage.addEventListener('click', () => {
    if (typeof window.triggerSalvageHook === 'function') window.triggerSalvageHook();
  });
}

if (slotActionSpyglass) {
  slotActionSpyglass.addEventListener('click', () => toggleSpyglass());
}

if (slotActionRepair) {
  slotActionRepair.addEventListener('click', () => {
    if (!isGameStarted || isGamePaused) return;
    sound.init();
    quickRepairShip();
  });
}

/* ==========================================================================
   GAMEPAD / CONTROLLER ENGINE (W3C Gamepad API Integration)
   Xbox, PlayStation & Generic Bluetooth/USB Gamepad Support
   ========================================================================== */

const gamepadControlState = {
  lastButtons: [],
  lastRtPressed: false,
  deadzone: 0.18
};

function isPlayStationGamepad(id) {
  const s = (id || '').toLowerCase();
  return s.includes('playstation') || s.includes('dualshock') || s.includes('dualsense') || s.includes('ps4') || s.includes('ps5') || s.includes('054c');
}

function cleanGamepadName(id) {
  if (!id) return "Gamepad";
  return id.replace(/\([^)]*\)/g, '').trim() || "Gamepad";
}

function applyGamepadDeadzone(val, dz = 0.18) {
  if (Math.abs(val) < dz) return 0;
  const s = Math.sign(val);
  return s * ((Math.abs(val) - dz) / (1 - dz));
}

function playGamepadRumble(strong = 0.45, weak = 0.45, durationMs = 150) {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
  const gamepads = navigator.getGamepads();
  const pad = (typeof connectedGamepadIndex !== 'undefined' && connectedGamepadIndex >= 0 && gamepads[connectedGamepadIndex])
    ? gamepads[connectedGamepadIndex]
    : null;
  if (!pad) return;

  try {
    if (pad.vibrationActuator && typeof pad.vibrationActuator.playEffect === 'function') {
      pad.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: durationMs,
        weakMagnitude: Math.min(1.0, Math.max(0, weak)),
        strongMagnitude: Math.min(1.0, Math.max(0, strong))
      }).catch(() => {});
    } else if (pad.hapticActuators && pad.hapticActuators[0] && typeof pad.hapticActuators[0].pulse === 'function') {
      pad.hapticActuators[0].pulse(strong, durationMs).catch(() => {});
    }
  } catch (e) {}
}

// Gamepad connection event listeners
window.addEventListener('gamepadconnected', (e) => {
  connectedGamepadIndex = e.gamepad.index;
  connectedGamepadName = cleanGamepadName(e.gamepad.id);
  activeInputDevice = isPlayStationGamepad(e.gamepad.id) ? 'gamepad_ps' : 'gamepad_xbox';

  const tMsg = (typeof t === 'function') 
    ? t('toastGamepadConnected', { name: connectedGamepadName })
    : `Kontroler Terhubung: ${connectedGamepadName}`;
  if (typeof showToast === 'function') showToast(tMsg, 'compass');

  if (typeof updateInputPromptGlyphs === 'function') {
    updateInputPromptGlyphs(activeInputDevice);
  }
  playGamepadRumble(0.3, 0.5, 180);

  // If currently on initial main menu, auto-focus Play button and reveal navigation hints
  const mm = document.getElementById('mainMenuModal');
  if (mm && !mm.classList.contains('hidden') && !mm.classList.contains('opacity-0')) {
    const playBtn = document.getElementById('btnMainMenuPlay');
    if (playBtn) setGamepadMenuFocus(playBtn);
    const mmBar = document.getElementById('mainMenuGamepadBar');
    if (mmBar) {
      mmBar.classList.remove('hidden');
      mmBar.classList.add('flex');
    }
  }
});

window.addEventListener('gamepaddisconnected', (e) => {
  if (connectedGamepadIndex === e.gamepad.index) {
    connectedGamepadIndex = -1;
    connectedGamepadName = '';
    activeInputDevice = 'keyboard';
    clearGamepadMenuFocus();

    const tMsg = (typeof t === 'function') ? t('toastGamepadDisconnected') : 'Kontroler Terputus!';
    if (typeof showToast === 'function') showToast(tMsg, 'alert');

    if (typeof updateInputPromptGlyphs === 'function') {
      updateInputPromptGlyphs('keyboard');
    }

    const mmBar = document.getElementById('mainMenuGamepadBar');
    if (mmBar) {
      mmBar.classList.add('hidden');
      mmBar.classList.remove('flex');
    }
    const ssBar = document.getElementById('saveSlotsGamepadBar');
    if (ssBar) {
      ssBar.classList.add('hidden');
      ssBar.classList.remove('flex');
    }
    const pBar = document.getElementById('pauseGamepadBar');
    if (pBar) {
      pBar.classList.add('hidden');
      pBar.classList.remove('flex');
    }
    const upgBar = document.getElementById('upgradeGamepadBar');
    if (upgBar) {
      upgBar.classList.add('hidden');
      upgBar.classList.remove('flex');
    }
    const mapBar = document.getElementById('seaMapGamepadBar');
    if (mapBar) {
      mapBar.classList.add('hidden');
      mapBar.classList.remove('flex');
    }
    const invBar = document.getElementById('inventoryGamepadBar');
    if (invBar) {
      invBar.classList.add('hidden');
      invBar.classList.remove('flex');
    }
  }
});

// Clear gamepad menu focus highlights on keyboard/mouse input
window.addEventListener('keydown', () => {
  clearGamepadMenuFocus();
});
window.addEventListener('mousedown', () => {
  clearGamepadMenuFocus();
});

function isPadButtonPressed(btn) {
  if (!btn) return false;
  return typeof btn === 'object' ? btn.pressed : btn > 0.5;
}

function getPadButtonValue(btn) {
  if (!btn) return 0;
  return typeof btn === 'object' ? btn.value : (btn ? 1 : 0);
}

/* ==========================================================================
   GAMEPAD MENU & MODAL NAVIGATION ENGINE
   Supports Main Menu, 3 Save Slots, Confirmations, Pause, Settings & Help
   ========================================================================== */

let gamepadFocusedElement = null;
let gamepadNavCooldown = 0;
let gamepadMapZoomCooldown = 0;
let gamepadLastInventoryFocusId = null;
let lastActiveModalId = null;

function clearGamepadMenuFocus() {
  if (gamepadFocusedElement) {
    gamepadFocusedElement.classList.remove('gamepad-menu-focus');
    gamepadFocusedElement = null;
  }
}

function setGamepadMenuFocus(el) {
  if (!el) return;
  if (gamepadFocusedElement && gamepadFocusedElement !== el) {
    gamepadFocusedElement.classList.remove('gamepad-menu-focus');
  }
  gamepadFocusedElement = el;
  if (el.id) gamepadLastInventoryFocusId = el.id;
  el.classList.add('gamepad-menu-focus');
  try {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  } catch (e) {}
}

function updateGamepadMenuNavigation(dt, pad, justPressed, leftX, leftY, dpadUp, dpadDown, dpadLeft, dpadRight) {
  if (gamepadNavCooldown > 0) {
    gamepadNavCooldown -= dt;
  }

  // Detect navigation direction with threshold
  let navDir = null;
  if (dpadUp || leftY < -0.45) navDir = 'up';
  else if (dpadDown || leftY > 0.45) navDir = 'down';
  else if (dpadLeft || leftX < -0.45) navDir = 'left';
  else if (dpadRight || leftX > 0.45) navDir = 'right';

  // Fast reset cooldown if stick is centered and d-pad released
  if (Math.abs(leftX) < 0.2 && Math.abs(leftY) < 0.2 && !dpadUp && !dpadDown && !dpadLeft && !dpadRight) {
    gamepadNavCooldown = Math.min(gamepadNavCooldown, 0.05);
  }

  // Cinematic Narrative Prologue check (any button tap advances or skips)
  const elPrologueModal = document.getElementById('cinematicPrologueModal');
  if (elPrologueModal && !elPrologueModal.classList.contains('opacity-0') && !elPrologueModal.classList.contains('pointer-events-none')) {
    const anyPressed = justPressed && justPressed.some(p => p);
    if (anyPressed) {
      elPrologueModal.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      playGamepadRumble(0.1, 0.15, 50);
    }
    return true;
  }

  // Determine currently active top modal in priority order:
  const elDeleteModal = document.getElementById('deleteSlotConfirmModal');
  const elSaveSlotsModal = document.getElementById('saveSlotsModal');
  const elCannonPickerModal = document.getElementById('cannonPickerModal');
  const elRecipeBookModal = document.getElementById('recipeBookModal');
  const elUpgradeModal = document.getElementById('upgradeModal');
  const elSeaMapModal = document.getElementById('seaMapModal');
  const elInventoryModal = document.getElementById('inventoryModal');
  const elHelpModal = document.getElementById('helpModal');
  const elSettingsModal = document.getElementById('settingsModal');
  const elLoreModal = document.getElementById('loreModal');
  const elGameOverModal = document.getElementById('gameOverModal');
  const elPauseModal = document.getElementById('pauseModal');
  const elMainMenuModal = document.getElementById('mainMenuModal');

  let currentModalId = null;
  let focusableItems = [];

  if (elDeleteModal && !elDeleteModal.classList.contains('hidden')) {
    currentModalId = 'deleteSlotConfirm';
    const btnCancel = document.getElementById('btnCancelDeleteSlot');
    const btnConfirm = document.getElementById('btnConfirmDeleteSlot');
    if (btnCancel && btnConfirm) focusableItems = [btnCancel, btnConfirm];
  } else if (elSaveSlotsModal && !elSaveSlotsModal.classList.contains('hidden') && elSaveSlotsModal.classList.contains('modal-active')) {
    currentModalId = 'saveSlots';
    const slotList = document.getElementById('saveSlotsList');
    if (slotList) {
      const slotBtns = Array.from(slotList.querySelectorAll('.btn-slot-play, .btn-slot-new'));
      focusableItems = slotBtns;
    }
  } else if (elCannonPickerModal && !elCannonPickerModal.classList.contains('hidden')) {
    currentModalId = 'cannonPicker';
    const pickerBtns = Array.from(elCannonPickerModal.querySelectorAll('.btn-picker-equip-now'));
    const btnCancel = document.getElementById('btnCancelCannonPicker');
    focusableItems = [...pickerBtns, btnCancel].filter(Boolean);
  } else if (elRecipeBookModal && !elRecipeBookModal.classList.contains('hidden')) {
    currentModalId = 'recipeBook';
    const btnCloseBook = document.getElementById('btnCloseRecipeBook');
    focusableItems = [btnCloseBook].filter(Boolean);
  } else if (elUpgradeModal && !elUpgradeModal.classList.contains('hidden') && elUpgradeModal.classList.contains('modal-active')) {
    currentModalId = 'upgrade';
    const btnUpgrade = document.getElementById('btnPerformUpgrade');
    const btnClose = document.getElementById('btnCloseUpgrade');
    focusableItems = [btnUpgrade, btnClose].filter(Boolean);
  } else if (elSeaMapModal && !elSeaMapModal.classList.contains('hidden') && elSeaMapModal.classList.contains('modal-active')) {
    currentModalId = 'seaMap';
    const btnCenter = document.getElementById('btnMapCenterShip');
    const btnClose = document.getElementById('btnCloseSeaMap');
    focusableItems = [btnCenter, btnClose].filter(Boolean);
  } else if (elInventoryModal && !elInventoryModal.classList.contains('hidden') && elInventoryModal.classList.contains('modal-active')) {
    currentModalId = 'inventory';
    const activeTab = (typeof mobileInventoryActiveTab !== 'undefined') ? mobileInventoryActiveTab : 'cargo';
    const btnShipyard = document.getElementById('btnQuickNavShipyard');
    const btnClose = document.getElementById('btnCloseInventory');
    
    if (activeTab === 'cargo') {
      const filterBtns = [document.getElementById('btnFilterCargoAll'), document.getElementById('btnFilterCargoRes'), document.getElementById('btnFilterCargoWeap')].filter(Boolean);
      const slots = Array.from(document.querySelectorAll('#invCargoGrid .cargo-slot'));
      const inspectorBtns = Array.from(document.querySelectorAll('#invSlotInspector button:not([disabled])'));
      focusableItems = [...filterBtns, ...slots, ...inspectorBtns, btnShipyard, btnClose].filter(Boolean);
    } else if (activeTab === 'armory') {
      const hardpointSlots = Array.from(document.querySelectorAll('#invEquippedRack .hardpoint-card, #invEquippedRack .broadside-slot-empty'));
      const hardpointBtns = Array.from(document.querySelectorAll('#invEquippedRack button:not([disabled])'));
      const inspectorBtns = Array.from(document.querySelectorAll('#invSlotInspector button:not([disabled])'));
      focusableItems = [...hardpointSlots, ...hardpointBtns, ...inspectorBtns, btnShipyard, btnClose].filter(Boolean);
    } else {
      const filterBtns = [document.getElementById('btnCraftFilterAll'), document.getElementById('btnCraftFilterFaction'), document.getElementById('btnCraftFilterOccult')].filter(Boolean);
      const craftCards = Array.from(document.querySelectorAll('#invCraftableList .craftable-recipe-card'));
      const btnAlmanac = document.getElementById('btnOpenRecipeBookFromColumn');
      focusableItems = [...filterBtns, ...craftCards, btnAlmanac, btnShipyard, btnClose].filter(Boolean);
    }
  } else if (elHelpModal && !elHelpModal.classList.contains('hidden') && elHelpModal.classList.contains('modal-active')) {
    currentModalId = 'help';
    const tabKbd = document.getElementById('helpTabBtnKeyboard');
    const tabPad = document.getElementById('helpTabBtnGamepad');
    const btnClose = document.getElementById('btnCloseHelp');
    focusableItems = [tabKbd, tabPad, btnClose].filter(Boolean);
  } else if (elSettingsModal && !elSettingsModal.classList.contains('hidden') && elSettingsModal.classList.contains('modal-active')) {
    currentModalId = 'settings';
    const tabAudio = document.getElementById('tabSettingsAudio');
    const tabGfx = document.getElementById('tabSettingsGraphics');
    const tabPlay = document.getElementById('tabSettingsGameplay');
    const btnClose = document.getElementById('btnCloseSettingsBottom') || document.getElementById('btnCloseSettings');
    focusableItems = [tabAudio, tabGfx, tabPlay, btnClose].filter(Boolean);
  } else if (elLoreModal && !elLoreModal.classList.contains('hidden') && elLoreModal.classList.contains('modal-active')) {
    currentModalId = 'lore';
    const btnClose = document.getElementById('btnCloseLore');
    if (btnClose) focusableItems = [btnClose];
  } else if (elGameOverModal && !elGameOverModal.classList.contains('hidden') && elGameOverModal.classList.contains('modal-active')) {
    currentModalId = 'gameOver';
    const btnRespawn = document.getElementById('btnRespawn');
    const btnMenu = document.getElementById('btnGameOverMenu');
    focusableItems = [btnRespawn, btnMenu].filter(Boolean);
  } else if (elPauseModal && !elPauseModal.classList.contains('hidden') && elPauseModal.classList.contains('modal-active')) {
    currentModalId = 'pause';
    const btnResume = document.getElementById('btnResumeGame');
    const btnInv = document.getElementById('btnPauseInventory');
    const btnMap = document.getElementById('btnPauseMap');
    const btnLore = document.getElementById('btnPauseLore');
    const btnSettings = document.getElementById('btnPauseSettings');
    const btnSound = document.getElementById('btnPauseToggleSound');
    const btnHelp = document.getElementById('btnPauseHelp');
    const btnRestart = document.getElementById('btnRestartGame');
    const btnMenu = document.getElementById('btnReturnToMainMenu');
    focusableItems = [btnResume, btnInv, btnMap, btnLore, btnSettings, btnSound, btnHelp, btnRestart, btnMenu].filter(Boolean);
  } else if (typeof isGameStarted === 'undefined' || !isGameStarted || (elMainMenuModal && !elMainMenuModal.classList.contains('opacity-0') && !elMainMenuModal.classList.contains('hidden'))) {
    currentModalId = 'mainMenu';
    const btnPlay = document.getElementById('btnMainMenuPlay');
    const btnCodex = document.getElementById('btnMainMenuCodex');
    const btnSettings = document.getElementById('btnMainMenuSettings');
    const btnControls = document.getElementById('btnMainMenuControls');
    const btnDiff = document.getElementById('btnMainMenuDiffCycle');
    focusableItems = [btnPlay, btnCodex, btnSettings, btnControls, btnDiff].filter(Boolean);
  }

  // Toggle gamepad hint bars visibility
  const isGamepadActive = typeof activeInputDevice !== 'undefined' && activeInputDevice.startsWith('gamepad');
  const barMainMenu = document.getElementById('mainMenuGamepadBar');
  const barSaveSlots = document.getElementById('saveSlotsGamepadBar');
  const barPause = document.getElementById('pauseGamepadBar');
  const barUpgrade = document.getElementById('upgradeGamepadBar');
  const barSeaMap = document.getElementById('seaMapGamepadBar');
  const barInventory = document.getElementById('inventoryGamepadBar');

  const setBarVisibility = (bar, show) => {
    if (!bar) return;
    if (show) {
      bar.classList.remove('hidden');
      bar.classList.add('flex');
    } else {
      bar.classList.add('hidden');
      bar.classList.remove('flex');
    }
  };

  setBarVisibility(barMainMenu, isGamepadActive && currentModalId === 'mainMenu');
  setBarVisibility(barSaveSlots, isGamepadActive && currentModalId === 'saveSlots');
  setBarVisibility(barPause, isGamepadActive && currentModalId === 'pause');
  setBarVisibility(barUpgrade, isGamepadActive && currentModalId === 'upgrade');
  setBarVisibility(barSeaMap, isGamepadActive && currentModalId === 'seaMap');
  setBarVisibility(barInventory, isGamepadActive && currentModalId === 'inventory');

  if (!currentModalId || focusableItems.length === 0) {
    if (currentModalId !== 'seaMap') {
      clearGamepadMenuFocus();
      lastActiveModalId = null;
      return false;
    }
  }

  // Handle modal switch: reset focus to primary element
  if (currentModalId !== lastActiveModalId) {
    lastActiveModalId = currentModalId;
    if (focusableItems.length > 0) {
      setGamepadMenuFocus(focusableItems[0]);
    } else {
      clearGamepadMenuFocus();
    }
  }

  // Ensure current focused element is in focusableItems and still attached to DOM
  if (focusableItems.length > 0) {
    if (!gamepadFocusedElement || !document.body.contains(gamepadFocusedElement)) {
      if (currentModalId === 'inventory' && gamepadLastInventoryFocusId) {
        const reFound = document.getElementById(gamepadLastInventoryFocusId);
        if (reFound) {
          setGamepadMenuFocus(reFound);
        } else {
          setGamepadMenuFocus(focusableItems[0]);
        }
      } else {
        setGamepadMenuFocus(focusableItems[0]);
      }
    } else if (!focusableItems.includes(gamepadFocusedElement)) {
      if (currentModalId === 'saveSlots' && gamepadFocusedElement.classList.contains('btn-slot-delete')) {
        // valid sub-focus
      } else if (currentModalId === 'inventory' && (gamepadFocusedElement.classList.contains('cargo-slot') || gamepadFocusedElement.classList.contains('hardpoint-card') || gamepadFocusedElement.classList.contains('craftable-recipe-card') || gamepadFocusedElement.closest('#invSlotInspector') || gamepadFocusedElement.closest('#invEquippedRack'))) {
        // valid inventory sub-focus
      } else {
        setGamepadMenuFocus(focusableItems[0]);
      }
    }
  }

  // Continuous Sea Map Pan with Analog Stick & D-Pad
  if (currentModalId === 'seaMap' && typeof seaMapState !== 'undefined') {
    let panned = false;
    if (Math.abs(leftX) > 0.12) {
      seaMapState.panX -= leftX * 16;
      panned = true;
    }
    if (Math.abs(leftY) > 0.12) {
      seaMapState.panY -= leftY * 16;
      panned = true;
    }
    if (dpadUp) { seaMapState.panY += 12; panned = true; }
    if (dpadDown) { seaMapState.panY -= 12; panned = true; }
    if (dpadLeft) { seaMapState.panX += 12; panned = true; }
    if (dpadRight) { seaMapState.panX -= 12; panned = true; }
    if (panned) {
      seaMapState.lastPanX = seaMapState.panX;
      seaMapState.lastPanY = seaMapState.panY;
      if (typeof renderSeaMapCanvas === 'function') renderSeaMapCanvas();
    }
  }

  // Handle navigation inputs
  if (navDir && gamepadNavCooldown <= 0) {
    const curIdx = focusableItems.indexOf(gamepadFocusedElement);

    if (currentModalId === 'pause') {
      // 2D Spatial Grid Navigation for Pause Menu:
      // Row 0: [btnResumeGame, btnResumeGame]
      // Row 1: [btnPauseInventory, btnPauseMap]
      // Row 2: [btnPauseLore, btnPauseSettings]
      // Row 3: [btnPauseToggleSound, btnPauseHelp]
      // Row 4: [btnRestartGame, btnRestartGame]
      // Row 5: [btnReturnToMainMenu, btnReturnToMainMenu]
      const btnResume = document.getElementById('btnResumeGame');
      const btnInv = document.getElementById('btnPauseInventory');
      const btnMap = document.getElementById('btnPauseMap');
      const btnLore = document.getElementById('btnPauseLore');
      const btnSettings = document.getElementById('btnPauseSettings');
      const btnSound = document.getElementById('btnPauseToggleSound');
      const btnHelp = document.getElementById('btnPauseHelp');
      const btnRestart = document.getElementById('btnRestartGame');
      const btnMenu = document.getElementById('btnReturnToMainMenu');

      const pauseGrid = [
        [btnResume, btnResume],
        [btnInv, btnMap],
        [btnLore, btnSettings],
        [btnSound, btnHelp],
        [btnRestart, btnRestart],
        [btnMenu, btnMenu]
      ];

      let curRow = 0;
      let curCol = 0;
      for (let r = 0; r < pauseGrid.length; r++) {
        if (pauseGrid[r][0] === gamepadFocusedElement) {
          curRow = r;
          curCol = 0;
          break;
        }
        if (pauseGrid[r][1] === gamepadFocusedElement) {
          curRow = r;
          curCol = 1;
          break;
        }
      }

      if (navDir === 'up') {
        curRow = (curRow - 1 + pauseGrid.length) % pauseGrid.length;
      } else if (navDir === 'down') {
        curRow = (curRow + 1) % pauseGrid.length;
      } else if (navDir === 'left') {
        curCol = 0;
      } else if (navDir === 'right') {
        curCol = 1;
      }

      const targetEl = pauseGrid[curRow][curCol];
      if (targetEl) {
        setGamepadMenuFocus(targetEl);
        playGamepadRumble(0.08, 0.12, 40);
        gamepadNavCooldown = 0.22;
      }
    } else if (currentModalId === 'upgrade') {
      // Cycle compartments with Left / Right
      const compKeys = ['relicSiphon', 'speed', 'cannons', 'hull', 'stealthCamo', 'rearDefense'];
      const curKey = (typeof cutawayState !== 'undefined' && cutawayState.selectedKey) ? cutawayState.selectedKey : 'cannons';
      let compIdx = compKeys.indexOf(curKey);
      if (compIdx === -1) compIdx = 2;

      if (navDir === 'left') {
        compIdx = (compIdx - 1 + compKeys.length) % compKeys.length;
        if (typeof selectCompartment === 'function') selectCompartment(compKeys[compIdx], true);
        const btnUpgrade = document.getElementById('btnPerformUpgrade');
        if (btnUpgrade) setGamepadMenuFocus(btnUpgrade);
        playGamepadRumble(0.08, 0.12, 40);
        gamepadNavCooldown = 0.22;
      } else if (navDir === 'right') {
        compIdx = (compIdx + 1) % compKeys.length;
        if (typeof selectCompartment === 'function') selectCompartment(compKeys[compIdx], true);
        const btnUpgrade = document.getElementById('btnPerformUpgrade');
        if (btnUpgrade) setGamepadMenuFocus(btnUpgrade);
        playGamepadRumble(0.08, 0.12, 40);
        gamepadNavCooldown = 0.22;
      } else if (navDir === 'down' || navDir === 'up') {
        const btnUpgrade = document.getElementById('btnPerformUpgrade');
        const btnClose = document.getElementById('btnCloseUpgrade');
        if (gamepadFocusedElement === btnClose && btnUpgrade) {
          setGamepadMenuFocus(btnUpgrade);
        } else if (btnClose) {
          setGamepadMenuFocus(btnClose);
        }
        playGamepadRumble(0.08, 0.12, 40);
        gamepadNavCooldown = 0.22;
      }
    } else if (currentModalId === 'saveSlots') {
      const slotList = document.getElementById('saveSlotsList');
      const cards = slotList ? Array.from(slotList.children) : [];
      let cardIdx = cards.findIndex(c => c.contains(gamepadFocusedElement));
      if (cardIdx === -1) cardIdx = 0;

      if (navDir === 'left') {
        const nextCardIdx = (cardIdx - 1 + cards.length) % cards.length;
        const targetBtn = cards[nextCardIdx].querySelector('.btn-slot-play, .btn-slot-new');
        if (targetBtn) setGamepadMenuFocus(targetBtn);
      } else if (navDir === 'right') {
        const nextCardIdx = (cardIdx + 1) % cards.length;
        const targetBtn = cards[nextCardIdx].querySelector('.btn-slot-play, .btn-slot-new');
        if (targetBtn) setGamepadMenuFocus(targetBtn);
      } else if (navDir === 'down') {
        const delBtn = cards[cardIdx].querySelector('.btn-slot-delete');
        if (delBtn) setGamepadMenuFocus(delBtn);
      } else if (navDir === 'up') {
        const playBtn = cards[cardIdx].querySelector('.btn-slot-play, .btn-slot-new');
        if (playBtn) setGamepadMenuFocus(playBtn);
      }
      playGamepadRumble(0.08, 0.12, 40);
      gamepadNavCooldown = 0.22;
    } else if (currentModalId === 'deleteSlotConfirm') {
      const nextIdx = (curIdx === 0) ? 1 : 0;
      setGamepadMenuFocus(focusableItems[nextIdx]);
      playGamepadRumble(0.08, 0.12, 40);
      gamepadNavCooldown = 0.22;
    } else if (currentModalId === 'inventory') {
      const activeTab = (typeof mobileInventoryActiveTab !== 'undefined') ? mobileInventoryActiveTab : 'cargo';

      if (activeTab === 'cargo') {
        const slots = Array.from(document.querySelectorAll('#invCargoGrid .cargo-slot'));
        const filterBtns = [document.getElementById('btnFilterCargoAll'), document.getElementById('btnFilterCargoRes'), document.getElementById('btnFilterCargoWeap')].filter(Boolean);
        const inspectorBtns = Array.from(document.querySelectorAll('#invSlotInspector button:not([disabled])'));
        const footerBtns = [document.getElementById('btnQuickNavShipyard'), document.getElementById('btnCloseInventory')].filter(Boolean);

        const curSlotIdx = slots.indexOf(gamepadFocusedElement);
        const curFilterIdx = filterBtns.indexOf(gamepadFocusedElement);
        const curInspectorIdx = inspectorBtns.indexOf(gamepadFocusedElement);
        const curFooterIdx = footerBtns.indexOf(gamepadFocusedElement);

        if (curSlotIdx !== -1) {
          let nextSlotIdx = curSlotIdx;
          if (navDir === 'right') {
            if ((curSlotIdx + 1) % 4 !== 0 && curSlotIdx + 1 < slots.length) {
              nextSlotIdx = curSlotIdx + 1;
            }
          } else if (navDir === 'left') {
            if (curSlotIdx % 4 !== 0) {
              nextSlotIdx = curSlotIdx - 1;
            }
          } else if (navDir === 'down') {
            if (curSlotIdx + 4 < slots.length) {
              nextSlotIdx = curSlotIdx + 4;
            } else if (inspectorBtns.length > 0) {
              setGamepadMenuFocus(inspectorBtns[0]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
              return true;
            } else if (footerBtns.length > 0) {
              setGamepadMenuFocus(footerBtns[0]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
              return true;
            }
          } else if (navDir === 'up') {
            if (curSlotIdx - 4 >= 0) {
              nextSlotIdx = curSlotIdx - 4;
            } else if (filterBtns.length > 0) {
              const fTarget = filterBtns[Math.min(curSlotIdx, filterBtns.length - 1)];
              setGamepadMenuFocus(fTarget);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
              return true;
            }
          }

          if (nextSlotIdx !== curSlotIdx && slots[nextSlotIdx]) {
            const nextSlot = slots[nextSlotIdx];
            setGamepadMenuFocus(nextSlot);
            gamepadLastInventoryFocusId = nextSlot.id || `cargoSlot_${nextSlotIdx}`;
            nextSlot.click();
            const refreshedSlot = document.getElementById(gamepadLastInventoryFocusId);
            if (refreshedSlot) setGamepadMenuFocus(refreshedSlot);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          }
        } else if (curFilterIdx !== -1) {
          if (navDir === 'right') {
            const nextIdx = (curFilterIdx + 1) % filterBtns.length;
            setGamepadMenuFocus(filterBtns[nextIdx]);
            filterBtns[nextIdx].click();
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'left') {
            const nextIdx = (curFilterIdx - 1 + filterBtns.length) % filterBtns.length;
            setGamepadMenuFocus(filterBtns[nextIdx]);
            filterBtns[nextIdx].click();
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'down') {
            if (slots.length > 0) {
              setGamepadMenuFocus(slots[Math.min(curFilterIdx, slots.length - 1)]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          }
        } else if (curInspectorIdx !== -1) {
          if (navDir === 'right') {
            const nextIdx = (curInspectorIdx + 1) % inspectorBtns.length;
            setGamepadMenuFocus(inspectorBtns[nextIdx]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'left') {
            const nextIdx = (curInspectorIdx - 1 + inspectorBtns.length) % inspectorBtns.length;
            setGamepadMenuFocus(inspectorBtns[nextIdx]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'up') {
            const lastRowSlot = slots[Math.min(slots.length - 1, 20)];
            if (lastRowSlot) setGamepadMenuFocus(lastRowSlot);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'down') {
            if (footerBtns.length > 0) setGamepadMenuFocus(footerBtns[0]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          }
        } else if (curFooterIdx !== -1) {
          if (navDir === 'right' || navDir === 'left') {
            const nextIdx = (curFooterIdx === 0) ? 1 : 0;
            if (footerBtns[nextIdx]) setGamepadMenuFocus(footerBtns[nextIdx]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'up') {
            if (inspectorBtns.length > 0) setGamepadMenuFocus(inspectorBtns[0]);
            else if (slots.length > 0) setGamepadMenuFocus(slots[slots.length - 1]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          }
        } else {
          if (slots.length > 0) setGamepadMenuFocus(slots[0]);
        }
      } else if (activeTab === 'armory') {
        const hardpoints = Array.from(document.querySelectorAll('#invEquippedRack .hardpoint-card, #invEquippedRack .broadside-slot-empty'));
        const inspectorBtns = Array.from(document.querySelectorAll('#invSlotInspector button:not([disabled])'));
        const footerBtns = [document.getElementById('btnQuickNavShipyard'), document.getElementById('btnCloseInventory')].filter(Boolean);

        let curHpIdx = hardpoints.findIndex(hp => hp === gamepadFocusedElement || hp.contains(gamepadFocusedElement));
        const curInspectorIdx = inspectorBtns.indexOf(gamepadFocusedElement);
        const curFooterIdx = footerBtns.indexOf(gamepadFocusedElement);

        if (curHpIdx !== -1) {
          const currentHpCard = hardpoints[curHpIdx];
          const subBtns = Array.from(currentHpCard.querySelectorAll('button:not([disabled])'));

          if (navDir === 'down') {
            if (curHpIdx + 1 < hardpoints.length) {
              const nextHp = hardpoints[curHpIdx + 1];
              setGamepadMenuFocus(nextHp);
              gamepadLastInventoryFocusId = nextHp.id || `hardpointSlot_${curHpIdx + 1}`;
              nextHp.click();
              const refreshed = document.getElementById(gamepadLastInventoryFocusId);
              if (refreshed) setGamepadMenuFocus(refreshed);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            } else if (inspectorBtns.length > 0) {
              setGamepadMenuFocus(inspectorBtns[0]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            } else if (footerBtns.length > 0) {
              setGamepadMenuFocus(footerBtns[0]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          } else if (navDir === 'up') {
            if (curHpIdx - 1 >= 0) {
              const prevHp = hardpoints[curHpIdx - 1];
              setGamepadMenuFocus(prevHp);
              gamepadLastInventoryFocusId = prevHp.id || `hardpointSlot_${curHpIdx - 1}`;
              prevHp.click();
              const refreshed = document.getElementById(gamepadLastInventoryFocusId);
              if (refreshed) setGamepadMenuFocus(refreshed);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          } else if (navDir === 'right') {
            if (subBtns.length > 0) {
              let subIdx = subBtns.indexOf(gamepadFocusedElement);
              if (subIdx === -1) setGamepadMenuFocus(subBtns[0]);
              else if (subIdx + 1 < subBtns.length) setGamepadMenuFocus(subBtns[subIdx + 1]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          } else if (navDir === 'left') {
            if (subBtns.length > 0) {
              let subIdx = subBtns.indexOf(gamepadFocusedElement);
              if (subIdx > 0) setGamepadMenuFocus(subBtns[subIdx - 1]);
              else setGamepadMenuFocus(currentHpCard);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          }
        } else if (curInspectorIdx !== -1) {
          if (navDir === 'right') {
            const nextIdx = (curInspectorIdx + 1) % inspectorBtns.length;
            setGamepadMenuFocus(inspectorBtns[nextIdx]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'left') {
            const nextIdx = (curInspectorIdx - 1 + inspectorBtns.length) % inspectorBtns.length;
            setGamepadMenuFocus(inspectorBtns[nextIdx]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'up') {
            if (hardpoints.length > 0) setGamepadMenuFocus(hardpoints[hardpoints.length - 1]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'down') {
            if (footerBtns.length > 0) setGamepadMenuFocus(footerBtns[0]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          }
        } else if (curFooterIdx !== -1) {
          if (navDir === 'right' || navDir === 'left') {
            const nextIdx = (curFooterIdx === 0) ? 1 : 0;
            if (footerBtns[nextIdx]) setGamepadMenuFocus(footerBtns[nextIdx]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'up') {
            if (inspectorBtns.length > 0) setGamepadMenuFocus(inspectorBtns[0]);
            else if (hardpoints.length > 0) setGamepadMenuFocus(hardpoints[hardpoints.length - 1]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          }
        } else {
          if (hardpoints.length > 0) setGamepadMenuFocus(hardpoints[0]);
        }
      } else {
        const filterBtns = [document.getElementById('btnCraftFilterAll'), document.getElementById('btnCraftFilterFaction'), document.getElementById('btnCraftFilterOccult')].filter(Boolean);
        const craftCards = Array.from(document.querySelectorAll('#invCraftableList .craftable-recipe-card'));
        const btnAlmanac = document.getElementById('btnOpenRecipeBookFromColumn');
        const footerBtns = [document.getElementById('btnQuickNavShipyard'), document.getElementById('btnCloseInventory')].filter(Boolean);

        let curCardIdx = craftCards.findIndex(c => c === gamepadFocusedElement || c.contains(gamepadFocusedElement));
        const curFilterIdx = filterBtns.indexOf(gamepadFocusedElement);
        const isAlmanacFocused = gamepadFocusedElement === btnAlmanac;
        const curFooterIdx = footerBtns.indexOf(gamepadFocusedElement);

        if (curCardIdx !== -1) {
          if (navDir === 'down') {
            if (curCardIdx + 1 < craftCards.length) {
              const nextCard = craftCards[curCardIdx + 1];
              setGamepadMenuFocus(nextCard);
              nextCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            } else if (btnAlmanac) {
              setGamepadMenuFocus(btnAlmanac);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            } else if (footerBtns.length > 0) {
              setGamepadMenuFocus(footerBtns[0]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          } else if (navDir === 'up') {
            if (curCardIdx - 1 >= 0) {
              const prevCard = craftCards[curCardIdx - 1];
              setGamepadMenuFocus(prevCard);
              prevCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            } else if (filterBtns.length > 0) {
              setGamepadMenuFocus(filterBtns[0]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          }
        } else if (curFilterIdx !== -1) {
          if (navDir === 'right') {
            const nextIdx = (curFilterIdx + 1) % filterBtns.length;
            setGamepadMenuFocus(filterBtns[nextIdx]);
            filterBtns[nextIdx].click();
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'left') {
            const nextIdx = (curFilterIdx - 1 + filterBtns.length) % filterBtns.length;
            setGamepadMenuFocus(filterBtns[nextIdx]);
            filterBtns[nextIdx].click();
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'down') {
            if (craftCards.length > 0) {
              setGamepadMenuFocus(craftCards[0]);
              craftCards[0].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          }
        } else if (isAlmanacFocused) {
          if (navDir === 'up') {
            if (craftCards.length > 0) {
              setGamepadMenuFocus(craftCards[craftCards.length - 1]);
              craftCards[craftCards.length - 1].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          } else if (navDir === 'down') {
            if (footerBtns.length > 0) {
              setGamepadMenuFocus(footerBtns[0]);
              playGamepadRumble(0.06, 0.1, 35);
              gamepadNavCooldown = 0.22;
            }
          }
        } else if (curFooterIdx !== -1) {
          if (navDir === 'right' || navDir === 'left') {
            const nextIdx = (curFooterIdx === 0) ? 1 : 0;
            if (footerBtns[nextIdx]) setGamepadMenuFocus(footerBtns[nextIdx]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          } else if (navDir === 'up') {
            if (btnAlmanac) setGamepadMenuFocus(btnAlmanac);
            else if (craftCards.length > 0) setGamepadMenuFocus(craftCards[craftCards.length - 1]);
            playGamepadRumble(0.06, 0.1, 35);
            gamepadNavCooldown = 0.22;
          }
        } else {
          if (craftCards.length > 0) setGamepadMenuFocus(craftCards[0]);
        }
      }
    } else if (currentModalId === 'cannonPicker') {
      const pickerBtns = Array.from(document.querySelectorAll('#cannonPickerList .btn-picker-equip-now'));
      const btnCancel = document.getElementById('btnCancelCannonPicker');
      const allPickerItems = [...pickerBtns, btnCancel].filter(Boolean);
      let pIdx = allPickerItems.indexOf(gamepadFocusedElement);
      if (pIdx === -1) pIdx = 0;

      if (navDir === 'down' || navDir === 'right') {
        pIdx = (pIdx + 1) % allPickerItems.length;
      } else if (navDir === 'up' || navDir === 'left') {
        pIdx = (pIdx - 1 + allPickerItems.length) % allPickerItems.length;
      }
      if (allPickerItems[pIdx]) {
        setGamepadMenuFocus(allPickerItems[pIdx]);
        playGamepadRumble(0.08, 0.12, 40);
        gamepadNavCooldown = 0.22;
      }
    } else if (currentModalId === 'recipeBook') {
      const btnCloseBook = document.getElementById('btnCloseRecipeBook');
      if (btnCloseBook) setGamepadMenuFocus(btnCloseBook);
      gamepadNavCooldown = 0.22;
    } else if (currentModalId !== 'seaMap') {
      // Standard linear list navigation (Main menu, Help, Settings, GameOver, Inventory)
      let nextIdx = curIdx;
      if (navDir === 'down' || navDir === 'right') {
        nextIdx = (curIdx + 1) % focusableItems.length;
      } else if (navDir === 'up' || navDir === 'left') {
        nextIdx = (curIdx - 1 + focusableItems.length) % focusableItems.length;
      }
      if (nextIdx !== curIdx && focusableItems[nextIdx]) {
        setGamepadMenuFocus(focusableItems[nextIdx]);
        playGamepadRumble(0.08, 0.12, 40);
        gamepadNavCooldown = 0.22;
      }
    }
  }

  // Handle Tab / Zoom / Compartment cycling via LB (4) and RB (5)
  if (currentModalId === 'help') {
    if (justPressed[4]) {
      if (typeof switchHelpTab === 'function') switchHelpTab('keyboard');
      playGamepadRumble(0.12, 0.2, 60);
    } else if (justPressed[5]) {
      if (typeof switchHelpTab === 'function') switchHelpTab('gamepad');
      playGamepadRumble(0.12, 0.2, 60);
    }
  } else if (currentModalId === 'settings') {
    const tabs = ['tabSettingsAudio', 'tabSettingsGraphics', 'tabSettingsGameplay'];
    let activeTabIdx = tabs.findIndex(tId => {
      const el = document.getElementById(tId);
      return el && el.classList.contains('border-amber-400');
    });
    if (activeTabIdx === -1) activeTabIdx = 0;
    if (justPressed[4]) {
      activeTabIdx = (activeTabIdx - 1 + tabs.length) % tabs.length;
      const tBtn = document.getElementById(tabs[activeTabIdx]);
      if (tBtn) tBtn.click();
      playGamepadRumble(0.1, 0.15, 50);
    } else if (justPressed[5]) {
      activeTabIdx = (activeTabIdx + 1) % tabs.length;
      const tBtn = document.getElementById(tabs[activeTabIdx]);
      if (tBtn) tBtn.click();
      playGamepadRumble(0.1, 0.15, 50);
    }
  } else if (currentModalId === 'inventory') {
    const invTabs = ['cargo', 'armory', 'craft'];
    let curTabIdx = invTabs.indexOf(typeof mobileInventoryActiveTab !== 'undefined' ? mobileInventoryActiveTab : 'cargo');
    if (curTabIdx === -1) curTabIdx = 0;
    
    let tabChanged = false;
    if (justPressed[4]) {
      curTabIdx = (curTabIdx - 1 + invTabs.length) % invTabs.length;
      tabChanged = true;
    } else if (justPressed[5]) {
      curTabIdx = (curTabIdx + 1) % invTabs.length;
      tabChanged = true;
    }

    if (tabChanged) {
      const nextTab = invTabs[curTabIdx];
      if (typeof setMobileInventoryTab === 'function') setMobileInventoryTab(nextTab);
      if (nextTab === 'cargo') {
        const firstSlot = document.getElementById('cargoSlot_0') || document.querySelector('#invCargoGrid .cargo-slot');
        if (firstSlot) setGamepadMenuFocus(firstSlot);
      } else if (nextTab === 'armory') {
        const firstHardpoint = document.getElementById('hardpointSlot_0') || document.querySelector('#invEquippedRack .hardpoint-card, #invEquippedRack .broadside-slot-empty');
        if (firstHardpoint) setGamepadMenuFocus(firstHardpoint);
      } else if (nextTab === 'craft') {
        const firstCard = document.querySelector('#invCraftableList .craftable-recipe-card');
        if (firstCard) {
          setGamepadMenuFocus(firstCard);
          try { firstCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
        }
      }
      playGamepadRumble(0.12, 0.18, 55);
    }
  } else if (currentModalId === 'upgrade') {
    const compKeys = ['relicSiphon', 'speed', 'cannons', 'hull', 'stealthCamo', 'rearDefense'];
    const curKey = (typeof cutawayState !== 'undefined' && cutawayState.selectedKey) ? cutawayState.selectedKey : 'cannons';
    let compIdx = compKeys.indexOf(curKey);
    if (compIdx === -1) compIdx = 2;
    if (justPressed[4]) {
      compIdx = (compIdx - 1 + compKeys.length) % compKeys.length;
      if (typeof selectCompartment === 'function') selectCompartment(compKeys[compIdx], true);
      const btnUpgrade = document.getElementById('btnPerformUpgrade');
      if (btnUpgrade) setGamepadMenuFocus(btnUpgrade);
      playGamepadRumble(0.08, 0.12, 40);
    } else if (justPressed[5]) {
      compIdx = (compIdx + 1) % compKeys.length;
      if (typeof selectCompartment === 'function') selectCompartment(compKeys[compIdx], true);
      const btnUpgrade = document.getElementById('btnPerformUpgrade');
      if (btnUpgrade) setGamepadMenuFocus(btnUpgrade);
      playGamepadRumble(0.08, 0.12, 40);
    }
  } else if (currentModalId === 'seaMap') {
    // Zoom via LT (Left Trigger, button 6) and RT (Right Trigger, button 7) with smooth cooldown
    const ltDown = pad.buttons[6] && isPadButtonPressed(pad.buttons[6]);
    const rtDown = pad.buttons[7] && isPadButtonPressed(pad.buttons[7]);

    if (gamepadMapZoomCooldown > 0) {
      gamepadMapZoomCooldown -= dt;
    }

    if (ltDown && gamepadMapZoomCooldown <= 0) {
      if (typeof zoomMapStep === 'function') zoomMapStep(0.86);
      playGamepadRumble(0.06, 0.1, 35);
      gamepadMapZoomCooldown = 0.14;
    } else if (rtDown && gamepadMapZoomCooldown <= 0) {
      if (typeof zoomMapStep === 'function') zoomMapStep(1.16);
      playGamepadRumble(0.06, 0.1, 35);
      gamepadMapZoomCooldown = 0.14;
    } else if (justPressed[4]) {
      if (typeof zoomMapStep === 'function') zoomMapStep(0.86);
      playGamepadRumble(0.06, 0.1, 35);
    } else if (justPressed[5]) {
      if (typeof zoomMapStep === 'function') zoomMapStep(1.16);
      playGamepadRumble(0.06, 0.1, 35);
    }
  }

  // Button 2 (X / Square):
  // Main Menu: Cycle difficulty
  // Save Slots: Delete slot
  // Upgrade Modal: Quick repair ship
  // Sea Map: Clear waypoint pin
  // Inventory Modal: Quick Action (Equip cannon from cargo slot / Unequip from hardpoint / Craft selected)
  if (justPressed[2]) {
    if (currentModalId === 'mainMenu') {
      const btnDiff = document.getElementById('btnMainMenuDiffCycle');
      if (btnDiff) {
        btnDiff.click();
        playGamepadRumble(0.15, 0.25, 80);
      }
    } else if (currentModalId === 'saveSlots') {
      const slotList = document.getElementById('saveSlotsList');
      const cards = slotList ? Array.from(slotList.children) : [];
      let cardIdx = cards.findIndex(c => c.contains(gamepadFocusedElement));
      if (cardIdx !== -1 && cards[cardIdx]) {
        const delBtn = cards[cardIdx].querySelector('.btn-slot-delete');
        if (delBtn) {
          delBtn.click();
          playGamepadRumble(0.2, 0.35, 90);
        }
      }
    } else if (currentModalId === 'upgrade') {
      if (typeof quickRepairShip === 'function') {
        quickRepairShip();
        playGamepadRumble(0.2, 0.35, 90);
      }
    } else if (currentModalId === 'seaMap') {
      if (typeof playerState !== 'undefined' && playerState.waypointPin) {
        playerState.waypointPin = null;
        if (typeof updateMapPinButton === 'function') updateMapPinButton();
        if (typeof closeIslandIntel === 'function') closeIslandIntel();
        const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
        if (typeof showToast === 'function') {
          showToast(isEn ? "Navigation pin removed" : "Pin navigasi dihapus", "compass");
        }
        if (typeof sound !== 'undefined' && typeof sound.playClick === 'function') {
          sound.playClick();
        }
        if (typeof renderSeaMapCanvas === 'function') renderSeaMapCanvas();
        playGamepadRumble(0.18, 0.28, 70);
      } else {
        const btnMapClear = document.getElementById('btnMapClearPin');
        if (btnMapClear && !btnMapClear.classList.contains('hidden')) {
          btnMapClear.click();
          playGamepadRumble(0.15, 0.25, 60);
        }
      }
    } else if (currentModalId === 'inventory') {
      const activeTab = (typeof mobileInventoryActiveTab !== 'undefined') ? mobileInventoryActiveTab : 'cargo';
      const curr = gamepadFocusedElement;
      if (activeTab === 'cargo') {
        const slotEl = curr ? (curr.closest('.cargo-slot') || (curr.classList.contains('cargo-slot') ? curr : null)) : null;
        if (slotEl && slotEl.dataset.slotIdx !== undefined) {
          const slotIdx = parseInt(slotEl.dataset.slotIdx, 10);
          const occupiedItems = (typeof getCargoOccupiedItems === 'function') ? getCargoOccupiedItems() : [];
          let displayItems = occupiedItems;
          if (typeof currentCargoFilter !== 'undefined') {
            if (currentCargoFilter === 'res') displayItems = occupiedItems.filter(i => i.kind === 'resource');
            else if (currentCargoFilter === 'weap') displayItems = occupiedItems.filter(i => i.kind === 'cannon');
          }
          const item = displayItems[slotIdx];
          if (item && item.kind === 'cannon' && typeof equipCannonFromCargo === 'function') {
            equipCannonFromCargo(item.cannonIdx, -1);
            playGamepadRumble(0.2, 0.35, 90);
          } else {
            const btnEquip = document.querySelector('#invSlotInspector .btn-equip-cannon-from-cargo');
            if (btnEquip) {
              btnEquip.click();
              playGamepadRumble(0.2, 0.35, 90);
            }
          }
        } else {
          const btnEquip = document.querySelector('#invSlotInspector .btn-equip-cannon-from-cargo');
          if (btnEquip) {
            btnEquip.click();
            playGamepadRumble(0.2, 0.35, 90);
          }
        }
      } else if (activeTab === 'armory') {
        const hpEl = curr ? (curr.closest('[data-hardpoint-idx]') || (curr.dataset?.hardpointIdx !== undefined ? curr : null)) : null;
        if (hpEl) {
          const slotIdx = parseInt(hpEl.dataset.hardpointIdx, 10);
          if (playerState?.equippedCannons && playerState.equippedCannons[slotIdx]) {
            if (typeof unequipCannon === 'function') {
              unequipCannon(slotIdx);
              playGamepadRumble(0.2, 0.35, 90);
            }
          }
        } else {
          const btnUnequip = document.querySelector('#invSlotInspector .btn-unequip-cannon');
          if (btnUnequip) {
            btnUnequip.click();
            playGamepadRumble(0.2, 0.35, 90);
          }
        }
      } else if (activeTab === 'craft') {
        const card = curr ? (curr.closest('.craftable-recipe-card') || (curr.classList.contains('craftable-recipe-card') ? curr : null)) : null;
        if (card) {
          const craftBtn = card.querySelector('.btn-craft-cannon');
          if (craftBtn && !craftBtn.disabled) {
            craftBtn.click();
            playGamepadRumble(0.25, 0.4, 110);
          } else if (card.dataset.type && typeof craftCannon === 'function') {
            craftCannon(card.dataset.type);
            playGamepadRumble(0.25, 0.4, 110);
          }
        }
      }
    }
  }

  // Button 3 (Y / Triangle):
  // Sea Map: Center map on player vessel
  // Inventory Modal: Quick jump to Shipyard (Galangan Kapal)
  if (justPressed[3]) {
    if (currentModalId === 'seaMap') {
      if (typeof centerMapOnPlayer === 'function') {
        centerMapOnPlayer();
        playGamepadRumble(0.15, 0.25, 60);
      }
    } else if (currentModalId === 'inventory') {
      const btnNav = document.getElementById('btnQuickNavShipyard');
      if (btnNav) {
        btnNav.click();
        playGamepadRumble(0.18, 0.28, 80);
      } else {
        if (typeof closeInventoryModal === 'function') closeInventoryModal();
        if (typeof openUpgradeModal === 'function') openUpgradeModal();
        playGamepadRumble(0.18, 0.28, 80);
      }
    }
  }

  // Button 10 (L3 / Left Stick Click): Center Sea Map on Player
  if (justPressed[10]) {
    if (currentModalId === 'seaMap') {
      if (typeof centerMapOnPlayer === 'function') {
        centerMapOnPlayer();
        playGamepadRumble(0.15, 0.25, 60);
      }
    }
  }

  // Button 0 (A / Cross): Confirm / Select / Place Pin / Mount / Craft / Upgrade
  if (justPressed[0]) {
    if (currentModalId === 'seaMap') {
      const drawer = document.getElementById('islandIntelDrawer');
      const isDrawerOpen = drawer && !drawer.classList.contains('hidden') && !drawer.classList.contains('translate-y-full');
      if (isDrawerOpen && gamepadFocusedElement && drawer.contains(gamepadFocusedElement)) {
        gamepadFocusedElement.click();
        playGamepadRumble(0.15, 0.25, 60);
      } else {
        if (typeof toggleMapPinAtCenter === 'function') {
          toggleMapPinAtCenter();
          playGamepadRumble(0.18, 0.3, 75);
        } else if (typeof centerMapOnPlayer === 'function') {
          centerMapOnPlayer();
          playGamepadRumble(0.15, 0.25, 60);
        }
      }
    } else if (currentModalId === 'upgrade') {
      const btnUpgrade = document.getElementById('btnPerformUpgrade');
      if (btnUpgrade) {
        btnUpgrade.click();
        playGamepadRumble(0.2, 0.35, 90);
      }
    } else if (currentModalId === 'cannonPicker') {
      const curr = gamepadFocusedElement;
      if (curr) {
        const equipBtn = curr.classList.contains('btn-picker-equip-now') 
          ? curr 
          : curr.querySelector('.btn-picker-equip-now');
        if (equipBtn) {
          equipBtn.click();
          playGamepadRumble(0.2, 0.35, 90);
        } else {
          curr.click();
          playGamepadRumble(0.18, 0.3, 70);
        }
      }
    } else if (currentModalId === 'inventory') {
      const curr = gamepadFocusedElement;
      if (curr) {
        if (curr.classList.contains('craftable-recipe-card')) {
          const craftBtn = curr.querySelector('.btn-craft-cannon');
          if (craftBtn && !craftBtn.disabled) {
            craftBtn.click();
            playGamepadRumble(0.22, 0.38, 90);
          } else {
            curr.click();
            playGamepadRumble(0.15, 0.25, 60);
          }
        } else if (curr.classList.contains('broadside-slot-empty')) {
          curr.click();
          playGamepadRumble(0.18, 0.3, 70);
        } else {
          curr.click();
          playGamepadRumble(0.18, 0.3, 70);
        }
      }
    } else if (gamepadFocusedElement) {
      playGamepadRumble(0.18, 0.3, 70);
      gamepadFocusedElement.click();
    }
  }

  // Button 1 (B / Circle): Back / Close Modal
  if (justPressed[1]) {
    playGamepadRumble(0.12, 0.2, 60);
    if (currentModalId === 'deleteSlotConfirm') {
      const btnCancel = document.getElementById('btnCancelDeleteSlot');
      if (btnCancel) btnCancel.click();
    } else if (currentModalId === 'cannonPicker') {
      if (typeof closeCannonPicker === 'function') closeCannonPicker();
      else {
        const btnCancel = document.getElementById('btnCancelCannonPicker');
        if (btnCancel) btnCancel.click();
      }
    } else if (currentModalId === 'recipeBook') {
      if (typeof closeRecipeBookModal === 'function') closeRecipeBookModal();
      else {
        const btnClose = document.getElementById('btnCloseRecipeBook');
        if (btnClose) btnClose.click();
      }
    } else if (currentModalId === 'saveSlots') {
      const btnClose = document.getElementById('btnCloseSaveSlots');
      if (btnClose) btnClose.click();
    } else if (currentModalId === 'upgrade') {
      if (typeof closeUpgradeModal === 'function') closeUpgradeModal();
    } else if (currentModalId === 'seaMap') {
      const drawer = document.getElementById('islandIntelDrawer');
      const isDrawerOpen = drawer && !drawer.classList.contains('hidden') && !drawer.classList.contains('translate-y-full');
      if (isDrawerOpen && typeof closeIslandIntel === 'function') {
        closeIslandIntel();
        if (typeof renderSeaMapCanvas === 'function') renderSeaMapCanvas();
      } else {
        if (typeof closeMapModal === 'function') closeMapModal();
      }
    } else if (currentModalId === 'inventory') {
      if (typeof closeInventoryModal === 'function') closeInventoryModal();
    } else if (currentModalId === 'help') {
      if (typeof closeHelpModal === 'function') closeHelpModal();
    } else if (currentModalId === 'settings') {
      if (typeof closeSettingsModal === 'function') closeSettingsModal();
    } else if (currentModalId === 'lore') {
      if (typeof closeLoreModal === 'function') closeLoreModal();
    } else if (currentModalId === 'pause') {
      const btnResume = document.getElementById('btnResumeGame');
      if (btnResume) btnResume.click();
      else if (typeof togglePauseModal === 'function') togglePauseModal();
    }
  }

  // Button 8 (Select / Touchpad) in Sea Map: Close Map
  if (currentModalId === 'seaMap' && (justPressed[8] || (pad.buttons.length > 17 && justPressed[17]))) {
    if (typeof closeMapModal === 'function') {
      closeMapModal();
      playGamepadRumble(0.12, 0.2, 60);
    }
  }

  return true;
}

function updateGamepadInput(dt) {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
  const gamepads = navigator.getGamepads();
  if (!gamepads) return;

  let pad = null;
  if (typeof connectedGamepadIndex !== 'undefined' && connectedGamepadIndex >= 0 && gamepads[connectedGamepadIndex]) {
    pad = gamepads[connectedGamepadIndex];
  } else {
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        pad = gamepads[i];
        connectedGamepadIndex = i;
        connectedGamepadName = cleanGamepadName(pad.id);
        break;
      }
    }
  }

  if (!pad) return;

  // 1. Detect button changes and edge triggers
  const btnCount = pad.buttons.length;
  const justPressed = [];
  let anyGamepadActivity = false;

  for (let i = 0; i < btnCount; i++) {
    const isP = isPadButtonPressed(pad.buttons[i]);
    justPressed[i] = isP && !gamepadControlState.lastButtons[i];
    if (isP) anyGamepadActivity = true;
  }

  // 2. Analog Sticks & D-Pad
  const leftX = applyGamepadDeadzone(pad.axes[0] || 0, gamepadControlState.deadzone);
  const leftY = applyGamepadDeadzone(pad.axes[1] || 0, gamepadControlState.deadzone);
  if (Math.abs(leftX) > 0 || Math.abs(leftY) > 0) anyGamepadActivity = true;

  const dpadUp = isPadButtonPressed(pad.buttons[12]);
  const dpadDown = isPadButtonPressed(pad.buttons[13]);
  const dpadLeft = isPadButtonPressed(pad.buttons[14]);
  const dpadRight = isPadButtonPressed(pad.buttons[15]);
  if (dpadUp || dpadDown || dpadLeft || dpadRight) anyGamepadActivity = true;

  // 3. Dynamic switch to Gamepad UI prompts on active gamepad input
  if (anyGamepadActivity && activeInputDevice === 'keyboard') {
    activeInputDevice = isPlayStationGamepad(pad.id) ? 'gamepad_ps' : 'gamepad_xbox';
    if (typeof updateInputPromptGlyphs === 'function') {
      updateInputPromptGlyphs(activeInputDevice);
    }
  }

  // 4. Modal / Menu Gamepad Navigation
  const isMenuHandled = updateGamepadMenuNavigation(dt, pad, justPressed, leftX, leftY, dpadUp, dpadDown, dpadLeft, dpadRight);
  if (isMenuHandled) {
    for (let i = 0; i < btnCount; i++) {
      gamepadControlState.lastButtons[i] = isPadButtonPressed(pad.buttons[i]);
    }
    return;
  }

  // If paused or game not started, don't execute naval combat/movement actions
  if (typeof isGameStarted === 'undefined' || !isGameStarted || (typeof isGamePaused !== 'undefined' && isGamePaused)) {
    for (let i = 0; i < btnCount; i++) {
      gamepadControlState.lastButtons[i] = isPadButtonPressed(pad.buttons[i]);
    }
    return;
  }

  // 5. Global Hotkeys during voyage
  // Button 9: Start / Options / Menu -> Toggle Pause
  if (justPressed[9]) {
    if (typeof togglePauseModal === 'function') togglePauseModal();
    playGamepadRumble(0.15, 0.25, 80);
  }

  // Button 8: Back / View / Select or Button 17: PS Touchpad -> Map
  if (justPressed[8] || (pad.buttons.length > 17 && justPressed[17])) {
    if (typeof toggleMapModal === 'function') {
      toggleMapModal();
      playGamepadRumble(0.15, 0.25, 80);
    }
  }

  // D-Pad Down (Button 13): Open Inventory & Workshop Modal
  if (justPressed[13]) {
    if (typeof openInventoryModal === 'function') {
      openInventoryModal();
      playGamepadRumble(0.15, 0.25, 80);
    }
  }

  // Button 1: B (Xbox) / Circle (PS) -> Quick Mine Drop
  if (justPressed[1]) {
    handleMineAction();
  }

  // 6. Action Buttons during active voyage
  // Button 7: RT / R2 (Right Trigger) -> Broadside Salvo
  const rtVal = getPadButtonValue(pad.buttons[7]);
  const rtDown = rtVal > 0.25;
  const rtJustPressed = rtDown && !gamepadControlState.lastRtPressed;
  gamepadControlState.lastRtPressed = rtDown;

  // Button 0: A / Cross -> Primary/Confirm Fire
  const aJustPressed = justPressed[0];

  if (rtJustPressed || aJustPressed) {
    if (typeof sound !== 'undefined' && typeof sound.init === 'function') sound.init();
    if (typeof fireCannons === 'function' && typeof playerState !== 'undefined') {
      fireCannons(playerState, null, true);
      playGamepadRumble(0.35, 0.55, 120);
    }
  }

  // Button 5: RB / R1 (Right Bumper) -> Rear Defense Mine
  if (justPressed[5]) {
    handleMineAction();
  }

  // Button 2: X / Square -> Salvage Winch Hook
  if (justPressed[2]) {
    if (typeof window.triggerSalvageHook === 'function') {
      window.triggerSalvageHook();
      playGamepadRumble(0.2, 0.4, 120);
    }
  }

  // Button 3: Y / Triangle -> Docked: Shipyard (Galangan Kapal)! Sailing: Spyglass.
  // Button 11: RS Click (Right Stick) -> Spyglass
  if (justPressed[3]) {
    if (typeof playerState !== 'undefined' && playerState.isDockedAtPort) {
      if (typeof openUpgradeModal === 'function') {
        openUpgradeModal();
        playGamepadRumble(0.2, 0.35, 90);
      }
    } else if (typeof toggleSpyglass === 'function') {
      toggleSpyglass();
    }
  } else if (justPressed[11]) {
    if (typeof toggleSpyglass === 'function') {
      toggleSpyglass();
    }
  }

  // Button 4: LB / L1 (Left Bumper) -> Quick Hull Repair
  if (justPressed[4]) {
    if (typeof quickRepairShip === 'function') {
      quickRepairShip();
    }
  }

  // Button 6: LT / L2 (Left Trigger) -> Full Sail Boost
  const ltVal = getPadButtonValue(pad.buttons[6]);
  const isBoost = ltVal > 0.25;

  // Button 10: LS Click (Left Stick) -> Stealth Mode Toggle or Hold
  const isStealth = isPadButtonPressed(pad.buttons[10]);

  // 7. TRUE 360° OMNIDIRECTIONAL JOYSTICK STEERING
  // Only activate Gamepad Joystick if PC keyboard steering keys are not actively held
  const hasKeyboardInput = !!(
    (typeof activeKeys !== 'undefined') && (
      activeKeys.KeyA || activeKeys.KeyD ||
      activeKeys.KeyW || activeKeys.KeyS ||
      activeKeys.ArrowLeft || activeKeys.ArrowRight ||
      activeKeys.ArrowUp || activeKeys.ArrowDown
    )
  );

  if (!hasKeyboardInput) {
    // Clear keyboard naval state so it does not conflict
    if (typeof pcNavalState !== 'undefined') {
      pcNavalState.active = false;
    }

    const stickMag = Math.hypot(leftX, leftY);
    if (stickMag > 0.08) {
      gamepadJoystickState.active = true;
      gamepadJoystickState.angle = Math.atan2(leftY, leftX);
      gamepadJoystickState.magnitude = Math.min(1.0, stickMag);
    } else if (dpadUp || dpadDown || dpadLeft || dpadRight) {
      // 8-directional D-Pad fallback
      let dx = 0;
      let dy = 0;
      if (dpadRight) dx += 1;
      if (dpadLeft) dx -= 1;
      if (dpadDown) dy += 1;
      if (dpadUp) dy -= 1;
      if (dx !== 0 || dy !== 0) {
        gamepadJoystickState.active = true;
        gamepadJoystickState.angle = Math.atan2(dy, dx);
        gamepadJoystickState.magnitude = 1.0;
      } else {
        gamepadJoystickState.active = false;
        gamepadJoystickState.magnitude = 0;
      }
    } else {
      gamepadJoystickState.active = false;
      gamepadJoystickState.magnitude = 0;
    }

    gamepadJoystickState.boost = isBoost;
    gamepadJoystickState.stealth = isStealth;
  } else {
    gamepadJoystickState.active = false;
  }

  // Record state for edge trigger calculation in next frame
  for (let i = 0; i < btnCount; i++) {
    gamepadControlState.lastButtons[i] = isPadButtonPressed(pad.buttons[i]);
  }
}

if (typeof window !== 'undefined') {
  window.playGamepadRumble = playGamepadRumble;
  window.updateGamepadInput = updateGamepadInput;
  window.cleanGamepadName = cleanGamepadName;
  window.isPlayStationGamepad = isPlayStationGamepad;
  window.gamepadJoystickState = gamepadJoystickState;
  window.setGamepadMenuFocus = setGamepadMenuFocus;
  window.clearGamepadMenuFocus = clearGamepadMenuFocus;
}
