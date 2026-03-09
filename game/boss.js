// New Code
// game/boss.js
// Phase A: BossEnemy foundation (idle/active, hit counter, simple retreat).

class BossEnemy {
  constructor(game, assetManager, tileMap, camera, player, x, y, options = {}) {
    this.game = game;
    this.AM = assetManager;
    this.map = tileMap;
    this.camera = camera;
    this.player = player;

    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;

    // Phase A tuning (slow and intimidating)
    this.DRAW_SIZE = options.drawSize ?? 150;
    this.SPEED = options.speed ?? 1.35;
    this.attackRange = options.attackRange ?? 70;
    this.stopDist = options.stopDist ?? 56;
    this.attackCooldownDefault = options.attackCooldown ?? 1.3;
    this.attackHitRadius = options.attackHitRadius ?? 72;

    // Phase A round-hit foundation
    this.roundHitTarget = options.roundHitTarget ?? 3;
    this.roundHitsTaken = 0;

    // Visibility + activity
    this.visible = options.visible ?? true;  // draw even when inactive
    this.active = false;                     // when true, can move/attack
    this.tag = "boss";                       // becomes "enemy" when active

    // Runtime state
    this.state = "idle";
    this.animElapsed = 0;
    this.attackCooldown = 0;
    this.attackDidHit = false;
    this.hurtLocked = false;
    this.hurtTimer = 0;
    this.retreating = false;
    this.facingLeft = false;
    this.dead = false;
    this.finalRound = false;
    this.invulnerable = false;
    this.invulnTimer = 0;

    // Phase A hooks
    this.onIntro = options.onIntro || null;
    this.onRetreat = options.onRetreat || null;
    this.onFinalDefeat = options.onFinalDefeat || null;

    // Anim config (frame counts provided)
    this.ANIM = {
      idle:   { path: "assets/images/boss_sprite/Idle.png",   frames: 9,  fw: 128, fh: 128, ft: 0.12 },
      walk:   { path: "assets/images/boss_sprite/Walk.png",   frames: 12, fw: 128, fh: 128, ft: 0.10 },
      attack: { path: "assets/images/boss_sprite/Attack.png", frames: 5,  fw: 128, fh: 128, ft: 0.12 },
      hurt:   { path: "assets/images/boss_sprite/Hurt.png",   frames: 3,  fw: 128, fh: 128, ft: 0.12 },
      dead:   { path: "assets/images/boss_sprite/Dead.png",   frames: 3,  fw: 128, fh: 128, ft: 0.18 }
    };
  }

  // Phase A: activate boss for testing
  activate() {
    this.active = true;
    this.tag = "enemy";
    this.state = "idle";
    this.animElapsed = 0;
    this.roundHitsTaken = 0;
    this.attackCooldown = 0;
    this.attackDidHit = false;
    this.retreating = false;
    this.dead = false;
  }

  // Phase A: deactivate boss (retreat/idle)
  deactivate() {
    this.active = false;
    this.tag = "boss";
    this.state = "idle";
    this.animElapsed = 0;
    this.retreating = false;
    this.dead = false;
  }

  // Phase A: prepare for later retreat logic
  startRetreat() {
    this.retreating = true;
    this.state = "walk";
    this.attackCooldown = 0;
  }

  // Small AABB so player can hit it (player.js checks ent.tag === "enemy")
  getCollisionAABBAt(x, y) {
    const w = 46;
    const h = 46;
    return { left: x - w / 2, top: y - h / 2, w, h };
  }

  // Phase A: hit-counter based damage
  takeDamage() {
    if (!this.active || this.retreating) return;
    if (this.hurtLocked) return;
    if (this.invulnerable) return;

    this.roundHitsTaken += 1;
    this.state = "hurt";
    this.animElapsed = 0;
    this.hurtLocked = true;
    this.hurtTimer = 0.25;
    this.invulnerable = true;
    this.invulnTimer = 0.7;

    if (this.roundHitsTaken >= this.roundHitTarget) {
      if (this.finalRound) {
        this.dieFinal();
      } else {
        this.startRetreat();
        if (this.onRetreat) this.onRetreat();
      }
    }
  }

  // Final death (Round 3)
  dieFinal() {
    this.dead = true;
    this.active = false;
    this.tag = "boss";
    this.state = "dead";
    this.animElapsed = 0;
  }

