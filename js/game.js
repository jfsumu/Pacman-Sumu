// ── Game Controller ──────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive sizing
function getCellSize() {
  const maxW = Math.min(window.innerWidth * 0.96, 580);
  const maxH = window.innerHeight * 0.72;
  const byW = Math.floor(maxW / MAZE_COLS);
  const byH = Math.floor(maxH / MAZE_ROWS);
  return Math.max(12, Math.min(byW, byH));
}

let CELL_SIZE = getCellSize();

function resizeCanvas() {
  CELL_SIZE = getCellSize();
  canvas.width = MAZE_COLS * CELL_SIZE;
  canvas.height = MAZE_ROWS * CELL_SIZE;
  if (maze) {
    maze.cellSize = CELL_SIZE;
    pacman.cs = CELL_SIZE;
    pacman.speed = CELL_SIZE * 0.08;
    ghosts.forEach(g => { g.cs = CELL_SIZE; g.speed = CELL_SIZE * 0.065; });
  }
}

// Game state
let maze, pacman, ghosts;
let score = 0, lives = 3, highScore = 0;
let gameState = 'idle'; // idle | playing | paused | dead | win | gameover
let tick = 0;
let ghostEatCombo = 0;
let flashTimer = 0;
let readyTimer = 0;
let floatingTexts = [];

// DOM
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const livesEl = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const gameoverOverlay = document.getElementById('gameover-overlay');
const endTitle = document.getElementById('end-title');
const endScore = document.getElementById('end-score');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Init
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); });

function initObjects() {
  maze = new Maze(CELL_SIZE);
  pacman = new PacMan(maze);
  ghosts = [0, 1, 2, 3].map(i => new Ghost(maze, i));
}

function startGame() {
  score = 0;
  lives = 3;
  ghostEatCombo = 0;
  floatingTexts = [];
  overlay.classList.add('hidden');
  overlay.classList.remove('visible');
  gameoverOverlay.classList.add('hidden');
  pauseOverlay.classList.add('hidden');
  CELL_SIZE = getCellSize();
  canvas.width = MAZE_COLS * CELL_SIZE;
  canvas.height = MAZE_ROWS * CELL_SIZE;
  initObjects();
  updateHUD();
  gameState = 'ready';
  readyTimer = 120;
  loop();
}

function resumeGame() {
  pauseOverlay.classList.add('hidden');
  gameState = 'playing';
  loop();
}

function showGameOver(win) {
  endTitle.textContent = win ? 'YOU WIN!' : 'GAME OVER';
  endScore.textContent = `Score: ${score}`;
  gameoverOverlay.classList.remove('hidden');
  gameState = 'gameover';
}

function updateHUD() {
  scoreEl.textContent = score;
  if (score > highScore) { highScore = score; }
  highscoreEl.textContent = highScore;
  livesEl.innerHTML = '&#9679;'.repeat(Math.max(0, lives));
}

// Input
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  handleInput(e.key);
  // Prevent arrow key scrolling
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

// Touch / swipe
let touchStart = null;
canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if (Math.max(adx, ady) < 20) return;
  if (adx > ady) handleInput(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
  else handleInput(dy > 0 ? 'ArrowDown' : 'ArrowUp');
  touchStart = null;
}, { passive: true });

function handleInput(key) {
  if (gameState === 'playing' || gameState === 'ready') {
    if (key === ' ') {
      pauseOverlay.classList.remove('hidden');
      gameState = 'paused';
      return;
    }
  }
  if (gameState !== 'playing' && gameState !== 'ready') return;

  switch (key) {
    case 'ArrowLeft':  case 'a': case 'A': pacman.setDirection(-1, 0); break;
    case 'ArrowRight': case 'd': case 'D': pacman.setDirection(1, 0);  break;
    case 'ArrowUp':    case 'w': case 'W': pacman.setDirection(0, -1); break;
    case 'ArrowDown':  case 's': case 'S': pacman.setDirection(0, 1);  break;
  }
}

// Floating text
function addFloatingText(text, x, y, color = '#FFD700') {
  floatingTexts.push({ text, x, y, color, life: 60, maxLife: 60 });
}

