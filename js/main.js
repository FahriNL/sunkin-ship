/* ==========================================================================
   LAUT DARAH - MAIN ENTRY POINT
   Game Loop, Time Management, Periodic Auto-Save, & Bootstrap
   ========================================================================== */

let lastTime = performance.now();

function gameLoop(time) {
  const dt = Math.min(0.1, (time - lastTime) / 1000);
  lastTime = time;

  if (!isGamePaused) {
    updateGame(dt);
  }
  render();
  updateHUD();

  requestAnimationFrame(gameLoop);
}

// Auto-save player state every 10 seconds
setInterval(() => {
  saveGame();
}, 10000);

// Bootstrap on window load
window.addEventListener('load', () => {
  showToast("Gunakan kemudi sentuh atau keyboard (WASD / Panah) untuk berlayar!", "compass");
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
