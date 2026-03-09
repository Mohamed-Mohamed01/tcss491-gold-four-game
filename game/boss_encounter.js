// New Code
// game/boss_encounter.js
// Phase B: Round 1 encounter controller (waves + boss activation only).

class BossEncounter {
  constructor(game, assetManager, tileMap, camera, player, boss) {
    this.game = game;
    this.AM = assetManager;
    this.map = tileMap;
    this.camera = camera;
    this.player = player;
    this.boss = boss;

    this.tag = "boss_encounter";

    // Spawn points from Tiled
    this.spawn1 = this._pointFromObject(this.map.getObjectByName("enemy_spawn_1"));
    this.spawn2 = this._pointFromObject(this.map.getObjectByName("enemy_spawn_2"));
    this.spawn3 = this._pointFromObject(this.map.getObjectByName("enemy_spawn_3"));

    this.arenaCenter = this._pointFromObject(this.map.getObjectByName("arena_center"));
    this.bossSpawn = this._pointFromObject(this.map.getObjectByName("boss_spawn"));

    // Encounter state
    this.started = false;
    this.finished = false;
    this.currentRound = 1;
    this.waveIndex = 0;
    this.activeWaveEnemies = [];

    this._roundPauseTimer = 0;
  }

  // -------- Helpers --------
  _pointFromObject(o) {
    if (!o) return null;
    const x = o.point ? o.x : (o.x + (o.width || 0) / 2);
    const y = o.point ? o.y : (o.y + (o.height || 0) / 2);
    return { x, y };
  }

  _spawnNear(point, radiusPx = 32) {
    if (!point) return { x: this.player.x, y: this.player.y };
    for (let i = 0; i < 20; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * radiusPx;
      const x = point.x + Math.cos(ang) * r;
      const y = point.y + Math.sin(ang) * r;
      if (x < 0 || y < 0 || x >= this.map.WORLD_W || y >= this.map.WORLD_H) continue;
      if (this.map.isBlockedAtWorld(x, y)) continue;
      return { x, y };
    }
    return { x: point.x, y: point.y };
  }

  _spawnEnemies(type, count, spawnPoint, overrides = null) {
    const list = EnemyCreator.spawnMany(this.game, this.AM, this.map, this.camera, this.player, [
      { type, count, overrides: overrides || {} }
    ]);
    for (const e of list) {
      const s = this._spawnNear(spawnPoint, 40);
      e.x = s.x;
      e.y = s.y;
      e.asleep = false;
      this.game.addEntity(e);
    }

    // Keep tilemap draw at the back so newly added enemies render on top.
    const ents = this.game.entities || [];
    const tIdx = ents.findIndex((ent) => ent && ent.tag === "tilemap_draw");
    if (tIdx >= 0) {
      const [tileEnt] = ents.splice(tIdx, 1);
      ents.push(tileEnt);
    }

    return list;
  }

  _isWaveCleared() {
    return this.activeWaveEnemies.every((e) => !e || e.removeFromWorld || e.dead);
  }

  // -------- Phase B/Phase C: Round 1 + Round 2 --------
  startEncounter() {
    if (this.started || this.finished) return;
    this.started = true;
    this.game.inBossEncounter = true;
    this.startRound1();
  }

  // ROUND 1
  startRound1() {
    this.currentRound = 1;
    this.game.currentBossRound = 1;
    this.game.finalBossRoundActive = false;
    this.waveIndex = 0;
    this.activeWaveEnemies = [];
    this._setHint("Round 1");
    this.spawnWave(this.waveIndex);
  }

  // ROUND 2
  startRound2() {
    this.currentRound = 2;
    this.game.currentBossRound = 2;
    this.game.finalBossRoundActive = false;
    this.waveIndex = 0;
    this.activeWaveEnemies = [];
    this._setHint("Round 2");
    this.spawnWave(this.waveIndex);
  }