  update() {
    const dt = this.game.clockTick || 1 / 60;

    if (!this.visible) return;
    if (this.game.gameOver || this.game.win) return;

    if (this.dead) {
      const cfg = this.ANIM.dead;
      this.animElapsed += dt;
      if (this.animElapsed >= cfg.frames * cfg.ft) {
        this.removeFromWorld = true;
        if (this.onFinalDefeat) this.onFinalDefeat();
      }
      return;
    }

    if (this.invulnerable) {
      this.invulnTimer -= dt;
      if (this.invulnTimer <= 0) {
        this.invulnTimer = 0;
        this.invulnerable = false;
      }
    }

    // Idle animation when inactive (Phase A)
    if (!this.active) {
      this.state = "idle";
      this.animElapsed += dt;
      return;
    }

    if (this.hurtLocked) {
      this.hurtTimer -= dt;
      this.animElapsed += dt;
      if (this.hurtTimer <= 0) {
        this.hurtLocked = false;
      } else {
        return;
      }
    }

    // Retreat to boss spawn (Phase A placeholder)
    if (this.retreating) {
      const dx = this.spawnX - this.x;
      const dy = this.spawnY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dx < 0) this.facingLeft = true;
      else if (dx > 0) this.facingLeft = false;

      if (dist <= 6) {
        this.deactivate();
        return;
      }

      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      this.x += nx * this.SPEED;
      this.y += ny * this.SPEED;
      this.state = "walk";
      this.animElapsed += dt;
      return;
    }

    if (this.attackCooldown > 0) this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dx < 0) this.facingLeft = true;
    else if (dx > 0) this.facingLeft = false;

    if (dist <= this.attackRange && this.attackCooldown === 0) {
      this.state = "attack";
      this.animElapsed = 0;
      this.attackDidHit = false;
      this.attackCooldown = this.attackCooldownDefault;
    }

    if (this.state === "attack") {
      this.animElapsed += dt;
      if (!this.attackDidHit && this.animElapsed >= 0.35) {
        if (dist <= this.attackHitRadius) {
          this.player.takeDamage?.(1, this.x, this.y);
        }
        this.attackDidHit = true;
      }

      const cfg = this.ANIM.attack;
      if (this.animElapsed >= cfg.frames * cfg.ft) {
        this.state = "idle";
        this.animElapsed = 0;
      }
      return;
    }

    if (dist > this.stopDist) {
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      this.x += nx * this.SPEED;
      this.y += ny * this.SPEED;
      this.state = "walk";
    } else {
      this.state = "idle";
    }

    this.animElapsed += dt;
  }

  draw(ctx) {
    if (!this.visible) return;

    let animKey = "idle";
    if (this.state === "walk") animKey = "walk";
    if (this.state === "attack") animKey = "attack";
    if (this.state === "hurt") animKey = "hurt";
    if (this.state === "dead") animKey = "dead";

    const cfg = this.ANIM[animKey];
    const img = cfg ? this.AM.getAsset(cfg.path) : null;
    if (!cfg || !img) return;

    let frameIndex = Math.floor(this.animElapsed / cfg.ft);
    const nonLooping = (animKey === "attack" || animKey === "hurt" || animKey === "dead");
    if (nonLooping) frameIndex = Math.min(frameIndex, cfg.frames - 1);
    else frameIndex = frameIndex % cfg.frames;

    const sx = frameIndex * cfg.fw;
    const sy = 0;

    const screenX = this.x - this.camera.renderX;
    const screenY = this.y - this.camera.renderY;
    const drawX = screenX - this.DRAW_SIZE / 2;
    const drawY = screenY - this.DRAW_SIZE / 2;

    ctx.imageSmoothingEnabled = false;

    if (this.facingLeft) {
      ctx.save();
      ctx.globalAlpha = this.invulnerable ? 0.65 : 1;
      ctx.translate(drawX + this.DRAW_SIZE, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        sx, sy, cfg.fw, cfg.fh,
        0, 0, this.DRAW_SIZE, this.DRAW_SIZE
      );
      ctx.restore();
    } else {
      if (this.invulnerable) ctx.globalAlpha = 0.65;
      ctx.drawImage(
        img,
        sx, sy, cfg.fw, cfg.fh,
        drawX, drawY, this.DRAW_SIZE, this.DRAW_SIZE
      );
      if (this.invulnerable) ctx.globalAlpha = 1;
    }
  }
}
