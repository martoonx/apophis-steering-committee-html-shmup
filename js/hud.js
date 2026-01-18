// APOPHIS - HUD & Overlays
// HUD rendering and overlay screens (game over, transitions)

import * as State from './state.js';
import * as Config from './config.js';

/**
 * Render the complete HUD
 */
export function renderHUD() {
    const ctx = State.ctx;
    ctx.shadowBlur = 0;
    ctx.font = '14px Courier New';
    ctx.textAlign = 'left';
    
    // Weapon display
    const weaponName = Config.WEAPON_NAMES[State.weaponInventory[State.currentWeapon]] || 'DEFAULT';
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`WEAPON: ${weaponName}`, 20, State.height - 100);
    
    // Missiles
    ctx.fillStyle = State.missileAmmo <= 2 ? '#ff3300' : '#ff6600';
    ctx.fillText(`MISSILES: ${State.missileAmmo}/${Config.MAX_MISSILE_AMMO}`, 20, State.height - 80);
    
    // Boombas
    ctx.fillStyle = '#ff6600';
    ctx.fillText(`BOOMBAS: ${State.boombaQueue.length}/${Config.MAX_BOOMBA_QUEUE}`, 20, State.height - 60);
    
    if (State.boombaQueue.length > 0) {
        const display = State.boombaQueue.slice(0, 3).map((b, idx) => {
            const labels = { area: 'AREA', screen: 'SCREEN', charged: 'CHARGED' };
            return idx === 0 ? `[${labels[b]}]` : labels[b];
        }).join(' → ');
        ctx.fillStyle = '#ffaa66';
        ctx.fillText(display, 20, State.height - 40);
    }
    
    // Invulnerability
    if (State.invulnerabilityTimer > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`INVULN: ${Math.ceil(State.invulnerabilityTimer / 60)}s`, 20, State.height - 20);
    }
    
    // Right side icons
    renderSideIcons();
}

/**
 * Render the side icons (lives, weapons, boombas)
 */
