// game/key.js
// KeyPickup is a collectible object used for win progression.
// Responsibilities:
// - animate the key sprite sheet (18 frames)
// - detect when the player is close enough to collect it
// - increment gameEngine.keysCollected and remove itself from the world
// - optional: wake up a “guard” enemy when the player approaches the key

class KeyPickup {
    constructor(game, assetManager, camera, player, x, y, opts = {}) {
      // Core references
      this.game = game;
      this.AM = assetManager;
      this.camera = camera;
      this.player = player;
  
      // World position
      this.x = x;
      this.y = y;
  
      // Tag used for filtering/debugging if needed
      this.tag = "pickup_key";
  
      // Visual + pickup tuning
      this.size = opts.size ?? 48;           // desired on-screen size (roughly width-based)
      this.pickupRadius = opts.radius ?? 26; // distance required to collect
      this.removeFromWorld = false;
  
      // Sprite sheet path
      this.imgPath = "assets/images/keys_sprites/gold_key.png";
  
      // ----------------------------------------------------
      // Animation (sprite sheet)
      // ----------------------------------------------------
      this.frames = 18;        // number of frames in the sheet (horizontal strip)
      this.frameIndex = 0;     // current frame (0..frames-1)
      this.animElapsed = 0;    // time accumulator
      this.frameTime = 0.08;   // seconds per frame (smaller = faster animation)
  
      // ----------------------------------------------------
      // Optional key-guard behavior
      // If a guard enemy is assigned, it will remain asleep until player
      // gets within wakeRadius of this key.
      // ----------------------------------------------------
      this.guardEnemy = opts.guardEnemy ?? null; // Enemy instance to wake
      this.wakeRadius = opts.wakeRadius ?? 180;  // distance to wake the guard
      this.guardWoken = false;                   // prevents waking more than once
    }
  
    update() {
      // Stop collecting keys after game over (prevents odd edge cases)
      if (this.game.gameOver) return;
  
      const dt = this.game.clockTick || 1 / 60;
  
      // ----------------------------------------------------
      // Animation update
      // ----------------------------------------------------
      this.animElapsed += dt;
      if (this.animElapsed >= this.frameTime) {
        this.animElapsed = 0;
        this.frameIndex = (this.frameIndex + 1) % this.frames;
      }
  
      // ----------------------------------------------------
      // Optional guard wake logic (key activates its guard when player nears it)
      // ----------------------------------------------------
      if (this.guardEnemy && !this.guardWoken) {
        const dxk = this.player.x - this.x;
        const dyk = this.player.y - this.y;
        const dk = Math.hypot(dxk, dyk);
  
        if (dk <= this.wakeRadius) {
          this.guardWoken = true;
  
          // Enemy class supports asleep mode; waking lets it chase normally
          this.guardEnemy.asleep = false;
        }
      }
  
      // ----------------------------------------------------
      // Pickup check (collect if player is within radius)
      // ----------------------------------------------------
      const dx = this.player.x - this.x;
      const dy = this.player.y - this.y;
      const dist = Math.hypot(dx, dy);
  
      if (dist <= this.pickupRadius) {
        // Ensure counter exists
        if (typeof this.game.keysCollected !== "number") this.game.keysCollected = 0;
        this.game.keysCollected += 1;
  
        // Remove the key so it disappears and can't be collected again
        this.removeFromWorld = true;
  
        // Optional: quick debug confirmation in console
        console.log("Key collected! Total:", this.game.keysCollected);
      }
    }
  
    draw(ctx) {
      const img = this.AM.getAsset(this.imgPath);
      if (!img) return;
  
      // Sprite sheet frame size (assumes a horizontal strip)
      const fw = Math.floor(img.width / this.frames);
      const fh = img.height;
  
      const sx = this.frameIndex * fw;
      const sy = 0;
  
      // Convert world -> screen using camera
      const screenX = this.x - this.camera.renderX;
      const screenY = this.y - this.camera.renderY;
  
      // Preserve aspect ratio by scaling based on frame width
      const scale = this.size / fw;
      const drawW = fw * scale;
      const drawH = fh * scale;
  
      // Center the key on (screenX, screenY)
      const drawX = screenX - drawW / 2;
      const drawY = screenY - drawH / 2;
  
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        img,
        sx, sy, fw, fh,
        drawX, drawY, drawW, drawH
      );
    }
  }
  