function updateFloatingTexts() {
  floatingTexts = floatingTexts.filter(ft => ft.life > 0);
  floatingTexts.forEach(ft => {
    ft.life--;
    ft.y -= 0.5;
  });
}

function drawFloatingTexts() {
  const cs = CELL_SIZE;
  floatingTexts.forEach(ft => {
    const alpha = ft.life / ft.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${Math.max(8, cs * 0.6)}px 'Press Start 2P', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

// Main loop
let rafId = null;

function loop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (gameState === 'paused' || gameState === 'gameover' || gameState === 'idle') return;

  tick++;

  // Ready countdown
  if (gameState === 'ready') {
    drawFrame();
    drawReadyText();
    readyTimer--;
    if (readyTimer <= 0) gameState = 'playing';
    rafId = requestAnimationFrame(gameLoop);
    return;
  }

  // Dead animation
  if (gameState === 'dead') {
    pacman.update();
    drawFrame();
    if (pacman.deathFrame > 75) {
      lives--;
      updateHUD();
      if (lives <= 0) {
        showGameOver(false);
        return;
      }
      // Respawn
      pacman.reset();
      pacman.cs = CELL_SIZE;
      ghosts.forEach(g => g.reset());
      ghostEatCombo = 0;
      gameState = 'ready';
      readyTimer = 90;
    }
    rafId = requestAnimationFrame(gameLoop);
    return;
  }

  // Normal play
  pacman.update();
  ghosts.forEach(g => g.update(pacman));

  // Eat dots
  const cell = pacman.getCell();
  const isPower = maze.isPowerPellet(cell.col, cell.row);
  const pts = maze.eatDot(cell.col, cell.row);
  if (pts > 0) {
    score += pts;
    updateHUD();
    if (isPower) {
      ghostEatCombo = 0;
      ghosts.forEach(g => g.frighten());
      addFloatingText('POWER!', pacman.x, pacman.y - CELL_SIZE, '#FFD700');
    }
  }

  // Ghost collision
  ghosts.forEach(g => {
    if (pacman.collidesWith(g) && !pacman.dead) {
      if (g.frightened) {
        g.eat();
        ghostEatCombo++;
        const bonus = 200 * Math.pow(2, ghostEatCombo - 1);
        score += bonus;
        updateHUD();
        addFloatingText(`${bonus}`, g.x, g.y - CELL_SIZE, '#00FFFF');
      } else if (!g.eaten) {
        pacman.dead = true;
        gameState = 'dead';
      }
    }
  });

  // Win check
  if (maze.dotsRemaining() === 0) {
    flashTimer = 120;
    gameState = 'win';
  }

  updateFloatingTexts();
  drawFrame();

  rafId = requestAnimationFrame(gameLoop);
}

// Win flash then next level
function winLoop() {
  flashTimer--;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (Math.floor(flashTimer / 10) % 2 === 0) {
    maze.draw(ctx, tick);
  }
  pacman.draw(ctx);
  drawFloatingTexts();
  if (flashTimer <= 0) {
    // Next level - reset maze and entities
    maze.reset();
    pacman.reset();
    pacman.cs = CELL_SIZE;
    pacman.speed = CELL_SIZE * 0.09; // slightly faster each level
    ghosts.forEach(g => { g.reset(); g.speed = CELL_SIZE * 0.07; });
    ghostEatCombo = 0;
    gameState = 'ready';
    readyTimer = 90;
    loop();
    return;
  }
  rafId = requestAnimationFrame(winLoop);
}

// Draw
function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  maze.draw(ctx, tick);
  pacman.draw(ctx);
  ghosts.forEach(g => g.draw(ctx));
  drawFloatingTexts();

  if (gameState === 'win') {
    rafId = cancelAnimationFrame(rafId);
    winLoop();
  }
}

function drawReadyText() {
  const cs = CELL_SIZE;
  ctx.save();
  ctx.fillStyle = '#FFD700';
  ctx.font = `bold ${Math.max(8, cs * 0.55)}px 'Press Start 2P', monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 15;
  ctx.fillText('READY!', canvas.width / 2, canvas.height / 2);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// Draw idle frame on load
initObjects();
canvas.width = MAZE_COLS * CELL_SIZE;
canvas.height = MAZE_ROWS * CELL_SIZE;
maze.draw(ctx, 0);
