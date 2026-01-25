// game/tilemap.js

class TileMap {
  constructor(game, assetManager) {
    this.game = game;
    this.AM = assetManager;

    this.TILE_SIZE = 32;

    // World size
    this.COLS = 120;
    this.ROWS = 80;
    this.WORLD_W = this.COLS * this.TILE_SIZE;
    this.WORLD_H = this.ROWS * this.TILE_SIZE;

    // Tile IDs
    this.GRASS = 0;

    // Build map
    this.grid = this.createGrassWithDirtPatches();

    // Spawn near center
    this.spawnCol = Math.floor(this.COLS * 0.5);
    this.spawnRow = Math.floor(this.ROWS * 0.5);
  }

  randomDirt() {
    return 1 + Math.floor(Math.random() * 5); // 1–5
  }

  inBounds(r, c) {
    return r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS;
  }

  createGrassWithDirtPatches() {
    // Start with full grass
    const map = Array.from({ length: this.ROWS }, () =>
      Array(this.COLS).fill(this.GRASS)
    );

    const PATCH_COUNT = 100;     // number of dirt patches
    const PATCH_MIN = 2;         // min patch radius
    const PATCH_MAX = 5;         // max patch radius

    for (let i = 0; i < PATCH_COUNT; i++) {
      const centerR = Math.floor(Math.random() * this.ROWS);
      const centerC = Math.floor(Math.random() * this.COLS);
      const radius =
        PATCH_MIN + Math.floor(Math.random() * (PATCH_MAX - PATCH_MIN + 1));

      for (let r = centerR - radius; r <= centerR + radius; r++) {
        for (let c = centerC - radius; c <= centerC + radius; c++) {
          if (!this.inBounds(r, c)) continue;

          // circular-ish shape
          const dist =
            Math.sqrt(
              Math.pow(r - centerR, 2) + Math.pow(c - centerC, 2)
            );

          if (dist <= radius && Math.random() < 0.85) {
            map[r][c] = this.randomDirt();
          }
        }
      }
    }

    return map;
  }

  draw(ctx, camera) {
    ctx.imageSmoothingEnabled = false;

    const camX = camera.renderX;
    const camY = camera.renderY;

    const startCol = Math.floor(camX / this.TILE_SIZE);
    const endCol = Math.ceil((camX + ctx.canvas.width) / this.TILE_SIZE);
    const startRow = Math.floor(camY / this.TILE_SIZE);
    const endRow = Math.ceil((camY + ctx.canvas.height) / this.TILE_SIZE);

    const grass = this.AM.getAsset("assets/images/tiles/grass.png");
    const d1 = this.AM.getAsset("assets/images/tiles/dirt1.png");
    const d2 = this.AM.getAsset("assets/images/tiles/dirt2.png");
    const d3 = this.AM.getAsset("assets/images/tiles/dirt3.png");
    const d4 = this.AM.getAsset("assets/images/tiles/dirt4.png");
    const d5 = this.AM.getAsset("assets/images/tiles/dirt5.png");

    for (let r = startRow; r < endRow; r++) {
      if (r < 0 || r >= this.ROWS) continue;

      for (let c = startCol; c < endCol; c++) {
        if (c < 0 || c >= this.COLS) continue;

        const tile = this.grid[r][c];
        const x = c * this.TILE_SIZE - camX;
        const y = r * this.TILE_SIZE - camY;

        if (tile === 0) ctx.drawImage(grass, x, y, this.TILE_SIZE, this.TILE_SIZE);
        else if (tile === 1) ctx.drawImage(d1, x, y, this.TILE_SIZE, this.TILE_SIZE);
        else if (tile === 2) ctx.drawImage(d2, x, y, this.TILE_SIZE, this.TILE_SIZE);
        else if (tile === 3) ctx.drawImage(d3, x, y, this.TILE_SIZE, this.TILE_SIZE);
        else if (tile === 4) ctx.drawImage(d4, x, y, this.TILE_SIZE, this.TILE_SIZE);
        else if (tile === 5) ctx.drawImage(d5, x, y, this.TILE_SIZE, this.TILE_SIZE);
      }
    }
  }
}
