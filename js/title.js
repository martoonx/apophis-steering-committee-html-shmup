// APOPHIS - Title Screen
// Title screen initialization and rendering

import * as State from './state.js';

/**
 * Initialize the title screen
 */
export function initTitleScreen() {
    const titleCanvas = document.getElementById('titleCanvas');
    const titleCtx = titleCanvas.getContext('2d');
    
    titleCanvas.width = window.innerWidth;
    titleCanvas.height = window.innerHeight;
    
    State.setTitleCanvas(titleCanvas, titleCtx);
    
    // Create twinkling stars
    const stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * titleCanvas.width,
            y: Math.random() * titleCanvas.height,
            size: Math.random() * 2 + 0.5,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
    State.setTitleStars(stars);
    State.setTitleTime(0);
    
    renderTitleScreen();
}

/**
 * Main title screen render loop
 */
export function renderTitleScreen() {
    const titleCanvas = State.titleCanvas;
    const titleCtx = State.titleCtx;
    const titleStars = State.titleStars;
    
    const w = titleCanvas.width;
    const h = titleCanvas.height;
    State.incrementTitleTime();
    const titleTime = State.titleTime;
    
    // Clear
    titleCtx.fillStyle = '#000';
    titleCtx.fillRect(0, 0, w, h);
    
    // Draw twinkling stars
    titleStars.forEach(star => {
        const twinkle = Math.sin(titleTime * star.twinkleSpeed + star.twinkleOffset);
        const alpha = 0.3 + twinkle * 0.7;
        const size = star.size * (0.8 + twinkle * 0.4);
        titleCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
        titleCtx.beginPath();
        titleCtx.arc(star.x, star.y, size, 0, Math.PI * 2);
        titleCtx.fill();
    });
    
    // Calculate center and scaling - fit everything on screen
    const centerX = w / 2;
    const scale = Math.min(w / 800, h / 600);
    const lineHeight = 38 * scale;
    const startY = 30 * scale;
    
    // Title with color cycling glow
    const hue = (titleTime * 2) % 360;
    titleCtx.font = `bold ${42 * scale}px Courier New`;
    titleCtx.textAlign = 'center';
    titleCtx.shadowBlur = 30;
    titleCtx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    titleCtx.fillStyle = '#00ffff';
    titleCtx.fillText('A P O P H I S', centerX, startY + lineHeight);
    
    titleCtx.font = `${12 * scale}px Courier New`;
    titleCtx.shadowBlur = 10;
    titleCtx.shadowColor = '#ff00ff';
    titleCtx.fillStyle = '#ff00ff';
    titleCtx.fillText('STEERING COMMITTEE-27', centerX, startY + lineHeight * 1.5);
    
    // Section: ENEMIES
    let y = startY + lineHeight * 2.3;
    titleCtx.font = `bold ${16 * scale}px Courier New`;
    titleCtx.shadowBlur = 15;
    titleCtx.shadowColor = '#ff0000';
    titleCtx.fillStyle = '#ff0000';
    titleCtx.fillText('— ENEMIES —', centerX, y);
    
    y += lineHeight * 0.8;
    const col1 = centerX - 160 * scale;
    const col2 = centerX - 100 * scale;
    const col3 = centerX + 50 * scale;
    const col4 = centerX + 100 * scale;
    
    titleCtx.font = `${13 * scale}px Courier New`;
    titleCtx.textAlign = 'left';
    
    // Enemy (square)
    drawTitleEnemy(titleCtx, col1, y, scale);
    titleCtx.shadowBlur = 8;
    titleCtx.shadowColor = '#ff0000';
    titleCtx.fillStyle = '#ff0000';
    titleCtx.fillText('ENEMY', col2, y + 5);
    titleCtx.fillStyle = '#ffffff';
    titleCtx.fillText('50', col3, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('POINTS', col4, y + 5);
    
    // Blockdot
    y += lineHeight;
    drawTitleBlockdot(titleCtx, col1, y, scale);
    titleCtx.shadowColor = '#ff6600';
    titleCtx.fillStyle = '#ff6600';
    titleCtx.fillText('BLOCKDOT', col2, y + 5);
    titleCtx.fillStyle = '#ffffff';
    titleCtx.fillText('200', col3, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('PTS + BOOMBA', col4, y + 5);
    
    // Mini-boss
    y += lineHeight;
    drawTitleMiniBoss(titleCtx, col1, y, scale);
    titleCtx.shadowColor = '#ff0000';
    titleCtx.fillStyle = '#ff0000';
    titleCtx.fillText('MINI-BOSS', col2, y + 5);
    titleCtx.fillStyle = '#ffffff';
    titleCtx.fillText('1000', col3, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.textAlign = 'left';
    titleCtx.fillText('PTS + LOOT', col4, y + 5);
    y += lineHeight * 0.45;
    titleCtx.fillStyle = '#ff6666';
    titleCtx.font = `${11 * scale}px Courier New`;
    titleCtx.fillText('IMMUNE TO BULLETS', col4, y + 5);
    titleCtx.font = `${13 * scale}px Courier New`;
    
    // Harasser (Boss)
    y += lineHeight * 0.8;
    drawTitleHarasser(titleCtx, col1, y, scale);
    titleCtx.shadowColor = '#ff00ff';
    titleCtx.fillStyle = '#ff00ff';
    titleCtx.fillText('HARASSER', col2, y + 5);
    titleCtx.fillStyle = '#ffffff';
    titleCtx.fillText('5000', col3, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('PTS (BOSS)', col4, y + 5);
    y += lineHeight * 0.45;
    titleCtx.fillStyle = '#ff66ff';
    titleCtx.font = `${11 * scale}px Courier New`;
    titleCtx.fillText('IMMUNE TO MISSILES', col4, y + 5);
    titleCtx.font = `${13 * scale}px Courier New`;
    
    // Section: PICKUPS
    y += lineHeight * 0.9;
    titleCtx.textAlign = 'center';
    titleCtx.font = `bold ${16 * scale}px Courier New`;
    titleCtx.shadowBlur = 15;
    titleCtx.shadowColor = '#00ff00';
    titleCtx.fillStyle = '#00ff00';
    titleCtx.fillText('— PICKUPS —', centerX, y);
    
    y += lineHeight * 0.8;
    titleCtx.font = `${13 * scale}px Courier New`;
    titleCtx.textAlign = 'left';
    
    // Shield
    drawTitlePickup(titleCtx, col1, y, 's', '#ffff00', scale);
    titleCtx.shadowColor = '#ffff00';
    titleCtx.fillStyle = '#ffff00';
    titleCtx.fillText('SHIELD', col2, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('RESTORE SHIELD', col3, y + 5);
    
    // Weapon
    y += lineHeight;
    drawTitlePickup(titleCtx, col1, y, 'W', '#00ffff', scale);
    titleCtx.shadowColor = '#00ffff';
    titleCtx.fillStyle = '#00ffff';
    titleCtx.fillText('WEAPON', col2, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('NEW WEAPON', col3, y + 5);
    
    // Missile
    y += lineHeight;
    drawTitlePickup(titleCtx, col1, y, 'M', '#ff6600', scale);
    titleCtx.shadowColor = '#ff6600';
    titleCtx.fillStyle = '#ff6600';
    titleCtx.fillText('MISSILE', col2, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('+2 MISSILES', col3, y + 5);
    
    // Boomba
    y += lineHeight;
    drawTitlePickup(titleCtx, col1, y, 'B', '#ff6600', scale);
    titleCtx.shadowColor = '#ff6600';
    titleCtx.fillStyle = '#ff6600';
    titleCtx.fillText('BOOMBA', col2, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('SCREEN CLEAR', col3, y + 5);
    
    // Heart
    y += lineHeight;
    drawTitleHeart(titleCtx, col1, y, scale);
    titleCtx.shadowColor = '#00ff00';
    titleCtx.fillStyle = '#00ff00';
    titleCtx.fillText('HEART', col2, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('+1 HEALTH', col3, y + 5);
    
    // Extra Life
    y += lineHeight;
    drawTitleShip(titleCtx, col1, y, scale);
    titleCtx.shadowColor = '#00ffff';
    titleCtx.fillStyle = '#00ffff';
    titleCtx.fillText('EXTRA LIFE', col2, y + 5);
    titleCtx.fillStyle = '#888888';
    titleCtx.fillText('+1 LIFE', col3, y + 5);
    
    // Press to start
    y += lineHeight * 1.2;
    titleCtx.textAlign = 'center';
    titleCtx.font = `${18 * scale}px Courier New`;
    const blink = Math.sin(titleTime * 0.08) > 0;
    if (blink) {
        titleCtx.shadowBlur = 20;
        titleCtx.shadowColor = '#00ffff';
        titleCtx.fillStyle = '#00ffff';
        titleCtx.fillText('CLICK TO INITIALIZE SYSTEMS', centerX, y);
    }
    
    // Controls hint
    y += lineHeight * 0.8;
    titleCtx.font = `${10 * scale}px Courier New`;
    titleCtx.shadowBlur = 10;
    titleCtx.shadowColor = '#00aaaa';
    titleCtx.fillStyle = '#00cccc';
    titleCtx.fillText('←→/AD Move | Z/SPACE Shoot | V Missile | X Shield | C Boomba', centerX, y);
    
    State.setTitleAnimationId(requestAnimationFrame(renderTitleScreen));
}

/**
 * Stop the title screen animation
 */
export function stopTitleScreen() {
    if (State.titleAnimationId) {
        cancelAnimationFrame(State.titleAnimationId);
        State.setTitleAnimationId(null);
    }
}

// =============================================================================
// Title Screen Sprite Drawing Functions
// =============================================================================

function drawTitleEnemy(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -10, 20, 20);
    ctx.restore();
}

function drawTitleBlockdot(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#ff6600';
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -12, 24, 24);
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawTitleMiniBoss(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(15, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-15, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function drawTitleHarasser(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 15);
    ctx.lineTo(-20, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

function drawTitlePickup(ctx, x, y, letter, color, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(letter, 0, 4);
    ctx.restore();
}

function drawTitleHeart(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    const sz = 12 * scale;
    ctx.strokeStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, sz/4);
    ctx.bezierCurveTo(0, -sz/4, -sz, -sz/4, -sz, sz/4);
    ctx.bezierCurveTo(-sz, sz, 0, sz * 1.2, 0, sz * 1.5);
    ctx.bezierCurveTo(0, sz * 1.2, sz, sz, sz, sz/4);
    ctx.bezierCurveTo(sz, -sz/4, 0, -sz/4, 0, sz/4);
    ctx.stroke();
    ctx.restore();
}

function drawTitleShip(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * 0.5, scale * 0.5);
    ctx.strokeStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-25, 10);
    ctx.lineTo(0, 3);
    ctx.lineTo(25, 10);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}
