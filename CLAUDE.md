# APOPHIS - Project Context

## Overview
APOPHIS is a retro-inspired arcade space shooter. The player defends Earth from the asteroid Apophis across multiple chapters featuring unique gameplay mechanics, boss battles, and classic arcade aesthetics.

## Project Structure

```
apophis/
├── index.html          # HTML shell that loads all scripts
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── config.js       # Constants, settings, weapon definitions
│   ├── state.js        # All game state variables
│   ├── audio.js        # Web Audio API sound system
│   ├── input.js        # Keyboard and gamepad handling
│   ├── title.js        # Title screen rendering
│   ├── player.js       # Ship movement, shooting, shield, boombas
│   ├── enemies.js      # Enemy spawning, movement, blockdots
│   ├── bosses.js       # Mini-bosses and Harasser logic
│   ├── pickups.js      # Pickup spawning and collection
│   ├── bullets.js      # Bullet/missile creation and updates
│   ├── collision.js    # All collision detection
│   ├── render.js       # All drawing code
│   ├── hud.js          # HUD and overlay screens
│   └── main.js         # Game loop, init, ties everything together
├── build.sh            # Script to combine back into single HTML
├── CLAUDE.md           # This file
└── README.md           # Project documentation
```

## Module Dependencies

Load order matters! Scripts must be loaded in this order:
1. config.js (no dependencies)
2. state.js (no dependencies)
3. audio.js (no dependencies)
4. input.js (depends on state for gamepad tracking)
5. title.js (depends on state, config)
6. bullets.js (depends on state, config, audio)
7. pickups.js (depends on state, config)
8. enemies.js (depends on state, config, bullets)
9. bosses.js (depends on state, config, audio, bullets)
10. player.js (depends on state, config, audio, bullets)
11. collision.js (depends on state, audio, player effects)
12. render.js (depends on state, config)
13. hud.js (depends on state, config)
14. main.js (depends on everything)

## Key Game Concepts

### Chapters (per level)
1. **Open Space** (Chapter 1) - Top-down vertical scrolling, 2D coordinates
2. **Planetside** (Chapter 2) - 3D perspective with horizon, worldLane/z coordinates
3. **Trench Canyon** (Chapter 3) - Winding canyon with 3D perspective
4. **Boss Sector** (Chapter 4) - Boss fight, returns to 2D

### Coordinate Systems
- **Chapter 1 & 4**: Standard 2D (x, y) with entities using `verticalDrop: true`
- **Chapter 2 & 3**: 3D perspective using `worldLane` and `z` depth

### Entity Types
- **Enemies**: Regular enemies (50 pts), Blockdots (200 pts, drop boombas)
- **Mini-bosses**: Appear level 2+, immune to bullets, drop loot
- **Harasser**: Chapter 4 boss, immune to missiles

### Weapons
0. Default rapid shot
1. Sine wave oscillating
2. Scatter shot (5 bullets)
3. Laser beam

### Boombas
- **Area**: Clears enemies in radius
- **Screen**: Clears entire screen
- **Charged**: Hold to power up

## State Management

All game state lives in `state.js` as module-level variables. Functions access state directly via imports.

## Building

Run `./build.sh` to combine all modules back into a single `index-built.html` file for distribution.

## Code Style
- Use ES6 modules with explicit exports
- Keep functions focused and single-purpose
- Document complex calculations with comments
- Maintain the retro aesthetic in all visual code
