// APOPHIS - Pickups
// Pickup spawning, movement, and collection

import * as State from './state.js';
import * as Config from './config.js';
import { playSound } from './audio.js';

/**
 * Spawn a shield pickup
 */
export function spawnShieldPickup() {
    if (State.chapter === 1) {
        State.pickups.push({ 
            x: Math.random() * (State.width - 200) + 100,
            y: 0,
            vx: 0,
            vy: 3 + Math.random() * 2,
            size: 20 + Math.random() * 15,
            type: 'shield',
            verticalDrop: true
        });
    } else {
        State.pickups.push({ 
            worldLane: Config.ENEMY_WORLD_LANES[Math.floor(Math.random() * 7)], 
            z: 0, 
            type: 'shield' 
        });
    }
}

/**
 * Spawn a heart (health) pickup
 */
export function spawnHeart() {
    if (State.chapter === 1) {
        State.hearts.push({ 
            x: Math.random() * (State.width - 200) + 100,
            y: 0,
            vx: 0,
            vy: 3 + Math.random() * 2,
            size: 15 + Math.random() * 10,
            verticalDrop: true
        });
    } else {
        State.hearts.push({ 
            worldLane: Config.ENEMY_WORLD_LANES[Math.floor(Math.random() * 7)], 
            z: 0 
        });
    }
}

/**
 * Spawn an invulnerability pickup
 */
export function spawnInvulnPickup() {
    if (State.chapter === 1) {
        State.pickups.push({ 
            x: Math.random() * (State.width - 200) + 100,
            y: 0,
            vx: 0,
            vy: 3 + Math.random() * 2,
            size: 20 + Math.random() * 15,
            type: 'invuln',
            verticalDrop: true
        });
    } else {
        State.pickups.push({ 
            worldLane: Config.ENEMY_WORLD_LANES[Math.floor(Math.random() * 7)], 
            z: 0, 
            type: 'invuln' 
        });
    }
}

/**
 * Spawn a boomba pickup at a specific location (from blockdot)
 */
export function spawnBoombaPickup(e) {
    const boombaType = ['area', 'screen', 'charged'][Math.floor(Math.random() * 3)];
    
    if (e.verticalDrop) {
        State.pickups.push({
            x: e.x,
            y: e.y,
            vx: 0,
            vy: 2,
            size: 25,
            type: 'boomba',
            boombaType: boombaType,
            verticalDrop: true
        });
    } else {
        State.pickups.push({
            worldLane: e.worldLane,
            z: e.z,
            type: 'boomba',
            boombaType: boombaType
        });
    }
    playSound(400, 'sine', 0.3, 0.15);
}

/**
 * Spawn a missile ammo pickup at a specific location
 */
export function spawnMissilePickup(x, y, worldLane, z, isVertical) {
    if (isVertical) {
        State.pickups.push({
            x: x,
            y: y,
            vx: 0,
            vy: 2.2,
            size: 20,
            type: 'missile',
            verticalDrop: true
        });
    } else {
        State.pickups.push({
            worldLane: worldLane,
            z: z,
            type: 'missile'
        });
    }
}

/**
 * Update pickup positions
 */
export function updatePickups() {
    // Move pickups
    State.pickups.forEach(p => {
        if (p.verticalDrop) {
            p.y += p.vy;
        } else {
            // Extra life pickups move at half enemy speed
            if (p.type === 'extralife') {
                p.z += (0.005 + (State.gameSpeed * 0.15)) * 0.5;
            } else {
                p.z += 0.005 + (State.gameSpeed * 0.1);
            }
        }
    });
    
    // Move hearts
    State.hearts.forEach(h => {
        if (h.verticalDrop) {
            h.y += h.vy;
        } else {
            h.z += 0.005 + (State.gameSpeed * 0.1);
        }
    });
}

/**
 * Handle pickup collection
 */
export function collectPickups() {
    // Regular pickups
    for (let pi = State.pickups.length - 1; pi >= 0; pi--) {
        const p = State.pickups[pi];
        let px, py;
        
        if (p.verticalDrop) {
            px = p.x;
            py = p.y;
        } else {
            px = State.width/2 + p.worldLane * Config.FOV_SCALE * p.z;
            py = State.height*0.3 + p.z * State.height*0.5;
        }
        
        const canCollect = p.verticalDrop ? true : (p.z > 0.8);
        
        if (canCollect && Math.hypot(State.shipX - px, State.shipY - py) < 60) {
            collectPickup(p);
            State.pickups.splice(pi, 1);
        }
    }
    
    // Hearts
    for (let hi = State.hearts.length - 1; hi >= 0; hi--) {
        const h = State.hearts[hi];
        let hx, hy;
        
        if (h.verticalDrop) {
            hx = h.x;
            hy = h.y;
        } else {
            hx = State.width/2 + h.worldLane * Config.FOV_SCALE * h.z;
            hy = State.height*0.3 + h.z * State.height*0.5;
        }
        
        const canCollect = h.verticalDrop ? true : (h.z > 0.8);
        
        if (canCollect && Math.hypot(State.shipX - hx, State.shipY - hy) < 60) {
            State.adjustHealth(1);
            playSound(800, 'sine', 0.3, 0.2);
            State.hearts.splice(hi, 1);
        }
    }
}

/**
 * Apply pickup effect
 */
function collectPickup(p) {
    switch (p.type) {
        case 'shield':
            State.adjustShieldLevel(20);
            playSound(600, 'sine', 0.3, 0.2);
            break;
            
        case 'weapon':
            const newWeapon = Math.floor(Math.random() * 3) + 1; // 1-3
            State.addWeapon(newWeapon);
            playSound(600, 'sine', 0.3, 0.2);
            break;
            
        case 'boomba':
            State.addBoomba(p.boombaType);
            playSound(600, 'sine', 0.3, 0.2);
            break;
            
        case 'invuln':
            State.setInvulnerabilityTimer(Config.INVULN_PICKUP_DURATION);
            playSound(600, 'sine', 0.3, 0.2);
            break;
            
        case 'extralife':
            State.adjustLives(1);
            playSound(900, 'sine', 0.5, 0.3);
            break;
            
        case 'missile':
            State.adjustMissileAmmo(2);
            playSound(550, 'sine', 0.3, 0.2);
            break;
    }
}

/**
 * Cleanup off-screen pickups
 */
export function cleanupPickups() {
    State.setPickups(State.pickups.filter(p => 
        p.verticalDrop ? p.y < State.height : p.z < 1.2
    ));
    State.setHearts(State.hearts.filter(h => 
        h.verticalDrop ? h.y < State.height : h.z < 1.2
    ));
}
