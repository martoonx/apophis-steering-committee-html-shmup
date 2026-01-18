// APOPHIS - Configuration & Constants

// Frame rate control
export const TARGET_FPS = 60;
export const FRAME_DURATION = 1000 / TARGET_FPS; // ~16.67ms per frame

// Field of view scale for 3D perspective
export const FOV_SCALE = 0.75;

// Enemy spawn lanes (for 3D chapters)
export const ENEMY_WORLD_LANES = [-350, -220, -120, 0, 120, 220, 350];

// Missile system
export const MAX_MISSILE_AMMO = 10;
export const MISSILE_COOLDOWN_FRAMES = 30;

// Boss bullet firing sequence
export const BOSS_BULLET_SEQUENCE = [6, 7, 2];

// Chapter durations (in frames at 60fps)
export const CHAPTER_DURATION = 1200; // 20 seconds

// Player settings
export const MAX_HEALTH = 3;
export const STARTING_LIVES = 3;
export const SHIELD_MAX = 100;
export const SHIELD_DRAIN_RATE = 0.5;
export const SHIELD_REGEN_RATE = 0.05;

// Boomba settings
export const MAX_BOOMBA_QUEUE = 40;
export const BOOMBA_CHARGE_MAX = 300;
export const BOOMBA_CHARGE_RATE = 2;

// Invulnerability durations (frames)
export const INVULN_PICKUP_DURATION = 600; // 10 seconds
export const INVULN_RESPAWN_DURATION = 180; // 3 seconds

// Timers (frames)
export const RESPAWN_TIMER_DURATION = 120; // 2 seconds
export const DEATH_TIMER_DURATION = 180; // 3 seconds
export const BOSS_DEFEATED_TIMER = 180; // 3 seconds
export const LEVEL_TRANSITION_TIMER = 180; // 3 seconds
export const CHAPTER_TRANSITION_TIMER = 120; // 2 seconds

// Score values
export const SCORE_ENEMY = 50;
export const SCORE_BLOCKDOT = 200;
export const SCORE_MINIBOSS = 1000;
export const SCORE_BOSS = 5000;
export const SCORE_OBSTACLE = 100;
export const SCORE_DEFLECT_BULLET = 5;

// Weapon definitions
export const WEAPONS = {
    DEFAULT: 0,
    SINE_WAVE: 1,
    SCATTER: 2,
    LASER: 3
};

export const WEAPON_NAMES = ['DEFAULT', 'SINE WAVE', 'SCATTER', 'LASER'];
export const WEAPON_ICONS = ['D', 'S', 'C', 'L'];

// Fire rate (frames between shots)
export const FIRE_DELAY = 6;

// Mini-boss configurations by level
export const MINIBOSS_CONFIGS = [
    { fireRate: 20, chaosRate: 0.03, defense: 0.05, color1: '#ff0000', color2: '#ffff00', bulletType: 'line' },
    { fireRate: 15, chaosRate: 0.08, defense: 0.08, color1: '#ff0000', color2: '#0088ff', bulletType: 'circle' },
    { fireRate: 25, chaosRate: 0.02, defense: 0.12, color1: '#ff0000', color2: '#00ff00', bulletType: 'triangle' }
];

// Chapter names
export const CHAPTER_NAMES = ['OPEN SPACE', 'PLANETSIDE', 'TRENCH CANYON', 'BOSS SECTOR'];

// Particle colors
export const EXPLOSION_COLORS = ['#00ffff', '#ff00ff', '#ffffff', '#ffff00'];
export const DAMAGE_EXPLOSION_COLORS = ['#ff0000', '#ff6600', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
export const MEGA_EXPLOSION_COLORS = ['#ff0000', '#ff6600', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#00ff00', '#ff0066', '#6600ff', '#ff3300'];

// Area boomba radius
export const AREA_BOOMBA_RADIUS = 400;