function renderSideIcons() {
    const ctx = State.ctx;
    const healthBarX = State.width - 70;
    const iconAreaRightEdge = healthBarX - 30;
    
    // Lives indicator - tiny ship icons stacked vertically
    ctx.shadowBlur = 0;
    const shipIconSize = 0.4;
    const verticalSpacing = 20;
    const lifeIconsX = iconAreaRightEdge - 20;
    const lifeIconsStartY = State.height * 0.35;
    
    for (let i = 0; i < State.lives; i++) {
        const x = lifeIconsX;
        const y = lifeIconsStartY + i * verticalSpacing;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(shipIconSize, shipIconSize);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(-45, 15);
        ctx.lineTo(0, 5);
        ctx.lineTo(45, 15);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    
    // Upgrade icons
    let upgradeX = lifeIconsX;
    let upgradeY = lifeIconsStartY + (State.lives * verticalSpacing) + 15;
    const iconSize = 10;
    const iconSpacing = 18;
    
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    
    // Weapon icons
    for (let idx = 0; idx < State.weaponInventory.length; idx++) {
        const weaponId = State.weaponInventory[idx];
        const isActive = idx === State.currentWeapon;
        ctx.fillStyle = isActive ? '#00ffff' : '#004444';
        ctx.strokeStyle = isActive ? '#00ffff' : '#004444';
        
        ctx.beginPath();
        ctx.arc(upgradeX, upgradeY, iconSize, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Config.WEAPON_ICONS[weaponId], upgradeX, upgradeY);
        
        upgradeY += iconSpacing;
    }
    
    // Boomba queue icons
    upgradeY += 5;
    const slotsToShow = Math.min(5, Math.max(3, State.boombaQueue.length));
    
    for (let i = 0; i < slotsToShow; i++) {
        const hasBoomba = i < State.boombaQueue.length;
        const boomba = hasBoomba ? State.boombaQueue[i] : null;
        const isNext = i === 0 && hasBoomba;
        const isCharging = isNext && State.chargingBoomba;
        
        if (hasBoomba) {
            let letter, baseColor;
            if (boomba === 'area') {
                letter = 'A';
                baseColor = '#ff6600';
            } else if (boomba === 'screen') {
                letter = 'S';
                baseColor = '#ff0000';
            } else {
                letter = 'C';
                baseColor = '#ff6600';
            }
            
            const color = isCharging ? '#ffff00' : (isNext ? '#ffaa66' : baseColor);
            const alpha = isNext ? 1 : 0.5;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = isNext ? 3 : 2;
            
            ctx.beginPath();
            ctx.arc(upgradeX, upgradeY, iconSize, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.font = 'bold 12px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter, upgradeX, upgradeY);
            
            ctx.globalAlpha = 1;
        } else {
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.arc(upgradeX, upgradeY, iconSize, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.globalAlpha = 1;
        }
        
        upgradeY += iconSpacing;
    }
    
    // "+X more" indicator
    if (State.boombaQueue.length > 5) {
        ctx.fillStyle = '#ff6600';
        ctx.globalAlpha = 0.7;
        ctx.font = 'bold 10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`+${State.boombaQueue.length - 5}`, upgradeX, upgradeY);
        ctx.globalAlpha = 1;
    }
    
    // Invulnerability icon
    if (State.invulnerabilityTimer > 0) {
        upgradeY += 5;
        const pulseAlpha = 0.5 + Math.sin(State.time * 0.3) * 0.5;
        ctx.globalAlpha = pulseAlpha;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(upgradeX, upgradeY, iconSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('I', upgradeX, upgradeY);
        ctx.globalAlpha = 1;
    }
}

/**
 * Render game over screen
 */
export function renderGameOver() {
    if (!State.gameOver || State.deathTimer > 0) return;
    
    const ctx = State.ctx;
    
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, State.width, State.height);
    ctx.textAlign = 'center';
    
    // GAME OVER
    ctx.font = 'bold 64px Courier New';
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#ff0000';
    ctx.fillText('GAME OVER', State.width/2, State.height/2 - 140);
    
    // APOPHIS STEERING COMMITTEE
    ctx.font = '16px Courier New';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.fillText('APOPHIS STEERING COMMITTEE-27', State.width/2, State.height/2 - 90);
    
    // EARTH DEFENSE FAILURE
    ctx.font = 'bold 20px Courier New';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('EARTH DEFENSE FAILURE — APOPHIS ADVANCES', State.width/2, State.height/2 - 40);
    
    // FINAL SCORE label
    ctx.font = '18px Courier New';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#888888';
    ctx.fillStyle = '#888888';
    ctx.fillText('FINAL SCORE', State.width/2, State.height/2 + 20);
    
    // Score with color cycling glow
    const hue = (State.time * 2) % 360;
    ctx.font = 'bold 56px Courier New';
    ctx.shadowBlur = 35;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`${State.score} PTS`, State.width/2, State.height/2 + 80);
    
    // PRESS -R- TO RESTART
    const blink = Math.sin(State.time * 0.08) > 0;
    if (blink) {
        ctx.font = '20px Courier New';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('PRESS -R- TO RESTART', State.width/2, State.height/2 + 150);
    }
    ctx.shadowBlur = 0;
}

/**
 * Render level transition screen
 */
export function renderLevelTransition() {
    if (State.levelTransitionTimer <= 0) return;
    
    const ctx = State.ctx;
    
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, State.width, State.height);
    ctx.fillStyle = '#00ff00';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00ff00';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${State.level - 1} COMPLETE`, State.width/2, State.height/2 - 100);
    
    ctx.font = 'bold 32px Courier New';
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.fillText(`BOSS DEFEATED: +${State.bossScoreGained} POINTS`, State.width/2, State.height/2 - 40);
    
    // Score with color cycling
    const hue = (State.time * 2) % 360;
    ctx.font = 'bold 36px Courier New';
    ctx.shadowBlur = 25;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`YOU'VE AMASSED ${State.score} PTS`, State.width/2, State.height/2 + 30);
    
    ctx.font = 'bold 36px Courier New';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 30;
    ctx.fillText(`ENTERING LEVEL ${State.level}`, State.width/2, State.height/2 + 100);
    ctx.shadowBlur = 0;
}

/**
 * Render boss defeated celebration
 */
export function renderBossDefeated() {
    if (State.bossDefeatedTimer <= 0) return;
    
    const ctx = State.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, State.width, State.height);
}

/**
 * Render chapter transition screen
 */
export function renderChapterTransition() {
    if (State.chapterTransitionTimer <= 0) return;
    
    const ctx = State.ctx;
    
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, State.width, State.height);
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ffff00';
    ctx.font = 'bold 40px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`CHAPTER ${State.chapter}: ${Config.CHAPTER_NAMES[State.chapter - 1]}`, State.width/2, State.height/2 - 30);
    
    // Score with color cycling
    const hue = (State.time * 2) % 360;
    ctx.font = 'bold 28px Courier New';
    ctx.shadowBlur = 20;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`YOU'VE AMASSED ${State.score} PTS`, State.width/2, State.height/2 + 30);
    ctx.shadowBlur = 0;
}

/**
 * Update sector display in DOM
 */
export function updateSectorDisplay() {
    if (State.sectorEl) {
        State.sectorEl.innerText = `LEVEL ${State.level} - ${Config.CHAPTER_NAMES[State.chapter - 1]}`;
    }
}
