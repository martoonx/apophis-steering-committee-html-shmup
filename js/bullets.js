// APOPHIS - Bullets & Missiles
// Bullet creation, missile logic, and particle effects

import * as State from './state.js';
import * as Config from './config.js';
import { playSound } from './audio.js';

// =============================================================================
// Particle Effects
// =============================================================================

/**
 * Create a basic explosion
 */
export function createExplosion(x, y) {
    const colors = Config.EXPLOSION_COLORS;
    for (let i = 0; i < 25; i++) {
        State.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            life: 50,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

/**
 * Create a damage explosion when player is hit
 */
export function createDamageExplosion(x, y) {
    const colors = Config.DAMAGE_EXPLOSION_COLORS;
    for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40;
        const speed = 15 + Math.random() * 10;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 60,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

/**
 * Create a spectacular explosion (for mini-boss death)
 */
export function createSpectacularExplosion(x, y) {
    const colors = Config.MEGA_EXPLOSION_COLORS.slice(0, 7);
    for (let i = 0; i < 80; i++) {
        const angle = (Math.PI * 2 * i) / 80;
        const speed = 20 + Math.random() * 15;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 80,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 8;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 70,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

/**
 * Create a mega boss explosion
 */
export function createMegaBossExplosion(x, y) {
    const colors = Config.MEGA_EXPLOSION_COLORS;
    
    // Massive outer ring
    for (let i = 0; i < 720; i++) {
        const angle = (Math.PI * 2 * i) / 720;
        const speed = 30 + Math.random() * 25;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 120,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    // Medium ring
    for (let i = 0; i < 360; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 15;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 100,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    // Inner explosion
    for (let i = 0; i < 240; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 10;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 130,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    // Spiral patterns
    for (let i = 0; i < 180; i++) {
        const angle = (Math.PI * 8 * i) / 180;
        const speed = 22 + (i * 0.4);
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 110,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    // Shockwave rings
    for (let ring = 0; ring < 5; ring++) {
        for (let i = 0; i < 120; i++) {
            const angle = (Math.PI * 2 * i) / 120;
            const speed = 25 + ring * 8;
            State.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 100 + ring * 10,
                color: colors[ring * 2 % colors.length]
            });
        }
    }
}

/**
 * Create an ultimate explosion (player death)
 */
export function createUltimateExplosion(x, y) {
    const colors = Config.MEGA_EXPLOSION_COLORS.slice(0, 9);
    for (let i = 0; i < 240; i++) {
        const angle = (Math.PI * 2 * i) / 240;
        const speed = 25 + Math.random() * 20;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 100,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 12;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 90,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 8 + Math.random() * 6;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 110,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 4 * i) / 60;
        const speed = 18 + (i * 0.3);
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 85,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

/**
 * Create missile impact explosion
 */
export function createMissileExplosion(x, y) {
    const colors = ['#ff6600', '#ff3300', '#ffaa00', '#ff0000', '#ffffff', '#ffff00'];
    for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60;
        const speed = 18 + Math.random() * 12;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 70,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 8 + Math.random() * 8;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 50,
            color: '#ffffff'
        });
    }
}

/**
 * Create bullet deflection spark
 */
export function createDeflectionSpark(x, y) {
    const colors = ['#ffff00', '#ffffff', '#00ffff'];
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 4;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 15,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

// =============================================================================
// Weapon Firing
// =============================================================================

/**
 * Fire the current weapon
 */
export function fireWeapon() {
    const weapon = State.weaponInventory[State.currentWeapon];
    const bulletStartY = State.shipY - 35;
    
    // Chapters 2 & 3: Angle bullets toward horizon center
    const horizonCenterX = State.width / 2;
    const horizonCenterY = State.height * 0.3;
    
    if (State.chapter === 2 || State.chapter === 3) {
        const dx = horizonCenterX - State.shipX;
        const dy = horizonCenterY - bulletStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        switch(weapon) {
            case 0: // Default rapid shot
                const speed0 = 12;
                State.bullets.push({ 
                    x: State.shipX, 
                    y: bulletStartY, 
                    vx: (dx / distance) * speed0,
                    vy: (dy / distance) * speed0,
                    type: 'vertical', 
                    originX: State.shipX 
                });
                playSound(800, 'square', 0.1, 0.05);
                break;
            case 1: // Sine wave
                const speed1 = 12;
                State.bullets.push({ 
                    x: State.shipX, 
                    y: bulletStartY, 
                    vx: (dx / distance) * speed1,
                    vy: (dy / distance) * speed1,
                    baseVx: (dx / distance) * speed1,
                    type: 'vertical-sine', 
                    phase: State.time, 
                    originX: State.shipX 
                });
                playSound(900, 'sine', 0.1, 0.05);
                break;
            case 2: // Scatter shot
                const speed2 = 14;
                for (let i = -2; i <= 2; i++) {
                    const spreadAngle = Math.atan2(dy, dx) + (i * 0.15);
                    State.bullets.push({ 
                        x: State.shipX + i * 15, 
                        y: bulletStartY, 
                        vx: Math.cos(spreadAngle) * speed2,
                        vy: Math.sin(spreadAngle) * speed2,
                        type: 'vertical-scatter', 
                        spread: i, 
                        originX: State.shipX + i * 15 
                    });
                }
                playSound(700, 'square', 0.15, 0.08);
                break;
            case 3: // Laser
                const speed3 = 16;
                State.bullets.push({ 
                    x: State.shipX, 
                    y: bulletStartY, 
                    vx: (dx / distance) * speed3,
                    vy: (dy / distance) * speed3,
                    type: 'vertical-laser', 
                    width: 8, 
                    originX: State.shipX 
                });
                playSound(1200, 'sawtooth', 0.2, 0.1);
                break;
        }
    } else {
        // Chapters 1 & 4: Simple vertical bullets
        switch(weapon) {
            case 0:
                State.bullets.push({ x: State.shipX, y: bulletStartY, vy: -12, type: 'vertical', originX: State.shipX });
                playSound(800, 'square', 0.1, 0.05);
                break;
            case 1:
                State.bullets.push({ x: State.shipX, y: bulletStartY, vy: -12, vx: 0, type: 'vertical-sine', phase: State.time, originX: State.shipX });
                playSound(900, 'sine', 0.1, 0.05);
                break;
            case 2:
                for (let i = -2; i <= 2; i++) {
                    State.bullets.push({ x: State.shipX + i * 15, y: bulletStartY, vy: -14, vx: i * 2, type: 'vertical-scatter', spread: i, originX: State.shipX + i * 15 });
                }
                playSound(700, 'square', 0.15, 0.08);
                break;
            case 3:
                State.bullets.push({ x: State.shipX, y: bulletStartY, vy: -16, type: 'vertical-laser', width: 8, originX: State.shipX });
                playSound(1200, 'sawtooth', 0.2, 0.1);
                break;
        }
    }
}

/**
 * Update all bullets
 */
export function updateBullets() {
    State.bullets.forEach(b => {
        // Chapters 2 & 3: Continuously home toward horizon center
        if ((State.chapter === 2 || State.chapter === 3) && b.vx !== undefined && b.vy !== undefined) {
            const horizonCenterX = State.width / 2;
            const horizonCenterY = State.height * 0.3;
            
            const dx = horizonCenterX - b.x;
            const dy = horizonCenterY - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            b.distanceToHorizon = distance;
            
            if (distance <= 80) {
                b.reachedHorizon = true;
            }
            
            if (distance > 5) {
                const speed = 12;
                b.vx = (dx / distance) * speed;
                b.vy = (dy / distance) * speed;
            }
        }
        
        // Apply velocity
        if (b.vx !== undefined) b.x += b.vx;
        if (b.vy !== undefined) b.y += b.vy;
        
        // Sine wave movement for chapters 1 & 4
        if ((State.chapter === 1 || State.chapter === 4) && b.type === 'vertical-sine') {
            b.x = b.originX + Math.sin((State.time - b.phase) * 0.2) * 50;
        }
    });
    
    // Cleanup bullets
    if (State.chapter === 1 || State.chapter === 4) {
        State.setBullets(State.bullets.filter(b => b.y > -50));
    } else {
        State.setBullets(State.bullets.filter(b => !b.reachedHorizon));
    }
    
    // Update bounced bullets
    State.setBullets(State.bullets.filter(b => {
        if (b.bounced) {
            b.bounceLife--;
            return b.bounceLife > 0 && b.x > 0 && b.x < State.width && b.y > 0 && b.y < State.height;
        }
        return true;
    }));
}

// =============================================================================
// Missile System
// =============================================================================

/**
 * Find valid missile target
 */
export function findMissileTarget() {
    if (State.miniBosses.length > 0) {
        let closest = null;
        let closestDist = Infinity;
        State.miniBosses.forEach(mb => {
            const dist = Math.hypot(mb.x - State.shipX, mb.y - State.shipY);
            if (dist < closestDist) {
                closestDist = dist;
                closest = mb;
            }
        });
        return { target: closest, type: 'miniboss' };
    }
    if (State.harassers.length > 0) {
        return { target: State.harassers[0], type: 'boss' };
    }
    return null;
}

/**
 * Fire a missile
 */
export function fireMissile() {
    if (State.missileAmmo <= 0 || State.missileCooldown > 0) return false;
    
    const targetInfo = findMissileTarget();
    if (!targetInfo) return false;
    
    const target = targetInfo.target;
    
    State.missiles.push({
        x: State.shipX,
        y: State.shipY - 20,
        targetType: targetInfo.type,
        target: target,
        startX: State.shipX,
        startY: State.shipY - 20,
        progress: 0,
        speed: 0.025,
        trail: []
    });
    
    State.adjustMissileAmmo(-1);
    State.setMissileCooldown(Config.MISSILE_COOLDOWN_FRAMES);
    
    playSound(150, 'sawtooth', 0.4, 0.25);
    playSound(80, 'square', 0.3, 0.15);
    
    return true;
}

/**
 * Update all missiles
 */
export function updateMissiles() {
    for (let mi = State.missiles.length - 1; mi >= 0; mi--) {
        const m = State.missiles[mi];
        
        // Skip bounced missiles - handled separately
        if (m.bounced) continue;
        
        // Check if target still exists
        let targetExists = false;
        let targetX, targetY;
        
        if (m.targetType === 'miniboss') {
            if (State.miniBosses.includes(m.target)) {
                targetExists = true;
                targetX = m.target.x;
                targetY = m.target.y;
            }
        } else if (m.targetType === 'boss') {
            if (State.harassers.includes(m.target)) {
                targetExists = true;
                targetX = m.target.x;
                targetY = m.target.y;
            }
        }
        
        if (!targetExists) {
            m.y -= 15;
            if (m.y < -50) State.missiles.splice(mi, 1);
            continue;
        }
        
        // Store trail
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 8) m.trail.shift();
        
        // Progress along arc
        m.progress += m.speed;
        
        // Bezier curve for arc
        const arcSide = (m.startX < State.width / 2) ? 1 : -1;
        const controlX = (m.startX + targetX) / 2 + arcSide * 150;
        const controlY = Math.min(m.startY, targetY) - 100;
        
        const t = Math.min(m.progress, 1);
        const t1 = 1 - t;
        
        m.x = t1 * t1 * m.startX + 2 * t1 * t * controlX + t * t * targetX;
        m.y = t1 * t1 * m.startY + 2 * t1 * t * controlY + t * t * targetY;
        
        // Check for impact
        const dist = Math.hypot(m.x - targetX, m.y - targetY);
        if (dist < 40 || m.progress >= 1) {
            
            if (m.targetType === 'miniboss') {
                // Missiles hit mini-bosses normally
                createMissileExplosion(targetX, targetY);
                playSound(60, 'sawtooth', 0.6, 0.4);
                playSound(120, 'square', 0.4, 0.3);
                
                m.target.hp -= 8;
                if (m.target.hp <= 0) {
                    const mbIndex = State.miniBosses.indexOf(m.target);
                    if (mbIndex !== -1) {
                        createSpectacularExplosion(m.target.x, m.target.y);
                        // Drop loot
                        if (Math.random() < 0.5) {
                            State.pickups.push({ x: m.target.x, y: m.target.y, vx: 0, vy: 2, size: 25, type: 'weapon', verticalDrop: true });
                        } else {
                            State.pickups.push({ x: m.target.x, y: m.target.y, vx: 0, vy: 2, size: 25, type: 'extralife', verticalDrop: true });
                        }
                        State.pickups.push({ x: m.target.x + 30, y: m.target.y, vx: 0, vy: 2.5, size: 20, type: 'missile', verticalDrop: true });
                        State.miniBosses.splice(mbIndex, 1);
                        State.addScore(Config.SCORE_MINIBOSS);
                    }
                }
                State.missiles.splice(mi, 1);
            } else if (m.targetType === 'boss') {
                // Missiles BOUNCE off the main boss!
                if (!m.bounced) {
                    createDeflectionSpark(m.x, m.y);
                    createDeflectionSpark(m.x + 10, m.y - 5);
                    createDeflectionSpark(m.x - 10, m.y + 5);
                    createDeflectionSpark(m.x, m.y + 10);
                    playSound(1200, 'sine', 0.05, 0.08);
                    playSound(1200, 'sine', 0.08, 0.12);
                    
                    const bounceAngle = Math.PI / 2 + (Math.random() - 0.5) * 1.5;
                    const bounceSpeed = 12;
                    
                    m.bounced = true;
                    m.bounceVx = Math.cos(bounceAngle) * bounceSpeed;
                    m.bounceVy = Math.sin(bounceAngle) * bounceSpeed;
                    m.bounceLife = 120;
                    m.trail = [];
                    
                    m.x = targetX + Math.cos(bounceAngle) * 60;
                    m.y = targetY + Math.sin(bounceAngle) * 60;
                } else {
                    State.missiles.splice(mi, 1);
                }
            }
        }
    }
    
    // Update bounced missiles
    for (let mi = State.missiles.length - 1; mi >= 0; mi--) {
        const m = State.missiles[mi];
        if (m.bounced) {
            m.trail.push({ x: m.x, y: m.y });
            if (m.trail.length > 12) m.trail.shift();
            
            m.x += m.bounceVx;
            m.y += m.bounceVy;
            m.bounceVy += 0.12;
            m.bounceLife--;
            
            if (m.bounceLife <= 0 || m.y > State.height + 50 || m.x < -50 || m.x > State.width + 50) {
                createDeflectionSpark(m.x, m.y);
                State.missiles.splice(mi, 1);
            }
        }
    }
    
    // Cleanup missiles
    State.setMissiles(State.missiles.filter(m => m.y > -100 && m.y < State.height + 100));
}

/**
 * Update particles
 */
export function updateParticles() {
    State.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.vx *= 0.98;
        p.vy *= 0.98;
    });
    State.setParticles(State.particles.filter(p => p.life > 0));
}
