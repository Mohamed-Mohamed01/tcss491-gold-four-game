// game/enemy_creator.js
// EnemyCreator is the “enemy database + factory”:
// - TYPES holds the stats + animations for each enemy type
// - create() builds an Enemy instance (enemy.js)
// - spawnMany() is used by main.js to spawn groups
// - optional hooks (onSpawn / onUpdate / onAttackFrame) let special enemies add behavior
//   without modifying Enemy (enemy.js)

class EnemyCreator {
  // Enemy type definitions:
  // - stats: gameplay tuning values read by Enemy (enemy.js)
  // - anim: sprite sheet configs read by Enemy.draw (enemy.js)
  // - optional hooks: used by Enemy.update (enemy.js)
  static TYPES = {
    skeletonWhite: {
      stats: {
        drawSize: 70,
        speed: 1.5,
        hp: 1,
        minFromPlayer: 240,
        attackCooldown: 0.9,
        attackHitRadius: 45,
        stopDist: 44,
        attackRange: 58,
      },
      anim: {
        idle:   { path: "assets/images/enemy_sprite/Skeleton_01_White_Idle.png",    frames: 8,  fw: 96, fh: 64, ft: 0.10 },
        walk:   { path: "assets/images/enemy_sprite/Skeleton_01_White_Walk.png",    frames: 10, fw: 96, fh: 64, ft: 0.08 },
        attack: { path: "assets/images/enemy_sprite/Skeleton_01_White_Attack1.png", frames: 10, fw: 96, fh: 64, ft: 0.07 },
        hurt:   { path: "assets/images/enemy_sprite/Skeleton_01_White_Hurt.png",    frames: 5,  fw: 96, fh: 64, ft: 0.10 },
        die:    { path: "assets/images/enemy_sprite/Skeleton_01_White_Die.png",     frames: 13, fw: 96, fh: 64, ft: 0.09 },
      },
    },

    zombie: {
      stats: {
        drawSize: 92,
        speed: 1.2,
        hp: 1,
        minFromPlayer: 240,
        attackCooldown: 1.1,
        attackHitRadius: 48,
        stopDist: 46,
        attackRange: 60,

        // Some sprite sheets face the opposite direction, so Enemy.draw flips logic
        invertFlip: true
      },
      anim: {
        idle:   { path: "assets/images/enemy2_sprite/Idle.png",   frames: 6, fw: 64, fh: 64, ft: 0.14 },
        walk:   { path: "assets/images/enemy2_sprite/Walk.png",   frames: 6, fw: 64, fh: 64, ft: 0.10 },
        attack: { path: "assets/images/enemy2_sprite/Attack.png", frames: 6, fw: 64, fh: 64, ft: 0.09 },
        hurt:   { path: "assets/images/enemy2_sprite/Hurt.png",   frames: 6, fw: 64, fh: 64, ft: 0.08 },
        die:    { path: "assets/images/enemy2_sprite/Dead.png",   frames: 6, fw: 64, fh: 64, ft: 0.12 }
      }
    },

    dragon: {
      stats: {
        drawSize: 60,
        speed: 1.6,
        hp: 1,
        minFromPlayer: 240,
        hurtRecovery: 0.25,

        // Ranged behavior tuning (Enemy.update uses these fields)
        attackCooldown: 1.4,
        attackHitRadius: -999, // disables melee hit window in Enemy.update
        attackRange: 320,
        stopDist: 300,
        holdInRange: true,
        invertFlip: true,

        // Projectile config read by onAttackFrame below
        projectileSpeed: 3,
        projectileDamage: 1,
        projectileLife: 2.4
      },

      anim: {
        idle:   { path: "assets/images/enemy3_sprite/IDLE.png",   frames: 4, fw: 81, fh: 71, ft: 0.16 },
        walk:   { path: "assets/images/enemy3_sprite/FLYING.png", frames: 4, fw: 81, fh: 71, ft: 0.12 },
        attack: { path: "assets/images/enemy3_sprite/ATTACK.png", frames: 8, fw: 81, fh: 71, ft: 0.09 },
        hurt:   { path: "assets/images/enemy3_sprite/HURT.png",   frames: 4, fw: 81, fh: 71, ft: 0.10 },
        die:    { path: "assets/images/enemy3_sprite/DEATH.png",  frames: 7, fw: 81, fh: 71, ft: 0.10 }
      },

      // Hook called from Enemy.update during attack animation (enemy.js)
      // Spawns EnemyProjectile (projectile.js)
      onAttackFrame: (enemy, frame) => {
        const FIRE_FRAME = 5;
        if (enemy.projectileFired) return;
        if (frame !== FIRE_FRAME) return;

        enemy.projectileFired = true;

        const dx = enemy.player.x - enemy.x;
        const dy = enemy.player.y - enemy.y;
        const len = Math.hypot(dx, dy) || 1;

        const vx = dx / len;
        const vy = dy / len;

        // Spawn slightly in front so it doesn't start inside the dragon sprite
        const spawnX = enemy.x + vx * 40;
        const spawnY = enemy.y + vy * 20;

        const S = enemy.def?.stats || {};
        console.log("SPAWNING PROJECTILE", { frame, x: enemy.x, y: enemy.y });

        enemy.game.addEntity(new EnemyProjectile(
          enemy.game, enemy.AM, enemy.map, enemy.camera, enemy.player,
          spawnX, spawnY,
          vx, vy,
          {
            speed: S.projectileSpeed ?? 6.4,
            damage: S.projectileDamage ?? 1,
            life: S.projectileLife ?? 2.4,
            radius: 14
          }
        ));
      }
    },

    // NEW: Enemy 4 (knight-like)
    enemy4: {
      stats: {
        drawSize: 100,          // adjust if too big/small
        speed: 1.35,
        hp: 3,                // tougher than hp:1 enemies
        minFromPlayer: 240,
        attackCooldown: 1.0,
        attackHitRadius: 50,
        stopDist: 46,
        attackRange: 62,
      },

      anim: {
        idle:   { path: "assets/images/enemy4_sprite/IDLE.png",   frames: 7,  fw: 96, fh: 84, ft: 0.12 },
        walk:   { path: "assets/images/enemy4_sprite/WALK.png",   frames: 8,  fw: 96, fh: 84, ft: 0.10 },
        attack: { path: "assets/images/enemy4_sprite/ATTACK.png", frames: 6,  fw: 96, fh: 84, ft: 0.09 },
        hurt:   { path: "assets/images/enemy4_sprite/HURT.png",   frames: 4,  fw: 96, fh: 84, ft: 0.10 },
        die:    { path: "assets/images/enemy4_sprite/DEATH.png",  frames: 12, fw: 96, fh: 84, ft: 0.10 },
      },
    },

    // NEW: Enemy 5 (archer)
    
    enemy5: {
      stats: {
        drawSize: 90,
        speed: 1.45,
        hp: 3,
        minFromPlayer: 240,
        hurtRecovery: 0.20,

        attackCooldown: 1.25,
        attackHitRadius: -999, // disables melee hit window in Enemy.update
        attackRange: 360,
        stopDist: 320,
        holdInRange: true,
        invertFlip: false,

        projectileSpeed: 5.2,
        projectileDamage: 1,
        projectileLife: 2.0
      },
    
      anim: {
        idle:   { path: "assets/images/enemy5_sprite/Idle.png",   frames: 7,  fw: 128, fh: 128, ft: 0.12 },
        walk:   { path: "assets/images/enemy5_sprite/Walk.png",   frames: 8,  fw: 128, fh: 128, ft: 0.10 },
        attack: { path: "assets/images/enemy5_sprite/Attack.png", frames: 15, fw: 128, fh: 128, ft: 0.07 },
        hurt:   { path: "assets/images/enemy5_sprite/Hurt.png",   frames: 2,  fw: 128, fh: 128, ft: 0.12 },
        die:    { path: "assets/images/enemy5_sprite/Dead.png",   frames: 5,  fw: 128, fh: 128, ft: 0.12 }
      },
    
      onAttackFrame: (enemy, frame) => {
        const FIRE_FRAME = 10; // good mid-shot moment for 15-frame attack
        if (enemy.projectileFired) return;
        if (frame !== FIRE_FRAME) return;
    
        enemy.projectileFired = true;
    
        const dx = enemy.player.x - enemy.x;
        const dy = enemy.player.y - enemy.y;
        const len = Math.hypot(dx, dy) || 1;
    
        const vx = dx / len;
        const vy = dy / len;
    
        // spawn slightly in front of archer
        const spawnX = enemy.x + vx * 42;
        const spawnY = enemy.y + vy * 18;
    
        const S = enemy.def?.stats || {};
    
        enemy.game.addEntity(new EnemyProjectile(
          enemy.game, enemy.AM, enemy.map, enemy.camera, enemy.player,
          spawnX, spawnY,
          vx, vy,
          {
            imgPath: "assets/images/enemy5_sprite/Arrow.png",
            speed: S.projectileSpeed ?? 6.5,
            damage: S.projectileDamage ?? 1,
            life: S.projectileLife ?? 2.0,
            radius: 10
          }
        ));
      }
    },

    enemy6: {
      stats: {
        drawSize: 96,
        speed: 1.55,
        hp: 4,
        minFromPlayer: 240,
        attackCooldown: 1.05,

        attackHitRadius: 56,
        stopDist: 52,
        attackRange: 74,
        invertFlip: false,

        hurtRecovery: 0.22
      },
    
      anim: {
        idle:   { path: "assets/images/enemy6_sprite/Idle.png",   frames: 7, fw: 128, fh: 128, ft: 0.12 },
        walk:   { path: "assets/images/enemy6_sprite/Walk.png",   frames: 7, fw: 128, fh: 128, ft: 0.10 },
        attack: { path: "assets/images/enemy6_sprite/Attack.png", frames: 4, fw: 128, fh: 128, ft: 0.10 },
        hurt:   { path: "assets/images/enemy6_sprite/Hurt.png",   frames: 3, fw: 128, fh: 128, ft: 0.12 },
        die:    { path: "assets/images/enemy6_sprite/Dead.png",   frames: 5, fw: 128, fh: 128, ft: 0.12 }
      }
    },
  };

