// APOPHIS - Bosses
// Mini-boss and Harasser (main boss) logic

import * as State from './state.js';
import * as Config from './config.js';
import { playSound } from './audio.js';
import { 
    createExplosion, 
    createSpectacularExplosion, 
    createMegaBossExplosion,
    createDeflectionSpark
} from './bullets.js';

// =============================================================================
// Mini-Boss System
// =============================================================================

/**
 * Spawn a mini-boss
 */
export function spawnMiniBoss() {
    const configs = Config.MINIBOSS_CONFIGS;
    const config = configs[Math.min(State.level - 2, configs.length - 1)];
    
    // Calculate HP: Base 12 at level 2, +3 per level, ±20% variance
    const baseHp = 12 + (State.level - 2) * 3;
    const variance = baseHp * 0.2;
    const actualHp = Math.floor(baseHp + (Math.random() * variance * 2 - variance));
    
    State.miniBosses.push({
        x: State.width / 2,
        y: State.height * 0.25,
        phase: 0,
        hp: actualHp,
        maxHp: actualHp,
        ...config
    });
}

/**
 * Fire a bullet from a mini-boss
 */
export function fireMiniBossBullet(mb) {
    const bullet = {
        x: mb.x,
        y: mb.y,
        vy: 5 + State.gameSpeed * 20,
        type: mb.bulletType
    };
    
    if (mb.bulletType === 'circle') {
        bullet.vy *= 0.7;
    } else if (mb.bulletType === 'triangle') {
        bullet.vy *= 0.6;
    }
    
    State.miniBossBullets.push(bullet);
    playSound(250, 'sine', 0.08, 0.04);
}

/**
 * Update mini-bosses
 */
export function updateMiniBosses() {
    State.miniBosses.forEach(mb => {
        mb.phase += 0.06;
        if (!mb.targetX || Math.random() < mb.chaosRate) {
            mb.targetX = State.width * (0.2 + Math.random() * 0.6);
        }
        const dx = mb.targetX - mb.x;
        mb.x += dx * 0.08 + (Math.random() - 0.5) * mb.chaosRate * 50;
        mb.x = Math.max(State.width * 0.1, Math.min(State.width * 0.9, mb.x));
        mb.y = State.height * 0.25 + Math.sin(mb.phase * 2) * 20;
        
        // Firing
        if (State.time % mb.fireRate === 0) {
            fireMiniBossBullet(mb);
        }
    });
}

/**
 * Update mini-boss bullets
 */
export function updateMiniBossBullets() {
    for (let index = State.miniBossBullets.length - 1; index >= 0; index--) {
        const mbb = State.miniBossBullets[index];
        mbb.y += mbb.vy;
        
        // Homing triangles
        if (mbb.type === 'triangle' && mbb.y < State.height) {
            const dx = State.shipX - mbb.x;
            const dy = State.shipY - mbb.y;
            const angle = Math.atan2(dy, dx);
            mbb.x += Math.cos(angle) * 1.5;
        }
        
        // Cleanup
        if (mbb.y > State.height || mbb.y < 0) {
            State.miniBossBullets.splice(index, 1);
        }
    }
}

/**
 * Handle bullet deflection off mini-bosses
 */
export function handleMiniBossDeflection() {
    for (let bi = State.bullets.length - 1; bi >= 0; bi--) {
        const bull = State.bullets[bi];
        if (bull.bounced) continue;
        
        for (let mi = 0; mi < State.miniBosses.length; mi++) {
            const mb = State.miniBosses[mi];
            const dist = Math.hypot(bull.x - mb.x, bull.y - mb.y);
            
            if (dist < 35) {
                createDeflectionSpark(bull.x, bull.y);
                playSound(1200, 'sine', 0.05, 0.08);
                
                // Calculate bounce direction
                const dx = bull.x - mb.x;
                const dy = bull.y - mb.y;
                const angle = Math.atan2(dy, dx);
                const bounceAngle = angle + (Math.random() - 0.5) * 0.8;
                const bounceSpeed = 10 + Math.random() * 4;
                
                bull.vx = Math.cos(bounceAngle) * bounceSpeed;
                bull.vy = Math.sin(bounceAngle) * bounceSpeed;
                bull.bounced = true;
                bull.bounceLife = 60;
                bull.type = 'bounced';
                
                // Push bullet outside collision zone
                bull.x = mb.x + Math.cos(bounceAngle) * 40;
                bull.y = mb.y + Math.sin(bounceAngle) * 40;
                
                break;
            }
        }
    }
}

