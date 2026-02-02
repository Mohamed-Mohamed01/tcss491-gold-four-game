// game/tilemap.js
// TileMap is responsible for: world size, base tile grid generation, object placement (trees/bushes/stones),
// collision queries (what tiles are blocked), and drawing everything relative to the camera.

class TileMap {
  constructor(game, assetManager) {
    this.game = game;
    this.AM = assetManager;

    // Tile size in pixels (all world math is based on this)
    this.TILE_SIZE = 32;

    // World dimensions in tiles and pixels
    this.COLS = 140;
    this.ROWS = 90;
    this.WORLD_W = this.COLS * this.TILE_SIZE;
    this.WORLD_H = this.ROWS * this.TILE_SIZE;

    // Tile IDs (0 is walkable grass; anything else is treated as blocked)
    this.GRASS = 0;

    // Base map generation:
    // - start as all grass
    // - add a dirt wall around the edge so the player can't leave the world
    this.grid = this.createAllGrass();
    this.applyEdgeDirtWall(2);

    // Player spawn point (tile coordinates)
    this.spawnCol = Math.floor(this.COLS * 0.5);
    this.spawnRow = Math.floor(this.ROWS * 0.5);

    // Object layer (trees/bushes/stones)
    // objects[] stores what to draw
    // objectBlocked[][] stores which tiles are blocked for collisions
    this.objects = [];
    this.objectBlocked = Array.from({ length: this.ROWS }, () =>
      Array(this.COLS).fill(false)
    );

    // Place objects with spacing so it looks natural and doesn't overload the map
    this.generateObjects();

    // Overlay grass is a visual-only layer (small tufts) mostly near trees
    this.overlayGrass = this.createOverlayGrassNearTrees();
  }

  // Random integer helper (inclusive)
  randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  // Random dirt tile id (1..5)
  randomDirt() {
    return 1 + Math.floor(Math.random() * 5);
  }

  // True if row/col is inside the grid
  inBounds(r, c) {
    return r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS;
  }

  // Our rule: grass is walkable, dirt is blocked
  isBlockedTile(tileId) {
    return tileId !== this.GRASS;
  }

  // Converts world pixel coordinates -> tile grid coordinates
  worldToTile(x, y) {
    return {
      col: Math.floor(x / this.TILE_SIZE),
      row: Math.floor(y / this.TILE_SIZE),
    };
  }

  // Returns the base tile id at a world position (or null if out of bounds)
  getTileAtWorld(x, y) {
    const { row, col } = this.worldToTile(x, y);
    if (!this.inBounds(row, col)) return null;
    return this.grid[row][col];
  }

  // Main collision query used by Player/Enemy:
  // - outside map counts as blocked
  // - dirt tiles are blocked
  // - objectBlocked tiles are blocked
  isBlockedAtWorld(x, y) {
    const { row, col } = this.worldToTile(x, y);

    if (!this.inBounds(row, col)) return true;

    const tile = this.grid[row][col];
    if (this.isBlockedTile(tile)) return true;

    if (this.objectBlocked[row][col]) return true;

    return false;
  }

