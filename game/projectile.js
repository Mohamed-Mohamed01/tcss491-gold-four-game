// game/projectile.js
// EnemyProjectile:
// - Spawned by dragon (EnemyCreator.onAttackFrame in enemy_creator.js)
// - Moves in a straight line toward initial direction
// - Collides with TileMap walls (tilemap.js)
// - Damages Player (player.js)
// - Uses a late-draw queue so it renders on top of map/entities
//   without changing entity order in main.js

class EnemyProjectile {

  // Static queue so all projectiles render AFTER normal entity drawing
  static LATE_DRAW = [];
  static _installed = false;

  constructor(game, assetManager, tileMap, camera, player, x, y, vx, vy, opts = {}) {
    // Shared systems
    this.game = game;
    this.AM = assetManager;
    this.map = tileMap;
    this.camera = camera;
    this.player = player;

    // World position
    this.x = x;
    this.y = y;

    // Direction is locked at spawn (normalized in EnemyCreator)
    this.vx = vx;
    this.vy = vy;

    // Projectile tuning (can be overridden per enemy type)
    this.speed = opts.speed ?? 6.0;
    this.damage = opts.damage ?? 1;
    this.life = opts.life ?? 2.2;
    this.radius = opts.radius ?? 14;

    this.imgPath = "assets/images/enemy3_sprite/projectile.png";
    this.tag = "enemy_projectile";
    this.removeFromWorld = false;

    // Install late-draw hook ONCE (patches GameEngine.draw)
    // Ensures projectiles draw after map + entities.
    if (!EnemyProjectile._installed) {
      EnemyProjectile._installed = true;

      const originalDraw = this.game.draw.bind(this.game);
      this.game.draw = () => {
        // Normal engine draw (map + entities)
        originalDraw();

        // Then draw all queued projectile renders
        const queue = EnemyProjectile.LATE_DRAW;
        EnemyProjectile.LATE_DRAW = [];
        for (const fn of queue) fn();
      };
    }
  }

  update() {
    const dt = this.game.clockTick || 1 / 60;

    // Straight-line movement
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;

    // Lifetime expiration
    this.life -= dt;
    if (this.life <= 0) {
      this.removeFromWorld = true;
      return;
    }

    // Wall collision (TileMap collision system)
    if (this.map.isBlockedAtWorld(this.x, this.y)) {
      this.removeFromWorld = true;
      return;
    }

    // Player collision (uses distance + small padding)
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.radius + 18) {
      this.player.takeDamage?.(this.damage, this.x, this.y);
      this.removeFromWorld = true;
    }
  }

  draw(ctx) {
    const camX = this.camera.renderX;
    const camY = this.camera.renderY;

    const sx = this.x - camX;
    const sy = this.y - camY;

    // Queue drawing so it happens after the engine finishes normal draw
    EnemyProjectile.LATE_DRAW.push(() => {
      const img = this.AM.getAsset(this.imgPath);
      if (!img) return;

      const SCALE = 1.1;
      const w = img.width * SCALE;
      const h = img.height * SCALE;

      const dx = sx - w / 2;
      const dy = sy - h / 2;

      ctx.imageSmoothingEnabled = false;

      // Sprite art faces left by default.
      // If moving right (vx > 0), flip horizontally.
      const flip = this.vx > 0;

      if (flip) {
        ctx.save();
        ctx.translate(dx + w, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(img, dx, dy, w, h);
      }

      // Optional debug visualization
      if (this.game.debug) {
        ctx.save();
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }
}
