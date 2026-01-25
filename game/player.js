// game/player.js

class Player {
  constructor(game, assetManager, tileMap, camera) {
    this.game = game;
    this.AM = assetManager;
    this.map = tileMap;
    this.camera = camera;

    this.DRAW_SIZE = 128; // adjust size here

    this.SPEED = 3; // single movement speed (no run)

    // spawn at intersection
    this.x = (this.map.spawnCol + 0.5) * this.map.TILE_SIZE;
    this.y = (this.map.spawnRow + 0.5) * this.map.TILE_SIZE;

    this.dir = "down";
    this.moving = false;

    // Animation config
    this.ANIM = {
      idle: {
        up:    { path: "assets/images/player_idle/idle_up.png",    frames: 8, fw: 96, fh: 80, ft: 0.12 },
        down:  { path: "assets/images/player_idle/idle_down.png",  frames: 8, fw: 96, fh: 80, ft: 0.12 },
        left:  { path: "assets/images/player_idle/idle_left.png",  frames: 8, fw: 96, fh: 80, ft: 0.12 },
        right: { path: "assets/images/player_idle/idle_right.png", frames: 8, fw: 96, fh: 80, ft: 0.12 },
      },
      walk: {
        up:    { path: "assets/images/player_run/run_up.png",    frames: 8, fw: 96, fh: 80, ft: 0.09 },
        down:  { path: "assets/images/player_run/run_down.png",  frames: 8, fw: 96, fh: 80, ft: 0.09 },
        left:  { path: "assets/images/player_run/run_left.png",  frames: 8, fw: 96, fh: 80, ft: 0.09 },
        right: { path: "assets/images/player_run/run_right.png", frames: 8, fw: 96, fh: 80, ft: 0.09 },
      },
    };

    // animation clock
    this.animElapsed = 0;
    this.animKey = "idle_down";
  }

  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  getAnimKey() {
    // If moving, use the "walk" animation
    if (this.moving) return "walk_" + this.dir;
    return "idle_" + this.dir;
  }

  update() {
    const keys = this.game.keys;

    const up = keys["w"] || keys["W"] || keys["ArrowUp"];
    const down = keys["s"] || keys["S"] || keys["ArrowDown"];
    const left = keys["a"] || keys["A"] || keys["ArrowLeft"];
    const right = keys["d"] || keys["D"] || keys["ArrowRight"];

    let dx = 0;
    let dy = 0;

    if (up) dy -= 1;
    if (down) dy += 1;
    if (left) dx -= 1;
    if (right) dx += 1;

    this.moving = dx !== 0 || dy !== 0;

    if (this.moving) {
      if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? "right" : "left";
      else this.dir = dy > 0 ? "down" : "up";
    }

    // normalize diagonal
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }

    // move (single speed)
    this.x += dx * this.SPEED;
    this.y += dy * this.SPEED;

    // clamp to world
    const half = this.DRAW_SIZE / 2;
    this.x = this.clamp(this.x, half, this.map.WORLD_W - half);
    this.y = this.clamp(this.y, half, this.map.WORLD_H - half);

    // animation ticking
    const dt = this.game.clockTick || 1 / 60;
    const nextKey = this.getAnimKey();

    if (nextKey !== this.animKey) {
      this.animKey = nextKey;
      this.animElapsed = 0;
    } else {
      this.animElapsed += dt;
    }

    // camera follow
    this.camera.follow(this.x, this.y);
  }

  draw(ctx) {
    const camX = this.camera.renderX;
    const camY = this.camera.renderY;

    const screenX = this.x - camX;
    const screenY = this.y - camY;

    const drawX = screenX - this.DRAW_SIZE / 2;
    const drawY = screenY - this.DRAW_SIZE / 2;

    const [state, dir] = this.animKey.split("_");
    const cfg = this.ANIM[state][dir];
    const img = this.AM.getAsset(cfg.path);

    if (!img) return;

    const frameIndex = Math.floor(this.animElapsed / cfg.ft) % cfg.frames;
    const sx = frameIndex * cfg.fw;
    const sy = 0;

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      img,
      sx, sy, cfg.fw, cfg.fh,
      drawX, drawY,
      this.DRAW_SIZE, this.DRAW_SIZE
    );
  }
}