  _getRoundPlan(round) {
    if (round === 1) {
      return [
        [{ type: "skeletonWhite", count: 2, spawn: this.spawn1, overrides: { stats: { hp: 1 } } }],
        [{ type: "zombie", count: 2, spawn: this.spawn2, overrides: { stats: { hp: 1 } } }],
        [{ type: "dragon", count: 1, spawn: this.spawn3, overrides: { stats: { hp: 1 } } }],
        [
          { type: "enemy4", count: 1, spawn: this.spawn1, overrides: { stats: { hp: 2 } } },
          { type: "enemy5", count: 1, spawn: this.spawn2, overrides: { stats: { hp: 2 } } }
        ],
        [{ type: "enemy6", count: 1, spawn: this.spawn3, overrides: { stats: { hp: 3 } } }]
      ];
    }

    if (round === 2) {
      return [
        [{ type: "skeletonWhite", count: 1, spawn: this.spawn1, overrides: { stats: { hp: 1 } } }],
        [{ type: "zombie", count: 1, spawn: this.spawn2, overrides: { stats: { hp: 2 } } }],
        [{ type: "dragon", count: 1, spawn: this.spawn3, overrides: { stats: { hp: 2 } } }],
        [{ type: "enemy4", count: 1, spawn: this.spawn1, overrides: { stats: { hp: 3 } } }],
        [{ type: "enemy5", count: 1, spawn: this.spawn2, overrides: { stats: { hp: 3 } } }],
        [{ type: "enemy6", count: 1, spawn: this.spawn3, overrides: { stats: { hp: 4 } } }]
      ];
    }

    // ROUND 3
    return [
      [{ type: "enemy5", count: 1, spawn: this.spawn2, overrides: { stats: { hp: 3 } } }],
      [{ type: "enemy6", count: 1, spawn: this.spawn3, overrides: { stats: { hp: 4 } } }]
    ];
  }

  spawnWave(index) {
    this.activeWaveEnemies = [];

    const plan = this._getRoundPlan(this.currentRound);
    if (index < plan.length) {
      this._setHint(`Wave ${index + 1}`);
      for (const entry of plan[index]) {
        this.activeWaveEnemies.push(
          ...this._spawnEnemies(entry.type, entry.count, entry.spawn || this.arenaCenter, entry.overrides || null)
        );
      }
      return;
    }

    // After last wave -> boss step
    this.activateBossForRound(this.currentRound);
  }

  // Boss activation
  activateBossForRound(round) {
    if (!this.boss) return;
    if (round === 3) {
      this._setHint("Final Round");
    } else {
      this._setHint(round === 2 ? "The boss approaches again..." : "The boss approaches...");
    }
    this.boss.roundHitTarget = (round === 2) ? 5 : 3;
    this.boss.finalRound = (round === 3);
    this.boss.onRetreat = () => this.onBossRetreat();
    this.boss.onFinalDefeat = () => this.onBossFinalDefeat();
    this.boss.activate();
  }

  onBossRetreat() {
    if (this.currentRound === 1) {
      this.finishRound1();
      this._roundPauseTimer = 1.2;
      return;
    }
    if (this.currentRound === 2) {
      this.finishRound2();
      return;
    }
  }

  finishRound1() {
    this._setHint("Round 1 complete.");
  }

  finishRound2() {
    this._setHint("Round 2 complete.");
    this._roundPauseTimer = 1.2;
  }

  // ROUND 3
  startRound3() {
    this.currentRound = 3;
    this.game.currentBossRound = 3;
    this.game.finalBossRoundActive = true;
    this.waveIndex = 0;
    this.activeWaveEnemies = [];
    this._setHint("Final Round");
    this.spawnWave(this.waveIndex);
  }

  onBossFinalDefeat() {
    if (this.finished) return;
    this.finished = true;
    this.game.inBossEncounter = false;
    this.game.finalBossRoundActive = false;
    this._setHint("The arena falls silent. Victory is yours.");

    // Let death animation settle, then trigger win
    setTimeout(() => {
      if (typeof this.game.startEndingSequence === "function") {
        this.game.startEndingSequence();
      } else {
        this.game.triggerWin?.();
      }
    }, 800);
  }

  _setHint(text) {
    this.game.contextHint = text || "";
    this.game.contextHintSource = text ? "arena" : "";
  }

  update() {
    if (!this.started || this.finished) return;

    if (this._roundPauseTimer > 0) {
      this._roundPauseTimer -= this.game.clockTick || 1 / 60;
      if (this._roundPauseTimer <= 0) {
        if (this.currentRound === 1) this.startRound2();
        else if (this.currentRound === 2) this.startRound3();
      }
      return;
    }

    // If wave enemies exist, wait for them to clear
    if (this.activeWaveEnemies.length > 0) {
      if (this._isWaveCleared()) {
        this.activeWaveEnemies = [];
        this.waveIndex += 1;
        this.spawnWave(this.waveIndex);
      }
      return;
    }
  }

  draw() {
    // no-op
  }
}
