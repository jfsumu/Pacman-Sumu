class PacMan {
  constructor(maze) {
    this.maze = maze;
    this.cs = maze.cellSize;
    this.reset();
  }

  reset() {
    const cs = this.cs;
    this.col = 14;
    this.row = 23;
    this.x = this.col * cs + cs / 2;
    this.y = this.row * cs + cs / 2;
    this.dir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };
    this.speed = cs * 0.08;
    this.mouthAngle = 0.25;
    this.mouthDir = 1;
    this.dead = false;
    this.deathFrame = 0;
    this.powerTimer = 0;
  }

  setDirection(dx, dy) {
    this.nextDir = { x: dx, y: dy };
  }

  isPowered() {
    return this.powerTimer > 0;
  }

  update() {
    if (this.dead) {
      this.deathFrame++;
      return;
    }

    if (this.powerTimer > 0) this.powerTimer--;

    const cs = this.cs;

    // Try to apply next direction if it's clear
    const nx = Math.round(this.x / cs);
    const ny = Math.round(this.y / cs);
    const cx = nx * cs;
    const cy = ny * cs;

    // Snap tolerance
    const tol = this.speed + 1;

    if (Math.abs(this.x - cx) < tol && Math.abs(this.y - cy) < tol) {
      // Can we turn?
      if (!this.maze.isWall(nx + this.nextDir.x, ny + this.nextDir.y)) {
        this.dir = { ...this.nextDir };
        this.x = cx;
        this.y = cy;
      }
      // Can we continue current dir?
      if (this.maze.isWall(nx + this.dir.x, ny + this.dir.y)) {
        this.dir = { x: 0, y: 0 };
      }
    }

    this.x += this.dir.x * this.speed;
    this.y += this.dir.y * this.speed;

    // Tunnel wrap
    const cols = this.maze.cols;
    if (this.x < -cs / 2) this.x = cols * cs + cs / 2;
    if (this.x > cols * cs + cs / 2) this.x = -cs / 2;

    // Mouth animation
    if (this.dir.x !== 0 || this.dir.y !== 0) {
      this.mouthAngle += 0.05 * this.mouthDir;
      if (this.mouthAngle > 0.25) this.mouthDir = -1;
      if (this.mouthAngle < 0.02) this.mouthDir = 1;
    }
  }

  draw(ctx) {
    if (this.dead) {
      this._drawDeath(ctx);
      return;
    }

    const r = this.cs * 0.44;
    let angle = 0;

    if (this.dir.x === 1) angle = 0;
    else if (this.dir.x === -1) angle = Math.PI;
    else if (this.dir.y === -1) angle = -Math.PI / 2;
    else if (this.dir.y === 1) angle = Math.PI / 2;

    const mouth = this.mouthAngle * Math.PI;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);

    // Glow
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 12;

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, mouth, Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _drawDeath(ctx) {
    const progress = Math.min(this.deathFrame / 60, 1);
    const r = this.cs * 0.44;
    const mouth = progress * Math.PI;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-Math.PI / 2);

    ctx.fillStyle = `rgba(255,215,0,${1 - progress * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * (1 - progress * 0.3), mouth, Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  getCell() {
    const cs = this.cs;
    return {
      col: Math.round(this.x / cs),
      row: Math.round(this.y / cs)
    };
  }

  collidesWith(ghost) {
    const dx = this.x - ghost.x;
    const dy = this.y - ghost.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < this.cs * 0.75;
  }
}
