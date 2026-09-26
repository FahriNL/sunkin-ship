/* ==========================================================================
   LAUT DARAH - 2D VECTOR RENDERING ENGINE
   Organic Archipelagos, Shipwrecks, Occult Spires, Spiked Mines, & Buoyant Waterlines
   ========================================================================== */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
let width = 0;
let height = 0;
let dpr = 1;

let _now = 0;
let _perfNow = 0;
const _renderedCenters = new Set();
let viewLeft = 0, viewRight = 0, viewTop = 0, viewBottom = 0;

function isVisible(x, y, margin) {
  return x > viewLeft - margin && x < viewRight + margin 
      && y > viewTop - margin && y < viewBottom + margin;
}

let graphicsQuality = localStorage.getItem('BLOOD_SEA_GRAPHICS_QUALITY') || 'high';

function setGraphicsQuality(quality) {
  graphicsQuality = quality;
  localStorage.setItem('BLOOD_SEA_GRAPHICS_QUALITY', quality);
  resizeCanvas();
}
window.setGraphicsQuality = setGraphicsQuality;
window.getGraphicsQuality = () => graphicsQuality;

function resizeCanvas() {
  const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth < 1024;
  if (graphicsQuality === 'low') {
    dpr = 1.0;
  } else if (graphicsQuality === 'med') {
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  } else {
    dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0);
  }
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Precompute and cache multi-layer island geometry once to eliminate per-frame trigonometry & GC allocations
function getIslandCachedData(isl) {
  if (isl._cachedReef && isl._cachedOuter) return isl;

  const steps = 48;
  const outerPoints = [];
  const innerPoints = [];
  const reefPoints = [];

  // Outer beach, inner lowland, and shallow reef perimeter
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const rOuter = getIslandRadiusAt(isl, theta);
    const rInner = Math.max(18, rOuter - 24);
    const rReef = rOuter + 28 + Math.sin(theta * 4 + (isl.seed || 1.2)) * 7;

    outerPoints.push({ x: Math.cos(theta) * rOuter, y: Math.sin(theta) * rOuter });
    innerPoints.push({ x: Math.cos(theta) * rInner, y: Math.sin(theta) * rInner });
    reefPoints.push({ x: Math.cos(theta) * rReef, y: Math.sin(theta) * rReef });
  }

  // Hill plateau contour (Layer 3: 3D Central Elevation)
  const hillSteps = 32;
  const hillPoints = [];
  for (let i = 0; i <= hillSteps; i++) {
    const theta = (i / hillSteps) * Math.PI * 2;
    const rOuter = getIslandRadiusAt(isl, theta);
    const rInner = Math.max(18, rOuter - 24);
    const rHill = Math.max(14, (rInner - 34) * 0.52 + Math.cos(theta * 3 + (isl.seed || 1.2) * 2.1) * 8);
    hillPoints.push({ x: Math.cos(theta) * rHill, y: Math.sin(theta) * rHill });
  }

  // Cache pier coordinates
  const dockR = getIslandRadiusAt(isl, isl.dockAngle) - 18;
  const dx = Math.cos(isl.dockAngle) * dockR;
  const dy = Math.sin(isl.dockAngle) * dockR;

  // Cache Clan-Specific Decorative Props
  const props = [];
  const palette = (typeof getIslandPalette === 'function') ? getIslandPalette(isl) : { propType: 'palm' };

  if (isl.isSkullIsland) {
    // 14 Giant Ossuary & Skulls Mounds for Skull Island
    const skullCount = 14;
    const skulls = [];
    for (let k = 0; k < skullCount; k++) {
      const skAng = (k / skullCount) * Math.PI * 2 + 0.35;
      const skR = (getIslandRadiusAt(isl, skAng) - 65) * (0.35 + (k % 3) * 0.18);
      skulls.push({
        x: Math.cos(skAng) * skR,
        y: Math.sin(skAng) * skR,
        r: 15 + (k % 4) * 4,
        rot: skAng
      });
    }
    isl._cachedSkulls = skulls;

    // Ribcage arches extending from the dock
    const ribCount = 6;
    const ribs = [];
    for (let r = 0; r < ribCount; r++) {
      ribs.push({
        dist: 12 + r * 11,
        span: 17 + (r % 2) * 4
      });
    }
    isl._cachedRibs = ribs;
  } else if (isl.isFlesh) {
    // Pulsing eldritch biomass nodes
    for (let i = 0; i < 9; i++) {
      const ang = (i / 9) * Math.PI * 2 + 0.3;
      const r = (getIslandRadiusAt(isl, ang) - 50) * 0.6;
      props.push({
        type: 'flesh_node',
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        r: 16
      });
    }
  } else if (palette.propType === 'iron') {
    // Iron Clan: Basalt boulder spires & smelting chimneys with glowing vents
    const rockCount = 8;
    for (let i = 0; i < rockCount; i++) {
      const ang = (i / rockCount) * Math.PI * 2 + 0.4;
      const r = (getIslandRadiusAt(isl, ang) - 48) * (0.42 + (i % 3) * 0.16);
      props.push({
        type: 'basalt_rock',
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        size: 14 + (i % 4) * 5,
        rot: ang
      });
    }
    // Smelting chimneys near island interior
    props.push({ type: 'forge_chimney', x: -16, y: -12, h: 26, w: 10 });
    props.push({ type: 'forge_chimney', x: 22, y: 15, h: 22, w: 9 });
  } else if (palette.propType === 'mist') {
    // Mist Clan: Arcane rune monoliths & swamp willows
    const runeCount = 6;
    for (let i = 0; i < runeCount; i++) {
      const ang = (i / runeCount) * Math.PI * 2 + 0.2;
      const r = (getIslandRadiusAt(isl, ang) - 52) * 0.58;
      props.push({
        type: 'rune_pillar',
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        w: 9,
        h: 24,
        rot: ang
      });
    }
    // Swamp shrubs
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + 0.7;
      const r = (getIslandRadiusAt(isl, ang) - 45) * 0.45;
      props.push({
        type: 'mist_shrub',
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        r: 12 + (i % 3) * 4
      });
    }
  } else if (palette.propType === 'viking') {
    // Viking Fjord: Snow-capped spruce pine trees, timber longhouses, and runestones
    const pineCount = isl.radius > 250 ? 12 : 8;
    for (let i = 0; i < pineCount; i++) {
      const ang = (i / pineCount) * Math.PI * 2 + 0.25;
      const r = (getIslandRadiusAt(isl, ang) - 45) * (0.42 + (i % 4) * 0.12);
      props.push({
        type: 'pine_tree',
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        scale: 0.85 + (i % 3) * 0.25
      });
    }
    // Viking Longhouse on inner elevation
    props.push({ type: 'viking_longhouse', x: -10, y: -8, w: 34, h: 18, rot: 0.15 });
    // Runestones around perimeter
    props.push({ type: 'runestone', x: 26, y: 18, size: 12 });
    props.push({ type: 'runestone', x: -28, y: 22, size: 10 });
  } else if (palette.propType === 'wokou') {
    // Wokou: Bamboo groves, Torii gate at dock, and Pagoda pavilion
    const bambooCount = isl.radius > 250 ? 10 : 7;
    for (let i = 0; i < bambooCount; i++) {
      const ang = (i / bambooCount) * Math.PI * 2 + 0.35;
      const r = (getIslandRadiusAt(isl, ang) - 42) * (0.4 + (i % 3) * 0.15);
      props.push({
        type: 'bamboo_grove',
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        count: 4 + (i % 3) * 2
      });
    }
    // Torii Gate near dock
    const pAng = isl.dockAngle;
    props.push({
      type: 'torii_gate',
      x: dx * 0.82,
      y: dy * 0.82,
      rot: pAng
    });
    // Pagoda pavilion on hill
    props.push({
      type: 'pagoda_pavilion',
      x: 8,
      y: -12,
      tiers: 3
    });
  } else if (isl.isUninhabited) {
    // Uninhabited Decorative Islets: Pure nature, zero man-made infrastructure
    if (isl.isRockOnly) {
      // Natural jagged basalt crags & sea boulders
      const rockCount = Math.max(4, Math.floor((isl.radius || 50) / 12));
      for (let i = 0; i < rockCount; i++) {
        const ang = (i / rockCount) * Math.PI * 2 + 0.35;
        const r = (isl.radius * 0.45) * (0.35 + (i % 3) * 0.22);
        props.push({
          type: 'basalt_rock',
          x: Math.cos(ang) * r,
          y: Math.sin(ang) * r,
          size: 10 + (i % 3) * 6,
          rot: ang
        });
      }
    } else if (!isl.isSandOnly) {
      // Natural tropical atoll: only a few wild palm trees
      const treeCount = Math.max(3, Math.min(6, Math.floor((isl.radius || 60) / 14)));
      for (let i = 0; i < treeCount; i++) {
        const ang = (i / treeCount) * Math.PI * 2 + 0.4;
        const r = (isl.radius * 0.42) * (0.4 + (i % 3) * 0.2);
        props.push({
          type: 'palm_tree',
          x: Math.cos(ang) * r,
          y: Math.sin(ang) * r,
          scale: 0.7 + (i % 3) * 0.2,
          curve: ((i % 2 === 0 ? 1 : -1) * (0.2 + (i % 3) * 0.15))
        });
      }
    }
  } else {
    // Batavia / Haven / Merchant / Neutral: Tropical palm trees & harbor cargo
    const treeCount = isl.radius > 250 ? 12 : 8;
    for (let i = 0; i < treeCount; i++) {
      const ang = (i / treeCount) * Math.PI * 2 + 0.25;
      const r = (getIslandRadiusAt(isl, ang) - 42) * (0.45 + (i % 4) * 0.12);
      props.push({
        type: 'palm_tree',
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        scale: 0.85 + (i % 3) * 0.25,
        curve: ((i % 2 === 0 ? 1 : -1) * (0.2 + (i % 3) * 0.15))
      });
    }
    // Stacked cargo boxes near pier base
    const pAng = isl.dockAngle;
    props.push({
      type: 'cargo_crates',
      x: dx * 0.82 + Math.cos(pAng + Math.PI * 0.5) * 16,
      y: dy * 0.82 + Math.sin(pAng + Math.PI * 0.5) * 16
    });
    // Wooden crane at pier
    props.push({
      type: 'harbor_crane',
      x: dx * 0.88 + Math.cos(pAng - Math.PI * 0.5) * 18,
      y: dy * 0.88 + Math.sin(pAng - Math.PI * 0.5) * 18,
      pAng: pAng
    });
  }

  // Pre-cache Lighthouse settings if island has a lighthouse
  if (isl.hasLighthouse && !isl.isUninhabited) {
    isl._cachedLighthouse = {
      x: -14,
      y: -14,
      h: 30,
      beamRange: Math.min(420, isl.radius * 1.55 + 90),
      beamWidth: 0.32
    };
  }

  isl._cachedOuter = outerPoints;
  isl._cachedInner = innerPoints;
  isl._cachedReef = reefPoints;
  isl._cachedHill = hillPoints;
  isl._cachedPier = isl.isUninhabited ? null : { dx, dy, pAngle: isl.dockAngle };
  isl._cachedProps = props;

  return isl;
}

