/* ==========================================================================
   LAUT DARAH - MAIN ENTRY POINT
   Game Loop, Time Management, Periodic Auto-Save, & Bootstrap
   ========================================================================== */

let lastTime = performance.now();
let lastFrameTime = 0;
const TARGET_FPS = 60;
const TARGET_INTERVAL = 1000 / TARGET_FPS;

function gameLoop(time) {
  requestAnimationFrame(gameLoop);

  // Frame rate cap: skip frame if not enough time has passed
  if (time - lastFrameTime < TARGET_INTERVAL) return;
  lastFrameTime = time - ((time - lastFrameTime) % TARGET_INTERVAL);

  const dt = Math.min(0.1, (time - lastTime) / 1000);
  lastTime = time;

  if (isGameStarted && !isGamePaused) {
    updateGame(dt);
    render();
    updateHUD();
  } else if (isGameStarted) {
    // When paused: render once, then stop (dirty flag approach)
    // We still need a single render when pause state changes
  }
  // When not started and not paused: don't render at all (main menu handles its own display)
}

// Auto-save player state every 10 seconds during active voyage
setInterval(() => {
  if (isGameStarted && !isGamePaused) {
    saveGame();
  }
}, 10000);

// Handle tab visibility changes - suspend everything when hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause game and suspend audio when tab is hidden
    if (isGameStarted && !isGamePaused) {
      if (typeof openPauseModal === 'function') openPauseModal();
    }
    if (typeof sound !== 'undefined' && sound.ctx && sound.ctx.state === 'running') {
      sound.ctx.suspend();
    }
    if (typeof sound !== 'undefined') {
      if (sound.seaAmbienceAudio) sound.seaAmbienceAudio.pause();
      if (sound.abyssalAmbienceAudio) sound.abyssalAmbienceAudio.pause();
      if (sound.battleMusicAudio) sound.battleMusicAudio.pause();
    }
  } else {
    // Reset lastTime to avoid huge dt spike on resume
    lastTime = performance.now();
    lastFrameTime = performance.now();
    if (typeof sound !== 'undefined' && sound.ctx && sound.ctx.state === 'suspended' && !isGamePaused) {
      sound.ctx.resume();
    }
  }
});

// Bootstrap on window load
window.addEventListener('load', () => {
  resizeCanvas();
  if (typeof updateFullscreenUI === 'function') {
    updateFullscreenUI();
  }
  // Do an initial render for the main menu background
  render();
  requestAnimationFrame(gameLoop);
});

// Unlock Web Audio & Sea Ambience on first interaction
const unlockAudio = () => {
  sound.init();
  sound.startAmbience();
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);
