// APOPHIS - Enemies
// Enemy spawning, movement, and blockdot logic

import * as State from './state.js';
import * as Config from './config.js';

/**
 * Get the trench offset for winding canyon effect
 */
export function getTrenchOffset(zPos) {
    const curveTime = State.time * 0.02;
    const randomWobble = Math.sin(State.time * 0.05) * 100 + Math.cos(State.time * 0.03) * 80;
    return Math.sin(curveTime + (zPos * 3)) * 250 + randomWobble;
}

/**
 * Spawn regular enemy
 */
export function spawnEnemy() {
    if (State.chapter === 1) {
        // Chapter 1: Drop from top of screen
        State.enemies.push({ 
            x: Math.random() * (State.width - 200) + 100,
            y: 0,
            vx: 0,
            vy: 4 + Math.random() * 2,
            size: 30 + Math.random() * 30,
            verticalDrop: true
        });
    } else {
        // Chapters 2-3: 3D perspective enemies
        let lane = Config.ENEMY_WORLD_LANES[Math.floor(Math.random() * 7)];
        if (State.chapter === 3) {
            const offset = getTrenchOffset(0);
            lane = (Math.random() - 0.5) * 350 + offset;
        }
        State.enemies.push({ worldLane: lane, z: 0, size: 40 });
    }
}

/**
 * Spawn blockdot (boomba carrier)
 */
export function spawnBlockdot() {
    if (State.chapter === 1) {
        // Chapter 1: Drop from top with lateral movement
        State.enemies.push({ 
            x: Math.random() * (State.width - 200) + 100,
            y: 0,
            vx: (Math.random() - 0.5) * 4,
            vy: 3 + Math.random() * 2,
            size: 35 + Math.random() * 20,
            verticalDrop: true,
            isBlockdot: true
        });
    } else {
        // Other chapters: 3D perspective
        let lane = Config.ENEMY_WORLD_LANES[Math.floor(Math.random() * 7)];
        if (State.chapter === 3) {
            const offset = getTrenchOffset(0);
            lane = (Math.random() - 0.5) * 350 + offset;
        }
        State.enemies.push({ 
            worldLane: lane, 
            z: 0, 
            size: 40,
            lateralSpeed: (Math.random() - 0.5) * 300,
            lateralPhase: Math.random() * Math.PI * 2,
            isBlockdot: true
        });
    }
}

/**
 * Spawn trench walls for canyon chapter
 */
export function spawnTrenchWalls() {
    const offset = getTrenchOffset(0);
    // Start wide, narrow progressively
    const widthProgress = Math.min(State.chapterTimer / 600, 1);
    const trenchWidth = 1800 - (widthProgress * 900);
    State.trenchBlocks.push({ worldLane: -trenchWidth/2 + offset, z: 0 });
    State.trenchBlocks.push({ worldLane: trenchWidth/2 + offset, z: 0 });
}

/**
 * Spawn single obstacle block for planetside chapter
 */
export function spawnObstacleBlock() {
    const lane = Config.ENEMY_WORLD_LANES[Math.floor(Math.random() * 7)];
    State.trenchBlocks.push({ 
        worldLane: lane, 
        z: 0, 
        isSingleBlock: true 
    });
}

/**
 * Update all enemies
 */
export function updateEnemies() {
    State.enemies.forEach(e => {
        if (e.verticalDrop) {
            e.y += e.vy;
            e.x += e.vx;
        } else {
            e.z += 0.005 + (State.gameSpeed * 0.15);
            
            // Blockdots: smooth side-to-side movement
            if (e.isBlockdot) {
                e.lateralPhase += 0.05;
                e.worldLane += Math.sin(e.lateralPhase) * e.lateralSpeed * 0.01;
                e.worldLane = Math.max(-450, Math.min(450, e.worldLane));
            }
        }
    });
}

/**
 * Update trench blocks
 */
export function updateTrenchBlocks() {
    State.trenchBlocks.forEach(b => {
        if (b.isSingleBlock) {
            // Single blocks move at one third enemy speed
            b.z += (0.005 + (State.gameSpeed * 0.15)) / 3;
        } else {
            // Normal trench walls (Chapter 3)
            b.z += 0.03 + (State.gameSpeed * 0.2);
        }
    });
}

/**
 * Cleanup off-screen enemies and blocks
 */
export function cleanupEnemies() {
    State.setEnemies(State.enemies.filter(e => 
        e.verticalDrop ? e.y < State.height : e.z < 1.2
    ));
    State.setTrenchBlocks(State.trenchBlocks.filter(b => b.z < 1.2));
}

/**
 * Check spawn conditions and spawn enemies
 */
export function handleSpawning() {
    // Enemy spawning
    if (Math.random() < 0.02 + (State.gameSpeed * 0.1) + (State.level * 0.005)) {
        spawnEnemy();
    }
    
    // Blockdot spawning
    if (Math.random() < 0.005 + (State.level * 0.001)) {
        spawnBlockdot();
    }
    
    // Chapter 3: Trench walls
    if (State.chapter === 3 && State.time % 3 === 0) {
        spawnTrenchWalls();
    }
    
    // Chapter 2: Obstacle blocks
    if (State.chapter === 2 && Math.random() < 0.01) {
        spawnObstacleBlock();
    }
}
