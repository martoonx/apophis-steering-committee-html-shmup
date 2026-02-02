// APOPHIS - Player
// Ship movement, shooting, shield, and boomba systems

import * as State from './state.js';
import * as Config from './config.js';
import { playSound } from './audio.js';
import * as Input from './input.js';
import { fireWeapon, fireMissile, createExplosion, createSpectacularExplosion, createMegaBossExplosion } from './bullets.js';

// =============================================================================
// Player Movement
// =============================================================================

/**
 * Update player position based on input
 */
export function updatePlayerMovement() {
    // Arrow Keys, A/D, and Gamepad
    if (Input.isMovingLeft()) {
        State.adjustShipAngle(-0.15);
    }
    if (Input.isMovingRight()) {
        State.adjustShipAngle(0.15);
    }
    
    // Gamepad left stick
    const stickX = Input.getLeftStickX();
    if (stickX) {
        State.adjustShipAngle(stickX * 0.15);
    }
    
    // Touch movement (velocity-based: -1 to 1 range)
    const touchMove = Input.getTouchMovement();
    if (touchMove) {
        State.adjustShipAngle(touchMove * 0.25);
    }
    
    // Dampen and apply movement
    State.dampenShipAngle(0.88);
    State.setShipX(Math.max(80, Math.min(State.width - 80, State.shipX + State.shipAngle * 12)));
}

// =============================================================================
// Shield System
// =============================================================================

/**
 * Update shield state
 */
export function updateShield() {
    const wantShield = Input.isShielding() && 
                       State.shieldLevel > 1 && 
                       !State.chargingBoomba && 
                       State.respawnTimer === 0;
    
    State.setShieldActive(wantShield);
    
    if (State.shieldActive) {
        State.adjustShieldLevel(-Config.SHIELD_DRAIN_RATE);
    } else if (State.shieldLevel < Config.SHIELD_MAX) {
        State.adjustShieldLevel(Config.SHIELD_REGEN_RATE);
    }
}

// =============================================================================
// Weapon System
// =============================================================================

/**
 * Handle weapon firing
 */
export function handleShooting() {
    if (State.chargingBoomba || State.respawnTimer > 0) return;
    
    if (Input.isFiring() && State.time % Config.FIRE_DELAY === 0) {
        fireWeapon();
    }
}

/**
 * Handle weapon cycling input
 */
export function handleWeaponCycling() {
    // Keyboard Up/W or touch
    const upPressed = State.justPressed['ArrowUp'] || State.justPressed['KeyW'];
    const touchPressed = Input.isTouchButtonJustPressed('weaponCycle');
    
    if (upPressed || touchPressed) {
        // Clear flags immediately to prevent multiple cycles
        if (State.justPressed['ArrowUp']) State.setJustPressed('ArrowUp', false);
        if (State.justPressed['KeyW']) State.setJustPressed('KeyW', false);
        State.cycleWeaponNext();
    }
    
    // Gamepad bumpers
    if (Input.isGamepadButtonJustPressed('weaponNext')) {
        State.cycleWeaponNext();
    }
    if (Input.isGamepadButtonJustPressed('weaponPrev')) {
        State.cycleWeaponPrev();
    }
}

// =============================================================================
// Missile System
// =============================================================================

/**
 * Handle missile firing
 */
export function handleMissileFiring() {
    if (State.gameOver || State.respawnTimer > 0) return;
    
    // Keyboard missile key (V) - uses request flag set on keydown
    if (State.missileRequested) {
        fireMissile();
        State.setMissileRequested(false);
    }
    
    // Gamepad missile button
    if (Input.isGamepadButtonJustPressed('missile')) {
        fireMissile();
    }
    
    // Touch missile button
    if (Input.isTouchButtonJustPressed('missile')) {
        fireMissile();
    }
    
    // Missile cooldown
    State.decrementMissileCooldown();
}

// =============================================================================
// Boomba System
// =============================================================================

/**
 * Handle boomba cycling (Down/S key or touch)
 */
export function handleBoombaCycling() {
    const downPressed = State.justPressed['ArrowDown'] || State.justPressed['KeyS'];
    const touchPressed = Input.isTouchButtonJustPressed('boombaCycle');
    
    if (downPressed || touchPressed) {
        // Clear flags immediately to prevent multiple cycles
        if (State.justPressed['ArrowDown']) State.setJustPressed('ArrowDown', false);
        if (State.justPressed['KeyS']) State.setJustPressed('KeyS', false);
        State.cycleBoomba();
    }
}

/**
 * Handle boomba deployment - one press fires one boomba
 */
