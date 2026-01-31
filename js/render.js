// APOPHIS - Rendering
// All drawing code for game elements

import * as State from './state.js';
import * as Config from './config.js';
import { findMissileTarget } from './bullets.js';

/**
 * Get mobile scale factor for rendering
 */
function getMobileScale() {
    const isMobile = State.width < 600;
    return isMobile ? Math.min(State.width / 400, 0.7) * 0.75 : 1;
}

// =============================================================================
// Background Rendering
// =============================================================================

/**
 * Render background elements
 */
export function renderBackground() {
    const ctx = State.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#000810';
    ctx.fillRect(0, 0, State.width, State.height);
    
    // Grid (chapters 2 & 3 only)
    const showGrid = State.chapter === 2 || State.chapter === 3;
    if (showGrid) {
        const gridIntensity = 0.1 + (Math.abs(State.shipAngle) * 0.2) + (State.shieldActive ? 0.3 : 0);
        ctx.strokeStyle = `rgba(0, 255, 255, ${gridIntensity})`;
        ctx.shadowBlur = 10 * gridIntensity;
        ctx.shadowColor = '#00ffff';
        for (let i = -1000; i <= 1000; i += 100) {
            ctx.beginPath();
            ctx.moveTo(State.width/2, State.height*0.3);
            ctx.lineTo(State.width/2 + i, State.height);
            ctx.stroke();
        }
    }
    
    // Stars
    if (State.chapter === 3) {
        // Warp speed effect
        const horizonX = State.width / 2;
        const horizonY = State.height * 0.3;
        
        State.stars.forEach(s => {
            const dx = s.x - horizonX;
            const dy = s.y - horizonY;
            const angle = Math.atan2(dy, dx);
            const speed = s.speed * 200;
            s.x += Math.cos(angle) * speed;
            s.y += Math.sin(angle) * speed;
            
            if (s.x < 0 || s.x > State.width || s.y < 0 || s.y > State.height) {
                s.x = horizonX + (Math.random() - 0.5) * 50;
                s.y = horizonY + (Math.random() - 0.5) * 50;
            }
            
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 0;
            ctx.fillRect(s.x, s.y, s.z * 3, s.z * 3);
        });
    } else {
        // Normal star movement
        const starSpeedMultiplier = State.chapter === 4 ? 400 : 15;
        State.stars.forEach(s => {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 0;
            ctx.fillRect(s.x, s.y, s.z * 3, s.z * 3);
            s.y = (s.y + s.speed * starSpeedMultiplier) % State.height;
        });
    }
}

// =============================================================================
// Entity Rendering
// =============================================================================

/**
 * Render mini-bosses
 */
export function renderMiniBosses() {
    const ctx = State.ctx;
    const scale = getMobileScale();
    
    State.miniBosses.forEach(mb => {
        const sz = 15 * scale;
        const szW = 20 * scale;
        
        ctx.strokeStyle = mb.color1;
        ctx.shadowColor = mb.color1;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mb.x, mb.y - sz);
        ctx.lineTo(mb.x + szW, mb.y);
        ctx.lineTo(mb.x, mb.y + sz);
        ctx.lineTo(mb.x - szW, mb.y);
        ctx.closePath();
        ctx.stroke();
        
        // Secondary color accent
        ctx.strokeStyle = mb.color2;
        ctx.shadowColor = mb.color2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mb.x, mb.y, 8 * scale, 0, Math.PI * 2);
        ctx.stroke();
        
        // Health bar
        const barW = 80 * scale;
        ctx.fillStyle = '#440044';
        ctx.fillRect(mb.x - barW/2, mb.y - 30 * scale, barW, 4);
        ctx.fillStyle = mb.color1;
        ctx.fillRect(mb.x - barW/2, mb.y - 30 * scale, barW * (mb.hp / mb.maxHp), 4);
    });
}

/**
 * Render mini-boss bullets
 */