// Render Natural Organic Coastlines & Multi-Layer Procedural Terrain (Phase 3)
function drawWorldIsland(ctx, isl) {
  getIslandCachedData(isl);
  const palette = (typeof getModulatedIslandPalette === 'function' && typeof dayNightState !== 'undefined')
    ? getModulatedIslandPalette(isl, dayNightState)
    : ((typeof getIslandPalette === 'function') ? getIslandPalette(isl) : {
        sand: '#ca8a04',
        lowland: '#166534',
        highland: '#14532d',
        reef: 'rgba(20, 184, 166, 0.32)',
        surf: 'rgba(255, 255, 255, 0.85)'
      });

  const reefPoints = isl._cachedReef;
  const outerPoints = isl._cachedOuter;
  const innerPoints = isl._cachedInner;
  const hillPoints = isl._cachedHill;

  ctx.save();
  ctx.translate(isl.x, isl.y);

  // -------------------------------------------------------------
  // LAYER -1: Subtle Coastal Drop Shadow
  // -------------------------------------------------------------
  if (typeof dayNightState !== 'undefined' && dayNightState.shadowAlpha > 0.05 && outerPoints && outerPoints.length > 0) {
    const sDirX = (typeof dayNightState.shadowDirX === 'number' && !isNaN(dayNightState.shadowDirX)) ? dayNightState.shadowDirX : 0.7;
    const sDirY = (typeof dayNightState.shadowDirY === 'number' && !isNaN(dayNightState.shadowDirY)) ? dayNightState.shadowDirY : 0.7;
    const sX = sDirX * 4.5;
    const sY = sDirY * 4.5;
    ctx.save();
    ctx.translate(sX, sY);
    ctx.fillStyle = `rgba(0, 0, 0, ${(dayNightState.shadowAlpha * 0.16).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
    for (let i = 1; i < outerPoints.length; i++) {
      const prev = outerPoints[i - 1];
      const curr = outerPoints[i];
      const mx = (prev.x + curr.x) * 0.5;
      const my = (prev.y + curr.y) * 0.5;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // -------------------------------------------------------------
  // LAYER 0: Shallow Reef Waters & Animated Foaming Surf
  // -------------------------------------------------------------
  if (reefPoints && reefPoints.length > 0) {
    ctx.fillStyle = palette.reef;
    ctx.beginPath();
    ctx.moveTo(reefPoints[0].x, reefPoints[0].y);
    for (let i = 1; i < reefPoints.length; i++) {
      const prev = reefPoints[i - 1];
      const curr = reefPoints[i];
      const mx = (prev.x + curr.x) * 0.5;
      const my = (prev.y + curr.y) * 0.5;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Animated Foaming Surf Line on Outer Beach Edge
  const surfWave = Math.sin((_perfNow || 0) * 2.2) * 1.5;
  ctx.strokeStyle = palette.surf;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 1; i < outerPoints.length; i++) {
    const prev = outerPoints[i - 1];
    const curr = outerPoints[i];
    const mx = (prev.x + curr.x) * 0.5;
    const my = (prev.y + curr.y) * 0.5;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.closePath();
  ctx.stroke();

  // -------------------------------------------------------------
  // LAYER 1: Sandy Beach / Rock Face (Organic Spline Contour)
  // -------------------------------------------------------------
  if (isl.isRockOnly) {
    ctx.fillStyle = (typeof modulateIslandColor === 'function' && typeof dayNightState !== 'undefined') ? modulateIslandColor(isl.color || '#334155', dayNightState) : (isl.color || '#334155');
  } else {
    ctx.fillStyle = palette.sand || isl.sandColor || '#ca8a04';
  }
  ctx.beginPath();
  ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
  for (let i = 1; i < outerPoints.length; i++) {
    const prev = outerPoints[i - 1];
    const curr = outerPoints[i];
    const mx = (prev.x + curr.x) * 0.5;
    const my = (prev.y + curr.y) * 0.5;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = isl.isRockOnly ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = isl.isRockOnly ? 1.8 : 1;
  ctx.stroke();

  if (isl.isSandOnly) {
    // Sandbar details: Concentric subtle sand ripples
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, (isl.radius || 40) * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(2, 1, (isl.radius || 40) * 0.28, 0, Math.PI * 2);
    ctx.stroke();
  }

  // -------------------------------------------------------------
  // LAYER 2: Main Lowland Terrain (Lush / Basalt / Swamp) - Skipped for Sand-Only Islets
  // -------------------------------------------------------------
  if (!isl.isSandOnly) {
    ctx.fillStyle = isl.isRockOnly 
      ? ((typeof modulateIslandColor === 'function' && typeof dayNightState !== 'undefined') ? modulateIslandColor('#1e293b', dayNightState) : '#1e293b')
      : (palette.lowland || isl.color || '#166534');
    ctx.beginPath();
    ctx.moveTo(innerPoints[0].x, innerPoints[0].y);
    for (let i = 1; i < innerPoints.length; i++) {
      const prev = innerPoints[i - 1];
      const curr = innerPoints[i];
      const mx = (prev.x + curr.x) * 0.5;
      const my = (prev.y + curr.y) * 0.5;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isl.isRockOnly ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = isl.isRockOnly ? 1.6 : 1.2;
    ctx.stroke();

    // -------------------------------------------------------------
    // LAYER 3: Central Hill Plateau & Dynamic 3D Cliff Drop-Shadow
    // -------------------------------------------------------------
    if (hillPoints && hillPoints.length > 0 && !isl.isFlesh) {
      // 3a. Cliff Drop-Shadow (Cast dynamically based on celestial sun/moon position)
      const cShadowLen = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowLen === 'number') ? dayNightState.shadowLen : 6;
      const cDirX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowDirX === 'number' && !isNaN(dayNightState.shadowDirX)) ? dayNightState.shadowDirX : 0.6;
      const cDirY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowDirY === 'number' && !isNaN(dayNightState.shadowDirY)) ? dayNightState.shadowDirY : 0.8;
      const cliffOffX = cDirX * Math.min(10, cShadowLen * 0.4);
      const cliffOffY = cDirY * Math.min(10, cShadowLen * 0.4);
      const cliffShadowAlpha = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number') ? (dayNightState.shadowAlpha * 0.75).toFixed(3) : 0.32;

      ctx.fillStyle = `rgba(0, 0, 0, ${cliffShadowAlpha})`;
      ctx.beginPath();
      ctx.moveTo(hillPoints[0].x + cliffOffX, hillPoints[0].y + cliffOffY);
      for (let i = 1; i < hillPoints.length; i++) {
        const prev = hillPoints[i - 1];
        const curr = hillPoints[i];
        const mx = (prev.x + curr.x) * 0.5 + cliffOffX;
        const my = (prev.y + curr.y) * 0.5 + cliffOffY;
        ctx.quadraticCurveTo(prev.x + cliffOffX, prev.y + cliffOffY, mx, my);
      }
      ctx.closePath();
      ctx.fill();

      // 3b. Highland Plateau Face
      ctx.fillStyle = isl.isRockOnly 
        ? ((typeof modulateIslandColor === 'function' && typeof dayNightState !== 'undefined') ? modulateIslandColor('#0f172a', dayNightState) : '#0f172a')
        : (palette.highland || '#14532d');
      ctx.beginPath();
      ctx.moveTo(hillPoints[0].x, hillPoints[0].y);
      for (let i = 1; i < hillPoints.length; i++) {
        const prev = hillPoints[i - 1];
        const curr = hillPoints[i];
        const mx = (prev.x + curr.x) * 0.5;
        const my = (prev.y + curr.y) * 0.5;
        ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
      }
      ctx.closePath();
      ctx.fill();

      // 3c. Cliff top highlight rim with directional celestial glint
      let rimColor = 'rgba(255, 255, 255, 0.12)';
      if (typeof dayNightState !== 'undefined' && Array.isArray(dayNightState.glintColor)) {
        const gc = dayNightState.glintColor;
        const ra = dayNightState.isDay ? 0.22 : 0.10;
        rimColor = `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, ${ra})`;
      }
      ctx.strokeStyle = isl.isRockOnly ? 'rgba(148, 163, 184, 0.25)' : rimColor;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------
  // LAYER 4: Clan Decorative Props & Environmental Features
  // -------------------------------------------------------------
  if (isl.isSkullIsland && isl._cachedSkulls) {
    // Giant Ossuary Skull Mounds
    for (let i = 0; i < isl._cachedSkulls.length; i++) {
      const sk = isl._cachedSkulls[i];
      ctx.save();
      ctx.translate(sk.x, sk.y);
      ctx.rotate(sk.rot);

      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(0, 0, sk.r, sk.r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-sk.r * 0.45, sk.r * 0.45, sk.r * 0.9, sk.r * 0.4);

      ctx.fillStyle = '#0f172a';
      const eyeR = Math.max(2.2, sk.r * 0.22);
      ctx.beginPath();
      ctx.ellipse(-sk.r * 0.35, -sk.r * 0.1, eyeR, eyeR * 1.25, -0.2, 0, Math.PI * 2);
      ctx.ellipse(sk.r * 0.35, -sk.r * 0.1, eyeR, eyeR * 1.25, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, sk.r * 0.05);
      ctx.lineTo(-eyeR * 0.5, sk.r * 0.35);
      ctx.lineTo(eyeR * 0.5, sk.r * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  } else if (isl._cachedProps) {
    // Render Cached Props
    for (let i = 0; i < isl._cachedProps.length; i++) {
      const p = isl._cachedProps[i];

      if (p.type === 'palm_tree') {
        // Natural Tropical Palm Tree
        ctx.save();
        ctx.translate(p.x, p.y);
        
        // Tree ground shadow with dynamic directional offset
        const treeShadowX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecX === 'number' && !isNaN(dayNightState.shadowVecX)) ? (dayNightState.shadowVecX * 0.35 * p.scale) : 3;
        const treeShadowY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecY === 'number' && !isNaN(dayNightState.shadowVecY)) ? (dayNightState.shadowVecY * 0.35 * p.scale) : 3;
        const treeShadowA = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number' && !isNaN(dayNightState.shadowAlpha)) ? (dayNightState.shadowAlpha * 0.72) : 0.25;
        ctx.fillStyle = `rgba(0, 0, 0, ${treeShadowA.toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(treeShadowX, treeShadowY, 6 * p.scale, 3.5 * p.scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Curved brown trunk
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.2 * p.scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(p.curve * 12 * p.scale, -8 * p.scale, p.curve * 18 * p.scale, -18 * p.scale);
        ctx.stroke();

        // 5 Arching palm fronds
        const topX = p.curve * 18 * p.scale;
        const topY = -18 * p.scale;
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2.2 * p.scale;
        const frondAngles = [0, 1.25, 2.5, 3.75, 5.0];
        frondAngles.forEach(fa => {
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          const fEndX = topX + Math.cos(fa) * 14 * p.scale;
          const fEndY = topY + Math.sin(fa) * 10 * p.scale;
          ctx.quadraticCurveTo(topX + Math.cos(fa) * 8 * p.scale, topY - 5 * p.scale, fEndX, fEndY);
          ctx.stroke();
        });

        ctx.restore();
      } else if (p.type === 'basalt_rock') {
        // Iron Clan Jagged Basalt Rock Outcrop
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(-p.size * 0.45 + 3, -p.size * 0.45 + 4, p.size * 0.9, p.size * 0.9);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.55);
        ctx.lineTo(p.size * 0.5, -p.size * 0.15);
        ctx.lineTo(p.size * 0.35, p.size * 0.5);
        ctx.lineTo(-p.size * 0.4, p.size * 0.4);
        ctx.lineTo(-p.size * 0.5, -p.size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      } else if (p.type === 'forge_chimney') {
        // Iron Clan Smelting Furnace Chimney
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-p.w * 0.5, -p.h, p.w, p.h);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-p.w * 0.5, -p.h, p.w, p.h);

        // Glowing molten coal vent at base
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-p.w * 0.35, -6, p.w * 0.7, 4);

        // Rising furnace smoke puff
        const smokePulse = Math.sin((_perfNow || 0) * 3 + i) * 2;
        ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
        ctx.beginPath();
        ctx.arc(smokePulse, -p.h - 6, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (p.type === 'rune_pillar') {
        // Mist Clan Arcane Monolith Obelisk
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);

        ctx.fillStyle = '#18181b';
        ctx.fillRect(-p.w * 0.5, -p.h, p.w, p.h);
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.strokeRect(-p.w * 0.5, -p.h, p.w, p.h);

        // Pulsing violet arcane rune inscription
        const pulse = 0.5 + Math.sin((_perfNow || 0) * 2.5 + i) * 0.5;
        ctx.fillStyle = `rgba(192, 132, 252, ${0.4 + pulse * 0.6})`;
        ctx.fillRect(-1.5, -p.h + 5, 3, p.h - 10);

        ctx.restore();
      } else if (p.type === 'mist_shrub') {
        // Mist Swamp Willow Shrub
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'cargo_crates') {
        // Stacked Harbor Cargo Crates
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.fillRect(-7, -7, 14, 14);
        ctx.strokeRect(-7, -7, 14, 14);
        ctx.fillRect(4, -5, 10, 10);
        ctx.strokeRect(4, -5, 10, 10);
        ctx.restore();
      } else if (p.type === 'harbor_crane') {
        // Wooden Harbor Crane on pier
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.pAng || 0);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -18);
        ctx.lineTo(16, -26);
        ctx.stroke();

        // Dangling rope
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(16, -26);
        ctx.lineTo(16, -12);
        ctx.stroke();
        ctx.restore();
      } else if (p.type === 'flesh_node') {
        // Pulsing Eldritch Biomass Node
        const time = (_perfNow || 0) * 2;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + Math.sin(time + i) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'pine_tree') {
        // Viking Snow Spruce Pine
        ctx.save();
        ctx.translate(p.x, p.y);
        const pineShadowX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecX === 'number' && !isNaN(dayNightState.shadowVecX)) ? (dayNightState.shadowVecX * 0.35 * p.scale) : 2;
        const pineShadowY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecY === 'number' && !isNaN(dayNightState.shadowVecY)) ? (dayNightState.shadowVecY * 0.35 * p.scale) : 2;
        const pineShadowA = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number' && !isNaN(dayNightState.shadowAlpha)) ? (dayNightState.shadowAlpha * 0.72) : 0.25;
        ctx.fillStyle = `rgba(0, 0, 0, ${pineShadowA.toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(pineShadowX, pineShadowY, 7 * p.scale, 4 * p.scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3-tiered triangular spruce foliage
        const spruceTiers = [
          { y: 0, w: 16 * p.scale, h: 10 * p.scale, snow: 3 },
          { y: -7 * p.scale, w: 12 * p.scale, h: 9 * p.scale, snow: 2.5 },
          { y: -13 * p.scale, w: 8 * p.scale, h: 8 * p.scale, snow: 2 }
        ];
        spruceTiers.forEach(t => {
          ctx.fillStyle = '#14532d';
          ctx.beginPath();
          ctx.moveTo(-t.w / 2, t.y);
          ctx.lineTo(t.w / 2, t.y);
          ctx.lineTo(0, t.y - t.h);
          ctx.closePath();
          ctx.fill();

          // Snow cap on spruce tier edge
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(-t.w / 2, t.y);
          ctx.lineTo(-t.w / 2 + 3, t.y - t.snow);
          ctx.lineTo(t.w / 2 - 3, t.y - t.snow);
          ctx.lineTo(t.w / 2, t.y);
          ctx.closePath();
          ctx.fill();
        });
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, -21 * p.scale, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'viking_longhouse') {
        // Norse Timber Longhouse with Arched Steep Roof & Dragon Gables
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(-p.w / 2 + 3, -p.h / 2 + 3, p.w, p.h);

        ctx.fillStyle = '#451a03';
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-p.w / 2 - 3, -p.h / 2);
        ctx.quadraticCurveTo(0, -p.h * 1.35, p.w / 2 + 3, -p.h / 2);
        ctx.lineTo(p.w / 2 + 3, p.h / 2);
        ctx.quadraticCurveTo(0, p.h * 0.45, -p.w / 2 - 3, p.h / 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-p.w / 2, -p.h * 0.45);
        ctx.lineTo(p.w / 2, -p.h * 0.45);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-3, p.h / 2 - 2, 6, 4);
        ctx.restore();
      } else if (p.type === 'runestone') {
        // Nordic Carved Runestone with Pulsing Frost Inscription
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.5, p.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const rPulse = 0.5 + Math.sin((_perfNow || 0) * 2.5 + i) * 0.5;
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 + rPulse * 0.55})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.5);
        ctx.lineTo(0, p.size * 0.5);
        ctx.moveTo(-p.size * 0.25, -p.size * 0.2);
        ctx.lineTo(p.size * 0.25, 0);
        ctx.moveTo(-p.size * 0.25, 0);
        ctx.lineTo(p.size * 0.25, p.size * 0.2);
        ctx.stroke();
        ctx.restore();
      } else if (p.type === 'bamboo_grove') {
        // Oriental Bamboo Grove
        ctx.save();
        ctx.translate(p.x, p.y);
        for (let b = 0; b < p.count; b++) {
          const bx = (b - p.count / 2) * 5;
          const by = Math.sin(b * 1.5) * 4;
          const bH = 18 + (b % 3) * 6;

          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx, by - bH);
          ctx.stroke();

          ctx.fillStyle = '#14532d';
          for (let n = 5; n < bH; n += 6) {
            ctx.fillRect(bx - 1.5, by - n, 3, 1.2);
          }

          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.ellipse(bx + 3, by - bH + 2, 4, 1.5, 0.4, 0, Math.PI * 2);
          ctx.ellipse(bx - 3, by - bH + 5, 4, 1.5, -0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (p.type === 'torii_gate') {
        // Sacred Red Torii Gate at Dock
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-10, -18, 3.5, 18);
        ctx.fillRect(7, -18, 3.5, 18);

        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(-12, -14, 24, 2.5);

        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(-16, -20);
        ctx.quadraticCurveTo(0, -18, 16, -20);
        ctx.lineTo(16, -17);
        ctx.quadraticCurveTo(0, -15.5, -16, -17);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-16, -20.5, 3, 4);
        ctx.fillRect(13, -20.5, 3, 4);
        ctx.restore();
      } else if (p.type === 'pagoda_pavilion') {
        // Oriental Pagoda Pavilion on Hill
        ctx.save();
        ctx.translate(p.x, p.y);

        ctx.fillStyle = '#78350f';
        ctx.fillRect(-12, -4, 24, 4);

        const pagTiers = [
          { y: -4, w: 26, h: 6 },
          { y: -10, w: 20, h: 5 },
          { y: -15, w: 14, h: 5 }
        ];
        pagTiers.forEach(tr => {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-tr.w * 0.35, tr.y - tr.h + 1, 2, tr.h - 1);
          ctx.fillRect(tr.w * 0.35 - 2, tr.y - tr.h + 1, 2, tr.h - 1);

          ctx.fillStyle = '#b91c1c';
          ctx.beginPath();
          ctx.moveTo(-tr.w / 2 - 3, tr.y - tr.h);
          ctx.quadraticCurveTo(0, tr.y - tr.h - 3, tr.w / 2 + 3, tr.y - tr.h);
          ctx.lineTo(tr.w / 2, tr.y - tr.h + 2);
          ctx.quadraticCurveTo(0, tr.y - tr.h, -tr.w / 2, tr.y - tr.h + 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-tr.w / 2 - 3, tr.y - tr.h - 1, 2, 2);
          ctx.fillRect(tr.w / 2 + 1, tr.y - tr.h - 1, 2, 2);
        });

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-1, -24, 2, 5);
        ctx.restore();
      }
    }
  }

  // -------------------------------------------------------------
  // LAYER 5: Pier extending from shoreline (Only on inhabited harbors/outposts)
  // -------------------------------------------------------------
  if (!isl.isUninhabited && isl._cachedPier) {
    const pier = isl._cachedPier;
    const pLen = 65;
    const pAngle = pier.pAngle;

    ctx.save();
    ctx.translate(pier.dx, pier.dy);
    ctx.rotate(pAngle);

  if (isl.isSkullIsland && isl._cachedRibs) {
    // Leviathan Ribcage Pier
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.fillRect(0, -9, pLen, 18);
    ctx.strokeRect(0, -9, pLen, 18);

    ctx.strokeStyle = '#94a3b8';
    for (let pl = 8; pl < pLen; pl += 9) {
      ctx.beginPath();
      ctx.moveTo(pl, -9);
      ctx.lineTo(pl, 9);
      ctx.stroke();
    }

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    isl._cachedRibs.forEach(rib => {
      ctx.beginPath();
      ctx.moveTo(rib.dist, -10);
      ctx.quadraticCurveTo(rib.dist - 3, -rib.span, rib.dist + 3, -rib.span * 0.65);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rib.dist, 10);
      ctx.quadraticCurveTo(rib.dist - 3, rib.span, rib.dist + 3, rib.span * 0.65);
      ctx.stroke();
    });

    // Crimson Blood Lantern on Rib Pier Tip
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pLen - 4, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    const ribGlow = ctx.createRadialGradient(pLen - 4, 0, 3, pLen - 4, 0, 36);
    ribGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    ribGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = ribGlow;
    ctx.beginPath();
    ctx.arc(pLen - 4, 0, 36, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // Standard Wooden Naval Pier
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.fillRect(0, -9, pLen, 18);
    ctx.strokeRect(0, -9, pLen, 18);

    // Pier planks
    ctx.strokeStyle = '#291102';
    for (let pl = 8; pl < pLen; pl += 9) {
      ctx.beginPath();
      ctx.moveTo(pl, -9);
      ctx.lineTo(pl, 9);
      ctx.stroke();
    }

    // Dock mooring bollards
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(pLen * 0.3 - 2, -11, 4, 3);
    ctx.fillRect(pLen * 0.7 - 2, -11, 4, 3);
    ctx.fillRect(pLen * 0.3 - 2, 8, 4, 3);
    ctx.fillRect(pLen * 0.7 - 2, 8, 4, 3);

    // Fluttering Clan Pennant Flag
    const flagFlutter = Math.sin((_perfNow || 0) * 4) * 3;
    if (isl.id === 'haven') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(pLen - 2, 0);
      ctx.lineTo(pLen + 15 + flagFlutter, -6);
      ctx.lineTo(pLen - 2, -12);
      ctx.closePath();
      ctx.fill();
    } else if (isl.isConquered) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(pLen - 2, 0);
      ctx.lineTo(pLen + 17 + flagFlutter, -6);
      ctx.lineTo(pLen - 2, -12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (isl.isShopIsland) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(pLen - 2, 0);
      ctx.lineTo(pLen + 16 + flagFlutter, -6);
      ctx.lineTo(pLen - 2, -12);
      ctx.closePath();
      ctx.fill();
    }

    // Dock lanterns & warm ambient glow
    ctx.fillStyle = isl.isConquered ? '#fde047' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(pLen - 4, -7, 3.5, 0, Math.PI * 2);
    ctx.arc(pLen - 4, 7, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const pierGlow = ctx.createRadialGradient(pLen - 4, 0, 4, pLen - 4, 0, 34);
    pierGlow.addColorStop(0, isl.isConquered ? 'rgba(253, 224, 71, 0.45)' : 'rgba(251, 191, 36, 0.35)');
    pierGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = pierGlow;
    ctx.beginPath();
    ctx.arc(pLen - 4, 0, 34, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Finish pier
  }

  // -------------------------------------------------------------
  // LAYER 6: Rotating Lighthouse Beacon
  // -------------------------------------------------------------
  if (isl.hasLighthouse && isl._cachedLighthouse) {
    const lh = isl._cachedLighthouse;
    ctx.save();
    ctx.translate(lh.x, lh.y);

    // 6a. 360-degree Sweeping Conical Light Beam
    const sweepAngle = ((_perfNow || 0) * 0.72 + (isl.seed || 0) * 0.8) % (Math.PI * 2);
    const beamGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, lh.beamRange);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(0.3, 'rgba(253, 224, 71, 0.22)');
    beamGrad.addColorStop(0.8, 'rgba(251, 191, 36, 0.08)');
    beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, lh.beamRange, sweepAngle - lh.beamWidth, sweepAngle + lh.beamWidth);
    ctx.closePath();
    ctx.fill();

    // 6b. Lighthouse Stone Tower (White & Crimson Maritime Banding)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(-6, 3, 12, 5); // Base shadow

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-5, -lh.h, 10, lh.h);

    // Red maritime stripe
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-5, -lh.h * 0.65, 10, lh.h * 0.3);

    // Lantern room housing
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, -lh.h - 6, 12, 6);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4, -lh.h - 5, 8, 4);

    // Conical spire roof
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, -lh.h - 11);
    ctx.lineTo(6, -lh.h - 6);
    ctx.lineTo(-6, -lh.h - 6);
    ctx.closePath();
    ctx.fill();

    // Flashing golden beacon flash at summit
    const flash = 0.5 + Math.sin((_perfNow || 0) * 5) * 0.5;
    ctx.fillStyle = `rgba(254, 240, 138, ${0.6 + flash * 0.4})`;
    ctx.beginPath();
    ctx.arc(0, -lh.h - 3, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // -------------------------------------------------------------
  // LAYER 6.5: Diurnal Atmospheric Island Light Wash & Moon Rim
  // -------------------------------------------------------------
  if (typeof dayNightState !== 'undefined' && outerPoints && outerPoints.length > 0) {
    if (!dayNightState.isDay) {
      // Moonlight cool tint wash across terrain and props
      const nightWashAlpha = Math.min(0.24, Math.max(0, (1 - dayNightState.ambientMult) * 0.28)).toFixed(3);
      ctx.save();
      ctx.fillStyle = `rgba(15, 23, 42, ${nightWashAlpha})`;
      ctx.beginPath();
      ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
      for (let i = 1; i < outerPoints.length; i++) {
        const prev = outerPoints[i - 1];
        const curr = outerPoints[i];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) * 0.5, (prev.y + curr.y) * 0.5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (dayNightState.phaseId === 'sunset' || dayNightState.phaseId === 'dawn') {
      // Golden Hour / Dawn warm atmospheric wash
      const warmWashAlpha = (dayNightState.phaseId === 'sunset' ? 0.12 : 0.08);
      const warmRGB = (dayNightState.phaseId === 'sunset' ? '251, 146, 60' : '253, 186, 116');
      ctx.save();
      ctx.fillStyle = `rgba(${warmRGB}, ${warmWashAlpha})`;
      ctx.beginPath();
      ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
      for (let i = 1; i < outerPoints.length; i++) {
        const prev = outerPoints[i - 1];
        const curr = outerPoints[i];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) * 0.5, (prev.y + curr.y) * 0.5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // LAYER 7: Island Name Plaque & Clan Crest
  // -------------------------------------------------------------
  ctx.font = 'bold 12px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  const prevFill = ctx.fillStyle;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillText(isl.name, 2, -8);
  ctx.fillStyle = prevFill;
  ctx.fillText(isl.name, 0, -10);

  ctx.font = 'bold 9px sans-serif';
  let subtitle = "";
  let subColor = "#fbbf24";
  if (isl.isUninhabited) {
    if (isl.isSandOnly) {
      subtitle = "GOSONG PASIR ALAMI • HIASAN SAMUDRA";
    } else if (isl.isRockOnly) {
      subtitle = "CADAS KARANG SAMUDRA • HIASAN ALAMI";
    } else {
      subtitle = "ATOL KARANG ALAMI • HIASAN SAMUDRA";
    }
    subColor = '#94a3b8';
  } else if (isl.id === 'haven') {
    subtitle = "PANGKALAN UTAMA ARMADA (HOME PORT)";
    subColor = '#38bdf8';
  } else if (isl.isShopIsland) {
    subtitle = "PASAR APUNG NIAGA & GALANGAN KAPAL";
    subColor = '#34d399';
  } else if (isl.isConquered) {
    subtitle = `PULAU KEKUASAAN (TIER ${isl.tier || 4}) • TERLINDUNGI`;
    subColor = '#fde047';
  } else if (isl.conquestActive || isl.isProvoked) {
    const rem = (typeof entities !== 'undefined' && entities.towers) ? entities.towers.filter(t => t.islandId === isl.id).length : 0;
    subtitle = `[PENAKLUKAN AKTIF] SISA BASTION: ${rem} • BANTUAN BERDATANGAN`;
    subColor = '#ef4444';
  } else {
    subtitle = `[TIER ${isl.tier || 4}] ${CLAN_LORE[isl.clan]?.name || 'WILAYAH NETRAL'} • DAMAI`;
    subColor = '#94a3b8';
  }
  ctx.fillStyle = subColor;
  ctx.fillText(subtitle, 0, 8);

  ctx.restore();
}

function drawVectorShip(ctx, ship, isPlayer = false, tier = 1) {
  ctx.save();
  ctx.translate(ship.x, ship.y);

  const time = _now * 0.003;
  const isMoving = isPlayer 
    ? (joystickState.active && joystickState.magnitude > 0.1) 
    : Boolean(ship.isMoving);

  // Dynamic Ship Lantern Glow with Natural Diurnal Adaptation
  const isNight = (typeof dayNightState !== 'undefined') && !dayNightState.isDay;
  if (isPlayer) {
    const lanternRadius = isNight ? (105 + tier * 8) : (75 + tier * 5);
    const alphaInner = isNight ? 0.36 : 0.18;
    const alphaMid = isNight ? 0.14 : 0.08;
    const lanternGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, lanternRadius);
    lanternGrad.addColorStop(0, `rgba(251, 191, 36, ${alphaInner})`);
    lanternGrad.addColorStop(0.6, `rgba(217, 119, 6, ${alphaMid})`);
    lanternGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lanternGrad;
    ctx.beginPath();
    ctx.arc(0, 0, lanternRadius, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const clan = ship.clan || 'gold';
    const boost = isNight ? 1.5 : 1.0;
    let glowColorInner = `rgba(251, 191, 36, ${(0.14 * boost).toFixed(2)})`;
    let glowColorOuter = `rgba(217, 119, 6, ${(0.04 * boost).toFixed(2)})`;
    if (clan === 'iron') {
      glowColorInner = `rgba(234, 88, 12, ${(0.18 * boost).toFixed(2)})`;
      glowColorOuter = `rgba(194, 65, 12, ${(0.04 * boost).toFixed(2)})`;
    } else if (clan === 'mist') {
      glowColorInner = `rgba(34, 211, 238, ${(0.22 * boost).toFixed(2)})`;
      glowColorOuter = `rgba(6, 182, 212, ${(0.05 * boost).toFixed(2)})`;
    } else if (clan === 'viking') {
      glowColorInner = `rgba(56, 189, 248, ${(0.22 * boost).toFixed(2)})`;
      glowColorOuter = `rgba(14, 165, 233, ${(0.05 * boost).toFixed(2)})`;
    } else if (clan === 'wokou') {
      glowColorInner = `rgba(244, 63, 94, ${(0.22 * boost).toFixed(2)})`;
      glowColorOuter = `rgba(225, 29, 72, ${(0.05 * boost).toFixed(2)})`;
    } else if (clan === 'blood') {
      glowColorInner = `rgba(244, 63, 94, ${(0.25 * boost).toFixed(2)})`;
      glowColorOuter = `rgba(190, 18, 60, ${(0.06 * boost).toFixed(2)})`;
    } else if (clan === 'pirate') {
      glowColorInner = `rgba(249, 115, 22, ${(0.22 * boost).toFixed(2)})`;
      glowColorOuter = `rgba(194, 65, 12, ${(0.05 * boost).toFixed(2)})`;
    }
    const enemyGlowRad = (55 + (ship.radius || 20)) * (isNight ? 1.25 : 1.0);
    const enemyGlow = ctx.createRadialGradient(0, 0, 8, 0, 0, enemyGlowRad);
    enemyGlow.addColorStop(0, glowColorInner);
    enemyGlow.addColorStop(0.65, glowColorOuter);
    enemyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = enemyGlow;
    ctx.beginPath();
    ctx.arc(0, 0, enemyGlowRad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Natural Hydrodynamic Buoyancy when stationary
  let bobOffset = 0;
  let bobAngle = 0;
  if (!isMoving) {
    const hullSeed = (ship.x * 0.05 + ship.y * 0.03);
    bobOffset = Math.sin(time * 2.2 + hullSeed) * 1.5;
    bobAngle = Math.cos(time * 1.7 + hullSeed) * 0.022;
  }

  // ELEGANT IDLE WATER SURFACE DISPLACEMENT (Cincin riak desakan air & busa halus alami)
  if (!isMoving) {
    ctx.save();
    ctx.rotate(ship.angle);
    const footprintL = isPlayer ? (34 + tier * 3.5) : (ship.radius * 2.1 || 40);
    const footprintW = isPlayer ? (16 + tier * 1.8) : (ship.radius * 1.3 || 24);

    // 1. Expanding subtle displacement water rings
    for (let r = 0; r < 2; r++) {
      const cycle = ((time * 0.75 + r * 0.5) % 1.0);
      const ringScale = 1.0 + cycle * 0.45;
      const ringAlpha = (1.0 - cycle) * 0.35;
      ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, bobOffset * 0.5, (footprintL / 2) * ringScale, (footprintW / 2) * ringScale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Translucent waterline perimeter foam hugging the hull edge
    const foamAlpha = 0.15 + Math.sin(time * 2.8) * 0.06;
    ctx.fillStyle = `rgba(224, 242, 254, ${foamAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(0, bobOffset * 0.7, footprintL * 0.53, footprintW * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.translate(0, bobOffset);
  ctx.rotate(ship.angle + bobAngle);

  if (isPlayer) {
    const hullLvl = (playerState.upgrades && playerState.upgrades.hull) || 1;
    const speedLvl = (playerState.upgrades && playerState.upgrades.speed) || 1;
    const cannonLvl = (playerState.upgrades && playerState.upgrades.cannons) || 1;
    const rearLvl = (playerState.upgrades && playerState.upgrades.rearDefense) || 0;
    const stealthLvl = (playerState.upgrades && playerState.upgrades.stealthCamo) || 1;
    const relicLvl = (playerState.upgrades && playerState.upgrades.relicSiphon) || 1;

    const hullLength = 34 + tier * 3.8;
    const hullWidth = 16 + tier * 1.8;

    // 1. Dynamic Directional Ship Shadow & Low-Sun Mast Projection
    const sLen = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowLen === 'number') ? dayNightState.shadowLen : 6;
    const sDirX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowDirX === 'number' && !isNaN(dayNightState.shadowDirX)) ? dayNightState.shadowDirX : -0.4;
    const sDirY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowDirY === 'number' && !isNaN(dayNightState.shadowDirY)) ? dayNightState.shadowDirY : 0.8;
    const pWorldShadowX = sDirX * Math.min(8, sLen * 0.35);
    const pWorldShadowY = sDirY * Math.min(8, sLen * 0.35);
    const pShadowAlpha = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number') ? dayNightState.shadowAlpha : 0.35;

    // Transform world shadow offset into ship local coordinate space
    const pShipHeading = ship.angle + bobAngle;
    const pCosH = Math.cos(-pShipHeading);
    const pSinH = Math.sin(-pShipHeading);
    const pLocalShadowX = pWorldShadowX * pCosH - pWorldShadowY * pSinH;
    const pLocalShadowY = pWorldShadowX * pSinH + pWorldShadowY * pCosH;

    ctx.fillStyle = `rgba(0, 0, 0, ${pShadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(pLocalShadowX, pLocalShadowY, hullLength / 2, hullWidth / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Projected Mast & Yardarm Cast Shadow when celestial body is near horizon (Dawn/Sunset/Low Moon)
    if (sLen > 14 && pShadowAlpha > 0.05) {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 0, 0, ${(pShadowAlpha * 0.42).toFixed(3)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(-2 + pLocalShadowX * 1.6, pLocalShadowY * 1.6);
      ctx.stroke();

      // Yardarm cross shadow
      const sDist = Math.hypot(pLocalShadowX, pLocalShadowY) || 1;
      const perpX = (-pLocalShadowY / sDist) * (hullWidth * 0.4);
      const perpY = (pLocalShadowX / sDist) * (hullWidth * 0.4);
      const tipX = -2 + pLocalShadowX * 1.2;
      const tipY = pLocalShadowY * 1.2;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(tipX - perpX, tipY - perpY);
      ctx.lineTo(tipX + perpX, tipY + perpY);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Wooden Hull with Armored Reinforcement based on Hull Level
    ctx.fillStyle = tier >= 4 ? '#381d11' : (hullLvl >= 4 ? '#451a03' : '#6b4226');
    ctx.strokeStyle = hullLvl >= 5 ? '#d97706' : (tier >= 4 ? '#b45309' : '#271406');
    ctx.lineWidth = hullLvl >= 4 ? 2.4 : 2;
    ctx.beginPath();
    ctx.moveTo(hullLength / 2, 0);
    ctx.bezierCurveTo(hullLength * 0.3, -hullWidth / 2, -hullLength * 0.3, -hullWidth / 2, -hullLength / 2, -hullWidth * 0.35);
    ctx.lineTo(-hullLength / 2, hullWidth * 0.35);
    ctx.bezierCurveTo(-hullLength * 0.3, hullWidth / 2, hullLength * 0.3, hullWidth / 2, hullLength / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hull armored side strakes if hullLvl >= 3
    if (hullLvl >= 3) {
      ctx.strokeStyle = hullLvl >= 5 ? '#f59e0b' : '#78350f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-hullLength * 0.32, -hullWidth * 0.44);
      ctx.lineTo(hullLength * 0.22, -hullWidth * 0.44);
      ctx.moveTo(-hullLength * 0.32, hullWidth * 0.44);
      ctx.lineTo(hullLength * 0.22, hullWidth * 0.44);
      ctx.stroke();
    }

    // Prow Ram Spur (Haluan / Forecastle & Relic upgrade)
    if (hullLvl >= 4 || relicLvl >= 3) {
      ctx.fillStyle = relicLvl >= 5 ? '#991b1b' : (hullLvl >= 5 ? '#d97706' : '#475569');
      ctx.beginPath();
      ctx.moveTo(hullLength / 2 - 2, -3.5);
      ctx.lineTo(hullLength / 2 + 7 + Math.min(5, relicLvl), 0);
      ctx.lineTo(hullLength / 2 - 2, 3.5);
      ctx.closePath();
      ctx.fill();
    }

    // Inner Deck Planking
    ctx.fillStyle = tier >= 4 ? '#78350f' : '#92400e';
    ctx.beginPath();
    ctx.ellipse(-2, 0, (hullLength / 2) - 5, (hullWidth / 2) - 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Side Broadside Cannons based on Equipped Cannons & Unlocked Slots
    const maxSlots = Math.min(4, Math.max(1, cannonLvl));
    const cannonCountPerSide = maxSlots;
    for (let i = 0; i < cannonCountPerSide; i++) {
      const frac = cannonCountPerSide === 1 ? 0.5 : (i / (cannonCountPerSide - 1));
      const offsetX = -hullLength * 0.28 + frac * (hullLength * 0.56);
      const barrelLen = 3.8 + (cannonLvl >= 4 ? 2 : 0);
      const eq = (playerState.equippedCannons && playerState.equippedCannons[i]) || null;

      let bColor = '#334155';
      let trimColor = '#0f172a';
      if (eq && eq.durability > 0) {
        if (eq.type === 'mist') {
          bColor = '#0891b2'; trimColor = '#22d3ee';
        } else if (eq.type === 'frost') {
          bColor = '#0284c7'; trimColor = '#7dd3fc';
        } else if (eq.type === 'wokou') {
          bColor = '#e11d48'; trimColor = '#facc15';
        } else if (eq.type === 'chitin') {
          bColor = '#881337'; trimColor = '#f43f5e';
        } else {
          bColor = cannonLvl >= 5 ? '#d97706' : '#475569';
          trimColor = '#f59e0b';
        }
      } else {
        // Empty or broken slot
        bColor = 'rgba(15, 23, 42, 0.5)';
        trimColor = 'rgba(148, 163, 184, 0.3)';
      }

      ctx.fillStyle = bColor;
      // Port side barrel
      ctx.fillRect(offsetX - 2, -hullWidth / 2 - barrelLen + 1, 3.5, barrelLen);
      // Starboard side barrel
      ctx.fillRect(offsetX - 2, hullWidth / 2 - 1, 3.5, barrelLen);

      // Muzzle cap highlight
      ctx.fillStyle = trimColor;
      ctx.fillRect(offsetX - 2, -hullWidth / 2 - barrelLen + 1, 3.5, 1.2);
      ctx.fillRect(offsetX - 2, hullWidth / 2 + barrelLen - 2.2, 3.5, 1.2);
    }

    // 4. Stern Chasers & Mine Station based on rearDefense
    if (rearLvl > 0) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hullLength / 2 - 4.5, -hullWidth * 0.22, 4.5, 2.5);
      ctx.fillRect(-hullLength / 2 - 4.5, hullWidth * 0.12, 4.5, 2.5);
      if (rearLvl >= 3) {
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(-hullLength / 2 - 2.5, -2.5, 2.5, 5);
      }
    }

    // 5. Multi-Tiered Masts & Billowing Sails based on Speed Level
    const mastPositions = speedLvl >= 4 
      ? [-hullLength * 0.25, -2, hullLength * 0.22] 
      : (speedLvl >= 2 ? [-hullLength * 0.12, hullLength * 0.20] : [-4]);
    const mastScales = speedLvl >= 4 ? [0.65, 1.0, 0.75] : (speedLvl >= 2 ? [0.95, 0.75] : [1.0]);

    for (let m = 0; m < mastPositions.length; m++) {
      const mx = mastPositions[m];
      const mScale = mastScales[m];
      const sWidth = hullWidth * 0.75 * mScale;

      // Mast spar
      ctx.fillStyle = '#172554';
      ctx.fillRect(mx - 1.5, -sWidth * 0.95, 3, sWidth * 1.9);

      // Billowing sail
      ctx.fillStyle = stealthLvl >= 4 ? '#334155' : (tier >= 5 ? '#fef08a' : '#f8fafc');
      ctx.strokeStyle = stealthLvl >= 4 ? '#1e293b' : '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(mx - 4, -sWidth);
      ctx.quadraticCurveTo(mx + 8 * mScale, 0, mx - 4, sWidth);
      ctx.quadraticCurveTo(mx + 2.5 * mScale, 0, mx - 4, -sWidth);
      ctx.fill();
      ctx.stroke();
    }

    // 5b. Masthead Wind Pennant (Wimpel penunjuk arah angin di tiang kapal)
    if (typeof windAngle !== 'undefined') {
      const mainMastX = speedLvl >= 4 ? -2 : (speedLvl >= 2 ? -hullLength * 0.12 : -4);
      const localWindAngle = windAngle - (ship.angle + bobAngle);
      const pennantFlutter = Math.sin(_now * 0.009) * 0.18;
      const pennantLen = 13 + Math.min(4, tier);

      ctx.save();
      ctx.translate(mainMastX, 0);
      ctx.rotate(localWindAngle + pennantFlutter);

      // Gold mast truck cap
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Fluttering triangular ribbon streamer pointing along wind direction
      ctx.fillStyle = relicLvl >= 4 ? '#fca5a5' : '#fef08a';
      ctx.strokeStyle = relicLvl >= 4 ? '#b91c1c' : '#d97706';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -1.8);
      ctx.quadraticCurveTo(pennantLen * 0.55, Math.sin(_now * 0.014) * 2.2, pennantLen, 0);
      ctx.quadraticCurveTo(pennantLen * 0.55, -Math.sin(_now * 0.014) * 2.2, 0, 1.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // 6. Stern Flag / Pennant
    ctx.fillStyle = relicLvl >= 4 ? '#991b1b' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-hullLength / 2, 0);
    ctx.lineTo(-hullLength / 2 - 8, -4);
    ctx.lineTo(-hullLength / 2 - 8, 4);
    ctx.closePath();
    ctx.fill();

    // 7. Bow Relic Lantern (Vampiric Crimson or Nautical Brass)
    if (relicLvl >= 2) {
      const pulse = 0.75 + Math.sin(_now * 0.005) * 0.25;
      ctx.fillStyle = `rgba(225, 29, 72, ${pulse.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(hullLength / 2 + (hullLvl >= 4 || relicLvl >= 3 ? 5 : 1), 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(hullLength / 2 - 2, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

  } else {
    const clan = ship.clan || 'gold';
    const t = ship.tier || 1;

    // 1. UNAWARE (Tidak notice): Segitiga untuk kapal, Lingkaran Penuh 360 untuk Monster Laut
    if (ship.alertState === 'unaware' || ship.alertState === 'suspicious') {
      ctx.save();
      if (ship.isMonster) {
        // Monster memiliki sensor getaran air sirkular 360 derajat yang luas!
        const auraR = 420;
        const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, auraR);
        auraGrad.addColorStop(0, 'rgba(244, 63, 94, 0.04)');
        auraGrad.addColorStop(0.75, 'rgba(244, 63, 94, 0.015)');
        auraGrad.addColorStop(1, 'rgba(244, 63, 94, 0.16)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, auraR, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing underwater acoustic sonar ring
        const sonarPulse = (_now * 0.002) % 1;
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.45 - sonarPulse * 0.35})`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, auraR * (0.75 + sonarPulse * 0.25), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        const coneDist = ship.convoyId ? 340 : 270;
        const coneAngle = ship.convoyId ? 0.85 : 0.65;
        ctx.fillStyle = ship.convoyId ? 'rgba(251, 191, 36, 0.06)' : 'rgba(251, 191, 36, 0.05)';
        ctx.strokeStyle = ship.convoyId ? 'rgba(251, 191, 36, 0.42)' : 'rgba(251, 191, 36, 0.32)';
        ctx.lineWidth = ship.convoyId ? 1.6 : 1.3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, coneDist, -coneAngle, coneAngle);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

    // 2. SEARCHING (Saat mencari): Lingkaran kecil bersih tanda penyelidikan
    } else if (ship.alertState === 'searching') {
      ctx.save();
      const searchR = ship.isMonster ? 240 : 160;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
      ctx.beginPath();
      ctx.arc(0, 0, searchR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating radar beam inside small circle
      const sweepAng = _now * 0.005;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweepAng) * searchR, Math.sin(sweepAng) * searchR);
      ctx.stroke();
      ctx.restore();
    }

    // Dynamic Directional Enemy Ship Shadow & Mast Projection
    const eLen = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowLen === 'number') ? dayNightState.shadowLen : 6;
    const esDirX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowDirX === 'number' && !isNaN(dayNightState.shadowDirX)) ? dayNightState.shadowDirX : -0.4;
    const esDirY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowDirY === 'number' && !isNaN(dayNightState.shadowDirY)) ? dayNightState.shadowDirY : 0.8;
    const eWorldShadowX = esDirX * Math.min(8, eLen * 0.35);
    const eWorldShadowY = esDirY * Math.min(8, eLen * 0.35);
    const eShadowAlpha = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number' && !isNaN(dayNightState.shadowAlpha)) ? (dayNightState.shadowAlpha * 0.88) : 0.32;

    const eShipHeading = ship.angle + bobAngle;
    const eCosH = Math.cos(-eShipHeading);
    const eSinH = Math.sin(-eShipHeading);
    const eLocalShadowX = eWorldShadowX * eCosH - eWorldShadowY * eSinH;
    const eLocalShadowY = eWorldShadowX * eSinH + eWorldShadowY * eCosH;

    const baseELen = t === 1 ? 28 : (t === 2 ? 38 : 50);
    const baseEWid = t === 1 ? 14 : (t === 2 ? 18 : 24);

    ctx.fillStyle = `rgba(0, 0, 0, ${eShadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(eLocalShadowX, eLocalShadowY, baseELen * 0.5, baseEWid * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (eLen > 14 && eShadowAlpha > 0.05) {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 0, 0, ${(eShadowAlpha * 0.45).toFixed(3)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(eLocalShadowX * 1.6, eLocalShadowY * 1.6);
      ctx.stroke();
      ctx.restore();
    }

    if (clan === 'gold') {
      // BATAVIA: Tier 1 (Kolek Cukai), Tier 2 (Korvet Pengawal), Tier 3 (Benteng Terapung)
      if (t === 1) {
        // Tier 1: Kolek Cukai (Fast light skiff with lateen sail)
        const len = 26, wid = 12;
        ctx.fillStyle = '#45220a';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.bezierCurveTo(len * 0.3, -wid / 2, -len * 0.3, -wid / 2, -len / 2, -wid * 0.25);
        ctx.lineTo(-len / 2, wid * 0.25);
        ctx.bezierCurveTo(-len * 0.3, wid / 2, len * 0.3, wid / 2, len / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-len * 0.2, -wid * 0.85);
        ctx.lineTo(len * 0.2, wid * 0.6);
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-len * 0.2, -wid * 0.85);
        ctx.lineTo(len * 0.2, wid * 0.6);
        ctx.lineTo(-len * 0.3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#d97706';
        ctx.fillRect(-2, -wid / 2 - 2, 3.5, 2);
        ctx.fillRect(-2, wid / 2, 3.5, 2);

      } else if (t === 2) {
        // Tier 2: Korvet Pengawal Emas (Twin square masts with lion prow)
        const len = 36, wid = 18;
        ctx.fillStyle = '#381d11';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.bezierCurveTo(len * 0.3, -wid / 2, -len * 0.3, -wid / 2, -len / 2, -wid * 0.35);
        ctx.lineTo(-len / 2, wid * 0.35);
        ctx.bezierCurveTo(-len * 0.3, wid / 2, len * 0.3, wid / 2, len / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-len * 0.35, -wid * 0.42, len * 0.7, wid * 0.84);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(len / 2 + 3, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#d97706';
        [-8, 6].forEach(cx => {
          ctx.fillRect(cx - 2, -wid / 2 - 3, 4, 3);
          ctx.fillRect(cx - 2, wid / 2, 4, 3);
        });

        [-len * 0.15, len * 0.18].forEach((mx, idx) => {
          const sW = wid * (idx === 0 ? 0.85 : 0.7);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(mx - 1.5, -sW, 3, sW * 2);
          ctx.fillStyle = '#fef08a';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mx - 3, -sW);
          ctx.quadraticCurveTo(mx + 6, 0, mx - 3, sW);
          ctx.quadraticCurveTo(mx + 1, 0, mx - 3, -sW);
          ctx.fill();
          ctx.stroke();
        });

      } else {
        // Tier 3: Benteng Terapung Batavia (Dreadnought Flagship, 3 masts, castle stern, 6 heavy guns)
        const len = 48, wid = 24;
        ctx.fillStyle = '#221106';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 5, 0);
        ctx.lineTo(len * 0.35, -wid / 2);
        ctx.lineTo(-len * 0.35, -wid / 2);
        ctx.lineTo(-len / 2, -wid * 0.42);
        ctx.lineTo(-len / 2, wid * 0.42);
        ctx.lineTo(-len * 0.35, wid / 2);
        ctx.lineTo(len * 0.35, wid / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.fillRect(-len / 2, -wid * 0.35, len * 0.22, wid * 0.7);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-len / 2, -wid * 0.35, len * 0.22, wid * 0.7);

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-len / 2 - 2, -wid * 0.25, 2.5, wid * 0.5);

        ctx.fillStyle = '#f59e0b';
        [-len * 0.22, -2, len * 0.18].forEach(cx => {
          ctx.fillRect(cx - 2, -wid / 2 - 4, 4.5, 4);
          ctx.fillRect(cx - 2, wid / 2, 4.5, 4);
        });

        [-len * 0.25, -2, len * 0.22].forEach((mx, idx) => {
          const sW = wid * (idx === 1 ? 0.95 : 0.78);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(mx - 1.5, -sW, 3, sW * 2);
          ctx.fillStyle = '#fef08a';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mx - 4, -sW);
          ctx.quadraticCurveTo(mx + 8, 0, mx - 4, sW);
          ctx.quadraticCurveTo(mx + 2, 0, mx - 4, -sW);
          ctx.fill();
          ctx.stroke();
        });
      }

    } else if (clan === 'iron') {
      // IRON: Tier 1 (Spiked Barge), Tier 2 (Iron Ram + 1 Smokestack), Tier 3 (Juggernaut + 2 Smokestacks)
      if (ship.chargeState === 'windup') {
        const jx = (Math.random() - 0.5) * 2.5;
        const jy = (Math.random() - 0.5) * 2.5;
        ctx.translate(jx, jy);
      }
      const isCharging = ship.chargeState === 'charging';
      const isWindup = ship.chargeState === 'windup';

      if (t === 1) {
        // Tier 1: Sekoci Perisai Berduri (Sharp angular wedge barge)
        const len = 28, wid = 13;
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 5, 0);
        ctx.lineTo(len * 0.1, -wid / 2);
        ctx.lineTo(-len / 2, -wid / 2);
        ctx.lineTo(-len / 2, wid / 2);
        ctx.lineTo(len * 0.1, wid / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCharging ? '#ff4500' : '#ea580c';
        ctx.beginPath();
        ctx.moveTo(len / 2, -3);
        ctx.lineTo(len / 2 + 8, 0);
        ctx.lineTo(len / 2, 3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-len * 0.1, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (t === 2) {
        // Tier 2: Pembelah Karang Baja (Heavy plating, 1 central smokestack)
        const len = 38, wid = 18;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(len / 2, -wid * 0.25);
        ctx.lineTo(len / 2 + 12 + (isCharging ? 6 : 0), 0);
        ctx.lineTo(len / 2, wid * 0.25);
        ctx.lineTo(len * 0.2, wid / 2);
        ctx.lineTo(-len / 2, wid / 2);
        ctx.lineTo(-len / 2, -wid / 2);
        ctx.lineTo(len * 0.2, -wid / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCharging ? '#ff4500' : (isWindup ? ((Math.sin(_now * 0.02) > 0) ? '#ea580c' : '#b45309') : '#ea580c');
        ctx.beginPath();
        ctx.moveTo(len / 2 - 2, -4);
        ctx.lineTo(len / 2 + 12 + (isCharging ? 6 : 0), 0);
        ctx.lineTo(len / 2 - 2, 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-len * 0.1, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const smokeP = Math.sin(_now * 0.006) * 2;
        ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
        ctx.beginPath();
        ctx.arc(-len * 0.1 - 6, smokeP, 4.5, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Tier 3: Mesin Jagal Laut / Juggernaut (Double smokestacks, hydraulic jaw)
        const len = 48, wid = 24;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(len * 0.25, -wid / 2);
        ctx.lineTo(-len / 2, -wid / 2);
        ctx.lineTo(-len / 2, wid / 2);
        ctx.lineTo(len * 0.25, wid / 2);
        ctx.lineTo(len / 2, wid * 0.35);
        ctx.lineTo(len / 2, -wid * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCharging ? '#ff4500' : (isWindup ? '#ea580c' : '#b45309');
        ctx.beginPath();
        ctx.moveTo(len / 2, -wid * 0.35);
        ctx.lineTo(len / 2 + 14, -wid * 0.2);
        ctx.lineTo(len / 2 + 8, 0);
        ctx.lineTo(len / 2 + 14, wid * 0.2);
        ctx.lineTo(len / 2, wid * 0.35);
        ctx.lineTo(len / 2 + 4, 0);
        ctx.closePath();
        ctx.fill();

        [-5, 5].forEach(sy => {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(-len * 0.15, sy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(-len * 0.15, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (isCharging) {
        ctx.save();
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-16, -10);
        ctx.lineTo(-30, 0);
        ctx.lineTo(-16, 10);
        ctx.stroke();
        ctx.restore();
      }

    } else if (clan === 'mist') {
      // MIST: Tier 1 (Tattered Skiff + Lantern), Tier 2 (Whale Ribcage + Dual Spectral Sails), Tier 3 (Sunken Gothic Cathedra + 3 Masts + Twin Eyes)
      if (t === 1) {
        // Tier 1: Sekoci Sesaji
        const len = 26, wid = 12;
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.bezierCurveTo(len * 0.3, -wid / 2, -len * 0.2, -wid / 2, -len / 2, -wid * 0.2);
        ctx.lineTo(-len / 2, wid * 0.2);
        ctx.bezierCurveTo(-len * 0.2, wid / 2, len * 0.3, wid / 2, len / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.beginPath();
        ctx.moveTo(-4, -wid * 0.85);
        ctx.quadraticCurveTo(len * 0.15, 0, -4, wid * 0.85);
        ctx.lineTo(-7, wid * 0.6);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-7, -wid * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(len / 2 + 2, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (t === 2) {
        // Tier 2: Bahtera Arwah Gentayangan (Whale ribcage, dual spectral sails)
        const len = 36, wid = 18;
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.bezierCurveTo(len * 0.3, -wid / 2, -len * 0.2, -wid / 2, -len / 2, -wid * 0.25);
        ctx.lineTo(-len / 2, wid * 0.25);
        ctx.bezierCurveTo(-len * 0.2, wid / 2, len * 0.3, wid / 2, len / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        [-10, -3, 4, 11].forEach(rx => {
          ctx.beginPath();
          ctx.arc(rx, 0, wid * 0.44, -Math.PI * 0.45, Math.PI * 0.45);
          ctx.stroke();
        });

        [-8, 7].forEach(sx => {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.65)';
          ctx.beginPath();
          ctx.moveTo(sx - 4, -wid * 0.8);
          ctx.quadraticCurveTo(sx + 6, 0, sx - 4, wid * 0.8);
          ctx.quadraticCurveTo(sx + 1, 0, sx - 4, -wid * 0.8);
          ctx.fill();
        });

      } else {
        // Tier 3: Katedral Tenggelam / Cursed Cathedra (Cathedral ribs, twin glowing eyes, 3 spectral sails)
        const len = 48, wid = 22;
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 3, 0);
        ctx.bezierCurveTo(len * 0.35, -wid / 2, -len * 0.3, -wid / 2, -len / 2, -wid * 0.3);
        ctx.lineTo(-len / 2, wid * 0.3);
        ctx.bezierCurveTo(-len * 0.3, wid / 2, len * 0.35, wid / 2, len / 2 + 3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.8;
        [-14, -6, 2, 10, 18].forEach(cx => {
          ctx.beginPath();
          ctx.moveTo(cx, -wid * 0.4);
          ctx.lineTo(cx, wid * 0.4);
          ctx.stroke();
        });

        const eyePulse = 0.6 + Math.sin(_now * 0.008) * 0.4;
        ctx.fillStyle = `rgba(34, 211, 238, ${eyePulse.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(len / 2 - 2, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(len / 2 - 2, 4, 2.5, 0, Math.PI * 2);
        ctx.fill();

        [-12, 1, 14].forEach(mx => {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.beginPath();
          ctx.ellipse(mx, 0, 4, wid * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

    } else if (clan === 'viking') {
      // VIKING: Tier 1 (Snekkja - 4 oars/side), Tier 2 (Skeid - 6 oars/side + shields + striped sail), Tier 3 (Drakkar Jarl - 8 oars/side + twin dragon + mammoth tusk)
      const oarStroke = Math.sin(time * 7) * 0.32;

      if (t === 1) {
        // Tier 1: Snekkja Salju
        const len = 28, wid = 12;
        ctx.fillStyle = '#451a03';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 4, 0);
        ctx.quadraticCurveTo(len * 0.2, -wid / 2, -len / 2, -wid * 0.2);
        ctx.lineTo(-len / 2, wid * 0.2);
        ctx.quadraticCurveTo(len * 0.2, wid / 2, len / 2 + 4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        for (let o = 0; o < 4; o++) {
          const ox = -len * 0.25 + o * (len * 0.5 / 3);
          ctx.beginPath();
          ctx.moveTo(ox, -wid / 2);
          ctx.lineTo(ox + Math.sin(oarStroke) * 5, -wid / 2 - 9);
          ctx.moveTo(ox, wid / 2);
          ctx.lineTo(ox + Math.sin(oarStroke) * 5, wid / 2 + 9);
          ctx.stroke();
        }

        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-3, -wid * 0.85);
        ctx.quadraticCurveTo(5, 0, -3, wid * 0.85);
        ctx.quadraticCurveTo(1, 0, -3, -wid * 0.85);
        ctx.fill();
        ctx.stroke();

      } else if (t === 2) {
        // Tier 2: Skeid Pembantai Fjord
        const len = 38, wid = 16;
        ctx.fillStyle = '#3f1d0b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 6, 0);
        ctx.quadraticCurveTo(len * 0.25, -wid / 2, -len / 2, -wid * 0.25);
        ctx.lineTo(-len / 2, wid * 0.25);
        ctx.quadraticCurveTo(len * 0.25, wid / 2, len / 2 + 6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.3;
        for (let o = 0; o < 6; o++) {
          const ox = -len * 0.3 + o * (len * 0.6 / 5);
          ctx.beginPath();
          ctx.moveTo(ox, -wid / 2);
          ctx.lineTo(ox + Math.sin(oarStroke) * 6, -wid / 2 - 11);
          ctx.moveTo(ox, wid / 2);
          ctx.lineTo(ox + Math.sin(oarStroke) * 6, wid / 2 + 11);
          ctx.stroke();
        }

        for (let s = 0; s < 5; s++) {
          const sx = -len * 0.25 + s * 6.5;
          ctx.fillStyle = (s % 2 === 0) ? '#38bdf8' : '#64748b';
          ctx.beginPath();
          ctx.arc(sx, -wid / 2 + 1, 2.5, 0, Math.PI * 2);
          ctx.arc(sx, wid / 2 - 1, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-4, -wid * 0.9);
        ctx.quadraticCurveTo(7, 0, -4, wid * 0.9);
        ctx.quadraticCurveTo(2, 0, -4, -wid * 0.9);
        ctx.fill();

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        [-wid * 0.5, 0, wid * 0.5].forEach(sy => {
          ctx.beginPath();
          ctx.moveTo(-2, sy);
          ctx.lineTo(4, sy);
          ctx.stroke();
        });

      } else {
        // Tier 3: Drakkar Jarl Raksasa
        const len = 48, wid = 20;
        ctx.fillStyle = '#271206';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 10, 0);
        ctx.quadraticCurveTo(len * 0.25, -wid / 2, -len / 2, -wid * 0.25);
        ctx.lineTo(-len / 2, wid * 0.25);
        ctx.quadraticCurveTo(len * 0.25, wid / 2, len / 2 + 10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(len / 2 + 2, -4);
        ctx.lineTo(len / 2 + 14, 0);
        ctx.lineTo(len / 2 + 2, 4);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.4;
        for (let o = 0; o < 8; o++) {
          const ox = -len * 0.35 + o * (len * 0.7 / 7);
          ctx.beginPath();
          ctx.moveTo(ox, -wid / 2);
          ctx.lineTo(ox + Math.sin(oarStroke) * 7, -wid / 2 - 13);
          ctx.moveTo(ox, wid / 2);
          ctx.lineTo(ox + Math.sin(oarStroke) * 7, wid / 2 + 13);
          ctx.stroke();
        }

        for (let s = 0; s < 7; s++) {
          const sx = -len * 0.32 + s * 6.5;
          ctx.fillStyle = (s % 2 === 0) ? '#38bdf8' : '#fbbf24';
          ctx.beginPath();
          ctx.arc(sx, -wid / 2 + 1, 2.8, 0, Math.PI * 2);
          ctx.arc(sx, wid / 2 - 1, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(-5, -wid * 1.05);
        ctx.quadraticCurveTo(9, 0, -5, wid * 1.05);
        ctx.quadraticCurveTo(2, 0, -5, -wid * 1.05);
        ctx.fill();

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        [-wid * 0.6, -wid * 0.2, wid * 0.2, wid * 0.6].forEach(sy => {
          ctx.beginPath();
          ctx.moveTo(-3, sy);
          ctx.lineTo(6, sy);
          ctx.stroke();
        });

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(len / 2 + 8, -3, 2, 0, Math.PI * 2);
        ctx.arc(len / 2 + 8, 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (clan === 'wokou') {
      // WOKOU: Tier 1 (Sampan Roket Api), Tier 2 (Jung Perang), Tier 3 (Benteng Kaisar Naga)
      if (t === 1) {
        // Tier 1: Sampan Roket Api
        const len = 26, wid = 13;
        ctx.fillStyle = '#5c2b0c';
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.lineTo(len * 0.2, -wid / 2);
        ctx.lineTo(-len / 2, -wid * 0.35);
        ctx.lineTo(-len / 2, wid * 0.35);
        ctx.lineTo(len * 0.2, wid / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.moveTo(-4, -wid * 0.8);
        ctx.quadraticCurveTo(len * 0.15, 0, -4, wid * 0.8);
        ctx.lineTo(-7, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.3;
        [-wid * 0.4, 0, wid * 0.4].forEach(ry => {
          ctx.beginPath();
          ctx.moveTo(-5, ry);
          ctx.lineTo(2, ry);
          ctx.stroke();
        });

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(len / 2 - 3, -2.5, 5, 5);

      } else if (t === 2) {
        // Tier 2: Jung Perang Wokou
        const len = 36, wid = 18;
        ctx.fillStyle = '#451a03';
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.lineTo(len * 0.3, -wid / 2);
        ctx.lineTo(-len / 2, -wid * 0.45);
        ctx.lineTo(-len / 2, wid * 0.45);
        ctx.lineTo(len * 0.3, wid / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.fillRect(-len / 2, -wid * 0.35, len * 0.25, wid * 0.7);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.strokeRect(-len / 2, -wid * 0.35, len * 0.25, wid * 0.7);

        const lanternSway = Math.sin(time * 3) * 1.5;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-len / 2 - 2, lanternSway, 3, 0, Math.PI * 2);
        ctx.arc(len / 2 + 2, -lanternSway, 2.5, 0, Math.PI * 2);
        ctx.fill();

        [-len * 0.12, len * 0.16].forEach((mx, idx) => {
          const sW = wid * (idx === 0 ? 0.85 : 0.7);
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.moveTo(mx - 3, -sW);
          ctx.quadraticCurveTo(mx + 7, 0, mx - 3, sW);
          ctx.lineTo(mx - 5, 0);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1.2;
          [-sW * 0.5, 0, sW * 0.5].forEach(ry => {
            ctx.beginPath();
            ctx.moveTo(mx - 4, ry);
            ctx.lineTo(mx + 3, ry);
            ctx.stroke();
          });
        });

      } else {
        // Tier 3: Benteng Jung Kaisar Naga
        const len = 48, wid = 22;
        ctx.fillStyle = '#2e1004';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 4, 0);
        ctx.lineTo(len * 0.32, -wid / 2);
        ctx.lineTo(-len / 2, -wid * 0.45);
        ctx.lineTo(-len / 2, wid * 0.45);
        ctx.lineTo(len * 0.32, wid / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(len / 2, -4);
        ctx.lineTo(len / 2 + 9, 0);
        ctx.lineTo(len / 2, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(len / 2 + 5, -2, 1.5, 1.5);
        ctx.fillRect(len / 2 + 5, 1, 1.5, 1.5);

        ctx.fillStyle = '#991b1b';
        ctx.fillRect(-len / 2, -wid * 0.38, len * 0.28, wid * 0.76);
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(-len / 2 + 2, -wid * 0.28, len * 0.18, wid * 0.56);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-len / 2 - 2, -wid * 0.4, 3, 3);
        ctx.fillRect(-len / 2 - 2, wid * 0.4 - 3, 3, 3);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(len * 0.05, -wid / 2 - 2, 8, 4);
        ctx.fillRect(len * 0.05, wid / 2 - 2, 8, 4);

        [-len * 0.22, -1, len * 0.2].forEach((mx, idx) => {
          const sW = wid * (idx === 1 ? 0.95 : 0.78);
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.moveTo(mx - 4, -sW);
          ctx.quadraticCurveTo(mx + 8, 0, mx - 4, sW);
          ctx.lineTo(mx - 6, 0);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.2;
          [-sW * 0.6, -sW * 0.2, sW * 0.2, sW * 0.6].forEach(ry => {
            ctx.beginPath();
            ctx.moveTo(mx - 4, ry);
            ctx.lineTo(mx + 4, ry);
            ctx.stroke();
          });
        });
      }

    } else if (clan === 'blood') {
      // ABYSSAL SEA MONSTERS: Larva, Megalodon, The Kraken, Ancient Leviathan
      const mType = ship.monsterType || (t === 1 ? 'larva' : (t === 2 ? 'kraken' : 'leviathan'));

      if (mType === 'larva') {
        const len = 30, wid = 14;
        ctx.fillStyle = '#881337';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, len / 2, wid / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.8;
        for (let l = 0; l < 3; l++) {
          const lx = -len * 0.25 + l * (len * 0.5 / 2);
          const legWiggle = Math.sin(time * 8 + l) * 4;
          ctx.beginPath();
          ctx.moveTo(lx, -wid / 2);
          ctx.lineTo(lx + legWiggle, -wid / 2 - 9);
          ctx.moveTo(lx, wid / 2);
          ctx.lineTo(lx + legWiggle, wid / 2 + 9);
          ctx.stroke();
        }

        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(8, 4, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (mType === 'megalodon') {
        // Megalodon Purba (Spine Shark)
        const len = 48, wid = 18;
        const tailThrash = Math.sin(time * 6) * 0.3;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-len * 0.35, 0, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 4, 0);
        ctx.quadraticCurveTo(len * 0.2, -wid / 2, -len * 0.3, -wid * 0.3);
        ctx.lineTo(-len / 2, -3);
        ctx.lineTo(-len / 2 - 12, -wid * 0.55 + tailThrash * 8);
        ctx.lineTo(-len / 2 - 6, 0);
        ctx.lineTo(-len / 2 - 12, wid * 0.55 + tailThrash * 8);
        ctx.lineTo(-len / 2, 3);
        ctx.quadraticCurveTo(-len * 0.3, wid * 0.3, len * 0.2, wid / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(len * 0.05, 0, len * 0.28, wid * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-2, -2);
        ctx.lineTo(-8, -wid * 0.65);
        ctx.lineTo(6, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(len * 0.1, -wid / 2);
        ctx.lineTo(0, -wid / 2 - 10);
        ctx.lineTo(len * 0.22, -wid / 2);
        ctx.closePath();
        ctx.moveTo(len * 0.1, wid / 2);
        ctx.lineTo(0, wid / 2 + 10);
        ctx.lineTo(len * 0.22, wid / 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.2;
        for (let g = 0; g < 5; g++) {
          const gx = len * 0.15 - g * 3;
          ctx.beginPath();
          ctx.moveTo(gx, -wid * 0.25);
          ctx.lineTo(gx - 1, -wid * 0.1);
          ctx.moveTo(gx, wid * 0.25);
          ctx.lineTo(gx - 1, wid * 0.1);
          ctx.stroke();
        }

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(len * 0.32, -4, 2, 0, Math.PI * 2);
        ctx.arc(len * 0.32, 4, 2, 0, Math.PI * 2);
        ctx.fill();

      } else if (mType === 'kraken') {
        // The Abyssal Kraken (8 Writhing Tentacles + Eye)
        const mantleR = 18;

        for (let tIdx = 0; tIdx < 8; tIdx++) {
          const baseAng = (tIdx / 8) * Math.PI * 2;
          const tWiggle = Math.sin(time * 3 + tIdx * 1.2) * 12;
          const tReach = 32 + Math.cos(time * 2.5 + tIdx) * 8;

          ctx.strokeStyle = '#9f1239';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          const startX = Math.cos(baseAng) * mantleR * 0.8;
          const startY = Math.sin(baseAng) * mantleR * 0.8;
          const midX = Math.cos(baseAng) * (mantleR + tReach * 0.5) + Math.cos(baseAng + Math.PI / 2) * tWiggle;
          const midY = Math.sin(baseAng) * (mantleR + tReach * 0.5) + Math.sin(baseAng + Math.PI / 2) * tWiggle;
          const endX = Math.cos(baseAng) * (mantleR + tReach) + Math.cos(baseAng + Math.PI / 2) * (tWiggle * 1.4);
          const endY = Math.sin(baseAng) * (mantleR + tReach) + Math.sin(baseAng + Math.PI / 2) * (tWiggle * 1.4);
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(midX, midY, endX, endY);
          ctx.stroke();

          ctx.fillStyle = '#fda4af';
          ctx.beginPath();
          ctx.arc(midX, midY, 1.8, 0, Math.PI * 2);
          ctx.arc(endX * 0.85, endY * 0.85, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#4c0519';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, mantleR, mantleR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(6, -5, 3.5, 1.5, 0.2, 0, Math.PI * 2);
        ctx.ellipse(6, 5, 3.5, 1.5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(5.5, -6, 1.2, 2.5);
        ctx.fillRect(5.5, 4, 1.2, 2.5);

        ctx.fillStyle = '#881337';
        ctx.beginPath();
        ctx.arc(mantleR * 0.85, 0, 4, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Ancient Leviathan (Multi-segmented Serpentine Dragon)
        const segments = 8;
        const segLen = 7;

        for (let s = segments; s >= 1; s--) {
          const segDist = s * segLen;
          const waveAng = Math.sin(time * 3.5 - s * 0.55) * (11 - s * 0.8);
          const segX = -segDist;
          const segY = waveAng;
          const segR = Math.max(5, 16 - s * 1.3);

          ctx.fillStyle = (s % 2 === 0) ? '#450a0a' : '#7f1d1d';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(segX, segY, segR, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(segX - 2, segY - segR);
          ctx.lineTo(segX, segY - segR - 6);
          ctx.lineTo(segX + 2, segY - segR);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = '#3f0713';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.quadraticCurveTo(8, -14, -8, -11);
        ctx.lineTo(-8, 11);
        ctx.quadraticCurveTo(8, 14, 18, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        [[-2, -8], [4, -6], [10, -3], [-2, 8], [4, 6], [10, 3]].forEach(ep => {
          ctx.beginPath();
          ctx.arc(ep[0], ep[1], 1.8, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, -10);
        ctx.quadraticCurveTo(-14, -18, -20, -12);
        ctx.moveTo(-6, 10);
        ctx.quadraticCurveTo(-14, 18, -20, 12);
        ctx.stroke();
      }

    } else if (clan === 'pirate') {
      // PIRATES (BAJAK LAUT): Sekoci Penyamun (T1), Brigantin Bendera Tengkorak (T2), Galleon Kutukan Badai (T3)
      if (t === 1) {
        // Tier 1: Sekoci Penyamun (Fast corsair skiff with charred oak hull and skull sail)
        const len = 28, wid = 13;
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 4, 0); // Spiked ramming prow
        ctx.bezierCurveTo(len * 0.35, -wid / 2, -len * 0.35, -wid / 2, -len / 2, -wid * 0.3);
        ctx.lineTo(-len / 2, wid * 0.3);
        ctx.bezierCurveTo(-len * 0.35, wid / 2, len * 0.35, wid / 2, len / 2 + 4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Blood-red deck planking
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.ellipse(0, 0, len * 0.38, wid * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Broadside swivel cannons
        ctx.fillStyle = '#475569';
        ctx.fillRect(-2, -wid / 2 - 3, 4, 3);
        ctx.fillRect(-2, wid / 2, 4, 3);

        // Mast & Boom
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-1, 0);
        ctx.lineTo(-1, -wid * 0.85);
        ctx.stroke();

        // Tattered Black Sail
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-3, -wid * 0.8);
        ctx.quadraticCurveTo(len * 0.22, 0, -3, wid * 0.8);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vector Skull stencil on sail
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(-1, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-1.8, 1.4, 1.6, 1.2);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-1.6, -0.4, 0.9, 0.9);
        ctx.fillRect(-0.4, -0.4, 0.9, 0.9);

        // Stern Red Pennant
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-len / 2, 0);
        ctx.lineTo(-len / 2 - 8, -3.5);
        ctx.lineTo(-len / 2 - 8, 3.5);
        ctx.closePath();
        ctx.fill();

      } else if (t === 2) {
        // Tier 2: Brigantin Bendera Tengkorak (Double-masted corsair brigantine)
        const len = 42, wid = 18;
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 7, 0); // Heavy ram bowsprit
        ctx.quadraticCurveTo(len * 0.35, -wid / 2, -len / 2, -wid * 0.35);
        ctx.lineTo(-len / 2, wid * 0.35);
        ctx.quadraticCurveTo(len * 0.35, wid / 2, len / 2 + 7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Scorched timber deck & hatch
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.ellipse(len * 0.05, 0, len * 0.36, wid * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-4, -wid * 0.22, 8, wid * 0.44);

        // 4 Broadside Cannon Ports (2 Port, 2 Starboard)
        ctx.fillStyle = '#0f172a';
        [-len * 0.18, len * 0.12].forEach(cx => {
          ctx.fillRect(cx - 2, -wid / 2 - 3.5, 4, 3.5);
          ctx.fillRect(cx - 2, wid / 2, 4, 3.5);
        });

        // Twin Masts (Foremast & Mainmast)
        [-len * 0.15, len * 0.15].forEach((mx, mIdx) => {
          const sW = wid * (mIdx === 0 ? 0.95 : 0.85);
          // Dark square sail
          ctx.fillStyle = '#09090b';
          ctx.strokeStyle = '#b91c1c';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mx - 4, -sW);
          ctx.quadraticCurveTo(mx + 7, 0, mx - 4, sW);
          ctx.lineTo(mx - 7, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Mainmast gets large vector Skull & Bones emblem
          if (mIdx === 0) {
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(mx, 0, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(mx - 1.2, 2.2, 2.4, 1.6);
            ctx.fillStyle = '#09090b';
            ctx.fillRect(mx - 1.8, -0.6, 1.2, 1.2);
            ctx.fillRect(mx + 0.6, -0.6, 1.2, 1.2);

            // Crossed bones
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(mx - 4.5, -4); ctx.lineTo(mx + 4.5, 4);
            ctx.moveTo(mx - 4.5, 4); ctx.lineTo(mx + 4.5, -4);
            ctx.stroke();
          }
        });

        // Fiery Deck Lantern
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(-len * 0.35, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Stern Battle Pennant
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-len / 2, 0);
        ctx.lineTo(-len / 2 - 11, -5);
        ctx.lineTo(-len / 2 - 11, 5);
        ctx.closePath();
        ctx.fill();

      } else {
        // Tier 3: Galleon Kutukan Badai (Heavy 3-masted corsair war-galleon)
        const len = 54, wid = 24;
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(len / 2 + 10, 0); // Reinforced iron ram
        ctx.quadraticCurveTo(len * 0.4, -wid / 2, -len / 2, -wid * 0.4);
        ctx.lineTo(-len / 2, wid * 0.4);
        ctx.quadraticCurveTo(len * 0.4, wid / 2, len / 2 + 10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Elevated Sterncastle & Gundeck Planking
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(len * 0.05, 0, len * 0.38, wid * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sterncastle high deck
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(-len / 2, -wid * 0.35, len * 0.28, wid * 0.7);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-len / 2, -wid * 0.35, len * 0.28, wid * 0.7);

        // 6 Heavy Broadside Cannons (3 Port, 3 Starboard)
        ctx.fillStyle = '#0f172a';
        [-len * 0.25, -len * 0.05, len * 0.15].forEach(cx => {
          ctx.fillRect(cx - 2, -wid / 2 - 4.5, 4, 4.5);
          ctx.fillRect(cx - 2, wid / 2, 4, 4.5);
        });

        // Triple Masts (Mizzen, Main, Fore)
        [-len * 0.22, 0, len * 0.22].forEach((mx, mIdx) => {
          const sW = wid * (mIdx === 1 ? 1.05 : (mIdx === 2 ? 0.85 : 0.75));
          ctx.fillStyle = '#18181b';
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(mx - 5, -sW);
          ctx.quadraticCurveTo(mx + 9, 0, mx - 5, sW);
          ctx.lineTo(mx - 8, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Giant Mainmast Skull Heraldry with Eye Patch & Crossed Swords
          if (mIdx === 1) {
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(mx, 0, 4.0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(mx - 1.8, 2.8, 3.6, 2.0);
            ctx.fillStyle = '#09090b';
            ctx.fillRect(mx - 2.2, -1.0, 1.5, 1.5);
            ctx.fillRect(mx + 0.7, -1.0, 1.5, 1.5);

            // Crossed Sabers
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(mx - 6, -5.5); ctx.lineTo(mx + 6, 5.5);
            ctx.moveTo(mx - 6, 5.5); ctx.lineTo(mx + 6, -5.5);
            ctx.stroke();
          }
        });

        // Triple Stern Lanterns (Crimson Glow)
        [-wid * 0.25, 0, wid * 0.25].forEach(ly => {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(-len / 2 - 2, ly, 2.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Twin Crimson Battle Pennants
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-len / 2, -wid * 0.2);
        ctx.lineTo(-len / 2 - 14, -wid * 0.35);
        ctx.lineTo(-len / 2 - 10, -wid * 0.2);
        ctx.lineTo(-len / 2 - 14, -wid * 0.05);
        ctx.closePath();
        ctx.fill();
      }

    } else {
      // Robust Fallback Hull (Guarantees zero invisible ships under any clan configuration)
      const len = 30, wid = 14;
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(len / 2, 0);
      ctx.bezierCurveTo(len * 0.3, -wid / 2, -len * 0.3, -wid / 2, -len / 2, -wid * 0.3);
      ctx.lineTo(-len / 2, wid * 0.3);
      ctx.bezierCurveTo(-len * 0.3, wid / 2, len * 0.3, wid / 2, len / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-2, -wid * 0.7);
      ctx.quadraticCurveTo(len * 0.15, 0, -2, wid * 0.7);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Flagship Command Pennant for Convoy Leaders
    if (ship.formationRole === 'leader' && !ship.isMonster) {
      ctx.save();
      const mastX = -ship.radius * 0.15;
      const pennantColor = clan === 'iron' ? '#94a3b8' : (clan === 'mist' ? '#22d3ee' : (clan === 'viking' ? '#38bdf8' : (clan === 'wokou' ? '#fb7185' : (clan === 'pirate' ? '#f97316' : '#f59e0b'))));
      ctx.fillStyle = pennantColor;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mastX, 0);
      ctx.lineTo(mastX - 16, -6 + Math.sin(_now * 0.008) * 2.5);
      ctx.lineTo(mastX - 11, 0);
      ctx.lineTo(mastX - 16, 6 + Math.sin(_now * 0.008) * 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.rotate(-ship.angle);
    const barWidth = 38;
    const barHeight = 4;
    const clanInfo = CLAN_LORE[clan] || CLAN_LORE.gold;

    // Vector Alert Indicators (No Emojis!)
    if (ship.alertState === 'searching') {
      // Searching Radar Waves (Amber searching indicator)
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -45, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating radar sweep
      const sweepAng = _now * 0.006;
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(Math.cos(sweepAng) * 9, -45 + Math.sin(sweepAng) * 9);
      ctx.stroke();
      ctx.restore();
    } else if (ship.alertState === 'suspicious') {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -45, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, -44);
      ctx.restore();
    } else if (ship.alertState === 'alerted') {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -45, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, -44);
      ctx.restore();
    }

    // HP & Clan Info Plaque
    const isDocked = ship.isAnchored && !ship.isMonster && ship.alertState === 'unaware';
    const plaqueWidth = isDocked ? barWidth + 22 : barWidth;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(-plaqueWidth / 2 - 2, -36, plaqueWidth + 4, barHeight + 11);

    ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = clanInfo.badgeColor;
    ctx.textAlign = 'center';
    const label = isDocked 
      ? `Lv.${t} ${clan.toUpperCase()} [BERLABUH]`
      : `Lv.${t} ${clan === 'blood' ? 'ELD' : clan.toUpperCase()}`;
    ctx.fillText(label, 0, -28);

    ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
    ctx.fillRect(-barWidth / 2, -26, barWidth, barHeight);

    ctx.fillStyle = clanInfo.badgeColor;
    const hpPercent = Math.max(0, ship.hp / ship.maxHp);
    ctx.fillRect(-barWidth / 2, -26, barWidth * hpPercent, barHeight);
  }

  ctx.restore();
}

// OVERHAUL: High-Fidelity Sunken Shipwreck with Broken Keel, Rib Timbers & Treasure Glow
function drawSunkenShip(ctx, wreck) {
  ctx.save();
  ctx.translate(wreck.x, wreck.y);
  ctx.rotate(wreck.angle);

  const time = _now * 0.003;

  // Murky underwater seabed silhouette with subtle directional seabed shadow
  const wreckCos = Math.cos(-wreck.angle);
  const wreckSin = Math.sin(-wreck.angle);
  const wWorldSX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecX === 'number' && !isNaN(dayNightState.shadowVecX)) ? dayNightState.shadowVecX : 0;
  const wWorldSY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecY === 'number' && !isNaN(dayNightState.shadowVecY)) ? dayNightState.shadowVecY : 0;
  const wLocalSX = (wWorldSX * wreckCos - wWorldSY * wreckSin) * 0.35;
  const wLocalSY = (wWorldSX * wreckSin + wWorldSY * wreckCos) * 0.35;

  ctx.fillStyle = wreck.isAbyssal ? 'rgba(153, 27, 27, 0.35)' : 'rgba(15, 23, 42, 0.5)';
  ctx.beginPath();
  ctx.ellipse(wLocalSX, wLocalSY, 42, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fractured Keel - Main Hull Section
  ctx.fillStyle = wreck.isAbyssal ? '#4c0519' : '#1e1b18';
  ctx.strokeStyle = wreck.isAbyssal ? '#f43f5e' : '#78716c';
  ctx.lineWidth = 1.6;

  // Fore Section
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(2, -9);
  ctx.lineTo(-2, -5);
  ctx.lineTo(12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Aft Section (Tilted)
  ctx.beginPath();
  ctx.moveTo(-4, -6);
  ctx.lineTo(-22, -10);
  ctx.lineTo(-24, 6);
  ctx.lineTo(-6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Exposed Rib Timbers (Tulang Rusuk Kayu Kapal Karam)
  ctx.strokeStyle = wreck.isAbyssal ? '#fca5a5' : '#a8a29e';
  ctx.lineWidth = 1.2;
  for (let i = -18; i <= 14; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, -11);
    ctx.lineTo(i + 2, 7);
    ctx.stroke();
  }

  // Tilted Broken Mainmast
  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(14, 18);
  ctx.stroke();

  // Tattered submerged sails
  ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.quadraticCurveTo(8, 16, 12, 12);
  ctx.closePath();
  ctx.fill();

  // Underwater Treasure Light Glow
  const treasureGlow = ctx.createRadialGradient(-2, -2, 2, -2, -2, 22);
  treasureGlow.addColorStop(0, wreck.isAbyssal ? 'rgba(244, 63, 94, 0.45)' : 'rgba(251, 191, 36, 0.4)');
  treasureGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = treasureGlow;
  ctx.beginPath();
  ctx.arc(-2, -2, 22, 0, Math.PI * 2);
  ctx.fill();

  // Rising sparkling bubbles from open cargo hatch
  for (let i = 0; i < 4; i++) {
    const bx = Math.sin(time + i * 2) * 14;
    const by = Math.cos(time + i * 2.2) * 8;
    ctx.fillStyle = wreck.isAbyssal ? 'rgba(244, 63, 94, 0.7)' : 'rgba(254, 240, 138, 0.8)';
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vector Anchor resting nearby with chain
  ctx.rotate(-wreck.angle);
  ctx.save();
  ctx.translate(0, -24);
  ctx.strokeStyle = wreck.isAbyssal ? '#f87171' : '#fbbf24';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -6, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(0, 6);
  ctx.moveTo(-5, -1);
  ctx.lineTo(5, -1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 3, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// Render Spiked Floating Sea Mines (Iron Island Defenses)
function drawSpikedMine(ctx, sm) {
  ctx.save();
  ctx.translate(sm.x, sm.y);

  // Submerged anchor chain down
  ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(0, 22);
  ctx.stroke();
  ctx.setLineDash([]);

  // Spikes protruding from iron sphere
  ctx.strokeStyle = sm.detonating ? '#ef4444' : '#71717a';
  ctx.lineWidth = 2.5;
  for (let s = 0; s < 8; s++) {
    const sAng = (s / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(sAng) * 6, Math.sin(sAng) * 6);
    ctx.lineTo(Math.cos(sAng) * 14, Math.sin(sAng) * 14);
    ctx.stroke();
  }

  // Water surface directional shadow
  const smShadowX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecX === 'number' && !isNaN(dayNightState.shadowVecX)) ? (dayNightState.shadowVecX * 0.28) : 0;
  const smShadowY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecY === 'number' && !isNaN(dayNightState.shadowVecY)) ? (dayNightState.shadowVecY * 0.28) : 3;
  const smShadowA = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number' && !isNaN(dayNightState.shadowAlpha)) ? (dayNightState.shadowAlpha * 0.65) : 0.35;
  ctx.fillStyle = `rgba(0, 0, 0, ${smShadowA.toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(smShadowX, smShadowY, sm.radius * 0.95, sm.radius * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy Spiked Iron Sphere Body
  const mineGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, sm.radius);
  mineGrad.addColorStop(0, '#71717a');
  mineGrad.addColorStop(0.5, '#27272a');
  mineGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = mineGrad;
  ctx.beginPath();
  ctx.arc(0, 0, sm.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Flashing Danger Sensor Light (Red Warning Beacon)
  const isFlashing = sm.detonating 
    ? (Math.sin(sm.flashTimer) > 0) 
    : (Math.sin(_now * 0.005 + sm.bobPhase) > 0.4);

  ctx.fillStyle = isFlashing ? '#ef4444' : '#450a0a';
  ctx.beginPath();
  ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  if (isFlashing) {
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

// Render Occult Watchtowers (Mist Atoll Mysterious Spire)
function drawOccultTower(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Basalt Stone Hexagonal Foundation
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let h = 0; h < 6; h++) {
    const hang = (h / 6) * Math.PI * 2;
    const hx = Math.cos(hang) * tw.radius;
    const hy = Math.sin(hang) * tw.radius;
    if (h === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Basalt Spire tier
  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#312e81';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius * 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing Occult Runes (Rune toska misterius bersinar)
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 1.5;
  for (let r = 0; r < 4; r++) {
    const rang = (r / 4) * Math.PI * 2 + tw.orbAngle * 0.3;
    const rx = Math.cos(rang) * (tw.radius * 0.45);
    const ry = Math.sin(rang) * (tw.radius * 0.45);
    ctx.beginPath();
    ctx.moveTo(rx - 3, ry - 3);
    ctx.lineTo(rx + 3, ry + 3);
    ctx.moveTo(rx + 3, ry - 3);
    ctx.lineTo(rx - 3, ry + 3);
    ctx.stroke();
  }

  // Floating Rotating Crystal Orb / Spectral Eye
  const orbY = -6 + Math.sin(tw.orbAngle * 2) * 3;
  const orbGrad = ctx.createRadialGradient(-2, orbY - 2, 1, 0, orbY, 9);
  orbGrad.addColorStop(0, '#e0f2fe');
  orbGrad.addColorStop(0.4, '#38bdf8');
  orbGrad.addColorStop(1, '#0369a1');

  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(0, orbY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Structure HP Bar & Name
  const barW = 46;
  const barH = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -38, barW + 4, barH + 11);

  ctx.font = 'bold 8px "Cinzel", serif';
  ctx.fillStyle = '#22d3ee';
  ctx.textAlign = 'center';
  ctx.fillText("MENARA KUTUKAN", 0, -30);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -28, barW, barH);

  ctx.fillStyle = '#06b6d4';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -28, barW * hpRatio, barH);

  ctx.restore();
}

// Coastal Cannon Bastion (Gold & Haven)
function drawCannonBastion(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  const isHaven = tw.defenseType === 'haven_bastion';
  const baseColor = isHaven ? '#1e3a8a' : '#292524';
  const stoneColor = isHaven ? '#3b82f6' : '#78716c';
  const trimColor = isHaven ? '#60a5fa' : '#ca8a04';

  // Circular / Octagonal Stone Foundation Platform
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = stoneColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let h = 0; h < 8; h++) {
    const hang = (h / 8) * Math.PI * 2;
    const hx = Math.cos(hang) * tw.radius;
    const hy = Math.sin(hang) * tw.radius;
    if (h === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Battlement Tier
  ctx.fillStyle = '#1c1917';
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius * 0.68, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rotating Heavy Cannon Carriage & Barrel
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);

  // Cast-iron Gun Turret Mount
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Heavy Cannon Barrel
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.lineTo(24, -3);
  ctx.lineTo(25, -4.5);
  ctx.lineTo(26, 4.5);
  ctx.lineTo(24, 3);
  ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cannon Muzzle Ring
  ctx.fillStyle = trimColor;
  ctx.fillRect(23, -3.5, 2.5, 7);

  ctx.restore();

  // Structure HP Bar & Title
  const barW = 46;
  const barH = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -38, barW + 4, barH + 11);

  ctx.font = 'bold 8px "Cinzel", serif';
  ctx.fillStyle = isHaven ? '#60a5fa' : '#f59e0b';
  ctx.textAlign = 'center';
  ctx.fillText(isHaven ? "MERIAM DAMAI" : "BENTENG MERIAM", 0, -30);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -28, barW, barH);

  ctx.fillStyle = isHaven ? '#3b82f6' : '#eab308';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -28, barW * hpRatio, barH);

  ctx.restore();
}

// Steam Harpoon Turret (Iron Clan)
function drawSteamHarpoonTurret(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Heavy Iron Plated Square Bunker Platform
  const bunkerSize = tw.radius * 1.6;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(-bunkerSize * 0.5, -bunkerSize * 0.5, bunkerSize, bunkerSize);
  ctx.fill();
  ctx.stroke();

  // Corner Brass Rivets
  ctx.fillStyle = '#f59e0b';
  const rOff = bunkerSize * 0.42;
  [[-rOff, -rOff], [rOff, -rOff], [rOff, rOff], [-rOff, rOff]].forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Iron Turret Rotating Mount
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);

  // Turret Housing
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Twin Harpoon Ballista Rails
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.fillRect(4, -7, 22, 3);
  ctx.fillRect(4, 4, 22, 3);
  ctx.strokeRect(4, -7, 22, 3);
  ctx.strokeRect(4, 4, 22, 3);

  // Loaded Steel Harpoon Spike
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(28, -5.5);
  ctx.lineTo(23, -8);
  ctx.lineTo(25, -5.5);
  ctx.lineTo(10, -5.5);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(28, 5.5);
  ctx.lineTo(23, 3);
  ctx.lineTo(25, 5.5);
  ctx.lineTo(10, 5.5);
  ctx.closePath();
  ctx.fill();

  // Steam Smokestack Pipe on rear of turret
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(-8, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(-8, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Structure HP Bar & Title
  const barW = 46;
  const barH = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -38, barW + 4, barH + 11);

  ctx.font = 'bold 8px "Cinzel", serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText("HARPOON BAJA", 0, -30);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -28, barW, barH);

  ctx.fillStyle = '#64748b';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -28, barW * hpRatio, barH);

  ctx.restore();
}

// Abyssal Living Tentacle (Blood/Meat Islands)
function drawAbyssalTentacle(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Sea water churn & bubbling blood whirlpool around base
  const churn = Math.sin(_now * 0.004 + tw.id) * 3;
  ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 0, tw.radius + 6 + churn, (tw.radius + 4) * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spurt bubbles around base
  ctx.fillStyle = '#f43f5e';
  for (let b = 0; b < 3; b++) {
    const bAng = (b / 3) * Math.PI * 2 + _now * 0.002;
    const bx = Math.cos(bAng) * (tw.radius * 0.7);
    const by = Math.sin(bAng) * (tw.radius * 0.4);
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Calculate 6 segment inverse kinematics / procedural sway
  const segments = 6;
  const segLength = 9;
  const phase = tw.wrigglePhase || 0;
  
  let curX = 0;
  let curY = 0;
  let angle = tw.baseAngle !== undefined ? tw.baseAngle : 0;

  if (tw.isSlamming) {
    const slamTargetAngle = Math.atan2(tw.slamTargetY - tw.y, tw.slamTargetX - tw.x);
    angle = slamTargetAngle;
  }

  // Draw 6 connected fleshy tentacle segments
  for (let s = 0; s < segments; s++) {
    const segT = s / segments;
    const segWidth = (1.0 - segT * 0.68) * 14;
    const sway = Math.sin(phase + s * 0.85) * (0.35 + segT * 0.4);
    const segAngle = angle + sway;

    const nextX = curX + Math.cos(segAngle) * segLength;
    const nextY = curY + Math.sin(segAngle) * segLength - (s * 3.5);

    // Segment flesh body
    ctx.fillStyle = s % 2 === 0 ? '#4c0519' : '#881337';
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.ellipse(curX, curY, segWidth * 0.5, segWidth * 0.45, segAngle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White suckers along the rim
    if (s >= 1) {
      const suckerX = curX + Math.cos(segAngle + Math.PI * 0.5) * (segWidth * 0.45);
      const suckerY = curY + Math.sin(segAngle + Math.PI * 0.5) * (segWidth * 0.45);
      ctx.fillStyle = '#fecdd3';
      ctx.beginPath();
      ctx.arc(suckerX, suckerY, Math.max(1.2, 3.2 - s * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    curX = nextX;
    curY = nextY;
  }

  // Sharp claw / thorn tip
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(curX, curY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Structure HP Bar & Title
  const barW = 46;
  const barH = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -44, barW + 4, barH + 11);

  ctx.font = 'bold 8px "Cinzel", serif';
  ctx.fillStyle = '#f43f5e';
  ctx.textAlign = 'center';
  ctx.fillText("TENTAKEL ABISAL", 0, -36);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -34, barW, barH);

  ctx.fillStyle = '#e11d48';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -34, barW * hpRatio, barH);

  ctx.restore();
}

// Gold Clan Peranakan: Swivel Gun Outpost
function drawSwivelOutpost(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Stilt platform on ocean water
  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let h = 0; h < 6; h++) {
    const hang = (h / 6) * Math.PI * 2;
    const hx = Math.cos(hang) * tw.radius;
    const hy = Math.sin(hang) * tw.radius;
    if (h === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wooden plank flooring
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Swivel gun mount & barrel
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Single sleek swivel barrel
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(2, -2, 16, 4);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(15, -2.5, 3, 5);
  ctx.restore();

  // HP Bar & Title
  const barW = 38;
  const barH = 3.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -32, barW + 4, barH + 9);

  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#fde047';
  ctx.textAlign = 'center';
  ctx.fillText("GARDU PUTAR", 0, -25);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -23, barW, barH);

  ctx.fillStyle = '#f59e0b';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -23, barW * hpRatio, barH);

  ctx.restore();
}

// Iron Clan Peranakan: Steam Furnace Vent
function drawSteamVent(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Riveted boiler base
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing furnace fire grate
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Twin chimney vents
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1;
  ctx.fillRect(2, -6, 14, 4);
  ctx.fillRect(2, 2, 14, 4);
  ctx.strokeRect(2, -6, 14, 4);
  ctx.strokeRect(2, 2, 14, 4);
  ctx.restore();

  // Steam puff particles around vent
  ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
  ctx.beginPath();
  ctx.arc(Math.sin(_now * 0.005) * 4, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // HP Bar & Title
  const barW = 38;
  const barH = 3.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -32, barW + 4, barH + 9);

  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.textAlign = 'center';
  ctx.fillText("CEROBONG UAP", 0, -25);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -23, barW, barH);

  ctx.fillStyle = '#94a3b8';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -23, barW * hpRatio, barH);

  ctx.restore();
}

// Mist Clan Peranakan: Occult Skull Pylon
function drawSkullPylon(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Arcane water ripple
  ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius + 6, 0, Math.PI * 2);
  ctx.fill();

  // Dark obsidian needle spire
  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(8, 8);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Levitating glowing skull above pylon tip
  const skullBob = Math.sin(_now * 0.004 + (tw.id || 0)) * 3;
  ctx.save();
  ctx.translate(0, -24 + skullBob);
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cyan glowing eyes
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(-1.8, -0.5, 1, 0, Math.PI * 2);
  ctx.arc(1.8, -0.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // HP Bar & Title
  const barW = 38;
  const barH = 3.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -38, barW + 4, barH + 9);

  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#67e8f9';
  ctx.textAlign = 'center';
  ctx.fillText("PYLON ARWAH", 0, -31);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -29, barW, barH);

  ctx.fillStyle = '#22d3ee';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -29, barW * hpRatio, barH);

  ctx.restore();
}

// Blood Clan Peranakan: Parasitic Flesh Spitter
function drawFleshSpitter(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // Blood pool ripple
  const pulse = Math.sin(_now * 0.006 + (tw.id || 0)) * 2;
  ctx.fillStyle = 'rgba(153, 27, 27, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius + 4 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Pulsating fleshy bio-pod
  ctx.fillStyle = '#881337';
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, tw.radius + pulse * 0.6, (tw.radius - 2) + pulse * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gaping acidic mouth / orifice aiming at target
  ctx.save();
  ctx.rotate(tw.aimAngle || 0);
  ctx.fillStyle = '#4c0519';
  ctx.beginPath();
  ctx.ellipse(8, 0, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sharp yellowed bone teeth
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(11, -3); ctx.lineTo(13, 0); ctx.lineTo(11, 3);
  ctx.fill();
  ctx.restore();

  // HP Bar & Title
  const barW = 38;
  const barH = 3.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-barW / 2 - 2, -32, barW + 4, barH + 9);

  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#fda4af';
  ctx.textAlign = 'center';
  ctx.fillText("KANTUNG PARASIT", 0, -25);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -23, barW, barH);

  ctx.fillStyle = '#f43f5e';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -23, barW * hpRatio, barH);

  ctx.restore();
}

// Render Viking Norse Defenses (Runestone Watchtower & Frost Ballista)
function drawVikingDefense(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // 1. Water shadow / rocky timber foundation
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(2, 3, tw.radius + 4, 0, Math.PI * 2);
  ctx.fill();

  // 2. Chiseled granite rock base
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const sides = 6;
  for (let s = 0; s < sides; s++) {
    const ang = (s / sides) * Math.PI * 2;
    const px = Math.cos(ang) * (tw.radius + 2);
    const py = Math.sin(ang) * (tw.radius + 2);
    if (s === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Heavy Norse timber logs platform
  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Glowing Runic Runestones
  const runePulse = Math.sin(_now * 0.004) * 0.3 + 0.7;
  ctx.strokeStyle = `rgba(56, 189, 248, ${runePulse})`;
  ctx.lineWidth = 1.6;
  for (let r = 0; r < 4; r++) {
    const rAng = tw.baseAngle + (r * Math.PI / 2);
    const rx = Math.cos(rAng) * (tw.radius - 8);
    const ry = Math.sin(rAng) * (tw.radius - 8);
    ctx.beginPath();
    ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 5. Turret head rotating to aimAngle
  ctx.save();
  ctx.rotate(tw.aimAngle);

  if (tw.defenseType === 'viking_ballista') {
    // Massive Norse Frost Ballista
    // Stock/Beam
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-4, -18, 8, 26);
    ctx.strokeRect(-4, -18, 8, 26);

    // Ballista curved bow arms
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.quadraticCurveTo(0, -14, 16, -6);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(0, -2);
    ctx.lineTo(16, -6);
    ctx.stroke();

    // Frost harpoon projectile loaded
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(3, -12);
    ctx.lineTo(-3, -12);
    ctx.closePath();
    ctx.fill();

  } else {
    // Viking Watchtower / Shield Paladin Turret
    // Timber fortress post
    ctx.fillStyle = '#292524';
    ctx.fillRect(-7, -7, 14, 14);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-7, -7, 14, 14);

    // Norse round shields rimming the fortress
    const shieldColors = ['#0284c7', '#dc2626', '#0284c7', '#d97706'];
    for (let sh = 0; sh < 4; sh++) {
      const shAng = (sh * Math.PI / 2);
      ctx.fillStyle = shieldColors[sh];
      ctx.beginPath();
      ctx.arc(Math.cos(shAng) * 9, Math.sin(shAng) * 9, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Heavy Norse battle axe ready on rack
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1, -14, 2, 10);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(3, -11, 3, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.lineTo(0, -11);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore(); // Turret head

  // 6. Health Bar
  const barW = tw.radius * 1.6;
  const barH = 3.5;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -tw.radius - 9, barW, barH);
  ctx.fillStyle = '#38bdf8';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -tw.radius - 9, barW * hpRatio, barH);

  ctx.restore();
}

// Render Wokou Pirate Defenses (Rocket Pagoda & Fire Arrow Nest)
function drawWokouDefense(ctx, tw) {
  ctx.save();
  ctx.translate(tw.x, tw.y);

  // 1. Water shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(2, 3, tw.radius + 3, 0, Math.PI * 2);
  ctx.fill();

  // 2. Stone & timber foundation
  ctx.fillStyle = '#1c1917';
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Pagoda deck platform (Vermilion lacquer)
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.arc(0, 0, tw.radius - 3, 0, Math.PI * 2);
  ctx.fill();

  // 4. Swept Pagoda Eaves (4 swept corners)
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.2;
  for (let c = 0; c < 4; c++) {
    const cAng = tw.baseAngle + (c * Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(Math.cos(cAng - 0.2) * (tw.radius - 2), Math.sin(cAng - 0.2) * (tw.radius - 2));
    ctx.lineTo(Math.cos(cAng) * (tw.radius + 6), Math.sin(cAng) * (tw.radius + 6));
    ctx.lineTo(Math.cos(cAng + 0.2) * (tw.radius - 2), Math.sin(cAng + 0.2) * (tw.radius - 2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 5. Turret head rotating to aimAngle
  ctx.save();
  ctx.rotate(tw.aimAngle);

  if (tw.defenseType === 'wokou_pagoda') {
    // Pagoda Tower Top & Multi-tube Rocket Battery
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-6, -6, 12, 12);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-6, -6, 12, 12);

    // 3 Rocket launcher tubes
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    [-4, 0, 4].forEach(offset => {
      ctx.fillRect(offset - 1.2, -18, 2.4, 14);
      ctx.strokeRect(offset - 1.2, -18, 2.4, 14);
      // Fiery rocket tip
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(offset, -19, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
    });

  } else {
    // Wokou Rocket Nest (Bamboo arrow battery)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bamboo rack
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.8;
    [-3, 3].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(offset, 4);
      ctx.lineTo(offset, -14);
      ctx.stroke();
      // Rocket arrow warhead
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(offset, -17);
      ctx.lineTo(offset + 2, -13);
      ctx.lineTo(offset - 2, -13);
      ctx.closePath();
      ctx.fill();
    });
  }

  ctx.restore(); // Turret head

  // 6. Health Bar
  const barW = tw.radius * 1.6;
  const barH = 3.5;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -tw.radius - 9, barW, barH);
  ctx.fillStyle = '#ef4444';
  const hpRatio = Math.max(0, tw.hp / tw.maxHp);
  ctx.fillRect(-barW / 2, -tw.radius - 9, barW * hpRatio, barH);

  ctx.restore();
}

// Master Dispatcher for Island Defenses
function drawIslandDefense(ctx, tw) {
  if (tw.defenseType === 'tentacle') {
    drawAbyssalTentacle(ctx, tw);
  } else if (tw.defenseType === 'flesh_spitter') {
    drawFleshSpitter(ctx, tw);
  } else if (tw.defenseType === 'steam_harpoon') {
    drawSteamHarpoonTurret(ctx, tw);
  } else if (tw.defenseType === 'steam_vent') {
    drawSteamVent(ctx, tw);
  } else if (tw.defenseType === 'swivel_outpost') {
    drawSwivelOutpost(ctx, tw);
  } else if (tw.defenseType === 'skull_pylon') {
    drawSkullPylon(ctx, tw);
  } else if (tw.defenseType === 'viking_ballista' || tw.defenseType === 'viking_watchtower') {
    drawVikingDefense(ctx, tw);
  } else if (tw.defenseType === 'wokou_pagoda' || tw.defenseType === 'wokou_rocket_nest') {
    drawWokouDefense(ctx, tw);
  } else if (tw.defenseType === 'cannon_bastion' || tw.defenseType === 'haven_bastion') {
    drawCannonBastion(ctx, tw);
  } else {
    drawOccultTower(ctx, tw);
  }
}

// Render Peaceful Merchant Ships & Trade Convoys
function drawMerchantShip(ctx, m) {
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.angle);

  const isCargo = m.type === 'cargo';
  const len = isCargo ? 32 : 28;
  const wid = isCargo ? 18 : 14;

  // Dynamic Merchant Ship Lantern at Night
  if (typeof dayNightState !== 'undefined' && !dayNightState.isDay) {
    const mLantern = ctx.createRadialGradient(0, 0, 4, 0, 0, 52);
    mLantern.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
    mLantern.addColorStop(0.65, 'rgba(217, 119, 6, 0.06)');
    mLantern.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = mLantern;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dynamic Directional Water displacement & shadow
  const msLen = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowLen === 'number') ? dayNightState.shadowLen : 6;
  const msDirX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowDirX === 'number' && !isNaN(dayNightState.shadowDirX)) ? dayNightState.shadowDirX : -0.4;
  const msDirY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowDirY === 'number' && !isNaN(dayNightState.shadowDirY)) ? dayNightState.shadowDirY : 0.8;
  const mWorldShadowX = msDirX * Math.min(8, msLen * 0.35);
  const mWorldShadowY = msDirY * Math.min(8, msLen * 0.35);
  const mShadowAlpha = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number' && !isNaN(dayNightState.shadowAlpha)) ? (dayNightState.shadowAlpha * 0.8) : 0.28;
  const mCosH = Math.cos(-m.angle);
  const mSinH = Math.sin(-m.angle);
  const mLocalShadowX = mWorldShadowX * mCosH - mWorldShadowY * mSinH;
  const mLocalShadowY = mWorldShadowX * mSinH + mWorldShadowY * mCosH;

  ctx.fillStyle = `rgba(0, 0, 0, ${mShadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(mLocalShadowX, mLocalShadowY, len * 0.5, wid * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isCargo) {
    // 1. Cargo Cog / Pinisi Dagang Hull
    ctx.fillStyle = '#78350f'; // Warm teak wood
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(len * 0.52, 0); // Bow
    ctx.bezierCurveTo(len * 0.35, -wid * 0.55, -len * 0.3, -wid * 0.52, -len * 0.48, -wid * 0.35);
    ctx.lineTo(-len * 0.48, wid * 0.35);
    ctx.bezierCurveTo(-len * 0.3, wid * 0.52, len * 0.35, wid * 0.55, len * 0.52, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wooden deck
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(-len * 0.05, 0, len * 0.36, wid * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cargo Crates & Spice Barrels on Deck
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.fillRect(-6, -5, 6, 5);
    ctx.strokeRect(-6, -5, 6, 5);
    ctx.fillRect(-6, 1, 6, 5);
    ctx.strokeRect(-6, 1, 6, 5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(2, -3, 6, 6);
    ctx.strokeRect(2, -3, 6, 6);

    // Main Mast & Striped Merchant Sail
    ctx.fillStyle = '#fef3c7'; // Cream cloth
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2, -wid * 0.85);
    ctx.quadraticCurveTo(len * 0.25, 0, -2, wid * 0.85);
    ctx.quadraticCurveTo(0, 0, -2, -wid * 0.85);
    ctx.fill();
    ctx.stroke();

    // Merchant Emerald Trade Stripe
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-1, -wid * 0.45);
    ctx.lineTo(len * 0.12, 0);
    ctx.lineTo(-1, wid * 0.45);
    ctx.stroke();

    // Bow Gold Lantern
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(len * 0.48, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // 2. Armed Escort Cutter
    ctx.fillStyle = '#1e293b'; // Slate dark hull
    ctx.strokeStyle = '#0284c7'; // Cyan trim
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(len * 0.55, 0);
    ctx.bezierCurveTo(len * 0.3, -wid * 0.5, -len * 0.35, -wid * 0.45, -len * 0.48, -wid * 0.28);
    ctx.lineTo(-len * 0.48, wid * 0.28);
    ctx.bezierCurveTo(-len * 0.35, wid * 0.45, len * 0.3, wid * 0.5, len * 0.55, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Deck
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.35, wid * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Port & Starboard Swivel Guns
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, -wid * 0.5 - 2, 4, 3);
    ctx.fillRect(-2, wid * 0.5 - 1, 4, 3);

    // Escort Chevron Sails
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-4, -wid * 0.8);
    ctx.quadraticCurveTo(len * 0.22, 0, -4, wid * 0.8);
    ctx.quadraticCurveTo(-1, 0, -4, -wid * 0.8);
    ctx.fill();
    ctx.stroke();
  }

  // Anchor emblem when docked (Vector)
  if (m.isAnchored || m.state === 'docked') {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -wid - 9, 2, 0, Math.PI * 2);
    ctx.moveTo(0, -wid - 7);
    ctx.lineTo(0, -wid - 2);
    ctx.moveTo(-3, -wid - 5);
    ctx.lineTo(3, -wid - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -wid - 4, 3, 0.25 * Math.PI, 0.75 * Math.PI, false);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();

  // Floating HP bar above merchant ship
  const barW = 36;
  const barH = 3;
  ctx.save();
  ctx.translate(m.x, m.y);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(-barW / 2 - 2, -26, barW + 4, barH + 9);

  ctx.font = 'bold 7px sans-serif';
  ctx.fillStyle = isCargo ? '#34d399' : '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText(m.name, 0, -19);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-barW / 2, -18, barW, barH);

  ctx.fillStyle = isCargo ? '#10b981' : '#0ea5e9';
  const hpRatio = Math.max(0, m.hp / m.maxHp);
  ctx.fillRect(-barW / 2, -18, barW * hpRatio, barH);

  ctx.restore();
}

// Render Ships Currently Sinking into the Deep
function drawSinkingShip(ctx, s) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle);

  const scale = Math.max(0.2, 1 - s.progress * 0.6);
  ctx.scale(scale, scale);
  ctx.globalAlpha = Math.max(0, 1 - s.progress * 0.85);

  const len = 28;
  const wid = 14;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, len * 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#291807';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, len / 2, wid / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(8, 4);
  ctx.stroke();

  ctx.restore();
}

// Render Oceanic Seagulls (Burung Camar Laut Terbang & Singgah di Kapal / Pulau)
function drawSeagull(ctx, s) {
  const birdAlpha = s.alpha !== undefined ? s.alpha : 1.0;
  if (birdAlpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = (ctx.globalAlpha || 1.0) * birdAlpha;
  ctx.translate(s.x, s.y);

  const isCarrion = !!s.isCarrion;
  const isPerched = s.state === 'perched';
  const wingColor = isCarrion ? '#1e293b' : '#ffffff';
  const tipColor = isCarrion ? '#020617' : '#64748b';
  const bodyColor = isCarrion ? '#0f172a' : '#f8fafc';
  const beakColor = isCarrion ? '#475569' : '#f59e0b';

  // 1. Dynamic Directional Soft Shadow cast on Sea Water or Ship Deck
  ctx.save();
  const seagullShadowAlpha = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number' && !isNaN(dayNightState.shadowAlpha)) ? (dayNightState.shadowAlpha * 0.6) : 0.22;
  ctx.fillStyle = `rgba(15, 23, 42, ${seagullShadowAlpha.toFixed(3)})`;
  const sWorldVecX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecX === 'number' && !isNaN(dayNightState.shadowVecX)) ? dayNightState.shadowVecX : 0;
  const sWorldVecY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecY === 'number' && !isNaN(dayNightState.shadowVecY)) ? dayNightState.shadowVecY : 2;
  if (isPerched) {
    const sOffX = sWorldVecX * 0.15;
    const sOffY = sWorldVecY * 0.15;
    ctx.rotate(s.heading);
    ctx.beginPath();
    ctx.ellipse(sOffX, sOffY, 4.5, 2.0, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const alt = s.altitude || 20;
    const sOffX = sWorldVecX * (alt / 18);
    const sOffY = sWorldVecY * (alt / 18);
    ctx.translate(sOffX, sOffY);
    ctx.rotate(s.heading);
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Bird Body
  ctx.rotate(s.heading);

  if (isPerched) {
    // Left & Right Folded Wings resting against body flanks
    ctx.fillStyle = wingColor;
    ctx.beginPath();
    ctx.ellipse(-0.8, -2.0, 3.8, 1.2, -0.12, 0, Math.PI * 2);
    ctx.ellipse(-0.8, 2.0, 3.8, 1.2, 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Dark Wingtips folded over the tail
    ctx.strokeStyle = tipColor;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(1, -2.0);
    ctx.lineTo(-4.5, -1.0);
    ctx.moveTo(1, 2.0);
    ctx.lineTo(-4.5, 1.0);
    ctx.stroke();

    // Sleek Plump Resting Torso
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0.5, 0, 5.0, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head with Beak
    ctx.fillStyle = beakColor;
    ctx.beginPath();
    ctx.moveTo(4.8, -0.7);
    ctx.lineTo(7.6, 0);
    ctx.lineTo(4.8, 0.7);
    ctx.closePath();
    ctx.fill();

    // Carrion Crow Glowing Crimson Eye
    if (isCarrion) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(3.0, -0.7, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Flight Rendering: Outstretched Flapping Wings
    const flap = Math.sin(s.wingPhase) * 5.5;

    // Wings
    ctx.strokeStyle = wingColor;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-2, -6 + flap, -1, -11 + flap * 1.4);
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-2, 6 - flap, -1, 11 - flap * 1.4);
    ctx.stroke();

    // Wingtips
    ctx.strokeStyle = tipColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-1, -8 + flap * 1.2);
    ctx.lineTo(-1, -11 + flap * 1.4);
    ctx.moveTo(-1, 8 - flap * 1.2);
    ctx.lineTo(-1, 11 - flap * 1.4);
    ctx.stroke();

    // Sleek Flying Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(1, 0, 5.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = beakColor;
    ctx.beginPath();
    ctx.moveTo(5.5, -0.8);
    ctx.lineTo(8.5, 0);
    ctx.lineTo(5.5, 0.8);
    ctx.closePath();
    ctx.fill();

    // Carrion Crow Glowing Crimson Eye
    if (isCarrion) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(3.5, -0.8, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function renderMistRituals(ctx) {
  _renderedCenters.clear();
  entities.enemies.forEach(e => {
    if (e.formationType === 'mist_ritual' && e.ritualCenter && !_renderedCenters.has(e.ritualCenter)) {
      _renderedCenters.add(e.ritualCenter);
      const rc = e.ritualCenter;

      ctx.save();
      ctx.translate(rc.x, rc.y);
      ctx.rotate(rc.angle || 0);

      // Ethereal glowing circle on water
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 98);
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.16)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 98, 0, Math.PI * 2);
      ctx.fill();

      // Outer arcane dashed ritual circle
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([12, 8, 4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.stroke();

      // Inner occult pentagram / runic star
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5;
        const rx = Math.cos(a) * 55;
        const ry = Math.sin(a) * 55;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.stroke();

      // Central pulsing arcane wisp orb
      const corePulse = Math.sin(_now * 0.005) * 3 + 9;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
      ctx.beginPath();
      ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  });
}

// Pre-rendered offscreen mist sprite textures for ultra-fast GPU blitting
let mistSpriteNormal = null;
let mistSpriteBlood = null;

function createMistSprite(colorA, colorB) {
  const size = 128;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = size;
  offCanvas.height = size;
  const offCtx = offCanvas.getContext('2d');
  const grad = offCtx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, colorA);
  grad.addColorStop(0.5, colorB);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  offCtx.fillStyle = grad;
  offCtx.beginPath();
  offCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  offCtx.fill();
  return offCanvas;
}

function getMistSprite(isBlood) {
  if (isBlood) {
    if (!mistSpriteBlood) mistSpriteBlood = createMistSprite('rgba(220, 38, 38, 0.45)', 'rgba(180, 20, 30, 0.15)');
    return mistSpriteBlood;
  } else {
    if (!mistSpriteNormal) mistSpriteNormal = createMistSprite('rgba(220, 240, 255, 0.45)', 'rgba(200, 230, 255, 0.15)');
    return mistSpriteNormal;
  }
}

// Pre-rendered offscreen cloud shadow sprites for ultra-fast mobile GPU blitting (60 FPS)
let cloudShadowSpriteNormal = null;
let cloudShadowSpriteBlood = null;

function createCloudShadowSprite(isBlood) {
  const w = 440;
  const h = 280;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d');

  // Multi-lobed billowy cumulus cloud shadow with soft Gaussian-style radial feathering
  const lobes = [
    { cx: 220, cy: 140, r: 110 },
    { cx: 140, cy: 130, r: 90 },
    { cx: 300, cy: 150, r: 95 },
    { cx: 195, cy: 85,  r: 80 },
    { cx: 265, cy: 95,  r: 75 },
    { cx: 155, cy: 195, r: 72 },
    { cx: 255, cy: 195, r: 78 },
    { cx: 95,  cy: 145, r: 60 },
    { cx: 345, cy: 135, r: 65 }
  ];

  for (let i = 0; i < lobes.length; i++) {
    const lobe = lobes[i];
    const grad = offCtx.createRadialGradient(lobe.cx, lobe.cy, lobe.r * 0.12, lobe.cx, lobe.cy, lobe.r);
    if (isBlood) {
      grad.addColorStop(0, 'rgba(45, 8, 14, 0.45)');
      grad.addColorStop(0.55, 'rgba(80, 12, 22, 0.22)');
      grad.addColorStop(1, 'rgba(45, 8, 14, 0)');
    } else {
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
      grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.18)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    }
    offCtx.fillStyle = grad;
    offCtx.beginPath();
    offCtx.arc(lobe.cx, lobe.cy, lobe.r, 0, Math.PI * 2);
    offCtx.fill();
  }

  return offCanvas;
}

function getCloudShadowSprite(isBlood) {
  if (isBlood) {
    if (!cloudShadowSpriteBlood) cloudShadowSpriteBlood = createCloudShadowSprite(true);
    return cloudShadowSpriteBlood;
  } else {
    if (!cloudShadowSpriteNormal) cloudShadowSpriteNormal = createCloudShadowSprite(false);
    return cloudShadowSpriteNormal;
  }
}

// Persistent cloud shadow field configuration with spatial offsets & parallax drift rates
const CLOUD_SHADOW_DEFS = [
  { x: 350,  y: 200,  w: 520, h: 310, rot: 0.15,  spd: 1.05 },
  { x: 1250, y: 450,  w: 580, h: 340, rot: -0.22, spd: 0.95 },
  { x: 2100, y: 150,  w: 470, h: 280, rot: 0.08,  spd: 1.12 },
  { x: 700,  y: 950,  w: 540, h: 320, rot: -0.12, spd: 0.98 },
  { x: 1650, y: 800,  w: 610, h: 360, rot: 0.25,  spd: 1.02 },
  { x: 2500, y: 1100, w: 490, h: 290, rot: -0.18, spd: 1.08 },
  { x: 400,  y: 1650, w: 560, h: 330, rot: 0.10,  spd: 0.92 },
  { x: 1450, y: 1500, w: 530, h: 315, rot: -0.05, spd: 1.00 }
];
const CLOUD_PERIOD_X = 2800;
const CLOUD_PERIOD_Y = 2000;

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  _now = Date.now();
  _perfNow = performance.now() * 0.001;
  const playerDist = Math.hypot(playerState.x, playerState.y);
  const biome = getBiomeInfo(playerDist);
  const time = _perfNow;

  // Modulate base ocean colors with day/night ambient lighting and atmospheric water tint
  const dnAmbient = (typeof dayNightState !== 'undefined' && typeof dayNightState.ambientMult === 'number') ? dayNightState.ambientMult : 1.0;
  const dnTint = (typeof dayNightState !== 'undefined' && Array.isArray(dayNightState.waterTint)) ? dayNightState.waterTint : [0, 0, 0];
  
  // Night floor clamp ensures ocean is never pitch black (minimum visibility floor guaranteed)
  const r1 = Math.round(Math.min(255, Math.max(10, biome.waterA[0] * dnAmbient + dnTint[0])));
  const g1 = Math.round(Math.min(255, Math.max(16, biome.waterA[1] * dnAmbient + dnTint[1])));
  const b1 = Math.round(Math.min(255, Math.max(26, biome.waterA[2] * dnAmbient + dnTint[2])));

  const r2 = Math.round(Math.min(255, Math.max(8, biome.waterB[0] * dnAmbient + dnTint[0])));
  const g2 = Math.round(Math.min(255, Math.max(12, biome.waterB[1] * dnAmbient + dnTint[1])));
  const b2 = Math.round(Math.min(255, Math.max(22, biome.waterB[2] * dnAmbient + dnTint[2])));

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
  oceanGrad.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Specular Solar / Lunar Ocean Glint & Zenith Dome (Kilau Surya / Rembulan di Permukaan Samudera)
  if (typeof dayNightState !== 'undefined' && typeof dayNightState.specularIntensity === 'number' && dayNightState.specularIntensity > 0.04) {
    const glintCfg = (Array.isArray(dayNightState.glintColor)) ? dayNightState.glintColor : [255, 255, 255];
    const glintInt = dayNightState.specularIntensity;
    const lDirX = (typeof dayNightState.lightDirX === 'number' && !isNaN(dayNightState.lightDirX)) ? dayNightState.lightDirX : 1;
    const lDirY = (typeof dayNightState.lightDirY === 'number' && !isNaN(dayNightState.lightDirY)) ? dayNightState.lightDirY : 0;
    const lightAngle = Math.atan2(lDirY, lDirX);
    const cAlt = typeof dayNightState.celestialAlt === 'number' ? dayNightState.celestialAlt : 45;

    // 1. Zenith Sun Specular Dome (Overhead sunlight reflection as seen in high-sun ocean photography)
    if (dayNightState.isDay && cAlt > 20) {
      const altFactor = Math.min(1.0, (cAlt - 20) / 45); // 0 at 20 deg, 1.0 at 65+ deg
      const domeCenterX = width * 0.5 - lDirX * (width * 0.12);
      const domeCenterY = height * 0.45 - lDirY * (height * 0.12);
      const domeR = Math.max(width, height) * (0.42 + altFactor * 0.28);
      const domeGrad = ctx.createRadialGradient(domeCenterX, domeCenterY, 0, domeCenterX, domeCenterY, domeR);
      const coreA = (glintInt * altFactor * 0.18).toFixed(3);
      const midA = (glintInt * altFactor * 0.07).toFixed(3);
      domeGrad.addColorStop(0, `rgba(${glintCfg[0]}, ${glintCfg[1]}, ${glintCfg[2]}, ${coreA})`);
      domeGrad.addColorStop(0.5, `rgba(${glintCfg[0]}, ${glintCfg[1]}, ${glintCfg[2]}, ${midA})`);
      domeGrad.addColorStop(1, `rgba(${glintCfg[0]}, ${glintCfg[1]}, ${glintCfg[2]}, 0)`);
      ctx.fillStyle = domeGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Low-Sun / Lunar Directional Specular Swath (Elongated reflective band along celestial vector)
    if (cAlt <= 55 || !dayNightState.isDay) {
      const swathWeight = !dayNightState.isDay ? 1.0 : Math.max(0, 1 - (cAlt - 20) / 35);
      ctx.save();
      ctx.translate(width * 0.5, height * 0.5);
      ctx.rotate(lightAngle);
      
      const laneW = Math.max(width, height) * 1.6;
      const laneH = Math.min(width, height) * (0.35 + swathWeight * 0.15);
      const glintGrad = ctx.createLinearGradient(0, -laneH * 0.5, 0, laneH * 0.5);
      const glintAlpha = Math.min(0.20, Math.max(0, glintInt * 0.14 * swathWeight)).toFixed(3);
      glintGrad.addColorStop(0, `rgba(${glintCfg[0]}, ${glintCfg[1]}, ${glintCfg[2]}, 0)`);
      glintGrad.addColorStop(0.5, `rgba(${glintCfg[0]}, ${glintCfg[1]}, ${glintCfg[2]}, ${glintAlpha})`);
      glintGrad.addColorStop(1, `rgba(${glintCfg[0]}, ${glintCfg[1]}, ${glintCfg[2]}, 0)`);
      ctx.fillStyle = glintGrad;
      ctx.fillRect(-laneW * 0.5, -laneH * 0.5, laneW, laneH);
      ctx.restore();
    }
  }

  // --------------------------------------------------------------------------
  // Nocturnal Sky & Cosmic Milky Way Ribbon Reflection (Laut Kaca Bimasakti)
  // --------------------------------------------------------------------------
  if (typeof dayNightState !== 'undefined' && !dayNightState.isDay && (typeof weatherState === 'undefined' || weatherState.type === 'clear' || weatherState.type === 'mist')) {
    const starAlpha = Math.min(1.0, (-dayNightState.altitude) * 2.2) * (1 - ((typeof weatherState !== 'undefined' && weatherState.intensity) || 0) * 0.6);
    const cosmicInt = dayNightState.cosmicIntensity || 0;

    if (starAlpha > 0.05 || cosmicInt > 0.05) {
      ctx.save();

      // 1. The Glowing Milky Way Ribbon (Pita Galaksi Bimasakti)
      if (cosmicInt > 0.02) {
        ctx.save();
        ctx.translate(width * 0.5, height * 0.5);
        ctx.rotate(-0.52); // Majestic diagonal galactic tilt

        const mwW = Math.max(width, height) * 1.8;
        const mwH = Math.min(width, height) * 0.65;
        
        // Deep Violet / Magenta Cosmic Dust Core
        const mwGrad = ctx.createLinearGradient(0, -mwH * 0.5, 0, mwH * 0.5);
        const coreAlpha = (0.28 * cosmicInt).toFixed(3);
        const midAlpha = (0.16 * cosmicInt).toFixed(3);
        const cyanAlpha = (0.12 * cosmicInt).toFixed(3);

        mwGrad.addColorStop(0, 'rgba(12, 10, 32, 0)');
        mwGrad.addColorStop(0.25, `rgba(76, 29, 149, ${cyanAlpha})`);
        mwGrad.addColorStop(0.42, `rgba(139, 92, 246, ${midAlpha})`);
        mwGrad.addColorStop(0.50, `rgba(217, 70, 239, ${coreAlpha})`);
        mwGrad.addColorStop(0.58, `rgba(56, 189, 248, ${midAlpha})`);
        mwGrad.addColorStop(0.75, `rgba(30, 58, 138, ${cyanAlpha})`);
        mwGrad.addColorStop(1, 'rgba(12, 10, 32, 0)');

        ctx.fillStyle = mwGrad;
        ctx.fillRect(-mwW * 0.5, -mwH * 0.5, mwW, mwH);

        // Billowing Organic Nebula Clusters drifting in the galactic dust
        for (let n = 0; n < 8; n++) {
          const nx = (n * 240 - mwW * 0.42 + Math.sin(time * 0.2 + n) * 35);
          const ny = Math.sin(n * 1.8 + time * 0.15) * 45;
          const nr = 75 + (n % 4) * 30;
          const nebGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
          const nebColor = (n % 3 === 0) ? '168, 85, 247' : ((n % 3 === 1) ? '56, 189, 248' : '236, 72, 153');
          const nAlpha = (0.14 * cosmicInt).toFixed(3);
          nebGrad.addColorStop(0, `rgba(${nebColor}, ${nAlpha})`);
          nebGrad.addColorStop(0.6, `rgba(${nebColor}, ${(nAlpha * 0.4).toFixed(3)})`);
          nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = nebGrad;
          ctx.beginPath();
          ctx.arc(nx, ny, nr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Cosmic Starfield & Constellations (140+ Spectral Stars)
      const numStars = cosmicInt > 0.2 ? 144 : 36;
      for (let s = 0; s < numStars; s++) {
        const sx = ((s * 179.3) % width);
        const sy = ((s * 313.7) % height);
        const twinkle = 0.35 + Math.sin(time * 2.5 + s * 1.7) * 0.35;
        const totalA = Math.min(1.0, (starAlpha * 0.35 + cosmicInt * 0.65) * twinkle);
        if (totalA < 0.04) continue;

        // Spectral Star Types
        let starR = 1.0;
        let starCol = '224, 242, 254';
        if (s % 5 === 0) {
          starCol = '254, 240, 138'; // Golden star (Capella/Arcturus)
          starR = 1.5;
        } else if (s % 7 === 0) {
          starCol = '192, 132, 252'; // Violet-blue nebula star
          starR = 1.8;
        } else if (s % 11 === 0) {
          starCol = '244, 114, 182'; // Rose-red giant (Betelgeuse)
          starR = 1.6;
        } else if (s % 3 === 0) {
          starCol = '255, 255, 255'; // Brilliant white star
          starR = 1.4;
        }

        ctx.fillStyle = `rgba(${starCol}, ${totalA.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, starR, 0, Math.PI * 2);
        ctx.fill();

        // Diamond 4-point diffraction spike on prominent stars
        if (cosmicInt > 0.3 && (s % 7 === 0 || s % 11 === 0) && totalA > 0.4) {
          const spikeLen = starR * 3.8;
          ctx.strokeStyle = `rgba(${starCol}, ${(totalA * 0.45).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - spikeLen, sy);
          ctx.lineTo(sx + spikeLen, sy);
          ctx.moveTo(sx, sy - spikeLen);
          ctx.lineTo(sx, sy + spikeLen);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  ctx.save();

  let shakeX = 0;
  let shakeY = 0;
  if (screenShake > 0 && sound.screenShakeEnabled) {
    shakeX = (Math.random() - 0.5) * screenShake * 2;
    shakeY = (Math.random() - 0.5) * screenShake * 2;
  }

  // Adaptive Camera Zoom:
  // On PC / wide screens, base zoom is 1.0.
  // On mobile portrait, zoom is tuned (~0.88x - 0.90x) so ship is close and prominent without feeling cramped.
  // When Spyglass mode is active, zoom expands by ~42% for wide ocean reconnaissance!
  const isMobile = isMobileDevice() || width < 1024;
  let targetCameraZoom = isMobile ? Math.min(1.0, Math.max(0.85, width / 520)) : 1.0;
  if (typeof isSpyglassActive !== 'undefined' && isSpyglassActive) {
    targetCameraZoom *= 0.58;
  }
  if (typeof currentRenderZoom === 'undefined') currentRenderZoom = targetCameraZoom;
  currentRenderZoom += (targetCameraZoom - currentRenderZoom) * 0.14;
  const cameraZoom = currentRenderZoom;

  // Camera focal center: supports cinematic camera tracking override
  const camX = (window.cameraState && window.cameraState.overrideActive) ? window.cameraState.x : playerState.x;
  const camY = (window.cameraState && window.cameraState.overrideActive) ? window.cameraState.y : playerState.y;

  // True Centering Transform:
  // Center world coordinates at (width/2, height/2), apply zoom, then translate to camera focal center
  ctx.translate(width / 2, height / 2);
  ctx.scale(cameraZoom, cameraZoom);
  ctx.translate(-camX + shakeX, -camY + shakeY);

  const drawMargin = isMobile ? 100 : 180;
  const halfViewW = (width / 2) / cameraZoom;
  const halfViewH = (height / 2) / cameraZoom;
  viewLeft = camX - halfViewW - drawMargin;
  viewRight = camX + halfViewW + drawMargin;
  viewTop = camY - halfViewH - drawMargin;
  viewBottom = camY + halfViewH + drawMargin;

  // Ocean Wave Ribbons with Dynamic Solar/Lunar Specular Glint & Nocturnal Bioluminescence
  const waveSpacing = 135;
  const startWaveY = Math.floor(viewTop / waveSpacing) * waveSpacing;
  const endWaveY = viewBottom + waveSpacing;

  const bioLum = (typeof dayNightState !== 'undefined' && typeof dayNightState.bioLum === 'number') ? dayNightState.bioLum : 0;
  const glintCol = (typeof dayNightState !== 'undefined' && Array.isArray(dayNightState.glintColor)) ? dayNightState.glintColor : [255, 255, 255];
  const glintInt = (typeof dayNightState !== 'undefined' && typeof dayNightState.specularIntensity === 'number') ? dayNightState.specularIntensity : 0.5;

  ctx.lineWidth = 1.6;
  for (let wy = startWaveY; wy < endWaveY; wy += waveSpacing) {
    ctx.beginPath();
    let waveColor;
    if (biome.isBloodSea) {
      waveColor = `rgba(255, 60, 60, ${(0.12 + Math.sin(time + wy * 0.02) * 0.04).toFixed(3)})`;
    } else if (typeof dayNightState !== 'undefined' && dayNightState.cosmicIntensity > 0.15) {
      // Cosmic Starlight Reflective Wavelets during Milky Way Mirror event
      const ci = dayNightState.cosmicIntensity;
      const cAlpha = Math.min(0.22, (0.05 + Math.sin(time * 1.6 + wy * 0.025) * 0.03 + glintInt * 0.04) * ci).toFixed(3);
      waveColor = `rgba(196, 181, 253, ${cAlpha})`;
    } else if (bioLum > 0.15) {
      // Bioluminescent Plankton Foam in nocturnal wave troughs
      const bAlpha = Math.min(0.25, Math.max(0.04, bioLum * (0.10 + Math.sin(time * 1.8 + wy * 0.03) * 0.04))).toFixed(3);
      waveColor = `rgba(45, 212, 191, ${bAlpha})`;
    } else {
      // Celestial crest highlight (golden at sunset/dawn, silver/white at noon/dusk)
      const baseAlpha = Math.min(0.18, Math.max(0.04, 0.06 + Math.sin(time + wy * 0.02) * 0.025 + glintInt * 0.04)).toFixed(3);
      waveColor = `rgba(${glintCol[0]}, ${glintCol[1]}, ${glintCol[2]}, ${baseAlpha})`;
    }
    ctx.strokeStyle = waveColor;

    // Glassy calm ocean surface damping when cosmic mirror is active
    const damp = (typeof dayNightState !== 'undefined' && dayNightState.cosmicIntensity > 0) ? (1 - dayNightState.cosmicIntensity * 0.72) : 1.0;
    const stepX = 65;
    for (let wx = viewLeft; wx <= viewRight; wx += stepX) {
      const swellOffset = (Math.sin(wx * 0.012 + time * 1.4 + wy * 0.02) * 12 
                        + Math.cos(wx * 0.024 - time * 0.8) * 6) * damp;
      if (wx === viewLeft) {
        ctx.moveTo(wx, wy + swellOffset);
      } else {
        ctx.lineTo(wx, wy + swellOffset);
      }
    }
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // AAA-Style Ocean Specular Sun Glitter & Microfacet Ripple Highlights
  // Procedural Dancing Wave Sparkles reflecting Solar / Lunar light (Glistening Sea)
  // --------------------------------------------------------------------------
  if (typeof dayNightState !== 'undefined' && typeof dayNightState.specularIntensity === 'number' && dayNightState.specularIntensity > 0.04) {
    const glintCfg = Array.isArray(dayNightState.glintColor) ? dayNightState.glintColor : [255, 255, 255];
    const sInt = dayNightState.specularIntensity;
    const isDay = dayNightState.isDay;
    const cAlt = typeof dayNightState.celestialAlt === 'number' ? dayNightState.celestialAlt : 45;

    // Weather attenuation (cloud cover and rain soften direct glints)
    let weatherAtten = 1.0;
    if (typeof weatherState !== 'undefined') {
      if (weatherState.type === 'rain') weatherAtten = 0.35;
      else if (weatherState.type === 'storm') weatherAtten = 0.15;
      else if (weatherState.type === 'mist') weatherAtten = 0.65;
    }

    const activeGlintPower = sInt * weatherAtten;
    if (activeGlintPower > 0.03) {
      // Determine reflection focal center in world space
      // When celestial body is high, reflection is centered near the player / camera
      // When low, reflection shifts toward the light horizon
      const shiftDist = (1 - Math.min(1.0, Math.max(0, cAlt / 70))) * (halfViewW * 0.45);
      const lDirX = (typeof dayNightState.lightDirX === 'number' && !isNaN(dayNightState.lightDirX)) ? dayNightState.lightDirX : 1;
      const lDirY = (typeof dayNightState.lightDirY === 'number' && !isNaN(dayNightState.lightDirY)) ? dayNightState.lightDirY : 0;
      const reflCenterX = playerState.x - lDirX * shiftDist;
      const reflCenterY = playerState.y - lDirY * shiftDist;
      const zoneRadiusX = halfViewW * (cAlt > 25 ? 1.25 : 0.90);
      const zoneRadiusY = halfViewH * (cAlt > 25 ? 1.25 : 0.90);

      const glintSpacing = 50;
      const startGX = Math.floor(viewLeft / glintSpacing) * glintSpacing;
      const endGX = viewRight + glintSpacing;
      const startGY = Math.floor(viewTop / glintSpacing) * glintSpacing;
      const endGY = viewBottom + glintSpacing;

      ctx.save();
      for (let gy = startGY; gy < endGY; gy += glintSpacing) {
        for (let gx = startGX; gx < endGX; gx += glintSpacing) {
          // Deterministic pseudo-jitter to mimic natural oceanic ripple distribution
          const jx = Math.sin(gx * 0.041 + gy * 0.073) * 18;
          const jy = Math.cos(gx * 0.067 - gy * 0.039) * 18;
          const px = gx + jx;
          const py = gy + jy;

          // Distance falloff from specular reflection center
          const dX = (px - reflCenterX) / zoneRadiusX;
          const dY = (py - reflCenterY) / zoneRadiusY;
          const distSq = dX * dX + dY * dY;
          if (distSq > 1.35) continue;
          const zoneFalloff = 1 - distSq / 1.35;

          // Dual-harmonic ocean wave facet simulation
          const waveA = Math.sin(px * 0.024 + py * 0.016 + time * 2.2);
          const waveB = Math.cos(px * 0.015 - py * 0.028 + time * 1.7);
          const facetTilt = (waveA + waveB) * 0.5;
          if (facetTilt <= 0.40) continue;

          const flare = (facetTilt - 0.40) / 0.60;
          const glintP = Math.pow(flare, 2.2) * zoneFalloff * activeGlintPower;
          if (glintP < 0.035) continue;

          // Render glistening diamond/droplet ripple highlight
          const glintW = 4.5 + glintP * 14;
          const glintH = 1.8 + glintP * 3.2;
          const alpha = Math.min(0.48, glintP * (isDay ? 0.52 : 0.38)).toFixed(3);

          ctx.fillStyle = `rgba(${glintCfg[0]}, ${glintCfg[1]}, ${glintCfg[2]}, ${alpha})`;
          ctx.beginPath();
          ctx.ellipse(px, py, glintW, glintH, -0.28, 0, Math.PI * 2);
          ctx.fill();

          // Brilliant diamond spark at peak specular facets
          if (glintP > 0.22 && isDay) {
            const coreAlpha = Math.min(0.75, glintP * 0.85).toFixed(3);
            ctx.fillStyle = `rgba(255, 255, 255, ${coreAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, Math.min(2.2, glintP * 2.8), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }
  }

  // Render Cosmic Meteors / Shooting Stars across Mirror Ocean
  if (typeof dayNightState !== 'undefined' && dayNightState.cosmicMeteors && dayNightState.cosmicMeteors.length > 0) {
    ctx.save();
    for (let m = 0; m < dayNightState.cosmicMeteors.length; m++) {
      const met = dayNightState.cosmicMeteors[m];
      const prog = met.life / met.maxLife; // 1 to 0
      const a = (Math.sin(prog * Math.PI) * 0.88).toFixed(3);
      const angle = Math.atan2(met.vy, met.vx);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      // Meteor Head Glow
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(met.x, met.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Radiant Star Trail
      const grad = ctx.createLinearGradient(met.x, met.y, met.x - cosA * met.len, met.y - sinA * met.len);
      grad.addColorStop(0, `${met.color}${a})`);
      grad.addColorStop(1, `${met.color}0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(met.x, met.y);
      ctx.lineTo(met.x - cosA * met.len, met.y - sinA * met.len);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Render Drifting Ambient Sea Fog Clouds using pre-rendered texture sprite
  const mistSprite = getMistSprite(biome.isBloodSea);
  entities.ambientMist.forEach(m => {
    if (m.x + m.radius > viewLeft && m.x - m.radius < viewRight &&
        m.y + m.radius > viewTop && m.y - m.radius < viewBottom) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, m.alpha * 1.3));
      ctx.drawImage(mistSprite, m.x - m.radius, m.y - m.radius, m.radius * 2, m.radius * 2);
      ctx.restore();
    }
  });

  // Render Organic Archipelago Islands
  WORLD_ISLANDS.forEach(isl => {
    if (isl.x + isl.radius + 50 > viewLeft && isl.x - isl.radius - 50 < viewRight &&
        isl.y + isl.radius + 50 > viewTop && isl.y - isl.radius - 50 < viewBottom) {
      drawWorldIsland(ctx, isl);
    }
  });

  // Render Sunken Ships (High-Fidelity Wreck)
  entities.sunkenShips.forEach(s => {
    if (!isVisible(s.x, s.y, 200)) return;
    drawSunkenShip(ctx, s)
  });

  // Render Spiked Floating Sea Mines (Iron Islands)
  entities.spikedMines.forEach(sm => {
    if (!isVisible(sm.x, sm.y, 100)) return;
    drawSpikedMine(ctx, sm)
  });

  // Render Occult Watchtowers (Mist Atoll)
  entities.towers.forEach(tw => {
    if (!isVisible(tw.x, tw.y, 200)) return;
    drawIslandDefense(ctx, tw);
  });

  // Render Ancient Leviathan Whirlpools
  if (entities.whirlpools && entities.whirlpools.length > 0) {
    entities.whirlpools.forEach(wp => {
      if (!isVisible(wp.x, wp.y, wp.radius + 50)) return;
      ctx.save();
      ctx.translate(wp.x, wp.y);
      const rot = (_now * 0.005);
      ctx.rotate(rot);

      const wpGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, wp.radius);
      wpGrad.addColorStop(0, 'rgba(15, 5, 15, 0.95)');
      wpGrad.addColorStop(0.5, 'rgba(69, 10, 10, 0.65)');
      wpGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = wpGrad;
      ctx.beginPath();
      ctx.arc(0, 0, wp.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(254, 205, 211, 0.7)';
      ctx.lineWidth = 2.2;
      for (let a = 0; a < 3; a++) {
        ctx.beginPath();
        const startAng = (a / 3) * Math.PI * 2;
        for (let r = 8; r < wp.radius; r += 4) {
          const theta = startAng + (r / wp.radius) * Math.PI * 2.8;
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;
          if (r === 8) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Render Kraken Abyssal Ink Clouds
  if (entities.inkClouds && entities.inkClouds.length > 0) {
    entities.inkClouds.forEach(ic => {
      if (!isVisible(ic.x, ic.y, ic.radius + 50)) return;
      ctx.save();
      ctx.translate(ic.x, ic.y);
      const alpha = Math.max(0, Math.min(1, ic.life / (ic.maxLife || 4.5)));

      const inkGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, ic.radius);
      inkGrad.addColorStop(0, `rgba(15, 5, 25, ${(0.92 * alpha).toFixed(2)})`);
      inkGrad.addColorStop(0.65, `rgba(45, 10, 35, ${(0.65 * alpha).toFixed(2)})`);
      inkGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = inkGrad;
      ctx.beginPath();
      ctx.arc(0, 0, ic.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let b = 0; b < 6; b++) {
        const bAng = (b / 6) * Math.PI * 2 + (ic.seed || 0);
        const bDist = ic.radius * 0.65;
        ctx.fillStyle = `rgba(10, 2, 15, ${(0.7 * alpha).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(Math.cos(bAng) * bDist, Math.sin(bAng) * bDist, ic.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // Render Player Mines
  entities.mines.forEach(m => {
    if (!isVisible(m.x, m.y, 50)) return;
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(m.x, m.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Render Floating Loots, Cargo Crates, Mystic Orbs & Message Bottles
  entities.floatingLoots.forEach(loot => {
    if (!isVisible(loot.x, loot.y, 50)) return;

    // Sinking / Despawn warning blink
    let alpha = 1.0;
    if (loot.life !== undefined && loot.life < 8) {
      alpha = Math.sin(loot.life * 8) > 0 ? 0.95 : 0.35;
    }

    const waveAnim = _now * 0.003 + (loot.bobOffset || 0);
    const bob = Math.sin(waveAnim) * 2.8;
    const tilt = Math.sin(waveAnim * 0.75) * 0.12;

    ctx.save();
    ctx.translate(loot.x, loot.y);
    ctx.globalAlpha = alpha;

    // 1. Water displacement froth ring & ambient ocean shadow
    const frothRadius = 11 + Math.sin(waveAnim * 1.6) * 2.2;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.32)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(0, 4.5, frothRadius, frothRadius * 0.44, 0, 0, Math.PI * 2);
    ctx.stroke();

    const lootShadowX = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecX === 'number' && !isNaN(dayNightState.shadowVecX)) ? (dayNightState.shadowVecX * 0.3) : 0;
    const lootShadowY = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowVecY === 'number' && !isNaN(dayNightState.shadowVecY)) ? (dayNightState.shadowVecY * 0.3) : 3;
    const lootShadowA = (typeof dayNightState !== 'undefined' && typeof dayNightState.shadowAlpha === 'number' && !isNaN(dayNightState.shadowAlpha)) ? (dayNightState.shadowAlpha * 0.85) : 0.45;
    ctx.fillStyle = `rgba(2, 6, 23, ${lootShadowA.toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(lootShadowX, lootShadowY, 8.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Apply vertical buoyant wave bob and roll tilt
    ctx.translate(0, bob);
    ctx.rotate(tilt + ((loot.rot || 0) * 0.05));

    if (loot.type === 'bottle') {
      // Glass bottle body
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 2, 6, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bottle neck & cork
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(-2.5, -9, 5, 5);
      ctx.strokeRect(-2.5, -9, 5, 5);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-2, -12, 4, 3);

      // Rolled parchment treasure map inside
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2, 0, 4, 7);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-2, 0, 4, 7);
    } else if (loot.type === 'chest') {
      // Ornate Batavia Mahogany Chest
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.3;
      ctx.fillRect(-8.5, -4, 17, 10);
      ctx.strokeRect(-8.5, -4, 17, 10);

      // Domed Rounded Lid
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.ellipse(0, -4, 8.5, 4.2, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Polished Gold Brass Strips
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-6.5, -8, 2.4, 14);
      ctx.fillRect(4.1, -8, 2.4, 14);

      // Golden Lock Clasp & Keyhole
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-0.5, 0, 1, 1.8);

      // Shimmering Golden Sparkles
      const sparkle = (Math.sin(_now * 0.006 + (loot.bobOffset || 0)) + 1) * 0.5;
      ctx.fillStyle = `rgba(254, 240, 138, ${0.4 + sparkle * 0.6})`;
      ctx.beginPath();
      ctx.arc(5, -6, 1.2 + sparkle * 1.4, 0, Math.PI * 2);
      ctx.arc(-5, 4, 1.0 + sparkle * 1.0, 0, Math.PI * 2);
      ctx.fill();
    } else if (loot.type === 'gold') {
      // Leather Coin Purse / Gold Pouch with Gilded Strings
      ctx.fillStyle = '#854d0e';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 1, 7.5, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pouch neck ruffle
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(4, -5);
      ctx.lineTo(5.5, -9);
      ctx.lineTo(-5.5, -9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gold drawstring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-4.5, -5);
      ctx.lineTo(4.5, -5);
      ctx.stroke();

      // Gilded Coin Emblem
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 1.5, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else if (['mistOrb', 'snowOrb', 'firePowder', 'chitin', 'krakenInk', 'leviathanBone'].includes(loot.type)) {
      // Faction Special Relic Crate with Ethereal Elemental Aura
      let auraColor = 'rgba(6, 182, 212, 0.4)';
      let coreColor = '#0891b2';
      let runeSymbol = '✦';

      if (loot.type === 'snowOrb') {
        auraColor = 'rgba(56, 189, 248, 0.45)';
        coreColor = '#0284c7';
        runeSymbol = '❄';
      } else if (loot.type === 'firePowder') {
        auraColor = 'rgba(244, 63, 94, 0.45)';
        coreColor = '#e11d48';
        runeSymbol = '▲';
      } else if (loot.type === 'chitin') {
        auraColor = 'rgba(225, 29, 72, 0.5)';
        coreColor = '#9f1239';
        runeSymbol = '◆';
      } else if (loot.type === 'krakenInk') {
        auraColor = 'rgba(99, 102, 241, 0.55)';
        coreColor = '#4f46e5';
        runeSymbol = '✦';
      } else if (loot.type === 'leviathanBone') {
        auraColor = 'rgba(241, 245, 249, 0.65)';
        coreColor = '#94a3b8';
        runeSymbol = '◈';
      }

      // Pulsing outer elemental aura
      const auraPulse = (Math.sin(_now * 0.005 + (loot.bobOffset || 0)) + 1) * 0.5;
      ctx.fillStyle = auraColor;
      ctx.beginPath();
      ctx.arc(0, 0, 11 + auraPulse * 4, 0, Math.PI * 2);
      ctx.fill();

      // Dark reinforced runic crate
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 1.5;
      ctx.fillRect(-7.5, -7.5, 15, 15);
      ctx.strokeRect(-7.5, -7.5, 15, 15);

      // Glowing corner runes
      ctx.fillStyle = coreColor;
      ctx.fillRect(-6.5, -6.5, 3, 3);
      ctx.fillRect(3.5, -6.5, 3, 3);
      ctx.fillRect(-6.5, 3.5, 3, 3);
      ctx.fillRect(3.5, 3.5, 3, 3);

      // Central glowing elemental glyph
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(runeSymbol, 0, 0.5);
    } else {
      // Sturdy Nautical Cargo Timber Crate (Wood, Iron, Rope, Bamboo, Repair, Sailcloth, Bronze)
      let crateBase = '#78350f'; // Oak planks
      let bandColor = '#334155'; // Iron straps
      let symbolColor = '#fde68a';

      if (loot.type === 'bamboo') {
        crateBase = '#3f6212'; // Bamboo greenish weave
        bandColor = '#14532d';
        symbolColor = '#bef264';
      } else if (loot.type === 'iron') {
        crateBase = '#475569'; // Steel reinforced
        bandColor = '#0f172a';
        symbolColor = '#cbd5e1';
      } else if (loot.type === 'bronze') {
        crateBase = '#92400e'; // Forged bronze alloy
        bandColor = '#78350f';
        symbolColor = '#fde047';
      } else if (loot.type === 'sailCloth') {
        crateBase = '#cbd5e1'; // Canvas cloth bale
        bandColor = '#64748b';
        symbolColor = '#0284c7';
      } else if (loot.type === 'rope') {
        crateBase = '#713f12';
        bandColor = '#b45309';
        symbolColor = '#fef08a';
      } else if (loot.type === 'repair') {
        crateBase = '#065f46'; // Emergency field repair
        bandColor = '#022c22';
        symbolColor = '#34d399';
      }

      // Main wooden crate body
      ctx.fillStyle = crateBase;
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.3;
      ctx.fillRect(-7.5, -7.5, 15, 15);
      ctx.strokeRect(-7.5, -7.5, 15, 15);

      // Horizontal plank separation lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-7, -2.5);
      ctx.lineTo(7, -2.5);
      ctx.moveTo(-7, 2.5);
      ctx.lineTo(7, 2.5);
      ctx.stroke();

      // Iron / Hemp cross-bracing straps
      ctx.strokeStyle = bandColor;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-7.5, -7.5, 15, 15);
      ctx.beginPath();
      ctx.moveTo(-7.5, -7.5);
      ctx.lineTo(7.5, 7.5);
      ctx.moveTo(7.5, -7.5);
      ctx.lineTo(-7.5, 7.5);
      ctx.stroke();

      // Corner rivet dots
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-6.5, -6.5, 1.5, 1.5);
      ctx.fillRect(5, -6.5, 1.5, 1.5);
      ctx.fillRect(-6.5, 5, 1.5, 1.5);
      ctx.fillRect(5, 5, 1.5, 1.5);

      // Center resource identifier badge
      ctx.fillStyle = symbolColor;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  // Render Sea Ripples & Water Trails
  entities.seaRipples.forEach(r => {
    if (!isVisible(r.x, r.y, 50)) return;
    const strokeColor = r.color ? `${r.color}${r.alpha})` : `rgba(255, 255, 255, ${r.alpha})`;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Render Leviathan Whirlpools (Water Hazard)
  if (entities.whirlpools) {
    entities.whirlpools.forEach(w => {
      if (!isVisible(w.x, w.y, w.radius + 50)) return;
      ctx.save();
      ctx.translate(w.x, w.y);
      const lifeRatio = Math.max(0, w.life / (w.maxLife || 6.5));
      const wAlpha = Math.min(1, lifeRatio * 1.5) * 0.75;
      const spin = (w.angle || 0) + (_now * 0.004);
      ctx.rotate(spin);

      // Spiral arms
      ctx.strokeStyle = `rgba(14, 165, 233, ${wAlpha.toFixed(2)})`;
      ctx.lineWidth = 2.5;
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        const baseAng = (arm * Math.PI * 2) / 3;
        for (let r = 12; r < w.radius; r += 6) {
          const a = baseAng + r * 0.07;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (r === 12) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Dark vortex core
      ctx.fillStyle = `rgba(2, 6, 23, ${(wAlpha * 0.95).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(56, 189, 248, ${wAlpha.toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    });
  }

  // Render Kraken Ink Clouds (Water Hazard)
  if (entities.inkClouds) {
    entities.inkClouds.forEach(c => {
      if (!isVisible(c.x, c.y, c.radius + 50)) return;
      ctx.save();
      ctx.translate(c.x, c.y);
      const lifeRatio = Math.max(0, c.life / (c.maxLife || 5.5));
      const cAlpha = Math.min(0.85, lifeRatio * 1.2) * 0.85;

      // Dark expanding ink plume
      ctx.fillStyle = `rgba(15, 23, 42, ${cAlpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(0, 0, c.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Outer billows
      ctx.fillStyle = `rgba(2, 6, 23, ${(cAlpha * 0.8).toFixed(2)})`;
      for (let b = 0; b < 6; b++) {
        const bAng = (b * Math.PI * 2) / 6 + (c.seed || 0);
        const bx = Math.cos(bAng) * (c.radius * 0.45);
        const by = Math.sin(bAng) * (c.radius * 0.45);
        ctx.beginPath();
        ctx.arc(bx, by, c.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // Render Subsurface Leviathan Shadow (Bayangan Purba Melintas di Bawah Air)
  if (typeof subsurfaceShadow !== 'undefined' && subsurfaceShadow.active && isVisible(subsurfaceShadow.x, subsurfaceShadow.y, 250)) {
    ctx.save();
    ctx.translate(subsurfaceShadow.x, subsurfaceShadow.y);
    ctx.rotate(subsurfaceShadow.heading);
    const lifeRatio = subsurfaceShadow.progress / subsurfaceShadow.maxDuration;
    const shadowAlpha = Math.sin(lifeRatio * Math.PI) * 0.36;
    ctx.fillStyle = `rgba(3, 7, 18, ${shadowAlpha})`;

    // Undulating colossal body
    ctx.beginPath();
    ctx.ellipse(0, 0, subsurfaceShadow.length * 0.5, subsurfaceShadow.width * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leviathan flipper fins
    ctx.beginPath();
    ctx.ellipse(-12, -subsurfaceShadow.width * 0.52, 28, 14, 0.4, 0, Math.PI * 2);
    ctx.ellipse(-12, subsurfaceShadow.width * 0.52, 28, 14, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Tail fin
    const tailWiggle = Math.sin(_now * 0.005) * 12;
    ctx.beginPath();
    ctx.moveTo(-subsurfaceShadow.length * 0.46, 0);
    ctx.lineTo(-subsurfaceShadow.length * 0.64, -26 + tailWiggle);
    ctx.lineTo(-subsurfaceShadow.length * 0.64, 26 + tailWiggle);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Render Sinking Ships in death sequence
  entities.sinkingShips.forEach(s => {
    if (!isVisible(s.x, s.y, 200)) return;
    drawSinkingShip(ctx, s)
  });

  // Render Mist Occult Ritual Circles
  renderMistRituals(ctx);

  // Render Merchant Shipping Vessels & Convoys
  if (entities.merchants) {
    entities.merchants.forEach(m => {
      if (!isVisible(m.x, m.y, 300)) return;
      drawMerchantShip(ctx, m);
    });
  }

  // Render Enemy Ships
  entities.enemies.forEach(e => {
    if (!isVisible(e.x, e.y, 300)) return;
    // In Dense Fog (Zone >= 62,000m), player can only see their own ship; enemy ships are completely hidden
    if (typeof weatherState !== 'undefined' && weatherState.type === 'dense_fog' && weatherState.intensity > 0.35) {
      const dToPlayer = Math.hypot(e.x - playerState.x, e.y - playerState.y);
      if (dToPlayer > 55) return; // Completely invisible outside collision distance
    }
    drawVectorShip(ctx, e, false);
  });

  // Render Player Ship
  const tierInfo = getShipTier();
  drawVectorShip(ctx, playerState, true, tierInfo.rank);

  // Render Harbor Docking Aura & Prompt
  if (playerState.isDockedAtPort && playerState.dockedPort) {
    const port = playerState.dockedPort;
    ctx.save();
    ctx.translate(playerState.x, playerState.y);
    const auraPulse = Math.sin(_now * 0.004) * 4 + 36;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, auraPulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 9px "Cinzel", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    ctx.fillText(`BERLABUH DI ${port.name.toUpperCase()}`, 0, -40);
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText("Galangan Kapal Siap [U]", 0, -30);
    ctx.restore();
  }

  // Render Projectiles
  entities.projectiles.forEach(p => {
    if (!isVisible(p.x, p.y, 50)) return;
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.type === 'cannonball' || !p.type) {
      const ballRad = p.radius || 4;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(1.5, 3, ballRad, 0, Math.PI * 2);
      ctx.fill();

      const ironGrad = ctx.createRadialGradient(-ballRad * 0.35, -ballRad * 0.35, 1, 0, 0, ballRad);
      ironGrad.addColorStop(0, '#94a3b8');
      ironGrad.addColorStop(0.35, '#475569');
      ironGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = ironGrad;
      ctx.beginPath();
      ctx.arc(0, 0, ballRad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      ctx.stroke();

    } else if (p.type === 'spirit') {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius || 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(-1, -1, (p.radius || 6) * 0.45, 0, Math.PI * 2);
      ctx.fill();

    } else if (p.type === 'spike') {
      ctx.rotate(p.angle || 0);
      ctx.fillStyle = '#881337';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-6, -3.5);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    } else if (p.type === 'iron_harpoon') {
      ctx.rotate(p.angle || 0);
      // Heavy barbed iron bolt
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(2, -4);
      ctx.lineTo(4, -1.5);
      ctx.lineTo(-8, -1.5);
      ctx.lineTo(-8, 1.5);
      ctx.lineTo(4, 1.5);
      ctx.lineTo(2, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Trailing steam / chain cord
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-18, 0);
      ctx.stroke();

    } else if (p.type === 'blood_bile') {
      // Corrosive blood globule
      ctx.fillStyle = 'rgba(225, 29, 72, 0.9)';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius || 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(-1.5, -1.5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (p.type === 'frost_axe') {
      // Spinning Norse Frost Throwing Battleaxe (Compact & High-RPM)
      const spin = (p.angle || 0) + (p.spinAngle !== undefined ? p.spinAngle : (_now * 0.025));
      ctx.rotate(spin);

      // Compact Ash Wood Handle (10px long, 1.8px wide)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-0.9, -5, 1.8, 10);

      // Leather Grip Wrap
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-1.1, 0, 2.2, 2.8);

      // Norse Bearded Steel Blades (Compact 3.0px crescent)
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.9;

      // Right Blade
      ctx.beginPath();
      ctx.arc(3.6, -2.6, 3.0, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(0, -2.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Left Blade
      ctx.beginPath();
      ctx.arc(-3.6, -2.6, 3.0, Math.PI * 0.5, -Math.PI * 0.5);
      ctx.lineTo(0, -2.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center Runic Frost Core
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -2.6, 1.2, 0, Math.PI * 2);
      ctx.fill();

    } else if (p.type === 'rocket_arrow') {
      // Wokou Firework Rocket Arrow
      ctx.rotate(p.angle || 0);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(6, -3);
      ctx.lineTo(6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6, -2.5, 8, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-12 - Math.random() * 5, 0);
      ctx.lineTo(-6, 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  });

  // Render Particles
  const particlesByColor = {};
  entities.particles.forEach(p => {
    if (!isVisible(p.x, p.y, 20)) return;
    (particlesByColor[p.color] || (particlesByColor[p.color] = [])).push(p);
  });
  for (const color in particlesByColor) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const group = particlesByColor[color];
    for (let i = 0; i < group.length; i++) {
      const p = group[i];
      ctx.moveTo(p.x + p.size, p.y);
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Render Floating Combat Numbers
  entities.floatingTexts.forEach(ft => {
    if (!isVisible(ft.x, ft.y, 50)) return;
    ctx.save();
    ctx.font = ft.isCrit ? '900 13px "Cinzel", sans-serif' : 'bold 11px sans-serif';
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.textAlign = 'center';
    const prevFill = ctx.fillStyle;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
    ctx.fillStyle = prevFill;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });

  // Render Oceanic Seagulls overhead
  if (entities.seagulls) {
    entities.seagulls.forEach(s => {
      if (!isVisible(s.x, s.y, 100)) return;
      drawSeagull(ctx, s);
    });
  }

  // Render Cinematic Seagull if active flight sequence
  if (window.cinematicFlightState && window.cinematicFlightState.active && window.cinematicFlightState.seagull) {
    drawSeagull(ctx, window.cinematicFlightState.seagull);
  }

  // Render Rolling Cloud Shadows across All Weather Events (100% Pop-Free & Mobile-Optimized)
  if (typeof weatherState !== 'undefined' && weatherState.intensity > 0.02) {
    const weatherType = weatherState.type || 'clear';
    let baseCloudAlpha = 0;
    if (weatherType === 'overcast') baseCloudAlpha = 0.28;
    else if (weatherType === 'rain') baseCloudAlpha = 0.32;
    else if (weatherType === 'gale') baseCloudAlpha = 0.30;
    else if (weatherType === 'storm') baseCloudAlpha = 0.40;
    else if (weatherType === 'thunderstorm') baseCloudAlpha = 0.48;
    else if (weatherType === 'blood_tempest') baseCloudAlpha = 0.52;
    else if (weatherType === 'mist') baseCloudAlpha = 0.22;
    else if (weatherType === 'dense_fog') baseCloudAlpha = 0.26;

    const finalCloudAlpha = baseCloudAlpha * weatherState.intensity;

    if (finalCloudAlpha > 0.01) {
      const isBlood = (weatherType === 'blood_tempest') || Boolean(biome && biome.isBloodSea);
      const sprite = getCloudShadowSprite(isBlood);

      // Cloud drift velocity vector along wind
      const effWind = (typeof windAngle !== 'undefined') ? windAngle : 0.5;
      const windSpeedMult = (weatherType === 'gale' || weatherType === 'storm' || weatherType === 'blood_tempest') ? 1.4 : 1.0;
      const baseSpeed = 22 * windSpeedMult;
      const driftX = Math.cos(effWind) * baseSpeed * time;
      const driftY = Math.sin(effWind) * baseSpeed * time;

      const halfPX = CLOUD_PERIOD_X * 0.5;
      const halfPY = CLOUD_PERIOD_Y * 0.5;
      const fadeStart = CLOUD_PERIOD_X * 0.36; // ~1008px
      const fadeEnd = CLOUD_PERIOD_X * 0.48;   // ~1344px

      for (let c = 0; c < CLOUD_SHADOW_DEFS.length; c++) {
        const cDef = CLOUD_SHADOW_DEFS[c];
        const worldX = cDef.x + driftX * cDef.spd;
        const worldY = cDef.y + driftY * cDef.spd;

        // Continuous wrapping relative to camera/player center (zero grid snaps, zero pop)
        const relX = ((worldX - playerState.x) % CLOUD_PERIOD_X + CLOUD_PERIOD_X * 1.5) % CLOUD_PERIOD_X - halfPX;
        const relY = ((worldY - playerState.y) % CLOUD_PERIOD_Y + CLOUD_PERIOD_Y * 1.5) % CLOUD_PERIOD_Y - halfPY;
        const cx = playerState.x + relX;
        const cy = playerState.y + relY;

        // Radial distance falloff towards wrapping boundary: guarantees 0% edge pop
        const distFromCam = Math.hypot(relX, relY);
        if (distFromCam >= fadeEnd) continue;

        // Frustum cull if outside camera viewport + buffer
        if (!isVisible(cx, cy, cDef.w * 0.55)) continue;

        let edgeFade = 1.0;
        if (distFromCam > fadeStart) {
          edgeFade = 1.0 - (distFromCam - fadeStart) / (fadeEnd - fadeStart);
        }

        const alpha = finalCloudAlpha * edgeFade;
        if (alpha <= 0.005) continue;

        // Draw cloud shadow with GPU texture blit
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(cDef.rot);
        ctx.drawImage(sprite, -cDef.w * 0.5, -cDef.h * 0.5, cDef.w, cDef.h);
        ctx.restore();
      }
    }
  }

  // Render Telegraphed & Active Lightning Strikes in World Space
  if (typeof weatherState !== 'undefined' && weatherState.activeStrikes && weatherState.activeStrikes.length > 0) {
    weatherState.activeStrikes.forEach(s => {
      if (!isVisible(s.x, s.y, 350)) return;
      ctx.save();
      const isBlood = Boolean(s.isBlood);

      if (!s.hasStruck) {
        // Warning circle on ocean surface with crackling telegraph arcs
        const progress = Math.max(0, 1 - (s.timer / 1.25));
        const pulse = Math.sin(_now * 0.02) * 4;
        const blastRadius = 75;

        ctx.strokeStyle = isBlood ? 'rgba(239, 68, 68, 0.85)' : 'rgba(254, 240, 138, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, blastRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Expanding inner warning disc
        ctx.fillStyle = isBlood 
          ? `rgba(225, 29, 72, ${(0.15 + progress * 0.28).toFixed(2)})` 
          : `rgba(253, 224, 71, ${(0.15 + progress * 0.28).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, blastRadius * progress, 0, Math.PI * 2);
        ctx.fill();

        // Telegraph sparks
        for (let a = 0; a < 4; a++) {
          const sparkAng = (a / 4) * Math.PI * 2 + progress * 4;
          const sx = s.x + Math.cos(sparkAng) * (blastRadius + pulse);
          const sy = s.y + Math.sin(sparkAng) * (blastRadius + pulse);
          ctx.strokeStyle = isBlood ? '#fda4af' : '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (Math.random() - 0.5) * 16, sy + (Math.random() - 0.5) * 16);
          ctx.stroke();
        }
      } else {
        // Lightning bolt striking down from the sky!
        if (s.branches && s.branches.length > 1) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = isBlood ? '#ef4444' : '#67e8f9';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(s.branches[0].x, s.branches[0].y);
          for (let b = 1; b < s.branches.length; b++) {
            ctx.lineTo(s.branches[b].x, s.branches[b].y);
          }
          ctx.stroke();

          // Outer lightning halo
          ctx.strokeStyle = isBlood ? '#dc2626' : '#38bdf8';
          ctx.lineWidth = 7;
          ctx.globalAlpha = 0.55;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Impact shockwave circle
        ctx.fillStyle = isBlood ? 'rgba(254, 205, 211, 0.85)' : 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 24, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  ctx.restore();

  // Blood Sea Vignette
  if (biome.bloodRatio > 0.05) {
    const vignetteAlpha = 0.45 * biome.bloodRatio;
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    const bloodGrad = ctx.createRadialGradient(
      width / 2, height / 2, minDim * (0.55 - biome.bloodRatio * 0.2),
      width / 2, height / 2, maxDim * 0.65
    );
    bloodGrad.addColorStop(0, 'rgba(180, 0, 0, 0)');
    bloodGrad.addColorStop(1, `rgba(160, 5, 15, ${vignetteAlpha})`);
    ctx.fillStyle = bloodGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Kraken Ink Blindness Screen Overlay
  if (playerState.inkedTimer && playerState.inkedTimer > 0) {
    const inkAlpha = Math.min(0.88, playerState.inkedTimer * 0.22 + 0.35);
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    const inkGrad = ctx.createRadialGradient(
      width / 2, height / 2, minDim * 0.18,
      width / 2, height / 2, maxDim * 0.72
    );
    inkGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    inkGrad.addColorStop(0.5, `rgba(15, 5, 25, ${(inkAlpha * 0.7).toFixed(2)})`);
    inkGrad.addColorStop(1, `rgba(5, 2, 10, ${inkAlpha.toFixed(2)})`);
    ctx.fillStyle = inkGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = `rgba(10, 2, 15, ${(inkAlpha * 0.75).toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(width * 0.22, height * 0.28, 48, 32, 0.4, 0, Math.PI * 2);
    ctx.ellipse(width * 0.82, height * 0.32, 42, 28, -0.3, 0, Math.PI * 2);
    ctx.ellipse(width * 0.3, height * 0.78, 55, 36, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // =========================================================================
  // WEATHER ENVIRONMENTAL SCREEN OVERLAYS & PRECIPITATION
  // =========================================================================

  // 1. Render Multi-Layer Rain, Blood Rain, Splash Ripples & Sea Haze
  if (typeof weatherState !== 'undefined' && weatherState.intensity > 0.05) {
    const activeCfg = (typeof WEATHER_CONFIGS !== 'undefined') ? (WEATHER_CONFIGS[weatherState.type] || WEATHER_CONFIGS.clear) : null;
    if (activeCfg && activeCfg.rainDensity > 0) {
      ctx.save();
      const isBlood = Boolean(activeCfg.isBlood);
      const intensity = weatherState.intensity;
      const rainDensity = activeCfg.rainDensity;
      const effectiveWind = (typeof windAngle !== 'undefined') ? windAngle : 0.5;
      const rainAngle = effectiveWind + Math.PI * 0.12;
      const cosA = Math.cos(rainAngle);
      const sinA = Math.sin(rainAngle);
      const speedX = cosA * 24;
      const speedY = sinA * 24 + 20;

      // Layer A: Background Fine Drizzle (Tirai gerimis halus latar belakang)
      const bgCount = Math.floor(65 * rainDensity * intensity);
      ctx.strokeStyle = isBlood 
        ? `rgba(225, 29, 72, ${(0.22 * intensity).toFixed(2)})`
        : `rgba(203, 213, 225, ${(0.20 * intensity).toFixed(2)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let r = 0; r < bgCount; r++) {
        const rx = ((r * 113.7 + time * 520 * cosA) % width + width) % width;
        const ry = ((r * 197.3 + time * 720) % height + height) % height;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - speedX * 0.4, ry - speedY * 0.4);
      }
      ctx.stroke();

      // Layer B: Foreground Crisp Rain Drops (Butiran hujan tajam berkecepatan tinggi)
      const fgCount = Math.floor(50 * rainDensity * intensity);
      ctx.strokeStyle = isBlood 
        ? `rgba(251, 113, 133, ${(0.52 * intensity).toFixed(2)})`
        : `rgba(241, 245, 249, ${(0.42 * intensity).toFixed(2)})`;
      ctx.lineWidth = isBlood ? 1.6 : 1.2;
      ctx.beginPath();
      for (let r = 0; r < fgCount; r++) {
        const rx = ((r * 157.1 + time * 820 * cosA) % width + width) % width;
        const ry = ((r * 283.5 + time * 1050) % height + height) % height;
        const dropLen = 0.65 + ((r % 5) * 0.08);
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - speedX * dropLen, ry - speedY * dropLen);
      }
      ctx.stroke();

      // Layer C: Sea Surface Splash Ripples & Droplet Micro-Crowns (Riak benturan air laut)
      const splashCount = Math.min(22, Math.floor(16 * rainDensity * intensity));
      for (let s = 0; s < splashCount; s++) {
        const cycle = ((time * 2.4 + s * 0.161) % 1.0);
        const sx = ((s * 211.3 + (s % 3) * 60) % width + width) % width;
        const sy = ((s * 137.9 + (s % 5) * 80) % height + height) % height;
        const rippleRadX = 2.0 + cycle * 7.5;
        const rippleRadY = rippleRadX * 0.42;
        const rippleAlpha = (1.0 - cycle) * (isBlood ? 0.38 : 0.28) * intensity;

        ctx.strokeStyle = isBlood 
          ? `rgba(244, 63, 94, ${rippleAlpha.toFixed(2)})` 
          : `rgba(224, 242, 254, ${rippleAlpha.toFixed(2)})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.ellipse(sx, sy, rippleRadX, rippleRadY, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Tiny bounce droplet on surface impact
        if (cycle < 0.45) {
          const bounceH = Math.sin((cycle / 0.45) * Math.PI) * 3.5;
          ctx.fillStyle = isBlood ? 'rgba(254, 205, 211, 0.45)' : 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.arc(sx, sy - bounceH, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Layer D: Humid Sea-Surface Rain Spray & Vapor Haze
      const rainHaze = ctx.createLinearGradient(0, height * 0.5, 0, height);
      rainHaze.addColorStop(0, 'rgba(0, 0, 0, 0)');
      rainHaze.addColorStop(1, isBlood 
        ? `rgba(136, 19, 55, ${(0.14 * intensity).toFixed(2)})` 
        : `rgba(186, 230, 253, ${(0.08 * intensity).toFixed(2)})`);
      ctx.fillStyle = rainHaze;
      ctx.fillRect(0, height * 0.5, width, height * 0.5);

      ctx.restore();
    }
  }

  // 2. Wind Breeze Streamlines & Ocean Spray (Noticeable, sleek, and non-intrusive)
  if (typeof weatherState !== 'undefined' && weatherState.intensity > 0.05) {
    const activeCfg = (typeof WEATHER_CONFIGS !== 'undefined') ? (WEATHER_CONFIGS[weatherState.type] || WEATHER_CONFIGS.clear) : null;
    const isWindyWeather = activeCfg && (activeCfg.hasWindDrift || activeCfg.id === 'gale' || activeCfg.id === 'storm' || activeCfg.id === 'thunderstorm' || activeCfg.id === 'blood_tempest');
    if (isWindyWeather) {
      ctx.save();
      const windInt = weatherState.intensity;
      const effectiveWind = (typeof windAngle !== 'undefined') ? windAngle : 0.5;
      const cosW = Math.cos(effectiveWind);
      const sinW = Math.sin(effectiveWind);
      const perpX = -sinW;
      const perpY = cosW;
      const streamCount = 7;

      ctx.lineWidth = 1.2;
      for (let w = 0; w < streamCount; w++) {
        const cycle = ((time * 0.38 + w * 0.143) % 1.0);
        const maxDiag = Math.max(width, height) + 300;
        const startDist = -150 + cycle * maxDiag;
        const laneOffset = (((w * 193.7) % height) + height) % height - (height * 0.5);
        
        const cx = width * 0.5 + cosW * startDist + perpX * laneOffset;
        const cy = height * 0.5 + sinW * startDist + perpY * laneOffset;
        
        const lineLen = 110 + (w % 3) * 35;
        const endX = cx + cosW * lineLen;
        const endY = cy + sinW * lineLen;
        
        // Gentle sine undulation curve
        const wave = Math.sin(time * 2.2 + w * 1.6) * 11;
        const midX = (cx + endX) * 0.5 + perpX * wave;
        const midY = (cy + endY) * 0.5 + perpY * wave;

        // Gradient fading at head and tail
        const streamGrad = ctx.createLinearGradient(cx, cy, endX, endY);
        const alphaPeak = (Math.sin(cycle * Math.PI) * 0.22 * windInt).toFixed(2);
        const streamColor = activeCfg.isBlood ? '254, 205, 211' : '224, 242, 254';
        streamGrad.addColorStop(0, `rgba(${streamColor}, 0)`);
        streamGrad.addColorStop(0.3, `rgba(${streamColor}, ${alphaPeak})`);
        streamGrad.addColorStop(1, `rgba(${streamColor}, 0)`);

        ctx.strokeStyle = streamGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();

        // Micro-sea-spray speck at stream head
        const sprayAlpha = (Math.sin(cycle * Math.PI) * 0.35 * windInt).toFixed(2);
        ctx.fillStyle = activeCfg.isBlood ? `rgba(244, 63, 94, ${sprayAlpha})` : `rgba(255, 255, 255, ${sprayAlpha})`;
        ctx.beginPath();
        ctx.arc(endX, endY, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // 3. Volumetric Sea Fog, Ethereal Mist, & Blood Fog Screen Overlays
  if (typeof weatherState !== 'undefined' && weatherState.intensity > 0.05) {
    const isDenseFog = weatherState.type === 'dense_fog';
    const isMist = weatherState.type === 'mist';
    const isBloodFog = weatherState.type === 'blood_tempest';

    if (isDenseFog || isMist || isBloodFog) {
      ctx.save();
      const intensity = weatherState.intensity;
      const minDim = Math.min(width, height);
      const maxDim = Math.max(width, height);
      const effectiveWind = (typeof windAngle !== 'undefined') ? windAngle : 0.5;
      const cosW = Math.cos(effectiveWind);
      const sinW = Math.sin(effectiveWind);

      // A. Player Ship Lantern Volumetric Light Halo (Cahaya lentera menembus kabut)
      const lanternHaloRad = minDim * (isDenseFog ? 0.32 : 0.42);
      const lanternHalo = ctx.createRadialGradient(
        width / 2, height / 2, 18,
        width / 2, height / 2, lanternHaloRad
      );
      if (isBloodFog) {
        lanternHalo.addColorStop(0, `rgba(254, 205, 211, ${(0.16 * intensity).toFixed(2)})`);
        lanternHalo.addColorStop(0.4, `rgba(225, 29, 72, ${(0.06 * intensity).toFixed(2)})`);
      } else if (isMist) {
        lanternHalo.addColorStop(0, `rgba(224, 242, 254, ${(0.18 * intensity).toFixed(2)})`);
        lanternHalo.addColorStop(0.4, `rgba(165, 243, 252, ${(0.07 * intensity).toFixed(2)})`);
      } else {
        lanternHalo.addColorStop(0, `rgba(254, 240, 138, ${(0.18 * intensity).toFixed(2)})`);
        lanternHalo.addColorStop(0.4, `rgba(251, 191, 36, ${(0.06 * intensity).toFixed(2)})`);
      }
      lanternHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lanternHalo;
      ctx.fillRect(0, 0, width, height);

      // B. Cinematic Ambient Oceanic Mist Vignette
      const fogAlpha = Math.min(0.95, intensity * (isDenseFog ? 0.94 : (isBloodFog ? 0.88 : 0.68)));
      const clearRadius = minDim * (isDenseFog ? 0.16 : 0.22);
      const outerRadius = maxDim * 0.65;

      const vignetteGrad = ctx.createRadialGradient(
        width / 2, height / 2, clearRadius,
        width / 2, height / 2, outerRadius
      );

      if (isDenseFog) {
        vignetteGrad.addColorStop(0, 'rgba(226, 232, 240, 0)');
        vignetteGrad.addColorStop(0.32, `rgba(203, 213, 225, ${(0.28 * fogAlpha).toFixed(2)})`);
        vignetteGrad.addColorStop(0.68, `rgba(148, 163, 184, ${(0.68 * fogAlpha).toFixed(2)})`);
        vignetteGrad.addColorStop(1, `rgba(30, 41, 59, ${(0.95 * fogAlpha).toFixed(2)})`);
      } else if (isMist) {
        vignetteGrad.addColorStop(0, 'rgba(224, 242, 254, 0)');
        vignetteGrad.addColorStop(0.35, `rgba(196, 181, 253, ${(0.24 * fogAlpha).toFixed(2)})`);
        vignetteGrad.addColorStop(0.70, `rgba(129, 140, 248, ${(0.52 * fogAlpha).toFixed(2)})`);
        vignetteGrad.addColorStop(1, `rgba(30, 27, 75, ${(0.80 * fogAlpha).toFixed(2)})`);
      } else {
        // Blood Tempest
        vignetteGrad.addColorStop(0, 'rgba(254, 205, 211, 0)');
        vignetteGrad.addColorStop(0.35, `rgba(225, 29, 72, ${(0.34 * fogAlpha).toFixed(2)})`);
        vignetteGrad.addColorStop(0.70, `rgba(159, 18, 57, ${(0.72 * fogAlpha).toFixed(2)})`);
        vignetteGrad.addColorStop(1, `rgba(69, 10, 10, ${(0.94 * fogAlpha).toFixed(2)})`);
      }
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, width, height);

      // C. Volumetric Rolling Sea Fog Banks (Awan kabut bergulung alami bergradien lembut)
      const puffCount = 8;
      const driftSpeed = 32;
      for (let p = 0; p < puffCount; p++) {
        const seed = p * 137.5;
        const speedMult = 0.75 + (p % 3) * 0.22;
        const driftDist = time * driftSpeed * speedMult + seed * 25;
        const wrapW = width + 500;
        const wrapH = height + 500;
        const px = (((seed * 4.3 + cosW * driftDist) % wrapW + wrapW) % wrapW) - 250;
        const py = (((seed * 7.7 + sinW * driftDist) % wrapH + wrapH) % wrapH) - 250;

        // Natural undulating "breathing" puff radius
        const puffRad = 170 + (p % 4) * 45 + Math.sin(time * 0.7 + p * 1.3) * 20;
        const puffGrad = ctx.createRadialGradient(px, py, 12, px, py, puffRad);

        if (isDenseFog) {
          const puffPeak = (0.16 * fogAlpha).toFixed(2);
          puffGrad.addColorStop(0, `rgba(241, 245, 249, ${puffPeak})`);
          puffGrad.addColorStop(0.48, `rgba(203, 213, 225, ${(0.08 * fogAlpha).toFixed(2)})`);
          puffGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
        } else if (isMist) {
          const puffPeak = (0.15 * fogAlpha).toFixed(2);
          puffGrad.addColorStop(0, `rgba(224, 231, 255, ${puffPeak})`);
          puffGrad.addColorStop(0.48, `rgba(165, 180, 252, ${(0.07 * fogAlpha).toFixed(2)})`);
          puffGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        } else {
          const puffPeak = (0.18 * fogAlpha).toFixed(2);
          puffGrad.addColorStop(0, `rgba(225, 29, 72, ${puffPeak})`);
          puffGrad.addColorStop(0.48, `rgba(159, 18, 57, ${(0.08 * fogAlpha).toFixed(2)})`);
          puffGrad.addColorStop(1, 'rgba(76, 5, 25, 0)');
        }

        ctx.fillStyle = puffGrad;
        ctx.beginPath();
        ctx.arc(px, py, puffRad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 4. Fullscreen Lightning Flash
  if (typeof weatherState !== 'undefined' && weatherState.activeStrikes) {
    const striking = weatherState.activeStrikes.find(s => s.hasStruck && s.strikeDuration > 0.12);
    if (striking) {
      ctx.save();
      const flashAlpha = (striking.strikeDuration / 0.28) * 0.55;
      ctx.fillStyle = striking.isBlood ? `rgba(239, 68, 68, ${flashAlpha.toFixed(2)})` : `rgba(255, 255, 255, ${flashAlpha.toFixed(2)})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  // 5. Dynamic Weather HUD Banner (Fade-in and Fade-out announcement below compass)
  if (typeof weatherState !== 'undefined' && weatherState.banner && weatherState.banner.alpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, weatherState.banner.alpha));
    const bannerW = Math.min(380, width * 0.86);
    const bannerH = 46;
    const bannerX = (width - bannerW) / 2;
    const bannerY = 56; // Just below the compass bar

    ctx.fillStyle = 'rgba(8, 14, 26, 0.86)';
    ctx.strokeStyle = (weatherState.type === 'blood_tempest') ? 'rgba(239, 68, 68, 0.75)' : 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = 1.2;

    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
    }

    ctx.textAlign = 'center';
    ctx.font = 'bold 11px "Cinzel", sans-serif';
    ctx.fillStyle = (weatherState.type === 'blood_tempest') ? '#fca5a5' : '#fef08a';
    ctx.fillText(weatherState.banner.text, width / 2, bannerY + 19);

    ctx.font = '9.5px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(weatherState.banner.subtext, width / 2, bannerY + 35);

    ctx.restore();
  }
}
