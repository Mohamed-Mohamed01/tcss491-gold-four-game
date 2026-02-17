// game/resource_pickup.js
// Resource pickups dropped by enemies.
// - CoinPickup: animated sprite sheet, increments game.coinsCollected
// - HeartPickup: PNG icon, DOM-based glow, heals player by +1 (clamped)

class ResourcePickup {
  constructor(game, assetManager, camera, player, x, y, opts = {}) {
    this.game = game;
    this.AM = assetManager;
    this.camera = camera;
    this.player = player;

    this.x = x;
    this.y = y;

    this.size = opts.size ?? 24;
    this.pickupRadius = opts.radius ?? 26;

    this.removeFromWorld = false;
  }

  checkPickup() {
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.pickupRadius) {
      this.onPickup();
    }
  }

  onPickup() {
    this.removeFromWorld = true;
  }

  update() {
    if (this.game.gameOver || this.game.win) return;
    this.checkPickup();
  }

  draw(ctx) {
    // Base class does not draw anything by default.
  }
}

class CoinPickup extends ResourcePickup {
  constructor(game, assetManager, camera, player, x, y, opts = {}) {
    super(game, assetManager, camera, player, x, y, opts);

    this.tag = "pickup_coin";

    // IMPORTANT: AssetManager key must match queueDownload string exactly.
    // We’ll support both "assets/..." and "./assets/..." so it never silently fails.
    this.imgPath = opts.imgPath ?? "assets/images/resources_sprite/coin_sprite.png";
    this.altImgPath = this.imgPath.startsWith("./") ? this.imgPath.slice(2) : "./" + this.imgPath;

    this.frames = 15;
    this.frameIndex = 0;
    this.animElapsed = 0;
    this.frameTime = opts.frameTime ?? 0.1;

    // Coin sprite sheet spec (fixed)
    this.frameW = 16;
    this.frameH = 16;

    this.size = opts.size ?? 24;
    this.pickupRadius = opts.radius ?? 26;

    this._warnedMissing = false;
  }

  getCoinImage() {
    // Try exact key first, then fallback (./ vs no ./)
    let img = this.AM.getAsset(this.imgPath);
    if (!img) img = this.AM.getAsset(this.altImgPath);

    if (!img && !this._warnedMissing) {
      this._warnedMissing = true;
      console.warn(
        "[CoinPickup] coin sprite not found in AssetManager.",
        "Tried:", this.imgPath, "and", this.altImgPath,
        "Make sure queueDownload uses the exact same string."
      );
    }
    return img;
  }

  onPickup() {
    if (typeof this.game.coinsCollected !== "number") this.game.coinsCollected = 0;
    this.game.coinsCollected += 1;
    this.removeFromWorld = true;
  }

  update() {
    if (this.game.gameOver || this.game.win) return;

    const dt = this.game.clockTick || 1 / 60;

    this.animElapsed += dt;
    while (this.animElapsed >= this.frameTime) {
      this.animElapsed -= this.frameTime;
      this.frameIndex = (this.frameIndex + 1) % this.frames;
    }

    this.checkPickup();
  }

  draw(ctx) {
    const img = this.getCoinImage();
    if (!img) return;

    const sx = this.frameIndex * this.frameW;
    const sy = 0;

    const screenX = this.x - this.camera.renderX;
    const screenY = this.y - this.camera.renderY;

    const drawW = this.size;
    const drawH = this.size;

    const drawX = screenX - drawW / 2;
    const drawY = screenY - drawH / 2;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      img,
      sx, sy, this.frameW, this.frameH,
      drawX, drawY, drawW, drawH
    );
  }
}

class HeartPickup extends ResourcePickup {
  constructor(game, assetManager, camera, player, x, y, opts = {}) {
    super(game, assetManager, camera, player, x, y, opts);

    this.tag = "pickup_heart";

    this.imgPath = opts.imgPath ?? "assets/images/resources_sprite/heart.png";

    // Make it bigger by default (your complaint was “a bit small”)
    this.size = opts.size ?? 40;
    this.pickupRadius = opts.radius ?? 26;

    this.domEl = null;
    this.domImgEl = null;
    this.buildDom();
  }

  buildDom() {
    const container = document.getElementById("gameContainer");
    if (!container) return;

    const wrap = document.createElement("div");
    wrap.className = "pickup-heart pickup-heart-glow";
    wrap.style.width = `${this.size}px`;
    wrap.style.height = `${this.size}px`;

    const img = document.createElement("img");
    img.src = this.imgPath;
    img.alt = "heart";
    img.draggable = false;

    wrap.appendChild(img);
    container.appendChild(wrap);

    this.domEl = wrap;
    this.domImgEl = img;
  }

  syncDom() {
    if (!this.domEl) return;

    const screenX = this.x - this.camera.renderX;
    const screenY = this.y - this.camera.renderY;

    this.domEl.style.left = `${screenX}px`;
    this.domEl.style.top = `${screenY}px`;
  }

  removeDom() {
    if (this.domEl && this.domEl.parentNode) {
      this.domEl.parentNode.removeChild(this.domEl);
    }
    this.domEl = null;
    this.domImgEl = null;
  }

  onPickup() {
    // simplest consistent behavior: always allow pickup, even if max
    // (it just clamps and effectively does nothing if already max)
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);

    this.removeFromWorld = true;
    this.removeDom();
  }

  update() {
    if (this.game.gameOver || this.game.win) return;

    this.syncDom();
    this.checkPickup();

    if (this.removeFromWorld) {
      this.removeDom();
    }
  }

  draw() {
    // Heart pickup is DOM-based to allow CSS glow.
  }
}