  // Creates a full grass base grid
  createAllGrass() {
    return Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(this.GRASS));
  }

  // Paints a dirt border around the world so the player can't leave
  applyEdgeDirtWall(thickness = 2) {
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const nearTop = r < thickness;
        const nearBottom = r >= this.ROWS - thickness;
        const nearLeft = c < thickness;
        const nearRight = c >= this.COLS - thickness;

        if (nearTop || nearBottom || nearLeft || nearRight) {
          this.grid[r][c] = this.randomDirt();
        }
      }
    }
  }

  // Generates object placements and updates objectBlocked[][] accordingly
  generateObjects() {
    // clear existing objects
    this.objects.length = 0;
    for (let r = 0; r < this.ROWS; r++) {
      this.objectBlocked[r].fill(false);
    }

    // Counts tuned so the world has detail without becoming too dense
    const TREE_COUNT = 45;
    const BUSH_COUNT = 55;
    const STONE_COUNT = 45;

    // Place objects with minimum spacing in tiles (bigger = more spread out)
    this.placeObjects("tree", TREE_COUNT, 6);
    this.placeObjects("bush", BUSH_COUNT, 5);
    this.placeObjects("stone", STONE_COUNT, 4);
  }

  // Places objects of a specific type with minimum spacing and spawn/border avoidance
  placeObjects(type, count, minDistTiles) {
    const triesMax = count * 140;

    // avoid placing objects on/near player spawn
    const avoidR = this.spawnRow;
    const avoidC = this.spawnCol;
    const avoidRadius = 6;

    // avoid placing objects too close to world border wall
    const borderPad = 2;

    let placed = 0;
    let tries = 0;

    while (placed < count && tries < triesMax) {
      tries++;

      const r = this.randInt(borderPad, this.ROWS - 1 - borderPad);
      const c = this.randInt(borderPad, this.COLS - 1 - borderPad);

      // only place on grass base tiles
      if (this.grid[r][c] !== this.GRASS) continue;

      // don’t block spawn area
      if (Math.hypot(r - avoidR, c - avoidC) < avoidRadius) continue;

      // tile already occupied by another object
      if (this.objectBlocked[r][c]) continue;

      // spacing check
      if (!this.isFarEnoughFromOtherObjects(r, c, minDistTiles)) continue;

      // bushes have multiple sprite variants
      let variant = 0;
      if (type === "bush") {
        const options = ["bush", "2", "3", "4", "5", "6"];
        variant = options[Math.floor(Math.random() * options.length)];
      }

      // trees can have subtle random scale variation
      let scale = 1;
      if (type === "tree") {
        scale = 1.6 + Math.random() * 0.35;
      }

      // store object for drawing and mark that tile as blocked for collisions
      this.objects.push({ type, row: r, col: c, variant, scale });
      this.objectBlocked[r][c] = true;
      placed++;
    }
  }

  // Checks local neighborhood in objectBlocked[][] so objects keep spacing
  isFarEnoughFromOtherObjects(r, c, minDist) {
    const r0 = Math.max(0, r - minDist);
    const r1 = Math.min(this.ROWS - 1, r + minDist);
    const c0 = Math.max(0, c - minDist);
    const c1 = Math.min(this.COLS - 1, c + minDist);

    for (let rr = r0; rr <= r1; rr++) {
      for (let cc = c0; cc <= c1; cc++) {
        if (!this.objectBlocked[rr][cc]) continue;
        if (Math.hypot(rr - r, cc - c) < minDist) return false;
      }
    }
    return true;
  }

  // Builds a visual-only overlay grid (small grass tufts)
  // Mostly near trees + a tiny chance everywhere else
  createOverlayGrassNearTrees() {
    const overlay = Array.from({ length: this.ROWS }, () =>
      Array(this.COLS).fill(0)
    );

    const radius = 5;
    const nearTreeChance = 0.18;
    const baseChance = 0.003;

    // collect tree positions for proximity checks
    const treeCells = [];
    for (const o of this.objects) {
      if (o.type === "tree") treeCells.push({ r: o.row, c: o.col });
    }

    const isNearTree = (r, c) => {
      for (const t of treeCells) {
        if (Math.hypot(t.r - r, t.c - c) <= radius) return true;
      }
      return false;
    };

    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        if (this.grid[r][c] !== this.GRASS) continue;
        if (this.objectBlocked[r][c]) continue;

        const chance = isNearTree(r, c) ? nearTreeChance : baseChance;
        if (Math.random() < chance) {
          overlay[r][c] = this.randInt(1, 6);
        }
      }
    }

    return overlay;
  }

  // Draws the visible portion of the map relative to the camera:
  // 1) base tiles (grass/dirt) + overlay grass
  // 2) objects on top (sorted by row so lower objects draw later)
  // Optional debug: shows blocked tiles and object tiles
  draw(ctx, camera) {
    ctx.imageSmoothingEnabled = false;

    const camX = camera.renderX;
    const camY = camera.renderY;

    // compute visible tile bounds (based on canvas size and camera position)
    const startCol = Math.floor(camX / this.TILE_SIZE);
    const endCol = Math.ceil((camX + ctx.canvas.width) / this.TILE_SIZE);
    const startRow = Math.floor(camY / this.TILE_SIZE);
    const endRow = Math.ceil((camY + ctx.canvas.height) / this.TILE_SIZE);

    // base tile images
    const grass = this.AM.getAsset("assets/images/tiles/grass.png");
    const d1 = this.AM.getAsset("assets/images/tiles/dirt1.png");
    const d2 = this.AM.getAsset("assets/images/tiles/dirt2.png");
    const d3 = this.AM.getAsset("assets/images/tiles/dirt3.png");
    const d4 = this.AM.getAsset("assets/images/tiles/dirt4.png");
    const d5 = this.AM.getAsset("assets/images/tiles/dirt5.png");

    // overlay grass images (index 1..6)
    const overlayGrassImgs = [
      null,
      this.AM.getAsset("assets/images/tiles/overlay_grass/1.png"),
      this.AM.getAsset("assets/images/tiles/overlay_grass/2.png"),
      this.AM.getAsset("assets/images/tiles/overlay_grass/3.png"),
      this.AM.getAsset("assets/images/tiles/overlay_grass/4.png"),
      this.AM.getAsset("assets/images/tiles/overlay_grass/5.png"),
      this.AM.getAsset("assets/images/tiles/overlay_grass/6.png"),
    ];

    // object images
    const treeImg = this.AM.getAsset("assets/images/tiles/tree.png");
    const stoneImg = this.AM.getAsset("assets/images/tiles/stone.png");

    const bushImgs = {
      bush: this.AM.getAsset("assets/images/tiles/overlay_bush/bush.png"),
      "2": this.AM.getAsset("assets/images/tiles/overlay_bush/2.png"),
      "3": this.AM.getAsset("assets/images/tiles/overlay_bush/3.png"),
      "4": this.AM.getAsset("assets/images/tiles/overlay_bush/4.png"),
      "5": this.AM.getAsset("assets/images/tiles/overlay_bush/5.png"),
      "6": this.AM.getAsset("assets/images/tiles/overlay_bush/6.png"),
    };

    // 1) draw base tiles + overlay grass
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

        // overlay grass on walkable grass tiles (draw smaller to avoid distortion)
        const og = this.overlayGrass[r][c];
        if (tile === this.GRASS && og > 0) {
          const img = overlayGrassImgs[og];
          if (img) {
            const s = Math.floor(this.TILE_SIZE * 0.55);
            const ox = x + Math.floor((this.TILE_SIZE - s) / 2);
            const oy = y + Math.floor((this.TILE_SIZE - s) / 2);
            ctx.drawImage(img, ox, oy, s, s);
          }
        }

        // debug: outline blocked base tiles (dirt wall)
        if (this.game.debug && this.isBlockedTile(tile)) {
          ctx.save();
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
          ctx.restore();
        }
      }
    }

    // 2) draw objects on top (only the visible ones)
    const visible = [];
    for (const o of this.objects) {
      if (
        o.row >= startRow - 2 &&
        o.row <= endRow + 2 &&
        o.col >= startCol - 2 &&
        o.col <= endCol + 2
      ) {
        visible.push(o);
      }
    }

    // draw lower rows later so objects overlap naturally
    visible.sort((a, b) => a.row - b.row);

    for (const o of visible) {
      const x = o.col * this.TILE_SIZE - camX;
      const y = o.row * this.TILE_SIZE - camY;

      if (o.type === "tree") {
        // Trees are drawn larger and anchored to the tile bottom
        const scale = 3.0;
        const size = this.TILE_SIZE * scale;

        ctx.drawImage(
          treeImg,
          x + this.TILE_SIZE / 3.5 - size / 3.5,
          y + this.TILE_SIZE - size,
          size,
          size
        );
      } else if (o.type === "stone") {
        ctx.drawImage(stoneImg, x, y, this.TILE_SIZE, this.TILE_SIZE);
      } else if (o.type === "bush") {
        const img = bushImgs[o.variant] || bushImgs.bush;
        ctx.drawImage(img, x, y, this.TILE_SIZE, this.TILE_SIZE);
      }

      // debug: outline object blocker tile
      if (this.game.debug) {
        ctx.save();
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
        ctx.restore();
      }
    }
  }
}
