// game/enemy.js
// Enemy entity:
// - Spawned via EnemyCreator (enemy_creator.js)
// - Interacts with Player (player.js) for damage
// - Uses TileMap (tilemap.js) for spawn positioning
// - Uses Camera (camera.js) for world-to-screen rendering
// - Uses AssetManager for sprite sheets

class Enemy {
  constructor(game, assetManager, tileMap, camera, player, opts = {}) {
    // Engine + shared systems
    this.game = game;
    this.AM = assetManager;
    this.map = tileMap;
    this.camera = camera;
    this.player = player;

    this.tag = "enemy";

    // Can be activated later (ex: key triggers in main.js)
    this.asleep = false;

    // Data-driven configuration comes from EnemyCreator
    this.type = opts.type || "unknown";
    this.def = opts;

    const S = opts.stats || {};

    // Core stats
    this.DRAW_SIZE = S.drawSize ?? 96;
    this.SPEED = S.speed ?? 1.8;
    this.hp = S.hp ?? 3;

    // Combat tuning
    this.attackHitRadius = S.attackHitRadius ?? 45;
    this.attackCooldownDefault = S.attackCooldown ?? 0.9;
    this.stopDist = S.stopDist ?? 44;
    this.attackRange = S.attackRange ?? 58;

    // Animation config injected from EnemyCreator
    this.ANIM = opts.anim;
    if (!this.ANIM) {
      throw new Error(`Enemy missing anim set for type: ${this.type}`);
    }

    // Runtime state
    this.state = "idle";
    this.animElapsed = 0;

    // Locks prevent state interruption
    this.hurtLocked = false;
    this.attackLocked = false;
    this.spawnLocked = false;

    this.dead = false;
    this.removeFromWorld = false;

    // Used for sprite flipping
    this.facing = "left";

    // Attack tracking
    this.attackDidHit = false;
    this.attackCooldown = 0;

    // Random spawn location away from player
    const spawn = this.pickRandomSpawn(S.minFromPlayer ?? 240);
    this.x = spawn.x;
    this.y = spawn.y;

    // Optional per-type setup hook (EnemyCreator)
    if (this.def && typeof this.def.onSpawn === "function") {
      this.def.onSpawn(this);
    }

    // If spawn state was pre-set externally, lock it
    if (this.state === "spawn") {
      this.spawnLocked = true;
      this.animElapsed = 0;
    }
  }

  // Smaller collision box than sprite for fair hit detection
  getCollisionAABBAt(x, y) {
    const w = 26;
    const h = 26;
    return { left: x - w / 2, top: y - h / 2, w, h };
  }

  // Chooses a random tile away from the player
  pickRandomSpawn(minFromPlayer) {
    const tries = 200;
    const t = this.map.TILE_SIZE;

    for (let i = 0; i < tries; i++) {
      const col = Math.floor(Math.random() * this.map.COLS);
      const row = Math.floor(Math.random() * this.map.ROWS);

      const x = (col + 0.5) * t;
      const y = (row + 0.5) * t;

      const d = Math.hypot(this.player.x - x, this.player.y - y);
      if (d < minFromPlayer) continue;

      return { x, y };
    }

    // Fallback if no good tile found
    return { x: this.player.x + 300, y: this.player.y };
  }

  // Starts optional spawn animation
  startSpawn() {
    if (!this.ANIM.spawn) {
      this.state = "idle";
      this.animElapsed = 0;
      this.spawnLocked = false;
      return;
    }

    this.state = "spawn";
    this.animElapsed = 0;
    this.spawnLocked = true;

    this.attackLocked = false;
    this.hurtLocked = false;
    this.attackDidHit = false;
  }

  // Called by Player attacks (player.js)
  takeDamage(amount = 1) {
    if (this.dead || this.hurtLocked) return;

    this.hp -= amount;

    // Death state
    if (this.hp <= 0) {
      this.dead = true;
      this.state = "die";
      this.animElapsed = 0;

      this.attackLocked = false;
      this.hurtLocked = false;
      this.spawnLocked = false;
      return;
    }

    // Hurt state
    this.state = "hurt";
    this.animElapsed = 0;
    this.hurtLocked = true;

    this.attackLocked = false;
  }

  // Begins attack animation and sets cooldown
  startAttack() {
    this.state = "attack";
    this.animElapsed = 0;
    this.attackLocked = true;
    this.attackDidHit = false;

    this.projectileFired = false; // used by ranged enemies

    this.attackCooldown = this.attackCooldownDefault ?? 0.9;
  }

  // Distance-based melee check (uses collision padding)
  isPlayerInAttackRadius() {
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const dist = Math.hypot(dx, dy);

    const enemyBox = this.getCollisionAABBAt(this.x, this.y);
    const playerBox = this.player.getCollisionAABBAt(this.player.x, this.player.y);
    const pad = (Math.max(enemyBox.w, enemyBox.h) + Math.max(playerBox.w, playerBox.h)) * 0.25;

    return dist <= (this.attackHitRadius + pad);
  }

  // Debug helper
  getAttackCircle() {
    const r = this.attackHitRadius;
    return { cx: this.x, cy: this.y, r };
  }

