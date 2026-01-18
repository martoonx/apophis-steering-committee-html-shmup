// APOPHIS - Game State
// All mutable game state lives here

import * as Config from './config.js';

// Canvas and rendering context (set by main.js)
export let canvas = null;
export let ctx = null;

// DOM element references (set by main.js)
export let scoreEl = null;
export let levelEl = null;
export let sectorEl = null;
export let alertEl = null;
export let overlay = null;

// Title screen
export let titleCanvas = null;
export let titleCtx = null;
export let titleStars = [];
export let titleTime = 0;
export let titleAnimationId = null;

// Screen dimensions
export let width = 0;
export let height = 0;

// Core game state
export let gameSpeed = 0.08;
export let score = 0;
export let gameOver = false;
export let time = 0;

// Ship state
export let shipX = 0;
export let shipY = 0;
export let shipAngle = 0;

// Game object arrays
export let bullets = [];
export let enemies = [];
export let particles = [];
export let stars = [];
export let pickups = [];
export let trenchBlocks = [];
export let hearts = [];
export let harassers = [];
export let harasserBullets = [];
export let miniBosses = [];
export let miniBossBullets = [];
export let missiles = [];

// Shield system
export let shieldLevel = 100;
export let shieldActive = false;

// Health system
export let health = 3;
export let lives = 3;
export let deathTimer = 0;
export let respawnTimer = 0;

// Level/chapter progression
export let level = 1;
export let chapter = 1;
export let chapterTimer = 0;

// Boss state
export let bossActive = false;
export let bossDefeatedTimer = 0;
export let bossScoreGained = 0;
export let bossBulletBurst = 0;
export let bossBulletPhase = 0;
export let bossBulletCooldown = 0;

// Transition timers
export let levelTransitionTimer = 0;
export let chapterTransitionTimer = 0;

// Weapons
export let currentWeapon = 0;
export let weaponInventory = [0];

// Boomba system
export let boombaQueue = [];
export let chargingBoomba = false;
export let boombaCharge = 0;

// Invulnerability
export let invulnerabilityTimer = 0;

// Missile system
export let missileAmmo = 3;
export let missileCooldown = 0;

// Frame timing
export let lastFrameTime = 0;
export let accumulator = 0;

// Input state
export const keys = {};

// Gamepad state
export let gamepadConnected = false;
export let gamepad = null;
export let gamepadButtons = {};
export let gamepadPrevButtons = {};
export let debugGamepad = false;

// Audio state (references set by audio.js)
export let audioCtx = null;
export let engineOsc = null;
export let engineGain = null;
export let bossOsc = null;
export let bossGain = null;

// =============================================================================
// State Setters - Functions to modify state from other modules
// =============================================================================

export function setCanvas(c, context) {
    canvas = c;
    ctx = context;
}

export function setDOMElements(elements) {
    scoreEl = elements.scoreEl;
    levelEl = elements.levelEl;
    sectorEl = elements.sectorEl;
    alertEl = elements.alertEl;
    overlay = elements.overlay;
}

export function setTitleCanvas(c, context) {
    titleCanvas = c;
    titleCtx = context;
}

export function setTitleStars(s) { titleStars = s; }
export function setTitleTime(t) { titleTime = t; }
export function incrementTitleTime() { titleTime++; }
export function setTitleAnimationId(id) { titleAnimationId = id; }

export function setDimensions(w, h) {
    width = w;
    height = h;
}

export function setGameSpeed(speed) { gameSpeed = speed; }
export function incrementGameSpeed(amount) { gameSpeed += amount; }
export function setScore(s) { 
    score = s; 
    if (scoreEl) scoreEl.textContent = score;
}
export function addScore(amount) { 
    score += amount; 
    if (scoreEl) scoreEl.textContent = score;
}
export function setGameOver(value) { gameOver = value; }
export function setTime(t) { time = t; }
export function incrementTime() { time++; }

export function setShipPosition(x, y) {
    shipX = x;
    shipY = y;
}
export function setShipX(x) { shipX = x; }
export function setShipY(y) { shipY = y; }
export function setShipAngle(angle) { shipAngle = angle; }
export function adjustShipAngle(delta) { shipAngle += delta; }
export function dampenShipAngle(factor) { shipAngle *= factor; }

export function setBullets(b) { bullets = b; }
export function setEnemies(e) { enemies = e; }
export function setParticles(p) { particles = p; }
export function setStars(s) { stars = s; }
export function setPickups(p) { pickups = p; }
export function setTrenchBlocks(t) { trenchBlocks = t; }
export function setHearts(h) { hearts = h; }
export function setHarassers(h) { harassers = h; }
export function setHarasserBullets(hb) { harasserBullets = hb; }
export function setMiniBosses(mb) { miniBosses = mb; }
export function setMiniBossBullets(mbb) { miniBossBullets = mbb; }
export function setMissiles(m) { missiles = m; }

export function setShieldLevel(level) { shieldLevel = level; }
export function adjustShieldLevel(amount) { shieldLevel = Math.max(0, Math.min(100, shieldLevel + amount)); }
export function setShieldActive(active) { shieldActive = active; }

export function setHealth(h) { health = h; }
export function adjustHealth(amount) { health = Math.max(0, Math.min(Config.MAX_HEALTH, health + amount)); }
export function setLives(l) { lives = l; }
export function adjustLives(amount) { lives += amount; }
export function setDeathTimer(t) { deathTimer = t; }
export function decrementDeathTimer() { if (deathTimer > 0) deathTimer--; }
export function setRespawnTimer(t) { respawnTimer = t; }
export function decrementRespawnTimer() { if (respawnTimer > 0) respawnTimer--; }

