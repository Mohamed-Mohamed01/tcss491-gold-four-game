// New Code
// game/minimap.js
// Minimap HUD overlay:
// - Pre-renders a tiny map overview once per map load (fast each frame)
// - Draws live markers for player, keys, and exit
// - Optional camera viewport rectangle

class Minimap {
  constructor(game, tileMap, camera, player) {
    // New Code
    this.game = game;
    this.map = tileMap;
    this.camera = camera;
    this.player = player;

    this.visible = true;
    this.toggleHeld = false;

    // Keep it compact in the top-left
    this.padding = 10;
    this.panelPad = 6;
    this.maxW = 190;
    this.maxH = 160;

    this.scale = 1;
    this.bgCanvas = null;
    this.bgCtx = null;

    this._mapRef = null;
    this._worldW = 0;
    this._worldH = 0;

    this.buildBackground();
  }

  // New Code
  // Pre-render a simplified map view (land vs water) to an offscreen canvas.
  // This is done once per map load so we don't redraw tiles every frame.
  buildBackground() {
    if (!this.map || !this.map.layers) return;

    const worldW = this.map.WORLD_W;
    const worldH = this.map.WORLD_H;
    const tileSize = this.map.TILE_SIZE || 32;

    if (!worldW || !worldH) return;

    const scale = Math.min(this.maxW / worldW, this.maxH / worldH);
    this.scale = Math.max(0.05, Math.min(scale, 1));

    const w = Math.max(1, Math.floor(worldW * this.scale));
    const h = Math.max(1, Math.floor(worldH * this.scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // Base fill (dark neutral)
    ctx.fillStyle = "#0f1518";
    ctx.fillRect(0, 0, w, h);

    const layers = Object.values(this.map.layers || {});
    const waterLayers = layers.filter((l) =>
      (l.name || "").toLowerCase().includes("water")
    );

    // Draw each tile once: water takes priority, then land.
    const rows = this.map.ROWS || 0;
    const cols = this.map.COLS || 0;
    const tileW = tileSize * this.scale;
    const tileH = tileSize * this.scale;

    const landColor = "#3a4c3a";
    const waterColor = "#29495a";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;

        let isWater = false;
        for (const wl of waterLayers) {
          if (wl && wl.data && wl.data[idx] > 0) {
            isWater = true;
            break;
          }
        }

        if (isWater) {
          ctx.fillStyle = waterColor;
          ctx.fillRect(c * tileW, r * tileH, tileW, tileH);
          continue;
        }

        let isLand = false;
        for (const l of layers) {
          if (l && l.data && l.data[idx] > 0) {
            isLand = true;
            break;
          }
        }

        if (isLand) {
          ctx.fillStyle = landColor;
          ctx.fillRect(c * tileW, r * tileH, tileW, tileH);
        }
      }
    }

    this.bgCanvas = canvas;
    this.bgCtx = ctx;
    this._mapRef = this.map._map;
    this._worldW = worldW;
    this._worldH = worldH;
  }

  // New Code
  // Toggle visibility with "M", and rebuild background if map changed.
  update() {
    const keys = this.game.keys || {};
    const mDown = keys["m"] || keys["M"];
    if (mDown && !this.toggleHeld) {
      this.visible = !this.visible;
    }
    this.toggleHeld = !!mDown;

    if (
      this.map &&
      (this.map._map !== this._mapRef ||
        this.map.WORLD_W !== this._worldW ||
        this.map.WORLD_H !== this._worldH)
    ) {
      this.buildBackground();
    }
  }

  // New Code
  // Draw the minimap panel + live markers on the HUD layer.
  draw(ctx) {
    if (!this.visible || !this.bgCanvas) return;

    const x = this.padding;
    const y = this.padding;
    const w = this.bgCanvas.width;
    const h = this.bgCanvas.height;

    ctx.save();

    // Panel background + border
    ctx.fillStyle = "rgba(10, 12, 16, 0.72)";
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, w + this.panelPad * 2, h + this.panelPad * 2);
    ctx.strokeRect(x, y, w + this.panelPad * 2, h + this.panelPad * 2);

    // Map image
    ctx.drawImage(this.bgCanvas, x + this.panelPad, y + this.panelPad);

    const ox = x + this.panelPad;
    const oy = y + this.panelPad;
    const scale = this.scale;

    // Player marker
    if (this.player) {
      const px = ox + this.player.x * scale;
      const py = oy + this.player.y * scale;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Key markers (yellow)
    const keys = this.map?.keySpawns || [];
    ctx.fillStyle = "#ffd34a";
    for (const k of keys) {
      const kx = ox + k.x * scale;
      const ky = oy + k.y * scale;
      ctx.beginPath();
      ctx.arc(kx, ky, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Exit markers (blue arrow)
    const exits = this.map?.exitSpawns || [];
    ctx.fillStyle = "#4aa3ff";
    for (const e of exits) {
      const ex = ox + e.x * scale;
      const ey = oy + e.y * scale;
      ctx.beginPath();
      ctx.moveTo(ex, ey - 4);
      ctx.lineTo(ex + 3.5, ey + 3);
      ctx.lineTo(ex - 3.5, ey + 3);
      ctx.closePath();
      ctx.fill();
    }

    // Camera viewport rectangle (thin white outline)
    if (this.camera && this.game?.ctx?.canvas) {
      const vw = this.game.ctx.canvas.width * scale;
      const vh = this.game.ctx.canvas.height * scale;
      const vx = ox + this.camera.renderX * scale;
      const vy = oy + this.camera.renderY * scale;

      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1;
      ctx.strokeRect(vx, vy, vw, vh);
    }

    ctx.restore();
  }
}

