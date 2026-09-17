/* ==========================================================================
   LAUT DARAH - AUDIO SYNTHESIZER MODULE
   Web Audio API Procedural Sound Engine
   ========================================================================== */

class SoundFX {
  constructor() {
    this.ctx = null;
    this._muted = false;
    this.masterVolume = 1.0;
    this.sfxVolume = 1.0;
    this.ambienceVolume = 0.9;
    this.battleVolume = 0.85;
    this.screenShakeEnabled = true;
    this.autoFullscreen = true;
    this.sfxMasterGain = null;

    this.cannonBuffers = [];
    this.hitBuffers = [];
    this.seagullBuffers = [];
    this.seagullAwayBuffer = null;
    this.lastCannonTime = 0;
    this.lastHitTime = 0;
    this.lastSeagullTime = 0;
    this.activeCannonCount = 0;
    this.activeHitCount = 0;
    this.filesLoaded = false;

    // New Sound Effect Buffers
    this.coinBuffer = null;
    this.ironHitBuffers = [];
    this.mistBuffer = null;
    this.navalMineExplosionBuffers = [];
    this.monsterRoarBuffers = [];
    this.monsterAttackBuffer = null;
    this.monsterChargeBuffer = null;
    this.monsterHitBuffers = [];
    this.monsterMoveBuffers = [];

    this.lastMonsterRoarTime = 0;
    this.lastMonsterMoveTime = 0;
    this.lastMonsterChargeTime = 0;
    this.lastMineExplosionTime = 0;

    // Background Sea Ambience, Abyssal Ambience & Dynamic Battle Music
    this.seaAmbienceAudio = null;
    this.abyssalAmbienceAudio = null;
    this.abyssalAmbienceVolume = 0;
    this.targetAbyssalVolume = 0;
    this.battleMusicAudio = null;
    this.battleMusicVolume = 0;
    this.targetBattleVolume = 0;

    this.loadSettings();
  }