export function handleBoomba() {
    if (State.respawnTimer > 0) return;
    
    // Fire boomba on key press (using justPressed for single fire)
    const keyPressed = State.justPressed['KeyC'];
    const touchPressed = Input.isTouchButtonJustPressed('boomba');
    
    if (keyPressed || touchPressed) {
        // Clear the flag immediately to prevent multiple fires in same frame
        if (keyPressed) State.setJustPressed('KeyC', false);
        
        const currentType = State.getCurrentBoombaType();
        const currentCount = State.getCurrentBoombaCount();
        
        if (currentCount > 0) {
            if (currentType === 'area') {
                launchAreaBoomba();
            } else if (currentType === 'screen') {
                launchScreenBoomba();
            } else if (currentType === 'cluster') {
                launchClusterBoomba();
            }
            State.useBoomba();
        }
    }
}

/**
 * Launch area boomba - clears enemies in radius
 */
export function launchAreaBoomba() {
    const radius = Config.AREA_BOOMBA_RADIUS;
    const enemiesToRemove = [];
    
    State.enemies.forEach((e, idx) => {
        let ex, ey;
        if (e.verticalDrop) {
            ex = e.x;
            ey = e.y;
        } else {
            ex = State.width/2 + e.worldLane * Config.FOV_SCALE * e.z;
            ey = State.height*0.3 + e.z * State.height*0.5;
        }
        
        const dist = Math.hypot(State.shipX - ex, State.shipY - ey);
        if (dist < radius) {
            createExplosion(ex, ey);
            enemiesToRemove.push(idx);
            State.addScore(Config.SCORE_ENEMY);
        }
    });
    
    // Remove in reverse order
    for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
        State.enemies.splice(enemiesToRemove[i], 1);
    }
    
    // Slow down mini-bosses' fire rate
    State.miniBosses.forEach(mb => {
        mb.fireRate = Math.min(mb.fireRate + 5, 60);
    });
    
    // Clear nearby mini-boss bullets
    State.setMiniBossBullets(State.miniBossBullets.filter(mbb => {
        const dist = Math.hypot(State.shipX - mbb.x, State.shipY - mbb.y);
        if (dist < radius) {
            createExplosion(mbb.x, mbb.y);
            return false;
        }
        return true;
    }));
    
    // Clear nearby boss bullets
    State.setHarasserBullets(State.harasserBullets.filter(hb => {
        const dist = Math.hypot(State.shipX - hb.x, State.shipY - hb.y);
        if (dist < radius) {
            createExplosion(hb.x, hb.y);
            return false;
        }
        return true;
    }));
    
    // Destroy nearby single blocks
    const blocksToRemove = [];
    State.trenchBlocks.forEach((b, idx) => {
        if (b.isSingleBlock) {
            const bx = State.width/2 + b.worldLane * Config.FOV_SCALE * b.z;
            const by = State.height*0.3 + b.z * State.height*0.5;
            const dist = Math.hypot(State.shipX - bx, State.shipY - by);
            if (dist < radius) {
                createExplosion(bx, by);
                blocksToRemove.push(idx);
                State.addScore(Config.SCORE_OBSTACLE);
            }
        }
    });
    for (let i = blocksToRemove.length - 1; i >= 0; i--) {
        State.trenchBlocks.splice(blocksToRemove[i], 1);
    }
    
    playSound(120, 'square', 0.6, 0.3);
    
    // Visual feedback - expanding ring
    for (let ring = 0; ring < 5; ring++) {
        for (let i = 0; i < 40; i++) {
            const angle = (Math.PI * 2 * i) / 40;
            const speed = 15 + ring * 5;
            State.particles.push({
                x: State.shipX,
                y: State.shipY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60,
                color: '#ff6600'
            });
        }
    }
}

/**
 * Launch screen boomba - clears entire screen
 */
