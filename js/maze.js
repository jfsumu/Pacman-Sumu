// Maze definition
// 0 = dot, 1 = wall, 2 = empty, 3 = power pellet, 4 = ghost house door, 5 = ghost house inside

const MAZE_COLS = 28;
const MAZE_ROWS = 31;

// prettier-ignore
const MAZE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,5,5,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,5,5,5,5,5,5,1,2,1,1,0,1,1,1,1,1,1],
  [2,2,2,2,2,2,0,2,2,2,1,5,5,5,5,5,5,1,2,2,2,0,2,2,2,2,2,2],
  [1,1,1,1,1,1,0,1,1,2,1,5,5,5,5,5,5,1,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,1,4,4,4,4,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,0,0,1,1,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,1,1,0,0,3,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

class Maze {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cols = MAZE_COLS;
    this.rows = MAZE_ROWS;
    this.grid = MAZE_LAYOUT.map(row => [...row]);
    this.totalDots = this._countDots();
  }

  _countDots() {
    let count = 0;
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.grid[r][c] === 0 || this.grid[r][c] === 3) count++;
    return count;
  }

  reset() {
    this.grid = MAZE_LAYOUT.map(row => [...row]);
  }

  isWall(col, row) {
    if (row < 0 || row >= this.rows) return false; // wrap vertically? no, block
    // wrap horizontally (tunnel)
    col = ((col % this.cols) + this.cols) % this.cols;
    const v = this.grid[row][col];
    return v === 1 || v === 4;
  }

  isGhostHouse(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
    return this.grid[row][col] === 5;
  }

  isGhostDoor(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
    return this.grid[row][col] === 4;
  }

  eatDot(col, row) {
    col = ((col % this.cols) + this.cols) % this.cols;
    if (row < 0 || row >= this.rows) return 0;
    const v = this.grid[row][col];
    if (v === 0) { this.grid[row][col] = 2; return 10; }
    if (v === 3) { this.grid[row][col] = 2; return 50; }
    return 0;
  }

  isPowerPellet(col, row) {
    col = ((col % this.cols) + this.cols) % this.cols;
    if (row < 0 || row >= this.rows) return false;
    return this.grid[row][col] === 3;
  }

  dotsRemaining() {
    let count = 0;
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.grid[r][c] === 0 || this.grid[r][c] === 3) count++;
    return count;
  }

  draw(ctx, tick) {
    const cs = this.cellSize;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const v = this.grid[r][c];
        const x = c * cs;
        const y = r * cs;

        if (v === 1) {
          // wall fill
          ctx.fillStyle = '#000028';
          ctx.fillRect(x, y, cs, cs);
          this._drawWallSegment(ctx, c, r, x, y, cs);
        } else if (v === 4) {
          // ghost house door
          ctx.fillStyle = '#000018';
          ctx.fillRect(x, y, cs, cs);
          ctx.fillStyle = '#FFB8FF';
          ctx.fillRect(x, y + cs * 0.4, cs, cs * 0.2);
        } else if (v === 5) {
          ctx.fillStyle = '#000018';
          ctx.fillRect(x, y, cs, cs);
        } else {
          ctx.fillStyle = '#000010';
          ctx.fillRect(x, y, cs, cs);
          if (v === 0) {
            ctx.fillStyle = '#FFB8AE';
            const ds = cs * 0.18;
            ctx.beginPath();
            ctx.arc(x + cs / 2, y + cs / 2, ds, 0, Math.PI * 2);
            ctx.fill();
          } else if (v === 3) {
            // blinking power pellet
            if (Math.floor(tick / 20) % 2 === 0) {
              ctx.fillStyle = '#FFD700';
              ctx.shadowColor = '#FFD700';
              ctx.shadowBlur = 10;
              const ps = cs * 0.38;
              ctx.beginPath();
              ctx.arc(x + cs / 2, y + cs / 2, ps, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }
    }
  }

  _drawWallSegment(ctx, c, r, x, y, cs) {
    const has = (dc, dr) => {
      const nc = c + dc, nr = r + dr;
      if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) return true;
      return this.grid[nr][nc] === 1;
    };

    ctx.strokeStyle = '#4444FF';
    ctx.lineWidth = Math.max(1, cs * 0.12);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const pad = cs * 0.1;
    const inner = cs - pad * 2;

    // Draw borders between wall and non-wall
    ctx.beginPath();

    // top
    if (!has(0, -1)) {
      ctx.moveTo(x + pad, y + pad);
      ctx.lineTo(x + cs - pad, y + pad);
    }
    // bottom
    if (!has(0, 1)) {
      ctx.moveTo(x + pad, y + cs - pad);
      ctx.lineTo(x + cs - pad, y + cs - pad);
    }
    // left
    if (!has(-1, 0)) {
      ctx.moveTo(x + pad, y + pad);
      ctx.lineTo(x + pad, y + cs - pad);
    }
    // right
    if (!has(1, 0)) {
      ctx.moveTo(x + cs - pad, y + pad);
      ctx.lineTo(x + cs - pad, y + cs - pad);
    }
    ctx.stroke();
  }
}
