// game/player.js
// Player handles: movement + collisions, attack + hit detection, health + damage/iframes/knockback,
// animation selection, camera follow, and drawing (sprite + HP bar).

class Player {
  constructor(game, assetManager, tileMap, camera) {
    // Core references (engine + shared systems)
    this.game = game;
    this.AM = assetManager;
    this.map = tileMap;
    this.camera = camera;

    // Tuning knobs (game feel)
    this.DRAW_SIZE = 128; // on-screen size of the player sprite
    this.SPEED = 3;       // movement speed per update

    // Spawn at map-defined spawn tile (centered in that tile)
    this.x = (this.map.spawnCol + 0.5) * this.map.TILE_SIZE;
    this.y = (this.map.spawnRow + 0.5) * this.map.TILE_SIZE;

    // Movement state
    this.dir = "down";   // facing direction: up/down/left/right
    this.moving = false; // whether player is currently moving

    // Combat state
    this.attacking = false;     // attack animation is currently playing
    this.attackHeld = false;    // prevents holding key from spamming attacks
    this.attackDidHit = false;  // ensures one hit per swing

    // Death state
    this.isDead = false;

    // Health
    this.maxHp = 10;
    this.hp = this.maxHp;

    // Damage feedback + invulnerability + knockback
    this.hurtInvuln = 0; // i-frames timer
    this.flashTimer = 0; // flicker timer for hit feedback
    this.knockVX = 0;    // knockback X velocity
    this.knockVY = 0;    // knockback Y velocity

    // i-frames/knockback tuning
    this.IFRAMES = 0.6;      // seconds of invulnerability after taking a hit
    this.KNOCK = 6.0;        // knockback strength
    this.KNOCK_DAMP = 0.75;  // knockback slow-down each update

    // Animation config (sprite sheets)
    // Each animation: path + frame count + frame width/height + frame time
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
      attack: {
        up:    { path: "assets/images/player_attack/attack1_up.png",    frames: 8, fw: 96, fh: 80, ft: 0.07 },
        down:  { path: "assets/images/player_attack/attack1_down.png",  frames: 8, fw: 96, fh: 80, ft: 0.07 },
        left:  { path: "assets/images/player_attack/attack1_left.png",  frames: 8, fw: 96, fh: 80, ft: 0.07 },
        right: { path: "assets/images/player_attack/attack1_right.png", frames: 8, fw: 96, fh: 80, ft: 0.07 },
      }
    };