  loadSettings() {
    try {
      const data = localStorage.getItem('BLOOD_SEA_SETTINGS_v2');
      if (data) {
        const s = JSON.parse(data);
        if (typeof s.masterVolume === 'number') this.masterVolume = s.masterVolume;
        if (typeof s.sfxVolume === 'number') this.sfxVolume = s.sfxVolume;
        if (typeof s.ambienceVolume === 'number') this.ambienceVolume = s.ambienceVolume;
        if (typeof s.battleVolume === 'number') this.battleVolume = s.battleVolume;
        if (typeof s.muted === 'boolean') this._muted = s.muted;
        if (typeof s.screenShakeEnabled === 'boolean') this.screenShakeEnabled = s.screenShakeEnabled;
        if (typeof s.autoFullscreen === 'boolean') this.autoFullscreen = s.autoFullscreen;
      }
    } catch (e) {
      console.warn("Audio settings load error:", e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('BLOOD_SEA_SETTINGS_v2', JSON.stringify({
        masterVolume: this.masterVolume,
        sfxVolume: this.sfxVolume,
        ambienceVolume: this.ambienceVolume,
        battleVolume: this.battleVolume,
        muted: this._muted,
        screenShakeEnabled: this.screenShakeEnabled,
        autoFullscreen: this.autoFullscreen
      }));
    } catch (e) {
      console.warn("Audio settings save error:", e);
    }
  }

  get destinationNode() {
    return this.sfxMasterGain || (this.ctx ? this.ctx.destination : null);
  }

  updateVolumeRatios() {
    if (this.sfxMasterGain && this.ctx) {
      const effSfx = this._muted ? 0 : (this.masterVolume * this.sfxVolume);
      this.sfxMasterGain.gain.setValueAtTime(effSfx, this.ctx.currentTime);
    }
    if (this.seaAmbienceAudio) {
      this.seaAmbienceAudio.volume = this._muted ? 0 : Math.max(0, Math.min(1, 0.32 * this.masterVolume * this.ambienceVolume));
    }
    if (this.abyssalAmbienceAudio) {
      this.abyssalAmbienceAudio.volume = this._muted ? 0 : Math.max(0, Math.min(1, this.abyssalAmbienceVolume * this.masterVolume * this.ambienceVolume));
    }
    if (this.battleMusicAudio) {
      this.battleMusicAudio.volume = this._muted ? 0 : Math.max(0, Math.min(1, this.battleMusicVolume * this.masterVolume * this.battleVolume));
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.updateVolumeRatios();
    this.saveSettings();
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateVolumeRatios();
    this.saveSettings();
  }

  setAmbienceVolume(val) {
    this.ambienceVolume = Math.max(0, Math.min(1, val));
    this.updateVolumeRatios();
    this.saveSettings();
  }

  setBattleVolume(val) {
    this.battleVolume = Math.max(0, Math.min(1, val));
    this.updateVolumeRatios();
    this.saveSettings();
  }

  get muted() {
    return this._muted;
  }

  set muted(val) {
    this._muted = Boolean(val);
    this.updateVolumeRatios();
    this.saveSettings();
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.sfxMasterGain = this.ctx.createGain();
      this.sfxMasterGain.connect(this.ctx.destination);
      this.updateVolumeRatios();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.filesLoaded && this.ctx) {
      this.preloadAudioFiles();
    }
    this.startAmbience();
  }

  startAmbience() {
    if (!this.seaAmbienceAudio) {
      this.seaAmbienceAudio = new Audio('./sound effect/sea_ambience.mp3');
      this.seaAmbienceAudio.loop = true;
      this.seaAmbienceAudio.volume = this._muted ? 0 : Math.max(0, Math.min(1, 0.32 * this.masterVolume * this.ambienceVolume));
    }
    if (this.seaAmbienceAudio.paused && !this._muted) {
      this.seaAmbienceAudio.play().catch(() => {});
    }

    if (!this.abyssalAmbienceAudio) {
      this.abyssalTracks = [
        './sound effect/Sea_Monster_Ambience1.mp3',
        './sound effect/Sea_Monster_Ambience2.mp3'
      ];
      this.currentAbyssalIdx = 0;
      this.abyssalAmbienceAudio = new Audio(this.abyssalTracks[0]);
      this.abyssalAmbienceAudio.loop = false;
      this.abyssalAmbienceAudio.addEventListener('ended', () => {
        this.currentAbyssalIdx = (this.currentAbyssalIdx + 1) % this.abyssalTracks.length;
        this.abyssalAmbienceAudio.src = this.abyssalTracks[this.currentAbyssalIdx];
        if (this.abyssalAmbienceVolume > 0.01 && !this._muted) {
          this.abyssalAmbienceAudio.play().catch(() => {});
        }
      });
      this.abyssalAmbienceAudio.volume = 0;
    }

    if (!this.battleMusicAudio) {
      this.battleMusicAudio = new Audio('./sound effect/battle_song.mp3');
      this.battleMusicAudio.loop = true;
      this.battleMusicAudio.volume = 0;
    }
  }

  async preloadAudioFiles() {
    this.filesLoaded = true;
    const cannonFiles = [
      './sound effect/cannon_fire1.mp3',
      './sound effect/cannon_fire2.mp3',
      './sound effect/cannon_fire3.mp3',
      './sound effect/cannon_fire4.mp3'
    ];
    const hitFiles = [
      './sound effect/ship_hit1.mp3',
      './sound effect/ship_hit2.mp3',
      './sound effect/ship_hit3.mp3',
      './sound effect/ship_hit4.mp3',
      './sound effect/ship_hit5.mp3'
    ];
    const gullFiles = [
      './sound effect/seagull1.mp3',
      './sound effect/seagull2.mp3'
    ];

    const loadBuffer = async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const arrayBuf = await res.arrayBuffer();
        return await this.ctx.decodeAudioData(arrayBuf);
      } catch (e) {
        return null;
      }
    };

