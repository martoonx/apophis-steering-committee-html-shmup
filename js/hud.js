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
    
    // Mobile scaling
    const isMobile = State.width < 600;
    const scale = isMobile ? 0.8 : 1;
    const fontSize = Math.floor(14 * scale);
    
    ctx.font = `${fontSize}px Courier New`;
    ctx.textAlign = 'left';
    
    // Position adjustments for mobile
    const leftMargin = isMobile ? 10 : 20;
    const bottomOffset = isMobile ? 70 : 100;
    const lineSpacing = isMobile ? 15 : 20;
    
    // Weapon display
    const weaponName = Config.WEAPON_NAMES[State.weaponInventory[State.currentWeapon]] || 'DEFAULT';
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`WEAPON: ${weaponName}`, leftMargin, State.height - bottomOffset);
    
    // Boombas display (unified like weapons)
    const totalBoombas = State.getTotalBoombaCount();
    if (totalBoombas > 0) {
        const currentType = State.getCurrentBoombaType();
        const currentCount = State.getCurrentBoombaCount();
        const boombaName = currentType.toUpperCase();
        ctx.fillStyle = '#ffaa66';
        ctx.fillText(`BOOMBAS: ${boombaName} x${currentCount}`, leftMargin, State.height - bottomOffset + lineSpacing);
    } else {
        ctx.fillStyle = '#666666';
        ctx.fillText(`BOOMBAS: NONE`, leftMargin, State.height - bottomOffset + lineSpacing);
    }
    
    // Missiles
    ctx.fillStyle = State.missileAmmo <= 2 ? '#ff3300' : '#ff6600';
    ctx.fillText(`MISSILES: ${State.missileAmmo}/${Config.MAX_MISSILE_AMMO}`, leftMargin, State.height - bottomOffset + lineSpacing * 2);
    
    // Invulnerability
    if (State.invulnerabilityTimer > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`INVULN: ${Math.ceil(State.invulnerabilityTimer / 60)}s`, leftMargin, State.height - bottomOffset + lineSpacing * 3);
    }
    
    // Right side icons
    renderSideIcons();
}

/**
 * Render the side icons (lives, weapons, boombas)
 */
