// APOPHIS - Collision Detection
// All collision detection and damage handling

import * as State from './state.js';
import * as Config from './config.js';
import { playSound } from './audio.js';
import { 
    createExplosion, 
    createDamageExplosion, 
    createUltimateExplosion,
    createDeflectionSpark
} from './bullets.js';
import { spawnBoombaPickup, spawnMissilePickup } from './pickups.js';
import { destroyBoss, destroyMiniBoss } from './bosses.js';

// =============================================================================
// Bullet vs Enemy Collisions
// =============================================================================

/**
 * Handle bullets hitting enemies
 */
export function handleBulletEnemyCollisions() {
    for (let bi = State.bullets.length - 1; bi >= 0; bi--) {
        const bull = State.bullets[bi];
        if (bull.bounced) continue;
        
        // Chapter 2: Bullets bounce off single blocks
        if (State.chapter === 2) {
            for (const b of State.trenchBlocks) {
                if (b.isSingleBlock) {
                    const bx = State.width/2 + b.worldLane * Config.FOV_SCALE * b.z;
                    const by = State.height*0.3 + b.z * State.height*0.5;
                    const dist = Math.hypot(bull.x - bx, bull.y - by);
                    const hitRadius = 40 + (b.z * 20);
                    
                    if (dist < hitRadius) {
                        State.bullets.splice(bi, 1);
                        playSound(800, 'sine', 0.05, 0.06);
                        break;
                    }
                }
            }
        }
        
        // Check enemy hits
        for (let ei = State.enemies.length - 1; ei >= 0; ei--) {
            const e = State.enemies[ei];
            let hit = false;
            let ex, ey;
            
            if (e.verticalDrop) {
                ex = e.x;
                ey = e.y;
                const dist = Math.hypot(bull.x - ex, bull.y - ey);
                hit = dist < 50;
            } else {
                ex = State.width/2 + e.worldLane * Config.FOV_SCALE * e.z;
                ey = State.height*0.3 + e.z * State.height*0.5;
                const dist = Math.hypot(bull.x - ex, bull.y - ey);
                const hitRadius = 30 + (e.z * 30);
                hit = dist < hitRadius;
            }
            
            if (hit) {
                playSound(150, 'sawtooth', 0.2, 0.1);
                const explosionX = e.verticalDrop ? e.x : ex;
                const explosionY = e.verticalDrop ? e.y : ey;
                createExplosion(explosionX, explosionY);
                
                // Blockdots drop boombas
                if (e.isBlockdot) {
                    spawnBoombaPickup(e);
                    // 25% chance for missile ammo
                    if (Math.random() < 0.25) {
                        if (e.verticalDrop) {
                            spawnMissilePickup(e.x + 20, e.y, null, null, true);
                        } else {
                            spawnMissilePickup(null, null, e.worldLane + 50, e.z, false);
                        }
                    }
                }
                
                State.enemies.splice(ei, 1);
                State.bullets.splice(bi, 1);
                State.addScore(e.isBlockdot ? Config.SCORE_BLOCKDOT : Config.SCORE_ENEMY);
                break;
            }
        }
    }
}

/**
 * Handle bullets hitting the boss
 */
export function handleBulletBossCollisions() {
    for (let bi = State.bullets.length - 1; bi >= 0; bi--) {
        const bull = State.bullets[bi];
        
        for (let hi = State.harassers.length - 1; hi >= 0; hi--) {
            const h = State.harassers[hi];
            const dist = Math.hypot(bull.x - h.x, bull.y - h.y);
            
            if (dist < 70) {
                h.hp--;
                State.bullets.splice(bi, 1);
                createExplosion(h.x, h.y);
                playSound(400, 'square', 0.05, 0.1);
                
                if (h.hp <= 0) {
                    destroyBoss(h, hi);
                }
                break;
            }
        }
    }
}

// =============================================================================
// Player Damage
// =============================================================================

/**
 * Handle player taking damage
 */
function handlePlayerDamage() {
    State.adjustHealth(-1);
    createDamageExplosion(State.shipX, State.shipY);
    playSound(50, 'sawtooth', 0.5, 0.3);
    
    if (State.health <= 0) {
        State.adjustLives(-1);
        if (State.lives > 0) {
            // Respawn
            createUltimateExplosion(State.shipX, State.shipY);
            State.setRespawnTimer(Config.RESPAWN_TIMER_DURATION);
            State.setHealth(Config.MAX_HEALTH);
            State.setInvulnerabilityTimer(Config.INVULN_RESPAWN_DURATION);
        } else {
            // Game over
            createUltimateExplosion(State.shipX, State.shipY);
            State.setDeathTimer(Config.DEATH_TIMER_DURATION);
            State.setGameOver(true);
        }
    }
}

