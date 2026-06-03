const GHOST_COLORS = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];
const GHOST_NAMES = ['Blinky', 'Pinky', 'Inky', 'Clyde'];

class Ghost {
  constructor(maze, index) {
    this.maze = maze;
    this.cs = maze.cellSize;
    this.index = index;
    this.color = GHOST_COLORS[index];
    this.name = GHOST_NAMES[index];
    this.reset();
  }

  reset() {
    const cs = this.cs;
    // Starting positions inside ghost house
    const starts = [
      { col: 14, row: 14 }, // Blinky - starts outside
      { col: 13, row: 15 },
      { col: 14, row: 15 },
      { col: 15, row: 15 },
    ];
    const s = starts[this.index];
    this.col = s.col;
    this.row = s.row;
    this.x = s.col * cs + cs / 2;
    this.y = s.row * cs + cs / 2;
    this.speed = cs * 0.065;
    this.dir = { x: 0, y: -1 };
    this.frightened = false;
    this.frightenedTimer = 0;
    this.eaten = false;
    this.eatenTimer = 0;
    this.releaseTimer = this.index * 180; // stagger release
    this.released = this.index === 0;
    this.animFrame = 0;
    this.eyeDir = { x: 1, y: 0 };
  }

  frighten() {
    if (!this.eaten) {
      this.frightened = true;
      this.frightenedTimer = 300; // ~5 seconds at 60fps
    }
  }

  eat() {
    this.eaten = true;
    this.frightened = false;
    this.frightenedTimer = 0;
    this.eatenTimer = 180; // time to return home
    this.speed = this.cs * 0.13;
  }

  update(pacman) {
    if (!this.released) {
      this.releaseTimer--;
      if (this.releaseTimer <= 0) {
        this.released = true;
        // Move to ghost door position
        this.x = 14 * this.cs + this.cs / 2;
        this.y = 12 * this.cs + this.cs / 2;
      }
      // Bounce in house
      this.y += Math.sin(Date.now() / 300 + this.index) * 0.5;
      return;
    }

    if (this.frightened) {
      this.frightenedTimer--;
      if (this.frightenedTimer <= 0) {
        this.frightened = false;
        this.speed = this.cs * 0.065;
      }
    }

    if (this.eaten) {
      this.eatenTimer--;
      if (this.eatenTimer <= 0) {
        this.eaten = false;
        this.speed = this.cs * 0.065;
        // Reset position
        this.x = 14 * this.cs + this.cs / 2;
        this.y = 15 * this.cs + this.cs / 2;
      }
    }

    this.animFrame++;
    this._move(pacman);
    this._updateEyeDir();
  }

  _updateEyeDir() {
    if (this.dir.x !== 0 || this.dir.y !== 0) {
      this.eyeDir = { ...this.dir };
    }
  }

  _move(pacman) {
    const cs = this.cs;
    const nx = Math.round(this.x / cs);
    const ny = Math.round(this.y / cs);
    const cx = nx * cs;
    const cy = ny * cs;
    const tol = this.speed + 1;

    if (Math.abs(this.x - cx) < tol && Math.abs(this.y - cy) < tol) {
      this.x = cx;
      this.y = cy;
      this.col = nx;
      this.row = ny;

      // Choose new direction at intersection
      const newDir = this._chooseDir(nx, ny, pacman);
      this.dir = newDir;
    }

    this.x += this.dir.x * this.speed;
    this.y += this.dir.y * this.speed;

    // Tunnel wrap
    const cols = this.maze.cols;
    if (this.x < -cs / 2) this.x = cols * cs + cs / 2;
    if (this.x > cols * cs + cs / 2) this.x = -cs / 2;
  }