  // Main AI loop:
  // handles spawn → hurt → attack → chase → idle transitions
  update() {
    const dt = this.game.clockTick || 1 / 60;

    if (this.asleep) {
      this.state = "idle";
      this.animElapsed += dt;
      return;
    }

    // Always face player horizontally
    const fdx = this.player.x - this.x;
    this.facing = fdx < 0 ? "left" : "right";

    // Spawn state
    if (this.spawnLocked || this.state === "spawn") {
      if (this.state !== "spawn") this.state = "spawn";

      const cfg = this.ANIM.spawn;
      if (!cfg) {
        this.spawnLocked = false;
        this.state = "idle";
        this.animElapsed = 0;
        return;
      }

      this.animElapsed += dt;

      if (this.animElapsed >= cfg.frames * cfg.ft) {
        this.spawnLocked = false;
        this.state = "idle";
        this.animElapsed = 0;
      }

      return;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    }

    // Death state
    if (this.dead) {
      const cfg = this.ANIM.die;
      this.animElapsed += dt;
      if (this.animElapsed >= cfg.frames * cfg.ft) {
        this.removeFromWorld = true;
      }
      return;
    }

    // Hurt state
    if (this.hurtLocked) {
      const cfg = this.ANIM.hurt;
      this.animElapsed += dt;

      const fullHurtTime = cfg.frames * cfg.ft;
      const recovery = this.def?.stats?.hurtRecovery;
      const endTime = (typeof recovery === "number") ? Math.min(recovery, fullHurtTime) : fullHurtTime;

      if (this.animElapsed >= endTime) {
        this.hurtLocked = false;
        this.state = "idle";
        this.animElapsed = 0;
      }
      return;
    }

    // Attack state
    if (this.attackLocked) {
      const cfg = this.ANIM.attack;
      this.animElapsed += dt;

      const frame = Math.floor(this.animElapsed / cfg.ft);

      // Optional per-type attack behavior (ex: dragon projectile)
      this.def?.onAttackFrame?.(this, frame);

      // Melee hit window
      if (this.attackHitRadius > 0 && !this.attackDidHit && frame >= 3 && frame <= 5) {
        if (this.isPlayerInAttackRadius()) {
          this.player.takeDamage?.(1, this.x, this.y);
          this.attackDidHit = true;
        }
      }

      if (this.animElapsed >= cfg.frames * cfg.ft) {
        this.attackLocked = false;
        this.state = "idle";
        this.animElapsed = 0;
      }
      return;
    }

    // Chase logic
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.attackRange && this.attackCooldown === 0) {
      this.startAttack();
      return;
    }

    const holdInRange = !!this.def?.stats?.holdInRange;
    if (holdInRange && dist <= this.attackRange) {
      this.state = "idle";
      this.animElapsed += dt;
      return;
    }

    if (dist > this.stopDist) {
      const nx = dx / dist;
      const ny = dy / dist;

      this.x += nx * this.SPEED;
      this.y += ny * this.SPEED;

      this.state = "walk";
    } else {
      this.state = "idle";
    }

    this.animElapsed += dt;

    // Optional per-type behavior hook
    if (this.def && typeof this.def.onUpdate === "function") {
      this.def.onUpdate(this, dt);
    }
  }

  // Rendering + debug visuals
  draw(ctx) {
    const camX = this.camera.renderX;
    const camY = this.camera.renderY;

    const screenX = this.x - camX;
    const screenY = this.y - camY;

    const drawX = screenX - this.DRAW_SIZE / 2;
    const drawY = screenY - this.DRAW_SIZE / 2;

    const cfg = this.ANIM[this.state];
    const img = cfg ? this.AM.getAsset(cfg.path) : null;
    if (!cfg || !img) return;

    let frameIndex = Math.floor(this.animElapsed / cfg.ft);

    const nonLooping =
      this.state === "spawn" ||
      this.state === "attack" ||
      this.state === "hurt" ||
      this.state === "die";

    if (nonLooping) frameIndex = Math.min(frameIndex, cfg.frames - 1);
    else frameIndex = frameIndex % cfg.frames;

    const ox = cfg.ox ?? 0;
    const oy = cfg.oy ?? 0;
    const padX = cfg.padX ?? 0;
    const padY = cfg.padY ?? 0;

    const sx = ox + frameIndex * (cfg.fw + padX);
    const sy = oy + 0 * (cfg.fh + padY);

    ctx.imageSmoothingEnabled = false;

    let flip = (this.facing === "left");
    if (this.def?.stats?.invertFlip) flip = !flip;

    if (flip) {
      ctx.save();
      ctx.translate(drawX + this.DRAW_SIZE, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, cfg.fw, cfg.fh, 0, 0, this.DRAW_SIZE, this.DRAW_SIZE);
      ctx.restore();
    } else {
      ctx.drawImage(img, sx, sy, cfg.fw, cfg.fh, drawX, drawY, this.DRAW_SIZE, this.DRAW_SIZE);
    }

    if (this.game.debug) {
      ctx.save();

      const b = this.getCollisionAABBAt(this.x, this.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.left - camX, b.top - camY, b.w, b.h);

      const px = this.player.x;
      const py = this.player.y;
      const dist = Math.hypot(px - this.x, py - this.y);

      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.moveTo(this.x - camX, this.y - camY);
      ctx.lineTo(px - camX, py - camY);
      ctx.stroke();

      if (this.attackLocked || dist <= this.attackRange) {
        const atk = this.getAttackCircle();
        ctx.strokeStyle = "orange";
        ctx.beginPath();
        ctx.arc(atk.cx - camX, atk.cy - camY, atk.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.font = "12px monospace";
      ctx.fillStyle = "white";
      ctx.fillText(`HP:${this.hp}`, (this.x - camX) + 16, (this.y - camY) - 16);
      ctx.fillText(`d:${dist.toFixed(1)}`, (this.x - camX) + 16, (this.y - camY) - 4);

      if (this.attackCooldown > 0) {
        ctx.fillText(`cd:${this.attackCooldown.toFixed(2)}`, (this.x - camX) + 16, (this.y - camY) + 8);
      }

      if (this.state === "spawn") {
        ctx.fillText(`SPAWN`, (this.x - camX) + 16, (this.y - camY) + 20);
      }

      ctx.restore();
    }
  }
}
