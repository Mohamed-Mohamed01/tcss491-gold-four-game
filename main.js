// main.js

const gameEngine = new GameEngine({ debugging: false });
const ASSET_MANAGER = new AssetManager();

// QUEUE ASSETS
ASSET_MANAGER.queueDownload("assets/images/tiles/grass.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/dirt5.png");

ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_right.png");

ASSET_MANAGER.queueDownload("assets/images/player_run/run_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_right.png");

// START
ASSET_MANAGER.downloadAll(() => {
  const canvas = document.getElementById("gameWorld");
  const ctx = canvas.getContext("2d");

  // make sure canvas receives key input
  canvas.focus();

  gameEngine.init(ctx);

  // build world + camera + player
  const tileMap = new TileMap(gameEngine, ASSET_MANAGER);

  const camera = new Camera(
    canvas.width,
    canvas.height,
    tileMap.WORLD_W,
    tileMap.WORLD_H
  );

  // Create player first
  const player = new Player(gameEngine, ASSET_MANAGER, tileMap, camera);

  // Add PLAYER
  gameEngine.addEntity(player);

  // Add MAP
  gameEngine.addEntity({
    update: () => {},
    draw: (ctx) => tileMap.draw(ctx, camera),
    removeFromWorld: false
  });


  

  gameEngine.start();
});
