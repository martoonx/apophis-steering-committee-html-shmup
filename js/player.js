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
    // Keyboard
    if (Input.isWeaponUpPressed()) {
        State.cycleWeaponNext();
    }
    if (Input.isWeaponDownPressed()) {
        State.cycleWeaponPrev();
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
    
    // Keyboard missile key (V)
    if (Input.isMissileKeyPressed() && State.missileCooldown === 0) {
        fireMissile();
    }
    
    // Gamepad missile button
    if (Input.isGamepadButtonJustPressed('missile')) {
        fireMissile();
    }
    
    // Missile cooldown
    State.decrementMissileCooldown();
}

// =============================================================================
// Boomba System
// =============================================================================

/**
 * Handle boomba deployment
 */
export function handleBoomba() {
    if (State.respawnTimer > 0) return;
    
    // Start boomba deployment
    if (Input.isBoombaPresseed() && State.boombaQueue.length > 0 && !State.chargingBoomba) {
        const nextBoomba = State.boombaQueue[0];
        
        if (nextBoomba === 'charged') {
            State.setChargingBoomba(true);
            State.setBoombaCharge(0);
        } else {
            if (nextBoomba === 'area') {
                launchAreaBoomba();
            } else if (nextBoomba === 'screen') {
                launchScreenBoomba();
            }
            State.shiftBoomba();
        }
    }
    
    // Handle charged boomba charging
    if (State.chargingBoomba) {
        if (Input.isBoombaPresseed()) {
            State.incrementBoombaCharge();
        } else {
            launchChargedBoomba();
            State.shiftBoomba();
            State.setChargingBoomba(false);
            State.setBoombaCharge(0);
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
 * Launch charged boomba - power scales with charge time
 */
export function launchChargedBoomba() {
    const power = State.boombaCharge / Config.BOOMBA_CHARGE_MAX;
    
    // Clear enemies based on charge
    const enemiesToRemove = [];
    State.enemies.forEach((e, idx) => {
        if (Math.random() < power) {
            createExplosion(State.width/2 + e.worldLane * Config.FOV_SCALE * e.z, State.height*0.3 + e.z * State.height*0.5);
            enemiesToRemove.push(idx);
            State.addScore(Config.SCORE_ENEMY);
        }
    });
    for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
        State.enemies.splice(enemiesToRemove[i], 1);
    }
    
    // Damage mini-bosses
    const miniBossesToRemove = [];
    State.miniBosses.forEach((mb, idx) => {
        mb.hp -= Math.floor(power * 10);
        mb.fireRate = Math.min(mb.fireRate + Math.floor(power * 8), 60);
        createExplosion(mb.x, mb.y);
        if (mb.hp <= 0) {
            createSpectacularExplosion(mb.x, mb.y);
            miniBossesToRemove.push(idx);
            State.addScore(Config.SCORE_MINIBOSS);
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
        h.hp -= Math.floor(power * 20);
        createExplosion(h.x, h.y);
    });
    
    // Destroy blocks based on charge
    const blocksToRemove = [];
    State.trenchBlocks.forEach((b, idx) => {
        if (b.isSingleBlock && Math.random() < power) {
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
    
    playSound(80, 'square', 1.0, 0.3);
    
    // Visual feedback
    for (let i = 0; i < 100 * power; i++) {
        State.particles.push({
            x: State.width / 2,
            y: State.height / 2,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            life: 80,
            color: '#ffff00'
        });
    }
}
