# 🟡 PAC-MAN

A fully playable Pac-Man clone built with vanilla HTML, CSS, and JavaScript. No dependencies, no build tools — just open `index.html` and play.

## 🎮 Play

Open `index.html` in any modern browser.

Or host it on GitHub Pages:
1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Your game will be live at `https://<username>.github.io/<repo-name>/`

## 🕹️ Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move | Arrow Keys or WASD | Swipe |
| Pause | Space | — |

## ✨ Features

- Classic Pac-Man maze with all dots, power pellets, and tunnels
- 4 ghosts with authentic AI behaviors (Blinky, Pinky, Inky, Clyde)
- Ghost fright mode with combo scoring (200 → 400 → 800 → 1600)
- Lives system and high score tracking (session)
- Death animation and respawn
- Win detection → next level with increased speed
- Responsive canvas — scales to any screen size
- Retro aesthetic with scanlines, glow effects, and arcade font
- Touch / swipe support for mobile

## 📁 File Structure

```
pacman/
├── index.html        # Main entry point
├── css/
│   └── style.css     # Retro arcade styling
├── js/
│   ├── maze.js       # Maze layout, rendering, dot logic
│   ├── pacman.js     # Pac-Man movement and drawing
│   ├── ghost.js      # Ghost AI and rendering
│   └── game.js       # Game loop, input, scoring, HUD
└── README.md
```

## 🏆 Scoring

| Item | Points |
|------|--------|
| Dot | 10 |
| Power Pellet | 50 |
| 1st Ghost eaten | 200 |
| 2nd Ghost eaten | 400 |
| 3rd Ghost eaten | 800 |
| 4th Ghost eaten | 1600 |

## 🛠️ Built With

- Vanilla JavaScript (ES6+)
- HTML5 Canvas API
- CSS3 animations
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font (Google Fonts)

## 📜 License

MIT — feel free to fork, modify, and share.
