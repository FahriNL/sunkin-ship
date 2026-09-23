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
  // Prevent browser window scroll on movement & space keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }

  // Escape handling: close active modal, otherwise toggle pause
  if (e.code === 'Escape') {
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

  // F Key toggles fullscreen
  if (e.code === 'KeyF') {
    toggleFullscreen();
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
    // Manual combat trigger
    if (playerState.upgrades.rearDefense > 0) {
      triggerPlayerRearDefense();
    } else {
      fireCannons(playerState, null, true);
    }
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
    sound.init();

    if (e.button === 0) {
      // Left click: Fire broadside/bow cannons
      if (playerState.upgrades.rearDefense > 0 && e.shiftKey) {
        triggerPlayerRearDefense();
      } else {
        fireCannons(playerState, null, true);
      }
    } else if (e.button === 2) {
      // Right click: Deploy rear mine / defense
      e.preventDefault();
      if (playerState.upgrades.rearDefense > 0) {
        triggerPlayerRearDefense();
      } else {
        fireCannons(playerState, null, true);
      }
    }
  });
}

/* ==========================================================================
   MOBILE TOUCH ACTION BUTTONS (FIRE / MINE & QUICK REPAIR)
   ========================================================================== */
const btnMobileFire = document.getElementById('btnMobileFire');
const btnMobileRepair = document.getElementById('btnMobileRepair');

function handleMobileFire(e) {
  if (e && e.cancelable) e.preventDefault();
  if (!isGameStarted || isGamePaused) return;
  sound.init();

  if (playerState.upgrades.rearDefense > 0) {
    triggerPlayerRearDefense();
  } else {
    fireCannons(playerState, null, true);
  }
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