  // Builds a single enemy definition:
  // - merges base TYPE values with optional overrides
  // - hooks can be overridden per spawn plan (used by main.js)
  static buildDef(type, overrides = {}) {
    const base = EnemyCreator.TYPES[type];
    if (!base) throw new Error(`Unknown enemy type: ${type}`);

    return {
      type,
      stats: { ...base.stats, ...(overrides.stats || {}) },
      anim:  { ...base.anim,  ...(overrides.anim || {}) },

      onUpdate: overrides.onUpdate || base.onUpdate || null,
      onSpawn:  overrides.onSpawn  || base.onSpawn  || null,
      onAttackFrame: overrides.onAttackFrame || base.onAttackFrame || null,
    };
  }

  // Creates an Enemy instance (enemy.js) from a type definition.
  static create(game, assetManager, tileMap, camera, player, type, overrides = {}) {
    const def = EnemyCreator.buildDef(type, overrides);
    const enemy = new Enemy(game, assetManager, tileMap, camera, player, def);

    // Optional per-type hook (note: Enemy constructor also calls onSpawn if present)
    if (def.onSpawn) def.onSpawn(enemy);

    return enemy;
  }

  // Convenience for spawning many enemies.
  // Used by main.js to spawn grouped enemies (guards, waves, etc.)
  static spawnMany(game, assetManager, tileMap, camera, player, plan = []) {
    // plan example: [{ type: "skeletonWhite", count: 5, overrides: {} }, ...]
    const out = [];

    for (const entry of plan) {
      const count = entry.count ?? 1;

      for (let i = 0; i < count; i++) {
        out.push(EnemyCreator.create(
          game, assetManager, tileMap, camera, player,
          entry.type,
          entry.overrides || {}
        ));
      }
    }

    return out;
  }
}
