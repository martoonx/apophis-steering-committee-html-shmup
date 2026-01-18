// APOPHIS - Audio System
// Web Audio API sound generation

import * as State from './state.js';

/**
 * Initialize the audio context and persistent oscillators
 */
export function initAudio() {
    if (State.audioCtx) return;
    
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    State.setAudioContext(ctx);
    
    // Engine sound - persistent oscillator
    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(45, ctx.currentTime);
    engineGain.gain.setValueAtTime(0, ctx.currentTime);
    engineOsc.connect(engineGain);
    engineGain.connect(ctx.destination);
    engineOsc.start();
    State.setEngineOsc(engineOsc);
    State.setEngineGain(engineGain);
    
    // Boss sound - persistent oscillator
    const bossOsc = ctx.createOscillator();
    const bossGain = ctx.createGain();
    bossOsc.type = 'triangle';
    bossOsc.frequency.setValueAtTime(100, ctx.currentTime);
    bossGain.gain.setValueAtTime(0, ctx.currentTime);
    bossOsc.connect(bossGain);
    bossGain.connect(ctx.destination);
    bossOsc.start();
    State.setBossOsc(bossOsc);
    State.setBossGain(bossGain);
}

/**
 * Update the engine and boss ambient sounds based on game state
 */
export function updateEngineSound() {
    if (!State.audioCtx || State.gameOver || 
        State.levelTransitionTimer > 0 || 
        State.chapterTransitionTimer > 0 || 
        State.bossDefeatedTimer > 0) {
        
        if (State.engineGain) {
            State.engineGain.gain.setTargetAtTime(0, State.audioCtx.currentTime, 0.05);
        }
        if (State.bossGain) {
            State.bossGain.gain.setTargetAtTime(0, State.audioCtx.currentTime, 0.05);
        }
        return;
    }
    
    // Engine sound responds to movement and shield
    State.engineGain.gain.setTargetAtTime(
        State.shieldActive ? 0.15 : 0.06, 
        State.audioCtx.currentTime, 
        0.1
    );
    
    const pitchShift = 45 + (Math.abs(State.shipAngle) * 80) + (State.shieldActive ? 20 : 0);
    State.engineOsc.frequency.setTargetAtTime(pitchShift, State.audioCtx.currentTime, 0.05);
    
    // Boss sound - follows boss movement
    if (State.harassers.length > 0) {
        const boss = State.harassers[0];
        const bossFreq = 100 + (boss.x / State.width) * 100 + Math.sin(boss.phase * 2) * 30;
        State.bossOsc.frequency.setTargetAtTime(bossFreq, State.audioCtx.currentTime, 0.05);
        State.bossGain.gain.setTargetAtTime(0.08, State.audioCtx.currentTime, 0.1);
    } else {
        State.bossGain.gain.setTargetAtTime(0, State.audioCtx.currentTime, 0.1);
    }
}

/**
 * Play a one-shot sound effect
 * @param {number} freq - Frequency in Hz
 * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
 * @param {number} dur - Duration in seconds
 * @param {number} vol - Volume (0-1)
 */
export function playSound(freq, type, dur, vol) {
    if (!State.audioCtx) return;
    
    const osc = State.audioCtx.createOscillator();
    const g = State.audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, State.audioCtx.currentTime);
    
    // Square waves get a frequency sweep
    if (type === 'square') {
        osc.frequency.exponentialRampToValueAtTime(10, State.audioCtx.currentTime + dur);
    }
    
    g.gain.setValueAtTime(vol, State.audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0, State.audioCtx.currentTime + dur);
    
    osc.connect(g);
    g.connect(State.audioCtx.destination);
    
    osc.start();
    osc.stop(State.audioCtx.currentTime + dur);
}

// Sound effect presets
export const SFX = {
    // Weapon sounds
    shoot: () => playSound(800, 'square', 0.1, 0.05),
    shootSine: () => playSound(900, 'sine', 0.1, 0.05),
    shootScatter: () => playSound(700, 'square', 0.15, 0.08),
    shootLaser: () => playSound(1200, 'sawtooth', 0.2, 0.1),
    
    // Missile sounds
    missilelaunch: () => {
        playSound(150, 'sawtooth', 0.4, 0.25);
        playSound(80, 'square', 0.3, 0.15);
    },
    missileHit: () => {
        playSound(60, 'sawtooth', 0.6, 0.4);
        playSound(120, 'square', 0.4, 0.3);
    },
    
    // Impact sounds
    enemyHit: () => playSound(150, 'sawtooth', 0.2, 0.1),
    enemyDestroy: () => playSound(100, 'sine', 0.1, 0.2),
    bossHit: () => playSound(400, 'square', 0.05, 0.1),
    bossDestroy: () => playSound(50, 'sawtooth', 1.5, 0.5),
    
    // Damage sounds
    playerHit: () => playSound(50, 'sawtooth', 0.5, 0.3),
    trenchCollision: () => playSound(40, 'sawtooth', 0.8, 0.4),
    
    // Deflection sounds
    bulletDeflect: () => playSound(1200, 'sine', 0.05, 0.08),
    missileDeflect: () => {
        playSound(1200, 'sine', 0.05, 0.08);
        playSound(1200, 'sine', 0.08, 0.12);
    },
    blockDeflect: () => playSound(800, 'sine', 0.05, 0.06),
    
    // Pickup sounds
    pickup: () => playSound(600, 'sine', 0.3, 0.2),
    pickupMissile: () => playSound(550, 'sine', 0.3, 0.2),
    pickupExtraLife: () => playSound(900, 'sine', 0.5, 0.3),
    pickupHealth: () => playSound(800, 'sine', 0.3, 0.2),
    boombaDrop: () => playSound(400, 'sine', 0.3, 0.15),
    
    // Boomba sounds
    boombaArea: () => playSound(120, 'square', 0.6, 0.3),
    boombaScreen: () => playSound(60, 'square', 1.2, 0.4),
    boombaCharged: () => playSound(80, 'square', 1.0, 0.3),
    
    // Boss bullet sounds
    bossBullet: () => playSound(200, 'sine', 0.1, 0.03),
    miniBossBullet: () => playSound(250, 'sine', 0.08, 0.04)
};