  _chooseDir(col, row, pacman) {
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    // Filter out reverse and walls
    const reverse = { x: -this.dir.x, y: -this.dir.y };
    const valid = dirs.filter(d => {
      if (d.x === reverse.x && d.y === reverse.y) return false;
      const nc = col + d.x;
      const nr = row + d.y;
      if (this.maze.isWall(nc, nr)) return false;
      // Only allow ghost house if eaten (returning)
      if (this.maze.isGhostHouse(nc, nr) && !this.eaten) return false;
      return true;
    });

    if (valid.length === 0) return reverse;

    if (this.frightened) {
      // Random movement
      return valid[Math.floor(Math.random() * valid.length)];
    }

    if (this.eaten) {
      // Head back to ghost house
      const target = { col: 14, row: 13 };
      return this._bestDir(valid, col, row, target.col, target.row);
    }

    // Each ghost has different targeting
    let targetCol, targetRow;
    const pc = Math.round(pacman.x / this.cs);
    const pr = Math.round(pacman.y / this.cs);
    const pd = pacman.dir;

    switch (this.index) {
      case 0: // Blinky - chases directly
        targetCol = pc;
        targetRow = pr;
        break;
      case 1: // Pinky - targets 4 ahead of pacman
        targetCol = pc + pd.x * 4;
        targetRow = pr + pd.y * 4;
        break;
      case 2: // Inky - complex targeting
        targetCol = pc + pd.x * 2;
        targetRow = pr + pd.y * 2;
        // Use blinky position if available
        targetCol = pc + (targetCol - pc) * 2;
        targetRow = pr + (targetRow - pr) * 2;
        break;
      case 3: // Clyde - chases if far, scatters if close
        const dist = Math.abs(col - pc) + Math.abs(row - pr);
        if (dist > 8) { targetCol = pc; targetRow = pr; }
        else { targetCol = 1; targetRow = 29; } // scatter corner
        break;
    }

    return this._bestDir(valid, col, row, targetCol, targetRow);
  }

  _bestDir(valid, col, row, targetCol, targetRow) {
    let best = null;
    let bestDist = Infinity;
    for (const d of valid) {
      const nc = col + d.x;
      const nr = row + d.y;
      const dist = (nc - targetCol) ** 2 + (nr - targetRow) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        best = d;
      }
    }
    return best || valid[0];
  }

  draw(ctx) {
    if (!this.released) return;

    const r = this.cs * 0.44;
    const x = this.x;
    const y = this.y;

    ctx.save();

    if (this.eaten) {
      // Draw just eyes going back
      this._drawEyes(ctx, x, y, r, '#FFF', '#00F');
      ctx.restore();
      return;
    }

    let bodyColor;
    if (this.frightened) {
      const flash = this.frightenedTimer < 100 && Math.floor(this.frightenedTimer / 15) % 2 === 0;
      bodyColor = flash ? '#FFFFFF' : '#0000FF';
    } else {
      bodyColor = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
    }

    ctx.fillStyle = bodyColor;

    // Ghost body
    ctx.beginPath();
    ctx.arc(x, y - r * 0.1, r, Math.PI, 0, false);

    // Wavy bottom
    const waveY = y + r * 0.9;
    const segments = 3;
    const segW = (r * 2) / segments;
    const wave = Math.sin(this.animFrame * 0.15) * r * 0.15;

    ctx.lineTo(x + r, waveY);
    for (let i = 0; i <= segments; i++) {
      const wx = x + r - i * segW;
      const wy = i % 2 === 0 ? waveY : waveY - r * 0.25 + wave;
      ctx.lineTo(wx, wy);
    }
    ctx.lineTo(x - r, y - r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    if (this.frightened) {
      // Scared face
      ctx.strokeStyle = bodyColor === '#0000FF' ? '#FFF' : '#0000FF';
      ctx.lineWidth = Math.max(1, r * 0.1);
      ctx.beginPath();
      // Wavy mouth
      ctx.moveTo(x - r * 0.4, y + r * 0.2);
      ctx.bezierCurveTo(x - r * 0.2, y + r * 0.4, x, y, x + r * 0.2, y + r * 0.4);
      ctx.bezierCurveTo(x + r * 0.3, y, x + r * 0.4, y + r * 0.3, x + r * 0.4, y + r * 0.2);
      ctx.stroke();
      // Dot eyes
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(x - r * 0.25, y - r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.arc(x + r * 0.25, y - r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      this._drawEyes(ctx, x, y, r, '#FFF', this.color === '#FF0000' ? '#FF0000' : '#0000AA');
    }

    ctx.restore();
  }

  _drawEyes(ctx, x, y, r, white, pupil) {
    const eyeOffX = r * 0.28;
    const eyeOffY = -r * 0.1;
    const eyeR = r * 0.22;
    const pupilR = r * 0.13;
    const pd = this.eyeDir;
    const pOffset = eyeR * 0.45;

    [-1, 1].forEach(side => {
      ctx.fillStyle = white;
      ctx.beginPath();
      ctx.ellipse(x + side * eyeOffX, y + eyeOffY, eyeR, eyeR * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pupil;
      ctx.beginPath();
      ctx.arc(
        x + side * eyeOffX + pd.x * pOffset,
        y + eyeOffY + pd.y * pOffset,
        pupilR, 0, Math.PI * 2
      );
      ctx.fill();
    });
  }

  getCell() {
    return { col: this.col, row: this.row };
  }
}
