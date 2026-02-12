// main.js
// Game entry point:
// - queues assets (AssetManager)
// - initializes engine + canvas
// - wires DOM overlays + menu flow (index.html + styles.css)
// - loads Tiled map (TileMap.loadFromTiledTMJ)
// - spawns player/enemies/keys/scroll + HUD

const gameEngine = new GameEngine({ debugging: false });
const ASSET_MANAGER = new AssetManager();


// Asset loading (paths used by TileMap, Player, EnemyCreator/Enemy, HUD, pickups)

// Tiles / map
ASSET_MANAGER.queueDownload("assets/images/tiles/grass.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Dirt6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/walls.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/FieldsTileset.png");

// Ground clutter
ASSET_MANAGER.queueDownload("assets/images/tiles/grass1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass6.png");

// Trees
ASSET_MANAGER.queueDownload("assets/images/tiles/tree.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Tree_2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/trunk.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Autumn_tree2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Fruit_tree1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Fruit_tree2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Fruit_tree3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree7.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Moss_tree1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Moss_tree2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Moss_tree3.png");

// Stones
ASSET_MANAGER.queueDownload("assets/images/tiles/stone.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone8.png");

// Bushes
ASSET_MANAGER.queueDownload("assets/images/tiles/bush.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush6.png");

// Fences
ASSET_MANAGER.queueDownload("assets/images/tiles/fence1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence6.png");

// Camps
ASSET_MANAGER.queueDownload("assets/images/tiles/camp1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/PlaceForTower1.png");

// Boxes
ASSET_MANAGER.queueDownload("assets/images/tiles/Box1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Box2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Box3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Box4.png");

// Lamps
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp6.png");

// Logs
ASSET_MANAGER.queueDownload("assets/images/tiles/Log1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Log2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Log3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Log4.png");

// Pointers
ASSET_MANAGER.queueDownload("assets/images/tiles/pointer1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/pointer2.png");

// Shadows
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow6.png");

// Stone variants
ASSET_MANAGER.queueDownload("assets/images/tiles/stone1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone7.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone9.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone10.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone11.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone12.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone13.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone14.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone16.png");

// Flowers
ASSET_MANAGER.queueDownload("assets/images/tiles/flower1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower7.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower8.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower9.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower10.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower11.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower12.png");

// UI + pickups
ASSET_MANAGER.queueDownload("assets/images/ui_overlay/heart.png");
ASSET_MANAGER.queueDownload("assets/images/scrolls/scrolls.png");
ASSET_MANAGER.queueDownload("assets/images/keys_sprites/gold_key.png");

// Player
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_right.png");

ASSET_MANAGER.queueDownload("assets/images/player_run/run_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_right.png");

ASSET_MANAGER.queueDownload("assets/images/player_attack/attack1_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack/attack1_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack/attack1_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack/attack1_right.png");

// Player Attack 2 (AoE)
ASSET_MANAGER.queueDownload("assets/images/player_attack2/attack2_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack2/attack2_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack2/attack2_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack2/attack2_right.png");

// Enemy type 1 (skeleton)
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Idle.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Walk.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Attack1.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Hurt.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Die.png");

// Enemy type 2 (zombie)
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Idle.png");
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Walk.png");
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Attack.png");
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Hurt.png");
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Dead.png");

// Enemy type 3 (dragon + projectile)
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/IDLE.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/FLYING.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/HURT.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/ATTACK.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/DEATH.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/projectile.png");


// Boot (after assets load): DOM wiring + engine state + world/entities spawn