function renderSideIcons() {
    const ctx = State.ctx;
    
    // Mobile scaling
    const isMobile = State.width < 600;
    const scale = isMobile ? 0.7 : 1;
    
    const healthBarX = State.width - (isMobile ? 50 : 70);
    const iconAreaRightEdge = healthBarX - (isMobile ? 20 : 30);
    
    // Lives indicator - tiny ship icons stacked vertically
    ctx.shadowBlur = 0;
    const shipIconSize = 0.4 * scale;
    const verticalSpacing = 20 * scale;
    const lifeIconsX = iconAreaRightEdge - (isMobile ? 15 : 20);
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
    
    // Boomba icons - only show types the player has
    upgradeY += 5;
    const boombaTypes = ['area', 'screen', 'cluster'];
    const boombaLetters = { area: 'A', screen: 'S', cluster: 'C' };
    const boombaColors = { area: '#ff6600', screen: '#ff0000', cluster: '#ff00ff' };
    const currentBoombaType = State.getCurrentBoombaType();
    
    for (const type of boombaTypes) {
        const count = State.boombaCounts[type];
        
        // Only show if player has this type
        if (count > 0) {
            const isSelected = type === currentBoombaType;
            const isCharging = isSelected && State.chargingBoomba;
            const color = isCharging ? '#ffff00' : (isSelected ? '#ffffff' : boombaColors[type]);
            const alpha = isSelected ? 1 : 0.5;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = isSelected ? 3 : 2;
            
            ctx.beginPath();
            ctx.arc(upgradeX, upgradeY, iconSize, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.font = 'bold 12px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(boombaLetters[type], upgradeX, upgradeY);
            
            // Show count next to icon
            ctx.font = '10px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText('x' + count, upgradeX + iconSize + 3, upgradeY);
            
            ctx.globalAlpha = 1;
            upgradeY += iconSpacing;
        }
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
    const isMobile = State.width < 600;
    const scale = isMobile ? State.width / 500 : 1;
    
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, State.width, State.height);
    ctx.textAlign = 'center';
    
    // GAME OVER
    ctx.font = `bold ${Math.floor(64 * scale)}px Courier New`;
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#ff0000';
    ctx.fillText('GAME OVER', State.width/2, State.height/2 - 140 * scale);
    
    // APOPHIS STEERING COMMITTEE
    ctx.font = `${Math.floor(16 * scale)}px Courier New`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.fillText('APOPHIS STEERING COMMITTEE-27', State.width/2, State.height/2 - 90 * scale);
    
    // EARTH DEFENSE FAILURE
    ctx.font = `bold ${Math.floor(16 * scale)}px Courier New`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('EARTH DEFENSE FAILURE — APOPHIS ADVANCES', State.width/2, State.height/2 - 50 * scale);
    
    // FINAL SCORE label
    ctx.font = `${Math.floor(18 * scale)}px Courier New`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#888888';
    ctx.fillStyle = '#888888';
    ctx.fillText('FINAL SCORE', State.width/2, State.height/2 + 10 * scale);
    
    // Score with color cycling glow
    const hue = (State.time * 2) % 360;
    ctx.font = `bold ${Math.floor(48 * scale)}px Courier New`;
    ctx.shadowBlur = 35;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`${State.score} PTS`, State.width/2, State.height/2 + 70 * scale);
    
    // PRESS -R- TO RESTART (or TAP on mobile)
    const blink = Math.sin(State.time * 0.08) > 0;
    if (blink) {
        ctx.font = `${Math.floor(18 * scale)}px Courier New`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        const restartText = isMobile ? 'TAP TO RESTART' : 'PRESS -R- TO RESTART';
        ctx.fillText(restartText, State.width/2, State.height/2 + 130 * scale);
    }
    ctx.shadowBlur = 0;
}

/**
 * Render level transition screen
 */
export function renderLevelTransition() {
    if (State.levelTransitionTimer <= 0) return;
    
    const ctx = State.ctx;
    const isMobile = State.width < 600;
    const scale = isMobile ? State.width / 500 : 1;
    
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, State.width, State.height);
    ctx.fillStyle = '#00ff00';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00ff00';
    ctx.font = `bold ${Math.floor(36 * scale)}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${State.level - 1} COMPLETE`, State.width/2, State.height/2 - 80 * scale);
    
    ctx.font = `bold ${Math.floor(22 * scale)}px Courier New`;
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.fillText(`BOSS DEFEATED: +${State.bossScoreGained} PTS`, State.width/2, State.height/2 - 30 * scale);
    
    // Score with color cycling
    const hue = (State.time * 2) % 360;
    ctx.font = `bold ${Math.floor(26 * scale)}px Courier New`;
    ctx.shadowBlur = 25;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`YOU'VE AMASSED ${State.score} PTS`, State.width/2, State.height/2 + 25 * scale);
    
    ctx.font = `bold ${Math.floor(28 * scale)}px Courier New`;
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 30;
    ctx.fillText(`ENTERING LEVEL ${State.level}`, State.width/2, State.height/2 + 80 * scale);
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
    const isMobile = State.width < 600;
    const scale = isMobile ? State.width / 500 : 1;
    
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, State.width, State.height);
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ffff00';
    ctx.font = `bold ${Math.floor(32 * scale)}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillText(`CHAPTER ${State.chapter}: ${Config.CHAPTER_NAMES[State.chapter - 1]}`, State.width/2, State.height/2 - 30 * scale);
    
    // Score with color cycling
    const hue = (State.time * 2) % 360;
    ctx.font = `bold ${Math.floor(22 * scale)}px Courier New`;
    ctx.shadowBlur = 20;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`YOU'VE AMASSED ${State.score} PTS`, State.width/2, State.height/2 + 25 * scale);
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
