// main.js
// Entry point for the game.
// Responsibilities:
// - create engine + asset manager
// - queue and load all assets
// - build the world (tilemap + camera)
// - spawn player, enemies, and keys
// - set up win/lose overlays + restart behavior
// Note: entity add order matters for your rendering, so keep the addEntity calls in the same order.

const gameEngine = new GameEngine({ debugging: false });
const ASSET_MANAGER = new AssetManager();

 
// Asset loading (queue everything first, then downloadAll starts the game)
 

// Tile assets
ASSET_MANAGER.queueDownload("assets/images/tiles/grass.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt5.png");

// Player assets (idle + run + attack)
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

// Enemy assets (current type: skeletonWhite)
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Idle.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Walk.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Attack1.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Hurt.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Die.png");

// Map objects + overlay visuals
ASSET_MANAGER.queueDownload("assets/images/tiles/tree.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone.png");

ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_grass/1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_grass/2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_grass/3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_grass/4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_grass/5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_grass/6.png");

ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_bush/bush.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_bush/2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_bush/3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_bush/4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_bush/5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/overlay_bush/6.png");

// Key sprite sheet
ASSET_MANAGER.queueDownload("assets/images/keys_sprites/gold_key.png");

 
// Game start (runs after all assets are loaded)

ASSET_MANAGER.downloadAll(() => {
  const canvas = document.getElementById("gameWorld");
  const ctx = canvas.getContext("2d");

  // Initialize engine
  canvas.focus();
  gameEngine.init(ctx);

  
  // Win / Lose state + UI overlay hooks
  

  // Game Over (called from Player.die())
  gameEngine.gameOver = false;
  gameEngine.triggerGameOver = function () {
    this.gameOver = true;

    const overlay = document.getElementById("gameOverOverlay");
    if (overlay) overlay.style.display = "flex";
  };

  // Win state (checked by a small "win checker" entity)
  gameEngine.win = false;
  gameEngine.requiredKeys = 3;

  gameEngine.triggerWin = function () {
    this.win = true;

    const winUI = document.getElementById("winOverlay");
    if (winUI) winUI.style.display = "flex";
  };

  // Restart control (only works after win/lose)
  window.addEventListener("keydown", (e) => {
    if (!gameEngine.gameOver && !gameEngine.win) return;
    if (e.key === "r" || e.key === "R") window.location.reload();
  });

  
  // Debug toggle (engine uses gameEngine.debug for extra visuals)
  
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

  // Welcome screen controls (start + how to play)
  const welcomeOverlay = document.getElementById("welcomeOverlay");
  const startBtn = document.getElementById("startBtn");
  const howToBtn = document.getElementById("howToBtn");
  const howToPanel = document.getElementById("howToPanel");

  let gameStarted = false;

  const startGame = () => {
    if (gameStarted) return;
    gameStarted = true;
    if (welcomeOverlay) welcomeOverlay.classList.add("hidden");
    gameEngine.start();
    canvas.focus();
  };

  if (startBtn) {
    startBtn.addEventListener("click", startGame);
  }

  if (howToBtn && howToPanel) {
    howToBtn.addEventListener("click", () => {
      const showing = howToPanel.classList.toggle("show");
      howToBtn.textContent = showing ? "Hide How to Play" : "How to Play";
    });
  }

  
  // World setup (tilemap + camera)
  
  const tileMap = new TileMap(gameEngine, ASSET_MANAGER);
  const camera = new Camera(
    canvas.width,
    canvas.height,
    tileMap.WORLD_W,
    tileMap.WORLD_H
  );

  
  // Player
  
  const player = new Player(gameEngine, ASSET_MANAGER, tileMap, camera);

  
  // Key pickups (3 total for win condition)
  // keysCollected is incremented inside KeyPickup when player touches the key
  
  gameEngine.keysCollected = 0;

  // Key 1 (upper-ish / mid)
  const key1 = new KeyPickup(
    gameEngine, ASSET_MANAGER, camera, player,
    tileMap.WORLD_W * 0.5,
    tileMap.WORLD_H * 0.15,
    { size: 18, radius: 20 }
  );

  // Key 2 (bottom-left)
  const key2 = new KeyPickup(
    gameEngine, ASSET_MANAGER, camera, player,
    tileMap.WORLD_W * 0.20,
    tileMap.WORLD_H * 0.80,
    { size: 18, radius: 20 }
  );

  // Key 3 (bottom-right)
  const key3 = new KeyPickup(
    gameEngine, ASSET_MANAGER, camera, player,
    tileMap.WORLD_W * 0.85,
    tileMap.WORLD_H * 0.70,
    { size: 18, radius: 20 }
  );

  
  // Enemies (spawn via EnemyCreator to make adding new enemy types easier)
  
  const enemies = EnemyCreator.spawnMany(
    gameEngine, ASSET_MANAGER, tileMap, camera, player,
    [
      { type: "skeletonWhite", count: 5 }
    ]
  );

  
  // Entity registration (IMPORTANT: order matters for your rendering)
  // Your intended order is: map -> enemies -> player (and keys somewhere visible)
  // You asked not to change the draw order, so these addEntity calls stay as-is.
  

  // Enemies
  for (const e of enemies) gameEngine.addEntity(e);

  // Player
  gameEngine.addEntity(player);

  // Keys
  gameEngine.addEntity(key1);
  gameEngine.addEntity(key2);
  gameEngine.addEntity(key3);

  // Win checker (logic only, draws nothing, doesn't change the look)
  // Checks: all keys collected AND no enemies remaining
  gameEngine.addEntity({
    update: () => {
      if (gameEngine.gameOver || gameEngine.win) return;

      const keysOk = (gameEngine.keysCollected || 0) >= gameEngine.requiredKeys;

      const enemiesLeft = (gameEngine.entities || []).filter(e =>
        e && e.tag === "enemy" && !e.removeFromWorld
      ).length;

      if (keysOk && enemiesLeft === 0) {
        gameEngine.triggerWin();
      }
    },
    draw: () => {},
    removeFromWorld: false
  });

  // Map draw entity (draws the TileMap relative to camera)
  // This is a draw-only entity so the map is always rendered.
  gameEngine.addEntity({
    update: () => {},
    draw: (ctx) => tileMap.draw(ctx, camera),
    removeFromWorld: false
  });

  // Start the game loop when the player clicks "Start"
});
