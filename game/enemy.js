// game/enemy.js
// Enemy handles: spawning in the world, chasing the player, attacking with a hit window,
// taking damage (hurt + die states), animation state switching, and drawing (with optional debug visuals).
// This version is data-driven: stats + animations come from EnemyCreator, so adding new enemy types
// usually only requires updating EnemyCreator (not this file).

class Enemy {
    constructor(game, assetManager, tileMap, camera, player, opts = {}) {
      // Core references (engine + shared systems)
      this.game = game;
      this.AM = assetManager;
      this.map = tileMap;
      this.camera = camera;
      this.player = player;
  
      this.tag = "enemy";
  
      // Optional: enemies can be created "asleep" (idle) and activated later
      this.asleep = false;
  
      // EnemyCreator provides a definition object:
      // - type: a name for the enemy (ex: "skeletonWhite")
      // - stats: numbers that control difficulty and behavior
      // - anim: sprite sheet definitions for each state
      // - optional hooks: onSpawn and onUpdate for special behaviors
      this.type = opts.type || "unknown";
      this.def = opts;
  
      // Read stats with defaults (safe fallback values)
      const S = opts.stats || {};
  
      this.DRAW_SIZE = S.drawSize ?? 96;  // on-screen size
      this.SPEED = S.speed ?? 1.8;        // chase speed
      this.hp = S.hp ?? 3;                // health
  
      this.attackHitRadius = S.attackHitRadius ?? 45;       // how close player must be to get hit
      this.attackCooldownDefault = S.attackCooldown ?? 0.9; // delay between attacks
      this.stopDist = S.stopDist ?? 44;                     // how close to stop walking
      this.attackRange = S.attackRange ?? 58;               // how close to start attack
  
      // Animation set for states: idle, walk, attack, hurt, die
      this.ANIM = opts.anim;
      if (!this.ANIM) {
        throw new Error(`Enemy missing anim set for type: ${this.type}`);
      }
  
      // Runtime state
      this.state = "idle";     // current animation state
      this.animElapsed = 0;    // seconds since state started
  
      // State locks: used to keep hurt/attack animations from being interrupted
      this.hurtLocked = false;
      this.dead = false;
      this.removeFromWorld = false;
  
      // Visual facing direction (used for horizontal flip)
      this.facing = "left";
  
      // Attack control
      this.attackLocked = false;  // attack animation is currently playing
      this.attackDidHit = false;  // ensures only one hit per attack
      this.attackCooldown = 0;    // counts down to zero before attacking again
  
      // Spawn: choose a random walkable tile far enough away from the player
      const spawn = this.pickRandomSpawn(S.minFromPlayer ?? 240);
      this.x = spawn.x;
      this.y = spawn.y;
  
      // Optional per-type hook to customize any additional setup after spawn
      if (this.def && typeof this.def.onSpawn === "function") {
        this.def.onSpawn(this);
      }
    }
  
    // Small collision box (smaller than sprite for fair gameplay)
    getCollisionAABBAt(x, y) {
      const w = 26;
      const h = 26;
      return { left: x - w / 2, top: y - h / 2, w, h };
    }
  
    // Picks a random spawn position at least minFromPlayer away from player
    // Falls back to placing enemy to the side if it fails too many times
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
  
