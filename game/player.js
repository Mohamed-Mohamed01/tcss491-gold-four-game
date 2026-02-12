// game/player.js
// Player entity:
// - Moves + collides against TileMap (tilemap.js)
// - Attack 1 + Attack 2 hit Enemy entities (enemy.js)
// - Health/i-frames/knockback; death calls game.triggerGameOver() (main.js)
// - Input uses game.keys (engine/gameengine.js)
// - Camera follow uses Camera (camera.js)
// - Pauses when story modal is open (scroll.js sets game.storyModalOpen)

class Player {
  constructor(game, assetManager, tileMap, camera) {
    this.game = game;
    this.AM = assetManager;
    this.map = tileMap;
    this.camera = camera;


    // Tuning
    this.DRAW_SIZE = 128;
    this.SPEED = 3;


    // Cooldowns
    this.attackCooldown = 0;
    this.attackCooldownTime = 0.1;

    this.attack2Cooldown = 0;
    this.attack2CooldownTime = 10.0;


    // Spawn (TileMap provides spawnX/spawnY or spawnCol/spawnRow)
    this.x = (this.map.spawnX !== undefined && this.map.spawnX !== null)
      ? this.map.spawnX
      : (this.map.spawnCol + 0.5) * this.map.TILE_SIZE;

    this.y = (this.map.spawnY !== undefined && this.map.spawnY !== null)
      ? this.map.spawnY
      : (this.map.spawnRow + 0.5) * this.map.TILE_SIZE;


    // Collision (feet-based checks via TileMap.isBlockedAtWorld)
    this.FOOT_OFFSET_Y = 18;
    this.FOOT_RADIUS = 12;


    // Movement state
    this.dir = "down";
    this.moving = false;


    // Combat state (Attack 1)
    this.attacking = false;
    this.attackHeld = false;
    this.attackDidHit = false;


    // Combat state (Attack 2 AoE)
    this.attacking2 = false;
    this.attack2Held = false; // kept as-is
    this.attack2DidHit = false;
    this.attack2HitSet = new Set();


    // Health / death / damage response
    this.isDead = false;

    this.maxHp = 15;
    this.hp = this.maxHp;

    this.hurtInvuln = 0;
    this.flashTimer = 0;

    this.knockVX = 0;
    this.knockVY = 0;

    this.IFRAMES = 0.6;
    this.KNOCK = 6.0;
    this.KNOCK_DAMP = 0.75;


    // Animations (assets queued in main.js)
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
      },

