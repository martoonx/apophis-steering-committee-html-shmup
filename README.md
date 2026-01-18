# 🌑 APOPHIS

### *Steering Committee-27 — Earth Defense Initiative*

A retro-inspired arcade space shooter built with modern web technologies. Defend Earth from the asteroid Apophis across multiple chapters featuring unique gameplay mechanics, boss battles, and classic arcade aesthetics.

![Game Preview](preview.png)

---

## 🎮 Play Now

Simply open `index.html` in any modern browser. No installation, no dependencies, no build process required.

**[▶️ Play Apophis](https://martoonx.github.io/apophis-steering-committee-html-shmup/)**

---

## 🕹️ Controls

### Keyboard

| Action | Keys |
|--------|------|
| Move | `←` `→` or `A` `D` |
| Shoot | `Z` or `SPACE` |
| Missile | `V` |
| Shield | `X` (hold) |
| Boomba | `C` |
| Cycle Weapons | `↑` `↓` or `W` `S` |
| Restart | `R` |

### Gamepad

Full controller support for modern gamepads (tested with Horipad Ultimate, should work with most USB/Bluetooth controllers).

| Action | Button |
|--------|--------|
| Move | Left Stick / D-Pad |
| Shoot | A / Cross (Button 0) |
| Shield | B / Circle (Button 1) |
| Boomba | X / Square (Button 2) |
| Missile | Y / Triangle (Button 3) |
| Cycle Weapon Up | RB / R1 (Button 5) |
| Cycle Weapon Down | LB / L1 (Button 4) |

---

## 🚀 Features

### Four Unique Chapters Per Level

1. **Open Space** — Classic vertical scrolling, dodge enemies and collect power-ups
2. **Planetside** — 3D perspective flight over alien terrain with obstacle blocks
3. **Trench Canyon** — Navigate a winding canyon that narrows over time  
4. **Boss Sector** — Face the Harasser in an epic showdown

### Enemies

| Enemy | Points | Description |
|-------|--------|-------------|
| **Enemy** | 50 | Standard hostile craft |
| **Blockdot** | 200 | Drops Boombas when destroyed |
| **Mini-Boss** | 1000 | Diamond-shaped, immune to bullets — use Boombas or Missiles |
| **Harasser** | 5000 | Chapter 4 boss, immune to missiles — bullets only! |

### Weapons & Power-ups

- **Default Blaster** — Reliable single shot
- **Sine Wave** — Oscillating projectile pattern
- **Scatter Shot** — Wide spread fire
- **Laser** — Penetrating beam weapon
- **Missiles** — Lock-on heavy ordinance with visual targeting indicator
- **Shield** — Absorbs damage while held, regenerates over time
- **Boombas** — Screen-clearing bombs in three varieties:
  - *Area* — Clears enemies in radius around player
  - *Screen* — Clears entire screen, damages bosses
  - *Charged* — Hold to power up, release for scaled effect

### Combat Mechanics

- Bullets ricochet off Mini-Bosses (yellow sparks)
- Missiles lock onto Mini-Bosses with visual indicator
- Missiles bounce off the Harasser (save them for Mini-Bosses!)
- Shield energy regenerates over time
- Invulnerability power-ups grant temporary immunity
- Hearts restore health, extra lives drop from Mini-Bosses

---

## 🎨 Visual Style

- Twinkling star field backgrounds with warp effects
- Neon glow effects on all game elements
- Color-cycling title and score displays
- Classic arcade-style title screen with enemy/pickup guide
- Smooth 60 FPS gameplay locked via fixed timestep
- Chapter-specific visual themes (grid perspectives, canyon walls)

---

## 🔊 Audio

Procedurally generated sound effects using the Web Audio API:
- Engine hum that responds to movement and shield activation
- Distinct sounds for each weapon type
- Explosion effects for enemies and bosses
- Pickup chimes
- Boss encounter audio cues
- Bullet deflection sounds

---

## 💻 Technical Details

- **Modular ES6 architecture** — Clean separation of concerns for easy development
- **Single-file distribution** — Compiles to one HTML file for deployment
- **Zero dependencies** — Pure vanilla JavaScript
- **Canvas-based rendering** — Hardware accelerated graphics
- **Fixed timestep game loop** — Consistent 60 FPS across all browsers
- **Web Audio API** — Procedural sound generation
- **Gamepad API** — Full controller support
- **Responsive design** — Scales to any screen size

### Browser Compatibility

Tested and working on:
- Chrome / Chromium
- Safari
- Firefox
- Edge

---

## 🛠️ Development

### Project Structure

The game uses a modular architecture for development, then compiles to a single HTML file for distribution:

```
apophis/
├── index.html          # Entry point (loads ES6 modules)
├── CLAUDE.md           # AI assistant context file
├── README.md           # This file
├── build.sh            # Compiles to single HTML file
├── css/
│   └── styles.css      # All styling
└── js/
    ├── config.js       # Game constants & settings
    ├── state.js        # Centralized game state
    ├── audio.js        # Web Audio sound system
    ├── input.js        # Keyboard & gamepad handling
    ├── title.js        # Title screen
    ├── bullets.js      # Bullets, missiles & particles
    ├── pickups.js      # Power-up spawning & collection
    ├── enemies.js      # Enemy spawning & movement
    ├── bosses.js       # Mini-boss & Harasser logic
    ├── player.js       # Ship, shield, weapons, boombas
    ├── collision.js    # Collision detection
    ├── render.js       # Canvas drawing
    ├── hud.js          # HUD & overlay screens
    └── main.js         # Game loop & initialization
```

### Local Development

```bash
# Run with a local server (required for ES6 modules)
python -m http.server 8000
# Then visit http://localhost:8000

# Or use any other local server (Node, PHP, etc.)
npx serve .
```

### Building for Distribution

```bash
# Compile all modules into a single HTML file
./build.sh
# Output: index-built.html
```

### AI-Assisted Development

This project includes a `CLAUDE.md` file that provides context for AI coding assistants. It documents:
- Module dependencies and load order
- Coordinate systems (2D vs 3D chapters)
- State management patterns
- Key game mechanics

This makes it easy to continue development with AI assistance while maintaining code quality.

---

## 📜 Version History

### v27 — Current Release
- **Modular ES6 architecture** for easier development
- **Full gamepad support** (tested with Horipad Ultimate)
- AI-friendly codebase with context documentation
- Build script for single-file distribution
- Code organization by system (player, enemies, bosses, etc.)

### v24
- Missile system with lock-on targeting
- Bullet ricochet mechanics
- Classic arcade-style title screen
- Fixed timestep for cross-browser consistency
- Redesigned game over screen
- Score display on interstitial screens

### Previous Versions
- v23: Unified bullet system, mini-boss combat, 40-boomba capacity
- v22: Weapon drop system, extra lives
- v21: Boomba queue system (area/screen/charged)
- v20: Mini-boss enemies, trench canyon chapter
- Earlier: Core gameplay, chapter system, boss battles

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

- New enemy types
- Additional weapons
- New chapter environments
- Sound effect improvements
- Mobile touch controls
- High score persistence
- Multiplayer support
- Additional boss patterns

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by classic arcade shooters like *Galaga*, *Xevious*, and *Gradius*
- Title screen design influenced by *Wizard of Wor*
- Built with ❤️ and way too much coffee

### AI Development Partners

This game was developed with assistance from multiple AI coding assistants:

- **Claude** (Anthropic) — Architecture, refactoring, and modular design
- **ChatGPT** (OpenAI) — Initial development and gameplay mechanics
- **Gemini** (Google) — Feature implementation and debugging
- **Grok** (xAI) — Code contributions and optimization

*A testament to human-AI collaboration in game development.*

---

<div align="center">

**EARTH DEFENSE INITIATIVE**

*Don't let Apophis advance.*

🛸 👾 🚀

</div>