export function launchScreenBoomba() {
    // Clear ALL enemies on screen
    State.enemies.forEach(e => {
        let ex, ey;
        if (e.verticalDrop) {
            ex = e.x;
            ey = e.y;
        } else {
            ex = State.width/2 + e.worldLane * Config.FOV_SCALE * e.z;
            ey = State.height*0.3 + e.z * State.height*0.5;
        }
        createExplosion(ex, ey);
        State.addScore(Config.SCORE_ENEMY);
    });
    State.setEnemies([]);
    
    // Clear ALL bullets
    State.miniBossBullets.forEach(mbb => createExplosion(mbb.x, mbb.y));
    State.setMiniBossBullets([]);
    State.harasserBullets.forEach(hb => createExplosion(hb.x, hb.y));
    State.setHarasserBullets([]);
    
    // Damage mini-bosses heavily
    const miniBossesToRemove = [];
    State.miniBosses.forEach((mb, idx) => {
        mb.hp -= 15;
        mb.fireRate = Math.min(mb.fireRate + 10, 60);
        createSpectacularExplosion(mb.x, mb.y);
        if (mb.hp <= 0) {
            miniBossesToRemove.push(idx);
            State.addScore(Config.SCORE_MINIBOSS);
            // Drop loot
            const dropType = Math.random() < 0.5 ? 'extralife' : 'weapon';
            State.pickups.push({ x: mb.x, y: mb.y, vx: 0, vy: 2.5, size: 25, type: dropType, verticalDrop: true });
            State.pickups.push({ x: mb.x + 30, y: mb.y, vx: 0, vy: 2.5, size: 20, type: 'missile', verticalDrop: true });
        }
    });
    for (let i = miniBossesToRemove.length - 1; i >= 0; i--) {
        State.miniBosses.splice(miniBossesToRemove[i], 1);
    }
    
    // Damage main boss
    State.harassers.forEach(h => {
        h.hp -= 25;
        createMegaBossExplosion(h.x, h.y);
    });
    
    // Destroy ALL single blocks
    const blocksToRemove = [];
    State.trenchBlocks.forEach((b, idx) => {
        if (b.isSingleBlock) {
            const bx = State.width/2 + b.worldLane * Config.FOV_SCALE * b.z;
            const by = State.height*0.3 + b.z * State.height*0.5;
            createExplosion(bx, by);
            blocksToRemove.push(idx);
            State.addScore(Config.SCORE_OBSTACLE);
        }
    });
    for (let i = blocksToRemove.length - 1; i >= 0; i--) {
        State.trenchBlocks.splice(blocksToRemove[i], 1);
    }
    
    playSound(60, 'square', 1.2, 0.4);
    
    // Visual feedback - screen flash
    for (let i = 0; i < 200; i++) {
        State.particles.push({
            x: Math.random() * State.width,
            y: Math.random() * State.height,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            life: 70,
            color: ['#ff6600', '#ff0000', '#ffff00'][Math.floor(Math.random() * 3)]
        });
    }
}

/**
 * Launch cluster boomba - multiple explosions across the screen
 */
export function launchClusterBoomba() {
    const clusterCount = 8; // Number of cluster explosions
    const radius = 80; // Radius of each cluster explosion
    
    // Generate cluster positions spread across the screen
    for (let c = 0; c < clusterCount; c++) {
        const clusterX = State.width * 0.15 + Math.random() * State.width * 0.7;
        const clusterY = State.height * 0.1 + Math.random() * State.height * 0.5;
        
        // Clear enemies near this cluster
        const enemiesToRemove = [];
        State.enemies.forEach((e, idx) => {
            let ex, ey;
            if (e.verticalDrop) {
                ex = e.x;
                ey = e.y;
            } else {
                ex = State.width/2 + e.worldLane * Config.FOV_SCALE * e.z;
                ey = State.height*0.3 + e.z * State.height*0.5;
            }
            
            const dist = Math.hypot(clusterX - ex, clusterY - ey);
            if (dist < radius) {
                createExplosion(ex, ey);
                enemiesToRemove.push(idx);
                State.addScore(Config.SCORE_ENEMY);
            }
        });
        
        // Remove in reverse order
        for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
            State.enemies.splice(enemiesToRemove[i], 1);
        }
        
        // Clear bullets near this cluster
        State.setMiniBossBullets(State.miniBossBullets.filter(mbb => {
            const dist = Math.hypot(clusterX - mbb.x, clusterY - mbb.y);
            if (dist < radius) {
                createExplosion(mbb.x, mbb.y);
                return false;
            }
            return true;
        }));
        
        State.setHarasserBullets(State.harasserBullets.filter(hb => {
            const dist = Math.hypot(clusterX - hb.x, clusterY - hb.y);
            if (dist < radius) {
                createExplosion(hb.x, hb.y);
                return false;
            }
            return true;
        }));
        
        // Visual - explosion at cluster point
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 8 + Math.random() * 4;
            State.particles.push({
                x: clusterX,
                y: clusterY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 40,
                color: ['#ff00ff', '#ff66ff', '#ffaaff'][Math.floor(Math.random() * 3)]
            });
        }
    }
    
    // Damage mini-bosses
    State.miniBosses.forEach(mb => {
        mb.hp -= 3;
        createExplosion(mb.x, mb.y);
    });
    
    // Damage main boss slightly
    State.harassers.forEach(h => {
        h.hp -= 5;
        createExplosion(h.x, h.y);
    });
    
    playSound(100, 'square', 0.8, 0.25);
}