ASSET_MANAGER.downloadAll(async () => {
  const canvas = document.getElementById("gameWorld");
  const ctx = canvas.getContext("2d");

  canvas.focus();
  gameEngine.init(ctx);


  // Shared overlays (index.html)
   

  // Under Construction overlay used by:
  // - WELCOME menu buttons (LEVELS / HOW TO / CREDITS)
  // - WIN screen NEXT button
  function showUnderConstruction() {
    const welcome = document.getElementById("welcomeOverlay");
    const winUI = document.getElementById("winOverlay");
    const uc = document.getElementById("underConstructionOverlay");

    if (welcome) welcome.style.display = "none";
    if (winUI) winUI.style.display = "none";
    if (uc) uc.style.display = "flex";

    canvas.focus();
  }

  const restartBtn = document.getElementById("restartBtn");
  const nextBtn = document.getElementById("nextBtn");

  const underConstructionOverlay = document.getElementById("underConstructionOverlay");
  const ucBackBtn = document.getElementById("ucBackBtn");
  const ucRestartBtn = document.getElementById("ucRestartBtn");

  if (restartBtn) restartBtn.addEventListener("click", () => window.location.reload());
  if (ucRestartBtn) ucRestartBtn.addEventListener("click", () => window.location.reload());

  if (nextBtn) nextBtn.addEventListener("click", () => showUnderConstruction());

  if (ucBackBtn) {
    ucBackBtn.addEventListener("click", () => {
      if (underConstructionOverlay) underConstructionOverlay.style.display = "none";

      const welcome = document.getElementById("welcomeOverlay");
      if (welcome) welcome.style.display = "flex";

      canvas.focus();
    });
  }


  // Win / Lose flags + overlay hooks (GameEngine state)

  gameEngine.gameOver = false;
  gameEngine.win = false;

  gameEngine.requiredKeys = 3;
  gameEngine.keysCollected = 0;

  // Called from gameplay when player dies (Player / Enemy combat logic)
  gameEngine.triggerGameOver = function () {
    this.gameOver = true;

    const overlay = document.getElementById("gameOverOverlay");
    if (overlay) overlay.style.display = "flex";
  };

  // Called when win conditions are met (see Win Checker entity below)
  gameEngine.triggerWin = function () {
    this.win = true;

    const uc = document.getElementById("underConstructionOverlay");
    if (uc) uc.style.display = "none";

    const winUI = document.getElementById("winOverlay");
    if (winUI) winUI.style.display = "flex";
  };

  window.addEventListener("keydown", (e) => {
    if (!gameEngine.gameOver && !gameEngine.win) return;
    if (e.key === "r" || e.key === "R") window.location.reload();
  });


   
  // Debug + Fullscreen controls

  gameEngine.debug = false;

  const debugBtn = document.getElementById("debugToggle");
  if (debugBtn) {
    debugBtn.textContent = "Debug: OFF";
    debugBtn.addEventListener("click", () => {
      gameEngine.debug = !gameEngine.debug;
      debugBtn.textContent = gameEngine.debug ? "Debug: ON" : "Debug: OFF";
      canvas.focus();
    });
  }

  function toggleFullscreen() {
    const container = document.getElementById("gameContainer");

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.warn("Fullscreen failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "f" || e.key === "F") toggleFullscreen();
  });

  document.getElementById("fullscreenBtn")?.addEventListener("click", toggleFullscreen);


  
  // Welcome screen flow (index.html + styles.css)
  // NOTE: welcomeOverlay / playBtn / levelsBtn / howToBtn / creditsBtn are
  // referenced by id (browser global); defined in index.html.

  let gameStarted = false;

  const startGame = () => {
    if (gameStarted) return;
    gameStarted = true;

    if (welcomeOverlay) {
      welcomeOverlay.classList.add("leaving");

      setTimeout(() => {
        welcomeOverlay.classList.add("hidden");
        welcomeOverlay.classList.remove("leaving");

        gameEngine.start();
        canvas.focus();
      }, 650);
    } else {
      gameEngine.start();
      canvas.focus();
    }
  };

  if (playBtn) playBtn.addEventListener("click", startGame);
  if (levelsBtn) levelsBtn.addEventListener("click", () => showUnderConstruction());
  if (howToBtn) howToBtn.addEventListener("click", () => showUnderConstruction());
  if (creditsBtn) creditsBtn.addEventListener("click", () => showUnderConstruction());


  
  // World setup (TileMap + Camera)
  // TileMap: game/tilemap.js (loads TMJ + collision + spawn points)
  // Camera:  game/camera.js (world->screen transform)


  const tileMap = new TileMap(gameEngine, ASSET_MANAGER);
  await tileMap.loadFromTiledTMJ("./assets/Level1_Map.tmj");

  const camera = new Camera(canvas.width, canvas.height, tileMap.WORLD_W, tileMap.WORLD_H);



  // Entities (keep add order exactly the same)

  // Player: game/player.js (movement/combat; also updates camera follow inside Player)
  const player = new Player(gameEngine, ASSET_MANAGER, tileMap, camera);

  // Objectives: game/objectives.js (HUD reads strings/state from this manager)
  gameEngine.objectives = new ObjectiveManager(gameEngine, player);


  // --- Story Scroll (spawn point comes from TileMap.scrollSpawns) ---
  // ScrollStoryPickup: game/scroll.js (opens #storyOverlay in index.html)
  const scrollPoint = (tileMap.scrollSpawns || []).find((s) => s.name === "story_scroll");

  const scrollX = scrollPoint ? scrollPoint.x : (player.x + 90);
  const scrollY = scrollPoint ? scrollPoint.y : (player.y + 10);

  const storyScroll = new ScrollStoryPickup(
    gameEngine, ASSET_MANAGER, camera, player,
    scrollX, scrollY,
    {
      size: 90,
      radius: 80,
      storyLines: [
        "You wake in a cursed valley.",
        "Find the three keys and defeat the guardians."
      ]
    }
  );


  // --- Keys (spawn points come from TileMap.keySpawns) ---
  // KeyPickup: game/key.js (increments gameEngine.keysCollected)
  const getKeyPoint = (name, fallbackX, fallbackY) => {
    const p = (tileMap.keySpawns || []).find((s) => s.name === name);
    return p ? { x: p.x, y: p.y } : { x: fallbackX, y: fallbackY };
  };

  // Used to place enemies around key points while avoiding blocked tiles (TileMap.isBlockedAtWorld)
  const findSpawnNear = (center, radiusPx, tries = 60) => {
    for (let i = 0; i < tries; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * radiusPx;

      const x = center.x + Math.cos(ang) * r;
      const y = center.y + Math.sin(ang) * r;

      if (x < 0 || y < 0 || x >= tileMap.WORLD_W || y >= tileMap.WORLD_H) continue;
      if (tileMap.isBlockedAtWorld(x, y)) continue;

      return { x, y };
    }
    return { x: center.x, y: center.y };
  };

  const p1 = getKeyPoint("key1", tileMap.WORLD_W * 0.5,  tileMap.WORLD_H * 0.15);
  const p2 = getKeyPoint("key2", tileMap.WORLD_W * 0.20, tileMap.WORLD_H * 0.80);
  const p3 = getKeyPoint("key3", tileMap.WORLD_W * 0.85, tileMap.WORLD_H * 0.70);


  // --- Enemy guards for each key ---
  // EnemyCreator: game/enemy_creator.js (factory that builds configured Enemy instances)
  // Enemy:       game/enemy.js (AI/combat + tag="enemy")
  const guardsKey1 = EnemyCreator.spawnMany(
    gameEngine, ASSET_MANAGER, tileMap, camera, player,
    [{ type: "skeletonWhite", count: 3 }]
  );

  const guardsKey2 = EnemyCreator.spawnMany(
    gameEngine, ASSET_MANAGER, tileMap, camera, player,
    [{ type: "zombie", count: 3 }]
  );

  const guardsKey3 = EnemyCreator.spawnMany(
    gameEngine, ASSET_MANAGER, tileMap, camera, player,
    [{ type: "dragon", count: 2 }]
  );

  for (const e of guardsKey1) {
    e.asleep = true;
    const s = findSpawnNear(p1, 140);
    e.x = s.x; e.y = s.y;
  }

  for (const e of guardsKey2) {
    e.asleep = true;
    const s = findSpawnNear(p2, 140);
    e.x = s.x; e.y = s.y;
  }

  for (const e of guardsKey3) {
    e.asleep = true;
    const s = findSpawnNear(p3, 140);
    e.x = s.x; e.y = s.y;
  }


  // --- Key pickups (wake nearby guard enemies when player approaches) ---
  const key1 = new KeyPickup(gameEngine, ASSET_MANAGER, camera, player, p1.x, p1.y, {
    size: 18,
    radius: 20,
    guardEnemies: guardsKey1,
    wakeRadius: 220
  });

  const key2 = new KeyPickup(gameEngine, ASSET_MANAGER, camera, player, p2.x, p2.y, {
    size: 18,
    radius: 20,
    guardEnemies: guardsKey2,
    wakeRadius: 220
  });

  const key3 = new KeyPickup(gameEngine, ASSET_MANAGER, camera, player, p3.x, p3.y, {
    size: 18,
    radius: 20,
    guardEnemies: guardsKey3,
    wakeRadius: 220
  });


  // Entity add order (DO NOT change — affects draw stacking)


  const enemies = [...guardsKey1, ...guardsKey2, ...guardsKey3];
  for (const e of enemies) gameEngine.addEntity(e);

  gameEngine.addEntity(player);
  gameEngine.addEntity(storyScroll);

  gameEngine.addEntity(key1);
  gameEngine.addEntity(key2);
  gameEngine.addEntity(key3);


  // Win Checker (runs every tick; triggers gameEngine.triggerWin())
  gameEngine.addEntity({
    update: () => {
      if (gameEngine.gameOver || gameEngine.win) return;

      const keysOk = (gameEngine.keysCollected || 0) >= gameEngine.requiredKeys;

      const enemiesLeft = (gameEngine.entities || []).filter((ent) =>
        ent && ent.tag === "enemy" && !ent.removeFromWorld
      ).length;

      if (keysOk && enemiesLeft === 0) gameEngine.triggerWin();
    },
    draw: () => {},
    removeFromWorld: false
  });


  // HUD: game/hud.js (updates DOM elements like #hudHpFill, #hudKeysText, etc.)
  const hud = new HUD(gameEngine, player);
  gameEngine.addEntity(hud);


  // Tile map draw hook (TileMap.draw in game/tilemap.js)
  gameEngine.addEntity({
    update: () => {},
    draw: (ctx) => tileMap.draw(ctx, camera),
    removeFromWorld: false
  });
});