export function setLevel(l) { 
    level = l; 
    if (levelEl) levelEl.textContent = level;
}
export function incrementLevel() { 
    level++; 
    if (levelEl) levelEl.textContent = level;
}
export function setChapter(c) { chapter = c; }
export function incrementChapter() { chapter++; }
export function setChapterTimer(t) { chapterTimer = t; }
export function incrementChapterTimer() { chapterTimer++; }

export function setBossActive(active) { bossActive = active; }
export function setBossDefeatedTimer(t) { bossDefeatedTimer = t; }
export function decrementBossDefeatedTimer() { if (bossDefeatedTimer > 0) bossDefeatedTimer--; }
export function setBossScoreGained(s) { bossScoreGained = s; }
export function setBossBulletBurst(b) { bossBulletBurst = b; }
export function incrementBossBulletBurst() { bossBulletBurst++; }
export function setBossBulletPhase(p) { bossBulletPhase = p; }
export function advanceBossBulletPhase() { bossBulletPhase = (bossBulletPhase + 1) % 3; }
export function setBossBulletCooldown(c) { bossBulletCooldown = c; }
export function decrementBossBulletCooldown() { if (bossBulletCooldown > 0) bossBulletCooldown--; }

export function setLevelTransitionTimer(t) { levelTransitionTimer = t; }
export function decrementLevelTransitionTimer() { if (levelTransitionTimer > 0) levelTransitionTimer--; }
export function setChapterTransitionTimer(t) { chapterTransitionTimer = t; }
export function decrementChapterTransitionTimer() { if (chapterTransitionTimer > 0) chapterTransitionTimer--; }

export function setCurrentWeapon(w) { currentWeapon = w; }
export function cycleWeaponNext() { currentWeapon = (currentWeapon + 1) % weaponInventory.length; }
export function cycleWeaponPrev() { currentWeapon = (currentWeapon - 1 + weaponInventory.length) % weaponInventory.length; }
export function setWeaponInventory(inv) { weaponInventory = inv; }
export function addWeapon(weapon) { 
    if (!weaponInventory.includes(weapon)) {
        weaponInventory.push(weapon);
    }
}

export function setBoombaQueue(queue) { boombaQueue = queue; }
export function addBoomba(type) { 
    if (boombaQueue.length < Config.MAX_BOOMBA_QUEUE) {
        boombaQueue.push(type);
    }
}
export function shiftBoomba() { return boombaQueue.shift(); }
export function setChargingBoomba(charging) { chargingBoomba = charging; }
export function setBoombaCharge(charge) { boombaCharge = charge; }
export function incrementBoombaCharge(amount = Config.BOOMBA_CHARGE_RATE) { 
    boombaCharge = Math.min(boombaCharge + amount, Config.BOOMBA_CHARGE_MAX); 
}

export function setInvulnerabilityTimer(t) { invulnerabilityTimer = t; }
export function decrementInvulnerabilityTimer() { if (invulnerabilityTimer > 0) invulnerabilityTimer--; }

export function setMissileAmmo(ammo) { missileAmmo = ammo; }
export function adjustMissileAmmo(amount) { missileAmmo = Math.max(0, Math.min(Config.MAX_MISSILE_AMMO, missileAmmo + amount)); }
export function setMissileCooldown(c) { missileCooldown = c; }
export function decrementMissileCooldown() { if (missileCooldown > 0) missileCooldown--; }

export function setLastFrameTime(t) { lastFrameTime = t; }
export function setAccumulator(a) { accumulator = a; }
export function adjustAccumulator(amount) { accumulator += amount; }

export function setKey(code, value) { keys[code] = value; }

export function setGamepadConnected(connected) { gamepadConnected = connected; }
export function setGamepad(gp) { gamepad = gp; }
export function setGamepadButtons(buttons) { gamepadButtons = buttons; }
export function setGamepadPrevButtons(buttons) { gamepadPrevButtons = buttons; }
export function setDebugGamepad(debug) { debugGamepad = debug; }

export function setAudioContext(ctx) { audioCtx = ctx; }
export function setEngineOsc(osc) { engineOsc = osc; }
export function setEngineGain(gain) { engineGain = gain; }
export function setBossOsc(osc) { bossOsc = osc; }
export function setBossGain(gain) { bossGain = gain; }

// =============================================================================
// Reset function for game initialization
// =============================================================================

export function resetGameState() {
    gameSpeed = 0.08;
    score = 0;
    gameOver = false;
    time = 0;
    
    bullets = [];
    enemies = [];
    particles = [];
    pickups = [];
    trenchBlocks = [];
    hearts = [];
    harassers = [];
    harasserBullets = [];
    miniBosses = [];
    miniBossBullets = [];
    missiles = [];
    
    shipAngle = 0;
    shieldLevel = 100;
    shieldActive = false;
    health = Config.MAX_HEALTH;
    lives = Config.STARTING_LIVES;
    deathTimer = 0;
    respawnTimer = 0;
    
    level = 1;
    chapter = 1;
    chapterTimer = 0;
    
    bossActive = false;
    bossDefeatedTimer = 0;
    bossScoreGained = 0;
    bossBulletBurst = 0;
    bossBulletPhase = 0;
    bossBulletCooldown = 0;
    
    levelTransitionTimer = 0;
    chapterTransitionTimer = 0;
    
    currentWeapon = 0;
    weaponInventory = [0];
    
    boombaQueue = [];
    chargingBoomba = false;
    boombaCharge = 0;
    
    invulnerabilityTimer = 0;
    
    missileAmmo = 3;
    missileCooldown = 0;
    
    if (scoreEl) scoreEl.textContent = score;
    if (levelEl) levelEl.textContent = level;
}
