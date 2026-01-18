// APOPHIS - Main
// Game loop, initialization, and ties everything together

import * as State from './state.js';
import * as Config from './config.js';
import { initAudio, updateEngineSound } from './audio.js';
import { initInput, pollGamepad, isRestartPressed } from './input.js';
import { initTitleScreen, stopTitleScreen } from './title.js';
import { updatePlayerMovement, updateShield, handleShooting, handleWeaponCycling, handleMissileFiring, handleBoomba } from './player.js';
import { handleSpawning, updateEnemies, updateTrenchBlocks, cleanupEnemies } from './enemies.js';
import { spawnBoss, updateBoss, handleBossFiring, updateBossBullets, updateMiniBosses, updateMiniBossBullets, spawnMiniBoss } from './bosses.js';
import { updatePickups, collectPickups, cleanupPickups, spawnShieldPickup, spawnHeart, spawnInvulnPickup } from './pickups.js';
import { updateBullets, updateMissiles, updateParticles } from './bullets.js';
import { 
    handleBulletEnemyCollisions, 
    handleBulletBossCollisions, 
    handleBossBulletPlayerCollisions,
    handleMiniBossBulletPlayerCollisions,
    handleTrenchCollisions,
    handleEnemyPlayerCollisions,
    handleMiniBossDeflection,
    clearBulletsNearSpawn
} from './collision.js';
import * as Render from './render.js';
import { renderHUD, renderGameOver, renderLevelTransition, renderBossDefeated, renderChapterTransition, updateSectorDisplay } from './hud.js';

// =============================================================================
// Initialization
// =============================================================================

/**
 * Initialize the game
 */
export function init() {
    State.resetGameState();
    resize();
    
    // Create stars
    const stars = Array.from({length: 150}, () => ({
        x: Math.random() * State.width,
        y: Math.random() * State.height,
        z: Math.random(),
        speed: Math.random() * 0.02 + 0.005
    }));
    State.setStars(stars);
    
    updateSectorDisplay();
}

/**
 * Handle window resize
 */
function resize() {
    const canvas = State.canvas;
    State.setDimensions(window.innerWidth, window.innerHeight);
    canvas.width = State.width;
    canvas.height = State.height;
    State.setShipPosition(State.width / 2, State.height * 0.8);
}

/**
 * Get chapter duration
 */
function getChapterDuration() {
    if (State.chapter <= 3) {
        return Config.CHAPTER_DURATION;
    }
    return Infinity;
}

/**
 * Advance to next chapter
 */
function advanceChapter() {
    State.setChapterTimer(0);
    State.incrementChapter();
    
    if (State.chapter > 4) {
        // Level complete
        State.incrementLevel();
        State.setChapter(1);
        State.setEnemies([]);
        State.setTrenchBlocks([]);
        State.setPickups([]);
        State.setHearts([]);
        State.setMiniBosses([]);
        State.setMiniBossBullets([]);
        State.setMissiles([]);
    } else {
        // Chapter transition
        State.setChapterTransitionTimer(Config.CHAPTER_TRANSITION_TIMER);
        State.setEnemies([]);
        State.setTrenchBlocks([]);
        State.setPickups([]);
        State.setHearts([]);
    }
    
    updateSectorDisplay();
}

// =============================================================================
// Game Loop
// =============================================================================

/**
 * Main update function
 */
