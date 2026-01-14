# 🌑 APOPHIS

### *Steering Committee-26 — Earth Defense Initiative*

A retro-inspired arcade space shooter built entirely in a single HTML file. Defend Earth from the asteroid Apophis across multiple chapters featuring unique gameplay mechanics, boss battles, and classic arcade aesthetics.

![Game Preview](preview.png)

---

## 🎮 Play Now

Simply open `index.html` in any modern browser. No installation, no dependencies, no build process required.

**[▶️ Play Apophis](index.html)**

---

## 🕹️ Controls

| Action | Keys |
|--------|------|
| Move | `←` `→` or `A` `D` |
| Shoot | `Z` or `SPACE` |
| Missile | `V` |
| Shield | `X` (hold) |
| Boomba | `C` |
| Cycle Weapons | `↑` `↓` or `W` `S` |
| Restart | `R` |

---

## 🚀 Features

### Four Unique Chapters Per Level

1. **Open Space** — Classic vertical scrolling, dodge enemies and collect power-ups
2. **Planetside** — 3D perspective flight over alien terrain
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
- **Missiles** — Lock-on heavy ordinance (V key)
- **Shield** — Absorbs damage while held (X key)
- **Boombas** — Screen-clearing bombs in three varieties:
  - *Area* — Clears enemies in radius
  - *Screen* — Clears entire screen
  - *Charged* — Hold to power up, release for scaled effect

### Combat Mechanics

- Bullets ricochet off Mini-Bosses (yellow sparks)
- Missiles bounce off the Harasser (save them for Mini-Bosses!)
- Shield energy regenerates over time
- Invulnerability power-ups grant temporary immunity

---

## 🎨 Visual Style

- Twinkling star field backgrounds
- Neon glow effects on all game elements
- Color-cycling title and score displays
- Classic arcade-style title screen with enemy/pickup guide
- Smooth 60 FPS gameplay locked across all browsers

---

## 🔊 Audio

Procedurally generated sound effects using the Web Audio API:
- Engine hum that responds to movement
- Distinct sounds for each weapon type
- Explosion effects for enemies and bosses
- Pickup chimes
- Boss encounter audio cues

---

## 💻 Technical Details

- **Single file architecture** — Everything in one HTML file
- **Zero dependencies** — Pure vanilla JavaScript
- **Canvas-based rendering** — Hardware accelerated graphics
- **Fixed timestep game loop** — Consistent 60 FPS across browsers
- **Web Audio API** — Procedural sound generation
- **Responsive design** — Scales to any screen size

### Browser Compatibility

Tested and working on:
- Chrome / Chromium
- Safari
- Firefox
- Edge

---

## 🛠️ Development

### Local Development

```bash
# Just open the file in your browser
open index.html

# Or use a simple HTTP server
python -m http.server 8000
# Then visit http://localhost:8000/index.html
```

### Project Structure

```
apophis/
├── index.html    # The complete game
├── README.md          # This file
└── LICENSE            # MIT License
```

---

## 📜 Version History

### v24 — Current Release
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

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by classic arcade shooters like *Galaga*, *Xevious*, and *Gradius*
- Title screen design influenced by *Wizard of Wor*
- Built with ❤️ and way too much coffee

---

<div align="center">

**EARTH DEFENSE INITIATIVE**

*Don't let Apophis advance.*

</div>