      return { x: this.player.x + 300, y: this.player.y };
    }
  
    // Applies damage and transitions into hurt or die animation
    takeDamage(amount = 1) {
      if (this.dead || this.hurtLocked) return;
  
      this.hp -= amount;
  
      // Die state: play die animation and remove after it finishes
      if (this.hp <= 0) {
        this.dead = true;
        this.state = "die";
        this.animElapsed = 0;
        this.attackLocked = false;
        this.hurtLocked = false;
        return;
      }
  
      // Hurt state: short locked animation, then return to idle
      this.state = "hurt";
      this.animElapsed = 0;
      this.hurtLocked = true;
      this.attackLocked = false;
    }
  
    // Starts an attack animation and sets cooldown so it can’t instantly attack again
    startAttack() {
      this.state = "attack";
      this.animElapsed = 0;
      this.attackLocked = true;
      this.attackDidHit = false;
  
      this.attackCooldown = this.attackCooldownDefault ?? 0.9;
    }
  
    // Uses distance-based hit instead of facing-based hitboxes (more consistent)
    // Adds padding based on collision boxes to avoid "touching but no hit" issues
    isPlayerInAttackRadius() {
      const dx = this.player.x - this.x;
      const dy = this.player.y - this.y;
      const dist = Math.hypot(dx, dy);
  
      const enemyBox = this.getCollisionAABBAt(this.x, this.y);
      const playerBox = this.player.getCollisionAABBAt(this.player.x, this.player.y);
      const pad = (Math.max(enemyBox.w, enemyBox.h) + Math.max(playerBox.w, playerBox.h)) * 0.25;
  
      return dist <= (this.attackHitRadius + pad);
    }
  
    // Debug helper: returns the attack circle (used for drawing debug ring)
    getAttackCircle() {
      const r = this.attackHitRadius;
      return { cx: this.x, cy: this.y, r };
    }
  
    // Main AI update:
    // - if asleep: idle only (until activated)
    // - if dead: play die animation then remove
    // - if hurtLocked: play hurt animation then return idle
    // - if attackLocked: play attack animation and apply hit during hit window
    // - otherwise: chase player and attack when close enough
    update() {
      const dt = this.game.clockTick || 1 / 60;
  
      // Asleep enemies stay idle until another system wakes them (example: key trigger)
      if (this.asleep) {
        this.state = "idle";
        this.animElapsed += dt;
        return;
      }
  
      // Cooldown ticks down each frame
      if (this.attackCooldown > 0) this.attackCooldown = Math.max(0, this.attackCooldown - dt);
  
      // DIE: only play animation and remove
      if (this.dead) {
        const cfg = this.ANIM.die;
        this.animElapsed += dt;
        if (this.animElapsed >= cfg.frames * cfg.ft) this.removeFromWorld = true;
        return;
      }
  
      // HURT: locked animation
      if (this.hurtLocked) {
        const cfg = this.ANIM.hurt;
        this.animElapsed += dt;
        if (this.animElapsed >= cfg.frames * cfg.ft) {
          this.hurtLocked = false;
          this.state = "idle";
          this.animElapsed = 0;
        }
        return;
      }
  
      // ATTACK: locked animation + hit window
      if (this.attackLocked) {
        const cfg = this.ANIM.attack;
        this.animElapsed += dt;
  
        const frame = Math.floor(this.animElapsed / cfg.ft);
  
        // Hit window (only one hit per attack)
        if (!this.attackDidHit && frame >= 3 && frame <= 5) {
          if (this.isPlayerInAttackRadius()) {
            this.player.takeDamage?.(1, this.x, this.y);
            this.attackDidHit = true;
          }
        }
  
        // End attack
        if (this.animElapsed >= cfg.frames * cfg.ft) {
          this.attackLocked = false;
          this.state = "idle";
          this.animElapsed = 0;
        }
        return;
      }
  
      // CHASE: move toward player, attack when in range
      const dx = this.player.x - this.x;
      const dy = this.player.y - this.y;
      const dist = Math.hypot(dx, dy);
  
      // Choose facing for sprite flip (left/right)
      this.facing = dx < 0 ? "left" : "right";
  
      const stopDist = this.stopDist;
      const attackRange = this.attackRange;
  
      // Start attack when in range and cooldown is finished
      if (dist <= attackRange && this.attackCooldown === 0) {
        this.startAttack();
        return;
      }
  
      // Otherwise, keep chasing until close enough
      if (dist > stopDist) {
        const nx = dx / dist;
        const ny = dy / dist;
  
        this.x += nx * this.SPEED;
        this.y += ny * this.SPEED;
  
        this.state = "walk";
      } else {
        this.state = "idle";
      }
  
      this.animElapsed += dt;
  
      // Optional per-type behavior hook (lets special enemies add logic without changing this file)
      if (this.def && typeof this.def.onUpdate === "function") {
        this.def.onUpdate(this, dt);
      }
    }
  
    // Draw enemy in camera space.
    // Also draws debug visuals when game.debug is enabled.
    draw(ctx) {
      const camX = this.camera.renderX;
      const camY = this.camera.renderY;
  
      const screenX = this.x - camX;
      const screenY = this.y - camY;
  
      const drawX = screenX - this.DRAW_SIZE / 2;
      const drawY = screenY - this.DRAW_SIZE / 2;
  
      const cfg = this.ANIM[this.state];
      const img = this.AM.getAsset(cfg.path);
      if (!img) return;
  
      const frameIndex = Math.floor(this.animElapsed / cfg.ft) % cfg.frames;
      const sx = frameIndex * cfg.fw;
  
      ctx.imageSmoothingEnabled = false;
  
      // Flip sprite horizontally when facing left
      if (this.facing === "left") {
        ctx.save();
        ctx.translate(drawX + this.DRAW_SIZE, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, 0, cfg.fw, cfg.fh, 0, 0, this.DRAW_SIZE, this.DRAW_SIZE);
        ctx.restore();
      } else {
        ctx.drawImage(img, sx, 0, cfg.fw, cfg.fh, drawX, drawY, this.DRAW_SIZE, this.DRAW_SIZE);
      }
  
      // Debug visuals (collision box, line to player, attack radius, hp/cooldown text)
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
  
        ctx.restore();
      }
    }
}
  