    cannonFiles.forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.cannonBuffers.push(buf);
    });

    hitFiles.forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.hitBuffers.push(buf);
    });

    gullFiles.forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.seagullBuffers.push(buf);
    });

    loadBuffer('./sound effect/seagull_away.mp3').then(buf => {
      if (buf) this.seagullAwayBuffer = buf;
    });

    // Preload New Audio Assets
    loadBuffer('./sound effect/Coin_collect.mp3').then(buf => { if (buf) this.coinBuffer = buf; });
    loadBuffer('./sound effect/mist1.mp3').then(buf => { if (buf) this.mistBuffer = buf; });
    loadBuffer('./sound effect/Sea_Monster_Attack.mp3').then(buf => { if (buf) this.monsterAttackBuffer = buf; });
    loadBuffer('./sound effect/Sea_Monster_Charging.mp3').then(buf => { if (buf) this.monsterChargeBuffer = buf; });

    ['./sound effect/iron_hit1.mp3', './sound effect/iron_hit2.mp3'].forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.ironHitBuffers.push(buf);
    });

    ['./sound effect/naval_mine_explosion1.mp3', './sound effect/naval_mine_explosion2.mp3'].forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.navalMineExplosionBuffers.push(buf);
    });

    ['./sound effect/Sea_Monster1.mp3', './sound effect/Sea_Monster2.mp3'].forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.monsterRoarBuffers.push(buf);
    });

    ['./sound effect/Sea_Monster_Hit1.mp3', './sound effect/Sea_Monster_Hit2.mp3', './sound effect/Sea_Monster_Hit3.mp3'].forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.monsterHitBuffers.push(buf);
    });

    ['./sound effect/Sea_Monster_Movement1.mp3', './sound effect/Sea_Monster_Movement2.mp3'].forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.monsterMoveBuffers.push(buf);
    });
  }

  updateAbyssalAmbience(inDeepAbyss, dt) {
    this.startAmbience();
    this.targetAbyssalVolume = (inDeepAbyss && !this._muted) ? 0.35 : 0;

    if (this.targetAbyssalVolume > this.abyssalAmbienceVolume) {
      this.abyssalAmbienceVolume = Math.min(this.targetAbyssalVolume, this.abyssalAmbienceVolume + (dt / 2.0) * 0.35);
    } else if (this.targetAbyssalVolume < this.abyssalAmbienceVolume) {
      this.abyssalAmbienceVolume = Math.max(0, this.abyssalAmbienceVolume - (dt / 2.5) * 0.35);
    }

    if (this.abyssalAmbienceAudio) {
      this.abyssalAmbienceAudio.volume = this._muted ? 0 : Math.max(0, Math.min(1, this.abyssalAmbienceVolume * this.masterVolume * this.ambienceVolume));
      if (this.abyssalAmbienceVolume > 0.01 && this.abyssalAmbienceAudio.paused && !this._muted) {
        this.abyssalAmbienceAudio.play().catch(() => {});
      } else if (this.abyssalAmbienceVolume <= 0.005 && !this.abyssalAmbienceAudio.paused) {
        this.abyssalAmbienceAudio.pause();
      }
    }
  }

  updateBattleMusic(inHeavyBattle, dt) {
    this.startAmbience();
    this.targetBattleVolume = (inHeavyBattle && !this._muted) ? 0.32 : 0;

    // Smooth volumetric fade transition (2.5s fade-in, 3.0s fade-out)
    if (this.targetBattleVolume > this.battleMusicVolume) {
      this.battleMusicVolume = Math.min(this.targetBattleVolume, this.battleMusicVolume + (dt / 2.5) * 0.32);
    } else if (this.targetBattleVolume < this.battleMusicVolume) {
      this.battleMusicVolume = Math.max(0, this.battleMusicVolume - (dt / 3.0) * 0.32);
    }

    if (this.battleMusicAudio) {
      this.battleMusicAudio.volume = this._muted ? 0 : Math.max(0, Math.min(1, this.battleMusicVolume * this.masterVolume * this.battleVolume));
      if (this.battleMusicVolume > 0.01 && this.battleMusicAudio.paused && !this._muted) {
        this.battleMusicAudio.play().catch(() => {});
      } else if (this.battleMusicVolume <= 0.005 && !this.battleMusicAudio.paused) {
        this.battleMusicAudio.pause();
      }
    }
  }

  playSeagullNear(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 700, 0.38);
    if (gain <= 0.02) return;

    const now = performance.now() / 1000;
    if (now - this.lastSeagullTime < 5.0) return; // Min 5 seconds between close calls
    this.lastSeagullTime = now;

    if (this.seagullBuffers.length > 0) {
      const chosen = this.seagullBuffers[Math.floor(Math.random() * this.seagullBuffers.length)];
      const src = this.ctx.createBufferSource();
      src.buffer = chosen;
      src.playbackRate.value = 0.95 + Math.random() * 0.1;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    }
  }

  playSeagullAway() {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.seagullAwayBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.seagullAwayBuffer;
      src.playbackRate.value = 0.94 + Math.random() * 0.12;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.24, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    }
  }

  playCoin() {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.coinBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.coinBuffer;
      src.playbackRate.value = 0.96 + Math.random() * 0.1;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.55, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playLoot();
    }
  }

  playIronHit(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1300, 0.85);
    if (gain <= 0.01) return;

    if (this.ironHitBuffers.length > 0) {
      const chosen = this.ironHitBuffers[Math.floor(Math.random() * this.ironHitBuffers.length)];
      const src = this.ctx.createBufferSource();
      src.buffer = chosen;
      src.playbackRate.value = 0.92 + Math.random() * 0.16;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playRamHit();
    }
  }

  playMistCast(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1400, 0.7);
    if (gain <= 0.01) return;

    if (this.mistBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.mistBuffer;
      src.playbackRate.value = 0.94 + Math.random() * 0.12;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playGhostWisp();
    }
  }

  playMineExplosion(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1600, 1.0);
    if (gain <= 0.01) return;

    const now = performance.now() / 1000;
    if (now - this.lastMineExplosionTime < 0.08) return;
    this.lastMineExplosionTime = now;

    if (this.navalMineExplosionBuffers.length > 0) {
      const chosen = this.navalMineExplosionBuffers[Math.floor(Math.random() * this.navalMineExplosionBuffers.length)];
      const src = this.ctx.createBufferSource();
      src.buffer = chosen;
      src.playbackRate.value = 0.9 + Math.random() * 0.18;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playCannon(x, y);
    }
  }

  playMonsterRoar(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1800, 0.85);
    if (gain <= 0.02) return;

    const now = performance.now() / 1000;
    if (now - this.lastMonsterRoarTime < 2.5) return;
    this.lastMonsterRoarTime = now;

    if (this.monsterRoarBuffers.length > 0) {
      const chosen = this.monsterRoarBuffers[Math.floor(Math.random() * this.monsterRoarBuffers.length)];
      const src = this.ctx.createBufferSource();
      src.buffer = chosen;
      src.playbackRate.value = 0.92 + Math.random() * 0.15;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playEerieRoar();
    }
  }

  playMonsterAttack(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1400, 0.75);
    if (gain <= 0.02) return;

    if (this.monsterAttackBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.monsterAttackBuffer;
      src.playbackRate.value = 0.94 + Math.random() * 0.12;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playSpikeLaunch();
    }
  }

  playMonsterCharge(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1600, 0.85);
    if (gain <= 0.02) return;

    const now = performance.now() / 1000;
    if (now - this.lastMonsterChargeTime < 3.0) return;
    this.lastMonsterChargeTime = now;

    if (this.monsterChargeBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.monsterChargeBuffer;
      src.playbackRate.value = 0.92 + Math.random() * 0.15;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playIronChargeHorn();
    }
  }

  playMonsterHit(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1300, 0.8);
    if (gain <= 0.01) return;

    if (this.monsterHitBuffers.length > 0) {
      const chosen = this.monsterHitBuffers[Math.floor(Math.random() * this.monsterHitBuffers.length)];
      const src = this.ctx.createBufferSource();
      src.buffer = chosen;
      src.playbackRate.value = 0.93 + Math.random() * 0.14;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playHit(x, y);
    }
  }

  playMonsterMove(x, y) {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 900, 0.55);
    if (gain <= 0.03) return;

    const now = performance.now() / 1000;
    if (now - this.lastMonsterMoveTime < 4.0) return;
    this.lastMonsterMoveTime = now;

    if (this.monsterMoveBuffers.length > 0) {
      const chosen = this.monsterMoveBuffers[Math.floor(Math.random() * this.monsterMoveBuffers.length)];
      const src = this.ctx.createBufferSource();
      src.buffer = chosen;
      src.playbackRate.value = 0.94 + Math.random() * 0.12;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      src.connect(gainNode);
      gainNode.connect(this.destinationNode);
      src.start();
    } else {
      this.playSplash();
    }
  }

  getSpatialVolume(x, y, maxDist = 1250, baseVol = 0.75) {
    if (this.muted) return 0;
    if (x === undefined || y === undefined || typeof playerState === 'undefined') {
      return baseVol;
    }
    const dist = Math.hypot(x - playerState.x, y - playerState.y);
    if (dist >= maxDist) return 0;
    // Natural quadratic falloff with distance
    const norm = 1 - (dist / maxDist);
    return Math.pow(norm, 1.8) * baseVol;
  }

  playCannon(x, y) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1300, 0.75);
    if (gain <= 0.01) return; // Out of hearing distance

    // Anti-overlapping & throttling: limit max 3 concurrent voices, min 65ms gap
    const nowSec = performance.now() / 1000;
    if (nowSec - this.lastCannonTime < 0.065 && this.activeCannonCount >= 3) return;
    this.lastCannonTime = nowSec;

    if (this.cannonBuffers.length > 0) {
      const chosenBuf = this.cannonBuffers[Math.floor(Math.random() * this.cannonBuffers.length)];
      const src = this.ctx.createBufferSource();
      src.buffer = chosenBuf;
      src.playbackRate.value = 0.94 + Math.random() * 0.12;

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);

      src.connect(gainNode);
      gainNode.connect(this.destinationNode);

      this.activeCannonCount++;
      src.onended = () => {
        this.activeCannonCount = Math.max(0, this.activeCannonCount - 1);
      };
      src.start();
    } else {
      // Procedural synthesizer fallback
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
      gainNode.gain.setValueAtTime(gain * 0.6, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gainNode);
      gainNode.connect(this.destinationNode);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  playMineDrop() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playAlertHorn() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(277, now + 0.15);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playRamHit() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(18, now + 0.45);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playSteamHiss() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(680, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playIronChargeHorn() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Low brassy steam engine blast with dual harmonics
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.linearRampToValueAtTime(145, now + 0.2);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.9);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(165, now);
    osc2.frequency.linearRampToValueAtTime(220, now + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.9);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.destinationNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.9);
    osc2.stop(now + 0.9);
  }

  playGhostWisp() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playSpikeLaunch() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playHit(x, y) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.getSpatialVolume(x, y, 1200, 0.7);
    if (gain <= 0.01) return; // Too far away to hear

    // Anti-overlapping & throttling: limit max 3 concurrent voices, min 80ms gap
    const nowSec = performance.now() / 1000;
    if (nowSec - this.lastHitTime < 0.08 && this.activeHitCount >= 3) return;
    this.lastHitTime = nowSec;

    if (this.hitBuffers.length > 0) {
      const chosenBuf = this.hitBuffers[Math.floor(Math.random() * this.hitBuffers.length)];
      const src = this.ctx.createBufferSource();
      src.buffer = chosenBuf;
      src.playbackRate.value = 0.92 + Math.random() * 0.16;

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);

      src.connect(gainNode);
      gainNode.connect(this.destinationNode);

      this.activeHitCount++;
      src.onended = () => {
        this.activeHitCount = Math.max(0, this.activeHitCount - 1);
      };
      src.start();
    } else {
      // Procedural synthesizer fallback
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
      gainNode.gain.setValueAtTime(gain * 0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gainNode);
      gainNode.connect(this.destinationNode);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }

  playSplash() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playLoot() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.07);
      gain.gain.setValueAtTime(0.12, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.2);
      osc.connect(gain);
      gain.connect(this.destinationNode);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.2);
    });
  }

  playEerieRoar() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.linearRampToValueAtTime(40, now + 1.2);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 1.2);
  }
}

// Global sound instance
const sound = new SoundFX();