    // Animation runtime state
    this.animElapsed = 0;       // seconds since current animation started
    this.animKey = "idle_down"; // current animation key string: "idle_down", "walk_left", etc.
  }

  // Utility clamp so player stays inside the world bounds
  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // --- Collision helpers ---
  // We collide using a "feet point" so the sprite can overlap walls/tiles visually without feeling chunky.
  getFeetPointAt(x, y) {
    // feet a bit below center
    return { fx: x, fy: y + 18 };
  }

  // True if the player's feet point is on a walkable tile
  canStandAt(x, y) {
    const { fx, fy } = this.getFeetPointAt(x, y);
    return !this.map.isBlockedAtWorld(fx, fy);
  }

  // --- Health / damage ---
  // Handles damage, i-frames, flash feedback, and knockback away from the attacker.
  // fromX/fromY are used to compute knockback direction.
  takeDamage(amount, fromX = null, fromY = null) {
    // already dead
    if (this.isDead || this.hp <= 0) return;

    // i-frames: ignore hits while invulnerable
    if (this.hurtInvuln > 0) return;

    // apply damage
    this.hp = Math.max(0, this.hp - amount);

    // start i-frames + flash
    this.hurtInvuln = this.IFRAMES;
    this.flashTimer = this.IFRAMES;

    // cancel attack so player doesn't get stuck attacking while hit
    this.attacking = false;
    this.attackDidHit = false;

    // knockback (push away from attacker if we know where they are)
    if (fromX !== null && fromY !== null) {
      let dx = this.x - fromX;
      let dy = this.y - fromY;

      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;

      // set knock velocity (applied in update via per-frame movement)
      this.knockVX = dx * this.KNOCK;
      this.knockVY = dy * this.KNOCK;
    }

    // death
    if (this.hp === 0) this.die();
  }

  // Simple heal (clamped to max)
  heal(amount) {
    if (this.isDead) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  // Marks player dead and triggers the game over screen (handled by main.js overlay)
  die() {
    this.isDead = true;
    this.attacking = false;
    this.moving = false;

    if (this.game && typeof this.game.triggerGameOver === "function") {
      this.game.triggerGameOver();
    }
  }

  // --- Combat hit detection ---
  // Attack uses a circular "hit area" in front of the player.
  getAttackCircle() {
    const r = 36;       // circle radius
    const forward = 34; // how far the circle is placed in front of the player

    let cx = this.x;
    let cy = this.y;

    if (this.dir === "up") cy -= forward;
    if (this.dir === "down") cy += forward;
    if (this.dir === "left") cx -= forward;
    if (this.dir === "right") cx += forward;

    return { cx, cy, r };
  }

  // Axis-aligned bounding box used by enemies for hit testing against the player
  // This is kept smaller than the sprite for fair gameplay.
  getCollisionAABBAt(x, y) {
    const w = 24;
    const h = 24;

    // slightly lower to match feet
    return {
      left: x - w / 2,
      top: (y + 12) - h / 2,
      w,
      h
    };
  }

  // Circle vs rectangle intersection used for attack hit detection
  circleIntersectsRect(cx, cy, r, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= r * r;
  }

  // Tries to hit the first enemy within the player's attack circle (one hit per swing)
  tryHitEnemies() {
    const atk = this.getAttackCircle();

    for (const ent of this.game.entities) {
      if (!ent || ent.tag !== "enemy") continue;
      if (typeof ent.getCollisionAABBAt !== "function") continue;

      const b = ent.getCollisionAABBAt(ent.x, ent.y);
      const rect = { x: b.left, y: b.top, w: b.w, h: b.h };

      if (this.circleIntersectsRect(atk.cx, atk.cy, atk.r, rect)) {
        ent.takeDamage?.(1);
        this.attackDidHit = true;
        return;
      }
    }
  }

  // Starts an attack animation and resets hit window tracking
  startAttack() {
    this.attacking = true;
    this.moving = false;
    this.attackDidHit = false;
    this.animKey = "attack_" + this.dir;
    this.animElapsed = 0;
  }

  // Decides which animation should be playing based on state
  getAnimKey() {
    if (this.attacking) return "attack_" + this.dir;
    if (this.moving) return "walk_" + this.dir;
    return "idle_" + this.dir;
  }

  // --- Update loop ---
  // Runs every frame: handles damage timers, knockback, input, movement/collisions, attacks, animation, camera follow.
  update() {
    // Stop all player updates after death, game over, or win
    if (this.isDead || this.game.gameOver || this.game.win) return;

    const keys = this.game.keys || {};
    const dt = this.game.clockTick || 1 / 60;

    // Timers: i-frames + flicker
    if (this.hurtInvuln > 0) this.hurtInvuln = Math.max(0, this.hurtInvuln - dt);
    if (this.flashTimer > 0) this.flashTimer = Math.max(0, this.flashTimer - dt);

    // Knockback movement (applies before player-controlled movement)
    if (Math.abs(this.knockVX) > 0.01 || Math.abs(this.knockVY) > 0.01) {
      const tryX = this.x + this.knockVX;
      if (this.canStandAt(tryX, this.y)) this.x = tryX;

      const tryY = this.y + this.knockVY;
      if (this.canStandAt(this.x, tryY)) this.y = tryY;

      // dampen knockback so it quickly settles
      this.knockVX *= this.KNOCK_DAMP;
      this.knockVY *= this.KNOCK_DAMP;
    }

    // Attack input (1 / Numpad1). attackHeld prevents repeat spam on hold.
    const atk = keys["1"] || keys["Numpad1"];
    if (atk && !this.attackHeld && !this.attacking) this.startAttack();
    this.attackHeld = !!atk;

    // If attacking, run attack animation + hit window and stop movement for this frame
    if (this.attacking) {
      const [state, dir] = this.animKey.split("_");
      const cfg = this.ANIM[state][dir];

      this.animElapsed += dt;
      const frame = Math.floor(this.animElapsed / cfg.ft);

      // Attack hit window (only checks once per swing)
      if (!this.attackDidHit && frame >= 2 && frame <= 4) {
        this.tryHitEnemies();
      }

      // End attack when animation finishes
      if (this.animElapsed >= cfg.frames * cfg.ft) {
        this.attacking = false;
        this.animElapsed = 0;
        this.animKey = "idle_" + this.dir;
      }

      // Keep player inside the world bounds while attacking
      const half = this.DRAW_SIZE / 2;
      this.x = this.clamp(this.x, half, this.map.WORLD_W - half);
      this.y = this.clamp(this.y, half, this.map.WORLD_H - half);

      this.camera.follow(this.x, this.y);
      return;
    }

    // Movement input (WASD + Arrow keys)
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

    // Facing direction updates based on dominant movement axis
    if (this.moving) {
      if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? "right" : "left";
      else this.dir = dy > 0 ? "down" : "up";
    }

    // Normalize diagonal movement so it's not faster than straight movement
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }

    // Per-axis movement with collision checks (prevents "weird" diagonal wall sticking)
    const stepX = dx * this.SPEED;
    const stepY = dy * this.SPEED;

    if (stepX !== 0) {
      const tryX = this.x + stepX;
      if (this.canStandAt(tryX, this.y)) this.x = tryX;
    }

    if (stepY !== 0) {
      const tryY = this.y + stepY;
      if (this.canStandAt(this.x, tryY)) this.y = tryY;
    }

    // Clamp inside world bounds
    const half = this.DRAW_SIZE / 2;
    this.x = this.clamp(this.x, half, this.map.WORLD_W - half);
    this.y = this.clamp(this.y, half, this.map.WORLD_H - half);

    // Animation update (reset timer when switching animations)
    const nextKey = this.getAnimKey();
    if (nextKey !== this.animKey) {
      this.animKey = nextKey;
      this.animElapsed = 0;
    } else {
      this.animElapsed += dt;
    }

    // Camera follows player each frame
    this.camera.follow(this.x, this.y);
  }

  // --- Rendering ---
  // Draws the sprite in camera space and renders a small HP bar above the player.
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

    ctx.imageSmoothingEnabled = false;

    // Flicker effect when hit (flashTimer active)
    if (this.flashTimer > 0) {
      const flicker = (Math.floor(this.flashTimer * 20) % 2) ? 0.35 : 1.0;
      ctx.save();
      ctx.globalAlpha = flicker;
      ctx.drawImage(img, sx, 0, cfg.fw, cfg.fh, drawX, drawY, this.DRAW_SIZE, this.DRAW_SIZE);
      ctx.restore();
    } else {
      ctx.drawImage(img, sx, 0, cfg.fw, cfg.fh, drawX, drawY, this.DRAW_SIZE, this.DRAW_SIZE);
    }

    this.drawHealthBar(ctx);
  }

  // Draws a small health bar above the player in screen space (camera-relative)
  drawHealthBar(ctx) {
    const screenX = this.x - this.camera.renderX;
    const screenY = this.y - this.camera.renderY;

    const spriteW = this.DRAW_SIZE;
    const barW = spriteW * 0.7;
    const barH = 8;

    const barX = screenX - barW / 2;
    const barY = screenY - (this.DRAW_SIZE / 2);

    const pct = this.hp / this.maxHp;

    ctx.save();
    ctx.globalAlpha = 0.95;

    // border/bg
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    // empty
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(barX, barY, barW, barH);

    // filled (green -> yellow -> red)
    ctx.fillStyle = pct > 0.5 ? "#2ecc71" : pct > 0.25 ? "#f1c40f" : "#e74c3c";
    ctx.fillRect(barX, barY, barW * pct, barH);

    ctx.restore();
  }
}