function update() {
    try {
        updateEngineSound();
        pollGamepad();
        
        // Game over state
        if (State.gameOver) {
            if (isRestartPressed()) {
                init();
            }
            
            if (State.deathTimer > 0) {
                State.decrementDeathTimer();
                updateParticles();
            }
            return;
        }
        
        // Respawn timer
        if (State.respawnTimer > 0) {
            State.decrementRespawnTimer();
            updateParticles();
            clearBulletsNearSpawn();
            return;
        }
        
        // Level transition timer
        if (State.levelTransitionTimer > 0) {
            State.decrementLevelTransitionTimer();
            updateParticles();
            return;
        }
        
        // Boss defeated timer
        if (State.bossDefeatedTimer > 0) {
            State.decrementBossDefeatedTimer();
            updateParticles();
            if (State.bossDefeatedTimer === 1) {
                advanceChapter();
                State.setLevelTransitionTimer(Config.LEVEL_TRANSITION_TIMER);
            }
            return;
        }
        
        // Chapter transition timer
        if (State.chapterTransitionTimer > 0) {
            State.decrementChapterTransitionTimer();
            updateParticles();
            return;
        }
        
        // Main game update
        State.incrementTime();
        State.incrementGameSpeed(0.00001);
        State.incrementChapterTimer();
        State.decrementInvulnerabilityTimer();
        
        // Chapter 4: Boss Fight
        if (State.chapter === 4) {
            // Spawn boss if not active
            if (!State.bossActive && State.harassers.length === 0) {
                spawnBoss();
                updateSectorDisplay();
            }
            
            updateBoss();
            handleBossFiring();
            updateBossBullets();
            
            // Bullets hitting boss
            handleBulletBossCollisions();
            
            // Boss bullets hitting player
            handleBossBulletPlayerCollisions();
            
            // Chapter 4 pickup movement and collection
            updatePickups();
            collectPickups();
            cleanupPickups();
        }
        
        // Player input & movement
        updatePlayerMovement();
        updateShield();
        handleShooting();
        handleWeaponCycling();
        handleMissileFiring();
        handleBoomba();
        
        // Missile cooldown
        State.decrementMissileCooldown();
        
        // Bullets
        updateBullets();
        updateMissiles();
        
        // Mini-boss spawning (level 2+, not during main boss)
        if (State.level >= 2 && State.chapter !== 4 && State.miniBosses.length === 0 && Math.random() < 0.003) {
            spawnMiniBoss();
        }
        
        // Mini-bosses
        updateMiniBosses();
        updateMiniBossBullets();
        handleMiniBossDeflection();
        handleMiniBossBulletPlayerCollisions();
        
        // Chapter-specific gameplay (Chapters 1-3)
        if (State.chapter !== 4) {
            handleSpawning();
            
            // Pickup spawning
            if (Math.random() < 0.008) spawnShieldPickup();
            if (Math.random() < 0.003) spawnHeart();
            if (Math.random() < 0.001) spawnInvulnPickup();
            
            // Update movement
            updateEnemies();
            updateTrenchBlocks();
            updatePickups();
            
            // Collisions
            handleTrenchCollisions();
            handleBulletEnemyCollisions();
            collectPickups();
            handleEnemyPlayerCollisions();
            
            // Cleanup
            cleanupEnemies();
            cleanupPickups();
        }
        
        // Particles
        updateParticles();
        
        // Check chapter time limit
        if (State.chapter !== 4 && State.chapterTimer >= getChapterDuration()) {
            advanceChapter();
        }
        
    } catch (error) {
        console.error('Update error:', error);
        State.setGameOver(true);
    }
}

/**
 * Main render function
 */
function render() {
    try {
        Render.renderBackground();
        Render.renderMiniBosses();
        Render.renderMiniBossBullets();
        Render.renderMissiles();
        Render.renderBoss();
        Render.renderBossBullets();
        Render.renderTrenchBlocks();
        Render.renderBullets();
        Render.renderPickups();
        Render.renderHearts();
        Render.renderEnemies();
        Render.renderParticles();
        Render.renderBars();
        Render.renderPlayer();
        
        // Overlays
        renderGameOver();
        renderLevelTransition();
        renderBossDefeated();
        renderChapterTransition();
        
        renderHUD();
        
    } catch (error) {
        console.error('Render error:', error);
    }
}

/**
 * Main game loop with fixed timestep
 */
function loop(currentTime) {
    if (!State.lastFrameTime) State.setLastFrameTime(currentTime);
    
    const deltaTime = currentTime - State.lastFrameTime;
    State.setLastFrameTime(currentTime);
    
    // Accumulate time
    State.adjustAccumulator(deltaTime);
    
    // Cap accumulator to prevent spiral of death
    if (State.accumulator > Config.FRAME_DURATION * 5) {
        State.setAccumulator(Config.FRAME_DURATION * 5);
    }
    
    // Run game logic at fixed 60 FPS
    while (State.accumulator >= Config.FRAME_DURATION) {
        update();
        State.adjustAccumulator(-Config.FRAME_DURATION);
    }
    
    // Always render
    render();
    
    requestAnimationFrame(loop);
}

// =============================================================================
// Bootstrap
// =============================================================================

/**
 * Start the game when DOM is ready
 */
function bootstrap() {
    // Get canvas and context
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    State.setCanvas(canvas, ctx);
    
    // Get DOM elements
    State.setDOMElements({
        scoreEl: document.getElementById('score'),
        levelEl: document.getElementById('levelNum'),
        sectorEl: document.getElementById('sector'),
        alertEl: document.getElementById('alert'),
        overlay: document.getElementById('overlay')
    });
    
    // Initialize input
    initInput();
    
    // Handle window resize
    window.addEventListener('resize', resize);
    
    // Initialize title screen
    initTitleScreen();
    
    // Handle title screen click to start game
    State.overlay.addEventListener('click', () => {
        stopTitleScreen();
        State.overlay.style.display = 'none';
        initAudio();
        init();
        State.setLastFrameTime(0);
        State.setAccumulator(0);
        requestAnimationFrame(loop);
    });
    
    // Handle title screen resize
    window.addEventListener('resize', () => {
        if (State.overlay.style.display !== 'none') {
            initTitleScreen();
        }
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
