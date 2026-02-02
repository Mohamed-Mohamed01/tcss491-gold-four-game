// game/enemy_creator.js
// Central place to define enemy types + spawn them.
// Add new types by copying an entry inside EnemyCreator.TYPES.

class EnemyCreator {
    static TYPES = {
      skeletonWhite: {
        stats: {
          drawSize: 70,
          speed: 1.5,
          hp: 3,
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
  
        // Optional hooks for custom behavior later:
        // onUpdate(enemy, dt) {},
        // onSpawn(enemy) {},
      },
  
      // Example placeholder for later:
      // rogue: {
      //   stats: { drawSize: 64, speed: 2.4, hp: 2, minFromPlayer: 240, attackCooldown: 0.6, attackHitRadius: 40, stopDist: 40, attackRange: 52 },
      //   anim:  { idle: {...}, walk: {...}, attack: {...}, hurt: {...}, die: {...} },
      //   onUpdate(enemy, dt) { /* extra dash logic later */ }
      // }
    };
  
    // Merge helper (shallow merge for stats + anim)
    static buildDef(type, overrides = {}) {
      const base = EnemyCreator.TYPES[type];
      if (!base) throw new Error(`Unknown enemy type: ${type}`);
  
      return {
        type,
        stats: { ...base.stats, ...(overrides.stats || {}) },
        anim:  { ...base.anim,  ...(overrides.anim || {}) },
        onUpdate: overrides.onUpdate || base.onUpdate || null,
        onSpawn:  overrides.onSpawn  || base.onSpawn  || null,
      };
    }
  
    // Create a new Enemy instance using a type definition.
    static create(game, assetManager, tileMap, camera, player, type, overrides = {}) {
      const def = EnemyCreator.buildDef(type, overrides);
      const enemy = new Enemy(game, assetManager, tileMap, camera, player, def);
      if (def.onSpawn) def.onSpawn(enemy);
      return enemy;
    }
  
    // Convenience spawn multiple enemies
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
  