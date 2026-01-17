# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Apophis** is a retro-inspired arcade space shooter built entirely in a single self-contained HTML file (`index.html`). The game features 4 chapters per level with unique gameplay mechanics, boss battles, and classic arcade aesthetics. It uses vanilla JavaScript with zero dependencies.

## Development

### Running the Game

```bash
# Simply open in browser
open index.html

# Or use local server
python -m http.server 8000
# Then visit http://localhost:8000/index.html
```

### File Structure

This is a **single-file application**. All code exists in `index.html`:
- HTML structure (canvas elements, HUD overlays)
- CSS styling (inline in `<style>` tag)
- JavaScript game logic (inline in `<script>` tag, ~3244 lines)

**No build process, no package manager, no dependencies.**

## Code Architecture

### Game State Management

The game uses global variables for state management (lines 422-467):
- **Player state**: `health`, `lives`, `shieldLevel`, `weaponInventory`, `missileAmmo`, `boombaQueue`
- **Level progression**: `level`, `chapter`, `chapterTimer`, `bossActive`
- **Entities**: `enemies`, `bullets`, `particles`, `pickups`, `harassers`, `miniBosses`

### Chapter System

The game has a 4-chapter progression per level:
1. **Chapter 1 - Open Space**: Classic vertical scrolling shooter
2. **Chapter 2 - Planetside**: 3D perspective with horizon-based enemy positioning
3. **Chapter 3 - Trench Canyon**: Winding canyon navigation with narrowing walls
4. **Chapter 4 - Boss Sector**: Boss fight against "Harasser" enemy

Chapter duration is controlled by `chapterTimer` with a fixed duration of 1200 frames (20 seconds at 60 FPS) for chapters 1-3. Chapter 4 has no time limit.

### Rendering System

Uses Canvas 2D context with two separate canvases:
- **titleCanvas**: Title screen with animated starfield and game instructions
- **gameCanvas**: Main game rendering

The game employs a **3D perspective system** for chapters 2-3:
- `enemyWorldLanes` defines 7 lateral positions in 3D space
- `fovScale` (0.75) controls field of view
- Enemies scale based on distance from horizon (z-depth)
- Bullets angle toward horizon center for perspective effect

### Game Loop

Fixed timestep loop targeting 60 FPS (lines 458-462):
- `TARGET_FPS = 60`
- `FRAME_DURATION = 16.67ms`
- Uses accumulator pattern for consistent cross-browser timing

### Audio System

Procedural audio using Web Audio API:
- **Engine sound**: Sawtooth oscillator that changes pitch with ship movement and shield state
- **Boss sound**: Triangle oscillator that follows boss position
- **Sound effects**: Generated via `playSound(freq, type, dur, vol)` function

### Enemy Types & Combat

**Enemies**:
- Standard enemies (50 pts)
- Blockdots (200 pts) - drop boombas
- Mini-bosses (1000 pts) - diamond-shaped, **immune to bullets**, bullets ricochet
- Harasser boss (5000 pts) - **immune to missiles**, missiles bounce off

**Weapons**:
- 4 weapon types: Default blaster, Sine wave, Scatter shot, Laser
- Missiles: Lock-on targeting system with max 10 ammo
- Boombas: 3 types in queue (area/screen/charged)
- Shield: Hold X to activate, regenerates over time

### Key Functions

- `init()` (line 528): Reset game state
- `advanceChapter()` (line 567): Chapter progression logic
- `updateSectorDisplay()` (line 553): Update HUD chapter name
- `renderTitleScreen()` (line 77): Animated title screen
- `updateEngineSound()` (line 495): Audio state management
- `getChapterDuration()` (line 558): Returns frame count for current chapter

## Working with This Codebase

### Modifying Gameplay

- **Enemy spawning**: Search for `enemies.push` calls, different logic per chapter
- **Weapon behavior**: Look for weapon type switch statements in bullet creation
- **Chapter mechanics**: Chapter-specific code is marked with comments like `// Chapter 2:` or `// Chapters 2 & 3:`
- **Collision detection**: Different systems for 2D (chapter 1) vs 3D perspective (chapters 2-3)

### Testing Changes

Since this is a single HTML file with no build step:
1. Make edits to `index.html`
2. Refresh browser to test
3. Use browser console for debugging
4. Press `R` key to restart game during testing

### Version Tracking

Current version is **v24** (see line 5 in HTML title and line 40 in version display). Major versions documented in README.md under "Version History".

## Current Branch Context

Working on `feature/game-controller-support` branch. Main branch is `main` for pull requests.