      attack2: {
        up:    { path: "assets/images/player_attack2/attack2_up.png",    frames: 8, fw: 96, fh: 80, ft: 0.045 },
        down:  { path: "assets/images/player_attack2/attack2_down.png",  frames: 8, fw: 96, fh: 80, ft: 0.045 },
        left:  { path: "assets/images/player_attack2/attack2_left.png",  frames: 8, fw: 96, fh: 80, ft: 0.045 },
        right: { path: "assets/images/player_attack2/attack2_right.png", frames: 8, fw: 96, fh: 80, ft: 0.045 },
      }
    };

    this.animElapsed = 0;
    this.animKey = "idle_down";
  }


  // Utilities
  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }


  // Collision helpers (TileMap.isBlockedAtWorld)
  getFeetPointAt(x, y) {
    return { fx: x, fy: y + this.FOOT_OFFSET_Y };
  }

  canStandAt(x, y) {
    const { fx, fy } = this.getFeetPointAt(x, y);
    const r = this.FOOT_RADIUS;

    const blocked =
      this.map.isBlockedAtWorld(fx, fy) ||
      this.map.isBlockedAtWorld(fx - r, fy) ||
      this.map.isBlockedAtWorld(fx + r, fy) ||
      this.map.isBlockedAtWorld(fx, fy - r) ||
      this.map.isBlockedAtWorld(fx, fy + r);

    return !blocked;
  }


  // Health / damage (Enemies call player.takeDamage in enemy.js)
  takeDamage(amount, fromX = null, fromY = null) {
    if (this.isDead || this.hp <= 0) return;
    if (this.hurtInvuln > 0) return;

    this.hp = Math.max(0, this.hp - amount);

    this.hurtInvuln = this.IFRAMES;
    this.flashTimer = this.IFRAMES;

    this.attacking = false;
    this.attacking2 = false;
    this.attackDidHit = false;
    this.attack2DidHit = false;
    this.attack2HitSet.clear();

    if (fromX !== null && fromY !== null) {
      let dx = this.x - fromX;
      let dy = this.y - fromY;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;

      this.knockVX = dx * this.KNOCK;
      this.knockVY = dy * this.KNOCK;
    }

    if (this.hp === 0) this.die();
  }

  die() {
    this.isDead = true;
    this.attacking = false;
    this.attacking2 = false;
    this.moving = false;

    // Assigned in main.js
    if (this.game && typeof this.game.triggerGameOver === "function") {
      this.game.triggerGameOver();
    }
  }


  // Attack shapes + intersection
  // Enemy collision boxes come from ent.getCollisionAABBAt (enemy.js)
  getAttackCircle() {
    const r = 36;
    const forward = 34;

    let cx = this.x;
    let cy = this.y;

    if (this.dir === "up") cy -= forward;
    if (this.dir === "down") cy += forward;
    if (this.dir === "left") cx -= forward;
    if (this.dir === "right") cx += forward;

    return { cx, cy, r };
  }

  getSplashCircle() {
    const r = 85;
    return { cx: this.x, cy: this.y, r };
  }

  getCollisionAABBAt(x, y) {
    const w = 24;
    const h = 24;

    return {
      left: x - w / 2,
      top: (y + 12) - h / 2,
      w,
      h
    };
  }

  circleIntersectsRect(cx, cy, r, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= r * r;
  }


  // Attack 1 (single target)
  tryHitEnemies() {
    if (this.attackCooldown > 0) return;

    const atk = this.getAttackCircle();

    for (const ent of this.game.entities) {
      if (!ent || ent.tag !== "enemy") continue;
      if (typeof ent.getCollisionAABBAt !== "function") continue;

      const b = ent.getCollisionAABBAt(ent.x, ent.y);
      const rect = { x: b.left, y: b.top, w: b.w, h: b.h };

      if (this.circleIntersectsRect(atk.cx, atk.cy, atk.r, rect)) {
        ent.takeDamage?.(1);
        this.attackCooldown = this.attackCooldownTime;
        this.attackDidHit = true;
        return;
      }
    }
  }


  // Attack 2 (AoE, hits each enemy once per swing)
  tryHitEnemiesSplash() {
    const aoe = this.getSplashCircle();

    for (const ent of this.game.entities) {
      if (!ent || ent.tag !== "enemy") continue;
      if (typeof ent.getCollisionAABBAt !== "function") continue;
      if (this.attack2HitSet.has(ent)) continue;

      const b = ent.getCollisionAABBAt(ent.x, ent.y);
      const rect = { x: b.left, y: b.top, w: b.w, h: b.h };

      if (this.circleIntersectsRect(aoe.cx, aoe.cy, aoe.r, rect)) {
        ent.takeDamage?.(2);
        this.attack2HitSet.add(ent);
      }
    }
  }


  // Attack state transitions
  startAttack() {
    this.attacking = true;
    this.attacking2 = false;
    this.moving = false;

    this.attackDidHit = false;

    this.animKey = "attack_" + this.dir;
    this.animElapsed = 0;
  }

  startAttack2() {
    this.attacking2 = true;
    this.attacking = false;
    this.moving = false;

    this.attack2DidHit = false;
    this.attack2HitSet.clear();

    this.attack2Cooldown = this.attack2CooldownTime;

    this.animKey = "attack2_" + this.dir;
    this.animElapsed = 0;
  }

  getAnimKey() {
    if (this.attacking2) return "attack2_" + this.dir;
    if (this.attacking) return "attack_" + this.dir;
    if (this.moving) return "walk_" + this.dir;
    return "idle_" + this.dir;
  }


  // Update loop
  // Input comes from game.keys (engine/gameengine.js)
  update() {
    const dt = this.game.clockTick || 1 / 60;

    // Managed by ScrollStoryPickup (scroll.js)
    if (this.game.storyModalOpen) {
      this.camera.follow(this.x, this.y);
      return;
    }

    if (this.attackCooldown > 0) this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    if (this.attack2Cooldown > 0) this.attack2Cooldown = Math.max(0, this.attack2Cooldown - dt);

    if (this.isDead || this.game.gameOver || this.game.win) return;

    const keys = this.game.keys || {};

    if (this.hurtInvuln > 0) this.hurtInvuln = Math.max(0, this.hurtInvuln - dt);
    if (this.flashTimer > 0) this.flashTimer = Math.max(0, this.flashTimer - dt);


    // Knockback (blocked by TileMap collision)
    if (Math.abs(this.knockVX) > 0.01 || Math.abs(this.knockVY) > 0.01) {
      const tryX = this.x + this.knockVX;
      if (this.canStandAt(tryX, this.y)) this.x = tryX;

      const tryY = this.y + this.knockVY;
      if (this.canStandAt(this.x, tryY)) this.y = tryY;

      this.knockVX *= this.KNOCK_DAMP;
      this.knockVY *= this.KNOCK_DAMP;
    }


    // Attack input
    const atk1 = keys["1"] || keys["Numpad1"];
    const atk2 = keys["2"] || keys["Numpad2"];

    if (atk2 && !this.attack2Held && !this.attacking && !this.attacking2 && this.attack2Cooldown === 0) {
      this.startAttack2();
    }

    if (atk1 && !this.attackHeld && !this.attacking && !this.attacking2) {
      this.startAttack();
    }

    this.attackHeld = !!atk1;


    // Attack 1 animation state
    if (this.attacking) {
      const [state, dir] = this.animKey.split("_");
      const cfg = this.ANIM[state][dir];

      this.animElapsed += dt;
      const frame = Math.floor(this.animElapsed / cfg.ft);

      if (!this.attackDidHit && frame >= 2 && frame <= 4) {
        this.tryHitEnemies();
      }

      if (this.animElapsed >= cfg.frames * cfg.ft) {
        this.attacking = false;
        this.animElapsed = 0;
        this.animKey = "idle_" + this.dir;
      }

      const half = this.DRAW_SIZE / 2;
      this.x = this.clamp(this.x, half, this.map.WORLD_W - half);
      this.y = this.clamp(this.y, half, this.map.WORLD_H - half);

      this.camera.follow(this.x, this.y);
      return;
    }


    // Attack 2 animation state
    if (this.attacking2) {
      const [state, dir] = this.animKey.split("_");
      const cfg = this.ANIM[state][dir];

      this.animElapsed += dt;
      const frame = Math.floor(this.animElapsed / cfg.ft);

      if (frame >= 6 && frame <= 12) {
        this.tryHitEnemiesSplash();
      }

      if (this.animElapsed >= cfg.frames * cfg.ft) {
        this.attacking2 = false;
        this.animElapsed = 0;
        this.animKey = "idle_" + this.dir;
        this.attack2DidHit = false;
        this.attack2HitSet.clear();
      }

      const half = this.DRAW_SIZE / 2;
      this.x = this.clamp(this.x, half, this.map.WORLD_W - half);
      this.y = this.clamp(this.y, half, this.map.WORLD_H - half);

      this.camera.follow(this.x, this.y);
      return;
    }


    // Movement input
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

    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }

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


    // World bounds (TileMap provides WORLD_W/WORLD_H)
    const half = this.DRAW_SIZE / 2;
    this.x = this.clamp(this.x, half, this.map.WORLD_W - half);
    this.y = this.clamp(this.y, half, this.map.WORLD_H - half);


    // Animation selection
    const nextKey = this.getAnimKey();
    if (nextKey !== this.animKey) {
      this.animKey = nextKey;
      this.animElapsed = 0;
    } else {
      this.animElapsed += dt;
    }

    this.camera.follow(this.x, this.y);
  }


  // Render (Camera converts world -> screen)
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

    if (this.flashTimer > 0) {
      const flicker = (Math.floor(this.flashTimer * 20) % 2) ? 0.35 : 1.0;
      ctx.save();
      ctx.globalAlpha = flicker;
      ctx.drawImage(img, sx, 0, cfg.fw, cfg.fh, drawX, drawY, this.DRAW_SIZE, this.DRAW_SIZE);
      ctx.restore();
    } else {
      ctx.drawImage(img, sx, 0, cfg.fw, cfg.fh, drawX, drawY, this.DRAW_SIZE, this.DRAW_SIZE);
    }

    if (this.game.debug && this.attacking2) {
      const aoe = this.getSplashCircle();
      ctx.save();
      ctx.strokeStyle = "rgba(0,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(aoe.cx - camX, aoe.cy - camY, aoe.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