export function renderMiniBossBullets() {
    const ctx = State.ctx;
    
    State.miniBossBullets.forEach(mbb => {
        ctx.shadowBlur = 12;
        if (mbb.type === 'line') {
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.fillRect(mbb.x - 2, mbb.y, 4, 12);
        } else if (mbb.type === 'circle') {
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = '#ff6600';
            ctx.beginPath();
            ctx.arc(mbb.x, mbb.y, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (mbb.type === 'triangle') {
            ctx.fillStyle = '#ff00ff';
            ctx.shadowColor = '#ff00ff';
            ctx.beginPath();
            ctx.moveTo(mbb.x, mbb.y - 6);
            ctx.lineTo(mbb.x + 5, mbb.y + 6);
            ctx.lineTo(mbb.x - 5, mbb.y + 6);
            ctx.closePath();
            ctx.fill();
        }
    });
}

/**
 * Render missiles
 */
export function renderMissiles() {
    const ctx = State.ctx;
    
    State.missiles.forEach(m => {
        let angle = -Math.PI / 2;
        
        if (m.bounced) {
            angle = Math.atan2(m.bounceVy, m.bounceVx) + State.time * 0.5;
        } else if (m.trail.length > 0) {
            const lastTrail = m.trail[m.trail.length - 1];
            angle = Math.atan2(m.y - lastTrail.y, m.x - lastTrail.x);
        }
        
        // Draw trail
        ctx.shadowBlur = 8;
        m.trail.forEach((t, i) => {
            const alpha = (i + 1) / m.trail.length * 0.6;
            const size = 3 + (i / m.trail.length) * 4;
            ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.shadowColor = '#ff6600';
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw missile body
        ctx.fillStyle = '#ff3300';
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 20;
        
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(angle + Math.PI / 2);
        
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-6, 8);
        ctx.lineTo(0, 4);
        ctx.lineTo(6, 8);
        ctx.closePath();
        ctx.fill();
        
        // Engine glow
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(0, 6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

/**
 * Render the Harasser boss
 */
export function renderBoss() {
    const ctx = State.ctx;
    const scale = getMobileScale();
    
    State.harassers.forEach(h => {
        const sz = 20 * scale;
        const szW = 30 * scale;
        
        ctx.strokeStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(h.x, h.y - sz);
        ctx.lineTo(h.x + szW, h.y);
        ctx.lineTo(h.x, h.y + sz);
        ctx.lineTo(h.x - szW, h.y);
        ctx.closePath();
        ctx.stroke();
        
        // Health bar
        const barW = 120 * scale;
        ctx.fillStyle = '#440044';
        ctx.fillRect(h.x - barW/2, h.y - 45 * scale, barW, 6);
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(h.x - barW/2, h.y - 45 * scale, barW * (h.hp / h.maxHp), 6);
    });
}

/**
 * Render boss bullets
 */
export function renderBossBullets() {
    const ctx = State.ctx;
    
    State.harasserBullets.forEach(hb => {
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00ff';
        ctx.fillRect(hb.x - 2, hb.y, 4, 15);
    });
}

/**
 * Render trench walls and obstacles
 */
export function renderTrenchBlocks() {
    const ctx = State.ctx;
    const scale = getMobileScale();
    
    State.trenchBlocks.forEach(b => {
        const bx = State.width/2 + b.worldLane * Config.FOV_SCALE * b.z;
        const by = State.height*0.3 + b.z * State.height*0.5;
        
        if (b.isSingleBlock) {
            const sz = 90 * b.z * scale;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.random()*0.3})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(bx, by - sz);
            ctx.lineTo(bx + sz/1.5, by);
            ctx.lineTo(bx - sz/1.5, by);
            ctx.closePath();
            ctx.fill();
        } else {
            const sz = 180 * b.z * scale;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.random()*0.3})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(bx, by - sz);
            ctx.lineTo(bx + sz/1.5, by);
            ctx.lineTo(bx - sz/1.5, by);
            ctx.closePath();
            ctx.fill();
        }
    });
}

/**
 * Render player bullets
 */
export function renderBullets() {
    const ctx = State.ctx;
    
    State.bullets.forEach(b => {
        const bY = b.y;
        let bSize = 4;
        let bLength = 35;
        
        // Scale bullets in chapters 2 & 3
        if ((State.chapter === 2 || State.chapter === 3) && b.distanceToHorizon !== undefined) {
            const maxDistance = 400;
            const normalizedDistance = Math.min(b.distanceToHorizon / maxDistance, 1);
            const scale = 0.2 + (normalizedDistance * 0.8);
            bSize *= scale;
            bLength *= scale;
        }
        
        ctx.shadowBlur = 15;
        
        if (b.type === 'bounced') {
            const alpha = b.bounceLife / 60;
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 10 * alpha;
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(State.time * 0.3);
            ctx.fillRect(-3, -3, 6, 6);
            ctx.restore();
        } else if (b.type === 'vertical-laser') {
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(b.x - (b.width || 4) * (bSize/4), bY, (b.width || 4) * (bSize/2), 40 * (bLength/35));
        } else if (b.type === 'vertical-scatter') {
            ctx.fillStyle = '#ff00ff';
            ctx.shadowColor = '#ff00ff';
            ctx.fillRect(b.x - bSize, bY, bSize * 2, 25 * (bLength/35));
        } else if (b.type === 'vertical-sine') {
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.fillRect(b.x - bSize/2, bY, bSize, 30 * (bLength/35));
        } else {
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.fillRect(b.x - bSize/2, bY, bSize, bLength);
        }
    });
}

/**
 * Render pickups
 */
export function renderPickups() {
    const ctx = State.ctx;
    const mobileScale = getMobileScale();
    
    State.pickups.forEach(p => {
        let sz, px, py;
        
        if (p.verticalDrop) {
            sz = (p.size || 25) * mobileScale;
            px = p.x;
            py = p.y;
        } else {
            sz = 25 * p.z * mobileScale;
            px = State.width/2 + p.worldLane * Config.FOV_SCALE * p.z;
            py = State.height*0.3 + p.z * State.height*0.5;
        }
        
        ctx.shadowBlur = 15;
        ctx.font = `${Math.floor(12 * mobileScale)}px Courier New`;
        ctx.textAlign = 'center';
        
        if (p.type === 'weapon') {
            ctx.strokeStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillText('W', px, py + 4);
        } else if (p.type === 'boomba') {
            ctx.strokeStyle = '#ff6600';
            ctx.shadowColor = '#ff6600';
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillText('B', px, py + 4);
        } else if (p.type === 'invuln') {
            ctx.strokeStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillText('I', px, py + 4);
        } else if (p.type === 'extralife') {
            ctx.strokeStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw tiny ship inside
            ctx.save();
            ctx.translate(px, py);
            const scale = sz / 80;
            ctx.scale(scale, scale);
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, -25);
            ctx.lineTo(-30, 10);
            ctx.lineTo(0, 5);
            ctx.lineTo(30, 10);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        } else if (p.type === 'shield') {
            ctx.strokeStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillText('s', px, py + 4);
        } else if (p.type === 'missile') {
            ctx.strokeStyle = '#ff3300';
            ctx.shadowColor = '#ff6600';
            ctx.fillStyle = '#ff3300';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillText('M', px, py + 4);
        }
    });
}

/**
 * Render hearts
 */
export function renderHearts() {
    const ctx = State.ctx;
    const scale = getMobileScale();
    
    State.hearts.forEach(h => {
        let sz, hx, hy;
        
        if (h.verticalDrop) {
            sz = (h.size || 20) * scale;
            hx = h.x;
            hy = h.y;
        } else {
            sz = 20 * h.z * scale;
            hx = State.width/2 + h.worldLane * Config.FOV_SCALE * h.z;
            hy = State.height*0.3 + h.z * State.height*0.5;
        }
        
        ctx.strokeStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy + sz/4);
        ctx.bezierCurveTo(hx, hy - sz/4, hx - sz, hy - sz/4, hx - sz, hy + sz/4);
        ctx.bezierCurveTo(hx - sz, hy + sz, hx, hy + sz * 1.2, hx, hy + sz * 1.5);
        ctx.bezierCurveTo(hx, hy + sz * 1.2, hx + sz, hy + sz, hx + sz, hy + sz/4);
        ctx.bezierCurveTo(hx + sz, hy - sz/4, hx, hy - sz/4, hx, hy + sz/4);
        ctx.stroke();
    });
}

/**
 * Render enemies
 */
export function renderEnemies() {
    const ctx = State.ctx;
    const scale = getMobileScale();
    
    State.enemies.forEach(e => {
        let sz, ex, ey;
        
        if (e.verticalDrop) {
            sz = e.size * scale;
            ex = e.x;
            ey = e.y;
        } else {
            sz = e.size * e.z * scale;
            ex = State.width/2 + e.worldLane * Config.FOV_SCALE * e.z;
            ey = State.height*0.3 + e.z * State.height*0.5;
        }
        
        if (e.isBlockdot) {
            ctx.strokeStyle = '#ff6600';
            ctx.shadowColor = '#ff6600';
            ctx.lineWidth = 2;
            ctx.strokeRect(ex - sz, ey - sz, sz * 2, sz * 2);
            
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(ex, ey, sz * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = '#ff3333';
            ctx.shadowColor = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(ex - sz, ey - sz, sz * 2, sz * 2);
        }
    });
}

/**
 * Render particles
 */
export function renderParticles() {
    const ctx = State.ctx;
    ctx.shadowBlur = 0;
    
    State.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 60;
        ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1;
}

/**
 * Render player ship
 */
export function renderPlayer() {
    const ctx = State.ctx;
    
    if (State.gameOver || State.respawnTimer > 0) return;
    
    const scale = getMobileScale();
    
    ctx.save();
    ctx.translate(State.shipX, State.shipY);
    ctx.rotate(State.shipAngle * 0.2);
    ctx.scale(scale, scale);
    
    // Invulnerability effect
    if (State.invulnerabilityTimer > 0) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3 + Math.sin(State.time * 0.5) * 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, 85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    // Shield effect
    if (State.shieldActive) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 75 + Math.sin(State.time * 0.5) * 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Charging boomba effect
    if (State.chargingBoomba) {
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5 + (State.boombaCharge / 300) * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, 60 + (State.boombaCharge / 300) * 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    // Ship body
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(-45, 15);
    ctx.lineTo(0, 5);
    ctx.lineTo(45, 15);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    
    // Missile lock-on indicator
    if (State.missileAmmo > 0 && State.missileCooldown === 0) {
        const targetInfo = findMissileTarget();
        if (targetInfo) {
            const target = targetInfo.target;
            ctx.strokeStyle = '#ff3300';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 15;
            ctx.lineWidth = 2;
            
            const pulseSize = 25 + Math.sin(State.time * 0.2) * 5;
            
            ctx.beginPath();
            ctx.moveTo(target.x - pulseSize, target.y - pulseSize + 10);
            ctx.lineTo(target.x - pulseSize, target.y - pulseSize);
            ctx.lineTo(target.x - pulseSize + 10, target.y - pulseSize);
            ctx.moveTo(target.x + pulseSize - 10, target.y - pulseSize);
            ctx.lineTo(target.x + pulseSize, target.y - pulseSize);
            ctx.lineTo(target.x + pulseSize, target.y - pulseSize + 10);
            ctx.moveTo(target.x + pulseSize, target.y + pulseSize - 10);
            ctx.lineTo(target.x + pulseSize, target.y + pulseSize);
            ctx.lineTo(target.x + pulseSize - 10, target.y + pulseSize);
            ctx.moveTo(target.x - pulseSize + 10, target.y + pulseSize);
            ctx.lineTo(target.x - pulseSize, target.y + pulseSize);
            ctx.lineTo(target.x - pulseSize, target.y + pulseSize - 10);
            ctx.stroke();
            
            ctx.fillStyle = '#ff3300';
            ctx.font = 'bold 10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('LOCK', target.x, target.y + pulseSize + 12);
        }
    }
}

/**
 * Render shield and health bars
 */
export function renderBars() {
    const ctx = State.ctx;
    
    // Mobile scaling
    const isMobile = State.width < 600;
    const barWidth = isMobile ? 10 : 15;
    const rightOffset = isMobile ? 25 : 40;
    const healthOffset = isMobile ? 45 : 70;
    
    // Shield bar
    ctx.strokeStyle = '#333';
    ctx.strokeRect(State.width - rightOffset, State.height * 0.3, barWidth, State.height * 0.4);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(State.width - rightOffset, State.height * 0.7, barWidth, -(State.height * 0.4 * (State.shieldLevel / 100)));
    
    // Health bar
    const healthBarX = State.width - healthOffset;
    ctx.strokeStyle = '#333';
    ctx.strokeRect(healthBarX, State.height * 0.3, barWidth, State.height * 0.4);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(healthBarX, State.height * 0.7, barWidth, -(State.height * 0.4 * (State.health / Config.MAX_HEALTH)));
}

/**
 * Render touch control buttons (mobile only)
 */
export function renderTouchControls() {
    if (State.width >= 600) return;
    
    const ctx = State.ctx;
    const w = State.width;
    const h = State.height;
    
    const btnSize = 45;
    const leftMargin = 15;
    const verticalSpacing = 12;
    const startY = h * 0.28;
    
    ctx.lineWidth = 2;
    ctx.font = '12px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shield button - top (yellow)
    const shieldY = startY;
    ctx.globalAlpha = State.touchButtons?.shield ? 0.7 : 0.35;
    ctx.strokeStyle = State.touchButtons?.shield ? '#ffff00' : '#666600';
    ctx.fillStyle = State.touchButtons?.shield ? '#ffff00' : '#666600';
    ctx.beginPath();
    ctx.arc(leftMargin + btnSize/2, shieldY + btnSize/2, btnSize/2 - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffff00';
    ctx.fillText('SHLD', leftMargin + btnSize/2, shieldY + btnSize/2);
    
    // Missile button (orange)
    const missileY = startY + btnSize + verticalSpacing;
    ctx.globalAlpha = State.touchButtons?.missile ? 0.7 : 0.35;
    ctx.strokeStyle = State.touchButtons?.missile ? '#ff6600' : '#663300';
    ctx.fillStyle = State.touchButtons?.missile ? '#ff6600' : '#663300';
    ctx.beginPath();
    ctx.arc(leftMargin + btnSize/2, missileY + btnSize/2, btnSize/2 - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ff6600';
    ctx.fillText('MISL', leftMargin + btnSize/2, missileY + btnSize/2);
    
    // Boomba button (red/orange)
    const boombaY = startY + (btnSize + verticalSpacing) * 2;
    ctx.globalAlpha = State.touchButtons?.boomba ? 0.7 : 0.35;
    ctx.strokeStyle = State.touchButtons?.boomba ? '#ff3300' : '#661100';
    ctx.fillStyle = State.touchButtons?.boomba ? '#ff3300' : '#661100';
    ctx.beginPath();
    ctx.arc(leftMargin + btnSize/2, boombaY + btnSize/2, btnSize/2 - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ff3300';
    ctx.fillText('BOOM', leftMargin + btnSize/2, boombaY + btnSize/2);
    
    // Weapon Up button (cyan)
    const weaponUpY = startY + (btnSize + verticalSpacing) * 3;
    ctx.globalAlpha = State.touchButtons?.weaponUp ? 0.7 : 0.35;
    ctx.strokeStyle = State.touchButtons?.weaponUp ? '#00ffff' : '#006666';
    ctx.fillStyle = State.touchButtons?.weaponUp ? '#00ffff' : '#006666';
    ctx.beginPath();
    ctx.arc(leftMargin + btnSize/2, weaponUpY + btnSize/2, btnSize/2 - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#00ffff';
    ctx.fillText('WPN▲', leftMargin + btnSize/2, weaponUpY + btnSize/2);
    
    // Weapon Down button (cyan)
    const weaponDownY = startY + (btnSize + verticalSpacing) * 4;
    ctx.globalAlpha = State.touchButtons?.weaponDown ? 0.7 : 0.35;
    ctx.strokeStyle = State.touchButtons?.weaponDown ? '#00ffff' : '#006666';
    ctx.fillStyle = State.touchButtons?.weaponDown ? '#00ffff' : '#006666';
    ctx.beginPath();
    ctx.arc(leftMargin + btnSize/2, weaponDownY + btnSize/2, btnSize/2 - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#00ffff';
    ctx.fillText('WPN▼', leftMargin + btnSize/2, weaponDownY + btnSize/2);
    
    ctx.globalAlpha = 1;
}