/**
 * Handle boss bullets hitting player
 */
export function handleBossBulletPlayerCollisions() {
    for (let index = State.harasserBullets.length - 1; index >= 0; index--) {
        const hb = State.harasserBullets[index];
        const dist = Math.hypot(hb.x - State.shipX, hb.y - State.shipY);
        
        if (dist < 45 && State.respawnTimer === 0) {
            if (State.shieldActive || State.invulnerabilityTimer > 0) {
                State.harasserBullets.splice(index, 1);
                State.addScore(Config.SCORE_DEFLECT_BULLET);
            } else {
                State.harasserBullets.splice(index, 1);
                handlePlayerDamage();
            }
        }
    }
}

/**
 * Handle mini-boss bullets hitting player
 */
export function handleMiniBossBulletPlayerCollisions() {
    for (let index = State.miniBossBullets.length - 1; index >= 0; index--) {
        const mbb = State.miniBossBullets[index];
        const dist = Math.hypot(mbb.x - State.shipX, mbb.y - State.shipY);
        
        if (dist < 45) {
            if (State.shieldActive || State.invulnerabilityTimer > 0) {
                State.miniBossBullets.splice(index, 1);
                State.addScore(Config.SCORE_DEFLECT_BULLET);
            } else {
                State.miniBossBullets.splice(index, 1);
                handlePlayerDamage();
            }
        }
    }
}

/**
 * Handle trench/obstacle collisions
 */
export function handleTrenchCollisions() {
    if ((State.chapter !== 2 && State.chapter !== 3) || State.trenchBlocks.length === 0) return;
    
    for (let idx = State.trenchBlocks.length - 1; idx >= 0; idx--) {
        const b = State.trenchBlocks[idx];
        const bx = State.width/2 + b.worldLane * Config.FOV_SCALE * b.z;
        const collisionWidth = b.isSingleBlock ? 50 : 120;
        
        if (b.z > 0.82 && Math.abs(State.shipX - bx) < collisionWidth) {
            if (State.invulnerabilityTimer === 0) {
                State.trenchBlocks.splice(idx, 1);
                playSound(40, 'sawtooth', 0.8, 0.4);
                handlePlayerDamage();
            }
        }
    }
}

/**
 * Handle enemy collision with player
 */
export function handleEnemyPlayerCollisions() {
    for (let idx = State.enemies.length - 1; idx >= 0; idx--) {
        const e = State.enemies[idx];
        let ex, ey, colliding;
        
        if (e.verticalDrop) {
            ex = e.x;
            ey = e.y;
            colliding = Math.hypot(State.shipX - ex, State.shipY - ey) < 60;
        } else {
            ex = State.width/2 + e.worldLane * Config.FOV_SCALE * e.z;
            ey = State.height*0.3 + e.z * State.height*0.5;
            colliding = e.z > 0.85 && Math.hypot(State.shipX - ex, State.shipY - ey) < 60;
        }
        
        if (colliding) {
            // Blockdots always drop boombas on collision
            if (e.isBlockdot) {
                spawnBoombaPickup(e);
            }
            
            createExplosion(ex, ey);
            State.enemies.splice(idx, 1);
            
            if (State.shieldActive || State.invulnerabilityTimer > 0) {
                playSound(100, 'sine', 0.1, 0.2);
            } else {
                handlePlayerDamage();
            }
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
        
        for (const mb of State.miniBosses) {
            const dist = Math.hypot(bull.x - mb.x, bull.y - mb.y);
            
            if (dist < 35) {
                createDeflectionSpark(bull.x, bull.y);
                playSound(1200, 'sine', 0.05, 0.08);
                
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
                
                bull.x = mb.x + Math.cos(bounceAngle) * 40;
                bull.y = mb.y + Math.sin(bounceAngle) * 40;
                
                break;
            }
        }
    }
}

/**
 * Clear bullets near player during respawn
 */
export function clearBulletsNearSpawn() {
    State.setHarasserBullets(
        State.harasserBullets.filter(hb => 
            Math.hypot(hb.x - State.shipX, hb.y - State.shipY) > 200
        )
    );
    State.setMiniBossBullets(
        State.miniBossBullets.filter(mbb => 
            Math.hypot(mbb.x - State.shipX, mbb.y - State.shipY) > 200
        )
    );
    
    // Clear nearby enemies in chapter 1
    if (State.chapter === 1) {
        State.setEnemies(
            State.enemies.filter(e => 
                Math.hypot(e.x - State.shipX, e.y - State.shipY) > 150
            )
        );
    }
}
