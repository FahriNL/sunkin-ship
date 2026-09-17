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

const maxRadius = 50;

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
  if (joystickKnob) {
    joystickKnob.style.transform = `translate(${visualX}px, ${visualY}px)`;
  }
}

function handleTouchStart(e) {
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
    if (joystickKnob) joystickKnob.style.transform = `translate(0px, 0px)`;
  }
}

if (joystickZone) {
  // Touch listeners
  joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd, { passive: false });
  window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

  // Mouse drag listeners
  joystickZone.addEventListener('mousedown', handleTouchStart);
  window.addEventListener('mousemove', handleTouchMove);
  window.addEventListener('mouseup', handleTouchEnd);
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

  // Action Hotkeys
  if (e.code === 'KeyU') {
    toggleUpgradeModal();
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
    toggleSound();
    return;
  }
  if (e.code === 'KeyC') {
    showCoordinates();
    return;
  }
  if (e.code === 'KeyR') {
    quickRepairShip();
    return;
  }
  if (e.code === 'Escape') {
    const closed = closeAllModals();
    if (!closed) {
      showToast("Game Berjalan (Tekan [H] untuk Bantuan)", "⚓");
    }
    return;
  }
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

function updateKeyboardSteering() {
  let kx = 0;
  let ky = 0;

  if (activeKeys.KeyW || activeKeys.ArrowUp) ky -= 1;
  if (activeKeys.KeyS || activeKeys.ArrowDown) ky += 1;
  if (activeKeys.KeyA || activeKeys.ArrowLeft) kx -= 1;
  if (activeKeys.KeyD || activeKeys.ArrowRight) kx += 1;

  if (kx !== 0 || ky !== 0) {
    const angle = Math.atan2(ky, kx);
    joystickState.active = true;
    
    // Check speed modifiers:
    // Shift = Full Sail (1.0x magnitude)
    // Ctrl / Alt = Stealth Crawl (0.35x magnitude - slow movement for stealth)
    let speedMagnitude = 0.85;
    if (activeKeys.ShiftLeft || activeKeys.ShiftRight) {
      speedMagnitude = 1.0;
    } else if (activeKeys.ControlLeft || activeKeys.ControlRight || activeKeys.AltLeft || activeKeys.AltRight) {
      speedMagnitude = 0.35;
    }

    joystickState.magnitude = speedMagnitude;
    joystickState.angle = angle;
    joystickState.dx = Math.cos(angle) * speedMagnitude;
    joystickState.dy = Math.sin(angle) * speedMagnitude;

    if (joystickKnob) {
      const visualDist = maxRadius * speedMagnitude;
      const visualX = Math.cos(angle) * visualDist;
      const visualY = Math.sin(angle) * visualDist;
      joystickKnob.style.transform = `translate(${visualX}px, ${visualY}px)`;
    }
  } else if (!joystickState.pointerId) {
    joystickState.active = false;
    joystickState.magnitude = 0;
    joystickState.dx = 0;
    joystickState.dy = 0;
    if (joystickKnob) joystickKnob.style.transform = `translate(0px, 0px)`;
  }
}
