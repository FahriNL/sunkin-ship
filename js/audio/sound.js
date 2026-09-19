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
    this.masterLimiter = null;
    this.sfxMasterGain = null;
    this._activeVoices = 0;
    this._maxVoices = 16;

    this.cannonBuffers = [];
    this.hitBuffers = [];
    this.seagullBuffers = [];
    this.seagullAwayBuffer = null;
    this.crowBuffers = [];
    this.crowAwayBuffer = null;
    this.lastCannonTime = 0;
    this.lastHitTime = 0;
    this.lastSeagullTime = 0;
    this.lastCrowTime = 0;
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

    // Atmospheric & Weather Audio Buffers
    this.galeBuffers = [];
    this.thunderBuffers = [];
    this.lightningSparkBuffers = [];
    this.oceanSwellBuffers = [];
    this.compassGlitchBuffer = null;
    this.occultWhisperBuffer = null;

    // Port & Navigation Audio Buffers
    this.portDockingRopeBuffer = null;
    this.portDockingWoodBuffer = null;
    this.weighAnchorBuffer = null;

    // Clan & Weapon Audio Buffers
    this.frostThrowBuffer = null;
    this.frostSnareBuffers = [];
    this.rocketVolleyBuffer = null;
    this.ironRamCollisionBuffer = null;

    // Monster Specialized Audio Buffers
    this.inkPlumeBuffer = null;
    this.tentacleSlapBuffer = null;
    this.leviathanBellowBuffer = null;
    this.predatorySurgeBuffer = null;
    this.biteCrunchBuffer = null;
    this.whirlpoolBuffer = null;

    // Island Conquest & Tower Audio Buffers
    this.towerDestructionBuffer = null;
    this.conquestFanfareBuffer = null;

    // UI & Shipyard Audio Buffers
    this.shipyardHammerBuffer = null;
    this.compartmentInspectBuffer = null;
    this.repairBuffer = null;
    this.mapToggleBuffer = null;

    // Audio Throttling Timers (anti-clipping / spam protection)
    this.lastGaleTime = 0;
    this.lastLightningSparkTime = 0;
    this.lastOceanSwellTime = 0;
    this.lastCompassGlitchTime = 0;
    this.lastOccultWhisperTime = 0;
    this.lastPredatorySurgeTime = 0;

    // Streaming HTML5 Audio Elements (Memory-efficient, zero RAM spikes)
    this.seaAmbienceAudio = null;
    this.abyssalAmbienceAudio = null;
    this.abyssalAmbienceVolume = 0;
    this.targetAbyssalVolume = 0;
    this.battleMusicAudio = null;
    this.battleMusicVolume = 0;
    this.targetBattleVolume = 0;

    this.rainAudio = null;
    this.denseFogAudio = null;
    this.bloodSeaAudio = null;
    this.corrosiveSizzleAudio = null;
    this.corrosiveSizzleActive = false;
    this.corrosiveSizzleTimer = 0;
    this.conquestFanfareAudio = null;
    this.fanfareDuckingTimer = 0;

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
    const effAmb = this._muted ? 0 : (this.masterVolume * this.ambienceVolume);
    if (this.seaAmbienceAudio) {
      this.seaAmbienceAudio.volume = Math.max(0, Math.min(1, 0.28 * effAmb));
    }
    if (this.abyssalAmbienceAudio) {
      this.abyssalAmbienceAudio.volume = Math.max(0, Math.min(1, this.abyssalAmbienceVolume * effAmb * 0.9));
    }
    if (this.battleMusicAudio) {
      this.battleMusicAudio.volume = this._muted ? 0 : Math.max(0, Math.min(1, this.battleMusicVolume * this.masterVolume * this.battleVolume * 0.92));
    }
    if (this._muted) {
      if (this.rainAudio) this.rainAudio.volume = 0;
      if (this.denseFogAudio) this.denseFogAudio.volume = 0;
      if (this.bloodSeaAudio) this.bloodSeaAudio.volume = 0;
      if (this.corrosiveSizzleAudio) this.corrosiveSizzleAudio.volume = 0;
      if (this.conquestFanfareAudio) this.conquestFanfareAudio.volume = 0;
    } else if (this.conquestFanfareAudio) {
      this.conquestFanfareAudio.volume = Math.max(0, Math.min(1, 0.95 * this.masterVolume * this.sfxVolume));
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

      // Master Studio Limiter (DynamicsCompressorNode) prevents clipping & speaker distortion
      this.masterLimiter = this.ctx.createDynamicsCompressor();
      this.masterLimiter.threshold.setValueAtTime(-6, this.ctx.currentTime);
      this.masterLimiter.knee.setValueAtTime(12, this.ctx.currentTime);
      this.masterLimiter.ratio.setValueAtTime(10, this.ctx.currentTime);
      this.masterLimiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterLimiter.release.setValueAtTime(0.15, this.ctx.currentTime);
      this.masterLimiter.connect(this.ctx.destination);

      this.sfxMasterGain = this.ctx.createGain();
      this.sfxMasterGain.connect(this.masterLimiter);
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

  // Safe voice allocator and dispatcher - eliminates voice counter leakage
  _safePlayBuffer(buffer, gain, playbackRate = 1.0, onEndedCallback = null) {
    if (this._muted || !buffer) return null;
    this.init();
    if (!this.ctx) return null;
    if (gain <= 0.01) return null;
    if (this._activeVoices >= this._maxVoices) return null;

    try {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = playbackRate;

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);

      src.connect(gainNode);
      gainNode.connect(this.destinationNode);

      this._activeVoices++;
      let isEnded = false;
      src.onended = () => {
        if (isEnded) return;
        isEnded = true;
        this._activeVoices = Math.max(0, this._activeVoices - 1);
        try {
          src.disconnect();
          gainNode.disconnect();
        } catch (e) {}
        if (typeof onEndedCallback === 'function') {
          try { onEndedCallback(); } catch (e) {}
        }
      };

      src.start();
      return src;
    } catch (err) {
      return null;
    }
  }

  // Priority buffer playback that bypasses _maxVoices limiter
  _playPriorityBuffer(buffer, gain, playbackRate = 1.0, onEndedCallback = null) {
    if (this._muted || !buffer) return null;
    this.init();
    if (!this.ctx) return null;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = playbackRate;

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);

      src.connect(gainNode);
      gainNode.connect(this.destinationNode);

      let isEnded = false;
      src.onended = () => {
        if (isEnded) return;
        isEnded = true;
        try {
          src.disconnect();
          gainNode.disconnect();
        } catch (e) {}
        if (typeof onEndedCallback === 'function') {
          try { onEndedCallback(); } catch (e) {}
        }
      };

      src.start();
      return src;
    } catch (err) {
      return null;
    }
  }

  suspendAudio() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    if (this.seaAmbienceAudio) this.seaAmbienceAudio.pause();
    if (this.abyssalAmbienceAudio) this.abyssalAmbienceAudio.pause();
    if (this.battleMusicAudio) this.battleMusicAudio.pause();
    if (this.rainAudio) this.rainAudio.pause();
    if (this.denseFogAudio) this.denseFogAudio.pause();
    if (this.bloodSeaAudio) this.bloodSeaAudio.pause();
    if (this.corrosiveSizzleAudio) this.corrosiveSizzleAudio.pause();
    if (this.conquestFanfareAudio) this.conquestFanfareAudio.pause();
  }

  resumeAudio() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
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

    if (!this.rainAudio) {
      this.rainAudio = new Audio('./sound effect/Rain.mp3');
      this.rainAudio.loop = true;
      this.rainAudio.volume = 0;
    }
    if (!this.denseFogAudio) {
      this.denseFogAudio = new Audio('./sound effect/Dense_Fog_Miasma_Drone.wav');
      this.denseFogAudio.loop = true;
      this.denseFogAudio.volume = 0;
    }
    if (!this.bloodSeaAudio) {
      this.bloodSeaAudio = new Audio('./sound effect/Blood_Sea_Ambience.mp3');
      this.bloodSeaAudio.loop = true;
      this.bloodSeaAudio.volume = 0;
    }
    if (!this.corrosiveSizzleAudio) {
      this.corrosiveSizzleAudio = new Audio('./sound effect/Corrosive_Blood_Sizzle.wav');
      this.corrosiveSizzleAudio.loop = true;
      this.corrosiveSizzleAudio.volume = 0;
    }
    if (!this.conquestFanfareAudio) {
      this.conquestFanfareAudio = new Audio('./sound effect/Island_Conquest_Fanfare.wav');
      this.conquestFanfareAudio.loop = false;
      this.conquestFanfareAudio.volume = this._muted ? 0 : Math.max(0, Math.min(1, 0.95 * this.masterVolume * this.sfxVolume));
      this.conquestFanfareAudio.addEventListener('ended', () => {
        this.fanfareDuckingTimer = 0;
      });
    }
  }

  _fadeAudioElement(audioEl, targetVol, dt, fadeDuration = 2.5) {
    if (!audioEl) return;
    const currentVol = audioEl.volume;
    const step = (dt / fadeDuration);
    let nextVol = currentVol;
    if (currentVol < targetVol) {
      nextVol = Math.min(targetVol, currentVol + step);
    } else if (currentVol > targetVol) {
      nextVol = Math.max(0, currentVol - step);
    }
    nextVol = Math.max(0, Math.min(1, nextVol));
    if (Math.abs(audioEl.volume - nextVol) > 0.001) {
      audioEl.volume = nextVol;
    }
    if (nextVol > 0.005 && audioEl.paused && !this._muted) {
      audioEl.play().catch(() => {});
    } else if (nextVol <= 0.005 && !audioEl.paused) {
      audioEl.pause();
    }
  }

  updateWeatherAmbience(weatherType, intensity, playerDist, dt) {
    this.startAmbience();
    if (this._muted) {
      if (this.rainAudio && !this.rainAudio.paused) this.rainAudio.pause();
      if (this.denseFogAudio && !this.denseFogAudio.paused) this.denseFogAudio.pause();
      if (this.bloodSeaAudio && !this.bloodSeaAudio.paused) this.bloodSeaAudio.pause();
      if (this.corrosiveSizzleAudio && !this.corrosiveSizzleAudio.paused) this.corrosiveSizzleAudio.pause();
      return;
    }

    const effAmb = this.masterVolume * this.ambienceVolume;

    // 1. Rain Ambience
    const isRaining = ['rain', 'storm', 'thunderstorm', 'blood_tempest'].includes(weatherType);
    const targetRainVol = isRaining ? Math.min(0.42, 0.42 * (intensity || 0.6)) : 0;
    this._fadeAudioElement(this.rainAudio, targetRainVol * effAmb, dt, 2.5);

    // 2. Dense Fog Miasma Drone (>=62,000m or dense_fog weather)
    const isInDenseFog = (weatherType === 'dense_fog') || (playerDist >= 62000 && playerDist < 75000);
    const targetFogVol = isInDenseFog ? Math.max(0.2, Math.min(0.45, 0.45 * (intensity || 0.7))) : 0;
    this._fadeAudioElement(this.denseFogAudio, targetFogVol * effAmb, dt, 3.0);

    // 3. Blood Sea Ambience (>=75,000m or blood_tempest weather)
    const isInBloodSea = (weatherType === 'blood_tempest') || (playerDist >= 75000);
    const targetBloodVol = isInBloodSea ? Math.max(0.25, Math.min(0.52, 0.52 * (intensity || 0.8))) : 0;
    this._fadeAudioElement(this.bloodSeaAudio, targetBloodVol * effAmb, dt, 3.5);

    // 4. Corrosive Blood Sizzle
    if (this.corrosiveSizzleActive) {
      this._fadeAudioElement(this.corrosiveSizzleAudio, 0.36 * effAmb, dt, 1.0);
      this.corrosiveSizzleTimer -= dt;
      if (this.corrosiveSizzleTimer <= 0) {
        this.corrosiveSizzleActive = false;
      }
    } else {
      this._fadeAudioElement(this.corrosiveSizzleAudio, 0, dt, 2.0);
    }
  }

  triggerCorrosiveSizzle(dt) {
    this.startAmbience();
    this.corrosiveSizzleActive = true;
    this.corrosiveSizzleTimer = 1.8;
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

    // Preload Crow / Carrion Seabird Audio Assets
    const crowFiles = [
      './sound effect/crow1.mp3',
      './sound effect/crow2.mp3'
    ];
    crowFiles.forEach(async (url) => {
      const buf = await loadBuffer(url);
      if (buf) this.crowBuffers.push(buf);
    });

    loadBuffer('./sound effect/crow_away.mp3').then(buf => {
      if (buf) this.crowAwayBuffer = buf;
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

    // Atmospheric & Weather Audio Assets
    for (let i = 1; i <= 7; i++) {
      loadBuffer(`./sound effect/Gale_Whoosh${i}.mp3`).then(buf => { if (buf) this.galeBuffers.push(buf); });
    }
    for (let i = 1; i <= 3; i++) {
      loadBuffer(`./sound effect/Thunderclap_Boom${i}.mp3`).then(buf => { if (buf) this.thunderBuffers.push(buf); });
      loadBuffer(`./sound effect/Lightning_Warning_Spark${i}.wav`).then(buf => { if (buf) this.lightningSparkBuffers.push(buf); });
      loadBuffer(`./sound effect/Ocean_Swell_Crash${i}.mp3`).then(buf => { if (buf) this.oceanSwellBuffers.push(buf); });
    }
    loadBuffer('./sound effect/Compass_Static_Glitch.wav').then(buf => { if (buf) this.compassGlitchBuffer = buf; });
    loadBuffer('./sound effect/Occult_Whispering_Compass.wav').then(buf => { if (buf) this.occultWhisperBuffer = buf; });

    // Port & Navigation Audio Assets (Simultaneous Docking Support)
    loadBuffer('./sound effect/Port_Docking_Rope.mp3').then(buf => { if (buf) this.portDockingRopeBuffer = buf; });
    loadBuffer('./sound effect/Port_Docking_Wood.mp3').then(buf => { if (buf) this.portDockingWoodBuffer = buf; });
    loadBuffer('./sound effect/Weigh_Anchor.wav').then(buf => { if (buf) this.weighAnchorBuffer = buf; });

    // Combat & Clan Weapon Audio Assets
    loadBuffer('./sound effect/Frost_Axe_Throw.wav').then(buf => { if (buf) this.frostThrowBuffer = buf; });
    for (let i = 1; i <= 3; i++) {
      loadBuffer(`./sound effect/Frost_Snare_Freeze${i}.wav`).then(buf => { if (buf) this.frostSnareBuffers.push(buf); });
    }
    loadBuffer('./sound effect/Rocket_Volley_Sizzle.wav').then(buf => { if (buf) this.rocketVolleyBuffer = buf; });
    loadBuffer('./sound effect/Iron_Ram_Collision.mp3').then(buf => { if (buf) this.ironRamCollisionBuffer = buf; });

    // Monster Specialized Audio Assets
    loadBuffer('./sound effect/Ink_Plume_Ejection.wav').then(buf => { if (buf) this.inkPlumeBuffer = buf; });
    loadBuffer('./sound effect/Tentacle_Sea_Slap.wav').then(buf => { if (buf) this.tentacleSlapBuffer = buf; });
    loadBuffer('./sound effect/Ancient_Leviathan_Bellow.mp3').then(buf => { if (buf) this.leviathanBellowBuffer = buf; });
    loadBuffer('./sound effect/Predatory_Surge.wav').then(buf => { if (buf) this.predatorySurgeBuffer = buf; });
    loadBuffer('./sound effect/Colossal_Bite_Crunch.wav').then(buf => { if (buf) this.biteCrunchBuffer = buf; });
    loadBuffer('./sound effect/Vortex_Whirlpool_Roar.wav').then(buf => { if (buf) this.whirlpoolBuffer = buf; });

    // Island Conquest & Tower Audio Assets
    loadBuffer('./sound effect/Tower_Destruction.wav').then(buf => { if (buf) this.towerDestructionBuffer = buf; });
    loadBuffer('./sound effect/Island_Conquest_Fanfare.wav').then(buf => { if (buf) this.conquestFanfareBuffer = buf; });

    // Shipyard & UI Audio Assets
    loadBuffer('./sound effect/Shipyard_Hammer_Strike.wav').then(buf => { if (buf) this.shipyardHammerBuffer = buf; });
    loadBuffer('./sound effect/Compartment_Inspect.wav').then(buf => { if (buf) this.compartmentInspectBuffer = buf; });
    loadBuffer('./sound effect/Quick_Field_Repair.wav').then(buf => { if (buf) this.repairBuffer = buf; });
    loadBuffer('./sound effect/Map_Unfurl_Fold.mp3').then(buf => { if (buf) this.mapToggleBuffer = buf; });
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
      const computedVolume = this._muted ? 0 : Math.max(0, Math.min(1, this.abyssalAmbienceVolume * this.masterVolume * this.ambienceVolume));
      const newVol = Math.max(0, Math.min(1, computedVolume));
      if (Math.abs(this.abyssalAmbienceAudio.volume - newVol) > 0.01) {
        this.abyssalAmbienceAudio.volume = newVol;
      }
      if (this.abyssalAmbienceVolume > 0.01 && this.abyssalAmbienceAudio.paused && !this._muted) {
        this.abyssalAmbienceAudio.play().catch(() => {});
      } else if (this.abyssalAmbienceVolume <= 0.005 && !this.abyssalAmbienceAudio.paused) {
        this.abyssalAmbienceAudio.pause();
      }
    }
  }

  updateBattleMusic(inHeavyBattle, dt) {
    this.startAmbience();
    if (this.fanfareDuckingTimer > 0) {
      this.fanfareDuckingTimer -= dt;
      this.targetBattleVolume = 0.03;
    } else {
      this.targetBattleVolume = (inHeavyBattle && !this._muted) ? 0.32 : 0;
    }

    // Smooth volumetric fade transition (2.5s fade-in, 3.0s fade-out)
    if (this.targetBattleVolume > this.battleMusicVolume) {
      this.battleMusicVolume = Math.min(this.targetBattleVolume, this.battleMusicVolume + (dt / 2.5) * 0.32);
    } else if (this.targetBattleVolume < this.battleMusicVolume) {
      this.battleMusicVolume = Math.max(0, this.battleMusicVolume - (dt / 3.0) * 0.32);
    }

    if (this.battleMusicAudio) {
      const computedVolume = this._muted ? 0 : Math.max(0, Math.min(1, this.battleMusicVolume * this.masterVolume * this.battleVolume));
      const newVol = Math.max(0, Math.min(1, computedVolume));
      if (Math.abs(this.battleMusicAudio.volume - newVol) > 0.01) {
        this.battleMusicAudio.volume = newVol;
      }
      if (this.battleMusicVolume > 0.01 && this.battleMusicAudio.paused && !this._muted) {
        this.battleMusicAudio.play().catch(() => {});
      } else if (this.battleMusicVolume <= 0.005 && !this.battleMusicAudio.paused) {
        this.battleMusicAudio.pause();
      }
    }
  }

  playSeagullNear(x, y) {
    if (this._muted) return;
    // Seagulls do not chirp happily in the Blood Sea
    if (typeof getBiomeInfo === 'function' && typeof playerState !== 'undefined') {
      const dist = Math.hypot(playerState.x, playerState.y);
      if (getBiomeInfo(dist).isBloodSea) return;
    }
    const now = performance.now() / 1000;
    if (now - this.lastSeagullTime < 5.0) return; // Min 5 seconds between close calls
    const gain = this.getSpatialVolume(x, y, 750, 0.28);
    if (gain <= 0.02) return;
    this.lastSeagullTime = now;

    if (this.seagullBuffers.length > 0) {
      const chosen = this.seagullBuffers[Math.floor(Math.random() * this.seagullBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.95 + Math.random() * 0.1);
    }
  }

  playSeagullAway() {
    if (this._muted) return;
    if (typeof getBiomeInfo === 'function' && typeof playerState !== 'undefined') {
      const dist = Math.hypot(playerState.x, playerState.y);
      if (getBiomeInfo(dist).isBloodSea) return;
    }
    if (this.seagullAwayBuffer) {
      this._safePlayBuffer(this.seagullAwayBuffer, 0.22, 0.94 + Math.random() * 0.12);
    }
  }

  playCrowCaw(x, y) {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastCrowTime < 4.5) return;
    const gain = this.getSpatialVolume(x, y, 900, 0.45);
    if (gain <= 0.02) return;
    this.lastCrowTime = now;

    if (this.crowBuffers.length > 0) {
      const chosen = this.crowBuffers[Math.floor(Math.random() * this.crowBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.94 + Math.random() * 0.12);
    } else {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gainNode = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(130, t + 0.32);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(460, t);
      filter.Q.setValueAtTime(2.8, t);
      gainNode.gain.setValueAtTime(gain * 0.45, t);
      gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.32);
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.destinationNode);
      osc.start(t);
      osc.stop(t + 0.32);
      osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gainNode.disconnect(); } catch (e) {} };
    }
  }

  playCrowAway() {
    if (this._muted) return;
    if (this.crowAwayBuffer) {
      this._safePlayBuffer(this.crowAwayBuffer, 0.32, 0.94 + Math.random() * 0.12);
    }
  }

  playCoin() {
    if (this._muted) return;
    if (this.coinBuffer) {
      this._safePlayBuffer(this.coinBuffer, 0.52, 0.96 + Math.random() * 0.1);
    } else {
      this.playLoot();
    }
  }

  playIronHit(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1300, 0.72);
    if (gain <= 0.01) return;

    if (this.ironHitBuffers.length > 0) {
      const chosen = this.ironHitBuffers[Math.floor(Math.random() * this.ironHitBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.92 + Math.random() * 0.16);
    } else {
      this.playRamHit();
    }
  }

  playMistCast(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1400, 0.58);
    if (gain <= 0.01) return;

    if (this.mistBuffer) {
      this._safePlayBuffer(this.mistBuffer, gain, 0.94 + Math.random() * 0.12);
    } else {
      this.playGhostWisp();
    }
  }

  playMineExplosion(x, y) {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastMineExplosionTime < 0.08) return;
    const gain = this.getSpatialVolume(x, y, 1600, 0.85);
    if (gain <= 0.01) return;
    this.lastMineExplosionTime = now;

    if (this.navalMineExplosionBuffers.length > 0) {
      const chosen = this.navalMineExplosionBuffers[Math.floor(Math.random() * this.navalMineExplosionBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.9 + Math.random() * 0.18);
    } else {
      this.playCannon(x, y);
    }
  }

  playMonsterRoar(x, y) {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastMonsterRoarTime < 2.5) return;
    const gain = this.getSpatialVolume(x, y, 1800, 0.78);
    if (gain <= 0.02) return;
    this.lastMonsterRoarTime = now;

    if (this.monsterRoarBuffers.length > 0) {
      const chosen = this.monsterRoarBuffers[Math.floor(Math.random() * this.monsterRoarBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.92 + Math.random() * 0.15);
    } else {
      this.playEerieRoar();
    }
  }

  playMonsterAttack(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1400, 0.68);
    if (gain <= 0.02) return;

    if (this.monsterAttackBuffer) {
      this._safePlayBuffer(this.monsterAttackBuffer, gain, 0.94 + Math.random() * 0.12);
    } else {
      this.playSpikeLaunch();
    }
  }

  playMonsterCharge(x, y) {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastMonsterChargeTime < 3.0) return;
    const gain = this.getSpatialVolume(x, y, 1600, 0.78);
    if (gain <= 0.02) return;
    this.lastMonsterChargeTime = now;

    if (this.monsterChargeBuffer) {
      this._safePlayBuffer(this.monsterChargeBuffer, gain, 0.92 + Math.random() * 0.15);
    } else {
      this.playIronChargeHorn();
    }
  }

  playMonsterHit(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1300, 0.72);
    if (gain <= 0.01) return;

    if (this.monsterHitBuffers.length > 0) {
      const chosen = this.monsterHitBuffers[Math.floor(Math.random() * this.monsterHitBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.93 + Math.random() * 0.14);
    } else {
      this.playHit(x, y);
    }
  }

  playMonsterMove(x, y) {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastMonsterMoveTime < 4.0) return;
    const gain = this.getSpatialVolume(x, y, 950, 0.48);
    if (gain <= 0.02) return;
    this.lastMonsterMoveTime = now;

    if (this.monsterMoveBuffers.length > 0) {
      const chosen = this.monsterMoveBuffers[Math.floor(Math.random() * this.monsterMoveBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.94 + Math.random() * 0.12);
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
    const gain = this.getSpatialVolume(x, y, 1300, 0.65);
    if (gain <= 0.01) return; // Out of hearing distance

    // Anti-overlapping & throttling: limit max 4 concurrent voices, min 60ms gap
    const nowSec = performance.now() / 1000;
    if (nowSec - this.lastCannonTime < 0.06 && this.activeCannonCount >= 4) return;
    this.lastCannonTime = nowSec;

    if (this.cannonBuffers.length > 0) {
      const chosenBuf = this.cannonBuffers[Math.floor(Math.random() * this.cannonBuffers.length)];
      this.activeCannonCount++;
      this._safePlayBuffer(chosenBuf, gain, 0.94 + Math.random() * 0.12, () => {
        this.activeCannonCount = Math.max(0, this.activeCannonCount - 1);
      });
    } else {
      // Procedural synthesizer fallback
      this.init();
      if (!this.ctx) return;
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
      osc.onended = () => {
        try { osc.disconnect(); gainNode.disconnect(); } catch (e) {}
      };
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
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  playHit(x, y) {
    if (this.muted) return;
    const gain = this.getSpatialVolume(x, y, 1200, 0.65);
    if (gain <= 0.01) return; // Too far away to hear

    // Anti-overlapping & throttling: limit max 4 concurrent voices, min 65ms gap
    const nowSec = performance.now() / 1000;
    if (nowSec - this.lastHitTime < 0.065 && this.activeHitCount >= 4) return;
    this.lastHitTime = nowSec;

    if (this.hitBuffers.length > 0) {
      const chosenBuf = this.hitBuffers[Math.floor(Math.random() * this.hitBuffers.length)];
      this.activeHitCount++;
      this._safePlayBuffer(chosenBuf, gain, 0.92 + Math.random() * 0.16, () => {
        this.activeHitCount = Math.max(0, this.activeHitCount - 1);
      });
    } else {
      // Procedural synthesizer fallback
      this.init();
      if (!this.ctx) return;
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
      osc.onended = () => {
        try { osc.disconnect(); gainNode.disconnect(); } catch (e) {}
      };
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
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  playFrostThrow(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1400, 0.65);
    if (gain <= 0.01) return;

    if (this.frostThrowBuffer) {
      this._safePlayBuffer(this.frostThrowBuffer, gain, 0.94 + Math.random() * 0.12);
    } else {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
      g.gain.setValueAtTime(gain * 0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(g);
      g.connect(this.destinationNode);
      osc.start(now);
      osc.stop(now + 0.25);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch (e) {} };
    }
  }

  playFrostFreeze(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1400, 0.72);
    if (gain <= 0.01) return;

    if (this.frostSnareBuffers.length > 0) {
      const chosen = this.frostSnareBuffers[Math.floor(Math.random() * this.frostSnareBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.93 + Math.random() * 0.14);
    } else {
      this.playHit(x, y);
    }
  }

  playRocketBarrage(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1500, 0.68);
    if (gain <= 0.01) return;

    if (this.rocketVolleyBuffer) {
      this._safePlayBuffer(this.rocketVolleyBuffer, gain, 0.94 + Math.random() * 0.12);
    } else {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(980, now + 0.18);
      g.gain.setValueAtTime(gain * 0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(g);
      g.connect(this.destinationNode);
      osc.start(now);
      osc.stop(now + 0.22);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch (e) {} };
    }
  }

  playIronRamCollision(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1500, 0.82);
    if (gain <= 0.01) return;

    if (this.ironRamCollisionBuffer) {
      this._safePlayBuffer(this.ironRamCollisionBuffer, gain, 0.92 + Math.random() * 0.15);
    } else {
      this.playRamHit();
    }
  }

  playInkSpit(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1800, 0.72);
    if (gain <= 0.01) return;

    if (this.inkPlumeBuffer) {
      this._safePlayBuffer(this.inkPlumeBuffer, gain, 0.94 + Math.random() * 0.12);
    } else {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);
      g.gain.setValueAtTime(gain * 0.6, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(g);
      g.connect(this.destinationNode);
      osc.start(now);
      osc.stop(now + 0.45);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch (e) {} };
    }
  }

  playTentacleSlap(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1600, 0.75);
    if (gain <= 0.01) return;

    if (this.tentacleSlapBuffer) {
      this._safePlayBuffer(this.tentacleSlapBuffer, gain, 0.92 + Math.random() * 0.14);
    } else {
      this.playMonsterAttack(x, y);
    }
  }

  playWhirlpool(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 2000, 0.72);
    if (gain <= 0.01) return;

    if (this.whirlpoolBuffer) {
      this._safePlayBuffer(this.whirlpoolBuffer, gain, 0.94 + Math.random() * 0.1);
    } else {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.4);
      osc.frequency.linearRampToValueAtTime(60, now + 0.9);
      g.gain.setValueAtTime(gain * 0.45, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(g);
      g.connect(this.destinationNode);
      osc.start(now);
      osc.stop(now + 0.9);
      osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch (e) {} };
    }
  }

  playLeviathanBellow(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 2200, 0.85);
    if (gain <= 0.01) return;

    if (this.leviathanBellowBuffer) {
      this._safePlayBuffer(this.leviathanBellowBuffer, gain, 0.92 + Math.random() * 0.12);
    } else {
      this.playMonsterRoar(x, y);
    }
  }

  playSeaShantyWhistle() {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Sailor whistle pentatonic motif (D5, E5, G5, A5, G5, D5)
    const melody = [
      { f: 587.33, d: 0.18, pause: 0.04 },
      { f: 659.25, d: 0.16, pause: 0.04 },
      { f: 783.99, d: 0.22, pause: 0.06 },
      { f: 880.00, d: 0.32, pause: 0.10 },
      { f: 783.99, d: 0.18, pause: 0.04 },
      { f: 587.33, d: 0.38, pause: 0.02 }
    ];
    let offset = 0;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + offset);
      // Gentle subtle whistle vibrato
      osc.frequency.linearRampToValueAtTime(note.f * 1.015, now + offset + note.d * 0.5);
      osc.frequency.linearRampToValueAtTime(note.f, now + offset + note.d);

      gainNode.gain.setValueAtTime(0, now + offset);
      gainNode.gain.linearRampToValueAtTime(0.065 * (this.masterVolume * this.sfxVolume), now + offset + 0.03);
      gainNode.gain.setValueAtTime(0.065 * (this.masterVolume * this.sfxVolume), now + offset + note.d - 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);

      osc.connect(gainNode);
      gainNode.connect(this.destinationNode);
      osc.start(now + offset);
      osc.stop(now + offset + note.d);
      osc.onended = () => { try { osc.disconnect(); gainNode.disconnect(); } catch (e) {} };
      offset += note.d + note.pause;
    });
  }

  playThunderClap(isBlood = false) {
    if (this._muted) return;
    if (this.thunderBuffers.length > 0) {
      const chosen = this.thunderBuffers[Math.floor(Math.random() * this.thunderBuffers.length)];
      const rate = isBlood ? 0.84 : (0.95 + Math.random() * 0.1);
      this._safePlayBuffer(chosen, 0.88 * (this.masterVolume * this.sfxVolume), rate);
    } else {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Resonant noise burst for explosive thunder crackle
      const duration = isBlood ? 1.8 : 1.4;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isBlood ? 420 : 650, now);
      filter.frequency.exponentialRampToValueAtTime(isBlood ? 45 : 70, now + duration);
      filter.Q.setValueAtTime(isBlood ? 4.5 : 3.0, now);

      const gainNode = this.ctx.createGain();
      const effGain = 0.85 * (this.masterVolume * this.sfxVolume);
      gainNode.gain.setValueAtTime(effGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.destinationNode);

      whiteNoise.start(now);
      whiteNoise.onended = () => {
        try {
          whiteNoise.disconnect();
          filter.disconnect();
          gainNode.disconnect();
        } catch (e) {}
      };

      // 2. Sub-bass boom oscillator for physical shockwave
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = isBlood ? 'sawtooth' : 'sine';
      subOsc.frequency.setValueAtTime(isBlood ? 95 : 120, now);
      subOsc.frequency.exponentialRampToValueAtTime(isBlood ? 25 : 35, now + 0.8);

      subGain.gain.setValueAtTime(0.7 * (this.masterVolume * this.sfxVolume), now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      subOsc.connect(subGain);
      subGain.connect(this.destinationNode);

      subOsc.start(now);
      subOsc.stop(now + 0.8);
      subOsc.onended = () => {
        try {
          subOsc.disconnect();
          subGain.disconnect();
        } catch (e) {}
      };
    }
  }

  playWindGust() {
    if (this._muted) return;
    const nowSec = performance.now() / 1000;
    if (nowSec - this.lastGaleTime < 1.6) return;
    this.lastGaleTime = nowSec;

    if (this.galeBuffers.length > 0) {
      const chosen = this.galeBuffers[Math.floor(Math.random() * this.galeBuffers.length)];
      this._safePlayBuffer(chosen, 0.55 * (this.masterVolume * this.sfxVolume), 0.92 + Math.random() * 0.16);
    } else {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const bufferSize = Math.floor(this.ctx.sampleRate * 2.2);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.linearRampToValueAtTime(540, now + 1.0);
      filter.frequency.exponentialRampToValueAtTime(180, now + 2.2);
      filter.Q.setValueAtTime(2.2, now);

      const gainNode = this.ctx.createGain();
      const effVol = 0.28 * (this.masterVolume * this.sfxVolume);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(effVol, now + 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.destinationNode);

      noise.start(now);
      noise.onended = () => {
        try {
          noise.disconnect();
          filter.disconnect();
          gainNode.disconnect();
        } catch (e) {}
      };
    }
  }

  playLightningWarning(x, y) {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastLightningSparkTime < 0.35) return;
    const gain = this.getSpatialVolume(x, y, 1200, 0.65);
    if (gain <= 0.02) return;
    this.lastLightningSparkTime = now;

    if (this.lightningSparkBuffers.length > 0) {
      const chosen = this.lightningSparkBuffers[Math.floor(Math.random() * this.lightningSparkBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.94 + Math.random() * 0.12);
    }
  }

  playOceanSwellCrash(x, y) {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastOceanSwellTime < 2.2) return;
    const gain = this.getSpatialVolume(x, y, 1400, 0.62);
    if (gain <= 0.02) return;
    this.lastOceanSwellTime = now;

    if (this.oceanSwellBuffers.length > 0) {
      const chosen = this.oceanSwellBuffers[Math.floor(Math.random() * this.oceanSwellBuffers.length)];
      this._safePlayBuffer(chosen, gain, 0.92 + Math.random() * 0.15);
    }
  }

  playCompassGlitch() {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastCompassGlitchTime < 1.8) return;
    this.lastCompassGlitchTime = now;

    if (this.compassGlitchBuffer) {
      this._safePlayBuffer(this.compassGlitchBuffer, 0.48 * (this.masterVolume * this.sfxVolume), 0.95 + Math.random() * 0.1);
    }
  }

  playOccultWhisper() {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastOccultWhisperTime < 3.5) return;
    this.lastOccultWhisperTime = now;

    if (this.occultWhisperBuffer) {
      this._safePlayBuffer(this.occultWhisperBuffer, 0.42 * (this.masterVolume * this.sfxVolume), 0.96 + Math.random() * 0.08);
    }
  }

  playPredatorySurge(x, y) {
    if (this._muted) return;
    const now = performance.now() / 1000;
    if (now - this.lastPredatorySurgeTime < 2.5) return;
    const gain = this.getSpatialVolume(x, y, 1600, 0.8);
    if (gain <= 0.02) return;
    this.lastPredatorySurgeTime = now;

    if (this.predatorySurgeBuffer) {
      this._safePlayBuffer(this.predatorySurgeBuffer, gain, 0.94 + Math.random() * 0.12);
    } else {
      this.playMonsterCharge(x, y);
    }
  }

  playBiteCrunch(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1400, 0.85);
    if (gain <= 0.01) return;

    if (this.biteCrunchBuffer) {
      this._safePlayBuffer(this.biteCrunchBuffer, gain, 0.92 + Math.random() * 0.14);
    } else {
      this.playMonsterHit(x, y);
    }
  }

  playPortDocking() {
    if (this._muted) return;
    this.init();
    let played = false;
    // Simultaneous dual trigger: rope moorings creak + wooden hull dock contact
    if (this.portDockingRopeBuffer) {
      this._safePlayBuffer(this.portDockingRopeBuffer, 0.75, 0.96 + Math.random() * 0.08);
      played = true;
    }
    if (this.portDockingWoodBuffer) {
      this._safePlayBuffer(this.portDockingWoodBuffer, 0.85, 0.95 + Math.random() * 0.08);
      played = true;
    }
    if (!played) {
      this.playSplash();
    }
  }

  playWeighAnchor() {
    if (this._muted) return;
    this.init();
    if (this.weighAnchorBuffer) {
      this._safePlayBuffer(this.weighAnchorBuffer, 0.72, 0.98 + Math.random() * 0.04);
    }
  }

  playTowerDestruction(x, y) {
    if (this._muted) return;
    const gain = this.getSpatialVolume(x, y, 1800, 0.88);
    if (gain <= 0.01) return;

    if (this.towerDestructionBuffer) {
      this._safePlayBuffer(this.towerDestructionBuffer, gain, 0.93 + Math.random() * 0.12);
    } else {
      this.playMineExplosion(x, y);
    }
  }

  playConquestFanfare() {
    if (this._muted) return;
    this.init();
    this.fanfareDuckingTimer = 8.5;
    const fanfareVol = Math.max(0, Math.min(1, 0.95 * this.masterVolume * this.sfxVolume));

    // 1. Try independent streaming audio (immune to SFX voice concurrency limits)
    if (this.conquestFanfareAudio) {
      try {
        this.conquestFanfareAudio.volume = fanfareVol;
        this.conquestFanfareAudio.currentTime = 0;
        const p = this.conquestFanfareAudio.play();
        if (p !== undefined) {
          p.catch(() => {
            // Autoplay policy fallback to high-priority Web Audio buffer
            if (this.conquestFanfareBuffer) {
              this._playPriorityBuffer(this.conquestFanfareBuffer, fanfareVol, 1.0);
            }
          });
        }
        return;
      } catch (err) {
        // Fallback below
      }
    }

    // 2. High-priority Web Audio buffer playback (bypasses _maxVoices limiter)
    if (this.conquestFanfareBuffer) {
      this._playPriorityBuffer(this.conquestFanfareBuffer, fanfareVol, 1.0);
    } else {
      this.playLoot();
    }
  }

  playShipyardHammer() {
    if (this._muted) return;
    this.init();
    if (this.shipyardHammerBuffer) {
      this._safePlayBuffer(this.shipyardHammerBuffer, 0.75 * (this.masterVolume * this.sfxVolume), 0.95 + Math.random() * 0.1);
    } else {
      this.playLoot();
    }
  }

  playCompartmentInspect() {
    if (this._muted) return;
    this.init();
    if (this.compartmentInspectBuffer) {
      this._safePlayBuffer(this.compartmentInspectBuffer, 0.55 * (this.masterVolume * this.sfxVolume), 0.96 + Math.random() * 0.08);
    } else {
      this.playClick();
    }
  }

  playRepair() {
    if (this._muted) return;
    this.init();
    if (this.repairBuffer) {
      this._safePlayBuffer(this.repairBuffer, 0.72 * (this.masterVolume * this.sfxVolume), 0.98 + Math.random() * 0.06);
    } else {
      this.playSplash();
    }
  }

  playMapToggle() {
    if (this._muted) return;
    this.init();
    if (this.mapToggleBuffer) {
      this._safePlayBuffer(this.mapToggleBuffer, 0.65 * (this.masterVolume * this.sfxVolume), 0.96 + Math.random() * 0.08);
    } else {
      this.playClick();
    }
  }

  playClick() {
    if (this._muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
    gain.gain.setValueAtTime(0.12 * (this.masterVolume * this.sfxVolume), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.destinationNode);
    osc.start(now);
    osc.stop(now + 0.04);
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };
  }
}

// Global sound instance
const sound = new SoundFX();
