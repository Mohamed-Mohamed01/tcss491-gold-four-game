// game/scroll.js
// ScrollStoryPickup:
// - Spawned using Tiled point object named "story_scroll" (tilemap.js reads scrollSpawns)
// - Lets player press E nearby to open a DOM story overlay (index.html)
// - Freezes gameplay while the overlay is open via game.storyModalOpen (checked in player.js/enemy.js/etc)
// - Sets game.storyRead so it only triggers once (main.js/game state)

class ScrollStoryPickup {
  constructor(game, assetManager, camera, player, x, y, opts = {}) {
    // Shared systems
    this.game = game;
    this.AM = assetManager;
    this.camera = camera;
    this.player = player;

    // World position
    this.x = x;
    this.y = y;

    this.tag = "pickup_scroll";
    this.removeFromWorld = false;

    // Sprite sheet asset (queued in main.js)
    this.imgPath = "assets/images/scrolls/scrolls.png";

    // DOM overlay elements (must exist in index.html)
    this.storyOverlayEl = document.getElementById("storyOverlay");
    this.storyTitleEl = document.getElementById("storyTitle");
    this.storyTextEl = document.getElementById("storyText");
    this.storyCloseBtn = document.getElementById("storyCloseBtn");

    // Close overlay button
    if (this.storyCloseBtn) {
      this.storyCloseBtn.addEventListener("click", () => this.closeStory());
    }

    // Sprite sheet layout
    this.cols = 10;
    this.rows = 8;
    this.frames = 10;     // animate the first 10 frames of row 0
    this.rowIndex = 0;

    // Animation timing
    this.frameIndex = 0;
    this.animElapsed = 0;
    this.frameTime = 0.30;

    // Visual size + interaction distance
    this.size = 48;
    this.interactRadius = opts.radius ?? 70;

    // Key edge detection for E (prevents repeated triggers while held)
    this.eHeld = false;

    // Optional story lines (currently unused in openStory, but left for future customization)
    this.storyLines = opts.storyLines ?? [
      "A cursed land… three keys…",
      "Defeat the guardians and escape."
    ];
  }

  // Opens the overlay and pauses gameplay using game.storyModalOpen
  openStory() {
    if (this.storyOverlayEl) this.storyOverlayEl.style.display = "flex";

    if (this.storyTitleEl) this.storyTitleEl.textContent = "The Lost Barbarian";

    // Story content displayed in the overlay (line breaks preserved)
    const lines = [
      "You weren't meant to walk this cursed old road,",
      "One wrong turn, and now you bear the load.",
      "",
      "The forest closed in, the daylight grew thin",
      "A whispered path pulled you deep within.",
      "",
      "Three keys are hidden, scattered far and wide,",
      "Guarded by beasts that wake with pride.",
      "",
      "So steel your heart and keep death at bay",
      "Find the keys… and fight your way."
    ];

    if (this.storyTextEl) {
      this.storyTextEl.textContent = lines.join("\n");
      this.storyTextEl.style.whiteSpace = "pre-line";
    }

    // Systems like player.js/enemy.js check this flag to pause updates
    this.game.storyModalOpen = true;
  }

  // Closes overlay and returns input focus back to the canvas
  closeStory() {
    if (this.storyOverlayEl) this.storyOverlayEl.style.display = "none";

    this.game.storyModalOpen = false;

    const canvas = document.getElementById("gameWorld");
    canvas?.focus();
  }

  update() {
    // Stop updating when game ended
    if (this.game.gameOver || this.game.win) return;

    const dt = this.game.clockTick || 1 / 60;

    // Sprite animation loop
    this.animElapsed += dt;
    if (this.animElapsed >= this.frameTime) {
      this.animElapsed = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frames;
    }

    // Detect player proximity for interaction
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const dist = Math.hypot(dx, dy);

    const near = dist <= this.interactRadius;

    // Press E near scroll to open story overlay (only once)
    const eDown = this.game.keys?.["e"] || this.game.keys?.["E"];
    if (eDown && !this.eHeld && near && !this.game.storyRead) {
      this.game.storyRead = true;
      this.openStory();
    }

    this.eHeld = !!eDown;

    // Optional HUD toast timer (hud.js displays game.storyToast)
    if (this.game.storyToastTimer > 0) {
      this.game.storyToastTimer = Math.max(0, this.game.storyToastTimer - dt);
      if (this.game.storyToastTimer === 0) this.game.storyToast = "";
    }
  }

  draw(ctx) {
    const img = this.AM.getAsset(this.imgPath);
    if (!img) return;

    // Calculate frame size from sheet layout
    const fw = Math.floor(img.width / this.cols);
    const fh = Math.floor(img.height / this.rows);

    const sx = this.frameIndex * fw;
    const sy = this.rowIndex * fh;

    // Camera converts world -> screen coordinates
    const screenX = this.x - this.camera.renderX;
    const screenY = this.y - this.camera.renderY;

    // Scale to desired on-screen size
    const scale = this.size / fw;
    const drawW = fw * scale;
    const drawH = fh * scale;

    const drawX = screenX - drawW / 2;
    const drawY = screenY - drawH / 2;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, fw, fh, drawX, drawY, drawW, drawH);
  }
}