/**
 * Destroy a mini-boss and drop loot
 */
export function destroyMiniBoss(mb, index) {
    createSpectacularExplosion(mb.x, mb.y);
    
    // Drop loot
    const dropType = Math.random() < 0.5 ? 'extralife' : 'weapon';
    State.pickups.push({ 
        x: mb.x,
        y: mb.y,
        vx: 0,
        vy: 2.5,
        size: 25,
        type: dropType,
        verticalDrop: true
    });
    
    // Also drop missile ammo
    State.pickups.push({ 
        x: mb.x + 30,
        y: mb.y,
        vx: 0,
        vy: 2.5,
        size: 20,
        type: 'missile',
        verticalDrop: true
    });
    
    State.miniBosses.splice(index, 1);
    State.addScore(Config.SCORE_MINIBOSS);
}

// =============================================================================
// Main Boss (Harasser) System
// =============================================================================

/**
 * Spawn the Harasser boss
 */
export function spawnBoss() {
    State.harassers.push({ 
        x: State.width / 2, 
        y: State.height * 0.2, 
        phase: 0, 
        hp: 40 + State.level * 15, 
        maxHp: 40 + State.level * 15 
    });
    State.setBossActive(true);
}

/**
 * Update the Harasser boss
 */
export function updateBoss() {
    State.harassers.forEach(h => {
        h.phase += 0.04;
        if (!h.targetX || Math.random() < 0.02) {
            h.targetX = State.width * (0.2 + Math.random() * 0.6);
        }
        const dx = h.targetX - h.x;
        h.x += dx * 0.05 + (Math.random() - 0.5) * 8;
        h.x = Math.max(State.width * 0.15, Math.min(State.width * 0.85, h.x));
        h.y = State.height * 0.2 + Math.sin(h.phase * 2) * 15;
    });
}

/**
 * Handle boss bullet firing pattern
 */
export function handleBossFiring() {
    if (State.bossBulletCooldown > 0) {
        State.decrementBossBulletCooldown();
    } else if (State.harassers.length > 0) {
        const h = State.harassers[0];
        
        // Fire during burst
        if (State.time % 5 === 0) {
            State.harasserBullets.push({
                x: h.x + (Math.random() - 0.5) * 120,
                y: h.y,
                vy: 7 + (State.gameSpeed * 25),
                size: 4
            });
            playSound(200, 'sine', 0.1, 0.03);
            State.incrementBossBulletBurst();
            
            // Check if burst is complete
            if (State.bossBulletBurst >= Config.BOSS_BULLET_SEQUENCE[State.bossBulletPhase]) {
                State.setBossBulletBurst(0);
                State.advanceBossBulletPhase();
                
                // Set cooldown between bursts
                if (State.bossBulletPhase === 0) {
                    State.setBossBulletCooldown(90);
                } else {
                    State.setBossBulletCooldown(30);
                }
            }
        }
    }
}

/**
 * Update boss bullets
 */
export function updateBossBullets() {
    for (let index = State.harasserBullets.length - 1; index >= 0; index--) {
        const hb = State.harasserBullets[index];
        hb.y += hb.vy;
        
        if (hb.y > State.height || hb.y < 0) {
            State.harasserBullets.splice(index, 1);
        }
    }
}

/**
 * Destroy the boss
 */
export function destroyBoss(h, index) {
    createMegaBossExplosion(h.x, h.y);
    
    // Delayed explosions
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            createSpectacularExplosion(
                h.x + (Math.random() - 0.5) * 150, 
                h.y + (Math.random() - 0.5) * 150
            );
        }, i * 50);
    }
    
    State.harassers.splice(index, 1);
    State.setHarasserBullets([]);
    State.setBossActive(false);
    State.setBossScoreGained(Config.SCORE_BOSS);
    State.addScore(Config.SCORE_BOSS);
    State.setBossDefeatedTimer(Config.BOSS_DEFEATED_TIMER);
    playSound(50, 'sawtooth', 1.5, 0.5);
}
